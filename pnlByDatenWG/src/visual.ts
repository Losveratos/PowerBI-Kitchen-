/*
 *  P&L Statement byDatenWG — IBCS-inspired GuV visual for Power BI
 *  © 2026 Michael Tenner · PowerBI Kitchen — MIT License (see LICENSE in the repo root):
 *  free to use and modify, keep this author notice.
 *
 *  v0.3: full concept-demo parity — in-visual toolbar (view, column presets,
 *  Δ reference, unit, density, expand level, % of revenue, zero-row hiding),
 *  two period blocks (YTD + FY outlook FC vs PL with hatched Δ bars),
 *  monthly sparklines, comment markers with footnote section, account ids,
 *  waterfall view, uniform Δ scale, documented teal deviation.
 *  Notation based on the IBCS® Standards 1.2 (CC BY-SA 4.0, ibcs.com).
 */
"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import DataView = powerbi.DataView;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import DataViewValueColumn = powerbi.DataViewValueColumn;

import { VisualFormattingSettingsModel } from "./settings";
import {
    buildModel, flattenVisible, collapseToLevel, variance, displayValue,
    parseRowType, parseBool, parseSign, rowsFromLevels, aggregateMonthly,
    isZeroRow, revenueBase, formulaOperands, nodeResolver, Variance,
    FormulaOp, InputRow, LevelInputRow, PnlModel, PnlNode, Scenario,
} from "./engine";

const FONT = "'Segoe UI', wf_segoe-ui_normal, helvetica, arial, sans-serif";
const NBSP_GROUP = " "; // narrow space, IBCS number grouping

const C = {
    ac: "#404040", py: "#B3B3B3",
    text: "#1A1A1A", soft: "#8A8886", line: "#404040", gridSoft: "#EDEBE9",
    tealGood: "#0E8585", tealBad: "#E02B1D",
    ibcsGood: "#8CB400", ibcsBad: "#FF2600",
    comment: "#0064FF", loading: "#B35C00",
    // driver tree
    cardEdge: "#D8D6D1", elbow: "#B4B4B4", refGray: "#9A9A9A",
};

/**
 * powerbi.VisualDataChangeOperationKind.Append — mirrored as a plain number
 * because the API declares the enum as a `const enum` in an ambient d.ts
 * (Create = 0, Append = 1, Segment = 2; no runtime object exists).
 */
const OP_APPEND = 1;

/** Windowed table rendering kicks in above this many visible rows. */
const VIRT_MIN_ROWS = 300;
/** Rows rendered above/below the scroll viewport. */
const VIRT_BUFFER = 30;
/** Height estimate for an opened sparkline row (svg 34 + padding). */
const SPARK_ROW_H = 40;
/** Extra height a separator row takes through its top padding. */
const SEP_EXTRA_H = 9;

/** Driver-tree geometry at font scale 1 (px). */
const TREE_CARD_W = 152;
const TREE_CARD_H = 104;
/**
 * Compact card (title · AC value · Δ%, no mini chart) — deep levels and very
 * tall layouts switch to it automatically so a wide tree stays readable.
 */
const TREE_CARD_H_COMPACT = 44;
const TREE_GAP_X = 64;
/** Air between two sibling *leaf* cards. */
const TREE_GAP_Y = 10;
/**
 * Air between two sibling *subtrees* (at least one of the two branches) —
 * strictly larger than the leaf gap, so an opened branch reads as one grouped
 * limb instead of merging into the cards above it.
 */
const TREE_GAP_SUB = 18;
/** Tree level (root = 0) from which cards are drawn compact. */
const TREE_COMPACT_LEVEL = 4;
/** Layout taller than this multiple of the stage switches every card to compact. */
const TREE_COMPACT_STAGE = 3;
/**
 * Where the parent bus sits inside the column gap: a short stub carries the
 * operator, the remaining gap holds the elbows into the children.
 */
const TREE_BUS_FRAC = 0.62;
/** Fixed distance between the tree hint line and the first card row. */
const TREE_HEAD_GAP = 10;
/**
 * Safety budget for the expanded graph — there is no depth limit any more
 * (readers open and close subtrees themselves), but a pathological model with
 * many diamond references or a deep account hierarchy must stay bounded.
 */
const TREE_MAX_CARDS = 400;
/** Scenario-triangle size (px at font scale 1) — IBCS UN 4.1. */
const TREE_TRI = 5.5;

type ViewMode = "table" | "bars" | "waterfall" | "tree";
type Preset = "full" | "acref" | "acpydpy" | "acpldpl" | "dpct";
type Unit = "auto" | "none" | "k" | "m";
type Density = "normal" | "compact";
/** Mini chart drawn inside a driver-tree card. */
type TreeCardMode = "months" | "delta" | "bridge";

interface UiState {
    view: ViewMode;
    preset: Preset;
    ref: Scenario;        // ytd Δ reference (py | pl | fc)
    unit: Unit;
    density: Density;
    pctRev: boolean;
    hideZero: boolean;
    collapsed: string[];
    spark: string[];      // row ids with open sparkline
    blocks: { mtd: boolean; ytd: boolean; fy: boolean };
    /** driver-tree root (row id) chosen by the reader; empty = author/auto default */
    treeRoot: string;
    /** collapsed driver-tree subtrees (row ids); null = author default (whole tree) */
    treeCollapsed: string[] | null;
    /** mini chart inside the driver-tree cards */
    treeCard: TreeCardMode;
    /** colour indicator (left edge + Δ% label) on the driver-tree cards */
    treeStatus: boolean;
    /**
     * schema version of the tree fields. States persisted before v0.9.1 carry
     * fold lists built for the old "one level at a time" semantics — loading
     * them keeps the tree stuck. Anything below TREE_STATE_V drops treeRoot
     * and treeCollapsed back to the fresh whole-tree default on load.
     */
    treeV: number;
}

/** current schema version of the persisted tree state (see UiState.treeV) */
const TREE_STATE_V = 2;

/** One node of the laid-out driver tree (x/y = top-left of the card). */
interface TreeCard {
    node: PnlNode;
    /** operator binding this card to the sibling above it (null on the root) */
    op: FormulaOp | null;
    depth: number;
    children: TreeCard[];
    x: number;
    y: number;
    /** card height of this node — full card or compact card */
    h: number;
    /** drawn without the mini chart (deep level or a very tall layout) */
    compact: boolean;
    /** the row branches — formula operands or hierarchy children (⇒ chevron) */
    hasKids: boolean;
    /** branches that were NOT built because the card budget ran out */
    moreKids: number;
    /** operands exist but are folded away */
    collapsed: boolean;
    /** the branch below this card is the account hierarchy, not the formula */
    drill: boolean;
}

/** Everything the toolbar and the tree renderer need about the current graph. */
interface TreeCtx {
    resolve: (id: string) => PnlNode | undefined;
    home: PnlNode | null;
    picked: PnlNode | null;
    root: PnlNode;
    rootCard: TreeCard;
    cards: TreeCard[];
    /** levels of the fully expanded graph (root = 1) */
    depth: number;
    /** ids to collapse for "expand to level n" (index n) */
    levels: string[][];
    /** collapse set that applies while the reader has not touched anything */
    auto: string[];
    /** child row ids per row id over the full built graph (subtree expand) */
    kidsOf: Map<string, string[]>;
    /** breadcrumb from the home root down to the picked root */
    path: PnlNode[];
}

/**
 * One column of a card's mini chart: the AC/FC column in front plus, behind and
 * offset to the right, the reference column, plus the scenario triangle of a
 * second reference (IBCS UN 4.1).
 */
interface TreeSlot {
    v: number | null;
    ref: number | null;
    /** second scenario, drawn as a triangle pointing at the column */
    ref2: number | null;
    /** front column: actuals, or the forecast that fills the months after them */
    style: "ac" | "fc";
    /** period/scenario label under the axis (only first and last carry one) */
    tag: string | null;
    label: boolean;
}

/** A card's mini chart series plus the scenarios its reference marks encode. */
interface TreeSeries {
    slots: TreeSlot[];
    /** scenario of the offset reference column ("" = none) */
    refScen: Scenario | "";
    /** scenario of the triangle marks ("" = none) */
    ref2Scen: Scenario | "";
}

interface ColSpec {
    kind: "val" | "pct" | "bar" | "pin" | "gap" | "vbar" | "wbar";
    scen?: Scenario;      // for val
    ref?: Scenario;       // for bar/pin
    minuend?: Scenario;   // for bar/pin ("ac" | "fcfy")
    block?: "mtd" | "ytd" | "fy";
    label: string;
}

interface Block { key: "mtd" | "ytd" | "fy"; label: string; specs: ColSpec[]; }

/** Windowed table rendering state (only rows near the scroll viewport are in the DOM). */
interface VirtualState {
    table: HTMLElement;
    top: HTMLElement;
    bottom: HTMLElement;
    rows: HTMLElement[];
    visible: PnlNode[];
    /** offsets[i] = pixel start of row i inside the table body; length n+1 */
    offsets: number[];
    make: (node: PnlNode) => HTMLElement[];
    bodyTop: number;
    from: number;
    to: number;
}

/** Cached O(rows) scans that only depend on the model + the Δ combinations shown. */
interface ScanCache { key: string; maxAbsVal: number; maxAbsDelta: number; }

/** Cached O(rows) scans that additionally depend on the column set and the number format. */
interface GeoCache {
    key: string;
    dLabelLen: number;
    pLabelLen: number;
    vLabelLen: number;
    maxPosD: number;
    maxNegD: number;
    wf: Map<string, Map<string, { s: number; e: number }>>;
}

interface Fmt {
    div: number;
    suffix: string;
    val: (v: number | null, plus?: boolean) => string;
    pct: (v: number | null, plus?: boolean) => string;
}

export class Visual implements IVisual {
    private host: IVisualHost;
    private events: IVisualEventService;
    private formattingSettingsService: FormattingSettingsService;
    private settings: VisualFormattingSettingsModel;

    private root: HTMLElement;
    private model: PnlModel | null = null;
    private has: Record<Scenario, boolean> = { ac: false, py: false, pl: false, fc: false, fcfy: false, plfy: false };
    private comments: { n: number; node: PnlNode; text: string }[] = [];
    private locale = "en-US";

    private ui: UiState | null = null;
    private wfSegs = new Map<string, Map<string, { s: number; e: number }>>();
    private stateLoaded = false;
    private pendingPersist: string | null = null;
    private lastApplied: string | null = null;

    // --- segmented loading (fetchMoreData) ---
    /** rows delivered by the host so far (accumulated data view) */
    private loadedRows = 0;
    /** a further segment was requested and is still on its way */
    private awaitingSegment = false;
    /** the host stopped delivering although more data exists (100 MB / row cap) */
    private hostCapped = false;
    /** status lines that belong to the load state, not to the (cached) model */
    private statusWarnings: string[] = [];

    // --- memoization ---
    private lastFingerprint: string | null = null;
    private modelVer = 0;
    private scanCache: ScanCache | null = null;
    private geoCache: GeoCache | null = null;

    // --- windowed rendering ---
    private vs: VirtualState | null = null;
    private scrollRaf = 0;
    private commentNo = new Map<string, number>();

