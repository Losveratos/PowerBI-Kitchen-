# `mockup-spec.json` — Format

Abgeleitet aus `assets/mockup/export.js` (`buildSpec`, `bucketsFor`, `buildPbir`,
`buildDocs`) und `assets/mockup/catalog.js` (Typen, Rollen, Engines, native
Mappings) des Tools **MockupKitchen byDatenWG**.

Beispiele: [`example/mockup-spec.v2.json`](example/mockup-spec.v2.json) (aktuell,
zwei Seiten, Drill-through, Burger-Filter) und
[`example/mockup-spec.json`](example/mockup-spec.json) (alte einseitige Fassung).

Alle Koordinaten sind absolute Canvas-Pixel, `x`/`y` = linke obere Ecke, und
**bereits mit `canvas.uiScale` multipliziert**. Nichts nachrechnen.

## Versionen

`meta.specVersion` sagt, welche Form vorliegt:

| | specVersion 1 (Tool 0.1) | specVersion 2 (Tool 0.2, aktuell) |
|---|---|---|
| Seiten | eine, `page: {name, notes}` | viele, `pages[]` |
| Visuals | `visuals[]` oben | `pages[].visuals[]` |
| Visual-IDs | `v05_Titel` | `p1_v05_Titel` (seitenpräfixiert) |
| Gestaltung | keine | `design` (Ecken, Kachelstil, Farben, Kopfbandstil) |
| Skalierung | keine | `canvas.uiScale`, `design.fontScale` |
| Verknüpfungen | keine | `links[]`, `pages[].visuals[].link` |
| Filter | `side: left|right` | `mode: right|left|top|burger` (+ `overlay`, `bookmarks`) |
| pbir-Datei | eine `pbir-visuals.json` | eine je Seite: `pbir-visuals.<Seitenslug>.json` |
| Doku | – | zusätzlich `WORKSHOP-DOKU.md` |

`mockup_to_pbir.py` und `mockup_to_docs.py` lesen **beide** Versionen; v1 wird
intern auf genau eine Seite normalisiert (Seitenname aus `page.name`, per
`--page-name` überschreibbar, `design` auf Vorgaben mit Kopfband-Stil `dark` —
so bleibt das Ergebnis identisch zu vorher).

## Oberste Ebene (specVersion 2)

| Schlüssel | Inhalt |
|---|---|
| `meta` | `tool`, `version`, `specVersion`, `name` (Mockup-Name), `exportedAt` (ISO), `skill: "mockup-to-powerbi"` |
| `canvas` | `width`, `height`, `preset` (`1280x720` · `1920x1080` · `3840x2160` · `custom`), `uiScale` (1 · 1.5 · 3) |
| `spacing` | `margin`, `gutter`, `tilePadding` — schon skaliert und in die Rechtecke eingerechnet; `base` hält die HD-Ausgangswerte |
| `design` | Gestaltungsentscheidungen, siehe unten |
| `zones` | Chrome + Inhaltsbereich, auf **allen** Seiten gleich, siehe unten |
| `pages` | die Seiten, siehe unten |
| `links` | Seitenverknüpfungen, siehe unten |
| `model` | `source` (Ordnername des Semantikmodells), `tables` (Namen), `usedFields` (alle gebundenen Felder, dedupliziert) |
| `newFields` | im Mockup neu erfundene Felder: `table`, `name`, `kind`, `ref`, `description`, `openQuestion`, `used` |
| `warnings` | Hinweise aus dem Tool, z. B. leere Kacheln (mit Seitenname) |

## `design`

Das sind die Gestaltungsentscheidungen aus dem Workshop. Sie gehören in die
**Container-Formatierung** der Visuals und in den Seitenhintergrund, nicht in
ein Theme (Theme macht der Skill `powerbi-design-framework`).

| Schlüssel | Werte | Umsetzung mit `pbir` |
|---|---|---|
| `cornerRadius` | px, schon skaliert | `border.radius` je Kachel; bei Chrome-Overlay-Shapes `shape.tileShape=rectangleRounded` + `shape.rectangleRoundedCurve` |
| `tileStyle` | `border` · `shadow` · `flat` | `border.show/color/width` bzw. `dropShadow.show/preset/color/transparency`, jeweils das andere aus |
| `tileBackground` | Hex | `background.show=true`, `background.color` |
| `pageBackground` | Hex | `pbir pages background "<Seite>.Page" --color <Hex> --transparency 0` |
| `headerStyle` | `light` · `dark` · `accent` | Füllung der Kopfband-Shape: weiß + Trennlinie unten · Ink · Akzentfarbe; Textfarbe entsprechend |
| `accent` | Hex | aktiver Nav-Button, Burger-Button, Akzentlinie |
| `fontScale` | = `uiScale` | alle Schriftgrößen multiplizieren (Visual-Titel ≈ 12 · `fontScale` pt, Kopfband-Titel ≈ 16 ·, Fußleiste ≈ 9 ·); `pbir` akzeptiert 6–45 pt |
| `darkMode` | derzeit immer `false` | – |

> Der Enum-Wert für abgerundete Shapes heißt `rectangleRounded`
> (nicht `roundedRectangle`) — `pbir set` lehnt den falschen Namen ab und
> `set -euo pipefail` bricht dann das ganze Chrome-Skript ab.

## `zones`

Alle Zonen haben `x`, `y`, `w`, `h`. Vorhanden ist nur, was der Mensch
eingeschaltet hat — `content` immer. Die Zonen gelten für **jede** Seite.

