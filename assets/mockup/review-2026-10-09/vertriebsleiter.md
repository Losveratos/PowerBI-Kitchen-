# Vertriebsleiter Maschinenbau · Review MockupKitchen v0.5.4

Belege liegen unter `review/vertriebsleiter/` (Screenshots, Playwright-Skripte `s01.mjs` bis `s10.mjs`, gespeicherte Stände `stand-a/b/c.mockup.json`, Export-Texte `export-*.txt`, `hilfe.txt`). Geprüft am 09.10.2026 unter http://localhost:8765/mockup-kitchen.html, Chromium 1600×1000, deutsche Oberfläche, Demo-Modell Sales.

## 1 · Wer ich bin und was ich damit vorhabe

Ich leite den Vertrieb eines Maschinenbauers mit rund 40 Verkäufern in vier Regionen. Mein Werkzeug ist Excel, meine Präsentation ist PowerPoint, von Power BI kenne ich die Berichte, die mir das Controlling schickt. Nächste Woche sitze ich als Fachbereich im Reporting-Workshop, und der Berater hat mir diesen Link geschickt: „Zeichne schon mal ein, was du brauchst." Ich habe 20 Minuten im Zug und will eine Seite „Auftragseingang" mit den Zahlen, die ich jeden Montag brauche: Auftragseingang gegen Vorjahr und Plan, Pipeline nach Phase, Top-10-Kunden, Verkäufer-Ranking, offene Angebote. Dazu meine Fragen (Region filtern? Handy?) und am Ende soll das Ganze beim Berater landen. Meine Erwartung: Ich klicke Kacheln zusammen wie in PowerPoint, nur dass die Zahlen schon „meine" sind, und ich muss nichts lernen, was mit der Technik dahinter zu tun hat.

## 2 · Aufgaben und Verlauf

