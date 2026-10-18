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

/** a tile of the 1.4 gallery: the template plus its finance title and its use line (resjson keys) */
export interface GalleryTile {
    tpl: string;
    /** finance title of the tile ("Regionen mit Plan-Abweichung") */
    title: string;
    /** one line: what a controller gets out of it */
    use: string;
}

/** a purpose group of the 1.4 gallery (resjson keys of its head and its one-line explanation) */
export interface GalleryGroup {
    id: "structure" | "forecast" | "statement" | "report";
    title: string;
    sub: string;
    tiles: GalleryTile[];
}

const tile = (tpl: string, title: string, use: string): GalleryTile => ({ tpl, title, use });

/**
 * 1.4 template gallery by purpose instead of T numbers: structure comparison
 * (regions, products), forecast, P&L statement, report views. Every template
 * of the pane appears exactly once; the classic table closes the report views.
 * The keys are literal so the language test sees them.
 */
export const HUB_GALLERY: GalleryGroup[] = [
    { id: "structure", title: "UI_TgStructure", sub: "UI_TgStructureX", tiles: [
        tile("T01A", "UI_TtT01A", "UI_TuT01A"),
        tile("T01B", "UI_TtT01B", "UI_TuT01B"),
        tile("T02A", "UI_TtT02A", "UI_TuT02A"),
        tile("T02B", "UI_TtT02B", "UI_TuT02B"),
        tile("T02C", "UI_TtT02C", "UI_TuT02C"),
    ] },
    { id: "forecast", title: "UI_TgForecast", sub: "UI_TgForecastX", tiles: [
        tile("T02E", "UI_TtT02E", "UI_TuT02E"),
        tile("T02F", "UI_TtT02F", "UI_TuT02F"),
        tile("T03B", "UI_TtT03B", "UI_TuT03B"),
        tile("T04D", "UI_TtT04D", "UI_TuT04D"),
        tile("T04E", "UI_TtT04E", "UI_TuT04E"),
    ] },
    { id: "statement", title: "UI_TgStatement", sub: "UI_TgStatementX", tiles: [
        tile("T03A", "UI_TtT03A", "UI_TuT03A"),
        tile("T04A", "UI_TtT04A", "UI_TuT04A"),
        tile("T04B", "UI_TtT04B", "UI_TuT04B"),
        tile("T04C", "UI_TtT04C", "UI_TuT04C"),
    ] },
    { id: "report", title: "UI_TgReport", sub: "UI_TgReportX", tiles: [
        tile("12A", "UI_Tt12A", "UI_Tu12A"),
        tile("12G", "UI_Tt12G", "UI_Tu12G"),
        tile("12H", "UI_Tt12H", "UI_Tu12H"),
        tile("off", "UI_TtOff", "UI_TuOff"),
    ] },
];

/** a data role of the 1.4 field guide: role name (capabilities), its display name and one sentence of purpose */
export interface FieldRole {
    role: string;
    /** display name key of the field well (Role_*) */
    name: string;
    /** one sentence: what the field does (UI_Fr*) */
    text: string;
    /** IBCS chip of a scenario role */
    chip?: "ac" | "py" | "pl" | "fc";
}

/** a group of the field guide: required · scenarios & time · statement logic · extras */
export interface FieldGroup {
    id: "required" | "scenarios" | "logic" | "extras";
    title: string;
    roles: FieldRole[];
}

const fr = (role: string, name: string, text: string, chip?: "ac" | "py" | "pl" | "fc"): FieldRole =>
    (chip ? { role, name, text, chip } : { role, name, text });

/** 1.4 field guide: every data role of capabilities.json, exactly once, in four groups */
export const FIELD_GROUPS: FieldGroup[] = [
    { id: "required", title: "UI_FgRequired", roles: [
        fr("levels", "Role_Levels", "UI_FrLevels"),
        fr("account", "Role_Account", "UI_FrAccount"),
        fr("parent", "Role_Parent", "UI_FrParent"),
        fr("ac", "Role_AC", "UI_FrAc", "ac"),
    ] },
    { id: "scenarios", title: "UI_FgScenarios", roles: [
        fr("py", "Role_PY", "UI_FrPy", "py"),
        fr("pl", "Role_PL", "UI_FrPl", "pl"),
        fr("fc", "Role_FC", "UI_FrFc", "fc"),
        fr("period", "Role_Period", "UI_FrPeriod"),
        fr("fcFy", "Role_FCFY", "UI_FrFcFy"),
        fr("plFy", "Role_PLFY", "UI_FrPlFy"),
    ] },
    { id: "logic", title: "UI_FgLogic", roles: [
        fr("rowType", "Role_RowType", "UI_FrRowType"),
        fr("formulaDef", "Role_FormulaDef", "UI_FrFormula"),
        fr("signConvention", "Role_Sign", "UI_FrSign"),
        fr("displayInvert", "Role_DisplayInvert", "UI_FrDisplayInv"),
        fr("varianceInvert", "Role_VarianceInvert", "UI_FrVarianceInv"),
        fr("sortOrder", "Role_SortOrder", "UI_FrSort"),
    ] },
    { id: "extras", title: "UI_FgExtras", roles: [
        fr("accountName", "Role_AccountName", "UI_FrAccountName"),
        fr("comment", "Role_Comment", "UI_FrComment"),
        fr("colCategory", "Role_ColCategory", "UI_FrColCat"),
        fr("filterInfo", "Role_FilterInfo", "UI_FrFilterInfo"),
    ] },
];

/** a line of step ① of the "first 3 minutes" checklist */
export interface StartFieldStep {
    id: "levels" | "ac" | "refs" | "period" | "logic";
    /** required (the statement needs it) or recommended */
    required: boolean;
    /** any of these roles bound ticks the line */
    roles: string[];
    text: string;
}

/**
 * Step ① of "🚀 Loslegen": the quick way with level columns first, then AC,
 * then the recommended roles. A line is ticked as soon as one of its roles is
 * bound (the account ID counts for the hierarchy as well).
 */
export const START_FIELD_STEPS: StartFieldStep[] = [
    { id: "levels", required: true, roles: ["levels", "account"], text: "UI_GoFLevels" },
    { id: "ac", required: true, roles: ["ac"], text: "UI_GoFAc" },
    { id: "refs", required: false, roles: ["py", "pl"], text: "UI_GoFRefs" },
    { id: "period", required: false, roles: ["period"], text: "UI_GoFPeriod" },
    { id: "logic", required: false, roles: ["rowType", "signConvention"], text: "UI_GoFLogic" },
];

/** the ticks of step ①, given the bound roles */
export function startFieldTicks(bound: (role: string) => boolean): Record<string, boolean> {
    const out: Record<string, boolean> = {};
    for (const s of START_FIELD_STEPS) { out[s.id] = s.roles.some(bound); }
    return out;
}

/** the three font size presets of the hub's bottom bar, in this order */
export const FONT_PRESETS: { value: "hd" | "fullhd" | "uhd"; label: string }[] = [
    { value: "hd", label: "HD" }, { value: "fullhd", label: "Full HD" }, { value: "uhd", label: "UHD" },
];

/** the online documentation of the visual: German for German locales, English for every other */
export function docsUrl(locale: string): string {
    return /^de\b/i.test(locale || "")
        ? "https://datenwgknowledgekitchen.com/pnl-doku.html"
        : "https://datenwgknowledgekitchen.com/pnl-doku_en.html";
}

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
