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

const ANSICHT_ITEMS: powerbi.IEnumMember[] = [
    { value: "alle", displayName: "Alle Vorgänge" },
    { value: "haupt", displayName: "Nur Hauptmeilensteine" },
    { value: "kritisch", displayName: "Nur kritischer Pfad" },
    { value: "ueberfaellig", displayName: "Nur überfällige" }
];

const FARBE_ITEMS: powerbi.IEnumMember[] = [
    { value: "zweig", displayName: "Zweig (Standard)" },
    { value: "status", displayName: "Status" },
    { value: "kritisch", displayName: "Kritischer Pfad" },
    { value: "feld", displayName: "Feld „Farbe nach“" }
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

    // Nur die STARTSTELLUNG: im Bericht wechselt der Leser die Ansicht über
    // „Ansicht ▾“ in der Leiste; die gewinnt, bis dieser Wert selbst wechselt.
    startAnsicht = new formattingSettings.ItemDropdown({
        name: "startAnsicht",
        displayName: "Startansicht",
        items: ANSICHT_ITEMS,
        value: ANSICHT_ITEMS[0]
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
    slices: Array<FormattingSettingsSlice> = [this.theme, this.startAnsicht, this.zeiteinheit, this.tageEinheit, this.wochenenden, this.abhaengigkeiten, this.heuteLinie, this.tabellenBreite, this.gruppenNamen, this.kopfzeile, this.ibcs];
}

// Planerwerkzeuge. Alles ist an, wo die Daten es hergeben — ohne gebundene
// Rolle bzw. ohne Vorgänger zeichnet das Visual schlicht nichts davon.
class TerminplanungCardSettings extends FormattingSettingsCard {
    kritischHervorheben = new formattingSettings.ToggleSwitch({ name: "kritischHervorheben", displayName: "Kritischen Pfad hervorheben", value: true });
    ueberfaelligMarkieren = new formattingSettings.ToggleSwitch({ name: "ueberfaelligMarkieren", displayName: "Überfällige markieren (zum Statusdatum)", value: true });
    pufferAnzeigen = new formattingSettings.ToggleSwitch({ name: "pufferAnzeigen", displayName: "Puffer als Linie anzeigen", value: true });
    stichtageAnzeigen = new formattingSettings.ToggleSwitch({ name: "stichtageAnzeigen", displayName: "Stichtage anzeigen", value: true });
    // Aus als Vorgabe: die Linie ist dicht und erst bei gepflegtem Fortschritt aussagekräftig
    fortschrittslinie = new formattingSettings.ToggleSwitch({ name: "fortschrittslinie", displayName: "Fortschrittslinie", value: false });
    // Aus als Vorgabe, damit bestehende Berichte dieselben Tageszahlen behalten
    arbeitstage = new formattingSettings.ToggleSwitch({ name: "arbeitstage", displayName: "Dauer in Arbeitstagen (Mo–Fr)", value: false });
    feiertage = new formattingSettings.TextInput({ name: "feiertage", displayName: "Feiertage (TT.MM.JJJJ, kommagetrennt)", value: "", placeholder: "01.01.2026, 03.04.2026" });

    name: string = "terminplanung";
    displayName: string = "Terminplanung";
    slices: Array<FormattingSettingsSlice> = [this.kritischHervorheben, this.ueberfaelligMarkieren, this.pufferAnzeigen, this.stichtageAnzeigen, this.fortschrittslinie, this.arbeitstage, this.feiertage];
}

class BalkenCardSettings extends FormattingSettingsCard {
    farbeNach = new formattingSettings.ItemDropdown({ name: "farbeNach", displayName: "Balkenfarbe nach", items: FARBE_ITEMS, value: FARBE_ITEMS[0] });
    legende = new formattingSettings.ToggleSwitch({ name: "legende", displayName: "Legende anzeigen", value: true });

    name: string = "balken";
    displayName: string = "Balken";
    slices: Array<FormattingSettingsSlice> = [this.farbeNach, this.legende];
}

// Eigene Bezeichnungen. Leer = Vorgabe des Visuals; der Platzhalter zeigt sie.
class BeschriftungenCardSettings extends FormattingSettingsCard {
    spalteTask = new formattingSettings.TextInput({ name: "spalteTask", displayName: "Überschrift Namensspalte", value: "", placeholder: "Task" });
    projekt1 = new formattingSettings.TextInput({ name: "projekt1", displayName: "Projekt (Einzahl)", value: "", placeholder: "Projekt" });
    projektN = new formattingSettings.TextInput({ name: "projektN", displayName: "Projekte (Mehrzahl)", value: "", placeholder: "Projekte" });
    ebene1 = new formattingSettings.TextInput({ name: "ebene1", displayName: "Phase/Ebene (Einzahl)", value: "", placeholder: "Phase" });
    ebeneN = new formattingSettings.TextInput({ name: "ebeneN", displayName: "Phasen/Ebenen (Mehrzahl)", value: "", placeholder: "Phasen" });

    name: string = "beschriftungen";
    displayName: string = "Beschriftungen";
    slices: Array<FormattingSettingsSlice> = [this.spalteTask, this.projekt1, this.projektN, this.ebene1, this.ebeneN];
}

class SpaltenCardSettings extends FormattingSettingsCard {
    start = new formattingSettings.ToggleSwitch({ name: "start", displayName: "Start", value: true });
    ende = new formattingSettings.ToggleSwitch({ name: "ende", displayName: "Ende", value: true });
    tage = new formattingSettings.ToggleSwitch({ name: "tage", displayName: "Dauer (Tage)", value: true });
    status = new formattingSettings.ToggleSwitch({ name: "status", displayName: "Status", value: true });
    fortschritt = new formattingSettings.ToggleSwitch({ name: "fortschritt", displayName: "Fortschritt", value: true });
    wer = new formattingSettings.ToggleSwitch({ name: "wer", displayName: "Wer (Owner)", value: true });
    psp = new formattingSettings.ToggleSwitch({ name: "psp", displayName: "PSP-Code", value: true });
    puffer = new formattingSettings.ToggleSwitch({ name: "puffer", displayName: "Puffer", value: true });
    stichtag = new formattingSettings.ToggleSwitch({ name: "stichtag", displayName: "Stichtag", value: true });
    zusatz = new formattingSettings.ToggleSwitch({ name: "zusatz", displayName: "Zusatzspalten", value: true });
    zweizeilig = new formattingSettings.ToggleSwitch({ name: "zweizeilig", displayName: "Lange Namen zweizeilig", value: false });

    name: string = "spalten";
    displayName: string = "Tabellenspalten";
    slices: Array<FormattingSettingsSlice> = [this.psp, this.start, this.ende, this.tage, this.puffer, this.stichtag, this.status, this.fortschritt, this.wer, this.zusatz, this.zweizeilig];
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
    slices: Array<FormattingSettingsSlice> = [this.aufPhasenzeile, this.datumAnzeigen, this.namenAnzeigen, this.beschriftung, this.endeGleichStart];
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
    planung = new formattingSettings.ToggleSwitch({ name: "planung", displayName: "Kritisch, Puffer, Stichtag, überfällig", value: true });

    name: string = "tooltip";
    displayName: string = "Tooltip";
    slices: Array<FormattingSettingsSlice> = [this.anzeigen, this.zeitraum, this.plan, this.abweichung, this.dauer, this.status, this.fortschritt, this.wer, this.abhaengigkeiten, this.planung];
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
    terminplanungCard = new TerminplanungCardSettings();
    balkenCard = new BalkenCardSettings();
    zeiteinheitenCard = new ZeiteinheitenCardSettings();
    spaltenCard = new SpaltenCardSettings();
    beschriftungenCard = new BeschriftungenCardSettings();
    basisplanCard = new BasisplanCardSettings();
    meilensteineCard = new MeilensteineCardSettings();
    tooltipCard = new TooltipCardSettings();
    schriftCard = new SchriftCardSettings();

    // Reihenfolge = Reihenfolge im Formatbereich: was man oft braucht, zuerst
    cards = [this.darstellungCard, this.terminplanungCard, this.balkenCard, this.zeiteinheitenCard, this.spaltenCard, this.beschriftungenCard, this.basisplanCard, this.meilensteineCard, this.tooltipCard, this.schriftCard];
}