| # | Aufgabe | Ergebnis | Beleg | Anmerkung |
|---|---|---|---|---|
| 1 | Erster Eindruck ohne Anleitung: Was ist das, was kommt raus? | teilweise | `01-start.png` | Ein fertiger „Management Report" mit Umsatz, Marge, Kosten liegt da, das beruhigt. Aber alles auf der Fläche ist bei 48 % Zoom winzig, die Kacheln tragen Kürzel (CK, AC·PL, ΔPL), und der einzige Hinweis auf das Ergebnis ist ein oranger Knopf „Export für Claude Code". Wer ist Claude Code? Ich kenne den Berater. |
| 2 | Demo-Modell Sales laden | gelungen | `01-sales-geladen.png` | Dropdown, Knopf, fertig. Toast „1 gebundene(s) Feld(er) fehlen im neuen Modell, rot markiert" und ein Bereich „Fehlt im Modell: Kosten" am Seitenkopf. Für mich: Ich habe noch nichts gemacht und sehe schon Rot. |
| 3 | Seite „Auftragseingang" anlegen und benennen | gelungen | `01-plus-seite.png`, `01-umbenennen.png` | „+ Seite" ist klar, der Stift am Tab auch. Umbenennen läuft über ein nacktes Browser-Fenster „Seitenname" (bekannt aus 25.09, 4.1), wirkt fremd. |
| 4 | Passende Vorlage finden | teilweise | `02-vorlagen.png`, `02-vorlage-angewendet.png` | Zehn Vorlagen, keine für Vertrieb. „Sales-Analyse" besteht aus Brücke, Streudiagramm, Heatmap, das sagt mir nichts. Ich nehme „KPI-Reihe + 2×2" und bekomme Umsatz, Marge, Kosten (rot, fehlt im Sales-Modell), Aufträge, „Umsatz je Region", „Top-Produkte". Jede Kachel muss ich umbauen. Vorschau-Beschriftungen abgeschnitten („KPI-Kache", „Balken (Kate"), bekannt. |
| 5 | KPI „Auftragseingang vs. Vorjahr" und „vs. Plan" bauen | gelungen | `02-chip-drag.png`, `01-py-als-referenz.png`, `04-vier-kpis.png` | Feld auf Kachel ziehen, Menü „zuordnen als Kennzahl (ersetzt Umsatz)" ist verständlich. PY als „Ziel / Referenz" in das rechte Panel ziehen hat funktioniert, aber nur, weil ich weiß, dass PY Vorjahr heißt (steht nur im Hover-Tooltip des Chips). Klick auf einen Chip bei gewählter Kachel tut nichts, nur Ziehen. |
| 6 | Kennzahl „Offene Angebote" anlegen, die es nicht gibt | gelungen | `02-neue-kennzahl-dialog.png`, `03-neue-kennzahl-angelegt.png` | Der Dialog ist das Beste am Tool für mich: Name, Beschreibung, Einheit, Zielwert, Owner, Quelle, offene Frage. Nur „Tabelle: _Measures" und „Rechenlogik für den Agenten" sind Technikersprache. Die neue Kennzahl ist orange umrandet und landet in der Doku als „neu zu erstellen" samt meiner Frage. |
| 7 | Top-10-Kunden, als wichtig markieren, Frage „nach Region filtern?" hinterlegen | gelungen | `03-analyse-offen.png`, `04-top10.png`, `05-must-notiz.png` | Customer auf die Balkenkachel, Auftragseingang als „AC · Ist-Wert", Top N = 10 im Block „Analyse (wandert in die Spec)", Priorität „Must", Notiz, Häkchen „offene Frage". Die Kachel zeigt danach M und ? als Badges. Die Skizze zeigt aber weiter Nord/Süd/Ost mit sechs Balken, nicht zehn Kunden (als „gewollt" eingestuft am 25.09, für mich trotzdem irritierend). |
| 8 | Verkäufer-Ranking aus der Tabelle „Top-Produkte" machen | teilweise | `01-salesrep-menu.png` | SalesRep auf die Tabelle gezogen: kein Menü, kein Toast, das Feld hängt sich still hinter „Product" in die Zeilen. Ich hätte jetzt ein Ranking Produkt × Verkäufer, ohne es zu merken, die Skizze zeigt weiter Regionen. Auftragseingang hat „AC" ersetzt, ebenfalls ohne Rückfrage. |
| 9 | Pipeline nach Phase, „Phase" als neue Dimension anlegen | teilweise | `02-pipeline-menu.png`, `03-neu-anlegen-in-rolle.png`, `04-pipeline-phase.png` | Pipeline als Kennzahl ging. Für die Phase habe ich „Month" aus der Rolle „Zeit / Periode" entfernt und dort „+ neu anlegen" geklickt. Der Dialog hat „DimDate" vorbelegt, ich habe es nicht gesehen, und jetzt steht in der Doku „Phase, Dimension, DimDate". Eine Vertriebsphase in der Datumstabelle. Die Kachel heißt weiter „Säulen + Δ", die Rolle weiter „Zeit / Periode". |
| 10 | Region als Filter, Seitenfrage, Berichtskopf (Zielgruppe, Entscheidung) | gelungen | `01-seite-fertig.png`, `05-seite-tab.png`, `06-bericht-tab.png` | Region in die Filterzone ziehen klappt sofort. Reiter „Seite": Fragestellung und Notizen („Ich brauche das auch auf dem Handy"). Reiter „Bericht": Zielgruppe, Ziel, Entscheidung. Der Hinweistext „Ohne Zielgruppe und Entscheidung bleibt die Doku ein Bilderbuch" ist genau mein Ton. |
| 11 | Ergebnis an den Berater schicken | teilweise | `02-export-dialog.png`, `03-export-doku.png`, `export-WORKSHOP_DOKU_md.txt` | „Export für Claude Code" öffnet rohes JSON, oben „1 Fehler" (Kosten auf der Demo-Seite, die ich nie angefasst habe) und Sätze wie „0 von 8 Visual(s) nativ in pbir-visuals.Auftragseingang.json, dazu 1 Slicer". Die WORKSHOP-DOKU im dritten Reiter ist dagegen genau das, was ich dem Berater geben will: Tabelle je Kachel, meine Fragen unter „Offene Punkte", neue Felder mit meiner Beschreibung. „Alle Dateien herunterladen" wirft sieben Dateien in den Download-Ordner. Welche davon schicke ich? |
| 12 | Vokabeltest: AC/PY, Δ-Basis, Polarität, Engine, ck, und die Hilfe | gescheitert | `04-hilfe.png`, `hilfe.txt`, `03-analyse-offen.png` | AC, PY, PL, FC, BU haben nur beim Darüberfahren über den Chip ein Wort (Ist, Vorjahr, Plan, Forecast, Budget). Das Szenario-Dropdown bietet „AC/PL, AC/PY, AC/PL/FC, AC/PL/PY, AC/BU, PL/FC, AC" ohne jede Übersetzung. „Polarität" und „Δ-Basis" stehen ohne Tooltip da, die Werte („größer = besser", „auto (PL)") helfen halb. „Engine: ChartKitchen / Nativ" und das Badge „CK" haben keinen Tooltip. Die Hilfe (sechs Absätze) erklärt kein einziges dieser Wörter und kein Glossar. Ich weiß nach 20 Minuten nicht, was ck ist, und würde es auch nicht fragen. |
| 13 | Präsentieren, um die Seite überhaupt lesen zu können | gelungen | `05-praesentieren.png` | Taste P, Panels weg, 78 % Zoom, lesbar. Das ist die Ansicht, in der ich eigentlich hätte arbeiten wollen. |
| 14 | Auf dem Handy öffnen | nicht prüfbar | `01-handy-390.png` | Bei 390 px kommt eine saubere Karte „Bitte am Desktop öffnen" mit Erklärung (Fix zu B6). Ehrlich, aber damit ist mein Zug-Szenario erledigt. |

