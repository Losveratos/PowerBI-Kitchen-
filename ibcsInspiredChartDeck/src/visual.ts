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
/** dark-mode neutrals: mirrored light palette for dark report themes. The visual
 *  paints no opaque background, so "paper" must match the (dark) page behind it —
 *  halos and hollow marks are filled with it. Text tones keep WCAG-AA contrast
 *  against DARK_PAPER (ink ≈ 12:1, subtle ≈ 6:1). */
const DARK_INK = "#E0E0E0";
const DARK_PAPER = "#1E1E1E";
const DARK_SUBTLE = "#A6A6A6";
/** light-mode UI neutrals with their dark counterparts: card borders/separators,
 *  emphasized-card fill, bullet band — resolved once into cfg (faint/wash/band) */
const FAINT = "#DDDDD8", DARK_FAINT = "#3F3F3F";
const WASH = "#F4F4F0", DARK_WASH = "#30302C";
const BAND = "#EFEFEA", DARK_BAND = "#3A3A36";
/** pane color-picker defaults → dark-legible stand-ins. Only applied while the
 *  picker still holds its light default, so user-chosen colors always win. */
const DARK_COLOR_SWAP: Record<string, string> = {
    "#404040": "#D9D9D9",   // AC / PL outline: near-black → light grey
    "#B3B3B3": "#8A8A8A",   // PY: stays the dimmer grey relative to AC
    "#1E8F9E": "#3FB3C2",   // good: DatenWG teal, brightened for dark ground
    "#D64541": "#E4635F"    // bad: red, brightened for dark ground
};
/** WCAG relative luminance of a #rgb/#rrggbb color; unparseable → 1 (treat as light) */
function relLuminance(hex: string): number {
    let m = /^#?([0-9a-f]{6})$/i.exec((hex || "").trim());
    if (!m) {
        const m3 = /^#?([0-9a-f]{3})$/i.exec((hex || "").trim());
        if (!m3) { return 1; }
        m = [m3[0], m3[1].split("").map(c => c + c).join("")] as unknown as RegExpExecArray;
    }
    const n = parseInt(m[1], 16);
    const ch = (v: number) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * ch((n >> 16) & 255) + 0.7152 * ch((n >> 8) & 255) + 0.0722 * ch(n & 255);
}
/** small-multiples grid cap — shared-scale maxima must only span rendered tiles */
const MULT_MAX_CELLS = 24;

/** 1.49 segmented loading (fetchMoreData): powerbi.VisualDataChangeOperationKind.Append
 *  as a literal — const-enum values do not exist at runtime in the test shim */
const OP_APPEND = 1;
/** safety cap of the segmented loading: beyond this many category rows the visual
 *  requests no further segments (an SVG chart with 30k marks is not readable anyway) */
const FETCH_MAX_ROWS = 30000;

/**
 * 1.49 IBCS chart templates (C01–C13 of the IBCS template library) as presets of
 * the chart card — the PnL mega-template pattern: the dropdown chart.template only
 * writes DEFAULTS. A template that differs from the last applied one (hidden
 * chart.templateApplied) sets all listed chart properties at once, locally for the
 * very same render and in ONE persistProperties merge; afterwards every switch is
 * free. C07 (area) and C11 do not exist in this visual and are not offered.
 * C13 keeps the chart type and only switches the small-multiples options.
 */
type TplValue = string | boolean | number;
const CHART_TEMPLATES: Record<string, Record<string, TplValue>> = {
    // C01/C02: structure over time / per category — stacking comes from the Serie role
    C01: { orientation: "columns", comparisonMode: "auto", showAbsoluteVariance: false,
        showRelativeVariance: false, dualVariance: false, waterfallStyle: false },
    C02: { orientation: "bars", comparisonMode: "auto", showAbsoluteVariance: false,
        showRelativeVariance: false, dualVariance: false, waterfallStyle: false },
    // C03: multi-tier columns — AC/PY base, ΔPY panel, ΔPY% pins
    C03: { orientation: "columns", comparisonMode: "py", showAbsoluteVariance: true,
        showRelativeVariance: true, dualVariance: false, waterfallStyle: false },
    // C04: bars with ΔPL panel + ΔPL% pins
    C04: { orientation: "bars", comparisonMode: "plan", showAbsoluteVariance: true,
        showRelativeVariance: true, dualVariance: false, waterfallStyle: false },
    // C05: integrated bridge over time (PY total → monthly Δ → AC/FC total)
    C05: { orientation: "intwaterfall", comparisonMode: "py", showAbsoluteVariance: true,
        showRelativeVariance: true, dualVariance: false },
    // C06: category bridge drawn as vertical column cascade
    C06: { orientation: "catbridge", comparisonMode: "py", showAbsoluteVariance: true,
        showRelativeVariance: true, dualVariance: false, bridgeOrientation: "columns" },
    // C08: line for long time series — ΔBasis panel, no Δ%-pin forest
    C08: { orientation: "line", comparisonMode: "auto", showAbsoluteVariance: true,
        showRelativeVariance: false, dualVariance: false },
    // C09/C10: scatter with mean quadrants; C10 additionally the size legend (bubble role)
    C09: { orientation: "scatter", comparisonMode: "auto", scatterQuadrant: "mean",
        scatterColorBy: "single" },
    C10: { orientation: "scatter", comparisonMode: "auto", scatterQuadrant: "mean",
        scatterColorBy: "single", scatterSizeLegend: true },
    // C12: waterfall (sum/delta rows or bridge from the basis)
    C12: { orientation: "waterfall", comparisonMode: "auto", showAbsoluteVariance: true,
        showRelativeVariance: true, dualVariance: false },
    // C13: small multiples — chart type stays, Σ tile + same scale for bridges too
    C13: { multiplesTotal: true, multiplesSameScale: true }
};

/** 1.50 start hub: schematic preview per IBCS template — keys of drawModeMini, the
 *  same SVG pipeline as the demo gallery (nothing is embedded as a bitmap) */
const TEMPLATE_MINI: Record<string, string> = {
    C01: "stackcols", C02: "stackbars", C03: "columns", C04: "bars", C05: "intwaterfall",
    C06: "catbridgecols", C08: "line", C09: "scatter", C10: "bubble", C12: "waterfall",
    C13: "multiples"
};
/** field role a template needs on top of category + AC (hint on the gallery tile) */
const TEMPLATE_NEEDS: Record<string, { role: string; key: string; en: string }> = {
    C01: { role: "series", key: "Role_Series", en: "Stack series" },
    C02: { role: "series", key: "Role_Series", en: "Stack series" },
    C10: { role: "bubbleSize", key: "Role_BubbleSize", en: "Bubble size (optional)" },
    C13: { role: "multiples", key: "Role_Multiples", en: "Small Multiples" }
};
/** 1.50 start hub pages — transient session state, never persisted */
type HubPage = "home" | "tour" | "templates" | "demo" | "fields";
/** resolved hub palette (light · dark · high contrast) */
interface HubColors {
    hc: boolean; ink: string; grey: string; teal: string; red: string; paper: string;
    subtle: string; soft: string; tile: string; tileOn: string; edge: string; edge2: string;
    onAccent: string;
}

type Orientation = "columns" | "bars";
type Basis = "py" | "plan" | "fcrev";

/** persisted comma lists editable via the one-click structure menu */
type ListProp = "invertList" | "resultList" | "skipList" | "hideList" | "chartList" | "indentList";

/** Smart-Start: one high-confidence mode suggestion derived from bound fields */
interface SmartStartSuggestion {
    /** rule id, also the orientation value the chip applies + the dismiss signature prefix */
    rule: "waterfall" | "table" | "bars" | "line";
    textKey: string;
    textFallback: string;
}

/** month tokens (DE + EN, short and long) recognized by looksLikeTime — lower-case */
const SMARTSTART_MONTHS = [
    "jan", "januar", "january",
    "feb", "februar", "february",
    "mär", "maer", "mrz", "märz", "maerz", "mar", "march",
    "apr", "april",
    "mai", "may",
    "jun", "juni", "june",
    "jul", "juli", "july",
    "aug", "august",
    "sep", "sept", "september",
    "okt", "oktober", "oct", "october",
    "nov", "november",
    "dez", "dezember", "dec", "december"
];

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
    /** AC+FC split month: FC-Anteil OBEN auf dem AC-Sockel (value = AC + fcPart);
     *  null = kein Split (Standard-Verhalten) */
    fcPart?: number | null;
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
    /** scatter: X-axis measure (role xValue) and bubble-size measure (role bubbleSize);
     *  null/absent when the role is not bound or for synthetic rows */
    xVal?: number | null;
    sizeVal?: number | null;
    /** scatter v3: previous-year value of the X measure (role xPrevious) — start of
     *  the PY → AC movement arrow on the X axis (without it, arrows move only in Y) */
    xPrev?: number | null;
    /** Trend role (KPI cards): period label of this row and its sort key (Date →
     *  timestamp, number → value, text → first appearance); absent when unbound */
    trend?: string | null;
    trendOrd?: number;
    /** KPI cards + Trend role: the card's time series over the COMMON period axis
     *  (cfg.trendLabels; null = period missing for this card) and the index of the
     *  period the card refers to (last period with an actual, else last with a value) */
    trendSeries?: (TrendPt | null)[] | null;
    trendRef?: number;
    comment: string | null;
    /** 1-based comment marker number, assigned in category order */
    commentNo: number | null;
    /** small-multiples group label, null when the multiples role is empty */
    group: string | null;
    /** waterfall row type: 'sum' | 'delta' | null */
    rowType: string | null;
    /** true for the synthetic "Rest (n)" row produced by top-N aggregation */
    isRest: boolean;
    /** cross-highlight from another visual is active and this row is NOT part of
     *  it — rendered faded. False whenever no highlight is active at all */
    dim: boolean;
    sel: ISelectionId | null;
}

/** one period of a KPI card's trend series (Trend role) */
interface TrendPt {
    ac: number | null;
    py: number | null;
    pl: number | null;
    fc: number | null;
    /** AC, or FC where AC is missing (the plotted value) */
    value: number | null;
    isFc: boolean;
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
    /** waterfall-bridge companion panel: zero-based like its anchor bars (extent) */
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
    /** table Σ-row placement — "bottom" (default) | "top" (frozen under the header) */
    totalPos: string;
    /** table: shade every second body row (zebra); off in high-contrast */
    zebra: boolean;
    /** table row-height cap factor (compact 1.6 · normal 2.4 · airy 3.2) */
    rowDensity: number;
    /** table grid-line style — "horizontal" (default) | "none" | "both" */
    gridLines: string;
    /** matrix cell layout — "columns" (default) | "stacked" (value on top, Δ below) */
    cellLayout: string;
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
    /** KPI cards: reference values as own rows ("off" | "basis" | "all") */
    cardRefVals: string;
    /** KPI cards + Trend role: mini chart replacing the mini bridge ("off" | "sparkline"
     *  | "columns"); always "off" without a bound trend field or outside the cards mode */
    cardTrend: string;
    /** KPI cards + Trend role: the card value is the sum over all periods (else the
     *  last period with an actual) — PY/PL/FC/BM follow the same rule */
    cardTrendSum: boolean;
    /** KPI cards + Trend role: common period axis (labels in chronological order) and
     *  the trend field's display name (tooltip) */
    trendLabels: string[];
    trendName: string;
    /** category bridge drawn as a vertical column cascade (chart.bridgeOrientation) */
    catBridgeVertical: boolean;
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
    /** Δ%-pin head shape: "auto" keeps each mode's default (round or square) */
    pinStyle: string;
    /** trend icons ▲▼● in front of Δ values (table + cards) */
    deltaIcons: boolean;
    /** scenario display labels — house terms via the pane ("AC"→"Ist" …), defaults IBCS */
    scenL: { ac: string; py: string; pl: string; fc: string };
    /** small multiples: shared integrated-bridge maxima over all tiles (null = per-tile scale) */
    sharedIntWf: { maxTot: number; maxMon: number; maxPct: number } | null;
    /** small multiples: shared category-bridge range over all tiles (null = per-tile scale);
     *  minV < 0 only when a cascade level or row value dips below zero */
    sharedCatBridge: { maxV: number; minV: number; maxPct: number } | null;
    /** stacked mode: stack-total domain over all tiles incl. fixedMax/cap (null = not stacked) */
    stackDomain: [number, number] | null;
    /** materiality: false → variance is drawn grey instead of good/bad (thresholds in the
     *  pane). Callers pass the variance pair of the basis they draw; defaults to Δ1. */
    isMaterial: (p: DataPoint | null | undefined, vAbs?: number | null, vRel?: number | null) => boolean;
    /** high-contrast mode: only foreground/background colors, outlines for distinction */
    hc: boolean;
    /** 1.49 high contrast: the host's foregroundSelected (EMPHASIZE, hover) — equals
     *  ink outside high contrast (never read there) */
    hcSel: string;
    /** dark mode: light text/marks on a dark report page (forced or auto-detected) */
    dark: boolean;
    ink: string;
    paper: string;
    subtle: string;
    /** faint UI lines: card borders, separators (light #DDDDD8/#E0E0E0 family) */
    faint: string;
    /** emphasized-card background wash (light #F4F4F0) */
    wash: string;
    /** bullet-graph band fill (light #EFEFEA) */
    band: string;
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
    /** waterfall axis break (IBCS UN 5.3), computed ONCE over all drawn tiles: `at` =
     *  cut value, `possible` = every anchor + delta lies above it, `suggested` = delta
     *  span < 25 % of the largest anchor, `active` = actually drawn broken. null = off */
    wfBreak: { at: number; possible: boolean; suggested: boolean; active: boolean } | null;
    /** scatter / bubble mode only (null elsewhere): names + own formatters of the X and
     *  bubble-size measures, quadrant split ("off" | "mean" | "median"), point color
     *  ("single" | "status") and the X reference line (scale.xRefLine, null = off) */
    scatter: {
        hasX: boolean;
        xName: string;
        yName: string;
        sizeName: string;
        fmtX: IValueFormatter;
        fmtSize: IValueFormatter;
        quadrant: string;
        colorBy: string;
        xRefLine: number | null;
        /** display-unit divisor + raw format string of the X measure (tick labels) */
        xDiv: number;
        xFormat: string;
        /** small-multiples deck (1.48): X/Y data range, quadrant split and largest
         *  bubble computed ONCE over the points of ALL drawn tiles (IBCS CO 5.1) — every
         *  tile draws the same scales and the same mean/median lines. null = one cloud */
        shared: ScatterShared | null;
        /** colorBy "group" (1.48): color per series value (resp. multiples value without
         *  tiles), fixed order of first appearance over the whole deck. null = no group
         *  coloring in effect (single, status, high contrast or no grouping field) */
        groupColors: Map<string, string> | null;
        /** which field drives groupColors: "series" (Stack-Series role) or "group"
         *  (multiples role, only without tiles) */
        groupKey: "series" | "group" | null;
        /** v3: ordered group values of groupKey (first appearance over the deck) —
         *  drives the shape cycle; filled even in high contrast (shapes work there) */
        groupOrder: string[] | null;
        /** v3 feature switches (chart card; already gated on bound roles) */
        arrows: boolean;
        hasXPrev: boolean;
        xPrevName: string;
        shapes: boolean;
        sizeLegend: boolean;
        trend: string;
        trendR2: boolean;
        quadLabels: { tr: string; tl: string; bl: string; br: string };
        play: boolean;
        /** v3 axis options (scale card): fixed bounds (null = auto) + log wishes —
         *  whether log actually applies is decided per render over the data */
        xMin: number | null;
        xMax: number | null;
        yMin: number | null;
        yMax: number | null;
        xLogWanted: boolean;
        yLogWanted: boolean;
    } | null;
}

/** deck-wide scatter scales for small multiples (see ChartConfig.scatter.shared) */
interface ScatterShared {
    xLo: number;
    xHi: number;
    yLo: number;
    yHi: number;
    /** quadrant / reference split per axis (null = no line) */
    qx: number | null;
    qy: number | null;
    /** bubble-size maximum over all tiles (0 = no bubbles anywhere) */
    sMax: number;
    /** size of a regular grid cell — caps the bubble radius identically in every tile
     *  (the hero tile is larger and would otherwise draw bigger bubbles). null = zoom */
    refCell: { w: number; h: number } | null;
    /** v3: log scale per axis, decided ONCE over the whole deck (all tiles share it) */
    xLog: boolean;
    yLog: boolean;
    /** v3: the size legend renders once per deck (first tile that draws it wins) */
    sizeLegendDrawn?: boolean;
}

/**
 * scatter colorBy "group" (1.48): muted categorical palette, IBCS-compatible — ink
 * grey first, then blue / ochre / light blue / olive / plum; no red or green (those
 * stay reserved for the good/bad variance semantics) and no rainbow. Checked with the
 * dataviz palette validator over ALL pairs (a scatter has no adjacency): light on
 * white → normal-vision ΔE ≥ 15.6, CVD ΔE ≥ 7.2 (floor band — legal because every
 * color also has a legend entry, direct labels and the tooltip); dark on #1E1E1E →
 * normal ΔE ≥ 15.9, CVD ΔE ≥ 6.4, all ≥ 3:1 contrast. The dark slots are their own
 * steps of the same hue families (not an automatic flip). Values beyond the sixth
 * are never a generated hue: they share one neutral grey ("further" in the legend).
 */
const SCATTER_GROUP_LIGHT = ["#404040", "#3D78B2", "#B0702A", "#93B5D8", "#C2B04E", "#9F5989"];
const SCATTER_GROUP_DARK = ["#D9D9D9", "#67A3E0", "#D08D54", "#2F6FA8", "#7A7A36", "#C978B8"];
const SCATTER_GROUP_REST_LIGHT = "#C4C4C4";
const SCATTER_GROUP_REST_DARK = "#5A5A5A";

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

/**
 * "nice" tick values (1/2/2.5/5 × 10ⁿ) INSIDE [lo, hi] — at most maxTicks of them,
 * as many as fit. The scatter axes run over the data range (plus the marker inset),
 * not out to the next round number, so no empty band is wasted at the edges.
 */
function niceTicks(lo: number, hi: number, maxTicks: number): number[] {
    if (!isFinite(lo) || !isFinite(hi) || hi <= lo) { return isFinite(lo) ? [lo] : []; }
    const mag = Math.pow(10, Math.floor(Math.log10(hi - lo)) - 1);
    for (const e of [1, 10, 100]) {
        for (const m of [1, 2, 2.5, 5]) {
            const st = m * e * mag;
            const a = Math.ceil(lo / st - 1e-9), b = Math.floor(hi / st + 1e-9);
            if (b - a + 1 <= maxTicks) {
                const out: number[] = [];
                // trim float noise (0.1-steps) so labels read "0,3" not "0,30000000000000004"
                for (let i = a; i <= b; i++) { out.push(Number((i * st).toPrecision(12))); }
                return out;
            }
        }
    }
    return [lo, hi];
}

/** arithmetic mean / median of a non-empty list (scatter quadrant split) */
function meanOf(vals: number[]): number {
    return vals.reduce((a, v) => a + v, 0) / Math.max(vals.length, 1);
}
function medianOf(vals: number[]): number {
    const s = [...vals].sort((a, b) => a - b);
    const m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/**
 * scatter v3: ticks for a logarithmic axis INSIDE [lo, hi] — whole decades (10ⁿ)
 * while at least two fit, otherwise 1-2-5 steps across the span; never more than
 * maxTicks (thinned out keeping the ends). lo must be > 0.
 */
function logTicks(lo: number, hi: number, maxTicks: number): number[] {
    if (!(lo > 0) || !(hi > lo)) { return lo > 0 ? [lo] : []; }
    const d0 = Math.ceil(Math.log10(lo) - 1e-9), d1 = Math.floor(Math.log10(hi) + 1e-9);
    const decades: number[] = [];
    for (let e = d0; e <= d1; e++) { decades.push(Number(Math.pow(10, e).toPrecision(12))); }
    if (decades.length > Math.max(2, maxTicks)) {
        const step = Math.ceil(decades.length / Math.max(2, maxTicks));
        return decades.filter((_, i) => i % step === 0);
    }
    if (decades.length >= 2) { return decades; }
    // fewer than two decades inside the span: 1-2-5 steps
    let out: number[] = [];
    for (let e = Math.floor(Math.log10(lo)) - 1; e <= d1 + 1 && out.length < 60; e++) {
        for (const m of [1, 2, 5]) {
            const v = Number((m * Math.pow(10, e)).toPrecision(12));
            if (v >= lo * (1 - 1e-9) && v <= hi * (1 + 1e-9)) { out.push(v); }
        }
    }
    while (out.length > Math.max(2, maxTicks)) {
        const keep: number[] = [];
        for (let i = 0; i < out.length; i += 2) { keep.push(out[i]); }
        if (keep[keep.length - 1] !== out[out.length - 1]) { keep.push(out[out.length - 1]); }
        out = keep;
    }
    return out.length > 0 ? out : [lo, hi];
}

/** linear or logarithmic position scale (scatter v3) — log assumes d0, d1 > 0 */
function logLinScale(d0: number, d1: number, r0: number, r1: number, log: boolean): Scale {
    if (!log) { return linearScale(d0, d1, r0, r1); }
    const l0 = Math.log(d0);
    const dd = (Math.log(d1) - l0) || 1;
    return (v: number) => r0 + ((Math.log(Math.max(v, Number.MIN_VALUE)) - l0) / dd) * (r1 - r0);
}

/**
 * Δ is defined but Δ% is not — the "n.a." case of IBCS UN 4.1: a zero basis,
 * or a SIGN CHANGE between basis and actual (PY +20 → AC −30 gave "−250 %").
 * Same-sign negative bases stay interpretable: GuV cost lines ("Material-
 * aufwand +5 %") are controlling routine. Actual 0 at a basis ≠ 0 is a valid
 * −100 % reduction, not n.a. The actual is recovered as basis + Δ.
 */
function relIsNa(dAbs: number | null, basis: number | null): boolean {
    if (dAbs == null || basis == null) { return false; }
    if (basis === 0) { return true; }
    const actual = basis + dAbs;
    return actual !== 0 && Math.sign(actual) !== Math.sign(basis);
}
/** relative variance Δ / |basis| in % — null for the n.a. cases (relIsNa) */
function relVar(dAbs: number | null, basis: number | null): number | null {
    if (dAbs == null || basis == null || relIsNa(dAbs, basis)) { return null; }
    return (dAbs / Math.abs(basis)) * 100;
}
/** fixed, language-neutral marker (IBCS uses "n.a." internationally) */
const REL_NA = "n.a.";

/**
 * true when a measure format string already fixes the magnitude itself — a
 * prefix like "T€" / "Mio €" / "TEUR" or scaling commas ("#,0,"). The auto
 * display unit must then stay off, otherwise "#,0 T€" turns 100.000 T€ into
 * "100,0K€" (a factor-1000 error, Audit S13).
 */
function formatCarriesMagnitude(fmt: string | undefined): boolean {
    if (!fmt) { return false; }
    // scaling commas directly behind the last digit placeholder ("#,0," / "0.0,,")
    const unquoted = fmt.replace(/"[^"]*"/g, " ");
    if (/[0#],+(?![0#,])/.test(unquoted)) { return true; }
    const lit = fmt.replace(/["\\]/g, " ");
    return /(?:^|[^A-Za-z])(?:[TkKMB]\s?(?:€|EUR|\$|USD|CHF|£|GBP)|Tsd|Mio|Mrd|Mn|Bn|Tausend|Millionen|Milliarden)(?![a-z])/.test(lit)
        || /(?:^|\s)[KM]\s*$/.test(lit);
}

export class Visual implements IVisual {
    private events: IVisualEventService;
    private host: IVisualHost;
    private root: HTMLElement;
    private svg: SVGSVGElement;
    private viewW = 0;
    private selectionManager: ISelectionManager;
    private tooltipService: ITooltipService;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private catGroups: { g: SVGGElement; sel: ISelectionId | null; dim?: boolean }[] = [];
    private measureFormat: string | undefined;
    private measureName: string | undefined;
    private lineFormat: string | undefined;
    private lineName: string | undefined;
    /** scatter roles: display name + format string of the X and bubble-size measures */
    private xName: string | undefined;
    private xFormat: string | undefined;
    private sizeName: string | undefined;
    private sizeFormat: string | undefined;
    /** scatter v3: display name of the bound xPrevious measure (arrow start, tooltips) */
    private xPrevName: string | undefined;
    /** scatter v3 play mode (Rosling): transient — NEVER persisted. frame = currently
     *  shown period index; anim = live DOM references while the rAF loop runs */
    private scatterFrame: number | null = null;
    private scatterAnim: {
        frames: string[];
        frameData: Map<string, { x: number; y: number; size: number }>[];
        dots: Map<string, { g: SVGGElement; cx: number; cy: number;
            circle: SVGElement | null; hasSize: boolean }>;
        X: Scale; Y: Scale;
        rOf: (size: number) => number;
        watermark: SVGTextElement | null;
        btnIcon: SVGTextElement | null;
        raf: number | null;
        playing: boolean;
        from: number;
        cur: number;
        t0: number;
    } | null = null;
    /** scatter v3 rectangle selection: true right after a drag-select ended, so the
     *  immediately following click on the svg must NOT clear the fresh selection */
    private scatterDragJustEnded = false;
    /** teardown hooks for the document-level listeners of an active drag-select */
    private scatterDragCleanup: (() => void) | null = null;
    /** Trend role (KPI cards): display name of the bound period field */
    private trendName: string | undefined;
    /** display names of the Stack-Series and multiples fields (scatter group legend) */
    private seriesName: string | undefined;
    private multName: string | undefined;
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
    /** matrix mode: horizontal block-area scroll offset in px per tile (transient) */
    private tableScrollX = new Map<string, number>();
    /** per-render counter feeding unique clipPath ids for matrix block viewports */
    private mxClipSeq = 0;
    /** matrix mode: expanded column groups (persisted, chevron in the header) */
    private colExpanded = new Set<string>();
    private pendingTableColExpanded: string | null = null;
    /** table: live row filter from the 🔍 header control (transient, interactive only) */
    private tableSearch = "";
    private searchEditor: HTMLInputElement | null = null;
    /** table: manual name-column width (persisted via drag on the column edge) */
    private tableNameW: number | null = null;
    private pendingTableNameW: string | null = null;
    /** true while the name-column resize handle is being dragged */
    private tableNameWDragging = false;
    /** table: manual numeric-column widths, keyed by column ("val"/"dval"/"mxBlock"/
     *  "mxSum"), persisted as a JSON object via drag on a column edge */
    private tableColWidths: Record<string, number> = {};
    private pendingTableColWidths: string | null = null;
    /** true while any numeric-column resize handle is being dragged */
    private tableColWidthsDragging = false;
    /** bound Filter-Info text measure (filter context for the filter footer) */
    private filterInfo: string | null = null;
    /** table header sort, e.g. "dabs_desc" ("" = data order), persisted */
    private tableSort = "";
    private pendingTableSort: string | null = null;
    /** in-chart card sort chip override ("" = use the pane dropdown), persisted */
    private cardSortSel = "";
    private pendingCardSort: string | null = null;
    /** last seen pane value of chart.cardSort — a change drops the chip override */
    private lastPaneCardSort: string | null = null;
    /** exception reporting: mode + thresholds allow the filter (gates the ⚠ chip) */
    private exceptionCapable = false;
    /** exception reporting: filter is actually on (pane setting AND capable) */
    private exceptionOn = false;
    /** rows the exception filter folded into the collector row (filter footer) */
    private exceptionHidden = 0;
    /** finance number convention (negatives in parentheses, zero as "–") */
    private financeFmt = false;
    /** landing font-preset pill: value we persisted but the host has not echoed yet */
    private pendingFontPreset: string | null = null;
    private pendingFontPresetTtl = 0;
    /** landing mode pick: orientation we persisted but the host has not echoed yet */
    private pendingOrientation: string | null = null;
    private pendingOrientationTtl = 0;
    /** ⫽-Achse-Chip: scale.wfAxisBreak we persisted but the host has not echoed yet */
    private pendingWfBreak: string | null = null;
    private pendingWfBreakTtl = 0;
    /** 1.49 chart template just persisted (echo guard + TTL 5, PnL pattern): while it
     *  lives, a stale metadata update cannot flip the freshly written switches back */
    private templatePending: { applied: string; props: Record<string, TplValue>; ttl: number } | null = null;
    /** template applied in this session — a lost echo must not re-apply it in a loop */
    private templateSessionTpl: string | null = null;
    /** 1.49 locked chips: bridge toolbar buttons of this render (locked afterwards when
     *  the bridge draws nothing but its hint) and the per-render no-op facts */
    private bridgeChips: SVGGElement[] = [];
    /** ⇅ would not change the order (impact order == data order in every tile) */
    private sortNoop = false;
    /** ⚠ would fold nothing (every category above the materiality threshold) */
    private exceptionNoop = false;
    /** 1.49 empty-state switch (edit mode): emptyState.mode we persisted but the
     *  host has not echoed yet — same echo-guard + TTL pattern as pendingFontPreset */
    private pendingEmptyMode: string | null = null;
    private pendingEmptyModeTtl = 0;
    /** data view of the last update — the field intro marks the bound roles from it */
    private lastDataView: DataView | undefined = undefined;
    // --- 1.50 start hub (edit mode only; navigation is transient, never persisted) ---
    private hubPage: HubPage = "home";
    /** tour card and template-gallery page currently shown */
    private hubTourIdx = 0;
    private hubTplPage = 0;
    /** template picked in the hub without bound fields — "saved, active once bound" */
    private hubTplSaved: string | null = null;
    /** hub opened as overlay above a bound chart (☰ Start chip) */
    private hubOpen = false;
    /** overlay surface: the chart SVG is only hidden underneath, never re-drawn */
    private hubSvg: SVGSVGElement | null = null;
    /** a setting changed from inside the overlay → closing re-renders the chart */
    private hubDirty = false;
    /** element (data-icd) to focus after the next hub draw — keyboard navigation */
    private hubFocus: string | null = null;
    /** size of the empty-state surface the hub was drawn on */
    private hubW = 0;
    private hubH = 0;
    /** HTML chip row bottom-left (☰ Start · ↺ back to template), edit mode only */
    private chipBar: HTMLDivElement | null = null;
    private rootHover = false;
    // --- 1.49 segmented loading (fetchMoreData, PnL pattern) ---
    /** category rows delivered by the host so far (accumulated data view) */
    private loadedRows = 0;
    /** a further segment was requested and is still on its way */
    private awaitingSegment = false;
    /** the host refused a further segment although more data exists (100 MB cap) */
    private hostCapped = false;
    /** the visual itself stopped at FETCH_MAX_ROWS although more data exists */
    private selfCapped = false;
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
    /** Trend role bound — gates the trend options of the KPI-card group */
    private paneHasTrend = false;
    /** basis parseData actually used — single source of truth for ΔBasis labels */
    private basisMode: Basis = "py";
    /** secondary basis (the dual-variance counterpart of basisMode) */
    private basis2Mode: "py" | "plan" = "plan";
    private paneHasFcPrev = false;
    private paneHasFc = false;
    private paneHasBm = false;
    /** false in export/print contexts — suppresses all in-chart buttons/chrome */
    private allowInteractions = true;
    /** update() ViewMode, saved verbatim — the chip gates on it (Edit or unknown host = show,
     *  real View mode = hide). Compared against the literal 1 (powerbi.ViewMode.Edit): the
     *  test-bundle shims powerbi-visuals-api with an empty object, so const-enum VALUES
     *  (unlike types, which erase) are not available at runtime — same reason settings.ts
     *  spells out ValidatorType as raw numbers instead of importing the enum */
    private viewMode: powerbi.ViewMode | null = null;
    /** dark mode resolved per update (pane setting or theme luminance) — also
     *  drives the landing gallery and the HTML overlays outside of cfg */
    private uiDark = false;
    /** Modus-Chip-Klick "beendet den Modus": ein gerade persistiertes false muss
     *  ein verspätetes Metadaten-Echo überleben (Schlüssel object.prop → TTL),
     *  gleiches Muster wie pendingFontPreset */
    private pendingModeOff = new Map<string, number>();
    /** rowType / colgroup role bound at all (Smart-Start rules a/b), independent of the
     *  current orientation's own filtering of those fields */
    private paneHasRowType = false;
    private paneHasColgroup = false;
    /** Smart-Start: distinct category count + time-likeness of the primary category field,
     *  and its display name (used in the dismiss signature) — computed once in parseData */
    private smartStartCatCount = 0;
    private smartStartCatIsTime = false;
    private smartStartCatFieldName: string | null = null;
    /** Smart-Start: signature of the suggestion the user last dismissed (bookmarkable,
     *  chart.smartStartDismissed) — NOT a pane slice, same pattern as cardSortSel */
    private smartStartDismissedSig = "";
    private pendingSmartStartDismissed: string | null = null;

    /** export/PDF/subscription rendering with "Export: expand all" on — every
     *  row/column branch and GuV sum block renders open, screen state untouched */
    private get exportAllOpen(): boolean {
        return !this.allowInteractions
            && this.formattingSettings?.chartCard.exportExpandAll.value === true;
    }
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
        // 1.49 bookmarks (PnL pattern): a bookmark — or "selected by another visual"
        // via multi-visual selection — restores the selection in the HOST; the
        // callback hands the restored ids over so the marks dim exactly like after
        // a click. An empty set clears the dimming (bookmark without selection).
        // The host owns the truth: later renders read getSelectionIds() as before.
        // Guarded — older hosts and the test shim have no callback API.
        if (typeof this.selectionManager?.registerOnSelectCallback === "function") {
            this.selectionManager.registerOnSelectCallback((ids: ISelectionId[]) => {
                this.applySelectionOpacity(ids ?? []);
            });
        }
        this.tooltipService = options.host.tooltipService;
        this.root = options.element;
        this.root.classList.add("icd-root");
        this.instanceId = Visual.instanceCounter++;

        this.svg = document.createElementNS(SVG_NS, "svg");
        this.root.appendChild(this.svg);

        // click on empty space clears selection (and a pending compare pick) — except
        // right after a scatter rectangle selection, whose mouseup fires this click too
        this.svg.addEventListener("click", () => {
            if (this.scatterDragJustEnded) {
                this.scatterDragJustEnded = false;
                return;
            }
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
        // 1.50: the ☰ Start chip stays out of the way until the author points at
        // the visual (like the host's own visual header) or tabs onto it
        this.root.addEventListener("mouseenter", () => { this.rootHover = true; this.syncHubChipOpacity(); });
        this.root.addEventListener("mouseleave", () => { this.rootHover = false; this.syncHubChipOpacity(); });
    }

    public update(options: VisualUpdateOptions): void {
        this.events.renderingStarted(options);
        try {
            const dataView: DataView | undefined = options.dataViews && options.dataViews[0];
            this.formattingSettings = this.formattingSettingsService
                .populateFormattingSettingsModel(VisualFormattingSettingsModel, dataView);
            // Smart-Start gates on the edit context — save the raw ViewMode every update
            this.viewMode = options.viewMode ?? null;
            // resolve dark mode before any branch renders (landing gallery included)
            this.uiDark = this.resolveDarkMode();
            // 1.50: the hub overlay is an author tool — reading view or an export
            // context closes it (readers and exports never see the hub)
            if (this.hubOpen && !this.hubChipAllowed()) { this.hideHubOverlay(); }
            // Mehrfeld-Kategorie: Drill-Hierarchie automatisch aufklappen, damit
            // der klickbare Zeilenbaum direkt beim Hineinziehen erscheint
            this.maybeAutoExpand(dataView);
            // a hover tooltip must not survive the data/layout change underneath it
            this.hideDarkTip();
            // one-click-P&L lists: a just-persisted value must survive a stale
            // metadata update that arrives before the host echoes it back
            for (const [prop, val] of [...this.pendingListProps]) {
                const slice = this.formattingSettings.chartCard[prop];
                if (String(slice.value || "") === val) { this.pendingListProps.delete(prop); }
                else { slice.value = val; }
            }
            // Modus-Chip "beenden": frisch persistiertes false gegen stale Echos
            // verteidigen; TTL lässt den Pane-Wert nach ein paar Updates wieder
            // gewinnen, falls das Host-Echo verloren geht
            for (const [key, ttl] of [...this.pendingModeOff]) {
                const fsm = this.formattingSettings;
                const slice = key === "commentsPanel.editComments" ? fsm.commentsCard.editComments
                    : key === "chart.structureEdit" ? fsm.chartCard.structureEdit
                        : fsm.chartCard.compareClick;
                if (slice.value === false || ttl <= 1) { this.pendingModeOff.delete(key); }
                else {
                    this.pendingModeOff.set(key, ttl - 1);
                    slice.value = false;
                }
            }
            // a just-clicked landing font-preset pill must survive a stale
            // metadata update that arrives before the host echoes it back
            // both guards expire after a few updates: if the host echo is lost
            // (persist rejected, bookmark restore in between), the pane value must
            // win again eventually — without the TTL the else-branch would force
            // the clicked value over every future pane/bookmark choice forever
            const fpSlice = this.formattingSettings.labelsCard.fontPreset;
            if (this.pendingFontPreset != null) {
                if (String(fpSlice.value.value) === this.pendingFontPreset
                    || --this.pendingFontPresetTtl <= 0) {
                    this.pendingFontPreset = null;
                } else {
                    const fpIt = fpSlice.items.find(x => String(x.value) === this.pendingFontPreset);
                    if (fpIt) { fpSlice.value = fpIt; }
                }
            }
            // landing mode pick, same echo-guard pattern
            const orSlice = this.formattingSettings.chartCard.orientation;
            if (this.pendingOrientation != null) {
                if (String(orSlice.value.value) === this.pendingOrientation
                    || --this.pendingOrientationTtl <= 0) {
                    this.pendingOrientation = null;
                } else {
                    const orIt = orSlice.items.find(x => String(x.value) === this.pendingOrientation);
                    if (orIt) { orSlice.value = orIt; }
                }
            }
            // ⫽-Achse-Chip (Wasserfall-Achsenschnitt), same echo-guard + TTL pattern —
            // ONE source (the pane slice), so no two-source reconciliation needed
            const wbSlice = this.formattingSettings.scaleCard.wfAxisBreak;
            if (this.pendingWfBreak != null) {
                if (String(wbSlice.value.value) === this.pendingWfBreak
                    || --this.pendingWfBreakTtl <= 0) {
                    this.pendingWfBreak = null;
                } else {
                    const wbIt = wbSlice.items.find(x => String(x.value) === this.pendingWfBreak);
                    if (wbIt) { wbSlice.value = wbIt; }
                }
            }
            // 1.49 IBCS chart template (chart.template): applies a preset once per pick
            this.syncChartTemplate(dataView);
            // 1.49 empty-state switch (Feld-Intro ↔ Galerie ↔ Nachricht), same echo guard
            const emSlice = this.formattingSettings.emptyStateCard.mode;
            if (this.pendingEmptyMode != null) {
                if (String(emSlice.value.value) === this.pendingEmptyMode
                    || --this.pendingEmptyModeTtl <= 0) {
                    this.pendingEmptyMode = null;
                } else {
                    const emIt = emSlice.items.find(x => String(x.value) === this.pendingEmptyMode);
                    if (emIt) { emSlice.value = emIt; }
                }
            }
            this.lastDataView = dataView;
            // 1.49: segment beyond the reduction window → request the next one
            const opKind = options.operationKind as unknown as number | undefined;
            this.trackSegments(dataView, opKind);
            // memoization while loading: an intermediate Append (more segments still
            // on their way) only refreshes the progress line — the chart is drawn for
            // the first window and once more for the complete data, not per segment
            // (30 segments × full SVG render would block the report for seconds)
            if (opKind === OP_APPEND && this.awaitingSegment && this.lastRender != null
                && options.viewport.width === this.lastRender.width
                && options.viewport.height === this.lastRender.height) {
                this.svg.querySelector('[data-icd="load-state"]')?.remove();
                this.drawLoadState(this.lastRender.width, this.lastRender.height);
                this.events.renderingFinished(options);
                return;
            }

            const width = options.viewport.width;
            const height = options.viewport.height;
            this.viewW = width;
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
                } else {
                    // absent property = default state (bookmark on default, "reset
                    // to default") — collapse; persist always writes at least "[]"
                    this.expandedRows = new Set();
                }
            }
            // persisted manual name-column width, same echo-guard pattern
            const rawNw = dataView?.metadata?.objects?.["chart"]?.["tableNameWidth"];
            const rawNwStr = typeof rawNw === "string" ? rawNw : "";
            // never adopt the store mid-drag: pending is only set on mouseup, so a
            // host update between two mousemoves would reset the live drag width
            if (!this.tableNameWDragging
                && (this.pendingTableNameW == null || rawNwStr === this.pendingTableNameW)) {
                this.pendingTableNameW = null;
                const nwv = parseFloat(rawNwStr);
                this.tableNameW = isFinite(nwv) && nwv > 0 ? nwv : null;
            }
            // persisted manual numeric-column widths (JSON object), same echo-guard +
            // drag-flag pattern; absent property = defaults (empty map, see tableExpanded)
            const rawCw = dataView?.metadata?.objects?.["chart"]?.["tableColWidths"];
            const rawCwStr = typeof rawCw === "string" ? rawCw : "";
            if (!this.tableColWidthsDragging
                && (this.pendingTableColWidths == null || rawCwStr === this.pendingTableColWidths)) {
                this.pendingTableColWidths = null;
                if (rawCwStr !== "") {
                    try {
                        const obj = JSON.parse(rawCwStr) as Record<string, unknown>;
                        const clean: Record<string, number> = {};
                        if (obj && typeof obj === "object") {
                            for (const kk of Object.keys(obj)) {
                                const v = Number(obj[kk]);
                                if (isFinite(v) && v > 0) { clean[kk] = v; }
                            }
                        }
                        this.tableColWidths = clean;
                    } catch { /* corrupt store: keep the session state */ }
                } else {
                    this.tableColWidths = {};
                }
            }
            // persisted matrix column drill state, same echo-guard pattern
            const rawColExp = dataView?.metadata?.objects?.["chart"]?.["tableColExpanded"];
            const rawColExpStr = typeof rawColExp === "string" ? rawColExp : "";
            if (this.pendingTableColExpanded == null || rawColExpStr === this.pendingTableColExpanded) {
                this.pendingTableColExpanded = null;
                if (rawColExpStr !== "") {
                    try { this.colExpanded = new Set(JSON.parse(rawColExpStr) as string[]); }
                    catch { /* corrupt store: keep the session state */ }
                } else {
                    // absent property = default state — collapse (see tableExpanded)
                    this.colExpanded = new Set();
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
            // the pane dropdown regains control: changing chart.cardSort clears the
            // in-chart chip override, which would otherwise win forever (even "none")
            const paneCs = String(this.formattingSettings.chartCard.cardSort.value.value);
            if (this.lastPaneCardSort != null && paneCs !== this.lastPaneCardSort
                && this.cardSortSel !== "") {
                this.cardSortSel = "";
                this.pendingCardSort = "";
                this.host.persistProperties({
                    merge: [{ objectName: "chart", selector: null, properties: { cardSortSel: "" } }]
                });
            }
            this.lastPaneCardSort = paneCs;
            // Smart-Start dismiss signature (bookmarkable, not a pane slice — a declined
            // suggestion must not resurface until the bound-field constellation changes),
            // same echo-guard pattern as cardSortSel
            const rawSsd = dataView?.metadata?.objects?.["chart"]?.["smartStartDismissed"];
            const rawSsdStr = typeof rawSsd === "string" ? rawSsd : "";
            if (this.pendingSmartStartDismissed == null || rawSsdStr === this.pendingSmartStartDismissed) {
                this.pendingSmartStartDismissed = null;
                this.smartStartDismissedSig = rawSsdStr;
            }
            const points = this.parseData(dataView);
            // an open structure menu must not outlive its row (filter/data change)
            if (this.structEditor && this.structCat != null
                && !(points ?? []).some(p => p.cat === this.structCat)) {
                this.closeStructureMenu();
            }
            if (!points || points.length === 0) {
                // the data went away under an open overlay: the empty state IS the hub now
                if (this.hubOpen) { this.hideHubOverlay(); }
                this.renderDemo(width, height);
                this.events.renderingFinished(options);
                return;
            }
            this.svg.style.display = "block";
            this.lastRender = { points, width, height };
            this.render(points, width, height);
            this.finishChips();
            this.drawLoadState(width, height);
            this.applySelectionOpacity(this.selectionManager.getSelectionIds() as ISelectionId[]);
            this.updateChipBar();
            // an update under the open overlay re-draws the chart hidden underneath
            // and keeps the hub on its page (e.g. the template gallery after a pick)
            if (this.hubOpen) {
                if (width >= 300 && height >= 220) { this.drawHubOverlay(); } else { this.hideHubOverlay(); }
            }
            this.events.renderingFinished(options);
        } catch (error) {
            this.events.renderingFailed(options, String(error));
        }
    }

    /** re-render from the last update args — used by in-chart interactions (zoom, compare) */
    private rerender(): void {
        if (!this.lastRender) { return; }
        this.hideDarkTip();
        // render() mutates order in place via groups — pass a copy of the point list
        this.render([...this.lastRender.points], this.lastRender.width, this.lastRender.height);
        this.finishChips();
        this.drawLoadState(this.lastRender.width, this.lastRender.height);
        this.applySelectionOpacity(this.selectionManager.getSelectionIds() as ISelectionId[]);
        this.updateChipBar();
    }

    // ------------------------------------------------------------ IBCS templates (1.49)

    /**
     * chart.template → chart switches (PnL syncMegaTemplate pattern). A template
     * only writes defaults: when the dropdown differs from the last applied one
     * (hidden chart.templateApplied), every property of the preset is set locally
     * — this very render already shows it — and persisted together with the new
     * templateApplied in ONE merge. Echo guard + TTL 5: until the host echoes the
     * write back, a stale update keeps the written values; a lost echo never pins
     * them forever. "off" only records templateApplied (nothing else changes), and
     * the default state (template off, nothing applied) never persists at all.
     */
    private syncChartTemplate(dataView: DataView | undefined): void {
        const cc = this.formattingSettings.chartCard;
        const raw = dataView?.metadata?.objects?.["chart"]?.["templateApplied"];
        const persisted = raw != null && String(raw) !== "" ? String(raw) : "off";
        let applied = persisted;
        const pend = this.templatePending;
        if (pend) {
            let synced = persisted === pend.applied;
            for (const [k, v] of Object.entries(pend.props)) {
                if (!this.chartSliceIs(k, v)) { synced = false; this.chartSliceSet(k, v); }
            }
            pend.ttl--;
            if (synced || pend.ttl <= 0) { this.templatePending = null; }
            if (!synced && this.templatePending) { applied = pend.applied; }
        }
        const tpl = String(cc.template.value.value);
        // only the host's own confirmation re-arms the session guard
        if (tpl === persisted) { this.templateSessionTpl = null; }
        if (tpl === applied || tpl === this.templateSessionTpl) { return; }
        if (tpl !== "off" && !CHART_TEMPLATES[tpl]) { return; }
        this.applyChartTemplate(tpl);
    }

    /**
     * Writes a template's properties locally + in ONE merge. `withTemplate` (hub
     * gallery pick) also writes chart.template itself — exactly what the pane
     * dropdown would have stored — and guards it like the other props, so a stale
     * update still carrying the old dropdown value cannot "apply" that one instead.
     * Calling it for the template already applied is the re-apply (1.50): the merge
     * runs regardless of templateApplied, the echo guard covers the round trip.
     */
    private applyChartTemplate(tpl: string, withTemplate = false): void {
        const props: Record<string, TplValue> = { ...(CHART_TEMPLATES[tpl] ?? {}) };
        if (withTemplate) { props["template"] = tpl; }
        for (const [k, v] of Object.entries(props)) { this.chartSliceSet(k, v); }
        this.templatePending = { applied: tpl, props, ttl: 5 };
        this.templateSessionTpl = tpl;
        this.host.persistProperties({
            merge: [{ objectName: "chart", selector: null, properties: { ...props, templateApplied: tpl } }]
        });
    }

    /** 1.50: the template set in chart.template whose properties the current
     *  settings no longer match (null = no template, or nothing deviates) */
    private templateDeviation(): string | null {
        const tpl = String(this.formattingSettings?.chartCard.template.value.value ?? "off");
        const props = CHART_TEMPLATES[tpl];
        if (!props) { return null; }
        for (const [k, v] of Object.entries(props)) {
            if (!this.chartSliceIs(k, v)) { return tpl; }
        }
        return null;
    }

    /** 1.50 hub gallery pick: same storage as the pane dropdown (template +
     *  templateApplied + the preset), also when the tile is the active template */
    private pickTemplate(tpl: string): void {
        if (!CHART_TEMPLATES[tpl]) { return; }
        this.applyChartTemplate(tpl, true);
    }

    /** a chart-card slice by property name (toggle, number or dropdown) */
    private chartSlice(k: string): { value: unknown; items?: powerbi.IEnumMember[] } | null {
        const cc = this.formattingSettings.chartCard as unknown as
            Record<string, { value: unknown; items?: powerbi.IEnumMember[]; name?: string }>;
        const sl = cc[k];
        return sl && sl.name === k ? sl : null;
    }
    private chartSliceIs(k: string, v: TplValue): boolean {
        const sl = this.chartSlice(k);
        if (!sl) { return true; }
        if (sl.items) { return String((sl.value as powerbi.IEnumMember)?.value) === String(v); }
        return sl.value === v;
    }
    // ------------------------------------------------------------ segmented loading (1.49)

    /**
     * `window` data reduction + fetchMoreData(true) (PnL pattern, Falle 7): every
     * Append update carries the ACCUMULATED data view, so each segment is parsed as
     * the full current state and rendered at once; the next segment is requested
     * right after. Without metadata.segment (≤ one window) nothing changes at all —
     * no request, no hint, the same render as before 1.49.
     */
    private trackSegments(dataView: DataView | undefined, opKind: number | undefined): void {
        // Create (or a host that does not report the kind) starts a new load
        if (opKind !== OP_APPEND) {
            this.awaitingSegment = false;
            this.hostCapped = false;
            this.selfCapped = false;
        }
        const cat = dataView?.categorical;
        this.loadedRows = cat?.categories?.[0]?.values?.length ?? cat?.values?.[0]?.values?.length ?? 0;
        const moreExpected = dataView?.metadata?.segment != null;
        if (!moreExpected) { this.awaitingSegment = false; this.hostCapped = false; this.selfCapped = false; return; }
        if (this.loadedRows >= FETCH_MAX_ROWS) {
            this.awaitingSegment = false; this.selfCapped = true; return;
        }
        const accepted = typeof this.host.fetchMoreData === "function"
            ? this.host.fetchMoreData(true) : false;
        this.awaitingSegment = accepted;
        // request refused → the host caps the total (100 MB / row limit)
        this.hostCapped = !accepted;
    }

    /** subtle load-state line bottom right: progress while segments are on their way,
     *  a warning when the total stays incomplete (host or safety cap) */
    private drawLoadState(width: number, height: number): void {
        if (!this.awaitingSegment && !this.hostCapped && !this.selfCapped) { return; }
        const n = new Intl.NumberFormat(this.host.locale || "de-DE").format(this.loadedRows);
        const text = this.awaitingSegment
            ? this.locStr("Load_Progress", "⏳ {0} rows loaded … loading more").replace("{0}", n)
            : this.selfCapped
                ? this.locStr("Load_SelfCap", "{0} rows loaded — upper limit of the visual, further rows are not loaded").replace("{0}", n)
                : this.locStr("Load_HostCap", "Row limit reached — the host delivers no further segments, data incomplete");
        const dk = this.uiDark;
        const palette = this.host.colorPalette as powerbi.extensibility.ISandboxExtendedColorPalette;
        const hc = !!(palette && palette.isHighContrast);
        const fg = hc ? palette.foreground.value : this.awaitingSegment ? (dk ? DARK_SUBTLE : "#6E6E6E") : (dk ? "#F0821E" : "#B35A00");
        const bg = hc ? palette.background.value : dk ? this.darkPaper() : "#FFFFFF";
        const f = Math.round(9.5 * this.fontK);
        const w = Math.min(width - 12, this.textWidth(text, f) + 12);
        const g = this.el("g", { "data-icd": "load-state" }, this.svg);
        this.el("rect", {
            x: width - 6 - w, y: height - 6 - f - 6, width: w, height: f + 6, rx: 3,
            fill: bg, "fill-opacity": 0.92, stroke: fg, "stroke-width": 0.8
        }, g);
        const t = this.el("text", {
            x: width - 12, y: height - 6 - 4.5, "text-anchor": "end", "font-size": f,
            fill: fg, "font-family": FONT
        }, g);
        t.textContent = this.truncate(text, w - 10, f);
    }

    // ------------------------------------------------------------ locked chips (1.49)

    /**
     * Locked in-chart chip (PnL 1.0.1 pattern): a chip whose click would change
     * nothing in the current state stays in place — the chip row does not jump —
     * but reads as locked (dimmed, default cursor, out of the tab order), explains
     * itself in the tooltip and neither persists nor re-renders. A click on it
     * still stops propagation, so it does not clear the selection either.
     */
    private lockChip(btn: SVGGElement, reason: string): void {
        btn.setAttribute("data-icd-locked", "1");
        btn.setAttribute("aria-disabled", "true");
        btn.setAttribute("tabindex", "-1");
        btn.setAttribute("aria-label", reason);
        btn.style.opacity = "0.4";
        btn.style.cursor = "default";
        const tip = btn.querySelector("title") ?? this.el("title", {}, btn);
        tip.textContent = reason;
        // capture phase on the chip: runs before the chip's own handlers (and before
        // the target's), so already-attached click/keyboard actions never fire
        const block = (e: Event) => { e.stopPropagation(); e.stopImmediatePropagation(); e.preventDefault(); };
        btn.addEventListener("click", block, true);
        btn.addEventListener("keydown", block, true);
    }

    /** after a render: a bridge that drew only its hint (no marks) has nothing to
     *  re-base, sort or animate — its toolbar buttons are locked with the reason */
    private finishChips(): void {
        if (this.bridgeChips.length === 0 || this.animGroups.length > 0) { return; }
        const reason = this.locStr("Lock_NoChart", "No effect: the chart is not drawn in this state (see the note)");
        for (const b of this.bridgeChips) {
            if (b.getAttribute("data-icd-locked") !== "1") { this.lockChip(b, reason); continue; }
            // already locked for a weaker reason (⇅ order): the missing chart is the real one
            b.setAttribute("aria-label", reason);
            const tip = b.querySelector("title");
            if (tip) { tip.textContent = reason; }
        }
    }

    private chartSliceSet(k: string, v: TplValue): void {
        const sl = this.chartSlice(k);
        if (!sl) { return; }
        if (sl.items) {
            const it = sl.items.find(x => String(x.value) === String(v));
            if (it) { sl.value = it; }
        } else {
            sl.value = v;
        }
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
        fs.chartCard.chartButtons.visible = orient === "intwaterfall" || orient === "catbridge"
            || orient === "pnl";
        fs.chartCard.driverNote.visible = orient === "catbridge";
        // UX-5: „Brücke" trägt nur noch waterfallStyle + sortByImpact (Buttons →
        // Interaktion, Treiber-Notiz → Darstellung) — sichtbar, sobald einer davon greift
        fs.chartCard.bridgeGroup.visible = fs.chartCard.waterfallStyle.visible
            || fs.chartCard.sortByImpact.visible || orient === "catbridge";
        fs.chartCard.cardsGroup.visible = orient === "cards";
        // Trend role: its two options only exist with a bound period field; the trend
        // chart then replaces the mini bridge, so the bridge toggle only matters "off"
        const trendCards = orient === "cards" && this.paneHasTrend;
        fs.chartCard.cardTrendChart.visible = trendCards;
        fs.chartCard.cardTrendValue.visible = trendCards;
        fs.chartCard.cardBars.visible = !trendCards
            || String(fs.chartCard.cardTrendChart.value.value) === "off";
        // Brücken-Ausrichtung wirkt nur auf die Kategorie-Brücke
        fs.chartCard.bridgeOrientation.visible = orient === "catbridge";
        // Scatter: eigene Gruppe nur im Scatter; Δ-Panels gibt es dort nicht (Status-
        // Färbung nutzt die Basis trotzdem); Small Multiples = echte Kacheln (1.48, s. u.)
        const isScatter = orient === "scatter";
        fs.chartCard.scatterGroup.visible = isScatter;
        fs.chartCard.showAbsoluteVariance.visible = !isScatter;
        fs.chartCard.showRelativeVariance.visible = !isScatter;
        if (isScatter) { fs.chartCard.dualVariance.visible = false; }
        // Scatter v3 gates: Formen nur bei Gruppen-Färbung; Pfeile nur mit PY;
        // R² nur bei aktiver Trendlinie; Größen-Legende nur mit gebundener Blasengröße;
        // Quadranten-Labels nur, wenn überhaupt Quadranten-Linien entstehen können
        // (Quadranten an oder eine Referenzlinie gesetzt)
        fs.chartCard.scatterShapes.visible = isScatter
            && String(fs.chartCard.scatterColorBy.value.value) === "group";
        fs.chartCard.scatterArrows.visible = isScatter && this.paneHasPy;
        fs.chartCard.scatterTrendR2.visible = isScatter
            && String(fs.chartCard.scatterTrend.value.value) !== "off";
        fs.chartCard.scatterSizeLegend.visible = isScatter && this.sizeName != null;
        const quadOn = String(fs.chartCard.scatterQuadrant.value.value) !== "off"
            || String(fs.scaleCard.refLine.value || "").trim() !== ""
            || String(fs.scaleCard.xRefLine.value || "").trim() !== "";
        fs.chartCard.scatterQuadLabelTR.visible = isScatter && quadOn;
        fs.chartCard.scatterQuadLabelTL.visible = isScatter && quadOn;
        fs.chartCard.scatterQuadLabelBL.visible = isScatter && quadOn;
        fs.chartCard.scatterQuadLabelBR.visible = isScatter && quadOn;
        fs.scaleCard.refLineLabel.visible = String(fs.scaleCard.refLine.value || "").trim() !== "";
        fs.scaleCard.capOverflow.visible = (fs.scaleCard.fixedMax.value ?? 0) > 0;
        fs.scaleCard.fixedVarMax.visible = fs.chartCard.showAbsoluteVariance.value;
        // comments card stays visible without a comment measure — the in-chart
        // capture mode works on any category
        fs.commentsCard.visible = true;
        // Scatter (1.48): echte Kacheln — die Gruppe ist wieder da, aber OHNE Σ-Kachel und
        // Top-N/Rest-Kachel (Summen über Quoten wären falsch) und ohne den Brücken-
        // Skalen-Schalter: der Scatter teilt X/Y-Skala immer über alle Kacheln (IBCS)
        fs.chartCard.multiplesGroup.visible = this.paneHasMultiples;
        fs.chartCard.multiplesTotal.visible = !isScatter;
        fs.chartCard.multiplesTopN.visible = !isScatter;
        fs.chartCard.multiplesSameScale.visible = !isScatter;
        fs.chartCard.cumulativeButton.visible = orient === "columns" || orient === "line";
        fs.chartCard.cumulative.visible = orient === "columns" || orient === "line" || orient === "table";
        fs.chartCard.cumulativeKind.visible = fs.chartCard.cumulative.visible && fs.chartCard.cumulative.value;
        fs.chartCard.fiscalStart.visible = fs.chartCard.cumulativeKind.visible
            && String(fs.chartCard.cumulativeKind.value.value) !== "r12";
        // benchmark counts: cards in monitoring mode (AC + BM only) judge against
        // BM and need the materiality thresholds just as much
        fs.chartCard.materialityAbs.visible = this.paneHasPy || this.paneHasPl || this.paneHasBm;
        fs.chartCard.materialityPct.visible = this.paneHasPy || this.paneHasPl || this.paneHasBm;
        // exception filter needs something to filter against — and a mode whose row
        // order may shrink (time axes and cascades must stay gapless)
        // sichtbar in allen fähigen Modi, auch OHNE Schwelle — ein verstecktes
        // Feature findet niemand (UX-8). Ohne Schwelle nennt die Beschreibung
        // die Voraussetzung (Slice-disabled gibt es in dieser Utils-Version
        // nicht; descriptionKey dynamisch zu tauschen hat denselben Effekt)
        const excCapable = orient === "bars" || orient === "cards" || orient === "table";
        const excThreshold = (fs.chartCard.materialityAbs.value ?? 0) > 0
            || (fs.chartCard.materialityPct.value ?? 0) > 0;
        fs.chartCard.exceptionOnly.visible = excCapable;
        fs.chartCard.exceptionOnly.descriptionKey = excThreshold
            ? "Desc_Chart_ExceptionOnly" : "Exc_NeedsThreshold";
        // AC+FC-Splitsäule nur anbieten, wenn überhaupt ein FC-Measure da ist (UX-7)
        fs.chartCard.acFcSplit.visible = this.paneHasFc;
        fs.chartCard.compareClick.visible = orient === "columns" || orient === "bars";
        fs.chartCard.showTotal.visible = orient === "columns" || orient === "bars"
            || orient === "line" || orient === "table";
        // scale card only where the shared main scale exists; the waterfall now
        // honors fixedMax/cap after its own domain pass (S7), so the sync group
        // stays visible there too — two waterfalls on a page can share one scale;
        // the table consumes the sync domains but has no ref line / cap marker
        fs.scaleCard.visible = orient === "columns" || orient === "bars"
            || orient === "line" || orient === "waterfall" || orient === "table" || isScatter;
        // Scatter skaliert beide Achsen selbst (keine Sync-Maxima), nutzt aber die
        // Referenzlinien: Y = refLine, X = xRefLine (nur hier sichtbar). Die v3-Gruppe
        // „Scatter-Achsen" (Min/Max-Fixierung + Log) existiert nur im Scatter
        fs.scaleCard.syncGroup.visible = !isScatter;
        fs.scaleCard.xRefLine.visible = isScatter;
        fs.scaleCard.scatterAxesGroup.visible = isScatter;
        fs.scaleCard.refLineGroup.visible = orient !== "table";
        if (orient === "table") { fs.scaleCard.capOverflow.visible = false; }
        // Achsenschnitt nur im Wasserfall; der Schnittwert erst, wenn Schnitt erlaubt ist
        fs.scaleCard.wfAxisGroup.visible = orient === "waterfall";
        fs.scaleCard.wfBreakAt.visible = String(fs.scaleCard.wfAxisBreak.value.value) !== "off";
        fs.chartCard.tableGroup.visible = orient === "table";
        // UX-5: Export-Aufklappen wirkt auf Tabelle/Matrix UND GuV-Statement — lag
        // vorher in der Tabellen-Gruppe und war im GuV-Modus unauffindbar
        fs.chartCard.exportExpandAll.visible = orient === "table" || orient === "pnl";
        // neue Gruppe nur zeigen, wenn mindestens ein Schalter im Modus wirkt
        fs.chartCard.interactionGroup.visible = fs.chartCard.chartButtons.visible
            || fs.chartCard.cumulativeButton.visible || fs.chartCard.compareClick.visible;
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
        this.seriesName = seriesCol?.source.displayName;
        this.multName = mult?.source.displayName;
        const rowTypeCol = catCols?.find(c => c.source.roles?.["rowType"]);
        const fcFlagCol = catCols?.find(c => c.source.roles?.["fcFlag"]);
        const colCols = catCols?.filter(c => c.source.roles?.["colgroup"]) ?? [];
        // Trend role: a period field that only the KPI cards evaluate (sparkline /
        // mini columns per card) — render() merges its rows back in every other mode
        const trendCol = catCols?.find(c => c.source.roles?.["trend"]);
        this.paneHasTrend = !!trendCol;
        this.trendName = trendCol?.source.displayName;
        // period sort key: Date → chronological, numbers (year, month no.) → numeric,
        // anything else → first appearance across all rows
        let trendOrdOf: ((i: number) => number) | null = null;
        if (trendCol) {
            const tv = trendCol.values;
            const nonNull = tv.filter(v => v != null);
            if (nonNull.length > 0 && nonNull.every(v => v instanceof Date)) {
                trendOrdOf = i => tv[i] instanceof Date ? (tv[i] as Date).getTime() : Number.MAX_VALUE;
            } else if (nonNull.length > 0 && nonNull.every(v => typeof v === "number")) {
                trendOrdOf = i => typeof tv[i] === "number" ? tv[i] as number : Number.MAX_VALUE;
            } else {
                const firstSeen = new Map<string, number>();
                tv.forEach((v, i) => {
                    const lbl = this.categoryLabel(v);
                    if (!firstSeen.has(lbl)) { firstSeen.set(lbl, i); }
                });
                trendOrdOf = i => firstSeen.get(this.categoryLabel(tv[i])) ?? i;
            }
        }
        // Smart-Start rules a/b key off the roles being bound AT ALL — independent of
        // what the current orientation later filters/merges them into
        this.paneHasRowType = !!rowTypeCol;
        this.paneHasColgroup = colCols.length > 0;
        this.smartStartCatFieldName = cat?.source.displayName ?? null;
        // Smart-Start rules c/d: distinct category count + time-likeness of the primary
        // category field, computed once here (raw Date typing is only available on this
        // column before categoryLabel() flattens it to a locale string)
        if (cat) {
            const seen = new Set<string>();
            const distinctLabels: string[] = [];
            let hasDate = false;
            for (const v of cat.values) {
                if (v instanceof Date) { hasDate = true; }
                const lbl = this.categoryLabel(v);
                if (!seen.has(lbl)) { seen.add(lbl); distinctLabels.push(lbl); }
            }
            this.smartStartCatCount = distinctLabels.length;
            this.smartStartCatIsTime = hasDate || this.looksLikeTime(distinctLabels);
        } else {
            this.smartStartCatCount = 0;
            this.smartStartCatIsTime = false;
        }
        const valueCols = dataView?.categorical?.values;
        // no category is legitimate: measures alone make a single KPI tile (the
        // "one big number" case). Only the value columns are mandatory.
        if (!valueCols || valueCols.length === 0) { return null; }

        this.missingHint = null;
        const byRole: { [role: string]: (number | null)[] } = {};
        // cross-highlight (supportsHighlight): Power BI keeps every row in values
        // and marks the un-highlighted ones as null in a parallel highlights array.
        // A row counts as highlighted when ANY bound measure has a non-null entry —
        // partial highlights (highlight < value) count as highlighted too.
        let anyHighlights = false;
        const hlRows: boolean[] = [];
        let comments: (string | null)[] | null = null;
        this.measureFormat = undefined;
        // reset with the format: it names the title block and (measure-only binding)
        // the card itself, so a swapped measure must not leave the old name standing
        this.measureName = undefined;
        this.filterInfo = null;
        this.xName = this.xFormat = this.sizeName = this.sizeFormat = undefined;
        this.xPrevName = undefined;
        for (const col of valueCols) {
            const roles = col.source.roles || {};
            for (const role of ["actual", "previousYear", "plan", "forecast", "benchmark", "lineMeasure", "prevForecast",
                "xValue", "xPrevious", "bubbleSize"]) {
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
                    if (role === "xValue") {
                        this.xFormat = col.source.format;
                        this.xName = col.source.displayName;
                    }
                    if (role === "xPrevious") {
                        this.xPrevName = col.source.displayName;
                    }
                    if (role === "bubbleSize") {
                        this.sizeFormat = col.source.format;
                        this.sizeName = col.source.displayName;
                    }
                    if (col.highlights) {
                        anyHighlights = true;
                        for (let i = 0; i < col.highlights.length; i++) {
                            if (col.highlights[i] != null) { hlRows[i] = true; }
                        }
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
        // opt-in: rows whose category is empty on EVERY level ("(blank)") are
        // dropped before anything renders — off by default so no data vanishes
        // silently (beta feedback A. Korn)
        const hideBlank = this.formattingSettings.chartCard.hideBlankCat.value === true;
        const acFcSplit = String(this.formattingSettings.chartCard.acFcSplit.value.value);
        // without a category the measures deliver a single scalar row each
        const rowCount = cat ? cat.values.length : (valueCols[0]?.values?.length ?? 1);
        for (let i = 0; i < rowCount; i++) {
            if (hideBlank && catLevels.length > 0 && catLevels.every(l => {
                const v = l.values[i];
                return v == null || String(v).trim() === "";
            })) { continue; }
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
            // AC+FC im selben Monat (Beta-Wunsch): der laufende Monat ist halb
            // geschlossen — AC-Sockel solide, FC-Anteil schraffiert obendrauf.
            // "full": FC ist die Vollmonatsprognose → Aufstockung max(0, FC−AC);
            // "rest": FC ist der Restmonat → additiv. value wird der Gesamtwert,
            // damit Σ, Skalen und Δ konsistent mit dem Gezeigten rechnen.
            let value = ac != null ? ac : fc;
            let fcPart: number | null = null;
            if (acFcSplit !== "off" && ac != null && fc != null) {
                const part = acFcSplit === "full" ? Math.max(0, fc - ac) : Math.max(0, fc);
                if (part > 0) { fcPart = part; value = ac + part; }
            }
            const fcPrev = byRole["prevForecast"] ? byRole["prevForecast"][i] : null;
            const basis = basisMode === "plan" ? pl : basisMode === "fcrev" ? fcPrev : py;
            const varAbs = (value != null && basis != null) ? value - basis : null;
            const varRel = relVar(varAbs, basis);
            const basis2 = this.basis2Mode === "plan" ? pl : py;
            const var2Abs = (value != null && basis2 != null) ? value - basis2 : null;
            const var2Rel = relVar(var2Abs, basis2);
            const comment = comments ? comments[i] : null;
            let selBuilder = this.host.createSelectionIdBuilder();
            for (const level of catLevels) { selBuilder = selBuilder.withCategory(level, i); }
            if (mult) { selBuilder = selBuilder.withCategory(mult, i); }
            const levelLabels = catLevels.map(level => this.categoryLabel(level.values[i]));
            // measure-only binding: the KPI carries the measure's own name instead
            // of a category label, so a single card reads "Umsatz · 12,4 Mio"
            if (levelLabels.length === 0) {
                levelLabels.push(this.measureName ?? this.locStr("Role_Actual", "Actual (AC)"));
            }
            points.push({
                cat: levelLabels.join(" · "),
                catLevels: levelLabels.length > 1 ? levelLabels : null,
                colLevels: colCols.length > 0
                    ? colCols.map(c => this.categoryLabel(c.values[i])) : null,
                ac, py, pl, fc, value, isFc, fcPart, isPrelim: isPrelim && value != null,
                basis, varAbs, varRel, var2Abs, var2Rel,
                bm: byRole["benchmark"] ? byRole["benchmark"][i] : null,
                fcPrev,
                lineVal: byRole["lineMeasure"] ? byRole["lineMeasure"][i] : null,
                stackSeries: seriesCol && seriesCol.values[i] != null
                    ? this.categoryLabel(seriesCol.values[i]) : null,
                xVal: byRole["xValue"] ? byRole["xValue"][i] : null,
                xPrev: byRole["xPrevious"] ? byRole["xPrevious"][i] : null,
                sizeVal: byRole["bubbleSize"] ? byRole["bubbleSize"][i] : null,
                ...(trendCol && trendOrdOf ? {
                    trend: this.categoryLabel(trendCol.values[i]),
                    trendOrd: trendOrdOf(i)
                } : {}),
                comment,
                commentNo: comment != null ? ++commentCounter : null,
                group: mult ? this.categoryLabel(mult.values[i]) : null,
                rowType: rowTypeCol && rowTypeCol.values[i] != null
                    ? String(rowTypeCol.values[i]).toLowerCase() : null,
                isRest: false,
                dim: anyHighlights && !hlRows[i],
                sel: catLevels.length > 0 || mult ? selBuilder.createSelectionId() : null
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

    /** Smart-Start rule c/d: true when a MAJORITY of labels look like time buckets
     *  (month, quarter, calendar week, year or a date-shaped string). False positives
     *  are worse than false negatives here — a tie or unclear mix stays false. */
    private looksLikeTime(labels: string[]): boolean {
        if (labels.length === 0) { return false; }
        const QUARTER_RX = /^q[1-4](\s?[/-]?\s?\d{2,4})?$/i;
        const WEEK_RX = /^(kw|cw|w)\s?\d{1,2}$/i;
        const YEAR_RX = /^20\d{2}$/;
        const DATE_RX = /^\d{1,4}[.\-/]\d{1,2}[.\-/]\d{1,4}$/;
        let hits = 0;
        for (const raw of labels) {
            const t = (raw ?? "").trim();
            if (!t) { continue; }
            const low = t.toLowerCase();
            // month token + optional trailing dot + optional 2-/4-digit year, e.g.
            // "Mär", "Mär.", "Mär 26", "Sep25", "January 2026"
            const monthMatch = /^([a-zäöüß]+)\.?\s*(\d{2}|\d{4})?$/.exec(low);
            const isMonth = !!monthMatch && SMARTSTART_MONTHS.includes(monthMatch[1]);
            if (isMonth || QUARTER_RX.test(low) || WEEK_RX.test(low)
                || YEAR_RX.test(low) || DATE_RX.test(t)) {
                hits++;
            }
        }
        return hits / labels.length > 0.5;
    }

    /** Smart-Start rules a–d, first match wins. null = no confident suggestion, the
     *  suggestion is already active, no/too few categories, or the user dismissed
     *  this exact constellation before (chart.smartStartDismissed). */
    private computeSmartStartSuggestion(orientationRaw: string): SmartStartSuggestion | null {
        if (!this.formattingSettings.chartCard.smartStart.value) { return null; }
        // measure-only KPI (no category) or too few categories to read a shape from
        if (this.smartStartCatCount < 3) { return null; }
        let sug: SmartStartSuggestion | null = null;
        if (this.paneHasRowType && orientationRaw !== "waterfall" && orientationRaw !== "pnl"
            && orientationRaw !== "table") {
            sug = { rule: "waterfall", textKey: "SmartStart_Waterfall",
                textFallback: "Sum/delta types detected — P&L waterfall?" };
        } else if (this.paneHasColgroup && orientationRaw !== "table") {
            sug = { rule: "table", textKey: "SmartStart_Table",
                textFallback: "Column groups detected — matrix/table?" };
        } else if (orientationRaw === "columns" && !this.smartStartCatIsTime) {
            sug = { rule: "bars", textKey: "SmartStart_Bars",
                textFallback: "Structure detected — bars?" };
        } else if (orientationRaw === "columns" && this.smartStartCatIsTime
            && this.smartStartCatCount > 24) {
            sug = { rule: "line", textKey: "SmartStart_Line",
                textFallback: "Many time points — line chart?" };
        }
        if (!sug || sug.rule === orientationRaw) { return null; }
        if (this.smartStartSignature(sug.rule) === this.smartStartDismissedSig) { return null; }
        return sug;
    }

    /** compact dismiss signature: rule + bound category field, e.g. "bars|cat:Region" —
     *  a different field or a different rule is a new constellation and may suggest again */
    private smartStartSignature(rule: string): string {
        return `${rule}|cat:${this.smartStartCatFieldName ?? ""}`;
    }

    /**
     * Smart-Start suggestion chip, top-left of the chart area (top-right is the ⚠/sort
     * chip cluster): "💡 <suggestion>" applies the mode, a small "✕" dismisses just this
     * constellation. Drawn AFTER the IBCS title block (topY = the title's own height) and
     * reserves its own row so it never overlaps the title text. Returns the reserved height.
     */
    private drawSmartStartChip(topY: number, cfg: ChartConfig, sug: SmartStartSuggestion): number {
        const k = this.fontK;
        const bh = Math.round(18 * k), font = Math.round(11 * k);
        const suggestionText = this.locStr(sug.textKey, sug.textFallback);
        const label = `\u{1F4A1} ${suggestionText}`;
        const chipTip = this.locStr("SmartStart_ChipTip",
            "Smart-Start suggestion based on the bound fields — click to apply.");
        const segW = this.textWidth(label, font) + Math.round(16 * k);
        const x = 6, y = topY + 3;

        const chip = this.el("g", { tabindex: "0", role: "button" }, this.svg) as SVGGElement;
        chip.setAttribute("aria-label", `${label} — ${chipTip}`);
        const tip = this.el("title", {}, chip);
        tip.textContent = `${label} — ${chipTip}`;
        this.el("rect", {
            x, y, width: segW, height: bh, rx: bh / 2,
            fill: cfg.paper, stroke: cfg.hc ? cfg.ink : cfg.subtle, "stroke-width": 1
        }, chip);
        const t = this.el("text", {
            x: x + segW / 2, y: y + bh / 2 + font * 0.36, "text-anchor": "middle",
            "font-size": font, fill: cfg.ink, "font-family": FONT
        }, chip);
        t.textContent = label;
        chip.style.cursor = "pointer";
        const apply = () => {
            // optimistic: the pane echo arrives one update later, the chip's own click
            // must already flip the render — same TTL-guarded pattern as pickMode()
            const oSlice = this.formattingSettings.chartCard.orientation;
            const oIt = oSlice.items.find(it => String(it.value) === sug.rule);
            if (oIt) { oSlice.value = oIt; }
            this.pendingOrientation = sug.rule;
            this.pendingOrientationTtl = 5;
            this.host.persistProperties({
                merge: [{ objectName: "chart", selector: null, properties: { orientation: sug.rule } }]
            });
            this.rerender();
        };
        chip.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); apply(); });
        chip.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key !== "Enter" && e.key !== " ") { return; }
            e.preventDefault(); e.stopPropagation(); apply();
        });

        // dismiss segment ("✕"), directly to the right — persists the constellation
        // signature so THIS suggestion stays quiet, a different one may still appear
        const dx = x + segW + Math.round(4 * k), dw = bh;
        const dismissTip = this.locStr("SmartStart_Dismiss", "Dismiss suggestion");
        const closeChip = this.el("g", { tabindex: "0", role: "button" }, this.svg) as SVGGElement;
        closeChip.setAttribute("aria-label", dismissTip);
        const dtip = this.el("title", {}, closeChip);
        dtip.textContent = dismissTip;
        this.el("rect", {
            x: dx, y, width: dw, height: bh, rx: bh / 2,
            fill: cfg.paper, stroke: cfg.hc ? cfg.ink : cfg.subtle, "stroke-width": 1
        }, closeChip);
        const dt = this.el("text", {
            x: dx + dw / 2, y: y + bh / 2 + font * 0.36, "text-anchor": "middle",
            "font-size": font, fill: cfg.subtle, "font-family": FONT
        }, closeChip);
        dt.textContent = "✕";
        closeChip.style.cursor = "pointer";
        const dismiss = () => {
            const sig = this.smartStartSignature(sug.rule);
            this.smartStartDismissedSig = sig;
            this.pendingSmartStartDismissed = sig;
            this.host.persistProperties({
                merge: [{ objectName: "chart", selector: null, properties: { smartStartDismissed: sig } }]
            });
            this.rerender();
        };
        closeChip.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); dismiss(); });
        closeChip.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key !== "Enter" && e.key !== " ") { return; }
            e.preventDefault(); e.stopPropagation(); dismiss();
        });

        return bh + 6;
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
    private formatterParams(maxAbs: number, allIntegers: boolean, formatOverride?: string): { unit: number; prec: number } {
        const decimals = Math.max(0, Math.min(3, this.formattingSettings.labelsCard.decimals.value ?? 1));
        const unit = String(this.formattingSettings.labelsCard.displayUnits.value.value);
        let unitValue: number;
        switch (unit) {
            case "none": unitValue = 0; break;
            case "k": unitValue = 1e3; break;
            case "m": unitValue = 1e6; break;
            case "b": unitValue = 1e9; break;
            default:
                // a format string with its own magnitude ("#,0 T€", "#,0.0,, Mio €")
                // already says what one unit is — auto scaling on top of it would
                // append a K/M to a T€ value (S13). Explicit pane units still win.
                unitValue = formatCarriesMagnitude(formatOverride ?? this.measureFormat) ? 0
                    : maxAbs >= 1e9 ? 1e9 : maxAbs >= 1e6 ? 1e6 : maxAbs >= 1e4 ? 1e3 : 0;
                break;
        }
        // unscaled integers need no forced decimals
        const precision = unitValue === 0 && allIntegers ? 0 : decimals;
        return { unit: unitValue, prec: precision };
    }

    private makeFormatter(maxAbs: number, allIntegers: boolean, formatOverride?: string): IValueFormatter {
        const { unit, prec } = this.formatterParams(maxAbs, allIntegers, formatOverride);
        return this.buildFormatter(unit, prec, formatOverride);
    }

    /**
     * variance formatter on the SAME display unit as the values (IBCS: one unit
     * per chart — "100,0K€" next to "+2.000 T€" reads as two scales, S13). The
     * unit comes from the larger of both magnitudes; small deltas under a big
     * unit get extra decimals (max 3) so the largest one keeps ~3 significant
     * digits ("+0,055M€" for 55 K€) instead of collapsing to "+0,1" / "+0,0".
     */
    private makeVarFormatter(maxAbs: number, maxVarAbs: number, allIntegers: boolean,
        formatOverride?: string): IValueFormatter {
        const { unit, prec } = this.formatterParams(Math.max(maxAbs, maxVarAbs), allIntegers, formatOverride);
        let p = prec;
        if (unit > 0 && maxVarAbs > 0 && maxVarAbs < unit) {
            p = Math.max(p, Math.min(3, Math.ceil(Math.log10(unit / maxVarAbs)) + 2));
        }
        return this.buildFormatter(unit, p, formatOverride);
    }

    private buildFormatter(unit: number, prec: number, formatOverride?: string): IValueFormatter {
        const f = valueFormatter.create({
            // "" = the measure has NO format string (scatter X/size) — must neither
            // inherit the AC format nor reach valueFormatter as "" (it then ignores
            // the precision and prints every float digit)
            format: formatOverride === "" ? undefined : (formatOverride ?? this.measureFormat),
            value: unit,
            precision: prec,
            cultureSelector: this.host.locale
        });
        if (!this.financeFmt) { return f; }
        // finance convention: negatives in parentheses, zero as "–". Wrapping the
        // formatter covers every label site (values, Δ via fmtSigned, tables, cards)
        return {
            format: (v: unknown) => typeof v === "number"
                ? (v === 0 ? "–" : v < 0 ? `(${f.format(-v)})` : f.format(v))
                : f.format(v)
        } as IValueFormatter;
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
        if (this.financeFmt && v < 0) { return `(${nf.format(Math.abs(v))}%)`; }
        const sign = v > 0 ? "+" : v < 0 ? "−" : "";
        return sign + nf.format(Math.abs(v)) + "%";
    }

    /** UN 4.1 "n.a." case of a point's Δ% (primary or second basis): Δ exists, basis ≤ 0 */
    private relNa(p: DataPoint, second = false): boolean {
        // margin rows compare in percentage points — they never carry a Δ%
        if ((p.rowType ?? "").startsWith("pct")) { return false; }
        return second
            ? relIsNa(p.var2Abs, this.basis2Mode === "plan" ? p.pl : p.py)
            : relIsNa(p.varAbs, p.basis);
    }

    /** Δ% label text: the percentage, "n.a." for a non-interpretable basis, else "" */
    private relText(p: DataPoint, second = false): string {
        const v = second ? p.var2Rel : p.varRel;
        return v != null ? this.fmtPercent(v) : this.relNa(p, second) ? REL_NA : "";
    }

    /** self-styled hover tooltip while dark mode is active. The host tooltip keeps
     *  the report's (usually light) styling, which glares on a dark page — this
     *  overlay follows the visual's own dark tokens instead. Light mode keeps the
     *  native tooltipService untouched. */
    private darkTip: HTMLDivElement | null = null;

    private showDarkTip(items: VisualTooltipDataItem[], e: MouseEvent): void {
        if (!this.darkTip) {
            if (window.getComputedStyle(this.root).position === "static") {
                this.root.style.position = "relative";
            }
            const d = document.createElement("div");
            d.style.cssText = "position:absolute;z-index:20;pointer-events:none;"
                + "background:#2B2B2B;color:#E8E8E8;border:1px solid #5A5A5A;"
                + "border-radius:4px;box-shadow:0 2px 10px rgba(0,0,0,0.45);"
                + "padding:7px 10px;font-family:'Segoe UI',sans-serif;font-size:11px;"
                + "line-height:1.5;max-width:280px;";
            this.root.appendChild(d);
            this.darkTip = d;
        }
        const d = this.darkTip;
        while (d.firstChild) { d.removeChild(d.firstChild); }
        items.forEach((it, i) => {
            const row = document.createElement("div");
            if (i === 0) {
                // first item is the category — render it as the tooltip header
                row.style.cssText = "font-weight:600;margin-bottom:3px;";
                row.textContent = it.value;
            } else {
                const n = document.createElement("span");
                n.style.cssText = "color:#A6A6A6;margin-right:8px;";
                n.textContent = it.displayName;
                const v = document.createElement("span");
                v.textContent = it.value;
                row.appendChild(n);
                row.appendChild(v);
            }
            d.appendChild(row);
        });
        this.moveDarkTip(e);
    }

    private moveDarkTip(e: MouseEvent): void {
        const d = this.darkTip;
        if (!d) { return; }
        const r = this.root.getBoundingClientRect();
        let x = e.clientX - r.left + 14;
        let y = e.clientY - r.top + 14;
        // flip to the other side of the cursor instead of leaving the visual
        if (x + d.offsetWidth > r.width - 4) {
            x = Math.max(4, e.clientX - r.left - d.offsetWidth - 14);
        }
        if (y + d.offsetHeight > r.height - 4) {
            y = Math.max(4, e.clientY - r.top - d.offsetHeight - 14);
        }
        d.style.left = `${x}px`;
        d.style.top = `${y}px`;
    }

    private hideDarkTip(): void {
        if (this.darkTip) {
            this.darkTip.remove();
            this.darkTip = null;
        }
    }

    /** shared colors for the small HTML overlays (search box, structure menu,
     *  comment editor) — they float over the report page, so they follow uiDark */
    private popupColors(): { bg: string; ink: string; border: string; subtle: string } {
        return this.uiDark
            ? { bg: "#2B2B2B", ink: "#E8E8E8", border: "#5A5A5A", subtle: DARK_SUBTLE }
            : { bg: "#FFFFFF", ink: "#252423", border: "#8A8A8A", subtle: "#6E6E6E" };
    }

    /** pro Feld-Konstellation nur EINMAL automatisch aufklappen — ein manuelles
     *  Hochklappen des Nutzers (Drill-up) darf nicht übersteuert werden */
    private autoExpandDone = new Set<string>();

    /** Mehrfeld-Kategorie in Tabelle/GuV: Power BI liefert ohne Drill nur die
     *  oberste Ebene; erst "Alle eine Ebene nach unten erweitern" bringt die
     *  weiteren Kategorie-Spalten, aus denen der klickbare Zeilenbaum entsteht.
     *  Die Drilldown-API (host.drill, DrillType.Down = Union der Ebenen) löst
     *  das ohne Nutzer-Klick aus. Signatur = aktuelle Kategorie-Spalten; nach
     *  jedem Expand ändert sie sich, bis Down nicht mehr angeboten wird — so
     *  klappen auch 3+ Ebenen vollständig auf, und ein Drill-up des Nutzers
     *  (gleiche Signatur schon gesehen) bleibt unangetastet. */
    private maybeAutoExpand(dataView: DataView | undefined): void {
        const s = this.formattingSettings;
        if (!s.chartCard.autoExpandHierarchy.value) { return; }
        const orient = String(s.chartCard.orientation.value.value);
        if (orient !== "table" && orient !== "pnl") { return; }
        const drillable = dataView?.metadata?.dataRoles?.drillableRoles?.["category"];
        // DrillType ist ein const enum (zur Laufzeit nicht vorhanden): Down = 2
        const DRILL_DOWN = 2 as powerbi.DrillType;
        if (!drillable || drillable.indexOf(DRILL_DOWN) < 0) { return; }
        const cols = (dataView?.metadata?.columns ?? [])
            .filter(c => c.roles?.["category"])
            .map(c => c.queryName ?? c.displayName);
        const sig = cols.join("|");
        if (this.autoExpandDone.has(sig)) { return; }
        // Sicherung gegen Endlosschleifen bei unerwartetem Host-Verhalten
        if (this.autoExpandDone.size > 16) { this.autoExpandDone.clear(); }
        this.autoExpandDone.add(sig);
        this.host.drill({ roleName: "category", drillType: DRILL_DOWN });
    }

    /** dark mode: the pane's appearance dropdown wins; "auto" sniffs the report
     *  theme's background luminance. High contrast keeps its own palette path.
     *  Themes that never set a background report white here, so auto only
     *  triggers on genuinely dark themes — pages painted dark by hand need the
     *  explicit "dark" choice. */
    private resolveDarkMode(): boolean {
        const palette = this.host.colorPalette as powerbi.extensibility.ISandboxExtendedColorPalette;
        if (palette && palette.isHighContrast) { return false; }
        const mode = String(this.formattingSettings?.colorsCard?.appearance?.value?.value ?? "auto");
        if (mode === "dark") { return true; }
        if (mode === "light") { return false; }
        const bg = palette?.background?.value;
        return !!bg && relLuminance(bg) < 0.35;
    }

    /** paper tone while dark: keep the theme's own background if it is dark, so
     *  halos and hollow marks blend into the page instead of a near-miss grey */
    private darkPaper(): string {
        const palette = this.host.colorPalette as powerbi.extensibility.ISandboxExtendedColorPalette;
        const bg = palette?.background?.value;
        return bg && relLuminance(bg) < 0.35 ? bg : DARK_PAPER;
    }

    // --------------------------------------------------------------- landing

    /** landing page renders a live sample chart instead of a text hint */
    /**
     * empty-state landing: a mode gallery — one mini preview tile per chart mode.
     * Clicking a tile persists chart.orientation, so the visual starts in that
     * mode once fields are bound. Replaces the old single pre-rendered sample.
     */
    private renderDemo(width: number, height: number): void {
        // 1.50: an action inside the hub overlay (gallery mode pick, font preset …)
        // re-draws the overlay — never the chart hidden underneath, which then
        // re-renders once when the overlay closes
        if (this.hubOpen && this.lastRender) {
            this.hubDirty = true;
            this.drawHubOverlay();
            return;
        }
        // no live data: in-chart interactions must not re-render a stale dataset
        this.lastRender = null;
        this.compareCats = [];
        this.removeChipBar();
        this.svg.style.display = "block";
        while (this.svg.firstChild) { this.svg.removeChild(this.svg.firstChild); }
        // brand palette with dark-mode stand-ins — same tones the chart uses
        // (the gallery resolves its full palette itself, see drawGallery)
        const dk = this.uiDark;
        const ink = dk ? DARK_INK : "#404040";
        const subtle = dk ? DARK_SUBTLE : "#6E6E6E";
        const tile = dk ? "#262624" : "#FAFAF8";
        const edge2 = dk ? DARK_FAINT : "#DDDDD8";

        // custom empty state (pane card "Leer-Zustand"): the author's own title/body
        // replace the branding. Readers (view mode) get ONLY the message — the mode
        // gallery is a builder tool, so it stays edit-only once a custom text is set
        const esc = this.formattingSettings.emptyStateCard;
        const cTitle = (esc.title.value || "").trim();
        const cBody = (esc.body.value || "").trim();
        const custom = cTitle !== "" || cBody !== "";
        // null = no host context (harness) → treat as edit, like Smart-Start does
        const isEdit = this.viewMode == null || this.viewMode >= 1;
        if (custom && !isEdit) {
            this.renderEmptyMessage(width, height, cTitle, cBody, ink, subtle);
            return;
        }

        // 1.49 emptyState.mode: field intro / own message replace the gallery for
        // the AUTHOR (edit mode, interactive host). Readers and exports keep the
        // previous behaviour above/below — "demo" is exactly the old landing
        const emptyMode = String(esc.mode.value.value);
        if (isEdit && this.allowInteractions && width >= 300 && height >= 220) {
            // 1.50 default: the start hub (tour · templates · demo · fields)
            if (emptyMode === "hub") {
                this.renderHub(width, height);
                return;
            }
            if (emptyMode === "fields") {
                this.renderFieldIntro(width, height);
                return;
            }
            if (emptyMode === "message") {
                const msgBody = custom ? cBody
                    : this.locStr("Es_MessageEmpty", "No own message yet — enter title and text in the format pane under \"Empty state\".");
                this.renderEmptyMessage(width, height, custom ? cTitle : "ChartKitchen byDatenWG", msgBody, ink, subtle);
                this.drawEmptySwitches(width, height, "message", { ink, subtle, tile, edge2 });
                return;
            }
        }
        this.drawGallery(width, height, false);
    }

    /**
     * The demo gallery (mode list with mini previews, font-preset pills) — the
     * landing up to 1.49 and, since 1.50, the hub's "View demo" page. `back` adds
     * the hub's "← Back" chip top-right and nothing else; without it the output is
     * byte-identical to the 1.49 landing.
     */
    private drawGallery(width: number, height: number, back: boolean): void {
        const dk = this.uiDark;
        const ink = dk ? DARK_INK : "#404040", grey = dk ? "#8A8A8A" : "#B3B3B3",
            teal = dk ? "#3FB3C2" : "#1E8F9E", red = dk ? "#E4635F" : "#D64541";
        const subtle = dk ? DARK_SUBTLE : "#6E6E6E", paper = dk ? this.darkPaper() : "#FFFFFF";
        const tile = dk ? "#262624" : "#FAFAF8", tileOn = dk ? "#1E3236" : "#EEF6F7";
        const edge = dk ? DARK_FAINT : "#E4E4DF", edge2 = dk ? DARK_FAINT : "#DDDDD8";
        const soft = dk ? "#BFBFBF" : "#5A5A5A";
        const hint = this.missingHint
            || this.locStr("Demo_Hint", "Sample data — add Category and Actual (AC)");
        const esc = this.formattingSettings.emptyStateCard;
        const cTitle = (esc.title.value || "").trim();
        const cBody = (esc.body.value || "").trim();

        // tiny visuals: no room for the gallery — title + hint only
        if (width < 300 || height < 220) {
            const t0 = this.el("text", {
                x: width / 2, y: height / 2 - 8, "text-anchor": "middle",
                "font-size": 13, "font-weight": 700, fill: ink, "font-family": FONT
            }, this.svg);
            t0.textContent = cTitle !== ""
                ? this.truncate(cTitle, width - 12, 13) : "ChartKitchen byDatenWG";
            const t1 = this.el("text", {
                x: width / 2, y: height / 2 + 10, "text-anchor": "middle",
                "font-size": 10, fill: subtle, "font-family": FONT
            }, this.svg);
            t1.textContent = this.truncate(cBody !== "" ? cBody : hint, width - 12, 10);
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
        // edit mode with a custom empty state: show the author's texts in place of
        // the branding, so the builder previews what readers will get
        title.textContent = cTitle !== "" ? this.truncate(cTitle, width - 24, titleF)
            : "ChartKitchen byDatenWG";
        const sub = this.el("text", {
            x: 12, y: 9 + titleF + subF + 5, "font-size": subF, fill: subtle, "font-family": FONT
        }, this.svg);
        // der Text wird unten gesetzt, sobald der aktive Modus bekannt ist —
        // die Subline nennt dann den NÄCHSTEN Schritt (welche Felder binden)
        // statt des generischen Hinweises (UX-4 aus AUDIT-2026-10-UX.md)
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
                fields: this.locStr("Demo_F_Cards", "Category, AC, PY/PL/BM, opt. Trend") },
            { v: "pareto", key: "Enum_Orientation_Pareto", en: "Pareto",
                use: this.locStr("Demo_Use_Pareto", "ABC analysis: top drivers + cumulative %"),
                fields: this.locStr("Demo_F_Pareto", "Category, AC") },
            { v: "dumbbell", key: "Enum_Orientation_Dumbbell", en: "Dumbbell",
                use: this.locStr("Demo_Use_Dumbbell", "Before/after per category as dot pairs"),
                fields: this.locStr("Demo_F_Dumbbell", "Category, AC, PY/PL") },
            { v: "slope", key: "Enum_Orientation_Slope", en: "Slope",
                use: this.locStr("Demo_Use_Slope", "Rank shifts between two points in time"),
                fields: this.locStr("Demo_F_Slope", "Category, AC, PY/PL") },
            { v: "scatter", key: "Enum_Orientation_Scatter", en: "Scatter / bubble",
                use: this.locStr("Demo_Use_Scatter", "Correlation of two KPIs per category (e.g. revenue vs. margin)"),
                fields: this.locStr("Demo_F_Scatter", "Category, AC (Y), X axis, size (optional)") }
        ];
        const fieldsPre = this.locStr("Demo_Fields", "Fields");
        const active = String(this.formattingSettings.chartCard.orientation.value.value);
        // Subline = nächster Schritt für den AKTIVEN Modus: ein fehlender-
        // Pflichtfeld-Hinweis (missingHint) gewinnt, dann eigener Leer-Text,
        // sonst die konkreten Felder des gewählten Modus (lokalisiert)
        const activeMode = modes.find(m => m.v === active);
        const nextTxt = this.missingHint != null ? hint
            : this.locStr("Demo_Next", "Next: add {0} to the field wells")
                .replace("{0}", activeMode ? activeMode.fields : "");
        sub.textContent = this.truncate(
            cBody !== "" ? cBody
                : `${nextTxt} · ${this.locStr("Demo_Pick", "Click a preview to pick the chart mode")}`,
            width - 24, subF);
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
            this.pendingOrientationTtl = 5;
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
                    fill: on ? tileOn : tile,
                    stroke: on ? teal : edge, "stroke-width": on ? 1.6 : 1
                }, g);
                if (listOk) {
                    // small preview tile left, text block right
                    const tw = Math.min(96, entryH * 1.35), th = entryH - 14;
                    const px = x + 8, py2 = y + 7;
                    this.el("rect", {
                        x: px - 2, y: py2 - 2, width: tw + 4, height: th + 4, rx: 4,
                        fill: paper, stroke: on ? teal : edge2, "stroke-width": on ? 1.6 : 1
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
                        x: tx, y: ty, "font-size": f2, fill: soft, "font-family": FONT
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
                    "font-size": f2, fill: soft, "font-family": FONT
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
                        fill: tile, stroke: edge2, "stroke-width": 1
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
            // short labels: strip the "(dashboard tile)"-style suffix of the enum text;
            // also cover ja-JP where no space precedes the (ASCII or fullwidth) bracket
            const labels = presets.map(p => this.locStr(p.key, p.en).split(/\s*[(（]/)[0].trim());
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
                    fill: on ? teal : tile,
                    stroke: on ? teal : edge2, "stroke-width": 1
                }, g);
                const t = this.el("text", {
                    x: sx + wds[i] / 2, y: sy + segH / 2 + 0.36 * segF, "text-anchor": "middle",
                    "font-size": segF, "font-weight": on ? 700 : 400,
                    fill: on ? (dk ? "#1A1A1A" : "#FFFFFF") : ink, "font-family": FONT
                }, g);
                t.textContent = labels[i];
                g.style.cursor = "pointer";
                const apply = () => {
                    // optimistic: apply + re-render right away so the heading and
                    // the pill react instantly; the host echo confirms it later
                    this.pendingFontPreset = p.v;
                    this.pendingFontPresetTtl = 5;
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
        // 1.50 hub page: "← Back" top-right; the heading steps aside for it
        if (back) {
            const bw = this.drawHubBackChip(width, this.hubColors());
            const tx = Number(title.getAttribute("x"));
            title.textContent = this.truncate(cTitle !== "" ? cTitle : "ChartKitchen byDatenWG",
                Math.max(40, width - 22 - bw - tx), titleF);
        }
    }

    /**
     * 1.49 field intro (emptyState.mode = fields, edit mode only): which field goes
     * into which well — the core roles with a ✓ at the ones already bound and a
     * one-line purpose each, in the report language (PnL 1.2 pattern, drawn as SVG
     * like the rest of the landing). A missing-AC hint stays on top.
     */
    private renderFieldIntro(width: number, height: number, back = false): void {
        const dk = this.uiDark;
        const ink = dk ? DARK_INK : "#404040", teal = dk ? "#3FB3C2" : "#1E8F9E";
        const subtle = dk ? DARK_SUBTLE : "#6E6E6E", soft = dk ? "#BFBFBF" : "#5A5A5A";
        const wash = dk ? DARK_WASH : WASH, edge2 = dk ? DARK_FAINT : "#DDDDD8";
        const tile = dk ? "#262624" : "#FAFAF8";
        const red = dk ? "#E4635F" : "#D64541";
        const sLc = this.formattingSettings.labelsCard;
        const kf = Math.min(3, ({ compact: 1, fullhd: 1.5, presentation: 2 }[
            String(sLc.fontPreset.value.value)] ?? 1)
            * Math.max(0.5, Math.min(3, Number(sLc.fontScale.value ?? 100) / 100)));
        const tf = Math.min(1.4, Math.max(1, kf));
        const fT = Math.round(14 * tf), fB = Math.round(11 * tf), fS = Math.round(9.5 * tf);
        const roles = this.boundRoles();
        const rows: { id: string; key: string; en: string; tKey: string; tEn: string; sec: number }[] = [
            { id: "category", key: "Role_Category", en: "Category", sec: 0,
                tKey: "FI_Category", tEn: "Axis or structure — months for time series, regions/products for structure; several fields = drill hierarchy" },
            { id: "actual", key: "Role_Actual", en: "Actual (AC)", sec: 0,
                tKey: "FI_Ac", tEn: "Actual measure, drawn solid dark — the only required value (alternatively FC)" },
            { id: "previousYear", key: "Role_PreviousYear", en: "Previous Year (PY)", sec: 1,
                tKey: "FI_Py", tEn: "Prior year → ΔPY panel and pins, drawn grey" },
            { id: "plan", key: "Role_Plan", en: "Plan / Budget (PL)", sec: 1,
                tKey: "FI_Pl", tEn: "Plan/budget → ΔPL, drawn outlined" },
            { id: "forecast", key: "Role_Forecast", en: "Forecast (FC)", sec: 1,
                tKey: "FI_Fc", tEn: "Forecast, hatched — fills the periods without actuals" },
            { id: "series", key: "Role_Series", en: "Stack series", sec: 1,
                tKey: "FI_Series", tEn: "Stacks columns/bars by this breakdown (templates C01/C02)" },
            { id: "multiples", key: "Role_Multiples", en: "Small Multiples", sec: 1,
                tKey: "FI_Multiples", tEn: "One tile per value, all on the same scale (template C13)" }
        ];
        const pad = 12;
        // hub page (1.50): the box leaves the top-right corner to the "← Back" chip
        const backW = back ? this.hubBackChipWidth() + 8 : 0;
        const boxX = pad, boxY = pad, boxW = Math.min(width - 2 * pad - backW, 760);
        const switchH = back ? 0 : Math.round(21 * tf) + 12;
        const boxH = height - 2 * pad - switchH;
        const g = this.el("g", { "data-icd": "field-intro" }, this.svg) as SVGGElement;
        const box = this.el("rect", {
            x: boxX, y: boxY, width: boxW, height: Math.max(40, boxH), rx: 6,
            fill: wash, stroke: edge2, "stroke-width": 1, "stroke-dasharray": "4,3"
        }, g);
        const ix = boxX + 14, iw = boxW - 28;
        let y = boxY + 12 + fT;
        const txt = (x: number, yy: number, t: string, size: number, fill: string, bold = false, maxW = iw) => {
            const e = this.el("text", {
                x, y: yy, "font-size": size, fill, "font-family": FONT, ...(bold ? { "font-weight": 600 } : {})
            }, g);
            e.textContent = this.truncate(t, maxW, size);
            return e;
        };
        txt(ix, y, this.locStr("FI_Title", "Which field goes where"), fT, ink, true);
        y += Math.round(fB * 1.6);
        txt(ix, y, this.locStr("FI_Intro", "Fill the field wells — the chart appears as soon as Actual (AC) is bound."), fB, soft);
        const bottom = boxY + boxH - 8;
        if (this.missingHint) {
            y += Math.round(fB * 1.5);
            txt(ix, y, this.missingHint, fB, red, true);
        }
        const lineH = Math.round(fB * 1.55);
        const nameW = Math.min(iw * 0.42, Math.max(...rows.map(r =>
            this.textWidth(this.locStr(r.key, r.en), fB))) + 8);
        let sec = -1;
        for (const r of rows) {
            if (r.sec !== sec) {
                sec = r.sec;
                if (y + Math.round(fB * 1.7) + lineH > bottom) { break; }
                y += Math.round(fB * 1.7);
                txt(ix, y, (sec === 0 ? this.locStr("FI_Minimal", "Minimal") : this.locStr("FI_Extended", "Extended"))
                    .toUpperCase(), fS, subtle, true);
            }
            if (y + lineH > bottom) { break; }
            y += lineH;
            const on = roles.has(r.id);
            const mark = txt(ix, y, on ? "✓" : "○", fB, on ? teal : subtle, true, 16);
            mark.setAttribute("data-fi", r.id);
            mark.setAttribute("data-on", on ? "1" : "0");
            txt(ix + 18, y, this.locStr(r.key, r.en), fB, ink, true, nameW);
            txt(ix + 18 + nameW + 6, y, this.locStr(r.tKey, r.tEn), fB, soft, false, iw - 24 - nameW);
        }
        if (y + Math.round(fB * 1.9) <= bottom) {
            y += Math.round(fB * 1.9);
            const h = txt(ix, y, this.locStr("FI_Hint", "Then pick an IBCS template: format pane → Chart → IBCS chart template."), fB, subtle);
            h.setAttribute("font-style", "italic");
        }
        // the dashed box hugs its content; the switches sit right below it
        const fitH = Math.max(40, Math.min(boxH, y - boxY + Math.round(fB * 0.9) + 6));
        box.setAttribute("height", String(fitH));
        if (back) {
            this.drawHubBackChip(width, this.hubColors());
            return;
        }
        this.drawEmptySwitches(width, height, "fields", { ink, subtle, tile, edge2 }, boxY + fitH + 10);
    }

    /** bound roles: metadata columns (host) and the categorical sources (harness) */
    private boundRoles(): Set<string> {
        const dv = this.lastDataView;
        const roles = new Set<string>();
        const take = (r: { [k: string]: boolean } | undefined) => {
            for (const k of Object.keys(r ?? {})) { if (r && r[k]) { roles.add(k); } }
        };
        for (const c of dv?.metadata?.columns ?? []) { take(c.roles); }
        for (const c of dv?.categorical?.categories ?? []) { take(c.source.roles); }
        for (const c of dv?.categorical?.values ?? []) { take(c.source.roles); }
        return roles;
    }

    /**
     * 1.49 empty-state switches (edit mode only, bottom left): every mode except the
     * current one. A click persists emptyState.mode (echo guard + TTL) and shows the
     * new start at once; readers never see these buttons.
     */
    private drawEmptySwitches(width: number, height: number, cur: string,
        c: { ink: string; subtle: string; tile: string; edge2: string }, top?: number): void {
        const sLc = this.formattingSettings.labelsCard;
        const kf = Math.min(3, ({ compact: 1, fullhd: 1.5, presentation: 2 }[
            String(sLc.fontPreset.value.value)] ?? 1)
            * Math.max(0.5, Math.min(3, Number(sLc.fontScale.value ?? 100) / 100)));
        const tf = Math.min(1.4, Math.max(1, kf));
        const f = Math.round(10.5 * tf), bh = Math.round(21 * tf);
        const tip = this.locStr("Es_SwitchTip", "Saved as Empty state → mode — readers keep seeing the gallery or the own message");
        const opts = [
            // 1.50: back to the start hub (the new default) from fields / own message
            { v: "hub", key: "Es_Hub", en: "☰ Start hub" },
            { v: "demo", key: "Es_Demo", en: "Show gallery" },
            { v: "fields", key: "Es_Fields", en: "Explain fields" },
            { v: "message", key: "Es_Message", en: "Own message" }
        ].filter(o => o.v !== cur);
        let x = 12;
        const y = top != null ? Math.min(top, height - 12 - bh) : height - 12 - bh;
        for (const o of opts) {
            const label = this.locStr(o.key, o.en);
            const w = Math.ceil(this.textWidth(label, f)) + 22;
            const b = this.el("g", { role: "button", tabindex: "0", "data-icd": "es-" + o.v }, this.svg) as SVGGElement;
            b.setAttribute("aria-label", `${label} — ${tip}`);
            const tt = this.el("title", {}, b);
            tt.textContent = tip;
            this.el("rect", {
                x, y, width: w, height: bh, rx: 4, fill: c.tile, stroke: c.edge2, "stroke-width": 1
            }, b);
            const t = this.el("text", {
                x: x + w / 2, y: y + bh / 2 + f * 0.36, "text-anchor": "middle",
                "font-size": f, fill: c.ink, "font-family": FONT
            }, b);
            t.textContent = label;
            b.style.cursor = "pointer";
            const go = () => {
                const sl = this.formattingSettings.emptyStateCard.mode;
                const it = sl.items.find(xx => String(xx.value) === o.v);
                if (it) { sl.value = it; }
                this.pendingEmptyMode = o.v;
                this.pendingEmptyModeTtl = 5;
                if (o.v === "hub") { this.hubPage = "home"; }
                this.host.persistProperties({
                    merge: [{ objectName: "emptyState", selector: null, properties: { mode: o.v } }]
                });
                this.renderDemo(width, height);
            };
            b.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); go(); });
            b.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key !== "Enter" && e.key !== " ") { return; }
                e.preventDefault(); e.stopPropagation(); go();
            });
            x += w + 6;
        }
    }

    /** consumer-facing empty state: only the author's title + body, centered —
     *  shown in view mode when the "Leer-Zustand" card carries custom text */
    private renderEmptyMessage(width: number, height: number, title: string, body: string,
        ink: string, subtle: string): void {
        // same effective font factor as the landing header (preset × free scale)
        const sLc = this.formattingSettings.labelsCard;
        const kf = Math.min(3, ({ compact: 1, fullhd: 1.5, presentation: 2 }[
            String(sLc.fontPreset.value.value)] ?? 1)
            * Math.max(0.5, Math.min(3, Number(sLc.fontScale.value ?? 100) / 100)));
        const tf = Math.min(Math.round(15 * kf), 32);
        const bf = Math.min(Math.round(11.5 * kf), 22);
        const maxW = Math.min(width - 32, 560);
        // word-wrap the body against the real text metrics
        const lines: string[] = [];
        for (const para of body.split(/\n/)) {
            let line = "";
            for (const word of para.split(/\s+/).filter(w => w !== "")) {
                const probe = line === "" ? word : `${line} ${word}`;
                if (line === "" || this.textWidth(probe, bf) <= maxW) { line = probe; }
                else { lines.push(line); line = word; }
            }
            lines.push(line);
        }
        while (lines.length > 0 && lines[lines.length - 1] === "") { lines.pop(); }
        const lineH = Math.round(bf * 1.5);
        const gapTB = title !== "" && lines.length > 0 ? Math.round(bf * 0.9) : 0;
        const blockH = (title !== "" ? tf : 0) + gapTB + lines.length * lineH;
        let y = Math.max(tf + 10, (height - blockH) / 2 + tf);
        if (title !== "") {
            const t = this.el("text", {
                x: width / 2, y, "text-anchor": "middle",
                "font-size": tf, "font-weight": 700, fill: ink, "font-family": FONT
            }, this.svg);
            t.textContent = this.truncate(title, width - 24, tf);
            y += gapTB + bf;
        }
        for (const ln of lines) {
            if (ln !== "") {
                const t = this.el("text", {
                    x: width / 2, y, "text-anchor": "middle",
                    "font-size": bf, fill: subtle, "font-family": FONT
                }, this.svg);
                t.textContent = ln;
            }
            y += lineH;
        }
    }

    // --------------------------------------------------------------- start hub (1.50)

    /** chip + overlay only for the AUTHOR: explicit edit mode on an interactive host.
     *  A host that reports no view mode gets no chip, so a bound chart renders exactly
     *  as before; the empty-state hub keeps the landing's own rule (null = edit). */
    private hubChipAllowed(): boolean {
        return this.allowInteractions && this.viewMode === 1;
    }

    /** landing font factor (preset × free scale), capped so fixed tiles never overflow */
    private landingTf(): number {
        const sLc = this.formattingSettings.labelsCard;
        const kf = Math.min(3, ({ compact: 1, fullhd: 1.5, presentation: 2 }[
            String(sLc.fontPreset.value.value)] ?? 1)
            * Math.max(0.5, Math.min(3, Number(sLc.fontScale.value ?? 100) / 100)));
        return Math.min(1.4, Math.max(1, kf));
    }

    /** hub palette: the landing's brand tones, dark stand-ins, or the host's
     *  high-contrast palette (foreground for everything, foregroundSelected as accent) */
    private hubColors(): HubColors {
        const pal = this.host.colorPalette as powerbi.extensibility.ISandboxExtendedColorPalette;
        if (pal && pal.isHighContrast) {
            const fg = pal.foreground?.value || "#FFFFFF";
            const bg = pal.background?.value || "#000000";
            const sel = pal.foregroundSelected?.value || fg;
            return { hc: true, ink: fg, grey: fg, teal: sel, red: fg, paper: bg, subtle: fg, soft: fg,
                tile: bg, tileOn: bg, edge: fg, edge2: fg, onAccent: bg };
        }
        const dk = this.uiDark;
        return {
            hc: false, ink: dk ? DARK_INK : "#404040", grey: dk ? "#8A8A8A" : "#B3B3B3",
            teal: dk ? "#3FB3C2" : "#1E8F9E", red: dk ? "#E4635F" : "#D64541",
            paper: dk ? this.darkPaper() : "#FFFFFF", subtle: dk ? DARK_SUBTLE : "#6E6E6E",
            soft: dk ? "#BFBFBF" : "#5A5A5A", tile: dk ? "#262624" : "#FAFAF8",
            tileOn: dk ? "#1E3236" : "#EEF6F7", edge: dk ? DARK_FAINT : "#E4E4DF",
            edge2: dk ? DARK_FAINT : "#DDDDD8", onAccent: dk ? "#1A1A1A" : "#FFFFFF"
        };
    }

    /** hatch pattern of the FC mini column (drawModeMini), once per surface */
    private ensureDemoHatch(c: HubColors): void {
        if (this.svg.querySelector("#icd-demo-hatch")) { return; }
        const defs = this.el("defs", {}, this.svg);
        const pat = this.el("pattern", {
            id: "icd-demo-hatch", width: 4, height: 4,
            patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)"
        }, defs);
        this.el("rect", { x: 0, y: 0, width: 4, height: 4, fill: c.paper }, pat);
        this.el("line", { x1: 0, y1: 0, x2: 0, y2: 4, stroke: c.ink, "stroke-width": 1.4 }, pat);
    }

    /** the hub page currently selected — on the empty state or the overlay surface */
    private renderHub(width: number, height: number): void {
        this.hubW = width;
        this.hubH = height;
        switch (this.hubPage) {
            case "tour": this.drawHubTour(width, height); break;
            case "templates": this.drawHubTemplates(width, height); break;
            case "demo": this.drawGallery(width, height, true); break;
            case "fields": this.renderFieldIntro(width, height, true); break;
            default: this.drawHubHome(width, height);
        }
        // keyboard navigation: the element that triggered the redraw keeps the focus
        // (only after a user action — the initial render never steals focus)
        const fk = this.hubFocus;
        this.hubFocus = null;
        if (fk) {
            const f = this.svg.querySelector(`[data-icd="${fk}"]`) as SVGGElement | null;
            if (f && typeof f.focus === "function") { f.focus(); }
        }
    }

    /** redraw the current hub surface (navigation: nothing is persisted) */
    private hubRedraw(): void {
        if (this.hubOpen && this.lastRender) { this.drawHubOverlay(); return; }
        this.renderDemo(this.hubW, this.hubH);
    }

    private hubGo(page: HubPage, focus?: string): void {
        const from = this.hubPage;
        this.hubPage = page;
        this.hubFocus = focus ?? (page === "home" ? `hub-${from}` : "hub-back");
        this.hubRedraw();
    }

    /** "← Back" / Esc: sub page → hub home; hub home in the overlay → close */
    private hubBack(): void {
        if (this.hubPage !== "home") { this.hubGo("home"); return; }
        if (this.hubOpen) { this.closeHub(); }
    }

    /** focusable SVG button: click / Enter / Space act, Esc steps back */
    private hubBtn(parent: Node, key: string, label: string, act: () => void): SVGGElement {
        const b = this.el("g", { role: "button", tabindex: "0", "data-icd": key }, parent) as SVGGElement;
        b.setAttribute("aria-label", label);
        const tt = this.el("title", {}, b);
        tt.textContent = label;
        b.style.cursor = "pointer";
        b.style.outline = "none";
        b.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); act(); });
        b.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault(); e.stopPropagation(); act();
            } else if (e.key === "Escape") {
                e.preventDefault(); e.stopPropagation(); this.hubBack();
            }
        });
        return b;
    }

    /** hover + keyboard focus ring on a hub button's frame (accent stroke) */
    private hubFrame(b: SVGGElement, frame: SVGElement, c: HubColors): void {
        const stroke = frame.getAttribute("stroke") ?? c.edge;
        const sw = frame.getAttribute("stroke-width") ?? "1";
        let hover = false, focus = false;
        const sync = () => {
            const on = hover || focus;
            frame.setAttribute("stroke", on ? c.teal : stroke);
            frame.setAttribute("stroke-width", on ? String(Math.max(2, Number(sw))) : sw);
        };
        b.addEventListener("mouseenter", () => { hover = true; sync(); });
        b.addEventListener("mouseleave", () => { hover = false; sync(); });
        b.addEventListener("focus", () => { focus = true; sync(); });
        b.addEventListener("blur", () => { focus = false; sync(); });
    }

    /** word wrap against real text metrics; CJK breaks between characters; the last
     *  line ends in "…" when the text does not fit into maxLines */
    private hubWrap(text: string, maxW: number, f: number, maxLines: number): string[] {
        if (maxLines <= 0 || maxW <= 8) { return []; }
        const tokens = text.split(/(\s+)/)
            .flatMap(t => /[　-鿿＀-￯]/.test(t) ? [...t] : [t]);
        const out: string[] = [];
        let line = "";
        let cut = false;
        for (const tok of tokens) {
            if (tok === "") { continue; }
            if (/^\s+$/.test(tok)) { if (line !== "") { line += " "; } continue; }
            const probe = line + tok;
            if (line.trim() === "" || this.textWidth(probe, f) <= maxW) { line = probe; continue; }
            out.push(line.trimEnd());
            if (out.length >= maxLines) { cut = true; break; }
            line = tok;
        }
        if (!cut && line.trim() !== "") { out.push(line.trimEnd()); }
        if (cut) {
            let last = out.pop() ?? "";
            while (last.length > 1 && this.textWidth(last + "…", f) > maxW) { last = last.slice(0, -1); }
            out.push(last.trimEnd() + "…");
        }
        return out.map(l => this.truncate(l, maxW, f));
    }

    /** "← Back" (sub pages) or "✕ Close" (overlay home) chip top-right; returns its width */
    private hubBackChipWidth(close = false): number {
        const f = Math.round(10.5 * this.landingTf());
        const label = close ? this.locStr("Hub_Close", "✕ Close") : this.locStr("Hub_Back", "← Back");
        return Math.ceil(this.textWidth(label, f)) + 22;
    }

    private drawHubBackChip(width: number, c: HubColors, close = false): number {
        const tf = this.landingTf();
        const f = Math.round(10.5 * tf), bh = Math.round(21 * tf);
        const label = close ? this.locStr("Hub_Close", "✕ Close") : this.locStr("Hub_Back", "← Back");
        const w = this.hubBackChipWidth(close);
        const x = width - 12 - w, y = 8;
        const tip = close
            ? this.locStr("Hub_CloseTip", "Close the start hub — the chart appears exactly as before (Esc)")
            : this.locStr("Hub_BackTip", "Back to the start hub (Esc)");
        const b = this.hubBtn(this.svg, close ? "hub-close" : "hub-back", tip,
            () => { if (close) { this.closeHub(); } else { this.hubGo("home"); } });
        const fr = this.el("rect", {
            x, y, width: w, height: bh, rx: 4, fill: c.tile, stroke: c.hc ? c.ink : c.edge2, "stroke-width": 1
        }, b);
        this.hubFrame(b, fr, c);
        const t = this.el("text", {
            x: x + w / 2, y: y + bh / 2 + f * 0.36, "text-anchor": "middle",
            "font-size": f, fill: c.ink, "font-family": FONT
        }, b);
        t.textContent = label;
        return w;
    }

    // ------------------------------------------------------------ overlay + chips

    /** ☰ Start (bound chart, edit mode): the hub as overlay. The chart SVG is only
     *  hidden — closing shows it again untouched, unless a setting changed inside */
    private openHub(): void {
        if (!this.lastRender || !this.hubChipAllowed()) { return; }
        this.closeCommentEditor();
        this.closeStructureMenu();
        this.hideDarkTip();
        this.hubOpen = true;
        this.hubDirty = false;
        this.hubPage = "home";
        this.hubTplSaved = null;
        this.hubFocus = "hub-tour";
        this.removeChipBar();
        this.drawHubOverlay();
    }

    private drawHubOverlay(): void {
        const lr = this.lastRender;
        if (!lr) { return; }
        if (!this.hubSvg) {
            const s = document.createElementNS(SVG_NS, "svg");
            s.setAttribute("data-icd", "hub-overlay");
            s.setAttribute("role", "dialog");
            this.root.appendChild(s);
            this.hubSvg = s;
        }
        const hs = this.hubSvg;
        hs.setAttribute("width", String(lr.width));
        hs.setAttribute("height", String(lr.height));
        hs.setAttribute("aria-label", this.locStr("Hub_Overlay", "ChartKitchen start hub"));
        hs.style.display = "block";
        this.svg.style.display = "none";
        // every hub/gallery/field-intro drawer paints into this.svg — point it at the
        // overlay for this synchronous draw only; event handlers come back through
        // renderDemo / hubRedraw, which route to the overlay again
        const main = this.svg;
        this.svg = hs;
        try {
            while (hs.firstChild) { hs.removeChild(hs.firstChild); }
            this.renderHub(lr.width, lr.height);
        } finally {
            this.svg = main;
        }
    }

    /** hide the overlay without touching the chart (state change from outside) */
    private hideHubOverlay(): void {
        this.hubOpen = false;
        if (this.hubSvg) {
            while (this.hubSvg.firstChild) { this.hubSvg.removeChild(this.hubSvg.firstChild); }
            this.hubSvg.style.display = "none";
        }
        this.svg.style.display = "block";
    }

    private closeHub(): void {
        const dirty = this.hubDirty;
        this.hideHubOverlay();
        this.hubDirty = false;
        this.hubPage = "home";
        // untouched: the hidden chart is exactly the one from before; otherwise the
        // locally applied settings (template, mode …) render once right away
        if (dirty) { this.rerender(); } else { this.updateChipBar(); }
        const chip = this.chipBar?.querySelector('[data-icd="hub-chip"]') as HTMLElement | null;
        if (chip) { chip.focus(); this.syncHubChipOpacity(); }
    }

    private chipBarSig = "";

    /**
     * HTML chip row bottom-left over the bound chart, edit mode only: "↺ Back to
     * template" whenever the settings deviate from the template set in
     * chart.template, and "☰ Start" (visible on hover / keyboard focus) opening the
     * hub overlay. Rebuilt only when its content changes; readers and exports never
     * get it (and a host without view mode neither — the chart stays pixel-identical).
     */
    private updateChipBar(): void {
        const lr = this.lastRender;
        const ok = !this.hubOpen && lr != null && this.hubChipAllowed();
        const start = ok && lr.width >= 300 && lr.height >= 220;
        const dev = ok && lr.width >= 160 && lr.height >= 60 ? this.templateDeviation() : null;
        if (!start && dev == null) { this.removeChipBar(); return; }
        const c = this.hubColors();
        const fs = Math.round(11 * Math.min(1.5, Math.max(1, this.fontK)));
        const sig = `${start}|${dev}|${c.ink}|${c.paper}|${c.edge2}|${fs}`;
        if (this.chipBar && this.chipBarSig === sig && this.chipBar.parentNode === this.root) {
            this.syncHubChipOpacity();
            return;
        }
        this.removeChipBar();
        this.root.style.position = "relative";
        const bar = document.createElement("div");
        bar.setAttribute("data-icd", "chip-bar");
        Object.assign(bar.style, {
            position: "absolute", left: "4px", bottom: "4px", display: "flex", gap: "4px", zIndex: "4"
        });
        const mk = (key: string, label: string, tip: string, act: () => void): HTMLButtonElement => {
            const b = document.createElement("button");
            b.type = "button";
            b.setAttribute("data-icd", key);
            b.textContent = label;
            b.title = tip;
            b.setAttribute("aria-label", tip);
            Object.assign(b.style, {
                font: `${fs}px ${FONT}`, lineHeight: `${Math.round(fs * 1.45)}px`, padding: "1px 8px",
                borderRadius: `${Math.round(fs * 0.9)}px`, border: `1px solid ${c.hc ? c.ink : c.edge2}`,
                background: c.paper, color: c.ink, cursor: "pointer", whiteSpace: "nowrap",
                transition: "opacity .15s"
            });
            b.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); act(); });
            bar.appendChild(b);
            return b;
        };
        if (dev != null) {
            const rb = mk("tpl-reset", this.locStr("Tpl_Reset", "↺ Back to template"),
                this.locStr("Tpl_ResetTip", "Settings differ from template {0} — click to restore the template state (everything else stays)")
                    .replace("{0}", dev),
                () => { this.applyChartTemplate(dev); this.rerender(); });
            rb.style.opacity = "0.9";
        }
        if (start) {
            const sb = mk("hub-chip", this.locStr("Hub_Chip", "☰ Start"),
                this.locStr("Hub_ChipTip", "Start hub: feature tour, IBCS templates, demo gallery, field guide — only visible while editing"),
                () => this.openHub());
            sb.addEventListener("focus", () => this.syncHubChipOpacity());
            sb.addEventListener("blur", () => this.syncHubChipOpacity());
        }
        this.root.appendChild(bar);
        this.chipBar = bar;
        this.chipBarSig = sig;
        this.syncHubChipOpacity();
    }

    private removeChipBar(): void {
        if (this.chipBar) { this.chipBar.remove(); }
        this.chipBar = null;
        this.chipBarSig = "";
    }

    /** ☰ Start: invisible until the author points at the visual or tabs onto it */
    private syncHubChipOpacity(): void {
        const b = this.chipBar?.querySelector('[data-icd="hub-chip"]') as HTMLElement | null;
        if (!b) { return; }
        b.style.opacity = this.rootHover || document.activeElement === b ? "1" : "0";
    }

    // ------------------------------------------------------------ hub pages

    /** hub home: four large buttons (tour · templates · demo · fields) */
    private drawHubHome(width: number, height: number): void {
        const c = this.hubColors();
        const tf = this.landingTf();
        this.ensureDemoHatch(c);
        const esc = this.formattingSettings.emptyStateCard;
        const cTitle = (esc.title.value || "").trim();
        const cBody = (esc.body.value || "").trim();
        const fT = Math.round(15 * tf), fS = Math.round(10.5 * tf);
        const fL = Math.round(13 * tf), fD = Math.round(10.5 * tf);
        const pad = 12, gap = 10;
        const closeW = this.hubOpen ? this.drawHubBackChip(width, c, true) : 0;
        const tplNow = String(this.formattingSettings.chartCard.template.value.value);
        const items: { id: HubPage; label: string; desc: string }[] = [
            { id: "tour", label: this.locStr("Hub_Tour", "What can the visual do?"),
                desc: this.locStr("Hub_TourDesc", "Feature tour in 11 cards: chart modes, variances, small multiples, comments …") },
            { id: "templates", label: this.locStr("Hub_Templates", "Templates"),
                desc: CHART_TEMPLATES[tplNow]
                    ? this.locStr("Hub_TemplatesDescOn", "IBCS templates with preview — active: {0}").replace("{0}", tplNow)
                    : this.locStr("Hub_TemplatesDesc", "IBCS templates C01–C13 with preview — one click applies") },
            { id: "demo", label: this.locStr("Hub_Demo", "View demo"),
                desc: this.locStr("Hub_DemoDesc", "All 13 chart types as a gallery — a click picks the mode") },
            { id: "fields", label: this.locStr("Hub_Fields", "Explain fields"),
                desc: this.locStr("Hub_FieldsDesc", "Which field goes where — ✓ at the fields already bound") }
        ];
        const top = pad + fT + 6 + fS + 12;
        const footH = height >= 260 ? 22 : 6;
        const availW = width - 2 * pad, availH = height - top - footH;
        // 4 in a row (wide and low), 2 × 2, or one column (narrow)
        let cols = 2;
        if (availW >= 4 * 170 + 3 * gap && availH < 2 * 96 + gap) { cols = 4; }
        else if (availW < 2 * 190 + gap) { cols = 1; }
        const rows = Math.ceil(items.length / cols);
        const bw = Math.min(400, (availW - (cols - 1) * gap) / cols);
        const bh = Math.max(28, Math.min(120, (availH - (rows - 1) * gap) / rows));
        const blockW = cols * bw + (cols - 1) * gap, blockH = rows * bh + (rows - 1) * gap;
        const x0 = pad + Math.max(0, (availW - blockW) / 2);
        const y0 = top + Math.max(0, (availH - blockH) / 2);
        // header sits right above the (centered) block, like the gallery's
        const subY = Math.max(pad + fT + 6 + fS, y0 - 12);
        const t = this.el("text", {
            x: x0, y: subY - fS - 6, "font-size": fT, "font-weight": 700, fill: c.ink, "font-family": FONT
        }, this.svg);
        const hdrW = width - x0 - pad - (subY - fS - 6 - fT < 8 + 21 * tf ? closeW + 8 : 0);
        t.textContent = this.truncate(cTitle !== "" ? cTitle : "ChartKitchen byDatenWG", hdrW, fT);
        const st = this.el("text", {
            x: x0, y: subY, "font-size": fS, fill: this.missingHint ? c.red : c.subtle, "font-family": FONT
        }, this.svg);
        st.textContent = this.truncate(this.missingHint
            ?? (cBody !== "" ? cBody : this.locStr("Hub_Sub", "Start — pick what you want to do first")),
        width - x0 - pad, fS);
        items.forEach((it, i) => {
            const x = x0 + (i % cols) * (bw + gap), y = y0 + Math.floor(i / cols) * (bh + gap);
            const g = this.hubBtn(this.svg, `hub-${it.id}`, `${it.label} — ${it.desc}`, () => this.hubGo(it.id));
            const fr = this.el("rect", {
                x, y, width: bw, height: bh, rx: 8, fill: c.tile, stroke: c.hc ? c.ink : c.edge, "stroke-width": 1
            }, g);
            this.hubFrame(g, fr, c);
            let tx = x + 14;
            if (bh >= 56 && bw >= 210) {
                const ih = bh - 16, iw = Math.min(ih * 1.45, bw * 0.34);
                this.el("rect", {
                    x: x + 8, y: y + 8, width: iw, height: ih, rx: 5,
                    fill: c.paper, stroke: c.hc ? c.ink : c.edge2, "stroke-width": 1
                }, g);
                this.drawHubIcon(g, it.id, x + 14, y + 14, iw - 12, ih - 12, c);
                tx = x + 8 + iw + 12;
            }
            const tmax = x + bw - 10 - tx;
            const descLines = bh >= 46 ? this.hubWrap(it.desc, tmax, fD, bh >= 84 ? 2 : 1) : [];
            const lh = Math.round(fD * 1.35);
            const textH = fL + (descLines.length > 0 ? 6 + descLines.length * lh - (lh - fD) : 0);
            let ty = y + (bh - textH) / 2 + fL * 0.86;
            const lt = this.el("text", {
                x: tx, y: ty, "font-size": fL, "font-weight": 700, fill: c.ink, "font-family": FONT
            }, g);
            lt.textContent = this.truncate(it.label, tmax, fL);
            ty += 6 + fD * 0.14;
            for (const dl of descLines) {
                ty += lh;
                const dt = this.el("text", {
                    x: tx, y: ty - (lh - fD), "font-size": fD, fill: c.soft, "font-family": FONT
                }, g);
                dt.textContent = dl;
            }
        });
        if (footH > 6) {
            const made = this.el("text", {
                x: width / 2, y: height - 8, "text-anchor": "middle",
                "font-size": 10, fill: c.subtle, "font-family": FONT
            }, this.svg);
            made.textContent = "made by Daten-WG";
        }
    }

    /** small pictogram per hub button, drawn with the gallery's mini pipeline */
    private drawHubIcon(g: SVGElement, id: HubPage, x: number, y: number, w: number, h: number,
        c: HubColors): void {
        const mc = { ink: c.ink, grey: c.grey, teal: c.teal, red: c.red, paper: c.paper };
        if (id === "tour") {
            this.drawModeMini(g, "columns", x, y, w, h, mc);
        } else if (id === "templates") {
            // a small stack of template cards, the front one with a preview
            for (const k of [2, 1]) {
                this.el("rect", {
                    x: x + k * 0.07 * w, y: y + (2 - k) * 0.07 * h, width: w * 0.84, height: h * 0.84, rx: 2,
                    fill: c.paper, stroke: c.grey, "stroke-width": 0.8
                }, g);
            }
            this.el("rect", {
                x, y: y + 0.16 * h, width: w * 0.84, height: h * 0.84, rx: 2,
                fill: c.paper, stroke: c.ink, "stroke-width": 0.9
            }, g);
            this.drawModeMini(g, "waterfall", x + 0.1 * w, y + 0.28 * h, w * 0.64, h * 0.62, mc);
        } else if (id === "demo") {
            const minis = ["bars", "line", "cards", "scatter"];
            minis.forEach((m, i) => {
                const cx = x + (i % 2) * 0.54 * w, cy = y + Math.floor(i / 2) * 0.54 * h;
                this.drawModeMini(g, m, cx, cy, w * 0.46, h * 0.40, mc);
            });
        } else {
            // field list: ✓ ✓ ○ with field bars
            for (let i = 0; i < 3; i++) {
                const ry = y + (0.12 + i * 0.32) * h;
                const on = i < 2;
                const cr = Math.max(2.5, Math.min(w, h) * 0.09);
                this.el("circle", {
                    cx: x + cr + 1, cy: ry + cr, r: cr,
                    fill: on ? c.teal : c.paper, stroke: on ? c.teal : c.grey, "stroke-width": 1
                }, g);
                this.el("rect", {
                    x: x + 2 * cr + 6, y: ry + cr * 0.4, width: w * (0.62 - i * 0.12), height: cr * 1.2,
                    rx: 1, fill: on ? c.ink : c.grey
                }, g);
            }
        }
    }

    /** caption of a mini preview: chart-mode name (without the bracket) or template code */
    private hubMiniCaption(key: string): string {
        const modes: Record<string, [string, string]> = {
            columns: ["Enum_Orientation_Columns", "Columns (Time)"], bars: ["Enum_Orientation_Bars", "Bars (Structure)"],
            line: ["Enum_Orientation_Line", "Line"], waterfall: ["Enum_Orientation_Waterfall", "Waterfall / Bridge"],
            intwaterfall: ["Enum_Orientation_IntWaterfall", "Integrated Bridge"],
            catbridge: ["Enum_Orientation_CatBridge", "Category Bridge"], table: ["Enum_Orientation_Table", "Table (IBCS)"],
            pnl: ["Enum_Orientation_Pnl", "P&L Statement"], cards: ["Enum_Orientation_Cards", "KPI Cards"],
            pareto: ["Enum_Orientation_Pareto", "Pareto"], dumbbell: ["Enum_Orientation_Dumbbell", "Dumbbell"],
            slope: ["Enum_Orientation_Slope", "Slope"], scatter: ["Enum_Orientation_Scatter", "Scatter / bubble"]
        };
        const m = modes[key];
        if (m) { return this.locStr(m[0], m[1]).split(/\s*[(（]/)[0].trim(); }
        const code = Object.keys(TEMPLATE_MINI).find(k => TEMPLATE_MINI[k] === key);
        return code ?? "";
    }

    /** the tour: one card per core capability — mini previews + 1–2 sentences */
    private hubTourCards(): { t: string; b: string; minis: string[]; action?: HubPage }[] {
        const L = (k: string, en: string) => this.locStr(k, en);
        return [
            { t: L("Tour_1_T", "13 chart modes · time series"), minis: ["columns", "line"],
                b: L("Tour_1_B", "Columns for months and quarters, line for long series (weeks, days) — AC solid, PY grey, PL outlined, FC hatched, as IBCS prescribes.") },
            { t: L("Tour_2_T", "13 chart modes · structure"), minis: ["bars", "table", "cards"],
                b: L("Tour_2_B", "Bars compare regions and products; the IBCS table adds hierarchy, Σ row and matrix columns; KPI cards show the status at a glance.") },
            { t: L("Tour_3_T", "13 chart modes · bridges & P&L"), minis: ["waterfall", "intwaterfall", "catbridge", "pnl"],
                b: L("Tour_3_B", "Waterfall for P&L rows, the integrated bridge PY → AC across the months, the category bridge per driver and the P&L statement with cascade columns.") },
            { t: L("Tour_4_T", "13 chart modes · analysis"), minis: ["pareto", "dumbbell", "slope", "scatter"],
                b: L("Tour_4_B", "Pareto (ABC with cumulative %), dumbbell and slope for before/after, scatter and bubble with quadrants for two KPIs.") },
            { t: L("Tour_5_T", "Variance panels"), minis: ["tour-variance"],
                b: L("Tour_5_B", "ΔPY or ΔPL as absolute bars and % pins right next to the chart — good teal, bad red, below the materiality threshold grey. Dual variance shows ΔPL and ΔPY at once.") },
            { t: L("Tour_6_T", "Small multiples"), minis: ["multiples"],
                b: L("Tour_6_B", "One tile per region or product, all on the same scale — with a Σ total tile, Top N + rest and a zoom (⤢) per tile.") },
            { t: L("Tour_7_T", "Comments"), minis: ["tour-comments"],
                b: L("Tour_7_B", "Numbered markers ①② at the data point and a footnote panel — from a text measure or typed right into the report (✎ comment mode).") },
            { t: L("Tour_8_T", "Dark mode & high contrast"), minis: ["tour-dark"],
                b: L("Tour_8_B", "Dark report themes are detected automatically; in high-contrast mode the status shows as a pattern (filled · hollow · dashed) instead of colour.") },
            { t: L("Tour_9_T", "Play & animation"), minis: ["tour-play"],
                b: L("Tour_9_B", "▶ builds bridges step by step; the scatter play mode runs through the periods like Hans Rosling's bubbles.") },
            { t: L("Tour_10_T", "YTD, materiality & exceptions"), minis: ["tour-ytd"],
                b: L("Tour_10_B", "YTD, QTD or R12 at the click of a chip, small variances greyed out, exception reporting folds the unremarkable rows into one.") },
            { t: L("Tour_11_T", "Templates & Smart-Start"), minis: ["stackcols", "catbridgecols", "bubble"], action: "templates",
                b: L("Tour_11_B", "Eleven IBCS templates set mode, comparison and panels in one click; Smart-Start suggests a better chart type from the bound fields.") }
        ];
    }

    private drawHubTour(width: number, height: number): void {
        const c = this.hubColors();
        const tf = this.landingTf();
        this.ensureDemoHatch(c);
        const cards = this.hubTourCards();
        const n = cards.length;
        const idx = ((this.hubTourIdx % n) + n) % n;
        this.hubTourIdx = idx;
        const card = cards[idx];
        const pad = 12;
        const fT = Math.round(14 * tf), fB = Math.round(11 * tf), fS = Math.round(9.5 * tf);
        const backW = this.drawHubBackChip(width, c);
        const hT = this.el("text", {
            x: pad, y: pad + fT, "font-size": fT, "font-weight": 700, fill: c.ink, "font-family": FONT
        }, this.svg);
        hT.textContent = this.truncate(this.locStr("Hub_Tour", "What can the visual do?"), width - 2 * pad - backW - 8, fT);
        const hS = this.el("text", {
            x: pad, y: pad + fT + 5 + fS, "font-size": fS, fill: c.subtle, "font-family": FONT
        }, this.svg);
        hS.textContent = this.truncate(this.locStr("Hub_TourSub", "Core capabilities with mini previews — ← → to browse, Esc to go back"),
            width - 2 * pad, fS);
        const top = pad + fT + 5 + fS + 10;
        const dotsH = Math.round(16 * tf);
        const bottom = height - 6 - dotsH;
        const ar = Math.round(12 * tf);
        const cx0 = pad + 2 * ar + 8, cx1 = width - pad - 2 * ar - 8;
        const cw = cx1 - cx0, ch = bottom - top;
        const go = (d: number, focus: string) => {
            this.hubTourIdx = (idx + d + n) % n;
            this.hubFocus = focus;
            this.hubRedraw();
        };
        // the card itself: focusable, ← → browse, Esc back
        const cg = this.el("g", {
            role: "group", tabindex: "0", "data-icd": "hub-tour-card", "data-idx": idx,
            "aria-roledescription": "slide"
        }, this.svg) as SVGGElement;
        cg.setAttribute("aria-label", `${idx + 1} / ${n} · ${card.t} — ${card.b}`);
        cg.style.outline = "none";
        cg.addEventListener("keydown", (e: KeyboardEvent) => {
            const k = e.key;
            if (k === "ArrowRight" || k === "ArrowLeft" || k === "Escape" || k === "Home" || k === "End") {
                e.preventDefault(); e.stopPropagation();
            }
            if (k === "ArrowRight") { go(1, "hub-tour-card"); }
            else if (k === "ArrowLeft") { go(-1, "hub-tour-card"); }
            else if (k === "Home") { go(-idx, "hub-tour-card"); }
            else if (k === "End") { go(n - 1 - idx, "hub-tour-card"); }
            else if (k === "Escape") { this.hubBack(); }
        });
        const fr = this.el("rect", {
            x: cx0, y: top, width: cw, height: ch, rx: 8, fill: c.tile, stroke: c.hc ? c.ink : c.edge, "stroke-width": 1
        }, cg);
        this.hubFrame(cg, fr, c);
        const wide = cw >= 460 && ch >= 120;
        const ip = 12;
        let px: number, py: number, pw: number, ph: number, tx: number, ty: number, tw: number;
        if (wide) {
            pw = Math.min((cw - 3 * ip) * 0.54, (ch - 2 * ip) * 2.1);
            ph = ch - 2 * ip;
            px = cx0 + ip; py = top + ip;
            tx = px + pw + 16; ty = top + ip; tw = cx0 + cw - ip - tx;
        } else {
            pw = cw - 2 * ip;
            ph = Math.max(40, (ch - 2 * ip) * 0.5);
            px = cx0 + ip; py = top + ip;
            tx = px; ty = py + ph + 8; tw = pw;
        }
        this.drawTourPreview(cg, card.minis, px, py, pw, ph, c, fS);
        // text block: title (≤ 2 lines) + body (as many lines as fit) + optional action
        const textBottom = top + ch - ip - (card.action ? Math.round(21 * tf) + 8 : 0);
        const lhT = Math.round(fT * 1.3), lhB = Math.round(fB * 1.45);
        const tLines = this.hubWrap(card.t, tw, fT, 2);
        let y = ty + fT;
        if (wide) {
            // vertically centered next to the preview
            const room = Math.floor((textBottom - ty - tLines.length * lhT - 6) / lhB);
            const bl = this.hubWrap(card.b, tw, fB, Math.max(0, room)).length;
            const blockH = tLines.length * lhT + 6 + bl * lhB + (card.action ? Math.round(21 * tf) + 8 : 0);
            y = top + Math.max(ip, (ch - blockH) / 2) + fT;
        }
        for (const l of tLines) {
            if (y > textBottom + 2) { break; }
            const e = this.el("text", { x: tx, y, "font-size": fT, "font-weight": 700, fill: c.ink, "font-family": FONT }, cg);
            e.textContent = l;
            y += lhT;
        }
        y += 6 - lhT + lhB;
        const room = Math.floor((textBottom - (y - lhB)) / lhB);
        for (const l of this.hubWrap(card.b, tw, fB, Math.max(0, room))) {
            const e = this.el("text", { x: tx, y, "font-size": fB, fill: c.soft, "font-family": FONT }, cg);
            e.textContent = l;
            y += lhB;
        }
        if (card.action) {
            const af = Math.round(10.5 * tf), abh = Math.round(21 * tf);
            const label = this.locStr("Hub_TourToTpl", "Open templates →");
            const aw = Math.ceil(this.textWidth(label, af)) + 22;
            const ay = Math.min(y - lhB + 10, top + ch - ip - abh);
            const act = card.action;
            const ab = this.hubBtn(this.svg, "hub-tour-action", label, () => this.hubGo(act));
            const afr = this.el("rect", {
                x: tx, y: ay, width: aw, height: abh, rx: 4, fill: c.teal, stroke: c.teal, "stroke-width": 1
            }, ab);
            this.hubFrame(ab, afr, { ...c, teal: c.ink });
            const at = this.el("text", {
                x: tx + aw / 2, y: ay + abh / 2 + af * 0.36, "text-anchor": "middle",
                "font-size": af, "font-weight": 600, fill: c.onAccent, "font-family": FONT
            }, ab);
            at.textContent = label;
        }
        // ‹ › at the sides
        const arrow = (ax: number, d: number, glyph: string, key: string) => {
            const target = cards[(idx + d + n) % n];
            const tip = `${d < 0 ? this.locStr("Hub_Prev", "Previous") : this.locStr("Hub_Next", "Next")}: ${target.t}`;
            const a = this.hubBtn(this.svg, key, tip, () => go(d, key));
            a.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                    e.preventDefault(); e.stopPropagation(); go(e.key === "ArrowRight" ? 1 : -1, key);
                }
            });
            const ci = this.el("circle", {
                cx: ax, cy: top + ch / 2, r: ar, fill: c.tile, stroke: c.hc ? c.ink : c.edge2, "stroke-width": 1
            }, a);
            this.hubFrame(a, ci, c);
            const t = this.el("text", {
                x: ax, y: top + ch / 2 + ar * 0.38, "text-anchor": "middle",
                "font-size": Math.round(ar * 1.1), "font-weight": 700, fill: c.ink, "font-family": FONT
            }, a);
            t.textContent = glyph;
        };
        arrow(pad + ar, -1, "‹", "hub-prev");
        arrow(width - pad - ar, 1, "›", "hub-next");
        // page dots + "n / N" (dots are mouse shortcuts; the keyboard uses ← →)
        const dr = Math.max(2.5, 3 * tf), dg = Math.round(11 * tf);
        const cnt = `${idx + 1} / ${n}`;
        const cntW = this.textWidth(cnt, fS) + 10;
        const dotsW = (n - 1) * dg;
        let dx = width / 2 - (dotsW + cntW) / 2;
        const dy = height - 6 - dotsH / 2;
        for (let i = 0; i < n; i++) {
            const on = i === idx;
            const d = this.el("circle", {
                cx: dx, cy: dy, r: dr, fill: on ? c.teal : c.paper,
                stroke: on ? c.teal : c.hc ? c.ink : c.grey, "stroke-width": 1, "data-dot": i
            }, this.svg);
            if (!on) {
                d.style.cursor = "pointer";
                const ti = this.el("title", {}, d);
                ti.textContent = cards[i].t;
                d.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); go(i - idx, "hub-tour-card"); });
            }
            dx += dg;
        }
        const ct = this.el("text", {
            x: dx - dg + 10, y: dy + fS * 0.36, "font-size": fS, fill: c.subtle, "font-family": FONT,
            "data-icd": "hub-tour-count"
        }, this.svg);
        ct.textContent = cnt;
    }

    /** 1–4 mini previews in framed cells with captions (gallery pipeline) */
    private drawTourPreview(g: SVGElement, minis: string[], x: number, y: number, w: number, h: number,
        c: HubColors, fCap: number): void {
        const mc = { ink: c.ink, grey: c.grey, teal: c.teal, red: c.red, paper: c.paper };
        const n = minis.length;
        if (n === 1) {
            this.el("rect", { x, y, width: w, height: h, rx: 5, fill: c.paper, stroke: c.hc ? c.ink : c.edge2, "stroke-width": 1 }, g);
            const ins = Math.min(w, h) * 0.12;
            this.drawModeMini(g, minis[0], x + ins, y + ins, w - 2 * ins, h - 2 * ins, mc);
            return;
        }
        // grid with the cell aspect closest to 1.5 : 1 (incl. caption)
        const capH = fCap + 6;
        let best = { cols: n, rows: 1, score: Infinity };
        for (let cols = n; cols >= 1; cols--) {
            const rows = Math.ceil(n / cols);
            const cwc = (w - (cols - 1) * 8) / cols, chc = (h - (rows - 1) * 8) / rows - capH;
            if (cwc < 30 || chc < 20) { continue; }
            const score = Math.abs(Math.log((cwc / chc) / 1.5));
            if (score < best.score) { best = { cols, rows, score }; }
        }
        const cols = best.cols, rows = best.rows;
        const cwc = (w - (cols - 1) * 8) / cols, chc = Math.max(16, (h - (rows - 1) * 8) / rows - capH);
        minis.forEach((m, i) => {
            const cx = x + (i % cols) * (cwc + 8), cy = y + Math.floor(i / cols) * (chc + capH + 8);
            this.el("rect", { x: cx, y: cy, width: cwc, height: chc, rx: 4, fill: c.paper, stroke: c.hc ? c.ink : c.edge2, "stroke-width": 1 }, g);
            const ins = Math.min(cwc, chc) * 0.14;
            this.drawModeMini(g, m, cx + ins, cy + ins, cwc - 2 * ins, chc - 2 * ins, mc);
            const cap = this.el("text", {
                x: cx + cwc / 2, y: cy + chc + fCap + 2, "text-anchor": "middle",
                "font-size": fCap, fill: c.subtle, "font-family": FONT
            }, g);
            cap.textContent = this.truncate(this.hubMiniCaption(m), cwc, fCap);
        });
    }

    /** template gallery: one tile per IBCS template (mini preview + label); a click
     *  stores it exactly like the pane dropdown — also for the active template */
    private drawHubTemplates(width: number, height: number): void {
        const c = this.hubColors();
        const tf = this.landingTf();
        this.ensureDemoHatch(c);
        const pad = 12, gap = 8;
        const fT = Math.round(14 * tf), fS = Math.round(10 * tf), fC = Math.round(10 * tf), fN = Math.round(9 * tf);
        const backW = this.drawHubBackChip(width, c);
        const hT = this.el("text", {
            x: pad, y: pad + fT, "font-size": fT, "font-weight": 700, fill: c.ink, "font-family": FONT
        }, this.svg);
        hT.textContent = this.truncate(this.locStr("Hub_TplTitle", "IBCS templates"), width - 2 * pad - backW - 8, fT);
        const hasData = this.lastRender != null;
        const saved = !hasData ? this.hubTplSaved : null;
        const items = this.formattingSettings.chartCard.template.items
            .filter(it => String(it.value) !== "off" && CHART_TEMPLATES[String(it.value)]);
        const cur = String(this.formattingSettings.chartCard.template.value.value);
        const subTxt = saved
            ? this.locStr("Hub_TplSaved", "✓ {0} saved — becomes active as soon as fields are bound").replace("{0}", saved)
            : hasData
                ? this.locStr("Hub_TplHintData", "One click applies the template — every setting stays freely changeable afterwards")
                : this.locStr("Hub_TplHintEmpty", "Preview with demo data — your pick is saved and becomes active as soon as fields are bound");
        const hS = this.el("text", {
            x: pad, y: pad + fT + 5 + fS, "font-size": fS, fill: saved ? c.teal : c.subtle,
            "font-family": FONT, "font-weight": saved ? 600 : 400, "data-icd": "hub-tpl-hint"
        }, this.svg);
        hS.textContent = this.truncate(subTxt, width - 2 * pad, fS);
        const roles = this.boundRoles();
        const top = pad + fT + 5 + fS + 10;
        const availW = width - 2 * pad;
        const minTW = Math.round(128 * Math.min(1.2, tf)), minTH = Math.round(54 + 2 * fC);
        const cols = Math.max(1, Math.min(6, Math.floor((availW + gap) / (minTW + gap))));
        const navH = Math.round(22 * tf) + 6;
        let availH = height - top - 6;
        let rowsFit = Math.max(1, Math.floor((availH + gap) / (minTH + gap)));
        let pages = Math.ceil(items.length / (cols * rowsFit));
        if (pages > 1) {
            availH -= navH;
            rowsFit = Math.max(1, Math.floor((availH + gap) / (minTH + gap)));
            pages = Math.ceil(items.length / (cols * rowsFit));
        }
        const per = cols * rowsFit;
        const page = Math.max(0, Math.min(pages - 1, this.hubTplPage));
        this.hubTplPage = page;
        const shown = items.slice(page * per, page * per + per);
        const rowsUsed = pages > 1 ? rowsFit : Math.ceil(shown.length / cols);
        const tw = Math.min(200, (availW - (cols - 1) * gap) / cols);
        const th = Math.min(150, (availH - (rowsUsed - 1) * gap) / rowsUsed);
        const blockW = cols * tw + (cols - 1) * gap, blockH = rowsUsed * th + (rowsUsed - 1) * gap;
        const x0 = pad + Math.max(0, (availW - blockW) / 2);
        const y0 = top + Math.max(0, (availH - blockH) / 2);
        shown.forEach((it, i) => {
            const code = String(it.value);
            const label = String(it.displayName);
            const on = code === cur;
            const need = TEMPLATE_NEEDS[code];
            const needTxt = need ? this.locStr("Hub_TplNeeds", "needs the field: {0}")
                .replace("{0}", this.locStr(need.key, need.en)) : "";
            const missing = need != null && !roles.has(need.role);
            const x = x0 + (i % cols) * (tw + gap), y = y0 + Math.floor(i / cols) * (th + gap);
            const tip = `${label}${needTxt ? ` — ${needTxt}` : ""}${on ? ` · ${this.locStr("Hub_TplActive", "active — click applies it again")}` : ""}`;
            const g = this.hubBtn(this.svg, `hub-tpl-${code}`, tip, () => this.hubPickTemplate(code));
            g.setAttribute("aria-pressed", String(on));
            const fr = this.el("rect", {
                x, y, width: tw, height: th, rx: 6, fill: on ? c.tileOn : c.tile,
                stroke: on ? c.teal : c.hc ? c.ink : c.edge, "stroke-width": on ? 1.6 : 1
            }, g);
            this.hubFrame(g, fr, c);
            const showNeed = missing && th >= 96;
            const capH = fC + 8 + (showNeed ? fN + 3 : 0);
            const pvX = x + 6, pvY = y + 6, pvW = tw - 12, pvH = th - 12 - capH;
            this.el("rect", {
                x: pvX, y: pvY, width: pvW, height: pvH, rx: 4, fill: c.paper,
                stroke: on ? c.teal : c.hc ? c.ink : c.edge2, "stroke-width": 1
            }, g);
            const ins = Math.max(4, Math.min(pvW, pvH) * 0.12);
            this.drawModeMini(g, TEMPLATE_MINI[code] ?? "columns", pvX + ins, pvY + ins, pvW - 2 * ins, pvH - 2 * ins,
                { ink: c.ink, grey: c.grey, teal: c.teal, red: c.red, paper: c.paper });
            const cap = this.el("text", {
                x: x + 8, y: pvY + pvH + 4 + fC, "font-size": fC, fill: c.ink, "font-family": FONT,
                "font-weight": on ? 700 : 400
            }, g);
            cap.textContent = this.truncate(`${on ? "✓ " : ""}${label}`, tw - 14, fC);
            if (showNeed) {
                const nt = this.el("text", {
                    x: x + 8, y: pvY + pvH + 4 + fC + 3 + fN, "font-size": fN, fill: c.subtle, "font-family": FONT
                }, g);
                nt.textContent = this.truncate(`+ ${needTxt}`, tw - 14, fN);
            }
        });
        if (pages > 1) {
            const ny = height - 6 - navH / 2;
            const lbl = `${page + 1} / ${pages}`;
            const lw = this.textWidth(lbl, fS) + 16;
            const nav = (cx: number, d: number, glyph: string, key: string) => {
                const r = Math.round(10 * tf);
                const tip = d < 0 ? this.locStr("Hub_Prev", "Previous") : this.locStr("Hub_Next", "Next");
                const a = this.hubBtn(this.svg, key, tip, () => {
                    this.hubTplPage = (page + d + pages) % pages;
                    this.hubFocus = key;
                    this.hubRedraw();
                });
                const ci = this.el("circle", { cx, cy: ny, r, fill: c.tile, stroke: c.hc ? c.ink : c.edge2, "stroke-width": 1 }, a);
                this.hubFrame(a, ci, c);
                const t = this.el("text", {
                    x: cx, y: ny + r * 0.4, "text-anchor": "middle", "font-size": Math.round(r * 1.2),
                    "font-weight": 700, fill: c.ink, "font-family": FONT
                }, a);
                t.textContent = glyph;
            };
            nav(width / 2 - lw / 2 - 14, -1, "‹", "hub-tpl-prev");
            nav(width / 2 + lw / 2 + 14, 1, "›", "hub-tpl-next");
            const pt = this.el("text", {
                x: width / 2, y: ny + fS * 0.36, "text-anchor": "middle", "font-size": fS, fill: c.subtle, "font-family": FONT
            }, this.svg);
            pt.textContent = lbl;
        }
    }

    /** gallery click: bound chart → apply + close (the result shows at once);
     *  empty state → saved, marked ✓, active as soon as fields are bound */
    private hubPickTemplate(tpl: string): void {
        this.pickTemplate(tpl);
        if (this.hubOpen && this.lastRender) {
            this.hubDirty = true;
            this.closeHub();
            return;
        }
        this.hubTplSaved = tpl;
        this.hubFocus = `hub-tpl-${tpl}`;
        this.hubRedraw();
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
                    // square pin-head — matches the table mode's real default (pinHead "square")
                    this.el("rect", {
                        x: x + (pinX + (d >= 0 ? 0.06 : -0.05)) * w - 1.8,
                        y: y + (ry + 0.045) * h - 1.8,
                        width: 3.6, height: 3.6, fill: c.ink
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
            case "scatter": {
                // point cloud over thin L-axes, dashed quadrant split, ONE emphasized point
                const u = Math.max(0.6, Math.min(w, h) / 60);
                for (const [x1, y1, x2, y2] of [[0.52, 0, 0.52, 1], [0, 0.48, 1, 0.48]]) {
                    this.el("line", {
                        x1: x + x1 * w, y1: y + y1 * h, x2: x + x2 * w, y2: y + y2 * h,
                        stroke: c.grey, "stroke-width": 1, "stroke-dasharray": "3,2"
                    }, g);
                }
                line(0, 0, 0, 1, c.ink, 1.2); line(0, 1, 1, 1, c.ink, 1.2);
                const dots: [number, number, number][] = [[0.12, 0.82, 2.6], [0.22, 0.64, 4], [0.30, 0.76, 2.4],
                    [0.40, 0.58, 3.2], [0.48, 0.70, 2.2], [0.60, 0.40, 5], [0.70, 0.52, 2.8], [0.88, 0.20, 3.6]];
                for (const [dx, dy, dr] of dots) {
                    this.el("circle", {
                        cx: x + dx * w, cy: y + dy * h, r: dr * u,
                        fill: c.ink, "fill-opacity": 0.55, stroke: c.ink, "stroke-width": 0.8
                    }, g);
                }
                this.el("circle", { cx: x + 0.78 * w, cy: y + 0.28 * h, r: 4.2 * u, fill: c.teal }, g);
                this.el("circle", {
                    cx: x + 0.78 * w, cy: y + 0.28 * h, r: 6.4 * u,
                    fill: "none", stroke: c.teal, "stroke-width": 1.2
                }, g);
                break;
            }
            // ---- 1.50 hub previews (template gallery + feature tour) ----
            case "stackcols": {
                // C01: stacked columns — dark base, half tone, outlined top segment
                const segs = [[0.30, 0.18, 0.12], [0.34, 0.20, 0.14], [0.38, 0.18, 0.18], [0.42, 0.24, 0.18], [0.46, 0.22, 0.22]];
                segs.forEach((seg, i) => {
                    let base = 1;
                    seg.forEach((sh, j) => {
                        base -= sh;
                        r(0.04 + i * 0.195, base, 0.14, sh, j === 2 ? c.paper : c.ink,
                            j === 1 ? { "fill-opacity": 0.45 } : j === 2 ? { stroke: c.ink, "stroke-width": 1 } : {});
                    });
                });
                line(0, 1, 1, 1, c.ink, 1.6);
                break;
            }
            case "stackbars": {
                // C02: stacked bars, longest on top
                const segs = [[0.36, 0.24, 0.18], [0.30, 0.20, 0.14], [0.24, 0.16, 0.12], [0.18, 0.12, 0.08]];
                segs.forEach((seg, i) => {
                    let x0 = 0;
                    seg.forEach((sw2, j) => {
                        r(x0, 0.05 + i * 0.245, sw2, 0.17, j === 2 ? c.paper : c.ink,
                            j === 1 ? { "fill-opacity": 0.45 } : j === 2 ? { stroke: c.ink, "stroke-width": 1 } : {});
                        x0 += sw2;
                    });
                });
                line(0, 0, 0, 1, c.ink, 1.6);
                break;
            }
            case "catbridgecols": {
                // C06: category bridge as vertical cascade — PY total, drivers, AC total
                r(0.00, 0.34, 0.13, 0.66, c.grey);
                r(0.18, 0.20, 0.12, 0.14, c.teal); r(0.34, 0.10, 0.12, 0.10, c.teal);
                r(0.50, 0.10, 0.12, 0.18, c.red); r(0.66, 0.16, 0.12, 0.12, c.teal);
                r(0.84, 0.16, 0.14, 0.84, c.ink);
                line(0.13, 0.34, 0.18, 0.34, c.grey, 0.8); line(0.30, 0.20, 0.34, 0.20, c.grey, 0.8);
                line(0.46, 0.10, 0.50, 0.10, c.grey, 0.8); line(0.62, 0.28, 0.66, 0.28, c.grey, 0.8);
                line(0.78, 0.16, 0.84, 0.16, c.grey, 0.8);
                line(0, 1, 1, 1, c.ink, 1.6);
                break;
            }
            case "bubble": {
                // C10: scatter whose point AREA carries a third measure + size legend
                const u = Math.max(0.6, Math.min(w, h) / 60);
                for (const [x1, y1, x2, y2] of [[0.52, 0, 0.52, 1], [0, 0.48, 1, 0.48]]) {
                    this.el("line", {
                        x1: x + x1 * w, y1: y + y1 * h, x2: x + x2 * w, y2: y + y2 * h,
                        stroke: c.grey, "stroke-width": 1, "stroke-dasharray": "3,2"
                    }, g);
                }
                line(0, 0, 0, 1, c.ink, 1.2); line(0, 1, 1, 1, c.ink, 1.2);
                const dots: [number, number, number][] = [[0.14, 0.76, 3], [0.27, 0.58, 6.5], [0.40, 0.72, 4],
                    [0.56, 0.36, 8.5], [0.68, 0.60, 5], [0.84, 0.20, 6]];
                for (const [dx, dy, dr] of dots) {
                    this.el("circle", {
                        cx: x + dx * w, cy: y + dy * h, r: dr * u,
                        fill: c.ink, "fill-opacity": 0.35, stroke: c.ink, "stroke-width": 0.8
                    }, g);
                }
                for (const rr of [5, 3.2, 1.8]) {
                    this.el("circle", {
                        cx: x + 0.88 * w, cy: y + 0.95 * h - rr * u, r: rr * u,
                        fill: "none", stroke: c.grey, "stroke-width": 0.8
                    }, g);
                }
                break;
            }
            case "multiples": {
                // C13: 2 × 2 tiles on ONE scale — equal heights mean equal values
                const tiles = [[0.90, 0.80, 1.00, 0.86], [0.60, 0.55, 0.70, 0.62], [0.40, 0.46, 0.36, 0.50], [0.24, 0.20, 0.30, 0.22]];
                tiles.forEach((hs, ti) => {
                    const tx = (ti % 2) * 0.52, ty = Math.floor(ti / 2) * 0.52;
                    this.el("rect", {
                        x: x + tx * w, y: y + ty * h, width: 0.48 * w, height: 0.48 * h, rx: 2,
                        fill: c.paper, stroke: c.grey, "stroke-width": 0.8
                    }, g);
                    hs.forEach((hh, i) => r(tx + 0.05 + i * 0.105, ty + 0.44 - 0.36 * hh, 0.07, 0.36 * hh, c.ink));
                    line(tx + 0.03, ty + 0.44, tx + 0.45, ty + 0.44, c.ink, 1);
                });
                break;
            }
            case "tour-variance": {
                // Δ% pins on top, absolute Δ bars in the middle, PY/AC columns at the base
                const d = [0.6, -0.4, 0.8, 0.3, -0.7];
                const acH = [0.30, 0.26, 0.34, 0.30, 0.24];
                d.forEach((v, i) => {
                    const cx = 0.10 + i * 0.19;
                    const col = v >= 0 ? c.teal : c.red;
                    line(cx, 0.17, cx, 0.17 - v * 0.14, col, 1.4);
                    this.el("rect", {
                        x: x + cx * w - 1.8, y: y + (0.17 - v * 0.14) * h - 1.8, width: 3.6, height: 3.6, fill: c.ink
                    }, g);
                    r(cx - 0.05, v >= 0 ? 0.46 - v * 0.14 : 0.46, 0.10, Math.abs(v) * 0.14, col);
                    const pyH = acH[i] - v * 0.05;
                    r(cx - 0.075, 1 - pyH, 0.06, pyH, c.grey);
                    r(cx - 0.01, 1 - acH[i], 0.08, acH[i], c.ink);
                });
                line(0, 0.17, 1, 0.17, c.grey, 0.8); line(0, 0.46, 1, 0.46, c.grey, 0.8);
                line(0, 1, 1, 1, c.ink, 1.6);
                break;
            }
            case "tour-comments": {
                // columns with numbered markers ①② and the footnote panel on the right
                const hs = [0.42, 0.60, 0.36, 0.66, 0.50];
                hs.forEach((hh, i) => r(0.02 + i * 0.13, 1 - hh, 0.09, hh, c.ink));
                line(0, 1, 0.66, 1, c.ink, 1.6);
                const u = Math.max(0.6, Math.min(w, h) / 60);
                const fz = Math.max(5, 6.5 * u);
                const mark = (mx: number, my: number, no: string) => {
                    this.el("circle", { cx: x + mx * w, cy: y + my * h, r: 5.2 * u, fill: c.paper, stroke: c.ink, "stroke-width": 0.9 }, g);
                    const t = this.el("text", {
                        x: x + mx * w, y: y + my * h + fz * 0.36, "text-anchor": "middle",
                        "font-size": fz, "font-weight": 700, fill: c.ink, "font-family": FONT
                    }, g);
                    t.textContent = no;
                };
                mark(0.195, 0.40 - 0.08, "1");
                mark(0.455, 0.34 - 0.08, "2");
                line(0.72, 0.04, 0.72, 1, c.grey, 0.8);
                mark(0.79, 0.14, "1");
                r(0.85, 0.11, 0.14, 0.06, c.grey); r(0.85, 0.20, 0.10, 0.05, c.grey);
                mark(0.79, 0.46, "2");
                r(0.85, 0.43, 0.13, 0.06, c.grey); r(0.85, 0.52, 0.08, 0.05, c.grey);
                break;
            }
            case "tour-dark": {
                // the same chart on a light and on a dark theme ground
                this.drawModeMini(g, "bars", x + 0.02 * w, y + 0.08 * h, w * 0.42, h * 0.84, c);
                this.el("rect", {
                    x: x + 0.52 * w, y, width: 0.48 * w, height: h, rx: 3, fill: DARK_PAPER
                }, g);
                this.drawModeMini(g, "bars", x + 0.56 * w, y + 0.08 * h, w * 0.40, h * 0.84,
                    { ink: DARK_INK, grey: "#8A8A8A", teal: "#3FB3C2", red: "#E4635F", paper: DARK_PAPER });
                break;
            }
            case "tour-play": {
                // a bubble moving through the periods (trail) + the ▶ play button
                const u = Math.max(0.6, Math.min(w, h) / 60);
                line(0, 0, 0, 1, c.ink, 1.2); line(0, 1, 1, 1, c.ink, 1.2);
                const trail: [number, number][] = [[0.14, 0.80], [0.28, 0.66], [0.42, 0.56], [0.56, 0.40], [0.68, 0.26]];
                trail.forEach(([tx, ty], i) => {
                    const last = i === trail.length - 1;
                    this.el("circle", {
                        cx: x + tx * w, cy: y + ty * h, r: (last ? 5 : 3) * u,
                        fill: last ? c.teal : c.grey, "fill-opacity": last ? 1 : 0.25 + i * 0.15
                    }, g);
                });
                const trail2: [number, number][] = [[0.20, 0.50], [0.30, 0.56], [0.40, 0.64]];
                trail2.forEach(([tx, ty], i) => {
                    this.el("circle", {
                        cx: x + tx * w, cy: y + ty * h, r: (i === 2 ? 4 : 2.6) * u,
                        fill: c.ink, "fill-opacity": i === 2 ? 0.8 : 0.2 + i * 0.2
                    }, g);
                });
                const pr = Math.min(w, h) * 0.13;
                const pcx = x + 0.86 * w, pcy = y + 0.78 * h;
                this.el("circle", { cx: pcx, cy: pcy, r: pr, fill: c.ink }, g);
                this.el("path", {
                    d: `M${pcx - pr * 0.32},${pcy - pr * 0.45} L${pcx + pr * 0.5},${pcy} L${pcx - pr * 0.32},${pcy + pr * 0.45} Z`,
                    fill: c.paper
                }, g);
                break;
            }
            case "tour-ytd": {
                // cumulative columns climbing + the YTD chip; one immaterial variance grey
                const hs = [0.16, 0.30, 0.44, 0.58, 0.74];
                hs.forEach((hh, i) => r(0.03 + i * 0.13, 1 - hh, 0.09, hh, c.ink));
                line(0, 1, 0.68, 1, c.ink, 1.6);
                const u = Math.max(0.6, Math.min(w, h) / 60);
                const fz = Math.max(5, 7 * u);
                this.el("rect", {
                    x: x + 0.74 * w, y: y + 0.02 * h, width: 0.26 * w, height: Math.max(8, fz * 1.7),
                    rx: Math.max(4, fz * 0.85), fill: c.ink
                }, g);
                const t = this.el("text", {
                    x: x + 0.87 * w, y: y + 0.02 * h + Math.max(8, fz * 1.7) / 2 + fz * 0.36, "text-anchor": "middle",
                    "font-size": fz, "font-weight": 700, fill: c.paper, "font-family": FONT
                }, g);
                t.textContent = "YTD";
                line(0.76, 0.62, 1, 0.62, c.grey, 0.8);
                r(0.78, 0.44, 0.05, 0.18, c.teal);
                r(0.86, 0.58, 0.05, 0.04, c.grey);
                r(0.94, 0.62, 0.05, 0.16, c.red);
                break;
            }
        }
    }

    // ---------------------------------------------------------------- render

    private render(points: DataPoint[], width: number, height: number): void {
        while (this.svg.firstChild) { this.svg.removeChild(this.svg.firstChild); }
        this.catGroups = [];
        this.bridgeChips = [];
        this.sortNoop = false;
        this.exceptionNoop = false;
        // scatter v3: a running play animation or drag-select must not outlive the
        // DOM it manipulates (the svg was just cleared above)
        if (this.scatterAnim?.raf != null) { cancelAnimationFrame(this.scatterAnim.raf); }
        this.scatterAnim = null;
        if (this.scatterDragCleanup) { this.scatterDragCleanup(); }

        const s = this.formattingSettings;
        // finance number convention — read BEFORE any formatter is created
        this.financeFmt = s.labelsCard.financeFormat.value === true;
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
        // Scatter / Bubble: AC (Y) over the xValue measure (X), optional bubble size
        const isScatter = orientationRaw === "scatter";
        // v3 play: the shown period is transient session state — it resets as soon as
        // the mode or the play toggle changes (never persisted)
        if (!isScatter || s.chartCard.scatterPlay.value !== true) { this.scatterFrame = null; }
        // KPI cards: one tile per category — the KPI-card visual folded into the deck
        const isCards = orientationRaw === "cards";
        // GuV-Statement: row-based P&L with PY + scenario waterfall columns
        const isPnl = orientationRaw === "pnl";
        const orientation: Orientation =
            orientationRaw === "bars" || isCatBridge || isTable || isDumbbell || isCards || isPnl
                || isScatter
                ? "bars" : "columns";
        // matrix column groups only pivot in table mode — everywhere else the same
        // category repeats once per column value; merge back to one point per category.
        // The Trend role works the same way outside the KPI cards: the period split is
        // summed back, so every other mode renders as if the field were not bound
        // (cards keep the periods apart until aggregateTrendCards folds them per card)
        const hasTrend = points.some(p => p.trend != null);
        const trendCards = isCards && hasTrend;
        if ((!isTable && points.some(p => p.colLevels && p.colLevels.length > 0))
            || (hasTrend && !isCards)) {
            points = this.mergeColPoints(points, isTable, trendCards);
        }
        const trendSum = String(s.chartCard.cardTrendValue.value.value) === "sum";
        let trendLabels: string[] = [];
        if (trendCards) {
            const tr = this.aggregateTrendCards(points, trendSum);
            points = tr.points;
            trendLabels = tr.labels;
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
            && !points.some(p => p.rowType != null) && !listPnl
            // matrix tables keep one point per category × column group — cumulating
            // across that flat list would chain unrelated columns into one running sum
            && !(isTable && points.some(p => p.colLevels && p.colLevels.length > 0));

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

        // scatter (1.48): real small multiples — one point cloud per group, all tiles on
        // the SAME X/Y scale (prepareScatterDeck). Deliberately WITHOUT the Σ total and
        // Top-N "Rest" tiles: both would aggregate the points, and summing X/Y over
        // groups is wrong for ratio measures (margin %, rotation days) — a "Σ" point
        // with a 47 % margin made of four 12 % margins. (1.47 flattened the groups into
        // one cloud of "Kategorie · Gruppe" points for the same reason.)
        // multiples options: Top-N tiles (remainder merged into one "Rest" tile) and a
        // leading "Σ Gesamt" tile — applied before the per-group transforms and domain
        // computation so all tiles, including the larger total, share one IBCS scale
        if (groups.length > 1 && groups[0].name != null && !isScatter) {
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

        // exception reporting: only categories above the materiality threshold stay
        // as own rows, everything else is folded into ONE collector row. Limited to
        // structure comparisons without a fixed axis order — time axes (columns/line,
        // YTD) and cascades (waterfall style, bridges, P&L rows) would get gaps, and
        // matrix/hierarchy tables carry their own tree aggregation
        const matSet = (s.chartCard.materialityAbs.value ?? 0) > 0
            || (s.chartCard.materialityPct.value ?? 0) > 0;
        this.exceptionCapable = matSet && !isStacked && !wfStyleGlobal && !cumulativeOn
            && (orientationRaw === "bars" || isCards
                || (isTable && !listPnl
                    && !points.some(p => p.colLevels && p.colLevels.length > 0)
                    && !points.some(p => (p.catLevels?.length ?? 0) >= 2)
                    && !points.some(p => p.rowType != null)));
        this.exceptionOn = this.exceptionCapable && s.chartCard.exceptionOnly.value === true;
        this.exceptionHidden = 0;
        // 1.49: the ⚠ chip is locked when the filter would fold nothing at all
        if (this.exceptionCapable) {
            const material = this.materialityFn();
            this.exceptionNoop = groups.every(g => g.pts.every(p => material(p)));
        }
        // order with topN: exception filter FIRST, then topN ranks the remaining
        // conspicuous rows. The other way round the "Rest (n)" row of topN would
        // itself be swallowed by the collector row and lose its label
        if (this.exceptionOn) {
            for (const g of groups) { g.pts = this.applyExceptionFilter(g.pts); }
        }

        // top N + rest aggregation (structure comparisons only), per group —
        // never combined with cumulation: topN re-sorts by value, cumulate needs
        // the chronological order, the combination would sum a scrambled sequence
        const topN = Math.round(s.chartCard.topN.value ?? 0);
        // matrix tables keep one point per category × column group — topN would rank
        // and prune single cells, scramble the column order and leave a nameless
        // rest block; the row-oriented ranking only makes sense without column groups
        const topNBlocked = isTable && points.some(p => p.colLevels && p.colLevels.length > 0);
        // scatter: no "Rest" point — it would sum X across the tail (pane slice hidden)
        if (orientation === "bars" && topN > 0 && !cumulativeOn && !topNBlocked && !isScatter) {
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
        // 1.49: the ⇅ chip is locked when impact order and data order coincide in
        // every tile — the click would change nothing either way
        if (wfStyleGlobal || isCatBridge) {
            this.sortNoop = groups.every(g => {
                const sorted = this.sortByImpact(g.pts);
                return sorted.every((p, i) => p === g.pts[i]);
            });
        }
        // waterfall-bridge: order categories by impact, largest driver first (Rest row stays last)
        if (sortByImpactOn) {
            for (const g of groups) { g.pts = this.sortByImpact(g.pts); }
        }
        points = groups.reduce<DataPoint[]>((acc, g) => acc.concat(g.pts), []);

        // rows with their own rowFormat (other unit/magnitude, e.g. Stück) render via
        // their own formatter — keep them out of the shared formatter's domain, or a
        // large piece-count row flips the € columns to K€ while Δ stays at T€
        const rowFmtCats = new Set(String(s.chartCard.rowFormats.value || "")
            .split(/[;\n]/)
            .filter(e => e.indexOf("=") > 0)
            .map(e => e.slice(0, e.indexOf("=")).trim().toLowerCase())
            .filter(x => x));
        const fmtPtsAll = isTable && rowFmtCats.size > 0
            ? points.filter(p => !rowFmtCats.has(p.cat.trim().toLowerCase()))
            : points;
        const fmtPts = fmtPtsAll.length > 0 ? fmtPtsAll : points;
        const maxAbs = Math.max(...fmtPts.map(p =>
            Math.max(Math.abs(p.value ?? 0), Math.abs(p.py ?? 0), Math.abs(p.pl ?? 0))), 0);
        // Δ2 (dual variance) is labelled with the same fmtVar — it bounds the unit too
        const maxVarAbs = Math.max(...fmtPts.map(p =>
            Math.max(Math.abs(p.varAbs ?? 0), Math.abs(p.var2Abs ?? 0))), 0);
        const allInt = fmtPts.every(p =>
            [p.value, p.py, p.pl, p.fc].every(v => v == null || Number.isInteger(v)));
        const allVarInt = fmtPts.every(p => (p.varAbs == null || Number.isInteger(p.varAbs))
            && (p.var2Abs == null || Number.isInteger(p.var2Abs)));

        const basisMode: Basis = this.resolveBasisLabel();
        const hasVar = points.some(p => p.varAbs != null);

        const palette = this.host.colorPalette as powerbi.extensibility.ISandboxExtendedColorPalette;
        const hc: boolean = !!(palette && palette.isHighContrast);
        const dark: boolean = this.uiDark;
        // 1.49: the host palette may omit single slots — fall back instead of throwing
        const fg: string = hc ? (palette.foreground?.value || "#FFFFFF") : dark ? DARK_INK : INK;
        const bgc: string = hc ? (palette.background?.value || "#000000") : dark ? this.darkPaper() : "#FFFFFF";
        const hcSel: string = hc ? (palette.foregroundSelected?.value || fg) : fg;

        // report theme colors: sentiment + neutral tones from the palette,
        // falling back to the color pickers when the theme doesn't define them
        const useTheme = s.colorsCard.useTheme.value && !hc && !!palette;
        const themed = (info: { value: string } | undefined, fallback: string) =>
            useTheme && info && info.value ? info.value : fallback;
        // dark mode: pickers still on their light defaults flip to the dark
        // stand-ins; any user-chosen color passes through untouched
        const darkable = (v: string): string =>
            dark ? (DARK_COLOR_SWAP[(v || "").toUpperCase()] ?? v) : v;

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
            colors: hc ? { ac: fg, py: fg, pl: fg, good: fg, bad: fg } : (() => {
                // Blau/Orange-Preset (ColorBrewer #2C7BB6/#E66101): übersteuert die
                // Good/Bad-Picker — Achromatopsie- und S/W-Druck-tauglich über die
                // Helligkeitsdifferenz; Theme-Farben behalten Vorrang
                const bo = String(s.colorsCard.variancePreset.value.value) === "blueOrange";
                return {
                    ac: themed(palette?.foregroundNeutralDark, darkable(s.colorsCard.actualColor.value.value)),
                    py: themed(palette?.foregroundNeutralTertiary, darkable(s.colorsCard.previousYearColor.value.value)),
                    pl: themed(palette?.foregroundNeutralDark, darkable(s.colorsCard.planColor.value.value)),
                    good: themed(palette?.positive, bo ? (dark ? "#5BA3DC" : "#2C7BB6")
                        : darkable(s.colorsCard.goodColor.value.value)),
                    bad: themed(palette?.negative, bo ? (dark ? "#F0821E" : "#E66101")
                        : darkable(s.colorsCard.badColor.value.value))
                };
            })(),
            hc,
            hcSel,
            dark,
            ink: fg,
            paper: bgc,
            // #6E6E6E statt #8A8A8A: hebt Sekundärtexte auf WCAG-AA-Kontrast (≥4,5:1)
            subtle: hc ? fg : dark ? DARK_SUBTLE : "#6E6E6E",
            faint: hc ? fg : dark ? DARK_FAINT : FAINT,
            wash: hc ? bgc : dark ? DARK_WASH : WASH,
            band: hc ? bgc : dark ? DARK_BAND : BAND,
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
            wfBreak: null,
            basisMode,
            // Hausbegriffe: die Umbenennungs-Felder der Labels-Karte speisen alle
            // Titel/Spaltenköpfe; leer = IBCS-Standardkürzel
            scenL: (() => {
                const lbl = (raw: string, dflt: string) => {
                    const t = (raw || "").trim();
                    return t !== "" ? t : dflt;
                };
                return {
                    ac: lbl(s.labelsCard.labelAc.value, "AC"),
                    py: lbl(s.labelsCard.labelPy.value, "PY"),
                    pl: lbl(s.labelsCard.labelPl.value, "PL"),
                    fc: lbl(s.labelsCard.labelFc.value, "FC")
                };
            })(),
            basisLabel: basisMode === "plan"
                ? (s.labelsCard.labelPl.value || "").trim() || "PL"
                : basisMode === "fcrev"
                    ? ((s.labelsCard.labelFc.value || "").trim() || "FC") + " Vm"
                    : (s.labelsCard.labelPy.value || "").trim() || "PY",
            showAbs: s.chartCard.showAbsoluteVariance.value && hasVar,
            showRel: s.chartCard.showRelativeVariance.value && points.some(p => p.varRel != null),
            showDual: s.chartCard.dualVariance.value && points.some(p => p.var2Abs != null),
            basis2Label: this.basis2Mode === "plan"
                ? (s.labelsCard.labelPl.value || "").trim() || "PL"
                : (s.labelsCard.labelPy.value || "").trim() || "PY",
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
            totalPos: String(s.chartCard.totalRowPosition.value.value),
            zebra: s.chartCard.zebraStripes.value === true,
            rowDensity: ({ compact: 1.6, normal: 2.4, airy: 3.2 } as Record<string, number>)[
                String(s.chartCard.rowDensity.value.value)] ?? 2.4,
            gridLines: String(s.chartCard.gridLines.value.value),
            cellLayout: String(s.chartCard.cellLayout.value.value),
            formulaRows: String(s.chartCard.formulaRows.value || ""),
            cardBasis: String(s.chartCard.cardStatusBasis.value.value),
            cardTint: s.chartCard.cardTint.value,
            cardTintPct: Math.max(4, Math.min(40, Number(s.chartCard.cardTintStrength.value ?? 12))),
            cardBullet: s.chartCard.cardBullet.value,
            cardBulletZoom: s.chartCard.cardBulletZoom.value,
            cardHl: String(s.chartCard.cardHighlight.value.value),
            cardRefVals: String(s.chartCard.cardRefValues.value.value),
            cardTrend: trendCards ? String(s.chartCard.cardTrendChart.value.value) : "off",
            cardTrendSum: trendSum,
            trendLabels,
            trendName: this.trendName ?? "Trend",
            catBridgeVertical: isCatBridge
                && String(s.chartCard.bridgeOrientation.value.value) === "columns",
            cardBars: s.chartCard.cardBars.value,
            // the in-chart chip override wins over the pane dropdown when set
            cardSort: this.cardSortSel !== "" ? this.cardSortSel
                : String(s.chartCard.cardSort.value.value),
            sumSafe: s.labelsCard.sumSafeRounding.value,
            // ONE display unit for values and variances (S13): both derive it from the
            // larger magnitude — Δ can only outgrow the values across a sign change
            ...(() => { const fp = this.formatterParams(Math.max(maxAbs, maxVarAbs), allInt); return { fmtUnit: fp.unit, fmtPrec: fp.prec }; })(),
            fmt: this.makeFormatter(Math.max(maxAbs, maxVarAbs), allInt),
            fmtVar: this.makeVarFormatter(maxAbs, maxVarAbs, allVarInt),
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
            pinStyle: String(s.chartCard.pinStyle.value.value),
            deltaIcons: s.chartCard.deltaIcons.value === true,
            sharedIntWf: null,
            sharedCatBridge: null,
            stackDomain: null,
            isMaterial: this.materialityFn(),
            scatter: isScatter ? this.scatterConfig(points) : null
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

        // dual variance: ΔPY and ΔPL are the same unit (€ resp. %) in one visual —
        // IBCS CH 4.1 demands one scale, or +2 next to +20 draws equally tall (S1).
        // Only when the second panels are actually shown: the single-variance
        // chart must keep its own (unchanged) Δ scale.
        if (cfg.showDual) {
            const union = (a: [number, number], b: [number, number]): [number, number] =>
                [Math.min(a[0], b[0]), Math.max(a[1], b[1])];
            domains.abs = domains.abs2 = union(domains.abs, domains.abs2);
            domains.rel = domains.rel2 = union(domains.rel, domains.rel2);
        }

        // waterfall: precompute segments per group, shared domain over all cells
        const wfByGroup = new Map<string | null, WfSeg[]>();
        this.sharedWfDomain = null;
        if (isWaterfall) {
            for (const g of groups) { wfByGroup.set(g.name, this.buildWaterfall(g.pts, cfg)); }
            const allSegs: WfSeg[] = [];
            wfByGroup.forEach(segs => allSegs.push(...segs));
            domains.main = extent(allSegs.flatMap(sg => [sg.from, sg.to]));
        }

        // scale sync: stretch domains at least to the configured maxima;
        // with capping enabled the maximum is hard instead. Applied AFTER the
        // waterfall override — otherwise two waterfalls on a page could never be
        // synced and a persisted cap would silently do nothing there (S7)
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
            // the dual Δ2 panel shares the synced scale as well (S1)
            if (cfg.showDual) { domains.abs2 = domains.abs; }
        }
        if (isWaterfall) { this.sharedWfDomain = domains.main; }

        // waterfall-bridge (columns/bars add-on): running cascade per group, own shared
        // domain — a separate "bridge" panel alongside the normal AC/PY/PL comparison bars.
        // Zero-based (extent) since the basis/AC anchor BARS start at 0: a floating
        // extentTight domain cut the axis unmarked and shrank the AC anchor to
        // length 0 (S2). A marked axis break is a separate, opt-in feature.
        const cascadeByGroup = new Map<string | null, Cascade>();
        if (wfStyleGlobal) {
            for (const g of groups) { cascadeByGroup.set(g.name, this.buildCascade(g.pts)); }
            const allVals: (number | null)[] = [];
            cascadeByGroup.forEach(c => {
                allVals.push(...c.from, ...c.to, c.basisSum, c.valueSum);
            });
            domains.bridge = extent(allVals);
        }
        if (cfg.refLine != null) {
            // with a hard cap the scale ends AT the cap — a ref line beyond it must
            // not push the maximum out again, or the break marker would sit in the
            // middle of the axis instead of at its end (S8)
            const refHi = cfg.capMax != null ? Math.min(cfg.refLine, cfg.capMax) : cfg.refLine;
            domains.main = [Math.min(domains.main[0], cfg.refLine), Math.max(domains.main[1], refHi)];
            if (this.sharedWfDomain) { this.sharedWfDomain = domains.main; }
        }

        // waterfall axis break (IBCS UN 5.3): cut value, admissibility and suggestion
        // over ALL drawn tiles — one shared cut or none at all (same-scale rule, the
        // zoom view keeps it). The default stays zero-based: "auto" only highlights
        // the ⫽ chip, the axis is cut after the click ("on")
        let wfBreakTile: string | null = null;
        const wfBreakMode = isWaterfall ? String(s.scaleCard.wfAxisBreak.value.value) : "off";
        if (wfBreakMode !== "off") {
            let minLevel = Infinity, maxLevel = -Infinity, maxAnchor = 0;
            const tileMin: { name: string | null; min: number }[] = [];
            for (const g of groups.slice(0, MULT_MAX_CELLS)) {
                const segs = wfByGroup.get(g.name) ?? [];
                if (segs.length === 0) { continue; }
                let gMin = Infinity;
                for (const sg of segs) {
                    // anchors start at 0 by design — only their top must clear the cut
                    // (the stub shows the rest); a delta must lie above it in full
                    gMin = Math.min(gMin, sg.kind === "anchor" ? sg.to : Math.min(sg.from, sg.to));
                    maxLevel = Math.max(maxLevel, sg.from, sg.to);
                    if (sg.kind === "anchor") { maxAnchor = Math.max(maxAnchor, sg.to); }
                }
                tileMin.push({ name: g.name, min: gMin });
                minLevel = Math.min(minLevel, gMin);
            }
            if (tileMin.length > 0) {
                const manualAt = s.scaleCard.wfBreakAt.value ?? 0;
                const at = manualAt > 0 ? manualAt : this.wfAutoCut(minLevel, maxLevel);
                // positive cascades only (variant 1); a hard cap must stay above the cut
                const possible = at > 0 && minLevel > at
                    && (cfg.capMax == null || cfg.capMax > at);
                if (!possible && groups.length > 1) {
                    // name the tile that dips below the shared cut (chip tooltip); when the
                    // auto cut itself collapses to ≤ 0, it is the lowest tile dragging it down
                    const blocker = tileMin.find(tm => tm.min <= at)
                        ?? tileMin.reduce((a, b) => (b.min < a.min ? b : a));
                    wfBreakTile = blocker.name ?? "";
                }
                cfg.wfBreak = {
                    at,
                    possible,
                    // deltas squeezed onto a big base: their whole span is under 25 %
                    // of the largest anchor → the chip suggests the cut
                    suggested: possible && maxAnchor > 0 && (maxLevel - minLevel) < 0.25 * maxAnchor,
                    active: possible && wfBreakMode === "on"
                };
            }
        }

        // stacked (Stack-Series role): one stack-total domain over ALL tiles —
        // small multiples were scaled per tile (Nord 3 900 ≙ Süd 390, S5). Negative
        // segments stack below the zero line, so the domain spans both stack sides.
        cfg.stackDomain = null;
        if (isStacked) {
            let lo = 0, hi = 0;
            for (const g of groups.slice(0, MULT_MAX_CELLS)) {
                const st = this.stackLayout(g.pts);
                lo = Math.min(lo, ...st.neg);
                hi = Math.max(hi, ...st.pos);
            }
            if (fixedMax > 0) { hi = cfg.capMax != null ? fixedMax : Math.max(hi, fixedMax); }
            cfg.stackDomain = [lo, Math.max(hi, lo < 0 ? 0 : 1)];
        }

        // bridge modes scale each tile for itself by default — the pane toggle
        // switches them to one shared maximum over all tiles (IBCS same scale).
        // The maxima mirror exactly what the renderers compute per tile.
        if (groups.length > 1 && s.chartCard.multiplesSameScale.value) {
            if (isIntWf) {
                let maxTot = 1, maxMon = 1, maxPct = 1;
                // only tiles the renderer will actually draw may bound the shared
                // scale: refused tiles (negative values → hint, no basis → hint)
                // and groups beyond the grid cap would silently squash the rest
                for (const g of groups.slice(0, MULT_MAX_CELLS)) {
                    if (g.pts.some(p => (p.value ?? 0) < 0 || (p.basis ?? 0) < 0)) { continue; }
                    if (!g.pts.some(p => p.varAbs != null)) { continue; }
                    const basisSum = g.pts.reduce((a, p) => a + (p.basis ?? 0), 0);
                    const vTot = g.pts.reduce((a, p) => a + (p.value ?? 0), 0);
                    const pySum = g.pts.reduce((a, p) => a + (p.py ?? 0), 0);
                    const plSum = g.pts.reduce((a, p) => a + (p.pl ?? 0), 0);
                    const twoTotals = g.pts.some(p => p.py != null) && g.pts.some(p => p.pl != null);
                    // running cascade peaks bound the scale too (S4) — mirrors the renderer
                    maxTot = Math.max(maxTot, basisSum, vTot, twoTotals ? Math.max(pySum, plSum) : 0,
                        this.intWfPeak(g.pts));
                    for (const p of g.pts) {
                        maxMon = Math.max(maxMon, p.value ?? 0, p.basis ?? 0,
                            cfg.pyTriangle ? (p.py ?? 0) : 0);
                        maxPct = Math.max(maxPct, Math.abs(p.varRel ?? 0));
                    }
                    const totPct = relVar(vTot - basisSum, basisSum);
                    if (totPct != null) { maxPct = Math.max(maxPct, Math.abs(totPct)); }
                }
                cfg.sharedIntWf = { maxTot, maxMon, maxPct };
            }
            if (isCatBridge) {
                let maxV = 1, minV = 0, maxPct = 1;
                // mirror the renderer's refusals (no PY/PL basis, all-negative
                // totals) and the grid cap — hint tiles must not bound the scale
                for (const g of groups.slice(0, MULT_MAX_CELLS)) {
                    const hasPy = g.pts.some(p => p.py != null);
                    const hasPl = g.pts.some(p => p.pl != null);
                    if (!hasPy && !hasPl) { continue; }
                    const PYt = g.pts.reduce((a, p) => a + (p.py ?? 0), 0);
                    const PLt = g.pts.reduce((a, p) => a + (p.pl ?? 0), 0);
                    const ACt = g.pts.reduce((a, p) => a + (p.value ?? 0), 0);
                    const refIsPl = cfg.basisMode === "plan" && hasPl;
                    const REF = refIsPl ? PLt : PYt;
                    const hasOther = refIsPl ? hasPy : hasPl;
                    const otherTot = refIsPl ? PYt : PLt;
                    if (REF <= 0 && ACt <= 0 && (!hasOther || otherTot <= 0)) { continue; }
                    // all totals present in a tile are drawn as rows → all bound the scale,
                    // and so do the running cascade levels and row bars (S3)
                    // the vertical cascade draws no per-category AC/PY bars — mirror that
                    const ext = this.catBridgeExtent(g.pts, refIsPl, hasPy, !cfg.catBridgeVertical);
                    maxV = Math.max(maxV, PYt, PLt, ACt, ext[1]);
                    minV = Math.min(minV, hasPy ? PYt : 0, hasPl ? PLt : 0, ACt, ext[0]);
                    // n.a. rows (UN 4.1: zero basis / sign change) have no pin → no bound
                    maxPct = Math.max(maxPct, Math.abs(relVar(ACt - REF, REF) ?? 0));
                    for (const p of g.pts) {
                        const rv = refIsPl ? p.pl : p.py;
                        if (p.value != null && rv != null) {
                            maxPct = Math.max(maxPct, Math.abs(relVar(p.value - rv, rv) ?? 0));
                        }
                    }
                }
                cfg.sharedCatBridge = { maxV, minV, maxPct };
            }
        }

        // IBCS same-scale rule also for the self-scaling renderers (pareto/dumbbell/slope)
        cfg.mainDomain = domains.main;
        cfg.varDomain = domains.abs;
        // scatter: deck-wide scales/quadrants over the DRAWN tiles + group colors
        if (isScatter && cfg.scatter) {
            this.prepareScatterDeck(cfg.scatter, groups.slice(0, MULT_MAX_CELLS), groups.length > 1, cfg);
        }

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
            if (isScatter) {
                this.renderScatter(grp.pts, region, cfg);
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
            // ⚠ exception filter chip, top-right of the visual. Bars and table have
            // that corner free (the rounding hint sits bottom right, the sort button
            // only exists in waterfall style, which excludes the filter anyway); the
            // KPI cards draw their own chip left of the sort chip in renderCards
            let excReserve = 0;
            if (this.exceptionCapable && !isCards) {
                excReserve = this.drawExceptionChip(width - 6, 6, cfg) + Math.round(6 * this.fontK);
            }
            // ⫽ chip (waterfall axis break), same top-right corner — the exception
            // filter never exists in the waterfall, so it starts at the right edge
            let wfReserve = 0;
            if (isWaterfall && cfg.wfBreak) {
                wfReserve = this.drawWfBreakChip(width - 6, cfg, wfBreakTile) + Math.round(6 * this.fontK);
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
                const mode = this.commentEdit ? "comment" : this.structureEdit ? "structure" : "compare";
                this.drawModeChip(width - 6 - toolbarReserve - sortReserve - ytdReserve - excReserve
                    - wfReserve, text, cfg, mode);
            }

            // YTD chip (opt-in): the end user flips the cumulative view on the report
            // canvas; persisted like the other in-chart buttons
            if (s.chartCard.cumulativeButton.value && !isStacked
                && (orientationRaw === "columns" || orientationRaw === "line")) {
                // 1.49: locked where cumulating cannot change the picture — P&L rows
                // (rowType) are never cumulated, a single period stays identical
                const ytdLock = points.some(p => p.rowType != null)
                    ? this.locStr("Lock_YtdRowType", "No effect: P&L rows (row type field) are not cumulated")
                    : groups.every(g => g.pts.length <= 1)
                        ? this.locStr("Lock_YtdSingle", "No effect: a single period looks the same cumulated")
                        : null;
                this.drawCumButton(width - (wfStyleGlobal ? 30 : 6), cfg, ytdLock);
            }
        }
        // IBCS title block on top of everything (incl. multiples grid)
        const titleH = s.ibcsTitleCard.show.value
            ? this.drawTitleBlock(width, points, cfg, maxAbs, orientation)
            : 0;
        // Smart-Start suggestion chip: below the title, reserving its own row so it
        // never overlaps it — visible only in the edit context (or an unset ViewMode,
        // i.e. the test harness), never in read-only views or export/print contexts
        const smartStartOn = this.allowInteractions
            && (this.viewMode == null || this.viewMode === 1 /* powerbi.ViewMode.Edit */);
        const smartStartSug = smartStartOn ? this.computeSmartStartSuggestion(orientationRaw) : null;
        const smartStartH = smartStartSug ? this.drawSmartStartChip(titleH, cfg, smartStartSug) : 0;
        // scatter colorBy "group": one compact legend row for the whole visual (1.48)
        const scatterLegH = isScatter ? this.drawScatterLegend(titleH + smartStartH, width, cfg) : 0;
        const topOffset = titleH + smartStartH + scatterLegH;
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
            // the exception filter withholds rows — say so, or the reader takes the
            // shortened list for the whole picture
            if (this.exceptionOn && this.exceptionHidden > 0) {
                filterParts.push(`⚠ ${this.exceptionHidden} ${this.locStr("Foot_Hidden", "summarised")}`);
            }
            if (this.tableSort && isTable && !cfg.cumulative) {
                const [sk, sd] = this.tableSort.split("_");
                const lbl = sk === "ac" ? cfg.scenL.ac : sk === "dabs" ? `Δ${cfg.basisLabel}`
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
        // a broken waterfall axis is declared in the footer line too — independent of
        // the filter-footer switch, so PDF/PowerPoint exports (no chip) still say it
        const noteParts: string[] = [];
        if (cfg.wfBreak?.active) {
            noteParts.push(this.locStr("Foot_WfBreak", "⫽ Axis from {0}")
                .replace("{0}", cfg.fmt.format(cfg.wfBreak.at)));
        }
        const line2Text = [
            filterText ? `${this.locStr("Foot_Filter", "Filter")}: ${filterText}` : "",
            ...noteParts
        ].filter(x => x).join(" · ");
        const lineF = Math.round(11 * this.fontK) + 2;
        const footerH = (footerText || line2Text ? Math.round(11 * this.fontK) + 6 : 0)
            + (footerText && line2Text ? lineF : 0);
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
        if (line2Text) {
            const ft2 = this.el("text", {
                x: 6, y: fy, "font-size": ff, fill: cfg.subtle, "font-family": FONT
            }, this.svg);
            ft2.textContent = this.truncate(line2Text, width - 12, ff);
        }

        // comment panel: numbered footnote list to the right of the chart
        const commentPts = points.filter(p => p.commentNo != null);
        let chartW = width;
        if (this.formattingSettings.commentsCard.showPanel.value
            && commentPts.length > 0 && groups.length <= 1 && width >= 480) {
            // panel width follows the comment font (26 × font ≙ the old 260px at 10pt)
            const panelW = Math.min(Math.round(26 * this.commentFont()),
                Math.round(width * 0.32));
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
        const MAX_CELLS = MULT_MAX_CELLS;
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

        // scatter: the regular cell bounds the bubble radius of every tile (hero included)
        if (isScatter && cfg.scatter?.shared) {
            cfg.scatter.shared.refCell = { w: cellW - 4, h: cellH - groupTitleH - 2 };
        }
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
            segs.push({ label: cfg.hasFc ? `${cfg.scenL.ac}/${cfg.scenL.fc}` : cfg.scenL.ac, from: 0, to: valueSum, kind: "anchor", hatched: cfg.hasFc });
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

        // highlight bands (IBCS EMPHASIZE): span the variance tiers too, so they have
        // to be laid down before those groups exist. Anchors/totals carry no p and are
        // only emphasized when their own label (PY, Σ, AC …) is named in the setting.
        if (cfg.highlight.size > 0) {
            const hlG = this.el("g", {}, this.svg);
            const hlStep = (bandEnd - bandStart) / segs.length;
            for (let i = 0; i < segs.length; i++) {
                if (!this.isEmph(cfg, segs[i].label)) { continue; }
                this.emphBand(hlG, bandStart + i * hlStep + 1, outer.y,
                    hlStep - 2, region.y + region.h - outer.y, cfg);
            }
        }

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
        // hard cap (S7): the scale ends at the cap like in columns/bars — taller
        // anchors and deltas are cut there and get the IBCS break marker below
        const cap = cfg.capMax;
        if (cap != null) { domain[1] = cap; }
        const capV = (v: number) => cap != null ? Math.min(v, cap) : v;
        const labelPad = cfg.showLabels ? cfg.labelFont + 6 : 6;
        // axis break (IBCS UN 5.3): 0..cut shrinks to a fixed stub above the baseline,
        // the deltas run linearly in [cut, max] — the cut is shared by all tiles
        const brk = cfg.wfBreak?.active ? cfg.wfBreak.at : null;
        const stubPx = Math.max(8, Math.min(Math.round(22 * k), Math.round(rect.h * 0.3)));
        const scale = brk != null
            ? this.makeBrokenScale(domain, brk, rect, labelPad, stubPx)
            : this.makePanelScale(domain, rect, "columns", labelPad);
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
                if (v == null) {
                    // basis ≤ 0: no pin, but say so instead of leaving a silent gap (UN 4.1)
                    const tp = tierPts[i];
                    if (tp && showTierLabels && this.relNa(tp)) {
                        this.drawRelNa(tg, pos(i) + slotW / 2, zero, "columns", cfg);
                    }
                    continue;
                }
                const c = pos(i) + slotW / 2;
                const col = (v === 0 || !cfg.isMaterial(tierPts[i]))
                    ? cfg.colors.py : (good(v, tierPts[i]) ? cfg.colors.good : cfg.colors.bad);
                const y = relScale(v);
                this.el("line", { x1: c, y1: zero, x2: c, y2: y, stroke: col, "stroke-width": Math.max(1.6, 1.4 * k) }, tg);
                this.pinHead(tg, c, y, Math.max(2.6, 2.2 * k), "round", cfg.pinStyle, { fill: col });
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
        // a ref line inside the squeezed stub would sit at a meaningless height — skip it
        if (cfg.refLine != null && !(cap != null && cfg.refLine > cap)
            && !(brk != null && cfg.refLine <= brk)) {
            this.drawRefLine(bg, rect, scale, "columns", bandStart, bandEnd, cfg);
        }
        let title = segs[0].outlined ? `${cfg.basisLabel} → ${cfg.scenL.ac}` : cfg.scenL.ac;
        // transparency: the panel title states the cut ("· Achse ab 90 Mio geschnitten")
        if (brk != null) {
            title += ` · ${this.locStr("WfBreak_Title", "axis broken from {0}").replace("{0}", cfg.fmt.format(brk))}`;
        }
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
            this.drawBar(g, pos(i), slotW, capV(sg.from), capV(sg.to), scale, "columns", style);
            if (cap != null && Math.max(sg.from, sg.to) > cap) {
                this.drawCapMarker(g, pos(i), slotW, scale, "columns", cfg);
            }
            // shortened anchors / subtotals: ⫽ across the full bar width inside the stub
            // (deltas never reach into it — that is the admissibility rule)
            if (brk != null && sg.kind === "anchor") {
                this.drawAxisBreak(g, pos(i), slotW, scale(brk) + stubPx * 0.45, "columns", cfg);
            }

            // connector to the next bar at the running level
            if (i < n - 1) {
                const y = scale(capV(sg.to));
                this.el("line", {
                    x1: pos(i) + slotW, y1: y, x2: pos(i + 1), y2: y,
                    stroke: cfg.subtle, "stroke-width": 1
                }, bg);
            }

            if (cfg.showLabels && step > cfg.labelFont * 1.4) {
                const text = sg.kind === "anchor"
                    ? cfg.fmt.format(sg.to)
                    : this.fmtSigned(cfg.fmtVar, sg.to - sg.from);
                // a downward delta bottoming out at the baseline would drop its label into
                // the category-axis band (collides with the cat name) — flip it to the bar top
                // (capped bars: the label sits at the cut end but shows the real value)
                let anchor = capV(sg.to);
                let positive = sg.to >= sg.from;
                // with an axis break the floor is the stub top: a label dropping into
                // the stub would sit on the ⫽ zone of the axis — flip it as well
                const labelFloor = brk != null ? scale(brk) : rect.y + rect.h;
                if (!positive && scale(anchor) + cfg.labelFont + 2 > labelFloor) {
                    anchor = capV(Math.max(sg.from, sg.to));
                    positive = true;
                }
                this.drawEndLabelAt(g, pos(i) + slotW / 2, anchor, positive, scale,
                    "columns", text, cfg.labelFont, cfg.ink, 0, cfg.paper);
            }
            this.drawCategoryLabel(g, sg.label, pos(i) + slotW / 2, "columns", cfg.catFont,
                region, step, rect, cfg.ink, this.isEmph(cfg, sg.label));

            if (sg.p) {
                this.attachInteraction(g, sg.p, cfg);
                this.catGroups.push({ g, sel: sg.p.sel, dim: sg.p.dim });
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
        // null = n.a. (UN 4.1): an all-zero basis has no interpretable Δ%
        const pctTot = relVar(dTot, basisSum);
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

        // the running cascade can peak above both totals (+15, +15, then −8 ×4):
        // the scale must hold that peak, or the bricks leave the plot (S4)
        const maxTot = cfg.sharedIntWf?.maxTot
            ?? Math.max(basisSum, vTot, twoTotals ? Math.max(pySum, plSum) : 0, this.intWfPeak(pts), 1);
        const S = linearScale(0, maxTot, yBase, plotTop + lf + 8);
        const maxMon = cfg.sharedIntWf?.maxMon ?? Math.max(...pts.map(p =>
            Math.max(p.value ?? 0, p.basis ?? 0, cfg.pyTriangle ? (p.py ?? 0) : 0)), 1);
        const miniH = Math.min((yBase - plotTop) * 0.30, region.h * 0.16);
        const BS = linearScale(0, maxMon, 0, miniH);

        const bg = this.el("g", {}, this.svg);
        const marks = this.el("g", {}, this.svg);
        const fmtD = (v: number) => this.fmtSigned(cfg.fmtVar, v);

        // highlight bands (IBCS EMPHASIZE): full column slot from the pin tier down to
        // the category labels; the flanking total columns sit outside the band area
        if (cfg.highlight.size > 0) {
            for (let i = 0; i < n; i++) {
                if (!this.isEmph(cfg, pts[i].cat)) { continue; }
                this.emphBand(bg, cx(i) - step / 2 + 1, region.y + pad,
                    step - 2, region.h - pad * 2, cfg);
            }
        }

        // ------- ΔBasis% pin chart (top)
        if (showPins) {
            const axisY = region.y + pad + pinArea * 0.55;
            const maxPct = cfg.sharedIntWf?.maxPct
                ?? Math.max(...pts.map(p => Math.abs(p.varRel ?? 0)), Math.abs(pctTot ?? 0), 1);
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
                this.pinHead(parent, x, yEnd, r, "square", cfg.pinStyle, {
                    fill: hollow ? `url(#${cfg.patId})` : cfg.ink,
                    stroke: cfg.ink, "stroke-width": hollow ? 1 : 0
                });
                const lt = this.el("text", {
                    x, y: pct >= 0 ? yEnd - r - 3 : yEnd + r + lf, "text-anchor": "middle",
                    "font-size": lf, fill: cfg.ink, "font-family": FONT,
                    stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
                }, parent);
                lt.textContent = this.fmtPercent(pct);
            };
            const showPinAt = this.labelPredicate(pts, pts.map(p => this.relText(p)), lf, step, "columns", p => p.varRel);
            pts.forEach((p, i) => {
                if (p.varRel == null) {
                    if (this.relNa(p)) { this.drawRelNa(marks, cx(i), axisY, "columns", cfg); }
                    return;
                }
                if (!showPinAt(i)) { return; }
                pin(cx(i), p.varRel, p.isFc, marks, p);
            });
            if (pctTot != null) { pin(cxTot, pctTot, true, bg); }
            else { this.drawRelNa(bg, cxTot, axisY, "columns", cfg); }
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
        const showValAt = this.labelPredicate(pts, pts.map(p => p.varAbs != null ? fmtD(p.varAbs) : ""), lf, step, "columns", p => p.varAbs);
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
            const showCatAt = this.labelPredicate(pts, pts.map(q => q.cat), cf, step, "columns", undefined, true);
            const isHl = this.isEmph(cfg, p.cat);
            if (showCatAt(i) || isHl) {
                const ct = this.el("text", {
                    x, y: yBase + cf + 4, "text-anchor": "middle", "font-size": cf,
                    fill: cfg.ink, "font-family": FONT, "font-weight": isHl ? 600 : 400
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
            this.catGroups.push({ g, sel: p.sel, dim: p.dim });
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
            al.textContent = cfg.scenL.ac;
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
        tc.textContent = fcTot > 0 ? `${cfg.scenL.ac}+${cfg.scenL.fc}` : cfg.scenL.ac;

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
     * highest running level of the integrated bridge cascade (basis total plus the
     * Δ so far). Shared by the renderer and the multiples' same-scale pass so the
     * two can never disagree about what bounds the scale.
     */
    private intWfPeak(pts: DataPoint[]): number {
        let level = pts.reduce((a, p) => a + (p.basis ?? 0), 0);
        let peak = level;
        for (const p of pts) {
            if (p.varAbs == null) { continue; }
            level += p.varAbs;
            peak = Math.max(peak, level);
        }
        return peak;
    }

    /**
     * value range the category bridge draws besides its totals: every running
     * cascade level (reference total + Δ so far) and each row's AC/reference bar
     * (withRows; the vertical cascade has no row bars). Mirrors both category-bridge
     * renderers — used there and in the same-scale pass.
     */
    private catBridgeExtent(pts: DataPoint[], refIsPl: boolean, hasPy: boolean,
        withRows = true): [number, number] {
        const refOf = (p: DataPoint) => refIsPl ? p.pl : p.py;
        let cum = pts.reduce((a, p) => a + (refOf(p) ?? 0), 0);
        let lo = Math.min(0, cum), hi = Math.max(0, cum);
        for (const p of pts) {
            const behind = hasPy ? p.py : p.pl;
            // withRows = false: vertical cascade without row bars — levels only
            for (const v of withRows ? [p.value, behind] : []) {
                if (v != null) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
            }
            const rv = refOf(p);
            if (p.value != null && rv != null) {
                cum += p.value - rv;
                lo = Math.min(lo, cum);
                hi = Math.max(hi, cum);
            }
        }
        return [lo, hi];
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
        const refLabel = refIsPl ? cfg.scenL.pl : cfg.scenL.py;
        const REF = refIsPl ? PLt : PYt;
        const hasOther = refIsPl ? hasPy : hasPl;
        const otherTot = refIsPl ? PYt : PLt;
        const otherLabel = refIsPl ? cfg.scenL.py : cfg.scenL.pl;
        const dTot = ACt - REF;
        // purely negative totals collapse the anchor scale (maxV falls back to 1) —
        // every bar degenerates to a sliver; fail loudly like the integrated bridge
        if (REF <= 0 && ACt <= 0 && (!hasOther || otherTot <= 0)) {
            this.drawModeHint(region, cfg, this.locStr("Hint_CatBridgeNeg",
                "Category bridge does not support all-negative totals — use waterfall or columns + bridge"));
            return;
        }
        // chart.bridgeOrientation = "columns": own drawing path (vertical cascade)
        if (cfg.catBridgeVertical) {
            this.renderCategoryBridgeVertical(pts, region, cfg);
            return;
        }
        const goodOf = (v: number, pp?: DataPoint | null) => cfg.isGood(v, pp);
        // per-row deltas LOCALLY against the bridge's own PY/PL reference — p.varAbs
        // follows comparisonMode (e.g. fcrev) and would not reconcile with the anchors
        const refValOf = (p: DataPoint): number | null => refIsPl ? p.pl : p.py;
        const dOf = (p: DataPoint): number | null =>
            p.value != null && refValOf(p) != null ? p.value - (refValOf(p) as number) : null;
        // Δ% n.a. at a zero reference or a sign change (UN 4.1)
        const dRelOf = (p: DataPoint): number | null => relVar(dOf(p), refValOf(p));
        const dRelNa = (p: DataPoint): boolean => relIsNa(dOf(p), refValOf(p));
        const colOf = (v: number, pp?: DataPoint) => (v === 0
            || (pp != null && !cfg.isMaterial(pp, dOf(pp), dRelOf(pp))))
            ? cfg.colors.py : (goodOf(v, pp) ? cfg.colors.good : cfg.colors.bad);
        const fmtD = (v: number) => this.fmtSigned(cfg.fmtVar, v);

        // ------- layout
        const rightEdge = region.x + region.w - pad;
        const catArea = Math.min(region.w * 0.22,
            this.maxTextWidth(pts.map(p => p.cat), cf) + 16);
        const x0 = region.x + pad + catArea;
        const showPins = cfg.showRel && region.w >= 520
            && pts.some(p => dRelOf(p) != null || dRelNa(p));
        const pinW = showPins ? Math.max(110, region.w * 0.15) + lf * 3 : 0;
        const valLblW = lf * 4.2;
        const xValEnd = rightEdge - pinW - valLblW;
        // the scale must hold every running cascade level and row bar, not just the
        // totals — a driver of +60 on PY 100 peaks at 160 and ran through the pin
        // column (S3). Negative levels/values shift the zero line right (minV).
        const ext = this.catBridgeExtent(pts, refIsPl, hasPy);
        const maxV = cfg.sharedCatBridge?.maxV
            ?? Math.max(REF, ACt, hasOther ? otherTot : 0, ext[1], 1);
        const minV = cfg.sharedCatBridge?.minV
            ?? Math.min(0, hasPy ? PYt : 0, hasPl ? PLt : 0, ACt, ext[0]);
        const X = linearScale(minV, maxV, x0, xValEnd);
        // zero line of all bars (== x0 unless something is negative)
        const xZ = X(0);
        const hBar = (v: number) => ({ x: Math.min(xZ, X(v)), width: Math.max(Math.abs(X(v) - xZ), 1) });
        // value label beyond the bar end, mirrored for negative bars
        const endLblX = (v: number, gap: number) => v >= 0 ? X(v) + gap : X(v) - gap;
        const endLblA = (v: number): "start" | "end" => v >= 0 ? "start" : "end";
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

        // highlight bands (IBCS EMPHASIZE): full category row incl. label column and
        // pin tier. The PY/PL/AC total rows are anchors, not categories — untouched.
        if (cfg.highlight.size > 0) {
            for (let i = 0; i < n; i++) {
                if (!this.isEmph(cfg, pts[i].cat)) { continue; }
                this.emphBand(bg, region.x + pad, yS0 + i * rowH + 1,
                    rightEdge - region.x - pad, rowH - 2, cfg);
            }
        }

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
            rowLabel(yPL, cfg.scenL.pl, true, bg);
            this.el("rect", {
                ...hBar(PLt), y: yPL + (rowH - barH) / 2, height: barH,
                fill: cfg.paper, stroke: cfg.colors.pl, "stroke-width": 1.5
            }, bg);
            valLabel(endLblX(PLt, 8), yPL + rowH / 2 + lf * 0.35, cfg.fmt.format(PLt), true, bg, endLblA(PLt));
            guide(X(PLt), yPL + rowH, refIsPl ? endPrim : endSec, false, bg);
        }
        if (yPY != null) {
            rowLabel(yPY, cfg.scenL.py, true, bg);
            this.el("rect", {
                ...hBar(PYt), y: yPY + (rowH - barH) / 2, height: barH,
                ...(cfg.hc
                    ? { fill: cfg.paper, stroke: cfg.colors.py, "stroke-width": 1.2, "stroke-dasharray": "3,2" }
                    : { fill: cfg.colors.py })
            }, bg);
            valLabel(endLblX(PYt, 8), yPY + rowH / 2 + lf * 0.35, cfg.fmt.format(PYt), true, bg, endLblA(PYt));
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
        const maxPct = cfg.sharedCatBridge?.maxPct
            ?? Math.max(...pts.map(p => Math.abs(dRelOf(p) ?? 0)),
                Math.abs(relVar(dTot, REF) ?? 0), 1);
        const pinLen = (v: number) => Math.max(2, Math.abs(v) / maxPct * maxPinLen);
        const drawPin = (yy: number, pct: number, bold: boolean, parent: SVGElement, pp?: DataPoint) => {
            const w = pinLen(pct);
            const yMid = yy + rowH / 2;
            const c = colOf(pct, pp);
            const r = Math.max(2.6, 3.4 * k);
            if (pct >= 0) {
                this.el("rect", { x: axisX + 2, y: yMid - 1.5, width: w, height: 3, fill: c }, parent);
                this.pinHead(parent, axisX + 2 + w + r, yMid, r, "square", cfg.pinStyle, { fill: cfg.ink });
                valLabel(axisX + 2 + w + 2 * r + 4, yMid + lf * 0.35, this.fmtPercent(pct), bold, parent);
            } else {
                this.el("rect", { x: axisX - 2 - w, y: yMid - 1.5, width: w, height: 3, fill: c }, parent);
                this.pinHead(parent, axisX - 2 - w - r, yMid, r, "square", cfg.pinStyle, { fill: cfg.ink });
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
            rowLabel(yy, p.cat, this.isEmph(cfg, p.cat), g);

            // mini bars: reference (PY grey / PL outline) behind, AC in front;
            // with three scenarios the PY reference collapses to the triangle marker
            const behind = hasPy ? p.py : p.pl;
            if (behind != null) {
                if (cfg.pyTriangle && hasPy) {
                    this.drawPyTriangle(g, yy + rowH * 0.28, rowH * 0.5, behind, X, "bars", cfg);
                } else {
                    this.el("rect", {
                        ...hBar(behind), y: yy + rowH * 0.12, height: pyBarH,
                        ...(cfg.hc || !hasPy
                            ? { fill: cfg.paper, stroke: cfg.colors.py, "stroke-width": 1 }
                            : { fill: cfg.colors.py })
                    }, g);
                }
            }
            if (p.value != null) {
                this.el("rect", {
                    ...hBar(p.value), y: yy + rowH * 0.30, height: acBarH,
                    ...(p.isFc
                        ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1 }
                        : { fill: cfg.colors.ac })
                }, g);
                if (cfg.showLabels) {
                    if (p.value >= 0) {
                        const xl = Math.max(X(p.value), behind != null ? X(behind) : 0);
                        valLabel(xl + 6, yy + rowH / 2 + lf * 0.35, cfg.fmt.format(p.value), false, g);
                    } else {
                        const xl = Math.min(X(p.value), behind != null ? X(behind) : X(p.value));
                        valLabel(xl - 6, yy + rowH / 2 + lf * 0.35, cfg.fmt.format(p.value), false, g, "end");
                    }
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
                    const noteX = d >= 0 ? xB + 6 + fmtD(d).length * lf * 0.62 + 12 : xA - 6 - fmtD(d).length * lf * 0.62 - 12;
                    // the note must end before the Δ% pin column (rightwards) or the
                    // value-column start (leftwards) — with the cascade now reaching
                    // the end of the value column (S3) it would run over the pins
                    const noteRoom = d >= 0
                        ? (showPins ? rightEdge - pinW : rightEdge) - 4 - noteX
                        : noteX - x0 - 4;
                    if (noteRoom >= noteFont * 6) {
                        const nt = this.el("text", {
                            x: noteX,
                            y: yy + rowH / 2 + lf * 0.35, "text-anchor": d >= 0 ? "start" : "end",
                            "font-size": noteFont, fill: cfg.subtle, "font-family": FONT, "font-style": "italic",
                            stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
                        }, g);
                        nt.textContent = this.truncate(note, noteRoom, noteFont);
                    }
                }
                // vertical connector to the next row / to the AC row
                const nextY = i < n - 1 ? yy + rowH + rowH * 0.26 : yAC + rowH * 0.2;
                guide(X(b), yy + rowH * 0.26 + brickH, nextY, true, bg);
                cum = b;
            }

            if (showPins && dRelOf(p) != null) {
                drawPin(yy, dRelOf(p) as number, false, g, p);
            } else if (showPins && dRelNa(p)) {
                this.drawRelNa(g, yy + rowH / 2, axisX, "bars", cfg);
            }

            this.attachInteraction(g, p, cfg);
            this.catGroups.push({ g, sel: p.sel, dim: p.dim });
            this.animGroups.push([g]);
        });

        // ------- AC total row
        rowLabel(yAC, cfg.scenL.ac, true, bg);
        this.el("rect", {
            ...hBar(ACt), y: yAC + (rowH - barH) / 2, height: barH,
            ...(cfg.hasFc
                ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1.2 }
                : { fill: cfg.colors.ac })
        }, bg);
        valLabel(endLblX(ACt, 8), yAC + rowH / 2 + lf * 0.35, cfg.fmt.format(ACt), true, bg, endLblA(ACt));
        guide(X(ACt), yAC + rowH, endSec, false, bg);
        const totRel = relVar(dTot, REF);
        if (showPins && totRel != null) {
            drawPin(yAC, totRel, true, bg);
        } else if (showPins) {
            this.drawRelNa(bg, yAC + rowH / 2, axisX, "bars", cfg);
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

    /**
     * Category bridge, vertical (chart.bridgeOrientation = "columns"): the classic
     * column waterfall, driven by categories — reference anchor left (the other
     * scenario as a second anchor in front of it, like the two total columns of the
     * integrated bridge), one floating ΔRef brick per category, the AC anchor and the
     * double reconciliation (ΔRef with circled callout, Δother) right; the ΔRef% pins
     * sit on top instead of in a side column. Scale rules as in the horizontal bridge
     * (1.45): every running cascade level is in the domain, small multiples share
     * cfg.sharedCatBridge — computed without row bars, since this layout draws none.
     */
    private renderCategoryBridgeVertical(pts: DataPoint[], region: Rect, cfg: ChartConfig): void {
        const n = pts.length;
        const k = this.fontK;
        const lf = cfg.labelFont, cf = cfg.catFont;
        const pad = 6;
        const hasPy = pts.some(p => p.py != null);
        const hasPl = pts.some(p => p.pl != null);
        const PYt = pts.reduce((a, p) => a + (p.py ?? 0), 0);
        const PLt = pts.reduce((a, p) => a + (p.pl ?? 0), 0);
        const ACt = pts.reduce((a, p) => a + (p.value ?? 0), 0);
        const refIsPl = cfg.basisMode === "plan" && hasPl;
        const refLabel = refIsPl ? cfg.scenL.pl : cfg.scenL.py;
        const REF = refIsPl ? PLt : PYt;
        const hasOther = refIsPl ? hasPy : hasPl;
        const otherTot = refIsPl ? PYt : PLt;
        const otherLabel = refIsPl ? cfg.scenL.py : cfg.scenL.pl;
        const dTot = ACt - REF;
        // per-row deltas locally against the bridge's own reference (see horizontal)
        const goodOf = (v: number, pp?: DataPoint | null) => cfg.isGood(v, pp);
        const refValOf = (p: DataPoint): number | null => refIsPl ? p.pl : p.py;
        const dOf = (p: DataPoint): number | null =>
            p.value != null && refValOf(p) != null ? p.value - (refValOf(p) as number) : null;
        const dRelOf = (p: DataPoint): number | null => relVar(dOf(p), refValOf(p));
        const dRelNa = (p: DataPoint): boolean => relIsNa(dOf(p), refValOf(p));
        const colOf = (v: number, pp?: DataPoint) => (v === 0
            || (pp != null && !cfg.isMaterial(pp, dOf(pp), dRelOf(pp))))
            ? cfg.colors.py : (goodOf(v, pp) ? cfg.colors.good : cfg.colors.bad);
        const fmtD = (v: number) => this.fmtSigned(cfg.fmtVar, v);

        // ------- slots: [other] REF | drivers | AC | ΔRef [Δother]
        type Slot = { kind: "other" | "ref" | "drv" | "ac" | "dref" | "doth"; label: string; p?: DataPoint };
        const slots: Slot[] = [];
        if (hasOther) { slots.push({ kind: "other", label: otherLabel }); }
        slots.push({ kind: "ref", label: refLabel });
        for (const p of pts) { slots.push({ kind: "drv", label: p.cat, p }); }
        slots.push({ kind: "ac", label: cfg.scenL.ac });
        slots.push({ kind: "dref", label: `Δ${refLabel}` });
        if (hasOther) { slots.push({ kind: "doth", label: `Δ${otherLabel}` }); }
        const bandStart = region.x + pad;
        const bandEnd = region.x + region.w - pad;
        // half a slot of air between the AC anchor and the reconciliation columns
        const units = slots.length + 0.5;
        const step = (bandEnd - bandStart) / units;
        const barW = Math.max(2, step * 0.62);
        const slotX = (i: number) => bandStart + (i + (slots[i].kind === "dref" || slots[i].kind === "doth" ? 0.5 : 0)) * step
            + (step - barW) / 2;
        const center = (i: number) => slotX(i) + barW / 2;

        // ------- vertical layout: pin tier · (driver note) · cascade · category names
        const showPins = cfg.showRel && region.h >= 240
            && pts.some(p => dRelOf(p) != null || dRelNa(p));
        const pinH = showPins ? Math.max(48, Math.round(region.h * 0.2)) : 0;
        const catLineH = Math.round(cf * 1.15);
        const catH = catLineH * 2 + 6;
        // largest driver (optional italic note above the cascade)
        let drvIdx = -1;
        pts.forEach((p, i) => {
            if (dOf(p) == null) { return; }
            if (drvIdx < 0 || Math.abs(dOf(p) as number) > Math.abs(dOf(pts[drvIdx]) ?? 0)) { drvIdx = i; }
        });
        const noteFont = Math.round(Math.max(9, lf * 0.85));
        const showNote = drvIdx >= 0 && dTot !== 0 && region.w >= 480 && region.h >= 220
            && this.formattingSettings.chartCard.driverNote.value;
        const noteH = showNote ? noteFont + 8 : 0;
        const top = region.y + pad;
        const pinTop = top;
        const cTop = pinTop + pinH + noteH;
        const cBottom = region.y + region.h - pad - catH;

        // ------- scale: anchors + every cascade level (no row bars in this layout)
        const ext = this.catBridgeExtent(pts, refIsPl, hasPy, false);
        const maxV = cfg.sharedCatBridge?.maxV
            ?? Math.max(REF, ACt, hasOther ? otherTot : 0, ext[1], 1);
        const minV = cfg.sharedCatBridge?.minV
            ?? Math.min(0, hasPy ? PYt : 0, hasPl ? PLt : 0, ACt, ext[0]);
        const labelPad = lf + 8;
        const plotTop = cTop + labelPad;
        const plotBottom = cBottom - (minV < 0 ? labelPad : 2);
        const Y = linearScale(minV, maxV, plotBottom, plotTop);
        const yZ = Y(0);

        const bg = this.el("g", {}, this.svg);
        const marks = this.el("g", {}, this.svg);

        // highlight bands (IBCS EMPHASIZE): the full driver column incl. pin and name
        if (cfg.highlight.size > 0) {
            slots.forEach((sl, i) => {
                if (sl.kind !== "drv" || !this.isEmph(cfg, sl.label)) { return; }
                this.emphBand(bg, bandStart + i * step + 1, top, step - 2,
                    region.y + region.h - pad - top, cfg);
            });
        }
        // group separators between driver columns
        const groupEvery = Math.round(this.formattingSettings.chartCard.groupEvery.value ?? 0);
        const firstDrv = slots.findIndex(sl => sl.kind === "drv");
        if (groupEvery > 0 && groupEvery < n) {
            for (let i = groupEvery; i < n; i += groupEvery) {
                const xs = bandStart + (firstDrv + i) * step;
                this.el("line", {
                    x1: xs, y1: cTop, x2: xs, y2: region.y + region.h - pad,
                    stroke: cfg.subtle, "stroke-width": 1, "stroke-opacity": 0.35
                }, bg);
            }
        }

        const valLabel = (xx: number, yy: number, text: string, bold: boolean, parent: SVGElement,
            color = cfg.ink) => {
            const t = this.el("text", {
                x: xx, y: yy, "text-anchor": "middle", "font-size": lf, fill: color,
                "font-family": FONT, "font-weight": bold ? 700 : 400,
                stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
            }, parent);
            t.textContent = text;
            return t;
        };
        // value label above a bar end (positive) or below it (negative); a label that
        // would drop into the name band flips above the bar instead (waterfall rule)
        const endLabel = (i: number, lo: number, hi: number, up: boolean, text: string, bold: boolean,
            parent: SVGElement, color = cfg.ink) => {
            if (!cfg.showLabels || step < lf * 1.4) { return; }
            let yy = up ? Y(hi) - 4 : Y(lo) + lf + 2;
            if (!up && yy > cBottom) { yy = Y(hi) - 4; }
            valLabel(center(i), yy, text, bold, parent, color);
        };
        // category / anchor names below the axis — two lines before truncating
        const nameLabel = (i: number, text: string, bold: boolean, parent: SVGElement) => {
            const maxW = step - 4;
            const t = this.el("text", {
                x: center(i), "text-anchor": "middle", "font-size": cf, fill: cfg.ink,
                "font-family": FONT, "font-weight": bold ? 700 : 400
            }, parent);
            const y1 = cBottom + catLineH;
            if (this.textWidth(text, cf) <= maxW) {
                t.setAttribute("y", String(y1));
                t.textContent = text;
                return;
            }
            const [l1, l2raw] = this.splitTwoLines(text, maxW, cf);
            for (const [ln, yy] of [[l1, y1], [this.truncate(l2raw, maxW, cf), y1 + catLineH]] as [string, number][]) {
                if (!ln) { continue; }
                const ts = document.createElementNS(SVG_NS, "tspan");
                ts.setAttribute("x", String(center(i)));
                ts.setAttribute("y", String(yy));
                ts.textContent = ln;
                t.appendChild(ts);
            }
        };
        const vBar = (i: number, from: number, to: number, style: Record<string, string | number>,
            parent: SVGElement) => {
            const a = Y(from), b = Y(to);
            this.el("rect", {
                x: slotX(i), y: Math.min(a, b), width: barW,
                height: Math.max(Math.abs(b - a), 1), ...style
            }, parent);
        };
        const connector = (iFrom: number, iTo: number, level: number) => {
            this.el("line", {
                x1: slotX(iFrom) + barW, y1: Y(level), x2: slotX(iTo), y2: Y(level),
                stroke: cfg.subtle, "stroke-width": 1
            }, bg);
        };
        const pyStyle = cfg.hc
            ? { fill: cfg.paper, stroke: cfg.colors.py, "stroke-width": 1.2, "stroke-dasharray": "3,2" }
            : { fill: cfg.colors.py };
        const plStyle = { fill: cfg.paper, stroke: cfg.colors.pl, "stroke-width": 1.5 };

        // ------- zero line (AC notation) across all columns
        this.el("line", {
            x1: bandStart, y1: yZ, x2: bandEnd, y2: yZ, stroke: cfg.colors.ac, "stroke-width": 1.6
        }, bg);

        // ------- ΔRef% pin tier on top
        const iAc = slots.findIndex(sl => sl.kind === "ac");
        const axisY = pinTop + pinH * 0.5;
        const maxPct = cfg.sharedCatBridge?.maxPct
            ?? Math.max(...pts.map(p => Math.abs(dRelOf(p) ?? 0)),
                Math.abs(relVar(dTot, REF) ?? 0), 1);
        const maxPinLen = Math.max(8, pinH * 0.5 - lf - 10);
        const pinLen = (v: number) => Math.max(2, Math.abs(v) / maxPct * maxPinLen);
        const drawPin = (i: number, pct: number, bold: boolean, parent: SVGElement, pp?: DataPoint) => {
            const cx = center(i);
            const len = pinLen(pct);
            const c = colOf(pct, pp);
            const r = Math.max(2.6, 3.4 * k);
            const yEnd = pct >= 0 ? axisY - 2 - len : axisY + 2 + len;
            this.el("rect", {
                x: cx - 1.5, y: Math.min(axisY, yEnd), width: 3, height: Math.abs(yEnd - axisY), fill: c
            }, parent);
            this.pinHead(parent, cx, yEnd, r, "square", cfg.pinStyle, { fill: cfg.ink });
            if (cfg.showLabels && step >= lf * 1.6) {
                valLabel(cx, pct >= 0 ? yEnd - r - 3 : yEnd + r + lf, this.fmtPercent(pct), bold, parent);
            }
        };
        if (showPins) {
            const tp = this.el("text", {
                x: region.x + pad, y: pinTop + Math.round(11 * k), "font-size": Math.round(11 * k),
                fill: cfg.subtle, "font-family": FONT, "font-weight": 600
            }, bg);
            tp.textContent = `Δ${refLabel}%`;
            // axis under the driver columns, a separate stub under the AC total pin
            const xA = slotX(firstDrv) - (step - barW) / 2;
            const xB = slotX(firstDrv + n - 1) + barW + (step - barW) / 2;
            this.el("rect", { x: xA, y: axisY - 1.5, width: Math.max(xB - xA - step * 0.1, 1), height: 3, fill: cfg.colors.py }, bg);
            this.el("rect", { x: slotX(iAc) - step * 0.1, y: axisY - 1.5, width: barW + step * 0.2, height: 3, fill: cfg.colors.py }, bg);
        }

        // ------- left anchors: other scenario + reference
        slots.forEach((sl, i) => {
            if (sl.kind !== "other" && sl.kind !== "ref") { return; }
            const isPlBar = sl.kind === "ref" ? refIsPl : !refIsPl;
            const v = sl.kind === "ref" ? REF : otherTot;
            vBar(i, 0, v, isPlBar ? plStyle : pyStyle, bg);
            endLabel(i, Math.min(0, v), Math.max(0, v), v >= 0, cfg.fmt.format(v), true, bg);
            nameLabel(i, sl.label, true, bg);
        });

        // ------- driver columns: floating ΔRef bricks along the running level
        let cum = REF;
        let prevSlot = slots.findIndex(sl => sl.kind === "ref");
        slots.forEach((sl, i) => {
            if (sl.kind !== "drv" || !sl.p) { return; }
            const p = sl.p;
            const g = this.el("g", { "class": "icd-cat" }, marks) as SVGGElement;
            const d = dOf(p);
            if (d != null) {
                const a = cum, b = cum + d;
                const c = colOf(d, p);
                const hollowBad = cfg.hc && !goodOf(d, p) && d !== 0;
                vBar(i, a, b, hollowBad
                    ? { fill: cfg.paper, stroke: c, "stroke-width": 1.4 }
                    : p.isFc
                        ? { fill: `url(#${goodOf(d, p) ? cfg.patGood : cfg.patBad})`, stroke: c, "stroke-width": 1 }
                        : { fill: c }, g);
                connector(prevSlot, i, a);
                endLabel(i, Math.min(a, b), Math.max(a, b), d >= 0, fmtD(d), false, g);
                cum = b;
                prevSlot = i;
            }
            nameLabel(i, p.cat, this.isEmph(cfg, p.cat), g);
            if (showPins && dRelOf(p) != null) {
                drawPin(i, dRelOf(p) as number, false, g, p);
            } else if (showPins && dRelNa(p)) {
                this.drawRelNa(g, center(i), axisY, "columns", cfg);
            }
            this.attachInteraction(g, p, cfg);
            this.catGroups.push({ g, sel: p.sel, dim: p.dim });
            this.animGroups.push([g]);
        });
        connector(prevSlot, iAc, cum);

        // ------- AC anchor (hatched when forecast is part of it) + total pin
        vBar(iAc, 0, ACt, cfg.hasFc
            ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1.2 }
            : { fill: cfg.colors.ac }, bg);
        endLabel(iAc, Math.min(0, ACt), Math.max(0, ACt), ACt >= 0, cfg.fmt.format(ACt), true, bg);
        nameLabel(iAc, cfg.scenL.ac, true, bg);
        const totRel = relVar(dTot, REF);
        if (showPins && totRel != null) {
            drawPin(iAc, totRel, true, bg);
        } else if (showPins) {
            this.drawRelNa(bg, center(iAc), axisY, "columns", cfg);
        }

        // ------- reconciliation: ΔRef (circled callout) and Δother, floating between
        // the respective total and AC; a thin guide carries the AC level across
        const iDref = slots.findIndex(sl => sl.kind === "dref");
        const iDoth = slots.findIndex(sl => sl.kind === "doth");
        const lastRecon = iDoth >= 0 ? iDoth : iDref;
        this.el("line", {
            x1: slotX(iAc) + barW, y1: Y(ACt), x2: slotX(lastRecon) + barW, y2: Y(ACt),
            stroke: cfg.subtle, "stroke-width": 1, "stroke-dasharray": "3,2", "stroke-opacity": 0.8
        }, bg);
        const recon = (i: number, from: number, withCallout: boolean) => {
            const d = ACt - from;
            vBar(i, from, ACt, { fill: colOf(d) }, bg);
            nameLabel(i, slots[i].label, false, bg);
            if (!cfg.showLabels) { return; }
            const text = fmtD(d);
            const yTopBar = Y(Math.max(from, ACt));
            if (withCallout) {
                const pw = Math.max(44, this.textWidth(text, lf) + 16), ph = lf + 9;
                const py0 = Math.max(cTop, yTopBar - 6 - ph);
                this.el("rect", {
                    x: center(i) - pw / 2, y: py0, width: pw, height: ph, rx: ph / 2,
                    fill: cfg.paper, stroke: colOf(d), "stroke-width": 1.8
                }, bg);
                valLabel(center(i), py0 + ph / 2 + lf * 0.36, text, true, bg, colOf(d));
            } else {
                valLabel(center(i), yTopBar - 4, text, false, bg);
            }
        };
        recon(iDref, REF, true);
        if (iDoth >= 0) { recon(iDoth, otherTot, false); }

        // ------- largest-driver note (optional), one italic line above the cascade
        if (showNote) {
            const d = dOf(pts[drvIdx]) as number;
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
            const nt = this.el("text", {
                x: region.x + pad, y: pinTop + pinH + noteFont + 2, "text-anchor": "start",
                "font-size": noteFont, fill: cfg.subtle, "font-family": FONT, "font-style": "italic"
            }, bg);
            nt.textContent = this.truncate(`${pts[drvIdx].cat}: ${note}`, region.w - pad * 2, noteFont);
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
        const refLabel = refIsPy ? cfg.scenL.py : cfg.scenL.pl;
        const viewHead = view === "ac" ? cfg.scenL.ac : view === "acfc" ? cfg.scenL.ac + "&" + cfg.scenL.fc : cfg.scenL.pl;
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
            return this.exportAllOpen || !(o != null && this.pnlCollapsed.has(o));
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
        const pctFmt = new Intl.NumberFormat(this.host.locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
        // margin rows follow the finance convention like every other label site
        const pctT = (v: number) => this.financeFmt && v < 0
            ? `(${pctFmt.format(Math.abs(v))} %)` : `${pctFmt.format(v)} %`;
        const ppT = (d: number) => this.financeFmt && d < 0
            ? `(${pctFmt.format(Math.abs(d))}Pp)`
            : `${d > 0 ? "+" : d < 0 ? "−" : "±"}${pctFmt.format(Math.abs(d))}Pp`;

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
                if (rv != null) { txt(bx(xRef, 0) + 4, cy + lf * 0.36, pctT(rv), "start", lf, false, cfg.subtle, g); }
                if (mv != null) { txt(bx(xM, 0) + 4, cy + lf * 0.36, pctT(mv), "start", lf, false, cfg.ink, g); }
                if (showD && mv != null && rv != null) {
                    const d = mv - rv;
                    txt(dAxis + 6, cy + lf * 0.36, ppT(d),
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
                    const dpm = relVar(d, rv);
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
                // ΔRef% pin, capped with outlier arrows like the reference;
                // zero reference or sign change → "n.a." instead of a pin (UN 4.1)
                const dpRel = mv != null && rv != null ? relVar(mv - rv, rv) : null;
                if (showPct && mv != null && rv != null && dpRel == null && relIsNa(mv - rv, rv)) {
                    txt(pAxis + 6, cy + lf * 0.36, REL_NA, "start", lf, false, cfg.subtle, g);
                }
                if (showPct && mv != null && rv != null && dpRel != null) {
                    const dp = dpRel;
                    const c = colOf(mv - rv, p, dp);
                    const outlier = Math.abs(dp) > P_CAP;
                    const w = Math.min(Math.abs(dp), P_CAP) / P_CAP * pLen;
                    const x0 = dp >= 0 ? pAxis : pAxis - w;
                    this.el("rect", { x: x0, y: cy - 1.1, width: Math.max(2, w), height: 2.2, fill: c }, g);
                    const hr = Math.max(2.6, 3.2 * k);
                    const hcx = dp >= 0 ? pAxis + w : pAxis - w;
                    this.pinHead(g, hcx, cy, hr, "square", cfg.pinStyle,
                        style === "solid" ? { fill: cfg.ink }
                            : style === "hatched" ? { fill: `url(#${cfg.patId})`, stroke: cfg.ink, "stroke-width": 1 }
                                : { fill: cfg.paper, stroke: cfg.ink, "stroke-width": 1.2 });
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
            this.catGroups.push({ g, sel: p.sel, dim: p.dim });
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
            const segLbl: Record<string, string> = { ac: cfg.scenL.ac, acfc: cfg.scenL.ac + "&" + cfg.scenL.fc, pl: cfg.scenL.pl };
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
                const expanded = this.expandedRows.has(nd.key) || searchOn || this.exportAllOpen;
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
                group: points[0].group, isRest: false, dim: false, sel: null
            };
            // unauflösbare Formel (Tippfehler im Zeilennamen, kaputte Syntax):
            // sichtbare "= ?"-Zeile statt lautlosem Weglassen (Backlog-Punkt)
            const fxErr = (label: string): DataPoint => ({
                ...blank, cat: `${label} = ?`, ac: null, py: null, pl: null, fc: null,
                value: null, basis: null, varAbs: null, varRel: null,
                var2Abs: null, var2Rel: null, rowType: "sum"
            } as DataPoint);
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
                    if (!num || !den) { rows.push({ p: fxErr(label), depth: 0, formula: true }); continue; }
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
                    if (!a) { rows.push({ p: fxErr(label), depth: 0, formula: true }); continue; }
                    const varAbs = (a.value != null && a.basis != null) ? a.value - a.basis : null;
                    const b2 = this.basis2Mode === "plan" ? a.pl : a.py;
                    const var2Abs = (a.value != null && b2 != null) ? a.value - b2 : null;
                    fp = {
                        ...blank, cat: label, ac: a.ac, py: a.py, pl: a.pl, fc: a.fc,
                        value: a.value, basis: a.basis, varAbs,
                        varRel: relVar(varAbs, a.basis),
                        var2Abs,
                        var2Rel: relVar(var2Abs, b2),
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
        // manual numeric-column widths (drag/auto-fit): "val" drives the AC value
        // column (reference columns share this width), "dval" the Δ column(s)
        const cw = this.tableColWidths;
        const clampColW = (w: number) => Math.max(lf * 2.5, Math.min(region.w * 0.3, w));
        const valW = cw.val != null ? clampColW(cw.val) : lf * 4.8;
        // icons and finance parentheses widen the Δ texts — give the columns room
        const dExtra = (cfg.deltaIcons ? 1.2 : 0) + (this.financeFmt ? 0.5 : 0);
        const dValW = hasVar ? (cw.dval != null ? clampColW(cw.dval) : lf * (4.6 + dExtra)) : 0;
        const d2ValW = hasVar2 ? (cw.dval != null ? clampColW(cw.dval) : lf * (4.6 + dExtra)) : 0;
        // Δ2 % has no graphic pin — it is always a numeric column when dual is on
        const d2PctValW = hasVar2 && cfg.showRel ? lf * 4.2 : 0;
        // optional numeric reference columns (print/board-ready tables): the
        // variance basis or both scenarios, next to the AC number
        type VCol = { key: string; label: string; get: (p: DataPoint) => number | null };
        const extraCols: VCol[] = [];
        if (cfg.valueCols === "basis" && rowPts.some(p => p.basis != null)) {
            extraCols.push({ key: "bval", label: cfg.basisLabel, get: p => p.basis });
        } else if (cfg.valueCols === "all") {
            if (cfg.hasPy) { extraCols.push({ key: "pyval", label: cfg.scenL.py, get: p => p.py }); }
            if (cfg.hasPl) { extraCols.push({ key: "plval", label: cfg.scenL.pl, get: p => p.pl }); }
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

        // ------- row layout + shared scales; the Σ row is pinned as last visible row.
        // rowH is capped like the P&L statement (and the native matrix): rows keep
        // a font-bound height instead of stretching bars across a tall visual.
        // rowDensity scales the cap (compact 1.6 · normal 2.4 · airy 3.2)
        const headerH = Math.round(cf + 12);
        const rowH = Math.min(cf * cfg.rowDensity, Math.max(cf + 6, (region.h - pad * 2 - headerH) / n));
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
        // Σ-row placement: default below the body, "top" freezes it under the header
        // (body rows shift down one slot). Both stay frozen while the body scrolls.
        const sumTop = cfg.totalPos === "top";
        const shown = totalRow ? (sumTop ? [totalRow, ...bodyRows] : [...bodyRows, totalRow]) : bodyRows;

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
        // gemeinsame Nullachsen-Position für Δ-Balken- und Δ%-Pin-Spalte: beide
        // Nulllinien sitzen auf derselben relativen Spaltenposition, bemessen an
        // den tatsächlichen Negativ-/Positiv-Anteilen — einseitige Daten
        // verschenken nicht mehr die halbe Spalte, und die Achsen springen nicht
        // mehr gegeneinander (Beta-Feedback A. Korn, Fund 3)
        const negOf = (vals: (number | null)[]) => Math.max(0, ...vals.map(v => -(v ?? 0)));
        const posOf = (vals: (number | null)[]) => Math.max(0, ...vals.map(v => (v ?? 0)));
        const negD = Math.max(negOf(numPts.map(p => p.varAbs)), -cfg.varDomain[0], 0);
        const posD = Math.max(posOf(numPts.map(p => p.varAbs)), cfg.varDomain[1], 0);
        const negP = negOf(numPts.map(p => p.varRel));
        const posP = posOf(numPts.map(p => p.varRel));
        const neg2 = negOf(numPts.map(p => p.var2Abs));
        const pos2 = posOf(numPts.map(p => p.var2Abs));
        const shareOf = (nn: number, pp2: number) => (nn + pp2) > 0 ? nn / (nn + pp2) : 0;
        const zeroFrac = Math.min(0.85, Math.max(0.15,
            Math.max(shareOf(negD, posD), shareOf(negP, posP), shareOf(neg2, pos2))));
        // einheitliche px-pro-Einheit-Skala je Spalte (beide Seiten identisch)
        const unitOf = (room: number, nn: number, pp2: number) => {
            const u = Math.min(
                pp2 > 0 ? (room * (1 - zeroFrac) - 1) / pp2 : Infinity,
                nn > 0 ? (room * zeroFrac - 1) / nn : Infinity);
            return Number.isFinite(u) ? Math.max(0, u) : 0;
        };

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
        const scen = [cfg.scenL.ac, cfg.hasPy ? cfg.scenL.py : "", cfg.hasPl ? cfg.scenL.pl : ""].filter(v => v).join(" · ");
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
        txt(colX["val"].x + colX["val"].w, hy, `${cfg.scenL.ac}${marker("ac")}`, "end", hFont, true, cfg.subtle, bg);
        sortHit("ac", colX["val"]);
        for (const c of extraCols) {
            txt(colX[c.key].x + colX[c.key].w, hy, c.label, "end", hFont, true, cfg.subtle, bg);
        }
        if (colX["bars"] && scen !== cfg.scenL.ac) { txt(colX["bars"].x + 2, hy, scen, "start", hFont, true, cfg.subtle, bg); }
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
        // hover highlight layer, populated after the row loop (declared here so the
        // per-row mouseenter closures can reference it)
        let hoverRowG: SVGGElement | null = null;
        // draggable name-column edge (persisted width)
        this.drawNameResize(bg, colX["name"].x + colX["name"].w + gap / 2,
            region.y + pad, rowsBottom, region, cfg);
        // draggable numeric columns: AC value (+ its reference columns, all "val") and
        // the Δ column ("dval"); double-click fits to the longest visible cell. The
        // graphic columns share the remaining width, so they carry no handle.
        {
            const valFit = () => this.maxTextWidth(
                rowPts.filter(p => p.value != null).map(p => cfg.fmt.format(p.value as number)), cf) + 16;
            this.drawColWidthResize(bg, colX["val"].x + colX["val"].w + gap / 2,
                region.y + pad, rowsBottom, "val", valW, lf * 2.5, region.w * 0.3, valFit);
            for (const c of extraCols) {
                this.drawColWidthResize(bg, colX[c.key].x + colX[c.key].w + gap / 2,
                    region.y + pad, rowsBottom, "val", valW, lf * 2.5, region.w * 0.3, valFit);
            }
            if (colX["dval"]) {
                const dFit = () => this.maxTextWidth(
                    rowPts.filter(p => p.varAbs != null)
                        .map(p => this.fmtSigned(cfg.fmtVar, p.varAbs as number)), cf)
                    + 16 + (cfg.deltaIcons ? lf * 1.2 : 0);
                this.drawColWidthResize(bg, colX["dval"].x + colX["dval"].w + gap / 2,
                    region.y + pad, rowsBottom, "dval", dValW, lf * 2.5, region.w * 0.3, dFit);
            }
        }
        if (barScale && Math.min(barDomain[0], 0) < 0) {
            this.el("line", {
                x1: barScale(0), y1: top, x2: barScale(0), y2: rowsBottom,
                stroke: cfg.subtle, "stroke-width": 1
            }, bg);
        }
        const dAxis = colX["dbar"] ? colX["dbar"].x + 4 + zeroFrac * (colX["dbar"].w - 8) : 0;
        const dUnit = colX["dbar"] ? unitOf(colX["dbar"].w - 8, negD, posD) : 0;
        if (colX["dbar"]) {
            this.el("rect", { x: dAxis - 1, y: top, width: 2, height: rowsBottom - top, fill: cfg.colors.py }, bg);
        }
        const pctRoom = colX["pct"] ? colX["pct"].w - lf * 6 : 0;
        const pctAxis = colX["pct"] ? colX["pct"].x + lf * 3 + zeroFrac * pctRoom : 0;
        const pinUnit = colX["pct"] ? unitOf(pctRoom, negP, posP) : 0;
        if (colX["pct"]) {
            this.el("rect", { x: pctAxis - 1, y: top, width: 2, height: rowsBottom - top, fill: cfg.colors.py }, bg);
        }
        const d2Axis = colX["d2bar"] ? colX["d2bar"].x + 4 + zeroFrac * (colX["d2bar"].w - 8) : 0;
        const d2Unit = colX["d2bar"] ? unitOf(colX["d2bar"].w - 8, neg2, pos2) : 0;
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

            // zebra: shade every second body row (never the Σ row); off in hc
            const bodyAbs = row.isTotal ? -1 : (sumTop && totalRow ? scroll + i - 1 : scroll + i);
            if (cfg.zebra && !cfg.hc && bodyAbs >= 0 && bodyAbs % 2 === 1) {
                this.el("rect", {
                    x: region.x + pad, y, width: region.w - pad * 2, height: rowH,
                    fill: cfg.ink, "fill-opacity": 0.03
                }, bg);
            }
            // separators: subtle under every row (gridLines "none" drops them),
            // strong above subtotals stays regardless (structural, not a grid line)
            if (cfg.gridLines !== "none") {
                this.el("line", {
                    x1: region.x + pad, y1: y + rowH, x2: region.x + region.w - pad, y2: y + rowH,
                    stroke: cfg.subtle, "stroke-width": 0.6, "stroke-opacity": 0.4
                }, bg);
            }
            if (isAnchor(p)) {
                this.el("line", {
                    x1: region.x + pad, y1: y, x2: region.x + region.w - pad, y2: y,
                    stroke: cfg.ink, "stroke-width": 1.2
                }, bg);
            }
            if (this.isEmph(cfg, p.cat)) {
                this.emphBand(bg, region.x + pad, y + 1, region.w - pad * 2, rowH - 2, cfg);
            }

            const rowFont = Math.min(cf, rowH - 4);
            // "davon:"-style indent list: extra indent + subtle ink, no hierarchy field
            const davon = cfg.indentSet.has(p.cat.trim().toLowerCase());
            const indentX = (row.depth + (davon ? 1 : 0)) * Math.round(14 * k);
            const nameText = isParent
                ? `${row.expanded ? "▾" : "▸"} ${p.cat}`
                : p.cat;
            const nameEl = this.drawCatName(g,
                colX["name"].x + (sum && row.depth === 0 && !davon ? 0 : Math.round(6 * k)) + indentX,
                yMid, nameText, colX["name"].w - 8 - indentX, rowFont, rowH,
                sum && !davon, skip || davon ? cfg.subtle : cfg.ink);
            if (skip) { nameEl.setAttribute("font-style", "italic"); }
            const rowPct = isPct(p);
            const pctNf = new Intl.NumberFormat(this.host.locale, {
                minimumFractionDigits: 1, maximumFractionDigits: 1
            });
            // finance convention applies here too: one negative notation per table
            const pctText = (v: number) => this.financeFmt && v < 0
                ? `(${pctNf.format(Math.abs(v))} %)` : pctNf.format(v) + " %";
            const ppText = (v: number) => this.financeFmt && v < 0
                ? `(${pctNf.format(Math.abs(v))}Pp)`
                : (v > 0 ? "+" : v < 0 ? "−" : "") + pctNf.format(Math.abs(v)) + "Pp";
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
            const dIcon = (v: number, material: boolean) => !cfg.deltaIcons ? ""
                : (v === 0 || !material) ? "● " : v > 0 ? "▲ " : "▼ ";
            if (p.varAbs != null && colX["dval"] && cfg.showLabels) {
                const dTxt = rowPct ? ppText(p.varAbs)
                    : rf ? (this.financeFmt && p.varAbs < 0
                        ? `(${rf(Math.abs(p.varAbs))})`
                        : (p.varAbs > 0 ? "+" : p.varAbs < 0 ? "−" : "") + rf(Math.abs(p.varAbs)))
                    : this.fmtSigned(cfg.fmtVar, p.varAbs);
                txt(colX["dval"].x + colX["dval"].w, yMid + rowFont * 0.35,
                    dIcon(p.varAbs, cfg.isMaterial(p)) + dTxt, "end", rowFont, sum,
                    p.varAbs === 0 ? cfg.subtle : colOf(p.varAbs, p), g);
            }
            // numeric Δ% fallback column (pin column dropped on narrow tiles)
            if ((p.varRel != null || this.relNa(p)) && colX["dpctval"] && !rowPct && cfg.showLabels) {
                // basis ≤ 0 → "n.a." in neutral grey (UN 4.1)
                txt(colX["dpctval"].x + colX["dpctval"].w, yMid + rowFont * 0.35,
                    this.relText(p), "end", rowFont, sum,
                    p.varRel == null || p.varRel === 0 ? cfg.subtle : colOf(p.varRel, p), g);
            }
            if (p.varAbs != null && colX["dbar"] && !rowPct && rowChart) {
                const len = Math.abs(p.varAbs) * dUnit;
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
            if ((p.varRel != null || this.relNa(p)) && colX["pct"] && !rowPct && !rowChart && cfg.showLabels) {
                // Zahl bleibt in der Spaltenmitte (die Achse kann seitlich sitzen)
                txt(colX["pct"].x + colX["pct"].w / 2, yMid + rowFont * 0.35, this.relText(p),
                    "middle", Math.round(rowFont * 0.92), sum,
                    p.varRel != null ? colOf(p.varRel, p) : cfg.subtle, g);
            }
            if (p.varRel == null && this.relNa(p) && colX["pct"] && !rowPct && rowChart && cfg.showLabels) {
                // no pin for a basis ≤ 0 — "n.a." right of the pin axis instead
                txt(pctAxis + 6, yMid + rowFont * 0.35, REL_NA, "start",
                    Math.round(rowFont * 0.92), false, cfg.subtle, g);
            }
            if (p.varRel != null && colX["pct"] && !rowPct && rowChart) {
                // skip rows are excluded from the pin scale but keep their pin —
                // clamp per side so an outsized |Δ%| cannot push pin head and
                // label out of the region
                const dir = p.varRel >= 0 ? 1 : -1;
                const sideMax = Math.max(8, pctRoom * (dir > 0 ? 1 - zeroFrac : zeroFrac) - 1);
                const len = Math.min(sideMax, Math.abs(p.varRel) * pinUnit);
                const c = colOf(p.varRel, p);
                const r = Math.max(2.4, 3 * k);
                const endX = pctAxis + dir * Math.max(len, 2);
                this.el("line", { x1: pctAxis, y1: yMid, x2: endX, y2: yMid, stroke: c, "stroke-width": 2 }, g);
                this.pinHead(g, endX, yMid, r, "square", cfg.pinStyle, {
                    fill: p.isFc ? cfg.paper : cfg.ink, stroke: cfg.ink, "stroke-width": p.isFc ? 1 : 0
                });
                if (cfg.showLabels) {
                    txt(endX + dir * (r + 4), yMid + rowFont * 0.35, this.fmtPercent(p.varRel),
                        dir > 0 ? "start" : "end", Math.round(rowFont * 0.92), sum, cfg.ink, g);
                }
            }

            // ΔBasis2 (dual): number + Δ2 % number + bar (same notation as ΔBasis)
            if (hasVar2 && p.var2Abs != null && colX["d2val"] && cfg.showLabels) {
                txt(colX["d2val"].x + colX["d2val"].w, yMid + rowFont * 0.35,
                    dIcon(p.var2Abs, cfg.isMaterial(p, p.var2Abs, p.var2Rel))
                    + (rowPct ? ppText(p.var2Abs) : this.fmtSigned(cfg.fmtVar, p.var2Abs)), "end", rowFont, sum,
                    p.var2Abs === 0 ? cfg.subtle : colOf2(p.var2Abs, p), g);
            }
            if (hasVar2 && (p.var2Rel != null || this.relNa(p, true)) && colX["d2pctval"] && !rowPct && cfg.showLabels) {
                txt(colX["d2pctval"].x + colX["d2pctval"].w, yMid + rowFont * 0.35,
                    this.relText(p, true), "end", rowFont, sum,
                    p.var2Rel == null || p.var2Rel === 0 ? cfg.subtle : colOf2(p.var2Rel, p), g);
            }
            if (hasVar2 && p.var2Abs != null && colX["d2bar"] && !rowPct && rowChart) {
                const len = Math.abs(p.var2Abs) * d2Unit;
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

            // hover highlight: transient, drawn into the background layer (hoverRowG)
            // so text/bars stay readable; coexists with dimming (separate layer)
            if (this.allowInteractions) {
                g.addEventListener("mouseenter", () => {
                    this.clearNode(hoverRowG);
                    if (hoverRowG) { this.hoverBox(hoverRowG, region.x + pad, y + 0.5, region.w - pad * 2, rowH - 1, cfg); }
                });
                g.addEventListener("mouseleave", () => this.clearNode(hoverRowG));
            }

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
            this.catGroups.push({ g, sel: p.sel, dim: p.dim });
            this.animGroups.push([g]);
        });

        // vertical grid lines (gridLines "both"): dezente Spaltentrenner over the
        // zebra + horizontal separators, at each column's left boundary
        if (cfg.gridLines === "both") {
            for (const kk of Object.keys(colX)) {
                if (kk === "name") { continue; }
                const cx = colX[kk].x - gap / 2;
                this.el("line", {
                    x1: cx, y1: top, x2: cx, y2: rowsBottom,
                    stroke: cfg.subtle, "stroke-width": 0.6, "stroke-opacity": 0.35
                }, bg);
            }
        }
        // hover layer sits on top of the background (still under the marks)
        hoverRowG = this.el("g", { "pointer-events": "none" }, bg);

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
            const expanded = this.expandedRows.has(nd.key) || searchOn || this.exportAllOpen;
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
            const open = twoLv && nd.kids.length > 0
                && (this.colExpanded.has(`col¦${nd.label}`) || this.exportAllOpen);
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
                    value, isFc: false, basis, varAbs, dim: false,
                    varRel: ratio ? null : relVar(varAbs, basis),
                    var2Abs: null, var2Rel: null, bm: null, fcPrev: null, lineVal: null,
                    stackSeries: null, comment: null, commentNo: null,
                    group: points[0].group, rowType: ratio ? "pct" : "sum", isRest: false, sel: null
                };
            };
            // unauflösbare Formel: sichtbare "= ?"-Zeile statt lautlosem
            // Weglassen — analog zur flachen Tabelle (Backlog-Punkt)
            const fxErrRow = (label: string) => rows.push({
                label: `${label} = ?`, depth: 0, pts: null,
                agg: mkPoint(`${label} = ?`, null, false, null), formula: true
            });
            for (const entry of cfg.formulaRows.split(/[;\n]/)) {
                const eq = entry.indexOf("=");
                if (eq < 1) { continue; }
                const label = entry.slice(0, eq).trim();
                const expr = entry.slice(eq + 1).trim();
                if (!label || !expr) { continue; }
                const ratio = expr.split(/\s\/\s/);
                if (ratio.length > 2) { fxErrRow(label); continue; }
                const numT = parseTerms(ratio[0]);
                const denT = ratio.length === 2 ? parseTerms(ratio[1]) : null;
                if (!numT || (ratio.length === 2 && !denT)) { fxErrRow(label); continue; }
                const aggGet = (l2: string) => byLabel.get(l2)?.agg ?? null;
                const aggNum = evalTerms(numT, aggGet);
                const aggDen = denT ? evalTerms(denT, aggGet) : null;
                if (!aggNum || (denT && !aggDen)) { fxErrRow(label); continue; }
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
        // two-line compact mode: value on top, Δ (smaller) directly below it in the
        // same cell — no per-block Δ column and no mini Δ-bar, so a block is only as
        // wide as its value column and the matrix roughly halves in width. The
        // reference (value) columns stay as their own columns next to the value.
        const stacked = cfg.cellLayout === "stacked";
        // manual column widths (drag/auto-fit): "mxBlock" sets the per-block value
        // width for ALL blocks (uniform IBCS blocks), "mxSum" the Σ-block value width
        const cw = this.tableColWidths;
        const clampMxW = (w: number) => Math.max(lf * 2.5, Math.min(region.w * 0.5, w));
        const mxBlockSet = cw.mxBlock != null;

        // ------- widths: name column, per-block [AC (+Δ +bar)], Σ block [AC, Δ, Δ%]
        const nameW = this.tableNameW != null
            ? Math.max(40, Math.min(region.w * 0.5, this.tableNameW))
            : Math.min(region.w * 0.24, this.maxTextWidth(rows.map(r => r.label), cf) + 18
                + (hasLevels ? 14 * k : 0));
        let valW = mxBlockSet ? clampMxW(cw.mxBlock as number) : lf * 4.6;
        let dW = lf * (4.4 + (cfg.deltaIcons ? 1.2 : 0) + (this.financeFmt ? 0.5 : 0));
        let barW = Math.round(34 * k);
        const gap = 8;
        // optional numeric reference columns per block (print/board-ready
        // matrices) — same "value columns" setting as the flat table
        type MVCol = { label: string; get: (p: DataPoint) => number | null };
        const extraCols: MVCol[] = [];
        if (cfg.valueCols === "basis" && points.some(p => p.basis != null)) {
            extraCols.push({ label: cfg.basisLabel, get: p => p.basis });
        } else if (cfg.valueCols === "all") {
            if (cfg.hasPy) { extraCols.push({ label: cfg.scenL.py, get: p => p.py }); }
            if (cfg.hasPl) { extraCols.push({ label: cfg.scenL.pl, get: p => p.pl }); }
        }
        // the Σ block keeps fixed widths — the spread below only widens the blocks
        const sValW = cw.mxSum != null ? clampMxW(cw.mxSum) : valW, sDW = dW;
        const showSumRel = hasVar && cfg.showRel;
        // stacked: Δ (and Δ% in parentheses) move onto the line under the Σ value —
        // both right-aligned to the block edge; the block must fit the wider Δ line
        const sumStackW = Math.max(sValW, (hasVar ? sDW : 0) + (showSumRel ? lf * 3.8 : 0));
        const sumW = stacked
            ? sumStackW + gap
            : sValW + (hasVar ? sDW : 0) + (showSumRel ? lf * 3.6 : 0) + gap;
        const availW = region.w - pad * 2 - nameW - sumW - gap * 2;
        // in stacked mode the per-block Δ column and mini-bar are gone (Δ sits below
        // the value) — the block layout counts the value span only
        let showD = stacked ? false : showDelta;
        // the mini Δ-bar is the graphic twin of the flat table's Δ bar — same toggle
        let showBar = stacked ? false : (showDelta && cfg.showAbs);
        const vSpan = () => valW * (1 + extraCols.length);
        const blockW = () => vSpan() + (showD ? dW : 0) + (showBar ? barW : 0) + gap;
        // overflow strategy: drop the reference columns, then the mini bar, then
        // the per-block Δ, then shrink the value column, then cut blocks ("… +n")
        while (blocks.length * blockW() > availW && extraCols.length > 0) { extraCols.pop(); }
        if (blocks.length * blockW() > availW && showBar) { showBar = false; }
        if (blocks.length * blockW() > availW && showD) { showD = false; }
        // a manually set block width is respected: skip the value-column shrink and
        // let the block strip scroll instead (the degradation below still cuts for
        // static export tiles)
        if (blocks.length * blockW() > availW && !mxBlockSet) {
            valW = Math.max(lf * 3.4, availW / blocks.length - gap);
        }
        // last degradation step: interactive tiles scroll the block strip
        // horizontally (all blocks kept); export/print tiles keep the "… +n" cut,
        // since scrolled-away content would be unreachable in a static image
        let shownBlocks = blocks;
        let hScroll = false;
        if (blocks.length * blockW() > availW) {
            if (this.allowInteractions) {
                hScroll = true;
            } else {
                const fit = Math.max(1, Math.floor(availW / blockW()));
                shownBlocks = blocks.slice(0, fit);
            }
        }
        const cut = blocks.length - shownBlocks.length;
        // spread leftover width over the blocks (capped) so few blocks fill the tile —
        // skipped when the block width was set by hand (respect the user's choice)
        const spread = mxBlockSet ? 1 : Math.min(1.7, availW / Math.max(1, shownBlocks.length * blockW()));
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
        const totalBase = topAggs.filter(a => !isPct(a) && !isSkip(a) && !isResult(a) && !isSum(a));
        // only reserve/draw a Σ-row when it aggregates more than one top-level row —
        // keeps slot reservation (n/bodyCap/rowsBottom) in sync with the drawing
        const showTotalRow = cfg.showTotal && !noMatch
            && !topAggs.some(a => isSum(a) || isResult(a))
            && totalBase.length > 1;
        // Σ-row cell per block — shared by the Δ mini-bar domain and the row renderer
        const totalCellAt = (bi: number): DataPoint | null => {
            const base = totalBase
                .map((_, ti2) => cellFor(
                    (root.kids.get(root.order.filter(l => {
                        const a2 = aggFor(root.kids.get(l) as RNode);
                        return !isPct(a2) && !isSkip(a2) && !isResult(a2) && !isSum(a2);
                    })[ti2]) as RNode)?.pts ?? null, "Σ", shownBlocks[bi]))
                .filter(Boolean) as DataPoint[];
            return base.length > 0 ? this.aggregateHierarchy("Σ", base) : null;
        };
        const n = Math.max(1, rows.length + (showTotalRow ? 1 : 0));
        // capped like the flat table: font-bound row height, no stretching. In
        // stacked mode a row must fit two text lines (value + Δ below), so both the
        // floor and the density cap are raised to ≥ 2 line-steps + padding — rows
        // that no longer fit trigger the existing vertical scroll (maxRows uses the
        // same rowH). rowDensity still applies on top (compact keeps 2 lines).
        const stackH = Math.round(cf * 1.95) + 8;
        const rowFloor = stacked ? stackH : (cf + 6);
        const rowCap = stacked ? Math.max(cf * cfg.rowDensity, stackH) : cf * cfg.rowDensity;
        const rowH = Math.min(rowCap, Math.max(rowFloor, (region.h - pad * 2 - headerH) / n));
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
        // clipped/translated siblings for the horizontally scrollable block strip —
        // kept between bg and marks so block headers stay under the row marks, and
        // the block cells (marksScroll) stay above them. Two levels: an outer clip
        // group (fixed) so the clip window stays put, and an inner group that
        // carries the translate. Populated only in hScroll mode; empty and inert
        // otherwise (fit case stays pixel-identical).
        const bgScrollClip = this.el("g", {}, this.svg);
        const bgScroll = this.el("g", {}, bgScrollClip);
        const marks = this.el("g", {}, this.svg);
        const marksScrollClip = this.el("g", {}, this.svg);
        const marksScroll = this.el("g", {}, marksScrollClip);
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
        // same Δ direction icons as the flat table — matrix blocks and Σ column
        const dIcon = (v: number, material: boolean) => !cfg.deltaIcons ? ""
            : (v === 0 || !material) ? "● " : v > 0 ? "▲ " : "▼ ";

        // mini-bar Δ domain over the visible cells (stable while scrolling: all rows)
        let dDom = 1;
        if (showBar) {
            for (const r of rows) {
                for (let bi = 0; bi < shownBlocks.length; bi++) {
                    const d = deltaAt(r, bi);
                    if (d.v != null) { dDom = Math.max(dDom, Math.abs(d.v)); }
                }
            }
            // the Σ row draws mini-bars too — without its deltas in the domain its
            // (summed, therefore larger) bars would overrun the neighbouring column
            if (showTotalRow && !prevCol) {
                for (let bi = 0; bi < shownBlocks.length; bi++) {
                    const v = totalCellAt(bi)?.varAbs;
                    if (v != null) { dDom = Math.max(dDom, Math.abs(v)); }
                }
            }
        }

        // ------- column x positions
        const colX: { x: number; w: number }[] = [];
        let x = region.x + pad + nameW + gap;
        const subW = vSpan() + (showD ? dW : 0) + (showBar ? barW : 0);
        for (let bi = 0; bi < shownBlocks.length; bi++) {
            colX.push({ x, w: subW });
            x += subW + gap;
        }
        const sumX = { x, w: sumW - gap };
        // scroll mode pins the Σ block to the right edge; the block strip overflows
        // behind it (clipped) and translates under the fixed name / Σ columns
        if (hScroll) { sumX.x = region.x + region.w - pad - (sumW - gap); }

        // horizontal block viewport: name column stays left, Σ block stays right;
        // only the blocks + their headers live inside the clip and translate
        const viewX0 = region.x + pad + nameW + gap;
        const clipX0 = region.x + pad + nameW + gap / 2;
        const clipX1 = sumX.x - gap / 2;
        const lastBlock = colX[colX.length - 1];
        const contentRight = lastBlock ? lastBlock.x + lastBlock.w : viewX0;
        const maxScrollX = hScroll ? Math.max(0, contentRight - clipX1) : 0;
        const scrollX = hScroll
            ? Math.max(0, Math.min(this.tableScrollX.get(paneKey) ?? 0, maxScrollX)) : 0;
        if (hScroll) { this.tableScrollX.set(paneKey, scrollX); }
        // wire up the clip + translate on the two scroll siblings
        if (hScroll) {
            const clipId = `icd-mxclip-${this.instanceId}-${this.mxClipSeq++}`;
            const clip = this.el("clipPath", { id: clipId }, bg);
            this.el("rect", {
                x: clipX0, y: region.y, width: Math.max(0, clipX1 - clipX0), height: region.h
            }, clip);
            const tf = `translate(${-scrollX},0)`;
            // clip on the fixed outer groups (stays put); translate on the inner ones
            bgScrollClip.setAttribute("clip-path", `url(#${clipId})`);
            marksScrollClip.setAttribute("clip-path", `url(#${clipId})`);
            bgScroll.setAttribute("transform", tf);
            marksScroll.setAttribute("transform", tf);
            // cells never take pointer events — the full-width row rect below them
            // (in marks) keeps hover/click/tooltip working across the block strip
            marksScrollClip.style.pointerEvents = "none";
        }
        // block headers scroll with the strip; block cells too (per-row subgroups)
        const headerParent: SVGElement = hScroll ? bgScroll : bg;

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
                const open = this.colExpanded.has(`col¦${l0}`) || this.exportAllOpen;
                const hasKids = nd.kids.length > 0;
                const lbl = `${hasKids ? (open ? "▾ " : "▸ ") : ""}${l0}`;
                const ht = txt(spanX + spanW / 2, hy0, this.truncate(lbl, spanW, hFont),
                    "middle", hFont, true, cfg.ink, headerParent);
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
                }, headerParent);
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
                "end", hFont, true, cfg.subtle, headerParent);
            extraCols.forEach((c, ei) => {
                txt(colX[bi].x + valW * (2 + ei), hy, this.truncate(c.label, valW, hFont),
                    "end", hFont, true, cfg.subtle, headerParent);
            });
            if (showD) {
                txt(colX[bi].x + vSpan() + dW, hy, dHead, "end", hFont, true, cfg.subtle, headerParent);
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
        txt(sumX.x + (stacked ? sumX.w : sValW), hy, `Σ${marker("ac")}`, "end", hFont, true, cfg.ink, bg);
        sortHit("ac", sumX.x, (stacked ? sumX.w : sValW) + 4);
        // stacked: Δ (and Δ%) sit under the Σ value, so the Σ header stays a single
        // "Σ" column here; per-Δ / Δ% header sorting is available in columns mode
        if (hasVar && !stacked) {
            txt(sumX.x + sValW + sDW, hy, `Δ${cfg.basisLabel}${marker("dabs")}`, "end", hFont, true, cfg.subtle, bg);
            sortHit("dabs", sumX.x + sValW + 4, sDW);
            if (showSumRel) {
                txt(sumX.x + sumX.w, hy, `Δ${cfg.basisLabel} %${marker("drel")}`, "end", hFont, true, cfg.subtle, bg);
                sortHit("drel", sumX.x + sValW + sDW + 4, sumX.w - sValW - sDW - 4);
            }
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
        // column-group ±all: expand/collapse every collapsible level-0 block at once
        // (mirrors the row expand-all chevron; sits on the level-0 header line)
        if (twoLv && this.allowInteractions) {
            const allColKeys = colOrder.filter(nd => nd.kids.length > 0).map(nd => `col¦${nd.label}`);
            if (allColKeys.length > 0) {
                const allColOpen = allColKeys.every(kk => this.colExpanded.has(kk));
                const clabel = allColOpen
                    ? this.locStr("Btn_CollapseAllCols", "Collapse all columns")
                    : this.locStr("Btn_ExpandAllCols", "Expand all columns");
                const cc = txt(region.x + pad, hy0, allColOpen ? "⊟" : "⊞", "start", hFont, true, cfg.subtle, bg);
                const ctip = this.el("title", {}, cc);
                ctip.textContent = clabel;
                cc.setAttribute("role", "button");
                cc.setAttribute("aria-label", clabel);
                (cc as unknown as SVGGraphicsElement).style.cursor = "pointer";
                cc.addEventListener("click", (e: MouseEvent) => {
                    e.stopPropagation();
                    if (allColOpen) { allColKeys.forEach(kk => this.colExpanded.delete(kk)); }
                    else { allColKeys.forEach(kk => this.colExpanded.add(kk)); }
                    this.persistTableColExpanded();
                    this.rerender();
                });
            }
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
        const pctNf = new Intl.NumberFormat(this.host.locale, {
            minimumFractionDigits: 1, maximumFractionDigits: 1
        });
        // finance convention applies here too (same texts as the flat table)
        const pctText = (v: number) => this.financeFmt && v < 0
            ? `(${pctNf.format(Math.abs(v))} %)` : pctNf.format(v) + " %";
        const ppText = (v: number) => this.financeFmt && v < 0
            ? `(${pctNf.format(Math.abs(v))}Pp)`
            : (v > 0 ? "+" : v < 0 ? "−" : "") + pctNf.format(Math.abs(v)) + "Pp";
        // Σ-row placement + hover layers (assigned after the loop; the per-row
        // mouseenter/move closures reference them once populated)
        const sumTop = cfg.totalPos === "top";
        let hoverRowG: SVGGElement | null = null;
        let hoverColG: SVGGElement | null = null;
        const drawRow = (row: MRow | null, i: number) => {
            const isTotal = row == null;
            const y = top + i * rowH;
            const yMid = y + rowH / 2;
            const rowFont = Math.min(cf, rowH - 4);
            // stacked cell: value on the upper line, smaller Δ on the lower line —
            // in columns mode both collapse to the single centred baseline
            const stStep = Math.round(rowFont * 0.95);
            const stDFont = Math.max(8, Math.round(rowFont * 0.82));
            const valBaseY = stacked ? yMid - stStep * 0.5 + rowFont * 0.35 : yMid + rowFont * 0.35;
            const dBelowY = yMid + stStep * 0.5 + stDFont * 0.32;
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
            // zebra: shade every second body row (never the Σ row); off in hc
            const bodyAbs = isTotal ? -1 : (sumTop && showTotalRow ? scroll + i - 1 : scroll + i);
            if (cfg.zebra && !cfg.hc && bodyAbs >= 0 && bodyAbs % 2 === 1) {
                this.el("rect", {
                    x: region.x + pad, y, width: region.w - pad * 2, height: rowH,
                    fill: cfg.ink, "fill-opacity": 0.03
                }, bg);
            }
            if (cfg.gridLines !== "none") {
                this.el("line", {
                    x1: region.x + pad, y1: y + rowH, x2: region.x + region.w - pad, y2: y + rowH,
                    stroke: cfg.subtle, "stroke-width": 0.6, "stroke-opacity": 0.4
                }, bg);
            }
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
            const nameEl = this.drawCatName(g,
                region.x + pad + (sum && depth === 0 && !davon ? 0 : Math.round(6 * k)) + indentX,
                yMid, nameText, nameW - 8 - indentX, rowFont, rowH,
                sum && !davon, skip || davon ? cfg.subtle : cfg.ink);
            if (skip) { nameEl.setAttribute("font-style", "italic"); }
            // block cells go into a per-row scroll subgroup in hScroll mode (kept in
            // sync with the fixed row group for selection dimming + build animation),
            // else straight into g (fit case stays byte-for-byte the same)
            const bp = hScroll ? this.el("g", {}, marksScroll) as SVGGElement : g;
            for (let bi = 0; bi < shownBlocks.length; bi++) {
                const p2 = isTotal ? totalCellAt(bi) : cellAt(row as MRow, bi);
                if (p2 != null && p2.value != null) {
                    txt(colX[bi].x + valW, valBaseY, fmtCell(p2.value),
                        "end", rowFont, sum, rowPct || skip ? cfg.subtle : cfg.ink, bp);
                }
                // numeric reference columns (PY/PL or the variance basis)
                if (p2 != null) {
                    extraCols.forEach((c, ei) => {
                        const v = c.get(p2);
                        if (v != null) {
                            txt(colX[bi].x + valW * (2 + ei), valBaseY,
                                fmtCell(v), "end", rowFont, sum, cfg.subtle, bp);
                        }
                    });
                }
                // stacked: the Δ number sits on the lower line of the value cell
                // (no separate Δ column, no mini-bar); prevCol + deltaIcons apply
                if (stacked && showDelta && !rowPct) {
                    const d = isTotal
                        ? { v: p2?.varAbs ?? null, p: p2 }
                        : deltaAt(row as MRow, bi);
                    if (isTotal && prevCol) { d.v = null; }
                    if (d.v != null) {
                        txt(colX[bi].x + valW, dBelowY,
                            dIcon(d.v, d.p == null || cfg.isMaterial(d.p, d.v, null))
                            + this.fmtSigned(cfg.fmtVar, d.v), "end", stDFont,
                            false, colOf(d.v, d.p), bp);
                    }
                }
                if (showD && !rowPct) {
                    const d = isTotal
                        ? { v: p2?.varAbs ?? null, p: p2 }
                        : deltaAt(row as MRow, bi);
                    // Σ row in prevcol mode: change vs. previous block total
                    if (isTotal && prevCol) { d.v = null; }
                    if (d.v != null) {
                        txt(colX[bi].x + vSpan() + dW, yMid + rowFont * 0.35,
                            dIcon(d.v, d.p == null || cfg.isMaterial(d.p, d.v, null))
                            + this.fmtSigned(cfg.fmtVar, d.v), "end", Math.round(rowFont * 0.95),
                            sum, colOf(d.v, d.p), bp);
                    }
                    if (showBar && d.v != null) {
                        const axis = colX[bi].x + vSpan() + dW + barW / 2 + 2;
                        const len = Math.min(barW / 2 - 3, Math.abs(d.v) / dDom * (barW / 2 - 3));
                        const bh = Math.max(3, Math.min(rowH * 0.4, 9 * k));
                        this.el("rect", {
                            x: axis - 0.6, y: yMid - bh / 2 - 1, width: 1.2, height: bh + 2,
                            fill: cfg.colors.py
                        }, bp);
                        this.el("rect", {
                            x: d.v >= 0 ? axis + 0.8 : axis - 0.8 - len, y: yMid - bh / 2,
                            width: Math.max(len, 1), height: bh,
                            fill: colOf(d.v, d.p)
                        }, bp);
                    }
                }
            }
            // Σ block: row total with Δ and Δ% (right-aligned to the block edge
            // when stacked, so both lines line up)
            const sumValX = sumX.x + (stacked ? sumX.w : sValW);
            if (agg.value != null) {
                txt(sumValX, valBaseY, fmtCell(agg.value),
                    "end", rowFont, true, rowPct || skip ? cfg.subtle : cfg.ink, g);
            }
            if (hasVar && !rowPct && agg.varAbs != null) {
                if (stacked) {
                    // Σ value on top, ΔPY on the lower line; Δ% appended in parentheses
                    // when relative variance is on (its own column has no room here)
                    const rel = showSumRel && (agg.varRel != null || this.relNa(agg))
                        ? ` (${this.relText(agg)})` : "";
                    txt(sumValX, dBelowY,
                        dIcon(agg.varAbs, cfg.isMaterial(agg, agg.varAbs, agg.varRel))
                        + this.fmtSigned(cfg.fmtVar, agg.varAbs) + rel, "end", stDFont,
                        false, colOf(agg.varAbs, agg, agg.varRel), g);
                } else {
                    txt(sumX.x + sValW + sDW, yMid + rowFont * 0.35,
                        dIcon(agg.varAbs, cfg.isMaterial(agg, agg.varAbs, agg.varRel))
                        + this.fmtSigned(cfg.fmtVar, agg.varAbs), "end", Math.round(rowFont * 0.95),
                        sum, colOf(agg.varAbs, agg, agg.varRel), g);
                    if (showSumRel && agg.varRel != null) {
                        txt(sumX.x + sumX.w, yMid + rowFont * 0.35,
                            this.fmtPercent(agg.varRel), "end", Math.round(rowFont * 0.95),
                            sum, colOf(agg.varRel, agg, agg.varRel), g);
                    } else if (showSumRel && this.relNa(agg)) {
                        txt(sumX.x + sumX.w, yMid + rowFont * 0.35,
                            REL_NA, "end", Math.round(rowFont * 0.95), false, cfg.subtle, g);
                    }
                }
            }
            // pp deltas for %-rows (margin/formula ratio) in the Σ block
            if (rowPct && agg.varAbs != null && hasVar) {
                txt(stacked ? sumValX : sumX.x + sValW + sDW,
                    stacked ? dBelowY : yMid + rowFont * 0.35, ppText(agg.varAbs), "end",
                    stacked ? stDFont : Math.round(rowFont * 0.95), sum, colOf(agg.varAbs, agg), g);
            }
            this.el("rect", {
                x: region.x + pad, y, width: region.w - pad * 2, height: rowH,
                fill: cfg.paper, "fill-opacity": 0.01
            }, g);
            // hover highlight: row band (fixed bg layer) + column block under the
            // cursor (scroll layer in hScroll so it tracks + clips with the strip)
            if (this.allowInteractions) {
                const drawColHi = (e: MouseEvent) => {
                    if (!hoverColG) { return; }
                    this.clearNode(hoverColG);
                    const localX = e.clientX - this.svg.getBoundingClientRect().left;
                    const contentX = hScroll ? localX + scrollX : localX;
                    for (let bi = 0; bi < shownBlocks.length; bi++) {
                        if (contentX >= colX[bi].x && contentX < colX[bi].x + colX[bi].w) {
                            this.hoverBox(hoverColG, colX[bi].x, top, colX[bi].w, rowsBottom - top, cfg);
                            return;
                        }
                    }
                    if (!hScroll && localX >= sumX.x && localX < sumX.x + sumX.w) {
                        this.hoverBox(hoverColG, sumX.x, top, sumX.w, rowsBottom - top, cfg);
                    }
                };
                g.addEventListener("mouseenter", (e: MouseEvent) => {
                    this.clearNode(hoverRowG);
                    if (hoverRowG) { this.hoverBox(hoverRowG, region.x + pad, y + 0.5, region.w - pad * 2, rowH - 1, cfg); }
                    drawColHi(e);
                });
                g.addEventListener("mousemove", drawColHi);
                g.addEventListener("mouseleave", () => { this.clearNode(hoverRowG); this.clearNode(hoverColG); });
            }
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
            this.catGroups.push({ g, sel: agg.sel, dim: agg.dim });
            // the scroll subgroup dims + animates together with the fixed row group
            if (bp !== g) { this.catGroups.push({ g: bp, sel: agg.sel, dim: agg.dim }); }
            this.animGroups.push(bp !== g ? [g, bp] : [g]);
        };
        // Σ-row placement: "top" freezes it under the header (body shifts down one
        // slot), else it stays frozen below the body — both survive scrolling
        if (sumTop && showTotalRow) {
            drawRow(null, 0);
            bodyRows.forEach((row, i) => drawRow(row, i + 1));
        } else {
            bodyRows.forEach((row, i) => drawRow(row, i));
            if (showTotalRow) { drawRow(null, bodyRows.length); }
        }
        const rowsBottom = top + (bodyRows.length + (showTotalRow ? 1 : 0)) * rowH;

        // vertical grid lines (gridLines "both"): dezente Blocktrenner at each block's
        // left edge — inter-block dividers ride the scroll layer in hScroll mode
        if (cfg.gridLines === "both") {
            for (let bi = 0; bi < shownBlocks.length; bi++) {
                const cx = colX[bi].x - gap / 2;
                const vg = (hScroll && bi > 0) ? bgScroll : bg;
                this.el("line", {
                    x1: cx, y1: top, x2: cx, y2: rowsBottom,
                    stroke: cfg.subtle, "stroke-width": 0.6, "stroke-opacity": 0.35
                }, vg);
            }
        }
        // hover layers on top of the background (still under the row marks); the
        // column layer rides the scroll strip so its highlight tracks + clips
        hoverRowG = this.el("g", { "pointer-events": "none" }, bg);
        hoverColG = this.el("g", { "pointer-events": "none" }, hScroll ? bgScroll : bg);

        // Σ block separator + draggable name edge
        this.el("line", {
            x1: sumX.x - gap / 2, y1: region.y + pad, x2: sumX.x - gap / 2, y2: rowsBottom,
            stroke: cfg.subtle, "stroke-width": 0.8
        }, bg);
        this.drawNameResize(bg, region.x + pad + nameW + gap / 2,
            region.y + pad, rowsBottom, region, cfg);

        // uniform block-width handle on the first block's value edge (drives valW for
        // ALL blocks) + a handle on the Σ-block value edge. The block handle rides the
        // scroll strip so it stays on its edge; the Σ handle is fixed like the column.
        if (shownBlocks.length > 0 && colX[0]) {
            const blockFit = () => {
                let w = lf * 2.5;
                for (const r of rows) {
                    for (let bi = 0; bi < shownBlocks.length; bi++) {
                        const c = cellAt(r, bi);
                        if (c?.value != null) { w = Math.max(w, this.textWidth(cfg.fmt.format(c.value), cf)); }
                    }
                }
                return Math.round(w) + 14;
            };
            this.drawColWidthResize(hScroll ? bgScroll : bg, colX[0].x + valW,
                region.y + pad, rowsBottom, "mxBlock", valW, lf * 2.5, region.w * 0.5, blockFit);
        }
        {
            const sumFit = () => {
                let w = lf * 2.5;
                for (const r of rows) {
                    if (r.agg?.value != null) { w = Math.max(w, this.textWidth(cfg.fmt.format(r.agg.value), cf)); }
                }
                if (showTotalRow) {
                    const tot = this.aggregateHierarchy("Σ", totalBase);
                    if (tot.value != null) { w = Math.max(w, this.textWidth(cfg.fmt.format(tot.value), cf)); }
                }
                return Math.round(w) + 14;
            };
            this.drawColWidthResize(bg, sumX.x + (stacked ? sumX.w : sValW),
                region.y + pad, rowsBottom, "mxSum", sValW, lf * 2.5, region.w * 0.5, sumFit);
        }

        // ------- vertical scrollbar (same interaction pattern as the flat table)
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
        } else if (rows.length > bodyRows.length) {
            txt(region.x + pad, rowsBottom + cf,
                `… ${rows.length - bodyRows.length} ${this.locStr("Hint_MoreRows", "more rows (increase the visual height)")}`,
                "start", Math.round(cf * 0.9), false, cfg.subtle, bg);
        }

        // ------- horizontal block-strip scrollbar (scroll mode only): a slim track
        // under the blocks with a draggable thumb + keyboard (← → one block,
        // PageUp/Down one viewport). The Σ column and name column stay put.
        if (hScroll) {
            const setScrollX = (next: number) => {
                const cl = Math.max(0, Math.min(Math.round(next), Math.round(maxScrollX)));
                if (cl === Math.round(this.tableScrollX.get(paneKey) ?? 0)) { return; }
                this.tableScrollX.set(paneKey, cl);
                this.rerender();
            };
            const blockStep = subW + gap;
            const trackW = Math.max(0, clipX1 - viewX0);
            const contentSpan = Math.max(1, contentRight - viewX0);
            const trackY = Math.min(rowsBottom + 3, region.y + region.h - 5);
            this.el("rect", {
                x: viewX0, y: trackY, width: trackW, height: 3, rx: 1.5,
                fill: cfg.subtle, "fill-opacity": 0.18
            }, bg);
            const thumbW = Math.max(Math.min(24, trackW), trackW * trackW / contentSpan);
            const thumbX = viewX0 + (trackW - thumbW) * (maxScrollX > 0 ? scrollX / maxScrollX : 0);
            const thumb = this.el("rect", {
                x: thumbX, y: trackY - 1, width: thumbW, height: 5, rx: 2.5,
                fill: cfg.subtle, "fill-opacity": 0.75, role: "scrollbar", tabindex: "0",
                "aria-valuemin": 0, "aria-valuemax": Math.round(maxScrollX),
                "aria-valuenow": Math.round(scrollX), "aria-orientation": "horizontal",
                "aria-label": this.locStr("Matrix_ScrollX", "Scroll columns")
            }, this.svg) as SVGGraphicsElement;
            thumb.style.cursor = "grab";
            thumb.addEventListener("mousedown", (e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                const startX = e.clientX, startScroll = scrollX;
                const move = (ev: MouseEvent) => {
                    setScrollX(startScroll + (ev.clientX - startX) / Math.max(1, trackW) * contentSpan);
                };
                const up = () => {
                    window.removeEventListener("mousemove", move);
                    window.removeEventListener("mouseup", up);
                };
                window.addEventListener("mousemove", move);
                window.addEventListener("mouseup", up);
            });
            thumb.addEventListener("keydown", (e: KeyboardEvent) => {
                const step = e.key === "ArrowRight" ? blockStep : e.key === "ArrowLeft" ? -blockStep
                    : e.key === "PageDown" ? trackW : e.key === "PageUp" ? -trackW : 0;
                if (step === 0) { return; }
                e.preventDefault();
                e.stopPropagation();
                setScrollX((this.tableScrollX.get(paneKey) ?? 0) + step);
            });
        }

        // ------- unified wheel handler: shift-wheel or horizontal delta scrolls the
        // block strip (when it can); a plain vertical wheel scrolls the rows. Only
        // preventDefault when a scroll actually happens, so the page still scrolls
        // once a tile is at its edge.
        if (canScroll || hScroll) {
            const onWheel = (e: WheelEvent) => {
                const wantH = hScroll && (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY));
                if (wantH) {
                    const raw = (e.shiftKey && e.deltaX === 0) ? e.deltaY : (e.deltaX || e.deltaY);
                    const cur = this.tableScrollX.get(paneKey) ?? 0;
                    const cl = Math.max(0, Math.min(Math.round(cur + raw), Math.round(maxScrollX)));
                    if (cl !== Math.round(cur)) {
                        e.preventDefault();
                        e.stopPropagation();
                        this.tableScrollX.set(paneKey, cl);
                        this.rerender();
                    }
                    return;
                }
                if (canScroll) {
                    const mag = Math.max(1, Math.min(bodyCap, Math.round(Math.abs(e.deltaY) / 50)));
                    const cur = this.tableScroll.get(paneKey) ?? 0;
                    const cl = Math.max(0, Math.min(cur + (e.deltaY > 0 ? mag : -mag), maxScroll));
                    if (cl !== cur) {
                        e.preventDefault();
                        e.stopPropagation();
                        this.tableScroll.set(paneKey, cl);
                        this.rerender();
                    }
                }
            };
            bg.addEventListener("wheel", onWheel, { passive: false });
            marks.addEventListener("wheel", onWheel, { passive: false });
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
            // decimals: zeros after the last "." (PBI convention); a "," only counts
            // as decimal separator in bare German-style patterns ("0,0") — never in
            // the grouping idiom "#,0", where it means thousands separation
            const mDot = pat.match(/\.(0+)(?!.*\.0)/);
            const mComma = !mDot && !pat.includes(".")
                ? pat.match(/(?:^|[^#]),(0+)(?!.*,0)/) : null;
            const decs = mDot ? mDot[1].length : mComma ? mComma[1].length : 0;
            const grouping = pat.includes("#") || /,(?!0)/.test(pat) || pat.includes(",0");
            const nf = new Intl.NumberFormat(this.host.locale, {
                minimumFractionDigits: decs, maximumFractionDigits: decs, useGrouping: grouping
            });
            // finance convention applies to per-row formats too (negatives in
            // parentheses); delta sites pass Math.abs and add their own sign
            out.set(label, (v: number) => {
                if (this.financeFmt && v < 0) {
                    return pct ? `(${nf.format(-v * 100)} %)` : `(${nf.format(-v)})`;
                }
                return pct ? `${nf.format(v * 100)} %` : nf.format(v);
            });
        }
        return out;
    }

    /** merges points that repeat per matrix-column value back to one per category.
     *  keepCols: the matrix columns stay apart (table + Trend role — only the periods
     *  merge); keepTrend: the periods stay apart (KPI cards + Trend role) */
    private mergeColPoints(points: DataPoint[], keepCols = false, keepTrend = false): DataPoint[] {
        const order: string[] = [];
        const byKey = new Map<string, DataPoint[]>();
        for (const p of points) {
            let key = `${p.group ?? ""}¦${p.stackSeries ?? ""}¦${p.cat}`;
            if (keepCols) { key += `¦c:${(p.colLevels ?? []).join("¦")}`; }
            if (keepTrend) { key += `¦t:${p.trend ?? ""}`; }
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
            // scatter measures are summed like AC, so a merged point keeps its X/size
            const sumOf = (get: (c: DataPoint) => number | null | undefined): number | null => {
                let acc: number | null = null;
                for (const c of kids) { const v = get(c); if (v != null) { acc = (acc ?? 0) + v; } }
                return acc;
            };
            agg.xVal = sumOf(c => c.xVal);
            agg.xPrev = sumOf(c => c.xPrev);
            agg.sizeVal = sumOf(c => c.sizeVal);
            agg.comment = kids[0].comment;
            agg.commentNo = kids[0].commentNo;
            agg.sel = kids[0].sel;
            if (keepCols) { agg.colLevels = kids[0].colLevels; }
            if (keepTrend) {
                agg.trend = kids[0].trend;
                agg.trendOrd = kids[0].trendOrd;
            }
            return agg;
        });
    }

    /**
     * KPI cards + Trend role: folds the period rows of every card (group × series ×
     * category) into ONE card point that carries its time series over the common
     * period axis. Card value: "last" (default) takes AC/PY/PL/FC/BM and all
     * variances from the card's reference period — the last period with an actual
     * (pure FC cards: the last period with a value) — so Δ and status compare like
     * with like; "sum" sums every scenario over all periods (Σ-treu wie Top-N/Rest).
     */
    private aggregateTrendCards(points: DataPoint[], useSum: boolean): { points: DataPoint[]; labels: string[] } {
        // common period axis: sort key per label (stable sort keeps first appearance)
        const ordOf = new Map<string, number>();
        for (const p of points) {
            const t = p.trend ?? "";
            if (!ordOf.has(t)) { ordOf.set(t, p.trendOrd ?? ordOf.size); }
        }
        const labels = [...ordOf.keys()].sort((a, b) => (ordOf.get(a) as number) - (ordOf.get(b) as number));
        const idxOf = new Map(labels.map((l, i) => [l, i] as [string, number]));
        const order: string[] = [];
        const byKey = new Map<string, DataPoint[]>();
        for (const p of points) {
            const key = `${p.group ?? ""}¦${p.stackSeries ?? ""}¦${p.cat}`;
            const b = byKey.get(key);
            if (b) { b.push(p); } else { byKey.set(key, [p]); order.push(key); }
        }
        const out = order.map(key => {
            const kids = byKey.get(key) as DataPoint[];
            // one point per period (duplicates — e.g. an unmerged series — are summed)
            const perIdx: (DataPoint | null)[] = labels.map(() => null);
            for (const c of kids) {
                const i = idxOf.get(c.trend ?? "") as number;
                const prev = perIdx[i];
                if (prev == null) { perIdx[i] = c; continue; }
                const agg = this.aggregateHierarchy(c.cat, [prev, c]);
                agg.isFc = prev.isFc && c.isFc;
                agg.bm = prev.bm != null || c.bm != null ? (prev.bm ?? 0) + (c.bm ?? 0) : null;
                perIdx[i] = agg;
            }
            const series: (TrendPt | null)[] = perIdx.map(d => d == null ? null : {
                ac: d.ac, py: d.py, pl: d.pl, fc: d.fc, value: d.value, isFc: d.isFc
            });
            const ref = this.trendRefIdx(series);
            const first = kids[0];
            let card: DataPoint;
            if (useSum) {
                card = this.aggregateHierarchy(first.cat, kids);
                card.isFc = kids.every(c => c.isFc);
                let bm: number | null = null;
                for (const c of kids) { if (c.bm != null) { bm = (bm ?? 0) + c.bm; } }
                card.bm = bm;
            } else {
                const refPt = (ref >= 0 ? perIdx[ref] : null) ?? first;
                card = { ...refPt };
                card.dim = kids.every(c => c.dim);
            }
            card.cat = first.cat;
            card.catLevels = first.catLevels;
            card.colLevels = null;
            card.group = first.group;
            card.stackSeries = first.stackSeries;
            card.rowType = first.rowType;
            card.sel = first.sel;
            card.comment = kids.find(c => c.comment != null)?.comment ?? null;
            card.trend = null;
            card.trendSeries = series;
            card.trendRef = ref;
            return card;
        });
        // comment markers were numbered per period row — renumber per card
        let no = 0;
        for (const p of out) { p.commentNo = p.comment != null ? ++no : null; }
        return { points: out, labels };
    }

    /** reference period of a trend series: last period with an actual, else last with a value */
    private trendRefIdx(series: (TrendPt | null)[]): number {
        for (let i = series.length - 1; i >= 0; i--) {
            const t = series[i];
            if (t && t.value != null && !t.isFc) { return i; }
        }
        for (let i = series.length - 1; i >= 0; i--) {
            if (series[i]?.value != null) { return i; }
        }
        return -1;
    }

    /** period-wise sum of several cards' trend series (Σ tile, Rest / immaterial
     *  collector card) — null when a card has no series or the axes differ */
    private sumTrendSeries(kids: DataPoint[]): { series: (TrendPt | null)[]; ref: number } | null {
        if (kids.length === 0 || kids.some(c => !c.trendSeries)) { return null; }
        const len = (kids[0].trendSeries as (TrendPt | null)[]).length;
        if (kids.some(c => (c.trendSeries as (TrendPt | null)[]).length !== len)) { return null; }
        const add = (a: number | null, b: number | null | undefined) =>
            b == null ? a : (a ?? 0) + b;
        const series: (TrendPt | null)[] = [];
        for (let i = 0; i < len; i++) {
            let acc: TrendPt | null = null;
            let allFc = true;
            for (const c of kids) {
                const t = (c.trendSeries as (TrendPt | null)[])[i];
                if (!t) { continue; }
                acc = acc ?? { ac: null, py: null, pl: null, fc: null, value: null, isFc: false };
                acc.ac = add(acc.ac, t.ac);
                acc.py = add(acc.py, t.py);
                acc.pl = add(acc.pl, t.pl);
                acc.fc = add(acc.fc, t.fc);
                acc.value = add(acc.value, t.value);
                if (t.value != null && !t.isFc) { allFc = false; }
            }
            if (acc) { acc.isFc = acc.value != null && allFc; }
            series.push(acc);
        }
        return { series, ref: this.trendRefIdx(series) };
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
        const varRel = relVar(varAbs, basis);
        // secondary basis summed directly from the scenario fields — reconstructing it
        // from var2Abs dropped points whose AC/FC is missing
        const basis2 = this.basis2Mode === "plan" ? pl : py;
        const var2Abs = (value != null && basis2 != null) ? value - basis2 : null;
        const var2Rel = relVar(var2Abs, basis2);
        return {
            cat: key, catLevels: null,
            ac, py, pl, fc, value, isFc: false, basis, varAbs, varRel, var2Abs, var2Rel,
            dim: kids.length > 0 && kids.every(c => c.dim),
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
            // KPI cards + Trend role: the Σ / Rest tile keeps a summed time series
            const ts = this.sumTrendSeries(kids);
            if (ts) { agg.trendSeries = ts.series; agg.trendRef = ts.ref; }
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
                return { v, rel: relVar(v, p.bm) };
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
            // ties on the primary key (equal |Δ%|) break by absolute deviation, larger first
            const absMag = (p: DataPoint): number => {
                const v = statusDev(p).v;
                return v == null ? 0 : Math.abs(v);
            };
            pts.sort((a, b) => {
                const ka = key(a), kb = key(b);
                if (ka == null && kb == null) { return 0; }
                if (ka == null) { return 1; }
                if (kb == null) { return -1; }
                const prim = cfg.cardSort === "deviation" ? kb - ka : dir * (ka - kb);
                return prim !== 0 ? prim : absMag(b) - absMag(a);
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
                fill: emph ? cfg.wash : cfg.paper,
                stroke: emph ? cfg.ink : cfg.faint,
                "stroke-width": emph ? 1.6 : 1
            }, g);
            // status source: the variance basis (ΔPL/ΔPY) or the bound benchmark —
            // monitoring mode judges AC against BM (target/threshold measure)
            const bmV = (p.bm != null && p.value != null) ? (p.value as number) - p.bm : null;
            // Δ% vs. BM: "n.a." at a zero benchmark or a sign change (UN 4.1)
            const bmRel: number | null | "na" = bmV == null ? null
                : relVar(bmV, p.bm) ?? (relIsNa(bmV, p.bm) ? "na" : null);
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
                rx: Math.round(3 * k), fill: stripeCol,
                // 1.49 high contrast: the stripe carries the status as a pattern
                ...(cfg.hc ? this.hcStatus(neutral ? "neutral" : good(sv.v as number, p) ? "good" : "bad", cfg) : {})
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
            // — but value and Δ rows of ONE card share that unit (S13)
            const pInt = [p.value, p.py, p.pl, p.fc].every(v => v == null || Number.isInteger(v));
            const magP = Math.max(
                Math.abs(p.value ?? 0), Math.abs(p.basis ?? 0), Math.abs(p.py ?? 0), Math.abs(p.pl ?? 0));
            const magVarP = Math.max(
                Math.abs(p.varAbs ?? 0), Math.abs(p.var2Abs ?? 0), Math.abs(bmV ?? 0));
            const fmtP = this.makeFormatter(Math.max(magP, magVarP), pInt);
            const fmtVarP = this.makeVarFormatter(magP, magVarP, pInt);
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
            // vRel "na": the basis is ≤ 0 — the row says so instead of a bogus percentage
            const refText = (vAbs: number, vRel: number | null | "na") =>
                `${this.fmtSigned(fmtVarP, vAbs)}${vRel === "na" ? ` · ${REL_NA}`
                    : vRel != null ? ` · ${this.fmtPercent(vRel)}` : ""}`;
            // value column starts past the widest actual row label ("ΔFC Vm" is wider than
            // the old fixed 2.6-char slot) so the value never overpaints the label
            let refLabelW = refF * 2.6;
            // plain = a reference VALUE row ("PY  45.200") instead of a variance row
            // ("ΔPY  −1.200 · −2,6 %"): no Δ prefix, no status color, not bold — the
            // variance keeps the visual weight
            const refRowAt = (tx: number, ty: number, label: string,
                vAbs: number | null, vRelCell: number | null | "na", plain = false) => {
                if (vAbs == null) { return; }
                const vRel = vRelCell === "na" ? null : vRelCell;
                if (plain) {
                    txt(tx, ty, label, refF, false, cfg.subtle);
                    txt(tx + refLabelW, ty, fmtP.format(vAbs), refF, false, cfg.ink);
                    return;
                }
                const col = (vAbs === 0 || !cfg.isMaterial(p, vAbs, vRel) || !hlShow(vAbs, p))
                    ? cfg.subtle : (good(vAbs, p) ? cfg.colors.good : cfg.colors.bad);
                const icon = !cfg.deltaIcons ? ""
                    : (vAbs === 0 || !cfg.isMaterial(p, vAbs, vRel)) ? "● "
                    : vAbs > 0 ? "▲ " : "▼ ";
                txt(tx, ty, `Δ${label}`, refF, false, cfg.subtle);
                txt(tx + refLabelW, ty, icon + refText(vAbs, vRelCell), refF, true, col);
            };
            // mini bridge basis → Δ → AC in IBCS notation; byBottom is the axis line
            const drawBridge = (bx: number, byBottom: number, bw2: number, bridgeH: number) => {
                if (p.basis == null) { return; }
                // signed scale: domain spans zero, negatives grow downward from the
                // zero line instead of flipping upward via Math.abs
                const lo0 = Math.min(0, p.basis, p.value as number);
                const hi0 = Math.max(0, p.basis, p.value as number);
                const sc = bridgeH / Math.max(hi0 - lo0, 1e-9);
                const zeroY = byBottom + lo0 * sc;   // == byBottom when nothing is negative
                const yOf = (v: number) => zeroY - v * sc;
                const barY = (v: number) => Math.min(yOf(v), zeroY);
                const barH = (v: number) => Math.max(1.5, Math.abs(v) * sc);
                const colW = Math.min(44 * k, bw2 / 3.6);
                const step2 = bw2 / 3;
                const cxs = [bx + step2 / 2, bx + step2 * 1.5, bx + step2 * 2.5];
                // baseline in the notation of the basis scenario
                if (cfg.basisMode === "py") {
                    this.el("line", { x1: bx, y1: zeroY, x2: bx + bw2, y2: zeroY, stroke: cfg.colors.py, "stroke-width": 3 }, g);
                } else {
                    this.el("line", { x1: bx, y1: zeroY - 1.2, x2: bx + bw2, y2: zeroY - 1.2, stroke: cfg.colors.pl, "stroke-width": 1 }, g);
                    this.el("line", { x1: bx, y1: zeroY + 1.2, x2: bx + bw2, y2: zeroY + 1.2, stroke: cfg.colors.pl, "stroke-width": 1 }, g);
                }
                const basisStyle = cfg.basisMode === "plan"
                    ? { fill: cfg.paper, stroke: cfg.colors.pl, "stroke-width": 1.3 }
                    : cfg.basisMode === "fcrev"
                    ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1 }
                    : cfg.hc
                        ? { fill: cfg.paper, stroke: cfg.colors.py, "stroke-width": 1.2, "stroke-dasharray": "3,2" }
                        : { fill: cfg.colors.py };
                this.el("rect", { x: cxs[0] - colW / 2, y: barY(p.basis), width: colW, height: barH(p.basis), ...basisStyle }, g);
                if (p.varAbs != null && p.varAbs !== 0) {
                    const lo = Math.min(p.basis, p.value as number), hi = Math.max(p.basis, p.value as number);
                    const dTop = yOf(hi), dH = Math.max(1.5, (hi - lo) * sc);
                    const dCol = (!cfg.isMaterial(p) || !hlShow(p.varAbs, p)) ? cfg.colors.py
                        : (good(p.varAbs, p) ? cfg.colors.good : cfg.colors.bad);
                    const dNeutral = !cfg.isMaterial(p) || !hlShow(p.varAbs, p);
                    this.el("rect", {
                        x: cxs[1] - colW / 2, y: dTop, width: colW, height: dH,
                        ...(p.isFc && cfg.isMaterial(p)
                            ? { fill: `url(#${good(p.varAbs, p) ? cfg.patGood : cfg.patBad})`, stroke: dCol, "stroke-width": 1 }
                            : cfg.hc
                                ? this.hcStatus(dNeutral ? "neutral" : good(p.varAbs, p) ? "good" : "bad", cfg)
                                : { fill: dCol })
                    }, g);
                    this.el("line", {
                        x1: cxs[0] + colW / 2, y1: yOf(p.basis), x2: cxs[1] - colW / 2, y2: yOf(p.basis),
                        stroke: cfg.subtle, "stroke-width": 1
                    }, g);
                    this.el("line", {
                        x1: cxs[1] + colW / 2, y1: yOf(p.value as number), x2: cxs[2] - colW / 2, y2: yOf(p.value as number),
                        stroke: cfg.subtle, "stroke-width": 1
                    }, g);
                }
                this.el("rect", {
                    x: cxs[2] - colW / 2, y: barY(p.value as number), width: colW, height: barH(p.value as number),
                    ...(p.isFc
                        ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1 }
                        : { fill: cfg.colors.ac })
                }, g);
                const legF = Math.round(8 * k);
                txt(cxs[0], byBottom + legF + 2, cfg.basisLabel, legF, false, cfg.subtle, "middle");
                txt(cxs[1], byBottom + legF + 2, "Δ", legF, false, cfg.subtle, "middle");
                txt(cxs[2], byBottom + legF + 2, cfg.hasFc && p.isFc ? cfg.scenL.fc : cfg.scenL.ac, legF, false, cfg.subtle, "middle");
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
                    fill: cfg.band,
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

            // trend mini chart (Trend role): the card's own time series as sparkline or
            // mini columns. Scale PER CARD like the bullet — KPI tiles mix units
            // (€, %, pieces), a shared scale would flatten all but the largest. The
            // sparkline spans the data range (no zero anchor needed for a line), the
            // columns are zero-based. byBottom is the plot floor; the first/last period
            // labels sit below it in the legend row like the bridge legend
            const drawTrend = (bx: number, byBottom: number, bw: number, bh: number) => {
                const ser = p.trendSeries;
                if (!ser || ser.length === 0) { return; }
                const nT = ser.length;
                const ref = p.trendRef ?? -1;
                const asCols = cfg.cardTrend === "columns";
                const showPy = !asCols && cfg.hasPy && ser.some(t => t?.py != null);
                const vals: number[] = [];
                for (const t of ser) {
                    if (!t) { continue; }
                    if (t.value != null) { vals.push(t.value); }
                    if (showPy && t.py != null) { vals.push(t.py); }
                }
                if (vals.length === 0) { return; }
                let lo = Math.min(...vals), hi = Math.max(...vals);
                if (asCols) { lo = Math.min(0, lo); hi = Math.max(0, hi); }
                if (hi - lo < 1e-9) {
                    const d = Math.abs(hi) * 0.1 || 1;
                    lo -= asCols && lo === 0 ? 0 : d;
                    hi += d;
                }
                // last value, small: right of the plot when the reference period is the
                // last one (room reserved in x), else above its mark (a forecast tail
                // continues to the right — room reserved on top instead)
                const lblF = Math.max(8, Math.round(cfg.labelFont * 0.85));
                const refPt = ref >= 0 ? ser[ref] : null;
                const lastText = refPt && refPt.value != null ? fmtP.format(refPt.value) : "";
                const atEnd = ref === nT - 1;
                let lblW = 0, headroom = 0;
                if (lastText && atEnd) {
                    lblW = this.textWidth(lastText, lblF) + Math.round(6 * k);
                    if (bw - lblW < 40 * k) { lblW = 0; }
                } else if (lastText && bh - lblF - 3 >= 14 * k) {
                    headroom = lblF + 3;
                }
                const showLbl = lblW > 0 || headroom > 0;
                const plotW = bw - lblW;
                const mr = Math.max(2.2, 2.6 * k);
                const yOf = linearScale(lo, hi, byBottom - (asCols ? 0 : mr), byBottom - bh + mr + 1 + headroom);
                const lblY = (v: number) => Math.max(byBottom - bh + lblF * 0.8,
                    Math.min(byBottom, yOf(v) + lblF * 0.35));
                const tg = this.el("g", {}, g);
                // label anchor of the reference period: x center, y above its mark
                let markX = bx + plotW, markY = byBottom;
                if (asCols) {
                    const band = plotW / nT;
                    const barW = Math.max(1, band * 0.7);
                    const zeroY = yOf(0);
                    ser.forEach((t, i) => {
                        if (!t || t.value == null) { return; }
                        const bxI = bx + i * band + (band - barW) / 2;
                        const yv = yOf(t.value);
                        const isRef = i === ref;
                        const style: Record<string, string | number> = t.isFc
                            ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 0.8 }
                            : cfg.hc && !isRef
                                ? { fill: cfg.paper, stroke: cfg.ink, "stroke-width": 0.8 }
                                : { fill: cfg.colors.ac };
                        // last (reference) column at full strength, the history muted —
                        // still clearly darker than the PY grey (PY is not plotted here)
                        if (!isRef && !cfg.hc) { style["fill-opacity"] = t.isFc ? 0.7 : 0.55; }
                        this.el("rect", {
                            x: bxI, y: Math.min(yv, zeroY), width: barW,
                            height: Math.max(1, Math.abs(yv - zeroY)), ...style
                        }, tg);
                        // negative bar: label above the zero line (the bar hangs below it)
                        if (isRef) { markX = bxI + barW / 2; markY = Math.min(yv, zeroY); }
                    });
                    this.el("line", {
                        x1: bx, y1: zeroY, x2: bx + plotW, y2: zeroY,
                        stroke: cfg.subtle, "stroke-width": 1
                    }, tg);
                } else {
                    const xOf = (i: number) => nT === 1 ? bx + plotW / 2
                        : bx + mr + i * (plotW - 2 * mr) / (nT - 1);
                    // PY as thin grey line behind (dotted in high contrast)
                    if (showPy) {
                        let dPy = "";
                        let prevOk = false;
                        ser.forEach((t, i) => {
                            if (!t || t.py == null) { prevOk = false; return; }
                            dPy += `${prevOk ? "L" : "M"}${xOf(i).toFixed(1)},${yOf(t.py).toFixed(1)}`;
                            prevOk = true;
                        });
                        if (dPy) {
                            this.el("path", {
                                d: dPy, fill: "none", stroke: cfg.hc ? cfg.ink : cfg.colors.py,
                                "stroke-width": Math.max(1, 1.1 * k), "stroke-linejoin": "round",
                                ...(cfg.hc ? { "stroke-dasharray": "1,2" } : {})
                            }, tg);
                        }
                    }
                    // AC line: solid for actuals, dashed into forecast periods (IBCS FC)
                    let dAc = "", dFc = "";
                    for (let i = 1; i < nT; i++) {
                        const a = ser[i - 1], b = ser[i];
                        if (!a || !b || a.value == null || b.value == null) { continue; }
                        const seg = `M${xOf(i - 1).toFixed(1)},${yOf(a.value).toFixed(1)}L${xOf(i).toFixed(1)},${yOf(b.value).toFixed(1)}`;
                        if (b.isFc) { dFc += seg; } else { dAc += seg; }
                    }
                    const lw = Math.max(1.4, 1.6 * k);
                    if (dAc) {
                        this.el("path", {
                            d: dAc, fill: "none", stroke: cfg.colors.ac, "stroke-width": lw,
                            "stroke-linejoin": "round", "stroke-linecap": "round"
                        }, tg);
                    }
                    if (dFc) {
                        this.el("path", {
                            d: dFc, fill: "none", stroke: cfg.colors.ac, "stroke-width": lw,
                            "stroke-dasharray": `${Math.round(3 * k)},${Math.round(2 * k)}`
                        }, tg);
                    }
                    // isolated periods (gaps on both sides) would vanish — small dot
                    ser.forEach((t, i) => {
                        if (!t || t.value == null || i === ref) { return; }
                        const lone = (i === 0 || ser[i - 1]?.value == null)
                            && (i === nT - 1 || ser[i + 1]?.value == null);
                        if (lone) {
                            this.el("circle", { cx: xOf(i), cy: yOf(t.value), r: lw * 0.8, fill: cfg.colors.ac }, tg);
                        }
                    });
                    if (refPt && refPt.value != null) {
                        markX = xOf(ref);
                        markY = yOf(refPt.value);
                        this.el("circle", {
                            cx: markX, cy: markY, r: mr,
                            ...(refPt.isFc
                                ? { fill: cfg.paper, stroke: cfg.colors.ac, "stroke-width": 1.2 }
                                : { fill: cfg.colors.ac })
                        }, tg);
                        markY -= mr;
                    }
                }
                if (showLbl && refPt && refPt.value != null) {
                    const lt = this.el("text", {
                        x: atEnd ? bx + plotW + Math.round(4 * k) : markX,
                        y: atEnd ? lblY(refPt.value) : Math.max(byBottom - bh + lblF * 0.8, markY - 3),
                        "text-anchor": atEnd ? "start" : "middle",
                        "font-size": lblF, fill: cfg.ink, "font-family": FONT, "font-weight": 600,
                        stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
                    }, tg);
                    lt.textContent = lastText;
                }
                // period legend: first and last period of the common axis
                const legF = Math.round(8 * k);
                if (nT >= 2 && cfg.trendLabels.length === nT) {
                    txt(bx, byBottom + legF + 2, cfg.trendLabels[0], legF, false, cfg.subtle, "start");
                    txt(bx + plotW, byBottom + legF + 2, cfg.trendLabels[nT - 1], legF, false, cfg.subtle, "end");
                }
            };
            // trend chart active: it takes the mini bridge's place (bullet independent);
            // cards without a series (none here) simply keep the area empty
            const trendOn = cfg.cardTrend !== "off";

            // Δ reference rows: variance basis, second basis, benchmark — in
            // benchmark-status mode the BM row leads (it carries the judgement)
            const deltaRows: [string, number, number | null | "na", boolean][] = [];
            if (p.varAbs != null) {
                deltaRows.push([cfg.basisLabel, p.varAbs, p.varRel ?? (this.relNa(p) ? "na" : null), false]);
            }
            if (p.var2Abs != null) {
                deltaRows.push([cfg.basis2Label, p.var2Abs, p.var2Rel ?? (this.relNa(p, true) ? "na" : null), false]);
            }
            if (bmV != null) {
                if (cfg.cardBasis === "benchmark") { deltaRows.unshift(["BM", bmV, bmRel, false]); }
                else { deltaRows.push(["BM", bmV, bmRel, false]); }
            }
            // reference VALUES ahead of the variances (beta wish): a card that only
            // ever showed "ΔPY −1.200" now also states what PY actually was. "basis"
            // adds the comparison basis alone, "all" every other bound scenario.
            const valRows: [string, number, number | null | "na", boolean][] = [];
            if (cfg.cardRefVals !== "off") {
                const seen = new Set<string>();
                const addVal = (lbl: string, v: number | null) => {
                    if (v == null || seen.has(lbl)) { return; }
                    seen.add(lbl);
                    valRows.push([lbl, v, null, true]);
                };
                if (cfg.cardRefVals === "basis") {
                    addVal(cfg.basisLabel, p.basis);
                } else {
                    addVal(cfg.scenL.py, p.py);
                    addVal(cfg.scenL.pl, p.pl);
                    // a pure FC period already shows the FC as the big number
                    if (!p.isFc) { addVal(cfg.scenL.fc, p.fc); }
                    addVal("BM", p.bm);
                }
            }
            const refRows: [string, number, number | null | "na", boolean][] = [...valRows, ...deltaRows];
            refLabelW = Math.max(refLabelW,
                this.maxTextWidth(refRows.map(([lbl, , , plain]) => plain ? lbl : `Δ${lbl}`), refF)
                + refF * 0.6);

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
                for (const [, va, vr, plain] of refRows) {
                    maxRefW = Math.max(maxRefW,
                        this.maxTextWidth([plain ? fmtP.format(va) : refText(va, vr)], refF));
                }
                const rowsShown = refRows.slice(0, refRows.length >= 2 && h >= 52 * k ? 2 : 1);
                if (rowsShown.length > 0 && refX + refLabelW + maxRefW <= x + w - pad) {
                    const yMid = y + h / 2;
                    if (rowsShown.length === 2) {
                        refRowAt(refX, yMid - Math.round(2 * k), rowsShown[0][0], rowsShown[0][1], rowsShown[0][2], rowsShown[0][3]);
                        refRowAt(refX, yMid + refF + Math.round(4 * k), rowsShown[1][0], rowsShown[1][1], rowsShown[1][2], rowsShown[1][3]);
                    } else {
                        refRowAt(refX, yMid + refF * 0.35, rowsShown[0][0], rowsShown[0][1], rowsShown[0][2], rowsShown[0][3]);
                    }
                    refX += refLabelW + maxRefW + Math.round(24 * k);
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
                if (trendOn) {
                    // trend chart in the bridge slot — a little wider, a line needs length
                    const bwT = Math.min(220 * k, x + w - pad - refX);
                    if (p.trendSeries && bwT >= 90 * k && bh2 >= 16 * k) {
                        const byBottom = y + (h - legRoom + bh2) / 2;
                        drawTrend(x + w - pad - bwT, byBottom, bwT, bh2);
                    }
                } else if (cfg.cardBars && p.basis != null && bw2 >= 100 * k && bh2 >= 18 * k) {
                    const byBottom = y + (h - legRoom + bh2) / 2;
                    drawBridge(x + w - pad - bw2, byBottom, bw2, bh2);
                }
            } else {
                let yCur = y + pad + titleF;
                titleValue(yCur, yCur + valueF + Math.round(4 * k), w - pad * 2);
                yCur += valueF + Math.round(4 * k) + refF + Math.round(9 * k);
                if (refRows.length > 0 && yCur <= y + h - 4) {
                    refRowAt(x + pad, yCur, refRows[0][0], refRows[0][1], refRows[0][2], refRows[0][3]);
                    yCur += refF + Math.round(5 * k);
                }
                for (const [rLbl, rVa, rVr, rPlain] of refRows.slice(1)) {
                    if (h < 118 * k || yCur > y + h - 4) { break; }
                    refRowAt(x + pad, yCur, rLbl, rVa, rVr, rPlain);
                    yCur += refF + Math.round(5 * k);
                }
                // bullet under the value/Δ block when benchmark is bound
                if (cfg.cardBullet && p.bm != null && yCur + Math.round(14 * k) <= y + h - 4) {
                    const bw3 = Math.min(w - pad * 2, 190 * k);
                    drawBullet(x + pad, yCur + Math.round(7 * k), bw3, Math.round(9 * k));
                    yCur += Math.round(18 * k);
                }
                const bridgeH = Math.round(40 * k);
                if (trendOn) {
                    // trend chart fills the free bottom area (≥ 56 px·k, up to a third of
                    // a tall card), full card width
                    const avail = y + h - pad - legRoom - yCur;
                    const hT = Math.min(Math.round(Math.max(56 * k, h * 0.34)), avail);
                    if (p.trendSeries && hT >= 18 * k && w >= 120 * k) {
                        drawTrend(x + pad, y + h - pad - legRoom, w - pad * 2, hT);
                    }
                } else if (cfg.cardBars && p.basis != null && h - (yCur - y) >= bridgeH + pad + legRoom && w >= 150 * k) {
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
            this.catGroups.push({ g, sel: p.sel, dim: p.dim });
            this.animGroups.push([g]);
        });

        // top-right chip cluster of the tile: sort chip on the outside, ⚠ exception
        // chip to its left — both anchored on the same right edge so they never overlap.
        // Luft zum Kachelrand statt 2px Klebeabstand (Beta-Feedback A. Korn)
        const chipTop = region.y + Math.round(8 * k) - 2;
        let chipRight = region.x + region.w - Math.round(8 * k);
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
            const cx = chipRight - segW, cy = chipTop;
            chipRight -= segW + Math.round(6 * k);
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
            // 1.49: without a comparison value (PY/PL/BM) or with a single card the
            // sort orders cannot differ — locked instead of a silent cycle
            const sortable = points.length > 1 && points.some(p => p.varAbs != null || p.bm != null);
            if (!sortable) {
                this.lockChip(chip, this.locStr("Lock_CardSort",
                    "No effect: without a comparison value (PY/PL/BM) or with a single card there is nothing to sort"));
            }
            (chip as unknown as SVGGraphicsElement).style.cursor = sortable ? "pointer" : "default";
            const cycle = () => {
                if (!sortable) { return; }
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
        if (this.allowInteractions && this.exceptionCapable) {
            this.drawExceptionChip(chipRight, chipTop, cfg);
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

        // highlight bands (IBCS EMPHASIZE): behind the column slot only — the
        // cumulative line rides on top and stays untouched
        if (cfg.highlight.size > 0) {
            const hlTop = rect.y + 2;
            for (let i = 0; i < n; i++) {
                if (!this.isEmph(cfg, pts[i].cat)) { continue; }
                this.emphBand(bg, bandStart + i * step + 1, hlTop, step - 2,
                    region.y + region.h - hlTop, cfg);
            }
        }

        const marks = this.el("g", {}, this.svg);
        const valueTexts = pts.map(p => cfg.fmt.format(p.value as number));
        const showValueAt = this.labelPredicate(pts, valueTexts, lf, step, "columns");
        const showCatAt = this.labelPredicate(pts, pts.map(p => p.cat), cf, step, "columns", undefined, true);

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
            const isHl = this.isEmph(cfg, p.cat);
            if (showCatAt(i) || isHl) {
                this.drawCategoryLabel(g, p.cat, cx(i), "columns", cf, region, step, rect, cfg.ink, isHl);
            }
            cum += Math.max(p.value as number, 0) / (total || 1) * 100;
            if (cross < 0 && cum >= 80) { cross = i; }
            d += `${d ? "L" : "M"}${cx(i).toFixed(1)},${pctY(Math.min(cum, 100)).toFixed(1)}`;
            if (p.commentNo != null && p.value != null) {
                this.drawCommentMarker(g, cx(i), p, scale, "columns", cfg);
            }
            this.attachInteraction(g, p, cfg);
            this.catGroups.push({ g, sel: p.sel, dim: p.dim });
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
        const showCatAt = this.labelPredicate(points, points.map(p => p.cat), cf, step, "bars", undefined, true);
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
            this.catGroups.push({ g, sel: p.sel, dim: p.dim });
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
        for (const [x, label] of [[x0, cfg.basisLabel], [x1, cfg.scenL.ac]] as [number, string][]) {
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
            this.catGroups.push({ g, sel: p.sel, dim: p.dim });
            this.animGroups.push([g]);
        });
    }

    /**
     * scatter-mode configuration: own formatters for X and bubble size (same 1.45 unit
     * logic as the values — auto display units, magnitude-carrying format strings like
     * "#,0 T€" are left alone), the measure names and the pane choices. An unformatted
     * X measure must NOT inherit the AC format ("" instead of undefined), or a margin
     * ratio would be labelled in T€.
     */
    private scatterConfig(points: DataPoint[]): NonNullable<ChartConfig["scatter"]> {
        const s = this.formattingSettings;
        const absMax = (get: (p: DataPoint) => number | null | undefined) =>
            points.reduce((a, p) => Math.max(a, Math.abs(get(p) ?? 0)), 0);
        const allInt = (get: (p: DataPoint) => number | null | undefined) =>
            points.every(p => { const v = get(p); return v == null || Number.isInteger(v); });
        const xGet = (p: DataPoint) => p.xVal, sGet = (p: DataPoint) => p.sizeVal;
        return {
            // role bound at all — a bound-but-empty X gets the "no points" hint instead
            hasX: this.xName != null,
            xName: this.xName ?? "X",
            yName: this.measureName ?? "",
            sizeName: this.sizeName ?? "",
            fmtX: this.makeFormatter(absMax(xGet), allInt(xGet), this.xFormat ?? ""),
            fmtSize: this.makeFormatter(absMax(sGet), allInt(sGet), this.sizeFormat ?? ""),
            quadrant: String(s.chartCard.scatterQuadrant.value.value),
            colorBy: String(s.chartCard.scatterColorBy.value.value),
            xRefLine: this.parseRefValue(String(s.scaleCard.xRefLine.value || "")),
            xDiv: this.formatterParams(absMax(xGet), allInt(xGet), this.xFormat ?? "").unit,
            xFormat: this.xFormat ?? "",
            // v3: movement arrows need PY data; 2D movement additionally the xPrevious role
            arrows: s.chartCard.scatterArrows.value === true && points.some(p => p.py != null),
            hasXPrev: this.xPrevName != null,
            xPrevName: this.xPrevName ?? "X PY",
            shapes: s.chartCard.scatterShapes.value === true
                && String(s.chartCard.scatterColorBy.value.value) === "group",
            sizeLegend: s.chartCard.scatterSizeLegend.value === true,
            trend: String(s.chartCard.scatterTrend.value.value),
            trendR2: s.chartCard.scatterTrendR2.value === true,
            quadLabels: {
                tr: String(s.chartCard.scatterQuadLabelTR.value || "").trim(),
                tl: String(s.chartCard.scatterQuadLabelTL.value || "").trim(),
                bl: String(s.chartCard.scatterQuadLabelBL.value || "").trim(),
                br: String(s.chartCard.scatterQuadLabelBR.value || "").trim()
            },
            play: s.chartCard.scatterPlay.value === true,
            xMin: this.parseRefValue(String(s.scaleCard.xMin.value || "")),
            xMax: this.parseRefValue(String(s.scaleCard.xMax.value || "")),
            yMin: this.parseRefValue(String(s.scaleCard.yMin.value || "")),
            yMax: this.parseRefValue(String(s.scaleCard.yMax.value || "")),
            xLogWanted: s.scaleCard.xLogScale.value === true,
            yLogWanted: s.scaleCard.yLogScale.value === true,
            // filled by prepareScatterDeck once the tiles are known
            shared: null,
            groupColors: null,
            groupKey: null,
            groupOrder: null
        };
    }

    /** points a scatter can plot: X and Y both present and finite (no zero substitution) */
    private scatterValid(points: DataPoint[]): DataPoint[] {
        return points.filter(p => p.value != null && p.xVal != null
            && isFinite(p.value) && isFinite(p.xVal));
    }

    /**
     * scatter deck preparation (1.48), run once per render after the tiles are known:
     *
     * - small multiples: X/Y range, quadrant split (mean/median over ALL points of all
     *   drawn tiles, resp. the reference lines) and the largest bubble are computed over
     *   the whole deck → identical scales and identical quadrant lines in every tile
     *   (IBCS CO 5.1). This is not switchable: multiplesSameScale only concerns the
     *   bridge modes; a scatter, like columns/bars/waterfall, always shares its scales.
     * - colorBy "group": one color per series value (Stack-Series role) — or, without
     *   tiles, per multiples value. With tiles the tile title already carries the
     *   multiples group (coloring by it would be redundant), so only a bound series
     *   colors inside the tiles; without a series role the deck falls back to "single".
     *   High contrast keeps outline/filled circles and therefore ignores the coloring.
     */
    private prepareScatterDeck(sc: NonNullable<ChartConfig["scatter"]>,
        tiles: { name: string | null; pts: DataPoint[] }[], tiled: boolean, cfg: ChartConfig): void {
        const all = this.scatterValid(tiles.reduce<DataPoint[]>((a, g) => a.concat(g.pts), []));
        sc.shared = null;
        sc.groupColors = null;
        sc.groupKey = null;
        sc.groupOrder = null;
        if (tiled && all.length > 0) {
            const xRef = sc.xRefLine, yRef = cfg.refLine;
            // v3: axes include the PY arrow starts; fixed bounds + log resolved deck-wide
            const xs = all.map(p => p.xVal as number), ys = all.map(p => p.value as number);
            const xsDom = xs.slice(), ysDom = ys.slice();
            if (sc.arrows) {
                for (const p of all) {
                    if (p.py == null || !isFinite(p.py)) { continue; }
                    ysDom.push(p.py);
                    if (sc.hasXPrev && p.xPrev != null && isFinite(p.xPrev)) { xsDom.push(p.xPrev); }
                }
            }
            const ax = this.scatterAxisDomain(xsDom, [xRef], sc.xMin, sc.xMax, sc.xLogWanted);
            const ay = this.scatterAxisDomain(ysDom, [yRef], sc.yMin, sc.yMax, sc.yLogWanted);
            // quadrant statistic over the points that stay inside the fixed bounds
            const vis = all.filter(p => (p.xVal as number) >= ax.lo && (p.xVal as number) <= ax.hi
                && (p.value as number) >= ay.lo && (p.value as number) <= ay.hi);
            const sPts = vis.length > 0 ? vis : all;
            const qOn = sc.quadrant !== "off";
            const stat = (vals: number[]) => sc.quadrant === "median" ? medianOf(vals) : meanOf(vals);
            const qx = xRef != null ? xRef : qOn ? stat(sPts.map(p => p.xVal as number)) : null;
            const qy = yRef != null ? yRef : qOn ? stat(sPts.map(p => p.value as number)) : null;
            sc.shared = {
                xLo: ax.lo, xHi: ax.hi, yLo: ay.lo, yHi: ay.hi, qx, qy,
                sMax: Math.max(0, ...sPts.map(p => p.sizeVal ?? 0)),
                refCell: null,
                xLog: ax.log, yLog: ay.log,
                sizeLegendDrawn: false
            };
        }
        if (sc.colorBy !== "group") { return; }
        const key: "series" | "group" | null = all.some(p => p.stackSeries != null) ? "series"
            : !tiled && all.some(p => p.group != null) ? "group" : null;
        if (!key) { return; }
        // the order of first appearance drives colors AND the v3 shape cycle; in high
        // contrast only the shapes apply (groupColors stays null — outline convention)
        const order: string[] = [];
        for (const p of all) {
            const v = this.scatterGroupOf(p, key);
            if (!order.includes(v)) { order.push(v); }
        }
        sc.groupKey = key;
        sc.groupOrder = order;
        if (cfg.hc) { return; }
        const pal = cfg.dark ? SCATTER_GROUP_DARK : SCATTER_GROUP_LIGHT;
        const rest = cfg.dark ? SCATTER_GROUP_REST_DARK : SCATTER_GROUP_REST_LIGHT;
        const map = new Map<string, string>();
        order.forEach((v, i) => map.set(v, i < pal.length ? pal[i] : rest));
        sc.groupColors = map;
    }

    /**
     * scatter v3: resolved axis domain — data range (plus reference lines), overridden
     * by the fixed bounds (scale.xMin/xMax/yMin/yMax; nonsense min ≥ max falls back to
     * auto), and whether the requested log scale may actually apply: only when every
     * value, reference line and bound is greater than zero (keys template contract).
     */
    private scatterAxisDomain(vals: number[], refs: (number | null)[],
        fixMin: number | null, fixMax: number | null,
        logWanted: boolean): { lo: number; hi: number; log: boolean } {
        const refList = refs.filter((r): r is number => r != null && isFinite(r));
        let [lo, hi] = this.scatterRange(vals, null);
        for (const r of refList) { lo = Math.min(lo, r); hi = Math.max(hi, r); }
        let fLo = fixMin ?? lo, fHi = fixMax ?? hi;
        if (fLo >= fHi) { fLo = lo; fHi = hi; }
        if (fLo >= fHi) { fHi = fLo + (Math.abs(fLo) > 0 ? Math.abs(fLo) * 0.1 : 1); }
        const log = logWanted && fLo > 0 && fHi > 0
            && vals.every(v => v > 0) && refList.every(r => r > 0);
        return { lo: fLo, hi: fHi, log };
    }

    /** the coloring value of a scatter point (series or multiples label) */
    private scatterGroupOf(p: DataPoint, key: "series" | "group"): string {
        return (key === "series" ? p.stackSeries : p.group) ?? "(blank)";
    }

    /** scatter axis data range incl. the reference line; a single value gets ±10 % */
    private scatterRange(vals: number[], ref: number | null): [number, number] {
        const lo = Math.min(...vals, ref ?? Infinity), hi = Math.max(...vals, ref ?? -Infinity);
        if (hi > lo) { return [lo, hi]; }
        const d = Math.abs(lo) > 0 ? Math.abs(lo) * 0.1 : 1;
        return [lo - d, hi + d];
    }

    /**
     * scatter v3: one mark in the group's shape — 0 circle · 1 square · 2 triangle ·
     * 3 diamond, visually area-matched to a circle of radius r. Returns the element
     * (the play animation moves the whole group, only a circle resizes its radius).
     */
    private drawScatterShape(parent: SVGElement, cx: number, cy: number, r: number,
        shape: number, attrs: Record<string, string | number>): SVGElement {
        switch (shape % 4) {
            case 1: {
                const s = r * 1.772; // side of the equal-area square (r·√π)
                return this.el("rect", {
                    x: cx - s / 2, y: cy - s / 2, width: s, height: s, ...attrs
                }, parent);
            }
            case 2: {
                const s = r * 2.5; // up-triangle with roughly equal visual weight
                const h = s * 0.866;
                return this.el("polygon", {
                    points: `${cx},${cy - h * 0.58} ${cx - s / 2},${cy + h * 0.42} `
                        + `${cx + s / 2},${cy + h * 0.42}`,
                    "stroke-linejoin": "round", ...attrs
                }, parent);
            }
            case 3: {
                const d = r * 1.35; // diamond: area 2d² ≈ πr²
                return this.el("polygon", {
                    points: `${cx},${cy - d} ${cx + d},${cy} ${cx},${cy + d} ${cx - d},${cy}`,
                    "stroke-linejoin": "round", ...attrs
                }, parent);
            }
            default:
                return this.el("circle", { cx, cy, r, ...attrs }, parent);
        }
    }

    /**
     * scatter v3 size legend: three nested reference circles (bottom-aligned) on round
     * values — largest ≈ the biggest bubble, then ~half and ~quarter, each labelled
     * like the data labels. Takes the first plot corner free of marks and labels,
     * reserves its box in `placed` and returns whether it was drawn.
     */
    private drawScatterSizeLegend(parent: SVGElement,
        plot: { left: number; right: number; top: number; bottom: number },
        sMax: number, rOf: (v: number) => number, fmtSize: IValueFormatter,
        placed: { x0: number; y0: number; x1: number; y1: number }[],
        blocked: (b: { x0: number; y0: number; x1: number; y1: number }) => boolean,
        cfg: ChartConfig): boolean {
        const niceBelow = (v: number): number => {
            if (v <= 0) { return 0; }
            const e = Math.pow(10, Math.floor(Math.log10(v)));
            for (const m of [5, 2.5, 2, 1]) {
                if (m * e <= v * (1 + 1e-9)) { return Number((m * e).toPrecision(12)); }
            }
            return e;
        };
        const v1 = niceBelow(sMax);
        if (v1 <= 0) { return false; }
        const vals = [v1, niceBelow(v1 / 2), niceBelow(v1 / 4)]
            .filter((v, i, a) => v > 0 && a.indexOf(v) === i);
        const k = this.fontK;
        const f = Math.round(8.5 * k);
        const r1 = rOf(vals[0]);
        const texts = vals.map(v => fmtSize.format(v));
        const labW = this.maxTextWidth(texts, f) + 4;
        const w = 2 * r1 + 6 + labW;
        const h = 2 * r1 + f + 2;
        if (w > (plot.right - plot.left) * 0.5 || h > (plot.bottom - plot.top) * 0.6) { return false; }
        const m = 6;
        type B = { x0: number; y0: number; x1: number; y1: number };
        const corners: B[] = [
            { x0: plot.right - m - w, y0: plot.top + m, x1: plot.right - m, y1: plot.top + m + h },
            { x0: plot.right - m - w, y0: plot.bottom - m - h, x1: plot.right - m, y1: plot.bottom - m },
            { x0: plot.left + m, y0: plot.top + m, x1: plot.left + m + w, y1: plot.top + m + h },
            { x0: plot.left + m, y0: plot.bottom - m - h, x1: plot.left + m + w, y1: plot.bottom - m }
        ];
        const box = corners.find(b => !blocked(b)) ?? corners[0];
        const cx = box.x0 + r1;
        const yBase = box.y1 - 1; // circles share the baseline (classic nested layout)
        for (let i = 0; i < vals.length; i++) {
            const r = rOf(vals[i]);
            const cy = yBase - r;
            this.el("circle", {
                cx, cy, r, fill: "none", stroke: cfg.subtle, "stroke-width": 1,
                ...(i === 0 ? {} : { "stroke-dasharray": "2,2" })
            }, parent);
            // leader from the circle's top to its value at the right
            const ty = cy - r;
            this.el("line", {
                x1: cx, y1: ty, x2: cx + r1 + 3, y2: ty,
                stroke: cfg.faint, "stroke-width": 0.8
            }, parent);
            const t = this.el("text", {
                x: cx + r1 + 5, y: ty + f * 0.35, "font-size": f,
                fill: cfg.subtle, "font-family": FONT
            }, parent);
            t.textContent = texts[i];
        }
        placed.push(box);
        return true;
    }

    /** scatter v3: the ▶/⏸ chip (styled like the mode chips) that drives the play loop */
    private drawScatterPlayChip(xRight: number, yTop: number,
        cfg: ChartConfig): { g: SVGGElement; icon: SVGTextElement } {
        const k = this.fontK;
        const bh = Math.round(18 * k), font = Math.round(10 * k);
        const w = Math.round(28 * k);
        const g = this.el("g", { role: "button", tabindex: "0" }, this.svg) as SVGGElement;
        this.el("rect", {
            x: xRight - w, y: yTop, width: w, height: bh, rx: bh / 2,
            fill: cfg.hc ? cfg.paper : cfg.colors.ac,
            stroke: cfg.hc ? cfg.ink : "none", "stroke-width": cfg.hc ? 1.2 : 0
        }, g);
        const icon = this.el("text", {
            x: xRight - w / 2, y: yTop + bh / 2 + font * 0.36, "text-anchor": "middle",
            "font-size": font, fill: cfg.hc ? cfg.ink : cfg.paper,
            "font-family": FONT, "font-weight": 600
        }, g) as SVGTextElement;
        icon.textContent = "▶";
        const tipText = `${this.locStr("Btn_ScatterPlay", "Play")} / ${this.locStr("Btn_Pause", "Pause")}`;
        const tip = this.el("title", {}, g);
        tip.textContent = tipText;
        g.setAttribute("aria-label", tipText);
        g.style.cursor = "pointer";
        const act = () => this.scatterPlayToggle();
        g.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); act(); });
        g.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key !== "Enter" && e.key !== " ") { return; }
            e.preventDefault();
            e.stopPropagation();
            act();
        });
        return { g, icon };
    }

    /** scatter v3 play loop: start/resume or pause. Transient — nothing is persisted. */
    private scatterPlayToggle(): void {
        const an = this.scatterAnim;
        if (!an || an.frames.length < 2) { return; }
        if (an.playing) {
            an.playing = false;
            if (an.raf != null) { cancelAnimationFrame(an.raf); an.raf = null; }
            an.from = an.cur;
            this.scatterFrame = Math.round(an.cur);
            if (an.btnIcon) { an.btnIcon.textContent = "▶"; }
            return;
        }
        if (an.from >= an.frames.length - 1) { an.from = 0; }
        an.playing = true;
        if (an.btnIcon) { an.btnIcon.textContent = "⏸"; }
        an.t0 = performance.now();
        const SEG = 900; // ms per period step
        const step = (ts: number) => {
            if (!an.playing || this.scatterAnim !== an) { return; }
            const t = an.from + (ts - an.t0) / SEG;
            if (t >= an.frames.length - 1) {
                // end of the timeline: stay on the last period, re-render once for
                // clean (greedily placed) labels of the final frame
                an.playing = false;
                an.raf = null;
                this.scatterFrame = an.frames.length - 1;
                this.rerender();
                return;
            }
            this.scatterApplyFrame(an, t);
            an.raf = requestAnimationFrame(step);
        };
        an.raf = requestAnimationFrame(step);
    }

    /** scatter v3 play: positions every series dot at timeline position t (frame index
     *  + fraction) via a group transform; a series missing in a frame fades out */
    private scatterApplyFrame(an: NonNullable<Visual["scatterAnim"]>, t: number): void {
        const last = an.frames.length - 1;
        const i = Math.max(0, Math.min(Math.floor(t), last));
        const j = Math.min(i + 1, last);
        const f = Math.min(Math.max(t - i, 0), 1);
        const a = an.frameData[i], b = an.frameData[j];
        for (const [key, dot] of an.dots) {
            const va = a.get(key), vb = b.get(key);
            const v = va && vb
                ? { x: va.x + (vb.x - va.x) * f, y: va.y + (vb.y - va.y) * f,
                    size: va.size + (vb.size - va.size) * f }
                : (va ?? vb);
            if (!v) {
                dot.g.setAttribute("opacity", "0");
                continue;
            }
            dot.g.setAttribute("opacity", va && vb ? "1" : "0.25");
            dot.g.setAttribute("transform",
                `translate(${an.X(v.x) - dot.cx},${an.Y(v.y) - dot.cy})`);
            if (dot.circle && dot.hasSize) {
                dot.circle.setAttribute("r", String(an.rOf(v.size)));
            }
        }
        if (an.watermark) { an.watermark.textContent = an.frames[Math.round(t)]; }
        an.cur = t;
    }

    /**
     * scatter v3 rectangle selection: document-level drag from an empty-plot mousedown.
     * On release the contained points go into ONE multi-select (crossfilter); the click
     * that follows the mouseup is suppressed so it cannot clear the fresh selection.
     */
    private beginScatterDrag(e0: MouseEvent,
        marks: { x: number; y: number; sel: ISelectionId | null }[], cfg: ChartConfig): void {
        if (this.scatterDragCleanup) { this.scatterDragCleanup(); }
        const svgBox = this.svg.getBoundingClientRect();
        const toLocal = (e: MouseEvent) => ({ x: e.clientX - svgBox.left, y: e.clientY - svgBox.top });
        const start = toLocal(e0);
        let rectEl: SVGRectElement | null = null;
        let moved = false;
        const frame = (e: MouseEvent) => {
            const cur = toLocal(e);
            return {
                x0: Math.min(start.x, cur.x), y0: Math.min(start.y, cur.y),
                x1: Math.max(start.x, cur.x), y1: Math.max(start.y, cur.y)
            };
        };
        const onMove = (e: MouseEvent) => {
            const cur = toLocal(e);
            if (!moved && Math.hypot(cur.x - start.x, cur.y - start.y) < 4) { return; }
            moved = true;
            if (!rectEl) {
                rectEl = this.el("rect", {
                    fill: cfg.ink, "fill-opacity": 0.06,
                    stroke: cfg.ink, "stroke-width": 1, "stroke-dasharray": "4,3"
                }, this.svg) as SVGRectElement;
                (rectEl.style as CSSStyleDeclaration & { pointerEvents: string }).pointerEvents = "none";
            }
            const b = frame(e);
            rectEl.setAttribute("x", String(b.x0));
            rectEl.setAttribute("y", String(b.y0));
            rectEl.setAttribute("width", String(Math.max(b.x1 - b.x0, 0)));
            rectEl.setAttribute("height", String(Math.max(b.y1 - b.y0, 0)));
            e.preventDefault();
        };
        const cleanup = () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
            if (rectEl && rectEl.parentNode) { rectEl.parentNode.removeChild(rectEl); }
            rectEl = null;
            this.scatterDragCleanup = null;
        };
        const onUp = (e: MouseEvent) => {
            const wasMoved = moved;
            const b = frame(e);
            cleanup();
            if (!wasMoved) { return; } // plain click: existing clear-on-empty behavior
            this.scatterDragJustEnded = true;
            const ids = marks
                .filter(mk => mk.sel != null && mk.x >= b.x0 && mk.x <= b.x1
                    && mk.y >= b.y0 && mk.y <= b.y1)
                .map(mk => mk.sel as ISelectionId);
            if (ids.length > 0) {
                this.selectionManager.select(ids, false).then((sel: ISelectionId[]) => {
                    this.applySelectionOpacity(sel);
                });
            } else {
                this.selectionManager.clear();
                this.applySelectionOpacity([]);
            }
        };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
        this.scatterDragCleanup = cleanup;
        e0.preventDefault();
    }

    /**
     * compact one-line legend for colorBy "group" (1.48): "Field: ● A  ● B …", drawn
     * once above the chart (with tiles: above the whole grid, the colors are the same in
     * every tile). Values that do not fit are summarised as "+n". Returns the height used.
     */
    private drawScatterLegend(y: number, width: number, cfg: ChartConfig): number {
        const sc = cfg.scatter;
        if (!sc) { return 0; }
        // v3: in high contrast the group COLORS stay off, but with "shape per group"
        // the legend still earns its keep — it shows the shapes in the ink color
        const entriesAll: [string, string][] = sc.groupColors && sc.groupColors.size > 0
            ? Array.from(sc.groupColors.entries())
            : (cfg.hc && sc.shapes && sc.groupKey && sc.groupOrder)
                ? sc.groupOrder.map(n => [n, cfg.ink] as [string, string])
                : [];
        if (entriesAll.length === 0) { return 0; }
        const k = this.fontK;
        const f = Math.round(10 * k);
        const h = f + 8;
        const r = Math.max(3, Math.round(3.5 * k));
        const g = this.el("g", { "class": "icd-scatter-legend" }, this.svg);
        const field = sc.groupKey === "series"
            ? (this.seriesName ?? this.locStr("Tooltip_Series", "Series"))
            : (this.multName ?? this.locStr("Role_Multiples", "Small Multiples"));
        const base = y + h / 2 + f * 0.35;
        let x = 6;
        const lead = this.el("text", {
            x, y: base, "font-size": f, fill: cfg.subtle, "font-family": FONT
        }, g);
        lead.textContent = `${field}:`;
        x += this.textWidth(`${field}:`, f) + 8;
        const pal = cfg.dark ? SCATTER_GROUP_DARK : SCATTER_GROUP_LIGHT;
        const entries = entriesAll;
        const named = entries.slice(0, pal.length);
        const restN = entries.length - named.length;
        const restTxt = (n: number) => `+${n} ${this.locStr("Scatter_LegendMore", "further")}`;
        // v3 shapes: the legend glyph repeats the group's shape (HC: outline style)
        const glyph = (i: number, col: string, gx: number) => {
            const attrs = cfg.hc
                ? { fill: cfg.paper, stroke: cfg.ink, "stroke-width": 1.2 }
                : { fill: col };
            if (sc.shapes && sc.groupKey) {
                this.drawScatterShape(g, gx + r, y + h / 2, r, i % 4, attrs);
            } else {
                this.el("circle", { cx: gx + r, cy: y + h / 2, r, ...attrs }, g);
            }
        };
        for (let i = 0; i < named.length; i++) {
            const [name, col] = named[i];
            const left = named.length - i - 1 + restN;
            const tw = this.textWidth(name, f);
            const need = 2 * r + 4 + tw + 12;
            const reserve = left > 0 ? this.textWidth(restTxt(left), f) + 2 * r + 8 : 0;
            if (x + need + reserve > width - 6 && i > 0) {
                const t = this.el("text", { x, y: base, "font-size": f, fill: cfg.subtle, "font-family": FONT }, g);
                t.textContent = restTxt(entries.length - i);
                return h;
            }
            glyph(i, col, x);
            const t = this.el("text", {
                x: x + 2 * r + 4, y: base, "font-size": f, fill: cfg.ink, "font-family": FONT
            }, g);
            t.textContent = this.truncate(name, Math.max(30, width - x - 2 * r - 10 - reserve), f);
            x += need;
        }
        if (restN > 0) {
            const rc = cfg.dark ? SCATTER_GROUP_REST_DARK : SCATTER_GROUP_REST_LIGHT;
            this.el("circle", {
                cx: x + r, cy: y + h / 2, r,
                ...(cfg.hc ? { fill: cfg.paper, stroke: cfg.ink, "stroke-width": 1.2 } : { fill: rc })
            }, g);
            const t = this.el("text", {
                x: x + 2 * r + 4, y: base, "font-size": f, fill: cfg.subtle, "font-family": FONT
            }, g);
            t.textContent = restTxt(restN);
        }
        return h;
    }

    /**
     * Scatter / Bubble (correlation): AC on the Y axis over the xValue measure on X, one
     * point per category — with the bubbleSize role the points become bubbles whose AREA
     * (not radius) is proportional to the size measure. Not an IBCS core chart type: like
     * Pareto/Dumbbell/Slope it carries the grey panel title. A scatter needs real axes
     * (exception to the label-instead-of-axis rule, as in Slope): thin axis lines with
     * 3–5 "nice" ticks, the units from the format strings go into the axis titles.
     * Quadrant lines at mean/median (scale.refLine / scale.xRefLine override them),
     * greedy collision-free category labels (the rest via tooltip), EMPHASIZE and an
     * optional ΔBasis status color.
     */
    private renderScatter(points: DataPoint[], region: Rect, cfg: ChartConfig): void {
        const sc = cfg.scatter;
        if (!sc) { return; }
        if (!sc.hasX) {
            this.drawModeHint(region, cfg, this.locStr("Hint_ScatterX",
                "Scatter: add a measure to the “X axis (Scatter)” field"));
            return;
        }
        // points without X or Y are skipped (no zero substitution — it would plot a fake)
        const allPts = this.scatterValid(points);
        if (allPts.length === 0) {
            this.drawModeHint(region, cfg, this.locStr("Hint_ScatterEmpty",
                "Scatter: no category has both an X and an AC value"));
            return;
        }
        const k = this.fontK;
        const cf = cfg.catFont;
        const axF = Math.round(9.5 * k);
        const pad = 4;
        const titleH = Math.round(14 * k);
        // small multiples (1.48): scales, quadrant split and the largest bubble come from
        // the whole deck (prepareScatterDeck) — every tile draws the same axes
        const sh = sc.shared;
        // quadrant split per axis — a reference line overrides the statistic
        const xRef = sc.xRefLine, yRef = cfg.refLine;
        const qOn = sc.quadrant !== "off";
        const stat = (vals: number[]) => sc.quadrant === "median" ? medianOf(vals) : meanOf(vals);

        // v3 axis domains: data range (movement arrows include the PY start positions)
        // plus reference lines, overridden by the fixed bounds of the scale card; a
        // requested log scale applies only while every value stays above zero
        const xsDom = allPts.map(p => p.xVal as number);
        const ysDom = allPts.map(p => p.value as number);
        if (sc.arrows) {
            for (const p of allPts) {
                if (p.py == null || !isFinite(p.py)) { continue; }
                ysDom.push(p.py);
                if (sc.hasXPrev && p.xPrev != null && isFinite(p.xPrev)) { xsDom.push(p.xPrev); }
            }
        }
        const ax = sh ? { lo: sh.xLo, hi: sh.xHi, log: sh.xLog }
            : this.scatterAxisDomain(xsDom, [xRef], sc.xMin, sc.xMax, sc.xLogWanted);
        const ay = sh ? { lo: sh.yLo, hi: sh.yHi, log: sh.yLog }
            : this.scatterAxisDomain(ysDom, [yRef], sc.yMin, sc.yMax, sc.yLogWanted);
        const xLo = ax.lo, xHi = ax.hi, yLo = ay.lo, yHi = ay.hi;
        // fixed bounds: points outside the axes are not drawn, the panel title counts them
        const vis = allPts.filter(p => (p.xVal as number) >= xLo && (p.xVal as number) <= xHi
            && (p.value as number) >= yLo && (p.value as number) <= yHi);
        const outsideN = allPts.length - vis.length;
        if (vis.length === 0) {
            this.drawModeHint(region, cfg, this.locStr("Hint_ScatterEmpty",
                "Scatter: no category has both an X and an AC value"));
            return;
        }

        // v3 play (Rosling): the category becomes the time axis — the chart shows ONE
        // period (frames in data order) while the axes stay fixed over the total range
        // of all periods. Single cloud only; small-multiples tiles keep the normal
        // scatter, and exports (no interactions) render the full cloud as before.
        const playOn = sc.play && !sh && this.allowInteractions;
        const frames: string[] = [];
        if (playOn) { for (const p of vis) { if (!frames.includes(p.cat)) { frames.push(p.cat); } } }
        const playActive = playOn && frames.length >= 2;
        const frameIdx = playActive
            ? Math.max(0, Math.min(this.scatterFrame ?? frames.length - 1, frames.length - 1)) : -1;
        const pts = playActive ? vis.filter(p => p.cat === frames[frameIdx]) : vis;
        const xs = pts.map(p => p.xVal as number);
        const ys = pts.map(p => p.value as number);

        const hasSize = sh ? sh.sMax > 0 : vis.some(p => (p.sizeVal ?? 0) > 0);
        const sMax = sh ? sh.sMax
            : hasSize ? Math.max(...vis.map(p => Math.max(p.sizeVal ?? 0, 0))) : 0;
        // status color needs a comparison basis — without PY/PL it stays single-colored
        const statusOn = sc.colorBy === "status" && pts.some(p => p.varAbs != null);

        // units from the format strings (1.45 unit logic): ONE unit per axis in the axis
        // title, plain numbers at the ticks — same derivation as the IBCS title block
        const unitOf = (f: IValueFormatter, v: number) =>
            f.format(v || 1).replace(/[0-9.,\s +\-−–—()]/g, "");
        const yUnit = unitOf(cfg.fmt, Math.max(...vis.map(p => Math.abs(p.value as number))));
        const xUnit = unitOf(sc.fmtX, Math.max(...vis.map(p => Math.abs(p.xVal as number))));
        // tick labels: the axis formatter's display unit, decimals from the tick STEP
        // (5 %-steps → "0 · 5 · 10", 0.2-steps → "2,8 · 3,0 · 3,2"), unit stripped — it
        // stands in the axis title. Zero reads "0" (not the finance dash). On a log
        // axis the steps vary — the SMALLEST tick drives the decimals instead
        const tickTexts = (ticks: number[], div: number, fmtStr: string | undefined,
            logAxis = false): string[] => {
            const pct = /%/.test((fmtStr ?? this.measureFormat ?? "").replace(/"[^"]*"/g, ""));
            const step = logAxis && ticks.length > 0
                ? Math.min(...ticks.filter(t => t > 0))
                : ticks.length > 1 ? Math.abs(ticks[1] - ticks[0]) : 1;
            const scaled = Number((step / (div || 1) * (pct ? 100 : 1)).toPrecision(6));
            const frac = /\.(\d+)$/.exec(String(scaled));
            const f = this.buildFormatter(div, Math.min(4, frac ? frac[1].length : 0), fmtStr);
            return ticks.map(v => {
                if (v === 0) { return "0"; }
                const t = f.format(v);
                const num = t.replace(/[^\d.,\s+\-−–—()]/g, "").replace(/\s+/g, " ").trim()
                    .replace(/\(\s+/, "(").replace(/\s+\)/, ")");
                return num !== "" ? num : t;
            });
        };

        // quadrant lines: the statistic runs over ALL visible points (stable across
        // play frames); a line outside the fixed bounds is not drawn
        let qx = sh ? sh.qx : xRef != null ? xRef : qOn ? stat(vis.map(p => p.xVal as number)) : null;
        let qy = sh ? sh.qy : yRef != null ? yRef : qOn ? stat(vis.map(p => p.value as number)) : null;
        if (qx != null && (qx < xLo || qx > xHi)) { qx = null; }
        if (qy != null && (qy < yLo || qy > yHi)) { qy = null; }

        // vertical layout: grey panel title · Y-axis title · plot · X ticks · X-axis title
        const top = region.y + pad;
        const yTitleBase = top + titleH + axF;
        const plotTop = yTitleBase + Math.round(6 * k);
        const xTitleBase = region.y + region.h - pad;
        const plotBottom = Math.max(plotTop + 20, xTitleBase - 2 * axF - 10);
        const plotH = plotBottom - plotTop;
        // marker sizes: plain dots, or bubbles between min 3px·k and max 22px·k (capped
        // by the plot size). The plot range is inset by the largest radius, so no
        // marker is clipped by an axis
        const rPlain = 4 * Math.min(k, 1.6);
        const rMin = 3 * k;
        // small multiples (1.48): ONE bubble scale for the deck — the size cap derives
        // from the grid cell, so the larger hero tile draws the same radius per value
        const rBoxW = sh?.refCell ? sh.refCell.w : region.w;
        const rBoxH = sh?.refCell
            ? Math.max(20, (sh.refCell.h - pad - 2 * axF - 10) - (pad + titleH + axF + Math.round(6 * k)))
            : plotH;
        const rMax = hasSize ? Math.max(rMin + 2, Math.min(22 * k, Math.min(rBoxW * 0.8, rBoxH) / 7)) : rPlain;
        const inset = rMax + 6;

        // Y ticks first (their label width sets the plot's left edge); a log axis
        // keeps its ticks inside [lo, hi] (decades resp. 1-2-5 steps, no inset stretch)
        const yMaxTicks = Math.max(2, Math.min(5, Math.floor(plotH / (axF * 2.4))));
        const yPer = (yHi - yLo) / Math.max(plotH - 2 * inset, 10);
        const yTicks = ay.log ? logTicks(yLo, yHi, yMaxTicks)
            : niceTicks(yLo - inset * yPer, yHi + inset * yPer, yMaxTicks);
        const yTickTxt = tickTexts(yTicks, cfg.fmtUnit, undefined, ay.log);
        const plotLeft = region.x + pad + this.maxTextWidth(yTickTxt, axF) + 8;
        const plotRight = region.x + region.w - pad - 2;
        const plotW = Math.max(20, plotRight - plotLeft);
        // X ticks: 5 at most, fewer while their labels would collide
        const xPer = (xHi - xLo) / Math.max(plotW - 2 * inset, 10);
        let xTicks: number[] = [];
        let xTickTxt: string[] = [];
        for (let m = 5; m >= 2; m--) {
            xTicks = ax.log ? logTicks(xLo, xHi, m)
                : niceTicks(xLo - inset * xPer, xHi + inset * xPer, m);
            xTickTxt = tickTexts(xTicks, sc.xDiv, sc.xFormat, ax.log);
            if (xTicks.length * (this.maxTextWidth(xTickTxt, axF) + 12) <= plotW) { break; }
        }
        const X = logLinScale(xLo, xHi, plotLeft + inset, plotRight - inset, ax.log);
        const Y = logLinScale(yLo, yHi, plotBottom - inset, plotTop + inset, ay.log);

        const bg = this.el("g", {}, this.svg);
        // grey panel title — marks the non-IBCS-core chart type (as Pareto/Dumbbell/Slope)
        const titleParts = [`Scatter · ${cfg.scenL.ac} × ${sc.xName}`];
        if (hasSize) { titleParts.push(`○ ${sc.sizeName} (max ${sc.fmtSize.format(sMax)})`); }
        if (statusOn) {
            titleParts.push(this.locStr("Scatter_ColorStatus", "color = Δ{0}").replace("{0}", cfg.basisLabel));
        }
        // v3 fixed bounds: declare withheld points — a silently shortened cloud lies
        if (outsideN > 0) {
            titleParts.push(this.locStr("Scatter_Outside", "{0} outside the axes")
                .replace("{0}", String(outsideN)));
        }
        this.drawPanelTitle(bg, { x: region.x, y: top, w: region.w, h: titleH }, titleParts.join(" · "),
            "columns", titleH, region, undefined, cfg.subtle);
        // axis titles carry name + unit: Y top-left above the plot, X bottom-right
        const yName = sc.yName ? `${sc.yName} (${cfg.scenL.ac})` : cfg.scenL.ac;
        const yt = this.el("text", {
            x: region.x + pad + 2, y: yTitleBase, "font-size": axF, fill: cfg.subtle, "font-family": FONT
        }, bg);
        yt.textContent = this.truncate(`${yName}${yUnit ? ` in ${yUnit}` : ""}`, region.w - 12, axF);
        const xt = this.el("text", {
            x: plotRight, y: xTitleBase, "text-anchor": "end", "font-size": axF,
            fill: cfg.subtle, "font-family": FONT
        }, bg);
        xt.textContent = this.truncate(`${sc.xName}${xUnit ? ` in ${xUnit}` : ""}`, plotW, axF);

        // thin axis lines + short tick marks, no grid (IBCS: no decoration)
        const axis = { stroke: cfg.subtle, "stroke-width": 1 };
        this.el("line", { x1: plotLeft, y1: plotTop, x2: plotLeft, y2: plotBottom, ...axis }, bg);
        this.el("line", { x1: plotLeft, y1: plotBottom, x2: plotRight, y2: plotBottom, ...axis }, bg);
        yTicks.forEach((v, i) => {
            const y = Y(v);
            this.el("line", { x1: plotLeft - 3, y1: y, x2: plotLeft, y2: y, ...axis }, bg);
            const t = this.el("text", {
                x: plotLeft - 5, y: y + axF * 0.35, "text-anchor": "end", "font-size": axF,
                fill: cfg.subtle, "font-family": FONT
            }, bg);
            t.textContent = yTickTxt[i];
        });
        xTicks.forEach((v, i) => {
            const x = X(v);
            this.el("line", { x1: x, y1: plotBottom, x2: x, y2: plotBottom + 3, ...axis }, bg);
            // edge ticks stay inside the visual instead of being clipped
            const half = this.textWidth(xTickTxt[i], axF) / 2;
            const t = this.el("text", {
                x: Math.min(Math.max(x, region.x + half + 1), region.x + region.w - half - 1),
                y: plotBottom + 4 + axF, "text-anchor": "middle", "font-size": axF,
                fill: cfg.subtle, "font-family": FONT
            }, bg);
            t.textContent = xTickTxt[i];
        });

        // marks: area-proportional radius r = rMax·√(size / max), never below rMin
        const rOf = (p: DataPoint): number => !hasSize ? rPlain
            : Math.max(rMin, rMax * Math.sqrt(Math.max(p.sizeVal ?? 0, 0) / sMax));
        const items = pts.map(p => {
            // in a tile the title carries the group — the point label is the category
            // alone. Play mode: the category is the PERIOD (watermark), so the dots
            // are labelled by what they represent — the series value
            const label = playActive ? (p.stackSeries ?? p.cat)
                : p.group != null && !sh ? `${p.cat} · ${p.group}` : p.cat;
            return {
                p, label, cx: X(p.xVal as number), cy: Y(p.value as number), r: rOf(p),
                emph: this.isEmph(cfg, p.cat) || this.isEmph(cfg, label) || this.isEmph(cfg, p.group)
            };
        });
        type Box = { x0: number; y0: number; x1: number; y1: number };
        const checkMarks = items.length <= 400;
        const hitsMark = (b: Box, self: number) => checkMarks && items.some((it, j) => {
            if (j === self) { return false; }
            const dx = it.cx - Math.min(Math.max(it.cx, b.x0), b.x1);
            const dy = it.cy - Math.min(Math.max(it.cy, b.y0), b.y1);
            return dx * dx + dy * dy < (it.r + 1) * (it.r + 1);
        });

        // quadrant lines (faint, dashed) resp. reference lines (ink, like drawRefLine);
        // their labels take the first line end free of markers and are reserved boxes
        // the point labels must not cover
        const placed: Box[] = [];
        const lineF = Math.round(9 * k);
        const halo = { stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round" };
        const lineLabel = (txt: string, isRef: boolean,
            cands: { x: number; y: number; anchor: string }[]) => {
            const w = this.textWidth(txt, lineF);
            const boxOf = (c: { x: number; y: number; anchor: string }): Box => {
                const x0 = c.anchor === "start" ? c.x : c.x - w;
                return { x0, y0: c.y - lineF, x1: x0 + w, y1: c.y + 2 };
            };
            const fits = (b: Box) => b.x0 >= plotLeft + 1 && b.x1 <= plotRight + 1;
            const pick = cands.find(c => fits(boxOf(c)) && !hitsMark(boxOf(c), -1))
                ?? cands.find(c => fits(boxOf(c))) ?? cands[0];
            const t = this.el("text", {
                x: pick.x, y: pick.y, "text-anchor": pick.anchor, "font-size": lineF,
                fill: isRef ? cfg.ink : cfg.subtle, "font-family": FONT, ...halo
            }, bg);
            t.textContent = txt;
            placed.push(boxOf(pick));
        };
        const statLbl = sc.quadrant === "median"
            ? this.locStr("Scatter_Median", "Median") : this.locStr("Scatter_Mean", "Ø");
        const qStyle = (isRef: boolean) => isRef
            ? { stroke: cfg.ink, "stroke-width": 1.1, "stroke-dasharray": "7,3" }
            : { stroke: cfg.faint, "stroke-width": 1.3, "stroke-dasharray": "4,3" };
        if (qx != null) {
            const isRef = xRef != null;
            const x = X(qx);
            this.el("line", { x1: x, y1: plotTop, x2: x, y2: plotBottom, ...qStyle(isRef) }, bg);
            lineLabel(isRef ? sc.fmtX.format(qx) : `${statLbl} ${sc.fmtX.format(qx)}`, isRef, [
                { x: x + 3, y: plotTop + lineF, anchor: "start" }, { x: x - 3, y: plotTop + lineF, anchor: "end" },
                { x: x + 3, y: plotBottom - 4, anchor: "start" }, { x: x - 3, y: plotBottom - 4, anchor: "end" }
            ]);
        }
        if (qy != null) {
            const isRef = yRef != null;
            const y = Y(qy);
            this.el("line", { x1: plotLeft, y1: y, x2: plotRight, y2: y, ...qStyle(isRef) }, bg);
            lineLabel(isRef ? (cfg.refLineLabel || cfg.fmt.format(qy)) : `${statLbl} ${cfg.fmt.format(qy)}`, isRef, [
                { x: plotRight - 2, y: y - 3, anchor: "end" }, { x: plotRight - 2, y: y + lineF + 2, anchor: "end" },
                { x: plotLeft + 3, y: y - 3, anchor: "start" }, { x: plotLeft + 3, y: y + lineF + 2, anchor: "start" }
            ]);
        }

        const hitsPlaced = (b: Box) =>
            placed.some(q => b.x0 < q.x1 && b.x1 > q.x0 && b.y0 < q.y1 && b.y1 > q.y0);

        // v3 quadrant corner labels (pane text fields, empty = off): subtle ink-soft
        // text in the four plot corners — only while BOTH quadrant lines exist. Each
        // label tries its corner, then a step inward; it is reserved so point labels
        // avoid it, but points themselves win ("weicht nach Möglichkeit aus")
        if (qx != null && qy != null && sc.quadLabels) {
            const qf = Math.round(9 * k);
            const put = (txt: string, cx2: number, cy2: number, anchor: string, dy: number) => {
                if (!txt) { return; }
                const w = this.textWidth(txt, qf);
                const boxOf = (x: number, y: number): Box => ({
                    x0: anchor === "start" ? x : x - w, y0: y - qf,
                    x1: anchor === "start" ? x + w : x, y1: y + 2
                });
                const cands = [{ x: cx2, y: cy2 }, { x: cx2, y: cy2 + dy }];
                const pick = cands.find(c => !hitsPlaced(boxOf(c.x, c.y)) && !hitsMark(boxOf(c.x, c.y), -1))
                    ?? cands[0];
                const t = this.el("text", {
                    x: pick.x, y: pick.y, "text-anchor": anchor, "font-size": qf,
                    fill: cfg.subtle, "font-family": FONT, "font-style": "italic", ...halo
                }, bg);
                t.textContent = this.truncate(txt, plotW * 0.4, qf);
                placed.push(boxOf(pick.x, pick.y));
            };
            put(sc.quadLabels.tr, plotRight - 4, plotTop + qf + 2, "end", qf + 4);
            put(sc.quadLabels.tl, plotLeft + 4, plotTop + qf + 2, "start", qf + 4);
            put(sc.quadLabels.bl, plotLeft + 4, plotBottom - 5, "start", -(qf + 4));
            put(sc.quadLabels.br, plotRight - 4, plotBottom - 5, "end", -(qf + 4));
        }

        // v3 trend line: linear regression over the visible points (per tile in small
        // multiples, per frame in play mode), computed in the transformed space of the
        // axes (log stays a straight line), drawn as a thin dotted line; optional R²
        if (sc.trend === "linear" && pts.length >= 3) {
            const tx = (v: number) => ax.log ? Math.log(v) : v;
            const ty = (v: number) => ay.log ? Math.log(v) : v;
            const T = pts.map(p => ({ x: tx(p.xVal as number), y: ty(p.value as number) }));
            const n = T.length;
            const mx = meanOf(T.map(t => t.x)), my = meanOf(T.map(t => t.y));
            let sxx = 0, sxy = 0, syy = 0;
            for (const t of T) {
                sxx += (t.x - mx) * (t.x - mx);
                sxy += (t.x - mx) * (t.y - my);
                syy += (t.y - my) * (t.y - my);
            }
            if (sxx > 1e-12 && n >= 3) {
                const b = sxy / sxx, a = my - b * mx;
                // clip the segment to the plot's y-range in transformed space
                const tx0 = tx(xLo), tx1 = tx(xHi);
                const tyLo = Math.min(ty(yLo), ty(yHi)), tyHi = Math.max(ty(yLo), ty(yHi));
                const yA = a + b * tx0, yB = a + b * tx1;
                let t0 = 0, t1 = 1;
                if (Math.abs(yB - yA) > 1e-12) {
                    const tAt = (yv: number) => (yv - yA) / (yB - yA);
                    const c1 = tAt(tyLo), c2 = tAt(tyHi);
                    t0 = Math.max(0, Math.min(c1, c2));
                    t1 = Math.min(1, Math.max(c1, c2));
                } else if (yA < tyLo || yA > tyHi) {
                    t0 = 1; t1 = 0;
                }
                if (t1 > t0) {
                    const back = (tv: number, log: boolean) => log ? Math.exp(tv) : tv;
                    const pxOf = (t: number) => X(back(tx0 + (tx1 - tx0) * t, ax.log));
                    const pyOf = (t: number) => Y(back(yA + (yB - yA) * t, ay.log));
                    this.el("line", {
                        x1: pxOf(t0), y1: pyOf(t0), x2: pxOf(t1), y2: pyOf(t1),
                        stroke: cfg.hc ? cfg.ink : cfg.subtle, "stroke-width": 1.1,
                        "stroke-dasharray": "2,3"
                    }, bg);
                    if (sc.trendR2 && syy > 1e-12) {
                        let ssRes = 0;
                        for (const t of T) { const d = t.y - (a + b * t.x); ssRes += d * d; }
                        const r2 = Math.max(0, Math.min(1, 1 - ssRes / syy));
                        const txt = `R² = ${r2.toLocaleString(this.host.locale, {
                            minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        const rf = Math.round(9 * k);
                        const w = this.textWidth(txt, rf);
                        // at the right end of the line, above or below it, inside the plot
                        const ex = Math.min(pxOf(t1), plotRight - 2);
                        const eyRaw = pyOf(t1);
                        const cands = [eyRaw - 4, eyRaw + rf + 3]
                            .map(y => Math.min(Math.max(y, plotTop + rf), plotBottom - 3));
                        const boxOf = (y: number): Box => ({ x0: ex - w, y0: y - rf, x1: ex, y1: y + 2 });
                        const yPick = cands.find(y => !hitsPlaced(boxOf(y)) && !hitsMark(boxOf(y), -1))
                            ?? cands[0];
                        const t = this.el("text", {
                            x: ex, y: yPick, "text-anchor": "end", "font-size": rf,
                            fill: cfg.subtle, "font-family": FONT, ...halo
                        }, bg);
                        t.textContent = txt;
                        placed.push(boxOf(yPick));
                    }
                }
            }
        }

        // v3 size legend (default on, only with bound bubble sizes): three reference
        // circles on round values in a free corner; small multiples draw it once
        if (hasSize && sc.sizeLegend && sMax > 0 && !(sh && sh.sizeLegendDrawn)) {
            const drew = this.drawScatterSizeLegend(bg, {
                left: plotLeft, right: plotRight, top: plotTop, bottom: plotBottom
            }, sMax, (v: number) => Math.max(rMin, rMax * Math.sqrt(Math.max(v, 0) / sMax)),
            sc.fmtSize, placed, (b: Box) => hitsPlaced(b) || hitsMark(b, -1), cfg);
            if (sh && drew) { sh.sizeLegendDrawn = true; }
        }

        // v3 log scale requested but not applicable (values ≤ 0): subtle edit-mode hint
        if (((sc.xLogWanted && !ax.log) || (sc.yLogWanted && !ay.log))
            && this.allowInteractions && (this.viewMode == null || this.viewMode === 1)) {
            const hf = Math.round(9 * k);
            const txt = this.locStr("Hint_ScatterLogOff", "Log scale ignored: values ≤ 0");
            const b: Box = { x0: plotLeft + 4, y0: plotBottom - 5 - hf,
                x1: plotLeft + 4 + this.textWidth(txt, hf), y1: plotBottom - 3 };
            const t = this.el("text", {
                x: b.x0, y: plotBottom - 5, "font-size": hf, fill: cfg.subtle,
                "font-family": FONT, "font-style": "italic", ...halo
            }, bg);
            t.textContent = txt;
            placed.push(b);
        }

        const colOf = (p: DataPoint): string => {
            // colorBy "group" (1.48): deck-wide color per series / multiples value
            if (sc.groupColors && sc.groupKey) {
                return sc.groupColors.get(this.scatterGroupOf(p, sc.groupKey)) ?? cfg.colors.ac;
            }
            if (!statusOn) { return cfg.colors.ac; }
            const v = p.varAbs;
            if (v == null || v === 0 || !cfg.isMaterial(p)) { return cfg.colors.py; }
            return cfg.isGood(v, p) ? cfg.colors.good : cfg.colors.bad;
        };

        // labels: greedy, no force layout. Priority: emphasized, then the largest bubbles,
        // then the outermost points (distance from the plot centre). Each label tries
        // right · left · above · below its marker and takes the first spot that stays in
        // the plot and hits neither a placed label nor another marker — the rest is left
        // to the tooltip. labels.show off → only emphasized points; density "ends" →
        // emphasized + the X/Y extremes; "all" → every point, overlap accepted.
        // small multiples tiles (1.48): a small tile thins "auto" out to emphasized +
        // extreme points by itself — a full greedy pass would fill it with labels
        const densitySet = String(this.formattingSettings.labelsCard.labelDensity.value.value);
        const kk = Math.min(k, 1.5);
        const smallTile = sh != null && (plotW < 300 * kk || plotH < 170 * kk);
        const density = densitySet === "auto" && smallTile ? "ends" : densitySet;
        const extremes = new Set<number>();
        if (density === "ends") {
            const arg = (vals: number[], dir: number) =>
                vals.reduce((bi, v, i) => (v - vals[bi]) * dir > 0 ? i : bi, 0);
            [arg(xs, 1), arg(xs, -1), arg(ys, 1), arg(ys, -1)].forEach(i => extremes.add(i));
        }
        const ccx = (plotLeft + plotRight) / 2, ccy = (plotTop + plotBottom) / 2;
        const order = items.map((_, i) => i).sort((a, b) => {
            const A = items[a], B = items[b];
            if (A.emph !== B.emph) { return A.emph ? -1 : 1; }
            if (hasSize && A.r !== B.r) { return B.r - A.r; }
            return Math.hypot(B.cx - ccx, B.cy - ccy) - Math.hypot(A.cx - ccx, A.cy - ccy);
        });
        const hitsLabel = (b: Box) => placed.some(q => b.x0 < q.x1 && b.x1 > q.x0 && b.y0 < q.y1 && b.y1 > q.y0);
        const inPlot = (b: Box) => b.x0 >= plotLeft + 2 && b.x1 <= region.x + region.w - 2
            && b.y0 >= plotTop && b.y1 <= plotBottom - 2;
        const maxLabW = Math.max(60, Math.min(160 * k, plotW * 0.35));
        const labelAt: ({ x: number; y: number; anchor: string; text: string } | null)[] = items.map(() => null);
        for (const i of order) {
            const it = items[i];
            const wanted = it.emph || (cfg.showLabels && (density !== "ends" || extremes.has(i)));
            if (!wanted) { continue; }
            const text = this.truncate(it.label, maxLabW, cf);
            // bold (emphasized) text runs ~8 % wider than the regular metrics
            const w = this.textWidth(text, cf) * (it.emph ? 1.08 : 1) + 2;
            const h = cf, gap = 3;
            const cands = [
                { b: { x0: it.cx + it.r + gap, y0: it.cy - h / 2, x1: it.cx + it.r + gap + w, y1: it.cy + h / 2 },
                    x: it.cx + it.r + gap, y: it.cy + h * 0.35, anchor: "start" },
                { b: { x0: it.cx - it.r - gap - w, y0: it.cy - h / 2, x1: it.cx - it.r - gap, y1: it.cy + h / 2 },
                    x: it.cx - it.r - gap, y: it.cy + h * 0.35, anchor: "end" },
                { b: { x0: it.cx - w / 2, y0: it.cy - it.r - gap - h, x1: it.cx + w / 2, y1: it.cy - it.r - gap },
                    x: it.cx, y: it.cy - it.r - gap - h * 0.2, anchor: "middle" },
                { b: { x0: it.cx - w / 2, y0: it.cy + it.r + gap, x1: it.cx + w / 2, y1: it.cy + it.r + gap + h },
                    x: it.cx, y: it.cy + it.r + gap + h * 0.8, anchor: "middle" }
            ];
            let pick = cands.find(c => inPlot(c.b) && !hitsLabel(c.b) && !hitsMark(c.b, i));
            // emphasized points and density "all" are always labelled (overlap accepted)
            if (!pick && (it.emph || density === "all")) { pick = cands.find(c => inPlot(c.b)) ?? cands[0]; }
            if (!pick) { continue; }
            placed.push(pick.b);
            labelAt[i] = { x: pick.x, y: pick.y, anchor: pick.anchor, text };
        }

        // v3 shapes: index in the deck-wide group order → circle · square · triangle ·
        // diamond (cycling); only with group coloring (resp. its HC shape-only variant)
        const shapeIdxOf = (p: DataPoint): number => {
            if (!sc.shapes || !sc.groupKey || !sc.groupOrder) { return 0; }
            const i = sc.groupOrder.indexOf(this.scatterGroupOf(p, sc.groupKey));
            return i < 0 ? 0 : i % 4;
        };
        // v3 play: per-series dot registry for the rAF interpolation
        const dots = playActive
            ? new Map<string, { g: SVGGElement; cx: number; cy: number;
                circle: SVGElement | null; hasSize: boolean }>()
            : null;

        // draw order: largest bubbles first (small ones stay visible on top), emphasized last
        const drawOrder = items.map((_, i) => i).sort((a, b) =>
            (Number(items[a].emph) - Number(items[b].emph)) || (items[b].r - items[a].r));
        const marks = this.el("g", {}, this.svg);
        for (const i of drawOrder) {
            const { p, cx, cy, r, emph } = items[i];
            const g = this.el("g", { "class": "icd-cat" }, marks) as SVGGElement;
            // v3 movement arrow PY → AC: small grey start dot at the PY position (x from
            // the xPrevious role when bound, else unchanged), thin line, head at AC —
            // drawn first so the marker stays on top; skipped when the start would lie
            // outside the axes or (log) at a non-positive position
            if (sc.arrows && p.py != null && isFinite(p.py)
                && p.py >= yLo && p.py <= yHi && !(ay.log && p.py <= 0)) {
                const sx = sc.hasXPrev && p.xPrev != null && isFinite(p.xPrev)
                    ? p.xPrev : (p.xVal as number);
                if (sx >= xLo && sx <= xHi && !(ax.log && sx <= 0)) {
                    const x0 = X(sx), y0 = Y(p.py);
                    const dx = cx - x0, dy = cy - y0;
                    const len = Math.hypot(dx, dy);
                    if (len > r + 4) {
                        const ux = dx / len, uy = dy / len;
                        const exx = cx - ux * (r + 1.5), eyy = cy - uy * (r + 1.5);
                        const aCol = cfg.hc ? cfg.ink : cfg.colors.py;
                        this.el("line", {
                            x1: x0, y1: y0, x2: exx - ux * 2, y2: eyy - uy * 2,
                            stroke: aCol, "stroke-width": 1
                        }, g);
                        // IBCS: small grey PY start, thin tail, head touching the AC marker
                        this.el("circle", {
                            cx: x0, cy: y0, r: Math.max(2, r * 0.35),
                            fill: cfg.hc ? cfg.paper : aCol,
                            ...(cfg.hc ? { stroke: cfg.ink, "stroke-width": 1 } : {})
                        }, g);
                        const ah = Math.max(3.5, 4 * Math.min(k, 1.6));
                        const bx = exx - ux * ah, by = eyy - uy * ah;
                        this.el("polygon", {
                            points: `${exx},${eyy} ${bx - uy * ah * 0.45},${by + ux * ah * 0.45} `
                                + `${bx + uy * ah * 0.45},${by - ux * ah * 0.45}`,
                            fill: aCol, "stroke-linejoin": "round"
                        }, g);
                    }
                }
            }
            // generous invisible hit target — 3px dots are hard to hover and click
            this.el("circle", { cx, cy, r: Math.max(r + 2, 7), fill: cfg.paper, "fill-opacity": 0.01 }, g);
            const col = colOf(p);
            const shapeIdx = shapeIdxOf(p);
            const markEl = this.drawScatterShape(g, cx, cy, r, shapeIdx, {
                // high contrast: outline marks in the foreground color (emphasized filled);
                // FC points hatched like FC columns; bubbles translucent so overlaps read
                ...(cfg.hc
                    ? (statusOn
                        // 1.49: status by pattern — good solid, bad hollow, immaterial dashed
                        ? { ...this.hcStatus(this.scatterStatusKind(p, cfg), cfg), stroke: cfg.ink, "stroke-width": 1.4 }
                        : { fill: emph ? cfg.ink : cfg.paper, stroke: cfg.ink, "stroke-width": 1.4 })
                    : p.isFc
                        ? { fill: `url(#${cfg.patId})`, stroke: col, "stroke-width": 1.2 }
                        : hasSize
                            ? { fill: col, "fill-opacity": emph ? 0.9 : 0.55, stroke: col, "stroke-width": 1.2 }
                            : { fill: col, stroke: cfg.paper, "stroke-width": 1 })
            });
            if (emph) {
                // IBCS EMPHASIZE: ring around the marker + bold label (wider shapes
                // like the diamond need a correspondingly wider ring)
                const ringR = (shapeIdx === 3 ? r * 1.35 : shapeIdx === 2 ? r * 1.35 : r) + 2.5;
                this.el("circle", {
                    cx, cy, r: ringR, fill: "none", stroke: cfg.ink, "stroke-width": 1.4
                }, g);
            }
            const la = labelAt[i];
            if (la) {
                const t = this.el("text", {
                    x: la.x, y: la.y, "text-anchor": la.anchor, "font-size": cf, fill: cfg.ink,
                    "font-family": FONT, "font-weight": emph ? 700 : 400, ...halo
                }, g);
                t.textContent = la.text;
            }
            if (p.commentNo != null) {
                // numbered comment badge at the marker's upper right (list in the panel)
                const br = Math.round(6 * k);
                const bx = cx + r * 0.71 + br * 0.6, by = cy - r * 0.71 - br * 0.6;
                this.el("circle", { cx: bx, cy: by, r: br, fill: cfg.paper, stroke: cfg.ink, "stroke-width": 1 }, g);
                const ct = this.el("text", {
                    x: bx, y: by + br * 0.42, "text-anchor": "middle", "font-size": Math.round(8 * k),
                    fill: cfg.ink, "font-family": FONT, "font-weight": 600
                }, g);
                ct.textContent = String(p.commentNo);
            }
            this.attachInteraction(g, p, cfg);
            this.catGroups.push({ g, sel: p.sel, dim: p.dim });
            this.animGroups.push([g]);
            if (dots) {
                dots.set(p.stackSeries ?? "·", {
                    g, cx, cy,
                    circle: markEl instanceof SVGCircleElement ? markEl : null,
                    hasSize
                });
            }
        }

        // v3 rectangle selection: a drag on empty plot space draws a marquee and
        // selects every contained point (multi-select → crossfilter); a plain click
        // keeps the existing clear behavior. The capture rect sits in bg, UNDER the
        // marks, so point clicks and hovers are untouched
        if (this.allowInteractions && !this.commentEdit && !this.compareActive
            && this.host.hostCapabilities?.allowInteractions !== false) {
            // fill "none" + pointer-events "all": receives the drag without painting a
            // single pixel — the existing scatter rendering stays pixel-identical
            const cap = this.el("rect", {
                x: plotLeft, y: plotTop, width: plotW, height: Math.max(plotBottom - plotTop, 1),
                fill: "none"
            }, bg) as SVGRectElement;
            (cap.style as CSSStyleDeclaration & { pointerEvents: string }).pointerEvents = "all";
            cap.style.cursor = "crosshair";
            const hits = items.map(it => ({ x: it.cx, y: it.cy, sel: it.p.sel }));
            cap.addEventListener("mousedown", (e: MouseEvent) => {
                if (e.button !== 0) { return; }
                this.beginScatterDrag(e, hits, cfg);
            });
        }

        // v3 play (Rosling): period watermark behind the points (click = reset) + the
        // ▶/⏸ chip; the rAF loop interpolates the dots between the period frames
        if (playActive) {
            const wmF = Math.max(20, Math.min(plotH * 0.42, plotW * 0.16));
            // the <title> lives on a wrapper group: the rAF loop rewrites the text's
            // textContent every tick, which would destroy a title INSIDE the text
            const wmWrap = this.el("g", {}, bg);
            const wmTip = this.el("title", {}, wmWrap);
            wmTip.textContent = this.locStr("Btn_PlayReset", "Click: back to the start");
            const wm = this.el("text", {
                x: (plotLeft + plotRight) / 2, y: (plotTop + plotBottom) / 2 + wmF * 0.35,
                "text-anchor": "middle", "font-size": wmF, fill: cfg.faint,
                "fill-opacity": 0.6, "font-family": FONT, "font-weight": 700
            }, wmWrap) as SVGTextElement;
            wm.textContent = frames[frameIdx];
            wm.style.cursor = "pointer";
            wm.addEventListener("click", (e: MouseEvent) => {
                e.stopPropagation();
                const an = this.scatterAnim;
                if (an?.raf != null) { cancelAnimationFrame(an.raf); an.raf = null; }
                if (an) { an.playing = false; }
                this.scatterFrame = 0;
                this.rerender();
            });
            const frameData = frames.map(() => new Map<string, { x: number; y: number; size: number }>());
            const frameNo = new Map(frames.map((f, i) => [f, i] as [string, number]));
            for (const p of vis) {
                const fi = frameNo.get(p.cat);
                if (fi == null) { continue; }
                frameData[fi].set(p.stackSeries ?? "·", {
                    x: p.xVal as number, y: p.value as number,
                    size: Math.max(p.sizeVal ?? 0, 0)
                });
            }
            const chip = this.drawScatterPlayChip(region.x + region.w - 6, region.y + pad, cfg);
            this.scatterAnim = {
                frames, frameData,
                dots: dots ?? new Map(),
                X, Y,
                rOf: (v: number) => !hasSize ? rPlain
                    : Math.max(rMin, rMax * Math.sqrt(Math.max(v, 0) / Math.max(sMax, 1e-9))),
                watermark: wm,
                btnIcon: chip.icon,
                raf: null,
                playing: false,
                from: frameIdx,
                cur: frameIdx,
                t0: 0
            };
        }
    }

    /**
     * Stacked columns/bars — field-driven: filling the Stack-Series role stacks AC by
     * series with a legend and total labels. PY/PL/variance panels don't apply here;
     * an empty role leaves the plain chart untouched.
     */
    /**
     * stacked layout of one tile: categories, series, the (cat¦series) cells and
     * per category the positive and negative stack totals. Shared by the renderer
     * and render()'s deck-wide stack domain, so both measure the same stacks.
     */
    private stackLayout(points: DataPoint[]): {
        cats: string[]; series: string[]; cell: Map<string, DataPoint>; pos: number[]; neg: number[];
    } {
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
        const pos = cats.map(c => series.reduce((a, s) => a + Math.max(cell.get(`${c}¦${s}`)?.value ?? 0, 0), 0));
        const neg = cats.map(c => series.reduce((a, s) => a + Math.min(cell.get(`${c}¦${s}`)?.value ?? 0, 0), 0));
        return { cats, series, cell, pos, neg };
    }

    private renderStacked(points: DataPoint[], region: Rect, cfg: ChartConfig): void {
        const { cats, series, cell, pos: posTot, neg: negTot } = this.stackLayout(points);
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

        // net stack total (positive part + negative part) — the Σ a reader expects
        const totals = cats.map((_, i) => posTot[i] + negTot[i]);
        // one domain over all tiles incl. fixedMax/cap from render() (S5); the
        // local fallback only serves a direct call without a computed domain
        const domain: [number, number] = cfg.stackDomain
            ? [...cfg.stackDomain] as [number, number]
            : [Math.min(0, ...negTot), Math.max(...posTot, 1)];
        const cap = cfg.capMax;
        const capV = (v: number) => cap != null ? Math.min(v, cap) : v;

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

        // highlight bands (IBCS EMPHASIZE): one band per category slot, behind the
        // whole stack — not per series, otherwise the ramp would read as a scenario
        if (cfg.highlight.size > 0) {
            const hlTop = rect.y + 2;
            for (let i = 0; i < n; i++) {
                if (!this.isEmph(cfg, cats[i])) { continue; }
                if (orientation === "columns") {
                    this.emphBand(bg, bandStart + i * step + 1, hlTop, step - 2,
                        region.y + region.h - hlTop, cfg);
                } else {
                    this.emphBand(bg, region.x + 1, bandStart + i * step + 1,
                        region.w - 2, step - 2, cfg);
                }
            }
        }

        const marks = this.el("g", {}, this.svg);
        const totalTexts = totals.map(t => cfg.fmt.format(t));
        const fakePts = cats.map((c, i) => ({ cat: c, value: totals[i] } as DataPoint));
        const showTotalAt = this.labelPredicate(fakePts, totalTexts, lf, step, orientation);
        const showCatAt = this.labelPredicate(fakePts, cats, cf, step, orientation, undefined, true);

        cats.forEach((c, i) => {
            const gCat = this.el("g", {}, marks) as SVGGElement;
            // positive segments stack upward from 0, negative ones downward (S5) —
            // they used to be dropped silently, also from the total
            let cumPos = 0, cumNeg = 0;
            series.forEach((s, si) => {
                const p = cell.get(`${c}¦${s}`);
                const v = p?.value ?? 0;
                if (v === 0 || !p) { return; }
                const from = v > 0 ? cumPos : cumNeg;
                const to = from + v;
                if (v > 0) { cumPos = to; } else { cumNeg = to; }
                const g = this.el("g", { "class": "icd-cat" }, gCat) as SVGGElement;
                this.drawBar(g, pos(i), slotW, capV(from), capV(to), scale, orientation,
                    { fill: shade(si), ...(cfg.hc ? { stroke: cfg.ink, "stroke-width": 1 } : {}) });
                // segment label when the slice is tall/wide enough
                const a = scale(capV(from)), b = scale(capV(to));
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
                this.catGroups.push({ g, sel: p.sel, dim: p.dim });
            });
            // stack beyond a hard scale cap: IBCS break marker at the cut end
            if (cap != null && posTot[i] > cap) {
                this.drawCapMarker(gCat, pos(i), slotW, scale, orientation, cfg);
            }
            // net total label at the outer end of the positive stack (or of the
            // negative one when there is nothing above zero)
            if (cfg.showLabels && showTotalAt(i)) {
                const up = posTot[i] > 0 || negTot[i] === 0;
                this.drawEndLabelAt(gCat, pos(i) + slotW / 2, up ? capV(posTot[i]) : negTot[i], up, scale,
                    orientation, totalTexts[i], lf, cfg.ink, 0, cfg.paper);
            }
            const isHl = this.isEmph(cfg, c);
            if (showCatAt(i) || isHl) {
                this.drawCategoryLabel(gCat, c, pos(i) + slotW / 2, orientation, cf, region, step, rect, cfg.ink, isHl);
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
        // "n.a." texts for a basis ≤ 0 (UN 4.1) take part in the label thinning too
        const relTexts = points.map(p => this.relText(p));
        const abs2Texts = points.map(p => p.var2Abs != null ? this.fmtSigned(cfg.fmtVar, p.var2Abs) : "");
        const rel2Texts = points.map(p => this.relText(p, true));
        const showValueAt = this.labelPredicate(points, valueTexts, cfg.labelFont, step, orientation);
        const showAbsAt = this.labelPredicate(points, absTexts, cfg.labelFont, step, orientation, p => p.varAbs);
        const showRelAt = this.labelPredicate(points, relTexts, cfg.labelFont, step, orientation, p => p.varRel);
        const showAbs2At = this.labelPredicate(points, abs2Texts, cfg.labelFont, step, orientation, p => p.var2Abs);
        const showRel2At = this.labelPredicate(points, rel2Texts, cfg.labelFont, step, orientation, p => p.var2Rel);
        const showCatAt = this.labelPredicate(points, points.map(p => p.cat), cfg.catFont, step, orientation, undefined, true);

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
        // the bridge domain is zero-based like its anchor bars (S2) — label room only
        // on the side(s) away from zero, exactly like the main panel
        const bridgeScale = panels.bridge
            ? this.makePanelScale(domains.bridge, panels.bridge, orientation, labelPad) : null;

        // ------- background layer: baselines + panel titles
        const bg = this.el("g", {}, this.svg);
        const cumLabel = { ytd: "YTD", qtd: "QTD", r12: "R12" }[
            String(this.formattingSettings.chartCard.cumulativeKind.value.value)] ?? "YTD";
        const scenarioTitle = (cfg.cumulative ? `${cumLabel} · ` : "")
            + [cfg.scenL.ac, cfg.hasPy ? cfg.scenL.py : "", cfg.hasPl ? cfg.scenL.pl : "",
                cfg.hasFc ? cfg.scenL.fc : "", cfg.hasBm ? "BM ‒" : ""].filter(x => x).join(" · ");

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
            // the anchors stand on zero now — give them the AC baseline to stand on
            this.drawBaseline(bg, panels.bridge, bridgeScale, orientation, bandStart, bandEnd, "ac", cfg.colors);
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
                if (!this.isEmph(cfg, points[i].cat)) { continue; }
                const x0 = bandStart + i * step;
                if (orientation === "columns") {
                    this.emphBand(bg, x0 + 1, hlTop, step - 2, region.y + region.h - hlTop, cfg);
                } else {
                    this.emphBand(bg, region.x + 1, x0 + 1, region.w - 2, step - 2, cfg);
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
        // cascade, drawn from ZERO up to each total (S2: they used to start at the
        // lowest cascade level — an unmarked cut axis, the AC anchor could shrink
        // to length 0) — like the reference bridge charts' PL/PY/AC total columns
        if (panels.bridge && bridgeScale && cascade) {
            const basisStyle = cfg.basisMode === "plan"
                ? { fill: cfg.paper, stroke: cfg.colors.pl, "stroke-width": 1.4 }
                : { fill: cfg.colors.py };
            const basisPos = bridgeSlotPos(0);
            this.drawBar(marks, basisPos, bridgeSlotW, 0, cascade.basisSum,
                bridgeScale, orientation, basisStyle);
            if (cfg.showLabels) {
                this.drawEndLabelAt(marks, basisPos + bridgeSlotW / 2, cascade.basisSum, true, bridgeScale,
                    orientation, `${cfg.basisLabel} ${cfg.fmt.format(cascade.basisSum)}`,
                    cfg.labelFont, cfg.ink, 0, cfg.paper);
            }

            const valueLabel = cascade.fcSum > 0 ? `${cfg.scenL.ac}/${cfg.scenL.fc}` : cfg.scenL.ac;
            const valueStyle = cascade.fcSum > 0
                ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1 }
                : { fill: cfg.colors.ac };
            const valuePos = bridgeSlotPos(n + 1);
            this.drawBar(marks, valuePos, bridgeSlotW, 0, cascade.valueSum,
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
            // EVERY capped element gets the break marker (S8) — a PY column ending
            // flat at the cap reads as "PY ≈ cap" otherwise
            const capped = (v: number | null) => cfg.capMax != null && v != null && v > cfg.capMax;
            if (!lineMode && p.py != null) {
                if (cfg.pyTriangle) {
                    this.drawPyTriangle(g, pos, slotW, capV(p.py), mainScale, orientation, cfg);
                    if (capped(p.py)) {
                        // triangle sits just outside the slot — marker across its width
                        const ts = Math.max(4.5, Math.min(9, slotW * 0.3)) * Math.min(this.fontK, 1.6);
                        this.drawCapMarker(g, pos - ts, ts, mainScale, orientation, cfg);
                    }
                } else {
                    this.drawBar(g, pos, barW, 0, capV(p.py), mainScale, orientation,
                        cfg.hc
                            ? { fill: cfg.paper, stroke: cfg.colors.py, "stroke-width": 1.2, "stroke-dasharray": "3,2" }
                            : { fill: cfg.colors.py });
                    if (capped(p.py)) { this.drawCapMarker(g, pos, barW, mainScale, orientation, cfg); }
                }
            }
            if (!lineMode && p.pl != null) {
                this.drawBar(g, pos + plShift, barW, 0, capV(p.pl), mainScale, orientation,
                    { fill: cfg.paper, stroke: cfg.colors.pl, "stroke-width": 1.4 });
                if (capped(p.pl)) { this.drawCapMarker(g, pos + plShift, barW, mainScale, orientation, cfg); }
            }
            // line mode: capped points of the AC/PY/PL lines get a compact marker
            if (lineMode) {
                const lx = slotPos(i) + slotW / 2;
                const mw = Math.max(6, Math.min(12, slotW * 0.6));
                if (capped(p.value) || capped(p.py) || capped(p.pl)) {
                    this.drawCapMarker(g, lx - mw / 2, mw, mainScale, orientation, cfg);
                }
            }
            // benchmark marker: bold tick across the slot at the BM value
            if (p.bm != null) {
                if (capped(p.bm)) { this.drawCapMarker(g, pos, slotW, mainScale, orientation, cfg); }
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
                } else if (p.fcPart != null && p.fcPart > 0) {
                    // AC+FC-Splitsäule: solider AC-Sockel, schraffierter FC-Aufsatz
                    // (IBCS-Notation) — Trennkante zwischen beiden Segmenten
                    const acEnd = capV(p.value - p.fcPart);
                    this.drawBar(g, pos + acShift, barW, 0, acEnd, mainScale, orientation,
                        { fill: cfg.colors.ac });
                    this.drawBar(g, pos + acShift, barW, acEnd, capV(p.value), mainScale, orientation,
                        { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1 });
                    if (cfg.capMax != null && p.value > cfg.capMax) {
                        this.drawCapMarker(g, pos + acShift, barW, mainScale, orientation, cfg);
                    }
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
                    this.pinHead(g, c, end, r, "round", cfg.pinStyle,
                        { fill: hollowPin ? cfg.paper : color, stroke: color, "stroke-width": 1.6 });
                } else {
                    this.el("line", { x1: zero, y1: c, x2: end, y2: c, stroke: color, "stroke-width": 1.6 }, g);
                    this.pinHead(g, end, c, r, "round", cfg.pinStyle,
                        { fill: hollowPin ? cfg.paper : color, stroke: color, "stroke-width": 1.6 });
                }
                if (cfg.showLabels && showRelAt(i)) {
                    const flip = orientation === "columns" && p.varRel > 0 && panels.rel != null
                        && this.collidesPanelTitle(c, relTexts[i], cfg.labelFont,
                            relScale(p.varRel) - (r + 3) - cfg.labelFont,
                            panels.rel.y, region.x, `Δ${cfg.basisLabel} %`);
                    this.drawEndLabelAt(g, c, p.varRel, p.varRel >= 0 && !flip, relScale, orientation,
                        relTexts[i], cfg.labelFont, cfg.ink, r + 3, cfg.paper);
                }
            } else if (panels.rel && relScale && cfg.showLabels && showRelAt(i) && this.relNa(p)) {
                this.drawRelNa(g, cx, relScale(0), orientation, cfg);
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
                    this.pinHead(g, cx, end, r, "round", cfg.pinStyle,
                        { fill: hollowPin ? cfg.paper : color, stroke: color, "stroke-width": 1.6 });
                } else {
                    this.el("line", { x1: zero, y1: cx, x2: end, y2: cx, stroke: color, "stroke-width": 1.6 }, g);
                    this.pinHead(g, end, cx, r, "round", cfg.pinStyle,
                        { fill: hollowPin ? cfg.paper : color, stroke: color, "stroke-width": 1.6 });
                }
                if (cfg.showLabels && showRel2At(i)) {
                    const flip = orientation === "columns" && p.var2Rel > 0 && panels.rel2 != null
                        && this.collidesPanelTitle(cx, rel2Texts[i], cfg.labelFont,
                            rel2Scale(p.var2Rel) - (r + 3) - cfg.labelFont,
                            panels.rel2.y, region.x, `Δ${cfg.basis2Label} %`);
                    this.drawEndLabelAt(g, cx, p.var2Rel, p.var2Rel >= 0 && !flip, rel2Scale, orientation,
                        rel2Texts[i], cfg.labelFont, cfg.ink, r + 3, cfg.paper);
                }
            } else if (panels.rel2 && rel2Scale && cfg.showLabels && showRel2At(i) && this.relNa(p, true)) {
                this.drawRelNa(g, cx, rel2Scale(0), orientation, cfg);
            }

            // category label (highlighted categories always get one, in bold)
            const isHl = this.isEmph(cfg, p.cat);
            if (showCatAt(i) || isHl) {
                this.drawCategoryLabel(g, p.cat, pos + slotW / 2, orientation, cfg.catFont,
                    region, step, panels.main, cfg.ink, isHl);
            }

            // comment marker (numbered circle at the inner end of the bar)
            if (p.commentNo != null && p.value != null) {
                this.drawCommentMarker(g, cx, p, mainScale, orientation, cfg);
            }

            this.attachInteraction(g, p, cfg);
            this.catGroups.push({ g, sel: p.sel, dim: p.dim });
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
        // strike through the value labels (they carry the message). A target above
        // a hard cap lies outside the drawn scale (S8: the domain no longer grows
        // past the cap for it) — no line rather than one at a false height
        if (cfg.refLine != null && !(cfg.capMax != null && cfg.refLine > cfg.capMax)) {
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
        // relative to the first pick; n.a. at zero or a sign change (UN 4.1)
        const pct = relVar(d, p1.a.value);
        const text = `Δ ${this.fmtSigned(cfg.fmtVar, d)} (${pct != null ? this.fmtPercent(pct) : REL_NA})`;
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
        if (this.sortNoop) {
            this.lockChip(btn, this.locStr("Lock_SortSame", "No effect: the order already matches the impact order"));
            return;
        }
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
        const roundBtn = (icon: string, active: boolean, label: string, onClick: () => void,
            lockReason: string | null = null) => {
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
            this.bridgeChips.push(btn);
            if (lockReason != null) { this.lockChip(btn, lockReason); return; }
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
                () => persist({ sortByImpact: !cfg.sortByImpact }),
                this.sortNoop ? this.locStr("Lock_SortSame", "No effect: the order already matches the impact order") : null);
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
                this.bridgeChips.push(btn);
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
        // derive the unit suffix (e.g. "M€") from a formatted sample value. Sample a
        // non-zero magnitude so the finance wrapper's zero-dash never stands in for the
        // real suffix; strip all dash variants (hyphen, U+2212/2013/2014) as well.
        const unit = cfg.fmt.format(maxAbs || 1).replace(/[0-9.,\s +\-−–—]/g, "");
        let period = (s.period.value || "").trim();
        if (!period && orientation === "columns" && points.length > 1) {
            period = `${points[0].cat} – ${points[points.length - 1].cat}`;
        }
        const valueScen = [cfg.scenL.ac, cfg.hasFc ? cfg.scenL.fc : ""].filter(x => x).join(", ");
        const refScen = [
            cfg.basisMode === "plan" ? cfg.scenL.pl : cfg.basisMode === "fcrev" ? `${cfg.scenL.fc} Vm` : cfg.scenL.py,
            cfg.basisMode !== "py" && cfg.hasPy ? cfg.scenL.py : "",
            cfg.basisMode !== "plan" && cfg.hasPl ? cfg.scenL.pl : ""
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
            sumBasis = last.basis as number;
        } else {
            // signed net basis, like the Σ header (UN 4.1 n.a. below)
            for (const p of withVar) {
                sumVar += p.varAbs as number;
                sumBasis += p.basis as number;
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
            + (relVar(sumVar, sumBasis) != null
                ? ` (${this.fmtPercent(relVar(sumVar, sumBasis) as number)})` : ` (${REL_NA})`)
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
            const varRel = relVar(varAbs, basis);
            const basis2 = this.basis2Mode === "plan" ? pl : py;
            const var2Abs = (value != null && basis2 != null) ? value - basis2 : null;
            const var2Rel = relVar(var2Abs, basis2);
            return {
                ...p,
                ac: p.isFc ? null : value,
                fc: p.isFc ? value : null,
                value, py, pl, fcPrev, basis, varAbs, varRel, var2Abs, var2Rel,
                bm: p.bm != null ? (kind === "r12" ? winSum(i, x => x.bm) : cbm) : null
            };
        });
    }

    /**
     * materiality predicate from the pane thresholds — shared by the render config
     * (grey variances) and the exception filter, so both judge by the same rule.
     */
    private materialityFn(): (p: DataPoint | null | undefined,
        vAbs?: number | null, vRel?: number | null) => boolean {
        const mAbs = this.formattingSettings.chartCard.materialityAbs.value ?? 0;
        const mPct = this.formattingSettings.chartCard.materialityPct.value ?? 0;
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
    }

    /**
     * folds a tail of categories into ONE synthetic row: every scenario is summed
     * and the variances are recomputed from those sums, so the Σ header over the
     * shortened list still matches the Σ over all data.
     */
    private aggregateTail(tail: DataPoint[], cat: string, group: string | null): DataPoint {
        // KPI cards + Trend role: the collector card keeps a summed time series
        const ts = this.sumTrendSeries(tail);
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
        const varRel = relVar(varAbs, basis);
        const basis2Sum = this.basis2Mode === "plan" ? pl : py;
        const var2Abs = (value != null && basis2Sum != null) ? value - basis2Sum : null;
        const var2Rel = relVar(var2Abs, basis2Sum);
        return {
            cat,
            catLevels: null,
            dim: tail.length > 0 && tail.every(p => p.dim),
            ac, py, pl, fc, value,
            isFc: false, basis, varAbs, varRel, var2Abs, var2Rel,
            bm: sum(tail.map(p => p.bm)),
            fcPrev: sum(tail.map(p => p.fcPrev)),
            lineVal: null, stackSeries: null,
            comment: null, commentNo: null,
            group,
            rowType: null,
            isRest: true,
            sel: null,
            ...(ts ? { trendSeries: ts.series, trendRef: ts.ref } : {})
        };
    }

    /** keeps the N largest categories (by base value) and aggregates the tail into one "Rest" row */
    private applyTopN(points: DataPoint[], topN: number): DataPoint[] {
        const sorted = [...points].sort((a, b) => (b.value ?? -Infinity) - (a.value ?? -Infinity));
        const head = sorted.slice(0, topN);
        const tail = sorted.slice(topN);
        return [...head, this.aggregateTail(tail,
            `${this.locStr("Label_Rest", "Other")} (${tail.length})`,
            head.length > 0 ? head[0].group : null)];
    }

    /**
     * exception reporting: keeps every category whose variance clears the materiality
     * thresholds and folds ALL others into one collector row at the end of the list.
     * Nothing is dropped — the tail is summed, so Σ stays true; a category without any
     * variance (no reference bound) counts as material and always stays visible.
     */
    private applyExceptionFilter(points: DataPoint[]): DataPoint[] {
        const material = this.materialityFn();
        const head = points.filter(p => material(p));
        const tail = points.filter(p => !material(p));
        // nothing below the thresholds → the view must stay exactly as it was
        if (tail.length === 0) { return points; }
        this.exceptionHidden += tail.length;
        return [...head, this.aggregateTail(tail,
            `${this.locStr("Label_Unremarkable", "Immaterial")} (${tail.length})`,
            head.length > 0 ? head[0].group : tail[0].group)];
    }

    private drawCommentMarker(parent: SVGElement, bandCenter: number, p: DataPoint,
        scale: Scale, orientation: Orientation, cfg: ChartConfig): void {
        // the in-chart badge follows the font preset/scale like every other label
        const r = Math.round(7 * this.fontK);
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
            x: cx, y: cy + Math.round(3 * this.fontK), "text-anchor": "middle",
            "font-size": Math.round(9 * this.fontK), fill: cfg.ink,
            "font-family": FONT, "font-weight": 600
        }, parent);
        t.textContent = String(p.commentNo);
    }

    /** effective comment font: pane size (pt) × preset/scale factor */
    private commentFont(): number {
        const base = Math.max(8, Math.min(24,
            Number(this.formattingSettings.commentsCard.commentFontSize.value ?? 10)));
        return Math.round(base * this.fontK);
    }

    /** numbered footnote list; stays visible in PDF/PPT exports where tooltips are lost */
    private drawCommentPanel(region: Rect, pts: DataPoint[], cfg: ChartConfig): void {
        const font = this.commentFont();
        const lineH = font + 4;
        const textX = region.x + Math.round(font * 2.6);
        const maxChars = Math.max(8, Math.floor((region.w - font * 3.4) / (font * 0.52)));
        // subtle divider between chart and comments
        this.el("line", {
            x1: region.x + 4, y1: region.y + 6, x2: region.x + 4, y2: region.y + region.h - 6,
            stroke: cfg.faint, "stroke-width": 1
        }, this.svg);

        let y = region.y + font + 6;
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
                x: region.x + Math.round(font * 1.2), y: y + 1, "font-size": font + 2, fill: cfg.ink,
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

    /** splits a label into two lines at the last word boundary that still fits;
     *  falls back to a character break for a single over-long word */
    private splitTwoLines(text: string, maxW: number, font: number): [string, string] {
        const words = text.split(/\s+/);
        if (words.length > 1) {
            let l1 = words[0], i = 1;
            for (; i < words.length; i++) {
                if (this.textWidth(l1 + " " + words[i], font) > maxW) { break; }
                l1 = l1 + " " + words[i];
            }
            if (i < words.length) { return [l1, words.slice(i).join(" ")]; }
        }
        let lo = 1, hi = text.length;
        while (lo < hi) {
            const mid = (lo + hi + 1) >> 1;
            if (this.textWidth(text.slice(0, mid), font) <= maxW) { lo = mid; } else { hi = mid - 1; }
        }
        return [text.slice(0, lo), text.slice(lo)];
    }

    /** row/category name: truncates as before, but wraps to two lines when the row
     *  is tall enough (rowH ≥ two line steps) instead of cutting a long name off */
    private drawCatName(parent: SVGElement, x: number, yMid: number, text: string,
        maxW: number, font: number, rowH: number, bold: boolean, color: string): SVGTextElement {
        const fits = this.textWidth(text, font) <= maxW;
        const lineStep = Math.round(font * 1.15);
        const t = this.el("text", {
            x, "text-anchor": "start", "font-size": font, fill: color,
            "font-family": FONT, "font-weight": bold ? 700 : 400
        }, parent) as SVGTextElement;
        if (fits || rowH < 2 * lineStep) {
            t.setAttribute("y", String(yMid + font * 0.35));
            t.textContent = fits ? text : this.truncate(text, maxW, font);
            return t;
        }
        const [l1, l2raw] = this.splitTwoLines(text, maxW, font);
        const l2 = this.truncate(l2raw, maxW, font);
        const y1 = yMid - lineStep / 2 + font * 0.35;
        for (const [ln, yy] of [[l1, y1], [l2, y1 + lineStep]] as [string, number][]) {
            const ts = document.createElementNS(SVG_NS, "tspan");
            ts.setAttribute("x", String(x));
            ts.setAttribute("y", String(yy));
            ts.textContent = ln;
            t.appendChild(ts);
        }
        return t;
    }

    /** transient hover highlight rect (light fill, or thin outline in high-contrast) */
    private hoverBox(parent: SVGElement, x: number, y: number, w: number, h: number, cfg: ChartConfig): void {
        this.el("rect", {
            x, y, width: Math.max(1, w), height: Math.max(1, h),
            ...(cfg.hc
                ? { fill: "none", stroke: cfg.hcSel, "stroke-width": 1 }
                : { fill: cfg.ink, "fill-opacity": 0.05 })
        }, parent);
    }

    /** category / segment name is listed in the EMPHASIZE setting (chart.highlight) */
    private isEmph(cfg: ChartConfig, name: string | null | undefined): boolean {
        return cfg.highlight.size > 0 && name != null && cfg.highlight.has(name.trim().toLowerCase());
    }

    /** IBCS EMPHASIZE: shaded band behind the slot of a highlighted category. In
     *  high-contrast the 7 % ink tint would not survive the forced palette — thin
     *  outline instead, same as the hover band and the KPI cards */
    private emphBand(parent: SVGElement, x: number, y: number, w: number, h: number, cfg: ChartConfig): void {
        this.el("rect", {
            x, y, width: Math.max(1, w), height: Math.max(1, h),
            fill: cfg.hc ? "none" : cfg.ink,
            "fill-opacity": cfg.hc ? 0 : 0.07,
            stroke: cfg.hc ? cfg.hcSel : "none", "stroke-width": cfg.hc ? 1 : 0
        }, parent);
    }

    /**
     * 1.49 high contrast: status by PATTERN instead of color (PnL mega pattern) —
     * good = solid foreground, bad = hollow (background fill, foreground outline),
     * neutral/immaterial = dashed outline. Only called with cfg.hc.
     */
    private hcStatus(kind: "good" | "bad" | "neutral", cfg: ChartConfig): Record<string, string | number> {
        if (kind === "good") { return { fill: cfg.ink }; }
        if (kind === "bad") { return { fill: cfg.paper, stroke: cfg.ink, "stroke-width": 1.2 }; }
        return { fill: cfg.paper, stroke: cfg.ink, "stroke-width": 1, "stroke-dasharray": "2,2" };
    }

    /** scatter status of a point (colorBy status): good · bad · neutral */
    private scatterStatusKind(p: DataPoint, cfg: ChartConfig): "good" | "bad" | "neutral" {
        const v = p.varAbs;
        if (v == null || v === 0 || !cfg.isMaterial(p)) { return "neutral"; }
        return cfg.isGood(v, p) ? "good" : "bad";
    }

    private clearNode(g: SVGElement | null): void {
        if (g) { while (g.firstChild) { g.removeChild(g.firstChild); } }
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
                if (p.varAbs != null && p.basis != null) { sumVar = p.varAbs; sumBasis = p.basis; }
            } else {
                if (p.value != null) { sum += p.value; }
                if (p.varAbs != null && p.basis != null) {
                    sumVar += p.varAbs;
                    // signed: the Σ% is Δ over the NET basis — summing |basis| gave a
                    // percentage of nothing for result series crossing zero
                    sumBasis += p.basis;
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
            // UN 4.1: Σ% over the net basis — "n.a." at zero or a sign change
            const sumRel = relVar(sumVar, sumBasis);
            if (sumRel != null) {
                span(` · ${this.fmtPercent(sumRel)}`, color, true);
            } else {
                span(` · ${REL_NA}`, cfg.subtle, false);
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
                // bars: die Zeile unter dem Σ-Header gehört den Panel-Titeln
                // (ΔPY/ΔPY %) — der Hinweis wandert nach unten rechts, statt den
                // Spaltenkopf zu überlagern (Beta-Feedback A. Korn, Fund 1)
                const atBottom = cfg.orientation === "bars";
                const ht = this.el("text", {
                    x: region.x + region.w - 6,
                    y: atBottom ? region.y + region.h - 4 : region.y + hFont * 2 + 3,
                    "text-anchor": "end",
                    "font-size": Math.round(hFont * 0.82), fill: cfg.subtle,
                    "font-family": FONT, "font-style": "italic",
                    stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
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
        // high contrast: every line has the same color — PY is told apart by its dash
        if (cfg.hasPy) {
            path(p => p.py, cfg.hc ? { stroke: cfg.colors.py, "stroke-width": 1.4, "stroke-dasharray": "2,2" }
                : { stroke: cfg.colors.py, "stroke-width": 1.4 }, false);
        }
        if (cfg.hasPl) { path(p => p.pl, { stroke: cfg.colors.pl, "stroke-width": 1.2, "stroke-dasharray": "5,3" }, false); }
        path(p => p.value, { stroke: cfg.colors.ac, "stroke-width": 2 }, true);
    }

    private parseRefLine(): number | null {
        return this.parseRefValue(String(this.formattingSettings.scaleCard.refLine.value || ""));
    }

    /** reference-line text → number (scale.refLine / scale.xRefLine); "" = off */
    private parseRefValue(text: string): number | null {
        const raw = text.trim().replace(/\s/g, "").replace(",", ".");
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

    /**
     * UN 4.1 "n.a." marker at a Δ%-pin's zero line: the basis is ≤ 0, so no pin
     * is drawn — the text keeps the slot from reading as "Δ% = 0" or "missing"
     */
    private drawRelNa(parent: SVGElement, bandCenter: number, zero: number,
        orientation: Orientation, cfg: ChartConfig): void {
        const font = Math.max(8, Math.round(cfg.labelFont * 0.9));
        const t = this.el("text", {
            ...(orientation === "columns"
                ? { x: bandCenter, y: zero - 4, "text-anchor": "middle" }
                : { x: zero + 4, y: bandCenter + font * 0.35, "text-anchor": "start" }),
            "font-size": font, fill: cfg.subtle, "font-family": FONT, "font-style": "italic",
            stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
        }, parent);
        t.textContent = REL_NA;
    }

    /** IBCS outlier notation: double break stroke near the capped bar end */
    private drawCapMarker(parent: SVGElement, bp: number, bw: number, scale: Scale,
        orientation: Orientation, cfg: ChartConfig): void {
        const end = scale(cfg.capMax as number);
        // 12 px inside the bar from the cut end (pixel-identical to the former inline marker)
        this.drawAxisBreak(parent, bp, bw, orientation === "columns" ? end + 12 : end - 12,
            orientation, cfg);
    }

    /**
     * IBCS break glyph (⫽) across the full bar width ±15 %: a paper gap plus two
     * slanted ink strokes, centered at `c` on the value axis. Shared by the outlier
     * cap and the waterfall axis break; paper/ink follow dark mode and high contrast.
     */
    private drawAxisBreak(parent: SVGElement, bp: number, bw: number, c: number,
        orientation: Orientation, cfg: ChartConfig): void {
        const stroke = (d: number, color: string, w: number) => {
            if (orientation === "columns") {
                this.el("line", {
                    x1: bp - bw * 0.15, y1: c + d + 2,
                    x2: bp + bw * 1.15, y2: c + d - 2,
                    stroke: color, "stroke-width": w
                }, parent);
            } else {
                this.el("line", {
                    x1: c - d - 2, y1: bp - bw * 0.15,
                    x2: c - d + 2, y2: bp + bw * 1.15,
                    stroke: color, "stroke-width": w
                }, parent);
            }
        };
        // paper gap first, then the two ink strokes
        stroke(0, cfg.paper, 7);
        stroke(-2, cfg.ink, 1.4);
        stroke(2, cfg.ink, 1.4);
    }

    /**
     * auto cut value for the waterfall axis break: a quarter of the level span below
     * the lowest level, floored to a multiple of a "nice" step (1/2/5 × 10ⁿ ≥ span) —
     * PY 100 Mio with levels up to 107 Mio cuts at 90 Mio. ≤ 0 = no sensible cut.
     */
    private wfAutoCut(minLevel: number, maxLevel: number): number {
        const span = maxLevel - minLevel > 0 ? maxLevel - minLevel : Math.abs(minLevel) * 0.1;
        if (!(span > 0) || !isFinite(span)) { return 0; }
        const raw = minLevel - 0.25 * span;
        const mag = Math.pow(10, Math.floor(Math.log10(span)));
        const step = [1, 2, 5, 10].map(m => m * mag).find(st => st >= span) ?? 10 * mag;
        // trim float noise (0.1-steps) so labels read "0,3" not "0,30000000000000004"
        return Number((Math.floor(raw / step) * step).toPrecision(12));
    }

    /**
     * label thinning: returns a predicate deciding which indices get a label.
     * k <= 1 → all; k <= 4 → every k-th anchored at the last point;
     * denser → only first, last, min and max.
     */
    private labelPredicate(points: DataPoint[], texts: string[], fontSize: number,
        step: number, orientation: Orientation,
        valueOf: (p: DataPoint) => number | null = p => p.value,
        isCategory = false): (i: number) => boolean {
        const n = points.length;
        const extremes = (): ((i: number) => boolean) => {
            // min/max over the series actually being labeled — variance panels pass
            // their own valueOf so "ends" anchors at the largest deviation, not at
            // the extrema of the underlying base values
            let iMin = -1, iMax = -1, vMin = Infinity, vMax = -Infinity;
            for (let i = 0; i < n; i++) {
                const v = valueOf(points[i]);
                if (v == null) { continue; }
                if (v < vMin) { vMin = v; iMin = i; }
                if (v > vMax) { vMax = v; iMax = i; }
            }
            return (i: number) => i === 0 || i === n - 1 || i === iMin || i === iMax;
        };
        // pane override: "all" labels every point, "ends" keeps only the anchor
        // points readers scan for; "auto" thins out by available space (default)
        const density = String(this.formattingSettings.labelsCard.labelDensity.value.value);
        if (density === "all") { return () => true; }
        // "ends" targets value labels only — category-axis names must never be thinned to
        // the extrema (that drops a named column even when there is room); they fall through
        // to the space heuristic below, exactly like "auto"
        if (density === "ends" && !isCategory) { return extremes(); }
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
        return extremes();
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

    /**
     * piecewise-linear value scale for the waterfall axis break (IBCS UN 5.3), columns:
     * 0..cutAt is squeezed into a fixed stub of stubPx above the baseline, cutAt..max
     * runs linearly over the remaining height. Same Scale type as makePanelScale, same
     * label headroom on top; the baseline stays at scale(0).
     */
    private makeBrokenScale(domain: [number, number], cutAt: number, rect: Rect,
        labelPad: number, stubPx: number): Scale {
        const mx = Math.max(domain[1], cutAt);
        const mxp = mx + (mx - cutAt) * 0.02;
        const top = rect.y + labelPad + 12;
        const bottom = rect.y + rect.h - 2;
        const stubTop = bottom - stubPx;
        const lower = linearScale(0, cutAt, bottom, stubTop);
        const upper = linearScale(cutAt, mxp, stubTop, top);
        return (v: number) => v <= cutAt ? lower(v) : upper(v);
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
        titleH: number, region: Rect, barsTitleY?: number, color = "#6E6E6E"): void {
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
            // keep an edge label fully inside the viewport (shifted in, not clipped) so a
            // leading "−" is never sliced off — otherwise "−23,2%" reads as "23,2%"
            let x = bandCenter;
            if (this.viewW > 0) {
                const half = this.textWidth(text, fontSize) / 2 + 2;
                if (x - half < 0) { x = half; }
                else if (x + half > this.viewW) { x = this.viewW - half; }
            }
            attrs = positive
                ? { x, y: end - 4 - extraGap, "text-anchor": "middle" }
                : { x, y: end + fontSize + 2 + extraGap, "text-anchor": "middle" };
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

    /** Δ%-pin head — draws a circle or a square around (x, y). The pane choice
     *  overrides; "auto" keeps the mode's traditional default shape */
    private pinHead(parent: SVGElement, x: number, y: number, r: number,
        def: "round" | "square", style: string,
        attrs: Record<string, string | number>): void {
        const shape = style === "round" || style === "square" ? style : def;
        if (shape === "round") {
            this.el("circle", { cx: x, cy: y, r, ...attrs }, parent);
        } else {
            this.el("rect", { x: x - r, y: y - r, width: 2 * r, height: 2 * r, ...attrs }, parent);
        }
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
        if (cfg.scatter && p.xVal != null) {
            aria.push(`${cfg.scatter.xName} ${cfg.scatter.fmtX.format(p.xVal)}`);
        }
        if (p.value != null) { aria.push(cfg.fmt.format(p.value)); }
        if (p.trendSeries && p.trendRef != null && p.trendRef >= 0 && cfg.trendLabels[p.trendRef]) {
            aria.push(`${this.locStr("Tooltip_LastPeriod", "Last period")} ${cfg.trendLabels[p.trendRef]}`);
        }
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
            // KPI cards + Trend role: which period the card value refers to — the last
            // period with an actual; "sum" cards name the summed span and the last value
            if (p.trendSeries && p.trendRef != null && p.trendRef >= 0
                && cfg.trendLabels.length === p.trendSeries.length) {
                const lastLbl = cfg.trendLabels[p.trendRef];
                const lastPt = p.trendSeries[p.trendRef];
                if (cfg.cardTrendSum) {
                    out.push({
                        displayName: cfg.trendName,
                        value: `Σ ${cfg.trendLabels[0]} – ${cfg.trendLabels[cfg.trendLabels.length - 1]}`
                    });
                }
                out.push({
                    displayName: this.locStr("Tooltip_LastPeriod", "Last period"),
                    value: cfg.cardTrendSum && lastPt?.value != null
                        ? `${lastLbl} · ${cfg.fmt.format(lastPt.value)}` : lastLbl
                });
            }
            // scatter: multiples group (tile name), X before Y = AC, bubble size after it
            const sc = cfg.scatter;
            if (sc && p.group != null) {
                out.push({ displayName: this.locStr("Role_Multiples", "Small Multiples"), value: p.group });
            }
            if (sc && p.xVal != null) {
                out.push({ displayName: sc.xName, value: sc.fmtX.format(p.xVal) });
            }
            // v3 movement arrows: PY position of X plus its Δ (the Y-Δ is ΔPY below)
            if (sc && p.xPrev != null) {
                out.push({ displayName: sc.xPrevName, value: sc.fmtX.format(p.xPrev) });
                if (p.xVal != null) {
                    out.push({
                        displayName: `Δ ${sc.xName}`,
                        value: this.fmtSigned(sc.fmtX, p.xVal - p.xPrev)
                    });
                }
            }
            add(this.locStr("Role_Actual", "Actual (AC)"), p.ac);
            if (sc && p.sizeVal != null) {
                out.push({ displayName: sc.sizeName, value: sc.fmtSize.format(p.sizeVal) });
            }
            if (p.isPrelim) {
                out.push({ displayName: "Status", value: this.locStr("Tooltip_Prelim", "preliminary") });
            }
            add(this.locStr("Role_Forecast", "Forecast (FC)"), p.fc);
            // Splitsäule: Gesamtwert (AC-Sockel + FC-Aufsatz) als eigene Zeile
            if (p.fcPart != null && p.fcPart > 0 && p.value != null) {
                out.push({
                    displayName: `${cfg.scenL.ac}+${cfg.scenL.fc}`,
                    value: `${cfg.fmt.format(p.value)} (${cfg.scenL.fc}-Anteil ${cfg.fmt.format(p.fcPart)})`
                });
            }
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
            // basis ≤ 0: the Δ% line stays, but as "n.a." (UN 4.1)
            if (p.varRel == null && this.relNa(p)) {
                out.push({ displayName: `Δ${cfg.basisLabel} %`, value: REL_NA });
            }
            if (p.var2Abs != null) {
                out.push({ displayName: `Δ${cfg.basis2Label}`, value: this.fmtSigned(cfg.fmtVar, p.var2Abs) });
            }
            add(`Δ${cfg.basis2Label} %`, p.var2Rel, true, true);
            if (p.var2Rel == null && this.relNa(p, true)) {
                out.push({ displayName: `Δ${cfg.basis2Label} %`, value: REL_NA });
            }
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
            if (this.uiDark) {
                this.showDarkTip(items(), e);
                return;
            }
            this.tooltipService.show({
                dataItems: items(),
                identities: p.sel ? [p.sel] : [],
                coordinates: [e.clientX, e.clientY],
                isTouchEvent: false
            });
        });
        g.addEventListener("mousemove", (e: MouseEvent) => {
            if (this.uiDark) {
                this.moveDarkTip(e);
                return;
            }
            this.tooltipService.move({
                dataItems: items(),
                identities: p.sel ? [p.sel] : [],
                coordinates: [e.clientX, e.clientY],
                isTouchEvent: false
            });
        });
        g.addEventListener("mouseout", () => {
            if (this.uiDark) {
                this.hideDarkTip();
                return;
            }
            this.tooltipService.hide({ immediately: false, isTouchEvent: false });
        });
    }

    /**
     * Fades everything that is not in focus. Two independent sources: the visual's
     * OWN selection (click on a bar) and a cross-highlight coming from another
     * visual on the page (supportsHighlight). An own selection wins while it is
     * active — it is the more recent, more local intent.
     */
    private applySelectionOpacity(selected: ISelectionId[]): void {
        const hasSelection = selected && selected.length > 0;
        for (const cg of this.catGroups) {
            const isSel = hasSelection && cg.sel != null && selected.some(s => s.equals(cg.sel));
            const faded = hasSelection ? !isSel : cg.dim === true;
            cg.g.setAttribute("opacity", faded ? "0.35" : "1");
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
        const pc = this.popupColors();
        input.style.cssText = `position:absolute;left:${left}px;top:${top}px;z-index:10;`
            + `width:170px;box-sizing:border-box;background:${pc.bg};color:${pc.ink};`
            + `border:1px solid ${pc.border};border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.2);`
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
            this.tableNameWDragging = true;
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
                this.tableNameWDragging = false;
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

    private persistTableColWidths(): void {
        const json = JSON.stringify(this.tableColWidths);
        this.pendingTableColWidths = json;
        this.host.persistProperties({
            merge: [{ objectName: "chart", selector: null, properties: { tableColWidths: json } }]
        });
    }

    /** col-resize handle on a numeric column's right edge: drag sets the width
     *  (persisted into tableColWidths[key], same echo-guard + drag-flag pattern as
     *  the name column), double-click auto-fits to the longest visible cell. */
    private drawColWidthResize(parent: SVGElement, edgeX: number, topY: number, botY: number,
        key: string, curW: number, minW: number, maxW: number,
        autoFit: () => number): void {
        if (!this.allowInteractions) { return; }
        const clamp = (w: number) => Math.max(minW, Math.min(maxW, w));
        const h = this.el("rect", {
            x: edgeX - 3, y: topY, width: 6, height: Math.max(10, botY - topY),
            fill: "#000", "fill-opacity": 0.01
        }, parent) as SVGGraphicsElement;
        h.style.cursor = "col-resize";
        const tip = this.el("title", {}, h);
        tip.textContent = this.locStr("Table_ColResize", "Drag to resize · double-click to fit");
        h.addEventListener("mousedown", (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const startX = e.clientX;
            const startW = this.tableColWidths[key] ?? curW;
            this.tableColWidthsDragging = true;
            let moved = false;
            let cur = startW;
            const move = (ev: MouseEvent) => {
                const next = clamp(startW + (ev.clientX - startX));
                if (Math.abs(next - cur) < 2) { return; }
                cur = next;
                moved = true;
                this.tableColWidths[key] = next;
                this.rerender();
            };
            const up = () => {
                window.removeEventListener("mousemove", move);
                window.removeEventListener("mouseup", up);
                this.tableColWidthsDragging = false;
                // a bare click (no drag) must not overwrite the store — only persist
                // when the width actually changed (double-click auto-fit persists itself)
                if (moved) { this.persistTableColWidths(); }
            };
            window.addEventListener("mousemove", move);
            window.addEventListener("mouseup", up);
        });
        h.addEventListener("dblclick", (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            this.tableColWidths[key] = clamp(autoFit());
            this.persistTableColWidths();
            this.rerender();
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
        const pc = this.popupColors();
        box.style.cssText = `position:absolute;left:${left}px;top:${top}px;z-index:10;`
            + `width:${boxW}px;box-sizing:border-box;background:${pc.bg};color:${pc.ink};`
            + `border:1px solid ${pc.border};border-radius:4px;box-shadow:0 2px 10px rgba(0,0,0,0.25);`
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
            hint.style.cssText = `margin-top:4px;color:${pc.subtle};font-style:italic;`;
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
        const pc = this.popupColors();
        box.style.cssText = `position:absolute;left:${left}px;top:${top}px;z-index:10;`
            + `width:${boxW}px;box-sizing:border-box;background:${pc.bg};color:${pc.ink};`
            + `border:1px solid ${pc.border};border-radius:4px;box-shadow:0 2px 10px rgba(0,0,0,0.25);`
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
            + "font-family:inherit;font-size:12px;padding:4px;"
            + `background:${pc.bg};color:${pc.ink};border:1px solid ${pc.border};`;
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
                    ? `background:${pc.ink};color:${pc.bg};border:1px solid ${pc.ink};`
                    : `background:${pc.bg};color:${pc.ink};border:1px solid ${pc.border};`);
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
    private drawModeChip(xRight: number, text: string, cfg: ChartConfig,
        mode: "comment" | "structure" | "compare"): void {
        const k = this.fontK;
        const bh = Math.round(18 * k), font = Math.round(10 * k);
        // echte Textbreite statt Zeichen×Faktor — lange lokalisierte Labels
        // (ja-JP!) liefen sonst aus der Pille (UX-10 teilweise)
        const w = Math.round(this.textWidth(text, font)) + Math.round(16 * k);
        const g = this.el("g", { role: "button", tabindex: "0" }, this.svg) as SVGGElement;
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
        const tipBase = mode === "comment"
            ? this.locStr("ChipTip_Comment", "Comment mode active: clicking a category opens the editor")
            : mode === "structure"
                ? this.locStr("ChipTip_Structure", "Structure mode active: clicking a row opens the one-click P&L menu")
                : this.locStr("ChipTip_Compare", "Compare mode active: click two elements to show the difference, click empty space to reset");
        const endHint = this.locStr("ChipTip_EndMode", "Click the chip to end the mode");
        const tipText = `${tipBase} — ${endHint}`;
        const tip = this.el("title", {}, g);
        tip.textContent = tipText;
        g.setAttribute("aria-label", tipText);
        // Klick beendet den Modus (UX-3): der Chip persistiert die jeweilige
        // Pane-Eigenschaft auf false — wie alle anderen In-Chart-Schalter.
        // Optimistisch: Slice sofort umsetzen + Echo-Guard mit TTL, damit ein
        // verspätetes Metadaten-Echo den Klick nicht kurz zurückdreht
        if (this.host.hostCapabilities?.allowInteractions !== false) {
            g.style.cursor = "pointer";
            const endMode = () => {
                const s = this.formattingSettings;
                if (mode === "comment") {
                    s.commentsCard.editComments.value = false;
                    this.pendingModeOff.set("commentsPanel.editComments", 5);
                    this.host.persistProperties({ merge: [{
                        objectName: "commentsPanel", selector: null,
                        properties: { editComments: false }
                    }] });
                } else if (mode === "structure") {
                    s.chartCard.structureEdit.value = false;
                    this.pendingModeOff.set("chart.structureEdit", 5);
                    this.host.persistProperties({ merge: [{
                        objectName: "chart", selector: null,
                        properties: { structureEdit: false }
                    }] });
                } else {
                    s.chartCard.compareClick.value = false;
                    this.pendingModeOff.set("chart.compareClick", 5);
                    this.compareCats = [];
                    this.host.persistProperties({ merge: [{
                        objectName: "chart", selector: null,
                        properties: { compareClick: false }
                    }] });
                }
                this.rerender();
            };
            g.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); endMode(); });
            g.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key !== "Enter" && e.key !== " ") { return; }
                e.preventDefault();
                e.stopPropagation();
                endMode();
            });
        }
    }

    /**
     * ⚠ chip: end-user switch for the exception filter, persisted like the other
     * in-chart buttons (bookmarkable). Returns the width it took so a neighbouring
     * chip can step aside; the caller anchors it by its RIGHT edge.
     */
    private drawExceptionChip(xRight: number, yTop: number, cfg: ChartConfig): number {
        const k = this.fontK;
        const on = this.exceptionOn;
        const bh = Math.round(18 * k), font = Math.round(11 * k);
        const label = on
            ? this.locStr("Chip_ExceptionOn", "⚠ Exceptions")
            : this.locStr("Chip_ExceptionOff", "⚠ All");
        const segW = this.textWidth(label, font) + Math.round(16 * k);
        const x = xRight - segW;
        const tipText = this.locStr("ChipTip_Exception",
            "Exceptions only: shows just the categories above the materiality threshold, everything else as one collected row. The Σ total stays unchanged.");
        const btn = this.el("g", { tabindex: "0", role: "button" }, this.svg) as SVGGElement;
        btn.setAttribute("aria-label", tipText);
        const tip = this.el("title", {}, btn);
        tip.textContent = tipText;
        this.el("rect", {
            x, y: yTop, width: segW, height: bh, rx: bh / 2,
            fill: on ? cfg.colors.ac : cfg.paper,
            stroke: cfg.hc ? cfg.ink : cfg.subtle, "stroke-width": 1
        }, btn);
        const t = this.el("text", {
            x: x + segW / 2, y: yTop + bh / 2 + font * 0.36, "text-anchor": "middle",
            "font-size": font, fill: on ? cfg.paper : cfg.ink, "font-family": FONT
        }, btn);
        t.textContent = label;
        if (this.exceptionNoop) {
            this.lockChip(btn, this.locStr("Lock_ExcNone",
                "No effect: every category is above the materiality threshold — nothing to fold"));
            return segW;
        }
        btn.style.cursor = "pointer";
        const toggle = () => {
            const next = !on;
            // optimistic: the pane echo arrives one update later, the chip must
            // already show the new state on this click
            this.formattingSettings.chartCard.exceptionOnly.value = next;
            this.host.persistProperties({
                merge: [{
                    objectName: "chart", selector: null,
                    properties: { exceptionOnly: next }
                }]
            });
            this.rerender();
        };
        btn.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); toggle(); });
        btn.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key !== "Enter" && e.key !== " ") { return; }
            e.preventDefault(); e.stopPropagation(); toggle();
        });
        return segW;
    }

    /**
     * ⫽ chip top-right (waterfall axis break, IBCS UN 5.3): the reader flips the cut
     * on ↔ auto in the report, persisted to the SAME pane slice scale.wfAxisBreak
     * (bookmarkable). States: active = filled like the YTD chip · suggestion = ink
     * ring + wash + bold (deltas small against the base) · idle = paper + subtle ring
     * · not possible = dashed ring, subtle text, not clickable, tooltip names the
     * reason (or the multiples tile). Returns the width it took (chip-row reserve).
     */
    private drawWfBreakChip(xRight: number, cfg: ChartConfig, blockedTile: string | null): number {
        const wb = cfg.wfBreak;
        if (!wb) { return 0; }
        const k = this.fontK;
        const bh = Math.round(18 * k), font = Math.round(11 * k);
        const label = this.locStr("Chip_WfBreak", "⫽ Axis");
        const on = wb.active;
        const disabled = !wb.possible;
        const hint = !on && !disabled && wb.suggested;
        const segW = this.textWidth(label, font) + Math.round(16 * k);
        const x = xRight - segW, y = 6;
        const atTxt = cfg.fmt.format(wb.at);
        const tipText = (disabled
            ? (blockedTile != null
                ? this.locStr("ChipTip_WfBreakNaTile",
                    "Axis break not possible: tile \"{0}\" reaches below the shared cut — all tiles stay zero-based")
                    .replace("{0}", blockedTile)
                : this.locStr("ChipTip_WfBreakNa",
                    "Axis break not possible: an anchor or a variance reaches below the cut value — the axis stays zero-based"))
            : on
                ? this.locStr("ChipTip_WfBreakOn", "Axis broken from {0} (IBCS UN 5.3) — click to show the zero-based axis again")
                : hint
                    ? this.locStr("ChipTip_WfBreakSuggest",
                        "Suggestion: the variances are small against the base — click to break the axis from {0} (anchors shortened with ⫽)")
                    : this.locStr("ChipTip_WfBreakOff",
                        "Break the axis from {0} — anchors are shortened with ⫽, the variances become readable")
        ).replace("{0}", atTxt);
        const btn = this.el("g", { tabindex: disabled ? "-1" : "0", role: "button" }, this.svg) as SVGGElement;
        btn.setAttribute("aria-label", tipText);
        if (disabled) { btn.setAttribute("aria-disabled", "true"); }
        btn.setAttribute("aria-pressed", on ? "true" : "false");
        const tip = this.el("title", {}, btn);
        tip.textContent = tipText;
        this.el("rect", {
            x, y, width: segW, height: bh, rx: bh / 2,
            fill: on ? cfg.colors.ac : hint ? cfg.wash : cfg.paper,
            stroke: cfg.hc || hint ? cfg.ink : cfg.subtle,
            "stroke-width": hint ? 1.6 : 1,
            ...(disabled ? { "stroke-dasharray": "3,2" } : {})
        }, btn);
        const t = this.el("text", {
            x: x + segW / 2, y: y + bh / 2 + font * 0.36, "text-anchor": "middle",
            "font-size": font, fill: on ? cfg.paper : disabled ? cfg.subtle : cfg.ink,
            "font-family": FONT, "font-weight": on || hint ? 600 : 400
        }, btn);
        t.textContent = label;
        if (disabled) { return segW; }
        btn.style.cursor = "pointer";
        const toggle = () => {
            const next = on ? "auto" : "on";
            // optimistic: set the slice now, guard it against a stale echo (TTL) —
            // same pattern as pendingOrientation / the Smart-Start chip
            const sl = this.formattingSettings.scaleCard.wfAxisBreak;
            const it = sl.items.find(x2 => String(x2.value) === next);
            if (it) { sl.value = it; }
            this.pendingWfBreak = next;
            this.pendingWfBreakTtl = 5;
            this.host.persistProperties({
                merge: [{ objectName: "scale", selector: null, properties: { wfAxisBreak: next } }]
            });
            this.rerender();
        };
        btn.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); toggle(); });
        btn.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key !== "Enter" && e.key !== " ") { return; }
            e.preventDefault(); e.stopPropagation(); toggle();
        });
        return segW;
    }

    /** YTD chip top-right: persists chart.cumulative so end users can flip the view */
    private drawCumButton(xRight: number, cfg: ChartConfig, lockReason: string | null = null): void {
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
        if (lockReason != null) { this.lockChip(btn, lockReason); return; }
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
