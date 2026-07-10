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
    { value: "line", displayName: "Line (Time, many points)", key: "Enum_Orientation_Line" },
    { value: "waterfall", displayName: "Waterfall / Bridge", key: "Enum_Orientation_Waterfall" },
    { value: "intwaterfall", displayName: "Integrated Bridge (Time)", key: "Enum_Orientation_IntWaterfall" },
    { value: "catbridge", displayName: "Category Bridge (Structure)", key: "Enum_Orientation_CatBridge" },
    { value: "table", displayName: "Table (IBCS)", key: "Enum_Orientation_Table" },
    { value: "pareto", displayName: "Pareto (Structure)", key: "Enum_Orientation_Pareto" },
    { value: "dumbbell", displayName: "Dumbbell (Structure)", key: "Enum_Orientation_Dumbbell" },
    { value: "slope", displayName: "Slope · Before/After", key: "Enum_Orientation_Slope" },
    { value: "cards", displayName: "KPI Cards (Tiles)", key: "Enum_Orientation_Cards" },
    { value: "pnl", displayName: "P&L Statement (IBCS)", key: "Enum_Orientation_Pnl" }
];

const comparisonItems: LocEnumMember[] = [
    { value: "auto", displayName: "Auto", key: "Enum_Comparison_Auto" },
    { value: "py", displayName: "Previous Year (PY)", key: "Enum_Comparison_Py" },
    { value: "plan", displayName: "Plan (PL)", key: "Enum_Comparison_Plan" },
    { value: "fcrev", displayName: "Prior-month FC (revision)", key: "Enum_Comparison_FcRev" }
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
    { value: "compact", displayName: "Compact (dashboard tile)", key: "Enum_FontPreset_Compact" },
    { value: "fullhd", displayName: "Full HD (1080p)", key: "Enum_FontPreset_FullHd" },
    { value: "presentation", displayName: "Presentation (4K / projector)", key: "Enum_FontPreset_Presentation" }
];

/** resolve all enum-member labels once via the host's localization manager */
export function localizeEnumItems(lm: powerbi.extensibility.ILocalizationManager): void {
    const lists: LocEnumMember[][] = [orientationItems, comparisonItems,
        displayUnitsItems, cumulativeKindItems, fontPresetItems];
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
        placeholder: "z. B. Ist per Jun 2026 · Stand 05.07.",
        value: ""
    });

    autoMessage = new formattingSettings.ToggleSwitch({
        name: "autoMessage",
        displayName: "Auto message",
        displayNameKey: "Title_AutoMessage",
        description: "Erzeugt die Botschafts-Zeile (Treiber-Text) automatisch aus Gesamtabweichung und größten Treibern, wenn keine eigene Botschaft eingegeben ist. Standard aus.",
        value: false
    });

    name: string = "ibcsTitle";
    displayName: string = "IBCS title";
    displayNameKey: string = "Card_IbcsTitle";
    slices: Array<FormattingSettingsSlice> = [this.show, this.kpi, this.period, this.message, this.autoMessage, this.footer];
}

export class ChartCardSettings extends formattingSettings.CompositeCard {
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

    invertList = new formattingSettings.TextInput({
        name: "invertList",
        displayName: "Invert per category",
        displayNameKey: "Chart_InvertList",
        description: "Kommagetrennte Kategorien, deren Wertung umgekehrt wird (z. B. Kosten-Zeilen neben Umsatz-Zeilen in KPI-Karten oder der GuV-Tabelle). Wirkt zusätzlich zum globalen Invert-Schalter.",
        placeholder: "z. B. Opex, Materialaufwand",
        value: ""
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
        description: "Struktur-Modi (Bars, Kategorie-Brücke, Tabelle, Dumbbell, KPI-Karten): zeigt die N größten Kategorien, der Rest wird aggregiert. 0 = alle.",
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
        value: false
    });

    cumulative = new formattingSettings.ToggleSwitch({
        name: "cumulative",
        displayName: "Cumulative (YTD)",
        displayNameKey: "Chart_Cumulative",
        description: "Schaltet alle Panels auf kumulierte Sicht: Säulen, ΔBasis und ΔBasis % zeigen Year-to-Date-Werte.",
        value: false
    });

    cumulativeKind = new formattingSettings.ItemDropdown({
        name: "cumulativeKind",
        displayName: "Cumulation kind",
        displayNameKey: "Chart_CumKind",
        description: "YTD setzt am Fiskaljahres-Beginn zurück, QTD an jedem Quartalsstart, R12 summiert rollierend die letzten 12 Perioden. Monats-Erkennung über die Kategorie-Labels (Jan…Dez, 01…12).",
        items: cumulativeKindItems,
        value: cumulativeKindItems[0]
    });

    fiscalStart = new formattingSettings.NumUpDown({
        name: "fiscalStart",
        displayName: "Fiscal year starts in month",
        displayNameKey: "Chart_FiscalStart",
        description: "1 = Januar … 12 = Dezember. Bestimmt, wo YTD/QTD zurücksetzen (z. B. 4 für ein Fiskaljahr ab April).",
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
        placeholder: "z. B. Jul, Aug",
        value: ""
    });

