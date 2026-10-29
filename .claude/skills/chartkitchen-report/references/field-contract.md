# ChartKitchen — Feld-Vertrag (Datenrollen + chart.*-Properties)

Verifiziert aus `ibcsInspiredChartDeck/capabilities.json` (dataRoles + objects)
und `ibcsInspiredChartDeck/src/settings.ts` (Property-Namen, Enum-Werte,
Defaults). **Nur diese Namen/Werte verwenden** — nichts erfinden. Bei Zweifel in
die Quelldateien schauen, sie sind die maßgebliche Wahrheit.

Visual-GUID: `chartKitchenByDatenWGD9DE0F7AD44D41058672C6FBF6F5A18D`.

## Inhalt
- Datenrollen (Feld-Buckets)
- rowType-Token (ab 1.53)
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
| `trend` | Trend (Zeit) | Grouping | 1 | **Nur KPI-Karten (ab 1.47):** Zeitfeld macht jede Karte zur Zeitreihe (Mini-Chart `cardTrendChart` Sparkline/Säulen, Kartenwert `cardTrendValue` Letzter/Summe). Andere Modi aggregieren die Trend-Zeilen weg. |
| `xValue` | X-Achse (Scatter) | Measure | 1 | **Nur Scatter (ab 1.47):** X-Koordinate; Y = `actual`. numeric/integer. |
| `bubbleSize` | Blasengröße | Measure | 1 | **Nur Scatter (ab 1.47):** optionale Blasengröße, Fläche proportional. numeric/integer. |
| `filterInfo` | Filter-Info (Fußzeile) | Measure (text) | 1 | Text-Measure mit Filterkontext (CONCATENATEX/SELECTEDVALUE) → zweite Fußzeile, wenn `ibcsTitle.filterFooter` an. |
| `comments` | Comments | Measure (text) | 1 | Text-Measure: Kategorien mit Kommentar bekommen nummerierten Marker, Text im Tooltip. |
| `multiples` | Small Multiples | Grouping | 1 | Teilt das Chart in Kacheln pro Gruppe, identische Skala (IBCS). |
| `rowType` | Waterfall-Typ (Pane) = Zeilentyp | Grouping | 1 | **Datenvertrag der Zeilenstruktur (ab 1.53):** Token je Zeile aus der Kontendimension, siehe „rowType-Token“ unten. Wirkt in Waterfall, GuV-Statement (`pnl`), Tabelle und Struktur-Modi; Altwerte `sum` (Zwischensumme), `delta` (Bewegung), `pct` (Marge) unverändert gültig. |
| `fcFlag` | Forecast Flag (1/0) | Grouping | 1 | Alternative zur FC-Measure: **Zahl 1/0** — Zeilen mit 1 = Forecast (schraffiert), AC läuft durch. |

**Value-Bindings** (categorical.values): actual, previousYear, plan, forecast,
prevForecast, benchmark, lineMeasure, comments, filterInfo.
**Category-Selects** (categorical.categories): category, multiples, series,
rowType, fcFlag, colgroup.

### rowType-Token (ab ChartKitchen 1.53)
Die Rolle `rowType` ist der **Datenvertrag** für die Zeilenstruktur; die
Komma-Listen (`resultList`, `skipList`, `hideList`, `indentList`, `invertList`,
`highlight`, `chartList`) sind nur **Override/Fallback** (siehe unten). Eine
Zelle trägt ein oder mehrere Token, getrennt durch Komma, Semikolon, Leerzeichen
oder `|`, Groß-/Kleinschreibung egal (`total; graphic`, `davon | exclude`).

| Token (kanonisch) | Wichtigste Aliasse | Wirkung (= entsprechende Liste) | Art |
|---|---|---|---|
| `total` | `sum…`, `subtotal`, `summe`, `ergebnis`, `zwischensumme`, `result`, `formula`, `formel` | Ergebniszeile (`resultList`): fett, Trennlinie, Anker, nicht im Σ | Struktur |
| `pct` | `pct…`, `percent`, `prozent`, `margin`, `marge`, `kpi`, `ratio`, `quote`, `kennzahl` | Margenzeile: %-Anzeige, Δ in Pp | Struktur |
| `detail` | `normal`, `delta`, `account`, `konto`, `separator`, leer | normale Bewegungszeile | Struktur |
| `exclude` | `memo`, `nachrichtlich`, `ausnehmen` | nicht in Σ/Skalen/Kaskade (`skipList`) | Flag |
| `hide` | `ausblenden`, `versteckt` | ausgeblendet, Σ rechnet weiter (`hideList`) | Flag |
| `davon` | `of-which`, `thereof` | eingerückt, dezent (`indentList`) | Flag |
| `invert` | `invertieren`, `kosten`, `cost` | Wertung umgekehrt (`invertList`) | Flag |
| `emphasize` | `highlight`, `hervorheben` | IBCS EMPHASIZE (`highlight`) | Flag |
| `graphic` | `chart`, `grafik` | nur diese Zeilen zeigen Grafiken (`chartList`) | Flag |

