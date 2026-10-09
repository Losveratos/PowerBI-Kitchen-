# Data-Visualization-Experte · Review MockupKitchen v0.5.4

Belege liegen unter `review/dataviz-experte/` (Screenshots `NN-*.png`, Skizzen-Testblatt `sk-*.png`, Export `dl-*`, Konverter-Ausgabe `out-mine/`, Skripte `s0*.mjs`). Stand: 9. Oktober 2026, Tool unter `http://localhost:8765/mockup-kitchen.html`, Chromium per Playwright, Viewport 1800 × 1050.

## 1 · Wer ich bin und was ich damit vorhabe

Ich berate Unternehmen zu Dashboard-Design und halte Schulungen zu Visualisierung: Tufte, Few, Cairo, Cole Nussbaumer Knaflic, dazu IBCS als eine Schule unter mehreren, nicht als Dogma. In Workshops sitze ich zwischen Fachbereich und Entwicklung und muss drei Dinge gleichzeitig festhalten: welche Frage die Seite beantwortet, welche Form die Antwort trägt, und welche Gestaltungsentscheidungen (Skala, Sortierung, Hervorhebung, Farbe) dafür nötig sind. Mein Testfall: eine Management-Seite mit vier KPIs, einer integrierten Varianzanalyse, einem sortierten Balkendiagramm je Region, einer Tabelle mit Sparklines und einer Kommentar-Kachel, mit eigenen Beispielwerten, Kernaussagen und einer gemeinsamen Skala. Ich erwarte, dass das Werkzeug meine Entwurfsentscheidungen nicht nur speichert, sondern zeigt, und dass sie den Weg in den Bericht und später in eine Fabric App überleben.

## 2 · Aufgaben und Verlauf