    compareClick = new formattingSettings.ToggleSwitch({
        name: "compareClick",
        displayName: "Compare on click",
        displayNameKey: "Chart_CompareClick",
        description: "Nur Columns/Bars: zwei Säulen/Balken anklicken zeigt die Differenz (absolut + %) als Overlay — Klicks filtern dann nicht mehr quer. Klick ins Leere setzt zurück. Standard aus.",
        value: false
    });

    groupEvery = new formattingSettings.NumUpDown({
        name: "groupEvery",
        displayName: "Group separator every N",
        displayNameKey: "Chart_GroupEvery",
        description: "Zeichnet eine dünne Trennlinie nach jeweils N Kategorien, quer durch alle Panels — für Struktur-Vergleiche mit natürlichen Untergruppen (z. B. Regionen). 0 = aus.",
        value: 0,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 0 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 50 }
        }
    });

    waterfallStyle = new formattingSettings.ToggleSwitch({
        name: "waterfallStyle",
        displayName: "Waterfall bridge",
        displayNameKey: "Chart_WaterfallStyle",
        description: "Nur Columns/Bars: zeigt die Kategorien als Wasserfall-Brücke von der Basis (PY/PL) zu AC mit Verbindungslinien, statt als einzelne Balken. Optional — Standard ist aus.",
        value: false
    });

    sortByImpact = new formattingSettings.ToggleSwitch({
        name: "sortByImpact",
        displayName: "Sort by impact",
        displayNameKey: "Chart_SortByImpact",
        description: "Nur bei Waterfall bridge: sortiert die Kategorien nach Abweichungsgröße (größter Treiber zuerst). Eine Top-N-Rest-Zeile bleibt am Ende. Auch per Klick auf das ⇅-Symbol im Chart umschaltbar.",
        value: false
    });

    chartButtons = new formattingSettings.ToggleSwitch({
        name: "chartButtons",
        displayName: "In-chart buttons",
        displayNameKey: "Chart_Buttons",
        description: "Integrierte/Kategorie-Brücke: zeigt klickbare Buttons oben rechts im Chart — ΔPY/ΔPL-Referenz-Umschalter, ⇅ Sortierung und ▶ Aufbau-Animation. Der Enduser kann die Varianz-Basis direkt im Bericht wechseln; die Wahl wird persistiert.",
        value: true
    });

    pyTriangle = new formattingSettings.ToggleSwitch({
        name: "pyTriangle",
        displayName: "PY as triangle (AC + PY + PL)",
        displayNameKey: "Chart_PyTriangle",
        description: "IBCS-Notation bei drei Szenarien: Sind AC, PY und PL gebunden, wird das Vorjahr als graues Dreieck (\u25b6) am Säulen-/Balkenrand auf PY-Höhe gezeigt statt als dritte Säule — weniger überladen. Aus = PY wieder als graue Säule.",
        value: true
    });

    driverNote = new formattingSettings.ToggleSwitch({
        name: "driverNote",
        displayName: "Driver note in chart",
        displayNameKey: "Chart_DriverNote",
        description: "Kategorie-Brücke: kursive Notiz am größten Treiber („größter Treiber · n % der Gesamtabweichung“) — überlagert den Zeilenbereich, hier abschaltbar.",
        value: true
    });

    layoutGroup = new formattingSettings.Group({
        name: "chartLayout",
        displayName: "Layout",
        displayNameKey: "Group_Layout",
        slices: [this.orientation, this.comparisonMode, this.showAbsoluteVariance,
            this.showRelativeVariance, this.dualVariance, this.pyTriangle, this.showTotal, this.groupEvery]
    });

    cumulativeButton = new formattingSettings.ToggleSwitch({
        name: "cumulativeButton",
        displayName: "YTD button in chart",
        displayNameKey: "Chart_CumButton",
        description: "Zeigt einen klickbaren „YTD\"-Button oben rechts im Chart (Columns/Line) — der Enduser schaltet die kumulierte Sicht direkt im Bericht um; die Wahl wird persistiert. Standard aus.",
        value: false
    });

    materialityAbs = new formattingSettings.NumUpDown({
        name: "materialityAbs",
        displayName: "Materiality from (absolute)",
        displayNameKey: "Chart_MaterialityAbs",
        description: "Wesentlichkeits-Schwelle: Abweichungen unter diesem absoluten Betrag werden grau statt rot/grün dargestellt (Panels, Wasserfall-Stufen, Tabelle). 0 = aus.",
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
        value: 0,
        options: {
            minValue: { type: 0 /* ValidatorType.Min */, value: 0 },
            maxValue: { type: 1 /* ValidatorType.Max */, value: 100 }
        }
    });

    analysisGroup = new formattingSettings.Group({
        name: "chartAnalysis",
        displayName: "Analysis",
        displayNameKey: "Group_Analysis",
        slices: [this.cumulative, this.cumulativeKind, this.fiscalStart, this.cumulativeButton, this.movingAverage, this.topN,
            this.highlight, this.invert, this.invertList, this.compareClick,
            this.materialityAbs, this.materialityPct]
    });

    multiplesTotal = new formattingSettings.ToggleSwitch({
        name: "multiplesTotal",
        displayName: "Total tile (Σ)",
        displayNameKey: "Chart_MultiplesTotal",
        description: "Stellt eine „Σ Gesamt\"-Kachel voran — Summe über alle Gruppen, auf derselben Skala (IBCS).",
        value: false
    });

    multiplesTopN = new formattingSettings.NumUpDown({
        name: "multiplesTopN",
        displayName: "Top N tiles",
        displayNameKey: "Chart_MultiplesTopN",
        description: "Zeigt nur die N größten Gruppen (nach Summe AC) als Kacheln — die übrigen werden zu einer „Rest\"-Kachel aggregiert. 0 = alle.",
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
        value: false
    });

    multiplesGroup = new formattingSettings.Group({
        name: "chartMultiples",
        displayName: "Small Multiples",
        displayNameKey: "Group_Multiples",
        slices: [this.multiplesTotal, this.multiplesTopN, this.multiplesHero]
    });

    bridgeGroup = new formattingSettings.Group({
        name: "chartBridge",
        displayName: "Bridge",
        displayNameKey: "Group_Bridge",
        slices: [this.waterfallStyle, this.sortByImpact, this.chartButtons, this.driverNote]
    });

    name: string = "chart";
    displayName: string = "Chart";
    displayNameKey: string = "Card_Chart";
    groups = [this.layoutGroup, this.analysisGroup, this.multiplesGroup, this.bridgeGroup];
}

