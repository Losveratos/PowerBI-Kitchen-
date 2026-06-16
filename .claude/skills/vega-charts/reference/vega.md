# Vega (Raw, v5) · Referenz

Quelle: https://vega.github.io/vega/docs/ · Schema v5.
Nutze Raw-Vega, wenn Vega-Lite nicht reicht: reaktive Daten-Mutation, eigene
Signale/Event-Streams, Custom-Geometrie. Vega-Lite **kompiliert zu Vega**.

## Top-Level
`$schema · description · background · width · height · padding · autosize ·
config · signals · data · scales · projections · axes · legends · title ·
marks · encode · usermeta`.
- `width`/`height`/`background` dürfen **signal-wertig** sein (`{"signal":"…"}`).
- `autosize`: `pad` (Default, wächst um Achsen) · `fit`/`fit-x`/`fit-y` (skaliert in feste Größe) · `none`.

## Signals (das Herz der Interaktivität)
```json
{"name":"sel", "value":null,
 "on":[{"events":"rect:click",            "update":"datum"},
       {"events":"rect:dblclick",         "update":"null"}]}
```
Eigenschaften: `name` · `value` (Startwert) · `init` (einmaliger Ausdruck) ·
`update` (reaktiver Ausdruck; `init`/`update` schließen sich aus) ·
`on` (Event-Handler) · `bind` (UI-Input: `range checkbox select radio text`).
- Externe Signale (von Power BI injiziert, z. B. `pbiContainerWidth`) müssen für **lokales** Rendern als Default-Signal deklariert werden, sonst „Unrecognized signal name".

### Event-Streams (Selektor-Syntax)
- Mark-Typ: `"rect:click"`, `"symbol:mouseover"`.
- **Named mark:** `"@taskBars:click"` (Mark mit `"name":"taskBars"`).
- Quelle: `"window"`, `"window:resize"`, `"wheel!"` (`!` = `preventDefault`/consume).
- Pointer: `"pointerdown"`, `"pointermove"`, `"pointerup"`.
- **Komposition / between / Drag:**
  `"[pointerdown, window:pointerup] > window:pointermove"` (Move zwischen Down und Up).
- Filter/Marker: `"[event.shiftKey]"`, `{"events":"…","filter":"…","throttle":50}`.
- Mehrere Quellen: Array `[{"source":"window","type":"pointermove",…}]`.

## Reaktive Datasets – das, was Vega-Lite NICHT kann
Ein `data`-Eintrag kann auf Signale reagieren und sich **selbst mutieren**:
```json
{"name":"collapsed",
 "on":[
   {"trigger":"phaseClicked", "toggle":"phaseClicked"},   // ein-/austragen
   {"trigger":"closeAll",     "insert":"data('phases')"}, // Zeilen einfügen
   {"trigger":"openAll",      "remove":true}              // alle entfernen
 ]}
```
Trigger-Operationen: `insert` · `remove` · `toggle` · `modify` (+ `values`/`field`).
Damit baut die Gantt-Vorlage ihr Collapse: ein Klick-Signal `phaseClicked` toggelt
Zeilen in `collapsed`; ein nachgelagertes `filter`-Dataset `!indata('collapsed','phase',datum.phase)`
blendet die Tasks dieser Phase aus. **Muster für „Zeilen ein-/ausklappen im Visual selbst".**

## Data + Transforms
```json
{"name":"summary","source":"table","transform":[
  {"type":"formula","as":"pct","expr":"datum.v/datum.total*100"},
  {"type":"filter","expr":"datum.v > 0"}
]}
```
Kategorien (siehe Vega-Docs „Transforms"):
- **Datenform:** `aggregate bin collect(=sort) countpattern cross density extent
  filter flatten fold formula identifier impute lookup pivot project(=Spalten wählen)
  sample sequence timeunit`.
- **Analytik:** `joinaggregate` (Aggregat als Spalte, Zeilen bleiben), `window` (geordnet/Rang), `stack`.
- **Geo/Layout/Hierarchie:** `geojson geopath geoshape graticule · force label linkpath pie stack voronoi wordcloud · nest stratify tree treemap pack partition`.
- **Cross-Filter:** `crossfilter resolvefilter`.

`formula` = Vegas `calculate` (`as`+`expr`). `aggregate` ersetzt Zeilen; `joinaggregate` hängt Spalten an.
**Mehrere `aggregate` auf einer Quelle kollidieren → joinaggregate+filter (siehe SKILL.md §5).**
Daten von außen parsen: `"format":{"parse":{"start":"date"}}`.

## Scales / Axes / Legends
- **Scale:** `{name,type,domain,range}`. `domain`: `{"data":"table","field":"v"}` oder `{"signal":"…"}`.
  `range`: `"width"`/`"height"`/`"category"`/`{"signal":"[0,w]"}`. Typen wie Vega-Lite + `band point`.
- **Axis:** `{"orient":"bottom|left|top|right","scale":"x","title":…,"grid":true,"labelAngle":0,"tickCount":…,"encode":{…}}`.
- **Legend:** `{"fill":"color","title":…,"orient":"right"}`.

## Marks & Encode
```json
{"type":"rect","name":"bars","from":{"data":"table"},
 "encode":{
   "enter":{"fill":{"value":"#404040"}},
   "update":{"x":{"scale":"x","field":"k"},"width":{"scale":"x","band":1},
             "y":{"scale":"y","field":"v"},"y2":{"scale":"y","value":0},
             "fillOpacity":{"signal":"sel===datum ? 1 : 0.5"}},
   "hover":{"fillOpacity":{"value":1}}}}
```
- Mark-Typen: `arc area image group line path rect rule shape symbol text trail`.
- **`group`-Mark** = verschachtelte Sicht (eigene `scales`/`axes`/`marks`/`signals`); Basis für Facets, Spalten-Layouts, Custom-Dashboards.
- Encode-Sets: `enter` (einmalig) · `update` (Standard, reagiert auf Signale/Daten) · `exit` · `hover`.
- Werte: `{"value":…}` (Konstante) · `{"field":…}` · `{"scale":…,"field":…}` · `{"signal":…}`.
- Bedingt: `"fill":[{"test":"datum.v>=0","value":"#404040"},{"value":"#c0392b"}]`.
- `path`-Mark + `"path":{"signal":"…SVG-Pfad-String…"}` = beliebige Geometrie (Gantt-Phasenbalken).

## Ausdrucks-Funktionen (Auswahl)
`datum.feld` · `data('name')` (ganzes Dataset) · `indata('set','feld',wert)` (Membership) ·
`scale('x',v)` / `invert('x',px)` · `bandwidth('x')` · `now() datetime year month date hours timeFormat utcFormat timeOffset` ·
`isValid isNaN abs round floor ceil sqrt pow min max clamp` · `length slice indexof split pluck` · `if(t,a,b)` · `format(v,'.1%')` · `pow(...)` · `span([a,b])`.
Feld mit Sonderzeichen: `datum['a.b']`.

## Laufzeit-API (lokal rendern / exportieren)
```js
const view = new vega.View(vega.parse(spec), {renderer:'svg', container:el, hover:true});
view.signal('pbiContainerWidth', 860);   // externe Signale setzen
view.insert('dataset', rows);             // named data füllen (wenn nicht via values)
await view.runAsync();
const svg = await view.toSVG();           // oder view.toCanvas(scale)
view.finalize();                          // window-Listener lösen!
```
Bei `init`-Signalen, die `data('dataset')[0]` lesen: Daten als `values` **vor** `parse` einbetten
(sonst läuft `init` gegen leeres Dataset).
