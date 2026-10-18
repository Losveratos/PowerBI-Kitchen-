/*
 * Start-Hub (1.3) — the pure parts: the switches a template writes (shared by
 * the format-pane path, the toolbar dropdown, the template gallery and the
 * "back to template" button), the cards of the feature tour and the format
 * objects of a mini rendering. No Power BI import — unit-testable in node
 * (test/hub-test.js).
 */
import { MEGA_PRESETS, MEGA_PRESET_KEYS } from "./megatable";

/** everything a template writes: the columns switches, the number format and the title-block switch */
export interface TemplateSwitches {
    cols: Record<string, boolean | string>;
    nums: Record<string, number>;
    title: Record<string, boolean>;
}

/**
 * The switch set of a template preset — exactly what the visual persists when
 * a template is applied (columns + numbers [+ titleBlock.headline]). "off"
 * returns to the classic table and leaves the number format alone.
 */
export function templateSwitches(tpl: string): TemplateSwitches {
    const p = MEGA_PRESETS[tpl];
    const cols: Record<string, boolean | string> = {
        minuend: p.min.toLowerCase(),
        showPY: p.showPY, showPL: p.showPL, showMinuend: p.showMin, valueCascade: p.valueCascade,
        dPyAbs: p.dPyAbs, dPyBar: p.dPyBar, dPyWaterfall: p.dPyWf, dPyPct: p.dPyPct, dPyPin: p.dPyPin,
        dPlAbs: p.dPlAbs, dPlBar: p.dPlBar, dPlWaterfall: p.dPlWf, dPlPct: p.dPlPct, dPlPin: p.dPlPin,
        secondBlock: p.secondBlock, structureSubtotals: p.structureSubtotals, showPctRows: p.showPctRows,
        thresholds: p.thresholds, scenarioMarks: p.scenarioMarks, chartLabels: p.chartLabels,
        capBars: p.capBars, sort: p.sort, sortBlock: p.sortBlock,
        // every template is laid out in its period block (YTD; 12G: FY outlook),
        // or month | that block with the second block
        blockKind: p.blockKind, leftBlockKind: "month",
    };
    const nums: Record<string, number> = tpl === "off" ? {} : { decimals: p.decimals, pctDecimals: p.pctDecimals };
    // 12G / 12H switch the headline slot on; the other templates leave it alone
    const title: Record<string, boolean> = p.headline ? { headline: true } : {};
    return { cols, nums, title };
}

/** the templates of the gallery, in pane order: "off" (classic table) first, then T01A … 12H */
export const HUB_TEMPLATES: string[] = MEGA_PRESET_KEYS.slice();

/** which view a mini rendering draws */
export type MiniView = "table" | "bars" | "waterfall" | "tree";

/** a mini rendering: a tiny, non-interactive copy of the visual over the built-in demo */
export interface MiniSpec {
    view: MiniView;
    /** template of the mega table ("off" / undefined = classic table) */
    tpl?: string;
    /** tile view of this row id (view = tree) */
    zoom?: string;
    /** force the dark palette (otherwise it follows the hub) */
    dark?: boolean;
    /** bars view: overlapped scenario bars + triangle marks */
    bars?: boolean;
    /** hierarchy.defaultLevel of the mini (0 = fully open) */
    level?: number;
    /** natural size the mini is laid out in (it is scaled down afterwards) */
    w: number;
    h: number;
    /** the full demo of the overlay: banner + toolbar stay */
    full?: boolean;
    /** carry a synthetic FC scenario (templates that analyse FC) */
    fc?: boolean;
}

/** a card of the feature tour: texts live in the resjson (UI_Tour<n>T / UI_Tour<n>X) */
export interface TourCard {
    n: number;
    mini: MiniSpec;
}

export const TOUR_CARDS: TourCard[] = [
    { n: 1, mini: { view: "table", level: 2, w: 1250, h: 800 } },
    { n: 2, mini: { view: "table", tpl: "T04B", level: 2, w: 1100, h: 700 } },
    { n: 3, mini: { view: "tree", w: 900, h: 576 } },
    { n: 4, mini: { view: "bars", bars: true, level: 2, w: 1250, h: 800 } },
    { n: 5, mini: { view: "waterfall", level: 2, w: 1250, h: 800 } },
    { n: 6, mini: { view: "tree", zoom: "F_EBITDA", w: 1250, h: 800 } },
    { n: 7, mini: { view: "table", tpl: "T03A", level: 2, dark: true, w: 1100, h: 700 } },
];

/** templates that analyse the FC scenario — their preview needs a forecast the demo does not carry */
export function templateNeedsFc(tpl: string): boolean {
    const p = MEGA_PRESETS[tpl];
    return !!p && p.min === "FC";
}

/**
 * The format objects (plain values, as the host hands them over) a mini
 * rendering is populated from: no toolbar, no title, no legend — just the
 * body — plus the template switches or the view-specific settings.
 */
export function miniObjects(spec: MiniSpec, dark: boolean): Record<string, Record<string, unknown>> {
    const tpl = spec.tpl && spec.tpl !== "off" && MEGA_PRESETS[spec.tpl] ? spec.tpl : "off";
    const sw = templateSwitches(tpl);
    const o: Record<string, Record<string, unknown>> = {
        toolbar: spec.full ? {} : { show: false, showLegend: false },
        titleBlock: spec.full ? {} : { show: false },
        style: { appearance: dark ? "dark" : "light", stickyHeader: false },
        hierarchy: { defaultLevel: spec.level ?? 2 },
        columns: {},
        numbers: {},
    };
    if (tpl !== "off") {
        o.columns = { ...sw.cols, template: tpl, templateApplied: tpl };
        o.numbers = { ...sw.nums };
        if (sw.title.headline != null) { o.titleBlock = { ...o.titleBlock, headline: true }; }
    }
    if (spec.bars) { o.columns = { ...o.columns, barOverlap: true, barTriangles: true }; }
    // the driver tree starts two levels deep: a whole tree does not fit a thumbnail
    if (spec.view === "tree" && !spec.zoom) { o.columns = { ...o.columns, treeLevel: 4 }; }
    return o;
}
