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

Stand: **1.56.0.0** (22.11.2026): Backlog IBCS-Templates B10 Teil 2, B11 Teil 2, B13 Teil 2, B15, B16, B17 (siehe „Neu in 1.56“); davor 1.55 mit B09, B10, B11 (Teil 1), B12, B13; davor 1.54 mit B01, B04, B05, B06, B14.
Bei Versionssprüngen: CHANGELOG.md zuerst lesen.

**Neu in 1.57 (in Arbeit):**

*B18 · Scatter-Zeitpfad mit Quotenstrahlen (Blätter 07D, 07E, Vorlage C23).* Keine neue Rolle: Vertrag des Play-Modus,
`category` = Periode (Reihenfolge wie geliefert), `series` = Einheit, `actual` = Y, `xValue` = X; `multiples` gibt Pfade
je Kachel, `bubbleSize` bleibt möglich, `fcFlag`/`forecast` kennzeichnen FC-Perioden. Objekt `chart`, Gruppe
„Scatter / Bubble“: `scatterPath` (`off` | `line`, Standard `off`), `scatterPathLabels` (`auto` | `ends` | `all` | `off`,
Standard `auto`), `scatterPathArrow` (bool), `scatterPathDelta` (bool); die drei letzten nur bei `scatterPath=line` im
Pane, `scatterArrows` dann ausgeblendet. Objekt `scale`, Gruppe „Scatter-Achsen“: `ratioRays` (Text, `;`-Liste, je Eintrag
`parseRefValue`, Werte ≤ 0 und Dubletten fallen weg) und `ratioRayUnit` (Text, nur mit Strahlen im Pane).
`scatterConfig` liefert `sc.path`, `sc.pathLabels`, `sc.pathArrow`, `sc.pathDelta`, `sc.rays`, `sc.rayUnit`; mit
`sc.path` sind `sc.arrows` und `sc.pyBubbles` falsch. Alle Zweige hängen an `sc.path` bzw. `sc.rays.length > 0`.
Aufbau in `renderScatter` an festen Stellen, die Arbeit in eigenen Methoden (B19 baut im selben Renderer weiter):
`scatterPathUnits(points, vis, frames)` (Einheit = `stackSeries`, Knoten `null` = Lücke, fehlende Zeile = durchverbunden),
`scatterPathDeltas`, `scatterExtraMargins` (Ränder oben/rechts für Strahl-Labels, unten/rechts für Δ, im `mg` vor dem
Überlauf-Durchlauf; `shrunk` zählt nur den Überlauf), `drawScatterRays` (nach `placed`/`halo`, in `bg`, Labels
reserviert), `drawScatterPaths` (vor der Punktlabel-Schleife; Linien in `scatter-paths` unter `marks`, Labels in
`scatter-path-labels`, nach den Marken nach oben gehängt; Punktnamen entfallen im Pfadmodus). Kontext über
`ScatterPlotCtx` (Skalen, Plotkanten, `placed`, `hitsMark`, `markOf`). `scatterAxisDomain(..., rays)` zieht bei
Strahlen die 0 in lineare Achsen und rundet eine automatische Obergrenze auf den `niceTicks`-Schritt; der Austritt
(`scatterRaySpan`) liegt auf dem aufgelösten Achsenbereich, nicht auf dem Pixelrand. Kacheln: `ScatterShared.tileBox`
(nur mit Strahlen gesetzt) entscheidet über die Labels (oben erste Zeile, rechts letzte Spalte, Zoom alle).
Play: `scatterAnim.paths` (Knoten je Frame, `undefined` = keine Zeile) wächst über `scatterPathD`, `pathLabels` werden
beim Start ausgeblendet, das Ende rendert neu. Tooltip: `attachInteraction(..., { extra })` mit `Tip_Ratio`, nur mit
Strahlen. Δ X neutral (Tinte), Δ Y nach `cfg.isGood`. `data-icd`: `scatter-paths`, `scatter-path` (`data-series`,
`data-n`), `scatter-path-head`, `scatter-path-labels`, `scatter-path-label` (`data-cat`, `data-series`),
`scatter-path-name`, `scatter-path-guides`, `scatter-path-delta` (`data-axis`, `data-v`), `scatter-path-delta-head`,
`scatter-rays`, `scatter-ray` (`data-k`), `scatter-ray-end` (`data-x`, `data-y`), `scatter-ray-origin`,
`scatter-ray-label`, `scatter-hint-path`. Vorlage C23 (Galerie Zeitverlauf, braucht `xValue`, Mini `scatterpath`).
Tests c900 bis c917; Galerie-Tests c222 und c230 kennen C23. Standard SVG-gleich (Hash aller 701 Bestands-Stufen,
geändert nur Galerie c222b, c222d, c229, c230, c230b). 953 resjson-Keys je Sprache.

**Neu in 1.56 (Backlog IBCS-Templates Teil 3, 22.11.2026):**

*B13 Teil 2 · Nur Abweichungs-Panel (Blätter 13C, 13D).* `chart.varianceOnly` (bool, Standard false, Gruppe „Small
Multiples“; Pane nur bei Säulen und Balken ohne Stack-Series und ohne `waterfallStyle`). Wirkt nur mit Small Multiples
(`multOrig`), Säulen oder Balken, ohne Stapel und Brücke, und wenn `showAbs` oder `showRel` aktiv ist
(`cfg.varianceOnly`); dann ist `showDual` aus und die Jahressäule wird nicht gebaut. Basis: `multiplesBasis=avg` (ΔØ)
oder Szenario (ΔPY/ΔPL). `domains.abs`/`rel` kommen aus `shownGroups` ohne `kind === "total"` (plus `fixedVarMax`).
`renderChartBody`: Δ-Kachel (`varOnly`, ab 110 px Höhe bei Säulen, 240 px Breite bei Balken, sonst
`var-only-fallback` und normale Ansicht) teilt die Plotfläche mit `splitVarOnly` (Δ % über Δ bei Säulen, Δ links von
Δ % bei Balken, `panels.main` als Streifen der Größe 0 unten bzw. links); keine Grundlinie, kein Titel, keine Balken
und Werte des Basis-Panels, kein Σ-Kopf, keine Referenzlinie, kein gleitender Durchschnitt, keine Kombi-Linie. Balken:
Label-Platz aus den deckweiten Δ-Extremen (gleicher px je Einheit). Deckweit aus (`voDeck`, auch in der
Bezugskachel): Kommentar-Marken, Hervorhebungsband, Differenzmarker. `lastScaleK` = px je Einheit des
absoluten Δ-Panels (sonst Δ %), `varOnlyAbsK` sagt, ob es das absolute war. `pl-boundary` beginnt oben im Δ-Panel.
Bezugskachel: `renderCell` misst per `measureScaleK` eine Gruppen-Kachel gleicher Größe (nur mit `showAbs`) und
zeichnet die Bezugskachel mit einer cfg-Kopie ohne Δ (`varOnlyRef`): eigene Domain (Ausdehnung der eigenen Werte samt
`refLine`, gekappt bei `capMax`), px je Einheit = kDelta × `sameScaleFactor(kDelta, kFit, max, 0)`, Faktor ≠ 1 als
„×f“ im Titel. Testmarker: `var-only` (`data-px-per-unit`, `data-panels`), `var-only-fallback`, `var-only-ref`
(`data-px-per-unit`, `data-factor`, `data-k-delta`, leer ohne absolutes Δ), `var-only-guides`/`var-only-guide`
(Hilfslinien nur bei Säulen, Deckkraft 0,3, Hochkontrast 0,6). Rezept 13C: Rezept 13A + `multiplesBasis=avg` +
`showAbsoluteVariance` + `varianceOnly`; 13D dasselbe mit `showRelativeVariance` statt absolut. Nicht abgebildet: die
doppelt hohe Kachel (13B, Teil 1b), „ΔØ“ rechts an der Nulllinie. Tests c700 bis c710.
838 resjson-Keys je Sprache.
**Review-Stand:** Heldenlayout unter `cfg.varianceOnly` aus (`heroOn`), damit misst `renderCell` den Peer immer
in einer Gitterzelle gleicher Größe bzw. auf der Zoomfläche (M1, m1). Der Bezugszweig greift nur, wenn der
Peer-Trockenlauf wirklich Δ-only gezeichnet hat (`varOnlyDrawn`, nicht `varOnlyAbsK`); sonst zeichnet die Bezugskachel
normal mit `refTileNoDelta` und Deck-Domain. Im Rückfall (`varOnlyWant && !varOnly`) nutzt `renderChartBody` die
normalen Δ-Domains (`varOnlyNormal`, vor dem Δ-only-Override gesichert), `voDeck` gilt nur für echte Δ-Kacheln und
die Bezugskachel; Jahressäule und Doppelabweichung bleiben auf cfg-Ebene aus, zeigen im Rückfall aber ohnehin nicht
(kompakte Kachel). Hochkontrast-Plan-Δ: `stroke-dasharray="3 2"`, Balken günstig gefüllt mit Papier-Strichen,
ungünstig hohl; Pins mit gestricheltem Stiel, Kopf gefüllt bzw. hohl nach günstig. `fmtPercent(v, whole)` und
`relText(p, second, whole)`: ganzzahlig in Δ-Kacheln (auch der Label-Platz bei Balken). Hilfslinien nur bei
`showCatAt(i)` oder Hervorhebung. Bezugskachel: `scale.fixedMax` erweitert ihre Domain (mit `capOverflow` hartes
Ende), `showTotal` aus bei `multiplesAgg=mean`. Ellipsen-Hervorhebung (`emph-ellipse`) bleibt, nur das Band entfällt.
Pane: Schalter nur mit `showAbsoluteVariance` oder `showRelativeVariance`; aktiv mit Small Multiples blendet er
`multiplesHero` und `dualVariance` aus. Tests c711 bis c725 (c718 prüft die Nulllinie an c700).

*B10 Teil 2 · Stapel-Blöcke mit Zwischensummen (nach IBCS-Blatt 02A).* Objekt `chart`, Gruppe „Darstellung“, nur gestapelte Balken mit Kategorie-Hierarchie (Formatbereich zeigt die Optionen nur dann). `stackBlocks` („Stapel-Blöcke“: `off` | `gap` | `subtotals` | `subtotalsButLast`, Standard `off`): Blockquelle ist Kategorie-Ebene 0 (`catLevels[0]`), angezeigt wird der Rest des Pfads („Switzerland“, bei drei Ebenen „DACH · Switzerland“); `p.cat` bleibt der volle Pfad und Schlüssel. Keine neue Rolle, Zwischensummen rechnet das Visual. Layout über die Slot-Tabelle `rowSlot` in `renderStacked` (ohne Blöcke `rowSlot[i] === i`): je Block seine Zeilen, bei `subtotals` ein Slot Zwischensumme (bei `subtotalsButLast` nicht am letzten Block; nicht bei gemischten Szenarien im Block), zwischen zwei Blöcken 0,5 Slot. Σ-Zeile und Zwischensumme teilen `drawStackSumRow` (Werte: Legendenzeile, ganz oder nur Summe; 100 %: Mix-Balken). In `render()` werden die Zeilen je Block zusammengelegt (`stackBlockSplit`), Top N wirkt je Block (`applyTopNStacked(..., block)`, „Rest (n)“ erbt den Block), Sortierung je Block (`sortStackCats(..., block)`, Rest-Erkennung am Blattnamen), die Blöcke nach Blocksumme absteigend, ohne `sortMode` in Datenreihenfolge. Mit Blöcken aus: `stackShareBracket`, `groupEvery`. `stackBlockShare` (bool, Standard aus, nur mit `subtotals*`): Blockanteil in einer Ellipse hinter der Blocksumme, „100 %“ an der Σ-Zeile, Zeilenanteil über hervorgehobenen Zeilen; bei 100 % mit Summen-Panel stehen Blocksumme und Anteil im Panel. Mit Blöcken: `highlightStyle=ellipse` zeichnet einen Pfeil ▼ auf das Balkenende hervorgehobener Zeilen (ohne Blöcke nicht, wie 1.55); `highlight` trifft auch den Blattnamen. Marker (`data-icd`): Wurzelgruppe `data-blocks="2"`, `stack-block` (`data-block`, enthält die Zeilen), `stack-block-total` (`data-block`, `data-total`) mit `stack-total-seg` und `stack-block-grand`, `stack-block-share` (`data-share`, auch an der Σ-Zeile und im Panel), `stack-row-share`, `stack-hl-arrow`. Rezept Blatt 02A: `orientation=bars`, `sortMode=ac`, `stackBlocks=subtotalsButLast`, `stackBlockShare=true`, `stackTotalRow=true`, `stackTotalLabel=World`, `highlight=Switzerland, USA`, `highlightStyle=ellipse`. Abweichungen: Summenlinie volle Breite, Rest-Zahlen aufrecht, Blocksumme mit „=“, keine Segment-Ellipse, keine Blöcke bei Säulen. Tests c830 bis c849c; bestehende Stufen SVG-identisch (Hash aller 485 Stufen). Review-Stand: `maybeAutoExpand` fragt `autoExpandWanted(orient, stackBlocks, stackShape, axisGroups, hasSeries)` (exportiert): Tabelle und GuV wie bisher, Balken nur mit Serie und `stackBlocks` ≠ `off`, Säulen nur mit Serie, `stackShape=area` und `axisGroups` ≠ `off`; gleiche Signatur-Sperre (einmal je Feld-Konstellation), nackte Stapel nie. `paneHasCatLevels` ist auch bei drillbarer Kategorie wahr (`drillableRoles.category`), damit `stackBlocks` vor dem ersten Aufklappen im Formatbereich steht. Der Schalter `autoExpandHierarchy` liegt weiter nur in der Tabellen-Gruppe. Desktop-Drill im Harness nicht simulierbar, geprüft über einen Spion auf `host.drill` (c851, c824); Desktop-Verifikation offen. Zeilenanteil und Pfeil (`stack-row-share`, `stack-hl-arrow`): ist die Zeile darüber Nachbar im selben Block (`rowSlot[i-1] === rowSlot[i] - 1`) und reicht sie samt Summenlabel über den Pfeil bzw. die Ellipse, steht die Ellipse rechts der eigenen Summe auf Zeilenmitte und der Pfeil ist höchstens `step - slotW - 1` hoch (unter 6 px keiner). Anteile nur, wenn alle Blocksummen ≥ 0 und die Gesamtsumme > 0 sind, Zeilenanteil nur bei Zeilensumme ≥ 0. Pfeil nur mit aktiven Blöcken. Stapel-Rampe über `stackRampRgb` (hell zu Grau 200, dunkel zu Grau 90) und Textfarbe über `stackRampText` (hell: Luminanz-Regel bzw. in `renderStacked` weiter die Index-Regel, dunkel: höherer WCAG-Kontrast), geteilt mit `renderStackedArea`. Rest-Zeilen bei drei Ebenen am letzten Level (`sortStackCats` mit Block, Kursiv-Regel). Tests c851 bis c856; geändert nur c846 (Rest-Zeile kursiv am Blockende). Schlussrunde: `getFormattingModel` hängt den einen Slice `autoExpandHierarchy` je Modus in genau eine Gruppe: Balken mit sichtbarem `stackBlocks` ≠ `off` → `displayGroup` direkt nach `stackBlocks`, Fläche (`isArea`) mit `axisGroups` ≠ `off` → `stockFlowGroup` nach `axisGroups`, sonst `tableGroup` nach `valueColumns` (wie bisher; die Gruppe ist nur bei `table` sichtbar). Ein Slice darf nicht in zwei Gruppen stehen (doppelte uid). Test c857 (Gruppen-uid im fertigen Formatmodell).

