"use strict";

import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsModel = formattingSettings.Model;

const presetItems: powerbi.IEnumMember[] = [
    { value: "full", displayName: "AC·PY·PL·FC (full)" },
    { value: "acref", displayName: "AC vs reference" },
    { value: "dall", displayName: "AC vs PY·PL·FC" },
    { value: "acpydpy", displayName: "AC·PY·ΔPY" },
    { value: "acpldpl", displayName: "AC·PL·ΔPL" },
    { value: "dpct", displayName: "ΔPY% · ΔPL%" }
];

const referenceItems: powerbi.IEnumMember[] = [
    { value: "auto", displayName: "Auto (PL, else PY)" },
    { value: "py", displayName: "PY" },
    { value: "pl", displayName: "PL" },
    { value: "fc", displayName: "FC" }
];

const scalingItems: powerbi.IEnumMember[] = [
    { value: "auto", displayName: "Auto" },
    { value: "none", displayName: "None" },
    { value: "k", displayName: "Thousands (k)" },
    { value: "m", displayName: "Millions (m)" }
];

const periodSortItems: powerbi.IEnumMember[] = [
    { value: "auto", displayName: "Automatisch" },
    { value: "data", displayName: "Datenreihenfolge (Fiskaljahr)" },
    { value: "calendar", displayName: "Kalenderjahr" }
];

const colorModeItems: powerbi.IEnumMember[] = [
    { value: "teal", displayName: "Teal deviation (color-vision safe)" },
    { value: "ibcs", displayName: "IBCS classic green" }
];

const densityItems: powerbi.IEnumMember[] = [
    { value: "normal", displayName: "Normal" },
    { value: "compact", displayName: "Compact" }
];

const treeCardItems: powerbi.IEnumMember[] = [
    { value: "months", displayName: "Monatssäulen (AC vs PL)" },
    { value: "delta", displayName: "Abweichungssäulen (Δ vs Referenz)" },
    { value: "bridge", displayName: "Mini-Brücke (REF → Δ → AC)" }
];

const fontPresetItems: powerbi.IEnumMember[] = [
    { value: "hd", displayName: "HD (kompakt)" },
    { value: "fullhd", displayName: "Full HD" },
    { value: "uhd", displayName: "UHD / Präsentation" }
];

export class ToolbarCardSettings extends FormattingSettingsCard {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show toolbar (viewers can switch views)",
        displayNameKey: "Toolbar_Show",
        value: true
    });

    showLegend = new formattingSettings.ToggleSwitch({
        name: "showLegend",
        displayName: "Show scenario legend row",
        displayNameKey: "Toolbar_Legend",
        value: true
    });

    showView = new formattingSettings.ToggleSwitch({ name: "showView", displayName: "Group: view", value: true });
    showPresets = new formattingSettings.ToggleSwitch({ name: "showPresets", displayName: "Group: column presets", value: true });
    showReference = new formattingSettings.ToggleSwitch({ name: "showReference", displayName: "Group: Δ reference", value: true });
    showPeriods = new formattingSettings.ToggleSwitch({ name: "showPeriods", displayName: "Group: periods (MTD/YTD/FY)", value: true });
    showUnit = new formattingSettings.ToggleSwitch({ name: "showUnit", displayName: "Group: unit", value: true });
    showDensity = new formattingSettings.ToggleSwitch({ name: "showDensity", displayName: "Group: density", value: true });
    showLevels = new formattingSettings.ToggleSwitch({ name: "showLevels", displayName: "Group: expand level", value: true });
    showOptions = new formattingSettings.ToggleSwitch({ name: "showOptions", displayName: "Group: options", value: true });

    name: string = "toolbar";
    displayName: string = "Toolbar";
    displayNameKey: string = "Card_Toolbar";
    slices = [this.show, this.showLegend, this.showView, this.showPresets, this.showReference,
        this.showPeriods, this.showUnit, this.showDensity, this.showLevels, this.showOptions];
}

