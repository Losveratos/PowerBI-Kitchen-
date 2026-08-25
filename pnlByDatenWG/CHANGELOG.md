# Changelog — P&L Statement byDatenWG

## 0.12.0.0 (2026-08-25) — Ein integriertes ChartKitchen-Diagramm im Kachel-Zoom, schlanker Zoom-Kopf, Design-Pass, Akzentfarbe

- **Neu: der Kachel-Zoom zeigt EIN integriertes Diagramm statt zweier.** Der
  bisherige Doppel-Chart (großer Monats-Chart + separate Brücke) weicht dem
  „integrierten Waterfall" nach dem Vorbild des ChartKitchen-Visuals — alles auf
  **einer gemeinsamen Nulllinie über die volle Breite** und mit **einer
  Werteskala**:
  - **Links zwei Anker-Säulen in voller Höhe**: das zweite Vergleichsszenario
    außen (PY grau gefüllt) und direkt neben dem Monatsband die gewählte
    Referenz (PL outlined, FC schraffiert), jeweils mit Wert-Label oben und
    Szenario-Kürzel unter der Achse. Fehlt PY, steht dort nur der
    Referenz-Anker.
  - **Untere Zone**: je Monat eine Säule — AC-Monate solide in IBCS-Dunkelgrau,
    **Forecast-Monate** (FC-Serie hat Werte, AC nicht) **schraffiert** —,
    daneben das Dreieck des zweiten Szenarios (UN 4.1) und Wert-Labels mit drei
    signifikanten Stellen. Die Labels dünnen sich automatisch aus, bis sie in
    ihren Slot passen; der letzte Monat ist immer beschriftet.
  - **Obere Zone**: die **kumulierte Δ-Brücke**. Sie startet exakt auf dem
    Niveau des Referenz-Ankers und läuft je Monat einen schwebenden Schritt
    weiter (Δ = Monatswert AC bzw. FC minus Monats-Referenz) — günstig teal,
    ungünstig rot, in Forecast-Monaten in der Δ-Farbe schraffiert, verbunden
    durch dünne Konnektorlinien, Labels mit explizitem Vorzeichen.
  - **Darüber die Δ%-Pin-Zeile** derselben Monate plus der Gesamtabweichung,
    mit eigener Achse und dem Zonen-Label „ΔPL%" (bzw. der gewählten Referenz)
    am linken Rand.
  - **Senkrechte Trennlinie** zwischen dem letzten AC- und dem ersten
    FC-Monat, darunter das Label „FC". Ohne Forecast-Monate entfällt sie.
  - **Rechts die Gesamt-Säule „AC+FC"**: AC solide gestapelt unter dem
    schraffierten FC-Anteil, Labels im Segment, Gesamtwert oben — daneben ein
    **Badge** mit der Gesamtabweichung zur Referenz in Teal/Rot als outlined
    Pille. Ohne Forecast-Monate ist die Säule schlicht AC YTD.
  - **Kopfzeile im Chart**: „PL → AC/FC · Brücke + Monatssäulen", folgt der
    Toolbar-Referenz und der Sprache. Höhe ~420 px, skaliert mit dem
    Schrift-Preset, volle Kachelbreite.
  - **Alle vollen Säulen und die Brücke teilen sich eine Skala.** Die
    Monatssäulen behalten genau diese Skala, solange sie in die untere Zone
    passen — bei einer normalen Monatsreihe immer. Nur eine entartete Reihe
    (ein, zwei Monate, die fast den ganzen Gesamtwert ausmachen) staucht sie,
    damit die beiden Zonen nie ineinander laufen.
  - **KPI-/Quotenzeilen** bekommen weiterhin den Monats-Chart plus Grid und
    eine Hinweiszeile: Prozente sind nicht additiv, deshalb gibt es dort weder
    Brücke noch AC+FC-Stapel.
  - Das Szenario-Grid (AC · PY · PL · FC YTD, Δ absolut und in %, FY-Zeile)
    steht unverändert darunter.
- **Zoom-Kopf entschlackt.** Im Kachel-Zoom blendet die Toolbar alle Gruppen
  aus, die dort nichts bewirken — Ansicht, Spalten-Preset, Perioden, Dichte,
  Karten, Bis-Ebene, Optionen. Sichtbar bleiben nur **Δ-Referenz** und
  **Einheit** (beide wirken auf den Zoom-Chart) sowie die Legende.
- **Der Zurück-Button ist jetzt das dominante Element oben links**: 13 px,
  kräftiges Padding, Akzentfarbe als Füllung mit weißer Schrift, abgerundet,
  Hover-Aufhellung, Label „← Zurück zum Baum". Der Breadcrumb sitzt vertikal
  zentriert daneben.
- **Design-Pass „modern & crisp"** — rein visuell, ohne Verhaltensänderung; die
  IBCS-Regeln bleiben unangetastet (Datenfarben weiterhin nur AC-Dunkelgrau,
  PY-Grau, PL-outlined, FC-Schraffur, Teal und Rot):
  - **Toolbar**: 4-px-Radien, ruhigere Rahmen (`#DEDCD7`), Hover als leichte
    Tönung, aktive Buttons in der Akzentfarbe, Gruppen-Labels als saubere
    Caps-Labels (8,5 px, Letterspacing) — derselbe Typo-Stil trägt jetzt auch
    die Abschnittstitel „Zahlt ein auf" / „Getrieben von" im Zoom. Übergänge
    120 ms.
  - **Baum-Karten**: feinere Kartenkante (`#E3E1DC`), sehr dezenter Schatten,
    beim Hover dunklere Kante und ein Hauch mehr Schatten; die Kante wird
    pixelgenau gerendert, Chevron-Hitareas und die ⌖-Marke treten optisch
    zurück, die Operator-Kreise und der Bus liegen auf dem Pixelraster und
    stehen damit haarscharf.
  - **Mikro-Karten im Zoom**: einheitliche Innenabstände, gemeinsame Oberkante
    mit der großen Kachel, Hover-Kante als Klick-Affordanz, Δ% mit
    Tabellenziffern.
  - **Große Kachel**: Innenabstände auf dem 8er-Raster, klare Kopf-Hierarchie
    (Name > Formel > Zeitraum), Grid mit Trennlinie in `gridSoft`.
  - **Hover-Detail-Panel**: gleiche Kartensprache wie die neuen Karten
    (Radius 6 px, leichterer Schatten).
