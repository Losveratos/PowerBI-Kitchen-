# IBCS Inspired Chart Deck — Custom Visual für Power BI

Ein echtes Power BI Custom Visual (`.pbiviz`), das die wichtigsten IBCS-Bausteine
in **einem** Visual löst:

![Screenshot](assets/screenshot.png)

## Features

- **Szenario-Notation nach IBCS**
  - **AC** (Actual): solide, dunkel
  - **PY** (Previous Year): graue Säule/Balken, versetzt hinter AC
  - **PL** (Plan/Budget): Outline (weiß gefüllt, umrandet)
  - **FC** (Forecast): schraffiert — Monate ohne AC-Wert zeigen automatisch den FC
- **Absolutes Abweichungs-Panel** (ΔPY oder ΔPL): grün/rot gefärbte Balken
- **Relatives Abweichungs-Panel** (ΔPY % / ΔPL %): Pin-Chart (Lollipop), FC-Pins hohl
- **IBCS-Baseline-Notation**: AC = solide schwarze Achse, PY = dicke graue Achse,
  PL = doppelte dünne Linie
- **PY als Dreieck** bei drei Szenarien: Sind AC, PY und PL gebunden, erscheint
  das Vorjahr als graues Dreieck am Säulen-/Balkenrand auf PY-Höhe statt als
  dritte Säule (Columns, Bars, Tabelle; abschaltbar) — IBCS-Jahreschart-Notation
- **Columns & Bars**: vertikale Säulen für Zeitreihen, horizontale Balken für
  Struktur-Vergleiche (Panels dann nebeneinander)
- **Invert-Schalter** für Kosten-KPIs (Mehrwert = schlecht = rot)
- **IBCS-Titelblock**: automatischer Titel „KPI in Einheit · Zeitraum: AC, FC vs. PL"
  plus optionale Botschafts-Zeile (SAY) — alle Teile überschreibbar
- **Waterfall / Brücke**: GuV-Wasserfall (sum/delta-Rolle), Varianz-Brücke PL→AC
  oder Beitrags-Wasserfall mit Σ-Anker — inkl. Konnektoren und FC-Schraffur
- **Waterfall bridge für Columns/Bars** (optional, Chart → Bridge): zusätzliches
  Panel neben den normalen AC/PY/PL-Vergleichsbalken, das dieselben Kategorien als
  kaskadierende Brücke von der Basis zu AC mit Verbindungslinien zeigt — Absolutwerte,
  Überleitung und Abweichungs-Panels (ΔPY/ΔPL, ΔPY %/ΔPL %) sind gleichzeitig sichtbar.
  Echte Anker-Balken markieren Start (Basis-Summe, PL-Outline oder PY-grau) und Ende
  (AC- bzw. gestrichelt AC/FC-Summe) der Brücke, ein eingekreistes Badge zeigt den
  Netto-Saldo als Überleitungs-Callout. Inkl. **Sort by impact** (größter Treiber
  zuerst, Top-N-Rest bleibt am Ende) und einem klickbaren ⇅-Button im Chart, der die
  Sortierung persistiert umschaltet
- **Gruppen-Trennlinien** (Chart → Layout → Group separator every N): dünne Linien
  quer durch alle Panels nach jeweils N Kategorien — Lesehilfe für Struktur-Vergleiche
  mit natürlichen Untergruppen (z. B. Regionen), 0 = aus
