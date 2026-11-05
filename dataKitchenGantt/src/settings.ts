"use strict";

import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsCompositeCard = formattingSettings.CompositeCard;
import FormattingSettingsGroup = formattingSettings.Group;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

// ============================================================
// Formatbereich. Leitlinien für Ersteller:
// - Häufiges zuerst, große Karten in Gruppen gegliedert.
// - Hauptschalter einer Karte sitzen im Kartenkopf (Tooltip, Basisplan).
// - Was mangels Daten nichts bewirken würde, ist ausgeblendet (Spalten) bzw.
//   ausgegraut MIT Grund (Basisplan, kritischer Pfad) — siehe anpassen().
// - Eigenschaftsnamen sind seit 1.x stabil: bestehende Berichte behalten
//   ihre Einstellungen.
// ============================================================

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
    { value: "Tg", displayName: "Tg." },
    { value: "ohne", displayName: "Ohne Einheit" }
];

// Erster Eintrag = Vorgabe ('alle'). Werte sind stabil; 2.3 benennt die
// Anzeige nach den vier Sichten eines Terminplaners und ergänzt zwei Werte.
const ANSICHT_ITEMS: powerbi.IEnumMember[] = [
    { value: "alle", displayName: "Gesamter Terminplan (alles aufgeklappt)" },
    // 2.3: nur die oberste Ebene der Sammelvorgänge, zugeklappt; Projekte offen
    { value: "sammel", displayName: "Sammelvorgänge (oberste Ebene)" },
    // 2.2: wie "alle", aber jede Gruppe startet zugeklappt — mit Projekt-Rolle
    // also ein Summenbalken je Projekt (Portfolio-Übersicht)
    { value: "projekte", displayName: "Je Projekt ein Balken (alles zugeklappt)" },
    // 2.3: alle Meilensteine, in ihren Gruppen
    { value: "meilensteine", displayName: "Nur Meilensteine" },
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

const schalter = (name: string, displayName: string, value: boolean, description?: string) =>
    new formattingSettings.ToggleSwitch({ name, displayName, value, description });

class DarstellungCardSettings extends FormattingSettingsCompositeCard {
    theme = new formattingSettings.ItemDropdown({ name: "theme", displayName: "Theme", items: THEME_ITEMS, value: THEME_ITEMS[0] });
    // Nur die STARTSTELLUNG: im Bericht wechselt der Leser die Ansicht über
    // „Ansicht ▾“ in der Leiste; die gewinnt, bis dieser Wert selbst wechselt.
    startAnsicht = new formattingSettings.ItemDropdown({
        name: "startAnsicht", displayName: "Startansicht", items: ANSICHT_ITEMS, value: ANSICHT_ITEMS[0],
        description: "Womit das Visual startet. „Sammelvorgänge“ zeigt je Projekt die oberste Gliederungsebene zugeklappt, „Je Projekt ein Balken“ klappt alles zu. Leser wechseln die Ansicht über „Ansicht ▾“ in der Leiste."
    });
    ibcs = schalter("ibcs", "IBCS-inspiriertes Styling", false, "Monochrom, weißer Hintergrund, Plan als Rahmen — nach den International Business Communication Standards.");
    einrichtung = schalter("einrichtung", "Einrichtungshilfe", true,
        "Knopf „✎ Einrichtung“ mit Felder-Checkliste, Datenprüfung und Vorlagen. Erscheint nur im Bearbeitungsmodus, nie für Leser.");

    zeiteinheit = new formattingSettings.ItemDropdown({
        name: "zeiteinheit", displayName: "Standard-Zeiteinheit", items: ZEITEINHEIT_ITEMS, value: ZEITEINHEIT_ITEMS[0],
        description: "Zoomstufe beim Öffnen. „Automatisch“ passt den ganzen Plan ein."
    });
    tageEinheit = new formattingSettings.ItemDropdown({ name: "tageEinheit", displayName: "Einheit für Tage", items: TAGE_EINHEIT_ITEMS, value: TAGE_EINHEIT_ITEMS[0] });
    wochenenden = schalter("wochenenden", "Wochenenden und Feiertage schattieren", true);
    heuteLinie = schalter("heuteLinie", "Status-/Heute-Linie", true, "Rote Linie am Statusdatum (Rolle „Statusdatum“), sonst heute.");

    abhaengigkeiten = schalter("abhaengigkeiten", "Abhängigkeitspfeile", true);
    gruppenNamen = schalter("gruppenNamen", "Gruppennamen im Chart", true, "Name jeder Gruppe am Anfang ihres Balkens — hilft bei schmaler oder ausgeblendeter Tabelle.");
    // Nur der Infotext oben links; die Leiste mit den Knöpfen bleibt bestehen,
    // sonst wäre Zoomen/"Heute" im Bericht nicht mehr erreichbar.
    kopfzeile = schalter("kopfzeile", "Infozeile oben anzeigen", true, "Zähler wie „11 Vorgänge · 5 Gruppen“. Die Knöpfe der Leiste bleiben immer.");
    tabellenBreite = new formattingSettings.NumUpDown({
        name: "tabellenBreite", displayName: "Tabellenbreite (px, 0 = ausblenden)", value: 620,
        description: "Lässt sich auch direkt im Visual am Trenner zwischen Tabelle und Chart ziehen.",
        options: {
            minValue: { type: powerbi.visuals.ValidatorType.Min, value: 0 },
            maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 900 }
        }
    });

    // 2.3: Knöpfe für Leser in der Leiste (sichtbar auch außerhalb des
    // Bearbeitungsmodus). Der Zustand gilt nur für die Sitzung des Lesers.
    knopfMeilensteine = schalter("knopfMeilensteine", "Knopf „◆ Meilensteine“", true,
        "Leser blenden Meilenstein-Zeilen und -Rauten ein und aus. Erscheint nur, wenn es Meilensteine gibt, und nicht in den Meilenstein-Ansichten.");
    knopfBasisplan = schalter("knopfBasisplan", "Knopf „▭ Basisplan“", true,
        "Leser blenden Basisplan-Balken, Legende und Δ ein und aus. Erscheint nur mit Basisplan-Terminen und eingeschaltetem Basisplan.");

    allgemein = new FormattingSettingsGroup({ name: "allgemein", displayName: "Allgemein", slices: [this.theme, this.startAnsicht, this.ibcs, this.einrichtung] });
    knoepfe = new FormattingSettingsGroup({ name: "knoepfe", displayName: "Knöpfe für Leser", slices: [this.knopfMeilensteine, this.knopfBasisplan] });
    zeitachse = new FormattingSettingsGroup({ name: "zeitachse", displayName: "Zeitachse", slices: [this.zeiteinheit, this.tageEinheit, this.wochenenden, this.heuteLinie] });
    planGruppe = new FormattingSettingsGroup({ name: "plan", displayName: "Plan und Tabelle", slices: [this.abhaengigkeiten, this.gruppenNamen, this.kopfzeile, this.tabellenBreite] });

    name: string = "darstellung";
    displayName: string = "Darstellung";
    groups: Array<FormattingSettingsGroup> = [this.allgemein, this.knoepfe, this.zeitachse, this.planGruppe];
}