- **Neu: Akzentfarbe der Bedienelemente** (Format → Stil → „Akzentfarbe
  Bedienelemente", Standard `#404040`). Sie färbt aktive Toolbar-Buttons, den
  Zurück-Button und den Breadcrumb-Hover — **nie Datenmarken, Achsen oder die
  AC-Säulenfarbe**. Der Standardwert entspricht exakt dem bisherigen Verhalten.
- **Tests**: 138 Interaktions-Checks (vorher 100). Neu sind der integrierte
  Zoom-Chart (PY/PL-Anker, ein Brückenschritt und eine Monatssäule je Monat,
  Δ%-Pins, Gesamt-Säule und Badge, Quotenzeile ohne Brücke), die reduzierte
  Zoom-Toolbar samt Zurück-Button, die Akzentfarbe (Override färbt den aktiven
  Button, lässt die AC-Füllung in Ruhe) und — über einen synthetischen
  Datensatz mit AC Jan..Jun und FC Jul..Sep — die komplette Forecast-Zone mit
  schraffierten Monaten, schraffierten Brückenschritten, FC-Trennlinie und
  AC+FC-Stapel. Die Demo-Daten binden keine monatliche FC-Rolle, deshalb der
  eigene Datensatz. Neue Referenz-Bühne `p11` in `test/test.html`.

## 0.11.0.0 (2026-08-25) — Kachel-Zoom im Baum, Fit-Breite, PY·PL·FC nebeneinander, Kopfzeilen-Schrift

- **Neu: Kachel-Ansicht im Treiberbaum (Klick auf das Karten-Diagramm)** — ein
  Klick auf die Diagrammfläche einer Baum-Karte (nicht auf ▾, nicht auf ⌖, nicht
  auf den Kopf) blendet den Baum aus und zeigt den Knoten als ganze Seite. Der
  Zustand (`treeZoom`) wird gespeichert, Lesezeichen stellen ihn wieder her.
  - **Kopfzeile**: Button „← Zurück zum Baum" plus Breadcrumb von der
    Baum-Wurzel bis zum Knoten — jedes Segment springt direkt dorthin.
  - **Mitte, große Kachel** (~60 % der Breite): Name, Einheit und Δ% in der
    Statusfarbe, darunter Konto-ID bzw. Formel und Zeitraum; ein **großer
    Monats-Chart** (AC solide, Referenz versetzt dahinter, Dreiecke fürs zweite
    Szenario, Wert-Labels) und darunter die **große Brücke im
    ChartKitchen-Stil**: Anker REF-YTD → ein Δ-Schritt je Monat (Teal/Rot nach
    Günstig-Logik, schraffiert wenn die Referenz ein Forecast ist) → Anker
    AC-YTD, mit Konnektorlinien, Monats-Labels unter der Achse, Werte-Labels
    außen mit explizitem „+" und referenz-kodierter Achse (grau = PY,
    Doppellinie = PL, gestrichelt = FC). Abgeschlossen vom Szenario-Grid
    (AC · PY · PL · FC YTD, Δ absolut und in %, FY-Outlook-Zeile).
  - **Links „Zahlt ein auf"**: die KPI(s)/Zwischensummen, in die der Knoten
    einfließt — aus der umgekehrten Nachbarschaft des Graphen, also auch
    mehrere; bis zu 3, der Rest als „+N weitere". Ist der Knoten die Wurzel,
    steht dort ein Hinweis statt einer leeren Spalte.
  - **Rechts „Getrieben von"**: die Operanden bzw. Hierarchie-Kinder mit ihrem
    Operator (÷ × + −) am linken Rand; bis zu 8, der Rest als „+N weitere".
  - Alle Nachbar-Karten sind Mikro-Karten mit kleinem Monats-Chart und Δ% und
    **navigieren per Klick** eine Stufe nach oben oder unten; der Hover-Detail-
    Zoom aus 0.10 bleibt auf ihnen erhalten.
  - Zeigt ein gespeicherter Zustand auf eine Zeile, die es nicht mehr gibt
    (Modellwechsel), fällt die Ansicht still auf den Baum zurück.
- **Neu: „Fit" — Tabelle ohne Querscrollen.** Neuer Toolbar-Button in der Gruppe
  Optionen (nur Tabellen-Ansichten) und ein Standard im Formatbereich
  (Spalten → „Tabelle auf Breite einpassen"). Ist Fit an und die Tabelle breiter
  als das Visual, werden die **Diagramm-Spalten** (Δ-Balken, Δ%-Pins,
  Struktur- und Waterfall-Balken) proportional gestaucht und die Zellen-
  Innenabstände reduziert, bis es passt. Die Label-Spuren schrumpfen nur wenig
  und ihre Schrift schrumpft mit — **eine Zahl wird nie abgeschnitten**. Die
  Breite der Zeilenbeschriftung wird gemessen, nicht geschätzt, deshalb sitzt
  die Tabelle nach ein bis zwei Korrekturrunden exakt im Rahmen. Sind die
  Mindestbreiten erreicht, bleibt die Tabelle so eng wie möglich und der Rest
  scrollt weiter — nichts wird kaputt gequetscht. Die einheitliche Δ-Skala
  bleibt unverändert, nur der Pixel-Maßstab ändert sich.
- **Neu: Spalten-Preset „AC vs PY·PL·FC"** — AC-Wert und dann je verfügbarer
  Referenz ein Δ-Balken plus Δ%-Pin nebeneinander, also PY, PL und FC in einem
  Blick statt in drei Presets. Die Achsen-Kodierung trennt sie sauber
  (grau = PY, Doppellinie = PL, gestrichelt = FC), und alle drei Kombinationen
  gehen in die einheitliche Δ-Skala ein. Als Toolbar-Button und als Standard im
  Formatbereich verfügbar; Bars/Waterfall bleiben bei ihrem eigenen Spaltensatz.
- **Neu: Kopfzeilen-Schrift einstellbar** (Formatbereich → Stil):
  „Schriftgröße Kopfzeilen" (0 = automatisch, sonst 7–20 px, skaliert Block-
  Titel MTD/YTD/FY und Spaltenbeschriftungen gemeinsam) und „Schriftfarbe
  Kopfzeilen" als Überschreibung. Auf automatisch bleibt das Rendering
  pixelgenau wie bisher.
- 28 neue Regressionstests (100 Tree-/Interaktions-Checks gesamt): Kachel-Zoom
  öffnen, nach unten navigieren, zurück zum Baum, unbekanntes Zoom-Ziel;
  Fit-Breite mit und ohne Clipping-Prüfung; alle sechs Δ-Spalten des neuen
  Presets samt Achsen-Kodierung; automatische und überschriebene Kopfzeilen-
  Schrift. Die Tabellen-Geometrie von p1–p7 wurde gegen 0.10 verglichen und ist
  identisch.

## 0.10.0.0 (2026-08-24) — Baum: feines Aufklappen + IBCS-Detail-Zoom beim Hover

- **Aufklappen wieder knotenweise**: der Chevron ▸ öffnet jetzt **genau diesen
  Knoten** (eine Ebene) — die Kinder behalten ihren eigenen gemerkten
  Falt-Zustand. Wer weiterhin den ganzen Ast auf einmal will: **Shift-Klick**
  auf den Chevron fächert den kompletten Teilbaum bis zu den Blättern auf.
  Tooltip und Hinweiszeile erklären beides.
