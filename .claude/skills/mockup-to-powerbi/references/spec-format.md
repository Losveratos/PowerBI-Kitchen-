# `mockup-spec.json` — Format

Abgeleitet aus `assets/mockup/export.js` (`buildSpec`, `bucketsFor`, `buildPbir`)
und `assets/mockup/catalog.js` (Typen, Rollen, Engines, native Mappings) des
Tools **MockupKitchen byDatenWG**. Beispiel: [`example/mockup-spec.json`](example/mockup-spec.json).

Alle Koordinaten sind absolute Canvas-Pixel, `x`/`y` = linke obere Ecke.

## Oberste Ebene

| Schlüssel | Inhalt |
|---|---|
| `meta` | `tool`, `version`, `name` (Mockup-Name), `exportedAt` (ISO), `skill: "mockup-to-powerbi"` |
| `page` | `name` (Seitenname in Power BI), `notes` (Freitext des Menschen) |
| `canvas` | `width`, `height` — direkt für `pbir add page -w -h` bzw. `pbir pages resize` |
| `spacing` | `margin`, `gutter`, `tilePadding` — schon in die Rechtecke eingerechnet, nur informativ |
| `zones` | Chrome + Inhaltsbereich, siehe unten |
| `visuals` | Kachel-Slots, siehe unten |
| `model` | `source` (Ordnername des Semantikmodells), `tables` (Namen), `usedFields` (alle gebundenen Felder, dedupliziert) |
| `newFields` | im Mockup neu erfundene Felder: `table`, `name`, `kind`, `ref`, `description`, `used` |
| `layoutTree` | der Container-Baum (`split`/`children`/`leaf`) — nur zur Orientierung, die Rechtecke in `visuals[].rect` sind maßgeblich |
| `warnings` | Hinweise aus dem Tool, z. B. leere Kacheln |

## `zones`

Alle Zonen haben `x`, `y`, `w`, `h`. Vorhanden ist nur, was der Mensch
eingeschaltet hat — `content` immer.

| Zone | Zusätzliche Felder |
|---|---|
| `nav` | – (linke Leiste über die volle Höhe) |
| `header` | `logo` (bool), `title`, `subtitle`, `nav` (Liste von Seitennamen für Buttons) |
| `filter` | `side` (`left`/`right`), `collapsible` (bool), `slicers` (Liste von Feldern mit `table`, `name`, `kind`, `ref`, `isNew`) |
| `footer` | `text` |
| `content` | – (hier und nur hier liegen die Visuals) |

Geometrie-Logik des Tools (`app.js` → `zones()`): Nav-Leiste nimmt links Platz
weg, danach Kopfband und Fußleiste oben/unten, dann das Filter-Panel seitlich;
der Rest minus `margin` ist `content`. Die Slicer im Filter-Panel werden beim
Export gestapelt bei `x = filter.x + 8`, `y = filter.y + 40 + i·64`,
`w = filter.w - 16`, `h = 56`.

## `visuals[]`

| Schlüssel | Bedeutung |
|---|---|
| `id` | eindeutiger Name, z. B. `v05_Umsatz_AC_FC_vs_PL_je_Monat` — wird 1:1 der `name` des PBIR-Visuals |
| `kind` | Katalog-Typ (`kombi`, `varint`, `bars`, `kpi`, …) |
| `label` | Anzeigename des Typs |
| `engine` | `ck` · `native` · `deneb` |
| `chartKitchenType` | ChartKitchen-Typ-ID (nur bei `engine: "ck"`, sonst `null`) |
| `native` | `{ type, buckets }` — natives Power-BI-Visual und die fertig gemappten pbir-Datenrollen. Wird **auch bei `engine: "ck"`** befüllt, sofern der Typ ein natives Gegenstück hat → brauchbar als Ersatzvisual |
| `title`, `subtitle` | Visual-Titel und Untertitel/Einheit |
| `scenario` | z. B. `AC/PL`, `AC/PY`, `AC/PL/FC` — nur bei Typen mit Referenz-Rolle, sonst `null` |
| `rect` | `{x, y, w, h}` — exakt übernehmen |
| `roles` | Mockup-Rolle → Liste von Feldern (`table`, `name`, `kind`, `ref`, `isNew`) |
| `notes` | Freitext des Menschen (→ Annotation im Bericht) |
| `warnings` | z. B. „Pflichtrolle … ist leer", „Nicht IBCS-konform" |

