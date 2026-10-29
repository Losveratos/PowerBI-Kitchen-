/**
 * Mega table — the IBCS statement table (templates T01–T04) as ONE layout and
 * ONE painter, derived 1:1 from prototype/megatable.html (see SPEC-MEGATABLE.md,
 * "Abgeleitete Maße"). No Power BI dependency, no charting library.
 *
 * The code is split exactly like the prototype:
 *  (a) the calc core stays in engine.ts (buildModel / variance / displayVariance)
 *      — the caller hands every block in as value/delta accessors;
 *  (b) layoutMega() — pure numbers: column x/w, row y, scale k per block ×
 *      family, axis x0, outlier cap. No DOM except the injected text measure,
 *      so it is unit-testable in node (test/megatable-test.js);
 *  (c) paintMega() — SVG elements from the layout object (svgEl style of
 *      waterfall.ts). The head (block titles, column heads, scenario marks) and
 *      the body (rows, cell charts, threshold footer) share ONE coordinate
 *      system; they are only cut into two <svg> elements at the axis start so
 *      the head can stay frozen while the body scrolls. Every line that runs
 *      across rows (zero axes, sum rules, closing marks) lives in the body.
 *
 * There are no template special cases in here: the column list is built from
 * toggles only (MegaToggles), T01–T04 and 12A are presets of those toggles
 * (MEGA_PRESETS). The cascades (integrated Δ waterfall T04B–E, value cascade
 * 12A) take their geometry from the shared cascade() of waterfall.ts — the
 * same function the row waterfall view uses.
 */

import { cascade, CascadeNode, CascadeSeg } from "./waterfall";

// ============================================================================
// 0 · Tokens + geometry
// ============================================================================

const MEGA_LIGHT = {
    ink: "#404040",
    text: "#1A1A1A",
    soft: "#8A8886",
    py: "#B3B3B3",
    pyLight: "#D9D9D9",
    rule: "#D9D9D9",
    /** paper: hatch ground, outlined PL fills, halos and the boxes behind capped numbers */
    white: "#FFFFFF",
    /** 12H: cost rows of an outlined (PL) value cascade — a pale ground inside the outline */
    outlineLight: "#F2F2F2",
};
/** dark stand-ins (ChartKitchen dark palette): light ink, PY dimmer than AC, "light" tones recede */
const MEGA_DARK: typeof MEGA_LIGHT = {
    ink: "#D9D9D9",
    text: "#E0E0E0",
    soft: "#A6A6A6",
    py: "#8A8A8A",
    pyLight: "#5A5A5A",
    rule: "#3F3F3F",
    white: "#1E1E1E",
    outlineLight: "#2A2A2A",
};
/** the live palette every painter of this module reads at call time */
export const MEGA_C = { ...MEGA_LIGHT };

/**
 * switch the live palette (the visual calls this once per update). High
 * contrast (`hc`, the host's foreground / background): every ink, gray and
 * rule tone becomes the foreground, the paper the background — the painter
 * then tells good / bad and PY apart by pattern instead of colour (MegaInput.hc).
 */
export function setMegaPalette(dark: boolean, paper?: string, hc?: { fg: string; bg: string }): void {
    Object.assign(MEGA_C, dark ? MEGA_DARK : MEGA_LIGHT);
    if (dark && paper) { MEGA_C.white = paper; }
    if (hc) {
        Object.assign(MEGA_C, {
            ink: hc.fg, text: hc.fg, soft: hc.fg, py: hc.fg, pyLight: hc.fg, rule: hc.fg, white: hc.bg, outlineLight: hc.bg,
        });
    }
}

/** Geometry — everything derived from the font size fs (SPEC "Geometrie"). */
export interface MegaGeometry {
    fs: number; rowH: number; fsSmall: number; gapRowH: number;
    colGap: number; groupGap: number; blockGap: number; pad: number; minNumW: number;
    markH: number; barH: number; pinStem: number; pinHead: number; lblGap: number;
    arrowW: number; signW: number; indent: number;
    chartMin: number; chartMax: number; minSpan: number;
    /** a value cascade column (12A) may grow wider than the other chart columns */
    vwfMax: number;
    axisPY: number; axisPLGap: number;
}

export function megaGeometry(fs: number, rowK = 1.7): MegaGeometry {
    // rowK (1.5.1): row height in fs — below 1.7 only when the visual makes room
    // for its comment footnotes (MegaInput.rowK), never below 1.3
    const rowH = Math.round(fs * Math.max(1.3, Math.min(1.7, rowK)));
    return {
        fs, rowH,
        fsSmall: Math.round(fs * 0.85 * 10) / 10,
        gapRowH: Math.round(rowH * 0.5),
        colGap: Math.round(fs * 0.5),
        groupGap: Math.round(fs * 1.1),
        blockGap: Math.round(fs * 1.6),
        pad: Math.round(fs * 0.35),
        minNumW: Math.round(fs * 3.2),
        markH: 4,
        barH: Math.round(rowH * 0.62),
        pinStem: 3,
        pinHead: Math.round(fs * 0.62),
        lblGap: 3,
        arrowW: Math.round(fs * 0.7),
        signW: Math.round(fs * 1.2),
        indent: Math.round(fs * 1.0),
        chartMin: Math.round(fs * 7),
        chartMax: Math.round(fs * 22),
        minSpan: Math.round(fs * 3),
        vwfMax: Math.round(fs * 28),
        axisPY: 3,
        axisPLGap: 3,
    };
}

// ============================================================================
// 1 · Input model
// ============================================================================

/**
 * analysed scenario (minuend) and reference scenario (subtrahend). PL as the
 * minuend (1.1, 12H "PL 2026 vs PY") is a plan statement: its Δ elements are
 * tinted pale (notation), a ΔPL against itself does not exist.
 */
export type MegaMin = "AC" | "FC" | "PL";
export type MegaRef = "PY" | "PL";
export type MegaScen = MegaMin | MegaRef;
export const MEGA_REFS: MegaRef[] = ["PY", "PL"];

/** acc = leaf/account · sum = subtotal · formula = "=" row · pct = margin/KPI · gap = spacer */
export type MegaKind = "acc" | "sum" | "formula" | "pct" | "gap";

export interface MegaRow {
    id: string;
    label: string;
    kind: MegaKind;
    /** glyph of the sign column ("+", "-", "=" or "") — statement data only */
    op: string;
    /** indentation level */
    level: number;
    /** sort run key (the parent) — rows of one run are sorted together */
    group: string | null;
    /** "Other …" rows stay at the bottom of their run when sorting */
    other: boolean;
    /** small markers after the label (comment number, error, collapsed …) */
    suffix?: { t: string; color: string }[];
    /**
     * cascades (T04 Δ waterfall, 12A value cascade): sign of the DISPLAYED
     * value's effect on the result (DisplayInvert × the SignConvention of the
     * subtotals above it) — a cost row shown +600 steps −600. Default 1.
     */
    eff?: number;
    /** "=" row of a cascade: drawn from the zero line, restarts the run. Default: formula rows */
    anchor?: boolean;
}

/** Display-oriented variance of one row (engine.displayVariance, scaled). */
export interface MegaDelta {
    /** Δ in display orientation (cost up = +), in display units; %p for margin rows */
    d: number;
    /** Δ% in display orientation (margin rows: relative change a/b − 1) */
    p: number | null;
    good: boolean;
    /** Δ in "good" orientation (≥ 0 ⇔ favourable) — threshold test */
    impact: number;
    impactPct: number | null;
    /** margin row: d is in percentage points */
    pp: boolean;
    /** below the materiality threshold (columns.materialityAbs / Pct): soft ink instead of good / bad */
    immaterial?: boolean;
}

export interface MegaBlock {
    /** block title ("November" / "_November") */
    name: string;
    /** "Δ in red if" thresholds of this block: abs in display units, pct as fraction */
    th: { abs: number; pct: number };
    /** display value (display units; margin rows: the ratio) */
    value: (r: MegaRow, s: MegaScen) => number | null;
    delta: (r: MegaRow, min: MegaMin, ref: MegaRef) => MegaDelta | null;
    /** "% of revenue" of a row (fraction of the revenue base, minuend of this block) */
    share?: (r: MegaRow) => number | null;
    /** head text of a value column per scenario (FY block: "AC&FC") — default the scenario */
    alias?: Partial<Record<MegaScen, string>>;
    /** show the block title even for a single statement block (month only, FY outlook) */
    titled?: boolean;
    /**
     * 12G (1.1): the year-to-date share of the minuend's value (display units).
     * Set by an FY outlook block (AC&FC): the minuend value cascade then stacks
     * YTD solid + rest of year hatched in ONE bar ("637 ▓ 1 698").
     */
    ytd?: (r: MegaRow) => number | null;
    /**
     * fill scenario of this block's Δ elements when it differs from the
     * minuend code — the FY outlook's AC&FC is mostly forecast: hatched (12G)
     */
    minFill?: MegaMin;
}

export interface MegaRefToggles {
    num: boolean; bar: boolean; pct: boolean; pin: boolean;
    /** integrated Δ waterfall (T04B–E), independent of the bars */
    wf: boolean;
}

export type MegaSort = "cat" | "min" | "delta";

export interface MegaToggles {
    min: MegaMin;
    showPY: boolean;
    showPL: boolean;
    showMin: boolean;
    /** value columns as value cascades, one chart column per scenario (12A) */
    valueCascade: boolean;
    d: Record<MegaRef, MegaRefToggles>;
    /** "Δ in red if" + footer */
    thresholds: boolean;
    /** scenario underlines in head + closing */
    marks: boolean;
    /** numbers at bars / pins */
    labels: boolean;
    /** outlier cap also for Δ bars (pins: always) */
    capBars: boolean;
    sort: MegaSort;
    /** which block decides the order (0 = period, 1 = YTD) */
    sortBlock: number;
    /** "% of revenue" column next to the value columns. Default off */
    share?: boolean;
}

export interface MegaInput {
    rows: MegaRow[];
    blocks: MegaBlock[];
    t: MegaToggles;
    /** statement (GuV) data: sign column + paired Δ header; else structure data */
    statement: boolean;
    fs: number;
    /** available width for the whole table (px) */
    viewW: number;
    /** decimals of values / Δ / margins */
    dec: number;
    /** decimals of Δ% numbers and pins */
    pdec: number;
    /** locale number text of a NON-negative value with `dec` decimals (grouping incl.) */
    num: (abs: number, dec: number) => string;
    /** text width in px */
    measure: (t: string, fs: number, bold: boolean, italic: boolean) => number;
    /** good / bad colors of the current color mode */
    pal: { good: string; bad: string };
    /** labels of the threshold footer */
    redIf: string;
    /** head text of the "% of revenue" column */
    shareHead?: string;
    /** font size of the column heads and block titles (style.headerFontSize); default fs */
    headFs?: number;
    /**
     * high contrast: MEGA_C carries the host foreground / background (see
     * setMegaPalette), pal.good = pal.bad = foreground — unfavourable bars,
     * waterfall steps, pin heads and arrows turn hollow, red threshold numbers
     * underlined, the PY mark / PY value cascade dashed (ChartKitchen HC path)
     */
    hc?: boolean;
    /** finance format (numbers.financeFormat): (1 234) instead of -1 234, exact zero "–" */
    fin?: boolean;
    /** house terms (labels.labelAc …): rewrites the scenario codes of every column head */
    relabel?: (s: string) => string;
    /** head text over the YTD part of a stacked (12G) value cascade. Default "YTD" */
    ytdHead?: string;
    /**
     * scale sync (numbers.fixedMax / fixedVarMax, ChartKitchen "minimum
     * maximum"), display units, > 0: the value cascades are scaled to at least
     * [0, fixedMax], the Δ bars / Δ waterfalls to at least ±fixedVarMax (label
     * room included) — equal values get equal lengths across visuals of equal
     * width; larger data still widens the scale
     */
    fixedMax?: number;
    fixedVarMax?: number;
    /**
     * 1.5.1: row height in font sizes (default 1.7, clamped to 1.3..1.7) — the
     * visual sets the table tighter when the comment footnotes would otherwise
     * fall below the visible area
     */
    rowK?: number;
}

// ============================================================================
// 2 · Presets (T01–T04) — templates only set toggles, never render paths
// ============================================================================