Bilanz: 8 gelungen, 5 teilweise, 1 gescheitert, 1 nicht prüfbar (14 Aufgaben, etwa 55 Browser-Schritte). Keine Konsolenfehler, kein Absturz, Undo hat jedes Mal getan, was es soll.

## 3 · Was mir fehlt (Top 5, nach Wichtigkeit)

**1. Eine Fachbereichs-Sprache über dem Tool (Glossar und Klartext-Modus).**
Was: Ein Schalter „Fachsprache" (oder Standard für Nicht-Entwickler), der überall Klartext zeigt: „Ist" statt AC, „Vorjahr" statt PY, „Plan" statt PL, „Forecast" statt FC, „Abweichung zum Plan" statt ΔPL, „Was ist besser: höher oder niedriger?" statt „Polarität", „Womit vergleichen?" statt „Δ-Basis", „Darstellung: DatenWG-Diagramm / Standard-Power-BI" statt „Engine: ChartKitchen / Nativ", plus Tooltip auf jedem Kürzel und ein Glossar in der Hilfe. Die Codes dürfen in Klammern stehen bleiben, der Berater braucht sie.
Warum: Ich bin in Aufgabe 12 ausgestiegen. Im Workshop sitze ich mit drei Leuten wie mir am Tisch, und jedes dieser Wörter kostet eine Nachfrage, die wir uns nicht trauen. Ein Tool, das mich „Polarität" lesen lässt, ist eines für den Berater, nicht für mich.
Wie: `i18n.js` hat schon zwei Sprachen, eine dritte Ebene „de-fach" ist derselbe Mechanismus. Tooltips über `title` an Rollen, Selects, Engine-Buttons, Badges. In der Hilfe ein Abschnitt „Wörter, die hier vorkommen".
Aufwand: klein bis mittel. Bezug: beiden (das Vokabular wandert in die Doku und in die App-Beschriftungen).

