> **Stand 02.10.2026 (Beta), nur Statusnotiz, Tabellen nicht neu geprüft:** Nach dem ersten echten Desktop-Durchlauf (Testkopie, Deploys 1 bis 10) sind zusätzlich umgesetzt: Chrome-Schrift px × k × 0,75, KPI als `ibcsKpiCard`, Waterfall ohne `rowType`, `bridge` als senkrechter Wasserfall, Szenario-Zuordnung PY/PL nach Feldnamen, Texte in Formen mit Selektor `default`, heller Hintergrund außerhalb der Seite. Offen aus [REVIEW-LIVE-2026-10-02.md](REVIEW-LIVE-2026-10-02.md), Abschnitt D: der ChartKitchen-Hinweistext („größter Treiber …") überdeckt die Δ%-Spalte (P1); Bildvergleich als „Aufbau" beschriften und Befunde in Layout und „vermutlich Daten" trennen (P2); Teilziele „nur Layout / Theme / Modell" (P2, im Vertrag als `scope`). Nach dem Praxistest vom 02.10.2026 ([FINDINGS-DEMO-2026-10-02.md](FINDINGS-DEMO-2026-10-02.md)) im Konverter: KPI-Karte wählt Preset und Titelgröße aus der Kachelgröße, ohne Mini-Brücke und zweite Bezugszeile, Sparkline nur mit `trend` (B3, in Desktop zu prüfen); `design.sourceReport` lässt Seitenhintergrund und Kachelstil eingelesener Seiten und Kacheln unberührt, wenn ein Agent den Konverter ohne Live-Helfer nutzt (B2); im Live-Betrieb entscheidet der Runner über den Vergleich von `design` mit der Grundlinie, das Flag setzt dort niemand. Wo die Zeilen unten älter sind, gilt diese Notiz.

> **Stand 01.10.2026 nach Paket A bis C:** Die Lücken 1, 3 bis 8, 10, 15 und 20 sind geschlossen (Kitchen-Visuals werden installiert, ChartKitchen ohne Referenz-Instanz mit vollen Einstellungen, KPI-Karte, Theme, Chrome-Texte, Filter-Panel, Umlaute). Eine Referenz-Instanz ist nicht mehr nötig. Offen bleibt der Rest; echte Prüfung in Desktop folgt mit Paket E.

> Stand 01.10.2026 · Arbeitspaket 0a aus [PLAN-V2.md](PLAN-V2.md) · reine Bestandsaufnahme, nichts geändert.

# Abgleich Kitchen → Power BI (FIDELITY)

Was das Kitchen zeigt, wohin es in Power BI gehört und wie weit es heute ankommt.

## Lesehilfe

**Kürzel für Fundstellen**

| Kürzel | Datei |
|---|---|
| C | `assets/mockup/catalog.js` |
| A | `assets/mockup/app.js` |
| E | `assets/mockup/export.js` |
| SK | `assets/mockup/sketches.js` |
| H | `mockup-kitchen.html` (CSS) |
| P | `.claude/skills/mockup-to-powerbi/scripts/mockup_to_pbir.py` |
| MS | `.claude/skills/mockup-to-powerbi/scripts/mockup_spec.py` |
| R | `mockup-live/agent/live_runner.py` |

**Status**

| Status | Bedeutung |
|---|---|
| done | kommt beim Deploy an |
| partial | kommt an, aber anders als im Kitchen, unvollständig oder nur auf einem Pfad |
| todo-only | steht nur als To-do in `agent-status.json`, `analysis-todos.md`, `model-todos.md` oder `navigation.md` |
| missing | wird weder gebaut noch gemeldet |
| n/a | hat im Kitchen-Bild keine Wirkung |

**ChartKitchen = CK** (`chartKitchenByDatenWG…` 1.43). Die Eigenschaftsnamen stammen aus `capabilities.objects` der `.pbiviz`, die Vorgaben aus `ibcsInspiredChartDeck/src/settings.ts`.

### Vorbemerkungen

1. **Zwei Wege für jede CK-Kachel.** Der Runner repliziert CK nur, wenn im Bericht schon eine CK-Instanz steht (R:1166-1179). Fehlt sie, baut er mit `--ck-fallback` (Vorgabe) das native Gegenstück aus `C` (`native.map`) oder einen grauen Platzhalter (R:1080-1082, R:88-90). Beim Test am 29.09. lief CK nur, weil eine Instanz von Hand gesetzt war.
2. **Was die Skizze überhaupt zeigt.** Die Skizzen zeichnen Beispiel- oder Zufallsdaten (SK:334, `samples`). Sie gehen bewusst nicht in den Bericht (spec-format.md, 0.4.7). Ein Bildvergleich (0b) kann deshalb nur Aufbau, Farben, Ebenen und Schrift vergleichen, nicht die Zahlen.
3. **Beschriftungen nur ab einer Größe.** Die Skizzen beschriften erst ab etwa 170 × 90 px Entwurfsfläche (SK:538). Darunter fehlen Beschriftungen, Δ-Werte und Σ auch im Kitchen.
4. **Eingriffe am Bericht.** Theme, Seitenumbenennung und `report.json` meidet der Runner während der Bridge-Preview (R:28-35, R:73). Probe vom 01.10. mit `pbir 0.9.32` an einer Kopie des Testbeds:
   - `pbir theme set-colors` bricht ab, solange der Bericht nur ein Base-Theme hat („No custom theme found in report.json").
   - `pbir theme apply-template` (ebenso `theme build -o`) registriert ein Custom Theme. Dabei werden `report.json` und `StaticResources/RegisteredResources/<Theme>.json` geschrieben.
   - Danach schreiben `set-colors` und `set-fonts` **nur** die Theme-Datei in `RegisteredResources`, `report.json` bleibt unberührt.
   - Das Registrieren ist also ein einmaliger Schritt bei geschlossenem Desktop, wie Paket A.

---

## 1 Kacheln

### 1.1 Zielbild je Kachel-Typ (alle 51 Typen aus C:88-152)

Die Vorgabe-Engine stammt aus `K()` (C:76) und dem Abgleich mit `CK_MODE` (C:155-171). Das Rollen-Mapping steht für CK in MS:41-56 und P:1743-1804, für nativ in C (`native.map`) und E:184-188, für Custom Visuals in E:189-200.

Kurzbegriffe in den Tabellen:

- **Rollen Standard:** `category`→`category`, `ac`→`actual`, `ref`→`plan` bzw. `previousYear` (Zuordnung nach Feldname, sonst nach Szenario), `fc`→`fcFlag`.
- **nativ Standard:** `category`→`Category`, `ac`/`ref`→`Y`.

**Vergleich (Struktur)**

| Typ | Engine | Ziel heute: CK · ohne CK | Rollen | Skizze zeigt (SK) | Abweichung / Empfehlung | Status |
|---|---|---|---|---|---|---|
| `columns` | ck | CK `columns` · `clusteredColumnChart` | Standard | AC-Säulen, Referenz versetzt (PY grau, PL Umriss), eine Δ-Ebene (abs vor rel), Werte, Σ-Badge, ▶ für das dritte Szenario (1090-1121) | CK: Basis, Varianz-Schalter, Schrift und Farben fehlen (1.2a). Nativ: zwei Serien im Standardblau, Legende, keine Δ-Ebene | partial |
| `kombi` | ck | CK `columns` · `clusteredColumnChart` | Standard | Δ%-Pins, Δabs-Säulen, Säulen, Σ (1156-1203) | CK passt bei Vorgaben. Nativ ohne Δ | partial |
| `colline` | ck | CK `columns` · `lineClusteredColumnComboChart` (`ref`→`Y2`) | `ref` landet in `plan`/`previousYear` statt `lineMeasure` (Warnung P:1816-1819) | Säulen + Linie einer zweiten Kennzahl (1124-1153) | Mapping auf `lineMeasure` umstellen | partial |
| `absvar` | ck | CK `columns` · `clusteredColumnChart` nur `ac` (`ref` fällt weg, C:93) | Standard | **nur** Δabs-Säulen (1206-1224) | CK zeigt zusätzlich AC; nativ zeigt AC statt Δ (Δ-Kennzahl nötig) | partial |
| `relvar` | ck | wie `absvar` | Standard | **nur** Δ%-Pins (1227-1244) | wie `absvar`; CK `showAbsoluteVariance=false` | partial |
| `bars` | ck | CK `bars` · `clusteredBarChart` | Standard | Balken absteigend, Referenz versetzt, ▼, Δ als farbige Textspalte (rel vor abs) (1868-1893) | wie `columns` | partial |
| `barskombi` | ck | CK `bars` · `clusteredBarChart` | Standard | Balken + Δabs-Balken + Δ%-Pins (2052-2084) | wie `columns` | partial |
| `bullet` | ck | CK `bars` · `clusteredBarChart` | Standard | qualitative Bänder, dünner AC-Balken, Zielstrich (1896-1937) | weder CK `bars` noch nativ zeichnen Bänder oder Zielstrich | partial |
| `tornado` | ck | CK `bars` · `clusteredBarChart` | Standard | Schmetterling: Referenz links, AC rechts (2015-2049) | kein Schmetterling in CK oder nativ | partial |
| `dotplot` | ck | CK `dumbbell` · `clusteredBarChart` | Standard | Referenzpunkt hohl, AC gefüllt in Δ-Farbe (1978-2012) | CK passt, nativ nicht | partial |
| `pareto` | ck | CK `pareto` · `lineClusteredColumnComboChart` nur `ac` | Standard | Säulen absteigend, kumulierte %-Linie, 80-%-Linie (1940-1975) | CK passt; nativ ohne kumulierte Linie (Kennzahl nötig) | partial |
| `stackcol` | ck | CK `columns` + `series` · `columnChart` | `series`→`series` | drei graue Segmente, Summen (1464-1516) | gestapelte Darstellung in CK ungeprüft | partial |
| `stackbar` | ck | CK `bars` + `series` · `barChart` | wie `stackcol` | wie `stackcol`, waagrecht (2367-2405) | wie `stackcol` | partial |
| `marimekko` | deneb | Platzhalter (`deneb-slots.json`) | n/a | Säulen variabler Breite (2894-2927) | keine Vega-Spec im Export | missing |

**Zeit & Verlauf**

| Typ | Engine | Ziel heute: CK · ohne CK | Rollen | Skizze zeigt (SK) | Abweichung / Empfehlung | Status |
|---|---|---|---|---|---|---|
| `line` | ck | CK `line` · `lineChart` | Standard | AC-Linie, PY grau bzw. PL gestrichelt, FC gestrichelt, Δ-Band (1247-1320) | wie `columns` | partial |
| `varint` | ck | CK `intwaterfall` · Platzhalter (`native: null`) | Standard | integrierte Brücke, Δ%-Pins, Σ (1644-1811) | Alternative: `ibcsIntegratedWaterfall` (Rollen `category`, `ac`, `py`, `forecast`) | partial |
| `slope` | ck | CK `slope` · `lineChart` | Standard | zwei Zeitpunkte, Linie in Δ-Farbe (1323-1371) | nativ ohne Δ-Farbe | partial |
| `fan` | ck | CK `line` · `lineChart` | Standard | Korridor P10/P90 (1374-1425) | Korridor weder in CK noch nativ | partial |
| `zchart` | ck | CK `line` · `lineChart` nur `ac` | Standard | Monatssäulen + YTD- + MAT-Linie (1428-1461) | CK `cumulative` deckt YTD ab, MAT fehlt | partial |
| `multiples` | ck | CK `columns`, `series`→`multiples` (P:1773) · `clusteredColumnChart` `series`→`Rows` | Standard + Facette | Raster mit gemeinsamer Skala, Δ-Badge je Feld (2408-2470) | passt grundsätzlich | partial |
| `area` | native | `areaChart` | `series`→`Series` | Fläche in `nativePalette` (3368-3396) | Datenfarben fehlen (Theme) | partial |

**Wasserfall & Brücke**

| Typ | Engine | Ziel heute: CK · ohne CK | Rollen | Skizze zeigt (SK) | Abweichung / Empfehlung | Status |
|---|---|---|---|---|---|---|
| `waterfall` | ck | CK `waterfall` · `waterfallChart` | `category`, `ac` | schwebende Δ-Säulen, Σ-Säule (1565-1593) | CK `waterfall` braucht `rowType`, die der Typ nicht kennt (P:1812-1815): die Brücke bleibt leer. Ziel ändern (offene Frage 3) | missing |
| `wfint` | ck | CK `intwaterfall` · Platzhalter | Standard | waagrechte Brücke + Δ% (2264-2364) | Alternative: `ibcsIntegratedWaterfall` | partial |
| `wfkombi` | ck | CK `waterfall` (ohne `rowType` leer) · Platzhalter | Standard | Wasserfall + Δ-Ebene (2208-2257) | wie `waterfall` | missing |
| `bridge` | ck | CK `catbridge` · `waterfallChart` nur `ac` | Standard | PY → Δ je Kategorie → AC, Pill (1596-1635) | CK passt; nativ zeigt die falsche Aussage. Alternative: `ibcsCategoryWaterfall` 2.2 (`category`, `ac`, `py`, `pl`) | partial |
| `tree` | native | `decompositionTreeVisual` (`ref` fällt weg) | `ac`→`Analyze`, `category`→`ExplainBy` | Karten mit Δ-Streifen (2930-2966) | kein Δ | partial |
| `heatmap` | ck | CK `table` mit `colgroup` · `pivotTable` (`ref` fällt weg) | `subcategory`→`colgroup` | Zellen in Δ-Farbe (2866-2891) | Zellfarben weder in CK `table` (ungeprüft) noch nativ (CF fehlt) | partial |
| `scatter` | native | `scatterChart` | `x`/`y`/`size` | graue Punkte, jeder fünfte AC (3083-3104) | Standardfarben | partial |
| `boxplot` | deneb | Platzhalter | n/a | Boxen (2969-3007) | keine Vega-Spec | missing |
| `gantt` | custom | `dataKitchenGantt` (visual.json, P:751-768) | `category`→`task`, `start`, `end`, `series`→`phase` | Balken, Heute-Linie (3107-3130) | `objects` leer (P:764); `.pbiviz` muss installiert sein | partial |

**Tabellen & KPI**

| Typ | Engine | Ziel heute: CK · ohne CK | Rollen | Skizze zeigt (SK) | Abweichung / Empfehlung | Status |
|---|---|---|---|---|---|---|
| `kpi` | ck | CK `cards` · `card` nur `indicator` | `indicator`→`actual`, `goal`→`plan`, `category` (Zeitreihe, C:126)→`category` | große Zahl + Einheit, Δ abs · % in Δ-Farbe, Sparkline, Farbstreifen (3013-3080) | CK `cards` zeichnet eine Karte **je Kategorie**, mit Monat also zwölf Karten. `card` verliert Δ und Sparkline. Ziel: `ibcsKpiCard` 2.3 (`category`(Zeit)→`trend`, `indicator`→`ac`, `goal`→`pl`/`py`) oder `cardVisual` + `pbir visuals card-reference` | missing |
| `card` | native | `card` | `indicator`→`Values` | Zahl + Einheit + Label (3399-3417) | passt | done |
| `multirow` | native | `multiRowCard` | `values`→`Values` | drei Zeilen mit Akzentbalken (3420-3448) | passt | done |
| `table` | ck | CK `table` · `tableEx` | `rows`→`category` | AC, Balken in der Zelle, Δ-Balken, Δ%-Pins, Σ Gesamt (2087-2205) | CK passt; nativ ohne Δ | partial |
| `pnl` | custom | `pnlByDatenWG` (`objects` leer) | `rows`→`levels`, `ref`→`py`/`pl`/`fc` nach Name (C:130) | GuV-Gerüst, Balken, Pins, Mini-Brücke (2594-2816) | Einstellungen siehe 1.2c | partial |
| `sparktable` | ck | CK `table`: die Zeitrolle (`R.time`, Schlüssel `category`) wird zweite `category`-Ebene · `tableEx` ohne `ref` und Zeit | `rows`+Zeit→`category` | Sparkline je Zeile (2473-2529) | keine Sparklines, egal auf welchem Weg | missing |
| `matrix` | native | `pivotTable` | `rows`/`columns`/`values` | Matrix mit Summen (3451-3520) | passt | done |
| `gauge` | native | `gauge` | `indicator`→`Y`, `goal`→`TargetValue` | Bogen in `pbi[0]` (3875-3914) | Datenfarbe (Theme) | partial |

**Native Klassiker**

| Typ | Engine | Ziel heute: CK · ohne CK | Rollen | Skizze zeigt (SK) | Abweichung / Empfehlung | Status |
|---|---|---|---|---|---|---|
| `ncolumn` | native | `clusteredColumnChart` | `values`→`Y`, `series`→`Series` | Legende, gepunktetes Gitter, Farben aus `nativePalette` (3285-3323) | Datenfarben fehlen (Theme) | partial |
| `nbar` | native | `clusteredBarChart` | wie `ncolumn` | wie `ncolumn` (3326-3365) | wie `ncolumn` | partial |
| `nline` | native | `lineChart` | wie `ncolumn` | wie `ncolumn` (3368-3396) | wie `ncolumn` | partial |
| `ndonut`, `pie`, `treemap` | native | `donutChart` · `pieChart` · `treemap` | `category`, `ac` | Segmente in `nativePalette` (3671-3821) | Datenfarben fehlen | partial |
| `decomp` | native | `decompositionTreeVisual` | `ac`→`Analyze` | Knoten in `pbi[0]` (3824-3872) | Datenfarbe | partial |
| `map` | native | `map` | `category`, `size` | Blasen in `pbi[0]` (3650) | Datenfarbe | partial |
| `deneb` | deneb | Platzhalter | `values` | „{ } Vega-Spec" (3917) | keine Spec | missing |

**Steuerung & Text**

| Typ | Engine | Ziel heute: CK · ohne CK | Rollen | Skizze zeigt (SK) | Abweichung / Empfehlung | Status |
|---|---|---|---|---|---|---|
| `slicer` | native | `slicer` | `field`→`Values` | Dropdown oder Liste (3523-3555) | passt | done |
| `text` | native | `shape` mit `text.text` (P:1356-1399) | n/a | umbrochener Text (3592-3619) | passt | done |
| `image` | native | `image` ohne Bildquelle | n/a | Platzhalter (3622) | Bild muss von Hand nachgezogen werden | partial |
| `button` | native | `actionButton` + `PageNavigation` (P:1392-1398) | n/a | Button in Akzentfarbe (3633) | passt | done |

Bilanz 1.1 (51 Typen):

- **done 6:** `card`, `multirow`, `matrix`, `slicer`, `text`, `button`.
- **missing 7:** `marimekko`, `waterfall`, `wfkombi`, `boxplot`, `kpi`, `sparktable`, `deneb`.
- **partial 38:** alle übrigen.

Fast jedes IBCS-Ziel ist partial, weil die Einstellungen aus 1.2a/1.2b fehlen, nicht wegen des gewählten Visuals.

### 1.2a Einstellungen → ChartKitchen

Die Kitchen-Werte stammen aus `analysisOf` (A:241-253), dem Kachel-Panel (A:919-945) und dem Kachel-Fenster (A:972-991). Exportiert werden sie in E:102-117. Der Runner schreibt in CK nur `chart.orientation`, `chart.invert`, `ibcsTitle.kpi`, `ibcsTitle.message` und den Container (R:142-166, R:1739-1767, R:1797-1875).

| Einstellung | Kitchen-Wirkung | CK-Ziel · Wert-Mapping | Status | Fundstelle heute |
|---|---|---|---|---|
| Kachel-Typ | Skizze | `chart.orientation` aus `CK_MODE` | partial (Ziel falsch bei `kpi`, `waterfall`, `wfkombi`, `sparktable`, siehe 1.1) | C:155-161, MS:65-79, R:142-152 |
| Rollen / Szenario | AC, PY, PL, BU, FC je nach Szenario | Projektionen `actual`/`plan`/`previousYear`/`forecast`/`fcFlag`/`series`/`multiples`/`colgroup`/`rowType`; Referenz nach Feldname, sonst Szenario | done | P:1743-1804, R:1675-1710 |
| `deltaBasis` | Δ-Ebenen gegen PL/PY/BU/FC (SK:445-475) | `chart.comparisonMode`: PL/BU→`plan`, PY→`py`, FC→? (offene Frage 1), auto→`auto` | todo-only (`DELTA_BASIS`, nur wenn ausdrücklich gesetzt) | P:1668-1673 |
| `deltaKind` abs/rel | Δabs- und Δ%-Ebene ein/aus (SK:516-517) | `chart.showAbsoluteVariance`, `chart.showRelativeVariance` | missing | n/a |
| `polarity` | Δ-Farbe gedreht (SK:332) | `chart.invert=true` bei `lower`, beim Zurücknehmen `false` | done | P:1861-1863, R:150-151, R:1841-1846 |
| `sort` | Skizze sortiert fest absteigend, die Einstellung zeichnet sie nicht | `chart.sortByImpact` (Brücken), `chart.cardSort`, `chart.tableSort`; für `columns`/`bars` keine Eigenschaft | todo-only | R:2058-2063 |
| `topN` | in der Skizze ohne Wirkung | `chart.topN` = min(N, 50), Rest wird zusammengefasst | todo-only | R:2058-2063 |
| `unit` | nur bei `kpi` hinter der Zahl, sonst unsichtbar (SK:3013-3080) | Text in `ibcsTitle.kpi` („Umsatz in T€") oder Container-Untertitel | missing (Untertitel nur nativ) | P:1651-1656 |
| `displayUnits` | Skizze kürzt automatisch (SK:308-320) | `labels.displayUnits`: none→`none`, K→`k`, M→`m`, auto→`auto` | todo-only (`DISPLAY_UNITS_SLOT`) | P:1642-1648 |
| `decimals` | Skizze: 0 Stellen (synthetisch) bzw. Stellen der Beispielwerte | `labels.decimals` (0–3; CK-Vorgabe 1, Kitchen „auto" zeigt 0) | todo-only | P:1642-1648 |
| `timeGrain` | keine | Achsenbindung | todo-only | P:1659-1660 |
| `cumulative` | keine (außer `zchart`) | `chart.cumulative=true`, `chart.cumulativeKind=ytd` | todo-only, und der Text ist falsch: verlangt eine YTD-Kennzahl im Modell, obwohl CK selbst kumuliert | P:1661-1662 |
| `scaleGroup` | keine | `scale.fixedMax` (Zahl je Gruppe nötig) | todo-only | P:1663-1664 |
| `smallMultiples` | Raster ohne gemeinsame Skala (SK:3958-4008) | Rolle `multiples` (wird gebunden), dazu `chart.multiplesSameScale` | partial: Bindung klappt, aber P:1533-1536 meldet fälschlich `SM_NOT_NATIVE` | MS:54, P:1528-1544 |
| `fieldParam` | keine | Parameterspalte in `category` | todo-only (`FIELDPARAM_SLOT`) | P:1547-1566 |
| `title` | Kachelkopf fett 600 (H:198) | `ibcsTitle.kpi`, Container-Titel ausgeblendet | partial: Text kommt an, CK ergänzt aber selbst Einheit, Zeitraum und Szenarien | R:155-166, R:1712-1725, R:1856-1872 |
| `sub` (Untertitel) | in derselben Zeile wie der Titel (A:687, H:197-199) | heute Container-`subTitle`, steht damit **über** dem IBCS-Titel | partial | P:723-725 |
| `message` | wird im Kitchen nicht gezeichnet | `ibcsTitle.message` | done (in Desktop zusätzlich sichtbar, offene Frage 4) | R:163-165, R:1847-1854 |
| Schrift (`design.typography`, Kachel-Faktor) | Titel, Untertitel und Beschriftung × Faktor × k (A:217-219, A:668) | `labels.fontPreset` (k≈1→`compact`, 1,5→`fullhd`, ≥2→`presentation`) bzw. `labels.fontScale` (50–300), `categoryAxis.fontSize` | missing: der Slot enthält `typography` (P:1846-1852), der Runner liest es nicht. CK-Vorgabe `compact` ist bei 1920 px zu klein | P:1846-1852 |
| Beschriftungen | Werte an Säulen/Balken (SK:990) | `labels.show` (Vorgabe an), `labels.labelDensity` | done (Vorgabe) | n/a |
| Σ / Summen | Σ-Badge ab 300 px (SK:803) | `chart.showTotal` (Vorgabe an) | done (Vorgabe) | n/a |
| Marker ▶/▼ drittes Szenario, FC schraffiert | SK:834-844, SK:627-660 | `chart.pyTriangle` (Vorgabe an); FC über `fcFlag`/`forecast` | done (Vorgabe/Rolle, mit Warnung bei fehlendem FC-Feld) | P:1826-1832 |
| Abweichungsfarben `variancePalette` | teal `#1E8F9E`/`#D64541`, ibcs `#3A9A5B`/`#C8412F` (SK:113-114) | `colors.goodColor`/`badColor` | partial: teal entspricht zufällig den CK-Vorgaben, `ibcs` fehlt | n/a |
| Dunkle Kachel / Ink | Skizze wechselt auf helle Töne (SK:161-205) | `colors.appearance=dark`, sonst `light` | missing | n/a |
| Elemente nur in Desktop | keine In-Chart-Buttons, kein Vorschlags-Chip | `chart.chartButtons=false` (Vorgabe an), `chart.smartStart=false` (Chip nur im Bearbeitungsmodus) | missing | n/a |
| Container (Fläche, Rahmen, Radius, Schatten) | Kachelstil | `visualContainerObjects` aus `slot.container` | done | P:718-748, R:1712-1725 |
| Position und Größe | Rechteck | `position` | done | R:1749-1751, R:1950-1956 |
| Verhalten `drillDown`, `crossFilter` | Kachel-Fenster (A:981-984) | siehe 1.2b | missing | n/a |
| CK ohne Referenz-Instanz | n/a | Visual installieren, Vorlage statt Referenz-Instanz (Paket A) | partial | R:1166-1179 |

### 1.2b Einstellungen → natives Visual (auch das CK-Ersatzvisual)

| Einstellung | Kitchen-Wirkung | Ziel (`pbir`) · Wert-Mapping | Status | Fundstelle heute |
|---|---|---|---|---|
| Typ und Rollen | Skizze | `--from-json` mit `native.buckets` | partial (`ref` bzw. `goal` fallen weg bei `absvar`, `relvar`, `bridge`, `waterfall`, `tree`, `heatmap`, `sparktable`, `kpi`) | E:95, E:184-188, P:601-660 |
| Szenario-Notation | AC `#404040`, PY `#B3B3B3`, PL weiß mit Umriss, FC schraffiert (SK:161-205) | `dataPoint.field(<Ref>).fill`, dazu `borderShow`/`borderColor` (Selektor-Syntax von `pbir set`) | missing | n/a |
| `deltaBasis`, `deltaKind` | Δ-Ebenen | nativ nicht abbildbar, nur über Δ-Kennzahlen (Modell) und ein eigenes Visual | missing | n/a |
| `polarity` | Δ-Farbe | bedingte Formatierung (`pbir visuals cf`) | todo-only (`POLARITY`) | P:1568-1575 |
| `sort` | n/a (Skizze sortiert fest) | `pbir visuals sort` nach Wert oder Kategorie | partial (Δ nur als To-do `SORT_DELTA`) | P:1577-1602 |
| `topN` | n/a | `pbir add filter … --type TopN` | partial (nur beim Anlegen, beim Update nicht wiederholt, R:2064-2068) | P:1604-1619 |
| `unit` | n/a (außer `kpi`) | Untertitel, wenn keiner gesetzt ist | done | P:1650-1656 |
| `displayUnits` | Kurzformen | `labels.labelDisplayUnits` 1/1000/1000000 | partial: gesetzt, aber `labels.show` bleibt aus, man sieht es also nicht | P:1621-1641 |
| `decimals` | Stellen | `labels.labelPrecision` | partial (wie `displayUnits`) | P:1621-1641 |
| Datenbeschriftungen | Werte an jedem Balken | `labels.show=true` | missing | n/a |
| Legende | IBCS-Skizzen: keine Legende, Szenario-Zeile; Klassiker: Kreis-Legende | `legend.show=false` (IBCS) bzw. `true` (Klassiker) | missing (Power BI blendet automatisch ein) | n/a |
| Achse / Gitter | IBCS: keine Wertachse, kein Gitter; Klassiker: gepunktetes Gitter | `valueAxis.show`, `valueAxis.gridlineShow`, `gridlineStyle=dotted` | missing | n/a |
| Σ / Summen | Σ-Badge, Σ-Zeile | `tableEx`/`pivotTable`: Summe (Vorgabe an); Diagramme: n/a | partial | n/a |
| Marker, FC-Schraffur | ▶/▼, Schraffur | nativ nicht vorhanden | missing | n/a |
| `timeGrain`, `cumulative` | keine | Bindung bzw. YTD-Kennzahl | todo-only | P:1659-1662 |
| `scaleGroup` | keine | `valueAxis.start`/`end` | todo-only | P:1663-1664 |
| `smallMultiples` | Raster | Bucket `Rows` | done | P:628-634 |
| `fieldParam` | keine | Parameterspalte + `te script` | todo-only (Tabelle muss zuerst existieren) | P:615-626, P:2208-2285 |
| `title` | Kachelkopf | Container-Titel über `--from-json` | done | P:636-637 |
| `sub` | in der Titelzeile | `subTitle.show/text` (steht in Power BI unter dem Titel) | partial | P:1675-1679 |
| `message` | nicht gezeichnet | n/a | todo-only (`MESSAGE`) | P:1665-1666 |
| Schrift Titel/Untertitel | px × Faktor × k | `title.fontSize`, `subTitle.fontSize` in pt (px × 0,75) | done | P:1445-1473, MS:234-253 |
| Schrift Diagramm | `chart` × Faktor × k | `labels.fontSize`, `categoryAxis.fontSize` bzw. Theme `textClasses.label` | todo-only (nur `theme-fragment.json`) | P:2866-2885 |
| `nativePalette` | Datenfarben neutral/pbi/kitchen (SK:117-133) | Theme `dataColors` (`pbir theme set-colors --data-colors`) | missing (das Fragment hat keine `dataColors`) | P:2895-2915 |
| Container | Kachelstil | `background`/`border`/`radius`/`dropShadow` | done | P:1476-1502 |
| Dunkle Kachel / Ink | Text hell | `title.fontColor`, `labels.color`, Achsenfarben bzw. Theme `foreground` | missing | n/a |
| `kpi` als Karte | Δ + Sparkline | `cardVisual` + `pbir visuals card-reference --actual --target` | missing | n/a |
| `drillDown` | Hierarchie aufklappbar | Drill-Modus der Kategorie-Hierarchie | missing | n/a |
| `crossFilter=false` | n/a | `pbir pages interactions` (Quelle → none) | missing | n/a |
| Notiz, Workshop-Status | Badges | `pbir add annotation` | done (nur beim Anlegen) | P:1681-1695 |
| Text- und Button-Inhalt | Text, Beschriftung | `shape`/`actionButton` `text.text` | done | P:1356-1399 |

### 1.2c Andere Kitchen-Visuals

Der Konverter schreibt für Custom Visuals `objects: {}` (P:764). Alle Einstellungen bleiben auf den Vorgaben des Visuals.

| Visual (Kitchen-Typ) | Einstellung | Ziel-Eigenschaft · Mapping | Status |
|---|---|---|---|
| `pnlByDatenWG` 0.17 (`pnl`) | Rollen | `levels`, `ac`, `py`/`pl`/`fc` nach Namen, `rowType` (E:189-200) | done |
| | `variancePalette` | `style.colorMode` teal/ibcs, `style.goodColor`/`badColor` | missing |
| | `deltaBasis` | `columns.reference` auto/py/pl/fc | missing |
| | `deltaKind` | `columns.preset`: beide→`full`, nur abs→`acpydpy`/`acpldpl` je Basis, nur rel→`dpct` | missing |
| | `displayUnits`, `decimals`, `unit` | `numbers.scaling` (none/k/m), `numbers.decimals`, `numbers.unitText` | todo-only (`DISPLAY_UNITS_SLOT`), `unit` missing |
| | `message`, `sub` | `titleBlock.message`, `titleBlock.unitLine` | missing |
| | Schrift | `style.fontPreset` hd/fullhd/uhd nach k, `style.fontZoom` | missing |
| | Kachel- und Seitenfarbe | `style.cardBackground`, `style.pageBackground` | missing |
| | Toolbar | Kitchen zeigt keine → `toolbar.show=false` | missing |
| | Container, Titel | `visualContainerObjects` | done |
| `dataKitchenGantt` 1.9 (`gantt`) | Rollen | `task`, `start`, `end`, `phase` | done |
| | dunkle Kachel | `darstellung.theme=dunkel` | missing |
| | Schrift | `schrift.fontSize` | missing |
| | IBCS-Optik | `darstellung.ibcs` | missing |
| `ibcsKpiCard` 2.3 (Vorschlag für `kpi`) | Rollen | `indicator`→`ac`, `goal`→`pl`/`py` nach Name, `category` (Zeit)→`trend` | missing |
| | Basis, Polarität | `display.comparisonMode` (auto/py/plan), `display.invert` | missing |
| | Einheiten, Stellen, Schrift, Farben | `labels.displayUnits`, `labels.decimals`, `labels.fontPreset`, `colors.goodColor`/`badColor`; `display.showSparkline`, wenn Zeit gebunden | missing |
| `ibcsCategoryWaterfall` 2.2 / `ibcsIntegratedWaterfall` 1.1 / `ibcsPnLWaterfall` 1.0 | Alternativen für `bridge` / `varint`, `wfint` / `waterfall` (mit PY) | Rollen `category`, `ac`, `py`, `pl` bzw. `forecast`; `colors.goodColor`/`badColor` | missing (nicht im Katalog) |
| `zugKpi` 1.0 | kein Kitchen-Typ (allenfalls Alternative zu `gauge`) | `value`, `scale.mode` | n/a |
| alle Custom Visuals | Installation | `.pbiviz` nach `CustomVisuals/<guid>/` + `report.json` (Paket A); heute nur als To-do | todo-only (R:1641-1644) |

---

## 2 Seitenebene

Die Zonen kommen aus `zones()` (A, `computeAll`), werden in E:123-139 exportiert und in P:962-1350 gebaut. Der Runner legt sie in R:1111-1123 und R:1449-1555 an.

| Element | Kitchen (A/H) | Ziel · Mapping | Status | Fundstelle heute |
|---|---|---|---|---|
| Leinwand | `canvas.w/h`, Vorgabe 1920 × 1080 (A:46) | `pbir add page -w -h`, `pbir pages resize` | done | R:1453-1472 |
| Seitenhintergrund | `PAGE_BG` light `#F4F4F1` / soft / white / custom (A:21-22) | `pbir pages background --color` | done | R:1517-1526 |
| Kopfband-Fläche | light weiß + Linie `#E3E1D8`, dark `#0F1E2E`, accent, custom (H:131-138) | Shape `chrome_header_bg`, dazu `chrome_header_rule` beim hellen Stil | done | P:1121-1136 |
| Kopfband-Titel/-Untertitel | 17 px × k, Gewicht 600; 11 px × k, Deckkraft 0,7 (H:145-146) | Shape-Text 16 × k **pt** fett (≈ 21 × k px) bzw. 10 × k pt | partial (rund 25 % zu groß) | P:1209-1224 |
| Logo | gestrichelter Kasten 88 × 30 × k „LOGO" (H:142) | Shape 120 × 32 × k mit durchgezogenem Rahmen; echtes Bild als To-do | partial | P:1164-1191 |
| Nav-Buttons im Kopfband | Pillen mit Rahmen, 11,5 px, Radius 4; aktiv in Akzentfarbe (H:147-152) | `actionButton`, 112 × k breit, 10 × k pt, inaktiv ohne Rahmen, `PageNavigation` | partial (Optik) | P:1193-1207, P:1020-1060 |
| Burger | Icon 32 × 32 mit drei Strichen (H:153-156) | `actionButton` 84 × 28 × k „☰ Filter" in Akzentfarbe | partial | P:1140-1162 |
| Linke Nav-Leiste | dunkle Leiste mit quadratischen Seitensymbolen (H:182-185) | Fläche in Ink + Text-Buttons je Seite | partial | P:1086-1118 |
| Fußleiste | 10 px × k, `#6B7280`, Linie oben `#E3E1D8` (H:157) | Shape-Text 9 × k pt, `muted`; keine Linie | partial | P:1310-1338 |
| Fußleisten-Navigation | Pillen 9,5 px (H:159-161) | `actionButton` mit Rahmen, 9,5 × k pt | done | P:1319-1334 |
| Filterbereich-Fläche | `#ECEBE5` + Linie `#E3E1D8` (H:166-168) | Shape `--panel` `#F1F3F5`, ohne Linie | partial | P:1235-1236, P:3280 |
| Filter-Überschrift | 11 px, Versalien, Sperrung, `#6B7280`, normal (H:171) | 11 × k pt fett in Ink | partial | P:1250-1253 |
| Filter-Hinweistext | 9,5 px `#6B7280` (H:175) | 9,5 × k pt `muted` | done | P:1257-1260 |
| Slicer (Felder, Art, Lage) | kompakte Zeilen mit Rahmen (H:172) | `slicer`/`advancedSlicerVisual`, `data.mode`/`orientation` | partial (Power-BI-Slicer mit Kopf und Standardoptik) | P:639-659, P:1402-1442 |
| Slicer-Vorauswahl | Text | `pbir add filter --values` | partial (Anzeige im Slicer ungewiss) | P:1697-1713 |
| Burger / einklappbar | Burger: Panel im Kitchen unsichtbar | Panel-Elemente ausblenden (`pbir visuals hide`) + zwei Lesezeichen + Button-Aktionen | missing: der Runner legt das Panel sichtbar über den Inhalt; Ausblenden und Lesezeichen stehen nur in `navigation.md` | P:1269-1293, P:2065-2108, R:1303-1308 |
| Lesezeichen | n/a | `pbir add bookmark --no-data`, `pbir bookmarks visuals` | todo-only | R:1303-1308 |
| Kachel-Container | Rahmen `#E1DFD6`, Radius × k, Schatten zweilagig, Fläche `tileBg` (H:187-189) | `background`, `border` (`--tile-border` `#E5E7EB`), `radius`, `dropShadow` BottomRight 85 % | done (Rahmenfarbe weicht leicht ab) | P:1476-1502, P:718-748 |
| Kachelkopf | Titel und Untertitel in **einer** Zeile (A:687) | Power BI setzt den Untertitel darunter | partial (Grenze von Power BI, offene Frage 5) | n/a |
| Innenabstand `spacing.pad` | Polster der Kachel | `pbir visuals padding` | missing | n/a |
| Rand, Abstand | in den Rechtecken | `position` | done | E:170 |
| Theme: Farben | `background`, `foreground` (Ink), `good`/`bad`, `tableAccent`, `dataColors` (`nativePalette`) | einmalig ein Custom Theme registrieren (Desktop zu), danach `pbir theme set-colors` je Deploy | todo-only (`theme-fragment.json` + To-do `theme`; ohne `dataColors`) | P:2853-2915, R:1295-1298 |
| Theme: Schrift | Titel, Untertitel, Diagramm (`design.typography`) | `pbir theme set-fonts largeTitle/title/label --font-size` | todo-only | P:2866-2885 |
| Schriftart | Geist (SK:108) | Theme `fontFace` (z. B. Segoe UI); Geist gibt es in Power BI nicht | missing (offene Frage 9) | n/a |
| Seitennamen | `pages[].name` | `pbir add page -n`; umbenennen per `pbir pages rename` | partial (Umbenennen nur als To-do) | R:982-986 |
| Seitenreihenfolge | Reihenfolge in `S.pages` | `pbir pages move --to` | missing | n/a |
| Drill-through | `link` an einer Kachel (A:957) | `pbir pages drillthrough --table --field`, Zurück-Button | todo-only | P:2007-2053, R:1299-1302 |
| Button-Navigation | `link` an einer Button-Kachel | `pbir visuals action --type PageNavigation` | done | P:1392-1398 |
| Interaktionen | `crossFilter` je Kachel | `pbir pages interactions` | missing | n/a |
| Fragestellung, Notizen der Seite | Text im Panel | Doku (`WORKSHOP-DOKU.md`) | n/a | n/a |

---

## 3 Modellebene (über `te`, Paket C)

`te`-Preview: die alte Version lief am 30.09.2026 aus, die neue läuft bis 31.10.2026 und muss erst installiert werden. Das blockiert alles in diesem Abschnitt.

| Kitchen-Angabe | Quelle | Was `te` tun würde | Status | Fundstelle heute |
|---|---|---|---|---|
| `newFields` (Kennzahl) | E:154-155 | `te add "<T>/<M>" -t Measure -i "<DAX>" -q description … --save`; DAX nur nach OK | todo-only (Vorschlag in `model-todos.md`) | P:2306-2358, R:1267-1270 |
| `newFields` (Spalte) | E:154 | gehört in Quelle/Power Query, nicht `te add` | todo-only | P:2342-2345 |
| `newFields` in neuer Tabelle | E:158 | Tabelle klären bzw. anlegen | todo-only | P:2325-2338 |
| Format neuer Kennzahlen | `newFields[].unit`, `formatWish` | `-q formatString` | partial (fest `#,##0`, P:2356; Einheit und Wunsch ignoriert) | P:2356 |
| `formatWish` / `formatWishString` | A:1144, E:150 | `te set "<T>/<M>" -q formatString -i "<fs>" --save`, danach `pbir desktop reload --model` | todo-only (nur To-do im Runner, nicht in `model-todos.md`) | R:1285-1289 |
| `description` | `newFields`, Modell | `-q description` | todo-only (nur bei neuen Feldern) | P:2354-2355 |
| `owner`, `source`, `target`, `unit`, `note` | Steckbrief (A:1164) | Beschreibung ergänzen oder Annotation (`te set … annotation`) | missing | n/a |
| `daxComment` | A:1164, E:150 | Wunsch vorlegen, DAX erst nach OK ändern | todo-only | R:1281-1284 |
| `renameInModel` + `alias` | E:146 | `te rename` → `pbir fields replace` → `pbir validate --fields` | todo-only | P:2365-2381, R:1290-1292 |
| `alias` ohne Umbenennung | Steckbrief | Anzeigename der Projektion im Visual | missing | n/a |
| `fieldParam` | E:109 | `te script … --save` (Feldparameter-Makro, headless) | todo-only | P:2167-2285 |
| fehlende Felder | `missing: true` | zuordnen, umbenennen oder anlegen (Entscheidung) | done (gemeldet) | R:1245-1255, R:1278-1280 |
| nach Modelländerung | n/a | `te validate --errors-only`, dann `pbir desktop reload --model` | missing | n/a |

---

## 4 Lücken nach Priorität

**P1** = beim ersten Blick sichtbar, **P2** = sichtbar beim Hinsehen oder nur in bestimmten Fällen, **P3** = Feinschliff.
**Aufwand:** S < ½ Tag, M ½–2 Tage, L > 2 Tage.

| # | Prio | Lücke | Lösung | Aufwand | Zuständig |
|---|---|---|---|---|---|
| 1 | P1 | CK nur mit Referenz-Instanz; sonst blaues natives Ersatzvisual oder Platzhalter | Paket A: `.pbiviz` installieren, `visual.json` aus einer Vorlage im Repo statt aus der Referenz-Instanz | L | Runner |
| 2 | P1 | Natives Visual ohne IBCS-Optik: Standardblau, Legende, Achse und Gitter an, Datenbeschriftung aus (`displayUnits` dadurch wirkungslos) | `dataPoint.field(<AC/PY/PL>)` fill/border, `legend.show`, `valueAxis.show`/`gridlineShow`, `labels.show=true` in `chrome-batch.json` | M | Konverter |
| 3 | P1 | Theme kommt nie an (`dataColors` aus `nativePalette`, Ink als `foreground`, good/bad, `textClasses`) | einmalig ein Custom Theme registrieren (zusammen mit Paket A), danach je Deploy `pbir theme set-colors`/`set-fonts`; `dataColors` ins Fragment aufnehmen | M | Konverter + Runner |
| 4 | P1 | CK-Analyse fehlt: `comparisonMode` aus `deltaBasis`, `showAbsolute/RelativeVariance` aus `deltaKind`, `labels.displayUnits`/`decimals`, `topN`, `cumulative`, `colors.good/badColor`, `appearance` | `chartProps` im Slot erweitern; die Whitelist in R:142-152 und `update_ck` ergänzen | M | Konverter + Runner |
| 5 | P1 | CK-Schrift zu klein: Vorgabe `compact` bei 1920 px | `labels.fontPreset` nach k bzw. `labels.fontScale` aus `slot.typography` | S | Runner |
| 6 | P1 | `kpi` → CK `cards` mit Monat als Kategorie ergibt zwölf Karten; das Ersatzvisual `card` verliert Δ und Sparkline | `kpi` auf `ibcsKpiCard` (`trend`) umstellen oder `cards` ohne Zeitrolle; nativ `cardVisual` + `card-reference` | M | Katalog/Export + Konverter |
| 7 | P1 | `waterfall`/`wfkombi` → CK `waterfall` ohne `rowType` bleibt leer | Ziel `columns` + `chart.waterfallStyle=true`, nativ `waterfallChart` oder `ibcsPnLWaterfall` (offene Frage 3) | S–M | Katalog + Konverter |
| 8 | P1 | CK-Kopf: Container-Untertitel steht über dem IBCS-Titel, CK ergänzt Einheit/Zeitraum/Szenario; In-Chart-Buttons sichtbar | Untertitel nach `ibcsTitle.period` oder in den `kpi`-Text; `chart.chartButtons=false` | S | Runner |
| 9 | P1 | Burger-Modus: Overlay-Panel liegt sichtbar über dem Inhalt | Panel-Elemente per `pbir visuals hide` verbergen, Lesezeichen und Aktionen aus `navigation.md` ausführen (`bookmarks/` ist nicht geschützt) | M | Runner |
| 10 | P1 | Chrome-Schrift 20–33 % zu groß (Konvention pt = Basis × k, statt px × 0,75) | Chrome auf px × 0,75 umstellen (Goldens neu); Filter-Überschrift normal, Versalien, grau | S | Konverter |
| 11 | P1 | Ersatzvisual sagt bei `absvar`, `relvar`, `bridge`, `heatmap`, `tree`, `sparktable` etwas anderes (Referenz fällt weg) | CK oder andere Kitchen-Visuals bevorzugen; nativ nur mit Δ-Kennzahl (Modell-To-do) | M | Konverter + Modell |
| 12 | P2 | Dunkle Kachel / eigenes Ink: Titel und Beschriftungen bleiben dunkel | `title.fontColor`, `subTitle.fontColor`, `labels.color`; CK `colors.appearance` | S | Konverter |
| 13 | P2 | `pnlByDatenWG` und `dataKitchenGantt` ohne `objects` | `objects` aus Palette, Basis, `deltaKind`, Zahlenformat, Schrift, Farben, Toolbar füllen | M | Konverter |
| 14 | P2 | `sparktable`: Zeit wird zweite CK-Kategorie, keine Sparkline | eigene Rollenzuordnung bzw. CK `table` mit `chartList` prüfen | M | Konverter |
| 15 | P2 | `colline`: Referenz statt `lineMeasure` | Mapping korrigieren | S | Konverter |
| 16 | P2 | Falsche To-dos: `SM_NOT_NATIVE` für CK, `CUMULATIVE` verlangt bei CK eine YTD-Kennzahl | Texte und Logik je Engine | S | Konverter |
| 17 | P2 | Seitenreihenfolge, Umbenennen, Drill-through, Interaktionen (`crossFilter`) nicht automatisch | `pbir pages move`/`rename`/`drillthrough`/`interactions` im Runner; vorher prüfen, ob `report.json` berührt wird | M | Runner |
| 18 | P2 | `topN` und Annotation beim Update nicht wiederholt | vorhandenen Filter ersetzen statt neu anlegen | S | Runner |
| 19 | P2 | Deneb-Typen (`marimekko`, `boxplot`, `deneb`) nur als Platzhalter | Vega-Vorlagen je Typ (Skill `deploy-to-powerbi`) | L | Konverter |
| 20 | P2 | Chrome-Optik: Panel-Farbe, Linie der Fußleiste, Nav-Pillen mit Rahmen, Logo-Kasten, Burger-Icon | `--panel` aus Kitchen (`#ECEBE5`), Linien-Shapes, `outline` an inaktiven Buttons | S | Konverter |
| 21 | P2 | Modell-Wünsche nur als To-do (`formatWish`, Beschreibung, Umbenennen, neue Kennzahlen) | Paket C über `te`, danach `pbir desktop reload --model` | M | Runner (+ `te`-Installation) |
| 22 | P3 | Tile-Padding, Rahmenfarbe `#E1DFD6`, zweilagiger Schatten | `pbir visuals padding`, `--tile-border` aus Kitchen | S | Konverter |
| 23 | P3 | CK-Vorschlags-Chip im Bearbeitungsmodus | `chart.smartStart=false` | S | Runner |
| 24 | P3 | Schriftart Geist ↔ Segoe UI | Theme `fontFace`, Abweichung akzeptieren | S | Konverter |
| 25 | P3 | `scaleGroup`, `timeGrain`, `message` nativ, Polarität nativ als CF | Achsen-Min/Max je Gruppe, bedingte Formatierung | M | Konverter |
| 26 | P3 | Polaritäts-Regex weicht ab: `LOWER_IS_BETTER` (MS:327-329) gegenüber `LOWER_RX` (C:173), betrifft nur v1/v2-Specs | angleichen | S | Konverter |
| 27 | P3 | `alias` nicht als Anzeigename, Steckbrief (Owner/Quelle/Ziel) nicht im Modell | `displayName` der Projektion, `te`-Annotation | S | Konverter + Runner |

---

## 5 Offene Fragen (Kitchen-Semantik unklar)

1. **Δ-Basis FC.** CK kennt `auto`/`py`/`plan`/`fcrev`. Heißt Kitchen-Basis FC „AC gegen FC" (dann gibt es in CK keinen passenden Modus) oder „FC gegen Vorprognose" (`fcrev`)?
2. **`absvar`/`relvar`.** Die Skizze zeigt nur die Abweichung, CK `columns` immer auch AC. Ist „AC + Δ-Panel" als Ziel in Ordnung, oder soll ein eigener Δ-Modus her?
3. **Kitchen-Typ `waterfall`.** Gemeint sind AC-Beiträge je Kategorie mit Σ. Welches Ziel gilt:
   - CK `columns` + `waterfallStyle`,
   - natives `waterfallChart`,
   - `ibcsPnLWaterfall` (braucht PY),
   - oder bekommt der Typ die Rolle `rowType`, damit CK `waterfall` trägt?
4. **`message`.** Das Kitchen zeichnet die Kernaussage nicht, CK zeigt sie über `ibcsTitle.message`. Soll das Kitchen sie im Kachelkopf zeigen, oder soll der Deploy sie weglassen?
5. **Untertitel.** Power BI setzt ihn unter den Titel, das Kitchen daneben. Bei CK: Container-Untertitel, `ibcsTitle.period` oder Suffix am `kpi`-Text? Und soll das Kitchen den Kopf umgekehrt wie Power BI zeigen?
6. **KPI.** Standardziel `ibcsKpiCard`, CK `cards` oder natives `cardVisual`? Ist `goal` immer `plan` oder je nach Name `py`/`benchmark`?
7. **Dezimalstellen.** Kitchen „auto" zeigt 0 Stellen, CK nimmt 1. Soll „auto" als 0 deployt werden?
8. **`nativePalette`.** Der Kitchen-Zustand startet mit `neutral` (A:55), die Skizze ohne Angabe mit `pbi`, Power BI mit Fluent2. Immer `dataColors` schreiben oder nur, wenn nicht `pbi`?
9. **Schriftart.** Geist im Kitchen gegenüber Segoe UI in Power BI. Abweichung akzeptieren oder das Kitchen auf Segoe UI umstellen?
10. **Chrome-Schriftgrößen.** Auf die Kachel-Konvention px × 0,75 umstellen? Dann ändern sich die Goldens der Skill-Tests.
11. **Small Multiples in CK 1.43.** Zeichnet `columns`/`bars` mit gebundener Rolle `multiples` wirklich das Raster? Danach `SM_NOT_NATIVE` für CK streichen.
12. **Theme-Änderungen.** Übernimmt Desktop eine geänderte Theme-Datei in `RegisteredResources` beim Bridge-Reload, ohne dass sich `report.json` ändert? Im Spike prüfen.
13. **Seiten umbenennen oder verschieben.** Berühren `pbir pages rename` und `pages move` die Datei `report.json` oder nur `pages.json`/`page.json`? R:983-986 nimmt `report.json` an.
14. **`scaleGroup`.** Das Kitchen kennt nur einen Gruppennamen. Woher kommt der gemeinsame Maximalwert (`scale.fixedMax`)?
15. **`bullet` und `tornado`.** Ist die Annäherung über CK `bars` akzeptabel, oder braucht es eigene Darstellungen?
16. **Burger und einklappbar.** Darf der Runner Lesezeichen anlegen und das Panel verbergen? Der Zustand eines Lesezeichens füllt sich erst durch einmaliges Aktualisieren in Desktop.
17. **Vorlage nach Paket A.** Ohne Referenz-Instanz braucht `ck_visual_json` (R:1739-1767) eine CK-`visual.json` als Vorlage. Wo liegt sie, und welche Grund-`objects` setzt sie?

---

## Zählung

Statuswerte der Einstellungen und Elemente in 1.2a bis 3 (ohne 1.1):

| Abschnitt | done | partial | todo-only | missing | n/a |
|---|---|---|---|---|---|
| 1.2a ChartKitchen (29) | 8 | 6 | 9 | 6 | 0 |
| 1.2b nativ (31) | 7 | 7 | 6 | 11 | 0 |
| 1.2c andere Visuals (20) | 3 | 0 | 2 | 14 | 1 |
| 2 Seite (30) | 8 | 12 | 4 | 5 | 1 |
| 3 Modell (13) | 1 | 1 | 8 | 3 | 0 |
| **Summe (123)** | **27** | **26** | **29** | **39** | **2** |

Gezählt wird der Anfang der Status-Spalte: „done (Vorgabe)" zählt als done, „todo-only (…), `unit` missing" als todo-only.

Kachel-Typen (1.1, 51 Typen): done 6 · partial 38 · missing 7.