// Planerwerkzeuge. Alles ist an, wo die Daten es hergeben — ohne gebundene
// Rolle zeichnet das Visual schlicht nichts davon.
class TerminplanungCardSettings extends FormattingSettingsCompositeCard {
    kritischHervorheben = schalter("kritischHervorheben", "Kritischen Pfad hervorheben", true,
        "Rote Rahmen und Pfeile. Quelle: Rolle „Kritisch“, sonst „Gesamte Pufferzeit“, sonst aus Terminen und Vorgängern berechnet.");
    pufferAnzeigen = schalter("pufferAnzeigen", "Puffer als Linie anzeigen", true, "Dünne Linie unter dem Balken bis zum spätesten Ende.");
    ueberfaelligMarkieren = schalter("ueberfaelligMarkieren", "Überfällige markieren", true,
        "Ende vor dem Statusdatum, aber nicht fertig. Braucht „Fortschritt“ oder „Status“.");
    stichtageAnzeigen = schalter("stichtageAnzeigen", "Stichtage anzeigen", true, "Braucht die Rolle „Stichtag“. Grün eingehalten, rot überschritten.");
    // Aus als Vorgabe: die Linie ist dicht und erst bei gepflegtem Fortschritt aussagekräftig
    fortschrittslinie = schalter("fortschrittslinie", "Fortschrittslinie", false,
        "Wie in MS Project: Knick nach links = Rückstand, nach rechts = Vorsprung. Braucht „Fortschritt“.");
    // Aus als Vorgabe, damit bestehende Berichte dieselben Tageszahlen behalten
    arbeitstage = schalter("arbeitstage", "Dauer in Arbeitstagen (Mo–Fr)", false, "Dauer, Δ und „überfällig“ in Arbeitstagen statt Kalendertagen.");
    feiertage = new formattingSettings.TextArea({
        name: "feiertage", displayName: "Feiertage", value: "", placeholder: "01.01.2026, 03.04.2026, 06.04.2026",
        description: "TT.MM.JJJJ, durch Komma oder Zeilenumbruch getrennt. Wirken auf Dauer, Δ, Puffer, kritischen Pfad und die Schattierung."
    });

