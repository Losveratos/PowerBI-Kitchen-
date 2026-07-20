# ChartKitchen — Feld-Vertrag (Datenrollen + chart.*-Properties)

Verifiziert aus `ibcsInspiredChartDeck/capabilities.json` (dataRoles + objects)
und `ibcsInspiredChartDeck/src/settings.ts` (Property-Namen, Enum-Werte,
Defaults). **Nur diese Namen/Werte verwenden** — nichts erfinden. Bei Zweifel in
die Quelldateien schauen, sie sind die maßgebliche Wahrheit.

Visual-GUID: `chartKitchenByDatenWGD9DE0F7AD44D41058672C6FBF6F5A18D`.

## Inhalt
- Datenrollen (Feld-Buckets)
- Wichtige `chart.*`-Properties (Modus + zentrale Einstellungen)
- Andere Format-Karten (Kurzüberblick)
- Kombinations-/Belegungsregeln

## Datenrollen (dataRoles)
Aus `capabilities.json`. Spalte „kind": Grouping = Feld/Dimension,
Measure = Kennzahl. „max": aus `dataViewMappings.conditions` (alle max 1 außer
`colgroup` max 2).

| name | Anzeige | kind | max | Zweck |
|---|---|---|---|---|
| `category` | Category | Grouping | 1 | Zeitachse (Monate) **oder** Struktur (Länder, Produkte). Drilldown-fähig. |
| `actual` | Actual (AC) | Measure | 1 | Ist-Wert. numeric/integer. |
| `previousYear` | Previous Year (PY) | Measure | 1 | Vorjahreswert. numeric/integer. |
| `plan` | Plan / Budget (PL) | Measure | 1 | Plan-/Budgetwert. numeric/integer. |
| `forecast` | Forecast (FC) | Measure | 1 | Forecast (schraffiert dargestellt). numeric/integer. |
| `benchmark` | Benchmark (BM) | Measure | 1 | Vergleichswert je Kategorie (Ziel/Markt) — Querstrich-Marker. numeric/integer. |
| `prevForecast` | FC Vormonat (Revision) | Measure | 1 | Forecast des Vorzyklus — als Abweichungsbasis (FC-Revision). numeric/integer. |
| `lineMeasure` | Line (Kombi) | Measure | 1 | Zweite Kennzahl als Linie über Säulen (z. B. Marge %), eigene Skala rechts. **Nur Columns.** |
| `series` | Stack Series | Grouping | 1 | Säulen/Balken stapeln nach dieser Serie (Legende + Summen-Label). |
| `colgroup` | Spalten (Matrix) | Grouping | 2 | **Nur Tabelle:** pivotiert Werte in Spaltengruppen (Quartal→Monat, max. 2 Ebenen). |
| `filterInfo` | Filter-Info (Fußzeile) | Measure (text) | 1 | Text-Measure mit Filterkontext (CONCATENATEX/SELECTEDVALUE) → zweite Fußzeile, wenn `ibcsTitle.filterFooter` an. |
| `comments` | Comments | Measure (text) | 1 | Text-Measure: Kategorien mit Kommentar bekommen nummerierten Marker, Text im Tooltip. |
| `multiples` | Small Multiples | Grouping | 1 | Teilt das Chart in Kacheln pro Gruppe, identische Skala (IBCS). |
| `rowType` | Waterfall Type (sum/delta) | Grouping | 1 | **Nur Waterfall:** `sum` = Zwischensumme, `delta` = Bewegung (GuV-Wasserfall). |
| `fcFlag` | Forecast Flag (1/0) | Grouping | 1 | Alternative zur FC-Measure: **Zahl 1/0** — Zeilen mit 1 = Forecast (schraffiert), AC läuft durch. |

**Value-Bindings** (categorical.values): actual, previousYear, plan, forecast,
prevForecast, benchmark, lineMeasure, comments, filterInfo.
**Category-Selects** (categorical.categories): category, multiples, series,
rowType, fcFlag, colgroup.