const templateItems: powerbi.IEnumMember[] = [
    { value: "off", displayName: "Off (classic table)" },
    { value: "T01A", displayName: "T01A · structure, values + Δ, month | YTD" },
    { value: "T01B", displayName: "T01B · T01A with subtotal blocks" },
    { value: "T02A", displayName: "T02A · ΔPL bars + pins, month | YTD" },
    { value: "T02B", displayName: "T02B · T02A sorted by AC (YTD)" },
    { value: "T02C", displayName: "T02C · T02A sorted by Δ (month)" },
    { value: "T02E", displayName: "T02E · FC vs PY bars + pins" },
    { value: "T02F", displayName: "T02F · FC vs PL bars + pins" },
    { value: "T03A", displayName: "T03A · statement PY·PL·AC + ΔPY·ΔPL" },
    { value: "T03B", displayName: "T03B · statement PY·PL·FC + ΔPY·ΔPL" },
    { value: "T04A", displayName: "T04A · statement ΔPL bars + pins" },
    { value: "T04B", displayName: "T04B · statement ΔPL waterfall + pins" },
    { value: "T04C", displayName: "T04C · statement ΔPY waterfall + pins" },
    { value: "T04D", displayName: "T04D · FC: ΔPL waterfall + pins" },
    { value: "T04E", displayName: "T04E · FC: ΔPY waterfall + pins" },
    { value: "12A", displayName: "12A · PY + AC value cascades, ΔPY bars + pins" }
];

const minuendItems: powerbi.IEnumMember[] = [
    { value: "ac", displayName: "AC (actual)" },
    { value: "fc", displayName: "FC (forecast)" }
];

const megaSortItems: powerbi.IEnumMember[] = [
    { value: "cat", displayName: "Category order" },
    { value: "min", displayName: "AC/FC descending" },
    { value: "delta", displayName: "Δ descending" }
];

const sortBlockItems: powerbi.IEnumMember[] = [
    { value: "period", displayName: "Month block" },
    { value: "ytd", displayName: "YTD block" }
];

/** a plain on/off switch of the mega-table group */
const megaToggle = (name: string, displayName: string, value: boolean, description?: string): formattingSettings.ToggleSwitch =>
    new formattingSettings.ToggleSwitch({
        name, displayName, displayNameKey: "Mega_" + name.charAt(0).toUpperCase() + name.slice(1),
        description, value
    });

/** threshold input (negative = below this the Δ number turns red) */
const megaThreshold = (name: string, displayName: string, value: number): formattingSettings.NumUpDown =>
    new formattingSettings.NumUpDown({
        name, displayName, displayNameKey: "Mega_" + name.charAt(0).toUpperCase() + name.slice(1), value
    });

/**
 * Columns card. Since the mega table it is a composite card with two groups:
 * "General" keeps every slice it always had (same property names, same
 * defaults), "Mega table" holds the IBCS template switches (SPEC-MEGATABLE.md,
 * "Schalter-Liste"). Every switch acts on its own; the template dropdown only
 * writes their defaults (see Visual.applyMegaTemplate). With all column
 * switches off — the default — the classic table renders unchanged.
 */
export class ColumnsCardSettings extends formattingSettings.CompositeCard {
    preset = new formattingSettings.ItemDropdown({
        name: "preset",
        displayName: "Default column preset",
        displayNameKey: "Columns_Preset",
        items: presetItems,
        value: presetItems[0]
    });

    reference = new formattingSettings.ItemDropdown({
        name: "reference",
        displayName: "Default Δ reference",
        displayNameKey: "Columns_Reference",
        items: referenceItems,
        value: referenceItems[0]
    });

    /**
     * How the bound period column is ordered. "Automatisch" reads month names,
     * date keys and timestamps and puts them in calendar order; a column it
     * cannot read keeps the order the data arrives in. "Datenreihenfolge" is
     * the setting for fiscal years — the model's own sort column decides.
     */
    periodSort = new formattingSettings.ItemDropdown({
        name: "periodSort",
        displayName: "Period sort order",
        displayNameKey: "Columns_PeriodSort",
        description: "Auto reads YYYY-MM keys, dates and month names; data order keeps the model's own sequence (fiscal years)",
        items: periodSortItems,
        value: periodSortItems[0]
    });

