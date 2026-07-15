/*
 *  IBCS Inspired Chart Deck — IBCS business chart custom visual for Power BI
 *  © 2026 Michael Tenner · PowerBI Kitchen — MIT License (see LICENSE in the repo root):
 *  free to use and modify, keep this author notice.
 *
 *  One visual that covers the core IBCS report chart:
 *    - Base chart with scenario notation: AC solid, PY grey, PL outlined, FC hatched
 *    - Absolute variance panel (ΔPY / ΔPL) with good/bad coloring
 *    - Relative variance panel (ΔPY % / ΔPL %) as pin chart
 *    - Columns (time) and bars (structure) orientation
 *    - Compact mode for small tiles, label thinning for dense axes
 */
"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ISelectionId = powerbi.visuals.ISelectionId;
import ITooltipService = powerbi.extensibility.ITooltipService;
import DataView = powerbi.DataView;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import IValueFormatter = valueFormatter.IValueFormatter;

import { VisualFormattingSettingsModel, localizeEnumItems } from "./settings";

const SVG_NS = "http://www.w3.org/2000/svg";
const FONT = "'Segoe UI', wf_segoe-ui_normal, helvetica, arial, sans-serif";
const INK = "#404040";

type Orientation = "columns" | "bars";
type Basis = "py" | "plan" | "fcrev";

/** persisted comma lists editable via the one-click structure menu */
type ListProp = "invertList" | "resultList" | "skipList" | "hideList" | "chartList" | "indentList";

interface DataPoint {
    cat: string;
    /** per-level labels when the category field is an expanded hierarchy (else null) */
    catLevels: string[] | null;
    /** matrix columns: per-level labels of the column-group role (else null/absent) */
    colLevels?: string[] | null;
    ac: number | null;
    py: number | null;
    pl: number | null;
    fc: number | null;
    /** value shown in the base chart: AC, or FC where AC is missing */
    value: number | null;
    isFc: boolean;
    /** preliminary actual (fcFlag = 2 / "vorläufig"): solid with thin overlay hatch */
    isPrelim?: boolean;
    basis: number | null;
    varAbs: number | null;
    varRel: number | null;
    /** variance vs. the second basis (the scenario not used as primary) */
    var2Abs: number | null;
    var2Rel: number | null;
    /** benchmark marker value (e.g. market average) */
    bm: number | null;
    /** forecast of the previous cycle (revision basis, role prevForecast) */
    fcPrev: number | null;
    /** combo: second measure rendered as a line over the columns (own scale) */
    lineVal: number | null;
    /** stacked mode: series label when the Stack-Series role is bound (else null) */
    stackSeries: string | null;
    comment: string | null;
    /** 1-based comment marker number, assigned in category order */
    commentNo: number | null;
    /** small-multiples group label, null when the multiples role is empty */
    group: string | null;
    /** waterfall row type: 'sum' | 'delta' | null */
    rowType: string | null;
    /** true for the synthetic "Rest (n)" row produced by top-N aggregation */
    isRest: boolean;
    sel: ISelectionId | null;
}

/** one bar of a waterfall / bridge */
interface WfSeg {
    label: string;
    from: number;
    to: number;
    kind: "anchor" | "delta";
    outlined?: boolean;
    hatched?: boolean;
    good?: boolean;
    p?: DataPoint;
}

interface Domains {
    main: [number, number];
    abs: [number, number];
    rel: [number, number];
    abs2: [number, number];
    rel2: [number, number];
    /** waterfall-bridge companion panel: floats away from zero, computed with extentTight */
    bridge: [number, number];
}

interface Rect { x: number; y: number; w: number; h: number; }

interface Scale { (v: number): number; }

/** per-render configuration shared by all chart regions */
interface ChartConfig {
    orientation: Orientation;
    showLabels: boolean;
    labelFont: number;
    catFont: number;
    invert: boolean;
    /** per-point polarity: global invert XOR per-category invert list */
    isGood: (v: number, pp?: DataPoint | null) => boolean;
    colors: { ac: string; py: string; pl: string; good: string; bad: string };
    basisMode: Basis;
    basisLabel: string;
    showAbs: boolean;
    showRel: boolean;
    /** second-basis variance panels (dual variance) */
    showDual: boolean;
    basis2Label: string;
    showTotal: boolean;
    patId: string;
    patGood: string;
    patBad: string;
    patPrelim: string;
    /** table: extra numeric value columns ("ac" | "basis" | "all") */
    valueCols: string;
    /** rows promoted to result/subtotal rows via chart.resultList (normalized) */
    resultSet: Set<string>;
    /** rows excluded from totals, scales and cascades via chart.skipList */
    skipSet: Set<string>;
    /** rows hidden from the table display — totals still include them */
    hideSet: Set<string>;
    /** when non-empty: bar/pin graphics only on the listed rows */
    chartSet: Set<string>;
    /** "davon:"-style rows — indented + subtle, without a hierarchy field */
    indentSet: Set<string>;
    /** per-row number formats ("Label = 0.0 %; Menge = #,0"), overrides cfg.fmt */
    rowFmt: Map<string, (v: number) => string>;
    /** matrix: per-block comparison — "none" | "prevcol" (Δ vs. previous column) */
    matrixCompare: string;
    /** table: formula-row definitions ("Label = A + B; Marge = X / Y"), raw text */
    formulaRows: string;
    /** KPI cards: what stripe + background judge against ("basis" | "benchmark") */
    cardBasis: string;
    /** KPI cards: tint the card background by status (monitoring mode) */
    cardTint: boolean;
    /** KPI cards: tint opacity in percent (4–40) */
    cardTintPct: number;
    /** KPI cards: mini bullet chart AC vs. benchmark on the card */
    cardBullet: boolean;
    /** KPI cards: bullet zooms to the AC/BM range instead of anchoring at zero */
    cardBulletZoom: boolean;
    /** KPI cards: which direction to color ("both" | "bad" | "good") */
    cardHl: string;
    /** KPI cards: show the mini bridge (AC/PY bars) */
    cardBars: boolean;
    /** KPI cards: order ("none" | "deviation" — biggest color deviation first) */
    cardSort: string;
    /** sum-safe label rounding (largest remainder): labels add up to the Σ header */
    sumSafe: boolean;
    /** deck-wide absolute-variance domain (incl. fixedVarMax) for scale sync */
    varDomain: [number, number];
    /** display-unit divisor and decimals of cfg.fmt — for sum-safe adjustment */
    fmtUnit: number;
    fmtPrec: number;
    fmt: IValueFormatter;
    /** formatter scaled to the variance magnitudes (auto units) */
    fmtVar: IValueFormatter;
    hasPy: boolean;
    hasPl: boolean;
    hasFc: boolean;
    hasBm: boolean;
    /** true only in modes that actually draw the BM marker — gates the tooltip row */
    bmInChart: boolean;
    /** IBCS three-scenario notation: PY drawn as a grey triangle marker instead of a third column */
    pyTriangle: boolean;
    /** small multiples active: self-scaling renderers must use the shared domain */
    sharedScale: boolean;
    /** shared value domain over ALL groups (assigned once domains are computed) */
    mainDomain: [number, number];
    /** materiality: false → variance is drawn grey instead of good/bad (thresholds in the
     *  pane). Callers pass the variance pair of the basis they draw; defaults to Δ1. */
    isMaterial: (p: DataPoint | null | undefined, vAbs?: number | null, vRel?: number | null) => boolean;
    /** high-contrast mode: only foreground/background colors, outlines for distinction */
    hc: boolean;
    ink: string;
    paper: string;
    subtle: string;
    /** lower-cased category labels to emphasize (IBCS EMPHASIZE) */
    highlight: Set<string>;
    /** hard scale maximum: larger base values are capped with a break marker */
    capMax: number | null;
    /** cumulative (YTD) view: totals header shows the last running value */
    cumulative: boolean;
    /** target / threshold line across the base chart */
    refLine: number | null;
    refLineLabel: string;
    /** line chart mode for long time series (IBCS line notation) */
    lineMode: boolean;
    /** moving average window (0 = off), columns/line only */
    movingAvg: number;
    /** combo: second measure as a line over the columns (own zero-anchored scale) */
    hasLine: boolean;
    lineName: string;
    fmtLine: IValueFormatter;
    /** waterfall-bridge rendering layered on top of columns/bars orientation */
    waterfallStyle: boolean;
    sortByImpact: boolean;
}

/** running cascade of "from"/"to" positions for the waterfall-bridge style */
interface Cascade {
    from: (number | null)[];
    to: (number | null)[];
    /** sum of all basis values — where the cascade starts */
    basisSum: number;
    /** sum of all AC/FC values — where the cascade ends */
    valueSum: number;
    /** AC-only portion of valueSum (hatched vs. solid end anchor) */
    acSum: number;
    /** FC-only portion of valueSum */
    fcSum: number;
}

function linearScale(d0: number, d1: number, r0: number, r1: number): Scale {
    const dd = (d1 - d0) || 1;
    return (v: number) => r0 + ((v - d0) / dd) * (r1 - r0);
}

function extent(values: (number | null)[]): [number, number] {
    let mn = 0, mx = 0;
    for (const v of values) {
        if (v == null || !isFinite(v)) { continue; }
        if (v < mn) { mn = v; }
        if (v > mx) { mx = v; }
    }
    return [mn, mx];
}

/**
 * Like extent(), but does NOT anchor the domain at zero. Needed for the waterfall-bridge
 * cascade: its bricks float at a running level (e.g. 17050..17750) with no "from zero" anchor
 * bar to visually justify a zero-based scale — extent() would collapse that band to a sliver
 * near one edge of a [0, 17750] range.
 */
function extentTight(values: (number | null)[]): [number, number] {
    let mn = Infinity, mx = -Infinity;
    for (const v of values) {
        if (v == null || !isFinite(v)) { continue; }
        if (v < mn) { mn = v; }
        if (v > mx) { mx = v; }
    }
    return mn === Infinity ? [0, 0] : [mn, mx];
}

export class Visual implements IVisual {
    private events: IVisualEventService;
    private host: IVisualHost;
    private root: HTMLElement;
    private svg: SVGSVGElement;
    private selectionManager: ISelectionManager;
    private tooltipService: ITooltipService;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private catGroups: { g: SVGGElement; sel: ISelectionId | null }[] = [];
    private measureFormat: string | undefined;
    private measureName: string | undefined;
    private lineFormat: string | undefined;
    private lineName: string | undefined;
    /** shared waterfall domain across small-multiples cells (IBCS same scale) */
    private sharedWfDomain: [number, number] | null = null;
    /** global font multiplier from the labels "Size preset" (Full HD = 1.5) */
    private fontK = 1;
    /** per-category mark groups in build order, for the ▶ reveal animation */
    private animGroups: SVGGElement[][] = [];
    private animTimers: number[] = [];
    /** small multiples: currently zoomed-in group (transient, ⤢/← in the chart) */
    private zoomGroup: string | null = null;
    /** table mode: expanded hierarchy parents (transient, chevron click in the chart) */
    private expandedRows = new Set<string>();
    /** persist-race guard: expand-state JSON we wrote but the host has not echoed */
    private pendingTableExpanded: string | null = null;
    /** table mode: vertical scroll offset in rows per tile (transient, wheel/drag) */
    private tableScroll = new Map<string, number>();
    /** matrix mode: expanded column groups (persisted, chevron in the header) */
    private colExpanded = new Set<string>();
    private pendingTableColExpanded: string | null = null;
    /** table: live row filter from the 🔍 header control (transient, interactive only) */
    private tableSearch = "";
    private searchEditor: HTMLInputElement | null = null;
    /** table: manual name-column width (persisted via drag on the column edge) */
    private tableNameW: number | null = null;
    private pendingTableNameW: string | null = null;
    /** bound Filter-Info text measure (filter context for the filter footer) */
    private filterInfo: string | null = null;
    /** table header sort, e.g. "dabs_desc" ("" = data order), persisted */
    private tableSort = "";
    private pendingTableSort: string | null = null;
    /** in-chart card sort chip override ("" = use the pane dropdown), persisted */
    private cardSortSel = "";
    private pendingCardSort: string | null = null;
    /** landing font-preset pill: value we persisted but the host has not echoed yet */
    private pendingFontPreset: string | null = null;
    /** landing mode pick: orientation we persisted but the host has not echoed yet */
    private pendingOrientation: string | null = null;
    /** structure-edit mode (one-click P&L): row clicks open the structure menu */
    private structureEdit = false;
    private structEditor: HTMLDivElement | null = null;
    /** category the open structure menu belongs to (closed when it disappears) */
    private structCat: string | null = null;
    private structOutside: ((ev: MouseEvent) => void) | null = null;
    /** persist-race guard for the one-click-P&L lists (invert/result/skip/hide/chart) */
    private pendingListProps = new Map<ListProp, string>();
    /** compare-on-click: whether the mode is active this render + picked categories */
    private compareActive = false;
    private compareCats: string[] = [];
    /** bar-end anchors of the current render, for the compare overlay */
    private compareAnchors = new Map<string, { band: number; end: number; value: number }>();
    /** last update args so in-chart interactions (zoom, compare) can re-render */
    private lastRender: { points: DataPoint[]; width: number; height: number } | null = null;
    /** data facts driving context-sensitive visibility in the format pane */
    private paneHasPy = false;
    private paneHasPl = false;
    private paneHasComments = false;
    private paneHasMultiples = false;
    /** basis parseData actually used — single source of truth for ΔBasis labels */
    private basisMode: Basis = "py";
    /** secondary basis (the dual-variance counterpart of basisMode) */
    private basis2Mode: "py" | "plan" = "plan";
    private paneHasFcPrev = false;
    private paneHasFc = false;
    private paneHasBm = false;
    /** false in export/print contexts — suppresses all in-chart buttons/chrome */
    private allowInteractions = true;
    private locMgr: powerbi.extensibility.ILocalizationManager | null = null;
    /** GuV-Statement: persisted scenario view ("ac" | "acfc" | "pl", "" = auto) */
    private pnlView = "";
    /** persist-race guard: view value we wrote but the host has not echoed yet */
    private pendingPnlView: string | null = null;
    /** GuV-Statement: collapsed sum blocks (session state, like expandedRows) */
    private pnlCollapsed = new Set<string>();
    /** user-entered comments persisted in the report (commentsPanel.userComments JSON) */
    private userComments = new Map<string, string>();
    private commentEdit = false;
    private commentEditor: HTMLDivElement | null = null;
    /** JSON just persisted, until the host round-trip echoes it back */
    private pendingCommentsJson: string | null = null;
    private static instanceCounter = 0;
    private instanceId: number;

    constructor(options: VisualConstructorOptions) {
        this.events = options.host.eventService;
        this.host = options.host;
        const localizationManager = options.host.createLocalizationManager();
        this.locMgr = localizationManager;
        this.formattingSettingsService = new FormattingSettingsService(localizationManager);
        // dropdown items serialize to the host, so their labels must be resolved
        // here — a DisplayNameGetter function would be dropped at the sandbox edge
        localizeEnumItems(localizationManager);
        // export/print contexts (PDF, PowerPoint, subscriptions) render without
        // interactions — hide the in-chart buttons there instead of dead chrome
        this.allowInteractions = options.host.hostCapabilities?.allowInteractions !== false;
        this.selectionManager = options.host.createSelectionManager();
        this.tooltipService = options.host.tooltipService;
        this.root = options.element;
        this.root.classList.add("icd-root");
        this.instanceId = Visual.instanceCounter++;

        this.svg = document.createElementNS(SVG_NS, "svg");
        this.root.appendChild(this.svg);

        // click on empty space clears selection (and a pending compare pick)
        this.svg.addEventListener("click", () => {
            this.closeCommentEditor();
            this.selectionManager.clear();
            this.applySelectionOpacity([]);
            if (this.compareCats.length > 0) {
                this.compareCats = [];
                this.rerender();
            }
        });
        this.svg.addEventListener("contextmenu", (e: MouseEvent) => {
            e.preventDefault();
            this.selectionManager.showContextMenu(null, { x: e.clientX, y: e.clientY });
        });
    }

    public update(options: VisualUpdateOptions): void {
        this.events.renderingStarted(options);
        try {
            const dataView: DataView | undefined = options.dataViews && options.dataViews[0];
            this.formattingSettings = this.formattingSettingsService
                .populateFormattingSettingsModel(VisualFormattingSettingsModel, dataView);
            // one-click-P&L lists: a just-persisted value must survive a stale
            // metadata update that arrives before the host echoes it back
            for (const [prop, val] of [...this.pendingListProps]) {
                const slice = this.formattingSettings.chartCard[prop];
                if (String(slice.value || "") === val) { this.pendingListProps.delete(prop); }
                else { slice.value = val; }
            }
            // a just-clicked landing font-preset pill must survive a stale
            // metadata update that arrives before the host echoes it back
            const fpSlice = this.formattingSettings.labelsCard.fontPreset;
            if (this.pendingFontPreset != null) {
                if (String(fpSlice.value.value) === this.pendingFontPreset) {
                    this.pendingFontPreset = null;
                } else {
                    const fpIt = fpSlice.items.find(x => String(x.value) === this.pendingFontPreset);
                    if (fpIt) { fpSlice.value = fpIt; }
                }
            }
            // landing mode pick, same echo-guard pattern
            const orSlice = this.formattingSettings.chartCard.orientation;
            if (this.pendingOrientation != null) {
                if (String(orSlice.value.value) === this.pendingOrientation) {
                    this.pendingOrientation = null;
                } else {
                    const orIt = orSlice.items.find(x => String(x.value) === this.pendingOrientation);
                    if (orIt) { orSlice.value = orIt; }
                }
            }

            const width = options.viewport.width;
            const height = options.viewport.height;
            this.svg.setAttribute("width", String(width));
            this.svg.setAttribute("height", String(height));

            // a just-persisted comment must survive a stale metadata update that
            // arrives before the host round-trip echoes the new store back
            const rawStore = dataView?.metadata?.objects?.["commentsPanel"]?.["userComments"];
            const rawJson = typeof rawStore === "string" ? rawStore : "";
            if (this.pendingCommentsJson == null || rawJson === this.pendingCommentsJson) {
                this.pendingCommentsJson = null;
                this.userComments = this.readUserComments(dataView);
            }
            // a just-persisted view choice must survive a stale metadata update
            // that arrives before the host round-trip echoes the property back
            const rawView = dataView?.metadata?.objects?.["chart"]?.["pnlView"];
            const rawViewStr = typeof rawView === "string" ? rawView : "";
            if (this.pendingPnlView == null || rawViewStr === this.pendingPnlView) {
                this.pendingPnlView = null;
                this.pnlView = rawViewStr;
            }
            // persisted table drill state (bookmarkable), same echo-guard pattern
            const rawExp = dataView?.metadata?.objects?.["chart"]?.["tableExpanded"];
            const rawExpStr = typeof rawExp === "string" ? rawExp : "";
            if (this.pendingTableExpanded == null || rawExpStr === this.pendingTableExpanded) {
                this.pendingTableExpanded = null;
                if (rawExpStr !== "") {
                    try { this.expandedRows = new Set(JSON.parse(rawExpStr) as string[]); }
                    catch { /* corrupt store: keep the session state */ }
                }
            }
            // persisted manual name-column width, same echo-guard pattern
            const rawNw = dataView?.metadata?.objects?.["chart"]?.["tableNameWidth"];
            const rawNwStr = typeof rawNw === "string" ? rawNw : "";
            if (this.pendingTableNameW == null || rawNwStr === this.pendingTableNameW) {
                this.pendingTableNameW = null;
                const nwv = parseFloat(rawNwStr);
                this.tableNameW = isFinite(nwv) && nwv > 0 ? nwv : null;
            }
            // persisted matrix column drill state, same echo-guard pattern
            const rawColExp = dataView?.metadata?.objects?.["chart"]?.["tableColExpanded"];
            const rawColExpStr = typeof rawColExp === "string" ? rawColExp : "";
            if (this.pendingTableColExpanded == null || rawColExpStr === this.pendingTableColExpanded) {
                this.pendingTableColExpanded = null;
                if (rawColExpStr !== "") {
                    try { this.colExpanded = new Set(JSON.parse(rawColExpStr) as string[]); }
                    catch { /* corrupt store: keep the session state */ }
                }
            }
            // persisted table header sort (bookmarkable), same echo-guard pattern
            const rawSort = dataView?.metadata?.objects?.["chart"]?.["tableSort"];
            const rawSortStr = typeof rawSort === "string" ? rawSort : "";
            if (this.pendingTableSort == null || rawSortStr === this.pendingTableSort) {
                this.pendingTableSort = null;
                this.tableSort = rawSortStr;
            }
            // in-chart card sort chip override (bookmarkable), same echo-guard
            const rawCs = dataView?.metadata?.objects?.["chart"]?.["cardSortSel"];
            const rawCsStr = typeof rawCs === "string" ? rawCs : "";
            if (this.pendingCardSort == null || rawCsStr === this.pendingCardSort) {
                this.pendingCardSort = null;
                this.cardSortSel = rawCsStr;
            }
            const points = this.parseData(dataView);
            // an open structure menu must not outlive its row (filter/data change)
            if (this.structEditor && this.structCat != null
                && !(points ?? []).some(p => p.cat === this.structCat)) {
                this.closeStructureMenu();
            }
            if (!points || points.length === 0) {
                this.renderDemo(width, height);
                this.events.renderingFinished(options);
                return;
            }
            this.svg.style.display = "block";
            this.lastRender = { points, width, height };
            this.render(points, width, height);
            this.events.renderingFinished(options);
        } catch (error) {
            this.events.renderingFailed(options, String(error));
        }
    }

    /** re-render from the last update args — used by in-chart interactions (zoom, compare) */
    private rerender(): void {
        if (!this.lastRender) { return; }
        // render() mutates order in place via groups — pass a copy of the point list
        this.render([...this.lastRender.points], this.lastRender.width, this.lastRender.height);
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        // context-sensitive pane: hide options that cannot apply right now
        const fs = this.formattingSettings;
        const orient = String(fs.chartCard.orientation.value.value);
        const bothBases = this.paneHasPy && this.paneHasPl;
        fs.chartCard.topN.visible = orient === "bars" || orient === "catbridge"
            || orient === "table" || orient === "dumbbell" || orient === "cards";
        fs.chartCard.movingAverage.visible = orient === "columns" || orient === "line";
        fs.chartCard.dualVariance.visible = bothBases;
        fs.chartCard.comparisonMode.visible = bothBases || this.paneHasFcPrev;
        fs.chartCard.pyTriangle.visible = (bothBases
            && (orient === "columns" || orient === "bars" || orient === "table"
                || orient === "catbridge" || orient === "intwaterfall"))
            || (orient === "intwaterfall" && this.paneHasPy && this.paneHasFc);
        fs.chartCard.waterfallStyle.visible = orient === "columns" || orient === "bars";
        fs.chartCard.sortByImpact.visible = orient === "catbridge"
            || ((orient === "columns" || orient === "bars") && fs.chartCard.waterfallStyle.value);
        fs.chartCard.groupEvery.visible = orient === "columns" || orient === "bars"
            || orient === "line" || orient === "catbridge";
        fs.chartCard.bridgeGroup.visible = orient === "columns" || orient === "bars"
            || orient === "intwaterfall" || orient === "catbridge" || orient === "pnl";
        fs.chartCard.chartButtons.visible = orient === "intwaterfall" || orient === "catbridge"
            || orient === "pnl";
        fs.chartCard.driverNote.visible = orient === "catbridge";
        fs.chartCard.cardsGroup.visible = orient === "cards";
        fs.scaleCard.refLineLabel.visible = String(fs.scaleCard.refLine.value || "").trim() !== "";
        fs.scaleCard.capOverflow.visible = (fs.scaleCard.fixedMax.value ?? 0) > 0;
        fs.scaleCard.fixedVarMax.visible = fs.chartCard.showAbsoluteVariance.value;
        // comments card stays visible without a comment measure — the in-chart
        // capture mode works on any category
        fs.commentsCard.visible = true;
        fs.chartCard.multiplesGroup.visible = this.paneHasMultiples;
        fs.chartCard.cumulativeButton.visible = orient === "columns" || orient === "line";
        fs.chartCard.cumulative.visible = orient === "columns" || orient === "line" || orient === "table";
        fs.chartCard.cumulativeKind.visible = fs.chartCard.cumulative.visible && fs.chartCard.cumulative.value;
        fs.chartCard.fiscalStart.visible = fs.chartCard.cumulativeKind.visible
            && String(fs.chartCard.cumulativeKind.value.value) !== "r12";
        // benchmark counts: cards in monitoring mode (AC + BM only) judge against
        // BM and need the materiality thresholds just as much
        fs.chartCard.materialityAbs.visible = this.paneHasPy || this.paneHasPl || this.paneHasBm;
        fs.chartCard.materialityPct.visible = this.paneHasPy || this.paneHasPl || this.paneHasBm;
        fs.chartCard.compareClick.visible = orient === "columns" || orient === "bars";
        fs.chartCard.showTotal.visible = orient === "columns" || orient === "bars"
            || orient === "line" || orient === "table";
        // scale card only where the shared main scale exists; the sync group
        // additionally needs renderChart (waterfall computes its own domain);
        // the table consumes the sync domains but has no ref line / cap marker
        fs.scaleCard.visible = orient === "columns" || orient === "bars"
            || orient === "line" || orient === "waterfall" || orient === "table";
        fs.scaleCard.syncGroup.visible = orient !== "waterfall";
        fs.scaleCard.refLineGroup.visible = orient !== "table";
        if (orient === "table") { fs.scaleCard.capOverflow.visible = false; }
        fs.chartCard.tableGroup.visible = orient === "table";
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }

    // ------------------------------------------------------------------ data

    private missingHint: string | null = null;

    private parseData(dataView: DataView | undefined): DataPoint[] | null {
        this.missingHint = null;
        const catCols = dataView?.categorical?.categories;
        // with drilldown, "expand all" delivers several category-role columns (one per level)
        const catLevels = catCols?.filter(c => c.source.roles?.["category"]) ?? [];
        const cat = catLevels[0];
        const mult = catCols?.find(c => c.source.roles?.["multiples"]);
        this.paneHasMultiples = !!mult;
        const seriesCol = catCols?.find(c => c.source.roles?.["series"]);
        const rowTypeCol = catCols?.find(c => c.source.roles?.["rowType"]);
        const fcFlagCol = catCols?.find(c => c.source.roles?.["fcFlag"]);
        const colCols = catCols?.filter(c => c.source.roles?.["colgroup"]) ?? [];
        const valueCols = dataView?.categorical?.values;
        if (!cat || !valueCols || valueCols.length === 0) { return null; }

        this.missingHint = null;
        const byRole: { [role: string]: (number | null)[] } = {};
        let comments: (string | null)[] | null = null;
        this.measureFormat = undefined;
        this.filterInfo = null;
        for (const col of valueCols) {
            const roles = col.source.roles || {};
            for (const role of ["actual", "previousYear", "plan", "forecast", "benchmark", "lineMeasure", "prevForecast"]) {
                if (roles[role]) {
                    byRole[role] = col.values.map(v => (typeof v === "number" && isFinite(v)) ? v : null);
                    if (role === "actual" || (role === "forecast" && !this.measureFormat)) {
                        if (col.source.format) { this.measureFormat = col.source.format; }
                        if (!this.measureName || role === "actual") {
                            this.measureName = col.source.displayName;
                        }
                    }
                    if (role === "lineMeasure") {
                        this.lineFormat = col.source.format;
                        this.lineName = col.source.displayName;
                    }
                }
            }
            if (roles["comments"]) {
                comments = col.values.map(v =>
                    v != null && String(v).trim() !== "" ? String(v) : null);
            }
            if (roles["filterInfo"]) {
                // scalar text measure — same value in every row, take the first set one
                const v = col.values.find(x => x != null && String(x).trim() !== "");
                this.filterInfo = v != null ? String(v) : null;
            }
        }
        this.paneHasPy = !!byRole["previousYear"];
        this.paneHasPl = !!byRole["plan"];
        this.paneHasFcPrev = !!byRole["prevForecast"];
        this.paneHasFc = !!byRole["forecast"];
        this.paneHasBm = !!byRole["benchmark"];
        this.paneHasComments = comments != null;
        if (!byRole["actual"] && !byRole["forecast"]) {
            // some fields are bound but the value measure is missing — say so
            if (valueCols.length > 0 || mult || rowTypeCol || fcFlagCol) {
                this.missingHint = "Actual (AC) fehlt — bitte Ist-Measure ins Actual-Feld ziehen";
            }
            return null;
        }

        const basisMode = this.resolveBasis(byRole);
        this.basisMode = basisMode;
        this.basis2Mode = basisMode === "plan" ? "py"
            : basisMode === "fcrev" ? (byRole["plan"] ? "plan" : "py") : "plan";
        const points: DataPoint[] = [];
        let commentCounter = 0;
        for (let i = 0; i < cat.values.length; i++) {
            let ac = byRole["actual"] ? byRole["actual"][i] : null;
            const py = byRole["previousYear"] ? byRole["previousYear"][i] : null;
            const pl = byRole["plan"] ? byRole["plan"][i] : null;
            let fc = byRole["forecast"] ? byRole["forecast"][i] : null;
            // chart-builder compatible flag column: 1/true marks the AC value as
            // forecast, 2/"vorläufig"/"prelim" marks it as a preliminary actual
            const flag = fcFlagCol ? fcFlagCol.values[i] : null;
            const flagStr = flag != null ? String(flag).trim().toLowerCase() : "";
            const isPrelim = flagStr === "2" || flagStr === "vorläufig" || flagStr === "vorlaeufig"
                || flagStr === "prelim" || flagStr === "preliminary" || flagStr === "p";
            const flagOn = !isPrelim && flagStr !== "" && flagStr !== "0" && flagStr !== "false"
                && flagStr !== "nein" && flagStr !== "no";
            if (flagOn && ac != null && fc == null) {
                fc = ac;
                ac = null;
            }
            const isFc = ac == null && fc != null;
            const value = ac != null ? ac : fc;
            const fcPrev = byRole["prevForecast"] ? byRole["prevForecast"][i] : null;
            const basis = basisMode === "plan" ? pl : basisMode === "fcrev" ? fcPrev : py;
            const varAbs = (value != null && basis != null) ? value - basis : null;
            const varRel = (varAbs != null && basis != null && basis !== 0)
                ? (varAbs / Math.abs(basis)) * 100 : null;
            const basis2 = this.basis2Mode === "plan" ? pl : py;
            const var2Abs = (value != null && basis2 != null) ? value - basis2 : null;
            const var2Rel = (var2Abs != null && basis2 != null && basis2 !== 0)
                ? (var2Abs / Math.abs(basis2)) * 100 : null;
            const comment = comments ? comments[i] : null;
            let selBuilder = this.host.createSelectionIdBuilder();
            for (const level of catLevels) { selBuilder = selBuilder.withCategory(level, i); }
            if (mult) { selBuilder = selBuilder.withCategory(mult, i); }
            const levelLabels = catLevels.map(level => this.categoryLabel(level.values[i]));
            points.push({
                cat: levelLabels.join(" · "),
                catLevels: levelLabels.length > 1 ? levelLabels : null,
                colLevels: colCols.length > 0
                    ? colCols.map(c => this.categoryLabel(c.values[i])) : null,
                ac, py, pl, fc, value, isFc, isPrelim: isPrelim && value != null,
                basis, varAbs, varRel, var2Abs, var2Rel,
                bm: byRole["benchmark"] ? byRole["benchmark"][i] : null,
                fcPrev,
                lineVal: byRole["lineMeasure"] ? byRole["lineMeasure"][i] : null,
                stackSeries: seriesCol && seriesCol.values[i] != null
                    ? this.categoryLabel(seriesCol.values[i]) : null,
                comment,
                commentNo: comment != null ? ++commentCounter : null,
                group: mult ? this.categoryLabel(mult.values[i]) : null,
                rowType: rowTypeCol && rowTypeCol.values[i] != null
                    ? String(rowTypeCol.values[i]).toLowerCase() : null,
                isRest: false,
                sel: selBuilder.createSelectionId()
            });
        }
        // merge user-entered comments (persisted via the in-chart editor) and renumber;
        // with a stack series the same category repeats — only its first point gets the marker
        if (this.userComments.size > 0) {
            const seen = new Set<string>();
            for (const p of points) {
                const key = this.commentKey(p);
                if (seen.has(key)) { continue; }
                const uc = this.userComments.get(key);
                if (uc == null) { continue; }
                seen.add(key);
                p.comment = p.comment ? `${p.comment} · ✎ ${uc}` : `✎ ${uc}`;
            }
            let no = 0;
            for (const p of points) { p.commentNo = p.comment != null ? ++no : null; }
        }
        return points;
    }

    private categoryLabel(v: powerbi.PrimitiveValue): string {
        if (v == null) { return "(blank)"; }
        if (v instanceof Date) {
            return v.toLocaleDateString(this.host.locale, { year: "2-digit", month: "short" });
        }
        return String(v);
    }

    private resolveBasis(byRole: { [role: string]: (number | null)[] }): Basis {
        const mode = String(this.formattingSettings.chartCard.comparisonMode.value.value);
        if (mode === "py") { return "py"; }
        if (mode === "plan") { return "plan"; }
        if (mode === "fcrev" && byRole["prevForecast"] && byRole["prevForecast"].some(v => v != null)) {
            return "fcrev";
        }
        // auto (or fcrev without the role): prefer plan, otherwise previous year
        return byRole["plan"] && byRole["plan"].some(v => v != null) ? "plan" : "py";
    }

    // ------------------------------------------------------------ formatting

    /** display-unit divisor + decimals the label formatter will use for maxAbs */
    private formatterParams(maxAbs: number, allIntegers: boolean): { unit: number; prec: number } {
        const decimals = Math.max(0, Math.min(3, this.formattingSettings.labelsCard.decimals.value ?? 1));
        const unit = String(this.formattingSettings.labelsCard.displayUnits.value.value);
        let unitValue: number;
        switch (unit) {
            case "none": unitValue = 0; break;
            case "k": unitValue = 1e3; break;
            case "m": unitValue = 1e6; break;
            case "b": unitValue = 1e9; break;
            default:
                unitValue = maxAbs >= 1e9 ? 1e9 : maxAbs >= 1e6 ? 1e6 : maxAbs >= 1e4 ? 1e3 : 0;
                break;
        }
        // unscaled integers need no forced decimals
        const precision = unitValue === 0 && allIntegers ? 0 : decimals;
        return { unit: unitValue, prec: precision };
    }

    private makeFormatter(maxAbs: number, allIntegers: boolean, formatOverride?: string): IValueFormatter {
        const { unit, prec } = this.formatterParams(maxAbs, allIntegers);
        return valueFormatter.create({
            format: formatOverride ?? this.measureFormat,
            value: unit,
            precision: prec,
            cultureSelector: this.host.locale
        });
    }

    /**
     * Sum-safe rounding (largest remainder): nudges the values in label quanta
     * (display unit × decimals) so the rounded labels add up to the rounded total.
     * Returns adjusted values that format exactly at the label precision.
     */
    private sumSafeAdjust(values: (number | null)[], unit: number, prec: number): (number | null)[] {
        const div = unit || 1;
        const f = Math.pow(10, prec);
        const quanta = values.map(v => v == null ? null : (v / div) * f);
        const total = quanta.reduce((a: number, v) => a + (v ?? 0), 0);
        const target = Math.round(total);
        const out = quanta.map(v => v == null ? null : Math.floor(v));
        let need = target - out.reduce((a: number, v) => a + (v ?? 0), 0);
        const byRemainder = quanta
            .map((v, i) => v == null ? null : { i, r: v - Math.floor(v) })
            .filter((e): e is { i: number; r: number } => e != null)
            .sort((a, b) => b.r - a.r);
        for (const e of byRemainder) {
            if (need <= 0) { break; }
            (out[e.i] as number)++;
            need--;
        }
        return out.map(v => v == null ? null : (v / f) * div);
    }

    /** localized in-chart string with English fallback (resources.resjson key) */
    private locStr(key: string, fallback: string): string {
        const s = this.locMgr?.getDisplayName(key);
        return s && s !== key ? s : fallback;
    }

    private fmtSigned(fmt: IValueFormatter, v: number): string {
        return (v > 0 ? "+" : "") + fmt.format(v);
    }

    private fmtPercent(v: number): string {
        const nf = new Intl.NumberFormat(this.host.locale, {
            minimumFractionDigits: 1, maximumFractionDigits: 1
        });
        const sign = v > 0 ? "+" : v < 0 ? "−" : "";
        return sign + nf.format(Math.abs(v)) + "%";
    }

    // --------------------------------------------------------------- landing

    /** landing page renders a live sample chart instead of a text hint */
    /**
     * empty-state landing: a mode gallery — one mini preview tile per chart mode.
     * Clicking a tile persists chart.orientation, so the visual starts in that
     * mode once fields are bound. Replaces the old single pre-rendered sample.
     */
    private renderDemo(width: number, height: number): void {
        // no live data: in-chart interactions must not re-render a stale dataset
        this.lastRender = null;
        this.compareCats = [];
        this.svg.style.display = "block";
        while (this.svg.firstChild) { this.svg.removeChild(this.svg.firstChild); }
        const ink = "#404040", grey = "#B3B3B3", teal = "#1E8F9E", red = "#D64541";
        const subtle = "#8A8A8A", paper = "#FFFFFF";
        const hint = this.missingHint
            || this.locStr("Demo_Hint", "Sample data — add Category and Actual (AC)");

        // tiny visuals: no room for the gallery — title + hint only
        if (width < 300 || height < 220) {
            const t0 = this.el("text", {
                x: width / 2, y: height / 2 - 8, "text-anchor": "middle",
                "font-size": 13, "font-weight": 700, fill: ink, "font-family": FONT
            }, this.svg);
            t0.textContent = "ChartKitchen byDatenWG";
            const t1 = this.el("text", {
                x: width / 2, y: height / 2 + 10, "text-anchor": "middle",
                "font-size": 10, fill: subtle, "font-family": FONT
            }, this.svg);
            t1.textContent = this.truncate(hint, width - 12, 10);
            return;
        }

        // hatch pattern for the FC mini column
        const defs = this.el("defs", {}, this.svg);
        const pat = this.el("pattern", {
            id: "icd-demo-hatch", width: 4, height: 4,
            patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)"
        }, defs);
        this.el("rect", { x: 0, y: 0, width: 4, height: 4, fill: paper }, pat);
        this.el("line", { x1: 0, y1: 0, x2: 0, y2: 4, stroke: ink, "stroke-width": 1.4 }, pat);

        // ------- header + footer. The heading scales with the effective font
        // factor (preset × free scale), so the selector below gives live feedback
        const sLc = this.formattingSettings.labelsCard;
        const kf = Math.min(3, ({ compact: 1, fullhd: 1.5, presentation: 2 }[
            String(sLc.fontPreset.value.value)] ?? 1)
            * Math.max(0.5, Math.min(3, Number(sLc.fontScale.value ?? 100) / 100)));
        const titleF = Math.min(15 * kf, 40);
        const subF = Math.min(10.5 * kf, 24);
        // all other landing text follows too, gently capped so the fixed-size
        // tiles never overflow — enough to SEE the chosen preset everywhere
        const tf = Math.min(1.4, Math.max(1, kf));
        const f1 = 12.5 * tf, f2 = 11 * tf, f3 = 10.5 * tf;
        const title = this.el("text", {
            x: 12, y: 9 + titleF, "font-size": titleF, "font-weight": 700,
            fill: ink, "font-family": FONT
        }, this.svg);
        title.textContent = "ChartKitchen byDatenWG";
        const sub = this.el("text", {
            x: 12, y: 9 + titleF + subF + 5, "font-size": subF, fill: subtle, "font-family": FONT
        }, this.svg);
        sub.textContent = this.truncate(
            `${hint} · ${this.locStr("Demo_Pick", "Click a preview to pick the chart mode")}`,
            width - 24, subF);
        const made = this.el("text", {
            x: width / 2, y: height - 8, "text-anchor": "middle",
            "font-size": 10, fill: subtle, "font-family": FONT
        }, this.svg);
        made.textContent = "made by Daten-WG";
        // font-preset selector under the gallery (interactive only, needs room)
        const showSel = this.allowInteractions && width >= 380 && height >= 260;

        // ------- mode list: small preview tile + name, use case and fields per mode
        const modes: { v: string; key: string; en: string; use: string; fields: string }[] = [
            { v: "columns", key: "Enum_Orientation_Columns", en: "Columns (Time)",
                use: this.locStr("Demo_Use_Columns", "Monthly/quarterly series vs. plan & prior year"),
                fields: this.locStr("Demo_F_Columns", "Category (time), AC, PY/PL/FC") },
            { v: "bars", key: "Enum_Orientation_Bars", en: "Bars (Structure)",
                use: this.locStr("Demo_Use_Bars", "Compare regions, products, accounts"),
                fields: this.locStr("Demo_F_Bars", "Category, AC, PY/PL") },
            { v: "line", key: "Enum_Orientation_Line", en: "Line",
                use: this.locStr("Demo_Use_Line", "Long series (weeks/days), trend view"),
                fields: this.locStr("Demo_F_Line", "Category (time), AC, PY") },
            { v: "waterfall", key: "Enum_Orientation_Waterfall", en: "Waterfall / Bridge",
                use: this.locStr("Demo_Use_Waterfall", "P&L waterfall or basis→AC bridge"),
                fields: this.locStr("Demo_F_Waterfall", "Category, AC (+ type sum/delta)") },
            { v: "intwaterfall", key: "Enum_Orientation_IntWaterfall", en: "Integrated Bridge",
                use: this.locStr("Demo_Use_IntWf", "Year bridge: PY → AC/FC across the months"),
                fields: this.locStr("Demo_F_IntWf", "Category (months), AC, PY/PL, FC") },
            { v: "catbridge", key: "Enum_Orientation_CatBridge", en: "Category Bridge",
                use: this.locStr("Demo_Use_CatBridge", "Driver bridge across categories + reconciliation"),
                fields: this.locStr("Demo_F_CatBridge", "Category, AC, PY/PL") },
            { v: "table", key: "Enum_Orientation_Table", en: "Table (IBCS)",
                use: this.locStr("Demo_Use_Table", "KPI table: bars, hierarchy, Σ, matrix columns"),
                fields: this.locStr("Demo_F_Table", "Category(ies), AC, PY/PL (+ columns)") },
            { v: "pnl", key: "Enum_Orientation_Pnl", en: "P&L Statement",
                use: this.locStr("Demo_Use_Pnl", "P&L rows with cascade columns and levels"),
                fields: this.locStr("Demo_F_Pnl", "Category, AC, PY, type (sum/delta)") },
            { v: "cards", key: "Enum_Orientation_Cards", en: "KPI Cards",
                use: this.locStr("Demo_Use_Cards", "KPI tiles for monitoring: status, bullet"),
                fields: this.locStr("Demo_F_Cards", "Category, AC, PY/PL/BM") },
            { v: "pareto", key: "Enum_Orientation_Pareto", en: "Pareto",
                use: this.locStr("Demo_Use_Pareto", "ABC analysis: top drivers + cumulative %"),
                fields: this.locStr("Demo_F_Pareto", "Category, AC") },
            { v: "dumbbell", key: "Enum_Orientation_Dumbbell", en: "Dumbbell",
                use: this.locStr("Demo_Use_Dumbbell", "Before/after per category as dot pairs"),
                fields: this.locStr("Demo_F_Dumbbell", "Category, AC, PY/PL") },
            { v: "slope", key: "Enum_Orientation_Slope", en: "Slope",
                use: this.locStr("Demo_Use_Slope", "Rank shifts between two points in time"),
                fields: this.locStr("Demo_F_Slope", "Category, AC, PY/PL") }
        ];
        const fieldsPre = this.locStr("Demo_Fields", "Fields");
        const active = String(this.formattingSettings.chartCard.orientation.value.value);
        const padX = 12, gap = 8;
        const top = 16 + titleF + subF + 12;
        const selH = Math.round(21 * Math.min(1.25, tf));
        const footH = 22 + (showSel ? selH + 9 : 0);
        const availW = width - padX * 2;
        const availH = height - top - footH;

        // ---- staged layouts: full list → compact grid → single hero preview.
        // Every tier keeps fixed proportions; nothing overlaps at small sizes
        const cols = width >= 920 ? 3 : width >= 600 ? 2 : 1;
        const rowsL = Math.ceil(modes.length / cols);
        const entryWn = (availW - (cols - 1) * gap) / cols;
        const entryHn = (availH - (rowsL - 1) * gap) / rowsL;
        const listOk = entryWn >= 250 && entryHn >= 64;
        const gcols = Math.max(2, Math.min(6, Math.floor((availW + gap) / (118 + gap))));
        const grows = Math.ceil(modes.length / gcols);
        const gtileWn = (availW - (gcols - 1) * gap) / gcols;
        const gtileHn = (availH - (grows - 1) * gap) / grows;
        const gridOk = gtileWn >= 100 && gtileHn >= 56;

        const pickMode = (v: string) => {
            // optimistic: re-render the landing immediately so the click gives
            // instant feedback; the host echo re-renders the same state later
            this.pendingOrientation = v;
            const oSlice = this.formattingSettings.chartCard.orientation;
            const oIt = oSlice.items.find(x => String(x.value) === v);
            if (oIt) { oSlice.value = oIt; }
            this.host.persistProperties({
                merge: [{ objectName: "chart", selector: null, properties: { orientation: v } }]
            });
            this.renderDemo(width, height);
        };

        if (listOk || gridOk) {
            const uCols = listOk ? cols : gcols;
            const uRows = listOk ? rowsL : grows;
            // cap the entry size so a full-page visual does not stretch the gallery —
            // beyond the cap the block keeps its proportions and centers instead
            const entryW = listOk ? Math.min(410, entryWn) : Math.min(170, gtileWn);
            const entryH = listOk ? Math.min(102, entryHn) : Math.min(120, gtileHn);
            const blockW = uCols * entryW + (uCols - 1) * gap;
            const blockH = uRows * entryH + (uRows - 1) * gap;
            const x0 = Math.max(padX, (width - blockW) / 2);
            const y0 = top + Math.max(0, (height - top - footH - blockH) / 2);
            // align header with the (possibly centered) block — also vertically,
            // so it sits right above the gallery instead of sticking to the top
            title.setAttribute("x", String(x0));
            sub.setAttribute("x", String(x0));
            const subY = Math.max(9 + titleF + subF + 5, y0 - 10);
            title.setAttribute("y", String(subY - subF - 5));
            sub.setAttribute("y", String(subY));

            modes.forEach((m, i) => {
                const x = x0 + (i % uCols) * (entryW + gap);
                const y = y0 + Math.floor(i / uCols) * (entryH + gap);
                if (y + entryH > height - footH + 2) { return; }
                const on = m.v === active;
                const g = this.el("g", { role: "button", tabindex: "0" }, this.svg) as SVGGElement;
                const label = this.locStr(m.key, m.en);
                g.setAttribute("aria-label", label);
                g.setAttribute("aria-pressed", String(on));
                const tip = this.el("title", {}, g);
                tip.textContent = `${label} — ${m.use}`;
                this.el("rect", {
                    x, y, width: entryW, height: entryH, rx: 6,
                    fill: on ? "#EEF6F7" : "#FAFAF8",
                    stroke: on ? teal : "#E4E4DF", "stroke-width": on ? 1.6 : 1
                }, g);
                if (listOk) {
                    // small preview tile left, text block right
                    const tw = Math.min(96, entryH * 1.35), th = entryH - 14;
                    const px = x + 8, py2 = y + 7;
                    this.el("rect", {
                        x: px - 2, y: py2 - 2, width: tw + 4, height: th + 4, rx: 4,
                        fill: paper, stroke: on ? teal : "#DDDDD8", "stroke-width": on ? 1.6 : 1
                    }, g);
                    this.drawModeMini(g, m.v, px + 4, py2 + 4, tw - 8, th - 8, { ink, grey, teal, red, paper });
                    const tx = px + tw + 12;
                    const tmax = x + entryW - 10 - tx;
                    const lineH = Math.max(14, Math.min(17 * tf, entryH / 3.2));
                    let ty = y + entryH / 2 - lineH + 4.5;
                    const t1 = this.el("text", {
                        x: tx, y: ty, "font-size": f1, "font-weight": 700,
                        fill: ink, "font-family": FONT
                    }, g);
                    t1.textContent = this.truncate(`${on ? "✓ " : ""}${label}`, tmax, f1);
                    ty += lineH;
                    const t2 = this.el("text", {
                        x: tx, y: ty, "font-size": f2, fill: "#5A5A5A", "font-family": FONT
                    }, g);
                    t2.textContent = this.truncate(m.use, tmax, f2);
                    ty += lineH;
                    const t3 = this.el("text", {
                        x: tx, y: ty, "font-size": f3, fill: subtle, "font-family": FONT
                    }, g);
                    t3.textContent = this.truncate(`${fieldsPre}: ${m.fields}`, tmax, f3);
                } else {
                    // compact grid: preview with fixed inset + caption below
                    const px = x + 8, py2 = y + 6, pw = entryW - 16, ph = entryH - 14 - 9 * tf;
                    this.drawModeMini(g, m.v, px, py2, pw, ph, { ink, grey, teal, red, paper });
                    const cap = this.el("text", {
                        x: x + entryW / 2, y: y + entryH - 6, "text-anchor": "middle",
                        "font-size": f3, fill: on ? ink : subtle, "font-family": FONT,
                        "font-weight": on ? 700 : 400
                    }, g);
                    cap.textContent = this.truncate(`${on ? "✓ " : ""}${label}`, entryW - 10, f3);
                }
                if (this.allowInteractions) {
                    g.style.cursor = "pointer";
                    g.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); pickMode(m.v); });
                    g.addEventListener("keydown", (e: KeyboardEvent) => {
                        if (e.key !== "Enter" && e.key !== " ") { return; }
                        e.preventDefault();
                        e.stopPropagation();
                        pickMode(m.v);
                    });
                }
            });
        } else {
            // ---- hero tier: ONE stable preview (fixed 1.6:1 aspect) of the active
            // mode — always looks the same, just scales. Text lines join when the
            // height allows; ‹ › cycle through the modes
            const mi = Math.max(0, modes.findIndex(mm => mm.v === active));
            const m = modes[mi];
            const label = this.locStr(m.key, m.en);
            const canCycle = this.allowInteractions;
            const textH = (availH >= 175 ? 54 : availH >= 130 ? 22 : 0) * tf;
            let hh = Math.max(60, Math.min(230, availH - textH - 6));
            let hw = Math.min(availW - (canCycle ? 60 : 8), hh * 1.6);
            hh = hw / 1.6;
            const hx = padX + (availW - hw) / 2;
            const hy2 = top + Math.max(0, (availH - hh - textH) / 2);
            const g = this.el("g", {}, this.svg) as SVGGElement;
            this.el("rect", {
                x: hx, y: hy2, width: hw, height: hh, rx: 6,
                fill: paper, stroke: teal, "stroke-width": 1.4
            }, g);
            this.drawModeMini(g, m.v, hx + hw * 0.08, hy2 + hh * 0.10,
                hw * 0.84, hh * 0.78, { ink, grey, teal, red, paper });
            if (textH >= 22 * tf) {
                const t1 = this.el("text", {
                    x: hx + hw / 2, y: hy2 + hh + 18 * tf, "text-anchor": "middle",
                    "font-size": f1, "font-weight": 700, fill: ink, "font-family": FONT
                }, g);
                t1.textContent = this.truncate(label, availW - 8, f1);
            }
            if (textH >= 54 * tf) {
                const t2 = this.el("text", {
                    x: hx + hw / 2, y: hy2 + hh + 34 * tf, "text-anchor": "middle",
                    "font-size": f2, fill: "#5A5A5A", "font-family": FONT
                }, g);
                t2.textContent = this.truncate(m.use, availW - 8, f2);
                const t3 = this.el("text", {
                    x: hx + hw / 2, y: hy2 + hh + 49 * tf, "text-anchor": "middle",
                    "font-size": f3, fill: subtle, "font-family": FONT
                }, g);
                t3.textContent = this.truncate(`${fieldsPre}: ${m.fields}`, availW - 8, f3);
            }
            if (canCycle) {
                const arrow = (ax: number, dir: number, glyph: string) => {
                    const a = this.el("g", { role: "button", tabindex: "0" }, this.svg) as SVGGElement;
                    const next = modes[(mi + dir + modes.length) % modes.length];
                    const nLabel = this.locStr(next.key, next.en);
                    a.setAttribute("aria-label", nLabel);
                    const tip = this.el("title", {}, a);
                    tip.textContent = nLabel;
                    this.el("circle", {
                        cx: ax, cy: hy2 + hh / 2, r: 12,
                        fill: "#FAFAF8", stroke: "#DDDDD8", "stroke-width": 1
                    }, a);
                    const t = this.el("text", {
                        x: ax, y: hy2 + hh / 2 + 4.5, "text-anchor": "middle",
                        "font-size": 13, "font-weight": 700, fill: ink, "font-family": FONT
                    }, a);
                    t.textContent = glyph;
                    a.style.cursor = "pointer";
                    a.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); pickMode(next.v); });
                    a.addEventListener("keydown", (e: KeyboardEvent) => {
                        if (e.key !== "Enter" && e.key !== " ") { return; }
                        e.preventDefault();
                        e.stopPropagation();
                        pickMode(next.v);
                    });
                };
                arrow(hx - 22, -1, "‹");
                arrow(hx + hw + 22, 1, "›");
            }
        }

        // ------- font-preset selector: three pills above the "made by" line.
        // Persisting labels.fontPreset re-renders the landing, so the heading
        // above resizes immediately — live preview of the preset
        if (showSel) {
            const presets = [
                { v: "compact", key: "Enum_FontPreset_Compact", en: "Compact" },
                { v: "fullhd", key: "Enum_FontPreset_FullHd", en: "Full HD" },
                { v: "presentation", key: "Enum_FontPreset_Presentation", en: "Presentation" }
            ];
            const cur = String(sLc.fontPreset.value.value);
            const selTip = this.locStr("Labels_FontPreset", "Size preset");
            // short labels: strip the "(dashboard tile)"-style suffix of the enum text
            const labels = presets.map(p => this.locStr(p.key, p.en).split(" (")[0].trim());
            const segF = f3, segH = selH, segGap = 5, aaW = 26 * tf;
            const wds = labels.map(l => Math.ceil(this.maxTextWidth([l], segF)) + 20);
            const totW = aaW + segGap + wds.reduce((a, b) => a + b, 0) + segGap * (wds.length - 1);
            let sx = Math.max(padX, (width - totW) / 2);
            const sy = height - footH + 4;
            const aa = this.el("text", {
                x: sx + aaW / 2, y: sy + segH / 2 + 4, "text-anchor": "middle",
                "font-size": 12 * tf, "font-weight": 700, fill: subtle, "font-family": FONT
            }, this.svg);
            aa.textContent = "Aa";
            const aaTip = this.el("title", {}, aa);
            aaTip.textContent = selTip;
            sx += aaW + segGap;
            presets.forEach((p, i) => {
                const on = p.v === cur;
                const g = this.el("g", { role: "button", tabindex: "0" }, this.svg) as SVGGElement;
                g.setAttribute("aria-label", `${selTip}: ${labels[i]}`);
                g.setAttribute("aria-pressed", String(on));
                const tip = this.el("title", {}, g);
                tip.textContent = `${selTip}: ${this.locStr(p.key, p.en)}`;
                this.el("rect", {
                    x: sx, y: sy, width: wds[i], height: segH, rx: segH / 2,
                    fill: on ? teal : "#FAFAF8",
                    stroke: on ? teal : "#DDDDD8", "stroke-width": 1
                }, g);
                const t = this.el("text", {
                    x: sx + wds[i] / 2, y: sy + segH / 2 + 0.36 * segF, "text-anchor": "middle",
                    "font-size": segF, "font-weight": on ? 700 : 400,
                    fill: on ? "#FFFFFF" : ink, "font-family": FONT
                }, g);
                t.textContent = labels[i];
                g.style.cursor = "pointer";
                const apply = () => {
                    // optimistic: apply + re-render right away so the heading and
                    // the pill react instantly; the host echo confirms it later
                    this.pendingFontPreset = p.v;
                    const it = sLc.fontPreset.items.find(x => String(x.value) === p.v);
                    if (it) { sLc.fontPreset.value = it; }
                    this.host.persistProperties({
                        merge: [{ objectName: "labels", selector: null, properties: { fontPreset: p.v } }]
                    });
                    this.renderDemo(width, height);
                };
                g.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); apply(); });
                g.addEventListener("keydown", (e: KeyboardEvent) => {
                    if (e.key !== "Enter" && e.key !== " ") { return; }
                    e.preventDefault();
                    e.stopPropagation();
                    apply();
                });
                sx += wds[i] + segGap;
            });
        }
    }

    /** small schematic previews for the landing gallery — fixed brand colors */
    private drawModeMini(g: SVGElement, mode: string, x: number, y: number,
        w: number, h: number, c: { ink: string; grey: string; teal: string; red: string; paper: string }): void {
        const r = (rx: number, ry: number, rw: number, rh: number, fill: string,
            extra: Record<string, string | number> = {}) =>
            this.el("rect", { x: x + rx * w, y: y + ry * h, width: Math.max(1, rw * w), height: Math.max(1, rh * h), fill, ...extra }, g);
        const line = (x1: number, y1: number, x2: number, y2: number, stroke: string, sw = 1.4) =>
            this.el("line", { x1: x + x1 * w, y1: y + y1 * h, x2: x + x2 * w, y2: y + y2 * h, stroke, "stroke-width": sw }, g);
        const outline = { fill: c.paper, stroke: c.ink, "stroke-width": 1 } as const;
        switch (mode) {
            case "columns": {
                // variance mini panel + AC/PY/FC columns
                r(0.05, 0.02, 0.10, 0.16, c.teal); r(0.20, 0.10, 0.10, 0.08, c.red);
                r(0.35, 0.04, 0.10, 0.14, c.teal); r(0.50, 0.02, 0.10, 0.16, c.teal);
                line(0, 0.22, 1, 0.22, c.grey, 1);
                r(0.04, 0.55, 0.09, 0.45, c.grey); r(0.14, 0.45, 0.10, 0.55, c.ink);
                r(0.30, 0.50, 0.09, 0.50, c.grey); r(0.40, 0.38, 0.10, 0.62, c.ink);
                r(0.56, 0.44, 0.09, 0.56, c.grey);
                this.el("rect", { x: x + 0.66 * w, y: y + 0.30 * h, width: Math.max(1, 0.10 * w), height: 0.70 * h, fill: `url(#icd-demo-hatch)`, stroke: c.ink, "stroke-width": 1 }, g);
                line(0, 1, 1, 1, c.ink, 1.6);
                break;
            }
            case "bars": {
                r(0, 0.05, 0.55, 0.16, c.ink); r(0, 0.24, 0.40, 0.13, c.grey);
                r(0, 0.45, 0.42, 0.16, c.ink); r(0, 0.64, 0.50, 0.13, c.grey);
                line(0.72, 0, 0.72, 1, c.grey, 1);
                r(0.72, 0.06, 0.16, 0.14, c.teal); r(0.60, 0.46, 0.12, 0.14, c.red);
                line(0, 0, 0, 1, c.ink, 1.6);
                break;
            }
            case "line": {
                const pts = [[0, 0.75], [0.2, 0.55], [0.4, 0.62], [0.6, 0.35], [0.8, 0.42], [1, 0.2]];
                const py2 = [[0, 0.85], [0.2, 0.72], [0.4, 0.78], [0.6, 0.55], [0.8, 0.6], [1, 0.45]];
                const path = (arr: number[][], col: string, sw2: number) =>
                    this.el("polyline", {
                        points: arr.map(p => `${x + p[0] * w},${y + p[1] * h}`).join(" "),
                        fill: "none", stroke: col, "stroke-width": sw2
                    }, g);
                path(py2, c.grey, 1.2); path(pts, c.ink, 2);
                line(0, 1, 1, 1, c.ink, 1.6);
                break;
            }
            case "waterfall": {
                r(0.00, 0.30, 0.14, 0.70, c.ink);
                r(0.18, 0.14, 0.14, 0.16, c.teal); r(0.36, 0.14, 0.14, 0.24, c.red);
                r(0.54, 0.38, 0.14, 0.14, c.teal);
                r(0.72, 0.24, 0.16, 0.76, c.ink);
                line(0.14, 0.30, 0.18, 0.30, c.grey, 1); line(0.32, 0.14, 0.36, 0.14, c.grey, 1);
                line(0, 1, 1, 1, c.ink, 1.6);
                break;
            }
            case "intwaterfall": {
                r(0.00, 0.25, 0.13, 0.75, c.grey);
                r(0.18, 0.10, 0.10, 0.14, c.teal); r(0.30, 0.10, 0.10, 0.20, c.red);
                r(0.42, 0.26, 0.10, 0.12, c.teal); r(0.54, 0.22, 0.10, 0.14, c.teal);
                r(0.72, 0.16, 0.13, 0.84, c.ink);
                r(0.18, 0.72, 0.06, 0.28, c.ink); r(0.30, 0.66, 0.06, 0.34, c.ink);
                r(0.42, 0.76, 0.06, 0.24, c.ink); r(0.54, 0.70, 0.06, 0.30, c.ink);
                line(0, 1, 1, 1, c.ink, 1.6);
                break;
            }
            case "catbridge": {
                // PY total row on top, per-category grey bar + walking cascade
                // brick, AC total row at the bottom — like the real mode
                r(0.00, 0.02, 0.60, 0.10, c.grey);
                const bx = [0.38, 0.50, 0.62];
                for (let i = 0; i < 3; i++) {
                    const ry = 0.22 + i * 0.19;
                    r(0.00, ry, 0.24 - i * 0.05, 0.09, c.grey);
                    r(bx[i], ry, 0.12, 0.09, i === 1 ? c.red : c.teal);
                    if (i < 2) {
                        line(bx[i] + 0.12, ry + 0.09, bx[i] + 0.12, ry + 0.19, c.grey, 0.8);
                    }
                }
                line(0, 0.80, 0.74, 0.80, c.ink, 1.1);
                r(0.00, 0.84, 0.74, 0.12, c.ink);
                break;
            }
            case "table": {
                // name | AC over PY bar | Δ bars at an axis | Δ% pin — plus a
                // bold Σ row, matching the real table columns
                line(0, 0.05, 1, 0.05, c.ink, 1.4);
                const dAxis = 0.66, pinX = 0.87;
                const dw = [0.08, -0.06, 0.05];
                for (let i = 0; i < 3; i++) {
                    const ry = 0.13 + i * 0.20;
                    r(0.00, ry, 0.13, 0.08, c.grey);
                    r(0.17, ry - 0.015, 0.20 - i * 0.03, 0.05, c.grey);
                    r(0.17, ry + 0.020, 0.26 - i * 0.04, 0.07, c.ink);
                    const d = dw[i];
                    r(d >= 0 ? dAxis : dAxis + d, ry + 0.005, Math.abs(d), 0.08,
                        d >= 0 ? c.teal : c.red);
                    line(pinX, ry + 0.045, pinX + (d >= 0 ? 0.06 : -0.05), ry + 0.045,
                        d >= 0 ? c.teal : c.red, 1.4);
                    this.el("circle", {
                        cx: x + (pinX + (d >= 0 ? 0.06 : -0.05)) * w, cy: y + (ry + 0.045) * h,
                        r: 2, fill: c.ink
                    }, g);
                }
                line(dAxis, 0.10, dAxis, 0.92, c.grey, 0.9);
                line(0, 0.76, 1, 0.76, c.ink, 1.2);
                r(0.00, 0.82, 0.13, 0.09, c.ink);
                r(0.17, 0.82, 0.34, 0.09, c.ink);
                r(dAxis, 0.82, 0.10, 0.09, c.teal);
                break;
            }
            case "pnl": {
                // statement rows: label stubs left, cascade bricks walking down
                // to a bold subtotal — the P&L waterfall-column look
                const rows2: [number, number, string, boolean][] = [
                    [0.20, 0.58, c.ink, true],      // revenue (anchor)
                    [0.60, 0.16, c.red, false],     // cost 1
                    [0.46, 0.14, c.red, false],     // cost 2
                    [0.20, 0.26, c.ink, true],      // subtotal (anchor)
                    [0.46, 0.10, c.teal, false]     // other income
                ];
                rows2.forEach(([rx, rw, col, anchor], i) => {
                    const ry = 0.04 + i * 0.19;
                    r(0.00, ry, 0.12, 0.09, c.grey);
                    if (anchor) { line(0.16, ry - 0.02, 0.92, ry - 0.02, c.ink, 1.1); }
                    r(rx, ry, rw, 0.11, col);
                });
                line(0.16, 0.985, 0.92, 0.985, c.ink, 1.2);
                break;
            }
            case "cards": {
                for (let i = 0; i < 4; i++) {
                    const cx2 = (i % 2) * 0.52, cy2 = Math.floor(i / 2) * 0.54;
                    this.el("rect", {
                        x: x + cx2 * w, y: y + cy2 * h, width: 0.46 * w, height: 0.44 * h,
                        rx: 3, ...outline
                    }, g);
                    r(cx2 + 0.012, cy2 + 0.03, 0.018, 0.38, i === 1 ? c.red : c.teal);
                    r(cx2 + 0.08, cy2 + 0.10, 0.20, 0.10, c.ink);
                    r(cx2 + 0.08, cy2 + 0.26, 0.14, 0.06, c.grey);
                }
                break;
            }
            case "pareto": {
                const hs = [1, 0.75, 0.55, 0.4, 0.28];
                hs.forEach((hh, i) => r(0.02 + i * 0.19, 1 - hh, 0.14, hh, c.ink));
                this.el("polyline", {
                    points: [[0.09, 0.55], [0.28, 0.35], [0.47, 0.22], [0.66, 0.12], [0.85, 0.05]]
                        .map(p => `${x + p[0] * w},${y + p[1] * h}`).join(" "),
                    fill: "none", stroke: c.teal, "stroke-width": 1.8
                }, g);
                line(0, 1, 1, 1, c.ink, 1.6);
                break;
            }
            case "dumbbell": {
                for (let i = 0; i < 3; i++) {
                    const ry = 0.18 + i * 0.32;
                    line(0.15, ry, 0.75 - i * 0.15, ry, i === 1 ? c.red : c.teal, 2);
                    this.el("circle", { cx: x + 0.15 * w, cy: y + ry * h, r: 3.2, fill: c.grey }, g);
                    this.el("circle", { cx: x + (0.75 - i * 0.15) * w, cy: y + ry * h, r: 3.2, fill: c.ink }, g);
                }
                break;
            }
            case "slope": {
                line(0.08, 0, 0.08, 1, c.grey, 1.2); line(0.92, 0, 0.92, 1, c.grey, 1.2);
                line(0.08, 0.25, 0.92, 0.10, c.teal, 1.8);
                line(0.08, 0.55, 0.92, 0.70, c.red, 1.8);
                line(0.08, 0.80, 0.92, 0.60, c.ink, 1.8);
                break;
            }
        }
    }

    // ---------------------------------------------------------------- render

    private render(points: DataPoint[], width: number, height: number): void {
        while (this.svg.firstChild) { this.svg.removeChild(this.svg.firstChild); }
        this.catGroups = [];

        const s = this.formattingSettings;
        const orientationRaw = String(s.chartCard.orientation.value.value);
        const isWaterfall = orientationRaw === "waterfall";
        const lineMode = orientationRaw === "line";
        // integrated bridge (time waterfall + monthly columns + pins) and category bridge
        // (structure rows + cascade + double reconciliation) are standalone chart modes
        const isIntWf = orientationRaw === "intwaterfall";
        const isCatBridge = orientationRaw === "catbridge";
        // IBCS table: one row per category with value + AC·PY bars + ΔBasis bars + Δ% pins
        const isTable = orientationRaw === "table";
        // builder-parity modes on existing AC/PY data — no extra fields needed
        const isPareto = orientationRaw === "pareto";
        const isDumbbell = orientationRaw === "dumbbell";
        const isSlope = orientationRaw === "slope";
        // KPI cards: one tile per category — the KPI-card visual folded into the deck
        const isCards = orientationRaw === "cards";
        // GuV-Statement: row-based P&L with PY + scenario waterfall columns
        const isPnl = orientationRaw === "pnl";
        const orientation: Orientation =
            orientationRaw === "bars" || isCatBridge || isTable || isDumbbell || isCards || isPnl
                ? "bars" : "columns";
        // matrix column groups only pivot in table mode — everywhere else the same
        // category repeats once per column value; merge back to one point per category
        if (!isTable && points.some(p => p.colLevels && p.colLevels.length > 0)) {
            points = this.mergeColPoints(points);
        }
        // margin rows (rowType "pct") carry percentages, not € — only table, waterfall
        // and the P&L statement can render them; everywhere else they would corrupt
        // scales, Σ headers and rankings, so they are dropped up front
        if (!isTable && !isWaterfall && !isPnl) {
            points = points.filter(p => !(p.rowType ?? "").startsWith("pct"));
            if (points.length === 0) { return; }
        }
        // stacked mode: field-driven — filling the Stack-Series role stacks the plain
        // columns/bars automatically, an empty role leaves everything untouched
        const isStacked = (orientationRaw === "columns" || orientationRaw === "bars")
            && points.some(p => p.stackSeries != null);
        // waterfall-bridge is an optional add-on to columns/bars, not a separate orientation
        const wfStyleGlobal = s.chartCard.waterfallStyle.value && !isStacked
            && (orientationRaw === "columns" || orientationRaw === "bars");
        const sortByImpactOn = (wfStyleGlobal || isCatBridge) && s.chartCard.sortByImpact.value;
        // YTD only where a running total over the category axis makes sense — bridge,
        // structure and stacked modes would silently cumulate nonsense; the same goes
        // for structured P&L rows (sum/delta/pct): those are accounts, not periods
        const parseList = (v: string) => new Set(String(v || "")
            .split(",").map(x => x.trim().toLowerCase()).filter(x => x));
        const listResult = parseList(String(s.chartCard.resultList.value));
        const listSkip = parseList(String(s.chartCard.skipList.value));
        const listPnl = orientationRaw === "table" && (listResult.size > 0 || listSkip.size > 0)
            && points.some(p => listResult.has(p.cat.trim().toLowerCase())
                || listSkip.has(p.cat.trim().toLowerCase()));
        const cumulativeOn = s.chartCard.cumulative.value && !isStacked
            && (orientationRaw === "columns" || orientationRaw === "line" || orientationRaw === "table")
            && !points.some(p => p.rowType != null) && !listPnl;

        // font preset: one switch scaling every text in the visual (Full HD = ×1.5)
        // preset factor × free scale factor (labels card, 50–300 %): the preset
        // picks the ballpark, the factor fine-tunes every label at once
        this.fontK = ({ compact: 1, fullhd: 1.5, presentation: 2 }[
            String(s.labelsCard.fontPreset.value.value)] ?? 1)
            * Math.max(0.5, Math.min(3, Number(s.labelsCard.fontScale.value ?? 100) / 100));
        this.animGroups = [];

        // compare-on-click: only meaningful where per-category value bars exist
        this.compareActive = s.chartCard.compareClick.value && !isStacked
            && (orientationRaw === "columns" || orientationRaw === "bars");
        this.compareAnchors.clear();
        if (!this.compareActive) { this.compareCats = []; }

        // comment capture mode: clicks open the editor instead of cross-filtering
        this.commentEdit = s.commentsCard.editComments.value
            && this.host.hostCapabilities?.allowInteractions !== false;
        this.closeCommentEditor();
        // structure-edit mode (table only): row clicks open the one-click-P&L menu
        this.structureEdit = s.chartCard.structureEdit.value
            && orientationRaw === "table" && this.allowInteractions
            && !this.commentEdit;
        if (!this.structureEdit) { this.closeStructureMenu(); }

        // small multiples: group by the multiples role, in order of appearance
        const groups: { name: string | null; pts: DataPoint[] }[] = [];
        for (const p of points) {
            const last = groups.length > 0 ? groups[groups.length - 1] : null;
            const found = last && last.name === p.group ? last : groups.find(g => g.name === p.group);
            if (found) { found.pts.push(p); } else { groups.push({ name: p.group, pts: [p] }); }
        }

        // multiples options: Top-N tiles (remainder merged into one "Rest" tile) and a
        // leading "Σ Gesamt" tile — applied before the per-group transforms and domain
        // computation so all tiles, including the larger total, share one IBCS scale
        if (groups.length > 1 && groups[0].name != null) {
            const mTopN = Math.round(s.chartCard.multiplesTopN.value ?? 0);
            const allGroups = groups.slice();
            if (mTopN > 0 && groups.length > mTopN + 1) {
                const size = (g: { pts: DataPoint[] }) =>
                    g.pts.reduce((a, p) => a + Math.abs(p.value ?? 0), 0);
                const ranked = groups.slice().sort((a, b) => size(b) - size(a));
                const rest = ranked.slice(mTopN);
                groups.length = 0;
                groups.push(...ranked.slice(0, mTopN),
                    this.aggregateGroups(rest.map(g => g.pts), `${this.locStr("Label_Rest", "Other")} (${rest.length})`));
            }
            if (s.chartCard.multiplesTotal.value) {
                groups.unshift(this.aggregateGroups(allGroups.map(g => g.pts), this.locStr("Label_Total", "Σ Total")));
            }
        }

        // compare-on-click anchors per category label — ambiguous across multiples
        // tiles (same categories in every tile), so the mode is off in a grid
        if (this.compareActive && groups.length > 1) {
            this.compareActive = false;
            this.compareCats = [];
        }

        // top N + rest aggregation (structure comparisons only), per group —
        // never combined with cumulation: topN re-sorts by value, cumulate needs
        // the chronological order, the combination would sum a scrambled sequence
        const topN = Math.round(s.chartCard.topN.value ?? 0);
        if (orientation === "bars" && topN > 0 && !cumulativeOn) {
            for (const g of groups) {
                if (g.pts.length > topN + 1) { g.pts = this.applyTopN(g.pts, topN); }
            }
        }
        // cumulative (YTD) view: running totals per group, variances recomputed
        if (cumulativeOn) {
            const basisMode = this.resolveBasisLabel();
            const kind = String(s.chartCard.cumulativeKind.value.value) as "ytd" | "qtd" | "r12";
            const fiscal = Math.min(12, Math.max(1, Math.round(s.chartCard.fiscalStart.value ?? 1)));
            for (const g of groups) { g.pts = this.cumulate(g.pts, basisMode, kind, fiscal); }
        }
        // waterfall-bridge: order categories by impact, largest driver first (Rest row stays last)
        if (sortByImpactOn) {
            for (const g of groups) { g.pts = this.sortByImpact(g.pts); }
        }
        points = groups.reduce<DataPoint[]>((acc, g) => acc.concat(g.pts), []);

        const maxAbs = Math.max(...points.map(p =>
            Math.max(Math.abs(p.value ?? 0), Math.abs(p.py ?? 0), Math.abs(p.pl ?? 0))), 0);
        const maxVarAbs = Math.max(...points.map(p => Math.abs(p.varAbs ?? 0)), 0);
        const allInt = points.every(p =>
            [p.value, p.py, p.pl, p.fc].every(v => v == null || Number.isInteger(v)));
        const allVarInt = points.every(p => p.varAbs == null || Number.isInteger(p.varAbs));

        const basisMode: Basis = this.resolveBasisLabel();
        const hasVar = points.some(p => p.varAbs != null);

        const palette = this.host.colorPalette as powerbi.extensibility.ISandboxExtendedColorPalette;
        const hc: boolean = !!(palette && palette.isHighContrast);
        const fg: string = hc ? palette.foreground.value : INK;
        const bgc: string = hc ? palette.background.value : "#FFFFFF";

        // report theme colors: sentiment + neutral tones from the palette,
        // falling back to the color pickers when the theme doesn't define them
        const useTheme = s.colorsCard.useTheme.value && !hc && !!palette;
        const themed = (info: { value: string } | undefined, fallback: string) =>
            useTheme && info && info.value ? info.value : fallback;

        const cfg: ChartConfig = {
            orientation,
            showLabels: s.labelsCard.show.value,
            labelFont: Math.round(s.labelsCard.fontSize.value * this.fontK),
            catFont: Math.round(s.categoryAxisCard.fontSize.value * this.fontK),
            invert: s.chartCard.invert.value,
            isGood: (() => {
                const inv = s.chartCard.invert.value;
                const invSet = new Set(String(s.chartCard.invertList.value || "")
                    .split(",").map(x => x.trim().toLowerCase()).filter(x => x));
                return (v: number, pp?: DataPoint | null) =>
                    (inv !== (pp != null && invSet.has(pp.cat.toLowerCase()))) ? v < 0 : v > 0;
            })(),
            colors: hc ? { ac: fg, py: fg, pl: fg, good: fg, bad: fg } : {
                ac: themed(palette?.foregroundNeutralDark, s.colorsCard.actualColor.value.value),
                py: themed(palette?.foregroundNeutralTertiary, s.colorsCard.previousYearColor.value.value),
                pl: themed(palette?.foregroundNeutralDark, s.colorsCard.planColor.value.value),
                good: themed(palette?.positive, s.colorsCard.goodColor.value.value),
                bad: themed(palette?.negative, s.colorsCard.badColor.value.value)
            },
            hc,
            ink: fg,
            paper: bgc,
            subtle: hc ? fg : "#8A8A8A",
            highlight: new Set(String(s.chartCard.highlight.value || "")
                .split(",").map(x => x.trim().toLowerCase()).filter(x => x)),
            capMax: (s.scaleCard.capOverflow.value && (s.scaleCard.fixedMax.value ?? 0) > 0)
                ? s.scaleCard.fixedMax.value : null,
            cumulative: cumulativeOn,
            refLine: this.parseRefLine(),
            refLineLabel: (s.scaleCard.refLineLabel.value || "").trim(),
            lineMode,
            movingAvg: Math.round(s.chartCard.movingAverage.value ?? 0),
            hasLine: orientationRaw === "columns" && !isStacked && points.some(p => p.lineVal != null),
            lineName: this.lineName ?? "Linie",
            fmtLine: this.makeFormatter(
                Math.max(...points.map(p => Math.abs(p.lineVal ?? 0)), 0),
                points.every(p => p.lineVal == null || Number.isInteger(p.lineVal)),
                this.lineFormat),
            waterfallStyle: wfStyleGlobal,
            sortByImpact: sortByImpactOn,
            basisMode,
            basisLabel: basisMode === "plan" ? "PL" : basisMode === "fcrev" ? "FC Vm" : "PY",
            showAbs: s.chartCard.showAbsoluteVariance.value && hasVar,
            showRel: s.chartCard.showRelativeVariance.value && points.some(p => p.varRel != null),
            showDual: s.chartCard.dualVariance.value && points.some(p => p.var2Abs != null),
            basis2Label: this.basis2Mode === "plan" ? "PL" : "PY",
            showTotal: s.chartCard.showTotal.value,
            patId: `icd-hatch-${this.instanceId}`,
            patGood: `icd-hatch-good-${this.instanceId}`,
            patBad: `icd-hatch-bad-${this.instanceId}`,
            patPrelim: `icd-prelim-${this.instanceId}`,
            valueCols: String(s.chartCard.valueColumns.value.value),
            resultSet: new Set(String(s.chartCard.resultList.value || "")
                .split(",").map(x => x.trim().toLowerCase()).filter(x => x)),
            skipSet: new Set(String(s.chartCard.skipList.value || "")
                .split(",").map(x => x.trim().toLowerCase()).filter(x => x)),
            hideSet: new Set(String(s.chartCard.hideList.value || "")
                .split(",").map(x => x.trim().toLowerCase()).filter(x => x)),
            chartSet: new Set(String(s.chartCard.chartList.value || "")
                .split(",").map(x => x.trim().toLowerCase()).filter(x => x)),
            indentSet: new Set(String(s.chartCard.indentList.value || "")
                .split(",").map(x => x.trim().toLowerCase()).filter(x => x)),
            rowFmt: this.parseRowFormats(String(s.chartCard.rowFormats.value || "")),
            matrixCompare: String(s.chartCard.matrixCompare.value.value),
            formulaRows: String(s.chartCard.formulaRows.value || ""),
            cardBasis: String(s.chartCard.cardStatusBasis.value.value),
            cardTint: s.chartCard.cardTint.value,
            cardTintPct: Math.max(4, Math.min(40, Number(s.chartCard.cardTintStrength.value ?? 12))),
            cardBullet: s.chartCard.cardBullet.value,
            cardBulletZoom: s.chartCard.cardBulletZoom.value,
            cardHl: String(s.chartCard.cardHighlight.value.value),
            cardBars: s.chartCard.cardBars.value,
            // the in-chart chip override wins over the pane dropdown when set
            cardSort: this.cardSortSel !== "" ? this.cardSortSel
                : String(s.chartCard.cardSort.value.value),
            sumSafe: s.labelsCard.sumSafeRounding.value,
            ...(() => { const fp = this.formatterParams(maxAbs, allInt); return { fmtUnit: fp.unit, fmtPrec: fp.prec }; })(),
            fmt: this.makeFormatter(maxAbs, allInt),
            fmtVar: this.makeFormatter(maxVarAbs, allVarInt),
            hasPy: points.some(p => p.py != null),
            hasPl: points.some(p => p.pl != null),
            hasFc: points.some(p => p.isFc),
            hasBm: points.some(p => p.bm != null),
            bmInChart: (orientationRaw === "columns" || orientationRaw === "bars"
                || orientationRaw === "line" || isTable) && points.some(p => p.bm != null),
            // triangle notation only when three scenarios actually appear together —
            // AC+PY+PL generally; in the integrated bridge AC+FC+PY also qualifies
            pyTriangle: s.chartCard.pyTriangle.value
                && points.some(p => p.py != null)
                && (points.some(p => p.pl != null)
                    || (orientationRaw === "intwaterfall" && points.some(p => p.isFc))),
            sharedScale: groups.length > 1,
            mainDomain: [0, 0],
            varDomain: [0, 0],
            isMaterial: (() => {
                const mAbs = s.chartCard.materialityAbs.value ?? 0;
                const mPct = s.chartCard.materialityPct.value ?? 0;
                if (mAbs <= 0 && mPct <= 0) { return () => true; }
                // material = every configured threshold exceeded (AND) — filters both
                // small absolute noise and small percentage noise
                return (p: DataPoint | null | undefined, vAbs?: number | null, vRel?: number | null) => {
                    if (!p) { return true; }
                    const a = vAbs !== undefined ? vAbs : p.varAbs;
                    const r = vRel !== undefined ? vRel : p.varRel;
                    if (a == null && r == null) { return true; }
                    if (mAbs > 0 && a != null && Math.abs(a) < mAbs) { return false; }
                    if (mPct > 0 && r != null && Math.abs(r) < mPct) { return false; }
                    return true;
                };
            })()
        };

        // hatch patterns for forecast (base chart + good/bad variance colors)
        const defs = this.el("defs", {}, this.svg);
        const makeHatch = (id: string, stroke: string) => {
            const pat = this.el("pattern", {
                id, patternUnits: "userSpaceOnUse", width: 5, height: 5,
                patternTransform: "rotate(45)"
            }, defs);
            this.el("rect", { width: 5, height: 5, fill: cfg.paper }, pat);
            this.el("line", { x1: 0, y1: 0, x2: 0, y2: 5, stroke, "stroke-width": 2.5 }, pat);
        };
        makeHatch(cfg.patId, cfg.colors.ac);
        makeHatch(cfg.patGood, cfg.colors.good);
        makeHatch(cfg.patBad, cfg.colors.bad);
        // preliminary actuals: thin paper-colored lines OVER the solid fill —
        // reads as "almost final", clearly lighter than the dense FC hatch
        const patP = this.el("pattern", {
            id: cfg.patPrelim, patternUnits: "userSpaceOnUse", width: 7, height: 7,
            patternTransform: "rotate(45)"
        }, defs);
        this.el("line", { x1: 0, y1: 0, x2: 0, y2: 7, stroke: cfg.paper, "stroke-width": 1.6 }, patP);

        // shared value domains across all multiples (IBCS: identical scales)
        // skip rows are excluded from totals AND scales — keep them out of the
        // deck-wide domains too, or the table's domain merge re-imports them
        const domPts = isTable && cfg.skipSet.size > 0
            ? points.filter(p => !cfg.skipSet.has(p.cat.trim().toLowerCase()))
            : points;
        const domains: Domains = {
            main: extent(domPts.flatMap(p => [p.value, p.py, p.pl, p.fc, p.bm])),
            abs: extent(domPts.map(p => p.varAbs)),
            rel: extent(domPts.map(p => p.varRel)),
            abs2: extent(domPts.map(p => p.var2Abs)),
            rel2: extent(domPts.map(p => p.var2Rel)),
            bridge: [0, 0]
        };

        // scale sync: stretch domains at least to the configured maxima;
        // with capping enabled the maximum is hard instead
        const fixedMax = s.scaleCard.fixedMax.value ?? 0;
        if (fixedMax > 0) {
            domains.main = cfg.capMax != null
                ? [domains.main[0], fixedMax]
                : [domains.main[0], Math.max(domains.main[1], fixedMax)];
        }
        const fixedVarMax = s.scaleCard.fixedVarMax.value ?? 0;
        if (fixedVarMax > 0) {
            domains.abs = [
                Math.min(domains.abs[0], -fixedVarMax),
                Math.max(domains.abs[1], fixedVarMax)
            ];
        }

        // waterfall: precompute segments per group, shared domain over all cells
        const wfByGroup = new Map<string | null, WfSeg[]>();
        this.sharedWfDomain = null;
        if (isWaterfall) {
            for (const g of groups) { wfByGroup.set(g.name, this.buildWaterfall(g.pts, cfg)); }
            const allSegs: WfSeg[] = [];
            wfByGroup.forEach(segs => allSegs.push(...segs));
            domains.main = extent(allSegs.flatMap(sg => [sg.from, sg.to]));
            this.sharedWfDomain = domains.main;
        }
        // waterfall-bridge (columns/bars add-on): running cascade per group, own shared
        // domain — a separate "bridge" panel alongside the normal AC/PY/PL comparison bars,
        // not a replacement for them. extentTight (no zero anchor) because the cascade
        // floats at a running level with no "from zero" anchor bar to justify one.
        const cascadeByGroup = new Map<string | null, Cascade>();
        if (wfStyleGlobal) {
            for (const g of groups) { cascadeByGroup.set(g.name, this.buildCascade(g.pts)); }
            const allVals: (number | null)[] = [];
            cascadeByGroup.forEach(c => { allVals.push(...c.from, ...c.to); });
            domains.bridge = extentTight(allVals);
        }
        if (cfg.refLine != null) {
            domains.main = [Math.min(domains.main[0], cfg.refLine), Math.max(domains.main[1], cfg.refLine)];
            if (this.sharedWfDomain) { this.sharedWfDomain = domains.main; }
        }

        // IBCS same-scale rule also for the self-scaling renderers (pareto/dumbbell/slope)
        cfg.mainDomain = domains.main;
        cfg.varDomain = domains.abs;

        const renderCell = (grp: { name: string | null; pts: DataPoint[] }, region: Rect) => {
            if (isWaterfall) {
                this.renderWaterfall(wfByGroup.get(grp.name) || [], region, cfg,
                    { abs: domains.abs, rel: domains.rel });
                return;
            }
            if (isIntWf) {
                this.renderIntegratedWaterfall(grp.pts, region, cfg);
                return;
            }
            if (isCatBridge) {
                this.renderCategoryBridge(grp.pts, region, cfg);
                return;
            }
            if (isTable) {
                this.renderTable(grp.pts, region, cfg);
                return;
            }
            if (isPnl) {
                this.renderPnlStatement(grp.pts, region, cfg);
                return;
            }
            if (isCards) {
                this.renderCards(grp.pts, region, cfg);
                return;
            }
            if (isPareto) {
                this.renderPareto(grp.pts, region, cfg);
                return;
            }
            if (isDumbbell) {
                this.renderDumbbell(grp.pts, region, cfg);
                return;
            }
            if (isSlope) {
                this.renderSlope(grp.pts, region, cfg);
                return;
            }
            if (isStacked) {
                this.renderStacked(grp.pts, region, cfg);
                return;
            }
            this.renderChart(grp.pts, region, cfg, domains, cascadeByGroup.get(grp.name) ?? null);
        };
        // in-chart chrome only where the host allows interactions — exports to
        // PDF/PowerPoint and subscription mails get a clean chart without buttons
        if (this.allowInteractions) {
            // sort button (once, top-right of the whole visual) — the only literal "button":
            // toggles the format-pane property so the choice persists and stays bookmarkable
            if (wfStyleGlobal) {
                this.drawSortButton(width, cfg);
            }
            // in-chart toolbar for the bridge modes: ΔPY/ΔPL reference switch (persisted, so
            // the end user can re-base the variances in the report), sort toggle + ▶ build
            if ((isIntWf || isCatBridge) && s.chartCard.chartButtons.value) {
                this.drawChartButtons(width, cfg, {
                    showRef: cfg.hasPy && cfg.hasPl,
                    showSort: isCatBridge,
                    showPlay: true
                });
            }
            // GuV-Statement toolbar: scenario view (only scenarios that exist) + levels
            if (isPnl && s.chartCard.chartButtons.value) {
                this.drawPnlButtons(width, cfg, points);
            }
            // active-mode chip: comment capture, structure edit and compare-on-click
            // silently repurpose clicks — show a pill so nobody wonders why
            // crossfiltering stopped working
            if (this.commentEdit || this.compareActive || this.structureEdit) {
                const toolbarReserve = ((isIntWf || isCatBridge) && s.chartCard.chartButtons.value)
                    ? Math.round(170 * this.fontK) : 0;
                const sortReserve = wfStyleGlobal ? 26 : 0;
                const ytdReserve = (s.chartCard.cumulativeButton.value && !isStacked
                    && (orientationRaw === "columns" || orientationRaw === "line"))
                    ? Math.round(44 * this.fontK) : 0;
                const text = this.commentEdit
                    ? this.locStr("Chip_CommentMode", "✎ Comment mode")
                    : this.structureEdit
                        ? this.locStr("Chip_StructureMode", "⚙ Structure mode")
                        : `${this.locStr("Chip_Compare", "⇄ Compare")} (${this.compareCats.length}/2)`;
                this.drawModeChip(width - 6 - toolbarReserve - sortReserve - ytdReserve, text, cfg);
            }

            // YTD chip (opt-in): the end user flips the cumulative view on the report
            // canvas; persisted like the other in-chart buttons
            if (s.chartCard.cumulativeButton.value && !isStacked
                && (orientationRaw === "columns" || orientationRaw === "line")) {
                this.drawCumButton(width - (wfStyleGlobal ? 30 : 6), cfg);
            }
        }
        // IBCS title block on top of everything (incl. multiples grid)
        const topOffset = s.ibcsTitleCard.show.value
            ? this.drawTitleBlock(width, points, cfg, maxAbs, orientation)
            : 0;
        const footerText = (s.ibcsTitleCard.footer.value || "").trim();
        // optional second footer line: the applied-filter context. Report/page
        // filters are not exposed to custom visuals, so the author binds a text
        // measure (Filter-Info role); the visual appends its OWN view state
        const filterParts: string[] = [];
        if (s.ibcsTitleCard.filterFooter.value) {
            if (this.filterInfo) { filterParts.push(this.filterInfo); }
            if (cfg.cumulative) { filterParts.push("YTD"); }
            const topNSet = Math.round(s.chartCard.topN.value ?? 0);
            if (topNSet > 0 && orientationRaw === "bars" && !cfg.cumulative) {
                filterParts.push(`Top ${topNSet}`);
            }
            if (this.tableSort && isTable && !cfg.cumulative) {
                const [sk, sd] = this.tableSort.split("_");
                const lbl = sk === "ac" ? "AC" : sk === "dabs" ? `Δ${cfg.basisLabel}`
                    : sk === "drel" ? `Δ${cfg.basisLabel} %` : `Δ${cfg.basis2Label}`;
                filterParts.push(`⇅ ${lbl} ${sd === "asc" ? "▲" : "▼"}`);
            }
            if (isTable && cfg.skipSet.size > 0) {
                filterParts.push(`Σ − ${cfg.skipSet.size}`);
            }
            if (this.compareActive && this.compareCats.length === 2) {
                filterParts.push(this.compareCats.join(" vs "));
            }
        }
        const filterText = filterParts.join(" · ");
        const lineF = Math.round(11 * this.fontK) + 2;
        const footerH = (footerText || filterText ? Math.round(11 * this.fontK) + 6 : 0)
            + (footerText && filterText ? lineF : 0);
        const availH = height - topOffset - footerH;
        const ff = Math.round(9.5 * this.fontK);
        let fy = height - 5;
        if (footerText) {
            const ft = this.el("text", {
                x: 6, y: fy, "font-size": ff, fill: cfg.subtle, "font-family": FONT
            }, this.svg);
            ft.textContent = this.truncate(footerText, width - 12, ff);
            fy -= lineF;
        }
        if (filterText) {
            const ft2 = this.el("text", {
                x: 6, y: fy, "font-size": ff, fill: cfg.subtle, "font-family": FONT
            }, this.svg);
            ft2.textContent = this.truncate(
                `${this.locStr("Foot_Filter", "Filter")}: ${filterText}`, width - 12, ff);
        }

        // comment panel: numbered footnote list to the right of the chart
        const commentPts = points.filter(p => p.commentNo != null);
        let chartW = width;
        if (this.formattingSettings.commentsCard.showPanel.value
            && commentPts.length > 0 && groups.length <= 1 && width >= 480) {
            const panelW = Math.min(260, Math.round(width * 0.28));
            chartW = width - panelW;
            this.drawCommentPanel({ x: chartW, y: topOffset, w: panelW, h: availH }, commentPts, cfg);
        }

        if (groups.length <= 1) {
            renderCell(groups[0] ?? { name: null, pts: points },
                { x: 0, y: topOffset, w: chartW, h: availH });
            return;
        }

        // small multiples zoom: ⤢ on a tile shows just that group full-size (same
        // shared scales — IBCS), the ← chip goes back to the grid. Transient state.
        if (this.zoomGroup != null) {
            const grp = groups.find(g => (g.name ?? "") === this.zoomGroup);
            if (grp) {
                // chart first, chip after — the click target must stay on top of the marks
                const chipH = Math.round(11 * this.fontK) + 17;
                renderCell(grp, { x: 0, y: topOffset + chipH, w: chartW, h: availH - chipH });
                this.drawZoomBackChip(topOffset, grp.name ?? "", cfg);
                return;
            }
            this.zoomGroup = null;
        }

        // grid layout for small multiples: keep cells at a usable width
        const MAX_CELLS = 24;
        const shown = groups.slice(0, MAX_CELLS);
        const n = shown.length;
        const groupTitleH = Math.round(16 * this.fontK);

        // hero layout (IBCS CT 13): the first tile — Σ Gesamt or the largest group —
        // gets a full-height cell on the left, the rest form a grid beside it; the
        // shared scale is untouched, only the allotted space differs
        const heroOn = s.chartCard.multiplesHero.value && n >= 2 && width >= 460;
        const heroW = heroOn ? Math.round(Math.min(Math.max(width * 0.42, 250), width * 0.55)) : 0;
        const gridX = heroW;
        const gridW = width - heroW;
        const rest = heroOn ? shown.slice(1) : shown;
        const rn = rest.length;
        let cols = Math.ceil(Math.sqrt(rn));
        cols = Math.max(1, Math.min(cols, Math.floor(gridW / 220) || 1));
        const rows = Math.ceil(rn / cols);
        const cellW = gridW / cols;
        const cellH = availH / rows;

        if (heroOn) {
            renderCell(shown[0],
                { x: 2, y: topOffset + groupTitleH, w: heroW - 6, h: availH - groupTitleH - 2 });
            this.drawTileHeader(0, topOffset, heroW, groupTitleH,
                shown[0].name ?? "", shown[0].name ?? "", cfg);
        }
        for (let gi = 0; gi < rn; gi++) {
            const cx = gridX + (gi % cols) * cellW;
            const cy = topOffset + Math.floor(gi / cols) * cellH;
            let title = rest[gi].name ?? "";
            if (gi === rn - 1 && groups.length > n) {
                title += `  (+${groups.length - n} weitere)`;
            }
            // cell content first, header strip after — the click target must sit ON TOP
            // of any chart marks (labels can reach into the strip), or clicks get eaten
            renderCell(rest[gi],
                { x: cx + 2, y: cy + groupTitleH, w: cellW - 4, h: cellH - groupTitleH - 2 });
            this.drawTileHeader(cx, cy, cellW, groupTitleH, title, rest[gi].name ?? "", cfg);
        }
    }

    /**
     * small-multiples tile header: the WHOLE title strip is the zoom-in click target
     * (a 12px glyph alone is too easy to miss), with the ⤢ affordance at the right.
     */
    private drawTileHeader(x: number, y: number, w: number, h: number,
        title: string, groupName: string, cfg: ChartConfig): void {
        const k = this.fontK;
        const gtFont = Math.round(11 * k);
        const btn = this.el("g", { tabindex: "0", role: "button" }, this.svg) as SVGGElement;
        btn.setAttribute("aria-label", `${groupName} ${this.locStr("Btn_Zoom", "enlarge (click the title row)")}`);
        const zoomTip = this.el("title", {}, btn);
        zoomTip.textContent = `${groupName} ${this.locStr("Btn_Zoom", "enlarge (click the title row)")}`;
        (btn.style as CSSStyleDeclaration & { pointerEvents: string }).pointerEvents = "all";
        // hit area across the full strip (nearly invisible, but clickable everywhere)
        this.el("rect", {
            x: x + 1, y: y + 1, width: Math.max(w - 2, 1), height: h + 2,
            fill: cfg.paper, "fill-opacity": 0.01
        }, btn);
        const t = this.el("text", {
            x: x + 6, y: y + gtFont + 1, "font-size": gtFont, fill: cfg.ink,
            "font-family": FONT, "font-weight": 600
        }, btn);
        t.textContent = this.truncate(title, w - 16 - 14 * k, gtFont);
        const icon = this.el("text", {
            x: x + w - 6, y: y + gtFont + 1, "text-anchor": "end",
            "font-size": Math.round(12 * k), fill: cfg.subtle, "font-family": FONT
        }, btn);
        icon.textContent = "⤢";
        btn.style.cursor = "pointer";
        btn.addEventListener("mouseenter", () => { icon.setAttribute("fill", cfg.ink); });
        btn.addEventListener("mouseleave", () => { icon.setAttribute("fill", cfg.subtle); });
        const zoom = () => { this.zoomGroup = groupName; this.rerender(); };
        btn.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); zoom(); });
        btn.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key !== "Enter" && e.key !== " ") { return; }
            e.preventDefault(); e.stopPropagation(); zoom();
        });
    }

    /** back chip when a small-multiples tile is zoomed in; returns consumed height */
    private drawZoomBackChip(top: number, groupName: string, cfg: ChartConfig): number {
        const k = this.fontK;
        const font = Math.round(11 * k);
        const text = "← Alle Gruppen";
        const w = text.length * font * 0.56 + 18;
        const h = font + 9;
        const btn = this.el("g", { tabindex: "0", role: "button" }, this.svg) as SVGGElement;
        btn.setAttribute("aria-label", "Zurück zur Kachel-Übersicht");
        this.el("rect", {
            x: 6, y: top + 3, width: w, height: h, rx: h / 2,
            fill: cfg.paper, stroke: cfg.hc ? cfg.ink : cfg.subtle, "stroke-width": 1
        }, btn);
        const t = this.el("text", {
            x: 6 + w / 2, y: top + 3 + h / 2 + font * 0.36, "text-anchor": "middle",
            "font-size": font, fill: cfg.ink, "font-family": FONT
        }, btn);
        t.textContent = text;
        btn.style.cursor = "pointer";
        const back = () => { this.zoomGroup = null; this.rerender(); };
        btn.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); back(); });
        btn.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key !== "Enter" && e.key !== " ") { return; }
            e.preventDefault(); e.stopPropagation(); back();
        });
        const gl = this.el("text", {
            x: 6 + w + 10, y: top + 3 + h / 2 + font * 0.36, "font-size": font,
            fill: cfg.ink, "font-family": FONT, "font-weight": 600
        }, this.svg);
        gl.textContent = groupName;
        return h + 8;
    }

    /**
     * builds waterfall segments from the points. Three modes:
     * - rowType present: P&L waterfall — 'sum' rows are absolute anchors, others cumulate
     * - comparison basis present: variance bridge basis → AC (deltas are ΔPY/ΔPL)
     * - otherwise: contribution waterfall of the base values ending in a Σ anchor
     */
    private buildWaterfall(pts: DataPoint[], cfg: ChartConfig): WfSeg[] {
        const segs: WfSeg[] = [];
        const good = (v: number, pp?: DataPoint | null) => cfg.isGood(v, pp);
        // one-click P&L lists work here too: result rows anchor, skip rows drop out
        const isResult = (p: DataPoint) => cfg.resultSet.has(p.cat.trim().toLowerCase());
        const isSkip = (p: DataPoint) => cfg.skipSet.has(p.cat.trim().toLowerCase());
        if (pts.some(p => p.rowType != null) || pts.some(p => isResult(p))) {
            let cum = 0;
            for (const p of pts) {
                if (p.value == null) { continue; }
                if (isSkip(p)) { continue; }
                if (p.rowType != null && p.rowType.startsWith("pct")) { continue; }
                if ((p.rowType != null && p.rowType.startsWith("sum")) || isResult(p)) {
                    segs.push({ label: p.cat, from: 0, to: p.value, kind: "anchor", hatched: p.isFc, p });
                    cum = p.value;
                } else {
                    segs.push({ label: p.cat, from: cum, to: cum + p.value, kind: "delta", good: good(p.value, p), hatched: p.isFc, p });
                    cum += p.value;
                }
            }
        } else if (pts.some(p => p.varAbs != null)) {
            const basisSum = pts.reduce((a, p) => a + (p.basis ?? 0), 0);
            const valueSum = pts.reduce((a, p) => a + (p.value ?? 0), 0);
            segs.push({ label: cfg.basisLabel, from: 0, to: basisSum, kind: "anchor", outlined: true });
            let cum = basisSum;
            for (const p of pts) {
                if (p.varAbs == null) { continue; }
                segs.push({ label: p.cat, from: cum, to: cum + p.varAbs, kind: "delta", good: good(p.varAbs, p), hatched: p.isFc, p });
                cum += p.varAbs;
            }
            segs.push({ label: cfg.hasFc ? "AC/FC" : "AC", from: 0, to: valueSum, kind: "anchor", hatched: cfg.hasFc });
        } else {
            let cum = 0;
            for (const p of pts) {
                if (p.value == null) { continue; }
                segs.push({ label: p.cat, from: cum, to: cum + p.value, kind: "delta", good: good(p.value, p), hatched: p.isFc, p });
                cum += p.value;
            }
            segs.push({ label: "Σ", from: 0, to: cum, kind: "anchor" });
        }
        return segs;
    }

    /** renders a waterfall / bridge into the region (vertical bars, shared domain via cfg call site) */
    private renderWaterfall(segs: WfSeg[], region: Rect, cfg: ChartConfig,
        varDomains?: { abs: [number, number]; rel: [number, number] }): void {
        if (segs.length === 0) { return; }
        const pad = 4;
        const k = this.fontK;
        const titleH = Math.round(14 * k);
        const catArea = cfg.catFont + 10;
        const bandStart = region.x + pad + 2;
        const bandEnd = region.x + region.w - pad;
        const outer: Rect = {
            x: region.x, y: region.y + pad,
            w: region.w, h: region.h - pad - catArea
        };

        // variance tiers above the waterfall (IBCS CT 12): ΔBasis bars and ΔBasis %
        // pins per calculation line. In the variance-bridge mode the waterfall bars
        // ARE the absolute deltas, so only the relative tier is added there.
        const good = (v: number, pp?: DataPoint | null) => cfg.isGood(v, pp);
        const isVarBridge = segs.some(sg => sg.outlined);
        const tierPts = segs.map(sg => (sg.p && sg.p.varAbs != null) ? sg.p : null);
        const compactH = outer.h < 170 * k;
        const wantRel = cfg.showRel && !compactH && tierPts.some(p => p?.varRel != null);
        const wantAbs = cfg.showAbs && !compactH && !isVarBridge && tierPts.some(p => p != null);
        let rect = outer;
        let relRect: Rect | null = null, absRect: Rect | null = null;
        if (wantRel || wantAbs) {
            let yCur = outer.y;
            if (wantRel) {
                relRect = { x: outer.x, y: yCur, w: outer.w, h: Math.round(outer.h * 0.20) };
                yCur += relRect.h;
            }
            if (wantAbs) {
                absRect = { x: outer.x, y: yCur, w: outer.w, h: Math.round(outer.h * 0.24) };
                yCur += absRect.h;
            }
            rect = { x: outer.x, y: yCur, w: outer.w, h: outer.y + outer.h - yCur };
        }

        const domain = extent(segs.flatMap(sg => [sg.from, sg.to]));
        if (this.sharedWfDomain) {
            domain[0] = Math.min(domain[0], this.sharedWfDomain[0]);
            domain[1] = Math.max(domain[1], this.sharedWfDomain[1]);
        }
        const labelPad = cfg.showLabels ? cfg.labelFont + 6 : 6;
        const scale = this.makePanelScale(domain, rect, "columns", labelPad);
        const n = segs.length;
        const step = (bandEnd - bandStart) / n;
        const slotW = Math.max(2, step * 0.62);
        const pos = (i: number) => bandStart + i * step + (step - slotW) / 2;
        const showTierLabels = cfg.showLabels && step > cfg.labelFont * 1.4;

        // ΔBasis % pins tier
        if (relRect) {
            const tg = this.el("g", {}, this.svg);
            const relDomain: [number, number] = varDomains
                ? [...varDomains.rel] as [number, number]
                : extent(tierPts.map(p => p?.varRel ?? null));
            const relScale = this.makePanelScale(relDomain, relRect, "columns", labelPad, true);
            this.drawBaseline(tg, relRect, relScale, "columns", bandStart, bandEnd, cfg.basisMode, cfg.colors);
            this.drawPanelTitle(tg, relRect, `Δ${cfg.basisLabel} %`, "columns", titleH, region, undefined, cfg.subtle);
            const zero = relScale(0);
            for (let i = 0; i < n; i++) {
                const v = tierPts[i]?.varRel;
                if (v == null) { continue; }
                const c = pos(i) + slotW / 2;
                const col = (v === 0 || !cfg.isMaterial(tierPts[i]))
                    ? cfg.colors.py : (good(v, tierPts[i]) ? cfg.colors.good : cfg.colors.bad);
                const y = relScale(v);
                this.el("line", { x1: c, y1: zero, x2: c, y2: y, stroke: col, "stroke-width": Math.max(1.6, 1.4 * k) }, tg);
                this.el("circle", { cx: c, cy: y, r: Math.max(2.6, 2.2 * k), fill: col }, tg);
                if (showTierLabels) {
                    const headR = Math.max(2.6, 2.2 * k);
                    const flip = v > 0 && this.collidesPanelTitle(c, this.fmtPercent(v), cfg.labelFont,
                        relScale(v) - headR - cfg.labelFont, relRect.y, region.x, `Δ${cfg.basisLabel} %`);
                    this.drawEndLabelAt(tg, c, v, v >= 0 && !flip, relScale, "columns", this.fmtPercent(v),
                        cfg.labelFont, cfg.ink, Math.round(2 * k), cfg.paper);
                }
            }
        }
        // ΔBasis bars tier
        if (absRect) {
            const tg = this.el("g", {}, this.svg);
            const absDomain: [number, number] = varDomains
                ? [...varDomains.abs] as [number, number]
                : extent(tierPts.map(p => p?.varAbs ?? null));
            const absScale = this.makePanelScale(absDomain, absRect, "columns", labelPad, true);
            this.drawBaseline(tg, absRect, absScale, "columns", bandStart, bandEnd, cfg.basisMode, cfg.colors);
            this.drawPanelTitle(tg, absRect, `Δ${cfg.basisLabel}`, "columns", titleH, region, undefined, cfg.subtle);
            for (let i = 0; i < n; i++) {
                const p = tierPts[i];
                const v = p?.varAbs;
                if (p == null || v == null) { continue; }
                const mat = cfg.isMaterial(p);
                const col = (v === 0 || !mat) ? cfg.colors.py : (good(v, p) ? cfg.colors.good : cfg.colors.bad);
                const style = p.isFc && mat
                    ? { fill: `url(#${good(v, p) ? cfg.patGood : cfg.patBad})`, stroke: col, "stroke-width": 1 }
                    : { fill: col };
                this.drawBar(tg, pos(i), slotW, 0, v, absScale, "columns", style);
                if (showTierLabels) {
                    this.drawEndLabel(tg, pos(i) + slotW / 2, v, absScale, "columns",
                        this.fmtSigned(cfg.fmtVar, v), cfg.labelFont, cfg.ink, 0, cfg.paper);
                }
            }
        }

        const bg = this.el("g", {}, this.svg);
        this.drawBaseline(bg, rect, scale, "columns", bandStart, bandEnd, "ac", cfg.colors);
        if (cfg.refLine != null) {
            this.drawRefLine(bg, rect, scale, "columns", bandStart, bandEnd, cfg);
        }
        const title = segs[0].outlined ? `${cfg.basisLabel} → AC` : "AC";
        this.drawPanelTitle(bg, rect, title, "columns", titleH, region, undefined, cfg.subtle);

        const marks = this.el("g", {}, this.svg);
        for (let i = 0; i < n; i++) {
            const sg = segs[i];
            const g = this.el("g", { "class": "icd-cat" }, marks) as SVGGElement;
            let style: Record<string, string | number>;
            if (sg.kind === "anchor") {
                style = sg.outlined
                    ? { fill: cfg.paper, stroke: cfg.colors.pl, "stroke-width": 1.4 }
                    : sg.hatched
                        ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1 }
                        : { fill: cfg.colors.ac };
            } else {
                const delta = sg.to - sg.from;
                // in the variance bridge the delta bars ARE variances — materiality greys them
                const imm = isVarBridge && sg.p != null && !cfg.isMaterial(sg.p);
                const color = (delta === 0 || imm) ? cfg.colors.py : (sg.good ? cfg.colors.good : cfg.colors.bad);
                const hollowBad = cfg.hc && !sg.good && delta !== 0;
                style = hollowBad
                    ? { fill: cfg.paper, stroke: color, "stroke-width": 1.4 }
                    : sg.hatched && !imm
                        ? { fill: `url(#${sg.good ? cfg.patGood : cfg.patBad})`, stroke: color, "stroke-width": 1 }
                        : { fill: color };
            }
            this.drawBar(g, pos(i), slotW, sg.from, sg.to, scale, "columns", style);

            // connector to the next bar at the running level
            if (i < n - 1) {
                const y = scale(sg.to);
                this.el("line", {
                    x1: pos(i) + slotW, y1: y, x2: pos(i + 1), y2: y,
                    stroke: cfg.subtle, "stroke-width": 1
                }, bg);
            }

            if (cfg.showLabels && step > cfg.labelFont * 1.4) {
                const text = sg.kind === "anchor"
                    ? cfg.fmt.format(sg.to)
                    : this.fmtSigned(cfg.fmtVar, sg.to - sg.from);
                this.drawEndLabelAt(g, pos(i) + slotW / 2, sg.to, sg.to >= sg.from, scale,
                    "columns", text, cfg.labelFont, cfg.ink, 0, cfg.paper);
            }
            this.drawCategoryLabel(g, sg.label, pos(i) + slotW / 2, "columns", cfg.catFont,
                region, step, rect, cfg.ink);

            if (sg.p) {
                this.attachInteraction(g, sg.p, cfg);
                this.catGroups.push({ g, sel: sg.p.sel });
            }
        }
    }

    /** centered hint when a chart mode is missing its required reference measure */
    private drawModeHint(region: Rect, cfg: ChartConfig, msg: string): void {
        const t = this.el("text", {
            x: region.x + region.w / 2, y: region.y + region.h / 2, "text-anchor": "middle",
            "font-size": Math.round(11 * this.fontK), fill: cfg.subtle, "font-family": FONT
        }, this.svg);
        t.textContent = msg;
    }

    /**
     * Integrated bridge (time): PY/PL total column left, ΔBasis waterfall cascading
     * across the months, monthly AC·PY mini-columns at the bottom, ΔBasis% pin chart
     * on top and a stacked AC+FC total column right with a circled net callout —
     * ported from the "IBCS Chart Standalone" reference (integrierte GuV).
     */
    private renderIntegratedWaterfall(pts: DataPoint[], region: Rect, cfg: ChartConfig): void {
        const n = pts.length;
        if (n === 0) { return; }
        // the stacked totals and mini columns assume positive magnitudes — negative
        // series would render negative rect heights; fail loudly instead of wrongly
        if (pts.some(p => (p.value ?? 0) < 0 || (p.basis ?? 0) < 0)) {
            this.drawModeHint(region, cfg, this.locStr("Hint_IntWfNeg",
                "Integrated bridge does not support negative values — use waterfall or columns + bridge"));
            return;
        }
        if (!pts.some(p => p.varAbs != null)) {
            this.drawModeHint(region, cfg, this.locStr("Hint_IntWfBasis", "Integrated bridge requires PY or PL as comparison basis"));
            return;
        }
        const k = this.fontK;
        const lf = cfg.labelFont, cf = cfg.catFont;
        const pad = 6;

        // ------- totals
        const basisSum = pts.reduce((a, p) => a + (p.basis ?? 0), 0);
        const vTot = pts.reduce((a, p) => a + (p.value ?? 0), 0);
        const acTot = pts.filter(p => !p.isFc).reduce((a, p) => a + (p.value ?? 0), 0);
        const fcTot = vTot - acTot;
        const dTot = vTot - basisSum;
        const pctTot = basisSum !== 0 ? (dTot / Math.abs(basisSum)) * 100 : 0;
        const firstFc = pts.findIndex(p => p.isFc);
        const goodOf = (v: number, pp?: DataPoint | null) => cfg.isGood(v, pp);
        const colOf = (v: number, pp?: DataPoint) => (v === 0 || (pp != null && !cfg.isMaterial(pp)))
            ? cfg.colors.py : (goodOf(v, pp) ? cfg.colors.good : cfg.colors.bad);

        // ------- layout
        const catArea = cf * 2 + 10;
        const yBase = region.y + region.h - pad - catArea;
        const showPins = cfg.showRel && region.h >= 280 && pts.some(p => p.varRel != null);
        const pinArea = showPins ? Math.max(70, region.h * 0.24) : lf + 14;
        const plotTop = region.y + pad + pinArea;

        const left = region.x + pad;
        const right = region.x + region.w - pad;
        const calloutW = Math.max(54, Math.min(96, region.w * 0.085)) + lf * 1.6;
        const sideLblW = lf * 2.4;
        const totW = Math.max(26, Math.min(60, region.w * 0.055));
        // with both PY and PL bound, the left side shows two total columns
        // (like the category bridge's PY/PL total rows) — reserve the space
        const pySum = pts.reduce((a, p) => a + (p.py ?? 0), 0);
        const plSum = pts.reduce((a, p) => a + (p.pl ?? 0), 0);
        const twoTotals = pts.some(p => p.py != null) && pts.some(p => p.pl != null);
        const bandStart = left + totW + (twoTotals ? totW + 8 : 0) + 10;
        const bandEnd = right - calloutW - sideLblW - totW - 10;
        if (bandEnd - bandStart < n * 8) {
            this.drawModeHint(region, cfg, this.locStr("Hint_IntWfSpace", "Not enough space for the integrated bridge"));
            return;
        }
        const step = (bandEnd - bandStart) / n;
        const segW = Math.max(6, step * 0.8);
        const colW = Math.max(3, step * 0.5);
        const cx = (i: number) => bandStart + i * step + step / 2;
        const cxTot = bandEnd + 10 + totW / 2;

        const maxTot = Math.max(basisSum, vTot, twoTotals ? Math.max(pySum, plSum) : 0, 1);
        const S = linearScale(0, maxTot, yBase, plotTop + lf + 8);
        const maxMon = Math.max(...pts.map(p =>
            Math.max(p.value ?? 0, p.basis ?? 0, cfg.pyTriangle ? (p.py ?? 0) : 0)), 1);
        const miniH = Math.min((yBase - plotTop) * 0.30, region.h * 0.16);
        const BS = linearScale(0, maxMon, 0, miniH);

        const bg = this.el("g", {}, this.svg);
        const marks = this.el("g", {}, this.svg);
        const fmtD = (v: number) => this.fmtSigned(cfg.fmtVar, v);

        // ------- ΔBasis% pin chart (top)
        if (showPins) {
            const axisY = region.y + pad + pinArea * 0.55;
            const maxPct = Math.max(...pts.map(p => Math.abs(p.varRel ?? 0)), Math.abs(pctTot), 1);
            const pinMax = pinArea * 0.42 - lf;
            const PS = (v: number) => Math.max(2, Math.abs(v) / maxPct * Math.max(pinMax, 8));
            const tPin = this.el("text", {
                x: left, y: axisY + lf * 0.35, "font-size": Math.round(11 * k),
                fill: cfg.subtle, "font-family": FONT, "font-weight": 600
            }, bg);
            tPin.textContent = `Δ${cfg.basisLabel}%`;
            this.el("line", {
                x1: bandStart - 4, y1: axisY, x2: bandEnd + 4, y2: axisY,
                stroke: cfg.colors.py, "stroke-width": 2.4
            }, bg);
            this.el("line", {
                x1: cxTot - totW / 2 - 2, y1: axisY, x2: cxTot + totW / 2 + 2, y2: axisY,
                stroke: cfg.colors.py, "stroke-width": 2.4
            }, bg);
            // pin direction follows the sign, color follows the business impact (invert-aware)
            const pin = (x: number, pct: number, hollow: boolean, parent: SVGElement, pp?: DataPoint) => {
                const h = PS(pct);
                const yEnd = pct >= 0 ? axisY - h : axisY + h;
                this.el("line", { x1: x, y1: axisY, x2: x, y2: yEnd, stroke: colOf(pct, pp), "stroke-width": 2.2 }, parent);
                const r = Math.max(2.6, 3.4 * k);
                this.el("rect", {
                    x: x - r, y: yEnd - r, width: 2 * r, height: 2 * r,
                    fill: hollow ? `url(#${cfg.patId})` : cfg.ink,
                    stroke: cfg.ink, "stroke-width": hollow ? 1 : 0
                }, parent);
                const lt = this.el("text", {
                    x, y: pct >= 0 ? yEnd - r - 3 : yEnd + r + lf, "text-anchor": "middle",
                    "font-size": lf, fill: cfg.ink, "font-family": FONT,
                    stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
                }, parent);
                lt.textContent = this.fmtPercent(pct);
            };
            const showPinAt = this.labelPredicate(pts, pts.map(p => p.varRel != null ? this.fmtPercent(p.varRel) : ""), lf, step, "columns");
            pts.forEach((p, i) => {
                if (p.varRel == null || !showPinAt(i)) { return; }
                pin(cx(i), p.varRel, p.isFc, marks, p);
            });
            pin(cxTot, pctTot, true, bg);
        }

        // ------- AC | FC separator
        if (firstFc > 0) {
            this.el("line", {
                x1: cx(firstFc) - step / 2, y1: region.y + pad + 4, x2: cx(firstFc) - step / 2, y2: yBase + catArea * 0.55,
                stroke: cfg.ink, "stroke-width": 1.4
            }, bg);
        }

        // ------- total columns (left): the second scenario first (outermost),
        // then the basis column the cascade starts from — like the category
        // bridge's PY/PL total rows
        const yB = S(basisSum);
        const xBasisTot = twoTotals ? left + totW + 8 : left;
        const pyStyle = cfg.hc
            ? { fill: cfg.paper, stroke: cfg.colors.py, "stroke-width": 1.2, "stroke-dasharray": "3,2" }
            : { fill: cfg.colors.py };
        const plStyle = { fill: cfg.paper, stroke: cfg.colors.pl, "stroke-width": 1.4 };
        const drawTotal = (x: number, sum: number, style: object, label: string, bold: boolean) => {
            const yT = S(sum);
            this.el("rect", { x, y: yT, width: totW, height: Math.max(yBase - yT, 1), ...style }, bg);
            const vl = this.el("text", {
                x: x + totW / 2, y: yT - 5, "text-anchor": "middle", "font-size": lf,
                fill: cfg.ink, "font-family": FONT, ...(bold ? { "font-weight": 600 } : {})
            }, bg);
            vl.textContent = cfg.fmt.format(sum);
            const cl = this.el("text", {
                x: x + totW / 2, y: yBase + cf + 4, "text-anchor": "middle", "font-size": cf,
                fill: cfg.ink, "font-family": FONT
            }, bg);
            cl.textContent = label;
        };
        if (twoTotals) {
            const basisIsPl = cfg.basisMode === "plan";
            drawTotal(left, basisIsPl ? pySum : plSum,
                basisIsPl ? pyStyle : plStyle, basisIsPl ? "PY" : "PL", false);
        }
        drawTotal(xBasisTot, basisSum,
            cfg.basisMode === "plan" ? plStyle : pyStyle, cfg.basisLabel, false);

        // ------- level guide lines
        const yV = S(vTot);
        this.el("line", { x1: xBasisTot + totW, y1: yB, x2: cxTot + totW / 2, y2: yB, stroke: cfg.colors.py, "stroke-width": 1.4 }, bg);
        this.el("line", { x1: cx(n - 1) + segW / 2, y1: yV, x2: right - calloutW + 10, y2: yV, stroke: cfg.colors.py, "stroke-width": 1.4 }, bg);

        // ------- cascade + mini columns
        const showValAt = this.labelPredicate(pts, pts.map(p => p.varAbs != null ? fmtD(p.varAbs) : ""), lf, step, "columns");
        let level = basisSum;
        pts.forEach((p, i) => {
            const g = this.el("g", { "class": "icd-cat" }, marks) as SVGGElement;
            const x = cx(i);

            // connector at the incoming level
            const conX1 = i === 0 ? xBasisTot + totW : cx(i - 1) + segW / 2;
            this.el("line", {
                x1: conX1, y1: S(level), x2: x - segW / 2, y2: S(level),
                stroke: cfg.subtle, "stroke-width": 1
            }, g);

            if (p.varAbs != null) {
                const d = p.varAbs;
                const prev = level;
                level += d;
                const segTop = S(Math.max(prev, level));
                const segH = Math.max(4, Math.abs(S(prev) - S(level)));
                const c = colOf(d, p);
                const hollowBad = cfg.hc && !goodOf(d, p) && d !== 0;
                this.el("rect", {
                    x: x - segW / 2, y: segTop, width: segW, height: segH,
                    ...(hollowBad
                        ? { fill: cfg.paper, stroke: c, "stroke-width": 1.4 }
                        : p.isFc
                            ? { fill: `url(#${goodOf(d, p) ? cfg.patGood : cfg.patBad})`, stroke: c, "stroke-width": 1 }
                            : { fill: c })
                }, g);
                if (cfg.showLabels && showValAt(i)) {
                    const up = d >= 0;
                    const lt = this.el("text", {
                        x, y: up ? segTop - 4 : segTop + segH + lf, "text-anchor": "middle",
                        "font-size": lf, fill: cfg.ink, "font-family": FONT,
                        stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
                    }, g);
                    lt.textContent = fmtD(d);
                }
            }

            // mini columns at the base, offset IBCS pairs: basis behind (PY grey /
            // PL outlined), AC/FC in front; with three scenarios PY becomes the
            // triangle marker (as basis, or next to a PL basis)
            if (p.basis != null) {
                if (cfg.pyTriangle && cfg.basisMode === "py") {
                    const triScale: Scale = (v: number) => yBase - BS(v);
                    this.drawPyTriangle(g, x - colW * 0.2, colW * 1.4, p.basis, triScale, "columns", cfg);
                } else {
                    const h = BS(p.basis);
                    this.el("rect", {
                        x: x - colW * 0.8, y: yBase - h, width: colW, height: h,
                        ...(cfg.basisMode === "plan"
                            ? { fill: cfg.paper, stroke: cfg.colors.pl, "stroke-width": 1.2 }
                            : cfg.hc
                                ? { fill: cfg.paper, stroke: cfg.colors.py, "stroke-width": 1, "stroke-dasharray": "3,2" }
                                : { fill: cfg.colors.py })
                    }, g);
                }
            }
            if (cfg.pyTriangle && cfg.basisMode !== "py" && p.py != null) {
                const triScale: Scale = (v: number) => yBase - BS(v);
                this.drawPyTriangle(g, x - colW * 0.2, colW * 1.4, p.py, triScale, "columns", cfg);
            }
            if (p.value != null) {
                const h = BS(p.value);
                this.el("rect", {
                    x: x - colW * 0.2, y: yBase - h, width: colW, height: h,
                    ...(p.isFc
                        ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1 }
                        : { fill: cfg.colors.ac })
                }, g);
                if (cfg.showLabels && showValAt(i)) {
                    const hMax = Math.max(BS(p.value), p.basis != null ? BS(p.basis) : 0,
                        cfg.pyTriangle && p.py != null ? BS(p.py) + 4 : 0);
                    const vt = this.el("text", {
                        x: x + colW * 0.3 - colW * 0.5, y: yBase - hMax - 3, "text-anchor": "middle",
                        "font-size": lf, fill: cfg.ink, "font-family": FONT,
                        stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
                    }, g);
                    vt.textContent = cfg.fmt.format(p.value);
                }
            }

            // category labels (month + FC/first-year hint)
            const showCatAt = this.labelPredicate(pts, pts.map(q => q.cat), cf, step, "columns");
            if (showCatAt(i)) {
                const ct = this.el("text", {
                    x, y: yBase + cf + 4, "text-anchor": "middle", "font-size": cf,
                    fill: cfg.ink, "font-family": FONT
                }, g);
                ct.textContent = this.truncate(p.cat, step - 2, cf);
            }
            if (i === firstFc) {
                const ft = this.el("text", {
                    x, y: yBase + cf * 2 + 8, "text-anchor": "middle", "font-size": cf,
                    fill: cfg.ink, "font-family": FONT, "font-weight": 600
                }, g);
                ft.textContent = "FC";
            }

            this.attachInteraction(g, p, cfg);
            this.catGroups.push({ g, sel: p.sel });
            this.animGroups.push([g]);
        });

        // ------- axis
        this.el("line", {
            x1: left, y1: yBase, x2: right - calloutW + 16, y2: yBase,
            stroke: cfg.ink, "stroke-width": 1.6
        }, bg);

        // ------- stacked AC+FC total column (right)
        const xT = bandEnd + 10;
        const acH = Math.max(yBase - S(acTot), 0);
        this.el("rect", { x: xT, y: yBase - acH, width: totW, height: Math.max(acH, 1), fill: cfg.colors.ac }, bg);
        if (fcTot > 0) {
            const fcH = S(acTot) - S(vTot);
            this.el("rect", {
                x: xT, y: yBase - acH - fcH, width: totW, height: Math.max(fcH, 1),
                fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1.2
            }, bg);
            const fl = this.el("text", {
                x: xT + totW + 4, y: yBase - acH - fcH / 2 + lf * 0.35, "font-size": lf,
                fill: cfg.ink, "font-family": FONT
            }, bg);
            fl.textContent = "FC";
            const fv = this.el("text", {
                x: xT + totW / 2, y: yBase - acH - fcH / 2 + lf * 0.35, "text-anchor": "middle",
                "font-size": lf, fill: cfg.ink, "font-family": FONT,
                stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
            }, bg);
            fv.textContent = cfg.fmt.format(fcTot);
            const al = this.el("text", {
                x: xT + totW + 4, y: yBase - acH / 2 + lf * 0.35, "font-size": lf,
                fill: cfg.ink, "font-family": FONT
            }, bg);
            al.textContent = "AC";
            const av = this.el("text", {
                x: xT + totW / 2, y: yBase - acH / 2 + lf * 0.35, "text-anchor": "middle",
                "font-size": lf, fill: cfg.paper, "font-family": FONT
            }, bg);
            av.textContent = cfg.fmt.format(acTot);
        }
        const tv = this.el("text", {
            x: xT + totW / 2, y: S(vTot) - 5, "text-anchor": "middle", "font-size": lf,
            fill: cfg.ink, "font-family": FONT, "font-weight": 600
        }, bg);
        tv.textContent = cfg.fmt.format(vTot);
        const tc = this.el("text", {
            x: xT + totW / 2, y: yBase + cf + 4, "text-anchor": "middle", "font-size": cf,
            fill: cfg.ink, "font-family": FONT
        }, bg);
        tc.textContent = fcTot > 0 ? "AC+FC" : "AC";

        // ------- net variance bar + circled callout (right edge)
        const xv = xT + totW + sideLblW;
        this.el("rect", {
            x: xv, y: Math.min(yB, yV), width: 6, height: Math.max(Math.abs(yV - yB), 2),
            fill: colOf(dTot)
        }, bg);
        const text = fmtD(dTot);
        const pw = Math.max(40, text.length * lf * 0.62 + 14), ph = lf + 10;
        const pcx = Math.min(xv + 10 + pw / 2, right - pw / 2);
        const pcy = (yB + yV) / 2;
        this.el("rect", {
            x: pcx - pw / 2, y: pcy - ph / 2, width: pw, height: ph, rx: ph / 2,
            fill: cfg.paper, stroke: colOf(dTot), "stroke-width": 1.8
        }, bg);
        const pt = this.el("text", {
            x: pcx, y: pcy + lf * 0.36, "text-anchor": "middle", "font-size": lf,
            "font-weight": 600, fill: colOf(dTot), "font-family": FONT
        }, bg);
        pt.textContent = text;

        // ------- scenario caption top-left
        this.drawPanelTitle(bg, { x: region.x, y: region.y + pad, w: region.w, h: 12 },
            `${cfg.basisLabel} → AC${cfg.hasFc ? "/FC" : ""} · Brücke + Monatssäulen`,
            "columns", Math.round(12 * k), region, undefined, cfg.subtle);
    }

    /**
     * Category bridge (structure): PL/PY total rows on top, one row per category with
     * AC·PY mini-bars, a cascading ΔBasis brick and a ΔBasis% pin, an AC total row and
     * a double reconciliation (ΔBasis + Δother) with circled callout at the bottom —
     * ported from the "Waterfall Chart v2" reference.
     */
    private renderCategoryBridge(pts: DataPoint[], region: Rect, cfg: ChartConfig): void {
        const n = pts.length;
        if (n === 0) { return; }
        const hasPy = pts.some(p => p.py != null);
        const hasPl = pts.some(p => p.pl != null);
        if (!hasPy && !hasPl) {
            this.drawModeHint(region, cfg, this.locStr("Hint_CatBridgeBasis", "Category bridge requires PY or PL as comparison basis"));
            return;
        }
        const k = this.fontK;
        const lf = cfg.labelFont, cf = cfg.catFont;
        const pad = 6;

        const PYt = pts.reduce((a, p) => a + (p.py ?? 0), 0);
        const PLt = pts.reduce((a, p) => a + (p.pl ?? 0), 0);
        const ACt = pts.reduce((a, p) => a + (p.value ?? 0), 0);
        const refIsPl = cfg.basisMode === "plan" && hasPl;
        const refLabel = refIsPl ? "PL" : "PY";
        const REF = refIsPl ? PLt : PYt;
        const hasOther = refIsPl ? hasPy : hasPl;
        const otherTot = refIsPl ? PYt : PLt;
        const otherLabel = refIsPl ? "PY" : "PL";
        const dTot = ACt - REF;
        const goodOf = (v: number, pp?: DataPoint | null) => cfg.isGood(v, pp);
        // per-row deltas LOCALLY against the bridge's own PY/PL reference — p.varAbs
        // follows comparisonMode (e.g. fcrev) and would not reconcile with the anchors
        const refValOf = (p: DataPoint): number | null => refIsPl ? p.pl : p.py;
        const dOf = (p: DataPoint): number | null =>
            p.value != null && refValOf(p) != null ? p.value - (refValOf(p) as number) : null;
        const dRelOf = (p: DataPoint): number | null => {
            const rv = refValOf(p), d = dOf(p);
            return d != null && rv != null && rv !== 0 ? d / Math.abs(rv) * 100 : null;
        };
        const colOf = (v: number, pp?: DataPoint) => (v === 0
            || (pp != null && !cfg.isMaterial(pp, dOf(pp), dRelOf(pp))))
            ? cfg.colors.py : (goodOf(v, pp) ? cfg.colors.good : cfg.colors.bad);
        const fmtD = (v: number) => this.fmtSigned(cfg.fmtVar, v);

        // ------- layout
        const rightEdge = region.x + region.w - pad;
        const catArea = Math.min(region.w * 0.22,
            this.maxTextWidth(pts.map(p => p.cat), cf) + 16);
        const x0 = region.x + pad + catArea;
        const showPins = cfg.showRel && region.w >= 520 && pts.some(p => dRelOf(p) != null);
        const pinW = showPins ? Math.max(110, region.w * 0.15) + lf * 3 : 0;
        const valLblW = lf * 4.2;
        const xValEnd = rightEdge - pinW - valLblW;
        const maxV = Math.max(REF, ACt, hasOther ? otherTot : 0, 1);
        const X = linearScale(0, maxV, x0, xValEnd);
        const axisX = rightEdge - pinW * 0.52;
        const maxPinLen = Math.max(20, pinW * 0.52 - lf * 4.2 - 14);

        const headRows = (hasPl ? 1 : 0) + (hasPy ? 1 : 0);
        const footUnits = 1 + (hasOther ? 2.6 : 1.6);
        const availH = region.h - pad * 2 - 8;
        const rowH = availH / (n + headRows + footUnits + 0.6);
        let y = region.y + pad + 6;
        const yPL = hasPl ? y : null;
        if (hasPl) { y += rowH; }
        const yPY = hasPy ? y : null;
        if (hasPy) { y += rowH; }
        y += rowH * 0.3;
        const yS0 = y;
        const yAC = yS0 + n * rowH + rowH * 0.3;
        const yBr1 = yAC + rowH * 1.15;
        const yBr2 = hasOther ? yBr1 + rowH * 1.25 : null;

        const bg = this.el("g", {}, this.svg);
        const marks = this.el("g", {}, this.svg);
        const rowLabel = (yy: number, text: string, bold: boolean, parent: SVGElement) => {
            const t = this.el("text", {
                x: x0 - 8, y: yy + rowH / 2 + cf * 0.35, "text-anchor": "end",
                "font-size": cf, fill: cfg.ink, "font-family": FONT, "font-weight": bold ? 700 : 400
            }, parent);
            t.textContent = this.truncate(text, catArea - 10, cf);
        };
        const valLabel = (xx: number, yy: number, text: string, bold: boolean, parent: SVGElement,
            anchor: "start" | "end" = "start", color = cfg.ink) => {
            const t = this.el("text", {
                x: xx, y: yy, "text-anchor": anchor, "font-size": lf, fill: color,
                "font-family": FONT, "font-weight": bold ? 700 : 400,
                stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
            }, parent);
            t.textContent = text;
        };
        const guide = (xx: number, y1: number, y2: number, strong: boolean, parent: SVGElement) => {
            this.el("line", {
                x1: xx, y1, x2: xx, y2, stroke: cfg.subtle, "stroke-width": 1,
                "stroke-opacity": strong ? 0.9 : 0.5
            }, parent);
        };

        // ------- top total rows (PL outline, PY grey)
        const barH = Math.max(6, rowH * 0.55);
        const endPrim = yBr1 + rowH * 0.5;
        const endSec = yBr2 != null ? yBr2 + rowH * 0.5 : endPrim;
        if (yPL != null) {
            rowLabel(yPL, "PL", true, bg);
            this.el("rect", {
                x: x0, y: yPL + (rowH - barH) / 2, width: Math.max(X(PLt) - x0, 1), height: barH,
                fill: cfg.paper, stroke: cfg.colors.pl, "stroke-width": 1.5
            }, bg);
            valLabel(X(PLt) + 8, yPL + rowH / 2 + lf * 0.35, cfg.fmt.format(PLt), true, bg);
            guide(X(PLt), yPL + rowH, refIsPl ? endPrim : endSec, false, bg);
        }
        if (yPY != null) {
            rowLabel(yPY, "PY", true, bg);
            this.el("rect", {
                x: x0, y: yPY + (rowH - barH) / 2, width: Math.max(X(PYt) - x0, 1), height: barH,
                ...(cfg.hc
                    ? { fill: cfg.paper, stroke: cfg.colors.py, "stroke-width": 1.2, "stroke-dasharray": "3,2" }
                    : { fill: cfg.colors.py })
            }, bg);
            valLabel(X(PYt) + 8, yPY + rowH / 2 + lf * 0.35, cfg.fmt.format(PYt), true, bg);
            guide(X(PYt), yPY + rowH, refIsPl ? endSec : endPrim, false, bg);
        }

        // ------- group separators
        const groupEvery = Math.round(this.formattingSettings.chartCard.groupEvery.value ?? 0);
        if (groupEvery > 0 && groupEvery < n) {
            for (let i = groupEvery; i < n; i += groupEvery) {
                this.el("line", {
                    x1: region.x + pad, y1: yS0 + i * rowH - 1, x2: rightEdge, y2: yS0 + i * rowH - 1,
                    stroke: cfg.subtle, "stroke-width": 1, "stroke-opacity": 0.35
                }, bg);
            }
        }

        // ------- ΔBasis% pin axis
        if (showPins) {
            const tp = this.el("text", {
                x: axisX, y: yS0 - 8, "text-anchor": "middle", "font-size": Math.round(11 * k),
                fill: cfg.subtle, "font-family": FONT, "font-weight": 600
            }, bg);
            tp.textContent = `Δ${refLabel}%`;
            this.el("rect", {
                x: axisX - 1.5, y: yS0, width: 3, height: yAC - yS0 - rowH * 0.2,
                fill: cfg.colors.py
            }, bg);
            this.el("rect", {
                x: axisX - 1.5, y: yAC + rowH * 0.1, width: 3, height: rowH * 0.8,
                fill: cfg.colors.py
            }, bg);
        }
        const maxPct = Math.max(...pts.map(p => Math.abs(dRelOf(p) ?? 0)),
            REF !== 0 ? Math.abs(dTot / REF * 100) : 0, 1);
        const pinLen = (v: number) => Math.max(2, Math.abs(v) / maxPct * maxPinLen);
        const drawPin = (yy: number, pct: number, bold: boolean, parent: SVGElement, pp?: DataPoint) => {
            const w = pinLen(pct);
            const yMid = yy + rowH / 2;
            const c = colOf(pct, pp);
            const r = Math.max(2.6, 3.4 * k);
            if (pct >= 0) {
                this.el("rect", { x: axisX + 2, y: yMid - 1.5, width: w, height: 3, fill: c }, parent);
                this.el("rect", { x: axisX + 2 + w, y: yMid - r, width: 2 * r, height: 2 * r, fill: cfg.ink }, parent);
                valLabel(axisX + 2 + w + 2 * r + 4, yMid + lf * 0.35, this.fmtPercent(pct), bold, parent);
            } else {
                this.el("rect", { x: axisX - 2 - w, y: yMid - 1.5, width: w, height: 3, fill: c }, parent);
                this.el("rect", { x: axisX - 2 - w - 2 * r, y: yMid - r, width: 2 * r, height: 2 * r, fill: cfg.ink }, parent);
                valLabel(axisX - 2 - w - 2 * r - 4, yMid + lf * 0.35, this.fmtPercent(pct), bold, parent, "end");
            }
        };

        // ------- biggest driver
        let drvIdx = -1;
        pts.forEach((p, i) => {
            if (dOf(p) == null) { return; }
            if (drvIdx < 0 || Math.abs(dOf(p) as number) > Math.abs(dOf(pts[drvIdx]) ?? 0)) { drvIdx = i; }
        });

        // ------- category rows
        const pyBarH = Math.max(3, rowH * 0.30);
        const acBarH = Math.max(4, rowH * 0.42);
        const brickH = Math.max(5, rowH * 0.48);
        let cum = REF;
        const refRowY = refIsPl ? (yPL as number) : (yPY as number);
        guide(X(REF), refRowY + rowH, yS0 + rowH * 0.26, true, bg);
        pts.forEach((p, i) => {
            const g = this.el("g", { "class": "icd-cat" }, marks) as SVGGElement;
            const yy = yS0 + i * rowH;
            rowLabel(yy, p.cat, false, g);

            // mini bars: reference (PY grey / PL outline) behind, AC in front;
            // with three scenarios the PY reference collapses to the triangle marker
            const behind = hasPy ? p.py : p.pl;
            if (behind != null) {
                if (cfg.pyTriangle && hasPy) {
                    this.drawPyTriangle(g, yy + rowH * 0.28, rowH * 0.5, behind, X, "bars", cfg);
                } else {
                    this.el("rect", {
                        x: x0, y: yy + rowH * 0.12, width: Math.max(X(behind) - x0, 1), height: pyBarH,
                        ...(cfg.hc || !hasPy
                            ? { fill: cfg.paper, stroke: cfg.colors.py, "stroke-width": 1 }
                            : { fill: cfg.colors.py })
                    }, g);
                }
            }
            if (p.value != null) {
                this.el("rect", {
                    x: x0, y: yy + rowH * 0.30, width: Math.max(X(p.value) - x0, 1), height: acBarH,
                    ...(p.isFc
                        ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1 }
                        : { fill: cfg.colors.ac })
                }, g);
                if (cfg.showLabels) {
                    const xl = Math.max(X(p.value), behind != null ? X(behind) : 0);
                    valLabel(xl + 6, yy + rowH / 2 + lf * 0.35, cfg.fmt.format(p.value), false, g);
                }
            }

            // cascade brick + connector
            if (dOf(p) != null) {
                const d = dOf(p) as number;
                const a = cum, b = cum + d;
                const xA = X(Math.min(a, b)), xB = X(Math.max(a, b));
                const c = colOf(d, p);
                const hollowBad = cfg.hc && !goodOf(d, p) && d !== 0;
                this.el("rect", {
                    x: xA, y: yy + rowH * 0.26, width: Math.max(xB - xA, 2), height: brickH,
                    ...(hollowBad
                        ? { fill: cfg.paper, stroke: c, "stroke-width": 1.4 }
                        : p.isFc
                            ? { fill: `url(#${goodOf(d, p) ? cfg.patGood : cfg.patBad})`, stroke: c, "stroke-width": 1 }
                            : { fill: c })
                }, g);
                if (cfg.showLabels) {
                    if (d >= 0) { valLabel(xB + 6, yy + rowH / 2 + lf * 0.35, fmtD(d), false, g); }
                    else { valLabel(xA - 6, yy + rowH / 2 + lf * 0.35, fmtD(d), false, g, "end"); }
                }
                // größter Treiber annotation (optional — overlays the row area)
                if (i === drvIdx && dTot !== 0 && region.w >= 640
                    && this.formattingSettings.chartCard.driverNote.value) {
                    const share = Math.round(Math.abs(d / dTot) * 100);
                    let note: string;
                    if (Math.sign(d) === Math.sign(dTot) && share <= 100) {
                        note = `${this.locStr("Note_Driver", "largest driver")} · ${share} ${this.locStr("Note_OfTotal", "% of total variance")}`;
                    } else {
                        const sameSum = pts.reduce((a2, q) => {
                            const qd = dOf(q);
                            return a2 + (qd != null && Math.sign(qd) === Math.sign(d) ? Math.abs(qd) : 0);
                        }, 0);
                        const sh2 = sameSum ? Math.round(Math.abs(d) / sameSum * 100) : 0;
                        note = `${this.locStr("Note_Driver", "largest driver")} · ${sh2} ${d < 0
                            ? this.locStr("Note_OfDeclines", "% of all declines")
                            : this.locStr("Note_OfIncreases", "% of all increases")}`;
                    }
                    const noteFont = Math.round(Math.max(9, lf * 0.85));
                    const nt = this.el("text", {
                        x: d >= 0 ? xB + 6 + fmtD(d).length * lf * 0.62 + 12 : xA - 6 - fmtD(d).length * lf * 0.62 - 12,
                        y: yy + rowH / 2 + lf * 0.35, "text-anchor": d >= 0 ? "start" : "end",
                        "font-size": noteFont, fill: cfg.subtle, "font-family": FONT, "font-style": "italic",
                        stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
                    }, g);
                    nt.textContent = note;
                }
                // vertical connector to the next row / to the AC row
                const nextY = i < n - 1 ? yy + rowH + rowH * 0.26 : yAC + rowH * 0.2;
                guide(X(b), yy + rowH * 0.26 + brickH, nextY, true, bg);
                cum = b;
            }

            if (showPins && dRelOf(p) != null) {
                drawPin(yy, dRelOf(p) as number, false, g, p);
            }

            this.attachInteraction(g, p, cfg);
            this.catGroups.push({ g, sel: p.sel });
            this.animGroups.push([g]);
        });

        // ------- AC total row
        rowLabel(yAC, "AC", true, bg);
        this.el("rect", {
            x: x0, y: yAC + (rowH - barH) / 2, width: Math.max(X(ACt) - x0, 1), height: barH,
            ...(cfg.hasFc
                ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1.2 }
                : { fill: cfg.colors.ac })
        }, bg);
        valLabel(X(ACt) + 8, yAC + rowH / 2 + lf * 0.35, cfg.fmt.format(ACt), true, bg);
        guide(X(ACt), yAC + rowH, endSec, false, bg);
        if (showPins && REF !== 0) {
            drawPin(yAC, dTot / Math.abs(REF) * 100, true, bg);
        }

        // ------- reconciliation rows: primary ΔRef with circled callout, then Δother
        const brH = Math.max(5, rowH * 0.4);
        const drawBridgeRow = (yy: number, from: number, to: number, label: string,
            withCallout: boolean) => {
            const d = to - from;
            const xA = X(Math.min(from, to)), xB = X(Math.max(from, to));
            this.el("rect", {
                x: xA, y: yy, width: Math.max(xB - xA, 2), height: brH, fill: colOf(d)
            }, bg);
            const mid = (X(from) + X(to)) / 2;
            if (withCallout) {
                const text = fmtD(d);
                const pw = Math.max(44, text.length * lf * 0.62 + 16), ph = lf + 9;
                this.el("rect", {
                    x: mid - pw / 2, y: yy + brH + 4, width: pw, height: ph, rx: ph / 2,
                    fill: cfg.paper, stroke: colOf(d), "stroke-width": 1.8
                }, bg);
                valLabel(mid, yy + brH + 4 + ph / 2 + lf * 0.36, text, true, bg, "start", colOf(d));
                const tt = bg.lastChild as SVGTextElement;
                tt.setAttribute("text-anchor", "middle");
            } else {
                valLabel(mid, yy + brH + lf + 4, fmtD(d), false, bg, "start");
                const tt = bg.lastChild as SVGTextElement;
                tt.setAttribute("text-anchor", "middle");
            }
            const lt = this.el("text", {
                x: xB + 10, y: yy + brH * 0.5 + lf * 0.35, "font-size": Math.round(Math.max(9, lf * 0.85)),
                fill: cfg.subtle, "font-family": FONT
            }, bg);
            lt.textContent = label;
        };
        drawBridgeRow(yBr1, REF, ACt, `Δ${refLabel}`, true);
        if (yBr2 != null) {
            drawBridgeRow(yBr2, otherTot, ACt, `Δ${otherLabel}`, false);
        }
    }

    /** GuV-Statement: scenario views available from the bound measures + active one */
    private resolvePnlView(pts: DataPoint[]): { view: "ac" | "acfc" | "pl"; avail: ("ac" | "acfc" | "pl")[] } {
        const avail: ("ac" | "acfc" | "pl")[] = [];
        if (pts.some(p => p.ac != null)) { avail.push("ac"); }
        if (pts.some(p => p.fc != null)) { avail.push("acfc"); }
        if (pts.some(p => p.pl != null)) { avail.push("pl"); }
        const v = this.pnlView as "ac" | "acfc" | "pl";
        return { view: avail.includes(v) ? v : (avail[0] ?? "ac"), avail };
    }

    /** GuV-Statement: pane-scoped collapse key of a sum row (group-qualified) */
    private pnlKey(p: DataPoint): string {
        return `${p.group ?? ""}¦${p.cat}`;
    }

    /**
     * GuV-Statement: each delta run belongs to the next sum row (its collapse
     * owner). Keyed by row INDEX (duplicate category names must not collide);
     * the owner value is the sum row's pane-scoped collapse key.
     */
    private pnlBlocks(pts: DataPoint[]): Map<number, string> {
        const owner = new Map<number, string>();
        let run: number[] = [];
        pts.forEach((p, i) => {
            const rt = p.rowType ?? "";
            if (rt.startsWith("sum")) {
                for (const d of run) { owner.set(d, this.pnlKey(p)); }
                run = [];
            } else if (!rt.startsWith("pct")) {
                run.push(i);
            }
        });
        return owner;
    }

    /**
     * GuV-Statement (IBCS P&L): one row per P&L line with a PY waterfall-bar column,
     * a scenario waterfall-bar column (AC solid / AC&FC split-hatched / PL outlined),
     * ΔRef variance bars and ΔRef% pins — modelled on the interactive IBCS P&L
     * reference. 'sum' rows are bold anchors with rules; the delta rows between two
     * anchors collapse behind the sum's chevron. 'pct' rows render text-only.
     */
    private renderPnlStatement(pts: DataPoint[], region: Rect, cfg: ChartConfig): void {
        if (pts.length === 0) { return; }
        const k = this.fontK;
        const lf = cfg.labelFont, cf = cfg.catFont;
        const pad = 6;
        const { view } = this.resolvePnlView(pts);
        const hasRef = cfg.hasPy || (view !== "pl" && cfg.hasPl);
        if (!hasRef) {
            this.drawModeHint(region, cfg, this.locStr("Hint_PnlRef", "P&L statement requires PY (or PL) as reference"));
            return;
        }
        const refIsPy = cfg.hasPy;
        const refLabel = refIsPy ? "PY" : "PL";
        const viewHead = view === "ac" ? "AC" : view === "acfc" ? "AC&FC" : "PL";
        // notation per IBCS: realized solid, partly-forecast hatched, plan outlined
        const style: "solid" | "hatched" | "outlined" =
            view === "ac" ? "solid" : view === "acfc" ? "hatched" : "outlined";

        const isSum = (p: DataPoint) => (p.rowType ?? "").startsWith("sum");
        const isPct = (p: DataPoint) => (p.rowType ?? "").startsWith("pct");
        // AC view shows ONLY actuals — falling back to p.value would render
        // forecast rows (value = fc) as solid realized bars (IBCS violation)
        const mVal = (p: DataPoint): number | null => view === "ac" ? p.ac
            : view === "pl" ? p.pl
                : (p.ac == null && p.fc == null ? null : (p.ac ?? 0) + (p.fc ?? 0));
        const rVal = (p: DataPoint): number | null => refIsPy ? p.py : p.pl;

        // ------- collapsible rows: deltas hide behind their sum's chevron
        const owner = this.pnlBlocks(pts);
        const collapsible = new Set(owner.values());
        const rows = pts.map((p, idx) => ({ p, idx })).filter(r => {
            const o = owner.get(r.idx);
            return !(o != null && this.pnlCollapsed.has(o));
        });
        const n = rows.length;

        // ------- waterfall chains, keyed by row index (hidden rows still
        // cumulate — sums are anchors; duplicate category names must not collide)
        const chain = (val: (p: DataPoint) => number | null): Map<number, [number, number]> => {
            const seg = new Map<number, [number, number]>();
            let cum = 0;
            pts.forEach((p, i) => {
                if (isPct(p)) { return; }
                const v = val(p);
                if (isSum(p)) {
                    cum = v ?? cum;
                    seg.set(i, [0, cum]);
                } else {
                    seg.set(i, [cum, cum + (v ?? 0)]);
                    cum += v ?? 0;
                }
            });
            return seg;
        };
        const segM = chain(mVal), segR = chain(rVal);
        let lo = 0, hi = 1;
        const eat = (s: Map<number, [number, number]>) => s.forEach(([a, b]) => {
            lo = Math.min(lo, a, b); hi = Math.max(hi, a, b);
        });
        eat(segM); eat(segR);

        // ------- column layout: label | ref bars | scenario bars | Δ | Δ%
        const chevW = collapsible.size > 0 ? 13 * k : 0;
        const nameW = Math.min(region.w * 0.24,
            this.maxTextWidth(pts.map(p => p.cat), cf) + 26 + chevW);
        const gap = 12;
        const graphW = region.w - pad * 2 - nameW - gap * 4;
        if (graphW < 220 * k) {
            this.drawModeHint(region, cfg, this.locStr("Hint_PnlSpace", "Not enough space for the P&L statement"));
            return;
        }
        const showPct = cfg.showRel && graphW >= 340 * k;
        const showD = cfg.showAbs;
        const wBar = graphW * (showPct && showD ? 0.28 : showD ? 0.34 : 0.42);
        const wD = showD ? graphW * (showPct ? 0.26 : 0.32) : 0;
        const wP = showPct ? graphW - wBar * 2 - wD : 0;
        let x = region.x + pad;
        const xName = x; x += nameW + gap;
        const xRef = x; x += wBar + gap;
        const xM = x; x += wBar + gap;
        const xD = x; x += wD + (showD ? gap : 0);
        const xP = x;

        // labels live at bar ends — reserve space for them inside the bar columns
        const lblRes = lf * 3.6;
        const PX = (wBar - lblRes) / Math.max(hi - lo, 1e-9);
        const bx = (col: number, v: number) => col + (v - lo) * PX;

        // ------- row layout
        const headerH = Math.round(cf + 12);
        const rowH = Math.min(cf * 2.4, Math.max(cf + 6, (region.h - pad * 2 - headerH) / n));
        const top = region.y + pad + headerH;
        const shown = rows.slice(0, Math.max(1, Math.floor((region.h - pad * 2 - headerH) / rowH)));

        const bg = this.el("g", {}, this.svg);
        const marks = this.el("g", {}, this.svg);
        // materiality must be measured on the DISPLAYED variance (mVal−rVal of the
        // chosen view/reference), not on parseData's comparisonMode-based varAbs
        const colOf = (v: number, pp?: DataPoint, vRel?: number | null) => (v === 0
            || (pp != null && !cfg.isMaterial(pp, Math.abs(v), vRel != null ? Math.abs(vRel) : undefined)))
            ? cfg.colors.py : (cfg.isGood(v, pp) ? cfg.colors.good : cfg.colors.bad);
        const txt = (xx: number, yy: number, text: string, anchor: string, font: number,
            bold: boolean, color: string, parent: SVGElement, italic = false) => {
            const t = this.el("text", {
                x: xx, y: yy, "text-anchor": anchor, "font-size": font, fill: color,
                "font-family": FONT, "font-weight": bold ? 700 : 400,
                ...(italic ? { "font-style": "italic" } : {})
            }, parent);
            t.textContent = text;
            return t;
        };

        // ------- column headers
        const hy = region.y + pad + cf;
        txt(xRef + wBar / 2, hy, refLabel, "middle", cf, false, cfg.subtle, bg);
        txt(xM + wBar / 2, hy, viewHead, "middle", cf, false, cfg.subtle, bg);
        if (showD) { txt(xD + wD / 2, hy, `Δ${refLabel}`, "middle", cf, false, cfg.subtle, bg); }
        if (showPct) { txt(xP + wP / 2, hy, `Δ${refLabel}%`, "middle", cf, false, cfg.subtle, bg); }

        // ------- variance axes (reference-scenario grey, full height)
        const dAxis = xD + wD * 0.46;
        const pAxis = xP + wP * 0.34;
        const axH = top + shown.length * rowH;
        if (showD) {
            this.el("line", {
                x1: dAxis, y1: top - 3, x2: dAxis, y2: axH,
                stroke: cfg.colors.py, "stroke-width": 2.6
            }, bg);
        }
        if (showPct) {
            this.el("line", {
                x1: pAxis, y1: top - 3, x2: pAxis, y2: axH,
                stroke: cfg.colors.py, "stroke-width": 2.6
            }, bg);
        }
        const maxD = Math.max(...pts.filter(p => !isPct(p))
            .map(p => Math.abs((mVal(p) ?? 0) - (rVal(p) ?? 0))), 1e-9);
        // clamp to ≥0: negative room would flip bars/pins to the wrong axis side
        const dPX = Math.max(0, (wD * 0.42 - lf * 2.6)) / maxD;
        const P_CAP = 100;
        const pLen = Math.max(0, wP * 0.38 - lf * 2.2);

        const scenFill = (scen: "ref" | "m"): Record<string, unknown> => {
            if (scen === "ref") {
                return refIsPy
                    ? (cfg.hc
                        ? { fill: cfg.paper, stroke: cfg.colors.py, "stroke-width": 1, "stroke-dasharray": "3,2" }
                        : { fill: cfg.colors.py })
                    : { fill: cfg.paper, stroke: cfg.colors.pl, "stroke-width": 1.2 };
            }
            if (style === "solid") { return { fill: cfg.colors.ac }; }
            if (style === "hatched") { return { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1 }; }
            return { fill: cfg.paper, stroke: cfg.colors.ac, "stroke-width": 1.4 };
        };
        const varFill = (c: string): Record<string, unknown> => {
            if (style === "solid") { return { fill: c }; }
            if (style === "hatched") {
                return { fill: `url(#${c === cfg.colors.good ? cfg.patGood : cfg.patBad})`, stroke: c, "stroke-width": 1 };
            }
            return { fill: cfg.paper, stroke: c, "stroke-width": 1.4 };
        };
        const fmtM = (v: number) => cfg.fmt.format(Math.abs(v));
        const fmtD = (v: number) => this.fmtSigned(cfg.fmtVar, v);
        const pctFmt = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

        // ------- rows
        shown.forEach((r, i) => {
            const p = r.p;
            const y = top + i * rowH;
            const cy = y + rowH / 2;
            const sum = isSum(p), pct = isPct(p);
            const g = this.el("g", { "class": "icd-cat" }, marks) as SVGGElement;

            if (sum) {
                this.el("line", { x1: xName, y1: y, x2: region.x + region.w - pad, y2: y, stroke: cfg.ink, "stroke-width": 1.3 }, bg);
                this.el("line", { x1: xName, y1: y + rowH, x2: region.x + region.w - pad, y2: y + rowH, stroke: cfg.ink, "stroke-width": 1.3 }, bg);
            }

            // label: chevron (sum with kids) + derived +/−/= prefix + indent for deltas
            const mv = mVal(p);
            const key = this.pnlKey(p);
            const pre = sum ? "=" : pct ? "" : (mv ?? 0) < 0 ? "−" : "+";
            let lx = xName;
            if (collapsible.size > 0) {
                if (sum && collapsible.has(key)) {
                    const open = !this.pnlCollapsed.has(key);
                    const ch = txt(lx, cy + cf * 0.36, open ? "▾" : "▸", "start", Math.round(cf * 0.9), false, cfg.subtle, g);
                    ch.style.cursor = "pointer";
                    (ch as SVGElement).addEventListener("click", (e: Event) => {
                        e.stopPropagation();
                        if (this.pnlCollapsed.has(key)) { this.pnlCollapsed.delete(key); }
                        else { this.pnlCollapsed.add(key); }
                        this.rerender();
                    });
                }
                lx += chevW;
            }
            txt(lx, cy + cf * 0.36, pre, "start", cf, false, cfg.subtle, g);
            const indent = !sum && !pct && owner.has(r.idx) ? 10 * k : 0;
            txt(lx + cf * 0.9 + indent, cy + cf * 0.36,
                this.truncate(p.cat, nameW - chevW - cf * 0.9 - indent - 4, cf), "start", cf, sum, cfg.ink, g);

            const rv = rVal(p);
            if (pct) {
                // margin rows: percentages as text, Δ in percentage points
                if (rv != null) { txt(bx(xRef, 0) + 4, cy + lf * 0.36, `${pctFmt.format(rv)} %`, "start", lf, false, cfg.subtle, g); }
                if (mv != null) { txt(bx(xM, 0) + 4, cy + lf * 0.36, `${pctFmt.format(mv)} %`, "start", lf, false, cfg.ink, g); }
                if (showD && mv != null && rv != null) {
                    const d = mv - rv;
                    txt(dAxis + 6, cy + lf * 0.36, `${d > 0 ? "+" : d < 0 ? "−" : "±"}${pctFmt.format(Math.abs(d))}Pp`,
                        "start", lf, false, colOf(d, p, d), g);
                }
            } else {
                // scenario waterfall bars: ref column + view column at cumulated offsets
                const barH = Math.max(6, rowH * 0.58);
                const by = cy - barH / 2;
                const drawSeg = (col: number, seg: [number, number] | undefined, scen: "ref" | "m",
                    split: number | null) => {
                    if (!seg) { return; }
                    const [a, b] = seg;
                    const x0 = bx(col, Math.min(a, b));
                    const w = Math.max(2, Math.abs(b - a) * PX);
                    const rightSide = b >= a;
                    if (scen === "m" && style === "hatched" && split != null && split > 0 && split < 1) {
                        const wAc = w * split;
                        const acX = rightSide ? x0 : x0 + w - wAc;
                        const fcX = rightSide ? x0 + wAc : x0;
                        this.el("rect", { x: acX, y: by, width: wAc, height: barH, fill: cfg.colors.ac }, g);
                        this.el("rect", {
                            x: fcX, y: by, width: Math.max(0, w - wAc), height: barH,
                            fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1
                        }, g);
                    } else {
                        this.el("rect", { x: x0, y: by, width: w, height: barH, ...scenFill(scen) }, g);
                    }
                    const v = Math.abs(b - a);
                    const tx = rightSide ? x0 + w + 4 : x0 - 4;
                    txt(tx, cy + lf * 0.36, fmtM(v), rightSide ? "start" : "end", lf,
                        sum && scen === "m", scen === "ref" ? cfg.subtle : cfg.ink, g);
                };
                // split by magnitudes: with an actual and a forecast of opposite
                // sign the signed ratio would collapse the split entirely
                const split = view === "acfc" && p.ac != null && p.fc != null
                    && (Math.abs(p.ac) + Math.abs(p.fc)) > 0
                    ? Math.abs(p.ac) / (Math.abs(p.ac) + Math.abs(p.fc)) : null;
                drawSeg(xRef, segR.get(r.idx), "ref", null);
                drawSeg(xM, segM.get(r.idx), "m", split);

                // ΔRef bar + label
                if (showD && mv != null && rv != null) {
                    const d = mv - rv;
                    const dpm = rv !== 0 ? d / Math.abs(rv) * 100 : null;
                    const c = colOf(d, p, dpm);
                    const w = Math.abs(d) * dPX;
                    const x0 = d >= 0 ? dAxis : dAxis - w;
                    this.el("rect", {
                        x: x0, y: cy - Math.max(5, rowH * 0.42) / 2,
                        width: Math.max(2, w), height: Math.max(5, rowH * 0.42), ...varFill(c)
                    }, g);
                    txt(d >= 0 ? dAxis + w + 5 : dAxis - w - 5, cy + lf * 0.36, fmtD(d),
                        d >= 0 ? "start" : "end", lf, sum, cfg.ink, g);
                }
                // ΔRef% pin, capped with outlier arrows like the reference
                if (showPct && mv != null && rv != null && rv !== 0) {
                    const dp = (mv - rv) / Math.abs(rv) * 100;
                    const c = colOf(mv - rv, p, dp);
                    const outlier = Math.abs(dp) > P_CAP;
                    const w = Math.min(Math.abs(dp), P_CAP) / P_CAP * pLen;
                    const x0 = dp >= 0 ? pAxis : pAxis - w;
                    this.el("rect", { x: x0, y: cy - 1.1, width: Math.max(2, w), height: 2.2, fill: c }, g);
                    const hr = Math.max(2.6, 3.2 * k);
                    const hx = dp >= 0 ? pAxis + w - hr : pAxis - w - hr;
                    this.el("rect", {
                        x: hx, y: cy - hr, width: hr * 2, height: hr * 2,
                        ...(style === "solid" ? { fill: cfg.ink }
                            : style === "hatched" ? { fill: `url(#${cfg.patId})`, stroke: cfg.ink, "stroke-width": 1 }
                                : { fill: cfg.paper, stroke: cfg.ink, "stroke-width": 1.2 })
                    }, g);
                    const lxp = dp >= 0 ? pAxis + w + (outlier ? 16 : 6) : pAxis - w - (outlier ? 16 : 6);
                    if (outlier) {
                        txt(dp >= 0 ? pAxis + w + 3 : pAxis - w - 3, cy + lf * 0.3, "▸▸",
                            dp >= 0 ? "start" : "end", Math.round(lf * 0.8), false, c, g);
                    }
                    txt(lxp, cy + lf * 0.36, `${dp > 0 ? "+" : dp < 0 ? "−" : "±"}${Math.round(Math.abs(dp))}%`,
                        dp >= 0 ? "start" : "end", lf, sum, cfg.ink, g);
                }
            }

            this.attachInteraction(g, p, cfg);
            this.catGroups.push({ g, sel: p.sel });
            this.animGroups.push([g]);
        });
    }

    /** GuV-Statement toolbar: scenario view segments (existing scenarios only) + levels */
    private drawPnlButtons(width: number, cfg: ChartConfig, pts: DataPoint[]): void {
        const k = this.fontK;
        const bh = Math.round(18 * k), font = Math.round(11 * k);
        const { view, avail } = this.resolvePnlView(pts);
        const collapsible = new Set(this.pnlBlocks(pts).values());
        let xRight = width - 6;
        const btn = (w: number, text: string, active: boolean, label: string, onClick: () => void) => {
            const x = xRight - w;
            const b = this.el("g", { tabindex: "0", role: "button" }, this.svg) as SVGGElement;
            b.setAttribute("aria-label", label);
            const tip = this.el("title", {}, b);
            tip.textContent = label;
            this.el("rect", {
                x, y: 6, width: w, height: bh, fill: active ? cfg.colors.ac : cfg.paper,
                stroke: cfg.hc ? cfg.ink : cfg.subtle, "stroke-width": 1
            }, b);
            const t = this.el("text", {
                x: x + w / 2, y: 6 + bh / 2 + font * 0.36, "text-anchor": "middle",
                "font-size": font, fill: active ? cfg.paper : cfg.ink, "font-family": FONT
            }, b);
            t.textContent = text;
            b.style.cursor = "pointer";
            b.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); onClick(); });
            b.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key !== "Enter" && e.key !== " ") { return; }
                e.preventDefault(); e.stopPropagation(); onClick();
            });
            xRight = x;
        };
        // level buttons: 1 = sums only, 2 = everything (only when blocks exist)
        if (collapsible.size > 0) {
            const allCollapsed = [...collapsible].every(c => this.pnlCollapsed.has(c));
            btn(Math.round(22 * k), "2", !allCollapsed && this.pnlCollapsed.size === 0,
                this.locStr("Btn_Level2", "Level 2: all line items"), () => { this.pnlCollapsed.clear(); this.rerender(); });
            btn(Math.round(22 * k), "1", allCollapsed, this.locStr("Btn_Level1", "Level 1: subtotals only"), () => {
                this.pnlCollapsed = new Set(collapsible);
                this.rerender();
            });
            xRight -= 6;
        }
        // scenario view segments — a scenario without data gets no button
        if (avail.length > 1) {
            const segLbl: Record<string, string> = { ac: "AC", acfc: "AC&FC", pl: "PL" };
            const segTip: Record<string, string> = {
                ac: this.locStr("Btn_ViewAc", "View: actuals (AC)"),
                acfc: this.locStr("Btn_ViewAcFc", "View: actuals + forecast (AC&FC)"),
                pl: this.locStr("Btn_ViewPl", "View: plan (PL)")
            };
            for (const v of [...avail].reverse()) {
                btn(Math.round((v === "acfc" ? 48 : 30) * k), segLbl[v], view === v, segTip[v], () => {
                    this.pnlView = v;
                    this.pendingPnlView = v;
                    this.host.persistProperties({
                        merge: [{ objectName: "chart", selector: null, properties: { pnlView: v } }]
                    });
                    this.rerender();
                });
            }
        }
    }

    /**
     * IBCS table: one row per category with the value, an AC·PY·PL bar cell, the
     * ΔBasis as number + bar and ΔBasis % as pin — a financial-statement style
     * table with integrated chart columns. 'sum' rows (Waterfall-Type role) render
     * bold with a stronger separator, like P&L subtotals. Columns drop gracefully
     * when the region gets narrow, so plain value tables still work on small tiles.
     */
    private renderTable(points: DataPoint[], region: Rect, cfg: ChartConfig): void {
        if (points.length === 0) { return; }
        // matrix mode: a bound column-group role pivots the table into column
        // blocks with a collapsible header hierarchy (Power-BI-Matrix-style)
        if (points.some(p => p.colLevels && p.colLevels.length > 0)) {
            this.renderTableMatrix(points, region, cfg);
            return;
        }
        const k = this.fontK;
        const lf = cfg.labelFont, cf = cfg.catFont;
        const pad = 6;

        // ------- expandable hierarchy: with an expanded category hierarchy (≥2 level
        // columns in the field well), parent rows render aggregated with a ▸/▾
        // chevron — clicking the category toggles its indented child rows in and out
        type TableRow = { p: DataPoint; depth: number; parentKey?: string; expanded?: boolean; isTotal?: boolean; formula?: boolean };
        const isSum = (p: DataPoint) => p.rowType != null && p.rowType.startsWith("sum");
        const isPct = (p: DataPoint) => p.rowType != null && p.rowType.startsWith("pct");
        // one-click P&L lists (structure-edit mode): promoted result rows and
        // rows excluded from totals/scales, matched by the displayed row label
        const isResult = (p: DataPoint) => cfg.resultSet.has(p.cat.trim().toLowerCase());
        const isSkip = (p: DataPoint) => cfg.skipSet.has(p.cat.trim().toLowerCase());
        const isAnchor = (p: DataPoint) => isSum(p) || isResult(p);
        const hasLevels = points.some(p => (p.catLevels?.length ?? 0) >= 2);

        // header sort (persisted): disabled while cumulating — a running total
        // is chronological by definition and must not be re-ordered
        const sortSpec = !cfg.cumulative && this.tableSort ? this.tableSort : "";
        const [sortKey, sortDir] = sortSpec ? sortSpec.split("_") : ["", ""];
        const sortGet: { [k: string]: (p: DataPoint) => number | null } = {
            ac: p => p.value, dabs: p => p.varAbs, drel: p => p.varRel, d2abs: p => p.var2Abs
        };
        const getter = sortGet[sortKey];
        const cmp = getter
            ? (a: DataPoint, b: DataPoint) => {
                const av = getter(a), bv = getter(b);
                if (av == null && bv == null) { return 0; }
                if (av == null) { return 1; }
                if (bv == null) { return -1; }
                return sortDir === "asc" ? av - bv : bv - av;
            }
            : () => 0;

        let rows: TableRow[];
        // an active 🔍 search auto-expands every branch so matches inside collapsed
        // parents are reachable; the chevron state is restored when the term clears
        const searchOn = this.allowInteractions && this.tableSearch.trim() !== "";
        // every branch node across ALL depths (also inside collapsed parents) —
        // drives the header expand-all chevron so deep levels open too
        const allParentKeys: string[] = [];
        // full point source independent of the expand state (branch aggregates +
        // every leaf): formula lookups and the shared scales must not change when
        // the user collapses a branch
        const allPts: DataPoint[] = [];
        if (hasLevels) {
            // real multi-level tree: one node per catLevels prefix. Drill keys are
            // tile-scoped path keys (group¦l0¦l1…) so same-named branches in
            // small-multiples tiles expand independently; level-0 keys match the
            // old group¦label format, so persisted expand state stays valid
            type TNode = { label: string; key: string; order: string[]; kids: Map<string, TNode>; pts: DataPoint[] };
            const root: TNode = { label: "", key: "", order: [], kids: new Map(), pts: [] };
            for (const p of points) {
                const path = p.catLevels && p.catLevels.length > 1 ? p.catLevels : [p.cat];
                let node = root;
                let key = p.group ?? "";
                for (const lvl of path) {
                    key += `¦${lvl}`;
                    let ch = node.kids.get(lvl);
                    if (!ch) {
                        ch = { label: lvl, key, order: [], kids: new Map(), pts: [] };
                        node.kids.set(lvl, ch);
                        node.order.push(lvl);
                    }
                    ch.pts.push(p);
                    node = ch;
                }
            }
            const collectKeys = (nd: TNode) => {
                if (nd !== root && nd.kids.size > 0) { allParentKeys.push(nd.key); }
                nd.kids.forEach(collectKeys);
            };
            collectKeys(root);
            const aggOf = new Map<TNode, DataPoint>();
            const aggFor = (nd: TNode): DataPoint => {
                let a = aggOf.get(nd);
                if (!a) {
                    if (nd.pts.length === 1) {
                        a = { ...nd.pts[0], cat: nd.label };
                    } else {
                        // branch totals follow the Σ-row base rule: data-provided
                        // sum/result rows would double-count, pct rows are percentages,
                        // skip rows are excluded from totals by definition
                        const base = nd.pts.filter(p => !isSum(p) && !isResult(p)
                            && !isSkip(p) && !isPct(p));
                        a = this.aggregateHierarchy(nd.label, base.length > 0 ? base : nd.pts);
                    }
                    aggOf.set(nd, a);
                }
                return a;
            };
            // sort siblings by their aggregate — but only BETWEEN anchor siblings
            // (sum/result/pct aggregates keep their position, like the flat path)
            const sortSiblings = (list: TNode[]): TNode[] => {
                if (!getter) { return list; }
                const out: TNode[] = [];
                let run: TNode[] = [];
                const flush = () => {
                    run.sort((a, b) => cmp(aggFor(a), aggFor(b)));
                    out.push(...run);
                    run = [];
                };
                for (const nd of list) {
                    const a = aggFor(nd);
                    if (isAnchor(a) || isPct(a)) { flush(); out.push(nd); }
                    else { run.push(nd); }
                }
                flush();
                return out;
            };
            rows = [];
            const emit = (nd: TNode, depth: number) => {
                if (nd.kids.size === 0) {
                    // leaf: one row per point (duplicate labels stay separate rows)
                    const pts = nd.pts.length > 1 && getter ? [...nd.pts].sort(cmp) : nd.pts;
                    for (const c of pts) { rows.push({ p: { ...c, cat: nd.label }, depth }); }
                    return;
                }
                const expanded = this.expandedRows.has(nd.key) || searchOn;
                rows.push({ p: aggFor(nd), depth, parentKey: nd.key, expanded });
                if (expanded) {
                    for (const ch of sortSiblings(nd.order.map(l => nd.kids.get(l) as TNode))) {
                        emit(ch, depth + 1);
                    }
                }
            };
            for (const nd of sortSiblings(root.order.map(l => root.kids.get(l) as TNode))) {
                emit(nd, 0);
            }
            const collectAll = (nd: TNode) => {
                if (nd.kids.size === 0) {
                    for (const c of nd.pts) { allPts.push({ ...c, cat: nd.label }); }
                    return;
                }
                allPts.push(aggFor(nd));
                for (const l of nd.order) { collectAll(nd.kids.get(l) as TNode); }
            };
            for (const l of root.order) { collectAll(root.kids.get(l) as TNode); }
        } else if (getter) {
            // flat: sort segment-wise BETWEEN anchor rows (sum/result/pct keep
            // their position — sorting across subtotal blocks would scramble a P&L)
            const sorted: DataPoint[] = [];
            let seg: DataPoint[] = [];
            for (const p of points) {
                if (isAnchor(p) || isPct(p)) {
                    seg.sort(cmp);
                    sorted.push(...seg, p);
                    seg = [];
                } else { seg.push(p); }
            }
            seg.sort(cmp);
            sorted.push(...seg);
            rows = sorted.map(p => ({ p, depth: 0 }));
        } else {
            rows = points.map(p => ({ p, depth: 0 }));
        }

        // ------- formula rows light: "Label = A + B - C" appends a computed row in
        // subtotal styling, "Label = A / B" a %-row (margin). Operands reference row
        // labels; operators need surrounding spaces so names like "E-Commerce" work.
        // Formula rows never feed the Σ row or sum-safe rounding (no double counting)
        if (cfg.formulaRows.trim()) {
            // lookup over the FULL tree (not just visible rows) so a formula keeps
            // its value when the branch containing its operands is collapsed;
            // document order → a branch aggregate wins over a same-named leaf
            const byLabel = new Map<string, DataPoint>();
            for (const p of (allPts.length > 0 ? allPts : rows.map(r => r.p))) {
                const kk = p.cat.trim().toLowerCase();
                if (!byLabel.has(kk)) { byLabel.set(kk, p); }
            }
            const FIELDS = ["ac", "py", "pl", "fc", "value", "basis"] as const;
            type Agg = { [f in typeof FIELDS[number]]: number | null };
            const evalSum = (expr: string): Agg | null => {
                // " + " prefix gives the first operand an explicit sign, then split
                // on space-padded +/− only (labels keep their inner hyphens)
                const parts = (`+ ${expr.trim()}`).split(/\s*([+\-−])\s+/).filter(t => t.trim());
                if (parts.length < 2 || parts.length % 2 !== 0) { return null; }
                const acc: Agg = { ac: null, py: null, pl: null, fc: null, value: null, basis: null };
                // strict null semantics: one operand missing a scenario → that
                // scenario is null in the result (a difference with an implicit 0
                // would show a wildly wrong Δ instead of no Δ)
                const dead = new Set<string>();
                for (let ti = 0; ti < parts.length; ti += 2) {
                    const sign = parts[ti] === "+" ? 1 : -1;
                    const src = byLabel.get(parts[ti + 1].trim().toLowerCase());
                    if (!src || isPct(src)) { return null; }
                    for (const f of FIELDS) {
                        const v = src[f];
                        if (v == null) { dead.add(f); acc[f] = null; }
                        else if (!dead.has(f)) { acc[f] = (acc[f] ?? 0) + sign * v; }
                    }
                }
                return acc;
            };
            const pctOf = (a: number | null, b: number | null) =>
                (a != null && b != null && b !== 0) ? (a / b) * 100 : null;
            const blank = {
                catLevels: null, isFc: false, bm: null, fcPrev: null, lineVal: null,
                stackSeries: null, comment: null, commentNo: null,
                group: points[0].group, isRest: false, sel: null
            };
            for (const entry of cfg.formulaRows.split(/[;\n]/)) {
                const eq = entry.indexOf("=");
                if (eq < 1) { continue; }
                const label = entry.slice(0, eq).trim();
                const expr = entry.slice(eq + 1).trim();
                if (!label || !expr) { continue; }
                const ratio = expr.split(/\s\/\s/);
                let fp: DataPoint | null = null;
                if (ratio.length === 2) {
                    const num = evalSum(ratio[0]), den = evalSum(ratio[1]);
                    if (!num || !den) { continue; }
                    const value = pctOf(num.value, den.value);
                    const py = pctOf(num.py, den.py), pl = pctOf(num.pl, den.pl);
                    const basis = pctOf(num.basis, den.basis);
                    const b2 = this.basis2Mode === "plan" ? pl : py;
                    fp = {
                        ...blank, cat: label, ac: pctOf(num.ac, den.ac), py, pl,
                        fc: pctOf(num.fc, den.fc), value, basis,
                        // margin rows compare in percentage POINTS (pp), like GuV
                        varAbs: (value != null && basis != null) ? value - basis : null,
                        varRel: null,
                        var2Abs: (value != null && b2 != null) ? value - b2 : null,
                        var2Rel: null, rowType: "pct"
                    };
                } else if (ratio.length === 1) {
                    const a = evalSum(expr);
                    if (!a) { continue; }
                    const varAbs = (a.value != null && a.basis != null) ? a.value - a.basis : null;
                    const b2 = this.basis2Mode === "plan" ? a.pl : a.py;
                    const var2Abs = (a.value != null && b2 != null) ? a.value - b2 : null;
                    fp = {
                        ...blank, cat: label, ac: a.ac, py: a.py, pl: a.pl, fc: a.fc,
                        value: a.value, basis: a.basis, varAbs,
                        varRel: (varAbs != null && a.basis != null && a.basis !== 0)
                            ? (varAbs / Math.abs(a.basis)) * 100 : null,
                        var2Abs,
                        var2Rel: (var2Abs != null && b2 != null && b2 !== 0)
                            ? (var2Abs / Math.abs(b2)) * 100 : null,
                        rowType: "sum"
                    };
                }
                if (!fp) { continue; }
                rows.push({ p: fp, depth: 0, formula: true });
                // later formulas may build on earlier ones ("Marge = Rohertrag / Umsatz")
                const kk = label.toLowerCase();
                if (!byLabel.has(kk)) { byLabel.set(kk, fp); }
            }
        }

        // visual-computed grand total (Σ): only when the data brings no sum rows
        // of its own and no running totals are active (cumulative IS a total)
        let totalRow: TableRow | null = null;
        if (cfg.showTotal && !cfg.cumulative && !points.some(p => isSum(p) || isResult(p))) {
            const base = rows.filter(r => r.depth === 0 && !r.formula
                && !isPct(r.p) && !isResult(r.p) && !isSkip(r.p)).map(r => r.p);
            if (base.length > 1) {
                const tp = this.aggregateHierarchy(this.locStr("Label_Total", "Σ Total"), base);
                tp.rowType = "sum";
                totalRow = { p: tp, depth: 0, isTotal: true };
            }
        }
        // hidden rows: display-only removal AFTER Σ/formulas/scales are computed —
        // the numbers stay honest, only the line disappears. Hiding a parent
        // hides its whole subtree
        if (cfg.hideSet.size > 0) {
            const out: TableRow[] = [];
            let hideBelow = -1;
            for (const r of rows) {
                if (hideBelow >= 0 && r.depth > hideBelow) { continue; }
                hideBelow = -1;
                if (cfg.hideSet.has(r.p.cat.trim().toLowerCase())) {
                    hideBelow = r.depth;
                    continue;
                }
                out.push(r);
            }
            rows = out;
        }
        // live 🔍 filter (interactive only): display-only like hiding — Σ stays full
        const searchActive = searchOn;
        if (searchActive) { rows = this.applySearch(rows, r => r.p.cat); }
        // no match: drop the Σ row too and show a hint instead of a ballooning total
        const noMatch = searchActive && rows.length === 0;
        if (noMatch) { totalRow = null; }
        const rowPts = rows.map(r => r.p).concat(totalRow ? [totalRow.p] : []);
        const n = Math.max(1, rows.length + (totalRow ? 1 : 0));

        const hasVar = rowPts.some(p => p.varAbs != null);
        const hasVar2 = cfg.showDual && rowPts.some(p => p.var2Abs != null);
        const showPct = cfg.showRel && hasVar;

        // ------- column layout: fixed text columns, graphic columns share the rest
        const chevW = hasLevels ? 14 * k : 0;
        const nameW = this.tableNameW != null
            ? Math.max(40, Math.min(region.w * 0.5, this.tableNameW))
            : Math.min(region.w * 0.26,
                this.maxTextWidth(rowPts.map(p => p.cat), cf) + 18 + chevW);
        const valW = lf * 4.8;
        const dValW = hasVar ? lf * 4.6 : 0;
        const d2ValW = hasVar2 ? lf * 4.6 : 0;
        // Δ2 % has no graphic pin — it is always a numeric column when dual is on
        const d2PctValW = hasVar2 && cfg.showRel ? lf * 4.2 : 0;
        // optional numeric reference columns (print/board-ready tables): the
        // variance basis or both scenarios, next to the AC number
        type VCol = { key: string; label: string; get: (p: DataPoint) => number | null };
        const extraCols: VCol[] = [];
        if (cfg.valueCols === "basis" && rowPts.some(p => p.basis != null)) {
            extraCols.push({ key: "bval", label: cfg.basisLabel, get: p => p.basis });
        } else if (cfg.valueCols === "all") {
            if (cfg.hasPy) { extraCols.push({ key: "pyval", label: "PY", get: p => p.py }); }
            if (cfg.hasPl) { extraCols.push({ key: "plval", label: "PL", get: p => p.pl }); }
        }
        const gap = 10;
        // never let the fixed numeric columns overflow narrow tiles — drop the
        // reference columns first (nice-to-have; the AC number column is not)
        while (extraCols.length > 0
            && nameW + valW * (1 + extraCols.length) + dValW + d2ValW + d2PctValW
                > region.w - pad * 2 - gap * 4 - 80 * k) {
            extraCols.pop();
        }
        let fixed = nameW + valW + dValW + d2ValW + d2PctValW + extraCols.length * valW;
        type GCol = { key: "bars" | "dbar" | "pct" | "d2bar"; min: number; w: number };
        const wanted: GCol[] = [];
        // the AC bar cell is useful even without any comparison basis (plain lists)
        if (cfg.showAbs || cfg.hasPy || cfg.hasPl || rowPts.some(p => p.value != null)) {
            wanted.push({ key: "bars", min: 110 * k, w: 0 });
        }
        if (hasVar && cfg.showAbs) { wanted.push({ key: "dbar", min: 80 * k, w: 0 }); }
        if (showPct) { wanted.push({ key: "pct", min: 95 * k, w: 0 }); }
        if (hasVar2) { wanted.push({ key: "d2bar", min: 80 * k, w: 0 }); }
        // greedily keep graphic columns while the leftover width fits their minimums
        const graphic: GCol[] = [];
        const runGreedy = () => {
            graphic.length = 0;
            for (const c of wanted) {
                const need = graphic.reduce((a, g) => a + g.min, 0) + c.min;
                const leftover = region.w - pad * 2 - fixed - gap * (graphic.length + 3);
                if (need <= leftover) { graphic.push(c); }
            }
        };
        runGreedy();
        // Δ% must never disappear entirely: when the pin column is dropped, a
        // numeric Δ% column takes its place (second pass with the extra width)
        let dPctValW = 0;
        if (showPct && !graphic.find(g => g.key === "pct")) {
            dPctValW = lf * 4.2;
            fixed += dPctValW;
            runGreedy();
        }
        const spare = region.w - pad * 2 - fixed - gap * (graphic.length + 3)
            - graphic.reduce((a, g) => a + g.min, 0);
        for (const g of graphic) {
            g.w = g.min + (graphic.length > 0 ? spare / graphic.length : 0);
        }
        const colX: { [key: string]: { x: number; w: number } } = {};
        let x = region.x + pad;
        colX["name"] = { x, w: nameW }; x += nameW + gap;
        colX["val"] = { x, w: valW }; x += valW + gap;
        for (const c of extraCols) { colX[c.key] = { x, w: valW }; x += valW + gap; }
        const barsCol = graphic.find(g => g.key === "bars");
        if (barsCol) { colX["bars"] = { x, w: barsCol.w }; x += barsCol.w + gap; }
        if (hasVar) { colX["dval"] = { x, w: dValW }; x += dValW + gap; }
        const dbarCol = graphic.find(g => g.key === "dbar");
        if (dbarCol) { colX["dbar"] = { x, w: dbarCol.w }; x += dbarCol.w + gap; }
        const pctCol = graphic.find(g => g.key === "pct");
        if (pctCol) { colX["pct"] = { x, w: pctCol.w }; x += pctCol.w + gap; }
        if (dPctValW > 0) { colX["dpctval"] = { x, w: dPctValW }; x += dPctValW + gap; }
        if (hasVar2) { colX["d2val"] = { x, w: d2ValW }; x += d2ValW + gap; }
        if (d2PctValW > 0) { colX["d2pctval"] = { x, w: d2PctValW }; x += d2PctValW + gap; }
        const d2barCol = graphic.find(g => g.key === "d2bar");
        if (d2barCol) { colX["d2bar"] = { x, w: d2barCol.w }; }

        // ------- row layout + shared scales; the Σ row is pinned as last visible row
        const headerH = Math.round(cf + 12);
        const rowH = Math.max(cf + 6, (region.h - pad * 2 - headerH) / n);
        const top = region.y + pad + headerH;
        // epsilon guards the FP edge where avail/n rounds up in rowH and
        // avail/rowH lands at n−ε — all rows fit, no scrollbar wanted
        const maxRows = Math.floor((region.h - pad * 2 - headerH) / rowH + 1e-6);
        const bodyCap = Math.max(1, maxRows - (totalRow ? 1 : 0));
        // vertical scrolling (interactive only): header and Σ row stay frozen, the
        // body rows scroll by wheel or thumb drag — export/print keeps the old
        // top-anchored truncation so nothing moves in a rendered report
        const paneKey = points[0].group ?? "";
        const maxScroll = Math.max(0, rows.length - bodyCap);
        const canScroll = this.allowInteractions && maxScroll > 0;
        const scroll = canScroll
            ? Math.max(0, Math.min(this.tableScroll.get(paneKey) ?? 0, maxScroll))
            : 0;
        if (canScroll) { this.tableScroll.set(paneKey, scroll); }
        const bodyRows = rows.slice(scroll, scroll + bodyCap);
        const shown = totalRow ? [...bodyRows, totalRow] : bodyRows;

        // margin rows (rowType "pct") carry percentages, skip rows are excluded
        // from totals — keep both out of the € scales. Scales use the FULL tree
        // (also collapsed branches) so expanding a branch never rescales the bars
        const scalePts = allPts.length > 0
            ? allPts.concat(rows.filter(r => r.formula).map(r => r.p),
                totalRow ? [totalRow.p] : [])
            : rowPts;
        // rows with a per-row number format are a different unit/magnitude (Stück,
        // %, ‰) — keep them out of the shared € scales as well
        const hasRowFmt = (p: DataPoint) => cfg.rowFmt.has(p.cat.trim().toLowerCase());
        const numPts = scalePts.filter(p => !isPct(p) && !isSkip(p) && !hasRowFmt(p));
        const barDomain = extent(numPts.flatMap(p => [p.value, p.py, p.pl]));
        // IBCS scale sync: share the deck-wide domains so multiple tables (and
        // small-multiples tiles) on a page use identical scales incl. fixedMax
        barDomain[0] = Math.min(barDomain[0], cfg.mainDomain[0]);
        barDomain[1] = Math.max(barDomain[1], cfg.mainDomain[1]);
        const dDomain = Math.max(...numPts.map(p => Math.abs(p.varAbs ?? 0)),
            Math.abs(cfg.varDomain[0]), Math.abs(cfg.varDomain[1]), 1);
        const d2Domain = Math.max(...numPts.map(p => Math.abs(p.var2Abs ?? 0)), 1);
        const maxPct = Math.max(...numPts.map(p => Math.abs(p.varRel ?? 0)), 1);

        const bg = this.el("g", {}, this.svg);
        const marks = this.el("g", {}, this.svg);
        const goodOf = (v: number, pp?: DataPoint | null) => cfg.isGood(v, pp);
        const colOf = (v: number, pp?: DataPoint) => (v === 0 || (pp != null && !cfg.isMaterial(pp)))
            ? cfg.colors.py : (goodOf(v, pp) ? cfg.colors.good : cfg.colors.bad);
        const colOf2 = (v: number, pp: DataPoint) => (v === 0 || !cfg.isMaterial(pp, pp.var2Abs, pp.var2Rel))
            ? cfg.colors.py : (goodOf(v, pp) ? cfg.colors.good : cfg.colors.bad);
        const txt = (xx: number, yy: number, text: string, anchor: string, font: number,
            bold: boolean, color: string, parent: SVGElement) => {
            const t = this.el("text", {
                x: xx, y: yy, "text-anchor": anchor, "font-size": font, fill: color,
                "font-family": FONT, "font-weight": bold ? 700 : 400
            }, parent);
            t.textContent = text;
            return t;
        };

        // ------- header row (column titles)
        const hFont = Math.round(10 * k);
        const hy = region.y + pad + hFont + 2;
        const scen = ["AC", cfg.hasPy ? "PY" : "", cfg.hasPl ? "PL" : ""].filter(v => v).join(" · ");
        // expand/collapse all: header chevron in front of the name column —
        // uses ALL branch keys (also inside collapsed parents) so every level opens
        if (hasLevels && allParentKeys.length > 0 && this.allowInteractions) {
            const allOpen = allParentKeys.every(kk => this.expandedRows.has(kk));
            const label = allOpen
                ? this.locStr("Btn_CollapseAll", "Collapse all")
                : this.locStr("Btn_ExpandAll", "Expand all");
            const ch = txt(colX["name"].x, hy, allOpen ? "▾▾" : "▸▸", "start", hFont, true, cfg.subtle, bg);
            const tip = this.el("title", {}, ch);
            tip.textContent = label;
            ch.setAttribute("role", "button");
            ch.setAttribute("aria-label", label);
            ch.style.cursor = "pointer";
            ch.addEventListener("click", (e: MouseEvent) => {
                e.stopPropagation();
                if (allOpen) { allParentKeys.forEach(kk => this.expandedRows.delete(kk)); }
                else { allParentKeys.forEach(kk => this.expandedRows.add(kk)); }
                this.persistTableExpanded();
                this.rerender();
            });
        }
        // 🔍 live filter control next to the expand-all chevron
        this.drawSearchControl(bg, colX["name"].x + (hasLevels ? Math.round(24 * k) : 0), hy, cfg);
        // sortable headers: ▲/▼ marker on the active column, click cycles
        // desc → asc → data order; persisted (bookmarkable), off while cumulating
        const marker = (key: string) => sortKey === key ? (sortDir === "asc" ? " ▲" : " ▼") : "";
        const sortHit = (key: string, col: { x: number; w: number }) => {
            if (!this.allowInteractions || cfg.cumulative) { return; }
            const r = this.el("rect", {
                x: col.x - 2, y: region.y + pad, width: col.w + 4, height: headerH - 2,
                fill: cfg.paper, "fill-opacity": 0.01, role: "button", tabindex: "0"
            }, bg) as SVGElement;
            const tip = this.el("title", {}, r);
            tip.textContent = this.locStr("Btn_SortHeader", "Sort by this column (click again: ascending / off)");
            r.setAttribute("aria-label", tip.textContent);
            (r as unknown as SVGGraphicsElement).style.cursor = "pointer";
            const cycle = () => {
                const next = this.tableSort === `${key}_desc` ? `${key}_asc`
                    : this.tableSort === `${key}_asc` ? "" : `${key}_desc`;
                this.tableSort = next;
                this.pendingTableSort = next;
                this.host.persistProperties({
                    merge: [{ objectName: "chart", selector: null, properties: { tableSort: next } }]
                });
                this.rerender();
            };
            r.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); cycle(); });
            r.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key !== "Enter" && e.key !== " ") { return; }
                e.preventDefault(); e.stopPropagation(); cycle();
            });
        };
        txt(colX["val"].x + colX["val"].w, hy, `AC${marker("ac")}`, "end", hFont, true, cfg.subtle, bg);
        sortHit("ac", colX["val"]);
        for (const c of extraCols) {
            txt(colX[c.key].x + colX[c.key].w, hy, c.label, "end", hFont, true, cfg.subtle, bg);
        }
        if (colX["bars"] && scen !== "AC") { txt(colX["bars"].x + 2, hy, scen, "start", hFont, true, cfg.subtle, bg); }
        if (colX["dval"]) {
            txt(colX["dval"].x + colX["dval"].w, hy, `Δ${cfg.basisLabel}${marker("dabs")}`, "end", hFont, true, cfg.subtle, bg);
            sortHit("dabs", colX["dval"]);
        }
        if (colX["pct"]) {
            txt(colX["pct"].x + colX["pct"].w / 2, hy, `Δ${cfg.basisLabel} %${marker("drel")}`, "middle", hFont, true, cfg.subtle, bg);
            sortHit("drel", colX["pct"]);
        }
        if (colX["dpctval"]) {
            txt(colX["dpctval"].x + colX["dpctval"].w, hy, `Δ${cfg.basisLabel} %${marker("drel")}`, "end", hFont, true, cfg.subtle, bg);
            sortHit("drel", colX["dpctval"]);
        }
        if (colX["d2val"]) {
            txt(colX["d2val"].x + colX["d2val"].w, hy, `Δ${cfg.basis2Label}${marker("d2abs")}`, "end", hFont, true, cfg.subtle, bg);
            sortHit("d2abs", colX["d2val"]);
        }
        if (colX["d2pctval"]) { txt(colX["d2pctval"].x + colX["d2pctval"].w, hy, `Δ${cfg.basis2Label} %`, "end", hFont, true, cfg.subtle, bg); }
        this.el("line", {
            x1: region.x + pad, y1: top - 2, x2: region.x + region.w - pad, y2: top - 2,
            stroke: cfg.ink, "stroke-width": 1.2
        }, bg);

        // search with no hits: hint instead of an empty body (Σ was dropped above)
        if (noMatch) {
            txt(region.x + pad, top + cf + 4,
                this.locStr("Table_NoMatch", "No rows match the search"),
                "start", Math.round(cf * 0.95), false, cfg.subtle, bg);
            return;
        }

        // ------- shared axes for the graphic columns
        const barScale = colX["bars"]
            ? linearScale(Math.min(barDomain[0], 0), Math.max(barDomain[1], 1), colX["bars"].x + 2, colX["bars"].x + colX["bars"].w - 2)
            : null;
        const rowsBottom = top + shown.length * rowH;
        // draggable name-column edge (persisted width)
        this.drawNameResize(bg, colX["name"].x + colX["name"].w + gap / 2,
            region.y + pad, rowsBottom, region, cfg);
        if (barScale && Math.min(barDomain[0], 0) < 0) {
            this.el("line", {
                x1: barScale(0), y1: top, x2: barScale(0), y2: rowsBottom,
                stroke: cfg.subtle, "stroke-width": 1
            }, bg);
        }
        const dAxis = colX["dbar"] ? colX["dbar"].x + colX["dbar"].w / 2 : 0;
        if (colX["dbar"]) {
            this.el("rect", { x: dAxis - 1, y: top, width: 2, height: rowsBottom - top, fill: cfg.colors.py }, bg);
        }
        const pctAxis = colX["pct"] ? colX["pct"].x + colX["pct"].w / 2 : 0;
        if (colX["pct"]) {
            this.el("rect", { x: pctAxis - 1, y: top, width: 2, height: rowsBottom - top, fill: cfg.colors.py }, bg);
        }
        const d2Axis = colX["d2bar"] ? colX["d2bar"].x + colX["d2bar"].w / 2 : 0;
        if (colX["d2bar"]) {
            this.el("rect", { x: d2Axis - 1, y: top, width: 2, height: rowsBottom - top, fill: cfg.colors.py }, bg);
        }

        // sum-safe rounding: adjust the level-0 detail labels (largest remainder)
        // so they visibly add up to the synthetic Σ row
        // hidden/filtered rows would break the largest-remainder identity (their
        // share is in Σ but not on screen) — sum-safe only with all rows visible
        const sumSafeVals = (cfg.sumSafe && !cfg.cumulative && totalRow
            && cfg.hideSet.size === 0 && !searchActive)
            ? (() => {
                const base = rows.filter(r => r.depth === 0 && !r.formula && !isPct(r.p)
                    && !isSum(r.p) && !isResult(r.p) && !isSkip(r.p)).map(r => r.p);
                const adj = this.sumSafeAdjust(base.map(q => q.value), cfg.fmtUnit, cfg.fmtPrec);
                const m = new Map<DataPoint, number | null>();
                base.forEach((q, ix) => m.set(q, adj[ix]));
                const div = cfg.fmtUnit || 1, f = Math.pow(10, cfg.fmtPrec);
                if (totalRow.p.value != null) {
                    m.set(totalRow.p, Math.round((totalRow.p.value / div) * f) / f * div);
                }
                return m;
            })()
            : null;

        // ------- rows
        shown.forEach((row, i) => {
            const p = row.p;
            const isParent = row.parentKey != null;
            const y = top + i * rowH;
            const yMid = y + rowH / 2;
            const sum = isSum(p) || isParent || isResult(p);
            const skip = isSkip(p);
            // per-row number format (mixed €/%/Stück tables) — value columns only
            const rf = cfg.rowFmt.get(p.cat.trim().toLowerCase());
            // chart list: when filled, bar/pin graphics render only on listed rows
            // (numbers always stay); the Σ row keeps its graphics. Rows with a
            // custom format are a different unit — no shared-scale graphics
            const rowChart = (cfg.chartSet.size === 0 || row.isTotal
                || cfg.chartSet.has(p.cat.trim().toLowerCase())) && rf == null;
            const g = this.el("g", { "class": "icd-cat" }, marks) as SVGGElement;

            // separators: subtle under every row, strong above subtotals
            this.el("line", {
                x1: region.x + pad, y1: y + rowH, x2: region.x + region.w - pad, y2: y + rowH,
                stroke: cfg.subtle, "stroke-width": 0.6, "stroke-opacity": 0.4
            }, bg);
            if (isAnchor(p)) {
                this.el("line", {
                    x1: region.x + pad, y1: y, x2: region.x + region.w - pad, y2: y,
                    stroke: cfg.ink, "stroke-width": 1.2
                }, bg);
            }
            if (cfg.highlight.has(p.cat.toLowerCase())) {
                this.el("rect", {
                    x: region.x + pad, y: y + 1, width: region.w - pad * 2, height: rowH - 2,
                    fill: cfg.hc ? "none" : cfg.ink, "fill-opacity": cfg.hc ? 0 : 0.07,
                    stroke: cfg.hc ? cfg.ink : "none", "stroke-width": cfg.hc ? 1 : 0
                }, bg);
            }

            const rowFont = Math.min(cf, rowH - 4);
            // "davon:"-style indent list: extra indent + subtle ink, no hierarchy field
            const davon = cfg.indentSet.has(p.cat.trim().toLowerCase());
            const indentX = (row.depth + (davon ? 1 : 0)) * Math.round(14 * k);
            const nameText = isParent
                ? `${row.expanded ? "▾" : "▸"} ${p.cat}`
                : p.cat;
            const nameEl = txt(colX["name"].x + (sum && row.depth === 0 && !davon ? 0 : Math.round(6 * k)) + indentX,
                yMid + rowFont * 0.35,
                this.truncate(nameText, colX["name"].w - 8 - indentX, rowFont),
                "start", rowFont, sum && !davon, skip || davon ? cfg.subtle : cfg.ink, g);
            if (skip) { nameEl.setAttribute("font-style", "italic"); }
            const rowPct = isPct(p);
            const pctText = (v: number) => new Intl.NumberFormat(this.host.locale, {
                minimumFractionDigits: 1, maximumFractionDigits: 1
            }).format(v) + " %";
            const ppText = (v: number) => (v > 0 ? "+" : v < 0 ? "−" : "")
                + new Intl.NumberFormat(this.host.locale, {
                    minimumFractionDigits: 1, maximumFractionDigits: 1
                }).format(Math.abs(v)) + "Pp";
            if (p.value != null && cfg.showLabels) {
                const shownVal = sumSafeVals?.has(p) ? sumSafeVals.get(p) as number : p.value;
                txt(colX["val"].x + colX["val"].w, yMid + rowFont * 0.35,
                    rowPct ? pctText(p.value) : rf ? rf(shownVal) : cfg.fmt.format(shownVal),
                    "end", rowFont, sum, rowPct || skip ? cfg.subtle : cfg.ink, g);
            }
            // numeric reference columns (PY/PL or the variance basis)
            if (cfg.showLabels) {
                for (const c of extraCols) {
                    const v = c.get(p);
                    if (v == null) { continue; }
                    txt(colX[c.key].x + colX[c.key].w, yMid + rowFont * 0.35,
                        rowPct ? pctText(v) : rf ? rf(v) : cfg.fmt.format(v),
                        "end", rowFont, sum, cfg.subtle, g);
                }
            }

            // AC·PY·PL bar cell (shared scale across all rows — IBCS);
            // margin rows are percentages and get no € graphics
            if (barScale && !rowPct && rowChart) {
                const zero = barScale(0);
                const barCell = (v: number, h: number, off: number, style: Record<string, string | number>) => {
                    const e = barScale(v);
                    this.el("rect", {
                        x: Math.min(zero, e), y: y + rowH * off,
                        width: Math.max(Math.abs(e - zero), 1), height: h, ...style
                    }, g);
                };
                const pyH = Math.max(2, rowH * 0.26), acH = Math.max(3, rowH * 0.42);
                if (p.py != null) {
                    if (cfg.pyTriangle) {
                        // triangle above the AC bar at PY level (three-scenario notation);
                        // scaled to the row height so it stays subtle in dense tables
                        this.drawPyTriangle(g, y + rowH * 0.36, rowH * 0.55, p.py, barScale, "bars", cfg);
                    } else {
                        barCell(p.py, pyH, 0.12, cfg.hc
                            ? { fill: cfg.paper, stroke: cfg.colors.py, "stroke-width": 1, "stroke-dasharray": "3,2" }
                            : { fill: cfg.colors.py });
                    }
                }
                if (p.pl != null) {
                    barCell(p.pl, acH, 0.30, { fill: cfg.paper, stroke: cfg.colors.pl, "stroke-width": 1.2 });
                }
                if (p.value != null) {
                    barCell(p.value, acH, 0.36, p.isFc
                        ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1 }
                        : { fill: cfg.colors.ac });
                    if (p.isPrelim && !p.isFc) {
                        // preliminary actual: thin paper hatch over the solid bar
                        barCell(p.value, acH, 0.36, { fill: `url(#${cfg.patPrelim})` });
                    }
                }
                if (p.bm != null) {
                    const bx = barScale(p.bm);
                    this.el("rect", {
                        x: bx - 1.2, y: y + rowH * 0.22, width: 2.4, height: rowH * 0.56,
                        fill: cfg.ink
                    }, g);
                }
            }

            // ΔBasis: number + bar (margin rows show percentage points instead);
            // formatted rows show the delta in their own unit (signed)
            if (p.varAbs != null && colX["dval"] && cfg.showLabels) {
                const dTxt = rowPct ? ppText(p.varAbs)
                    : rf ? (p.varAbs > 0 ? "+" : p.varAbs < 0 ? "−" : "") + rf(Math.abs(p.varAbs))
                    : this.fmtSigned(cfg.fmtVar, p.varAbs);
                txt(colX["dval"].x + colX["dval"].w, yMid + rowFont * 0.35,
                    dTxt, "end", rowFont, sum,
                    p.varAbs === 0 ? cfg.subtle : colOf(p.varAbs, p), g);
            }
            // numeric Δ% fallback column (pin column dropped on narrow tiles)
            if (p.varRel != null && colX["dpctval"] && !rowPct && cfg.showLabels) {
                txt(colX["dpctval"].x + colX["dpctval"].w, yMid + rowFont * 0.35,
                    this.fmtPercent(p.varRel), "end", rowFont, sum,
                    p.varRel === 0 ? cfg.subtle : colOf(p.varRel, p), g);
            }
            if (p.varAbs != null && colX["dbar"] && !rowPct && rowChart) {
                const len = Math.abs(p.varAbs) / dDomain * (colX["dbar"].w / 2 - 4);
                const h = Math.max(3, rowH * 0.42);
                const c = colOf(p.varAbs, p);
                const hollowBad = cfg.hc && !goodOf(p.varAbs, p) && p.varAbs !== 0;
                this.el("rect", {
                    x: p.varAbs >= 0 ? dAxis + 1 : dAxis - 1 - len, y: yMid - h / 2,
                    width: Math.max(len, 1), height: h,
                    ...(hollowBad
                        ? { fill: cfg.paper, stroke: c, "stroke-width": 1.2 }
                        : p.isFc && cfg.isMaterial(p)
                            ? { fill: `url(#${goodOf(p.varAbs, p) ? cfg.patGood : cfg.patBad})`, stroke: c, "stroke-width": 1 }
                            : { fill: c })
                }, g);
            }

            // ΔBasis %: pin with label (margin rows: pp is already in the Δ column);
            // rows outside the chart list keep the plain Δ%-number, just no pin
            if (p.varRel != null && colX["pct"] && !rowPct && !rowChart && cfg.showLabels) {
                txt(pctAxis, yMid + rowFont * 0.35, this.fmtPercent(p.varRel),
                    "middle", Math.round(rowFont * 0.92), sum, colOf(p.varRel, p), g);
            }
            if (p.varRel != null && colX["pct"] && !rowPct && rowChart) {
                const len = Math.abs(p.varRel) / maxPct * (colX["pct"].w / 2 - lf * 3);
                const c = colOf(p.varRel, p);
                const r = Math.max(2.4, 3 * k);
                const dir = p.varRel >= 0 ? 1 : -1;
                const endX = pctAxis + dir * Math.max(len, 2);
                this.el("line", { x1: pctAxis, y1: yMid, x2: endX, y2: yMid, stroke: c, "stroke-width": 2 }, g);
                this.el("rect", {
                    x: endX - r, y: yMid - r, width: 2 * r, height: 2 * r,
                    fill: p.isFc ? cfg.paper : cfg.ink, stroke: cfg.ink, "stroke-width": p.isFc ? 1 : 0
                }, g);
                if (cfg.showLabels) {
                    txt(endX + dir * (r + 4), yMid + rowFont * 0.35, this.fmtPercent(p.varRel),
                        dir > 0 ? "start" : "end", Math.round(rowFont * 0.92), sum, cfg.ink, g);
                }
            }

            // ΔBasis2 (dual): number + Δ2 % number + bar (same notation as ΔBasis)
            if (hasVar2 && p.var2Abs != null && colX["d2val"] && cfg.showLabels) {
                txt(colX["d2val"].x + colX["d2val"].w, yMid + rowFont * 0.35,
                    rowPct ? ppText(p.var2Abs) : this.fmtSigned(cfg.fmtVar, p.var2Abs), "end", rowFont, sum,
                    p.var2Abs === 0 ? cfg.subtle : colOf2(p.var2Abs, p), g);
            }
            if (hasVar2 && p.var2Rel != null && colX["d2pctval"] && !rowPct && cfg.showLabels) {
                txt(colX["d2pctval"].x + colX["d2pctval"].w, yMid + rowFont * 0.35,
                    this.fmtPercent(p.var2Rel), "end", rowFont, sum,
                    p.var2Rel === 0 ? cfg.subtle : colOf2(p.var2Rel, p), g);
            }
            if (hasVar2 && p.var2Abs != null && colX["d2bar"] && !rowPct && rowChart) {
                const len = Math.abs(p.var2Abs) / d2Domain * (colX["d2bar"].w / 2 - 4);
                const h = Math.max(3, rowH * 0.42);
                const c2 = colOf2(p.var2Abs, p);
                const hollowBad2 = cfg.hc && !goodOf(p.var2Abs, p) && p.var2Abs !== 0;
                this.el("rect", {
                    x: p.var2Abs >= 0 ? d2Axis + 1 : d2Axis - 1 - len, y: yMid - h / 2,
                    width: Math.max(len, 1), height: h,
                    ...(hollowBad2
                        ? { fill: cfg.paper, stroke: c2, "stroke-width": 1.2 }
                        : p.isFc && cfg.isMaterial(p, p.var2Abs, p.var2Rel)
                            ? { fill: `url(#${goodOf(p.var2Abs, p) ? cfg.patGood : cfg.patBad})`, stroke: c2, "stroke-width": 1 }
                            : { fill: c2 })
                }, g);
            }

            // comment marker number, if bound
            if (p.commentNo != null) {
                txt(colX["name"].x + colX["name"].w - 4, yMid + rowFont * 0.35,
                    `(${p.commentNo})`, "end", Math.round(rowFont * 0.85), false, cfg.subtle, g);
            }

            // full-width transparent hit area so the whole row is clickable
            this.el("rect", {
                x: region.x + pad, y, width: region.w - pad * 2, height: rowH,
                fill: cfg.paper, "fill-opacity": 0.01
            }, g);

            this.attachInteraction(g, p, cfg);
            if (isParent) {
                // clicking a parent row toggles its children (crossfilter stays on the
                // child rows — the parent's sel is null, so attachInteraction is inert)
                g.setAttribute("aria-expanded", String(!!row.expanded));
                const key = row.parentKey as string;
                const toggle = () => {
                    if (this.expandedRows.has(key)) { this.expandedRows.delete(key); }
                    else { this.expandedRows.add(key); }
                    this.persistTableExpanded();
                    this.rerender();
                };
                // comment mode wins: attachInteraction opens the editor on this row,
                // the expand toggle would immediately re-render and close it again
                g.addEventListener("click", (e: MouseEvent) => {
                    e.stopPropagation();
                    if (this.commentEdit || this.structureEdit) { return; }
                    toggle();
                });
                g.addEventListener("keydown", (e: KeyboardEvent) => {
                    if (e.key !== "Enter" && e.key !== " ") { return; }
                    e.preventDefault(); e.stopPropagation();
                    if (this.commentEdit || this.structureEdit) { return; }
                    toggle();
                });
            }
            this.catGroups.push({ g, sel: p.sel });
            this.animGroups.push([g]);
        });

        const hiddenRows = rows.length - bodyRows.length;
        if (canScroll) {
            // slim scrollbar at the right edge: wheel anywhere over the table or
            // drag the thumb; state is per tile and transient (not persisted)
            const trackX = region.x + region.w - 4;
            const trackH = rowsBottom - top;
            this.el("rect", {
                x: trackX, y: top, width: 3, height: trackH, rx: 1.5,
                fill: cfg.subtle, "fill-opacity": 0.18
            }, bg);
            const thumbH = Math.max(Math.min(18, trackH), trackH * bodyCap / rows.length);
            const thumbY = top + (trackH - thumbH) * (scroll / maxScroll);
            const thumb = this.el("rect", {
                x: trackX - 1, y: thumbY, width: 5, height: thumbH, rx: 2.5,
                fill: cfg.subtle, "fill-opacity": 0.75, role: "scrollbar", tabindex: "0",
                "aria-valuemin": 0, "aria-valuemax": maxScroll, "aria-valuenow": scroll,
                "aria-orientation": "vertical",
                "aria-label": this.locStr("Table_Scroll", "Scroll rows")
            }, this.svg) as SVGGraphicsElement;
            thumb.style.cursor = "grab";
            const setScroll = (next: number) => {
                const cl = Math.max(0, Math.min(Math.round(next), maxScroll));
                if (cl === (this.tableScroll.get(paneKey) ?? 0)) { return; }
                this.tableScroll.set(paneKey, cl);
                this.rerender();
            };
            const onWheel = (e: WheelEvent) => {
                e.preventDefault();
                e.stopPropagation();
                const mag = Math.max(1, Math.min(bodyCap, Math.round(Math.abs(e.deltaY) / 50)));
                setScroll((this.tableScroll.get(paneKey) ?? 0) + (e.deltaY > 0 ? mag : -mag));
            };
            bg.addEventListener("wheel", onWheel, { passive: false });
            marks.addEventListener("wheel", onWheel, { passive: false });
            thumb.addEventListener("mousedown", (e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                const startY = e.clientY, startScroll = scroll;
                const move = (ev: MouseEvent) => {
                    setScroll(startScroll + (ev.clientY - startY) / trackH * rows.length);
                };
                const up = () => {
                    window.removeEventListener("mousemove", move);
                    window.removeEventListener("mouseup", up);
                };
                window.addEventListener("mousemove", move);
                window.addEventListener("mouseup", up);
            });
            thumb.addEventListener("keydown", (e: KeyboardEvent) => {
                const step = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1
                    : e.key === "PageDown" ? bodyCap : e.key === "PageUp" ? -bodyCap : 0;
                if (step === 0) { return; }
                e.preventDefault();
                e.stopPropagation();
                setScroll((this.tableScroll.get(paneKey) ?? 0) + step);
            });
        } else if (hiddenRows > 0) {
            txt(region.x + pad, rowsBottom + cf,
                `… ${hiddenRows} ${this.locStr("Hint_MoreRows", "more rows (increase the visual height)")}`,
                "start", Math.round(cf * 0.9), false, cfg.subtle, bg);
        }
    }

    /**
     * matrix table: rows = categories (full multi-level hierarchy with ▸/▾ per
     * branch), column blocks = values of the column-group role (up to 2 levels,
     * Matrix-style collapsible headers). Each block shows the AC number plus a
     * colored Δ number (vs. the variance basis, or vs. the PREVIOUS column when
     * "Δ vs. Vorspalte" is on) and, if room, a mini Δ bar; a bold Σ block on the
     * right carries the row total with Δ and Δ % and sortable headers. Formula
     * rows evaluate per block AND for the Σ block.
     */
    private renderTableMatrix(points: DataPoint[], region: Rect, cfg: ChartConfig): void {
        const k = this.fontK;
        const lf = cfg.labelFont, cf = cfg.catFont;
        const pad = 6;
        const isSum = (p: DataPoint) => p.rowType != null && p.rowType.startsWith("sum");
        const isPct = (p: DataPoint) => p.rowType != null && p.rowType.startsWith("pct");
        const isResult = (p: DataPoint) => cfg.resultSet.has(p.cat.trim().toLowerCase());
        const isSkip = (p: DataPoint) => cfg.skipSet.has(p.cat.trim().toLowerCase());
        const isAnchor = (p: DataPoint) => isSum(p) || isResult(p);
        const twoLv = points.some(p => (p.colLevels?.length ?? 0) >= 2);
        const hasLevels = points.some(p => (p.catLevels?.length ?? 0) >= 2);

        // ------- row tree (same model as the flat table: path keys group¦l0¦l1…)
        type RNode = { label: string; key: string; order: string[]; kids: Map<string, RNode>; pts: DataPoint[] };
        const root: RNode = { label: "", key: "", order: [], kids: new Map(), pts: [] };
        for (const p of points) {
            const path = p.catLevels && p.catLevels.length > 1 ? p.catLevels : [p.cat];
            let node = root;
            let key = p.group ?? "";
            for (const lvl of path) {
                key += `¦${lvl}`;
                let ch = node.kids.get(lvl);
                if (!ch) {
                    ch = { label: lvl, key, order: [], kids: new Map(), pts: [] };
                    node.kids.set(lvl, ch);
                    node.order.push(lvl);
                }
                ch.pts.push(p);
                node = ch;
            }
        }
        const allParentKeys: string[] = [];
        const collectKeys = (nd: RNode) => {
            if (nd !== root && nd.kids.size > 0) { allParentKeys.push(nd.key); }
            nd.kids.forEach(collectKeys);
        };
        collectKeys(root);
        const aggOf = new Map<RNode, DataPoint>();
        const aggFor = (nd: RNode): DataPoint => {
            let a = aggOf.get(nd);
            if (!a) {
                if (nd.pts.length === 1) {
                    a = { ...nd.pts[0], cat: nd.label };
                } else {
                    const base = nd.pts.filter(p => !isSum(p) && !isResult(p)
                        && !isSkip(p) && !isPct(p));
                    a = this.aggregateHierarchy(nd.label, base.length > 0 ? base : nd.pts);
                    // per-branch cells of a single-column node keep the rowType
                    if (nd.kids.size === 0) { a.rowType = nd.pts[0].rowType; }
                }
                aggOf.set(nd, a);
            }
            return a;
        };

        // header sort on the Σ block (persisted; segment-wise between anchors)
        const sortSpec = !cfg.cumulative && this.tableSort ? this.tableSort : "";
        const [sortKey, sortDir] = sortSpec ? sortSpec.split("_") : ["", ""];
        const sortGet: { [key: string]: (p: DataPoint) => number | null } = {
            ac: p => p.value, dabs: p => p.varAbs, drel: p => p.varRel
        };
        const getter = sortGet[sortKey];
        const cmp = getter
            ? (a: DataPoint, b: DataPoint) => {
                const av = getter(a), bv = getter(b);
                if (av == null && bv == null) { return 0; }
                if (av == null) { return 1; }
                if (bv == null) { return -1; }
                return sortDir === "asc" ? av - bv : bv - av;
            }
            : () => 0;
        const sortSiblings = (list: RNode[]): RNode[] => {
            if (!getter) { return list; }
            const out: RNode[] = [];
            let run: RNode[] = [];
            const flush = () => {
                run.sort((a, b) => cmp(aggFor(a), aggFor(b)));
                out.push(...run);
                run = [];
            };
            for (const nd of list) {
                const a = aggFor(nd);
                if (isAnchor(a) || isPct(a)) { flush(); out.push(nd); }
                else { run.push(nd); }
            }
            flush();
            return out;
        };

        // visible rows (expanded branches only); 🔍 auto-expands to reach matches
        const searchOn = this.allowInteractions && this.tableSearch.trim() !== "";
        type MRow = { label: string; depth: number; pts: DataPoint[] | null; agg: DataPoint;
            parentKey?: string; expanded?: boolean; formula?: boolean;
            cellFn?: (bi: number) => DataPoint | null };
        let rows: MRow[] = [];
        const emit = (nd: RNode, depth: number) => {
            const agg = aggFor(nd);
            if (nd.kids.size === 0) {
                rows.push({ label: nd.label, depth, pts: nd.pts, agg });
                return;
            }
            const expanded = this.expandedRows.has(nd.key) || searchOn;
            rows.push({ label: nd.label, depth, pts: nd.pts, agg, parentKey: nd.key, expanded });
            if (expanded) {
                for (const ch of sortSiblings(nd.order.map(l => nd.kids.get(l) as RNode))) {
                    emit(ch, depth + 1);
                }
            }
        };
        for (const nd of sortSiblings(root.order.map(l => root.kids.get(l) as RNode))) { emit(nd, 0); }
        // full label source independent of expansion (formulas, Σ bases)
        const allRows: { label: string; pts: DataPoint[]; agg: DataPoint }[] = [];
        const collectAll = (nd: RNode) => {
            allRows.push({ label: nd.label, pts: nd.pts, agg: aggFor(nd) });
            for (const l of nd.order) { collectAll(nd.kids.get(l) as RNode); }
        };
        for (const l of root.order) { collectAll(root.kids.get(l) as RNode); }
        const topAggs = root.order.map(l => aggFor(root.kids.get(l) as RNode));

        // ------- column tree: level-0 groups with optional level-1 children
        type CNode = { label: string; kids: string[] };
        const colOrder: CNode[] = [];
        const colBy = new Map<string, CNode>();
        for (const p of points) {
            const l0 = p.colLevels?.[0] ?? "";
            let nd = colBy.get(l0);
            if (!nd) { nd = { label: l0, kids: [] }; colBy.set(l0, nd); colOrder.push(nd); }
            const l1 = p.colLevels && p.colLevels.length > 1 ? p.colLevels[1] : null;
            if (l1 != null && !nd.kids.includes(l1)) { nd.kids.push(l1); }
        }
        type Block = { key: string; label: string; l0: string; l1: string | null; parent?: CNode };
        const blocks: Block[] = [];
        for (const nd of colOrder) {
            const open = twoLv && nd.kids.length > 0 && this.colExpanded.has(`col¦${nd.label}`);
            if (open) {
                for (const kid of nd.kids) {
                    blocks.push({ key: `${nd.label}¦${kid}`, label: kid, l0: nd.label, l1: kid, parent: nd });
                }
            } else {
                blocks.push({ key: nd.label, label: nd.label, l0: nd.label, l1: null, parent: nd });
            }
        }

        // cell aggregates per (row pts × block)
        const cellFor = (pts: DataPoint[] | null, label: string, b: Block): DataPoint | null => {
            if (!pts) { return null; }
            const kids = pts.filter(p =>
                (p.colLevels?.[0] ?? "") === b.l0
                && (b.l1 == null || (p.colLevels && p.colLevels[1] === b.l1)));
            if (kids.length === 0) { return null; }
            if (kids.length === 1) { return kids[0]; }
            const base = kids.filter(p => !isSum(p) && !isResult(p) && !isSkip(p) && !isPct(p));
            return this.aggregateHierarchy(label, base.length > 0 ? base : kids);
        };

        // ------- formula rows: evaluate per Σ (row aggregates) and per block cell
        if (cfg.formulaRows.trim()) {
            const byLabel = new Map<string, { pts: DataPoint[] | null; agg: DataPoint; cellFn?: (bi: number) => DataPoint | null }>();
            for (const r of allRows) {
                const kk = r.label.trim().toLowerCase();
                if (!byLabel.has(kk)) { byLabel.set(kk, r); }
            }
            type Term = { sign: number; label: string };
            const parseTerms = (expr: string): Term[] | null => {
                const parts = (`+ ${expr.trim()}`).split(/\s*([+\-−])\s+/).filter(t => t.trim());
                if (parts.length < 2 || parts.length % 2 !== 0) { return null; }
                const terms: Term[] = [];
                for (let ti = 0; ti < parts.length; ti += 2) {
                    terms.push({ sign: parts[ti] === "+" ? 1 : -1, label: parts[ti + 1].trim().toLowerCase() });
                }
                return terms;
            };
            const evalTerms = (terms: Term[], getP: (label: string) => DataPoint | null):
                { value: number | null; basis: number | null } | null => {
                let value: number | null = null, basis: number | null = null;
                let vDead = false, bDead = false;
                for (const t of terms) {
                    const src = getP(t.label);
                    if (!src || isPct(src)) { return null; }
                    if (src.value == null) { vDead = true; value = null; }
                    else if (!vDead) { value = (value ?? 0) + t.sign * src.value; }
                    if (src.basis == null) { bDead = true; basis = null; }
                    else if (!bDead) { basis = (basis ?? 0) + t.sign * src.basis; }
                }
                return { value, basis };
            };
            const pctOf = (a: number | null, b: number | null) =>
                (a != null && b != null && b !== 0) ? (a / b) * 100 : null;
            const mkPoint = (label: string, v: { value: number | null; basis: number | null } | null,
                ratio: boolean, den?: { value: number | null; basis: number | null } | null): DataPoint => {
                const value = ratio ? pctOf(v?.value ?? null, den?.value ?? null) : (v?.value ?? null);
                const basis = ratio ? pctOf(v?.basis ?? null, den?.basis ?? null) : (v?.basis ?? null);
                const varAbs = (value != null && basis != null) ? value - basis : null;
                return {
                    cat: label, catLevels: null, ac: null, py: null, pl: null, fc: null,
                    value, isFc: false, basis, varAbs,
                    varRel: (!ratio && varAbs != null && basis != null && basis !== 0)
                        ? (varAbs / Math.abs(basis)) * 100 : null,
                    var2Abs: null, var2Rel: null, bm: null, fcPrev: null, lineVal: null,
                    stackSeries: null, comment: null, commentNo: null,
                    group: points[0].group, rowType: ratio ? "pct" : "sum", isRest: false, sel: null
                };
            };
            for (const entry of cfg.formulaRows.split(/[;\n]/)) {
                const eq = entry.indexOf("=");
                if (eq < 1) { continue; }
                const label = entry.slice(0, eq).trim();
                const expr = entry.slice(eq + 1).trim();
                if (!label || !expr) { continue; }
                const ratio = expr.split(/\s\/\s/);
                if (ratio.length > 2) { continue; }
                const numT = parseTerms(ratio[0]);
                const denT = ratio.length === 2 ? parseTerms(ratio[1]) : null;
                if (!numT || (ratio.length === 2 && !denT)) { continue; }
                const aggGet = (l2: string) => byLabel.get(l2)?.agg ?? null;
                const aggNum = evalTerms(numT, aggGet);
                const aggDen = denT ? evalTerms(denT, aggGet) : null;
                if (!aggNum || (denT && !aggDen)) { continue; }
                const fAgg = mkPoint(label, aggNum, denT != null, aggDen);
                const cellFn = (bi: number): DataPoint | null => {
                    const getP = (l2: string) => {
                        const src = byLabel.get(l2);
                        if (!src) { return null; }
                        return src.cellFn ? src.cellFn(bi) : cellFor(src.pts, l2, blocks[bi]);
                    };
                    const n2 = evalTerms(numT, getP);
                    const d2 = denT ? evalTerms(denT, getP) : null;
                    if (!n2 || (denT && !d2)) { return null; }
                    return mkPoint(label, n2, denT != null, d2);
                };
                rows.push({ label, depth: 0, pts: null, agg: fAgg, formula: true, cellFn });
                const kk = label.trim().toLowerCase();
                if (!byLabel.has(kk)) { byLabel.set(kk, { pts: null, agg: fAgg, cellFn }); }
            }
        }

        // ------- display filters: hidden rows (subtree) + live 🔍 (Σ keeps both)
        if (cfg.hideSet.size > 0) {
            const out: MRow[] = [];
            let hideBelow = -1;
            for (const r of rows) {
                if (hideBelow >= 0 && r.depth > hideBelow) { continue; }
                hideBelow = -1;
                if (cfg.hideSet.has(r.label.trim().toLowerCase())) {
                    hideBelow = r.depth;
                    continue;
                }
                out.push(r);
            }
            rows = out;
        }
        const searchActive = searchOn;
        if (searchActive) { rows = this.applySearch(rows, r => r.label); }
        const noMatch = searchActive && rows.length === 0;

        const hasVar = points.some(p => p.varAbs != null);
        const prevCol = cfg.matrixCompare === "prevcol";
        const showDelta = hasVar || prevCol;

        // ------- widths: name column, per-block [AC (+Δ +bar)], Σ block [AC, Δ, Δ%]
        const nameW = this.tableNameW != null
            ? Math.max(40, Math.min(region.w * 0.5, this.tableNameW))
            : Math.min(region.w * 0.24, this.maxTextWidth(rows.map(r => r.label), cf) + 18
                + (hasLevels ? 14 * k : 0));
        let valW = lf * 4.6;
        let dW = lf * 4.4;
        let barW = Math.round(34 * k);
        const gap = 8;
        // the Σ block keeps fixed widths — the spread below only widens the blocks
        const sValW = valW, sDW = dW;
        const sumW = sValW + (hasVar ? sDW + lf * 3.6 : 0) + gap;
        const availW = region.w - pad * 2 - nameW - sumW - gap * 2;
        let showD = showDelta;
        let showBar = showDelta;
        const blockW = () => valW + (showD ? dW : 0) + (showBar ? barW : 0) + gap;
        // overflow strategy: drop the mini bar, then the per-block Δ, then shrink
        // the value column, then cut blocks from the right ("… +n" hint)
        if (blocks.length * blockW() > availW && showBar) { showBar = false; }
        if (blocks.length * blockW() > availW && showD) { showD = false; }
        if (blocks.length * blockW() > availW) {
            valW = Math.max(lf * 3.4, availW / blocks.length - gap);
        }
        let shownBlocks = blocks;
        if (blocks.length * blockW() > availW) {
            const fit = Math.max(1, Math.floor(availW / blockW()));
            shownBlocks = blocks.slice(0, fit);
        }
        const cut = blocks.length - shownBlocks.length;
        // spread leftover width over the blocks (capped) so few blocks fill the tile
        const spread = Math.min(1.7, availW / Math.max(1, shownBlocks.length * blockW()));
        if (spread > 1) { valW *= spread; dW *= spread; barW = Math.round(barW * Math.min(1.3, spread)); }

        // cell resolver for display rows (block index based)
        const cellAt = (r: MRow, bi: number): DataPoint | null =>
            r.formula ? (r.cellFn ? r.cellFn(bi) : null)
                : cellFor(r.pts, r.label, shownBlocks[bi]);
        // Δ per block: basis variance, or the change vs. the previous column
        const deltaAt = (r: MRow, bi: number): { v: number | null; p: DataPoint | null } => {
            const c = cellAt(r, bi);
            if (!prevCol) { return { v: c?.varAbs ?? null, p: c }; }
            if (bi === 0 || c?.value == null) { return { v: null, p: c }; }
            const prev = cellAt(r, bi - 1);
            return { v: prev?.value != null ? c.value - prev.value : null, p: c };
        };

        // ------- vertical layout + scrolling (same pattern as the flat table)
        const headerH = Math.round(cf + 12) + (twoLv ? Math.round(cf * 0.9 + 6) : 0);
        const showTotalRow = cfg.showTotal && !noMatch
            && !topAggs.some(a => isSum(a) || isResult(a));
        const totalBase = topAggs.filter(a => !isPct(a) && !isSkip(a) && !isResult(a) && !isSum(a));
        const n = Math.max(1, rows.length + (showTotalRow ? 1 : 0));
        const rowH = Math.max(cf + 6, (region.h - pad * 2 - headerH) / n);
        const top = region.y + pad + headerH;
        const maxRows = Math.floor((region.h - pad * 2 - headerH) / rowH + 1e-6);
        const bodyCap = Math.max(1, maxRows - (showTotalRow ? 1 : 0));
        const paneKey = `${points[0].group ?? ""}¦mx`;
        const maxScroll = Math.max(0, rows.length - bodyCap);
        const canScroll = this.allowInteractions && maxScroll > 0;
        const scroll = canScroll
            ? Math.max(0, Math.min(this.tableScroll.get(paneKey) ?? 0, maxScroll)) : 0;
        if (canScroll) { this.tableScroll.set(paneKey, scroll); }
        const bodyRows = rows.slice(scroll, scroll + bodyCap);

        const bg = this.el("g", {}, this.svg);
        const marks = this.el("g", {}, this.svg);
        const txt = (xx: number, yy: number, text: string, anchor: string, font: number,
            bold: boolean, color: string, parent: SVGElement) => {
            const t = this.el("text", {
                x: xx, y: yy, "text-anchor": anchor, "font-size": font, fill: color,
                "font-family": FONT, "font-weight": bold ? 700 : 400
            }, parent);
            t.textContent = text;
            return t;
        };
        const goodOf = (v: number, pp?: DataPoint | null) => cfg.isGood(v, pp);
        const colOf = (v: number, pp: DataPoint | null, rel?: number | null) =>
            (v === 0 || (pp != null && !cfg.isMaterial(pp, v, rel ?? null)))
                ? cfg.subtle : (goodOf(v, pp) ? cfg.colors.good : cfg.colors.bad);

        // mini-bar Δ domain over the visible cells (stable while scrolling: all rows)
        let dDom = 1;
        if (showBar) {
            for (const r of rows) {
                for (let bi = 0; bi < shownBlocks.length; bi++) {
                    const d = deltaAt(r, bi);
                    if (d.v != null) { dDom = Math.max(dDom, Math.abs(d.v)); }
                }
            }
        }

        // ------- column x positions
        const colX: { x: number; w: number }[] = [];
        let x = region.x + pad + nameW + gap;
        const subW = valW + (showD ? dW : 0) + (showBar ? barW : 0);
        for (let bi = 0; bi < shownBlocks.length; bi++) {
            colX.push({ x, w: subW });
            x += subW + gap;
        }
        const sumX = { x, w: sumW - gap };

        // ------- headers
        const hFont = Math.round(10 * k);
        const hy0 = region.y + pad + hFont + 2;               // level-0 line
        const hy = top - 6;                                    // block line
        if (twoLv) {
            let bi = 0;
            while (bi < shownBlocks.length) {
                const l0 = shownBlocks[bi].l0;
                let end = bi;
                while (end + 1 < shownBlocks.length && shownBlocks[end + 1].l0 === l0) { end++; }
                const nd = shownBlocks[bi].parent as CNode;
                const spanX = colX[bi].x, spanW = colX[end].x + colX[end].w - spanX;
                const open = this.colExpanded.has(`col¦${l0}`);
                const hasKids = nd.kids.length > 0;
                const lbl = `${hasKids ? (open ? "▾ " : "▸ ") : ""}${l0}`;
                const ht = txt(spanX + spanW / 2, hy0, this.truncate(lbl, spanW, hFont),
                    "middle", hFont, true, cfg.ink, bg);
                if (hasKids && this.allowInteractions) {
                    ht.setAttribute("role", "button");
                    ht.setAttribute("aria-expanded", String(open));
                    (ht as unknown as SVGGraphicsElement).style.cursor = "pointer";
                    ht.addEventListener("click", (e: MouseEvent) => {
                        e.stopPropagation();
                        const key = `col¦${l0}`;
                        if (this.colExpanded.has(key)) { this.colExpanded.delete(key); }
                        else { this.colExpanded.add(key); }
                        this.persistTableColExpanded();
                        this.rerender();
                    });
                }
                this.el("line", {
                    x1: spanX + 2, y1: hy0 + 4, x2: spanX + spanW - 2, y2: hy0 + 4,
                    stroke: cfg.subtle, "stroke-width": 0.8
                }, bg);
                bi = end + 1;
            }
        }
        const dHead = prevCol
            ? this.locStr("Matrix_DPrev", "Δ prev.")
            : `Δ${cfg.basisLabel}`;
        for (let bi = 0; bi < shownBlocks.length; bi++) {
            const b = shownBlocks[bi];
            const label = twoLv && b.l1 == null && (b.parent as CNode).kids.length > 0
                ? "Σ" : b.label;
            txt(colX[bi].x + valW, hy, this.truncate(twoLv ? label : b.label, valW + 4, hFont),
                "end", hFont, true, cfg.subtle, bg);
            if (showD) {
                txt(colX[bi].x + valW + dW, hy, dHead, "end", hFont, true, cfg.subtle, bg);
            }
        }
        // Σ block headers with the flat table's sort cycle (ac / dabs / drel)
        const marker = (key: string) => sortKey === key ? (sortDir === "asc" ? " ▲" : " ▼") : "";
        const sortHit = (key: string, hx: number, hw: number) => {
            if (!this.allowInteractions || cfg.cumulative) { return; }
            const r = this.el("rect", {
                x: hx, y: top - 6 - hFont, width: hw, height: hFont + 8,
                fill: cfg.paper, "fill-opacity": 0.01, role: "button", tabindex: "0"
            }, bg) as SVGElement;
            const tip = this.el("title", {}, r);
            tip.textContent = this.locStr("Btn_SortHeader", "Sort by this column (click again: ascending / off)");
            r.setAttribute("aria-label", tip.textContent);
            (r as unknown as SVGGraphicsElement).style.cursor = "pointer";
            const cycle = () => {
                const next = this.tableSort === `${key}_desc` ? `${key}_asc`
                    : this.tableSort === `${key}_asc` ? "" : `${key}_desc`;
                this.tableSort = next;
                this.pendingTableSort = next;
                this.host.persistProperties({
                    merge: [{ objectName: "chart", selector: null, properties: { tableSort: next } }]
                });
                this.rerender();
            };
            r.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); cycle(); });
            r.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key !== "Enter" && e.key !== " ") { return; }
                e.preventDefault();
                e.stopPropagation();
                cycle();
            });
        };
        txt(sumX.x + sValW, hy, `Σ${marker("ac")}`, "end", hFont, true, cfg.ink, bg);
        sortHit("ac", sumX.x, sValW + 4);
        if (hasVar) {
            txt(sumX.x + sValW + sDW, hy, `Δ${cfg.basisLabel}${marker("dabs")}`, "end", hFont, true, cfg.subtle, bg);
            sortHit("dabs", sumX.x + sValW + 4, sDW);
            txt(sumX.x + sumX.w, hy, `Δ${cfg.basisLabel} %${marker("drel")}`, "end", hFont, true, cfg.subtle, bg);
            sortHit("drel", sumX.x + sValW + sDW + 4, sumX.w - sValW - sDW - 4);
        }
        if (cut > 0) {
            txt(region.x + region.w - pad, hy0 - hFont - 2, `… +${cut}`, "end",
                Math.round(hFont * 0.9), false, cfg.subtle, bg);
        }
        // expand-all chevron + 🔍 in the name header
        if (hasLevels && allParentKeys.length > 0 && this.allowInteractions) {
            const allOpen = allParentKeys.every(kk => this.expandedRows.has(kk));
            const label = allOpen
                ? this.locStr("Btn_CollapseAll", "Collapse all")
                : this.locStr("Btn_ExpandAll", "Expand all");
            const ch = txt(region.x + pad, hy, allOpen ? "▾▾" : "▸▸", "start", hFont, true, cfg.subtle, bg);
            const tip = this.el("title", {}, ch);
            tip.textContent = label;
            ch.setAttribute("role", "button");
            ch.setAttribute("aria-label", label);
            (ch as unknown as SVGGraphicsElement).style.cursor = "pointer";
            ch.addEventListener("click", (e: MouseEvent) => {
                e.stopPropagation();
                if (allOpen) { allParentKeys.forEach(kk => this.expandedRows.delete(kk)); }
                else { allParentKeys.forEach(kk => this.expandedRows.add(kk)); }
                this.persistTableExpanded();
                this.rerender();
            });
        }
        this.drawSearchControl(bg,
            region.x + pad + (hasLevels ? Math.round(24 * k) : 0), hy, cfg);
        this.el("line", {
            x1: region.x + pad, y1: top - 2, x2: region.x + region.w - pad, y2: top - 2,
            stroke: cfg.ink, "stroke-width": 1.2
        }, bg);

        if (noMatch) {
            txt(region.x + pad, top + cf + 4,
                this.locStr("Table_NoMatch", "No rows match the search"),
                "start", Math.round(cf * 0.95), false, cfg.subtle, bg);
            return;
        }

        // ------- rows
        const pctText = (v: number) => new Intl.NumberFormat(this.host.locale, {
            minimumFractionDigits: 1, maximumFractionDigits: 1
        }).format(v) + " %";
        const drawRow = (row: MRow | null, i: number) => {
            const isTotal = row == null;
            const y = top + i * rowH;
            const yMid = y + rowH / 2;
            const rowFont = Math.min(cf, rowH - 4);
            const agg = isTotal
                ? this.aggregateHierarchy(this.locStr("Label_Total", "Σ Total"), totalBase)
                : (row as MRow).agg;
            const label = isTotal ? agg.cat : (row as MRow).label;
            const isParent = !isTotal && (row as MRow).parentKey != null;
            const sum = isTotal || isSum(agg) || isResult(agg) || isParent || !!(row && row.formula && !isPct(agg));
            const skip = !isTotal && isSkip(agg);
            const rowPct = !isTotal && isPct(agg);
            const davon = !isTotal && cfg.indentSet.has(label.trim().toLowerCase());
            const rf = cfg.rowFmt.get(label.trim().toLowerCase());
            const fmtCell = (v: number) => rowPct ? pctText(v) : rf ? rf(v) : cfg.fmt.format(v);
            const g = this.el("g", { "class": "icd-cat" }, marks) as SVGGElement;
            this.el("line", {
                x1: region.x + pad, y1: y + rowH, x2: region.x + region.w - pad, y2: y + rowH,
                stroke: cfg.subtle, "stroke-width": 0.6, "stroke-opacity": 0.4
            }, bg);
            if (isTotal || isAnchor(agg) || (row && row.formula && !rowPct)) {
                this.el("line", {
                    x1: region.x + pad, y1: y, x2: region.x + region.w - pad, y2: y,
                    stroke: cfg.ink, "stroke-width": 1.2
                }, bg);
            }
            const depth = isTotal ? 0 : (row as MRow).depth;
            const indentX = (depth + (davon ? 1 : 0)) * Math.round(14 * k);
            const nameText = isParent
                ? `${(row as MRow).expanded ? "▾" : "▸"} ${label}`
                : label;
            const nameEl = txt(region.x + pad + (sum && depth === 0 && !davon ? 0 : Math.round(6 * k)) + indentX,
                yMid + rowFont * 0.35,
                this.truncate(nameText, nameW - 8 - indentX, rowFont),
                "start", rowFont, sum && !davon, skip || davon ? cfg.subtle : cfg.ink, g);
            if (skip) { nameEl.setAttribute("font-style", "italic"); }
            for (let bi = 0; bi < shownBlocks.length; bi++) {
                const p2 = isTotal
                    ? (() => {
                        const base = totalBase
                            .map((_, ti2) => cellFor(
                                (root.kids.get(root.order.filter(l => {
                                    const a2 = aggFor(root.kids.get(l) as RNode);
                                    return !isPct(a2) && !isSkip(a2) && !isResult(a2) && !isSum(a2);
                                })[ti2]) as RNode)?.pts ?? null, "Σ", shownBlocks[bi]))
                            .filter(Boolean) as DataPoint[];
                        return base.length > 0 ? this.aggregateHierarchy("Σ", base) : null;
                    })()
                    : cellAt(row as MRow, bi);
                if (p2 != null && p2.value != null) {
                    txt(colX[bi].x + valW, yMid + rowFont * 0.35, fmtCell(p2.value),
                        "end", rowFont, sum, rowPct || skip ? cfg.subtle : cfg.ink, g);
                }
                if (showD && !rowPct) {
                    const d = isTotal
                        ? { v: p2?.varAbs ?? null, p: p2 }
                        : deltaAt(row as MRow, bi);
                    // Σ row in prevcol mode: change vs. previous block total
                    if (isTotal && prevCol) { d.v = null; }
                    if (d.v != null) {
                        txt(colX[bi].x + valW + dW, yMid + rowFont * 0.35,
                            this.fmtSigned(cfg.fmtVar, d.v), "end", Math.round(rowFont * 0.95),
                            sum, colOf(d.v, d.p), g);
                    }
                    if (showBar && d.v != null) {
                        const axis = colX[bi].x + valW + dW + barW / 2 + 2;
                        const len = Math.abs(d.v) / dDom * (barW / 2 - 3);
                        const bh = Math.max(3, Math.min(rowH * 0.4, 9 * k));
                        this.el("rect", {
                            x: axis - 0.6, y: yMid - bh / 2 - 1, width: 1.2, height: bh + 2,
                            fill: cfg.colors.py
                        }, g);
                        this.el("rect", {
                            x: d.v >= 0 ? axis + 0.8 : axis - 0.8 - len, y: yMid - bh / 2,
                            width: Math.max(len, 1), height: bh,
                            fill: colOf(d.v, d.p)
                        }, g);
                    }
                }
            }
            // Σ block: row total with Δ and Δ%
            if (agg.value != null) {
                txt(sumX.x + sValW, yMid + rowFont * 0.35, fmtCell(agg.value),
                    "end", rowFont, true, rowPct || skip ? cfg.subtle : cfg.ink, g);
            }
            if (hasVar && !rowPct && agg.varAbs != null) {
                txt(sumX.x + sValW + sDW, yMid + rowFont * 0.35,
                    this.fmtSigned(cfg.fmtVar, agg.varAbs), "end", Math.round(rowFont * 0.95),
                    sum, colOf(agg.varAbs, agg, agg.varRel), g);
                if (agg.varRel != null) {
                    txt(sumX.x + sumX.w, yMid + rowFont * 0.35,
                        this.fmtPercent(agg.varRel), "end", Math.round(rowFont * 0.95),
                        sum, colOf(agg.varRel, agg, agg.varRel), g);
                }
            }
            // pp deltas for %-rows (margin/formula ratio) in the Σ block
            if (rowPct && agg.varAbs != null && hasVar) {
                const pp = (agg.varAbs > 0 ? "+" : agg.varAbs < 0 ? "−" : "")
                    + new Intl.NumberFormat(this.host.locale, {
                        minimumFractionDigits: 1, maximumFractionDigits: 1
                    }).format(Math.abs(agg.varAbs)) + "Pp";
                txt(sumX.x + sValW + sDW, yMid + rowFont * 0.35, pp, "end",
                    Math.round(rowFont * 0.95), sum, colOf(agg.varAbs, agg), g);
            }
            this.el("rect", {
                x: region.x + pad, y, width: region.w - pad * 2, height: rowH,
                fill: cfg.paper, "fill-opacity": 0.01
            }, g);
            this.attachInteraction(g, agg, cfg);
            if (isParent) {
                g.setAttribute("aria-expanded", String(!!(row as MRow).expanded));
                const key = (row as MRow).parentKey as string;
                const toggle = () => {
                    if (this.expandedRows.has(key)) { this.expandedRows.delete(key); }
                    else { this.expandedRows.add(key); }
                    this.persistTableExpanded();
                    this.rerender();
                };
                g.addEventListener("click", (e: MouseEvent) => {
                    e.stopPropagation();
                    if (this.commentEdit || this.structureEdit) { return; }
                    toggle();
                });
                g.addEventListener("keydown", (e: KeyboardEvent) => {
                    if (e.key !== "Enter" && e.key !== " ") { return; }
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.commentEdit || this.structureEdit) { return; }
                    toggle();
                });
            }
            this.catGroups.push({ g, sel: agg.sel });
            this.animGroups.push([g]);
        };
        bodyRows.forEach((row, i) => drawRow(row, i));
        if (showTotalRow && totalBase.length > 1) { drawRow(null, bodyRows.length); }
        const rowsBottom = top + (bodyRows.length + (showTotalRow ? 1 : 0)) * rowH;

        // Σ block separator + draggable name edge
        this.el("line", {
            x1: sumX.x - gap / 2, y1: region.y + pad, x2: sumX.x - gap / 2, y2: rowsBottom,
            stroke: cfg.subtle, "stroke-width": 0.8
        }, bg);
        this.drawNameResize(bg, region.x + pad + nameW + gap / 2,
            region.y + pad, rowsBottom, region, cfg);

        // ------- scrollbar (same interaction pattern as the flat table)
        if (canScroll) {
            const trackX = region.x + region.w - 4;
            const trackH = rowsBottom - top;
            this.el("rect", {
                x: trackX, y: top, width: 3, height: trackH, rx: 1.5,
                fill: cfg.subtle, "fill-opacity": 0.18
            }, bg);
            const thumbH = Math.max(Math.min(18, trackH), trackH * bodyCap / rows.length);
            const thumbY = top + (trackH - thumbH) * (scroll / maxScroll);
            const thumb = this.el("rect", {
                x: trackX - 1, y: thumbY, width: 5, height: thumbH, rx: 2.5,
                fill: cfg.subtle, "fill-opacity": 0.75, role: "scrollbar", tabindex: "0",
                "aria-valuemin": 0, "aria-valuemax": maxScroll, "aria-valuenow": scroll,
                "aria-orientation": "vertical",
                "aria-label": this.locStr("Table_Scroll", "Scroll rows")
            }, this.svg) as SVGGraphicsElement;
            thumb.style.cursor = "grab";
            const setScroll = (next: number) => {
                const cl = Math.max(0, Math.min(Math.round(next), maxScroll));
                if (cl === (this.tableScroll.get(paneKey) ?? 0)) { return; }
                this.tableScroll.set(paneKey, cl);
                this.rerender();
            };
            const onWheel = (e: WheelEvent) => {
                e.preventDefault();
                e.stopPropagation();
                const mag = Math.max(1, Math.min(bodyCap, Math.round(Math.abs(e.deltaY) / 50)));
                setScroll((this.tableScroll.get(paneKey) ?? 0) + (e.deltaY > 0 ? mag : -mag));
            };
            bg.addEventListener("wheel", onWheel, { passive: false });
            marks.addEventListener("wheel", onWheel, { passive: false });
            thumb.addEventListener("mousedown", (e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                const startY = e.clientY, startScroll = scroll;
                const move = (ev: MouseEvent) => {
                    setScroll(startScroll + (ev.clientY - startY) / trackH * rows.length);
                };
                const up = () => {
                    window.removeEventListener("mousemove", move);
                    window.removeEventListener("mouseup", up);
                };
                window.addEventListener("mousemove", move);
                window.addEventListener("mouseup", up);
            });
        } else if (rows.length > bodyRows.length) {
            txt(region.x + pad, rowsBottom + cf,
                `… ${rows.length - bodyRows.length} ${this.locStr("Hint_MoreRows", "more rows (increase the visual height)")}`,
                "start", Math.round(cf * 0.9), false, cfg.subtle, bg);
        }
    }

    /**
     * per-row number formats: entries "Label = pattern" (";"/newline separated).
     * Pattern rules follow Power BI conventions: a "%" multiplies by 100 and
     * appends the sign, decimals come from the ".0…" run, "#"/"," enables
     * grouping. Values are shown UNSCALED (no display-unit division) — that is
     * the point: mixing € rows with Stück- or %-rows in one table
     */
    private parseRowFormats(raw: string): Map<string, (v: number) => string> {
        const out = new Map<string, (v: number) => string>();
        if (!raw.trim()) { return out; }
        for (const entry of raw.split(/[;\n]/)) {
            const eq = entry.indexOf("=");
            if (eq < 1) { continue; }
            const label = entry.slice(0, eq).trim().toLowerCase();
            const pat = entry.slice(eq + 1).trim();
            if (!label || !pat) { continue; }
            const pct = pat.includes("%");
            const m = pat.match(/[.,](0+)(?!.*[.,]0)/);
            const decs = m ? m[1].length : 0;
            const grouping = pat.includes("#") || /,(?!0)/.test(pat) || pat.includes(",0");
            const nf = new Intl.NumberFormat(this.host.locale, {
                minimumFractionDigits: decs, maximumFractionDigits: decs, useGrouping: grouping
            });
            out.set(label, (v: number) => pct ? `${nf.format(v * 100)} %` : nf.format(v));
        }
        return out;
    }

    /** merges points that repeat per matrix-column value back to one per category */
    private mergeColPoints(points: DataPoint[]): DataPoint[] {
        const order: string[] = [];
        const byKey = new Map<string, DataPoint[]>();
        for (const p of points) {
            const key = `${p.group ?? ""}¦${p.stackSeries ?? ""}¦${p.cat}`;
            const b = byKey.get(key);
            if (b) { b.push(p); } else { byKey.set(key, [p]); order.push(key); }
        }
        if (order.length === points.length) { return points; }
        return order.map(key => {
            const kids = byKey.get(key) as DataPoint[];
            if (kids.length === 1) { return kids[0]; }
            const agg = this.aggregateHierarchy(kids[0].cat, kids);
            agg.catLevels = kids[0].catLevels;
            agg.group = kids[0].group;
            agg.stackSeries = kids[0].stackSeries;
            agg.rowType = kids[0].rowType;
            agg.isFc = kids.every(c => c.isFc);
            let bm: number | null = null;
            for (const c of kids) { if (c.bm != null) { bm = (bm ?? 0) + c.bm; } }
            agg.bm = bm;
            agg.comment = kids[0].comment;
            agg.commentNo = kids[0].commentNo;
            agg.sel = kids[0].sel;
            return agg;
        });
    }

    /** aggregates the child rows of one hierarchy parent into a synthetic table row */
    private aggregateHierarchy(key: string, kids: DataPoint[]): DataPoint {
        const sum = (get: (p: DataPoint) => number | null): number | null => {
            let acc: number | null = null;
            for (const c of kids) {
                const v = get(c);
                if (v != null) { acc = (acc ?? 0) + v; }
            }
            return acc;
        };
        const ac = sum(p => p.ac), py = sum(p => p.py), pl = sum(p => p.pl), fc = sum(p => p.fc);
        const value = sum(p => p.value), basis = sum(p => p.basis);
        const varAbs = (value != null && basis != null) ? value - basis : null;
        const varRel = (varAbs != null && basis != null && basis !== 0)
            ? (varAbs / Math.abs(basis)) * 100 : null;
        // secondary basis summed directly from the scenario fields — reconstructing it
        // from var2Abs dropped points whose AC/FC is missing
        const basis2 = this.basis2Mode === "plan" ? pl : py;
        const var2Abs = (value != null && basis2 != null) ? value - basis2 : null;
        const var2Rel = (var2Abs != null && basis2 != null && basis2 !== 0)
            ? (var2Abs / Math.abs(basis2)) * 100 : null;
        return {
            cat: key, catLevels: null,
            ac, py, pl, fc, value, isFc: false, basis, varAbs, varRel, var2Abs, var2Rel,
            bm: null, fcPrev: sum(p => p.fcPrev), lineVal: null, stackSeries: null, comment: null, commentNo: null,
            group: kids[0].group, rowType: null, isRest: false, sel: null
        };
    }

    /**
     * merges the point lists of several small-multiples groups into one synthetic tile
     * ("Σ Gesamt" / "Rest (n)"): categories aligned by label (+ stack series), values
     * summed, variances recomputed on the sums
     */
    private aggregateGroups(subsets: DataPoint[][], name: string): { name: string; pts: DataPoint[] } {
        const order: string[] = [];
        const byKey = new Map<string, DataPoint[]>();
        for (const pts of subsets) {
            for (const p of pts) {
                const key = `${p.cat}¦${p.stackSeries ?? ""}`;
                const bucket = byKey.get(key);
                if (bucket) { bucket.push(p); } else { byKey.set(key, [p]); order.push(key); }
            }
        }
        const pts = order.map(key => {
            const kids = byKey.get(key) as DataPoint[];
            const agg = this.aggregateHierarchy(kids[0].cat, kids);
            agg.group = name;
            agg.stackSeries = kids[0].stackSeries;
            // a period is still forecast in the total only if every tile flags it
            agg.isFc = kids.every(c => c.isFc);
            agg.rowType = kids[0].rowType;
            let bm: number | null = null;
            for (const c of kids) { if (c.bm != null) { bm = (bm ?? 0) + c.bm; } }
            agg.bm = bm;
            return agg;
        });
        return { name, pts };
    }

    /**
     * KPI cards: one tile per category with the KPI-card layout — big value, mini
     * bridge basis → Δ → AC in IBCS notation, and Δ reference rows. Two layouts:
     * stacked (default) and flat — wide, short tiles put the Δ rows and the bridge
     * to the RIGHT of the value instead of dropping them, so a KPI strip across the
     * top of a page keeps its variances.
     */
    private renderCards(points: DataPoint[], region: Rect, cfg: ChartConfig): void {
        const k = this.fontK;
        const pts = points.filter(p => p.value != null);
        const n = pts.length;
        if (n === 0) { return; }
        // the status deviation that also drives the color: benchmark when the card
        // basis is BM, otherwise the variance basis (ΔPL/ΔPY)
        const statusDev = (p: DataPoint): { v: number | null; rel: number | null } => {
            if (cfg.cardBasis === "benchmark" && p.bm != null && p.value != null) {
                const v = (p.value as number) - p.bm;
                return { v, rel: p.bm !== 0 ? v / Math.abs(p.bm) * 100 : null };
            }
            return { v: p.varAbs, rel: p.varRel };
        };
        // focus sort. magnitude = relative deviation (comparable across mixed KPIs),
        // absolute breaks ties. "goodness" is signed by good/bad (invert-aware) so
        // "worst first" surfaces problems regardless of whether the KPI counts up or
        // down. Cards without a status always sink to the end; data order otherwise
        const isGoodDir = (v: number, pp: DataPoint) => cfg.isGood(v, pp);
        const mag = (d: { v: number | null; rel: number | null }) =>
            d.v == null ? null : (d.rel != null ? Math.abs(d.rel) : Math.abs(d.v));
        const goodness = (p: DataPoint): number | null => {
            const d = statusDev(p);
            const m = mag(d);
            if (m == null) { return null; }
            if (d.v === 0) { return 0; }
            return (isGoodDir(d.v as number, p) ? 1 : -1) * m;
        };
        if (cfg.cardSort !== "none" && cfg.cardSort !== "") {
            const key = (p: DataPoint): number | null => {
                if (cfg.cardSort === "deviation") { return mag(statusDev(p)); }
                return goodness(p);                       // worst | best
            };
            const dir = cfg.cardSort === "worst" ? 1 : -1; // worst: ascending goodness
            pts.sort((a, b) => {
                const ka = key(a), kb = key(b);
                if (ka == null && kb == null) { return 0; }
                if (ka == null) { return 1; }
                if (kb == null) { return -1; }
                return cfg.cardSort === "deviation" ? kb - ka : dir * (ka - kb);
            });
        }
        const gap = Math.round(8 * k);
        let cols = Math.max(1, Math.min(n, Math.floor(region.w / (185 * k)) || 1));
        // avoid a lonely last row when a squarer grid fits the same width
        cols = Math.min(cols, Math.ceil(n / Math.ceil(n / cols)));
        const rows = Math.ceil(n / cols);
        const cw = (region.w - gap) / cols;
        const ch = (region.h - gap) / rows;
        const good = (v: number, pp?: DataPoint | null) => cfg.isGood(v, pp);
        // highlight-status filter: "bad" colors only negatives, "good" only
        // positives, "both" colors everything (subject to materiality). When a
        // direction is suppressed it renders in the neutral scenario grey
        const hlShow = (v: number, pp?: DataPoint | null) =>
            cfg.cardHl === "both" || (cfg.cardHl === "good" ? good(v, pp) : !good(v, pp));

        pts.forEach((p, i) => {
            const x = region.x + gap / 2 + (i % cols) * cw + 2;
            const y = region.y + gap / 2 + Math.floor(i / cols) * ch + 2;
            const w = cw - gap, h = ch - gap;
            const g = this.el("g", { "class": "icd-cat" }, this.svg) as SVGGElement;
            const emph = cfg.highlight.has(p.cat.toLowerCase());
            this.el("rect", {
                x, y, width: w, height: h, rx: Math.round(6 * k),
                fill: cfg.hc ? cfg.paper : (emph ? "#F4F4F0" : cfg.paper),
                stroke: emph ? cfg.ink : (cfg.hc ? cfg.ink : "#DDDDD8"),
                "stroke-width": emph ? 1.6 : 1
            }, g);
            // status source: the variance basis (ΔPL/ΔPY) or the bound benchmark —
            // monitoring mode judges AC against BM (target/threshold measure)
            const bmV = (p.bm != null && p.value != null) ? (p.value as number) - p.bm : null;
            const bmRel = (bmV != null && p.bm !== 0) ? bmV / Math.abs(p.bm as number) * 100 : null;
            const sv = statusDev(p);
            // neutral: no status, immaterial, OR the highlight-status filter hides
            // this direction (e.g. "only bad" leaves the good ones grey)
            const neutral = sv.v == null || sv.v === 0 || !cfg.isMaterial(p, sv.v, sv.rel)
                || !hlShow(sv.v as number, p);
            // optional status tint over the whole card (light green/red, neutral stays
            // paper); suppressed in high-contrast mode where color must not carry meaning
            if (cfg.cardTint && !cfg.hc && !neutral) {
                this.el("rect", {
                    x, y, width: w, height: h, rx: Math.round(6 * k),
                    fill: good(sv.v as number, p) ? cfg.colors.good : cfg.colors.bad,
                    "fill-opacity": cfg.cardTintPct / 100
                }, g);
            }
            // status stripe at the left edge (KPI-card style): direction at a glance —
            // grey without status, when Δ = 0 or below the materiality thresholds
            const stripeCol = neutral
                ? (cfg.hc ? cfg.ink : cfg.colors.py)
                : (good(sv.v as number, p) ? cfg.colors.good : cfg.colors.bad);
            this.el("rect", {
                x: x + 1.2, y: y + 1.2, width: Math.round(4 * k), height: h - 2.4,
                rx: Math.round(3 * k), fill: stripeCol
            }, g);

            const pad = Math.round(10 * k) + Math.round(5 * k);
            // wired to the pane: data-label size drives value/Δ rows, category-axis
            // size drives the card title (both already include the font preset)
            const titleF = Math.max(9, cfg.catFont);
            const valueF = Math.round(cfg.labelFont * 1.9);
            const refF = Math.max(9, Math.round(cfg.labelFont * 0.95));
            const legRoom = Math.round(11 * k);
            // per-card formatters: KPI tiles often mix magnitudes (revenue vs. units),
            // so auto display units scale per card instead of across the whole deck
            const pInt = [p.value, p.py, p.pl, p.fc].every(v => v == null || Number.isInteger(v));
            const fmtP = this.makeFormatter(Math.max(
                Math.abs(p.value ?? 0), Math.abs(p.basis ?? 0), Math.abs(p.py ?? 0), Math.abs(p.pl ?? 0)), pInt);
            const fmtVarP = this.makeFormatter(Math.max(
                Math.abs(p.varAbs ?? 0), Math.abs(p.var2Abs ?? 0), Math.abs(bmV ?? 0)), pInt);
            const valueText = fmtP.format(p.value as number);

            const txt = (tx: number, ty: number, text: string, font: number, bold: boolean,
                color: string, anchor = "start") => {
                const t = this.el("text", {
                    x: tx, y: ty, "font-size": font, fill: color, "font-family": FONT,
                    "font-weight": bold ? 700 : 400, "text-anchor": anchor
                }, g);
                t.textContent = text;
                return t;
            };
            const titleValue = (tyTitle: number, tyValue: number, maxW: number) => {
                txt(x + pad, tyTitle, this.truncate(p.cat, maxW, titleF), titleF, false, cfg.subtle);
                txt(x + pad, tyValue, valueText, valueF, true, cfg.ink);
                if (p.isFc) {
                    const vw = valueText.length * valueF * 0.58;
                    txt(x + pad + vw + 6 * k, tyValue, "FC", Math.round(9 * k), true, cfg.subtle);
                }
            };
            const refText = (vAbs: number, vRel: number | null) =>
                `${this.fmtSigned(fmtVarP, vAbs)}${vRel != null ? ` · ${this.fmtPercent(vRel)}` : ""}`;
            const refRowAt = (tx: number, ty: number, label: string,
                vAbs: number | null, vRel: number | null) => {
                if (vAbs == null) { return; }
                const col = (vAbs === 0 || !cfg.isMaterial(p, vAbs, vRel) || !hlShow(vAbs, p))
                    ? cfg.subtle : (good(vAbs, p) ? cfg.colors.good : cfg.colors.bad);
                txt(tx, ty, `Δ${label}`, refF, false, cfg.subtle);
                txt(tx + refF * 2.6, ty, refText(vAbs, vRel), refF, true, col);
            };
            // mini bridge basis → Δ → AC in IBCS notation; byBottom is the axis line
            const drawBridge = (bx: number, byBottom: number, bw2: number, bridgeH: number) => {
                if (p.basis == null) { return; }
                const maxV = Math.max(Math.abs(p.basis), Math.abs(p.value as number), 1);
                const hOf = (v: number) => Math.max(1.5, Math.abs(v) / maxV * bridgeH);
                const colW = Math.min(44 * k, bw2 / 3.6);
                const step2 = bw2 / 3;
                const cxs = [bx + step2 / 2, bx + step2 * 1.5, bx + step2 * 2.5];
                // baseline in the notation of the basis scenario
                if (cfg.basisMode === "py") {
                    this.el("line", { x1: bx, y1: byBottom, x2: bx + bw2, y2: byBottom, stroke: cfg.colors.py, "stroke-width": 3 }, g);
                } else {
                    this.el("line", { x1: bx, y1: byBottom - 1.2, x2: bx + bw2, y2: byBottom - 1.2, stroke: cfg.colors.pl, "stroke-width": 1 }, g);
                    this.el("line", { x1: bx, y1: byBottom + 1.2, x2: bx + bw2, y2: byBottom + 1.2, stroke: cfg.colors.pl, "stroke-width": 1 }, g);
                }
                const basisStyle = cfg.basisMode === "plan"
                    ? { fill: cfg.paper, stroke: cfg.colors.pl, "stroke-width": 1.3 }
                    : cfg.basisMode === "fcrev"
                    ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1 }
                    : cfg.hc
                        ? { fill: cfg.paper, stroke: cfg.colors.py, "stroke-width": 1.2, "stroke-dasharray": "3,2" }
                        : { fill: cfg.colors.py };
                this.el("rect", { x: cxs[0] - colW / 2, y: byBottom - hOf(p.basis), width: colW, height: hOf(p.basis), ...basisStyle }, g);
                if (p.varAbs != null && p.varAbs !== 0) {
                    const lo = Math.min(p.basis, p.value as number), hi = Math.max(p.basis, p.value as number);
                    const dTop = byBottom - hOf(hi), dH = Math.max(1.5, (hi - lo) / maxV * bridgeH);
                    const dCol = (!cfg.isMaterial(p) || !hlShow(p.varAbs, p)) ? cfg.colors.py
                        : (good(p.varAbs, p) ? cfg.colors.good : cfg.colors.bad);
                    this.el("rect", {
                        x: cxs[1] - colW / 2, y: dTop, width: colW, height: dH,
                        ...(p.isFc && cfg.isMaterial(p)
                            ? { fill: `url(#${good(p.varAbs, p) ? cfg.patGood : cfg.patBad})`, stroke: dCol, "stroke-width": 1 }
                            : { fill: dCol })
                    }, g);
                    this.el("line", {
                        x1: cxs[0] + colW / 2, y1: byBottom - hOf(p.basis), x2: cxs[1] - colW / 2, y2: byBottom - hOf(p.basis),
                        stroke: cfg.subtle, "stroke-width": 1
                    }, g);
                    this.el("line", {
                        x1: cxs[1] + colW / 2, y1: byBottom - hOf(p.value as number), x2: cxs[2] - colW / 2, y2: byBottom - hOf(p.value as number),
                        stroke: cfg.subtle, "stroke-width": 1
                    }, g);
                }
                this.el("rect", {
                    x: cxs[2] - colW / 2, y: byBottom - hOf(p.value as number), width: colW, height: hOf(p.value as number),
                    ...(p.isFc
                        ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1 }
                        : { fill: cfg.colors.ac })
                }, g);
                const legF = Math.round(8 * k);
                txt(cxs[0], byBottom + legF + 2, cfg.basisLabel, legF, false, cfg.subtle, "middle");
                txt(cxs[1], byBottom + legF + 2, "Δ", legF, false, cfg.subtle, "middle");
                txt(cxs[2], byBottom + legF + 2, cfg.hasFc && p.isFc ? "FC" : "AC", legF, false, cfg.subtle, "middle");
            };

            // mini bullet AC vs. BM: AC bar on a light band, benchmark as ink tick —
            // the classic monitoring glyph; scale anchors at zero like all bars
            const drawBullet = (bx: number, byMid: number, bw2: number, bh2: number) => {
                if (p.bm == null || p.value == null) { return; }
                const av = p.value as number;
                // zoom mode spreads the scale around AC and BM (target range) so
                // near-target KPIs stay readable; otherwise classic zero anchor
                const zoom = cfg.cardBulletZoom;
                let lo: number, hi: number;
                if (zoom) {
                    const pad2 = 0.35 * Math.max(Math.abs(av - p.bm),
                        0.04 * Math.max(Math.abs(av), Math.abs(p.bm), 1e-9));
                    lo = Math.min(av, p.bm) - pad2;
                    hi = Math.max(av, p.bm) + pad2;
                } else {
                    lo = Math.min(0, av, p.bm);
                    hi = Math.max(0, av, p.bm);
                }
                const sc = linearScale(lo, hi, bx + 2, bx + bw2 - 2);
                this.el("rect", {
                    x: bx, y: byMid - bh2 / 2, width: bw2, height: bh2, rx: 1.5,
                    fill: cfg.hc ? cfg.paper : "#EFEFEA",
                    stroke: cfg.hc ? cfg.ink : "none", "stroke-width": cfg.hc ? 0.8 : 0
                }, g);
                const from = zoom ? bx + 2 : sc(0);
                const e = sc(av);
                const barH = Math.max(3, Math.round(bh2 * 0.5));
                this.el("rect", {
                    x: Math.min(from, e), y: byMid - barH / 2,
                    width: Math.max(1, Math.abs(e - from)), height: barH,
                    ...(p.isFc
                        ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1 }
                        : { fill: cfg.colors.ac })
                }, g);
                if (zoom) {
                    // axis break at the left bar end: two paper slashes mark the cut scale
                    for (const off of [0, 3.2]) {
                        const bxk = bx + Math.round(7 * k) + off;
                        this.el("line", {
                            x1: bxk - 1.6, y1: byMid + barH / 2 + 1.5,
                            x2: bxk + 1.6, y2: byMid - barH / 2 - 1.5,
                            stroke: cfg.paper, "stroke-width": 1.6
                        }, g);
                    }
                }
                const tX = sc(p.bm);
                this.el("rect", {
                    x: tX - 1.2, y: byMid - bh2 / 2 - 1.5, width: 2.4, height: bh2 + 3,
                    fill: cfg.ink
                }, g);
            };

            // Δ reference rows: variance basis, second basis, benchmark — in
            // benchmark-status mode the BM row leads (it carries the judgement)
            const refRows: [string, number, number | null][] = [];
            if (p.varAbs != null) { refRows.push([cfg.basisLabel, p.varAbs, p.varRel]); }
            if (p.var2Abs != null) { refRows.push([cfg.basis2Label, p.var2Abs, p.var2Rel]); }
            if (bmV != null) {
                if (cfg.cardBasis === "benchmark") { refRows.unshift(["BM", bmV, bmRel]); }
                else { refRows.push(["BM", bmV, bmRel]); }
            }

            // flat layout: wide + short tile → Δ rows and bridge move to the right
            const flat = h < 118 * k && w >= 250 * k;
            if (flat) {
                const blockH = titleF + Math.round(4 * k) + valueF;
                const top = y + Math.max(Math.round(6 * k), (h - blockH) / 2);
                const valueW = valueText.length * valueF * 0.58 + (p.isFc ? 24 * k : 0);
                const titleFull = this.maxTextWidth([p.cat], titleF);
                const leftW = Math.max(valueW, Math.min(titleFull, 170 * k));
                titleValue(top + titleF, top + titleF + Math.round(4 * k) + valueF, leftW);

                let refX = x + pad + leftW + Math.round(20 * k);
                let maxRefW = 0;
                for (const [, va, vr] of refRows) {
                    maxRefW = Math.max(maxRefW, this.maxTextWidth([refText(va, vr)], refF));
                }
                const rowsShown = refRows.slice(0, refRows.length >= 2 && h >= 52 * k ? 2 : 1);
                if (rowsShown.length > 0 && refX + refF * 2.6 + maxRefW <= x + w - pad) {
                    const yMid = y + h / 2;
                    if (rowsShown.length === 2) {
                        refRowAt(refX, yMid - Math.round(2 * k), rowsShown[0][0], rowsShown[0][1], rowsShown[0][2]);
                        refRowAt(refX, yMid + refF + Math.round(4 * k), rowsShown[1][0], rowsShown[1][1], rowsShown[1][2]);
                    } else {
                        refRowAt(refX, yMid + refF * 0.35, rowsShown[0][0], rowsShown[0][1], rowsShown[0][2]);
                    }
                    refX += refF * 2.6 + maxRefW + Math.round(24 * k);
                }
                // bullet next to the Δ rows when benchmark is bound
                if (cfg.cardBullet && p.bm != null) {
                    const bw3 = Math.min(110 * k, x + w - pad - refX);
                    if (bw3 >= 60 * k) {
                        drawBullet(refX, y + h / 2, bw3, Math.round(9 * k));
                        refX += bw3 + Math.round(20 * k);
                    }
                }
                // bridge on the right edge when there is still room for it (toggle)
                const bw2 = Math.min(170 * k, x + w - pad - refX);
                const bh2 = Math.min(Math.round(34 * k), h - Math.round(12 * k) - legRoom);
                if (cfg.cardBars && p.basis != null && bw2 >= 100 * k && bh2 >= 18 * k) {
                    const byBottom = y + (h - legRoom + bh2) / 2;
                    drawBridge(x + w - pad - bw2, byBottom, bw2, bh2);
                }
            } else {
                let yCur = y + pad + titleF;
                titleValue(yCur, yCur + valueF + Math.round(4 * k), w - pad * 2);
                yCur += valueF + Math.round(4 * k) + refF + Math.round(9 * k);
                if (refRows.length > 0 && yCur <= y + h - 4) {
                    refRowAt(x + pad, yCur, refRows[0][0], refRows[0][1], refRows[0][2]);
                    yCur += refF + Math.round(5 * k);
                }
                for (const [rLbl, rVa, rVr] of refRows.slice(1)) {
                    if (h < 118 * k || yCur > y + h - 4) { break; }
                    refRowAt(x + pad, yCur, rLbl, rVa, rVr);
                    yCur += refF + Math.round(5 * k);
                }
                // bullet under the value/Δ block when benchmark is bound
                if (cfg.cardBullet && p.bm != null && yCur + Math.round(14 * k) <= y + h - 4) {
                    const bw3 = Math.min(w - pad * 2, 190 * k);
                    drawBullet(x + pad, yCur + Math.round(7 * k), bw3, Math.round(9 * k));
                    yCur += Math.round(18 * k);
                }
                const bridgeH = Math.round(40 * k);
                if (cfg.cardBars && p.basis != null && h - (yCur - y) >= bridgeH + pad + legRoom && w >= 150 * k) {
                    const bw2 = Math.min(w - pad * 2, 190 * k);
                    drawBridge(x + pad, y + h - pad - legRoom, bw2, bridgeH);
                }
            }

            // comment marker number, if present
            if (p.commentNo != null) {
                txt(x + w - pad, y + pad + titleF, this.circledNo(p.commentNo),
                    Math.round(10 * k), false, cfg.subtle, "end");
            }

            this.attachInteraction(g, p, cfg);
            this.catGroups.push({ g, sel: p.sel });
            this.animGroups.push([g]);
        });

        // in-chart sort chip (top-right of the region): cycles none → deviation →
        // worst → best; persists as an override of the pane dropdown, bookmarkable
        if (this.allowInteractions && region.w >= 220 * k) {
            const order = ["none", "deviation", "worst", "best"];
            const labels: { [key: string]: string } = {
                none: this.locStr("Chip_SortNone", "↕ Sort"),
                deviation: this.locStr("Chip_SortDev", "↕ |Δ|"),
                worst: this.locStr("Chip_SortWorst", "↓ Worst"),
                best: this.locStr("Chip_SortBest", "↑ Best")
            };
            const cur = cfg.cardSort === "" ? "none" : cfg.cardSort;
            const on = cur !== "none";
            const label = labels[cur] ?? labels["none"];
            const font = Math.round(11 * k), bh = Math.round(18 * k);
            const segW = this.textWidth(label, font) + Math.round(16 * k);
            const cx = region.x + region.w - segW - 2, cy = region.y + 2;
            const chip = this.el("g", { tabindex: "0", role: "button" }, this.svg) as SVGGElement;
            chip.setAttribute("aria-label", this.locStr("Cards_Sort", "Sort by deviation"));
            const tip = this.el("title", {}, chip);
            tip.textContent = this.locStr("Cards_Sort", "Sort by deviation");
            this.el("rect", {
                x: cx, y: cy, width: segW, height: bh, rx: bh / 2,
                fill: on ? cfg.colors.ac : cfg.paper,
                stroke: cfg.hc ? cfg.ink : cfg.subtle, "stroke-width": 1
            }, chip);
            const t = this.el("text", {
                x: cx + segW / 2, y: cy + bh / 2 + font * 0.36, "text-anchor": "middle",
                "font-size": font, fill: on ? cfg.paper : cfg.ink, "font-family": FONT
            }, chip);
            t.textContent = label;
            (chip as unknown as SVGGraphicsElement).style.cursor = "pointer";
            const cycle = () => {
                const next = order[(order.indexOf(cur) + 1) % order.length];
                this.cardSortSel = next;
                this.pendingCardSort = next;
                this.host.persistProperties({
                    merge: [{ objectName: "chart", selector: null, properties: { cardSortSel: next } }]
                });
                this.rerender();
            };
            chip.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); cycle(); });
            chip.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key !== "Enter" && e.key !== " ") { return; }
                e.preventDefault();
                e.stopPropagation();
                cycle();
            });
        }
    }

    /**
     * Pareto (structure): AC columns sorted descending plus the cumulative share as
     * a line with markers, an 80 % reference and a marker at the category where the
     * cumulative share crosses it — works on Category + AC alone.
     */
    private renderPareto(points: DataPoint[], region: Rect, cfg: ChartConfig): void {
        const pts = points.filter(p => p.value != null)
            .slice().sort((a, b) => (b.value as number) - (a.value as number));
        const n = pts.length;
        if (n === 0) { return; }
        const k = this.fontK;
        const lf = cfg.labelFont, cf = cfg.catFont;
        const pad = 4;
        const titleH = Math.round(14 * k);

        const catArea = cf + 10;
        const bandStart = region.x + pad + 2;
        const bandEnd = region.x + region.w - pad;
        const rect: Rect = { x: region.x, y: region.y + pad, w: region.w, h: region.h - pad - catArea };
        const labelPad = cfg.showLabels ? lf + 6 : 6;
        const total = pts.reduce((a, p) => a + Math.max(p.value as number, 0), 0);
        const scale = this.makePanelScale(
            [0, cfg.sharedScale ? Math.max(cfg.mainDomain[1], 1) : Math.max(...pts.map(p => p.value as number), 1)],
            rect, "columns", labelPad);
        // own cumulative-% scale sharing the plot area (top padding for the line labels)
        const pctTop = rect.y + titleH + lf + 10;
        const pctBottom = rect.y + rect.h - 2;
        const pctY = (v: number) => pctBottom - (v / 100) * (pctBottom - pctTop);

        const step = (bandEnd - bandStart) / n;
        const slotW = Math.max(2, step * 0.62);
        const pos = (i: number) => bandStart + i * step + (step - slotW) / 2;
        const cx = (i: number) => pos(i) + slotW / 2;

        const bg = this.el("g", {}, this.svg);
        this.drawBaseline(bg, rect, scale, "columns", bandStart, bandEnd, "ac", cfg.colors);
        this.drawPanelTitle(bg, rect, this.locStr("Title_ParetoPanel", "Pareto · AC · cumulative share"), "columns", titleH, region, undefined, cfg.subtle);

        // 80 % reference line
        this.el("line", {
            x1: bandStart, y1: pctY(80), x2: bandEnd, y2: pctY(80),
            stroke: cfg.subtle, "stroke-width": 1, "stroke-dasharray": "5,3"
        }, bg);
        const t80 = this.el("text", {
            x: bandEnd - 2, y: pctY(80) - 3, "text-anchor": "end", "font-size": Math.round(9 * k),
            fill: cfg.subtle, "font-family": FONT
        }, bg);
        t80.textContent = "80 %";

        const marks = this.el("g", {}, this.svg);
        const valueTexts = pts.map(p => cfg.fmt.format(p.value as number));
        const showValueAt = this.labelPredicate(pts, valueTexts, lf, step, "columns");
        const showCatAt = this.labelPredicate(pts, pts.map(p => p.cat), cf, step, "columns");

        let cum = 0;
        let cross = -1;
        let d = "";
        pts.forEach((p, i) => {
            const g = this.el("g", { "class": "icd-cat" }, marks) as SVGGElement;
            this.drawBar(g, pos(i), slotW, 0, Math.max(p.value as number, 0), scale, "columns",
                p.isFc
                    ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1 }
                    : { fill: cfg.colors.ac });
            if (cfg.showLabels && showValueAt(i)) {
                this.drawEndLabelAt(g, cx(i), Math.max(p.value as number, 0), true, scale,
                    "columns", valueTexts[i], lf, cfg.ink, 0, cfg.paper);
            }
            if (showCatAt(i)) {
                this.drawCategoryLabel(g, p.cat, cx(i), "columns", cf, region, step, rect, cfg.ink);
            }
            cum += Math.max(p.value as number, 0) / (total || 1) * 100;
            if (cross < 0 && cum >= 80) { cross = i; }
            d += `${d ? "L" : "M"}${cx(i).toFixed(1)},${pctY(Math.min(cum, 100)).toFixed(1)}`;
            if (p.commentNo != null && p.value != null) {
                this.drawCommentMarker(g, cx(i), p, scale, "columns", cfg);
            }
            this.attachInteraction(g, p, cfg);
            this.catGroups.push({ g, sel: p.sel });
            this.animGroups.push([g]);
        });

        // cumulative line + markers + thinned % labels, on top of the bars
        const overlay = this.el("g", {}, this.svg);
        this.el("path", { d, fill: "none", stroke: cfg.ink, "stroke-width": 1.8 }, overlay);
        cum = 0;
        pts.forEach((p, i) => {
            cum += Math.max(p.value as number, 0) / (total || 1) * 100;
            const y = pctY(Math.min(cum, 100));
            this.el("circle", {
                cx: cx(i), cy: y, r: Math.max(2.4, 2.8 * k),
                fill: i === cross ? cfg.ink : cfg.paper, stroke: cfg.ink, "stroke-width": 1.4
            }, overlay);
            // label only when the marker sits clearly above the bar (avoids collisions
            // on the tall leading bars, where the value label already tells the story)
            const barTop = scale(Math.max(p.value as number, 0));
            if (cfg.showLabels && (showValueAt(i) || i === cross) && (y < barTop - lf || i === cross)) {
                const lt = this.el("text", {
                    x: cx(i), y: y - 6, "text-anchor": "middle", "font-size": Math.round(lf * 0.9),
                    fill: i === cross ? cfg.ink : cfg.subtle, "font-family": FONT,
                    "font-weight": i === cross ? 700 : 400,
                    stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
                }, overlay);
                lt.textContent = this.fmtPercent(cum).replace("+", "");
            }
        });
        // vertical marker at the 80 % crossing
        if (cross >= 0) {
            this.el("line", {
                x1: cx(cross), y1: pctTop, x2: cx(cross), y2: rect.y + rect.h,
                stroke: cfg.subtle, "stroke-width": 1, "stroke-dasharray": "3,3"
            }, bg);
        }
    }

    /**
     * Dumbbell (structure): basis → AC per category as two dots with a connector in
     * the variance color — reads like "where from, where to" per category.
     */
    private renderDumbbell(points: DataPoint[], region: Rect, cfg: ChartConfig): void {
        const n = points.length;
        if (n === 0) { return; }
        if (!points.some(p => p.basis != null)) {
            this.drawModeHint(region, cfg, this.locStr("Hint_DumbbellBasis", "Dumbbell requires PY or PL as comparison basis"));
            return;
        }
        const k = this.fontK;
        const lf = cfg.labelFont, cf = cfg.catFont;
        const pad = 4;
        const titleH = Math.round(14 * k);

        const catArea = Math.min(region.w * 0.24, this.maxTextWidth(points.map(p => p.cat), cf) + 12);
        const bandStart = region.y + pad + titleH + 4;
        const bandEnd = region.y + region.h - pad;
        const rect: Rect = { x: region.x + pad + catArea, y: region.y, w: region.w - pad * 2 - catArea, h: region.h };
        const labelPad = cfg.showLabels ? lf + 6 : 6;
        const domain: [number, number] = cfg.sharedScale
            ? [cfg.mainDomain[0], cfg.mainDomain[1]]
            : extent(points.flatMap(p => [p.value, p.basis]));
        const scale = this.makePanelScale(domain, rect, "bars", labelPad);

        const step = (bandEnd - bandStart) / n;
        const rowMid = (i: number) => bandStart + i * step + step / 2;
        const r = Math.max(3.5, Math.min(6, step * 0.16)) * Math.min(k, 1.4);

        const bg = this.el("g", {}, this.svg);
        this.drawBaseline(bg, rect, scale, "bars", bandStart, bandEnd, "ac", cfg.colors);
        this.drawPanelTitle(bg, rect, `${cfg.basisLabel} ⟶ AC · Dumbbell`, "bars", titleH, region,
            bandStart - 6, cfg.subtle);

        const marks = this.el("g", {}, this.svg);
        const goodOf = (v: number, pp?: DataPoint | null) => cfg.isGood(v, pp);
        const colOf = (v: number, pp?: DataPoint) => (v === 0 || (pp != null && !cfg.isMaterial(pp)))
            ? cfg.colors.py : (goodOf(v, pp) ? cfg.colors.good : cfg.colors.bad);
        const showCatAt = this.labelPredicate(points, points.map(p => p.cat), cf, step, "bars");
        const showValAt = this.labelPredicate(points,
            points.map(p => p.value != null ? cfg.fmt.format(p.value) : ""), lf, step, "bars");

        points.forEach((p, i) => {
            const g = this.el("g", { "class": "icd-cat" }, marks) as SVGGElement;
            const y = rowMid(i);
            const xV = p.value != null ? scale(p.value) : null;
            const xB = p.basis != null ? scale(p.basis) : null;
            if (xV != null && xB != null) {
                const d = (p.value as number) - (p.basis as number);
                this.el("line", {
                    x1: xB, y1: y, x2: xV, y2: y, stroke: colOf(d, p),
                    "stroke-width": Math.max(2.5, r * 0.7), "stroke-linecap": "round"
                }, g);
            }
            if (xB != null) {
                // basis dot in scenario notation: PY solid grey, PL outlined
                this.el("circle", {
                    cx: xB, cy: y, r,
                    ...(cfg.basisMode === "plan"
                        ? { fill: cfg.paper, stroke: cfg.colors.pl, "stroke-width": 1.6 }
                        : { fill: cfg.hc ? cfg.paper : cfg.colors.py, stroke: cfg.colors.py, "stroke-width": 1.2 })
                }, g);
            }
            if (xV != null) {
                this.el("circle", {
                    cx: xV, cy: y, r,
                    fill: p.isFc ? cfg.paper : (cfg.hc ? cfg.ink : cfg.colors.ac),
                    stroke: cfg.colors.ac, "stroke-width": 1.6
                }, g);
                if (cfg.showLabels && showValAt(i)) {
                    const outward = xB == null || xV >= xB;
                    const lt = this.el("text", {
                        x: outward ? xV + r + 4 : xV - r - 4, y: y + lf * 0.35,
                        "text-anchor": outward ? "start" : "end", "font-size": lf, fill: cfg.ink,
                        "font-family": FONT, "font-weight": 600,
                        stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
                    }, g);
                    lt.textContent = cfg.fmt.format(p.value as number);
                }
            }
            if (showCatAt(i)) {
                this.drawCategoryLabel(g, p.cat, y, "bars", cf, region, step, rect, cfg.ink,
                    cfg.highlight.has(p.cat.toLowerCase()));
            }
            if (p.commentNo != null && p.value != null) {
                this.drawCommentMarker(g, y, p, scale, "bars", cfg);
            }
            this.attachInteraction(g, p, cfg);
            this.catGroups.push({ g, sel: p.sel });
            this.animGroups.push([g]);
        });
    }

    /**
     * Slope (before/after): basis on the left axis, AC on the right, one line per
     * category in the variance color — the classic Vorher/Nachher comparison.
     */
    private renderSlope(points: DataPoint[], region: Rect, cfg: ChartConfig): void {
        const pts = points.filter(p => p.value != null && p.basis != null);
        if (pts.length === 0) {
            this.drawModeHint(region, cfg, this.locStr("Hint_SlopeBasis", "Slope requires AC and PY/PL per category"));
            return;
        }
        const k = this.fontK;
        const cf = cfg.catFont;
        const pad = 6;
        const headFont = Math.round(11 * k);

        const x0 = region.x + region.w * 0.30;
        const x1 = region.x + region.w * 0.70;
        const top = region.y + pad + headFont + 10;
        const bottom = region.y + region.h - pad - 6;
        const dom: [number, number] = cfg.sharedScale
            ? [cfg.mainDomain[0], cfg.mainDomain[1]]
            : extentTight(pts.flatMap(p => [p.value, p.basis]));
        const span = (dom[1] - dom[0]) || 1;
        const Y = (v: number) => bottom - ((v - (dom[0] - span * 0.06)) / (span * 1.12)) * (bottom - top);

        const bg = this.el("g", {}, this.svg);
        for (const [x, label] of [[x0, cfg.basisLabel], [x1, "AC"]] as [number, string][]) {
            this.el("line", { x1: x, y1: top - 4, x2: x, y2: bottom, stroke: cfg.subtle, "stroke-width": 1, "stroke-opacity": 0.6 }, bg);
            const ht = this.el("text", {
                x, y: region.y + pad + headFont, "text-anchor": "middle", "font-size": headFont,
                fill: cfg.subtle, "font-family": FONT, "font-weight": 700
            }, bg);
            ht.textContent = label;
        }

        // greedy de-overlap for the side labels: sort by y, push down to a minimum gap
        const gap = cf + 2;
        const place = (ys: number[]): number[] => {
            const order = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
            let prev = -Infinity;
            const out = new Array(ys.length).fill(0);
            for (const o of order) {
                const y = Math.max(o.y, prev + gap);
                out[o.i] = y;
                prev = y;
            }
            return out;
        };
        const leftY = place(pts.map(p => Y(p.basis as number)));
        const rightY = place(pts.map(p => Y(p.value as number)));

        const goodOf = (v: number, pp?: DataPoint | null) => cfg.isGood(v, pp);
        const colOf = (v: number, pp?: DataPoint) => (v === 0 || (pp != null && !cfg.isMaterial(pp)))
            ? cfg.colors.py : (goodOf(v, pp) ? cfg.colors.good : cfg.colors.bad);
        const marks = this.el("g", {}, this.svg);
        pts.forEach((p, i) => {
            const g = this.el("g", { "class": "icd-cat" }, marks) as SVGGElement;
            const yB = Y(p.basis as number), yV = Y(p.value as number);
            const d = (p.value as number) - (p.basis as number);
            const c = colOf(d, p);
            this.el("line", {
                x1: x0, y1: yB, x2: x1, y2: yV, stroke: c, "stroke-width": 2,
                ...(p.isFc ? { "stroke-dasharray": "5,4" } : {})
            }, g);
            this.el("circle", { cx: x0, cy: yB, r: 3 * Math.min(k, 1.4), fill: cfg.hc ? cfg.paper : cfg.colors.py, stroke: cfg.colors.py, "stroke-width": 1.2 }, g);
            this.el("circle", { cx: x1, cy: yV, r: 3 * Math.min(k, 1.4), fill: p.isFc ? cfg.paper : cfg.colors.ac, stroke: cfg.colors.ac, "stroke-width": 1.4 }, g);
            const isHl = cfg.highlight.has(p.cat.toLowerCase());
            const lt = this.el("text", {
                x: x0 - 8, y: leftY[i] + cf * 0.35, "text-anchor": "end", "font-size": cf,
                fill: cfg.ink, "font-family": FONT, "font-weight": isHl ? 700 : 400
            }, g);
            lt.textContent = this.truncate(`${p.cat}  ${cfg.fmt.format(p.basis as number)}`, x0 - region.x - 12, cf);
            const rt = this.el("text", {
                x: x1 + 8, y: rightY[i] + cf * 0.35, "text-anchor": "start", "font-size": cf,
                fill: cfg.ink, "font-family": FONT, "font-weight": isHl ? 700 : 400
            }, g);
            rt.textContent = this.truncate(`${cfg.fmt.format(p.value as number)}  ${p.cat}`, region.x + region.w - x1 - 12, cf);
            this.attachInteraction(g, p, cfg);
            this.catGroups.push({ g, sel: p.sel });
            this.animGroups.push([g]);
        });
    }

    /**
     * Stacked columns/bars — field-driven: filling the Stack-Series role stacks AC by
     * series with a legend and total labels. PY/PL/variance panels don't apply here;
     * an empty role leaves the plain chart untouched.
     */
    private renderStacked(points: DataPoint[], region: Rect, cfg: ChartConfig): void {
        const cats: string[] = [];
        const series: string[] = [];
        const cell = new Map<string, DataPoint>();
        for (const p of points) {
            if (!cats.includes(p.cat)) { cats.push(p.cat); }
            const s = p.stackSeries ?? "(leer)";
            if (!series.includes(s)) { series.push(s); }
            const key = `${p.cat}¦${s}`;
            if (!cell.has(key)) { cell.set(key, p); }
        }
        const n = cats.length;
        if (n === 0) { return; }
        const k = this.fontK;
        const lf = cfg.labelFont, cf = cfg.catFont;
        const pad = 4;
        const titleH = Math.round(14 * k);
        const orientation = cfg.orientation;

        // legend row under the panel title
        const legFont = Math.round(10 * k);
        const legendH = legFont + 10;
        const shade = (idx: number): string => {
            // ramp from the AC color towards light grey, first series darkest
            const mix = series.length > 1 ? idx / (series.length - 1) : 0;
            const from = cfg.hc ? [26, 26, 26] : this.hexRgb(cfg.colors.ac);
            const to = [200, 200, 200];
            const c = from.map((f, ci) => Math.round(f + (to[ci] - f) * mix * 0.85));
            return `rgb(${c[0]},${c[1]},${c[2]})`;
        };

        const totals = cats.map(c => series.reduce((a, s) => {
            const p = cell.get(`${c}¦${s}`);
            return a + Math.max(p?.value ?? 0, 0);
        }, 0));
        const domain: [number, number] = [0, Math.max(...totals, 1)];

        let bandStart: number, bandEnd: number, rect: Rect;
        if (orientation === "columns") {
            const catArea = cf + 10;
            bandStart = region.x + pad + 2;
            bandEnd = region.x + region.w - pad;
            rect = { x: region.x, y: region.y + pad + legendH, w: region.w, h: region.h - pad - catArea - legendH };
        } else {
            const catArea = Math.min(region.w * 0.24, this.maxTextWidth(cats, cf) + 12);
            bandStart = region.y + pad + titleH + legendH + 2;
            bandEnd = region.y + region.h - pad;
            rect = { x: region.x + pad + catArea, y: region.y + legendH, w: region.w - pad * 2 - catArea, h: region.h - legendH };
        }
        const labelPad = cfg.showLabels ? lf + 6 : 6;
        const scale = this.makePanelScale(domain, rect, orientation, labelPad);
        const step = (bandEnd - bandStart) / n;
        const slotW = Math.max(2, step * 0.62);
        const pos = (i: number) => bandStart + i * step + (step - slotW) / 2;

        const bg = this.el("g", {}, this.svg);
        this.drawBaseline(bg, rect, scale, orientation, bandStart, bandEnd, "ac", cfg.colors);
        this.drawPanelTitle(bg, rect, this.locStr("Title_StackedPanel", "AC · stacked"), orientation, titleH, region,
            orientation === "bars" ? region.y + legendH + Math.round(10 * k) : undefined, cfg.subtle);

        // legend (top-left, truncating to the region width)
        let lx = region.x + 6;
        const ly = region.y + (orientation === "columns" ? pad + legendH - 4 : legendH - 2);
        for (let si = 0; si < series.length; si++) {
            if (lx > region.x + region.w - 60) { break; }
            this.el("rect", {
                x: lx, y: ly - legFont + 1, width: legFont, height: legFont,
                fill: shade(si), ...(cfg.hc ? { stroke: cfg.ink, "stroke-width": 1 } : {})
            }, bg);
            const st = this.el("text", {
                x: lx + legFont + 4, y: ly, "font-size": legFont, fill: cfg.ink, "font-family": FONT
            }, bg);
            const label = this.truncate(series[si], 120 * k, legFont);
            st.textContent = label;
            lx += legFont + 8 + label.length * legFont * 0.56;
        }

        const marks = this.el("g", {}, this.svg);
        const totalTexts = totals.map(t => cfg.fmt.format(t));
        const fakePts = cats.map((c, i) => ({ cat: c, value: totals[i] } as DataPoint));
        const showTotalAt = this.labelPredicate(fakePts, totalTexts, lf, step, orientation);
        const showCatAt = this.labelPredicate(fakePts, cats, cf, step, orientation);

        cats.forEach((c, i) => {
            const gCat = this.el("g", {}, marks) as SVGGElement;
            let cum = 0;
            series.forEach((s, si) => {
                const p = cell.get(`${c}¦${s}`);
                const v = Math.max(p?.value ?? 0, 0);
                if (v <= 0 || !p) { cum += v; return; }
                const g = this.el("g", { "class": "icd-cat" }, gCat) as SVGGElement;
                this.drawBar(g, pos(i), slotW, cum, cum + v, scale, orientation,
                    { fill: shade(si), ...(cfg.hc ? { stroke: cfg.ink, "stroke-width": 1 } : {}) });
                // segment label when the slice is tall/wide enough
                const a = scale(cum), b = scale(cum + v);
                if (cfg.showLabels && Math.abs(a - b) > lf + 6) {
                    const mid = (a + b) / 2;
                    const light = si > (series.length - 1) / 2;
                    const st = this.el("text", {
                        x: orientation === "columns" ? pos(i) + slotW / 2 : mid,
                        y: orientation === "columns" ? mid + lf * 0.35 : pos(i) + slotW / 2 + lf * 0.35,
                        "text-anchor": "middle", "font-size": Math.round(lf * 0.92),
                        fill: cfg.hc ? cfg.ink : (light ? cfg.ink : cfg.paper), "font-family": FONT
                    }, g);
                    st.textContent = cfg.fmt.format(v);
                }
                this.attachInteraction(g, p, cfg);
                this.catGroups.push({ g, sel: p.sel });
                cum += v;
            });
            // total label at the stack end
            if (cfg.showLabels && showTotalAt(i)) {
                this.drawEndLabelAt(gCat, pos(i) + slotW / 2, totals[i], true, scale,
                    orientation, totalTexts[i], lf, cfg.ink, 0, cfg.paper);
            }
            if (showCatAt(i)) {
                this.drawCategoryLabel(gCat, c, pos(i) + slotW / 2, orientation, cf, region, step, rect, cfg.ink);
            }
            this.animGroups.push([gCat]);
        });
    }

    /** hex "#rrggbb" → [r,g,b] (defaults to dark grey on malformed input) */
    private hexRgb(hex: string): number[] {
        const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
        if (!m) { return [64, 64, 64]; }
        return [0, 2, 4].map(o => parseInt(m[1].slice(o, o + 2), 16));
    }

    /** renders one complete IBCS chart (base + variance panels) into the given region */
    private renderChart(points: DataPoint[], region: Rect, cfg: ChartConfig, domains: Domains,
        cascade: Cascade | null = null): void {
        const n = points.length;
        const pad = 4;
        const titleH = Math.round(14 * this.fontK);
        const orientation = cfg.orientation;
        // waterfall-bridge: an extra panel alongside the normal AC/PY/PL comparison bars,
        // showing the same categories cascading from the basis total to AC with connectors
        const wfStyle = cascade != null;

        // compact mode: too little room for variance panels → deltas become labels
        const compact = orientation === "columns" ? region.h < 190 : region.w < 420;
        const showAbs = cfg.showAbs && !compact;
        const showRel = cfg.showRel && !compact;
        const showDual = cfg.showDual && !compact
            && (orientation === "columns" ? region.h >= 320 : region.w >= 640);
        const showBridge = wfStyle && !compact
            && (orientation === "columns" ? region.h >= 260 : region.w >= 520);
        // total (Σ) header row on top of the region
        const showTotal = cfg.showTotal && region.w > 240;
        const headerH = showTotal ? Math.round(17 * this.fontK) : 0;

        let bandStart: number, bandEnd: number;
        let panels: { main: Rect; abs?: Rect; rel?: Rect; abs2?: Rect; rel2?: Rect; bridge?: Rect };

        if (orientation === "columns") {
            const catArea = cfg.catFont + 10;
            bandStart = region.x + pad + 2;
            bandEnd = region.x + region.w - pad;
            const plotTop = region.y + pad + headerH, plotBottom = region.y + region.h - catArea;
            panels = this.splitPanels(plotTop, plotBottom - plotTop, showAbs, showRel, true, region, showDual, showBridge);
        } else {
            const catArea = Math.min(region.w * 0.28, this.maxTextWidth(points.map(p => p.cat), cfg.catFont) + 12);
            // room for the header and the panel titles above the first bar
            bandStart = region.y + pad + headerH + titleH + 2;
            bandEnd = region.y + region.h - pad;
            const plotLeft = region.x + pad + catArea, plotRight = region.x + region.w - pad;
            panels = this.splitPanels(plotLeft, plotRight - plotLeft, showAbs, showRel, false, region, showDual, showBridge);
        }

        const bandSpan = bandEnd - bandStart;
        const step = bandSpan / n;
        const slotW = Math.max(2, step * 0.62);
        // with the PY triangle the third column disappears — AC/PL get the full slot back.
        // scenario bars are OFFSET, never stacked on top of each other (table look):
        // PY at the back, the PL outline slightly shifted, AC in front
        const pyAsCol = cfg.hasPy && !cfg.pyTriangle;
        const plAsBar = cfg.hasPl;
        const barW = pyAsCol ? slotW * 0.82 : plAsBar ? slotW * 0.88 : slotW;
        const acShift = pyAsCol || plAsBar ? slotW - barW : 0;
        const plShift = pyAsCol ? acShift * 0.5 : 0;
        const slotPos = (i: number) => bandStart + i * step + (step - slotW) / 2;

        // the bridge panel gets its own n+2 slot grid (basis anchor, n bricks, value
        // anchor) — real anchor bars flanking the cascade, like the reference bridge
        // charts' PL/PY/AC total columns. Slightly narrower slots than the main panel
        // to make room for the two extra anchors.
        const bridgeN = n + 2;
        const bridgeStep = bandSpan / bridgeN;
        const bridgeSlotW = Math.max(2, bridgeStep * 0.62);
        const bridgeSlotPos = (i: number) => bandStart + i * bridgeStep + (bridgeStep - bridgeSlotW) / 2;

        // ------- precompute label texts + thinning predicates
        // sum-safe rounding: adjust label values (largest remainder) so the visible
        // labels add up to the Σ header — pointless for running totals (cumulative)
        const labelVals = cfg.sumSafe && !cfg.cumulative
            ? this.sumSafeAdjust(points.map(p => p.value), cfg.fmtUnit, cfg.fmtPrec)
            : points.map(p => p.value);
        const valueTexts = labelVals.map(v => v != null ? cfg.fmt.format(v) : "");
        const absTexts = points.map(p => p.varAbs != null ? this.fmtSigned(cfg.fmtVar, p.varAbs) : "");
        const relTexts = points.map(p => p.varRel != null ? this.fmtPercent(p.varRel) : "");
        const abs2Texts = points.map(p => p.var2Abs != null ? this.fmtSigned(cfg.fmtVar, p.var2Abs) : "");
        const rel2Texts = points.map(p => p.var2Rel != null ? this.fmtPercent(p.var2Rel) : "");
        const showValueAt = this.labelPredicate(points, valueTexts, cfg.labelFont, step, orientation);
        const showAbsAt = this.labelPredicate(points, absTexts, cfg.labelFont, step, orientation);
        const showRelAt = this.labelPredicate(points, relTexts, cfg.labelFont, step, orientation);
        const showAbs2At = this.labelPredicate(points, abs2Texts, cfg.labelFont, step, orientation);
        const showRel2At = this.labelPredicate(points, rel2Texts, cfg.labelFont, step, orientation);
        const showCatAt = this.labelPredicate(points, points.map(p => p.cat), cfg.catFont, step, orientation);

        // ------- scales
        const labelPad = cfg.showLabels ? cfg.labelFont + 6 : 6;
        const compactLabelPad = compact && cfg.showLabels && orientation === "columns"
            ? labelPad + cfg.labelFont + 4 : labelPad;
        const mainScale = this.makePanelScale(domains.main, panels.main, orientation, compactLabelPad);
        const absScale = panels.abs
            ? this.makePanelScale(domains.abs, panels.abs, orientation, labelPad) : null;
        const relScale = panels.rel
            ? this.makePanelScale(domains.rel, panels.rel, orientation, labelPad) : null;
        const abs2Scale = panels.abs2
            ? this.makePanelScale(domains.abs2, panels.abs2, orientation, labelPad) : null;
        const rel2Scale = panels.rel2
            ? this.makePanelScale(domains.rel2, panels.rel2, orientation, labelPad) : null;
        // the bridge domain floats away from zero on both sides — reserve label room at
        // both ends instead of just the side a zero-anchored chart would need
        const bridgeScale = panels.bridge
            ? this.makePanelScale(domains.bridge, panels.bridge, orientation, labelPad, true) : null;

        // ------- background layer: baselines + panel titles
        const bg = this.el("g", {}, this.svg);
        const cumLabel = { ytd: "YTD", qtd: "QTD", r12: "R12" }[
            String(this.formattingSettings.chartCard.cumulativeKind.value.value)] ?? "YTD";
        const scenarioTitle = (cfg.cumulative ? `${cumLabel} · ` : "")
            + ["AC", cfg.hasPy ? "PY" : "", cfg.hasPl ? "PL" : "",
                cfg.hasFc ? "FC" : "", cfg.hasBm ? "BM ‒" : ""].filter(x => x).join(" · ");

        // AC -> FC boundary (time series with a forecast tail) — not meaningful once
        // waterfall-bridge sorting reorders categories by impact instead of chronology
        let fcBoundary: number | null = null;
        if (orientation === "columns" && cfg.hasFc && !(wfStyle && cfg.sortByImpact)) {
            const fcStart = points.findIndex(p => p.isFc);
            const isTail = fcStart > 0 && points.slice(fcStart).every(p => p.isFc || p.value == null);
            if (isTail) { fcBoundary = bandStart + fcStart * step; }
        }
        // baselines are dashed underneath the forecast section (IBCS notation)
        const baseline = (rect: Rect, scale: Scale, kind: "ac" | Basis) => {
            if (fcBoundary == null) {
                this.drawBaseline(bg, rect, scale, orientation, bandStart, bandEnd, kind, cfg.colors);
            } else {
                this.drawBaseline(bg, rect, scale, orientation, bandStart, fcBoundary, kind, cfg.colors);
                this.drawBaseline(bg, rect, scale, orientation, fcBoundary, bandEnd, kind, cfg.colors, true);
            }
        };
        baseline(panels.main, mainScale, "ac");
        const compactVarHint = compact && (cfg.showAbs || cfg.showRel)
            ? `  ·  Δ${cfg.basisLabel}${cfg.showRel ? " %" : ""}` : "";
        const barsTitleY = orientation === "bars" ? bandStart - 6 : undefined;
        this.drawPanelTitle(bg, panels.main, scenarioTitle + compactVarHint,
            orientation, titleH, region, barsTitleY, cfg.subtle);
        if (panels.abs && absScale) {
            baseline(panels.abs, absScale, cfg.basisMode);
            this.drawPanelTitle(bg, panels.abs, `Δ${cfg.basisLabel}`, orientation, titleH, region, barsTitleY, cfg.subtle);
        }
        if (panels.rel && relScale) {
            baseline(panels.rel, relScale, cfg.basisMode);
            this.drawPanelTitle(bg, panels.rel, `Δ${cfg.basisLabel} %`, orientation, titleH, region, barsTitleY, cfg.subtle);
        }
        // the REAL second basis from parseData — a local re-derivation would miss
        // the fcrev-without-plan case (second basis PY, not PL)
        const basis2Mode: Basis = this.basis2Mode;
        if (panels.abs2 && abs2Scale) {
            baseline(panels.abs2, abs2Scale, basis2Mode);
            this.drawPanelTitle(bg, panels.abs2, `Δ${cfg.basis2Label}`, orientation, titleH, region, barsTitleY, cfg.subtle);
        }
        if (panels.rel2 && rel2Scale) {
            baseline(panels.rel2, rel2Scale, basis2Mode);
            this.drawPanelTitle(bg, panels.rel2, `Δ${cfg.basis2Label} %`, orientation, titleH, region, barsTitleY, cfg.subtle);
        }
        if (panels.bridge && bridgeScale && cascade) {
            const bridgeTitle = `${cfg.basisLabel} → AC` + (cfg.sortByImpact ? " ⇅" : "");
            this.drawPanelTitle(bg, panels.bridge, bridgeTitle, orientation, titleH, region, barsTitleY, cfg.subtle);
        }

        // ------- total (Σ) header
        if (showTotal) {
            this.drawTotalHeader(bg, region, points, cfg);
        }

        // ------- AC → FC boundary separator (time series only)
        if (fcBoundary != null) {
            const yTop = Math.min(panels.main.y,
                panels.abs ? panels.abs.y : Infinity,
                panels.rel ? panels.rel.y : Infinity,
                panels.abs2 ? panels.abs2.y : Infinity,
                panels.rel2 ? panels.rel2.y : Infinity,
                panels.bridge ? panels.bridge.y : Infinity);
            const yBot = panels.main.y + panels.main.h;
            this.el("line", {
                x1: fcBoundary, y1: yTop + 2, x2: fcBoundary, y2: yBot,
                stroke: cfg.subtle, "stroke-width": 1, "stroke-dasharray": "3,3"
            }, bg);
        }

        // ------- category group separators: thin lines every N categories, spanning all
        // active panels — a reading aid for structure comparisons with natural subgroups
        // (e.g. regions), matching the reference bridge charts' grouped state lists
        const groupEvery = Math.round(this.formattingSettings.chartCard.groupEvery.value ?? 0);
        if (groupEvery > 0 && groupEvery < n) {
            const allPanels = [panels.main, panels.abs, panels.rel, panels.abs2, panels.rel2, panels.bridge]
                .filter((r): r is Rect => r != null);
            const stackY0 = Math.min(...allPanels.map(r => r.y));
            const stackY1 = Math.max(...allPanels.map(r => r.y + r.h));
            const stackX0 = Math.min(...allPanels.map(r => r.x));
            const stackX1 = Math.max(...allPanels.map(r => r.x + r.w));
            for (let i = groupEvery; i < n; i += groupEvery) {
                const p1 = bandStart + i * step;
                if (orientation === "columns") {
                    this.el("line", {
                        x1: p1, y1: stackY0, x2: p1, y2: stackY1,
                        stroke: cfg.subtle, "stroke-width": 1, "stroke-opacity": 0.5
                    }, bg);
                } else {
                    this.el("line", {
                        x1: stackX0, y1: p1, x2: stackX1, y2: p1,
                        stroke: cfg.subtle, "stroke-width": 1, "stroke-opacity": 0.5
                    }, bg);
                }
            }
        }

        // ------- highlight bands (IBCS EMPHASIZE): shaded slot background
        if (cfg.highlight.size > 0) {
            const hlTop = Math.min(panels.main.y,
                panels.abs ? panels.abs.y : Infinity,
                panels.rel ? panels.rel.y : Infinity,
                panels.abs2 ? panels.abs2.y : Infinity,
                panels.rel2 ? panels.rel2.y : Infinity,
                panels.bridge ? panels.bridge.y : Infinity) + 2;
            for (let i = 0; i < n; i++) {
                if (!cfg.highlight.has(points[i].cat.toLowerCase())) { continue; }
                const x0 = bandStart + i * step;
                if (orientation === "columns") {
                    this.el("rect", {
                        x: x0 + 1, y: hlTop, width: step - 2,
                        height: region.y + region.h - hlTop,
                        fill: cfg.hc ? "none" : cfg.ink,
                        "fill-opacity": cfg.hc ? 0 : 0.07,
                        stroke: cfg.hc ? cfg.ink : "none", "stroke-width": cfg.hc ? 1 : 0
                    }, bg);
                } else {
                    this.el("rect", {
                        x: region.x + 1, y: x0 + 1,
                        width: region.w - 2, height: step - 2,
                        fill: cfg.hc ? "none" : cfg.ink,
                        "fill-opacity": cfg.hc ? 0 : 0.07,
                        stroke: cfg.hc ? cfg.ink : "none", "stroke-width": cfg.hc ? 1 : 0
                    }, bg);
                }
            }
        }

        // ------- line mode: scenario paths underneath the markers
        const lineMode = cfg.lineMode && orientation === "columns";
        if (lineMode) {
            this.drawLinePaths(bg, points, (i: number) => slotPos(i) + slotW / 2, mainScale, cfg);
        }

        // ------- moving average overlay (time series only)
        if (cfg.movingAvg >= 2 && orientation === "columns") {
            this.drawMovingAverage(bg, points, (i: number) => lineMode
                ? slotPos(i) + slotW / 2
                : slotPos(i) + acShift + barW / 2, mainScale, cfg);
        }

        // ------- category groups with all marks
        const marks = this.el("g", {}, this.svg);

        // bridge anchor bars: real PL/PY-total and AC(+FC)-total bars flanking the
        // cascade, drawn from the panel floor (domains.bridge[0]) up to each total —
        // replaces plain guide lines with literal bars, like the reference bridge
        // charts' PL/PY/AC total columns
        if (panels.bridge && bridgeScale && cascade) {
            const basisStyle = cfg.basisMode === "plan"
                ? { fill: cfg.paper, stroke: cfg.colors.pl, "stroke-width": 1.4 }
                : { fill: cfg.colors.py };
            const basisPos = bridgeSlotPos(0);
            this.drawBar(marks, basisPos, bridgeSlotW, domains.bridge[0], cascade.basisSum,
                bridgeScale, orientation, basisStyle);
            if (cfg.showLabels) {
                this.drawEndLabelAt(marks, basisPos + bridgeSlotW / 2, cascade.basisSum, true, bridgeScale,
                    orientation, `${cfg.basisLabel} ${cfg.fmt.format(cascade.basisSum)}`,
                    cfg.labelFont, cfg.ink, 0, cfg.paper);
            }

            const valueLabel = cascade.fcSum > 0 ? "AC/FC" : "AC";
            const valueStyle = cascade.fcSum > 0
                ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1 }
                : { fill: cfg.colors.ac };
            const valuePos = bridgeSlotPos(n + 1);
            this.drawBar(marks, valuePos, bridgeSlotW, domains.bridge[0], cascade.valueSum,
                bridgeScale, orientation, valueStyle);
            if (cfg.showLabels) {
                this.drawEndLabelAt(marks, valuePos + bridgeSlotW / 2, cascade.valueSum, true, bridgeScale,
                    orientation, `${valueLabel} ${cfg.fmt.format(cascade.valueSum)}`,
                    cfg.labelFont, cfg.ink, 0, cfg.paper);
            }
        }

        for (let i = 0; i < n; i++) {
            const p = points[i];
            const g = this.el("g", { "class": "icd-cat" }, marks) as SVGGElement;
            const pos = slotPos(i);
            const cx = lineMode ? pos + slotW / 2 : pos + acShift + barW / 2;

            // base chart: PY behind, PL outline, AC/FC on top (unchanged by waterfall-bridge —
            // the cascade renders into its own panel below, see "bridge brick" further down)
            const capV = (v: number) => cfg.capMax != null ? Math.min(v, cfg.capMax) : v;
            if (!lineMode && p.py != null) {
                if (cfg.pyTriangle) {
                    this.drawPyTriangle(g, pos, slotW, capV(p.py), mainScale, orientation, cfg);
                } else {
                    this.drawBar(g, pos, barW, 0, capV(p.py), mainScale, orientation,
                        cfg.hc
                            ? { fill: cfg.paper, stroke: cfg.colors.py, "stroke-width": 1.2, "stroke-dasharray": "3,2" }
                            : { fill: cfg.colors.py });
                }
            }
            if (!lineMode && p.pl != null) {
                this.drawBar(g, pos + plShift, barW, 0, capV(p.pl), mainScale, orientation,
                    { fill: cfg.paper, stroke: cfg.colors.pl, "stroke-width": 1.4 });
            }
            // benchmark marker: bold tick across the slot at the BM value
            if (p.bm != null) {
                const bpos = mainScale(capV(p.bm));
                if (orientation === "columns") {
                    this.el("line", {
                        x1: pos - 1, y1: bpos, x2: pos + slotW + 1, y2: bpos,
                        stroke: cfg.ink, "stroke-width": 2.4
                    }, g);
                } else {
                    this.el("line", {
                        x1: bpos, y1: pos - 1, x2: bpos, y2: pos + slotW + 1,
                        stroke: cfg.ink, "stroke-width": 2.4
                    }, g);
                }
            }

            if (p.value != null) {
                if (this.compareActive) {
                    this.compareAnchors.set(p.cat, { band: cx, end: mainScale(capV(p.value)), value: p.value });
                }
                if (lineMode) {
                    // transparent hit area for tooltips/selection + point marker
                    this.el("rect", {
                        x: pos, y: panels.main.y, width: slotW, height: panels.main.h,
                        fill: cfg.paper, "fill-opacity": 0, "pointer-events": "all"
                    }, g);
                    this.el("circle", {
                        cx, cy: mainScale(capV(p.value)), r: 2.6,
                        fill: p.isFc ? cfg.paper : cfg.colors.ac,
                        stroke: cfg.colors.ac, "stroke-width": 1.4
                    }, g);
                } else {
                    this.drawBar(g, pos + acShift, barW, 0, capV(p.value), mainScale, orientation,
                        p.isFc
                            ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1 }
                            : { fill: cfg.colors.ac });
                    if (p.isPrelim && !p.isFc) {
                        // preliminary actual: thin paper hatch over the solid bar
                        this.drawBar(g, pos + acShift, barW, 0, capV(p.value), mainScale, orientation,
                            { fill: `url(#${cfg.patPrelim})` });
                    }
                    if (cfg.capMax != null && p.value > cfg.capMax) {
                        this.drawCapMarker(g, pos + acShift, barW, mainScale, orientation, cfg);
                    }
                }
                if (cfg.showLabels && showValueAt(i)) {
                    // anchor the label beyond the PL outline when the plan column is taller
                    const cand = [p.value];
                    if (!lineMode && p.pl != null) { cand.push(p.pl); }
                    if (!lineMode && p.bm != null) { cand.push(p.bm); }
                    const anchor = capV(p.value >= 0 ? Math.max(...cand) : Math.min(...cand));
                    this.drawEndLabelAt(g, cx, anchor, p.value >= 0, mainScale,
                        orientation, valueTexts[i], cfg.labelFont, cfg.ink, 0, cfg.paper);
                    // compact mode: variance becomes a colored second label at the bar end
                    if (compact && p.varAbs != null) {
                        const good = cfg.isGood(p.varAbs, p);
                        const vColor = (p.varAbs === 0 || !cfg.isMaterial(p))
                            ? cfg.colors.py : (good ? cfg.colors.good : cfg.colors.bad);
                        const vText = p.varRel != null ? relTexts[i] : absTexts[i];
                        const gap = orientation === "columns"
                            ? cfg.labelFont + 2
                            : valueTexts[i].length * cfg.labelFont * 0.56 + 8;
                        this.drawEndLabelAt(g, cx, anchor, p.value >= 0, mainScale,
                            orientation, vText, cfg.labelFont, vColor, gap, cfg.paper);
                    }
                }
            }

            // waterfall-bridge brick: cascades from the running basis level to this
            // category's own contribution — on the bridge's own n+2 grid (index i+1,
            // slot 0 and n+1 are the basis/value anchor bars)
            if (panels.bridge && bridgeScale && cascade) {
                const bFrom = cascade.from[i], bTo = cascade.to[i];
                if (bFrom != null && bTo != null) {
                    const bPos = bridgeSlotPos(i + 1);
                    const bCx = bPos + bridgeSlotW / 2;
                    const good = cfg.isGood(bTo - bFrom, p);
                    const brickColor = bTo === bFrom ? cfg.colors.py : (good ? cfg.colors.good : cfg.colors.bad);
                    const hollowBad = cfg.hc && !good && bTo !== bFrom;
                    this.drawBar(g, bPos, bridgeSlotW, bFrom, bTo, bridgeScale, orientation,
                        hollowBad
                            ? { fill: cfg.paper, stroke: brickColor, "stroke-width": 1.4 }
                            : p.isFc
                                ? { fill: `url(#${good ? cfg.patGood : cfg.patBad})`, stroke: brickColor, "stroke-width": 1 }
                                : { fill: brickColor });
                    if (cfg.showLabels && showValueAt(i)) {
                        this.drawEndLabelAt(g, bCx, bTo, bTo >= bFrom, bridgeScale,
                            orientation, absTexts[i] || valueTexts[i], cfg.labelFont, cfg.ink, 0, cfg.paper);
                    }
                }
            }

            // absolute variance bars
            if (panels.abs && absScale && p.varAbs != null) {
                const good = cfg.isGood(p.varAbs, p);
                const mat = cfg.isMaterial(p);
                const color = (p.varAbs === 0 || !mat) ? cfg.colors.py : (good ? cfg.colors.good : cfg.colors.bad);
                const vw = barW; // IBCS: same width as the base bars
                const vx = cx - vw / 2;
                const hollowBad = cfg.hc && !good && p.varAbs !== 0;
                this.drawBar(g, vx, vw, 0, p.varAbs, absScale, orientation,
                    hollowBad
                        ? { fill: cfg.paper, stroke: color, "stroke-width": 1.4 }
                        : p.isFc && mat
                            ? { fill: `url(#${good ? cfg.patGood : cfg.patBad})`, stroke: color, "stroke-width": 1 }
                            : { fill: color });
                if (cfg.showLabels && showAbsAt(i)) {
                    this.drawEndLabel(g, vx + vw / 2, p.varAbs, absScale, orientation,
                        absTexts[i], cfg.labelFont, cfg.ink, 0, cfg.paper);
                }
            }

            // relative variance pins
            if (panels.rel && relScale && p.varRel != null) {
                const good = cfg.isGood(p.varRel, p);
                const color = (p.varRel === 0 || !cfg.isMaterial(p))
                    ? cfg.colors.py : (good ? cfg.colors.good : cfg.colors.bad);
                const c = cx;
                const zero = relScale(0);
                const end = relScale(p.varRel);
                const r = Math.max(2.5, Math.min(4.5, slotW * 0.12));
                const hollowPin = p.isFc || (cfg.hc && !good && p.varRel !== 0);
                if (orientation === "columns") {
                    this.el("line", { x1: c, y1: zero, x2: c, y2: end, stroke: color, "stroke-width": 1.6 }, g);
                    this.el("circle", { cx: c, cy: end, r, fill: hollowPin ? cfg.paper : color, stroke: color, "stroke-width": 1.6 }, g);
                } else {
                    this.el("line", { x1: zero, y1: c, x2: end, y2: c, stroke: color, "stroke-width": 1.6 }, g);
                    this.el("circle", { cx: end, cy: c, r, fill: hollowPin ? cfg.paper : color, stroke: color, "stroke-width": 1.6 }, g);
                }
                if (cfg.showLabels && showRelAt(i)) {
                    const flip = orientation === "columns" && p.varRel > 0 && panels.rel != null
                        && this.collidesPanelTitle(c, relTexts[i], cfg.labelFont,
                            relScale(p.varRel) - (r + 3) - cfg.labelFont,
                            panels.rel.y, region.x, `Δ${cfg.basisLabel} %`);
                    this.drawEndLabelAt(g, c, p.varRel, p.varRel >= 0 && !flip, relScale, orientation,
                        relTexts[i], cfg.labelFont, cfg.ink, r + 3, cfg.paper);
                }
            }

            // second-basis variance: bars + pins (dual variance)
            if (panels.abs2 && abs2Scale && p.var2Abs != null) {
                const good = cfg.isGood(p.var2Abs, p);
                const mat = cfg.isMaterial(p, p.var2Abs, p.var2Rel);
                const color = (p.var2Abs === 0 || !mat) ? cfg.colors.py : (good ? cfg.colors.good : cfg.colors.bad);
                const vw = barW; // IBCS: same width as the base bars
                const vx = cx - vw / 2;
                const hollowBad = cfg.hc && !good && p.var2Abs !== 0;
                this.drawBar(g, vx, vw, 0, p.var2Abs, abs2Scale, orientation,
                    hollowBad
                        ? { fill: cfg.paper, stroke: color, "stroke-width": 1.4 }
                        : p.isFc && mat
                            ? { fill: `url(#${good ? cfg.patGood : cfg.patBad})`, stroke: color, "stroke-width": 1 }
                            : { fill: color });
                if (cfg.showLabels && showAbs2At(i)) {
                    this.drawEndLabel(g, cx, p.var2Abs, abs2Scale, orientation,
                        abs2Texts[i], cfg.labelFont, cfg.ink, 0, cfg.paper);
                }
            }
            if (panels.rel2 && rel2Scale && p.var2Rel != null) {
                const good = cfg.isGood(p.var2Rel, p);
                const color = (p.var2Rel === 0 || !cfg.isMaterial(p, p.var2Abs, p.var2Rel))
                    ? cfg.colors.py : (good ? cfg.colors.good : cfg.colors.bad);
                const zero = rel2Scale(0);
                const end = rel2Scale(p.var2Rel);
                const r = Math.max(2.5, Math.min(4.5, slotW * 0.12));
                const hollowPin = p.isFc || (cfg.hc && !good && p.var2Rel !== 0);
                if (orientation === "columns") {
                    this.el("line", { x1: cx, y1: zero, x2: cx, y2: end, stroke: color, "stroke-width": 1.6 }, g);
                    this.el("circle", { cx, cy: end, r, fill: hollowPin ? cfg.paper : color, stroke: color, "stroke-width": 1.6 }, g);
                } else {
                    this.el("line", { x1: zero, y1: cx, x2: end, y2: cx, stroke: color, "stroke-width": 1.6 }, g);
                    this.el("circle", { cx: end, cy: cx, r, fill: hollowPin ? cfg.paper : color, stroke: color, "stroke-width": 1.6 }, g);
                }
                if (cfg.showLabels && showRel2At(i)) {
                    const flip = orientation === "columns" && p.var2Rel > 0 && panels.rel2 != null
                        && this.collidesPanelTitle(cx, rel2Texts[i], cfg.labelFont,
                            rel2Scale(p.var2Rel) - (r + 3) - cfg.labelFont,
                            panels.rel2.y, region.x, `Δ${cfg.basis2Label} %`);
                    this.drawEndLabelAt(g, cx, p.var2Rel, p.var2Rel >= 0 && !flip, rel2Scale, orientation,
                        rel2Texts[i], cfg.labelFont, cfg.ink, r + 3, cfg.paper);
                }
            }

            // category label (highlighted categories always get one, in bold)
            const isHl = cfg.highlight.has(p.cat.toLowerCase());
            if (showCatAt(i) || isHl) {
                this.drawCategoryLabel(g, p.cat, pos + slotW / 2, orientation, cfg.catFont,
                    region, step, panels.main, cfg.ink, isHl);
            }

            // comment marker (numbered circle at the inner end of the bar)
            if (p.commentNo != null && p.value != null) {
                this.drawCommentMarker(g, cx, p, mainScale, orientation, cfg);
            }

            this.attachInteraction(g, p, cfg);
            this.catGroups.push({ g, sel: p.sel });
        }

        // ------- waterfall-bridge connectors: link the basis anchor to the first brick,
        // each brick's end to the next one's start, and the last brick to the value anchor
        if (panels.bridge && bridgeScale && cascade) {
            const connector = (level: number, edgeEnd: number, edgeStart: number) => {
                if (orientation === "columns") {
                    this.el("line", {
                        x1: edgeEnd, y1: level, x2: edgeStart, y2: level,
                        stroke: cfg.subtle, "stroke-width": 1
                    }, bg);
                } else {
                    this.el("line", {
                        x1: level, y1: edgeEnd, x2: level, y2: edgeStart,
                        stroke: cfg.subtle, "stroke-width": 1
                    }, bg);
                }
            };
            if (cascade.from[0] != null) {
                connector(bridgeScale(cascade.basisSum), bridgeSlotPos(0) + bridgeSlotW, bridgeSlotPos(1));
            }
            for (let i = 0; i < n - 1; i++) {
                const a = cascade.to[i], b = cascade.from[i + 1];
                if (a == null || b == null) { continue; }
                connector(bridgeScale(a), bridgeSlotPos(i + 1) + bridgeSlotW, bridgeSlotPos(i + 2));
            }
            const lastTo = [...cascade.to].reverse().find(v => v != null);
            if (lastTo != null) {
                connector(bridgeScale(lastTo), bridgeSlotPos(n) + bridgeSlotW, bridgeSlotPos(n + 1));
            }
            // ------- reconciliation callout: the net bridge total as a circled badge
            // (IBCS "Überleitung" made explicit, e.g. "-343" / "+82" in the reference chart)
            const totalVar = cascade.valueSum - cascade.basisSum;
            this.drawBridgeCallout(panels.bridge, orientation, cfg, totalVar);
        }

        // ------- combo line: second measure over the columns, own zero-anchored scale
        if (cfg.hasLine && orientation === "columns" && !lineMode) {
            const overlay = this.el("g", {}, this.svg);
            const lVals = points.map(p => p.lineVal);
            const lScale = this.makePanelScale(extent(lVals), panels.main, "columns", labelPad);
            const cxOf = (i: number) => slotPos(i) + acShift + barW / 2;
            let d = "";
            points.forEach((p, i) => {
                if (p.lineVal == null) { return; }
                d += `${d ? "L" : "M"}${cxOf(i).toFixed(1)},${lScale(p.lineVal).toFixed(1)}`;
            });
            this.el("path", { d, fill: "none", stroke: cfg.ink, "stroke-width": 2 }, overlay);
            const lineTexts = points.map(p => p.lineVal != null ? cfg.fmtLine.format(p.lineVal) : "");
            const showLineAt = this.labelPredicate(points, lineTexts, cfg.labelFont, step, "columns");
            points.forEach((p, i) => {
                if (p.lineVal == null) { return; }
                this.el("circle", {
                    cx: cxOf(i), cy: lScale(p.lineVal), r: Math.max(2.6, 3 * this.fontK),
                    fill: cfg.paper, stroke: cfg.ink, "stroke-width": 1.6
                }, overlay);
                if (cfg.showLabels && showLineAt(i)) {
                    const lt = this.el("text", {
                        x: cxOf(i), y: lScale(p.lineVal) - 7, "text-anchor": "middle",
                        "font-size": Math.round(cfg.labelFont * 0.92), fill: cfg.ink, "font-family": FONT,
                        stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
                    }, overlay);
                    lt.textContent = lineTexts[i];
                }
            });
            // line-measure name at the top right of the main panel (its scale is its own)
            const nt = this.el("text", {
                x: panels.main.x + panels.main.w - 6, y: panels.main.y + Math.round(14 * this.fontK) - 4,
                "text-anchor": "end", "font-size": Math.round(10 * this.fontK), fill: cfg.subtle,
                "font-family": FONT, "font-weight": 600
            }, overlay);
            nt.textContent = this.truncate(`— ${cfg.lineName}`, panels.main.w * 0.5, 10 * this.fontK);
        }

        // ------- reference line behind the marks: dashed target line must not
        // strike through the value labels (they carry the message)
        if (cfg.refLine != null) {
            this.drawRefLine(bg, panels.main, mainScale, orientation, bandStart, bandEnd, cfg);
        }

        // ------- compare-on-click overlay: Δ between two picked categories
        if (this.compareActive && this.compareCats.length > 0) {
            this.drawCompareOverlay(cfg, orientation);
        }
    }

    /**
     * compare-on-click: with one pick, a dashed ring marks the pending selection;
     * with two, a bracket connects both bar ends and shows the difference
     * (second minus first) as absolute + % — like a hand-drawn Δ annotation.
     */
    private drawCompareOverlay(cfg: ChartConfig, orientation: Orientation): void {
        const k = this.fontK;
        const picked = this.compareCats
            .map(c => ({ cat: c, a: this.compareAnchors.get(c) }))
            .filter(x => x.a != null) as { cat: string; a: { band: number; end: number; value: number } }[];
        if (picked.length === 0) { return; }
        const overlay = this.el("g", {}, this.svg);
        if (picked.length === 1) {
            const { a } = picked[0];
            const cx = orientation === "columns" ? a.band : a.end;
            const cy = orientation === "columns" ? a.end : a.band;
            this.el("circle", {
                cx, cy, r: 5.5 * k, fill: "none", stroke: cfg.ink,
                "stroke-width": 1.6, "stroke-dasharray": "3,2"
            }, overlay);
            return;
        }
        const [p1, p2] = picked;
        const d = p2.a.value - p1.a.value;
        const pct = p1.a.value !== 0 ? (d / Math.abs(p1.a.value)) * 100 : null;
        const text = `Δ ${this.fmtSigned(cfg.fmtVar, d)}${pct != null ? ` (${this.fmtPercent(pct)})` : ""}`;
        const font = Math.round(Math.max(10, cfg.labelFont));
        const stroke = { stroke: cfg.ink, "stroke-width": 1.4, fill: "none" } as const;
        if (orientation === "columns") {
            const yLine = Math.min(p1.a.end, p2.a.end) - 14 * k;
            this.el("path", {
                d: `M${p1.a.band},${p1.a.end}L${p1.a.band},${yLine}L${p2.a.band},${yLine}L${p2.a.band},${p2.a.end}`,
                ...stroke, "stroke-dasharray": "4,3"
            }, overlay);
            const t = this.el("text", {
                x: (p1.a.band + p2.a.band) / 2, y: yLine - 5, "text-anchor": "middle",
                "font-size": font, "font-weight": 600, fill: cfg.ink, "font-family": FONT,
                stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
            }, overlay);
            t.textContent = text;
        } else {
            const xLine = Math.max(p1.a.end, p2.a.end) + 14 * k;
            this.el("path", {
                d: `M${p1.a.end},${p1.a.band}L${xLine},${p1.a.band}L${xLine},${p2.a.band}L${p2.a.end},${p2.a.band}`,
                ...stroke, "stroke-dasharray": "4,3"
            }, overlay);
            const t = this.el("text", {
                x: xLine + 5, y: (p1.a.band + p2.a.band) / 2 + font * 0.35,
                "font-size": font, "font-weight": 600, fill: cfg.ink, "font-family": FONT,
                stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
            }, overlay);
            t.textContent = text;
        }
    }

    /**
     * reconciliation callout for the waterfall-bridge panel: the net total variance
     * (valueSum - basisSum) as a circled badge — the "Überleitung" made explicit,
     * matching the reference chart's circled "-343" / "+82" summary boxes.
     */
    private drawBridgeCallout(rect: Rect, orientation: Orientation, cfg: ChartConfig, totalVar: number): void {
        const text = this.fmtSigned(cfg.fmtVar, totalVar);
        const w = Math.max(44, text.length * 6.5 + 16), h = 20;
        const cx = rect.x + rect.w - w / 2 - 4;
        const cy = orientation === "columns" ? rect.y + rect.h - h / 2 - 2 : rect.y + rect.h / 2;
        const good = cfg.isGood(totalVar);
        const color = totalVar === 0 ? cfg.subtle : (good ? cfg.colors.good : cfg.colors.bad);
        const g = this.el("g", {}, this.svg);
        this.el("rect", {
            x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: h / 2,
            fill: cfg.paper, stroke: color, "stroke-width": 1.6
        }, g);
        const t = this.el("text", {
            x: cx, y: cy + 4, "text-anchor": "middle", "font-size": 11,
            "font-weight": 600, fill: color, "font-family": FONT
        }, g);
        t.textContent = text;
    }

    /**
     * clickable sort toggle for the waterfall-bridge style. Persists the choice to the
     * 'chart.sortByImpact' format-pane property via the host, so it survives re-renders,
     * bookmarks and report reloads instead of living only in transient component state.
     */
    private drawSortButton(width: number, cfg: ChartConfig): void {
        const cx = width - 14, cy = 14;
        const btn = this.el("g", {
            "class": "icd-sortbtn", tabindex: "0", role: "button"
        }, this.svg) as SVGGElement;
        const sortLabel = cfg.sortByImpact
            ? this.locStr("Btn_SortOff", "Remove impact sorting")
            : this.locStr("Btn_SortOn", "Sort by impact (largest driver first)");
        btn.setAttribute("aria-label", sortLabel);
        const sortTip = this.el("title", {}, btn);
        sortTip.textContent = sortLabel;
        this.el("circle", {
            cx, cy, r: 9, fill: cfg.sortByImpact ? cfg.colors.ac : cfg.paper,
            stroke: cfg.hc ? cfg.ink : cfg.subtle, "stroke-width": 1
        }, btn);
        const icon = this.el("text", {
            x: cx, y: cy + 4, "text-anchor": "middle", "font-size": 12,
            fill: cfg.sortByImpact ? cfg.paper : cfg.ink, "font-family": FONT
        }, btn);
        icon.textContent = "⇅";
        btn.style.cursor = "pointer";
        const toggle = () => {
            this.host.persistProperties({
                merge: [{
                    objectName: "chart",
                    selector: null,
                    properties: { sortByImpact: !cfg.sortByImpact }
                }]
            });
        };
        btn.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); toggle(); });
        btn.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key !== "Enter" && e.key !== " ") { return; }
            e.preventDefault(); e.stopPropagation(); toggle();
        });
    }

    /**
     * in-chart button row for the integrated/category bridge modes (top-right):
     * ΔPY|ΔPL segmented reference switch (persists chart.comparisonMode so the end
     * user can flip the variance basis in the report), ⇅ sort toggle and ▶ build
     * animation — mirroring the reference charts' interactive toolbar.
     */
    private drawChartButtons(width: number, cfg: ChartConfig,
        opts: { showRef: boolean; showSort: boolean; showPlay: boolean }): void {
        const k = this.fontK;
        const bh = Math.round(18 * k), font = Math.round(11 * k);
        let xRight = width - 6;
        const persist = (properties: Record<string, unknown>) => {
            this.host.persistProperties({ merge: [{ objectName: "chart", selector: null, properties }] });
        };
        const roundBtn = (icon: string, active: boolean, label: string, onClick: () => void) => {
            const r = bh / 2;
            const cx = xRight - r, cy = 6 + r;
            xRight -= bh + 6;
            const btn = this.el("g", { tabindex: "0", role: "button" }, this.svg) as SVGGElement;
            btn.setAttribute("aria-label", label);
            const tip = this.el("title", {}, btn);
            tip.textContent = label;
            this.el("circle", {
                cx, cy, r, fill: active ? cfg.colors.ac : cfg.paper,
                stroke: cfg.hc ? cfg.ink : cfg.subtle, "stroke-width": 1
            }, btn);
            const t = this.el("text", {
                x: cx, y: cy + font * 0.36, "text-anchor": "middle", "font-size": font,
                fill: active ? cfg.paper : cfg.ink, "font-family": FONT
            }, btn);
            t.textContent = icon;
            btn.style.cursor = "pointer";
            btn.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); onClick(); });
            btn.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key !== "Enter" && e.key !== " ") { return; }
                e.preventDefault(); e.stopPropagation(); onClick();
            });
        };
        if (opts.showPlay) {
            roundBtn("▶", false, this.locStr("Btn_Play", "Play build-up animation"), () => this.playBuild());
        }
        if (opts.showSort) {
            roundBtn("⇅", cfg.sortByImpact, cfg.sortByImpact
                ? this.locStr("Btn_SortOff", "Remove impact sorting") : this.locStr("Btn_SortOn", "Sort by impact (largest driver first)"),
                () => persist({ sortByImpact: !cfg.sortByImpact }));
        }
        if (opts.showRef) {
            // segmented ΔPY | ΔPL — active side filled dark, like the reference toolbar
            const segW = Math.round(34 * k);
            const x0 = xRight - segW * 2;
            const seg = (x: number, text: string, active: boolean, label: string, onClick: () => void) => {
                const btn = this.el("g", { tabindex: "0", role: "button" }, this.svg) as SVGGElement;
                btn.setAttribute("aria-label", label);
                const tip = this.el("title", {}, btn);
                tip.textContent = label;
                this.el("rect", {
                    x, y: 6, width: segW, height: bh,
                    fill: active ? cfg.colors.ac : cfg.paper,
                    stroke: cfg.hc ? cfg.ink : cfg.subtle, "stroke-width": 1
                }, btn);
                const t = this.el("text", {
                    x: x + segW / 2, y: 6 + bh / 2 + font * 0.36, "text-anchor": "middle",
                    "font-size": font, fill: active ? cfg.paper : cfg.ink, "font-family": FONT
                }, btn);
                t.textContent = text;
                btn.style.cursor = "pointer";
                btn.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); onClick(); });
                btn.addEventListener("keydown", (e: KeyboardEvent) => {
                    if (e.key !== "Enter" && e.key !== " ") { return; }
                    e.preventDefault(); e.stopPropagation(); onClick();
                });
            };
            seg(x0, "ΔPY", cfg.basisMode === "py", this.locStr("Btn_BasisPy", "Variance basis: previous year (PY)"),
                () => persist({ comparisonMode: "py" }));
            seg(x0 + segW, "ΔPL", cfg.basisMode === "plan", this.locStr("Btn_BasisPl", "Variance basis: plan (PL)"),
                () => persist({ comparisonMode: "plan" }));
            xRight = x0 - 6;
        }
    }

    /** ▶ build animation: reveals the per-category mark groups one after another */
    private playBuild(): void {
        for (const t of this.animTimers) { clearTimeout(t); }
        this.animTimers = [];
        const seq = this.animGroups;
        if (seq.length === 0) { return; }
        for (const gs of seq) { for (const g of gs) { g.style.opacity = "0"; } }
        seq.forEach((gs, i) => {
            this.animTimers.push(window.setTimeout(() => {
                for (const g of gs) {
                    g.style.transition = "opacity 0.18s";
                    g.style.opacity = "1";
                }
            }, 80 + i * 140));
        });
    }

    private drawTitleBlock(width: number, points: DataPoint[], cfg: ChartConfig,
        maxAbs: number, orientation: Orientation): number {
        const s = this.formattingSettings.ibcsTitleCard;
        const kpi = (s.kpi.value || this.measureName || "").trim();
        // derive the unit suffix (e.g. "M€") from a formatted sample value
        const unit = cfg.fmt.format(maxAbs).replace(/[0-9.,\s +\-−]/g, "");
        let period = (s.period.value || "").trim();
        if (!period && orientation === "columns" && points.length > 1) {
            period = `${points[0].cat} – ${points[points.length - 1].cat}`;
        }
        const valueScen = ["AC", cfg.hasFc ? "FC" : ""].filter(x => x).join(", ");
        const refScen = [
            cfg.basisMode === "plan" ? "PL" : cfg.basisMode === "fcrev" ? "FC Vm" : "PY",
            cfg.basisMode !== "py" && cfg.hasPy ? "PY" : "",
            cfg.basisMode !== "plan" && cfg.hasPl ? "PL" : ""
        ].filter(x => x).join(", ");
        const hasRef = cfg.hasPy || cfg.hasPl || cfg.basisMode === "fcrev";

        const k = this.fontK;
        const f1 = Math.round(12 * k), f2 = Math.round(11 * k);
        const t = this.el("text", {
            x: 6, y: f1 + 2, "font-size": f1, "font-family": FONT, fill: cfg.ink
        }, this.svg);
        const span = (text: string, bold: boolean) => {
            const ts = document.createElementNS(SVG_NS, "tspan");
            if (bold) { ts.setAttribute("font-weight", "600"); }
            ts.textContent = text;
            t.appendChild(ts);
        };
        if (kpi) { span(kpi, true); }
        if (unit) { span(` in ${unit}`, false); }
        span(`${kpi || unit ? " · " : ""}${period ? period + ": " : ""}${valueScen}${hasRef ? " vs. " + refScen : ""}`, false);

        let message = (s.message.value || "").trim();
        if (!message && s.autoMessage.value) {
            message = this.buildAutoMessage(points, cfg);
        }
        if (message) {
            const m = this.el("text", {
                x: 6, y: f1 + f2 + 7, "font-size": f2, "font-family": FONT,
                fill: cfg.ink, "font-style": "italic"
            }, this.svg);
            m.textContent = this.truncate(message, width - 12, f2);
            return f1 + f2 + 15;
        }
        return f1 + 10;
    }

    /**
     * IBCS SAY, automated: overall variance plus the strongest and weakest
     * driver — e.g. "ΔPL +171K€ (+1,4%) · stärkster Treiber: Jul (+55K€) · schwächster: Feb (−39K€)"
     */
    private buildAutoMessage(points: DataPoint[], cfg: ChartConfig): string {
        const withVar = points.filter(p => p.varAbs != null);
        if (withVar.length === 0) { return ""; }
        let sumVar = 0, sumBasis = 0;
        if (cfg.cumulative) {
            const last = withVar[withVar.length - 1];
            sumVar = last.varAbs as number;
            sumBasis = Math.abs(last.basis as number);
        } else {
            for (const p of withVar) {
                sumVar += p.varAbs as number;
                sumBasis += Math.abs(p.basis as number);
            }
        }
        // rank by business impact via cfg.isGood — the global invert alone would
        // ignore the per-category invert list (e.g. an inverted cost KPI)
        const score = (p: DataPoint) => {
            const v = p.varAbs as number;
            return cfg.isGood(v, p) ? Math.abs(v) : -Math.abs(v);
        };
        const sorted = [...withVar].sort((a, b) => score(b) - score(a));
        const best = sorted[0];
        const worst = sorted[sorted.length - 1];
        const parts = [
            `Δ${cfg.basisLabel} ${this.fmtSigned(cfg.fmtVar, sumVar)}`
            + (sumBasis !== 0 ? ` (${this.fmtPercent((sumVar / sumBasis) * 100)})` : "")
        ];
        if (withVar.length >= 3 && best !== worst && !cfg.cumulative) {
            parts.push(`stärkster Treiber: ${best.cat} (${this.fmtSigned(cfg.fmtVar, best.varAbs as number)})`);
            parts.push(`schwächster: ${worst.cat} (${this.fmtSigned(cfg.fmtVar, worst.varAbs as number)})`);
        }
        return parts.join(" · ");
    }

    /** running YTD totals for value/PY/PL with variances recomputed on the cumulated numbers */
    /** waterfall-bridge: orders by |variance| descending; a top-N "Rest" row stays pinned last */
    private sortByImpact(pts: DataPoint[]): DataPoint[] {
        const rest = pts.filter(p => p.isRest);
        const main = pts.filter(p => !p.isRest)
            .map((p, i) => ({ p, i }))
            .sort((a, b) => (Math.abs(b.p.varAbs ?? 0) - Math.abs(a.p.varAbs ?? 0)) || (a.i - b.i))
            .map(x => x.p);
        return [...main, ...rest];
    }

    /**
     * waterfall-bridge cascade: running "from"/"to" per point, starting at the sum of all
     * basis values and stepping by each point's own variance — mirrors buildWaterfall's
     * comparison-basis mode but stays in the caller's chosen orientation (columns/bars).
     */
    private buildCascade(pts: DataPoint[]): Cascade {
        const basisSum = pts.reduce((a, p) => a + (p.basis ?? 0), 0);
        let cum = basisSum, acSum = 0, fcSum = 0;
        const from: (number | null)[] = [], to: (number | null)[] = [];
        for (const p of pts) {
            // points with only one side still move the bridge (new category: Δ = value,
            // discontinued: Δ = −basis) — the end anchor stays the true AC/FC total
            const delta = p.varAbs != null
                ? p.varAbs
                : (p.value != null || p.basis != null) ? (p.value ?? 0) - (p.basis ?? 0) : null;
            if (delta == null) { from.push(null); to.push(null); continue; }
            from.push(cum);
            cum += delta;
            to.push(cum);
            if (p.value != null) {
                if (p.isFc) { fcSum += p.value; } else { acSum += p.value; }
            }
        }
        return { from, to, basisSum, valueSum: cum, acSum, fcSum };
    }

    private cumulate(pts: DataPoint[], basisMode: Basis,
        kind: "ytd" | "qtd" | "r12" = "ytd", fiscalStart = 1): DataPoint[] {
        // YTD resets at the fiscal-year start, QTD at each fiscal quarter start; when
        // the labels carry no parseable month, YTD runs through and QTD uses 3er-Blöcke.
        const months = pts.map(p => this.monthOf(p.cat));
        const parsed = months.every(m => m != null);
        const resetAt = (i: number): boolean => {
            if (i === 0 || kind === "r12") { return false; }
            if (kind === "ytd") { return parsed ? months[i] === fiscalStart : false; }
            return parsed ? ((months[i] as number) - fiscalStart + 12) % 3 === 0 : i % 3 === 0;
        };
        const winStart = (i: number) => kind === "r12" ? Math.max(0, i - 11) : 0;
        const winSum = (i: number, get: (p: DataPoint) => number | null): number => {
            let acc = 0;
            for (let j = winStart(i); j <= i; j++) { acc += get(pts[j]) ?? 0; }
            return acc;
        };
        let cv = 0, cpy = 0, cpl = 0, cbm = 0, cfp = 0;
        return pts.map((p, i) => {
            if (resetAt(i)) { cv = 0; cpy = 0; cpl = 0; cbm = 0; cfp = 0; }
            if (p.value != null) { cv += p.value; }
            if (p.py != null) { cpy += p.py; }
            if (p.pl != null) { cpl += p.pl; }
            if (p.bm != null) { cbm += p.bm; }
            if (p.fcPrev != null) { cfp += p.fcPrev; }
            const value = p.value != null ? (kind === "r12" ? winSum(i, x => x.value) : cv) : null;
            const py = p.py != null ? (kind === "r12" ? winSum(i, x => x.py) : cpy) : null;
            const pl = p.pl != null ? (kind === "r12" ? winSum(i, x => x.pl) : cpl) : null;
            const fcPrev = p.fcPrev != null ? (kind === "r12" ? winSum(i, x => x.fcPrev) : cfp) : null;
            const basis = basisMode === "plan" ? pl : basisMode === "fcrev" ? fcPrev : py;
            const varAbs = (value != null && basis != null) ? value - basis : null;
            const varRel = (varAbs != null && basis != null && basis !== 0)
                ? (varAbs / Math.abs(basis)) * 100 : null;
            const basis2 = this.basis2Mode === "plan" ? pl : py;
            const var2Abs = (value != null && basis2 != null) ? value - basis2 : null;
            const var2Rel = (var2Abs != null && basis2 != null && basis2 !== 0)
                ? (var2Abs / Math.abs(basis2)) * 100 : null;
            return {
                ...p,
                ac: p.isFc ? null : value,
                fc: p.isFc ? value : null,
                value, py, pl, fcPrev, basis, varAbs, varRel, var2Abs, var2Rel,
                bm: p.bm != null ? (kind === "r12" ? winSum(i, x => x.bm) : cbm) : null
            };
        });
    }

    /** keeps the N largest categories (by base value) and aggregates the tail into one "Rest" row */
    private applyTopN(points: DataPoint[], topN: number): DataPoint[] {
        const sorted = [...points].sort((a, b) => (b.value ?? -Infinity) - (a.value ?? -Infinity));
        const head = sorted.slice(0, topN);
        const tail = sorted.slice(topN);

        const sum = (vals: (number | null)[]): number | null => {
            let acc: number | null = null;
            for (const v of vals) {
                if (v == null) { continue; }
                acc = (acc ?? 0) + v;
            }
            return acc;
        };
        const ac = sum(tail.map(p => p.ac));
        const py = sum(tail.map(p => p.py));
        const pl = sum(tail.map(p => p.pl));
        const fc = sum(tail.map(p => p.fc));
        const value = sum(tail.map(p => p.value));
        const basis = sum(tail.map(p => p.basis));
        const varAbs = (value != null && basis != null) ? value - basis : null;
        const varRel = (varAbs != null && basis != null && basis !== 0)
            ? (varAbs / Math.abs(basis)) * 100 : null;
        const basis2Sum = this.basis2Mode === "plan" ? pl : py;
        const var2Abs = (value != null && basis2Sum != null) ? value - basis2Sum : null;
        const var2Rel = (var2Abs != null && basis2Sum != null && basis2Sum !== 0)
            ? (var2Abs / Math.abs(basis2Sum)) * 100 : null;
        const rest: DataPoint = {
            cat: `${this.locStr("Label_Rest", "Other")} (${tail.length})`,
            catLevels: null,
            ac, py, pl, fc, value,
            isFc: false, basis, varAbs, varRel, var2Abs, var2Rel,
            bm: sum(tail.map(p => p.bm)),
            fcPrev: sum(tail.map(p => p.fcPrev)),
            lineVal: null, stackSeries: null,
            comment: null, commentNo: null,
            group: head.length > 0 ? head[0].group : null,
            rowType: null,
            isRest: true,
            sel: null
        };
        return [...head, rest];
    }

    private drawCommentMarker(parent: SVGElement, bandCenter: number, p: DataPoint,
        scale: Scale, orientation: Orientation, cfg: ChartConfig): void {
        const r = 7;
        const end = scale(p.value as number);
        const zero = scale(0);
        const len = Math.abs(end - zero);
        // sit just inside the bar end; center in very short bars
        const inset = len >= 2 * r + 8 ? r + 5 : len / 2;
        const towardZero = end < zero ? inset : -inset;
        const cx = orientation === "columns" ? bandCenter : end + towardZero;
        const cy = orientation === "columns" ? end + towardZero : bandCenter;
        this.el("circle", {
            cx, cy, r, fill: cfg.paper, stroke: cfg.ink, "stroke-width": 1.2
        }, parent);
        const t = this.el("text", {
            x: cx, y: cy + 3, "text-anchor": "middle",
            "font-size": 9, fill: cfg.ink, "font-family": FONT, "font-weight": 600
        }, parent);
        t.textContent = String(p.commentNo);
    }

    /** numbered footnote list; stays visible in PDF/PPT exports where tooltips are lost */
    private drawCommentPanel(region: Rect, pts: DataPoint[], cfg: ChartConfig): void {
        const font = 10;
        const lineH = font + 4;
        const textX = region.x + 26;
        const maxChars = Math.max(8, Math.floor((region.w - 34) / (font * 0.52)));
        // subtle divider between chart and comments
        this.el("line", {
            x1: region.x + 4, y1: region.y + 6, x2: region.x + 4, y2: region.y + region.h - 6,
            stroke: cfg.hc ? cfg.ink : "#E0E0E0", "stroke-width": 1
        }, this.svg);

        let y = region.y + 16;
        for (const p of pts) {
            const lines = this.wrapText(`${p.cat} — ${p.comment}`, maxChars);
            const needed = lines.length * lineH + 8;
            if (y + needed > region.y + region.h) {
                const more = this.el("text", {
                    x: textX, y, "font-size": font, fill: cfg.subtle, "font-family": FONT
                }, this.svg);
                more.textContent = "…";
                break;
            }
            const no = this.el("text", {
                x: region.x + 12, y: y + 1, "font-size": font + 2, fill: cfg.ink,
                "font-family": FONT
            }, this.svg);
            no.textContent = this.circledNo(p.commentNo as number);
            for (let li = 0; li < lines.length; li++) {
                const t = this.el("text", {
                    x: textX, y: y + li * lineH, "font-size": font,
                    fill: cfg.ink, "font-family": FONT,
                    "font-weight": li === 0 ? 600 : 400
                }, this.svg);
                t.textContent = lines[li];
            }
            y += needed;
        }
    }

    /** greedy word wrap by estimated character budget per line */
    private wrapText(text: string, maxChars: number): string[] {
        const words = text.split(/\s+/);
        const lines: string[] = [];
        let cur = "";
        for (const w of words) {
            if (cur && (cur.length + 1 + w.length) > maxChars) {
                lines.push(cur);
                cur = w;
            } else {
                cur = cur ? cur + " " + w : w;
            }
        }
        if (cur) { lines.push(cur); }
        return lines;
    }

    /** circled digit for tooltips: ①…⑳, then (n) */
    private circledNo(no: number): string {
        return no >= 1 && no <= 20 ? String.fromCodePoint(0x2460 + no - 1) : `(${no})`;
    }

    /** Σ header: total value plus overall variance vs. the comparison basis */
    private drawTotalHeader(parent: SVGElement, region: Rect, points: DataPoint[], cfg: ChartConfig): void {
        let sum = 0, sumVar = 0, sumBasis = 0, any = false, anyVar = false;
        for (const p of points) {
            if (p.value != null) { any = true; }
            if (p.varAbs != null && p.basis != null) { anyVar = true; }
            if (cfg.cumulative) {
                // cumulated points already carry running totals — take the last ones
                if (p.value != null) { sum = p.value; }
                if (p.varAbs != null && p.basis != null) { sumVar = p.varAbs; sumBasis = Math.abs(p.basis); }
            } else {
                if (p.value != null) { sum += p.value; }
                if (p.varAbs != null && p.basis != null) {
                    sumVar += p.varAbs;
                    sumBasis += Math.abs(p.basis);
                }
            }
        }
        if (!any) { return; }

        const hFont = Math.round(11 * this.fontK);
        const t = this.el("text", {
            x: region.x + region.w - 6, y: region.y + hFont + 1, "text-anchor": "end",
            "font-size": hFont, "font-family": FONT
        }, parent);
        const span = (text: string, fill: string, bold: boolean) => {
            const ts = document.createElementNS(SVG_NS, "tspan");
            ts.setAttribute("fill", fill);
            if (bold) { ts.setAttribute("font-weight", "600"); }
            ts.textContent = text;
            t.appendChild(ts);
        };
        // with sum-safe labels the Σ must be quantized identically to the labels,
        // otherwise formatter edge-rounding could still disagree by one quantum
        const sumShown = cfg.sumSafe && !cfg.cumulative
            ? (() => { const div = cfg.fmtUnit || 1, f = Math.pow(10, cfg.fmtPrec);
                return Math.round((sum / div) * f) / f * div; })()
            : sum;
        span(`Σ ${cfg.fmt.format(sumShown)}`, cfg.ink, true);
        if (anyVar) {
            const good = cfg.isGood(sumVar);
            const color = sumVar === 0 ? cfg.subtle : (good ? cfg.colors.good : cfg.colors.bad);
            span(`   Δ${cfg.basisLabel} `, cfg.subtle, false);
            span(this.fmtSigned(cfg.fmtVar, sumVar), color, true);
            if (sumBasis !== 0) {
                span(` · ${this.fmtPercent((sumVar / sumBasis) * 100)}`, color, true);
            }
        }
        // rounding hint: with sum-safe rounding OFF, flag when the rounded labels
        // do not add up to the rounded Σ (the classic board-meeting question)
        if (!cfg.sumSafe && !cfg.cumulative && cfg.showLabels) {
            const div = cfg.fmtUnit || 1;
            const f = Math.pow(10, cfg.fmtPrec);
            let labelSum = 0, totalQ = 0;
            for (const p of points) {
                if (p.value == null) { continue; }
                const q = (p.value / div) * f;
                labelSum += Math.round(q);
                totalQ += q;
            }
            if (labelSum !== Math.round(totalQ)) {
                const ht = this.el("text", {
                    x: region.x + region.w - 6, y: region.y + hFont * 2 + 3, "text-anchor": "end",
                    "font-size": Math.round(hFont * 0.82), fill: cfg.subtle,
                    "font-family": FONT, "font-style": "italic"
                }, parent);
                ht.textContent = this.locStr("Hint_Rounding", "Totals may differ due to rounding");
            }
        }
    }

    /** thin overlay line with the trailing N-period average of the base values */
    private drawMovingAverage(parent: SVGElement, points: DataPoint[],
        cxOf: (i: number) => number, scale: Scale, cfg: ChartConfig): void {
        const win = cfg.movingAvg;
        let d = "";
        let lastX = 0, lastY = 0, any = false;
        for (let i = win - 1; i < points.length; i++) {
            const slice = points.slice(i - win + 1, i + 1).map(p => p.value);
            if (slice.some(v => v == null)) { continue; }
            const avg = (slice as number[]).reduce((a, b) => a + b, 0) / win;
            const x = cxOf(i), y = scale(avg);
            d += d && any ? `L${x},${y}` : `M${x},${y}`;
            lastX = x; lastY = y; any = true;
        }
        if (!any) { return; }
        this.el("path", {
            d, fill: "none", stroke: cfg.subtle, "stroke-width": 1.5, "stroke-opacity": 0.9
        }, parent);
        const t = this.el("text", {
            x: lastX + 2, y: lastY + 12, "font-size": 9, fill: cfg.subtle, "font-family": FONT,
            stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
        }, parent);
        t.textContent = `Ø${win}`;
    }

    /** IBCS line notation: AC solid (FC segments dashed), PY thin grey, PL thin dashed */
    private drawLinePaths(parent: SVGElement, points: DataPoint[],
        cxOf: (i: number) => number, scale: Scale, cfg: ChartConfig): void {
        const cap = (v: number) => cfg.capMax != null ? Math.min(v, cfg.capMax) : v;
        const path = (acc: (p: DataPoint) => number | null,
            style: Record<string, string | number>, splitFc: boolean) => {
            let dSolid = "", dDash = "";
            let prev: { x: number; y: number; fc: boolean } | null = null;
            for (let i = 0; i < points.length; i++) {
                const v = acc(points[i]);
                if (v == null) { prev = null; continue; }
                const pt = { x: cxOf(i), y: scale(cap(v)), fc: points[i].isFc };
                if (prev) {
                    const seg = `M${prev.x},${prev.y}L${pt.x},${pt.y}`;
                    if (splitFc && (prev.fc || pt.fc)) { dDash += seg; } else { dSolid += seg; }
                }
                prev = pt;
            }
            if (dSolid) { this.el("path", { d: dSolid, fill: "none", ...style }, parent); }
            if (dDash) {
                this.el("path", { d: dDash, fill: "none", ...style, "stroke-dasharray": "5,4" }, parent);
            }
        };
        if (cfg.hasPy) { path(p => p.py, { stroke: cfg.colors.py, "stroke-width": 1.4 }, false); }
        if (cfg.hasPl) { path(p => p.pl, { stroke: cfg.colors.pl, "stroke-width": 1.2, "stroke-dasharray": "5,3" }, false); }
        path(p => p.value, { stroke: cfg.colors.ac, "stroke-width": 2 }, true);
    }

    private parseRefLine(): number | null {
        const raw = String(this.formattingSettings.scaleCard.refLine.value || "")
            .trim().replace(/\s/g, "").replace(",", ".");
        if (!raw) { return null; }
        // accept k/M/B (and German Mio/Mrd initials) as magnitude suffixes
        const m = /^(-?\d*\.?\d+)([kKmMbB]?)$/.exec(raw);
        if (!m) { return null; }
        const mult = { k: 1e3, m: 1e6, b: 1e9 }[m[2].toLowerCase()] ?? 1;
        const v = parseFloat(m[1]) * mult;
        return isFinite(v) ? v : null;
    }

    /** dashed target/threshold line with label at the far end of the base chart */
    private drawRefLine(parent: SVGElement, rect: Rect, scale: Scale, orientation: Orientation,
        bandStart: number, bandEnd: number, cfg: ChartConfig): void {
        const v = cfg.refLine as number;
        const pos = scale(v);
        const label = cfg.refLineLabel || cfg.fmt.format(v);
        if (orientation === "columns") {
            this.el("line", {
                x1: bandStart, y1: pos, x2: bandEnd, y2: pos,
                stroke: cfg.ink, "stroke-width": 1.1, "stroke-dasharray": "7,3"
            }, parent);
            const t = this.el("text", {
                x: bandStart + 2, y: pos - 4, "text-anchor": "start", "font-size": 9,
                fill: cfg.ink, "font-family": FONT,
                stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
            }, parent);
            t.textContent = label;
        } else {
            this.el("line", {
                x1: pos, y1: bandStart, x2: pos, y2: bandEnd,
                stroke: cfg.ink, "stroke-width": 1.1, "stroke-dasharray": "7,3"
            }, parent);
            const t = this.el("text", {
                x: pos + 3, y: bandStart + 8, "text-anchor": "start", "font-size": 9,
                fill: cfg.ink, "font-family": FONT,
                stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
            }, parent);
            t.textContent = label;
        }
    }

    /** IBCS outlier notation: double break stroke near the capped bar end */
    private drawCapMarker(parent: SVGElement, bp: number, bw: number, scale: Scale,
        orientation: Orientation, cfg: ChartConfig): void {
        const end = scale(cfg.capMax as number);
        const stroke = (offset: number, color: string, w: number) => {
            if (orientation === "columns") {
                this.el("line", {
                    x1: bp - bw * 0.15, y1: end + 10 + offset + 2,
                    x2: bp + bw * 1.15, y2: end + 10 + offset - 2,
                    stroke: color, "stroke-width": w
                }, parent);
            } else {
                this.el("line", {
                    x1: end - 10 - offset - 2, y1: bp - bw * 0.15,
                    x2: end - 10 - offset + 2, y2: bp + bw * 1.15,
                    stroke: color, "stroke-width": w
                }, parent);
            }
        };
        // paper gap first, then the two ink strokes
        stroke(2, cfg.paper, 7);
        stroke(0, cfg.ink, 1.4);
        stroke(4, cfg.ink, 1.4);
    }

    /**
     * label thinning: returns a predicate deciding which indices get a label.
     * k <= 1 → all; k <= 4 → every k-th anchored at the last point;
     * denser → only first, last, min and max.
     */
    private labelPredicate(points: DataPoint[], texts: string[], fontSize: number,
        step: number, orientation: Orientation): (i: number) => boolean {
        const n = points.length;
        let need: number;
        if (orientation === "columns") {
            const maxLen = texts.reduce((a, t) => Math.max(a, t.length), 0);
            need = maxLen * fontSize * 0.56 + 6;
        } else {
            need = fontSize + 4;
        }
        const k = Math.max(1, Math.ceil(need / Math.max(step, 1)));
        if (k <= 1) { return () => true; }
        if (k <= 4) { return (i: number) => (n - 1 - i) % k === 0; }
        let iMin = 0, iMax = 0;
        for (let i = 0; i < n; i++) {
            const v = points[i].value;
            if (v == null) { continue; }
            if (v < (points[iMin].value ?? Infinity)) { iMin = i; }
            if (v > (points[iMax].value ?? -Infinity)) { iMax = i; }
        }
        return (i: number) => i === 0 || i === n - 1 || i === iMin || i === iMax;
    }

    /** best-effort month number (1-12) from a category label, else null;
     *  quarter labels (Q1…Q4 / "Quartal 1") map to their first month, so the
     *  YTD reset fires at the fiscal-year quarter and QTD resets each quarter */
    private monthOf(label: string): number | null {
        const names: { [k: string]: number } = {
            jan: 1, feb: 2, "mär": 3, maerz: 3, mar: 3, apr: 4, mai: 5, may: 5, jun: 6,
            jul: 7, aug: 8, sep: 9, okt: 10, oct: 10, nov: 11, dez: 12, dec: 12
        };
        const m = label.toLowerCase().match(/jan|feb|mär|maerz|mar|apr|mai|may|jun|jul|aug|sep|okt|oct|nov|dez|dec/);
        if (m) { return names[m[0]]; }
        const q = label.toLowerCase().match(/^q(?:uartal)?\s*([1-4])/);
        if (q) { return (parseInt(q[1], 10) - 1) * 3 + 1; }
        const num = label.match(/^(\d{1,2})(?:[./-]|$)/);
        if (num) { const n = parseInt(num[1], 10); if (n >= 1 && n <= 12) { return n; } }
        return null;
    }

    private resolveBasisLabel(): Basis {
        // the basis parseData actually used — stored there, so an explicit
        // comparisonMode wins even when PL happens to equal PY
        return this.basisMode;
    }

    // ------------------------------------------------------------ primitives

    private el<K extends keyof SVGElementTagNameMap>(
        tag: K, attrs: Record<string, string | number>, parent: Node
    ): SVGElementTagNameMap[K] {
        const node = document.createElementNS(SVG_NS, tag);
        for (const k of Object.keys(attrs)) {
            node.setAttribute(k, String(attrs[k]));
        }
        parent.appendChild(node);
        return node;
    }

    private splitPanels(start: number, span: number, showAbs: boolean, showRel: boolean,
        vertical: boolean, region: Rect, showDual = false, showBridge = false)
        : { main: Rect; abs?: Rect; rel?: Rect; abs2?: Rect; rel2?: Rect; bridge?: Rect } {
        const gap = 10;
        type Key = "main" | "abs" | "rel" | "abs2" | "rel2" | "bridge";
        // vertical (columns): variance panels stacked above the base chart, bridge just
        // above it (closest to main, since it explains the same base values)
        const parts: { key: Key; share: number }[] = [];
        if (vertical) {
            if (showRel) { parts.push({ key: "rel", share: 0.34 }); }
            if (showAbs) { parts.push({ key: "abs", share: 0.38 }); }
            if (showDual && showRel) { parts.push({ key: "rel2", share: 0.30 }); }
            if (showDual && showAbs) { parts.push({ key: "abs2", share: 0.34 }); }
            if (showBridge) { parts.push({ key: "bridge", share: 0.34 }); }
            parts.push({ key: "main", share: 1 });
        } else {
            parts.push({ key: "main", share: 1 });
            if (showBridge) { parts.push({ key: "bridge", share: 0.30 }); }
            if (showAbs) { parts.push({ key: "abs", share: 0.32 }); }
            if (showRel) { parts.push({ key: "rel", share: 0.26 }); }
            if (showDual && showAbs) { parts.push({ key: "abs2", share: 0.28 }); }
            if (showDual && showRel) { parts.push({ key: "rel2", share: 0.24 }); }
        }
        const totalShare = parts.reduce((a, b) => a + b.share, 0);
        const usable = span - gap * (parts.length - 1);
        const out: Partial<Record<Key, Rect>> = {};
        let cursor = start;
        for (const part of parts) {
            const size = usable * (part.share / totalShare);
            out[part.key] = vertical
                ? { x: region.x, y: cursor, w: region.w, h: size }
                : { x: cursor, y: region.y, w: size, h: region.h };
            cursor += size + gap;
        }
        return out as { main: Rect; abs?: Rect; rel?: Rect; abs2?: Rect; rel2?: Rect; bridge?: Rect };
    }

    private makePanelScale(domain: [number, number], rect: Rect, orientation: Orientation,
        labelPad: number, bothEnds = false): Scale {
        let [mn, mx] = domain;
        if (mn === 0 && mx === 0) { mx = 1; }
        const span = mx - mn;
        const padFrac = 0.02;
        const mnp = (bothEnds || mn < 0) ? mn - span * padFrac : mn;
        const mxp = (bothEnds || mx > 0) ? mx + span * padFrac : mx;
        if (orientation === "columns") {
            const top = rect.y + ((bothEnds || mx > 0) ? labelPad + 12 : 12);
            const bottom = rect.y + rect.h - ((bothEnds || mn < 0) ? labelPad : 2);
            return linearScale(mnp, mxp, bottom, top);
        } else {
            const left = rect.x + ((bothEnds || mn < 0) ? labelPad + 4 : 4);
            const right = rect.x + rect.w - ((bothEnds || mx > 0) ? labelPad + 24 : 4);
            return linearScale(mnp, mxp, left, right);
        }
    }

    /** IBCS baseline notation: AC solid black, PY fat grey, PL double line */
    private drawBaseline(parent: SVGElement, rect: Rect, scale: Scale, orientation: Orientation,
        bandStart: number, bandEnd: number, kind: "ac" | Basis,
        colors: { ac: string; py: string; pl: string }, dashed = false): void {
        const zero = scale(0);
        const line = (offset: number, stroke: string, w: number) => {
            const dash = dashed ? { "stroke-dasharray": "4,3" } : {};
            if (orientation === "columns") {
                this.el("line", { x1: bandStart, y1: zero + offset, x2: bandEnd, y2: zero + offset, stroke, "stroke-width": w, ...dash }, parent);
            } else {
                this.el("line", { x1: zero + offset, y1: bandStart, x2: zero + offset, y2: bandEnd, stroke, "stroke-width": w, ...dash }, parent);
            }
        };
        if (kind === "ac") {
            line(0, colors.ac, 1.6);
        } else if (kind === "py") {
            line(0, colors.py, 3);
        } else if (kind === "fcrev") {
            // prior-cycle forecast basis: double line like plan, but dashed —
            // a soft target, distinct from the solid PL notation
            const dashLine = (offset: number) => {
                if (orientation === "columns") {
                    this.el("line", { x1: bandStart, y1: zero + offset, x2: bandEnd, y2: zero + offset, stroke: colors.pl, "stroke-width": 1, "stroke-dasharray": "5,3" }, parent);
                } else {
                    this.el("line", { x1: zero + offset, y1: bandStart, x2: zero + offset, y2: bandEnd, stroke: colors.pl, "stroke-width": 1, "stroke-dasharray": "5,3" }, parent);
                }
            };
            dashLine(-1.2);
            dashLine(1.2);
        } else {
            line(-1.2, colors.pl, 1);
            line(1.2, colors.pl, 1);
        }
    }

    private drawPanelTitle(parent: SVGElement, rect: Rect, text: string, orientation: Orientation,
        titleH: number, region: Rect, barsTitleY?: number, color = "#8A8A8A"): void {
        const font = Math.round(10 * this.fontK);
        const attrs = orientation === "columns"
            ? { x: region.x + 6, y: rect.y + titleH - 4 }
            : { x: rect.x + 2, y: barsTitleY ?? (region.y + font + 2) };
        // "bars" titles sit above their own (possibly narrow) panel and must not bleed into
        // the next one; "columns" titles have the full region width above the stacked panels
        const maxW = orientation === "columns" ? region.w - 12 : rect.w - 6;
        const t = this.el("text", {
            ...attrs, "font-size": font, fill: color,
            "font-family": FONT, "font-weight": 600
        }, parent);
        t.textContent = this.truncate(text, maxW, font);
    }

    /**
     * IBCS three-scenario notation: PY as a small grey triangle pointing at the
     * column/bar at previous-year level (like the reference year chart) — right-pointing
     * at the left edge for columns, down-pointing above the bar for bars.
     */
    private drawPyTriangle(parent: SVGElement, slotStart: number, slotW: number, py: number,
        scale: Scale, orientation: Orientation, cfg: ChartConfig): void {
        const s = Math.max(4.5, Math.min(9, slotW * 0.3)) * Math.min(this.fontK, 1.6);
        const v = scale(py);
        const points = orientation === "columns"
            ? `${slotStart - s},${v - s * 0.8} ${slotStart - s},${v + s * 0.8} ${slotStart},${v}`
            : `${v - s * 0.8},${slotStart - s} ${v + s * 0.8},${slotStart - s} ${v},${slotStart}`;
        this.el("polygon", {
            points,
            fill: cfg.hc ? cfg.paper : cfg.colors.py,
            stroke: cfg.hc ? cfg.ink : cfg.subtle, "stroke-width": cfg.hc ? 1.2 : 0.8,
            "stroke-linejoin": "round"
        }, parent);
    }

    /** draws a rect from `from` to `to` along the value axis at band position bp with band width bw */
    private drawBar(parent: SVGElement, bp: number, bw: number, from: number, to: number,
        scale: Scale, orientation: Orientation, style: Record<string, string | number>): void {
        const a = scale(from), b = scale(to);
        const lo = Math.min(a, b), hi = Math.max(a, b);
        const size = Math.max(hi - lo, 0.5);
        if (orientation === "columns") {
            this.el("rect", { x: bp, y: lo, width: bw, height: size, ...style }, parent);
        } else {
            this.el("rect", { x: lo, y: bp, width: size, height: bw, ...style }, parent);
        }
    }

    /** true when a label ABOVE this pin would run into the panel title (top-left corner) */
    private collidesPanelTitle(bandCenter: number, text: string, font: number,
        labelTop: number, panelY: number, regionX: number, title: string): boolean {
        const tF = Math.round(10 * this.fontK);
        const titleRight = regionX + 6 + title.length * tF * 0.66 + 8;
        const titleBottom = panelY + tF + 6;
        return bandCenter - text.length * font * 0.28 < titleRight && labelTop < titleBottom;
    }

    private drawEndLabel(parent: SVGElement, bandCenter: number, v: number, scale: Scale,
        orientation: Orientation, text: string, fontSize: number, fill: string, extraGap = 0, halo = "#FFFFFF"): void {
        this.drawEndLabelAt(parent, bandCenter, v, v >= 0, scale, orientation, text, fontSize, fill, extraGap, halo);
    }

    private drawEndLabelAt(parent: SVGElement, bandCenter: number, anchorValue: number, positive: boolean,
        scale: Scale, orientation: Orientation, text: string, fontSize: number, fill: string, extraGap = 0, halo = "#FFFFFF"): void {
        const end = scale(anchorValue);
        let attrs: Record<string, string | number>;
        if (orientation === "columns") {
            attrs = positive
                ? { x: bandCenter, y: end - 4 - extraGap, "text-anchor": "middle" }
                : { x: bandCenter, y: end + fontSize + 2 + extraGap, "text-anchor": "middle" };
        } else {
            attrs = positive
                ? { x: end + 4 + extraGap, y: bandCenter + fontSize * 0.35, "text-anchor": "start" }
                : { x: end - 4 - extraGap, y: bandCenter + fontSize * 0.35, "text-anchor": "end" };
        }
        const t = this.el("text", {
            ...attrs, "font-size": fontSize, fill,
            "font-family": FONT,
            stroke: halo, "stroke-width": 3, "paint-order": "stroke",
            "stroke-linejoin": "round"
        }, parent);
        t.textContent = text;
    }

    private drawCategoryLabel(parent: SVGElement, text: string, bandCenter: number,
        orientation: Orientation, fontSize: number, region: Rect,
        step: number, mainRect: Rect, ink = INK, bold = false): void {
        let attrs: Record<string, string | number>;
        let maxW: number;
        if (orientation === "columns") {
            attrs = { x: bandCenter, y: region.y + region.h - 3, "text-anchor": "middle" };
            maxW = step - 2;
        } else {
            attrs = { x: mainRect.x - 6, y: bandCenter + fontSize * 0.35, "text-anchor": "end" };
            maxW = mainRect.x - region.x - 8;
        }
        const t = this.el("text", {
            ...attrs, "font-size": fontSize, fill: ink,
            "font-family": FONT, "font-weight": bold ? 600 : 400
        }, parent);
        t.textContent = this.truncate(text, maxW, fontSize);
    }

    private static measureCtx: CanvasRenderingContext2D | null | undefined;
    private static measureCache = new Map<string, number>();

    /** real text width via an offscreen canvas (cached); falls back to the old
     *  0.56×fontSize character heuristic when no 2D context is available */
    private textWidth(text: string, fontSize: number): number {
        if (Visual.measureCtx === undefined) {
            try { Visual.measureCtx = document.createElement("canvas").getContext("2d"); }
            catch { Visual.measureCtx = null; }
        }
        const ctx = Visual.measureCtx;
        if (!ctx) { return text.length * fontSize * 0.56; }
        const key = `${fontSize}|${text}`;
        const hit = Visual.measureCache.get(key);
        if (hit !== undefined) { return hit; }
        ctx.font = `${fontSize}px ${FONT}`;
        const w = ctx.measureText(text).width;
        if (Visual.measureCache.size > 20000) { Visual.measureCache.clear(); }
        Visual.measureCache.set(key, w);
        return w;
    }

    private truncate(text: string, maxWidth: number, fontSize: number): string {
        if (this.textWidth(text, fontSize) <= maxWidth) { return text; }
        // binary search for the longest prefix whose width incl. ellipsis fits
        let lo = 1, hi = text.length;
        while (lo < hi) {
            const mid = (lo + hi + 1) >> 1;
            if (this.textWidth(text.slice(0, mid) + "…", fontSize) <= maxWidth) { lo = mid; }
            else { hi = mid - 1; }
        }
        return lo <= 1 ? text.slice(0, 1) : text.slice(0, lo) + "…";
    }

    private maxTextWidth(labels: string[], fontSize: number): number {
        return labels.reduce((a, l) => Math.max(a, this.textWidth(l, fontSize)), 0);
    }

    // ---------------------------------------------------------- interaction

    private attachInteraction(g: SVGGElement, p: DataPoint, cfg: ChartConfig): void {
        // dashboards disable interactions — keep tooltips, skip selection affordances
        const allow = this.host.hostCapabilities?.allowInteractions !== false;
        g.style.cursor = !allow ? "default" : this.commentEdit ? "text" : "pointer";

        // keyboard navigation: tab through categories, Enter/Space selects
        g.setAttribute("tabindex", "0");
        g.setAttribute("role", "option");
        const aria = [`${p.cat}`];
        if (p.value != null) { aria.push(cfg.fmt.format(p.value)); }
        if (p.varAbs != null) { aria.push(`Δ${cfg.basisLabel} ${this.fmtSigned(cfg.fmtVar, p.varAbs)}`); }
        if (p.comment) { aria.push(p.comment); }
        g.setAttribute("aria-label", aria.join(", "));
        g.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key !== "Enter" && e.key !== " ") { return; }
            e.preventDefault();
            e.stopPropagation();
            if (!p.sel || !allow) { return; }
            this.selectionManager.select(p.sel, e.ctrlKey || e.metaKey).then((ids: ISelectionId[]) => {
                this.applySelectionOpacity(ids);
            });
        });

        g.addEventListener("click", (e: MouseEvent) => {
            e.stopPropagation();
            if (!allow) { return; }
            // comment capture mode: clicks open the editor instead of cross-filtering
            if (this.commentEdit) {
                this.openCommentEditor(p, e);
                return;
            }
            // structure-edit mode: clicks open the one-click-P&L row menu
            if (this.structureEdit) {
                this.openStructureMenu(p, e);
                return;
            }
            // compare mode: clicks collect two categories for the Δ overlay instead
            // of cross-filtering (the toggle decides which behavior clicks have)
            if (this.compareActive) {
                const i = this.compareCats.indexOf(p.cat);
                if (i >= 0) { this.compareCats.splice(i, 1); }
                else if (this.compareCats.length >= 2) { this.compareCats = [p.cat]; }
                else { this.compareCats.push(p.cat); }
                this.rerender();
                return;
            }
            if (!p.sel) { return; }
            this.selectionManager.select(p.sel, e.ctrlKey || e.metaKey).then((ids: ISelectionId[]) => {
                this.applySelectionOpacity(ids);
            });
        });
        g.addEventListener("contextmenu", (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            this.selectionManager.showContextMenu(p.sel, { x: e.clientX, y: e.clientY });
        });

        const items = (): VisualTooltipDataItem[] => {
            const out: VisualTooltipDataItem[] = [];
            const add = (name: string, v: number | null, signed = false, pct = false) => {
                if (v == null) { return; }
                out.push({
                    displayName: name,
                    value: pct ? this.fmtPercent(v) : (signed ? this.fmtSigned(cfg.fmt, v) : cfg.fmt.format(v))
                });
            };
            out.push({ displayName: this.locStr("Role_Category", "Category"), value: p.cat });
            add(this.locStr("Role_Actual", "Actual (AC)"), p.ac);
            if (p.isPrelim) {
                out.push({ displayName: "Status", value: this.locStr("Tooltip_Prelim", "preliminary") });
            }
            add(this.locStr("Role_Forecast", "Forecast (FC)"), p.fc);
            add(this.locStr("Role_PreviousYear", "Previous Year (PY)"), p.py);
            add(this.locStr("Role_Plan", "Plan (PL)"), p.pl);
            add(this.locStr("Role_PrevForecast", "Prior-month FC"), p.fcPrev);
            if (cfg.bmInChart) { add("Benchmark (BM)", p.bm); }
            if (p.lineVal != null) {
                out.push({ displayName: cfg.lineName, value: cfg.fmtLine.format(p.lineVal) });
            }
            if (p.stackSeries != null) {
                out.push({ displayName: this.locStr("Tooltip_Series", "Series"), value: p.stackSeries });
            }
            if (p.varAbs != null) {
                out.push({ displayName: `Δ${cfg.basisLabel}`, value: this.fmtSigned(cfg.fmtVar, p.varAbs) });
            }
            add(`Δ${cfg.basisLabel} %`, p.varRel, true, true);
            if (p.var2Abs != null) {
                out.push({ displayName: `Δ${cfg.basis2Label}`, value: this.fmtSigned(cfg.fmtVar, p.var2Abs) });
            }
            add(`Δ${cfg.basis2Label} %`, p.var2Rel, true, true);
            if (!cfg.isMaterial(p)) {
                out.push({
                    displayName: this.locStr("Tooltip_Materiality", "Materiality"),
                    value: this.locStr("Tooltip_MaterialityBelow", "below threshold — shown in grey")
                });
            }
            if (p.comment != null && p.commentNo != null) {
                out.push({ displayName: `${this.circledNo(p.commentNo)} ${this.locStr("Tooltip_Comment", "Comment")}`, value: p.comment });
            }
            return out;
        };
        g.addEventListener("mouseover", (e: MouseEvent) => {
            this.tooltipService.show({
                dataItems: items(),
                identities: p.sel ? [p.sel] : [],
                coordinates: [e.clientX, e.clientY],
                isTouchEvent: false
            });
        });
        g.addEventListener("mousemove", (e: MouseEvent) => {
            this.tooltipService.move({
                dataItems: items(),
                identities: p.sel ? [p.sel] : [],
                coordinates: [e.clientX, e.clientY],
                isTouchEvent: false
            });
        });
        g.addEventListener("mouseout", () => {
            this.tooltipService.hide({ immediately: false, isTouchEvent: false });
        });
    }

    private applySelectionOpacity(selected: ISelectionId[]): void {
        const hasSelection = selected && selected.length > 0;
        for (const cg of this.catGroups) {
            const isSel = hasSelection && cg.sel != null && selected.some(s => s.equals(cg.sel));
            cg.g.setAttribute("opacity", !hasSelection || isSel ? "1" : "0.35");
        }
    }

    // ------------------------------------------------- user comments (in-chart)

    /** parses the persisted commentsPanel.userComments JSON store */
    private readUserComments(dataView: DataView | undefined): Map<string, string> {
        const raw = dataView?.metadata?.objects?.["commentsPanel"]?.["userComments"];
        const map = new Map<string, string>();
        if (typeof raw === "string" && raw.trim() !== "") {
            try {
                const obj = JSON.parse(raw) as Record<string, string>;
                for (const key of Object.keys(obj)) {
                    const v = obj[key];
                    if (typeof v === "string" && v.trim() !== "") { map.set(key, v); }
                }
            } catch { /* corrupt store: start clean rather than fail the visual */ }
        }
        return map;
    }

    private commentKey(p: DataPoint): string {
        return `${p.group ?? ""}¦${p.cat}`;
    }

    /** persists the table drill state so it survives reload and bookmarks */
    private persistTableExpanded(): void {
        const json = JSON.stringify([...this.expandedRows]);
        this.pendingTableExpanded = json;
        this.host.persistProperties({
            merge: [{ objectName: "chart", selector: null, properties: { tableExpanded: json } }]
        });
    }

    /** filters visible table rows by the live 🔍 term, keeping ancestors of matches */
    private applySearch<T extends { depth: number }>(rows: T[], labelOf: (r: T) => string): T[] {
        const term = this.allowInteractions ? this.tableSearch.trim().toLowerCase() : "";
        if (!term) { return rows; }
        const keep = new Array(rows.length).fill(false);
        const stack: number[] = [];
        rows.forEach((r, i) => {
            stack[r.depth] = i;
            stack.length = r.depth + 1;
            if (labelOf(r).toLowerCase().includes(term)) {
                for (let d = 0; d <= r.depth; d++) {
                    const si = stack[d];
                    if (si != null) { keep[si] = true; }
                }
            }
        });
        return rows.filter((_, i) => keep[i]);
    }

    /** 🔍 header control: click opens a live-filter input; active term shows with ✕ */
    private drawSearchControl(bg: SVGElement, xx: number, yy: number, cfg: ChartConfig): void {
        if (!this.allowInteractions) { return; }
        const f = Math.round(10 * this.fontK);
        const active = this.tableSearch.trim() !== "";
        const icon = this.el("text", {
            x: xx, y: yy, "font-size": f, fill: active ? cfg.ink : cfg.subtle,
            "font-family": FONT, role: "button", tabindex: "0", "font-weight": active ? 700 : 400
        }, bg);
        icon.textContent = active ? `🔍 ${this.truncate(this.tableSearch, 90, f)} ✕` : "🔍";
        const tip = this.el("title", {}, icon);
        tip.textContent = this.locStr("Table_Search", "Search rows");
        icon.setAttribute("aria-label", tip.textContent);
        (icon as unknown as SVGGraphicsElement).style.cursor = "pointer";
        const act = (e: Event) => {
            e.stopPropagation();
            if (active) {
                this.tableSearch = "";
                this.closeSearchEditor();
                this.rerender();
                return;
            }
            this.openSearchEditor(e as MouseEvent);
        };
        icon.addEventListener("click", act);
        icon.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(e); }
        });
    }

    private openSearchEditor(e: MouseEvent): void {
        this.closeSearchEditor();
        const rootRect = this.root.getBoundingClientRect();
        if (window.getComputedStyle(this.root).position === "static") {
            this.root.style.position = "relative";
        }
        const left = Math.max(2, Math.min(e.clientX - rootRect.left, rootRect.width - 180));
        const top = Math.max(2, Math.min(e.clientY - rootRect.top + 8, rootRect.height - 34));
        const input = document.createElement("input");
        this.searchEditor = input;
        input.type = "text";
        input.value = this.tableSearch;
        input.placeholder = this.locStr("Table_Search", "Search rows");
        input.style.cssText = `position:absolute;left:${left}px;top:${top}px;z-index:10;`
            + "width:170px;box-sizing:border-box;background:#FFFFFF;color:#252423;"
            + "border:1px solid #8A8A8A;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.2);"
            + "padding:4px 6px;font-family:'Segoe UI',sans-serif;font-size:12px;";
        input.addEventListener("mousedown", ev => ev.stopPropagation());
        let deb: number | null = null;
        input.addEventListener("input", () => {
            if (deb != null) { window.clearTimeout(deb); }
            deb = window.setTimeout(() => {
                this.tableSearch = input.value;
                this.rerender();
            }, 180);
        });
        input.addEventListener("keydown", ev => {
            ev.stopPropagation();
            if (ev.key === "Escape") {
                this.tableSearch = "";
                this.closeSearchEditor();
                this.rerender();
            } else if (ev.key === "Enter") {
                this.tableSearch = input.value;
                this.closeSearchEditor();
                this.rerender();
            }
        });
        this.root.appendChild(input);
        input.focus();
    }

    private closeSearchEditor(): void {
        if (this.searchEditor) {
            this.searchEditor.remove();
            this.searchEditor = null;
        }
    }

    /** invisible col-resize handle on the name-column edge; width persists on drop */
    private drawNameResize(bg: SVGElement, edgeX: number, topY: number, botY: number,
        region: Rect, cfg: ChartConfig): void {
        if (!this.allowInteractions) { return; }
        const h = this.el("rect", {
            x: edgeX - 3, y: topY, width: 6, height: Math.max(10, botY - topY),
            fill: cfg.paper, "fill-opacity": 0.01
        }, bg) as SVGGraphicsElement;
        h.style.cursor = "col-resize";
        const tip = this.el("title", {}, h);
        tip.textContent = "⇔";
        h.addEventListener("mousedown", (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const startX = e.clientX;
            const startW = this.tableNameW ?? (edgeX - region.x - 6);
            let cur = startW;
            const move = (ev: MouseEvent) => {
                const next = Math.max(40, Math.min(region.w * 0.5, startW + (ev.clientX - startX)));
                if (Math.abs(next - cur) < 2) { return; }
                cur = next;
                this.tableNameW = next;
                this.rerender();
            };
            const up = () => {
                window.removeEventListener("mousemove", move);
                window.removeEventListener("mouseup", up);
                const json = String(Math.round(this.tableNameW ?? startW));
                this.pendingTableNameW = json;
                this.host.persistProperties({
                    merge: [{ objectName: "chart", selector: null, properties: { tableNameWidth: json } }]
                });
            };
            window.addEventListener("mousemove", move);
            window.addEventListener("mouseup", up);
        });
    }

    private persistTableColExpanded(): void {
        const json = JSON.stringify([...this.colExpanded]);
        this.pendingTableColExpanded = json;
        this.host.persistProperties({
            merge: [{ objectName: "chart", selector: null, properties: { tableColExpanded: json } }]
        });
    }

    private persistUserComments(): void {
        const obj: Record<string, string> = {};
        this.userComments.forEach((v, k) => { obj[k] = v; });
        const json = JSON.stringify(obj);
        this.pendingCommentsJson = json;
        this.host.persistProperties({
            merge: [{
                objectName: "commentsPanel", selector: null,
                properties: { userComments: json }
            }]
        });
    }

    private closeCommentEditor(): void {
        if (this.commentEditor) {
            this.commentEditor.remove();
            this.commentEditor = null;
        }
    }

    /** small HTML editor next to the clicked category; saving persists into the report */
    private closeStructureMenu(): void {
        if (this.structEditor) {
            this.structEditor.remove();
            this.structEditor = null;
        }
        this.structCat = null;
        if (this.structOutside) {
            document.removeEventListener("mousedown", this.structOutside);
            this.structOutside = null;
        }
    }

    /** adds/removes the row label in one of the persisted comma lists */
    private toggleListEntry(prop: ListProp, cat: string, on: boolean): void {
        // names containing a comma cannot round-trip a comma-separated list —
        // the structure menu disables its checkboxes for those rows
        if (cat.includes(",")) { return; }
        const raw = String(this.formattingSettings.chartCard[prop].value || "");
        const parts = raw.split(",").map(x => x.trim()).filter(x => x);
        const norm = cat.trim().toLowerCase();
        const rest = parts.filter(x => x.toLowerCase() !== norm);
        if (on) { rest.push(cat.trim()); }
        const next = rest.join(", ");
        this.formattingSettings.chartCard[prop].value = next;
        this.pendingListProps.set(prop, next);
        this.host.persistProperties({
            merge: [{ objectName: "chart", selector: null, properties: { [prop]: next } }]
        });
    }

    /**
     * One-click P&L menu (structure-edit mode): three checkboxes that persist the
     * row into invertList / resultList / skipList — one-click Invert/Result/Skip
     * without touching the data model. The menu survives the persist round-trip;
     * clicking another row or pressing Escape closes it.
     */
    private openStructureMenu(p: DataPoint, e: MouseEvent): void {
        this.closeStructureMenu();
        this.structCat = p.cat;
        const rootRect = this.root.getBoundingClientRect();
        if (window.getComputedStyle(this.root).position === "static") {
            this.root.style.position = "relative";
        }
        const boxW = 240, boxH = 200;
        const left = Math.max(2, Math.min(e.clientX - rootRect.left, rootRect.width - boxW - 4));
        const top = Math.max(2, Math.min(e.clientY - rootRect.top, rootRect.height - boxH - 4));

        const box = document.createElement("div");
        this.structEditor = box;
        box.style.cssText = `position:absolute;left:${left}px;top:${top}px;z-index:10;`
            + `width:${boxW}px;box-sizing:border-box;background:#FFFFFF;color:#252423;`
            + "border:1px solid #8A8A8A;border-radius:4px;box-shadow:0 2px 10px rgba(0,0,0,0.25);"
            + "padding:8px;font-family:'Segoe UI',sans-serif;font-size:12px;";
        box.addEventListener("click", ev => ev.stopPropagation());
        box.addEventListener("contextmenu", ev => ev.stopPropagation());
        box.addEventListener("keydown", ev => {
            ev.stopPropagation();
            if (ev.key === "Escape") { this.closeStructureMenu(); }
        });

        const title = document.createElement("div");
        title.style.cssText = "font-weight:600;margin-bottom:6px;white-space:nowrap;"
            + "overflow:hidden;text-overflow:ellipsis;";
        title.textContent = `⚙ ${p.cat}`;
        box.appendChild(title);

        const inList = (prop: ListProp) =>
            String(this.formattingSettings.chartCard[prop].value || "")
                .split(",").map(x => x.trim().toLowerCase()).filter(x => x)
                .includes(p.cat.trim().toLowerCase());
        const mkCheck = (label: string, prop: ListProp) => {
            const row = document.createElement("label");
            row.style.cssText = "display:flex;align-items:center;gap:6px;margin:4px 0;cursor:pointer;";
            const cb = document.createElement("input");
            cb.type = "checkbox";
            cb.checked = inList(prop);
            cb.addEventListener("change", ev => {
                ev.stopPropagation();
                this.toggleListEntry(prop, p.cat, cb.checked);
            });
            const span = document.createElement("span");
            span.textContent = label;
            row.appendChild(cb);
            row.appendChild(span);
            box.appendChild(row);
        };
        mkCheck(this.locStr("Struct_Invert", "Invert (higher is bad)"), "invertList");
        mkCheck(this.locStr("Struct_Result", "Result row (bold anchor)"), "resultList");
        mkCheck(this.locStr("Struct_Skip", "Exclude from totals"), "skipList");
        mkCheck(this.locStr("Struct_Hide", "Hide row (Σ keeps it)"), "hideList");
        mkCheck(this.locStr("Struct_Chart", "Chart only listed rows"), "chartList");
        mkCheck(this.locStr("Struct_Indent", "Indent (thereof row)"), "indentList");
        if (p.cat.includes(",")) {
            // comma names cannot round-trip the comma lists — disable the menu
            box.querySelectorAll("input").forEach(i => { (i as HTMLInputElement).disabled = true; });
            const hint = document.createElement("div");
            hint.style.cssText = "margin-top:4px;color:#8A8A8A;font-style:italic;";
            hint.textContent = this.locStr("Struct_CommaHint",
                "Name contains a comma — use the Waterfall Type role instead");
            box.appendChild(hint);
        }

        // clicking anywhere outside closes the menu (registered async so the
        // opening click itself does not immediately close it again)
        const outside = (ev: MouseEvent) => {
            if (this.structEditor && !this.structEditor.contains(ev.target as Node)) {
                this.closeStructureMenu();
            }
        };
        this.structOutside = outside;
        setTimeout(() => {
            if (this.structOutside === outside) { document.addEventListener("mousedown", outside); }
        }, 0);

        this.root.appendChild(box);
    }

    private openCommentEditor(p: DataPoint, e: MouseEvent): void {
        this.closeCommentEditor();
        const key = this.commentKey(p);
        const rootRect = this.root.getBoundingClientRect();
        if (window.getComputedStyle(this.root).position === "static") {
            this.root.style.position = "relative";
        }
        const boxW = 250, boxH = 132;
        const left = Math.max(2, Math.min(e.clientX - rootRect.left, rootRect.width - boxW - 4));
        const top = Math.max(2, Math.min(e.clientY - rootRect.top, rootRect.height - boxH - 4));

        const box = document.createElement("div");
        this.commentEditor = box;
        box.style.cssText = `position:absolute;left:${left}px;top:${top}px;z-index:10;`
            + `width:${boxW}px;box-sizing:border-box;background:#FFFFFF;color:#252423;`
            + "border:1px solid #8A8A8A;border-radius:4px;box-shadow:0 2px 10px rgba(0,0,0,0.25);"
            + "padding:8px;font-family:'Segoe UI',sans-serif;font-size:12px;";
        box.addEventListener("click", ev => ev.stopPropagation());
        box.addEventListener("contextmenu", ev => ev.stopPropagation());

        const title = document.createElement("div");
        title.style.cssText = "font-weight:600;margin-bottom:5px;white-space:nowrap;"
            + "overflow:hidden;text-overflow:ellipsis;";
        title.textContent = `✎ ${p.group != null ? `${p.group} · ` : ""}${p.cat}`;
        box.appendChild(title);

        const ta = document.createElement("textarea");
        ta.rows = 3;
        ta.style.cssText = "width:100%;box-sizing:border-box;resize:vertical;"
            + "font-family:inherit;font-size:12px;padding:4px;";
        ta.value = this.userComments.get(key) ?? "";
        ta.addEventListener("keydown", ev => {
            ev.stopPropagation();
            if (ev.key === "Escape") { this.closeCommentEditor(); }
            if (ev.key === "Enter" && (ev.ctrlKey || ev.metaKey)) { save(); }
        });
        box.appendChild(ta);

        const row = document.createElement("div");
        row.style.cssText = "display:flex;gap:6px;margin-top:6px;justify-content:flex-end;";
        const mkBtn = (label: string, primary: boolean, onClick: () => void) => {
            const b = document.createElement("button");
            b.textContent = label;
            b.style.cssText = "font-size:12px;padding:3px 10px;cursor:pointer;border-radius:3px;"
                + (primary
                    ? "background:#252423;color:#FFFFFF;border:1px solid #252423;"
                    : "background:#FFFFFF;color:#252423;border:1px solid #8A8A8A;");
            b.addEventListener("click", ev => { ev.stopPropagation(); onClick(); });
            row.appendChild(b);
        };
        const save = () => {
            const text = ta.value.trim();
            if (text) { this.userComments.set(key, text); }
            else { this.userComments.delete(key); }
            this.closeCommentEditor();
            this.persistUserComments();
        };
        if (this.userComments.has(key)) {
            mkBtn(this.locStr("Editor_Delete", "Delete"), false, () => {
                this.userComments.delete(key);
                this.closeCommentEditor();
                this.persistUserComments();
            });
        }
        mkBtn(this.locStr("Editor_Cancel", "Cancel"), false, () => this.closeCommentEditor());
        mkBtn(this.locStr("Editor_Save", "Save"), true, save);
        box.appendChild(row);

        this.root.appendChild(box);
        ta.focus();
    }

    /** small dark pill top-right announcing an active click mode (comment/compare) */
    private drawModeChip(xRight: number, text: string, cfg: ChartConfig): void {
        const k = this.fontK;
        const bh = Math.round(18 * k), font = Math.round(10 * k);
        const w = Math.round(text.length * font * 0.62) + Math.round(16 * k);
        const g = this.el("g", {}, this.svg);
        this.el("rect", {
            x: xRight - w, y: 6, width: w, height: bh, rx: bh / 2,
            fill: cfg.hc ? cfg.paper : cfg.colors.ac,
            stroke: cfg.hc ? cfg.ink : "none", "stroke-width": cfg.hc ? 1.2 : 0
        }, g);
        const t = this.el("text", {
            x: xRight - w / 2, y: 6 + bh / 2 + font * 0.36, "text-anchor": "middle",
            "font-size": font, fill: cfg.hc ? cfg.ink : cfg.paper, "font-family": FONT, "font-weight": 600
        }, g);
        t.textContent = text;
        const tip = this.el("title", {}, g);
        tip.textContent = text.startsWith("✎")
            ? this.locStr("ChipTip_Comment", "Comment mode active: clicking a category opens the editor")
            : this.locStr("ChipTip_Compare", "Compare mode active: click two elements to show the difference, click empty space to reset");
    }

    /** YTD chip top-right: persists chart.cumulative so end users can flip the view */
    private drawCumButton(xRight: number, cfg: ChartConfig): void {
        const k = this.fontK;
        const bh = Math.round(18 * k), font = Math.round(11 * k);
        const segW = Math.round(38 * k);
        const x = xRight - segW;
        const btn = this.el("g", { tabindex: "0", role: "button" }, this.svg) as SVGGElement;
        btn.setAttribute("aria-label", cfg.cumulative
            ? this.locStr("Btn_CumOff", "Turn cumulative view (YTD) off") : this.locStr("Btn_CumOn", "Turn cumulative view (YTD) on"));
        const cumTip = this.el("title", {}, btn);
        cumTip.textContent = cfg.cumulative
            ? this.locStr("Btn_CumOff", "Turn cumulative view (YTD) off") : this.locStr("Btn_CumOn", "Turn cumulative view (YTD) on");
        this.el("rect", {
            x, y: 6, width: segW, height: bh, rx: bh / 2,
            fill: cfg.cumulative ? cfg.colors.ac : cfg.paper,
            stroke: cfg.hc ? cfg.ink : cfg.subtle, "stroke-width": 1
        }, btn);
        const t = this.el("text", {
            x: x + segW / 2, y: 6 + bh / 2 + font * 0.36, "text-anchor": "middle",
            "font-size": font, fill: cfg.cumulative ? cfg.paper : cfg.ink, "font-family": FONT
        }, btn);
        t.textContent = { ytd: "YTD", qtd: "QTD", r12: "R12" }[
            String(this.formattingSettings.chartCard.cumulativeKind.value.value)] ?? "YTD";
        btn.style.cursor = "pointer";
        const toggle = () => {
            this.host.persistProperties({
                merge: [{
                    objectName: "chart", selector: null,
                    properties: { cumulative: !cfg.cumulative }
                }]
            });
        };
        btn.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); toggle(); });
        btn.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key !== "Enter" && e.key !== " ") { return; }
            e.preventDefault(); e.stopPropagation(); toggle();
        });
    }
}
