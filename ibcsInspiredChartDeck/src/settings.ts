"use strict";

import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

/**
 * Enum-member labels with a resource key: the format pane serializes the items
 * across the sandbox boundary, so a DisplayNameGetter function would be dropped.
 * Instead, localizeEnumItems() resolves the keys once via the host's
 * localizationManager (called from the visual constructor); the English literal
 * stays as fallback for locales without a resources.resjson.
 */
type LocEnumMember = powerbi.IEnumMember & { key: string };

const orientationItems: LocEnumMember[] = [
    { value: "columns", displayName: "Columns (Time)", key: "Enum_Orientation_Columns" },
    { value: "bars", displayName: "Bars (Structure)", key: "Enum_Orientation_Bars" },
    { value: "line", displayName: "Line (long time series)", key: "Enum_Orientation_Line" },
    { value: "waterfall", displayName: "Waterfall / Bridge", key: "Enum_Orientation_Waterfall" },
    { value: "intwaterfall", displayName: "Integrated Bridge (Time)", key: "Enum_Orientation_IntWaterfall" },
    { value: "catbridge", displayName: "Category Bridge (Structure)", key: "Enum_Orientation_CatBridge" },
    { value: "table", displayName: "Table (IBCS)", key: "Enum_Orientation_Table" },
    { value: "pareto", displayName: "Pareto (Structure)", key: "Enum_Orientation_Pareto" },
    { value: "dumbbell", displayName: "Dumbbell · Before/After (Structure)", key: "Enum_Orientation_Dumbbell" },
    { value: "slope", displayName: "Slope · Before/After", key: "Enum_Orientation_Slope" },
    { value: "scatter", displayName: "Scatter / bubble (correlation)", key: "Enum_Orientation_Scatter" },
    { value: "cards", displayName: "KPI Cards (Tiles)", key: "Enum_Orientation_Cards" },
    { value: "pnl", displayName: "P&L Statement (IBCS)", key: "Enum_Orientation_Pnl" }
];

const comparisonItems: LocEnumMember[] = [
    { value: "auto", displayName: "Auto", key: "Enum_Comparison_Auto" },
    { value: "py", displayName: "Previous Year (PY)", key: "Enum_Comparison_Py" },
    { value: "plan", displayName: "Plan (PL)", key: "Enum_Comparison_Plan" },
    { value: "fcrev", displayName: "Prior-month FC (revision)", key: "Enum_Comparison_FcRev" }
];

const acFcSplitItems: LocEnumMember[] = [
    { value: "off", displayName: "Off (FC only where AC is missing)", key: "Enum_AcFcSplit_Off" },
    { value: "full", displayName: "FC = full-month outlook (top-up)", key: "Enum_AcFcSplit_Full" },
    { value: "rest", displayName: "FC = rest of month (additive)", key: "Enum_AcFcSplit_Rest" }
];

const displayUnitsItems: LocEnumMember[] = [
    { value: "auto", displayName: "Auto", key: "Enum_Units_Auto" },
    { value: "none", displayName: "None", key: "Enum_Units_None" },
    { value: "k", displayName: "Thousands (k)", key: "Enum_Units_K" },
    { value: "m", displayName: "Millions (M)", key: "Enum_Units_M" },
    { value: "b", displayName: "Billions (B)", key: "Enum_Units_B" }
];

const cumulativeKindItems: LocEnumMember[] = [
    { value: "ytd", displayName: "YTD (year to date)", key: "Enum_CumKind_Ytd" },
    { value: "qtd", displayName: "QTD (quarter to date)", key: "Enum_CumKind_Qtd" },
    { value: "r12", displayName: "R12 (rolling 12 periods)", key: "Enum_CumKind_R12" }
];

const fontPresetItems: LocEnumMember[] = [
    { value: "compact", displayName: "HD (dashboard tile)", key: "Enum_FontPreset_Compact" },
    { value: "fullhd", displayName: "Full HD (1080p)", key: "Enum_FontPreset_FullHd" },
    { value: "presentation", displayName: "UHD (4K / projector)", key: "Enum_FontPreset_Presentation" }
];

const valueColumnsItems: LocEnumMember[] = [
    { value: "ac", displayName: "AC only", key: "Enum_ValueCols_Ac" },
    { value: "basis", displayName: "AC + variance basis", key: "Enum_ValueCols_Basis" },
    { value: "all", displayName: "AC · PY · PL", key: "Enum_ValueCols_All" }
];

const matrixCompareItems: LocEnumMember[] = [
    { value: "none", displayName: "Off (Δ vs. basis)", key: "Enum_MxCompare_None" },
    { value: "prevcol", displayName: "Δ vs. previous column", key: "Enum_MxCompare_Prev" }
];

const totalRowPositionItems: LocEnumMember[] = [
    { value: "bottom", displayName: "Bottom (below rows)", key: "Enum_TotalPos_Bottom" },
    { value: "top", displayName: "Top (below header)", key: "Enum_TotalPos_Top" }
];

const rowDensityItems: LocEnumMember[] = [
    { value: "compact", displayName: "Compact", key: "Enum_RowDensity_Compact" },
    { value: "normal", displayName: "Normal", key: "Enum_RowDensity_Normal" },
    { value: "airy", displayName: "Airy", key: "Enum_RowDensity_Airy" }
];

const gridLinesItems: LocEnumMember[] = [
    { value: "horizontal", displayName: "Horizontal", key: "Enum_GridLines_Horizontal" },
    { value: "none", displayName: "None", key: "Enum_GridLines_None" },
    { value: "both", displayName: "Horizontal + vertical", key: "Enum_GridLines_Both" }
];

const cellLayoutItems: LocEnumMember[] = [
    { value: "columns", displayName: "Columns (value · Δ side by side)", key: "Enum_CellLayout_Columns" },
    { value: "stacked", displayName: "Two rows: value on top, Δ below", key: "Enum_CellLayout_Stacked" }
];

const cardBasisItems: LocEnumMember[] = [
    { value: "basis", displayName: "Variance basis (ΔPL/ΔPY)", key: "Enum_CardBasis_Basis" },
    { value: "benchmark", displayName: "Benchmark (BM)", key: "Enum_CardBasis_Bm" }
];

const cardHighlightItems: LocEnumMember[] = [
    { value: "both", displayName: "Good & bad", key: "Enum_CardHl_Both" },
    { value: "bad", displayName: "Only bad", key: "Enum_CardHl_Bad" },
    { value: "good", displayName: "Only good", key: "Enum_CardHl_Good" }
];

const cardRefValueItems: LocEnumMember[] = [
    { value: "off", displayName: "Only variances (Δ)", key: "Enum_CardRefVals_Off" },
    { value: "basis", displayName: "Basis value (PY or PL)", key: "Enum_CardRefVals_Basis" },
    { value: "all", displayName: "All bound scenarios", key: "Enum_CardRefVals_All" }
];

const cardSortItems: LocEnumMember[] = [
    { value: "none", displayName: "Data order", key: "Enum_CardSort_None" },
    { value: "deviation", displayName: "Biggest deviation first", key: "Enum_CardSort_Dev" },
    { value: "worst", displayName: "Worst first (bad on top)", key: "Enum_CardSort_Worst" },
    { value: "best", displayName: "Best first (good on top)", key: "Enum_CardSort_Best" }
];

// KPI-Karten mit gebundener Trend-Rolle: Mini-Chart im unteren Kartenbereich
// (ersetzt dann die Mini-Brücke) und welcher Wert die große Kartenzahl stellt
const cardTrendChartItems: LocEnumMember[] = [
    { value: "off", displayName: "Off (mini bridge as before)", key: "Enum_CardTrendChart_Off" },
    { value: "sparkline", displayName: "Sparkline", key: "Enum_CardTrendChart_Sparkline" },
    { value: "columns", displayName: "Columns", key: "Enum_CardTrendChart_Columns" }
];

const cardTrendValueItems: LocEnumMember[] = [
    { value: "last", displayName: "Last value (latest period)", key: "Enum_CardTrendValue_Last" },
    { value: "sum", displayName: "Sum over all periods", key: "Enum_CardTrendValue_Sum" }
];

// Kategorie-Brücke: Kaskade horizontal (bisher) oder als vertikale Säulen-Kaskade;
// "auto" = bisheriges Verhalten (horizontal)
const bridgeOrientationItems: LocEnumMember[] = [
    { value: "auto", displayName: "Automatic", key: "Enum_BridgeOrient_Auto" },
    { value: "bars", displayName: "Bars (horizontal)", key: "Enum_BridgeOrient_Bars" },
    { value: "columns", displayName: "Columns (vertical)", key: "Enum_BridgeOrient_Columns" }
];

const pinStyleItems: LocEnumMember[] = [
    { value: "auto", displayName: "Automatic (per mode)", key: "Enum_PinStyle_Auto" },
    { value: "round", displayName: "Round", key: "Enum_PinStyle_Round" },
    { value: "square", displayName: "Square", key: "Enum_PinStyle_Square" }
];

const labelDensityItems: LocEnumMember[] = [
    { value: "auto", displayName: "Automatic (thin out)", key: "Enum_LabelDensity_Auto" },
    { value: "all", displayName: "All", key: "Enum_LabelDensity_All" },
    { value: "ends", displayName: "First · last · extremes", key: "Enum_LabelDensity_Ends" }
];

// Wasserfall-Achsenschnitt (IBCS UN 5.3): off = immer nullbasiert, kein Chip ·
// auto = nullbasiert, Leser schneidet per Chip · on = geschnitten (wenn zulässig)
const wfAxisBreakItems: LocEnumMember[] = [
    { value: "off", displayName: "Off (zero-based)", key: "Enum_WfBreak_Off" },
    { value: "auto", displayName: "Auto (reader decides via chip)", key: "Enum_WfBreak_Auto" },
    { value: "on", displayName: "On (axis broken)", key: "Enum_WfBreak_On" }
];

// Scatter / Bubble: Quadranten-Teilung je Achse (Referenzlinien übersteuern) und
// Punktfarbe — einfarbig AC oder Status gut/schlecht/grau über ΔBasis + Wesentlichkeit
const scatterQuadrantItems: LocEnumMember[] = [
    { value: "off", displayName: "Off", key: "Enum_ScatterQuad_Off" },
    { value: "mean", displayName: "Mean (Ø)", key: "Enum_ScatterQuad_Mean" },
    { value: "median", displayName: "Median", key: "Enum_ScatterQuad_Median" }
];

const scatterColorByItems: LocEnumMember[] = [
    { value: "single", displayName: "Single color (AC)", key: "Enum_ScatterColor_Single" },
    { value: "status", displayName: "Status ΔPY/ΔPL (good · bad · grey)", key: "Enum_ScatterColor_Status" },
    // 1.48: Farbe je Wert des Serie-Felds (ohne Kacheln sonst je Small-Multiples-Gruppe)
    { value: "group", displayName: "By group/series (legend)", key: "Enum_ScatterColor_Group" }
];

// Scatter v3: Trendlinie (lineare Regression über die sichtbaren Punkte)
const scatterTrendItems: LocEnumMember[] = [
    { value: "off", displayName: "Off", key: "Enum_ScatterTrend_Off" },
    { value: "linear", displayName: "Linear", key: "Enum_ScatterTrend_Linear" }
];

