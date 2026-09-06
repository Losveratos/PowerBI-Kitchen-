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
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ISelectionId = powerbi.extensibility.ISelectionId;

import { VisualFormattingSettingsModel } from "./settings";
import {
    buildModel, flattenVisible, collapseToLevel, variance, displayValue,
    parseRowType, parseBool, parseSign, rowsFromLevels, aggregateMonthly,
    isZeroRow, revenueBase, formulaOperands, nodeResolver, Variance,
    syntheticTotal, TOTAL_ID, parsePeriod,
    FormulaOp, InputRow, LevelInputRow, PeriodSort, PnlModel, PnlNode, Scenario,
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
    cardEdge: "#E3E1DC", cardEdgeHover: "#C6C3BC", elbow: "#B4B4B4", refGray: "#9A9A9A",
    /** resting border of a control (toolbar button, chip) — quieter than a card edge */
    ctlEdge: "#DEDCD7", ctlHover: "#F4F3F0",
};

/** shadow language of the cards — one resting elevation, one on hover */
const SHADOW = "0 1px 2px rgba(15,30,46,.06)";
const SHADOW_HOVER = "0 2px 6px rgba(15,30,46,.10)";
/** transition of the interactive chrome — present, never a show */
const TRANSITION = "background-color .12s ease,border-color .12s ease,box-shadow .12s ease,color .12s ease";

/**
 * powerbi.VisualDataChangeOperationKind.Append — mirrored as a plain number
 * because the API declares the enum as a `const enum` in an ambient d.ts
 * (Create = 0, Append = 1, Segment = 2; no runtime object exists).
 */
const OP_APPEND = 1;

/**
 * Ceiling of source rows one selection may carry. A selection id is built per
 * data-view row (withCategory + row index), so a subtotal over 5.000 accounts
 * × 12 months would ask the host to swallow 60.000 identities on a single
 * click. The union is cut off here; the title tooltip of the affected control
 * says so, and cross-filtering still works — it just filters the first
 * SEL_MAX_ROWS source rows of that node.
 */
const SEL_MAX_ROWS = 2000;

/**
 * Ceiling of the type scale: the size preset (HD 1 · Full HD 1.25 · UHD 1.6)
 * multiplied by the fine scaling (80–160 %) would reach 2.56 at both maxima.
 * Beyond ~2.2 the table stops being a table — the row-label column eats the
 * viewport, the chart columns lose their bars and every squeeze mechanism runs
 * into its floor. The product is capped here instead, so the two controls stay
 * independent and the extreme corner still renders a readable page.
 */
const FONT_SCALE_MAX = 2.2;

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
/**
 * Tile view: neighbour cards a column builds at most. Everything that does not
 * fit the column height stays reachable through the ▲ / ▼ pager, so no card is
 * ever cut in half — only a pathological graph runs into this hard cap.
 */
const TREE_ZOOM_CARDS_MAX = 40;
/** Micro card of the tile view (px): height, chart strip, mini-chart scale. */
const MICRO_CARD_CHART_H = 66;
const MICRO_CARD_S = 1.15;
/** vertical air between two micro cards (px) — the paging pitch */
const MICRO_CARD_GAP = 8;
/**
 * The zoom page fits the viewport: the integrated chart is the part that gives
 * way first. It starts at the natural height and shrinks down to this floor —
 * below it the page scrolls again instead of turning the chart into a strip.
 */
const ZOOM_CHART_H = 420;
const ZOOM_CHART_MIN = 260;
/** …and it may grow into height the page does not need, up to this ceiling. */
const ZOOM_CHART_MAX = 760;
/** Chart fonts follow the squeeze, but only this far (never below 0.8). */
const ZOOM_FONT_MIN = 0.8;
/** Below this chart height the scenario grid switches to its compact rows. */
const ZOOM_GRID_COMPACT = 320;

/** Right padding of a table column in px — fit mode shrinks it to the minimum. */
const CELL_PAD = 7;
const CELL_PAD_MIN = 2;
/** Horizontal padding of the table wrapper (px, per side). */
const TABLE_PAD_X = 14;
/**
 * Fit mode floors: the drawn half of a Δ bar / Δ% pin and the value-bar span may
 * shrink down to these, never below — the label lanes are untouched, so a
 * squeezed table stays readable and never clips a number.
 */
const FIT_BAR_HALF_MIN = 6;
const FIT_PIN_HALF_MIN = 5;
const FIT_SPAN_MIN = 28;
/**
 * How far the *label* lanes of the chart and value columns follow the squeeze.
 * They carry the numbers, so they shrink far less than the bars — and the label
 * font shrinks with the lane, which is what keeps a number from ever running
 * out of its cell.
 */
const FIT_LABEL_MIN = 0.78;
/** measure-and-correct rounds the fit solver is allowed (it converges in 1–2). */
const FIT_PASSES = 3;

type ViewMode = "table" | "bars" | "waterfall" | "tree";
type Preset = "full" | "acref" | "acpydpy" | "acpldpl" | "dpct" | "dall";
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
    /** squeeze the chart columns until the table fits the viewport width */
    fit: boolean;
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
     * driver-tree card opened as a full tile page (row id); null = the tree.
     * Additive since v0.11 — deliberately NOT part of the treeV migration gate,
     * an unknown id simply falls back to the tree.
     */
    treeZoom: string | null;
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

/**
 * One month of the integrated zoom chart: the value column, its reference, the
 * second scenario drawn as a triangle, and the variance the bridge step and the
 * Δ% pin of that month are built from.
 */
interface ComboPt {
    tag: string;
    /** AC of the month, or the forecast that fills the months after the actuals */
    v: number | null;
    ref: number | null;
    /** second scenario, drawn as a triangle next to the column */
    tri: number | null;
    /** the month is a forecast month (FC has a value, AC has none) */
    isFc: boolean;
    /** Δ against the reference, in display orientation */
    d: number | null;
    pct: number | null;
    good: boolean;
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

/** Pixel geometry of one table render (see tableGeo). */
interface TableGeo {
    rowH: number;
    fs: number;
    /** font size of the in-chart value labels (fit mode shrinks it with the lane) */
    labelFs: number;
    /** drawn size of a Δ bar / Δ% pin label */
    barLabelFs: number;
    /** drawn size of a value-bar / cascade label */
    valLabelFs: number;
    BAR_HALF: number;
    PIN_HALF: number;
    barW: number;
    pinW: number;
    valW: number;
    maxAbsDelta: number;
    vbarW: number;
    vAxisX: number;
    vPpu: number;
    vLabelW: number;
    /** width of the air column between two period blocks */
    gapW: number;
    /** height a separator row adds through its top padding */
    sepExtraH: number;
    /** height of an opened sparkline row */
    sparkH: number;
    /** total px of every column except the auto-width row-label column */
    colsW: number;
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
    /** open hover-zoom panel of the driver tree (one at a time) */
    private zoomEl: HTMLElement | null = null;
    private zoomTimer: ReturnType<typeof setTimeout> | null = null;
    /** floating clone of the sticky table header rows (see stickyHeaderRow) */
    private floatHeadEl: HTMLElement | null = null;
    private floatTop = 0;
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

    // --- fit mode ---
    /** squeeze factor of the chart columns (1 = untouched natural widths) */
    private fitK = 1;
    /** column padding of the current table build */
    private fitPad = CELL_PAD;
    /** the display:table element of the last table build (fit measures it) */
    private tableEl: HTMLElement | null = null;

    // --- windowed rendering ---
    private vs: VirtualState | null = null;
    private scrollRaf = 0;
    private commentNo = new Map<string, number>();

    // --- driver tree ---
    /** graph context of the current render (toolbar and tree share it) */
    private treeCtx: TreeCtx | null = null;
    /** memoized virtual total root (see treeTotalNode) and the model it belongs to */
    private totalNode: PnlNode | null = null;
    private totalVer = -1;
    /** stage height of the last host update — drives the compact-card fallback */
    private vpH = 0;

    /** the frozen head block (title · toolbar · legend · scale note) */
    private headEl: HTMLElement | null = null;
    /** whether the head currently draws its divider + shadow (scrollTop > 0) */
    private headStuck = false;
    /** resolved height of the integrated zoom chart (see ZOOM_CHART_H) */
    private zoomChartH = ZOOM_CHART_H;
    /** pager refresh of the tile-view neighbour columns (rebuilt every render) */
    private pagerSync: (() => void)[] = [];
    /** memoized "last month with AC data" over the whole model (see mtdIndex) */
    private mtdCache = -2;
    private mtdCacheVer = -1;
    /** instance suffix for svg pattern ids (several visuals per page) */
    private static instances = 0;
    private uid = "t" + (++Visual.instances).toString(36);

    // --- selection · cross-filtering · context menu (v0.17) ---
    /**
     * null when the host does not offer one (older shims, test harnesses) —
     * every call site guards on it, the visual stays a pure display then.
     */
    private selectionManager: ISelectionManager | null = null;
    /**
     * The categorical column the selection ids are built over: the bound
     * account column, else the first level column. It is the ORIGINAL object
     * out of the data view — the host matches identities by reference.
     */
    private selCat: DataViewCategoryColumn | null = null;
    /** row id of the node whose selection is currently set (visual feedback) */
    private selKey: string | null = null;
    /** memoized source-row indices per row id (cleared with the model) */
    private selIdxCache = new Map<string, number[]>();
    /** memoized selection ids per row id (cleared with the model) */
    private selIdCache = new Map<string, ISelectionId[]>();
    /** memoized row resolver of the current model (see resolver) */
    private resolveFn: ((id: string) => PnlNode | undefined) | null = null;
    private resolveVer = -1;

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.events = options.host.eventService;
        // defensive: a host without a selection manager (old test shims) simply
        // gets the pre-0.17 behaviour — no selection, no context menu, no button
        if (typeof options.host.createSelectionManager === "function") {
            this.selectionManager = options.host.createSelectionManager();
            if (typeof this.selectionManager?.registerOnSelectCallback === "function") {
                // bookmark / "selected by another visual" restores: the host owns
                // the truth, the visual only drops its own highlight when the
                // restored set no longer matches the row it had marked
                this.selectionManager.registerOnSelectCallback((ids: ISelectionId[]) => {
                    const n = ids == null ? 0 : ids.length;
                    if (n === 0 && this.selKey != null) { this.selKey = null; this.rerender(); }
                });
            }
        }
        this.formattingSettingsService = new FormattingSettingsService();
        this.locale = options.host.locale || "en-US";
        this.root = document.createElement("div");
        this.root.className = "pnl-root";
        this.root.style.cssText =
            `width:100%;height:100%;overflow:auto;background:#FFF;font-family:${FONT};` +
            `color:${C.text};box-sizing:border-box;position:relative;`;
        this.root.addEventListener("scroll", () => this.onScroll());
        // empty ground: a click that no row claimed drops the selection, a
        // right-click that no row claimed still opens the page context menu
        this.root.addEventListener("click", () => this.clearSelection());
        this.root.addEventListener("contextmenu", (e: MouseEvent) => this.showMenu(null, e));
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
                this.resetSelection();
            }
            this.syncSelectionColumn(dataView);
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
        // the period sort mode is a parse-time decision (it fixes model.months),
        // so it belongs in the fingerprint — otherwise switching it in the
        // format pane would silently reuse the previously ordered model
        const parts: string[] = ["ps:" + this.periodSortMode()];
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

