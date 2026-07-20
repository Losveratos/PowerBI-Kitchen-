# Modus-Wahl — welcher ChartKitchen-Modus für welche Datenfrage

Abgeleitet aus IBCS EXPRESS (Chart-/Tabellen-Wahl) und auf die 13 ChartKitchen-
`orientation`-Modi gemappt. Grundregel IBCS: **Zeit → horizontale Kategorieachse
(Columns/Line); Struktur → vertikale Kategorieachse (Bars)**. Ein Wert ohne
Vergleich hat keine Botschaft — immer Szenarien (PL/PY/FC) + Abweichung zeigen.

## Entscheidungsbaum
1. **Ist die Kernaussage eine KPI-Statuslage (gegen Ziel/Vorjahr)?**
   → `cards`. Mit `benchmark` + `cardBullet` für Ziel-Monitoring.
2. **Geht es um Zeitverlauf?** (category = Monate/Perioden)
   - Wenige Perioden (≤ ~12), Szenario-Vergleich → `columns`
   - Viele Perioden (> ~12), Bestände, indexiert → `line`
   - „Wie kommen wir von PY/PL zu AC über die Zeit?" (Brücke über Zeit) → `intwaterfall`
   - Zweite Kennzahl (Marge %) über den Säulen → `columns` + `lineMeasure`
3. **Geht es um Struktur?** (category = Produkte/Regionen/Konten)
   - Rangfolge/Vergleich je Element → `bars` (absteigend sortiert)
   - 80/20-Konzentration → `pareto`
   - Vorher/Nachher je Element (2 Zustände) → `dumbbell` (Struktur) bzw. `slope` (2 Zeitpunkte)
   - Root-Cause / Beitrag zu einem Ergebnis (Umsatz→Kosten→EBIT) → `waterfall` (+`rowType` sum/delta)
   - Abweichungs-Brücke je Kategorie (was treibt ΔPL?) → `catbridge`
4. **GuV / Konten-Statement mit Ergebniszeilen und Margen?** → `pnl`
   (+`resultList`/`formulaRows`/`invertList`).
5. **Viele Kennzahlen × Perioden/Szenarien tabellarisch, druck-/boardtauglich?**
   → `table` (Matrix via `colgroup`, max. 2 Ebenen).
6. **Eine Dimension aufgeteilt, gleiche Skala je Kachel?** → beliebiger Basis-
   Modus + `multiples`-Rolle (Small Multiples, `multiplesSameScale`).

## Frage → Modus (Kurztabelle)
| Datenfrage | Modus | Achse |
|---|---|---|
| Stehen wir gegen Ziel grün/rot? | `cards` | KPI |
| Umsatz über die Monate + Varianz? | `columns` | Zeit |
| Langer Zeitverlauf / Bestand / Index? | `line` | Zeit |
| Marge % über Umsatz-Säulen? | `columns`+`lineMeasure` | Zeit |
| Brücke PY→AC über die Zeit? | `intwaterfall` | Zeit |
| Rangfolge Produkte/Regionen? | `bars` | Struktur |
| Konzentration (80/20)? | `pareto` | Struktur |
| Vorher/Nachher je Element? | `dumbbell` / `slope` | Struktur / 2 Zeitpunkte |
| Root-Cause Umsatz→EBIT? | `waterfall`+`rowType` | Struktur |
| Was treibt ΔPL je Kategorie? | `catbridge` | Struktur |
| GuV-Statement mit Margen? | `pnl` | Struktur |
| Kennzahlen × Perioden tabellarisch? | `table`(+`colgroup`) | Struktur |
| Eine Dimension, gleiche Skala je Kachel? | *Basis-Modus* + `multiples` | — |

## IBCS-Leitplanken (aus EXPRESS/CHECK)
- Kein abgeschnittener Wert-Achsen-Nullpunkt bei Columns/Bars (Nulllinie Pflicht).
- Ersetze Torten/Ringe → `bars` sortiert; Tacho/Gauge → `cards` mit `benchmark`/
  Bullet; Ampeln → echte Abweichungswerte (nicht nur Farbe).
- Gleiche Einheit auf einer Seite → gleiche Skala (`scale.fixedMax` /
  `multiplesSameScale`).
- Mehr als ~3 sich kreuzende Linien → Small Multiples statt Spaghetti.
- Szenario-Notation: AC dunkel, PY grau, PL Umriss, FC schraffiert (Visual-
  Standard; `pyTriangle` für AC+PY+PL kompakt).