// 1.49: IBCS-Chart-Templates als Presets (PnL-Muster). Ein Template schreibt in
// EINEM persistProperties-Merge Modus + Vergleich + Panels + passende Schalter;
// danach ist alles frei änderbar. C07 (Fläche) und C11 gibt es im Visual nicht.
const templateItems: LocEnumMember[] = [
    { value: "off", displayName: "Off (no template)", key: "Enum_Template_Off" },
    { value: "C01", displayName: "C01 · Stacked columns (series)", key: "Enum_Template_C01" },
    { value: "C02", displayName: "C02 · Stacked bars (series)", key: "Enum_Template_C02" },
    { value: "C03", displayName: "C03 · Columns + variances (PY)", key: "Enum_Template_C03" },
    { value: "C04", displayName: "C04 · Bars + variances (PL)", key: "Enum_Template_C04" },
    { value: "C05", displayName: "C05 · Integrated bridge (time)", key: "Enum_Template_C05" },
    { value: "C06", displayName: "C06 · Category bridge vertical", key: "Enum_Template_C06" },
    { value: "C08", displayName: "C08 · Line (long time series)", key: "Enum_Template_C08" },
    { value: "C09", displayName: "C09 · Scatter", key: "Enum_Template_C09" },
    { value: "C10", displayName: "C10 · Bubble (scatter + size)", key: "Enum_Template_C10" },
    { value: "C12", displayName: "C12 · Waterfall / bridge", key: "Enum_Template_C12" },
    { value: "C13", displayName: "C13 · Small multiples", key: "Enum_Template_C13" }
];

// 1.49: Leer-Zustand — Demo-Galerie (bisheriges Verhalten) · Feld-Intro · eigene Nachricht
// 1.50: Start-Hub als neuer Standard (1.51: Loslegen · Tour · Vorlagen · Demo · Felder); die drei
// bisherigen Werte bleiben wählbar und verhalten sich wie in 1.49
const emptyModeItems: LocEnumMember[] = [
    { value: "hub", displayName: "Start hub (get started, tour, templates, demo, fields)", key: "Enum_EmptyMode_Hub" },
    { value: "demo", displayName: "Demo gallery (pick a chart type)", key: "Enum_EmptyMode_Demo" },
    { value: "fields", displayName: "Field guide (which field goes where)", key: "Enum_EmptyMode_Fields" },
    { value: "message", displayName: "Own message (title / text below)", key: "Enum_EmptyMode_Message" }
];

/** resolve all enum-member labels once via the host's localization manager */
export function localizeEnumItems(lm: powerbi.extensibility.ILocalizationManager): void {
    const lists: LocEnumMember[][] = [templateItems, orientationItems, comparisonItems, appearanceItems,
        displayUnitsItems, cumulativeKindItems, fontPresetItems, valueColumnsItems,
        cardBasisItems, matrixCompareItems, cardHighlightItems, cardSortItems,
        cardRefValueItems,
        pinStyleItems, labelDensityItems, totalRowPositionItems, rowDensityItems,
        gridLinesItems, cellLayoutItems, wfAxisBreakItems, scatterQuadrantItems,
        scatterColorByItems, scatterTrendItems, cardTrendChartItems, cardTrendValueItems,
        bridgeOrientationItems, emptyModeItems];
    for (const items of lists) {
        for (const it of items) {
            const loc = lm.getDisplayName(it.key);
            if (loc && loc !== it.key) { it.displayName = loc; }
        }
    }
}

export class IbcsTitleCardSettings extends FormattingSettingsCard {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show IBCS title",
        displayNameKey: "Title_Show",
        description: "Standardisierter IBCS-Titel: KPI · Einheit · Zeitraum: Szenarien.",
        descriptionKey: "Desc_Title_Show",
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

    footer = new formattingSettings.TextInput({
        name: "footer",
        displayName: "Footer (data status)",
        displayNameKey: "Title_Footer",
        description: "Fußzeile unten links — z. B. Datenstand und Quelle: „Ist per Jun 2026 · Stand 05.07. · Quelle: SAP FI\".",
        descriptionKey: "Desc_Title_Footer",
        placeholder: "z. B. Ist per Jun 2026 · Stand 05.07.",
        value: ""
    });

    autoMessage = new formattingSettings.ToggleSwitch({
        name: "autoMessage",
        displayName: "Auto message",
        displayNameKey: "Title_AutoMessage",
        description: "Erzeugt die Botschafts-Zeile (Treiber-Text) automatisch aus Gesamtabweichung und größten Treibern, wenn keine eigene Botschaft eingegeben ist. Standard aus.",
        descriptionKey: "Desc_Title_AutoMessage",
        value: false
    });

    filterFooter = new formattingSettings.ToggleSwitch({
        name: "filterFooter",
        displayName: "Show filter footer",
        displayNameKey: "Title_FilterFooter",
        description: "Zweite Fußzeile mit dem Filterkontext: zeigt die gebundene „Filter-Info“-Text-Measure (Report-Filter sind für Custom Visuals nicht per API sichtbar) plus den Anzeige-Zustand des Visuals selbst — YTD, Top-N, In-Chart-Sortierung, Σ-Ausschlüsse, Vergleich.",
        descriptionKey: "Desc_Title_FilterFooter",
        value: false
    });

    name: string = "ibcsTitle";
    displayName: string = "IBCS title";
    displayNameKey: string = "Card_IbcsTitle";
    slices: Array<FormattingSettingsSlice> = [this.show, this.kpi, this.period, this.message, this.autoMessage, this.footer, this.filterFooter];
}

export class ChartCardSettings extends formattingSettings.CompositeCard {
    template = new formattingSettings.ItemDropdown({
        name: "template",
        displayName: "IBCS chart template",
        displayNameKey: "Chart_Template",
        description: "Startpunkt nach den IBCS-Chart-Templates: setzt Chart-Typ, Vergleichsbasis, Abweichungs-Panels und die passenden Schalter in einem Schritt — danach ist jede Einstellung frei änderbar. C01/C02 stapeln über das Feld „Stack-Serie\", C10 braucht zusätzlich das Feld „Blasengröße\", C13 behält den Chart-Typ und braucht das Feld „Small Multiples\". Nicht enthalten: C07 (Fläche) und C11. Aus = keine Vorlage.",
        descriptionKey: "Desc_Chart_Template",
        items: templateItems,
        value: templateItems[0]
    });

    orientation = new formattingSettings.ItemDropdown({
        name: "orientation",
        displayName: "Chart type",
        displayNameKey: "Chart_Orientation",
        items: orientationItems,
        value: orientationItems[0]
    });

    smartStart = new formattingSettings.ToggleSwitch({
        name: "smartStart",
        displayName: "Smart-Start suggestions",
        displayNameKey: "Chart_SmartStart",
        description: "Zeigt einen dezenten Vorschlags-Chip oben links im Chart, wenn die gebundenen Felder eindeutig auf einen passenderen Modus hindeuten (z. B. Datum + AC + PL → Säulen mit ΔPL). Nur im Bearbeitungsmodus des Reports sichtbar, nie in der Leseansicht oder in Exporten.",
        descriptionKey: "Desc_Chart_SmartStart",
        value: true
    });

    comparisonMode = new formattingSettings.ItemDropdown({
        name: "comparisonMode",
        displayName: "Variance basis",
        displayNameKey: "Chart_ComparisonMode",
        description: "Basis für die Abweichungs-Panels. Auto: PL wenn vorhanden, sonst PY.",
        descriptionKey: "Desc_Chart_ComparisonMode",
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
        descriptionKey: "Desc_Chart_Invert",
        value: false
    });

    invertList = new formattingSettings.TextInput({
        name: "invertList",
        displayName: "Invert per category",
        displayNameKey: "Chart_InvertList",
        description: "Kommagetrennte Kategorien, deren Wertung umgekehrt wird (z. B. Kosten-Zeilen neben Umsatz-Zeilen in KPI-Karten oder der GuV-Tabelle). Wirkt zusätzlich zum globalen Invert-Schalter.",
        descriptionKey: "Desc_Chart_InvertList",
        placeholder: "z. B. Opex, Materialaufwand",
        value: ""
    });

    acFcSplit = new formattingSettings.ItemDropdown({
        name: "acFcSplit",
        displayName: "AC + FC in the same period",
        displayNameKey: "Chart_AcFcSplit",
        description: "Ein teilweise abgeschlossener Monat liefert AC UND FC: „Vollmonatsprognose\" zeigt den AC-Sockel solide und stockt schraffiert bis zum FC-Wert auf (Säule = max(AC, FC)); „Restmonat\" addiert den FC-Wert oben auf AC (Säule = AC + FC). Wichtig: Die falsche Wahl zählt den Monat doppelt — sie muss zur Definition der FC-Measure passen. Label und Σ zeigen den Gesamtwert, der Tooltip beide Anteile. Aus = bisheriges Verhalten (FC nur, wenn AC fehlt).",
        descriptionKey: "Desc_Chart_AcFcSplit",
        items: acFcSplitItems,
        value: acFcSplitItems[0]
    });

    hideBlankCat = new formattingSettings.ToggleSwitch({
        name: "hideBlankCat",
        displayName: "Hide (blank) category",
        displayNameKey: "Chart_HideBlankCat",
        description: "Blendet Zeilen ohne Kategoriewert aus — sie erscheinen sonst als „(blank)\"-Balken, -Zeile oder -KPI-Karte. Standard aus, damit keine Daten unbemerkt verschwinden (Beta-Feedback).",
        descriptionKey: "Desc_Chart_HideBlankCat",
        value: false
    });

    showTotal = new formattingSettings.ToggleSwitch({
        name: "showTotal",
        displayName: "Total (Σ) header",
        displayNameKey: "Chart_ShowTotal",
        description: "Zeigt Summe und Gesamtabweichung als Kopfzeile.",
        descriptionKey: "Desc_Chart_ShowTotal",
        value: true
    });