    pctRevenue = new formattingSettings.ToggleSwitch({
        name: "pctRevenue",
        displayName: "% of revenue column",
        displayNameKey: "Columns_PctRev",
        value: true
    });

    revenueBase = new formattingSettings.TextInput({
        name: "revenueBase",
        displayName: "Revenue base row (id or name)",
        displayNameKey: "Columns_RevBase",
        description: "Empty = first top-level row",
        placeholder: "e.g. Net revenue",
        value: ""
    });

    hideZeroRows = new formattingSettings.ToggleSwitch({
        name: "hideZeroRows",
        displayName: "Hide zero rows (default)",
        displayNameKey: "Columns_HideZero",
        value: false
    });

    fitWidth = new formattingSettings.ToggleSwitch({
        name: "fitWidth",
        displayName: "Fit table to width (default)",
        displayNameKey: "Columns_FitWidth",
        description: "Squeezes the chart columns until the table fits the viewport — no horizontal scrolling",
        value: false
    });

    treeRoot = new formattingSettings.TextInput({
        name: "treeRoot",
        displayName: "Driver tree root row (id or name)",
        displayNameKey: "Columns_TreeRoot",
        description: "Empty = last formula/KPI row with operands, otherwise the model root",
        placeholder: "e.g. Net margin",
        value: ""
    });

