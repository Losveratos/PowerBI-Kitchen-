# DataKitchen Gantt (Projektplan) — Power BI Custom Visual

Portiert aus `Gantt Chart - DataKitchen.html` (dc-Sample), nach dem gleichen
Muster wie `ibcsCategoryWaterfall`. Rendering-Kern liegt host-unabhängig in
[src/gantt.ts](src/gantt.ts), die Power-BI-Anbindung in [src/visual.ts](src/visual.ts).

## Datenrollen

| Rolle | Typ | Pflicht | Hinweise |
| --- | --- | --- | --- |
| Task | Grouping | ja | Task-Name; auch Schlüssel für Abhängigkeiten |
| Start (Datum) | Grouping | ja | Zeilen ohne gültiges Startdatum werden übersprungen |
| Ende (Datum) | Grouping | nein | **leer = Meilenstein (Raute)** |
| Ebenen (Gruppierung) | Grouping | nein | **bis zu 5 Felder.** Jedes Feld erzeugt eine eigene auf-/zuklappbare Ebene, in der Reihenfolge des Feldbrunnens (z. B. `Ebene 1`…`Ebene 4` aus einem MS-Project-Export). Mit genau einem Feld verhält es sich wie die frühere Rolle „Phase" |
| Projekt (oberste Ebene) | Grouping | nein | Portfolio: eine klappbare Projektzeile ÜBER den Phasen; trägt immer alle Meilensteine des Projekts mit Datum |
| Statusdatum (rote Linie) | GroupingOrMeasure | nein | rote Linie auf Berichtsstand statt "Heute" (Label = Datum) |
| Sortierung (optional) | GroupingOrMeasure | nein | stabile aufsteigende Sortierung (z. B. MS-Project-Zeilenfolge) |
| Fortschritt | Measure | nein | 0–1 oder 0–100, Skala wird automatisch erkannt |
| Status | Grouping | nein | „Fertig/In Arbeit/Blockiert/Offen" (auch EN-Synonyme) → farbige Pills |
| Wer (Owner) | Grouping | nein | |
| Abhängigkeiten | Grouping | nein | Task-Namen, komma-/semikolongetrennt → Pfeile |
| Plan-Start (Basisplan) | Grouping | nein | Plan vs. Ist: Outline-Balken unter dem Ist-Balken |
| Plan-Ende (Basisplan) | Grouping | nein | ohne Plan-Start erbt es den Ist-Start; Δ = Ist-Ende − Plan-Ende |

## Mehrstufige Hierarchie

Die Rolle **Ebenen** nimmt mehrere Felder auf und rendert sie als geschachtelte
Klappebenen. Über allem steht optional die Rolle **Projekt**.

```
▼ MAR-S005                                          Projekt
  ▼ Vor- und Entwurfsplanung erstellen (P 2/3)      Ebenen[0]
     ▼ Kampfmittelfreiheit                          Ebenen[1]
          Antrag auf Luftbildauswertung erstellen   Task
          Luftbildauswertung durchführen
        ◆ Kampfmittelfreiheit liegt vor
     ▼ PV-Anlage
        ▼ Artenschutzgutachten beauftragen          Ebenen[2]
             Erstellung Bauantragsunterlagen
             Einreichung Bauantragsunterlagen
```

Regeln, die dabei gelten:

- **Ungleich tiefe Zweige.** Leere Ebenenfelder werden verdichtet — eine Zeile
  hängt an der letzten gefüllten Ebene, namenlose Zwischengruppen entstehen nicht.
- **Gruppenbalken** spannen auf *jeder* Ebene über alle Nachfahren (Hülle aus
  min. Start / max. Ende), der Fortschritt wird dauergewichtet aggregiert.
- **Farbe** fällt auf der obersten Ebenen-Stufe und wird nach unten vererbt:
  ein Zweig trägt durchgängig eine Farbe. Die Projektebene bleibt neutral.
- **Reihenfolge** folgt der Rolle *Sortierung* (der Baum entsteht in
  Erstauftritts-Reihenfolge), nicht dem Alphabet.
- **Schlüssel** ist der Pfad, nicht der Vorgangsname — gleichnamige Vorgänge in
  verschiedenen Zweigen bleiben getrennt. Abhängigkeiten werden weiterhin über
  Vorgangsnamen aufgelöst.
