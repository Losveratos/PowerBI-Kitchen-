# Agentic Engineer · Review MockupKitchen v0.5.4

## 1 · Wer ich bin und was ich damit vorhabe

Ich baue Pipelines, in denen Coding-Agenten (Claude Code, MCP-Server, CI-Jobs) aus Spezifikationen Software erzeugen, und ich bewerte ein Werkzeug danach, ob seine Ausgabe als Vertrag taugt: gleiche Eingabe, gleiche Ausgabe; stabile Schlüssel; ein zweiter Lauf ist ein Diff; alles Entscheidungsrelevante steht strukturiert und nicht in Prosa. MockupKitchen will genau das sein: ein Anforderungswerkzeug mit deterministischem Ausgang. Mein Anwendungsfall: Der Workshop liefert die Spec, ein Agent baut den Power-BI-Bericht, ein zweiter Agent später die Rayfin-App, und ein CI-Job prüft bei jedem Commit, ob Spec und Bau noch zusammenpassen. Meine Erwartung an v0.5.4: Spec und Konverter sind reif, das Delta-Versprechen ist eingelöst, und ich sehe, wo die Spec an Power BI klebt.

## 2 · Aufgaben und Verlauf

Alle Belege liegen unter `review/agentic-engineer/` (Skripte `01-build.mjs` bis `05-tmdl-dax.mjs`, Exporte `export*/`, Konverter-Ausgaben `out1/`, `outD/`, Diff-Helfer `specdiff.py`).

