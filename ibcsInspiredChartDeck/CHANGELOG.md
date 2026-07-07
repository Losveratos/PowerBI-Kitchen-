# Changelog · IBCS Inspired Chart Deck

## 1.2.0.0 (2026-07-07)

**Waterfall bridge für Columns und Bars** (Chart → Bridge, optional, Standard aus):
- Zeigt die Kategorien als kaskadierende Brücke von der Basis (PY/PL) zu AC,
  mit Verbindungslinien zwischen den Bricks — statt einzelner Balken ab null.
  Funktioniert in beiden Ausrichtungen (Columns für Zeitreihen-Brücken,
  Bars für Struktur-Brücken) sowie in Small Multiples.
- **Sort by impact**: sortiert die Kategorien nach Abweichungsgröße
  (größter Treiber zuerst); eine Top-N-Rest-Zeile bleibt am Ende gepinnt.
  Auch per Klick auf den ⇅-Button oben rechts im Chart umschaltbar — der
  Klick persistiert die Formatbereich-Einstellung, bleibt also über
  Neu-Renders, Lesezeichen und Berichts-Neuladen hinweg erhalten.
- Wertelabels zeigen die Brick-eigene Delta-Änderung statt des
  kumulierten Zwischenstands; die Skala verankert sich nicht mehr
  künstlich bei null, sondern zeigt exakt die relevante Bandbreite.

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
