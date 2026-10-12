# Lena Hartwig, UX Researcherin · Review MockupKitchen v0.5.4

## 1 · Wer ich bin und was ich damit vorhabe

Ich bin UX Researcherin und Product Designerin, seit acht Jahren in B2B-Datenprodukten unterwegs, davor Figma, Miro und Balsamiq täglich. Meine Kunden sind Controlling-Abteilungen und Beratungen, die Berichte beauftragen, ohne sie selbst zu bauen. In Workshops brauche ich ein Werkzeug, mit dem Fachleute in den ersten fünf Minuten etwas Eigenes auf die Fläche bekommen, das danach nicht als Bild, sondern als Auftrag weitergeht. Ich habe das Tool mit einem Cognitive Walkthrough (Erstbesuch, dann mit Hilfe) und einer freien Heuristik-Prüfung angeschaut, alles per Playwright in Chromium bei 1600 × 1000 und 1366 × 768. Meine Erwartung: Das Container-Layout muss sich ohne Erklärung erschließen, Rückmeldungen müssen jede Zustandsänderung benennen, und die Dreiteilung Modell, Bühne, Inspector darf nicht dazu führen, dass dieselbe Einstellung an zwei Orten lebt.

Belege liegen unter `review/ux-researcher/` (Screenshots `NN-tX-….png`, Skripte `tXX-….mjs`, Logs `tXX.log`, der geprüfte Export `mockup-spec.json`).

## 2 · Aufgaben und Verlauf