| # | Aufgabe | Ergebnis | Beleg | Anmerkung |
|---|---|---|---|---|
| 1 | Mockup mit zwei Seiten (Vorlage „Detailseite (Drill)" für Seite 2), Drill-Verknüpfung, offener Frage und Notiz an der Balken-Kachel, Berichtskopf | gelungen | `03-page2-drill.png`, `04-bars-link-openq.png`, `02-report-tab.png` | Link, offene Frage und Notiz landen korrekt in `links[]`, `workshop.openQuestion` und `notes`. |
| 2 | Zwei Slicer per Drag auf die Filterzone (DimDate.Year, DimRegion.Region) | teilweise | `05-slicers.png`, `01-slicers-added.png` | Erster Versuch scheiterte, weil die Tabellengruppen im Modell-Panel eingeklappt sind (Chip nicht sichtbar). Nach Aufklappen funktioniert der Drag. Für einen Agenten, der per Playwright bedient, ist das ein Stolperstein, kein Fehler. |
| 3 | Neues Feld „Auftragseingang" mit Beschreibung, Einheit und offener Frage anlegen und auf die KPI-Kachel „Umsatz" binden | gelungen | `06-newfield-dialog.png`, `07-rolemenu.png`, `08-newfield-bound.png` | Rollenmenü ist sauber. Aber: Die Kachel heißt weiter „Umsatz" und zeigt nun „Auftragseingang". Kein Hinweis, kein Issue. Siehe 4. |
| 4 | „Alle Dateien herunterladen", Prompt und pbir-Tab lesen | gelungen | `09-export-dialog.png`, `10-export-prompt.png`, `11-export-pbir.png`, `export1/` | 7 Downloads (Spec, Brief, Doku, 2 pbir, 2 PNG à 450 bis 500 KB). Beide pbir-Dateien sind `[]`, der Dialog erklärt das jetzt (B1 behoben). |
| 5 | `mockup_to_pbir.py <spec> --validate` und `--out out1 --plan --report Agent.Report` ohne PBIP | gelungen | `out1/` (33 Dateien), `plan.json`, `acceptance.json`, `checklist.md`, `model-todos.md`, `analysis-todos.md`, `navigation.md` | Läuft fehlerfrei, Ausgaben sind durchweg brauchbar. `model-todos.md` enthält die offene Frage und einen `te add`-Vorschlag mit Platzhalter-DAX. |
| 6 | Determinismus: zwei `buildSpec()`-Aufrufe ohne Änderung; Konverter zweimal auf dieselbe Spec | gelungen | Skript-Log `01-build.mjs` („TWO BUILDS identisch"), `diff -r out1 out1-again` | Spec bis auf `exportedAt` identisch. Konverter identisch bis auf `generated`-Zeitstempel und den `--out`-Pfad in `commands.md`/`plan.json`. |
| 7 | Round-Trip: `.mockup.json` speichern, frischer Browser, Datei öffnen, erneut exportieren | gelungen | `01-roundtrip-opened.png`, `export-rt/` | Hash `a765480e` vor und nach dem Round-Trip identisch, alle 11 `mk_`-IDs gleich. |
| 8 | Vier Minimaländerungen nacheinander exportieren und die Specs diffen: A Titel, B Workshop-Status, C Kachel am Rand von Seite 2, D Engine der Balken-Kachel auf Nativ | gelungen | `02-title-changed.png`, `02-page2-insert-edge.png`, `03-bars-native.png`, `export-A-title/` bis `export-D-native/`, `specdiff.py` | A: 5 Diffs, davon 2 Rauschen (`slug`, `layoutTree.leaf` tragen den Titel). B: Hash unverändert, nur `workshop.status`. C: 26 Diffs, IDs stabil, Rechtecke nur auf Seite 2, aber `issues[]` wird umsortiert (Rauschen). D: 5 Diffs, pbir-Datei enthält jetzt die Balken-Kachel. |
| 9 | „Stände vergleichen" im Tool: gespeicherte Datei gegen Stand nach A bis D | gelungen | `04-diff-dialog.png`, `diff-tool.txt` | 7 Änderungen in Fachsprache, Titel, Engine, Status, Rechtecke. Genau das, was ich als Agent bräuchte, nur gibt es das nicht außerhalb des Browsers. |
| 10 | Validator mit neun absichtlich kaputten Specs füttern | teilweise | Skript-Log (Abschnitt „negative tests"), `neg-*.json` | Erkannt: ungültige Engine, specVersion 4, fehlendes `rect`, doppelter Seitenname. Durchgewinkt: unbekannte Schlüssel, Link mit falscher `toPageId`, manipulierter Hash, Rechteck außerhalb des Inhaltsbereichs, unbekanntes Feld ohne `missing`-Flag. |
| 11 | Echtes Semantikmodell laden (16 TMDL-Dateien Vertriebscontrolling), Measure „€ Value Angebot YTD" binden, Steckbrief bestätigen, Spec prüfen | gelungen | `01-tmdl-loaded.png`, `03-tmdl-export.png`, `02-tmdl-bound.png`, `03-steckbrief.png`, `export-tmdl/spec-with-dax.json` | DAX, Anzeigeordner und Formatbeschreibung stehen in `fields[]`. Vorlagenfelder fehlen korrekt als `FIELD_NOT_IN_MODEL` (19 Fehler). `model.source` ist „TMDL (8 Dateien)", nicht der Modellname. „bestätigt" und Owner ändern den Hash (90b28f75 → fd14e797). |
| 12 | Testsuite des Skills laufen lassen | gelungen | `tests/run_tests.py`: 426 Prüfungen, 426 ok | Golden Files für v1 bis v3 plus kaputte und zukünftige Spec sind da. Gut. |

Konsolenfehler: nur ein 404 auf `favicon.ico` in jeder Sitzung. Sonst nichts.

## 3 · Was mir fehlt (Top 5, nach Wichtigkeit)

**1. Spec-zu-Spec-Diff als CLI, und ein Plan, der nur das Delta enthält.**
Was: `mockup_diff.py alt.json neu.json --json` liefert je `stableId` hinzugefügt, entfernt, verschoben, umgebunden, umbenannt, Engine gewechselt, Seite gewechselt. `mockup_to_pbir.py --since alt.json` erzeugt daraus einen `plan.json`, der nur betroffene Schritte enthält.
Warum: Heute heißt „zweiter Lauf ist ein Delta": gleiche Visualnamen plus `delta-batch.json`, das alle Kacheln und alle Chrome-Shapes jeder Seite neu positioniert (20 Operationen für eine unveränderte Seite, `continue_on_error: true`). Das ist Idempotenz durch Überschreiben, kein Delta. Der Agent erfährt nicht, was sich geändert hat, und muss `pbir ls` lesen und raten. Die Logik existiert bereits in `diff.js` (reine Funktionen, Node-testbar), nur im Browser.
Wie: `diff.js` nach Python portieren oder als Node-CLI aufrufen; `plan.json` bekommt je Schritt ein Feld `reason: unchanged | added | moved | rebound`, unveränderte Schritte sind `skip`.
Aufwand: mittel. Bezug: beiden.

**2. Headless-Export: von `.mockup.json` zur `mockup-spec.json` ohne Browser.**
Was: `node assets/mockup/export-cli.mjs stand.mockup.json --out mockup-spec.json` (plus Brief und Doku).
Warum: Der Arbeitsstand ist `.mockup.json`, der Vertrag ist `mockup-spec.json`, und die Übersetzung lebt nur in `export.js` mit `window.MK` und `document`. In einer CI-Pipeline, in der ein Agent ein Mockup verändert oder prüft, kann niemand den Vertrag erzeugen. Konzept KONZEPT-LIVE will später sogar, dass das Kitchen selbst die Spec schreibt; solange das nur im Browser geht, bleibt die Spec ein Artefakt des Klicks.
Wie: `buildSpec` von `MK.state`, `MK.zones`, `MK.computeAll` entkoppeln (Zustand und Geometrie als Parameter), ein dünner Node-Einstieg. `gridcheck.js` und `diff.js` zeigen, dass der Stil im Projekt schon da ist.
Aufwand: mittel. Bezug: beiden.

**3. Ein Hash, der nachgerechnet werden kann, und ein Validator, der ihn prüft.**
Was: Kanonisierung dokumentieren (welche Schlüssel, welche Reihenfolge, FNV-1a über welchen String), `mockup_spec.spec_hash()` rechnet dasselbe wie `export.js`, `--validate` meldet „Hash passt nicht zum Inhalt".
Warum: Heute liefert Python für dieselbe Spec einen anderen Hash als das Tool (a765480e gegen c87bbea7, für alle vier geprüften Specs). Ein von Hand geänderter Hash geht durch `--validate` („Spec in Ordnung … Hash deadbeef"). Der Skill vergleicht beim Delta-Lauf den Hash aus der Report-Annotation mit `meta.specHash` und sagt „gleicher Hash = nichts zu tun". Wer die Spec von Hand nachbessert (der Skill erlaubt das ausdrücklich, etwa `navOn`), bekommt beim nächsten Lauf still einen übersprungenen Bau.
Wie: eine Kanonisierungsfunktion, in JS und Python identisch, mit Testvektor im Repo. Und die Grenze des Hash-Kerns klären: `fields[]` mit Owner, Alias und „bestätigt" zählt heute in den Hash, `workshop.status` nicht. Beides ist Doku-Ebene. Entweder zwei Hashes (`buildHash`, `docHash`) oder die Steckbrief-Felder aus dem Kern nehmen.
Aufwand: klein bis mittel. Bezug: beiden.

**4. Schichtung der Spec: Inhalt, Layout, Interaktion, Design, Ziel-Projektion.**
Was: `meta.skill: "mockup-to-powerbi"`, `native.buckets`, `chartKitchenType/Mode`, `customVisual.guid`, `slicers[].type` mit Power-BI-Slicer-Modi, `links[].kind: drillthrough` und die pbir-Dateien sind Power-BI-Projektionen. Sie gehören in einen eigenen Block `targets.powerbi` (oder in die Konverter-Ausgabe), nicht neben `roles` und `analysis`.
Warum: Siehe Abschnitt 5. Ohne diese Trennung wird jeder zweite Zielgenerator die Power-BI-Felder ignorieren müssen und trotzdem an ihnen hängen (Issue-Codes `NO_NATIVE`, `CK_NO_MODE` sind heute Fehler, für eine React-App bedeutungslos).
Wie: specVersion 4 mit `content`, `layout`, `interaction`, `design`, `targets`. v3 wird vom Konverter weiter gelesen, wie heute v1 und v2.
Aufwand: groß. Bezug: hilft Rayfin, schadet Power BI nicht.

**5. Vollständigkeit und Eindeutigkeit absichern: Entscheidung oder Vorschlag, und Widersprüche melden.**
Was: (a) Jede Analyse-Angabe trägt ihre Herkunft: `decided | auto | template`. Heute gibt es `polarityAuto` und `deltaBasisAuto`, aber `sort: {by: delta}` aus der Vorlage kommt als Entscheidung an, während die Notiz derselben Kachel sagt „Sortierung nach Δ oder AC? Fachbereich entscheidet." Der Brief druckt beides ohne Hinweis. (b) Issue `TITLE_FIELD_MISMATCH`, wenn der Titel eine andere Kennzahl nennt als die gebundene (Aufgabe 3). (c) Validator-Lücken aus Aufgabe 10: `toPageId` gegen `pages[].id` prüfen (heute nur Name), Rechtecke gegen `contentRect` und Überlappung, Tabellen der `ref`s gegen `model.tables`, unbekannte Schlüssel in `analysis`, `workshop`, `interaction` ablehnen oder warnen.
Warum: Ein Agent nimmt strukturierte Werte als Entscheidung. Wenn Prosa und Struktur sich widersprechen, baut er die Struktur und übergeht die Frage.
Wie: `analysis.sortSource`, oder allgemein `analysis.decided: ["sort", "topN"]`; die Validatorregeln sind je fünf bis zehn Zeilen in `structural_errors()`.
Aufwand: klein. Bezug: beiden.

## 4 · Wo das Erlebnis besser sein kann

- **Rauschen im Diff zweier Specs.** Ein Titelwechsel ändert `slug` und `layoutTree.leaf` mit (`export-A-title`), eine neue leere Kachel sortiert `issues[]` um (`export-C-layout`: Einträge 2 bis 4 tauschen die Plätze). Vorschlag: `layoutTree` nur mit `stableId`, `issues[]` stabil sortieren (Seitenindex, Visual-ID, Code), `slug` aus dem Brief, nicht aus der Spec.
- **„Delta" heißt im Konverter nicht Delta.** `delta-batch.json` für die unveränderte Seite „Übersicht" hat 20 Operationen, und `plan.json` unterscheidet nach Änderung D nur die Zähler (`visuals: 0 → 1`). Vorschlag: siehe 3.1; mindestens den Hinweis im Skill ehrlich formulieren: „zweiter Lauf = alles neu setzen, Namen bleiben".
- **Sieben Downloads für einen Vertrag.** Spec plus Brief plus Doku plus je Seite pbir plus PNG; das PNG ist mit 500 KB die größte Datei und für den Agenten die wertloseste. Der Konverter erzeugt die pbir-Dateien ohnehin neu. Vorschlag: Standard „nur mockup-spec.json", der Rest als Option (ZIP ist als Wunsch schon bekannt, hier geht es um die Vorgabe).
- **Steckbrief bestätigen ändert den Bau-Hash.** `fields[]` liegt im Hash-Kern. Wer nach dem Bau im Workshop drei Definitionen als bestätigt abhakt, löst beim Agenten einen Delta-Lauf aus, obwohl sich nichts am Bericht ändert. Vorschlag: siehe 3.3.
- **`model.source` nennt die Datei-Art, nicht das Modell.** „TMDL (8 Dateien)" steht in Spec, Plan und `te validate -m "TMDL (8 Dateien)"` in `plan.json` Schritt `verify`. Der generierte Befehl kann so nicht laufen. Vorschlag: Modellname aus `model.tmdl` oder aus dem Ordnernamen `*.SemanticModel`, sonst Platzhalter `<Modell>` mit Hinweis.
- **Vorlagen bringen Platzhalter-DAX.** `model-todos.md` schlägt `SUM( <Tabelle>[<Spalte>] )` vor. Als Agent würde ich lieber keinen Vorschlag sehen als einen, der aussieht wie einer. Vorschlag: `te add` nur erzeugen, wenn `newFields[].expression` gesetzt ist; sonst nur die Beschreibung und die offene Frage.
- **Der Modell-Chip ist nicht erreichbar, solange die Gruppe zu ist.** Für Menschen ein Klick, für Playwright ein Timeout (Aufgabe 2). Vorschlag: Suche im Feld „Feld suchen" klappt Treffer automatisch auf (tut sie), das sollte die Hilfe nennen; außerdem `scrollIntoView` beim Fokus eines Chips.
- **`claude-prompt.txt` nennt weder Projektpfad noch Report-Name.** Der Agent muss nachfragen. Vorschlag: zwei Platzhalter `<PBIP-Ordner>` und `<Name>.Report` im Prompt, die der Mensch vor dem Absenden füllt, oder im Bericht-Tab abfragen.
- **Versionierung des Formats.** `specVersion: 3` deckt 0.3 bis 0.5.4 ab, alle Erweiterungen sind nur über `meta.version` und die Prosa in `spec-format.md` nachvollziehbar. Das Schema hat eine `$id` für v3, aber keine Minor-Angabe. Vorschlag: `meta.specVersion: "3.6"` oder `meta.features: ["interaction", "typography", "dax"]`, damit ein Leser prüfen kann, ob er alles versteht.

## 5 · Zusammenführung mit Fabric Apps / Rayfin

**Was heute Power-BI-spezifisch in der Spec steht.** `meta.skill`, `visuals[].native {type, buckets}` (pbir-Datenrollen), `chartKitchenType`, `chartKitchenMode`, `customVisual.guid`, `zones.filter.slicers[].type` (Slicer-Modi von Power BI), `zones.filter.bookmarks`, `links[].kind: drillthrough` (ein Power-BI-Mechanismus, in der App ist es „Details auf Anfrage" im Seitenpanel), `interaction.crossFilter`, die Issue-Codes `NO_NATIVE`, `CK_NO_MODE`, `NAV_OVERFLOW`, die Pixelmaße in `rect`, `zones`, `spacing`, `design.cornerRadius` (mit `uiScale` vorgerechnet), `design.typography` in px bei 1280 Basis, die pbir-Dateien und der ganze Konverter-Pfad.

**Was schon zielneutral ist und nicht verloren gehen darf.** `report` (Zielgruppe, Ziel, Entscheidung), `pages[].question`, `visuals[].kind` als Katalogtyp mit semantischen Rollen (`category`, `ac`, `ref`, `fc`, `indicator`, `goal`), `scenario`, `analysis` (Polarität, Δ-Basis, Sortierung, Top-N, Einheit, Kernaussage, Small Multiples, Feldparameter), `workshop`, `fields[]` mit DAX, Format, Alias, Owner, „bestätigt", `newFields` mit offener Frage, `layoutTree` mit Spurgewichten (für Power BI „nur zur Orientierung", für eine React-App die eigentliche Wahrheit), `samples`, `content`, `links` als semantischer Sprung, `design.colors`, `varianceColors`, die `A11Y_*`-Befunde, die stabilen IDs und die Issues als Daten.

**Was eine Rayfin-App zusätzlich braucht** (aus den fünf Apps und den Learnings abgelesen):
- **KPI-Katalog statt nur gebundener Felder.** `kpis.ts` in der Sales-App hat je Kennzahl `unit`, `higherBetter`, `additive`, `info`, `warning`. Die Spec hat Polarität nur je Kachel, Einheit als Freitext, „additiv" gar nicht. Die Learnings sagen: Brücken nur für additive KPIs. Das gehört an die Kennzahl (`fields[].additive`, `fields[].unit` als Enum), nicht an die Kachel.
- **Periodenlogik und Szenario-Verfügbarkeit.** Die App kennt `fy | ytd | month`, „letzter abgeschlossener Monat", VP statt PY, wenn es kein Vorjahr gibt. Die Spec kennt `scenario: AC/PL` je Kachel und `timeGrain`, aber keinen Berichtszeitraum und keine Aussage, welche Szenarien das Modell liefert.
- **View-State.** `view.ts` legt fest, was im URL-Hash liegt: Seite, Jahr, Periode, KPI, Strukturdimension, Chart-Variante, Small Multiples an oder aus, Filter, Panel offen. Das ist die Interaktionsschicht, die Power BI implizit hat (Slicer, Bookmarks) und eine App explizit braucht. In der Spec müsste stehen: welche Filter global sind, welche Varianten eine Kachel anbietet (`timeVariant`), was beim Zoom passiert (Small Multiples ja/nein, Skala gemeinsam/eigen).
- **Datenzugriff.** Die Apps laden zwei bis drei DAX-Abfragen auf feinem Korn und rechnen im Browser. Die Spec sagt nur `model.tables` (Namen) und die gebundenen Felder; Spalten, Beziehungen und Schlüssel des Modells, die der TMDL-Import kennt, fallen beim Export weg. Für `mockup-to-fabric-app` reicht das nicht, um die Query zu schreiben. Vorschlag: `model.schema` optional mit Spalten, Typen und Beziehungen aus dem TMDL (ist im Zustand schon da).
- **Responsives Layout.** `rect` in px bei 1920 × 1080 taugt für PBIR, nicht für Tailwind. `layoutTree` mit Gewichten plus `spacing.base` und Mindestgrößen je Kacheltyp ist die portable Form. Die Spec sollte `layoutTree` zur Wahrheit erklären und `rect` zur Projektion.

**Zielbild: fünf Ebenen in einer Spec (specVersion 4).**
1. `content`: Bericht, Seiten mit Frage, Kacheln mit `kind`, Rollen, Szenario, `analysis`, `content`, Kennzahl-Katalog (`fields` mit DAX, Einheit, Polarität, additiv, bestätigt), neue Felder, Modell-Schema.
2. `layout`: je Seite ein Baum oder Raster mit Gewichten, Zonen als logische Slots (`header`, `nav`, `filter`, `footer`) mit relativen Maßen, Mindestgrößen, Lesereihenfolge.
3. `interaction`: globale Filter (Dimension, Art, Vorauswahl), Sprünge (`from`, `to`, `carry: [field]`, `mode: detail | navigate`), je Kachel Varianten, Zoomverhalten, Cross-Filter, Kernaussage als Regel statt Text.
4. `design`: Tokens (Farben, Varianzpalette, Typografie-Skala, Ecken, Dichte) ohne px, mit Dark-Mode-Paar; Power BI rechnet daraus pt und px, Tailwind daraus Klassen.
5. `targets`: je Ziel die Projektion, erzeugt vom Konverter, nicht vom Tool: `targets.powerbi` (pbir-Buckets, ChartKitchen-Modus, Custom-Visual-GUID, Slicer-Modus, Bookmarks, Canvas-px), `targets.fabricApp` (Komponente je `kind`, Query-Vorlage je Kachel, Route je Seite, View-State-Felder).

**Wie die drei Teile andocken.** Das Kitchen schreibt Ebenen 1 bis 4 und berechnet Ebene 5 für Power BI nur noch zur Vorschau (CK/PBI-Badge, pbir-Zähler). `mockup-to-powerbi` nimmt die Spec, erzeugt `targets.powerbi` selbst (hat es im Konverter ohnehin: `bucketsFor`, `filter_layout`, `SLICER_FORMAT`) und baut wie heute. `mockup-to-fabric-app` nimmt dieselbe Spec, mappt `kind` auf die bestehenden Komponenten (`VarIntChart`, `StructureBridge`, `SmallMultiples`, `DriverTree`, `KpiCards`, `Tile`, `FilterPanel`), `layout` auf das Kachelraster, `interaction` auf `View`, `fields` auf `KpiDef`, und schreibt daraus `BRIEF.md` plus Dateibesitz je Agent, so wie es `05-agenten-workflow.md` beschreibt. Der Rückkanal (`agent-status.json` aus KONZEPT-LIVE) braucht dafür ein Schema mit `stableId`, `target`, `state`, `appliedHash`, damit beide Ziele in dasselbe Kitchen zurückmelden können. Was dabei nicht verloren gehen darf: die stabilen IDs, die Issues als Daten, die Workshop-Ebene (Prio, Status, offene Frage) und das Prinzip „Vorschlag ist nicht Entscheidung".

## 6 · Neue Fehler (nicht im Review vom 25.09.)

| ID | Beschreibung | Schwere | Repro | Beleg |
|---|---|---|---|---|
| N1 | `--validate` akzeptiert eine Spec, deren `links[].toPageId` keine Seite ist; geprüft wird nur `toPage` (Name). Der Konverter baut den Drill-through dann nach Name, und ein Agent, der über IDs geht, läuft ins Leere. | mittel | `export1/mockup-spec.json` kopieren, `links[0].toPageId` auf `gibtsnicht` setzen, `--validate` → „Spec in Ordnung". | Skript-Log 01, Datei `neg-link-ins-leere.json` |
| N2 | `meta.specHash` wird nirgends nachgerechnet. `mockup_spec.spec_hash()` liefert für dieselbe v3-Spec einen anderen Wert als das Tool; ein manipulierter Hash geht durch `--validate`. Der Delta-Lauf im Skill stützt sich auf diesen Hash. | mittel | `python3 -c "import mockup_spec as m; m.spec_hash(spec)"` gegen `meta.specHash` (a765480e vs c87bbea7); `neg-hash-manipuliert.json` mit `--validate`. | Skript-Log, Abschnitt „python hash vs tool hash" |
| N3 | `plan.json` Schritt `verify` schreibt `te validate -m "TMDL (8 Dateien)" --errors-only`, weil `model.source` nach TMDL-Einzelimport die Datei-Art statt des Modellnamens trägt (bei neuen Feldern landet derselbe Name in `model-todos.md`). Der Befehl kann so nicht laufen. (4.6 im Review vom 25.09. nannte „tables" beim Ordnerimport; Einzeldateien sind neu.) | niedrig | 16 TMDL-Dateien per „TMDL laden" (Einzeldateien) wählen, exportieren, Konverter mit `--plan`. | `export-tmdl/mockup-spec.json`, `03-tmdl-export.png` |
| N4 | `--validate` lässt Rechtecke außerhalb des `contentRect` und Überlappungen durch (Visual auf 10/10/500/500 bei Inhaltsbereich ab 24/108). Der Fehler fällt erst bei `pbir validate` nach dem Schreiben auf. | niedrig | `neg-rect-ueberlappt-ausserhalb.json` mit `--validate`. | Skript-Log |
| N5 | Unbekannte Schlüssel (`analysis.foo`, `visuals[].unbekannt`) werden ohne Hinweis akzeptiert; ein Tippfehler in einem optionalen Schlüssel (`smallMultiple`) wirkt wie „nicht gesetzt". | niedrig | `neg-unbekannter-schluessel.json` mit `--validate`. | Skript-Log |

## 7 · Was gut ist

- Der Round-Trip ist sauber: `.mockup.json` speichern, frisch öffnen, exportieren, gleicher Hash, gleiche IDs. Zwei Exporte ohne Änderung sind bis auf den Zeitstempel byte-gleich. Der Konverter ist deterministisch. Das ist die Grundlage, und sie steht.
- Stabile `mk_`-IDs halten, was sie versprechen: Titelwechsel, Engine-Wechsel, Statuswechsel, Kachel am Rand einfügen, nichts davon ändert eine ID.
- Der Validator bricht mit Feldpfad ab, nicht mit Traceback, und eine Spec-Version 4 wird abgelehnt statt geraten. Die 426 Golden-Tests laufen in Sekunden.
- `plan.json` mit `idempotent` und `delta` je Schritt, `acceptance.json` mit Toleranz, `mockup_verify.py`: Die Abnahme ist eine Zahl. Genau so will ich das.
- Der TMDL-Import bringt DAX, Anzeigeordner und Format in Klartext in die Spec; der Steckbrief trennt Modellwissen von Workshop-Aussage. „Fehlt im Modell" ist nach dem Neuimport sofort rot und im Export ein Fehler (B3 ist wirklich behoben).
- Der AGENT-BRIEF ist kein Prosa-Brief, sondern ein strukturiertes Dokument mit IDs, Rechtecken, Rollen, Buckets, Analyse und Regeln. Als Kontext für ein Modell ist er gut lesbar. Was fehlt, sind Akzeptanzkriterien im Brief selbst (sie liegen in `acceptance.json`) und ein Block „Vor dem Bau klären" statt der Liste am Ende.
- „Stände vergleichen" spricht Fachsprache und trifft exakt die sieben Änderungen, die ich gemacht habe.

## 8 · Noten

Bedienbarkeit: 7/10 · Nutzen für meine Rolle: 8/10 · Reife für Kunden: 6/10

Ich würde es morgen für den Power-BI-Pfad einsetzen, unter der Bedingung, dass der Hash nachrechenbar wird und der Konverter mir das Delta zwischen zwei Specs nennt; für den Rayfin-Pfad erst nach der Schichtung der Spec in Inhalt, Layout, Interaktion, Design und Ziel-Projektion.