    topN = new formattingSettings.NumUpDown({
        name: "topN",
        displayName: "Top N (structure modes)",
        displayNameKey: "Chart_TopN",
        description: "Struktur-Modi (Bars, Kategorie-Brücke, Tabelle, Dumbbell, KPI-Karten): zeigt die N größten Kategorien, der Rest wird aggregiert. 0 = alle.",
        descriptionKey: "Desc_Chart_TopN",
        value: 0,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 0 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 50 }
        }
    });

    movingAverage = new formattingSettings.NumUpDown({
        name: "movingAverage",
        displayName: "Moving average (periods)",
        displayNameKey: "Chart_MovingAverage",
        description: "Dünne Overlay-Linie mit gleitendem Durchschnitt über N Perioden (Columns/Line). 0 = aus.",
        descriptionKey: "Desc_Chart_MovingAverage",
        value: 0,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 0 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 24 }
        }
    });

    dualVariance = new formattingSettings.ToggleSwitch({
        name: "dualVariance",
        displayName: "Dual variance (PL + PY)",
        displayNameKey: "Chart_DualVariance",
        description: "Zeigt zusätzlich die Abweichungs-Panels zur zweiten Basis — ΔPL und ΔPY gleichzeitig (benötigt PY und PL).",
        descriptionKey: "Desc_Chart_DualVariance",
        value: false
    });

    cumulative = new formattingSettings.ToggleSwitch({
        name: "cumulative",
        displayName: "Cumulative (YTD)",
        displayNameKey: "Chart_Cumulative",
        description: "Schaltet alle Panels auf kumulierte Sicht: Säulen, ΔBasis und ΔBasis % zeigen Year-to-Date-Werte.",
        descriptionKey: "Desc_Chart_Cumulative",
        value: false
    });

    cumulativeKind = new formattingSettings.ItemDropdown({
        name: "cumulativeKind",
        displayName: "Cumulation kind",
        displayNameKey: "Chart_CumKind",
        description: "YTD setzt am Fiskaljahres-Beginn zurück, QTD an jedem Quartalsstart, R12 summiert rollierend die letzten 12 Perioden. Monats-Erkennung über die Kategorie-Labels (Jan…Dez, 01…12).",
        descriptionKey: "Desc_Chart_CumKind",
        items: cumulativeKindItems,
        value: cumulativeKindItems[0]
    });

    fiscalStart = new formattingSettings.NumUpDown({
        name: "fiscalStart",
        displayName: "Fiscal year starts in month",
        displayNameKey: "Chart_FiscalStart",
        description: "1 = Januar … 12 = Dezember. Bestimmt, wo YTD/QTD zurücksetzen (z. B. 4 für ein Fiskaljahr ab April).",
        descriptionKey: "Desc_Chart_FiscalStart",
        value: 1,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 1 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 12 }
        }
    });

    highlight = new formattingSettings.TextInput({
        name: "highlight",
        displayName: "Highlight categories",
        displayNameKey: "Chart_Highlight",
        description: "Kommagetrennte Kategorie-Namen, die hervorgehoben werden (IBCS EMPHASIZE), z. B. der aktuelle Monat.",
        descriptionKey: "Desc_Chart_Highlight",
        placeholder: "z. B. Jul, Aug",
        value: ""
    });

    compareClick = new formattingSettings.ToggleSwitch({
        name: "compareClick",
        displayName: "Compare on click",
        displayNameKey: "Chart_CompareClick",
        description: "Nur Columns/Bars: zwei Säulen/Balken anklicken zeigt die Differenz (absolut + %) als Overlay — Klicks filtern dann nicht mehr quer. Klick ins Leere setzt zurück. Standard aus.",
        descriptionKey: "Desc_Chart_CompareClick",
        value: false
    });

    groupEvery = new formattingSettings.NumUpDown({
        name: "groupEvery",
        displayName: "Group separator every N",
        displayNameKey: "Chart_GroupEvery",
        description: "Zeichnet eine dünne Trennlinie nach jeweils N Kategorien, quer durch alle Panels — für Struktur-Vergleiche mit natürlichen Untergruppen (z. B. Regionen). 0 = aus.",
        descriptionKey: "Desc_Chart_GroupEvery",
        value: 0,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 0 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 50 }
        }
    });

    waterfallStyle = new formattingSettings.ToggleSwitch({
        name: "waterfallStyle",
        displayName: "Draw as bridge (instead of single bars)",
        displayNameKey: "Chart_WaterfallStyle",
        description: "Nur Säulen/Balken: zeigt die Kategorien als Wasserfall-Brücke von der Basis (PY/PL) zu AC mit Verbindungslinien, statt als einzelne Balken. Unterschied zum Chart-Typ „Waterfall / Brücke\": Dort kaskadieren die Datenwerte selbst (sum/delta-Zeilen) — dieser Schalter verbrückt die Abweichung zur Basis im Säulen-/Balken-Modus. Optional — Standard ist aus.",
        descriptionKey: "Desc_Chart_WaterfallStyle",
        value: false
    });

    sortByImpact = new formattingSettings.ToggleSwitch({
        name: "sortByImpact",
        displayName: "Sort by impact",
        displayNameKey: "Chart_SortByImpact",
        description: "Nur bei Waterfall bridge: sortiert die Kategorien nach Abweichungsgröße (größter Treiber zuerst). Eine Top-N-Rest-Zeile bleibt am Ende. Auch per Klick auf das ⇅-Symbol im Chart umschaltbar.",
        descriptionKey: "Desc_Chart_SortByImpact",
        value: false
    });

    chartButtons = new formattingSettings.ToggleSwitch({
        name: "chartButtons",
        displayName: "In-chart buttons",
        displayNameKey: "Chart_Buttons",
        description: "Integrierte/Kategorie-Brücke: zeigt klickbare Buttons oben rechts im Chart — ΔPY/ΔPL-Referenz-Umschalter, ⇅ Sortierung und ▶ Aufbau-Animation. Der Enduser kann die Varianz-Basis direkt im Bericht wechseln; die Wahl wird persistiert.",
        descriptionKey: "Desc_Chart_Buttons",
        value: true
    });

    chipMenu = new formattingSettings.ToggleSwitch({
        name: "chipMenu",
        displayName: "Fold chart controls (☰)",
        displayNameKey: "Chart_ChipMenu",
        description: "Klappt die Bedienleisten im Chart (Sortieren, YTD, Achsenschnitt, ΔPY/ΔPL, ⇅, ▶, Ausnahme-Chip) hinter ein kleines ☰ oben rechts. Ein Klick klappt sie auf, ein zweiter wieder zu; nichts wird gespeichert. Aus (Standard): Bedienleisten wie bisher immer sichtbar.",
        descriptionKey: "Desc_Chart_ChipMenu",
        value: false
    });

    pyTriangle = new formattingSettings.ToggleSwitch({
        name: "pyTriangle",
        displayName: "PY as triangle (AC + PY + PL)",
        displayNameKey: "Chart_PyTriangle",
        description: "IBCS-Notation bei drei Szenarien: Sind AC, PY und PL gebunden, wird das Vorjahr als graues Dreieck (\u25b6) am Säulen-/Balkenrand auf PY-Höhe gezeigt statt als dritte Säule — weniger überladen. Aus = PY wieder als graue Säule.",
        descriptionKey: "Desc_Chart_PyTriangle",
        value: true
    });

    driverNote = new formattingSettings.ToggleSwitch({
        name: "driverNote",
        displayName: "Driver note in chart",
        displayNameKey: "Chart_DriverNote",
        description: "Kategorie-Brücke: kursive Notiz am größten Treiber („größter Treiber · n % der Gesamtabweichung“) — überlagert den Zeilenbereich, hier abschaltbar.",
        descriptionKey: "Desc_Chart_DriverNote",
        value: true
    });

    cumulativeButton = new formattingSettings.ToggleSwitch({
        name: "cumulativeButton",
        displayName: "YTD button in chart",
        displayNameKey: "Chart_CumButton",
        description: "Zeigt einen klickbaren „YTD\"-Button oben rechts im Chart (Columns/Line) — der Enduser schaltet die kumulierte Sicht direkt im Bericht um; die Wahl wird persistiert. Standard aus.",
        descriptionKey: "Desc_Chart_CumButton",
        value: false
    });

    materialityAbs = new formattingSettings.NumUpDown({
        name: "materialityAbs",
        displayName: "Materiality from (absolute)",
        displayNameKey: "Chart_MaterialityAbs",
        description: "Wesentlichkeits-Schwelle: Abweichungen unter diesem absoluten Betrag werden grau statt rot/grün dargestellt (Panels, Wasserfall-Stufen, Tabelle). 0 = aus.",
        descriptionKey: "Desc_Chart_MaterialityAbs",
        value: 0,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 0 }
        }
    });

    materialityPct = new formattingSettings.NumUpDown({
        name: "materialityPct",
        displayName: "Materiality from (%)",
        displayNameKey: "Chart_MaterialityPct",
        description: "Wesentlichkeits-Schwelle in Prozent: Abweichungen unter diesem Δ % werden grau dargestellt. Sind beide Schwellen gesetzt, muss eine Abweichung beide überschreiten, um farbig zu sein. 0 = aus.",
        descriptionKey: "Desc_Chart_MaterialityPct",
        value: 0,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 0 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 100 }
        }
    });

    exceptionOnly = new formattingSettings.ToggleSwitch({
        name: "exceptionOnly",
        displayName: "Exceptions only",
        displayNameKey: "Chart_ExceptionOnly",
        description: "Exception-Reporting: Zeigt nur Kategorien, deren Abweichung die Wesentlichkeits-Schwelle überschreitet; alle übrigen werden zu EINER Sammelzeile „Unauffällig (n)\" verdichtet — deren Werte werden aufsummiert, die Σ-Kopfzeile bleibt also unverändert. Setzt eine Schwelle voraus (absolut oder %). Wirkt in Balken, KPI-Karten und der flachen Tabelle (nicht in Matrix- oder Hierarchie-Tabellen); Zeitachsen (Säulen/Linie) und Kaskaden (Wasserfall, Brücken, GuV) bleiben lückenlos. Standard aus.",
        descriptionKey: "Desc_Chart_ExceptionOnly",
        value: false
    });

    pinStyle = new formattingSettings.ItemDropdown({
        name: "pinStyle",
        displayName: "Δ%-pin shape",
        displayNameKey: "Chart_PinStyle",
        description: "Form des Lollipop-Kopfes der Δ%-Pins. „Automatisch\" behält den bisherigen Stil je Modus (Säulen/Balken/Wasserfall rund, Brücken und Tabelle quadratisch); „Rund\" oder „Quadratisch\" vereinheitlichen alle Modi.",
        descriptionKey: "Desc_Chart_PinStyle",
        items: pinStyleItems,
        value: pinStyleItems[0]
    });

    deltaIcons = new formattingSettings.ToggleSwitch({
        name: "deltaIcons",
        displayName: "Trend icons ▲▼●",
        displayNameKey: "Chart_DeltaIcons",
        description: "Stellt den Δ-Werten in Tabelle und KPI-Karten Richtungspfeile voran: ▲ Anstieg, ▼ Rückgang, ● unwesentlich (unter der Materialitätsschwelle). Lesbar auch in Schwarzweiß-Druck und für Farbenblinde — die Farbe bewertet weiterhin gut/schlecht.",
        descriptionKey: "Desc_Chart_DeltaIcons",
        value: false
    });

    multiplesTotal = new formattingSettings.ToggleSwitch({
        name: "multiplesTotal",
        displayName: "Total tile (Σ)",
        displayNameKey: "Chart_MultiplesTotal",
        description: "Stellt eine „Σ Gesamt\"-Kachel voran — Summe über alle Gruppen, auf derselben Skala (IBCS).",
        descriptionKey: "Desc_Chart_MultiplesTotal",
        value: false
    });

    multiplesTopN = new formattingSettings.NumUpDown({
        name: "multiplesTopN",
        displayName: "Top N tiles",
        displayNameKey: "Chart_MultiplesTopN",
        description: "Zeigt nur die N größten Gruppen (nach Summe AC) als Kacheln — die übrigen werden zu einer „Rest\"-Kachel aggregiert. 0 = alle.",
        descriptionKey: "Desc_Chart_MultiplesTopN",
        value: 0,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 0 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 24 }
        }
    });

    multiplesHero = new formattingSettings.ToggleSwitch({
        name: "multiplesHero",
        displayName: "First tile large",
        displayNameKey: "Chart_MultiplesHero",
        description: "Gibt der ersten Kachel (z. B. „Σ Gesamt\" oder der größten Gruppe) mehr Platz — alle Kacheln behalten dieselbe Skala (IBCS CT 13).",
        descriptionKey: "Desc_Chart_MultiplesHero",
        value: false
    });

    multiplesSameScale = new formattingSettings.ToggleSwitch({
        name: "multiplesSameScale",
        displayName: "Bridges: same scale for all tiles",
        displayNameKey: "Chart_MultiplesSameScale",
        description: "Skaliert auch die Brücken-Modi (Integrierte Brücke, Kategorie-Brücke) über alle Kacheln identisch (IBCS). Standard: aus — jede Brücken-Kachel skaliert für sich. Säulen, Balken und Wasserfall teilen sich die Skala immer.",
        descriptionKey: "Desc_Chart_MultiplesSameScale",
        value: false
    });

    multiplesGroup = new formattingSettings.Group({
        name: "chartMultiples",
        displayName: "Small Multiples",
        displayNameKey: "Group_Multiples",
        slices: [this.multiplesTotal, this.multiplesTopN, this.multiplesHero,
            this.multiplesSameScale]
    });

    bridgeOrientation = new formattingSettings.ItemDropdown({
        name: "bridgeOrientation",
        displayName: "Bridge orientation",
        displayNameKey: "Chart_BridgeOrientation",
        description: "Nur Kategorie-Brücke: „Balken (horizontal)\" zeigt die Kaskade zeilenweise wie bisher (Kategorien untereinander, Δ%-Pins rechts). „Säulen (vertikal)\" zeichnet sie als klassischen Säulen-Wasserfall — Basis-Anker (PY/PL) links, eine Treiber-Säule je Kategorie, AC-Anker und Überleitung rechts, Δ%-Pins oben. „Automatisch\" = bisheriges Verhalten (horizontal).",
        descriptionKey: "Desc_Chart_BridgeOrientation",
        items: bridgeOrientationItems,
        value: bridgeOrientationItems[0]
    });

    // 1.52.1: shortened anchors with a visible axis break, the steps of the bridge
    // keep one linear scale (IBCS UN 5.3) — integrated bridge, vertical category
    // bridge and waterfall
    bridgeBreak = new formattingSettings.ToggleSwitch({
        name: "bridgeBreak",
        displayName: "Shorten anchors (axis break)",
        displayNameKey: "Chart_BridgeBreak",
        description: "Integrierte Brücke, Kategorie-Brücke (Säulen) und Wasserfall: Die Summen-Anker (z. B. PY und AC+FC) werden mit sichtbarem Achsenbruch ⫽ gekürzt, damit die Brückenstufen in echter Höhe lesbar werden. Alle Stufen bleiben in einer Skala. Gekürzt wird nur, wenn alle Stände oberhalb des Schnitts liegen. Standard: aus.",
        descriptionKey: "Desc_Chart_BridgeBreak",
        value: false
    });

    bridgeGroup = new formattingSettings.Group({
        name: "chartBridge",
        displayName: "Bridge",
        displayNameKey: "Group_Bridge",
        slices: [this.waterfallStyle, this.sortByImpact, this.bridgeOrientation, this.bridgeBreak]
    });

    valueColumns = new formattingSettings.ItemDropdown({
        name: "valueColumns",
        displayName: "Value columns",
        displayNameKey: "Table_ValueCols",
        description: "Zusätzliche Zahlenspalten neben AC: die Varianzbasis (PY oder PL, je nach Abweichungsbasis) oder beide Referenzszenarien — für druck- und boardtaugliche Tabellen ohne Balken-Interpretation.",
        descriptionKey: "Desc_Table_ValueCols",
        items: valueColumnsItems,
        value: valueColumnsItems[0]
    });

    structureEdit = new formattingSettings.ToggleSwitch({
        name: "structureEdit",
        displayName: "Edit row structure (click)",
        displayNameKey: "Table_StructureEdit",
        description: "Bearbeitungsmodus: Klick auf eine Zeile öffnet ein kleines Menü mit „Invertieren“, „Ergebniszeile“ und „Aus Summen ausnehmen“ — die Ein-Klick-GuV ohne Datenmodell-Änderung. Die Wahl wird in den Listen unten persistiert; zum Berichten wieder ausschalten.",
        descriptionKey: "Desc_Table_StructureEdit",
        value: false
    });

    resultList = new formattingSettings.TextInput({
        name: "resultList",
        displayName: "Result rows",
        displayNameKey: "Table_ResultList",
        description: "Kommagetrennte Zeilennamen, die als Ergebniszeilen formatiert werden (fett, Trennlinie, vom Σ ausgenommen; im Wasserfall als Anker) — Alternative zur Waterfall-Typ-Rolle.",
        descriptionKey: "Desc_Table_ResultList",
        placeholder: "z. B. EBIT, Rohertrag",
        value: ""
    });

    skipList = new formattingSettings.TextInput({
        name: "skipList",
        displayName: "Skip rows (exclude from totals)",
        displayNameKey: "Table_SkipList",
        description: "Kommagetrennte Zeilennamen, die nicht in Σ-Zeile, Skalen und Wasserfall-Kaskade einfließen (z. B. nachrichtliche Positionen). Die Zeile bleibt sichtbar, wird aber dezent dargestellt.",
        descriptionKey: "Desc_Table_SkipList",
        placeholder: "z. B. Davon-Positionen",
        value: ""
    });

    hideList = new formattingSettings.TextInput({
        name: "hideList",
        displayName: "Hide rows",
        displayNameKey: "Table_HideList",
        description: "Kommagetrennte Zeilennamen, die nur ausgeblendet werden — Σ-Zeile, Skalen und Formeln rechnen weiter mit ihnen (anders als „Aus Summen ausnehmen“). Auch per Klick im Struktur-Modus setzbar.",
        descriptionKey: "Desc_Table_HideList",
        placeholder: "z. B. Sonstige, Intern",
        value: ""
    });

    chartList = new formattingSettings.TextInput({
        name: "chartList",
        displayName: "Chart only these rows",
        displayNameKey: "Table_ChartList",
        description: "Kommagetrennte Zeilennamen: Wenn befüllt, zeigen nur diese Zeilen die Balken-/Pin-Grafiken — alle anderen bleiben reine Zahlenzeilen. Leer = Grafiken überall. Die Σ-Zeile behält ihre Grafik immer.",
        descriptionKey: "Desc_Table_ChartList",
        placeholder: "z. B. Umsatz, EBIT",
        value: ""
    });

    indentList = new formattingSettings.TextInput({
        name: "indentList",
        displayName: "Indent rows (davon)",
        displayNameKey: "Table_IndentList",
        description: "Kommagetrennte Zeilennamen, die als „davon:“-Positionen eingerückt und dezent dargestellt werden — ohne Hierarchie-Feld. Meist kombiniert mit „Aus Summen ausnehmen“.",
        descriptionKey: "Desc_Table_IndentList",
        placeholder: "z. B. davon Export",
        value: ""
    });

    rowFormats = new formattingSettings.TextInput({
        name: "rowFormats",
        displayName: "Row number formats",
        displayNameKey: "Table_RowFormats",
        description: "Zahlenformat pro Zeile, mit Semikolon getrennt: „Marge = 0.0 %; Menge = #,0“. Prozent multipliziert mit 100; Werte erscheinen unskaliert (keine T€-Teilung) — für gemischte €-, %- und Stück-Zeilen.",
        descriptionKey: "Desc_Table_RowFormats",
        placeholder: "z. B. Marge = 0.0 %",
        value: ""
    });

    matrixCompare = new formattingSettings.ItemDropdown({
        name: "matrixCompare",
        displayName: "Matrix: column comparison",
        displayNameKey: "Table_MatrixCompare",
        description: "Vergleich innerhalb der Matrix-Spalten: „Δ vs. Vorspalte“ ersetzt das ΔBasis je Block durch die Veränderung zur vorherigen Spalte (Periodenvergleich Q2 vs. Q1, Mär vs. Feb …).",
        descriptionKey: "Desc_Table_MatrixCompare",
        items: matrixCompareItems,
        value: matrixCompareItems[0]
    });

    formulaRows = new formattingSettings.TextInput({
        name: "formulaRows",
        displayName: "Formula rows",
        displayNameKey: "Table_FormulaRows",
        description: "Berechnete Zeilen, mit Semikolon getrennt: „EBIT = Umsatz - Kosten“ ergänzt eine Summenzeile, „Marge = EBIT / Umsatz“ eine %-Zeile. Operanden sind Zeilennamen; Operatoren bitte mit Leerzeichen umgeben. Formelzeilen fließen nicht in die Σ-Zeile ein.",
        descriptionKey: "Desc_Table_FormulaRows",
        placeholder: "z. B. Marge = EBIT / Umsatz",
        value: ""
    });

    totalRowPosition = new formattingSettings.ItemDropdown({
        name: "totalRowPosition",
        displayName: "Total (Σ) row position",
        displayNameKey: "Table_TotalRowPos",
        description: "Wo die Σ-Gesamtzeile steht: „Unten“ (Standard, deutsche GuV-Lesart) unter allen Zeilen, „Oben“ direkt unter dem Kopf (IBCS). Bleibt beim Scrollen fixiert.",
        descriptionKey: "Desc_Table_TotalRowPos",
        items: totalRowPositionItems,
        value: totalRowPositionItems[0]
    });

    zebraStripes = new formattingSettings.ToggleSwitch({
        name: "zebraStripes",
        displayName: "Zebra stripes",
        displayNameKey: "Table_ZebraStripes",
        description: "Legt jede zweite Datenzeile mit einem sehr dezenten Hintergrund an — leichtere Zeilenverfolgung in breiten Tabellen. Im Hochkontrast-Modus aus. Standard aus.",
        descriptionKey: "Desc_Table_ZebraStripes",
        value: false
    });

    rowDensity = new formattingSettings.ItemDropdown({
        name: "rowDensity",
        displayName: "Row density",
        displayNameKey: "Table_RowDensity",
        description: "Zeilenhöhe: „Kompakt“ für dichte Tabellen, „Normal“ (Standard) wie bisher, „Luftig“ für mehr Weißraum (Präsentation). Skaliert nur die Obergrenze; sehr hohe Visuals bleiben gedeckelt.",
        descriptionKey: "Desc_Table_RowDensity",
        items: rowDensityItems,
        value: rowDensityItems[1]
    });

    gridLines = new formattingSettings.ItemDropdown({
        name: "gridLines",
        displayName: "Grid lines",
        displayNameKey: "Table_GridLines",
        description: "Trennlinien-Stil: „Horizontal“ (Standard) nur Zeilenlinien wie bisher, „Keine“ für ein ruhiges Bild, „Horizontal + vertikal“ ergänzt dezente Spalten-/Blocktrenner.",
        descriptionKey: "Desc_Table_GridLines",
        items: gridLinesItems,
        value: gridLinesItems[0]
    });

    cellLayout = new formattingSettings.ItemDropdown({
        name: "cellLayout",
        displayName: "Matrix: cell layout",
        displayNameKey: "Table_CellLayout",
        description: "Nur Matrix: „Spalten“ (Standard) zeigt Wert und ΔBasis nebeneinander. „Zwei Zeilen“ setzt den Wert groß nach oben und die kleinere Δ-Zahl direkt darunter in dieselbe Zelle — die Matrix wird etwa halb so breit. Der Δ-Minibalken entfällt dabei; Referenzspalten (Werte-Spalten) bleiben als eigene Spalten neben dem Wert.",
        descriptionKey: "Desc_Table_CellLayout",
        items: cellLayoutItems,
        value: cellLayoutItems[0]
    });

    exportExpandAll = new formattingSettings.ToggleSwitch({
        name: "exportExpandAll",
        displayName: "Export: expand all levels",
        displayNameKey: "Chart_ExportExpandAll",
        description: "PDF-/PowerPoint-Export und Abo-Mails rendern Tabelle, Matrix und GuV-Statement mit allen Zeilen- und Spalten-Ebenen aufgeklappt — der Ausdruck zeigt alles, unabhängig vom Klapp-Zustand am Bildschirm. Aus = Export zeigt den aktuellen Zustand.",
        descriptionKey: "Desc_Chart_ExportExpandAll",
        value: true
    });

    autoExpandHierarchy = new formattingSettings.ToggleSwitch({
        name: "autoExpandHierarchy",
        displayName: "Auto-expand hierarchy",
        displayNameKey: "Chart_AutoExpand",
        description: "Liegen mehrere Felder in „Kategorie\", klappt das Visual die Drill-Hierarchie automatisch auf — der klickbare Zeilenbaum erscheint sofort beim Hineinziehen, ohne die ⫟-Drill-Knöpfe im Visual-Kopf. Manuelles Hochklappen bleibt bestehen (nur ein Feld-Wechsel löst erneut aus). Standard an.",
        descriptionKey: "Desc_Chart_AutoExpand",
        value: true
    });

    tableGroup = new formattingSettings.Group({
        name: "chartTable",
        displayName: "Table",
        displayNameKey: "Group_Table",
        slices: [this.valueColumns, this.autoExpandHierarchy, this.structureEdit, this.resultList, this.skipList,
            this.hideList, this.chartList, this.indentList, this.rowFormats,
            this.matrixCompare, this.formulaRows, this.totalRowPosition,
            this.zebraStripes, this.rowDensity, this.gridLines, this.cellLayout]
    });

    cardStatusBasis = new formattingSettings.ItemDropdown({
        name: "cardStatusBasis",
        displayName: "Status basis (stripe & background)",
        displayNameKey: "Cards_StatusBasis",
        description: "Wogegen Streifen und Hintergrund-Ampel bewerten: gegen die Abweichungsbasis (ΔPL bzw. ΔPY) oder gegen die gebundene Benchmark-Measure — für Monitoring gegen Zielwerte/Schwellen.",
        descriptionKey: "Desc_Cards_StatusBasis",
        items: cardBasisItems,
        value: cardBasisItems[0]
    });

    cardTint = new formattingSettings.ToggleSwitch({
        name: "cardTint",
        displayName: "Tint card background",
        displayNameKey: "Cards_Tint",
        description: "Färbt den Karten-Hintergrund dezent: leicht grün wenn besser, leicht rot wenn schlechter als die Status-Basis — neutral (unterhalb der Wesentlichkeit) bleibt ohne Farbe. Für Monitoring-Wände; im Hochkontrast-Modus aus.",
        descriptionKey: "Desc_Cards_Tint",
        value: false
    });

    cardTintStrength = new formattingSettings.NumUpDown({
        name: "cardTintStrength",
        displayName: "Tint intensity %",
        displayNameKey: "Cards_TintStrength",
        description: "Deckkraft der Hintergrund-Färbung in Prozent (4–40). Standard 12 — kräftiger für Kontrollraum-Monitore, dezenter für Board-Reports.",
        descriptionKey: "Desc_Cards_TintStrength",
        value: 12,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 4 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 40 }
        }
    });

    cardBullet = new formattingSettings.ToggleSwitch({
        name: "cardBullet",
        displayName: "Bullet vs. benchmark",
        displayNameKey: "Cards_Bullet",
        description: "Kleines Bullet-Chart auf der Karte: AC-Balken auf hellem Band, Benchmark als Tick — unter der Zahl (Stapel-Layout) bzw. neben den Δ-Zeilen (flaches Layout). Braucht die Benchmark-Rolle.",
        descriptionKey: "Desc_Cards_Bullet",
        value: false
    });

    cardBulletZoom = new formattingSettings.ToggleSwitch({
        name: "cardBulletZoom",
        displayName: "Bullet: zoom to target range",
        displayNameKey: "Cards_BulletZoom",
        description: "Spreizt das Bullet auf den Bereich um AC und Benchmark statt bei Null zu starten — KPIs nahe am Ziel (97 vs. 99) werden unterscheidbar. Der Achsenbruch am linken Balkenende kennzeichnet die gekappte Skala.",
        descriptionKey: "Desc_Cards_BulletZoom",
        value: false
    });

    cardHighlight = new formattingSettings.ItemDropdown({
        name: "cardHighlight",
        displayName: "Highlight status",
        displayNameKey: "Cards_Highlight",
        description: "Welche Richtung farbig hervorgehoben wird: beide (Ampel), nur schlechte (Problem-Monitoring — Positives bleibt neutral) oder nur gute (Erfolgs-Board). Gilt für Streifen, Hintergrund, Δ-Zeilen und Bullet.",
        descriptionKey: "Desc_Cards_Highlight",
        items: cardHighlightItems,
        value: cardHighlightItems[0]
    });

    cardBars = new formattingSettings.ToggleSwitch({
        name: "cardBars",
        displayName: "Show mini bridge (AC/PY bars)",
        displayNameKey: "Cards_Bars",
        description: "Zeigt die kleine Balken-Brücke Basis → Δ → AC unten auf der Karte. Aus: reine Zahlen-Karte (großer Wert + Δ-Zeilen), ruhiger für dichte KPI-Wände.",
        descriptionKey: "Desc_Cards_Bars",
        value: true
    });

    cardSameScale = new formattingSettings.ToggleSwitch({
        name: "cardSameScale",
        displayName: "Same scale for all cards",
        displayNameKey: "Cards_SameScale",
        description: "Alle Mini-Brücken teilen einen Maßstab: gleiche Beträge ergeben gleich hohe Balken (IBCS: identische Skalen). Für Karten derselben Kennzahl je Kategorie (z. B. Umsatz je Kanal). Aus: jede Karte skaliert für sich, nötig bei Karten mit verschiedenen Einheiten.",
        descriptionKey: "Desc_Cards_SameScale",
        value: false
    });

    cardTrendChart = new formattingSettings.ItemDropdown({
        name: "cardTrendChart",
        displayName: "Trend mini chart",
        displayNameKey: "Cards_TrendChart",
        description: "Nur mit gebundenem „Trend (Zeit)\"-Feld: zeigt die Zeitreihe je Karte unten auf der Karte — als Sparkline (AC-Linie, PY dünn grau dahinter, letzter Punkt markiert und beschriftet, FC gestrichelt) oder als Mini-Säulen (negative unter der Nulllinie, letzte Säule hervorgehoben, FC schraffiert). Ersetzt dann die Mini-Brücke; das Bullet bleibt unabhängig schaltbar. Skala je Karte (Karten haben verschiedene Einheiten), Säulen nullbasiert. „Aus\" = Mini-Brücke wie bisher.",
        descriptionKey: "Desc_Cards_TrendChart",
        items: cardTrendChartItems,
        value: cardTrendChartItems[1]
    });

    cardTrendValue = new formattingSettings.ItemDropdown({
        name: "cardTrendValue",
        displayName: "Card value with trend",
        displayNameKey: "Cards_TrendValue",
        description: "Nur mit gebundenem „Trend (Zeit)\"-Feld: welche Zahl die Karte groß zeigt. „Letzter Wert\" (Standard) = letzte Periode mit Ist-Wert — der aktuelle Stand; PY/PL/FC/BM stammen aus derselben Periode, damit Δ und Status zusammenpassen. „Summe\" = Summe über alle Perioden (z. B. YTD-Umsatz), PY/PL/FC/BM ebenfalls summiert. Für Quoten/Bestände „Letzter Wert\" wählen.",
        descriptionKey: "Desc_Cards_TrendValue",
        items: cardTrendValueItems,
        value: cardTrendValueItems[0]
    });

    cardRefValues = new formattingSettings.ItemDropdown({
        name: "cardRefValues",
        displayName: "Show reference values",
        displayNameKey: "Cards_RefValues",
        description: "Zeigt neben der Abweichung auch den Referenzwert selbst auf der Karte: „Basiswert“ blendet die Vergleichsbasis ein (VJ bzw. Plan), „Alle gebundenen Szenarien“ zusätzlich die übrigen gebundenen Measures (VJ, Plan, Prognose, Benchmark). Bei knapper Kachelhöhe entfallen die unteren Zeilen.",
        descriptionKey: "Desc_Cards_RefValues",
        items: cardRefValueItems,
        value: cardRefValueItems[0]
    });

    cardSort = new formattingSettings.ItemDropdown({
        name: "cardSort",
        displayName: "Sort by deviation",
        displayNameKey: "Cards_Sort",
        description: "Ordnet die Karten nach der farbrelevanten Abweichung (Benchmark bzw. ΔPL/ΔPY, je nach Status-Basis): größte Abweichung oben-links — für maximalen Fokus. „Datenreihenfolge“ lässt sie wie im Modell.",
        descriptionKey: "Desc_Cards_Sort",
        items: cardSortItems,
        value: cardSortItems[0]
    });

    cardsGroup = new formattingSettings.Group({
        name: "chartCards",
        displayName: "KPI cards",
        displayNameKey: "Group_Cards",
        slices: [this.cardStatusBasis, this.cardHighlight, this.cardRefValues, this.cardSort,
            this.cardBars, this.cardSameScale, this.cardTrendChart, this.cardTrendValue, this.cardTint,
            this.cardTintStrength, this.cardBullet, this.cardBulletZoom]
    });

    scatterQuadrant = new formattingSettings.ItemDropdown({
        name: "scatterQuadrant",
        displayName: "Quadrant lines",
        displayNameKey: "Chart_ScatterQuadrant",
        description: "Scatter: gestrichelte Mittellinien teilen die Punktwolke in vier Quadranten — beim Mittelwert (Ø, Standard) oder Median von X und Y. Eine Referenzlinie (Skala-Karte: Y-Wert bzw. X-Wert) ersetzt die jeweilige Mittellinie. Aus = keine Quadranten.",
        descriptionKey: "Desc_Chart_ScatterQuadrant",
        items: scatterQuadrantItems,
        value: scatterQuadrantItems[1]
    });

    scatterColorBy = new formattingSettings.ItemDropdown({
        name: "scatterColorBy",
        displayName: "Point color",
        displayNameKey: "Chart_ScatterColorBy",
        description: "Scatter: „Einfarbig\" zeigt alle Punkte in der AC-Farbe (Standard). „Status\" färbt nach der Abweichung zur Vergleichsbasis (ΔPY/ΔPL): gut/schlecht in den Varianzfarben, unter der Wesentlichkeits-Schwelle oder ohne Basis grau. Invert-Einstellungen wirken. „Nach Gruppe/Serie“ färbt nach dem Feld „Serie“ (sonst nach Small Multiples) in einer gedeckten Palette mit einzeiliger Legende oben; in Small-Multiples-Kacheln nur nach „Serie“ (ohne Serie einfarbig). Ab der 7. Gruppe grau.",
        descriptionKey: "Desc_Chart_ScatterColorBy",
        items: scatterColorByItems,
        value: scatterColorByItems[0]
    });

    // Scatter v3: Form je Gruppe — nur bei Punktfarbe „Nach Gruppe/Serie" sichtbar
    scatterShapes = new formattingSettings.ToggleSwitch({
        name: "scatterShapes",
        displayName: "Shape per group",
        displayNameKey: "Chart_ScatterShapes",
        description: "Nur bei Punktfarbe „Nach Gruppe/Serie\": jede Gruppe bekommt zusätzlich eine eigene Form (Kreis · Quadrat · Dreieck · Raute, dann von vorn) — lesbar im Schwarzweiß-Druck und bei Farbfehlsicht; die Legende zeigt die Formen mit. Wirkt auch im Hochkontrast-Modus.",
        descriptionKey: "Desc_Chart_ScatterShapes",
        value: false
    });

    // Scatter v3: PY→AC-Bewegungspfeile — nur mit gebundenem PY sichtbar
    scatterArrows = new formattingSettings.ToggleSwitch({
        name: "scatterArrows",
        displayName: "Movement arrows PY → AC",
        displayNameKey: "Chart_ScatterArrows",
        description: "Nur mit Vorjahr (PY): jeder Punkt bekommt einen dünnen Pfeil vom kleinen grauen PY-Punkt zur AC-Position. Y = PY-Wert; X bleibt gleich, außer das Feld „X-Achse VJ (Scatter)\" ist gebunden — dann volle 2D-Bewegung. Die Achsen schließen die PY-Positionen mit ein.",
        descriptionKey: "Desc_Chart_ScatterArrows",
        value: false
    });

    // Scatter v3: Trendlinie (lineare Regression, bei Small Multiples je Kachel)
    scatterTrend = new formattingSettings.ItemDropdown({
        name: "scatterTrend",
        displayName: "Trend line",
        displayNameKey: "Chart_ScatterTrend",
        description: "Lineare Regression über die sichtbaren Punkte (bei Small Multiples je Kachel) als dünne gepunktete Linie über die Plotbreite. Bei Log-Achsen im logarithmischen Raum gerechnet (Gerade bleibt gerade). Mindestens 3 Punkte.",
        descriptionKey: "Desc_Chart_ScatterTrend",
        items: scatterTrendItems,
        value: scatterTrendItems[0]
    });

    scatterTrendR2 = new formattingSettings.ToggleSwitch({
        name: "scatterTrendR2",
        displayName: "Show R²",
        displayNameKey: "Chart_ScatterTrendR2",
        description: "Beschriftet das Ende der Trendlinie mit dem Bestimmtheitsmaß („R² = 0,87\").",
        descriptionKey: "Desc_Chart_ScatterTrendR2",
        value: false
    });

    // Scatter v3: Größen-Legende — nur mit gebundener Blasengröße sichtbar (Default an)
    scatterSizeLegend = new formattingSettings.ToggleSwitch({
        name: "scatterSizeLegend",
        displayName: "Size legend",
        displayNameKey: "Chart_ScatterSizeLegend",
        description: "Nur mit gebundener Blasengröße: drei Referenzkreise (klein · mittel · groß, auf runde Werte gerundet) kompakt in einer freien Ecke des Plots. Bei Small Multiples einmal in der ersten Kachel.",
        descriptionKey: "Desc_Chart_ScatterSizeLegend",
        value: true
    });

    // Scatter v3: Quadranten-Beschriftung (leer = aus) — nur bei aktiven Quadranten
    scatterQuadLabelTR = new formattingSettings.TextInput({
        name: "scatterQuadLabelTR",
        displayName: "Quadrant label top right",
        displayNameKey: "Chart_ScatterQuadLabelTR",
        description: "Dezente Beschriftung der Quadranten-Ecke (z. B. „Stars\" oben rechts). Leer = aus. Nur bei aktiven Quadranten-Linien; weicht Punkten nach Möglichkeit aus.",
        descriptionKey: "Desc_Chart_ScatterQuadLabel",
        placeholder: "",
        value: ""
    });

    scatterQuadLabelTL = new formattingSettings.TextInput({
        name: "scatterQuadLabelTL",
        displayName: "Quadrant label top left",
        displayNameKey: "Chart_ScatterQuadLabelTL",
        description: "Dezente Beschriftung der Quadranten-Ecke. Leer = aus. Nur bei aktiven Quadranten-Linien; weicht Punkten nach Möglichkeit aus.",
        descriptionKey: "Desc_Chart_ScatterQuadLabel",
        placeholder: "",
        value: ""
    });

    scatterQuadLabelBL = new formattingSettings.TextInput({
        name: "scatterQuadLabelBL",
        displayName: "Quadrant label bottom left",
        displayNameKey: "Chart_ScatterQuadLabelBL",
        description: "Dezente Beschriftung der Quadranten-Ecke. Leer = aus. Nur bei aktiven Quadranten-Linien; weicht Punkten nach Möglichkeit aus.",
        descriptionKey: "Desc_Chart_ScatterQuadLabel",
        placeholder: "",
        value: ""
    });

    scatterQuadLabelBR = new formattingSettings.TextInput({
        name: "scatterQuadLabelBR",
        displayName: "Quadrant label bottom right",
        displayNameKey: "Chart_ScatterQuadLabelBR",
        description: "Dezente Beschriftung der Quadranten-Ecke. Leer = aus. Nur bei aktiven Quadranten-Linien; weicht Punkten nach Möglichkeit aus.",
        descriptionKey: "Desc_Chart_ScatterQuadLabel",
        placeholder: "",
        value: ""
    });

    // Scatter v3: Play-Button (Rosling-Animation) — Laufzustand wird NICHT persistiert
    scatterPlay = new formattingSettings.ToggleSwitch({
        name: "scatterPlay",
        displayName: "Play button (animation)",
        displayNameKey: "Chart_ScatterPlay",
        description: "Blendet einen ▶-Button ein (Rosling-Modus): die Kategorie wird zur Zeitachse — je Periode ein Bild, die Punkte (je Wert des Felds „Serie\") gleiten von Periode zu Periode, die Periode steht groß im Hintergrund. Achsen bleiben fix (Gesamtbereich aller Perioden). Ohne Abspielen zeigt der Chart die letzte Periode. Der Ablauf wird nicht gespeichert; Klick auf die Hintergrund-Periode = zurück zum Anfang. Aus = kein Button, normaler Scatter.",
        descriptionKey: "Desc_Chart_ScatterPlay",
        value: false
    });

    // eigene Modus-Gruppe wie Brücke/Tabelle/KPI-Karten — nur im Scatter sichtbar.
    // Reihenfolge nach Wichtigkeit: Quadranten → Färbung → Formen → Pfeile →
    // Trend (+R²) → Größen-Legende → Quadranten-Labels → Play
    scatterGroup = new formattingSettings.Group({
        name: "chartScatter",
        displayName: "Scatter / bubble",
        displayNameKey: "Group_Scatter",
        slices: [this.scatterQuadrant, this.scatterColorBy, this.scatterShapes,
            this.scatterArrows, this.scatterTrend, this.scatterTrendR2,
            this.scatterSizeLegend, this.scatterQuadLabelTR, this.scatterQuadLabelTL,
            this.scatterQuadLabelBL, this.scatterQuadLabelBR, this.scatterPlay]
    });

    // UX-5 (AUDIT-2026-10-UX §1.5): die Mega-Gruppen „Layout"/„Analyse" aufgabenorientiert
    // neu geschnitten. Gruppen sind reine Anzeige — die Slices wechseln nur die Gruppe
    // INNERHALB der Chart-Karte, Objekt- und Property-Namen bleiben unverändert.
    // Erst hier deklariert, weil Feld-Initialisierer in Reihenfolge laufen und die
    // Gruppen auf Slices aus allen Abschnitten (u. a. exportExpandAll) zeigen.
    chartTypeGroup = new formattingSettings.Group({
        name: "chartType",
        displayName: "Chart type",
        displayNameKey: "Group_ChartType",
        slices: [this.template, this.orientation, this.smartStart]
    });

    varianceGroup = new formattingSettings.Group({
        name: "chartVariance",
        displayName: "Comparison & variance",
        displayNameKey: "Group_Variance",
        slices: [this.comparisonMode, this.showAbsoluteVariance, this.showRelativeVariance,
            this.dualVariance, this.pyTriangle, this.invert, this.invertList,
            this.materialityAbs, this.materialityPct, this.exceptionOnly]
    });

    dataTimeGroup = new formattingSettings.Group({
        name: "chartDataTime",
        displayName: "Data & time",
        displayNameKey: "Group_DataTime",
        slices: [this.cumulative, this.cumulativeKind, this.fiscalStart, this.acFcSplit,
            this.topN, this.showTotal, this.hideBlankCat, this.movingAverage,
            this.highlight, this.groupEvery]
    });

    // End-User-Bedienung im Bericht als EINE Familie (In-Chart-Buttons, YTD-Chip,
    // Vergleich per Klick) — vorher über Brücke und Analyse verstreut
    interactionGroup = new formattingSettings.Group({
        name: "chartInteraction",
        displayName: "Interaction in the report",
        displayNameKey: "Group_Interaction",
        slices: [this.chartButtons, this.cumulativeButton, this.compareClick, this.chipMenu]
    });

    // 1.52.1: series names of stacked columns/bars right at the stack (IBCS) instead
    // of a key above the chart; falls back to the key when they do not fit
    stackLegendDirect = new formattingSettings.ToggleSwitch({
        name: "stackLegendDirect",
        displayName: "Stack legend at the stack",
        displayNameKey: "Chart_StackLegendDirect",
        description: "Gestapelte Säulen und Balken: Die Seriennamen stehen direkt am Stapel (Säulen: rechts neben der letzten Säule, Balken: über dem ersten Balken) statt als Schlüssel oben. Passen sie nicht, bleibt der Schlüssel. Aus = immer Schlüssel oben.",
        descriptionKey: "Desc_Chart_StackLegendDirect",
        value: true
    });

    displayGroup = new formattingSettings.Group({
        name: "chartDisplay",
        displayName: "Display",
        displayNameKey: "Group_Display",
        slices: [this.pinStyle, this.deltaIcons, this.driverNote, this.stackLegendDirect, this.exportExpandAll]
    });

    name: string = "chart";
    displayName: string = "Chart";
    displayNameKey: string = "Card_Chart";
    groups = [this.chartTypeGroup, this.varianceGroup, this.dataTimeGroup, this.interactionGroup,
        this.displayGroup, this.multiplesGroup, this.bridgeGroup, this.tableGroup, this.cardsGroup,
        this.scatterGroup];
}