        /**
         * The period cell as one stable text key — the only place a host value
         * is normalised. A date column arrives as a Date object or as an ISO
         * string depending on the host and the model, and a numeric column may
         * carry an epoch stamp; all of them become "YYYY-MM-DD" here, so the
         * engine (and everything reading model.months) only ever sees text.
         * Month names, fiscal labels and plain numbers pass through untouched —
         * engine.parsePeriod reads them where they are, and they stay the label
         * the report author wrote.
         */
        const periodKey = (i: number): string | null => {
            if (!periodCol) { return null; }
            const v = periodCol.values[i];
            if (v == null) { return null; }
            if (v instanceof Date) {
                if (isNaN(v.getTime())) { return null; }
                const mm = String(v.getMonth() + 1).padStart(2, "0");
                const dd = String(v.getDate()).padStart(2, "0");
                return `${v.getFullYear()}-${mm}-${dd}`;
            }
            const t = String(v).trim();
            return t === "" ? null : t;
        };
        const sortMode = this.periodSortMode();

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
                    month: periodKey(i),
                    index: i,
                });
            }
            const lr = rowsFromLevels(lrows, sortMode);
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
                month: periodKey(i),
                index: i,
            });
        }
        const agg = aggregateMonthly(raw, sortMode);
        return { rows: agg.rows, months: agg.months, rowCount: n, has };
    }

    // ---------------- selection · cross-filtering · context menu ----------------

    /**
     * The column every selection id of this render is built over: the bound
     * account key, else the first level column. The host compares identities by
     * object reference, so the column has to come out of the CURRENT data view —
     * a new update delivers new column objects and invalidates the id cache.
     */
    private syncSelectionColumn(dataView: DataView): void {
        const cats = dataView.categorical?.categories;
        let next: DataViewCategoryColumn | null = null;
        if (cats && cats.length > 0) {
            next = cats.find(c => c.source.roles && c.source.roles["account"])
                ?? cats.find(c => c.source.roles && c.source.roles["levels"])
                ?? null;
        }
        if (next !== this.selCat) { this.selIdCache.clear(); }
        this.selCat = next;
    }

    /** everything selection-related is dropped with the model it belonged to */
    private resetSelection(): void {
        this.selIdxCache.clear();
        this.selIdCache.clear();
        this.selKey = null;
        this.resolveFn = null;
    }

    /** memoized row resolver (id / unique name → node) for the current model */
    private resolver(): (id: string) => PnlNode | undefined {
        if (this.resolveFn == null || this.resolveVer !== this.modelVer) {
            this.resolveFn = this.treeResolver();
            this.resolveVer = this.modelVer;
        }
        return this.resolveFn;
    }

    /**
     * Whether this render reacts to clicks at all: the format-pane switch, a
     * host that offers a selection manager, and a host that allows interactions
     * (a static export / e-mail subscription sets allowInteractions = false).
     */
    private interactive(): boolean {
        if (this.selectionManager == null) { return false; }
        if (typeof this.host.createSelectionIdBuilder !== "function") { return false; }
        if (this.settings?.styleCard?.interactions?.value === false) { return false; }
        return this.host.hostCapabilities?.allowInteractions !== false;
    }

    /**
     * Data-view row indices behind one node, in reading order and capped at
     * SEL_MAX_ROWS:
     *  - leaf account → its own source rows (all months)
     *  - subtotal / generated level node / virtual total → union of the leaves
     *  - formula / KPI row → union of the leaves of its operands
     * Rows reached twice (a diamond in the formula graph) count once.
     */
    private nodeIndices(node: PnlNode): number[] {
        const cached = this.selIdxCache.get(node.row.id);
        if (cached) { return cached; }
        const out: number[] = [];
        const seenIdx = new Set<number>();
        const seenNode = new Set<string>();
        const add = (i: number): boolean => {
            if (!seenIdx.has(i)) { seenIdx.add(i); out.push(i); }
            return out.length < SEL_MAX_ROWS;
        };
        const walk = (n: PnlNode): boolean => {
            if (seenNode.has(n.row.id)) { return true; }
            seenNode.add(n.row.id);
            for (const i of n.row.srcIdx ?? []) { if (!add(i)) { return false; } }
            const t = n.row.rowType;
            if (t === "formula" || t === "kpi") {
                // the resolver is only built where a formula actually needs it —
                // a plain account table never pays for it
                for (const o of formulaOperands(n, this.resolver())) {
                    if (!walk(o.child)) { return false; }
                }
            }
            // the virtual total root carries the model roots as its children
            // (see engine.syntheticTotal), so this walk covers it too
            for (const c of n.children) {
                if (c.row.rowType === "separator") { continue; }
                if (!walk(c)) { return false; }
            }
            return true;
        };
        walk(node);
        this.selIdxCache.set(node.row.id, out);
        return out;
    }

    /** Power BI selection ids of one node — one id per source row (memoized). */
    private selIdsFor(node: PnlNode): ISelectionId[] {
        if (this.selectionManager == null || this.selCat == null) { return []; }
        const cached = this.selIdCache.get(node.row.id);
        if (cached) { return cached; }
        const cat = this.selCat;
        const ids: ISelectionId[] = [];
        if (typeof this.host.createSelectionIdBuilder === "function") {
            for (const i of this.nodeIndices(node)) {
                const b = this.host.createSelectionIdBuilder();
                if (b == null || typeof b.withCategory !== "function") { break; }
                ids.push(b.withCategory(cat, i).createSelectionId());
            }
        }
        this.selIdCache.set(node.row.id, ids);
        return ids;
    }

    /**
     * True when this node can be selected at all (button / handler visibility).
     * Deliberately asks the cheap index map, never the id builder — a rendered
     * table asks this once per row, building ids there would cost thousands of
     * identities nobody clicks.
     */
    private selectable(node: PnlNode): boolean {
        if (!this.interactive() || this.selCat == null) { return false; }
        return this.nodeIndices(node).length > 0;
    }

    private isSelected(node: PnlNode): boolean {
        return this.selKey === node.row.id;
    }

    /** the tooltip suffix that names the performance cap, when it bites */
    private selCapNote(node: PnlNode): string {
        if (this.nodeIndices(node).length < SEL_MAX_ROWS) { return ""; }
        return " · " + this.str(
            `selection limited to the first ${SEL_MAX_ROWS} source rows`,
            `Selektion auf die ersten ${SEL_MAX_ROWS} Quellzeilen begrenzt`);
    }

    /**
     * Left click: set the page selection of this node (cross-filtering, and the
     * native drillthrough buttons of the page become live). A second click on
     * the same row drops it again; Ctrl/Cmd adds to the current selection, the
     * way every other Power BI visual behaves.
     */
    private selectNode(node: PnlNode, e: MouseEvent): void {
        if (!this.interactive()) { return; }
        e.stopPropagation();
        const sm = this.selectionManager!;
        if (this.isSelected(node)) { this.selKey = null; sm.clear(); this.rerender(); return; }
        const ids = this.selIdsFor(node);
        if (ids.length === 0) { return; }
        this.selKey = node.row.id;
        sm.select(ids, e.ctrlKey || e.metaKey);
        this.rerender();
    }

    private clearSelection(): void {
        if (!this.interactive() || this.selKey == null) { return; }
        this.selKey = null;
        this.selectionManager!.clear();
        this.rerender();
    }

    /**
     * Right click: the native Power BI context menu at the pointer — the host
     * hangs the drillthrough targets of the page in there itself. Without a
     * node (empty ground) the menu opens without a selection context.
     */
    private showMenu(node: PnlNode | null, e: MouseEvent): void {
        if (!this.interactive()) { return; }
        e.preventDefault();
        e.stopPropagation();
        const ids = node == null ? [] : this.selIdsFor(node);
        this.selectionManager!.showContextMenu(
            ids.length > 0 ? ids[0] : ({} as ISelectionId),
            { x: e.clientX, y: e.clientY });
    }

    /**
     * One node, one element: right click always opens the context menu, left
     * click sets the selection only where it does not collide with a control
     * that already owns the click (tree cards zoom, chevrons fold).
     */
    private bindSelect(el: HTMLElement | SVGElement, node: PnlNode, leftClick: boolean): void {
        if (!this.interactive()) { return; }
        el.addEventListener("contextmenu", (e: Event) => this.showMenu(node, e as MouseEvent));
        if (!leftClick) { return; }
        el.addEventListener("click", (e: Event) => this.selectNode(node, e as MouseEvent));
    }

    /**
     * "↗ Drill" in the head of the tile view — one click sets the selection of
     * the zoomed node AND opens the context menu right under the button, so the
     * drillthrough targets of the page are one gesture away. Outlined in the
     * accent colour: present next to the filled back button, never louder.
     */
    private zoomDrillBtn(node: PnlNode): HTMLElement | null {
        if (!this.selectable(node)) { return null; }
        const acc = this.accent();
        const b = document.createElement("button");
        b.setAttribute("data-pnl", "zoom-drill");
        b.textContent = this.str("↗ Drill", "↗ Drill");
        b.title = this.str(
            "Set the selection of this card and open the drillthrough targets",
            "Selektion dieser Karte setzen und Drillthrough-Ziele öffnen") + this.selCapNote(node);
        b.style.cssText = `font-family:${FONT};font-size:${this.kpx(13)};font-weight:600;line-height:1.3;` +
            `padding:${this.kpx(8)} ${this.kpx(16)};cursor:pointer;border-radius:6px;border:1px solid ${acc};` +
            `background:#FFF;color:${acc};transition:${TRANSITION};box-shadow:${SHADOW};`;
        b.onmouseenter = (): void => {
            b.style.background = this.accentSoft(0.10);
            b.style.boxShadow = SHADOW_HOVER;
        };
        b.onmouseleave = (): void => { b.style.background = "#FFF"; b.style.boxShadow = SHADOW; };
        b.oncontextmenu = (e: MouseEvent): void => this.showMenu(node, e);
        b.onclick = (e: MouseEvent): void => {
            e.stopPropagation();
            const sm = this.selectionManager!;
            const ids = this.selIdsFor(node);
            if (ids.length === 0) { return; }
            this.selKey = node.row.id;
            sm.select(ids);
            // the menu opens at the button, not at the pointer — the reader
            // knows where the list will appear before clicking
            const r = b.getBoundingClientRect();
            sm.showContextMenu(ids[0], { x: Math.round(r.left), y: Math.round(r.bottom) });
        };
        return b;
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
            fit: s.columnsCard.fitWidth.value,
            collapsed: this.model && lvl > 0 ? [...collapseToLevel(this.model.roots, lvl)] : [],
            spark: [],
            blocks: { mtd: false, ytd: true, fy: this.has.fcfy && this.has.plfy },
            treeRoot: "",
            treeCollapsed: null,
            treeCard: String(s.columnsCard.treeCard.value.value) as TreeCardMode,
            treeStatus: s.columnsCard.treeStatus.value,
            treeZoom: null,
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
            // the virtual total root is no row of the model, yet it is a card the
            // reader folds, re-roots and zooms into — it survives the filter
            const known = (id: string): boolean => id === TOTAL_ID || this.model!.byId.has(id);
            if (this.ui.treeCollapsed) {
                this.ui.treeCollapsed = this.ui.treeCollapsed.filter(known);
            }
            // a tile view on a row the model no longer knows falls back to the tree
            if (this.ui.treeZoom != null && !known(this.ui.treeZoom)) {
                this.ui.treeZoom = null;
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
    /**
     * Accent of the interactive chrome (active toolbar buttons, the back button
     * of the tile view, breadcrumb hover). Data marks, axes and the AC column
     * fill never read this — they stay on the IBCS ink C.ac, which is also the
     * default, so an untouched report keeps exactly the previous look.
     */
    private accent(): string {
        return this.settings.styleCard.accentColor.value?.value || C.ac;
    }
    /** slightly lifted accent for hover states — mixed towards paper in sRGB */
    private accentSoft(alpha: number): string {
        const hex = this.accent().replace("#", "");
        if (!/^[0-9a-fA-F]{6}$/.test(hex)) { return this.accent(); }
        const mix = (i: number): number => {
            const c = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
            return Math.round(c + (255 - c) * alpha);
        };
        return `rgb(${mix(0)},${mix(1)},${mix(2)})`;
    }
    /** paper of the visual — behind the tree and behind the tiles of the zoom */
    private pageBg(): string {
        return this.settings.styleCard.pageBackground.value?.value || "#FFF";
    }
    /** fill of every card: tree cards, micro cards, the big tile, hover panel */
    private cardBg(): string {
        return this.settings.styleCard.cardBackground.value?.value || "#FFF";
    }
    /** whether head block and column headers stay on screen while scrolling */
    private sticky(): boolean {
        return this.settings.styleCard.stickyHeader.value;
    }
    /**
     * The one type scale of the visual: the size preset (HD 1 · Full HD 1.25 ·
     * UHD 1.6) times the fine scaling (80–160 %), capped at FONT_SCALE_MAX.
     * Every label of the visual reads it through k() / kpx(), so a preset
     * change moves the whole page at once — table and headers, toolbar, legend,
     * notes, tree, tile page, hover panel and footer alike.
     *
     * HD at 100 % returns exactly 1, and k() then hands the base value back
     * untouched — the default render stays pixel-identical.
     */
    private fontScale(): number {
        const fp = String(this.settings.styleCard.fontPreset.value.value);
        const preset = fp === "fullhd" ? 1.25 : fp === "uhd" ? 1.6 : 1;
        const raw = Math.round(Number(this.settings.styleCard.fontZoom.value) || 100);
        const zoom = (raw < 80 || raw > 160 ? 100 : raw) / 100;
        return Math.min(preset * zoom, FONT_SCALE_MAX);
    }
    /** a base px value on the type scale — scale 1 returns it unchanged */
    private k(base: number): number {
        const s = this.fontScale();
        return s === 1 ? base : Math.round(base * s * 10) / 10;
    }
    /** …the same, ready for a css declaration */
    private kpx(base: number): string { return this.k(base) + "px"; }
    /**
     * Font size of a table header line. 0 — or anything outside 7..20 px — keeps
     * the built-in sizes untouched; any other value scales them, so the block
     * titles stay proportionally larger than the column labels. The type scale
     * applies on top, exactly as it does to the body rows.
     */
    private headerFs(base: number): number {
        const v = Math.round(Number(this.settings.styleCard.headerFontSize.value) || 0);
        return this.k(v < 7 || v > 20 ? base : base * (v / 9));
    }
    /** header ink of the table — an empty override keeps the built-in soft gray */
    private headerInk(): string {
        return this.settings.styleCard.headerColor.value?.value || C.soft;
    }
    /**
     * The month the MTD block talks about: the **last month that carries AC
     * data anywhere in the model**, not simply the last month of the period.
     *
     * A P&L bound to a full calendar year but posted only up to August has
     * empty AC months at the end. Reading the last month there would report an
     * actual of 0 against a full plan month — a −100 % ghost. One shared index
     * over all rows keeps the whole table talking about the same month.
     * Falls back to the last month when no AC series exists at all.
     */
    private mtdIndex(): number {
        const model = this.model!;
        const n = model.months.length;
        if (n === 0) { return -1; }
        if (this.mtdCacheVer === this.modelVer && this.mtdCache >= -1) { return this.mtdCache; }
        let idx = -1;
        for (const node of model.byId.values()) {
            const arr = node.series.ac;
            if (!arr) { continue; }
            for (let i = n - 1; i > idx; i--) {
                if (arr[i] != null) { idx = i; break; }
            }
            if (idx === n - 1) { break; }
        }
        this.mtdCache = idx < 0 ? n - 1 : idx;
        this.mtdCacheVer = this.modelVer;
        return this.mtdCache;
    }

    /** block-aware displayed value: MTD reads the last month *with* AC data */
    private blockDisplay(node: PnlNode, block: "mtd" | "ytd" | "fy", scen: Scenario): number | null {
        if (block === "ytd") { return this.ytdDisplay(node, scen); }
        if (block !== "mtd") { return displayValue(node, scen); }
        const li = this.mtdIndex();
        const v = li >= 0 ? (node.series[scen]?.[li] ?? null) : null;
        return v == null ? null : (node.row.displayInvert ? -v : v);
    }

    /** true when the bound period has no months after the last actuals month */
    private ytdFull(): boolean {
        const n = this.model!.months.length;
        const li = this.mtdIndex();
        return n === 0 || li < 0 || li >= n - 1;
    }

    /** raw month sum of a scenario over the period-matched YTD window */
    private ytdRawSum(node: PnlNode, sc: Scenario): number | null {
        const arr = node.series[sc];
        if (!arr) { return null; }
        const li = this.mtdIndex();
        let sum = 0; let seen = false;
        for (let i = 0; i <= li; i++) {
            const v = arr[i];
            if (v != null) { sum += v; seen = true; }
        }
        return seen ? sum : null;
    }

    /**
     * Period-matched YTD value: reference scenarios are summed only up to the
     * last month that carries actuals anywhere in the model — the same window
     * for every row, so the whole report talks about the same period. Without
     * this, a P&L posted through August reads eight months of AC against
     * twelve months of plan and shows a −27 % ghost next to an all-teal
     * monthly bridge. With actuals through the last bound month this is
     * exactly the engine value. Ratio rows keep the engine value — they are
     * intensive figures, not month sums.
     */
    private ytdDisplay(node: PnlNode, sc: Scenario): number | null {
        if (this.ytdFull() || node.row.rowType === "kpi"
            || sc === "fcfy" || sc === "plfy") { return displayValue(node, sc); }
        const v = this.ytdRawSum(node, sc);
        if (v == null) { return null; }
        return node.row.displayInvert ? -v : v;
    }

    /** Δ = AC − reference over the period-matched YTD window (raw, no invert) */
    private ytdVariance(node: PnlNode, ref: Scenario): Variance {
        if (this.ytdFull() || node.row.rowType === "kpi") { return variance(node, ref, "ac"); }
        const a = this.ytdRawSum(node, "ac");
        const r = this.ytdRawSum(node, ref);
        if (a == null && r == null) { return variance(node, ref, "ac"); }
        if (a == null || r == null) { return { delta: null, deltaPct: null, good: true }; }
        const delta = a - r;
        let good = delta >= 0;
        if (node.row.varianceInvert) { good = !good; }
        return { delta, deltaPct: r !== 0 ? delta / Math.abs(r) : null, good };
    }

    /** the "_Aug"-style YTD status month for header labels (IBCS UN 2.2) */
    private ytdMarker(): string {
        const months = this.model!.months;
        const li = this.mtdIndex();
        if (months.length === 0) { return ""; }
        return this.monthLabel(months[li >= 0 ? li : months.length - 1]);
    }

    /**
     * Label of one period key. A "YYYY-MM…" key becomes the short month name of
     * the reader's locale — unchanged. A bare calendar number (1..12) is the
     * only other key a reader cannot read as a month, so it becomes a short
     * month name too. Everything else — "Dez", "März 2026", "P07", a fiscal
     * label — is the author's own text and passes straight through.
     */
    private monthLabel(m: string): string {
        const parts = /^(\d{4})-(\d{2})/.exec(m);
        if (parts) {
            const d = new Date(Number(parts[1]), Number(parts[2]) - 1, 1);
            return d.toLocaleDateString(this.locale, { month: "short" });
        }
        if (/^\d{1,2}$/.test(m.trim())) {
            const p = parsePeriod(m);
            if (p) {
                return new Date(2000, p.m - 1, 1).toLocaleDateString(this.locale, { month: "short" });
            }
        }
        return m;
    }

    /** four-digit year of a period key — "" when the label carries none */
    private periodYear(m: string): string {
        const p = parsePeriod(m);
        return p && p.y != null ? String(p.y) : "";
    }

    /** the year prefix of a header label, blank (and space-free) without one */
    private yearPrefix(text: string): string {
        const months = this.model!.months;
        const y = months.length > 0 ? this.periodYear(months[0]) : "";
        return y === "" ? text : y + " " + text;
    }

    /** the period sort mode of the format pane (see engine.sortMonths) */
    private periodSortMode(): PeriodSort {
        const v = String(this.settings.columnsCard.periodSort.value.value);
        return v === "data" || v === "calendar" ? v : "auto";
    }

    // ---------------- render entry ----------------

    private renderLanding(): void {
        this.vs = null;
        const box = document.createElement("div");
        box.style.cssText = "padding:22px 26px;max-width:600px;";
        const h = document.createElement("div");
        h.style.cssText = `font-size:${this.kpx(15)};font-weight:600;margin-bottom:8px;`;
        h.textContent = "P&L Statement byDatenWG";
        const p = document.createElement("div");
        p.style.cssText = `font-size:${this.kpx(12)};color:${C.soft};line-height:1.55;`;
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
        box.style.cssText = `padding:18px 22px;font-size:${this.kpx(12)};color:${C.soft};`;
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
        // interactions switched off (format pane, host, or a host without a
        // selection manager): no element may keep a selection marker
        if (!this.interactive()) { this.selKey = null; }
        const keepScroll = this.root.scrollTop;
        this.treeZoomHide();
        this.floatHeadEl = null;
        this.root.replaceChildren();
        this.root.style.background = this.pageBg();
        this.comments = [];
        this.vs = null;
        this.headEl = null;
        this.headStuck = false;
        this.pagerSync = [];

        const scan = this.scans();
        const fmt = this.makeFmt(scan.maxAbsVal);
        // the driver-tree graph drives the tree AND its toolbar groups (depth
        // buttons, breadcrumb) — build it before the toolbar
        this.treeCtx = ui.view === "tree" ? this.buildTreeCtx() : null;

        // the head block — title, toolbar, legend and the scale note ride in one
        // wrapper so they can be frozen above the scrolling body as one piece
        const head = document.createElement("div");
        head.className = "pnl-head";
        head.setAttribute("data-pnl", "head");
        head.style.cssText = `background:${this.pageBg()};box-sizing:border-box;` +
            "border-bottom:1px solid transparent;transition:box-shadow .12s ease,border-color .12s ease;" +
            (this.sticky() ? "position:sticky;top:0;z-index:30;" : "");
        if (this.settings.titleCard.show.value) { head.appendChild(this.buildTitle(fmt)); }
        if (this.settings.toolbarCard.show.value) { head.appendChild(this.buildToolbar()); }
        if (this.awaitingSegment) { head.appendChild(this.buildLoadingBar()); }
        if (this.settings.toolbarCard.showLegend.value) { head.appendChild(this.buildLegend()); }
        if (ui.view !== "tree") { head.appendChild(this.scaleNote(fmt, scan.maxAbsDelta)); }
        if (head.childElementCount > 0) {
            this.root.appendChild(head);
            this.headEl = head;
        }

        if (ui.view === "tree") {
            // the tile view fits the viewport: build, measure, squeeze the chart
            this.zoomChartH = Math.round(ZOOM_CHART_H * this.fontScale());
            let tree = this.buildTree(fmt);
            this.root.appendChild(tree);
            this.buildFootnotes(fmt);
            this.root.appendChild(this.buildFooter());
            this.root.scrollTop = keepScroll;
            if (ui.treeZoom != null) {
                // one page, no vertical scrolling: the chart takes what the rest
                // of the page leaves over — it shrinks when the page is too tall
                // and grows into unused height, always inside its two limits
                const k = this.fontScale();
                const lo = Math.round(ZOOM_CHART_MIN * k);
                const hi = Math.round(ZOOM_CHART_MAX * k);
                for (let pass = 0; pass < 4; pass++) {
                    this.zoomPostLayout();
                    const avail = this.root.clientHeight || this.vpH;
                    if (avail <= 0) { break; }
                    const over = this.contentHeight() - avail;
                    if (Math.abs(over) <= 3) { break; }
                    // growing keeps a 4 px safety margin, so the last pass can
                    // never end one pixel over the edge and bring back a scrollbar
                    const want = over > 0 ? this.zoomChartH - over : this.zoomChartH - over - 4;
                    const next = Math.max(lo, Math.min(hi, want));
                    if (Math.abs(next - this.zoomChartH) < 4) { break; }
                    this.zoomChartH = next;
                    const fresh = this.buildTree(fmt);
                    this.root.replaceChild(fresh, tree);
                    tree = fresh;
                }
                this.zoomPostLayout();
            }
        } else {
            // fit mode needs the table on screen before it can solve — the
            // row-label column is auto-width, so it is measured, not guessed,
            // and a second pass corrects what the first could not foresee
            this.fitK = 1; this.fitPad = CELL_PAD;
            let body = this.buildTable(fmt, scan.maxAbsDelta);
            this.root.appendChild(body);
            for (let pass = 0; ui.fit && pass < FIT_PASSES; pass++) {
                if (!this.solveFit(fmt, scan.maxAbsDelta)) { break; }
                const tighter = this.buildTable(fmt, scan.maxAbsDelta);
                this.root.replaceChild(tighter, body);
                body = tighter;
            }
            this.buildFootnotes(fmt);
            this.root.appendChild(this.buildFooter());
            this.root.scrollTop = keepScroll;
        }
        this.applySticky();
        this.measureWindow();
    }

    /**
     * How tall the rendered page really is. `scrollHeight` cannot answer this:
     * it never drops below the viewport, so a page with room to spare looks
     * exactly like one that fits to the pixel. The bottom edge of the last block
     * does answer it — and that is what the tile view balances against.
     */
    private contentHeight(): number {
        const last = this.root.lastElementChild as HTMLElement | null;
        if (!last) { return 0; }
        const rb = this.root.getBoundingClientRect();
        return Math.ceil(last.getBoundingClientRect().bottom - rb.top + this.root.scrollTop);
    }

    /** the uniform-Δ-scale note — part of the frozen head, not of the table */
    private scaleNote(fmt: Fmt, maxAbsDelta: number): HTMLElement {
        const note = document.createElement("div");
        note.setAttribute("data-pnl", "scale-note");
        note.style.cssText = `font-size:${this.kpx(9)};color:${C.soft};text-align:right;` +
            `padding:0 ${TABLE_PAD_X}px 3px ${TABLE_PAD_X}px;`;
        note.textContent = this.str("uniform Δ scale: bars ±", "einheitliche Δ-Skala: Balken ±")
            + fmt.val(maxAbsDelta) + " " + fmt.suffix + this.settings.numbersCard.unitText.value
            + " · pins ±40%";
        return note;
    }

    /**
     * Freeze what belongs on top. The head wrapper is sticky by itself; the two
     * table header rows cannot be (a `display:table-row` is not a positioning
     * box), so their *cells* stick instead — one shared top offset that stacks
     * head + block row + column row. Cells ride inside the table, so horizontal
     * scrolling moves them along with their columns, exactly as it should.
     */
    private applySticky(): void {
        this.syncHeadShadow();
        if (!this.sticky()) { return; }
        let top = this.headEl ? Math.round(this.headEl.getBoundingClientRect().height) : 0;
        const zoomHead = this.root.querySelector('[data-pnl="zoom-head"]') as HTMLElement | null;
        if (zoomHead) {
            zoomHead.style.top = top + "px";
            zoomHead.style.boxShadow = `0 -1px 0 ${this.pageBg()}`;
            top += Math.round(zoomHead.getBoundingClientRect().height);
        }
        this.buildFloatHead(top);
    }

    /**
     * The divider under the frozen head: a 1 px rule plus a very quiet shadow,
     * both only once the body has actually moved underneath it. At rest the
     * head carries no line at all — nothing to explain, nothing to distract.
     */
    private syncHeadShadow(): void {
        const head = this.headEl;
        if (!head) { return; }
        const on = this.sticky() && this.root.scrollTop > 0;
        if (on === this.headStuck) { return; }
        this.headStuck = on;
        head.className = on ? "pnl-head pnl-head-stuck" : "pnl-head";
        head.style.borderBottomColor = on ? C.gridSoft : "transparent";
        head.style.boxShadow = on ? "0 3px 8px rgba(15,30,46,.07)" : "none";
    }

    /**
     * After the tile view is on screen: the two neighbour columns take exactly
     * the height of the big tile — same top edge, same bottom edge, one clean
     * rectangle — and their pagers learn how much is still hidden.
     */
    private zoomPostLayout(): void {
        const tile = this.root.querySelector('[data-pnl="zoom-center"]') as HTMLElement | null;
        if (tile) {
            const h = Math.round(tile.getBoundingClientRect().height);
            const cols = this.root.querySelectorAll('[data-pnl="zoom-side"]');
            for (let i = 0; i < cols.length; i++) { (cols[i] as HTMLElement).style.height = h + "px"; }
        }
        // a scrolling column is cropped to whole cards: what is on screen is
        // always complete, what does not fit is behind the pager — never a stump
        const lists = this.root.querySelectorAll('[data-pnl="micro-list"]');
        for (let i = 0; i < lists.length; i++) {
            const list = lists[i] as HTMLElement;
            const first = list.firstElementChild as HTMLElement | null;
            list.style.maxHeight = "";
            if (!first) { continue; }
            const avail = list.clientHeight;
            if (avail <= 0 || list.scrollHeight <= avail) { continue; }
            // measure the real pitch (sub-pixel): rounding a card height would
            // let a hairline of the next card peek out — exactly the stump the
            // pager exists to avoid
            const r0 = first.getBoundingClientRect();
            const second = list.children[1] as HTMLElement | undefined;
            const pitch = second ? second.getBoundingClientRect().top - r0.top
                : r0.height + this.k(MICRO_CARD_GAP);
            const gap = Math.max(pitch - r0.height, 0);
            if (pitch <= 0) { continue; }
            const fit = Math.max(1, Math.floor((avail + gap) / pitch));
            list.style.maxHeight = Math.min(avail, Math.floor(fit * pitch - gap)) + "px";
        }
        for (const fn of this.pagerSync) { fn(); }
    }

    /** visible status line while further data segments are still on their way */
    private buildLoadingBar(): HTMLElement {
        const bar = document.createElement("div");
        bar.style.cssText = `margin:2px 14px 0 14px;padding:${this.kpx(4)} ${this.kpx(8)};` +
            `font-size:${this.kpx(10)};` +
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
        if (this.zoomEl || this.zoomTimer != null) { this.treeZoomHide(); }
        this.syncHeadShadow();
        this.syncFloatHead();
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

    /** variance for a period block: MTD reads the last month *with* AC data */
    private blockVariance(node: PnlNode, block: "mtd" | "ytd" | "fy", ref: Scenario, minuend: Scenario): Variance {
        if (block === "ytd" && minuend === "ac") { return this.ytdVariance(node, ref); }
        if (block !== "mtd") { return variance(node, ref, minuend); }
        const li = this.mtdIndex();
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
        } else if (ui.preset === "dall") {
            // every available reference side by side — all combinations feed the
            // one uniform Δ scale, so the bars stay comparable across references
            for (const r of ["py", "pl", "fc"] as Scenario[]) {
                if (this.has[r]) { out.push({ ref: r, minuend: "ac", block: "ytd" }); }
            }
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
            m.style.cssText = `font-size:${this.kpx(13.5)};font-weight:700;line-height:1.45;` +
                `margin-bottom:${this.kpx(8)};max-width:${this.k(900)}px;`;
            m.textContent = msg;
            wrap.appendChild(m);
        }
        const months = this.model!.months;
        // the "_Jun" marker names the month the actuals really reach — the same
        // month the YTD block header and the scenario grid talk about
        const autoPeriod = months.length > 0
            ? this.yearPrefix(`${this.monthLabel(months[0])}..${this.monthLabel(months[months.length - 1])} (_${this.ytdMarker()})`)
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
                ? `font-size:${this.kpx(12)};line-height:1.5;font-weight:600;`
                : `font-size:${this.kpx(12)};line-height:1.5;color:${i === 0 ? C.text : C.text};`;
            el.textContent = line;
            wrap.appendChild(el);
        });
        return wrap;
    }

    private tbBtn(label: string, active: boolean, onClick: () => void, title?: string): HTMLElement {
        const b = document.createElement("button");
        b.textContent = label;
        if (title) { b.title = title; }
        const acc = this.accent();
        const rest = active
            ? `background:${acc};border:1px solid ${acc};color:#FFF;font-weight:600;`
            : `background:#FFF;border:1px solid ${C.ctlEdge};color:${C.text};font-weight:400;`;
        b.style.cssText =
            `font-family:${FONT};font-size:${this.kpx(10.5)};line-height:1.35;` +
            `padding:${this.kpx(3.5)} ${this.kpx(10)};cursor:pointer;` +
            `border-radius:4px;transition:${TRANSITION};` + rest;
        // hover is a tint, never a jump: the inactive button warms up, the
        // active one lifts a shade so both stay recognisably the same control
        b.onmouseenter = (): void => {
            if (active) { b.style.background = this.accentSoft(0.14); b.style.borderColor = this.accentSoft(0.14); }
            else { b.style.background = C.ctlHover; b.style.borderColor = C.cardEdgeHover; }
        };
        b.onmouseleave = (): void => {
            if (active) { b.style.background = acc; b.style.borderColor = acc; }
            else { b.style.background = "#FFF"; b.style.borderColor = C.ctlEdge; }
        };
        b.onclick = (e) => { e.stopPropagation(); onClick(); this.persistUi(); this.rerender(); };
        return b;
    }

    /** caps label of a control group — the one type style for every section head */
    private capsLabel(text: string, fs = 8.5): HTMLElement {
        const l = document.createElement("div");
        l.style.cssText = `font-size:${this.kpx(fs)};letter-spacing:.09em;color:${C.soft};` +
            "text-transform:uppercase;font-weight:600;line-height:1.4;";
        l.textContent = text;
        return l;
    }

    private tbGroup(label: string, buttons: HTMLElement[]): HTMLElement {
        const g = document.createElement("div");
        g.style.cssText = `display:flex;flex-direction:column;gap:${this.kpx(4)};`;
        const row = document.createElement("div");
        row.style.cssText = `display:flex;gap:${this.kpx(4)};flex-wrap:wrap;`;
        buttons.forEach(b => row.appendChild(b));
        g.appendChild(this.capsLabel(label)); g.appendChild(row);
        return g;
    }

    /**
     * Back out of the tile view — the dominant control of the zoomed header:
     * accent filled, larger type, generous padding, so the way back is the
     * first thing the eye finds in the top left corner.
     */
    private zoomBackBtn(onClick: () => void): HTMLElement {
        const acc = this.accent();
        const b = document.createElement("button");
        b.setAttribute("data-pnl", "zoom-back");
        b.textContent = this.str("← Back to tree", "← Zurück zum Baum");
        b.title = this.str("Close the tile view", "Kachel-Ansicht schließen");
        b.style.cssText = `font-family:${FONT};font-size:${this.kpx(13)};font-weight:600;line-height:1.3;` +
            `padding:${this.kpx(8)} ${this.kpx(16)};cursor:pointer;border-radius:6px;border:1px solid ${acc};` +
            `background:${acc};color:#FFF;transition:${TRANSITION};box-shadow:${SHADOW};`;
        b.onmouseenter = (): void => {
            b.style.background = this.accentSoft(0.16);
            b.style.borderColor = this.accentSoft(0.16);
            b.style.boxShadow = SHADOW_HOVER;
        };
        b.onmouseleave = (): void => {
            b.style.background = acc; b.style.borderColor = acc; b.style.boxShadow = SHADOW;
        };
        b.onclick = (e: Event): void => {
            e.stopPropagation(); onClick(); this.persistUi(); this.rerender();
        };
        return b;
    }

    private buildToolbar(): HTMLElement {
        const ui = this.ui!;
        const bar = document.createElement("div");
        bar.style.cssText = `display:flex;gap:${this.kpx(16)} ${this.kpx(20)};flex-wrap:wrap;` +
            `padding:${this.kpx(8)} 14px ${this.kpx(6)} 14px;align-items:flex-end;`;

        const tset = this.settings.toolbarCard;
        // Tile view: everything that cannot change the tile disappears. Only the
        // Δ reference and the unit reach the zoom chart, so only those two stay —
        // the header belongs to the back button and the breadcrumb.
        const inZoom = ui.view === "tree" && ui.treeZoom != null;
        if (tset.showView.value && !inZoom) { bar.appendChild(this.tbGroup(this.str("View", "Ansicht"), [
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
        const tableViews = ui.view !== "tree" && !inZoom;
        const isTree = ui.view === "tree" && !inZoom;

        const presets: [Preset, string][] = [
            ["full", "AC·PY·PL·FC"], ["acref", "AC vs Ref"], ["dall", "AC vs PY·PL·FC"],
            ["acpydpy", "AC·PY·ΔPY"], ["acpldpl", "AC·PL·ΔPL"], ["dpct", "ΔPY% · ΔPL%"],
        ];
        if (tset.showPresets.value && tableViews) {
            bar.appendChild(this.tbGroup(this.str("Column preset", "Spalten-Preset"),
                presets.map(([p, label]) => this.tbBtn(label, ui.preset === p, () => { ui.preset = p; }))));
        }

        const refs: Scenario[] = (["py", "pl", "fc"] as Scenario[]).filter(s => this.has[s]);
        if (refs.length > 0 && tset.showReference.value && (tableViews || isTree || inZoom)) {
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

        if (tset.showDensity.value && !inZoom) { bar.appendChild(this.tbGroup(this.str("Density", "Dichte"), [
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
            this.tbBtn("Fit", ui.fit, () => { ui.fit = !ui.fit; },
                this.str("Squeeze the chart columns until the table fits the width — no horizontal scrolling",
                    "Diagramm-Spalten stauchen, bis die Tabelle in die Breite passt — kein Querscrollen")),
        ])); }
        return bar;
    }

    private legendChip(style: "ac" | "py" | "pl" | "fc"): HTMLElement {
        const chip = document.createElement("span");
        const base = `display:inline-block;width:${this.kpx(10)};height:${this.kpx(10)};` +
            `margin-right:${this.kpx(5)};vertical-align:-1px;`;
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
        bar.style.cssText = `display:flex;gap:${this.kpx(16)};flex-wrap:wrap;align-items:center;` +
            `padding:${this.kpx(6)} 14px;font-size:${this.kpx(10)};color:${C.soft};`;
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
            el.style.cssText = `display:inline-block;width:${this.kpx(10)};height:${this.kpx(10)};` +
                `background:${color};margin:0 ${this.kpx(5)} 0 0;vertical-align:-1px;`;
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
        // a period column of month names carries no year — the labels then say
        // the span without inventing one (see periodYear / yearPrefix)
        const year = months.length > 0 ? this.periodYear(months[0]) : "";
        const fyYear = year === "" ? "FY" : "FY " + year;
        // the "_Aug" marker names the month YTD really reaches — the last one
        // that carries actuals, not the last one the period happens to run to
        const mi = this.mtdIndex();
        const mtdMonth = mi >= 0 ? this.monthLabel(months[mi]) : last;
        const ytdLabel = months.length > 0
            ? `${this.yearPrefix(`${this.monthLabel(months[0])}..${last} (_${mtdMonth})`)} · ${this.str("year to date", "Jahresverlauf")}`
            : this.str("current period", "aktueller Zeitraum");
        const mtdLabel = `MTD ${mtdMonth} · ${this.str("month", "Monat")}`;
        const fyLabel = `${fyYear} · ${this.str("outlook", "Ausblick")} AC&FC ${this.str("vs", "vs.")} PL`;
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
        } else if (ui.preset === "dall") {
            // PY, PL and FC next to each other: one Δ bar + Δ% pin per reference,
            // the axis notation keeps them apart (gray / double line / dashed)
            for (const r of ["py", "pl", "fc"] as Scenario[]) {
                if (this.has[r]) { push(ytd, r, "ac", false); }
            }
        } else if (ui.preset === "acpydpy" && this.has.py) {
            ytd.push({ kind: "val", scen: "py", block: "ytd", label: "PY" }); push(ytd, "py", "ac", false);
        } else if (ui.preset === "acpldpl" && this.has.pl) {
            ytd.push({ kind: "val", scen: "pl", block: "ytd", label: "PL" }); push(ytd, "pl", "ac", false);
        } else if (ui.preset === "dpct") {
            if (this.has.py) { ytd.push({ kind: "pin", ref: "py", minuend: "ac", block: "ytd", label: "ΔPY%" }); }
            if (this.has.pl) { ytd.push({ kind: "pin", ref: "pl", minuend: "ac", block: "ytd", label: "ΔPL%" }); }
        }
        blocks.push({ key: "ytd", label: ytdLabel, specs: ytd });
        if (fy.length > 0) { blocks.push({ key: "fy", label: `${fyYear} · ${this.str("outlook (FC)", "Ausblick (FC)")}`, specs: fy }); }
        return blocks;
    }

    /** the columns of all blocks in render order, gap columns in between */
    private flatCols(blocks: Block[]): ColSpec[] {
        const cols: ColSpec[] = [];
        blocks.forEach((b, i) => {
            if (i > 0) { cols.push({ kind: "gap", label: "" }); }
            cols.push(...b.specs);
        });
        return cols;
    }

    /**
     * Pixel geometry of the table. `k` squeezes the chart columns (fit mode):
     * only the drawn half of a Δ bar / Δ% pin and the value-bar span shrink, the
     * label lanes stay — a tighter table never clips a number, and the uniform
     * Δ scale is untouched (the same delta simply maps to fewer pixels).
     * k = 1 with pad = CELL_PAD reproduces the natural layout exactly.
     */
    private tableGeo(cols: ColSpec[], gc: GeoCache, maxAbsDelta: number,
        k: number, pad: number): TableGeo {
        const compact = this.ui!.density === "compact";
        // the type scale reaches the geometry as well: rows, label lanes, value
        // columns and the drawn bars grow with the type, so a Full-HD or UHD
        // table stays the same picture — only bigger — and never clips a number
        const fscale = this.fontScale();
        const rowH = Math.round((compact ? 18 : 23) * fscale);
        const fs = Math.round((compact ? 10 : 11) * fscale);
        const BAR_HALF = Math.max(34 * k * fscale, FIT_BAR_HALF_MIN);
        const PIN_HALF = Math.max(24 * k * fscale, FIT_PIN_HALF_MIN);
        const lk = Math.max(k, FIT_LABEL_MIN);
        const labelFs = fs * lk;
        // The in-chart labels sit a fixed 1.5 / 1 px below their lane size, and
        // the per-character estimate below is calibrated against exactly that
        // pairing at scale 1. A fixed offset loses its share as the type grows,
        // so both halves of the calibration follow the scale: the drawn label
        // keeps its relative offset, and the lane keeps the headroom the
        // estimate had — at scale 1 both terms vanish and nothing moves.
        const barLabelFs = labelFs - 1.5 * fscale;
        const valLabelFs = labelFs - fscale;
        const laneSlack = (fscale - 1) * 3;
        const dLabelW = Math.ceil(gc.dLabelLen * (labelFs * 0.52 + laneSlack)) + 4;
        const pLabelW = Math.ceil(gc.pLabelLen * (labelFs * 0.52 + laneSlack)) + 4;
        const barW = 2 * (BAR_HALF + dLabelW + 4) + 8;
        const pinW = 2 * (PIN_HALF + pLabelW + 4) + 8;
        const valW = Math.round((compact ? 66 : 76) * lk * fscale);

        // shared display-space scale for the value / cascade bars
        let vAxisX = 0; let vPpu = 0; let vLabelW = 0; let vbarW = 0;
        const hasVbar = cols.some(c => c.kind === "vbar");
        if (hasVbar || gc.wf.size > 0) {
            vLabelW = Math.ceil(gc.vLabelLen * (fs * 0.52 + laneSlack)) + 4;
            const full = (gc.wf.size > 0 ? (compact ? 190 : 240) : (compact ? 150 : 190)) * fscale;
            const span = Math.max(full * k, FIT_SPAN_MIN);
            vPpu = span / ((gc.maxPosD + gc.maxNegD) || 1);
            vAxisX = 4 + vLabelW + gc.maxNegD * vPpu;
            vbarW = span + 2 * (vLabelW + 4) + 8;
        }

        const gapW = Math.round(18 * fscale);
        let colsW = 0;
        for (const c of cols) {
            colsW += pad + (c.kind === "gap" ? gapW
                : c.kind === "val" || c.kind === "pct" ? valW
                    : c.kind === "vbar" || c.kind === "wbar" ? vbarW
                        : c.kind === "bar" ? barW : pinW);
        }
        return { rowH, fs, labelFs, barLabelFs, valLabelFs, BAR_HALF, PIN_HALF, barW, pinW, valW, maxAbsDelta,
            vbarW, vAxisX, vPpu, vLabelW, gapW,
            sepExtraH: Math.round(SEP_EXTRA_H * fscale),
            sparkH: Math.round(SPARK_ROW_H * fscale), colsW };
    }

    /**
     * Fit mode: with the table on screen, solve for the one squeeze factor that
     * brings it inside the viewport. Everything the column geometry does not own
     * — the auto-width row-label column, a value cell that grew past its width
     * rather than cut a number — is *measured*, never estimated, so calling this
     * again after a rebuild corrects the previous pass. Returns true when the
     * table has to be built once more, tighter; false once nothing more can be
     * won, and then the rest simply keeps scrolling (no squashing).
     */
    private solveFit(fmt: Fmt, maxAbsDelta: number): boolean {
        const table = this.tableEl;
        const avail = this.root.clientWidth;
        if (!table || avail <= 0) { return false; }
        const now = table.getBoundingClientRect().width;
        const room = avail - 2 * TABLE_PAD_X;
        if (now <= room) { return false; }
        const cols = this.flatCols(this.colSpecs());
        const gc = this.geoScans(cols, fmt);
        const wide = (k: number, pad: number): number =>
            this.tableGeo(cols, gc, maxAbsDelta, k, pad).colsW;
        const target = room - (now - wide(this.fitK, this.fitPad));
        let k = 1;
        if (wide(1, CELL_PAD_MIN) > target) {
            let lo = 0; let hi = 1;
            for (let i = 0; i < 24; i++) {
                const mid = (lo + hi) / 2;
                if (wide(mid, CELL_PAD_MIN) > target) { hi = mid; } else { lo = mid; }
            }
            k = lo;
        }
        // the floors are reached — a further pass would change nothing
        if (k >= this.fitK - 0.002 && this.fitPad === CELL_PAD_MIN) { return false; }
        this.fitK = Math.min(k, this.fitK);
        this.fitPad = CELL_PAD_MIN;
        return true;
    }

    private buildTable(fmt: Fmt, maxAbsDelta: number): HTMLElement {
        const model = this.model!; const ui = this.ui!;
        const collapsed = new Set(ui.collapsed);
        let visible = flattenVisible(model.roots, collapsed);
        if (ui.hideZero) { visible = visible.filter(n => n.row.rowType === "separator" || !isZeroRow(n)); }

        const revBase = revenueBase(model, this.settings.columnsCard.revenueBase.value);
        const blocks = this.colSpecs();
        const cols = this.flatCols(blocks);

        // label maxima, cascade segments and bar extrema are O(rows) scans —
        // memoized per model + column set + number format (see geoScans)
        const gc = this.geoScans(cols, fmt);
        // waterfall view: cascade segments per scenario (tree order, expand-independent)
        this.wfSegs = gc.wf;
        const geo = this.tableGeo(cols, gc, maxAbsDelta, this.fitK, this.fitPad);

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
        wrap.style.cssText = `padding:2px ${TABLE_PAD_X}px 8px ${TABLE_PAD_X}px;`;

        const table = document.createElement("div");
        table.style.cssText = "display:table;border-collapse:collapse;";
        this.tableEl = table;
        table.appendChild(this.stickyHeaderRow(this.blockHeaderRow(blocks, geo)));
        table.appendChild(this.stickyHeaderRow(this.headerRow(cols, geo)));

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
                acc += geo.rowH
                    + (visible[i].row.rowType === "separator" ? geo.sepExtraH : 0)
                    + (sparkOn(visible[i]) ? geo.sparkH : 0);
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
            const guess = Math.ceil((this.root.clientHeight || 800) / Math.max(geo.rowH, 1)) + 2 * VIRT_BUFFER;
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
        const li = this.mtdIndex();
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
        c.style.cssText = `display:table-cell;vertical-align:middle;padding:1px ${this.fitPad}px 1px 0;` +
            `width:${w > 0 ? w + "px" : "auto"};text-align:${align};font-size:${fs}px;white-space:nowrap;`;
        return c;
    }

    /**
     * Lift one header row out of the scroll: the row itself carries the marker
     * the layout pass finds, its cells carry the sticky position (a table row is
     * no positioning box). The paper fill is what the body rows disappear behind.
     */
    /**
     * Sticky header rows cannot be stickied in place: Chromium paints
     * position:sticky table-cells BEHIND later body content (hit-testing says
     * otherwise), so the scrolling rows bleed through the header. Instead the
     * in-table rows only keep driving the column widths (visibility:hidden),
     * and applySticky() overlays a floating clone that is repositioned on
     * every scroll frame — an ordinary div, painted in declared z-order.
     */
    private stickyHeaderRow(row: HTMLElement): HTMLElement {
        row.setAttribute("data-pnl", "hdr-row");
        if (!this.sticky()) { return row; }
        const cells = row.children;
        for (let i = 0; i < cells.length; i++) {
            (cells[i] as HTMLElement).style.visibility = "hidden";
        }
        return row;
    }

    /** overlay clone of the header rows — see stickyHeaderRow */
    private buildFloatHead(topOffset: number): void {
        this.floatHeadEl?.remove();
        this.floatHeadEl = null;
        const rows = this.root.querySelectorAll('[data-pnl="hdr-row"]');
        if (rows.length === 0) { return; }
        const table = rows[0].parentElement as HTMLElement;
        const bg = this.pageBg();
        const wrap = document.createElement("div");
        wrap.setAttribute("data-pnl", "float-head");
        wrap.style.cssText = "position:absolute;z-index:25;pointer-events:none;" +
            `display:table;table-layout:fixed;background:${bg};` +
            `box-shadow:0 1px 0 ${bg},0 -1px 0 ${bg};`;
        for (let r = 0; r < rows.length; r++) {
            const row = rows[r] as HTMLElement;
            const clone = row.cloneNode(true) as HTMLElement;
            clone.removeAttribute("data-pnl");
            const src = row.children; const dst = clone.children;
            for (let i = 0; i < src.length; i++) {
                const d = dst[i] as HTMLElement;
                d.style.visibility = "visible";
                d.style.width = (src[i] as HTMLElement).getBoundingClientRect().width.toFixed(2) + "px";
                d.style.boxSizing = "border-box";
                d.style.overflow = "hidden";
            }
            wrap.appendChild(clone);
        }
        const rb = this.root.getBoundingClientRect();
        const tb = table.getBoundingClientRect();
        wrap.style.left = (tb.left - rb.left + this.root.scrollLeft).toFixed(2) + "px";
        this.floatTop = topOffset;
        this.root.appendChild(wrap);
        this.floatHeadEl = wrap;
        this.syncFloatHead();
    }

    /** pin the floating header just under the frozen head, in content space */
    private syncFloatHead(): void {
        if (!this.floatHeadEl) { return; }
        this.floatHeadEl.style.top = (this.root.scrollTop + this.floatTop).toFixed(2) + "px";
    }

    private blockHeaderRow(blocks: Block[], geo: { valW: number; barW: number; pinW: number; vbarW: number; fs: number; gapW: number }): HTMLElement {
        const row = document.createElement("div");
        row.style.cssText = "display:table-row;";
        const hfs = this.headerFs(9);
        const ink = this.headerInk();
        row.appendChild(this.cell(0, "left", geo.fs));
        blocks.forEach((b, bi) => {
            if (bi > 0) { row.appendChild(this.cell(geo.gapW, "center", hfs)); }
            b.specs.forEach((spec, si) => {
                const c = this.cell(0, "center", hfs);
                c.style.cssText += `color:${ink};border-bottom:1px solid ${C.gridSoft};`;
                if (si === 0) { c.textContent = b.label; c.style.whiteSpace = "nowrap"; }
                void spec;
                row.appendChild(c);
            });
        });
        return row;
    }

    private headerRow(cols: ColSpec[], geo: { valW: number; barW: number; pinW: number; vbarW: number; fs: number; gapW: number }): HTMLElement {
        const row = document.createElement("div");
        row.style.cssText = "display:table-row;";
        const gapFs = this.headerFs(9);
        const hfs = this.headerFs(9.5);
        const ink = this.headerInk();
        row.appendChild(this.cell(0, "left", geo.fs));
        for (const c of cols) {
            if (c.kind === "gap") { row.appendChild(this.cell(geo.gapW, "center", gapFs)); continue; }
            const w = c.kind === "val" || c.kind === "pct" ? geo.valW
                : (c.kind === "vbar" || c.kind === "wbar") ? geo.vbarW
                : c.kind === "bar" ? geo.barW : geo.pinW;
            const cell = this.cell(w, c.kind === "val" || c.kind === "pct" ? "right" : "center", hfs);
            cell.style.color = ink;
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
        geo: TableGeo, revBase: PnlNode | null): HTMLElement {
        const ui = this.ui!;
        const t = node.row.rowType;
        const isRatio = t === "kpi";
        const isSum = t === "subtotal" || t === "formula";
        const indent = this.settings.hierarchyCard.indent.value;

        const row = document.createElement("div");
        row.style.cssText = `display:table-row;height:${geo.rowH}px;`;
        if (t === "separator") {
            const c = this.cell(0, "left", this.k(9));
            c.style.cssText += `padding-top:${this.kpx(9)};font-weight:600;color:${C.soft};`;
            c.textContent = node.row.name === node.row.id ? "" : node.row.name;
            row.appendChild(c);
            return row;
        }

        // name cell
        const name = this.cell(0, "left", geo.fs);
        name.style.paddingLeft = `${node.level * indent}px`;
        name.style.minWidth = this.kpx(230);
        if (isSum) { name.style.fontWeight = "600"; }
        if (node.isOrphanBucket) { name.style.color = this.badColor(); }
        if (isRatio) { name.style.fontStyle = "italic"; name.style.color = C.soft; }

        if (node.hasChildren) {
            const open = !ui.collapsed.includes(node.row.id);
            const chev = document.createElement("span");
            chev.textContent = open ? "▾ " : "▸ ";
            chev.style.cssText = `cursor:pointer;color:${C.soft};font-size:${this.kpx(9)};`;
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
            idEl.style.cssText = `font-size:${this.kpx(8)};color:${C.soft};margin-right:${this.kpx(6)};`;
            idEl.textContent = rid;
            name.appendChild(idEl);
        }
        if (node.isOrphanBucket) { name.appendChild(document.createTextNode("⚠ ")); }
        const label = document.createElement("span");
        label.textContent = node.row.name;
        name.appendChild(label);
        if (node.error) {
            const err = document.createElement("span");
            err.style.cssText = `color:${this.badColor()};font-size:${this.kpx(8.5)};`;
            err.textContent = " ⚠ " + node.error;
            name.appendChild(err);
        }
        if (node.row.comment) {
            const n = this.commentNo.get(node.row.id);
            if (n != null) {
                const mark = document.createElement("span");
                mark.style.cssText = `color:${C.comment};font-size:${this.kpx(9.5)};` +
                    `margin-left:${this.kpx(5)};cursor:default;`;
                mark.textContent = String.fromCharCode(0x2460 + n - 1);
                mark.title = node.row.comment;
                name.appendChild(mark);
            }
        }
        // while segments are still loading, every aggregate says so — an
        // incomplete subtotal must never look like a final figure
        if (this.awaitingSegment && (isSum || isRatio)) {
            const inc = document.createElement("span");
            inc.style.cssText = `color:${C.loading};font-size:${this.kpx(9.5)};` +
                `margin-left:${this.kpx(5)};cursor:default;`;
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
            chip.style.cssText = `font-size:${this.kpx(8)};margin-left:${this.kpx(6)};` +
                `padding:0 ${this.kpx(4)};cursor:pointer;border-radius:2px;` +
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

        // selection: the value / chart cells carry the click (the name cell keeps
        // the chevron, the 12M chip keeps its own), the whole row carries the
        // right click — so the native context menu is reachable everywhere
        const canSelect = this.selectable(node);
        if (canSelect) {
            this.bindSelect(row, node, false);
            row.setAttribute("data-pnl-row", node.row.id);
            const cap = this.selCapNote(node);
            if (cap !== "") { row.title = this.str("Selection", "Selektion") + cap; }
        }
        const selected = canSelect && this.isSelected(node);
        if (selected) { row.setAttribute("data-pnl-sel", "1"); }
        const accent = this.accent();

        const lineTop = isSum && !isRatio;
        for (const c of cols) {
            if (c.kind === "gap") { row.appendChild(this.cell(geo.gapW, "center", geo.fs)); continue; }
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
            if (canSelect) {
                cell.style.cursor = "pointer";
                this.bindSelect(cell, node, true);
            }
            row.appendChild(cell);
        }
        // feedback of the set selection: a pale accent wash plus an accent
        // underline along the row. The wash is what separates it from the 1 px
        // sum rules that sit on TOP of a subtotal row. The other rows keep their
        // look — dimming a whole statement to mark one line would make the page
        // restless and would touch the IBCS data ink
        if (selected) {
            const wash = this.accentSoft(0.94);
            const kids = row.children;
            for (let i = 0; i < kids.length; i++) {
                const cell = kids[i] as HTMLElement;
                cell.style.background = wash;
                cell.style.boxShadow = `inset 0 -2px 0 ${accent}`;
            }
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
        geo: { rowH: number; fs: number; barLabelFs: number; BAR_HALF: number; barW: number; maxAbsDelta: number }, fmt: Fmt): HTMLElement {
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
        txt.setAttribute("font-size", String(geo.barLabelFs)); txt.setAttribute("font-family", FONT);
        txt.setAttribute("fill", v.good ? this.goodColor() : this.badColor());
        txt.textContent = fmt.val(v.delta, true);
        svg.appendChild(txt);
        cell.appendChild(svg);
        return cell;
    }

    private deltaPinCell(v: { deltaPct: number | null; good: boolean }, c: ColSpec,
        geo: { rowH: number; fs: number; barLabelFs: number; PIN_HALF: number; pinW: number }, fmt: Fmt): HTMLElement {
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
        txt.setAttribute("font-size", String(geo.barLabelFs)); txt.setAttribute("font-family", FONT);
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
        geo: { rowH: number; fs: number; valLabelFs: number; vbarW: number; vAxisX: number; vPpu: number },
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
            txt.setAttribute("font-size", String(geo.valLabelFs));
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
        geo: { rowH: number; fs: number; valLabelFs: number; vbarW: number; vAxisX: number; vPpu: number },
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
            txt.setAttribute("font-size", String(geo.valLabelFs));
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
        lead.style.cssText += `padding:2px 0 4px ${this.kpx(24)};`;
        const months = this.model!.months;
        const w = this.k(300); const h = this.k(34);
        const lfs = this.k(8);
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
        const X = (i: number): number =>
            this.k(26) + (i / Math.max(months.length - 1, 1)) * (w - this.k(60));
        const Y = (v: number): number => 4 + (1 - (v - min) / (max - min)) * (h - this.k(12));
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
        l0.setAttribute("font-size", String(lfs)); l0.setAttribute("font-family", FONT); l0.setAttribute("fill", C.soft);
        l0.textContent = this.monthLabel(months[0]);
        const l1 = document.createElementNS(ns, "text");
        l1.setAttribute("x", String(w - this.k(30))); l1.setAttribute("y", String(h / 2));
        l1.setAttribute("font-size", String(lfs)); l1.setAttribute("font-family", FONT); l1.setAttribute("fill", C.soft);
        l1.textContent = this.monthLabel(months[months.length - 1]);
        svg.appendChild(l0); svg.appendChild(l1);
        lead.appendChild(svg);
        row.appendChild(lead);
        for (let i = 0; i < colCount; i++) { row.appendChild(this.cell(0, "left", geo.fs)); }
        return row;
    }

    // ---------------- driver tree (DuPont) ----------------

    /**
     * The virtual total over all model roots, memoized per model version — the
     * top of a driver tree that has no formula row to start from. The engine
     * aggregates it like a subtotal; the label is the only thing the view adds.
     */
    private treeTotalNode(): PnlNode | null {
        const model = this.model;
        if (!model || model.roots.length === 0) { return null; }
        if (this.totalNode == null || this.totalVer !== this.modelVer) {
            const n = syntheticTotal(model);
            n.row.name = this.str("Total", "Gesamt");
            this.totalNode = n;
            this.totalVer = this.modelVer;
        }
        return this.totalNode;
    }

    /**
     * Node resolver of the tree: rows by id or unique name (exactly what the
     * formulas use) plus the virtual total root, so a re-root, a bookmark or a
     * tile view can name it like any other card.
     */
    private treeResolver(): (id: string) => PnlNode | undefined {
        const base = nodeResolver(this.model!);
        return (id: string): PnlNode | undefined =>
            (id === TOTAL_ID ? this.treeTotalNode() ?? undefined : undefined) ?? base(id);
    }

    /**
     * Auto root: the last formula/KPI row in P&L order whose formula actually
     * references other rows — in a P&L that is the bottom-line ratio
     * (net margin, ROI …), the natural top of a driver tree.
     *
     * A plain dimension hierarchy has no such row. There the tree starts at the
     * model root itself — and when the model carries several roots, at a virtual
     * total that sums them, so the reader still gets one top card to drill from.
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
        if (best) { return best; }
        const roots = this.model!.roots;
        if (roots.length === 1) { return roots[0]; }
        return this.treeTotalNode();
    }

    /** row id or unique row name → node (same resolution the formulas use) */
    private treeLookup(key: string | null | undefined, resolve: (id: string) => PnlNode | undefined): PnlNode | null {
        const k = (key ?? "").trim();
        if (k === "") { return null; }
        return resolve(k) ?? null;
    }

    /**
     * The one way a row branches: a formula / KPI row along its operands (the
     * operator ×÷+− comes from the formula), any other row along its account
     * hierarchy, where the operator is the child's sign convention — "+" for
     * income, "−" for cost rows, so the branch reads as "revenue − cost".
     * `drill` says the branch is the hierarchy, not the formula.
     */
    private treeBranches(node: PnlNode, resolve: (id: string) => PnlNode | undefined):
        { kids: { child: PnlNode; op: FormulaOp }[]; drill: boolean } {
        const t = node.row.rowType;
        if (t === "separator") { return { kids: [], drill: false }; }
        if (t === "formula" || t === "kpi") {
            return { kids: formulaOperands(node, resolve), drill: false };
        }
        const kids: { child: PnlNode; op: FormulaOp }[] = [];
        for (const child of node.children) {
            if (child.row.rowType === "separator") { continue; }
            kids.push({ child, op: child.row.sign === -1 ? "−" : "+" });
        }
        return { kids, drill: true };
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
            const b = this.treeBranches(card.node, resolve);
            card.drill = b.drill;
            const seen = new Set(path);
            const kids: { child: PnlNode; op: FormulaOp }[] = [];
            for (const o of b.kids) {
                const id = o.child.row.id;
                if (seen.has(id)) { continue; }
                seen.add(id);
                kids.push(o);
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
        const ui = this.ui!;
        const resolve = this.treeResolver();
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
            // — "last" is the last month that carries a value, so an empty tail
            // (year bound, actuals only up to the current month) never claims a
            // label it has no number for
            const dataIdx: number[] = [];
            slots.forEach((sl, i) => { if (sl.v != null) { dataIdx.push(i); } });
            const marked = dataIdx.length > 0
                ? new Set<number>([dataIdx[0], dataIdx[dataIdx.length - 1]])
                : new Set<number>([0, n - 1]);
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
        const refv = this.has[ref] ? this.ytdDisplay(node, ref) : null;
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
        const v = this.ytdVariance(node, ref);
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
    private treeZoomHide(): void {
        if (this.zoomTimer != null) { clearTimeout(this.zoomTimer); this.zoomTimer = null; }
        if (this.zoomEl) { this.zoomEl.remove(); this.zoomEl = null; }
    }

    /**
     * Hover zoom of one driver-tree card: the full IBCS detail view of that
     * node — YTD values and variances for every scenario, the FY outlook, and
     * the three chart forms (offset monthly columns, Δ columns, bridge) at
     * readable size. Pointer events stay off so the panel never traps the
     * mouse; it lives inside the visual root and clamps to the viewport.
     */
    private treeZoomShow(node: PnlNode, anchor: Element, fmt: Fmt): void {
        this.treeZoomHide();
        const ns = "http://www.w3.org/2000/svg";
        const isRatio = node.row.rowType === "kpi";
        const unit = isRatio ? "%" : (fmt.suffix + this.settings.numbersCard.unitText.value).trim();
        const zk = this.fontScale();
        const W = this.k(396); const inner = W - this.k(26);
        const box = document.createElement("div");
        box.style.cssText = `position:absolute;z-index:40;width:${W}px;background:${this.cardBg()};` +
            `border:1px solid ${C.cardEdge};border-radius:6px;` +
            `box-shadow:0 6px 20px rgba(15,30,46,.16);` +
            `padding:${this.kpx(12)} ${this.kpx(14)} ${this.kpx(8)} ${this.kpx(14)};` +
            `pointer-events:none;font-family:${FONT};box-sizing:border-box;`;

        // ---- header: name + unit + Δ headline in the status colour
        const va = this.treeVariance(node);
        const vColor = va == null ? null : (va.good ? this.goodColor() : this.badColor());
        const head = document.createElement("div");
        head.style.cssText = `display:flex;align-items:baseline;gap:${this.kpx(8)};margin-bottom:1px;`;
        const nm = document.createElement("div");
        nm.style.cssText = `flex:1;font-size:${this.kpx(13)};font-weight:700;color:${C.text};` +
            "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
        const cno = this.commentNo.get(node.row.id);
        nm.textContent = node.row.name + (cno != null ? " " + String.fromCharCode(0x2460 + cno - 1) : "");
        head.appendChild(nm);
        const un = document.createElement("div");
        un.style.cssText = `font-size:${this.kpx(9)};color:${C.soft};white-space:nowrap;`;
        un.textContent = unit;
        head.appendChild(un);
        if (vColor && va && va.deltaPct != null) {
            const dp = document.createElement("div");
            dp.style.cssText = `font-size:${this.kpx(11)};font-weight:700;color:${vColor};white-space:nowrap;`;
            dp.textContent = fmt.pct(va.deltaPct, true);
            head.appendChild(dp);
        }
        box.appendChild(head);
        const sub = document.createElement("div");
        sub.style.cssText = `font-size:${this.kpx(9)};color:${C.soft};margin-bottom:${this.kpx(7)};`;
        const acct = node.row.rowType === "account" ? node.row.id : "";
        sub.textContent = [acct, node.row.formulaDef ? "= " + node.row.formulaDef : "",
            this.periodTag()].filter(Boolean).join(" · ");
        box.appendChild(sub);

        box.appendChild(this.treeScenGrid(node, fmt));

        // ---- charts: months (offset columns + triangles), Δ columns, bridge
        const refUp = this.ui!.ref.toUpperCase();
        const caption = (t: string): void => {
            const c = document.createElement("div");
            c.style.cssText = `font-size:${this.kpx(8.5)};color:${C.soft};margin:2px 0 1px 0;`;
            c.textContent = t;
            box.appendChild(c);
        };
        const chart = (h: number, draw: (g: SVGGElement, svg: SVGSVGElement) => void): void => {
            const svg = document.createElementNS(ns, "svg") as SVGSVGElement;
            svg.setAttribute("width", String(inner)); svg.setAttribute("height", String(h));
            svg.style.cssText = "display:block;";
            const g = document.createElementNS(ns, "g") as SVGGElement;
            svg.appendChild(g);
            box.appendChild(svg);
            draw(g, svg);
        };
        const zs = 1.15 * zk;
        caption(this.str(`Months — AC solid, ${refUp} behind`, `Monate — AC solide, ${refUp} dahinter`));
        chart(this.k(104), (g, svg) => this.treeMini(g, node, { x: 0, y: 2, w: inner, h: this.k(100) }, zs, fmt, svg, 0));
        caption(`Δ${refUp} ` + this.str("per month", "je Monat"));
        chart(this.k(72), (g) => this.treeMiniDelta(g, node, { x: 0, y: 2, w: inner, h: this.k(68) }, zs, fmt, 0));
        caption(this.str(`Bridge ${refUp} → Δ → AC (YTD)`, `Brücke ${refUp} → Δ → AC (YTD)`));
        chart(this.k(84), (g, svg) => this.treeMiniBridge(g, node, { x: 0, y: 2, w: inner, h: this.k(80) }, zs, fmt, svg, 0));

        if (node.row.comment) {
            const cm = document.createElement("div");
            cm.style.cssText = `font-size:${this.kpx(9)};color:${C.soft};font-style:italic;` +
                `margin-top:6px;border-top:1px solid ${C.gridSoft};padding-top:5px;line-height:1.45;`;
            cm.textContent = node.row.comment;
            box.appendChild(cm);
        }
        if (node.error) {
            const er = document.createElement("div");
            er.style.cssText = `font-size:${this.kpx(9)};color:${this.badColor()};margin-top:4px;`;
            er.textContent = "⚠ " + node.error;
            box.appendChild(er);
        }

        // ---- place next to the card, clamped to the visible viewport
        this.root.appendChild(box);
        const ar = anchor.getBoundingClientRect();
        const rr = this.root.getBoundingClientRect();
        const bh = box.offsetHeight;
        let left = ar.right - rr.left + this.root.scrollLeft + 10;
        if (left + W > this.root.scrollLeft + this.root.clientWidth - 6) {
            left = Math.max(this.root.scrollLeft + 6,
                ar.left - rr.left + this.root.scrollLeft - W - 10);
        }
        let top = ar.top - rr.top + this.root.scrollTop - 4;
        top = Math.min(top, this.root.scrollTop + this.root.clientHeight - bh - 8);
        top = Math.max(top, this.root.scrollTop + 4);
        box.style.left = left.toFixed(0) + "px";
        box.style.top = top.toFixed(0) + "px";
        this.zoomEl = box;
    }

    /**
     * Scenario grid of a detail view: the YTD value per scenario, its Δ against
     * AC absolute and in %, coloured by the good/bad evaluation the table uses,
     * plus the FY outlook row when full-year measures are loaded.
     */
    private treeScenGrid(node: PnlNode, fmt: Fmt, compact = false): HTMLElement {
        const isRatio = node.row.rowType === "kpi";
        const num = (v: number | null, plus = false): string =>
            v == null ? "·" : isRatio ? fmt.pct(v, plus) : fmt.val(v, plus);
        // a ratio does not vary in mEUR: its absolute Δ is a percentage-point
        // figure, so the column is labelled "Δ pp" and drops the unit sign
        const dNum = (v: number | null): string => {
            if (v == null) { return "·"; }
            if (!isRatio) { return fmt.val(v, true); }
            return fmt.pct(v, true).replace("%", "");
        };
        const grid = document.createElement("div");
        grid.setAttribute("data-pnl", "scen-grid");
        grid.style.cssText = `display:table;width:100%;border-collapse:collapse;margin:${compact ? 6 : 8}px 0;` +
            `border-top:1px solid ${C.gridSoft};padding-top:4px;`;
        const pad = this.k(compact ? 0.5 : 1.5);
        const fs = this.k(compact ? 9 : 10);
        const cellPad = this.k(8);
        const row = (cells: string[], opts?: { bold?: boolean; color?: (string | null)[] }): void => {
            const r = document.createElement("div");
            r.style.cssText = "display:table-row;";
            cells.forEach((cTxt, i) => {
                const c = document.createElement("div");
                c.style.cssText = `display:table-cell;padding:${pad}px 0 ${pad}px ${cellPad}px;font-size:${fs}px;` +
                    `font-family:${FONT};font-variant-numeric:tabular-nums;` +
                    (i === 0 ? `text-align:left;padding-left:0;color:${C.soft};` : "text-align:right;") +
                    (opts?.bold ? "font-weight:700;" : "") +
                    (opts?.color?.[i] ? `color:${opts.color[i]};font-weight:600;` : "");
                c.textContent = cTxt;
                r.appendChild(c);
            });
            grid.appendChild(r);
        };
        const inv = node.row.displayInvert ? -1 : 1;
        // references read over the same window as AC — "YTD _Aug" says so
        const ytdLbl = this.ytdFull() ? "YTD" : `YTD _${this.ytdMarker()}`;
        row(["", ytdLbl, isRatio ? "Δ pp" : "Δ AC", "Δ%"], { bold: false });
        row(["AC", num(displayValue(node, "ac")), "", ""], { bold: true });
        for (const sc of ["py", "pl", "fc"] as Scenario[]) {
            if (!this.has[sc]) { continue; }
            const v = this.ytdVariance(node, sc);
            const col = v.delta == null ? null : (v.good ? this.goodColor() : this.badColor());
            row([sc.toUpperCase(), num(this.ytdDisplay(node, sc)),
                dNum(v.delta == null ? null : v.delta * inv),
                v.deltaPct == null ? "·" : fmt.pct(v.deltaPct * inv, true)],
            { color: [null, null, col, col] });
        }
        if (this.has.fcfy) {
            const fy = variance(node, "plfy", "fcfy");
            const col = fy.delta == null ? null : (fy.good ? this.goodColor() : this.badColor());
            row(["FY FC" + (this.has.plfy ? " · PL" : ""),
                num(displayValue(node, "fcfy")),
                this.has.plfy ? dNum(fy.delta == null ? null : fy.delta * inv) : "",
                this.has.plfy && fy.deltaPct != null ? fmt.pct(fy.deltaPct * inv, true) : ""],
            { color: [null, null, col, col] });
        }
        return grid;
    }

    /** dwell on an element to open the IBCS detail panel of one node */
    private treeHoverZoom(el: Element, node: PnlNode, fmt: Fmt): void {
        el.addEventListener("mouseenter", () => {
            if (this.zoomTimer != null) { clearTimeout(this.zoomTimer); }
            this.zoomTimer = setTimeout(() => {
                this.zoomTimer = null;
                this.treeZoomShow(node, el, fmt);
            }, 260);
        });
        el.addEventListener("mouseleave", () => this.treeZoomHide());
    }

    /** period tag of the headline, e.g. "2026 Jan..Jun" */
    private periodTag(): string {
        const months = this.model!.months;
        if (months.length === 0) { return ""; }
        const a = months[0]; const b = months[months.length - 1];
        return this.yearPrefix(`${this.monthLabel(a)}..${this.monthLabel(b)}`);
    }

    private treeCardG(card: TreeCard, geo: { cw: number; s: number; fmt: Fmt; svg: SVGSVGElement },
        reroot: boolean): SVGGElement {
        const ns = "http://www.w3.org/2000/svg";
        const ui = this.ui!;
        const s = geo.s;
        const cardH = card.h;
        const g = document.createElementNS(ns, "g") as SVGGElement;
        // the drop shadow of the card: one soft slab a pixel below the box —
        // an svg filter would repaint the whole tree on every hover
        const shade = document.createElementNS(ns, "rect");
        // rx 5, a hair softer than the box — and never confusable with the card
        shade.setAttribute("x", (card.x + 0.5).toFixed(2));
        shade.setAttribute("y", (card.y + 1.5).toFixed(2));
        shade.setAttribute("width", geo.cw.toFixed(2)); shade.setAttribute("height", cardH.toFixed(2));
        shade.setAttribute("rx", "5"); shade.setAttribute("fill", "none");
        shade.setAttribute("stroke", "rgba(15,30,46,.06)"); shade.setAttribute("stroke-width", "2");
        g.appendChild(shade);
        // crisp 1 px edge without moving the card: the renderer snaps the stroke
        // to the pixel grid, the geometry the bus lines rely on stays exact
        const box = document.createElementNS(ns, "rect");
        box.setAttribute("x", card.x.toFixed(2)); box.setAttribute("y", card.y.toFixed(2));
        box.setAttribute("width", geo.cw.toFixed(2)); box.setAttribute("height", cardH.toFixed(2));
        box.setAttribute("rx", "4"); box.setAttribute("fill", this.cardBg());
        box.setAttribute("stroke", C.cardEdge); box.setAttribute("stroke-width", "1");
        box.setAttribute("shape-rendering", "crispEdges");
        g.appendChild(box);
        // hover: the edge darkens, the shadow gains a touch — nothing moves.
        // A card that carries the current selection keeps its accent edge.
        const selCard = this.isSelected(card.node) && this.selectable(card.node);
        g.addEventListener("mouseenter", () => {
            if (!selCard) { box.setAttribute("stroke", C.cardEdgeHover); }
            shade.setAttribute("stroke", "rgba(15,30,46,.10)");
        });
        g.addEventListener("mouseleave", () => {
            if (!selCard) { box.setAttribute("stroke", C.cardEdge); }
            shade.setAttribute("stroke", "rgba(15,30,46,.06)");
        });

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
            circ.setAttribute("stroke", C.refGray); circ.setAttribute("stroke-width", "1");
            rr.appendChild(circ);
            const tick = (dx: number, dy: number): void => {
                const l = document.createElementNS(ns, "line");
                l.setAttribute("x1", (cx + dx * r).toFixed(2)); l.setAttribute("y1", (cy + dy * r).toFixed(2));
                l.setAttribute("x2", (cx + dx * r * 2).toFixed(2)); l.setAttribute("y2", (cy + dy * r * 2).toFixed(2));
                l.setAttribute("stroke", C.refGray); l.setAttribute("stroke-width", "1");
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

        // the face of the card — the chart (or, on a compact card, the value
        // line) — is the hit area that opens the tile view of this driver
        let face: { x: number; y: number; w: number; h: number };
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
            const top = card.y + pad + tfs + 2 * s;
            face = {
                x: card.x + pad, y: top,
                w: geo.cw - 2 * pad - (card.hasKids ? 20 * s : 0),
                h: Math.max(card.y + cardH - pad - top, 4),
            };
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
            face = area;
        }

        // click target over the face — the "+N" badge and the chevron are drawn
        // after it, so those controls keep their own clicks
        const zoomHit = document.createElementNS(ns, "rect");
        zoomHit.setAttribute("x", face.x.toFixed(2)); zoomHit.setAttribute("y", face.y.toFixed(2));
        zoomHit.setAttribute("width", Math.max(face.w, 1).toFixed(2));
        zoomHit.setAttribute("height", Math.max(face.h, 1).toFixed(2));
        zoomHit.setAttribute("fill", "#FFF"); zoomHit.setAttribute("fill-opacity", "0.01");
        zoomHit.style.cursor = "pointer";
        const zt = document.createElementNS(ns, "title");
        zt.textContent = this.str("Open the tile view of this driver",
            "Kachel-Ansicht dieses Treibers öffnen");
        zoomHit.appendChild(zt);
        zoomHit.onclick = (e: Event): void => {
            e.stopPropagation();
            ui.treeZoom = card.node.row.id;
            this.persistUi(); this.rerender();
        };
        g.appendChild(zoomHit);

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
            hit.setAttribute("stroke", C.ctlEdge);
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
                ? this.str("Expand (Shift: whole limb)", "Aufklappen (Shift: ganzer Ast)")
                : this.str("Collapse", "Zuklappen");
            ch.appendChild(ct);
            const toggle = (e: Event): void => {
                e.stopPropagation();
                const ctx = this.treeCtx;
                const cur = new Set(ui.treeCollapsed ?? ctx?.auto ?? []);
                const id = card.node.row.id;
                if (cur.has(id)) {
                    // plain click opens only this node — the children keep
                    // their own remembered fold state; Shift opens the limb
                    cur.delete(id);
                    if ((e as MouseEvent).shiftKey) {
                        const done = new Set<string>();
                        const stack = [id];
                        while (stack.length > 0) {
                            const n = stack.pop()!;
                            if (done.has(n)) { continue; }
                            done.add(n);
                            cur.delete(n);
                            for (const k of ctx?.kidsOf.get(n) ?? []) { stack.push(k); }
                        }
                    }
                } else { cur.add(id); }
                ui.treeCollapsed = [...cur];
                this.persistUi(); this.rerender();
            };
            hit.style.cursor = "pointer"; ch.style.cursor = "pointer";
            hit.onclick = toggle; ch.onclick = toggle;
            g.appendChild(hit); g.appendChild(ch);
        }

        // selection: the left click of a tree card already belongs to the tile
        // view, so a card only carries the RIGHT click (native context menu).
        // A selected card wears the accent on its edge — the data ink is IBCS
        // and stays untouched.
        if (this.selectable(card.node)) {
            this.bindSelect(g, card.node, false);
            if (selCard) {
                box.setAttribute("stroke", this.accent());
                box.setAttribute("stroke-width", "2");
                g.setAttribute("data-pnl-sel", "1");
            }
        }

        // hover zoom: after a short dwell the card opens its IBCS detail view
        this.treeHoverZoom(g, card.node, geo.fmt);
        return g;
    }

    /** breadcrumb over a path of cards: every segment but the last is a jump */
    private treeBreadcrumb(path: PnlNode[], onPick: (node: PnlNode, i: number) => void,
        tip: string): HTMLElement {
        const crumbs = document.createElement("div");
        crumbs.style.cssText = `font-size:${this.kpx(10.5)};color:${C.soft};margin:0 0 4px 0;` +
            `padding:0;line-height:1.5;display:flex;gap:${this.kpx(6)};flex-wrap:wrap;align-items:center;`;
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
                : `color:${C.soft};cursor:pointer;text-decoration:underline;transition:${TRANSITION};`;
            if (!last) {
                seg.title = tip;
                seg.onmouseenter = (): void => { seg.style.color = this.accent(); };
                seg.onmouseleave = (): void => { seg.style.color = C.soft; };
                seg.onclick = (e: Event): void => {
                    e.stopPropagation();
                    onPick(node, i);
                    this.persistUi(); this.rerender();
                };
            }
            crumbs.appendChild(seg);
        });
        return crumbs;
    }

    /** footnote numbers of the tree, in card reading order */
    private treeComments(cards: TreeCard[]): void {
        this.comments = [];
        this.commentNo.clear();
        for (const c of cards) {
            const text = c.node.row.comment;
            if (!text || this.commentNo.has(c.node.row.id)) { continue; }
            const n = this.comments.length + 1;
            this.comments.push({ n, node: c.node, text });
            this.commentNo.set(c.node.row.id, n);
        }
    }

    /** path through the built graph from the tree root down to one node */
    private treeZoomPath(ctx: TreeCtx, node: PnlNode): PnlNode[] {
        const id = node.row.id;
        const rootId = ctx.root.row.id;
        if (id === rootId) { return [ctx.root]; }
        const prev = new Map<string, string>();
        const seen = new Set<string>([rootId]);
        const queue = [rootId];
        let head = 0;
        let found = false;
        while (head < queue.length && !found) {
            const cur = queue[head++];
            for (const k of ctx.kidsOf.get(cur) ?? []) {
                if (seen.has(k)) { continue; }
                seen.add(k); prev.set(k, cur); queue.push(k);
                if (k === id) { found = true; break; }
            }
        }
        // a node outside the built graph (card budget) still gets a way back
        if (!found) { return [ctx.root, node]; }
        const chain: PnlNode[] = [node];
        let cur = id;
        while (cur !== rootId) {
            const p = prev.get(cur);
            const n = p == null ? undefined : ctx.resolve(p);
            if (p == null || !n) { break; }
            chain.unshift(n);
            cur = p;
        }
        return chain;
    }

    /**
     * Tile view of one driver: the node itself as a large IBCS card in the
     * middle, the rows it feeds on the left, its own drivers on the right.
     * Every neighbour is a jump — the reader walks the formula graph one node
     * at a time instead of scanning the whole tree.
     */
    private buildTreeZoom(ctx: TreeCtx, node: PnlNode, fmt: Fmt): HTMLElement {
        const ui = this.ui!;
        const wrap = document.createElement("div");
        wrap.setAttribute("data-pnl", "zoom");
        wrap.style.cssText = `padding:0 ${TABLE_PAD_X}px 8px ${TABLE_PAD_X}px;`;

        // the way back is the dominant control of this page, the breadcrumb
        // rides next to it on the same optical line. It stays on screen with
        // the head above it — the page never loses its exit.
        const head = document.createElement("div");
        head.setAttribute("data-pnl", "zoom-head");
        head.style.cssText = `display:flex;gap:${this.kpx(16)};align-items:center;flex-wrap:wrap;` +
            `padding:${this.kpx(8)} 0;margin:0 0 8px 0;background:${this.pageBg()};` +
            (this.sticky() ? "position:sticky;top:0;z-index:20;" : "");
        head.appendChild(this.zoomBackBtn(() => { ui.treeZoom = null; }));
        // one gesture to the drillthrough targets of the page — only when the
        // host allows interactions and this card actually has a selection
        const drill = this.zoomDrillBtn(node);
        if (drill) { head.appendChild(drill); }
        const path = this.treeZoomPath(ctx, node);
        if (path.length > 1) {
            const crumbs = this.treeBreadcrumb(path, (n) => { ui.treeZoom = n.row.id; },
                this.str("Zoom into this card", "Auf diese Karte zoomen"));
            crumbs.style.margin = "0";
            head.appendChild(crumbs);
        }
        wrap.appendChild(head);

        // three columns: what this row feeds · the row itself · what drives it.
        // They start on one line (flex-start) — a neighbour column never
        // stretches the row, it takes the tile height in the layout pass.
        const avail = this.root.clientWidth || 900;
        // the neighbour columns carry type too — their width follows the scale,
        // but never past a fifth of the stage, so the tile keeps the stage
        const sideW = Math.max(this.k(150),
            Math.min(this.k(215), Math.round(avail * (this.fontScale() > 1 ? 0.2 : 0.18))));
        const centerW = Math.max(340, avail - 2 * TABLE_PAD_X - 2 * sideW - 32);
        const cols = document.createElement("div");
        cols.setAttribute("data-pnl", "zoom-cols");
        cols.style.cssText = `display:flex;gap:${this.kpx(16)};align-items:flex-start;`;
        cols.appendChild(this.treeZoomSide(ctx, node, fmt, sideW, "parents"));
        cols.appendChild(this.treeZoomCenter(node, fmt, centerW));
        cols.appendChild(this.treeZoomSide(ctx, node, fmt, sideW, "children"));
        wrap.appendChild(cols);
        return wrap;
    }

    /**
     * The big middle tile: head, the integrated ChartKitchen chart (anchors,
     * monthly columns, cumulated Δ bridge, Δ% pins, AC+FC total) and the
     * scenario grid. Ratio rows are not additive, so they keep the monthly
     * chart and say why the bridge is missing.
     */
    private treeZoomCenter(node: PnlNode, fmt: Fmt, w: number): HTMLElement {
        const ns = "http://www.w3.org/2000/svg";
        const isRatio = node.row.rowType === "kpi";
        const unit = isRatio ? "%" : (fmt.suffix + this.settings.numbersCard.unitText.value).trim();
        // ---- head: name > formula > period, Δ headline in the status colour
        const va = this.treeVariance(node);
        const vColor = va == null ? null : (va.good ? this.goodColor() : this.badColor());
        // the tile wears the same status edge as every card in the tree — quiet,
        // 3 px on the left, so the whole page speaks one colour language
        const edge = this.ui!.treeStatus ? vColor : null;

        const tile = document.createElement("div");
        tile.setAttribute("data-pnl", "zoom-center");
        tile.style.cssText = `flex:1 1 ${w}px;min-width:0;background:${this.cardBg()};box-sizing:border-box;` +
            `border:1px solid ${C.cardEdge};border-radius:6px;box-shadow:${SHADOW};` +
            (edge ? `border-left:3px solid ${edge};` : "") +
            `padding:${this.kpx(16)} ${this.kpx(16)} ${this.kpx(12)} ${this.kpx(16)};`;
        // right click anywhere on the tile opens the native menu of this row
        this.bindSelect(tile, node, false);
        const inner = Math.max(w - 2 * this.k(16) - 2, 260);
        const head = document.createElement("div");
        head.style.cssText = `display:flex;align-items:baseline;gap:${this.kpx(8)};margin:0 0 2px 0;`;
        const nm = document.createElement("div");
        nm.setAttribute("data-pnl", "zoom-title");
        nm.style.cssText = `flex:1;font-size:${this.kpx(17)};font-weight:700;letter-spacing:-.01em;color:${C.text};` +
            "line-height:1.25;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
        const cno = this.commentNo.get(node.row.id);
        nm.textContent = node.row.name + (cno != null ? " " + String.fromCharCode(0x2460 + cno - 1) : "");
        // the tile head is the one left-click selection target of the tile page —
        // the charts below it stay reading surface, not controls
        if (this.selectable(node)) {
            nm.style.cursor = "pointer";
            nm.title = this.str("Set the page selection to this row",
                "Seiten-Selektion auf diese Zeile setzen") + this.selCapNote(node);
            this.bindSelect(nm, node, true);
            if (this.isSelected(node)) {
                nm.setAttribute("data-pnl-sel", "1");
                nm.style.boxShadow = `inset 0 -2px 0 ${this.accent()}`;
            }
        }
        head.appendChild(nm);
        const un = document.createElement("div");
        un.style.cssText = `font-size:${this.kpx(10)};color:${C.soft};white-space:nowrap;`;
        un.textContent = unit;
        head.appendChild(un);
        if (vColor && va && va.deltaPct != null) {
            const dp = document.createElement("div");
            dp.style.cssText = `font-size:${this.kpx(14)};font-weight:700;color:${vColor};white-space:nowrap;` +
                "font-variant-numeric:tabular-nums;";
            dp.textContent = fmt.pct(va.deltaPct, true);
            head.appendChild(dp);
        }
        tile.appendChild(head);
        const sub = document.createElement("div");
        sub.style.cssText = `font-size:${this.kpx(9.5)};color:${C.soft};line-height:1.5;` +
            `margin:0 0 ${this.kpx(16)} 0;`;
        const acct = node.row.rowType === "account" ? node.row.id : "";
        sub.textContent = [acct, node.row.formulaDef ? "= " + node.row.formulaDef : "",
            this.periodTag()].filter(Boolean).join(" · ");
        tile.appendChild(sub);

        const refUp = this.ui!.ref.toUpperCase();
        const chart = (h: number, draw: (g: SVGGElement, svg: SVGSVGElement) => void): void => {
            const svg = document.createElementNS(ns, "svg") as SVGSVGElement;
            svg.setAttribute("width", String(inner)); svg.setAttribute("height", String(h));
            svg.setAttribute("data-pnl", isRatio ? "zoom-months" : "zoom-combo");
            svg.style.cssText = "display:block;";
            const g = document.createElementNS(ns, "g") as SVGGElement;
            svg.appendChild(g);
            tile.appendChild(svg);
            draw(g, svg);
        };
        const note = (t: string): void => {
            const c = document.createElement("div");
            c.setAttribute("data-pnl", "zoom-note");
            c.style.cssText = `font-size:${this.kpx(9.5)};color:${C.soft};line-height:1.5;` +
                `margin:0 0 ${this.kpx(8)} 0;`;
            c.textContent = t;
            tile.appendChild(c);
        };
        const k = this.fontScale();
        // the chart is the elastic part of the page: it takes the height that is
        // left over after the head, the grid and the neighbour columns. Its type
        // follows the squeeze, but only down to ZOOM_FONT_MIN — clamped, so a
        // short page thins its labels out instead of shrinking them to crumbs.
        const full = Math.round(ZOOM_CHART_H * k);
        const sc = Math.max(ZOOM_FONT_MIN, Math.min(1, this.zoomChartH / Math.max(full, 1)));
        if (isRatio) {
            // percentages do not add up: no bridge, no stacked total — the
            // monthly comparison plus the grid is the honest picture here
            note(this.str(
                `Ratio row — percentages are not additive: no bridge and no AC+FC stack. `
                + `Months AC solid, ${refUp} offset behind, Δ${refUp} in the grid.`,
                `Quotenzeile — Prozente sind nicht additiv: keine Brücke, kein AC+FC-Stapel. `
                + `Monate AC solide, ${refUp} versetzt dahinter, Δ${refUp} im Grid.`));
            const h = Math.max(Math.round(this.zoomChartH * 0.55), Math.round(150 * k));
            chart(h, (g, svg) => this.treeMini(g, node,
                { x: 1, y: 4, w: inner - 2, h: h - 30 }, 1.5 * k * sc, fmt, svg, 0));
        } else {
            const h = this.zoomChartH;
            chart(h, (g, svg) => this.treeZoomCombo(g, node,
                { x: 1, y: 2, w: inner - 2, h: h - 6 }, 1.25 * k * sc, fmt, svg));
        }
        const skipped = isRatio ? 0 : this.treeMissingMonths(node);
        if (skipped > 0) {
            // months without actuals and without a forecast are not zero months:
            // they carry no step, no column and no pin, and the comparison the
            // badge reports runs over the months that do have data
            note(this.str(
                `${skipped} month(s) without AC or FC are left out — bridge, Δ% pins and the total `
                + `compare only the months that carry data.`,
                `${skipped} Monat(e) ohne AC und FC bleiben außen vor — Brücke, Δ%-Pins und der `
                + `Gesamtvergleich rechnen nur mit den Monaten, die Daten tragen.`));
        }
        tile.appendChild(this.treeScenGrid(node, fmt, this.zoomChartH < ZOOM_GRID_COMPACT * k));

        if (node.row.comment) {
            const cm = document.createElement("div");
            cm.style.cssText = `font-size:${this.kpx(9.5)};color:${C.soft};font-style:italic;` +
                `margin-top:8px;border-top:1px solid ${C.gridSoft};padding-top:8px;line-height:1.45;`;
            cm.textContent = node.row.comment;
            tile.appendChild(cm);
        }
        if (node.error) {
            const er = document.createElement("div");
            er.style.cssText = `font-size:${this.kpx(9.5)};color:${this.badColor()};margin-top:4px;`;
            er.textContent = "⚠ " + node.error;
            tile.appendChild(er);
        }
        return tile;
    }

    /**
     * One neighbour column of the tile view: the KPIs a row feeds into (from the
     * reverse adjacency of the built graph — a row may serve several) or the
     * operands / hierarchy children that drive it, each as a micro card that
     * navigates one step up or down.
     */
    private treeZoomSide(ctx: TreeCtx, node: PnlNode, fmt: Fmt, w: number,
        side: "parents" | "children"): HTMLElement {
        const col = document.createElement("div");
        col.setAttribute("data-pnl", "zoom-side");
        col.style.cssText = `flex:0 0 ${w}px;width:${w}px;box-sizing:border-box;` +
            "display:flex;flex-direction:column;min-height:0;";
        // section head in the very type style of the toolbar group labels, and
        // on the same optical line as the head of the big tile next to it
        const title = this.capsLabel(side === "parents"
            ? this.str("Feeds into", "Zahlt ein auf")
            : this.str("Driven by", "Getrieben von"));
        title.style.margin = `0 0 ${this.kpx(8)} 0`;
        title.style.flex = "0 0 auto";
        col.appendChild(title);

        const items: { node: PnlNode; op: FormulaOp | null }[] = [];
        if (side === "parents") {
            const seen = new Set<string>();
            for (const [pid, kids] of ctx.kidsOf) {
                if (seen.has(pid) || !kids.includes(node.row.id)) { continue; }
                seen.add(pid);
                const p = ctx.resolve(pid);
                if (p) { items.push({ node: p, op: null }); }
            }
        } else {
            for (const k of this.treeBranches(node, ctx.resolve).kids) {
                items.push({ node: k.child, op: k.op });
            }
        }
        if (items.length === 0) {
            const hint = document.createElement("div");
            hint.style.cssText = `font-size:${this.kpx(10)};color:${C.soft};line-height:1.5;`;
            hint.textContent = side === "parents"
                ? this.str("Top of the tree — no row builds on this one.",
                    "Spitze des Baums — keine Zeile baut auf dieser auf.")
                : this.str("No drivers — this row is a posted account.",
                    "Keine Treiber — diese Zeile ist ein gebuchtes Konto.");
            col.appendChild(hint);
            return col;
        }
        // more drivers than the column is tall: the column pages instead of
        // showing a stump. ▲ / ▼ appear exactly when there is something above
        // or below, and the ▼ says how many cards are still waiting.
        const list = document.createElement("div");
        list.setAttribute("data-pnl", "micro-list");
        list.style.cssText = "flex:1 1 auto;min-height:0;position:relative;" +
            "overflow-y:auto;overflow-x:hidden;";
        const more = items.length - TREE_ZOOM_CARDS_MAX;
        for (const it of items.slice(0, TREE_ZOOM_CARDS_MAX)) {
            list.appendChild(this.treeMicroCard(it.node, it.op, fmt, w, side));
        }

        const arrow = (dir: -1 | 1): HTMLElement => {
            const b = document.createElement("button");
            b.setAttribute("data-pnl", dir < 0 ? "micro-up" : "micro-down");
            b.style.cssText = `font-family:${FONT};font-size:${this.kpx(9.5)};line-height:1.3;width:100%;` +
                `padding:${this.kpx(3)} ${this.kpx(6)};cursor:pointer;border-radius:4px;` +
                `border:1px solid ${C.ctlEdge};` +
                `background:${this.cardBg()};color:${C.text};transition:${TRANSITION};` +
                `display:none;margin:${dir < 0 ? "0 0 6px 0" : "6px 0 0 0"};box-sizing:border-box;`;
            b.onmouseenter = (): void => { b.style.background = C.ctlHover; b.style.borderColor = C.cardEdgeHover; };
            b.onmouseleave = (): void => { b.style.background = this.cardBg(); b.style.borderColor = C.ctlEdge; };
            // paging snaps to card tops — the reader never lands on a stump
            b.onclick = (e: Event): void => {
                e.stopPropagation();
                const kids = list.children;
                if (dir > 0) {
                    let next = list.scrollHeight;
                    for (let i = 0; i < kids.length; i++) {
                        const c = kids[i] as HTMLElement;
                        if (c.offsetTop + c.offsetHeight > list.scrollTop + list.clientHeight + 1) {
                            next = c.offsetTop; break;
                        }
                    }
                    list.scrollTop = next;
                } else {
                    let next = 0;
                    for (let i = 0; i < kids.length; i++) {
                        const t = (kids[i] as HTMLElement).offsetTop;
                        if (t < list.scrollTop - 1 && t + list.clientHeight >= list.scrollTop) {
                            next = t; break;
                        }
                    }
                    list.scrollTop = next;
                }
                sync();
            };
            return b;
        };
        const up = arrow(-1);
        const down = arrow(1);
        const sync = (): void => {
            let hidden = 0;
            const kids = list.children;
            const edge = list.scrollTop + list.clientHeight + 1;
            if (list.clientHeight > 0) {
                for (let i = 0; i < kids.length; i++) {
                    const c = kids[i] as HTMLElement;
                    if (c.offsetTop + c.offsetHeight > edge) { hidden++; }
                }
            }
            const above = list.scrollTop > 2;
            up.style.display = above ? "block" : "none";
            up.textContent = "▲";
            down.style.display = hidden > 0 ? "block" : "none";
            down.textContent = `▼ ${hidden} ` + this.str("more", "weitere");
        };
        this.pagerSync.push(sync);

        col.appendChild(up);
        col.appendChild(list);
        col.appendChild(down);
        list.addEventListener("scroll", sync);
        if (more > 0) {
            const rest = document.createElement("div");
            rest.style.cssText = `font-size:${this.kpx(9.5)};color:${C.soft};flex:0 0 auto;padding-top:4px;`;
            rest.textContent = `+${more} ` + this.str("more", "weitere");
            col.appendChild(rest);
        }
        return col;
    }

    /** neighbour card of the tile view: operator, name, Δ%, small monthly chart */
    private treeMicroCard(node: PnlNode, op: FormulaOp | null, fmt: Fmt, w: number,
        side: "parents" | "children"): HTMLElement {
        const ns = "http://www.w3.org/2000/svg";
        const ui = this.ui!;
        const va = this.treeVariance(node);
        const vColor = va == null ? null : (va.good ? this.goodColor() : this.badColor());
        // status edge exactly as in the tree: 3 px on the left, in the variance
        // colour, and it follows the Status toggle of the toolbar
        const edge = ui.treeStatus ? vColor : null;

        const card = document.createElement("div");
        card.setAttribute("data-pnl", side === "parents" ? "zoom-parent" : "zoom-child");
        card.title = this.str("Zoom into this card", "Auf diese Karte zoomen");
        card.style.cssText = `background:${this.cardBg()};border:1px solid ${C.cardEdge};` +
            (edge ? `border-left:3px solid ${edge};` : "") +
            `border-radius:4px;box-shadow:${SHADOW};transition:${TRANSITION};` +
            `padding:${this.kpx(8)} ${this.kpx(8)} ${this.kpx(7)} ${this.kpx(8)};` +
            `margin-bottom:${this.k(MICRO_CARD_GAP)}px;` +
            "cursor:pointer;box-sizing:border-box;";
        // click affordance: the edge darkens and the card lifts by a hair — the
        // status edge keeps its colour, only the three quiet sides react
        const sides = (c: string): void => {
            card.style.borderTopColor = c; card.style.borderRightColor = c;
            card.style.borderBottomColor = c;
            if (!edge) { card.style.borderLeftColor = c; }
        };
        const selMicro = this.isSelected(node) && this.selectable(node);
        const rest = selMicro ? `0 0 0 2px ${this.accent()}` : SHADOW;
        card.onmouseenter = (): void => { sides(C.cardEdgeHover); card.style.boxShadow = SHADOW_HOVER; };
        card.onmouseleave = (): void => { sides(C.cardEdge); card.style.boxShadow = rest; };

        const head = document.createElement("div");
        head.style.cssText = `display:flex;gap:${this.kpx(5)};align-items:baseline;`;
        if (op) {
            const o = document.createElement("span");
            o.style.cssText = `font-size:${this.kpx(12)};font-weight:700;color:${C.ac};`;
            o.textContent = op;
            head.appendChild(o);
        }
        const nm = document.createElement("span");
        nm.setAttribute("data-pnl", "micro-name");
        nm.style.cssText = `flex:1;font-size:${this.kpx(11)};font-weight:600;color:${C.text};` +
            "line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
        nm.textContent = node.row.name;
        head.appendChild(nm);
        if (va && va.deltaPct != null) {
            const dp = document.createElement("span");
            dp.setAttribute("data-pnl", "micro-delta");
            dp.style.cssText = `font-size:${this.kpx(11)};font-weight:700;white-space:nowrap;` +
                "font-variant-numeric:tabular-nums;" +
                `color:${vColor};`;
            dp.textContent = fmt.pct(va.deltaPct, true);
            head.appendChild(dp);
        }
        card.appendChild(head);

        // the numbers in the mini chart are what the reader came for: the card
        // gives the chart a taller strip and draws it at readable type size
        const cw = Math.max(w - this.k(20), 90);
        const chartH = this.k(MICRO_CARD_CHART_H);
        const svg = document.createElementNS(ns, "svg") as SVGSVGElement;
        svg.setAttribute("width", String(cw));
        svg.setAttribute("height", String(chartH));
        svg.style.cssText = "display:block;margin-top:4px;";
        const g = document.createElementNS(ns, "g") as SVGGElement;
        svg.appendChild(g);
        card.appendChild(svg);
        this.treeMini(g, node, { x: 1, y: 2, w: cw - 2, h: chartH - this.k(20) },
            MICRO_CARD_S * this.fontScale(), fmt, svg, 0);

        card.onclick = (e: Event): void => {
            e.stopPropagation();
            ui.treeZoom = node.row.id;
            this.persistUi(); this.rerender();
        };
        // left click zooms (as before) — the right click opens the native menu
        if (this.selectable(node)) {
            this.bindSelect(card, node, false);
            if (selMicro) { card.setAttribute("data-pnl-sel", "1"); card.style.boxShadow = rest; }
        }
        this.treeHoverZoom(card, node, fmt);
        return card;
    }

    /**
     * Months of a row that carry neither an actual nor a forecast — the empty
     * tail of a P&L bound to a full year but posted only up to the current
     * month. They are not zero months: nothing of the chart is drawn for them.
     */
    private treeMissingMonths(node: PnlNode): number {
        const pts = this.treeComboPts(node).pts;
        return pts.filter(p => p.v == null).length;
    }

    /**
     * One point of the integrated zoom chart: the month, its AC (or forecast)
     * value, the reference of that month, the second scenario for the triangle,
     * and the variance the bridge step and the Δ% pin are drawn from.
     *
     * A month whose AC *and* FC are null keeps `v = null` — the series nulls
     * are carried through untouched, never coerced to zero. Such a month gets
     * no bridge step, no Δ% pin and no value column; only its (pale) reference
     * column stays, so the reader sees the plan that was there and the actual
     * that was not.
     */
    private treeComboPts(node: PnlNode): {
        pts: ComboPt[]; refScen: Scenario; triScen: Scenario | "";
    } {
        const ref = this.ui!.ref;
        const months = this.model!.months;
        const inv = node.row.displayInvert ? -1 : 1;
        // triangle = the *other* comparison scenario; the reference itself is
        // already carried by the bridge, repeating it per month says nothing
        const triScen: Scenario | "" = this.treeRefScenarios(false).filter(x => x !== ref)[0] ?? "";
        const acs = node.series.ac; const fcs = node.series.fc;
        const refs = this.has[ref] ? node.series[ref] : undefined;
        const tris = triScen === "" ? undefined : node.series[triScen];
        const pts: ComboPt[] = [];
        for (let i = 0; i < months.length; i++) {
            const a = acs ? acs[i] : null;
            const f = fcs ? fcs[i] : null;
            // AC&FC composite: the forecast fills the months the actuals have
            // not reached — those months are drawn hatched (IBCS UN 4.1)
            const raw = a != null ? a : f;
            const r = refs ? refs[i] : null;
            const t = tris ? tris[i] : null;
            if (raw == null && r == null) { continue; }
            const dRaw = raw != null && r != null ? raw - r : null;
            pts.push({
                tag: this.monthLabel(months[i]),
                v: raw == null ? null : raw * inv,
                ref: r == null ? null : r * inv,
                tri: t == null ? null : t * inv,
                isFc: a == null && f != null,
                d: dRaw == null ? null : dRaw * inv,
                pct: dRaw == null || r == null || r === 0 ? null : (dRaw / Math.abs(r)) * inv,
                good: dRaw == null ? true : (node.row.varianceInvert ? dRaw < 0 : dRaw >= 0),
            });
        }
        return { pts, refScen: ref, triScen };
    }

    /**
     * The integrated zoom chart (ChartKitchen "integrated bridge"), one picture
     * instead of the two stacked charts of v0.11:
     *
     *   · one baseline over the full width, one value scale for every column;
     *   · left, the full-height anchors — the second scenario outermost (PY
     *     solid gray), the reference next to the band (PL outlined, FC hatched);
     *   · bottom of the band, one column per month, AC solid, forecast months
     *     hatched, the second scenario as a triangle beside it;
     *   · above them the cumulated Δ bridge: it starts on the level of the
     *     reference anchor and floats one step per month across the band, teal
     *     when favorable, red when not, hatched in the forecast months, thin
     *     connectors between the steps;
     *   · on top of that the Δ% pin row of the same months;
     *   · a vertical rule between the last actual and the first forecast month;
     *   · right, the stacked AC + FC total column and the total variance badge.
     *
     * All full columns and the bridge share one scale. The monthly columns keep
     * that very scale as long as they fit the lower zone — which they do for
     * any normal year — and only a degenerate series (one or two months, each
     * nearly the whole total) compresses them, so the two zones never collide.
     */
    private treeZoomCombo(g: SVGGElement, node: PnlNode, box: { x: number; y: number; w: number; h: number },
        s: number, fmt: Fmt, svg: SVGSVGElement): void {
        const ns = "http://www.w3.org/2000/svg";
        const ref = this.ui!.ref;
        const refUp = ref.toUpperCase();
        const inv = node.row.displayInvert ? -1 : 1;
        const lfs = 8.5 * s; const cfs = 8 * s; const hfs = 9 * s;
        const num = (v: number): string => this.treeNum(v, fmt);
        const signed = (v: number): string => (v > 0 ? "+" : "") + this.treeNum(v, fmt);

        const { pts, triScen } = this.treeComboPts(node);
        const n = pts.length;

        // totals — the bridge must reconcile, so every total is summed over the
        // very months the steps are drawn from, not read from the YTD scalar.
        // Months without an actual and without a forecast carry no step, so
        // their reference must not enter the anchor either: otherwise the badge
        // would report a gap against a plan for months nobody has posted yet.
        let refSum: number | null = null; let triSum: number | null = null;
        let acSum = 0; let fcSum = 0; let hasVal = false;
        for (const p of pts) {
            if (p.v == null) { continue; }
            if (p.ref != null) { refSum = (refSum ?? 0) + p.ref; }
            if (p.tri != null) { triSum = (triSum ?? 0) + p.tri; }
            hasVal = true;
            if (p.isFc) { fcSum += p.v; } else { acSum += p.v; }
        }
        // a model without monthly series still gets the anchors and the badge
        if (n === 0 || !hasVal) {
            const yv = displayValue(node, "ac");
            const rv = this.has[ref] ? displayValue(node, ref) : null;
            if (yv == null || rv == null) { this.treeHint(g, box, s, `Δ${refUp} –`); return; }
            acSum = yv; fcSum = 0; refSum = rv;
            triSum = triScen === "" ? null : displayValue(node, triScen);
        }
        if (refSum == null) { this.treeHint(g, box, s, `Δ${refUp} –`); return; }
        const vTot = acSum + fcSum;
        const dTot = vTot - refSum;
        const dTotRaw = dTot * inv;
        const totGood = node.row.varianceInvert ? dTotRaw < 0 : dTotRaw >= 0;
        const totColor = totGood ? this.goodColor() : this.badColor();
        const pctTot = refSum !== 0 ? (dTot / Math.abs(refSum)) : null;

        // ---------------- horizontal layout
        const totW = Math.max(24 * s, Math.min(46 * s, box.w * 0.05));
        const twoAnchors = triSum != null;
        const xRefAnc = box.x + (twoAnchors ? totW + 8 * s : 0);
        const bandStart = xRefAnc + totW + 14 * s;
        const badge = signed(dTot);
        const badgeW = Math.max(46 * s, badge.length * lfs * 0.62 + 14 * s);
        const sideW = fcSum !== 0 ? lfs * 2.1 : 0;
        const bandEnd = box.x + box.w - badgeW - 8 * s - sideW - totW - 14 * s;
        if (bandEnd - bandStart < Math.max(n, 1) * 6) {
            this.treeHint(g, box, s, this.str("Not enough width for the bridge",
                "Zu wenig Breite für die Brücke"));
            return;
        }
        const slots = Math.max(n, 1);
        const step = (bandEnd - bandStart) / slots;
        const segW = Math.max(4, Math.min(step * 0.70, 30 * s));
        // the monthly slot now carries the IBCS pair of the card charts: the AC
        // column in front, the reference column behind it and offset right — so
        // the slot needs room for both plus the triangle strip
        const colW = Math.max(4, Math.min(step * 0.58, 24 * s));
        const cx = (i: number): number => bandStart + (i + 0.5) * step;
        const xTot = bandEnd + 14 * s;
        const cxTot = xTot + totW / 2;

        // ---------------- vertical layout
        const headH = hfs + 8 * s;
        const showPins = pts.some(p => p.pct != null);
        const pinH = showPins ? Math.max(52 * s, box.h * 0.18) : 4 * s;
        const pinAxisY = box.y + headH + pinH * 0.56;
        const catH = cfs * 2 + 10 * s;
        const yBase = box.y + box.h - catH;
        const plotTop = box.y + headH + pinH + lfs + 5 * s;

        // one domain for every full column and for the bridge levels
        let lo = 0; let hi = 0;
        const see = (v: number | null): void => {
            if (v == null) { return; }
            lo = Math.min(lo, v); hi = Math.max(hi, v);
        };
        see(refSum); see(triSum); see(vTot); see(acSum);
        let level = refSum;
        for (const p of pts) { see(p.v); see(p.tri); if (p.d != null) { level += p.d; see(level); } }
        if (hi === lo) { hi = lo + 1; }
        const unit = (yBase - plotTop) / (hi - lo);
        const yOf = (v: number): number => yBase - (v - lo) * unit;
        const axisY = yOf(0);
        // the monthly columns keep the shared scale unless a very short series
        // would push them into the bridge — then, and only then, they compress
        const zoneH = (yBase - plotTop) * 0.42;
        let maxMon = 0;
        for (const p of pts) {
            maxMon = Math.max(maxMon, Math.abs(p.v ?? 0), Math.abs(p.tri ?? 0), Math.abs(p.ref ?? 0));
        }
        const mk = maxMon * unit > zoneH && maxMon > 0 ? zoneH / (maxMon * unit) : 1;
        const mY = (v: number): number => axisY - v * unit * mk;

        // ---------------- small drawing helpers
        const rect = (x: number, y: number, w: number, h: number,
            fill: string, stroke?: string, sw = 1): SVGElement => {
            const r = document.createElementNS(ns, "rect");
            r.setAttribute("x", x.toFixed(2)); r.setAttribute("y", y.toFixed(2));
            r.setAttribute("width", Math.max(w, 0.6).toFixed(2));
            r.setAttribute("height", Math.max(h, 0.6).toFixed(2));
            r.setAttribute("fill", fill);
            if (stroke) { r.setAttribute("stroke", stroke); r.setAttribute("stroke-width", String(sw)); }
            g.appendChild(r);
            return r;
        };
        const line = (x1: number, y1: number, x2: number, y2: number,
            stroke: string, sw: number, dash?: string): SVGElement => {
            const l = document.createElementNS(ns, "line");
            l.setAttribute("x1", x1.toFixed(2)); l.setAttribute("y1", y1.toFixed(2));
            l.setAttribute("x2", x2.toFixed(2)); l.setAttribute("y2", y2.toFixed(2));
            l.setAttribute("stroke", stroke); l.setAttribute("stroke-width", String(sw));
            if (dash) { l.setAttribute("stroke-dasharray", dash); }
            g.appendChild(l);
            return l;
        };
        /** text clamped into the chart box, so no label can ever leave the svg */
        const label = (x: number, y: number, txt: string, fs: number, fill: string,
            anchor: "middle" | "start" | "end" = "middle", weight?: string, halo = false): void => {
            const t = document.createElementNS(ns, "text");
            const half = txt.length * fs * 0.3;
            const min = anchor === "start" ? box.x : box.x + (anchor === "end" ? 2 * half : half);
            const max = anchor === "end" ? box.x + box.w
                : box.x + box.w - (anchor === "start" ? 2 * half : half);
            t.setAttribute("x", Math.min(Math.max(x, min), max).toFixed(2));
            t.setAttribute("y", y.toFixed(2));
            t.setAttribute("text-anchor", anchor);
            t.setAttribute("font-size", fs.toFixed(1));
            t.setAttribute("font-family", FONT);
            t.setAttribute("fill", fill);
            if (weight) { t.setAttribute("font-weight", weight); }
            // a number sitting on a hatched fill needs a paper halo to stay legible
            if (halo) {
                t.setAttribute("stroke", "#FFF"); t.setAttribute("stroke-width", "2.6");
                t.setAttribute("paint-order", "stroke"); t.setAttribute("stroke-linejoin", "round");
            }
            t.textContent = txt;
            g.appendChild(t);
        };

        const hatch = this.treeHatchId(svg);
        /** hatched fill in the Δ colour — a forecast step keeps the FC notation */
        const dHatch = (color: string, good: boolean): string => {
            const id = `pnlcb${good ? "g" : "b"}${this.uid}`;
            if (!svg.querySelector(`#${id}`)) { this.hatchPattern(svg, ns, id, color); }
            return `url(#${id})`;
        };

        // labels thin out until they fit their slot — never two on top of each
        // other, and the last month is always named
        let maxTxt = 4;
        for (const p of pts) {
            if (p.v != null) { maxTxt = Math.max(maxTxt, num(p.v).length); }
            if (p.d != null) { maxTxt = Math.max(maxTxt, signed(p.d).length); }
        }
        const every = Math.max(1, Math.ceil((maxTxt * lfs * 0.58 + 5 * s) / Math.max(step, 1)));
        // thinning runs over the months that actually carry data — an empty tail
        // must not eat the labels of the months in front of it, and the last
        // month *with* data is always named
        const dataIdx: number[] = [];
        pts.forEach((p, i) => { if (p.v != null) { dataIdx.push(i); } });
        const marks = new Set<number>();
        for (let k = dataIdx.length - 1; k >= 0; k -= every) { marks.add(dataIdx[k]); }
        const catEvery = Math.max(1, Math.ceil((5 * cfs * 0.6 + 4 * s) / Math.max(step, 1)));

        // ---------------- caption
        label(box.x, box.y + hfs, this.str(
            `${refUp} → AC${fcSum !== 0 ? "/FC" : ""} · bridge + monthly columns`,
            `${refUp} → AC${fcSum !== 0 ? "/FC" : ""} · Brücke + Monatssäulen`),
        hfs, C.soft, "start", "600");

        // ---------------- Δ% pin row
        if (showPins) {
            let maxPct = Math.abs(pctTot ?? 0);
            for (const p of pts) { maxPct = Math.max(maxPct, Math.abs(p.pct ?? 0)); }
            if (maxPct === 0) { maxPct = 1; }
            const pinMax = Math.max(pinH * 0.40 - lfs, 8 * s);
            label(box.x, pinAxisY + lfs * 0.35, `Δ${refUp}%`, hfs, C.soft, "start", "600");
            line(bandStart - 4 * s, pinAxisY, bandEnd + 4 * s, pinAxisY, C.py, 2);
            line(cxTot - totW / 2 - 2 * s, pinAxisY, cxTot + totW / 2 + 2 * s, pinAxisY, C.py, 2);
            const pin = (x: number, pct: number, good: boolean, hollow: boolean): void => {
                const color = good ? this.goodColor() : this.badColor();
                const h = Math.max(2, (Math.abs(pct) / maxPct) * pinMax);
                const yEnd = pct >= 0 ? pinAxisY - h : pinAxisY + h;
                line(x, pinAxisY, x, yEnd, color, 2);
                const r = Math.max(2.2, 2.6 * s);
                rect(x - r, yEnd - r, 2 * r, 2 * r, hollow ? "#FFF" : color, color, 1)
                    .setAttribute("data-pnl", "combo-pin");
                label(x, pct >= 0 ? yEnd - r - 2.5 * s : yEnd + r + lfs,
                    fmt.pct(pct, true), lfs, color);
            };
            pts.forEach((p, i) => {
                if (p.pct == null || !marks.has(i)) { return; }
                pin(cx(i), p.pct, p.good, p.isFc);
            });
            if (pctTot != null) { pin(cxTot, pctTot, totGood, fcSum !== 0); }
        }

        // ---------------- AC | FC divider
        const firstFc = pts.findIndex(p => p.isFc);
        if (firstFc > 0) {
            const dx = cx(firstFc) - step / 2;
            line(dx, box.y + headH, dx, yBase + 5 * s, C.ac, 1.2)
                .setAttribute("data-pnl", "combo-fcline");
            label(dx + 3 * s, yBase + cfs * 2 + 7 * s, "FC", cfs, C.ac, "start", "600");
        }

        // ---------------- left anchors, full height
        const anchor = (x: number, v: number, scen: Scenario, tag: string): void => {
            const st = this.treeScenFill(scen, hatch);
            const y = Math.min(yOf(v), axisY);
            const r = rect(x, y, totW, Math.abs(yOf(v) - axisY), st.fill, st.stroke ?? undefined, 1.2);
            r.setAttribute("data-pnl", "combo-anchor");
            r.setAttribute("data-scen", scen);
            label(x + totW / 2, y - 3 * s, num(v), lfs, C.text);
            label(x + totW / 2, yBase + cfs + 4 * s, tag, cfs, C.soft);
        };
        if (twoAnchors && triSum != null && triScen !== "") {
            anchor(box.x, triSum, triScen, triScen.toUpperCase().replace("FY", ""));
        }
        anchor(xRefAnc, refSum, ref, refUp);

        // ---------------- level guides: reference level and the reached total
        line(xRefAnc + totW, yOf(refSum), cxTot + totW / 2, yOf(refSum), C.gridSoft, 1);
        line(bandEnd, yOf(vTot), xTot, yOf(vTot), C.gridSoft, 1);

        // ---------------- bridge steps, monthly columns, month labels
        //
        // The monthly zone draws the IBCS pair of the card charts: the AC column
        // in front, the reference column of the same month behind it and offset
        // to the right, the second scenario as a triangle beside them. A month
        // without an actual keeps only its (pale) reference column — no step, no
        // pin, no zero column, and the bridge connector skips right over it.
        const hasRefCols = pts.some(p => p.ref != null);
        const hasTriCols = triScen !== "" && pts.some(p => p.tri != null);
        const acW = hasRefCols ? colW * 0.60 : colW;
        const refW = acW * 1.25;
        const dxPair = hasRefCols ? acW * 0.40 : 0;
        level = refSum;
        /** x of the bridge step the connector last left (skips empty months) */
        let lastStepX: number | null = null;
        pts.forEach((p, i) => {
            const x = cx(i) - (hasTriCols ? colW * 0.18 : 0);
            if (p.d != null) {
                // connector at the incoming level, then the floating step
                const from = lastStepX == null ? xRefAnc + totW : lastStepX + segW / 2;
                line(from, yOf(level), cx(i) - segW / 2, yOf(level), C.gridSoft, 1);
                const prev = level;
                level += p.d;
                const top = Math.min(yOf(prev), yOf(level));
                // a small Δ on a big scale must still read as a brick, not a rule
                const h = Math.max(Math.abs(yOf(prev) - yOf(level)), 3.5 * s);
                const color = p.good ? this.goodColor() : this.badColor();
                const sr = p.isFc
                    ? rect(cx(i) - segW / 2, top, segW, h, dHatch(color, p.good), color, 1)
                    : rect(cx(i) - segW / 2, top, segW, h, color);
                sr.setAttribute("data-pnl", "combo-step");
                if (p.isFc) { sr.setAttribute("data-fc", "1"); }
                lastStepX = cx(i);
                if (marks.has(i)) {
                    label(cx(i), p.d >= 0 ? top - 2.5 * s : top + h + lfs, signed(p.d), lfs, color,
                        "middle", undefined, true);
                }
            }
            const acCx = x - dxPair / 2;
            const refCx = x + dxPair / 2;
            const tops: number[] = [];
            // reference column of this month, behind and offset — pale where the
            // month carries no actual at all, so the gap stays visible as a gap
            if (p.ref != null && this.has[ref]) {
                const st = this.treeScenFill(ref, hatch);
                const y = Math.min(mY(p.ref), axisY);
                const h = Math.abs(mY(p.ref) - axisY);
                const rr = rect(refCx - refW / 2, y, refW, h, st.fill, st.stroke ?? undefined, 1.2);
                rr.setAttribute("data-pnl", "combo-month-ref");
                rr.setAttribute("data-scen", ref);
                if (p.v == null) {
                    rr.setAttribute("opacity", "0.42");
                    rr.setAttribute("data-empty", "1");
                }
                const rt = document.createElementNS(ns, "title");
                rt.textContent = `${refUp} ${num(p.ref)}`;
                rr.appendChild(rt);
                tops.push(y);
            }
            // monthly column: AC solid / FC hatched, second scenario as triangle
            if (p.v != null) {
                const y = Math.min(mY(p.v), axisY);
                const h = Math.abs(mY(p.v) - axisY);
                const mr = p.isFc
                    ? rect(acCx - acW / 2, y, acW, h, `url(#${hatch})`, C.ac, 1)
                    : rect(acCx - acW / 2, y, acW, h, C.ac);
                mr.setAttribute("data-pnl", "combo-month");
                if (p.isFc) { mr.setAttribute("data-fc", "1"); }
                tops.push(y);
            }
            if (p.tri != null && triScen !== "") {
                const st = this.treeScenFill(triScen, hatch);
                const ty = mY(p.tri);
                const tri = TREE_TRI * s;
                const tx = refCx + refW / 2 + 1.2 * s;
                const path = document.createElementNS(ns, "path");
                path.setAttribute("d", `M${tx.toFixed(2)},${ty.toFixed(2)}`
                    + `L${(tx + tri).toFixed(2)},${(ty - tri * 0.62).toFixed(2)}`
                    + `L${(tx + tri).toFixed(2)},${(ty + tri * 0.62).toFixed(2)}Z`);
                path.setAttribute("fill", st.fill);
                path.setAttribute("stroke", st.stroke ?? C.refGray);
                path.setAttribute("stroke-width", "0.8");
                if (p.v == null) { path.setAttribute("opacity", "0.42"); }
                const tt = document.createElementNS(ns, "title");
                tt.textContent = `${triScen.toUpperCase()} ${num(p.tri)}`;
                path.appendChild(tt);
                g.appendChild(path);
                tops.push(ty - tri * 0.62);
            }
            if (p.v != null && marks.has(i) && tops.length > 0) {
                label(acCx, Math.min(...tops) - 2.5 * s, num(p.v), lfs, C.text);
            }
            if (i % catEvery === 0 || i === n - 1) {
                label(cx(i), yBase + cfs + 4 * s, this.fitLabel(p.tag, step, cfs), cfs, C.soft);
            }
        });

        // ---------------- shared baseline over the full width
        line(box.x, axisY, box.x + box.w, axisY, C.ac, 1.2);

        // ---------------- right: the stacked AC + FC total column
        const acTop = yOf(acSum);
        rect(xTot, Math.min(acTop, axisY), totW, Math.abs(acTop - axisY), C.ac)
            .setAttribute("data-pnl", "combo-total-ac");
        if (fcSum !== 0) {
            const vTop = yOf(vTot);
            rect(xTot, Math.min(vTop, acTop), totW, Math.abs(vTop - acTop),
                `url(#${hatch})`, C.ac, 1.2).setAttribute("data-pnl", "combo-total-fc");
            label(xTot + totW / 2, (vTop + acTop) / 2 + lfs * 0.35, num(fcSum), lfs, C.text,
                "middle", undefined, true);
            label(xTot + totW + 3 * s, (vTop + acTop) / 2 + lfs * 0.35, "FC", cfs, C.soft, "start");
            label(xTot + totW / 2, (acTop + axisY) / 2 + lfs * 0.35, num(acSum), lfs, "#FFF");
            label(xTot + totW + 3 * s, (acTop + axisY) / 2 + lfs * 0.35, "AC", cfs, C.soft, "start");
        }
        label(cxTot, yOf(vTot) - 3 * s, num(vTot), lfs, C.text, "middle", "600");
        label(cxTot, yBase + cfs + 4 * s, fcSum !== 0 ? "AC+FC" : "AC", cfs, C.soft);

        // ---------------- total variance badge
        const bh = lfs + 9 * s;
        const bcx = box.x + box.w - badgeW / 2;
        const bcy = Math.min(Math.max((yOf(refSum) + yOf(vTot)) / 2, plotTop + bh / 2), yBase - bh / 2);
        const bg = rect(bcx - badgeW / 2, bcy - bh / 2, badgeW, bh, "#FFF", totColor, 1.6);
        bg.setAttribute("rx", (bh / 2).toFixed(2));
        bg.setAttribute("data-pnl", "combo-badge");
        label(bcx, bcy + lfs * 0.36, badge, lfs, totColor, "middle", "600");
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
            hint.style.cssText = `font-size:${this.kpx(11)};color:${C.soft};line-height:1.55;` +
                `padding:10px 0;max-width:${this.k(620)}px;`;
            hint.textContent = this.str(
                "The driver tree needs rows to grow from — an account or dimension hierarchy, or a formula / "
                + "KPI row that references other rows (e.g. [EBIT]/[Net revenue]). Bind the level or account "
                + "field first; a root row named in the format pane starts the tree at that card instead.",
                "Der Treiberbaum braucht Zeilen, aus denen er wächst — eine Konten- oder Dimensions-Hierarchie "
                + "oder eine Formel-/KPI-Zeile, die andere Zeilen referenziert (z. B. [EBIT]/[Umsatz]). Zuerst "
                + "das Ebenen- oder Kontofeld zuweisen; eine im Format-Pane genannte Wurzelzeile startet den "
                + "Baum stattdessen an dieser Karte.");
            wrap.appendChild(hint);
            return wrap;
        }

        // comment footnotes follow the cards on screen (numbering in reading order)
        this.treeComments(ctx.cards);

        // one card blown up to a full page — the tree itself steps aside
        if (ui.treeZoom != null) {
            const zoomed = ctx.resolve(ui.treeZoom);
            if (zoomed) { return this.buildTreeZoom(ctx, zoomed, fmt); }
            // the model no longer knows that row (model change): back to the tree
            ui.treeZoom = null;
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

        // head block: breadcrumb, hint line, then a fixed gap to the first card
        // row — the tree must never grow into the lines above it
        if (ctx.path.length > 1) {
            wrap.appendChild(this.treeBreadcrumb(ctx.path, (node, i) => {
                ui.treeRoot = i === 0 ? "" : node.row.id;
                ui.treeCollapsed = null;
            }, this.str("Back to this card", "Zurück zu dieser Karte")));
        }

        const note = document.createElement("div");
        note.style.cssText = `font-size:${this.kpx(9)};color:${C.soft};margin:0;padding:0;line-height:1.5;`;
        note.textContent = this.str(
            "Value driver tree — ▾ opens and closes one node (Shift: whole limb), ⌖ makes a card the root, "
            + "hovering a card zooms into its IBCS detail view, clicking its chart opens the tile view.",
            "Werttreiberbaum — ▾ klappt einen Knoten auf und zu (Shift: ganzer Ast), ⌖ macht eine Karte zur "
            + "Wurzel, Hover über einer Karte öffnet die IBCS-Detailansicht, ein Klick auf ihr Diagramm die "
            + "Kachel-Ansicht.")
            + (this.interactive() ? this.str(
                " Right-click a card for the context menu (drillthrough); in the tile view “↗ Drill” sets the "
                + "selection and opens the targets.",
                " Rechtsklick auf eine Karte öffnet das Kontextmenü (Drillthrough); in der Kachel-Ansicht "
                + "setzt „↗ Drill“ die Selektion und öffnet die Ziele.") : "");
        wrap.appendChild(note);

        const ns = "http://www.w3.org/2000/svg";
        const pad = 6;
        const svg = document.createElementNS(ns, "svg") as SVGSVGElement;
        svg.setAttribute("width", String(Math.ceil(size.w + 2 * pad)));
        svg.setAttribute("height", String(Math.ceil(size.h + 2 * pad)));
        svg.style.cssText = `display:block;margin-top:${this.k(TREE_HEAD_GAP)}px;`;
        const inner = document.createElementNS(ns, "g") as SVGGElement;
        inner.setAttribute("transform", `translate(${pad},${pad})`);
        svg.appendChild(inner);

        /**
         * Pixel-grid centre of a 1 px stroke — keeps the bus hairline-sharp.
         * Idempotent (floor, not round), so snapping an already-snapped
         * coordinate a second time cannot drift the operator off its stub.
         */
        const half = (v: number): number => Math.floor(v) + 0.5;
        const line = (x1: number, y1: number, x2: number, y2: number): void => {
            const l = document.createElementNS(ns, "line");
            l.setAttribute("x1", x1.toFixed(2)); l.setAttribute("y1", y1.toFixed(2));
            l.setAttribute("x2", x2.toFixed(2)); l.setAttribute("y2", y2.toFixed(2));
            l.setAttribute("stroke", C.elbow); l.setAttribute("stroke-width", "1");
            inner.appendChild(l);
        };
        const opCircle = (cxRaw: number, cyRaw: number, op: FormulaOp, r: number): void => {
            // crisp ring: centre on the half pixel so the 1 px stroke lands on
            // exactly one device row instead of smearing over two — the bus
            // lines below snap to the same grid, so nothing drifts apart
            const cx = half(cxRaw); const cy = half(cyRaw);
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
            const busX = half(c.x + cw + gx * TREE_BUS_FRAC);
            const stubX = (c.x + cw + busX) / 2;
            const pcy = half(c.y + c.h / 2);
            const ys = c.children.map(k => half(k.y + k.h / 2));
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
        h.style.cssText = `font-size:${this.kpx(9)};font-weight:700;letter-spacing:.08em;` +
            `color:${C.soft};margin-bottom:4px;`;
        h.textContent = this.str("COMMENTS & DATA-QUALITY SIGNALS", "KOMMENTARE & DATENQUALITÄTS-SIGNALE");
        box.appendChild(h);
        for (const cm of this.comments) {
            const li = document.createElement("div");
            li.style.cssText = `font-size:${this.kpx(10)};line-height:1.5;margin-bottom:3px;`;
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
            li.style.cssText = `font-size:${this.kpx(10)};line-height:1.5;margin-bottom:3px;` +
                `color:${loading ? C.loading : C.soft};`;
            li.textContent = loading ? w : "⚠ " + w;
            box.appendChild(li);
        }
        this.root.appendChild(box);
    }

    private buildFooter(): HTMLElement {
        const f = document.createElement("div");
        f.style.cssText = `padding:10px 14px 12px 14px;border-top:1px solid ${C.gridSoft};` +
            `margin-top:8px;font-size:${this.kpx(8.5)};color:${C.soft};line-height:1.5;` +
            `max-width:${this.k(960)}px;`;
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
