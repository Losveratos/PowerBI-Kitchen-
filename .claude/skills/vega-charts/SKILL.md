---
name: vega-charts
description: >
  Vega- und Vega-Lite-Spezifikationen bauen, lesen und anpassen – inkl. der
  Deneb/Power-BI-Eigenheiten dieses Projekts (named dataset, pbiContainer-Signale,
  ''-Quoting, dynamische Σ-Slots). Nutzen, wenn der User sinngemäß sagt „bau/ändere
  mir ein Vega(-Lite)-Spec", „Deneb-Template anpassen", „warum rendert mein Vega
  nicht / NaN / kompiliert nicht", „neuen Diagrammtyp in den Chart-Builder", „Vega-
  Transform/Signal/Encoding erklären", oder Vega/Vega-Lite/Deneb-JSON debuggt wird.
  Auch passend für „adaptiere die Gantt-Vorlage" oder „füge Interaktivität hinzu".
---

# Vega & Vega-Lite · Bau- und Anpassungs-Skill

> Ziel: schnell **korrekte, kompilierende** Vega-/Vega-Lite-Specs schreiben und
> bestehende (v. a. Deneb-/Power-BI-)Specs sicher anpassen. Quellen:
> [Vega-Lite-Docs](https://vega.github.io/vega-lite/docs/) ·
> [Vega-Docs](https://vega.github.io/vega/docs/). Tiefe in `reference/`.

## 0 · Erst entscheiden: Vega-Lite oder Raw-Vega?

| Frage | → Vega-Lite | → Raw-Vega |
|---|---|---|
| Standard-Chart (bar/line/point/area/rect/arc/boxplot…)? | ✅ | |
| Mehrschichtig (layer/facet/concat/repeat) aus Standard-Marks? | ✅ | |
| **Reaktive Daten-Mutation** (Zeilen ein-/ausklappen, Toggle-Datasets)? | ❌ | ✅ |
| Eigene `signals` mit Event-Streams (wheel-Zoom, Pan, Klick-Toggle)? | ❌ | ✅ |
| Custom-Geometrie (SVG-Pfade, manuelle Achsen, Gantt-artig)? | ❌ | ✅ |
| Mehrere `aggregate`-Sichten auf **dieselbe** Datenquelle (Σ + Detail)? | per `joinaggregate`+`filter` | ✅ |

**Faustregel dieses Projekts:** Standard-IBCS-Charts → Vega-Lite (mappt zuverlässig
auf Deneb-Felder via Platzhalter). Gantt + alles mit klickbarem Collapse/Zoom → Raw-Vega.
Vega-Lite **kompiliert zu Vega** (`vegaLite.compile(spec).spec`) – jedes VL-Spec ist
also auch ein Vega-Spec, aber nicht umgekehrt.

## 1 · Vega-Lite-Skelett (der 95 %-Fall)

```json
{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": {"name": "dataset"},                  // Deneb: name=dataset; sonst {values:[…]} oder {url:…}
  "transform": [ /* … abgeleitete Felder zuerst … */ ],
  "mark": {"type": "bar", "tooltip": true},
  "encoding": {
    "x": {"field": "Kategorie", "type": "nominal", "axis": {"labelAngle": 0}},
    "y": {"field": "Wert", "type": "quantitative", "stack": null},
    "color": {"condition": {"test": "datum.Wert >= 0", "value": "#404040"}, "value": "#c0392b"}
  },
  "width": "container", "height": "container"
}
```

- **Marks:** `arc area bar boxplot circle errorband errorbar geoshape image line point rect rule square text tick trail`.
- **Channels:** Position `x y xOffset yOffset` · Polar `theta radius` · Geo `longitude latitude` ·
  Mark-Property `color size opacity strokeDash strokeOpacity` · `text tooltip href detail order` · Facet `facet row column`.
- **Field-Types** (Pflicht bei `field`): `quantitative` (Zahl) · `temporal` (Datum) · `ordinal` (geordnete Kategorie) · `nominal` (ungeordnet) · `geojson`.
- **Komposition:** `layer` (überlagern, gemeinsame Achsen) · `facet`/`row`/`column` (Small Multiples) · `concat`/`hconcat`/`vconcat` · `repeat`.
- Voll-Referenz inkl. Transform-Liste, Scales/Axes, Params/Selections, Config → **`reference/vega-lite.md`**.

## 2 · Raw-Vega-Skelett (Interaktion / Custom)

```json
{
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "signals": [ {"name": "hover", "value": null,
                "on": [{"events": "rect:mouseover", "update": "datum"},
                       {"events": "rect:mouseout",  "update": "null"}]} ],
  "data":   [ {"name": "table"},                                    // Deneb füllt diese
              {"name": "summary", "source": "table",
               "transform": [{"type": "aggregate", "fields": ["v"], "ops": ["sum"], "as": ["total"]}]} ],
  "scales": [ {"name": "x", "type": "band", "domain": {"data": "table", "field": "k"}, "range": "width"},
              {"name": "y", "type": "linear", "domain": {"data": "table", "field": "v"}, "range": "height"} ],
  "axes":   [ {"orient": "bottom", "scale": "x"}, {"orient": "left", "scale": "y"} ],
  "marks":  [ {"type": "rect", "from": {"data": "table"}, "encode": {"update": {
                "x": {"scale": "x", "field": "k"}, "width": {"scale": "x", "band": 1},
                "y": {"scale": "y", "field": "v"}, "y2": {"scale": "y", "value": 0}}}} ]
}
```

- **Top-Level:** `$schema width height padding autosize background config signals data scales projections axes legends title marks encode usermeta`.
- **Signal:** `{name, value|init|update, on:[{events, update}], bind}` – `init`/`update` schließen sich aus.
  Event-Selektoren: `"rect:click"`, `"@markName:mouseover"`, `"window"`, `"wheel!"` (`!` = `preventDefault`), `"pointerdown"`, `"[pointerdown, window:pointerup] > window:pointermove"` (Drag-between).
- **Reaktive Datasets** (das, was VL NICHT kann): `data` mit `on:[{trigger, insert|remove|toggle|modify}]` – siehe Collapse-Pattern in `reference/vega.md`.
- Encode-Sets: `enter` (einmalig) · `update` (bei jeder Änderung – hier landet das meiste) · `exit` · `hover`.
- Voll-Referenz → **`reference/vega.md`**.

## 3 · Transforms – die Arbeitspferde

Reihenfolge zählt (Pipeline). Häufigste, projektrelevante:

| Transform | Zweck | Merke |
|---|---|---|
| `calculate`/`formula` | neues Feld aus Ausdruck | VL: `calculate`, Vega: `formula`(`as`) |
| `filter` | Zeilen wegfiltern | Prädikat-Ausdruck |
| `aggregate` | gruppieren + verdichten (**ersetzt** Zeilen) | `groupby`,`ops`,`fields`,`as` |
| `joinaggregate` | Aggregat **als neue Spalte** (Zeilen bleiben) | **Schlüssel** für „Σ neben Detail" |
| `window` | geordnete Lauf-/Rang-Berechnung | `row_number`,`rank`,`lead`,`lag`, Frame `[null,0]`=kumuliert |
| `stack` | Stapelwerte | VL via `y.stack` / Vega-Transform |
| `fold` | wide→long (Spalten→key/value) | `["a","b"]` |
| `pivot` | long→wide | Gegenstück zu fold |
| `lookup` | Join aus zweiter Tabelle | wie SQL-Join |
| `flatten` | Array-Feld → Einzelzeilen | z. B. `dependencies` |

**Aggregate-/joinaggregate-Ops:** `count valid missing distinct sum mean(=average) median q1 q3 min max argmin argmax variance stdev ci0 ci1 product`.
**Window-Ops (zusätzlich):** `row_number rank dense_rank percent_rank cume_dist ntile lead lag first_value last_value nth_value` + alle Aggregate-Ops.

## 4 · Deneb / Power-BI-Besonderheiten (Pflicht in diesem Projekt)

1. **Datenanbindung:** Power BI liefert die Daten als **named data** `{"name":"dataset"}` (VL) bzw. ein `data`-Eintrag ohne `values` (Vega). Lokal/Editor: stattdessen `{"values":[…]}` einbetten.
2. **Container-Größe:** `"width":"container","height":"container"` füllt das Visual (Schrift stabil). Feste Größe → Pixel + `"autosize":{"type":"fit","contains":"padding"}`. Mehrteilige Layouts (h/vconcat/facet) → in Deneb „Scaling: Auto".
3. **PBI-Signale** (nur Raw-Vega): `pbiContainerWidth`/`pbiContainerHeight` werden von Power BI injiziert. Lokal **als Default-Signale ergänzen** (VOR den `height`/`width`-Signalen, die darauf verweisen). Beispiel: Gantt-Vorlage.
4. **`''`-Quoting (häufige Stolperfalle):** Aus `.pbix` extrahierte Specs **verdoppeln einfache Anführungszeichen** in Vega-Ausdrücken (`data(''input'')`). Das ist für Deneb korrekt, aber **invalides Raw-Vega** → lokal `''`→`'` zurückwandeln (nur auf der Render-Kopie, Export-Spec unverändert lassen). Siehe `ganttUnescapeQuotes()` im Builder.
5. **`usermeta`:** wird vom Parser ignoriert; Deneb-Templates legen dort `information`, `dataset` (Feld-Platzhalter), `interactivity` ab. Platzhalter-Konvention dieses Projekts: interne Keys → `vFieldMap` → `__0__`, `__1__`, … (siehe `reference/deneb-powerbi.md`).
6. **Interaktivität:** Tooltips (`"tooltip":true` am Mark) + Cross-Filtering über Denebs `__selected__`-Feld; in den Deneb-Settings aktivieren.

## 5 · Das zentrale Σ-Pattern (synthetische Total-Säule)

Mehrere `aggregate`-Layer auf **derselben** Deneb-Datenquelle **kollidieren**. Stattdessen:

```
joinaggregate (sumStart/sumEnd als neue Spalten)
  → filter "datum.vord === 1"          // genau eine Zeile behalten
  → window row_number (ignorePeers)     // synthetischer Sortier-Slot, z. B. ord=999999
  → gemeinsame, nach 'ord' sortierte X-Achse
```

So entstehen Σ-/Brücken-Slots dynamisch aus den PBI-Feldern (keine eingebackenen
Werte). Referenz-Implementierungen im Builder: `vlBridgeDyn()`, `vlVarintDyn()`.

## 5b · Weitere erprobte Patterns (Details in `reference/vega-lite.md`)
- **Dual-Axis ohne 2. Achse:** zwei Layer-**Gruppen** + `resolve:{scale:{y:'independent'}}` (NICHT flacher Layer – der macht jeden Layer einzeln unabhängig). Bars teilen Skala A, Lines Skala B; Achsen `axis:null` (direkt beschriftet). → `vlColLine`.
- **Overlay-Referenzlinie:** `rule` mit `aggregate:'mean'|'median'` direkt im Encoding (Deneb aggregiert selbst, kein gebackener Wert). → `vStatLayers`.
- **Trellis/Facet:** `facet`+`columns`+`resolve.scale.y` (`shared`=Niveau, `independent`=Form); `data` auf die Facet-Ebene, nicht in `spec`. Deneb-Facet-Export wickelt einen Single-View-Body nur fürs Template, Facet-Feld als eigener `__N__`-Platzhalter.
- **Wasserfall-Gruppen:** Header = reiner Aggregator (Σ der Blätter), trägt nicht zum Laufweg bei → Einklappen erhält die Endsumme. → `wfLeveledModel`.

## 6 · Verifikation (immer, bevor „fertig")

- **Kompiliert?** VL: `vegaLite.compile(JSON.parse(spec)).spec` wirft nicht. Vega: `vega.parse(spec)` wirft nicht.
- **Rendert ohne NaN?** SVG/`view.toSVG()` enthält kein `NaN`/`undefined`. Häufigste NaN-Ursache: `field`-Typ fehlt, Skala-Domain leer, oder Division durch 0 in `calculate`.
- **Im Chart-Builder:** lokal `python -m http.server 8011`, gegen **alle Typen** prüfen, `tests/selftest.js` laufen lassen (muss grün bleiben).
- **Deneb-Template:** keine eingebackenen `values` (`tplBakedRows===0`), alle `__n__`-Platzhalter genutzt, keine rohen Feldnamen-Leaks.

## 7 · Häufige Fehler & Fixes

| Symptom | Ursache | Fix |
|---|---|---|
| `NaN` im SVG | `type` am Encoding fehlt / leere Domain | Field-Type setzen; Domain prüfen |
| „Unrecognized signal name" (Raw-Vega) | externes Signal (z. B. `pbiContainerWidth`) nicht deklariert | als Default-Signal ergänzen |
| Ausdruck parst nicht | `''`-Quoting aus Deneb-Export | `''`→`'` für lokales Rendern |
| Σ-Säule doppelt/falsch | zwei `aggregate`-Layer auf einer Quelle | `joinaggregate`+`filter` (Abschnitt 5) |
| Stapel ungewollt | VL stapelt `bar`/`area` per Default | `"stack": null` bzw. `"stack":"normalize"` für 100 % |
| Labels überlagern Achse | `labelAngle`/`labelLimit` | Achse konfigurieren, ggf. `band`-Padding |
| Deneb-Felder mappen nicht | Platzhalter ≠ `usermeta.dataset` | Platzhalter-Konvention einhalten (`reference/deneb-powerbi.md`) |

## Reference-Dateien (bei Bedarf lesen)
- `reference/vega-lite.md` – Channels, Marks, Transforms (voll), Scales/Axes/Legends, Params/Selections/Conditions, Config.
- `reference/vega.md` – Top-Level, Signals + Event-Streams, reaktive Datasets (Collapse/Toggle), Marks/Encode, Expressions.
- `reference/deneb-powerbi.md` – Deneb-Dataset/usermeta, pbiContainer-Signale, `''`-Quoting, Platzhalter-Konvention, Cross-Filter/Tooltips, Builder-Funktionslandkarte.
