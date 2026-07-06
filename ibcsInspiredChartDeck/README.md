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
- **Columns & Bars**: vertikale Säulen für Zeitreihen, horizontale Balken für
  Struktur-Vergleiche (Panels dann nebeneinander)
- **Invert-Schalter** für Kosten-KPIs (Mehrwert = schlecht = rot)
- **Small Multiples**: Grouping-Feld teilt das Chart in Kacheln pro Gruppe —
  alle mit identischer Skalierung (IBCS-Regel „gleiche Skalen")
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
| Comments | Text-Measure → nummerierte Marker + Tooltip | optional |
| Small Multiples | Grouping → Kachel-Grid mit gleicher Skala | optional |

**Abweichungsbasis**: Standardmäßig „Auto" — PL, wenn befüllt, sonst PY.
Im Formatbereich unter **Chart → Variance basis** umstellbar.

## Formatbereich

- **Chart**: Orientation (Columns/Bars), Variance basis (Auto/PY/PL),
  Absolute/Relative variance ein-aus, Total (Σ) header, Top N (Bars),
  Invert (higher is bad)
- **IBCS colors**: AC, PY, PL-Outline, Good/Bad
- **Data labels**: an/aus, Textgröße, Dezimalstellen, Einheiten (Auto/k/M/B)
- **Scale sync**: Skalen-Mindest-Maximum für Basis-Chart und Varianz-Panel
  (gleiche Werte auf mehreren Instanzen = gleiche Skalen)
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

- Waterfall-Modus für Beitragsanalysen
- Lokalisierung (DE/EN) der Formatbereich-Labels
- Report-Page-Tooltips mit eigener Tooltip-Seite
