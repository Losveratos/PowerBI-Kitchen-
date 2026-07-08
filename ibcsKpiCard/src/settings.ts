"use strict";

import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

const comparisonItems: powerbi.IEnumMember[] = [
    { value: "auto", displayName: "Auto" },
    { value: "py", displayName: "Previous Year (PY)" },
    { value: "plan", displayName: "Plan (PL)" }
];

const fontPresetItems: powerbi.IEnumMember[] = [
    { value: "compact", displayName: "Kompakt (Dashboard-Kachel)" },
    { value: "fullhd", displayName: "Full HD (1080p)" },
    { value: "presentation", displayName: "Präsentation (4K / Beamer)" }
];

const bridgeOrientationItems: powerbi.IEnumMember[] = [
    { value: "columns", displayName: "Vertikal (Säulen)" },
    { value: "bars", displayName: "Horizontal (Balken)" }
];

const sortTilesItems: powerbi.IEnumMember[] = [
    { value: "orig", displayName: "Original (Datenreihenfolge)" },
    { value: "delta", displayName: "Δ absolut (größte zuerst)" },
    { value: "pct", displayName: "Δ % (größte zuerst)" },
    { value: "ac", displayName: "Größe (AC, größte zuerst)" }
];

const displayUnitsItems: powerbi.IEnumMember[] = [
    { value: "auto", displayName: "Auto" },
    { value: "none", displayName: "None" },
    { value: "k", displayName: "Thousands (k)" },
    { value: "m", displayName: "Millions (M)" },
    { value: "b", displayName: "Billions (B)" }
];

export class DisplayCardSettings extends FormattingSettingsCard {
    title = new formattingSettings.TextInput({
        name: "title",
        displayName: "Title (auto if empty)",
        displayNameKey: "Display_Title",
        description: "Leer = Name der AC-Measure. Bei Kachel-Raster steht je Kachel die Kategorie.",
        placeholder: "z. B. Umsatz",
        value: ""
    });

    periodLabel = new formattingSettings.TextInput({
        name: "periodLabel",
        displayName: "Period label",
        displayNameKey: "Display_Period",
        placeholder: "z. B. MTD Jun 2026",
        value: ""
    });

    comparisonMode = new formattingSettings.ItemDropdown({
        name: "comparisonMode",
        displayName: "Variance basis",
        displayNameKey: "Display_ComparisonMode",
        description: "Basis für Δ-Pill und Mini-Brücke. Auto: PL wenn vorhanden, sonst PY.",
        items: comparisonItems,
        value: comparisonItems[0]
    });

    showBridge = new formattingSettings.ToggleSwitch({
        name: "showBridge",
        displayName: "Mini bridge",
        displayNameKey: "Display_ShowBridge",
        description: "Mini-Brücke Basis → Δ → AC rechts auf der Karte (IBCS-Notation: PY grau, PL Outline, AC dunkel).",
        value: true
    });

    bridgeOrientation = new formattingSettings.ItemDropdown({
        name: "bridgeOrientation",
        displayName: "Bridge orientation",
        displayNameKey: "Display_BridgeOrientation",
        description: "Vertikal: drei Säulen nebeneinander (Zeit-Optik). Horizontal: drei Balken untereinander (Struktur-Optik).",
        items: bridgeOrientationItems,
        value: bridgeOrientationItems[0]
    });