const appearanceItems: LocEnumMember[] = [
    { value: "auto", displayName: "Auto (Theme erkennen)", key: "Enum_Appearance_Auto" },
    { value: "light", displayName: "Hell", key: "Enum_Appearance_Light" },
    { value: "dark", displayName: "Dunkel", key: "Enum_Appearance_Dark" }
];

const variancePresetItems: powerbi.IEnumMember[] = [
    { value: "custom", displayName: "Farbwähler unten (Teal/Rot)" },
    { value: "blueOrange", displayName: "Blau/Orange (ColorBrewer)" }
];

export class ColorsCardSettings extends FormattingSettingsCard {
    appearance = new formattingSettings.ItemDropdown({
        name: "appearance",
        displayName: "Erscheinungsbild",
        displayNameKey: "Colors_Appearance",
        description: "„Auto\" erkennt dunkle Berichts-Themes an der Hintergrundfarbe und stellt Schrift, Achsen und Flächen auf helle Töne um. Bei manuell dunkel eingefärbten Seiten (ohne dunkles Theme) „Dunkel\" wählen.",
        descriptionKey: "Desc_Colors_Appearance",
        items: appearanceItems,
        value: appearanceItems[0]
    });

    variancePreset = new formattingSettings.ItemDropdown({
        name: "variancePreset",
        displayName: "Variance color preset",
        displayNameKey: "Colors_VariancePreset",
        description: "„Blau/Orange\" setzt Good/Bad auf das ColorBrewer-Paar #2C7BB6/#E66101 — auch bei vollständiger Farbenblindheit (Achromatopsie) und im Schwarzweiß-Druck über die Helligkeit unterscheidbar. Übersteuert die beiden Farbwähler unten; Theme-Farben haben weiter Vorrang.",
        descriptionKey: "Desc_Colors_VariancePreset",
        items: variancePresetItems,
        value: variancePresetItems[0]
    });

