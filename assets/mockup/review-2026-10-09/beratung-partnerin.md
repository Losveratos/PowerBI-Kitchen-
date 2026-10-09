# Partnerin BI-Beratung · Review MockupKitchen v0.5.4

## 1 · Wer ich bin und was ich damit vorhabe

Ich bin Partnerin einer BI-Beratung mit 25 Leuten und mache seit 15 Jahren Reporting-Projekte im Mittelstand und bei Konzernen. Anforderungsworkshops verkaufen wir als eigenes Produkt: zwei Tage beim Kunden, danach ein Protokoll, das der Kunde abnimmt, und ein Bauauftrag für mein Entwicklungsteam. Heute läuft das mit PowerPoint, Whiteboard und einem Berater, der abends alles abtippt. Ich will wissen, ob MockupKitchen dieses Produkt schneller, professioneller und wiederholbar macht, ob ich damit vor dem Kunden bestehe, ob ich Ergebnisse über Kunden hinweg wiederverwenden kann und ob ein Junior das Werkzeug allein moderieren könnte. Mein Testfall: fiktiver Kunde „Müller Maschinenbau", Management-Cockpit Vertrieb auf dem echten Semantikmodell `Vertriebscontrolling_Excel_based_3.0`, zwei Seiten, Workshop 1 und Workshop 2 mit Versionsvergleich.

## 2 · Aufgaben und Verlauf

Alle Belege liegen unter `review/beratung-partnerin/`. Skripte: `02-branding.mjs`, `05-workflow.mjs`, `06-compare.mjs`.