    kritisch = new FormattingSettingsGroup({ name: "kritisch", displayName: "Kritischer Pfad und Puffer", slices: [this.kritischHervorheben, this.pufferAnzeigen] });
    termine = new FormattingSettingsGroup({ name: "termine", displayName: "Termine", slices: [this.ueberfaelligMarkieren, this.stichtageAnzeigen, this.fortschrittslinie] });
    kalender = new FormattingSettingsGroup({ name: "kalender", displayName: "Kalender", slices: [this.arbeitstage, this.feiertage] });

    name: string = "terminplanung";
    displayName: string = "Terminplanung";
    groups: Array<FormattingSettingsGroup> = [this.kritisch, this.termine, this.kalender];
}

class BalkenCardSettings extends FormattingSettingsCard {
    farbeNach = new formattingSettings.ItemDropdown({
        name: "farbeNach", displayName: "Balkenfarbe nach", items: FARBE_ITEMS, value: FARBE_ITEMS[0],
        description: "„Feld“ nutzt die Rolle „Farbe nach“ (z. B. Gewerk oder Ampel). Ohne passende Daten bleibt es beim Zweig."
    });
    legende = schalter("legende", "Legende anzeigen", true);

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
    description: string = "Leer lassen = Vorgabe. Einzahl und Mehrzahl getrennt, weil sich der Plural nicht ableiten lässt.";
    slices: Array<FormattingSettingsSlice> = [this.spalteTask, this.projekt1, this.projektN, this.ebene1, this.ebeneN];
}

class SpaltenCardSettings extends FormattingSettingsCard {
    psp = schalter("psp", "PSP-Code", true);
    start = schalter("start", "Start", true);
    ende = schalter("ende", "Ende", true);
    tage = schalter("tage", "Dauer (Tage)", true);
    puffer = schalter("puffer", "Puffer", true);
    stichtag = schalter("stichtag", "Stichtag", true);
    status = schalter("status", "Status", true);
    fortschritt = schalter("fortschritt", "Fortschritt", true);
    wer = schalter("wer", "Wer (Owner)", true);
    zusatz = schalter("zusatz", "Zusatzspalten", true);
    zweizeilig = schalter("zweizeilig", "Lange Namen zweizeilig", false, "Der volle Name steht ohnehin immer im Hover-Titel.");

    name: string = "spalten";
    displayName: string = "Tabellenspalten";
    description: string = "Spalten ohne Daten erscheinen gar nicht erst; bei schmaler Tabelle weichen sie automatisch. Δ Plan sitzt in der Karte „Basisplan“.";
    slices: Array<FormattingSettingsSlice> = [this.psp, this.start, this.ende, this.tage, this.puffer, this.stichtag, this.status, this.fortschritt, this.wer, this.zusatz, this.zweizeilig];
}

