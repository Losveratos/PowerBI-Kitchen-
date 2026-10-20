"use strict";

import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsModel = formattingSettings.Model;

/*
 * Every user-facing text of the format pane carries a resource key
 * (stringResources/<locale>/resources.resjson, four locales). The English
 * literal next to it is the fallback for hosts without a localization manager.
 *
 * Enum members carry their key in `key`: the format pane serializes the items
 * across the sandbox boundary, so a getter cannot travel with them —
 * localizeSettings() resolves them per settings model (one per update), never
 * on the shared module arrays, so two visuals with two locales on one page
 * (the test harness) cannot bleed into each other.
 */
type LocEnumMember = powerbi.IEnumMember & { key: string };

const presetItems: LocEnumMember[] = [
    { value: "full", displayName: "AC·PY·PL·FC (full)", key: "Enum_Preset_Full" },
    { value: "acref", displayName: "AC vs reference", key: "Enum_Preset_AcRef" },
    { value: "dall", displayName: "AC vs PY·PL·FC", key: "Enum_Preset_DAll" },
    { value: "acpydpy", displayName: "AC·PY·ΔPY", key: "Enum_Preset_AcPyDPy" },
    { value: "acpldpl", displayName: "AC·PL·ΔPL", key: "Enum_Preset_AcPlDPl" },
    { value: "dpct", displayName: "ΔPY% · ΔPL%", key: "Enum_Preset_DPct" },
    // 1.2: free combination — the value-column switches colAc … colDelta below
    { value: "custom", displayName: "Own selection (switches below)", key: "Enum_Preset_Custom" }
];

const referenceItems: LocEnumMember[] = [
    { value: "auto", displayName: "Auto (PL, else PY)", key: "Enum_Ref_Auto" },
    { value: "py", displayName: "Previous Year (PY)", key: "Enum_Ref_Py" },
    { value: "pl", displayName: "Plan (PL)", key: "Enum_Ref_Pl" },
    { value: "fc", displayName: "Forecast (FC)", key: "Enum_Ref_Fc" }
];

const scalingItems: LocEnumMember[] = [
    { value: "auto", displayName: "Auto", key: "Enum_Scaling_Auto" },
    { value: "none", displayName: "None", key: "Enum_Scaling_None" },
    { value: "k", displayName: "Thousands (k)", key: "Enum_Scaling_K" },
    { value: "m", displayName: "Millions (m)", key: "Enum_Scaling_M" },
    { value: "b", displayName: "Billions (b)", key: "Enum_Scaling_B" }
];

const periodSortItems: LocEnumMember[] = [
    { value: "auto", displayName: "Automatic", key: "Enum_PeriodSort_Auto" },
    { value: "data", displayName: "Data order (fiscal year)", key: "Enum_PeriodSort_Data" },
    { value: "calendar", displayName: "Calendar year", key: "Enum_PeriodSort_Calendar" }
];

const colorModeItems: LocEnumMember[] = [
    { value: "teal", displayName: "Teal deviation (color-vision safe)", key: "Enum_ColorMode_Teal" },
    { value: "ibcs", displayName: "IBCS classic green", key: "Enum_ColorMode_Ibcs" }
];

/**
 * Variance colour preset (ChartKitchen colors.variancePreset): "auto" follows
 * the older style.colorMode switch (teal / IBCS green), so a report saved
 * before 1.1 keeps its colours; blue / orange is the ColorBrewer pair of
 * ChartKitchen (#2C7BB6 / #E66101, dark #5BA3DC / #F0821E).
 */
const variancePresetItems: LocEnumMember[] = [
    { value: "auto", displayName: "Like variance colors (teal / IBCS)", key: "Enum_VarPreset_Auto" },
    { value: "teal", displayName: "Teal / red (color-vision safe)", key: "Enum_VarPreset_Teal" },
    { value: "ibcs", displayName: "IBCS green / red", key: "Enum_VarPreset_Ibcs" },
    { value: "blueOrange", displayName: "Blue / orange (ColorBrewer)", key: "Enum_VarPreset_BlueOrange" }
];

const appearanceItems: LocEnumMember[] = [
    { value: "auto", displayName: "Auto (follow the report theme)", key: "Enum_Appearance_Auto" },
    { value: "light", displayName: "Light", key: "Enum_Appearance_Light" },
    { value: "dark", displayName: "Dark", key: "Enum_Appearance_Dark" }
];

const densityItems: LocEnumMember[] = [
    { value: "normal", displayName: "Normal", key: "Enum_Density_Normal" },
    { value: "compact", displayName: "Compact", key: "Enum_Density_Compact" }
];

const treeCardItems: LocEnumMember[] = [
    { value: "months", displayName: "Monthly columns (AC vs PL)", key: "Enum_TreeCard_Months" },
    { value: "delta", displayName: "Variance columns (Δ vs reference)", key: "Enum_TreeCard_Delta" },
    { value: "bridge", displayName: "Mini bridge (REF → Δ → AC)", key: "Enum_TreeCard_Bridge" }
];

const fontPresetItems: LocEnumMember[] = [
    { value: "hd", displayName: "HD", key: "Enum_FontPreset_Hd" },
    { value: "fullhd", displayName: "Full HD", key: "Enum_FontPreset_FullHd" },
    { value: "uhd", displayName: "UHD", key: "Enum_FontPreset_Uhd" }
];

const templateItems: LocEnumMember[] = [
    { value: "off", displayName: "Off (classic table)", key: "Enum_Template_Off" },
    { value: "T01A", displayName: "T01A · structure, values + Δ, month | YTD", key: "Enum_Template_T01A" },
    { value: "T01B", displayName: "T01B · T01A with subtotal blocks", key: "Enum_Template_T01B" },
    { value: "T02A", displayName: "T02A · ΔPL bars + pins, month | YTD", key: "Enum_Template_T02A" },
    { value: "T02B", displayName: "T02B · T02A sorted by AC (YTD)", key: "Enum_Template_T02B" },
    { value: "T02C", displayName: "T02C · T02A sorted by Δ (month)", key: "Enum_Template_T02C" },
    { value: "T02E", displayName: "T02E · FC vs PY bars + pins", key: "Enum_Template_T02E" },
    { value: "T02F", displayName: "T02F · FC vs PL bars + pins", key: "Enum_Template_T02F" },
    { value: "T03A", displayName: "T03A · statement PY·PL·AC + ΔPY·ΔPL", key: "Enum_Template_T03A" },
    { value: "T03B", displayName: "T03B · statement PY·PL·FC + ΔPY·ΔPL", key: "Enum_Template_T03B" },
    { value: "T04A", displayName: "T04A · statement ΔPL bars + pins", key: "Enum_Template_T04A" },
    { value: "T04B", displayName: "T04B · statement ΔPL waterfall + pins", key: "Enum_Template_T04B" },
    { value: "T04C", displayName: "T04C · statement ΔPY waterfall + pins", key: "Enum_Template_T04C" },
    { value: "T04D", displayName: "T04D · FC: ΔPL waterfall + pins", key: "Enum_Template_T04D" },
    { value: "T04E", displayName: "T04E · FC: ΔPY waterfall + pins", key: "Enum_Template_T04E" },
    { value: "12A", displayName: "12A · PY + AC value cascades, ΔPY bars + pins", key: "Enum_Template_12A" },
    { value: "12G", displayName: "12G · FY outlook: PY + AC&FC (YTD + rest of year) cascades, ΔPY", key: "Enum_Template_12G" },
    { value: "12H", displayName: "12H · plan: PY + PL cascades, ΔPY bars outlined", key: "Enum_Template_12H" }
];

