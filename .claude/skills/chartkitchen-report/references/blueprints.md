# Die drei Report-Blaupausen

Jede Blaupause ordnet sich in **Shneidermans Mantra** ein: *Overview first →
Zoom & Filter → Details on demand*. Modi/Felder beziehen sich auf den Feld-
Vertrag (`field-contract.md`); Modus-Wahl je Datenfrage in `mode-selection.md`.

Die 7 Antworten der Eingangs-Befragung **dehnen/stauchen** die Blaupause:
- **Seitenzahl** → Seiten hinzufügen/zusammenlegen (optionale Seiten zuerst).
- **Detailtiefe (1–4)** → Hierarchie-Ebenen der Tabellen, ob eine Detail-/
  Drill-through-Seite existiert, wie tief `category`/`colgroup` gehen.
- **Navigation/Buttons/Filter/Logo** = das „Chrome": native Reiter vs. Custom-
  Leiste, welche Buttons/Bookmarks, Slicer-Position, Kopfband. Das ChartKitchen-
  Visual liefert Inhalt; das Chrome baut der Mensch mit Power-BI-Bordmitteln
  (Buttons, Bookmarks, Slicer, Bilder) — der Plan beschreibt es, Desktop setzt es.

---

## A · Monitoring (Ampel-Cockpit)
**1–2 Seiten, Overview-first. Detailtiefe 1–2. Native Nav. Filter: Zeitraum.**

Frage: „Wo stehen wir gegen Ziel/Schwelle — grün/rot?"

| Seite | Modus (orientation) | Kern-Felder | Zweck |
|---|---|---|---|
| S1 Cockpit | `cards` (+ Small Multiples: `columns`/`bars` mit `multiples`) | `actual`, `benchmark` (+`previousYear`), `category`=KPIs, `multiples`=Bereich | KPI-Karten mit Benchmark-Ampel/Bullet + Small Multiples je Bereich, Same-Scale. |
| S2 Trend (opt.) | `columns` oder `line` mit Varianz | `actual`, `previousYear`/`plan`, `category`=Zeit | Verlauf mit Abweichung. |

Karten-Settings: `cardStatusBasis=benchmark`, `cardBullet=true` (braucht
`benchmark`), `cardHighlight` je Fokus (`bad` für Problem-Monitoring),
`cardTint=true` für Monitor-Wände. Small Multiples: `multiplesSameScale=true`.
Shneiderman: **Overview** dominiert; Zoom/Details minimal.

---

## B · Monatsreport (Management-Report)
**4–6 Seiten, klassisch IBCS. Detailtiefe 3–4. Custom-Nav-Leiste + Logo-Kopfband
+ Bookmarks (AC↔FC). Felder: AC/PY/PL/FC, `rowType`, `comments`, `colgroup`,
`benchmark`.**

Frage: „Wie war der Monat — Summary, Abweichungen, Regionen, GuV?"

| Seite | Modus | Kern-Felder | Zweck |
|---|---|---|---|
| S1 Summary | `cards` + `columns` (Varianz) | AC/PL/PY, `category`=Zeit/KPIs, `comments` | KPI-Karten + Titel-Botschaft (`ibcsTitle.message`) + Umsatz-Säulen mit Varianz + Kommentare. |
| S2 Abweichung | `waterfall` (`rowType`) oder `catbridge`; `intwaterfall` für Zeit | AC vs. PL/PY, `rowType`=sum/delta, `category`=Treiber | Wasserfall/Kategorie-Brücke; integrierte Brücke über Zeit. |
| S3 Regionen | `table` (`colgroup`) **oder** `bars`/`columns` mit `multiples` | AC/PL/PY, `category`=Region, `colgroup`=Zeit/Szenario | Matrix mit Spaltengruppen ODER Small Multiples je Region. |
| S4 GuV | `pnl` | `category`=Konten, AC/PL/PY, `resultList`, `formulaRows`, `invertList` | GuV-Statement Ist/Plan/Vorjahr, Ergebniszeilen + Margen. |
| S5 Detail (opt.) | `table` | Hierarchie in `category`, `comments` | Detailtabelle mit Kommentar-Markern (Detailtiefe 4). |

Szenario-Umschalter AC↔FC über **Bookmarks** + Button; `comparisonMode`
entsprechend. Kopfband mit Titel+Zeitraum via `ibcsTitle` (`kpi`/`period`) plus
Logo als Bild. Shneiderman: **Overview** (S1) → **Zoom/Filter** (S2/S3) →
**Details** (S4/S5).

---

## C · Sales-Analyse (exploratives Dashboard)
**3–4 Seiten, zoom&filter-lastig. Detailtiefe 3 explorativ. Viel Cross-Filter +
Drill-through. Kopf-Slicer-Leiste + Filter-Reset. Felder: AC/PY/PL,
`category`=Produkt/Region/Kunde, `colgroup`, `topN`, `benchmark`.**

Frage: „Wo wächst/schrumpft der Umsatz — nach Produkt, Region, Kunde, Zeit?"

| Seite | Modus | Kern-Felder | Zweck |
|---|---|---|---|
| S1 Overview | `cards` + `bars`/`columns` mit `multiples` | AC/PY, `category`=KPIs, `multiples`=Region | KPI-Karten + Small Multiples je Region + Slicer-Leiste. |
| S2 Struktur | `pareto` + `bars` (Varianz) + `dumbbell` | AC/PY/PL, `category`=Produkt/Kunde, `topN` | Pareto (80/20) + Balken mit Varianz + Dumbbell (Vorher/Nachher). |
| S3 Trend | `columns`/`line` (Varianz) + `intwaterfall` + `slope` | AC/PY, `category`=Zeit | Verlauf mit Varianz + integrierte Brücke + Slope. |
| S4 Drill-through | `table` (`colgroup`) | `category`=Kunde, `colgroup`=Produkt×Zeit, `topN` + Suche | Matrix Kunde×Produkt×Zeit + Top-N-Tabelle. |

Cross-Filter über native Interaktionen; Drill-through-Seite S4 als Ziel.
`topN` überall zur Fokussierung; Filter-Reset-Button via Bookmark auf
Ausgangszustand. Shneiderman: **Overview** (S1) → **Zoom/Filter** (S2/S3, viel
Slicer/Cross-Filter) → **Details on demand** (S4 Drill-through).

---

## Chrome-Bausteine (Power-BI-Bordmittel, vom Menschen gebaut)
- **Native Nav:** Report-Reiter (Seiten), Drill-through-Seiten, Bookmarks.
- **Custom-Leiste:** Buttons + Bookmarks + Page-Navigator (Home/Zurück/
  Filter-Reset/Szenario/Zeitraum).
- **Buttons:** Home & Zurück = Bookmark/Page-Navigation; Filter-Reset = Bookmark
  auf Default-Slicer; Szenario AC/FC = Bookmark-Paar (+ `comparisonMode`);
  Zeitraum Monat/YTD = Bookmark (+ `cumulative`/`cumulativeButton` am Visual).
- **Filter:** Slicer für Zeit/Region/Produkt/Kunde; Position lt. Frage 6.
- **Logo/Kopfband:** Bild + `ibcsTitle` (`kpi`/`period`/`footer`), `filterFooter`
  mit `filterInfo`-Measure für den Filterkontext.