    useTheme = new formattingSettings.ToggleSwitch({
        name: "useTheme",
        displayName: "Use report theme colors",
        displayNameKey: "Colors_UseTheme",
        description: "Übernimmt Good/Bad und Neutralfarben aus dem Berichtsdesign (Theme) statt der Farbwähler unten.",
        descriptionKey: "Desc_Colors_UseTheme",
        value: false
    });

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
        description: "Standard ist das DatenWG-Teal (#1E8F9E) statt klassischem Grün — durch den Blauanteil bleibt „gut“ auch bei Rot-Grün-Schwäche klar vom Rot unterscheidbar. Hier übersteuerbar.",
        descriptionKey: "Desc_Colors_Good",
        value: { value: "#1E8F9E" }
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
        this.appearance,
        this.variancePreset,
        this.useTheme,
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

    fontPreset = new formattingSettings.ItemDropdown({
        name: "fontPreset",
        displayName: "Size preset",
        displayNameKey: "Labels_FontPreset",
        description: "Skaliert alle Schriften im Visual auf einmal: HD ×1 (Standard) · Full HD ×1,5 (empfohlen für 1080p-Berichte) · UHD ×2.",
        descriptionKey: "Desc_Labels_FontPreset",
        items: fontPresetItems,
        value: fontPresetItems[0]
    });

