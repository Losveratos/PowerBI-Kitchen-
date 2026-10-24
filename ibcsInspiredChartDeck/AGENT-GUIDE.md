# AGENT-GUIDE · ChartKitchen byDatenWG

**Zielgruppe: KI-Agenten** (Claude, Copilot, Cursor, GPT …), die Power-BI-Berichte
mit diesem Visual bauen, konfigurieren oder debuggen. Diese Datei macht das
Visual maschinen-konfigurierbar: exakte Property-Namen fürs PBIR-Authoring,
Datenvertrag mit Semantik, versteckte persistierte Zustände und die bekannten
Fallen. Menschen lesen besser die [Doku](../chartkitchen-doku.html); die
maschinenlesbare Quelle der Wahrheit ist [capabilities.json](capabilities.json),
Setting-Beschreibungen stehen in [src/settings.ts](src/settings.ts).
**Property-Referenz wird generiert: `npm run guide`** (Prüfung: `npm run guide:check`) — die Tabellen
im Abschnitt „Settings-Referenz“ nie von Hand ändern, sondern `settings.ts`/`capabilities.json` anpassen.

Stand: **1.52.4.0** (23.10.2026). Bei Versionssprüngen: CHANGELOG.md zuerst lesen.

**Neu in 1.52.1:** Der Titel nennt die Einheit einmal in Langform („Nettoumsatz in Mio. EUR je Kanal“), kein
Szenario-Suffix, wenn `ibcsTitle.period` schon AC/PY/PL/BU/FC nennt; „AC&FC“ bei Forecast-Anteil. Zahlen in Grafiken
höchstens 3 Ziffern („162K“), Null als „0“, KPI-Karten Wert und Δ mit gleichen Dezimalen, C05-Stufen in echter Höhe,
C08 alle absoluten Linien gleich dick (PL hohl, FC gestrichelt). Neue Properties: `labels.unitSuffix` (bool,
Standard true), `chart.bridgeBreak` (bool, Standard false), `chart.stackLegendDirect` (bool, Standard true).
Test: `npm run test:notation`.

**Neu in 1.52 (Standardverhalten, keine neue Property):** Skalierung nach IBCS 2.0 /
ISO 24896. Absolute Δ-Panels (ΔBasis, ΔBasis2, ΔPY-Stufe im GuV-Wasserfall) haben
den px-je-Einheit-Maßstab der Basis; ihre Höhe folgt der Δ-Spanne, `fixedVarMax`
wirkt weiter als Untergrenze der Δ-Spanne. Zu kleine Abweichungen werden um einen
runden Faktor vergrößert und ausgewiesen (Titel „ΔPY ×4“, Skalenband,
`data-icd="scale-zoom"` mit `data-factor`). C05: Monatssäulen auf der Ankerskala
(sonst „Monatssäulen ×f“), alle Breiten 2/3. C12: Basis-Anker nach Basis gefüllt.
Slots für absolute Werte 2/3 statt 0,62. Δ-Zahlen höchstens 3 Ziffern, keine
signierte Null, echtes Minus. Scatter: Bruchzeichen `axis-break-x|y`, wenn eine
Achse die Null nicht enthält. Tabelle (Δ-Balken), GuV-Statement (Δ-Spalte) und das
Brücken-Panel (`waterfallStyle`) laufen ebenfalls im Basismaßstab, ein Faktor ≠ 1
steht im Spaltenkopf bzw. Titel (`scale-zoom-table`, `scale-zoom-pnl`,
`scale-zoom-bridge`); der ⤢-Zoom einer Kachel nennt seine Skala gegenüber der
Übersicht (`zoom-scale`). C05: PY-Dreieck nur bei AC + PY + PL. Neue Property
`chart.chipMenu` (bool, Standard false): In-Chart-Bedienelemente
(`[data-ck-ctl]`) hinter ☰ (`data-icd="chip-menu"`, Sitzungszustand). 686
resjson-Keys je Sprache. Geometrie-Test: `npm run test:scale`.

## Steckbrief

| | |
| --- | --- |
| GUID | `chartKitchenByDatenWGD9DE0F7AD44D41058672C6FBF6F5A18D` |
| visual.json `visualType` | GUID wie oben (Import ersetzt ältere Version automatisch) |
| Aktuelles Paket | `dist/*.pbiviz` · stabiler Download: `https://datenwgknowledgekitchen.com/downloads/chartkitchen-byDatenWG-latest.pbiviz` |
| Datenlimit | `dataReductionAlgorithm window 1000` + `fetchMoreData` (ab 1.49): weitere Segmente werden nachgeladen, Sicherheitsgrenze 30.000 Kategoriezeilen; Kappung wird im Chart gemeldet |
| Lizenz | MIT · keine externen Calls, kein Storage, kein Telemetrie |

## Feld-Rollen (Datenvertrag)

Interne Rollennamen für PBIR (`projections`) — Reihenfolge egal, Semantik nicht:

| Rolle (intern) | Kind | Semantik + Fallstricke |
| --- | --- | --- |
| `category` | Grouping | Achse/Struktur. Hierarchie erlaubt (mehrere Spalten → Drill + Tabellen-Baum). Bei Datum: „Mär 26"-Format automatisch. **Optional ab 1.41**: ohne Kategorie rendert das Visual eine einzelne Kachel/Säule, überschrieben mit dem Namen der AC-Measure (KPI-Karte „eine große Zahl") |
| `actual` | Measure | AC. Pflicht (oder `forecast`) |
| `previousYear` | Measure | PY |
| `plan` | Measure | PL |
| `forecast` | Measure | FC — schraffiert. Nur gezeigt, wo AC fehlt, AUSSER `chart.acFcSplit` ≠ `off` (dann Splitsäule AC-Sockel + FC-Aufsatz) |
| `fcFlag` | Grouping | Alternative zur FC-Measure: `1`/true = AC-Wert ist Forecast · `2`/„vorläufig"/„prelim" = vorläufiges Ist (solide + dünne Überlager-Schraffur) · `0`/leer = Ist |
| `prevForecast` | Measure | FC des Vorzyklus — aktiviert Basis `fcrev` (ΔFC Vm) |
| `benchmark` | Measure | BM-Marker (Strich) + Karten-Bullet |
| `lineMeasure` | Measure | Kombi-Linie über Säulen, eigene Skala (nur `columns`) |
| `series` | Grouping | Stacking — schaltet Columns/Bars auf gestapelt um |
| `colgroup` | Grouping | Matrix-Spaltengruppen (max. 2 Ebenen) — macht aus `table` die Matrix |
| `multiples` | Grouping | Small Multiples (Kacheln, gleiche Skala) |
| `rowType` | Grouping | Waterfall/GuV: `sum` = Zwischensumme/Anker · `delta` = Bewegung · `pct` = Margenzeile (%-Anzeige, Δ in Pp) |
| `xValue` | Measure | X-Achse im Scatter/Bubble (Y = `actual`); Pflicht für `orientation = scatter` |
| `xPrevious` | Measure | X-Achse VJ (Scatter, optional): macht die PY-Pfeile zu 2D-Bewegungen (`scatterArrows`) |
| `bubbleSize` | Measure | Blasengröße im Scatter (optional) — macht daraus ein Bubble-Chart (Vorlage C10) |
| `trend` | Grouping | Zeitachse je Karte: macht KPI-Karten zu Zeitreihen (`cardTrendChart`), wirkt NUR im `cards`-Modus |
| `comments` | Measure (Text) | nummerierte Marker ①② + Fußnoten-Panel |
| `filterInfo` | Measure (Text) | Filterkontext-Text für die Fußzeile |

**DAX-Regel (wichtigste Falle überhaupt):** Ein Measure, das für nicht
existierende Kategorie-Kombinationen non-blank liefert (`COALESCE(x, 0)`,
`+0`), zwingt Power BI, diese Kombinationen ins DataView zu schicken →
Geisterzeilen/Kreuzprodukte. Wächter-Muster:
`IF(COUNTROWS('Fakt') > 0, COALESCE(MAX('Fakt'[x]), 0))`.

## Modus-Wahl (chart.orientation)

| Aufgabe | orientation | Minimal nötig |
| --- | --- | --- |
| Zeitreihe (Monate) | `columns` | category + actual |
| Struktur-Vergleich | `bars` | category + actual |
| Lange Zeitreihe (>24 Punkte) | `line` | category + actual |
| GuV-Wasserfall | `waterfall` | + rowType (`sum`/`delta`) |
| Monats-Brücke PY/PL→AC | `intwaterfall` | + previousYear oder plan |
| Treiber-Brücke je Kategorie | `catbridge` | + previousYear oder plan |
| Kennzahlen-Tabelle / Matrix | `table` | (+ colgroup für Matrix) |
| P&L-Statement mit Kaskade | `pnl` | + rowType empfohlen |
| KPI-Kacheln | `cards` | category + actual |
| Pareto / Dumbbell / Slope | `pareto` / `dumbbell` / `slope` | category + actual (+ Basis) |

## Neuerungen je Version (handgeschrieben, neueste zuerst)

