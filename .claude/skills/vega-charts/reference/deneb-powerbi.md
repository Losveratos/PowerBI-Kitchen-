# Deneb / Power BI · Referenz (projektspezifisch)

Deneb ist das Power-BI-Custom-Visual, das Vega-/Vega-Lite-Specs rendert. Dieses
Projekt (`business-chart-builder.html`) erzeugt daraus Templates. Wichtigste Regeln,
die Vega/Vega-Lite hier von „nur im Editor" zu „läuft in Power BI" machen.

## 1 · Datenanbindung
- **Vega-Lite:** `"data": {"name": "dataset"}` – Power BI füllt `dataset` aus den Feldern im „Values"-Bereich.
- **Vega:** ein `data`-Eintrag `{"name":"dataset"}` ohne `values`.
- **Lokal / Vega-Editor:** stattdessen `"values":[…]` einbetten ODER per Runtime
  `view.insert('dataset', rows)`. Im Template dürfen **keine** `values` eingebacken sein
  (Builder-Check `tplBakedRows(tpl)===0`).

## 2 · Container-Signale (nur Raw-Vega)
Power BI injiziert `pbiContainerWidth` / `pbiContainerHeight`. Die Gantt-Vorlage
nutzt sie in `height`/`width`-Signalen:
```json
{"name":"height","update":"pbiContainerHeight-65"},
{"name":"width","update":"pbiContainerWidth"}
```
**Lokal:** vor diesen Signalen Default-Werte ergänzen, sonst „Unrecognized signal name":
```js
spec.signals = [{name:'pbiContainerWidth',value:W},{name:'pbiContainerHeight',value:H}].concat(spec.signals);
```

## 3 · `''`-Quoting (die Stolperfalle bei .pbix-Exporten)
Aus `.pbix` extrahierte Specs **verdoppeln einfache Anführungszeichen** in Vega-
Ausdrücken: `"length(data(''input''))"`. Das ist Deneb/Power-BI-Konvention und
**dort korrekt**, aber **invalides Raw-Vega**. Für lokales Rendern `''`→`'`
zurückwandeln – **nur auf der Render-Kopie**, die Export-/Template-Datei bleibt
unverändert. Sicher, weil alle Quote-Läufe gerade sind (`''`=`'`, `''''`=leerer
String-Literal). Implementierung: `ganttUnescapeQuotes()` in `business-chart-builder.html`.

## 4 · Deneb-Template-Format (`usermeta`)
Ein Template ist ein VL/Vega-Spec **plus** `usermeta`:
```json
"usermeta": {
  "information": {"name":…, "description":…, "author":…, "uuid":…, "generated":…},
  "deneb": {"build":…, "metaVersion":1, "provider":"vegaLite", "providerVersion":"5.16.3"},
  "interactivity": {"tooltip":true, "contextMenu":true, "selection":false, "highlight":false, "dataPointLimit":60},
  "dataset": [ {"key":"__0__","name":"Kategorie","description":…,"type":"text","kind":"column"}, … ]
}
```
- `dataset[*].key` = **Platzhalter** (`__0__`, `__1__`, …), die im Spec-Body stehen.
- `type`: `text|numeric|dateTime|boolean` · `kind`: `column` (row-level) | `measure` (aggregiert).
- **Boxplot/Verteilung:** Wert als `column`, NICHT `measure` (sonst aggregiert PBI vorab).
- `FC`-Flag o. Ä. als `numeric column` (1/0).
- Import in Deneb: „Neue Spezifikation → Aus Vorlage erstellen → Importieren", dann Felder zuordnen.

## 5 · Platzhalter-Konvention dieses Projekts
Spec-Funktionen nutzen **interne Keys** (`k,p,r,r2,fc,v,typ,serie,idx,x,y,g`):
```
interne Keys → vFieldMap()/F() → echte Feldnamen → denebTemplate() → Platzhalter __0__,__1__,…
```
- `remapSpec(node, map)` schreibt `field`-Referenzen, `values`-Schlüssel, `groupby`,
  und Feldnamen in `calculate`/`filter`/`test`-Ausdrücken um (Punkt- UND Klammer-Notation).
- Im Template müssen **alle** Platzhalter im Body vorkommen und es darf **keine** rohen
  Feldnamen-Leaks geben (Selftest B prüft das).

## 6 · Dynamische Σ-/Brücken-Slots (Kernmuster)
Power BI liefert Rohzeilen; Summen-/Total-Säulen müssen **im Spec** entstehen –
ohne eingebackene Werte und ohne kollidierende `aggregate`-Layer:
```
joinaggregate (sumStart/sumEnd/sumD … als Spalten)
  → filter "datum.vord === 1"          // genau eine Zeile je Σ-Slot
  → window row_number (ignorePeers)     // synthetischer ord-Wert, z. B. 999999
  → gemeinsame, nach 'ord' sortierte X-Achse  (Σ landet rechts außen)
```
Referenzen im Builder: `vlBridgeDyn()` (Brücke), `vlVarintDyn()` (integrierte Varianz,
4-Tier-vconcat mit Kumulierung via `window` + `frame:[null,0]`).