    treeLevel = new formattingSettings.NumUpDown({
        name: "treeLevel",
        displayName: "Driver tree start depth",
        displayNameKey: "Columns_TreeLevel",
        description: "0 = open the whole tree",
        value: 0,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 0 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 8 }
        }
    });

    treeCard = new formattingSettings.ItemDropdown({
        name: "treeCard",
        displayName: "Driver tree card chart",
        displayNameKey: "Columns_TreeCard",
        items: treeCardItems,
        value: treeCardItems[0]
    });

    treeStatus = new formattingSettings.ToggleSwitch({
        name: "treeStatus",
        displayName: "Driver tree status indicator (Δ colour)",
        displayNameKey: "Columns_TreeStatus",
        value: true
    });

    // ---- mega table (IBCS templates T01–T04) ----
    template = new formattingSettings.ItemDropdown({
        name: "template",
        displayName: "Template (IBCS table)",
        displayNameKey: "Mega_Template",
        description: "Sets the switches below to the template defaults — afterwards every switch is free",
        items: templateItems,
        value: templateItems[0]
    });

    minuend = new formattingSettings.ItemDropdown({
        name: "minuend",
        displayName: "Analysed scenario (minuend)",
        displayNameKey: "Mega_Minuend",
        description: "AC filled, FC hatched — Δ columns compare it with PY / PL",
        items: minuendItems,
        value: minuendItems[0]
    });

    showPY = megaToggle("showPY", "Value column PY", false);
    showPL = megaToggle("showPL", "Value column PL", false);
    showMinuend = megaToggle("showMinuend", "Value column AC / FC", false);
    valueCascade = megaToggle("valueCascade", "Value columns as value cascades (12A)", false,
        "Every shown scenario becomes a cascade chart column: steps on the running total, = rows from zero, cost rows light");
    dPyAbs = megaToggle("dPyAbs", "ΔPY as number", false);
    dPyBar = megaToggle("dPyBar", "ΔPY as bars", false);
    dPyWaterfall = megaToggle("dPyWaterfall", "ΔPY as integrated waterfall", false,
        "Each Δ bar starts where the previous one ended; = rows restart from the zero line (T04C/E)");
    dPyPct = megaToggle("dPyPct", "ΔPY% as number", false);
    dPyPin = megaToggle("dPyPin", "ΔPY% as pins", false);
    dPlAbs = megaToggle("dPlAbs", "ΔPL as number", false);
    dPlBar = megaToggle("dPlBar", "ΔPL as bars", false);
    dPlWaterfall = megaToggle("dPlWaterfall", "ΔPL as integrated waterfall", false,
        "Each Δ bar starts where the previous one ended; = rows restart from the zero line (T04B/D)");
    dPlPct = megaToggle("dPlPct", "ΔPL% as number", false);
    dPlPin = megaToggle("dPlPin", "ΔPL% as pins", false);
    secondBlock = megaToggle("secondBlock", "Second period block (month | _YTD)", false,
        "Needs the period role: the month of the last actuals left, the year to date right");
    structureSubtotals = megaToggle("structureSubtotals", "Subtotal blocks (structure data)", true,
        "Regions / structure hierarchies: subtotal blocks with a spacer row; off = leaves + total only");
    showPctRows = megaToggle("showPctRows", "Margin / % rows", true);
    thresholds = megaToggle("thresholds", "Δ in red if below threshold (+ footer)", false);
    thresholdAbs = megaThreshold("thresholdAbs", "Threshold Δ (month / single block)", -20);
    thresholdPct = megaThreshold("thresholdPct", "Threshold Δ% (month / single block)", -10);
    thresholdYtdAbs = megaThreshold("thresholdYtdAbs", "Threshold Δ (_YTD block)", -220);
    thresholdYtdPct = megaThreshold("thresholdYtdPct", "Threshold Δ% (_YTD block)", -10);
    scenarioMarks = megaToggle("scenarioMarks", "Scenario underlines (head + closing)", true);
    chartLabels = megaToggle("chartLabels", "Numbers at bars / pins / cascades", true);
    capBars = megaToggle("capBars", "Outlier arrows for Δ bars too", false,
        "Pins always cap outliers (Q3 + 4 × IQR); this extends it to the Δ bars");

    sort = new formattingSettings.ItemDropdown({
        name: "sort",
        displayName: "Sort (structure data)",
        displayNameKey: "Mega_Sort",
        description: "Per subtotal block; rows named Other … stay at the bottom",
        items: megaSortItems,
        value: megaSortItems[0]
    });

    sortBlock = new formattingSettings.ItemDropdown({
        name: "sortBlock",
        displayName: "Sorting block",
        displayNameKey: "Mega_SortBlock",
        items: sortBlockItems,
        value: sortBlockItems[1]
    });

    general = new formattingSettings.Group({
        name: "columnsGeneral",
        displayName: "General",
        displayNameKey: "Columns_GroupGeneral",
        slices: [this.preset, this.reference, this.periodSort, this.pctRevenue, this.revenueBase,
            this.hideZeroRows, this.fitWidth, this.treeRoot, this.treeLevel, this.treeCard,
            this.treeStatus]
    });

    mega = new formattingSettings.Group({
        name: "columnsMega",
        displayName: "Mega table (IBCS templates)",
        displayNameKey: "Columns_GroupMega",
        collapsible: true,
        slices: [this.template, this.minuend, this.showPY, this.showPL, this.showMinuend, this.valueCascade,
            this.dPyAbs, this.dPyBar, this.dPyWaterfall, this.dPyPct, this.dPyPin,
            this.dPlAbs, this.dPlBar, this.dPlWaterfall, this.dPlPct, this.dPlPin,
            this.secondBlock, this.structureSubtotals, this.showPctRows,
            this.thresholds, this.thresholdAbs, this.thresholdPct, this.thresholdYtdAbs, this.thresholdYtdPct,
            this.scenarioMarks, this.chartLabels, this.capBars, this.sort, this.sortBlock]
    });

    name: string = "columns";
    displayName: string = "Columns";
    displayNameKey: string = "Card_Columns";
    groups = [this.general, this.mega];

    /** pane gates: threshold inputs only with thresholds on, the sorting block only with two blocks */
    onPreProcess(): void {
        const th = this.thresholds.value;
        this.thresholdAbs.visible = th;
        this.thresholdPct.visible = th;
        this.thresholdYtdAbs.visible = th && this.secondBlock.value;
        this.thresholdYtdPct.visible = th && this.secondBlock.value;
        this.sortBlock.visible = this.secondBlock.value && String(this.sort.value.value) !== "cat";
    }
}

export class NumbersCardSettings extends FormattingSettingsCard {
    scaling = new formattingSettings.ItemDropdown({
        name: "scaling",
        displayName: "Scaling",
        displayNameKey: "Numbers_Scaling",
        items: scalingItems,
        value: scalingItems[0]
    });

