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

export class ColumnsCardSettings extends FormattingSettingsCard {
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
        description: "Empty = last formula/KPI row with operands",
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

    name: string = "columns";
    displayName: string = "Columns";
    displayNameKey: string = "Card_Columns";
    slices = [this.preset, this.reference, this.pctRevenue, this.revenueBase, this.hideZeroRows,
        this.fitWidth, this.treeRoot, this.treeLevel, this.treeCard, this.treeStatus];
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

    name: string = "style";
    displayName: string = "Style";
    displayNameKey: string = "Card_Style";
    slices = [this.colorMode, this.fontPreset, this.headerFontSize, this.headerColor,
        this.goodColor, this.badColor, this.accentColor, this.density];
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