class MeilensteineCardSettings extends FormattingSettingsCard {
    aufPhasenzeile = schalter("aufPhasenzeile", "Auf zugeklappten Gruppen anzeigen", true);
    datumAnzeigen = schalter("datumAnzeigen", "Datum am Meilenstein", true);
    // Name an der Raute einer normalen Meilenstein-Zeile (bisheriges Verhalten: immer an)
    namenAnzeigen = schalter("namenAnzeigen", "Name am Meilenstein", true);
    // Auf ZUGEKLAPPTEN Gruppenzeilen stand bisher nur das Datum — bei ~48
    // Meilensteinen je Projekt ist damit nicht erkennbar, welcher gemeint ist.
    beschriftung = new formattingSettings.ItemDropdown({
        name: "beschriftung", displayName: "Beschriftung auf zugeklappten Zeilen", items: MS_BESCHRIFTUNG_ITEMS, value: MS_BESCHRIFTUNG_ITEMS[0]
    });
    endeGleichStart = schalter("endeGleichStart", "Ende = Start als Meilenstein", false,
        "MS-Project-Exporte liefern Meilensteine oft mit Ende = Start. Aus, damit eintägige Vorgänge keine Rauten werden.");

    name: string = "meilensteine";
    displayName: string = "Meilensteine";
    slices: Array<FormattingSettingsSlice> = [this.aufPhasenzeile, this.datumAnzeigen, this.namenAnzeigen, this.beschriftung, this.endeGleichStart];
}

class TooltipCardSettings extends FormattingSettingsCard {
    // Hauptschalter im Kartenkopf: aus = gar kein Tooltip
    anzeigen = schalter("anzeigen", "Tooltip anzeigen", true);

    // Bezeichnungen wie im Tooltip selbst: „Aktuell“ = Ist-/Prognosetermine, „Basisplan“ = Plan-Start/-Ende
    zeitraum = schalter("zeitraum", "Aktuell (Zeitraum)", true);
    plan = schalter("plan", "Basisplan", true);
    abweichung = schalter("abweichung", "Abweichung", true);
    dauer = schalter("dauer", "Dauer", true);
    status = schalter("status", "Status", true);
    fortschritt = schalter("fortschritt", "Fortschritt", true);
    wer = schalter("wer", "Wer", true);
    abhaengigkeiten = schalter("abhaengigkeiten", "Hängt ab von", true);
    planung = schalter("planung", "Kritisch, Puffer, Stichtag, überfällig", true);

    name: string = "tooltip";
    displayName: string = "Tooltip";
    topLevelSlice: formattingSettings.SimpleSlice = this.anzeigen;
    slices: Array<FormattingSettingsSlice> = [this.zeitraum, this.plan, this.abweichung, this.dauer, this.status, this.fortschritt, this.wer, this.abhaengigkeiten, this.planung];
}

class ZeiteinheitenCardSettings extends FormattingSettingsCard {
    tage = schalter("tage", "Tage", true);
    wochen = schalter("wochen", "Wochen", true);
    monate = schalter("monate", "Monate", true);
    quartale = schalter("quartale", "Quartale", true);
    jahre = schalter("jahre", "Jahre", true);

    name: string = "zeiteinheiten";
    displayName: string = "Zeiteinheiten";
    description: string = "Welche Zoomstufen die Leiste anbietet. Sind alle aus, zeigt sie trotzdem alle — eine leere Leiste wäre eine Sackgasse.";
    slices: Array<FormattingSettingsSlice> = [this.tage, this.wochen, this.monate, this.quartale, this.jahre];
}