## chart.* — Modus + zentrale Properties
Aus dem Objekt `chart` in `capabilities.json`, Defaults/Beschreibung aus
`settings.ts`. Property-`name` ist der Schlüssel im PBIR-`objects.chart`.

### `orientation` (der Modus — 12 Werte / 13 „Modi" inkl. Matrix-Variante der Tabelle)
| value | Modus | Achse |
|---|---|---|
| `columns` | Columns (Zeit) | Zeit |
| `bars` | Bars (Struktur) | Struktur |
| `line` | Line (Zeit, viele Punkte) | Zeit |
| `waterfall` | Waterfall / Brücke | Struktur (braucht `rowType`) |
| `intwaterfall` | Integrierte Brücke (Zeit) | Zeit |
| `catbridge` | Kategorie-Brücke (Struktur) | Struktur |
| `table` | Tabelle (IBCS) | Struktur (Matrix via `colgroup`) |
| `pareto` | Pareto (Struktur) | Struktur |
| `dumbbell` | Dumbbell (Struktur) | Struktur |
| `slope` | Slope · Vorher/Nachher | 2 Zeitpunkte |
| `cards` | KPI-Karten (Kacheln) | KPI je Kategorie |
| `pnl` | GuV-Statement (IBCS) | Struktur (Konten) |

### Layout / Analyse (modusübergreifend)
| Property | Typ / Werte | Default | Zweck |
|---|---|---|---|
| `comparisonMode` | `auto`·`py`·`plan`·`fcrev` | auto | Abweichungsbasis. Auto = PL wenn vorhanden, sonst PY. |
| `showAbsoluteVariance` | bool | true | ΔAC-Panel. |
| `showRelativeVariance` | bool | true | ΔAC-%-Panel. |
| `dualVariance` | bool | false | ΔPL + ΔPY gleichzeitig (braucht PY+PL). |
| `pyTriangle` | bool | true | Bei AC+PY+PL: PY als graues Dreieck statt dritter Säule. |
| `showTotal` | bool | true | Σ-Kopfzeile mit Gesamtabweichung. |
| `invert` | bool | false | Kosten-KPI: mehr = schlecht (rot). |
| `invertList` | text | "" | Kommagetrennte Kategorien mit umgekehrter Wertung. |
| `cumulative` | bool | false | Kumulierte (YTD) Sicht. |
| `cumulativeKind` | `ytd`·`qtd`·`r12` | ytd | Art der Kumulation. |
| `fiscalStart` | numeric 1–12 | 1 | Fiskaljahres-Startmonat für YTD/QTD. |
| `topN` | numeric 0–50 | 0 | Struktur-Modi: N größte Kategorien, Rest aggregiert. 0 = alle. |
| `movingAverage` | numeric 0–24 | 0 | Gleitender Durchschnitt als Overlay (Columns/Line). |
| `materialityAbs` | numeric ≥0 | 0 | Abweichungen unter Betrag grau. |
| `materialityPct` | numeric 0–100 | 0 | Abweichungen unter % grau. |
| `highlight` | text | "" | Kommagetrennte hervorgehobene Kategorien (EMPHASIZE). |
| `groupEvery` | numeric 0–50 | 0 | Trennlinie nach je N Kategorien. |
| `deltaIcons` | bool | false | ▲▼● Trend-Icons in Tabelle/Karten. |
| `pinStyle` | `auto`·`round`·`square` | auto | Form des Δ%-Pin-Kopfes. |

### Small Multiples (`multiples`-Rolle belegt)
`multiplesTotal` (bool, Σ-Kachel), `multiplesTopN` (0–24), `multiplesHero`
(bool, erste Kachel groß), `multiplesSameScale` (bool, auch Brücken gleich
skalieren). Säulen/Balken/Waterfall teilen die Skala immer.

### Bridge (Waterfall/Brücken)
`waterfallStyle` (bool, Columns/Bars als Brücke), `sortByImpact` (bool),
`chartButtons` (bool, In-Chart-Umschalter ΔPY/ΔPL/⇅/▶, default true),
`driverNote` (bool, Treiber-Notiz).