/** empty state: the Start hub (1.3, default), the Smart Start demo, the field explanation or the author's own message */
const emptyModeItems: LocEnumMember[] = [
    { value: "hub", displayName: "Start hub (tour, templates, demo, fields)", key: "Enum_EmptyMode_Hub" },
    { value: "demo", displayName: "Demo statement (Smart Start)", key: "Enum_EmptyMode_Demo" },
    { value: "fields", displayName: "Field guide (which field goes where)", key: "Enum_EmptyMode_Fields" },
    { value: "message", displayName: "Own message (title / text below)", key: "Enum_EmptyMode_Message" }
];

const minuendItems: LocEnumMember[] = [
    { value: "ac", displayName: "AC (actual)", key: "Enum_Minuend_Ac" },
    { value: "fc", displayName: "FC (forecast)", key: "Enum_Minuend_Fc" },
    { value: "pl", displayName: "PL (plan statement)", key: "Enum_Minuend_Pl" }
];

const megaSortItems: LocEnumMember[] = [
    { value: "cat", displayName: "Category order", key: "Enum_MegaSort_Cat" },
    { value: "min", displayName: "AC/FC descending", key: "Enum_MegaSort_Min" },
    { value: "delta", displayName: "Δ descending", key: "Enum_MegaSort_Delta" }
];

const sortBlockItems: LocEnumMember[] = [
    { value: "period", displayName: "Month block", key: "Enum_SortBlock_Period" },
    { value: "ytd", displayName: "YTD block", key: "Enum_SortBlock_Ytd" }
];

/** kind of a mega-table period block — month of the last actuals, year to date, FY outlook */
const megaBlockItems: LocEnumMember[] = [
    { value: "month", displayName: "Month", key: "Enum_MegaBlock_Month" },
    { value: "ytd", displayName: "YTD", key: "Enum_MegaBlock_Ytd" },
    { value: "fy", displayName: "FY outlook (AC&FC vs PL)", key: "Enum_MegaBlock_Fy" }
];

/** key of the description that belongs to a display-name key (Toolbar_Show → Desc_Toolbar_Show) */
const dk = (nameKey: string): string => "Desc_" + nameKey;

const toggle = (name: string, nameKey: string, displayName: string, description: string,
    value: boolean): formattingSettings.ToggleSwitch =>
    new formattingSettings.ToggleSwitch({
        name, displayName, displayNameKey: nameKey, description, descriptionKey: dk(nameKey), value
    });

const dropdown = (name: string, nameKey: string, displayName: string, description: string,
    items: LocEnumMember[], index = 0): formattingSettings.ItemDropdown =>
    new formattingSettings.ItemDropdown({
        name, displayName, displayNameKey: nameKey, description, descriptionKey: dk(nameKey),
        items, value: items[index]
    });

const numUpDown = (name: string, nameKey: string, displayName: string, description: string,
    value: number, min?: number, max?: number): formattingSettings.NumUpDown =>
    new formattingSettings.NumUpDown({
        name, displayName, displayNameKey: nameKey, description, descriptionKey: dk(nameKey), value,
        options: min == null && max == null ? undefined : {
            minValue: min == null ? undefined : { type: 0 /* ValidatorType.Min */, value: min },
            maxValue: max == null ? undefined : { type: 1 /* ValidatorType.Max */, value: max }
        }
    });

const textInput = (name: string, nameKey: string, displayName: string, description: string,
    placeholder: string, value = ""): formattingSettings.TextInput =>
    new formattingSettings.TextInput({
        name, displayName, displayNameKey: nameKey, description, descriptionKey: dk(nameKey),
        placeholder, value
    });

const color = (name: string, nameKey: string, displayName: string, description: string,
    value: string): formattingSettings.ColorPicker =>
    new formattingSettings.ColorPicker({
        name, displayName, displayNameKey: nameKey, description, descriptionKey: dk(nameKey),
        value: { value }
    });

/** a plain on/off switch of the mega-table group (key Mega_<Name>) */
const megaToggle = (name: string, displayName: string, value: boolean, description: string): formattingSettings.ToggleSwitch =>
    toggle(name, "Mega_" + name.charAt(0).toUpperCase() + name.slice(1), displayName, description, value);

/** threshold input (negative = below this the Δ number turns red) */
const megaThreshold = (name: string, displayName: string, value: number, description: string): formattingSettings.NumUpDown =>
    numUpDown(name, "Mega_" + name.charAt(0).toUpperCase() + name.slice(1), displayName, description, value);

/**
 * Display + toolbar card ("Darstellung"): what the reader gets on top of the
 * statement — the toolbar with its groups and the scenario legend.
 */