    unitText = new formattingSettings.TextInput({
        name: "unitText",
        displayName: "Unit (e.g. EUR)",
        displayNameKey: "Numbers_Unit",
        placeholder: "EUR",
        value: "EUR"
    });

    decimals = new formattingSettings.NumUpDown({
        name: "decimals",
        displayName: "Decimals (values)",
        displayNameKey: "Numbers_Decimals",
        value: 1,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 0 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 3 }
        }
    });

    pctDecimals = new formattingSettings.NumUpDown({
        name: "pctDecimals",
        displayName: "Decimals (Δ%)",
        displayNameKey: "Numbers_PctDecimals",
        value: 1,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 0 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 2 }
        }
    });

    name: string = "numbers";
    displayName: string = "Numbers";
    displayNameKey: string = "Card_Numbers";
    slices = [this.scaling, this.unitText, this.decimals, this.pctDecimals];
}

export class StyleCardSettings extends FormattingSettingsCard {
    colorMode = new formattingSettings.ItemDropdown({
        name: "colorMode",
        displayName: "Variance colors",
        displayNameKey: "Style_ColorMode",
        description: "Teal replaces IBCS green to stay readable with red-green color-vision deficiency (documented deviation)",
        items: colorModeItems,
        value: colorModeItems[0]
    });

    density = new formattingSettings.ItemDropdown({
        name: "density",
        displayName: "Default density",
        displayNameKey: "Style_Density",
        items: densityItems,
        value: densityItems[0]
    });

    fontPreset = new formattingSettings.ItemDropdown({
        name: "fontPreset",
        displayName: "Font size preset",
        displayNameKey: "Style_FontPreset",
        items: fontPresetItems,
        value: fontPresetItems[0]
    });

    /**
     * Fine scaling on top of the size preset, in percent. 100 % leaves the
     * preset alone; the product of both is capped inside the visual so a
     * presentation setting cannot turn the table into a poster.
     */
    fontZoom = new formattingSettings.NumUpDown({
        name: "fontZoom",
        displayName: "Font fine scaling (%)",
        displayNameKey: "Style_FontZoom",
        description: "80–160 % on top of the size preset (100 = preset unchanged)",
        value: 100,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 80 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 160 }
        }
    });

    headerFontSize = new formattingSettings.NumUpDown({
        name: "headerFontSize",
        displayName: "Header font size (px)",
        displayNameKey: "Style_HeaderFont",
        description: "0 = automatic (built-in sizes), otherwise 7–20 px",
        value: 0,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 0 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 20 }
        }
    });

    headerColor = new formattingSettings.ColorPicker({
        name: "headerColor",
        displayName: "Header font color (override)",
        displayNameKey: "Style_HeaderColor",
        value: { value: "" }
    });

    goodColor = new formattingSettings.ColorPicker({
        name: "goodColor",
        displayName: "Favorable Δ color (override)",
        displayNameKey: "Style_GoodColor",
        value: { value: "" }
    });

    badColor = new formattingSettings.ColorPicker({
        name: "badColor",
        displayName: "Unfavorable Δ color (override)",
        displayNameKey: "Style_BadColor",
        value: { value: "" }
    });

    /**
     * Accent of the interactive chrome — active toolbar buttons, the back
     * button of the tile view, breadcrumb hover. Never a data mark: columns,
     * axes and the AC fill keep the IBCS ink (#404040), which is also the
     * default here, so an untouched report looks exactly as before.
     */
    accentColor = new formattingSettings.ColorPicker({
        name: "accentColor",
        displayName: "Accent color (controls)",
        displayNameKey: "Style_AccentColor",
        description: "Active toolbar buttons, back button and breadcrumb hover — never data marks or axes",
        value: { value: "#404040" }
    });

    /**
     * Freeze the head — title block, toolbar, legend, scale note and the two
     * table header rows stay on screen while the body scrolls underneath.
     */
    stickyHeader = new formattingSettings.ToggleSwitch({
        name: "stickyHeader",
        displayName: "Freeze the header while scrolling",
        displayNameKey: "Style_StickyHeader",
        description: "Title, toolbar, legend and the column headers stay on top while the rows scroll",
        value: true
    });

    /**
     * Paper of the visual: the ground behind the tiles of the zoom page and
     * behind the driver tree. Default white = exactly the previous look.
     */
    pageBackground = new formattingSettings.ColorPicker({
        name: "pageBackground",
        displayName: "Page background",
        displayNameKey: "Style_PageBg",
        value: { value: "#FFFFFF" }
    });

    /** Fill of the cards: tree cards, micro cards, the big tile, hover panel. */
    cardBackground = new formattingSettings.ColorPicker({
        name: "cardBackground",
        displayName: "Card background",
        displayNameKey: "Style_CardBg",
        value: { value: "#FFFFFF" }
    });

    /**
     * Selection + native context menu: a click sets the Power BI selection of
     * the row (cross-filtering, and the drillthrough buttons of the page become
     * live), a right click opens the host menu with the drillthrough targets.
     * Off = the pre-0.17 behaviour, a pure display.
     */
    interactions = new formattingSettings.ToggleSwitch({
        name: "interactions",
        displayName: "Selection & context menu active",
        displayNameKey: "Style_Interactions",
        description: "Click sets the page selection (cross-filtering, drillthrough), right click opens the native menu",
        value: true
    });

    name: string = "style";
    displayName: string = "Style";
    displayNameKey: string = "Card_Style";
    slices = [this.colorMode, this.fontPreset, this.fontZoom, this.headerFontSize, this.headerColor,
        this.goodColor, this.badColor, this.accentColor, this.stickyHeader,
        this.pageBackground, this.cardBackground, this.density, this.interactions];
}