### Tabelle / GuV (`table`, `pnl`)
`valueColumns` (`ac`·`basis`·`all`), `matrixCompare` (`none`·`prevcol`),
`totalRowPosition` (`bottom`·`top`), `rowDensity` (`compact`·`normal`·`airy`),
`gridLines` (`horizontal`·`none`·`both`), `cellLayout` (`columns`·`stacked`),
`zebraStripes` (bool). Struktur-Listen (kommagetrennt): `resultList`,
`skipList`, `hideList`, `chartList`, `indentList`. `rowFormats` (Zeilen-Format),
`formulaRows` (berechnete Zeilen, z. B. `Marge = EBIT / Umsatz`),
`structureEdit` (bool, Klick-Editor). Persistierte Struktur:
`tableExpanded`, `tableColExpanded`, `tableSort`, `tableColWidths`,
`tableNameWidth`, `pnlView`.

### KPI-Karten (`cards`)
`cardStatusBasis` (`basis`·`benchmark`), `cardHighlight` (`both`·`bad`·`good`),
`cardSort` (`none`·`deviation`·`worst`·`best`), `cardBars` (bool, Mini-Brücke),
`cardTint` (bool), `cardTintStrength` (numeric 4–40), `cardBullet` (bool, braucht
`benchmark`), `cardBulletZoom` (bool), `cardSortSel` (text).

### Buttons-in-Chart
`chartButtons`, `cumulativeButton` (bool, YTD-Button), `compareClick` (bool,
zwei Säulen klicken = Differenz).

## Andere Format-Karten (Kurzüberblick)
- **`ibcsTitle`**: `show`, `kpi`, `period`, `message`, `autoMessage`, `footer`,
  `filterFooter`. Der standardisierte IBCS-Titel (KPI · Einheit · Zeitraum ·
  Botschaft) + Fußzeilen. `filterFooter` nutzt die `filterInfo`-Rolle.
- **`colors`**: `useTheme` (bool), `actualColor` (#404040), `previousYearColor`
  (#B3B3B3), `planColor` (#404040), `goodColor` (#1E8F9E DatenWG-Teal),
  `badColor` (#D64541). Fills als `{ solid: { color } }`.
- **`labels`**: `show`, `labelDensity` (`auto`·`all`·`ends`), `fontPreset`
  (`compact`·`fullhd`·`presentation`), `fontScale` (50–300), `fontSize` (6–24),
  `decimals` (0–3), `displayUnits` (`auto`·`none`·`k`·`m`·`b`), `financeFormat`
  (Klammern für negativ), `sumSafeRounding`.
- **`commentsPanel`**: `showPanel`, `commentFontSize` (8–24), `editComments`,
  `userComments` (text, persistiert).
- **`scale`**: `fixedMax`, `fixedVarMax`, `capOverflow`, `refLine`,
  `refLineLabel`. Für gleiche Skalen über mehrere Visuals (IBCS CH 4.1).
- **`categoryAxis`**: `fontSize` (6–24).

## Kombinations-/Belegungsregeln
- **Ein Berichtsjahr filtern**, sonst summieren AC/PY/PL/FC über Jahre.
- `fcFlag` ist **Zahl 1/0**, nicht Boolean. Alternative zur `forecast`-Measure.
- `rowType` nur mit `orientation=waterfall`. Für GuV eher `pnl` + `resultList`/
  `rowType`.
- `colgroup` nur mit `orientation=table` (max. 2 Ebenen).
- `lineMeasure` nur mit `orientation=columns`.
- `cardBullet`/`cardStatusBasis=benchmark` brauchen die `benchmark`-Rolle.
- `filterFooter` (ibcsTitle) zeigt nur dann Kontext, wenn `filterInfo` gebunden
  ist (Report-Filter sind Custom Visuals per API nicht sichtbar).
- Gleiche Einheit auf einer Seite → gleiche Skala (`scale.fixedMax` /
  `multiplesSameScale`).
