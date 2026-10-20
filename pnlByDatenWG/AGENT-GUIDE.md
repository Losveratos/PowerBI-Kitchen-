# AGENT-GUIDE · P&L Statement byDatenWG

**Zielgruppe: KI-Agenten** (Claude, Copilot, Cursor, GPT …), die Power-BI-Berichte
mit diesem Visual bauen, konfigurieren oder debuggen. Diese Datei macht das
Visual maschinen-konfigurierbar: exakte Property-Namen fürs PBIR-Authoring,
Datenvertrag mit Semantik, versteckte persistierte Zustände und die bekannten
Fallen. Menschen lesen besser [README.md](README.md) und
[QUICKSTART.md](QUICKSTART.md); die maschinenlesbare Quelle der Wahrheit ist
[capabilities.json](capabilities.json), die Pane-Texte stehen in
[src/settings.ts](src/settings.ts) und `stringResources/<locale>/resources.resjson`.
Geometrie und Notation des Mega-Tables: [SPEC-MEGATABLE.md](SPEC-MEGATABLE.md).
Vorbild dieser Datei: `../ibcsInspiredChartDeck/AGENT-GUIDE.md` (ChartKitchen).

Stand: **1.4.1.0** (18.10.2026). Bei Versionssprüngen: CHANGELOG.md zuerst lesen.

## Steckbrief

