# Vega-Lite · Referenz

Quelle: https://vega.github.io/vega-lite/docs/ · Schema v5.

## Spec-Top-Level
`$schema · data · datasets · transform · mark · encoding · config · title ·
width · height · view · projection · params · resolve` + Komposition
(`layer` / `facet` · `row`/`column` / `concat`·`hconcat`·`vconcat` / `repeat`).

## Data
- `{"values": [ {…}, … ]}` – inline.
- `{"url": "data.csv", "format": {"type": "csv"}}` – extern (csv/tsv/json/dsv/topojson).
- `{"name": "dataset"}` – **named data**, von außen befüllt (Deneb/Power BI, Runtime-API).
- Datums-Parsing für inline/url: `"format": {"parse": {"start": "date", "ts": "utc:'%Y-%m-%d'"}}`.

## Encoding-Channels (Detail)
- **Position:** `x`, `y` (+ `x2`,`y2` für Ranges/Bars), `xError`/`yError`.
- **Offset:** `xOffset`, `yOffset` – gruppierte Bars (statt facet).
- **Polar:** `theta`,`theta2`,`radius`,`radius2` (Arc/Pie/Donut).
- **Geo:** `longitude`,`latitude`,`longitude2`,`latitude2`.
- **Mark-Property:** `color`,`fill`,`stroke`,`opacity`,`fillOpacity`,`strokeOpacity`,`strokeWidth`,`strokeDash`,`size`,`angle`,`shape`.
- **Text/Link:** `text`,`tooltip` (Array für Multi-Field-Tooltip),`href`,`description` (a11y).
- **Hierarchie/Order:** `detail` (Gruppierung ohne visuelle Codierung),`order` (Sortier-/Stapelreihenfolge),`key` (Datenjoin für Transitions).
- **Facet:** `facet`,`row`,`column`.

### Channel-Def-Eigenschaften
`field` · `type` (q/t/o/n/geojson) · `aggregate` (Inline-Aggregat, z. B. `"sum"`) ·
`bin` · `timeUnit` (z. B. `"yearmonth"`) · `scale` · `axis` · `legend` ·
`sort` · `stack` (`true`/`"normalize"`/`"center"`/`null`) · `format`/`formatType` ·
`title` · `condition` · `value` (konstanter Wert statt Feld) · `datum` (konstanter Datenwert).

## Marks
`arc area bar boxplot circle errorband errorbar geoshape image line point rect rule square text tick trail`.

Mark als Objekt für Optionen: `{"type":"bar","tooltip":true,"cornerRadius":2,"opacity":.9,"point":true,"interpolate":"monotone","clip":true}`.
- `line`/`area`: `interpolate` (`linear monotone step step-after basis cardinal`), `point` (Marker an Stützstellen).
- `bar`/`rect`: `cornerRadius*`, `width`/`height` (`{"band":1}`), `binSpacing`.
- `text`: `dx dy align baseline angle fontSize fontWeight limit`.

## Transforms (voll, mit Schlüssel-Props)
- **aggregate** `{aggregate:[{op,field,as}], groupby:[]}` – verdichtet (ersetzt Zeilen).
- **bin** `{bin:true|{maxbins,step}, field, as}`.
- **calculate** `{calculate:"datum.a/datum.b*100", as:"pct"}`.
- **density** `{density:"field", groupby, extent, bandwidth, as:["value","density"]}`.
- **extent** `{extent:"field", param:"name"}`.
- **filter** `{filter:"datum.v > 0"}` oder Prädikat-Objekt / Selektion (`{filter:{param:"brush"}}`).
- **flatten** `{flatten:["arr"], as:["item"]}`.
- **fold** `{fold:["a","b"], as:["key","value"]}`.
- **impute** `{impute:"v", key:"x", method:"value", value:0}`.
- **joinaggregate** `{joinaggregate:[{op:"sum",field:"v",as:"total"}], groupby:[]}` – **Aggregat als Spalte, Zeilen bleiben**.
- **loess** `{loess:"y", on:"x", groupby, bandwidth}`.
- **lookup** `{lookup:"key", from:{data:{…}, key:"id", fields:["name"]}}`.
- **pivot** `{pivot:"key", value:"v", groupby:[]}`.
- **quantile** `{quantile:"v", probs:[…], as:["prob","value"]}`.
- **regression** `{regression:"y", on:"x", method:"linear|log|exp|pow|quad|poly"}`.
- **sample** `{sample:500}`.
- **stack** `{stack:"v", groupby:["x"], as:["v0","v1"], offset:"zero|normalize|center"}`.
- **timeUnit** `{timeUnit:"yearmonth", field:"date", as:"ym"}`.
- **window** `{window:[{op,field,as,param}], frame:[null,0], sort:[{field,order}], groupby, ignorePeers}`.