class BasisplanCardSettings extends FormattingSettingsCard {
    // Hauptschalter im Kartenkopf
    anzeigen = schalter("anzeigen", "Basisplan-Balken anzeigen", true);
    // 2.2: Legende „Aktuell“ / „Basisplan“ in der Leiste (nur mit Basisplan-Daten)
    legende = schalter("legende", "Legende Aktuell/Basisplan", true,
        "Zeigt in der Leiste „Aktuell“ (farbiger Balken) und „Basisplan“ (grauer Balken darunter), sobald Basisplan-Termine gebunden sind.");
    // 2.2: „Δ +n t“ hinter Balken- und Meilensteinbeschriftung; der graue
    // Basisplan-Balken, Tooltip und Δ-Spalte bleiben davon unberührt
    deltaBeschriftung = schalter("deltaBeschriftung", "Δ an Balken und Meilensteinen", true,
        "Hängt die Abweichung „Δ +n t“ an die Beschriftung. Aus = nur der graue Basisplan-Balken; Tooltip und Δ-Spalte zeigen sie weiter.");
    deltaSpalte = schalter("deltaSpalte", "Δ-Spalte in der Tabelle", true);
    verzugZeilen = schalter("verzugZeilen", "Verzug-Zeilen rot hinterlegen", true);

    name: string = "basisplan";
    displayName: string = "Basisplan (Aktuell vs. Basisplan)";
    description: string = "Grauer Basisplan-Balken unter dem farbigen Aktuell-Balken, wie die Überwachungsansicht in MS Project.";
    topLevelSlice: formattingSettings.SimpleSlice = this.anzeigen;
    slices: Array<FormattingSettingsSlice> = [this.legende, this.deltaBeschriftung, this.deltaSpalte, this.verzugZeilen];
}

class SchriftCardSettings extends FormattingSettingsCard {
    font = new formattingSettings.FontControl({
        name: "font",
        displayName: "Schrift",
        fontFamily: new formattingSettings.FontPicker({ name: "fontFamily", value: "Segoe UI" }),
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
    description: string = "Alle Maße — Zeilenhöhe, Balken, Rauten — skalieren mit der Schriftgröße.";
    slices: Array<FormattingSettingsSlice> = [this.font];
}

// Was die gebundenen Daten hergeben — steuert, was der Formatbereich zeigt
export interface DatenLage {
    plan: boolean; psp: boolean; puffer: boolean; stichtag: boolean; zusatz: boolean;
    status: boolean; pct: boolean; owner: boolean; krit: boolean; feld: boolean; ende: boolean;
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
    cards = [this.darstellungCard, this.terminplanungCard, this.balkenCard, this.spaltenCard, this.basisplanCard, this.meilensteineCard,
        this.tooltipCard, this.beschriftungenCard, this.zeiteinheitenCard, this.schriftCard];

    // Spaltenschalter ohne Daten ausblenden (die Spalte gäbe es ohnehin nicht);
    // ganze Bereiche ausgrauen MIT Grund, damit man findet, was fehlt.
    public anpassen(d: DatenLage): void {
        const sp = this.spaltenCard;
        sp.psp.visible = d.psp;
        sp.ende.visible = d.ende;
        sp.puffer.visible = d.puffer;
        sp.stichtag.visible = d.stichtag;
        sp.zusatz.visible = d.zusatz;
        sp.status.visible = d.status;
        sp.fortschritt.visible = d.pct;
        sp.wer.visible = d.owner;

        const tp = this.terminplanungCard;
        tp.kritisch.disabled = !d.krit;
        tp.kritisch.disabledReason = d.krit ? undefined : "Braucht „Vorgänger“ (mit „Nr.“), „Kritisch“ oder „Gesamte Pufferzeit“.";
        tp.stichtageAnzeigen.visible = d.stichtag;

        // Ohne Basisplan-Termine gäbe es den Knopf ohnehin nicht
        this.darstellungCard.knopfBasisplan.visible = d.plan;

        const bp = this.basisplanCard;
        bp.disabled = !d.plan;
        bp.disabledReason = d.plan ? undefined : "Braucht „Plan-Start“ oder „Plan-Ende“.";
    }
}