*B11 · Bestand-Fluss-Modus, Teil 2 (Aggregation über die Zeit, YTD, Fluss-Zoom; Blätter 08E bis 08H).* `chart.timeAggregation`
(`sum` | `last`, Standard `sum`, „Aggregation über die Zeit“, Gruppe „Daten & Zeit“, sichtbar in `columns`, `line`, `table`,
`cards`, `stockflow`): mit `last` fassen alle Stellen, die über die Zeit zusammenfassen, als letzter Wert zusammen:
`cumulate` (YTD/QTD/R12 reichen durch, YTD-Chip gesperrt mit `Lock_YtdLast`), `buildYearPoint` (Jahressäule, Beschriftung
`Label_LastValue` „Ende“ statt „Σ“, sofern `yearColumnLabel` leer), Tabellenbaum, Σ-Zeile und Matrix (`aggregateTime`
statt `aggregateHierarchy`; über mehrere Spaltenblöcke, also Matrix-Σ und Zellen über Unterspalten, nur mit `last`,
nicht automatisch für `stock`), `mergeColPoints` (nur Kinder, die sich allein in der Trend-Periode unterscheiden; Spaltengruppen
bleiben Summe), Karten-Trend (`cardTrendValue = sum` wirkt dann wie `last`) und `drawTotalHeader` (nur Säulen/Linie,
„Ende 263“, Text trägt `data-agg="last"`). Referenz ist `lastKid`: die letzte Periode mit Ist oder Forecast, sonst die letzte
mit Plan oder Vorjahr; ihre Basis und ihr Δ gelten unverändert. **Zeilen mit dem Token `stock` aggregieren über die Zeit
immer so** (`timeLast`: alle Kinder `sfKind = stock`), auch bei `sum`; über Kacheln (Σ/Ø/Rest), Spaltengruppen, Regionen
und Dubletten bleibt ein Bestand eine Summe. Im Modus `stockflow` ist YTD frei (`cumulative` sichtbar, Chip nicht mehr
gesperrt): `cumulateSeries` kumuliert je Serie und Token, die Zelle `value ?? pl` läuft durch (Ist, danach Plan angehängt),
`stock`-Zeilen und `lineVal` bleiben; Rücksetzen bei Monatsnamen im Blatt-Label (`catLevels` letzte Ebene) am
Fiskaljahresbeginn, sonst beim Wechsel der obersten Ebene; gesperrt nur bei reinen Bestandszeilen (`Lock_YtdStockFlow`,
Text angepasst). `chart.sfFlowZoom` (bool, Standard false, Gruppe „Bestand & Fluss“): `sfDeckOf` wählt deckweit den
größten Faktor f aus `ZOOM_FACTORS` mit f · max(Fluss, Netto) ≤ Bestand / 3 (kein Faktor, wenn keiner passt); Flüsse
(`YF`) und Netto (`YN`) zeichnen mit kpx · f, Bestand mit kpx. Marker: Wurzel `stockflow` mit `data-zoom`, `scale-zoom`
(`data-factor`, `data-band`) im Hauptpanel (Band im Bestands- und im Fluss-Maßstab), „×f“ an `sf-net-title`,
`sf-name-in`, `sf-name-out` (je `data-zoom`). Konsistenzhinweis im Bearbeitungsmodus: `[data-icd="sf-hint"][data-kind="consistency"]`
(`data-n` = Zahl der Perioden, `Hint_StockFlowConsistency` mit `{list}`), wenn Bestand[t] − Bestand[t−1] − Netto[t] größer
als eine halbe Einheit der Beschriftung ist; nicht bei YTD, nicht in synthetischen Kacheln (`renderStockFlow(…, synthetic)`),
nicht in Perioden mit `flowsDropped` und nur, wenn kein Hinweis `mixed` steht. Verhaltensänderung: `stock`-Zeilen in
Jahressäule, Tabelle, Trend-Rolle und Karten zeigen den letzten Wert; c610 prüft den freien YTD-Knopf, c626 liefert den
Bestand in der zweiten Trend-Periode vollständig. 845 resjson-Keys je Sprache. Tests c730 bis c743. Noch offen (Teil 3):
Jahreszeile aus einer einzelnen Datumsspalte, `axisGroups` in Säulen und Linie, ΔBestand gegen PL/PY.
Review-Stand: `aggregateTime(key, kids, time)` verlangt die Zeitlage der Kinder: `null` = keine Zeitebene darunter, immer
Summe (auch für `stock` und `last`); `"each"` = jedes Kind eine Periode (Σ-Zeile bei Zeit als oberster Ebene,
`mergeColPoints`); eine Funktion = Zeitschlüssel je Kind, Kinder mit gleichem Schlüssel (Struktur) werden zuerst
summiert, dann gilt `lastKid` über die Perioden. Zeitebenen erkennt `isPeriodLabel` (ganzes Label: Jahr, FY/GJ,
Quartal, H1/H2, Monatsname mit optionalem Jahr, KW/W/CW, Datum, ein- bis zweistellige Zahl; strenger als `monthOf`)
über `periodLevels` je Ebene (alle Labels der Ebene müssen passen); `rowPeriodLevels`/`colPeriodLevels` liefern `[]`,
solange weder `timeAggregation = last` noch eine `stock`-Zeile vorliegt (keine Kosten). `timeKeyOf(rowTime, d, colTime,
colFrom)` baut den Schlüssel aus den Zeilenebenen unter Tiefe `d` und den Spaltenebenen ab `colFrom`. Aufrufer:
Tabellenbaum (`TNode.d`), Σ-Zeile (`rowTime[0] ? "each" : null`), Matrix `aggFor` (`RNode.d`, Spaltenebenen ab 0, Quartale
als Spalten = Zeit), `cellFor` (Tiefe = gemeinsames Pfad-Präfix, Unterspalten ab Ebene 1 bei zugeklapptem Block),
`totalCellAt` und Matrix-Σ wie die Σ-Zeile. Verhaltensänderung: `last` über reine Strukturebenen summiert wieder.
`cumulateSeries` ruft zuerst `sfFillPeriods`: Periodenachse = eindeutige `catLevels`-Pfade in Lieferreihenfolge; hat eine
Fluss-Serie ab ihrem ersten Auftreten eine Lücke, werden die Zeilen nach Periode gruppiert und je fehlender Periode eine
Zeile mit 0 im Szenario der Periode (Wert, PL, PY wie die anderen Zeilen der Periode, `sel` null) eingefügt; nach der
Kumulierung entfallen eingefügte Zeilen mit laufendem Wert 0. Ohne Lücke bleibt die Liste unverändert (SVG-gleich).
Jahressäulen-Tooltip: reiner FC-Wert heißt „FC“. Tests c744 bis c751 (c744 bis c749 und c751 Aggregation, c750 YTD mit
lückenhaften Abgängen).

*B16 · Gestapelte Fläche (Blatt 08A).* Properties im Objekt `chart`, Formatbereich-Gruppe „Darstellung“: `stackShape` („Stapel-Form“: `columns` = „Säulen“, Standard | `area` = „Fläche“; sichtbar bei `orientation=columns`), `areaTotalLine` („Summenlinie“, bool, Standard an) und `areaValueLabels` („Werte in den Flächen“: `auto` | `ends` | `off`, Standard `auto`), beide sichtbar nur bei `stackShape=area`; `axisGroups` (B11, Gruppe „Bestand & Fluss“) gilt auch für die Fläche, die Gruppe zeigt dann nur diese Option. Keine neue Rolle und keine neue Orientierung: Mit gebundener Rolle `series` und `stackShape=area` verzweigt der Säulen-Stapel auf `renderStackedArea` (gleiche Datenstrecke wie `renderStacked`: `stackLayout`, `cfg.stackDomain` über alle Kacheln, 100 % über `stackNormalize`, Serienreihenfolge wie geliefert, erste Serie unten und am dunkelsten). Ohne Serie bleibt der Schalter wirkungslos (einfache Säulen, im Bearbeitungsmodus Hinweis). Geometrie: ein Punkt je Periode in der Bandmitte (Abweichung vom Blatt, das die Monatsgrenze nimmt), je Serie und Lauf gleichen Szenarios ein Polygon; das Stück zwischen zwei Punkten trägt das Szenario des rechten Punkts (AC Ton, FC `stackHatch`, PL 28 % Ton mit Umriss in PL-Farbe), Grenzstrich am letzten Punkt davor. Eine Periode, in der keine Zelle einen Wert trägt, unterbricht Flächen und Summenlinie; eine einzelne Periode zwischen Lücken wird als 4 px breiter Splitter gezeichnet; eine fehlende Zelle zählt 0. Durchgehend negative Serien stapeln unter null; wechselt eine Serie das Vorzeichen, zeichnet `renderStacked` (Säulen) plus Hinweis. Seriennamen rechts neben der letzten Periode auf halber Bandhöhe mit Verdrängung (`stackLegendPos=start`: links), sonst Legendenzeile; bei Small Multiples immer Legendenzeile. Blatt-Reihenfolge (Priority 1 oben): Serienspalte im Modell absteigend sortieren (Sortierspalte), die Töne folgen der Lieferreihenfolge. Interaktion: je Periode und Serie eine unsichtbare Zelle (`area-cell`, Polygon in Papierfarbe mit `fill-opacity` 0; Auswahl und Cross-Highlight setzen 0,65 statt der Gruppen-Opacity, `catGroups[].veil`), Tooltip mit Anteil (`Tooltip_Share`) und Periodensumme (`attachInteraction` Option `extra`). Testmarker (`data-icd`): `stack-area` (Wurzel, `data-n`, `data-norm`), `area-seg` (`data-series`, `data-si`, `data-scen`), `area-sep`, `area-sliver`, `area-total-line`, `area-total-pt` (`data-scen`, `data-v`, `data-i`), `area-total-label`, `area-value` (`data-series`, `data-v`, `data-i`), `area-direct-label`, `area-100`, `area-axis`, `area-cell`, `area-hint` (`data-kind` `sign` | `series` | `space`), `stack-legend`; wiederverwendet `fc-boundary`, `pl-boundary`, `scen-label`, `axis-group`, `axis-group-sep`, `emph-ellipse`, `stack-comment`, `stack-refline`, `group-sep`. Vorlage C07 (siehe Mapping). Nicht in Teil 1: `diffMarkers`, YTD, liegende Variante, Seriennamen nur in der letzten Kachel einer Small-Multiples-Zeile. 854 resjson-Keys je Sprache. Tests c800 bis c823 (Harness) und AREA08A (`test/scale.html`); bestehende Stufen SVG-identisch, geändert nur die Vorlagen-Galerie (neue Kachel C07). Review-Stand: Fläche mit Serie und `axisGroups` ≠ `off` klappt eine drillbare Kategorie selbst auf (`autoExpandWanted`, siehe B10 Teil 2). `cfg.capMax` ist bei `stackAreaWanted` null (auch im Vorzeichen-Rückfall auf Säulen), `fixedMax` erweitert die Skala; `capOverflow` im Formatbereich bei `isArea` verborgen. Rampe und Textfarbe aus `stackRampRgb`/`stackRampText` (dunkel zu Grau 90, Text mit dem höheren Kontrast). `area-sep` nur über AC- und FC-Stücken (Stück i−1 → i trägt `scen[i]`; PL ausgelassen, Pfad mit neuem `M`). Seriennamen rechts bei `X(lastP) + 8`. Hervorhebung: `emphAt(i)` trifft `cats[i]` oder `leaf[i]`; Ellipse ohne Summenlabel (`areaTotalLine` aus oder keine Labels) zeichnet das Band (`emphBand` mit `highlightEllipse: false`). Werte (`area-value`) entfallen in Perioden mit negativem Anteil, wenn sie Summenlabel oder Summenpunkt (`totBox`, 2 px Luft seitlich, 4 px oben und unten seit der Schlussrunde, c807/c858) berühren. Alle Serien negativ (`domain[1] <= 0`): die Skala beginnt `titleH` tiefer. Kommentar-Marker liegen in der Label-Gruppe über `hitG`. Tests c824 bis c829 (c826 prüft den Kontrast in c817); geändert c805, c807, c817, c821.

*B15 · Kumulierte Linie YTD mit R12, Monatssäulen und Abstandsmarkern (nach IBCS-Blatt 07C).* Kein neuer `orientation`-Wert: Optionen auf `line` im Objekt `chart`, Formatbereich-Gruppe „Linie“ (`chartLine`, nur im Modus Linie sichtbar), alle Standard aus. Allgemein in der Linie: `lineMarkerShape` (`circle` Standard | `square`: Quadrate AC gefüllt, FC schraffiert, PL hohl, auf dünnen Linien ohne FC-Strichelung und ohne hohlen PL-Kern) und `lineBasisLabels` (bool: Werte der Vergleichslinie PL bzw. PY beschriften, Seite weg von der Ist-Linie). Nur mit `cumulative` und `cumulativeKind` = `ytd` (sonst im Pane ausgeblendet und ohne Wirkung): `lineR12` (bool), `lineR12Label` (Text, leer = „R12“, Blatt „MAT“), `linePeriodColumns` (`off` | `same`), `lineGapMarkers` (`off` | `actual` | `end` | `both`). `scenarioLabels` ist jetzt auch in `line` sichtbar und wirkt dort (Kürzel-Zeile unter der Achse, Kürzel am Ende jeder Linie und an den Periodensäulen). **R12-Quelle** je Kachel in dieser Reihenfolge: (A) Rolle `lineMeasure` gebunden (irgendeine Kachel), Werte unverändert; (B) genau 12 Perioden, beginnend im Fiskalstartmonat (falls die Monate erkennbar sind), PY in jeder Periode: R12(m) = Σ PY − PY_YTD(m) + YTD(m) mit YTD aus AC/FC; (C) mindestens 13 Perioden: Fenster über die Werte, Linie ab Index 11, eine Lücke im Fenster gibt null; sonst keine Linie und `Hint_R12NoSource` im Bearbeitungsmodus. **Implizite Regel:** Bei Quelle B, Basis Plan und ohne `dualVariance` wird PY vor der Kumulierung entfernt (keine PY-Linie, kein ΔPY, nicht im Titel). Rechnung in `render()` vor `cumulate` (`r12Values`, Felder `DataPoint.perVal`, `perPy`, `perPl`, `r12`, Quelle je Kachel in `lineR12Src`); Optionen als `cfg.lineOpts` (`LineOpts`, null bei lauter Standardwerten, damit die Linie bytegleich bleibt). Skala: R12 und Periodensäulen gehen in die gemeinsame Hauptdomain (eine Nulllinie, wie auf dem Blatt gemessen). Periodensäulen nutzen die Säulengeometrie (PY-Säule bzw. Dreieck, PL-Umriss versetzt, AC davor), entfallen unter 4 px (`Hint_PeriodColsSpace`) und in kompakten Kacheln (Höhe < 190), ebenso die Abstandsmarker; Linienbeschriftungen, deren Kasten in die Säulenzone samt Säulenlabel reicht, entfallen. Ist-Beschriftung mit Linienoptionen: am eigenen Punkt, Seite weg von der Vergleichslinie. R12-Beschriftung jede zweite Periode plus die letzte (zu eng: normale Ausdünnung), immer oberhalb, entfällt, wo schon ein AC/FC-Label steht. Abstandsmarker: Balken rechts neben den Linienkürzeln (`diffBarW`), zweite Spur nur bei Überlappung, Δ absolut mit `fmtDiff`, Ende schraffiert bei FC, Platz rechts deckweit aus dem größten |Δ|. Testmarker (`data-icd`): `line-pt` (`data-shape`, `data-scen` ac/fc/pl, `data-v`), `line-ac`, `line-pl`, `line-py` (Pfade, nur mit Optionen), `line-r12` (`data-src` = `measure` | `py` | `window`), `line-r12-pt` (`data-v`, `data-scen`), `line-r12-name`, `line-r12-label`, `line-basis-label`, `line-end-code` (`data-scen`), `period-cols`, `period-col` (`data-v`, `data-scen`), `period-col-pl`, `period-col-py`, `period-col-label`, `period-col-code`, `gap-marker` (`data-at` = `actual` | `end`, `data-v`, `data-track`) mit `gap-bar`, `gap-label`, Niveaulinien `gap-guide` im Hintergrund, `line-hint` (`data-kind` = `r12` | `cols`). Tooltip: „Periode“ (Periodenwert) und der R12-Name. Vorlage C21 (07C, Gruppe `time`, braucht PL): orientation=line · comparisonMode=plan · cumulative=true · cumulativeKind=ytd · lineR12 · linePeriodColumns=same · lineGapMarkers=both · lineBasisLabels · lineMarkerShape=square · scenarioLabels · showAbs/showRel/dualVariance=false · showTotal=false. Für B17 (Serienlinien) ist `LineOpts` die Stelle für eigene Felder; die Linienzeichnung mit Optionen liegt in `drawLinePathsB15`, R12 in `drawR12Line`, Kürzel in `drawLineEndCodes`, Marker in `drawLineGapMarkers`. 864 resjson-Keys je Sprache. Tests c760 bis c774 (c766 entfällt: `own` nicht gebaut).
Review-Stand: Die B15-Vorrechnung (`perVal`/`perPy`/`perPl`/`r12`, PY-Ausblendung) läuft in `render()` an den
Datenkacheln **vor** dem Bau der Rest- und Bezugskacheln; `aggregateGroups` und `meanGroups` führen die Felder über
`carryLineYtd` mit (Summe bzw. Mittel über die Kacheln mit Wert, auch für Dubletten in einer Kachel), die Quelle der
synthetischen Kachel setzt `r12SrcTile` (erste bekannte Quelle der Glieder). Kacheln aus lauter `stock`-Zeilen
(`timeLast`) bekommen weder R12 noch Periodenwerte noch Eintrag in `lineR12Src` (kein Hinweis). `Hint_PeriodColsSpace`
nur, wenn es Periodenwerte gab. `r12Values` Quelle B nur bei zwölf erkannten, verschiedenen Monaten ab `fiscalStart`.
`drawPeriodColumns` liefert `{ sky, floor, codeBoxes }`: `floor` = Unterkante der Zone (negative Säulen samt Label,
sonst Nulllinie); Linien- und Basis-Labels entfallen, wenn ihr Kasten in [sky, floor] reicht (`lnInCols`).
`drawLineEndCodes(…, codes, extra, avoid)` liefert `{ right, boxes }`: zusätzliche Namen am Linienende (`extra`, z. B.
`line-r12-name`, wenn die R12-Linie nicht in der ersten Periode beginnt; dann Platz rechts statt links in `lnRoom`),
Kürzel rücken rechts neben Wert-Labels (`lnLblBoxes`, AC/FC- und Basis-Labels mit x-Ausdehnung). `drawLineGapMarkers`
nimmt Basis-Getter und Basisnamen (unter `avgRows` die gezeichnete Vergleichslinie `lnBasisOf`, `data-v` auf 1e-9
gerundet) und weicht mit dem Label den Kästen der Kürzel aus (`period-col-code`, `line-end-code`). Kommentar-Marke mit
Linienoptionen über dem Punkt, wenn das Ist-Label darunter steht (`lnLblUp`). Formatbereich: `lineR12`,
`linePeriodColumns`, `lineGapMarkers`, `cumulativeKind` (und damit `fiscalStart`) ausgeblendet bei `timeAggregation =
last`. Tests c775 bis c785; geändert c772 (Name R12 am Linienende).
Schlussrunde: `cumulate` setzt `DataPoint.ytdReset` an jedem Neustart (YTD/QTD, nicht R12), `carryLineYtd` reicht ihn an
synthetische Kacheln weiter; `drawLinePaths` und `drawLinePathsB15` beginnen dort einen neuen Pfadabschnitt (`prev = null`).
R12 (`drawR12Line`) läuft durch. Tests c786 bis c789; geändert c772, c783.