    fontScale = new formattingSettings.NumUpDown({
        name: "fontScale",
        displayName: "Scale all labels %",
        displayNameKey: "Labels_FontScale",
        description: "Vergrößert bzw. verkleinert ALLE Beschriftungen zusätzlich zum Preset um einen freien Faktor (50–300 %). 100 = neutral. Preset × Faktor ergibt die effektive Schriftgröße.",
        descriptionKey: "Desc_Labels_FontScale",
        value: 100,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 50 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 300 }
        }
    });

    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Text size (pt) · fine-tuning",
        displayNameKey: "Labels_FontSize",
        description: "Feinjustierung: Basis-Schriftgröße der Beschriftungen in pt. Wird mit Preset und Skalierungs-Faktor multipliziert — im Normalfall genügen Preset und „Alle Beschriftungen skalieren %\".",
        descriptionKey: "Desc_Labels_FontSize",
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

    sumSafeRounding = new formattingSettings.ToggleSwitch({
        name: "sumSafeRounding",
        displayName: "Sum-safe label rounding",
        displayNameKey: "Labels_SumSafe",
        description: "Rundet die Wertbeschriftungen nach dem Restwertverfahren so, dass sie exakt auf die Σ-Kopfzeile aufaddieren — keine Rundungsdifferenz-Nachfragen mehr. Aus = mathematisch exakte Einzelrundung, dafür erscheint bei Abweichung ein Rundungshinweis unter der Σ-Zeile.",
        descriptionKey: "Desc_Labels_SumSafe",
        value: false
    });

    // 1.52.1: unit suffix on every label ("18,5M") or bare numbers with the unit in
    // the title only ("18,5", title „… in Mio. EUR")
    unitSuffix = new formattingSettings.ToggleSwitch({
        name: "unitSuffix",
        displayName: "Unit on every label",
        displayNameKey: "Labels_UnitSuffix",
        description: "An = jede Beschriftung trägt Größenordnung und Einheit („18,5M“). Aus = nur die Zahl („18,5“), die Einheit steht einmal im Titel („Nettoumsatz in Mio. EUR“), so wie es IBCS empfiehlt.",
        descriptionKey: "Desc_Labels_UnitSuffix",
        value: true
    });

    labelDensity = new formattingSettings.ItemDropdown({
        name: "labelDensity",
        displayName: "Label density",
        displayNameKey: "Labels_Density",
        description: "Steuert die Ausdünnung der Wertbeschriftungen: „Automatisch\" blendet bei Platzmangel aus (bisheriges Verhalten), „Alle\" beschriftet jeden Punkt (kann überlappen), „Anfang · Ende · Extrema\" zeigt nur ersten/letzten Wert sowie Minimum und Maximum.",
        descriptionKey: "Desc_Labels_Density",
        items: labelDensityItems,
        value: labelDensityItems[0]
    });

    financeFormat = new formattingSettings.ToggleSwitch({
        name: "financeFormat",
        displayName: "Finance format (parentheses)",
        displayNameKey: "Labels_FinanceFormat",
        description: "Finanzkonvention für Zahlen: negative Werte in Klammern statt Minuszeichen — (1.234) — und Null als „–\". Gilt für Wert- und Δ-Beschriftungen inkl. Δ %.",
        descriptionKey: "Desc_Labels_FinanceFormat",
        value: false
    });

    // Hausbegriffe: die IBCS-Szenariokürzel in Titeln, Spaltenköpfen und
    // Δ-Beschriftungen umbenennen (leer = Standardkürzel) — Backlog-Wunsch
    labelAc = new formattingSettings.TextInput({
        name: "labelAc",
        displayName: "Rename AC",
        displayNameKey: "Labels_RenameAc",
        description: "Eigener Begriff für AC in Titeln, Spaltenköpfen und Legenden (z. B. „Ist\"). Leer = AC.",
        descriptionKey: "Desc_Labels_RenameAc",
        placeholder: "AC",
        value: ""
    });

    labelPy = new formattingSettings.TextInput({
        name: "labelPy",
        displayName: "Rename PY",
        displayNameKey: "Labels_RenamePy",
        description: "Eigener Begriff für PY, auch in ΔPY-Überschriften (z. B. „VJ\"). Leer = PY.",
        descriptionKey: "Desc_Labels_RenamePy",
        placeholder: "PY",
        value: ""
    });

    labelPl = new formattingSettings.TextInput({
        name: "labelPl",
        displayName: "Rename PL",
        displayNameKey: "Labels_RenamePl",
        description: "Eigener Begriff für PL, auch in ΔPL-Überschriften (z. B. „Budget\"). Leer = PL.",
        descriptionKey: "Desc_Labels_RenamePl",
        placeholder: "PL",
        value: ""
    });

    labelFc = new formattingSettings.TextInput({
        name: "labelFc",
        displayName: "Rename FC",
        displayNameKey: "Labels_RenameFc",
        description: "Eigener Begriff für FC (z. B. „Prognose\"). Leer = FC.",
        descriptionKey: "Desc_Labels_RenameFc",
        placeholder: "FC",
        value: ""
    });

    name: string = "labels";
    displayName: string = "Data labels";
    displayNameKey: string = "Card_Labels";
    slices: Array<FormattingSettingsSlice> = [
        this.show,
        this.labelDensity,
        this.fontPreset,
        this.fontScale,
        this.decimals,
        this.displayUnits,
        this.financeFormat,
        this.sumSafeRounding,
        this.unitSuffix,
        this.labelAc,
        this.labelPy,
        this.labelPl,
        this.labelFc,
        this.fontSize
    ];
}

