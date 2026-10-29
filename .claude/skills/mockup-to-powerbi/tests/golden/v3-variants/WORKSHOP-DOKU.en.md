# Workshop documentation · Darstellungsvarianten-Testfall

As of: <datum> · Version 0.4.1 · Spec hash `variants1` · created with MockupKitchen byDatenWG 0.4.1

| | |
|---|---|
| Participants | Vertrieb, Controlling |
| Audience | Vertriebsleitung |
| Purpose of the report | Umsatz je Region vergleichbar zeigen, Achse umschaltbar |
| Decision | Welche Region bekommt das zusaetzliche Budget? |
| Data as of / refresh | taeglich, 6 Uhr |
| Pages | Varianten |
| Semantic model | Vertrieb.SemanticModel (6 tables) |

## Design decisions

- Format 1280 × 720 px (HD).
- Header band „Vertrieb 2026" · Umsatz und Kosten je Region, style light, logo left.
- Filter as a panel on the right: Year.
- Footer „Stand: taeglich 6 Uhr · Quelle: DWH".
- Tiles rounded (4 px), flat, page background #F4F4F1, accent #C25A2D.
- Variance palette teal (petrol / red): good #1E8F9E, bad #D64541. Text colour #0F1E2E.

## Page 1 · Varianten

**Question:** Wo steht der Umsatz je Region und wie entwickelt er sich?

**Notes:** Testfall fuer Small Multiples, Feldparameter und die nativen Klassiker.

| # | Tile | Rendering | Fields | Analysis | Prio | Status | Notes |
|---|---|---|---|---|---|---|---|
| 1.1 | Umsatz je Produktlinie | Säulendiagramm (nativ) | Category / time: Category; Values: Umsatz; Small multiples by: Region | sorted by value, K, 0 dec, Small multiples by DimRegion.Region | Must | agreed | Ein Mini-Chart je Region. |
| 1.2 | Umsatz und Kosten (Achse umschaltbar) | Balkendiagramm (nativ) | Category / time: Region, Category, Segment; Series / legend: Brand; Values: Umsatz, Kosten | Axis via field parameter “Achse” (DimRegion.Region, DimProduct.Category, DimCustomer.Segment) | Should | open | Slicer auf den Parameter nicht vergessen. |
| 1.3 | Verlauf je Monat | Liniendiagramm (nativ) | Category / time: Month; Series / legend: Category; Values: Umsatz | month, Small multiples by ? | – | open | Aufteilungsfeld fehlt noch. |
| 1.4 | Anteile je Produktlinie | Donut (nativ) | Category / time: Category; AC · actual: Umsatz | – | Could | open | – |
| 1.5 | Ergebnisbruecke | Wasserfall | Category / time: Account; AC · actual: AC; Small multiples by: Region | Small multiples by DimRegion.Region | – | open | waterfallChart hat keinen Small-Multiples-Bucket. |
| 1.6 | AC/PL je Monat | Säulen + Referenz, AC/PL, ChartKitchen | Category / time: Month; AC · actual: AC; Reference (PL / PY / BU): PL; Small multiples by: Region | Small multiples by DimRegion.Region, Axis via field parameter “CK-Achse” (DimDate.Month) | – | open | ChartKitchen kann weder Small Multiples noch den Feldparameter. |

## Measure profile

| Field | Business name | Definition in the model | Unit | Target | Owner | Source | confirmed |
|---|---|---|---|---|---|---|---|
| DimProduct.Category | Produktlinie | Produktlinie | – | – | Vertrieb | DWH | ☑ |
| DimProduct.Brand | – | Marke | – | – | – | – | ☐ |
| DimRegion.Region | – | Vertriebsregion | – | – | Vertrieb | DWH | ☑ |
| DimCustomer.Segment | – | Kundensegment | – | – | – | – | ☐ |
| DimDate.Month | – | Monat | – | – | – | – | ☑ |
| DimDate.Year | – | Jahr | 0 | – | – | – | ☑ |
| DimAccount.Account | – | GuV-Position | – | – | – | – | ☐ |
| _Measures.Umsatz | – | Nettoumsatz | EUR | – | Controlling | DWH | ☑ |
| _Measures.Kosten | – | Variable Kosten | EUR | – | Controlling | DWH | ☐ |
| _Measures.AC | – | Ist-Wert | #,##0 | – | Controlling | DWH | ☑ |
| _Measures.PL | – | Plan | #,##0 | – | Controlling | DWH | ☑ |

## Open points

- [ ] Varianten / Verlauf je Monat: Aufteilungsfeld fehlt noch.
- [ ] Varianten: „Verlauf je Monat": Small Multiples aktiv, aber kein Aufteilungsfeld gebunden

## Notes

- „AC/PL je Monat": Feldparameter „CK-Achse" hat nur 1 Feld(er); mindestens zwei sind sinnvoll

## Next steps

- [ ] Confirm measure definitions (profile), create missing measures in the semantic model
- [ ] Build the pages with the `mockup-to-powerbi` skill
- [ ] Review the built pages with the participants, set status to „approved"