export interface MegaPreset {
    min: MegaMin;
    showPY: boolean; showPL: boolean; showMin: boolean; valueCascade: boolean;
    dPyAbs: boolean; dPyBar: boolean; dPyWf: boolean; dPyPct: boolean; dPyPin: boolean;
    dPlAbs: boolean; dPlBar: boolean; dPlWf: boolean; dPlPct: boolean; dPlPin: boolean;
    secondBlock: boolean; structureSubtotals: boolean; showPctRows: boolean;
    thresholds: boolean; scenarioMarks: boolean; chartLabels: boolean; capBars: boolean;
    sort: MegaSort; sortBlock: "period" | "ytd";
    decimals: number; pctDecimals: number;
    /** period block the template is laid out in (columns.blockKind); the left block is always month */
    blockKind: "month" | "ytd" | "fy";
    /** the template switches the headline slot on (titleBlock.headline, 12G / 12H); off = left alone */
    headline: boolean;
}

const P_OFF: MegaPreset = {
    min: "AC", showPY: false, showPL: false, showMin: false, valueCascade: false,
    dPyAbs: false, dPyBar: false, dPyWf: false, dPyPct: false, dPyPin: false,
    dPlAbs: false, dPlBar: false, dPlWf: false, dPlPct: false, dPlPin: false,
    secondBlock: false, structureSubtotals: true, showPctRows: true,
    thresholds: false, scenarioMarks: true, chartLabels: true, capBars: false,
    sort: "cat", sortBlock: "ytd", decimals: 1, pctDecimals: 1, blockKind: "ytd", headline: false,
};
const preset = (base: MegaPreset, o: Partial<MegaPreset>): MegaPreset => ({ ...base, ...o });

/**
 * Template presets (SPEC "Defaults je Preset"). Δ% numbers and pins carry ONE
 * decimal in every template (1.5, written to numbers.pctDecimals) — until 1.4
 * they followed the reference sheets (T03 / 12-series 0, T04B–E 2), and the
 * same deviation read differently from template to template.
 */
const T01A = preset(P_OFF, {
    showPY: true, showPL: true, showMin: true, dPyAbs: true, dPyPct: true, dPlAbs: true, dPlPct: true,
    secondBlock: true, structureSubtotals: false, thresholds: true, decimals: 0, pctDecimals: 1,
});
const T02A = preset(P_OFF, {
    showPL: true, showMin: true, dPlBar: true, dPlPin: true, secondBlock: true, decimals: 0, pctDecimals: 1,
});
const T03A = preset(P_OFF, {
    showPY: true, showPL: true, showMin: true, dPyAbs: true, dPyPct: true, dPlAbs: true, dPlPct: true,
    decimals: 1, pctDecimals: 1,
});
const T04A = preset(P_OFF, { showPL: true, showMin: true, dPlBar: true, dPlPin: true, decimals: 1, pctDecimals: 1 });
const T04B = preset(T04A, { dPlBar: false, dPlWf: true, decimals: 2, pctDecimals: 1 });
const T04C = preset(T04B, {
    showPY: true, showPL: false, dPlWf: false, dPlPin: false, dPyWf: true, dPyPin: true,
});
export const MEGA_PRESETS: Record<string, MegaPreset> = {
    off: P_OFF,
    T01A,
    T01B: preset(T01A, { structureSubtotals: true }),
    T02A,
    T02B: preset(T02A, { sort: "min", sortBlock: "ytd" }),
    T02C: preset(T02A, { sort: "delta", sortBlock: "period" }),
    T02E: preset(T02A, {
        min: "FC", showPY: true, showPL: false, dPlBar: false, dPlPin: false, dPyBar: true, dPyPin: true,
        sort: "delta", sortBlock: "ytd",
    }),
    T02F: preset(T02A, { min: "FC", sort: "delta", sortBlock: "ytd" }),
    T03A,
    T03B: preset(T03A, { min: "FC" }),
    T04A,
    T04B,
    T04C,
    T04D: preset(T04B, { min: "FC" }),
    T04E: preset(T04C, { min: "FC" }),
    "12A": preset(P_OFF, {
        showPY: true, showMin: true, valueCascade: true, dPyBar: true, dPyPin: true,
        showPctRows: false, decimals: 0, pctDecimals: 1,
    }),
    // 12G: FY outlook — PY year vs AC&FC stacked (YTD solid + rest of year hatched), ΔPY on the year
    "12G": preset(P_OFF, {
        showPY: true, showMin: true, valueCascade: true, dPyBar: true, dPyPin: true,
        blockKind: "fy", decimals: 0, pctDecimals: 1, headline: true,
    }),
    // 12H: plan statement — PL (outlined) vs PY, Δ bars tinted pale
    "12H": preset(P_OFF, {
        min: "PL", showPY: true, showMin: true, valueCascade: true, dPyBar: true, dPyPin: true,
        showPctRows: false, decimals: 0, pctDecimals: 1, headline: true,
    }),
};
export const MEGA_PRESET_KEYS = Object.keys(MEGA_PRESETS);

// ============================================================================
// 3 · Notation engine — ONE function for every variance / scenario element
// ============================================================================

type MegaFillKind = "solid" | "hatch" | "outline" | "tint";
interface ScenNotation {
    mark: "solid" | "hatch" | "gray" | "double"; fill: MegaFillKind; axis?: "gray" | "double";
    /**
     * fill of the Δ elements (bars, waterfall steps) when this scenario is the
     * minuend: AC solid, FC hatched, PL outlined in good / bad on paper (12H,
     * 1.5.1; 1.1 to 1.5 tinted pale). PY is never a minuend.
     */
    area: MegaFillKind;
    /** value cascade (12A): palette tone of the scenario, and of its cost rows ("hell abgesetzt") —
     *  palette keys, read at call time so the light / dark switch reaches them */
    tone: keyof typeof MEGA_LIGHT; toneLight: keyof typeof MEGA_LIGHT;
}
const SCENARIO_NOTATION: Record<MegaScen, ScenNotation> = {
    AC: { mark: "solid", fill: "solid", area: "solid", tone: "ink", toneLight: "soft" },
    FC: { mark: "hatch", fill: "hatch", area: "hatch", tone: "ink", toneLight: "soft" },
    PY: { mark: "gray", fill: "solid", area: "solid", axis: "gray", tone: "py", toneLight: "pyLight" },
    // 1.5.1: PL Δ elements outlined in good / bad on paper (12H): the minuend
    // decides the fill (AC solid, FC hatched, PL outlined), like its hollow pin
    // heads and its outlined value cascade; the pale tint of 1.1 to 1.5 read
    // like "below materiality"
    PL: { mark: "double", fill: "outline", area: "outline", axis: "double", tone: "ink", toneLight: "ink" },
};

/** share of the paper in a plan tint (12H: pale teal / red; on dark paper the dark pendants) */
export const MEGA_TINT = 0.72;

/** `color` mixed with the live paper (MEGA_C.white) — #RGB / #RRGGBB, anything else unchanged */
export function megaTint(color: string, share = MEGA_TINT): string {
    const hex = (c: string): number[] | null => {
        const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((c || "").trim());
        if (!m) { return null; }
        const h = m[1].length === 3 ? m[1].split("").map(x => x + x).join("") : m[1];
        return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
    };
    const a = hex(color); const b = hex(MEGA_C.white);
    if (!a || !b) { return color; }
    return "#" + a.map((v, i) => Math.round(v * (1 - share) + b[i] * share).toString(16).padStart(2, "0")).join("").toUpperCase();
}

export interface MegaPaint { fill: string; stroke: string | null; sw: number; dash?: string; }

