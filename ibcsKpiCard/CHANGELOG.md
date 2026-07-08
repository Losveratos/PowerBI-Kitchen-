# Changelog · IBCS KPI Card

## 2.1.0.0 (2026-07-08)

- **Brücken-Ausrichtung** (KPI card → Bridge orientation): die Mini-Brücke
  wahlweise vertikal (drei Säulen nebeneinander, Zeit-Optik) oder
  **horizontal** (drei Balken untereinander, Struktur-Optik) — beide
  IBCS-konform (PY grau, PL Outline, AC dunkel), beide negativ-sicher.
- **Titelgröße** (KPI card → Title size): Schriftgröße der Karten-Überschrift
  (Kategorie/Titel) separat einstellbar (8–40) — behebt zu kleine
  Kachel-Titel bei Full HD mit vielen Kacheln; wirkt zusätzlich zum
  Größen-Preset.

## 2.0.0.0 (2026-07-08)

Kompletter Neubau des v1.1-Prototyps als Quellcode-Projekt im Repo
(gleiche GUID — Import ersetzt die alte Karte). Schwerpunkte Lesbarkeit
und Flexibilität:

**Lesbarkeit**
- Zahlen folgen jetzt dem Measure-Formatstring und dem Berichts-Locale
  (v1: hartes en-US `toLocaleString`), Auto-Einheiten k/M/B nach
  Größenordnung — aus „1,245,000" wird „1,2 M€"; Dezimalstellen einstellbar.
- Schriftgrößen-Preset Kompakt ×1 / **Full HD ×1,5** / Präsentation ×2,
  zusätzlich zur automatischen Skalierung der Einzelkarte mit der
  Visual-Größe (Obergrenze angehoben).
- Tabellenziffern (tabular-nums) für ruhige Wertespalten, Ellipsis statt
  Überlauf bei langen Kategorienamen.

**Flexibilität**
- Neues PL-Feld (Plan/Budget) + **Variance basis Auto/PY/PL**: Pill,
  Akzentleiste und Mini-Brücke rechnen gegen PL wenn vorhanden, sonst PY.
- Zweite Referenzzeile mit der jeweils anderen Basis (abschaltbar).
- **Invert** für Kosten-KPIs (Mehrwert = schlecht = rot).
- Mini-Brücke abschaltbar; PL erscheint IBCS-konform als Outline-Säule.
- Mindest-Kachelbreite einstellbar (Spaltenzahl des Rasters).

**Robustheit & Integration**
- Mini-Brücke negativ-sicher (skaliert über Beträge — Ergebnis-KPIs unter
  null zeichnen korrekt).
- Native Tooltips (AC/PY/PL/ΔBasis absolut + %).
- High-Contrast-Modus, Keyboard-Navigation (Tab + Enter/Space),
  Kontextmenü, Multi-Select per Strg.
- Render-Harness (`npm run test:render`, 7 Szenarien) + ESLint.

## 1.1.0.0

Prototyp (nur als kompilierte .pbiviz): AC vs. PY, Mini-Brücke PY→Δ→AC,
Einzelkarte/Kachel-Raster, Crossfilter, Good/Bad-Farben, Titel + Zeitraum.