- **Neu: IBCS-Detail-Zoom beim Hover** — kurz auf einer Karte verweilen
  (~0,25 s) öffnet ein Detail-Panel neben der Karte mit allem, was der Knoten
  hergibt:
  - Kopf: Name (+ Kommentar-Ziffer), Einheit, Δ% zur gewählten Referenz in der
    Statusfarbe; darunter Konto-ID bzw. Formel und der Berichtszeitraum.
  - **Szenario-Tabelle**: YTD-Wert je Szenario (AC · PY · PL · FC), Δ zu AC
    absolut und in %, Teal/Rot nach Günstig-Logik (VarianceInvert wird
    respektiert); bei FY-Daten zusätzlich die Outlook-Zeile FC FY vs. PL FY.
  - **Drei Charts in lesbarer Größe**: Monatssäulen (AC solide, Referenz
    versetzt dahinter, Dreiecke fürs zweite Szenario), Δ-Säulen je Monat in
    Teal/Rot und die Brücke Referenz → Δ → AC.
  - Fußnote mit dem Kommentartext und ggf. der Fehlerhinweis der Zeile.
  - Das Panel klemmt sich neben die Karte, weicht am rechten Rand nach links
    aus, bleibt im Sichtbereich, fängt keine Mausereignisse (kein Flackern)
    und schließt beim Verlassen der Karte oder beim Scrollen.
- 4 neue Regressionstests: Ein-Ebenen-Klick, Shift-Ast, Zoom öffnet mit drei
  Charts + Szenario-Grid, Zoom schließt wieder (72 Tree-Checks gesamt).

## 0.9.2.0 (2026-08-24) — Alt-Zustand-Migration + ⌂-Heimat-Button

Nach dem Update auf ≥ 0.9.1 blieb der Baum trotzdem zu, wenn im Report noch
ein **gespeicherter Zustand der alten Version** lag (Falt-Liste nach alter
„eine Ebene pro Klick"-Semantik, ggf. plus einer tief gesetzten ⌖-Wurzel wie
`… › EMEA › DWG Automation UK Ltd.`). Zwei Fixes:

- **Automatische Migration**: der gespeicherte UI-Zustand trägt jetzt eine
  Baum-Schema-Version (`treeV`). Zustände aus Versionen vor 0.9.1 werden beim
  Laden erkannt und ihre Baum-Felder (`treeRoot`, `treeCollapsed`) verworfen —
  der Baum startet frisch: oberste Wurzel, ganz aufgeklappt. Alle anderen
  gemerkten Einstellungen (Ansicht, Referenz, Einheit …) bleiben erhalten.
- **Neuer ⌂-Button** in der Gruppe „Bis Ebene" (nur Tree-Ansicht): ein Klick
  springt aus jeder ⌖-Um-Wurzelung zurück zur obersten Wurzel und öffnet den
  ganzen Baum. Die Gruppe erscheint jetzt auch, wenn der aktuelle (um-gewurzelte)
  Baum nur 1 Ebene tief ist — vorher fehlte dort genau der Ausweg.
- Neuer Regressionstest: alter Zustand ohne `treeV` (Re-Root + Falt-Liste) wird
  beim Laden verworfen und rendert identisch zum frischen Standard (68 Checks).

## 0.9.1.0 (2026-08-24) — Treiberbaum klappt jetzt wirklich ganz auf

Behebt „der Baum zeigt immer nur 2 Ebenen": drei Ursachen, drei Fixes.

- **Standard = ganzer Baum**: ohne Nutzer-Eingriff öffnet der Treiberbaum jetzt
  **alle Ebenen** (begrenzt nur durch das Kartenbudget), nicht mehr fix Ebene 2.
  Wer flacher starten will, setzt im Formatbereich **Spalten → „Start-Tiefe
  Treiberbaum"** (neu, 0 = ganzer Baum, 1–8 = feste Start-Ebene) — die
  Leser-Interaktion (Chevrons, Ebenen-Buttons) überstimmt das wie gehabt und
  bleibt per Bookmark/Speichern erhalten.
- **Aufklappen öffnet den ganzen Ast**: der Chevron ▸ einer zugeklappten Karte
  entfernt jetzt **alle** gemerkten Falt-Zustände unterhalb dieser Karte — ein
  Klick fächert den kompletten Ast bis zu den Blättern auf. Vorher erschien
  jede neu sichtbare Ebene wieder zugeklappt (Erbe des Ebene-2-Standards, der
  beim ersten Klick als Falt-Liste materialisiert wurde) — genau das fühlte
  sich wie „immer nur 2 Ebenen" an. Zuklappen faltet weiterhin nur genau
  diesen Teilbaum.
- **Kartenbudget jetzt ebenenweise (Breadth-First)**: die 400-Karten-Grenze
  wurde bisher **Tiefe-zuerst** verbraucht — bei echten, großen Modellen fraß
  der erste Ast das ganze Budget, spätere Äste bekamen **stumme Chevrons ohne
  Kinder** (Klick ohne Wirkung). Jetzt wird das Budget in Ebenen-Reihenfolge
  vergeben: ein zu großer Baum verliert gleichmäßig nur die tiefste Ebene.
  Nicht gebaute Zweige zeigen statt eines toten Chevrons ein **„+N"** mit
  Tooltip-Hinweis, den Ast per ⌖ als eigenen Baum (mit frischem Budget) zu
  öffnen.
- Ebenen-Buttons zählen nur noch tatsächlich gebaute Verzweigungen; Chevron
  erscheint nur, wenn wirklich Kinder da sind (oder die Karte zugeklappt ist).
- Neue Regressionstests: Standard-Aufklappung des ganzen Baums, Autoren-Tiefe 2,
  Ein-Klick-Aufklappen eines kompletten Asts (jetzt 67 Tree-Checks).

## 0.9.0.0 (2026-08-24) — Treiberbaum: echtes Tidy-Tree-Layout, Eltern-Bus, Operatoren am richtigen Ort, Kompakt-Karten

- **Echtes mehrstufiges Baum-Layout (Reingold–Tilford, vereinfacht)**: die
  Karten werden im **Post-Order** platziert — die Blätter eines Teilbaums
  bekommen fortlaufende Y-Slots, jeder Elternknoten sitzt danach **exakt auf der
  vertikalen Mitte seines eigenen Kinder-Blocks**, die X-Position ist die
  **Ebenen-Spalte** (Kartenbreite + fester Spaltenabstand 64 px). Damit fächern
  mehrere gleichzeitig geöffnete Ebenen als Baum auf, statt in einer Spalte zu
  verschmelzen. Beispiel Pharma-Demo mit drei offenen Ebenen:
  `Net margin ÷ (Net income | Net revenue) + (Pharmaceuticals · Consumer Health
  · Contract manufacturing)`.
- **Geschwister-Gap 10 px, Teilbaum-Gap 18 px**: zwei benachbarte Blätter stehen
  eng beieinander, sobald einer der beiden Nachbarn selbst verzweigt, trennt der
  **größere Teilbaum-Abstand** die beiden Äste — ein aufgeklappter Ast liest als
  gruppierter Block, zwei Äste stoßen nie aneinander.
- **Verbindungen als Eltern-Bus (DuPont-Vorbild)**: pro Elternkarte gibt es
  **einen** kurzen waagerechten Stich von der Kartenmitte nach rechts zu einem
  **senkrechten Bus**, von dort läuft je ein orthogonaler Ellbogen in die Mitte
  jeder Kind-Karte. Der Bus liegt bei 62 % des Spaltenabstands, also **im Spalt
  zwischen zwei Ebenen-Spalten** — er kreuzt nie eine fremde Karte.