`ref` ist immer `Tabelle.Feld` — in `te` entspricht das `Tabelle/Feld`.

## Rollen-Vokabular

| Rolle | Label im Tool | Art | max |
|---|---|---|---|
| `category` | Kategorie / Achse bzw. Zeit / Periode bzw. Geo-Feld | Spalte | 1 |
| `subcategory` | Unterkategorie | Spalte | 1 |
| `series` | Reihe / Legende (bei Small Multiples: Facette) | Spalte | 1 |
| `ac` | AC · Ist-Wert | Measure | 1 |
| `ref` | Referenz (PL / PY / BU) | Measure | 2 |
| `fc` | FC-Flag (1/0) | Spalte | 1 |
| `values` | Werte / Felder | Measure bzw. beliebig | 12–20 |
| `rows` | Zeilen | Spalte | 4 |
| `columns` | Spalten | Spalte | 3 |
| `x`, `y` | X-/Y-Wert (Streudiagramm) | Measure | 1 |
| `size` | Größe | Measure | 1 |
| `indicator` | Kennzahl (KPI/Karte/Tacho) | Measure | 1 |
| `goal` | Ziel / Referenz | Measure | 1 |
| `start`, `end` | Start / Ende (Gantt) | Spalte | 1 |
| `field` | Feld (Slicer) | Spalte | 1 |
| `text` | Text (statisch oder Measure) | beliebig | 1 |

## Engines

| `engine` | Bedeutung | Umsetzung |
|---|---|---|
| `native` | Standard-Power-BI-Visual | `pbir add visual --from-json pbir-visuals.json` |
| `ck` | ChartKitchen byDatenWG (Custom Visual) | Referenz-Instanz replizieren; ohne Instanz Platzhalter |
| `deneb` | Deneb/Vega | Skill `deploy-to-powerbi`, `pbir visuals deneb` |

`buildPbir` im Tool exportiert **nur** `engine == "native"` plus die Slicer. Das
Skript `mockup_to_pbir.py` macht es genauso; mit `--ck-fallback` nimmt es
zusätzlich das `native`-Gegenstück der ck-Slots auf (nützlich, solange keine
Referenz-Instanz existiert).

## Rollen → pbir-Datenrollen je nativem Typ

Aus `catalog.js` (`native.map`), gegengeprüft mit `pbir add visual --list`
(dort stehen die zulässigen Rollen je Typ; Pflichtrollen ohne Klammern,
optionale in Klammern).

| Kachel-Typ | natives Visual | Mapping |
|---|---|---|
| `columns`, `kombi`, `absvar`, `relvar`, `multiples` | `clusteredColumnChart` | category→`Category`, ac→`Y`, ref→`Y` (multiples zusätzlich series→`Rows`) |
| `colline`, `pareto` | `lineClusteredColumnComboChart` | category→`Category`, ac→`Y`, ref→`Y2` |
| `bars`, `barskombi`, `bullet`, `tornado`, `dotplot` | `clusteredBarChart` | category→`Category`, ac→`Y`, ref→`Y` |
| `stackcol` | `columnChart` | category→`Category`, series→`Series`, ac→`Y` |
| `stackbar` | `barChart` | category→`Category`, series→`Series`, ac→`Y` |
| `line`, `slope`, `fan`, `zchart` | `lineChart` | category→`Category`, ac→`Y`, ref→`Y` |
| `area` | `areaChart` | category→`Category`, ac→`Y`, series→`Series` |
| `waterfall`, `bridge` | `waterfallChart` | category→`Category`, ac→`Y` |
| `tree`, `decomp` | `decompositionTreeVisual` | ac→`Analyze`, category/subcategory→`ExplainBy` |
| `heatmap`, `matrix` | `pivotTable` | rows/category→`Rows`, columns/subcategory→`Columns`, values/ac→`Values` |
| `scatter` | `scatterChart` | category→`Category`, x→`X`, y→`Y`, size→`Size` |
| `kpi`, `card` | `card` | indicator→`Values` |
| `multirow` | `multiRowCard` | values→`Values` |
| `table`, `sparktable` | `tableEx` | rows/ac/ref→alle nach `Values` |
| `gauge` | `gauge` | indicator→`Y`, goal→`TargetValue` |
| `pie` | `pieChart` | category→`Category`, ac→`Y` |
| `treemap` | `treemap` | category→`Group`, ac→`Values` |
| `map` | `map` | category→`Category`, size→`Size` |
| `slicer` | `slicer` | field→`Values` |
| `text` / `image` / `button` | `textbox` / `image` / `actionButton` | keine Datenrollen |
| `marimekko`, `wfint`, `wfkombi`, `varint`, `boxplot`, `gantt` | – | kein natives Gegenstück (`native: null`) |