**Aggregate-Ops:** `count valid missing distinct sum mean average median q1 q3 min max argmin argmax variance variancep stdev stdevp ci0 ci1 product`.
**Window-Ops (zusätzlich):** `row_number rank dense_rank percent_rank cume_dist ntile lead lag first_value last_value nth_value`.
**Kumulieren:** `window` mit `op:"sum"` + `frame:[null,0]` (alle vorherigen Zeilen bis aktuelle).

## Scales
Am Channel via `"scale": {…}`. Wichtig:
- `type`: `linear log pow sqrt symlog time utc band point ordinal quantize quantile threshold`.
- `domain`/`domainMin`/`domainMax`/`domainMid` · `range`/`scheme` (Farbschema, z. B. `"reds"`,`"viridis"`) · `zero` (bei quantitativ default true) · `nice` · `padding`/`paddingInner`/`paddingOuter` (band) · `reverse` · `clamp`.
- Geteilte Skala über Layer: gleiche Felder/Typen ⇒ automatisch; sonst `resolve`.

## Axis / Legend / Header
- `axis`: `title labels labelAngle labelLimit format grid tickCount values orient domain ticks labelOverlap` – `"axis": null` blendet aus.
- `legend`: `title orient direction symbolType format` – `"legend": null` blendet aus.
- Facet-`header`: `title labelAngle labelOrient`.

## Komposition
- **layer** `[{…},{…}]` – überlagert, teilt Position-Skalen; `resolve:{scale:{y:"independent"}}` für getrennte Achsen.
- **facet** `{field:"k", type:"nominal"}` + `spec` ODER Channels `row`/`column` – Small Multiples.
- **concat** `concat`(Grid, `columns`) / `hconcat` / `vconcat`.
- **repeat** `{repeat:["a","b"], spec:{… encoding mit {"repeat":"repeat"} …}}`.

## Params & Selections (Interaktivität)
```json
"params": [
  {"name": "brush", "select": {"type": "interval", "encodings": ["x"]}},
  {"name": "pick",  "select": {"type": "point",  "fields": ["k"], "on": "click", "toggle": "event.shiftKey"}},
  {"name": "thr",   "value": 50, "bind": {"input": "range", "min": 0, "max": 100}}   // UI-Binding
]
```
Nutzung:
- **Bedingtes Encoding:** `"color": {"condition": {"param": "pick", "field": "k", "type": "nominal"}, "value": "#ccc"}`.
- **Filter:** `{"filter": {"param": "brush"}}`.
- **Test-Bedingung (ohne Selektion):** `"color": {"condition": {"test": "datum.v >= 0", "value":"#404040"}, "value":"#c0392b"}`.
- Point vs Interval: Klick/Shift-Klick vs Drag. `clear` default `dblclick`. `nearest:true` (Voronoi), `resolve` (`global`/`union`/`intersect`).

## Config (globale Defaults)
`config: {view:{stroke:null}, axis:{labelFont:"Arial",labelFontSize:11,grid:false},
legend:{…}, mark:{…}, bar:{…}, font:"Arial",
range:{category:{scheme:[…]}}, numberFormat:",.0f"}`.
Mark-spezifisch: `config.bar`, `config.line`, `config.text`, … überschreiben pro Mark-Typ.

