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
};
/** the live palette every painter of this module reads at call time */
export const MEGA_C = { ...MEGA_LIGHT };

/** switch the live palette (the visual calls this once per update) */
export function setMegaPalette(dark: boolean, paper?: string): void {
    Object.assign(MEGA_C, dark ? MEGA_DARK : MEGA_LIGHT);
    if (dark && paper) { MEGA_C.white = paper; }
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

export function megaGeometry(fs: number): MegaGeometry {
    const rowH = Math.round(fs * 1.7);
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

/** analysed scenario (minuend) and reference scenario (subtrahend) */
export type MegaMin = "AC" | "FC";
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
}

export interface MegaBlock {
    /** block title ("November" / "_November") */
    name: string;
    /** "Δ in red if" thresholds of this block: abs in display units, pct as fraction */
    th: { abs: number; pct: number };
    /** display value (display units; margin rows: the ratio) */
    value: (r: MegaRow, s: MegaScen) => number | null;
    delta: (r: MegaRow, min: MegaMin, ref: MegaRef) => MegaDelta | null;
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
}

const P_OFF: MegaPreset = {
    min: "AC", showPY: false, showPL: false, showMin: false, valueCascade: false,
    dPyAbs: false, dPyBar: false, dPyWf: false, dPyPct: false, dPyPin: false,
    dPlAbs: false, dPlBar: false, dPlWf: false, dPlPct: false, dPlPin: false,
    secondBlock: false, structureSubtotals: true, showPctRows: true,
    thresholds: false, scenarioMarks: true, chartLabels: true, capBars: false,
    sort: "cat", sortBlock: "ytd", decimals: 1, pctDecimals: 1,
};
const preset = (base: MegaPreset, o: Partial<MegaPreset>): MegaPreset => ({ ...base, ...o });

/**
 * Template presets (SPEC "Defaults je Preset"). Δ% decimals follow the
 * prototype's derived rule and are written to numbers.pctDecimals: regions
 * max(1, d), statements d ≥ 2 ? 1 : 0 for Δ% numbers, pins max(1, d)
 * (statement pins with d = 0 → 0: 12A).
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
    decimals: 1, pctDecimals: 0,
});
const T04A = preset(P_OFF, { showPL: true, showMin: true, dPlBar: true, dPlPin: true, decimals: 1, pctDecimals: 1 });
const T04B = preset(T04A, { dPlBar: false, dPlWf: true, decimals: 2, pctDecimals: 2 });
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
        showPctRows: false, decimals: 0, pctDecimals: 0,
    }),
};
export const MEGA_PRESET_KEYS = Object.keys(MEGA_PRESETS);

// ============================================================================
// 3 · Notation engine — ONE function for every variance / scenario element
// ============================================================================

interface ScenNotation {
    mark: "solid" | "hatch" | "gray" | "double"; fill: "solid" | "hatch" | "outline"; axis?: "gray" | "double";
    /** value cascade (12A): palette tone of the scenario, and of its cost rows ("hell abgesetzt") —
     *  palette keys, read at call time so the light / dark switch reaches them */
    tone: keyof typeof MEGA_LIGHT; toneLight: keyof typeof MEGA_LIGHT;
}
const SCENARIO_NOTATION: Record<MegaScen, ScenNotation> = {
    AC: { mark: "solid", fill: "solid", tone: "ink", toneLight: "soft" },
    FC: { mark: "hatch", fill: "hatch", tone: "ink", toneLight: "soft" },
    PY: { mark: "gray", fill: "solid", axis: "gray", tone: "py", toneLight: "pyLight" },
    PL: { mark: "double", fill: "outline", axis: "double", tone: "ink", toneLight: "ink" },
};

export interface MegaPaint { fill: string; stroke: string | null; sw: number; }

/**
 * notation(minuend, subtrahend):
 *   minuend  (AC | FC) → FILL:  AC solid, FC hatched (+ 1 px outline in the same colour)
 *   subtrahend (PY | PL) → AXIS: PY gray line, PL double line
 * The same table yields the scenario mark of every scenario (column-head and
 * closing underline): AC solid ink · PY solid gray · PL double · FC hatched,
 * and the fill of a value cascade per scenario (cost rows in the light tone).
 */