| # | Aufgabe | Ergebnis | Beleg | Anmerkung |
|---|---|---|---|---|
| 1 | Erstbesuch ohne Hilfe: neue Seite, erstes Feld auf eine Kachel, Export öffnen | gelungen | 01-t1 bis 06-t1 | 6 Schritte (5 Klicks, 1 Drag) bis zum Export-Dialog. „+ Seite" legt sofort 2×2 an, der Drop fragt nach der Rolle. Leere-Kachel-Hinweis bei 48 % Zoom etwa 5 px hoch, praktisch unlesbar. |
| 2 | Dieselbe Aufgabe mit Hilfe (?): Hilfe lesen und gegen die Oberfläche halten | teilweise | 01-t9-help-top, 02-t9-help-bottom | Hilfe nennt Teilen, Doppelklick, Felder, Export. Nicht erklärt: Verbinden (+), Rand-+, „Inhalt neu aufteilen", Pixelgenau, Taste N, Taste P, Stände vergleichen, Strg+Y. F1 tut nichts. 11 Bedienelemente ohne Tooltip (Export, + Seite, + Kennzahl, Reiter). |
| 3 | Mentales Modell: Kachel wie in Figma verschieben und am Eck vergrößern | teilweise | 01-t3-dragging-tile, 02-t3-after-tile-drag | Ziehen tauscht Inhalte: Das große Zeitdiagramm landet in der 182 × 85 px KPI-Zelle, die KPI im großen Feld. Kein Toast, keine Vorschau außer blauem Ziel. Eckziehen tut nichts, Cursor bleibt „pointer". |
| 4 | Trennlinie ziehen, Kachel teilen, Hover-Affordanzen | gelungen | 03-t3-hover-tile, 04-t3-hover-gutter, 05-t3-dragging-gutter, 06-t3-after-split | Teilen/Entfernen-Knöpfe sind 22 × 22 px (H4 behoben). Verbinden-+ mit Opazität 0,55, Rand-+ mit 0,45, nur bei Hover. Keine Rückmeldung nach dem Teilen. |
| 5 | Kachel umwandeln (Doppelklick, Katalog, Suche, Engine wechseln, Kreis wählen) | gelungen | 01-t4-picker bis 05-t4-pie | Rollen überleben den Typwechsel (AC, PL, Month blieben). Suche „Tabelle" listet die KPI-Kachel zuerst, weil der Gruppenname trifft. Nach Wechsel auf „Nativ" steht im Inspector-Kopf weiter „KPI-Kachel (ChartKitchen)". Kreis zeigt den IBCS-Hinweis als normalen Grautext. |
| 6 | Rolle versehentlich falsch belegen und korrigieren | teilweise | 01-t5-rolemenu bis 05-t5-after-undo3 | „Kosten" auf das Balkendiagramm: Menü sagt „AC · ersetzt AC" und „Referenz (PL/PY/BU) · PL". Wahl „Referenz" macht Kosten still zur zweiten Referenz, die Skizze ändert sich nicht, kein Toast. Korrektur per × im Inspector und Drag in den Rollenslot klappt. Zwei Mal Strg+Z stellt alles her. |
| 7 | Undo-Kette: Titel ändern, teilen, Kachel entfernen, Seite anlegen, Entf; dann 5 × Strg+Z, 3 × Strg+Y | gelungen | 01-t6-after-5-actions, 02-t6-after-undo, t06.log | Zustand kommt exakt zurück. Toast immer nur „Rückgängig" bzw. „Wiederholt". Undo/Redo-Knöpfe sind nie deaktiviert, auch bei leerem Verlauf. Vier der fünf Aktionen geben keinen Toast. |
| 8 | Tastaturbedienung: Tab-Reihenfolge, Kachel wählen, Katalog öffnen, N, P, Esc, Reiter | teilweise | 01-t7-enter-on-tile, 02-t7-N-window, 03-t7-present, t07.log | Tab 1 landet auf der ersten Kachel mit sichtbarem Ring, Leertaste wählt, Esc gibt den Fokus an die Kachel zurück. Pfeiltasten tun auf Kacheln nichts, Reiter kennen keine Pfeiltasten, 21 Tabs bis zum Inspector. Enter öffnet den Katalog nur auf leeren Kacheln. Seitenname per nativem `prompt()`. |
| 9 | EN-Umschaltung und Rückweg | gelungen | 03-t9-en | Alles übersetzt, auch Demo-Felder und Charttitel, Toast „8 untouched default texts translated" ist die beste Rückmeldung im ganzen Tool. |
| 10 | Echtes Modell laden (Vertriebscontrolling, 16 TMDL), Steckbrief öffnen, Feld auf gebundene KPI ziehen | gelungen | 01-t14-import16, 02-t14-steckbrief, 03-t14-rolemenu-missing, 04-t14-bound | Toast „16 Tabellen, 29 Measures, 86 Spalten geladen · 10 gebundene Felder fehlen, rot markiert", Gruppe „Fehlt im Modell" oben. Steckbrief mit DAX, Format, Ordner, Alias, Owner. Hinweis: Dateien mit Emoji im Namen kamen über Playwright-`setInputFiles` nicht an (0 Dateien, kein Toast); per In-Page-`File` laden sie sauber, also Automatisierungsartefakt, kein Tool-Fehler. |
| 11 | Dialoge, leere Zustände, Fehler: Vorlagen, Leer, letzte Seite löschen, Öffnen, Schrott-TMDL, Schrott-JSON, Neu, Pixelgenau, Export-Downloads | gelungen | 01-t11-vorlagen bis 07-t11-export-prompt | Fehlertoasts sind konkret („TMDL gelesen, aber keine Spalten/Measures erkannt"). Öffnen-Dialog ehrlich (B8 behoben). Vorlage „Leer" fragt per nativem `confirm()`. Vorlagen-Karten weiter abgeschnitten („KPI-Kache"). Fünf Einzeldownloads. |
| 12 | Informationsarchitektur: fünf Reiter, N-Fenster, Zonen-Zahnrad und Doppelklick, 1366 px | teilweise | 01-t12-tab-Seite bis 08-t12-1366, 02-t13-N-after-link, t15 | Kachel-Reiter ist 1840 px lang bei 948 px Sicht. Dieselbe Einstellung an zwei Orten mit zwei Namen („Springt zu" im Inspector, „Drill-through: Zielseite" im N-Fenster). Doppelklick auf Kopfband, Filter, Fußleiste öffnet den Zonen-Reiter nicht, obwohl Hilfe und Reiter es versprechen. Bei 1366 px Zoom 36 %. |
| 13 | Export gegen das Skill-Skript validieren | gelungen | mockup-spec.json, Log | `mockup_to_pbir.py --validate`: „Spec in Ordnung: specVersion 3 · 2 Seiten · 6 Kacheln". Issues mit Seitenname (`EMPTY_TILE`, `PAGE_NO_QUESTION`, `REPORT_NO_DECISION`). |

Keine Konsolen- oder Seitenfehler in 15 Sitzungen, einzige Ausnahme ein 404 auf `favicon.ico` bei jedem Laden.

## 3 · Was mir fehlt (Top 5, nach Wichtigkeit)

### 3.1 Ein Interaktionsmodell je Kachel, an einem Ort, abstrakt formuliert

**Was:** Heute ist „was passiert bei Klick" verstreut: „Springt zu (Seite, Drill / Navigation)" im Inspector, „Drill-down in der Kachel", „Klick filtert andere Kacheln" und „Drill-through: Zielseite" nur im N-Fenster, „Small Multiples" und „Feldparameter" unter Darstellung, Zoom gibt es gar nicht. In der Spec heißt das `interaction: { drillDown, crossFilter, drillThrough }` plus `link`. Das ist Power-BI-Vokabular.
**Warum:** Im Workshop ist die zweite Frage nach „was zeigt die Kachel" immer „und was passiert, wenn ich draufklicke". Ich kann das heute nicht an einem Ort festhalten, und der Fachbereich kennt weder Drill-through noch Bookmark.
**Wie:** Eine Gruppe „Verhalten" im Inspector (nicht nur im N-Fenster) mit drei Fragen in Fachsprache: *Beim Klick auf ein Element* (filtert die Seite / nichts), *Beim Klick auf die Kachel* (öffnet Seite X als Detail / vergrößert die Kachel / nichts), *Aufklappen* (Hierarchie / je Kategorie ein Mini-Chart). In der Spec `interaction: { select: 'crossFilter'|'none', open: { kind: 'detailPage'|'zoom'|'none', target }, expand: 'drilldown'|'smallMultiples'|'none' }`, der Power-BI-Pfad mappt `detailPage` auf Drill-through oder Seitenwechsel, der App-Pfad auf Router und Zoom-Overlay.
**Aufwand:** mittel. **Bezug:** beiden.

### 3.2 Klickbarer Prototyp im Präsentationsmodus

**Was:** „Präsentieren" zeigt nur das Bild. Ich kann im Raum nicht zeigen, dass die Δ-Kachel auf die Detailseite führt, oder dass der Slicer die Seite filtert.
**Warum:** Mein Hauptwerkzeug ist der Cognitive Walkthrough mit Teilnehmenden: „Du willst wissen, warum Süd unter Plan ist. Was tust du?" Dafür braucht es Klickpfade, keine Standbilder. Genau das kann Figma, und genau dort verliere ich heute gegen Figma.
**Wie:** Im Präsentationsmodus Kacheln mit `interaction.open.target` anklickbar machen (Seitenwechsel mit kurzer Überblendung, Zurück per Backspace), Slicer-Chips als Fake-Filter mit sichtbarem Chip über der Seite („Region: Süd ×"), Pfeiltasten und Leertaste blättern Seiten (für den Presenter-Clicker). Alles ohne Daten, nur Zustand.
**Aufwand:** mittel. **Bezug:** beiden (für Rayfin ist das die Vorschau der späteren App, siehe Abschnitt 5).

### 3.3 Varianten und Kommentare statt einer einzigen Wahrheit

**Was:** Es gibt genau einen Stand je Browser, keine Variante A/B einer Seite, keine Kommentare mit Zeitstempel. „Stände vergleichen" braucht eine gespeicherte Datei.
**Warum:** In jedem Workshop entstehen zwei Layouts, über die abgestimmt wird. Heute dupliziere ich die Seite, nenne sie „Übersicht (Variante B)" und verliere die Beziehung. Kommentare landen in der Kachel-Notiz und sind damit Auftrag, nicht Diskussion.
**Wie:** Je Seite „Variante anlegen" (gleiche `pageId`, `variantOf`), ein Umschalter in der Seitenleiste, beim Export Entscheidung „welche Variante baut der Agent" mit `status: discarded` für die andere (die Doku behält beide als Bild). Kommentare als `comments[] = { tileId, text, role, at, resolved }` ohne Namen, mit kleinem Zähler am Kachelrand. Export: Kommentare in die Workshop-Doku unter „Diskussion", nicht in den Brief.
**Aufwand:** groß. **Bezug:** beiden.

### 3.4 Hilfe am Ort statt Hilfe im Dialog

**Was:** Die Hilfe ist ein Textdialog, der die Hälfte der Gesten nicht kennt (Aufgabe 2). Auf der Bühne gibt es keine Erklärung für das +, das Rand-+, das Zahnrad (Opazität 0 bis Hover), die CK/PBI-Badges oder die Trennlinie. Der Leere-Kachel-Text ist 5 px hoch.
**Warum:** Der Erstbesuch aus Aufgabe 1 funktioniert, weil ich die Reviews gelesen hatte. Eine Controllerin, die am Beamer zuschaut und danach selbst weiterbaut, sieht Knöpfe, die erst bei Hover erscheinen und keinen Namen haben. Das 25.09-Review nennt Onboarding als offen; ich präzisiere: Es fehlt nicht ein weiterer Dialog, sondern Erklärung dort, wo die Geste ist.
**Wie:** (a) Beschriftete Hover-Hinweise auf der Bühne in nicht skaliertem Overlay: „Verbinden", „Spalte einfügen", „Zonen-Einstellungen", mit 24 px Trefferfläche. (b) Leere Kachel bekommt einen echten HTML-Button „Visual wählen" plus „oder Feld ablegen" in 13 px, unabhängig vom Zoom. (c) Einmalige Coach-Marks beim ersten Start (drei Stück: Modell, Kachel, Export), per Häkchen abschaltbar. (d) Tooltips für die elf Bedienelemente ohne Titel, F1 und ? öffnen die Hilfe. (e) Hilfe-Abschnitte „Verbinden und Raster" und „Live im Workshop" nachziehen.
**Aufwand:** klein bis mittel. **Bezug:** keinem direkt, aber Voraussetzung dafür, dass Fachbereiche das Tool allein nutzen.

### 3.5 Ein Fokus- und Tastaturmodell für die Bühne

**Was:** Kacheln sind fokussierbar (gut), aber Pfeiltasten bewegen nichts, Enter öffnet den Katalog nur auf leeren Kacheln, Teilen und Verbinden gehen nur per Maus, Reiter haben kein Pfeiltasten-Muster, und Undo meldet nie, was rückgängig gemacht wurde.
**Warum:** Am Beamer tippe ich, während jemand anderes redet. Jede Geste, die nur per Hover-Knopf erreichbar ist, kostet im Raum Sekunden und Konzentration. Und ohne Benennung im Undo-Toast traue ich mich nach einem Fehlgriff nicht, dreimal Strg+Z zu drücken.
**Wie:** Pfeiltasten wechseln die Kachel in Leserichtung, Enter öffnet immer den Katalog, Strg+Shift+H/V teilt, Strg+Shift+M verbindet mit dem rechten/unteren Nachbarn, Entf leert (wie heute), Shift+Entf entfernt. Reiter nach WAI-ARIA-Tabs. Undo-Toast mit Aktionsnamen („Rückgängig: Kachel Aufträge entfernt"), Undo/Redo-Knöpfe deaktiviert, wenn nichts da ist, Tooltip nennt die nächste Aktion. Die Tastenliste in der Hilfe und als Overlay auf „?".
**Aufwand:** mittel. **Bezug:** keinem.

## 4 · Wo das Erlebnis besser sein kann

1. **Ziehen tauscht, statt zu verschieben, und sagt es nicht.** Beleg: 01-t3-dragging-tile, 02-t3-after-tile-drag. Wer aus Figma kommt, zieht die Kachel „an eine freie Stelle". Hier gibt es keine freie Stelle, also tauscht das Tool Inhalte, das große Zeitdiagramm sitzt danach in 182 × 85 px. Kein Toast, kein Rückgängig-Angebot. Vorschlag: Beim Ziehen ein Ghost mit Beschriftung über dem Ziel („Tauschen mit Marge" oder „In leere Kachel verschieben"), nach dem Drop ein Toast mit Rückgängig-Knopf. Zusätzlich ein Hinweis in der Hilfe und im Leere-Kachel-Text, dass Platz nur durch Teilen und Verbinden entsteht.

2. **Rollenmenü mit zwei Logiken.** Beleg: 01-t5-rolemenu, 03-t14-rolemenu-missing. Untertitel „AC · ersetzt AC" neben „Referenz (PL/PY/BU) · PL": Beim ersten versteht man „ersetzt", beim zweiten nicht, ob Kosten PL ersetzt oder dazukommt (es kommt dazu, max 2). Vorschlag: Untertitel immer als Folge formulieren: „ersetzt AC", „wird zweite Referenz neben PL", „ersetzt PL (voll)". Nach der Wahl ein Toast „Kosten → Referenz, neben PL · Rückgängig".

3. **Stille Zustandsänderungen.** Beleg: t06.log, t05.log. Teilen, Entfernen, Seite anlegen, Rolle setzen, Rolle entfernen, Engine wechseln: alles ohne Rückmeldung. Toast ist nur bei Sprache, Import, Vorlage und Undo da. Vorschlag: Eine kurze Regel: Jede Aktion, die Strg+Z umkehren kann, bekommt einen Toast mit Aktionsnamen; Toasts stapeln sich nicht, der neue ersetzt den alten. Das ist eine Stelle in `commit()`.

4. **Zwei Orte für dieselben Einstellungen, mit zwei Namen.** Beleg: 05-t1-after-role, 02-t7-N-window, 02-t13-N-after-link. Inspector: Titel, Untertitel, Szenario, Darstellung, Rollen, Analyse, Workshop, Notiz, Springt zu. N-Fenster: Titel, Notiz, Workshop, Verhalten (Drill-down, Cross-Filter, Drill-through), Darstellung, Beispielwerte, Typografie. „Springt zu" und „Drill-through: Zielseite" schreiben dasselbe Feld. Beispielwerte und Cross-Filter gibt es nur im Fenster. Vorschlag: Das N-Fenster zeigt exakt die Inspector-Gruppen in zwei Spalten, mit denselben Überschriften und derselben Reihenfolge; keine Gruppe existiert nur an einem Ort. Der Akzentknopf „Notiz & Einstellungen" wird ein Ghost-Icon „⤢ Großansicht" im Panel-Kopf, damit der einzige Akzentknopf der Export bleibt.

5. **Der Kachel-Reiter ist doppelt so lang wie der Bildschirm.** Beleg: 05-t12-kachel-top, 06-t12-kachel-bottom (1840 px Inhalt, 948 px sichtbar). Position und Größe, „Kachel leeren" und „Kachel entfernen" liegen ganz unten. Vorschlag: Kopfzeile mit Typ, Engine-Badge, x·y·w×h und den zwei Aktionen als Icons; darunter Akkordeon mit Zusammenfassung im zugeklappten Kopf (das Badge „1 gesetzt" bei Analyse ist der richtige Ansatz, bitte auch für Rollen „3 von 4 gebunden" und Workshop „Must · offen").

6. **Engine-Vokabular vor Fachvokabular.** Beleg: 01-t4-picker, 04-t4-native. Jede Katalogkarte trägt „ChartKitchen · Nativ · Deneb" als zweite Zeile, die Kacheln tragen „CK"/„PBI", der Inspector sagt „Engine". Eine Controllerin liest das als Technik, die sie entscheiden soll. Nach dem Wechsel auf Nativ heißt die Kachel im Inspector weiter „KPI-Kachel (ChartKitchen)". Vorschlag: Im Katalog die Engine-Zeile ausblenden, bis ein Filter „Umsetzung" gesetzt ist; im Inspector „Umsetzung: ChartKitchen-Visual / Power-BI-Standardvisual / Deneb" mit Tooltip, was das für den Kunden heißt (Custom Visual nötig oder nicht). Badge-Tooltip auf der Kachel. Kopfzeile folgt der Engine.

7. **Zonen-Einstellungen sind unauffindbar.** Beleg: t13.log (Zahnrad 13 × 13 px, Opazität 0), t15.log (Doppelklick ohne Wirkung). Der einzige sichtbare Weg ist der Reiter „Zonen" rechts, dessen Name nicht sagt, dass Kopfband, Navigation und Filter darin wohnen. Vorschlag: Zahnrad mit 24 px, Opazität 0,5 dauerhaft, 1 bei Hover; Doppelklick reparieren (Abschnitt 6, N1); Reiter-Tooltip „Kopfband, Navigation, Filter, Fußleiste".

8. **Der Export-Dialog öffnet auf rohem JSON und nennt Koordinaten statt Orte.** Beleg: 06-t1-export-dialog. „Leere Kachel bei x=819, y=108 (777×447)" liest kein Mensch. Der Prompt-Reiter (07-t11-export-prompt) ist der beste Einstieg und liegt ganz rechts. Bekannt aus 4.5 des 25.09-Reviews, weiter offen. Vorschlag: Dialog öffnet auf „Prompt für Claude Code", Warnungen als „Seite 2: 3 leere Kacheln (oben rechts, unten links, unten rechts)" mit Klick auf die Kachel.

9. **Zoom und Lesbarkeit.** Beleg: 01-firstvisit-1600 (48 %), 08-t12-1366 (36 %, Kacheltitel 9 px). Bekannt, weiter offen. Vorschlag, zusätzlich zu einklappbaren Panels: „Fit" wählt das Minimum aus Breite und Höhe, aber Skalierung unter 60 % schaltet die Beschriftungen auf eine nicht skalierte Ebene (Titel, Leere-Kachel-Hinweis, Badges).

10. **Katalogsuche trifft Gruppennamen.** Beleg: 02-t4-picker-search. „Tabelle" liefert die KPI-Kachel zuerst, weil die Gruppe „Tabellen & KPI" heißt. Vorschlag: Treffer im Namen vor Treffern in Gruppe und Beschreibung sortieren.

11. **Vorlagen-Karten, native Dialoge, Download-Regen.** Beleg: 01-t11-vorlagen („KPI-Kache", „Balken (Kate"), t11.log (`confirm()` bei Vorlage, `prompt()` beim Umbenennen, fünf Einzeldownloads). Alles bekannt aus 4.1, 4.4 und 4.5, alles weiter offen. Ich nenne es, weil es im Raum vor Publikum die drei Momente sind, in denen das Tool „unfertig" wirkt.

12. **Google Fonts** werden weiter von Google geladen (Netzlog). War Quick Win 12 im 25.09-Review.

## 5 · Zusammenführung mit Fabric Apps / Rayfin

Ich habe die fünf Apps unter `Fabric-Apps-Demo/apps/` und die Learnings unter `memory/` gelesen, besonders `04-design-ibcs.md`, `05-agenten-workflow.md` und `Tile.tsx` plus `view.ts` im Finance-Cockpit. Die Apps sind in Wahrheit schon „MockupKitchen live": Kopfband mit Seitennavigation, KPI-Leiste, Kachelraster mit 18 px, Filterpanel rechts, Fußzeile, Tile mit Titel, Untertitel, Kernaussage, Werkzeugen und Zoom-Overlay. Die Spec ist also näher dran, als es aussieht. Was fehlt, ist weniger Geometrie als Zustand und Verhalten.

**Was die Spec können muss, was heute fehlt**

1. **Ein Ziel je Bericht:** `report.targets: ['powerbi', 'fabricApp']` mit Auswahl im Reiter „Bericht". Daraus leitet der Katalog ab, welche Typen im jeweiligen Ziel baubar sind (heute: Engine-Zeile; künftig: „Power BI: ChartKitchen · App: VarIntChart"), und der Export schreibt zusätzlich einen `app-brief.md` nach dem Muster von `memory/05` (Datenvertrag, Design-Regeln, Dateibesitz je Agent).
2. **Seitenzustand als erstklassiges Konzept:** `view.ts` hat `period, month, ref, plan, fc, kpi, timeVariant, structDim, structSort, markets, products`, alles im URL-Hash. Im Mockup gibt es dafür nur Slicer-Felder und „Achse per Feldparameter". Nötig: ein Element „Steuerung" (Periodenwahl YTD/FY/Monat, Szenario-Umschalter PL/PY/FC, KPI-Umschalter, Chart-Variante) mit `controls[] = { kind, options, default, scope: page|report }`. Power BI macht daraus Slicer, Feldparameter und Lesezeichen; die App daraus View-State und Chips. Das ist auch der Ersatz für das Wort „Bookmark" in der Oberfläche, das Fachleute nicht kennen.
3. **Interaktion abstrakt** (siehe 3.1): `select`, `open`, `expand`, dazu `zoom: true` als App-Fähigkeit (Zoom-Overlay macht aus einer Grafik Small Multiples). Heute ist `interaction` Power-BI-Vokabular.
4. **Datenvertrag je Kennzahl, nicht nur Feldreferenz:** Die Apps rechnen im Browser und brauchen `higherBetter` (gibt es als `polarity`), `unit` (gibt es), **`additive: true|false`** (Brücken nur für additive KPIs, Quoten bekommen Δ je Bucket), **`ratio: { num, den }`** für Quoten, **`scenarioStorage: 'rows'|'measures'`** (im ChartKitchen-Modell sind Szenarien Zeilen, im Vertriebscontrolling Measures), **`timeKey`** und **`lastActualPeriod`** (AC bis Juli, danach FC). Der Steckbrief ist der richtige Ort, der Export `fields[]` die richtige Stelle. Dazu die Sonderfälle aus `03-daten.md` als Steckbrief-Felder: „kein Vorjahr, Vergleich mit Vorperiode (VP)", „Snapshot-Filter nötig".
5. **Kernaussage als Vorlage, nicht nur als Text:** `Tile.tsx` berechnet die Kernaussage aus Daten. `analysis.message` sollte ein Template erlauben („{kpi} {deltaPct} gegen {ref}, {worst} am schwächsten"), das Power BI als statischen Titel und die App als berechneten Text nutzt.
6. **Layout als Spuren, nicht nur als Pixel:** Intern gibt es `layoutTree` mit `grid, cols[], rows[]`. Für die App gehört das als `gridTemplate` (Spurgewichte, Zwischenraum, Rand) in die Spec, plus Breakpoints: Ab welcher Breite stapeln sich die KPI-Kacheln? Ein Reiter „Design" mit zwei Presets („Desktop 1920", „Laptop 1366") und ein Umschalter in der Vorschau würde reichen. Die Hochformat-Voreinstellung ist der Anfang davon.
7. **Zustände je Kachel:** leer, lädt, Fehler, kein Zugriff, keine Daten im Filter. Power BI zeigt dann weiße Flächen, eine App braucht Text. `states: { empty: '…', noAccess: '…' }` mit Standardtexten, einmal je Bericht editierbar.
8. **Dark Mode** ist in den Apps ein Klick, im Mockup „Backlog". Ein Vorschau-Schalter würde die `design.colors` als zwei Token-Sätze exportieren.

**Was heute Power-BI-spezifisch ist und abstrahiert werden müsste:** `native.buckets`, `chartKitchenMode`, `engine`, Slicer-Geometrie, Bookmark-Paar für das Burger-Menü, Drill-through, „pbir-visuals". Vorschlag: Die Spec behält eine zielneutrale Ebene (Kachel, Rolle, Analyse, Interaktion, Steuerung, Zustand) und bekommt je Ziel einen `targets.powerbi`- und `targets.fabricApp`-Block, den der jeweilige Konverter füllt. Das Tool zeigt immer die neutrale Ebene und blendet Zielspezifisches hinter dem Ziel-Umschalter ein.

**Was nicht verloren gehen darf:** die deterministische Geometrie aus Teilen und Verbinden (das ist der Unterschied zu Figma und der Grund, warum die Apps dieselben 18 px haben), das Rollen-Vokabular AC/PL/PY/FC mit Δ-Basis und Polarität, die IBCS-nahe Skizze als gemeinsames Bild für beide Ziele, der Kennzahlen-Steckbrief mit DAX und Alias (der wird in der App zum Datenvertrag), die stabilen IDs (die App kann das Mockup zur Laufzeit als Layout-Konfiguration lesen, wenn Tile-IDs stabil bleiben), Workshop-Status und offene Fragen, die Issues-Liste als Daten, der Prompt als Übergabe.

**Bedienkonzept in der Live-Laufzeit:** Wenn dasselbe Mockup später mit Daten läuft, wird aus der Dreiteilung zwei Modi: „Entwerfen" (Modell links, Inspector rechts) und „Nutzen" (nur Bühne, Filterchips oben, Zoom per Klick). Der Präsentationsmodus aus 3.2 ist die Brücke: Erst klickbar ohne Daten, dann klickbar mit Daten, gleiche Gesten, gleiche Tastatur. Dafür muss der Präsentationsmodus heute schon ohne Bearbeitungselemente auskommen und die Interaktionen aus 3.1 abspielen. Alles, was im Inspector steht, sollte als Tooltip oder Info-Panel auch im Nutzen-Modus lesbar sein (Definition laut Modell, Alias, Owner), denn genau das fragt der Fachbereich im Betrieb.

## 6 · Neue Fehler (nicht im Review vom 25.09.)

| ID | Beschreibung | Schwere | Repro | Beleg |
|---|---|---|---|---|
| N1 | Doppelklick auf Kopfband, Filterpanel oder Fußleiste öffnet den Zonen-Reiter nicht, obwohl Hilfe (Abschnitt 1) und Zonen-Reiter es versprechen. Ursache: `app.js:734` setzt im `click`-Handler `sel = null; render();`, damit ist das Ziel beim zweiten Klick ersetzt, `dblclick` (`app.js:753`) feuert nie. Gleiche Ursache wie das frühere H1 bei Kacheln. | mittel | Standardseite, Doppelklick auf „Management Report" oder auf die Fußleiste, Reiter bleibt „Kachel". | 07-t12-zone-dblclick, t15.log |
| N2 | Das Zonen-Zahnrad ist 13 × 13 px und bis zum Hover unsichtbar (Opazität 0). Damit gibt es auf der Bühne keinen sichtbaren Weg zu den Zonen. | niedrig | Seite laden, Kopfband ansehen. | t13.log („gear size 13,13, opacity 0") |
| N3 | Nach Engine-Wechsel auf „Nativ" bleibt die Inspector-Kopfzeile „KPI-Kachel (ChartKitchen)"; das Badge auf der Kachel wechselt korrekt auf PBI. | niedrig | KPI-Kachel wählen, „Nativ" klicken. | 04-t4-native |
| N4 | Undo/Redo-Knöpfe sind nie deaktiviert; bei leerem Verlauf kommt erst nach dem Klick „Nichts rückgängig zu machen". | niedrig | Frischer Start, ↶ klicken. | t06.log („buttons initial … undo: false, redo: false") |
| N5 | Katalogsuche sortiert Gruppentreffer vor Namenstreffern: „Tabelle" liefert die KPI-Kachel zuerst. | niedrig | Katalog öffnen, „Tabelle" tippen. | 02-t4-picker-search |
| N6 | `favicon.ico` fehlt, bei jedem Laden ein 404 in der Konsole. | niedrig | Seite laden, Konsole. | t01.log |

Noch offen aus dem 25.09-Review, von mir erneut gesehen: native `confirm()`/`prompt()` (4.1), Vorlagen-Karten abgeschnitten (4.4), Export-Dialog auf JSON mit Koordinaten-Warnungen und fünf Einzeldownloads (4.5), Zoom 36 % bei 1366 px (4.4), Präsentationsmodus mit Bearbeitungselementen (4.10), Google Fonts (4.13), Hilfe ohne Verbinden/Rand-+/N/P (4.3).

## 7 · Was gut ist

- Die ersten fünf Minuten tragen: Sechs Schritte bis zum Export, ohne Hilfe. Die Standardseite zeigt sofort, was herauskommt.
- Tab 1 landet auf der ersten Kachel mit sichtbarem Fokusring, Leertaste wählt, Esc bringt den Fokus zurück, das N-Fenster öffnet mit Fokus auf Schließen. Toasts haben `role=status` und `aria-live=polite`. Das ist mehr Tastatur, als die meisten Design-Tools bieten.
- Der TMDL-Import ist die beste Rückmeldung im Tool: Zahlen im Toast, „Fehlt im Modell" als rote Gruppe ganz oben, rote Punkte auf den Kacheln. Der Steckbrief mit DAX, Format in Klartext, Alias, Owner und „so rechne ich es heute in Excel" ist genau das Dokument, das im Workshop fehlt.
- Rollen überleben den Typwechsel, der Analyse-Block (Polarität, Δ-Basis, Sortierung, Top N, Zeitgranularität, Kernaussage) ist als Daten in der Spec, und das Skill-Skript validiert meinen Export ohne Beanstandung.
- Die Sprachumschaltung ist vollständig und sagt, was sie getan hat.
- Fehlertoasts sind konkret und freundlich, der Öffnen-Dialog ist ehrlich, „Die letzte Seite bleibt" ist der richtige Ton.
- Der Prompt für Claude Code ist ein guter Text, man versteht als Mensch, was der Agent tun wird.

## 8 · Noten

Bedienbarkeit: 6/10 · Nutzen für meine Rolle: 7/10 · Reife für Kunden: 6/10

Ich würde es morgen in einem Workshop einsetzen, aber nur mit mir an der Tastatur und mit einer vorbereiteten Seite; einer Controllerin allein gebe ich es erst, wenn Ziehen, Rollenmenü und Undo sagen, was sie tun, und die Zonen von der Bühne aus erreichbar sind.
