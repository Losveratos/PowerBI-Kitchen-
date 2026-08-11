"use strict";

import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

const THEME_ITEMS: powerbi.IEnumMember[] = [
    { value: "hell", displayName: "Hell" },
    { value: "dunkel", displayName: "Dunkel" }
];

const ZEITEINHEIT_ITEMS: powerbi.IEnumMember[] = [
    { value: "auto", displayName: "Automatisch (einpassen)" },
    { value: "Tage", displayName: "Tage" },
    { value: "Wochen", displayName: "Wochen" },
    { value: "Monate", displayName: "Monate" },
    { value: "Quartale", displayName: "Quartale" },
    { value: "Jahre", displayName: "Jahre" }
];

const TAGE_EINHEIT_ITEMS: powerbi.IEnumMember[] = [
    { value: "t", displayName: "t" },
    { value: "d", displayName: "d" },
    { value: "ohne", displayName: "Ohne Einheit" }
];

class DarstellungCardSettings extends FormattingSettingsCard {
    theme = new formattingSettings.ItemDropdown({
        name: "theme",
        displayName: "Theme",
        items: THEME_ITEMS,
        value: THEME_ITEMS[0]
    });

    wochenenden = new formattingSettings.ToggleSwitch({
        name: "wochenenden",
        displayName: "Wochenenden schattieren",
        value: true
    });

    abhaengigkeiten = new formattingSettings.ToggleSwitch({
        name: "abhaengigkeiten",
        displayName: "Abhängigkeitspfeile",
        value: true
    });

    heuteLinie = new formattingSettings.ToggleSwitch({
        name: "heuteLinie",
        displayName: "Status-/Heute-Linie",
        value: true
    });

    zeiteinheit = new formattingSettings.ItemDropdown({
        name: "zeiteinheit",
        displayName: "Standard-Zeiteinheit",
        items: ZEITEINHEIT_ITEMS,
        value: ZEITEINHEIT_ITEMS[0]
    });

    tageEinheit = new formattingSettings.ItemDropdown({
        name: "tageEinheit",
        displayName: "Einheit für Tage",
        items: TAGE_EINHEIT_ITEMS,
        value: TAGE_EINHEIT_ITEMS[0]
    });

    tabellenBreite = new formattingSettings.NumUpDown({
        name: "tabellenBreite",
        displayName: "Tabellenbreite (px, 0 = ausblenden)",
        value: 620,
        options: {
            minValue: { type: powerbi.visuals.ValidatorType.Min, value: 0 },
            maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 900 }
        }
    });

    ibcs = new formattingSettings.ToggleSwitch({
        name: "ibcs",
        displayName: "IBCS-inspiriertes Styling",
        value: false
    });

    name: string = "darstellung";
    displayName: string = "Darstellung";
    slices: Array<FormattingSettingsSlice> = [this.theme, this.zeiteinheit, this.tageEinheit, this.wochenenden, this.abhaengigkeiten, this.heuteLinie, this.tabellenBreite, this.ibcs];
}

// Eigene Farbpalette. Der Master-Schalter steht bewusst auf false: solange er
// aus ist, gilt exakt die bisherige Theme-Palette und die Picker sind nur Vorrat.
class FarbenCardSettings extends FormattingSettingsCard {
    eigene = new formattingSettings.ToggleSwitch({
        name: "eigene",
        displayName: "Eigene Farben verwenden",
        value: false
    });

    hintergrund = new formattingSettings.ColorPicker({
        name: "hintergrund",
        displayName: "Hintergrund",
        value: { value: "#FFFFFF" }
    });

    schrift = new formattingSettings.ColorPicker({
        name: "schrift",
        displayName: "Schriftfarbe",
        value: { value: "#2A2925" }
    });

    schriftSekundaer = new formattingSettings.ColorPicker({
        name: "schriftSekundaer",
        displayName: "Schriftfarbe sekundär (Daten, Achse)",
        value: { value: "#8B887E" }
    });

    linien = new formattingSettings.ColorPicker({
        name: "linien",
        displayName: "Linien und Raster",
        value: { value: "#E4E2DC" }
    });