export function notation(minuend: MegaMin, subtrahend: MegaRef | null): {
    area: (color: string, hatch: (c: string) => string) => MegaPaint;
    head: (hatch: (c: string) => string) => MegaPaint;
    axis: "gray" | "double";
    mark: (scen: MegaScen) => string;
    value: (scen: MegaScen, light: boolean, hatch: (c: string) => string) => MegaPaint;
} {
    const m = SCENARIO_NOTATION[minuend];
    const s = SCENARIO_NOTATION[subtrahend || "PY"];
    const paintOf = (kind: string, color: string, hatch: (c: string) => string): MegaPaint =>
        kind === "hatch" ? { fill: hatch(color), stroke: color, sw: 1 }
            : kind === "outline" ? { fill: MEGA_C.white, stroke: color, sw: 1 }
                : { fill: color, stroke: null, sw: 0 };
    return {
        area: (color, hatch) => paintOf(m.fill, color, hatch),
        head: (hatch) => paintOf(m.fill, MEGA_C.ink, hatch),
        axis: s.axis ?? "gray",
        mark: (scen) => SCENARIO_NOTATION[scen].mark,
        value: (scen, light, hatch) => {
            const n = SCENARIO_NOTATION[scen];
            return paintOf(n.fill, MEGA_C[light ? n.toneLight : n.tone], hatch);
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
    signed: (v: number, dec: number, plus: boolean) => string;
}

/** explicit "+", "-" as minus, zero without a sign (also a rounded −0.0) */
export function megaFmt(num: (abs: number, dec: number) => string, dec: number, pdec: number): MegaFmt {
    const signed = (v: number, d: number, plus: boolean): string => {
        const f = Math.pow(10, d);
        const r = Math.round(Math.abs(v) * f) / f;
        const zero = r === 0;
        return (v < 0 && !zero ? "-" : plus && !zero ? "+" : "") + num(r, d);
    };
    return {
        val: v => signed(v, dec, false),
        delta: v => signed(v, dec, true),
        pct: p => signed(p * 100, pdec, true) + "%",
        pin: p => signed(p * 100, pdec, true),
        margin: m => signed(m * 100, dec, false) + "%",
        pp: x => signed(x, dec, true) + "%p",
        rel: p => signed(p * 100, 0, true),
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
 */
export const MEGA_OUTLIER = { fence: 4, minN: 8 };
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
export type MegaColType = "label" | "value" | "delta" | "dpct" | "bar" | "pin" | "wf" | "vwf";
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
    kSelf?: number;
    k?: number;
    x0?: number;
    /** cascade columns: segment per row id (shared cascade() of waterfall.ts) */
    casc?: Map<string, CascadeSeg>;
}

export interface MegaCellText { t: string; bold: boolean; italic: boolean; fs: number; color: string; }

export interface MegaLayout {
    G: MegaGeometry;
    input: MegaInput;
    fmt: MegaFmt;
    rows: MegaRow[];
    R: { r: MegaRow; y: number; h: number }[];
    cols: MegaCol[];
    charts: MegaCol[];
    N: ReturnType<typeof notation>;
    style: {
        signs: boolean; blockTitles: boolean; pairHeader: boolean; closing: boolean; thresholds: boolean;
        /** value cascade (12A): no gray row rules, sum rules across the table, no head rules */
        rowRules: boolean; continuousSumRules: boolean; headerRules: boolean;
    };
    sortInfo: { ref: MegaRef; block: number } | null;
    tableW: number;
    blockTitleY: number; colHeadY: number; markY: number; bodyTop: number; headH: number;
    bodyBottom: number; footY: number; height: number;
    famK: Record<string, number>;
    cellText: (c: MegaCol, r: MegaRow) => MegaCellText | null;
}

const CHART_TYPES = new Set<MegaColType>(["bar", "pin", "wf", "vwf"]);
export const megaIsChart = (c: MegaCol): boolean => CHART_TYPES.has(c.type);
export const megaIsBold = (r: MegaRow): boolean => r.kind === "sum" || r.kind === "formula";

/** references with at least one active element (the order of the Δ groups) */
export function activeRefs(t: MegaToggles): MegaRef[] {
    return MEGA_REFS.filter(r => t.d[r].num || t.d[r].bar || t.d[r].wf || t.d[r].pct || t.d[r].pin);
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
        if (t.showPL) { vals.push("PL"); }
        if (t.showMin) { vals.push(t.min); }
        // value cascade (12A): every scenario is a chart column of its own group
        if (t.valueCascade) { vals.forEach(s => groups.push([mk({ type: "vwf", scen: s })])); }
        else if (vals.length) { groups.push(vals.map(s => mk({ type: "value", scen: s }))); }
        for (const r of MEGA_REFS) {
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
    const out: MegaRow[] = []; let run: MegaRow[] = [];
    const flush = (): void => {
        const rest = run.filter(r => !r.other).sort((x, y) => key(y) - key(x));
        out.push(...rest, ...run.filter(r => r.other)); run = [];
    };
    for (const r of rows) {
        if (r.kind === "acc") {
            if (run.length && run[0].group !== r.group) { flush(); }
            run.push(r);
        } else { flush(); out.push(r); }
    }
    flush();
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
    const G = megaGeometry(input.fs);
    const nb = blocks.length;
    const ord = orderRows(input);
    const rows = ord.rows;
    const sortInfo = ord.info;
    const fmt = megaFmt(input.num, input.dec, input.pdec);
    const N = notation(t.min, activeRefs(t)[0] ?? null);
    const cols = buildColumns(t, nb);
    const anyChart = cols.some(megaIsChart);
    const style = {
        signs: input.statement,
        blockTitles: (!input.statement || nb === 2) && blocks.some(b => b.name !== ""),
        pairHeader: input.statement,
        closing: t.marks && input.statement && !anyChart,
        thresholds: t.thresholds && cols.some(c => c.type === "delta" || c.type === "dpct"),
        rowRules: !t.valueCascade,
        continuousSumRules: !!t.valueCascade,
        headerRules: !t.valueCascade,
    };
    const tw = (s: string, fs: number, bold = false, italic = false): number => input.measure(s, fs, bold, italic);

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
        const D = blk.delta(r, t.min, c.ref!);
        if (!D) { return null; }
        if (c.type === "delta") {
            const red = t.thresholds && !pct && D.impact < blk.th.abs - 1e-9;
            return { ...base, t: pct ? fmt.pp(D.d) : fmt.delta(D.d), color: red ? input.pal.bad : MEGA_C.text };
        }
        if (c.type === "dpct") {
            if (D.p == null) { return null; }
            const imp = D.impactPct;
            const red = t.thresholds && !pct && imp != null && imp < blk.th.pct - 1e-9;
            return { ...base, t: pct ? fmt.rel(D.p) : fmt.pct(D.p), color: red ? input.pal.bad : MEGA_C.text };
        }
        return null;
    };
    const headerText = (c: MegaCol): string => {
        let s = c.type === "value" || c.type === "vwf" ? c.scen!
            : c.type === "dpct" || c.type === "pin" ? "Δ" + c.ref + "%" : c.type === "label" ? "" : "Δ" + c.ref;
        if (sortInfo && c.block === sortInfo.block) {
            if (t.sort === "min" && (c.type === "value" || c.type === "vwf") && c.scen === t.min) { s += "(↓)"; }
            if (t.sort === "delta" && c.ref === sortInfo.ref) {
                const firstD = cols.find(x => x.block === c.block && x.ref === sortInfo.ref && x.type !== "dpct" && x.type !== "pin");
                if (firstD === c) { s += "(↓)"; }
            }
        }
        return s;
    };
    const labelText = (r: MegaRow): string => r.label + (r.suffix ?? []).map(x => x.t).join("");

    // ---- fixed widths --------------------------------------------------------
    for (const c of cols) {
        c.head = headerText(c);
        if (c.type === "label") {
            let w = 0;
            for (const r of rows) {
                if (r.kind === "gap") { continue; }
                const fsx = r.kind === "pct" ? G.fsSmall : G.fs;
                w = Math.max(w, (style.signs ? G.signW : 0) + r.level * G.indent
                    + tw(labelText(r), fsx, megaIsBold(r), r.kind === "pct"));
            }
            c.w = Math.ceil(Math.max(w + 2 * G.pad, G.fs * 6));
        } else if (!megaIsChart(c)) {
            let w = tw(c.head, G.fs);
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
    }

    // ---- rows y --------------------------------------------------------------
    const blockTitleY = 2;
    const colHeadY = blockTitleY + (style.blockTitles ? G.rowH : 0);
    const markY = colHeadY + G.rowH;
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

    // ---- scale per block × family --------------------------------------------
    const lblW = (s: string, bold: boolean): number => t.labels ? tw(s, G.fs, bold) + G.lblGap : 0;
    for (const c of charts) {
        const blk = blocks[c.block];
        c.els = [{ p: 0, q: 0, a: 3, c: 3 }]; // the axis itself
        c.vals = [];
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
    // outlier cap per block × family (all pin columns of a block share it)
    for (let b = 0; b < nb; b++) {
        for (const fam of ["pin", "bar"] as MegaColType[]) {
            const cs = charts.filter(c => c.block === b && c.type === fam);
            const allV = ([] as number[]).concat(...cs.map(c => c.vals!.map(o => o.v)));
            const cap = fam === "pin" || t.capBars ? outlierCap(allV) : Infinity;
            cs.forEach(c => { c.cap = cap; });
        }
    }
    for (const c of charts) {
        if (c.casc) {
            for (const { r } of R) {
                const seg = c.casc.get(r.id);
                if (!seg) { continue; }
                const lw = lblW(cascadeText(input, fmt, c, r), megaIsBold(r));
                const up = seg.e >= seg.s;
                c.els!.push({ p: Math.min(seg.s, seg.e), q: Math.max(seg.s, seg.e), a: up ? 0 : lw, c: up ? lw : 0 });
            }
            continue;
        }
        const side = c.type === "pin" ? G.pinHead / 2 + G.lblGap : 0;
        for (const { r, v, D } of c.vals!) {
            const capped = Math.abs(v) > c.cap!;
            const vv = capped ? Math.sign(v) * c.cap! : v;
            const text = c.type === "bar" ? fmt.delta(v) : fmt.pin(D.p!);
            const extra = capped ? G.arrowW : side + lblW(text, megaIsBold(r));
            if (vv >= 0) { c.els!.push({ p: 0, q: vv, a: 0, c: extra }); }
            else { c.els!.push({ p: vv, q: 0, a: extra, c: 0 }); }
        }
    }
    // families: Δ bars + Δ waterfall share "delta", pins "pct", value cascades "valueCascade"
    const family = (c: MegaCol): string => c.type === "pin" ? "pct" : c.type === "vwf" ? "valueCascade" : "delta";
    const famK: Record<string, number> = {};
    for (const c of charts) {
        c.inner = c.w - 2 * G.pad;
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
    let x = 0;
    for (const c of cols) { x += gapPx(c.gap); c.x = x; x += c.w; }
    const tableW = x;
    for (const c of charts) {
        const key = c.block + ":" + family(c);
        famK[key] = Math.min(famK[key] ?? Infinity, c.kSelf!);
    }
    for (const c of charts) {
        c.k = famK[c.block + ":" + family(c)];
        const [L, Rr] = megaNeeds(c.els!, c.k);
        const slack = Math.max(0, c.inner! - L - Rr);
        c.x0 = c.x + G.pad + L + slack / 2;
    }

    return {
        G, input, fmt, rows, R, cols, charts, N, style, sortInfo, tableW,
        blockTitleY, colHeadY, markY, bodyTop, headH, bodyBottom, footY, height, famK, cellText,
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
    } = {}): SVGTextElement => {
        const n = svgEl("text", {
            x, y, "text-anchor": oo.anchor || "start", "font-weight": oo.bold ? "bold" : null,
            "font-style": oo.italic ? "italic" : null, "font-size": oo.fs && oo.fs !== G.fs ? oo.fs : null,
            fill: oo.color || null,
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
            "stroke-width": st.stroke ? st.sw : null,
        }, parent);

    // ---- head ----------------------------------------------------------------
    const paintMark = (ly: Layer, kind: string, x: number, w: number, y?: number): void => {
        const yy = y ?? L.markY;
        if (kind === "solid") { rect(x, yy, w, G.markH, { fill: MEGA_C.ink, stroke: null, sw: 0 }, ly.rules); }
        else if (kind === "gray") { rect(x, yy, w, G.markH, { fill: MEGA_C.py, stroke: null, sw: 0 }, ly.rules); }
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
            text(H, (x1 + x2) / 2, base(L.blockTitleY, G.rowH), b.name, { anchor: "middle", color: o.headInk });
            hline(H, x1, x2, L.blockTitleY + G.rowH - 0.5, MEGA_C.ink);
        });
    }
    for (let i = 0; i < cols.length; i++) {
        const c = cols[i];
        const ty = base(L.colHeadY, G.rowH);
        if (c.type === "label") { if (style.headerRules) { paintMark(H, "rule", c.x, c.w); } continue; }
        if (c.type === "value") {
            text(H, c.x + c.w - G.pad, ty, c.head, { anchor: "end", color: o.headInk });
            paintMark(H, t.marks ? N.mark(c.scen!) : "rule", c.x, c.w);
            continue;
        }
        const n = cols[i + 1];
        if (c.type === "delta" && style.pairHeader && n && n.type === "dpct" && n.ref === c.ref && n.block === c.block) {
            text(H, n.x + n.w - G.pad, ty, c.head, { anchor: "end", color: o.headInk });
            if (style.headerRules) { paintMark(H, "rule", c.x, n.x + n.w - c.x); }
            i++; continue;
        }
        if (c.type === "delta" || c.type === "dpct") { text(H, c.x + c.w - G.pad, ty, c.head, { anchor: "end", color: o.headInk }); }
        else { text(H, c.x + c.w / 2, ty, c.head, { anchor: "middle", color: o.headInk }); }
        if (style.headerRules) { paintMark(H, "rule", c.x, c.w); }
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
    for (const { r, y, h } of R) {
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
                    { anchor: "end", bold: ct.bold, italic: ct.italic, fs: ct.fs, color: ct.color });
            }
        }
    }

    // ---- body: chart columns ---------------------------------------------------
    for (const c of L.charts) { paintChartColumn(L, c, B, text, base, vline, rect, pal); }

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
            for (const c of bc) {
                if (c.type === "delta") { text(B, c.x + c.w - G.pad, fy, "<" + fmt.signed(b.th.abs, 0, false), oo); }
                if (c.type === "dpct") { text(B, c.x + c.w - G.pad, fy, "<" + fmt.signed(b.th.pct * 100, 0, false) + "%", oo); }
            }
        });
    }

    // ---- hit areas (top of the body) -------------------------------------------
    const gHit = svgEl("g", { "data-pnl": "mega-hits" }, B.svg);
    const labelCol = cols.find(c => c.type === "label")!;
    const hits: MegaPainted["hits"] = [];
    for (const { r, y, h } of R) {
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
): void {
    const { G, R, N, input } = L;
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
    const arrow = (xTip: number, cy: number, dir: number, hgt: number, fill: string): void => {
        svgEl("path", {
            d: `M${xTip},${cy} L${xTip - dir * G.arrowW},${cy - hgt / 2} L${xTip - dir * G.arrowW},${cy + hgt / 2} Z`, fill,
        }, g);
    };
    const hatch = B.hatch;
    if (c.casc) {
        // the drawn axis band (the 12A value line sits half a pixel right)
        paintCascade(L, c, B, g, X, label, vline, rect, paintAxis, pal,
            { x: axisKind === "value" ? ax + 0.5 : ax, half: axisHalf });
        return;
    }
    const byRow = new Map(c.vals!.map(v => [v.r, v]));
    const gBars = svgEl("g", {}, g);
    for (const { r, y, h: rh } of R) {
        const ov = byRow.get(r);
        if (!ov) { continue; }
        const cy = y + rh / 2; const ty = base(y, rh);
        const v = ov.v; const dir = v >= 0 ? 1 : -1;
        const capped = Math.abs(v) > c.cap!;
        const vv = capped ? dir * c.cap! : v;
        const color = ov.D.good ? pal.good : pal.bad;
        const bold = megaIsBold(r);
        if (c.type === "bar") {
            const x2 = X(vv);
            const bx = Math.min(c.x0!, x2); const bw = Math.abs(x2 - c.x0!);
            if (v !== 0) { rect(Math.round(bx * 2) / 2, cy - G.barH / 2, Math.max(bw, 1), G.barH, N.area(color, hatch), gBars); }
            if (capped) {
                arrow(x2 + dir * G.arrowW, cy, dir, G.barH + 4, color);
                label(x2 - dir * 3, ty, fmt.delta(v), dir > 0 ? "end" : "start", bold, true);
            } else {
                const lx = dir > 0 ? Math.max(x2, c.x0! + axisHalf) + G.lblGap : Math.min(x2, c.x0! - axisHalf) - G.lblGap;
                label(lx, ty, fmt.delta(v), dir > 0 ? "start" : "end", bold);
            }
        } else {
            const xh = X(vv);
            svgEl("line", { x1: c.x0!, x2: xh, y1: cy, y2: cy, stroke: color, "stroke-width": G.pinStem }, gBars);
            if (capped) {
                arrow(xh + dir * G.arrowW, cy, dir, G.pinHead + 2, color);
                label(xh - dir * 3, ty, fmt.pin(ov.D.p!), dir > 0 ? "end" : "start", bold, true);
            } else {
                const hs = G.pinHead;
                rect(xh - hs / 2, cy - hs / 2, hs, hs, N.head(hatch), gBars);
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
): void {
    const { G, R, N, input } = L;
    const blk = input.blocks[c.block];
    const fmt = L.fmt;
    paintAxis();
    const gConn = svgEl("g", { "shape-rendering": "crispEdges", "data-pnl": "mega-conn" }, g);
    const base = (y: number, h: number): number => y + h / 2 + G.fs * 0.35;
    const near = (a: number, b: number): boolean => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a), Math.abs(b));
    const conn = (v: number, ya: number, yb: number): void => {
        if (yb - ya > 0.5) { vline(B, Math.round(X(v)) + 0.5, ya, yb, MEGA_C.soft, 1, gConn); }
    };
    let last: { v: number; yb: number } | null = null;   // run end of the last drawn segment
    const spanFrom = new Map<string, { v: number; yb: number }>(); // total → run before its first child
    for (const { r, y, h: rh } of R) {
        const seg = c.casc!.get(r.id);
        if (!seg) { continue; }
        const cy = y + rh / 2; const top = cy - G.barH / 2; const bot = cy + G.barH / 2;
        if (r.group != null && !spanFrom.has(r.group) && last) { spanFrom.set(r.group, last); }
        let st: MegaPaint; let txt: string;
        if (c.type === "wf") {
            const D = blk.delta(r, input.t.min, c.ref!)!;
            st = N.area(D.good ? pal.good : pal.bad, B.hatch);
            txt = fmt.delta(D.d);
        } else {
            st = N.value(c.scen!, !megaAnchor(r) && megaEff(r) < 0, B.hatch);
            txt = fmt.val(blk.value(r, c.scen!)!);
        }
        const xa = X(Math.min(seg.s, seg.e)); const xb = X(Math.max(seg.s, seg.e));
        rect(xa, top, Math.max(xb - xa, 1), G.barH, st, g);
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
        label(lx, base(y, rh), txt, up ? "start" : "end", megaIsBold(r), crosses);
    }
}
