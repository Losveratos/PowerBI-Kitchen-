# AGENT-GUIDE · ChartKitchen byDatenWG

**Zielgruppe: KI-Agenten** (Claude, Copilot, Cursor, GPT …), die Power-BI-Berichte
mit diesem Visual bauen, konfigurieren oder debuggen. Diese Datei macht das
Visual maschinen-konfigurierbar: exakte Property-Namen fürs PBIR-Authoring,
Datenvertrag mit Semantik, versteckte persistierte Zustände und die bekannten
Fallen. Menschen lesen besser die [Doku](../chartkitchen-doku.html); die
maschinenlesbare Quelle der Wahrheit ist [capabilities.json](capabilities.json),
Setting-Beschreibungen stehen in [src/settings.ts](src/settings.ts).

Stand: **1.49.0.0** (17.10.2026). Bei Versionssprüngen: CHANGELOG.md zuerst lesen.

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

## Settings-Referenz (aus capabilities.json generiert, 1.49.0.0)

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

PBIR: `visual.json → objects.<objekt>.properties.<property>`. Enums als String.

### Objekt `ibcsTitle`

| Property | Typ | Werte |
| --- | --- | --- |
| `show` | bool | true/false |
| `kpi` | text |  |
| `period` | text |  |
| `message` | text |  |
| `autoMessage` | bool | true/false |
| `footer` | text |  |
| `filterFooter` | bool | true/false |

### Objekt `chart`