    titleSize = new formattingSettings.NumUpDown({
        name: "titleSize",
        displayName: "Title size",
        displayNameKey: "Display_TitleSize",
        description: "Schriftgröße der Karten-Überschrift (Kategorie/Titel). Wirkt zusätzlich zum Größen-Preset.",
        value: 11,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 8 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 40 }
        }
    });

    showSecondary = new formattingSettings.ToggleSwitch({
        name: "showSecondary",
        displayName: "Second reference row",
        displayNameKey: "Display_ShowSecondary",
        description: "Zeigt die jeweils andere Basis (PL bzw. PY) als zweite Referenzzeile, wenn beide Measures gefüllt sind.",
        value: true
    });

    invert = new formattingSettings.ToggleSwitch({
        name: "invert",
        displayName: "Invert (higher is bad)",
        displayNameKey: "Display_Invert",
        description: "Für Kosten-KPIs: Mehrwert ist schlecht (rot), Minderwert ist gut (grün).",
        value: false
    });

    showSparkline = new formattingSettings.ToggleSwitch({
        name: "showSparkline",
        displayName: "Sparkline (needs Trend field)",
        displayNameKey: "Display_ShowSparkline",
        description: "Mini-Trend je Karte (AC solide, FC gestrichelt, PY dünn grau) — erscheint, wenn das Trend-Feld (z. B. Monat) gefüllt ist.",
        value: true
    });

    sortTiles = new formattingSettings.ItemDropdown({
        name: "sortTiles",
        displayName: "Sort tiles",
        displayNameKey: "Display_SortTiles",
        description: "Reihenfolge der Kacheln: Original, nach absoluter Abweichung, nach Δ % oder nach Größe (AC) — größte Treiber zuerst.",
        items: sortTilesItems,
        value: sortTilesItems[0]
    });

    tolerance = new formattingSettings.NumUpDown({
        name: "tolerance",
        displayName: "Neutral zone ± %",
        displayNameKey: "Display_Tolerance",
        description: "Ampel-Logik: Abweichungen innerhalb ±N % gelten als neutral (grau statt grün/rot) — verhindert Alles-rot/grün-Rauschen. 0 = aus.",
        value: 0,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 0 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 50 }
        }
    });

    minTileWidth = new formattingSettings.NumUpDown({
        name: "minTileWidth",
        displayName: "Min tile width (px)",
        displayNameKey: "Display_MinTileWidth",
        description: "Kachel-Raster: Mindestbreite einer Kachel — steuert, wie viele Spalten entstehen.",
        value: 240,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 140 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 800 }
        }
    });

    name: string = "display";
    displayName: string = "KPI card";
    displayNameKey: string = "Card_Display";
    slices: Array<FormattingSettingsSlice> = [
        this.title, this.titleSize, this.periodLabel, this.comparisonMode,
        this.showBridge, this.bridgeOrientation, this.showSparkline, this.showSecondary,
        this.invert, this.tolerance, this.sortTiles, this.minTileWidth
    ];
}

export class LabelsCardSettings extends FormattingSettingsCard {
    fontPreset = new formattingSettings.ItemDropdown({
        name: "fontPreset",
        displayName: "Size preset",
        displayNameKey: "Labels_FontPreset",
        description: "Skaliert alle Schriften der Karte: Kompakt (×1), Full HD (×1,5 — Standard für 1080p) oder Präsentation (×2).",
        items: fontPresetItems,
        value: fontPresetItems[0]
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
        description: "Auto wählt k/M/B nach Größenordnung — 1.245.000 wird zu 1,2 M.",
        items: displayUnitsItems,
        value: displayUnitsItems[0]
    });

    name: string = "labels";
    displayName: string = "Number format";
    displayNameKey: string = "Card_Labels";
    slices: Array<FormattingSettingsSlice> = [this.fontPreset, this.decimals, this.displayUnits];
}

export class ColorsCardSettings extends FormattingSettingsCard {
    goodColor = new formattingSettings.ColorPicker({
        name: "goodColor",
        displayName: "Good variance",
        displayNameKey: "Colors_Good",
        value: { value: "#2E9E5B" }
    });

    badColor = new formattingSettings.ColorPicker({
        name: "badColor",
        displayName: "Bad variance",
        displayNameKey: "Colors_Bad",
        value: { value: "#D64541" }
    });

    name: string = "colors";
    displayName: string = "Colors";
    displayNameKey: string = "Card_Colors";
    slices: Array<FormattingSettingsSlice> = [this.goodColor, this.badColor];
}

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    displayCard = new DisplayCardSettings();
    labelsCard = new LabelsCardSettings();
    colorsCard = new ColorsCardSettings();

    cards = [this.displayCard, this.labelsCard, this.colorsCard];
}