**Neu in 1.51:** Hub-Polish, keine neuen Properties. (1) Hub-Start: oben der
Akzent-Knopf **„🚀 Loslegen“** (`hub-start`, Checkliste ① Felder ② Template
③ Feinschliff, ✓ live aus den gebundenen Rollen, persistiert NICHTS), darunter
die vier Knöpfe wie in 1.50. (2) **Vorlagen-Galerie nach Zweck**: Gruppen
`time` (C01 C03 C05 C08) · `structure` (C02 C04 C06) · `correlation` (C09
C10) · `bridges` (C12 C13), Überschriften `data-icd="hub-tpl-group-<id>"`,
Kacheln weiter `hub-tpl-<Code>` mit Finance-Titel + Nutzen-Zeile + C-Badge;
Klick schreibt unverändert EINEN Merge. (3) **Fußleiste jeder Hub-Seite**
(`hub-foot`): zuerst HD · Full HD · UHD (`hub-size-compact|fullhd|presentation`
= `labels.fontPreset`, Klick = ein Merge `labels.fontPreset`, Echo-Guard TTL 5,
Klick auf das aktive Preset schreibt nichts), dann „📖 Doku öffnen“
(`hub-docs`, `host.launchUrl` → `chartkitchen-doku.html` bei `de*`-Locale,
sonst `chartkitchen-doku_en.html`; fehlt `launchUrl`, entfällt der Knopf).
(4) **Feld-Intro** (Hub-Seite und Modus `fields`): alle 19 Rollen mit ✓
(`data-fi`/`data-on`), Prämissen-Boxen `fi-notation` und `fi-axis`,
Seiten `fi-prev`/`fi-next` (transient). (5) **„☰ Start“** ist im
Bearbeitungsmodus dauerhaft sichtbar (Opacity 0,5, Hover/Fokus 1); verdeckt
die Chip-Leiste an `bottom: 4px` Text des Charts, sitzt sie eine Stufe höher
(`data-lift="1"`). (6) Letzte Tour-Karte: `hub-tour-done` = zurück zum Start.
677 resjson-Keys je Sprache. Tests c230–c236.

**Neu in 1.50:** Start-Hub. (1) `emptyState.mode` hat den neuen Wert und
Default **`hub`**: Leer-Zustand im Bearbeitungsmodus = vier Knöpfe „Was kann
das Visual?“ (Feature-Tour, 11 Karten) · „Templates“ (Vorlagen-Galerie C01–C13
mit Mini-Vorschau) · „Demo ansehen“ (die bisherige Galerie) · „Felder
erklären“ (Feld-Intro); Unterseiten mit „← Zurück“/Esc. Navigation ist
Sitzungszustand und persistiert NICHTS. `demo` (= Verhalten bis 1.49),
`fields`, `message` unverändert; Leser (`viewMode` 0) und Exporte
(`allowInteractions` false) sehen nie den Hub. Für PBIR: wer die alte
Galerie will, setzt `emptyState.mode = "demo"`. (2) **Galerie-Klick** schreibt
in EINEM Merge `chart.template` + `templateApplied` + das Preset (wie das
Dropdown; `template` ist im Echo-Guard mitgeführt, ein stale Update mit altem
Dropdown-Wert kippt nichts) — auch für die bereits aktive Vorlage
(= Re-Apply). Ohne Felder wird gespeichert und greift beim Binden. (3) Mit
gebundenen Daten im Bearbeitungsmodus (`viewMode` ≥ 1, interaktiv) liegt
unten links eine HTML-Chip-Leiste (`data-icd="chip-bar"`): **„☰ Start“**
(`hub-chip`, ab 1.51 dauerhaft dezent sichtbar) öffnet den Hub als Overlay-SVG
(`hub-overlay`) über dem nur verborgenen Chart; Schließen zeigt ihn
unverändert, außer im Overlay wurde etwas umgestellt (dann ein Re-Render).
**„↺ Zum Template zurück“** (`tpl-reset`) erscheint, wenn `chart.template`
gesetzt ist und eine Preset-Property abweicht; Klick = ein Merge mit Preset +
`templateApplied`. Ohne gemeldeten `viewMode` keine Chips. 601 resjson-Keys
je Sprache. Tests c220–c229.

**Neu in 1.49:** Sechs Muster aus dem P&L-Visual. (1) **IBCS-Chart-Vorlagen**
`chart.template` (erste Position der Chart-Karte; `off` · `C01`…`C06` ·
`C08`…`C10` · `C12` · `C13`) + versteckt `chart.templateApplied` (text):
Eine Vorlage, die von `templateApplied` abweicht, setzt ihre Properties
lokal UND in EINEM persistProperties-Merge (inkl. `templateApplied`);
Echo-Guard TTL 5 + Session-Guard (kein Re-Apply-Loop bei verlorenem Echo);
danach alles frei änderbar. `off` schreibt nur `templateApplied: "off"`;
Default (Vorlage aus, nichts angewandt) schreibt nie. Für PBIR: entweder
die Einzel-Properties direkt setzen ODER `template` + `templateApplied`
gleich setzen (dann wird nichts angewandt) — nur `template` ohne
`templateApplied` wendet die Vorlage beim ersten Rendern an. Mapping:

| Vorlage | Properties (Objekt `chart`) |
| --- | --- |
| C01 Gestapelte Säulen | orientation=columns · comparisonMode=auto · showAbs/showRel=false · dualVariance=false · waterfallStyle=false (Stapel über Rolle `series`) |
| C02 Gestapelte Balken | wie C01 mit orientation=bars |
| C03 Säulen + Varianzen | orientation=columns · comparisonMode=py · showAbs/showRel=true · dualVariance=false · waterfallStyle=false |
| C04 Balken + Varianzen | orientation=bars · comparisonMode=plan · showAbs/showRel=true · dualVariance=false · waterfallStyle=false |
| C05 Integrierte Brücke | orientation=intwaterfall · comparisonMode=py · showAbs/showRel=true · dualVariance=false |
| C06 Kategorie-Brücke vertikal | orientation=catbridge · bridgeOrientation=columns · comparisonMode=py · showAbs/showRel=true · dualVariance=false |
| C08 Linie | orientation=line · comparisonMode=auto · showAbs=true · showRel=false · dualVariance=false |
| C09 Scatter | orientation=scatter · comparisonMode=auto · scatterQuadrant=mean · scatterColorBy=single |
| C10 Bubble | wie C09 + scatterSizeLegend=true (Rolle `bubbleSize` binden) |
| C12 Waterfall | orientation=waterfall · comparisonMode=auto · showAbs/showRel=true · dualVariance=false |
| C13 Small Multiples | multiplesTotal=true · multiplesSameScale=true (orientation bleibt; Rolle `multiples` binden) |

**Nicht enthalten:** C07 (Fläche/Area) und C11 (Verteilung/Boxplot) — die
Darstellungsformen gibt es im Visual nicht (siehe BACKLOG).
(2) **fetchMoreData** — siehe Falle 7. (3) **Lesezeichen:**
`registerOnSelectCallback` übernimmt die vom Host wiederhergestellte
Auswahl (Dimmen wie nach Klick, `[]` hebt auf). (4) **Gesperrte Chips:**
wirkungslose In-Chart-Knöpfe tragen `data-icd-locked="1"`,
`aria-disabled`, Opacity 0.4 und den Grund im Tooltip; Klick persistiert
nichts (YTD auf rowType/1 Periode, ⇅ bei identischer Wirkungs-Reihenfolge,
⚠ ohne verdichtbare Zeile, Karten-Sortierung ohne Vergleichswert/1 Karte,
Brücken-Toolbar im Hinweis-Zustand). (5) **Leer-Zustand:**
`emptyState.mode` (`demo` Default = bisherige Galerie · `fields` Feld-Intro ·
`message` eigene Nachricht) wirkt nur im Bearbeitungsmodus mit
Interaktion; Umschalt-Knöpfe persistieren `emptyState.mode` (Echo-Guard
TTL 5); Leser/Export unverändert. (6) **Hochkontrast:** Host-Palette mit
Fallback, `foregroundSelected` für EMPHASIZE-Rahmen/Hover, Status als
Muster (gut gefüllt · schlecht hohl · unwesentlich gestrichelt) auch in
KPI-Karten und Scatter-Status, PY-Linie gestrichelt. 548 resjson-Keys je
Sprache. Tests c184–c219.


