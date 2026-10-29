# Fabric-Apps-Entwicklerin (Rayfin, React, TypeScript) · Review MockupKitchen v0.5.4

## 1 · Wer ich bin und was ich damit vorhabe

Ich baue die Fabric Apps unter `apps/` (Sales Cockpit, Finance Cockpit, PnL, Auslastung): React, TypeScript, Rayfin, zwei bis drei DAX-Abfragen auf feinem Korn, der Rest wird im Browser gerechnet. Mein Arbeitsvertrag mit den Agenten ist `BRIEF.md` plus die Datenschicht (`model.ts`, `kpis.ts`, `view.ts`), die ich vorher selbst schreibe und gegen die Modellwerte teste. Ein Reporting-Workshop endet bei uns heute mit Whiteboard-Fotos und einer Stunde Nacharbeit, bis daraus ein Datenvertrag für die App wird. Meine Frage an das Tool: Kann eine `mockup-spec.json`, die im Workshop für Power BI entsteht, auch der Einstieg für einen Rayfin-Bau sein, so wie der Skill `mockup-to-powerbi` daraus einen Bericht macht? Ich habe dafür das Vertriebscontrolling-Cockpit (vier Seiten, AC vs PY, Pipeline, Deals) als Mockup nachgebaut, exportiert und die Spec gegen das gehalten, was `App.tsx`, `Tile.tsx`, `model.ts` und die DAX-Abfragen tatsächlich brauchen.

## 2 · Aufgaben und Verlauf

Umgebung: Playwright/Chromium 1600×1000, Skripte `review/fabric-app-dev/s1.mjs` bis `s4.mjs`, Belege im selben Ordner. Export und Konverter-Ausgaben unter `review/fabric-app-dev/export/`.

