# Workshop documentation · Typografie- und Filter-Testfall

As of: <datum> · Version 0.4.4 · Spec hash `typofilter1` · created with MockupKitchen byDatenWG 0.4.4

| | |
|---|---|
| Participants | Controlling, Vertrieb |
| Audience | Geschäftsführung |
| Purpose of the report | Umsatz und Kosten je Region auf Full HD |
| Decision | Wo wird nachgesteuert? |
| Data as of / refresh | monatlich |
| Pages | Übersicht · Detail |
| Semantic model | Demo-Modell (3 tables) |

## Design decisions

- Format 1920 × 1080 px (Full HD).
- Header band „Vertrieb 2026" · Umsatz und Kosten je Region, style dark, logo left.
- Filter as a panel on the right: Year (dropdown, default 2026), Region (tiles), Date (date range); heading „Auswahl", note „Alle Werte in Tsd. EUR. Stand: Vormonat.".
- Footer „Quelle: DWH · Stand Vormonat".
- Tiles rounded (6 px), with a hairline border, page background #F4F4F1, accent #C25A2D.
- Variance palette teal (petrol / red): good #1E8F9E, bad #D64541. Text colour #0F1E2E.
- Typography: basis 1280px, scale ×1.1: tile title 21.45 px (16 pt), subtitle 16.5 px (12.5 pt), chart labels 14.85 px (11 pt) at a page width of 1920 px; own scale: Umsatz je Region ×1.3, AC vs. PL je Monat ×0.85.
- Page navigation in the footer (right-aligned): Übersicht · Detail.

## Page 1 · Übersicht

**Question:** Wo stehen Umsatz und Kosten je Region?

| # | Tile | Rendering | Fields | Analysis | Prio | Status | Notes |
|---|---|---|---|---|---|---|---|
| 1.1 | Umsatz (Tsd. EUR) | Karte (nativ) | Measure: Umsatz | – | – | open | – |
| 1.2 | Umsatz je Region (Ist, Tsd. EUR) | Säulendiagramm (nativ) | Category / time: Region; AC · actual: Umsatz | – | – | open | Größere Schrift: Hauptkachel der Seite. |
| 1.3 | Hinweis | Text | – | – | – | open | Text: Die Regionen sind nach Umsatz sortiert. |
| 1.4 | Kosten je Region | Balkendiagramm (nativ) | Category / time: Region; AC · actual: Kosten | lower is better | – | open | – |

## Page 2 · Detail

**Question:** Wie läuft AC gegen Plan im Jahresverlauf?

| # | Tile | Rendering | Fields | Analysis | Prio | Status | Notes |
|---|---|---|---|---|---|---|---|
| 2.1 | AC vs. PL je Monat | Säulen (IBCS), AC/PL, ChartKitchen | Category / time: Month; AC · actual: AC; Reference (PL / PY / BU): PL | – | – | open | – |
| 2.2 | Regionen im Detail | Matrix (nativ) | Rows: Region; Values: AC, PL | – | – | open | – |

## Measure profile

| Field | Business name | Definition in the model | Unit | Target | Owner | Source | confirmed |
|---|---|---|---|---|---|---|---|
| _Measures.Umsatz | Nettoerlös | Nettoumsatz | EUR | – | Controlling | ERP | ☑ |
| _Measures.Kosten | – | [to be filled in] | #,##0 | – | – | – | ☐ |
| _Measures.AC | – | Ist | #,##0 | – | – | – | ☐ |
| _Measures.PL | – | Plan | #,##0 | – | – | – | ☐ |
| DimRegion.Region | – | [to be filled in] | – | – | – | – | ☐ |
| DimDate.Month | – | [to be filled in] | – | – | – | – | ☐ |
| DimDate.Year | – | [to be filled in] | – | – | – | – | ☐ |
| DimDate.Date | – | [to be filled in] | – | – | – | – | ☐ |

## Accessibility

Findings of the accessibility check in the mockup tool. **1 error is a blocker:** fix them before the build or accept them explicitly (with a reason).

- [ ] **blocker** · `A11Y_TILE_SMALL` (error) · Übersicht · mk_kpi1: Kachel „Umsatz" ist zu klein (516×180px) (Unter ca. 540×200px ist ein Diagramm praktisch nicht mehr nutzbar. Kachel vergrößern.)
- [ ] `A11Y_CONTRAST_ACCENT` (warning): Akzentfarbe gegen Kachelgrund zu schwach (2.8:1, Ziel ≥ 3:1) (Die Akzentfarbe kennzeichnet aktive Nav-Buttons und Hervorhebungen — bei zu wenig Kontrast wirken diese unauffällig.)

## Open points

- [ ] no open points recorded

## Notes

- Beispiel-Hinweis ohne Bezug zur Barrierefreiheit.

## Next steps

- [ ] Confirm measure definitions (profile), create missing measures in the semantic model
- [ ] Build the pages with the `mockup-to-powerbi` skill
- [ ] Review the built pages with the participants, set status to „approved"