| Property | Typ | Werte |
| --- | --- | --- |
| `template` | enum | `off` · `C01` · `C02` · `C03` · `C04` · `C05` · `C06` · `C08` · `C09` · `C10` · `C12` · `C13` — IBCS-Vorlage (ab 1.49, Mapping oben) |
| `templateApplied` | text (persistiert) | zuletzt angewandte Vorlage (Echo-Guard; `off` = keine) |
| `orientation` | enum | `columns` · `bars` · `line` · `waterfall` · `intwaterfall` · `catbridge` · `table` · `pareto` · `dumbbell` · `slope` · `scatter` · `cards` · `pnl` |
| `pnlView` | text (persistiert) | `ac` · `acfc` · `pl` |
| `tableExpanded` | text (persistiert) | JSON-Array aufgeklappter Zeilen-Keys |
| `tableSort` | text (persistiert) | `<spalte>_desc` / `<spalte>_asc`, Spalten: `ac`,`dabs`,`drel`,`d2abs` |
| `tableColExpanded` | text (persistiert) | JSON-Array `["col¦<label>", …]` |
| `valueColumns` | enum | `ac` · `basis` · `all` |
| `structureEdit` | bool | true/false |
| `resultList` | text | kommagetrennte Zeilennamen → Ergebniszeilen (fett, Anker) |
| `skipList` | text | Zeilen, die aus Σ herausbleiben |
| `hideList` | text | Zeilen (inkl. Teilbaum) ausblenden |
| `chartList` | text | nur diese Zeilen bekommen Balken/Pins |
| `indentList` | text | „davon:"-Einrückung |
| `rowFormats` | text | `Zeile=Formatstring;…` (gemischte Einheiten je Zeile) |
| `tableNameWidth` | text (persistiert) | px der Namensspalte |
| `matrixCompare` | enum | `none` · `prevcol` |
| `formulaRows` | text | Syntax unten |
| `totalRowPosition` | enum | `bottom` · `top` |
| `zebraStripes` | bool | true/false |
| `acFcSplit` | enum | `off` · `full` (Säule = max(AC,FC)) · `rest` (Säule = AC+FC) — Doppelzähl-Gefahr, muss zur FC-Measure-Definition passen |
| `hideBlankCat` | bool | `(blank)`-Kategorien ausblenden (Default false) |
| `exportExpandAll` | bool | Export rendert alles aufgeklappt (Default true) |
| `rowDensity` | enum | `compact` · `normal` · `airy` |
| `gridLines` | enum | `horizontal` · `none` · `both` |
| `cellLayout` | enum | `columns` · `stacked` (Matrix halbe Breite) |
| `tableColWidths` | text (persistiert) | JSON `{"val":64,"dval":60,"mxBlock":150,"mxSum":120}` |
| `cardStatusBasis` | enum | `basis` · `benchmark` |
| `cardHighlight` | enum | `both` · `bad` · `good` |
| `cardBars` | bool | Mini-Brücke auf Karten |
| `cardSort` | enum | `none` · `deviation` · `worst` · `best` |
| `pinStyle` | enum | `auto` · `round` · `square` |
| `deltaIcons` | bool | ▲▼● vor Δ-Werten |
| `cardSortSel` | text (persistiert) | Chip-Override von cardSort |
| `cardRefValues` | enum | `off` · `basis` (Vergleichsbasis als Wertzeile) · `all` (zusätzlich PY/PL/FC/BM) — Referenzwerte über den Δ-Zeilen |
| `cardTint` / `cardTintStrength` | bool / numeric | Ampel-Hintergrund, 4–40 % |
| `cardBullet` / `cardBulletZoom` | bool | Bullet AC vs. BM |
| `comparisonMode` | enum | `auto` · `py` · `plan` · `fcrev` — Basis aller Δ |
| `showAbsoluteVariance` / `showRelativeVariance` | bool | Δ- / Δ%-Panel |
| `showTotal` | bool | Σ-Kopfzeile |
| `topN` | numeric | Top N + „Rest" (bars) |
| `movingAverage` | numeric | Ø-N-Linie, 0 = aus |
| `dualVariance` | bool | ΔPL und ΔPY gleichzeitig |
| `pyTriangle` | bool | PY als Dreieck bei 3 Szenarien |
| `cumulative` / `cumulativeKind` / `fiscalStart` | bool / enum / numeric | YTD·QTD·R12, Fiskaljahr-Startmonat |
| `cumulativeButton` | bool | YTD-Chip im Chart |
| `materialityAbs` / `materialityPct` | numeric | Wesentlichkeit: darunter grau |
| `exceptionOnly` | bool | Exception-Reporting: nur Kategorien über der Wesentlichkeit, Rest als Sammelzeile „Unauffällig (n)" (Σ-treu; nur bars/cards/flache Tabelle; ⚠-Chip im Chart) |
| `smartStart` | bool | Smart-Start-Vorschlags-Chip im Edit-Modus (Default an) |
| `smartStartDismissed` | text (persistiert) | Signatur der verworfenen Vorschlags-Konstellation |
| `highlight` | text | Kategorien hervorheben (EMPHASIZE) — ab 1.42 in ALLEN Modi inkl. Pareto/Waterfall/Brücken/Stacked |
| `groupEvery` | numeric | Trennlinie alle N Kategorien |
| `multiplesTotal` / `multiplesTopN` / `multiplesHero` / `multiplesSameScale` | — | Small-Multiples-Paket |
| `waterfallStyle` | bool | Bridge-Panel bei Columns/Bars |
| `sortByImpact` | bool | Brücke nach Treibergröße |
| `chartButtons` | bool | In-Chart-Buttons (ΔPY\|ΔPL, ⇅, ▶) |
| `driverNote` | bool | Treiber-Notiz Kategorie-Brücke |
| `compareClick` | bool | 2-Klick-Differenzvergleich |
| `invert` / `invertList` | bool / text | Kosten-Logik global / je Kategorie |

### Objekt `colors`