- **Tabelle (IBCS)** (eigener Chart-Modus): Kennzahlen-Tabelle mit integrierten
  Chart-Spalten — AC·PY·PL-Balken, ΔBasis-Zahl + -Balken, ΔBasis %-Pins, fette
  'sum'-Zwischensummen (GuV), Doppel-Varianz-Spalten; Grafikspalten fallen bei
  schmalen Visuals gestuft weg. **Mit Hierarchie im Category-Feld** („Alle
  erweitern"): Oberkategorien aggregiert mit ▸/▾ — Klick auf die Zeile klappt
  die Unterzeilen auf und zu
- **Pareto (Struktur)**: AC absteigend + kumulierte %-Linie, 80 %-Marke —
  braucht nur Category + AC
- **Dumbbell (Struktur)**: Basis → AC als zwei Punkte mit Verbinder in der
  Abweichungsfarbe
- **Slope · Vorher/Nachher**: Basis links, AC rechts, eine Linie je Kategorie
- **Kombi Säulen + Linie** (Feld „Line (Kombi)" füllen): zweite Kennzahl als
  Linie über den Säulen (z. B. Marge %), eigene Skala + Formatstring
- **Gestapelt** (Feld „Stack Series" füllen): Säulen/Balken stapeln sich
  automatisch nach der Serie — Legende, Segment- + Summen-Labels
- **Kachel-Zoom**: ⤢ an jeder Small-Multiples-Kachel vergrößert die Gruppe auf
  die volle Fläche (gleiche Skalen), „← Alle Gruppen" führt zurück
- **Vergleich per Klick** (optional): zwei Säulen/Balken anklicken zeigt die
  Differenz (absolut + %) als Klammer-Overlay
- **Integrierte Brücke (Zeit)** (eigener Chart-Modus): PY/PL-Totalsäule links,
  ΔBasis-Wasserfall quer über die Monate, AC·PY-Monatssäulen am Fuß, ΔBasis%-Pins
  oben, AC|FC-Trennlinie, gestapelte AC+FC-Totalsäule rechts + Netto-Callout
- **Kategorie-Brücke (Struktur)** (eigener Chart-Modus): PL/PY-Summenzeilen oben,
  je Kategorie AC·PY-Balken + Kaskaden-Brick + ΔBasis%-Pin, AC-Summenzeile und
  doppelte Überleitung (ΔBasis mit Callout + ΔZweitbasis) unten — inkl.
  "größter Treiber"-Notiz, Gruppentrennlinien, Top N + Rest, Sort by impact
- **In-Chart-Buttons** (optional, Chart → Bridge): ΔPY|ΔPL-Referenz-Umschalter
  (persistiert — Enduser wechselt die Varianz-Basis direkt im Bericht),
  ⇅ Sortierung und ▶ Aufbau-Animation für die beiden Brücken-Modi
- **Schriftgrößen-Preset** (Data labels → Size preset): Kompakt ×1 ·
  **Full HD ×1,5** (Standard für 1080p-Berichte) · Präsentation ×2 — skaliert alle
  Schriften im Visual auf einmal, Textgrößen-Regler bleiben zur Feinjustierung
- **Hervorhebung** (EMPHASIZE): Kategorien per Formatbereich markieren —
  schattiertes Band über alle Panels, fettes Label
- **Ausreißer-Kappung**: hartes Skalen-Maximum mit IBCS-Doppelstrich-Marker,
  Label zeigt den echten Wert
- **FC-Flag-Spalte** (1/0) als Alternative zur FC-Measure — kompatibel zu den
  Deneb-Templates des Chart-Builders
- **Formatbereich lokalisiert** (EN-Standard, deutsche Übersetzung)
- **Kommentar-Liste**: Kommentare erscheinen als nummerierte Fußnoten-Spalte rechts
  neben dem Chart — bleibt in PDF/PowerPoint-Exporten sichtbar (Tooltips nicht)
- **Theme-Farben**: optional Good/Bad und Neutraltöne aus dem Berichtsdesign übernehmen
- **Drilldown & Drillthrough**: Datums-/Kategorien-Hierarchien per Drill-Steuerung
  bzw. Rechtsklick → Drillthrough auf Detailseiten
- **Linien-Modus** für lange Zeitreihen: AC solide mit Punktmarkern (FC gestrichelt,
  hohle Marker), PY dünn grau, PL dünn gestrichelt — IBCS-Liniennotation
- **Kumuliert (YTD)**: Umschalter stellt alle Panels auf Year-to-Date-Sicht um
- **Referenzlinie**: Ziel-/Schwellenwert als gestrichelte Linie mit Beschriftung
- **Gleitender Durchschnitt**: Ø-N-Overlay-Linie zur Glättung von Saisonalität
- **Doppel-Varianz**: ΔPL und ΔPY gleichzeitig — bis zu fünf Panels mit je
  korrekter IBCS-Baseline-Notation
- **Auto-Message**: die Botschafts-Zeile schreibt sich selbst (Gesamtabweichung
  plus stärkster/schwächster Treiber), eigene Texte haben Vorrang
- **Live-Demo**: ohne Felder rendert das Visual ein Beispiel-Chart statt einer
  leeren Fläche
- **Small Multiples**: Grouping-Feld teilt das Chart in Kacheln pro Gruppe —
  alle mit identischer Skalierung (IBCS-Regel „gleiche Skalen")
- **Multiples-Optionen** (Gruppe „Small Multiples", nur bei gefülltem
  Multiples-Feld): **Top N Kacheln** (die übrigen Gruppen werden zu einer
  „Rest (k)"-Kachel aggregiert), **Gesamt-Kachel (Σ)** — „Σ Gesamt" als
  erste Kachel, Summe über alle Gruppen auf derselben Skala — und
  **Erste Kachel groß** (IBCS CT 13): die erste Kachel bekommt volle Höhe
  links, der Rest rückt als Raster daneben, Skala bleibt identisch
- **Varianz-Stufen am Wasserfall** (IBCS CT 12): mit PY/PL am Waterfall
  erscheinen ΔBasis-Balken und ΔBasis-%-Pins je Rechenzeile über der
  Brücke, mit korrekter Referenzachsen-Notation und Farbe nach Wirkung
- **Kommentare im Chart erfassen** (optional): Kommentar-Modus an → Klick
  auf eine Kategorie öffnet einen Editor, der Kommentar wird im Bericht
  gespeichert (✎-Marker, Tooltip, Kommentarliste, bookmark-fähig)
- **Wesentlichkeits-Schwellen** (optional): Abweichungen unter der
  absoluten und/oder %-Schwelle werden grau statt rot/grün — weniger
  Ampel-Rauschen, Fokus auf materielle Abweichungen
- **YTD-Button im Chart** (optional): Enduser schaltet die kumulierte
  Sicht per Chip oben rechts um, persistiert wie die Brücken-Buttons
- **Σ-Header**: Summe + Gesamtabweichung (absolut & %) als Kopfzeile, gut/schlecht gefärbt
- **Kompakt-Modus**: unter ~190 px Höhe klappen die Varianz-Panels automatisch zu
  farbigen Δ-Labels an den Säulenenden — funktioniert auch als kleine Dashboard-Kachel
- **Label-Ausdünnung** bei vielen Kategorien (jedes k-te Label, danach Min/Max/Erster/Letzter)
- **AC/FC-Trennlinie**: gestrichelte Linie markiert den Übergang Ist → Forecast
- **Top N + Rest** (Bars-Modus): zeigt die N größten Kategorien, Rest wird korrekt aggregiert
- **Kommentar-Marker**: Text-Measure im Feld „Comments" erzeugt nummerierte Marker
  (①②③) an den Datenpunkten, Kommentartext im Tooltip
- **Skalen-Synchronisation**: fixierbares Skalen-Maximum (Basis-Chart und Varianz-Panel),
  damit mehrere Instanzen auf einer Seite dieselbe Skala nutzen
- **Measure-Formatstrings** werden übernommen (€, %, Dezimalstellen aus dem Modell),
  Varianz-Panels bekommen automatisch passende Einheiten
- **Barrierefreiheit**: Keyboard-Navigation (Tab, Enter/Space = Auswahl),
  High-Contrast-Modus (nur Vorder-/Hintergrundfarbe, Unterscheidung über Outlines/Muster)
- Wertelabels mit Halo, kompakte Einheiten (k/M/B, auto), Hover-Feedback,
  Tooltips (AC/FC/PY/PL/ΔBasis/ΔBasis %), Cross-Filtering per Klick (Strg = Mehrfachauswahl),
  Kontextmenü (Rechtsklick), Landing Page bei leeren Feldern

## Installation in Power BI

1. Fertiges Paket: [`dist/`](dist/) (`ibcsInspiredChartDeck….pbiviz`)
2. In Power BI Desktop: **Visualisierungen → ⋯ → Visual aus Datei importieren**
   und die `.pbiviz`-Datei auswählen.
3. Felder zuordnen:

| Feld | Rolle | Pflicht |
| --- | --- | --- |
| Category | Monat/Datum oder Struktur (Land, Produkt …) | ✔ |
| Actual (AC) | Ist-Measure | ✔ (oder FC) |
| Previous Year (PY) | Vorjahres-Measure | optional |
| Plan / Budget (PL) | Plan-Measure | optional |
| Forecast (FC) | Forecast-Measure | optional |
| Line (Kombi) | zweite Kennzahl als Linie über den Säulen | optional |
| Stack Series | Grouping → gestapelte Säulen/Balken mit Legende | optional |
| Comments | Text-Measure → nummerierte Marker + Tooltip | optional |
| Small Multiples | Grouping → Kachel-Grid mit gleicher Skala | optional |
| Waterfall Type | Spalte 'sum'/'delta' → GuV-Wasserfall | optional |
| Forecast Flag | 1/0-Spalte → AC-Zeilen als Forecast (schraffiert) | optional |

**Abweichungsbasis**: Standardmäßig „Auto" — PL, wenn befüllt, sonst PY.
Im Formatbereich unter **Chart → Variance basis** umstellbar.

## Formatbereich

- **IBCS title**: an/aus, KPI-Name, Zeitraum, Botschafts-Zeile (auto wenn leer)
- **Chart**: unterteilt in die Gruppen **Layout** (Orientation Columns/Bars/Line/Waterfall,
  Variance basis, Absolute/Relative variance, Dual variance, Total-Header, Group separator
  every N), **Analysis** (Cumulative YTD, Moving average, Top N, Highlight, Invert) und
  **Bridge** (Waterfall bridge, Sort by impact — nur bei Columns/Bars sichtbar)
- **IBCS colors**: AC, PY, PL-Outline, Good/Bad
- **Data labels**: an/aus, Textgröße, Dezimalstellen, Einheiten (Auto/k/M/B)
- **Comments**: Kommentarliste rechts an/aus
- **Scale sync**: Skalen-Mindest-Maximum für Basis-Chart und Varianz-Panel
  (gleiche Werte auf mehreren Instanzen = gleiche Skalen), Ausreißer-Kappung,
  Referenzlinie mit Beschriftung
- **Category axis**: Textgröße

## Selbst bauen

```bash
cd ibcsInspiredChartDeck
npm install
npx pbiviz package        # erzeugt dist/*.pbiviz
```

Voraussetzungen: Node ≥ 18. Für den Dev-Server (`npx pbiviz start`) zusätzlich
ein Entwickler-Visual-Setup im Power-BI-Dienst
(https://learn.microsoft.com/power-bi/developer/visuals/environment-setup).

## Roadmap-Ideen

- Report-Page-Tooltips mit eigener Tooltip-Seite
- Skalenband-Indikator bei bewusst abweichenden Skalen
- Weitere Sprachen für den Formatbereich

## Lizenz

MIT — © 2026 Michael Tenner · PowerBI Kitchen (siehe [LICENSE](../LICENSE)).
Nutzung, Änderung und Weitergabe sind frei, auch kommerziell — der
Autor-/Copyright-Hinweis muss dabei erhalten bleiben.
