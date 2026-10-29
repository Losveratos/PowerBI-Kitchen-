# Power-BI-Trainer und Community-Mitglied · Review MockupKitchen v0.5.4

## 1 · Wer ich bin und was ich damit vorhabe

Ich gebe Schulungen zu Reporting-Design und Power BI (Inhouse, User Group, gelegentlich YouTube), meist 90 Minuten bis ein Tag, oft gemischt deutsch und englisch. Ich will MockupKitchen in zwei Rollen einsetzen: als Übungswerkzeug, mit dem Teilnehmende in einer Session eine Berichtsseite skizzieren und das Ergebnis mitnehmen, und als Community-Projekt, zu dem ich Vorlagen, Übersetzungen und vielleicht einen Kacheltyp beitrage. Meine Erwartung: Das Tool erklärt seine drei Kernideen selbst (Container-Raster, Datenrollen mit Szenario-Notation, Spec als Übergabe), ich kann eigene Schulungsvorlagen anlegen, ohne JavaScript anzufassen, und die englische Fassung trägt eine komplette Aufgabe ohne deutsche Reste. Dazu will ich wissen, wie sauber Katalog, Skizzen und Spec geschnitten sind, weil später eine Fabric-App-Laufzeit dieselben Teile nutzen soll.

Belege liegen unter `review/trainer-community/` (Screenshots `01` bis `32`, Logs `t*-log.txt`, Export-Texte `export-en-*.txt`, Downloads `dl-en/`).

## 2 · Aufgaben und Verlauf

