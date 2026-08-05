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
    basisplanCard = new BasisplanCardSettings();
    meilensteineCard = new MeilensteineCardSettings();
    schriftCard = new SchriftCardSettings();

    cards = [this.darstellungCard, this.basisplanCard, this.meilensteineCard, this.schriftCard];
}