*B17 · Serienlinien mit Index (nach IBCS-Blatt 07A).* Kein neuer `orientation`-Wert: Optionen auf `line` im Objekt `chart`, Formatbereich-Gruppe „Linie“, alle Standard aus. `lineSeries` (bool, ausdrücklicher Schalter: eine gebundene Rolle `series` allein ändert die Linie nicht, Bytegleichheit), `lineIndex` (`off` | `base100`), `lineIndexBase` (Text, Kategorie oder unterste Ebene, ohne Groß-/Kleinschreibung; leer = erste Kategorie mit Werten aller Serien, sonst die erste mit irgendeinem Wert), `lineSeriesColor` (`tones` | `palette`), `lineSeriesLabels` (`ends` | `groups` | `all` | `none`), `lineEndDelta` (Text, Komma/Semikolon, `*` = alle). Sichtbar nur mit `lineSeries`; dann sind `lineR12`, `lineR12Label`, `linePeriodColumns`, `lineGapMarkers` und `lineBasisLabels` ausgeblendet, und die Gruppe „Bestand & Fluss“ zeigt `axisGroups`. Wirkung nur mit `orientation=line` und gebundener Rolle `series` (`lineSeriesOn`); dann ist `cumulativeOn` aus (YTD-Chip gesperrt mit `Lock_YtdSeries`). Optionen in `LineOpts.series` (`LineSeriesOpts`, mit deckweiter `domain`: nullbasiert, mit Index bis mindestens 100, sonst `fixedMax`/`refLine`); `cfg.lineOpts` wird mit `lineSeries` auch ohne B15-Optionen gebaut. `renderCell` verzweigt vor `renderChart` auf `renderLineSeries` (`renderChartBody` unverändert). Daten: `lineSeriesLayout(pts, index, base)` gruppiert je Kachel nach Kategorie (Reihenfolge des ersten Auftretens) und Serie, Zellwert `p.value` mit `isFc`; Index nach der Aggregation (Σ-Kachel = Index der Summen). Zeichnung: ein Pfad je Serie und Szenario (Stück trägt das Szenario des rechten Punkts, FC `4,3`), Marken (`lineMarkerShape`) nur an beschrifteten Stellen und am Ende; Labelpunkte bei `groups` mit Hierarchie = Anfänge der innersten Achsengruppe (`areaAxisGroups`, nach Platz ausgedünnt), sonst jeder `every`-te Punkt; gleiche Texte auf gleicher Höhe einmal; `declutterLabels`. Rechte Spalte: Endbeschriftung „Wert Name“ und Δ-Labels der Marker gemeinsam senkrecht entzerrt; Platz rechts aus der breitesten Beschriftung (höchstens 32 % der Kachel) plus Markerspuren. Start-Ende-Marker eigener Zeichner (nicht `drawDiffMarkers`: dessen Label ist an `DiffMarkerSpec` und die Kategorie-Slots gebunden), Balkenbreite `diffBarW`, Δ % mit Index ganzzahlig. Mit Hierarchie entfallen die Blattlabels der Achse, sobald sie ausgedünnt würden. Interaktion: je Kategorie und Serie eine unsichtbare Zelle (senkrechter Streifen bis zur Mitte zur Nachbarlinie), Tooltip mit allen Serien (`extra`). Testmarker (`data-icd`): `series-lines` (Wurzel, `data-n`, `data-m`, `data-index`, `data-base`), `line-series` (`data-series`, `data-n`), `series-path` (`data-scen` ac/fc), `series-pt` (`data-series`, `data-i`, `data-v`, `data-scen`, `data-shape`), `series-value` (`data-i`, `data-series` mit `|`), `series-end-label` (`data-series`, `data-v`), `line-index-base`, `series-group-line` (`data-i`), `end-delta` (`data-series`, `data-v`) mit `end-delta-bar`, `end-delta-label`, `end-delta-guide`, `series-axis`, `series-cell`, `line-hint` (`data-kind` `index` | `series` | `space`); wiederverwendet `axis-group`, `axis-group-sep`. Vorlage C22 (07A, Gruppe `time`, braucht `series`): orientation=line · lineSeries · lineIndex=base100 · lineSeriesLabels=groups · lineSeriesColor=tones · lineMarkerShape=square · showAbs/showRel/dualVariance=false · cumulative=false · showTotal=false; Galerie-Miniatur `lineseries`. Achtung Tests: eine Vorlage überschreibt bei jedem Rendern ihre eigenen Schlüssel, Varianten (z. B. `lineSeriesLabels`) daher mit direkt gesetzten Properties testen. 929 resjson-Keys je Sprache. Tests c860 bis c874 (c230/c222 angepasst: 21 Vorlagen, Zeitverlauf mit Fortsetzungszeile).
**Review-Stand:** `lineSeriesLayout(pts, index, baseName, autoBase)` liefert zusätzlich `baseMissing`; Basis in dieser Reihenfolge: genannte Kategorie oder Blattname, dann ein Gruppenname irgendeiner Ebene (erster Punkt der Gruppe), dann `LineSeriesOpts.autoBase` (im Domain-Durchlauf einmal über `shownGroups` bestimmt: erste Kategorie der ersten Kachel, die in jeder Kachel in allen Serien > 0 ist; nur mit Index und mehr als einer Kachel), dann erste Kategorie mit allen Serien > 0, erst danach die alten Rückfälle. Basiswert ≤ 0 = `noBase` (Serie ohne Werte). Seriennamen `p.stackSeries ?? "(leer)"`. Hinweise (`line-hint`) in der Titelzeile rechtsbündig bei `X(n − 1)` mit Papierrand: `data-kind="index"` (fehlende Serie, jede Ansicht) bzw. `base` (Basis nicht gefunden, nur Bearbeitung), beide Texte mit „ · “ in einem Element; `lineSeriesHint` dient nur noch `series` und `space`. Σ/Ø/Rest: `aggregateGroups` und `meanGroups` übernehmen `catLevels` auch unter `this.lineSeriesRun` (in `render()` gesetzt). Rechte Spalte: `colItems` tragen `si` und `delta`; passt `(k − 1) · gap` nicht in die Höhe, werden Δ-Labels entfernt (Balken bleiben), dann `gap` bis `lf + 1` gestaucht, dann Endbeschriftungen mit höchstem `si` außer `lead` entfernt. `HC_DASH` mit sieben Mustern, Nicht-Leitserien `HC_DASH[1 + rank % 6]` (drei Serien zeichnen wie vorher). Neue Testmarker: `series-end-guide` (`data-series`, Serie endet vor der letzten Kategorie, ohne eigenen Marker), `series-veils`/`series-veil` (`data-i`, erst bei der ersten Abblendung angelegt). Abblendung über `selHooks` (Liste von Rückrufen, am Ende von `applySelectionOpacity`, je Render geleert): Kategorie, deren Zellen alle `opacity 0.35` tragen, bekommt `fill-opacity 0.65`; Serie mit lauter abgeblendeten Zellen setzt `opacity 0.35` auf `line-series`, `series-pt`, `series-end-label`, `end-delta` (sonst Attribut entfernt, SVG ohne Auswahl unverändert). Ellipse: `highlightEllipse` und hervorgehobene Serie legen die `end-delta`-Gruppe in `ellipseTargets` (Ellipse um das Δ-Label). Δ ohne Index ab `firstOf[si]`. `titleScenarios` gibt mit `cfg.lineOpts.series` nur das Wert-Szenario zurück. Formatbereich: `seriesLineOn` (Schalter an und Rolle `series` gebunden) blendet `showAbsoluteVariance`, `showRelativeVariance`, `dualVariance`, `cumulative` (damit `cumulativeKind`, `fiscalStart`), `movingAverage`, `groupEvery`, `pinStyle`, `deltaIcons`, `scenarioLabels`, `fixedVarMax` aus. 930 resjson-Keys je Sprache (`Hint_IndexBaseMissing`). Tests c875 bis c892; geändert c867 (Basis „Jan“ ausdrücklich, Hinweis oben).

**Neu in 1.55 (Backlog IBCS-Templates Teil 2, 21.11.2026):**

*B10 · Stapel-Struktur (Blätter 01D, 01E, 02B bis 02E).* Alle Properties im Objekt `chart`, Formatbereich-Gruppe „Darstellung“. `stackNormalize` („Stapel-Skala“: `off` = „Werte“ | `pct100` = „100 % (Anteile)“, Standard `off`): gestapelte Säulen und Balken als 100 % je Kategorie, Beschriftungen sind Anteile mit einer Nachkommastelle, Panel-Titel mit Zusatz „Anteile in %“. 100 % gilt nur, wenn nichts Negatives gestapelt ist (nach Top N), sonst bleibt der Stapel bei Werten. „100 %“-Marke: bei Säulen über der äußeren Säule (Seite der Seriennamen), bei Balken eine dünne Linie bei 100 % durch alle Zeilen einschließlich der Σ-Zeile mit „▲ 100 %“ darunter. Eine Referenzlinie wird bei 100 % als Anteil gelesen (0 bis 100, größere Werte werden nicht gezeichnet); `fixedMax`/`capOverflow` gelten nicht für Anteile. Bei 100 %-Balken zeigt `showTotal` („Summen-Kopfzeile (Σ)“, Standard an) ein Summen-Panel rechts mit eigener Skala, nur ab 280 px Kachelbreite; bei Small Multiples teilen sich alle Kacheln einen Pixelwert je Einheit, Forecast-Kategorien sind dort schraffiert, Plan-Kategorien umrandet, der Kopf nennt die Szenarien („Σ AC · PL“, „(↓)“ bei Sortierung nach Summe). `stackTotalRow` („Σ-Zeile im Stapel“, bool, Standard aus, nur Balken): Σ-Zeile unten; bei Werten Legendenzeile mit Summe je Serie und Gesamtsumme („= 3.733“; die Serien-Summen ganz oder gar nicht, passen sie nicht, nur die Gesamtsumme; kein Summenbalken, die Summe passt nicht auf die Zeilenskala), bei 100 % ein 100 %-Balken mit dem Gesamtmix. Die Σ-Zeile summiert nur ein Szenario: Bei gemischten AC-, FC- und PL-Kategorien entfällt sie. `stackTotalLabel` („Beschriftung der Σ-Zeile“, Text, leer = „Σ“, z. B. „World“). `stackLegendPos` („Seriennamen (Säulen)“: `end` = „Rechts neben der letzten Säule“, Standard | `start` = „Links neben der ersten Säule“, Blatt 01E). `sortMode` kennt neu `series` („Nach erster Serie (Stapel)“); in Stapelbalken sortiert `ac` nach Stapelsumme, `series` nach der ersten Serie (bei 100 % nach deren Anteil, Blatt 02E); „(↓)“ markiert die sortierte Serie in der Legende; Rest-Kategorien (Rest, Others, Sonstige, „Rest of …“, Top-N-Rest) bleiben am Ende und kursiv. Die Serienreihenfolge eines Stapels bleibt wie geliefert: Sortierung und Top N ändern weder Farbtöne noch Legendenreihenfolge noch, welche Serie die „erste“ ist. Zwei Verhaltensänderungen: (1) `chart.topN` bei Stapelbalken reiht jetzt ganze Kategorien nach Stapelsumme, behält alle Serien-Zellen der Top N und fasst den Rest je Serie zu „Rest (n)“ zusammen (vorher einzelne Zellen und eine Serie „(leer)“). (2) Ein 1.54-Bericht mit Stapelbalken und gespeichertem `sortMode` `ac` („Nach AC“) wird jetzt nach Stapelsumme sortiert (vorher ohne Wirkung auf Stapel). Testmarker (`data-icd`): `stack-100` (100 %-Marke), `stack-total-row` (Σ-Zeile), `stack-total-seg` (Segment der Σ-Zeile, mit `data-series`), `stack-total-grand` (Gesamtsumme), `stack-total-panel` (Summen-Panel, mit `data-px-per-unit`), `sort-mark` (Sortiermarke „(↓)“), `stack-rest` (Rest-Kategorie); die Wurzelgruppe trägt `data-norm="pct100"`, wenn 100 % aktiv ist. Mit den neuen Optionen aus zeichnen Stapel unverändert (SVG-Hash der 364 Harness-Stufen). Nicht abgebildet: 02A (Blöcke mit Zwischensummen), Klammer mit kumuliertem Anteil (02C), Pfeile, Ellipse um ein Segment; Rest-Zeilen behalten in 02B/02D/02E ihren Rang (nur „Rest of world“ zuletzt), ChartKitchen setzt alle Rest-Zeilen ans Ende (B04-Regel), und auf den Blättern sind bei Rest-Zeilen auch die Zahlen kursiv, hier nur der Name. Tests c283 bis c289 und c295 bis c299b.

