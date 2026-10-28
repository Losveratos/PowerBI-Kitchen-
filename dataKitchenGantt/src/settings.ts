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

const MS_BESCHRIFTUNG_ITEMS: powerbi.IEnumMember[] = [
    { value: "nurDatum", displayName: "Nur Datum" },
    { value: "nurName", displayName: "Nur Name" },
    { value: "beides", displayName: "Name und Datum" }
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

    // Nur der Infotext oben links; die Leiste mit den Knöpfen bleibt bestehen,
    // sonst wäre Zoomen/"Heute" im Bericht nicht mehr erreichbar.
    kopfzeile = new formattingSettings.ToggleSwitch({
        name: "kopfzeile",
        displayName: "Infozeile oben anzeigen",
        value: true
    });

    ibcs = new formattingSettings.ToggleSwitch({
        name: "ibcs",
        displayName: "IBCS-inspiriertes Styling",
        value: false
    });

    gruppenNamen = new formattingSettings.ToggleSwitch({
        name: "gruppenNamen",
        displayName: "Gruppennamen im Chart",
        value: true
    });

    name: string = "darstellung";
    displayName: string = "Darstellung";
    slices: Array<FormattingSettingsSlice> = [this.theme, this.zeiteinheit, this.tageEinheit, this.wochenenden, this.abhaengigkeiten, this.heuteLinie, this.tabellenBreite, this.gruppenNamen, this.kopfzeile, this.ibcs];
}

class SpaltenCardSettings extends FormattingSettingsCard {
    start = new formattingSettings.ToggleSwitch({ name: "start", displayName: "Start", value: true });
    ende = new formattingSettings.ToggleSwitch({ name: "ende", displayName: "Ende", value: true });
    tage = new formattingSettings.ToggleSwitch({ name: "tage", displayName: "Dauer (Tage)", value: true });
    status = new formattingSettings.ToggleSwitch({ name: "status", displayName: "Status", value: true });
    fortschritt = new formattingSettings.ToggleSwitch({ name: "fortschritt", displayName: "Fortschritt", value: true });
    wer = new formattingSettings.ToggleSwitch({ name: "wer", displayName: "Wer (Owner)", value: true });

    name: string = "spalten";
    displayName: string = "Tabellenspalten";
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

    // Name an der Raute einer normalen Meilenstein-Zeile (bisheriges Verhalten: immer an)
    namenAnzeigen = new formattingSettings.ToggleSwitch({
        name: "namenAnzeigen",
        displayName: "Name am Meilenstein",
        value: true
    });

    // Nur die STARTSTELLUNG des Leisten-Knopfs „◆ Nur Hauptmeilensteine“:
    // im Bericht soll der Filter ohne Formatbereich erreichbar sein, deshalb
    // gewinnt der Knopf, bis dieser Wert selbst wieder geändert wird.
    nurHaupt = new formattingSettings.ToggleSwitch({
        name: "nurHaupt",
        displayName: "Nur Hauptmeilensteine",
        value: false
    });

    // Auf ZUGEKLAPPTEN Gruppenzeilen stand bisher nur das Datum — bei ~48
    // Meilensteinen je Projekt ist damit nicht erkennbar, welcher gemeint ist.
    beschriftung = new formattingSettings.ItemDropdown({
        name: "beschriftung",
        displayName: "Beschriftung auf zugeklappten Zeilen",
        items: MS_BESCHRIFTUNG_ITEMS,
        value: MS_BESCHRIFTUNG_ITEMS[0]
    });

    name: string = "meilensteine";
    displayName: string = "Meilensteine";
    slices: Array<FormattingSettingsSlice> = [this.nurHaupt, this.aufPhasenzeile, this.datumAnzeigen, this.namenAnzeigen, this.beschriftung, this.endeGleichStart];
}

class TooltipCardSettings extends FormattingSettingsCard {
    // Master ganz oben: aus = es wird gar kein Tooltip gezeichnet.
    anzeigen = new formattingSettings.ToggleSwitch({ name: "anzeigen", displayName: "Tooltip anzeigen", value: true });

    zeitraum = new formattingSettings.ToggleSwitch({ name: "zeitraum", displayName: "Zeitraum", value: true });
    plan = new formattingSettings.ToggleSwitch({ name: "plan", displayName: "Plan (Basisplan)", value: true });
    abweichung = new formattingSettings.ToggleSwitch({ name: "abweichung", displayName: "Abweichung", value: true });
    dauer = new formattingSettings.ToggleSwitch({ name: "dauer", displayName: "Dauer", value: true });
    status = new formattingSettings.ToggleSwitch({ name: "status", displayName: "Status", value: true });
    fortschritt = new formattingSettings.ToggleSwitch({ name: "fortschritt", displayName: "Fortschritt", value: true });
    wer = new formattingSettings.ToggleSwitch({ name: "wer", displayName: "Wer", value: true });
    abhaengigkeiten = new formattingSettings.ToggleSwitch({ name: "abhaengigkeiten", displayName: "Hängt ab von", value: true });

    name: string = "tooltip";
    displayName: string = "Tooltip";
    slices: Array<FormattingSettingsSlice> = [this.anzeigen, this.zeitraum, this.plan, this.abweichung, this.dauer, this.status, this.fortschritt, this.wer, this.abhaengigkeiten];
}

class ZeiteinheitenCardSettings extends FormattingSettingsCard {
    tage = new formattingSettings.ToggleSwitch({ name: "tage", displayName: "Tage", value: true });
    wochen = new formattingSettings.ToggleSwitch({ name: "wochen", displayName: "Wochen", value: true });
    monate = new formattingSettings.ToggleSwitch({ name: "monate", displayName: "Monate", value: true });
    quartale = new formattingSettings.ToggleSwitch({ name: "quartale", displayName: "Quartale", value: true });
    jahre = new formattingSettings.ToggleSwitch({ name: "jahre", displayName: "Jahre", value: true });

    name: string = "zeiteinheiten";
    displayName: string = "Zeiteinheiten";
    slices: Array<FormattingSettingsSlice> = [this.tage, this.wochen, this.monate, this.quartale, this.jahre];
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
    zeiteinheitenCard = new ZeiteinheitenCardSettings();
    spaltenCard = new SpaltenCardSettings();
    basisplanCard = new BasisplanCardSettings();
    meilensteineCard = new MeilensteineCardSettings();
    tooltipCard = new TooltipCardSettings();
    schriftCard = new SchriftCardSettings();

    cards = [this.darstellungCard, this.zeiteinheitenCard, this.spaltenCard, this.basisplanCard, this.meilensteineCard, this.tooltipCard, this.schriftCard];
}