export class ToolbarCardSettings extends FormattingSettingsCard {
    show = toggle("show", "Toolbar_Show", "Show toolbar (viewers can switch views)",
        "Buttons above the statement: view, columns, unit, density, levels. Default: on", true);
    showLegend = toggle("showLegend", "Toolbar_Legend", "Show scenario legend row",
        "AC · PY · PL · FC chips plus favorable / unfavorable Δ under the toolbar. Default: on", true);
    showView = toggle("showView", "Toolbar_ShowView", "Group: view",
        "Table · Bars · Waterfall · Tree. Default: on", true);
    showPresets = toggle("showPresets", "Toolbar_ShowPresets", "Group: column presets",
        "Column sets of the classic table. Default: on", true);
    showReference = toggle("showReference", "Toolbar_ShowReference", "Group: Δ reference",
        "PY · PL · FC as the basis of every Δ. Default: on", true);
    showPeriods = toggle("showPeriods", "Toolbar_ShowPeriods", "Group: periods (MTD/YTD/FY)",
        "Period blocks of the classic table. Default: on", true);
    showUnit = toggle("showUnit", "Toolbar_ShowUnit", "Group: unit",
        "Switch between thousands and millions. Default: on", true);
    showDensity = toggle("showDensity", "Toolbar_ShowDensity", "Group: density",
        "Normal or compact rows. Default: on", true);
    showLevels = toggle("showLevels", "Toolbar_ShowLevels", "Group: expand level",
        "Open the hierarchy down to level 1, 2 … or completely. Default: on", true);
    showOptions = toggle("showOptions", "Toolbar_ShowOptions", "Group: options",
        "% of revenue, hide zero rows, fit to width. Default: on", true);
    /**
     * Mega table only: readers switch the analysed scenario (AC / FC, with the
     * FC field) and the reference view (ΔPY · ΔPL · both). Off by default — an
     * existing report keeps exactly its toolbar.
     */
    showScenario = toggle("showScenario", "Toolbar_ShowScenario", "Group: scenario (mega table)",
        "Readers switch the analysed scenario AC / FC and the reference view ΔPY · ΔPL · both of the mega table. Default: off", false);
    /**
     * 1.2: value columns as independent switches (AC · PY · PL · FC · Δ) — in
     * the classic table and (analysed scenario · PY · PL) in the mega table.
     * Off by default: an existing report keeps exactly its toolbar.
     */
    showValues = toggle("showValues", "Toolbar_ShowValues", "Group: value columns (scenarios one by one)",
        "Readers combine the value columns freely — AC, PY, PL, FC and Δ against the Δ reference (classic table), analysed scenario · PY · PL (mega table). The column presets stay as quick picks. Default: off", false);
    /** 1.2: the template dropdown in the toolbar — edit mode only, readers never see it */
    showTemplate = toggle("showTemplate", "Toolbar_ShowTemplate", "Template picker in edit mode",
        "A compact template dropdown at the start of the toolbar while you edit the report (table view). Readers and exports never see it. Default: on", true);
    /**
     * 1.5: the control bars (toolbar, legend, hint lines) fold behind a small
     * ☰ button — for small tiles, where they took two thirds of the height.
     * Off by default: an existing report keeps exactly its head.
     */
    foldable = toggle("foldable", "Toolbar_Collapsible", "Control bars collapsible (☰)",
        "Toolbar, legend and hint lines fold behind a small ☰ button; folded, one slim row remains. For small tiles. Exports always print the legend. Default: off", false);
    startFolded = toggle("startFolded", "Toolbar_StartCollapsed", "Start collapsed",
        "With collapsible control bars: the visual opens folded, readers unfold them with ☰. Default: on", true);

    name: string = "toolbar";
    displayName: string = "Display & toolbar";
    displayNameKey: string = "Card_Toolbar";
    description: string = "What readers see above the statement and what they may switch themselves";
    descriptionKey: string = "Desc_Card_Toolbar";
    slices = [this.show, this.showLegend, this.showView, this.showPresets, this.showReference,
        this.showPeriods, this.showUnit, this.showDensity, this.showLevels, this.showOptions, this.showScenario,
        this.showValues, this.showTemplate, this.foldable, this.startFolded];
}

/**
 * Columns card: a composite card with three groups — the classic table
 * ("General", all slices it always had, same names and defaults), the mega
 * table (IBCS template switches, SPEC-MEGATABLE.md "Schalter-Liste") and the
 * value driver tree. Every switch acts on its own; the template dropdown only
 * writes their defaults (see Visual.applyMegaTemplate). With all column
 * switches off — the default — the classic table renders unchanged.
 */
export class ColumnsCardSettings extends formattingSettings.CompositeCard {
    preset = dropdown("preset", "Columns_Preset", "Default column preset",
        "Column set of the classic table when the report opens; readers switch it in the toolbar. Default: AC·PY·PL·FC",
        presetItems);
    reference = dropdown("reference", "Columns_Reference", "Default Δ reference",
        "Basis of the Δ columns, bars and tree cards. Auto takes PL, else PY. Default: Auto", referenceItems);
    /**
     * 1.2 preset "Own selection": the value columns as independent switches —
     * any combination of AC, PY, PL and FC, plus Δ bar + Δ% pin against the
     * Δ reference. Shown only while the preset is "Own selection".
     */
    colAc = toggle("colAc", "Columns_ColAc", "Own selection: AC column",
        "Actual values as a number column (with % of revenue, if on). Default: on", true);
    colPy = toggle("colPy", "Columns_ColPy", "Own selection: PY column",
        "Previous-year values as a number column. Default: on", true);
    colPl = toggle("colPl", "Columns_ColPl", "Own selection: PL column",
        "Plan values as a number column. Default: on", true);
    colFc = toggle("colFc", "Columns_ColFc", "Own selection: FC column",
        "Forecast values as a number column. Default: off", false);
    colDelta = toggle("colDelta", "Columns_ColDelta", "Own selection: Δ bar + Δ% pin",
        "Variance of AC against the Δ reference as bar and pin. Default: on", true);
    /**
     * 1.2 bars view (ChartKitchen notation): the reference bar sits behind AC,
     * offset like the scenario columns of ChartKitchen, instead of the full
     * band behind a narrow AC bar; and the further scenarios as triangle marks.
     */
    barOverlap = toggle("barOverlap", "Columns_BarOverlap", "Bars view: overlapping scenario bars",
        "AC in front at full strength, the reference (PY gray / PL outlined / FC hatched) behind it and slightly offset — the ChartKitchen notation. Default: off", false);
    barTriangles = toggle("barTriangles", "Columns_BarTriangles", "Bars view: triangle marks for further scenarios",
        "Small triangles at the value of every other bound scenario (PY gray, PL outlined, FC hatched) above the bars. Default: off", false);
    /**
     * How the bound period column is ordered. "Automatic" reads month names,
     * date keys and timestamps and puts them in calendar order; a column it
     * cannot read keeps the order the data arrives in. "Data order" is the
     * setting for fiscal years — the model's own sort column decides.
     */
    periodSort = dropdown("periodSort", "Columns_PeriodSort", "Period sort order",
        "Automatic reads YYYY-MM keys, dates and month names; data order keeps the model's own sequence (fiscal years). Default: Automatic",
        periodSortItems);
    pctRevenue = toggle("pctRevenue", "Columns_PctRev", "% of revenue column",
        "Share of every row in the revenue base row, next to AC. Default: on", true);
    revenueBase = textInput("revenueBase", "Columns_RevBase", "Revenue base row (id or name)",
        "Row the % of revenue refers to. Empty = first top-level row", "e.g. Net revenue");
    hideZeroRows = toggle("hideZeroRows", "Columns_HideZero", "Hide zero rows (default)",
        "Rows without any value disappear; readers can switch it in the toolbar. Default: off", false);
    fitWidth = toggle("fitWidth", "Columns_FitWidth", "Fit table to width (default)",
        "Squeezes the chart columns until the table fits the viewport — no horizontal scrolling. Default: off", false);
    exportExpandAll = toggle("exportExpandAll", "Columns_ExportExpandAll", "Export: expand all rows",
        "PDF / PowerPoint export and subscriptions print every row expanded, whatever is folded on screen. Default: on", true);
    /** IBCS EMPHASIZE (ChartKitchen chart.highlight): a quiet band over every column of the named rows */
    highlight = textInput("highlight", "Columns_Highlight", "Highlight rows",
        "Comma-separated row names (or ids), case-insensitive: a quiet band runs over all columns of these rows (IBCS EMPHASIZE). Empty = off",
        "e.g. EBIT, Net income");
    /**
     * Materiality (ChartKitchen chart.materialityAbs / materialityPct): Δ
     * numbers, bars and pins below the threshold are dampened to the soft ink.
     * Absolute in data units (before k / m scaling, like ChartKitchen), percent
     * in whole percent; with both set a Δ must exceed both to keep its colour.
     */
    materialityAbs = numUpDown("materialityAbs", "Columns_MaterialityAbs", "Materiality from (absolute)",
        "Variances below this absolute amount (data units, before k/m scaling) are shown in soft gray instead of the variance colors — numbers, bars, pins and waterfall steps. 0 = off", 0, 0);
    materialityPct = numUpDown("materialityPct", "Columns_MaterialityPct", "Materiality from (%)",
        "Variances below this Δ% are shown in soft gray. If both thresholds are set, a variance must exceed both to be colored. 0 = off", 0, 0, 100);