## Ausdrucks-Sprache (calculate/filter/test)
`datum.feld` · Operatoren `+ - * / % === !== < > && || ?:` · Funktionen:
`isValid isNaN abs round floor ceil sqrt pow min max` · String `lower upper substring indexof split length replace` ·
Datum `datetime year month date hours timeFormat utcFormat now` · `format(v,'.1%')` · `if(test,a,b)`.
Feld mit Punkt im Namen: `datum['a.b']` (in VL-`field` Punkt mit `\\.` escapen).

## Erprobte Kompositions-Patterns (aus dem Builder)

### Dual-Axis (zwei Skalen, IBCS ohne 2. Achse)
`resolve:{scale:{y:'independent'}}` macht in einem flachen `layer` JEDEN Layer
unabhängig – falsch, wenn Bars eine Skala teilen sollen und Lines eine andere.
Richtig: **zwei Layer-Gruppen**, independent nur auf der obersten Ebene:
```json
{ "data": {…}, "encoding": {"x": {…}},
  "layer": [ {"layer": [ …alle Bar-Layer… ]}, {"layer": [ …alle Line-Layer… ]} ],
  "resolve": {"scale": {"y": "independent"}} }
```
Child 1 (Bars) teilt Skala A, Child 2 (Lines) teilt Skala B. Achsen `axis:null`
(direkt beschriftet) → „Form statt Niveau" ohne sichtbare 2. Achse. Gemeinsame
Achse = einfach ein flacher `layer` ohne `resolve`. (Builder: `vlColLine`.)

### Overlay-Referenzlinie (Ø/Median) als zusätzlicher Layer
Aggregat-`rule` braucht keine Vorberechnung – `aggregate` darf direkt im
Encoding stehen (auch `median`):
```json
{"mark": {"type": "rule", "strokeDash": [4,3]},
 "encoding": {"y": {"aggregate": "median", "field": "p", "type": "quantitative"}}}
```
In Power BI aggregiert Deneb selbst → robust, kein gebackener Wert. (Builder: `vStatLayers`.)

### Trellis / Small Multiples (`facet`)
```json
{ "data": {"name":"dataset"},
  "facet": {"field": "Region", "type": "nominal",
            "header": {"title": null, "labelAnchor": "start"}},
  "columns": 3,
  "spec": { "width":170, "height":95, "encoding": {"x": {…}}, "layer": [ … ] },
  "resolve": {"scale": {"y": "shared"}} }   // "independent" = freie Skala je Kachel
```
`columns` steuert das Raster, `resolve.scale.y` = `shared` (Niveau-Vergleich) vs
`independent` (Form je Kachel). **Wichtig:** `data` gehört auf die FACET-Ebene,
NICHT in `spec`. (Builder: `vlMultiples`; Deneb-Facet-Export: `vegaSpec` wickelt
einen Single-View-Body nur fürs Template in `facet`.)

### Mark in beliebiger Szenario-Notation (parametrisiert)
Statt fester Primär-Säule eine Funktion, die Fill/Stroke/Strichelung aus dem
Szenario-Code ableitet – FC-Schraffur (weiß + Outline + dash) nur bei der
Primärgröße per `condition:{test:'datum.fc'}`. (Builder: `vBarMarkScen`.)

### Σ-/Aggregat-Slot, der den Laufweg erhält (Wasserfall-Gruppen)
Gruppen-Header = reiner Aggregator (Wert = Σ der Blätter), trägt NICHT selbst
zum Running-Total bei; nur Blätter tun das. Einklappen ersetzt die Blätter durch
EINE Säule mit `from=erstes Blatt`, `to=letztes Blatt` → Endsumme unverändert,
beliebig tief schachtelbar. (Builder: `wfLeveledModel`/`renderWfLeveledV`.)
