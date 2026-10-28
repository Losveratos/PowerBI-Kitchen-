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
| Hauptmeilenstein (Ja/Nein) | GroupingOrMeasure | nein | markiert die Zeilen für den Filter „◆ Nur Hauptmeilensteine". Tolerant ausgelegt: `true`, `1`, `ja`, `yes`, `y`, `x`, `wahr`, `true` (Groß-/Kleinschreibung egal, getrimmt) = ja; alles andere, leer und `null` = nein |
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
- **Sammelvorgang nur aus Meilensteinen.** Er wird wie jeder Sammelvorgang als
  Balken gezeigt — mit seinen eigenen Terminen, wo der Export sie liefert —, aber
  ohne Rauten auf seiner Zeile; die Meilensteine erscheinen erst beim Aufklappen.
  Gruppen mit Vorgängen *und* Meilensteinen zeigen ihre Rauten zugeklappt wie
  bisher.
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
- **⊞ / ⊟ ganz links in der Leiste** klappen *alle* Ebenen gemeinsam auf bzw. zu —
  Projekte und Ebenen jeder Tiefe in einem Zug, auch die in zugeklappten
  Teilbäumen. Sie erscheinen nur, wenn es überhaupt Gruppen gibt, und bleiben
  sichtbar, wenn die Infozeile per *Infozeile oben anzeigen* leer ist. Die
  Knöpfe „▾ Projekte" und „▾ Ebenen" rechts klappen weiterhin gezielt nur eine
  Ebenenart.
- **„◆ Nur Hauptmeilensteine"** rechts in der Leiste schaltet auf eine **flache,
  chronologische Liste** der über die Rolle *Hauptmeilenstein (Ja/Nein)*
  markierten Zeilen um: keine Projekt- und Ebenenzeilen, keine Einrückung, bei
  gleichem Datum in Datenreihenfolge. **Jeder Meilensteinname steht genau
  einmal**: kommt derselbe Hauptmeilenstein mehrfach vor (je Projekt, je
  Berichtsstand oder als Kopie auf mehreren Ebenen), wird jedes Vorkommen eine
  eigene Raute auf dieser einen Zeile; völlig identische (gleiches Projekt,
  gleiches Datum) fallen zusammen. Die Tabelle zeigt als Start/Ende den ersten
  und letzten Termin, der Hover-Titel jeder Raute Projekt und Datum, der Tooltip
  der Zeile die Zahl der Vorkommen. Klick auf die Zeile selektiert **alle** Vorkommen, Klick auf eine
  Raute **genau dieses** — beides crossfiltert wie sonst. Der Knopf erscheint nur bei gebundener Rolle, die
  Startstellung kommt aus *Meilensteine → Nur Hauptmeilensteine*; danach gewinnt
  der Knopf, bis der Optionswert selbst wechselt (gleiches Muster wie die per
  Trenner gezogene Tabellenbreite). Beim Umschalten werden Klappzustand,
  Scrollstand und Zoom-Fit auf den gezeigten Umfang zurückgesetzt. Die Liste
  entsteht bei jedem Update aus dem DataView — Slicer, Seitenfilter und
  Crossfilter anderer Visuals schlagen also durch. Bleibt dabei kein
  Hauptmeilenstein übrig, steht mittig „Keine Hauptmeilensteine im aktuellen
  Filter"; der Knopf bleibt bedienbar.