    treeRoot = textInput("treeRoot", "Columns_TreeRoot", "Driver tree root row (id, name or category)",
        "Empty = last formula/KPI row with operands, otherwise the model root", "e.g. Net margin");
    treeLevel = numUpDown("treeLevel", "Columns_TreeLevel", "Driver tree start depth",
        "How many levels of the tree are open when it starts. 0 = the whole tree. Default: 0", 0, 0, 8);
    treeCard = dropdown("treeCard", "Columns_TreeCard", "Driver tree card chart",
        "Mini chart on every card: monthly columns, variance columns or a mini bridge. Default: monthly columns",
        treeCardItems);
    treeStatus = toggle("treeStatus", "Columns_TreeStatus", "Driver tree status indicator (Δ colour)",
        "Card edge and Δ% in the card head in the variance colour. Default: on", true);

    // ---- mega table (IBCS templates T01–T04, 12A) ----
    template = dropdown("template", "Mega_Template", "Template (IBCS table)",
        "Sets the switches below to the template defaults — afterwards every switch is free. Default: off (classic table)",
        templateItems);
    minuend = dropdown("minuend", "Mega_Minuend", "Analysed scenario (minuend)",
        "AC filled, FC hatched, PL outlined; the Δ bars follow the minuend (PL: outlined in red / green, plan statement 12H). The Δ columns compare it with PY / PL. Needs the FC / PL field. Default: AC",
        minuendItems);
    showPY = megaToggle("showPY", "Value column PY", false, "Previous-year values as a number column. Default: off");
    showPL = megaToggle("showPL", "Value column PL", false, "Plan values as a number column. Default: off");
    showMinuend = megaToggle("showMinuend", "Value column AC / FC", false,
        "Values of the analysed scenario as a number column. Default: off");
    valueCascade = megaToggle("valueCascade", "Value columns as value cascades (12A)", false,
        "Every shown scenario becomes a cascade chart column: steps on the running total, = rows from zero, cost rows light. Default: off");
    dPyAbs = megaToggle("dPyAbs", "ΔPY as number", false, "Absolute variance against the previous year. Default: off");
    dPyBar = megaToggle("dPyBar", "ΔPY as bars", false,
        "Variance bars on one zero line, gray PY axis. Default: off");
    dPyWaterfall = megaToggle("dPyWaterfall", "ΔPY as integrated waterfall", false,
        "Each Δ bar starts where the previous one ended; = rows restart from the zero line (T04C/E). Default: off");
    dPyPct = megaToggle("dPyPct", "ΔPY% as number", false, "Relative variance against the previous year. Default: off");
    dPyPin = megaToggle("dPyPin", "ΔPY% as pins", false, "Relative variance as pins (lollipops). Default: off");
    dPlAbs = megaToggle("dPlAbs", "ΔPL as number", false, "Absolute variance against plan. Default: off");
    dPlBar = megaToggle("dPlBar", "ΔPL as bars", false,
        "Variance bars on one zero line, double PL axis. Default: off");
    dPlWaterfall = megaToggle("dPlWaterfall", "ΔPL as integrated waterfall", false,
        "Each Δ bar starts where the previous one ended; = rows restart from the zero line (T04B/D). Default: off");
    dPlPct = megaToggle("dPlPct", "ΔPL% as number", false, "Relative variance against plan. Default: off");
    dPlPin = megaToggle("dPlPin", "ΔPL% as pins", false, "Relative variance as pins (lollipops). Default: off");
    secondBlock = megaToggle("secondBlock", "Second period block (month | _YTD)", false,
        "Needs the period field: the month of the last actuals left, the year to date right. Default: off");
    blockKind = dropdown("blockKind", "Mega_BlockKind", "Period block",
        "Month of the last actuals, year to date or FY outlook (AC&FC vs PL, needs the FY fields); with a second block the right one. Default: YTD",
        megaBlockItems, 1);
    leftBlockKind = dropdown("leftBlockKind", "Mega_LeftBlockKind", "Second block (left)",
        "Period of the block left of the period block when the second block is on. Default: month", megaBlockItems, 0);
    pctOfRevenue = megaToggle("pctOfRevenue", "% of revenue column", false,
        "Share of every row in the revenue base row (group Table), right of the value columns. Default: off");
    structureSubtotals = megaToggle("structureSubtotals", "Subtotal blocks (structure data)", true,
        "Regions / structure hierarchies: subtotal blocks with a spacer row; off = leaves + total only. Default: on");
    showPctRows = megaToggle("showPctRows", "Margin / % rows", true,
        "KPI rows (margins) in italics, their Δ in percentage points. Default: on");
    thresholds = megaToggle("thresholds", "Δ in red if below threshold (+ footer)", false,
        "Δ numbers below the thresholds turn red; a footer names the rule. Default: off");
    thresholdAbs = megaThreshold("thresholdAbs", "Threshold Δ (month / single block)", -20,
        "In display units (after k/m scaling). Default: −20 k, converted at m and b scaling (m: −0.02)");
    thresholdPct = megaThreshold("thresholdPct", "Threshold Δ% (month / single block)", -10,
        "In whole percent. Default: −10");
    thresholdYtdAbs = megaThreshold("thresholdYtdAbs", "Threshold Δ (_YTD block)", -220,
        "Threshold of the second block, in display units. Default: −220 k, converted at m and b scaling (m: −0.22)");
    thresholdYtdPct = megaThreshold("thresholdYtdPct", "Threshold Δ% (_YTD block)", -10,
        "Threshold of the second block, in whole percent. Default: −10");
    scenarioMarks = megaToggle("scenarioMarks", "Scenario underlines (head + closing)", true,
        "AC solid, PY gray, PL double, FC hatched under the column heads. Default: on");
    chartLabels = megaToggle("chartLabels", "Numbers at bars / pins / cascades", true,
        "Value labels next to every chart element. Default: on");
    capBars = megaToggle("capBars", "Outlier arrows for Δ bars too", false,
        "Pins always cap outliers (Q3 + 4 × IQR); this extends it to the Δ bars. Default: off");
    sort = dropdown("sort", "Mega_Sort", "Sort (structure data)",
        "Per subtotal block; rows named Other … stay at the bottom. Default: category order", megaSortItems);
    sortBlock = dropdown("sortBlock", "Mega_SortBlock", "Sorting block",
        "Which period block decides the order. Default: YTD block", sortBlockItems, 1);

