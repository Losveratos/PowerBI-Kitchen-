# Workshop documentation · Management Report · Beispiel

As of: <datum> · Version 0.1 · Spec hash `4d42e99d` · created with MockupKitchen byDatenWG 0.3

| | |
|---|---|
| Participants | M. Tenner, Controlling, Vertrieb |
| Audience | GF |
| Purpose of the report | Monatliche Steuerung Umsatz und Marge |
| Decision | Maßnahmen bei Planabweichung > 5 % |
| Data as of / refresh | [to be filled in] |
| Pages | Übersicht · Detail Produktlinie |
| Semantic model | Demo-Modell (6 tables) |

## Design decisions

- Format 1280 × 720 px (HD).
- Header band „Management Report" · in T€ · YTD 2026, style light, logo right.
- Filter as a burger menu (bookmark): Year (default 2026), Region.
- Footer „Stand: <datum> · Quelle: DWH · Kontakt: Controlling".
- Tiles rounded (12 px), with a soft shadow, page background #EEF1F5, accent #C25A2D.
- Variance palette teal (petrol / red): good #1E8F9E, bad #D64541. Text colour #0F1E2E.

## Page 1 · Übersicht

**Question:** Liegen wir im Plan?

| # | Tile | Rendering | Fields | Analysis | Prio | Status | Notes |
|---|---|---|---|---|---|---|---|
| 1.1 | Umsatz | KPI-Kachel (IBCS), ChartKitchen | Measure: Kosten; Target / reference: PL | lower is better | – | open | – |
| 1.2 | Kosten | Karte (nativ) | Measure: Kosten | lower is better | – | open | – |
| 1.3 | Deckungsbeitrag | KPI-Kachel (IBCS), ChartKitchen | Target / reference: PL | – | – | open | – |
| 1.4 | Marge | KPI-Kachel (IBCS), ChartKitchen | Measure: Marge; Target / reference: PL | – | – | open | – |
| 1.5 | Δ PL je Produktlinie | Wasserfall horizontal + Varianz, AC/PL, ChartKitchen | Category / time: Category; AC · actual: AC; Reference (PL / PY / BU): PL | – | – | open | Klick auf eine Kategorie springt in die Detailseite. Offen: Sortierung nach Δ oder AC? · → Detail Produktlinie |
| 1.6 | Umsatz AC/FC vs PL je Monat (in T€) | Integrierte Varianzanalyse, AC/PL/FC, ChartKitchen | Category / time: Month; AC · actual: AC; Reference (PL / PY / BU): PL; FC flag (1/0): IsForecast | – | – | open | – |
| 1.7 | Kommentar | Textfeld | – | – | – | open | Text: Umsatz 8 % über Plan, Süd unter Plan wegen Lieferverzug. |

## Page 2 · Detail Produktlinie

**Question:** [to be filled in]

| # | Tile | Rendering | Fields | Analysis | Prio | Status | Notes |
|---|---|---|---|---|---|---|---|
| 2.1 | Detail: gewählte Produktlinie | Textfeld | – | – | – | open | Drill-through-Ziel. Titel zeigt den gefilterten Wert (SELECTEDVALUE). |
| 2.2 | Umsatz | KPI-Kachel (IBCS), ChartKitchen | Measure: Umsatz; Target / reference: PL | – | – | open | – |
| 2.3 | Marge % | KPI-Kachel (IBCS), ChartKitchen | Measure: Marge%; Target / reference: PL | – | – | open | – |
| 2.4 | Einzelpositionen | IBCS-Tabelle, AC/PL, ChartKitchen | Rows: Product; AC · actual: AC; Reference (PL / PY / BU): PL | – | – | open | – |
| 2.5 | Verlauf 24 Monate | Linie (AC vs Referenz), AC/PY, ChartKitchen | AC · actual: AC; Reference (PL / PY / BU): PY | – | – | open | – |

## Navigation and drill paths

- From „Übersicht" (mk_7rbkjp5) to „Detail Produktlinie" (drill-through (DimProduct.Category))

## Measure profile

| Field | Business name | Definition in the model | Unit | Target | Owner | Source | confirmed |
|---|---|---|---|---|---|---|---|
| _Measures.Kosten | – | [to be filled in] | #,##0 | – | – | – | ☐ |
| _Measures.PL | – | Plan | #,##0 | – | – | – | ☐ |
| _Measures.Marge | – | Umsatz − Kosten | #,##0 | – | – | – | ☐ |
| DimProduct.Category | – | Produktlinie | – | – | – | – | ☐ |
| _Measures.AC | – | Ist | #,##0 | – | – | – | ☐ |
| DimDate.Month | – | Monatsname, sortiert nach MonthKey | – | – | – | – | ☐ |
| DimDate.IsForecast | – | 1 = Forecast-Monat, 0 = Ist | – | – | – | – | ☐ |
| _Measures.Umsatz | Nettoerlös | [to be filled in] | #,##0 | – | – | – | ☑ |
| _Measures.Marge% | – | [to be filled in] | 0.0% | – | – | – | ☐ |
| DimProduct.Product | – | [to be filled in] | – | – | – | – | ☐ |
| _Measures.PY | – | Vorjahr | #,##0 | – | – | – | ☐ |
| DimDate.Year | – | [to be filled in] | – | – | – | – | ☐ |
| DimRegion.Region | – | [to be filled in] | – | – | – | – | ☐ |

## Open points

- [ ] Übersicht: Pflichtrolle „Kennzahl" leer
- [ ] Detail Produktlinie: „Detail: gewählte Produktlinie" hat keinen Text; Kachel käme leer im Bericht an
- [ ] Detail Produktlinie: Pflichtrolle „Zeit / Periode" leer

## Notes

- Seite ohne Fragestellung / Kernbotschaft

## Next steps

- [ ] Confirm measure definitions (profile), create missing measures in the semantic model
- [ ] Build the pages with the `mockup-to-powerbi` skill
- [ ] Review the built pages with the participants, set status to „approved"