- Gruppenzeile (Projekt oder Ebene) anklicken = auf-/zuklappen. Das gilt für die
  **ganze Zeile, an jeder Stelle** — in der Tabelle und im Chart, auf dem
  Summenbalken, auf dem Gruppennamen und auch auf den Meilenstein-Rauten, die
  eine zugeklappte Gruppe (und immer die Projektzeile) trägt. Letztere
  selektieren dort bewusst **nicht**: bei ~48 Meilensteinen je Projekt wäre die
  Zeile sonst größtenteils tot. Zum Selektieren eines Meilensteins die Gruppe
  aufklappen und seine eigene Zeile anklicken.
  Klicks laufen über **mousedown + mouseup** auf dem stabilen Viewport, nicht
  über `click`: wird der Knoten unter dem Zeiger zwischen Drücken und Loslassen
  ersetzt, stellt der Browser gar kein `click` zu — auch nicht an einen
  Vorfahren. Ein menschlicher Klick dauert länger als ein Frame, ein
  synthetischer nicht; deshalb fiel das in Tests lange nicht auf.
  `setState()` zeichnet zudem nur noch neu, wenn sich wirklich etwas ändert —
  vorher löste jedes `mouseenter` ein Neuzeichnen aus, das die Zeilen ersetzte,
  worauf der neue Knoten unter dem Zeiger sofort wieder `mouseenter` feuerte
  (gemessene Dauerschleife: 110 Renders in 2 s bei stillstehender Maus). Die Umrechnung
  berücksichtigt eine **CSS-Skalierung des Visuals** (Power BI: „Anpassen an
  Seite", Fokusmodus, Browser-Zoom, mobile Layouts) — ohne das trifft ein
  Klick die falsche Zeile, und zwar umso weiter daneben, je tiefer sie liegt.
  Dasselbe gilt für Pannen, Scrollbalken, Zoom-Anker und Tooltip-Position
- Task anklicken = Crossfilter-Selektion (Strg = Mehrfachauswahl), Rechtsklick = Kontextmenü
- **Bewusst entfernt gegenüber dem HTML-Sample:** Balken per Drag verschieben/verlängern —
  Power BI bindet Start/Ende aus dem Datenmodell (gleiche Entscheidung wie beim
  CSV-Overlay im Waterfall-Port)

## Formatierungsbereich („Darstellung")

Theme Hell/Dunkel · Wochenenden schattieren · Abhängigkeitspfeile · Heute-Linie ·
Tabellenbreite in px (0 = Tabelle ausblenden; Spalten weichen automatisch bei Platzmangel) ·
*Infozeile oben anzeigen* (der Text „1 Projekt · 9 Vorgänge · 6 Gruppen · 3 Meilensteine"
oben links; die Leiste mit den Knöpfen bleibt in jedem Fall)

**Gruppennamen im Chart** — blendet den Namen jeder Gruppenzeile zusätzlich am
Anfang ihres Summenbalkens ein (Vorgabe: an). Hilft, wenn die Tabelle schmal ist
und tiefe Ebenen dort abgeschnitten werden, oder ganz ausgeblendet ist.

**Beschriftungen** — eigene Texte statt der Vorgaben: Überschrift der
Namensspalte (Vorgabe „Task", z. B. „Vorgang"), *Projekt* und *Phase/Ebene*
jeweils in Einzahl und Mehrzahl — sie erscheinen auf den Klapp-Knöpfen und in
der Infozeile. Getrennt, weil sich der deutsche Plural nicht ableiten lässt.
Leeres Feld = Vorgabe.

**Tabellenspalten** — Start, Ende, Dauer, Status, Fortschritt, Wer einzeln
ein-/ausblenden (Δ Plan sitzt in der Karte „Basisplan").

**Meilensteine** — *Nur Hauptmeilensteine* (Vorgabe: aus; Startstellung des
Leisten-Knopfs „◆ Nur Hauptmeilensteine", siehe Interaktion) · auf zugeklappten
Gruppen anzeigen · Datum am Meilenstein ·
Name am Meilenstein · *Beschriftung auf zugeklappten Zeilen* (Nur Datum /
Nur Name / Name und Datum). Auf zugeklappten Zeilen werden überlappende
Beschriftungen ausgelassen, damit bei vielen Meilensteinen je Projekt die
verbleibenden lesbar bleiben.

**Zeiteinheiten** — welche Zoomstufen die Leiste anbietet: Tage, Wochen, Monate,
Quartale, Jahre einzeln ein-/ausblenden (Vorgabe: alle an). Die zuletzt aktive Stufe
bleibt erhalten, auch wenn ihr Knopf ausgeblendet wird; sind *alle* fünf aus, zeigt
die Leiste trotzdem alle fünf (eine leere Leiste wäre eine Sackgasse). Welche Stufe
beim Öffnen gilt, steuert weiterhin „Standard-Zeiteinheit" in der Karte Darstellung.

**Tooltip** — *Tooltip anzeigen* schaltet den Hover-Tooltip ganz ab. Darunter sind
seine Zeilen einzeln schaltbar: Zeitraum, Plan (Basisplan), Abweichung, Dauer, Status,
Fortschritt, Wer, Hängt ab von (Vorgabe: alle an). Der Name des Vorgangs steht immer
oben; Plan und Abweichung erscheinen ohnehin nur bei gebundenen Basisplandaten.

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
`?msnamen=0`, `?mslabel=nurName|beides`, `?gnamen=0`, `?kopf=0`, `?tooltip=0`,
`?tipzeilen=dauer,wer`, `?zeinheiten=Tage,Monate`, `?nurhaupt=1`,
`?txt=Vorgang|Vorhaben|Vorhaben|Paket|Pakete` — Namensspalte|Projekt 1|Projekt n|Ebene 1|Ebene n).
**`?nurhaupt=1`** startet mit aktivem Hauptmeilenstein-Filter; die Samples
markieren dafür einzelne Meilensteine mit `haupt: true`.
**`?ebenen=1`** lädt das mehrstufige Sample (Projekt MAR-S005, vier Ebenen,
ungleich tiefe Zweige, gleichnamige Vorgänge und **zwei** Sammelvorgangs-Zeilen:
„Artenschutzgutachten …" mit Vorgängen und „Inbetriebnahme" mit Meilensteinen
als Kindern); `?proj=1` das Portfolio-Sample mit zwei Projekten.
Zum Testen in Power BI Desktop: `dist/dataKitchenGantt….pbiviz` importieren,
z. B. im `PBI-IBCS-Testbed`.