| Zone | Zusätzliche Felder |
|---|---|
| `nav` | `pages` (Namen aller Seiten — ein Button je Seite in der linken Leiste) |
| `header` | `style` (= `design.headerStyle`), `logoPos` (`left`/`right`/`none`), `title`, `subtitle`, `nav` (Seitennamen für die Buttons), `navAuto` (Nav folgt automatisch den Seiten), `burger` (Burger-Button fürs Filter-Overlay) |
| `filter` | `mode`, `side`, `collapsible`, `slicers[]`, bei Overlay zusätzlich `overlay: true`, `note`, `bookmarks[]` |
| `footer` | `text` |
| `content` | – (hier und nur hier liegen die Visuals) |

Geometrie-Logik des Tools (`app.js` → `zones()`): Nav-Leiste nimmt links Platz
weg, danach Kopfband und Fußleiste oben/unten, dann das Filter-Panel seitlich
oder oben; der Rest minus `margin` ist `content`.

### Filter-Modi

| `mode` | Zone | Slicer-Platzierung (`k` = `uiScale`) | Besonderheit |
|---|---|---|---|
| `right` | rechte Spalte zwischen Kopf und Fuß | gestapelt: `x+8k`, `y+40k+i·64k`, `w-16k`, `56k` | Inhalt wird schmaler |
| `left` | linke Spalte | wie `right` | Inhalt wird schmaler |
| `top` | Leiste unter dem Kopfband, volle Breite | nebeneinander: `x+8k+i·168k`, `y+8k`, `160k`, `h-16k` | Inhalt wird niedriger |
| `burger` | **keine** eigene Zone im Layout; Panel liegt rechts **über** dem Inhalt | wie `right` | `overlay: true`, Burger-Button im Kopfband, zwei Lesezeichen |

`bookmarks` steht bei `mode: "burger"` **und** bei `collapsible: true`:
`[{name: "Filter öffnen", showsPanel: true}, {name: "Filter schließen", showsPanel: false}]`.
Rezept dazu in [`chrome-build.md`](chrome-build.md); die fertigen Befehle
schreibt `mockup_to_pbir.py` nach `mockup-out/navigation.md`.

## `pages[]`

| Schlüssel | Bedeutung |
|---|---|
| `id` | interne Tool-ID, Ziel von `links[].toPageId` |
| `index` | 1-basiert, steckt auch im Visual-Präfix (`p2_v01_…`) |
| `name` | Seitenname in Power BI (`pbir add page -n`) |
| `notes` | Zweck der Seite, Freitext aus dem Workshop |
| `contentRect` | Inhaltsbereich dieser Seite (identisch zu `zones.content`, solange das Tool die Zonen global hält) |
| `visuals` | Kachel-Slots, siehe unten |
| `layoutTree` | Container-Baum (`split`/`children`/`leaf`) — nur zur Orientierung, maßgeblich sind die Rechtecke |

## `links[]`

| Schlüssel | Bedeutung |
|---|---|
| `fromVisual` | ID der Quellkachel |
| `fromPage` / `toPage` | Seitennamen |
| `toPageId` | `pages[].id` des Ziels |
| `kind` | `navigation` (Quelle ist eine Button-Kachel → `pbir visuals action --type PageNavigation`) oder `drillthrough` (jede andere Kachel → Zielseite bekommt ein Drill-through-Feld) |

Beim Drill-through ist das Drill-Feld das **Kategorie-Feld der Quellkachel** —
in dieser Reihenfolge: `category`, `rows`, `subcategory`, `series`. Daraus wird
`pbir pages drillthrough "<Ziel>.Page" --table <Tabelle> --field <Feld>`.

## `visuals[]` (je Seite)

| Schlüssel | Bedeutung |
|---|---|
| `id` | eindeutiger Name, z. B. `p1_v05_Umsatz_AC_FC_vs_PL_je_Monat` — wird 1:1 der `name` des PBIR-Visuals |
| `page` | Seitenname (redundant, praktisch beim Filtern) |
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
| `link` | `{pageId, pageName}` oder `null` — Ziel des Sprungs |
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
| `native` | Standard-Power-BI-Visual | `pbir add visual "<Seite>.Page" --from-json <Seitenslug>/pbir-visuals.json` |
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


## `pbir-visuals.<Seitenslug>.json` (Tool-Ausgabe, eine Datei je Seite)

Liste im `--from-json`-Format von `pbir add visual`, **nur die nativen Visuals
und die Slicer dieser Seite**. Nur diese Schlüssel sind erlaubt, jeder weitere
bricht den kompletten Import ab:

```json
[
  { "visual_type": "card", "name": "p1_v02_Kosten", "title": "Kosten",
    "x": 345, "y": 72, "width": 312, "height": 119,
    "fields": { "Values": "_Measures.Kosten" } }
]
```

`title` setzt den **Container-Titel** (`visualContainerObjects.title.text`), nicht
den Inhalt einer Textbox. Slicer heißen `p<Seitenindex>_slicer<i>_<Feld>` (in
specVersion 1: `slicer<i>_<Feld>`).

`mockup_to_pbir.py` erzeugt diese Dateien inhaltsgleich neu — als
`mockup-out/<Seitenslug>/pbir-visuals.json`. Die Tool-Originale sind also
entbehrlich; wer sie trotzdem nimmt, nimmt die passende Seitendatei.

## `WORKSHOP-DOKU.md` (Tool-Ausgabe)

Das Workshop-Protokoll aus `buildDocs`: Kopftabelle (Teilnehmende, Ziel,
Zielgruppe, Seiten, Datenmodell), Gestaltungsentscheidungen, je Seite eine
Kachel-Tabelle, Navigation/Drill, Kennzahlen (verwendet + neu), offene Punkte,
nächste Schritte. Felder in eckigen Klammern (`[ausfüllen]`) füllt der Mensch.

`mockup_to_docs.py` erzeugt dieselbe Struktur, falls die Datei fehlt, und macht
daraus eine PowerPoint — Details im Skill-Schritt „Doku und PowerPoint".