**2. Vorlagen für meine Rolle, die zum geladenen Modell passen.**
Was: Eine Vorlage „Vertrieb · Wochenblick" (Auftragseingang vs. Vorjahr und Plan, Pipeline nach Phase, Top-Kunden, Verkäufer-Ranking, offene Angebote) und eine „Vertrieb · Kunde/Region". Die Vorlage soll Felder aus dem geladenen Modell nehmen und nicht aus dem Controlling-Demo, und wenn ein Feld fehlt, die Kachel als „Wunsch" anlegen statt als roten Fehler.
Warum: Aufgabe 4 und 8: Ich habe acht Kacheln von Hand umgebaut, obwohl es ein Demo-Modell „Sales" mit Auftragseingang, Pipeline, Customer und SalesRep gibt. Der rote Punkt an „Kosten" war meine erste Erfahrung nach dem Laden.
Wie: Vorlagen je Demo-Modell in `catalog.js`, oder Vorlagen mit Rollen-Platzhaltern („Hauptkennzahl", „Kunde"), die beim Anwenden gegen das Modell aufgelöst werden; nicht auflösbare Platzhalter werden zu „Neu · zu erstellen" statt „Fehlt im Modell".
Aufwand: mittel. Bezug: beiden.

**3. Ein Wunschzettel, der nicht an einer Kachel hängen muss.**
Was: Eine Liste „Meine Wünsche und Fragen" je Seite oder je Bericht mit Art (Filter, Gerät, Kennzahl, Berechtigung, Frage), Wichtigkeit und Text. Dazu je Kachel ein Knopf „Wunsch dazu". Im Export ein eigener Abschnitt „Anforderungen des Fachbereichs" in der WORKSHOP-DOKU und im Brief.
Warum: „Ich brauche das auf dem Handy", „nur meine Region, Süd sieht seine" und „Zahlen Stand Freitagabend" habe ich in Aufgabe 10 in das Feld „Zweck / Notizen zur Seite" geschrieben. Dort stehen sie als Fließtext, der Berater muss sie herauslesen, und ein Berechtigungswunsch (RLS) ist etwas anderes als ein Gerätewunsch. Die Kachel-Notiz plus Häkchen „offene Frage" funktioniert gut, aber nur für Dinge, die eine Kachel haben.
Wie: `report.requests[]` und `page.requests[]` in der Spec, Formular im Reiter „Bericht" und „Seite", Ausgabe als Tabelle. Der Skill bekommt daraus Modell-To-dos (RLS), Layout-To-dos (Mobile) und Fragen.
Aufwand: mittel. Bezug: beiden (für Rayfin ist „Handy" eine Layout-Anforderung, „nur meine Region" eine Berechtigungsregel).

**4. Ein Knopf „Für den Berater" statt sieben Dateien für den Agenten.**
Was: Zwei getrennte Ausgänge. „Weitergeben" erzeugt genau eine Datei für Menschen (PDF oder HTML mit Seitenbildern, Kacheltabelle, Steckbrief, offenen Punkten) plus die `.mockup.json`, am besten als eine ZIP oder per „Link kopieren". „Export für Claude Code" bleibt, aber als zweiter Weg mit dem Hinweis „für die Umsetzung durch den Berater".
Warum: Aufgabe 11. Ich will dem Berater eine Mail schicken. Heute müsste ich sieben Dateien aus dem Download-Ordner zusammensuchen und erraten, dass die WORKSHOP-DOKU die richtige für Menschen ist. Der Dialog startet mit JSON und „1 Fehler", das liest sich, als hätte ich etwas kaputtgemacht.
Wie: Der Inhalt existiert schon (Doku, PNGs). Es fehlt ein Bündel und eine Beschriftung aus meiner Sicht. Der Export-Dialog könnte beim ersten Öffnen fragen: „Für wen? Berater / Umsetzung".
Aufwand: klein. Bezug: beiden.