    general = new formattingSettings.Group({
        name: "columnsGeneral",
        displayName: "Table",
        displayNameKey: "Columns_GroupGeneral",
        description: "Classic table, bars and waterfall",
        descriptionKey: "Desc_Columns_GroupGeneral",
        slices: [this.preset, this.colAc, this.colPy, this.colPl, this.colFc, this.colDelta,
            this.reference, this.barOverlap, this.barTriangles, this.periodSort, this.pctRevenue, this.revenueBase,
            this.hideZeroRows, this.fitWidth, this.exportExpandAll, this.highlight, this.materialityAbs, this.materialityPct]
    });

    mega = new formattingSettings.Group({
        name: "columnsMega",
        displayName: "Mega table (IBCS templates)",
        displayNameKey: "Columns_GroupMega",
        description: "IBCS tables T01–T04 and 12A — visible in the table view",
        descriptionKey: "Desc_Columns_GroupMega",
        collapsible: true,
        slices: [this.template, this.minuend, this.showPY, this.showPL, this.showMinuend, this.valueCascade,
            this.dPyAbs, this.dPyBar, this.dPyWaterfall, this.dPyPct, this.dPyPin,
            this.dPlAbs, this.dPlBar, this.dPlWaterfall, this.dPlPct, this.dPlPin,
            this.pctOfRevenue, this.secondBlock, this.blockKind, this.leftBlockKind, this.structureSubtotals, this.showPctRows,
            this.thresholds, this.thresholdAbs, this.thresholdPct, this.thresholdYtdAbs, this.thresholdYtdPct,
            this.scenarioMarks, this.chartLabels, this.capBars, this.sort, this.sortBlock]
    });

    tree = new formattingSettings.Group({
        name: "columnsTree",
        displayName: "Value driver tree",
        displayNameKey: "Columns_GroupTree",
        description: "Start of the tree view — visible in the tree view",
        descriptionKey: "Desc_Columns_GroupTree",
        collapsible: true,
        slices: [this.treeRoot, this.treeLevel, this.treeCard, this.treeStatus]
    });

    name: string = "columns";
    displayName: string = "Columns & mega table";
    displayNameKey: string = "Card_Columns";
    description: string = "Which columns the statement shows — classic presets or the IBCS templates";
    descriptionKey: string = "Desc_Card_Columns";
    /**
     * 1.2: the mega table group with the template dropdown comes FIRST — the
     * owner could not find the templates below the classic switches. Pane
     * order only, no property changes.
     */
    groups = [this.mega, this.general, this.tree];
}

export class NumbersCardSettings extends FormattingSettingsCard {
    scaling = dropdown("scaling", "Numbers_Scaling", "Scaling",
        "Auto switches to k from 50,000 and to m from 50 million. Default: Auto", scalingItems);
    unitText = textInput("unitText", "Numbers_Unit", "Unit (e.g. EUR)",
        "Follows k / m in the title, the scale note and the cards. Default: EUR", "EUR", "EUR");
    decimals = numUpDown("decimals", "Numbers_Decimals", "Decimals (values)",
        "Decimal places of values and Δ. Default: 1", 1, 0, 3);
    pctDecimals = numUpDown("pctDecimals", "Numbers_PctDecimals", "Decimals (Δ%)",
        "Decimal places of Δ% and margins. Default: 1", 1, 0, 2);
    /** ChartKitchen labels.financeFormat: (1 234) instead of -1 234, exact zero as "–" */
    financeFormat = toggle("financeFormat", "Numbers_FinanceFormat", "Finance format (parentheses)",
        "Finance convention: negative values in parentheses instead of a minus sign — (1 234) — and zero as “–”. Applies to values, Δ and Δ%; positive Δ keep their “+”. Default: off", false);
    /**
     * ChartKitchen labels.sumSafeRounding (default off there, so off here):
     * largest-remainder rounding along the hierarchy, so the printed children
     * of a subtotal add up to the printed subtotal. Formula and margin rows
     * keep their exact rounding.
     */
    sumSafeRounding = toggle("sumSafeRounding", "Numbers_SumSafe", "Sum-safe rounding",
        "Rounds the value columns with the largest-remainder method so printed children add up exactly to their printed subtotal (formula and margin rows keep exact rounding). Default: off", false);