## 7 · Interaktivität in Deneb
- **Tooltip:** `"tooltip":true` am Mark; in den Deneb-Settings den Tooltip-Handler aktivieren.
- **Cross-Filtering:** Deneb pflegt ein `__selected__`-Feld je Zeile; Bedingung
  `"opacity":{"condition":{"test":"datum.__selected__==='off'","value":0.3},"value":1}`.
  In den Deneb-Settings „Expose cross-filtering values for dataset rows" aktivieren.
- **Klickbares Collapse/Zoom** (wie Gantt): nur Raw-Vega via Signale + reaktive Datasets
  (siehe `reference/vega.md`). Vega-Lite kann das nicht – dort ist Collapse eine
  Builder-seitige Darstellungsoption, das Template exportiert alle Zeilen.

## 7b · Trellis-Facet-Export (Deneb-only Small Multiples)
Einen Single-View-Body (columns/line/bars) **nur fürs Deneb-Template** in einen
`facet`-Operator wickeln – die eingebettete Vorschau bleibt EINE Kachel (das
Facet-Feld liefert erst Power BI):
```js
if(deneb && facetField && singleView){
  const data = body.data; const inner = {...body}; delete inner.data;
  body = { data, facet:{field:facetField, type:'nominal', header:{…}},
           columns:N, spec:inner, resolve:{scale:{y:'shared'}} };
}
```
Das Facet-Feld als **eigenen** `__N__`-`column`-Platzhalter in `denebTemplate`
führen (zu `defs`/`nameToPh` hinzufügen, damit `remapSpec` den Literal-Namen
ersetzt) und in `usermeta.dataset` deklarieren – sonst Roh-Feldname-Leak. Eine
in-app Trellis ist dagegen der Typ Small Multiples (`vlMultiples`, eigener
`srows`-Datensatz).

## 8 · Builder-Funktionslandkarte (`business-chart-builder.html`)
| Funktion | Zweck |
|---|---|
| `vegaSpecCore(deneb)` | dispatch nach `state.type` → VL-Body (oder `null` für SVG-only/gantt) |
| `vegaSpec(deneb)` | Body + Schema/Config/Size/Interaktivität/usermeta; **Facet-Wrap** (deneb-only) |
| `denebTemplate()` | VL-Spec → Platzhalter-Template (Gantt: rohe Raw-Vega-Spec unverändert) |
| `vFieldMap()` / `F(key)` | interne Keys → Feldnamen (User-überschreibbar) |
| `remapSpec(node,map)` | Feldnamen/Platzhalter im Spec umschreiben |
| `vlBridgeDyn` / `vlVarintDyn` | dynamische Σ-/Brücken-Templates |
| `vlMultiples` | Trellis (`facet` by serie); `state.multiCols` + `multiScale` (shared/independent) |
| `vlColLine` / `vBarMarkScen` | Dual-Axis-Kombi (Tausch + 2 Layer-Gruppen/`resolve`); Säule in beliebiger Szenario-Notation |
| `vStatLayers` / `statLineH/V` | Ø-/Median-Overlay (`rule`+`aggregate`) VL + SVG |
| `wfLeveledModel` / `renderWfLeveledV` | Wasserfall mit verschachtelten Unter-Ebenen (Σ-erhaltend) |
| `tblHiddenSet` / `wfApplyCollapse` | Collapsible-Zeilen Tabelle/Wasserfall |
| `loadVegaLibs()` | vega/vega-lite/vega-embed **lokal** (assets/vega/, kein CDN; CSP) |
| `loadGanttSpec` / `buildGanttSpec` / `ganttUnescapeQuotes` | Raw-Vega-Gantt-Pfad |
| `tests/selftest.js` | A) alle Typen render+kompilieren · B/C) Σ · …G) Gantt · H) Collapse/Ebenen · I) Trellis · J) Ø/Median · K) Dual-Axis · L) Facet-Export (264/264) |

## 9 · Checkliste „neuen Diagrammtyp hinzufügen"
1. Renderer `renderXxx(rows)` → `{svg,W,H}` (SVG-Vorschau, kein `NaN`).
2. In `buildChart()` einhängen (dispatch nach `state.type`).
3. Typ-Kachel in `TYPE_GROUPS` + Icon in `typeIcon()`.
4. Felder in `vFieldDefs()` (für „Benötigte Daten" + Template-Platzhalter).
5. VL-Body `vlXxx(deneb)` + in `vegaSpecCore` einhängen (oder bewusst SVG-only → in Selftest `SVG_ONLY`).
6. Lokal `python -m http.server 8011`, gegen **alle Typen** prüfen, `selftest.js` grün.
7. Selftest-Sektion ergänzen, wenn der Typ neue Eigenheiten hat.

## Offizielle Docs
- Vega-Lite: https://vega.github.io/vega-lite/docs/ · Editor: https://vega.github.io/editor/
- Vega: https://vega.github.io/vega/docs/
- Deneb: https://deneb-viz.github.io/