    statusLinie = new formattingSettings.ColorPicker({
        name: "statusLinie",
        displayName: "Status-/Heute-Linie",
        value: { value: "#C25A2D" }
    });

    name: string = "farben";
    displayName: string = "Farben";
    description: string = "Wochenenden, Hover, Status-Pills und Tooltip leiten sich automatisch aus der Helligkeit des Hintergrunds ab. Balkenfarben stehen unter „Task-Farben“.";
    slices: Array<FormattingSettingsSlice> = [this.eigene, this.hintergrund, this.schrift, this.schriftSekundaer, this.linien, this.statusLinie];
}

// Alle Layout- und Schriftgrößen in px; 0 = automatisch (aus der Basis-Schriftgröße)
class GroessenCardSettings extends FormattingSettingsCard {
    zeilenhoehe = new formattingSettings.NumUpDown({
        name: "zeilenhoehe",
        displayName: "Zeilenhöhe (0 = auto)",
        value: 0,
        options: {
            minValue: { type: powerbi.visuals.ValidatorType.Min, value: 0 },
            maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 120 }
        }
    });

    balkenhoehe = new formattingSettings.NumUpDown({
        name: "balkenhoehe",
        displayName: "Balkenhöhe (0 = auto)",
        value: 0,
        options: {
            minValue: { type: powerbi.visuals.ValidatorType.Min, value: 0 },
            maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 100 }
        }
    });

    phasenbalken = new formattingSettings.NumUpDown({
        name: "phasenbalken",
        displayName: "Phasenbalken-Höhe (0 = auto)",
        value: 0,
        options: {
            minValue: { type: powerbi.visuals.ValidatorType.Min, value: 0 },
            maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 100 }
        }
    });

    meilenstein = new formattingSettings.NumUpDown({
        name: "meilenstein",
        displayName: "Meilenstein-Größe (0 = auto)",
        value: 0,
        options: {
            minValue: { type: powerbi.visuals.ValidatorType.Min, value: 0 },
            maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 100 }
        }
    });

    achsenhoehe = new formattingSettings.NumUpDown({
        name: "achsenhoehe",
        displayName: "Höhe Zeitachse (0 = auto)",
        value: 0,
        options: {
            minValue: { type: powerbi.visuals.ValidatorType.Min, value: 0 },
            maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 160 }
        }
    });

    kopfzeile = new formattingSettings.NumUpDown({
        name: "kopfzeile",
        displayName: "Höhe Tabellenkopf (0 = auto)",
        value: 0,
        options: {
            minValue: { type: powerbi.visuals.ValidatorType.Min, value: 0 },
            maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 160 }
        }
    });

    schriftTabelle = new formattingSettings.NumUpDown({
        name: "schriftTabelle",
        displayName: "Schriftgröße Tabelle (0 = auto)",
        value: 0,
        options: {
            minValue: { type: powerbi.visuals.ValidatorType.Min, value: 0 },
            maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 40 }
        }
    });

    schriftAchse = new formattingSettings.NumUpDown({
        name: "schriftAchse",
        displayName: "Schriftgröße Zeitachse (0 = auto)",
        value: 0,
        options: {
            minValue: { type: powerbi.visuals.ValidatorType.Min, value: 0 },
            maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 40 }
        }
    });

    schriftLabels = new formattingSettings.NumUpDown({
        name: "schriftLabels",
        displayName: "Schriftgröße Beschriftungen (0 = auto)",
        value: 0,
        options: {
            minValue: { type: powerbi.visuals.ValidatorType.Min, value: 0 },
            maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 40 }
        }
    });

    name: string = "groessen";
    displayName: string = "Größen";
    description: string = "Alle Werte in px. 0 = automatisch, also aus der Basis-Schriftgröße abgeleitet.";
    slices: Array<FormattingSettingsSlice> = [
        this.zeilenhoehe, this.balkenhoehe, this.phasenbalken, this.meilenstein,
        this.achsenhoehe, this.kopfzeile,
        this.schriftTabelle, this.schriftAchse, this.schriftLabels
    ];
}