    name: string = "numbers";
    displayName: string = "Numbers";
    displayNameKey: string = "Card_Numbers";
    description: string = "Scaling, unit and decimals";
    descriptionKey: string = "Desc_Card_Numbers";
    /**
     * Scale sync (ChartKitchen scale.fixedMax / fixedVarMax, "minimum maximum"):
     * the value bars / cascades reach at least fixedMax, the Δ bars and Δ
     * waterfalls at least ±fixedVarMax — the same amount gets the same length in
     * every visual of equal width. Text with k / m / b suffixes, data units.
     */
    fixedMax = textInput("fixedMax", "Numbers_FixedMax", "Scale minimum-maximum (values)",
        "Value bars and value cascades are scaled at least up to this amount — identical scales across several visuals (IBCS). Data units, k / m / b allowed (e.g. 1.5m). Larger values still widen the scale. Empty = automatic",
        "e.g. 2m");
    fixedVarMax = textInput("fixedVarMax", "Numbers_FixedVarMax", "Scale minimum-maximum (Δ)",
        "Same for the Δ bars and integrated Δ waterfalls (symmetric ±). Data units, k / m / b allowed. Empty = automatic",
        "e.g. 250k");

    slices = [this.scaling, this.unitText, this.decimals, this.pctDecimals, this.financeFormat, this.sumSafeRounding,
        this.fixedMax, this.fixedVarMax];
}

/**
 * House terms (ChartKitchen labels.labelAc … labelFc): the scenario codes in
 * toolbar, legend, column heads, tooltips, title block and footers. Empty =
 * the IBCS code.
 */
export class ScenarioLabelsCardSettings extends FormattingSettingsCard {
    labelAc = textInput("labelAc", "Labels_RenameAc", "Rename AC",
        "Custom term for AC in toolbar, legend, column heads, tooltips, title and footers. Empty = AC", "AC");
    labelPy = textInput("labelPy", "Labels_RenamePy", "Rename PY",
        "Custom term for PY, also in the ΔPY heads. Empty = PY", "PY");
    labelPl = textInput("labelPl", "Labels_RenamePl", "Rename PL",
        "Custom term for PL, also in the ΔPL heads. Empty = PL", "PL");
    labelFc = textInput("labelFc", "Labels_RenameFc", "Rename FC",
        "Custom term for FC. Empty = FC", "FC");

    name: string = "labels";
    displayName: string = "Scenario names";
    displayNameKey: string = "Card_ScenNames";
    description: string = "House terms for AC, PY, PL and FC";
    descriptionKey: string = "Desc_Card_ScenNames";
    slices = [this.labelAc, this.labelPy, this.labelPl, this.labelFc];
}

/** ChartKitchen emptyState (1.44): the author's own text when nothing can be shown */
export class EmptyStateCardSettings extends FormattingSettingsCard {
    /**
     * What the visual shows in edit mode while the fields are missing — the
     * Start hub (1.3: tour, templates, demo, field guide behind big buttons),
     * the demo statement (1.0 Smart Start), a field guide, or the own message.
     * Readers and exports keep the plain landing text / own message.
     */
    mode = dropdown("mode", "Empty_Mode", "While fields are missing (edit mode)",
        "Start hub = big buttons for a feature tour, the template gallery, the demo and the field guide · Demo = example statement (Smart Start) · Field guide = which field goes where, minimal and extended · Own message = the title and text below. Readers always get the plain text or the own message. Default: start hub",
        emptyModeItems);
    title = textInput("title", "Empty_Title", "Custom title",
        "Replaces the heading when nothing is displayed (no fields bound in reading view, or the selection returns no rows). Empty = standard text",
        "e.g. No data for this selection");
    body = textInput("body", "Empty_Body", "Custom text",
        "Body text below the title in the empty state — e.g. which filters the reader should check. Empty = standard text",
        "e.g. Please adjust the period or the filters.");

    name: string = "emptyState";
    displayName: string = "Empty state";
    displayNameKey: string = "Card_EmptyState";
    description: string = "What readers see when there is nothing to show";
    descriptionKey: string = "Desc_Card_EmptyState";
    slices = [this.mode, this.title, this.body];
}

export class StyleCardSettings extends formattingSettings.CompositeCard {
    /**
     * Light / dark: "auto" follows the report theme (background luminance
     * below 0.35 = dark, the ChartKitchen rule); themes without a background
     * report white, so auto only flips on genuinely dark themes.
     */
    appearance = dropdown("appearance", "Style_Appearance", "Appearance",
        "Auto detects dark report themes from the background colour and switches ink, axes and surfaces to light tones; pages painted dark by hand need “Dark”. Default: Auto",
        appearanceItems);
    colorMode = dropdown("colorMode", "Style_ColorMode", "Variance colors",
        "Teal replaces IBCS green to stay readable with red-green color-vision deficiency (documented deviation). Default: teal",
        colorModeItems);
    variancePreset = dropdown("variancePreset", "Style_VariancePreset", "Variance color preset",
        "Blue / orange is the ColorBrewer pair #2C7BB6 / #E66101 — distinguishable even with complete color blindness and in black-and-white print. Auto keeps the variance colors above. The two color pickers below still override. Default: Auto",
        variancePresetItems);
    goodColor = color("goodColor", "Style_GoodColor", "Favorable Δ color (override)",
        "Empty = color of the variance mode", "");
    badColor = color("badColor", "Style_BadColor", "Unfavorable Δ color (override)",
        "Empty = color of the variance mode", "");
    /**
     * Accent of the interactive chrome — active toolbar buttons, the back
     * button of the tile view, breadcrumb hover. Never a data mark: columns,
     * axes and the AC fill keep the IBCS ink (#404040), which is also the
     * default here, so an untouched report looks exactly as before.
     */
    accentColor = color("accentColor", "Style_AccentColor", "Accent color (controls)",
        "Active toolbar buttons, back button and breadcrumb hover — never data marks or axes. Default: #404040", "#404040");
    /**
     * Paper of the visual: the ground behind the tiles of the zoom page and
     * behind the driver tree. Default white = exactly the previous look.
     */
    pageBackground = color("pageBackground", "Style_PageBg", "Page background",
        "Ground of the statement, the tree and the tile view. Default: white", "#FFFFFF");
    /** Fill of the cards: tree cards, micro cards, the big tile, hover panel. */
    cardBackground = color("cardBackground", "Style_CardBg", "Card background",
        "Fill of tree cards, tiles and the hover panel. Default: white", "#FFFFFF");
    fontPreset = dropdown("fontPreset", "Style_FontPreset", "Font size preset",
        "Scales every label at once: HD ×1 · Full HD ×1.25 · UHD ×1.6. Default: HD", fontPresetItems);
    /**
     * Fine scaling on top of the size preset, in percent. 100 % leaves the
     * preset alone; the product of both is capped inside the visual so a
     * presentation setting cannot turn the table into a poster.
     */
    fontZoom = numUpDown("fontZoom", "Style_FontZoom", "Font fine scaling (%)",
        "80–160 % on top of the size preset (100 = preset unchanged). Default: 100", 100, 80, 160);
    headerFontSize = numUpDown("headerFontSize", "Style_HeaderFont", "Header font size (px)",
        "0 = automatic (built-in sizes), otherwise 7–20 px. Default: 0", 0, 0, 20);
    headerColor = color("headerColor", "Style_HeaderColor", "Header font color (override)",
        "Empty = the built-in soft gray", "");
    density = dropdown("density", "Style_Density", "Default density",
        "Row height when the report opens; readers switch it in the toolbar. Default: Normal", densityItems);
    /**
     * Freeze the head — title block, toolbar, legend, scale note and the two
     * table header rows stay on screen while the body scrolls underneath.
     */
    stickyHeader = toggle("stickyHeader", "Style_StickyHeader", "Freeze the header while scrolling",
        "Title, toolbar, legend and the column headers stay on top while the rows scroll. Default: on", true);
    /**
     * Selection + native context menu: a click sets the Power BI selection of
     * the row (cross-filtering, and the drillthrough buttons of the page become
     * live), a right click opens the host menu with the drillthrough targets.
     * Off = the pre-0.17 behaviour, a pure display.
     */
    interactions = toggle("interactions", "Style_Interactions", "Selection & context menu active",
        "Click sets the page selection (cross-filtering, drillthrough), right click opens the native menu. Default: on", true);