| Property | Typ | Werte |
| --- | --- | --- |
| `appearance` | enum | `auto` (Default, erkennt dunkle Themes an der Hintergrund-Luminanz < 0,35) · `light` · `dark` — ab 1.43. Dark stellt Tinte/Achsen/Flächen auf helle Töne; Picker auf hellem Default werden automatisch ersetzt (AC/PL #404040→#D9D9D9, PY #B3B3B3→#8A8A8A, Gut #1E8F9E→#3FB3C2, Schlecht #D64541→#E4635F), eigene Farben bleiben |
| `variancePreset` | enum | `custom` · `blueOrange` (#2C7BB6/#E66101, übersteuert Picker; im Dark Mode #5BA3DC/#F0821E) |
| `useTheme` | bool | Theme-Farben vor Pickern |
| `actualColor` / `previousYearColor` / `planColor` / `goodColor` / `badColor` | color | `{"solid":{"color":"#RRGGBB"}}` |

### Objekt `labels`

| Property | Typ | Werte |
| --- | --- | --- |
| `show` | bool | true/false |
| `sumSafeRounding` | bool | Σ-treue Rundung (Restwertverfahren) |
| `financeFormat` | bool | (1.234) statt −1.234 |
| `labelAc` / `labelPy` / `labelPl` / `labelFc` | text | Hausbegriffe („Ist", „VJ", „Budget") — leer = IBCS-Kürzel; wirken auf Titel, Köpfe, Brücken, Legenden, Tooltips |
| `labelDensity` | enum | `auto` · `all` · `ends` |
| `fontPreset` | enum | `compact` · `fullhd` (Default-Empfehlung 1080p) · `presentation` |
| `fontScale` / `fontSize` / `decimals` | numeric | Feinjustierung |
| `displayUnits` | enum | `auto` · `none` · `k` · `m` · `b` |

### Objekt `emptyState` (ab 1.44)

| Property | Typ | Werte |
| --- | --- | --- |
| `mode` | enum | `demo` (Default, Galerie wie bisher) · `fields` (Feld-Intro mit ✓ an gebundenen Rollen) · `message` (eigene Nachricht) — ab 1.49, nur Bearbeitungsmodus; Leser/Export unverändert |
| `title` | text | Eigener Titel im Leer-Zustand — ersetzt „ChartKitchen byDatenWG" |
| `body` | text | Eigener Text darunter (Wortumbruch). Gesetzt + Lesemodus → NUR Titel+Text, keine Modus-Galerie; im Edit-Modus bleibt die Galerie mit den eigenen Texten als Header |

Hinweis Tooltip: Im Dark Mode (colors.appearance) zeichnet das Visual den
Hover-Tooltip selbst (dunkler Kasten, Kategorie als Header); im hellen Modus
bleibt der native tooltipService.

### Objekt `commentsPanel`

| Property | Typ | Werte |
| --- | --- | --- |
| `showPanel` | bool | Fußnoten-Spalte rechts |
| `commentFontSize` | numeric |  |
| `editComments` | bool | Kommentar-Modus (Klick = Editor) |
| `userComments` | text (persistiert) | JSON der im Bericht erfassten Kommentare |

### Objekt `scale`

| Property | Typ | Werte |
| --- | --- | --- |
| `fixedMax` / `fixedVarMax` | numeric | Skalen-Sync über Instanzen (ab 1.45 auch im Wasserfall) |
| `capOverflow` | bool | Ausreißer-Kappung mit ⫽-Marker (ab 1.45 an ALLEN gekappten Elementen) |
| `refLine` / `refLineLabel` | text | Referenzlinie + Beschriftung |
| `wfAxisBreak` | enum | `off` (Default) · `auto` · `on` — IBCS-Achsenschnitt im Wasserfall (ab 1.45): Anker als Stummel mit ⫽ über volle Balkenbreite, nur zulässig wenn alle Anker+Deltas über dem Schnitt liegen; `auto` hebt den „⫽ Achse"-Chip hervor, geschnitten wird erst per Klick; Small Multiples teilen EINEN Schnitt; Fußzeile weist den Schnitt in Exporten aus |
| `wfBreakAt` | numeric | manueller Schnittwert, 0 = automatisch (niceFloor unter dem tiefsten Stand) |

### Objekt `categoryAxis`

| `fontSize` | formatting | Kategorien-Schriftgröße |

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

## Bekannte Fallen (Stand 1.49)

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

## Verwandte Dateien

- `capabilities.json` — maschinenlesbare Rollen/Properties (Quelle dieser Tabelle)
- `src/settings.ts` — Beschreibungstexte je Setting (deutsch)
- `CHANGELOG.md` / `BACKLOG.md` — was sich geändert hat / was fehlt
- `.claude/skills/chartkitchen-report/` — Claude-Skill mit Report-Blaupausen
  (Monitoring · Monatsreport · Sales-Analyse) und Referenz-Instanz-Workflow
- `test/test.html` — rund 240 Render-Cases (c1–c219 inkl. Varianten) als lebende Beispiele jeder Funktion