export class EmptyStateCardSettings extends FormattingSettingsCard {
    mode = new formattingSettings.ItemDropdown({
        name: "mode",
        displayName: "Empty state in edit mode",
        displayNameKey: "Empty_Mode",
        description: "Was der Bericht-Autor im Bearbeitungsmodus sieht, solange keine Daten dargestellt werden: der Start-Hub (Standard: Checkliste „Loslegen“, Feature-Tour, IBCS-Vorlagen nach Zweck, Demo-Galerie, Feld-Intro mit allen Rollen; unten HD · Full HD · UHD und die Doku), nur die Demo-Galerie zur Chart-Typ-Wahl (Verhalten bis 1.49), das Feld-Intro (welches Feld wohin, ✓ an bereits gebundenen Feldern) oder die eigene Nachricht aus Titel/Text unten. Leser und Exporte sehen weiterhin Galerie bzw. eigene Nachricht wie bisher.",
        descriptionKey: "Desc_Empty_Mode",
        items: emptyModeItems,
        value: emptyModeItems[0]
    });

    title = new formattingSettings.TextInput({
        name: "title",
        displayName: "Eigener Titel",
        displayNameKey: "Empty_Title",
        description: "Ersetzt die Überschrift „ChartKitchen byDatenWG\", wenn keine Daten dargestellt werden (Felder leer oder Auswahl ohne Zeilen). Im Lesemodus erscheint dann nur Titel + Text statt der Modus-Galerie.",
        descriptionKey: "Desc_Empty_Title",
        placeholder: "z. B. Keine Daten für diese Auswahl",
        value: ""
    });

    body = new formattingSettings.TextInput({
        name: "body",
        displayName: "Eigener Text",
        displayNameKey: "Empty_Body",
        description: "Textkörper unter dem Titel im Leer-Zustand — z. B. ein Hinweis, welche Filter der Leser prüfen soll.",
        descriptionKey: "Desc_Empty_Body",
        placeholder: "z. B. Bitte Zeitraum oder Filter anpassen.",
        value: ""
    });

    name: string = "emptyState";
    displayName: string = "Leer-Zustand";
    displayNameKey: string = "Card_EmptyState";
    slices: Array<FormattingSettingsSlice> = [this.mode, this.title, this.body];
}

