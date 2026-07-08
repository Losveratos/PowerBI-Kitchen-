# Changelog · IBCS Inspired Chart Deck

## 1.5.0.0 (2026-07-08)

**Tabelle (IBCS)** (neuer Chart-Modus im Orientation-Dropdown):
- Eine Zeile je Kategorie mit Wert, AC·PY·PL-Balkenzelle (gemeinsame Skala,
  Nulllinie bei negativen Werten), ΔBasis als Zahl + Balken und ΔBasis % als
  Pin — Kennzahlen-Tabelle mit integrierten Chart-Spalten im Zebra-Stil.
- 'sum'-Zeilen (Waterfall-Type-Rolle) rendern fett mit starker Trennlinie —
  GuV-Zwischensummen wie Bruttoergebnis/EBIT.
- Doppel-Varianz als zusätzliche ΔZweitbasis-Spalten, Highlight-Zeilen,
  Kommentar-Nummern, Crossfilter je Zeile, Tooltips.
- Grafikspalten fallen bei schmalen Visuals gestuft weg — die reine
  Werte-Tabelle bleibt lesbar; bei zu wenig Höhe erscheint ein Hinweis
  statt gequetschter Zeilen.

**Kachel-Zoom bei Small Multiples**:
- ⤢ oben rechts an jeder Kachel vergrößert die Gruppe auf die volle Fläche
  (mit unveränderten gemeinsamen Skalen — IBCS), „← Alle Gruppen" führt
  zurück. Funktioniert in allen Chart-Modi, transienter Zustand.

**Vergleich per Klick** (Chart → Analysis → Compare on click, Standard aus):
- Zwei Säulen/Balken anklicken zeigt die Differenz (absolut + %) als
  gestrichelte Klammer mit Δ-Label — zweiter minus erster Wert. Ein Klick
  wählt (gestrichelter Ring als Merker), Klick ins Leere setzt zurück.
  Solange der Modus aktiv ist, ersetzen die Klicks das Quer-Filtern.

## 1.4.0.0 (2026-07-07)

**Zwei neue Chart-Modi** (Orientation-Dropdown), portiert aus den
HTML-Referenz-Prototypen:
- **Integrierte Brücke (Zeit)**: PY/PL-Totalsäule links, ΔBasis-Wasserfall
  quer über die Monate mit Verbindungslinien, AC·PY-Monatssäulen am Fuß,
  ΔBasis%-Pin-Chart oben, AC|FC-Trennlinie, gestapelte AC+FC-Totalsäule
  rechts und Netto-Abweichung als eingekreistes Callout am rechten Rand.
- **Kategorie-Brücke (Struktur)**: PL- (Outline) und PY-Summenzeilen oben,
  je Kategorie AC·PY-Balken + kaskadierender ΔBasis-Brick + ΔBasis%-Pin,
  AC-Summenzeile, doppelte Überleitung unten (ΔBasis mit Callout-Badge +
  ΔZweitbasis), "größter Treiber"-Notiz an der stärksten Position,
  Gruppentrennlinien (Group separator every N), Top N + Rest und
  Sort by impact werden unterstützt.

**In-Chart-Buttons** (Chart → Bridge → In-chart buttons, Standard an,
nur in den beiden neuen Modi): ΔPY|ΔPL-Umschalter (persistiert
chart.comparisonMode — der Enduser wechselt die Varianz-Basis direkt im
Bericht), ⇅ Sortierung (Kategorie-Brücke) und ▶ Aufbau-Animation, die die
Positionen nacheinander einblendet.

**Schriftgrößen-Preset** (Data labels → Size preset): skaliert sämtliche
Schriften des Visuals auf einmal — Kompakt (×1), **Full HD (×1,5)** für
1080p-Berichte als neuer Standard-Anwendungsfall, Präsentation (×2) für
4K/Beamer. Wirkt auf Wertelabels, Kategorieachse, Panel-Titel, Σ-Header,
IBCS-Titelblock und Small-Multiples-Titel; die Textgrößen-Regler bleiben
als Feinjustierung erhalten.

## 1.3.0.0 (2026-07-07)

**Echte Anker-Balken in der Waterfall-Brücke** (Chart → Bridge), statt der bisherigen
Referenzlinien — matcht die Zebra-BI-Referenzcharts genauer:
- Die Brücke bekommt ihr eigenes Raster (Kategorien + 2 zusätzliche Slots): ein
  Anker-Balken am Anfang zeigt die Basis-Summe (PL als Outline, PY als graue Fläche —
  je nach Abweichungsbasis) mit Wertlabel, ein Anker-Balken am Ende zeigt die
  AC-Summe (bzw. schraffiert AC/FC-Summe bei vorhandenem Forecast). Beide sind über
  Verbindungslinien in die Kaskade eingebunden, genau wie die einzelnen Bricks.