// Task-Tabelle: jede Spalte einzeln schaltbar. Die Δ-Plan-Spalte bleibt bewusst
// in der Basisplan-Karte, damit es für sie nur einen Schalter gibt.
class SpaltenCardSettings extends FormattingSettingsCard {
    start = new formattingSettings.ToggleSwitch({
        name: "start",
        displayName: "Start",
        value: true
    });

    ende = new formattingSettings.ToggleSwitch({
        name: "ende",
        displayName: "Ende",
        value: true
    });

    tage = new formattingSettings.ToggleSwitch({
        name: "tage",
        displayName: "Dauer (Tage)",
        value: true
    });

    status = new formattingSettings.ToggleSwitch({
        name: "status",
        displayName: "Status",
        value: true
    });

    fortschritt = new formattingSettings.ToggleSwitch({
        name: "fortschritt",
        displayName: "Fortschritt",
        value: true
    });

    wer = new formattingSettings.ToggleSwitch({
        name: "wer",
        displayName: "Wer (Owner)",
        value: true
    });

    name: string = "spalten";
    displayName: string = "Tabellenspalten";
    description: string = "Spalten der Task-Tabelle einzeln ein-/ausblenden. Die Δ-Plan-Spalte wird in der Karte „Basisplan“ geschaltet.";
    slices: Array<FormattingSettingsSlice> = [this.start, this.ende, this.tage, this.status, this.fortschritt, this.wer];
}

class MeilensteineCardSettings extends FormattingSettingsCard {
    aufPhasenzeile = new formattingSettings.ToggleSwitch({
        name: "aufPhasenzeile",
        displayName: "Auf zugeklappten Phasen anzeigen",
        value: true
    });

    datumAnzeigen = new formattingSettings.ToggleSwitch({
        name: "datumAnzeigen",
        displayName: "Datum am Meilenstein",
        value: true
    });

    endeGleichStart = new formattingSettings.ToggleSwitch({
        name: "endeGleichStart",
        displayName: "Ende = Start als Meilenstein",
        value: false
    });

    name: string = "meilensteine";
    displayName: string = "Meilensteine";
    slices: Array<FormattingSettingsSlice> = [this.aufPhasenzeile, this.datumAnzeigen, this.endeGleichStart];
}

class BasisplanCardSettings extends FormattingSettingsCard {
    anzeigen = new formattingSettings.ToggleSwitch({
        name: "anzeigen",
        displayName: "Plan-Balken anzeigen",
        value: true
    });

    deltaSpalte = new formattingSettings.ToggleSwitch({
        name: "deltaSpalte",
        displayName: "Δ-Spalte in der Tabelle",
        value: true
    });

    verzugZeilen = new formattingSettings.ToggleSwitch({
        name: "verzugZeilen",
        displayName: "Verzug-Zeilen rot hinterlegen",
        value: true
    });

    name: string = "basisplan";
    displayName: string = "Basisplan (Plan vs. Ist)";
    slices: Array<FormattingSettingsSlice> = [this.anzeigen, this.deltaSpalte, this.verzugZeilen];
}

class SchriftCardSettings extends FormattingSettingsCard {
    font = new formattingSettings.FontControl({
        name: "font",
        displayName: "Schrift",
        fontFamily: new formattingSettings.FontPicker({
            name: "fontFamily",
            value: "Segoe UI"
        }),
        fontSize: new formattingSettings.NumUpDown({
            name: "fontSize",
            value: 13,
            options: {
                minValue: { type: powerbi.visuals.ValidatorType.Min, value: 8 },
                maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 24 }
            }
        })
    });

    name: string = "schrift";
    displayName: string = "Schrift";
    slices: Array<FormattingSettingsSlice> = [this.font];
}

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    darstellungCard = new DarstellungCardSettings();
    farbenCard = new FarbenCardSettings();
    groessenCard = new GroessenCardSettings();
    spaltenCard = new SpaltenCardSettings();
    basisplanCard = new BasisplanCardSettings();
    meilensteineCard = new MeilensteineCardSettings();
    schriftCard = new SchriftCardSettings();

    cards = [this.darstellungCard, this.farbenCard, this.groessenCard, this.spaltenCard, this.basisplanCard, this.meilensteineCard, this.schriftCard];
}
