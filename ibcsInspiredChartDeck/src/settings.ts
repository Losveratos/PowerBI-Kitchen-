"use strict";

import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

const orientationItems: powerbi.IEnumMember[] = [
    { value: "columns", displayName: "Columns (Zeit)" },
    { value: "bars", displayName: "Bars (Struktur)" },
    { value: "waterfall", displayName: "Waterfall / Brücke" }
];

const comparisonItems: powerbi.IEnumMember[] = [
    { value: "auto", displayName: "Auto" },
    { value: "py", displayName: "Previous Year (PY)" },
    { value: "plan", displayName: "Plan (PL)" }
];

const displayUnitsItems: powerbi.IEnumMember[] = [
    { value: "auto", displayName: "Auto" },
    { value: "none", displayName: "None" },
    { value: "k", displayName: "Thousands (k)" },
    { value: "m", displayName: "Millions (M)" },
    { value: "b", displayName: "Billions (B)" }
];

export class IbcsTitleCardSettings extends FormattingSettingsCard {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show IBCS title",
        displayNameKey: "Title_Show",
        description: "Standardisierter IBCS-Titel: KPI · Einheit · Zeitraum: Szenarien.",
        value: true
    });

    kpi = new formattingSettings.TextInput({
        name: "kpi",
        displayName: "KPI name (auto if empty)",
        displayNameKey: "Title_Kpi",
        placeholder: "z. B. Umsatz",
        value: ""
    });

    period = new formattingSettings.TextInput({
        name: "period",
        displayName: "Period (auto if empty)",
        displayNameKey: "Title_Period",
        placeholder: "z. B. 2026",
        value: ""
    });

    message = new formattingSettings.TextInput({
        name: "message",
        displayName: "Message line",
        displayNameKey: "Title_Message",
        placeholder: "Kernbotschaft der Grafik (IBCS: SAY)",
        value: ""
    });

    name: string = "ibcsTitle";
    displayName: string = "IBCS title";
    displayNameKey: string = "Card_IbcsTitle";
    slices: Array<FormattingSettingsSlice> = [this.show, this.kpi, this.period, this.message];
}

export class ChartCardSettings extends FormattingSettingsCard {
    orientation = new formattingSettings.ItemDropdown({
        name: "orientation",
        displayName: "Orientation",
        displayNameKey: "Chart_Orientation",
        items: orientationItems,
        value: orientationItems[0]
    });

    comparisonMode = new formattingSettings.ItemDropdown({
        name: "comparisonMode",
        displayName: "Variance basis",
        displayNameKey: "Chart_ComparisonMode",
        description: "Basis für die Abweichungs-Panels. Auto: PL wenn vorhanden, sonst PY.",
        items: comparisonItems,
        value: comparisonItems[0]
    });

    showAbsoluteVariance = new formattingSettings.ToggleSwitch({
        name: "showAbsoluteVariance",
        displayName: "Absolute variance (ΔAC)",
        displayNameKey: "Chart_ShowAbs",
        value: true
    });

    showRelativeVariance = new formattingSettings.ToggleSwitch({
        name: "showRelativeVariance",
        displayName: "Relative variance (ΔAC %)",
        displayNameKey: "Chart_ShowRel",
        value: true
    });

    invert = new formattingSettings.ToggleSwitch({
        name: "invert",
        displayName: "Invert (higher is bad)",
        displayNameKey: "Chart_Invert",
        description: "Für Kosten-KPIs: Mehrwert ist schlecht (rot), Minderwert ist gut (grün).",
        value: false
    });

    showTotal = new formattingSettings.ToggleSwitch({
        name: "showTotal",
        displayName: "Total (Σ) header",
        displayNameKey: "Chart_ShowTotal",
        description: "Zeigt Summe und Gesamtabweichung als Kopfzeile.",
        value: true
    });

    topN = new formattingSettings.NumUpDown({
        name: "topN",
        displayName: "Top N (Bars)",
        displayNameKey: "Chart_TopN",
        description: "Nur im Bars-Modus: zeigt die N größten Kategorien, der Rest wird aggregiert. 0 = alle.",
        value: 0,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 0 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 50 }
        }
    });

    highlight = new formattingSettings.TextInput({
        name: "highlight",
        displayName: "Highlight categories",
        displayNameKey: "Chart_Highlight",
        description: "Kommagetrennte Kategorie-Namen, die hervorgehoben werden (IBCS EMPHASIZE), z. B. der aktuelle Monat.",
        placeholder: "z. B. Jul, Aug",
        value: ""
    });

    name: string = "chart";
    displayName: string = "Chart";
    displayNameKey: string = "Card_Chart";
    slices: Array<FormattingSettingsSlice> = [
        this.orientation,
        this.comparisonMode,
        this.showAbsoluteVariance,
        this.showRelativeVariance,
        this.showTotal,
        this.topN,
        this.highlight,
        this.invert
    ];
}