- Funktioniert unverändert in beiden Ausrichtungen (Columns/Bars), mit Sort by
  impact, Top-N + Rest und Small Multiples.

**Gruppen-Trennlinien** (Chart → Layout → Group separator every N, 0 = aus):
- Zeichnet eine dünne Trennlinie quer durch alle sichtbaren Panels (Basis-Chart,
  Brücke, Abweichungs-Panels) nach jeweils N Kategorien — eine Lesehilfe für
  Struktur-Vergleiche mit natürlichen Untergruppen (z. B. Regionen bei einer
  Länder-/Bundesstaaten-Liste), wie im Referenzchart mit den US-Bundesstaaten.

## 1.2.0.0 (2026-07-07)

**Waterfall bridge für Columns und Bars** (Chart → Bridge, optional, Standard aus):
- Zusätzliches Panel neben den normalen AC/PY/PL-Vergleichsbalken (die unverändert
  bleiben): zeigt dieselben Kategorien als kaskadierende Brücke von der Basis
  (PY/PL) zu AC, mit Verbindungslinien zwischen den Bricks — Absolutwerte,
  Überleitung und Abweichungen (ΔPY/ΔPL, ΔPY %/ΔPL %) sind gleichzeitig sichtbar.
  Funktioniert in beiden Ausrichtungen (Columns für Zeitreihen-Brücken,
  Bars für Struktur-Brücken) sowie in Small Multiples (blendet sich bei zu
  wenig Platz pro Kachel automatisch aus, wie das Dual-Variance-Panel).
- **Sort by impact**: sortiert die Kategorien nach Abweichungsgröße
  (größter Treiber zuerst); eine Top-N-Rest-Zeile bleibt am Ende gepinnt.
  Auch per Klick auf den ⇅-Button oben rechts im Chart umschaltbar — der
  Klick persistiert die Formatbereich-Einstellung, bleibt also über
  Neu-Renders, Lesezeichen und Berichts-Neuladen hinweg erhalten.
- Bridge-Panel-Wertelabels zeigen die Brick-eigene Delta-Änderung; die
  Panel-Skala verankert sich nicht künstlich bei null, sondern zeigt exakt
  die relevante Bandbreite der Kaskade.
- **Referenzlinien + Überleitungs-Callout**: Im Bridge-Panel markiert eine
  gestrichelte Linie in PY-Farbe die Basis-Summe (Start der Brücke) und eine
  durchgezogene Linie in AC-Farbe die AC-Summe (Ende der Brücke). Ein
  eingekreistes Badge zeigt den Netto-Saldo der gesamten Brücke (grün/rot
  je nach Geschäftswirkung) — die Überleitung als expliziter Callout, wie
  in den Zebra-BI-Referenzcharts.

## 1.1.0.0 (2026-07-06)

Erste vollständige Version.

**Chart-Modi:** Columns (Zeit), Bars (Struktur), Line (lange Zeitreihen,
IBCS-Liniennotation), Waterfall/Brücke (GuV via sum/delta-Rolle,
Varianz-Brücke PL→AC, Beitrags-Wasserfall).

**IBCS-Bausteine:** Szenario-Notation (AC/PY/PL/FC inkl. Schraffur und
gestrichelter FC-Baseline), absolute + relative Varianz-Panels mit
Baseline-Notation je Basis, Doppel-Varianz (ΔPL + ΔPY), Titelblock mit
Auto-Message (SAY), Σ-Header, Hervorhebung, Ausreißer-Kappung,
Referenzlinie, gleitender Durchschnitt, Kumuliert (YTD), Small Multiples
mit gleicher Skala, Kommentar-Marker + export-feste Fußnotenspalte,
Top N + Rest, Label-Ausdünnung, Kompakt-Modus.

**Power-BI-Integration:** Measure-Formatstrings, Theme-Farben,
Drilldown/Drillthrough, Cross-Filtering, Kontextmenü, Tooltips +
Report-Page-Tooltips, Keyboard-Navigation, High-Contrast,
Multi-Visual-Selection, FC-Flag-Spalte (Chart-Builder-kompatibel),
Live-Demo-Landing, Formatbereich DE/EN.

**Qualität:** Render-Harness (`npm run test:render`, 16 Szenarien),
CI-Pipeline (Build + Lint + Render-Regression, Artefakte je Lauf),
Demo-Datensatz + Desktop-Testplan.