- **Operatoren an der richtigen Stelle**: tragen **alle** Kanten eines Elternteils
  denselben Operator (reine Summe, reines Produkt, Division mit zwei Operanden),
  steht **ein** Kreis (r = 10 px, weiß, Rand `#404040`, Operator fett) auf dem
  Stich zwischen Karte und Bus — „÷" damit klassisch am Eltern-Stich. Nur bei
  **gemischten** Operatoren (z. B. „+" und „−" im Hierarchie-Drill von
  *Other operating result* oder *Financial result*) wird je Kante beschriftet:
  ein **kleiner Kreis (r = 8 px) auf dem Kinder-Ellbogen kurz vor der Kind-Karte**.
  **Keine Operator-Kreise mehr zwischen den Geschwistern auf der Stange** — das
  war der Grund, warum der Baum wie eine Liste wirkte.
- **Automatische Kompakt-Karten bei tiefen Bäumen**: ab **Baum-Ebene 4** (oder
  wenn die Gesamthöhe des Layouts sonst mehr als das **Dreifache der
  Stage-Höhe** wäre) zeichnet die Karte nur noch **Titel · AC-Wert · Δ%-Label**
  ohne Mini-Chart, Höhe ~44 px statt 104 px. Das ist **Format-Pane-unabhängig
  und automatisch**; die Kartengröße folgt weiterhin `fontScale`/Dichte.
  Chevron ▸/▾, Fadenkreuz ⌖ und der farbige Status-Rand bleiben auch auf
  Kompakt-Karten, und ein `<title>`-Tooltip nennt die **Monatswerte**, die das
  Mini-Chart sonst gezeigt hätte (inkl. FC-Kennzeichnung).
- **Sauberkeit**: Karten unterschiedlicher Höhe verschieben ihren Kinder-Block
  nach unten statt nach oben, wenn eine Elternkarte höher ist als ihr Block —
  ein Ast wächst nie in den Ast darüber. Breadcrumb- und Hinweiszeilen-Abstände
  bleiben unverändert (fester 10-px-Abstand zur ersten Kartenreihe).
- **Interaktionstest erweitert** (`test/tree-interact.js`, jetzt 63 Checks): die
  gezeichnete Geometrie wird aus den SVG-Linien zurückgerechnet (Bus, Stich,
  Ellbogen) und geprüft auf gleichmäßige Ebenen-Spalten, **genau einen Bus je
  verzweigender Karte**, **Bus im Spalt zwischen den Spalten**, **kein
  Operator-Kreis auf dem Bus**, „ein Operator am Stich bei einheitlichem Zweig /
  einer je Kante bei gemischtem Zweig", **Blatt-Gap unter Geschwistern vs.
  Teilbaum-Gap zwischen Kindern verschiedener Eltern**, Überlappungsfreiheit in
  beide Richtungen sowie die Kompakt-Karten (Höhe, Chevron/⌖/Status-Rand,
  Monats-Tooltip).
- Nur die Baum-Ansicht ist betroffen: die Karten-Renderer (`months`, `delta`,
  `bridge`) sind unverändert, Tabelle, Struktur-Balken und Waterfall rendern
  pixelidentisch zu 0.8.0.0 (per Stage-Screenshot-Hash verifiziert).

## 0.8.0.0 (2026-08-24) — Treiberbaum: Versatz-Säulen mit Szenario-Dreiecken, Hierarchie-Drill, ruhigeres Layout

- **Monats-Karten in klassischer IBCS-Versatz-Notation (UN 4.1)**: die
  Referenz-Säule steht nicht mehr konzentrisch hinter der AC-Säule, sondern
  **dahinter und um 40 % einer Säulenbreite nach rechts versetzt**, dabei ein
  Viertel breiter — AC solide `#404040` im Vordergrund links, die Referenz
  dahinter rechts. Die Füllung der Referenz folgt dem Szenario: **PL weiß mit
  Rand, PY grau gefüllt, FC schraffiert**. FC-Monate bleiben die schraffierte
  AC&FC-Front-Säule. Die Referenz ist jetzt die **Toolbar-Referenz** und nicht
  mehr fest PL.