/** WCAG contrast ratio of two #RGB / #RRGGBB colours (null when either is no hex colour) */
export function megaContrast(a: string, b: string): number | null {
    const lum = (c: string): number | null => {
        const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((c || "").trim());
        if (!m) { return null; }
        const h = m[1].length === 3 ? m[1].split("").map(x => x + x).join("") : m[1];
        const ch = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
            .map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
        return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
    };
    const x = lum(a); const y = lum(b);
    if (x == null || y == null) { return null; }
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/**
 * 1.5.1: text colour for a number on a filled bar — the paper tone or the text
 * ink, whichever contrasts more; null when neither reaches 4.5:1 (WCAG AA)
 */
export function megaReadableOn(fill: string): string | null {
    let best: string | null = null; let bestC = 0;
    for (const c of [MEGA_C.white, MEGA_C.text]) {
        const k = megaContrast(c, fill);
        if (k != null && k > bestC) { best = c; bestC = k; }
    }
    return bestC >= 4.5 ? best : null;
}

/**
 * notation(minuend, subtrahend):
 *   minuend  (AC | FC | PL) → FILL:  AC solid, FC hatched (+ 1 px outline in the
 *            same colour), PL outlined (1 px good / bad outline on paper, 12H,
 *            1.5.1; high contrast: solid)
 *   subtrahend (PY | PL) → AXIS: PY gray line, PL double line
 * The same table yields the scenario mark of every scenario (column-head and
 * closing underline): AC solid ink · PY solid gray · PL double · FC hatched,
 * and the fill of a value cascade per scenario (cost rows in the light tone).
 */
export function notation(minuend: MegaMin, subtrahend: MegaRef | null, hc = false): {
    area: (color: string, hatch: (c: string) => string) => MegaPaint;
    head: (hatch: (c: string) => string) => MegaPaint;
    axis: "gray" | "double";
    mark: (scen: MegaScen) => string;
    value: (scen: MegaScen, light: boolean, hatch: (c: string) => string) => MegaPaint;
} {
    const m = SCENARIO_NOTATION[minuend];
    const s = SCENARIO_NOTATION[subtrahend || "PY"];
    const paintOf = (kind: MegaFillKind, color: string, hatch: (c: string) => string, light = false): MegaPaint =>
        kind === "hatch" ? { fill: hatch(color), stroke: color, sw: 1 }
            : kind === "outline" ? { fill: light ? MEGA_C.outlineLight : MEGA_C.white, stroke: color, sw: 1 }
                : kind === "tint" && !hc ? { fill: megaTint(color), stroke: MEGA_C.ink, sw: 1 }
                    : { fill: color, stroke: null, sw: 0 };
    return {
        // high contrast: good and bad share the foreground and "bad" is hollow;
        // an outlined PL area stays solid there, or the two could not be told apart
        area: (color, hatch) => hc && m.area === "outline" ? { fill: color, stroke: null, sw: 0 } : paintOf(m.area, color, hatch),
        head: (hatch) => paintOf(m.fill, MEGA_C.ink, hatch),
        axis: s.axis ?? "gray",
        mark: (scen) => SCENARIO_NOTATION[scen].mark,
        value: (scen, light, hatch) => {
            const n = SCENARIO_NOTATION[scen];
            return paintOf(n.fill, MEGA_C[light ? n.toneLight : n.tone], hatch, light);
        },
    };
}

// ============================================================================
// 4 · Number formatting
// ============================================================================

export interface MegaFmt {
    val: (v: number) => string;
    delta: (v: number) => string;
    pct: (p: number) => string;
    pin: (p: number) => string;
    margin: (m: number) => string;
    pp: (x: number) => string;
    rel: (p: number) => string;
    share: (p: number) => string;
    signed: (v: number, dec: number, plus: boolean) => string;
}

/** decimals a number really carries (−20.5 → 1, −10 → 0), at most `max` — threshold footer */
export function megaDecimals(x: number, max = 4): number {
    for (let d = 0; d < max; d++) {
        const f = Math.pow(10, d);
        if (Math.abs(Math.round(x * f) - x * f) < 1e-6 * f) { return d; }
    }
    return max;
}

/** 1.5.1: the typographic minus (U+2212) of every number — the same glyph as ChartKitchen */
export const MEGA_MINUS = "−";
/** 1.5.1: suffix of a percentage-point difference (narrow no-break space + "pp") */
export const MEGA_PP = " pp";

/**
 * explicit "+", "−" (U+2212) as minus, zero without a sign (also a rounded −0.0).
 * Finance format (`fin`, ChartKitchen labels.financeFormat): a negative number
 * goes into parentheses with its unit inside — (1 234), (12.5%) — positive Δ
 * keep their "+", an exact zero prints "–" (a rounded zero stays "0.0").
 * `signed` itself never uses parentheses: the threshold footer is a rule
 * ("<-20"), not a figure.
 */
export function megaFmt(num: (abs: number, dec: number) => string, dec: number, pdec: number, fin = false): MegaFmt {
    // 1.5.2: a Δ that is not zero but rounds to zero keeps its sign ("+0,00",
    // "−0,0") — beside a pin or bar that visibly points one way an unsigned
    // "0,00" read like "no deviation". An exact zero (below float noise) stays "0".
    const tiny = (v: number): boolean => Math.abs(v) > 1e-9;
    const signed = (v: number, d: number, plus: boolean): string => {
        const f = Math.pow(10, d);
        const r = Math.round(Math.abs(v) * f) / f;
        const zero = r === 0 && !(plus && tiny(v));
        return (v < 0 && !zero ? MEGA_MINUS : plus && !zero ? "+" : "") + num(r, d);
    };
    const fs = (v: number, d: number, plus: boolean, unit = ""): string => {
        if (!fin) { return signed(v, d, plus) + unit; }
        if (v === 0) { return "–"; }
        const f = Math.pow(10, d);
        const r = Math.round(Math.abs(v) * f) / f;
        if (r === 0 && !(plus && tiny(v))) { return num(r, d) + unit; }
        return v < 0 ? "(" + num(r, d) + unit + ")" : (plus ? "+" : "") + num(r, d) + unit;
    };
    return {
        val: v => fs(v, dec, false),
        delta: v => fs(v, dec, true),
        pct: p => fs(p * 100, pdec, true, "%"),
        pin: p => fs(p * 100, pdec, true),
        // 1.5.1: margins and their Δ are percentages — they carry the Δ% decimals
        // (pctDecimals), not the decimals of the amounts (52.24 % next to 1-decimal
        // Δ% read like two different kinds of number); the point difference reads
        // "pp" (percentage points), not "%p"
        margin: m => fs(m * 100, pdec, false, "%"),
        pp: x => fs(x, pdec, true, MEGA_PP),
        // relative change of a ratio — no longer printed in the table (a Δ% of a
        // margin is a percentage of a percentage), kept for callers
        rel: p => fs(p * 100, 0, true, "%"),
        share: p => fs(p * 100, pdec, false, "%"),
        signed,
    };
}

// ============================================================================
// 5 · Outlier cap + scale solver
// ============================================================================

/**
 * Tukey fence (factor 4) on |values|: fence = Q3 + 4 × (Q3 − Q1), from 8
 * values on; cap = largest |value| ≤ fence (Infinity = nothing capped).
 * Matches 12A (+983/+391 capped, +95 fits), T02A (+16.5 fits), T04 (+25.6 fits).
 * `zone` (1.5, IBCS UN 5.3): share of a chart column reserved beyond the
 * largest regular value — a capped element runs into it, carries a break mark
 * and ends in a triangle in its growth direction.
 */
export const MEGA_OUTLIER = { fence: 4, minN: 8, zone: 0.12 };

/**
 * Magnification factors of a scaling indicator (1.5, IBCS UN 5.2 / CH 4.3):
 * the largest of 1 · 2 · 5 · 10 · 20 · 50 … that is ≤ x — round factors a
 * reader can multiply in his head ("ΔPY ×5").
 */
export function niceFactor(x: number): number {
    if (!isFinite(x) || x < 1) { return 1; }
    const p = Math.pow(10, Math.floor(Math.log10(x) + 1e-9));
    const m = x / p;
    return (m >= 5 - 1e-9 ? 5 : m >= 2 - 1e-9 ? 2 : 1) * p;
}
export function outlierCap(values: number[]): number {
    const a = values.map(Math.abs).filter(x => x > 0).sort((x, y) => x - y);
    if (a.length < MEGA_OUTLIER.minN) { return Infinity; }
    const q = (p: number): number => {
        const i = (a.length - 1) * p; const lo = Math.floor(i);
        return a[lo] + (a[Math.ceil(i)] - a[lo]) * (i - lo);
    };
    const fence = q(0.75) + MEGA_OUTLIER.fence * (q(0.75) - q(0.25));
    const inside = a.filter(x => x <= fence);
    return inside.length === a.length ? Infinity : inside[inside.length - 1];
}

/** one element of a chart column: span [p, q] in units + label need left a / right c in px */
export interface MegaEl { p: number; q: number; a: number; c: number; }

export function megaNeeds(els: MegaEl[], k: number): [number, number] {
    let L = 0; let R = 0;
    for (const e of els) { L = Math.max(L, e.a - e.p * k); R = Math.max(R, e.q * k + e.c); }
    return [L, R];
}

/** largest k with needs_left + needs_right ≤ W (convex → bisection, 50 steps) */
export function solveK(els: MegaEl[], W: number): number {
    if (!els.some(e => e.p || e.q)) { return 1; }
    let lo = 0; let hi = 1e-3;
    while (megaNeeds(els, hi)[0] + megaNeeds(els, hi)[1] <= W && hi < 1e7) { hi *= 2; }
    for (let i = 0; i < 50; i++) {
        const m = (lo + hi) / 2;
        const [a, b] = megaNeeds(els, m);
        if (a + b <= W) { lo = m; } else { hi = m; }
    }
    return lo;
}

// ============================================================================
// 6 · Layout (pure geometry)
// ============================================================================

/** wf = integrated Δ waterfall (T04B–E) · vwf = value cascade of one scenario (12A) */
export type MegaColType = "label" | "value" | "share" | "delta" | "dpct" | "bar" | "pin" | "wf" | "vwf";
export interface MegaCol {
    type: MegaColType;
    block: number;
    scen?: MegaScen;
    ref?: MegaRef;
    gap: "none" | "col" | "group" | "block" | "edge";
    head: string;
    x: number;
    w: number;
    // chart columns
    vals?: { r: MegaRow; v: number; D: MegaDelta }[];
    els?: MegaEl[];
    cap?: number;
    inner?: number;
    /** inner width from the share of the free width, before any growth for a minimum data span */
    baseInner?: number;
    /** 1.5.1: margin rows whose point difference is printed at the axis of this Δ bar / waterfall column */
    ppRows?: { r: MegaRow; D: MegaDelta }[];
    kSelf?: number;
    k?: number;
    x0?: number;
    /** cascade columns: segment per row id (shared cascade() of waterfall.ts) */
    casc?: Map<string, CascadeSeg>;
    /** 12G: the minuend value cascade of an FY block stacks YTD (solid) + rest of year (hatched) */
    stack?: boolean;
    /** second head text of a stacked column ("YTD", left-aligned over the solid part) */
    head2?: string;
    /** px reserved beyond the largest regular value for capped elements (outlier zone, UN 5.3) */
    zone?: number;
    /**
     * 1.5 scaling indicator: this column is drawn at `mag` × the table scale of
     * its unit (round factor, head reads "ΔPY ×5"). Absent = the table scale.
     */
    mag?: number;
}

/**
 * 1.5: one magnified group of chart columns — the scale note lists them.
 * 1.5.1: only the Δ family against the value cascades, one factor for the
 * whole table (block −1 = every block)
 */
export interface MegaMag {
    block: number;
    /** "delta" (Δ bars + Δ waterfalls) · "valueCascade" · "pct" (pins) */
    family: string;
    factor: number;
    /** heads of the magnified columns, without the factor */
    heads: string[];
}

export interface MegaCellText {
    t: string; bold: boolean; italic: boolean; fs: number; color: string;
    /** high contrast: a red threshold number is underlined instead of coloured */
    underline?: boolean;
}

export interface MegaLayout {
    G: MegaGeometry;
    input: MegaInput;
    fmt: MegaFmt;
    rows: MegaRow[];
    R: { r: MegaRow; y: number; h: number }[];
    cols: MegaCol[];
    charts: MegaCol[];
    N: ReturnType<typeof notation>;
    /** notation per block — a block's minFill (FY outlook: hatched AC&FC) changes its Δ fill only */
    NB: ReturnType<typeof notation>[];
    style: {
        signs: boolean; blockTitles: boolean; pairHeader: boolean; closing: boolean; thresholds: boolean;
        /** value cascade (12A): no gray row rules, sum rules across the table, no head rules */
        rowRules: boolean; continuousSumRules: boolean; headerRules: boolean;
    };
    sortInfo: { ref: MegaRef; block: number } | null;
    tableW: number;
    blockTitleY: number; colHeadY: number; markY: number; bodyTop: number; headH: number;
    /** font size + row height of the column heads and block titles (headFs; default fs / rowH) */
    headFs: number; headRowH: number;
    bodyBottom: number; footY: number; height: number;
    /** final k per block × family ("0:delta", "1:pct", "0:valueCascade") — equal within a unit unless magnified */
    famK: Record<string, number>;
    /**
     * 1.5: the table scale per unit ("amount": Δ bars, Δ waterfalls and value
     * cascades of every block; "pct": every pin) and the magnified groups
     */
    unitK: Record<string, number>;
    mags: MegaMag[];
    cellText: (c: MegaCol, r: MegaRow) => MegaCellText | null;
}

const CHART_TYPES = new Set<MegaColType>(["bar", "pin", "wf", "vwf"]);
export const megaIsChart = (c: MegaCol): boolean => CHART_TYPES.has(c.type);
export const megaIsBold = (r: MegaRow): boolean => r.kind === "sum" || r.kind === "formula";

/** references with at least one active element (the order of the Δ groups); never the minuend itself (PL) */
export function activeRefs(t: MegaToggles): MegaRef[] {
    return MEGA_REFS.filter(r => r !== t.min && (t.d[r].num || t.d[r].bar || t.d[r].wf || t.d[r].pct || t.d[r].pin));
}

/**
 * Amount text of the scale-sync fields (numbers.fixedMax / fixedVarMax):
 * "1500", "1.5k", "2,5m", "3b" (ChartKitchen parseRefValue) → data units.
 * Empty, unreadable, zero or negative = null (automatic).
 */
export function parseAmount(text: string): number | null {
    const raw = String(text ?? "").trim().replace(/\s/g, "").replace(",", ".");
    if (!raw) { return null; }
    const m = /^(\d*\.?\d+)([kKmMbB]?)$/.exec(raw);
    if (!m) { return null; }
    const mult = ({ k: 1e3, m: 1e6, b: 1e9 } as Record<string, number>)[m[2].toLowerCase()] ?? 1;
    const v = parseFloat(m[1]) * mult;
    return isFinite(v) && v > 0 ? v : null;
}

/** true when the toggles ask for at least one column — the mega table is on */
export function megaActive(t: MegaToggles): boolean {
    return t.showPY || t.showPL || t.showMin || activeRefs(t).length > 0;
}

/** Column list from the toggles (no template special case). */
export function buildColumns(t: MegaToggles, nb: number): MegaCol[] {
    const mk = (o: Partial<MegaCol>): MegaCol => ({ type: "value", block: 0, gap: "edge", head: "", x: 0, w: 0, ...o });
    const blockCols = (b: number): MegaCol[] => {
        const groups: MegaCol[][] = [];
        const vals: MegaScen[] = [];
        if (t.showPY) { vals.push("PY"); }
        // a PL minuend IS the plan column — one column, not two
        if (t.showPL && t.min !== "PL") { vals.push("PL"); }
        if (t.showMin) { vals.push(t.min); }
        // value cascade (12A): every scenario is a chart column of its own group
        if (t.valueCascade) { vals.forEach(s => groups.push([mk({ type: "vwf", scen: s })])); }
        else if (vals.length) { groups.push(vals.map(s => mk({ type: "value", scen: s }))); }
        // "% of revenue" right after the value columns (classic table: next to AC)
        if (t.share) {
            const sc = mk({ type: "share" });
            if (!t.valueCascade && vals.length) { groups[groups.length - 1].push(sc); } else { groups.push([sc]); }
        }
        for (const r of activeRefs(t)) {
            const g: MegaCol[] = [];
            const d = t.d[r];
            if (d.num) { g.push(mk({ type: "delta", ref: r })); }
            if (d.bar) { g.push(mk({ type: "bar", ref: r })); }
            if (d.wf) { g.push(mk({ type: "wf", ref: r })); }
            if (d.pct) { g.push(mk({ type: "dpct", ref: r })); }
            if (d.pin) { g.push(mk({ type: "pin", ref: r })); }
            if (g.length) { groups.push(g); }
        }
        const out: MegaCol[] = [];
        groups.forEach((g, gi) => g.forEach((c, ci) => {
            c.block = b; c.gap = ci ? "col" : gi ? "group" : "edge"; out.push(c);
        }));
        return out;
    };
    const label = mk({ type: "label", block: -1, gap: "edge" });
    const parts = nb === 2 ? [blockCols(0), [label], blockCols(1)] : [[label], blockCols(0)];
    const cols = ([] as MegaCol[]).concat(...parts);
    cols.forEach((c, i) => {
        if (i === 0) { c.gap = "none"; }
        else if (c.gap === "edge") { c.gap = nb === 2 ? "block" : "group"; }
    });
    return cols;
}

/**
 * Row order: structure data may be sorted per run (rows of one parent);
 * "Other …" stays at the bottom of its run. Statement data keeps its order.
 */
export function orderRows(input: MegaInput): { rows: MegaRow[]; info: { ref: MegaRef; block: number } | null } {
    const { t, blocks, rows } = input;
    if (input.statement || t.sort === "cat" || blocks.length === 0) { return { rows: rows.slice(), info: null }; }
    const bi = Math.max(0, Math.min(t.sortBlock, blocks.length - 1));
    const b = blocks[bi];
    const ref: MegaRef = activeRefs(t)[0] || (t.showPY ? "PY" : "PL");
    const key = (r: MegaRow): number => {
        const a = b.value(r, t.min);
        if (t.sort === "min") { return a ?? -Infinity; }
        const v = b.value(r, ref);
        return a == null || v == null ? -Infinity : a - v;
    };
    const sortRuns = (list: MegaRow[]): MegaRow[] => {
        const out: MegaRow[] = []; let run: MegaRow[] = [];
        const flush = (): void => {
            const rest = run.filter(r => !r.other).sort((x, y) => key(y) - key(x));
            out.push(...rest, ...run.filter(r => r.other)); run = [];
        };
        for (const r of list) {
            if (r.kind === "acc") {
                if (run.length && run[0].group !== r.group) { flush(); }
                run.push(r);
            } else { flush(); out.push(r); }
        }
        flush();
        return out;
    };
    // 1.5.2: the elements of the top visible level (the stretches between
    // spacer rows: a region block, a one-child group "Germany · Saxony", a
    // region without countries) are sorted too — in the same direction as
    // the rows inside them, by the key of their last row (the block total or
    // the single row). Until 1.5.1 the blocks kept the data order (T02F
    // Handel −1.38 before Export +0.17 while the rows ran the other way) and
    // single rows were never sorted (T02E). A stretch holding a cascade
    // anchor (the grand total) keeps its place, "Other …" goes last.
    const segs: MegaRow[][] = [[]];
    for (const r of rows) {
        if (r.kind === "gap") { segs.push([]); } else { segs[segs.length - 1].push(r); }
    }
    const real = segs.filter(s => s.length > 0);
    if (real.length < 2) { return { rows: sortRuns(rows), info: { ref, block: bi } }; }
    const fixed = (s: MegaRow[]): boolean => s.some(r => megaAnchor(r));
    const segKey = (s: MegaRow[]): number => key(s[s.length - 1]);
    const free = real.filter(s => !fixed(s));
    const order = [...free.filter(s => !s[s.length - 1].other).sort((x, y) => segKey(y) - segKey(x)),
        ...free.filter(s => s[s.length - 1].other)];
    let fi = 0;
    const gaps = rows.filter(r => r.kind === "gap");
    const out: MegaRow[] = [];
    real.forEach((s, i) => {
        if (i > 0 && gaps.length) { out.push(gaps[Math.min(i - 1, gaps.length - 1)]); }
        out.push(...sortRuns(fixed(s) ? s : order[fi++]));
    });
    return { rows: out, info: { ref, block: bi } };
}

/** effect sign of a row's displayed value (default 1) */
export const megaEff = (r: MegaRow): number => r.eff ?? 1;
/** "=" row of a cascade (default: formula rows) */
export const megaAnchor = (r: MegaRow): boolean => r.anchor ?? r.kind === "formula";

/**
 * Cascade of the visible rows (T04 Δ waterfall, 12A value cascade) through the
 * shared cascade() of waterfall.ts in IBCS statement mode ("span"): a row's
 * `group` (its parent) nests it below the parent row when that row is shown;
 * a total spans over its children, "=" rows anchor at 0, margin rows and
 * spacers carry no segment (the connector runs through them).
 */
export function megaCascade(rows: MegaRow[], val: (r: MegaRow) => number | null): Map<string, CascadeSeg> {
    const list = rows.filter(r => r.kind !== "gap" && r.kind !== "pct");
    const nodes = new Map<string, CascadeNode>();
    for (const r of list) {
        const v = val(r);
        nodes.set(r.id, { id: r.id, value: v != null && isFinite(v) ? v : null, anchor: megaAnchor(r), children: [] });
    }
    const roots: CascadeNode[] = [];
    for (const r of list) {
        const parent = r.group != null && r.group !== r.id ? nodes.get(r.group) : undefined;
        (parent ? parent.children : roots).push(nodes.get(r.id)!);
    }
    return cascade(roots, "span");
}

/** label of a cascade element: Δ waterfall = the row's Δ as printed, value cascade = the shown value */
function cascadeText(input: MegaInput, fmt: MegaFmt, c: MegaCol, r: MegaRow): string {
    const blk = input.blocks[c.block];
    if (c.type === "wf") {
        const D = blk.delta(r, input.t.min, c.ref!);
        return D ? fmt.delta(D.d) : "";
    }
    const v = blk.value(r, c.scen!);
    return v == null ? "" : fmt.val(v);
}

export function layoutMega(input: MegaInput): MegaLayout {
    const { t, blocks } = input;
    const G = megaGeometry(input.fs, input.rowK);
    const nb = blocks.length;
    const ord = orderRows(input);
    const rows = ord.rows;
    const sortInfo = ord.info;
    const fmt = megaFmt(input.num, input.dec, input.pdec, !!input.fin);
    const N = notation(t.min, activeRefs(t)[0] ?? null, !!input.hc);
    const NB = blocks.map(b => b.minFill && b.minFill !== t.min ? notation(b.minFill, activeRefs(t)[0] ?? null, !!input.hc) : N);
    const cols = buildColumns(t, nb);
    // 12G: the minuend value cascade of a block that knows its YTD share stacks
    for (const c of cols) {
        if (c.type === "vwf" && c.scen === t.min && blocks[c.block]?.ytd) { c.stack = true; }
    }
    const anyChart = cols.some(megaIsChart);
    const style = {
        signs: input.statement,
        blockTitles: (!input.statement || nb === 2 || blocks.some(b => b.titled)) && blocks.some(b => b.name !== ""),
        pairHeader: input.statement,
        closing: t.marks && input.statement && !anyChart,
        thresholds: t.thresholds && cols.some(c => c.type === "delta" || c.type === "dpct"),
        rowRules: !t.valueCascade,
        continuousSumRules: !!t.valueCascade,
        headerRules: !t.valueCascade,
    };
    const tw = (s: string, fs: number, bold = false, italic = false): number => input.measure(s, fs, bold, italic);
    // head font (style.headerFontSize) — the default keeps fs and rowH exactly
    const headFs = input.headFs && input.headFs > 0 ? input.headFs : G.fs;
    const headRowH = headFs > G.fs ? Math.round(headFs * 1.7) : G.rowH;

    // ---- cell text (number columns) ------------------------------------------
    const cellText = (c: MegaCol, r: MegaRow): MegaCellText | null => {
        const blk = blocks[c.block];
        if (!blk || r.kind === "gap") { return null; }
        const bold = megaIsBold(r); const pct = r.kind === "pct";
        const base = { bold, italic: pct, fs: pct ? G.fsSmall : G.fs, color: MEGA_C.text };
        if (c.type === "value") {
            const v = blk.value(r, c.scen!);
            return v == null ? null : { ...base, t: pct ? fmt.margin(v) : fmt.val(v) };
        }
        if (c.type === "share") {
            // "% of revenue": small italic soft numbers (classic table), none on margin rows
            const v = !pct && blk.share ? blk.share(r) : null;
            return v == null || !isFinite(v) ? null : { ...base, t: fmt.share(v), italic: true, fs: G.fsSmall, color: MEGA_C.soft };
        }
        const D = blk.delta(r, t.min, c.ref!);
        if (!D) { return null; }
        // an explicit "Δ in red if" rule wins over the materiality dampening
        const redText = (red: boolean): Partial<MegaCellText> =>
            ({ color: red ? input.pal.bad : D.immaterial ? MEGA_C.soft : MEGA_C.text, underline: red && input.hc ? true : undefined });
        if (c.type === "delta") {
            const red = t.thresholds && !pct && D.impact < blk.th.abs - 1e-9;
            return { ...base, t: pct ? fmt.pp(D.d) : fmt.delta(D.d), ...redText(red) };
        }
        if (c.type === "dpct") {
            // 1.5.1: a margin row has no relative Δ% (a percentage of a
            // percentage) — its Δ is the point difference in the Δ column
            if (D.p == null || pct) { return null; }
            const imp = D.impactPct;
            const red = t.thresholds && !pct && imp != null && imp < blk.th.pct - 1e-9;
            return { ...base, t: fmt.pct(D.p), ...redText(red) };
        }
        return null;
    };
    // "(↓)" sits at the head of the column that really sorts: the minuend value
    // column (sort = min) or the first absolute Δ column of the sorting reference
    // (sort = delta) of the sorting block. Is that column switched off, the order
    // stays as the author set it — silently sorting by another column would show
    // an order nobody asked for — and the indicator moves to the head of the
    // category column, naming the key: "(↓) ΔPL _November".
    const sortCol = !sortInfo ? null : cols.find(x => x.block === sortInfo.block && (t.sort === "min"
        ? (x.type === "value" || x.type === "vwf") && x.scen === t.min
        : x.ref === sortInfo.ref && x.type !== "dpct" && x.type !== "pin")) ?? null;
    const headerText = (c: MegaCol): string => {
        const blk = blocks[c.block];
        let s = c.type === "value" || c.type === "vwf" ? (blk?.alias?.[c.scen!] ?? c.scen!)
            : c.type === "share" ? (input.shareHead ?? "%")
                : c.type === "dpct" || c.type === "pin" ? "Δ" + c.ref + "%" : c.type === "label" ? "" : "Δ" + c.ref;
        if (sortInfo && c === sortCol) { s += "(↓)"; }
        if (sortInfo && !sortCol && c.type === "label") {
            const key = t.sort === "min" ? (blocks[sortInfo.block]?.alias?.[t.min] ?? t.min) : "Δ" + sortInfo.ref;
            s = "(↓) " + key + (nb === 2 && blocks[sortInfo.block].name ? " " + blocks[sortInfo.block].name : "");
        }
        return input.relabel ? input.relabel(s) : s;
    };
    const labelText = (r: MegaRow): string => r.label + (r.suffix ?? []).map(x => x.t).join("");

    // ---- fixed widths --------------------------------------------------------
    for (const c of cols) {
        c.head = headerText(c);
        if (c.stack) { c.head2 = input.relabel ? input.relabel(input.ytdHead ?? "YTD") : (input.ytdHead ?? "YTD"); }
        if (c.type === "label") {
            let w = 0;
            for (const r of rows) {
                if (r.kind === "gap") { continue; }
                const fsx = r.kind === "pct" ? G.fsSmall : G.fs;
                w = Math.max(w, (style.signs ? G.signW : 0) + r.level * G.indent
                    + tw(labelText(r), fsx, megaIsBold(r), r.kind === "pct"));
            }
            if (c.head) { w = Math.max(w, tw(c.head, headFs)); }
            c.w = Math.ceil(Math.max(w + 2 * G.pad, G.fs * 6));
        } else if (!megaIsChart(c)) {
            let w = tw(c.head, headFs);
            for (const r of rows) {
                const ct = cellText(c, r);
                if (ct) { w = Math.max(w, tw(ct.t, ct.fs, ct.bold, ct.italic)); }
            }
            c.w = Math.ceil(Math.max(w + 2 * G.pad, G.minNumW));
        }
    }
    const gapPx = (g: MegaCol["gap"]): number =>
        g === "col" ? G.colGap : g === "group" ? G.groupGap : g === "block" ? G.blockGap : 0;
    const fixedW = cols.reduce((s, c) => s + gapPx(c.gap) + (c.w || 0), 0);
    const charts = cols.filter(megaIsChart);
    const free = Math.max(0, input.viewW - fixedW);
    // weights: bars / pins 1 · Δ waterfall 1.2 · value cascade 1.5 (SPEC "Spaltenbreiten-Logik")
    const weight = (c: MegaCol): number => c.type === "vwf" ? 1.5 : c.type === "wf" ? 1.2 : 1;
    const sumW = charts.reduce((s, c) => s + weight(c), 0) || 1;
    for (const c of charts) {
        const max = c.type === "vwf" ? G.vwfMax : G.chartMax;
        c.w = Math.round(Math.min(max, Math.max(G.chartMin, free * weight(c) / sumW)));
        // a large head font (headFs) never clips the centred chart head
        if (headFs > G.fs) { c.w = Math.max(c.w, Math.ceil(tw(c.head, headFs) + 2 * G.pad)); }
        // a stacked column carries two heads ("YTD" left, the year right)
        if (c.head2) { c.w = Math.max(c.w, Math.ceil(tw(c.head, headFs) + tw(c.head2, headFs) + 3 * G.pad)); }
    }

    // ---- rows y --------------------------------------------------------------
    const blockTitleY = 2;
    const colHeadY = blockTitleY + (style.blockTitles ? headRowH : 0);
    const markY = colHeadY + headRowH;
    const bodyTop = markY + G.markH + Math.round(G.fs * 0.5);
    const headH = bodyTop - Math.round(G.fs * 0.3);
    let y = bodyTop;
    const R: MegaLayout["R"] = [];
    let lastGap = true;
    for (const r of rows) {
        if (r.kind === "gap") {
            // a spacer at the very top or twice in a row carries no structure
            if (!lastGap) { y += G.gapRowH; lastGap = true; }
            continue;
        }
        R.push({ r, y, h: G.rowH }); y += G.rowH; lastGap = false;
    }
    if (lastGap && R.length > 0 && rows.length > 0 && rows[rows.length - 1].kind === "gap") { y -= G.gapRowH; }
    const bodyBottom = y;
    const footY = bodyBottom + (style.closing ? G.markH + 4 : 2);
    const height = footY + (style.thresholds ? G.rowH : 0) + 4;

    // ---- scale: one per unit over the whole table (1.5, IBCS 2.0 / ISO 24896) --
    // Same unit, same scale: the Δ bars, Δ waterfalls and value cascades of
    // every period block share ONE k ("amount"), every Δ% pin another ("pct").
    // A block or column that would become unreadable at that scale is drawn
    // magnified by a round factor and says so in its head ("ΔPY ×5") and in
    // the scale note — never rescaled silently (UN 5.2, CH 4.3 / 4.5).
    const lblW = (s: string, bold: boolean): number => t.labels ? tw(s, G.fs, bold) + G.lblGap : 0;
    for (const c of charts) {
        const blk = blocks[c.block];
        c.els = [{ p: 0, q: 0, a: 3, c: 3 }]; // the axis itself
        c.vals = [];
        // 1.5.1: margin rows next to Δ bars / a Δ waterfall (T04A–E) print their
        // point difference as a number at the axis — the same "+8.6 pp" the Δ
        // column of T03 shows (columns.showPctRows decides both); a percentage
        // point is no amount, so it never becomes a bar
        if ((c.type === "bar" || c.type === "wf") && t.labels
            && !cols.some(x => x.type === "delta" && x.block === c.block && x.ref === c.ref)) {
            for (const { r } of R) {
                if (r.kind !== "pct") { continue; }
                const D = blk.delta(r, t.min, c.ref!);
                if (!D || !D.pp || !isFinite(D.d)) { continue; }
                const w = tw(fmt.pp(D.d), G.fsSmall, false, true) + G.lblGap;
                (c.ppRows = c.ppRows ?? []).push({ r, D });
                c.els.push(D.d >= 0 ? { p: 0, q: 0, a: 0, c: w + 3 } : { p: 0, q: 0, a: w + 3, c: 0 });
            }
        }
        if (c.type === "wf") {
            // Δ waterfall: the Δ of every row in its effect on the result
            c.casc = megaCascade(R.map(x => x.r), r => {
                const D = blk.delta(r, t.min, c.ref!);
                return D && !D.pp ? D.d * megaEff(r) : null;
            });
            continue;
        }
        if (c.type === "vwf") {
            c.casc = megaCascade(R.map(x => x.r), r => {
                const v = blk.value(r, c.scen!);
                return v == null ? null : v * megaEff(r);
            });
            continue;
        }
        for (const { r } of R) {
            if (r.kind === "pct") { continue; }
            const D = blk.delta(r, t.min, c.ref!);
            if (!D) { continue; }
            const v = c.type === "bar" ? D.d : D.p == null ? null : D.p * 100;
            if (v != null && isFinite(v)) { c.vals.push({ r, v, D }); }
        }
    }
    // outlier cap: ONE limit per family over all blocks (all pin columns of the
    // table share it, the Δ bars another). Tukey decides per block what is an
    // outlier there (a month's amounts are no outliers of the year); the common
    // limit is the largest regular value of any block, so a value that stays
    // regular in one block is never capped in another
    for (const fam of ["pin", "bar"] as MegaColType[]) {
        const cs = charts.filter(c => c.type === fam);
        let cap = -Infinity; let any = false;
        for (let b = 0; b < nb; b++) {
            const allV = ([] as number[]).concat(...cs.filter(c => c.block === b).map(c => c.vals!.map(o => Math.abs(o.v))));
            if (!allV.length) { continue; }
            const capB = fam === "pin" || t.capBars ? outlierCap(allV) : Infinity;
            if (capB !== Infinity) { any = true; }
            cap = Math.max(cap, capB === Infinity ? Math.max(...allV) : capB);
        }
        cs.forEach(c => { c.cap = any ? cap : Infinity; });
    }
    // scale sync (fixedMax / fixedVarMax): phantom elements hold the scale at
    // least at [0, max] (value cascades) / ±max (Δ bars and Δ waterfalls),
    // label room of the bold max number included — CK "minimum maximum"
    const phantom = (c: MegaCol): void => {
        if (c.type === "vwf" && input.fixedMax && input.fixedMax > 0) {
            const F = input.fixedMax;
            c.els!.push({ p: 0, q: F, a: 0, c: lblW(fmt.val(F), true) });
        } else if ((c.type === "bar" || c.type === "wf") && input.fixedVarMax && input.fixedVarMax > 0) {
            const F = input.fixedVarMax;
            c.els!.push({ p: -F, q: 0, a: lblW(fmt.delta(-F), true), c: 0 }, { p: 0, q: F, a: 0, c: lblW(fmt.delta(F), true) });
        }
    };
    const blk0 = (c: MegaCol): MegaBlock => blocks[c.block];
    for (const c of charts) {
        if (c.casc) {
            for (const { r } of R) {
                const seg = c.casc.get(r.id);
                if (!seg) { continue; }
                const lw = lblW(cascadeText(input, fmt, c, r), megaIsBold(r));
                const up = seg.e >= seg.s;
                // 1.5.2 (12G): room for the YTD number before the bar start, where
                // it stands when the solid part is too short to hold it
                const yv = c.stack && blk0(c).ytd ? blk0(c).ytd!(r) : null;
                const yw = yv != null && isFinite(yv) ? lblW(fmt.val(yv), megaIsBold(r)) : 0;
                c.els!.push({ p: Math.min(seg.s, seg.e), q: Math.max(seg.s, seg.e), a: up ? yw : lw, c: up ? lw : yw });
            }
            phantom(c);
            continue;
        }
        const side = c.type === "pin" ? G.pinHead / 2 + G.lblGap : 0;
        // the outlier zone: ~12 % of the column, at least two triangle lengths
        c.zone = Math.max(2 * G.arrowW, Math.round(MEGA_OUTLIER.zone * (c.w - 2 * G.pad)));
        for (const { r, v, D } of c.vals!) {
            const capped = Math.abs(v) > c.cap!;
            const vv = capped ? Math.sign(v) * c.cap! : v;
            const text = c.type === "bar" ? fmt.delta(v) : fmt.pin(D.p!);
            // a capped element: zone + triangle, its number outside beyond the tip
            const extra = (capped ? c.zone + G.arrowW : side) + lblW(text, megaIsBold(r));
            if (vv >= 0) { c.els!.push({ p: 0, q: vv, a: 0, c: extra }); }
            else { c.els!.push({ p: vv, q: 0, a: extra, c: 0 }); }
        }
        phantom(c);
    }
    // groups: per block, Δ bars + Δ waterfall share "delta", pins "pct", value
    // cascades "valueCascade"; units: "delta" and "valueCascade" are amounts
    const family = (c: MegaCol): string => c.type === "pin" ? "pct" : c.type === "vwf" ? "valueCascade" : "delta";
    const unitOf = (fam: string): string => fam === "pct" ? "pct" : "amount";
    const famK: Record<string, number> = {};
    for (const c of charts) {
        c.inner = c.w - 2 * G.pad;
        c.baseInner = c.inner;
        c.kSelf = solveK(c.els!, c.inner);
        // minimum data span: the drawn area (without labels) must stay ≥ minSpan —
        // the column grows (the table scrolls) instead of collapsing the bars
        const span = Math.max(...c.els!.map(e => e.q)) - Math.min(...c.els!.map(e => e.p));
        if (span > 0 && c.kSelf * span < G.minSpan) {
            const kMin = G.minSpan / span;
            const [a, b] = megaNeeds(c.els!, kMin);
            c.inner = Math.ceil(a + b); c.w = c.inner + 2 * G.pad; c.kSelf = kMin;
        }
    }
    // (1) one k per block × family = the smallest k of its columns. The minimum
    // data span holds per column only at that column's own k — a family partner
    // with far larger values (ΔPL bars next to tiny ΔPY bars, a cascade next to
    // bars) can push the shared k below it. Then the family k is raised to what
    // the smallest column needs, as far as every column of the family can grow
    // up to its width limit (chartMax / vwfMax; a column already wider keeps its
    // width); the binding columns grow to the needs at that k — the table
    // scrolls instead of collapsing bars. Beyond that limit the shared scale
    // wins: a column of tiny values next to huge ones stays short (comparable
    // lengths are the point of ONE scale).
    const spanOf = (c: MegaCol): number => Math.max(...c.els!.map(e => e.q)) - Math.min(...c.els!.map(e => e.p));
    const fams = new Map<string, MegaCol[]>();
    for (const c of charts) {
        const key = c.block + ":" + family(c);
        const list = fams.get(key);
        if (list) { list.push(c); } else { fams.set(key, [c]); }
    }
    const groupK = new Map<string, number>();
    for (const [key, cs] of fams) {
        let k = Math.min(...cs.map(c => c.kSelf!));
        const live = cs.filter(c => spanOf(c) > 0);
        const kNeed = live.reduce((m, c) => Math.max(m, G.minSpan / spanOf(c)), 0);
        if (live.length > 1 && kNeed > k * (1 + 1e-9)) {
            const maxInner = (c: MegaCol): number => (c.type === "vwf" ? G.vwfMax : G.chartMax) - 2 * G.pad;
            const kCap = Math.min(...live.map(c => solveK(c.els!, Math.max(c.inner!, maxInner(c)))));
            const k2 = Math.min(kNeed, Math.max(k, kCap));
            if (k2 > k) {
                k = k2;
                for (const c of cs) {
                    const [a, b] = megaNeeds(c.els!, k);
                    if (a + b > c.inner!) { c.inner = Math.ceil(a + b); c.w = c.inner + 2 * G.pad; }
                }
            }
        }
        groupK.set(key, k);
    }
    // (2) one k per unit over the whole table = the smallest group k
    const unitK: Record<string, number> = {};
    for (const [key, cs] of fams) {
        const u = unitOf(family(cs[0]));
        unitK[u] = Math.min(unitK[u] ?? Infinity, groupK.get(key)!);
    }
    // (3) 1.5.1: blocks of one table (month | YTD | FY) never get a factor
    // against each other — every Δ bar / Δ waterfall of every block draws at
    // ONE Δ scale, every pin at ONE pin scale (T02B drew "ΔPL ×2" on the month
    // while T02C, almost the same ratio, stayed ×1). The only factor left is
    // the Δ family against the value cascades (12A, 12G, 12H): when the largest
    // Δ span would fall below the minimum data span at the cascade scale, ALL
    // Δ columns of the table are drawn magnified by one round factor (the one
    // the tightest Δ group still holds) and their heads say so ("ΔPY ×5").
    const mags: MegaMag[] = [];
    const deltaKeys = [...fams.keys()].filter(key => family(fams.get(key)![0]) === "delta");
    const hasCascade = [...fams.values()].some(cs => family(cs[0]) === "valueCascade");
    let deltaMag = 1;
    if (hasCascade && deltaKeys.length) {
        const kU = unitK.amount;
        const span = Math.max(...deltaKeys.map(key => Math.max(...fams.get(key)!.map(spanOf))));
        const kG = Math.min(...deltaKeys.map(key => groupK.get(key)!));
        if (span > 0 && span * kU < G.minSpan && kG >= 2 * kU * (1 - 1e-9)) {
            const m = niceFactor(kG / kU * (1 + 1e-9));
            if (m >= 2) { deltaMag = m; }
        }
    }
    for (const [key, cs] of fams) {
        const fam = family(cs[0]);
        let k = unitK[unitOf(fam)];
        if (fam === "delta" && deltaMag > 1) {
            k *= deltaMag;
            cs.forEach(c => { c.mag = deltaMag; });
        }
        famK[key] = k;
    }
    if (deltaMag > 1) {
        const heads: string[] = [];
        for (const key of deltaKeys) { for (const c of fams.get(key)!) { if (!heads.includes(c.head)) { heads.push(c.head); } } }
        mags.push({ block: -1, family: "delta", factor: deltaMag, heads });
    }
    // a column that grew for a scale it no longer draws at (its own or its
    // block's k, above the table scale) shrinks back to what the table scale
    // needs — never below its share of the free width
    for (const c of charts) {
        const [a, b] = megaNeeds(c.els!, famK[c.block + ":" + family(c)]);
        const inner = Math.max(c.baseInner!, Math.ceil(a + b));
        if (inner < c.inner!) { c.inner = inner; c.w = inner + 2 * G.pad; }
    }
    // the scaling indicator sits in the head of every magnified column; a
    // column too narrow for the longer head grows (the extra width is slack,
    // the scale stays)
    for (const c of charts) {
        if (!c.mag) { continue; }
        c.head += " ×" + c.mag;
        const need = Math.ceil(tw(c.head, headFs) + 2 * G.pad + (c.head2 ? tw(c.head2, headFs) + G.pad : 0));
        if (need > c.w) { c.inner = c.inner! + need - c.w; c.w = need; }
    }
    let x = 0;
    for (const c of cols) { x += gapPx(c.gap); c.x = x; x += c.w; }
    const tableW = x;
    for (const c of charts) {
        c.k = famK[c.block + ":" + family(c)];
        const [L, Rr] = megaNeeds(c.els!, c.k);
        const slack = Math.max(0, c.inner! - L - Rr);
        c.x0 = c.x + G.pad + L + slack / 2;
    }

    return {
        G, input, fmt, rows, R, cols, charts, N, NB, style, sortInfo, tableW,
        blockTitleY, colHeadY, markY, bodyTop, headH, headFs, headRowH, bodyBottom, footY, height, famK, unitK, mags, cellText,
    };
}

// ============================================================================
// 7 · Painter (SVG)
// ============================================================================

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl<K extends keyof SVGElementTagNameMap>(
    tag: K, attrs: Record<string, string | number | null | undefined>, parent?: Element
): SVGElementTagNameMap[K] {
    const n = document.createElementNS(SVG_NS, tag);
    for (const k of Object.keys(attrs)) {
        const v = attrs[k];
        if (v != null) { n.setAttribute(k, String(v)); }
    }
    if (parent) { parent.appendChild(n); }
    return n;
}

export interface MegaPaintOpts {
    font: string;
    /** text color of the column heads */
    headInk: string;
    /** adds a hatch pattern of `color` to `svg` under `id` (visual.hatchPattern) */
    hatchPattern: (svg: SVGSVGElement, id: string, color: string) => void;
    /** unique prefix for pattern ids (several visuals per page) */
    uid: string;
    selectedId: string | null;
    selWash: string;
    selAccent: string;
    /**
     * rows to emphasize (columns.highlight, ChartKitchen emphBand): a quiet ink
     * band at 7 % over the whole row; high contrast draws a 1 px outline instead
     */
    highlight?: { ids: Set<string>; ink: string; hc: boolean };
    /**
     * virtualization (1.1, long statements): paint only the rows L.R[from, to)
     * of the body — the layout stays complete, so the body keeps its full
     * height, the zero axes run through and every connector that crosses the
     * window is drawn; rows outside carry no element and no hit area. Omitted
     * = every row (the output is then exactly that of 1.0).
     */
    window?: { from: number; to: number };
}

export interface MegaPainted {
    head: SVGSVGElement;
    body: SVGSVGElement;
    /** transparent hit areas per row (label part / value part), on top of everything */
    hits: { r: MegaRow; label: SVGRectElement; cells: SVGRectElement }[];
}

export function paintMega(L: MegaLayout, o: MegaPaintOpts): MegaPainted {
    const { G, R, cols, N, style, input } = L;
    const { t, blocks, pal } = input;
    const fmt = L.fmt;
    const W = Math.max(1, Math.ceil(L.tableW) + 1);
    const win = o.window;
    const inW = (i: number): boolean => !win || (i >= win.from && i < win.to);
    const hfs = L.headFs; const hRow = L.headRowH;

    const mkSvg = (y0: number, h: number, kind: string): {
        svg: SVGSVGElement; rules: SVGGElement; charts: SVGGElement; text: SVGGElement; hatch: (c: string) => string;
    } => {
        const svg = svgEl("svg", {
            width: W, height: Math.max(1, Math.ceil(h)), viewBox: `0 ${y0} ${W} ${Math.max(1, Math.ceil(h))}`,
            "font-family": o.font, "font-size": G.fs, fill: MEGA_C.text,
        });
        svg.style.display = "block";
        svg.setAttribute("data-pnl", "mega-" + kind);
        const hatches = new Map<string, string>();
        const hatch = (color: string): string => {
            let ref = hatches.get(color);
            if (!ref) {
                const id = `${o.uid}mg${kind}${hatches.size}`;
                o.hatchPattern(svg, id, color);
                ref = `url(#${id})`;
                hatches.set(color, ref);
            }
            return ref;
        };
        const rules = svgEl("g", { "shape-rendering": "crispEdges" }, svg);
        const charts = svgEl("g", {}, svg);
        const text = svgEl("g", {}, svg);
        return { svg, rules, charts, text, hatch };
    };
    const H = mkSvg(0, L.headH, "head");
    const B = mkSvg(L.headH, L.height - L.headH, "body");

    type Layer = typeof H;
    const text = (ly: Layer, x: number, y: number, s: string, oo: {
        anchor?: string; bold?: boolean; italic?: boolean; fs?: number; color?: string; parent?: Element; halo?: boolean;
        underline?: boolean;
    } = {}): SVGTextElement => {
        const n = svgEl("text", {
            x, y, "text-anchor": oo.anchor || "start", "font-weight": oo.bold ? "bold" : null,
            "font-style": oo.italic ? "italic" : null, "font-size": oo.fs && oo.fs !== G.fs ? oo.fs : null,
            fill: oo.color || null, "text-decoration": oo.underline ? "underline" : null,
        }, oo.parent || ly.text);
        if (oo.halo) {
            n.setAttribute("stroke", MEGA_C.white); n.setAttribute("stroke-width", "3");
            n.setAttribute("paint-order", "stroke"); n.setAttribute("stroke-linejoin", "round");
        }
        n.textContent = s;
        return n;
    };
    const base = (y: number, h: number, fs?: number): number => y + h / 2 + (fs || G.fs) * 0.35;
    const hline = (ly: Layer, x1: number, x2: number, y: number, color: string, sw = 1): void => {
        svgEl("line", { x1, x2, y1: y, y2: y, stroke: color, "stroke-width": sw }, ly.rules);
    };
    const vline = (ly: Layer, x: number, y1: number, y2: number, color: string, sw: number, parent?: Element): void => {
        svgEl("line", { x1: x, x2: x, y1, y2, stroke: color, "stroke-width": sw }, parent || ly.rules);
    };
    const rect = (x: number, y: number, w: number, h: number, st: MegaPaint, parent: Element): SVGRectElement =>
        svgEl("rect", {
            x, y, width: Math.max(w, 0), height: h, fill: st.fill, stroke: st.stroke,
            "stroke-width": st.stroke ? st.sw : null, "stroke-dasharray": st.stroke && st.dash ? st.dash : null,
        }, parent);

    // ---- head ----------------------------------------------------------------
    const paintMark = (ly: Layer, kind: string, x: number, w: number, y?: number): void => {
        const yy = y ?? L.markY;
        if (kind === "solid") { rect(x, yy, w, G.markH, { fill: MEGA_C.ink, stroke: null, sw: 0 }, ly.rules); }
        else if (kind === "gray" && input.hc) {
            // high contrast: PY = AC in colour — the PY mark is a dashed band
            svgEl("line", {
                x1: x, x2: x + w, y1: yy + G.markH / 2, y2: yy + G.markH / 2, stroke: MEGA_C.py,
                "stroke-width": G.markH, "stroke-dasharray": "3,2", "data-pnl": "mega-mark-py",
            }, ly.rules);
        } else if (kind === "gray") { rect(x, yy, w, G.markH, { fill: MEGA_C.py, stroke: null, sw: 0 }, ly.rules); }
        else if (kind === "double") {
            hline(ly, x, x + w, yy + 0.5, MEGA_C.ink);
            hline(ly, x, x + w, yy + G.markH - 0.5, MEGA_C.ink);
        } else if (kind === "hatch") {
            rect(x + 0.5, yy + 0.5, w - 1, G.markH - 1, { fill: ly.hatch(MEGA_C.ink), stroke: MEGA_C.ink, sw: 0.75 }, ly.rules);
        } else if (kind === "rule") {
            hline(ly, x, x + w, Math.round(yy + G.markH / 2) + 0.5, MEGA_C.ink);
        }
    };
    if (style.blockTitles) {
        blocks.forEach((b, bi) => {
            const bc = cols.filter(c => c.block === bi);
            if (!bc.length) { return; }
            const x1 = bc[0].x; const x2 = bc[bc.length - 1].x + bc[bc.length - 1].w;
            text(H, (x1 + x2) / 2, base(L.blockTitleY, hRow, hfs), b.name, { anchor: "middle", color: o.headInk, fs: hfs });
            hline(H, x1, x2, L.blockTitleY + hRow - 0.5, MEGA_C.ink);
        });
    }
    for (let i = 0; i < cols.length; i++) {
        const c = cols[i];
        const ty = base(L.colHeadY, hRow, hfs);
        const ho = { color: o.headInk, fs: hfs };
        if (c.type === "label") {
            // the sort indicator lands here when its column is switched off
            if (c.head) { text(H, c.x + G.pad, ty, c.head, ho); }
            if (style.headerRules) { paintMark(H, "rule", c.x, c.w); }
            continue;
        }
        if (c.type === "value") {
            text(H, c.x + c.w - G.pad, ty, c.head, { anchor: "end", ...ho });
            paintMark(H, t.marks ? N.mark(c.scen!) : "rule", c.x, c.w);
            continue;
        }
        const n = cols[i + 1];
        if (c.type === "delta" && style.pairHeader && n && n.type === "dpct" && n.ref === c.ref && n.block === c.block) {
            text(H, n.x + n.w - G.pad, ty, c.head, { anchor: "end", ...ho });
            if (style.headerRules) { paintMark(H, "rule", c.x, n.x + n.w - c.x); }
            i++; continue;
        }
        if (c.type === "delta" || c.type === "dpct" || c.type === "share") {
            text(H, c.x + c.w - G.pad, ty, c.head, { anchor: "end", ...ho });
        } else if (c.head2) {
            // stacked value cascade (12G): "YTD" over the solid part, the year at the end
            text(H, c.x + G.pad, ty, c.head2, ho);
            text(H, c.x + c.w - G.pad, ty, c.head, { anchor: "end", ...ho });
        } else { text(H, c.x + c.w / 2, ty, c.head, { anchor: "middle", ...ho }); }
        if (style.headerRules) { paintMark(H, "rule", c.x, c.w); }
    }

    // ---- highlight bands (IBCS EMPHASIZE, behind everything of the body) -------
    if (o.highlight && o.highlight.ids.size > 0) {
        const hl = o.highlight;
        for (let i = 0; i < R.length; i++) {
            const { r, y, h } = R[i];
            if (!inW(i) || !hl.ids.has(r.id)) { continue; }
            svgEl("rect", hl.hc
                ? { x: 0.5, y: y + 0.5, width: Math.max(1, L.tableW - 1), height: h - 1, fill: "none", stroke: hl.ink, "stroke-width": 1, "data-pnl": "mega-hl" }
                : { x: 0, y, width: L.tableW, height: h, fill: hl.ink, "fill-opacity": 0.07, "data-pnl": "mega-hl" }, B.rules);
        }
    }

    // ---- selection wash (behind everything of the body) -----------------------
    if (o.selectedId != null) {
        const sel = R.find(x => x.r.id === o.selectedId);
        if (sel) {
            svgEl("rect", { x: 0, y: sel.y, width: L.tableW, height: sel.h, fill: o.selWash }, B.rules);
            svgEl("rect", { x: 0, y: sel.y + sel.h - 2, width: L.tableW, height: 2, fill: o.selAccent }, B.rules);
        }
    }

    // ---- body: rules -----------------------------------------------------------
    for (let i = 0; i < R.length; i++) {
        if (!inW(i)) { continue; }
        const { r, y, h } = R[i];
        const next = R[i + 1];
        const contiguous = next && next.y === y + h;
        if (megaIsBold(r)) {
            if (style.continuousSumRules) { hline(B, cols.length ? cols[0].x : 0, L.tableW, y + 0.5, MEGA_C.ink); }
            else { for (const c of cols) { hline(B, c.x, c.x + c.w, y + 0.5, MEGA_C.ink); } }
        }
        if (style.rowRules && r.kind === "acc" && !(contiguous && megaIsBold(next.r))) {
            for (const c of cols) { hline(B, c.x, c.x + c.w, y + h - 0.5, MEGA_C.rule); }
        }
    }
    if (style.closing) {
        for (const c of cols) {
            if (c.type === "value") { paintMark(B, N.mark(c.scen!), c.x, c.w, L.bodyBottom + 2); }
            else { hline(B, c.x, c.x + c.w, L.bodyBottom + 0.5, MEGA_C.ink); }
        }
    }

    // ---- body: numbers + labels ------------------------------------------------
    for (let i = 0; i < R.length; i++) {
        if (!inW(i)) { continue; }
        const { r, y, h } = R[i];
        for (const c of cols) {
            if (c.type === "label") {
                const fsx = r.kind === "pct" ? G.fsSmall : G.fs;
                const ty = base(y, h, fsx);
                const bold = megaIsBold(r);
                if (style.signs && r.op) { text(B, c.x + G.pad, ty, r.op, { bold }); }
                const tn = text(B, c.x + G.pad + (style.signs ? G.signW : 0) + r.level * G.indent, ty, r.label,
                    { bold, italic: r.kind === "pct", fs: fsx });
                for (const sfx of r.suffix ?? []) {
                    const sp = svgEl("tspan", { fill: sfx.color, "font-weight": "normal", "font-style": "normal" }, tn);
                    sp.textContent = sfx.t;
                }
                continue;
            }
            if (megaIsChart(c)) { continue; }
            const ct = L.cellText(c, r);
            if (ct) {
                text(B, c.x + c.w - G.pad, base(y, h, ct.fs), ct.t,
                    { anchor: "end", bold: ct.bold, italic: ct.italic, fs: ct.fs, color: ct.color, underline: ct.underline });
            }
        }
    }

    // ---- body: chart columns ---------------------------------------------------
    for (const c of L.charts) { paintChartColumn(L, c, B, text, base, vline, rect, pal, win); }

    // ---- footer "Δ in red if" --------------------------------------------------
    if (style.thresholds) {
        const fy = base(L.footY, G.rowH, G.fsSmall);
        const oo = { italic: true, fs: G.fsSmall, color: MEGA_C.soft, anchor: "end" };
        blocks.forEach((b, bi) => {
            const bc = cols.filter(c => c.block === bi);
            const firstD = bc.findIndex(c => c.type === "delta" || c.type === "dpct");
            if (firstD < 0) { return; }
            const before = bc[firstD - 1];
            const lx = before ? before.x + before.w - G.pad : bc[firstD].x - G.groupGap;
            text(B, lx, fy, input.redIf, oo);
            // the thresholds print with the decimals they carry (−20.5 stays −20.5) —
            // the red test compares the exact value, the footer must name it
            const pp = b.th.pct * 100;
            for (const c of bc) {
                if (c.type === "delta") { text(B, c.x + c.w - G.pad, fy, "<" + fmt.signed(b.th.abs, megaDecimals(b.th.abs), false), oo); }
                if (c.type === "dpct") { text(B, c.x + c.w - G.pad, fy, "<" + fmt.signed(pp, megaDecimals(pp), false) + "%", oo); }
            }
        });
    }

    // ---- hit areas (top of the body) -------------------------------------------
    const gHit = svgEl("g", { "data-pnl": "mega-hits" }, B.svg);
    const labelCol = cols.find(c => c.type === "label")!;
    const hits: MegaPainted["hits"] = [];
    for (let i = 0; i < R.length; i++) {
        if (!inW(i)) { continue; }
        const { r, y, h } = R[i];
        const lab = svgEl("rect", {
            x: labelCol.x, y, width: labelCol.w, height: h, fill: "none", "pointer-events": "all",
            "data-pnl-row": r.id, "data-pnl-part": "label",
        }, gHit);
        const cells = svgEl("rect", {
            x: 0, y, width: L.tableW, height: h, fill: "none", "pointer-events": "all",
            "data-pnl-row": r.id, "data-pnl-part": "cells",
        }, gHit);
        // the label hit sits above the full-row hit (it owns the fold click)
        gHit.appendChild(lab);
        hits.push({ r, label: lab, cells });
    }
    return { head: H.svg, body: B.svg, hits };
}

type TextFn = (ly: { text: SVGGElement; hatch: (c: string) => string }, x: number, y: number, s: string, oo?: {
    anchor?: string; bold?: boolean; italic?: boolean; fs?: number; color?: string; parent?: Element; halo?: boolean;
}) => SVGTextElement;

function paintChartColumn(
    L: MegaLayout, c: MegaCol,
    B: { svg: SVGSVGElement; rules: SVGGElement; charts: SVGGElement; text: SVGGElement; hatch: (c: string) => string },
    text: TextFn,
    base: (y: number, h: number, fs?: number) => number,
    vline: (ly: typeof B, x: number, y1: number, y2: number, color: string, sw: number, parent?: Element) => void,
    rect: (x: number, y: number, w: number, h: number, st: MegaPaint, parent: Element) => SVGRectElement,
    pal: { good: string; bad: string },
    win?: { from: number; to: number },
): void {
    const { G, R, input } = L;
    const N = L.NB[c.block] ?? L.N;
    const fmt = L.fmt;
    const X = (v: number): number => c.x0! + v * c.k!;
    const g = svgEl("g", { "data-pnl": "mega-chart" }, B.charts);
    const gAx = svgEl("g", { "shape-rendering": "crispEdges" }, g);
    // zero axis over the whole block, notation by subtrahend
    const y1 = L.headH; const y2 = L.bodyBottom;
    // value cascade (12A): a plain 1 px ink zero line
    const axisKind: "gray" | "double" | "value" = c.type === "vwf" ? "value" : notation(input.t.min, c.ref!).axis;
    const ax = Math.round(c.x0!);
    const axisHalf = axisKind === "double" ? G.axisPLGap / 2 + 1 : axisKind === "gray" ? G.axisPY / 2 : 0.5;
    const paintAxis = (): void => {
        if (axisKind === "gray") { vline(B, ax, y1, y2, MEGA_C.py, G.axisPY, gAx); }
        else if (axisKind === "double") {
            vline(B, ax - G.axisPLGap / 2 - 0.5, y1, y2, MEGA_C.ink, 1, gAx);
            vline(B, ax + G.axisPLGap / 2 + 0.5, y1, y2, MEGA_C.ink, 1, gAx);
        } else { vline(B, ax + 0.5, y1, y2, MEGA_C.ink, 1, gAx); }
    };
    const label = (x: number, y: number, s: string, anchor: string, bold: boolean, halo?: boolean): void => {
        if (!input.t.labels) { return; }
        if (halo) {
            // a capped element carries its number ON the stem / bar (12A "+983 →"):
            // a paper box behind the digits keeps the 3 px pin stem out of them
            const w = input.measure(s, G.fs, bold, false);
            svgEl("rect", {
                x: (anchor === "end" ? x - w : x) - 1.5, y: y - G.fs * 0.85, width: w + 3, height: G.fs * 1.05,
                fill: MEGA_C.white, "data-pnl": "mega-halo",
            }, g);
        }
        text(B, x, y, s, { anchor, bold, parent: g, halo });
    };
    const hc = !!input.hc;
    const arrow = (xTip: number, cy: number, dir: number, hgt: number, fill: string, hollow = false): void => {
        svgEl("path", {
            d: `M${xTip},${cy} L${xTip - dir * G.arrowW},${cy - hgt / 2} L${xTip - dir * G.arrowW},${cy + hgt / 2} Z`,
            fill: hollow ? MEGA_C.white : fill, stroke: hollow ? MEGA_C.ink : null, "stroke-width": hollow ? 1 : null,
        }, g);
    };
    // break mark of a capped element (UN 5.3): two slanted strokes in the paper
    // tone cut the bar / stem just past the largest regular value
    const breakMark = (xb: number, cy: number, dir: number, hgt: number): void => {
        const h = hgt / 2 + 2; const s = 2.5;
        const d = [0, 3.5].map(o => {
            const xm = xb + dir * o;
            return `M${xm - s},${cy + h} L${xm + s},${cy - h}`;
        }).join(" ");
        svgEl("path", { d, stroke: MEGA_C.white, "stroke-width": 1.6, fill: "none", "data-pnl": "mega-break" }, g);
    };
    // high contrast: good and bad share the foreground — unfavourable is hollow
    const hollow: MegaPaint = { fill: MEGA_C.white, stroke: MEGA_C.ink, sw: 1.4 };
    const hatch = B.hatch;
    // 1.5.2: boxes of the numbers a cascade connector must not run through
    const avoid: { x0: number; x1: number; y0: number; y1: number }[] = [];
    // 1.5.1: the point difference of a margin row, as a number at the axis (T04)
    for (const { r, D } of c.ppRows ?? []) {
        const i = R.findIndex(x => x.r === r);
        if (i < 0 || (win && (i < win.from || i >= win.to))) { continue; }
        const { y, h: rh } = R[i];
        const up = D.d >= 0;
        const px = up ? c.x0! + axisHalf + G.lblGap : c.x0! - axisHalf - G.lblGap;
        const py = base(y, rh, G.fsSmall);
        const pw = input.measure(fmt.pp(D.d), G.fsSmall, false, true);
        avoid.push({ x0: up ? px : px - pw, x1: up ? px + pw : px, y0: py - G.fsSmall * 0.85, y1: py + G.fsSmall * 0.25 });
        text(B, px, py, fmt.pp(D.d), {
            anchor: up ? "start" : "end", italic: true, fs: G.fsSmall, parent: g,
            color: D.immaterial ? MEGA_C.soft : MEGA_C.text,
        }).setAttribute("data-pnl", "mega-pp");
    }
    if (c.casc) {
        // the drawn axis band (the 12A value line sits half a pixel right)
        paintCascade(L, c, B, g, X, label, vline, rect, paintAxis, pal,
            { x: axisKind === "value" ? ax + 0.5 : ax, half: axisHalf }, win, avoid);
        return;
    }
    const byRow = new Map(c.vals!.map(v => [v.r, v]));
    const gBars = svgEl("g", {}, g);
    for (let i = 0; i < R.length; i++) {
        if (win && (i < win.from || i >= win.to)) { continue; }
        const { r, y, h: rh } = R[i];
        const ov = byRow.get(r);
        if (!ov) { continue; }
        const cy = y + rh / 2; const ty = base(y, rh);
        const v = ov.v; const dir = v >= 0 ? 1 : -1;
        const capped = Math.abs(v) > c.cap!;
        const vv = capped ? dir * c.cap! : v;
        // below materiality: soft ink, and in high contrast never the hollow "bad" pattern
        const color = ov.D.immaterial ? MEGA_C.soft : ov.D.good ? pal.good : pal.bad;
        const bad = hc && !ov.D.good && !ov.D.immaterial;
        const bold = megaIsBold(r);
        // a capped element runs past the largest regular value through the
        // outlier zone, is cut by a break mark and ends in a triangle; its
        // number stands outside beyond the tip
        const zone = capped ? c.zone ?? 2 * G.arrowW : 0;
        if (c.type === "bar") {
            const xr = X(vv); const x2 = xr + dir * zone;
            const bx = Math.min(c.x0!, x2); const bw = Math.abs(x2 - c.x0!);
            if (v !== 0) { rect(Math.round(bx * 2) / 2, cy - G.barH / 2, Math.max(bw, 1), G.barH, bad ? hollow : N.area(color, hatch), gBars); }
            if (capped) {
                breakMark(xr + dir * Math.min(5, zone / 3), cy, dir, G.barH);
                arrow(x2 + dir * G.arrowW, cy, dir, G.barH + 4, color, bad);
                label(x2 + dir * (G.arrowW + G.lblGap), ty, fmt.delta(v), dir > 0 ? "start" : "end", bold);
            } else {
                const lx = dir > 0 ? Math.max(x2, c.x0! + axisHalf) + G.lblGap : Math.min(x2, c.x0! - axisHalf) - G.lblGap;
                label(lx, ty, fmt.delta(v), dir > 0 ? "start" : "end", bold);
            }
        } else {
            const xr = X(vv); const xh = xr + dir * zone;
            svgEl("line", { x1: c.x0!, x2: xh, y1: cy, y2: cy, stroke: color, "stroke-width": G.pinStem }, gBars);
            if (capped) {
                breakMark(xr + dir * Math.min(5, zone / 3), cy, dir, G.pinHead);
                arrow(xh + dir * G.arrowW, cy, dir, G.pinHead + 2, color, bad);
                label(xh + dir * (G.arrowW + G.lblGap), ty, fmt.pin(ov.D.p!), dir > 0 ? "start" : "end", bold);
            } else {
                const hs = G.pinHead;
                rect(xh - hs / 2, cy - hs / 2, hs, hs, bad ? { fill: MEGA_C.white, stroke: MEGA_C.ink, sw: 1 } : N.head(hatch), gBars);
                const lx = dir > 0 ? Math.max(xh, c.x0!) + hs / 2 + G.lblGap : Math.min(xh, c.x0!) - hs / 2 - G.lblGap;
                label(lx, ty, fmt.pin(ov.D.p!), dir > 0 ? "start" : "end", bold);
            }
        }
    }
    paintAxis();
}

/**
 * Cascade column (Δ waterfall T04B–E · value cascade 12A): segments from the
 * shared cascade(), thin connectors at the common value from the lower edge
 * of the previous segment to the upper edge of the next one; a total that
 * spans its children also gets the line from its start (the long line through
 * the child rows, T04B). Margin rows / spacers are skipped, the line runs on.
 */
function paintCascade(
    L: MegaLayout, c: MegaCol,
    B: { svg: SVGSVGElement; rules: SVGGElement; charts: SVGGElement; text: SVGGElement; hatch: (c: string) => string },
    g: SVGGElement,
    X: (v: number) => number,
    label: (x: number, y: number, s: string, anchor: string, bold: boolean, halo?: boolean) => void,
    vline: (ly: typeof B, x: number, y1: number, y2: number, color: string, sw: number, parent?: Element) => void,
    rect: (x: number, y: number, w: number, h: number, st: MegaPaint, parent: Element) => SVGRectElement,
    paintAxis: () => void,
    pal: { good: string; bad: string },
    axis: { x: number; half: number },
    win?: { from: number; to: number },
    avoid: { x0: number; x1: number; y0: number; y1: number }[] = [],
): void {
    const { G, R, input } = L;
    const N = L.NB[c.block] ?? L.N;
    const blk = input.blocks[c.block];
    const fmt = L.fmt;
    // virtualization: the run is followed through every row, only elements in
    // the window (and connectors crossing it) are drawn
    const wTop = win && R.length ? R[Math.max(0, Math.min(win.from, R.length - 1))].y : -Infinity;
    const wBot = win && R.length ? (() => { const e = R[Math.max(0, Math.min(win.to, R.length) - 1)]; return e.y + e.h; })() : Infinity;
    paintAxis();
    const gConn = svgEl("g", { "shape-rendering": "crispEdges", "data-pnl": "mega-conn" }, g);
    const base = (y: number, h: number): number => y + h / 2 + G.fs * 0.35;
    const near = (a: number, b: number): boolean => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a), Math.abs(b));
    // 1.5.2: connectors are collected and drawn last, interrupted where a
    // number sits on their line (T04B/C/E: "−0,25" and the margin rows' "pp"
    // were crossed by the run of a total through its child rows)
    const conns: { x: number; ya: number; yb: number }[] = [];
    const conn = (v: number, ya: number, yb: number): void => {
        if (yb - ya > 0.5 && yb >= wTop && ya <= wBot) { conns.push({ x: Math.round(X(v)) + 0.5, ya, yb }); }
    };
    const labelBox = (x: number, y: number, s: string, anchor: string, bold: boolean): void => {
        if (!input.t.labels || !s) { return; }
        const w = input.measure(s, G.fs, bold, false);
        avoid.push({ x0: anchor === "end" ? x - w : anchor === "middle" ? x - w / 2 : x,
            x1: anchor === "end" ? x : anchor === "middle" ? x + w / 2 : x + w, y0: y - G.fs * 0.85, y1: y + G.fs * 0.25 });
    };
    let last: { v: number; yb: number } | null = null;   // run end of the last drawn segment
    const spanFrom = new Map<string, { v: number; yb: number }>(); // total → run before its first child
    for (let i = 0; i < R.length; i++) {
        const { r, y, h: rh } = R[i];
        const seg = c.casc!.get(r.id);
        if (!seg) { continue; }
        const vis = !win || (i >= win.from && i < win.to);
        const cy = y + rh / 2; const top = cy - G.barH / 2; const bot = cy + G.barH / 2;
        if (r.group != null && !spanFrom.has(r.group) && last) { spanFrom.set(r.group, last); }
        if (!vis) {
            // outside the window: only the connectors that cross it
            if (last) {
                if (seg.type === "anchor") { if (near(seg.e, last.v)) { conn(seg.e, last.yb, top); } }
                else if (seg.type === "span") {
                    const sf = spanFrom.get(r.id);
                    if (sf && near(seg.s, sf.v)) { conn(seg.s, sf.yb, top); }
                    if (near(seg.e, last.v)) { conn(seg.e, last.yb, top); }
                } else if (near(seg.s, last.v)) { conn(seg.s, last.yb, top); }
            }
            last = { v: seg.e, yb: bot };
            continue;
        }
        let st: MegaPaint; let txt: string;
        let ytdPart: { v: number; t: string } | null = null;
        if (c.type === "wf") {
            const D = blk.delta(r, input.t.min, c.ref!)!;
            // high contrast: an unfavourable step is hollow (good / bad share the foreground)
            st = input.hc && !D.good && D.d !== 0 && !D.immaterial ? { fill: MEGA_C.white, stroke: MEGA_C.ink, sw: 1.4 }
                : N.area(D.immaterial ? MEGA_C.soft : D.good ? pal.good : pal.bad, B.hatch);
            txt = fmt.delta(D.d);
        } else {
            // high contrast: the PY cascade (gray otherwise) is dashed, AC stays solid
            const light = !megaAnchor(r) && megaEff(r) < 0;
            st = input.hc && c.scen === "PY" ? { fill: MEGA_C.white, stroke: MEGA_C.ink, sw: 1, dash: "3,2" }
                : N.value(c.scen!, light, B.hatch);
            txt = fmt.val(blk.value(r, c.scen!)!);
            if (c.stack && blk.ytd) {
                const yv = blk.ytd(r);
                if (yv != null && isFinite(yv)) { ytdPart = { v: yv, t: fmt.val(yv) }; }
            }
        }
        const xa = X(Math.min(seg.s, seg.e)); const xb = X(Math.max(seg.s, seg.e));
        if (ytdPart) {
            // 12G: YTD solid from the segment start, the rest of the year hatched
            // up to the segment end — one bar, two fills ("637 ▓ 1 698")
            const light = !megaAnchor(r) && megaEff(r) < 0;
            const lo = Math.min(seg.s, seg.e); const hi = Math.max(seg.s, seg.e);
            const mid = Math.max(lo, Math.min(hi, seg.s + ytdPart.v * megaEff(r)));
            const xm = X(mid); const xs = X(seg.s);
            const solidA = Math.min(xs, xm); const solidB = Math.max(xs, xm);
            const restA = xm < xs ? xa : xm; const restB = xm < xs ? xm : xb;
            if (restB - restA > 0.01) { rect(restA, top, restB - restA, G.barH, N.value("FC", light, B.hatch), g); }
            if (solidB - solidA > 0.01 || restB - restA <= 0.01) {
                rect(solidA, top, Math.max(solidB - solidA, 1), G.barH, N.value("AC", light, B.hatch), g);
            }
            // the YTD number inside the solid part when it fits, in the paper tone
            // or the text ink, whichever reads better on that fill (1.5.1: the
            // light cost tone took white at ~3:1). 1.5.2: otherwise (too short,
            // or below 4.5:1 WCAG AA) it stands outside before the bar start
            // ("1,94 ▓▒ 2,73") — 1.5.1 dropped it, 12G lost 10 of 19 YTD values
            if (input.t.labels) {
                const w = input.measure(ytdPart.t, G.fs, megaIsBold(r), false);
                const ink = megaReadableOn(N.value("AC", light, B.hatch).fill);
                if (!(w + 6 <= solidB - solidA && ink)) {
                    const upS = seg.e >= seg.s;
                    const ox = upS ? xs - G.lblGap : xs + G.lblGap;
                    labelBox(ox, base(y, rh), ytdPart.t, upS ? "end" : "start", megaIsBold(r));
                    svgEl("text", {
                        x: ox, y: base(y, rh), "text-anchor": upS ? "end" : "start",
                        "font-weight": megaIsBold(r) ? "bold" : null, fill: MEGA_C.text, "data-pnl": "mega-ytd",
                        "data-pos": "out",
                    }, g).textContent = ytdPart.t;
                } else {
                    labelBox((solidA + solidB) / 2, base(y, rh), ytdPart.t, "middle", megaIsBold(r));
                    svgEl("text", {
                        x: (solidA + solidB) / 2, y: base(y, rh), "text-anchor": "middle",
                        "font-weight": megaIsBold(r) ? "bold" : null, fill: ink, "data-pnl": "mega-ytd",
                    }, g).textContent = ytdPart.t;
                }
            }
        } else {
            rect(xa, top, Math.max(xb - xa, 1), G.barH, st, g);
        }
        if (last) {
            if (seg.type === "anchor") { if (near(seg.e, last.v)) { conn(seg.e, last.yb, top); } }
            else if (seg.type === "span") {
                const sf = spanFrom.get(r.id);
                if (sf && near(seg.s, sf.v)) { conn(seg.s, sf.yb, top); }
                if (near(seg.e, last.v)) { conn(seg.e, last.yb, top); }
            } else if (near(seg.s, last.v)) { conn(seg.s, last.yb, top); }
        }
        last = { v: seg.e, yb: bot };
        const up = seg.e >= seg.s;
        const lx = up ? xb + G.lblGap : xa - G.lblGap;
        // A floating segment just beside the zero line puts its number ON the
        // axis (T04B "+5.79", T04D "+8.52" — the reference sheets do the same,
        // and the double PL line then cuts through the digits). Only such a
        // number gets the paper halo of the outlier labels: the axis pauses
        // behind it, every other label stays exactly where and how it was.
        let crosses = false;
        if (input.t.labels) {
            const w = input.measure(txt, G.fs, megaIsBold(r), false);
            const l0 = up ? lx : lx - w; const l1 = up ? lx + w : lx;
            crosses = l0 < axis.x + axis.half + 0.5 && l1 > axis.x - axis.half - 0.5;
        }
        labelBox(lx, base(y, rh), txt, up ? "start" : "end", megaIsBold(r));
        label(lx, base(y, rh), txt, up ? "start" : "end", megaIsBold(r), crosses);
    }
    const pad = 1.5;
    for (const k of conns) {
        const cut = avoid.filter(b => k.x >= b.x0 - pad && k.x <= b.x1 + pad && b.y1 > k.ya && b.y0 < k.yb)
            .sort((a, b) => a.y0 - b.y0);
        let y0 = k.ya;
        for (const b of cut) {
            if (b.y0 - 1 > y0) { vline(B, k.x, y0, b.y0 - 1, MEGA_C.soft, 1, gConn); }
            y0 = Math.max(y0, b.y1 + 1);
        }
        if (k.yb - y0 > 0.5) { vline(B, k.x, y0, k.yb, MEGA_C.soft, 1, gConn); }
    }
}
