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
        description: "Standardisierter IBCS-Titel: KPI · Einheit · Zeitraum: Szenarien.",
        value: true
    });

    kpi = new formattingSettings.TextInput({
        name: "kpi",
        displayName: "KPI name (auto if empty)",
        placeholder: "z. B. Umsatz",
        value: ""
    });

    period = new formattingSettings.TextInput({
        name: "period",
        displayName: "Period (auto if empty)",
        placeholder: "z. B. 2026",
        value: ""
    });

    message = new formattingSettings.TextInput({
        name: "message",
        displayName: "Message line",
        placeholder: "Kernbotschaft der Grafik (IBCS: SAY)",
        value: ""
    });

    name: string = "ibcsTitle";
    displayName: string = "IBCS title";
    slices: Array<FormattingSettingsSlice> = [this.show, this.kpi, this.period, this.message];
}

export class ChartCardSettings extends FormattingSettingsCard {
    orientation = new formattingSettings.ItemDropdown({
        name: "orientation",
        displayName: "Orientation",
        items: orientationItems,
        value: orientationItems[0]
    });

    comparisonMode = new formattingSettings.ItemDropdown({
        name: "comparisonMode",
        displayName: "Variance basis",
        description: "Basis für die Abweichungs-Panels. Auto: PL wenn vorhanden, sonst PY.",
        items: comparisonItems,
        value: comparisonItems[0]
    });

    showAbsoluteVariance = new formattingSettings.ToggleSwitch({
        name: "showAbsoluteVariance",
        displayName: "Absolute variance (ΔAC)",
        value: true
    });

    showRelativeVariance = new formattingSettings.ToggleSwitch({
        name: "showRelativeVariance",
        displayName: "Relative variance (ΔAC %)",
        value: true
    });

    invert = new formattingSettings.ToggleSwitch({
        name: "invert",
        displayName: "Invert (higher is bad)",
        description: "Für Kosten-KPIs: Mehrwert ist schlecht (rot), Minderwert ist gut (grün).",
        value: false
    });

    showTotal = new formattingSettings.ToggleSwitch({
        name: "showTotal",
        displayName: "Total (Σ) header",
        description: "Zeigt Summe und Gesamtabweichung als Kopfzeile.",
        value: true
    });

    topN = new formattingSettings.NumUpDown({
        name: "topN",
        displayName: "Top N (Bars)",
        description: "Nur im Bars-Modus: zeigt die N größten Kategorien, der Rest wird aggregiert. 0 = alle.",
        value: 0,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 0 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 50 }
        }
    });

    name: string = "chart";
    displayName: string = "Chart";
    slices: Array<FormattingSettingsSlice> = [
        this.orientation,
        this.comparisonMode,
        this.showAbsoluteVariance,
        this.showRelativeVariance,
        this.showTotal,
        this.topN,
        this.invert
    ];
}

export class ColorsCardSettings extends FormattingSettingsCard {
    actualColor = new formattingSettings.ColorPicker({
        name: "actualColor",
        displayName: "Actual (AC)",
        value: { value: "#404040" }
    });

    previousYearColor = new formattingSettings.ColorPicker({
        name: "previousYearColor",
        displayName: "Previous Year (PY)",
        value: { value: "#B3B3B3" }
    });

    planColor = new formattingSettings.ColorPicker({
        name: "planColor",
        displayName: "Plan outline (PL)",
        value: { value: "#404040" }
    });

    goodColor = new formattingSettings.ColorPicker({
        name: "goodColor",
        displayName: "Good variance",
        value: { value: "#61A544" }
    });

    badColor = new formattingSettings.ColorPicker({
        name: "badColor",
        displayName: "Bad variance",
        value: { value: "#D64541" }
    });

    name: string = "colors";
    displayName: string = "IBCS colors";
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
        value: true
    });

    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Text size",
        value: 10,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 6 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 24 }
        }
    });

    decimals = new formattingSettings.NumUpDown({
        name: "decimals",
        displayName: "Decimals",
        value: 1,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 0 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 3 }
        }
    });

    displayUnits = new formattingSettings.ItemDropdown({
        name: "displayUnits",
        displayName: "Display units",
        items: displayUnitsItems,
        value: displayUnitsItems[0]
    });

    name: string = "labels";
    displayName: string = "Data labels";
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
        description: "Skaliert das Basis-Chart mindestens bis zu diesem Wert — für identische Skalen über mehrere Visuals (IBCS). 0 = automatisch. Größere Datenwerte erweitern die Skala weiterhin.",
        value: 0,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 0 }
        }
    });

    fixedVarMax = new formattingSettings.NumUpDown({
        name: "fixedVarMax",
        displayName: "Variance minimum-maximum",
        description: "Wie oben, für das absolute Abweichungs-Panel (symmetrisch ±). 0 = automatisch.",
        value: 0,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 0 }
        }
    });

    name: string = "scale";
    displayName: string = "Scale sync";
    slices: Array<FormattingSettingsSlice> = [this.fixedMax, this.fixedVarMax];
}

export class CategoryAxisCardSettings extends FormattingSettingsCard {
    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Text size",
        value: 10,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 6 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 24 }
        }
    });

    name: string = "categoryAxis";
    displayName: string = "Category axis";
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