- **Szenario-Dreiecke für den zweiten Vergleich (UN 4.1)**: ist neben der
  Haupt-Referenz noch ein weiteres Szenario gebunden (z. B. PY bei Ref = PL),
  bekommt jede Säule rechts daneben ein **kleines Dreieck auf Werthöhe**, das
  auf die Säule zeigt und die Szenario-Füllung trägt — mit `<title>`-Tooltip
  („PY 245"). Statt einer dritten Säule pro Monat bleibt die Karte damit
  lesbar. Die Dreiecke bekommen einen eigenen Streifen am rechten Chartrand,
  damit das letzte Dreieck nicht auf seine Säule zurückgedrängt wird.
  Die Label-Disziplin bleibt: **max. drei Werte-Labels** je Karte.
- **Fallback ohne Monatsdaten** zeigt statt drei getrennten Szenario-Säulen
  **eine Versatz-Gruppe** AC · Referenz · Dreieck über den ganzen Zeitraum.
- **Hierarchie-Drill im Baum**: der Baum verzweigt nicht mehr nur entlang der
  Formel-Operanden. Karten **ohne** Formel (Subtotals, bebuchbare Konten) tragen
  jetzt ebenfalls einen **Chevron ▸/▾** und klappen ihre **Kontenhierarchie**
  als Karten auf. Operator am Verzweigungskreis ist die **Vorzeichen-Konvention
  des Kindes** — „+" für Ertragszeilen, **„−" für Kostenzeilen** (`sign === -1`),
  sodass die Verzweigung als „Umsatz − Kosten" lesbar bleibt. Eine Karte hat
  immer nur **eine** Art Kinder: Formel-Operanden **oder** Hierarchie-Kinder.
  Beispiel-Pfad: `Net margin ÷ Net income + EBT + EBIT + EBITDA + Gross profit
  → Cost of goods sold → Materials · Production · Other cost of sales` (−).
- **Ebenen-Buttons, `treeCollapsed` und das Karten-Budget (400) gelten für beide
  Verzweigungsarten**; die Karten-Reihenfolge ist die Hierarchie-Sortierung.
- **Re-Root auf Hierarchie-Karten**: das Fadenkreuz ⌖ sitzt jetzt auf **jeder**
  verzweigenden Karte, also auch auf Subtotals. Die Breadcrumb-Zeile ist
  generisch und führt von der Standard-Wurzel bis zur gewählten Karte zurück
  (z. B. „Net margin › Net income › EBT › EBIT › EBITDA › Gross profit").
- **Ruhigeres Layout**: die Eltern-Karte sitzt **exakt auf der vertikalen Mitte
  ihres Kinder-Blocks**; zwischen zwei Geschwister-**Teilbäumen** liegt ein
  zusätzlicher Abstand (14 px), damit ein aufgeklappter Ast als Block liest
  statt in die Spalte darüber zu verschmelzen; unter Breadcrumb und
  Hinweiszeile steht ein **fester Abstand von 10 px** zur ersten Kartenreihe.
  Die Ellbogen-Linien bleiben orthogonal (Eltern-Mitte → Verzweigungskreis →
  Kind-Mitten); beim Auf- und Zuklappen überlappt keine Karte eine andere.
- **Neuer Interaktionstest `test/tree-interact.js`** (`npm run test:tree`, auch
  Teil von `npm test`): fährt Chevrons auf Formel- **und** Hierarchie-Karten,
  die Ebenen-Buttons, das ⌖ auf einer Subtotal-Karte, die Breadcrumb, alle drei
  Karten-Modi, den Status-Toggle und den Referenz-Wechsel PL ↔ PY durch und
  prüft danach jeweils den Baumzustand — inklusive **Versatz** (Ref-Rect x ≠
  AC-Rect x, Ref breiter, Ref zuerst gezeichnet), **Dreiecke** samt Tooltip,
  Label-Disziplin, exakter Eltern-Zentrierung, Überlappungsfreiheit und
  Clipping. 37 Checks.
- **Tests**: `p8` zeigt jetzt Versatz-Säulen mit PY-Dreiecken **und** den
  aufgeklappten Net-revenue-Hierarchiezweig, `p9` das Re-Root auf Gross profit
  mit Breadcrumb und dem COGS-Drill („−"), `p10` unverändert die Δ-Säulen gegen
  PY. `p1–p7` rendern **pixelidentisch** zu 0.7.0.0 (per Screenshot-Vergleich je
  Stage verifiziert).

## 0.7.0.0 (2026-08-24) — Treiberbaum: echtes Auf- und Zuklappen, drei Karten-Diagramme, Status-Indikator

- **Echtes Expand/Collapse statt fester Tiefe 4**: jede Karte mit Formel-Operanden
  trägt unten rechts einen **Chevron ▸/▾** in einem kleinen Rahmen (klare
  Klick-Affordanz, Tooltip „Aufklappen"/„Zuklappen"). Der Klick klappt **nur
  diesen Teilbaum** auf oder zu, der Zustand landet als `treeCollapsed` im
  persistierten UI-State (bookmark-fähig), und das Layout fließt nach — ein
  zugeklappter Teilbaum zeigt weder Ellbogen-Linien noch Operator-Kreise.
  Voreinstellung: **bis Ebene 2 offen** (Wurzel + direkte Operanden), tiefere
  Ebenen zu. Eine harte Tiefenbegrenzung gibt es nicht mehr; breite Bäume
  scrollen horizontal (Sicherheitsbudget: 400 Karten gegen entartete
  Formel-Graphen).
- **Ebenen-Buttons wieder in der Tree-Ansicht**: die Toolbar-Gruppe „Bis Ebene"
  (1 · 2 · 3 … · Alle) steuert jetzt auch die **Baum-Tiefe** über den
  Formel-Graphen — das Gegenstück zu `collapseToLevel` in der Tabelle.
- **Re-Root vom Klappen getrennt**: der Kartenkörper re-rootet nicht mehr.
  Stattdessen sitzt oben rechts in jeder Formel-Karte ein gezeichnetes
  **Fadenkreuz ⌖** („Als Wurzel anzeigen"). Bei aktivem Re-Root steht über dem
  Baum eine **Breadcrumb-Zeile** („Net margin › Net income › EBT") mit
  klickbaren Segmenten zurück bis zur Standard-Wurzel — das alte „↩" entfällt.
- **Neue Toolbar-Gruppe „Karten"** (nur im Tree, `treeCard`, Format-Pane-Default
  unter *Spalten*) mit drei Diagrammtypen je Karte:
  - **Monate** (überarbeitet, strenger IBCS): AC solide `#404040`, PL als
    **breitere outlined Säule dahinter** (Überlappungs-Notation wie in der
    Bars-Ansicht), FC-Monate schraffiert (AC&FC-Composite). Gegen die
    Gedrängtheit: Werte-Labels **nur an erster Säule, letzter Säule und dem
    betragsmäßigen Extremum** (max. 3 Labels, drei signifikante Stellen),
    Perioden-Labels nur am ersten und letzten Monat, Säulenbreite aus der
    Kartenbreite berechnet (**Lücke ≥ 40 % der Säulenbreite**), durchgezogene
    Nulllinie, keine Gridlines. Ohne Monatsdaten: zwei bis drei
    Szenario-Säulen AC · PL · PY mit Labels.
  - **Δ (neu)**: IBCS-**Varianzsäulen je Monat**, Δ = AC − Referenz (Toolbar-
    Referenz; die Gruppe „Δ Referenz" ist im Tree wieder eingeblendet). Säulen
    in good/bad-Farbe unter Beachtung von `VarianceInvert`, die **Achse kodiert
    die Referenz** (grau = PY, Doppellinie = PL, gestrichelt = FC), Labels nur
    an den ein bis zwei größten Ausschlägen (nie an zwei Nachbarn), „+" bei
    positiven Abweichungen, `pp` bei Kennzahlen-Zeilen.
  - **Brücke (neu)**: **horizontale Mini-Brücke** in der Optik der IBCS KPI
    Card — Referenz-Balken (PY grau / PL outlined / FC schraffiert) → schwebendes
    **Δ-Segment** in good/bad-Farbe → AC-Balken solide, mit Zeilen-Labels REF ·
    Δ · AC und Werten (YTD, `computed`). Kein Achsenkreuz, keine Gridlines, nur
    der Null-Anker. Fehlt die Referenz, bleibt der AC-Balken allein.
- **Indikator-Farbe der Karten** (`treeStatus`, Standard an, Toggle „Status" in
  der Karten-Gruppe): die Karte bekommt einen **3 px breiten linken Rand** in
  good/bad-Farbe und im Kopf rechts neben der Einheit ein kleines **Δ%-Label**
  in derselben Farbe („+" explizit). Ohne Referenz oder ohne Δ bleibt die Karte
  neutral — ohne Rand, ohne Label. Die Kartenfläche bleibt **weiß** (IBCS),
  Farbe trägt ausschließlich die Abweichung.
- **Vorzeichen-Logik der Karten vereinheitlicht**: Geometrie und Zahl folgen dem
  **angezeigten** Wert (eine Kostenzeile mit `DisplayInvert` steigt, wenn ihr Δ
  steigt), die **Bewertung good/bad** bleibt die rohe aus `variance()` wie in der
  Tabelle. Damit steht nie mehr „+10,3" neben „−9,4 %" auf derselben Karte.
- **Tests**: `test/test.html` bekommt **p9** (Tree · Mini-Brücke · Status an ·
  Teilbaum EBT über `uiState.treeCollapsed` zugeklappt) und **p10** (Tree ·
  Δ-Säulen gegen PY · Teilbaum EBIT zugeklappt); **p8** zeigt jetzt Chevrons,
  Status-Ränder und die Default-Tiefe 2. Der Clipping-Check von `test/shot.js`
  deckt die neuen Karten mit ab. Die Fälle **p1–p7 rendern pixelidentisch** zu
  0.6.0.0 (per Screenshot-Vergleich je Stage verifiziert).

## 0.6.0.0 (2026-08-13) — Treiberbaum-Ansicht (DuPont)

- **Vierte Ansicht „Tree" — IBCS-Werttreiberbaum**: neben Table, Bars und
  Waterfall zeichnet das Visual jetzt den **Formel-Graphen** als DuPont-Baum.
  Die Wurzel ist eine Formel-/KPI-Zeile, ihre `FormulaDef`-Operanden verzweigen
  nach rechts, und der **Operator sitzt als Kreis am Verzweigungspunkt**
  (× ÷ + −). Der Baum wird nicht modelliert, sondern **aus den vorhandenen
  Formeln abgeleitet** — wer `[Net income]/[Net revenue]` schon für die
  Netto-Marge geschrieben hat, bekommt den Treiberbaum ohne ein einziges
  zusätzliches Feld.
- **Neuer Engine-Baustein** `formulaOperands(node, resolve)`: parst
  `FormulaDef` mit dem bestehenden Parser und liefert die referenzierten Zeilen
  in Lesereihenfolge samt verbindendem Operator — rein multiplikativ ⇒ `×`,
  Division ⇒ `÷`, Summen ⇒ `+`, Subtrahend ⇒ `−`, gemischte Formeln je Kante
  (`[a]*[b]+[c]` ⇒ `×`,`×`,`+`). Referenzen lösen wie im Rechenkern per Id und
  danach per **eindeutigem Zeilennamen** auf (`nodeResolver`), unauflösbare
  Referenzen fallen still heraus statt den Baum zu sprengen.
- **Karten wie im IBCS-Vorbild**: weiße Karte (1 px `#D8D6D1`, 4 px Radius),
  Titel fett links, Einheit grau rechts, darin ein **Mini-Säulenchart der
  Monatsreihe** — AC solide `#404040`, PL als breitere **outlined**-Säule
  dahinter (IBCS-Vergleichsnotation), durchgezogene Nulllinie, Werte-Labels
  außerhalb der Säule (bei negativen Werten **unter** der Nulllinie), erste und
  letzte Periode beschriftet (`Jan AC` … `Jun AC·PL`), keine Gridlines.
  Zahlen im Chart mit maximal **drei Stellen** (IBCS UN 1). Liegen keine
  Monatsdaten an, zeigt die Karte stattdessen **AC · PL · PY** als zwei bis drei
  Säulen aus den berechneten Werten (PY grau `#9A9A9A`). KPI-Zeilen erscheinen
  in %, Formelfehler stehen rot in der Karte.
- **Navigation im Baum**: Klick auf eine Formel-Karte macht sie zur neuen
  Wurzel (Zustand `treeRoot` wird wie alle Toolbar-Zustände persistiert und ist
  bookmark-fähig); ein kleines **„↩"** in der Wurzelkarte führt zum
  Standard-Root zurück. Es werden vier Ebenen gleichzeitig gezeigt — tiefer
  geht es per Re-Root. Verbindungen sind Ellbogen-Linien in `#B4B4B4`.
- **Standard-Wurzel**: die letzte Formel-/KPI-Zeile in P&L-Reihenfolge, die
  überhaupt Operanden hat — in der Pharma-Demo also `Net margin`
  (= `Net income` ÷ `Net revenue`). Autoren können im Format-Pane unter
  *Spalten* eine **Wurzelzeile** (Id oder eindeutiger Name) fest vorgeben.
- **Toolbar folgt der Ansicht**: im Tree blendet die Toolbar die für ihn
  bedeutungslosen Gruppen (Spalten-Presets, Δ-Referenz, Perioden, Ebenen,
  Optionen) aus; Ansicht, Einheit und Dichte bleiben. Titelblock, Legende,
  Kommentar-Fußnoten und der IBCS-Footer bleiben unverändert — Kommentare der
  im Baum gezeigten Zeilen werden weiterhin durchnummeriert (①).
- **Tests**: neuer Engine-Testblock für `formulaOperands` (DuPont-Kette
  `ROI = ROS × CT`, `ROS = Ret ÷ Sales`, gemischte und kaputte Formeln,
  Namensauflösung im Sternschema) und neuer Render-Fall **p8** (Tree-Ansicht
  auf den Pharma-Demodaten) in `test/test.html`; der Clipping-Check von
  `test/shot.js` deckt damit auch die Kartenbeschriftungen ab. Die bestehenden
  Fälle rendern unverändert — bis auf den zusätzlichen Toolbar-Knopf „Tree".

## 0.5.0.0 (2026-08-02) — Performance-Paket: Segment-Laden, Fenster-Rendering, Memoisierung

- **Segmentiertes Laden statt harter 30k-Kappung**: die Kategorien nutzen jetzt
  `dataReductionAlgorithm: window` (30.000 Zeilen je Segment) und
  `host.fetchMoreData(true)`. Jedes Segment wird **sofort gerendert**, das
  nächste direkt angefordert — die ersten Ebenen stehen nach dem ersten
  Segment, statt auf den vollständigen Kontenplan zu warten.
- **Ehrliche Lade-Anzeige** (Governance-Kernprinzip: nie stillschweigend
  falsche Zwischensummen): solange Segmente ausstehen, zeigt eine Statuszeile
  „⏳ n Zeilen geladen … Zwischensummen noch unvollständig", jede Summen-,
  Formel- und KPI-Zeile trägt ein „≈" mit Tooltip, und die Fußnoten-Sektion
  führt den Hinweis mit. Sind alle Segmente da, verschwindet der Marker
  rückstandsfrei. Der Zeilenlimit-Warnhinweis erscheint nur noch, wenn der
  Host die Gesamtmenge tatsächlich kappt (`fetchMoreData` abgelehnt).
- **Fenster-Rendering der Tabelle**: ab 300 sichtbaren Zeilen landen nur die
  Zeilen im Scroll-Viewport (+30 Puffer) im DOM, oben und unten tragen zwei
  Platzhalter-Zeilen die Resthöhe; der Scroll-Handler ist per
  `requestAnimationFrame` gedrosselt. Auf-/Zuklappen, Toolbar, Sparklines und
  die Scroll-Position bleiben erhalten; **Kommentar-Fußnoten werden weiterhin
  über alle sichtbaren Zeilen nummeriert**, nicht nur über die gerenderten.
- **Memoisierung**: `parseRows` + `buildModel` laufen nur noch, wenn sich die
  Daten wirklich geändert haben (Fingerprint aus Spalten-Identität, Zeilenzahl,
  erstem/letztem Kategorienwert und Measure-Prüfsummen). Die teuren
  O(Zeilen)-Scans in `render()` (Δ-Maxima, Label-Breiten, Kaskaden-Segmente,
  Balken-Extrema) liegen in zwei Caches, die bei neuem Modell bzw. bei
  Wechsel von Ansicht/Preset/Referenz/Perioden/Einheit/Format invalidieren.
  Toolbar-Klicks parsen weiterhin nie neu.
- **Neuer Perf-Testfall** `npm run test:perf` (`test/perf.js`): 5.000 Konten ×
  12 Monate (Level-Modus, 4 Ebenen, deterministische Werte), misst per
  Playwright Erst-Render und Expand-Rerender und schlägt oberhalb von
  1500 ms / 300 ms fehl; prüft zusätzlich, dass das Fenster-Rendering aktiv
  ist und das Scrollen bis zur letzten Zeile trägt.

Messwerte (5.000 Konten × 12 Monate = 60.000 Zeilen, alle Ebenen aufgeklappt,
`test/perf.js`, Median aus 3 Läufen auf der Build-Maschine):

| Messung                          | 0.4.1.0 | 0.5.0.0 | Faktor |
| -------------------------------- | ------- | ------- | ------ |
| Erst-Render (bis erster Paint)   | 2723 ms |  385 ms |  ~7×   |
| Expand-Rerender                  | 2298 ms |   82 ms |  ~28×  |
| Update mit unveränderten Daten   | 3382 ms |   64 ms |  ~53×  |
| Zeilen im DOM                    |    5032 |      64 |        |

Der allererste (kalte) Lauf vor der Änderung lag bei 5675 ms Erst-Render und
5579 ms Expand — genau das Verhalten aus dem Nutzer-Report.


## 0.4.1.0 (2026-08-02) — Konsistente Blöcke, Toolbar-Kuration, Schrift-Presets, Farben

- **MTD-Block jetzt auch in der Tabelle** (AC · REF · Δ · Δ% aus dem letzten
  Monat der Auswahl) — Perioden-Toggles wirken konsistent über Table,
  Waterfall und Bars (Bars: YTD/FY)
- **Toolbar-Kuration im Format-Pane**: jede Gruppe (Ansicht, Presets,
  Δ-Referenz, Perioden, Einheit, Dichte, Ebenen, Optionen) einzeln
  ein-/ausblendbar — Autoren bestimmen, was Leser umschalten dürfen
- **Schriftgrößen-Presets** HD (kompakt) / Full HD / UHD-Präsentation
  (skaliert Zeilenhöhen, Schrift und Balkengeometrie)
- **Farb-Overrides** für günstige/ungünstige Δ (Color Picker) zusätzlich zu
  den beiden Modi Teal/IBCS-Grün — Corporate-Farben mit dokumentierter
  Abweichung möglich


## 0.4.0.0 (2026-08-02) — Perioden-Blöcke MTD | YTD | FY mit AC&FC-Outlook

- Neue Toolbar-Gruppe **„Perioden"**: MTD, YTD und FY als zu-/abschaltbare
  Blöcke — im Waterfall bis zu **drei Kaskaden-Paare nebeneinander**
  (MTD aus dem letzten Monat der Auswahl, YTD, FY-Ausblick), jeweils mit
  eigenen Δ-Balken und Δ%-Pins
- **FY-Ausblick als AC&FC-Composite** (IBCS: „outlined füllt sich beim
  Materialisieren"): realisierter AC-Anteil solide, FC-Rest schraffiert,
  verglichen gegen PL Gesamtjahr
- MTD-Varianzen rechnen aus der Monatsserie (letzter Monat des Filters);
  PL hat jetzt ebenfalls eine Monatsserie
- Eine gemeinsame Skala über alle Kaskaden-Blöcke (IBCS UN 5.2: gleiche
  Einheit = gleiche Skala) und eine gemeinsame Δ-Skala über alle Blöcke
- FY-Block in Tabelle und Bars respektiert den Perioden-Toggle


## 0.3.2.0 (2026-08-02) — Zeilen-Waterfall als dritte Ansicht

- Neue Ansicht **Waterfall** (klassische IBCS-GuV-Kaskade, zusätzlich zu
  Table und Bars): Referenz-Spalte und AC-Spalte als horizontale
  Zeilen-Wasserfälle — Beiträge floaten auf der laufenden Summe,
  Formelzeilen (Gross profit, EBITDA, …) ankern als volle Balken an der
  Achse und setzen die Kaskade zurück; Kinder kaskadieren innerhalb des
  Eltern-Segments (Aufklappen funktioniert). Daneben Δ-Balken und Δ%-Pins
  gegen die Toolbar-Referenz.
- Szenario-Notation in der Kaskade: AC solide, PY grau, PL outlined,
  FC schraffiert; Assisting Line an der Laufkante; Labels außen
  (Zuwachs rechts, Abnahme links), Summen fett; eine gemeinsame Skala
  für beide Kaskaden-Spalten.


## 0.3.1.0 (2026-08-02) — Struktur-Balken statt Waterfall (CFO-Feedback)

- Die Waterfall-Ansicht ist durch eine **Struktur-Balken-Ansicht** ersetzt
  (IBCS UN 3.4: Struktur auf der vertikalen Achse): je Zeile ein horizontaler
  AC-Balken mit der Referenz (PL outlined / PY grau) dahinter, daneben
  Δ-Balken und Δ%-Pin gegen die Toolbar-Referenz; FY-Block mit schraffierten
  FC-Balken vs. PL. Nutzt dieselbe Hierarchie inkl. Aufklappen/Ebenen-Buttons,
  eine gemeinsame Balken-Skala über alle Zeilen (IBCS: gleiche Einheit =
  gleiche Skala), Werte-Labels außen.
- Persistierter Zustand `view: "waterfall"` migriert automatisch zu `"bars"`.
- Das Waterfall-Modul bleibt im Quellbaum (src/waterfall.ts, ungenutzt) für
  eine mögliche spätere Verdichtungs-Ansicht.


## 0.3.0.0 (2026-08-02) — Sample-Parität: Toolbar, FY-Block, Waterfall, Sparklines

Kompletter Rendering-Neubau nach dem Konzept-Demo (HTML-Sample), Rechenkern
erweitert. Sternschema (L1..Ln) ist der primäre Modus.

- **In-Visual-Toolbar für Report-Leser** (per Format-Pane abschaltbar, Zustand
  bookmark-fähig persistiert): Ansicht Table/Waterfall · Spalten-Presets
  (AC·PY·PL·FC, AC vs Ref, AC·PY·ΔPY, AC·PL·ΔPL, ΔPY%·ΔPL%) · Δ-Referenz ·
  Einheit k/m · Dichte Normal/Compact · Ebenen-Buttons · % vom Umsatz ·
  Nullzeilen ausblenden
- **Zwei Periodenblöcke**: YTD (AC·PY·PL) + FY-Outlook (FC vs PL) mit neuen
  Measure-Slots `FC Gesamtjahr`/`PL Gesamtjahr` (Skalare, first-wins);
  FY-Δ-Balken schraffiert (Minuend FC), Pin-Köpfe outlined — IBCS-Notation
- **Monats-Grain**: neue Rolle „Periode (Monat)" — Werte werden zu YTD
  aggregiert, je Zeile 12M-Sparkline (AC solide, PY dünn grau, FC gestrichelt)
  inkl. Subtotal-Rollup und Formel-Auswertung pro Monat
- **Δ-Achsen kodieren die Referenz** (IBCS): grau = PY, Doppellinie = PL,
  gestrichelt = FC; einheitliche Δ-Skala über alle Zeilen mit Skalen-Hinweis
- **Teal-Abweichung als Default** (#0E8585/#E02B1D, Rot-Grün-sicher) mit
  dokumentiertem Deviation-Hinweis in Legende und Footer; klassisches
  IBCS-Grün per Format-Pane
- **Kommentare**: neue Rolle „Kommentar" → nummerierte Marker ①② an der Zeile
  + Fußnoten-Sektion; Datenqualitäts-Signale (Waisen, Zyklen, Formelfehler)
  erscheinen dort ebenfalls
- **%-vom-Umsatz-Spalte** (Basiszeile automatisch = erste Wurzelzeile,
  per Format-Pane überschreibbar), Konten-IDs klein vor dem Namen,
  Margen-/KPI-Zeilen kursiv mit pp-Deltas
- **Waterfall-Ansicht** derselben Daten (Umsatz → Jahresüberschuss,
  Formelzeilen als Anker, Assisting Lines, IBCS-Szenario-Fills)
- 3 neue Engine-Testblöcke (20 gesamt), Waterfall-Modultest mit
  Geometrie-Checks, neue Render-Testfälle mit Pharma-Demodatensatz


## 0.2.0.0 (2026-08-01) — Sternschema-Modus (Level-Spalten L1..Ln)

Zweiter Eingabemodus für die Hierarchie, wie er im Sternschema üblich ist:

- Neues Field Well **„Ebenen-Spalten (L1..Ln)"** (bis 8 Spalten, Reihenfolge =
  Ziehreihenfolge) als Alternative zu AccountID/ParentID — Parent-Child bleibt
  voll unterstützt und gewinnt, wenn Parent-ID gebunden ist
- Ragged-Regeln (beide): leere tiefere Level → letzte gefüllte Ebene ist das
  Blatt; wiederholter Inhalt (L2 = L1) → Hierarchie endet dort
- Zeilen mit gleichem Pfad werden aggregiert (feineres Fact-Grain); eine
  Aggregat-Zeile (z. B. PY nur auf L1) wirkt als per-Szenario-Fallback
- Formelzeilen referenzieren per eindeutigem **Zeilennamen**
  (`[Umsatzerlöse]+[Betriebsaufwand]`) — funktioniert auch im
  Parent-Child-Modus zusätzlich zur ID
- Synthetische Zwischensummen erben `DisplayInvert`/`VarianceInvert`, wenn
  alle Kinder einheitlich sind (Kostenblock bleibt positiv angezeigt)
- IBCS-Notation unverändert in beiden Modi
- Neue Demo `demoData/guv-demo-levels.csv`, 4 neue Engine-Testblöcke
  (17 gesamt), Render-Testfall p10


## 0.1.1.0 (2026-08-01) — Review-Fixes

Befunde aus einem unabhängigen Code-Review umgesetzt:

- **Rechenkern**
  - Zeilen in Parent-Child-Zyklen (x→y→x) landen jetzt sichtbar im
    Waisen-Bucket statt still zu verschwinden (+ Warnung)
  - Summenzeilen: Eigenwert als **per-Szenario-Fallback**, wenn Kinder für
    ein Szenario keine Daten liefern (z. B. PY nur auf Aggregatsebene)
  - `SignConvention` wirkt jetzt auch auf Subtotals mit Kindern
  - Teilbäume unter Separator-/Formel-Zeilen erzeugen eine Warnung statt
    still aus Summen zu fallen
  - Formel-Fehler propagieren sichtbar zu konsumierenden Formeln
    (`ref [id]: …` statt stilles Leer)
  - Deutsche Zeilentyp-Synonyme (Zwischensumme, Kennzahl, Marge, Trennzeile),
    tolerantere Sign-/Bool-Erkennung („-", „negativ", „wahr", „j")
- **Rendering**
  - Δ-/Δ%-Spaltenbreiten passen sich der breitesten Beschriftung an —
    keine abgeschnittenen Zahlen mehr (Geometrie-Check im Render-Test)
  - k/m-Skalierung und Δ-Balken-Skala über **alle** Zeilen statt nur
    sichtbare — stabil beim Auf-/Zuklappen
  - „Keine Daten für die aktuelle Auswahl" statt Landing Page, wenn Filter
    alles entfernen; Warnungen aggregiert mit Tooltip
- **State**: per Bookmark hereingereichter Expand-Zustand wird übernommen;
  Format-Pane-Änderung der Standard-Ebene greift wieder; Persist-Mechanik
  verklemmt nicht mehr in Read-only-Hosts; State wird gegen das Modell bereinigt
- **Parsing**: String-Measures (DirectQuery), `trim()` auf Schlüsseln,
  NaN-sichere Sortierung, Hinweis bei 30k-Zeilenlimit
- Tests: 6 neue Engine-Testblöcke, Worst-Case-Rendertest (EUR-Rohwerte,
  Skalierung none), SVG-Clipping-Assertion im Screenshot-Harness


## 0.1.0.0 (2026-08-01) — MVP / Phase 1

Erste Version nach Anforderungsdokument „Best-in-Class P&L Standalone Visual",
Umfang F1–F4, F7, F9 + IBCS-Basisnotation + Landing Page.

- Rechenkern (`src/engine.ts`, PBI-frei, unit-getestet):
  - unbalancierte Parent-Child-Hierarchie, Waisen → sichtbarer
    „Nicht zugeordnet"-Bucket
  - Subtotals mit SignConvention, bebuchbare Zwischenknoten
    (eigener Wert + Kinder)
  - Formel-Engine für `FormulaDef` (`[Ref]`, `+ - * /`, Klammern, unäres Minus,
    Dezimalkomma), Formel-auf-Formel, Zirkelbezug- und Parse-Fehler je Zeile,
    Division durch 0 → leer statt Crash
  - Formel-/KPI-Zeilen fließen nie in Eltern-Summen (kein Doppelzählen)
  - Δ/Δ% gegen wählbare Referenz, VarianceInvert, DisplayInvert
- Rendering:
  - IBCS-Tabelle: Szenario-Chips (AC solide, PY grau, PL Rahmen, FC Schraffur),
    fette Summenzeilen mit Ergebnislinie, Einrückung je Ebene
  - Δ-Balken (absolut) und Δ%-Pins mit einer gemeinsamen Skala je Spalte,
    Überlauf-Marker, Labels außerhalb mit explizitem `+`
  - KPI-/Margen-Zeilen in %, Δ in Prozentpunkten, vom EUR-Maßstab entkoppelt
  - Expand/Collapse je Zeile + Ebenen-Buttons, Zustand persistiert
    (bookmark-fähig, übersteht Cross-Filter)
  - 3-zeiliger Titelblock + Message-Zeile, Skalierung Auto/k/m,
    de/en-Zahlenformat aus der Host-Locale, Landing Page, Kontextmenü
- Tooling: Engine-Unit-Tests, Headless-Render-Harness (8 Fälle inkl.
  Datenqualitäts-Edge-Cases), eslint, `pbiviz package`

Bekannte Grenzen (bewusst, siehe README-Roadmap): kein Virtual Scrolling,
kein `fetchMoreData` (Top-30k-Reduktion), Icon ist Platzhalter der KPI Card.