**5. Meine Skizze mit echten Zahlen sehen und daran weiterklicken.**
Was: Nach dem Workshop den gleichen Stand als klickbare App öffnen: dieselben Kacheln, echte Zahlen aus dem Modell, Filter nach Region, auf dem Handy. Dazu ein Schalter „Skizze / echte Zahlen" und die Möglichkeit, direkt in der App Kommentare an Kacheln zu hängen, die zurück in das Mockup fließen.
Warum: Die Skizze überzeugt mich nicht, die Zahl überzeugt mich. Solange „Nord 89, Süd 60" da steht, obwohl ich Kunden gebunden habe, diskutiere ich über falsche Zahlen oder glaube dem Bild nicht. Und der Montagszug ist der eigentliche Anwendungsfall, nicht der Workshop.
Wie: Siehe Abschnitt 5. Der Plan `apps/datenwg-dashboard-kitchen/PLAN.md` zielt genau darauf.
Aufwand: groß. Bezug: hilft Rayfin, mittelbar auch Power BI (Abnahme am Echtstand).

## 4 · Wo das Erlebnis besser sein kann

- **Zoom 48 % bei 1600 px Breite, Kacheltitel etwa 6 px** (`01-start.png`). Ich habe erst nach dem Präsentier-Modus (`05-praesentieren.png`) verstanden, was auf der Seite steht. Vorschlag: Beim Erststart ohne gewählte Kachel das rechte Panel einklappen, oder „Fit" auf die Höhe statt auf die Breite rechnen, wenn das Panel leer ist.
- **Rollennamen sind Entwicklersprache** (`01-customer-menu.png`, `02-pipeline-menu.png`): „AC · Ist-Wert", „Referenz (PL / PY / BU)", „FC-Flag (1/0)", „Zeit / Periode". Beim Ziehen einer Spalte auf das Balkendiagramm bietet das Menü mir „FC-Flag (1/0)" an. Vorschlag: Primärrollen in Klartext („Kennzahl", „Vergleich mit", „Aufteilen nach"), Expertenrollen hinter „weitere Rollen".
- **Stilles Anhängen in Tabellen** (`01-salesrep-menu.png`): Bei KPI und Balken fragt ein Menü „ersetzt Umsatz", bei der Tabelle hängt das Feld ohne Rückfrage hinter Product. Vorschlag: dasselbe Menü mit „zusätzlich zu Product" / „ersetzt Product".
- **„+ neu anlegen" in einer Rolle belegt die Tabelle nach Rollenart vor** (`03-neu-anlegen-in-rolle.png`): In „Zeit / Periode" ist das DimDate. Ich habe „Phase" angelegt und nicht gemerkt, dass sie in der Datumstabelle landet. Vorschlag: Tabelle als Frage in Klartext („Wozu gehört das Feld? Kunde, Produkt, Verkäufer, Datum, neues Thema") und bei Dimensionen ohne klaren Bezug „neue Tabelle" vorschlagen, nicht DimDate.
- **Die Demo-Startseite bleibt als Seite 1 stehen und erzeugt im Export einen „Fehler"** (`02-export-dialog.png`): „Kosten fehlt im geladenen Modell" auf einer Seite, die ich nie geöffnet habe. Vorschlag: Beim Anlegen der ersten eigenen Seite fragen, ob die Demo-Seite weg soll, oder den Export-Hinweis je Seite formulieren („Seite Übersicht: 1 Problem, Ihre Seite Auftragseingang: keins").
- **Skizzenzahlen und Labels passen nicht zu meiner Bindung** (`04-top10.png`): Customer gebunden, Top 10 gesetzt, Skizze zeigt sechs Regionen. Bekannt (B9, 4.2), aber aus meiner Rolle der Hauptgrund, dem Bild nicht zu trauen. Vorschlag: Labels „Kunde 1 … Kunde 10" aus dem gebundenen Feldnamen, Balkenzahl nach Top N.
- **Der Export-Dialog spricht Maschinensprache** (`02-export-dialog.png`): „0 von 8 Visual(s) nativ in pbir-visuals.Auftragseingang.json, dazu 1 Slicer. Nicht darin: 8 ChartKitchen." Vorschlag: diesen Block nur im Reiter „pbir-visuals" zeigen, nicht als Banner. Den Dialog auf WORKSHOP-DOKU öffnen, wenn im Bericht eine Zielgruppe steht, die nicht „Entwicklung" ist.
- **Die WORKSHOP-DOKU mischt meinen Teil mit Technikhinweisen** (`export-WORKSHOP_DOKU_md.txt`): Unter „Hinweise" stehen „2 Abweichung(en) vom pixelgenauen Raster" und „4 Ebenen tief verschachtelt (Tastatur/Tab …)". Im Steckbrief steht bei jeder Kennzahl „Darstellung heute: Ganzzahl, mit Tausendertrennzeichen · 1.234.568" und „Formel: nicht bekannt". Vorschlag: Fachteil (Seiten, Kacheln, Fragen, neue Felder) und Technikteil (Raster, Barrierefreiheit, Formate) trennen, den Technikteil in den AGENT-BRIEF schieben.
- **Klick auf einen Feld-Chip bei gewählter Kachel tut nichts** (`01-chip-klick.png`). Ich habe es dreimal versucht, bevor ich gezogen habe. Vorschlag aus dem Review vom 18.09 (H6, Klick-Fallback) steht noch aus.
- **Hover-Tooltips auf den Chips sind die einzige Übersetzung** (AC = Ist). Auf einem Beamer oder Touch sieht sie niemand. Gehört zu Punkt 3.1.

## 5 · Zusammenführung mit Fabric Apps / Rayfin

Aus meiner Sicht ist die App der eigentliche Zielzustand: Ich will das, was ich im Workshop gezeichnet habe, am Montag mit echten Zahlen auf dem Handy öffnen, nach Region filtern und einen Kommentar an eine Kachel hängen. Die Apps unter `/home/user/Fabric-Apps-Demo/apps/` (Sales-Cockpit, Finance-Cockpit) tun genau das, und die Learnings in `memory/04-design-ibcs.md` beschreiben Interaktionen, die in der Spec heute kein Zuhause haben.

Was die Spec oder das Tool braucht, damit daraus eine App wird:

- **Layout relativ statt in Pixeln.** Die Spec trägt 1920×1080 und absolute Rechtecke, die App ein 12-Spalten-Raster mit Umbruch. Je Kachel braucht es ein Gewicht (Spalten/Zeilen im Raster) und eine Reihenfolge beim Stapeln auf dem Handy, plus ein Flag „auf dem Handy ausblenden". Der Container-Baum im Tool liefert die Verhältnisse schon; sie müssen zusätzlich zu den Pixeln exportiert werden.
- **Interaktionen als Daten.** Heute: „Springt zu" (Drill/Navigation). Die Apps haben Kreuzfilter per Klick, Filter-Chips über der Seite, Zoom einer Kachel zu Small Multiples, teilbare URL je Ansicht, Dark Mode. Die Spec braucht je Kachel `interactions` (kreuzfiltert: ja/nein, zoombar, Drill-Ziel) und je Seite `filters` mit Vorbelegung („Jahr = aktuelles Jahr", „Region = meine").
- **Berechtigung als Anforderung.** „Nur meine Region" ist in Power BI RLS, in der App eine Filterregel aus dem Nutzerkontext. Dafür fehlt ein Feld (siehe 3.3), das beide Zielsysteme lesen können: `access: { dimension: 'DimRegion.Region', rule: 'user' }`.
- **Kennzahl-Semantik, die die App rechnet.** Die Apps laden Rohdaten und rechnen KPIs im Browser (`memory/03-daten.md`). Dafür muss die Spec je Kennzahl mehr wissen als den Namen: additiv ja/nein (Brücken nur für additive KPIs, `04-design-ibcs.md`), Zeitlogik (YTD, gleitend, Periode), Einheit und Dezimalstellen (vorhanden), Polarität (vorhanden), Zielwert und Schwellen (im Steckbrief vorhanden, aber nicht in der Kachel-Analyse). Die Kernaussage ist heute Freitext; die App berechnet sie aus den Daten (`Tile.tsx`). Es braucht also eine Regel („Δ vs. Vorjahr in %, Vorzeichen nennen") neben dem Freitext.
- **Engine abstrahieren.** „ck / nativ / deneb" ist Power-BI-Technik. Für die App zählt die Absicht: Charttyp plus Notation (AC/PY/PL/FC, Δ-Ebenen). Vorschlag: `chart: { intent: 'columns-variance', notation: 'ibcs-like' }` als führende Angabe, `engine` nur als Power-BI-Zuordnung darunter. Die ChartKitchen-Rollen bleiben als Mapping-Tabelle, die React-Komponenten (`VarIntChart`, `StructureBridge`) nehmen dieselben Rollen.
- **Chrome-Zonen als Komponenten.** Kopfband, Nav, Filterpanel, Fußleiste sind in der Spec Pixelrechtecke mit Stil. Die App hat sie als Komponenten (`memory/04`: Kopfband mit Seiten-Navigation, Filterpanel rechts, Fußzeile). Die Spec sollte sie als Elemente mit Eigenschaften führen (Logo, Titel, Nav-Quelle, Filterfelder, Datenstand-Text), nicht als Geometrie.
- **Rückkanal.** Kommentare, die ich in der App an eine Kachel hänge, und Filterstände, die ich teile, sollen über die stabile ID zurück in das Mockup (`stableId` gibt es, der Rückweg fehlt).
- **Modellbindung über den Workspace statt TMDL-Dateien.** Ich habe keine TMDL-Ordner. Die App kennt das Semantikmodell über den Konnektor; das Kitchen sollte die Feldliste aus demselben Modell ziehen (der DashboardKitchen-Plan sieht das vor).

Was heute Power-BI-spezifisch ist und abstrahiert werden müsste: absolute Pixelgeometrie, `pbir-visuals.<Seite>.json`, Engine-Begriffe, die Zonen als Rechtecke, „Drill-through vs. Seitenwechsel" als pbir-Mechanik, Bookmark-Panel, `te add`-Vorschläge als einziger Weg für neue Felder.

Was auf keinen Fall verloren gehen darf: die Bindung an echte Feldnamen aus dem Modell, die stabilen IDs, der Analyse-Block (Polarität, Vergleichsbasis, Einheit, Sortierung, Top N, kumuliert), die Workshop-Ebene (Priorität, Status, Notiz, offene Frage), der Berichtskopf (Zielgruppe, Entscheidung), der Kennzahlen-Steckbrief mit „neu zu erstellen" und meinen Fragen, die Filter je Seite, und die Doku als Protokoll. Das ist der Teil, den ich als Fachbereich unterschreibe, und er ist in beiden Zielsystemen derselbe.

## 6 · Neue Fehler (nicht im Review vom 25.09.)

| ID | Beschreibung | Schwere | Repro | Beleg |
|---|---|---|---|---|
| V1 | „+ neu anlegen" in einer Datenrolle belegt die Zieltabelle nach Rollenart vor (Rolle „Zeit / Periode" → `DimDate`), ohne Hinweis im Dialog. Eine fachliche Dimension „Phase" landet so in der Datumstabelle, in der Spec, in der Doku und als `te add DimDate/Phase`-Vorschlag. Verwandt mit B26 (freier Tabellenname), aber andere Ursache (Vorbelegung aus `data-newkind`/Rolle). | mittel | Sales laden, Kachel „Säulen + Δ" wählen, in Rolle „Zeit / Periode" das Feld entfernen, „+ neu anlegen", Name „Phase", Anlegen. Doku: „Phase, Dimension, DimDate". | `03-neu-anlegen-in-rolle.png`, `export-WORKSHOP_DOKU_md.txt` (Abschnitt „Neu zu erstellen") |
| V2 | Spalte auf eine Berichtstabelle mit belegter Zeilen-Rolle gezogen: kein Rollenmenü, kein Toast, das Feld wird still an die Zeilen angehängt (Product, SalesRep). Bei KPI und Balken erscheint das Menü „ersetzt X". Measure-Drop ersetzt „AC" ebenfalls ohne Rückfrage. | mittel | Vorlage „KPI-Reihe + 2×2", Tabelle „Top-Produkte" wählen, `DimSalesRep.SalesRep` auf die Kachel ziehen. | `01-salesrep-menu.png` (Rollen: Zeilen = Product, SalesRep) |
| V3 | Nach „Öffnen" einer `.mockup.json` mit Demo-Modell Sales zeigt das Dropdown „Controlling", der Kopf darüber „Demo · Sales · 22 Measures". Ein Klick auf „Demo-Modell laden" würde Controlling laden und alle Sales-Bindungen rot machen. | niedrig | Sales laden, Speichern, Seite neu laden, Öffnen. | `01-customer-menu.png` (links oben) |
| V4 | Vorlagen bringen Felder aus dem Controlling-Demo mit, auch wenn Sales geladen ist („Kosten" fehlt, roter Punkt sofort nach „Vorlage gesetzt"); der Export zählt das als „Fehler". | niedrig | Sales laden, neue Seite, Vorlage „KPI-Reihe + 2×2". | `02-vorlage-angewendet.png`, `02-export-dialog.png` |

Kein Konsolen- oder Seitenfehler in zehn Sitzungen (ein einzelnes 404 beim allerersten Laden ließ sich beim Neuladen nicht reproduzieren, keine Auswirkung).

## 7 · Was gut ist

- Der Weg Feld ziehen → Menü „zuordnen als Kennzahl (ersetzt Umsatz)" ist für mich die beste Stelle des Tools. Keine Angst, etwas kaputtzumachen, und Strg+Z hat jedes Mal funktioniert.
- „+ Kennzahl / Dimension" mit Beschreibung, Einheit, Owner, Quelle und offener Frage ist genau das Gespräch, das ich im Workshop sonst mündlich führe. Dass meine Frage „ab Versand oder ab Freigabe?" wörtlich unter „Offene Punkte" in der Doku landet, hat mich überzeugt.
- Priorität „Must", Status und das Häkchen „offene Frage" sind als Badges auf der Kachel sichtbar und in der Doku als Spalten. Das ist Workshop-Sprache, keine Technik.
- Der Berichtskopf (Zielgruppe, Ziel, Entscheidung) mit dem Satz „Ohne Zielgruppe und Entscheidung bleibt die Doku ein Bilderbuch".
- Die WORKSHOP-DOKU als Ergebnis: Tabelle je Seite, Steckbrief, neue Felder, offene Punkte, nächste Schritte. Wenn ich nur diese eine Datei bekäme, wäre ich zufrieden.
- Region in die Filterzone ziehen, fertig. Präsentier-Modus mit P. Der Handy-Hinweis ist ehrlich statt kaputt.
- Es läuft komplett im Browser, nichts geht raus. Das wird meine IT fragen, und die Antwort steht in der Hilfe.

## 8 · Noten

Bedienbarkeit: 6/10 · Nutzen für meine Rolle: 7/10 · Reife für Kunden: 5/10

Ich würde es morgen einsetzen, wenn der Berater daneben sitzt und übersetzt; allein im Zug nur dann, wenn die Kürzel (AC, PY, Δ-Basis, Engine, CK) Klartext bekommen, es eine Vertriebsvorlage gibt und am Ende ein Knopf „An den Berater schicken" eine Datei erzeugt.