*B09 · Differenzmarker und zweite Überleitung (Blätter 01A, 01B, 05X).* `chart.diffMarkers` (Text, Formatbereich Chart → „Daten & Zeit“, „Differenzmarker“, unter „Kategorien hervorheben“): gespeicherte Differenzmarker zwischen zwei Kategorien, mit „;“ getrennt. Grammatik: `A > B` (oder `A → B`) zeichnet neben B, auf der Seite weg von A (Säulen rechts oder links, Balken darunter oder darüber), eine dünne Niveaulinie vom Ende von A, einen dicken Differenzbalken (gut/schlecht-Farbe, bei Forecast schraffiert) und Δ plus Δ % (`+12,2 (+12,0%)`). `A > B@Serie` gilt für eine Serie im Stapel (Niveaulinie nur bei der untersten Serie). Ein `!` am Ende lässt Δ % weg (`2025 > 2031!` gibt `−7,0`). Regeln: höchstens 4 Marker, unbekannte Namen werden still übersprungen; bei 100 %-Stapeln nur Serienmarker (Prozentpunkte); Summenmarker nur ohne negative Segmente; ein reiner Plan-Monat vergleicht auf seinem Planwert; zielt ein Marker auf die letzte Spalte, wird rechts Platz reserviert (Stapel-Säulen setzen die Seriennamen dann links neben die erste Säule). `bridgeSecondNet` (bool, Standard aus, „Zweite Überleitung“, Gruppe Brücke, nur bei integrierter Brücke): mit gebundenem Vorjahr und Plan ein zweiter Balken neben dem Netto-Callout mit der Abweichung der Summe zur anderen Basis (Beschriftung z. B. `+4 PY`) und dünner Niveaulinie der anderen Basis; nur wenn die andere Basis jeden Monat mit einem Wert abdeckt. Marker im DOM (`data-icd`): `diff-marker` (`data-from`, `data-to`, `data-series`, `data-delta`) mit Kindern `diff-bar`, `diff-label` (Niveaulinien `diff-guide` und `diff-guide-to` liegen im Hintergrund-Layer, siehe Review-Stand); `bridge-net2` (`data-delta`) mit `bridge-ref2-line`. Tests c290 bis c294; bestehende Stufen SVG-identisch. Dazu `chart.stackShareBracket` (Zahl 0 bis 20, Standard 0; nur gestapelte Balken, nicht bei 100 %, nicht wenn eine Rest-Zeile unter den ersten N steht): Klammer unter Zeile N bis zum Ende der Bezugsgröße (erste Serie bei `sortMode=series`, sonst Stapelsumme), schräg hoch zu Zeile 1, Anteil in einer Ellipse links der Namen (`data-icd="stack-share-bracket"`, `data-n`, `data-share`; Blatt 02C; Test c300). Noch nicht: Vergleichsklick-Paar als Marker im Bericht festschreiben. Review-Stand: Pfeile `>`, `->`, `=>`, `→`; `@Serie` nur hinter dem Pfeil, ohne Stapel oder ohne passende Serie zählt der ganze Text als Kategorie (`DiffMarkerSpec.toFull`); Dubletten entfallen, `DIFF_MARKER_MAX` (4) gilt nach dem Auflösen, bei doppelten Kategorienamen der erste. `diffPlan` legt je Marker Seite (weg von From), Randlage und Versatz fest (Zähler je Lücke zwischen zwei Kategorien, beide Richtungen teilen ihn; `kN` = Marker in der Lücke; Texte am Rand starten hinter dem äußersten Balken, bei Balken eine Textzeile je Lücke, über einer Säule in der Mitte nur so viele Marker, wie Textzeilen bis zur Panel-Oberkante passen, der Rest entfällt; Randplatz höchstens 20 % der Breite, sonst Text über dem Balken; negative Werte: Text unter bzw. links vom Balken; Format wächst bis zu einer Ziffer ungleich null); `diffRooms` reserviert Platz an beiden Bandenden (Säulen: Balken und Text, Balken: nur der Balken; Small Multiples aus der deckweiten Spanne, damit alle Kacheln gleich breit bleiben); mit Jahressäule kein Randplatz, der Text steht dann über dem Balken. Text in der Mitte: über dem Balken und über der „Skyline“ (Säulen samt Wertlabel) unter ihm; Balken: hinter dem Wertlabel der Zielzeile (`clearW`), rechts am Visual geklemmt. Niveaulinien (`diff-guide`, zweite kurze Linie `diff-guide-to`, beide mit `data-from`/`data-to`) liegen im Hintergrund-Layer, nicht mehr im `diff-marker`-Element. Format `cfg.fmtDiff` (Nachkommastellen der Werte, mehr nur bei Rundung auf null); 100 %-Stapel: Prozentpunkte (`Label_PctPoints`), kein Δ %; Δ % entfällt bei n.a. Kein Marker bei `lineMode` und Wasserfall-Stil. `bridgeSecondNet`: Platz nur, wenn gezeichnet (`second`), Breite aus dem Text, Balken 6 px, durchgezogene Linie. Tests c301 bis c310.

*B11 · Bestand-Fluss-Modus, Teil 1 (Blätter 08E, 08F, 08G, 08H).* Neuer Wert `chart.orientation = stockflow`
(„Bestand & Fluss (Zeit)“), eigener Renderer `renderStockFlow` (Layout `stockFlowLayout`). Oben das Netto-Panel (Netto =
Σ Zuflüsse − Σ Abflüsse je Periode, im Visual gerechnet, neutral grau, Beschriftung mit Vorzeichen), darunter im selben
px je Einheit die Zuflüsse über und die Abflüsse unter der Nulllinie (Abfluss AC-Farbe, Zufluss heller, weitere Arten je
Seite als Tönungsrampe, Seitensumme ohne Vorzeichen außen) und der Bestand als Linie mit Fläche bis null; Punkte am
Periodenende, der abgeleitete Anfangsbestand (`stock[0] − net[0]`) am Beginn der ersten Periode. Ein Szenario je Periode
wie B06 (`ac` wenn eine Zeile ein Ist trägt, sonst `fc`, sonst `pl`; Zellwert `value ?? pl` nur in Plan-Perioden): AC
solide, FC schraffiert (Säulen über `stackHatch`, Punkte, Flächenstück), PL als Umriss (Zufluss fast hohl, Abfluss
getönt), Plan-Punkte hohl, Plan-Fläche heller; Flächenstücke unter null in der Schlecht-Farbe mit 14 % Deckkraft
(Nulldurchgang linear geteilt). Domain: `[min(0, Abflüsse, Bestand, Anfang), max(Zuflüsse, Bestand, Anfang, fixedMax,
refLine)]` und Netto-Domain einmal über alle gezeichneten Kacheln (`cfg.sfDeck`); `capOverflow` gilt im Modus nicht.
**Datenvertrag** (keine neue Rolle, Langformat): `category` = Zeit (Hierarchie Jahr › Woche › Tag liefert die Achsengruppen,
`p.cat` ist der Pfad „2025 · W48 · 24“ und bleibt Schlüssel, angezeigt wird die unterste Ebene); `series` = Flussarten und
Bestandsgröße als Mitglieder einer Spalte; `rowType` = neue Flag-Token `stock` (Aliasse `bestand`, `balance`), `inflow`
(`zufluss`), `outflow` (`abfluss`), keine Kurzformen `in`/`out`/`level` (ein Bericht könnte sie heute als Freitext tragen);
`inflow`/`outflow` erzwingen die Seite (`+|v|` / `−|v|`), ohne Token entscheidet das Vorzeichen; `actual`/`forecast`/`plan`
und `fcFlag` gelten für Fluss- und Bestandszeilen. Ohne `stock`-Zeile ist die Linien-Measure der Bestand (erster Wert je
Periode). Die Token wandern als `DataPoint.sfKind` mit der Zeile (nicht als Namensmenge wie die übrigen Flags); als reine
Flags lassen sie `rowType` `null`, andere Modi zeichnen unverändert. Mehrere `stock`-Zeilen einer Periode werden summiert
(Einheiten, Regionen), die Σ-Kachel der Small Multiples ebenso. **DAX:** Die Bestands-Measure muss selbst semi-additiv
sein (`LASTNONBLANKVALUE`, `CLOSINGBALANCEMONTH` o. ä.), sonst stimmt schon der Wochen- oder Monatswert nicht; Perioden
ohne Flüsse brauchen trotzdem eine Bestandszeile, sonst reißt die Linie; Wächter-Muster gegen Geisterzeilen gilt auch hier.
Properties im Objekt `chart`, Gruppe „Bestand & Fluss“ (nur im Modus sichtbar): `sfNet` (bool, true), `sfNetLabel` (Text,
leer = „Netto“), `sfArea` (bool, true), `sfNegTint` (bool, true), `sfOpening` (bool, true), `sfStockAt` (`end` | `center`,
Standard `end`), `axisGroups` (`auto` | `off`, Standard `auto`: höchstens zwei Gruppenzeilen aus den Ebenen über der
untersten, Beschriftung unter dem ersten Mitglied, Trennlinien durch alle Panels, die äußere Zeile kräftig, an einer
Szenariogrenze nur die äußere Zeile). Ohne Hierarchie wirkt `groupEvery` wie gewohnt. Wirkt außerdem: `scenarioLabels` (Kürzel-Zeile unter
den Gruppen), `highlight` + `highlightStyle` (Ellipse um die Bestandszahl der Periode bzw. um eine Achsengruppe wie „W01“
oder „2026“; Stil `band` = Band über Periode oder Gruppe), `showTotal` (Kopf „Σ Zufluss · Σ Abfluss · Netto · Endbestand“,
Endbestand = letzter Bestand in Achsenfolge), `labelDensity`, `refLine`, `fixedMax`. Ausgeblendet bzw. ohne Wirkung:
Δ-Panels, `previousYear`, `benchmark`, `prevForecast`, `acFcSplit`, kumulierte Sicht (YTD-Chip gesperrt,
`Lock_YtdStockFlow`; ab 1.56 frei, siehe B11 Teil 2). Direktbeschriftung rechts: Netto-Name an der Netto-Nulllinie, Zufluss-Namen über und Abfluss-Namen unter
der Nulllinie, Bestandsname auf Höhe des letzten Bestands. Tooltip je Periode (Zufluss, Abfluss, Netto, Anfangsbestand,
Bestand, Kommentare); Klick wählt alle Zeilen der Periode. Hinweise im Bearbeitungsmodus: `Hint_StockFlowNoStock`,
`Hint_StockFlowNoFlow`; zu wenig Platz: `Hint_StockFlowSpace` (alle `data-icd="sf-hint"`). Testmarker (`data-icd`):
`stockflow` (Wurzel je Kachel, `data-n`), `sf-seg-in`/`sf-seg-out` (`data-scen`, `data-v` mit Vorzeichen, `data-series`),
`sf-net` (`data-v`, `data-scen`), `sf-net-title`, `sf-stock-line`, `sf-stock-pt` und `sf-opening` (`data-scen`, `data-v`),
`sf-area` (`data-scen`), `sf-area-neg`, `sf-zero` (`data-panel` = `net` | `main`), `sf-label-in|out|net`, `sf-stock-label`
(`data-i`, −1 = Anfang), `sf-direct-label` mit `sf-name-in|out|stock`, `sf-total` (`data-closing`), `axis-group`
(`data-level` 1 = innere Zeile, `data-label`), `axis-group-sep`, `sf-axis`; wiederverwendet `fc-boundary`, `pl-boundary`,
`scen-label`, `group-sep`, `stack-comment`, `emph-ellipse`. Vorlage C20 siehe Tabelle unter „Neu in 1.49“. Tests c600 bis
c613 (Blätter 08E bis 08H mit den Kontrollketten aus dem Abgleich, Vertrag `outflow` positiv = negativ ohne Token,
Linien-Measure, Aliasse, ohne Bestand, Small Multiples, Summenkopf, Optionen, YTD-Sperre, Auswahl, Hochkontrast).
Noch offen (Teil 2 und 3; `timeAggregation` und `sfFlowZoom` ab 1.56): Jahreszeile aus einer einzelnen Datumsspalte, `axisGroups` in Säulen und
Linie, ΔBestand gegen PL/PY, Parität in der dwg-App und in `dwg pbip`, Demo-Galerie-Eintrag.
Review-Stand: `aggregateHierarchy` führt `sfKind` mit, wenn alle Kinder dieselbe Rolle tragen (damit erben Σ-, Ø- und
Rest-Kachel, `mergeColPoints` und Dubletten die Rolle); im Modus (`sfModeOn()`) setzen `aggregateGroups` und
`meanGroups` `catLevels` der ersten Kachel und `lineVal` aus `sfLineStock` (je Kachel und Kategorie der erste
Nicht-Null-Wert; Σ/Rest = Summe, Ø = Mittel über die Kacheln mit Bestand), `mergeColPoints` behält den ersten
`lineVal`. Ø im Modus: `meanZero = "series"` für die Flüsse (fehlendes Segment einer Periode = 0), Bestandszeilen
ohne Nullregel (Niveau). `multiplesTopN` reiht ohne `stock`-Zeilen, `sfDeck` über `shownGroups`. `acFcSplit` gilt in
`parseData` im Modus als `off`. PL-Säulen deckend (Zufluss `cfg.paper`, Abfluss Ton zu 16 % auf Papier), Hochkontrast:
AC-Abfluss `cfg.ink`, Zufluss Mittelton. Die äußere Gruppenzeile zeichnet ihre Trennlinie auch auf einer
Szenariogrenze, die Grenze liegt dann in Tinte darüber; Grenzen ohne Strichelung (`stroke-opacity` 0,6). Labels:
Flussbreite nur aus Zu- und Abfluss, alle ab `step >= 6 · Breite`, sonst jede k-te Periode (k = ⌈6 · Breite / step⌉,
mindestens 2, Priorität 30); Bestand alle ab 3,5 ·, lokale Extreme ab 3 · Breite; Labels unter Priorität 82 entfallen
auf Markern und auf der Bestandslinie; Ellipsen-Label 4 px weiter vom Marker. Nur die Periodengruppe hat `tabindex`,
`role="option"` und `aria-label` (Markergruppe nur Maus). Titel im Modus: die Szenarien der gezeichneten Perioden
(`titleScenarios`, „AC, FC, PL“). `SfPeriod.flowsDropped` (Plan-Fluss in einer AC/FC-Periode) gibt im
Bearbeitungsmodus `Hint_StockFlowMixed` (`[data-icd="sf-hint"][data-kind="mixed"]`, Platzhalter `{list}`).
Platzhinweis, sobald weniger als 40 px für die Werte bleiben; ein Szenario-Kürzel, das nicht in seinen Block passt,
entfällt. Tooltip „Szenario“ über `Tooltip_Scenario`. Die Flag-Token `hide`, `exclude` und Ausnahme-Listen wirken im
Modus nicht (jede Zeile zählt in Netto und Bestand). 836 resjson-Keys je Sprache. Tests c620 bis c632.