| # | Aufgabe | Ergebnis | Beleg | Anmerkung |
|---|---|---|---|---|
| 1 | Visual-Katalog vollständig durchsehen (6 Gruppen, 47 Typen) | gelungen | `01-katalog-oben.png`, `02-katalog-mitte.png`, `03-katalog-unten.png` | Bullet, Dumbbell (als „Punktdiagramm"), Slope, Heatmap, Sparkline-Tabelle, Pareto, Fan, Z-Chart, Marimekko vorhanden. Es fehlen Cycle Plot, Lollipop, 100 %-gestapelt, Histogramm, Index-Chart (Basis 100), Kalender-Heatmap. Referenzlinien, Annotationen und Hervorhebung gibt es als Eigenschaft nirgends. |
| 2 | Alle 53 Skizzenarten in drei Größen (100 × 50, 220 × 130, 480 × 260) lesen | gelungen | `sk-00-absvar.png` bis `sk-13-zchart.png` | Große Skizzen sind glaubwürdig (Achsenbeschriftung, Σ, Δ%, Einheiten). Mittlere Größe hat Labelkollisionen bei `line` und `kombi`. `tornado` hat in keiner Größe Kategoriebeschriftungen. |
| 3 | Eigene Seite bauen: 3 Zeilen, KPI-Zeile in 4 teilen, zwei Zeilen in je 2, KPI-Zeile per Zwischenraum auf 80 px verkleinern | gelungen | `01-a3-raster.png`, `02-a3-typen.png` | Teilen über ⇔ und Spur ziehen funktionieren verlässlich; Spurziehen erzeugt danach `LAYOUT_NOT_PIXEL_PERFECT` in der Spec, das ist für mich Rauschen. |
| 4 | Felder per Drag binden (Umsatz, PL, PY, Region, Month, IsForecast) | teilweise | `03-a3-felder.png`, `02-b0b-mit-zeitachse.png` | Beim ersten Durchlauf scheiterte jede Bindung: der Inspector blieb auf dem Reiter „Seite", obwohl eine Kachel gewählt war, also gab es keine Drop-Ziele. Nach manuellem Reiterwechsel sofort erfolgreich. Zeitachse heißt intern `category`, das kostet einen Suchlauf, wenn man per Skript arbeitet. |
| 5 | Beispielwerte, Kernaussage, Skalengruppe, Sortierung nach Δ, Top-N, Polarität „kleiner = besser" setzen | teilweise | `04-a3-analyse-bars.png`, `05-a3-kachelfenster.png`, `03-b0c-bars-zoom.png`, `dl-mockup-spec.json` | Alles landet korrekt in Zustand und Spec (`sort: delta desc`, `topN 5`, `scaleGroup`, `message`, `samples`). Die Skizze zeigt davon nur die Beispielwerte und die Polarität. Sortierung, Kernaussage und Skalengruppe sind auf der Zeichenfläche unsichtbar. |
| 6 | Präsentationsmodus mit der fertigen Seite | gelungen | `07-a3-praesentation.png` | Zoom 83 %, Chrome weg, Kommentar-Text lesbar. Die vier KPI-Kacheln sind zu drei Vierteln leer, der Wert ist klein. |
| 7 | Dunkler Kachelgrund und Seitengrund, Palette Teal und Grün/Rot | teilweise | `05-b2-dark-teal.png`, `06-b3-dark-ibcs.png`, `07-b4-dark-bars-zoom.png` | Skizzen schalten sauber auf helle Schrift, PL-Konturen und FC-Schraffur bleiben lesbar. Aber: die Filterzone bleibt hellbeige auf dunkler Seite, und der Kontrast-Hinweis sagt, dass der Export die dunkle Schriftfarbe behält, die Skizze aber hell zeigt. |
| 8 | Export ansehen, Spec mit dem Skill prüfen und konvertieren | gelungen | `08-b5-export-dialog.png`, `09-b6-export-brief.png`, `out-mine/analysis-todos.md` | `--validate` ohne Befund, `--plan` läuft durch. Meine Analyse-Angaben werden zu zehn To-dos (`SORT_NOT_NATIVE`, `TOPN`, `SCALE_GROUP`, `MESSAGE`, `CK_INVERT`, `DISPLAY_UNITS_SLOT`). Ehrlich, aber damit bleibt die Hälfte meiner Entwurfsentscheidungen Handarbeit. |
| 9 | PNG-Export der Seite (3840 × 2160) beurteilen | gelungen | `dl-page-2-seite-2.png` | Scharf, Beispielwerte und Kommentartext drin, Warnpunkte weg. Kernaussage fehlt, Sortierung fehlt, KPI-Werte aus Zufallszahlen (Aufträge 220,3M neben Umsatz 12,5 Tsd.). |
| 10 | Anti-Pattern: KPI-Kacheln auf Kreis und Tacho umstellen | gelungen | `10-b7-antipattern.png`, `11-b7-antipattern-zoom.png` | Roter Schraffur-Überzug plus rotes Ausrufezeichen, Hinweis im Inspector, zwei Warnungen im Export, kein Blockieren. Donut, Säulen + Linie (Zweitachse), Fläche, Treemap und Tornado bekommen keinen Hinweis. |
| 11 | Tabellenabdeckung prüfen (Katalog-Rollen und Skizzen) | gelungen | `sk-10-sparktable.png`, `sk-09-relvar.png` (GuV), `sk-06-map.png` (Matrix) | Vier Tabellentypen, die Skizzen sind gut. Die Spec kennt für `table` nur `rows`, `ac`, `ref`: keine Spaltenliste, keine Reihenfolge, kein Format je Spalte, keine Zellenbalken-Entscheidung, keine Summenzeile. |

## 3 · Was mir fehlt (Top 5, nach Wichtigkeit)

**1. Die Kernaussage und die Sortierung müssen auf der Kachel sichtbar sein.**
Was: `analysis.message` als Titelzeile oder Botschaftszeile in Skizze, Präsentation und PNG; `sort` und `topN` auf die Skizze anwenden, auch bei eigenen Beispielwerten.
Warum: Im Workshop einigen wir uns auf die Aussage einer Kachel, das ist der wichtigste Beschluss der Sitzung. Heute steht er in einem eingeklappten Feld und im Markdown, nicht auf der Seite (`07-a3-praesentation.png`). Und ein Typ, der „Balken (Kategorien, sortiert)" heißt, zeigt meine Regionen in Eingabereihenfolge, obwohl `sort: delta desc` gesetzt ist (`03-b0c-bars-zoom.png`). Der Fachbereich glaubt der Skizze, nicht der Spec.
Wie: Botschaftszeile unter dem Titel (IBCS-Stil, kursiv oder normal), umschaltbar „Titel = Kernaussage"; in `app.js` `sort`, `topN` an `MK_SKETCH` durchreichen, in `sketches.js` auf `useVals` anwenden; Top-N schneidet, Rest als „Sonstige".
Aufwand: klein bis mittel. Bezug: beiden.

**2. Skalengruppen als echtes Objekt, nicht als Freitext.**
Was: `scaleGroup` wird zu einer Gruppe mit ID, Mitgliedern, `scaleMode: shared | own`, `zeroBased`, optional `cap` (Ausreißerkappung wie `relCap` in den Fabric Apps). Auf der Zeichenfläche ein kleines Gruppensymbol an allen Mitgliedern, in der Seiten-Ansicht eine Liste der Gruppen.
Warum: Vergleichbarkeit über Kacheln ist die häufigste Fehlerquelle in Dashboards (Small Multiples mit eigener Skala, zwei Balkencharts mit verschiedenen Nullpunkten). Heute tippe ich einen String, ein Tippfehler spaltet die Gruppe, und der Konverter schreibt ein To-do ohne Zahlenbereich. Die Fabric Apps haben das Konzept bereits (`SmallMultiples.tsx`: „Gemeinsame Skala für alle Kacheln, Werte direkt vergleichbar" gegen „eigene Skala").
Wie: Dropdown mit bestehenden Gruppen plus „neu", Gruppenbereich aus Beispielwerten ableiten und als `range {min, max}` mitexportieren, Skizzen einer Gruppe mit identischer Achse zeichnen.
Aufwand: mittel. Bezug: beiden.

**3. Eine visuelle Grammatik je Kachel jenseits von Typ und Rollen.**
Was: Hervorhebung (`highlight: {category: 'West', reason: '...'}`), Referenzlinien (Ziel, Durchschnitt, Vorjahr, Schwelle), Annotationen und Ereignismarker auf der Zeitachse (Preiserhöhung ab Juli), Achsenentscheidungen (Nullpunkt erzwungen, Kappung mit Doppelstrich), Beschriftungsdichte (alle, Endpunkte, Extrema).
Warum: Das sind die Entscheidungen, über die im Workshop gestritten wird, und sie entscheiden, ob ein Chart eine Aussage hat oder nur Daten zeigt. Heute wandern sie als Prosa in `notes` und kommen als Annotation an, die niemand umsetzt. Die Skizzen können das bereits teilweise (Pareto zeichnet eine 80 %-Linie, Gantt eine Heute-Linie), aber nicht als Entscheidung des Menschen.
Wie: Klappgruppe „Hervorhebung & Linien" im Analyse-Block mit drei bis vier Feldern; Skizze zeichnet Referenzlinie und hebt die gewählte Kategorie hervor (alles andere grau); Spec bekommt `emphasis {highlight, referenceLines[], annotations[], axis {zero, cap}, labels}`.
Aufwand: mittel bis groß. Bezug: beiden, für Rayfin sogar direkt umsetzbar, für Power BI teils nur als To-do.

**4. Tabellen als Spalten-Spezifikation.**
Was: Für `table`, `sparktable`, `matrix` eine Spaltenliste: Reihenfolge, Format je Spalte (Einheit, Dezimalen), Darstellung je Spalte (Zahl, Zellenbalken, Δ-Pin, Sparkline, Heat), Summenzeile und Zwischensummen, Zeilenhöhe, Hierarchie-Einklappen.
Warum: Tabellen sind in Management-Reports die Hälfte aller Kacheln, und die Spec kennt heute nur `rows`, `ac`, `ref`. Die Skizze der Berichtstabelle ist stark (In-Zellen-Balken, Σ-Zeile), aber genau diese Entscheidungen (Balken ja oder nein, in welcher Spalte) kann ich nicht treffen, und ein Agent kann sie nicht bauen.
Wie: Rolle `values` mit max 8 plus je Feld ein Spaltenobjekt im Kachel-Fenster; Skizze rendert die Spalten in der gewählten Reihenfolge; Export `columns[]`.
Aufwand: mittel. Bezug: beiden.

**5. Anti-Pattern als Beratung mit Ausweg, breiter und leiser.**
Was: Mehr Fälle (Zweitachse bei „Säulen + Linie", Donut wie Kreis, Fläche mit mehreren Serien, Treemap für Vergleiche, Tornado für AC gegen PL, mehr als fünf Serien gestapelt), je Fall ein Knopf „Umwandeln in …" und ein Feld „bewusst beibehalten, weil …", das als `antiPattern {accepted: true, reason}` in die Spec geht.
Warum: Heute ist der Mechanismus richtig dosiert (Hinweis, kein Blockieren, Warnung im Export), aber unvollständig: Kreis wird markiert, Donut nicht; die Zweitachse bei `colline` (`sk-02-card.png`, Linie ohne eigene Skala) ist das häufigste Anti-Pattern in Unternehmen und bleibt unbemerkt. Bevormundend wird es nur im Präsentationsmodus: Der rote Schraffur-Überzug sieht vor dem Vorstand wie ein Fehler aus, nicht wie eine Empfehlung.
Wie: Liste `ANTI` in `app.js` erweitern, Überzug im Präsentationsmodus auf ein kleines Symbol reduzieren, Begründungsfeld und Umwandeln-Knopf im Inspector.
Aufwand: klein bis mittel. Bezug: beiden.

Dazu, kleiner: fehlende Typen Cycle Plot, Lollipop, 100 %-gestapelt, Histogramm, Index-Chart; eine Notationslegende als eigenständige Kachel; Small Multiples mit Wahl „gemeinsame oder eigene Skala".

## 4 · Wo das Erlebnis besser sein kann

- **Kachel wählen wechselt den Inspector nicht auf „Kachel".** Steht der Reiter auf „Seite" oder „Design", bleibt er dort, obwohl rechts eine Kachel blau markiert ist (`03-a3-felder.png`). Ich habe daraufhin 23 Felder ins Leere gezogen. Vorschlag: Auswahl einer Kachel schaltet auf den Reiter „Kachel", Klick ins Leere zurück auf „Seite".
- **Beispielwerte liegen nur im Kachel-Fenster (N).** Im Analyse-Block der Kachel, wo Einheit, Dezimalen und Sortierung stehen, fehlen sie. Vorschlag: dieselben drei Felder auch dort, denn Beispielwerte sind eine Analyse-Entscheidung („in welcher Größenordnung reden wir").
- **Zufallswerte bleiben unplausibel.** Aufträge 220,3 M, Marge 594,0 M neben Umsatz 12,5 Tsd. auf derselben Seite (`dl-page-2-seite-2.png`). Das ist im Review vom 25.09. (4.2) bekannt und noch offen. Vorschlag: feste Demo-Reihe je Kennzahl-Typ (Betrag, Anzahl, Quote) über den Measure-Namen, dazu Hinweis „Zufallswerte, mit N eigene setzen" als Tooltip am Wert.
- **Eingabeformat der Beispielwerte ist unklar.** „12.480" wurde als 12 480 gelesen und als „12,5 Tsd." gezeigt, obwohl Anzeigeeinheit „K" und Untertitel „T€" gesetzt waren; ob das nun 12,5 Tsd. T€ oder 12,5 T€ sind, sieht niemand. Vorschlag: Platzhalter mit Beispiel und Vorschau „wird gezeigt als …" direkt unter dem Feld.
- **Mittlere Skizzengröße hat Labelkollisionen.** Bei `line` 220 × 130 kleben „83 81 88 84" und „AC PL" zusammen (`sk-05-image.png`), bei `kombi` überlagern sich Δ-Pins und Δ-Balken. 220 × 130 entspricht einer Vier-Spalten-Kachel bei 58 % Zoom, also dem Normalfall am Beamer. Vorschlag: Ausdünnen der Wertelabels (Erste, Letzte, Extrema) unter einer Breite je Kategorie von etwa 28 px.
- **„Säulen + Linie" ist eine Zweitachse ohne Zweitachse.** Die Linie (Marge %) schwebt ohne eigene Skala über den Säulen (`sk-02-card.png`). Als Skizze lesbar, als Vertrag mehrdeutig: Der Entwickler baut eine Zweitachse, die ich nie wollte. Vorschlag: Option „Linie auf eigener Achse (Zweitachse)" mit Warnung, Standard „Linie als Prozent-Ebene über den Säulen" wie in ChartKitchen.
- **Dunkler Kachelgrund bricht WYSIWYG.** Skizze zeigt helle Schrift, der Hinweis sagt „Der Export übernimmt die gewählte Schriftfarbe", also kommt dunkle Schrift auf dunklen Kacheln im Bericht an, wenn ich den Ink nicht von Hand ändere (`05-b2-dark-teal.png`). Vorschlag: Beim Wechsel auf dunklen Grund Ink automatisch auf die Skizzenfarbe setzen und das im Hinweis sagen, oder die Skizze nicht automatisch umschalten.
- **Filterzone kennt den Dark Mode nicht.** Seite und Kacheln dunkel, Filterzone bleibt hellbeige (`05-b2-dark-teal.png`). Vorschlag: Filter- und Nav-Zone aus `colors.pageBackground` ableiten oder eigene Farbe anbieten.
- **Analyse-To-dos erklären sich nicht immer.** „Top 5: braucht ein Kategorie-Feld und eine Kennzahl auf einem nativen Visual, hier nicht beides vorhanden" ist falsch gelesen: beides ist vorhanden, nur die Engine ist ChartKitchen (`out-mine/analysis-todos.md`). Vorschlag: Text „Kachel ist ChartKitchen, Top-N im Slot setzen" wie bei `SORT_NOT_NATIVE`.
- **Skalengruppe als Freitext** ohne Vorschlagsliste, siehe Punkt 2 in Abschnitt 3.
- **Pixelgenau-Befund nach bewusstem Spurziehen.** Zwei Einträge `LAYOUT_NOT_PIXEL_PERFECT` in meiner Spec, nur weil ich die KPI-Zeile kleiner gezogen habe. Für meine Rolle ist das Rauschen zwischen den Befunden, die mich interessieren. Vorschlag: Info-Befunde im Export-Dialog einklappen, Warnungen und Fehler zuerst.
- **Bars-Skizze zeigt Legende „AC · PL · FC"**, auch wenn keine FC-Rolle gebunden ist (`sk-00-absvar.png`, Zeile `bars`). Kleinigkeit, aber Legenden sind Vertrauenssache.

## 5 · Zusammenführung mit Fabric Apps / Rayfin

Ich habe die fünf Apps unter `/home/user/Fabric-Apps-Demo/apps/` und die Learnings in `memory/` gegen die Spec gelesen. Die Apps brauchen je Kachel genau das, was eine gute Visualisierung braucht, und davon trägt die Spec heute etwa die Hälfte.

**Was die Spec tragen muss, damit aus einer Kachel ein Rendering mit Daten wird**

- *Kennzahl-Semantik statt nur Feldname.* `KpiDef` in den Apps (`lib/util/kpis.ts`) kennt `unit` (typisiert: h, n, pct), `higherBetter`, `additive`, `hasPlan`, `info`, `warning`. Die Spec hat `polarity` (gut), `unit` als Freitext (zu schwach) und nichts zu Additivität. Ohne `additive` weiß ein Renderer nicht, ob er eine Brücke zeichnen darf („Brücken nur für additive KPIs", `04-design-ibcs.md`). Vorschlag: `fields[]` um `additive`, `unitType`, `scenarios[]` (welche Szenarien es für dieses Measure gibt) erweitern; aus dem Steckbrief ableitbar, im Workshop bestätigbar.
- *Kernaussage als Regel, nicht als Satz.* In den Apps ist `message` aus den Daten berechnet (`TeamPage.tsx`: `multMessage`, `rankMessage`). Ein statischer String aus dem Workshop ist nach dem ersten Datenupdate falsch. Vorschlag: `message {mode: 'static' | 'rule', text, rule: 'largest-delta' | 'top-share' | 'period-vs-plan', template}`; im Workshop formuliert man das Muster („Region mit größter Abweichung nennen"), die App füllt es.
- *Skala und Kappung.* `scaleGroup` mit `mode shared | own`, `zeroBased`, `cap {rel}` (die Apps kappen Ausreißer mit Doppelstrich). Siehe Abschnitt 3, Punkt 2.
- *Periodenlogik.* Die Apps brauchen `lastActualMonth`, FC-Trennlinie, YTD gegen MAT gegen Monat als Umschalter (`timeVariant`), Fiskaljahresstart. Die Spec hat `timeGrain` und `cumulative` als Einzelwerte. Vorschlag: `period {grain, variants: ['month','ytd','mat'], fiscalStart, splitAtLastActual: true}`.
- *Interaktion jenseits von Power BI.* `Tile.tsx` kennt `zoomable`, `collapsible`, Zoom in Small Multiples, Filter-Chips über der Seite, Details on demand, URL-Hash. Die Spec hat `interaction {drillDown, crossFilter, drillThrough}`. Vorschlag: `interaction` abstrakt halten (`filterOnClick`, `zoom: 'overlay' | 'smallMultiples'`, `detailsTarget: <Kachel-ID oder Seite>`, `collapsible`) und je Ziel mappen: Power BI macht daraus Drill-through und Bookmarks, Rayfin daraus Routen und Overlays.
- *Beispielwerte als Test-Fixtures.* `samples` sind heute „nur Anschauung". Für eine App sind sie der perfekte Vertragstest: Die Spec-Tests der Apps (`*.spec.tsx`) prüfen genau solche Reihen auf NaN und Botschaft. Vorschlag: `samples` beibehalten, als `expected`-Fixture für die App-Tests deklarieren, nie als Daten in den Bericht.

**Was heute Power-BI-spezifisch ist und abstrahiert werden muss**

- `native.buckets`, `pbir-visuals.*.json`, `chartKitchenMode`, `customVisual.guid`: das ist die Power-BI-Zielschicht. Sie sollte neben einer neutralen Kachel-Semantik stehen, nicht an ihrer Stelle. Die neutrale Form ist bereits da: `kind`, `roles`, `scenario`, `analysis`. Wichtig ist, dass nichts nur in `native` steht.
- Slicer-Arten (`dropdown`, `tile`, `between`, `button`, `relative`) und Bookmark-Paare für den Burger: für Rayfin werden daraus Steuerelemente und ein Filter-Chip-Band. Ein `filter.mode: 'chips'` als Zonenvariante wäre die App-Entsprechung, die Apps berichten, dass Chips „beim Publikum am besten ankamen".
- Rechtecke in Canvas-Pixeln: Für Power BI maßgeblich, für eine responsive App nur Hinweis. Das Raster (`layoutTree` mit `grid`, `cols[]`, `rows[]`) ist die portable Wahrheit und sollte in der Spec gleichberechtigt sein, dazu je Kachel `minSize` und eine Einklapp-Reihenfolge für schmale Bildschirme.
- Design: `varianceColors`, `colors`, `typography` passen gut auf die Notations-Konstanten der Apps (`lib/ibcs/notation.ts`). Es fehlen die Szenariofarben (AC, PY, PL-Kontur, FC-Schraffur) als Token und die Wahl „VP statt PY", wenn es kein Vorjahr gibt.

**Was nicht verloren gehen darf**

- Die SUCCESS-Semantik je Kachel: Szenarien je Rolle, `deltaBasis`, `deltaKind`, `polarity`. Das ist der Vorsprung gegenüber jedem Figma-Export.
- Stabile IDs und Hash: damit eine App-Komponente ihre Kachel wiederfindet, wenn das Mockup sich ändert.
- Der Kennzahlen-Steckbrief mit DAX, Format, Owner und Bestätigung: die Apps rechnen KPIs selbst, der Steckbrief ist dann die Quelle für `KpiDef.info` und die Vertragstests.
- Workshop-Status und offene Fragen je Kachel, dazu `issues[]` als Daten.
- Beispielwerte, siehe oben.

## 6 · Neue Fehler (nicht im Review vom 25.09.)

| ID | Beschreibung | Schwere | Repro | Beleg |
|---|---|---|---|---|
| N1 | Sortierung und Top-N aus dem Analyse-Block wirken nicht auf die Skizze, auch nicht mit eigenen Beispielwerten. Der Typ heißt „Balken (Kategorien, sortiert)", zeigt aber Eingabereihenfolge. In `app.js` (Aufruf von `MK_SKETCH`, Zeile um 664) werden `sort` und `topN` nicht übergeben. | mittel | Balken-Kachel, N: Kategorien „Nord, Süd, Ost, West, Mitte", Werte „98, 84, 76, 70, 56", Vergleich „95, 91, 74, 81, 55"; Analyse: Sortierung Δ absteigend, Top-N 5 | `03-b0c-bars-zoom.png`, `dl-mockup-spec.json` (`mk_91gd0gm`) |
| N2 | Kernaussage (`analysis.message`) erscheint nirgends auf der Zeichenfläche, nicht in der Präsentation, nicht im PNG. Nur Spec, Brief und Doku tragen sie. `sketches.js` und `render-png.js` kennen den Schlüssel nicht. | mittel | Kachel wählen, Analyse, Kernaussage eintippen, Präsentieren oder PNG | `07-a3-praesentation.png`, `dl-page-2-seite-2.png` |
| N3 | Kachel wählen wechselt den Inspector nicht auf den Reiter „Kachel" (`selectTile` in `app.js` rendert nur den Inspector-Inhalt). Steht der Reiter auf „Seite", gibt es keine Drop-Ziele für Felder. | mittel | Reiter „Seite" öffnen, Kachel anklicken, Feld ziehen | `03-a3-felder.png` |
| N4 | Dunkler Kachelgrund: Skizze zeigt helle Schrift, Export behält `colors.ink` dunkel (laut Hinweis im Design-Reiter und `design.colors.ink` in der Spec). Mockup und Bericht widersprechen sich. | mittel | Design, Kachelhintergrund `#1E2A38`, Hinweis lesen, exportieren | `05-b2-dark-teal.png` |
| N5 | Dunkler Seitenhintergrund: Filterzone bleibt hellbeige. | niedrig | Design, Seitenhintergrund eigene Farbe `#0F1720`, Filter rechts an | `05-b2-dark-teal.png` |
| N6 | Skizze `tornado` hat in keiner Größe Kategoriebeschriftungen, nur Werte. | niedrig | `assets/mockup/sketches-test.html`, Zeile `tornado` | `sk-11-text.png` (zweite Zeile) |
| N7 | Skizzen `bars` und `barskombi` zeigen die Legende „AC · PL · FC", obwohl kein FC gebunden ist. | niedrig | Testblatt, Zeilen `bars`, `barskombi` | `sk-00-absvar.png` |
| N8 | Bei jedem Laden ein 404 in der Konsole (`Failed to load resource`, vermutlich Favicon). Kein funktionaler Schaden, aber jeder Tester stolpert darüber. | niedrig | Seite laden, Konsole | `s01-explore.mjs` (Log) |

## 7 · Was gut ist

- Die Skizzen der integrierten Varianzanalyse, der Wasserfall-Varianten, der Berichtstabelle, der Sparkline-Tabelle und der GuV sind die besten Platzhalter, die ich in einem Mockup-Werkzeug gesehen habe: Δ-Ebenen mit eigener Nulllinie, Σ-Spalte, PL-Kontur, FC-Schraffur, Pin-Köpfe, Kappungsmarker. Ein Fachbereich versteht sie ohne Erklärung.
- Polarität aus dem Measure-Namen, und sie wirkt sofort: „Kosten" mit ΔPL −1 wird teal, nicht rot.
- Eigene Beispielwerte erscheinen in Echtzeit in der Skizze, mit korrekt gerechneten Δ% (`03-b0c-bars-zoom.png`).
- Der Analyse-Block ist das richtige Vokabular (Polarität, Δ-Basis, Δ-Art, Einheit, Dezimalen, Sortierung, Top-N, Zeitgranularität, kumuliert, Skalengruppe, Kernaussage). Die Spec trägt alles, der AGENT-BRIEF formuliert es in einer Zeile pro Kachel, der Konverter sagt ehrlich, was er nicht setzen kann.
- Der Anti-Pattern-Mechanismus ist richtig dosiert: Hinweis, Markierung, Warnung im Export, kein Verbot.
- Dark-Kachelgrund schaltet die Skizzen korrekt um, inklusive Konturen und Schraffur.
- PNG in 3840 × 2160 ist druckbar und zeigt Text-Kacheln mit Inhalt.

## 8 · Noten

Bedienbarkeit: 7/10 · Nutzen für meine Rolle: 7/10 · Reife für Kunden: 6/10

Ich würde es morgen in einem Workshop einsetzen, um Struktur, Felder und Szenarien festzuzurren, unter der Bedingung, dass ich Kernaussage, Sortierung und Hervorhebung weiterhin mündlich und in Notizen transportiere, weil die Skizze sie heute nicht zeigt; sobald N1 und N2 behoben sind und Skalengruppen sichtbar werden, wird es vom Skizzenblock zum Entwurfswerkzeug.