    colors = new formattingSettings.Group({
        name: "styleColors",
        displayName: "Colors & appearance",
        displayNameKey: "Style_GroupColors",
        slices: [this.appearance, this.variancePreset, this.colorMode, this.goodColor, this.badColor, this.accentColor,
            this.pageBackground, this.cardBackground]
    });
    type = new formattingSettings.Group({
        name: "styleType",
        displayName: "Type & rows",
        displayNameKey: "Style_GroupType",
        slices: [this.fontPreset, this.fontZoom, this.headerFontSize, this.headerColor, this.density]
    });
    behavior = new formattingSettings.Group({
        name: "styleBehavior",
        displayName: "Behavior",
        displayNameKey: "Style_GroupBehavior",
        slices: [this.stickyHeader, this.interactions]
    });

    name: string = "style";
    displayName: string = "Style";
    displayNameKey: string = "Card_Style";
    description: string = "Colors, light / dark, type sizes and behavior";
    descriptionKey: string = "Desc_Card_Style";
    groups = [this.colors, this.type, this.behavior];
}

export class TitleBlockCardSettings extends FormattingSettingsCard {
    show = toggle("show", "Title_Show", "Show title block",
        "IBCS title: reporting unit · measure + unit · period + scenarios. Default: on", true);
    unitLine = textInput("unitLine", "Title_Unit", "Line 1 · reporting unit",
        "Who reports — company, segment, consolidation scope", "e.g. Contoso Group · Consolidated");
    measureLine = textInput("measureLine", "Title_Measure", "Line 2 · measure + unit",
        "Empty = “Income statement (P&L) in <unit>” from the data", "e.g. Income statement (P&L) in mEUR");
    periodLine = textInput("periodLine", "Title_Period", "Line 3 · period + scenarios",
        "Empty = period and scenarios from the data", "auto from data if empty");
    message = textInput("message", "Title_Message", "Message headline (interpretation)",
        "The finding in one sentence, bold above the title (IBCS SAY)", "e.g. EBITDA +7.4% vs PL, FY outlook -7.8%");
    /** ChartKitchen ibcsTitle.autoMessage: generated SAY line while no own message is set */
    autoMessage = toggle("autoMessage", "Title_AutoMessage", "Auto message",
        "Builds the message headline from the variance of the result row and the strongest / weakest driver when no own message is entered. Default: off", false);
    /**
     * 12er headline slot (IBCS 12A–12H): the message as a large line beside the
     * title, above the table. Text = the own message, else the generated one.
     */
    headline = toggle("headline", "Title_Headline", "Headline slot (large message)",
        "Shows the message as a large headline next to the title (IBCS 12-series layout); without an own message the generated auto message. Default: off", false);
    footer = textInput("footer", "Title_Footer", "Footer (data status · source)",
        "Footer line under the statement — e.g. data status and source; printed in exports too",
        "e.g. Actuals as of Jun 2026 · source: SAP FI");
    filterFooter = toggle("filterFooter", "Title_FilterFooter", "Show filter footer",
        "Second footer line with the filter context: the bound “Filter info” text measure (report filters are not visible to custom visuals) plus the visual's own state — hidden zero rows, reader scenario view. Default: off", false);

    name: string = "titleBlock";
    displayName: string = "Title block";
    displayNameKey: string = "Card_Title";
    description: string = "Three-line IBCS title and the message headline";
    descriptionKey: string = "Desc_Card_Title";
    slices = [this.show, this.unitLine, this.measureLine, this.periodLine, this.message, this.autoMessage, this.headline,
        this.footer, this.filterFooter];
}

export class HierarchyCardSettings extends FormattingSettingsCard {
    defaultLevel = numUpDown("defaultLevel", "Hierarchy_DefaultLevel", "Default expand level",
        "How deep the statement opens. 0 = expand everything. Default: 2", 2, 0, 8);
    indent = numUpDown("indent", "Hierarchy_Indent", "Indent per level (px)",
        "Indentation of the row labels per hierarchy level. Default: 16", 16, 6, 32);

    name: string = "hierarchy";
    displayName: string = "Hierarchy";
    displayNameKey: string = "Card_Hierarchy";
    description: string = "Expand level and indentation";
    descriptionKey: string = "Desc_Card_Hierarchy";
    slices = [this.defaultLevel, this.indent];
}

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    toolbarCard = new ToolbarCardSettings();
    columnsCard = new ColumnsCardSettings();
    numbersCard = new NumbersCardSettings();
    styleCard = new StyleCardSettings();
    titleCard = new TitleBlockCardSettings();
    hierarchyCard = new HierarchyCardSettings();
    labelsCard = new ScenarioLabelsCardSettings();
    emptyStateCard = new EmptyStateCardSettings();

    /** pane order by importance: columns (classic + mega) first, then display, numbers, style, title, hierarchy */
    cards = [this.columnsCard, this.toolbarCard, this.numbersCard, this.labelsCard, this.styleCard, this.titleCard,
        this.hierarchyCard, this.emptyStateCard];
}

/** what the visual knows about its data and view — drives the visibility gates of the pane */
export interface PaneContext {
    /** current view of the visual (table | bars | waterfall | tree); null = not known yet */
    view: string | null;
    /** bound measures / roles; null = no data yet (every gate stays open) */
    has: { py: boolean; pl: boolean; fc: boolean; period: boolean; fy?: boolean } | null;
    /** statement (GuV) data vs. structure data; null = not known */
    statement: boolean | null;
}