| # | Aufgabe | Ergebnis | Beleg | Anmerkung |
|---|---|---|---|---|
| 1 | Neues Projekt mit Kundenbranding anlegen (Logo, Farben, Kopfband) | teilweise | `01-branding-design.png`, `01-A-kundenmodell.png` | Kopfband in Kundenblau, Akzentfarbe, Ecken und Fußzeile gehen in zwei Minuten. Logo gibt es nur als Platzhalterbox „LOGO", kein Upload. Den Kundenstil kann ich nicht als Datei sichern oder in das nächste Projekt laden. Kopfband-Stil „dunkel (Ink)" ignoriert meine Farbe, erst „eigene Farben" nimmt sie. |
| 2 | Berichtskopf ausfüllen (Zielgruppe, Ziel, Entscheidung, Version, Datenstand, Teilnehmende) | gelungen | `02-berichtskopf.png`, `export/WORKSHOP-DOKU.md` | Alles landet oben in der Doku und im Brief. Genau die Felder, die ich im Protokoll brauche. |
| 3 | Vorlage anpassen und als eigene Vorlage sichern | gescheitert | `05-vorlagen.png`, Ausgabe `06-compare.mjs` (Abschnitt N) | Es gibt keine Funktion „als Vorlage speichern", weder für Seiten noch für Design. Umweg: komplettes Mockup als `.mockup.json` speichern und als Startpunkt öffnen, oder „Seite duplizieren" innerhalb desselben Mockups. Beides ist keine Bibliothek. |
| 4 | Echtes Kundenmodell laden (16 TMDL-Dateien Vertriebscontrolling) | gelungen | `01-A-kundenmodell.png` | 16 Tabellen, 29 Measures, 86 Spalten, DAX im Steckbrief, Calculation Groups und Feldparameter als Tabellen sichtbar. Zehn Bindungen des Demo-Berichts werden rot markiert. Hinweis: Dateinamen mit Emoji (`📶Kennzahlen.tmdl`) kamen über Playwright nicht im Browser an, das ist ein Artefakt meiner Automatisierung, nicht prüfbar, ob der echte Dateidialog sie nimmt. |
| 5 | Vorlage „Executive One-Pager" auf das Kundenmodell setzen und Felder neu binden | teilweise | `02-C-vorlage-mit-kundenmodell.png`, `03-D-drop-menu.png`, `04-D-nach-binden.png` | Vorlage kommt ohne Bindungen an (alle Pflichtrollen leer, acht rote Punkte), weil sie am Demo-Modell hängt. Das Rollenmenü beim Ablegen („zuordnen als Kennzahl / Ziel") ist gut. Der Kacheltitel bleibt „Umsatz", obwohl ich „€ Value Angebot" abgelegt habe; das muss ich je Kachel nachziehen. |
| 6 | Zwei Seiten für ein Management-Cockpit bauen, mit Drill-Verknüpfung | gelungen | `05-E-seite2.png`, `07-F-seite1-fertig.png` | Seite 2 aus „Detailseite (Drill)", umbenannt, Seitenfrage gesetzt, KPI „Umsatz" springt dorthin. Nav-Buttons im Kopfband erscheinen automatisch. Export führt die Verknüpfung als Drill-through. |
| 7 | Workshop-Felder je Kachel (Priorität, Status, Notiz, offene Frage, Kernaussage) und Kernbotschaft als Text | gelungen | `06-F-kachel-workshop.png`, `export/page-1-ubersicht.png` | Badges M, ?, Status-Punkt auf der Kachel. Der Text der Kernbotschaft steht jetzt wirklich auf der Seite und im PNG (im 25.09.-Review noch offen). |
| 8 | Workshop-Doku, Brief und PNGs exportieren und auf Kundentauglichkeit prüfen | teilweise | `08-H-export-dialog.png`, `export/WORKSHOP-DOKU.md`, `export/AGENT-BRIEF.md`, `export/page-1-ubersicht.png` | Doku ist ein brauchbares Protokollgerüst (Kopf, Entscheidungen zur Gestaltung, Kacheltabelle, Steckbrief, offene Punkte, nächste Schritte). Nicht kundentauglich sind: PNG mit Feldchips, Link-Chip und Stiftsymbol, Platzhalter „LOGO", offene Punkte ohne Kachelnamen („Übersicht: Pflichtrolle Kennzahl leer" dreimal), interne Werte wie „Stil custom", und die Doku bindet die Seitenbilder nicht ein. Kein Abnahmeblock, keine Änderungsliste. |
| 9 | Spec mit dem Skill prüfen und PowerPoint erzeugen | teilweise | `docs-out/slide-04.png`, `docs-out/slide-05.png`, Konsolenausgabe | `mockup_to_pbir.py --validate`: „Spec in Ordnung". `mockup_to_docs.py` liefert 12 Folien, aber „0 von 2 als PNG eingebettet": Die Seitenfolie zeigt graue Rechtecke statt der Skizze, obwohl die PNGs daneben liegen (siehe Fehler N1). Die Kacheltabelle auf Folie 5 ist lesbar, aber in 7-Punkt-Schrift. |
| 10 | Speichern, in Workshop 2 öffnen, Stände vergleichen | gelungen | `01-J-oeffnen-dialog.png`, `02-J-geoeffnet.png`, `03-L-vergleich.png` | Öffnen stellt Modell, Design und Seiten wieder her. Der Vergleich ist in Fachsprache („Status: abgestimmt → abgenommen", „Priorität: keine → Should"), als Markdown kopierbar. Aber: Die Versionsänderung im Berichtskopf fehlt im Vergleich (Fehler N2). Vergleich nur gegen Datei, keinen Stand im Tool merken. |
| 11 | Präsentiermodus am Beamer 1280 × 720, Seitenwechsel per Pfeiltaste | teilweise | `09-I-beamer-editor.png`, `10-I-beamer-praesentieren.png`, `11-I-beamer-seite2.png` | Panels verschwinden, Zoom 53 %. Es bleiben Toolbar mit Öffnen/Speichern/Export, Seitentabs mit ✕ und Stift, Zoomleiste, Badges CK/PBI/M/?, rote Punkte, Feldchips, „+ Feld hierher ziehen". Pfeil rechts wechselt keine Seite. Das ist aus dem Review vom 25.09. (4.10) bekannt und noch offen. |
| 12 | Kann ein Junior das allein moderieren? Hilfe, Leitfaden, Pflichtfelder | gescheitert | `06-hilfe.png` | Die Hilfe ist eine Bedienungsanleitung in sechs Absätzen. Es gibt keinen Workshop-Ablauf, keinen Fragenkatalog je Kacheltyp, keine Pflichtfeld-Prüfung vor dem Export (Export geht mit leerer Zielgruppe und 16 Warnungen durch). Ein Junior weiß nach der Hilfe, wie man teilt, nicht, was man den Fachbereich fragt. |