| | |
| --- | --- |
| GUID | `pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358` |
| visual.json `visualType` | GUID wie oben (Import ersetzt ältere Version automatisch) |
| Paket | `dist/pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358.1.4.1.0.pbiviz` |
| API | `powerbi-visuals-api` 5.11 |
| Datenfenster | `dataReductionAlgorithm window 30000` Zeilen; weitere Segmente lädt das Visual per `fetchMoreData` nach (Ladebalken + „≈" an Summen, bis alles da ist) |
| Fähigkeiten | Tooltips (default + canvas) · Tastaturfokus · Landing Page · Multi-Visual-Selektion · `supportsHighlight: false` (Cross-Interaktion filtert) |
| Lizenz | MIT · keine externen Calls, kein Storage, keine Telemetrie (einzige Ausnahme: der Knopf „📖 Doku öffnen" im Hub ruft auf Klick `host.launchUrl` mit der Doku-Seite auf — nur Bearbeitungsmodus) |

## Feld-Rollen (Datenvertrag)

Interne Rollennamen für PBIR (`projections`) — je Rolle max. 1 Feld, `levels` max. 8:

| Rolle (intern) | Kind | Semantik + Fallstricke |
| --- | --- | --- |
| `levels` | Grouping | Sternschema L1..Ln (Reihenfolge = Hierarchie). **Primärer Modus.** Ragged: leere tiefere Ebene oder Wiederholung der vorigen beendet den Pfad. Gleiche Pfade werden aggregiert |
| `account` | Grouping | Konto-ID (Key), eindeutig + stabil. Pflicht im Parent-Child-Modus; im Level-Modus optional (Blatt-ID). Ohne `levels` und `account` zeigt das Visual im Bearbeitungsmodus den Start-Hub (1.3; `emptyState.mode`) |
| `accountName` | Grouping | Anzeigename. Ohne ihn heißt das Blatt wie die letzte gefüllte Ebene |
| `parent` | Grouping | Parent-ID → Parent-Child-Modus (gewinnt, wenn zusätzlich `levels` gebunden ist) |
| `ac` | Measure | AC (Pflicht) |
| `py` / `pl` / `fc` | Measure | PY / PL / FC je Periode |
| `period` | Grouping | Monat/Periode — schaltet Sparklines, MTD/YTD-Blöcke, `secondBlock` frei. Formate: `2026-03`, Datum, Monatsnamen deutsch/englisch (lang/kurz), `1..12`; Fiskaljahr → `columns.periodSort = data` |
| `colCategory` | Grouping | **1.2** Spalten-Kategorie (max. 1), nur klassische Tabelle: der Spaltensatz des YTD-Blocks (sonst des ersten) wiederholt sich je Kategoriewert (Segment, Quartal …) mit Gruppen-Kopf, danach der Block als „Gesamt". Jede Kategorie rechnet ein eigenes Modell (Formeln, Margen), Monate auf den Kalender des Gesamtmodells gelegt; einheitlicher Δ-Maßstab; max. 24 Werte (Rest → Fußnote). Mega-Table/Balken/Waterfall ignorieren die Rolle (Hinweis im Bearbeitungsmodus). Measures müssen additiv sein (Gesamt = Σ Kategorien, wie bei der Periode) |
| `rowType` | Grouping | `Account` · `Subtotal` · `Formula` · `KPI` · `Separator` (Groß/klein egal). KPI = Margenzeile (%-Anzeige, Δ in %p) |
| `formulaDef` | Grouping | für Formula/KPI: `[EBITDA]/[Umsatz]`, `+ - * /`, Klammern; Verweis per eindeutigem Zeilennamen, Formel-auf-Formel erlaubt, Zirkel → Fehler an der Zeile |
| `signConvention` | Grouping | Rechenvorzeichen: Erlös `1`, Kosten `-1` (Subtotal = Vorzeichen × Σ Kinder) |
| `displayInvert` | Grouping | Kosten positiv anzeigen (Anzeige ≠ Rechnung) |
| `varianceInvert` | Grouping | Gut/schlecht drehen. **Nicht** auf Kostenzeilen mit `SignConvention = -1` setzen: deren Δ ist über das Rechenvorzeichen schon richtig bewertet, ein zusätzliches Drehen färbt eine Kostenüberschreitung fälschlich günstig. Nur für Zeilen mit +1, bei denen „mehr“ schlecht ist |
| `sortOrder` | Grouping | Reihenfolge innerhalb des Elternknotens |
| `comment` | Grouping | Kommentar je Zeile → Marker ①② + Fußnote |
| `filterInfo` | Measure (Text) | Filterkontext-Text für die Filter-Fußzeile (`titleBlock.filterFooter`) — Berichtsfilter sind für Custom Visuals unsichtbar |
| `fcFy` / `plFy` | Measure | FY-Ausblick: AC&FC Gesamtjahr / PL Gesamtjahr (Skalar, auf jeder Monatszeile wiederholt — das Visual nimmt den ersten Wert). Schaltet den FY-Block frei (Mega `blockKind = fy`, 12G) |

Reihenfolge = Feldliste seit 1.2 (Ebenen → Schlüssel → AC · PY · PL · FC → Periode → Spalten-Kategorie → Spezialrollen → Filter-Info → FY). Das Visual liest jede Spalte über ihre **Rolle**, nie über die Position.

**Vorzeichen-Dreierlogik:** SignConvention (rechnen) · DisplayInvert (zeigen) ·
VarianceInvert (bewerten) sind unabhängig. Typische Kostenzeile: `SignConvention -1` · `DisplayInvert true` · `VarianceInvert false` (so rechnen Engine-Tests und Pharma-Demo). **Warnung:** `-1` zusammen mit `VarianceInvert true` dreht die Bewertung doppelt — eine Kostenüberschreitung würde als günstig gefärbt.

**DAX-Regel:** Measures, die für nicht existierende Konto/Perioden-Kombinationen
non-blank liefern (`COALESCE(x,0)`, `+0`), erzeugen Geisterzeilen und
Kreuzprodukte. Wächter-Muster: `IF(COUNTROWS('Fakt') > 0, …)`.

## Modus-Wahl

| Aufgabe | Weg |
| --- | --- |
| GuV / Statement lesen, Spalten-Presets | Ansicht Tabelle (klassisch), `columns.preset` |
| IBCS-Tabelle T01–T04, 12A/12G/12H | Ansicht Tabelle + `columns.template` (Mega-Table) |
| Struktur der Zeilen | Ansicht Balken (`uiState.view = "bars"`) |
| Zeilen-Kaskade | Ansicht Waterfall (`"waterfall"`) |
| Werttreiberbaum / DuPont | Ansicht Baum (`"tree"`), Start über `columns.treeRoot/treeLevel/treeCard` |

Die Ansicht ist Leser-Zustand (Toolbar) und steht in `state.uiState` (unten).

## Mega-Table in 60 Sekunden

- **An** ist er, sobald ein Spalten-Schalter (`showPY/showPL/showMinuend`,
  `dPy*`/`dPl*`) an ist **und** die Ansicht Tabelle ist. Alles aus = klassische Tabelle.
- `columns.template` ist nur ein **Preset**: es schreibt alle Schalter + Dezimalen
  (12G/12H zusätzlich `titleBlock.headline`) per `persistProperties` und merkt sich
  das in `columns.templateApplied`. Danach ist jeder Schalter frei.
- Notation (eine Regel): Minuend → Füllung (AC voll · FC schraffiert · PL umrandet,
  Δ-Elemente blass getönt), Subtrahend → Achse (PY grau · PL doppelt).
- Blöcke: `blockKind` (month · ytd · fy) + optional `secondBlock` mit
  `leftBlockKind`. FY-Block: Minuend = AC&FC (`fcFy`), PL = `plFy`, PY = ganzes Vorjahr.
- 12G (FY + Wert-Kaskade + Minuend AC): der AC&FC-Balken stapelt YTD (voll, Zahl
  innen) + Restjahr (schraffiert, Jahreszahl außen); Δ-Elemente des FY-Blocks schraffiert.
- Ab 150 sichtbaren Zeilen zeichnet der Mega-Table nur das Fenster um den Viewport
  (+30 Zeilen Puffer); Export zeichnet immer alles.

## Settings-Referenz (aus Settings-Modell + capabilities.json generiert, 1.4.1.0)

**Neu in 1.4** (Hub-Polish): keine neue Property, keine neue Rolle. Der Hub
schreibt zusätzlich `style.fontPreset` (Leiste HD · Full HD · UHD unten auf
jeder Hub-Seite, Echo-Guard) und ruft auf Klick `host.launchUrl` (Doku). Galerie
nach Zweck gruppiert, Feld-Intro mit allen Rollen, Checkliste „🚀 Loslegen",
„☰ Start" als erstes Toolbar-Element. Details unter „Hub-Polish (1.4)" bei den Fallen.

**Neu in 1.3** (Start-Hub): `emptyState.mode` += `hub` (neuer **Standard**, erster
Eintrag; `demo`/`fields`/`message` unverändert wählbar). Keine neue Property,
keine neue Rolle. Der Hub ist lokaler Zustand (nichts davon wird gespeichert);
geschrieben wird nur beim Klick auf ein Template (wie das Toolbar-Dropdown).
Details unter „Start-Hub (1.3)" bei den Fallen.

**Neu in 1.2** (Ease of Use): `columns.preset` += `custom` mit `colAc`/`colPy`/
`colPl`/`colFc`/`colDelta`; `columns.barOverlap`/`barTriangles` (Balken-Ansicht);
`toolbar.showValues` (Wertspalten-Schalter für Leser) und `toolbar.showTemplate`
(Template-Dropdown nur im Bearbeitungsmodus); `emptyState.mode`; Rolle
`colCategory`; `state.uiState` += `vals`/`megaVals`. Pane: die Gruppe Mega-Table
(Template) steht jetzt **vor** der Gruppe Tabelle.

**Neu in 1.1** (Pakete A–C): `columns.blockKind`/`leftBlockKind`/`pctOfRevenue`/
`exportExpandAll`/`highlight`/`materialityAbs`/`materialityPct`;
`columns.minuend` += `pl`; `columns.template` += `12G`/`12H`;
`numbers.financeFormat`/`sumSafeRounding`/`fixedMax`/`fixedVarMax`; `numbers.scaling` += `b`;
Karte `labels` (`labelAc/Py/Pl/Fc`); Karte `emptyState` (`title`/`body`);
`style.variancePreset`; `titleBlock.autoMessage`/`headline`/`footer`/`filterFooter`;
`toolbar.showScenario`; Rolle `filterInfo`.

PBIR: `visual.json → visual.objects.<objekt>[0].properties.<property>` als
Literal — Text/Enum `{"expr":{"Literal":{"Value":"'12G'"}}}`, Bool
`"true"`, Zahl `"0D"`, Farbe `{"solid":{"color":{"expr":{"Literal":{"Value":"'#2C7BB6'"}}}}}`.
Enums als String-Wert aus der Tabelle. Leere Texte = Automatik.

### Objekt `columns` — Spalten & Mega-Table

| Property | Typ | Default | Bedeutung (de-DE-Pane) |
| --- | --- | --- | --- |
| `preset` | enum `full` · `acref` · `dall` · `acpydpy` · `acpldpl` · `dpct` · `custom` | `full` | Standard-Spalten-Preset: Spaltensatz der klassischen Tabelle beim Öffnen des Berichts; Leser schalten ihn in der Toolbar um. Standard: AC·PY·PL·FC. `custom` (1.2) = „Eigene Auswahl" aus den fünf Schaltern darunter |
| `colAc` | bool | `true` | Eigene Auswahl: Spalte AC: Istwerte als Zahlenspalte (mit % vom Umsatz, falls an). Standard: an — nur bei `preset = custom` sichtbar |
| `colPy` | bool | `true` | Eigene Auswahl: Spalte PY: Vorjahreswerte als Zahlenspalte. Standard: an |
| `colPl` | bool | `true` | Eigene Auswahl: Spalte PL: Planwerte als Zahlenspalte. Standard: an |
| `colFc` | bool | `false` | Eigene Auswahl: Spalte FC: Forecastwerte als Zahlenspalte. Standard: aus |
| `colDelta` | bool | `true` | Eigene Auswahl: Δ-Balken + Δ%-Pin: Abweichung von AC zur Δ-Referenz als Balken und Pin. Standard: an |
| `reference` | enum `auto` · `py` · `pl` · `fc` | `auto` | Standard-Δ-Referenz: Basis der Δ-Spalten, -Balken und Baumkarten. Auto nimmt PL, sonst PY. Standard: Auto |
| `barOverlap` | bool | `false` | Balken-Ansicht: Szenario-Balken überlappt: AC vorn in voller Stärke, die Referenz (PY grau / PL umrandet / FC schraffiert) dahinter, leicht versetzt — die ChartKitchen-Notation. Standard: aus |
| `barTriangles` | bool | `false` | Balken-Ansicht: Dreieck-Marker weiterer Szenarien: Kleine Dreiecke über den Balken am Wert jedes weiteren gebundenen Szenarios (PY grau, PL umrandet, FC schraffiert). Standard: aus |
| `periodSort` | enum `auto` · `data` · `calendar` | `auto` | Perioden-Sortierung: Automatisch liest JJJJ-MM-Schlüssel, Datumswerte und Monatsnamen; Datenreihenfolge behält die Reihenfolge des Modells (Fiskaljahre). Standard: Automatisch |
| `pctRevenue` | bool | `true` | %-vom-Umsatz-Spalte: Anteil jeder Zeile an der Umsatz-Basiszeile, neben AC. Standard: an |
| `revenueBase` | text | `—` | Umsatz-Basiszeile (ID oder Name): Zeile, auf die sich % vom Umsatz bezieht. Leer = erste Zeile der obersten Ebene |
| `hideZeroRows` | bool | `false` | Nullzeilen ausblenden (Standard): Zeilen ohne jeden Wert verschwinden; Leser schalten es in der Toolbar um. Standard: aus |
| `fitWidth` | bool | `false` | Tabelle auf Breite einpassen (Standard): Staucht die Diagramm-Spalten, bis die Tabelle in den Viewport passt — kein Querscrollen. Standard: aus |
| `exportExpandAll` | bool | `true` | Export: alle Zeilen aufklappen: PDF-/PowerPoint-Export und Abonnements drucken jede Zeile aufgeklappt, egal was am Bildschirm zugeklappt ist. Standard: an |
| `highlight` | text | `—` | Zeilen hervorheben: Kommagetrennte Zeilennamen (oder IDs), ohne Groß-/Kleinschreibung: ein dezentes Band läuft über alle Spalten dieser Zeilen (IBCS EMPHASIZE). Leer = aus |
| `materialityAbs` | numeric | `0` | Wesentlichkeit ab (absolut): Abweichungen unter diesem absoluten Betrag (Dateneinheiten, vor k/m-Skalierung) werden in sanftem Grau statt in den Abweichungsfarben dargestellt — Zahlen, Balken, Pins und Wasserfall-Stufen. 0 = aus |
| `materialityPct` | numeric | `0` | Wesentlichkeit ab (%): Abweichungen unter diesem Δ % werden in sanftem Grau dargestellt. Sind beide Schwellen gesetzt, muss eine Abweichung beide überschreiten, um farbig zu sein. 0 = aus |
| `template` | enum `off` · `T01A` · `T01B` · `T02A` · `T02B` · `T02C` · `T02E` · `T02F` · `T03A` · `T03B` · `T04A` · `T04B` · `T04C` · `T04D` · `T04E` · `12A` · `12G` · `12H` | `off` | Template (IBCS-Tabelle): Setzt die Schalter darunter auf die Template-Vorgaben — danach ist jeder Schalter frei. Standard: aus (klassische Tabelle) |
| `minuend` | enum `ac` · `fc` · `pl` | `ac` | Analysiertes Szenario (Minuend): AC gefüllt, FC schraffiert, PL umrandet mit blassen Δ-Balken (Planrechnung, 12H) — die Δ-Spalten vergleichen es mit PY / PL. FC / PL brauchen ihr Feld. Standard: AC |
| `showPY` | bool | `false` | Wertspalte PY: Vorjahreswerte als Zahlenspalte. Standard: aus |
| `showPL` | bool | `false` | Wertspalte PL: Planwerte als Zahlenspalte. Standard: aus |
| `showMinuend` | bool | `false` | Wertspalte AC / FC: Werte des analysierten Szenarios als Zahlenspalte. Standard: aus |
| `valueCascade` | bool | `false` | Wertspalten als Wert-Kaskaden (12A): Jedes gezeigte Szenario wird zur Kaskaden-Diagrammspalte: Schritte auf der laufenden Summe, =-Zeilen ab null, Kostenzeilen hell. Standard: aus |
| `dPyAbs` | bool | `false` | ΔPY als Zahl: Absolute Abweichung zum Vorjahr. Standard: aus |
| `dPyBar` | bool | `false` | ΔPY als Balken: Abweichungsbalken auf einer Nulllinie, graue PY-Achse. Standard: aus |
| `dPyWaterfall` | bool | `false` | ΔPY als integrierter Wasserfall: Jeder Δ-Balken beginnt am Ende des vorigen; =-Zeilen setzen an der Nulllinie neu an (T04C/E). Standard: aus |
| `dPyPct` | bool | `false` | ΔPY% als Zahl: Relative Abweichung zum Vorjahr. Standard: aus |
| `dPyPin` | bool | `false` | ΔPY% als Pins: Relative Abweichung als Pins (Lollipops). Standard: aus |
| `dPlAbs` | bool | `false` | ΔPL als Zahl: Absolute Abweichung zum Plan. Standard: aus |
| `dPlBar` | bool | `false` | ΔPL als Balken: Abweichungsbalken auf einer Nulllinie, doppelte PL-Achse. Standard: aus |
| `dPlWaterfall` | bool | `false` | ΔPL als integrierter Wasserfall: Jeder Δ-Balken beginnt am Ende des vorigen; =-Zeilen setzen an der Nulllinie neu an (T04B/D). Standard: aus |
| `dPlPct` | bool | `false` | ΔPL% als Zahl: Relative Abweichung zum Plan. Standard: aus |
| `dPlPin` | bool | `false` | ΔPL% als Pins: Relative Abweichung als Pins (Lollipops). Standard: aus |
| `pctOfRevenue` | bool | `false` | Spalte % vom Umsatz: Anteil jeder Zeile an der Umsatz-Basiszeile (Gruppe Tabelle), rechts neben den Wertspalten. Standard: aus |
| `secondBlock` | bool | `false` | Zweiter Perioden-Block (Monat | _YTD): Braucht das Periodenfeld: links der Monat der letzten Ist-Daten, rechts der Jahresverlauf. Standard: aus |
| `blockKind` | enum `month` · `ytd` · `fy` | `ytd` | Perioden-Block: Monat der letzten Ist-Daten, Jahr bis dato oder FY-Ausblick (AC&FC vs PL, braucht die FY-Felder); mit zweitem Block der rechte. Standard: YTD |
| `leftBlockKind` | enum `month` · `ytd` · `fy` | `month` | Zweiter Block (links): Periode des Blocks links vom Perioden-Block, wenn der zweite Block an ist. Standard: Monat |
| `structureSubtotals` | bool | `true` | Zwischensummen-Blöcke (Strukturdaten): Regionen / Strukturhierarchien: Zwischensummen-Blöcke mit Leerzeile; aus = nur Blätter + Gesamtsumme. Standard: an |
| `showPctRows` | bool | `true` | Margen-/%-Zeilen: KPI-Zeilen (Margen) kursiv, ihre Δ in Prozentpunkten. Standard: an |
| `thresholds` | bool | `false` | Δ rot unter Schwelle (+ Fußzeile): Δ-Zahlen unter den Schwellen werden rot; eine Fußzeile nennt die Regel. Standard: aus |
| `thresholdAbs` | numeric | `-20` | Schwelle Δ (Monat / einziger Block): In Anzeige-Einheiten (nach k/m-Skalierung). Standard: −20 |
| `thresholdPct` | numeric | `-10` | Schwelle Δ% (Monat / einziger Block): In ganzen Prozent. Standard: −10 |
| `thresholdYtdAbs` | numeric | `-220` | Schwelle Δ (_YTD-Block): Schwelle des zweiten Blocks, in Anzeige-Einheiten. Standard: −220 |
| `thresholdYtdPct` | numeric | `-10` | Schwelle Δ% (_YTD-Block): Schwelle des zweiten Blocks, in ganzen Prozent. Standard: −10 |
| `scenarioMarks` | bool | `true` | Szenario-Unterstreichungen (Kopf + Schluss): AC voll, PY grau, PL doppelt, FC schraffiert unter den Spaltenköpfen. Standard: an |
| `chartLabels` | bool | `true` | Zahlen an Balken / Pins / Kaskaden: Wertbeschriftung an jedem Diagramm-Element. Standard: an |
| `capBars` | bool | `false` | Ausreißer-Pfeile auch für Δ-Balken: Pins kappen Ausreißer immer (Q3 + 4 × IQR); dies erweitert es auf die Δ-Balken. Standard: aus |
| `sort` | enum `cat` · `min` · `delta` | `cat` | Sortierung (Strukturdaten): Je Zwischensummen-Block; Zeilen namens Sonstige … bleiben unten. Standard: Kategoriereihenfolge |
| `sortBlock` | enum `period` · `ytd` | `ytd` | Sortierender Block: Welcher Perioden-Block die Reihenfolge bestimmt. Standard: YTD-Block |
| `treeRoot` | text | `—` | Wurzelzeile Treiberbaum (ID, Name oder Kategorie): Leer = letzte Formel-/KPI-Zeile mit Operanden, sonst die Modell-Wurzel |
| `treeLevel` | numeric | `0` | Start-Tiefe Treiberbaum (0 = ganzer Baum): Wie viele Ebenen des Baums beim Start offen sind. 0 = ganzer Baum. Standard: 0 |
| `treeCard` | enum `months` · `delta` · `bridge` | `months` | Karten-Diagramm im Treiberbaum: Mini-Diagramm auf jeder Karte: Monatssäulen, Abweichungssäulen oder Mini-Brücke. Standard: Monatssäulen |
| `treeStatus` | bool | `true` | Status-Indikator der Karten (Δ-Farbe): Kartenrand und Δ% im Kartenkopf in der Abweichungsfarbe. Standard: an |

### Objekt `toolbar` — Darstellung & Toolbar

| Property | Typ | Default | Bedeutung (de-DE-Pane) |
| --- | --- | --- | --- |
| `show` | bool | `true` | Toolbar anzeigen (Leser können umschalten): Knöpfe über dem Statement: Ansicht, Spalten, Einheit, Dichte, Ebenen. Standard: an |
| `showLegend` | bool | `true` | Szenario-Legende anzeigen: Chips für AC · PY · PL · FC sowie günstige / ungünstige Δ unter der Toolbar. Standard: an |
| `showView` | bool | `true` | Gruppe: Ansicht: Tabelle · Balken · Wasserfall · Baum. Standard: an |
| `showPresets` | bool | `true` | Gruppe: Spalten-Presets: Spaltensätze der klassischen Tabelle. Standard: an |
| `showReference` | bool | `true` | Gruppe: Δ-Referenz: PY · PL · FC als Basis jeder Δ. Standard: an |
| `showPeriods` | bool | `true` | Gruppe: Perioden (MTD/YTD/FY): Perioden-Blöcke der klassischen Tabelle. Standard: an |
| `showUnit` | bool | `true` | Gruppe: Einheit: Umschalten zwischen Tausend und Millionen. Standard: an |
| `showDensity` | bool | `true` | Gruppe: Dichte: Normale oder kompakte Zeilen. Standard: an |
| `showLevels` | bool | `true` | Gruppe: Aufklapp-Ebene: Hierarchie bis Ebene 1, 2 … oder ganz öffnen. Standard: an |
| `showOptions` | bool | `true` | Gruppe: Optionen: % vom Umsatz, Nullzeilen ausblenden, auf Breite einpassen. Standard: an |
| `showScenario` | bool | `false` | Gruppe: Szenario (Mega-Table): Leser schalten das analysierte Szenario AC / FC und die Referenz-Sicht ΔPY · ΔPL · beide des Mega-Tables um. Standard: aus |
| `showValues` | bool | `false` | Gruppe: Wertspalten (Szenarien einzeln): Leser kombinieren die Wertspalten frei — AC, PY, PL, FC und Δ gegen die Δ-Referenz (klassische Tabelle), analysiertes Szenario · PY · PL (Mega-Table). Die Spalten-Presets bleiben als Schnellwahl. Standard: aus |
| `showTemplate` | bool | `true` | Template-Auswahl im Bearbeitungsmodus: Kompaktes Template-Dropdown am Anfang der Toolbar, solange du den Bericht bearbeitest (Ansicht Tabelle). Leser und Export sehen es nie. Standard: an |
| `foldable` | bool | `false` | Bedienleisten einklappbar (☰): Toolbar, Legende und Hinweiszeilen klappen hinter einen kleinen ☰-Knopf; eingeklappt bleibt eine schmale Zeile. Für kleine Kacheln. Exporte drucken die Legende immer. Standard: aus (1.5) |
| `startFolded` | bool | `true` | Startzustand eingeklappt (nur mit `foldable`); die Wahl des Lesers gilt zur Laufzeit, nichts wird gespeichert (1.5) |

### Objekt `numbers` — Zahlen

| Property | Typ | Default | Bedeutung (de-DE-Pane) |
| --- | --- | --- | --- |
| `scaling` | enum `auto` · `none` · `k` · `m` · `b` | `auto` | Skalierung: Auto schaltet ab 50.000 auf k und ab 50 Mio. auf m. Standard: Auto |
| `unitText` | text | `EUR` | Einheit (z. B. EUR): Folgt auf k / m in Titel, Skalen-Hinweis und Karten. Standard: EUR |
| `decimals` | numeric | `1` | Dezimalstellen (Werte): Nachkommastellen von Werten und Δ. Standard: 1 |
| `pctDecimals` | numeric | `1` | Dezimalstellen (Δ%): Nachkommastellen von Δ% und Margen. Standard: 1 |
| `financeFormat` | bool | `false` | Finance-Format (Klammern): Finanzkonvention: negative Werte in Klammern statt Minuszeichen — (1 234) — und Null als „–“. Gilt für Werte, Δ und Δ %; positive Δ behalten ihr „+“. Standard: aus |
| `sumSafeRounding` | bool | `false` | Σ-treue Rundung: Rundet die Wertspalten nach dem Restwertverfahren, sodass die gedruckten Kinder exakt ihre gedruckte Zwischensumme ergeben (Formel- und Margenzeilen behalten die exakte Rundung). Standard: aus |
| `fixedMax` | text | `—` | Skalen-Mindestmaximum (Werte): Wertbalken und Wert-Kaskaden reichen mindestens bis zu diesem Betrag — gleiche Skalen über mehrere Visuals (IBCS). Dateneinheiten, k / m / b erlaubt (z. B. 1.5m). Größere Werte erweitern die Skala weiterhin. Leer = automatisch |
| `fixedVarMax` | text | `—` | Skalen-Mindestmaximum (Δ): Dasselbe für Δ-Balken und integrierte Δ-Wasserfälle (symmetrisch ±). Dateneinheiten, k / m / b erlaubt. Leer = automatisch |

### Objekt `labels` — Szenario-Begriffe

| Property | Typ | Default | Bedeutung (de-DE-Pane) |
| --- | --- | --- | --- |
| `labelAc` | text | `—` | AC umbenennen: Eigener Begriff für AC in Toolbar, Legende, Spaltenköpfen, Tooltips, Titel und Fußzeilen (z. B. „Ist“). Leer = AC |
| `labelPy` | text | `—` | PY umbenennen: Eigener Begriff für PY, auch in den ΔPY-Köpfen (z. B. „Vorjahr“). Leer = PY |
| `labelPl` | text | `—` | PL umbenennen: Eigener Begriff für PL, auch in den ΔPL-Köpfen (z. B. „Budget“). Leer = PL |
| `labelFc` | text | `—` | FC umbenennen: Eigener Begriff für FC (z. B. „Prognose“). Leer = FC |

### Objekt `style` — Stil

| Property | Typ | Default | Bedeutung (de-DE-Pane) |
| --- | --- | --- | --- |
| `appearance` | enum `auto` · `light` · `dark` | `auto` | Erscheinungsbild: „Auto“ erkennt dunkle Berichts-Themes an der Hintergrundfarbe und stellt Tinte, Achsen und Flächen auf helle Töne um; von Hand dunkel gefärbte Seiten brauchen „Dunkel“. Standard: Auto |
| `variancePreset` | enum `auto` · `teal` · `ibcs` · `blueOrange` | `auto` | Abweichungsfarben-Preset: Blau / Orange ist das ColorBrewer-Paar #2C7BB6 / #E66101 — auch bei vollständiger Farbenblindheit und im Schwarzweiß-Druck unterscheidbar. Auto behält die Abweichungsfarben oben. Die beiden Farbwähler darunter übersteuern weiterhin. Standard: Auto |
| `colorMode` | enum `teal` · `ibcs` | `teal` | Abweichungsfarben: Teal ersetzt IBCS-Grün, damit es bei Rot-Grün-Sehschwäche lesbar bleibt (dokumentierte Abweichung). Standard: Teal |
| `goodColor` | color | `—` | Farbe günstige Δ (Überschreibung): Leer = Farbe des Abweichungsmodus |
| `badColor` | color | `—` | Farbe ungünstige Δ (Überschreibung): Leer = Farbe des Abweichungsmodus |
| `accentColor` | color | `#404040` | Akzentfarbe Bedienelemente: Aktive Toolbar-Knöpfe, Zurück-Knopf und Breadcrumb-Hover — nie Datenmarken oder Achsen. Standard: #404040 |
| `pageBackground` | color | `#FFFFFF` | Hintergrund Seite: Grund des Statements, des Baums und der Kachel-Ansicht. Standard: weiß (im Dunkelmodus dunkel) |
| `cardBackground` | color | `#FFFFFF` | Hintergrund Kacheln: Füllung der Baumkarten, Kacheln und des Hover-Panels. Standard: weiß (im Dunkelmodus dunkel) |
| `fontPreset` | enum `hd` · `fullhd` · `uhd` | `hd` | Schriftgrößen-Preset: Skaliert alle Beschriftungen auf einmal: HD ×1 · Full HD ×1,25 · UHD ×1,6. Standard: HD |
| `fontZoom` | numeric | `100` | Schrift-Feinskalierung (%): 80–160 % zusätzlich zum Preset (100 = Preset unverändert). Standard: 100 |
| `headerFontSize` | numeric | `0` | Schriftgröße Kopfzeilen (px, 0 = automatisch): 0 = automatisch (eingebaute Größen), sonst 7–20 px. Standard: 0 |
| `headerColor` | color | `—` | Schriftfarbe Kopfzeilen (Überschreibung): Leer = eingebautes weiches Grau |
| `density` | enum `normal` · `compact` | `normal` | Standard-Dichte: Zeilenhöhe beim Öffnen des Berichts; Leser schalten sie in der Toolbar um. Standard: Normal |
| `stickyHeader` | bool | `true` | Kopfbereich fixieren: Titel, Toolbar, Legende und Spaltenköpfe bleiben oben, während die Zeilen scrollen. Standard: an |
| `interactions` | bool | `true` | Selektion & Kontextmenü aktiv: Klick setzt die Seiten-Selektion (Kreuzfilterung, Drillthrough), Rechtsklick öffnet das native Menü. Standard: an |

### Objekt `titleBlock` — Titelblock

| Property | Typ | Default | Bedeutung (de-DE-Pane) |
| --- | --- | --- | --- |
| `show` | bool | `true` | Titelblock anzeigen: IBCS-Titel: Berichtseinheit · Kennzahl + Einheit · Zeitraum + Szenarien. Standard: an |
| `unitLine` | text | `—` | Zeile 1 · Berichtseinheit: Wer berichtet — Unternehmen, Segment, Konsolidierungskreis |
| `measureLine` | text | `—` | Zeile 2 · Kennzahl + Einheit: Leer = „GuV (P&L) in <Einheit>“ aus den Daten |
| `periodLine` | text | `—` | Zeile 3 · Zeitraum + Szenarien: Leer = Zeitraum und Szenarien aus den Daten |
| `message` | text | `—` | Message-Zeile (Interpretation): Die Erkenntnis in einem Satz, fett über dem Titel (IBCS SAY) |
| `autoMessage` | bool | `false` | Automatische Botschaft: Erzeugt die Botschafts-Zeile aus der Abweichung der Ergebniszeile und dem stärksten / schwächsten Treiber, wenn keine eigene Botschaft eingegeben ist. Standard: aus |
| `headline` | bool | `false` | Headline-Slot (große Botschaft): Zeigt die Botschaft als große Headline neben dem Titel (Layout der IBCS-12er-Serie); ohne eigene Botschaft die generierte Auto-Botschaft. Standard: aus |
| `footer` | text | `—` | Fußzeile (Datenstand · Quelle): Fußzeile unter dem Statement — z. B. Datenstand und Quelle; wird auch im Export gedruckt |
| `filterFooter` | bool | `false` | Filter-Fußzeile anzeigen: Zweite Fußzeile mit dem Filterkontext: die gebundene „Filter-Info“-Text-Measure (Report-Filter sind für Custom Visuals nicht sichtbar) plus der eigene Zustand des Visuals — ausgeblendete Nullzeilen, Szenario-Sicht des Lesers. Standard: aus |

### Objekt `hierarchy` — Hierarchie

| Property | Typ | Default | Bedeutung (de-DE-Pane) |
| --- | --- | --- | --- |
| `defaultLevel` | numeric | `2` | Standard-Aufklapp-Ebene: Wie tief das Statement aufklappt. 0 = alles aufklappen. Standard: 2 |
| `indent` | numeric | `16` | Einrückung je Ebene (px): Einrückung der Zeilenbeschriftung je Hierarchie-Ebene. Standard: 16 |

### Objekt `emptyState` — Leer-Zustand

| Property | Typ | Default | Bedeutung (de-DE-Pane) |
| --- | --- | --- | --- |
| `mode` | enum `hub` · `demo` · `fields` · `message` | `hub` | Solange Felder fehlen (Bearbeitungsmodus): Start-Hub = große Knöpfe für Feature-Tour, Template-Galerie, Demo und Feld-Intro · Demo = Beispiel-GuV (Smart Start) · Feld-Intro = welches Feld wohin, minimal und im Ausbau · Eigene Nachricht = Titel und Text darunter. Leser sehen immer den Standardtext oder die eigene Nachricht. Standard: Start-Hub |
| `title` | text | `—` | Eigener Titel: Ersetzt die Überschrift, wenn nichts dargestellt wird (im Lesemodus keine Felder gebunden oder Auswahl ohne Zeilen). Leer = Standardtext |
| `body` | text | `—` | Eigener Text: Textkörper unter dem Titel im Leer-Zustand — z. B. ein Hinweis, welche Filter der Leser prüfen soll. Leer = Standardtext |
<!-- hidden: columns.templateApplied -->
<!-- hidden: state.uiState -->

### Versteckte / persistierte Properties

| Property | Typ | Inhalt |
| --- | --- | --- |
| `columns.templateApplied` | text | zuletzt angewendetes Template (Echo-Guard). **Beim Vorkonfigurieren = `template` setzen**, sonst wendet das Visual das Template beim ersten Rendern an und überschreibt die Schalter |
| `state.uiState` | text (JSON) | Leser-Zustand der Toolbar, bookmark-fähig (Schema unten) |

`state.uiState` (alle Felder optional, Unbekanntes wird ignoriert):

```json
{
  "view": "table",            // table | bars | waterfall | tree
  "preset": "full",           // full | acref | dall | acpydpy | acpldpl | dpct | custom
  "ref": "pl",                // Δ-Referenz der klassischen Ansichten: py | pl | fc
  "unit": "auto",             // auto | none | k | m | b
  "density": "normal",        // normal | compact
  "pctRev": true, "hideZero": false, "fit": false,
  "collapsed": ["OPEX"],      // zugeklappte Zeilen-IDs (Tabelle)
  "spark": [],                // Zeilen-IDs mit offener Sparkline
  "blocks": { "mtd": false, "ytd": true, "fy": false },
  "treeRoot": "", "treeCollapsed": null, "treeCard": "months", "treeStatus": true,
  "treeZoom": null, "treeV": 2,
  "megaMin": "",              // Leser-Szenario des Mega-Tables: "" | ac | fc
  "megaRef": "",              // "" | py | pl | both
  "vals": { "ac": true, "py": true, "pl": true, "fc": false, "d": true },
                              // 1.2: Wertspalten der Eigenen Auswahl (gilt nur bei preset = custom)
  "megaVals": null            // 1.2: Leser-Wertspalten des Mega-Tables { "min", "py", "pl" } | null = Pane
}
```

(Kommentare nur zur Erklärung — im PBIR steht reines JSON als String-Literal.)
Pane-Vorgaben gewinnen, sobald sie sich **ändern** (nur die geänderte); sonst
bleibt die Leser-Entscheidung aus `uiState`.

## PBIR-Beispiel (12G-GuV mit Headline, Hausbegriffen, Skalen-Sync)

```json
{
  "visual": {
    "visualType": "pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358",
    "query": { "queryState": {
      "levels":         { "projections": [ { "field": { "Column": { "Expression": { "SourceRef": { "Entity": "Konten" } }, "Property": "L1" } }, "queryRef": "Konten.L1" },
                                           { "field": { "Column": { "Expression": { "SourceRef": { "Entity": "Konten" } }, "Property": "L2" } }, "queryRef": "Konten.L2" } ] },
      "rowType":        { "projections": [ { "field": { "Column": { "Expression": { "SourceRef": { "Entity": "Konten" } }, "Property": "RowType" } }, "queryRef": "Konten.RowType" } ] },
      "formulaDef":     { "projections": [ { "field": { "Column": { "Expression": { "SourceRef": { "Entity": "Konten" } }, "Property": "FormulaDef" } }, "queryRef": "Konten.FormulaDef" } ] },
      "signConvention": { "projections": [ { "field": { "Column": { "Expression": { "SourceRef": { "Entity": "Konten" } }, "Property": "Sign" } }, "queryRef": "Konten.Sign" } ] },
      "displayInvert":  { "projections": [ { "field": { "Column": { "Expression": { "SourceRef": { "Entity": "Konten" } }, "Property": "DisplayInvert" } }, "queryRef": "Konten.DisplayInvert" } ] },
      "period":         { "projections": [ { "field": { "Column": { "Expression": { "SourceRef": { "Entity": "Datum" } }, "Property": "Monat" } }, "queryRef": "Datum.Monat" } ] },
      "ac":   { "projections": [ { "field": { "Measure": { "Expression": { "SourceRef": { "Entity": "Kennzahlen" } }, "Property": "AC" } }, "queryRef": "Kennzahlen.AC" } ] },
      "py":   { "projections": [ { "field": { "Measure": { "Expression": { "SourceRef": { "Entity": "Kennzahlen" } }, "Property": "PY" } }, "queryRef": "Kennzahlen.PY" } ] },
      "fcFy": { "projections": [ { "field": { "Measure": { "Expression": { "SourceRef": { "Entity": "Kennzahlen" } }, "Property": "AC&FC FY" } }, "queryRef": "Kennzahlen.AC&FC FY" } ] }
    } },
    "objects": {
      "columns":    [ { "properties": {
        "template":        { "expr": { "Literal": { "Value": "'12G'" } } },
        "templateApplied": { "expr": { "Literal": { "Value": "'12G'" } } },
        "showPY":          { "expr": { "Literal": { "Value": "true" } } },
        "showMinuend":     { "expr": { "Literal": { "Value": "true" } } },
        "valueCascade":    { "expr": { "Literal": { "Value": "true" } } },
        "dPyBar":          { "expr": { "Literal": { "Value": "true" } } },
        "dPyPin":          { "expr": { "Literal": { "Value": "true" } } },
        "blockKind":       { "expr": { "Literal": { "Value": "'fy'" } } } } } ],
      "numbers":    [ { "properties": {
        "decimals":    { "expr": { "Literal": { "Value": "0D" } } },
        "pctDecimals": { "expr": { "Literal": { "Value": "0D" } } },
        "fixedMax":    { "expr": { "Literal": { "Value": "'2m'" } } },
        "fixedVarMax": { "expr": { "Literal": { "Value": "'500k'" } } } } } ],
      "titleBlock": [ { "properties": {
        "unitLine":  { "expr": { "Literal": { "Value": "'Software and Service Group'" } } },
        "headline":  { "expr": { "Literal": { "Value": "true" } } } } } ],
      "labels":     [ { "properties": { "labelAc": { "expr": { "Literal": { "Value": "'Ist'" } } } } } ],
      "style":      [ { "properties": { "variancePreset": { "expr": { "Literal": { "Value": "'blueOrange'" } } } } } ]
    }
  }
}
```

Mit `template` **und** `templateApplied` = `12G` rendert das Visual genau die
geschriebenen Schalter und persistiert nichts. Ohne `templateApplied` setzt es
beim ersten Rendern alle Schalter des Presets (eigene Schalter-Werte im PBIR
werden dann überschrieben).

## Bekannte Fallen

1. **Echo-Guard (Template-Persistenz):** Ein Template schreibt in EINEM
   `persistProperties`-Merge (`columns` + `numbers` [+ `titleBlock.headline`]).
   Bis das Echo des Hosts zurückkommt, halten veraltete Updates die geschriebenen
   Werte (TTL 5 Updates), danach gewinnt wieder der Pane. Ein Session-Guard
   verhindert Re-Apply-Schleifen, wenn das Echo verloren geht. Agenten, die PBIR
   schreiben: `templateApplied` mitschreiben (siehe oben). Der Toolbar-Zustand
   (`state.uiState`) hat einen eigenen Echo-Guard (TTL 5); ein fremder Zustand
   (Lesezeichen) wirkt sofort.
2. **Perioden:** „Monat" = letzter Monat **mit AC-Daten** (nicht der letzte der
   Achse); YTD = periodengleiches Fenster bis dorthin (PY/PL werden auf dasselbe
   Fenster gekürzt). Ohne `period`-Rolle gibt es nur einen Block, `secondBlock`
   und `blockKind = month` fallen still auf YTD zurück. FY braucht `fcFy`
   (sonst Rückfall auf YTD); PY im FY-Block = Summe aller PY-Perioden.
3. **Mega vs. klassisch:** Der Mega-Table gilt nur in der Tabellen-Ansicht
   (`megaInView`). In Balken/Waterfall/Baum zeigen dieselben Daten die
   klassischen Spalten — ein gesetztes Template ändert dort nichts. Im
   Mega-Modus blendet die Toolbar Spalten-Preset, Δ-Referenz, Perioden und Fit
   aus (die Spalten kommen aus dem Pane); Leser schalten Szenario/Referenz nur
   mit `toolbar.showScenario`, die Wertspalten (1.2) mit `toolbar.showValues`.
4. **Minuend PL (12H):** `minuend = pl` braucht die PL-Rolle (sonst AC). Ein ΔPL
   gegen sich selbst existiert nicht — ΔPL-Schalter wirken dann nicht, `showPL`
   und `showMinuend` ergeben EINE PL-Spalte.
5. **Skalen im Mega-Table (1.5, IBCS 2.0 / ISO 24896):** eine Skala je Einheit
   über alle Perioden-Blöcke (Δ-Balken, Δ-Wasserfälle und Wert-Kaskaden teilen
   sie, Pins haben eine zweite). Ein Block oder eine Spalte, die dabei unter
   die Mindest-Datenfläche fiele, zeichnet mit rundem Faktor vergrößert; der
   Kopf trägt ihn („ΔPL ×5"), ein Skalenhinweis über der Tabelle nennt ihn.
   Pixel je Betrag sind also zwischen Monat und YTD gleich, außer der Kopf
   sagt etwas anderes. Gekappte Ausreißer laufen in eine Ausreißerzone
   (Bruchzeichen, Dreieck, Zahl außen); die Kappungsgrenze gilt tabellenweit.
   Templates schreiben `numbers.pctDecimals = 1`. Dieselbe Regel gilt in Balken-
   und Wasserfall-Ansicht (Δ-Balken in der Skala der Wertbalken, sonst „ΔPL ×5")
   und im Baum (eine Kartenskala je Einheit, kleine Karten „×n"); Hover-Lupe und
   Kachel-Hauptchart sind als eigene Skala gekennzeichnet.
6. **Skalen-Sync** (`fixedMax`/`fixedVarMax`): Text in **Dateneinheiten** (vor
   k/m/b-Skalierung), Suffixe k/m/b, Komma oder Punkt. Es ist ein
   **Mindest**-Maximum wie im ChartKitchen: größere Daten erweitern die Skala
   weiterhin. Gleiche Pixel je Betrag gibt es nur bei gleich breiten Spalten —
   Visuals gleicher Größe und gleicher Schalter. Im Bearbeitungsmodus steht
   „Skala fixiert" unter der Tabelle (Leser/Export sehen es nicht).
7. **`variancePreset = auto`** folgt dem älteren `colorMode` (teal/ibcs); jeder
   andere Wert übersteuert ihn (der colorMode-Schalter verschwindet dann aus dem
   Pane). `goodColor`/`badColor` übersteuern beides. Hochkontrast ignoriert alles
   (Muster statt Farbe).
8. **const enums der API:** `powerbi.VisualDataChangeOperationKind`,
   `ViewMode` u. a. sind in der d.ts als `const enum` deklariert — zur Laufzeit
   gibt es kein Objekt. Im Code als Zahl spiegeln (`OP_APPEND = 1`), nie
   `powerbi.X.Y` zur Laufzeit lesen (esbuild-Harness bricht sonst).
9. **Export/Abo** (`allowInteractions = false`): keine Toolbar, alle Zeilen
   aufgeklappt (`columns.exportExpandAll`), keine Virtualisierung, kein
   „Skala fixiert". Bildschirm und PDF dürfen sich absichtlich unterscheiden.
10. **Formelzeilen** verweisen per Zeilen**name** — doppelte Namen machen die
   Referenz mehrdeutig (Fehler an der Zeile). Σ-treue Rundung lässt Formel- und
   Margenzeilen aus.
11. **Template-Auswahl in der Toolbar (1.2)** ist ein Autoren-Werkzeug: Sie
    erscheint nur, wenn der Host `viewMode` ≥ 1 meldet (Desktop-Bearbeitung,
    Service-Bearbeiten), und schreibt `columns.template` + `templateApplied` +
    alle Schalter in einem Merge, also genau das, was ein PBIR-Agent auch
    schreiben soll. Dieselbe Bedingung gilt für die Umschalter im Leerzustand
    (`emptyState.mode`). Ohne gemeldeten View-Mode (Test-Harness) gibt es beides
    nicht.
12. **Wertspalten-Schalter (1.2):** Ein Klick in der Gruppe „Wertspalten"
    schreibt `preset = custom` + `vals` in `state.uiState`. Ein geändertes
    `columns.preset` oder `colAc…colDelta` im Pane gewinnt wie jede
    Pane-Vorgabe. Ein PBIR-Agent setzt für eine feste freie Kombination
    `preset = 'custom'` plus die `col*`-Schalter.
13. **Spalten-Kategorie (1.2)** wirkt nur in der klassischen Tabellen-Ansicht.
    Die Kategorie-Blöcke rechnen ohne Σ-treue Rundung und ohne „% vom Umsatz"
    (beides bleibt im Gesamt-Block). Nicht-additive Measures (Durchschnitte,
    distinct counts) ergeben im Gesamt-Block die Summe der Kategorien, nicht
    den Modellwert. Die gleiche Regel gilt schon für die Periode.
14. **Start-Hub (1.3):** Ohne Felder zeigt der Bearbeitungsmodus (`viewMode` ≥ 1 oder
    kein gemeldeter View-Mode, Bühne ≥ 300 × 220 px, `allowInteractions` nicht
    false) den Hub: Tour (7 Karten mit Mini-Renderings), Template-Galerie
    (18 Kacheln), Demo, Feld-Intro (1.4: dazu „🚀 Loslegen" und die untere Leiste). Leser, Export und kleine Visuals bekommen wie
    bisher den Landing-Text. Mit gebundenen Daten öffnet der Toolbar-Knopf
    „☰ Start" (nur `viewMode` ≥ 1) den Hub als Overlay; Schließen stellt die
    Ansicht unverändert her. Ein Galerie-Klick schreibt in **einem** Merge
    `columns` (`template`, `templateApplied`, alle Schalter) + `numbers` (+
    `titleBlock.headline`) und, wenn die Ansicht nicht Tabelle war,
    `state.uiState.view = table`. **PBIR-Agenten:** Wer einen Bericht ohne Hub
    ausliefern will, setzt `emptyState.mode` = `demo` / `fields` / `message`;
    ein vorkonfiguriertes Template braucht wie bisher `templateApplied`. Die
    Minis sind verschachtelte Visual-Instanzen über der Demo (`renderMini`),
    ohne Persist, Selektion und Tooltips. Der Hub zeichnet sie nach dem ersten
    Paint in Päckchen.
15. **Template erneut anwenden (1.3):** Ein natives Dropdown feuert für den
    bereits gewählten Eintrag kein `change`. Wiederanwenden geht über einen Klick
    auf die aktive Galerie-Kachel oder über „↺ Zum Template zurück" (nur
    sichtbar, wenn Template-Schalter abweichen). Beide schreiben unbedingt
    (`applyMegaTemplate(tpl, true)`, Echo-Guard wie beim Dropdown); ein
    PBIR-Agent muss dafür nichts tun, `template` + `templateApplied` reichen.
16. **Hub-Polish (1.4):** Die Galerie ordnet die 18 Kacheln in vier
    Zweck-Gruppen (`HUB_GALLERY` in `src/hub.ts`: Struktur-Vergleich · Forecast ·
    GuV-Statement · Report-Ansichten; die klassische Tabelle steht zuletzt) —
    die Enum-Reihenfolge von `columns.template` bleibt Pane-Reihenfolge. Die
    untere Leiste jeder Hub-Seite schreibt `style.fontPreset` (`hd` · `fullhd` ·
    `uhd`) per `persistProperties` mit Echo-Guard (TTL 5) — dieselbe Property wie
    der Formatbereich; ein PBIR-Agent setzt sie wie bisher direkt. „📖 Doku
    öffnen" erscheint nur bei `viewMode` ≥ 1 und ruft `host.launchUrl`
    (`pnl-doku.html` für `de-*`, sonst `pnl-doku_en.html`). Das Feld-Intro des
    Hubs listet alle Rollen aus `FIELD_GROUPS` (Test: = capabilities.json);
    der Modus `emptyState.mode = fields` zeigt weiter das knappe 1.2-Intro.
    „🚀 Loslegen" ist lokaler Zustand: die Häkchen lesen gebundene Rollen,
    `labels.*`, `columns.thresholds`/`materiality*` und `numbers.*Decimals`.
17. **Baum unantastbar:** Der Werttreiberbaum hat eigenen Klapp-Zustand
    (`treeCollapsed`) und SVG-Titel statt Tooltips; Mega-/Finance-Schalter wirken
    dort nicht.

## Verwandte Dateien

- `capabilities.json` — Rollen/Objekte (Quelle der Tabellen oben)
- `src/settings.ts` — Pane-Modell, Gates (`applyPaneGates`), Enum-Listen
- `src/megatable.ts` — Layout/Painter/Notation/Presets des Mega-Tables (ohne Power-BI-Import, unit-testbar)
- `SPEC-MEGATABLE.md` — Maße, Notation, Abweichungen von den Referenzblättern
- `CHANGELOG.md` · `README.md` · `QUICKSTART.md`
- `../.claude/skills/pnl-report/` — Claude-Skill: GuV-Seite in ein PBIP bauen
- `src/hub.ts` — Start-Hub, reiner Teil (Template-Schalter, Tour-Karten, Mini-Objekte; 1.4: Galerie-Gruppen, Feld-Rollen, Loslegen-Schritte, Schrift-Presets, Doku-URL)
- `test/test.html` — Render-Fälle p1–p27 · m1–m31 als lebende Beispiele