/**
 * Visibility gates of the format pane. Hidden slices keep their values — a
 * gate only declutters, it never changes what renders. Without data every
 * data-dependent gate stays open, so an empty visual shows the full pane.
 */
export function applyPaneGates(m: VisualFormattingSettingsModel, ctx: PaneContext): void {
    const tb = m.toolbarCard;
    for (const s of [tb.showView, tb.showPresets, tb.showReference, tb.showPeriods, tb.showUnit,
        tb.showDensity, tb.showLevels, tb.showOptions, tb.showScenario, tb.showValues, tb.showTemplate]) { s.visible = tb.show.value; }
    tb.startFolded.visible = tb.foldable.value;

    const c = m.columnsCard;
    const has = ctx.has;
    const py = has == null || has.py; const pl = has == null || has.pl;
    const fc = has == null || has.fc; const period = has == null || has.period;
    const view = ctx.view;
    c.revenueBase.visible = c.pctRevenue.value || c.pctOfRevenue.value;
    const fy = has == null || has.fy !== false;
    c.periodSort.visible = period;
    // the own-selection switches only matter for the preset that reads them
    const custom = String(c.preset.value?.value ?? "full") === "custom";
    for (const s of [c.colAc, c.colPy, c.colPl, c.colFc, c.colDelta]) { s.visible = custom; }
    c.colPy.visible = custom && py; c.colPl.visible = custom && pl; c.colFc.visible = custom && fc;
    // bar notation switches belong to the bars view
    c.barOverlap.visible = view == null || view === "bars";
    c.barTriangles.visible = view == null || view === "bars";
    // the mega switches belong to the table view, the tree start to the tree view
    c.mega.visible = view == null || view === "table";
    c.tree.visible = view == null || view === "tree";

    c.minuend.visible = fc || pl;
    c.showPY.visible = py; c.showPL.visible = pl;
    for (const s of [c.dPyAbs, c.dPyBar, c.dPyWaterfall, c.dPyPct, c.dPyPin]) { s.visible = py; }
    for (const s of [c.dPlAbs, c.dPlBar, c.dPlWaterfall, c.dPlPct, c.dPlPin]) { s.visible = pl; }
    // a value cascade needs a value column it can turn into a cascade
    c.valueCascade.visible = (c.showPY.value && py) || (c.showPL.value && pl) || c.showMinuend.value;
    c.secondBlock.visible = period;
    c.blockKind.visible = period || fy;
    c.leftBlockKind.visible = period && c.secondBlock.value;
    const structure = ctx.statement !== true;
    const statement = ctx.statement !== false;
    c.structureSubtotals.visible = structure;
    c.sort.visible = structure;
    c.showPctRows.visible = statement;
    // thresholds colour Δ numbers only — without a Δ number column there is nothing to colour
    const deltaNums = (py && (c.dPyAbs.value || c.dPyPct.value)) || (pl && (c.dPlAbs.value || c.dPlPct.value));
    c.thresholds.visible = deltaNums;
    const th = deltaNums && c.thresholds.value;
    c.thresholdAbs.visible = th;
    c.thresholdPct.visible = th;
    c.thresholdYtdAbs.visible = th && c.secondBlock.value && period;
    c.thresholdYtdPct.visible = th && c.secondBlock.value && period;
    c.sortBlock.visible = structure && c.secondBlock.value && period && String(c.sort.value.value) !== "cat";
    const anyChart = (py && (c.dPyBar.value || c.dPyPin.value || c.dPyWaterfall.value))
        || (pl && (c.dPlBar.value || c.dPlPin.value || c.dPlWaterfall.value)) || c.valueCascade.value;
    c.chartLabels.visible = anyChart;
    c.capBars.visible = (py && c.dPyBar.value) || (pl && c.dPlBar.value);

    const t = m.titleCard;
    for (const s of [t.unitLine, t.measureLine, t.periodLine, t.message, t.autoMessage, t.headline, t.footer, t.filterFooter]) {
        s.visible = t.show.value;
    }

    // the old teal / IBCS switch only matters while the preset follows it
    const st = m.styleCard;
    st.colorMode.visible = String(st.variancePreset.value?.value ?? "auto") === "auto";
}

/**
 * Resolve every enum-member label of one settings model through the host's
 * localization manager. Works on copies: the module arrays stay English.
 */
export function localizeSettings(m: VisualFormattingSettingsModel, tr: (key: string) => string | null): void {
    for (const card of m.cards) {
        const groups = card instanceof formattingSettings.CompositeCard ? card.groups : [card];
        for (const g of groups) {
            for (const s of (g.slices ?? []) as formattingSettings.Slice[]) {
                // placeholders travel as plain strings — key convention Ph_<displayNameKey>
                if (s instanceof formattingSettings.TextInput && s.displayNameKey) {
                    s.placeholder = tr("Ph_" + s.displayNameKey) ?? s.placeholder;
                    continue;
                }
                if (!(s instanceof formattingSettings.ItemDropdown)) { continue; }
                const items = s.items as LocEnumMember[];
                if (!items || items.length === 0 || !items[0].key) { continue; }
                const loc: LocEnumMember[] = items.map(it => ({ ...it, displayName: tr(it.key) ?? it.displayName }));
                const cur = s.value ? String(s.value.value) : null;
                s.items = loc;
                s.value = loc.find(it => String(it.value) === cur) ?? loc[0];
            }
        }
    }
}

/** every resource key the format pane uses (parity test, see test/i18n-test.js) */
export function paneKeys(m: VisualFormattingSettingsModel): string[] {
    const out = new Set<string>();
    const add = (k: unknown): void => { if (typeof k === "string" && k !== "") { out.add(k); } };
    for (const card of m.cards) {
        add(card.displayNameKey); add(card.descriptionKey);
        const groups = card instanceof formattingSettings.CompositeCard ? card.groups : [card];
        for (const g of groups) {
            if (g !== card) { add(g.displayNameKey); add(g.descriptionKey); }
            for (const s of (g.slices ?? []) as formattingSettings.Slice[]) {
                const sl = s as unknown as { displayNameKey?: string; descriptionKey?: string; items?: LocEnumMember[] };
                add(sl.displayNameKey); add(sl.descriptionKey);
                if (s instanceof formattingSettings.TextInput && sl.displayNameKey) { add("Ph_" + sl.displayNameKey); }
                for (const it of sl.items ?? []) { add(it.key); }
            }
        }
    }
    return [...out];
}
