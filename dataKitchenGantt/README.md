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
| Phase (Gruppe) | Grouping | nein | gruppiert Tasks in auf-/zuklappbare Phasen mit Summenbalken |
| Projekt (oberste Ebene) | Grouping | nein | Portfolio: eine klappbare Projektzeile ÜBER den Phasen; trägt immer alle Meilensteine des Projekts mit Datum |
| Statusdatum (rote Linie) | GroupingOrMeasure | nein | rote Linie auf Berichtsstand statt "Heute" (Label = Datum) |
| Sortierung (optional) | GroupingOrMeasure | nein | stabile aufsteigende Sortierung (z. B. MS-Project-Zeilenfolge) |
| Fortschritt | Measure | nein | 0–1 oder 0–100, Skala wird automatisch erkannt |
| Status | Grouping | nein | „Fertig/In Arbeit/Blockiert/Offen" (auch EN-Synonyme) → farbige Pills |
| Wer (Owner) | Grouping | nein | |
| Abhängigkeiten | Grouping | nein | Task-Namen, komma-/semikolongetrennt → Pfeile |
| Plan-Start (Basisplan) | Grouping | nein | Plan vs. Ist: Outline-Balken unter dem Ist-Balken |
| Plan-Ende (Basisplan) | Grouping | nein | ohne Plan-Start erbt es den Ist-Start; Δ = Ist-Ende − Plan-Ende |

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

**Farben** — eigene Karte. Solange „Eigene Farben verwenden" aus ist, gilt die Theme-Palette
wie bisher. An geschaltet ersetzen die Picker Hintergrund, Schriftfarbe, sekundäre Schriftfarbe
(Datumsangaben, Achse, Meta), Linien/Raster und die Status-/Heute-Linie. Alles Übrige leitet
sich aus der **Helligkeit des Hintergrunds** ab: Wochenend-Schattierung und Hover als heller
bzw. dunkler Schleier, Status-Pills, Verzugs-Tint, invertierter Tooltip und die Phasen-Palette
(dunkler Wunsch-Hintergrund ⇒ helle Balkenfarben, auch ohne Dunkel-Theme). Balkenfarben je
Task bleiben in „Task-Farben".

**Größen** — eigene Karte, alle Werte in px, **0 = automatisch** (also wie bisher aus der
Basis-Schriftgröße abgeleitet): Zeilenhöhe · Balkenhöhe · Phasenbalken-Höhe · Meilenstein-Größe ·
Höhe der Zeitachse · Höhe des Tabellenkopfs · Schriftgröße Tabelle · Schriftgröße Zeitachse ·
Schriftgröße Beschriftungen. Die drei Schriftwerte sind Referenzgrößen: alle Texte der Gruppe
skalieren proportional mit (Tabelle 12 · Achse 12 · Beschriftung 11), und die Spaltenbreiten
folgen der Tabellenschrift. Balken, Phasenbalken und Rauten werden auf `Zeilenhöhe − 4 px`
gedeckelt, damit eine kleine Zeilenhöhe nie zu Überlappungen führt.

**Tabellenspalten** — eigene Karte, jede Spalte der Task-Tabelle einzeln schaltbar:
Start · Ende · Dauer (Tage) · Status · Fortschritt · Wer. Alle stehen per Default auf „an".
Abgewählte Spalten verschwinden sofort, der freiwerdende Platz geht an die Task-Spalte.
Unabhängig davon gilt weiterhin: Spalten ohne gebundene Daten (kein Status/Fortschritt/Owner
im Feldbereich) erscheinen gar nicht erst, und bei zu schmaler Tabelle weichen die
verbleibenden automatisch in der Reihenfolge Wer → Tage → Status → Fortschritt → Δ → Ende → Start.
Die Δ-Plan-Spalte wird in der Karte „Basisplan" geschaltet (ein Schalter, eine Stelle).

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
`?off=status,ow` = Tabellenspalten abwählen, Keys `start,end,days,delta,status,pct,ow`;
`?bg=%23102030&fg=%23FFFFFF&fg2=…&lines=…&statusfarbe=…` = eigene Farben;
`?rowh=48&barh=26&phaseh=&msh=&axish=&headh=&fstab=&fsaxis=&fslbl=` = Größen in px).
Zum Testen in Power BI Desktop: `dist/dataKitchenGantt….pbiviz` importieren,
z. B. im `PBI-IBCS-Testbed`.