| # | Aufgabe | Ergebnis | Beleg | Anmerkung |
|---|---|---|---|---|
| 1 | TMDL des Vertriebscontrolling-Modells laden (16 Tabellen, zwei Calculation Groups, Kalender) und Steckbrief eines Measures öffnen | teilweise | `02-tmdl-geladen.png`, `01-tmdl-ascii-geladen.png`, `01-t1-steckbrief.png` | Über Playwright kamen nur 8 von 16 Dateien an (die mit Emoji im Dateinamen fehlten, Harness-Grenze, nicht das Tool). Mit ASCII-Kopien: 16 Tabellen, 29 Measures, Calculation Groups als Tabellen mit 2 Spalten. Steckbrief zeigt DAX, Format mit Beispiel, Ordner. Versteckte Spalten (`isHidden`, z. B. `Kalender.Year`, `Month`) tauchen weder in der Liste noch in der Suche auf, ohne Hinweis. |
| 2 | Vorlage „Executive One-Pager" nach dem Modellimport anwenden | teilweise | `02-t2-vorlage-exec.png` | Layout steht in einer Sekunde. Die Vorlagenbindungen auf `_Measures.AC` usw. fallen still weg, Toast sagt nur „Vorlage gesetzt". Erst die roten Punkte zeigen, dass alle acht Kacheln ungebunden sind. |
| 3 | Filterpanel rechts mit Jahr, Vertriebler, Bundesland, Produktgruppe und dem Pflichtfilter `Pipeline Status.Sort Order = 0` | teilweise | `03-t3-filter-slicer.png` | Vier Slicer per Drag, Vorauswahl `0` eingetragen, Button-Slicer wählbar. Jahr nicht möglich (Spalte versteckt). Der Snapshot-Filter ist nur als sichtbarer Slicer abbildbar, einen versteckten Berichts- oder Seitenfilter kennt das Tool nicht. Im Slicer landete `Forecast.Vertriebler` statt `Vertriebler.Vertriebler`, weil der Chip im Panel nur den Feldnamen zeigt. |
| 4 | Acht Kacheln über den Klick-Fallback binden (Kachel wählen, Chip klicken, Rolle im Menü) und Kernbotschaft als Text | gelungen | `04-t4-kacheln-gebunden.png`, `05-rolemenu-oder-gebunden.png` | Rollenmenü ist klar, Doppelbelegung wird abgefangen. Export meldete korrekt `SCENARIO_REF_MISMATCH` (Vorlage AC/PL, gebunden PY) und `ROLE_EMPTY` (Zeit fehlte). |
| 5 | Analyse-Block an der Strukturbrücke: Polarität, Δ-Basis PY, Sortierung nach Δ, Top 10, Einheit, Anzeige-Einheit, Skalengruppe, Kernaussage; Durchlaufzeit auf „kleiner = besser"; Monatschart auf `timeGrain month` und kumuliert | gelungen | `05-t5-analyse-bruecke.png` | Alles landet 1:1 in `visuals[].analysis` und im Brief. Der Konverter macht daraus zwölf To-dos (`SORT_DELTA`, `SCALE_GROUP`, `CUMULATIVE`, `TIME_GRAIN` …), weil `pbir` das nicht setzen kann. Für eine App sind genau diese Felder direkt umsetzbar. |
| 6 | Seite 2 „Deals & Kunden" mit Vorlage „Drill", Kachel-Fenster (N) an der Brücke: Must, abgestimmt, Drill-down, Drill-through auf Seite 2, Beispielwerte | gelungen | `06-t6-seite2-drill.png`, `07-t6-kachel-fenster.png`, `08-t6-nach-kachel-fenster.png` | `links[]` mit `drillField: Standort.Bundesland`, `interaction` und `samples` korrekt in der Spec. Beispielwerte erscheinen sofort in der Skizze. |
| 7 | Szenario auf AC/PY umstellen, Small Multiples nach Produktgruppe am Monatschart | gelungen | `01-t8-szenario-wechsel.png`, `02-t8-small-multiples.png` | Mismatch-Warnung verschwindet, Skizze zeigt 2×3 Raster, Spec trägt `smallMultiples.field` und Rolle `multiples`. Konverter: `SM_NOT_NATIVE`, ChartKitchen kann das nicht. In der App ist es ein Schalter in der Kachel. |
| 8 | Steckbrief pflegen (Alias „Auftragseingang", bestätigt, Owner, Einheit, Anmerkung zum Snapshot) und neue Kennzahl „Abschlussquote" mit Ziel, Quelle, offener Frage anlegen und binden | gelungen | `03-t9-steckbrief.png`, `04-t9-neue-kennzahl.png` | `fields[]` enthält Alias, `confirmed`, `expression`, Format-Klartext; `newFields[]` vollständig, `model-todos.md` mit `te add`. Die Datenfalle „Sort Order = 0" steht jetzt als Freitext in `note`, nicht maschinenlesbar. |
| 9 | Design: dunkler Kachelgrund, helle Schrift, eigene Seitenfarbe, Typografie; Canvas von Full HD auf HD und zurück, Rechtecke vergleichen | gelungen | `01-t10-dunkel.png` | `design.darkMode: true` wird aus der Kachelfarbe abgeleitet, Skizzen schalten um. Rechtecke sind reine Pixel: Brücke 1036×438 bei 1920, 690×292 bei 1280. Für eine App brauche ich Spuren und Gewichte, die stehen nur im `layoutTree`. |
| 10 | Präsentationsmodus | gelungen | `02-t11-praesentieren.png` | Lesbar, Panels weg, Kacheln skalieren. |
| 11 | Export (Spec, Brief, Doku, pbir-visuals), Skill-Validierung und Konverter mit `--plan --ck-fallback` | gelungen | `09-t7-export-dialog.png`, `10-t7-export-prompt.png`, `03-t12-export-pbir.png`, `export/out/` | `--validate`: „Spec in Ordnung". Konverter liefert plan.json, acceptance.json, checklist.md (110 Zeilen), analysis-todos, theme-fragment. Export-Dialog erklärt, warum pbir-visuals nur Slicer enthält. |
| 12 | Aus der exportierten Spec eine Rayfin-App ableiten (Datenvertrag, Interaktion, Layout, Zustände, Tokens) | teilweise | Abschnitt 5 | Kein Browser-Schritt. Ergebnis: etwa die Hälfte der App ist ableitbar, die Datenschicht nicht. |

Browser-Schritte insgesamt: etwa 55.

## 3 · Was mir fehlt (Top 5, nach Wichtigkeit)

**1. Ein Datenvertrag je Kachel statt nur Feldreferenzen.**
Was: Die Spec sagt `ac: Angebote.€ Gewonne Angebote`, `ref: Angebote.Gewonne Angebote PY`, `category: 📅Kalender.Year-Month`. Sie sagt nicht, welches Zeitfeld zählt (Abschlussdatum, nicht Anlagedatum), wie PY entsteht (Vorjahr desselben Zeitraums, kein Plan im Modell), dass Quoten als Quotient der Summen und nicht als Mittel der Quoten gebildet werden, ob eine Kennzahl additiv ist (Brücke nur für additive KPIs, Distinct Count nicht), und welche Filter immer gelten.
Warum: In `model.ts` und `kpis.ts` sind genau das die Zeilen, die ich vor jedem Agentenlauf selbst schreibe und gegen Modellwerte teste. Ohne sie generiert ein Agent eine App, die anders rechnet als der Bericht, und das fällt erst im Vergleich auf.
Wie: Ein optionaler Block `visuals[].data` oder besser `fields[].semantics`: `{ aggregation: sum|avg|distinctCount|ratio, numerator, denominator, additive: bool, timeField: "Angebote.Abschluss Datum", scenarioFrom: { PY: "sameperiod-1y" | measure }, requiredFilters: [ { field, op, value } ] }`. Der Steckbrief hat schon Owner, Ziel, Einheit, Anmerkung; hier fehlen vier maschinenlesbare Felder, die der Fachbereich im Workshop ohnehin beantwortet. Für Power-BI-Nutzer unsichtbar lassen, solange nichts eingetragen ist.
Aufwand: mittel. Bezug: beiden (Power BI bekommt daraus `te add` mit echtem DAX statt `// TODO`, Rayfin die Aggregationslogik).

**2. Berichts- und Seitenfilter, die keine Slicer sind.**
Was: `Pipeline Status.Sort Order = 0` ist im Vertriebscontrolling ein Muss, sonst zählt jede Summe siebenfach. Im Tool kann ich das nur als sichtbaren Slicer mit Vorauswahl „0" abbilden (Aufgabe 3). Der Konverter macht daraus einen kategorialen Visual-Filter mit Hinweis „in Desktop prüfen".
Warum: In Power BI gehört das in den Filterbereich auf Berichtsebene, in der App in die `WHERE`-Klausel der DAX-Abfrage (`FILTER(Angebote, RELATED('Pipeline Status'[Sort Order]) = 0)`). Beide Ziele brauchen dieselbe Information: Feld, Operator, Wert, Ebene (Bericht, Seite, Kachel), sichtbar oder nicht.
Wie: Im Zonen-Reiter unter Filter ein zweiter Abschnitt „Feste Filter (nicht sichtbar)" mit Feld, Operator, Wert und Ebene. Export als `filters[]` auf Berichts- und Seitenebene, Slicer bleiben `zones.filter.slicers`.
Aufwand: klein. Bezug: beiden.

**3. Beziehungen und Tabellenrollen aus dem Modell.**
Was: `relationships.tmdl` wird beim Import ausdrücklich übersprungen. Die Spec weiß nicht, dass `Vertriebler` eine Dimension ist und `Forecast.Vertriebler` eine Fremdschlüsselspalte. Mir ist beim Ziehen genau das passiert: Slicer auf `Forecast.Vertriebler`, Tabellenzeilen auf `Forecast.Kunde`, weil drei Tabellen eine Spalte „Vertriebler" haben und der Chip nur den Namen zeigt.
Warum: Für die App muss ich wissen, über welche Tabelle gefiltert wird und welche Spalten in einer Abfrage per `RELATED` kommen. Für Power BI ist ein Slicer auf der Faktspalte ebenso falsch, nur fällt es später auf.
Wie: `relationships.tmdl` lesen, je Tabelle `role: fact|dimension|calcGroup|parameter|date` aus Kardinalität und `dataCategory` ableiten, `model.relationships[]` exportieren. Im Tool: Warnung, wenn ein Slicer oder eine Kategorie auf einer Faktspalte liegt und eine gleichnamige Dimensionsspalte existiert. Tabellenname im Chip-Tooltip des Filterpanels.
Aufwand: mittel. Bezug: beiden.

**4. Interaktionsmodell über die Kachel hinaus.**
Was: Je Kachel gibt es Drill-down, Cross-Filter an/aus und Drill-through. Es fehlt, was eine App ausmacht: Klick auf eine Kachel wählt die KPI für alle anderen Kacheln (KpiCards), Zoom einer Kachel in ein Overlay (Tile.tsx), Chips für aktive Filter mit „alle aufheben", Perioden-Umschalter FY/YTD/Monat, URL-Zustand, Details on demand als Seitenpanel (CustomerPanel) statt als eigene Seite.
Warum: Das Vertriebscontrolling hat vier Seiten nach Shneiderman, aber die Hälfte der Navigation passiert innerhalb der Seite. Aus der Spec würde ein Agent vier statische Seiten bauen und die KPI-Auswahl erraten.
Wie: Ein kleines Vokabular an Seitenverhalten, als Checkboxen im Seiten-Reiter: `page.behaviour { kpiSelector: "kpi-row" | null, zoom: bool, filterChips: bool, periodSwitch: ["fy","ytd","month"], detailsPanel: { trigger: visualId, field } }`. Für Power BI übersetzt der Skill das in Lesezeichen, Feldparameter und Drill-through, so wie heute schon `burger` zwei Lesezeichen erzeugt. Nichts davon ist Pflicht.
Aufwand: mittel. Bezug: beiden, Rayfin mehr.

**5. Layout als Spuren statt nur als Pixel.**
Was: `rect` ist absolut und schon mit `uiScale` multipliziert. Der `layoutTree` hat die Gewichte, steht aber im Spec-Format als „nur zur Orientierung". Ein Wechsel des Presets ändert alle Rechtecke (Aufgabe 9).
Warum: Eine App ist responsiv. `OverviewPage.tsx` ist `grid-cols-[minmax(0,3fr)_minmax(0,2fr)]` plus KPI-Reihe `2xl:grid-cols-6`. Das ist genau der `layoutTree` mit Gewichten 3:2 und sechs gleichen Spalten, nicht die Pixel.
Wie: `layoutTree` zum vollwertigen Vertrag erklären (Spuren, Gewichte, Mindestbreiten je Kacheltyp) und je Kachel einen Umbruchhinweis `minWidth` mitgeben. Pixel bleiben für Power BI maßgeblich. Dazu in der Doku den Satz „maßgeblich sind die Rechtecke" um „für PBIR" ergänzen.
Aufwand: klein. Bezug: Rayfin.

## 4 · Wo das Erlebnis besser sein kann

- **Versteckte Spalten sind unsichtbar und unerklärt.** `Kalender.Year` und `Month` sind im Modell `isHidden`, weil die Hierarchie sichtbar ist. Die Suche „Year" findet nichts, die Tabelle zeigt „29≡", in der Liste stehen 17. Für einen Jahr-Slicer brauche ich die Spalte trotzdem, und in einer DAX-Abfrage sowieso. Vorschlag: Kästchen „versteckte Felder zeigen" neben „nur verwendete Felder", versteckte Chips gedimmt, Hinweis in der Suche „2 Treffer versteckt". Beleg: `01-tmdl-ascii-geladen.png`, Ausgabe `s3.mjs` („kalender visible columns").
- **Vorlage nach Modellimport verliert still alle Bindungen.** Die Vorlagen binden Demo-Felder (`_Measures.AC`, `DimDate.Month`). Nach einem echten Import wird das Layout gesetzt, die Felder fehlen, und der Toast sagt „Vorlage gesetzt". Vorschlag: Beim Anwenden ein kleiner Zuordnungsdialog „AC → ?, PY → ?, Monat → ?" mit Vorschlägen aus dem Modell (Name, Ordner, Format), oder wenigstens der Toast „8 Kacheln ohne Felder, weil die Vorlage das Demo-Modell erwartet". Beleg: `02-t2-vorlage-exec.png`.
- **Gleichnamige Spalten in mehreren Tabellen.** Chips auf Kacheln und im Filterpanel zeigen nur den Feldnamen. Bei `Vertriebler` (drei Tabellen) und `Kunde` (zwei) habe ich unbemerkt die Faktspalte erwischt, der Export trägt `Forecast.Vertriebler`. Vorschlag: Tabellenname als Tooltip und bei Namenskonflikt als Präfix im Chip („Forecast · Vertriebler"). Beleg: `export/mockup-spec.json`, `zones.filter.slicers[0]`.
- **Vorauswahl eines Slicers ist Freitext.** „0", „2022", „NRW; Bayern" landen als String in `slicers[].default`. Der Konverter rät dann den Filtertyp. Vorschlag: Werte aus dem Modell kennt das Tool nicht, aber Typ und Mehrfachauswahl könnte es abfragen (ein Wert, Liste, Bereich). Beleg: `03-t3-filter-slicer.png`.
- **Analyse-Felder, die beim Bau nur To-dos werden, sehen aus wie gesetzte Entscheidungen.** `cumulative`, `timeGrain`, `scaleGroup`, `sort.by: delta` werden im Panel mit „8 gesetzt" gezählt, der Konverter liefert dafür ausschließlich To-dos. Vorschlag: im Panel ein kleines Zeichen „nur als Hinweis an den Agenten" an diesen Feldern, damit die Moderation im Raum nicht etwas verspricht. Beleg: `05-t5-analyse-bruecke.png`, `export/out/analysis-todos.md`.
- **Der Modellname im `te add`-Befehl heißt „TMDL (16 Dateien)".** Steht als Wunsch schon im Review vom 25.09. (4.6), ist bei Einzeldatei-Import weiterhin so. Beleg: `export/out/model-todos.md`.
- **Die Datenfallen aus dem Steckbrief sind reiner Text.** „Nur Snapshot Sort Order = 0 zählen" steht in `fields[].note`. Das liest ein Mensch, ein Agent übersieht es zwischen 110 Zeilen Checkliste. Vorschlag: siehe Punkt 1 und 2 in Abschnitt 3, oder mindestens eine Markierung „Bauhinweis" am Notizfeld, die den Text im Brief nach oben in die Regeln hebt.

## 5 · Zusammenführung mit Fabric Apps / Rayfin

Ich habe die exportierte Spec (`export/mockup-spec.json`, 2 Seiten, 13 Kacheln, 4 Slicer, 1 Drill-through) Zeile für Zeile gegen das gehalten, was das Sales Cockpit in `App.tsx`, `Tile.tsx`, `model.ts`, `kpis.ts`, `view.ts` und `queries/vertrieb/*.dax` tatsächlich enthält.

**Was ich aus der Spec heute generieren könnte**

- Rahmen und Seiten: `zones.header` (Titel, Untertitel, Nav), `zones.footer.text`, `zones.filter` (Seite, Breite, einklappbar) und `pages[]` mit `name`, `question` entsprechen fast 1:1 dem `PAGES`-Array und dem Kopfband in `App.tsx`. Daraus wird die Seitennavigation samt URL-Hash.
- Kacheln als Komponenten: `kind` und `chartKitchenMode` bilden sauber auf unsere Komponenten ab: `kpi/cards` → `KpiCards`, `kombi` oder `varint` mit `category` auf einer Zeitspalte → `TimeChart`/`VarIntChart`, `bridge/catbridge` → `StructureBridge`, `multiples` oder `analysis.smallMultiples` → `SmallMultiples`, `tree/decomp` → `DriverTree`, `table` → Deals-Tabelle, `text` → Kernbotschaft (`Tile.message`). `title`, `subtitle`, `analysis.message`, `analysis.unit` sind direkt die Props von `Tile`.
- Notation: `scenario`, `analysis.polarity` (`higherBetter`), `deltaKind`, `design.varianceColors`, `darkMode`, `cornerRadius`, `colors` reichen für `notation.ts` und die CSS-Tokens. Dark Mode ist in der Spec nur ein Flag, die App braucht zwei Farbsätze; das ist aber ableitbar, weil wir ohnehin eine feste Dark-Palette haben.
- Verhalten je Kachel: `interaction.crossFilter` → `onToggle` an der Brücke, `drillThrough.field` → welche Dimension das Detailpanel öffnet, `links[].drillField` → Übergabe in den URL-Zustand (`f.bundesland=NRW`).
- Workshop-Metadaten: `workshop.priority` und `status` sind ein fertiger Backlog für die Agenten, `fields[].confirmed` ist die Freigabe für die KPI-Definition, `newFields[]` ist die Liste, was in `kpis.ts` als abgeleitete Kennzahl gebaut werden muss.
- Slicer: `zones.filter.slicers[]` mit `type` → `FilterPanel` (Dropdown, Liste, Kacheln als Chips).

**Was ich raten müsste**

- Die komplette Datenschicht: Welche Tabellen auf feinem Korn geladen werden (bei uns Angebote, Forecast, Dimensionen), welches Zeitfeld eine Kennzahl treibt (Abschluss- gegen Anlagedatum), wie PY entsteht (Vorjahr im Browser, weil die PY-Measures im Modell fehlerhaft sind), ob eine Kennzahl additiv ist (Brücke erlaubt oder „Δ je Bucket, nicht additiv"), wie Quoten gebildet werden. Die Spec verweist auf Measures, eine App rechnet selbst und bräuchte deren Semantik, oder sie führt das Measure per DAX aus und verliert Interaktion ohne Wartezeit.
- Pflichtfilter und Datenfallen: `Sort Order = 0`, `TRIM` auf Bundesland, Forecast-Produkt über `Core Produkt.Produkt ID`. Das steht in `memory/03-daten.md`, nirgends in der Spec.
- Beziehungen: Welche Spalte filtert was, ob `Forecast.Vertriebler` dieselbe Dimension ist wie `Angebote.Vertriebler`.
- Periodenlogik: FY, YTD, Monat, „letzter abgeschlossener Monat" aus dem Datenstand. Die Spec hat `timeGrain` und `cumulative` je Kachel, aber keinen Seiten- oder Berichtskontext „Analysejahr, Vergleichsjahr, Periodenart".
- Welche Kachel die KPI-Auswahl für die anderen steuert (Shneiderman: Übersicht wählt, Analyse zoomt).
- Zustände: Laden mit Fortschritt je Abfrage, Fehler mit „Erneut versuchen", leere Auswahl, „kein Vorjahr" (VP statt PY). Keine Spur in der Spec, obwohl der Workshop das Vokabular hat („Datenstand", „Aktualisierung").
- Responsives Verhalten: Umbruchpunkte, Mindestbreiten, Reihenfolge beim Stapeln.

**Was heute Power-BI-spezifisch ist und abstrahiert gehört**

- `native.buckets` (Category, Y, Values) und `customVisual.buckets` sind pbir-Vokabular, `roles` ist das neutrale. Beides parallel ist richtig; die App liest nur `roles`.
- `rect` in Pixeln mit `uiScale`, `spacing` in Pixeln; neutral wäre der `layoutTree` mit Gewichten.
- `engine: ck|native|deneb|custom` ist eine Power-BI-Entscheidung. Neutral wäre `component` (varint, bridge, cards …), `engine` bleibt als Zielangabe daneben.
- `zones.filter.bookmarks`, `slicers[].type` mit `data.mode`-Werten, `design.*` mit `pbir set`-Semantik, `issues` wie `NO_NATIVE`, `CK_NO_MODE`. Für die App irrelevant, aber unschädlich.
- `meta.skill: "mockup-to-powerbi"` legt das Ziel fest. Für zwei Ziele bräuchte es `targets: ["powerbi", "fabric-app"]`.

**Konkreter Vorschlag: zielneutrale Spec ohne Mehraufwand für Power-BI-Nutzer**

Nichts umbauen, drei optionale Blöcke ergänzen, die leer bleiben dürfen, plus ein Zielschalter:

```json
"meta": { "targets": ["powerbi"] },
"fields": [ { "ref": "Angebote.€ Gewonne Angebote",
  "semantics": { "aggregation": "sum", "additive": true,
                 "timeField": "Angebote.Abschluss Datum",
                 "scenarios": { "PY": { "from": "sameperiod", "offset": "-1y" } } } },
  { "ref": "Angebote.Abschlussquote", "isNew": true,
  "semantics": { "aggregation": "ratio", "numerator": "Angebote.#Angebote gewonnen",
                 "denominator": "Angebote.# Anzahl Angebote", "additive": false } } ],
"filters": [ { "level": "report", "field": "Pipeline Status.Sort Order", "op": "=", "value": 0, "visible": false,
               "reason": "Angebote stapelt 7 Monats-Snapshots" } ],
"model": { "relationships": [ { "from": "Angebote.Vertriebler", "to": "Vertriebler.Vertriebler", "cardinality": "many-one" } ],
           "tables": [ { "name": "Angebote", "role": "fact" }, { "name": "📅Kalender", "role": "date" } ] },
"pages": [ { "name": "Übersicht",
  "behaviour": { "kpiSelector": "mk_94wviuj", "zoom": true, "filterChips": true,
                 "periodSwitch": ["fy", "ytd", "month"], "detailsPanel": { "field": "Forecast.Kunde" } },
  "layoutTree": { "split": "col", "children": [ { "size": 1, "node": { "split": "row", "minTile": 180 } } ] } } ],
"states": { "loading": "progress-per-query", "error": "retry", "noPriorYear": "VP" }
```

Im Tool wären das: im Steckbrief vier Felder (Aggregation, Zeitfeld, additiv, Szenario-Herleitung) unter einer Klappgruppe „Rechenlogik (für Apps und `te add`)"; im Zonen-Reiter der Abschnitt „Feste Filter"; im Seiten-Reiter eine Klappgruppe „Verhalten der Seite" mit fünf Kästchen; der Import liest `relationships.tmdl` mit. Wer nur Power BI baut, klappt nichts auf und bekommt dieselbe Spec wie heute. Der Skill `mockup-to-powerbi` gewinnt trotzdem: `filters[]` wird zum Berichtsfilter, `semantics` zum echten DAX in `model-todos.md`, `relationships` zur Warnung „Slicer auf Faktspalte". Ein zweiter Skill `mockup-to-fabric-app` könnte dann die Basis-App kopieren (so wie wir es in `05-agenten-workflow.md` ohnehin machen), `BRIEF.md` aus Spec und Brief erzeugen, `kpis.ts` aus `fields[].semantics`, `view.ts` aus `pages[].behaviour`, die Seiten aus `layoutTree` und `kind`, und die DAX-Abfragen aus `filters[]` plus den gebundenen Spalten.

**Was auf keinen Fall verloren gehen darf**

- Die Container-Geometrie mit Gewichten und der Zwang, dass jede Kachel in genau einem Slot liegt. Das ist der Unterschied zu Figma, und es ist zugleich das, was eine App als Grid braucht.
- Das Rollen-Vokabular (`category`, `ac`, `ref`, `fc`, `multiples`) und `scenario`. Es ist bereits zielneutral und deckt sich mit `scenPaint('AC' | 'PY' | 'FC')` in `notation.ts`.
- Der Analyse-Block mit Polarität, Δ-Basis, Sortierung, Top-N, Skalengruppe, Kernaussage. Für Power BI heute halb umsetzbar, für die App vollständig; er ist der wertvollste Teil der Spec.
- Stabile IDs und `specHash`. Zweiter Lauf als Delta ist für eine App mit drei parallelen Agenten noch wichtiger als für PBIR, weil Dateibesitz an Kachel-IDs hängt.
- Die Steckbriefe mit `confirmed`, Alias, DAX und Format-Klartext. Das ist der Datenvertrag in Vorform; die Rechenlogik aus Punkt 1 gehört genau dort hinein.
- `workshop.priority` und `status`, `issues[]` als Daten, nicht als Prosa, und die Beispielwerte (`samples`), die ich als Test-Fixture erster Näherung verwenden kann.
- Die Haltung „vorbereiten, Plan zeigen, warten". Agenten deployen bei uns nicht und fassen Git nicht an; ein App-Skill muss das übernehmen.

## 6 · Neue Fehler (nicht im Review vom 25.09.)

| ID | Beschreibung | Schwere | Repro | Beleg |
|---|---|---|---|---|
| F1 | Versteckte Spalten (`isHidden`) fehlen in Liste und Suche ohne jeden Hinweis; der Zähler am Tabellenkopf zählt sie mit („29≡", 17 sichtbar). Ein Jahr-Slicer auf `Kalender.Year` ist so nicht möglich. | mittel | Vertriebscontrolling-TMDL laden, „Year" suchen: kein Treffer. | `01-tmdl-ascii-geladen.png`, Ausgabe `s3.mjs` |
| F2 | Vorlage nach echtem Modellimport: alle Rollenbindungen der Vorlage werden verworfen, der Toast meldet nur „Vorlage gesetzt". Acht Kacheln mit roten Punkten, keine Erklärung. | niedrig | TMDL laden, Vorlagen → „Executive One-Pager". | `02-t2-vorlage-exec.png` |
| F3 | Filterpanel und Kachel-Chips zeigen bei gleichnamigen Spalten keine Tabelle; der Export trägt dann z. B. `Forecast.Vertriebler` als Slicer, ohne Warnung. Kein Bug im engen Sinn, aber ein stiller Modellfehler im Vertrag. | niedrig | Chip „Vertriebler" aus Tabelle Forecast aufs Panel ziehen. | `export/mockup-spec.json` (`zones.filter.slicers[0]`), `export/out/checklist.md` Zeile 104 |
| F4 | Einzeldatei-Import über den Datei-Dialog: Dateien mit Emoji im Namen kamen über Playwright nicht an. In einem echten Browser nicht geprüft, deshalb nur als Hinweis: ein Zähler „8 von 16 Dateien gelesen" im Toast würde so etwas sofort sichtbar machen, heute steht nur „8 Dateien". | nicht prüfbar | `page.setInputFiles` mit `📅Kalender.tmdl` | Ausgabe `s2.mjs` („names arrived") |

Konsolenfehler: nur ein 404 beim Laden (vermutlich Favicon), keine Seitenfehler in vier Sitzungen.

## 7 · Was gut ist

- Das Rollen-Vokabular und der Analyse-Block sind fast deckungsgleich mit unseren Props und `KpiDef`. Ich habe beim Vergleich mehr Übereinstimmung gefunden als erwartet; die Lücke liegt in der Datenschicht, nicht in der Darstellung.
- Der Steckbrief mit DAX, Format in Klartext, Alias, bestätigt, Owner und Anmerkung ist genau das Gespräch, das ich sonst in der Nacharbeit führe. Dass `expression` mit exportiert wird, erspart mir das Öffnen des Modells.
- Szenario-Wechsel korrigiert die gebundene Referenz und meldet den Widerspruch; Small Multiples und Beispielwerte sind in der Skizze sofort sichtbar.
- Export-Dialog, Validierung und Konverter sind ehrlich: leere pbir-Dateien werden erklärt, zwölf To-dos werden benannt statt still verschluckt. `plan.json` und `acceptance.json` sind ein brauchbares Muster für einen App-Skill.
- Klick-Fallback für die Feldzuweisung mit Rollenmenü, Esc, Tastatur. Hat in 30 Bindungen nie geraten.
- Dark Mode: keine Schalter-Attrappe mehr, sondern aus der Kachelfarbe abgeleitet, Skizzen und Export folgen.

## 8 · Noten

Bedienbarkeit: 7/10 · Nutzen für meine Rolle: 5/10 · Reife für Kunden: 6/10

Ich würde es morgen im Workshop einsetzen, um Layout, Kacheltypen, Polarität und Kernaussagen festzuzurren, und die Spec als Vorlage für `BRIEF.md` nehmen; eine App ableiten würde ich erst, wenn Rechenlogik je Kennzahl, feste Filter und Beziehungen in der Spec stehen, denn genau dort liegen die Fehler, die später teuer werden.