- **Sammelvorgänge.** Liefert der Export für einen Knoten *zusätzlich* eine eigene
  Zeile (deren letzte Ebene den eigenen Namen trägt), wird sie ausgelassen und der
  Knoten nur als Gruppenzeile gezeigt; die Spanne kommt aus den Kindern. Ein echter
  Einzelvorgang, der zufällig wie seine Gruppe heißt, bleibt erhalten.
- Mit **genau einem** Ebenen-Feld ist das Ergebnis unverändert gegenüber 1.10.

Zeilen werden virtualisiert: nur das Sichtfenster bekommt DOM-Knoten. 30.000
Zeilen rendern damit in ~140 ms statt ~8 s.

## Interaktion

- Pannen: Chartfläche ziehen oder scrollen · Zoomen: Strg+Scrollen, +/−, Modi Tage/Wochen/Monate
- Vertikaler Scrollbalken am rechten Rand, sobald der Plan höher ist als die
  Fläche (ziehbar, Klick auf die Spur springt); Klick-Toleranz 8 px, damit
  Touchpad-Klicks (leichtes Verrutschen beim Drücken) nicht als Pannen zählen
- „Heute" zentriert auf das aktuelle Datum, „Alles" passt den gesamten Plan ein
- Phasenzeile anklicken = auf-/zuklappen — in der Tabelle **und** im Chart;
  Klicks werden koordinatenbasiert über stabile Container aufgelöst, damit
  Hover-Re-Renders keine Klicks mehr „verschlucken"
- Task anklicken = Crossfilter-Selektion (Strg = Mehrfachauswahl), Rechtsklick = Kontextmenü
- **Bewusst entfernt gegenüber dem HTML-Sample:** Balken per Drag verschieben/verlängern —
  Power BI bindet Start/Ende aus dem Datenmodell (gleiche Entscheidung wie beim
  CSV-Overlay im Waterfall-Port)

## Formatierungsbereich („Darstellung")

Theme Hell/Dunkel · Wochenenden schattieren · Abhängigkeitspfeile · Heute-Linie ·
Tabellenbreite in px (0 = Tabelle ausblenden; Spalten weichen automatisch bei Platzmangel)

**Tabellenspalten** — Start, Ende, Dauer, Status, Fortschritt, Wer einzeln
ein-/ausblenden (Δ Plan sitzt in der Karte „Basisplan").

**Meilensteine** — auf zugeklappten Gruppen anzeigen · Datum am Meilenstein ·
Name am Meilenstein · *Beschriftung auf zugeklappten Zeilen* (Nur Datum /
Nur Name / Name und Datum). Auf zugeklappten Zeilen werden überlappende
Beschriftungen ausgelassen, damit bei vielen Meilensteinen je Projekt die
verbleibenden lesbar bleiben.

**Basisplan (Plan vs. Ist)** — eigene Karte, alle drei einzeln schaltbar:
Plan-Balken anzeigen (Ist gefüllt, Plan als Outline darunter — IBCS-Szenario-Notation;
Plan-Meilensteine als Outline-Raute) · Δ-Spalte in der Tabelle („+3 d" rot = Verzug,
„−2 d" grün = früher) · Verzug-Zeilen leicht rot hinterlegen (Tabelle + Chart-Lane).
Phasen aggregieren den Plan ihrer Kinder (Hülle) und zeigen das Verzugs-Delta der Phase.

## Entwicklung

```bash
npm install
npm run package        # baut dist/*.pbiviz
npm run harness        # kompiliert src/gantt.ts nach test/ für den Browser-Test
```

Browser-Testharness: `test/harness.html` (Demo-Daten = Sample „BI-Rollout 2026" inkl.
Basisplan mit Verzügen; URL-Parameter: `?dark=1`, `?ibcs=1`, `?tw=430`, `?deps=0`,
`?wochenenden=0`, `?heute=0`, `?plan=0`, `?delta=0`, `?verzug=0`,
`?msnamen=0`, `?mslabel=nurName|beides`).
**`?ebenen=1`** lädt das mehrstufige Sample (Projekt MAR-S005, vier Ebenen,
ungleich tiefe Zweige, gleichnamige Vorgänge, Sammelvorgangs-Zeile);
`?proj=1` das Portfolio-Sample mit zwei Projekten.
Zum Testen in Power BI Desktop: `dist/dataKitchenGantt….pbiviz` importieren,
z. B. im `PBI-IBCS-Testbed`.