Regeln:
- **Wirksam = Rolle ∪ Liste.** Doppelte Angabe schadet nicht. Per Token gesetzte
  Häkchen erscheinen im Struktur-Menü (`structureEdit`) gesperrt — abschalten
  nur im Modell.
- **Altwerte unverändert:** `sum`/`delta`/`pct`-Berichte zeichnen wie bis 1.52.
  Jeder andere nicht-leere Wert ist eine normale Bewegungszeile.
- **Nur-Flag-Zellen** (z. B. nur `invert`) machen keine Strukturaussage; trägt
  die Rolle ausschließlich Flags, gilt das Modell nicht als GuV.
- **Unbekannte Token** werden ignoriert und nur im Bearbeitungsmodus unten rechts
  gemeldet (max. drei + „+n“) — beim Prüfen im Desktop darauf achten.
- **Gemeinsame Spalte mit dem P&L-Visual:** `DimKonto[RowType]` (`Account` ·
  `Subtotal` · `Formula` · `KPI` · `Separator`) wird von ChartKitchen verstanden
  (`Subtotal`/`Formula` = Ergebniszeile, `KPI` = Marge, `Account`/`Separator` =
  normal). Das P&L-Visual kennt `total` **nicht** (liest es als Account) — in
  einer gemeinsamen Spalte deshalb `Subtotal` schreiben, nie `total`.
- Spalte und Vertrag werden im Skill `finance-data-model` definiert
  (`references/konten-dimension.md` §4); die GuV-Seite mit dem anderen Visual
  baut der Skill `pnl-report`.

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
| `scatter` | Scatter / Bubble (Korrelation) | Struktur (Y = `actual`, X = `xValue`, optional `bubbleSize`; ab 1.47) |
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
| `invert` | bool | false | Kosten-KPI: mehr = schlecht (rot). Nur für Kosten, die als **positive** Werte im Measure stehen; ein mit Vorzeichen `-1` signiertes Measure (Gewinn-Sicht) nie zusätzlich invertieren — sonst färben Mehrkosten günstig (Matrix: Skill `finance-data-model`, `konten-dimension.md` §6). |
| `invertList` | text | "" | **Fallback/Override** für Modelle ohne `rowType`-Spalte: kommagetrennte Kategorien mit umgekehrter Wertung (gleiche Regel wie `invert`: nur positiv geführte Kosten). Bevorzugt: Token `invert` in der Rolle `rowType`. |
| `cumulative` | bool | false | Kumulierte (YTD) Sicht. |
| `cumulativeKind` | `ytd`·`qtd`·`r12` | ytd | Art der Kumulation. |
| `fiscalStart` | numeric 1–12 | 1 | Fiskaljahres-Startmonat für YTD/QTD. |
| `topN` | numeric 0–50 | 0 | Struktur-Modi: N größte Kategorien, Rest aggregiert. 0 = alle. |
| `movingAverage` | numeric 0–24 | 0 | Gleitender Durchschnitt als Overlay (Columns/Line). |
| `materialityAbs` | numeric ≥0 | 0 | Abweichungen unter Betrag grau. |
| `materialityPct` | numeric 0–100 | 0 | Abweichungen unter % grau. |
| `highlight` | text | "" | **Fallback/Override:** kommagetrennte hervorgehobene Kategorien (EMPHASIZE). Bevorzugt: Token `emphasize` in `rowType`. |
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
`zebraStripes` (bool). Struktur-Listen (kommagetrennt, **nur Fallback/Override**
für Modelle ohne `rowType`-Spalte — bevorzugt die Token in der Rolle `rowType`,
Zuordnung siehe „rowType-Token“): `resultList` (`total`), `skipList`
(`exclude`), `hideList` (`hide`), `chartList` (`graphic`), `indentList`
(`davon`); dazu `invertList` (`invert`) und `highlight` (`emphasize`). `rowFormats` (Zeilen-Format),
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
- `rowType` ist die bevorzugte Quelle der Zeilenstruktur für `waterfall` und
  `pnl` (und Tabelle/Struktur-Modi); `pnl`/`waterfall` ohne `rowType` brauchen
  die Komma-Listen als Fallback. Zeilennamen in Listen sind kein Datenvertrag
  (brechen bei Umbenennung/Übersetzung).
- `colgroup` nur mit `orientation=table` (max. 2 Ebenen).
- `lineMeasure` nur mit `orientation=columns`.
- `cardBullet`/`cardStatusBasis=benchmark` brauchen die `benchmark`-Rolle.
- `filterFooter` (ibcsTitle) zeigt nur dann Kontext, wenn `filterInfo` gebunden
  ist (Report-Filter sind Custom Visuals per API nicht sichtbar).
- Gleiche Einheit auf einer Seite → gleiche Skala (`scale.fixedMax` /
  `multiplesSameScale`).