*B12 · Portfolio-Blasen (Blätter 10A, 10B, 10D).* Neue Properties im Objekt `chart` (Gruppe „Scatter / Bubble“, alle
standardmäßig ohne Wirkung): `scatterValueLabels` (bool, false) schreibt den Wert der Blasengröße in die Blase
(`[data-icd="scatter-value"]`, `data-scen="ac"|"py"`, Text #FFFFFF oder #000000 nach Kontrast gegen die mit dem Papier
gemischte Füllung); passt er nicht (Textbreite > 92 % des Durchmessers), hängt er am Namenslabel („V12 1,1“); die
Namen probieren dann zuerst „über der Blase“. `scatterMaxRadius` (Zahl, 0 = automatisch 22 px · Schriftfaktor; sonst
Wert · Schriftfaktor; der Radius ist gedeckelt auf ein Fünftel von min(0,8 · Breite, Plothöhe), bei Small Multiples
der Rasterzelle); der Achsen-Einzug bleibt dann beim automatischen Radius, große Blasen ragen über den Plotrand, aber
nie aus dem Visual. `scatterBubbleOpacity` (Zahl 10 bis 100, Standard 55; hervorgehoben mindestens
90). `scatterGroupColor1` bis `scatterGroupColor6` (Farbe, Standard = `SCATTER_GROUP_LIGHT`): Position = Reihenfolge des
ersten Auftretens; ein Wert ungleich dem hellen Standard gilt in hellem und dunklem Modus, ein Standardwert folgt
dem Modus (wer im Dark Mode ausdrücklich #404040 will, bekommt #D9D9D9). `scatterEmphFill` (bool) füllt
hervorgehobene Punkte (`chart.highlight` bzw. Token `emphasize`) mit `scatterEmphColor` (Standard #0064FF) statt des
Rings (`[data-icd="scatter-emph-fill"]`, nicht im Hochkontrast); `scatterEmphLabel` (Text) ergänzt die Legende.
Neue Rolle `bubbleSizePrevious` („Blasengröße VJ (optional)“, Measure, max 1): mit `previousYear` (Y-Lage) und
optional `xPrevious` (X-Lage, sonst X von AC) je Kategorie eine PY-Blase (`g.icd-cat[data-icd="scatter-py"]`, Füllung
`colors.previousYearColor` mit derselben Deckkraft, Hochkontrast gestrichelter Umriss), immer hinter allen AC-Blasen,
eigene Größe auf derselben Skala (`sMax` über AC und PY, bei Small Multiples deckweit), Achsen schließen die PY-Lagen
ein, Rechteck-Auswahl zählt nur AC; ein PY-Wert, der unter einer AC-Blase läge, steht am PY-Namen („VAB 32,0“). Nicht im Play-Modus. Legende `scatter-legend-py|ac|emph` (● PY ● AC nur ohne
Gruppenfarben und ohne Statusfarbe). Mit `scatterArrows` startet der Pfeil am Rand der PY-Blase, ohne Startpunkt. Pane: Wert, Radius,
Deckkraft nur mit gebundener Blasengröße; Gruppenfarben nur bei `scatterColorBy=group`; Farbe und Legendentext nur
bei `scatterEmphFill`. Kein Template geändert (C10 unverändert). Blatt-Rezepte: 10A = C10 + `series` + `scatterColorBy=group` +
`scatterQuadrant=off` + `scatterSizeLegend=false` (C10 setzt die Größenlegende an, die Werte stehen in den Blasen) +
`scale.xMin/xMax/yMin/yMax` 0/1/0/1,25 + `scale.xRefLine=0.5` (Mittellinie) + `scatterValueLabels` + `scatterMaxRadius=85` +
`scatterBubbleOpacity=100` + Gruppenfarbe 2 #FF6600; 10B wie 10A mit Deckkraft 60; 10D = Rollen `previousYear`,
`xPrevious`, `bubbleSizePrevious` + `scatterColorBy=single` + `scatterSizeLegend=false` + `scale.xRefLine=0.5` +
`highlight` „VAA, RFA“ + `scatterEmphFill` + Deckkraft 85.
Feld-Intro: 20 Rollen. 779 resjson-Keys je Sprache (mit B10 und B09). Tests c400 bis c406 (c400n: ausdrücklich gesetzte Standardwerte
zeichnen SVG-gleich wie keine Angabe). Review-Stand: Ein Flag `sc.pyBubbles` (Rolle gebunden, Daten da, nicht im
Play-Modus) steuert Achsen, Legende, Größenformat und Zeichnen; in die Größenskala zählen nur PY-Blasen innerhalb der
Achsen (`scatterPyPos`). Jede Blase bleibt im Visual: Würde eine Blase (AC oder PY, im Play-Modus alle Perioden) das
Panel verlassen (Visualbreite, unter der Achsentitel-Zeile bis zum unteren Rand), schrumpft die Plotbox auf dieser Seite,
der Achsenursprung bleibt; mit eigenem Radius liegt die Marken-Gruppe zusätzlich in einem clipPath
(`[data-icd="scatter-marks"]`). Ohne Überlauf bleibt das Layout unverändert. Werte verschwinden nicht: FC-Blasen tragen
den Wert auf der Schraffur (Tinte mit Papier-Rand), bei langen Namen wird nur der Name gekürzt, ohne Namenslabel
(Beschriftung aus, Dichte, kein Platz) steht der Wert allein neben der Blase (`[data-icd="scatter-value-beside"]`,
`data-scen`). Hochkontrast mit Statusfarbe: Wert in Papierfarbe auf gefüllten Blasen. PY-Gruppen haben keinen
Tab-Stopp und kein Ellipsenziel, `aria-label` „Name, PY, X VJ …, Wert, Größe VJ …“; `highlightStyle=ellipse` zeichnet
im Scatter eine Ellipse um die AC-Marke statt des Rings. Statusfarbe mit PY-Blasen: unwesentliche AC-Blasen mit
Tinten-Umriss, Legende ohne AC. Bearbeitungsmodus-Hinweis `Hint_ScatterPyBubbleRoles`
(`[data-icd="scatter-hint-py"]`), wenn `bubbleSizePrevious` ohne `previousYear` oder ohne `bubbleSize` gebunden ist.
Tests c410 bis c422 (Viewport-Prüfung für 10A bei 1280×640 und 640×360).

*B13 · Small Multiples gegen Durchschnitt (Blatt 13A, Teil von 13C).* Neue Properties im Objekt `chart`, Gruppe
„Small Multiples“, alle standardmäßig ohne Wirkung: `multiplesAgg` (`sum` Standard | `mean`) gilt für die Bezugskachel
(`multiplesTotal`) und die Top-N-Rest-Kachel. `mean`: je Kategorie (+ Stapelserie) und Feld (ac, py, pl, fc, value,
basis, fcPrev, bm, Trendreihe) geteilt durch die Zahl der Kacheln mit Wert in diesem Feld (null ist nicht 0); varAbs =
Mittel von (value − basis) über die Kacheln mit beidem, varRel = varAbs / Mittel der Basis derselben Kacheln (Δ2
genauso); `isFc` nur, wenn alle Kacheln FC sind; die Bezugskachel rechnet immer aus allen Originalgruppen, nie aus
der Rest-Kachel. Ein Ø ändert die Nachkommastellen nicht (Formatter-Präzision ohne die Ø-Kacheln). `multiplesTotalPos`
(`first` | `last`; zuletzt bleibt die Kachel auch über 24 Kacheln hinaus sichtbar, „+n weitere“ hängt dann an der
letzten Gruppe), `multiplesTotalShade` (bool, `cfg.band` über die ganze Zelle samt Kopf, Hochkontrast Rahmen),
`multiplesTotalLabel` und `multiplesRestLabel` (Text, `{n}` = Zahl aller Gruppen bzw. der zusammengefassten; leer =
„Σ Total“/„Ø Average (n)“ bzw. „Other (n)“, lokalisiert über `Label_Total`, `Label_Average`, `Label_Rest`).
`multiplesBasis` (`scenario` Standard | `avg`; nur `columns`, `bars`, `line` ohne Stapel und ohne `waterfallStyle`):
nach Top N, Kumulierung und vor dem Sortieren wird je Kategorie m = Mittel über alle Originalgruppen von `value ?? pl`
gebildet; jede Kachel außer der Bezugskachel bekommt basis = m (summierte Rest-Kachel: m × Zahl ihrer Gruppen mit
Wert), varAbs = (value ?? pl) − m, varRel = varAbs / m, var2 = null (doppelte Abweichung aus), `varPlan` = true, wo
value null ist (Δ-Balken umrandet mit Füllung 12 %, Pin-Kopf hohl). Die Bezugskachel hat keine Δ (Panels bleiben leer,
gleiche Skala). Basis-Label „Ø“, Panels „ΔØ“ und „ΔØ %“, Δ-Achse als einfache Linie (`cfg.basisAvg`), Δ-Präzision
wie die Werte. Gruppen tragen `kind` (`total` | `rest`). Testmarker (`data-icd`, nur wenn eine B13-Option gesetzt
ist, sonst SVG byte-gleich): `mult-tile` je Kachel (`data-group`, `data-kind` = `group`|`total`|`rest`, `data-agg`
an Bezugs- und Rest-Kachel, `data-x/y/w/h` = Zelle), `mult-ref-bg` (Hinterlegung), `mult-basis` (`data-basis="avg"`),
`var-plan` (Plan-Δ-Balken und Pin-Kopf). Rezept 13A: `multiplesTotal` + `multiplesAgg=mean` + `multiplesTotalPos=last`
+ `multiplesTotalShade` + `multiplesTopN` + beide Titel + `scenarioLabels`, Δ-Panels aus. 13C zusätzlich
`multiplesBasis=avg` und `showAbsoluteVariance` (zeigt die Säulen unter dem Δ-Panel; nur das Δ-Panel mit
`varianceOnly` ab 1.56, siehe oben; die freie Hero-Kachel 13B folgt). Tests c500 bis c504, c510 bis c514. 797 resjson-Keys je Sprache. Review-Stand: Ohne Kumulierung läuft der
Ø-Durchlauf vor Ausnahmefilter und Top N je Kachel (Kumulierung: nach `cumulate`, dort sind beide aus);
Sammelzeilen aus `aggregateTail` summieren unter `avgRows` die Basis der Mitglieder gleicher Ebene (mit Wert, sonst
nur Plan) und rechnen Δ neu, ohne Δ2, `varPlan` bei reinen Planzeilen. Σ-Kopf (`drawTotalHeader`) und Kernaussage
(`buildAutoMessage`) überspringen `varPlan`. `meanGroups(…, zero)`: `series` (Stapel) teilt durch die Kacheln mit
der Kategorie, fehlendes Segment = 0; `all` (Balken) teilt durch die Kacheln mit dem Feld, fehlende Kategorie = 0;
`none` (Säulen, Linie, Tabelle) wie bisher. Die Basis Ø nutzt bei Balken dieselbe Regel. Mit `cumulative` und
`mean` entstehen Bezugs- und Rest-Kachel aus kumulierten Kopien (`preCum`, nicht noch einmal kumuliert).
Summierte Rest-Kachel: Faktor = Zahl der versteckten Mitglieder derselben Ebene (Balken: alle mit Daten).
Ganzzahlige ΔØ-Labels nur ab max |Δ| ≥ 10. Bezugskachel unter Basis Ø (`refTileNoDelta`): Δ-Panels ohne Titel,
Achse, Skalenband, kompakt ohne Δ-Hinweis. Deckweite Skalen (Stapel, Brücken, Scatter, Achsenbruch) nutzen
`shownGroups` (Zellgrenze samt zuletzt stehender Bezugskachel). `multiplesBasis` im Pane nur ohne Stack-Series
und ohne `waterfallStyle` (Säulen/Balken). Zoom-Schlüssel: synthetische Kacheln über `kind` (Präfix U+0001 plus `total`
bzw. `rest`), sonst Name; „(+n weitere)“ = `Label_MoreTiles` mit `{n}`. **Verhaltensänderung:** In
`renderChartBody` tragen reine Planperioden (`value == null`, `pl != null`, nicht Linie) ihren Planwert als Label
(Thinning mit `labelLevel`), mit `scenarioLabels` steht `scenL.pl` unter der ersten Planperiode und bei einem
Plan-Ende ein Trennstrich `[data-icd="pl-boundary"]` (Achse bis Unterkante). Ø-ΔPY in der Ø-Kachel mittelt nur
Paare (Kachel mit Wert und Vorjahr); Ø mischt AC, FC und Plan je Periode (`value ?? pl`). Tests c520 bis c532.
800 resjson-Keys je Sprache.

**Neu in 1.54 (Backlog IBCS-Templates, Abgleich 19.11.2026):**

*B01 · Vorlagen C14 bis C18 für Blätter, die schon konfigurierbar waren.* C07 und C11 bleiben
reserviert (Fläche, Boxplot). Zuordnung Vorlage → IBCS-Blatt:

| Vorlage | IBCS-Blatt | Properties (Objekt `chart`, sonst mit Objektpräfix) |
| --- | --- | --- |
| C14 Balkentabelle nach ΔPL | 04A | orientation=table · comparisonMode=plan · showAbs/showRel=true · dualVariance=false · showTotal=true · totalRowPosition=bottom · tableTotalLegend=true · tableSort=`dabs_desc` · gridLines=none · cumulative=false · topN=0 |
| C15 Balkentabelle nach ΔPL % | 04B | wie C14 mit tableSort=`drel_desc` |
| C16 Balkentabelle nach AC | 04C | wie C14 mit tableSort=`ac_desc` |
| C17 Kategorie-Brücke waagerecht | 06E (06F/06G/06H mit `sortMode` signed/pct/ac) | orientation=catbridge · bridgeOrientation=bars · comparisonMode=py · showAbs/showRel=true · dualVariance=false · pyTriangle=false · groupEvery=4 · driverNote=false |
| C18 Abweichungs-Scatter | 10F | orientation=scatter · comparisonMode=auto · scatterQuadrant=off · scatterColorBy=group · scatterSizeLegend=true · scatterTrend=off · scatterArrows/scatterShapes=false · `scale.refLine`=0 · `scale.xRefLine`=0 |
| C19 Säulen gegen Plan + Jahressäule | 03B (03A mit comparisonMode=py) | siehe B05 unten |

Datenvertrag C18: `actual` = ΔPL %-Measure, `xValue` = ΔPY %-Measure, `series` = Produktlinie,
`bubbleSize` optional (Umsatz), `multiples` optional (Region). Neu im Vorlagen-Mechanismus:
Schlüssel `objekt.property` (C18) landen im selben `persistProperties`-Aufruf als eigener
Merge-Eintrag je Objekt (`merge[0]` bleibt `chart` mit `templateApplied`); `tableSort` ist Teil der
Vorlage, obwohl keine Pane-Property (zählt für „↺ Zum Template zurück“ mit, ein Klick auf einen
Spaltenkopf weicht also ab). **Vorlagenwechsel räumt auf:** Schlüssel der zuletzt angewandten Vorlage, die die neue
nicht setzt, gehen im selben Merge auf ihren Pane-Standard zurück (`tableSort` auf leer); „Aus“ schreibt weiterhin nur
`templateApplied`. Neue Property `chart.tableTotalLegend` (bool, Standard false): Die
berechnete Σ-Zeile der Tabelle zeigt in der Balkenspalte ■ AC □ PL (grau PY) mit den Summen statt
eines Balkens (`data-icd="table-total-legend"`) und zählt nicht zur Balkenskala; Δ-Balken und
Δ%-Pin bleiben, die Σ-Abweichung bleibt in den Δ-Skalen. Gilt nur für die synthetische Σ-Zeile
(nicht für `sum`-Zeilen aus den Daten, nicht in der Matrix). Reihenfolge der Legende AC · PL · PY; was nicht passt,
entfällt (Tooltip nennt alle); der AC-Wert steht dann nur in der Legende, nicht zusätzlich in der AC-Spalte. Galerie: neue Gruppe `ranking` (C14 bis C16), C17 unter
`structure`, C18 unter `correlation`. Tests c258 bis c266. Test-Marker: `group-sep` (Trennlinien der Brücken), `py-triangle`, `sort-<spalte>` (Tabellenkopf).

*B05 · Jahressäule mit eigener Skala (Blätter 03A, 03B).* Neue Properties `chart.yearColumn` (bool, Standard
false), `chart.yearColumnLabel` (Text, leer = „Σ“), `chart.scenarioLabels` (bool, Standard false). Wirkt nur in
`orientation=columns` ohne Stapel (`series`), ohne `waterfallStyle`, ohne kumulierte Sicht, ohne `rowType` und nicht
in kompakten Kacheln (Höhe < 190 px) oder bei zu schmalen Slots; dann ist das SVG identisch zu „aus“. Daten: Σ über
alle Monate mit Wert; fehlt die Basis für einzelne Monate, nur über die gepaarten Monate (`data-partial="1"`). AC als
Sockel, FC schraffiert darauf (`fcPart`), dahinter PY (Säule oder Dreieck wie die Monate) bzw. PL-Umriss. Skala:
Monats-px-je-Einheit × runder Faktor aus `REDUCE_FACTORS` (`data-factor` an `[data-icd="year-column"]`), über alle
Small-Multiples-Kacheln gleich. Band: `[data-icd="scale-zoom-year"]` (`data-band` = Zehnerpotenz unter dem
Monatsmaximum, `rect[data-tier="months"|"year"]`), Faktortext `[data-icd="year-zoom"]`. Δ und Δ% der Jahressumme
laufen auf den Monats-Δ-Skalen (Domains vereinigt, nur in Kacheln, die die Säule zeichnen; wie im Blatt); ist das
Jahres-Δ größer als 4× das größte Monats-Δ, läuft es mit dem Faktor der Jahressäule (`[data-icd="year-delta-zoom"]`).
Gemeinsame Nulllinie von Monaten und Jahr (Skala an `mainScale(0)` verankert, passt in beide Richtungen); passt die
Säule gar nicht, bleibt der Slot leer. Teilsumme: Beschriftung „Label (n/m)“ + Tooltip; PY/PL hinter der Säule nur,
wenn sie alle verwendeten Monate abdecken; ΔBasis2 über die eigenen Paare. Bandwert: größtes 1·2·5×10ⁿ ≤ halbes
Monatsmaximum. Die Jahressäule filtert nicht (kein Klick, kein Kommentar, kein Vergleich), nur Tooltip/aria. In
Small Multiples ist der Slot in jeder Kachel reserviert; die Σ-Kopfzeile entfällt, sobald der Slot gezeichnet wird. Szenario-Kürzel:
`[data-icd="scen-label"]`. Vorlage C19 (03B): orientation=columns · comparisonMode=plan · showAbs/showRel=true ·
dualVariance=false · waterfallStyle=false · cumulative=false · yearColumn=true · scenarioLabels=true · pinStyle=square (03A: dieselbe
mit comparisonMode=py). Tests: `test:scale` YC03A/YC03B (Pixelmessung), YCneg/YCnegPos (Nulllinie), YCpart, YCdual, YCbigD, YCsm +
Rückfälle YCcum/YCwf/YCbars/YCcompact/YCnarrow/YCcumPy,
`test:render` c267.

*B04 · Sortierung mit fester Rest-Zeile (Blätter 06F, 06G, 06H; 04A bis 04C).* Neue Property `chart.sortMode`
(Enum `off` · `abs` |Δ| absteigend · `signed` Δ mit Vorzeichen absteigend, ohne Wertung gut/schlecht (06F) · `pct` Δ %
absteigend, n.a. ans Ende (06G) · `ac` AC absteigend (06H)). Wirkt in Kategorie-Brücke, Wasserfall-Brücke
(`waterfallStyle`) und neu in Balken ohne Stapel; Small Multiples sortieren je Kachel. **Kompatibilität:**
`chart.sortByImpact` bleibt ein (im Pane ausgeblendeter) Bool. Solange `sortMode` nicht gespeichert ist, gilt
`sortByImpact=true` als `abs`, und zwar nur in den Brücken wie bis 1.53 (Tests c273 bis c273d, SVG-gleich); ein
gespeichertes `sortMode` hat Vorrang. Der ⇅-Knopf schreibt `sortMode` (`"abs"` bzw. `"off"`) und ist bei aktiver
Sortierung nie gesperrt. Rest-Zeilen bleiben am Ende, in Datenfolge, kursiv (nur solange sortiert wird): die
Top-N-Rest-Zeile, „Unauffällig (n)“ und Namen, die eine Rest-Bezeichnung SIND (`REST_ROW_RX` in `src/visual.ts`:
Other(s), Sonstige(s), Übrige(s/r), Rest, Resto, Otros/Otras, その他, je optional mit „(n)“; „Rest of/der/des …“,
„Rest-…“; „Other/Übrige/Sonstige countries/regions/Länder/Regionen …“). „Sonstige betriebliche Erträge“ oder
„Other income“ bleiben Konten (enger als die P&L-Regel `^(other|…|resto)`). Dieselbe Regel gilt für die
Spaltensortierung der Tabelle/Matrix (`tableSort`), daher C14 bis C16 ohne Restpunkt; Top N nimmt benannte
Rest-Zeilen in die Rest-Zeile auf. Zuordnung: 06F = C17 + `sortMode=signed`, 06G = C17 + `pct`, 06H = C17 + `ac`.
Tests c268 bis c274d.

*B06 · Szenario-Notation im Stapel (Blatt 01C; Basis für 01A, 01B, 01D, 01E).* Keine neue Property. `renderStacked`
bestimmt je Kategorie ein Szenario: `ac` (eine Zelle hat ein Ist), sonst `fc` (Forecast-Measure oder `fcFlag`), sonst
`pl` (nur Plan gebunden); Stapelwert `value ?? (pl in Plan-Kategorien)`, daraus Summen, `stackDomain` und die
Direktlegende. FC-Segmente: Schraffur je Serie (`<patId>-s<n>`, Tönung der Serie, dunkle Linien), `data-icd="stack-seg-fc"`;
PL-Segmente: Serienfarbe mit 28 % Deckkraft + PL-Umriss, `stack-seg-pl`; Stapel ohne FC, ohne Plan für Monate ohne Ist, ohne `scale.refLine`, ohne `chart.groupEvery`
und ohne Kommentar-Measure bleiben SVG-gleich (alle 345 Bestands-Stages per Hash geprüft). Verhaltensänderung für Bestandsberichte:
gebundener Plan für Monate ohne Ist erscheint jetzt als Plan-Umriss (Skala wächst ggf., Direktlegende an der letzten Plan-Säule);
bisher wirkungslose `refLine`/`groupEvery` und gebundene Kommentar-Measures werden jetzt gezeichnet. Gruppen-Trennlinien entfallen
an Szenario-Grenzen; Titel ohne „AC“ bei reinem Plan/Forecast. `acFcSplit` teilt eine AC-Zelle in Sockel + schraffierten Teil. Trennlinien
`fc-boundary`/`pl-boundary` nur Säulen, nur bei Blockfolge AC* FC* PL*. Neu im Stapel: `scale.refLine`
(`stack-refline`, Domain eingeschlossen), `chart.groupEvery` (`group-sep`), Kommentar-Marker (`stack-comment`, am Segment
außen), `chart.scenarioLabels` (Kürzel je Block unter der Achse), Titel nennt die vorkommenden Szenarien. Kein PL-Umriss
hinter Ist-Monaten. Bekannt: ein Kommentar je Kategorie erscheint bei Kommentar-Measures auf Kategorie-Ebene je Serie.
Tests c275 bis c280, c278b bis c278d.

*B14 · Kleinteile.* Neue Property `chart.highlightStyle` (`band` Standard · `ellipse`): bei `ellipse` kein Band, sondern
nach dem Zeichnen je hervorgehobener Kategorie eine Ellipse um jede Zahl ihrer Gruppe (`data-icd="emph-ellipse"`,
Kategoriename ausgenommen; Tests c281/c281b). Gerundete Null: Werte zeigen „0“ (seit 1.52.1), Margen-Werte der Tabelle
jetzt „0,0 %“ statt „−0,0 %“ (c282); Δ, Δ % und Δ in Pp behalten bewusst ihr Vorzeichen (Richtung, Konvention 1.52.2).

**Neu in 1.53 (rowType-Token, keine neue Property, keine neue Rolle):** Die Rolle `rowType`
(„Waterfall-Typ“) ist der Datenvertrag für die Zeilenstruktur — Token je Zeile statt Zeilennamen in
sieben Komma-Listen. Tabelle, Semantik und Vereinigungsregel: Abschnitt „rowType-Token“ unten;
Falle 12. 694 resjson-Keys je Sprache. Tests c248–c257.

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
resjson-Keys je Sprache (Stand 1.52.0; 1.52.4 + Brücken-Arbeit: 691; mit den rowType-Token: 694). Geometrie-Test: `npm run test:scale`.

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
| `rowType` | Grouping | Zeilentyp (Pane: „Waterfall-Typ“). Struktur: `sum`/`total` = Zwischensumme/Anker · `delta` = Bewegung · `pct` = Margenzeile (%-Anzeige, Δ in Pp). Ab 1.53 zusätzlich kombinierbare Flag-Token je Zeile (`exclude` · `hide` · `davon` · `invert` · `emphasize` · `graphic`), vereinigt mit den Komma-Listen — siehe „rowType-Token“ |
| `xValue` | Measure | X-Achse im Scatter/Bubble (Y = `actual`); Pflicht für `orientation = scatter` |
| `xPrevious` | Measure | X-Achse VJ (Scatter, optional): macht die PY-Pfeile zu 2D-Bewegungen (`scatterArrows`) |
| `bubbleSize` | Measure | Blasengröße im Scatter (optional) — macht daraus ein Bubble-Chart (Vorlage C10) |
| `bubbleSizePrevious` | Measure | Blasengröße VJ (Scatter, optional, ab 1.55): mit `previousYear` (Y) und optional `xPrevious` (X) eine PY-Blase je Kategorie mit eigener Größe hinter der AC-Blase (Blatt 10D) |
| `trend` | Grouping | Zeitachse je Karte: macht KPI-Karten zu Zeitreihen (`cardTrendChart`), wirkt NUR im `cards`-Modus |
| `comments` | Measure (Text) | nummerierte Marker ①② + Fußnoten-Panel |
| `filterInfo` | Measure (Text) | Filterkontext-Text für die Fußzeile |

**DAX-Regel (wichtigste Falle überhaupt):** Ein Measure, das für nicht
existierende Kategorie-Kombinationen non-blank liefert (`COALESCE(x, 0)`,
`+0`), zwingt Power BI, diese Kombinationen ins DataView zu schicken →
Geisterzeilen/Kreuzprodukte. Wächter-Muster:
`IF(COUNTROWS('Fakt') > 0, COALESCE(MAX('Fakt'[x]), 0))`.

### rowType-Token (ab 1.53)

Namen sind kein Datenvertrag: Wer Zeilen über die Komma-Listen steuert, verliert die Wirkung bei
Umbenennung, Übersetzung oder Mehrsprachigkeit. Die Rolle `rowType` trägt dieselbe Information
datengetrieben. Eine Zelle enthält ein oder mehrere Token, getrennt durch Komma, Semikolon,
Leerzeichen oder `|`; Groß-/Kleinschreibung egal (Beispiel: `total; graphic`, `davon | exclude`).

| Token (kanonisch) | Aliasse | Wirkung = Komma-Liste | Art |
| --- | --- | --- | --- |
| `total` | `sum` (und jedes Token, das mit `sum` beginnt), `subtotal`, `summe`, `ergebnis`, `zwischensumme`, `result`, `formula`, `formel` | Ergebniszeile wie `resultList` — technisch der bisherige rowType `sum` (fett, Trennlinie, Anker, nicht im Σ; wirkt dadurch auch im GuV-Statement) | Struktur |
| `pct` | jedes Token, das mit `pct` beginnt, `percent`, `prozent`, `margin`, `marge`, `kpi`, `ratio`, `quote`, `kennzahl` | Margenzeile (bisheriger rowType `pct`) — keine Liste | Struktur |
| `detail` | `normal`, `delta`, `account`, `konto`, `separator`, `+`, `-`, `−`, leere Zelle | nichts — normale Bewegungszeile | Struktur |
| `exclude` | `memo`, `nachrichtlich`, `ausnehmen` | `skipList` (nicht in Σ, Skalen, Kaskade; kursiv) | Flag |
| `hide` | `ausblenden`, `versteckt` | `hideList` (ausgeblendet, Σ rechnet weiter) | Flag |
| `davon` | `of-which`, `ofwhich`, `thereof` | `indentList` (eingerückt, dezent) | Flag |
| `invert` | `invertieren`, `kosten`, `cost`, `costs` | `invertList` (Wertung umgekehrt) | Flag |
| `emphasize` | `highlight`, `hervorheben` | `highlight` (IBCS EMPHASIZE) | Flag |
| `graphic` | `chart`, `grafik` | `chartList` (wenn mind. eine Zeile/Liste es trägt: nur diese Zeilen zeigen Grafiken) | Flag |
| `stock` | `bestand`, `balance` | keine Liste: Bestandszeile im Modus `stockflow` (ab 1.55, B11) | Flag (je Zeile) |
| `inflow` | `zufluss` | keine Liste: Zufluss, Wert als `+abs(v)` (Modus `stockflow`) | Flag (je Zeile) |
| `outflow` | `abfluss` | keine Liste: Abfluss, Wert als `−abs(v)` (Modus `stockflow`) | Flag (je Zeile) |

Die Aliasse decken die RowType-Werte des P&L-Visuals ab (`Subtotal`, `Formula`, `KPI`, `Account`,
`Separator`), damit dieselbe Spalte `DimKonto[RowType]` beide Visuals speisen kann.

Regeln (Code: `parseRowTypeCell` und `listWithFlag` in `src/visual.ts`):

- **Alte Werte unverändert:** Beginnt der ganze Zellwert mit `sum` oder `pct`, bleibt er wie bis 1.52.4
  der rowType. Jeder andere nicht-leere Wert (auch leerer Text `""`) bleibt eine GuV-Bewegungszeile —
  `sum`/`delta`/`pct`-Berichte zeichnen pixelgleich (SVG-Vergleich aller Bestandsfälle).
- **Wirksame Menge = Rolle ∪ Liste.** Die Listen bleiben als Override für Modelle ohne Rollen-Spalte;
  doppelte Angabe wirkt einfach. Abgeglichen wird wie bei den Listen über den Zeilennamen: gleichnamige
  Zeilen (andere Small-Multiples-Kachel, gleiches Blatt unter anderem Elternknoten) teilen ein Flag.
- **Ebene:** Token gelten für die DataView-Zeile, die den Wert trägt — bei Hierarchien das Blatt
  (abgeglichen über den Pfad „A · B“ und das Blatt-Label). Elternknoten erben wie bisher nur die
  Struktur des ersten Kinds (`sum`/`pct`), keine Flags.
- **Nur-Flag-Zellen** (z. B. nur `invert`) machen keine Strukturaussage: rowType bleibt `null`. Trägt
  die Rolle ausschließlich solche Zellen, gilt das Modell nicht als GuV (kein „GuV-Wasserfall?“-
  Vorschlag, YTD bleibt möglich, der Wasserfall bleibt Varianz-Brücke).
- **Unbekannte Token** werden ignoriert und im Bearbeitungsmodus unten rechts gemeldet
  (`data-icd="rowtype-note"`, resjson `Note_RowTypeUnknown`, max. drei Token + „+n“); Leser und
  Exporte sehen nichts.
- **Struktur-Menü** (`chart.structureEdit`): per Token gesetzte Eigenschaften erscheinen angehakt und
  gesperrt (`label[data-icd-role="1"]`, Tooltip `Struct_FromRole`) — abschalten geht nur im Modell.

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
| Bestand und Fluss über die Zeit | `stockflow` | category (Zeit, gern Hierarchie) + actual + series + rowType `stock`/`inflow`/`outflow` |

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
| C07 Gestapelte Fläche (08A, ab 1.56) | orientation=columns · comparisonMode=auto · showAbs/showRel=false · dualVariance=false · waterfallStyle=false · stackShape=area · areaTotalLine=true · areaValueLabels=auto · stackLegendDirect=true · stackLegendPos=end · showTotal=false · scenarioLabels=true (Rolle `series` binden, siehe B16) |
| C08 Linie | orientation=line · comparisonMode=auto · showAbs=true · showRel=false · dualVariance=false |
| C09 Scatter | orientation=scatter · comparisonMode=auto · scatterQuadrant=mean · scatterColorBy=single |
| C10 Bubble | wie C09 + scatterSizeLegend=true (Rolle `bubbleSize` binden) |
| C12 Waterfall | orientation=waterfall · comparisonMode=auto · showAbs/showRel=true · dualVariance=false |
| C13 Small Multiples | multiplesTotal=true · multiplesSameScale=true (orientation bleibt; Rolle `multiples` binden) |
| C14 bis C19 | ab 1.54, siehe „Neu in 1.54“ (Zuordnung zu den IBCS-Blättern 04A, 04B, 04C, 06E, 10F, 03B) |
| C20 Bestand und Fluss (08E bis 08H, ab 1.55) | orientation=stockflow · sfNet=true · sfArea=true · scenarioLabels=true · showTotal=false · highlightStyle=ellipse (Rollen `series` + `rowType` mit `stock`/`inflow`/`outflow`, siehe B11) |
| C21 Kumulierte Linie mit R12 und Monatssäulen (07C, ab 1.56) | orientation=line · comparisonMode=plan · cumulative=true · cumulativeKind=ytd · lineR12=true · linePeriodColumns=same · lineGapMarkers=both · lineBasisLabels=true · lineMarkerShape=square · scenarioLabels=true · showAbs/showRel=false · dualVariance=false · showTotal=false (PL binden, siehe B15) |
| C22 Serienlinien mit Index (07A, ab 1.56) | orientation=line · lineSeries=true · lineIndex=base100 · lineSeriesLabels=groups · lineSeriesColor=tones · lineMarkerShape=square · showAbs/showRel=false · dualVariance=false · cumulative=false · showTotal=false (Rolle `series` binden, siehe B17) |
| C23 Scatter-Zeitpfad (07D, 07E, ab 1.57) | orientation=scatter · comparisonMode=auto · scatterPath=line · scatterPathLabels=auto · scatterColorBy=group · scatterQuadrant=off · scatterTrend=off · scatterArrows=false · scatterPlay=false (Rollen `xValue` und `series` binden, Kategorie = Periode; 07E zusätzlich `scale.ratioRays`, siehe B18) |

**Nicht enthalten:** C11 (Verteilung/Boxplot), die Darstellungsform gibt es
im Visual nicht (siehe BACKLOG). C07 (Fläche) gibt es ab 1.56 (B16).
(2) **fetchMoreData** — siehe Falle 7. (3) **Lesezeichen:**
`registerOnSelectCallback` übernimmt die vom Host wiederhergestellte
Auswahl (Dimmen wie nach Klick, `[]` hebt auf). (4) **Gesperrte Chips:**
wirkungslose In-Chart-Knöpfe tragen `data-icd-locked="1"`,
`aria-disabled`, Opacity 0.4 und den Grund im Tooltip; Klick persistiert
nichts (YTD auf rowType/1 Periode, ⇅ bei identischer Wirkungs-Reihenfolge,
⚠ ohne verdichtbare Zeile, Karten-Sortierung ohne Vergleichswert/1 Karte,
Brücken-Toolbar im Hinweis-Zustand — den gibt es seit den negativen Brücken nur noch ohne
Vergleichsbasis PY/PL bzw. bei zu wenig Platz in der Integrierten Brücke; rein negative Werte
zeichnen eine Brücke). (5) **Leer-Zustand:**
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
`src/settings.ts`, Paketstand **1.56.0.0**. Nicht von Hand ändern — Korrekturen gehören in
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
| `bubbleSizePrevious` | Measure | Blasengröße VJ (optional) | 1 | numeric / integer |
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
| `template` | enum | `off` | `off` · `C01` · `C02` · `C03` · `C04` · `C05` · `C06` · `C07` · `C08` · `C09` · `C10` · `C12` · `C13` · `C14` · `C15` · `C16` · `C17` · `C18` · `C19` · `C20` · `C21` · `C22` · `C23` — Startpunkt nach den IBCS-Chart-Templates: setzt Chart-Typ, Vergleichsbasis … |
| `orientation` | enum | `columns` | `columns` · `bars` · `line` · `waterfall` · `intwaterfall` · `catbridge` · `table` · `pareto` · `dumbbell` · `slope` · `scatter` · `cards` · `pnl` · `stockflow` |
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
| `timeAggregation` | enum | `sum` | `sum` · `last` — Wie Werte über die Zeit zusammengefasst werden (YTD, Jahressäule, Tabellenbaum, zusammengeführte Perioden, Karten-Trend, Σ-Kopf): Summe oder letzter Wert (Stichtag, z. B. Bestand, Headcount) … |
| `acFcSplit` | enum | `off` | `off` · `full` · `rest` — Ein teilweise abgeschlossener Monat liefert AC UND FC: „Vollmonatsprognose" zeigt den AC-Sockel solide und stockt schraffiert bis zum FC-Wert auf (Säule = max(AC, FC)); „Restmonat" addiert den FC-Wert oben auf AC (Säule = AC + FC) … |
| `topN` | numeric | `0` | Bereich 0–50 — Struktur-Modi (Bars, Kategorie-Brücke, Tabelle, Dumbbell, KPI-Karten): zeigt die N größten Kategorien, der Rest wird aggregiert. 0 = alle. |
| `showTotal` | bool | `true` | Zeigt Summe und Gesamtabweichung als Kopfzeile. |
| `yearColumn` | bool | `false` | Nur Säulen: rechts neben den Monaten eine Σ-Säule (AC + FC gegen PY bzw. PL) mit eigener Skala auf derselben Nulllinie … |
| `yearColumnLabel` | text | leer | Beschriftung der Jahressäule unter der Achse, z. B. „2025“. Leer = „Σ“. |
| `hideBlankCat` | bool | `false` | Blendet Zeilen ohne Kategoriewert aus — sie erscheinen sonst als „(blank)"-Balken, -Zeile oder -KPI-Karte. Standard aus, damit keine Daten unbemerkt verschwinden (Beta-Feedback). |
| `movingAverage` | numeric | `0` | Bereich 0–24 — Dünne Overlay-Linie mit gleitendem Durchschnitt über N Perioden (Columns/Line). 0 = aus. |
| `highlight` | text | leer | Kommagetrennte Kategorie-Namen, die hervorgehoben werden (IBCS EMPHASIZE), z. B. der aktuelle Monat. Oder datengetrieben per Feld „Waterfall-Typ“ (Zeilentyp): Token „emphasize“ — Feld und Liste ergänzen sich. |
| `highlightStyle` | enum | `band` | `band` · `ellipse` — Wie hervorgehobene Kategorien markiert werden: als dezentes Band hinter der Kategorie (Standard) oder als Ellipse um ihre Zahlen, wie die Kreise in den IBCS-Blättern. |
| `diffMarkers` | text | leer | Differenzmarker zwischen zwei Kategorien, mit Semikolon getrennt: „2025 > 2026“ zeigt neben der zweiten Säule einen Strich mit Δ und Δ %, „2025 > 2026@Software“ dasselbe für eine Serie im Stapel, ein „!“ am Ende lässt Δ % weg … |
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
| `stackShape` | enum | `columns` | `columns` · `area` — Gestapelte Säulen (Feld „Stack-Serie“): als Säulen (Standard) oder als gestapelte Fläche über die Zeit mit Summenlinie, Punkten je Periode und Seriennamen am Ende. Ohne Serie und bei Balken ohne Wirkung. |
| `areaTotalLine` | bool | `true` | Gestapelte Fläche: Linie mit Punkt und Summe je Periode über dem Stapel. Bei 100 % nie. Standard an. |
| `areaValueLabels` | enum | `auto` | `auto` · `ends` · `off` — Gestapelte Fläche: Werte in den Flächen, nach Platz ausgedünnt (Standard), nur in der ersten und letzten Periode oder keine. Ein Wert steht nur, wenn die Fläche dort hoch genug ist. |
| `stackLegendDirect` | bool | `true` | Gestapelte Säulen und Balken: Die Seriennamen stehen direkt am Stapel (Säulen: rechts neben der letzten Säule, Balken: über dem ersten Balken) statt als Schlüssel oben. Passen sie nicht, bleibt der Schlüssel … |
| `stackLegendPos` | enum | `end` | `end` · `start` — Gestapelte Säulen mit Seriennamen am Stapel: rechts neben der letzten Säule (Standard) oder links neben der ersten. |
| `stackNormalize` | enum | `off` | `off` · `pct100` — Gestapelte Säulen und Balken: Werte oder 100 % je Kategorie (Anteile der Serien, Marke „100 %“). Bei 100 % zeigt ein Balkendiagramm rechts die absoluten Summen auf eigener Skala, solange „Summen-Kopfzeile (Σ)“ an ist … |
| `stackTotalRow` | bool | `false` | Gestapelte Balken: eine Σ-Zeile unten mit der Summe je Serie und der Gesamtsumme; bei 100 % als Balken mit dem Gesamtmix. Standard aus. |
| `stackTotalLabel` | text | leer | Beschriftung der Σ-Zeile, z. B. „Welt“. Leer = „Σ“. |
| `stackShareBracket` | numeric | `0` | Bereich 0–20 — Gestapelte Balken: eine Klammer um die ersten N Zeilen mit ihrem Anteil an der Gesamtsumme, z. B. „38 %“. Bezug ist die erste Serie, wenn nach ihr sortiert wird, sonst die Stapelsumme … |
| `stackBlocks` | enum | `off` | `off` · `gap` · `subtotals` · `subtotalsButLast` — Gestapelte Balken mit Kategorie-Hierarchie: die erste Ebene bildet Blöcke (z. B. Region), die Zeilen zeigen nur die unteren Ebenen. Abstand: halbe Zeile zwischen den Blöcken … |
| `stackBlockShare` | bool | `false` | Mit Zwischensummen: der Anteil des Blocks an der Gesamtsumme in einer Ellipse hinter der Blocksumme, „100 %“ an der Σ-Zeile und der Anteil hervorgehobener Zeilen über ihrer Summe (unter einer längeren Nachbarzeile rechts daneben) … |
| `scenarioLabels` | bool | `false` | Säulen, Linie, Bestand & Fluss: schreibt die Szenario-Kürzel an: AC unter den ersten Ist-Monat, FC unter den ersten Forecast-Monat, AC und FC neben die Teile der Jahressäule; in der Linie zusätzlich das Kürzel am Ende jeder Linie (FC, PL) … |
| `exportExpandAll` | bool | `true` | PDF-/PowerPoint-Export und Abo-Mails rendern Tabelle, Matrix und GuV-Statement mit allen Zeilen- und Spalten-Ebenen aufgeklappt — der Ausdruck zeigt alles, unabhängig vom Klapp-Zustand am Bildschirm … |

**Bestand & Fluss**

| Property | Typ | Standard | Werte / Beschreibung |
| --- | --- | --- | --- |
| `sfNet` | bool | `true` | Bestand & Fluss: oberes Panel mit dem Netto-Fluss je Periode (Zufluss minus Abfluss), im selben Maßstab wie die Flüsse. Standard an. |
| `sfNetLabel` | text | leer | Bestand & Fluss: Name des Netto-Panels rechts neben der Nulllinie, z. B. „Netto-Cashflow“ oder „Fluktuation“. Leer = „Netto“. |
| `sfArea` | bool | `true` | Bestand & Fluss: Fläche zwischen Bestandslinie und Nulllinie, je Periode in der Szenario-Notation (Ist getönt, Forecast schraffiert, Plan heller). Standard an. |
| `sfNegTint` | bool | `true` | Bestand & Fluss: Flächenstücke unter null in der Farbe für Schlecht, leicht getönt. Standard an. |
| `sfOpening` | bool | `true` | Bestand & Fluss: zusätzlicher Punkt am Anfang der ersten Periode mit dem abgeleiteten Anfangsbestand (Bestand der ersten Periode minus ihr Netto-Fluss). Standard an. |
| `sfStockAt` | enum | `end` | `end` · `center` — Bestand & Fluss: Lage der Bestandspunkte, am Ende der Periode (Stichtag, wie auf den IBCS-Blättern) oder in ihrer Mitte. |
| `axisGroups` | enum | `auto` | `auto` · `off` — Bestand & Fluss, gestapelte Fläche und Serienlinien: bei einer Kategorie-Hierarchie (z. B. Jahr, Woche, Tag) höchstens zwei Gruppenzeilen unter der Achse mit Trennlinien; die unterste Ebene beschriftet die Perioden … |
| `sfFlowZoom` | bool | `false` | Bestand & Fluss: Flüsse und Netto mit einem runden Faktor vergrößert, wenn sie neben einem großen Bestand nur wenige Pixel hoch wären (Blatt 08G) … |

**Linie**

| Property | Typ | Standard | Werte / Beschreibung |
| --- | --- | --- | --- |
| `lineMarkerShape` | enum | `circle` | `circle` · `square` — Linie: Form der Punktmarken. Quadrate zeigen das Szenario an der Marke (AC gefüllt, FC schraffiert, PL hohl) auf dünnen Linien, wie im IBCS-Blatt 07C. Standard Kreise. |
| `lineBasisLabels` | bool | `false` | Linie: beschriftet auch die Werte der Vergleichslinie (PL oder PY), auf der Seite weg von der Ist-Linie. Standard aus. |
| `lineR12` | bool | `false` | Linie mit kumulierter Sicht YTD: zusätzlich die gleitende Jahressumme der letzten 12 Perioden auf derselben Skala … |
| `lineR12Label` | text | leer | Name der R12-Linie an ihrem Anfang, z. B. „MAT“. Leer = „R12“. |
| `linePeriodColumns` | enum | `off` | `off` · `same` — Linie mit kumulierter Sicht YTD: die Werte der einzelnen Perioden als Säulen hinter den Linien, auf derselben Skala und Nulllinie (AC solide, FC schraffiert, PL als Umriss) … |
| `lineGapMarkers` | enum | `off` | `off` · `actual` · `end` · `both` — Linie mit kumulierter Sicht YTD: Abstand der Ist-Linie zur Vergleichslinie als Balken mit Δ am rechten Rand, am letzten Ist-Monat (AC gegen Basis) und am Jahresende (AC und FC gegen Basis, schraffiert) … |
| `lineSeries` | bool | `false` | Linie: eine Linie je Mitglied des Felds „Stack-Serie“ (z. B. drei Aktien über die Tage), Serienname mit letztem Wert am Linienende, wie im IBCS-Blatt 07A … |
| `lineIndex` | enum | `off` | `off` · `base100` — Serienlinien: Werte je Serie als Index, Basiswert = 100 (Wert ÷ Basiswert × 100), nullbasierte Achse mit einer dünnen Linie bei 100 … |
| `lineIndexBase` | text | leer | Name der Kategorie, deren Werte 100 sind (z. B. „02.01.“); ein Gruppenname (z. B. „Feb“ bei Monat › Tag) meint den ersten Punkt der Gruppe … |
| `lineSeriesColor` | enum | `tones` | `tones` · `palette` — Serienlinien: Grautöne (erste bzw. hervorgehobene Serie in der AC-Farbe, die übrigen abgestuft grau) oder die Gruppenpalette (ab vier Serien besser unterscheidbar, verlässt aber die Szenariofarben). Standard Grautöne. |
| `lineSeriesLabels` | enum | `ends` | `ends` · `groups` · `all` · `none` — Serienlinien: welche Werte beschriftet werden … |
| `lineEndDelta` | text | leer | Serienlinien: Serien mit einem Balken vom Basisniveau (mit Index 100, ohne Index der erste Wert der Serie) zum Endwert am rechten Rand, in Gut- bzw. Schlecht-Farbe, mit Index als Δ % (z. B. −93 %), sonst Δ und Δ % … |

**Small Multiples**

| Property | Typ | Standard | Werte / Beschreibung |
| --- | --- | --- | --- |
| `multiplesTotal` | bool | `false` | Stellt eine „Σ Gesamt"-Kachel voran — Summe über alle Gruppen, auf derselben Skala (IBCS). |
| `multiplesTopN` | numeric | `0` | Bereich 0–24 — Zeigt nur die N größten Gruppen (nach Summe AC) als Kacheln — die übrigen werden zu einer „Rest"-Kachel aggregiert. 0 = alle. |
| `multiplesHero` | bool | `false` | Gibt der ersten Kachel (z. B. „Σ Gesamt" oder der größten Gruppe) mehr Platz — alle Kacheln behalten dieselbe Skala (IBCS CT 13). |
| `multiplesSameScale` | bool | `false` | Skaliert auch die Brücken-Modi (Integrierte Brücke, Kategorie-Brücke) über alle Kacheln identisch (IBCS). Standard: aus — jede Brücken-Kachel skaliert für sich. Säulen, Balken und Wasserfall teilen sich die Skala immer. |
| `multiplesAgg` | enum | `sum` | `sum` · `mean` — Was die Bezugskachel und die Rest-Kachel zeigen: die Summe der Gruppen (Standard) oder ihren Durchschnitt … |
| `multiplesTotalPos` | enum | `first` | `first` · `last` — Wo die Bezugskachel (Σ bzw. Ø) steht: als erste Kachel (Standard) oder als letzte, unten rechts wie auf dem IBCS-Blatt 13A. |
| `multiplesTotalShade` | bool | `false` | Hinterlegt die Bezugskachel grau, damit sie sich von den Gruppen abhebt. Im Hochkontrast ein Rahmen statt der Fläche. |
| `multiplesTotalLabel` | text | leer | Eigener Titel der Bezugskachel, {n} steht für die Zahl der Gruppen, z. B. „Durchschnitt {n} Standorte“. Leer = „Σ Gesamt“ bzw. „Ø Durchschnitt (n)“. |
| `multiplesRestLabel` | text | leer | Eigener Titel der Rest-Kachel bei „Top N Kacheln“, {n} steht für die Zahl der zusammengefassten Gruppen, z. B. „{n} weitere kleine Standorte“. Leer = „Rest (n)“. |
| `multiplesBasis` | enum | `scenario` | `scenario` · `avg` — Szenario (Standard): jede Kachel vergleicht mit PY bzw. PL. „Durchschnitt aller Kacheln (Ø)“: jede Kachel vergleicht je Kategorie mit dem Durchschnitt aller Gruppen, ohne Hilfs-Measure (Panel „ΔØ“) … |
| `varianceOnly` | bool | `false` | Small Multiples mit Säulen oder Balken: jede Kachel zeigt nur ihr Abweichungs-Panel (ΔØ bzw. ΔPY/ΔPL, Balken oder Pins) auf einer gemeinsamen Δ-Skala, Kategorie- und Szenario-Beschriftung stehen unten … |

**Brücke**

| Property | Typ | Standard | Werte / Beschreibung |
| --- | --- | --- | --- |
| `waterfallStyle` | bool | `false` | Nur Säulen/Balken: zeigt die Kategorien als Wasserfall-Brücke von der Basis (PY/PL) zu AC mit Verbindungslinien, statt als einzelne Balken … |
| `sortMode` | enum | `off` | `off` · `abs` · `signed` · `pct` · `ac` · `series` — Kategorie-Brücke, Wasserfall-Brücke und Balken: ordnet die Kategorien nach \|Δ\| (größter Treiber zuerst), nach Δ mit Vorzeichen (größtes Plus zuerst, unabhängig von gut oder schlecht), nach Δ % oder nach AC … |
| `sortByImpact` | bool | `false` | Nur bei Waterfall bridge: sortiert die Kategorien nach Abweichungsgröße (größter Treiber zuerst). Eine Top-N-Rest-Zeile bleibt am Ende. Auch per Klick auf das ⇅-Symbol im Chart umschaltbar. |
| `bridgeOrientation` | enum | `auto` | `auto` · `bars` · `columns` — Nur Kategorie-Brücke: „Balken (horizontal)" zeigt die Kaskade zeilenweise wie bisher (Kategorien untereinander, Δ%-Pins rechts) … |
| `bridgeBreak` | bool | `false` | Integrierte Brücke, Kategorie-Brücke (Säulen) und Wasserfall: Die Summen-Anker (z. B. PY und AC+FC) werden mit sichtbarem Achsenbruch ⫽ gekürzt, damit die Brückenstufen in echter Höhe lesbar werden … |
| `bridgeSecondNet` | bool | `false` | Integrierte Brücke mit Vorjahr und Plan: neben der Abweichung zur Basis ein zweiter Strich mit der Abweichung der Summe zur anderen Basis (z. B. PL-Brücke mit „+4“ zum Vorjahr) … |

**Tabelle**

| Property | Typ | Standard | Werte / Beschreibung |
| --- | --- | --- | --- |
| `valueColumns` | enum | `ac` | `ac` · `basis` · `all` — Zusätzliche Zahlenspalten neben AC: die Varianzbasis (PY oder PL, je nach Abweichungsbasis) oder beide Referenzszenarien — für druck- und boardtaugliche Tabellen ohne Balken-Interpretation. |
| `autoExpandHierarchy` | bool | `true` | Liegen mehrere Felder in „Kategorie“, klappt das Visual die Drill-Hierarchie automatisch auf: der klickbare Zeilenbaum erscheint sofort beim Hineinziehen, ohne die Drill-Knöpfe im Visual-Kopf … |
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
| `tableTotalLegend` | bool | `false` | Die berechnete Σ-Zeile zeigt in der Balkenspalte die Szenario-Legende mit den Summen (■ AC, □ PL, grau PY) statt eines Balkens und zählt nicht zur Balkenskala: Die Zeilenbalken nutzen die volle Spaltenbreite. Δ-Balken und Δ%-Pin der Σ-Zeile bleiben … |
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
| `scatterValueLabels` | bool | `false` | Nur mit gebundener Blasengröße: schreibt den Wert der Blasengröße in die Blase (Schrift hell auf dunkler Blase, dunkel auf heller). Passt die Zahl nicht hinein, steht sie hinter dem Namen … |
| `scatterMaxRadius` | numeric | `0` | Bereich 0–200 — Nur mit gebundener Blasengröße: Radius der größten Blase in Pixeln (bei Schrift-Presets mitskaliert). 0 = automatisch (höchstens 22 px) … |
| `scatterBubbleOpacity` | numeric | `55` | Bereich 10–100 — Nur mit gebundener Blasengröße: Deckkraft der Blasen in Prozent (10 bis 100). Standard 55, damit Überlappungen lesbar bleiben; 100 = deckend wie im Portfolio-Blatt 10A. |
| `scatterEmphFill` | bool | `false` | Hervorgehobene Punkte (Liste „Kategorien hervorheben“ bzw. Token emphasize) bekommen die Hervorhebungsfarbe als Füllung statt eines Rings, etwa für Zukäufe. Im Hochkontrast-Modus bleibt die Füllung in Vordergrundfarbe. |
| `scatterEmphColor` | color | `#0064FF` | Füllfarbe der hervorgehobenen Punkte, wenn „Hervorhebung als Farbe“ an ist. |
| `scatterEmphLabel` | text | leer | Legendeneintrag für die Hervorhebungsfarbe (z. B. „Zukäufe 12/25“). Leer = kein Eintrag. |
| `scatterGroupColor1` | color | `#404040` | Nur bei Punktfarbe „Nach Gruppe/Serie“: Farbe der Gruppe in dieser Position (Reihenfolge des ersten Auftretens). Der Standard ist die gedeckte Palette; ab der 7. Gruppe grau … |
| `scatterGroupColor2` | color | `#3D78B2` | Nur bei Punktfarbe „Nach Gruppe/Serie“: Farbe der Gruppe in dieser Position (Reihenfolge des ersten Auftretens). Der Standard ist die gedeckte Palette; ab der 7. Gruppe grau … |
| `scatterGroupColor3` | color | `#B0702A` | Nur bei Punktfarbe „Nach Gruppe/Serie“: Farbe der Gruppe in dieser Position (Reihenfolge des ersten Auftretens). Der Standard ist die gedeckte Palette; ab der 7. Gruppe grau … |
| `scatterGroupColor4` | color | `#93B5D8` | Nur bei Punktfarbe „Nach Gruppe/Serie“: Farbe der Gruppe in dieser Position (Reihenfolge des ersten Auftretens). Der Standard ist die gedeckte Palette; ab der 7. Gruppe grau … |
| `scatterGroupColor5` | color | `#C2B04E` | Nur bei Punktfarbe „Nach Gruppe/Serie“: Farbe der Gruppe in dieser Position (Reihenfolge des ersten Auftretens). Der Standard ist die gedeckte Palette; ab der 7. Gruppe grau … |
| `scatterGroupColor6` | color | `#9F5989` | Nur bei Punktfarbe „Nach Gruppe/Serie“: Farbe der Gruppe in dieser Position (Reihenfolge des ersten Auftretens). Der Standard ist die gedeckte Palette; ab der 7. Gruppe grau … |
| `scatterQuadLabelTR` | text | leer | Dezente Beschriftung der Quadranten-Ecke (z. B. „Stars" oben rechts). Leer = aus. Nur bei aktiven Quadranten-Linien; weicht Punkten nach Möglichkeit aus. |
| `scatterQuadLabelTL` | text | leer | Dezente Beschriftung der Quadranten-Ecke. Leer = aus. Nur bei aktiven Quadranten-Linien; weicht Punkten nach Möglichkeit aus. |
| `scatterQuadLabelBL` | text | leer | Dezente Beschriftung der Quadranten-Ecke. Leer = aus. Nur bei aktiven Quadranten-Linien; weicht Punkten nach Möglichkeit aus. |
| `scatterQuadLabelBR` | text | leer | Dezente Beschriftung der Quadranten-Ecke. Leer = aus. Nur bei aktiven Quadranten-Linien; weicht Punkten nach Möglichkeit aus. |
| `scatterPath` | enum | `off` | `off` · `line` — Verbindet je Einheit (Feld „Stack-Serie“, ohne Serie ein einziger Pfad) die Punkte in der Reihenfolge der Kategorie, die hier die Periode ist (z. B. Jahre 2017 bis 2025), mit einer dünnen Linie in der Farbe der Einheit, wie in den … |
| `scatterPathLabels` | enum | `auto` | `auto` · `ends` · `all` · `off` — Zeitpfad: Periodenlabels an den Punkten (Jahreszahlen werden zu „'17“ verkürzt) … |
| `scatterPathArrow` | bool | `false` | Zeitpfad: Pfeilspitze am letzten Segment jeder Einheit, zeigt die Richtung der jüngsten Bewegung. Die IBCS-Blätter zeichnen ohne. Standard aus. |
| `scatterPathDelta` | bool | `false` | Zeitpfad: für die hervorgehobenen Einheiten (Liste „Kategorien hervorheben“) dünne Hilfslinien vom ersten und letzten Punkt zu den Achsen, Δ X als Pfeil unter der X-Achse und Δ Y als Pfeil rechts neben dem Plot, Δ Y in … |
| `scatterPlay` | bool | `false` | Blendet einen ▶-Button ein (Rosling-Modus): die Kategorie wird zur Zeitachse — je Periode ein Bild, die Punkte (je Wert des Felds „Serie") gleiten von Periode zu Periode, die Periode steht groß im Hintergrund … |

**Persistierte Zustände** (nicht im Format-Pane; das Visual schreibt sie per `persistProperties`, ein Agent kann sie
vorkonfigurieren — Formate siehe „Persistierte Zustände“ außerhalb dieses Blocks):

- text: `templateApplied`; `smartStartDismissed`; `pnlView`; `tableExpanded`; `tableSort`; `tableColExpanded`;
  `tableNameWidth`; `tableColWidths`; `cardSortSel`

Enum-Labels:

- `template`: `off` = Aus (keine Vorlage); `C01` = C01 · Gestapelte Säulen (Serie);
  `C02` = C02 · Gestapelte Balken (Serie); `C03` = C03 · Säulen + Varianzen (PY);
  `C04` = C04 · Balken + Varianzen (PL); `C05` = C05 · Integrierte Brücke (Zeit);
  `C06` = C06 · Kategorie-Brücke vertikal; `C07` = C07 · Gestapelte Fläche (08A);
  `C08` = C08 · Linie (lange Zeitreihe); `C09` = C09 · Scatter; `C10` = C10 · Bubble (Scatter + Größe);
  `C12` = C12 · Waterfall / Brücke; `C13` = C13 · Small Multiples; `C14` = C14 · Balkentabelle nach ΔPL (04A);
  `C15` = C15 · Balkentabelle nach ΔPL % (04B); `C16` = C16 · Balkentabelle nach AC (04C);
  `C17` = C17 · Kategorie-Brücke waagerecht (06E); `C18` = C18 · Abweichungs-Scatter ΔPY % × ΔPL % (10F);
  `C19` = C19 · Säulen gegen Plan + Jahressäule (03B); `C20` = C20 · Bestand und Fluss (08E bis 08H);
  `C21` = C21 · Kumulierte Linie mit R12 und Monatssäulen (07C); `C22` = C22 · Serienlinien mit Index (07A);
  `C23` = C23 · Scatter-Zeitpfad (07D, 07E)
- `orientation`: `columns` = Säulen (Zeit); `bars` = Balken (Struktur); `line` = Linie (lange Zeitreihe);
  `waterfall` = Waterfall / Brücke; `intwaterfall` = Integrierte Brücke (Zeit);
  `catbridge` = Kategorie-Brücke (Struktur); `table` = Tabelle (IBCS); `pareto` = Pareto (Struktur);
  `dumbbell` = Dumbbell · Vorher/Nachher (Struktur); `slope` = Slope · Vorher/Nachher;
  `scatter` = Scatter / Bubble (Korrelation); `cards` = KPI-Karten (Kacheln); `pnl` = GuV-Statement (IBCS);
  `stockflow` = Bestand & Fluss (Zeit)
- `comparisonMode`: `auto` = Auto; `py` = Vorjahr (PY); `plan` = Plan (PL); `fcrev` = FC Vormonat (Revision)
- `cumulativeKind`: `ytd` = YTD (Jahr kumuliert); `qtd` = QTD (Quartal kumuliert);
  `r12` = R12 (rollierende 12 Perioden)
- `timeAggregation`: `sum` = Summe; `last` = Letzter Wert
- `acFcSplit`: `off` = Aus (FC nur, wo AC fehlt); `full` = FC = Vollmonatsprognose (Aufstockung);
  `rest` = FC = Restmonat (additiv)
- `highlightStyle`: `band` = Band hinter der Kategorie; `ellipse` = Ellipse um die Werte
- `pinStyle`: `auto` = Automatisch (je Modus); `round` = Rund; `square` = Quadratisch
- `stackShape`: `columns` = Säulen; `area` = Fläche
- `areaValueLabels`: `auto` = Automatisch (ausdünnen); `ends` = Erste und letzte Periode; `off` = Aus
- `stackLegendPos`: `end` = Rechts neben der letzten Säule; `start` = Links neben der ersten Säule
- `stackNormalize`: `off` = Werte; `pct100` = 100 % (Anteile)
- `stackBlocks`: `off` = Aus; `gap` = Abstand zwischen Blöcken; `subtotals` = Zwischensumme je Block;
  `subtotalsButLast` = Zwischensummen außer letztem Block
- `sfStockAt`: `end` = Ende der Periode; `center` = Mitte der Periode
- `axisGroups`: `auto` = Aus der Hierarchie; `off` = Aus
- `lineMarkerShape`: `circle` = Kreise; `square` = Quadrate (AC gefüllt, FC schraffiert, PL hohl)
- `linePeriodColumns`: `off` = Aus; `same` = Gleiche Skala (hinter den Linien)
- `lineGapMarkers`: `off` = Aus; `actual` = Am letzten Ist-Monat; `end` = Am Jahresende; `both` = Beide
- `lineIndex`: `off` = Aus (Werte); `base100` = Index (Basis = 100)
- `lineSeriesColor`: `tones` = Grautöne; `palette` = Gruppenpalette
- `lineSeriesLabels`: `ends` = Endwerte; `groups` = Gruppenanfänge und Ende; `all` = Alle Punkte;
  `none` = Keine
- `multiplesAgg`: `sum` = Summe; `mean` = Durchschnitt
- `multiplesTotalPos`: `first` = Erste Kachel; `last` = Letzte Kachel
- `multiplesBasis`: `scenario` = Szenario (PY / PL); `avg` = Durchschnitt aller Kacheln (Ø)
- `sortMode`: `off` = Aus (Datenreihenfolge); `abs` = Nach Wirkung |Δ|;
  `signed` = Nach Δ (größtes Plus zuerst); `pct` = Nach Δ %; `ac` = Nach AC;
  `series` = Nach erster Serie (Stapel)
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
- `scatterPath`: `off` = Aus; `line` = Linie durch die Perioden
- `scatterPathLabels`: `auto` = Auto (wo Platz ist); `ends` = Start und Ende; `all` = Alle Perioden;
  `off` = Aus

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
| `capOverflow` | bool | `false` | Macht das Skalen-Maximum hart: größere Werte werden gekappt und mit Doppelstrich markiert (Label zeigt den echten Wert). Nicht bei der gestapelten Fläche. |

**Scatter-Achsen**

| Property | Typ | Standard | Werte / Beschreibung |
| --- | --- | --- | --- |
| `xMin` | text | leer | Nur Scatter: fixiert die Achsengrenze (z. B. 0 oder 0.25; k/M/B-Suffixe wie bei der Referenzlinie). Leer = automatisch. Für identische Achsen über mehrere Scatter einer Seite … |
| `xMax` | text | leer | Nur Scatter: fixiert die Achsengrenze. Leer = automatisch. |
| `yMin` | text | leer | Nur Scatter: fixiert die Achsengrenze. Leer = automatisch. |
| `yMax` | text | leer | Nur Scatter: fixiert die Achsengrenze. Leer = automatisch. |
| `xLogScale` | bool | `false` | Nur Scatter: logarithmische X-Achse (Ticks als Dekaden bzw. 1-2-5-Schritte) … |
| `yLogScale` | bool | `false` | Nur Scatter: logarithmische Y-Achse (AC). Greift nur, wenn alle Y-Werte größer 0 sind — sonst linear mit Hinweis im Bearbeiten-Modus. |
| `ratioRays` | text | leer | Nur Scatter: Strahlen durch den Ursprung für feste Quoten Y ÷ X (z. B. Umsatz je Mitarbeiter), Liste mit Semikolon getrennt, z. B. „1; 0,7; 0,35“ (k/M/B-Suffixe wie bei der Referenzlinie) … |
| `ratioRayUnit` | text | leer | Zusatz hinter der Quote an den Strahlen und im Tooltip, z. B. „mEUR/Rep“. Leer = nur die Zahl. |

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
  Kategoriename. Beispiel: `"Opex, Materialaufwand"`. Ab 1.53 datengetriebene
  Alternative über die Rolle `rowType` (Token, siehe „rowType-Token“); beide wirken vereinigt.
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

## Bekannte Fallen (Stand 1.53)

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
12. **Komma-Listen sind Override, die Rolle ist der Vertrag (ab 1.53):** Für neue
   Berichte die Zeilenstruktur als Token in eine Modell-Spalte legen (`rowType`),
   nicht in `resultList`/`skipList`/… — Namen brechen bei Umbenennung und
   Übersetzung. Beide Quellen werden vereinigt; eine Liste kann ein Token also
   nicht aufheben (dafür das Modell ändern). Unbekannte Token (Tippfehler,
   freie Texte wie „Erlös“) melden sich im Bearbeitungsmodus unten rechts im
   Chart — wer eine Spalte mit beliebigen Texten in `rowType` legt, sieht dort
   einen Hinweis. Werte, die mit `sum`/`pct` beginnen, gelten wie bisher als
   Ganzes (Präfix-Regel bis 1.52).

## Verwandte Dateien

- `capabilities.json` — maschinenlesbare Rollen/Properties (Quelle der generierten Tabellen)
- `src/settings.ts` — Standardwerte und Beschreibungstexte je Setting (deutsch; Quelle der generierten Tabellen)
- `CHANGELOG.md` / `BACKLOG.md` — was sich geändert hat / was fehlt
- `.claude/skills/chartkitchen-report/` — Claude-Skill mit Report-Blaupausen
  (Monitoring · Monatsreport · Sales-Analyse) und Referenz-Instanz-Workflow
- `test/test.html` — 361 Render-Stages (Nummern c1 bis c282, inkl. Varianten wie `c248L`) als
  lebende Beispiele jeder Funktion; `npm run test:render` (Checks + Fehler). Weitere Suiten:
  `test:scale` (Skalierungs-Geometrie), `test:notation` (Notation), `test:export` (PDF/PPT-Layouts).
  c45, c90 und c92 waren bis 1.52.4 Hinweis-Fälle („rein negativ“) und zeichnen seit den negativen
  Brücken eine Brücke mit Nulllinie (Split-Layout); ein Hinweis erscheint nur noch ohne Vergleichsbasis
  (bzw. bei zu wenig Platz in der Integrierten Brücke).
  rowType-Token: c248–c257 (Listen-Referenzen `…L`, SVG-Gleichheit als Nachweis)
- `test/gen-agent-guide.js` — erzeugt die Property-Referenz dieser Datei (`npm run guide` / `guide:check`)