## 3 · Was mir fehlt (Top 5, nach Wichtigkeit)

**1. Vorlagenbibliothek der Beratung (eigene Vorlagen, Branchenvorlagen, Bausteine)**
Was: Seiten, Kachelgruppen und Designs als eigene Vorlagen speichern, als Datei exportieren und in jedes neue Mockup importieren. Vorlagen müssen modellunabhängig sein: Rollen mit Platzhaltern („Kennzahl 1: Umsatzgröße", „Zeitachse") statt fester Demo-Felder, beim Anwenden ein kurzer Mapping-Dialog „Platzhalter → Feld aus dem Kundenmodell".
Warum: Mein Geschäftsmodell ist Wiederverwendung. Nach zehn Workshops habe ich ein Vertriebscockpit, eine GuV-Seite und ein Projektcontrolling, die ich beim nächsten Kunden in zehn Minuten anpasse. Heute kann ich nur ein ganzes Mockup speichern, und die acht mitgelieferten Vorlagen verlieren beim Kundenmodell alle Bindungen still (Aufgabe 5).
Wie: Knopf „als Vorlage sichern" am Seiten-Tab, Vorlagen-Dialog mit Reiter „Eigene" und „Importieren", Vorlage = Layout-Baum + Kacheltypen + Analyse-Block + Rollen-Platzhalter + optional Design. Dateiformat `.mktpl.json`, versionierbar im Git der Beratung.
Aufwand: mittel. Zusammenführung: beiden (eine Vorlage, zwei Zielplattformen).

**2. Kundenstil als Paket (Logo, Farben, Schriften) speichern, laden, exportieren**
Was: Logo-Upload (PNG/SVG) ins Kopfband, Kundenstil als `brand.json` sichern und laden, Export als Theme-Fragment für Power BI und als Token-Datei für Apps. Ableitung aus Website oder Firmenpräsentation gibt es im Skill `powerbi-design-framework`, im Tool fehlt sie komplett.
Warum: Der erste Eindruck beim Kunden entscheidet, ob er die Skizze als „sein" Cockpit liest. Eine gestrichelte Box „LOGO" auf dem Beamer und im Protokoll wirkt wie ein Platzhalter aus einem Baukasten. Und ich will den Stil beim zweiten Projekt desselben Kunden nicht neu klicken.
Wie: Im Zonen-Tab „Logo laden", im Design-Tab „Stil speichern / laden", im Export `theme-fragment.json` und `brand-tokens.json`.
Aufwand: klein bis mittel. Zusammenführung: beiden.

