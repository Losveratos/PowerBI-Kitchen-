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
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;

import { VisualFormattingSettingsModel, PaneContext, applyPaneGates, localizeSettings } from "./settings";
import { UI_EN, fillArgs } from "./i18n";
import {
    buildModel, flattenVisible, collapseToLevel, variance, displayValue,
    parseRowType, parseBool, parseSign, rowsFromLevels, aggregateMonthly,
    isZeroRow, revenueBase, formulaOperands, nodeResolver, Variance,
    syntheticTotal, TOTAL_ID, parsePeriod, displayVariance, sumSafeRound, varianceOf, sortMonths,
    FormulaOp, InputRow, LevelInputRow, PeriodSort, PnlModel, PnlNode, Scenario,
} from "./engine";
import {
    layoutMega, paintMega, megaActive, activeRefs, setMegaPalette, buildColumns, MEGA_PRESETS, parseAmount, niceFactor,
    MegaBlock, MegaDelta, MegaRef, MegaRow, MegaScen, MegaToggles, MegaLayout, MegaPaintOpts, MegaPainted,
} from "./megatable";
import { cascade, CascadeNode } from "./waterfall";
import { buildDemoRows } from "./demo";
import { templateSwitches, HUB_TEMPLATES, TOUR_CARDS, MiniSpec, miniObjects, templateNeedsFc,
    HUB_GALLERY, GalleryTile, FIELD_GROUPS, START_FIELD_STEPS, startFieldTicks, FONT_PRESETS, docsUrl } from "./hub";

const FONT = "'Segoe UI', wf_segoe-ui_normal, helvetica, arial, sans-serif";
const NBSP_GROUP = " "; // narrow space, IBCS number grouping

/**
 * The palette of the visual. `C` is the live palette every painter reads at
 * call time; applyPalette() copies C_LIGHT or C_DARK into it at the start of
 * every update, so one switch recolours table, mega table, waterfall, tree,
 * tiles and hover panels alike. C_LIGHT is exactly the 0.17 palette — an
 * untouched report in a light theme renders pixel-identical.
 */
const C_LIGHT = {
    ac: "#404040", py: "#B3B3B3",
    text: "#1A1A1A", soft: "#8A8886", line: "#404040", gridSoft: "#EDEBE9",
    tealGood: "#0E8585", tealBad: "#E02B1D",
    ibcsGood: "#8CB400", ibcsBad: "#FF2600",
    /** blue / orange preset (ColorBrewer, ChartKitchen colors.variancePreset) */
    boGood: "#2C7BB6", boBad: "#E66101",
    comment: "#0064FF", loading: "#B35C00",
    // driver tree
    cardEdge: "#E3E1DC", cardEdgeHover: "#C6C3BC", elbow: "#B4B4B4", refGray: "#9A9A9A",
    /** resting border of a control (toolbar button, chip) — quieter than a card edge */
    ctlEdge: "#DEDCD7", ctlHover: "#F4F3F0",
    /** paper inside marks: hatch ground, outlined PL fills, halos, chevron boxes */
    paper: "#FFF",
    /** text on the ink fill (active 12M chip, AC share label of the total column) */
    onInk: "#FFF",
    /** demo banner wash */
    wash: "#F7F6F3",
    /** shadow language of the cards — one resting elevation, one on hover */
    shadow: "0 1px 2px rgba(15,30,46,.06)",
    shadowHover: "0 2px 6px rgba(15,30,46,.10)",
    headShadow: "0 3px 8px rgba(15,30,46,.07)",
    zoomShadow: "0 6px 20px rgba(15,30,46,.16)",
    shadeRest: "rgba(15,30,46,.06)",
    shadeHover: "rgba(15,30,46,.10)",
};
/**
 * Dark stand-ins, ChartKitchen's dark palette as reference: ink #D9D9D9 (AC /
 * PL outline), PY #8A8A8A, text #E0E0E0, subtle #A6A6A6, faint #3F3F3F; teal
 * #3FB3C2 / red #E4635F — the ChartKitchen dark variance pair, both ≥ 4.5:1 on
 * the dark paper.
 */
const C_DARK: typeof C_LIGHT = {
    ac: "#D9D9D9", py: "#8A8A8A",
    text: "#E0E0E0", soft: "#A6A6A6", line: "#BFBFBF", gridSoft: "#3F3F3F",
    tealGood: "#3FB3C2", tealBad: "#E4635F",
    ibcsGood: "#9CCB19", ibcsBad: "#FF5A3C",
    boGood: "#5BA3DC", boBad: "#F0821E",
    comment: "#6EA8FF", loading: "#E0913A",
    cardEdge: "#3F3F3F", cardEdgeHover: "#5E5E5E", elbow: "#6E6E6E", refGray: "#7A7A7A",
    ctlEdge: "#4A4A4A", ctlHover: "#30302C",
    paper: "#1E1E1E",
    onInk: "#1E1E1E",
    wash: "#2A2A27",
    shadow: "0 1px 2px rgba(0,0,0,.45)",
    shadowHover: "0 2px 6px rgba(0,0,0,.55)",
    headShadow: "0 3px 8px rgba(0,0,0,.45)",
    zoomShadow: "0 6px 20px rgba(0,0,0,.6)",
    shadeRest: "rgba(0,0,0,.35)",
    shadeHover: "rgba(0,0,0,.5)",
};
const C = { ...C_LIGHT };
/**
 * High contrast (mega table only): every ink, gray, rule and signal tone
 * becomes the host foreground, every paper the host background — the mega
 * painter then tells good / bad and PY apart by pattern (MegaInput.hc).
 */
function hcPalette(fg: string, bg: string): Partial<typeof C_LIGHT> {
    const out: Partial<Record<keyof typeof C_LIGHT, string>> = {};
    for (const k of ["ac", "py", "text", "soft", "line", "gridSoft", "tealGood", "tealBad", "ibcsGood", "ibcsBad", "boGood", "boBad",
        "comment", "loading", "cardEdge", "cardEdgeHover", "elbow", "refGray", "ctlEdge"] as (keyof typeof C_LIGHT)[]) { out[k] = fg; }
    for (const k of ["ctlHover", "paper", "onInk", "wash"] as (keyof typeof C_LIGHT)[]) { out[k] = bg; }
    return out;
}
/** dark default of the page / card background pickers (used while they hold their white default) */
const DARK_PAPER = "#1E1E1E";
const DARK_CARD = "#262624";

/** relative luminance of a #RRGGBB colour (WCAG), 1 for anything unreadable */
function relLuminance(hex: string): number {
    const m = /^#?([0-9a-f]{6})$/i.exec((hex || "").trim());
    if (!m) { return 1; }
    const ch = (i: number): number => {
        const c = parseInt(m[1].slice(i, i + 2), 16) / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * ch(0) + 0.7152 * ch(2) + 0.0722 * ch(4);
}
/** transition of the interactive chrome — present, never a show */
const TRANSITION = "background-color .12s ease,border-color .12s ease,box-shadow .12s ease,color .12s ease";
/**
 * 1.4.1 family values of the hub's bottom bar — identical in ChartKitchen so
 * both visuals compare pixel by pixel: 12 px horizontal · 8 px vertical
 * padding, 6 px between the pills, 10 px between the groups, the "made by
 * Daten-WG" signature at 9 px / 60 % opacity under the bar. Fixed px — only
 * the pills and texts follow the font size preset.
 */
/** the hover lift of every hub tile (home tiles, "🚀 Loslegen", gallery) */
const HUB_LIFT = "translateY(-2px)";
const HUB_BAR = { padX: 12, padY: 8, pillGap: 6, gap: 10, madeFs: 9, madeLh: 12, madePadB: 4 };
/** #RRGGBB (or #RGB) as rgba() with the given alpha; anything else comes back unchanged */
function rgbaOf(hex: string, a: number): string {
    let h = (hex || "").trim().replace("#", "");
    if (/^[0-9a-f]{3}$/i.test(h)) { h = h.split("").map(ch => ch + ch).join(""); }
    if (!/^[0-9a-f]{6}$/i.test(h)) { return hex; }
    return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
}

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
/**
 * Mega table (1.1): above this many rows only the rows around the viewport
 * are painted (the layout stays complete); at or below it the table paints
 * exactly as before. Rows painted above / below the viewport.
 */
const MEGA_VIRT_MIN_ROWS = 150;
/** 1.2 column category: at most this many category blocks (the rest is named in the footnotes) */
const CAT_MAX = 24;
const MEGA_VIRT_BUFFER = 30;
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
type Preset = "full" | "acref" | "acpydpy" | "acpldpl" | "dpct" | "dall" | "custom";
/** 1.2 preset "custom": the value columns as independent switches, Δ = bar + pin against the Δ reference */
interface ValSet { ac: boolean; py: boolean; pl: boolean; fc: boolean; d: boolean }
/** 1.2 the reader's value columns of the mega table (analysed scenario · PY · PL) */
interface MegaVals { min: boolean; py: boolean; pl: boolean }
type Unit = "auto" | "none" | "k" | "m" | "b";
type Density = "normal" | "compact";
/** pages of the 1.3 Start hub */
type HubPage = "hub" | "tour" | "templates" | "demo" | "fields" | "start";
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
    /**
     * Reader's scenario view of the mega table (toolbar group "Scenario",
     * 1.1): "" = the author's pane setting; else the analysed scenario AC / FC
     * and the reference view ΔPY · ΔPL · both. A pane change of the mega
     * switches resets both to "" (see syncPaneDefaults).
     */
    megaMin: "" | "ac" | "fc";
    megaRef: "" | "py" | "pl" | "both";
    /**
     * 1.2 value-column switches of the preset "custom" (toolbar group "Value
     * columns" / pane colAc … colDelta). Read only while preset = "custom".
     */
    vals: ValSet;
    /** 1.2 the reader's value columns of the mega table; null = the author's switches */
    megaVals: MegaVals | null;
}

/** current schema version of the persisted tree state (see UiState.treeV) */
const TREE_STATE_V = 2;

/**
 * How many updates a toolbar write waits for its echo before the host's state
 * counts again (same pattern and size as the template guard of the mega table).
 */
const UI_ECHO_TTL = 5;

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
    /** 1.2 column category: index into Visual.catModels — the cell reads that category's model */
    cat?: number;
    scen?: Scenario;      // for val
    ref?: Scenario;       // for bar/pin
    minuend?: Scenario;   // for bar/pin ("ac" | "fcfy")
    block?: "mtd" | "ytd" | "fy";
    label: string;
}