export class TitleBlockCardSettings extends FormattingSettingsCard {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show title block",
        displayNameKey: "Title_Show",
        value: true
    });

    unitLine = new formattingSettings.TextInput({
        name: "unitLine",
        displayName: "Line 1 · reporting unit",
        displayNameKey: "Title_Unit",
        placeholder: "e.g. Contoso Group · Consolidated",
        value: ""
    });

    measureLine = new formattingSettings.TextInput({
        name: "measureLine",
        displayName: "Line 2 · measure + unit",
        displayNameKey: "Title_Measure",
        placeholder: "e.g. Income statement (P&L) in mEUR",
        value: ""
    });

    periodLine = new formattingSettings.TextInput({
        name: "periodLine",
        displayName: "Line 3 · period + scenarios",
        displayNameKey: "Title_Period",
        placeholder: "auto from data if empty",
        value: ""
    });

    message = new formattingSettings.TextInput({
        name: "message",
        displayName: "Message headline (interpretation)",
        displayNameKey: "Title_Message",
        placeholder: "e.g. EBITDA +7.4% vs PL, FY outlook -7.8%",
        value: ""
    });

    name: string = "titleBlock";
    displayName: string = "Title block";
    displayNameKey: string = "Card_Title";
    slices = [this.show, this.unitLine, this.measureLine, this.periodLine, this.message];
}

export class HierarchyCardSettings extends FormattingSettingsCard {
    defaultLevel = new formattingSettings.NumUpDown({
        name: "defaultLevel",
        displayName: "Default expand level",
        displayNameKey: "Hierarchy_DefaultLevel",
        description: "0 = expand everything",
        value: 2,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 0 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 8 }
        }
    });

    indent = new formattingSettings.NumUpDown({
        name: "indent",
        displayName: "Indent per level (px)",
        displayNameKey: "Hierarchy_Indent",
        value: 16,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 6 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 32 }
        }
    });

    name: string = "hierarchy";
    displayName: string = "Hierarchy";
    displayNameKey: string = "Card_Hierarchy";
    slices = [this.defaultLevel, this.indent];
}

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    toolbarCard = new ToolbarCardSettings();
    columnsCard = new ColumnsCardSettings();
    numbersCard = new NumbersCardSettings();
    styleCard = new StyleCardSettings();
    titleCard = new TitleBlockCardSettings();
    hierarchyCard = new HierarchyCardSettings();

    cards = [this.toolbarCard, this.columnsCard, this.numbersCard, this.styleCard, this.titleCard, this.hierarchyCard];
}