export class CommentsCardSettings extends FormattingSettingsCard {
    showPanel = new formattingSettings.ToggleSwitch({
        name: "showPanel",
        displayName: "Show comment list",
        displayNameKey: "Comments_ShowPanel",
        description: "Zeigt die Kommentare als nummerierte Liste rechts neben dem Chart — bleibt auch im PDF/PowerPoint-Export sichtbar.",
        descriptionKey: "Desc_Comments_ShowPanel",
        value: true
    });

    editComments = new formattingSettings.ToggleSwitch({
        name: "editComments",
        displayName: "Capture comments in chart",
        displayNameKey: "Comments_Edit",
        description: "Kommentar-Modus: Klick auf eine Kategorie öffnet ein Eingabefeld — der Kommentar wird im Bericht gespeichert (bookmark-fähig, wandert mit der PBIX). Solange der Modus an ist, filtern Klicks nicht quer. Standard aus.",
        descriptionKey: "Desc_Comments_Edit",
        value: false
    });

    commentFontSize = new formattingSettings.NumUpDown({
        name: "commentFontSize",
        displayName: "Comment font size",
        displayNameKey: "Comments_FontSize",
        description: "Schriftgröße der Kommentar-Liste in pt (8–24). Wird zusätzlich mit dem Schrift-Preset und dem Skalierungs-Faktor multipliziert, skaliert also mit dem Rest des Visuals mit.",
        descriptionKey: "Desc_Comments_FontSize",
        value: 10,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 8 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 24 }
        }
    });

    name: string = "commentsPanel";
    displayName: string = "Comments";
    displayNameKey: string = "Card_Comments";
    slices: Array<FormattingSettingsSlice> = [this.showPanel, this.commentFontSize, this.editComments];
}

export class ScaleCardSettings extends formattingSettings.CompositeCard {
    fixedMax = new formattingSettings.NumUpDown({
        name: "fixedMax",
        displayName: "Scale minimum-maximum",
        displayNameKey: "Scale_FixedMax",
        description: "Skaliert das Basis-Chart mindestens bis zu diesem Wert — für identische Skalen über mehrere Visuals (IBCS). 0 = automatisch. Größere Datenwerte erweitern die Skala weiterhin.",
        descriptionKey: "Desc_Scale_FixedMax",
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
        descriptionKey: "Desc_Scale_FixedVarMax",
        value: 0,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 0 }
        }
    });

    refLine = new formattingSettings.TextInput({
        name: "refLine",
        displayName: "Reference line value",
        displayNameKey: "Scale_RefLine",
        description: "Zeichnet eine Ziel-/Schwellenlinie bei diesem Wert quer durch das Basis-Chart. Leer = aus.",
        descriptionKey: "Desc_Scale_RefLine",
        placeholder: "z. B. 1200000",
        value: ""
    });

    refLineLabel = new formattingSettings.TextInput({
        name: "refLineLabel",
        displayName: "Reference line label",
        displayNameKey: "Scale_RefLineLabel",
        placeholder: "z. B. Ziel",
        value: ""
    });

    // Scatter: senkrechte Ziel-/Schwellenlinie auf der X-Achse — Text wie refLine
    // (leer = aus, 0 ist ein gültiger Wert, k/M/B-Suffixe), nur im Scatter sichtbar
    xRefLine = new formattingSettings.TextInput({
        name: "xRefLine",
        displayName: "Reference line X (scatter)",
        displayNameKey: "Scale_XRefLine",
        description: "Nur Scatter: senkrechte Ziel-/Schwellenlinie bei diesem X-Wert (z. B. 0.15 für 15 % Marge). Ersetzt die X-Quadrantenlinie; die Y-Referenzlinie oben ersetzt die Y-Quadrantenlinie. Leer = aus.",
        descriptionKey: "Desc_Scale_XRefLine",
        placeholder: "z. B. 0.15",
        value: ""
    });

    // Scatter v3: fixierte Achsengrenzen — Text wie refLine (leer = auto, 0 gültig,
    // k/M/B-Suffixe) für Skalen-Sync über mehrere Scatter-Visuals einer Seite
    xMin = new formattingSettings.TextInput({
        name: "xMin",
        displayName: "X axis minimum",
        displayNameKey: "Scale_XMin",
        description: "Nur Scatter: fixiert die Achsengrenze (z. B. 0 oder 0.25; k/M/B-Suffixe wie bei der Referenzlinie). Leer = automatisch. Für identische Achsen über mehrere Scatter einer Seite. Punkte außerhalb werden nicht gezeichnet und im Panel-Titel gezählt.",
        descriptionKey: "Desc_Scale_AxisMinMax",
        placeholder: "",
        value: ""
    });

    xMax = new formattingSettings.TextInput({
        name: "xMax",
        displayName: "X axis maximum",
        displayNameKey: "Scale_XMax",
        description: "Nur Scatter: fixiert die Achsengrenze. Leer = automatisch.",
        descriptionKey: "Desc_Scale_AxisMinMax",
        placeholder: "",
        value: ""
    });

    yMin = new formattingSettings.TextInput({
        name: "yMin",
        displayName: "Y axis minimum",
        displayNameKey: "Scale_YMin",
        description: "Nur Scatter: fixiert die Achsengrenze. Leer = automatisch.",
        descriptionKey: "Desc_Scale_AxisMinMax",
        placeholder: "",
        value: ""
    });

    yMax = new formattingSettings.TextInput({
        name: "yMax",
        displayName: "Y axis maximum",
        displayNameKey: "Scale_YMax",
        description: "Nur Scatter: fixiert die Achsengrenze. Leer = automatisch.",
        descriptionKey: "Desc_Scale_AxisMinMax",
        placeholder: "",
        value: ""
    });

    // Scatter v3: Log-Skalen — greifen nur, wenn alle Werte > 0 sind (sonst linear
    // mit dezentem Hinweis im Bearbeiten-Modus)
    xLogScale = new formattingSettings.ToggleSwitch({
        name: "xLogScale",
        displayName: "X axis logarithmic",
        displayNameKey: "Scale_XLogScale",
        description: "Nur Scatter: logarithmische X-Achse (Ticks als Dekaden bzw. 1-2-5-Schritte). Greift nur, wenn alle X-Werte (inkl. Referenzlinie und fixierter Grenzen) größer 0 sind — sonst bleibt die Achse linear (Hinweis im Bearbeiten-Modus).",
        descriptionKey: "Desc_Scale_XLogScale",
        value: false
    });

    yLogScale = new formattingSettings.ToggleSwitch({
        name: "yLogScale",
        displayName: "Y axis logarithmic",
        displayNameKey: "Scale_YLogScale",
        description: "Nur Scatter: logarithmische Y-Achse (AC). Greift nur, wenn alle Y-Werte größer 0 sind — sonst linear mit Hinweis im Bearbeiten-Modus.",
        descriptionKey: "Desc_Scale_YLogScale",
        value: false
    });

    capOverflow = new formattingSettings.ToggleSwitch({
        name: "capOverflow",
        displayName: "Cap outliers at maximum",
        displayNameKey: "Scale_CapOverflow",
        description: "Macht das Skalen-Maximum hart: größere Werte werden gekappt und mit Doppelstrich markiert (Label zeigt den echten Wert).",
        descriptionKey: "Desc_Scale_CapOverflow",
        value: false
    });

    wfAxisBreak = new formattingSettings.ItemDropdown({
        name: "wfAxisBreak",
        displayName: "Axis break (waterfall)",
        displayNameKey: "Scale_WfAxisBreak",
        description: "IBCS-Achsenschnitt (UN 5.3) für Wasserfälle mit großem Sockel: Anker und Zwischensummen werden mit ⫽ gekürzt, die Abweichungen darüber werden lesbar. Aus = immer nullbasiert, kein Chip. Auto = nullbasiert, der Leser schneidet per „⫽ Achse\"-Chip (hervorgehoben, wenn die Abweichungen klein gegenüber dem Sockel sind). An = geschnitten, der Chip schaltet zurück. Geschnitten wird nur, wenn alle Anker und Abweichungen oberhalb des Schnitts liegen — sonst bleibt die Achse nullbasiert.",
        descriptionKey: "Desc_Scale_WfAxisBreak",
        items: wfAxisBreakItems,
        value: wfAxisBreakItems[0]
    });

    wfBreakAt = new formattingSettings.NumUpDown({
        name: "wfBreakAt",
        displayName: "Break at value",
        displayNameKey: "Scale_WfBreakAt",
        description: "Wert, bis zu dem die Achse gestaucht wird. 0 = automatisch (runder Wert unterhalb des niedrigsten Stands). Liegt ein Anker oder eine Abweichung darunter, wird nicht geschnitten.",
        descriptionKey: "Desc_Scale_WfBreakAt",
        value: 0,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 0 }
        }
    });

    syncGroup = new formattingSettings.Group({
        name: "scaleSync",
        displayName: "Scale sync",
        displayNameKey: "Group_ScaleSync",
        slices: [this.fixedMax, this.fixedVarMax, this.capOverflow]
    });

    // Scatter v3: eigene Gruppe „Scatter-Achsen" (Min/Max-Fixierung + Log), nur im
    // Scatter sichtbar — logisch neben fixedMax (Sync) und den Referenzlinien
    scatterAxesGroup = new formattingSettings.Group({
        name: "scaleScatterAxes",
        displayName: "Scatter axes",
        displayNameKey: "Group_ScatterAxes",
        slices: [this.xMin, this.xMax, this.yMin, this.yMax, this.xLogScale, this.yLogScale]
    });

    refLineGroup = new formattingSettings.Group({
        name: "scaleRefLine",
        displayName: "Reference line",
        displayNameKey: "Group_RefLine",
        slices: [this.refLine, this.refLineLabel, this.xRefLine]
    });

    // eigene Gruppe, nur im Wasserfall sichtbar (getFormattingModel)
    wfAxisGroup = new formattingSettings.Group({
        name: "scaleWfAxis",
        displayName: "Waterfall axis",
        displayNameKey: "Group_WfAxis",
        slices: [this.wfAxisBreak, this.wfBreakAt]
    });

    name: string = "scale";
    displayName: string = "Scale";
    displayNameKey: string = "Card_Scale";
    groups = [this.syncGroup, this.scatterAxesGroup, this.refLineGroup, this.wfAxisGroup];
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
    commentsCard = new CommentsCardSettings();
    emptyStateCard = new EmptyStateCardSettings();
    scaleCard = new ScaleCardSettings();
    categoryAxisCard = new CategoryAxisCardSettings();

    // UX-1 (AUDIT-2026-10-UX §1.5): Soll-Kartenreihenfolge — Chart zuerst (Modus-Wahl
    // rekonfiguriert alles andere), dann Titel, Beschriftungen + Kategorienachse,
    // Farben, Skala, Kommentare, Leer-Zustand. Reine Anzeige, keine Property-Änderung.
    cards = [this.chartCard, this.ibcsTitleCard, this.labelsCard, this.categoryAxisCard,
        this.colorsCard, this.scaleCard, this.commentsCard, this.emptyStateCard];
}