    // --- driver tree ---
    /** graph context of the current render (toolbar and tree share it) */
    private treeCtx: TreeCtx | null = null;
    /** stage height of the last host update — drives the compact-card fallback */
    private vpH = 0;
    /** instance suffix for svg pattern ids (several visuals per page) */
    private static instances = 0;
    private uid = "t" + (++Visual.instances).toString(36);

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.events = options.host.eventService;
        this.formattingSettingsService = new FormattingSettingsService();
        this.locale = options.host.locale || "en-US";
        this.root = document.createElement("div");
        this.root.className = "pnl-root";
        this.root.style.cssText =
            `width:100%;height:100%;overflow:auto;background:#FFF;font-family:${FONT};` +
            `color:${C.text};box-sizing:border-box;`;
        this.root.addEventListener("scroll", () => this.onScroll());
        options.element.appendChild(this.root);
    }

    public update(options: VisualUpdateOptions): void {
        this.events.renderingStarted(options);
        try {
            if (options.viewport && options.viewport.height > 0) { this.vpH = options.viewport.height; }
            const dataView = options.dataViews && options.dataViews[0];
            this.settings = this.formattingSettingsService.populateFormattingSettingsModel(
                VisualFormattingSettingsModel, dataView);
            if (!dataView) {
                this.model = null; this.vs = null; this.lastFingerprint = null;
                this.resetSegments();
                this.renderLanding(); this.events.renderingFinished(options); return;
            }
            this.trackSegments(dataView, options.operationKind);

            // parse + build only when the data actually changed — toolbar clicks
            // and resizes reuse the model (rerender() never enters this path)
            const fp = this.fingerprint(dataView);
            if (this.model == null || fp !== this.lastFingerprint) {
                const parsed = this.parseRows(dataView);
                if (!parsed) {
                    this.model = null; this.vs = null; this.lastFingerprint = null;
                    this.renderLanding(); this.events.renderingFinished(options); return;
                }
                if (parsed.rows.length === 0) {
                    this.model = null; this.vs = null; this.lastFingerprint = null;
                    this.renderEmpty(); this.events.renderingFinished(options); return;
                }
                this.model = buildModel(parsed.rows, this.str("Not assigned", "Nicht zugeordnet"), parsed.months);
                this.has = parsed.has;
                this.loadedRows = parsed.rowCount;
                this.lastFingerprint = fp;
                this.modelVer++;
                this.scanCache = null;
                this.geoCache = null;
            }
            this.buildStatusWarnings();
            this.syncUiState(dataView);
            this.render();
            this.events.renderingFinished(options);
        } catch (e) {
            this.events.renderingFailed(options, e instanceof Error ? e.message : String(e));
        }
    }

    // ---------------- segmented loading ----------------

    private resetSegments(): void {
        this.loadedRows = 0;
        this.awaitingSegment = false;
        this.hostCapped = false;
        this.statusWarnings = [];
    }

    /**
     * `window` data reduction + fetchMoreData(true): every Append update carries
     * the accumulated data view, so each segment is parsed as the full current
     * state and rendered immediately; the next segment is requested right after.
     * While segments are outstanding the status line and the subtotal rows say so —
     * a governance visual must never show a silently incomplete total.
     */
    private trackSegments(dataView: DataView, opKind: number | undefined): void {
        if (opKind !== OP_APPEND) {
            // Create (or a host that does not report the kind) starts a new load
            this.resetSegments();
        }
        const moreExpected = dataView.metadata != null && dataView.metadata.segment != null;
        if (!moreExpected) { this.awaitingSegment = false; this.hostCapped = false; return; }
        const accepted = typeof this.host.fetchMoreData === "function"
            ? this.host.fetchMoreData(true) : false;
        this.awaitingSegment = accepted;
        // request refused → the host caps the total (100 MB / row limit)
        this.hostCapped = !accepted;
    }

    private buildStatusWarnings(): void {
        this.statusWarnings = [];
        if (this.hostCapped) {
            this.statusWarnings.push(this.str(
                "row limit reached — the host stopped delivering segments, totals are incomplete",
                "Zeilenlimit erreicht — der Host liefert keine weiteren Segmente, Summen unvollständig"));
        }
        if (this.awaitingSegment) {
            this.statusWarnings.push(this.loadingText());
        }
    }

    private loadingText(): string {
        const n = new Intl.NumberFormat(this.locale).format(this.loadedRows)
            .replace(/[ ,. ]/g, NBSP_GROUP);
        return "⏳ " + this.str(
            `${n} rows loaded … subtotals still incomplete`,
            `${n} Zeilen geladen … Zwischensummen noch unvollständig`);
    }

    /**
     * Cheap content fingerprint of the data view: column identity + row count +
     * first/last category value + measure checksums. Equal fingerprint ⇒ reuse
     * the parsed model (resize, format-pane edits, repeated updates).
     */
    private fingerprint(dataView: DataView): string {
        const cat = dataView.categorical;
        if (!cat) { return "none"; }
        const parts: string[] = [];
        for (const c of cat.categories ?? []) {
            const v = c.values;
            parts.push((c.source.queryName ?? c.source.displayName ?? "") + "#" + v.length
                + "#" + String(v[0] ?? "") + "#" + String(v[v.length - 1] ?? ""));
        }
        for (const m of cat.values ?? []) {
            const v = m.values;
            let sum = 0; let cnt = 0;
            for (let i = 0; i < v.length; i++) {
                const x = v[i];
                if (typeof x === "number") { sum += x; cnt++; }
            }
            parts.push((m.source.queryName ?? m.source.displayName ?? "") + "#" + v.length
                + "#" + sum.toString() + "#" + cnt);
        }
        return parts.join("|");
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.settings);
    }

    // ---------------- data ----------------

    private parseRows(dataView: DataView): {
        rows: InputRow[]; months: string[]; rowCount: number; has: Record<Scenario, boolean>;
    } | null {
        const cat = dataView.categorical;
        if (!cat || !cat.categories || cat.categories.length === 0) { return null; }
        const byRole = (r: string): DataViewCategoryColumn | undefined =>
            cat.categories.find(c => c.source.roles && c.source.roles[r]);
        const measure = (r: string): DataViewValueColumn | undefined =>
            (cat.values || []).find(v => v.source.roles && v.source.roles[r]) as DataViewValueColumn | undefined;

        const idCol = byRole("account");
        const levelCols = cat.categories.filter(c => c.source.roles && c.source.roles["levels"]);
        const acCol = measure("ac");
        if (!acCol || (!idCol && levelCols.length === 0)) { return null; }

        const nameCol = byRole("accountName"); const parentCol = byRole("parent");
        const sortCol = byRole("sortOrder"); const typeCol = byRole("rowType");
        const formulaCol = byRole("formulaDef"); const signCol = byRole("signConvention");
        const dispCol = byRole("displayInvert"); const varCol = byRole("varianceInvert");
        const periodCol = byRole("period"); const commentCol = byRole("comment");
        const pyCol = measure("py"); const plCol = measure("pl"); const fcCol = measure("fc");
        const fcFyCol = measure("fcFy"); const plFyCol = measure("plFy");

        const num = (col: DataViewValueColumn | undefined, i: number): number | null => {
            if (!col) { return null; }
            const v = col.values[i];
            if (v == null) { return null; }
            const n = typeof v === "number" ? v : Number(v);
            return isFinite(n) ? n : null;
        };
        const txt = (col: DataViewCategoryColumn | undefined, i: number): string | null => {
            if (!col) { return null; }
            const v = col.values[i];
            return v == null ? null : String(v);
        };
        const key = (col: DataViewCategoryColumn | undefined, i: number): string | null => {
            const s = txt(col, i);
            if (s == null) { return null; }
            const t = s.trim();
            return t === "" ? null : t;
        };

        const n = (idCol ?? levelCols[0]).values.length;
        const has: Record<Scenario, boolean> = {
            ac: !!acCol, py: !!pyCol, pl: !!plCol, fc: !!fcCol, fcfy: !!fcFyCol, plfy: !!plFyCol,
        };
        const values = (i: number): Partial<Record<Scenario, number | null>> => ({
            ac: num(acCol, i), py: num(pyCol, i), pl: num(plCol, i), fc: num(fcCol, i),
            fcfy: num(fcFyCol, i), plfy: num(plFyCol, i),
        });
        const attrs = (i: number): Pick<LevelInputRow, "rowType" | "formulaDef" | "sign" | "displayInvert" | "varianceInvert" | "comment"> => ({
            rowType: parseRowType(txt(typeCol, i)),
            formulaDef: txt(formulaCol, i),
            sign: signCol ? parseSign(txt(signCol, i)) : 1,
            displayInvert: dispCol ? parseBool(txt(dispCol, i)) : false,
            varianceInvert: varCol ? parseBool(txt(varCol, i)) : false,
            comment: key(commentCol, i),
        });

        if (levelCols.length > 0 && !parentCol) {
            const lrows: LevelInputRow[] = [];
            for (let i = 0; i < n; i++) {
                const sortRaw = Number(txt(sortCol, i) ?? NaN);
                lrows.push({
                    levels: levelCols.map(c => txt(c, i)),
                    account: idCol ? key(idCol, i) : null,
                    name: nameCol ? txt(nameCol, i) : null,
                    sort: isFinite(sortRaw) ? sortRaw : null,
                    ...attrs(i),
                    values: values(i),
                    month: periodCol ? key(periodCol, i) : null,
                    index: i,
                });
            }
            const lr = rowsFromLevels(lrows);
            return { rows: lr.rows, months: lr.months, rowCount: n, has };
        }
        if (!idCol) { return null; }

        const raw: (InputRow & { month: string | null })[] = [];
        for (let i = 0; i < n; i++) {
            const id = key(idCol, i);
            if (id == null) { continue; }
            const sortRaw = Number(txt(sortCol, i) ?? i);
            raw.push({
                id, parent: key(parentCol, i),
                name: txt(nameCol, i) ?? id,
                sort: isFinite(sortRaw) ? sortRaw : Number.MAX_SAFE_INTEGER,
                ...attrs(i),
                values: values(i),
                month: periodCol ? key(periodCol, i) : null,
                index: i,
            });
        }
        const agg = aggregateMonthly(raw);
        return { rows: agg.rows, months: agg.months, rowCount: n, has };
    }

    // ---------------- ui state ----------------

    private defaultUi(): UiState {
        const s = this.settings;
        const lvl = s.hierarchyCard.defaultLevel.value;
        return {
            view: "table",
            preset: String(s.columnsCard.preset.value.value) as Preset,
            ref: this.resolveRef(String(s.columnsCard.reference.value.value)),
            unit: String(s.numbersCard.scaling.value.value) as Unit,
            density: String(s.styleCard.density.value.value) as Density,
            pctRev: s.columnsCard.pctRevenue.value,
            hideZero: s.columnsCard.hideZeroRows.value,
            collapsed: this.model && lvl > 0 ? [...collapseToLevel(this.model.roots, lvl)] : [],
            spark: [],
            blocks: { mtd: false, ytd: true, fy: this.has.fcfy && this.has.plfy },
            treeRoot: "",
            treeCollapsed: null,
            treeCard: String(s.columnsCard.treeCard.value.value) as TreeCardMode,
            treeStatus: s.columnsCard.treeStatus.value,
            treeV: TREE_STATE_V,
        };
    }

    private resolveRef(pref: string): Scenario {
        if (pref === "py" || pref === "pl" || pref === "fc") { return pref; }
        if (this.has.pl) { return "pl"; }
        if (this.has.py) { return "py"; }
        return "fc";
    }

    private syncUiState(dataView: DataView | undefined): void {
        const persisted = dataView?.metadata?.objects?.["state"]?.["uiState"];
        const str = persisted == null ? null : String(persisted);
        if (this.pendingPersist != null) {
            if (str === this.pendingPersist) { this.lastApplied = str; }
            this.pendingPersist = null;
        }
        if (str != null && str !== this.lastApplied) {
            try {
                const parsed = JSON.parse(str) as Partial<UiState>;
                if ((parsed.treeV ?? 0) < TREE_STATE_V) {
                    // pre-v0.9.1 tree state: fold lists and re-roots from the
                    // old semantics would keep the tree stuck — start fresh
                    delete parsed.treeRoot;
                    delete parsed.treeCollapsed;
                }
                this.ui = { ...this.defaultUi(), ...parsed };
                this.lastApplied = str;
                this.stateLoaded = true;
            } catch { /* keep current */ }
        }
        if (!this.stateLoaded || this.ui == null) {
            this.stateLoaded = true;
            this.ui = this.defaultUi();
        }
    }

    private persistUi(): void {
        if (!this.ui) { return; }
        if (this.model) {
            this.ui.collapsed = this.ui.collapsed.filter(id => this.model!.byId.has(id));
            this.ui.spark = this.ui.spark.filter(id => this.model!.byId.has(id));
            if (this.ui.treeCollapsed) {
                this.ui.treeCollapsed = this.ui.treeCollapsed.filter(id => this.model!.byId.has(id));
            }
        }
        const json = JSON.stringify(this.ui);
        this.pendingPersist = json;
        this.lastApplied = json;
        this.host.persistProperties({
            merge: [{ objectName: "state", selector: null, properties: { uiState: json } }],
        });
    }

    // ---------------- formatting ----------------

    private str(en: string, de: string): string {
        return this.locale.toLowerCase().startsWith("de") ? de : en;
    }

    private makeFmt(maxAbs: number): Fmt {
        const u = this.ui!.unit;
        let div = 1; let suffix = "";
        if (u === "k") { div = 1e3; suffix = "k"; }
        else if (u === "m") { div = 1e6; suffix = "m"; }
        else if (u === "auto") {
            if (maxAbs >= 5e7) { div = 1e6; suffix = "m"; }
            else if (maxAbs >= 5e4) { div = 1e3; suffix = "k"; }
        }
        const dec = this.settings.numbersCard.decimals.value;
        const pdec = this.settings.numbersCard.pctDecimals.value;
        const nf = new Intl.NumberFormat(this.locale, { minimumFractionDigits: dec, maximumFractionDigits: dec });
        const pf = new Intl.NumberFormat(this.locale, { minimumFractionDigits: pdec, maximumFractionDigits: pdec });
        const grp = (nfr: Intl.NumberFormat, v: number): string =>
            nfr.formatToParts(v).map(p => (p.type === "group" ? NBSP_GROUP : p.value)).join("");
        return {
            div, suffix,
            val: (v, plus = false) => v == null ? "·" : (plus && v > 0 ? "+" : "") + grp(nf, v / div),
            pct: (v, plus = false) => v == null ? "–" : (plus && v > 0 ? "+" : "") + grp(pf, v * 100) + "%",
        };
    }

    private goodColor(): string {
        const o = this.settings.styleCard.goodColor.value?.value;
        if (o) { return o; }
        return String(this.settings.styleCard.colorMode.value.value) === "ibcs" ? C.ibcsGood : C.tealGood;
    }
    private badColor(): string {
        const o = this.settings.styleCard.badColor.value?.value;
        if (o) { return o; }
        return String(this.settings.styleCard.colorMode.value.value) === "ibcs" ? C.ibcsBad : C.tealBad;
    }
    private fontScale(): number {
        const fp = String(this.settings.styleCard.fontPreset.value.value);
        return fp === "fullhd" ? 1.25 : fp === "uhd" ? 1.6 : 1;
    }
    /** block-aware displayed value: MTD reads the last month of the series */
    private blockDisplay(node: PnlNode, block: "mtd" | "ytd" | "fy", scen: Scenario): number | null {
        if (block !== "mtd") { return displayValue(node, scen); }
        const li = this.model!.months.length - 1;
        const v = li >= 0 ? (node.series[scen]?.[li] ?? null) : null;
        return v == null ? null : (node.row.displayInvert ? -v : v);
    }

    private monthLabel(m: string): string {
        const parts = /^(\d{4})-(\d{2})/.exec(m);
        if (!parts) { return m; }
        const d = new Date(Number(parts[1]), Number(parts[2]) - 1, 1);
        return d.toLocaleDateString(this.locale, { month: "short" });
    }

    // ---------------- render entry ----------------

    private renderLanding(): void {
        this.vs = null;
        const box = document.createElement("div");
        box.style.cssText = "padding:22px 26px;max-width:600px;";
        const h = document.createElement("div");
        h.style.cssText = "font-size:15px;font-weight:600;margin-bottom:8px;";
        h.textContent = "P&L Statement byDatenWG";
        const p = document.createElement("div");
        p.style.cssText = `font-size:12px;color:${C.soft};line-height:1.55;`;
        p.textContent = this.str(
            "Add the AC measure plus level columns (L1..Ln, star schema) or Account ID + Parent ID. " +
            "Optional: PY / PL / FC, FY outlook measures (FC/PL full year), period (month) for sparklines, " +
            "row type, formula, sign, comment.",
            "AC-Measure zuweisen plus Ebenen-Spalten (L1..Ln, Sternschema) oder Konto-ID + Parent-ID. " +
            "Optional: PY / PL / FC, FY-Outlook-Measures (FC/PL Gesamtjahr), Periode (Monat) für Sparklines, " +
            "Zeilentyp, Formel, Vorzeichen, Kommentar.");
        box.appendChild(h); box.appendChild(p);
        this.root.replaceChildren(box);
    }

    private renderEmpty(): void {
        this.vs = null;
        const box = document.createElement("div");
        box.style.cssText = `padding:18px 22px;font-size:12px;color:${C.soft};`;
        box.textContent = this.str("No data for the current selection.", "Keine Daten für die aktuelle Auswahl.");
        this.root.replaceChildren(box);
    }

    private rerender(): void { this.render(); }

    /** cache key for the scans that depend on model + shown Δ combinations only */
    private scanKey(): string {
        const ui = this.ui!;
        return [this.modelVer, ui.view, ui.preset, ui.ref,
            ui.blocks.mtd, ui.blocks.ytd, ui.blocks.fy].join("~");
    }

    /**
     * Uniform scale basis over ALL rows (stable across expand/collapse).
     * Memoized per model + Δ-combination — toolbar clicks that do not change
     * either reuse the previous scan instead of walking byId again.
     */
    private scans(): ScanCache {
        const key = this.scanKey();
        if (this.scanCache && this.scanCache.key === key) { return this.scanCache; }
        const model = this.model!;
        let maxAbsVal = 0; let maxAbsDelta = 0;
        const deltaCombos = this.deltaCombos();
        for (const node of model.byId.values()) {
            if (node.row.rowType === "kpi") { continue; }
            for (const s of ["ac", "py", "pl", "fc", "fcfy", "plfy"] as Scenario[]) {
                const v = node.computed[s];
                if (v != null) { maxAbsVal = Math.max(maxAbsVal, Math.abs(v)); }
            }
            for (const dc of deltaCombos) {
                const d = this.blockVariance(node, dc.block, dc.ref, dc.minuend).delta;
                if (d != null) { maxAbsDelta = Math.max(maxAbsDelta, Math.abs(d)); }
            }
        }
        this.scanCache = { key, maxAbsVal, maxAbsDelta };
        return this.scanCache;
    }

    private render(): void {
        const model = this.model; const ui = this.ui;
        if (!model || !ui) { return; }
        const keepScroll = this.root.scrollTop;
        this.root.replaceChildren();
        this.comments = [];
        this.vs = null;

        const scan = this.scans();
        const fmt = this.makeFmt(scan.maxAbsVal);
        // the driver-tree graph drives the tree AND its toolbar groups (depth
        // buttons, breadcrumb) — build it before the toolbar
        this.treeCtx = ui.view === "tree" ? this.buildTreeCtx() : null;

        if (this.settings.titleCard.show.value) { this.root.appendChild(this.buildTitle(fmt)); }
        if (this.settings.toolbarCard.show.value) { this.root.appendChild(this.buildToolbar()); }
        if (this.awaitingSegment) { this.root.appendChild(this.buildLoadingBar()); }
        if (this.settings.toolbarCard.showLegend.value) { this.root.appendChild(this.buildLegend()); }

        this.root.appendChild(ui.view === "tree"
            ? this.buildTree(fmt)
            : this.buildTable(fmt, scan.maxAbsDelta));
        this.buildFootnotes(fmt);
        this.root.appendChild(this.buildFooter());
        this.root.scrollTop = keepScroll;
        this.measureWindow();
    }

    /** visible status line while further data segments are still on their way */
    private buildLoadingBar(): HTMLElement {
        const bar = document.createElement("div");
        bar.style.cssText = `margin:2px 14px 0 14px;padding:4px 8px;font-size:10px;` +
            `color:${C.loading};border:1px solid ${C.loading};border-radius:2px;` +
            `display:inline-block;`;
        bar.textContent = this.loadingText();
        const box = document.createElement("div");
        box.style.cssText = "padding:0;";
        box.appendChild(bar);
        return box;
    }

    // ---------------- windowed rendering ----------------

    private onScroll(): void {
        if (!this.vs || this.scrollRaf !== 0) { return; }
        const raf = typeof requestAnimationFrame === "function"
            ? requestAnimationFrame : (cb: FrameRequestCallback): number => setTimeout(() => cb(0), 16) as unknown as number;
        this.scrollRaf = raf(() => { this.scrollRaf = 0; this.syncWindow(); });
    }

    private spacerRow(): HTMLElement {
        const r = document.createElement("div");
        r.style.cssText = "display:table-row;height:0px;";
        const c = document.createElement("div");
        c.style.cssText = "display:table-cell;padding:0;height:0px;";
        r.appendChild(c);
        return r;
    }

    private setSpacer(r: HTMLElement, h: number): void {
        const px = Math.max(0, Math.round(h)) + "px";
        r.style.height = px;
        (r.firstElementChild as HTMLElement).style.height = px;
    }

    /** first index whose row end is beyond `y` (binary search on the offsets) */
    private indexAt(offsets: number[], y: number): number {
        let lo = 0; let hi = offsets.length - 1;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (offsets[mid + 1] <= y) { lo = mid + 1; } else { hi = mid; }
        }
        return lo;
    }

    private renderWindow(from: number, to: number): void {
        const vs = this.vs;
        if (!vs) { return; }
        for (const el of vs.rows) { el.remove(); }
        vs.rows = [];
        const frag = document.createDocumentFragment();
        for (let i = from; i < to; i++) {
            for (const el of vs.make(vs.visible[i])) { frag.appendChild(el); vs.rows.push(el); }
        }
        vs.table.insertBefore(frag, vs.bottom);
        this.setSpacer(vs.top, vs.offsets[from]);
        this.setSpacer(vs.bottom, vs.offsets[vs.visible.length] - vs.offsets[to]);
        vs.from = from; vs.to = to;
    }

    /** anchor the body inside the scroll container, then align the window */
    private measureWindow(): void {
        const vs = this.vs;
        if (!vs) { return; }
        const rootBox = this.root.getBoundingClientRect();
        const topBox = vs.top.getBoundingClientRect();
        vs.bodyTop = topBox.top - rootBox.top + this.root.scrollTop;
        this.syncWindow();
    }

    private syncWindow(): void {
        const vs = this.vs;
        if (!vs) { return; }
        const viewH = this.root.clientHeight || 800;
        const start = this.root.scrollTop - vs.bodyTop;
        const from = Math.max(0, this.indexAt(vs.offsets, start) - VIRT_BUFFER);
        const to = Math.min(vs.visible.length,
            this.indexAt(vs.offsets, start + viewH) + VIRT_BUFFER + 1);
        if (from === vs.from && to === vs.to) { return; }
        this.renderWindow(from, to);
    }

    /** variance for a period block: MTD reads the last month of the series */
    private blockVariance(node: PnlNode, block: "mtd" | "ytd" | "fy", ref: Scenario, minuend: Scenario): Variance {
        if (block !== "mtd") { return variance(node, ref, minuend); }
        const li = this.model!.months.length - 1;
        if (li < 0) { return { delta: null, deltaPct: null, good: true }; }
        const a = node.series[minuend]?.[li] ?? null;
        const r = node.series[ref]?.[li] ?? null;
        if (a == null || r == null) { return { delta: null, deltaPct: null, good: true }; }
        const delta = a - r;
        let good = delta >= 0;
        if (node.row.varianceInvert) { good = !good; }
        return { delta, deltaPct: r !== 0 ? delta / Math.abs(r) : null, good };
    }

    /** which Δ combinations the current view shows (drives the uniform scale) */
    private deltaCombos(): { ref: Scenario; minuend: Scenario; block: "mtd" | "ytd" | "fy" }[] {
        const ui = this.ui!;
        const out: { ref: Scenario; minuend: Scenario; block: "mtd" | "ytd" | "fy" }[] = [];
        if (ui.view === "tree") { return out; } // the tree shows no Δ bars
        if (ui.view === "bars" || ui.view === "waterfall") {
            const fyOn = this.has.fcfy && this.has.plfy && ui.blocks.fy;
            if (ui.view === "waterfall" && ui.blocks.mtd && this.model!.months.length > 1 && this.has[ui.ref]) {
                out.push({ ref: ui.ref, minuend: "ac", block: "mtd" });
            }
            if (ui.blocks.ytd !== false && this.has[ui.ref]) { out.push({ ref: ui.ref, minuend: "ac", block: "ytd" }); }
            if (fyOn) { out.push({ ref: "plfy", minuend: "fcfy", block: "fy" }); }
            return out;
        }
        if (ui.blocks.mtd && this.model!.months.length > 1 && this.has[ui.ref]) {
            out.push({ ref: ui.ref, minuend: "ac", block: "mtd" });
        }
        if (ui.preset === "full") {
            if (this.has.py) { out.push({ ref: "py", minuend: "ac", block: "ytd" }); }
            if (this.has.pl) { out.push({ ref: "pl", minuend: "ac", block: "ytd" }); }
            if (this.has.fcfy && this.has.plfy && ui.blocks.fy) { out.push({ ref: "plfy", minuend: "fcfy", block: "fy" }); }
        } else if (ui.preset === "acpydpy") { if (this.has.py) { out.push({ ref: "py", minuend: "ac", block: "ytd" }); } }
        else if (ui.preset === "acpldpl") { if (this.has.pl) { out.push({ ref: "pl", minuend: "ac", block: "ytd" }); } }
        else if (ui.preset === "dpct") {
            if (this.has.py) { out.push({ ref: "py", minuend: "ac", block: "ytd" }); }
            if (this.has.pl) { out.push({ ref: "pl", minuend: "ac", block: "ytd" }); }
        } else { out.push({ ref: this.ui!.ref, minuend: "ac", block: "ytd" }); }
        return out.filter(dc => this.has[dc.ref]);
    }

    // ---------------- title / toolbar / legend ----------------

    private buildTitle(fmt: Fmt): HTMLElement {
        const t = this.settings.titleCard;
        const wrap = document.createElement("div");
        wrap.style.cssText = "padding:12px 14px 4px 14px;";
        const msg = t.message.value.trim();
        if (msg) {
            const m = document.createElement("div");
            m.style.cssText = "font-size:13.5px;font-weight:700;line-height:1.45;margin-bottom:8px;max-width:900px;";
            m.textContent = msg;
            wrap.appendChild(m);
        }
        const months = this.model!.months;
        const autoPeriod = months.length > 0
            ? `${months[0].slice(0, 4)} ${this.monthLabel(months[0])}..${this.monthLabel(months[months.length - 1])} (_${this.monthLabel(months[months.length - 1])})`
            : "";
        const scen = ["AC", this.has.py ? "PY" : "", this.has.pl ? "PL" : ""].filter(Boolean).join(", ");
        const lines = [
            t.unitLine.value.trim(),
            t.measureLine.value.trim() || (this.str("Income statement (P&L)", "GuV (P&L)") + (fmt.suffix ? ` in ${fmt.suffix}${this.settings.numbersCard.unitText.value}` : "")),
            t.periodLine.value.trim() || [autoPeriod, scen && `${scen} · Δ ${this.ui!.ref.toUpperCase()}`].filter(Boolean).join(": "),
        ].filter(s => s !== "");
        lines.forEach((line, i) => {
            const el = document.createElement("div");
            el.style.cssText = i === 1
                ? "font-size:12px;line-height:1.5;font-weight:600;"
                : `font-size:12px;line-height:1.5;color:${i === 0 ? C.text : C.text};`;
            el.textContent = line;
            wrap.appendChild(el);
        });
        return wrap;
    }

    private tbBtn(label: string, active: boolean, onClick: () => void, title?: string): HTMLElement {
        const b = document.createElement("button");
        b.textContent = label;
        if (title) { b.title = title; }
        b.style.cssText =
            `font-family:${FONT};font-size:10.5px;padding:3px 10px;cursor:pointer;border-radius:2px;` +
            (active
                ? `background:${C.ac};border:1px solid ${C.ac};color:#FFF;font-weight:600;`
                : `background:#FFF;border:1px solid ${C.gridSoft};color:${C.text};`);
        b.onclick = (e) => { e.stopPropagation(); onClick(); this.persistUi(); this.rerender(); };
        return b;
    }

    private tbGroup(label: string, buttons: HTMLElement[]): HTMLElement {
        const g = document.createElement("div");
        g.style.cssText = "display:flex;flex-direction:column;gap:3px;";
        const l = document.createElement("div");
        l.style.cssText = `font-size:8.5px;letter-spacing:.08em;color:${C.soft};text-transform:uppercase;`;
        l.textContent = label;
        const row = document.createElement("div");
        row.style.cssText = "display:flex;gap:4px;flex-wrap:wrap;";
        buttons.forEach(b => row.appendChild(b));
        g.appendChild(l); g.appendChild(row);
        return g;
    }

    private buildToolbar(): HTMLElement {
        const ui = this.ui!;
        const bar = document.createElement("div");
        bar.style.cssText = "display:flex;gap:18px;flex-wrap:wrap;padding:8px 14px 6px 14px;align-items:flex-end;";

        const tset = this.settings.toolbarCard;
        if (tset.showView.value) { bar.appendChild(this.tbGroup(this.str("View", "Ansicht"), [
            this.tbBtn("Table", ui.view === "table", () => { ui.view = "table"; }),
            this.tbBtn("Bars", ui.view === "bars", () => { ui.view = "bars"; },
                this.str("Structure bars: AC vs reference per row", "Struktur-Balken: AC vs. Referenz je Zeile")),
            this.tbBtn("Waterfall", ui.view === "waterfall", () => { ui.view = "waterfall"; },
                this.str("Row waterfall: contributions cascade, subtotals anchor", "Zeilen-Waterfall: Beiträge kaskadieren, Summen ankern")),
            this.tbBtn("Tree", ui.view === "tree", () => { ui.view = "tree"; },
                this.str("Value driver tree: the formula graph as a DuPont tree",
                    "Werttreiberbaum: der Formel-Graph als DuPont-Baum")),
        ])); }

        // column presets, periods and options describe the table layout — the
        // driver tree follows the formula graph instead. The Δ reference and the
        // expand level do apply to it: they drive the card variances and the
        // depth of the opened graph.
        const tableViews = ui.view !== "tree";
        const isTree = ui.view === "tree";

        const presets: [Preset, string][] = [
            ["full", "AC·PY·PL·FC"], ["acref", "AC vs Ref"], ["acpydpy", "AC·PY·ΔPY"],
            ["acpldpl", "AC·PL·ΔPL"], ["dpct", "ΔPY% · ΔPL%"],
        ];
        if (tset.showPresets.value && tableViews) {
            bar.appendChild(this.tbGroup(this.str("Column preset", "Spalten-Preset"),
                presets.map(([p, label]) => this.tbBtn(label, ui.preset === p, () => { ui.preset = p; }))));
        }

        const refs: Scenario[] = (["py", "pl", "fc"] as Scenario[]).filter(s => this.has[s]);
        if (refs.length > 0 && tset.showReference.value && (tableViews || isTree)) {
            bar.appendChild(this.tbGroup("Δ " + this.str("reference", "Referenz"),
                refs.map(r => this.tbBtn(r.toUpperCase(), ui.ref === r, () => { ui.ref = r; }))));
        }

        const pb: HTMLElement[] = [];
        if (ui.view !== "bars" && this.model!.months.length > 1) {
            pb.push(this.tbBtn("MTD", ui.blocks.mtd, () => { ui.blocks.mtd = !ui.blocks.mtd; }));
        }
        pb.push(this.tbBtn("YTD", ui.blocks.ytd, () => { ui.blocks.ytd = !ui.blocks.ytd; }));
        if (this.has.fcfy && this.has.plfy) {
            pb.push(this.tbBtn("FY", ui.blocks.fy, () => { ui.blocks.fy = !ui.blocks.fy; }));
        }
        if (pb.length > 1 && tset.showPeriods.value && tableViews) {
            bar.appendChild(this.tbGroup(this.str("Periods", "Perioden"), pb));
        }

        const unitText = this.settings.numbersCard.unitText.value || "EUR";
        if (tset.showUnit.value) { bar.appendChild(this.tbGroup(this.str("Unit", "Einheit"), [
            this.tbBtn("k" + unitText, ui.unit === "k", () => { ui.unit = "k"; }),
            this.tbBtn("m" + unitText, ui.unit === "m", () => { ui.unit = "m"; }),
        ])); }

        if (tset.showDensity.value) { bar.appendChild(this.tbGroup(this.str("Density", "Dichte"), [
            this.tbBtn("Normal", ui.density === "normal", () => { ui.density = "normal"; }),
            this.tbBtn("Compact", ui.density === "compact", () => { ui.density = "compact"; }),
        ])); }

        // card chart + status indicator only make sense on the driver tree
        if (isTree) {
            const cardBtn = (m: TreeCardMode, label: string, tip: string): HTMLElement =>
                this.tbBtn(label, ui.treeCard === m, () => { ui.treeCard = m; }, tip);
            bar.appendChild(this.tbGroup(this.str("Cards", "Karten"), [
                cardBtn("months", this.str("Months", "Monate"),
                    this.str("Monthly columns: AC solid, PL outlined behind",
                        "Monatssäulen: AC solide, PL outlined dahinter")),
                cardBtn("delta", "Δ",
                    this.str("Variance columns per month: AC − reference",
                        "Abweichungssäulen je Monat: AC − Referenz")),
                cardBtn("bridge", this.str("Bridge", "Brücke"),
                    this.str("Mini bridge: reference → Δ → AC (year to date)",
                        "Mini-Brücke: Referenz → Δ → AC (Jahresverlauf)")),
                this.tbBtn(this.str("Status", "Status"), ui.treeStatus,
                    () => { ui.treeStatus = !ui.treeStatus; },
                    this.str("Colour indicator: card edge and Δ% in the header",
                        "Indikator-Farbe: Kartenrand und Δ% im Kopf")),
            ]));
        }

        const treeDepth = this.treeCtx ? this.treeCtx.depth : 1;
        const maxL = Math.min(isTree ? treeDepth : this.model!.maxDepth, 8);
        const lvlBtns: HTMLElement[] = [];
        if (isTree) {
            lvlBtns.push(this.tbBtn("⌂", false, () => {
                ui.treeRoot = "";
                ui.treeCollapsed = null;
            }, this.str("Back to the top root, whole tree open",
                "Zurück zur obersten Wurzel, ganzer Baum offen")));
        }
        for (let l = 1; l < maxL; l++) {
            lvlBtns.push(this.tbBtn(String(l), false, () => {
                if (isTree) { ui.treeCollapsed = this.treeCtx ? [...this.treeCtx.levels[l]] : []; }
                else { ui.collapsed = [...collapseToLevel(this.model!.roots, l)]; }
            }));
        }
        lvlBtns.push(this.tbBtn(this.str("All", "Alle"), false, () => {
            if (isTree) { ui.treeCollapsed = []; } else { ui.collapsed = []; }
        }));
        if (tset.showLevels.value && (tableViews || isTree)) {
            bar.appendChild(this.tbGroup(this.str("Expand to level", "Bis Ebene"), lvlBtns));
        }

        if (tset.showOptions.value && tableViews) { bar.appendChild(this.tbGroup(this.str("Options", "Optionen"), [
            this.tbBtn(this.str("% of revenue", "% vom Umsatz"), ui.pctRev, () => { ui.pctRev = !ui.pctRev; }),
            this.tbBtn(this.str("Hide zero rows", "Nullzeilen aus"), ui.hideZero, () => { ui.hideZero = !ui.hideZero; }),
        ])); }
        return bar;
    }

    private legendChip(style: "ac" | "py" | "pl" | "fc"): HTMLElement {
        const chip = document.createElement("span");
        const base = "display:inline-block;width:10px;height:10px;margin-right:5px;vertical-align:-1px;";
        if (style === "ac") { chip.style.cssText = base + `background:${C.ac};`; }
        else if (style === "py") { chip.style.cssText = base + `background:${C.py};`; }
        else if (style === "pl") { chip.style.cssText = base + `background:#FFF;border:1.4px solid ${C.ac};box-sizing:border-box;`; }
        else {
            chip.style.cssText = base +
                `background:repeating-linear-gradient(45deg,#FFF,#FFF 2px,${C.ac} 2px,${C.ac} 3.2px);` +
                `border:1px solid ${C.ac};box-sizing:border-box;`;
        }
        return chip;
    }

    private buildLegend(): HTMLElement {
        const bar = document.createElement("div");
        bar.style.cssText = `display:flex;gap:16px;flex-wrap:wrap;align-items:center;` +
            `padding:6px 14px;font-size:10px;color:${C.soft};`;
        const item = (chipEl: HTMLElement | null, label: string, color?: string): void => {
            const s = document.createElement("span");
            if (chipEl) { s.appendChild(chipEl); }
            const t = document.createElement("span");
            if (color) { t.style.color = color; }
            t.textContent = label;
            s.appendChild(t);
            bar.appendChild(s);
        };
        item(this.legendChip("ac"), " AC actual");
        if (this.has.py) { item(this.legendChip("py"), " PY previous year"); }
        if (this.has.pl || this.has.plfy) { item(this.legendChip("pl"), " PL plan"); }
        if (this.has.fc || this.has.fcfy) { item(this.legendChip("fc"), " FC forecast"); }
        const g = document.createElement("span");
        const sq = (color: string): HTMLElement => {
            const el = document.createElement("span");
            el.style.cssText = `display:inline-block;width:10px;height:10px;background:${color};margin:0 5px 0 0;vertical-align:-1px;`;
            return el;
        };
        const fav = document.createElement("span"); fav.appendChild(sq(this.goodColor()));
        fav.appendChild(document.createTextNode(this.str("favorable Δ", "günstige Δ")));
        const unfav = document.createElement("span"); unfav.appendChild(sq(this.badColor()));
        unfav.appendChild(document.createTextNode(this.str("unfavorable Δ", "ungünstige Δ")));
        bar.appendChild(fav); bar.appendChild(unfav); bar.appendChild(g);
        if (String(this.settings.styleCard.colorMode.value.value) !== "ibcs") {
            const note = document.createElement("span");
            note.style.cssText = "font-style:italic;";
            note.textContent = this.str(
                "Documented IBCS deviation: teal replaces green (safe for red–green color-vision deficiency).",
                "Dokumentierte IBCS-Abweichung: Teal statt Grün (sicher bei Rot-Grün-Sehschwäche).");
            bar.appendChild(note);
        }
        const axes = document.createElement("span");
        axes.style.cssText = "font-style:italic;";
        axes.textContent = this.str("Δ axes encode the reference: gray = PY, double line = PL, dashed = FC.",
            "Δ-Achsen kodieren die Referenz: grau = PY, Doppellinie = PL, gestrichelt = FC.");
        bar.appendChild(axes);
        return bar;
    }

    // ---------------- table ----------------

    private colSpecs(): Block[] {
        const ui = this.ui!;
        const months = this.model!.months;
        const last = months.length > 0 ? this.monthLabel(months[months.length - 1]) : "";
        const year = months.length > 0 ? months[0].slice(0, 4) : "";
        const ytdLabel = months.length > 0
            ? `${year} ${this.monthLabel(months[0])}..${last} (_${last}) · ${this.str("year to date", "Jahresverlauf")}`
            : this.str("current period", "aktueller Zeitraum");
        const mtdLabel = `MTD ${last} · ${this.str("month", "Monat")}`;
        const fyLabel = `FY ${year} · ${this.str("outlook", "Ausblick")} AC&FC ${this.str("vs", "vs.")} PL`;
        const fyOn = this.has.fcfy && this.has.plfy && ui.blocks.fy;
        const blocks: Block[] = [];

        if (ui.view === "waterfall" || ui.view === "bars") {
            const r = this.has[ui.ref] ? ui.ref : (this.has.pl ? "pl" : "py");
            const kind = ui.view === "waterfall" ? "wbar" : "vbar";
            const mk = (block: "mtd" | "ytd" | "fy"): ColSpec[] => {
                const specs: ColSpec[] = [];
                const ref: Scenario = block === "fy" ? "plfy" : r;
                const minuend: Scenario = block === "fy" ? "fcfy" : "ac";
                if (ui.view === "waterfall") {
                    if (this.has[ref]) { specs.push({ kind: "wbar", scen: ref, block, label: block === "fy" ? "PL" : ref.toUpperCase() }); }
                    specs.push({ kind: "wbar", scen: minuend, block, label: block === "fy" ? "AC&FC" : "AC" });
                } else {
                    specs.push({ kind: "vbar", scen: minuend, ref, block, label: block === "fy" ? "AC&FC · PL" : `AC · ${ref.toUpperCase()}` });
                }
                if (this.has[ref]) {
                    specs.push({ kind: "bar", ref, minuend, block, label: `Δ${block === "fy" ? "PL" : ref.toUpperCase()}` });
                    specs.push({ kind: "pin", ref, minuend, block, label: `Δ${block === "fy" ? "PL" : ref.toUpperCase()}%` });
                }
                return specs;
            };
            if (ui.view === "waterfall" && ui.blocks.mtd && months.length > 1) {
                blocks.push({ key: "mtd", label: mtdLabel, specs: mk("mtd") });
            }
            if (ui.blocks.ytd || blocks.length === 0 && !fyOn) {
                blocks.push({ key: "ytd", label: ytdLabel, specs: mk("ytd") });
            }
            if (fyOn) { blocks.push({ key: "fy", label: fyLabel, specs: mk("fy") }); }
            void kind;
            return blocks;
        }

        const rM = this.has[ui.ref] ? ui.ref : (this.has.pl ? "pl" : "py");
        if (ui.blocks.mtd && months.length > 1) {
            const mtd: ColSpec[] = [{ kind: "val", scen: "ac", block: "mtd", label: "AC" }];
            if (this.has[rM]) {
                mtd.push({ kind: "val", scen: rM, block: "mtd", label: rM.toUpperCase() });
                mtd.push({ kind: "bar", ref: rM, minuend: "ac", block: "mtd", label: `Δ${rM.toUpperCase()}` });
                mtd.push({ kind: "pin", ref: rM, minuend: "ac", block: "mtd", label: `Δ${rM.toUpperCase()}%` });
            }
            blocks.push({ key: "mtd", label: mtdLabel, specs: mtd });
        }
        const ytd: ColSpec[] = [{ kind: "val", scen: "ac", block: "ytd", label: "AC" }];
        if (ui.pctRev) { ytd.push({ kind: "pct", block: "ytd", label: "% Rev" }); }
        const fy: ColSpec[] = [];
        const push = (arr: ColSpec[], ref: Scenario, minuend: Scenario, withVal: boolean, valScen?: Scenario): void => {
            if (withVal && valScen) { arr.push({ kind: "val", scen: valScen, block: "ytd", label: valScen === "plfy" ? "PL" : valScen.toUpperCase() }); }
            arr.push({ kind: "bar", ref, minuend, block: "ytd", label: `Δ${ref === "plfy" ? "PL" : ref.toUpperCase()}` });
            arr.push({ kind: "pin", ref, minuend, block: "ytd", label: `Δ${ref === "plfy" ? "PL" : ref.toUpperCase()}%` });
        };
        if (ui.preset === "full") {
            if (this.has.py) {
                ytd.push({ kind: "val", scen: "py", block: "ytd", label: "PY" });
                ytd.push({ kind: "bar", ref: "py", minuend: "ac", block: "ytd", label: "ΔPY" });
            }
            if (this.has.pl) {
                ytd.push({ kind: "val", scen: "pl", block: "ytd", label: "PL" });
                ytd.push({ kind: "bar", ref: "pl", minuend: "ac", block: "ytd", label: "ΔPL" });
                ytd.push({ kind: "pin", ref: "pl", minuend: "ac", block: "ytd", label: "ΔPL%" });
            }
            if (fyOn) {
                fy.push({ kind: "val", scen: "fcfy", block: "fy", label: "FC" });
                fy.push({ kind: "val", scen: "plfy", block: "fy", label: "PL" });
                fy.push({ kind: "bar", ref: "plfy", minuend: "fcfy", block: "fy", label: "ΔPL" });
                fy.push({ kind: "pin", ref: "plfy", minuend: "fcfy", block: "fy", label: "ΔPL%" });
            }
        } else if (ui.preset === "acref") {
            const r2 = this.ui!.ref;
            if (this.has[r2]) { ytd.push({ kind: "val", scen: r2, block: "ytd", label: r2.toUpperCase() }); push(ytd, r2, "ac", false); }
        } else if (ui.preset === "acpydpy" && this.has.py) {
            ytd.push({ kind: "val", scen: "py", block: "ytd", label: "PY" }); push(ytd, "py", "ac", false);
        } else if (ui.preset === "acpldpl" && this.has.pl) {
            ytd.push({ kind: "val", scen: "pl", block: "ytd", label: "PL" }); push(ytd, "pl", "ac", false);
        } else if (ui.preset === "dpct") {
            if (this.has.py) { ytd.push({ kind: "pin", ref: "py", minuend: "ac", block: "ytd", label: "ΔPY%" }); }
            if (this.has.pl) { ytd.push({ kind: "pin", ref: "pl", minuend: "ac", block: "ytd", label: "ΔPL%" }); }
        }
        blocks.push({ key: "ytd", label: ytdLabel, specs: ytd });
        if (fy.length > 0) { blocks.push({ key: "fy", label: `FY ${year} · ${this.str("outlook (FC)", "Ausblick (FC)")}`, specs: fy }); }
        return blocks;
    }

    private buildTable(fmt: Fmt, maxAbsDelta: number): HTMLElement {
        const model = this.model!; const ui = this.ui!;
        const collapsed = new Set(ui.collapsed);
        let visible = flattenVisible(model.roots, collapsed);
        if (ui.hideZero) { visible = visible.filter(n => n.row.rowType === "separator" || !isZeroRow(n)); }

        const revBase = revenueBase(model, this.settings.columnsCard.revenueBase.value);
        const blocks = this.colSpecs();
        const cols: ColSpec[] = [];
        blocks.forEach((b, i) => {
            if (i > 0) { cols.push({ kind: "gap", label: "" }); }
            cols.push(...b.specs);
        });

        // label maxima, cascade segments and bar extrema are O(rows) scans —
        // memoized per model + column set + number format (see geoScans)
        const gc = this.geoScans(cols, fmt);
        const dLabelLen = gc.dLabelLen; const pLabelLen = gc.pLabelLen;
        const compact = ui.density === "compact";
        const fscale = this.fontScale();
        const rowH = Math.round((compact ? 18 : 23) * fscale);
        const fs = Math.round((compact ? 10 : 11) * fscale);
        const BAR_HALF = 34; const PIN_HALF = 24;
        const dLabelW = Math.ceil(dLabelLen * (fs * 0.52)) + 4;
        const pLabelW = Math.ceil(pLabelLen * (fs * 0.52)) + 4;
        const barW = 2 * (BAR_HALF + dLabelW + 4) + 8;
        const pinW = 2 * (PIN_HALF + pLabelW + 4) + 8;
        const valW = compact ? 66 : 76;

        // waterfall view: cascade segments per scenario (tree order, expand-independent)
        this.wfSegs = gc.wf;

        // shared display-space scale for the value / cascade bars
        let vAxisX = 0; let vPpu = 0; let vLabelW = 0; let vbarW = 0;
        const hasVbar = cols.some(c => c.kind === "vbar");
        if (hasVbar || this.wfSegs.size > 0) {
            vLabelW = Math.ceil(gc.vLabelLen * (fs * 0.52)) + 4;
            const span = this.wfSegs.size > 0 ? (compact ? 190 : 240) : (compact ? 150 : 190);
            vPpu = span / ((gc.maxPosD + gc.maxNegD) || 1);
            vAxisX = 4 + vLabelW + gc.maxNegD * vPpu;
            vbarW = span + 2 * (vLabelW + 4) + 8;
        }

        const geo = { rowH, fs, BAR_HALF, PIN_HALF, barW, pinW, valW, maxAbsDelta, vbarW, vAxisX, vPpu, vLabelW };

        // comment footnotes are numbered over ALL visible rows, not just the
        // rows currently in the DOM (windowed rendering)
        this.comments = [];
        this.commentNo.clear();
        for (const node of visible) {
            if (node.row.rowType === "separator" || !node.row.comment) { continue; }
            const n = this.comments.length + 1;
            this.comments.push({ n, node, text: node.row.comment });
            this.commentNo.set(node.row.id, n);
        }

        const wrap = document.createElement("div");
        wrap.style.cssText = "padding:2px 14px 8px 14px;";

        const scaleNote = document.createElement("div");
        scaleNote.style.cssText = `font-size:9px;color:${C.soft};text-align:right;padding:0 0 3px 0;`;
        scaleNote.textContent = this.str("uniform Δ scale: bars ±", "einheitliche Δ-Skala: Balken ±")
            + fmt.val(maxAbsDelta) + " " + fmt.suffix + this.settings.numbersCard.unitText.value
            + " · pins ±40%";
        wrap.appendChild(scaleNote);

        const table = document.createElement("div");
        table.style.cssText = "display:table;border-collapse:collapse;";
        table.appendChild(this.blockHeaderRow(blocks, geo));
        table.appendChild(this.headerRow(cols, geo));

        const sparkOn = (node: PnlNode): boolean =>
            ui.spark.includes(node.row.id) && node.series.ac != null && model.months.length > 1;
        const make = (node: PnlNode): HTMLElement[] => {
            const out = [this.bodyRow(node, cols, fmt, geo, revBase)];
            if (sparkOn(node)) { out.push(this.sparkRow(node, cols.length, geo)); }
            return out;
        };

        if (visible.length > VIRT_MIN_ROWS) {
            // windowed rendering: only the rows around the scroll viewport go
            // into the DOM, spacer rows carry the remaining height
            const offsets = new Array<number>(visible.length + 1);
            let acc = 0;
            for (let i = 0; i < visible.length; i++) {
                offsets[i] = acc;
                acc += rowH
                    + (visible[i].row.rowType === "separator" ? SEP_EXTRA_H : 0)
                    + (sparkOn(visible[i]) ? SPARK_ROW_H : 0);
            }
            offsets[visible.length] = acc;
            const top = this.spacerRow();
            const bottom = this.spacerRow();
            table.appendChild(top);
            table.appendChild(bottom);
            this.vs = {
                table, top, bottom, rows: [], visible, offsets, make,
                bodyTop: 0, from: -1, to: -1,
            };
            const guess = Math.ceil((this.root.clientHeight || 800) / Math.max(rowH, 1)) + 2 * VIRT_BUFFER;
            this.renderWindow(0, Math.min(visible.length, guess));
        } else {
            for (const node of visible) {
                for (const el of make(node)) { table.appendChild(el); }
            }
        }
        wrap.appendChild(table);
        return wrap;
    }

    /**
     * O(rows) scans that depend on the model, the column set and the number
     * format: Δ / Δ% label lengths (→ column widths), cascade segments and the
     * bar extrema. Cached so toolbar clicks that change none of them are free.
     */
    private geoScans(cols: ColSpec[], fmt: Fmt): GeoCache {
        const model = this.model!;
        const sig = cols.map(c => `${c.kind}${c.scen ?? ""}${c.ref ?? ""}${c.minuend ?? ""}${c.block ?? ""}`).join(",");
        const num = this.settings.numbersCard;
        const key = [this.scanKey(), sig, fmt.div, fmt.suffix,
            num.decimals.value, num.pctDecimals.value, this.locale].join("~");
        if (this.geoCache && this.geoCache.key === key) { return this.geoCache; }

        let dLabelLen = 2; let pLabelLen = 3;
        for (const node of model.byId.values()) {
            if (node.row.rowType === "kpi") { continue; }
            for (const c of cols) {
                if (c.kind === "bar") {
                    const v = this.blockVariance(node, c.block ?? "ytd", c.ref!, c.minuend!);
                    if (v.delta != null) { dLabelLen = Math.max(dLabelLen, fmt.val(v.delta, true).length); }
                } else if (c.kind === "pin") {
                    const v = this.blockVariance(node, c.block ?? "ytd", c.ref!, c.minuend!);
                    if (v.deltaPct != null) { pLabelLen = Math.max(pLabelLen, (fmt.pct(this.capPct(v.deltaPct), true) + "▸").length); }
                }
            }
        }

        const wf = new Map<string, Map<string, { s: number; e: number }>>();
        const li = model.months.length - 1;
        for (const c of cols) {
            if (c.kind !== "wbar") { continue; }
            const wkey = `${c.block}:${c.scen}`;
            if (wf.has(wkey)) { continue; }
            const read = c.block === "mtd"
                ? (n: PnlNode): number | null => n.series[c.scen!]?.[li] ?? null
                : (n: PnlNode): number | null => n.computed[c.scen!];
            wf.set(wkey, this.cascadeSegments(read));
        }

        let maxPosD = 0; let maxNegD = 0; let vLabelLen = 2;
        if (wf.size > 0) {
            for (const [wkey, segs] of wf) {
                const scen = wkey.split(":")[1] as Scenario;
                for (const node of model.byId.values()) {
                    const seg = segs.get(node.row.id);
                    if (!seg) { continue; }
                    maxPosD = Math.max(maxPosD, seg.s, seg.e);
                    maxNegD = Math.max(maxNegD, -seg.s, -seg.e);
                    const v = displayValue(node, scen);
                    if (v != null) { vLabelLen = Math.max(vLabelLen, fmt.val(v).length); }
                }
            }
        } else if (cols.some(c => c.kind === "vbar")) {
            const scens = new Set<Scenario>();
            for (const c of cols) { if (c.kind === "vbar") { scens.add(c.scen!); scens.add(c.ref!); } }
            for (const node of model.byId.values()) {
                if (node.row.rowType === "kpi" || node.row.rowType === "separator") { continue; }
                for (const sc of scens) {
                    const v = displayValue(node, sc);
                    if (v == null) { continue; }
                    if (v >= 0) { maxPosD = Math.max(maxPosD, v); } else { maxNegD = Math.max(maxNegD, -v); }
                    vLabelLen = Math.max(vLabelLen, fmt.val(v).length);
                }
            }
        }

        this.geoCache = { key, dLabelLen, pLabelLen, vLabelLen, maxPosD, maxNegD, wf };
        return this.geoCache;
    }

    private cell(w: number, align: string, fs: number): HTMLElement {
        const c = document.createElement("div");
        c.style.cssText = `display:table-cell;vertical-align:middle;padding:1px 7px 1px 0;` +
            `width:${w > 0 ? w + "px" : "auto"};text-align:${align};font-size:${fs}px;white-space:nowrap;`;
        return c;
    }

    private blockHeaderRow(blocks: Block[], geo: { valW: number; barW: number; pinW: number; vbarW: number; fs: number }): HTMLElement {
        const row = document.createElement("div");
        row.style.cssText = "display:table-row;";
        row.appendChild(this.cell(0, "left", geo.fs));
        blocks.forEach((b, bi) => {
            if (bi > 0) { row.appendChild(this.cell(18, "center", 9)); }
            b.specs.forEach((spec, si) => {
                const c = this.cell(0, "center", 9);
                c.style.cssText += `color:${C.soft};border-bottom:1px solid ${C.gridSoft};`;
                if (si === 0) { c.textContent = b.label; c.style.whiteSpace = "nowrap"; }
                void spec;
                row.appendChild(c);
            });
        });
        return row;
    }

    private headerRow(cols: ColSpec[], geo: { valW: number; barW: number; pinW: number; vbarW: number; fs: number }): HTMLElement {
        const row = document.createElement("div");
        row.style.cssText = "display:table-row;";
        row.appendChild(this.cell(0, "left", geo.fs));
        for (const c of cols) {
            if (c.kind === "gap") { row.appendChild(this.cell(18, "center", 9)); continue; }
            const w = c.kind === "val" || c.kind === "pct" ? geo.valW
                : (c.kind === "vbar" || c.kind === "wbar") ? geo.vbarW
                : c.kind === "bar" ? geo.barW : geo.pinW;
            const cell = this.cell(w, c.kind === "val" || c.kind === "pct" ? "right" : "center", 9.5);
            cell.style.color = C.soft;
            if (c.kind === "val" && c.scen) {
                const style = c.scen === "ac" ? "ac" : c.scen === "py" ? "py" : (c.scen === "fc" || c.scen === "fcfy") ? "fc" : "pl";
                cell.appendChild(this.legendChip(style as "ac"));
            }
            cell.appendChild(document.createTextNode(c.label));
            row.appendChild(cell);
        }
        return row;
    }

    private capPct(p: number): number { return Math.max(-0.4, Math.min(0.4, p)); }

    private bodyRow(node: PnlNode, cols: ColSpec[], fmt: Fmt,
        geo: { rowH: number; fs: number; BAR_HALF: number; PIN_HALF: number; barW: number; pinW: number; valW: number; maxAbsDelta: number; vbarW: number; vAxisX: number; vPpu: number; vLabelW: number },
        revBase: PnlNode | null): HTMLElement {
        const ui = this.ui!;
        const t = node.row.rowType;
        const isRatio = t === "kpi";
        const isSum = t === "subtotal" || t === "formula";
        const indent = this.settings.hierarchyCard.indent.value;

        const row = document.createElement("div");
        row.style.cssText = `display:table-row;height:${geo.rowH}px;`;
        if (t === "separator") {
            const c = this.cell(0, "left", 9);
            c.style.cssText += `padding-top:9px;font-weight:600;color:${C.soft};`;
            c.textContent = node.row.name === node.row.id ? "" : node.row.name;
            row.appendChild(c);
            return row;
        }

        // name cell
        const name = this.cell(0, "left", geo.fs);
        name.style.paddingLeft = `${node.level * indent}px`;
        name.style.minWidth = "230px";
        if (isSum) { name.style.fontWeight = "600"; }
        if (node.isOrphanBucket) { name.style.color = this.badColor(); }
        if (isRatio) { name.style.fontStyle = "italic"; name.style.color = C.soft; }

        if (node.hasChildren) {
            const open = !ui.collapsed.includes(node.row.id);
            const chev = document.createElement("span");
            chev.textContent = open ? "▾ " : "▸ ";
            chev.style.cssText = `cursor:pointer;color:${C.soft};font-size:9px;`;
            const toggle = (e: Event): void => {
                e.stopPropagation();
                if (open) { ui.collapsed.push(node.row.id); }
                else { ui.collapsed = ui.collapsed.filter(id => id !== node.row.id); }
                this.persistUi(); this.rerender();
            };
            chev.onclick = toggle;
            name.style.cursor = "pointer";
            name.onclick = toggle;
            name.appendChild(chev);
        }
        // small account id (only when it differs from the display name and is not synthetic)
        const rid = node.row.id;
        if (!rid.startsWith("L:") && rid !== node.row.name && rid !== "__unassigned__") {
            const idEl = document.createElement("span");
            idEl.style.cssText = `font-size:8px;color:${C.soft};margin-right:6px;`;
            idEl.textContent = rid;
            name.appendChild(idEl);
        }
        if (node.isOrphanBucket) { name.appendChild(document.createTextNode("⚠ ")); }
        const label = document.createElement("span");
        label.textContent = node.row.name;
        name.appendChild(label);
        if (node.error) {
            const err = document.createElement("span");
            err.style.cssText = `color:${this.badColor()};font-size:8.5px;`;
            err.textContent = " ⚠ " + node.error;
            name.appendChild(err);
        }
        if (node.row.comment) {
            const n = this.commentNo.get(node.row.id);
            if (n != null) {
                const mark = document.createElement("span");
                mark.style.cssText = `color:${C.comment};font-size:9.5px;margin-left:5px;cursor:default;`;
                mark.textContent = String.fromCharCode(0x2460 + n - 1);
                mark.title = node.row.comment;
                name.appendChild(mark);
            }
        }
        // while segments are still loading, every aggregate says so — an
        // incomplete subtotal must never look like a final figure
        if (this.awaitingSegment && (isSum || isRatio)) {
            const inc = document.createElement("span");
            inc.style.cssText = `color:${C.loading};font-size:9.5px;margin-left:5px;cursor:default;`;
            inc.textContent = "≈";
            inc.title = this.str("value still incomplete — data is loading",
                "Wert noch unvollständig — Daten werden geladen");
            name.appendChild(inc);
        }
        // 12M sparkline chip
        if (node.series.ac && this.model!.months.length > 1) {
            const chip = document.createElement("span");
            const active = ui.spark.includes(node.row.id);
            chip.textContent = `${this.model!.months.length}M`;
            chip.style.cssText = `font-size:8px;margin-left:6px;padding:0 4px;cursor:pointer;border-radius:2px;` +
                (active ? `background:${C.ac};color:#FFF;` : `border:1px solid ${C.gridSoft};color:${C.soft};`);
            chip.onclick = (e) => {
                e.stopPropagation();
                if (active) { ui.spark = ui.spark.filter(id => id !== node.row.id); }
                else { ui.spark.push(node.row.id); }
                this.persistUi(); this.rerender();
            };
            chip.title = this.str("Toggle monthly sparkline", "Monats-Sparkline umschalten");
            name.appendChild(chip);
        }
        row.appendChild(name);

        const lineTop = isSum && !isRatio;
        for (const c of cols) {
            if (c.kind === "gap") { row.appendChild(this.cell(18, "center", geo.fs)); continue; }
            let cell: HTMLElement;
            if (c.kind === "val") {
                cell = this.cell(geo.valW, "right", geo.fs);
                cell.style.cssText += "font-variant-numeric:tabular-nums;";
                if (isSum) { cell.style.fontWeight = "600"; }
                const bv = this.blockDisplay(node, c.block ?? "ytd", c.scen!);
                cell.textContent = isRatio ? fmt.pct(bv) : fmt.val(bv);
            } else if (c.kind === "vbar") {
                cell = this.valueBarCell(node, c, geo, fmt, isSum, isRatio);
                if (lineTop) { cell.style.borderTop = `1px solid ${C.line}`; }
            } else if (c.kind === "wbar") {
                cell = this.cascadeBarCell(node, c, geo, fmt, isSum, isRatio);
                if (lineTop) { cell.style.borderTop = `1px solid ${C.line}`; }
            } else if (c.kind === "pct") {
                cell = this.cell(geo.valW, "right", geo.fs - 1);
                cell.style.cssText += `color:${C.soft};font-variant-numeric:tabular-nums;`;
                const base = revBase?.computed.ac;
                const v = node.computed.ac;
                cell.textContent = !isRatio && base != null && base !== 0 && v != null
                    ? fmt.pct(Math.abs(v / base)) : "";
            } else {
                const v = this.blockVariance(node, c.block ?? "ytd", c.ref!, c.minuend!);
                if (isRatio) {
                    cell = this.cell(c.kind === "bar" ? geo.barW : geo.pinW, "center", geo.fs - 1);
                    if (c.kind === "bar" && v.delta != null) {
                        cell.style.color = v.good ? this.goodColor() : this.badColor();
                        cell.style.fontStyle = "italic";
                        cell.textContent = (v.delta > 0 ? "+" : "") + fmt.pct(v.delta).replace("%", "pp");
                    }
                } else if (c.kind === "bar") {
                    cell = this.deltaBarCell(v, c, geo, fmt);
                } else {
                    cell = this.deltaPinCell(v, c, geo, fmt);
                }
                if (lineTop) { cell.style.borderTop = `1px solid ${C.line}`; }
            }
            if (lineTop && (c.kind === "val" || c.kind === "pct")) { cell.style.borderTop = `1px solid ${C.line}`; }
            row.appendChild(cell);
        }
        return row;
    }

    /** reference-scenario axis per IBCS: gray = PY, double line = PL, dashed = FC */
    private drawAxis(svg: SVGSVGElement, ns: string, x: number, h: number, ref: Scenario): void {
        const mk = (xx: number, dash: string | null, color: string, wd: number): void => {
            const l = document.createElementNS(ns, "line");
            l.setAttribute("x1", String(xx)); l.setAttribute("x2", String(xx));
            l.setAttribute("y1", "0"); l.setAttribute("y2", String(h));
            l.setAttribute("stroke", color); l.setAttribute("stroke-width", String(wd));
            if (dash) { l.setAttribute("stroke-dasharray", dash); }
            svg.appendChild(l);
        };
        if (ref === "py") { mk(x, null, C.py, 2); }
        else if (ref === "pl" || ref === "plfy") { mk(x - 1.2, null, C.ac, 0.9); mk(x + 1.2, null, C.ac, 0.9); }
        else { mk(x, "3,2", C.ac, 1); }
    }

    private hatchPattern(svg: SVGSVGElement, ns: string, id: string, color: string): void {
        const defs = document.createElementNS(ns, "defs");
        const p = document.createElementNS(ns, "pattern");
        p.setAttribute("id", id); p.setAttribute("width", "4"); p.setAttribute("height", "4");
        p.setAttribute("patternUnits", "userSpaceOnUse");
        p.setAttribute("patternTransform", "rotate(45)");
        const r = document.createElementNS(ns, "rect");
        r.setAttribute("width", "4"); r.setAttribute("height", "4"); r.setAttribute("fill", "#FFF");
        const l = document.createElementNS(ns, "rect");
        l.setAttribute("width", "1.8"); l.setAttribute("height", "4"); l.setAttribute("fill", color);
        p.appendChild(r); p.appendChild(l); defs.appendChild(p); svg.appendChild(defs);
    }

    private deltaBarCell(v: { delta: number | null; good: boolean }, c: ColSpec,
        geo: { rowH: number; fs: number; BAR_HALF: number; barW: number; maxAbsDelta: number }, fmt: Fmt): HTMLElement {
        const cell = this.cell(geo.barW, "left", geo.fs);
        if (v.delta == null) { return cell; }
        const w = geo.barW - 8; const h = geo.rowH - 4; const mid = w / 2;
        const frac = geo.maxAbsDelta > 0 ? Math.min(Math.abs(v.delta) / geo.maxAbsDelta, 1) : 0;
        const len = Math.max(frac * geo.BAR_HALF, v.delta === 0 ? 0 : 1.5);
        const x = v.delta >= 0 ? mid : mid - len;
        const color = v.good ? this.goodColor() : this.badColor();
        const ns = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(ns, "svg") as SVGSVGElement;
        svg.setAttribute("width", String(w)); svg.setAttribute("height", String(h));
        svg.style.cssText = "display:block;";
        const hatch = c.minuend === "fcfy";
        const pid = `pnlh${Math.abs(v.delta).toFixed(2).replace(".", "")}${color.slice(1)}`;
        if (hatch) { this.hatchPattern(svg, ns, pid, color); }
        this.drawAxis(svg, ns, mid, h, c.ref!);
        const rect = document.createElementNS(ns, "rect");
        rect.setAttribute("x", String(x)); rect.setAttribute("y", "2.5");
        rect.setAttribute("width", String(len)); rect.setAttribute("height", String(h - 5));
        rect.setAttribute("fill", hatch ? `url(#${pid})` : color);
        if (hatch) { rect.setAttribute("stroke", color); rect.setAttribute("stroke-width", "1"); }
        svg.appendChild(rect);
        const txt = document.createElementNS(ns, "text");
        const anchor = v.delta >= 0 ? "start" : "end";
        const tx = v.delta >= 0 ? mid + len + 3 : mid - len - 3;
        txt.setAttribute("x", String(tx)); txt.setAttribute("y", String(h / 2 + geo.fs * 0.32));
        txt.setAttribute("text-anchor", anchor);
        txt.setAttribute("font-size", String(geo.fs - 1.5)); txt.setAttribute("font-family", FONT);
        txt.setAttribute("fill", v.good ? this.goodColor() : this.badColor());
        txt.textContent = fmt.val(v.delta, true);
        svg.appendChild(txt);
        cell.appendChild(svg);
        return cell;
    }

    private deltaPinCell(v: { deltaPct: number | null; good: boolean }, c: ColSpec,
        geo: { rowH: number; fs: number; PIN_HALF: number; pinW: number }, fmt: Fmt): HTMLElement {
        const cell = this.cell(geo.pinW, "left", geo.fs);
        if (v.deltaPct == null) { return cell; }
        const w = geo.pinW - 8; const h = geo.rowH - 4; const mid = w / 2;
        const cap = 0.4;
        const clamped = this.capPct(v.deltaPct);
        const px = mid + (clamped / cap) * geo.PIN_HALF;
        const overflow = Math.abs(v.deltaPct) > cap;
        const color = v.good ? this.goodColor() : this.badColor();
        const ns = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(ns, "svg") as SVGSVGElement;
        svg.setAttribute("width", String(w)); svg.setAttribute("height", String(h));
        svg.style.cssText = "display:block;";
        this.drawAxis(svg, ns, mid, h, c.ref!);
        const needle = document.createElementNS(ns, "line");
        needle.setAttribute("x1", String(mid)); needle.setAttribute("x2", String(px));
        needle.setAttribute("y1", String(h / 2)); needle.setAttribute("y2", String(h / 2));
        needle.setAttribute("stroke", color); needle.setAttribute("stroke-width", "1.4");
        svg.appendChild(needle);
        const head = document.createElementNS(ns, "circle");
        head.setAttribute("cx", String(px)); head.setAttribute("cy", String(h / 2));
        head.setAttribute("r", overflow ? "2" : "2.8");
        // pin head carries the minuend's scenario fill (IBCS): FC → outlined
        if (c.minuend === "fcfy") {
            head.setAttribute("fill", "#FFF"); head.setAttribute("stroke", color); head.setAttribute("stroke-width", "1.4");
        } else { head.setAttribute("fill", color); }
        svg.appendChild(head);
        const txt = document.createElementNS(ns, "text");
        const anchor = v.deltaPct >= 0 ? "start" : "end";
        const tx = v.deltaPct >= 0 ? Math.max(px + 4, mid + 4) : Math.min(px - 4, mid - 4);
        txt.setAttribute("x", String(tx)); txt.setAttribute("y", String(h / 2 + geo.fs * 0.32));
        txt.setAttribute("text-anchor", anchor);
        txt.setAttribute("font-size", String(geo.fs - 1.5)); txt.setAttribute("font-family", FONT);
        txt.setAttribute("fill", color);
        txt.textContent = fmt.pct(v.deltaPct, true) + (overflow ? "▸" : "");
        svg.appendChild(txt);
        cell.appendChild(svg);
        return cell;
    }

    /**
     * Cascade segments for the row waterfall (IBCS P&L): contributing rows
     * float on a running total, formula rows anchor at the axis and reset it.
     * Children cascade inside their parent's segment. Expand-state independent.
     */
    private cascadeSegments(read: (n: PnlNode) => number | null): Map<string, { s: number; e: number }> {
        const segs = new Map<string, { s: number; e: number }>();
        const walkChildren = (node: PnlNode, start: number): void => {
            let cum = start;
            for (const c of node.children) {
                const t = c.row.rowType;
                if (t === "kpi" || t === "separator") { continue; }
                const v = read(c);
                if (t === "formula") { continue; } // nested formulas: no cascade segment
                if (v == null) { continue; }
                segs.set(c.row.id, { s: cum, e: cum + v });
                walkChildren(c, cum);
                cum += v;
            }
        };
        let rootCum = 0;
        for (const r of this.model!.roots) {
            const t = r.row.rowType;
            if (t === "kpi" || t === "separator") { continue; }
            const v = read(r);
            if (v == null) { continue; }
            if (t === "formula") {
                segs.set(r.row.id, { s: 0, e: v });
                walkChildren(r, 0);
                rootCum = v;
            } else {
                segs.set(r.row.id, { s: rootCum, e: rootCum + v });
                walkChildren(r, rootCum);
                rootCum += v;
            }
        }
        return segs;
    }

    /** row-waterfall cell: floating segment or anchor bar in scenario notation */
    private cascadeBarCell(node: PnlNode, c: ColSpec,
        geo: { rowH: number; fs: number; vbarW: number; vAxisX: number; vPpu: number },
        fmt: Fmt, isSum: boolean, isRatio: boolean): HTMLElement {
        const cell = this.cell(geo.vbarW, "left", geo.fs);
        const h = geo.rowH - 3;
        const scen = c.scen!;
        if (isRatio) {
            cell.style.cssText += `font-style:italic;color:${C.soft};text-align:center;`;
            cell.textContent = fmt.pct(displayValue(node, scen));
            return cell;
        }
        const block = c.block ?? "ytd";
        const seg = this.wfSegs.get(`${block}:${scen}`)?.get(node.row.id);
        if (!seg) { return cell; }
        const ns = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(ns, "svg") as SVGSVGElement;
        const w = geo.vbarW - 8;
        svg.setAttribute("width", String(w)); svg.setAttribute("height", String(h));
        svg.style.cssText = "display:block;";
        const x0 = geo.vAxisX + Math.min(seg.s, seg.e) * geo.vPpu;
        const x1 = geo.vAxisX + Math.max(seg.s, seg.e) * geo.vPpu;
        const isPlan = scen === "pl" || scen === "plfy";
        const hatch = scen === "fc" || scen === "fcfy";
        const pid = `pnlwf${node.row.index}${scen}`;
        if (hatch) { this.hatchPattern(svg, ns, pid, C.ac); }
        // assisting line at the segment's running edge (connects the cascade)
        const assist = document.createElementNS(ns, "line");
        assist.setAttribute("x1", String(x1)); assist.setAttribute("x2", String(x1));
        assist.setAttribute("y1", "0"); assist.setAttribute("y2", String(h));
        assist.setAttribute("stroke", C.gridSoft); assist.setAttribute("stroke-width", "1");
        svg.appendChild(assist);
        const rect = document.createElementNS(ns, "rect");
        rect.setAttribute("x", String(x0)); rect.setAttribute("y", "2");
        rect.setAttribute("width", String(Math.max(x1 - x0, 1)));
        rect.setAttribute("height", String(h - 4));
        const fill = scen === "ac" ? C.ac : scen === "py" ? C.py : isPlan ? "#FFF" : `url(#${pid})`;
        rect.setAttribute("fill", fill);
        if (isPlan || hatch) { rect.setAttribute("stroke", C.ac); rect.setAttribute("stroke-width", "1"); }
        svg.appendChild(rect);
        // FY outlook AC&FC composite: realized AC share solid, FC remainder stays hatched
        if (block === "fy" && scen === "fcfy") {
            const acv = node.computed.ac;
            const tot = node.computed.fcfy;
            if (acv != null && tot != null && tot !== 0 && acv / tot > 0 && Math.abs(acv) <= Math.abs(tot)) {
                const share = Math.abs(acv / tot);
                const solid = document.createElementNS(ns, "rect");
                const segW = Math.max(x1 - x0, 1) * share;
                solid.setAttribute("x", String((node.computed.fcfy ?? 0) >= 0 ? x0 : x1 - segW));
                solid.setAttribute("y", "2");
                solid.setAttribute("width", String(segW));
                solid.setAttribute("height", String(h - 4));
                solid.setAttribute("fill", C.ac);
                svg.appendChild(solid);
            }
        }
        // axis for anchors (full bars start at the axis)
        const axis = document.createElementNS(ns, "line");
        axis.setAttribute("x1", String(geo.vAxisX)); axis.setAttribute("x2", String(geo.vAxisX));
        axis.setAttribute("y1", "0"); axis.setAttribute("y2", String(h));
        axis.setAttribute("stroke", C.ac); axis.setAttribute("stroke-width", "1");
        svg.appendChild(axis);
        // label: display value, outside — right of segment for growth, left for decrease
        const li = this.model!.months.length - 1;
        const rawV = block === "mtd" ? (node.series[scen]?.[li] ?? null) : node.computed[scen];
        const dv = rawV == null ? null : (node.row.displayInvert ? -rawV : rawV);
        if (dv != null) {
            const grow = (rawV ?? 0) >= 0;
            const txt = document.createElementNS(ns, "text");
            txt.setAttribute("x", String(grow ? x1 + 3 : x0 - 3));
            txt.setAttribute("y", String(h / 2 + geo.fs * 0.32));
            txt.setAttribute("text-anchor", grow ? "start" : "end");
            txt.setAttribute("font-size", String(geo.fs - 1));
            txt.setAttribute("font-family", FONT);
            txt.setAttribute("fill", C.text);
            if (isSum) { txt.setAttribute("font-weight", "600"); }
            txt.textContent = fmt.val(dv);
            svg.appendChild(txt);
        }
        cell.appendChild(svg);
        return cell;
    }

    /** structure view: horizontal AC (or FC) bar with the reference scenario behind it */
    private valueBarCell(node: PnlNode, c: ColSpec,
        geo: { rowH: number; fs: number; vbarW: number; vAxisX: number; vPpu: number },
        fmt: Fmt, isSum: boolean, isRatio: boolean): HTMLElement {
        const cell = this.cell(geo.vbarW, "left", geo.fs);
        const h = geo.rowH - 3;
        if (isRatio) {
            cell.style.cssText += `font-style:italic;color:${C.soft};text-align:center;`;
            cell.textContent = fmt.pct(displayValue(node, c.scen!));
            return cell;
        }
        const v = displayValue(node, c.scen!);
        const r = displayValue(node, c.ref!);
        if (v == null && r == null) { return cell; }
        const ns = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(ns, "svg") as SVGSVGElement;
        const w = geo.vbarW - 8;
        svg.setAttribute("width", String(w)); svg.setAttribute("height", String(h));
        svg.style.cssText = "display:block;";
        const hatch = c.scen === "fcfy";
        const pid = `pnlvb${node.row.index}${c.scen}`;
        if (hatch) { this.hatchPattern(svg, ns, pid, C.ac); }
        const bar = (val: number, y: number, bh: number, fill: string, stroke: string | null): void => {
            const len = Math.abs(val) * geo.vPpu;
            if (len < 0.4) { return; }
            const rect = document.createElementNS(ns, "rect");
            rect.setAttribute("x", String(val >= 0 ? geo.vAxisX : geo.vAxisX - len));
            rect.setAttribute("y", String(y));
            rect.setAttribute("width", String(Math.max(len, 1)));
            rect.setAttribute("height", String(bh));
            rect.setAttribute("fill", fill);
            if (stroke) { rect.setAttribute("stroke", stroke); rect.setAttribute("stroke-width", "1"); }
            svg.appendChild(rect);
        };
        // reference behind (IBCS comparison: subtrahend behind the minuend)
        if (r != null) {
            const refIsPlan = c.ref === "pl" || c.ref === "plfy";
            bar(r, 1.5, h - 3, refIsPlan ? "#FFF" : C.py, refIsPlan ? C.ac : null);
        }
        // minuend on top, narrower (AC solid / FC hatched)
        if (v != null) {
            const bh = (h - 3) * 0.58;
            const y = (h - bh) / 2;
            bar(v, y, bh, hatch ? `url(#${pid})` : C.ac, hatch ? C.ac : null);
        }
        // structure baseline
        const axis = document.createElementNS(ns, "line");
        axis.setAttribute("x1", String(geo.vAxisX)); axis.setAttribute("x2", String(geo.vAxisX));
        axis.setAttribute("y1", "0"); axis.setAttribute("y2", String(h));
        axis.setAttribute("stroke", C.ac); axis.setAttribute("stroke-width", "1");
        svg.appendChild(axis);
        // AC label outside the longer of both bars, in growth direction
        const lv = v ?? r;
        if (lv != null) {
            const extent = Math.max(Math.abs(v ?? 0), Math.abs(r ?? 0)) * geo.vPpu;
            const txt = document.createElementNS(ns, "text");
            const tx = lv >= 0 ? geo.vAxisX + extent + 3 : geo.vAxisX - extent - 3;
            txt.setAttribute("x", String(tx));
            txt.setAttribute("y", String(h / 2 + geo.fs * 0.32));
            txt.setAttribute("text-anchor", lv >= 0 ? "start" : "end");
            txt.setAttribute("font-size", String(geo.fs - 1));
            txt.setAttribute("font-family", FONT);
            txt.setAttribute("fill", C.text);
            if (isSum) { txt.setAttribute("font-weight", "600"); }
            txt.textContent = fmt.val(v);
            svg.appendChild(txt);
        }
        cell.appendChild(svg);
        return cell;
    }

    private sparkRow(node: PnlNode, colCount: number, geo: { fs: number }): HTMLElement {
        const row = document.createElement("div");
        row.style.cssText = "display:table-row;";
        const lead = this.cell(0, "left", geo.fs);
        lead.style.cssText += "padding:2px 0 4px 24px;";
        const months = this.model!.months;
        const w = 300; const h = 34;
        const ns = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(ns, "svg");
        svg.setAttribute("width", String(w)); svg.setAttribute("height", String(h));
        let min = 0; let max = 0;
        for (const s of ["ac", "py", "fc"] as Scenario[]) {
            for (const v of node.series[s] ?? []) {
                if (v != null) { min = Math.min(min, v); max = Math.max(max, v); }
            }
        }
        if (max === min) { max = min + 1; }
        const X = (i: number): number => 26 + (i / Math.max(months.length - 1, 1)) * (w - 60);
        const Y = (v: number): number => 4 + (1 - (v - min) / (max - min)) * (h - 12);
        const line = (arr: (number | null)[], color: string, dash: string | null, sw: number): void => {
            let d = ""; let pen = false;
            arr.forEach((v, i) => {
                if (v == null) { pen = false; return; }
                d += (pen ? "L" : "M") + X(i).toFixed(1) + "," + Y(v).toFixed(1);
                pen = true;
            });
            if (d === "") { return; }
            const p = document.createElementNS(ns, "path");
            p.setAttribute("d", d); p.setAttribute("fill", "none");
            p.setAttribute("stroke", color); p.setAttribute("stroke-width", String(sw));
            if (dash) { p.setAttribute("stroke-dasharray", dash); }
            svg.appendChild(p);
        };
        if (node.series.py) { line(node.series.py, C.py, null, 1); }
        if (node.series.fc) { line(node.series.fc, C.ac, "3,2", 1.2); }
        if (node.series.ac) { line(node.series.ac, C.ac, null, 1.6); }
        const l0 = document.createElementNS(ns, "text");
        l0.setAttribute("x", "0"); l0.setAttribute("y", String(h / 2));
        l0.setAttribute("font-size", "8"); l0.setAttribute("font-family", FONT); l0.setAttribute("fill", C.soft);
        l0.textContent = this.monthLabel(months[0]);
        const l1 = document.createElementNS(ns, "text");
        l1.setAttribute("x", String(w - 30)); l1.setAttribute("y", String(h / 2));
        l1.setAttribute("font-size", "8"); l1.setAttribute("font-family", FONT); l1.setAttribute("fill", C.soft);
        l1.textContent = this.monthLabel(months[months.length - 1]);
        svg.appendChild(l0); svg.appendChild(l1);
        lead.appendChild(svg);
        row.appendChild(lead);
        for (let i = 0; i < colCount; i++) { row.appendChild(this.cell(0, "left", geo.fs)); }
        return row;
    }

    // ---------------- driver tree (DuPont) ----------------

    /**
     * Auto root: the last formula/KPI row in P&L order whose formula actually
     * references other rows — in a P&L that is the bottom-line ratio
     * (net margin, ROI …), the natural top of a driver tree.
     */
    private treeDefaultRoot(resolve: (id: string) => PnlNode | undefined): PnlNode | null {
        let best: PnlNode | null = null;
        for (const node of this.model!.byId.values()) {
            const t = node.row.rowType;
            if (t !== "formula" && t !== "kpi") { continue; }
            if (formulaOperands(node, resolve).length === 0) { continue; }
            if (best == null || node.row.sort > best.row.sort
                || (node.row.sort === best.row.sort && node.row.index > best.row.index)) { best = node; }
        }
        return best;
    }

    /** row id or unique row name → node (same resolution the formulas use) */
    private treeLookup(key: string | null | undefined, resolve: (id: string) => PnlNode | undefined): PnlNode | null {
        const k = (key ?? "").trim();
        if (k === "") { return null; }
        return resolve(k) ?? null;
    }

    /**
     * Expand a node into cards. A card branches in exactly one way: a formula /
     * KPI row along its operands (operator ×÷+− at the branch point), any other
     * row along its account hierarchy (subtotals and posted accounts), where the
     * branch operator is the child's sign convention — "+" for income, "−" for
     * cost rows, so the branch reads as "revenue − cost".
     *
     * Cycles and repeated refs on the same path are cut. No depth limit —
     * readers fold subtrees away themselves — but a card budget keeps a
     * pathological diamond graph or a very deep hierarchy bounded. The budget
     * is spent in LEVEL ORDER, so a large tree loses its deepest level
     * uniformly — never whole limbs after one deep first branch. Branches the
     * budget could not build are counted in `moreKids` (rendered as "+N",
     * re-rooting the card restores them with a fresh budget).
     */
    private treeCards(root: PnlNode, resolve: (id: string) => PnlNode | undefined): TreeCard {
        let budget = TREE_MAX_CARDS;
        const mk = (node: PnlNode, op: FormulaOp | null, depth: number): TreeCard => ({
            node, op, depth, children: [], x: 0, y: 0, h: TREE_CARD_H, compact: false,
            hasKids: false, moreKids: 0, collapsed: false, drill: false,
        });
        const branches = (card: TreeCard, path: ReadonlySet<string>): { child: PnlNode; op: FormulaOp }[] => {
            const t = card.node.row.rowType;
            if (t === "separator") { return []; }
            const seen = new Set(path);
            const kids: { child: PnlNode; op: FormulaOp }[] = [];
            if (t === "formula" || t === "kpi") {
                for (const o of formulaOperands(card.node, resolve)) {
                    const id = o.child.row.id;
                    if (seen.has(id)) { continue; }
                    seen.add(id);
                    kids.push(o);
                }
            } else {
                card.drill = true;
                for (const child of card.node.children) {
                    const id = child.row.id;
                    if (child.row.rowType === "separator" || seen.has(id)) { continue; }
                    seen.add(id);
                    kids.push({ child, op: child.row.sign === -1 ? "−" : "+" });
                }
            }
            return kids;
        };
        const rootCard = mk(root, null, 0);
        const queue: { card: TreeCard; path: ReadonlySet<string> }[] =
            [{ card: rootCard, path: new Set([root.row.id]) }];
        let head = 0;
        while (head < queue.length) {
            const { card, path } = queue[head++];
            const kids = branches(card, path);
            card.hasKids = kids.length > 0;
            if (!card.hasKids) { card.drill = false; continue; }
            for (const o of kids) {
                if (budget <= 0) { card.moreKids++; continue; }
                budget--;
                const k = mk(o.child, o.op, card.depth + 1);
                card.children.push(k);
                queue.push({ card: k, path: new Set([...path, o.child.row.id]) });
            }
        }
        return rootCard;
    }

    /** every card of a (sub)tree in reading order */
    private treeCollect(card: TreeCard): TreeCard[] {
        const out: TreeCard[] = [];
        const walk = (c: TreeCard): void => { out.push(c); for (const k of c.children) { walk(k); } };
        walk(card);
        return out;
    }

    /** fold the subtrees the reader closed: children go, the chevron stays */
    private treePrune(card: TreeCard, collapsed: ReadonlySet<string>): void {
        if (card.hasKids && collapsed.has(card.node.row.id)) {
            card.collapsed = true;
            card.children = [];
            return;
        }
        for (const k of card.children) { this.treePrune(k, collapsed); }
    }

    /**
     * Graph context of the current render: the expanded formula graph, the
     * collapse sets per depth level, the pruned tree and the breadcrumb from
     * the author/auto root down to the re-rooted card.
     */
    private buildTreeCtx(): TreeCtx | null {
        const model = this.model!; const ui = this.ui!;
        const resolve = nodeResolver(model);
        const home = this.treeLookup(this.settings.columnsCard.treeRoot.value, resolve)
            ?? this.treeDefaultRoot(resolve);
        const picked = this.treeLookup(ui.treeRoot, resolve);
        const root = picked ?? home;
        if (!root) { return null; }

        const rootCard = this.treeCards(root, resolve);
        const full = this.treeCollect(rootCard);
        let depth = 1;
        for (const c of full) { depth = Math.max(depth, c.depth + 1); }
        // levels[n] = subtrees to fold so that n levels stay visible — only
        // branches that were actually built (budget) are worth folding
        const levels: string[][] = [];
        for (let l = 0; l <= depth; l++) {
            levels.push(full.filter(c => c.children.length > 0 && c.depth + 1 >= Math.max(l, 1))
                .map(c => c.node.row.id));
        }
        // full graph adjacency, so "expand" can open a whole limb at once
        const kidsOf = new Map<string, string[]>();
        for (const c of full) {
            if (c.children.length === 0) { continue; }
            const list = kidsOf.get(c.node.row.id) ?? [];
            for (const k of c.children) { list.push(k.node.row.id); }
            kidsOf.set(c.node.row.id, list);
        }
        // untouched default: the WHOLE tree (bounded by the card budget) —
        // the author can pin a start depth in the format pane instead
        const authorLvl = Math.round(Number(this.settings.columnsCard.treeLevel.value) || 0);
        const auto = authorLvl >= 1 ? levels[Math.min(authorLvl, depth)] : [];
        const collapsed = ui.treeCollapsed ?? auto;
        this.treePrune(rootCard, new Set(collapsed));

        // breadcrumb: path through the formula graph from home to the picked root
        let path: PnlNode[] = [];
        if (picked && home && picked !== home) {
            const homeCard = this.treeCards(home, resolve);
            const chain: PnlNode[] = [];
            const find = (c: TreeCard): boolean => {
                chain.push(c.node);
                if (c.node === picked) { return true; }
                for (const k of c.children) { if (find(k)) { return true; } }
                chain.pop();
                return false;
            };
            path = find(homeCard) ? chain : [home, picked];
        }

        return {
            resolve, home, picked, root, rootCard, cards: this.treeCollect(rootCard),
            depth, levels, auto, kidsOf, path,
        };
    }

    /** move a whole subtree down (tidy-layout correction pass) */
    private treeShift(c: TreeCard, dy: number): void {
        c.y += dy;
        for (const k of c.children) { this.treeShift(k, dy); }
    }

    /**
     * Tidy tree layout (Reingold–Tilford in its simplified, post-order form):
     * one column per level (x = level × (card + column gap)), the leaves of a
     * subtree get consecutive y slots top to bottom, and every parent lands
     * exactly on the vertical centre of its own children block. Two adjacent
     * sibling subtrees are separated by the larger subtree gap (a pair of
     * leaves only by the leaf gap), so several levels opened at once fan out as
     * distinct limbs instead of merging into one column of cards.
     *
     * Card heights may differ per level (compact cards), so a parent that is
     * taller than its children block is not allowed to grow into the limb above
     * it: the block is pushed down instead.
     */
    private treeLayout(root: TreeCard, cw: number, gx: number, gy: number,
        sub: number): { w: number; h: number } {
        let maxDepth = 0;
        /** places the subtree of `c` starting at `top`, returns its lower edge */
        const place = (c: TreeCard, top: number): number => {
            c.x = c.depth * (cw + gx);
            maxDepth = Math.max(maxDepth, c.depth);
            if (c.children.length === 0) { c.y = top; return top + c.h; }
            let y = top;
            c.children.forEach((k, i) => {
                if (i > 0) {
                    // one of the two neighbours branches ⇒ the wider subtree gap
                    const limb = k.children.length > 0 || c.children[i - 1].children.length > 0;
                    y += limb ? sub : gy;
                }
                y = place(k, y);
            });
            const first = c.children[0];
            const last = c.children[c.children.length - 1];
            c.y = (first.y + last.y + last.h) / 2 - c.h / 2;
            if (c.y < top) {
                // parent taller than its block — push the block down, never up
                const dy = top - c.y;
                for (const k of c.children) { this.treeShift(k, dy); }
                c.y = top;
                y += dy;
            }
            return Math.max(y, c.y + c.h);
        };
        const h = place(root, 0);
        return { w: (maxDepth + 1) * cw + maxDepth * gx, h: Math.max(h, root.h) };
    }

    /** chart number per IBCS UN 1: at most three digits, unit carried by the card label */
    private treeNum(v: number, fmt: Fmt): string {
        const scaled = v / fmt.div;
        const a = Math.abs(scaled);
        const dec = a >= 100 ? 0 : a >= 10 ? 1 : 2;
        const nf = new Intl.NumberFormat(this.locale, { minimumFractionDigits: dec, maximumFractionDigits: dec });
        return nf.formatToParts(scaled).map(p => (p.type === "group" ? NBSP_GROUP : p.value)).join("");
    }

    private fitLabel(s: string, maxW: number, fs: number): string {
        const per = fs * 0.56;
        const max = Math.max(1, Math.floor(maxW / per));
        return s.length <= max ? s : s.slice(0, Math.max(1, max - 1)) + "…";
    }

    /**
     * The two reference scenarios of a card chart in priority order: the
     * toolbar reference first (it stays the one the Δ marks talk about), the
     * remaining comparison scenario second. The first becomes the offset
     * reference column, the second the scenario triangle (IBCS UN 4.1).
     * `fy` allows the full-year plan as a stand-in when no monthly PL exists.
     */
    private treeRefScenarios(fy: boolean): Scenario[] {
        const pool: Scenario[] = this.ui!.ref === "py" ? ["py", "pl"] : ["pl", "py"];
        const out: Scenario[] = [];
        for (const s of pool) {
            if (this.has[s]) { out.push(s); }
            else if (s === "pl" && fy && this.has.plfy) { out.push("plfy"); }
        }
        return out;
    }

    /**
     * Monthly columns of a card: the AC (or FC) column per month, the reference
     * column of the same month behind it, and the second scenario as a triangle.
     * Without monthly data one overlapped scenario group stands in for the year.
     */
    private treeSeries(node: PnlNode): TreeSeries {
        const inv = node.row.displayInvert ? -1 : 1;
        const months = this.model!.months;
        const ac = node.series.ac; const fc = node.series.fc;
        const slots: TreeSlot[] = [];
        if (months.length > 1 && (ac || fc)) {
            const scens = this.treeRefScenarios(false);
            const r1 = scens[0] ? node.series[scens[0]] : undefined;
            const r2 = scens[1] ? node.series[scens[1]] : undefined;
            const n = months.length;
            let anyFc = false;
            for (let i = 0; i < n; i++) {
                const a = ac ? ac[i] : null;
                const f = fc ? fc[i] : null;
                // AC&FC composite: the forecast fills the months the actuals have not reached
                const raw = a != null ? a : f;
                const isFc = a == null && f != null;
                if (isFc) { anyFc = true; }
                const p = r1 ? r1[i] : null;
                const q = r2 ? r2[i] : null;
                slots.push({
                    v: raw == null ? null : raw * inv,
                    ref: p == null ? null : p * inv,
                    ref2: q == null ? null : q * inv,
                    style: isFc ? "fc" : "ac",
                    tag: null,
                    label: false,
                });
            }
            const refScen: Scenario | "" = slots.some(sl => sl.ref != null) ? scens[0] : "";
            const ref2Scen: Scenario | "" = slots.some(sl => sl.ref2 != null) ? scens[1] : "";
            // period labels only at the ends of the series (IBCS UN 2.3)
            const front = anyFc ? "AC&FC" : "AC";
            const scen = [front, refScen.toUpperCase(), ref2Scen.toUpperCase()]
                .filter(t => t !== "").join("·");
            slots[0].tag = `${this.monthLabel(months[0])} ${front}`;
            slots[n - 1].tag = `${this.monthLabel(months[n - 1])} ${scen}`;
            // value labels only at first, last and the absolute extremum (max 3)
            const marked = new Set<number>([0, n - 1]);
            let ext = -1; let extAbs = -1;
            slots.forEach((sl, i) => {
                if (sl.v == null) { return; }
                if (Math.abs(sl.v) > extAbs) { extAbs = Math.abs(sl.v); ext = i; }
            });
            if (ext > 1 && ext < n - 2) { marked.add(ext); }
            for (const i of marked) { slots[i].label = true; }
            return { slots, refScen, ref2Scen };
        }
        // no periods loaded: one overlapped scenario group for the whole span
        const scens = this.treeRefScenarios(true);
        const acv = displayValue(node, "ac");
        const r1v = scens[0] ? displayValue(node, scens[0]) : null;
        const r2v = scens[1] ? displayValue(node, scens[1]) : null;
        if (acv == null && r1v == null && r2v == null) { return { slots: [], refScen: "", ref2Scen: "" }; }
        const refScen: Scenario | "" = r1v == null ? "" : scens[0];
        const ref2Scen: Scenario | "" = r2v == null ? "" : scens[1];
        const tag = ["AC", refScen.toUpperCase(), ref2Scen.toUpperCase()]
            .filter(t => t !== "").join("·");
        slots.push({ v: acv, ref: r1v, ref2: r2v, style: "ac", tag, label: true });
        return { slots, refScen, ref2Scen };
    }

    /** hatch fill for FC elements inside the tree (one pattern per rendered tree) */
    private treeHatchId(svg: SVGSVGElement): string {
        const id = `pnltreefc${this.uid}`;
        if (!svg.querySelector(`#${id}`)) {
            const ns = "http://www.w3.org/2000/svg";
            this.hatchPattern(svg, ns, id, C.ac);
        }
        return id;
    }

    /** reference-coded zero line of a card chart: gray = PY, double line = PL, dashed = FC */
    private treeRefLine(g: SVGGElement, x1: number, x2: number, y: number, ref: Scenario): void {
        const ns = "http://www.w3.org/2000/svg";
        const mk = (yy: number, color: string, wd: number, dash: string | null): void => {
            const l = document.createElementNS(ns, "line");
            l.setAttribute("x1", x1.toFixed(2)); l.setAttribute("x2", x2.toFixed(2));
            l.setAttribute("y1", yy.toFixed(2)); l.setAttribute("y2", yy.toFixed(2));
            l.setAttribute("stroke", color); l.setAttribute("stroke-width", String(wd));
            if (dash) { l.setAttribute("stroke-dasharray", dash); }
            g.appendChild(l);
        };
        if (ref === "py") { mk(y, C.py, 2, null); }
        else if (ref === "pl" || ref === "plfy") { mk(y - 1.1, C.ac, 0.9, null); mk(y + 1.1, C.ac, 0.9, null); }
        else { mk(y, C.ac, 1, "3,2"); }
    }

    /** small soft note inside a card chart when a mode has nothing to draw */
    private treeHint(g: SVGGElement, box: { x: number; y: number; w: number; h: number }, s: number, text: string): void {
        const ns = "http://www.w3.org/2000/svg";
        const t = document.createElementNS(ns, "text");
        t.setAttribute("x", (box.x + box.w / 2).toFixed(2));
        t.setAttribute("y", (box.y + box.h / 2).toFixed(2));
        t.setAttribute("text-anchor", "middle");
        t.setAttribute("font-size", (7.5 * s).toFixed(1));
        t.setAttribute("font-family", FONT);
        t.setAttribute("fill", C.soft);
        t.textContent = this.fitLabel(text, box.w, 7.5 * s);
        g.appendChild(t);
    }

    /** value/period label of a card chart, clamped into the chart box */
    private treeLabel(g: SVGGElement, box: { x: number; w: number }, cx: number, y: number,
        text: string, fs: number, color: string): void {
        const ns = "http://www.w3.org/2000/svg";
        const t = document.createElementNS(ns, "text");
        const half = text.length * fs * 0.3;
        const x = Math.min(Math.max(cx, box.x + half), box.x + box.w - half);
        t.setAttribute("x", x.toFixed(2)); t.setAttribute("y", y.toFixed(2));
        t.setAttribute("text-anchor", "middle");
        t.setAttribute("font-size", fs.toFixed(1));
        t.setAttribute("font-family", FONT);
        t.setAttribute("fill", color);
        t.textContent = text;
        g.appendChild(t);
    }

    /** period/scenario tags under a card chart: first one left, last one right */
    private treeTags(g: SVGGElement, tags: (string | null)[], box: { x: number; y: number; w: number; h: number },
        slotW: number, s: number, rightInset: number): void {
        const ns = "http://www.w3.org/2000/svg";
        const n = tags.length;
        const tfs = 7 * s;
        const y = box.y + box.h + 8 * s;
        tags.forEach((tag, i) => {
            if (!tag) { return; }
            const first = i === 0;
            const t = document.createElementNS(ns, "text");
            const wide = n <= 4;
            const maxW = wide ? slotW : box.w * 0.5 - (first ? 0 : rightInset);
            if (wide) {
                t.setAttribute("x", (box.x + (i + 0.5) * slotW).toFixed(2));
                t.setAttribute("text-anchor", "middle");
            } else {
                t.setAttribute("x", (first ? box.x : box.x + box.w - rightInset).toFixed(2));
                t.setAttribute("text-anchor", first ? "start" : "end");
            }
            t.setAttribute("y", y.toFixed(2));
            t.setAttribute("font-size", tfs.toFixed(1));
            t.setAttribute("font-family", FONT);
            t.setAttribute("fill", C.soft);
            t.textContent = this.fitLabel(tag, maxW, tfs);
            g.appendChild(t);
        });
    }

    /** scenario fill of a reference element: PY solid gray, PL outlined, FC hatched */
    private treeScenFill(scen: Scenario, hatch: string): { fill: string; stroke: string | null } {
        if (scen === "py") { return { fill: C.refGray, stroke: null }; }
        if (scen === "fc" || scen === "fcfy") { return { fill: `url(#${hatch})`, stroke: C.ac }; }
        return { fill: "#FFF", stroke: C.ac };
    }

    /**
     * IBCS mini column chart inside a card, overlapped-group notation (UN 4.1):
     * the reference column sits *behind* the AC column, a touch wider and offset
     * to the right by ~40 % of a column width, so both scenarios stay readable;
     * AC solid in front, FC months hatched. A second scenario is not given a
     * third column but a small triangle carrying its scenario fill, pointing at
     * the column at the height of its value.
     *
     * Solid zero line, no gridlines. Against the crowding of many months only
     * three value labels are drawn — first, last and the absolute extremum —
     * and only the outer periods carry a tag.
     */
    private treeMini(g: SVGGElement, node: PnlNode, box: { x: number; y: number; w: number; h: number },
        s: number, fmt: Fmt, svg: SVGSVGElement, rightInset: number): void {
        const ns = "http://www.w3.org/2000/svg";
        const series = this.treeSeries(node);
        const slots = series.slots;
        if (slots.length === 0) { this.treeHint(g, box, s, "–"); return; }
        const isRatio = node.row.rowType === "kpi";
        const lfs = 7.5 * s;
        let min = 0; let max = 0;
        for (const sl of slots) {
            for (const v of [sl.v, sl.ref, sl.ref2]) {
                if (v == null) { continue; }
                min = Math.min(min, v); max = Math.max(max, v);
            }
        }
        if (max === min) { max = min + 1; }
        const top = box.y + lfs + 2;
        const bot = box.y + box.h - (min < 0 ? lfs + 2 : 0);
        const yOf = (v: number): number => bot - ((v - min) / (max - min)) * (bot - top);
        const zeroY = yOf(0);

        const rect = (x: number, w: number, v: number, fill: string, stroke: string | null, sw: number): void => {
            const y = Math.min(yOf(v), zeroY);
            const h = Math.max(Math.abs(yOf(v) - zeroY), 0.8);
            const r = document.createElementNS(ns, "rect");
            r.setAttribute("x", x.toFixed(2)); r.setAttribute("y", y.toFixed(2));
            r.setAttribute("width", w.toFixed(2)); r.setAttribute("height", h.toFixed(2));
            r.setAttribute("fill", fill);
            if (stroke) { r.setAttribute("stroke", stroke); r.setAttribute("stroke-width", String(sw)); }
            g.appendChild(r);
        };

        const n = slots.length;
        const paired = series.refScen !== "";
        const tri = TREE_TRI * s;
        const triangles = series.ref2Scen !== "";
        // the triangles of the last period need a strip of their own, otherwise
        // they would be pushed back onto the column they point at
        const slotW = (box.w - (triangles ? tri + 1.5 * s : 0)) / n;
        // column width from the card width: the gap keeps at least 40 % of the
        // widest column (55 % where a triangle needs room to its right), so many
        // months stay legible instead of merging
        const colW = triangles ? Math.min(slotW / 1.75, 15 * s) : Math.min(slotW / 1.5, 17 * s);
        // offset notation: AC left and narrow, the reference behind it, wider
        // and shifted right; the pair stays centred inside its slot
        const acW = paired ? colW * 0.60 : colW;
        const refW = acW * 1.25;
        const dx = paired ? acW * 0.40 : 0;
        const needHatch = slots.some(sl => sl.style === "fc")
            || series.refScen === "fc" || series.ref2Scen === "fc";
        const hatch = needHatch ? this.treeHatchId(svg) : "";

        slots.forEach((sl, i) => {
            const cx = box.x + (i + 0.5) * slotW;
            const acCx = cx - dx / 2;
            const refCx = cx + dx / 2;
            // reference behind, wider and offset — IBCS overlapped grouped columns
            if (sl.ref != null && series.refScen !== "") {
                const st = this.treeScenFill(series.refScen, hatch);
                rect(refCx - refW / 2, refW, sl.ref, st.fill, st.stroke, 1.2);
            }
            if (sl.v != null) {
                if (sl.style === "fc") { rect(acCx - acW / 2, acW, sl.v, `url(#${hatch})`, C.ac, 1); }
                else { rect(acCx - acW / 2, acW, sl.v, C.ac, null, 0); }
            }
            // scenario triangle for the second reference (IBCS UN 4.1)
            if (sl.ref2 != null && series.ref2Scen !== "") {
                const st = this.treeScenFill(series.ref2Scen, hatch);
                const ty = yOf(sl.ref2);
                const tx = Math.min(refCx + refW / 2 + 1.2 * s, box.x + box.w - tri);
                const p = document.createElementNS(ns, "path");
                p.setAttribute("d", `M${tx.toFixed(2)},${ty.toFixed(2)}`
                    + `L${(tx + tri).toFixed(2)},${(ty - tri * 0.62).toFixed(2)}`
                    + `L${(tx + tri).toFixed(2)},${(ty + tri * 0.62).toFixed(2)}Z`);
                p.setAttribute("fill", st.fill);
                p.setAttribute("stroke", st.stroke ?? C.refGray);
                p.setAttribute("stroke-width", "0.8");
                const tt = document.createElementNS(ns, "title");
                tt.textContent = `${series.ref2Scen.toUpperCase()} `
                    + (isRatio ? fmt.pct(sl.ref2) : this.treeNum(sl.ref2, fmt));
                p.appendChild(tt);
                g.appendChild(p);
            }
            if (sl.v != null && sl.label) {
                this.treeLabel(g, box, acCx, sl.v >= 0 ? yOf(sl.v) - 2.5 : yOf(sl.v) + lfs,
                    isRatio ? fmt.pct(sl.v) : this.treeNum(sl.v, fmt), lfs, C.text);
            }
        });

        // zero line last so the columns sit on it
        const axis = document.createElementNS(ns, "line");
        axis.setAttribute("x1", box.x.toFixed(2)); axis.setAttribute("x2", (box.x + box.w).toFixed(2));
        axis.setAttribute("y1", zeroY.toFixed(2)); axis.setAttribute("y2", zeroY.toFixed(2));
        axis.setAttribute("stroke", C.ac); axis.setAttribute("stroke-width", "1");
        g.appendChild(axis);

        this.treeTags(g, slots.map(sl => sl.tag), box, slotW, s, rightInset);
    }

    /**
     * IBCS variance columns inside a card: Δ = AC − reference per month, green /
     * red by impact, the zero line encodes the reference scenario. Only the one
     * or two largest swings carry a label, positives keep their explicit "+".
     */
    private treeMiniDelta(g: SVGGElement, node: PnlNode, box: { x: number; y: number; w: number; h: number },
        s: number, fmt: Fmt, rightInset: number): void {
        const ref = this.ui!.ref;
        const months = this.model!.months;
        const isRatio = node.row.rowType === "kpi";
        const lfs = 7.5 * s;
        const refLabel = "Δ" + ref.toUpperCase();
        const acs = node.series.ac; const refs = node.series[ref];
        const inv = node.row.displayInvert ? -1 : 1;
        // bar direction follows the displayed value, colour the raw evaluation
        const goodOf = (raw: number): boolean =>
            node.row.varianceInvert ? !(raw >= 0) : raw >= 0;
        const vals: (number | null)[] = [];
        const goods: boolean[] = [];
        const tags: (string | null)[] = [];
        if (this.has[ref] && months.length > 1 && acs && refs) {
            for (let i = 0; i < months.length; i++) {
                const a = acs[i]; const r = refs[i];
                const raw = a != null && r != null ? a - r : null;
                vals.push(raw == null ? null : raw * inv);
                goods.push(raw != null && goodOf(raw));
                tags.push(null);
            }
            tags[0] = this.monthLabel(months[0]);
            tags[months.length - 1] = `${this.monthLabel(months[months.length - 1])} ${refLabel}`;
        }
        if (vals.every(v => v == null)) {
            // no monthly reference series — fall back to the year-to-date variance
            const v = this.treeVariance(node);
            if (!v || v.delta == null) { this.treeHint(g, box, s, refLabel + " –"); return; }
            vals.length = 0; tags.length = 0; goods.length = 0;
            vals.push(v.delta);
            goods.push(v.good);
            tags.push(months.length > 0
                ? `_${this.monthLabel(months[months.length - 1])} ${refLabel}` : refLabel);
        }

        let min = 0; let max = 0;
        for (const v of vals) {
            if (v == null) { continue; }
            min = Math.min(min, v); max = Math.max(max, v);
        }
        if (max === min) { max = min + 1; }
        const top = box.y + lfs + 2;
        const bot = box.y + box.h - (min < 0 ? lfs + 2 : 0);
        const yOf = (v: number): number => bot - ((v - min) / (max - min)) * (bot - top);
        const zeroY = yOf(0);

        // label the one or two biggest swings only, and never two neighbours —
        // adjacent labels are exactly the crowding this mode avoids
        const order = vals.map((v, i) => ({ v, i })).filter(e => e.v != null)
            .sort((a, b) => Math.abs(b.v!) - Math.abs(a.v!));
        const marked = new Set<number>();
        for (const e of order) {
            if (marked.size >= 2) { break; }
            if ([...marked].some(i => Math.abs(i - e.i) < 2)) { continue; }
            marked.add(e.i);
        }

        const ns = "http://www.w3.org/2000/svg";
        const n = vals.length;
        const slotW = box.w / n;
        const colW = Math.min(slotW / 1.45, 18 * s);
        vals.forEach((d, i) => {
            if (d == null) { return; }
            const color = goods[i] ? this.goodColor() : this.badColor();
            const cx = box.x + (i + 0.5) * slotW;
            const y = Math.min(yOf(d), zeroY);
            const h = Math.max(Math.abs(yOf(d) - zeroY), 0.8);
            const r = document.createElementNS(ns, "rect");
            r.setAttribute("x", (cx - colW / 2).toFixed(2)); r.setAttribute("y", y.toFixed(2));
            r.setAttribute("width", colW.toFixed(2)); r.setAttribute("height", h.toFixed(2));
            r.setAttribute("fill", color);
            g.appendChild(r);
            if (!marked.has(i)) { return; }
            const txt = isRatio
                ? fmt.pct(d, true).replace("%", "pp")
                : (d > 0 ? "+" : "") + this.treeNum(d, fmt);
            this.treeLabel(g, box, cx, d >= 0 ? yOf(d) - 2.5 : yOf(d) + lfs, txt, lfs, color);
        });

        // the axis carries the reference scenario (IBCS UN 4.1)
        this.treeRefLine(g, box.x, box.x + box.w, zeroY, ref);
        this.treeTags(g, tags, box, slotW, s, rightInset);
    }

    /**
     * Horizontal mini bridge inside a card (year to date): reference bar →
     * floating Δ segment → AC bar, in the optics of the IBCS KPI card. No axes,
     * no gridlines — only the zero anchor and the three labelled rows.
     */
    private treeMiniBridge(g: SVGGElement, node: PnlNode, box: { x: number; y: number; w: number; h: number },
        s: number, fmt: Fmt, svg: SVGSVGElement, rightInset: number): void {
        const ns = "http://www.w3.org/2000/svg";
        const ref = this.ui!.ref;
        const isRatio = node.row.rowType === "kpi";
        const acv = displayValue(node, "ac");
        const refv = this.has[ref] ? displayValue(node, ref) : null;
        if (acv == null && refv == null) { this.treeHint(g, box, s, "–"); return; }
        const lfs = 7.5 * s;
        const num = (v: number, plus: boolean): string =>
            isRatio ? fmt.pct(v, plus) : (plus && v > 0 ? "+" : "") + this.treeNum(v, fmt);

        const va = this.treeVariance(node);
        const dRaw = va != null && acv != null && refv != null ? va.delta : null;
        const vColor = va == null || va.good ? this.goodColor() : this.badColor();

        // ratios vary in percentage points (IBCS UN 4.1)
        const dText = dRaw == null ? ""
            : isRatio ? fmt.pct(dRaw, true).replace("%", "pp") : num(dRaw, true);
        const texts = [refv != null ? num(refv, false) : "", dText, acv != null ? num(acv, false) : ""];
        const valW = Math.max(...texts.map(t => t.length)) * lfs * 0.58 + 3 * s;
        const labW = 14 * s;
        const x0 = box.x + labW;
        const availW = Math.max(box.w - labW - valW - rightInset, 8 * s);
        const lo = Math.min(0, acv ?? 0, refv ?? 0);
        const hi = Math.max(0, acv ?? 0, refv ?? 0);
        const S = availW / ((hi - lo) || 1);
        const xz = x0 + (0 - lo) * S;
        const xOf = (v: number): number => xz + v * S;

        const rows = refv != null ? 3 : 1;
        const gapY = 4 * s;
        const rowH = Math.max((box.h - (rows - 1) * gapY) / rows, 4 * s);
        const yR = box.y;
        const yD = box.y + rowH + gapY;
        const yA = refv != null ? box.y + 2 * (rowH + gapY) : box.y + (box.h - rowH) / 2;

        const bar = (y: number, v: number, fill: string, stroke: string | null): void => {
            const x1 = xOf(v); const x = Math.min(xz, x1);
            const r = document.createElementNS(ns, "rect");
            r.setAttribute("x", x.toFixed(2)); r.setAttribute("y", y.toFixed(2));
            r.setAttribute("width", Math.max(Math.abs(x1 - xz), 1).toFixed(2));
            r.setAttribute("height", rowH.toFixed(2));
            r.setAttribute("fill", fill);
            if (stroke) { r.setAttribute("stroke", stroke); r.setAttribute("stroke-width", "1"); }
            g.appendChild(r);
        };
        const connector = (x: number, y1: number, y2: number): void => {
            const l = document.createElementNS(ns, "line");
            l.setAttribute("x1", x.toFixed(2)); l.setAttribute("x2", x.toFixed(2));
            l.setAttribute("y1", y1.toFixed(2)); l.setAttribute("y2", y2.toFixed(2));
            l.setAttribute("stroke", C.gridSoft); l.setAttribute("stroke-width", "1");
            g.appendChild(l);
        };
        const rowLabel = (y: number, text: string, color: string, bold: boolean): void => {
            const t = document.createElementNS(ns, "text");
            t.setAttribute("x", box.x.toFixed(2));
            t.setAttribute("y", (y + rowH / 2 + lfs * 0.35).toFixed(2));
            t.setAttribute("font-size", lfs.toFixed(1));
            t.setAttribute("font-family", FONT);
            if (bold) { t.setAttribute("font-weight", "600"); }
            t.setAttribute("fill", color);
            t.textContent = this.fitLabel(text, labW, lfs);
            g.appendChild(t);
        };
        const valLabel = (y: number, v: number, text: string, color: string, bold: boolean): void => {
            const t = document.createElementNS(ns, "text");
            const grow = v >= 0;
            t.setAttribute("x", (grow ? xOf(v) + 2.5 * s : xOf(v) - 2.5 * s).toFixed(2));
            t.setAttribute("y", (y + rowH / 2 + lfs * 0.35).toFixed(2));
            t.setAttribute("text-anchor", grow ? "start" : "end");
            t.setAttribute("font-size", lfs.toFixed(1));
            t.setAttribute("font-family", FONT);
            if (bold) { t.setAttribute("font-weight", "600"); }
            t.setAttribute("fill", color);
            t.textContent = text;
            g.appendChild(t);
        };

        // zero anchor (no axis, no gridlines — just the line the bars start on)
        connector(xz, box.y, box.y + box.h);

        if (refv != null) {
            const isPlan = ref === "pl";
            const isFc = ref === "fc";
            const fill = isPlan ? "#FFF" : isFc ? `url(#${this.treeHatchId(svg)})` : C.py;
            bar(yR, refv, fill, isPlan || isFc ? C.ac : null);
            rowLabel(yR, ref.toUpperCase(), C.soft, false);
            valLabel(yR, refv, texts[0], C.soft, false);
        }
        if (dRaw != null && acv != null && refv != null) {
            const xa = xOf(acv); const xr = xOf(refv);
            const x = Math.min(xa, xr);
            const w = Math.max(Math.abs(xa - xr), 2);
            const r = document.createElementNS(ns, "rect");
            r.setAttribute("x", x.toFixed(2)); r.setAttribute("y", yD.toFixed(2));
            r.setAttribute("width", w.toFixed(2)); r.setAttribute("height", rowH.toFixed(2));
            r.setAttribute("fill", vColor);
            g.appendChild(r);
            connector(xr, yR + rowH, yD);
            connector(xa, yD + rowH, yA);
            rowLabel(yD, "Δ", vColor, true);
            const grow = xa >= xr;
            const t = document.createElementNS(ns, "text");
            t.setAttribute("x", (grow ? x + w + 2.5 * s : x - 2.5 * s).toFixed(2));
            t.setAttribute("y", (yD + rowH / 2 + lfs * 0.35).toFixed(2));
            t.setAttribute("text-anchor", grow ? "start" : "end");
            t.setAttribute("font-size", lfs.toFixed(1));
            t.setAttribute("font-family", FONT);
            t.setAttribute("fill", vColor);
            t.textContent = texts[1];
            g.appendChild(t);
        }
        if (acv != null) {
            bar(yA, acv, C.ac, null);
            rowLabel(yA, "AC", C.text, true);
            valLabel(yA, acv, texts[2], C.text, true);
        }
    }

    /**
     * Δ of a driver card against the toolbar reference — null when neutral.
     * Geometry and sign follow the *displayed* value (a cost row shown as +119
     * rises when its Δ is positive), the good/bad evaluation stays the raw one
     * the table uses, so colour and table never contradict each other.
     */
    private treeVariance(node: PnlNode): Variance | null {
        const ref = this.ui!.ref;
        if (!this.has[ref]) { return null; }
        const v = variance(node, ref, "ac");
        if (v.delta == null) { return null; }
        const inv = node.row.displayInvert ? -1 : 1;
        return { delta: v.delta * inv, deltaPct: v.deltaPct == null ? null : v.deltaPct * inv, good: v.good };
    }

    /**
     * Tooltip of a compact card: the monthly series the mini chart would have
     * drawn, so folding the chart away never loses the numbers.
     */
    private treeMonthsTip(node: PnlNode, fmt: Fmt): string {
        const months = this.model!.months;
        const isRatio = node.row.rowType === "kpi";
        const inv = node.row.displayInvert ? -1 : 1;
        const num = (v: number): string => isRatio ? fmt.pct(v) : this.treeNum(v, fmt);
        const parts: string[] = [];
        const ac = node.series.ac; const fc = node.series.fc;
        for (let i = 0; i < months.length; i++) {
            const a = ac ? ac[i] : null;
            const f = fc ? fc[i] : null;
            const raw = a != null ? a : f;
            if (raw == null) { continue; }
            parts.push(`${this.monthLabel(months[i])} ${num(raw * inv)}`
                + (a == null ? " FC" : ""));
        }
        if (parts.length === 0) {
            const v = displayValue(node, "ac");
            if (v != null) { parts.push("AC " + num(v)); }
        }
        return parts.length === 0 ? "" : "AC · " + parts.join(" · ");
    }

    /** one driver card: white box, header, mini chart, chevron and re-root marks */
    private treeCardG(card: TreeCard, geo: { cw: number; s: number; fmt: Fmt; svg: SVGSVGElement },
        reroot: boolean): SVGGElement {
        const ns = "http://www.w3.org/2000/svg";
        const ui = this.ui!;
        const s = geo.s;
        const cardH = card.h;
        const g = document.createElementNS(ns, "g") as SVGGElement;
        const box = document.createElementNS(ns, "rect");
        box.setAttribute("x", card.x.toFixed(2)); box.setAttribute("y", card.y.toFixed(2));
        box.setAttribute("width", geo.cw.toFixed(2)); box.setAttribute("height", cardH.toFixed(2));
        box.setAttribute("rx", "4"); box.setAttribute("fill", "#FFF");
        box.setAttribute("stroke", C.cardEdge); box.setAttribute("stroke-width", "1");
        g.appendChild(box);

        const pad = (card.compact ? 6 : 8) * s;
        const isRatio = card.node.row.rowType === "kpi";
        const unit = isRatio ? "%" : geo.fmt.suffix + this.settings.numbersCard.unitText.value;
        const tfs = 9.5 * s; const ufs = 7.5 * s;
        const headY = card.y + pad + tfs * 0.85;

        // status indicator: 3 px edge + Δ% in the header, both in the variance
        // colour — the card body itself stays white (IBCS)
        const va = ui.treeStatus ? this.treeVariance(card.node) : null;
        const vColor = va == null ? null : (va.good ? this.goodColor() : this.badColor());
        if (vColor) {
            const edge = document.createElementNS(ns, "rect");
            edge.setAttribute("x", (card.x + 0.5).toFixed(2));
            edge.setAttribute("y", (card.y + 2).toFixed(2));
            edge.setAttribute("width", (3 * s).toFixed(2));
            edge.setAttribute("height", (cardH - 4).toFixed(2));
            edge.setAttribute("rx", "1.5");
            edge.setAttribute("fill", vColor);
            g.appendChild(edge);
        }

        // header right: unit, then Δ%, then the re-root mark at the outer edge
        let rightX = card.x + geo.cw - pad;
        if (reroot) {
            // drawn crosshair (⌖) instead of a glyph — no font can drop it
            const cx = card.x + geo.cw - pad + 1.5 * s;
            const cy = headY - tfs * 0.3;
            const r = 3.2 * s;
            const rr = document.createElementNS(ns, "g") as SVGGElement;
            const circ = document.createElementNS(ns, "circle");
            circ.setAttribute("cx", cx.toFixed(2)); circ.setAttribute("cy", cy.toFixed(2));
            circ.setAttribute("r", r.toFixed(2));
            circ.setAttribute("fill", "none");
            circ.setAttribute("stroke", C.soft); circ.setAttribute("stroke-width", "1");
            rr.appendChild(circ);
            const tick = (dx: number, dy: number): void => {
                const l = document.createElementNS(ns, "line");
                l.setAttribute("x1", (cx + dx * r).toFixed(2)); l.setAttribute("y1", (cy + dy * r).toFixed(2));
                l.setAttribute("x2", (cx + dx * r * 2).toFixed(2)); l.setAttribute("y2", (cy + dy * r * 2).toFixed(2));
                l.setAttribute("stroke", C.soft); l.setAttribute("stroke-width", "1");
                rr.appendChild(l);
            };
            tick(-1, 0); tick(1, 0); tick(0, -1); tick(0, 1);
            const hitR = document.createElementNS(ns, "rect");
            hitR.setAttribute("x", (cx - 2 * r).toFixed(2)); hitR.setAttribute("y", (cy - 2 * r).toFixed(2));
            hitR.setAttribute("width", (4 * r).toFixed(2)); hitR.setAttribute("height", (4 * r).toFixed(2));
            hitR.setAttribute("fill", "#FFF"); hitR.setAttribute("fill-opacity", "0.01");
            rr.appendChild(hitR);
            const rt = document.createElementNS(ns, "title");
            rt.textContent = this.str("Show as root", "Als Wurzel anzeigen");
            rr.appendChild(rt);
            rr.style.cursor = "pointer";
            rr.onclick = (e: Event): void => {
                e.stopPropagation();
                ui.treeRoot = card.node.row.id;
                ui.treeCollapsed = null;
                this.persistUi(); this.rerender();
            };
            g.appendChild(rr);
            rightX -= 11 * s;
        }
        let pctW = 0;
        if (vColor && va && va.deltaPct != null) {
            const txt = geo.fmt.pct(va.deltaPct, true);
            const p = document.createElementNS(ns, "text");
            p.setAttribute("x", rightX.toFixed(2));
            p.setAttribute("y", headY.toFixed(2));
            p.setAttribute("text-anchor", "end");
            p.setAttribute("font-size", ufs.toFixed(1));
            p.setAttribute("font-family", FONT);
            p.setAttribute("font-weight", "600");
            p.setAttribute("fill", vColor);
            p.textContent = txt;
            const pt = document.createElementNS(ns, "title");
            pt.textContent = `Δ${this.ui!.ref.toUpperCase()} ${txt}`;
            p.appendChild(pt);
            g.appendChild(p);
            pctW = txt.length * ufs * 0.6 + 4 * s;
            rightX -= pctW;
        }
        const unitW = unit === "" ? 0 : unit.length * ufs * 0.6;
        if (unit !== "") {
            const u = document.createElementNS(ns, "text");
            u.setAttribute("x", rightX.toFixed(2));
            u.setAttribute("y", headY.toFixed(2));
            u.setAttribute("text-anchor", "end");
            u.setAttribute("font-size", ufs.toFixed(1));
            u.setAttribute("font-family", FONT);
            u.setAttribute("fill", C.soft);
            u.textContent = unit;
            g.appendChild(u);
        }

        const title = document.createElementNS(ns, "text");
        title.setAttribute("x", (card.x + pad + (vColor ? 3 * s : 0)).toFixed(2));
        title.setAttribute("y", headY.toFixed(2));
        title.setAttribute("font-size", tfs.toFixed(1));
        title.setAttribute("font-family", FONT);
        title.setAttribute("font-weight", "600");
        title.setAttribute("fill", C.text);
        const cno = this.commentNo.get(card.node.row.id);
        const raw = card.node.row.name + (cno != null ? " " + String.fromCharCode(0x2460 + cno - 1) : "");
        title.textContent = this.fitLabel(raw,
            geo.cw - 2 * pad - unitW - pctW - (reroot ? 11 * s : 0) - (vColor ? 3 * s : 0) - 4, tfs);
        const tip = document.createElementNS(ns, "title");
        tip.textContent = card.node.row.name + (card.node.row.formulaDef ? " = " + card.node.row.formulaDef : "");
        title.appendChild(tip);
        g.appendChild(title);

        if (card.compact) {
            // compact card: no mini chart, only the AC value — the monthly
            // series the chart would have shown moves into the tooltip
            const vfs = 11 * s;
            const acv = displayValue(card.node, "ac");
            const v = document.createElementNS(ns, "text");
            v.setAttribute("x", (card.x + pad + (vColor ? 3 * s : 0)).toFixed(2));
            v.setAttribute("y", (card.y + cardH - pad - 1.5 * s).toFixed(2));
            v.setAttribute("font-size", vfs.toFixed(1));
            v.setAttribute("font-family", FONT);
            v.setAttribute("font-weight", "600");
            v.setAttribute("fill", C.text);
            const vTxt = acv == null ? "–" : isRatio ? geo.fmt.pct(acv) : this.treeNum(acv, geo.fmt);
            v.textContent = this.fitLabel(vTxt,
                geo.cw - 2 * pad - (vColor ? 3 * s : 0) - (card.hasKids ? 20 * s : 0), vfs);
            g.appendChild(v);
            const mt = this.treeMonthsTip(card.node, geo.fmt);
            const err = card.node.error ? " ⚠ " + card.node.error : "";
            if (mt !== "" || err !== "") {
                const bt = document.createElementNS(ns, "title");
                bt.textContent = card.node.row.name + (mt === "" ? "" : " · " + mt) + err;
                box.appendChild(bt);
                const vt = document.createElementNS(ns, "title");
                vt.textContent = (mt === "" ? card.node.row.name : mt) + err;
                v.appendChild(vt);
            }
            if (card.node.error) { v.setAttribute("fill", this.badColor()); }
        } else {
            // chart area — the bridge needs no period tags, so it may use the strip
            const chartTop = card.y + pad + tfs + 6 * s;
            const bottom = ui.treeCard === "bridge" ? 7 * s : 15 * s;
            const area = {
                x: card.x + pad + (vColor ? 3 * s : 0), y: chartTop,
                w: geo.cw - 2 * pad - (vColor ? 3 * s : 0), h: cardH - (chartTop - card.y) - bottom,
            };
            const inset = card.hasKids ? 14 * s : 0;
            if (ui.treeCard === "delta") { this.treeMiniDelta(g, card.node, area, s, geo.fmt, inset); }
            else if (ui.treeCard === "bridge") { this.treeMiniBridge(g, card.node, area, s, geo.fmt, geo.svg, inset); }
            else { this.treeMini(g, card.node, area, s, geo.fmt, geo.svg, inset); }
        }

        if (card.node.error && !card.compact) {
            const e = document.createElementNS(ns, "text");
            e.setAttribute("x", (card.x + pad).toFixed(2));
            e.setAttribute("y", (card.y + cardH - 4 * s).toFixed(2));
            e.setAttribute("font-size", (7 * s).toFixed(1));
            e.setAttribute("font-family", FONT);
            e.setAttribute("fill", this.badColor());
            e.textContent = this.fitLabel("⚠ " + card.node.error, geo.cw - 2 * pad, 7 * s);
            g.appendChild(e);
        }

        // budget marker: branches exist but the card budget could not build
        // them — say so instead of showing a chevron that does nothing
        if (card.moreKids > 0 && !card.collapsed) {
            const badge = document.createElementNS(ns, "text");
            const ownChevron = card.children.length > 0;
            badge.setAttribute("x", (card.x + geo.cw - (ownChevron ? 24 : 11) * s).toFixed(2));
            badge.setAttribute("y", (card.y + cardH - 5.6 * s).toFixed(2));
            badge.setAttribute("text-anchor", ownChevron ? "end" : "middle");
            badge.setAttribute("font-size", (8 * s).toFixed(1));
            badge.setAttribute("font-family", FONT);
            badge.setAttribute("fill", C.soft);
            badge.textContent = "+" + card.moreKids;
            const bt = document.createElementNS(ns, "title");
            bt.textContent = this.str(
                `Card budget reached — ${card.moreKids} more branches not drawn. ` +
                "Use ⌖ to open this limb as its own tree.",
                `Kartenbudget erreicht — ${card.moreKids} weitere Zweige nicht gezeichnet. ` +
                "Mit ⌖ diesen Ast als eigenen Baum öffnen.");
            badge.appendChild(bt);
            g.appendChild(badge);
        }

        // chevron: opens / closes exactly this subtree — a bordered hit area so
        // it reads as a control, not as a data mark. Expanding unfolds the
        // WHOLE limb below the card (the reader asked for the tree, not for
        // one more level); folding hides just this subtree.
        if (card.children.length > 0 || card.collapsed) {
            const hit = document.createElementNS(ns, "rect");
            hit.setAttribute("x", (card.x + geo.cw - 19 * s).toFixed(2));
            hit.setAttribute("y", (card.y + cardH - 15 * s).toFixed(2));
            hit.setAttribute("width", (16 * s).toFixed(2));
            hit.setAttribute("height", (12.5 * s).toFixed(2));
            hit.setAttribute("rx", (2 * s).toFixed(2));
            hit.setAttribute("fill", "#FFF");
            hit.setAttribute("stroke", C.cardEdge);
            hit.setAttribute("stroke-width", "1");
            const ch = document.createElementNS(ns, "text");
            ch.setAttribute("x", (card.x + geo.cw - 11 * s).toFixed(2));
            ch.setAttribute("y", (card.y + cardH - 5.6 * s).toFixed(2));
            ch.setAttribute("text-anchor", "middle");
            ch.setAttribute("font-size", (9 * s).toFixed(1));
            ch.setAttribute("font-family", FONT);
            ch.setAttribute("fill", C.soft);
            ch.textContent = card.collapsed ? "▸" : "▾";
            const ct = document.createElementNS(ns, "title");
            ct.textContent = card.collapsed
                ? this.str("Expand", "Aufklappen") : this.str("Collapse", "Zuklappen");
            ch.appendChild(ct);
            const toggle = (e: Event): void => {
                e.stopPropagation();
                const ctx = this.treeCtx;
                const cur = new Set(ui.treeCollapsed ?? ctx?.auto ?? []);
                const id = card.node.row.id;
                if (cur.has(id)) {
                    const done = new Set<string>();
                    const stack = [id];
                    while (stack.length > 0) {
                        const n = stack.pop()!;
                        if (done.has(n)) { continue; }
                        done.add(n);
                        cur.delete(n);
                        for (const k of ctx?.kidsOf.get(n) ?? []) { stack.push(k); }
                    }
                } else { cur.add(id); }
                ui.treeCollapsed = [...cur];
                this.persistUi(); this.rerender();
            };
            hit.style.cursor = "pointer"; ch.style.cursor = "pointer";
            hit.onclick = toggle; ch.onclick = toggle;
            g.appendChild(hit); g.appendChild(ch);
        }
        return g;
    }

    /** breadcrumb over a re-rooted tree: every segment jumps back to that card */
    private treeBreadcrumb(path: PnlNode[]): HTMLElement {
        const crumbs = document.createElement("div");
        crumbs.style.cssText = `font-size:10px;color:${C.soft};margin:0 0 4px 0;padding:0;line-height:1.5;` +
            "display:flex;gap:5px;flex-wrap:wrap;align-items:center;";
        path.forEach((node, i) => {
            if (i > 0) {
                const sep = document.createElement("span");
                sep.textContent = "›";
                crumbs.appendChild(sep);
            }
            const last = i === path.length - 1;
            const seg = document.createElement("span");
            seg.textContent = node.row.name;
            seg.style.cssText = last
                ? `color:${C.text};font-weight:600;`
                : `color:${C.soft};cursor:pointer;text-decoration:underline;`;
            if (!last) {
                seg.title = this.str("Back to this card", "Zurück zu dieser Karte");
                seg.onclick = (e: Event): void => {
                    e.stopPropagation();
                    this.ui!.treeRoot = i === 0 ? "" : node.row.id;
                    this.ui!.treeCollapsed = null;
                    this.persistUi(); this.rerender();
                };
            }
            crumbs.appendChild(seg);
        });
        return crumbs;
    }

    /**
     * Value driver tree (DuPont): the P&L drawn as cards in a tidy multi-level
     * tree. The root is a formula or KPI row, its operands branch to the right,
     * a card that carries no formula branches into its account hierarchy
     * instead, with "+" / "−" per the sign convention of the child.
     *
     * Every parent owns one bus: a short stub leaves the card to the right and
     * meets a vertical bar in the column gap, from which one orthogonal elbow
     * runs into the middle of every child card. When all edges of a parent
     * carry the same operator (a pure sum, a pure product, a two-operand
     * ratio), a single circle sits on that stub — classic DuPont; only a mixed
     * branch (e.g. "+" and "−") labels its edges individually, with a smaller
     * circle right before each child card.
     *
     * Every branching card opens and closes its own subtree (chevron); the ⌖
     * mark lifts a card to the root of the tree.
     */
    private buildTree(fmt: Fmt): HTMLElement {
        const ui = this.ui!;
        const wrap = document.createElement("div");
        wrap.style.cssText = "padding:4px 14px 10px 14px;";

        const ctx = this.treeCtx;
        if (!ctx) {
            const hint = document.createElement("div");
            hint.style.cssText = `font-size:11px;color:${C.soft};line-height:1.55;padding:10px 0;max-width:620px;`;
            hint.textContent = this.str(
                "The driver tree needs a formula or KPI row that references other rows, e.g. [EBIT]/[Net revenue]. "
                + "Assign the row type and formula fields, or name a root row in the format pane.",
                "Der Treiberbaum braucht eine Formel- oder KPI-Zeile, die andere Zeilen referenziert, z. B. [EBIT]/[Umsatz]. "
                + "Zeilentyp- und Formel-Feld zuweisen oder im Format-Pane eine Wurzelzeile angeben.");
            wrap.appendChild(hint);
            return wrap;
        }

        const s = this.fontScale() * (ui.density === "compact" ? 0.9 : 1);
        const cw = TREE_CARD_W * s;
        const chFull = TREE_CARD_H * s; const chSmall = TREE_CARD_H_COMPACT * s;
        const gx = TREE_GAP_X * s; const gy = TREE_GAP_Y * s; const sub = TREE_GAP_SUB * s;
        const rootCard = ctx.rootCard;
        const all = ctx.cards;
        // card size follows fontScale/density; on top of that a deep level
        // (≥ TREE_COMPACT_LEVEL) always draws compact, and a layout that would
        // outgrow the stage several times over switches every card to compact —
        // automatic, independent of the format pane
        const setHeights = (allCompact: boolean): void => {
            for (const c of all) {
                c.compact = allCompact || c.depth >= TREE_COMPACT_LEVEL;
                c.h = c.compact ? chSmall : chFull;
            }
        };
        setHeights(false);
        let size = this.treeLayout(rootCard, cw, gx, gy, sub);
        const stageH = this.vpH > 0 ? this.vpH : (this.root.clientHeight || 0);
        if (stageH > 0 && size.h > TREE_COMPACT_STAGE * stageH) {
            setHeights(true);
            size = this.treeLayout(rootCard, cw, gx, gy, sub);
        }

        // comment footnotes follow the cards on screen (numbering in reading order)
        this.comments = [];
        this.commentNo.clear();
        for (const c of all) {
            const text = c.node.row.comment;
            if (!text || this.commentNo.has(c.node.row.id)) { continue; }
            const n = this.comments.length + 1;
            this.comments.push({ n, node: c.node, text });
            this.commentNo.set(c.node.row.id, n);
        }

        // head block: breadcrumb, hint line, then a fixed gap to the first card
        // row — the tree must never grow into the lines above it
        if (ctx.path.length > 1) { wrap.appendChild(this.treeBreadcrumb(ctx.path)); }

        const note = document.createElement("div");
        note.style.cssText = `font-size:9px;color:${C.soft};margin:0;padding:0;line-height:1.5;`;
        note.textContent = this.str(
            "Value driver tree — ▾ opens and closes a subtree (formula operands, otherwise the account hierarchy), "
            + "⌖ makes a card the root.",
            "Werttreiberbaum — ▾ klappt einen Teilbaum auf und zu (Formel-Operanden, sonst die Kontenhierarchie), "
            + "⌖ macht eine Karte zur Wurzel.");
        wrap.appendChild(note);

        const ns = "http://www.w3.org/2000/svg";
        const pad = 6;
        const svg = document.createElementNS(ns, "svg") as SVGSVGElement;
        svg.setAttribute("width", String(Math.ceil(size.w + 2 * pad)));
        svg.setAttribute("height", String(Math.ceil(size.h + 2 * pad)));
        svg.style.cssText = `display:block;margin-top:${TREE_HEAD_GAP}px;`;
        const inner = document.createElementNS(ns, "g") as SVGGElement;
        inner.setAttribute("transform", `translate(${pad},${pad})`);
        svg.appendChild(inner);

        const line = (x1: number, y1: number, x2: number, y2: number): void => {
            const l = document.createElementNS(ns, "line");
            l.setAttribute("x1", x1.toFixed(2)); l.setAttribute("y1", y1.toFixed(2));
            l.setAttribute("x2", x2.toFixed(2)); l.setAttribute("y2", y2.toFixed(2));
            l.setAttribute("stroke", C.elbow); l.setAttribute("stroke-width", "1");
            inner.appendChild(l);
        };
        const opCircle = (cx: number, cy: number, op: FormulaOp, r: number): void => {
            const c = document.createElementNS(ns, "circle");
            c.setAttribute("cx", cx.toFixed(2)); c.setAttribute("cy", cy.toFixed(2));
            c.setAttribute("r", r.toFixed(2)); c.setAttribute("fill", "#FFF");
            c.setAttribute("stroke", C.ac); c.setAttribute("stroke-width", "1");
            inner.appendChild(c);
            const t = document.createElementNS(ns, "text");
            t.setAttribute("x", cx.toFixed(2)); t.setAttribute("y", (cy + r * 0.39).toFixed(2));
            t.setAttribute("text-anchor", "middle");
            t.setAttribute("font-size", (r * 1.1).toFixed(1));
            t.setAttribute("font-family", FONT);
            t.setAttribute("font-weight", "700");
            t.setAttribute("fill", C.ac);
            t.textContent = op;
            inner.appendChild(t);
        };

        // bus + elbows first, cards on top — a folded subtree draws no lines
        for (const c of all) {
            if (c.children.length === 0) { continue; }
            // the bus sits inside the column gap, never over a card column
            const busX = c.x + cw + gx * TREE_BUS_FRAC;
            const stubX = (c.x + cw + busX) / 2;
            const pcy = c.y + c.h / 2;
            const ys = c.children.map(k => k.y + k.h / 2);
            line(c.x + cw, pcy, busX, pcy);
            line(busX, Math.min(pcy, ...ys), busX, Math.max(pcy, ...ys));
            for (let i = 0; i < c.children.length; i++) { line(busX, ys[i], c.children[i].x, ys[i]); }
            // one operator for the whole branch when every edge agrees (sum,
            // product, two-operand ratio ⇒ classic DuPont), otherwise per edge
            const ops = c.children.map(k => k.op);
            const head = ops[0];
            if (head != null && ops.every(o => o === head)) {
                opCircle(stubX, pcy, head, 10 * s);
            } else {
                c.children.forEach((k, i) => {
                    const op = ops[i];
                    if (op) { opCircle(k.x - 12 * s, ys[i], op, 8 * s); }
                });
            }
        }
        for (const c of all) {
            // any branching card can become the root — formula rows as well as
            // subtotals that open into their account hierarchy
            inner.appendChild(this.treeCardG(c, { cw, s, fmt, svg }, c !== rootCard && c.hasKids));
        }
        wrap.appendChild(svg);
        return wrap;
    }

    // ---------------- footnotes / footer ----------------

    private buildFootnotes(fmt: Fmt): void {
        void fmt;
        const model = this.model!;
        const warnings = [...this.statusWarnings, ...model.warnings];
        if (this.comments.length === 0 && warnings.length === 0) { return; }
        const box = document.createElement("div");
        box.style.cssText = "padding:8px 14px 4px 14px;max-width:960px;";
        const h = document.createElement("div");
        h.style.cssText = `font-size:9px;font-weight:700;letter-spacing:.08em;color:${C.soft};margin-bottom:4px;`;
        h.textContent = this.str("COMMENTS & DATA-QUALITY SIGNALS", "KOMMENTARE & DATENQUALITÄTS-SIGNALE");
        box.appendChild(h);
        for (const cm of this.comments) {
            const li = document.createElement("div");
            li.style.cssText = "font-size:10px;line-height:1.5;margin-bottom:3px;";
            const m = document.createElement("span");
            m.style.cssText = `color:${C.comment};margin-right:6px;`;
            m.textContent = String.fromCharCode(0x2460 + cm.n - 1);
            li.appendChild(m);
            li.appendChild(document.createTextNode(cm.text));
            box.appendChild(li);
        }
        for (const w of warnings) {
            const li = document.createElement("div");
            const loading = w.charAt(0) === "⏳";
            li.style.cssText = `font-size:10px;line-height:1.5;margin-bottom:3px;` +
                `color:${loading ? C.loading : C.soft};`;
            li.textContent = loading ? w : "⚠ " + w;
            box.appendChild(li);
        }
        this.root.appendChild(box);
    }

    private buildFooter(): HTMLElement {
        const f = document.createElement("div");
        f.style.cssText = `padding:10px 14px 12px 14px;border-top:1px solid ${C.gridSoft};` +
            `margin-top:8px;font-size:8.5px;color:${C.soft};line-height:1.5;max-width:960px;`;
        const dev = String(this.settings.styleCard.colorMode.value.value) !== "ibcs"
            ? this.str(" Documented corporate deviation: teal replaces the IBCS variance green to remain readable with red–green color-vision deficiency.",
                " Dokumentierte Abweichung: Teal ersetzt das IBCS-Varianz-Grün, um bei Rot-Grün-Sehschwäche lesbar zu bleiben.")
            : "";
        f.textContent = this.str(
            "Notation based on the IBCS® Standards 1.2 by the IBCS Association (CC BY-SA 4.0, ibcs.com)." + dev +
            " IBCS® is a registered trademark of HICHERT+FAISST GmbH. This visual is not certified by or affiliated with the IBCS Association.",
            "Notation nach den IBCS®-Standards 1.2 der IBCS Association (CC BY-SA 4.0, ibcs.com)." + dev +
            " IBCS® ist eine eingetragene Marke der HICHERT+FAISST GmbH. Dieses Visual ist nicht von der IBCS Association zertifiziert.");
        return f;
    }
}