| # | Aufgabe | Ergebnis | Beleg | Anmerkung |
|---|---|---|---|---|
| 1 | Erststart ohne Anleitung: Verstehe ich in zwei Minuten, was das Tool tut und was herauskommt? | teilweise | 01-erststart.png, t1-log.txt | Demo-Bericht und ein sechsschrittiger Schnellstart rechts sind gut. Keine Erststart-Karte, keine Tour. 9 von 37 sichtbaren Buttons haben keinen Tooltip, darunter ausgerechnet „Export für Claude Code", „+ Seite", „+ Kennzahl / Dimension" und die fünf Inspector-Reiter. |
| 2 | Hilfe lesen und prüfen, ob sie die drei Kernkonzepte erklärt (Raster, Datenrollen und Szenarien, Spec) | teilweise | 02-hilfe-oben.png, 03-hilfe-unten.png, help-de.txt | Sechs Abschnitte plus Tastatur, 2.400 Zeichen. Raster, Modell und Export sind erklärt. Nicht erklärt: was eine Datenrolle ist, was AC/PY/PL/FC bedeutet, was die Engines CK, Nativ und Deneb unterscheidet, was der Analyse-Block (Polarität, Δ-Basis, Skalengruppe) bewirkt, was die Badges CK/PBI/M/S/? heißen. Die Tastaturliste nennt N und P nicht. Keine Links, kein Glossar. |
| 3 | Vorlagen-Galerie als Schulungsmaterial: zehn Vorlagen durchsehen, eine anwenden | gelungen | 04-vorlagen.png | Jede Vorlage hat Vorschau, Name und eine ehrliche Beschreibung, der Wechsel fragt nach und nennt Strg+Z. Für einen Kurs „IBCS-Seite in 20 Minuten" reicht das als Startpunkt. Vorschau-Labels sind abgeschnitten (bekannt, 4.4). |
| 4 | Visual-Katalog: einen Typ finden und entscheiden, wann ich ihn nehme | teilweise | 05-katalog.png, t1-log.txt | 51 Typen in 6 Gruppen, Suche findet „Kreis" und „pie" gleichermaßen (gut, zweisprachige Suche). Nur etwa die Hälfte der Typen hat einen Erklärtext, und bei den IBCS-Kerntypen (Säulen, Kombi, Brücke, Balken) steht nichts. Ein „wann nehme ich was" fehlt, die Anti-Pattern-Hinweise (Kreis, Tacho, Fläche) sind dagegen vorbildlich. |
| 5 | Schulungsübung: „Leer (2×2)", HR-Demo laden, „Headcount" per Drag auf eine Kachel, zweite Kachel per Klick-Fallback | gelungen | 06 bis 09, 07-modell-offen.png, 08-rollenmenue.png | Rollenmenü fragt „Kennzahl" oder „Ziel / Referenz" statt zu raten, der Klick-Fallback (Kachel wählen, Chip klicken) funktioniert genauso. Beides lässt sich am Beamer zeigen. Störend im HR-Kontext: Die Skizze zeigt „Headcount 281,1 M" und „ΔPL +13 · +5 %", obwohl keine Referenz gebunden ist (Beispielwerte, bekannt 4.2). |
| 6 | Analyse-Block verstehen: Polarität, Δ-Basis, Gemeinsame Skala, Kernaussage | teilweise | 10-inspector-alles-offen.png, 11-inspector-analyse.png, inspector-kpi.txt | Alle 14 Felder des Blocks sind ohne Tooltip. „Polarität auto (größer = bes…" wird abgeschnitten. Ein Teilnehmer, der IBCS nicht kennt, weiß hier nicht, was „Δ-Basis" oder „Skalengruppe" ist, und ich kann nicht auf ein Glossar zeigen. Der Hinweis „wandert in die Spec" ist gut, weil er den Zweck nennt. |
| 7 | Lehrmoment Anti-Pattern: Kachel auf „Kreis (nativ)" umstellen | gelungen | 13-kreis-antipattern.png | Badge „!", roter Schraffur-Überzug, Hinweis im Katalog und im Panel „Anteile lassen sich als Balken besser vergleichen". Genau das zeige ich in jeder Schulung. |
| 8 | Präsentationsmodus für die Besprechung im Kurs | teilweise | 14-praesentieren.png | Panels weg, Zoom hoch. Topbar, Seitentabs mit Lösch-x und Zoomleiste bleiben, kein Vollbild, Pfeiltasten wechseln keine Seite (alles bekannt, 4.10). |
| 9 | Komplette Aufgabe auf Englisch: EN, „+ New", Vorlage „Executive one-pager", Berichtskopf, Seite umbenennen, Hilfe, Katalog, Export, alle Dateien laden | gelungen | 15 bis 21, export-en-*.txt, dl-en/page-1-overview.png, t3-log.txt | Ein Wortfilter (Umlaute, ß, T€, Mio., Tsd., 30 deutsche Wörter) fand in Canvas, Inspector, Berichtskopf, Hilfe, Katalog, Spec, AGENT-BRIEF, WORKSHOP-DOKU, Prompt und im PNG keinen deutschen Rest. Demo-Measures heißen Revenue, Margin%, Customers. Einziger Rest: der Dateiname „WORKSHOP-DOKU.md" (bekannt, 4.11). Für internationale Schulungen ist die EN-Fassung einsetzbar. |
| 10 | Eigene Schulungsvorlage ohne Programmierung anlegen | gescheitert | 22-eigene-vorlage.png, 23-oeffnen-dialog.png, 24-seite-tab.png, t4-log.txt | Es gibt keinen Weg in der Oberfläche. Über die Konsole (`MK_CATALOG.templates.push({...})`) erscheint eine Vorlage sofort in der Galerie und bindet Felder korrekt (Beleg 22), sie überlebt aber kein Neuladen. Workaround: `.mockup.json` speichern und öffnen, das ersetzt aber den ganzen Bericht, und „Seite duplizieren" hilft nur innerhalb eines Berichts. |
| 11 | Echtes Modell laden (Vertriebscontrolling, 16 TMDL-Dateien) und den Steckbrief eines Measures mit DAX öffnen | gelungen | 31-tmdl-ascii.png, 32-steckbrief-dax.png, t6-log.txt | 16 Tabellen, 29 Measures, 86 Spalten. Steckbrief zeigt DAX, Anzeigeordner und die Formatbeschreibung, dazu Alias, Owner, Quelle, Ziel. Gebundene Demo-Felder stehen rot unter „Fehlt im Modell" (B3-Fix wirkt). Die zwei Calculation Groups erscheinen als Tabellen mit zwei Spalten, ihre 11 bzw. 4 Calculation Items fehlen ohne Hinweis (Fehler F1). Der Ordner-Upload (webkitdirectory) ließ sich per Playwright nicht auslösen, deshalb nicht prüfbar; Einzeldateien gingen. |
| 12 | Mitwirken: Node-Tests laufen lassen, Skizzen-Testblatt öffnen, Doku und Lizenz lesen, einen neuen Kacheltyp gedanklich durchspielen | teilweise | 28-sketches-test.png, 29-render-test.png | `a11y-test.js` 30/30, `diff-test.js` 44/44, Skizzen-Testblatt „53 Typen · alle sauber", `render-test.html` ist ein Klick-Test. MIT-Lizenz im Repo-Root. Aber: kein `package.json`, kein `npm test`, kein CONTRIBUTING, kein Test für `gridcheck.js` und `export.js`, kein Schema-Check des Live-Exports, README-Überschrift „Bauplan (v0.4)" bei Stand 0.5.4, Cache-Buster `?v=20261001a` von Hand in elf Script-Tags, keine Git-Tags. Details in Abschnitt 5. |

Zusammen: 5 gelungen, 6 teilweise, 1 gescheitert. Etwa 55 Browser-Schritte in sechs Skripten (`t1` bis `t7.mjs`).

## 3 · Was mir fehlt (Top 5, nach Wichtigkeit)

**1. Glossar und Tooltips für das Fachvokabular**
Was: Jede Beschriftung im Analyse-Block, in den Datenrollen und an den Badges bekommt einen Tooltip mit einem Satz, dazu ein Hilfe-Abschnitt „Begriffe" (Datenrolle, Szenario AC/PY/PL/FC/BU, Δ-Basis, Δ-Art, Polarität, Skalengruppe, Kernaussage, Engine CK/Nativ/Deneb/Custom, Badges CK/PBI/CV/M/S/?/!).
Warum: In einer 90-Minuten-Schulung erkläre ich drei Konzepte: das Container-Raster, die Datenrollen mit Szenario-Notation, die Spec als Übergabe. Das Raster und die Spec erklärt das Tool selbst (Hilfe 3 und 6, Schnellstart rechts). Die Datenrollen und die Notation erklärt es nicht, und genau da kommen die Fragen. Heute brauche ich dafür ein eigenes Handout oder ein Video.
Wie: `title`-Attribute über die bestehenden `data-i18n-title`-Keys, ein siebter Hilfe-Abschnitt, in der Hilfe ein Link auf die ChartKitchen-Doku (liegt im selben Repo) und den Skill.
Aufwand: klein. Bezug: beiden (Vokabular ist für Power BI und Rayfin dasselbe).

**2. Eigene Vorlagen ohne Code**
Was: „Aktuelle Seite als Vorlage speichern" (Name, Beschreibung, automatische Vorschau), Ablage in localStorage, Export und Import als `*.templates.json`, Anzeige in der Galerie unter „Eigene".
Warum: Jede Schulung hat ihre Übungsseiten (Aufgabe leer, Lösung gefüllt). Beleg 22 zeigt, dass die Datenstruktur das schon kann: Ein Baum aus `col/row/leaf` mit `roleRefs` als `Tabelle.Feld` ist genau das, was ein Trainer tippen würde. Es fehlt nur die Oberfläche und die Persistenz.
Wie: Der Seiten-Baum ist bereits serialisierbar (`.mockup.json`); eine Vorlage ist der `layout`-Knoten einer Seite plus Name. Beim Anwenden Feldreferenzen wie heute gegen das Modell auflösen.
Aufwand: mittel. Bezug: beiden (ein Vorlagenpaket „Monitoring, Monatsreport, Sales" ist auch die Seitenbibliothek einer App).

**3. Geführter Einstieg und Übungsmodus**
Was: Eine wegklickbare Erststart-Karte mit drei Schritten und den Knöpfen „Demo ansehen", „Leer starten", „Beispiel-Export ansehen". Dazu ein Ordner `examples/` mit zwei bis drei Übungen als `.mockup.json` (Aufgabe und Lösung) und einem fertigen Exportpaket zum Anschauen.
Warum: Teilnehmende öffnen den Link vor dem Kurs. Heute landen sie in einem dichten Editor mit drei Panels und einem Demo-Bericht, dessen Zweck nur im Export-Button steht. Die bisherigen Reviews haben das als „Onboarding" notiert, ich sehe es als Voraussetzung, das Tool überhaupt als Selbstlernmaterial zu verlinken.
Wie: Karte als eigener Dialog, Status in localStorage, Beispiele per „Öffnen" ladbar oder als Links in der Hilfe.
Aufwand: mittel. Bezug: keinem direkt, aber für die Verbreitung beider Ausgänge entscheidend.

**4. Ein stimmiger Beispiel-Datensatz je Demo-Modell**
Was: Feste, plausible Beispielwerte je Demo-Modell und Kennzahl (Headcount 1.240, FTE 1.087,5, Krankenquote 4,2 %), Kategorien aus der gebundenen Dimension, Δ nur, wenn eine Referenz gebunden ist.
Warum: „Headcount 281,1 M" und ein Kreis mit „Nord/Süd/Ost/West" für FTE (Belege 09, 13) kosten mich im Kurs jedes Mal zwei Minuten Erklärung, warum die Zahlen Platzhalter sind. Das Feld „Beispielwerte" im Kachelfenster löst das nur je Kachel und nur, wenn man es findet.
Wie: `samples` je Demo-Measure im Katalog hinterlegen (`demoModel()` kennt die Measures schon), `MK_SKETCH` bekommt sie wie heute `cats/values/refValues`.
Aufwand: mittel. Bezug: beiden (dieselben Fixture-Werte können in den Rayfin-Specs als Testdaten dienen, so wie es `test/sales-fixture.tsx` heute mit echten Exporten tut).

**5. Ein Mitwirken-Paket**
Was: `CONTRIBUTING.md` (Ablauf, Stil, welche Dateien bei einem neuen Typ, einer Vorlage und einer Übersetzung anzufassen sind), `package.json` mit `npm test`, das `a11y-test.js`, `diff-test.js`, die Skizzen-Matrix headless, einen EN-Lint und den Schema-Check `mockup_to_pbir.py --validate` gegen einen frischen Export ausführt, ein Skript, das `MK_VERSION` und den Cache-Buster in `mockup-kitchen.html` gemeinsam setzt, Git-Tags je Release.
Warum: Heute weiß ein Beitragender nicht, wie man testet, was ein Release ist und ob ein neuer Typ an fünf Stellen (`catalog.js`, `sketches.js`, `i18n.js` zweimal, `spec-format.md`, Skill) vollständig ist. Die Tests gibt es, aber man findet sie nur im README-Fließtext.
Wie: siehe Abschnitt 5.
Aufwand: klein bis mittel. Bezug: beiden, weil ein gemeinsames Paket ohne diese Grundlage nicht entsteht.

## 4 · Wo das Erlebnis besser sein kann

- **Export-Button ohne Tooltip** (Beleg 01, t1-log.txt): Das wichtigste Element der Topbar erklärt nicht, was passiert, obwohl die Hilfe den Export gut beschreibt. Vorschlag: `data-i18n-title="tip.export"` mit „Erzeugt Spec, Brief, Doku und PNGs für den Skill mockup-to-powerbi". Gleiches für „+ Seite", „+ Kennzahl / Dimension" und die fünf Reiter rechts.
- **Katalog-Erklärtexte nur für die Hälfte** (Beleg 05): „Säulen + Δ absolut + Δ %", „Brücke", „Balken (Kategorien, sortiert)" haben keinen Hinweis, „Integrierte Varianzanalyse" hat einen. Vorschlag: für jeden Typ einen Satz „wann nehmen" in `viz.<id>.note`, plus Link auf das Kapitel in `chartkitchen-doku.html`.
- **Analyse-Labels abgeschnitten** (Beleg 11): „auto (größer = bes" im Select. Vorschlag: die beiden Spalten bei langen Labels auf eine Spalte umbrechen oder kürzere Optionstexte („auto · größer besser").
- **Hilfe-Tastatur unvollständig** (help-de.txt): N (Kachelfenster), P (Präsentieren), Strg+Y, Pfeiltasten fehlen. Vorschlag: eine Zeile ergänzen, sie steht schon im Code (`app.js` 1558 ff.).
- **Toast überdeckt sich mit dem Rollenmenü** (Beleg 08): „Demo-Modell geladen" blendet noch ein, während das Rollenmenü aufgeht. Harmlos, am Beamer aber unruhig. Vorschlag: Toast beim Öffnen eines Menüs sofort ausblenden.
- **Calculation Groups ohne Items** (Beleg 31): Für ein Modell, in dem die Zeitintelligenz als Calculation Group liegt, sieht der Trainer nur eine Tabelle mit zwei Spalten. Vorschlag: Items als Chips mit Symbol „ƒ" anzeigen oder die Tabelle als „Calculation Group (n Items, im Mockup nicht bindbar)" kennzeichnen.
- **README als Changelog statt als Einstieg** (`assets/mockup/README.md`): Die ersten 70 Zeilen sind Versionshistorie, Abschnitt „Erweitern" ist drei Zeilen. Vorschlag: Changelog in `CHANGELOG.md`, README mit Zweck, Dateien, Datenmodell, Erweitern, Testen, Release.
- **„Engine" als Begriff** (Inspector, Katalog, Spec): Für Fachanwender und Teilnehmende ist „Engine" Entwicklersprache. Vorschlag: „Umsetzung" (ChartKitchen, Nativ, Deneb, Custom Visual), intern darf der Key bleiben.

## 5 · Zusammenführung mit Fabric Apps / Rayfin

Ich habe die fünf Rayfin-Apps und die Learnings gelesen und den englischen Export daneben gelegt (`dl-en/mockup-spec.json`). Die gute Nachricht: Die Apps nutzen das Kitchen-Vokabular schon, in `Tile.tsx`, `FilterPanel.tsx` und `App.tsx` steht wörtlich „MockupKitchen tile / frame". Die Spec ist also fachlich fast da. Was fehlt, ist die Trennung zwischen Kern und Zielsystem.

**Was heute Power-BI-spezifisch in der Spec steht und abstrahiert werden müsste**
- `visuals[].native {type, buckets}` mit pbir-Rollennamen (Category, Y, Values), `chartKitchenType`, `chartKitchenMode`, `customVisual` mit GUIDs, `pbir-visuals.<Seite>.json`, `engine`. Das sind Zieladapter, keine Anforderungen.
- `rect {x, y, w, h}` in Canvas-Pixeln für 1920 × 1080 und `canvas.uiScale`. Eine Rayfin-App ist ein responsives Tailwind-Raster. Brauchbar ist der `layoutTree` (`split`, `grid` mit `cols/rows/cells`), weil er Lesereihenfolge und Spurgewichte trägt. Die Pixel sind eine Ableitung für Power BI.
- `slicers[].type` (dropdown, tile, between …) und `interaction.drillThrough` sind Power-BI-Konzepte. In den Apps gibt es Filter-Chips über der Seite, Cross-Filter per Klick, Zoom und Einklappen je Kachel.
- `design.typography` in pt mit Basis 1280 px, Kacheloptik „border/shadow/flat". Für die App sind das Theme-Tokens.

**Was die Apps brauchen und die Spec noch nicht kennt**
- `additive: true|false` je Kennzahl (in `lib/sales/kpis.ts` und im Learning „Brücken nur für additive KPIs"). Heute entscheidet der Mensch im Kitchen nicht, ob eine Brücke überhaupt erlaubt ist. Gehört in den Steckbrief (`fields[]`) neben Polarität und Einheit.
- Szenario „VP Vorperiode" (Utilisation-App, kein Vorjahr vorhanden). `scenario` kennt AC/PY/PL/FC/BU, die Δ-Basis ebenfalls. VP fehlt, und die Regel „nie Vorjahreszahlen erfinden" lässt sich im Kitchen nicht ausdrücken.
- Eine Datenquelle je Kachel oder je Seite: Konnektor, Modell, DAX-Abfrage oder Entity (`fabric-semanticmodel` mit `executeQuery` gegen 10.000 bis 30.000 Zeilen, dann rechnet die App). Die Spec hat `model.source` und `fields[].expression` (DAX des Measures), aber keine Angabe, wie die Daten in die App kommen.
- Interaktionen jenseits von Power BI: Zoom auf Vollbild (Shneiderman), Einklappen, Small Multiples beim Zoom (`multScale` gemeinsam oder eigen), Filter-Chips, Dark Mode (heute nur ein Flag), Ansicht im URL-Hash.
- Kernaussage als Regel statt Text: Die Apps berechnen `message` aus den Daten. Die Spec hat `analysis.message` als freien Text. Ein Muster („{kpi} {delta} gegen {ref}, {topMember} treibt") wäre für beide Ziele nützlich.

**Vorschlag für den Schnitt**
1. Spec in Kern und Ziele trennen: `pages`, `layoutTree`, `visuals[].kind/roles/analysis/workshop/content`, `fields`, `zones`, `design` als Tokens bleiben der Kern. Neu `targets.powerbi {native, chartKitchen, customVisual, pbirFiles, rect}` und `targets.app {component, query, responsive}`. Die Konverter lesen nur ihren Zweig.
2. `catalog.js` je Typ um einen App-Eintrag erweitern, so wie es heute `native` und `customVisual` gibt: `app: { component: 'VarIntChart', props: {...} }`. Die Rollen (`category, ac, ref, fc …`) bleiben das gemeinsame Vokabular, auch in den React-Props.
3. Ein gemeinsames Paket `@datenwg/mockup-core` (ESM, ohne DOM) mit `catalog`, `sketches`, `i18n` (Dictionary als JSON, nicht als 1.250-Zeilen-JS), `gridcheck`, `a11y`, `diff`, `spec-schema` und `fmtinfo`. `sketches.js` ist dafür fast fertig (UMD-Fuß mit `root`, kein `document`, nur vier `window`-Stellen). `catalog.js` hängt an `window.MK_I18N` und müsste die Übersetzung injiziert bekommen. `export.js` und `app.js` bleiben beim Tool. Die Rayfin-Apps können die Skizzen als Platzhalter rendern, solange keine Daten da sind, und den Katalog für ihre Kachelbibliothek nutzen.
4. Tests mit ins Paket: die Skizzen-Matrix, `a11y-test`, `diff-test`, ein Schema-Test gegen `example/mockup-spec.v3.json` und ein Golden-Test des Konverters (die Fixtures unter `.claude/skills/mockup-to-powerbi/tests/` existieren schon). Dann hat ein Beitragender einen einzigen Befehl.

**Was nicht verloren gehen darf**
- Der Workshop-Teil: Priorität, Status, offene Frage, Notiz, Fragestellung je Seite, Berichtskopf mit Zielgruppe und Entscheidung. Das ist der Grund, warum Fachbereiche mitmachen.
- Der Steckbrief mit DAX, Alias, Owner, Quelle und Kommentar (Beleg 32). In einer App ist das die Definitionsseite und der Tooltip je KPI.
- Stabile IDs, Spec-Hash, `issues[]` und der Vergleich zweier Stände. Für eine App ist jeder Lauf ein Delta auf Komponenten, nicht ein Neubau.
- Die Skizzen-Notation (AC voll, PY grau, PL umrandet, FC schraffiert) und die Anti-Pattern-Hinweise.
- Zweisprachigkeit bis in die Exporte, und „läuft lokal ohne Server".

## 6 · Neue Fehler (nicht im Review vom 25.09.)

| ID | Beschreibung | Schwere | Repro | Beleg |
|---|---|---|---|---|
| F1 | Calculation Groups aus TMDL erscheinen als normale Tabellen mit zwei Spalten; die Calculation Items (hier 11 und 4) werden nicht geparst und nicht erwähnt. Ein Trainer, der Zeitintelligenz über eine Calculation Group zeigt, findet nichts zum Binden und keinen Hinweis. | niedrig | Vertriebscontrolling_Excel_based_3.0, alle 16 `tables/*.tmdl` über „TMDL laden" (Einzeldateien), dann Tabellen „📶Kennzahle Calculation Group" und „📶Time Intellegence Calculation Group" öffnen. Ursache: `parseTmdl` in `app.js` kennt nur `measure`, `column`, `calculatedColumn`, `hierarchy`. | 31-tmdl-ascii.png, t6-log.txt |

Nicht prüfbar: Der Ordner-Upload (`#fileTmdl` mit `webkitdirectory`) ließ sich über Playwright nicht auslösen (Beleg 30, Modell blieb Demo). Mit Einzeldateien über `#fileTmdlSingle` lief der Import sauber, deshalb kein Fehler, nur ein offener Prüfpunkt. Ein anfänglicher Befund „nur 8 von 16 Dateien geladen" war ein Playwright-Artefakt mit Emoji-Dateinamen und ist mit Puffer-Uploads widerlegt (t6-log.txt, Fälle b und c).

## 7 · Was gut ist

- Die englische Fassung ist komplett. Keine deutschen Reste in Oberfläche, Katalog, Hilfe, Spec, Brief, Doku, Prompt und PNG. Das hatte ich nach dem Review vom 25.09. nicht erwartet.
- Rollenmenü und Klick-Fallback: Das Tool fragt, statt zu raten, und beides ist am Beamer ohne Maus-Akrobatik zeigbar.
- Anti-Pattern-Hinweise bei Kreis, Tacho und Fläche sind sichtbar, höflich und richtig.
- Der Steckbrief mit DAX, Ordner, Formatbeschreibung und Kommentarfeld ist besser als das, was ich in den meisten Kundendokus sehe.
- Die Vorlagenstruktur (`col/row/leaf` mit `Tabelle.Feld`) ist so einfach, dass eine Vorlage ohne Programmierung möglich wäre, sobald es eine Oberfläche gibt.
- Tests laufen auf Anhieb (a11y 30/30, diff 44/44, Skizzen-Matrix 53 Typen sauber), die Module sind klein und DOM-frei genug, um sie in ein Paket zu heben.
- AGENT-BRIEF und WORKSHOP-DOKU sind als Kursmaterial brauchbar: Positionen, Rollen, Analyse und Steckbrief stehen lesbar da, die Doku endet mit nächsten Schritten.

## 8 · Noten

Bedienbarkeit: 7/10 · Nutzen für meine Rolle: 7/10 · Reife für Kunden: 6/10

Ich würde es morgen in einer deutschen oder englischen Schulung als Live-Demo einsetzen, als Selbstlernwerkzeug für Teilnehmende erst, wenn die Fachbegriffe im Tool erklärt sind und ich eigene Übungsvorlagen ohne Konsole anlegen kann.
