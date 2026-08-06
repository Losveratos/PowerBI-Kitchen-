# AGENT-GUIDE · ChartKitchen byDatenWG

**Zielgruppe: KI-Agenten** (Claude, Copilot, Cursor, GPT …), die Power-BI-Berichte
mit diesem Visual bauen, konfigurieren oder debuggen. Diese Datei macht das
Visual maschinen-konfigurierbar: exakte Property-Namen fürs PBIR-Authoring,
Datenvertrag mit Semantik, versteckte persistierte Zustände und die bekannten
Fallen. Menschen lesen besser die [Doku](../chartkitchen-doku.html); die
maschinenlesbare Quelle der Wahrheit ist [capabilities.json](capabilities.json),
Setting-Beschreibungen stehen in [src/settings.ts](src/settings.ts).

Stand: **1.40.0.0** (05.08.2026). Bei Versionssprüngen: CHANGELOG.md zuerst lesen.

## Steckbrief

| | |
| --- | --- |
| GUID | `chartKitchenByDatenWGD9DE0F7AD44D41058672C6FBF6F5A18D` |
| visual.json `visualType` | GUID wie oben (Import ersetzt ältere Version automatisch) |
| Aktuelles Paket | `dist/*.pbiviz` · stabiler Download: `https://datenwgknowledgekitchen.com/downloads/chartkitchen-byDatenWG-latest.pbiviz` |
| Datenlimit | `dataReductionAlgorithm top 1000` Kategoriezeilen — mehr wird still abgeschnitten |
| Lizenz | MIT · keine externen Calls, kein Storage, kein Telemetrie |

## Feld-Rollen (Datenvertrag)

Interne Rollennamen für PBIR (`projections`) — Reihenfolge egal, Semantik nicht:

| Rolle (intern) | Kind | Semantik + Fallstricke |
| --- | --- | --- |
| `category` | Grouping | Achse/Struktur. Hierarchie erlaubt (mehrere Spalten → Drill + Tabellen-Baum). Bei Datum: „Mär 26"-Format automatisch |
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

## Settings-Referenz (aus capabilities.json generiert, 1.40.0.0)

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
| `orientation` | enum | `columns` · `bars` · `line` · `waterfall` · `intwaterfall` · `catbridge` · `table` · `pareto` · `dumbbell` · `slope` · `cards` · `pnl` |
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
| `highlight` | text | Kategorien hervorheben (EMPHASIZE) |
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
| `variancePreset` | enum | `custom` · `blueOrange` (#2C7BB6/#E66101, übersteuert Picker) |
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
| `fixedMax` / `fixedVarMax` | numeric | Skalen-Sync über Instanzen |
| `capOverflow` | bool | Ausreißer-Kappung mit ⫽-Marker |
| `refLine` / `refLineLabel` | text | Referenzlinie + Beschriftung |

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

## Bekannte Fallen (Stand 1.40)

1. **Import bei gleicher GUID:** Nach „Visual aus Datei importieren" kann die
   laufende Sandbox-Instanz eingefroren weiterlaufen (reagiert nicht auf
   Filter). Fix: Seite wechseln und zurück, oder Visual minimal resizen.
2. **Top-1000-Kappung:** Mehr als 1000 Kategoriezeilen werden still
   abgeschnitten — Datenmodell vorfiltern oder aggregieren.
3. **Non-blank-Measures** erzeugen Geisterzeilen (siehe DAX-Regel oben).
4. **`acFcSplit`:** `full` vs. `rest` MUSS zur FC-Measure passen, sonst wird
   der angebrochene Monat doppelt gezählt.
5. **`sumSafeRounding` aus + sichtbare Rundungsdifferenz** → automatischer
   Hinweis im Chart (Columns oben rechts, Bars unten rechts).
6. **Export/Abo** rendert ohne In-Chart-Buttons und (Default) alles
   aufgeklappt — Bildschirm-Screenshots und PDF können sich absichtlich
   unterscheiden.
7. **Kein `fetchMoreData`**, kein Highlight-API-Support (Backlog) —
   Crossfilter funktioniert über Selektion, nicht über partielle Highlights.

## Verwandte Dateien

- `capabilities.json` — maschinenlesbare Rollen/Properties (Quelle dieser Tabelle)
- `src/settings.ts` — Beschreibungstexte je Setting (deutsch)
- `CHANGELOG.md` / `BACKLOG.md` — was sich geändert hat / was fehlt
- `.claude/skills/chartkitchen-report/` — Claude-Skill mit Report-Blaupausen
  (Monitoring · Monatsreport · Sales-Analyse) und Referenz-Instanz-Workflow
- `test/test.html` — 113 Render-Cases als lebende Beispiele jeder Funktion