**Neu in 1.48:** Scatter-Ausbau. Small Multiples sind echte Scatter-Kacheln
mit gemeinsamer Skala (Quadranten/refLines/Blasengröße deckweit; Σ- und
Top-N-Rest-Kachel im Scatter aus). `chart.scatterColorBy` += `group`
(6 gedeckte Farben ohne Rot/Grün, Legende mit „+n weitere"). Neue Rolle
`xPrevious` („X-Achse VJ (Scatter)", Measure, max 1) für 2D-Bewegungspfeile.
Neue chart-Settings (Reihenfolge = Pane-Reihenfolge): `scatterShapes`,
`scatterArrows`, `scatterTrend` (off|linear), `scatterTrendR2`,
`scatterSizeLegend` (Default an), `scatterQuadLabelTR/TL/BL/BR` (Text),
`scatterPlay` (Rosling-Animation: category = Frame-Achse, je Frame ein
Punkt pro Serie, statisch letzte Periode; Laufzustand transient, KEIN
persistProperties). Neue scale-Gruppe „Scatter-Achsen": `xMin/xMax/yMin/
yMax` (Text, parseRefValue: leer=auto, 0 gültig, k/M/B) + `xLogScale`/
`yLogScale` (nur wenn alles > 0, sonst linear + Edit-Hinweis; bei SM eine
deckweite Entscheidung; mean/median im Datenraum). Rechteck-Auswahl =
Marquee auf leerer Plotfläche → EIN selectionManager.select(ids, false).
Pane-Gates: Formen nur bei group, Pfeile nur mit PY, R² nur bei Trend,
Größen-Legende nur mit bubbleSize, Ecklabels nur bei aktiven Quadranten.
Tests c175–c183. 503 resjson-Keys je Sprache.

**Neu in 1.47:** 13. Chart-Modus `scatter` (Scatter/Bubble: Y = AC, X = neue
Measure-Rolle `xValue`, optionale Rolle `bubbleSize`, Quadranten
`chart.scatterQuadrant` off/mean/median, Färbung `chart.scatterColorBy`
single/status, `scale.xRefLine`); neue Grouping-Rolle `trend` (Zeit) macht
KPI-Karten zu Zeitreihen (`chart.cardTrendChart` off/sparkline/columns,
`chart.cardTrendValue` last/sum — wirkt NUR im cards-Modus, andere Modi
aggregieren die Trend-Zeilen weg); Kategorie-Brücke mit
`chart.bridgeOrientation` auto/bars/columns (columns = vertikale
Säulen-Kaskade); `chart.autoExpandHierarchy` (Default an) klappt bei
Mehrfeld-Kategorie in Tabelle/GuV die Drill-Hierarchie automatisch auf
(host.drill, je Feld-Konstellation einmal — manuelles Hochklappen bleibt).

**Panel-Umbau 1.45 (nur Anzeige, alle Property-Namen unverändert):** Karten-
Reihenfolge jetzt Chart → IBCS-Titel → Datenbeschriftungen → Kategorienachse →
IBCS-Farben → Skala → Kommentare → Leer-Zustand. `chart.orientation` heißt im
Pane „Chart-Typ". Die Chart-Karte ist neu gruppiert: Chart-Typ · Vergleich &
Abweichung · Daten & Zeit · Interaktion im Bericht · Darstellung · Small
Multiples · Brücke · Tabelle · KPI-Karten. Modus-Chips (✎/⚙/⇄) beenden ihren
Modus per Klick (persistiert). Δ% zeigt „n.a." bei Basis 0 oder
Vorzeichenwechsel; Werte und Varianzen teilen EINEN Einheitenmaßstab.

## Settings-Referenz

PBIR: `visual.json → objects.<objekt>.properties.<property>`. Enums als String, Farben als
`{"solid":{"color":"#RRGGBB"}}`. Die Tabellen zwischen den Markern sind **generiert**
(`npm run guide`; Prüfung `npm run guide:check`) — Erfahrungswissen dazu steht danach unter
„Hinweise zu einzelnen Properties“ und „Persistierte Zustände“.

<!-- gen:properties:start -->
Generiert von `test/gen-agent-guide.js` (`npm run guide`) aus `capabilities.json` und
`src/settings.ts`, Paketstand **1.52.4.0**. Nicht von Hand ändern — Korrekturen gehören in
`settings.ts`/`capabilities.json` (bzw. in die handgeschriebenen Abschnitte außerhalb dieses Blocks).
Beschreibungen sind die deutschen Pane-Tooltips, in Tabellen auf ganze Sätze bis ca. 220 Zeichen
gekürzt (`…` = gekürzt, Volltext in `src/settings.ts`). Enum-Labels stammen aus der
deutschen Oberfläche. „Standard“ ist der Wert, der ohne Eintrag in `visual.json` gilt.

### Rollen-Index

`projections`-Namen aus `capabilities.json`; Semantik und Fallstricke siehe „Feld-Rollen (Datenvertrag)“.

| Rolle | Kind | Anzeigename (DE) | Max. | Datentyp |
| --- | --- | --- | --- | --- |
| `category` | Grouping | Kategorie | 1 | beliebig |
| `actual` | Measure | Ist (AC) | 1 | numeric / integer |
| `previousYear` | Measure | Vorjahr (PY) | 1 | numeric / integer |
| `plan` | Measure | Plan / Budget (PL) | 1 | numeric / integer |
| `forecast` | Measure | Forecast (FC) | 1 | numeric / integer |
| `benchmark` | Measure | Benchmark (BM) | 1 | numeric / integer |
| `prevForecast` | Measure | FC Vormonat (Revision) | 1 | numeric / integer |
| `lineMeasure` | Measure | Linie (Kombi) | 1 | numeric / integer |
| `xValue` | Measure | X-Achse (Scatter) | 1 | numeric / integer |
| `xPrevious` | Measure | X-Achse VJ (Scatter, optional) | 1 | numeric / integer |
| `bubbleSize` | Measure | Blasengröße (optional) | 1 | numeric / integer |
| `series` | Grouping | Stack-Serie (Gestapelt) | 1 | beliebig |
| `colgroup` | Grouping | Spalten (Matrix) | 2 | beliebig |
| `filterInfo` | Measure | Filter-Info (Fußzeile) | 1 | text |
| `comments` | Measure | Kommentare | 1 | beliebig |
| `multiples` | Grouping | Small Multiples | 1 | beliebig |
| `rowType` | Grouping | Waterfall-Typ (sum/delta) | 1 | beliebig |
| `trend` | Grouping | Trend (Zeit) | 1 | beliebig |
| `fcFlag` | Grouping | Forecast-Flag (0=Ist · 1=FC · 2=vorläufig) | 1 | beliebig |

### Objekt `chart` (Karte „Chart“)

**Chart-Typ**

| Property | Typ | Standard | Werte / Beschreibung |
| --- | --- | --- | --- |
| `template` | enum | `off` | `off` · `C01` · `C02` · `C03` · `C04` · `C05` · `C06` · `C08` · `C09` · `C10` · `C12` · `C13` — Startpunkt nach den IBCS-Chart-Templates: setzt Chart-Typ, Vergleichsbasis, Abweichungs-Panels und die passenden Schalter in einem Schritt — danach ist jede … |
| `orientation` | enum | `columns` | `columns` · `bars` · `line` · `waterfall` · `intwaterfall` · `catbridge` · `table` · `pareto` · `dumbbell` · `slope` · `scatter` · `cards` · `pnl` |
| `smartStart` | bool | `true` | Zeigt einen dezenten Vorschlags-Chip oben links im Chart, wenn die gebundenen Felder eindeutig auf einen passenderen Modus hindeuten (z. B. Datum + AC + PL → Säulen mit ΔPL) … |

**Vergleich & Abweichung**

| Property | Typ | Standard | Werte / Beschreibung |
| --- | --- | --- | --- |
| `comparisonMode` | enum | `auto` | `auto` · `py` · `plan` · `fcrev` — Basis für die Abweichungs-Panels. Auto: PL wenn vorhanden, sonst PY. |
| `showAbsoluteVariance` | bool | `true` | – |
| `showRelativeVariance` | bool | `true` | – |
| `dualVariance` | bool | `false` | Zeigt zusätzlich die Abweichungs-Panels zur zweiten Basis — ΔPL und ΔPY gleichzeitig (benötigt PY und PL). |
| `pyTriangle` | bool | `true` | IBCS-Notation bei drei Szenarien: Sind AC, PY und PL gebunden, wird das Vorjahr als graues Dreieck (▶) am Säulen-/Balkenrand auf PY-Höhe gezeigt statt als dritte Säule — weniger überladen … |
| `invert` | bool | `false` | Für Kosten-KPIs: Mehrwert ist schlecht (rot), Minderwert ist gut (grün). |
| `invertList` | text | leer | Kommagetrennte Kategorien, deren Wertung umgekehrt wird (z. B. Kosten-Zeilen neben Umsatz-Zeilen in KPI-Karten oder der GuV-Tabelle). Wirkt zusätzlich zum globalen Invert-Schalter … |
| `materialityAbs` | numeric | `0` | Minimum 0 — Wesentlichkeits-Schwelle: Abweichungen unter diesem absoluten Betrag werden grau statt rot/grün dargestellt (Panels, Wasserfall-Stufen, Tabelle). 0 = aus. |
| `materialityPct` | numeric | `0` | Bereich 0–100 — Wesentlichkeits-Schwelle in Prozent: Abweichungen unter diesem Δ % werden grau dargestellt. Sind beide Schwellen gesetzt, muss eine Abweichung beide überschreiten, um farbig zu sein. 0 = aus. |
| `exceptionOnly` | bool | `false` | Exception-Reporting: Zeigt nur Kategorien, deren Abweichung die Wesentlichkeits-Schwelle überschreitet; alle übrigen werden zu EINER Sammelzeile „Unauffällig (n)" verdichtet — deren Werte werden aufsummiert, die Σ-Kopfzeile bleibt also unverändert … |

**Daten & Zeit**

| Property | Typ | Standard | Werte / Beschreibung |
| --- | --- | --- | --- |
| `cumulative` | bool | `false` | Schaltet alle Panels auf kumulierte Sicht: Säulen, ΔBasis und ΔBasis % zeigen Year-to-Date-Werte. |
| `cumulativeKind` | enum | `ytd` | `ytd` · `qtd` · `r12` — YTD setzt am Fiskaljahres-Beginn zurück, QTD an jedem Quartalsstart, R12 summiert rollierend die letzten 12 Perioden. Monats-Erkennung über die Kategorie-Labels (Jan…Dez, 01…12). |
| `fiscalStart` | numeric | `1` | Bereich 1–12 — 1 = Januar … 12 = Dezember. Bestimmt, wo YTD/QTD zurücksetzen (z. B. 4 für ein Fiskaljahr ab April). |
| `acFcSplit` | enum | `off` | `off` · `full` · `rest` — Ein teilweise abgeschlossener Monat liefert AC UND FC: „Vollmonatsprognose" zeigt den AC-Sockel solide und stockt schraffiert bis zum FC-Wert auf (Säule = max(AC, FC)); „Restmonat" addiert den FC-Wert oben auf AC (Säule = AC + FC) … |
| `topN` | numeric | `0` | Bereich 0–50 — Struktur-Modi (Bars, Kategorie-Brücke, Tabelle, Dumbbell, KPI-Karten): zeigt die N größten Kategorien, der Rest wird aggregiert. 0 = alle. |
| `showTotal` | bool | `true` | Zeigt Summe und Gesamtabweichung als Kopfzeile. |
| `hideBlankCat` | bool | `false` | Blendet Zeilen ohne Kategoriewert aus — sie erscheinen sonst als „(blank)"-Balken, -Zeile oder -KPI-Karte. Standard aus, damit keine Daten unbemerkt verschwinden (Beta-Feedback). |
| `movingAverage` | numeric | `0` | Bereich 0–24 — Dünne Overlay-Linie mit gleitendem Durchschnitt über N Perioden (Columns/Line). 0 = aus. |
| `highlight` | text | leer | Kommagetrennte Kategorie-Namen, die hervorgehoben werden (IBCS EMPHASIZE), z. B. der aktuelle Monat. Oder datengetrieben per Feld „Waterfall-Typ“ (Zeilentyp): Token „emphasize“ — Feld und Liste ergänzen sich. |
| `groupEvery` | numeric | `0` | Bereich 0–50 — Zeichnet eine dünne Trennlinie nach jeweils N Kategorien, quer durch alle Panels — für Struktur-Vergleiche mit natürlichen Untergruppen (z. B. Regionen). 0 = aus. |

**Interaktion im Bericht**

| Property | Typ | Standard | Werte / Beschreibung |
| --- | --- | --- | --- |
| `chartButtons` | bool | `true` | Integrierte/Kategorie-Brücke: zeigt klickbare Buttons oben rechts im Chart — ΔPY/ΔPL-Referenz-Umschalter, ⇅ Sortierung und ▶ Aufbau-Animation … |
| `cumulativeButton` | bool | `false` | Zeigt einen klickbaren „YTD"-Button oben rechts im Chart (Columns/Line) — der Enduser schaltet die kumulierte Sicht direkt im Bericht um; die Wahl wird persistiert. Standard aus. |
| `compareClick` | bool | `false` | Nur Columns/Bars: zwei Säulen/Balken anklicken zeigt die Differenz (absolut + %) als Overlay — Klicks filtern dann nicht mehr quer. Klick ins Leere setzt zurück. Standard aus. |
| `chipMenu` | bool | `false` | Klappt die Bedienleisten im Chart (Sortieren, YTD, Achsenschnitt, ΔPY/ΔPL, ⇅, ▶, Ausnahme-Chip) hinter ein kleines ☰ oben rechts. Ein Klick klappt sie auf, ein zweiter wieder zu; nichts wird gespeichert … |

**Darstellung**

| Property | Typ | Standard | Werte / Beschreibung |
| --- | --- | --- | --- |
| `pinStyle` | enum | `auto` | `auto` · `round` · `square` — Form des Lollipop-Kopfes der Δ%-Pins. „Automatisch" behält den bisherigen Stil je Modus (Säulen/Balken/Wasserfall rund, Brücken und Tabelle quadratisch); „Rund" oder „Quadratisch" vereinheitlichen alle Modi. |
| `deltaIcons` | bool | `false` | Stellt den Δ-Werten in Tabelle und KPI-Karten Richtungspfeile voran: ▲ Anstieg, ▼ Rückgang, ● unwesentlich (unter der Materialitätsschwelle) … |
| `driverNote` | bool | `true` | Kategorie-Brücke: kursive Notiz am größten Treiber („größter Treiber · n % der Gesamtabweichung“) — überlagert den Zeilenbereich, hier abschaltbar. |
| `stackLegendDirect` | bool | `true` | Gestapelte Säulen und Balken: Die Seriennamen stehen direkt am Stapel (Säulen: rechts neben der letzten Säule, Balken: über dem ersten Balken) statt als Schlüssel oben. Passen sie nicht, bleibt der Schlüssel … |
| `exportExpandAll` | bool | `true` | PDF-/PowerPoint-Export und Abo-Mails rendern Tabelle, Matrix und GuV-Statement mit allen Zeilen- und Spalten-Ebenen aufgeklappt — der Ausdruck zeigt alles, unabhängig vom Klapp-Zustand am Bildschirm … |

**Small Multiples**

| Property | Typ | Standard | Werte / Beschreibung |
| --- | --- | --- | --- |
| `multiplesTotal` | bool | `false` | Stellt eine „Σ Gesamt"-Kachel voran — Summe über alle Gruppen, auf derselben Skala (IBCS). |
| `multiplesTopN` | numeric | `0` | Bereich 0–24 — Zeigt nur die N größten Gruppen (nach Summe AC) als Kacheln — die übrigen werden zu einer „Rest"-Kachel aggregiert. 0 = alle. |
| `multiplesHero` | bool | `false` | Gibt der ersten Kachel (z. B. „Σ Gesamt" oder der größten Gruppe) mehr Platz — alle Kacheln behalten dieselbe Skala (IBCS CT 13). |
| `multiplesSameScale` | bool | `false` | Skaliert auch die Brücken-Modi (Integrierte Brücke, Kategorie-Brücke) über alle Kacheln identisch (IBCS). Standard: aus — jede Brücken-Kachel skaliert für sich. Säulen, Balken und Wasserfall teilen sich die Skala immer. |

**Brücke**

| Property | Typ | Standard | Werte / Beschreibung |
| --- | --- | --- | --- |
| `waterfallStyle` | bool | `false` | Nur Säulen/Balken: zeigt die Kategorien als Wasserfall-Brücke von der Basis (PY/PL) zu AC mit Verbindungslinien, statt als einzelne Balken … |
| `sortByImpact` | bool | `false` | Nur bei Waterfall bridge: sortiert die Kategorien nach Abweichungsgröße (größter Treiber zuerst). Eine Top-N-Rest-Zeile bleibt am Ende. Auch per Klick auf das ⇅-Symbol im Chart umschaltbar. |
| `bridgeOrientation` | enum | `auto` | `auto` · `bars` · `columns` — Nur Kategorie-Brücke: „Balken (horizontal)" zeigt die Kaskade zeilenweise wie bisher (Kategorien untereinander, Δ%-Pins rechts) … |
| `bridgeBreak` | bool | `false` | Integrierte Brücke, Kategorie-Brücke (Säulen) und Wasserfall: Die Summen-Anker (z. B. PY und AC+FC) werden mit sichtbarem Achsenbruch ⫽ gekürzt, damit die Brückenstufen in echter Höhe lesbar werden … |

**Tabelle**

| Property | Typ | Standard | Werte / Beschreibung |
| --- | --- | --- | --- |
| `valueColumns` | enum | `ac` | `ac` · `basis` · `all` — Zusätzliche Zahlenspalten neben AC: die Varianzbasis (PY oder PL, je nach Abweichungsbasis) oder beide Referenzszenarien — für druck- und boardtaugliche Tabellen ohne Balken-Interpretation. |
| `autoExpandHierarchy` | bool | `true` | Liegen mehrere Felder in „Kategorie", klappt das Visual die Drill-Hierarchie automatisch auf — der klickbare Zeilenbaum erscheint sofort beim Hineinziehen, ohne die ⫟-Drill-Knöpfe im Visual-Kopf … |
| `structureEdit` | bool | `false` | Bearbeitungsmodus: Klick auf eine Zeile öffnet ein kleines Menü mit „Invertieren“, „Ergebniszeile“ und „Aus Summen ausnehmen“ — die Ein-Klick-GuV ohne Datenmodell-Änderung … |
| `resultList` | text | leer | Kommagetrennte Zeilennamen, die als Ergebniszeilen formatiert werden (fett, Trennlinie, vom Σ ausgenommen; im Wasserfall als Anker) … |
| `skipList` | text | leer | Kommagetrennte Zeilennamen, die nicht in Σ-Zeile, Skalen und Wasserfall-Kaskade einfließen (z. B. nachrichtliche Positionen). Die Zeile bleibt sichtbar, wird aber dezent dargestellt … |
| `hideList` | text | leer | Kommagetrennte Zeilennamen, die nur ausgeblendet werden — Σ-Zeile, Skalen und Formeln rechnen weiter mit ihnen (anders als „Aus Summen ausnehmen“). Auch per Klick im Struktur-Modus setzbar … |
| `chartList` | text | leer | Kommagetrennte Zeilennamen: Wenn befüllt, zeigen nur diese Zeilen die Balken-/Pin-Grafiken — alle anderen bleiben reine Zahlenzeilen. Leer = Grafiken überall. Die Σ-Zeile behält ihre Grafik immer … |
| `indentList` | text | leer | Kommagetrennte Zeilennamen, die als „davon:“-Positionen eingerückt und dezent dargestellt werden — ohne Hierarchie-Feld. Meist kombiniert mit „Aus Summen ausnehmen“ … |
| `rowFormats` | text | leer | Zahlenformat pro Zeile, mit Semikolon getrennt: „Marge = 0.0 %; Menge = #,0“. Prozent multipliziert mit 100; Werte erscheinen unskaliert (keine T€-Teilung) — für gemischte €-, %- und Stück-Zeilen. |
| `matrixCompare` | enum | `none` | `none` · `prevcol` — Vergleich innerhalb der Matrix-Spalten: „Δ vs. Vorspalte“ ersetzt das ΔBasis je Block durch die Veränderung zur vorherigen Spalte (Periodenvergleich Q2 vs. Q1, Mär vs. Feb …). |
| `formulaRows` | text | leer | Berechnete Zeilen, mit Semikolon getrennt: „EBIT = Umsatz - Kosten“ ergänzt eine Summenzeile, „Marge = EBIT / Umsatz“ eine %-Zeile. Operanden sind Zeilennamen; Operatoren bitte mit Leerzeichen umgeben … |
| `totalRowPosition` | enum | `bottom` | `bottom` · `top` — Wo die Σ-Gesamtzeile steht: „Unten“ (Standard, deutsche GuV-Lesart) unter allen Zeilen, „Oben“ direkt unter dem Kopf (IBCS). Bleibt beim Scrollen fixiert. |
| `zebraStripes` | bool | `false` | Legt jede zweite Datenzeile mit einem sehr dezenten Hintergrund an — leichtere Zeilenverfolgung in breiten Tabellen. Im Hochkontrast-Modus aus. Standard aus. |
| `rowDensity` | enum | `normal` | `compact` · `normal` · `airy` — Zeilenhöhe: „Kompakt“ für dichte Tabellen, „Normal“ (Standard) wie bisher, „Luftig“ für mehr Weißraum (Präsentation). Skaliert nur die Obergrenze; sehr hohe Visuals bleiben gedeckelt. |
| `gridLines` | enum | `horizontal` | `horizontal` · `none` · `both` — Trennlinien-Stil: „Horizontal“ (Standard) nur Zeilenlinien wie bisher, „Keine“ für ein ruhiges Bild, „Horizontal + vertikal“ ergänzt dezente Spalten-/Blocktrenner. |
| `cellLayout` | enum | `columns` | `columns` · `stacked` — Nur Matrix: „Spalten“ (Standard) zeigt Wert und ΔBasis nebeneinander. „Zwei Zeilen“ setzt den Wert groß nach oben und die kleinere Δ-Zahl direkt darunter in dieselbe Zelle — die Matrix wird etwa halb so breit … |

**KPI-Karten**

| Property | Typ | Standard | Werte / Beschreibung |
| --- | --- | --- | --- |
| `cardStatusBasis` | enum | `basis` | `basis` · `benchmark` — Wogegen Streifen und Hintergrund-Ampel bewerten: gegen die Abweichungsbasis (ΔPL bzw. ΔPY) oder gegen die gebundene Benchmark-Measure — für Monitoring gegen Zielwerte/Schwellen. |
| `cardHighlight` | enum | `both` | `both` · `bad` · `good` — Welche Richtung farbig hervorgehoben wird: beide (Ampel), nur schlechte (Problem-Monitoring — Positives bleibt neutral) oder nur gute (Erfolgs-Board). Gilt für Streifen, Hintergrund, Δ-Zeilen und Bullet. |
| `cardRefValues` | enum | `off` | `off` · `basis` · `all` — Zeigt neben der Abweichung auch den Referenzwert selbst auf der Karte: „Basiswert“ blendet die Vergleichsbasis ein (VJ bzw. Plan), „Alle gebundenen Szenarien“ zusätzlich die übrigen gebundenen Measures (VJ, Plan, Prognose … |
| `cardSort` | enum | `none` | `none` · `deviation` · `worst` · `best` — Ordnet die Karten nach der farbrelevanten Abweichung (Benchmark bzw. ΔPL/ΔPY, je nach Status-Basis): größte Abweichung oben-links — für maximalen Fokus. „Datenreihenfolge“ lässt sie wie im Modell. |
| `cardBars` | bool | `true` | Zeigt die kleine Balken-Brücke Basis → Δ → AC unten auf der Karte. Aus: reine Zahlen-Karte (großer Wert + Δ-Zeilen), ruhiger für dichte KPI-Wände. |
| `cardSameScale` | bool | `false` | Alle Mini-Brücken teilen einen Maßstab: gleiche Beträge ergeben gleich hohe Balken (IBCS: identische Skalen). Für Karten derselben Kennzahl je Kategorie (z. B. Umsatz je Kanal) … |
| `cardTrendChart` | enum | `sparkline` | `off` · `sparkline` · `columns` — Nur mit gebundenem „Trend (Zeit)"-Feld: zeigt die Zeitreihe je Karte unten auf der Karte — als Sparkline (AC-Linie, PY dünn grau dahinter, letzter Punkt markiert und beschriftet, FC gestrichelt) oder als Mini-Säulen … |
| `cardTrendValue` | enum | `last` | `last` · `sum` — Nur mit gebundenem „Trend (Zeit)"-Feld: welche Zahl die Karte groß zeigt … |
| `cardTint` | bool | `false` | Färbt den Karten-Hintergrund dezent: leicht grün wenn besser, leicht rot wenn schlechter als die Status-Basis — neutral (unterhalb der Wesentlichkeit) bleibt ohne Farbe. Für Monitoring-Wände; im Hochkontrast-Modus aus. |
| `cardTintStrength` | numeric | `12` | Bereich 4–40 — Deckkraft der Hintergrund-Färbung in Prozent (4–40). Standard 12 — kräftiger für Kontrollraum-Monitore, dezenter für Board-Reports. |
| `cardBullet` | bool | `false` | Kleines Bullet-Chart auf der Karte: AC-Balken auf hellem Band, Benchmark als Tick — unter der Zahl (Stapel-Layout) bzw. neben den Δ-Zeilen (flaches Layout). Braucht die Benchmark-Rolle. |
| `cardBulletZoom` | bool | `false` | Spreizt das Bullet auf den Bereich um AC und Benchmark statt bei Null zu starten — KPIs nahe am Ziel (97 vs. 99) werden unterscheidbar. Der Achsenbruch am linken Balkenende kennzeichnet die gekappte Skala. |

**Scatter / Bubble**

| Property | Typ | Standard | Werte / Beschreibung |
| --- | --- | --- | --- |
| `scatterQuadrant` | enum | `mean` | `off` · `mean` · `median` — Scatter: gestrichelte Mittellinien teilen die Punktwolke in vier Quadranten — beim Mittelwert (Ø, Standard) oder Median von X und Y. Eine Referenzlinie (Skala-Karte: Y-Wert bzw. X-Wert) ersetzt die jeweilige Mittellinie … |
| `scatterColorBy` | enum | `single` | `single` · `status` · `group` — Scatter: „Einfarbig" zeigt alle Punkte in der AC-Farbe (Standard) … |
| `scatterShapes` | bool | `false` | Nur bei Punktfarbe „Nach Gruppe/Serie": jede Gruppe bekommt zusätzlich eine eigene Form (Kreis · Quadrat · Dreieck · Raute, dann von vorn) — lesbar im Schwarzweiß-Druck und bei Farbfehlsicht; die Legende zeigt die Formen mit … |
| `scatterArrows` | bool | `false` | Nur mit Vorjahr (PY): jeder Punkt bekommt einen dünnen Pfeil vom kleinen grauen PY-Punkt zur AC-Position. Y = PY-Wert; X bleibt gleich, außer das Feld „X-Achse VJ (Scatter)" ist gebunden — dann volle 2D-Bewegung … |
| `scatterTrend` | enum | `off` | `off` · `linear` — Lineare Regression über die sichtbaren Punkte (bei Small Multiples je Kachel) als dünne gepunktete Linie über die Plotbreite. Bei Log-Achsen im logarithmischen Raum gerechnet (Gerade bleibt gerade). Mindestens 3 Punkte. |
| `scatterTrendR2` | bool | `false` | Beschriftet das Ende der Trendlinie mit dem Bestimmtheitsmaß („R² = 0,87"). |
| `scatterSizeLegend` | bool | `true` | Nur mit gebundener Blasengröße: drei Referenzkreise (klein · mittel · groß, auf runde Werte gerundet) kompakt in einer freien Ecke des Plots. Bei Small Multiples einmal in der ersten Kachel. |
| `scatterQuadLabelTR` | text | leer | Dezente Beschriftung der Quadranten-Ecke (z. B. „Stars" oben rechts). Leer = aus. Nur bei aktiven Quadranten-Linien; weicht Punkten nach Möglichkeit aus. |
| `scatterQuadLabelTL` | text | leer | Dezente Beschriftung der Quadranten-Ecke. Leer = aus. Nur bei aktiven Quadranten-Linien; weicht Punkten nach Möglichkeit aus. |
| `scatterQuadLabelBL` | text | leer | Dezente Beschriftung der Quadranten-Ecke. Leer = aus. Nur bei aktiven Quadranten-Linien; weicht Punkten nach Möglichkeit aus. |
| `scatterQuadLabelBR` | text | leer | Dezente Beschriftung der Quadranten-Ecke. Leer = aus. Nur bei aktiven Quadranten-Linien; weicht Punkten nach Möglichkeit aus. |
| `scatterPlay` | bool | `false` | Blendet einen ▶-Button ein (Rosling-Modus): die Kategorie wird zur Zeitachse — je Periode ein Bild, die Punkte (je Wert des Felds „Serie") gleiten von Periode zu Periode, die Periode steht groß im Hintergrund … |

**Persistierte Zustände** (nicht im Format-Pane; das Visual schreibt sie per `persistProperties`, ein Agent kann sie
vorkonfigurieren — Formate siehe „Persistierte Zustände“ außerhalb dieses Blocks):

- text: `templateApplied`; `smartStartDismissed`; `pnlView`; `tableExpanded`; `tableSort`; `tableColExpanded`;
  `tableNameWidth`; `tableColWidths`; `cardSortSel`

Enum-Labels:

- `template`: `off` = Aus (keine Vorlage); `C01` = C01 · Gestapelte Säulen (Serie);
  `C02` = C02 · Gestapelte Balken (Serie); `C03` = C03 · Säulen + Varianzen (PY);
  `C04` = C04 · Balken + Varianzen (PL); `C05` = C05 · Integrierte Brücke (Zeit);
  `C06` = C06 · Kategorie-Brücke vertikal; `C08` = C08 · Linie (lange Zeitreihe); `C09` = C09 · Scatter;
  `C10` = C10 · Bubble (Scatter + Größe); `C12` = C12 · Waterfall / Brücke; `C13` = C13 · Small Multiples
- `orientation`: `columns` = Säulen (Zeit); `bars` = Balken (Struktur); `line` = Linie (lange Zeitreihe);
  `waterfall` = Waterfall / Brücke; `intwaterfall` = Integrierte Brücke (Zeit);
  `catbridge` = Kategorie-Brücke (Struktur); `table` = Tabelle (IBCS); `pareto` = Pareto (Struktur);
  `dumbbell` = Dumbbell · Vorher/Nachher (Struktur); `slope` = Slope · Vorher/Nachher;
  `scatter` = Scatter / Bubble (Korrelation); `cards` = KPI-Karten (Kacheln); `pnl` = GuV-Statement (IBCS)
- `comparisonMode`: `auto` = Auto; `py` = Vorjahr (PY); `plan` = Plan (PL); `fcrev` = FC Vormonat (Revision)
- `cumulativeKind`: `ytd` = YTD (Jahr kumuliert); `qtd` = QTD (Quartal kumuliert);
  `r12` = R12 (rollierende 12 Perioden)
- `acFcSplit`: `off` = Aus (FC nur, wo AC fehlt); `full` = FC = Vollmonatsprognose (Aufstockung);
  `rest` = FC = Restmonat (additiv)
- `pinStyle`: `auto` = Automatisch (je Modus); `round` = Rund; `square` = Quadratisch
- `bridgeOrientation`: `auto` = Automatisch; `bars` = Balken (horizontal); `columns` = Säulen (vertikal)
- `valueColumns`: `ac` = Nur AC; `basis` = AC + Varianzbasis; `all` = AC · PY · PL
- `matrixCompare`: `none` = Aus (Δ zur Basis); `prevcol` = Δ zur Vorspalte
- `totalRowPosition`: `bottom` = Unten (unter den Zeilen); `top` = Oben (unter dem Kopf)
- `rowDensity`: `compact` = Kompakt; `normal` = Normal; `airy` = Luftig
- `gridLines`: `horizontal` = Horizontal; `none` = Keine; `both` = Horizontal + vertikal
- `cellLayout`: `columns` = Spalten (Wert · Δ nebeneinander); `stacked` = Zwei Zeilen: Wert oben, Δ darunter
- `cardStatusBasis`: `basis` = Abweichungsbasis (ΔPL/ΔPY); `benchmark` = Benchmark (BM)
- `cardHighlight`: `both` = Gut & schlecht; `bad` = Nur schlechte; `good` = Nur gute
- `cardRefValues`: `off` = Nur Abweichungen (Δ); `basis` = Basiswert (VJ oder Plan);
  `all` = Alle gebundenen Szenarien
- `cardSort`: `none` = Datenreihenfolge; `deviation` = Größte Abweichung zuerst;
  `worst` = Schlechteste zuerst (oben); `best` = Beste zuerst (oben)
- `cardTrendChart`: `off` = Aus (Mini-Brücke wie bisher); `sparkline` = Sparkline; `columns` = Säulen
- `cardTrendValue`: `last` = Letzter Wert (aktuelle Periode); `sum` = Summe über alle Perioden
- `scatterQuadrant`: `off` = Aus; `mean` = Mittelwert (Ø); `median` = Median
- `scatterColorBy`: `single` = Einfarbig (AC); `status` = Status ΔPY/ΔPL (gut · schlecht · grau);
  `group` = Nach Gruppe/Serie (Legende)
- `scatterTrend`: `off` = Aus; `linear` = Linear

### Objekt `ibcsTitle` (Karte „IBCS-Titel“)

| Property | Typ | Standard | Werte / Beschreibung |
| --- | --- | --- | --- |
| `show` | bool | `true` | Standardisierter IBCS-Titel: KPI · Einheit · Zeitraum: Szenarien. |
| `kpi` | text | leer | – |
| `period` | text | leer | – |
| `message` | text | leer | – |
| `autoMessage` | bool | `false` | Erzeugt die Botschafts-Zeile (Treiber-Text) automatisch aus Gesamtabweichung und größten Treibern, wenn keine eigene Botschaft eingegeben ist. Standard aus. |
| `footer` | text | leer | Fußzeile unten links — z. B. Datenstand und Quelle: „Ist per Jun 2026 · Stand 05.07. · Quelle: SAP FI". |
| `filterFooter` | bool | `false` | Zweite Fußzeile mit dem Filterkontext: zeigt die gebundene „Filter-Info“-Text-Measure (Report-Filter sind für Custom Visuals nicht per API sichtbar) plus den Anzeige-Zustand des Visuals selbst — YTD, Top-N, In-Chart-Sortierung, Σ-Ausschlüsse, Vergleich. |

### Objekt `labels` (Karte „Datenbeschriftungen“)

| Property | Typ | Standard | Werte / Beschreibung |
| --- | --- | --- | --- |
| `show` | bool | `true` | – |
| `labelDensity` | enum | `auto` | `auto` · `all` · `ends` — Steuert die Ausdünnung der Wertbeschriftungen: „Automatisch" blendet bei Platzmangel aus (bisheriges Verhalten), „Alle" beschriftet jeden Punkt (kann überlappen), „Anfang · Ende · Extrema" zeigt nur ersten/letzten Wert sowie … |
| `fontPreset` | enum | `compact` | `compact` · `fullhd` · `presentation` — Skaliert alle Schriften im Visual auf einmal: HD ×1 (Standard) · Full HD ×1,5 (empfohlen für 1080p-Berichte) · UHD ×2. |
| `fontScale` | numeric | `100` | Bereich 50–300 — Vergrößert bzw. verkleinert ALLE Beschriftungen zusätzlich zum Preset um einen freien Faktor (50–300 %). 100 = neutral. Preset × Faktor ergibt die effektive Schriftgröße. |
| `decimals` | numeric | `1` | Bereich 0–3 |
| `displayUnits` | enum | `auto` | `auto` · `none` · `k` · `m` · `b` |
| `financeFormat` | bool | `false` | Finanzkonvention für Zahlen: negative Werte in Klammern statt Minuszeichen — (1.234) — und Null als „–". Gilt für Wert- und Δ-Beschriftungen inkl. Δ %. |
| `sumSafeRounding` | bool | `false` | Rundet die Wertbeschriftungen nach dem Restwertverfahren so, dass sie exakt auf die Σ-Kopfzeile aufaddieren — keine Rundungsdifferenz-Nachfragen mehr … |
| `unitSuffix` | bool | `true` | An = jede Beschriftung trägt Größenordnung und Einheit („18,5M“). Aus = nur die Zahl („18,5“), die Einheit steht einmal im Titel („Nettoumsatz in Mio. EUR“), so wie es IBCS empfiehlt. |
| `labelAc` | text | leer | Eigener Begriff für AC in Titeln, Spaltenköpfen und Legenden (z. B. „Ist"). Leer = AC. |
| `labelPy` | text | leer | Eigener Begriff für PY, auch in ΔPY-Überschriften (z. B. „VJ"). Leer = PY. |
| `labelPl` | text | leer | Eigener Begriff für PL, auch in ΔPL-Überschriften (z. B. „Budget"). Leer = PL. |
| `labelFc` | text | leer | Eigener Begriff für FC (z. B. „Prognose"). Leer = FC. |
| `fontSize` | fontSize (pt) | `10` | Bereich 6–24 — Feinjustierung: Basis-Schriftgröße der Beschriftungen in pt. Wird mit Preset und Skalierungs-Faktor multipliziert — im Normalfall genügen Preset und „Alle Beschriftungen skalieren %". |

Enum-Labels:

- `labelDensity`: `auto` = Automatisch (ausdünnen); `all` = Alle; `ends` = Anfang · Ende · Extrema
- `fontPreset`: `compact` = HD (Dashboard-Kachel); `fullhd` = Full HD (1080p);
  `presentation` = UHD (4K / Beamer)
- `displayUnits`: `auto` = Auto; `none` = Keine; `k` = Tausend (k); `m` = Millionen (M); `b` = Milliarden (B)

### Objekt `categoryAxis` (Karte „Kategorienachse“)

| Property | Typ | Standard | Werte / Beschreibung |
| --- | --- | --- | --- |
| `fontSize` | fontSize (pt) | `10` | Bereich 6–24 |

### Objekt `colors` (Karte „IBCS-Farben“)

| Property | Typ | Standard | Werte / Beschreibung |
| --- | --- | --- | --- |
| `appearance` | enum | `auto` | `auto` · `light` · `dark` — „Auto" erkennt dunkle Berichts-Themes an der Hintergrundfarbe und stellt Schrift, Achsen und Flächen auf helle Töne um. Bei manuell dunkel eingefärbten Seiten (ohne dunkles Theme) „Dunkel" wählen. |
| `variancePreset` | enum | `custom` | `custom` · `blueOrange` — „Blau/Orange" setzt Good/Bad auf das ColorBrewer-Paar #2C7BB6/#E66101 — auch bei vollständiger Farbenblindheit (Achromatopsie) und im Schwarzweiß-Druck über die Helligkeit unterscheidbar … |
| `useTheme` | bool | `false` | Übernimmt Good/Bad und Neutralfarben aus dem Berichtsdesign (Theme) statt der Farbwähler unten. |
| `actualColor` | color | `#404040` | – |
| `previousYearColor` | color | `#B3B3B3` | – |
| `planColor` | color | `#404040` | – |
| `goodColor` | color | `#1E8F9E` | Standard ist das DatenWG-Teal (#1E8F9E) statt klassischem Grün — durch den Blauanteil bleibt „gut“ auch bei Rot-Grün-Schwäche klar vom Rot unterscheidbar. Hier übersteuerbar. |
| `badColor` | color | `#D64541` | – |

Enum-Labels:

- `appearance`: `auto` = Auto (Theme erkennen); `light` = Hell; `dark` = Dunkel
- `variancePreset`: `custom` = Farbwähler unten (Teal/Rot); `blueOrange` = Blau/Orange (ColorBrewer)

### Objekt `scale` (Karte „Skala & Referenzlinie“)

**Skalen-Sync**

| Property | Typ | Standard | Werte / Beschreibung |
| --- | --- | --- | --- |
| `fixedMax` | numeric | `0` | Minimum 0 — Skaliert das Basis-Chart mindestens bis zu diesem Wert — für identische Skalen über mehrere Visuals (IBCS). 0 = automatisch. Größere Datenwerte erweitern die Skala weiterhin. |
| `fixedVarMax` | numeric | `0` | Minimum 0 — Wie oben, für das absolute Abweichungs-Panel (symmetrisch ±). 0 = automatisch. |
| `capOverflow` | bool | `false` | Macht das Skalen-Maximum hart: größere Werte werden gekappt und mit Doppelstrich markiert (Label zeigt den echten Wert). |

**Scatter-Achsen**

| Property | Typ | Standard | Werte / Beschreibung |
| --- | --- | --- | --- |
| `xMin` | text | leer | Nur Scatter: fixiert die Achsengrenze (z. B. 0 oder 0.25; k/M/B-Suffixe wie bei der Referenzlinie). Leer = automatisch. Für identische Achsen über mehrere Scatter einer Seite … |
| `xMax` | text | leer | Nur Scatter: fixiert die Achsengrenze. Leer = automatisch. |
| `yMin` | text | leer | Nur Scatter: fixiert die Achsengrenze. Leer = automatisch. |
| `yMax` | text | leer | Nur Scatter: fixiert die Achsengrenze. Leer = automatisch. |
| `xLogScale` | bool | `false` | Nur Scatter: logarithmische X-Achse (Ticks als Dekaden bzw. 1-2-5-Schritte) … |
| `yLogScale` | bool | `false` | Nur Scatter: logarithmische Y-Achse (AC). Greift nur, wenn alle Y-Werte größer 0 sind — sonst linear mit Hinweis im Bearbeiten-Modus. |

**Referenzlinie**

| Property | Typ | Standard | Werte / Beschreibung |
| --- | --- | --- | --- |
| `refLine` | text | leer | Zeichnet eine Ziel-/Schwellenlinie bei diesem Wert quer durch das Basis-Chart. Leer = aus. |
| `refLineLabel` | text | leer | – |
| `xRefLine` | text | leer | Nur Scatter: senkrechte Ziel-/Schwellenlinie bei diesem X-Wert (z. B. 0.15 für 15 % Marge). Ersetzt die X-Quadrantenlinie; die Y-Referenzlinie oben ersetzt die Y-Quadrantenlinie. Leer = aus. |

**Wasserfall-Achse**

| Property | Typ | Standard | Werte / Beschreibung |
| --- | --- | --- | --- |
| `wfAxisBreak` | enum | `off` | `off` · `auto` · `on` — IBCS-Achsenschnitt (UN 5.3) für Wasserfälle mit großem Sockel: Anker und Zwischensummen werden mit ⫽ gekürzt, die Abweichungen darüber werden lesbar. Aus = immer nullbasiert, kein Chip … |
| `wfBreakAt` | numeric | `0` | Minimum 0 — Wert, bis zu dem die Achse gestaucht wird. 0 = automatisch (runder Wert unterhalb des niedrigsten Stands). Liegt ein Anker oder eine Abweichung darunter, wird nicht geschnitten. |

Enum-Labels:

- `wfAxisBreak`: `off` = Aus (nullbasiert); `auto` = Auto (Leser entscheidet per Chip);
  `on` = An (Achse geschnitten)

### Objekt `commentsPanel` (Karte „Kommentare“)

| Property | Typ | Standard | Werte / Beschreibung |
| --- | --- | --- | --- |
| `showPanel` | bool | `true` | Zeigt die Kommentare als nummerierte Liste rechts neben dem Chart — bleibt auch im PDF/PowerPoint-Export sichtbar. |
| `commentFontSize` | numeric | `10` | Bereich 8–24 — Schriftgröße der Kommentar-Liste in pt (8–24). Wird zusätzlich mit dem Schrift-Preset und dem Skalierungs-Faktor multipliziert, skaliert also mit dem Rest des Visuals mit. |
| `editComments` | bool | `false` | Kommentar-Modus: Klick auf eine Kategorie öffnet ein Eingabefeld — der Kommentar wird im Bericht gespeichert (bookmark-fähig, wandert mit der PBIX). Solange der Modus an ist, filtern Klicks nicht quer. Standard aus. |

**Persistierte Zustände** (nicht im Format-Pane; das Visual schreibt sie per `persistProperties`, ein Agent kann sie
vorkonfigurieren — Formate siehe „Persistierte Zustände“ außerhalb dieses Blocks):

- text: `userComments`

### Objekt `emptyState` (Karte „Leer-Zustand“)

| Property | Typ | Standard | Werte / Beschreibung |
| --- | --- | --- | --- |
| `mode` | enum | `hub` | `hub` · `demo` · `fields` · `message` — Was der Bericht-Autor im Bearbeitungsmodus sieht, solange keine Daten dargestellt werden: der Start-Hub (Standard: Checkliste „Loslegen“, Feature-Tour, IBCS-Vorlagen nach Zweck, Demo-Galerie, Feld-Intro mit allen … |
| `title` | text | leer | Ersetzt die Überschrift „ChartKitchen byDatenWG", wenn keine Daten dargestellt werden (Felder leer oder Auswahl ohne Zeilen). Im Lesemodus erscheint dann nur Titel + Text statt der Modus-Galerie. |
| `body` | text | leer | Textkörper unter dem Titel im Leer-Zustand — z. B. ein Hinweis, welche Filter der Leser prüfen soll. |

Enum-Labels:

- `mode`: `hub` = Start-Hub (Loslegen, Tour, Vorlagen, Demo, Felder);
  `demo` = Demo-Galerie (Chart-Typ wählen); `fields` = Feld-Intro (welches Feld wohin);
  `message` = Eigene Nachricht (Titel / Text unten)
<!-- gen:properties:end -->

### Hinweise zu einzelnen Properties (handgeschrieben)

Das Wichtigste, was die gekürzten Tabellenbeschreibungen oben nicht tragen:

- **`chart.template`:** Mapping Vorlage → Properties und die PBIR-Regeln (`template` ± `templateApplied`)
  stehen unter „Neu in 1.49“ und in Falle 9. Re-Apply per Hub-Galerie (ab 1.50) oder ↺-Chip.
- **`chart.acFcSplit`:** `full` = Säule max(AC, FC), `rest` = AC + FC. Die falsche Wahl zählt den
  angebrochenen Monat doppelt — muss zur FC-Measure-Definition passen (Falle 4).
- **`chart.topN`:** wirkt in allen Struktur-Modi (Bars, Kategorie-Brücke, Tabelle, Dumbbell, KPI-Karten),
  nicht nur in `bars`.
- **`chart.exceptionOnly`:** braucht eine Wesentlichkeits-Schwelle (`materialityAbs`/`materialityPct`);
  wirkt nur in `bars`, `cards` und flacher Tabelle (nicht in Matrix/Hierarchie, Zeitachsen oder Kaskaden);
  Σ bleibt treu, ⚠-Chip im Chart.
- **`chart.highlight`:** ab 1.42 in allen Modi inkl. Pareto, Waterfall, Brücken und Stacked.
- **`chart.cardTint` / `cardTintStrength`:** Strength in Prozent Deckkraft (4–40), Standard 12.
- **`chart.cumulative*`, `fiscalStart`:** Monats-Erkennung über die Kategorie-Labels (Jan…Dez, 01…12);
  `fiscalStart` = Startmonat des Fiskaljahres (1–12).
- **`chart.multiples*`:** Small-Multiples-Paket (Σ-Kachel, Top-N, Hero-Kachel, gleiche Skala für Brücken);
  Rolle `multiples` binden.
- **`scale.fixedMax` / `fixedVarMax`:** Skalen-Sync über mehrere Instanzen, ab 1.45 auch im Wasserfall;
  `capOverflow` kappt ab 1.45 an allen gekappten Elementen (⫽-Marker).
- **`scale.wfAxisBreak`:** `auto` hebt nur den „⫽ Achse“-Chip hervor, geschnitten wird erst per Klick.
  Zulässig nur, wenn alle Anker und Deltas über dem Schnitt liegen; Small Multiples teilen EINEN Schnitt;
  die Fußzeile weist den Schnitt in Exporten aus. `wfBreakAt` = manueller Schnittwert (0 = niceFloor).
- **`scale.xMin/xMax/yMin/yMax`:** Text, `parseRefValue`-Syntax: leer = auto, `0` gültig, Suffixe k/M/B.
- **`colors.appearance`:** `auto` erkennt dunkle Themes an der Hintergrund-Luminanz < 0,35. Dark stellt
  Tinte, Achsen und Flächen auf helle Töne; Picker, die noch auf dem hellen Default stehen, werden
  automatisch ersetzt (AC/PL #404040 → #D9D9D9, PY #B3B3B3 → #8A8A8A, Gut #1E8F9E → #3FB3C2,
  Schlecht #D64541 → #E4635F); eigene Farben bleiben. `variancePreset = blueOrange` übersteuert die Picker
  (#2C7BB6/#E66101, im Dark Mode #5BA3DC/#F0821E).
- **`labels.fontPreset`:** Standard ist `compact` (HD); Full HD = Empfehlung für 1080p-Berichte. Im Start-Hub
  heißen die Stufen HD · Full HD · UHD (ab 1.51), die gespeicherten Werte bleiben `compact`/`fullhd`/
  `presentation`.
- **`labels.labelAc/Py/Pl/Fc`:** Hausbegriffe wirken auf Titel, Köpfe, Brücken, Legenden und Tooltips.
- **`emptyState.*`:** Der Hub (`mode = hub`) erscheint nur im Bearbeitungsmodus mit Interaktion; Leser und
  Exporte sehen nie den Hub. Ist `body` gesetzt und der Bericht im Lesemodus, erscheint NUR Titel + Text;
  im Bearbeitungsmodus bleibt die Galerie mit den eigenen Texten als Kopf.
- **Tooltip:** Im Dark Mode (`colors.appearance`) zeichnet das Visual den Hover-Tooltip selbst (dunkler
  Kasten, Kategorie als Kopf); im hellen Modus bleibt der native `tooltipService`.

### Persistierte Zustände (handgeschrieben)

Properties ohne Format-Pane-Eintrag, die das Visual selbst per `persistProperties` schreibt. Ein Agent
kann sie **vorkonfigurieren**, statt sie den Nutzer zusammenklicken zu lassen. Der Generator verlangt,
dass jede solche Property in `capabilities.json` hier mit ihrem Namen vorkommt.

| Objekt | Property | Format |
| --- | --- | --- |
| `chart` | `templateApplied` | zuletzt angewandte Vorlage (Echo-Guard); `off` = keine |
| `chart` | `smartStartDismissed` | Signatur der verworfenen Smart-Start-Konstellation |
| `chart` | `pnlView` | GuV-Sicht: `ac` · `acfc` · `pl` |
| `chart` | `tableExpanded` | JSON-Array aufgeklappter Zeilen-Keys |
| `chart` | `tableSort` | `<spalte>_desc` / `<spalte>_asc`; Spalten `ac`, `dabs`, `drel`, `d2abs` |
| `chart` | `tableColExpanded` | JSON-Array `["col¦<label>", …]` |
| `chart` | `tableNameWidth` | px der Namensspalte |
| `chart` | `tableColWidths` | JSON `{"val":64,"dval":60,"mxBlock":150,"mxSum":120}` |
| `chart` | `cardSortSel` | Chip-Override von `cardSort` (gleiche Werte) |
| `commentsPanel` | `userComments` | JSON der im Bericht erfassten Kommentare |

## Text-Syntaxen

- **Listen** (`invertList`, `resultList`, `skipList`, `hideList`, `chartList`,
  `indentList`, `highlight`): kommagetrennt, case-insensitive, exakter
  Kategoriename. Beispiel: `"Opex, Materialaufwand"`.
- **`formulaRows`**: Einträge per `;` oder Zeilenumbruch.
  `Label = A + B - C` (Summenzeile) · `Marge = X / Y` (%-Zeile, Δ in Pp).
  **Operatoren brauchen Leerzeichen drumherum** („E-Commerce" bleibt so ein
  Name). Formeln dürfen auf frühere Formeln verweisen. Unauflösbar →
  sichtbare `Label = ?`-Zeile (ab 1.39).
- **`rowFormats`**: `Headcount=#,0;Quote=0.0 %` — Zeilen mit eigenem Format
  fliegen aus den gemeinsamen €-Skalen.

## PBIR-Beispielkonfiguration (Columns, ΔPL, YTD-Button, Hausbegriffe)

```json
"objects": {
  "chart": {
    "orientation": "columns",
    "comparisonMode": "plan",
    "showAbsoluteVariance": true,
    "showRelativeVariance": true,
    "cumulativeButton": true,
    "acFcSplit": "full"
  },
  "labels": { "fontPreset": "fullhd", "labelPl": "Budget" },
  "ibcsTitle": { "autoMessage": true }
}
```

Persistierte Zustände (Sortierung, aufgeklappte Zeilen, Spaltenbreiten,
GuV-Sicht) sind normale Properties — ein Agent kann sie **vorkonfigurieren**,
statt sie den Nutzer zusammenklicken zu lassen. Formate siehe Tabelle oben.

## Bekannte Fallen (Stand 1.51)

1. **Import bei gleicher GUID:** Nach „Visual aus Datei importieren" kann die
   laufende Sandbox-Instanz eingefroren weiterlaufen (reagiert nicht auf
   Filter). Fix: Seite wechseln und zurück, oder Visual minimal resizen.
2. **Zeilenmenge (ab 1.49 entschärft):** Über 1000 Kategoriezeilen lädt das
   Visual nach (Falle 7). Grenzen: Host-Limit (~100 MB) und die eigene
   Sicherheitsgrenze 30.000 Zeilen — beide werden im Chart gemeldet. Für
   lesbare Charts trotzdem vorfiltern oder aggregieren.
3. **Non-blank-Measures** erzeugen Geisterzeilen (siehe DAX-Regel oben).
4. **`acFcSplit`:** `full` vs. `rest` MUSS zur FC-Measure passen, sonst wird
   der angebrochene Monat doppelt gezählt.
5. **`sumSafeRounding` aus + sichtbare Rundungsdifferenz** → automatischer
   Hinweis im Chart (Columns oben rechts, Bars unten rechts).
6. **Export/Abo** rendert ohne In-Chart-Buttons und (Default) alles
   aufgeklappt — Bildschirm-Screenshots und PDF können sich absichtlich
   unterscheiden.
7. **`fetchMoreData` (ab 1.49):** `dataReductionAlgorithm window 1000`. Liefert
   der Host `metadata.segment`, fordert das Visual `fetchMoreData(true)` an
   (Append-Updates tragen den AKKUMULIERTEN DataView). Zwischen-Segmente
   aktualisieren nur die Fortschrittszeile „⏳ n Zeilen geladen …“ unten
   rechts; gezeichnet wird das erste Fenster und einmal der vollständige
   Bestand (Memoisierung — 30 Voll-Renders würden den Bericht blockieren).
   Verweigert der Host (Rückgabe false) → Hinweis „Zeilenlimit erreicht …
   unvollständig“; ab 30.000 Zeilen keine weitere Anfrage + Hinweis. Ohne
   `segment` (≤ 1000 Zeilen) exakt das Verhalten vor 1.49. Bis 1.48 stand hier
   `top 1000` mit stiller Kappung.
8. **Cross-Interaktion = Filtern (ab 1.46,** `supportsHighlight: false`**):**
   Eine Auswahl in einem anderen Visual **filtert** dieses Visual immer —
   Power BI bietet die Wechselwirkung „Hervorheben" dafür gar nicht mehr an.
   Hintergrund: Von 1.41 bis 1.45 stand `supportsHighlight: true`, wodurch
   Power BI standardmäßig „Hervorheben" wählte; dabei kamen nur Dimm-Signale
   statt gefilterter Daten an, und in Tabelle/Wasserfall/GuV wirkte das
   Visual wie unbeteiligt (Kundenbefund). Σ-Kopf und Skalen beziehen sich
   jetzt bei Cross-Interaktion auf den gefilterten Bestand — konsistent in
   allen 12 Modi. Der Dim-Codepfad (`DataPoint.dim` aus highlights-Arrays)
   bleibt im Code für den Harness erhalten, erhält von Power BI aber keine
   Daten mehr. Die EIGENE Selektion im Visual (Klick auf Balken) dimmt
   weiterhin lokal (selectionManager, unabhängig von dieser Einstellung).
9. **Dieselbe Vorlage im Dropdown erneut wählen (ab 1.50 entschärft):** Ein
   natives Dropdown meldet die Wahl des schon gewählten Eintrags nicht — das
   Visual bekommt kein Update. Re-Apply daher über die Hub-Galerie (Klick auf
   die aktive Kachel) oder den Chip „↺ Zum Template zurück“. Per PBIR:
   `templateApplied` entfernen (oder ≠ `template` setzen) — dann wird
   `template` beim nächsten Rendern einmal angewandt.
10. **Start-Hub im Harness/Agent-Screenshot:** Ohne `viewMode` behandelt der
   Leer-Zustand den Host als Bearbeitungsmodus (Hub sichtbar), die Chips über
   gebundenen Charts erscheinen dagegen nur bei gemeldetem `viewMode` ≥ 1.
   Ab 1.51 ist „☰ Start“ dort dauerhaft (abgeschwächt) sichtbar — Screenshots
   aus dem Bearbeitungsmodus zeigen ihn unten links; Leseansicht und Export
   nicht.
11. **Hub-Preset-Leiste schreibt `labels.fontPreset`** (ab 1.51): Ein Klick auf
   HD · Full HD · UHD im Hub ändert die Schriftgröße des ganzen Visuals — wer
   per PBIR eine Größe vorgibt, setzt `labels.fontPreset` direkt.

## Verwandte Dateien

- `capabilities.json` — maschinenlesbare Rollen/Properties (Quelle der generierten Tabellen)
- `src/settings.ts` — Standardwerte und Beschreibungstexte je Setting (deutsch; Quelle der generierten Tabellen)
- `CHANGELOG.md` / `BACKLOG.md` — was sich geändert hat / was fehlt
- `.claude/skills/chartkitchen-report/` — Claude-Skill mit Report-Blaupausen
  (Monitoring · Monatsreport · Sales-Analyse) und Referenz-Instanz-Workflow
- `test/test.html` — rund 280 Render-Cases (Nummern c1 bis zur höchsten in der Datei, inkl. Varianten) als
  lebende Beispiele jeder Funktion
- `test/gen-agent-guide.js` — erzeugt die Property-Referenz dieser Datei (`npm run guide` / `guide:check`)