export class ColorsCardSettings extends FormattingSettingsCard {
    actualColor = new formattingSettings.ColorPicker({
        name: "actualColor",
        displayName: "Actual (AC)",
        displayNameKey: "Colors_Actual",
        value: { value: "#404040" }
    });

    previousYearColor = new formattingSettings.ColorPicker({
        name: "previousYearColor",
        displayName: "Previous Year (PY)",
        displayNameKey: "Colors_PreviousYear",
        value: { value: "#B3B3B3" }
    });

    planColor = new formattingSettings.ColorPicker({
        name: "planColor",
        displayName: "Plan outline (PL)",
        displayNameKey: "Colors_Plan",
        value: { value: "#404040" }
    });

    goodColor = new formattingSettings.ColorPicker({
        name: "goodColor",
        displayName: "Good variance",
        displayNameKey: "Colors_Good",
        value: { value: "#61A544" }
    });

    badColor = new formattingSettings.ColorPicker({
        name: "badColor",
        displayName: "Bad variance",
        displayNameKey: "Colors_Bad",
        value: { value: "#D64541" }
    });

    name: string = "colors";
    displayName: string = "IBCS colors";
    displayNameKey: string = "Card_Colors";
    slices: Array<FormattingSettingsSlice> = [
        this.actualColor,
        this.previousYearColor,
        this.planColor,
        this.goodColor,
        this.badColor
    ];
}

export class LabelsCardSettings extends FormattingSettingsCard {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show labels",
        displayNameKey: "Labels_Show",
        value: true
    });

    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Text size",
        displayNameKey: "Labels_FontSize",
        value: 10,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 6 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 24 }
        }
    });

    decimals = new formattingSettings.NumUpDown({
        name: "decimals",
        displayName: "Decimals",
        displayNameKey: "Labels_Decimals",
        value: 1,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 0 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 3 }
        }
    });

    displayUnits = new formattingSettings.ItemDropdown({
        name: "displayUnits",
        displayName: "Display units",
        displayNameKey: "Labels_DisplayUnits",
        items: displayUnitsItems,
        value: displayUnitsItems[0]
    });

    name: string = "labels";
    displayName: string = "Data labels";
    displayNameKey: string = "Card_Labels";
    slices: Array<FormattingSettingsSlice> = [
        this.show,
        this.fontSize,
        this.decimals,
        this.displayUnits
    ];
}

export class ScaleCardSettings extends FormattingSettingsCard {
    fixedMax = new formattingSettings.NumUpDown({
        name: "fixedMax",
        displayName: "Scale minimum-maximum",
        displayNameKey: "Scale_FixedMax",
        description: "Skaliert das Basis-Chart mindestens bis zu diesem Wert — für identische Skalen über mehrere Visuals (IBCS). 0 = automatisch. Größere Datenwerte erweitern die Skala weiterhin.",
        value: 0,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 0 }
        }
    });

    fixedVarMax = new formattingSettings.NumUpDown({
        name: "fixedVarMax",
        displayName: "Variance minimum-maximum",
        displayNameKey: "Scale_FixedVarMax",
        description: "Wie oben, für das absolute Abweichungs-Panel (symmetrisch ±). 0 = automatisch.",
        value: 0,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 0 }
        }
    });

    capOverflow = new formattingSettings.ToggleSwitch({
        name: "capOverflow",
        displayName: "Cap outliers at maximum",
        displayNameKey: "Scale_CapOverflow",
        description: "Macht das Skalen-Maximum hart: größere Werte werden gekappt und mit Doppelstrich markiert (Label zeigt den echten Wert).",
        value: false
    });

    name: string = "scale";
    displayName: string = "Scale sync";
    displayNameKey: string = "Card_Scale";
    slices: Array<FormattingSettingsSlice> = [this.fixedMax, this.fixedVarMax, this.capOverflow];
}

export class CategoryAxisCardSettings extends FormattingSettingsCard {
    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Text size",
        displayNameKey: "CategoryAxis_FontSize",
        value: 10,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 6 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 24 }
        }
    });

    name: string = "categoryAxis";
    displayName: string = "Category axis";
    displayNameKey: string = "Card_CategoryAxis";
    slices: Array<FormattingSettingsSlice> = [this.fontSize];
}

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    ibcsTitleCard = new IbcsTitleCardSettings();
    chartCard = new ChartCardSettings();
    colorsCard = new ColorsCardSettings();
    labelsCard = new LabelsCardSettings();
    scaleCard = new ScaleCardSettings();
    categoryAxisCard = new CategoryAxisCardSettings();

    cards = [this.ibcsTitleCard, this.chartCard, this.colorsCard, this.labelsCard,
        this.scaleCard, this.categoryAxisCard];
}