export class ColorsCardSettings extends FormattingSettingsCard {
    useTheme = new formattingSettings.ToggleSwitch({
        name: "useTheme",
        displayName: "Use report theme colors",
        displayNameKey: "Colors_UseTheme",
        description: "Übernimmt Good/Bad und Neutralfarben aus dem Berichtsdesign (Theme) statt der Farbwähler unten.",
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
        description: "Skaliert alle Schriften im Visual auf einmal: Kompakt ×1 (Standard) · Full HD ×1,5 (empfohlen für 1080p-Berichte) · Präsentation ×2.",
        items: fontPresetItems,
        value: fontPresetItems[0]
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
        this.fontPreset,
        this.fontSize,
        this.decimals,
        this.displayUnits
    ];
}

export class CommentsCardSettings extends FormattingSettingsCard {
    showPanel = new formattingSettings.ToggleSwitch({
        name: "showPanel",
        displayName: "Show comment list",
        displayNameKey: "Comments_ShowPanel",
        description: "Zeigt die Kommentare als nummerierte Liste rechts neben dem Chart — bleibt auch im PDF/PowerPoint-Export sichtbar.",
        value: true
    });

    editComments = new formattingSettings.ToggleSwitch({
        name: "editComments",
        displayName: "Capture comments in chart",
        displayNameKey: "Comments_Edit",
        description: "Kommentar-Modus: Klick auf eine Kategorie öffnet ein Eingabefeld — der Kommentar wird im Bericht gespeichert (bookmark-fähig, wandert mit der PBIX). Solange der Modus an ist, filtern Klicks nicht quer. Standard aus.",
        value: false
    });

    name: string = "commentsPanel";
    displayName: string = "Comments";
    displayNameKey: string = "Card_Comments";
    slices: Array<FormattingSettingsSlice> = [this.showPanel, this.editComments];
}

export class ScaleCardSettings extends formattingSettings.CompositeCard {
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

    refLine = new formattingSettings.TextInput({
        name: "refLine",
        displayName: "Reference line value",
        displayNameKey: "Scale_RefLine",
        description: "Zeichnet eine Ziel-/Schwellenlinie bei diesem Wert quer durch das Basis-Chart. Leer = aus.",
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

    capOverflow = new formattingSettings.ToggleSwitch({
        name: "capOverflow",
        displayName: "Cap outliers at maximum",
        displayNameKey: "Scale_CapOverflow",
        description: "Macht das Skalen-Maximum hart: größere Werte werden gekappt und mit Doppelstrich markiert (Label zeigt den echten Wert).",
        value: false
    });

    syncGroup = new formattingSettings.Group({
        name: "scaleSync",
        displayName: "Scale sync",
        displayNameKey: "Group_ScaleSync",
        slices: [this.fixedMax, this.fixedVarMax, this.capOverflow]
    });

    refLineGroup = new formattingSettings.Group({
        name: "scaleRefLine",
        displayName: "Reference line",
        displayNameKey: "Group_RefLine",
        slices: [this.refLine, this.refLineLabel]
    });

    name: string = "scale";
    displayName: string = "Scale";
    displayNameKey: string = "Card_Scale";
    groups = [this.syncGroup, this.refLineGroup];
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
    scaleCard = new ScaleCardSettings();
    categoryAxisCard = new CategoryAxisCardSettings();

    cards = [this.ibcsTitleCard, this.chartCard, this.colorsCard, this.labelsCard,
        this.commentsCard, this.scaleCard, this.categoryAxisCard];
}