Im JSON stehen diese Mappings bereits fertig unter `visuals[].native.buckets`.
Mehrere Felder pro Bucket (z. B. AC und PL beide in `Y`) werden im
`--from-json`-Format zu einer Liste: `"Y": ["_Measures.AC", "_Measures.PL"]`.

## Rollen → ChartKitchen-Datenrollen

Zielnamen ausschließlich aus
[`chartkitchen-report/references/field-contract.md`](../../chartkitchen-report/references/field-contract.md).
Das Skript schlägt vor, die Referenz-Instanz entscheidet.

| Mockup-Rolle | ChartKitchen | Anmerkung |
|---|---|---|
| `category` | `category` | |
| `rows` | `category` | Tabelle |
| `series` | `series` | bei `kind: "multiples"` stattdessen `multiples` |
| `subcategory`, `columns` | `colgroup` | nur Tabelle, max. 2 Ebenen |
| `ac`, `indicator`, `values` | `actual` | |
| `ref` (1./2. Feld) | `plan` bzw. `previousYear` | Reihenfolge aus `scenario`: `PL`/`BU` → `plan`, `PY` → `previousYear`; überzählige Referenzen → `benchmark` |
| `goal` | `plan` | bei Monitoring-Zielwerten ggf. `benchmark` — nachfragen |
| `fc` | `fcFlag` | **Zahl 1/0**, nicht Boolean |
| `x`, `y`, `size`, `start`, `end`, `field`, `text` | – | kein Gegenstück; diese Typen kann ChartKitchen nicht |

### Kachel-Typ → `chart.orientation`

| Typen | `orientation` |
|---|---|
| `columns`, `kombi`, `colline`, `absvar`, `relvar`, `stackcol`, `multiples` | `columns` |
| `bars`, `barskombi`, `bullet`, `tornado`, `stackbar` | `bars` |
| `dotplot` | `dumbbell` |
| `pareto` | `pareto` |
| `line`, `fan`, `zchart` | `line` |
| `slope` | `slope` |
| `varint`, `wfint` | `intwaterfall` |
| `waterfall`, `wfkombi` | `waterfall` |
| `bridge` | `catbridge` |
| `kpi` | `cards` |
| `table`, `sparktable`, `heatmap` | `table` |
| `marimekko`, `tree`, `scatter`, `boxplot`, `gantt` | kein Modus → Deneb oder natives Visual |

Für GuV-Seiten gibt es zusätzlich `pnl` (Skill `pnl-report`); das Mockup-Tool
kennt dafür keinen eigenen Typ — beim Menschen nachfragen, wenn die Kachel
„GuV" heißt.

## `pbir-visuals.json` (Tool-Ausgabe)

Liste im `--from-json`-Format von `pbir add visual`. **Nur diese Schlüssel sind
erlaubt**, jeder weitere bricht den kompletten Import ab:

```json
[
  { "visual_type": "card", "name": "v03_Kosten", "title": "Kosten",
    "x": 546, "y": 72, "width": 253, "height": 119,
    "fields": { "Values": "_Measures.Kosten" } }
]
```

`title` setzt den **Container-Titel** (`visualContainerObjects.title.text`), nicht
den Inhalt einer Textbox. `mockup_to_pbir.py` erzeugt diese Datei inhaltsgleich
neu, das Tool-Original ist also entbehrlich.