**3. Abnahmefähiges Protokoll statt Rohmaterial**
Was: Eine Doku, die ich dem Kunden so schicken kann: eingebettete Seitenbilder ohne Editor-Chips, Beschlüsse getrennt von offenen Fragen, Änderungsliste gegenüber dem letzten Stand (der Vergleich existiert ja, er muss nur ins Dokument), Abnahmeblock mit Datum und Unterschriftszeile, Versionsstand als echte Versionshistorie („Stand merken" im Tool). Dazu ein PNG-Modus „Kundenansicht" ohne Feldchips, Stift und Badges.
Warum: Das Protokoll ist das, wofür der Kunde den Workshop bezahlt, und meine Absicherung, wenn es später heißt „das hatten wir anders besprochen". Heute muss ich die Doku nachbearbeiten (Aufgabe 8), die PPTX zeigt graue Rechtecke (Aufgabe 9), und der Versionsvergleich übersieht den Berichtskopf (Aufgabe 10).
Wie: Export-Dialog mit Zielgruppe „Fachbereich" (sauberes Protokoll mit Bildern, ohne mk_-IDs) und „Entwicklung" (Brief, Spec). Snapshots im Tool, Diff zwischen zwei Snapshots als Abschnitt „Änderungen seit Workshop 1".
Aufwand: mittel. Zusammenführung: beiden.

**4. Übergabe an das Entwicklungsteam als ein Paket mit Rückmeldung**
Was: Ein ZIP mit README, Spec, Brief, PNGs, Theme, `plan.json` und einer Aufwandsschätzung (Kacheln × Engine × Komplexität in Stunden). Nach dem Bau ein Rückkanal: Abnahme-Tabelle aus `mockup_verify.py` zurück ins Tool, Kachelstatus auf „gebaut" und „abgenommen".
Warum: Ich übergebe heute sieben einzelne Downloads an ein Team, das nicht im Workshop war, und habe keine Zahl, die ich dem Kunden als Angebot für den Bau nennen kann. Die Spec enthält alles für eine Schätzung (Anzahl Kacheln, Engines, neue Kennzahlen, Verknüpfungen), nur rechnet sie niemand aus.
Wie: „Übergabepaket (ZIP)" im Export, Abschnitt „Aufwand" im Brief mit einfacher Tabelle je Kacheltyp, Import von `acceptance.json` oder `agent-status.json` (im KONZEPT-LIVE schon angedacht).
Aufwand: klein für ZIP und Schätzung, mittel für den Rückkanal. Zusammenführung: hilft Power BI, Schätzung auch Rayfin.

**5. Geführter Workshop-Modus für Junior-Berater**
Was: Ein Ablauf im Tool, der die Moderation strukturiert: Berichtskopf zuerst (Zielgruppe, Entscheidung sind Pflicht), je Seite die Fragestellung, je Kachel Fragenkatalog nach Typ („Gegen welche Referenz? Höher oder niedriger gut? Wer ist Owner der Kennzahl?"), Kennzahlen-Steckbriefe bestätigen, offene Punkte sammeln, Export erst, wenn die Pflichtfelder stehen. Dazu ein Zeitbudget je Schritt.
Warum: Ich will Workshops skalieren, ohne dass immer eine Seniorin im Raum sitzt. Heute kann ein Junior das Werkzeug bedienen, aber das Werkzeug stellt keine der Fragen, die den Workshop wertvoll machen. Alle Felder dafür existieren bereits (Steckbrief, Analyse-Block, Workshop-Block), sie sind nur über fünf Tabs und eingeklappte Gruppen verteilt.
Wie: Schalter „Workshop-Leitfaden" im Bericht-Tab, der eine Checkliste mit Fortschritt zeigt und die passenden Felder öffnet; Export-Preflight meldet fehlende Pflichtangaben als Blocker, nicht als Hinweis.
Aufwand: mittel. Zusammenführung: beiden.

## 4 · Wo das Erlebnis besser sein kann

- **Projektstart ohne Projektdialog.** Ein neues Projekt bedeutet heute: Berichtsname in der Topbar, Kopfband-Titel im Zonen-Tab, Fußzeile im Zonen-Tab, Zielgruppe im Bericht-Tab, Farben im Design-Tab. Demo-Texte wie „in T€ · YTD 2026" und „Stand: 18.09.2026 · Quelle: DWH" bleiben stehen, wenn man sie übersieht (`01-A-kundenmodell.png`). Vorschlag: ein Dialog „Neues Projekt" mit Kunde, Berichtsname, Zielgruppe, Logo, Farben, Fußzeile, der alle fünf Stellen auf einmal setzt.
- **Vorlagen schweigen beim Kundenmodell.** Nach dem TMDL-Import kommen alle Vorlagen ohne Felder an, der Toast sagt nur „Vorlage gesetzt" (`02-C-vorlage-mit-kundenmodell.png`). Vorschlag: Toast „8 Vorlagenfelder sind nicht im Modell, bitte zuordnen" mit Sprung zur ersten leeren Kachel, besser der Mapping-Dialog aus Punkt 3.1.
- **Feld abgelegt, Titel bleibt alt.** „€ Value Angebot" auf die Kachel „Umsatz" gezogen, der Titel bleibt „Umsatz" (`04-D-nach-binden.png`). Vorschlag: Beim ersten Feld in der Primärrolle den Titel vorschlagen, wenn er noch der Vorlagentitel ist, mit Rückgängig im Toast.
- **Doku nennt interne Werte und umgerechnete Zahlen.** „Stil custom", „Kacheln gerundet (6 px)" bei 4 px im Design-Tab, „Datenmodell TMDL (16 Dateien)" statt Modellname (`export/WORKSHOP-DOKU.md`). Vorschlag: Klartext („eigene Kopfbandfarben"), beide Werte („4 px, bei Full HD 6 px"), Modellname aus dem Ordner oder ein Feld „Modellname" im Bericht-Tab.
- **Offene Punkte in der Doku ohne Kachelbezug.** „Übersicht: Pflichtrolle „Kennzahl" leer" steht dreimal untereinander, der Brief nennt die mk_-ID, die Doku gar nichts. Vorschlag: Kachelnummer und Titel voranstellen wie bei den Notizen („1.2 Marge %: Kennzahl fehlt").
- **PNG ist Editor-Ansicht, nicht Kundenansicht.** Feldchips, Link-Chip „↗ Detail Standort", Stiftsymbol und die LOGO-Box stehen im Bild (`export/page-1-ubersicht.png`). `render-png.js` kennt die Schalter (`badges`, `notes`), die Oberfläche bietet sie nicht an. Vorschlag: zwei Häkchen im Export-Dialog „Feldnamen zeigen" und „Notizen zeigen", Standard aus für die Doku.
- **Präsentieren ist kein Beamer-Modus.** Siehe Aufgabe 11. Vorschlag bleibt der aus dem 25.09.: Vollbild, nichts Editierbares, Pfeiltasten und Clicker, Status als lesbare Pills mit Legende.
- **Vergleich nur gegen eine Datei im Download-Ordner.** Vor Publikum den Dateidialog öffnen ist unangenehm. Vorschlag: „Stand merken (Workshop 1)" im Bericht-Tab, Vergleich gegen gemerkte Stände, Ergebnis optional als Abschnitt in der Doku.
- **Export als Download-Regen.** Sieben Dateien, 350 ms Abstand, Chrome fragt nach. Bekannt, trotzdem die erste Hürde bei der Übergabe. ZIP mit README.
- **Export ohne Mindestqualität.** 16 Warnungen und leere Zielgruppe blockieren nichts. Für den Agenten ist das richtig (er fragt nach), für ein Kundenprotokoll nicht. Vorschlag: Export-Profil „Protokoll" mit Pflichtfeldern.
- **Teilnehmende als Namen im Agent-Brief.** Bekannt aus 4.13, aus Beratungssicht ein Vertragsthema: Kundennamen gehen an einen KI-Agenten. Rollen statt Namen als Standard.

## 5 · Zusammenführung mit Fabric Apps / Rayfin

Ich habe die fünf Apps und die Memory-Dateien gelesen. Die Apps bauen auf demselben Rahmen wie das Kitchen (Kopfband mit Seitennavigation, KPI-Leiste, Kachelraster, Filterpanel rechts, Fußzeile, 18 px Abstand), haben aber Dinge, die die Spec heute nicht ausdrücken kann.

**Was die Spec braucht, damit daraus eine App wird**

- **Zielplattform als Dimension, nicht als Engine.** Heute ist `engine` = `ck | native | deneb | custom` und `native.buckets` sind pbir-Buckets. Das ist Power-BI-Vokabular bis in die Kachel. Vorschlag: `kind`, `roles`, `analysis`, `workshop`, `rect` bleiben neutral (sind sie schon), darunter `targets.powerbi` (engine, native buckets, ChartKitchen-Modus) und `targets.app` (Komponente wie `KpiCard`, `VarIntChart`, `StructureBridge`, `SmallMultiples`, `DriverTree`, Zoom erlaubt, einklappbar). Ein Bericht-Schalter „Zielplattform: Power BI / Fabric App / beide" mit Warnungen je Kachel, was die jeweilige Plattform nicht kann.
- **Datenabfrage statt nur Feldbindung.** Die Apps laden zwei bis drei DAX-Abfragen auf feinem Korn und rechnen im Browser. Dafür braucht die Spec je Seite oder Kachel ein `query`-Objekt: Dimensionen, Measures, Zeitraum, Filter, Grenze (100.000 Zeilen). Außerdem je Measure `additive: true|false` (Brücken nur für additive Kennzahlen, Quoten bekommen Δ je Bucket) und `comparison: PY | VP | PL | FC` (Auslastung hat kein Vorjahr, nur Vorperiode). Beides sind Workshop-Fragen, die heute niemand stellt.
- **Kernaussage als Vorlage, nicht als Text.** In Power BI ist `analysis.message` eine Titelzeile, in den Apps wird die Kernaussage aus den Daten berechnet (`Tile.tsx`). Vorschlag: `messageTemplate` mit Platzhaltern („{kpi} {deltaRel} unter Plan, {worstCategory} trägt den Rückstand"), Power BI nimmt den ausgefüllten Text, die App rechnet ihn.
- **Layout als Raster, Pixel als Ableitung.** `layoutTree` ist schon in der Spec, die Apps brauchen genau das (Spalten, Zeilen, Gewichte) plus Breakpoints; absolute `rect`-Werte gelten nur für PBIR. Die Wahrheit sollte der Baum sein, die Rechtecke eine Ableitung mit `canvas`-Bezug.
- **Interaktion erweitern.** `interaction` kennt crossFilter, drillDown, drillThrough. Die Apps haben Zoom zu Small Multiples (gemeinsame oder eigene Skala), einklappbare Kacheln, aktive Filter als Chips mit „alle aufheben", Zustand im URL-Hash, Dark Mode. `analysis.smallMultiples` und `scaleGroup` sind da; es fehlen `zoomable`, `collapsible`, `filterChips`, `shareableState`, und `design.darkMode` muss aus dem Backlog raus, weil die Apps ihn haben.
- **Design als Tokens.** `design.typography` rechnet in px auf 1280-Basis. Für React braucht es Tokens (Farben, Schriftgrößen in rem, Radius, Abstände) und Logo als Datei. Das deckt sich mit Punkt 3.2: ein Brand-Paket, zwei Ausgaben (Theme-Fragment und `tokens.json`).
- **Navigation als Routen.** `pages[]` plus `zones.header.nav` reichen für Nav-Buttons in Power BI. Für die App: Seiten-IDs als Routen, Drill-through als Route mit Parameter (`/detail/:standort`), Filter als URL-Zustand.
- **Vokabular.** „Kachel" passt für beide Welten, „Visual" und „Slicer" sind Power BI. Oberfläche und Spec sollten „Kachel", „Filter" und „Zielplattform" sagen und „Visual" nur noch im Power-BI-Zweig.

**Was heute Power-BI-spezifisch ist und abstrahiert werden muss:** `engine`, `native.type` und `buckets`, `chartKitchenMode`, `pbir-visuals.<Seite>.json`, die Issue-Codes rund um ChartKitchen, `zones.filter.collapsible` als Bookmark, Drill-through-Semantik, die px-Rechtecke und der ×1,5-Faktor.

**Was auf keinen Fall verloren gehen darf:** stabile IDs und Spec-Hash (sonst gibt es kein Delta und keinen Vergleich), der Workshop-Block je Kachel (Priorität, Status, offene Frage), der Berichtskopf mit Entscheidung, der Kennzahlen-Steckbrief mit DAX und Formatstring, Polarität und Szenario-Notation (AC/PY/PL/FC, in den Apps dieselben Farben und Regeln), `issues[]` als Daten, die Verknüpfungen, und die Haltung „Vertrag, kein Generator": Das Kitchen legt fest, der Agent baut und prüft. Für die Apps sollte dieselbe Trennung gelten, mit einer `acceptance.json`, die auch gegen den Vite-Build geprüft werden kann (Kachel-IDs als `data-mk-id` im DOM).

## 6 · Neue Fehler (nicht im Review vom 25.09.)

| ID | Beschreibung | Schwere | Repro | Beleg |
|---|---|---|---|---|
| N1 | Die PNG-Dateinamen des Tools passen nicht zum Muster, das `mockup_to_docs.py` sucht. `render-png.js:118` erzeugt `page-1-ubersicht.png` (Kleinschreibung, Bindestrich), `mockup_spec.slug()` erwartet `page-1-Ubersicht.png` (Großschreibung, Unterstrich). Folge: „0 von 2 als PNG eingebettet", die PowerPoint zeigt graue Rechtecke statt der Skizzen, auch wenn die PNGs daneben liegen. Unter Windows hilft die Groß/Klein-Toleranz nicht, weil auch Bindestrich und Unterstrich abweichen. | mittel | „Alle Dateien herunterladen", dann `python3 -I scripts/mockup_to_docs.py mockup-spec.json --images <Ordner>`. | `docs-out/slide-04.png`, Konsolenausgabe in Aufgabe 9 |
| N2 | „Stände vergleichen" ignoriert den Berichtskopf (Version, Zielgruppe, Ziel, Entscheidung, Teilnehmende, Datenstand) und die Fragestellung je Seite. `diff.js:111` und `:156` projizieren Seiten nur auf `id` und `name`, `report` wird nicht verglichen. Version 0.1 → 0.2 geändert, der Vergleich meldet „3 Änderungen" ohne die Version. | mittel | Mockup speichern, im Bericht-Tab Version und Seitenfrage ändern, „Datei vergleichen" mit der gespeicherten Datei. | `03-L-vergleich.png` |
| N3 | Nach dem Anwenden einer Vorlage bei geladenem Kundenmodell gehen die Vorlagenbindungen still verloren. Weder Toast noch Export sagen, welche Vorlagenfelder nicht im Modell waren; die Warnungen lauten nur „Pflichtrolle leer". | niedrig | TMDL laden, Vorlage „Executive One-Pager" wählen. | `02-C-vorlage-mit-kundenmodell.png`, `export/AGENT-BRIEF.md` |
| N4 | Noch offen aus dem 25.09. (4.10, 4.5): Präsentationsmodus zeigt Toolbar, Tabs mit ✕, Badges, Chips; Pfeiltasten wechseln keine Seite. Design-Tab 4 px, Doku 6 px ohne Erklärung. | mittel | Präsentieren bei 1280 × 720, Pfeil rechts. | `10-I-beamer-praesentieren.png`, `11-I-beamer-seite2.png` |

Konsolenfehler: keine, bis auf ein 404 auf `favicon.ico`.

## 7 · Was gut ist

- Der Weg vom Workshop zum Bauauftrag ist wirklich kürzer als mit PowerPoint. Zwei Seiten mit Kundenmodell, Drill, Workshop-Status und Export standen in etwa 25 Minuten inklusive Lesen, davon zehn Minuten echte Arbeit. Das Protokollgerüst schreibt sich dabei mit.
- Der Kennzahlen-Steckbrief holt DAX, Formatstring und Anzeigeordner aus dem echten Modell. Der Fachbereich sieht im Workshop zum ersten Mal die Formel hinter „seiner" Kennzahl. Das allein rechtfertigt den Einsatz bei Bestandsmodellen.
- Rollenmenü beim Ablegen, rote Punkte an leeren Pflichtrollen, „Fehlt im Modell" als eigene Gruppe: Das ist ehrlich und spart die Rückfragerunde nach dem Workshop.
- Der Versionsvergleich spricht Fachsprache und lässt sich als Markdown kopieren. Mit Snapshots im Tool und dem Berichtskopf wäre er mein Änderungsprotokoll.
- Der Agent-Brief ist besser als das, was meine Berater heute schreiben: Zonen, Koordinaten, Rollen, Regeln, offene Punkte mit IDs. Der Validator sagt in einer Zeile, ob die Spec trägt.
- Stabil: kein Konsolenfehler, Öffnen stellt alles wieder her, Undo trägt.

## 8 · Noten

Bedienbarkeit: 7/10 · Nutzen für meine Rolle: 7/10 · Reife für Kunden: 5/10

Ich würde es morgen in einem Workshop einsetzen, aber nur mit einer Seniorin am Rechner, das Protokoll noch von Hand nachbearbeitet und die PNGs vor dem Versand geprüft; als Produkt mit Vorlagenbibliothek, Kundenstil und abnahmefähigem Protokoll würde ich es zum Standard meiner Workshops machen.