interface Block { key: "mtd" | "ytd" | "fy"; label: string; specs: ColSpec[]; /** 1.2 column category block */ cat?: number; }

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
    /** 1.5: some Δ% pin of the table runs past ±40 % — the pin lanes reserve an outlier zone */
    pOver: boolean;
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
    /**
     * 1.5 (IBCS 2.0 / ISO 24896): px per data unit of the Δ bars next to value
     * bars or cascades — the value scale, or a round multiple of it (`dMag`,
     * head "ΔPL ×5") when the Δ would be unreadable there. 0 = the Δ bars stand
     * alone (table view) and keep the uniform Δ scale ±maxAbsDelta.
     */
    dPpu: number;
    dMag: number;
    /** 1.5: the pin lanes keep ±40 % in the inner 80 %, the rest is the outlier zone */
    pinZone: boolean;
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
    /** the host's localization manager (null in hosts that offer none) */
    private locMgr: powerbi.extensibility.ILocalizationManager | null = null;

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
    /** updates a toolbar write may still wait for its echo (see syncUiState) */
    private pendingTtl = 0;
    /** states the visual's own pending writes replaced (the only stale echoes) */
    private supersededUi: string[] = [];
    private lastApplied: string | null = null;
    /** the format-pane defaults of the toolbar state, as of the last update */
    private paneSnap: Record<string, string> | null = null;

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
    /** stage width of the last host update (Smart Start needs room) */
    private vpW = 0;

    // --- Smart Start (demo statement while no fields are bound) + dark mode ---
    /** raw powerbi.ViewMode of the last update (0 view, 1 edit, 2 in-focus edit); null = host did not say */
    private viewMode: number | null = null;
    /** the model on screen is the built-in demo, not report data */
    private demo = false;
    /** locale the demo model was built in (names are localized) */
    private demoLocale = "";
    /** roles the author still has to bind (null = nothing bound yet) */
    private demoMissing: string[] | null = null;
    /** dark palette active (style.appearance, resolved every update) */
    private dark = false;
    /** high contrast of the mega table: the host's foreground / background / selection colour (null = off) */
    private hc: { fg: string; bg: string; sel: string } | null = null;

    /** the frozen head block (title · toolbar · legend · scale note) */
    private headEl: HTMLElement | null = null;
    /** whether the head currently draws its divider + shadow (scrollTop > 0) */
    private headStuck = false;
    /** resolved height of the integrated zoom chart (see ZOOM_CHART_H) */
    private zoomChartH = ZOOM_CHART_H;
    /** 1.5 tree cards: shared px per unit per "unit:mode" (measuring pass, then drawing); null = every chart for itself */
    private treeScl: { collect: boolean; fit: Map<string, number>; mags: number } | null = null;
    /** 1.5 collapsible control bars: the reader's ☰ choice (null = toolbar.startFolded) — runtime only */
    private tbOpen: boolean | null = null;
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

    // --- mega table (IBCS templates T01–T04, see SPEC-MEGATABLE.md) ---
    /**
     * Template switch we just persisted but the host has not echoed back yet —
     * the echo-guard + TTL pattern of ChartKitchen (AGENT-GUIDE, persistProperties):
     * while it lives, a stale metadata update cannot turn the freshly written
     * switches back; after `ttl` updates the pane value wins again, so a lost
     * echo never pins a value forever.
     */
    private megaPending: {
        applied: string;
        cols: Record<string, boolean | string>;
        nums: Record<string, number>;
        /** titleBlock switches a template sets (12G / 12H: headline) */
        title: Record<string, boolean>;
        ttl: number;
    } | null = null;
    /** virtualized mega table (> MEGA_VIRT_MIN_ROWS rows): the complete layout + the painted window */
    private megaVs: {
        L: MegaLayout; opts: MegaPaintOpts; body: SVGSVGElement;
        from: number; to: number; bind: (hits: MegaPainted["hits"]) => void;
    } | null = null;
    /** template applied in this session — a lost echo must not re-apply it in a loop */
    private megaSessionTpl: string | null = null;
    /** text measure of the mega table (canvas, lazily created) */
    private measureCtx: CanvasRenderingContext2D | null = null;
    /** Intl number formats of the mega table per decimal count */
    private megaNf = new Map<string, Intl.NumberFormat>();

    // --- 1.1 Paket B: tooltips · sum-safe rounding · filter footer ---
    /** host tooltip service (null in shims without one) */
    private tooltipService: powerbi.extensibility.ITooltipService | null = null;
    /** self-drawn dark tooltip (ChartKitchen showDarkTip) — light mode keeps the native one */
    private darkTip: HTMLDivElement | null = null;
    /** text of the bound filterInfo measure (second footer line), null = unbound / empty */
    private filterInfo: string | null = null;
    /** sum-safe rounded raw values per block|scenario|unit|decimals (cleared every render) */
    private ssCache = new Map<string, Map<string, number>>();
    /** 1.2 the arguments of the last Smart Start render — the empty-state switches re-run it */
    private startArgs: { dataView: DataView | undefined; missing: string[] | null } | null = null;
    /** 1.2 echo guard of emptyState.mode written by the empty-state switches */
    private emptyPending: { mode: string; ttl: number } | null = null;
    /** 1.4 echo guard of the hub's font size bar (style.fontPreset), the UI_ECHO_TTL pattern */
    private fontPending: { v: string; ttl: number } | null = null;

    // --- 1.3 Start hub (tour · template gallery · demo · field guide) ---
    /** page of the hub; local state, never persisted */
    private hubPage: HubPage = "hub";
    /** card of the feature tour */
    private hubTour = 0;
    /** the overlay layer of the hub over a bound statement (edit mode); null = closed */
    private hubOverlay: HTMLElement | null = null;
    /** the host element got position:relative for the overlay — undone on close */
    private hubParentFixed = false;
    /** data-pnl of the control that gets the focus after the next hub render (keyboard flow) */
    private hubFocusKey: string | null = null;
    /** mini renderings of the page being built; they run once the page is attached */
    private hubMinis: (() => void)[] = [];
    /** generation of the hub page — a newer page cancels the batches of an older one */
    private hubGen = 0;
    /** template saved from the gallery while no fields were bound (shows the "saved" note) */
    private hubSaved: string | null = null;
    /** the last data view of update() — the overlay's field guide reads it */
    private lastDv: DataView | undefined;
    /** this instance is a mini rendering of the hub (a tiny, non-interactive copy over the demo) */
    private miniSpec: MiniSpec | null = null;
    /**
     * 1.2 column category (role colCategory): one model per category value,
     * built from the same rows filtered to that value and aligned to the
     * months of the main model — the classic table repeats its column set
     * per category from these. null = role not bound (or the mega table).
     */
    private catModels: { label: string; model: PnlModel }[] | null = null;
    /** the colCategory role is bound (the mega table ignores it, with an edit-mode note) */
    private catBound = false;
    /** category values beyond CAT_MAX that got no block */
    private catCapped = 0;

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
        // every user-facing text goes through the host's localization manager
        // (stringResources/<locale>/resources.resjson); a host without one
        // (old test shims) gets the English fallback table of i18n.ts
        this.locMgr = typeof options.host.createLocalizationManager === "function"
            ? options.host.createLocalizationManager() : null;
        this.formattingSettingsService = new FormattingSettingsService(this.locMgr ?? undefined);
        this.locale = options.host.locale || "en-US";
        this.tooltipService = options.host.tooltipService ?? null;
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
            if (options.viewport && options.viewport.width > 0) { this.vpW = options.viewport.width; }
            // Smart Start is an edit-mode aid — remember the raw view mode every update
            this.viewMode = options.viewMode ?? null;
            const dataView = options.dataViews && options.dataViews[0];
            this.lastDv = dataView;
            this.settings = this.formattingSettingsService.populateFormattingSettingsModel(
                VisualFormattingSettingsModel, dataView);
            localizeSettings(this.settings, k => this.trOpt(k));
            this.syncEmptyMode();
            this.syncFontPreset();
            this.dark = this.resolveDarkMode();
            this.applyPalette();
            if (!dataView) {
                this.resetSegments();
                this.showStart(undefined, null); this.events.renderingFinished(options); return;
            }
            this.trackSegments(dataView, options.operationKind);
            this.filterInfo = this.readFilterInfo(dataView);

            // parse + build only when the data actually changed — toolbar clicks
            // and resizes reuse the model (rerender() never enters this path)
            const fp = this.fingerprint(dataView);
            if (this.model == null || this.demo || fp !== this.lastFingerprint) {
                const parsed = this.parseRows(dataView);
                if (!parsed) {
                    this.showStart(dataView, this.missingRoles(dataView));
                    this.events.renderingFinished(options); return;
                }
                if (this.demo) { this.leaveDemo(); }
                // fields are bound: the hub starts at its home page the next time
                this.hubPage = "hub"; this.hubSaved = null;
                if (parsed.rows.length === 0) {
                    this.model = null; this.vs = null; this.lastFingerprint = null; this.catModels = null;
                    this.renderEmpty(); this.events.renderingFinished(options); return;
                }
                this.model = buildModel(parsed.rows, this.tr("UI_NotAssigned"), parsed.months);
                this.buildCatModels(dataView, parsed.months);
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
            this.syncMegaTemplate(dataView);
            this.syncUiState(dataView);
            // a pane default the author just changed is written into the
            // stored toolbar state too — otherwise the next report load would
            // bring the old toolbar choice back over it
            if (this.syncPaneDefaults()) { this.persistUi(); }
            this.render();
            // the hub overlay (edit mode) follows the host: a reader never keeps it, a resize redraws it
            if (this.hubOverlay) { if (this.editMode()) { this.hubRefresh(); } else { this.closeHub(false); } }
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
            this.statusWarnings.push(this.tr("UI_RowLimit"));
        }
        if (this.awaitingSegment) {
            this.statusWarnings.push(this.loadingText());
        }
        if (this.catCapped > 0) {
            this.statusWarnings.push(this.tr("UI_ColCatCapped", this.catCapped, CAT_MAX));
        }
    }

    private loadingText(): string {
        const n = new Intl.NumberFormat(this.locale).format(this.loadedRows)
            .replace(/[ ,. ]/g, NBSP_GROUP);
        return "⏳ " + this.tr("UI_Loading", n);
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
        if (this.settings) { applyPaneGates(this.settings, this.paneContext()); }
        return this.formattingSettingsService.buildFormattingModel(this.settings);
    }

    /**
     * What the format-pane gates may know: the current view and the bound
     * roles of real data. The demo (Smart Start) and an empty visual report
     * "unknown", so every data-dependent switch stays visible there.
     */
    private paneContext(): PaneContext {
        const real = this.model != null && !this.demo;
        return {
            view: this.ui?.view ?? null,
            has: real ? {
                py: this.has.py, pl: this.has.pl, fc: this.has.fc, period: this.model!.months.length > 1, fy: this.has.fcfy,
            } : null,
            statement: real ? this.megaStatement() : null,
        };
    }

    // ---------------- data ----------------

    private parseRows(dataView: DataView, only?: Set<number>): {
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
                // 1.2 column category: the rows of one category value only
                if (only && !only.has(i)) { continue; }
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
            if (only && !only.has(i)) { continue; }
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

    /**
     * 1.2 column category: split the data-view rows by the colCategory value
     * and build one model per value with the very parse path of the main model
     * (levels or parent-child, month aggregation, formulas per category). The
     * monthly series are re-aligned to the main model's months, so the YTD
     * window, the month block and every Δ read one shared calendar.
     * Period-like values sort into calendar order, anything else keeps the
     * data order; blanks come last; more than CAT_MAX values are cut.
     */
    private buildCatModels(dataView: DataView, months: string[]): void {
        this.catModels = null; this.catBound = false; this.catCapped = 0;
        const col = (dataView.categorical?.categories ?? []).find(c => c.source.roles && c.source.roles["colCategory"]);
        if (!col) { return; }
        this.catBound = true;
        const groups = new Map<string, number[]>();
        for (let i = 0; i < col.values.length; i++) {
            const raw = col.values[i];
            let k = "";
            if (raw instanceof Date) {
                if (!isNaN(raw.getTime())) {
                    k = `${raw.getFullYear()}-${String(raw.getMonth() + 1).padStart(2, "0")}-${String(raw.getDate()).padStart(2, "0")}`;
                }
            } else if (raw != null) { k = String(raw).trim(); }
            const arr = groups.get(k);
            if (arr) { arr.push(i); } else { groups.set(k, [i]); }
        }
        let keys = sortMonths([...groups.keys()].filter(k => k !== ""), "auto");
        if (groups.has("")) { keys.push(""); }
        if (keys.length > CAT_MAX) { this.catCapped = keys.length - CAT_MAX; keys = keys.slice(0, CAT_MAX); }
        const out: { label: string; model: PnlModel }[] = [];
        for (const k of keys) {
            const parsed = this.parseRows(dataView, new Set(groups.get(k)));
            if (!parsed || parsed.rows.length === 0) { continue; }
            const rows = parsed.rows.map(r => this.alignSeries(r, parsed.months, months));
            out.push({ label: k === "" ? this.tr("UI_ColCatBlank") : this.catLabel(k),
                model: buildModel(rows, this.tr("UI_NotAssigned"), months) });
        }
        this.catModels = out.length > 0 ? out : null;
    }

    /** re-index a row's monthly series from its own months to the main model's months */
    private alignSeries(r: InputRow, from: string[], to: string[]): InputRow {
        if (!r.series || (from.length === to.length && from.every((m, i) => m === to[i]))) { return r; }
        const idx = from.map(m => to.indexOf(m));
        const series: Partial<Record<Scenario, (number | null)[]>> = {};
        for (const [sc, arr] of Object.entries(r.series) as [Scenario, (number | null)[] | undefined][]) {
            if (!arr) { continue; }
            const o = new Array<number | null>(to.length).fill(null);
            arr.forEach((v, j) => { if (idx[j] >= 0) { o[idx[j]] = v; } });
            series[sc] = o;
        }
        return { ...r, series };
    }

    /** header label of a category value: date keys as "Mar 2026", everything else as written */
    private catLabel(k: string): string {
        const m = /^(\d{4})-(\d{2})(?:-\d{2})?$/.exec(k);
        return m ? `${this.monthLabel(k)} ${m[1]}` : k;
    }

    /** the node of a row in a category model (same row id), or null when the category has no such row */
    private catNode(cat: number, node: PnlNode): PnlNode | null {
        return this.catModels?.[cat]?.model.byId.get(node.row.id) ?? null;
    }

    /** column categories apply to the classic TABLE view only */
    private catInView(): boolean {
        return this.catModels != null && this.ui != null && this.ui.view === "table" && !this.megaInView();
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
    /** a static export (PDF / PowerPoint) or a subscription: the host allows no interactions */
    private exporting(): boolean {
        return this.host.hostCapabilities?.allowInteractions === false;
    }

    private interactive(): boolean {
        // the demo carries no report identities — nothing to select or drill
        if (this.demo) { return false; }
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
        return " · " + this.tr("UI_SelCap", SEL_MAX_ROWS);
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
        b.textContent = this.tr("UI_Drill");
        b.title = this.tr("UI_DrillTip") + this.selCapNote(node);
        b.style.cssText = `font-family:${FONT};font-size:${this.kpx(13)};font-weight:600;line-height:1.3;` +
            `padding:${this.kpx(8)} ${this.kpx(16)};cursor:pointer;border-radius:6px;border:1px solid ${acc};` +
            `background:${C.paper};color:${acc};transition:${TRANSITION};box-shadow:${C.shadow};`;
        b.onmouseenter = (): void => {
            b.style.background = this.accentSoft(0.10);
            b.style.boxShadow = C.shadowHover;
        };
        b.onmouseleave = (): void => { b.style.background = C.paper; b.style.boxShadow = C.shadow; };
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
            megaMin: "",
            megaRef: "",
            vals: this.paneVals(),
            megaVals: null,
        };
    }

    /** the own-selection switches of the format pane (preset "custom") */
    private paneVals(): ValSet {
        const c = this.settings.columnsCard;
        return { ac: c.colAc.value, py: c.colPy.value, pl: c.colPl.value, fc: c.colFc.value, d: c.colDelta.value };
    }

    /** the format-pane settings the toolbar state starts from, as plain strings */
    private paneDefaults(): Record<string, string> {
        const s = this.settings;
        return {
            preset: String(s.columnsCard.preset.value.value),
            ref: String(s.columnsCard.reference.value.value),
            unit: String(s.numbersCard.scaling.value.value),
            density: String(s.styleCard.density.value.value),
            pctRev: String(s.columnsCard.pctRevenue.value),
            hideZero: String(s.columnsCard.hideZeroRows.value),
            fit: String(s.columnsCard.fitWidth.value),
            level: String(s.hierarchyCard.defaultLevel.value),
            treeCard: String(s.columnsCard.treeCard.value.value),
            treeStatus: String(s.columnsCard.treeStatus.value),
            // the mega switches the reader's scenario view starts from
            megaMin: String(s.columnsCard.minuend.value.value),
            megaRef: this.megaPaneSig(),
            vals: JSON.stringify(this.paneVals()),
            megaVals: [s.columnsCard.showPY, s.columnsCard.showPL, s.columnsCard.showMinuend].map(x => (x.value ? "1" : "0")).join(""),
        };
    }

    /**
     * The format pane is the author's default, the toolbar the reader's
     * choice — but a default the author CHANGES must win. Up to 1.0.0 the
     * toolbar state was taken from the pane once per session and, after the
     * first toolbar click, from the stored state forever: changing "Column
     * preset", "Δ reference", "Scaling", "Density" … in the pane did nothing.
     * Now every pane value that differs from the previous update is copied
     * into the toolbar state (only that one — the reader's other choices
     * stay). Returns true when something was taken over.
     */
    private syncPaneDefaults(): boolean {
        const now = this.paneDefaults();
        const prev = this.paneSnap;
        this.paneSnap = now;
        const ui = this.ui;
        if (!prev || !ui) { return false; }
        const d = this.defaultUi();
        let took = false;
        for (const k of Object.keys(now)) {
            if (now[k] === prev[k]) { continue; }
            if (k !== "megaMin" && k !== "megaRef" && k !== "megaVals") { took = true; }
            switch (k) {
                case "preset": ui.preset = d.preset; break;
                case "ref": ui.ref = d.ref; break;
                case "unit": ui.unit = d.unit; break;
                case "density": ui.density = d.density; break;
                case "pctRev": ui.pctRev = d.pctRev; break;
                case "hideZero": ui.hideZero = d.hideZero; break;
                case "fit": ui.fit = d.fit; break;
                case "level": ui.collapsed = d.collapsed; break;
                case "treeCard": ui.treeCard = d.treeCard; break;
                case "treeStatus": ui.treeStatus = d.treeStatus; break;
                // an author change of the mega switches ends the reader's scenario
                // view — but only a view that was set counts as taken over (the
                // pane edits of the mega table never persisted the toolbar state)
                case "megaMin": if (ui.megaMin !== "") { took = true; ui.megaMin = ""; } break;
                case "megaRef": if (ui.megaRef !== "") { took = true; ui.megaRef = ""; } break;
                case "vals": ui.vals = d.vals; break;
                case "megaVals": if (ui.megaVals != null) { took = true; ui.megaVals = null; } break;
            }
        }
        return took;
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
            if (str === this.pendingPersist) {
                this.lastApplied = str;
                this.pendingPersist = null;
                this.supersededUi = [];
            } else if ((str == null || this.supersededUi.includes(str)) && --this.pendingTtl > 0) {
                // Echo guard: an update that still carries a state this visual
                // itself has written over (the one before the click — a resize
                // arriving first — or an earlier click whose echo comes late)
                // must not throw the reader's click away. Up to 1.0.0 it did,
                // and the button sprang back until the echo came. Only the
                // host's own echo or the TTL (the write was lost) ends the
                // guard; a state the visual never wrote — a bookmark — is
                // applied at once below.
                return;
            } else {
                this.pendingPersist = null;
                this.supersededUi = [];
            }
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
        // the demo is explored locally — nothing of it may land in the report
        if (this.demo) { return; }
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
        // the states this write replaces — only these count as stale echoes
        if (this.lastApplied != null && this.lastApplied !== json) {
            this.supersededUi = [...this.supersededUi.slice(-(UI_ECHO_TTL - 1)), this.lastApplied];
        }
        this.pendingPersist = json;
        this.pendingTtl = UI_ECHO_TTL;
        this.lastApplied = json;
        this.host.persistProperties({
            merge: [{ objectName: "state", selector: null, properties: { uiState: json } }],
        });
    }

    // ---------------- formatting ----------------

    /**
     * Localized in-visual text: the host's resjson value for `key`, else the
     * English fallback of i18n.ts; {0} {1} … are filled from `args`.
     */
    private tr(key: string, ...args: (string | number)[]): string {
        return fillArgs(this.trOpt(key) ?? UI_EN[key] ?? key, args);
    }
    /** the host's string for a key, or null when it has none */
    private trOpt(key: string): string | null {
        const s = this.locMgr?.getDisplayName(key);
        return s && s !== key ? s : null;
    }
    /**
     * Engine messages (formula errors, model warnings) are English by design —
     * the engine has no host. They are translated where they are shown.
     */
    private trMsg(msg: string): string {
        const rules: [RegExp, string, ((m: RegExpExecArray) => (string | number)[])?][] = [
            [/^cycle$/, "UI_ErrCycle"],
            [/^empty formula$/, "UI_ErrEmpty"],
            [/^parse error$/, "UI_ErrParse"],
            [/^missing \)$/, "UI_ErrParen"],
            [/^missing \]$/, "UI_ErrBracket"],
            [/^empty reference$/, "UI_ErrEmptyRef"],
            [/^unexpected "(.*)"$/, "UI_ErrUnexpected", m => [m[1]]],
            [/^trailing "(.*)"$/, "UI_ErrTrailing", m => [m[1]]],
            [/^unknown reference \[(.*)\]$/, "UI_ErrUnknownRef", m => [m[1]]],
            [/^ref \[([^\]]*)\]: (.*)$/, "UI_ErrRef", m => [m[1], this.trMsg(m[2])]],
            [/^duplicate id: (.*)$/, "UI_WarnDuplicate", m => [m[1]]],
            [/^(\d+) row\(s\) in a parent-child cycle$/, "UI_WarnCycle", m => [m[1]]],
            [/^(\d+) orphan row\(s\) moved to "(.*)"$/, "UI_WarnOrphans", m => [m[1], m[2]]],
            [/^subtree under (.*) \((.*)\) is excluded from parent sums$/, "UI_WarnExcluded", m => [m[1], m[2]]],
            [/^formula error in ([^:]*): (.*)$/, "UI_WarnFormula", m => [m[1], this.trMsg(m[2])]],
        ];
        for (const [rx, key, args] of rules) {
            const m = rx.exec(msg);
            if (m) { return this.tr(key, ...(args ? args(m) : [])); }
        }
        return msg;
    }

    // ---------------- light / dark ----------------

    /**
     * Dark mode, ChartKitchen's rule (resolveDarkMode there): the pane's
     * appearance dropdown wins; "auto" reads the report theme's background
     * luminance (< 0.35 = dark). Themes that never set a background report
     * white, so auto only flips on genuinely dark themes — a page painted dark
     * by hand needs the explicit "dark". High contrast keeps the light path.
     */
    private resolveDarkMode(): boolean {
        const palette = this.host.colorPalette as powerbi.extensibility.ISandboxExtendedColorPalette | undefined;
        if (palette && palette.isHighContrast) { return false; }
        const mode = String(this.settings?.styleCard?.appearance?.value?.value ?? "auto");
        if (mode === "dark") { return true; }
        if (mode === "light") { return false; }
        const bg = palette?.background?.value;
        return !!bg && relLuminance(bg) < 0.35;
    }

    /** the dark paper: the theme's own background when it is dark, else the stand-in */
    private darkPaper(): string {
        const palette = this.host.colorPalette as powerbi.extensibility.ISandboxExtendedColorPalette | undefined;
        const bg = palette?.background?.value;
        return bg && relLuminance(bg) < 0.35 ? bg : DARK_PAPER;
    }

    /**
     * High contrast for the mega table (ChartKitchen's HC path): the host's
     * foreground / background / foregroundSelected. Only while the mega table
     * is on screen — the classic table, the bars / waterfall views and the
     * driver tree keep their light path unchanged.
     */
    private resolveHighContrast(): { fg: string; bg: string; sel: string } | null {
        const palette = this.host.colorPalette as powerbi.extensibility.ISandboxExtendedColorPalette | undefined;
        if (!palette || !palette.isHighContrast || !this.megaInView()) { return null; }
        const fg = palette.foreground?.value || "#000000";
        const bg = palette.background?.value || "#FFFFFF";
        return { fg, bg, sel: palette.foregroundSelected?.value || fg };
    }

    /** one switch for every painter: the live palettes C and MEGA_C */
    private applyPalette(): void {
        Object.assign(C, this.dark ? C_DARK : C_LIGHT);
        if (this.dark) { C.paper = this.darkPaper(); }
        this.hc = this.resolveHighContrast();
        if (this.hc) { Object.assign(C, hcPalette(this.hc.fg, this.hc.bg)); }
        setMegaPalette(this.dark, C.paper, this.hc ?? undefined);
        this.root.style.color = C.text;
    }

    /** paper inside a card (hollow PL marks, halos, badges): the palette paper in light mode
     *  (exactly 0.17), the card fill in dark mode, so a hollow mark never shows a darker hole */
    private cardPaper(): string {
        return this.dark ? this.cardBg() : C.paper;
    }

    /** text on the accent fill: white on dark accents, dark ink on light ones */
    private onAccent(): string {
        return relLuminance(this.accent()) > 0.45 ? "#1E1E1E" : "#FFF";
    }

    private makeFmt(maxAbs: number): Fmt {
        const u = this.ui!.unit;
        let div = 1; let suffix = "";
        if (u === "k") { div = 1e3; suffix = "k"; }
        else if (u === "m") { div = 1e6; suffix = "m"; }
        else if (u === "b") { div = 1e9; suffix = "b"; }
        else if (u === "auto") {
            // billions from 50 billion on (1.1) — the k / m thresholds are unchanged
            if (maxAbs >= 5e10) { div = 1e9; suffix = "b"; }
            else if (maxAbs >= 5e7) { div = 1e6; suffix = "m"; }
            else if (maxAbs >= 5e4) { div = 1e3; suffix = "k"; }
        }
        const dec = this.settings.numbersCard.decimals.value;
        const pdec = this.settings.numbersCard.pctDecimals.value;
        const nf = new Intl.NumberFormat(this.locale, { minimumFractionDigits: dec, maximumFractionDigits: dec });
        const pf = new Intl.NumberFormat(this.locale, { minimumFractionDigits: pdec, maximumFractionDigits: pdec });
        const grp = (nfr: Intl.NumberFormat, v: number): string =>
            nfr.formatToParts(v).map(p => (p.type === "group" ? NBSP_GROUP : p.value)).join("");
        if (this.finance()) {
            // finance convention (ChartKitchen financeFormat): negatives in
            // parentheses with the unit inside, exact zero "–", a rounded zero
            // without parentheses, positive Δ keep their "+"
            const fin = (nfr: Intl.NumberFormat, x: number, raw: number, plus: boolean, unit: string): string => {
                if (raw === 0) { return "–"; }
                const t = grp(nfr, Math.abs(x));
                if (!/[1-9]/.test(t)) { return t + unit; }
                return raw < 0 ? "(" + t + unit + ")" : (plus ? "+" : "") + t + unit;
            };
            return {
                div, suffix,
                val: (v, plus = false) => v == null ? "·" : fin(nf, v / div, v, plus, ""),
                pct: (v, plus = false) => v == null ? "–" : fin(pf, v * 100, v, plus, "%"),
            };
        }
        return {
            div, suffix,
            val: (v, plus = false) => v == null ? "·" : (plus && v > 0 ? "+" : "") + grp(nf, v / div),
            pct: (v, plus = false) => v == null ? "–" : (plus && v > 0 ? "+" : "") + grp(pf, v * 100) + "%",
        };
    }

    /**
     * Effective variance colour mode: style.variancePreset (1.1, ChartKitchen
     * name) wins when set; "auto" — the default — follows the older
     * style.colorMode switch, so reports saved before 1.1 keep their colours.
     */
    private varianceMode(): "teal" | "ibcs" | "blueOrange" {
        const st = this.settings.styleCard;
        const p = String(st.variancePreset?.value?.value ?? "auto");
        if (p === "teal" || p === "ibcs" || p === "blueOrange") { return p; }
        return String(st.colorMode.value.value) === "ibcs" ? "ibcs" : "teal";
    }
    private goodColor(): string {
        if (this.hc) { return this.hc.fg; }
        const o = this.settings.styleCard.goodColor.value?.value;
        if (o) { return o; }
        const m = this.varianceMode();
        return m === "ibcs" ? C.ibcsGood : m === "blueOrange" ? C.boGood : C.tealGood;
    }
    private badColor(): string {
        if (this.hc) { return this.hc.fg; }
        const o = this.settings.styleCard.badColor.value?.value;
        if (o) { return o; }
        const m = this.varianceMode();
        return m === "ibcs" ? C.ibcsBad : m === "blueOrange" ? C.boBad : C.tealBad;
    }
    /**
     * Accent of the interactive chrome (active toolbar buttons, the back button
     * of the tile view, breadcrumb hover). Data marks, axes and the AC column
     * fill never read this — they stay on the IBCS ink C.ac, which is also the
     * default, so an untouched report keeps exactly the previous look.
     */
    private accent(): string {
        if (this.hc) { return this.hc.sel; }
        const v = this.settings.styleCard.accentColor.value?.value || C_LIGHT.ac;
        // the light default of the picker becomes the dark ink — a chosen colour stays
        return this.dark && v.toUpperCase() === C_LIGHT.ac ? C.ac : v;
    }
    /** slightly lifted accent for hover states — mixed towards paper in sRGB */
    private accentSoft(alpha: number): string {
        if (this.hc) { return this.hc.sel; }
        const hex = this.accent().replace("#", "");
        if (!/^[0-9a-fA-F]{6}$/.test(hex)) { return this.accent(); }
        // light: towards white (exactly the 0.17 tint); dark: towards the dark paper
        let paper = (this.dark ? this.darkPaper() : "#FFFFFF").replace("#", "");
        if (paper.length === 3) { paper = paper.split("").map(ch => ch + ch).join(""); }
        if (!/^[0-9a-fA-F]{6}$/.test(paper)) { paper = "FFFFFF"; }
        const mix = (i: number): number => {
            const c = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
            const t = parseInt(paper.slice(i * 2, i * 2 + 2), 16);
            return Math.round(c + (t - c) * alpha);
        };
        return `rgb(${mix(0)},${mix(1)},${mix(2)})`;
    }
    /** paper of the visual — behind the tree and behind the tiles of the zoom */
    private pageBg(): string {
        if (this.hc) { return this.hc.bg; }
        const v = this.settings.styleCard.pageBackground.value?.value || "#FFF";
        return this.dark && /^#fff(fff)?$/i.test(v) ? this.darkPaper() : v;
    }
    /** fill of every card: tree cards, micro cards, the big tile, hover panel */
    private cardBg(): string {
        const v = this.settings.styleCard.cardBackground.value?.value || "#FFF";
        return this.dark && /^#fff(fff)?$/i.test(v) ? DARK_CARD : v;
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

    // ---------------- Smart Start ----------------

    /**
     * Smart Start: an author who drops the visual on a page sees a working
     * statement right away — the built-in demo P&L in the report's language,
     * with a quiet banner that names the roles still to bind. Only where it
     * helps and never where it could mislead: edit mode (or a host that does
     * not say, like the harness), interactions allowed (PDF / PowerPoint
     * export and subscriptions render with allowInteractions = false) and
     * enough room. Readers and exports of a report that lost its fields get the
     * plain text landing — demo numbers never reach a published page.
     */
    private demoAllowed(): boolean {
        if (this.host.hostCapabilities?.allowInteractions === false) { return false; }
        if (this.viewMode != null && this.viewMode < 1) { return false; }
        const w = this.vpW || this.root.clientWidth; const h = this.vpH || this.root.clientHeight;
        return w >= 300 && h >= 220;
    }

    /** start aids (demo, field guide) are edit-mode aids: never for readers or exports */
    private startAllowed(): boolean {
        if (this.host.hostCapabilities?.allowInteractions === false) { return false; }
        return this.viewMode == null || this.viewMode >= 1;
    }

    /** emptyState.mode: hub (1.3, default) · demo · fields · message */
    private emptyMode(): "hub" | "demo" | "fields" | "message" {
        const v = String(this.settings?.emptyStateCard?.mode?.value?.value ?? "hub");
        return v === "demo" || v === "fields" || v === "message" ? v : "hub";
    }

    /**
     * Echo guard of the empty-state switches (the UI_ECHO_TTL pattern): until
     * the host echoes the written mode, a stale update keeps the clicked one.
     */
    private syncEmptyMode(): void {
        const p = this.emptyPending;
        if (!p) { return; }
        const sl = this.settings.emptyStateCard.mode;
        if (String(sl.value?.value) === p.mode || --p.ttl <= 0) { this.emptyPending = null; return; }
        const it = (sl.items ?? []).find(x => String(x.value) === p.mode);
        if (it) { sl.value = it; }
    }

    /** 1.4 echo guard of style.fontPreset after a click in the hub's bottom bar */
    private syncFontPreset(): void {
        const p = this.fontPending;
        if (!p) { return; }
        const sl = this.settings.styleCard.fontPreset;
        if (String(sl.value?.value) === p.v || --p.ttl <= 0) { this.fontPending = null; return; }
        const it = (sl.items ?? []).find(x => String(x.value) === p.v);
        if (it) { sl.value = it; }
    }

    /**
     * 1.4 font size preset from the hub's bottom bar: writes style.fontPreset
     * (the same property as the format pane) and redraws at once — the hub,
     * the statement under the overlay or the demo page.
     */
    private setFontPreset(v: string): void {
        const sl = this.settings.styleCard.fontPreset;
        if (String(sl.value?.value) === v) { return; }
        const it = (sl.items ?? []).find(x => String(x.value) === v);
        if (!it) { return; }
        sl.value = it;
        this.fontPending = { v, ttl: UI_ECHO_TTL };
        this.host.persistProperties({ merge: [{ objectName: "style", selector: null, properties: { fontPreset: v } }] });
        this.hubFocusKey = "hub-font-" + v;
        if (this.hubOverlay) { this.render(); this.hubRefresh(); return; }
        if (this.demo && this.hubPage === "demo") {
            this.render();
            const el = this.root.querySelector<HTMLElement>(`[data-pnl="${this.hubFocusKey}"]`);
            this.hubFocusKey = null;
            if (el) { el.focus(); }
            return;
        }
        this.hubRefresh();
    }

    /** 1.4 "📖 Doku öffnen": the online documentation through the host (IVisualHost.launchUrl) */
    private openDocs(): void {
        const h = this.host as IVisualHost & { launchUrl?: (url: string) => void };
        if (typeof h.launchUrl === "function") { h.launchUrl(docsUrl(this.locale)); }
    }

    /** empty-state switch (edit mode): writes emptyState.mode and shows the new start at once */
    private setEmptyMode(mode: "demo" | "fields" | "message"): void {
        const sl = this.settings.emptyStateCard.mode;
        const it = (sl.items ?? []).find(x => String(x.value) === mode);
        if (it) { sl.value = it; }
        this.emptyPending = { mode, ttl: UI_ECHO_TTL };
        this.host.persistProperties({ merge: [{ objectName: "emptyState", selector: null, properties: { mode } }] });
        const a = this.startArgs;
        this.showStart(a ? a.dataView : undefined, a ? a.missing : null);
    }

    /** a small switch button of the empty state (edit mode only) */
    private startSwitch(label: string, mode: "demo" | "fields" | "message"): HTMLElement {
        const b = this.tbBtn(label, false, () => { /* replaced below */ }, this.tr("UI_EsSwitchTip"));
        b.setAttribute("data-pnl", "es-" + mode);
        b.onclick = (e: Event): void => { e.stopPropagation(); this.setEmptyMode(mode); };
        return b;
    }

    /** the row of empty-state switches — every mode except the current one */
    private startSwitchRow(cur: "demo" | "fields" | "message"): HTMLElement | null {
        if (!this.editMode()) { return null; }
        const row = document.createElement("div");
        row.setAttribute("data-pnl", "es-switches");
        row.style.cssText = `display:flex;gap:${this.kpx(6)};flex-wrap:wrap;margin-top:${this.kpx(8)};`;
        if (cur !== "demo") { row.appendChild(this.startSwitch(this.tr("UI_EsDemo"), "demo")); }
        if (cur !== "fields") { row.appendChild(this.startSwitch(this.tr("UI_EsFields"), "fields")); }
        return row;
    }

    private showStart(dataView: DataView | undefined, missing: string[] | null): void {
        this.startArgs = { dataView, missing };
        // no statement on screen any more: an overlay of a former statement has no ground
        if (this.hubOverlay) { this.closeHub(false); }
        const mode = this.emptyMode();
        // 1.3 Start hub (the default): big buttons for the tour, the template
        // gallery, the demo and the field guide — where the demo would show
        // (edit mode, room enough); readers and exports keep the landing text
        if (mode === "hub" && this.demoAllowed() && this.hubPage !== "demo") {
            if (this.demo) { this.leaveDemo(); }
            this.model = null; this.vs = null; this.lastFingerprint = null;
            this.catModels = null;
            // echo guard + pane-chosen template, as in the demo path below
            this.syncMegaTemplate(dataView);
            this.root.style.background = this.pageBg();
            this.hubRefresh();
            return;
        }
        // 1.2 empty-state mode: the field guide or the own message replace the
        // demo in edit mode; readers and exports keep the landing text below
        if ((mode === "fields" || mode === "message") && this.startAllowed()) {
            if (this.demo) { this.leaveDemo(); }
            this.model = null; this.vs = null; this.lastFingerprint = null;
            this.catModels = null;
            this.root.style.background = this.pageBg();
            this.root.replaceChildren(mode === "fields" ? this.fieldGuide(dataView, missing) : this.startMessage());
            return;
        }
        if (!this.demoAllowed()) {
            if (this.demo) { this.leaveDemo(); }
            this.model = null; this.vs = null; this.lastFingerprint = null;
            this.renderLanding();
            return;
        }
        if (!this.demo || this.demoLocale !== this.locale) {
            this.installDemoModel(false);
            this.lastFingerprint = null;
            this.ui = null;
        }
        this.demoMissing = missing;
        this.syncMegaTemplate(dataView);
        if (!this.ui) { this.ui = this.defaultUi(); }
        // the demo follows pane edits as well (locally — it never persists)
        this.syncPaneDefaults();
        this.render();
        // the hub's demo page: the focus goes to its ← Zurück button (keyboard flow)
        if (this.hubFocusKey && this.emptyMode() === "hub") {
            const el = this.root.querySelector<HTMLElement>(`[data-pnl="${this.hubFocusKey}"]`);
            this.hubFocusKey = null;
            if (el) { el.focus(); }
        }
    }

    /**
     * The built-in demo as the model on screen (Smart Start, hub demo page and
     * the hub's mini renderings share it). `fc` adds a synthetic forecast —
     * only the template previews that analyse FC ask for it.
     */
    private installDemoModel(fc: boolean): void {
        const base = buildDemoRows(k => this.tr(k));
        const rows = fc
            ? base.map(r => (r.values.ac != null ? { ...r, values: { ...r.values, fc: Math.round(r.values.ac * 1.02) } } : r))
            : base;
        const lr = rowsFromLevels(rows, "auto");
        this.model = buildModel(lr.rows, this.tr("UI_NotAssigned"), lr.months);
        this.has = { ac: true, py: true, pl: true, fc, fcfy: true, plfy: true };
        this.catModels = null; this.catBound = false; this.catCapped = 0;
        this.loadedRows = lr.rows.length;
        this.modelVer++;
        this.scanCache = null;
        this.geoCache = null;
        this.resetSelection();
        this.selCat = null;
        this.statusWarnings = [];
        this.demo = true;
        this.demoLocale = this.locale;
    }

    /** real data arrived (or the demo is not allowed any more): back to a clean slate */
    private leaveDemo(): void {
        this.demo = false;
        this.demoMissing = null;
        this.model = null;
        this.vs = null;
        this.ui = null;
        this.stateLoaded = false;
        this.lastApplied = null;
        this.pendingPersist = null;
        this.supersededUi = [];
        this.lastFingerprint = null;
        this.scanCache = null;
        this.geoCache = null;
        this.totalNode = null;
        this.resetSelection();
    }

    /** the roles that keep the statement from rendering, in the words of the field wells */
    private missingRoles(dataView: DataView | undefined): string[] | null {
        const cols = dataView?.metadata?.columns ?? [];
        if (cols.length === 0) { return null; }
        const bound = (r: string): boolean => cols.some(c => !!(c.roles && c.roles[r]));
        const out: string[] = [];
        if (!bound("ac")) { out.push(this.tr("UI_DemoMissAc")); }
        if (!bound("levels") && !bound("account")) { out.push(this.tr("UI_DemoMissHier")); }
        else if (bound("parent") && !bound("account")) { out.push(this.tr("UI_DemoMissAccount")); }
        return out;
    }

    /** the quiet "this is a demo" line above the title — edit-mode only, never exported */
    private buildDemoBanner(): HTMLElement {
        // padding on a wrapper, not a margin on the banner: a top margin of the
        // head's first child would collapse through the head, which then
        // measures 10 px short and the frozen column header slips under it
        const wrap = document.createElement("div");
        wrap.style.cssText = "padding:10px 14px 0 14px;";
        const box = document.createElement("div");
        box.setAttribute("data-pnl", "demo-banner");
        wrap.appendChild(box);
        box.style.cssText = `padding:${this.kpx(7)} ${this.kpx(10)};` +
            `border:1px dashed ${C.ctlEdge};border-radius:6px;background:${C.wash};` +
            `font-size:${this.kpx(10.5)};line-height:1.5;color:${C.soft};`;
        const head = document.createElement("div");
        head.style.cssText = `display:flex;gap:${this.kpx(8)};align-items:baseline;flex-wrap:wrap;`;
        const badge = document.createElement("span");
        badge.setAttribute("data-pnl", "demo-badge");
        badge.textContent = this.tr("UI_DemoBadge");
        badge.style.cssText = `font-size:${this.kpx(8.5)};font-weight:700;letter-spacing:.09em;` +
            `color:${this.accent()};border:1px solid ${this.accent()};border-radius:3px;` +
            `padding:0 ${this.kpx(5)};line-height:1.6;`;
        const title = document.createElement("span");
        title.textContent = this.tr("UI_DemoTitle");
        title.style.cssText = `font-weight:600;color:${C.text};`;
        // 1.3 the hub's demo page: the way back to the start page comes first
        if (this.emptyMode() === "hub" && !this.miniSpec) { head.appendChild(this.hubBackPill()); }
        head.appendChild(badge); head.appendChild(title);
        box.appendChild(head);
        const body = document.createElement("div");
        body.setAttribute("data-pnl", "demo-body");
        body.textContent = this.tr("UI_DemoBody");
        box.appendChild(body);
        if (this.demoMissing && this.demoMissing.length > 0) {
            const miss = document.createElement("div");
            miss.setAttribute("data-pnl", "demo-missing");
            miss.style.cssText = `color:${C.loading};font-weight:600;`;
            miss.textContent = this.tr("UI_DemoMissing", this.demoMissing.join(" · "));
            box.appendChild(miss);
        }
        // 1.2 edit mode: switch to the field guide without opening the pane
        // (in the hub the demo is a page of the hub — the switches stay out)
        const sw = this.emptyMode() === "hub" ? null : this.startSwitchRow("demo");
        if (sw) { box.appendChild(sw); }
        return wrap;
    }

    /**
     * 1.2 field guide (emptyState.mode = fields): which field goes into which
     * well, minimal and extended, in the reader's language. Bound roles carry
     * a check, the scenario rows the IBCS chips of the legend. Smart-Start
     * look: dashed box on the wash, caps section heads.
     */
    private fieldGuide(dataView: DataView | undefined, missing: string[] | null, inHub = false): HTMLElement {
        const cols = dataView?.metadata?.columns ?? [];
        const bound = (...roles: string[]): boolean => cols.some(c => !!c.roles && roles.some(r => !!c.roles![r]));
        const role = (key: string, en: string): string => this.trOpt(key) ?? en;
        const wrap = document.createElement("div");
        wrap.setAttribute("data-pnl", "field-guide");
        wrap.style.cssText = `padding:${this.kpx(14)} ${this.kpx(16)};max-width:${this.k(780)}px;box-sizing:border-box;`;
        const box = document.createElement("div");
        box.style.cssText = `padding:${this.kpx(10)} ${this.kpx(14)};border:1px dashed ${C.ctlEdge};border-radius:6px;` +
            `background:${C.wash};color:${C.text};font-size:${this.kpx(11)};line-height:1.5;`;
        wrap.appendChild(box);
        const h = document.createElement("div");
        h.style.cssText = `font-size:${this.kpx(14)};font-weight:600;margin-bottom:${this.kpx(2)};`;
        h.textContent = this.tr("UI_FiTitle");
        box.appendChild(h);
        const intro = document.createElement("div");
        intro.style.cssText = `color:${C.soft};margin-bottom:${this.kpx(6)};`;
        intro.textContent = this.tr("UI_FiIntro");
        box.appendChild(intro);
        if (missing && missing.length > 0) {
            const miss = document.createElement("div");
            miss.setAttribute("data-pnl", "fi-missing");
            miss.style.cssText = `color:${C.loading};font-weight:600;margin-bottom:${this.kpx(4)};`;
            miss.textContent = this.tr("UI_DemoMissing", missing.join(" · "));
            box.appendChild(miss);
        }
        type Row = { id: string; name: string; text: string; on: boolean; chip?: "ac" | "py" | "pl" | "fc" };
        const section = (label: string, rows: Row[]): void => {
            const cap = this.capsLabel(label);
            cap.style.marginTop = this.kpx(6);
            box.appendChild(cap);
            const grid = document.createElement("div");
            grid.style.cssText = `display:grid;grid-template-columns:${this.kpx(14)} minmax(${this.kpx(96)},max-content) minmax(0,1fr);` +
                `column-gap:${this.kpx(8)};row-gap:${this.kpx(3)};align-items:baseline;margin-top:${this.kpx(2)};`;
            for (const r of rows) {
                const mark = document.createElement("span");
                mark.setAttribute("data-pnl", "fi-" + r.id);
                mark.setAttribute("data-on", r.on ? "1" : "0");
                mark.style.cssText = `color:${r.on ? this.goodColor() : C.soft};font-weight:700;`;
                mark.textContent = r.on ? "✓" : "○";
                const name = document.createElement("span");
                name.style.cssText = "font-weight:600;white-space:nowrap;";
                if (r.chip) { name.appendChild(this.legendChip(r.chip)); }
                name.appendChild(document.createTextNode(r.name));
                const text = document.createElement("span");
                text.style.cssText = `color:${C.soft};`;
                text.textContent = r.text;
                grid.appendChild(mark); grid.appendChild(name); grid.appendChild(text);
            }
            box.appendChild(grid);
        };
        section(this.tr("UI_FiMinimal"), [
            { id: "levels", name: role("Role_Levels", "Level columns (L1..Ln)"), text: this.tr("UI_FiLevels"), on: bound("levels", "account") },
            { id: "ac", name: role("Role_AC", "AC (Actual)"), text: this.tr("UI_FiAc"), on: bound("ac"), chip: "ac" },
        ]);
        section(this.tr("UI_FiExtended"), [
            { id: "py", name: role("Role_PY", "PY (Previous Year)"), text: this.tr("UI_FiPy"), on: bound("py"), chip: "py" },
            { id: "pl", name: role("Role_PL", "PL (Plan / Budget)"), text: this.tr("UI_FiPl"), on: bound("pl"), chip: "pl" },
            { id: "fc", name: role("Role_FC", "FC (Forecast)"), text: this.tr("UI_FiFc"), on: bound("fc", "fcFy"), chip: "fc" },
            { id: "period", name: role("Role_Period", "Period (month)"), text: this.tr("UI_FiPeriod"), on: bound("period") },
            { id: "rowType", name: role("Role_RowType", "Row type"), text: this.tr("UI_FiRowType"), on: bound("rowType", "formulaDef") },
            { id: "sign", name: role("Role_Sign", "Sign convention (±1)"), text: this.tr("UI_FiSign"), on: bound("signConvention", "displayInvert", "varianceInvert") },
            { id: "colCategory", name: role("Role_ColCategory", "Column category"), text: this.tr("UI_FiColCat"), on: bound("colCategory") },
        ]);
        const hint = document.createElement("div");
        hint.style.cssText = `color:${C.soft};font-style:italic;margin-top:${this.kpx(8)};`;
        hint.textContent = this.tr("UI_FiHint");
        box.appendChild(hint);
        const sw = inHub ? null : this.startSwitchRow("fields");
        if (sw) { box.appendChild(sw); }
        return wrap;
    }

    /** emptyState.mode = message in edit mode: the own message (else the landing text) plus the switches */
    private startMessage(): HTMLElement {
        let box: HTMLElement;
        if (this.customEmpty()) { box = this.emptyMessageBox(); }
        else {
            box = document.createElement("div");
            box.setAttribute("data-pnl", "empty-state");
            box.style.cssText = "padding:18px 22px;max-width:600px;";
            const p = document.createElement("div");
            p.style.cssText = `font-size:${this.kpx(12)};color:${C.soft};line-height:1.55;`;
            p.textContent = this.tr("UI_Landing");
            box.appendChild(p);
        }
        const sw = this.startSwitchRow("message");
        if (sw) { box.appendChild(sw); }
        return box;
    }

    // ---------------- 1.3 Start hub ----------------
    //
    // Without fields the edit mode shows the hub (emptyState.mode = hub, the
    // default): four big buttons — the feature tour, the template gallery, the
    // demo and the field guide. With fields bound the toolbar offers "☰ Start"
    // (edit mode only), which opens the same hub as an overlay layer above the
    // statement; closing it removes the layer and leaves the view as it was.
    // Readers and exports never see the hub. All of it is local state — only a
    // template click writes (like the toolbar dropdown).

    /** the element the hub currently renders into: the overlay layer, else the visual's root */
    private hubHost(): HTMLElement {
        return this.hubOverlay ?? this.root;
    }

    /** a mini rendering that is not the full demo of the overlay: no banner, no title */
    private miniQuiet(): boolean {
        return this.miniSpec != null && !this.miniSpec.full;
    }

    /** what the field guide of the hub page reads: the live data view, or the one of the last empty update */
    private hubArgs(): { dataView: DataView | undefined; missing: string[] | null } {
        if (this.hubOverlay) {
            return { dataView: this.lastDv, missing: this.lastDv ? this.missingRoles(this.lastDv) : null };
        }
        const a = this.startArgs;
        return { dataView: a ? a.dataView : undefined, missing: a ? a.missing : null };
    }

    /** whether a statement is on screen under the hub (the template pick then closes the overlay) */
    private hubHasStatement(): boolean {
        return this.model != null && !this.demo && this.hubOverlay != null;
    }

    /** go to a page of the hub (keyboard flow: the focus follows) */
    private hubGo(page: HubPage, focusKey?: string): void {
        const left = this.hubPage;
        this.hubPage = page;
        this.hubFocusKey = focusKey ?? (page === "hub" ? (left === "start" ? "hub-start" : "hub-tile-" + left) : "hub-back");
        if (page === "tour") { this.hubTour = Math.max(0, Math.min(this.hubTour, TOUR_CARDS.length - 1)); }
        if (this.hubOverlay) { this.hubRefresh(); return; }
        const a = this.startArgs;
        this.showStart(a ? a.dataView : undefined, a ? a.missing : null);
    }

    /** redraw the hub page into its host (overlay or root) and run its mini renderings */
    private hubRefresh(): void {
        const host = this.hubHost();
        if (this.hubOverlay) {
            this.hubOverlay.style.background = this.pageBg();
            this.hubOverlay.style.color = C.text;
        }
        this.hubMinis = [];
        const page = this.hubPage === "demo" && !this.hubOverlay ? "hub" : this.hubPage;
        // an update that changes nothing the page shows (an echo of a persist, a pane
        // edit elsewhere) must not redraw the minis — a resize still does (width)
        const a = this.hubArgs();
        const sig = [page, this.hubTour, this.locale, this.dark ? "d" : "l", this.hubAvail(), this.vpH,
            this.megaPending ? this.megaPending.applied : String(this.settings.columnsCard.template.value.value),
            this.hubSaved ?? "", (a.missing ?? []).join("|"), this.accent(), this.pageBg(),
            this.settings.styleCard.fontPreset.value.value, this.settings.styleCard.fontZoom.value,
            // 1.4 the live ticks of the field guide and the checklist, the docs button (edit mode)
            this.hubBoundRoles().join("|"), this.hubFineTicks().join(""), this.editMode() ? "e" : ""].join("~");
        const cur = host.firstElementChild;
        if (!this.hubFocusKey && cur && cur.getAttribute("data-hub") === "" && cur.getAttribute("data-hub-sig") === sig) { return; }
        const content = this.hubContent(page);
        content.setAttribute("data-hub-sig", sig);
        host.replaceChildren(content);
        this.hubFitNote(content);
        // The minis lay themselves out (fit passes, tile view) — they need the
        // attached page. The first three run at once (the tour and the top of
        // the gallery appear with the page), the rest in small batches so the
        // host never freezes; data-hub-ready flips to 1 when the last one is drawn.
        const jobs = this.hubMinis;
        this.hubMinis = [];
        const gen = ++this.hubGen;
        content.setAttribute("data-hub-ready", jobs.length === 0 ? "1" : "0");
        const batch = (): void => {
            if (gen !== this.hubGen || !content.isConnected) { return; }
            for (const j of jobs.splice(0, 3)) { j(); }
            // each mini re-armed the shared palettes for its own look
            this.applyPalette();
            if (jobs.length > 0) { setTimeout(batch, 0); } else { content.setAttribute("data-hub-ready", "1"); }
        };
        // a page with one or two minis (tour, demo) draws them at once; the gallery after the first paint
        if (jobs.length > 3) { setTimeout(batch, 0); } else if (jobs.length > 0) { batch(); }
        const key = this.hubFocusKey;
        this.hubFocusKey = null;
        if (key) {
            const el = host.querySelector<HTMLElement>(`[data-pnl="${key}"]`);
            if (el) { el.focus(); }
        }
    }

    /** the hub wrapper: header (back · title · close), the page, keyboard */
    private hubContent(page: HubPage): HTMLElement {
        const wrap = document.createElement("div");
        wrap.setAttribute("data-pnl", "hub");
        wrap.setAttribute("data-hub", "");
        wrap.setAttribute("data-hub-page", page);
        // 1.4 a column that fills the host: the page grows, the bottom bar sits at the lower edge
        wrap.style.cssText = `padding:${this.kpx(16)} ${this.kpx(18)} 0 ${this.kpx(18)};min-height:100%;` +
            "display:flex;flex-direction:column;" +
            `box-sizing:border-box;color:${C.text};font-size:${this.kpx(11)};line-height:1.5;`;
        wrap.addEventListener("keydown", (e: KeyboardEvent) => this.hubKey(e, page));
        const titles: Record<HubPage, string> = {
            hub: "P&L Statement byDatenWG", tour: this.tr("UI_HubTour"), templates: this.tr("UI_HubTpl"),
            demo: this.tr("UI_EsDemo"), fields: this.tr("UI_EsFields"), start: this.tr("UI_GoTitle"),
        };
        wrap.appendChild(this.hubHeader(titles[page], page !== "hub", page === "hub" ? this.tr("UI_HubIntro") : undefined));
        const body = document.createElement("div");
        body.setAttribute("data-pnl", "hub-body");
        body.style.cssText = `flex:1 0 auto;padding-bottom:${this.kpx(16)};`;
        if (page === "tour") { body.appendChild(this.hubTourPage()); }
        else if (page === "templates") { body.appendChild(this.hubTemplatesPage()); }
        else if (page === "fields") { body.appendChild(this.hubFieldsPage()); }
        else if (page === "start") { body.appendChild(this.hubStartPage()); }
        else if (page === "demo") { body.appendChild(this.hubDemoPage()); }
        else { body.appendChild(this.hubHome()); }
        wrap.appendChild(body);
        wrap.appendChild(this.hubFooter());
        return wrap;
    }

    /**
     * 1.4 the bottom bar of every hub page: the three font size presets first
     * (HD · Full HD · UHD — the format pane's style.fontPreset, active one
     * marked, a click persists with an echo guard), then "📖 Doku öffnen"
     * (edit mode only, through IVisualHost.launchUrl). Sticky: it stays at the
     * lower edge while the page scrolls.
     */
    private hubFooter(edge = this.k(18)): HTMLElement {
        const f = this.hubFam();
        const foot = document.createElement("div");
        foot.setAttribute("data-pnl", "hub-footer");
        foot.style.cssText = `position:sticky;bottom:0;z-index:5;margin:0 -${edge}px;background:${this.pageBg()};` +
            `font-family:${FONT};`;
        // 1.4.1 family bar (the same in ChartKitchen): 8 px · 12 px padding, a 1 px rule of 10 % ink on top,
        // one line of pill height — "Aa", HD · Full HD · UHD, the quiet hint, the docs pill on the right
        const bar = document.createElement("div");
        bar.setAttribute("data-pnl", "hub-bar");
        bar.style.cssText = `display:flex;align-items:center;flex-wrap:wrap;column-gap:${HUB_BAR.gap}px;row-gap:${HUB_BAR.pillGap}px;` +
            `box-sizing:border-box;min-height:${this.hubPillH() + 2 * HUB_BAR.padY + 1}px;` +
            `padding:${HUB_BAR.padY}px ${HUB_BAR.padX}px;border-top:1px solid ${f.rule};`;
        const aa = document.createElement("span");
        aa.setAttribute("data-pnl", "hub-aa");
        aa.setAttribute("aria-hidden", "true");
        aa.textContent = "Aa";
        aa.style.cssText = `flex:none;color:${f.soft};font-size:${this.kpx(12)};font-weight:600;line-height:1;`;
        bar.appendChild(aa);
        const seg = document.createElement("div");
        seg.setAttribute("data-pnl", "hub-font");
        seg.setAttribute("role", "group");
        seg.setAttribute("aria-label", this.tr("UI_HubFont"));
        seg.style.cssText = `flex:none;display:flex;align-items:center;gap:${HUB_BAR.pillGap}px;`;
        const cur = String(this.settings.styleCard.fontPreset.value?.value ?? "hd");
        for (const p of FONT_PRESETS) {
            const on = cur === p.value;
            const b = this.hubPill(p.label, () => this.setFontPreset(p.value),
                { key: "hub-font-" + p.value, kind: on ? "on" : "off", tip: this.tr("UI_HubFontTip", p.label) });
            b.setAttribute("aria-pressed", on ? "true" : "false");
            seg.appendChild(b);
        }
        seg.title = this.tr("UI_HubFont");
        bar.appendChild(seg);
        // the hint: one muted line; where it does not fit, only the hint goes (hubFitNote) — never the pills
        const note = document.createElement("span");
        note.setAttribute("data-pnl", "hub-hint");
        note.textContent = this.tr("UI_HubFont");
        note.style.cssText = `flex:1 1 0;min-width:0;color:${f.soft};font-size:${this.kpx(10)};line-height:1.3;` +
            "white-space:nowrap;overflow:hidden;";
        bar.appendChild(note);
        if (this.editMode()) {
            const d = this.hubPill(this.tr("UI_HubDocs"), () => this.openDocs(),
                { key: "hub-docs", kind: "outline", tip: this.tr("UI_HubDocsTip") });
            d.style.marginLeft = "auto";
            bar.appendChild(d);
        }
        foot.appendChild(bar);
        // the micro signature right under the bar, centred — identical in both visuals
        const made = document.createElement("div");
        made.setAttribute("data-pnl", "hub-made");
        made.textContent = "made by Daten-WG";
        made.style.cssText = `text-align:center;color:${f.soft};opacity:.6;font-size:${HUB_BAR.madeFs}px;` +
            `line-height:${HUB_BAR.madeLh}px;padding-bottom:${HUB_BAR.madePadB}px;white-space:nowrap;`;
        foot.appendChild(made);
        return foot;
    }

    /** pill height of the hub family (font size pills, docs, ← Zurück): 21 px on the type scale */
    private hubPillH(): number {
        return Math.round(this.k(21));
    }

    /** height of the hub footer: the bar (pill + 2 × 8 px + the 1 px rule) plus the signature line */
    private hubFooterH(): number {
        return this.hubPillH() + 2 * HUB_BAR.padY + 1 + HUB_BAR.madeLh + HUB_BAR.madePadB;
    }

    /** after the page is attached: the hint of the bottom bar disappears when it does not fit its line */
    private hubFitNote(scope: HTMLElement): void {
        const n = scope.querySelector<HTMLElement>('[data-pnl="hub-hint"]');
        if (!n) { return; }
        n.style.visibility = "";
        n.removeAttribute("data-hidden");
        if (n.scrollWidth > n.clientWidth + 1) {
            n.style.visibility = "hidden";
            n.setAttribute("data-hidden", "1");
        }
    }

    /**
     * 1.4.1 family colours of the hub chrome (ChartKitchen uses the same):
     * ink, ink-soft, paper, the teal accent of the active pill and of
     * "🚀 Loslegen" (#0E8585 · dark #3FB3C2 with dark text), the 10 % ink rule.
     * High contrast: foreground / background, the active pill framed in
     * foregroundSelected.
     */
    private hubFam(): { hc: boolean; ink: string; soft: string; paper: string; teal: string; tealEdge: string; onTeal: string; rule: string; hover: string } {
        const pal = this.host.colorPalette as powerbi.extensibility.ISandboxExtendedColorPalette | undefined;
        if (pal && pal.isHighContrast) {
            const fg = pal.foreground?.value || "#000000";
            const bg = pal.background?.value || "#FFFFFF";
            const sel = pal.foregroundSelected?.value || fg;
            return { hc: true, ink: fg, soft: fg, paper: bg, teal: bg, tealEdge: sel, onTeal: sel, rule: fg, hover: bg };
        }
        const teal = this.dark ? "#3FB3C2" : "#0E8585";
        return {
            hc: false, ink: C.text, soft: C.soft, paper: C.paper, teal, tealEdge: teal,
            onTeal: this.dark ? "#1A1A1A" : "#FFFFFF", rule: rgbaOf(C.text, 0.1), hover: C.ctlHover,
        };
    }

    /**
     * A pill of the hub family: radius = height / 2. "off" = an inactive
     * toggle (paper, 1 px ink-soft frame, ink text), "on" = the active one
     * (teal fill, white text), "outline" = an action (paper, 1 px ink frame):
     * the docs button and "← Zurück".
     */
    private hubPill(label: string, onClick: () => void,
        o: { key: string; kind: "on" | "off" | "outline"; tip?: string }): HTMLElement {
        const f = this.hubFam();
        const h = this.hubPillH();
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = label;
        b.setAttribute("data-pnl", o.key);
        b.setAttribute("data-pill", o.kind);
        if (o.tip) { b.title = o.tip; }
        this.kbRing(b);
        const bg = o.kind === "on" ? f.teal : f.paper;
        const edge = o.kind === "on" ? f.tealEdge : o.kind === "off" ? f.soft : f.ink;
        b.style.cssText = `flex:none;box-sizing:border-box;height:${h}px;line-height:${h - 2}px;padding:0 ${this.kpx(10)};` +
            `border-radius:${h / 2}px;font-family:${FONT};font-size:${this.kpx(10.5)};white-space:nowrap;cursor:pointer;` +
            `background:${bg};border:1px solid ${edge};color:${o.kind === "on" ? f.onTeal : f.ink};` +
            `font-weight:${o.kind === "on" ? 600 : 400};transition:${TRANSITION};`;
        if (o.kind !== "on") {
            b.onmouseenter = (): void => { b.style.background = f.hover; };
            b.onmouseleave = (): void => { b.style.background = bg; };
        }
        b.onclick = (e: Event): void => { e.stopPropagation(); onClick(); };
        return b;
    }

    /** "← Zurück" of every hub sub page (and the hub's demo page): the outlined family pill */
    private hubBackPill(): HTMLElement {
        return this.hubPill(this.tr("UI_HubBack"), () => this.hubGo("hub"),
            { key: "hub-back", kind: "outline", tip: this.tr("UI_HubBackTip") });
    }

    /** the bound data roles the hub reads (field guide, checklist), sorted */
    private hubBoundRoles(): string[] {
        const dv = this.hubArgs().dataView;
        // the metadata columns, and the sources of the categorical columns (hosts that send only those)
        const cols: { roles?: { [r: string]: boolean } }[] = [...(dv?.metadata?.columns ?? []),
            ...(dv?.categorical?.categories ?? []).map(c => c.source),
            ...(dv?.categorical?.values ?? []).map(v => v.source)];
        const set = new Set<string>();
        for (const c of cols) { for (const r of Object.keys(c?.roles ?? {})) { if (c.roles![r]) { set.add(r); } } }
        return [...set].sort();
    }

    /** step ③ of the checklist: house terms · thresholds / materiality · decimals (1 = set) */
    private hubFineTicks(): number[] {
        const s = this.settings;
        if (!s) { return [0, 0, 0]; }
        const lc = s.labelsCard;
        const terms = [lc.labelAc, lc.labelPy, lc.labelPl, lc.labelFc].some(x => String(x.value ?? "").trim() !== "");
        const cc = s.columnsCard;
        const thr = this.megaSliceIs("thresholds", true) || Number(cc.materialityAbs.value) > 0 || Number(cc.materialityPct.value) > 0;
        const nc = s.numbersCard;
        const dec = Number(nc.decimals.value) !== 1 || Number(nc.pctDecimals.value) !== 1;
        return [terms ? 1 : 0, thr ? 1 : 0, dec ? 1 : 0];
    }

    /**
     * 1.4.1 family title row: "← Zurück" as an outlined pill top left, the
     * title bold (on the home page the product name with its subtitle in
     * ink-soft below), "✕ Schließen" of the overlay on the right.
     */
    private hubHeader(title: string, back: boolean, sub?: string): HTMLElement {
        const row = document.createElement("div");
        row.style.cssText = `display:flex;align-items:center;gap:${this.kpx(12)};margin-bottom:${this.kpx(12)};flex-wrap:wrap;`;
        if (back) { row.appendChild(this.hubBackPill()); }
        const block = document.createElement("div");
        block.style.cssText = "flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:2px;";
        const h = document.createElement("div");
        h.setAttribute("data-pnl", "hub-title");
        h.setAttribute("role", "heading");
        h.setAttribute("aria-level", "1");
        h.style.cssText = `font-size:${this.kpx(15)};font-weight:700;line-height:1.3;`;
        h.textContent = title;
        block.appendChild(h);
        if (sub) {
            const s = document.createElement("div");
            s.setAttribute("data-pnl", "hub-sub");
            s.style.cssText = `font-size:${this.kpx(10.5)};color:${this.hubFam().soft};line-height:1.45;max-width:${this.k(620)}px;`;
            s.textContent = sub;
            block.appendChild(s);
        }
        row.appendChild(block);
        if (this.hubOverlay) {
            row.appendChild(this.hubBtn(this.tr("UI_HubClose"), () => this.closeHub(true),
                { tip: this.tr("UI_HubCloseTip"), key: "hub-close" }));
        }
        return row;
    }

    /** a button of the hub: native (Tab · Enter · Space), focus ring, no toolbar side effects */
    private hubBtn(label: string, onClick: () => void,
        o: { tip?: string; key?: string; primary?: boolean; locked?: string; aria?: string } = {}): HTMLElement {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = label;
        if (o.tip) { b.title = o.tip; }
        if (o.aria) { b.setAttribute("aria-label", o.aria); }
        if (o.key) { b.setAttribute("data-pnl", o.key); }
        this.kbRing(b);
        const acc = this.accent();
        const rest = o.primary
            ? `background:${acc};border:1px solid ${acc};color:${this.onAccent()};font-weight:600;`
            : `background:${C.paper};border:1px solid ${C.ctlEdge};color:${C.text};font-weight:400;`;
        b.style.cssText = `font-family:${FONT};font-size:${this.kpx(11)};line-height:1.35;` +
            `padding:${this.kpx(5)} ${this.kpx(12)};cursor:pointer;border-radius:5px;` +
            `transition:${TRANSITION};${rest}`;
        if (o.locked) {
            b.title = o.locked;
            b.setAttribute("aria-disabled", "true");
            b.style.opacity = "0.4";
            b.style.cursor = "default";
            b.onclick = (e: Event): void => { e.stopPropagation(); };
            return b;
        }
        b.onmouseenter = (): void => {
            if (o.primary) { b.style.background = this.accentSoft(0.14); b.style.borderColor = this.accentSoft(0.14); }
            else { b.style.background = C.ctlHover; b.style.borderColor = C.cardEdgeHover; }
        };
        b.onmouseleave = (): void => {
            if (o.primary) { b.style.background = acc; b.style.borderColor = acc; }
            else { b.style.background = C.paper; b.style.borderColor = C.ctlEdge; }
        };
        b.onclick = (e: Event): void => { e.stopPropagation(); onClick(); };
        return b;
    }

    /** Esc steps back (page → home → close the overlay); ← → leaf through the tour; 1–4 open a tile of the home page */
    private hubKey(e: KeyboardEvent, page: HubPage): void {
        const k = e.key;
        if (k === "Escape" || k === "Esc") {
            if (page !== "hub") { e.preventDefault(); e.stopPropagation(); this.hubGo("hub"); }
            else if (this.hubOverlay) { e.preventDefault(); e.stopPropagation(); this.closeHub(true); }
            return;
        }
        if (page === "tour" && (k === "ArrowLeft" || k === "ArrowRight")) {
            e.preventDefault(); e.stopPropagation();
            this.hubTourStep(k === "ArrowRight" ? 1 : -1);
            return;
        }
        if (page === "hub" && k >= "1" && k <= "4" && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault(); e.stopPropagation();
            this.hubGo((["tour", "templates", "demo", "fields"] as HubPage[])[Number(k) - 1]);
        }
    }

    /** the home page: four big buttons */
    private hubHome(): HTMLElement {
        const wrap = document.createElement("div");
        // the intro line is the subtitle of the title row (1.4.1 family header)
        const a = this.hubArgs();
        if (a.missing && a.missing.length > 0) {
            const miss = document.createElement("div");
            miss.setAttribute("data-pnl", "hub-missing");
            miss.style.cssText = `color:${C.loading};font-weight:600;margin-bottom:${this.kpx(10)};`;
            miss.textContent = this.tr("UI_DemoMissing", a.missing.join(" · "));
            wrap.appendChild(miss);
        }
        wrap.appendChild(this.hubStartHero());
        const grid = document.createElement("div");
        grid.setAttribute("data-pnl", "hub-tiles");
        // two by two; one column where two do not fit
        const two = this.hubAvail() >= this.k(560);
        grid.style.cssText = `display:grid;grid-template-columns:repeat(${two ? 2 : 1},minmax(0,1fr));` +
            `gap:${this.kpx(12)};max-width:${this.k(760)}px;`;
        const tpls = HUB_TEMPLATES.length - 1;
        const tiles: [HubPage, string, string][] = [
            ["tour", this.tr("UI_HubTour"), this.tr("UI_HubTourSub", TOUR_CARDS.length)],
            ["templates", this.tr("UI_HubTpl"), this.tr("UI_HubTplSub", tpls)],
            ["demo", this.tr("UI_EsDemo"), this.tr("UI_HubDemoSub")],
            ["fields", this.tr("UI_EsFields"), this.tr("UI_HubFieldsSub")],
        ];
        tiles.forEach(([page, title, sub], i) => grid.appendChild(this.hubTile(i + 1, page, title, sub)));
        wrap.appendChild(grid);
        const note = document.createElement("div");
        note.style.cssText = `color:${C.soft};font-style:italic;margin-top:${this.kpx(14)};font-size:${this.kpx(10)};`;
        note.textContent = this.tr("UI_HubReaderNote");
        wrap.appendChild(note);
        return wrap;
    }

    /** 1.4 "🚀 Loslegen": the wide accent button above the four tiles — the guided first three minutes */
    private hubStartHero(): HTMLElement {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("data-pnl", "hub-start");
        this.kbRing(b);
        // 1.4.1 family: teal fill (dark teal with dark text; high contrast framed in foregroundSelected),
        // the full width of the tile block, the tiles' 10 px corners
        const f = this.hubFam();
        const on = f.onTeal;
        b.style.cssText = `display:flex;align-items:center;gap:${this.kpx(14)};width:100%;max-width:${this.k(760)}px;` +
            `box-sizing:border-box;text-align:left;font-family:${FONT};color:${on};background:${f.teal};` +
            `border:1px solid ${f.tealEdge};border-radius:10px;padding:${this.kpx(12)} ${this.kpx(16)};cursor:pointer;` +
            `margin-bottom:${this.kpx(12)};box-shadow:${C.shadow};transition:${TRANSITION};`;
        const txt = document.createElement("span");
        txt.style.cssText = "display:flex;flex-direction:column;gap:3px;min-width:0;flex:1 1 auto;";
        const t = document.createElement("span");
        t.textContent = this.tr("UI_GoTitle");
        t.style.cssText = `font-size:${this.kpx(15)};font-weight:700;line-height:1.3;`;
        const d = document.createElement("span");
        d.textContent = this.tr("UI_GoSub");
        d.style.cssText = `font-size:${this.kpx(11)};line-height:1.45;opacity:.9;`;
        txt.appendChild(t); txt.appendChild(d);
        const arrow = document.createElement("span");
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "→";
        arrow.style.cssText = `font-size:${this.kpx(18)};font-weight:700;flex:none;`;
        b.appendChild(txt); b.appendChild(arrow);
        b.onmouseenter = (): void => { b.style.boxShadow = C.shadowHover; b.style.transform = HUB_LIFT; };
        b.onmouseleave = (): void => { b.style.boxShadow = C.shadow; b.style.transform = ""; };
        b.onclick = (e: Event): void => { e.stopPropagation(); this.hubGo("start"); };
        return b;
    }

    /** one big button of the home page: number badge, title, one line */
    private hubTile(n: number, page: HubPage, title: string, sub: string): HTMLElement {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("data-pnl", "hub-tile-" + page);
        this.kbRing(b);
        const acc = this.accent();
        b.style.cssText = `display:flex;align-items:flex-start;gap:${this.kpx(12)};text-align:left;font-family:${FONT};` +
            `color:${C.text};background:${C.paper};border:1px solid ${C.cardEdge};border-radius:10px;` +
            `padding:${this.kpx(14)} ${this.kpx(16)};min-height:${this.kpx(84)};cursor:pointer;` +
            `box-shadow:${C.shadow};transition:${TRANSITION};`;
        const badge = document.createElement("span");
        badge.setAttribute("aria-hidden", "true");
        badge.textContent = String(n);
        badge.style.cssText = `flex:none;width:${this.kpx(24)};height:${this.kpx(24)};border-radius:50%;` +
            `background:${acc};color:${this.onAccent()};font-size:${this.kpx(12)};font-weight:700;` +
            "display:flex;align-items:center;justify-content:center;";
        const txt = document.createElement("span");
        txt.style.cssText = "display:flex;flex-direction:column;gap:4px;min-width:0;";
        const t = document.createElement("span");
        t.textContent = title;
        t.style.cssText = `font-size:${this.kpx(14)};font-weight:600;line-height:1.3;`;
        const d = document.createElement("span");
        d.textContent = sub;
        d.style.cssText = `font-size:${this.kpx(11)};color:${C.soft};line-height:1.45;`;
        txt.appendChild(t); txt.appendChild(d);
        b.appendChild(badge); b.appendChild(txt);
        // 1.4.1 the family hover lift (the gallery tiles' -2 px, accent frame, raised shadow)
        b.onmouseenter = (): void => { b.style.borderColor = acc; b.style.boxShadow = C.shadowHover; b.style.transform = HUB_LIFT; };
        b.onmouseleave = (): void => { b.style.borderColor = C.cardEdge; b.style.boxShadow = C.shadow; b.style.transform = ""; };
        b.onclick = (e: Event): void => { e.stopPropagation(); this.hubGo(page); };
        return b;
    }

    /** available width for the page content inside the hub padding */
    private hubAvail(): number {
        const host = this.hubHost();
        const w = host.clientWidth || this.vpW || 600;
        // a vertical scrollbar may still appear: keep a margin instead of a horizontal scroll
        return Math.max(220, Math.floor(w - 2 * this.k(18) - 18));
    }

    /**
     * A mini rendering: a nested, non-interactive copy of this visual over the
     * demo, laid out at its natural size and scaled down with a transform.
     * The nested instance renders once the page is attached (hubRefresh).
     */
    private hubMini(spec: MiniSpec, outerW: number): HTMLElement {
        const s = outerW / spec.w;
        const outer = document.createElement("div");
        outer.setAttribute("data-pnl", "hub-mini");
        outer.setAttribute("aria-hidden", "true");
        outer.style.cssText = `position:relative;flex:none;width:${outerW}px;height:${Math.round(spec.h * s)}px;overflow:hidden;` +
            `border:1px solid ${C.ctlEdge};border-radius:4px;background:${this.pageBg()};pointer-events:none;`;
        const inner = document.createElement("div");
        inner.style.cssText = `position:absolute;left:0;top:0;width:${spec.w}px;height:${spec.h}px;` +
            `transform:scale(${s});transform-origin:0 0;`;
        outer.appendChild(inner);
        this.hubMinis.push(() => this.hubRunMini(inner, spec));
        return outer;
    }

    private hubRunMini(el: HTMLElement, spec: MiniSpec): void {
        try {
            const noop = (): void => undefined;
            const host = {
                locale: this.locale,
                colorPalette: this.host.colorPalette,
                eventService: { renderingStarted: noop, renderingFinished: noop, renderingFailed: noop },
                createLocalizationManager: () => this.locMgr,
                persistProperties: noop,
            } as unknown as IVisualHost;
            const v = new Visual({ element: el, host });
            v.renderMini(spec, spec.dark === true || this.dark);
        } catch {
            // a thumbnail that fails must never take the hub down
            el.replaceChildren();
        }
    }

    /**
     * Render this instance as a mini: the built-in demo, no toolbar / title /
     * legend, view and template from the spec, non-interactive (the hub puts
     * pointer-events:none on it). Called on a fresh instance by hubRunMini.
     */
    public renderMini(spec: MiniSpec, dark: boolean): void {
        this.miniSpec = spec;
        this.viewMode = 0;
        this.vpW = spec.w; this.vpH = spec.h;
        this.settings = this.formattingSettingsService.populateFormattingSettingsModel(
            VisualFormattingSettingsModel,
            { metadata: { columns: [], objects: miniObjects(spec, dark) } } as unknown as DataView);
        this.dark = this.resolveDarkMode();
        // a thumbnail never scrolls; the overlay's full demo does
        if (!spec.full) { this.root.style.overflow = "hidden"; }
        this.applyPalette();
        this.installDemoModel(spec.fc === true);
        this.ui = this.defaultUi();
        this.ui.view = spec.view;
        if (spec.zoom) { this.ui.treeZoom = spec.zoom; }
        this.render();
    }

    // ---- tour ----

    private hubTourStep(d: number): void {
        const n = Math.max(0, Math.min(TOUR_CARDS.length - 1, this.hubTour + d));
        if (n === this.hubTour) { return; }
        this.hubTour = n;
        this.hubFocusKey = d > 0 ? (n === TOUR_CARDS.length - 1 ? "tour-prev" : "tour-next") : (n === 0 ? "tour-next" : "tour-prev");
        this.hubRefresh();
    }

    private hubTourPage(): HTMLElement {
        const keys: [string, string][] = [
            ["UI_Tour1T", "UI_Tour1X"], ["UI_Tour2T", "UI_Tour2X"], ["UI_Tour3T", "UI_Tour3X"], ["UI_Tour4T", "UI_Tour4X"],
            ["UI_Tour5T", "UI_Tour5X"], ["UI_Tour6T", "UI_Tour6X"], ["UI_Tour7T", "UI_Tour7X"],
        ];
        const total = TOUR_CARDS.length;
        const i = Math.max(0, Math.min(this.hubTour, total - 1));
        const card = TOUR_CARDS[i];
        const avail = this.hubAvail();
        const wide = avail >= this.k(700);
        const miniW = Math.max(200, Math.min(this.k(520), wide ? Math.floor(avail * 0.56) : avail - 2));
        const wrap = document.createElement("div");
        wrap.setAttribute("data-pnl", "hub-tour");
        wrap.setAttribute("data-tour-card", String(i + 1));
        const row = document.createElement("div");
        row.style.cssText = `display:flex;gap:${this.kpx(18)};align-items:flex-start;flex-wrap:${wide ? "nowrap" : "wrap"};`;
        row.appendChild(this.hubMini(card.mini, miniW));
        const txt = document.createElement("div");
        txt.style.cssText = `flex:1 1 ${this.k(220)}px;min-width:0;`;
        const eyebrow = document.createElement("div");
        eyebrow.setAttribute("data-pnl", "tour-count");
        eyebrow.appendChild(this.capsLabel(`${i + 1} / ${total}`));
        const h = document.createElement("div");
        h.setAttribute("data-pnl", "tour-title");
        h.style.cssText = `font-size:${this.kpx(16)};font-weight:600;margin:${this.kpx(4)} 0 ${this.kpx(6)} 0;line-height:1.3;`;
        h.textContent = this.tr(keys[i][0]);
        const p = document.createElement("div");
        p.setAttribute("data-pnl", "tour-text");
        p.style.cssText = `font-size:${this.kpx(12)};color:${C.soft};line-height:1.6;max-width:${this.k(460)}px;`;
        p.textContent = this.tr(keys[i][1]);
        txt.appendChild(eyebrow); txt.appendChild(h); txt.appendChild(p);
        row.appendChild(txt);
        wrap.appendChild(row);

        const nav = document.createElement("div");
        nav.style.cssText = `display:flex;align-items:center;gap:${this.kpx(8)};margin-top:${this.kpx(14)};flex-wrap:wrap;`;
        nav.appendChild(this.hubBtn("‹", () => this.hubTourStep(-1), {
            key: "tour-prev", aria: this.tr("UI_TourPrev"), tip: this.tr("UI_TourPrev"),
            locked: i === 0 ? this.tr("UI_TourPrev") : undefined,
        }));
        const dots = document.createElement("div");
        dots.style.cssText = `display:flex;gap:${this.kpx(6)};align-items:center;`;
        for (let d = 0; d < total; d++) {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.setAttribute("data-pnl", "tour-dot-" + (d + 1));
            dot.setAttribute("aria-label", this.tr("UI_TourDot", d + 1));
            dot.setAttribute("aria-current", d === i ? "true" : "false");
            dot.title = this.tr(keys[d][0]);
            this.kbRing(dot);
            dot.style.cssText = `width:${this.kpx(10)};height:${this.kpx(10)};padding:0;border-radius:50%;cursor:pointer;` +
                `border:1px solid ${d === i ? this.accent() : C.cardEdgeHover};background:${d === i ? this.accent() : "transparent"};`;
            dot.onclick = (e: Event): void => {
                e.stopPropagation();
                this.hubTour = d; this.hubFocusKey = "tour-dot-" + (d + 1); this.hubRefresh();
            };
            dots.appendChild(dot);
        }
        nav.appendChild(dots);
        nav.appendChild(this.hubBtn("›", () => this.hubTourStep(1), {
            key: "tour-next", aria: this.tr("UI_TourNext"), tip: this.tr("UI_TourNext"),
            locked: i === total - 1 ? this.tr("UI_TourNext") : undefined,
        }));
        wrap.appendChild(nav);
        return wrap;
    }

    // ---- template gallery ----

    private hubTemplatesPage(): HTMLElement {
        const wrap = document.createElement("div");
        wrap.setAttribute("data-pnl", "hub-templates");
        const intro = document.createElement("div");
        intro.style.cssText = `color:${C.soft};max-width:${this.k(640)}px;margin-bottom:${this.kpx(8)};`;
        intro.textContent = this.tr("UI_TplIntro");
        wrap.appendChild(intro);
        // without bound fields the pick is stored and takes effect when fields arrive
        if (!this.hubHasStatement()) {
            const note = document.createElement("div");
            note.setAttribute("data-pnl", "hub-tpl-note");
            note.style.cssText = `margin-bottom:${this.kpx(10)};padding:${this.kpx(6)} ${this.kpx(10)};` +
                `border:1px dashed ${C.ctlEdge};border-radius:6px;background:${C.wash};color:${C.text};font-weight:600;`;
            note.textContent = this.hubSaved != null
                ? this.tr("UI_TplSaved", this.tplCode(this.hubSaved))
                : this.tr("UI_TplNoFields");
            wrap.appendChild(note);
        }
        const active = this.megaPending ? this.megaPending.applied : String(this.settings.columnsCard.template.value.value);
        // 1.4 four purpose groups instead of the T-number list; bigger previews
        const avail = this.hubAvail();
        const gap = this.k(14);
        const minTile = this.k(240);
        const cols = Math.max(1, Math.floor((avail + gap) / (minTile + gap)));
        const tileW = Math.floor((avail - gap * (cols - 1)) / cols);
        const pad = this.k(9);
        for (const g of HUB_GALLERY) {
            const sec = document.createElement("section");
            sec.setAttribute("data-pnl", "tpl-group-" + g.id);
            sec.style.cssText = `margin-top:${this.kpx(14)};`;
            const head = document.createElement("div");
            head.style.cssText = `display:flex;align-items:baseline;gap:${this.kpx(10)};flex-wrap:wrap;margin-bottom:${this.kpx(8)};` +
                `padding-bottom:${this.kpx(4)};border-bottom:1px solid ${C.cardEdge};`;
            const h = document.createElement("div");
            h.setAttribute("role", "heading");
            h.setAttribute("aria-level", "2");
            h.setAttribute("data-pnl", "tpl-group-title");
            // 1.4.1 family eyebrow: capitals in ink-soft, 11 px on the type scale
            h.style.cssText = `font-size:${this.kpx(11)};font-weight:700;letter-spacing:.09em;text-transform:uppercase;` +
                `color:${this.hubFam().soft};line-height:1.4;`;
            h.textContent = this.tr(g.title);
            const sub = document.createElement("div");
            sub.style.cssText = `color:${C.soft};font-size:${this.kpx(10.5)};`;
            sub.textContent = this.tr(g.sub);
            head.appendChild(h); head.appendChild(sub);
            sec.appendChild(head);
            const grid = document.createElement("div");
            grid.setAttribute("data-pnl", "hub-tpl-grid");
            grid.style.cssText = `display:grid;grid-template-columns:repeat(${cols},${tileW}px);gap:${gap}px;`;
            for (const t of g.tiles) {
                grid.appendChild(this.hubTemplateTile(t, tileW, pad, t.tpl === active));
            }
            sec.appendChild(grid);
            wrap.appendChild(sec);
        }
        return wrap;
    }

    /** "T04B" from the pane label "T04B · statement …"; the classic table has no code */
    private tplCode(tpl: string): string {
        if (tpl === "off") { return this.tr("UI_TplOff"); }
        const full = this.trOpt("Enum_Template_" + tpl) ?? tpl;
        const i = full.indexOf(" · ");
        return i > 0 ? full.slice(0, i) : full;
    }

    /**
     * 1.4 a gallery tile: big preview, the finance title, the T number as a
     * small badge, one line of use; hover lifts it, the active tile carries an
     * accent frame, a tinted ground and a "✓ aktiv" pill.
     */
    private hubTemplateTile(t: GalleryTile, tileW: number, pad: number, active: boolean): HTMLElement {
        const tpl = t.tpl;
        const full = tpl === "off" ? "" : (this.trOpt("Enum_Template_" + tpl) ?? tpl);
        const cut = full.indexOf(" · ");
        const code = tpl === "off" ? "—" : this.tplCode(tpl);
        const desc = cut > 0 ? full.slice(cut + 3) : this.tr("UI_TplOff");
        const title = this.tr(t.title);
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("data-pnl", "tpl-" + tpl);
        b.setAttribute("data-active", active ? "1" : "0");
        b.setAttribute("aria-pressed", active ? "true" : "false");
        b.setAttribute("aria-label", this.tr("UI_TplPick", title + (tpl === "off" ? "" : " (" + code + ")")));
        b.title = (tpl === "off" ? "" : code + " · ") + desc;
        this.kbRing(b);
        const acc = this.accent();
        const edge = active ? acc : C.cardEdge;
        const ground = active ? this.accentSoft(0.93) : C.paper;
        b.style.cssText = `position:relative;display:flex;flex-direction:column;gap:${this.kpx(7)};text-align:left;font-family:${FONT};` +
            `color:${C.text};background:${ground};border:${active ? 2 : 1}px solid ${edge};border-radius:10px;` +
            `padding:${active ? pad - 1 : pad}px;width:${tileW}px;box-sizing:border-box;cursor:pointer;` +
            `box-shadow:${active ? C.shadowHover : C.shadow};transition:${TRANSITION};`;
        const spec: MiniSpec = { view: "table", tpl, level: 2, w: 1100, h: 620, fc: templateNeedsFc(tpl) };
        b.appendChild(this.hubMini(spec, tileW - 2 * pad - 2));
        // the T number: a small badge on the preview's top right corner
        const badge = document.createElement("span");
        badge.setAttribute("data-pnl", "tplcode");
        badge.textContent = tpl === "off" ? this.tr("UI_TplOffBadge") : code;
        badge.style.cssText = `position:absolute;top:${pad + 6}px;right:${pad + 6}px;font-size:${this.kpx(9.5)};font-weight:700;` +
            `letter-spacing:.04em;line-height:1.5;padding:0 ${this.kpx(6)};border-radius:9px;` +
            `background:${C.paper};color:${C.text};border:1px solid ${C.cardEdgeHover};box-shadow:${C.shadow};`;
        b.appendChild(badge);
        const cap = document.createElement("div");
        cap.style.cssText = "display:flex;flex-direction:column;gap:3px;min-width:0;";
        const head = document.createElement("div");
        head.style.cssText = "display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;";
        const c = document.createElement("span");
        c.setAttribute("data-pnl", "tpl-title");
        c.textContent = title;
        c.style.cssText = `font-size:${this.kpx(12.5)};font-weight:700;line-height:1.3;`;
        head.appendChild(c);
        if (active) {
            const a = document.createElement("span");
            a.setAttribute("data-pnl", "tpl-active");
            a.textContent = "✓ " + this.tr("UI_TplActive");
            a.style.cssText = `font-size:${this.kpx(9.5)};font-weight:700;color:${this.onAccent()};background:${acc};` +
                `letter-spacing:.04em;border-radius:9px;padding:0 ${this.kpx(6)};line-height:1.6;`;
            head.appendChild(a);
        }
        cap.appendChild(head);
        const u = document.createElement("span");
        u.setAttribute("data-pnl", "tpl-use");
        u.textContent = this.tr(t.use);
        u.style.cssText = `font-size:${this.kpx(10.5)};color:${C.soft};line-height:1.4;`;
        cap.appendChild(u);
        if (tpl !== "off" && templateNeedsFc(tpl)) {
            const f = document.createElement("span");
            f.textContent = this.tr("UI_TplFcNote");
            f.style.cssText = `font-size:${this.kpx(9)};color:${C.soft};font-style:italic;`;
            cap.appendChild(f);
        }
        b.appendChild(cap);
        b.onmouseenter = (): void => {
            b.style.borderColor = acc; b.style.boxShadow = C.shadowHover; b.style.transform = HUB_LIFT;
        };
        b.onmouseleave = (): void => {
            b.style.borderColor = edge; b.style.boxShadow = active ? C.shadowHover : C.shadow; b.style.transform = "";
        };
        b.onclick = (e: Event): void => { e.stopPropagation(); this.hubPickTemplate(tpl); };
        return b;
    }

    // ---- 1.4 field guide (all roles + two premises) ----

    /**
     * 1.4 the hub's field guide: every data role of the visual with one
     * sentence of purpose and a live ✓, grouped (required · scenarios & time ·
     * statement logic · extras), above it two premises — the IBCS notation
     * and "structure vs. time". (The 1.2 field guide of emptyState.mode =
     * fields stays as it was.)
     */
    private hubFieldsPage(): HTMLElement {
        const a = this.hubArgs();
        const bound = new Set(this.hubBoundRoles());
        const wrap = document.createElement("div");
        wrap.setAttribute("data-pnl", "field-guide");
        wrap.setAttribute("data-fg", "1.4");
        const intro = document.createElement("div");
        intro.style.cssText = `color:${C.soft};max-width:${this.k(680)}px;margin-bottom:${this.kpx(8)};`;
        intro.textContent = this.tr("UI_FiIntro");
        wrap.appendChild(intro);
        if (a.missing && a.missing.length > 0) {
            const miss = document.createElement("div");
            miss.setAttribute("data-pnl", "fi-missing");
            miss.style.cssText = `color:${C.loading};font-weight:600;margin-bottom:${this.kpx(8)};`;
            miss.textContent = this.tr("UI_DemoMissing", a.missing.join(" · "));
            wrap.appendChild(miss);
        }
        // the two premises, side by side where they fit
        const prem = document.createElement("div");
        const two = this.hubAvail() >= this.k(640);
        prem.style.cssText = `display:grid;grid-template-columns:repeat(${two ? 2 : 1},minmax(0,1fr));gap:${this.kpx(12)};` +
            `margin-bottom:${this.kpx(6)};max-width:${this.k(900)}px;`;
        prem.appendChild(this.premiseNotation());
        prem.appendChild(this.premiseStructureTime());
        wrap.appendChild(prem);
        // one grid for all four groups: the name and text columns line up across the groups
        const grid = document.createElement("div");
        grid.setAttribute("data-pnl", "fg-grid");
        grid.style.cssText = `display:grid;grid-template-columns:${this.kpx(14)} minmax(${this.kpx(120)},max-content) minmax(0,1fr);` +
            `column-gap:${this.kpx(10)};row-gap:${this.kpx(4)};align-items:baseline;max-width:${this.k(900)}px;`;
        wrap.appendChild(grid);
        for (const g of FIELD_GROUPS) {
            const cap = this.capsLabel(this.tr(g.title));
            cap.setAttribute("data-pnl", "fg-" + g.id);
            cap.style.gridColumn = "1 / -1";
            cap.style.marginTop = this.kpx(8);
            grid.appendChild(cap);
            for (const r of g.roles) {
                const on = bound.has(r.role);
                const mark = document.createElement("span");
                mark.setAttribute("data-pnl", "fr-" + r.role);
                mark.setAttribute("data-on", on ? "1" : "0");
                mark.style.cssText = `color:${on ? this.goodColor() : C.soft};font-weight:700;`;
                mark.textContent = on ? "✓" : "○";
                const name = document.createElement("span");
                name.style.cssText = "font-weight:600;white-space:nowrap;";
                if (r.chip) { name.appendChild(this.legendChip(r.chip)); }
                name.appendChild(document.createTextNode(this.trOpt(r.name) ?? r.role));
                const text = document.createElement("span");
                text.style.cssText = `color:${C.soft};`;
                text.textContent = this.tr(r.text);
                grid.appendChild(mark); grid.appendChild(name); grid.appendChild(text);
            }
        }
        const hint = document.createElement("div");
        hint.style.cssText = `color:${C.soft};font-style:italic;margin-top:${this.kpx(12)};max-width:${this.k(760)}px;`;
        hint.textContent = this.tr("UI_FiHint");
        wrap.appendChild(hint);
        return wrap;
    }

    /** a premise box of the field guide: dashed frame on the wash, caps head */
    private premiseBox(key: string, title: string): HTMLElement {
        const box = document.createElement("div");
        box.setAttribute("data-pnl", key);
        box.style.cssText = `padding:${this.kpx(9)} ${this.kpx(12)};border:1px dashed ${C.ctlEdge};border-radius:6px;` +
            `background:${C.wash};color:${C.text};min-width:0;`;
        const cap = this.capsLabel(title);
        cap.style.marginBottom = this.kpx(4);
        box.appendChild(cap);
        return box;
    }

    /** premise (a): the IBCS notation in four lines — the chips of the legend */
    private premiseNotation(): HTMLElement {
        const box = this.premiseBox("fi-notation", this.tr("UI_FpNotation"));
        const rows: ["ac" | "py" | "pl" | "fc", string][] = [
            ["ac", "UI_FpAc"], ["py", "UI_FpPy"], ["pl", "UI_FpPl"], ["fc", "UI_FpFc"],
        ];
        for (const [chip, key] of rows) {
            const line = document.createElement("div");
            line.setAttribute("data-pnl", "fi-note-" + chip);
            line.appendChild(this.legendChip(chip));
            line.appendChild(document.createTextNode(this.tr(key)));
            box.appendChild(line);
        }
        const rule = document.createElement("div");
        rule.setAttribute("data-pnl", "fi-note-rule");
        rule.style.cssText = `margin-top:${this.kpx(4)};font-weight:600;`;
        rule.textContent = this.tr("UI_FpRule");
        box.appendChild(rule);
        return box;
    }

    /** premise (b): structure vertical in rows, time horizontal in blocks — with a mini pictogram */
    private premiseStructureTime(): HTMLElement {
        const box = this.premiseBox("fi-axes", this.tr("UI_FpAxes"));
        const row = document.createElement("div");
        row.style.cssText = `display:flex;gap:${this.kpx(12)};align-items:center;flex-wrap:wrap;`;
        row.appendChild(this.axesPictogram());
        const t = document.createElement("div");
        t.style.cssText = `flex:1 1 ${this.k(150)}px;min-width:0;`;
        t.textContent = this.tr("UI_FpAxesX");
        row.appendChild(t);
        box.appendChild(row);
        return box;
    }

    /** the mini pictogram of premise (b): rows downwards, the period blocks Monat | _YTD | FY across */
    private axesPictogram(): SVGSVGElement {
        const NS = "http://www.w3.org/2000/svg";
        const s = this.fontScale();
        const W = 196; const H = 92;
        const svg = document.createElementNS(NS, "svg");
        svg.setAttribute("data-pnl", "fi-axes-pic");
        svg.setAttribute("width", String(Math.round(W * s)));
        svg.setAttribute("height", String(Math.round(H * s)));
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        svg.setAttribute("aria-hidden", "true");
        svg.style.cssText = "flex:none;display:block;";
        const el = (tag: string, at: Record<string, string | number>, text?: string): SVGElement => {
            const e = document.createElementNS(NS, tag);
            for (const [k, v] of Object.entries(at)) { e.setAttribute(k, String(v)); }
            if (text != null) { e.textContent = text; }
            svg.appendChild(e);
            return e;
        };
        const font = { "font-family": FONT, "font-size": 8.5 };
        // time across: three blocks with their heads
        const blocks = [this.tr("UI_FpMonth"), "_YTD", "FY"];
        const x0 = 58; const bw = 44; const bg = 3;
        blocks.forEach((b, i) => {
            const x = x0 + i * (bw + bg);
            el("rect", { x, y: 14, width: bw, height: 74, fill: C.paper, stroke: C.cardEdgeHover, "stroke-width": 0.8, rx: 2 });
            el("text", { x: x + bw / 2, y: 24, "text-anchor": "middle", fill: C.text, "font-weight": 700, ...font }, b);
        });
        el("text", { x: x0, y: 8, fill: C.soft, ...font, "font-size": 7.5 }, this.tr("UI_FpTime") + " →");
        // structure down: five rows, the bars of each block
        const vals = [0.9, 0.55, 0.7, 0.35, 0.8];
        vals.forEach((v, r) => {
            const y = 32 + r * 11;
            el("rect", { x: 4, y: y + 1, width: r === 2 ? 40 : 32 - (r % 2) * 6, height: 5, fill: r === 2 ? C.text : C.soft, rx: 1 });
            blocks.forEach((_, i) => {
                const x = x0 + i * (bw + bg) + 6;
                el("rect", { x, y: y + 1, width: Math.round((bw - 12) * v * (1 - i * 0.12)), height: 6, fill: C.ac });
            });
        });
        el("text", { x: 4, y: 24, fill: C.soft, ...font, "font-size": 7.5 }, this.tr("UI_FpRows") + " ↓");
        return svg;
    }

    // ---- 1.4 "🚀 Loslegen": the first three minutes ----

    /**
     * A guided checklist, live and never persisted: ① bind the fields (ticks
     * per required / recommended role, the quick way with level columns first),
     * ② pick a template (jump into the gallery), ③ fine tuning (house terms,
     * thresholds, decimals — where in the format pane).
     */
    private hubStartPage(): HTMLElement {
        const wrap = document.createElement("div");
        wrap.setAttribute("data-pnl", "hub-go");
        const intro = document.createElement("div");
        intro.style.cssText = `color:${C.soft};max-width:${this.k(680)}px;margin-bottom:${this.kpx(10)};`;
        intro.textContent = this.tr("UI_GoIntro");
        wrap.appendChild(intro);
        const bound = new Set(this.hubBoundRoles());
        const ticks = startFieldTicks(r => bound.has(r));
        const fieldsDone = START_FIELD_STEPS.filter(s => s.required).every(s => ticks[s.id]);
        const active = this.megaPending ? this.megaPending.applied : String(this.settings.columnsCard.template.value.value);
        const tplDone = active !== "off" || this.hubSaved != null;
        const fine = this.hubFineTicks();

        const list = document.createElement("div");
        list.style.cssText = `display:flex;flex-direction:column;gap:${this.kpx(10)};max-width:${this.k(760)}px;`;
        const step = (n: number, title: string, done: boolean, body: HTMLElement[]): void => {
            const card = document.createElement("div");
            card.setAttribute("data-pnl", "go-step-" + n);
            card.setAttribute("data-done", done ? "1" : "0");
            card.style.cssText = `display:flex;gap:${this.kpx(12)};align-items:flex-start;padding:${this.kpx(12)} ${this.kpx(14)};` +
                `background:${C.paper};border:1px solid ${done ? this.goodColor() : C.cardEdge};border-radius:8px;box-shadow:${C.shadow};`;
            const badge = document.createElement("span");
            badge.setAttribute("aria-hidden", "true");
            badge.textContent = done ? "✓" : String(n);
            badge.style.cssText = `flex:none;width:${this.kpx(24)};height:${this.kpx(24)};border-radius:50%;` +
                `background:${done ? this.goodColor() : this.accent()};color:${done ? "#FFF" : this.onAccent()};` +
                `font-size:${this.kpx(12)};font-weight:700;display:flex;align-items:center;justify-content:center;`;
            const col = document.createElement("div");
            col.style.cssText = `display:flex;flex-direction:column;gap:${this.kpx(5)};min-width:0;flex:1 1 auto;`;
            const h = document.createElement("div");
            h.style.cssText = `font-size:${this.kpx(13.5)};font-weight:700;line-height:1.3;`;
            h.textContent = title;
            col.appendChild(h);
            for (const x of body) { col.appendChild(x); }
            card.appendChild(badge); card.appendChild(col);
            list.appendChild(card);
        };
        const line = (key: string, on: boolean, text: string, tag?: string): HTMLElement => {
            const d = document.createElement("div");
            d.setAttribute("data-pnl", key);
            d.setAttribute("data-on", on ? "1" : "0");
            d.style.cssText = `display:flex;gap:${this.kpx(8)};align-items:baseline;`;
            const m = document.createElement("span");
            m.style.cssText = `flex:none;width:${this.kpx(12)};color:${on ? this.goodColor() : C.soft};font-weight:700;`;
            m.textContent = on ? "✓" : "○";
            const t = document.createElement("span");
            t.style.cssText = "min-width:0;";
            t.textContent = text;
            d.appendChild(m); d.appendChild(t);
            if (tag) {
                const g = document.createElement("span");
                g.textContent = tag;
                g.style.cssText = `flex:none;font-size:${this.kpx(8.5)};letter-spacing:.06em;text-transform:uppercase;font-weight:700;` +
                    `color:${C.soft};border:1px solid ${C.ctlEdge};border-radius:3px;padding:0 ${this.kpx(4)};`;
                d.appendChild(g);
            }
            return d;
        };
        const soft = (key: string): HTMLElement => {
            const d = document.createElement("div");
            d.style.cssText = `color:${C.soft};font-size:${this.kpx(10.5)};`;
            d.textContent = this.tr(key);
            return d;
        };
        const btnRow = (...b: HTMLElement[]): HTMLElement => {
            const r = document.createElement("div");
            r.style.cssText = `display:flex;gap:${this.kpx(8)};flex-wrap:wrap;margin-top:${this.kpx(2)};`;
            for (const x of b) { r.appendChild(x); }
            return r;
        };

        // ① fields: the quick way first (level columns), then AC, then the recommended roles
        step(1, this.tr("UI_GoStep1"), fieldsDone, [
            soft("UI_GoStep1X"),
            ...START_FIELD_STEPS.map(s => line("go-f-" + s.id, ticks[s.id], this.tr(s.text),
                this.tr(s.required ? "UI_GoRequired" : "UI_GoRecommended"))),
            btnRow(this.hubBtn(this.tr("UI_GoAllFields"), () => this.hubGo("fields", "hub-back"), { key: "go-fields" })),
        ]);
        // ② template: where it stands, and the jump into the gallery
        const tplNow = this.hubSaved != null ? this.hubSaved : active;
        const tplTile = HUB_GALLERY.flatMap(g => g.tiles).find(t => t.tpl === tplNow);
        const tplName = tplTile ? this.tr(tplTile.title) + (tplNow === "off" ? "" : " (" + this.tplCode(tplNow) + ")") : tplNow;
        step(2, this.tr("UI_GoStep2"), tplDone, [
            soft("UI_GoStep2X"),
            line("go-tpl-state", tplDone, this.tr(tplDone ? "UI_GoTplSet" : "UI_GoTplNone", tplName)),
            btnRow(this.hubBtn(this.tr("UI_GoToGallery"), () => this.hubGo("templates", "hub-back"),
                { key: "go-templates", primary: !tplDone })),
        ]);
        // ③ fine tuning: house terms · thresholds · decimals, with their place in the format pane
        step(3, this.tr("UI_GoStep3"), fine.every(x => x === 1), [
            soft("UI_GoStep3X"),
            line("go-fine-terms", fine[0] === 1, this.tr("UI_GoFineTerms")),
            line("go-fine-thresholds", fine[1] === 1, this.tr("UI_GoFineThresholds")),
            line("go-fine-decimals", fine[2] === 1, this.tr("UI_GoFineDecimals")),
        ]);
        wrap.appendChild(list);
        return wrap;
    }

    /**
     * Gallery click: the same write as the toolbar dropdown (template, every
     * switch and templateApplied in ONE persist) — and always, also for the
     * template that is already set, so a click restores its state. With a
     * statement under the overlay the view becomes the table and the overlay
     * closes on the result; without fields the pick is stored and shown as saved.
     */
    private hubPickTemplate(tpl: string): void {
        if (!MEGA_PRESETS[tpl]) { return; }
        this.megaSliceSet("template", tpl);
        this.applyMegaTemplate(tpl, true);
        if (this.hubHasStatement()) {
            // templates shape the table view — a click in another view brings the table along
            if (this.ui && this.ui.view !== "table") { this.ui.view = "table"; this.persistUi(); }
            this.closeHub(true);
            this.rerender();
            return;
        }
        this.hubSaved = tpl;
        this.hubFocusKey = "tpl-" + tpl;
        this.hubRefresh();
    }

    // ---- demo page (overlay only; without a statement the demo is the visual's own Smart Start) ----

    private hubDemoPage(): HTMLElement {
        const host = this.hubHost();
        const w = Math.max(300, (host.clientWidth || this.vpW) - 2 * this.k(18));
        // header above, the bottom bar below (1.4)
        const h = Math.max(220, (host.clientHeight || this.vpH) - this.k(76) - this.hubFooterH() - 6);
        const box = document.createElement("div");
        box.setAttribute("data-pnl", "hub-demo");
        box.style.cssText = `position:relative;width:${w}px;height:${h}px;border:1px solid ${C.ctlEdge};border-radius:4px;overflow:hidden;`;
        this.hubMinis.push(() => this.hubRunMini(box, { view: "table", level: 2, w, h, full: true }));
        return box;
    }

    // ---- overlay ----

    private hubOpenButton(): HTMLElement {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("data-pnl", "hub-open");
        b.setAttribute("aria-haspopup", "dialog");
        b.textContent = this.tr("UI_HubOpen");
        b.title = this.tr("UI_HubOpenTip");
        this.kbRing(b);
        // 1.4 prominent: the first control of the toolbar, accent frame and text,
        // filled on hover — the way into tour, templates, fields and docs
        const acc = this.accent();
        b.style.cssText = `font-family:${FONT};font-size:${this.kpx(10.5)};line-height:1.35;font-weight:600;` +
            `padding:${this.kpx(3.5)} ${this.kpx(10)};cursor:pointer;border-radius:4px;color:${acc};` +
            `background:${C.paper};border:1px solid ${acc};transition:${TRANSITION};`;
        b.onmouseenter = (): void => { b.style.background = acc; b.style.color = this.onAccent(); };
        b.onmouseleave = (): void => { b.style.background = C.paper; b.style.color = acc; };
        b.onclick = (e: Event): void => { e.stopPropagation(); this.openHub(); };
        return b;
    }

    /** open the hub as a layer above the statement (edit mode); the statement underneath stays untouched */
    private openHub(): void {
        if (this.hubOverlay || !this.editMode()) { return; }
        const parent = this.root.parentElement;
        if (!parent) { return; }
        this.hubPage = "hub"; this.hubSaved = null;
        if (getComputedStyle(parent).position === "static") { parent.style.position = "relative"; this.hubParentFixed = true; }
        const ov = document.createElement("div");
        ov.setAttribute("data-pnl", "hub-overlay");
        ov.setAttribute("role", "dialog");
        ov.setAttribute("aria-modal", "true");
        ov.setAttribute("aria-label", this.tr("UI_HubTitle"));
        ov.style.cssText = `position:absolute;left:0;top:0;right:0;bottom:0;z-index:200;overflow:auto;box-sizing:border-box;` +
            `font-family:${FONT};`;
        ov.addEventListener("click", (e: Event) => e.stopPropagation());
        ov.addEventListener("contextmenu", (e: Event) => e.stopPropagation());
        parent.appendChild(ov);
        this.hubOverlay = ov;
        this.hubFocusKey = "hub-close";
        this.hubRefresh();
    }

    /** close the layer; the statement below is exactly as it was. `refocus` puts the focus back on "☰ Start" */
    private closeHub(refocus: boolean): void {
        const ov = this.hubOverlay;
        if (!ov) { return; }
        this.hubOverlay = null;
        ov.remove();
        const parent = this.root.parentElement;
        if (parent && this.hubParentFixed) { parent.style.position = ""; }
        this.hubParentFixed = false;
        this.hubPage = "hub";
        if (refocus) {
            const b = this.root.querySelector<HTMLElement>('[data-pnl="hub-open"]');
            if (b) { b.focus(); }
        }
    }

    private renderLanding(): void {
        this.vs = null;
        this.root.style.background = this.pageBg();
        // emptyState (1.1, ChartKitchen 1.44): readers get the author's own text
        // instead of the field instructions; edit mode keeps the instructions
        // 1.4.1 readers and exports (no edit aids allowed): the calm family landing card
        if (!this.startAllowed()) { this.root.replaceChildren(this.readLanding()); return; }
        const box = document.createElement("div");
        box.style.cssText = "padding:22px 26px;max-width:600px;";
        const h = document.createElement("div");
        h.style.cssText = `font-size:${this.kpx(15)};font-weight:600;margin-bottom:8px;`;
        h.textContent = "P&L Statement byDatenWG";
        const p = document.createElement("div");
        p.style.cssText = `font-size:${this.kpx(12)};color:${C.soft};line-height:1.55;`;
        p.textContent = this.tr("UI_Landing");
        box.appendChild(h); box.appendChild(p);
        this.root.replaceChildren(box);
    }

    /**
     * 1.4.1 family landing card for readers and exports without data (the
     * same build in ChartKitchen): the product name bold — or the author's
     * emptyState title —, one ink-soft line "no data yet — fields are bound in
     * edit mode" — or the author's emptyState text, which still wins —, and,
     * where there is room, a quiet row of three static chart schemata. No
     * button, no pill, no docs link: nothing to click.
     */
    private readLanding(): HTMLElement {
        const e = this.settings?.emptyStateCard;
        const ownTitle = e ? e.title.value.trim() : "";
        const ownBody = e ? e.body.value.trim() : "";
        const f = this.hubFam();
        const wrap = document.createElement("div");
        wrap.setAttribute("data-pnl", "read-landing");
        wrap.style.cssText = "padding:16px;box-sizing:border-box;";
        const card = document.createElement("div");
        card.setAttribute("data-pnl", "empty-state");
        card.style.cssText = `max-width:520px;box-sizing:border-box;padding:14px 16px;border:1px solid ${f.hc ? f.ink : C.cardEdge};` +
            `border-radius:10px;background:${f.paper};color:${f.ink};font-family:${FONT};`;
        const h = document.createElement("div");
        h.setAttribute("data-pnl", "read-title");
        h.style.cssText = `font-size:${this.kpx(15)};font-weight:700;line-height:1.3;`;
        h.textContent = ownTitle || "P&L Statement byDatenWG";
        const p = document.createElement("div");
        p.setAttribute("data-pnl", "read-text");
        p.style.cssText = `font-size:${this.kpx(11)};color:${f.soft};line-height:1.5;margin-top:4px;`;
        p.textContent = ownBody || this.tr("UI_ReadEmpty");
        card.appendChild(h); card.appendChild(p);
        const w = this.vpW || this.root.clientWidth; const hh = this.vpH || this.root.clientHeight;
        if (w >= 280 && hh >= 170) { card.appendChild(this.readSchemata(f)); }
        wrap.appendChild(card);
        return wrap;
    }

    /** three static, decorative chart schemata of the landing card: statement, variance bars, driver tree */
    private readSchemata(f: { hc: boolean; ink: string; soft: string; teal: string; tealEdge: string }): HTMLElement {
        const row = document.createElement("div");
        row.setAttribute("data-pnl", "read-schemata");
        row.setAttribute("aria-hidden", "true");
        row.style.cssText = "display:flex;gap:10px;margin-top:12px;pointer-events:none;";
        const ns = "http://www.w3.org/2000/svg";
        const W = 72, H = 44;
        const grey = f.hc ? f.ink : C.py, ink = f.hc ? f.ink : C.ac, good = f.hc ? f.ink : f.tealEdge, bad = f.hc ? f.ink : C.tealBad;
        const mk = (draw: (add: (tag: string, a: Record<string, string | number>) => void) => void): SVGSVGElement => {
            const svg = document.createElementNS(ns, "svg");
            svg.setAttribute("width", String(W)); svg.setAttribute("height", String(H));
            svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
            svg.style.cssText = `display:block;border:1px solid ${f.hc ? f.ink : C.cardEdge};border-radius:6px;opacity:.75;`;
            draw((tag, a) => {
                const el = document.createElementNS(ns, tag);
                for (const k of Object.keys(a)) { el.setAttribute(k, String(a[k])); }
                svg.appendChild(el);
            });
            return svg;
        };
        // statement: label lines, values, a total line
        row.appendChild(mk(add => {
            for (let i = 0; i < 4; i++) {
                const y = 9 + i * 8;
                add("rect", { x: 7, y: y - 1.5, width: i === 3 ? 22 : 18 + (i % 2) * 6, height: 3, fill: grey });
                add("rect", { x: 46, y: y - 1.5, width: 18, height: 3, fill: i === 3 ? ink : grey });
            }
            add("line", { x1: 7, y1: 31.5, x2: 65, y2: 31.5, stroke: ink, "stroke-width": 1 });
        }));
        // variance bars: an axis with good / bad bars
        row.appendChild(mk(add => {
            add("line", { x1: 36, y1: 6, x2: 36, y2: 38, stroke: ink, "stroke-width": 1 });
            const bars: [number, number][] = [[14, 1], [-9, 0], [20, 1], [-5, 0]];
            bars.forEach(([v, g], i) => {
                const y = 8 + i * 8;
                add("rect", { x: v >= 0 ? 36 : 36 + v, y, width: Math.abs(v), height: 5, fill: g ? good : bad });
            });
        }));
        // driver tree: a root card with three children
        row.appendChild(mk(add => {
            add("rect", { x: 6, y: 17, width: 16, height: 10, rx: 2, fill: "none", stroke: ink, "stroke-width": 1 });
            add("path", { d: "M22 22 H31 M31 9 V35 M31 9 H40 M31 22 H40 M31 35 H40", fill: "none", stroke: grey, "stroke-width": 1 });
            for (const y of [4, 17, 30]) { add("rect", { x: 40, y, width: 24, height: 10, rx: 2, fill: "none", stroke: grey, "stroke-width": 1 }); }
        }));
        return row;
    }

    private renderEmpty(): void {
        this.vs = null;
        this.root.style.background = this.pageBg();
        if (this.customEmpty()) { this.renderEmptyMessage(); return; }
        const box = document.createElement("div");
        box.style.cssText = `padding:18px 22px;font-size:${this.kpx(12)};color:${C.soft};`;
        box.textContent = this.tr("UI_NoData");
        this.root.replaceChildren(box);
    }

    /** the author set an own empty-state title or text (emptyState card) */
    private customEmpty(): boolean {
        const e = this.settings?.emptyStateCard;
        return !!e && (e.title.value.trim() !== "" || e.body.value.trim() !== "");
    }

    /** emptyState: the author's title (bold) + text; an empty part falls back to the standard text */
    private renderEmptyMessage(): void {
        this.root.replaceChildren(this.emptyMessageBox());
    }

    private emptyMessageBox(): HTMLElement {
        const e = this.settings.emptyStateCard;
        const box = document.createElement("div");
        box.setAttribute("data-pnl", "empty-state");
        box.style.cssText = "padding:18px 22px;max-width:600px;";
        const title = e.title.value.trim();
        if (title) {
            const h = document.createElement("div");
            h.style.cssText = `font-size:${this.kpx(14)};font-weight:600;margin-bottom:6px;color:${C.text};`;
            h.textContent = title;
            box.appendChild(h);
        }
        const p = document.createElement("div");
        p.style.cssText = `font-size:${this.kpx(12)};color:${C.soft};line-height:1.55;`;
        p.textContent = e.body.value.trim() || this.tr("UI_NoData");
        box.appendChild(p);
        return box;
    }

    private rerender(): void { this.render(); }

    /** cache key for the scans that depend on model + shown Δ combinations only */
    private scanKey(): string {
        const ui = this.ui!;
        const k: (string | number | boolean)[] = [this.modelVer, ui.view, ui.preset, ui.ref,
            ui.blocks.mtd, ui.blocks.ytd, ui.blocks.fy];
        // 1.2: the own selection and the column categories change the Δ columns too
        if (ui.preset === "custom") { k.push(JSON.stringify(ui.vals)); }
        if (this.catInView()) { k.push("cat"); }
        return k.join("~");
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
                if (dc.cat != null) { continue; }
                const d = this.blockVariance(node, dc.block, dc.ref, dc.minuend).delta;
                if (d != null) { maxAbsDelta = Math.max(maxAbsDelta, Math.abs(d)); }
            }
        }
        // 1.2 column categories: their Δ share the one uniform scale
        for (const dc of deltaCombos) {
            if (dc.cat == null) { continue; }
            const cm = this.catModels?.[dc.cat];
            if (!cm) { continue; }
            for (const node of cm.model.byId.values()) {
                if (node.row.rowType === "kpi") { continue; }
                const d = this.blockVariance(node, dc.block, dc.ref, dc.minuend).delta;
                if (d != null) { maxAbsDelta = Math.max(maxAbsDelta, Math.abs(d)); }
            }
        }
        this.scanCache = { key, maxAbsVal, maxAbsDelta };
        return this.scanCache;
    }

    /**
     * Export (allowInteractions = false) prints the statement, not the screen:
     * with columns.exportExpandAll (default on) every row renders expanded —
     * a folded block never drops out of a PDF — without touching the stored
     * fold state (ChartKitchen's exportExpandAll). The driver tree keeps its
     * own fold state.
     */
    private render(): void {
        const ui = this.ui;
        if (ui && ui.collapsed.length > 0 && this.exporting() && this.settings.columnsCard.exportExpandAll.value) {
            this.ui = { ...ui, collapsed: [] };
            try { this.renderView(); } finally { this.ui = ui; }
            return;
        }
        this.renderView();
        // 1.4 the hub's demo page (no fields, emptyState.mode = hub) carries the hub's bottom bar too
        if (this.demo && !this.miniSpec && this.hubPage === "demo" && !this.hubOverlay && this.emptyMode() === "hub") {
            const f = this.hubFooter(0);
            this.root.appendChild(f);
            this.hubFitNote(f);
        }
    }

    private renderView(): void {
        const model = this.model; const ui = this.ui;
        if (!model || !ui) { return; }
        // several visuals may share one document (test harness) — every render
        // re-arms its own palette before it paints
        this.applyPalette();
        // interactions switched off (format pane, host, or a host without a
        // selection manager): no element may keep a selection marker
        if (!this.interactive()) { this.selKey = null; }
        const keepScroll = this.root.scrollTop;
        this.treeZoomHide();
        this.floatHeadEl = null;
        this.darkTip = null;
        this.ssCache.clear();
        this.root.replaceChildren();
        this.root.style.background = this.pageBg();
        this.comments = [];
        this.vs = null;
        this.megaVs = null;
        this.headEl = null;
        this.headStuck = false;
        this.pagerSync = [];

        const scanRaw = this.scans();
        // scale sync (numbers.fixedVarMax): the uniform Δ scale reaches at least ±fixedVarMax
        const fvm = this.fixedVarMax();
        const scan = fvm != null && fvm > scanRaw.maxAbsDelta ? { ...scanRaw, maxAbsDelta: fvm } : scanRaw;
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
        if (this.demo && !this.miniQuiet()) { head.appendChild(this.buildDemoBanner()); }
        if (this.settings.titleCard.show.value) { head.appendChild(this.buildTitle(fmt)); }
        // 1.5: collapsible control bars — folded, one slim row with ☰ remains
        const folded = this.tbFolded();
        if (folded) { head.appendChild(this.buildTbBurger()); }
        // an export prints no buttons nobody can press (the legend stays: it explains the notation)
        if (this.settings.toolbarCard.show.value && !this.exporting() && !folded) {
            const tb = this.buildToolbar();
            if (this.tbCollapsible()) { tb.insertBefore(this.tbFoldButton(), tb.firstChild); }
            head.appendChild(tb);
        }
        if (this.awaitingSegment) { head.appendChild(this.buildLoadingBar()); }
        if (this.settings.toolbarCard.showLegend.value && !folded) {
            // toolbar off but legend on: the fold button leads the legend row
            if (this.tbCollapsible() && !(this.settings.toolbarCard.show.value && !this.exporting())) {
                head.appendChild(this.buildTbBurger());
            }
            head.appendChild(this.buildLegend());
        }
        // the mega table is a mode of the TABLE view only — a template must
        // never take over Bars or Waterfall (1.0.0 did, and the toolbar of those
        // views then drove a body that ignored every one of its buttons)
        const mega = this.megaInView();
        if (ui.view !== "tree" && !mega && !folded) { head.appendChild(this.scaleNote(fmt, scan.maxAbsDelta)); }
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
        } else if (mega) {
            // the mega table lays itself out to the viewport (chart columns
            // share the free width) — no fit passes, no windowing. One
            // correction pass: when the body brings a vertical scrollbar along,
            // the few pixels it takes come out of the chart columns instead of
            // pushing a horizontal scrollbar in
            const table = this.buildMega(fmt, 0);
            this.root.appendChild(table);
            const over = this.root.scrollWidth - this.root.clientWidth;
            if (over > 0 && over <= 40) { this.root.replaceChild(this.buildMega(fmt, over), table); }
            this.appendScaleFixedNote();
            this.appendCatNote();
            this.buildFootnotes(fmt);
            this.root.appendChild(this.buildFooter());
            this.root.scrollTop = keepScroll;
            this.syncMegaWindow();
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
            this.appendScaleFixedNote();
            this.appendCatNote();
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

    /**
     * Edit mode only: "Scale fixed" under the statement while numbers.fixedMax
     * or fixedVarMax hold the scale — an author must not wonder why the bars
     * stay short. Readers and exports never see it.
     */
    private appendScaleFixedNote(): void {
        if (this.fixedMax() == null && this.fixedVarMax() == null) { return; }
        if ((this.viewMode != null && this.viewMode < 1) || this.exporting()) { return; }
        const note = document.createElement("div");
        note.setAttribute("data-pnl", "scale-fixed");
        note.style.cssText = `font-size:${this.kpx(9)};color:${C.soft};font-style:italic;` +
            `padding:2px ${TABLE_PAD_X + 14}px 0 ${TABLE_PAD_X + 14}px;`;
        const fmt = this.makeFmt(this.scans().maxAbsVal);
        const unit = fmt.suffix + this.settings.numbersCard.unitText.value;
        const part = (v: number | null, key: string): string =>
            v == null ? "" : this.tr(key, fmt.val(v) + (unit ? " " + unit : ""));
        note.textContent = this.tr("UI_ScaleFixed") + ": " +
            [part(this.fixedMax(), "UI_ScaleFixedVal"), part(this.fixedVarMax(), "UI_ScaleFixedVar")].filter(Boolean).join(" · ");
        this.root.appendChild(note);
    }

    /**
     * Edit mode only (1.2): the column category is bound but this view does not
     * use it — the mega table, bars and waterfall ignore it. Readers and
     * exports never see the note.
     */
    private appendCatNote(): void {
        if (!this.catBound || this.catInView() || !this.ui || this.ui.view === "tree") { return; }
        if ((this.viewMode != null && this.viewMode < 1) || this.exporting()) { return; }
        const note = document.createElement("div");
        note.setAttribute("data-pnl", "cat-note");
        note.style.cssText = `font-size:${this.kpx(9)};color:${C.soft};font-style:italic;` +
            `padding:2px ${TABLE_PAD_X + 14}px 0 ${TABLE_PAD_X + 14}px;`;
        note.textContent = this.tr("UI_ColCatIgnored");
        this.root.appendChild(note);
    }

    /**
     * 1.5 scale note of the mega table (IBCS UN 5.2): the table draws one scale
     * per unit across all period blocks; the note appears only when something
     * deviates from that — a block or column magnified by a round factor (its
     * head carries "×5" as well) or a scale held by fixedMax / fixedVarMax. In
     * edit mode the fixed scale is already named by the author note under the
     * table ("Scale fixed"), so the note leaves it out there. Null = no note.
     */
    private megaScaleNote(L: MegaLayout, fmt: Fmt): HTMLElement | null {
        const parts: string[] = [];
        const blocks = L.input.blocks;
        if (L.mags.length) {
            const list = L.mags.map(m => m.heads.join(" · ")
                + (blocks.length > 1 && blocks[m.block]?.name ? " " + blocks[m.block].name : "") + " ×" + m.factor);
            parts.push(this.tr("UI_MegaScaleMag", list.join(", ")));
        }
        const authorNote = (this.viewMode == null || this.viewMode >= 1) && !this.exporting();
        if (!authorNote && (this.fixedMax() != null || this.fixedVarMax() != null)) {
            const unit = fmt.suffix + this.settings.numbersCard.unitText.value;
            const part = (v: number | null, key: string): string =>
                v == null ? "" : this.tr(key, fmt.val(v) + (unit ? " " + unit : ""));
            parts.push(this.tr("UI_MegaScaleFixed",
                [part(this.fixedMax(), "UI_ScaleFixedVal"), part(this.fixedVarMax(), "UI_ScaleFixedVar")].filter(Boolean).join(" · ")));
        }
        if (!parts.length) { return null; }
        const note = document.createElement("div");
        note.setAttribute("data-pnl", "scale-note");
        note.style.cssText = `font-size:${this.kpx(9)};color:${C.soft};text-align:right;box-sizing:border-box;` +
            `width:${Math.ceil(L.tableW)}px;padding:0 0 3px 0;`;
        note.textContent = [this.tr("UI_MegaScale"), ...parts].join(" · ");
        return note;
    }

    /** 1.5: toolbar.foldable — the control bars may fold (never in an export) */
    private tbCollapsible(): boolean {
        return this.settings?.toolbarCard?.foldable?.value === true && !this.exporting() && !this.miniQuiet();
    }

    /** 1.5: the control bars are folded right now (the reader's choice, else toolbar.startFolded) */
    private tbFolded(): boolean {
        if (!this.tbCollapsible()) { return false; }
        return this.tbOpen == null ? this.settings.toolbarCard.startFolded.value : !this.tbOpen;
    }

    /** 1.5: the ☰ button that folds / unfolds the control bars */
    private tbFoldButton(): HTMLElement {
        const folded = this.tbFolded();
        const b = document.createElement("button");
        b.setAttribute("data-pnl", "tb-burger");
        b.setAttribute("aria-expanded", String(!folded));
        const label = this.tr(folded ? "UI_TbExpand" : "UI_TbCollapse");
        b.setAttribute("aria-label", label);
        b.title = label;
        b.textContent = "☰";
        b.style.cssText = `font-family:${FONT};font-size:${this.kpx(12)};line-height:1;cursor:pointer;` +
            `padding:${this.kpx(3)} ${this.kpx(7)};border-radius:4px;border:1px solid ${C.ctlEdge};` +
            `background:${this.cardBg()};color:${C.text};align-self:flex-end;`;
        b.onclick = (e: Event): void => {
            e.stopPropagation();
            this.tbOpen = folded;
            this.rerender();
        };
        return b;
    }

    /** 1.5: the slim row of folded control bars — only the ☰ button (unfolded without toolbar: the row above the legend) */
    private buildTbBurger(): HTMLElement {
        const row = document.createElement("div");
        // folded: the slim row; unfolded without a toolbar: the row leading the legend
        row.setAttribute("data-pnl", this.tbFolded() ? "tb-folded" : "tb-lead");
        row.style.cssText = `display:flex;padding:${this.kpx(4)} 14px ${this.kpx(2)} 14px;`;
        row.appendChild(this.tbFoldButton());
        return row;
    }

    /**
     * 1.5: the classic scale note follows the geometry of the table just
     * built — next to value bars or cascades (bars and waterfall view) the Δ
     * bars share the value scale, or carry a round magnification that the
     * column head names as well ("ΔPL ×5").
     */
    private syncScaleNote(geo: TableGeo): void {
        const note = this.headEl?.querySelector('[data-pnl="scale-note"]') as HTMLElement | null
            ?? this.root.querySelector('[data-pnl="scale-note"]') as HTMLElement | null;
        if (!note || geo.dPpu <= 0) { return; }
        note.textContent = geo.dMag > 1 ? this.tr("UI_ScaleNoteMag", geo.dMag) : this.tr("UI_ScaleNoteValue");
        note.setAttribute("data-mag", String(geo.dMag));
    }

    /** the uniform-Δ-scale note — part of the frozen head, not of the table */
    private scaleNote(fmt: Fmt, maxAbsDelta: number): HTMLElement {
        const note = document.createElement("div");
        note.setAttribute("data-pnl", "scale-note");
        note.style.cssText = `font-size:${this.kpx(9)};color:${C.soft};text-align:right;` +
            `padding:0 ${TABLE_PAD_X}px 3px ${TABLE_PAD_X}px;`;
        note.textContent = this.tr("UI_ScaleNote",
            fmt.val(maxAbsDelta) + " " + fmt.suffix + this.settings.numbersCard.unitText.value);
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
        // the mega table's head svg is an ordinary block — it sticks by itself
        const megaHead = this.root.querySelector('[data-pnl="mega-head-wrap"]') as HTMLElement | null;
        if (megaHead) {
            megaHead.style.position = "sticky";
            megaHead.style.top = top + "px";
            megaHead.style.zIndex = "20";
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
        head.style.boxShadow = on ? C.headShadow : "none";
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
        if ((!this.vs && !this.megaVs) || this.scrollRaf !== 0) { return; }
        const raf = typeof requestAnimationFrame === "function"
            ? requestAnimationFrame : (cb: FrameRequestCallback): number => setTimeout(() => cb(0), 16) as unknown as number;
        this.scrollRaf = raf(() => { this.scrollRaf = 0; this.syncWindow(); this.syncMegaWindow(); });
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
    private deltaCombos(): { ref: Scenario; minuend: Scenario; block: "mtd" | "ytd" | "fy"; cat?: number }[] {
        const out: { ref: Scenario; minuend: Scenario; block: "mtd" | "ytd" | "fy"; cat?: number }[] = [];
        if (this.ui!.view === "tree") { return out; } // the tree shows no Δ bars
        // exactly the Δ columns on screen — read from the column specs, so the
        // uniform scale can never span a block the toolbar has switched off
        // (or miss one it shows) — every reference × minuend × block once.
        // Every bar / pin column carries its own pair; the plain value bars
        // (vbar / wbar) are scaled by the value maximum, not by Δ.
        const seen = new Set<string>();
        for (const b of this.colSpecs()) {
            for (const c of b.specs) {
                if ((c.kind !== "bar" && c.kind !== "pin") || !c.ref || !c.minuend) { continue; }
                const block = c.block ?? "ytd";
                const key = `${c.ref}|${c.minuend}|${block}` + (c.cat != null ? `|${c.cat}` : "");
                if (seen.has(key) || !this.has[c.ref]) { continue; }
                seen.add(key);
                // a category column scales against its own category's rows (the uniform scale spans the deck)
                out.push(c.cat != null ? { ref: c.ref, minuend: c.minuend, block, cat: c.cat } : { ref: c.ref, minuend: c.minuend, block });
            }
        }
        return out;
    }

    // ---------------- title / toolbar / legend ----------------

    private buildTitle(fmt: Fmt): HTMLElement {
        const t = this.settings.titleCard;
        const wrap = document.createElement("div");
        wrap.style.cssText = "padding:12px 14px 4px 14px;";
        let msg = t.message.value.trim();
        // headline slot (1.1, IBCS 12-series): the message moves out of the bold
        // line above the title into a large line beside it; without an own
        // message it is the generated one (with or without autoMessage)
        const hl = t.headline.value;
        // ChartKitchen autoMessage: the generated SAY line while no own message is set
        if (!msg && (t.autoMessage.value || hl)) { msg = this.autoMessage(fmt); }
        if (msg && !hl) {
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
        // mega table: the scenarios and Δ references its columns really show
        const mt = this.megaInView() ? this.megaToggles() : null;
        const megaScen = mt ? [mt.showPY ? "PY" : "", mt.showPL ? "PL" : "", mt.min].filter(Boolean).join(", ") : "";
        const megaRefs = mt ? activeRefs(mt).join(", ") : "";
        const lines = [
            t.unitLine.value.trim() || (this.demo ? this.tr("UI_DemoUnit") : ""),
            t.measureLine.value.trim() || (fmt.suffix
                ? this.tr("UI_TitleMeasureUnit", fmt.suffix + this.settings.numbersCard.unitText.value)
                : this.tr("UI_TitleMeasure")),
            t.periodLine.value.trim() || this.relabel([autoPeriod, mt
                ? megaScen + (megaRefs ? ` · Δ ${megaRefs}` : "")
                : scen && `${scen} · Δ ${this.ui!.ref.toUpperCase()}`].filter(Boolean).join(": ")),
        ].filter(s => s !== "");
        const lineHost = hl ? document.createElement("div") : wrap;
        lines.forEach((line, i) => {
            const el = document.createElement("div");
            el.style.cssText = i === 1
                ? `font-size:${this.kpx(12)};line-height:1.5;font-weight:600;`
                : `font-size:${this.kpx(12)};line-height:1.5;color:${i === 0 ? C.text : C.text};`;
            el.textContent = line;
            lineHost.appendChild(el);
        });
        if (hl) {
            // 12er layout: title lines left, the message large beside them, a rule below
            const row = document.createElement("div");
            row.setAttribute("data-pnl", "headline-row");
            row.style.cssText = `display:flex;flex-wrap:wrap;align-items:flex-start;column-gap:${this.k(40)}px;row-gap:${this.kpx(6)};` +
                `padding-bottom:${this.kpx(8)};border-bottom:1px solid ${C.soft};`;
            lineHost.style.cssText = "flex:0 0 auto;";
            row.appendChild(lineHost);
            if (msg) {
                const h = document.createElement("div");
                h.setAttribute("data-pnl", "headline");
                h.style.cssText = `flex:1 1 ${this.k(280)}px;max-width:${this.k(760)}px;font-size:${this.kpx(17)};` +
                    `line-height:1.3;font-weight:400;color:${C.text};`;
                h.textContent = msg;
                row.appendChild(h);
            }
            wrap.appendChild(row);
        }
        return wrap;
    }

    /**
     * A toolbar button. `locked` (a tooltip text) marks a button whose click
     * would change nothing in the current view / column preset: it stays in
     * place — the toolbar does not jump while the reader explores — but reads
     * as locked, explains itself on hover and neither persists nor re-renders.
     * (Up to 1.0.0 such buttons looked live, lit up on click and did nothing.)
     */
    private tbBtn(label: string, active: boolean, onClick: () => void, title?: string, locked?: string): HTMLElement {
        const b = document.createElement("button");
        b.textContent = label;
        if (title) { b.title = title; }
        // keyboard (1.1): a native button — Tab reaches it, Enter / Space press it;
        // the state is announced, the focus ring is drawn by kbRing
        b.setAttribute("aria-pressed", active ? "true" : "false");
        this.kbRing(b);
        if (locked) {
            b.title = locked;
            b.setAttribute("aria-disabled", "true");
            b.setAttribute("data-pnl-locked", "1");
        }
        const acc = this.accent();
        const rest = active
            ? `background:${acc};border:1px solid ${acc};color:${this.onAccent()};font-weight:600;`
            : `background:${C.paper};border:1px solid ${C.ctlEdge};color:${C.text};font-weight:400;`;
        b.style.cssText =
            `font-family:${FONT};font-size:${this.kpx(10.5)};line-height:1.35;` +
            `padding:${this.kpx(3.5)} ${this.kpx(10)};cursor:pointer;` +
            `border-radius:4px;transition:${TRANSITION};` + rest;
        if (locked) {
            b.style.opacity = "0.4";
            b.style.cursor = "default";
            b.onclick = (e) => { e.stopPropagation(); };
            return b;
        }
        // hover is a tint, never a jump: the inactive button warms up, the
        // active one lifts a shade so both stay recognisably the same control
        b.onmouseenter = (): void => {
            if (active) { b.style.background = this.accentSoft(0.14); b.style.borderColor = this.accentSoft(0.14); }
            else { b.style.background = C.ctlHover; b.style.borderColor = C.cardEdgeHover; }
        };
        b.onmouseleave = (): void => {
            if (active) { b.style.background = acc; b.style.borderColor = acc; }
            else { b.style.background = C.paper; b.style.borderColor = C.ctlEdge; }
        };
        b.onclick = (e) => { e.stopPropagation(); onClick(); this.persistUi(); this.rerender(); };
        return b;
    }

    /** caps label of a control group — the one type style for every section head */
    /**
     * Edit mode in the strict sense: the host SAYS it is editing (Desktop
     * authoring, service edit). Authoring controls that write the format pane
     * (template picker, empty-state switches) appear only here — never for
     * readers, never in exports, and not in hosts that report no view mode.
     */
    private editMode(): boolean {
        return this.viewMode != null && this.viewMode >= 1 && this.host.hostCapabilities?.allowInteractions !== false;
    }

    /**
     * 1.2 toolbar template picker (edit mode): the IBCS templates of the format
     * pane as one compact dropdown. Picking one writes columns.template AND
     * applies it in the same persist (see applyMegaTemplate) — the pending
     * guard then holds the new template against stale updates, so the picker
     * never springs back while the host echoes.
     */
    private templatePicker(): HTMLElement {
        const tpl = this.settings.columnsCard.template;
        const sel = document.createElement("select");
        sel.setAttribute("data-pnl", "tb-template");
        sel.title = this.tr("UI_TbTemplateTip");
        sel.setAttribute("aria-label", this.tr("UI_TbTemplate"));
        sel.style.cssText = `font-family:${FONT};font-size:${this.kpx(10.5)};line-height:1.35;` +
            `padding:${this.kpx(2.5)} ${this.kpx(4)};border-radius:4px;border:1px solid ${C.ctlEdge};` +
            `background:${C.paper};color:${C.text};cursor:pointer;max-width:${this.k(230)}px;`;
        const cur = String(tpl.value?.value ?? "off");
        for (const it of tpl.items ?? []) {
            const o = document.createElement("option");
            o.value = String(it.value);
            o.textContent = typeof it.displayName === "string" ? it.displayName : String(it.value);
            if (o.value === cur) { o.selected = true; }
            sel.appendChild(o);
        }
        this.kbRing(sel as unknown as HTMLElement);
        sel.onclick = (e: Event): void => { e.stopPropagation(); };
        sel.onchange = (): void => { this.pickTemplate(sel.value); };
        // 1.3 "back to the template": the switches left the template's state —
        // one click writes the template again (a native dropdown cannot pick the
        // template that is already selected, so this is the way to re-apply it)
        const parts: HTMLElement[] = [sel];
        const dev = this.templateDeviation();
        if (dev) {
            const b = this.tbBtn(this.tr("UI_TbTplReset"), false, () => { /* replaced below */ },
                this.tr("UI_TbTplResetTip", dev));
            b.setAttribute("data-pnl", "tb-template-reset");
            b.onclick = (e: Event): void => { e.stopPropagation(); this.pickTemplate(dev); };
            parts.push(b);
        }
        const g = this.tbGroup(this.tr("UI_TbTemplate"), parts);
        g.setAttribute("data-pnl", "tb-template-group");
        return g;
    }

    /**
     * The template the switches have left: the code of the set template when at
     * least one of its switches (columns card, title headline) differs from the
     * preset, else null. The number format is part of the restored state but
     * does not count as a deviation (decimals are a taste, not a switch).
     */
    private templateDeviation(): string | null {
        const tpl = String(this.settings.columnsCard.template.value.value);
        if (tpl === "off" || !MEGA_PRESETS[tpl]) { return null; }
        const sw = templateSwitches(tpl);
        for (const [k, v] of Object.entries(sw.cols)) {
            if (!this.megaSliceIs(k, v)) { return tpl; }
        }
        if (sw.title.headline != null && this.settings.titleCard.headline.value !== sw.title.headline) { return tpl; }
        return null;
    }

    /** toolbar template pick: the pane dropdown, its switches and templateApplied in one write */
    private pickTemplate(tpl: string): void {
        if (!MEGA_PRESETS[tpl]) { return; }
        this.megaSliceSet("template", tpl);
        this.applyMegaTemplate(tpl, true);
        this.rerender();
    }

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
        b.textContent = this.tr("UI_BackToTree");
        b.title = this.tr("UI_BackToTreeTip");
        b.style.cssText = `font-family:${FONT};font-size:${this.kpx(13)};font-weight:600;line-height:1.3;` +
            `padding:${this.kpx(8)} ${this.kpx(16)};cursor:pointer;border-radius:6px;border:1px solid ${acc};` +
            `background:${acc};color:${this.onAccent()};transition:${TRANSITION};box-shadow:${C.shadow};`;
        b.onmouseenter = (): void => {
            b.style.background = this.accentSoft(0.16);
            b.style.borderColor = this.accentSoft(0.16);
            b.style.boxShadow = C.shadowHover;
        };
        b.onmouseleave = (): void => {
            b.style.background = acc; b.style.borderColor = acc; b.style.boxShadow = C.shadow;
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
        // 1.3/1.4 the Start hub as an overlay — an authoring aid, edit mode only;
        // since 1.4 the first control of the toolbar, framed in the accent
        if (this.editMode() && !this.miniSpec) { bar.appendChild(this.hubOpenButton()); }
        // 1.2 template picker first — edit mode only (an authoring control, it
        // writes the format pane), table view only (templates shape the table)
        if (tset.showTemplate.value && this.editMode() && ui.view === "table") {
            bar.appendChild(this.templatePicker());
        }
        if (tset.showView.value && !inZoom) { bar.appendChild(this.tbGroup(this.tr("UI_TbView"), [
            this.tbBtn(this.tr("UI_TbTable"), ui.view === "table", () => { ui.view = "table"; }),
            this.tbBtn(this.tr("UI_TbBars"), ui.view === "bars", () => { ui.view = "bars"; },
                this.tr("UI_TbBarsTip")),
            this.tbBtn(this.tr("UI_TbWaterfall"), ui.view === "waterfall", () => { ui.view = "waterfall"; },
                this.tr("UI_TbWaterfallTip")),
            this.tbBtn(this.tr("UI_TbTree"), ui.view === "tree", () => { ui.view = "tree"; },
                this.tr("UI_TbTreeTip")),
        ])); }

        // column presets, periods and options describe the table layout — the
        // driver tree follows the formula graph instead. The Δ reference and the
        // expand level do apply to it: they drive the card variances and the
        // depth of the opened graph.
        const tableViews = ui.view !== "tree" && !inZoom;
        const isTree = ui.view === "tree" && !inZoom;
        // the mega table takes its columns from the format pane switches —
        // presets, Δ reference, period blocks and fit belong to the classic table
        const mega = this.megaInView();
        const classic = tableViews && !mega;
        // column presets and "% of revenue" shape the classic TABLE only — the
        // bars and waterfall views build their columns from the Δ reference and
        // the period blocks alone (up to 1.0.0 both groups showed there and did
        // nothing)
        const classicTable = classic && ui.view === "table";

        // Does a toolbar change alter the columns on screen? The column specs
        // are the one truth for the table, bars and waterfall views — a change
        // that leaves them identical is a no-op, and its button is locked.
        const colSig = (): string => JSON.stringify(this.colSpecs().map(b =>
            [b.key, b.specs.map(c => [c.kind, c.scen ?? "", c.ref ?? "", c.minuend ?? "", c.block ?? ""])]));
        const baseSig = classic ? colSig() : "";
        const changes = (mut: (u: UiState) => void): boolean => {
            const saved = this.ui!;
            const trial: UiState = { ...saved, blocks: { ...saved.blocks } };
            mut(trial);
            this.ui = trial;
            try { return colSig() !== baseSig; } finally { this.ui = saved; }
        };
        const shownBlocks = classic ? new Set(this.colSpecs().map(b => b.key)) : new Set<string>();

        const presets: [Preset, string][] = ([
            ["full", this.tr("UI_PresetFull")], ["acref", this.tr("UI_PresetAcRef")], ["dall", this.tr("UI_PresetDAll")],
            ["acpydpy", "AC·PY·ΔPY"], ["acpldpl", "AC·PL·ΔPL"], ["dpct", "ΔPY% · ΔPL%"],
        ] as [Preset, string][]).map(([p, l]) => [p, this.relabel(l)]);
        if (tset.showPresets.value && classicTable) {
            bar.appendChild(this.tbGroup(this.tr("UI_TbPreset"),
                presets.map(([p, label]) => this.tbBtn(label, ui.preset === p, () => { ui.preset = p; }))));
        }

        // 1.2 value columns as independent switches (AC · PY · PL · FC · Δ):
        // a click turns the columns on screen into the preset "custom" and
        // flips one switch; a preset click later sets them all again. A switch
        // that would change nothing (the last column, Δ without a reference
        // field) stays in place, dimmed and locked — the 1.0.1 pattern.
        if (tset.showValues.value && classicTable) {
            const shown = this.shownVals();
            const rDelta: Scenario = this.has[ui.ref] ? ui.ref : (this.has.pl ? "pl" : "py");
            const flip = (u: UiState, k: keyof ValSet): void => {
                // the fixed-reference presets hand their reference over, so ΔPY stays ΔPY
                if (u.preset === "acpydpy") { u.ref = "py"; } else if (u.preset === "acpldpl") { u.ref = "pl"; }
                u.vals = { ...shown, [k]: !shown[k] };
                u.preset = "custom";
            };
            const lockTip = this.tr("UI_TbValNoEffect");
            const vb: HTMLElement[] = [];
            for (const k of ["ac", "py", "pl", "fc"] as (keyof ValSet)[]) {
                if (!this.has[k as Scenario]) { continue; }
                vb.push(this.tbBtn(this.relabel(k.toUpperCase()), shown[k], () => flip(ui, k), undefined,
                    changes(u => flip(u, k)) ? undefined : lockTip));
            }
            const refShown = ui.preset === "acpydpy" ? "py" : ui.preset === "acpldpl" ? "pl" : rDelta;
            vb.push(this.tbBtn("Δ" + this.relabel(refShown.toUpperCase()), shown.d, () => flip(ui, "d"),
                this.tr("UI_TbValDeltaTip"), changes(u => flip(u, "d")) ? undefined : lockTip));
            const g = this.tbGroup(this.tr("UI_TbValues"), vb);
            g.setAttribute("data-pnl", "tb-values");
            bar.appendChild(g);
        }

        const refs: Scenario[] = (["py", "pl", "fc"] as Scenario[]).filter(s => this.has[s]);
        if (refs.length > 0 && tset.showReference.value && (classic || isTree || inZoom)) {
            // the tree and the tile always follow the reference; the column
            // views only where a column is built from it ("AC vs Ref", the MTD
            // block, bars, waterfall) — elsewhere the preset fixes its references
            const refLive = !classic || refs.some(r => r !== ui.ref && changes(u => { u.ref = r; }));
            const refTip = refLive ? undefined : this.tr("UI_TbRefNoEffect", this.tr("UI_PresetAcRef"));
            bar.appendChild(this.tbGroup(this.tr("UI_TbReference"),
                refs.map(r => this.tbBtn(this.relabel(r.toUpperCase()), ui.ref === r, () => { ui.ref = r; }, undefined, refTip))));
        }

        // period buttons show what is ON SCREEN (a forced YTD block reads as
        // on) and lock where a click would change nothing: the FY block outside
        // the presets that carry it, the last block that keeps the table alive
        const pb: HTMLElement[] = [];
        const periodBtn = (key: "mtd" | "ytd" | "fy", label: string): HTMLElement => {
            const live = changes(u => { u.blocks[key] = !u.blocks[key]; });
            const tip = live ? undefined
                : key === "fy" && !shownBlocks.has("fy") ? this.tr("UI_TbFyNoEffect", this.tr("UI_PresetFull"))
                    : this.tr("UI_TbLastBlock");
            return this.tbBtn(label, shownBlocks.has(key), () => { ui.blocks[key] = !ui.blocks[key]; }, undefined, tip);
        };
        if (classic) {
            if (ui.view !== "bars" && this.model!.months.length > 1) { pb.push(periodBtn("mtd", "MTD")); }
            pb.push(periodBtn("ytd", "YTD"));
            if (this.has.fcfy && this.has.plfy) { pb.push(periodBtn("fy", "FY")); }
        }
        if (pb.length > 1 && tset.showPeriods.value && classic) {
            bar.appendChild(this.tbGroup(this.tr("UI_TbPeriods"), pb));
        }

        const unitText = this.settings.numbersCard.unitText.value || "EUR";
        if (tset.showUnit.value) { bar.appendChild(this.tbGroup(this.tr("UI_TbUnit"), [
            this.tbBtn("k" + unitText, ui.unit === "k", () => { ui.unit = "k"; }),
            this.tbBtn("m" + unitText, ui.unit === "m", () => { ui.unit = "m"; }),
            // billions (1.1): only where auto scaling would pick them (from 50 billion)
            // or the pane chose them — every other report keeps its k | m pair
            ...(ui.unit === "b" || this.scans().maxAbsVal >= 5e10
                ? [this.tbBtn("b" + unitText, ui.unit === "b", () => { ui.unit = "b"; })] : []),
        ])); }

        if (tset.showDensity.value && !inZoom) { bar.appendChild(this.tbGroup(this.tr("UI_TbDensity"), [
            this.tbBtn(this.tr("UI_TbNormal"), ui.density === "normal", () => { ui.density = "normal"; }),
            this.tbBtn(this.tr("UI_TbCompact"), ui.density === "compact", () => { ui.density = "compact"; }),
        ])); }

        // card chart + status indicator only make sense on the driver tree
        if (isTree) {
            const cardBtn = (m: TreeCardMode, label: string, tip: string): HTMLElement =>
                this.tbBtn(label, ui.treeCard === m, () => { ui.treeCard = m; }, tip);
            bar.appendChild(this.tbGroup(this.tr("UI_TbCards"), [
                cardBtn("months", this.tr("UI_TbMonths"), this.tr("UI_TbMonthsTip")),
                cardBtn("delta", "Δ", this.tr("UI_TbDeltaTip")),
                cardBtn("bridge", this.tr("UI_TbBridge"), this.tr("UI_TbBridgeTip")),
                this.tbBtn(this.tr("UI_TbStatus"), ui.treeStatus,
                    () => { ui.treeStatus = !ui.treeStatus; },
                    this.tr("UI_TbStatusTip")),
            ]));
        }

        const treeDepth = this.treeCtx ? this.treeCtx.depth : 1;
        const maxL = Math.min(isTree ? treeDepth : this.model!.maxDepth, 8);
        const lvlBtns: HTMLElement[] = [];
        if (isTree) {
            lvlBtns.push(this.tbBtn("⌂", false, () => {
                ui.treeRoot = "";
                ui.treeCollapsed = null;
            }, this.tr("UI_TbHomeTip")));
        }
        for (let l = 1; l < maxL; l++) {
            lvlBtns.push(this.tbBtn(String(l), false, () => {
                if (isTree) { ui.treeCollapsed = this.treeCtx ? [...this.treeCtx.levels[l]] : []; }
                else { ui.collapsed = [...collapseToLevel(this.model!.roots, l)]; }
            }));
        }
        lvlBtns.push(this.tbBtn(this.tr("UI_TbAll"), false, () => {
            if (isTree) { ui.treeCollapsed = []; } else { ui.collapsed = []; }
        }));
        if (tset.showLevels.value && (tableViews || isTree)) {
            bar.appendChild(this.tbGroup(this.tr("UI_TbLevels"), lvlBtns));
        }

        // mega table: the reader's scenario view (analysed scenario · reference view)
        if (tset.showScenario.value && mega) {
            for (const g of this.megaScenarioGroups()) { bar.appendChild(g); }
        }
        // 1.2 the mega table's value columns as reader switches (analysed scenario · PY · PL)
        if (tset.showValues.value && mega) {
            const g = this.megaValuesGroup();
            if (g) { bar.appendChild(g); }
        }

        if (tset.showOptions.value && mega) {
            bar.appendChild(this.tbGroup(this.tr("UI_TbOptions"), [
                this.tbBtn(this.tr("UI_TbHideZero"), ui.hideZero, () => { ui.hideZero = !ui.hideZero; }),
            ]));
        }
        if (tset.showOptions.value && classic) { bar.appendChild(this.tbGroup(this.tr("UI_TbOptions"), [
            // "% of revenue" is a column of the YTD block — locked while YTD is off
            ...(classicTable ? [this.tbBtn(this.tr("UI_TbPctRev"), ui.pctRev, () => { ui.pctRev = !ui.pctRev; },
                undefined, shownBlocks.has("ytd") ? undefined : this.tr("UI_TbPctRevNoEffect"))] : []),
            this.tbBtn(this.tr("UI_TbHideZero"), ui.hideZero, () => { ui.hideZero = !ui.hideZero; }),
            this.tbBtn(this.tr("UI_TbFit"), ui.fit, () => { ui.fit = !ui.fit; }, this.tr("UI_TbFitTip")),
        ])); }
        return bar;
    }

    private legendChip(style: "ac" | "py" | "pl" | "fc"): HTMLElement {
        const chip = document.createElement("span");
        const base = `display:inline-block;width:${this.kpx(10)};height:${this.kpx(10)};` +
            `margin-right:${this.kpx(5)};vertical-align:-1px;`;
        if (style === "ac") { chip.style.cssText = base + `background:${C.ac};`; }
        // high contrast: PY = AC in colour — the PY chip is dashed like the PY mark
        else if (style === "py" && this.hc) { chip.style.cssText = base + `background:${C.paper};border:1.4px dashed ${C.ac};box-sizing:border-box;`; }
        else if (style === "py") { chip.style.cssText = base + `background:${C.py};`; }
        else if (style === "pl") { chip.style.cssText = base + `background:${C.paper};border:1.4px solid ${C.ac};box-sizing:border-box;`; }
        else {
            chip.style.cssText = base +
                `background:repeating-linear-gradient(45deg,${C.paper},${C.paper} 2px,${C.ac} 2px,${C.ac} 3.2px);` +
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
        // mega table: exactly the scenarios its columns show — value columns,
        // the minuend of every Δ element and the active Δ references — not
        // every bound role (T02F shows PL + FC only)
        const mt = this.megaInView() ? this.megaToggles() : null;
        const mRefs = mt ? activeRefs(mt) : [];
        const shown = new Set<string>();
        if (mt) {
            if (mt.showPY) { shown.add("PY"); }
            if (mt.showPL) { shown.add("PL"); }
            if (mt.showMin || mRefs.length > 0) { shown.add(mt.min); }
            mRefs.forEach(r => shown.add(r));
            // FY outlook (12G): AC&FC is hatched where it is forecast — FC explains the hatch
            const hatchFy = (mt.valueCascade && mt.showMin) || mRefs.some(r => mt.d[r].bar || mt.d[r].wf || mt.d[r].pin);
            if (mt.min === "AC" && hatchFy && this.megaKeys().includes("fy")) { shown.add("FC"); }
        }
        // house terms (labels.labelAc …) replace the "AC actual" wording as a whole
        const lg = (code: "AC" | "PY" | "PL" | "FC", key: string): string =>
            this.houseTerm(code) != null ? " " + this.houseTerm(code) : this.tr(key);
        if (!mt || shown.has("AC")) { item(this.legendChip("ac"), lg("AC", "UI_LgAc")); }
        if (mt ? shown.has("PY") : this.has.py) { item(this.legendChip("py"), lg("PY", "UI_LgPy")); }
        if (mt ? shown.has("PL") : this.has.pl || this.has.plfy) { item(this.legendChip("pl"), lg("PL", "UI_LgPl")); }
        if (mt ? shown.has("FC") : this.has.fc || this.has.fcfy) { item(this.legendChip("fc"), lg("FC", "UI_LgFc")); }
        const g = document.createElement("span");
        const sq = (color: string, hollow = false): HTMLElement => {
            const el = document.createElement("span");
            el.style.cssText = `display:inline-block;width:${this.kpx(10)};height:${this.kpx(10)};` +
                (hollow ? `background:${C.paper};border:1.4px solid ${color};box-sizing:border-box;` : `background:${color};`) +
                `margin:0 ${this.kpx(5)} 0 0;vertical-align:-1px;`;
            return el;
        };
        const fav = document.createElement("span"); fav.appendChild(sq(this.goodColor()));
        fav.appendChild(document.createTextNode(this.tr("UI_LgGood")));
        // high contrast: unfavourable is hollow, as in the mega table
        const unfav = document.createElement("span"); unfav.appendChild(sq(this.badColor(), this.hc != null));
        unfav.appendChild(document.createTextNode(this.tr("UI_LgBad")));
        bar.appendChild(fav); bar.appendChild(unfav); bar.appendChild(g);
        // (high contrast paints no teal — the deviation note would mislead there)
        if (this.varianceMode() !== "ibcs" && !this.hc) {
            const note = document.createElement("span");
            note.style.cssText = "font-style:italic;";
            note.textContent = this.tr(this.varianceMode() === "blueOrange" ? "UI_LgBlueOrange" : "UI_LgTeal");
            bar.appendChild(note);
        }
        // mega table: FC is never an axis there (it is the hatched minuend) —
        // the note names only the references that really draw a Δ axis
        let axesText = this.tr("UI_LgAxes");
        if (mt) {
            const ax = mRefs.filter(r => mt.d[r].bar || mt.d[r].wf || mt.d[r].pin);
            axesText = ax.length === 2 ? this.tr("UI_LgAxesMegaBoth")
                : ax[0] === "PY" ? this.tr("UI_LgAxesMegaPy") : ax[0] === "PL" ? this.tr("UI_LgAxesMegaPl") : "";
        }
        if (axesText) {
            const axes = document.createElement("span");
            axes.style.cssText = "font-style:italic;";
            axes.textContent = this.relabel(axesText);
            bar.appendChild(axes);
        }
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
            ? this.tr("UI_BlkYtd", this.yearPrefix(`${this.monthLabel(months[0])}..${last} (_${mtdMonth})`))
            : this.tr("UI_BlkCurrent");
        const mtdLabel = this.tr("UI_BlkMtd", mtdMonth);
        const fyLabel = this.tr("UI_BlkFy", fyYear);
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
            return this.relabelBlocks(blocks);
        }

        const rM = this.has[ui.ref] ? ui.ref : (this.has.pl ? "pl" : "py");
        // 1.2 preset "custom": the value-column switches build every block
        const custom = ui.preset === "custom";
        if (ui.blocks.mtd && months.length > 1) {
            const mtd: ColSpec[] = custom ? this.customSpecs("mtd", rM) : [{ kind: "val", scen: "ac", block: "mtd", label: "AC" }];
            if (!custom && this.has[rM]) {
                mtd.push({ kind: "val", scen: rM, block: "mtd", label: rM.toUpperCase() });
                mtd.push({ kind: "bar", ref: rM, minuend: "ac", block: "mtd", label: `Δ${rM.toUpperCase()}` });
                mtd.push({ kind: "pin", ref: rM, minuend: "ac", block: "mtd", label: `Δ${rM.toUpperCase()}%` });
            }
            blocks.push({ key: "mtd", label: mtdLabel, specs: mtd });
        }
        const ytd: ColSpec[] = custom ? this.customSpecs("ytd", rM) : [{ kind: "val", scen: "ac", block: "ytd", label: "AC" }];
        if (ui.pctRev && !custom) { ytd.push({ kind: "pct", block: "ytd", label: this.tr("UI_ColPctRev") }); }
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
        } else if (custom && fyOn) {
            // the FY outlook follows the switches as well: AC / FC → AC&FC (FC FY), PL → PL FY, Δ → ΔPL
            const v = ui.vals;
            if (v.ac || v.fc) { fy.push({ kind: "val", scen: "fcfy", block: "fy", label: "FC" }); }
            if (v.pl) { fy.push({ kind: "val", scen: "plfy", block: "fy", label: "PL" }); }
            if (v.d) {
                fy.push({ kind: "bar", ref: "plfy", minuend: "fcfy", block: "fy", label: "ΔPL" });
                fy.push({ kind: "pin", ref: "plfy", minuend: "fcfy", block: "fy", label: "ΔPL%" });
            }
        }
        // the YTD toggle hides the YTD block as soon as another block stays on
        // screen (up to 1.0.0 the classic table ignored it); with nothing else
        // left YTD stays — the toolbar shows that button as on and locked
        if (ui.blocks.ytd || (blocks.length === 0 && fy.length === 0)) {
            blocks.push({ key: "ytd", label: ytdLabel, specs: ytd });
        }
        if (fy.length > 0) { blocks.push({ key: "fy", label: this.tr("UI_BlkFyFc", fyYear), specs: fy }); }
        // 1.2 column category: the column set of the YTD block (else the first
        // block) repeats once per category value in front, under the value as
        // group head; the blocks above follow as the total. % of revenue stays
        // in the total block (its base row is a row of the whole statement).
        if (this.catInView() && blocks.length > 0) {
            const base = blocks.find(b => b.key === "ytd") ?? blocks[0];
            const specs = base.specs.filter(c => c.kind !== "pct");
            const cats: Block[] = this.catModels!.map((cm, i) => ({
                key: base.key, label: cm.label, cat: i, specs: specs.map(c => ({ ...c, cat: i })),
            }));
            const total = blocks.map(b => ({ ...b, label: this.tr("UI_ColCatTotal", b.label) }));
            return this.relabelBlocks([...cats, ...total]);
        }
        return this.relabelBlocks(blocks);
    }

    /**
     * Columns of one block under the preset "custom" (1.2): every switched-on
     * value column of a bound scenario in IBCS order AC · PY · PL · FC (% of
     * revenue next to AC in the YTD block), then Δ bar + Δ% pin of AC against
     * the Δ reference. A block never ends up empty — AC stays as the floor.
     */
    private customSpecs(block: "mtd" | "ytd", ref: Scenario): ColSpec[] {
        const v = this.ui!.vals;
        const out: ColSpec[] = [];
        for (const sc of ["ac", "py", "pl", "fc"] as Scenario[]) {
            if (!v[sc as keyof ValSet] || !this.has[sc]) { continue; }
            out.push({ kind: "val", scen: sc, block, label: sc.toUpperCase() });
            if (sc === "ac" && block === "ytd" && this.ui!.pctRev) {
                out.push({ kind: "pct", block, label: this.tr("UI_ColPctRev") });
            }
        }
        if (v.d && this.has[ref]) {
            out.push({ kind: "bar", ref, minuend: "ac", block, label: `Δ${ref.toUpperCase()}` });
            out.push({ kind: "pin", ref, minuend: "ac", block, label: `Δ${ref.toUpperCase()}%` });
        }
        if (out.length === 0) {
            out.push({ kind: "val", scen: "ac", block, label: "AC" });
            if (block === "ytd" && this.ui!.pctRev) { out.push({ kind: "pct", block, label: this.tr("UI_ColPctRev") }); }
        }
        return out;
    }

    /** which value columns / Δ the classic table shows right now (toggle states of the "Value columns" group) */
    private shownVals(): ValSet {
        const specs = this.colSpecs().filter(b => b.key !== "fy").flatMap(b => b.specs);
        const val = (sc: Scenario): boolean => specs.some(c => c.kind === "val" && c.scen === sc);
        return { ac: val("ac"), py: val("py"), pl: val("pl"), fc: val("fc"), d: specs.some(c => c.kind === "bar" || c.kind === "pin") };
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
        let BAR_HALF = Math.max(34 * k * fscale, FIT_BAR_HALF_MIN);
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
        const pinW = 2 * (PIN_HALF + pLabelW + 4) + 8;
        const valW = Math.round((compact ? 66 : 76) * lk * fscale);

        // shared display-space scale for the value / cascade bars
        let vAxisX = 0; let vPpu = 0; let vLabelW = 0; let vbarW = 0;
        const hasVbar = cols.some(c => c.kind === "vbar");
        if (hasVbar || gc.wf.size > 0) {
            vLabelW = Math.ceil(gc.vLabelLen * (fs * 0.52 + laneSlack)) + 4;
            const full = (gc.wf.size > 0 ? (compact ? 190 : 240) : (compact ? 150 : 190)) * fscale;
            const span = Math.max(full * k, FIT_SPAN_MIN);
            // scale sync (numbers.fixedMax): the value / cascade bars reach at least fixedMax
            const posD = Math.max(gc.maxPosD, this.fixedMax() ?? 0);
            vPpu = span / ((posD + gc.maxNegD) || 1);
            vAxisX = 4 + vLabelW + gc.maxNegD * vPpu;
            vbarW = span + 2 * (vLabelW + 4) + 8;
        }
        // 1.5: same unit, same scale — next to value bars or cascades the Δ
        // bars take the value scale. Δ that reach the lane widen it; Δ that
        // would stay below half a lane are magnified by a round factor
        // (2 · 5 · 10 …) and say so in the head ("ΔPL ×5") and the scale note
        let dPpu = 0; let dMag = 1;
        if (vPpu > 0 && cols.some(c => c.kind === "bar") && maxAbsDelta > 0) {
            const dSpan = maxAbsDelta * vPpu;
            dPpu = vPpu;
            if (dSpan >= BAR_HALF) { BAR_HALF = dSpan; }
            else if (dSpan < BAR_HALF / 2) {
                dMag = niceFactor(BAR_HALF / dSpan * (1 + 1e-9));
                dPpu = vPpu * dMag;
            }
        }
        const barW = 2 * (BAR_HALF + dLabelW + 4) + 8;

        const gapW = Math.round(18 * fscale);
        let colsW = 0;
        for (const c of cols) {
            colsW += pad + (c.kind === "gap" ? gapW
                : c.kind === "val" || c.kind === "pct" ? valW
                    : c.kind === "vbar" || c.kind === "wbar" ? vbarW
                        : c.kind === "bar" ? barW : pinW);
        }
        return { rowH, fs, labelFs, barLabelFs, valLabelFs, BAR_HALF, PIN_HALF, barW, pinW, valW, maxAbsDelta,
            dPpu, dMag, pinZone: gc.pOver,
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
        this.syncScaleNote(geo);

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
        const sig = cols.map(c => `${c.kind}${c.scen ?? ""}${c.ref ?? ""}${c.minuend ?? ""}${c.block ?? ""}${c.cat ?? ""}`).join(",");
        const num = this.settings.numbersCard;
        const keyParts: (string | number | boolean)[] = [this.scanKey(), sig, fmt.div, fmt.suffix,
            num.decimals.value, num.pctDecimals.value, this.locale];
        // 1.2 triangle marks widen the value scale of the bars view
        if (this.settings.columnsCard.barTriangles.value) { keyParts.push("tri"); }
        const key = keyParts.join("~");
        if (this.geoCache && this.geoCache.key === key) { return this.geoCache; }

        let dLabelLen = 2; let pLabelLen = 3; let pOver = false;
        for (const node of model.byId.values()) {
            if (node.row.rowType === "kpi") { continue; }
            for (const c of cols) {
                if (c.cat != null) { continue; }
                if (c.kind === "bar") {
                    const v = this.blockVariance(node, c.block ?? "ytd", c.ref!, c.minuend!);
                    if (v.delta != null) { dLabelLen = Math.max(dLabelLen, fmt.val(v.delta, true).length); }
                } else if (c.kind === "pin") {
                    const v = this.blockVariance(node, c.block ?? "ytd", c.ref!, c.minuend!);
                    // the lane must hold the label the pin really prints: the
                    // UNCAPPED Δ% (+ the overflow marker) — deltaPinCell only
                    // caps the needle at ±40%, never the number. Measuring the
                    // capped value sized the lane for "+40.0%▸" and clipped
                    // "+220.0%▸" (p2). Within ±40% nothing changes.
                    if (v.deltaPct != null) {
                        pLabelLen = Math.max(pLabelLen, (fmt.pct(v.deltaPct, true) + "▸").length);
                        if (Math.abs(v.deltaPct) > 0.4) { pOver = true; }
                    }
                }
            }
        }
        // 1.2 column categories: their Δ labels share the lane widths
        for (const c of cols) {
            if (c.cat == null || (c.kind !== "bar" && c.kind !== "pin")) { continue; }
            const cm = this.catModels?.[c.cat];
            if (!cm) { continue; }
            for (const node of cm.model.byId.values()) {
                if (node.row.rowType === "kpi") { continue; }
                const v = this.blockVariance(node, c.block ?? "ytd", c.ref!, c.minuend!);
                if (c.kind === "bar" && v.delta != null) { dLabelLen = Math.max(dLabelLen, fmt.val(v.delta, true).length); }
                if (c.kind === "pin" && v.deltaPct != null) {
                    pLabelLen = Math.max(pLabelLen, (fmt.pct(v.deltaPct, true) + "▸").length);
                    if (Math.abs(v.deltaPct) > 0.4) { pOver = true; }
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
            for (const c of cols) {
                if (c.kind !== "vbar") { continue; }
                scens.add(c.scen!); scens.add(c.ref!);
                // 1.2 triangle marks: their scenarios share the value scale
                for (const t of this.barTriScens(c)) { scens.add(t); }
            }
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

        this.geoCache = { key, dLabelLen, pLabelLen, vLabelLen, maxPosD, maxNegD, wf, pOver };
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

    private headerRow(cols: ColSpec[], geo: { valW: number; barW: number; pinW: number; vbarW: number; fs: number; gapW: number; dMag: number }): HTMLElement {
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
            // 1.5 scaling indicator: Δ bars magnified against the value bars
            const mag = c.kind === "bar" && geo.dMag > 1 ? " ×" + geo.dMag : "";
            cell.appendChild(document.createTextNode(c.label + mag));
            if (mag) { cell.setAttribute("data-pnl", "scale-mag"); }
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
            // keyboard (1.1): the label cell is the fold control — Tab, Enter / Space
            this.kbFold(name, open, node.row.name, toggle);
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
            err.textContent = " ⚠ " + this.trMsg(node.error);
            name.appendChild(err);
        }
        if (node.row.comment) {
            const n = this.commentNo.get(node.row.id);
            if (n != null) {
                const mark = document.createElement("span");
                mark.style.cssText = `color:${C.comment};font-size:${this.kpx(9.5)};` +
                    `margin-left:${this.kpx(5)};cursor:default;`;
                mark.textContent = String.fromCharCode(0x2460 + n - 1);
                // the comment text travels in the row tooltip (1.1)
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
            inc.title = this.tr("UI_Incomplete");
            name.appendChild(inc);
        }
        // 12M sparkline chip
        if (node.series.ac && this.model!.months.length > 1) {
            const chip = document.createElement("span");
            const active = ui.spark.includes(node.row.id);
            chip.textContent = `${this.model!.months.length}M`;
            chip.style.cssText = `font-size:${this.kpx(8)};margin-left:${this.kpx(6)};` +
                `padding:0 ${this.kpx(4)};cursor:pointer;border-radius:2px;` +
                (active ? `background:${C.ac};color:${C.onInk};` : `border:1px solid ${C.gridSoft};color:${C.soft};`);
            chip.onclick = (e) => {
                e.stopPropagation();
                if (active) { ui.spark = ui.spark.filter(id => id !== node.row.id); }
                else { ui.spark.push(node.row.id); }
                this.persistUi(); this.rerender();
            };
            chip.title = this.tr("UI_SparkTip");
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
        }
        // one tooltip for the whole row — name, scenarios, Δ, comment (1.1)
        const tipBlock = (cols.find(c => c.block === "ytd") ?? cols.find(c => c.block != null))?.block ?? "ytd";
        this.bindTip(row, node, () => this.tipItems(node, fmt, tipBlock, null));
        const mat = this.materiality();
        const selected = canSelect && this.isSelected(node);
        if (selected) { row.setAttribute("data-pnl-sel", "1"); }
        const accent = this.accent();

        const lineTop = isSum && !isRatio;
        for (const c of cols) {
            if (c.kind === "gap") { row.appendChild(this.cell(geo.gapW, "center", geo.fs)); continue; }
            let cell: HTMLElement;
            if (c.cat != null) {
                // 1.2 column category: the same row in that category's model
                cell = this.catCell(node, c, fmt, geo, isSum, isRatio, mat);
                if (lineTop && c.kind !== "val") { cell.style.borderTop = `1px solid ${C.line}`; }
            } else if (c.kind === "val") {
                cell = this.cell(geo.valW, "right", geo.fs);
                cell.style.cssText += "font-variant-numeric:tabular-nums;";
                if (isSum) { cell.style.fontWeight = "600"; }
                const bv = isRatio ? this.blockDisplay(node, c.block ?? "ytd", c.scen!)
                    : this.valDisplay(node, c.block ?? "ytd", c.scen!, fmt);
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
                // below materiality (columns.materialityAbs / Pct): soft ink; margin rows are exempt
                const soft = !isRatio && mat(v.delta, v.deltaPct);
                if (isRatio) {
                    cell = this.cell(c.kind === "bar" ? geo.barW : geo.pinW, "center", geo.fs - 1);
                    if (c.kind === "bar" && v.delta != null) {
                        cell.style.color = v.good ? this.goodColor() : this.badColor();
                        cell.style.fontStyle = "italic";
                        cell.textContent = (v.delta > 0 && !this.finance() ? "+" : "") + fmt.pct(v.delta, this.finance()).replace("%", "pp");
                    }
                } else if (c.kind === "bar") {
                    cell = this.deltaBarCell(v, c, geo, fmt, soft,
                        this.ssDelta(node, c.block ?? "ytd", c.ref!, c.minuend!, fmt));
                } else {
                    cell = this.deltaPinCell(v, c, geo, fmt, soft);
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
        // highlight band (columns.highlight, IBCS EMPHASIZE): ink at 7 % over every column
        if (this.isHighlighted(node)) {
            row.setAttribute("data-pnl-hl", "1");
            const band = this.inkAlpha(0.07);
            const kids = row.children;
            for (let i = 0; i < kids.length; i++) { (kids[i] as HTMLElement).style.background = band; }
        }
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

    /**
     * One cell of a column-category block (1.2): value, Δ bar or Δ% pin of the
     * row as its category model computes it — same notation, same uniform Δ
     * scale. A row the category does not carry stays empty. Sum-safe rounding
     * is a property of the total block and is not applied here.
     */
    private catCell(node: PnlNode, c: ColSpec, fmt: Fmt, geo: TableGeo, isSum: boolean, isRatio: boolean,
        mat: (d: number | null, p: number | null) => boolean): HTMLElement {
        const w = c.kind === "val" || c.kind === "pct" ? geo.valW : c.kind === "bar" ? geo.barW : geo.pinW;
        const n = this.catNode(c.cat!, node);
        if (!n) { return this.cell(w, c.kind === "val" ? "right" : "left", geo.fs); }
        if (c.kind === "val") {
            const cell = this.cell(geo.valW, "right", geo.fs);
            cell.style.cssText += "font-variant-numeric:tabular-nums;";
            if (isSum) { cell.style.fontWeight = "600"; }
            const bv = this.blockDisplay(n, c.block ?? "ytd", c.scen!);
            cell.textContent = isRatio ? fmt.pct(bv) : fmt.val(bv);
            return cell;
        }
        const v = this.blockVariance(n, c.block ?? "ytd", c.ref!, c.minuend!);
        if (isRatio) {
            const cell = this.cell(c.kind === "bar" ? geo.barW : geo.pinW, "center", geo.fs - 1);
            if (c.kind === "bar" && v.delta != null) {
                cell.style.color = v.good ? this.goodColor() : this.badColor();
                cell.style.fontStyle = "italic";
                cell.textContent = (v.delta > 0 && !this.finance() ? "+" : "") + fmt.pct(v.delta, this.finance()).replace("%", "pp");
            }
            return cell;
        }
        const soft = mat(v.delta, v.deltaPct);
        return c.kind === "bar" ? this.deltaBarCell(v, c, geo, fmt, soft) : this.deltaPinCell(v, c, geo, fmt, soft);
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
        r.setAttribute("width", "4"); r.setAttribute("height", "4"); r.setAttribute("fill", C.paper);
        const l = document.createElementNS(ns, "rect");
        l.setAttribute("width", "1.8"); l.setAttribute("height", "4"); l.setAttribute("fill", color);
        p.appendChild(r); p.appendChild(l); defs.appendChild(p); svg.appendChild(defs);
    }

    private deltaBarCell(v: { delta: number | null; good: boolean }, c: ColSpec,
        geo: { rowH: number; fs: number; barLabelFs: number; BAR_HALF: number; barW: number; maxAbsDelta: number; dPpu: number }, fmt: Fmt,
        soft = false, labelDelta: number | null = null): HTMLElement {
        const cell = this.cell(geo.barW, "left", geo.fs);
        if (v.delta == null) { return cell; }
        const w = geo.barW - 8; const h = geo.rowH - 4; const mid = w / 2;
        // next to value bars / cascades the value scale (1.5), else the uniform Δ scale
        const frac = geo.dPpu > 0 ? Math.min(Math.abs(v.delta) * geo.dPpu / geo.BAR_HALF, 1)
            : geo.maxAbsDelta > 0 ? Math.min(Math.abs(v.delta) / geo.maxAbsDelta, 1) : 0;
        const len = Math.max(frac * geo.BAR_HALF, v.delta === 0 ? 0 : 1.5);
        const x = v.delta >= 0 ? mid : mid - len;
        const color = soft ? C.soft : v.good ? this.goodColor() : this.badColor();
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
        txt.setAttribute("fill", color);
        // sum-safe rounding: the label is the difference of the printed values
        txt.textContent = fmt.val(labelDelta ?? v.delta, true);
        svg.appendChild(txt);
        cell.appendChild(svg);
        return cell;
    }

    private deltaPinCell(v: { deltaPct: number | null; good: boolean }, c: ColSpec,
        geo: { rowH: number; fs: number; barLabelFs: number; PIN_HALF: number; pinW: number; pinZone: boolean }, fmt: Fmt,
        soft = false): HTMLElement {
        const cell = this.cell(geo.pinW, "left", geo.fs);
        if (v.deltaPct == null) { return cell; }
        const w = geo.pinW - 8; const h = geo.rowH - 4; const mid = w / 2;
        const cap = 0.4;
        const clamped = this.capPct(v.deltaPct);
        const overflow = Math.abs(v.deltaPct) > cap;
        // 1.5 (IBCS UN 5.3): with an outlier anywhere in the table, ±40 % take
        // the inner 80 % of the lane; a pin beyond runs on into the outlier
        // zone, is cut by a break mark and ends in a triangle — before, it
        // stopped exactly where +40 % stops
        const reg = geo.pinZone ? geo.PIN_HALF * 0.8 : geo.PIN_HALF;
        const dir = v.deltaPct >= 0 ? 1 : -1;
        const px = overflow && geo.pinZone ? mid + dir * geo.PIN_HALF : mid + (clamped / cap) * reg;
        const color = soft ? C.soft : v.good ? this.goodColor() : this.badColor();
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
        let tip = px;
        if (overflow && geo.pinZone) {
            // break mark just past the regular maximum, triangle in growth direction
            const xb = mid + dir * (reg + 2);
            const brk = document.createElementNS(ns, "path");
            brk.setAttribute("d", [0, 2.5].map(o => `M${xb + dir * o - 1.5},${h / 2 + 3} L${xb + dir * o + 1.5},${h / 2 - 3}`).join(" "));
            brk.setAttribute("stroke", C.paper); brk.setAttribute("stroke-width", "1.4"); brk.setAttribute("fill", "none");
            brk.setAttribute("data-pnl", "pin-break");
            svg.appendChild(brk);
            const tw = 4.5;
            const tri = document.createElementNS(ns, "path");
            tri.setAttribute("d", `M${px + dir * tw},${h / 2} L${px},${h / 2 - 3.2} L${px},${h / 2 + 3.2} Z`);
            tri.setAttribute("fill", color);
            tri.setAttribute("data-pnl", "pin-outlier");
            svg.appendChild(tri);
            tip = px + dir * tw;
        } else {
            const head = document.createElementNS(ns, "circle");
            head.setAttribute("cx", String(px)); head.setAttribute("cy", String(h / 2));
            head.setAttribute("r", overflow ? "2" : "2.8");
            // pin head carries the minuend's scenario fill (IBCS): FC → outlined
            if (c.minuend === "fcfy") {
                head.setAttribute("fill", C.paper); head.setAttribute("stroke", color); head.setAttribute("stroke-width", "1.4");
            } else { head.setAttribute("fill", color); }
            svg.appendChild(head);
        }
        const txt = document.createElementNS(ns, "text");
        const anchor = v.deltaPct >= 0 ? "start" : "end";
        const tx = v.deltaPct >= 0 ? Math.max(tip + 4, mid + 4) : Math.min(tip - 4, mid - 4);
        txt.setAttribute("x", String(tx)); txt.setAttribute("y", String(h / 2 + geo.fs * 0.32));
        txt.setAttribute("text-anchor", anchor);
        txt.setAttribute("font-size", String(geo.barLabelFs)); txt.setAttribute("font-family", FONT);
        txt.setAttribute("fill", color);
        // the triangle marks the outlier; without the zone the "▸" of 1.4 stays
        txt.textContent = fmt.pct(v.deltaPct, true) + (overflow && !geo.pinZone ? "▸" : "");
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
        // the shared cascade geometry of waterfall.ts in parent-first ("value")
        // mode: root formulas anchor, nested formulas carry no segment
        const node = (n: PnlNode, root: boolean): CascadeNode => {
            const t = n.row.rowType;
            const skip = t === "kpi" || t === "separator" || (!root && t === "formula");
            return {
                id: n.row.id,
                value: skip ? null : read(n),
                anchor: root && t === "formula",
                children: skip ? [] : n.children.map(c => node(c, false)),
            };
        };
        return cascade(this.model!.roots.map(r => node(r, true)), "value");
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
        const fill = scen === "ac" ? C.ac : scen === "py" ? C.py : isPlan ? C.paper : `url(#${pid})`;
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

    /**
     * 1.2 bars view: the scenarios a value-bar column marks with triangles —
     * every further bound scenario (PY · PL · FC) except the reference that
     * already draws a bar. The FY block has its one pair (AC&FC vs PL FY).
     */
    private barTriScens(c: ColSpec): Scenario[] {
        if (!this.settings.columnsCard.barTriangles.value || c.kind !== "vbar" || c.block === "fy") { return []; }
        return (["py", "pl", "fc"] as Scenario[]).filter(sc => sc !== c.ref && this.has[sc]);
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
        const cc = this.settings.columnsCard;
        const overlap = cc.barOverlap.value;
        const tris = this.barTriScens(c).map(sc => ({ sc, v: displayValue(node, sc) })).filter(t => t.v != null);
        // 1.2 triangle marks sit in a strip above the bars — the bars give up that strip
        const triS = tris.length > 0 ? Math.max(3.5, Math.min(6, (h - 3) * 0.3)) : 0;
        const top = 1.5 + (triS > 0 ? triS + 0.5 : 0);
        const band = h - 1.5 - top;
        const refIsPlan = c.ref === "pl" || c.ref === "plfy";
        // the new modes draw the reference in full scenario notation (FC hatched);
        // the default path keeps its 1.1 pixels
        const notation = overlap || triS > 0;
        const refFc = c.ref === "fc";
        if (notation && refFc && r != null) { this.hatchPattern(svg, ns, pid + "r", C.ac); }
        const refFill = refIsPlan ? C.paper : refFc ? `url(#${pid}r)` : C.py;
        const refStroke = refIsPlan || refFc ? C.ac : null;
        if (overlap) {
            // 1.2 ChartKitchen notation: equal bars, OFFSET instead of nested —
            // the reference behind (top), AC in front (bottom) at full strength
            const bh = band * 0.78;
            if (r != null) { bar(r, top, bh, refFill, refStroke); }
            if (v != null) { bar(v, top + band - bh, bh, hatch ? `url(#${pid})` : C.ac, hatch ? C.ac : null); }
        } else {
            // reference behind (IBCS comparison: subtrahend behind the minuend)
            if (r != null) {
                if (notation) { bar(r, top, band, refFill, refStroke); }
                else { bar(r, 1.5, h - 3, refIsPlan ? C.paper : C.py, refIsPlan ? C.ac : null); }
            }
            // minuend on top, narrower (AC solid / FC hatched)
            if (v != null) {
                const bh = (triS > 0 ? band : h - 3) * 0.58;
                const y = triS > 0 ? top + (band - bh) / 2 : (h - bh) / 2;
                bar(v, y, bh, hatch ? `url(#${pid})` : C.ac, hatch ? C.ac : null);
            }
        }
        // 1.2 triangle marks: one per further scenario, tip down at its value (CK drawPyTriangle)
        for (const t of tris) {
            const x = geo.vAxisX + t.v! * geo.vPpu;
            const poly = document.createElementNS(ns, "polygon");
            poly.setAttribute("data-pnl", "bar-tri-" + t.sc);
            poly.setAttribute("points", `${x - triS * 0.8},${top - triS} ${x + triS * 0.8},${top - triS} ${x},${top}`);
            // shape notation, not colour alone: PY filled gray, PL hollow, FC hatched
            let fill: string = C.py; let stroke: string = C.soft;
            if (t.sc === "pl") { fill = C.paper; stroke = C.ac; }
            else if (t.sc === "fc") { this.hatchPattern(svg, ns, pid + "t", C.ac); fill = `url(#${pid}t)`; stroke = C.ac; }
            poly.setAttribute("fill", fill);
            poly.setAttribute("stroke", stroke);
            poly.setAttribute("stroke-width", t.sc === "py" ? "0.8" : "1");
            poly.setAttribute("stroke-linejoin", "round");
            svg.appendChild(poly);
        }
        // structure baseline
        const axis = document.createElementNS(ns, "line");
        axis.setAttribute("x1", String(geo.vAxisX)); axis.setAttribute("x2", String(geo.vAxisX));
        axis.setAttribute("y1", "0"); axis.setAttribute("y2", String(h));
        axis.setAttribute("stroke", C.ac); axis.setAttribute("stroke-width", "1");
        svg.appendChild(axis);
        // AC label outside the longer of both bars (and the triangle marks), in growth direction
        const lv = v ?? r;
        if (lv != null) {
            const extent = Math.max(Math.abs(v ?? 0), Math.abs(r ?? 0),
                ...tris.filter(t => (t.v! >= 0) === (lv >= 0)).map(t => Math.abs(t.v!) + triS * 0.8 / (geo.vPpu || 1))) * geo.vPpu;
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
            n.row.name = this.tr("UI_Total");
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
        return { fill: this.cardPaper(), stroke: C.ac };
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
    /**
     * 1.5 (IBCS 2.0 / ISO 24896, UN 5.2): the scale a card chart of the tree
     * draws at. `key` = unit + card mode ("amt:months", "pct:delta" …). In the
     * measuring pass (treeScl.collect) the card records its own fit (px per
     * unit); while drawing it gets the shared scale of its unit — the smallest
     * fit, so every card fits — or, when its data would cover less than a
     * quarter of its room at that scale, a round multiple (2 · 5 · 10 …) that
     * the card names as "×5". Outside a tree (hover zoom, tile) treeScl is
     * null: the chart keeps its own fit.
     */
    private treeScaleOf(key: string, fit: number, extent: number, room: number): { ppu: number; mag: number } {
        const sc = this.treeScl;
        if (!sc || !isFinite(fit) || fit <= 0) { return { ppu: fit, mag: 1 }; }
        if (sc.collect) {
            sc.fit.set(key, Math.min(sc.fit.get(key) ?? Infinity, fit));
            return { ppu: fit, mag: 1 };
        }
        const shared = Math.min(sc.fit.get(key) ?? fit, fit);
        if (extent * shared < 0.25 * room && fit >= 2 * shared * (1 - 1e-9)) {
            const m = niceFactor(fit / shared * (1 + 1e-9));
            if (m >= 2) { sc.mags++; return { ppu: shared * m, mag: m }; }
        }
        return { ppu: shared, mag: 1 };
    }

    /** 1.5: the scaling indicator of a magnified card chart — "×5" in its top right corner */
    private treeMagMark(g: SVGGElement, box: { x: number; y: number; w: number; h: number }, mag: number, s: number): void {
        if (mag <= 1) { return; }
        const ns = "http://www.w3.org/2000/svg";
        const t = document.createElementNS(ns, "text");
        t.setAttribute("x", (box.x + box.w).toFixed(2));
        t.setAttribute("y", (box.y + 6.5 * s).toFixed(2));
        t.setAttribute("text-anchor", "end");
        t.setAttribute("font-size", (7 * s).toFixed(1));
        t.setAttribute("font-family", FONT);
        t.setAttribute("font-weight", "600");
        t.setAttribute("fill", C.soft);
        t.setAttribute("data-pnl", "tree-mag");
        t.setAttribute("data-factor", String(mag));
        t.textContent = "×" + mag;
        const tt = document.createElementNS(ns, "title");
        tt.textContent = this.tr("UI_TreeMagTip", mag);
        t.appendChild(tt);
        g.appendChild(t);
    }

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
        // 1.5: one scale per unit across the cards (or a marked magnification)
        const sc = this.treeScaleOf((isRatio ? "pct" : "amt") + ":months", (bot - top) / (max - min), max - min, bot - top);
        const yOf = (v: number): number => bot - (v - min) * sc.ppu;
        const zeroY = yOf(0);
        this.treeMagMark(g, box, sc.mag, s);

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
        // 1.5: one scale per unit across the cards (or a marked magnification)
        const sc = this.treeScaleOf((isRatio ? "pct" : "amt") + ":delta", (bot - top) / (max - min), max - min, bot - top);
        const yOf = (v: number): number => bot - (v - min) * sc.ppu;
        const zeroY = yOf(0);
        this.treeMagMark(g, box, sc.mag, s);

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
        // 1.5: one scale per unit across the cards (or a marked magnification)
        const sc = this.treeScaleOf((isRatio ? "pct" : "amt") + ":bridge", availW / ((hi - lo) || 1), (hi - lo) || 1, availW);
        const S = sc.ppu;
        const xz = x0 + (0 - lo) * S;
        this.treeMagMark(g, { x: box.x, y: box.y - 1.5 * s, w: box.w, h: box.h }, sc.mag, s);
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
            const fill = isPlan ? this.cardPaper() : isFc ? `url(#${this.treeHatchId(svg)})` : C.py;
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
        this.applyPalette();
        const ns = "http://www.w3.org/2000/svg";
        const isRatio = node.row.rowType === "kpi";
        const unit = isRatio ? "%" : (fmt.suffix + this.settings.numbersCard.unitText.value).trim();
        const zk = this.fontScale();
        const W = this.k(396); const inner = W - this.k(26);
        const box = document.createElement("div");
        box.style.cssText = `position:absolute;z-index:40;width:${W}px;background:${this.cardBg()};` +
            `border:1px solid ${C.cardEdge};border-radius:6px;` +
            `box-shadow:${C.zoomShadow};` +
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
        // 1.5: the hover zoom is a magnifying glass — its charts keep their own scale, and say so
        caption(this.tr("UI_ZoomOwnScale"));
        caption(this.tr("UI_CapMonths", refUp));
        chart(this.k(104), (g, svg) => this.treeMini(g, node, { x: 0, y: 2, w: inner, h: this.k(100) }, zs, fmt, svg, 0));
        caption(this.tr("UI_CapDelta", refUp));
        chart(this.k(72), (g) => this.treeMiniDelta(g, node, { x: 0, y: 2, w: inner, h: this.k(68) }, zs, fmt, 0));
        caption(this.tr("UI_CapBridge", refUp));
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
            er.textContent = "⚠ " + this.trMsg(node.error);
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
        shade.setAttribute("stroke", C.shadeRest); shade.setAttribute("stroke-width", "2");
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
            shade.setAttribute("stroke", C.shadeHover);
        });
        g.addEventListener("mouseleave", () => {
            if (!selCard) { box.setAttribute("stroke", C.cardEdge); }
            shade.setAttribute("stroke", C.shadeRest);
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
            rt.textContent = this.tr("UI_ShowRoot");
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
            const err = card.node.error ? " ⚠ " + this.trMsg(card.node.error) : "";
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
        zt.textContent = this.tr("UI_OpenTile");
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
            e.textContent = this.fitLabel("⚠ " + this.trMsg(card.node.error), geo.cw - 2 * pad, 7 * s);
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
            bt.textContent = this.tr("UI_Budget", card.moreKids);
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
            hit.setAttribute("fill", this.cardPaper());
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
                ? this.tr("UI_Expand")
                : this.tr("UI_Collapse");
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
                this.tr("UI_ZoomInto"));
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
            `border:1px solid ${C.cardEdge};border-radius:6px;box-shadow:${C.shadow};` +
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
            nm.title = this.tr("UI_SetSel") + this.selCapNote(node);
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
            note(this.tr("UI_RatioNote", refUp));
            const h = Math.max(Math.round(this.zoomChartH * 0.55), Math.round(150 * k));
            chart(h, (g, svg) => this.treeMini(g, node,
                { x: 1, y: 4, w: inner - 2, h: h - 30 }, 1.5 * k * sc, fmt, svg, 0));
        } else {
            const h = this.zoomChartH;
            chart(h, (g, svg) => this.treeZoomCombo(g, node,
                { x: 1, y: 2, w: inner - 2, h: h - 6 }, 1.25 * k * sc, fmt, svg));
        }
        // 1.5: the tile is a magnifying glass of one card — its chart keeps its
        // own scale and says so in its top right corner (no extra line: the
        // tile is fitted to the page height)
        const zsvgs = tile.querySelectorAll("svg");
        const zsvg = zsvgs.length ? zsvgs[zsvgs.length - 1] : null;
        if (zsvg) {
            const t = document.createElementNS(ns, "text");
            t.setAttribute("x", String(inner - 2)); t.setAttribute("y", String(Math.round(9 * k)));
            t.setAttribute("text-anchor", "end");
            t.setAttribute("font-size", (8 * k).toFixed(1));
            t.setAttribute("font-family", FONT);
            t.setAttribute("fill", C.soft);
            t.setAttribute("data-pnl", "zoom-own-scale");
            t.textContent = this.tr("UI_ZoomOwnScale");
            zsvg.appendChild(t);
        }
        const skipped = isRatio ? 0 : this.treeMissingMonths(node);
        if (skipped > 0) {
            // months without actuals and without a forecast are not zero months:
            // they carry no step, no column and no pin, and the comparison the
            // badge reports runs over the months that do have data
            note(this.tr("UI_Skipped", skipped));
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
            er.textContent = "⚠ " + this.trMsg(node.error);
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
            ? this.tr("UI_FeedsInto")
            : this.tr("UI_DrivenBy"));
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
                ? this.tr("UI_TopOfTree")
                : this.tr("UI_NoDrivers");
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
        // 1.5: the micro cards of a column share one scale per unit (measuring
        // pass first, magnified cards say "×5"), like the cards of the tree
        const shown = items.slice(0, TREE_ZOOM_CARDS_MAX);
        this.treeScl = { collect: true, fit: new Map(), mags: 0 };
        for (const it of shown) { this.treeMicroCard(it.node, it.op, fmt, w, side); }
        this.treeScl.collect = false;
        for (const it of shown) {
            list.appendChild(this.treeMicroCard(it.node, it.op, fmt, w, side));
        }
        this.treeScl = null;

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
            down.textContent = "▼ " + this.tr("UI_More", hidden);
        };
        this.pagerSync.push(sync);

        col.appendChild(up);
        col.appendChild(list);
        col.appendChild(down);
        list.addEventListener("scroll", sync);
        if (more > 0) {
            const rest = document.createElement("div");
            rest.style.cssText = `font-size:${this.kpx(9.5)};color:${C.soft};flex:0 0 auto;padding-top:4px;`;
            rest.textContent = "+" + this.tr("UI_More", more);
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
        card.title = this.tr("UI_ZoomInto");
        card.style.cssText = `background:${this.cardBg()};border:1px solid ${C.cardEdge};` +
            (edge ? `border-left:3px solid ${edge};` : "") +
            `border-radius:4px;box-shadow:${C.shadow};transition:${TRANSITION};` +
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
        const rest = selMicro ? `0 0 0 2px ${this.accent()}` : C.shadow;
        card.onmouseenter = (): void => { sides(C.cardEdgeHover); card.style.boxShadow = C.shadowHover; };
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
            this.treeHint(g, box, s, this.tr("UI_NoWidth"));
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
                t.setAttribute("stroke", this.cardPaper()); t.setAttribute("stroke-width", "2.6");
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
        label(box.x, box.y + hfs, this.tr("UI_ComboCaption", refUp, fcSum !== 0 ? "/FC" : ""),
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
                rect(x - r, yEnd - r, 2 * r, 2 * r, hollow ? this.cardPaper() : color, color, 1)
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
            label(xTot + totW / 2, (acTop + axisY) / 2 + lfs * 0.35, num(acSum), lfs, C.onInk);
            label(xTot + totW + 3 * s, (acTop + axisY) / 2 + lfs * 0.35, "AC", cfs, C.soft, "start");
        }
        label(cxTot, yOf(vTot) - 3 * s, num(vTot), lfs, C.text, "middle", "600");
        label(cxTot, yBase + cfs + 4 * s, fcSum !== 0 ? "AC+FC" : "AC", cfs, C.soft);

        // ---------------- total variance badge
        const bh = lfs + 9 * s;
        const bcx = box.x + box.w - badgeW / 2;
        const bcy = Math.min(Math.max((yOf(refSum) + yOf(vTot)) / 2, plotTop + bh / 2), yBase - bh / 2);
        const bg = rect(bcx - badgeW / 2, bcy - bh / 2, badgeW, bh, this.cardPaper(), totColor, 1.6);
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
            hint.textContent = this.tr("UI_TreeNeedsRows");
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
            }, this.tr("UI_BackToCard")));
        }

        const note = document.createElement("div");
        note.style.cssText = `font-size:${this.kpx(9)};color:${C.soft};margin:0;padding:0;line-height:1.5;`;
        note.textContent = this.tr("UI_TreeHint")
            + (this.interactive() ? this.tr("UI_TreeHintInteract") : "");
        // 1.5: folded control bars take the hint line along (the cards keep their ×n marks)
        if (!this.tbFolded()) { wrap.appendChild(note); }

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
            c.setAttribute("r", r.toFixed(2)); c.setAttribute("fill", C.paper);
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
        // 1.5: one scale per unit across the cards — a measuring pass on a
        // detached svg collects every card's own fit, the drawing pass then
        // uses the smallest one (magnified cards say "×5")
        this.treeScl = { collect: true, fit: new Map(), mags: 0 };
        const scratch = document.createElementNS(ns, "svg") as SVGSVGElement;
        for (const c of all) {
            if (!c.compact) { this.treeCardG(c, { cw, s, fmt, svg: scratch }, false); }
        }
        this.treeScl.collect = false;
        for (const c of all) {
            // any branching card can become the root — formula rows as well as
            // subtotals that open into their account hierarchy
            inner.appendChild(this.treeCardG(c, { cw, s, fmt, svg }, c !== rootCard && c.hasKids));
        }
        const mags = this.treeScl.mags;
        this.treeScl = null;
        // the hint line names the rule — and the magnified cards when there are any
        note.textContent += " " + this.tr(mags > 0 ? "UI_TreeScaleMag" : "UI_TreeScale");
        note.setAttribute("data-pnl", "tree-scale-note");
        wrap.appendChild(svg);
        return wrap;
    }

    // ---------------- mega table (IBCS templates T01–T04) ----------------

    /**
     * The format-pane switches as one toggle set. Scenarios the data does not
     * carry are switched off here — an unbound PY never leaves an empty column;
     * an unbound FC minuend falls back to AC.
     */
    private megaToggles(): MegaToggles {
        // the reader's scenario view (toolbar, 1.1) on top of the author's switches
        return this.megaReaderView(this.megaPaneToggles(), this.ui);
    }

    /** the format-pane switches alone (no reader view) */
    private megaPaneToggles(): MegaToggles {
        const cc = this.settings.columnsCard;
        const has = this.has;
        const mv = String(cc.minuend.value.value);
        // PL as the analysed scenario (12H plan statement) needs the PL field; FC the FC field
        const min = mv === "fc" && has.fc ? "FC" : mv === "pl" && has.pl ? "PL" : "AC";
        return {
            min,
            showPY: cc.showPY.value && has.py,
            showPL: cc.showPL.value && has.pl,
            showMin: cc.showMinuend.value,
            valueCascade: cc.valueCascade.value,
            d: {
                PY: {
                    num: cc.dPyAbs.value && has.py, bar: cc.dPyBar.value && has.py,
                    wf: cc.dPyWaterfall.value && has.py,
                    pct: cc.dPyPct.value && has.py, pin: cc.dPyPin.value && has.py,
                },
                PL: {
                    num: cc.dPlAbs.value && has.pl, bar: cc.dPlBar.value && has.pl,
                    wf: cc.dPlWaterfall.value && has.pl,
                    pct: cc.dPlPct.value && has.pl, pin: cc.dPlPin.value && has.pl,
                },
            },
            thresholds: cc.thresholds.value,
            marks: cc.scenarioMarks.value,
            labels: cc.chartLabels.value,
            capBars: cc.capBars.value,
            sort: (["cat", "min", "delta"].includes(String(cc.sort.value.value))
                ? String(cc.sort.value.value) : "cat") as MegaToggles["sort"],
            sortBlock: String(cc.sortBlock.value.value) === "period" ? 0 : 1,
            share: cc.pctOfRevenue.value,
        };
    }

    /** the mega table replaces the classic table as soon as one column switch is on */
    private megaOn(): boolean {
        return this.model != null && megaActive(this.megaToggles());
    }

    /** the mega table really renders: switches on AND the table view is active */
    private megaInView(): boolean {
        return this.ui != null && this.ui.view === "table" && this.megaOn();
    }

    /**
     * Template dropdown → switches. A template only writes defaults: the visual
     * notices a template that differs from the last applied one (the hidden
     * property columns.templateApplied), sets every switch of the preset at once
     * — locally, so this very render already shows it — and persists them
     * together with the new templateApplied. Afterwards every switch is free.
     * Echo guard + TTL: until the host echoes the write back, a stale update
     * keeps the written values instead of flipping the pane back for a frame.
     */
    private syncMegaTemplate(dataView: DataView | undefined): void {
        const cc = this.settings.columnsCard;
        const nc = this.settings.numbersCard;
        const objs = dataView?.metadata?.objects?.["columns"];
        const persisted = objs && objs["templateApplied"] != null ? String(objs["templateApplied"]) : "off";
        let applied = persisted;
        const pend = this.megaPending;
        if (pend) {
            let synced = persisted === pend.applied;
            for (const [k, v] of Object.entries(pend.cols)) {
                if (!this.megaSliceIs(k, v)) { synced = false; this.megaSliceSet(k, v); }
            }
            for (const [k, v] of Object.entries(pend.nums)) {
                const sl = k === "decimals" ? nc.decimals : nc.pctDecimals;
                if (sl.value !== v) { synced = false; sl.value = v; }
            }
            for (const [k, v] of Object.entries(pend.title)) {
                const sl = k === "headline" ? this.settings.titleCard.headline : null;
                if (sl && sl.value !== v) { synced = false; sl.value = v; }
            }
            pend.ttl--;
            if (synced || pend.ttl <= 0) { this.megaPending = null; }
            if (!synced && this.megaPending) { applied = pend.applied; }
        }
        const tpl = String(cc.template.value.value);
        // only the host's own confirmation re-arms the session guard — an
        // equality that the pending guard merely pretends must not
        if (tpl === persisted) { this.megaSessionTpl = null; }
        if (tpl === applied) { return; }
        if (!MEGA_PRESETS[tpl] || tpl === this.megaSessionTpl) { return; }
        this.applyMegaTemplate(tpl);
    }

    private applyMegaTemplate(tpl: string, picked = false): void {
        const sw = templateSwitches(tpl);
        const cols: Record<string, boolean | string> = {
            // toolbar pick (1.2): the dropdown itself travels in the same write
            // and under the same pending guard as the switches
            ...(picked ? { template: tpl } : {}),
            ...sw.cols,
        };
        const nums = sw.nums;
        const title = sw.title;
        for (const [k, v] of Object.entries(cols)) { this.megaSliceSet(k, v); }
        const nc = this.settings.numbersCard;
        if (nums.decimals != null) { nc.decimals.value = nums.decimals; }
        if (nums.pctDecimals != null) { nc.pctDecimals.value = nums.pctDecimals; }
        if (title.headline != null) { this.settings.titleCard.headline.value = title.headline; }
        this.megaPending = { applied: tpl, cols, nums, title, ttl: 5 };
        this.megaSessionTpl = tpl;
        const merge: powerbi.VisualObjectInstance[] = [
            { objectName: "columns", selector: null, properties: { ...cols, templateApplied: tpl } },
        ];
        if (tpl !== "off") { merge.push({ objectName: "numbers", selector: null, properties: { ...nums } }); }
        if (title.headline != null) { merge.push({ objectName: "titleBlock", selector: null, properties: { ...title } }); }
        this.host.persistProperties({ merge });
    }

    /** a mega switch of the columns card by property name (toggle or dropdown) */
    private megaSlice(k: string): { value: unknown; items?: powerbi.IEnumMember[] } | null {
        const cc = this.settings.columnsCard as unknown as Record<string, { value: unknown; items?: powerbi.IEnumMember[] }>;
        return cc[k] ?? null;
    }
    private megaSliceIs(k: string, v: boolean | string): boolean {
        const sl = this.megaSlice(k);
        if (!sl) { return true; }
        if (sl.items) { return String((sl.value as powerbi.IEnumMember).value) === String(v); }
        return sl.value === v;
    }
    private megaSliceSet(k: string, v: boolean | string): void {
        const sl = this.megaSlice(k);
        if (!sl) { return; }
        if (sl.items) {
            const it = sl.items.find(x => String(x.value) === String(v));
            if (it) { sl.value = it; }
        } else { sl.value = v; }
    }

    /** statement (GuV) data vs. a pure structure hierarchy (regions, products …) */
    private megaStatement(): boolean {
        for (const n of this.model!.byId.values()) {
            const r = n.row;
            if (r.rowType === "formula" || r.rowType === "kpi" || r.sign < 0 || r.displayInvert) { return true; }
        }
        return false;
    }

    /** raw (calculation-signed) value of a scenario in a period block */
    private megaRaw(node: PnlNode, block: "mtd" | "ytd" | "fy", s: Scenario): number | null {
        // FY outlook: the full-year measures (AC&FC, PL FY) as the engine rolls them
        if (block === "fy") { return node.computed[s] ?? null; }
        if (block === "mtd") {
            const li = this.mtdIndex();
            return li >= 0 ? (node.series[s]?.[li] ?? null) : null;
        }
        // the period-matched YTD window of the classic table (see ytdDisplay)
        if (this.ytdFull() || node.row.rowType === "kpi") { return node.computed[s]; }
        return this.ytdRawSum(node, s);
    }

    /** long month name of a period key ("November"), the author's label otherwise */
    private megaMonthName(m: string): string {
        const p = parsePeriod(m);
        if (p && (/^\d{4}[-/]\d{1,2}/.test(m) || /^\d{1,2}$/.test(m.trim()))) {
            return new Date(p.y ?? 2000, p.m - 1, 1).toLocaleDateString(this.locale, { month: "long" });
        }
        return m;
    }

    /**
     * Rows of the mega table in IBCS statement order: children first, their
     * total below (T01B / T03), spacer rows before a new block. Sign column
     * (statement data): formula rows and the chain start (the first top-level
     * total) read "=", their summands "+" / "−" by DisplayInvert, deeper blocks
     * are indented without a sign (T03 "− Operating expenses").
     */
    private megaRows(statement: boolean): { rows: MegaRow[]; nodes: Map<string, PnlNode> } {
        const model = this.model!; const ui = this.ui!;
        const cc = this.settings.columnsCard;
        const collapsed = new Set(ui.collapsed);
        const showPct = cc.showPctRows.value;
        const subtotals = statement || cc.structureSubtotals.value;
        const nodes = new Map<string, PnlNode>();
        type Item = { node: PnlNode | null; kind: MegaRow["kind"]; level: number; op: string };
        const items: Item[] = [];
        const roots = model.roots;
        const first = roots.find(r => r.row.rowType !== "separator");
        const chainStart = statement && first && first.hasChildren
            && (first.row.rowType === "subtotal" || first.row.rowType === "account") ? first : null;
        const glyph = (n: PnlNode): string => n.row.displayInvert ? "-" : "+";
        const realRoots = roots.filter(r => r.row.rowType !== "separator");
        const soleRoot = realRoots.length === 1 ? realRoots[0] : null;
        const keep = (n: PnlNode): boolean => !(ui.hideZero && isZeroRow(n));

        const emit = (n: PnlNode, under: PnlNode | null): void => {
            const t = n.row.rowType;
            if (t === "separator") { items.push({ node: null, kind: "gap", level: 0, op: "" }); return; }
            if (t === "kpi" && !showPct) { return; }
            const open = n.hasChildren && !collapsed.has(n.row.id);
            if (open) { for (const c of n.children) { emit(c, n); } }
            // structure data without subtotal blocks: only leaves and the top totals
            if (open && !subtotals && n.level > 0) { return; }
            if (!keep(n)) { return; }
            const kind: MegaRow["kind"] = t === "formula" ? "formula" : t === "kpi" ? "pct"
                : t === "subtotal" || n.hasChildren || n.isOrphanBucket ? "sum" : "acc";
            let level = 0; let op = "";
            if (statement) {
                const inChain = chainStart != null && under === chainStart;
                level = Math.max(0, n.level - (inChain || this.megaUnderChain(n, chainStart) ? 1 : 0));
                if (t === "kpi") { op = ""; }
                else if (n.level === 0) { op = t === "formula" || n === chainStart ? "=" : glyph(n); }
                else if (inChain) { op = glyph(n); }
            }
            items.push({ node: n, kind, level, op });
        };
        for (const r of roots) { emit(r, null); }

        // leaf names that repeat ("Other" per region) get their parent's name
        // when the subtotal blocks are folded away (T01A "Other Europe")
        const dupe = new Map<string, number>();
        if (!subtotals) {
            for (const it of items) { if (it.node) { dupe.set(it.node.row.name, (dupe.get(it.node.row.name) ?? 0) + 1); } }
        }

        // comment footnotes are numbered in reading order of this table
        this.comments = [];
        this.commentNo.clear();
        const out: MegaRow[] = [];
        let prev: Item | null = null;
        for (const it of items) {
            if (!it.node) {
                if (out.length && out[out.length - 1].kind !== "gap") { out.push(this.megaGap()); }
                continue;
            }
            const n = it.node;
            // spacer row: a new block after a bold total (T03), and the grand
            // total right below its last subtotal block (T01B "World"). 1.5:
            // structure data with subtotal blocks also separates rows of
            // another parent — a region folded into a single row (Poland,
            // Slovakia: no countries below) no longer sticks to the next
            // block as if it belonged to it — and a grand total that follows
            // such a row (it has subtotal blocks among its children)
            const struct = subtotals && !statement;
            if (prev && prev.node && it.kind !== "pct" && (
                (prev.kind === "sum" || prev.kind === "formula") && it.kind === "acc"
                || it.kind === "sum" && prev.kind === "sum" && prev.node.row.parent === n.row.id && struct
                || struct && prev.kind === "acc" && it.kind === "acc" && prev.node.row.parent !== n.row.parent
                || struct && prev.kind === "acc" && it.kind === "sum" && prev.node.row.parent === n.row.id
                    && n.children.some(c => c.hasChildren)
            )) {
                if (out.length && out[out.length - 1].kind !== "gap") { out.push(this.megaGap()); }
            }
            nodes.set(n.row.id, n);
            const suffix: { t: string; color: string }[] = [];
            if (n.row.comment) {
                const no = this.comments.length + 1;
                this.comments.push({ n: no, node: n, text: n.row.comment });
                this.commentNo.set(n.row.id, no);
                suffix.push({ t: " " + String.fromCharCode(0x2460 + no - 1), color: C.comment });
            }
            if (n.error) { suffix.push({ t: " ⚠ " + this.trMsg(n.error), color: this.badColor() }); }
            if (n.hasChildren && collapsed.has(n.row.id)) { suffix.push({ t: " ▸", color: C.soft }); }
            if (this.awaitingSegment && (it.kind === "sum" || it.kind === "formula" || it.kind === "pct")) {
                suffix.push({ t: " ≈", color: C.loading });
            }
            const parent = n.row.parent ? model.byId.get(n.row.parent) : undefined;
            const name = (dupe.get(n.row.name) ?? 0) > 1 && parent ? `${n.row.name} ${parent.row.name}` : n.row.name;
            // cascades (T04 Δ waterfall, 12A value cascade): "=" rows anchor —
            // formula rows, the statement's chain start, the single grand total
            // of a structure hierarchy; every other row steps with the effect
            // of its shown value on the result
            const anchor = it.kind === "formula" || it.op === "="
                || (!statement && soleRoot === n && it.kind === "sum");
            const disp = n.row.displayInvert ? -1 : 1;
            out.push({
                id: n.row.id,
                label: (n.isOrphanBucket ? "⚠ " : "") + name,
                kind: it.kind, op: it.op, level: it.level,
                group: n.row.parent,
                other: /^(other|others|sonstige|übrige|rest|otros|otras|resto)\b|^その他/i.test(n.row.name.trim()),
                suffix: suffix.length ? suffix : undefined,
                eff: anchor ? disp : disp * this.megaParentSign(n),
                anchor,
            });
            if (it.kind !== "pct") { prev = it; }
        }
        while (out.length && out[out.length - 1].kind === "gap") { out.pop(); }
        return { rows: out, nodes };
    }

    /**
     * Product of the SignConvention of the subtotals above `n` — the engine
     * rolls a subtotal up as sign × Σ children (aggregateSubtotal), a postable
     * parent account adds its children unsigned. Raw value × this = the row's
     * effect on the top of its hierarchy.
     */
    private megaParentSign(n: PnlNode): number {
        let f = 1;
        let pid = n.row.parent;
        const byId = this.model!.byId;
        for (let i = 0; pid != null && i < 64; i++) {
            const p = byId.get(pid);
            if (!p) { break; }
            if (p.row.rowType === "subtotal") { f *= p.row.sign < 0 ? -1 : 1; }
            pid = p.row.parent;
        }
        return f;
    }

    private megaGap(): MegaRow {
        return { id: "", label: "", kind: "gap", op: "", level: 0, group: null, other: false };
    }

    /** true when an ancestor of `n` is the statement's chain start (indent one level less) */
    private megaUnderChain(n: PnlNode, chain: PnlNode | null): boolean {
        if (!chain) { return false; }
        let pid = n.row.parent;
        const byId = this.model!.byId;
        for (let i = 0; pid != null && i < 64; i++) {
            if (pid === chain.row.id) { return true; }
            pid = byId.get(pid)?.row.parent ?? null;
        }
        return false;
    }

    /** locale number text of a non-negative value, narrow space as grouping */
    private megaNum(abs: number, dec: number): string {
        const key = String(dec);
        let nf = this.megaNf.get(key);
        if (!nf) {
            nf = new Intl.NumberFormat(this.locale, { minimumFractionDigits: dec, maximumFractionDigits: dec });
            this.megaNf.set(key, nf);
        }
        return nf.formatToParts(abs).map(p => (p.type === "group" ? NBSP_GROUP : p.value)).join("");
    }

    private megaMeasure(t: string, fs: number, bold: boolean, italic: boolean): number {
        if (!this.measureCtx) {
            const cv = document.createElement("canvas");
            this.measureCtx = cv.getContext("2d");
        }
        const ctx = this.measureCtx;
        if (!ctx) { return t.length * fs * 0.55; }
        ctx.font = `${italic ? "italic " : ""}${bold ? "bold " : ""}${fs}px ${FONT}`;
        return ctx.measureText(t).width;
    }

    private buildMega(fmt: Fmt, shrink: number): HTMLElement {
        const model = this.model!; const ui = this.ui!;
        const cc = this.settings.columnsCard;
        const t = this.megaToggles();
        const statement = this.megaStatement();
        const { rows, nodes } = this.megaRows(statement);
        const months = model.months;
        // period blocks: the period block (default YTD) and, with secondBlock, a
        // second one left of it (default month) — month | YTD | FY outlook each.
        // A kind the data cannot carry (no period field, no FY measures) falls
        // back to YTD / month; the defaults give exactly month | _YTD or YTD.
        type BlockKey = "mtd" | "ytd" | "fy";
        const keys: BlockKey[] = this.megaKeys();
        const twoBlocks = keys.length === 2;
        const li = this.mtdIndex();
        const monthName = months.length > 0 ? this.megaMonthName(months[li >= 0 ? li : months.length - 1]) : "";
        const year = months.length > 0 ? this.periodYear(months[0]) : "";
        const scenOf = (key: BlockKey, s: MegaScen): Scenario | null => this.megaScenOf(key, s);
        const revBase = t.share ? revenueBase(model, cc.revenueBase.value) : null;
        const num = (v: unknown, d: number): number => { const x = Number(v); return isFinite(x) ? x : d; };
        const th = [
            { abs: num(cc.thresholdAbs.value, -20), pct: num(cc.thresholdPct.value, -10) / 100 },
            { abs: num(cc.thresholdYtdAbs.value, -220), pct: num(cc.thresholdYtdPct.value, -10) / 100 },
        ];
        const div = fmt.div;
        const raw = (n: PnlNode, key: BlockKey, s: MegaScen): number | null => {
            const sc = scenOf(key, s);
            return sc == null ? null : this.megaRaw(n, key, sc);
        };
        // sum-safe rounding (numbers.sumSafeRounding): printed value of a non-margin row
        const ssOn = this.sumSafeOn();
        const ssRaw = (n: PnlNode, key: BlockKey, s: MegaScen): number | null => {
            const sc = scenOf(key, s);
            return sc == null ? null : this.ssRaw(n, key, sc, fmt);
        };
        const mat = this.materiality();
        const fyStack = t.min === "AC";
        const blocks: MegaBlock[] = keys.map((key, bi) => ({
            name: key === "fy" ? "FY" + (year ? " " + year : "")
                : !monthName ? "" : key === "mtd" ? monthName : (twoBlocks || !statement ? "_" + monthName : monthName),
            th: th[bi],
            // a single month / FY block names itself (a single YTD statement never did)
            titled: !twoBlocks && key !== "ytd",
            alias: key === "fy" ? { AC: "AC&FC", FC: "FC" } : undefined,
            // 12G: the FY outlook's AC&FC is mostly forecast — its Δ elements are
            // hatched, and its value cascade stacks the YTD actuals (solid) in front
            // of the rest of the year (hatched)
            minFill: key === "fy" && fyStack ? "FC" : undefined,
            ytd: key === "fy" && fyStack ? (r: MegaRow): number | null => {
                const n = nodes.get(r.id);
                if (!n || n.row.rowType === "kpi") { return null; }
                const rv = this.megaRaw(n, "ytd", "ac");
                return rv == null ? null : (n.row.displayInvert ? -rv : rv) / div;
            } : undefined,
            value: (r: MegaRow, s: MegaScen): number | null => {
                const n = nodes.get(r.id);
                if (!n) { return null; }
                const rv = ssOn && n.row.rowType !== "kpi" ? (ssRaw(n, key, s) ?? raw(n, key, s)) : raw(n, key, s);
                if (rv == null) { return null; }
                const v = n.row.displayInvert ? -rv : rv;
                return n.row.rowType === "kpi" ? v : v / div;
            },
            delta: (r: MegaRow, min: MegaScen, ref: MegaRef): MegaDelta | null => {
                const n = nodes.get(r.id);
                if (!n) { return null; }
                const D = displayVariance(n.row, raw(n, key, min), raw(n, key, ref));
                if (!D) { return null; }
                if (D.pp) { return D; }
                const out: MegaDelta = { ...D, d: D.d / div, impact: D.impact / div };
                if (ssOn) {
                    // the printed Δ is the difference of the printed values
                    const a = ssRaw(n, key, min); const b = ssRaw(n, key, ref);
                    if (a != null && b != null) {
                        out.d = (a - b) * (n.row.displayInvert ? -1 : 1) / div;
                        out.impact = (a - b) * (n.row.varianceInvert ? -1 : 1) / div;
                    }
                }
                if (mat(D.d, D.p)) { out.immaterial = true; }
                return out;
            },
            // "% of revenue": share of the minuend in the revenue base row of this block
            share: revBase ? (r: MegaRow): number | null => {
                const n = nodes.get(r.id);
                if (!n) { return null; }
                const v = raw(n, key, t.min); const b = raw(revBase, key, t.min);
                return v == null || b == null || b === 0 ? null : Math.abs(v / b);
            } : undefined,
        }));
        const fscale = this.fontScale();
        const fs = Math.round((ui.density === "compact" ? 11 : 13) * fscale);
        const avail = (this.root.clientWidth || 1000) - 2 * TABLE_PAD_X - shrink;
        // style.headerFontSize reaches the mega heads too: 9 px is the built-in
        // head size of the classic table, so the factor v / 9 scales fs; 0 (or
        // anything outside 7..20) keeps the heads at fs exactly
        const hv = Math.round(Number(this.settings.styleCard.headerFontSize.value) || 0);
        const headFs = hv < 7 || hv > 20 ? fs : Math.round(fs * hv / 9 * 10) / 10;
        const L = layoutMega({
            rows, blocks, t, statement, fs, viewW: Math.max(320, avail),
            dec: this.settings.numbersCard.decimals.value,
            pdec: this.settings.numbersCard.pctDecimals.value,
            num: (a, d) => this.megaNum(a, d),
            measure: (s, f, b, i) => this.megaMeasure(s, f, b, i),
            pal: { good: this.goodColor(), bad: this.badColor() },
            redIf: this.tr("UI_RedIf"),
            shareHead: this.tr("UI_ColPctRev"),
            headFs,
            hc: this.hc != null,
            fin: this.finance(),
            relabel: this.hasHouseTerms() ? (x: string) => this.relabel(x) : undefined,
            ytdHead: "YTD",
            // scale sync (numbers.fixedMax / fixedVarMax): data units → display units
            fixedMax: this.fixedMax() != null ? this.fixedMax()! / div : undefined,
            fixedVarMax: this.fixedVarMax() != null ? this.fixedVarMax()! / div : undefined,
        });
        const ns = "http://www.w3.org/2000/svg";
        const opts: MegaPaintOpts = {
            font: FONT,
            headInk: this.hc ? this.hc.fg : this.settings.styleCard.headerColor.value?.value || C.text,
            hatchPattern: (svg, id, color) => this.hatchPattern(svg, ns, id, color),
            uid: this.uid,
            selectedId: this.interactive() ? this.selKey : null,
            // high contrast: no wash, the 2 px selection line in foregroundSelected
            selWash: this.hc ? "none" : this.accentSoft(0.94),
            selAccent: this.accent(),
            highlight: this.highlightSet().size > 0
                ? { ids: new Set(rows.filter(r => r.id !== "" && nodes.has(r.id) && this.isHighlighted(nodes.get(r.id)!)).map(r => r.id)),
                    ink: this.hc ? this.hc.fg : C.ac, hc: this.hc != null }
                : undefined,
        };
        // virtualization (1.1): a long statement paints only the rows around the
        // viewport; an export always prints every row
        const virt = L.R.length > MEGA_VIRT_MIN_ROWS && !this.exporting();
        const win = virt ? { from: 0, to: Math.min(L.R.length,
            Math.ceil((this.root.clientHeight || 800) / Math.max(1, L.G.rowH)) + 2 * MEGA_VIRT_BUFFER) } : undefined;
        const painted = paintMega(L, win ? { ...opts, window: win } : opts);
        const bind = (hits: MegaPainted["hits"]): void => this.megaBindHits(hits, nodes, fmt, keys, t, scenOf);
        bind(painted.hits);
        this.megaVs = win ? { L, opts, body: painted.body, from: win.from, to: win.to, bind } : null;

        const wrap = document.createElement("div");
        wrap.setAttribute("data-pnl", "mega");
        wrap.style.cssText = `padding:2px ${TABLE_PAD_X}px 8px ${TABLE_PAD_X}px;width:max-content;`;
        // 1.5: the scale note above the table — magnified blocks / columns and
        // fixed scales are named for every reader, the export included
        // (the gallery's mini previews stay quiet: their heads carry the factor)
        const note = this.miniQuiet() || this.tbFolded() ? null : this.megaScaleNote(L, fmt);
        if (note) { wrap.appendChild(note); }
        const headWrap = document.createElement("div");
        headWrap.setAttribute("data-pnl", "mega-head-wrap");
        headWrap.style.cssText = `background:${this.pageBg()};`;
        headWrap.appendChild(painted.head);
        wrap.appendChild(headWrap);
        wrap.appendChild(painted.body);
        this.tableEl = null;
        return wrap;
    }

    /** interactions of the mega hit areas: the label folds a block, the rest of the row selects */
    private megaBindHits(hits: MegaPainted["hits"], nodes: Map<string, PnlNode>, fmt: Fmt,
        keys: ("mtd" | "ytd" | "fy")[], t: MegaToggles,
        scenOf: (key: "mtd" | "ytd" | "fy", s: MegaScen) => Scenario | null): void {
        const ui = this.ui!;
        for (const h of hits) {
            const node = nodes.get(h.r.id);
            if (!node) { continue; }
            const canSelect = this.selectable(node);
            if (canSelect) {
                h.cells.style.cursor = "pointer";
                this.bindSelect(h.cells, node, true);
            }
            // row tooltip (1.1) over the numbers, bars, pins and cascades of the row
            const tipKey = keys[keys.length - 1];
            const tipMin: Scenario = scenOf(tipKey, t.min) ?? "ac";
            const tipRefs = (activeRefs(t).length ? activeRefs(t) : (["PY", "PL"] as MegaRef[]).filter(r => r !== t.min))
                .map(r => scenOf(tipKey, r)).filter((x): x is Scenario => x != null && this.has[x]);
            this.bindTip(h.cells, node, () => this.tipItems(node, fmt, tipKey, { min: tipMin, refs: tipRefs }));
            this.bindTip(h.label, node, () => this.tipItems(node, fmt, tipKey, { min: tipMin, refs: tipRefs }));
            if (node.hasChildren) {
                h.label.style.cursor = "pointer";
                const open = !ui.collapsed.includes(node.row.id);
                const fold = (e: Event): void => {
                    e.stopPropagation();
                    if (open) { ui.collapsed.push(node.row.id); }
                    else { ui.collapsed = ui.collapsed.filter(id => id !== node.row.id); }
                    this.persistUi(); this.rerender();
                };
                h.label.addEventListener("click", fold);
                // keyboard (1.1): the label hit area is the fold control
                this.kbFold(h.label, open, node.row.name, fold);
                if (canSelect) { this.bindSelect(h.label, node, false); }
            } else if (canSelect) {
                h.label.style.cursor = "pointer";
                this.bindSelect(h.label, node, true);
            } else {
                h.label.setAttribute("pointer-events", "none");
            }
        }
    }

    /**
     * Scroll of a virtualized mega table: repaint the body around the viewport
     * once the visible rows leave the painted window (with a buffer on both
     * sides) — the layout is reused, the hit areas are bound again.
     */
    private syncMegaWindow(): void {
        const vs = this.megaVs;
        if (!vs || !vs.body.isConnected) { return; }
        const R = vs.L.R;
        if (R.length === 0) { return; }
        // body pixel 0 = layout y headH (the body svg's viewBox starts there)
        const top = this.root.getBoundingClientRect().top - vs.body.getBoundingClientRect().top + vs.L.headH;
        const viewH = this.root.clientHeight || 800;
        const at = (y: number): number => {
            let lo = 0; let hi = R.length - 1;
            while (lo < hi) {
                const mid = (lo + hi) >> 1;
                if (R[mid].y + R[mid].h <= y) { lo = mid + 1; } else { hi = mid; }
            }
            return lo;
        };
        const vf = at(top); const vt = Math.min(R.length, at(top + viewH) + 1);
        if (vf >= vs.from && vt <= vs.to) { return; }
        const from = Math.max(0, vf - MEGA_VIRT_BUFFER);
        const to = Math.min(R.length, vt + MEGA_VIRT_BUFFER);
        const painted = paintMega(vs.L, { ...vs.opts, window: { from, to } });
        vs.body.replaceWith(painted.body);
        vs.body = painted.body; vs.from = from; vs.to = to;
        vs.bind(painted.hits);
    }

    /** the period blocks of the mega table, left to right (see buildMega) */
    private megaKeys(): ("mtd" | "ytd" | "fy")[] {
        type BlockKey = "mtd" | "ytd" | "fy";
        const cc = this.settings.columnsCard;
        const months = this.model!.months;
        const kindOf = (v: unknown): BlockKey => v === "month" ? "mtd" : v === "fy" ? "fy" : "ytd";
        const okK = (k: BlockKey): boolean => k === "mtd" ? months.length > 0 : k === "fy" ? this.has.fcfy : true;
        const bk = kindOf(String(cc.blockKind.value.value)); const lk = kindOf(String(cc.leftBlockKind.value.value));
        const main: BlockKey = okK(bk) ? bk : "ytd";
        const left: BlockKey = okK(lk) ? lk : "mtd";
        const twoBlocks = cc.secondBlock.value && left !== main && okK(left)
            && (months.length > 1 || (left !== "mtd" && main !== "mtd"));
        return twoBlocks ? [left, main] : [main];
    }

    /** scenario of a mega block: FY outlook = AC&FC (fcfy), PL FY, PY of the whole year */
    private megaScenOf(key: "mtd" | "ytd" | "fy", s: MegaScen): Scenario | null {
        const SC: Record<MegaScen, Scenario> = { AC: "ac", FC: "fc", PY: "py", PL: "pl" };
        if (key !== "fy") { return SC[s]; }
        // PY of the FY outlook = the whole previous year, as in the classic FY block (12G "ΔPY" on the year)
        return s === "PY" ? (this.has.py ? "py" : null) : s === "PL" ? (this.has.plfy ? "plfy" : null) : "fcfy";
    }

    /** numbers.fixedMax / fixedVarMax in data units (k/m/b suffixes); null = automatic */
    private fixedMax(): number | null {
        return parseAmount(String(this.settings?.numbersCard?.fixedMax?.value ?? ""));
    }
    private fixedVarMax(): number | null {
        return parseAmount(String(this.settings?.numbersCard?.fixedVarMax?.value ?? ""));
    }

    // ---------------- 1.1 Paket B: finance features ----------------

    /** numbers.financeFormat — (1 234) instead of -1 234 */
    private finance(): boolean {
        return this.settings?.numbersCard?.financeFormat?.value === true;
    }

    /** numbers.sumSafeRounding — printed children add up to the printed subtotal */
    private sumSafeOn(): boolean {
        return this.settings?.numbersCard?.sumSafeRounding?.value === true;
    }

    /**
     * Sum-safe raw value of a row in a period block (calculation sign, a multiple
     * of the display quantum); null = no value, a margin row, or the switch off.
     * One largest-remainder pass per block × scenario × unit × decimals and
     * render (engine.sumSafeRound).
     */
    private ssRaw(node: PnlNode, block: "mtd" | "ytd" | "fy", scen: Scenario, fmt: Fmt): number | null {
        if (!this.sumSafeOn() || node.row.rowType === "kpi" || !this.model) { return null; }
        const dec = this.settings.numbersCard.decimals.value;
        const key = `${block}|${scen}|${fmt.div}|${dec}`;
        let m = this.ssCache.get(key);
        if (!m) {
            m = sumSafeRound(this.model.roots, n => this.megaRaw(n, block, scen), fmt.div / Math.pow(10, dec));
            this.ssCache.set(key, m);
        }
        return m.get(node.row.id) ?? null;
    }

    /** value column of the classic table: the sum-safe value when the switch is on */
    private valDisplay(node: PnlNode, block: "mtd" | "ytd" | "fy", scen: Scenario, fmt: Fmt): number | null {
        const r = this.ssRaw(node, block, scen, fmt);
        if (r == null) { return this.blockDisplay(node, block, scen); }
        return node.row.displayInvert ? -r : r;
    }

    /** classic Δ label under sum-safe rounding: printed minuend − printed reference (raw); null = exact */
    private ssDelta(node: PnlNode, block: "mtd" | "ytd" | "fy", ref: Scenario, minuend: Scenario, fmt: Fmt): number | null {
        const a = this.ssRaw(node, block, minuend, fmt);
        const b = this.ssRaw(node, block, ref, fmt);
        return a == null || b == null ? null : a - b;
    }

    /**
     * Materiality (columns.materialityAbs / Pct, ChartKitchen materialityFn):
     * true = the Δ stays below a set threshold and is dampened to the soft ink.
     * `d` is the raw Δ (data units, before k / m scaling), `p` the Δ ratio.
     * With both thresholds a Δ must exceed both to keep its colour.
     */
    private materiality(): (d: number | null, p: number | null) => boolean {
        const cc = this.settings.columnsCard;
        const mAbs = Number(cc.materialityAbs.value) || 0;
        const mPct = Number(cc.materialityPct.value) || 0;
        if (mAbs <= 0 && mPct <= 0) { return () => false; }
        return (d, p) => {
            if (d == null && p == null) { return false; }
            if (mAbs > 0 && d != null && Math.abs(d) < mAbs) { return true; }
            return mPct > 0 && p != null && Math.abs(p * 100) < mPct;
        };
    }

    /** columns.highlight as a lower-case set of row names / ids */
    private highlightSet(): Set<string> {
        const raw = String(this.settings?.columnsCard?.highlight?.value ?? "");
        return new Set(raw.split(",").map(x => x.trim().toLowerCase()).filter(x => x !== ""));
    }

    private isHighlighted(node: PnlNode): boolean {
        const hl = this.highlightSet();
        return hl.size > 0 && (hl.has(node.row.name.trim().toLowerCase()) || hl.has(node.row.id.trim().toLowerCase()));
    }

    /** the ink (C.ac) as rgba — ChartKitchen's emphasis band is ink at 7 % */
    private inkAlpha(a: number): string {
        const hex = C.ac.replace("#", "");
        const full = hex.length === 3 ? hex.split("").map(ch => ch + ch).join("") : hex;
        if (!/^[0-9a-fA-F]{6}$/.test(full)) { return `rgba(64,64,64,${a})`; }
        const n = (i: number): number => parseInt(full.slice(i * 2, i * 2 + 2), 16);
        return `rgba(${n(0)},${n(1)},${n(2)},${a})`;
    }

    // ---- house terms (labels.labelAc …) ----

    /** the author's term for a scenario code, null = the IBCS code */
    private houseTerm(code: "AC" | "PY" | "PL" | "FC"): string | null {
        const lc = this.settings?.labelsCard;
        if (!lc) { return null; }
        const v = (code === "AC" ? lc.labelAc : code === "PY" ? lc.labelPy : code === "PL" ? lc.labelPl : lc.labelFc).value;
        const t = String(v ?? "").trim();
        return t === "" ? null : t;
    }

    private hasHouseTerms(): boolean {
        return (["AC", "PY", "PL", "FC"] as const).some(c => this.houseTerm(c) != null);
    }

    /**
     * Rewrites the scenario codes of a generated label ("ΔPY%", "AC&FC",
     * "FY 2026 · FC vs PL") with the house terms. Only whole codes are
     * replaced — a letter on either side keeps the text (PLAN, EBITDA …).
     * Without any house term the text comes back untouched.
     */
    private relabel(text: string): string {
        if (!text || !this.hasHouseTerms()) { return text; }
        return text.replace(/(?<![A-Za-z])(AC|PY|PL|FC)(?![A-Za-z])/g,
            (m: string) => this.houseTerm(m as "AC") ?? m);
    }

    private relabelBlocks(blocks: Block[]): Block[] {
        if (!this.hasHouseTerms()) { return blocks; }
        for (const b of blocks) {
            b.label = this.relabel(b.label);
            for (const c of b.specs) { c.label = this.relabel(c.label); }
        }
        return blocks;
    }

    // ---- tooltips (host tooltipService, dark: own overlay) ----

    /**
     * Tooltip items of one row: name, the bound scenarios of the block, Δ per
     * reference (absolute and %), materiality note, comment and the selection
     * cap. `mega` = the minuend and references of the mega table (display
     * orientation, %p for margin rows); null = the classic table (Δ vs the
     * toolbar reference, calculation orientation like its bars).
     */
    private tipItems(node: PnlNode, fmt: Fmt, block: "mtd" | "ytd" | "fy",
        mega: { min: Scenario; refs: Scenario[] } | null): VisualTooltipDataItem[] {
        const out: VisualTooltipDataItem[] = [{ displayName: this.tr("UI_TipRow"), value: node.row.name }];
        const ratio = node.row.rowType === "kpi";
        const unit = fmt.suffix + this.settings.numbersCard.unitText.value;
        const u = (s: string): string => ratio || !unit ? s : s + " " + unit;
        const code = (s: Scenario): string => s === "fcfy" ? "AC&FC" : s === "plfy" ? "PL" : s.toUpperCase();
        // mega FY outlook: PY of the whole year is a block scenario too (12G)
        const scens: Scenario[] = block === "fy" ? (mega ? ["fcfy", "py", "plfy"] : ["fcfy", "plfy"]) : ["ac", "py", "pl", "fc"];
        for (const sc of scens) {
            if (!this.has[sc]) { continue; }
            const ss = this.ssRaw(node, block, sc, fmt);
            const raw = ss ?? this.megaRaw(node, block, sc);
            if (raw == null) { continue; }
            const disp = node.row.displayInvert ? -raw : raw;
            out.push({ displayName: this.relabel(code(sc)), value: ratio ? fmt.pct(disp) : u(fmt.val(disp)) });
        }
        const min: Scenario = mega ? mega.min : block === "fy" ? "fcfy" : "ac";
        const refs: Scenario[] = mega ? mega.refs
            : [block === "fy" ? "plfy" : (this.has[this.ui!.ref] ? this.ui!.ref : (this.has.pl ? "pl" : "py"))];
        const mat = this.materiality();
        let soft = false;
        for (const ref of refs) {
            if (!this.has[ref]) { continue; }
            const a = this.megaRaw(node, block, min); const r = this.megaRaw(node, block, ref);
            const name = "Δ" + this.relabel(code(ref));
            if (mega) {
                const D = displayVariance(node.row, a, r);
                if (!D) { continue; }
                if (D.pp) {
                    out.push({ displayName: name, value: fmt.pct(D.d / 100, true).replace("%", "%p") });
                    continue;
                }
                const sa = this.ssRaw(node, block, min, fmt); const sb = this.ssRaw(node, block, ref, fmt);
                const d = sa != null && sb != null ? (sa - sb) * (node.row.displayInvert ? -1 : 1) : D.d;
                out.push({ displayName: name, value: u(fmt.val(d, true)) });
                if (D.p != null) { out.push({ displayName: name + " %", value: fmt.pct(D.p, true) }); }
                soft = soft || mat(D.d, D.p);
            } else {
                const v = varianceOf(a, r, node.row.varianceInvert);
                if (v.delta == null) { continue; }
                if (ratio) {
                    out.push({ displayName: name, value: fmt.pct(v.delta, true).replace("%", "pp") });
                    continue;
                }
                out.push({ displayName: name, value: u(fmt.val(this.ssDelta(node, block, ref, min, fmt) ?? v.delta, true)) });
                if (v.deltaPct != null) { out.push({ displayName: name + " %", value: fmt.pct(v.deltaPct, true) }); }
                soft = soft || mat(v.delta, v.deltaPct);
            }
        }
        if (soft) {
            out.push({ displayName: this.tr("UI_TipMateriality"), value: this.tr("UI_TipMaterialityBelow") });
        }
        if (node.row.comment) {
            const no = this.commentNo.get(node.row.id);
            out.push({
                displayName: (no != null ? String.fromCharCode(0x2460 + no - 1) + " " : "") + this.tr("UI_TipComment"),
                value: node.row.comment,
            });
        }
        if (this.selectable(node) && this.selCapNote(node) !== "") {
            out.push({ displayName: this.tr("UI_Selection"), value: this.tr("UI_SelCap", SEL_MAX_ROWS) });
        }
        return out;
    }

    /**
     * Hover tooltip of an element: the host's tooltipService in light mode
     * (report-page tooltips get the row's identities), a self-drawn dark box
     * in dark mode (ChartKitchen showDarkTip — the host tooltip keeps the
     * report's light styling and would glare on a dark page).
     */
    private bindTip(el: HTMLElement | SVGElement, node: PnlNode, items: () => VisualTooltipDataItem[]): void {
        const svc = this.tooltipService;
        if (!svc && !this.dark) { return; }
        const ids = (): ISelectionId[] => (this.selectable(node) ? this.selIdsFor(node) : []);
        el.addEventListener("mouseover", (e: Event) => {
            const me = e as MouseEvent;
            if (this.dark) { this.showDarkTip(items(), me); return; }
            svc?.show({ dataItems: items(), identities: ids(), coordinates: [me.clientX, me.clientY], isTouchEvent: false });
        });
        el.addEventListener("mousemove", (e: Event) => {
            const me = e as MouseEvent;
            if (this.dark) { this.moveDarkTip(me); return; }
            svc?.move({ dataItems: items(), identities: ids(), coordinates: [me.clientX, me.clientY], isTouchEvent: false });
        });
        el.addEventListener("mouseout", () => {
            if (this.dark) { this.hideDarkTip(); return; }
            svc?.hide({ immediately: false, isTouchEvent: false });
        });
    }

    private showDarkTip(items: VisualTooltipDataItem[], e: MouseEvent): void {
        if (!this.darkTip || !this.darkTip.isConnected) {
            const d = document.createElement("div");
            d.setAttribute("data-pnl", "dark-tip");
            d.style.cssText = "position:absolute;z-index:40;pointer-events:none;"
                + "background:#2B2B2B;color:#E8E8E8;border:1px solid #5A5A5A;"
                + "border-radius:4px;box-shadow:0 2px 10px rgba(0,0,0,0.45);"
                + `padding:7px 10px;font-family:${FONT};font-size:11px;`
                + "line-height:1.5;max-width:280px;";
            this.root.appendChild(d);
            this.darkTip = d;
        }
        const d = this.darkTip;
        while (d.firstChild) { d.removeChild(d.firstChild); }
        items.forEach((it, i) => {
            const row = document.createElement("div");
            if (i === 0) {
                // first item is the row — the header of the tooltip
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

    /** next to the cursor, flipped to the other side instead of leaving the visual */
    private moveDarkTip(e: MouseEvent): void {
        const d = this.darkTip;
        if (!d) { return; }
        const r = this.root.getBoundingClientRect();
        let x = e.clientX - r.left + 14;
        let y = e.clientY - r.top + 14;
        if (x + d.offsetWidth > r.width - 4) { x = Math.max(4, e.clientX - r.left - d.offsetWidth - 14); }
        if (y + d.offsetHeight > r.height - 4) { y = Math.max(4, e.clientY - r.top - d.offsetHeight - 14); }
        // the root scrolls — the box lives in its content coordinates
        d.style.left = `${x + this.root.scrollLeft}px`;
        d.style.top = `${y + this.root.scrollTop}px`;
    }

    private hideDarkTip(): void {
        if (this.darkTip) { this.darkTip.remove(); this.darkTip = null; }
    }

    // ---- keyboard (supportsKeyboardFocus) ----

    /** focus ring colour: the accent, high contrast the host's selection colour */
    private ringColor(): string {
        return this.hc ? this.hc.sel : this.accent();
    }

    /** a 2 px ring while the element has KEYBOARD focus (:focus-visible) — mouse focus stays quiet */
    private kbRing(el: HTMLElement): void {
        el.addEventListener("focus", () => {
            let kb = true;
            try { kb = el.matches(":focus-visible"); } catch { kb = true; }
            if (!kb) { return; }
            el.style.outline = `2px solid ${this.ringColor()}`;
            el.style.outlineOffset = "1px";
        });
        el.addEventListener("blur", () => { el.style.outline = ""; el.style.outlineOffset = ""; });
    }

    /**
     * A fold control for the keyboard: tabindex 0, role button, aria-expanded,
     * Enter / Space fold or unfold. HTML cells get the outline ring, the SVG
     * hit rect of the mega table a 2 px stroke (SVG elements draw no outline).
     */
    private kbFold(el: HTMLElement | SVGElement, open: boolean, name: string, act: (e: Event) => void): void {
        el.setAttribute("tabindex", "0");
        el.setAttribute("role", "button");
        el.setAttribute("aria-expanded", open ? "true" : "false");
        el.setAttribute("aria-label", name);
        el.setAttribute("data-pnl-kb", "fold");
        el.addEventListener("keydown", (e: Event) => {
            const k = (e as KeyboardEvent).key;
            if (k === "Enter" || k === " " || k === "Spacebar") { e.preventDefault(); act(e); }
        });
        if (el instanceof HTMLElement) { this.kbRing(el); return; }
        el.addEventListener("focus", () => {
            el.setAttribute("stroke", this.ringColor());
            el.setAttribute("stroke-width", "2");
        });
        el.addEventListener("blur", () => { el.removeAttribute("stroke"); el.removeAttribute("stroke-width"); });
    }

    // ---- mega table: the reader's scenario view (toolbar group "Scenario") ----

    /** signature of the pane's Δ / value switches — a change resets the reader's reference view */
    private megaPaneSig(): string {
        const cc = this.settings.columnsCard;
        return [cc.showPY, cc.showPL, cc.dPyAbs, cc.dPyBar, cc.dPyWaterfall, cc.dPyPct, cc.dPyPin,
            cc.dPlAbs, cc.dPlBar, cc.dPlWaterfall, cc.dPlPct, cc.dPlPin].map(x => (x.value ? "1" : "0")).join("");
    }

    /**
     * The reader's view over the author's toggles: the analysed scenario AC / FC
     * and the reference view. A reference view keeps the author's Δ elements
     * (the union over PY and PL: number, bars, waterfall, Δ%, pins) and moves
     * them to the chosen reference(s); a PY / PL value column follows the same
     * way. Unbound scenarios never appear.
     */
    private megaReaderView(t: MegaToggles, ui: UiState | null): MegaToggles {
        if (!ui) { return t; }
        let out = t;
        if (ui.megaMin === "fc" && this.has.fc) { out = { ...out, min: "FC" }; }
        else if (ui.megaMin === "ac") { out = { ...out, min: "AC" }; }
        if (ui.megaRef !== "") {
            const a = t.d.PY; const b = t.d.PL;
            const uni = {
                num: a.num || b.num, bar: a.bar || b.bar, wf: a.wf || b.wf, pct: a.pct || b.pct, pin: a.pin || b.pin,
            };
            const off = { num: false, bar: false, wf: false, pct: false, pin: false };
            const py = ui.megaRef !== "pl" && this.has.py;
            const pl = ui.megaRef !== "py" && this.has.pl;
            const val = t.showPY || t.showPL;
            out = { ...out, d: { PY: py ? { ...uni } : { ...off }, PL: pl ? { ...uni } : { ...off } }, showPY: val && py, showPL: val && pl };
        }
        // 1.2 the reader's value columns (toolbar group "Value columns") come last
        const mv = ui.megaVals;
        if (mv) {
            out = { ...out, showMin: !!mv.min, showPY: !!mv.py && this.has.py, showPL: !!mv.pl && this.has.pl };
        }
        return out;
    }

    /** what a scenario view puts on screen — equal signatures = a click changes nothing */
    private megaViewSig(t: MegaToggles): string {
        const usesMin = t.showMin || activeRefs(t).length > 0 || !!t.share;
        return JSON.stringify([buildColumns(t, 1).map(c => c.type + (c.scen ?? "") + (c.ref ?? "")), usesMin ? t.min : ""]);
    }

    /** toolbar groups "Analysed scenario" (AC / FC, with the FC field) and "Reference view" (ΔPY · ΔPL · both) */
    private megaScenarioGroups(): HTMLElement[] {
        const ui = this.ui!;
        const base = this.megaPaneToggles();
        const cur = this.megaViewSig(this.megaReaderView(base, ui));
        const live = (mut: (u: UiState) => void): boolean => {
            const trial: UiState = { ...ui };
            mut(trial);
            return this.megaViewSig(this.megaReaderView(base, trial)) !== cur;
        };
        const locked = this.tr("UI_TbScenNoEffect");
        const view = this.megaReaderView(base, ui);
        const groups: HTMLElement[] = [];
        if (this.has.fc) {
            const btn = (m: "ac" | "fc"): HTMLElement => {
                const code = m === "ac" ? "AC" : "FC";
                const on = view.min === code;
                return this.tbBtn(this.relabel(code), on, () => { ui.megaMin = m; }, undefined,
                    on || live(u => { u.megaMin = m; }) ? undefined : locked);
            };
            groups.push(this.tbGroup(this.tr("UI_TbMinuend"), [btn("ac"), btn("fc")]));
        }
        const refs = activeRefs(view);
        const shownRef: "" | "py" | "pl" | "both" = refs.length === 2 ? "both" : refs[0] === "PY" ? "py" : refs[0] === "PL" ? "pl" : "";
        const rb: HTMLElement[] = [];
        const refBtn = (r: "py" | "pl" | "both", label: string): HTMLElement => {
            const on = shownRef === r;
            return this.tbBtn(label, on, () => { ui.megaRef = r; }, undefined,
                on || live(u => { u.megaRef = r; }) ? undefined : locked);
        };
        if (this.has.py) { rb.push(refBtn("py", "Δ" + this.relabel("PY"))); }
        if (this.has.pl) { rb.push(refBtn("pl", "Δ" + this.relabel("PL"))); }
        if (this.has.py && this.has.pl) { rb.push(refBtn("both", this.tr("UI_TbRefBoth"))); }
        if (rb.length > 0) { groups.push(this.tbGroup(this.tr("UI_TbRefView"), rb)); }
        return groups;
    }

    /**
     * 1.2 toolbar group "Value columns" of the mega table: the value column of
     * the analysed scenario, PY and PL as independent switches on top of the
     * author's switches (and of the reader's reference view). A click that
     * changes nothing — or would leave the mega table without any column, which
     * would drop back to the classic table — is locked.
     */
    private megaValuesGroup(): HTMLElement | null {
        const ui = this.ui!;
        const base = this.megaPaneToggles();
        const view = this.megaReaderView(base, ui);
        const cur = this.megaViewSig(view);
        const shown: MegaVals = { min: view.showMin, py: view.showPY, pl: view.showPL };
        const flip = (u: UiState, k: keyof MegaVals): void => { u.megaVals = { ...shown, [k]: !shown[k] }; };
        const live = (k: keyof MegaVals): boolean => {
            const trial: UiState = { ...ui };
            flip(trial, k);
            const t = this.megaReaderView(base, trial);
            return megaActive(t) && this.megaViewSig(t) !== cur;
        };
        const locked = this.tr("UI_TbValNoEffect");
        const btn = (k: keyof MegaVals, label: string): HTMLElement =>
            this.tbBtn(this.relabel(label), shown[k], () => flip(ui, k), undefined, live(k) ? undefined : locked);
        const out: HTMLElement[] = [btn("min", view.min)];
        if (this.has.py) { out.push(btn("py", "PY")); }
        if (this.has.pl && view.min !== "PL") { out.push(btn("pl", "PL")); }
        const g = this.tbGroup(this.tr("UI_TbValues"), out);
        g.setAttribute("data-pnl", "tb-values");
        return g;
    }

    // ---- title block: auto message, footers ----

    /**
     * IBCS SAY, generated (ChartKitchen buildAutoMessage): the variance of the
     * result row against the reference of the view, plus the strongest and
     * the weakest driver (leaf rows, ranked by their effect: favourable Δ up,
     * unfavourable down). Mega table: its minuend and first reference, display
     * orientation; classic: AC vs the toolbar reference. YTD window.
     * 1.5: one complete sentence (IBCS SAY: a message, not a keyword list) —
     * "EBIT liegt 691 Tsd. EUR (−29 %) unter Vorjahr; stärkster Treiber ist
     * Lizenzen mit +120, größte Belastung ist Logistik mit −813." The drivers
     * carry the sign of their effect on the result (a cost overrun reads −813,
     * not +813), the amount the unit of the title line.
     */
    private autoMessage(fmt: Fmt): string {
        const model = this.model; const ui = this.ui;
        if (!model || !ui) { return ""; }
        const mt = this.megaInView() ? this.megaToggles() : null;
        let min: Scenario = "ac"; let ref: Scenario;
        // the window of the message: YTD; a mega table laid out as FY outlook speaks about the year (12G)
        let block: "ytd" | "fy" = "ytd";
        if (mt) {
            const r = activeRefs(mt)[0] ?? (mt.showPL && mt.min !== "PL" ? "PL" : mt.showPY ? "PY" : null);
            if (!r) { return ""; }
            const keys = this.megaKeys();
            block = keys[keys.length - 1] === "fy" ? "fy" : "ytd";
            const mm = this.megaScenOf(block, mt.min); const rr = this.megaScenOf(block, r);
            if (!mm || !rr) { return ""; }
            min = mm; ref = rr;
        } else {
            ref = this.has[ui.ref] ? ui.ref : this.has.pl ? "pl" : "py";
        }
        if (!this.has[ref]) { return ""; }
        const dv = (n: PnlNode): { d: number; p: number | null; good: boolean } | null => {
            const a = this.megaRaw(n, block, min); const r = this.megaRaw(n, block, ref);
            if (mt) {
                const D = displayVariance(n.row, a, r);
                return D && !D.pp ? { d: D.d, p: D.p, good: D.good } : null;
            }
            const v = varianceOf(a, r, n.row.varianceInvert);
            return v.delta == null ? null : { d: v.delta, p: v.deltaPct, good: v.good };
        };
        const roots = model.roots.filter(r => r.row.rowType !== "separator" && r.row.rowType !== "kpi");
        const formulas = roots.filter(r => r.row.rowType === "formula" && dv(r) != null);
        const result = formulas.length > 0 ? formulas[formulas.length - 1]
            : roots.length === 1 ? roots[0] : syntheticTotal(model);
        const total = dv(result);
        if (!total) { return ""; }
        const unit = this.titleUnit(fmt);
        const code = ref === "plfy" ? "PL" : ref.toUpperCase();
        // the reference by name ("Vorjahr", "Plan"); house terms (labels.labelPy …) win
        const refName = this.relabel(code) !== code ? this.relabel(code) : this.tr(code === "PY" ? "UI_AutoRefPY" : "UI_AutoRefPL");
        const name = result.row.name || this.tr("UI_AutoResult");
        const amount = fmt.val(Math.abs(total.d)) + (unit ? " " + unit : "") + (total.p != null ? ` (${fmt.pct(total.p, true)})` : "");
        let sentence = total.d === 0 ? this.tr("UI_AutoEq", name, refName)
            : this.tr(total.d > 0 ? "UI_AutoAbove" : "UI_AutoBelow", name, amount, refName);
        const drivers: { n: PnlNode; score: number }[] = [];
        for (const n of model.byId.values()) {
            if (n.hasChildren || n.row.rowType !== "account") { continue; }
            const v = dv(n);
            if (!v || v.d === 0) { continue; }
            drivers.push({ n, score: v.good ? Math.abs(v.d) : -Math.abs(v.d) });
        }
        const tail: string[] = [];
        if (drivers.length >= 3) {
            drivers.sort((x, y) => y.score - x.score);
            const best = drivers[0]; const worst = drivers[drivers.length - 1];
            // the effect on the result: favourable +, unfavourable − (a cost overrun is −813)
            if (best !== worst && best.score > 0) { tail.push(this.tr("UI_AutoBest", best.n.row.name, fmt.val(best.score, true))); }
            if (best !== worst && worst.score < 0) { tail.push(this.tr("UI_AutoWorst", worst.n.row.name, fmt.val(worst.score, true))); }
        }
        if (tail.length) { sentence += this.tr("UI_AutoJoin") + tail.join(this.tr("UI_AutoAnd")); }
        return sentence + this.tr("UI_AutoEnd");
    }

    /**
     * 1.5: the unit of the title's measure line ("… in Tsd. EUR" → "Tsd. EUR",
     * "… en kEUR", "…単位：kEUR") — the generated message names amounts the way
     * the title does. Without an author line (or a recognisable unit in it) the
     * visual's own unit: scaling suffix + numbers.unitText ("kEUR").
     */
    private titleUnit(fmt: Fmt): string {
        const own = fmt.suffix + this.settings.numbersCard.unitText.value;
        const line = this.settings.titleCard.measureLine.value.trim();
        const m = /(?:\s(?:in|en)\s+|単位[:：]\s*)([^\s].{0,18}?)\s*$/i.exec(line);
        return m ? m[1] : own;
    }

    /** first non-empty value of the bound filterInfo text measure */
    private readFilterInfo(dataView: DataView): string | null {
        const col = (dataView.categorical?.values ?? []).find(v => v.source.roles && v.source.roles["filterInfo"]);
        if (!col) { return null; }
        for (const v of col.values) {
            if (v != null && String(v).trim() !== "") { return String(v).trim(); }
        }
        return null;
    }

    /**
     * The two footer lines of the title block (ChartKitchen footer +
     * filterFooter): the author's free text, then "Filter: <filterInfo> ·
     * <the visual's own state>". Report filters are invisible to custom
     * visuals — the text measure carries them. Both print in exports.
     */
    private titleFooterLines(): string[] {
        const t = this.settings.titleCard;
        if (!t.show.value) { return []; }
        const out: string[] = [];
        const foot = t.footer.value.trim();
        if (foot) { out.push(foot); }
        if (t.filterFooter.value) {
            const parts: string[] = [];
            if (this.filterInfo) { parts.push(this.filterInfo); }
            const ui = this.ui;
            if (ui && ui.hideZero) { parts.push(this.tr("UI_FootZeroHidden")); }
            if (ui && this.megaInView() && (ui.megaMin !== "" || ui.megaRef !== "")) {
                const v = this.megaToggles();
                const refs = activeRefs(v);
                parts.push(this.relabel(v.min + (refs.length ? " vs " + refs.join(" · ") : "")));
            }
            if (parts.length > 0) { out.push(this.tr("UI_FootFilter") + ": " + parts.join(" · ")); }
        }
        return out;
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
        h.textContent = this.tr("UI_FootHead");
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
            li.textContent = loading ? w : "⚠ " + this.trMsg(w);
            box.appendChild(li);
        }
        this.root.appendChild(box);
    }

    private buildFooter(): HTMLElement {
        const f = document.createElement("div");
        f.style.cssText = `padding:10px 14px 12px 14px;border-top:1px solid ${C.gridSoft};` +
            `margin-top:8px;font-size:${this.kpx(8.5)};color:${C.soft};line-height:1.5;` +
            `max-width:${this.k(960)}px;`;
        const vm = this.varianceMode();
        const dev = vm !== "ibcs" && !this.hc ? this.tr(vm === "blueOrange" ? "UI_FooterDevBo" : "UI_FooterDev") : "";
        f.textContent = this.tr("UI_FooterIbcs", dev);
        // title-block footers (1.1): data status / source, then the filter context
        const lines = this.titleFooterLines();
        if (lines.length === 0) { return f; }
        const wrap = document.createElement("div");
        const tf = document.createElement("div");
        tf.setAttribute("data-pnl", "title-footer");
        tf.style.cssText = `padding:8px 14px 0 14px;font-size:${this.kpx(9.5)};color:${C.soft};line-height:1.5;` +
            `max-width:${this.k(960)}px;`;
        for (const l of lines) {
            const d = document.createElement("div");
            d.textContent = l;
            tf.appendChild(d);
        }
        wrap.appendChild(tf);
        wrap.appendChild(f);
        return wrap;
    }
}
