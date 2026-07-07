# Changelog · IBCS Inspired Chart Deck

## 1.4.0.0 (2026-07-07)

**Total rows** (Chart → Bridge → Total rows, nur bei Waterfall bridge, Standard aus):
- PL und PY erscheinen als eigene Summen-Balken am Anfang der Kategorienliste (PL als
  Outline, PY als graue Fläche), AC (bzw. schraffiert AC/FC) als Summen-Balken am
  Ende — statt der bisherigen Hintergrund-/Outline-Bars je Kategorie. Jede Kategorie
  zeigt dann nur noch ihren eigenen AC-Wert als einzelnen Balken, auf derselben Skala
  wie die drei Summen-Anker (IBCS same-scale-Regel).
- Funktioniert in Columns und Bars, inkl. AC/FC-Trennlinie, Gruppentrennlinien und
  Sort by impact. Matcht die "IBCS Kategorie-Brücke"-Referenzvisuals mit expliziten
  Total-Zeilen.

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
