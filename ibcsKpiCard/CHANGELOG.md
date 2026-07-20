# Changelog · IBCS KPI Card

## 2.3.0.0 (2026-07-08)

- **Ziel-Marker in der Brücke**: die jeweils andere Referenz (PL bei Basis PY,
  PY bei Basis PL) erscheint als schwarzer Strich quer über der AC-Säule
  bzw. dem AC-Balken — „über Vorjahr, aber unter Plan?" auf einen Blick.
  Die Brücken-Skala bezieht den Marker mit ein, er bleibt immer sichtbar.
- **In-Chart-Buttons** (KPI card → In-chart buttons, Standard an): oben
  rechts ein ΔPY|ΔPL-Umschalter (nur wenn beide Basen gefüllt) und ein
  ⇅-Button, der die Kachel-Sortierung zwischen Original und Δ absolut
  umschaltet. Beide persistieren die Formatbereich-Einstellung — die Wahl
  des Endusers überlebt Reload und Lesezeichen. Die Leiste ist sticky und
  scrollt nicht mit dem Raster weg.
- **Auto-Zeitraum**: ist das Zeitraum-Label leer und das Trend-Feld gefüllt,
  wird es automatisch aus erster–letzter Periode gebaut („Jan 26 – Apr 26").

## 2.2.0.0 (2026-07-08)

- **Sparkline** (neues Trend-Feld, z. B. Monat): jede Karte zeigt einen
  Mini-Trend — AC solide, FC-Perioden gestrichelt mit hohlem Endpunkt,
  PY dünn grau, Nulllinie bei Vorzeichenwechsel; Endpunkt-Marker in der
  Abweichungsfarbe. Kennzahlen werden über die Perioden summiert.
  Abschaltbar (KPI card → Sparkline). Bei genug Platz erscheinen
  Sparkline und Brücke nebeneinander, sonst hat die Sparkline Vorrang.
- **Forecast-Feld (FC)**: füllt fehlende AC-Perioden (AC+FC) — der
  FC-Anteil erscheint schraffiert in der Brücke (vertikal wie horizontal),
  gestrichelt in der Sparkline und als eigene Tooltip-Zeile.
- **Kacheln sortieren** (KPI card → Sort tiles): Original, Δ absolut,
  Δ % oder Größe (AC) — größte Treiber zuerst.
- **Neutralzone ± %** (KPI card → Neutral zone, 0 = aus): Ampel-Logik —
  Abweichungen innerhalb der Toleranz bleiben grau (Pill mit ●,
  Akzentleiste und Δ-Werte neutral) statt grün/rot.
- **Kompakt-Stufen**: schmale Kacheln lassen Brücke/Sparkline automatisch
  weg (< 340 Einheiten), sehr schmale zusätzlich die Referenzzeilen und
  das Zeitraum-Label (< 210) — keine gequetschten Karten mehr.
- **Bugfix**: der Konstruktor überschrieb sämtliche Inline-Styles des
  Host-Elements (`style.cssText`) — dadurch konnte die tatsächliche
  Breite von der Viewport-Breite abweichen und das Raster falsch
  umbrechen. Styles werden jetzt additiv gesetzt.

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
