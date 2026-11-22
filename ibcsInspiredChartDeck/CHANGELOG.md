# Changelog · ChartKitchen byDatenWG

## 1.57.0.0 (in Arbeit)

- **B20 · Marimekko (nach IBCS-Blatt 02F).** Vorher: 100-%-Balken hatten immer gleich hohe Zeilen, die Größe einer
  Zeile stand nur im Summenbalken daneben; 02F (Zeilendicke nach Umsatz) war nicht abbildbar. Nachher (Format Chart →
  Darstellung, nur Balken mit 100 %):
  - **„Zeilendicke“** (`chart.stackThickness`: `equal` | `total`, Standard `equal`): Mit „Nach Zeilensumme
    (Marimekko)“ ist jede Zeile so dick wie ihre Summe, die Fläche eines Segments ist sein Wert. Wirkt nur mit
    gestapelten Balken, gebundener Serie und wirksamen 100 % (keine negative Zelle); bei Werten und bei Säulen ohne
    Wirkung. Die Zeilen stoßen aneinander, getrennt durch eine Haarlinie (1 px). Σ-Zeile, Zwischensummen und
    Blockabstand behalten die normale Zeilenhöhe, den Rest teilen die Zeilen nach Summe. Sehr dünne Zeilen bekommen
    eine Mindestdicke (3 px, Hochkontrast 5 px), der Rest wird neu verteilt; passt nicht einmal die Mindestdicke, steht
    im Bearbeitungsmodus der Hinweis auf Top N. Zeilen mit Summe 0 entfallen.
  - **Beschriftung:** Die Segmente zeigen die Werte statt der Anteile (die Dicke trägt die Größe), ebenso der Mix der
    Σ-Zeile. Ein Segmentwert steht nur, wenn die Zeile mindestens eine Schrifthöhe dick und das Segment breit genug
    ist, sonst im Tooltip (zusätzlich „Anteil an Gesamt“). Zeilennamen und Zahlen der Spalten werden gierig gesetzt:
    ein Label entfällt, wenn es ein schon gesetztes berührt; Hervorhebung, Rest-Zeile und dickste Zeile zuerst, dann von
    oben. Keine überlappenden Zahlen wie auf dem Blatt. Rest-Zeilen samt Zahlen kursiv. Seriennamen in der
    Schlüsselzeile über den Segmenten der ersten Zeile.
  - **Summenspalte:** Das Summen-Panel wird zur Zahlenspalte (fette Kopfzeile „Σ AC (↓)“, Zahlen rechtsbündig,
    Blocksummen und Gesamtsumme fett); Breite aus dem Textmaß. Bedingung wie das Panel (Σ an, ab 280 px Breite).
  - **„Anteilsspalte“** (`chart.stackShareColumn`, bool, Standard aus, sichtbar bei 100-%-Balken): Spalte „Anteil“ mit
    dem Anteil jeder Zeile an der Gesamtsumme (eine Nachkommastelle), „100 %“ an der Σ-Zeile, Blockanteil an der
    Zwischensumme (dann ohne Ellipse). Im Marimekko neben der Zahlenspalte (entfällt zuerst, wenn beide mehr als 30 %
    der Breite brauchen), ohne Marimekko hinter dem Summenbalken (02D + Anteil).
  - **Weiter nutzbar:** Sortierung (`sortMode` ac oder series), Top N mit „Rest (n)“, Stapel-Blöcke mit Zwischensummen
    (eine Dickenskala über alle Zeilen), Small Multiples (Dicke und Anteil je Kachel), FC schraffiert, PL umrandet,
    Differenzmarker, Hervorhebungsband in Zeilenhöhe, Dunkel und Hochkontrast. Pfeil und Zeilenanteil der
    Hervorhebung (B10 Teil 2) entfallen im Marimekko (kein Abstand über der Zeile, der Anteil steht in der Spalte).
  - **Vorlage C25 · Marimekko (02F)**, Galerie-Gruppe „Struktur“, braucht „Stack-Serie“: orientation=bars ·
    stackNormalize=pct100 · stackThickness=total · stackShareColumn · showTotal · stackTotalRow · sortMode=ac ·
    stackLegendDirect · ohne Abweichungen. Eine Vorlage mit `sortMode` gilt im selben Rendern als gespeicherte
    Sortierung.
  - Geometrie: die Slot-Tabelle aus B10 Teil 2 hat jetzt `slotY`/`slotH` (Zeile: `barW`/`rowH`); mit gleicher Dicke
    exakt die bisherigen Ausdrücke. Hash aller 701 Harness-Stufen vorher/nachher: geändert nur die Galerie-Stufen
    c222b, c229, c230 (neue Kachel C25). Testmarker (`data-icd`): Wurzel `data-thickness="total"`, `stack-mekko-row`
    (`data-cat`, `data-total`, `data-h`, `data-clamped`), `stack-total-col` mit `stack-total-num` (`data-total`),
    `stack-share-col` mit `stack-share` (`data-share`, `data-i`), `stack-share-block`, `stack-share-grand`,
    `stack-mekko-skip` (`data-kind` name, total, share, seg), `stack-mekko-hint`; Segment- und Mix-Texte tragen
    `data-v`, `stack-total-seg` im Marimekko `data-share`. 942 resjson-Keys je Sprache. Tests c960 bis c985.
  - Abweichungen vom Blatt: Zahlen mit höchstens drei Ziffern (Regel des Visuals seit 1.52: 173 statt 172.5, Summe
    497 statt 497.2), Seriennamen in der Schlüsselzeile über dem Panel-Titel statt direkt über der ersten Zeile,
    „Rest of world“ proportional dick (auf dem Blatt dünner als France), keine Säulen-Variante.
  - **Nach dem Review:**
    - **Beschriftung in niedrigen Kacheln:** Vorher fiel ein Label weg, sobald die Zeilenmitte zu nah an einem schon
      gesetzten lag, auch in dicken Zeilen; in 1280 × 190 verlor die 15 px dicke Rest-Zeile Name, Summe und Anteil,
      während 3-px-Zeilen ihr Label bekamen. Jetzt rutscht das Label in einer Zeile, die dicker als die Schrift ist,
      innerhalb der Zeile so weit, bis es frei steht; Segmentwerte, Summe und Anteil stehen auf derselben Linie. Die
      Reihenfolge ist Hervorhebung, Rest-Zeile, dann nach Dicke (dickste zuerst) statt von oben. Name, Summe und Anteil
      werden gemeinsam gesetzt (Abstand nach der größeren der beiden Schriften), nie mehr ein Name ohne Zahl.
    - **Vorlage C25 und Sortierung:** Ein Update ohne Host-Echo (Größe, Daten) nach dem Anwenden von C25 ließ die
      Zeilen unsortiert, bis das Echo kam. Jetzt gilt die Sortierung der Vorlage, solange der Echo-Schutz ihre Werte
      hält.
    - **Blockanteil ohne Anteilsspalte:** Mit Blöcken, „Blockanteil“ und Marimekko, aber ohne Anteilsspalte stand kein
      Blockanteil mehr (1.56 zeigte ihn im Panel). Jetzt steht er in einer Ellipse hinter der Zwischensumme und „100 %“
      hinter der Σ-Zahl; die Zahlenspalte wird dafür breiter, solange die 30-%-Regel es erlaubt, sonst entfällt er wie
      die Anteilsspalte. Ganz ohne Spalten (schmal) steht er wie bisher am Balkenende.
    - **Referenzlinie und Gruppentrenner** lagen hinter den aneinanderstoßenden Zeilen und waren unsichtbar. Im
      Marimekko liegen beide jetzt über den Zeilen, der Trenner als Linie in Tintenfarbe auf der Haarlinie.
    - **Differenzmarker:** Das Label saß auf der Grenze zweier Zeilen. Jetzt steht es auf der Beschriftungslinie der
      Zielzeile, wenn sie mindestens Schrifthöhe + 4 px dick ist; in dünneren Zeilen bleibt es an der Kante.
    - **Kleinigkeiten:** Panel-Titel im Marimekko „Werte · Länge = Anteil, Dicke = Summe“ statt „Anteile in %“
      (neuer Key `Title_StackMekko`). Bei gemischten Szenarien (AC und FC) bleibt kein leerer Platz für die
      entfallende Σ-Zeile. Mit „Beschriftungen anzeigen“ aus entfallen die Segmentwerte, Summen- und Anteilsspalte bleiben
      (sie sind Tabellenspalten; aus über „Summen-Kopfzeile (Σ)“ bzw. „Anteilsspalte“).
    - Tests c986 bis c989 (Update ohne Echo, Wechsel C25 → C04, Blockanteil mit und ohne Anteilsspalte, Anteilsspalte
      mit Blöcken ohne Marimekko, Referenzlinie und Trenner, Beschriftung aus, Differenzmarker, Tooltip, Auswahl,
      480 × 300), dazu Prüfungen in c967 (Rest-Zeile behält ihre Labels) und c976. Hash aller Stufen: geändert nur
      B20-Stufen (Titel; c967, c977 Beschriftung; c973 ohne leeren Σ-Platz; c982 Label des Differenzmarkers).

- **B18 · Scatter-Zeitpfad mit Quotenstrahlen (Blätter 07D und 07E, Vorlage C23).** Vorher: Der Scatter zeigte je
  Kategorie einen Punkt; eine Entwicklung über die Jahre ließ sich nur mit dem Play-Button nacheinander zeigen, eine
  Quote wie „Umsatz je Mitarbeiter“ nur über eine eigene Measure. Nachher:
  - **„Zeitpfad“** (`chart.scatterPath`, `off` | `line`, Standard `off`, Gruppe „Scatter / Bubble“): Datenvertrag des
    Play-Modus ohne neue Rolle, Kategorie = Periode (Reihenfolge wie geliefert), Stack-Serie = Einheit, AC = Y,
    X-Achse = X; ohne Serie ein einziger Pfad. Je Einheit eine dünne Linie (1 px, Gruppenfarbe bzw. AC-Farbe,
    Hochkontrast Vordergrund) unter den Punkten. Fehlt X oder Y oder liegt ein Punkt außerhalb fixierter Achsen, bricht
    der Pfad dort; eine Periode ohne Zeile wird durchverbunden. Segmente in eine Prognose-Periode sind gestrichelt,
    FC-Punkte hohl. Der Name der Einheit steht am Endpunkt (bei Hervorhebung fett, Pfad 2 px), die Gruppen-Legende
    entfällt. Der Pfad schaltet Bewegungspfeile und PY-Blasen ab; Quadranten und Trend bleiben wählbar.
  - **„Periodenlabels“** (`chart.scatterPathLabels`, `auto` | `ends` | `all` | `off`, Standard `auto`): Versuchsfolge
    oben, rechts, unten, links über die gemeinsame Kollisionsliste. Erste und letzte Periode jeder Einheit stehen
    immer, Zwischenperioden bei `auto` nach Platz, bei `all` immer. Vierstellige Jahre lesen sich als „'17“.
  - **„Pfeil am Pfadende“** (`chart.scatterPathArrow`, Standard aus) und **„Start-Ende-Abweichungen“**
    (`chart.scatterPathDelta`, Standard aus): für hervorgehobene Einheiten (ein einzelner Pfad ohne Serie zählt als
    hervorgehoben) Hilfslinien vom ersten und letzten Punkt zu den Achsen, Δ X als Pfeil unter der X-Achse (neutral),
    Δ Y als Pfeil rechts neben dem Plot in Gut- bzw. Schlecht-Farbe.
  - **„Quotenstrahlen (Scatter)“** (`scale.ratioRays`, Text, Liste mit `;`, Gruppe „Scatter-Achsen“) und **„Einheit
    der Quotenstrahlen“** (`scale.ratioRayUnit`): Strahlen Y = k · X vom Ursprung bis zum Achsenende, hohler Kreis an
    Austritt und Ursprung, Label „1,00 mEUR/Rep“ über dem Austritt. Die Strahlen ziehen die 0 in beide linearen Achsen,
    eine automatische Obergrenze endet dann auf einem runden Wert. Quoten ≤ 0 werden ignoriert, auf Log-Achsen ohne
    Ursprung gerechnet. Kacheln: Strahlen in jeder Kachel, Labels oben nur in der ersten Zeile, rechts nur in der
    letzten Spalte. Der Tooltip nennt die Quote Y ÷ X jedes Punkts.
  - **Play:** Mit Play-Button wächst der Pfad bis zum gezeigten Frame (beim Abspielen fließend, ohne Strichelung), die
    Periodenlabels ruhen während des Abspielens; Exporte zeigen den ganzen Pfad.
  - **Vorlage C23** (Galerie-Gruppe Zeitverlauf, braucht „X-Achse (Scatter)“): `orientation=scatter`,
    `scatterPath=line`, `scatterPathLabels=auto`, `scatterColorBy=group`, `scatterQuadrant=off`, `scatterTrend=off`,
    `scatterArrows=false`, `scatterPlay=false`. Rezept 07E zusätzlich `scale.ratioRays=1; 0,7; 0,35`,
    `scale.ratioRayUnit=mEUR/Rep`, Achsen 0 bis 20 und 0 bis 14; Rezept 07D zusätzlich `highlight=Trucks`,
    `scatterPathDelta=true`.
  - Testmarker (`data-icd`): `scatter-paths`, `scatter-path` (`data-series`, `data-n`), `scatter-path-head`,
    `scatter-path-labels`, `scatter-path-label` (`data-cat`, `data-series`), `scatter-path-name`,
    `scatter-path-guides`, `scatter-path-delta` (`data-axis`, `data-v`) mit `scatter-path-delta-head`, `scatter-rays`,
    `scatter-ray` (`data-k`), `scatter-ray-end` (`data-x`, `data-y`), `scatter-ray-origin`, `scatter-ray-label`,
    `scatter-hint-path`. Ohne die neuen Optionen sind alle Bestands-Stufen SVG-gleich (Hash aller 701 Stufen; geändert
    nur die Galerie-Stufen c222b, c222d, c229, c230 und c230b um die Kachel C23). Tests c900 bis c917. 953 resjson-Keys
    je Sprache.
  - Abweichungen von den Blättern: Y-Ticks in Fünfer- statt Zweierschritten (bestehende Tick-Regel), die Achsen reichen
    um den Markerrand über 20 bzw. 14 hinaus (die Strahlen enden trotzdem genau dort), Δ X neutral statt blau, keine
    Ellipse um „−4“ (Botschaftsmarke des Titels), Ländernamen in 07E rechts statt über dem Endpunkt, wo Platz ist.

## 1.56.0.0 (2026-11-22, Backlog IBCS-Templates Teil 3)

- **B13 Teil 2 · Nur Abweichungs-Panel (Blätter 13C und 13D).** Vorher: Kacheln gegen den Durchschnitt zeigten
  unter dem ΔØ-Panel immer auch ihre Säulen, 13C und 13D waren nur teilweise abbildbar. Nachher:
  - **„Nur Abweichungs-Panel“** (`chart.varianceOnly`, bool, Standard aus, Gruppe „Small Multiples“, nur Säulen und
    Balken ohne Stapel und ohne Wasserfall-Stil, wirkt nur mit Small Multiples): Jede Gruppen-Kachel zeigt nur ihr
    Abweichungs-Panel, mit „Absolute Abweichung“ die ΔØ-Balken (13C), mit „Relative Abweichung“ die ΔØ %-Pins (13D),
    mit beiden zwei Panels. Alle Kacheln teilen eine Δ-Skala über die gezeichneten Kacheln ohne Bezugskachel (eine
    summierte Σ-Abweichung staucht die Skala nicht). Kategorie- und Szenario-Beschriftung stehen unten, helle
    Hilfslinien führen von jeder Marke zur Kategoriezeile, die Plan-Grenze läuft durch das Panel. Wirkt auch mit der
    Szenario-Basis (ΔPY bzw. ΔPL).
  - **Bezugskachel:** behält ihre Säulen über die ganze Höhe auf eigener Skala. Mit absolutem Δ nutzt sie den px-Wert
    je Einheit der ΔØ-Panels (gemessen an einer Gruppen-Kachel gleicher Größe), wenn ihre Werte hineinpassen, sonst
    eine runde Verkleinerung mit Faktor im Panel-Titel („AC · PL ×0,5“). Nur mit Δ % gibt es keinen Vergleich, sie
    skaliert für sich.
  - **Plan-Notation:** Planjahre bleiben wie in Teil 1 umrandet mit blasser Füllung (Balken) bzw. mit hohlem Kopf (Pins).
  - **Ausgeschaltet in dieser Ansicht** (ganze Kachelgruppe): Kommentar-Marken, Hervorhebungsband, Differenzmarker (B09),
    Jahressäule (B05), Σ-Kopf, Referenzlinie, gleitender Durchschnitt und Kombi-Linie der Gruppen-Kacheln, doppelte
    Abweichung. Kacheln unter 110 px Höhe (Säulen) bzw. 240 px Breite (Balken) fallen auf die normale Ansicht zurück.
  - Testmarker (`data-icd`): `var-only` je Δ-Kachel (`data-px-per-unit`, `data-panels` = `abs`, `rel` oder beides),
    `var-only-fallback`, `var-only-ref` an der Bezugskachel (`data-px-per-unit`, `data-factor`, `data-k-delta`),
    `var-only-guides` mit `var-only-guide`. Mit der Option aus sind alle 485 Harness-Stufen SVG-gleich. Tests c700 bis
    c710. 838 resjson-Keys je Sprache. Abweichungen zu den Blättern: Berlin über zwei Zeilen (13B-Heldenkachel) fehlt,
    Panel-Titel „ΔØ“ oben links statt rechts an der Nulllinie, Kategoriebeschriftung nach Platz statt fest jedes
    sechste Jahr.
  - **Nach dem Review:** Kacheln, die zu klein für die Δ-Ansicht sind, zeigen jetzt wirklich die normale Ansicht.
    Vorher nahm die Bezugskachel dort eine eigene, nicht ausgewiesene Skala, die Δ-Skala ließ eine summierte
    Σ-Abweichung weg und Kommentar-Marken, Hervorhebungsband und Differenzmarker fehlten; jetzt fällt die Bezugskachel
    mit zurück und alles ist SVG-gleich mit der Ansicht ohne Option (`var-only-fallback` trägt `data-px-per-unit`).
    Die Heldenkachel ist in der Δ-only-Ansicht aus und im Formatbereich ausgeblendet, ebenso die doppelte Abweichung:
    Eine größere Heldenkachel zeichnete Δ auf anderem px-Wert je Einheit, und als Bezugskachel maß sie ihren Peer in
    der Heldenzelle („×0,5“ im Titel statt des wahren ×1,32); jetzt misst die Bezugskachel immer eine Gitterkachel
    gleicher Größe (im Zoom die gezoomte Gruppe). Δ % steht in Δ-Kacheln ganzzahlig (Blatt 13D, vorher eine
    Nachkommastelle mit überlappenden Labels bei Dichte „alle“). Hochkontrast: Plan-Δ mit gestricheltem Rand (Balken)
    bzw. Stiel (Pins), günstige bleiben gefüllt (vorher wie ungünstiges Δ hohl). Hilfslinien nur an beschrifteten
    Kategorien. Die Bezugskachel beachtet ein festes Maximum der Werteachse (`scale.fixedMax`, mit Kappung als hartes
    Ende) und zeigt bei Mittelwert-Aggregation keinen Σ-Kopf mehr. Der Schalter ist ohne absolute und relative
    Abweichung ausgeblendet. Die Hervorhebung als Ellipse bleibt in den Δ-Kacheln (13C markiert Zahlen, nur das Band
    entfällt). Tests c711 bis c725; geändert: c701 (Standarddichte, ganzzahlige Δ %), c705 (Ø-Kachel ohne „Σ 100“),
    c706 (Bezugskachel fällt mit zurück), c709 (Hochkontrast-Signatur).

- **B10 Teil 2 · Stapel-Blöcke mit Zwischensummen (nach IBCS-Blatt 02A).** Vorher: Gestapelte Balken mit Kategorie-Hierarchie (Region › Land) zeigten jede Zeile als „Europe · Switzerland“ in einer Liste, Sortierung und Top N wirkten über alle Zeilen, und es gab keine Zwischensumme je Region, keinen Blockanteil und keine Pfeile. Nachher (Format Chart → Darstellung, nur Balken mit Hierarchie):
  - **„Stapel-Blöcke“** (`chart.stackBlocks`: `off` | `gap` | `subtotals` | `subtotalsButLast`, Standard `off`): Die erste Kategorie-Ebene bildet Blöcke, die Zeilen zeigen nur die unteren Ebenen („Switzerland“, bei drei Ebenen „DACH · Switzerland“). „Abstand zwischen Blöcken“ setzt eine halbe Zeile zwischen die Blöcke; „Zwischensumme je Block“ hängt unter jeden Block eine fette Summenzeile mit Linie, Blockname, Summe je Serie (Farbfeld) und Blocksumme („Europe 1.120 · 1.107 · 871 = 3.098“), bei 100 % einen Balken mit dem Blockmix; „Zwischensummen außer letztem Block“ lässt sie am letzten Block weg (wie 02A, dort folgt die Σ-Zeile). Ein Block mit gemischten AC-, FC- und PL-Zeilen bekommt keine Zwischensumme (Regel der Σ-Zeile). Sortierung und Top N wirken je Block, „Rest (n)“ bleibt im Block, die Blöcke folgen bei Sortierung der Blocksumme (absteigend), sonst der Datenreihenfolge; Rest-Zeilen („Rest of Europe“) erkennt die Regel am Blattnamen. Mit Blöcken entfallen die Anteils-Klammer und die Gruppentrenner (`groupEvery`); Differenzmarker finden Zeilen auch über den Blattnamen. Im Summen-Panel bei 100 % steht in der Zwischensummen-Zeile nur die fette Blocksumme.
  - **„Blockanteil“** (`chart.stackBlockShare`, Standard aus, nur mit Zwischensummen): Anteil des Blocks an der Gesamtsumme in einer Ellipse hinter der Blocksumme („83 %“), „100 %“ hinter der Σ-Zeile und über hervorgehobenen Zeilen deren Anteil („USA 8 %“).
  - **Pfeil an hervorgehobenen Zeilen:** Bei `highlightStyle` = Ellipse und eingeschalteten Stapel-Blöcken zeigt ein Pfeil ▼ auf das Balkenende hervorgehobener Zeilen (vorher nur fetter Name), auch per Blattname („Switzerland, USA“). Gestapelte Balken ohne Blöcke bleiben wie 1.55 (nur fetter Name).
  - Mit `off` zeichnet alles wie 1.55, auch mit Hierarchie. Positionen laufen jetzt über eine Slot-Tabelle; SVG-Hash aller 485 bestehenden Harness-Stufen vorher und nachher gleich. Bekannte Abweichungen zum Blatt: Linie über der Zwischensumme über die volle Breite (Blatt: kurz), Zahlen der Rest-Zeilen aufrecht, Blocksumme mit „=“, Ellipse um ein einzelnes Segment nicht abgebildet, Blöcke nur für Balken. Rezept 02A: `orientation=bars`, `sortMode=ac`, `stackBlocks=subtotalsButLast`, `stackBlockShare=true`, `stackTotalRow=true`, `stackTotalLabel=World`, `highlight=Switzerland, USA`, `highlightStyle=ellipse`.
  - Tests c830 bis c849c (Render-Harness).
  - **Nach dem Review:**
    - **Aufklappen:** Power BI liefert ohne Drill nur die oberste Ebene. Mit `stackBlocks` ≠ `off`, gebundener Stack-Serie und drillbarer Kategorie klappt das Visual die Hierarchie jetzt selbst auf (wie Tabelle und GuV über `autoExpandHierarchy`, einmal je Feld-Konstellation, ein Hochklappen des Nutzers bleibt). Gestapelte Balken ohne Blöcke klappen nie auf, bestehende Berichte ändern sich nicht. „Stapel-Blöcke“ steht im Formatbereich schon bei drillbarer Kategorie (vorher erst, wenn zwei Ebenen geliefert waren). Im Harness geprüft über einen Drill-Spion (c851); im Desktop noch nicht verifiziert.
    - **Nachbarzeile:** Liegt eine hervorgehobene Zeile unter einer längeren Zeile desselben Blocks (bei Sortierung der Normalfall), steht der Zeilenanteil rechts neben der eigenen Summe auf Zeilenhöhe und der Pfeil ist höchstens so hoch wie der Zeilenabstand (unter 6 px entfällt er). Vorher lagen beide auf dem Balken und der Summe der Zeile darüber (c852).
    - **Negative Summen:** Ist ein Block oder die Gesamtsumme negativ, entfallen alle Anteile (vorher „126 %“ und „−26 %“), ebenso der Anteil einer negativen Zeile (c853).
    - **Pfeil nur mit Blöcken** (c854, siehe oben). Rest-Zeilen bei drei Ebenen („DACH · Rest of DACH“) erkennt die Regel am Blattnamen: kursiv und bei Sortierung am Blockende (c856, Stufe c846 entsprechend geändert).
    - **Dunkles Erscheinungsbild (Fix seit 1.55):** Die Stapel-Rampe lief auch im Dunkelmodus vom hellen AC-Ton zu Hellgrau, die Werte der hellen Segmente standen hell auf hell. Jetzt läuft sie zum dunklen Grau, die Textfarbe folgt dem Ton (höherer Kontrast), gemeinsam mit der gestapelten Fläche. Betrifft gestapelte Säulen und Balken im Dunkelmodus (keine bestehende Harness-Stufe betroffen); hell und Hochkontrast unverändert (c855).
    - Beschreibung: mit Sortierung folgen die Blöcke der Blocksumme, sonst der Datenreihenfolge; Top N zählt je Block. es-ES „Proporción del bloque“ statt „Cuota“.
    - Tests c851 bis c856.
    - **Schalter „Hierarchie automatisch aufklappen“ (Schlussrunde):** stand nur in der Gruppe „Tabelle“ und war bei Balken nicht zu erreichen. Mit `stackBlocks` ≠ `off` steht er jetzt in „Darstellung“ direkt nach „Stapel-Blöcke“, sonst wie bisher in „Tabelle“ (ein Schalter, je nach Modus in einer Gruppe); die Beschreibung nennt Balken und Fläche (c857).

- **B11 Teil 2 · Bestand und Fluss: Aggregation über die Zeit, YTD, Fluss-Zoom (Blätter 08E bis 08H, Zoom nach 08G).** Vorher: Jede Zusammenfassung über die Zeit war eine Summe, auch für Bestände (Jahressäule, Tabellenbaum, Trend-Perioden, Kartenwert „Summe“, Σ-Kopf); im Modus `stockflow` war der YTD-Knopf gesperrt; neben einem großen Bestand (Headcount 255 bis 275) blieben Zu- und Abgänge wenige Pixel hoch; widersprüchliche Daten (Bestandsänderung ≠ Netto) fielen nicht auf. Nachher:
  - **„Aggregation über die Zeit“** (`chart.timeAggregation`, `sum` | `last`, Standard `sum`, Gruppe „Daten & Zeit“, sichtbar in Säulen, Linie, Tabelle, Karten und Bestand & Fluss): Mit `last` nehmen YTD/QTD/R12 (keine laufende Summe, der YTD-Knopf ist dann gesperrt), die Jahressäule (Beschriftung „Ende“ statt „Σ“, Δ des letzten Monats), der Tabellenbaum samt Σ-Zeile und Matrix-Σ, über die Trend-Rolle zusammengeführte Perioden, der Kartenwert „Summe“ und der Σ-Kopf („Ende 263“) den letzten Wert: die letzte Periode mit Ist oder Forecast, sonst die letzte mit Plan oder Vorjahr. **Zeilen mit dem Token `stock` tun das immer**, auch mit `sum`; über Einheiten, Regionen, Spaltengruppen und Small-Multiples-Kacheln bleibt ein Bestand eine Summe.
  - **YTD im Modus `stockflow`:** `chart.cumulative` und der YTD-Knopf kumulieren die Flüsse je Art (Ist, danach Plan angehängt), der Bestand bleibt wie geliefert; YTD setzt bei Monatsnamen am Fiskaljahresbeginn zurück, sonst beim Wechsel der obersten Hierarchie-Ebene (Jahr). Gesperrt nur noch bei nur Bestandszeilen.
  - **„Flüsse vergrößern“** (`chart.sfFlowZoom`, Standard aus): Flüsse und Netto mit dem größten runden Faktor aus 2, 4, 5, 10 … , der die vergrößerten Flüsse unter einem Drittel des Bestands hält; ein Skalenband zeigt denselben Wert im Bestands- und im Fluss-Maßstab, „×5“ steht an Netto-, Zu- und Abfluss-Namen. Ein Faktor für alle Kacheln.
  - **Konsistenzhinweis** im Bearbeitungsmodus, wenn Bestand[t] − Bestand[t−1] vom Netto[t] abweicht (Toleranz eine halbe Einheit der Beschriftung; nicht bei YTD und nicht in Σ-, Ø- und Rest-Kacheln).
  - **Verhaltensänderungen:** Ein Bericht mit `stock`-Zeilen und Jahressäule, Tabellenbaum, Trend-Rolle oder Kartenwert „Summe“ zeigt jetzt den letzten Wert statt der Summe; im Modus `stockflow` ist der YTD-Knopf frei (Stufe c610 entsprechend angepasst). Ohne `stock`-Zeilen und mit Standardwerten zeichnen alle Stufen SVG-gleich.
  - Tests c730 bis c743.
  - **Nach dem Review:**
    - **Letzter Wert nur über Zeitebenen.** Vorher nahm das Token `stock` (und `timeAggregation` = `last`) im Tabellenbaum, in der Σ-Zeile und in der Matrix auch über Strukturebenen den letzten Wert (Bilanz Gruppe › Konto: Assets 300 statt 600, Σ Total 250 statt 1.000; Konto › Monat: Σ Total 320 statt 440; Matrix mit vier verschiedenen Regeln). Nachher gilt der letzte Wert nur über Ebenen, deren Beschriftungen Perioden sind (Jahr, Quartal, Monatsname, Woche, Datum, ein- bis zweistellige Zahl), in Zeilen wie in Matrix-Spalten (Quartale als Spalten: Σ-Spalte = letztes Quartal). Konten, Regionen, Werke summieren, auch für `stock`-Zeilen und für ausdrücklich gewähltes `last`. Gemischte Kinder (Struktur unter einem Knoten, Zeit darunter) summieren je Periode und nehmen dann die letzte Periode mit Ist oder Forecast. **Verhaltensänderung:** eine flache Tabelle oder ein Baum ohne Periodenebene zeigt mit `timeAggregation` = `last` wieder die Summe.
    - **YTD im Modus `stockflow` über die gemeinsame Periodenachse.** Vorher lief die laufende Summe je Flussart über die vorhandenen Zeilen der Art; fehlte eine Zeile (leere Measure, im Langformat der Normalfall), setzte YTD nicht zurück (Abgänge Feb 2026 −32 statt −2, Kopf „Σ Layoffs 54“ statt 24) und Monate ohne eigene Zeile hatten kein Segment. Nachher läuft jede Art über alle Perioden der Kachel ab ihrem ersten Auftreten, fehlende Perioden bekommen eine Zeile mit dem laufenden Wert (Szenario der Periode, keine Auswahl); Zeilen mit laufendem Wert 0 entfallen. Folge: auch Tage ohne Bewegung (08E, Wochenende) zeigen jetzt ihr YTD.
    - Kleinigkeiten: Tooltip der Jahressäule mit letztem Wert in einem FC-Monat nennt „FC“ statt „AC&FC“.
    - Tests c744 bis c751.

- **B16 · Gestapelte Fläche (Blatt 08A).** Vorher: Blatt 08A ließ sich nur als gestapelte Säulen (C01) bauen, ohne Flächen, ohne Summenlinie und ohne Werte in den Flächen; die Vorlage C07 war reserviert. Nachher:
  - **„Stapel-Form“** (`chart.stackShape`, „Säulen“ | „Fläche“, Standard Säulen, Formatbereich Chart → „Darstellung“, nur bei Säulen): Mit gebundenem Feld „Stack-Serie“ zeichnet „Fläche“ denselben Stapel als gestapelte Fläche über die Zeit. Datenvertrag, Serienreihenfolge (wie geliefert, erste Serie unten und am dunkelsten), Small-Multiples-Skala und 100 % (`stackNormalize`) bleiben wie bei den Säulen. Ein Punkt je Periode in der Mitte der Periode; das Blatt setzt die Punkte auf die Monatsgrenze, ChartKitchen ordnet Stromgrößen ihrer Periode zu (bewusste Abweichung). Je Serie und Szenario-Lauf eine geschlossene Fläche mit Trennlinien in Papierfarbe, darüber die Nulllinie.
  - **„Summenlinie“** (`chart.areaTotalLine`, Standard an): Linie mit Punkt und Summe je Periode über dem Stapel (Ist gefüllt, Forecast schraffiert, Plan hohl), Summenlabels nach Priorität (letzte, erste, Hervorhebung, Szenariogrenze, Maximum und Minimum, dann nach Platz). Bei 100 % nie.
  - **„Werte in den Flächen“** (`chart.areaValueLabels`, „Automatisch (ausdünnen)“ | „Erste und letzte Periode“ | „Aus“, Standard automatisch): ein Wert nur, wo die Fläche mindestens Schrifthöhe plus 2 px hoch ist; Werte an den Enden stehen innerhalb der Fläche; Textfarbe nach Kontrast.
  - Seriennamen rechts neben der letzten Periode auf halber Höhe ihres Bandes (mit `stackLegendPos` = „Links“ links neben der ersten), ohne Überlappung; passen sie nicht oder bei Small Multiples die Legendenzeile wie im Stapel. Achsengruppen aus der Kategorie-Hierarchie (Jahr unter dem ersten Monat, kurzer Trennstrich am Jahreswechsel; „Achsengruppen“ `axisGroups` gilt jetzt auch hier).
  - Szenarien wie B06: das Stück zwischen zwei Punkten trägt das Szenario des rechten Punkts; Forecast in der Serienschraffur, Plan getönt mit Umriss; Grenzstrich am letzten Punkt davor, Szenario-Kürzel unter der Achse.
  - Durchgehend negative Serien stapeln unter null (die Summenlinie zeigt das Netto); wechselt eine Serie das Vorzeichen, bleibt es bei gestapelten Säulen mit Hinweis im Bearbeitungsmodus. Eine Periode ohne Werte unterbricht Flächen und Linie, eine einzelne Periode zwischen Lücken wird als schmaler Stapel gezeichnet, eine fehlende Zelle zählt 0. Ohne Serie bleiben einfache Säulen (Hinweis im Bearbeitungsmodus), bei zu wenig Platz ein Platzhinweis.
  - Tooltip je Periode und Serie mit Anteil und Periodensumme, Auswahl und Cross-Highlight über eine unsichtbare Zelle (abgeblendet wird mit einem Papierschleier), Kommentar-Marker über dem Summenpunkt, Hervorhebung als Band oder als Ellipse um die Summe, Hochkontrast mit Papierfüllung und Umrissen.
  - **Vorlage C07 · Gestapelte Fläche (08A)**, Galerie-Gruppe „Zeit“: orientation=columns · stackShape=area · areaTotalLine · areaValueLabels=auto · stackLegendDirect · stackLegendPos=end · showTotal=false · scenarioLabels. Die Blatt-Reihenfolge (Priority 1 oben) entsteht über die Sortierung der Serienspalte im Modell (Priority 6 zuerst); die Töne folgen der Lieferreihenfolge, die oberste Serie ist am hellsten (auf dem Blatt am dunkelsten).
  - Mit `stackShape` = „Säulen“ (Standard) zeichnen alle bisherigen Stufen unverändert (SVG-Hash). Nicht abgebildet: Differenzmarker und YTD in der Fläche, liegende Variante, Seriennamen nur in der letzten Kachel einer Small-Multiples-Zeile.
  - Tests c800 bis c823 (Render-Harness), AREA08A in `test/scale.html`.
  - **Nach dem Review:**
    - **Aufklappen:** Mit „Fläche“, gebundener Stack-Serie und `axisGroups` ≠ „Aus“ klappt das Visual eine drillbare Kategorie (Jahr › Monat) selbst auf, einmal je Feld-Konstellation; gestapelte Säulen nie (c824). Im Desktop noch nicht verifiziert.
    - **Dunkles Erscheinungsbild:** Rampe vom AC-Ton zum dunklen Grau statt zu Grau 200 (vorher sechs fast gleiche helle Töne), Werte in den Flächen in der Textfarbe mit dem höheren Kontrast zum Ton (vorher hell auf hell). Stufe c817 entsprechend geändert, Kontrast ≥ 3 geprüft (c826).
    - **Kappung:** `capOverflow` wirkt nicht auf die Fläche (vorher flache Fläche und flache Summenlinie ohne Bruchzeichen); `fixedMax` erweitert die Skala weiter. Der Schalter ist bei „Fläche“ im Formatbereich verborgen (c824, c825).
    - **Trennlinien** in Papierfarbe nur über AC- und FC-Stücken; Plan-Stücke behalten ihren Umriss ohne gestrichelten Zickzack (Stufe c805 geändert).
    - **Seriennamen** neben der letzten Periode mit Werten, wenn die letzten Perioden leer sind (c827). **Hervorhebung** findet eine Periode auch über ihren Blattnamen („Jul“ trifft Jul 2024 und Jul 2025); die Ellipse ohne Summenlinie oder ohne Labels fällt aufs Band zurück (c828).
    - **Negative Serien:** Werte, die unter der Netto-Summe oder ihrem Punkt lägen, entfallen (Stufe c807 geändert); sind alle Serien negativ, bleibt die Zeile des Paneltitels über der Nulllinie frei (c829). Kommentar-Marker liegen über der Trefferfläche (Stufe c821 geändert).
    - Tests c824 bis c829.
    - **Schlussrunde:** Der Schalter „Hierarchie automatisch aufklappen“ steht bei „Fläche“ mit `axisGroups` ≠ „Aus“ in der Gruppe „Bestand & Fluss“ nach „Achsengruppen“ (vorher nur in „Tabelle“, c857b). In c807 saß „549“ (Priority 2, Mai 2024) mit seinem Papierrand auf der Netto-Summe „1.350“: über und unter Summenlabel und Punkt gelten jetzt 4 px Luft statt 2, der Wert entfällt dort (Stufe c807 geändert, c858).

- **B15 · Kumulierte Linie YTD mit gleitender Jahressumme (R12), Monatssäulen und Abstandsmarkern (nach IBCS-Blatt 07C).** Vorher: Die Linie zeigte die kumulierten Werte (YTD) nur als Linien mit Kreisen, R12 gab es nur als eigene Kumulierungsart (ohne Vorgeschichte: der Januar war kein Jahreswert), die Monatswerte verschwanden in der kumulierten Sicht, und der Abstand zum Plan stand nur im Δ-Panel. Nachher, alle Schalter in der neuen Gruppe „Linie“ (Objekt `chart`, nur im Modus Linie sichtbar, Standard aus):
  - **„Gleitende Jahressumme (R12)“** (`lineR12`, nur mit kumulierter Sicht YTD) zeichnet zusätzlich die Summe der letzten 12 Perioden auf derselben Skala, Name am Linienanfang über **„Name der R12-Linie“** (`lineR12Label`, leer = „R12“, Blatt: „MAT“). Quelle in dieser Reihenfolge: das Feld „Linie“ (fertige R12-Measure, unverändert gezeichnet), sonst aus dem Vorjahr für ein volles Jahr (12 Perioden, Vorjahr in jedem Monat: R12 = Σ PY − PY_YTD + YTD), sonst ein Fenster über mindestens 13 sichtbare Perioden (Linie ab der 12. Periode). Ohne Quelle keine Linie, im Bearbeitungsmodus ein Hinweis. Ist die Basis Plan und dient das Vorjahr nur als R12-Quelle (ohne Doppel-Varianz), entfällt die Vorjahreslinie.
  - **„Periodensäulen“** (`linePeriodColumns`, `off` | `same`): die unkumulierten Werte als Säulen hinter den Linien, auf derselben Skala und Nulllinie (AC solide, FC schraffiert, PL als versetzter Umriss, PY grau bzw. als Dreieck), Werte über den Säulen; Linienbeschriftungen, die in die Säulen liefen, entfallen dort. Unter 4 px Säulenhöhe keine Säulen und ein Hinweis im Bearbeitungsmodus. Eine eigene Säulenskala (`own`) folgt später.
  - **„Abstandsmarker“** (`lineGapMarkers`, `off` | `actual` | `end` | `both`): am rechten Rand ein Balken vom Basiswert zum kumulierten Ist am letzten Ist-Monat und vom Basiswert zu AC+FC am Jahresende (schraffiert), dünne Niveaulinien von den Punkten, Δ absolut daneben (Blatt: −192 und +87). Rechts wird Platz reserviert, in Small Multiples deckweit gleich.
  - **„Punktmarken“** (`lineMarkerShape`, `circle` | `square`) und **„Vergleichslinie beschriften“** (`lineBasisLabels`) wirken in jeder Linie: Quadrate auf dünnen Linien (AC gefüllt, FC schraffiert, PL hohl, keine Strichelung, das Szenario steht an der Marke), Werte der Vergleichslinie auf der Seite weg von der Ist-Linie.
  - **„Szenario-Kürzel“** (`scenarioLabels`) ist jetzt auch in der Linie sichtbar: AC und FC unter der Achse wie bei den Säulen, dazu das Kürzel am Ende jeder Linie (FC, PL, PY) und an den Periodensäulen.
  - **Vorlage C21 „Kumulierte Linie mit R12 und Monatssäulen (07C)“** (Galerie-Gruppe Zeitverlauf): orientation=line · comparisonMode=plan · cumulative=true · cumulativeKind=ytd · lineR12 · linePeriodColumns=same · lineGapMarkers=both · lineBasisLabels · lineMarkerShape=square · scenarioLabels · showAbs/showRel/dualVariance=false · showTotal=false.
  - Verhaltensänderung: Ein Linienbericht mit gespeichertem `scenarioLabels` = true (z. B. von einer Säulen-Vorlage übernommen) zeigt jetzt die Kürzel. Mit irgendeiner Linienoption steht die Ist-Beschriftung an ihrem eigenen Punkt, auf der Seite weg von der Vergleichslinie (vorher über der höchsten Linie, das las sich mit Plan-Quadraten wie ein Planwert). Mit allen Optionen auf Standard zeichnet die Linie SVG-gleich zu 1.55 (Hash aller 485 Harness-Stufen; geändert nur die Galerie-Stufen wegen C21).
  - Nicht abgebildet: eigene Skala der Monatssäulen (`own`), die Ellipse um −192 (dafür gibt es `highlight`), auf dem Blatt stehen die Linien nicht gestrichelt im FC-Teil, das ist bei Quadraten auch hier so, bei Kreisen bleibt die Strichelung.
  - Tests c760 bis c774 (Render-Harness).
  - **Nach dem Review:**
    - **Bezugskachel Ø, Σ und Rest:** Vorher verlor die Ø-Kachel mit YTD die R12-Linie und die Monatssäulen, zeigte als einzige die PY-Linie mit Kürzel und den falschen Hinweis „Periodensäulen: auf dieser Skala zu klein“; die Σ-Kachel hatte bei R12 aus dem Feld „Linie“ keine R12-Linie. Nachher entstehen Periodenwerte und R12 an den Datenkacheln, bevor die Bezugs- und Rest-Kacheln gebildet werden, und werden dort summiert bzw. gemittelt; PY ist überall gleich ausgeblendet, die Quelle der Kachel ist die ihrer Glieder. Der Säulen-Hinweis erscheint nur, wenn es Säulenwerte gab.
    - **Bestandszeilen** (Token `stock`): keine R12-Linie, keine Monatssäulen, kein Hinweis (vorher summierte R12 die Bestände und die Säulen wiederholten die Linie).
    - **R12 aus dem Vorjahr nur für ein Jahr:** zwölf erkannte, verschiedene Monate ab dem Fiskaljahresbeginn. **Verhaltensänderung:** 12 Wochen oder 12 Perioden ohne Monatsnamen bekommen keine R12 aus PY mehr (Hinweis im Bearbeitungsmodus).
    - **Abstandsmarker gegen Ø** (`multiplesBasis` = `avg`): messen gegen die gezeichnete Vergleichslinie (Plan bzw. Vorjahr) statt gegen den Durchschnitt, ohne Rundungsrest in `data-v`.
    - **Beschriftung:** Linien-Labels entfallen auch in negativen Säulen und ihren Labels unter null; Marker-Labels weichen Szenario-Kürzeln aus; Kürzel am Linienende rücken rechts neben ein Wert-Label, auf dem sie lägen; die Kommentar-Marke steht über dem Punkt, wenn das Ist-Label darunter steht; beginnt die R12-Linie nicht in der ersten Periode (Fensterquelle), steht ihr Name am Linienende bei den Kürzeln (Platz rechts statt links, Stufe c772 entsprechend).
    - **Formatbereich:** R12, Periodensäulen, Abstandsmarker, Kumulierungsart und Geschäftsjahresbeginn verschwinden bei `timeAggregation` = `last` (dort läuft nichts auf).
    - Tests c775 bis c785.
    - **Jahreswechsel (Schlussrunde):** Über mehrere Geschäftsjahre (24 Monate) zog jede kumulierte Linie einen steilen Strich vom Dezember-YTD zum Januar-YTD. Jetzt bricht die Linie überall dort, wo die laufende Summe neu beginnt (YTD am Fiskaljahresbeginn, QTD an jedem Quartalsanfang), in der Linie mit Optionen (AC, FC, PL, PY) wie in der einfachen Linie; R12 läuft durch, auch eine Ø-Kachel aus kumulierten Gliedern bricht. Stufen c772 und c783 entsprechend geändert. Tests c786 bis c789.

- **B17 · Serienlinien mit Index (nach IBCS-Blatt 07A).** Vorher: Eine im Modus Linie gebundene „Stack-Serie“ ergab keine Linie je Mitglied (die Linie las die Zeilen als eine Reihe), Werte ließen sich nicht auf einen Basistag indexieren, und das Blatt 07A war nicht abbildbar. Nachher, alle Schalter in der Gruppe „Linie“ (Objekt `chart`, nur im Modus Linie sichtbar, Standard aus):
  - **„Serienlinien“** (`lineSeries`, ausdrücklicher Schalter, nicht automatisch bei gebundener Serie): eine Linie je Mitglied des Felds „Stack-Serie“ über die Kategorien, in einer Linienstärke; das Stück zu einem FC-Punkt gestrichelt, FC-Marken hohl. Serienname mit letztem Wert rechts am Linienende, senkrecht entzerrt. Ohne gebundene Serie bleibt die einfache Linie (Hinweis im Bearbeitungsmodus). Schließt B15 aus: keine kumulierte Sicht (YTD-Knopf gesperrt), R12, Periodensäulen und Abstandsmarker sind ausgeblendet und ohne Wirkung; Δ-Panels, Vorjahr, Plan und Benchmark wirken hier nicht.
  - **„Index“** (`lineIndex`, `off` | `base100`) und **„Basis-Kategorie des Index“** (`lineIndexBase`, leer = erste Kategorie mit Werten aller Serien): Wert ÷ Basiswert × 100 je Serie, nullbasierte Achse, dünne Linie bei 100, Panel-Titel „Index, 02.01. = 100“, ganzzahlige Werte. Eine Serie ohne Basiswert (leer oder 0) wird nicht gezeichnet, Hinweis im Bearbeitungsmodus.
  - **„Serienwerte“** (`lineSeriesLabels`, `ends` | `groups` | `all` | `none`, Standard `ends`): mit `groups` und Kategorie-Hierarchie (Monat › Tag) Werte an jedem Gruppenanfang mit einer senkrechten Linie bis zum höchsten Punkt, ohne Hierarchie jeder Punkt nach Platz; Marken nur an beschrifteten Stellen und am Linienende, ein gemeinsamer Wert (die 100 am Basistag) einmal. Die Achse zeigt mit Hierarchie die Monatszeile statt 250 Tageslabels (`axisGroups` ist dafür jetzt auch in der Linie sichtbar).
  - **„Start-Ende-Marker“** (`lineEndDelta`, Serienliste, `*` = alle): Balken vom Basisniveau zum Endwert am rechten Rand in Gut- bzw. Schlecht-Farbe, mit Index als Δ % (Blatt: −93%), sonst Δ und Δ %.
  - **„Serienfarben“** (`lineSeriesColor`, `tones` | `palette`): AC-Farbe für die erste bzw. hervorgehobene Serie und abgestufte Grautöne, oder die Gruppenpalette; im Hochkontrast Strichmuster je Serie.
  - Small Multiples teilen eine Skala; eine Σ-Kachel indexiert die Summen (nicht die Summe der Indizes). Tooltip je Kategorie mit allen Serien (Index und Rohwert), Klick wählt die nächstliegende Linie.
  - **Vorlage C22 „Serienlinien mit Index (07A)“** (Galerie-Gruppe Zeitverlauf, braucht „Stack-Serie“): orientation=line · lineSeries · lineIndex=base100 · lineSeriesLabels=groups · lineSeriesColor=tones · lineMarkerShape=square · showAbs/showRel/dualVariance=false · cumulative=false · showTotal=false. Die Gruppe Zeitverlauf hat damit neun Kacheln und läuft bei schmaler Galerie in einer zweiten Zeile weiter.
  - Mit `lineSeries` aus zeichnen alle bestehenden Stufen SVG-gleich (Hash aller 606 Harness-Stufen); geändert nur die Galerie-Stufen wegen C22. Nicht abgebildet: Kommentar-Marken an Serienpunkten; der Endwert steht neben dem Namen statt über dem Punkt.
  - Tests c860 bis c874 (Render-Harness).
  - **Nach dem Review:**
    - **Negativer Basiswert:** Vorher teilte der Index auch durch einen negativen Basiswert (Ergebnis −20 → +13 lief als 100 → −65, Marker „−165 %“ in Schlecht-Farbe, also das Gegenteil der Daten). Jetzt gilt ein Basiswert ≤ 0 wie kein Basiswert: die Serie fehlt, der Hinweis lautet „leer, 0 oder negativ“ (c875).
    - **Automatische Basis:** die erste Kategorie, in der alle Serien einen Wert über 0 haben (vorher nur „nicht leer“: eine 0 im Januar ließ die Serie ganz fehlen, obwohl der Februar für alle taugte), und zwar eine für alle gezeichneten Kacheln (vorher je Kachel, eine Σ-Kachel konnte gegen einen anderen Tag indexieren als ihre Glieder). Eine genannte Basis darf ein Gruppenname sein („Feb“ bei Monat › Tag = erster Tag im Februar); wird sie nicht gefunden, nennt ein Hinweis im Bearbeitungsmodus die automatische Basis (vorher stiller Rückfall). Stufe c867 nennt die Basis „Jan“ deshalb ausdrücklich (c876, c877, c881).
    - **Hinweis zur fehlenden Serie** steht in jeder Ansicht (vorher nur im Bearbeitungsmodus, der Leser vermisste eine Serie ohne Erklärung) und in der Titelzeile rechts über dem Plot statt unten rechts auf den Achsenlabels (c867 geändert, c875).
    - **Σ-, Ø- und Rest-Kachel** behalten die Kategorie-Hierarchie: Monatszeile, Blattlabels und Titel „Index, 01 = 100“ wie die übrigen Kacheln (vorher „Jan · 01“ an jedem Punkt, c878).
    - **Rechte Spalte bei vielen Serien:** passt sie nicht, entfallen zuerst die Δ-Beschriftungen der Start-Ende-Marker (Balken bleiben), dann rücken die Zeilen bis auf Schrifthöhe zusammen, zuletzt fallen Namen späterer Serien weg; die erste bzw. hervorgehobene bleibt (vorher lagen bei 15 Serien Beschriftungen übereinander, c882). Endet eine Serie früher, führt eine dünne punktierte Linie vom Endpunkt nach rechts (c884). Ein Punkt zwischen zwei Lücken bekommt eine Marke (c891).
    - **Hochkontrast:** sieben Strichmuster, die Leitserie durchgezogen, die übrigen laufen durch sechs Muster (vorher vier Muster samt dem durchgezogenen, die fünfte Serie sah aus wie die Leitserie, c883).
    - **Auswahl und Kreuzhervorhebung** sind sichtbar: eine Serie, deren Punkte alle abgeblendet sind, wird blass (Linie, Marken, Endbeschriftung, Marker), eine Kategorie ohne hervorgehobenen Punkt liegt hinter einem Papierschleier (vorher wirkte die Abblendung nur auf unsichtbare Trefferzellen). Ohne Auswahl bleibt das SVG unverändert (c886).
    - **Formatbereich und Titel:** mit gebundener Serie sind Abweichung absolut, relativ und doppelt, kumulierte Sicht, gleitender Durchschnitt, Gruppentrenner (`groupEvery`), Pin-Form, Δ-Symbole und Szenario-Kürzel ausgeblendet (sie wirkten nicht); der Titel nennt kein „vs. PL, PY“ mehr. Die Beschreibung von „Index“ sagt, dass Referenzlinie und festes Skalen-Maximum mit Index nicht wirken (c887).
    - **Kleinigkeiten:** Hervorhebung als Ellipse auf einer Serie umkreist ihren Δ-Wert (07A: −93%, c888; vorher zeichnete sie nichts). Ohne Index misst der Start-Ende-Marker ab dem ersten Wert der Serie statt ab der gemeinsamen Basis (c890). Leere Seriennamen (`null` und `""`) bleiben getrennte Serien, `null` heißt „(leer)“ wie im Stapel (c889). „Achsengruppen“ nennt in der Beschreibung die Serienlinien (vier Sprachen).
    - Tests c875 bis c892 (Σ und Ø mit ungleichen Formen c879, c880; Serie beginnt später c885; Dunkel mit Tonprüfung c892). 930 resjson-Keys je Sprache (neu `Hint_IndexBaseMissing`).

## 1.55.0.0 (2026-11-21, Backlog IBCS-Templates Teil 2)

**Ziel: weitere IBCS-Template-Blätter direkt abbildbar (Stapel 01D, 01E, 02B bis 02E; Differenzmarker 01A, 01B, 05X; Portfolio-Blasen 10A, 10B, 10D; Small Multiples gegen Durchschnitt 13A; Bestand und Fluss 08E bis 08H). Neue Schalter stehen standardmäßig aus; die Verhaltensänderungen (Top N und „Nach AC“ bei Stapelbalken, Planwert an reinen Planperioden) sind genannt.**

- **B10 · Stapel-Struktur (Blätter 01D, 01E, 02B, 02C, 02D, 02E).** Vorher: Stapel gab es nur mit Werten, die Seriennamen standen immer rechts, Balken ließen sich nicht nach Stapelsumme oder erster Serie ordnen, und es fehlte eine Σ-Zeile. Nachher:
  - **„Stapel-Skala“** (`chart.stackNormalize`, Auswahl „Werte“ | „100 % (Anteile)“, Standard Werte): gestapelte Säulen und Balken zeigen je Kategorie 100 %, die Beschriftungen sind Anteile mit einer Nachkommastelle, der Panel-Titel erhält den Zusatz „Anteile in %“. Die „100 %“-Marke steht bei Säulen über der äußeren Säule (Seite der Seriennamen), bei Balken läuft eine dünne Linie bei 100 % durch alle Zeilen einschließlich der Σ-Zeile, mit „▲ 100 %“ darunter. 100 % gilt nur, wenn nichts Negatives gestapelt ist (nach Top N). Eine Referenzlinie wird als Anteil gelesen (0 bis 100, größere Werte werden nicht gezeichnet); `fixedMax` und `capOverflow` gelten für Anteile nicht.
  - **Summen-Panel bei 100 %-Balken:** „Summen-Kopfzeile (Σ)“ (`showTotal`, Standard an) zeigt rechts die absoluten Stapelsummen auf eigener Skala, nur wenn die Kachel mindestens 280 px breit ist; bei Small Multiples teilen sich alle Kacheln einen Pixelwert je Einheit. Forecast-Kategorien sind dort schraffiert, Plan-Kategorien umrandet, der Kopf nennt die Szenarien (z. B. „Σ AC · PL“), bei Sortierung nach Summe zusätzlich „(↓)“.
  - **„Σ-Zeile im Stapel“** (`chart.stackTotalRow`, nur Balken, Standard aus) und **„Beschriftung der Σ-Zeile“** (`chart.stackTotalLabel`, leer = „Σ“, z. B. „World“): Bei Werten eine Legendenzeile mit Summe je Serie (Farbfeld) und Gesamtsumme als „= 3.733“, ohne Summenbalken, weil die Summe nicht auf die Zeilenskala passt; die Serien-Summen erscheinen ganz oder gar nicht (passen sie nicht, nur die Gesamtsumme). Bei 100 % ein 100 %-Balken mit dem Gesamtmix. Die Σ-Zeile summiert nur ein Szenario: Bei gemischten AC-, FC- und PL-Kategorien entfällt sie.
  - **„Seriennamen (Säulen)“** (`chart.stackLegendPos`, „Rechts neben der letzten Säule“ | „Links neben der ersten Säule“, Standard rechts): Die zweite Option setzt die Seriennamen links neben die erste Säule (IBCS-Blatt 01E).
  - **Sortierung** (`chart.sortMode`, seit 1.54) bekommt „Nach erster Serie (Stapel)“ (`series`). In Stapelbalken sortiert „Nach AC“ nach der Stapelsumme und „Nach erster Serie (Stapel)“ nach der ersten Serie (bei 100 % nach deren Anteil, Blatt 02E); „(↓)“ in der Legende markiert die sortierte Serie. Rest-Kategorien (Rest, Others, Sonstige, „Rest of …“, Top-N-Rest) bleiben am Ende und kursiv. Die Serienreihenfolge eines Stapels bleibt wie geliefert: Sortierung und Top N ändern weder Farbtöne noch Legendenreihenfolge noch, welche Serie die „erste“ ist.
  - **Verhaltensänderung (Fix):** Top N (`chart.topN`) bei Stapelbalken rankte bisher einzelne Zellen und erzeugte dabei eine Serie „(leer)“. Jetzt werden ganze Kategorien nach Stapelsumme gereiht, alle Serien-Zellen der Top N bleiben erhalten, und der Rest wird je Serie zu einer Kategorie „Rest (n)“ zusammengefasst. Berichte mit Top N und Stapelbalken sehen dadurch anders aus.
  - **Zweite Verhaltensänderung:** Ein Bericht aus 1.54 mit Stapelbalken und gespeicherter „Sortierung“ = „Nach AC“ (`sortMode` `ac`) wird jetzt nach der Stapelsumme sortiert (vorher ohne Wirkung auf Stapel).
  - Stapel mit den neuen Optionen aus zeichnen unverändert (SVG-Hash aller 364 Harness-Stufen verglichen). Noch nicht abgebildet: 02A (Blöcke mit Zwischensummen), Pfeile, Ellipse um ein einzelnes Segment. Außerdem behalten Rest-Zeilen in den Blättern 02B, 02D und 02E ihren Rang (nur „Rest of world“ steht zuletzt), ChartKitchen setzt alle Rest-Zeilen ans Ende (Regel aus B04); auf den Blättern sind bei Rest-Zeilen auch die Zahlen kursiv, hier nur der Name.
  - Tests c283 bis c289 und c295 bis c299b (Render-Harness).
- **B09 · Differenzmarker und zweite Überleitung (Blätter 01A, 01B, 05X).** Vorher: Differenzen zwischen zwei Kategorien (z. B. 2025 zu 2026) ließen sich nur über Brücken oder Δ-Spalten zeigen, und die Überleitung nannte nur die Abweichung zur gewählten Basis. Nachher:
  - **„Differenzmarker“** (`chart.diffMarkers`, Freitext, Format Chart → „Daten & Zeit“, unter „Kategorien hervorheben“): „2025 > 2026“ (oder „→“) zeichnet neben der zweiten Kategorie (auf der Seite weg von der ersten) eine dünne Niveaulinie vom Ende der ersten, einen dicken Balken der Differenz (gut/schlecht-Farbe, schraffiert bei Forecast) und Δ samt Δ % („+12,2 (+12,0%)“). Mehrere Marker mit „;“ getrennt, höchstens 4, unbekannte Namen werden still übersprungen.
  - „2025 > 2026@Software“ gilt für eine Serie im Stapel (Niveaulinie nur bei der untersten Serie); ein „!“ am Ende lässt Δ % weg („2025 > 2031!“ gibt „−7,0“). Bei 100 %-Stapeln nur Serienmarker (Prozentpunkte), Summen nur ohne negative Segmente, ein reiner Plan-Monat vergleicht auf seinem Planwert. Zielt ein Marker auf die letzte Spalte, wird rechts Platz reserviert (Stapel-Säulen setzen die Seriennamen dann links neben die erste Säule).
  - **„Zweite Überleitung“** (`chart.bridgeSecondNet`, Standard aus, Gruppe Brücke, bei integrierter Brücke): Mit gebundenem Vorjahr und Plan zeigt ein zweiter Balken neben dem Netto-Callout die Abweichung der Summe zur anderen Basis (z. B. „+4 PY“) mit dünner Niveaulinie, nur wenn die andere Basis jeden Monat mit einem Wert abdeckt.
  - Bestehende Stufen zeichnen SVG-identisch. Neu dazu „Anteils-Klammer (erste Zeilen)“ (`chart.stackShareBracket`, Zahl, 0 = aus): bei gestapelten Balken eine Klammer um die ersten N Zeilen mit ihrem Anteil an der Gesamtsumme links der Namen (Blatt 02C: France, Switzerland, Germany = 38 % von Direct); Bezug ist die erste Serie, wenn nach ihr sortiert wird, sonst die Stapelsumme; Test c300. Noch nicht abgebildet: Marker per Vergleichsklick im Bericht festhalten.
  - Tests c290 bis c294.
  - **Nach dem Review:** Marker auf eine Kategorie in der Mitte, rückwärts (z. B. „Dez > Jan“), auf Balken und neben der Jahressäule liegen nicht mehr über der Nachbarspalte: Der Balken steht auf der Seite weg von der ersten Kategorie, der Text am Rand in reserviertem Platz (auch links und bei Balken unten bzw. oben), sonst über dem Balken und den Säulen darunter (Säulen) oder hinter dem Wert der Zeile (Balken), im Visual. Eine zweite kurze Niveaulinie an der Zielsäule schließt die Klammer wie auf Blatt 01A; Stapel-Säulen setzen die Seriennamen dann links. Δ nutzt die Nachkommastellen der Werte und wird bei sehr kleinem Δ genauer („−0,04M“ statt „−0,0M“); bei 100 %-Stapeln Prozentpunkte („+3,8 PP“) ohne Δ %. Parser: „->“ und „=>“ als Pfeil, „@“ nur hinter dem Pfeil (Kategorien wie „a@b“), Dubletten entfallen, die Grenze von 4 gilt nach dem Auflösen, bei doppelten Kategorienamen der erste. Mehrere Marker in derselben Lücke teilen sich deren Platz: die Balken nebeneinander, die Texte am Rand untereinander, bei Balken in einer Zeile, über einer Säule in der Mitte nur so viele, wie Textzeilen darüber passen (überzählige Marker entfallen); Randplatz höchstens 20 % der Breite, sonst steht der Text über dem Balken; bei negativen Werten liegt der Text unter bzw. links vom Balken; ein winziges Δ bekommt so viele Stellen, bis eine Ziffer ungleich null erscheint; sind beide Ränder belegt, zeigen Stapel-Säulen die Legende oben. Tests c311 bis c316 (zweite Review), Small Multiples reservieren in jeder Kachel gleich viel Platz, Serienmarker beachten die Kappung, Niveaulinien liegen hinter den Säulen, beim Wasserfall-Stil keine Marker. Zweite Überleitung: Platz nur, wenn sie gezeichnet wird, Breite aus dem Text, Balken so breit wie der erste Netto-Balken, durchgezogene Niveaulinie, Text mit Hintergrund. Tests c301 bis c310.
- **B12 · Portfolio-Blasen (Blätter 10A, 10B, 10D).** Vorher: Die Blasen zeigten nur den Namen, der Wert der
  Blasengröße stand im Tooltip; die Gruppenfarben kamen fest aus der gedeckten Palette (Orange nicht wählbar); der
  Radius war bei 22 px gedeckelt und die Deckkraft fest 55 %; ein Vorjahr ging nur als kleiner grauer Startpunkt eines
  Pfeils ohne eigene Größe; Hervorhebungen bekamen einen Ring. Nachher, im Scatter unter „Scatter / Bubble“:
  - „Wert der Blasengröße“ (`chart.scatterValueLabels`): Zahl in der Blase, Schrift hell oder dunkel nach Kontrast;
    passt sie nicht, steht sie hinter dem Namen. Namen stehen dann bevorzugt über der Blase.
  - „Max. Blasenradius (px)“ (`chart.scatterMaxRadius`, 0 = automatisch) und „Deckkraft der Blasen %“
    (`chart.scatterBubbleOpacity`, Standard 55). Große Blasen dürfen über den Achsenrand hinausragen.
  - „Gruppenfarbe 1“ bis „Gruppenfarbe 6“ (`chart.scatterGroupColor1` bis `6`) bei Punktfarbe „Nach Gruppe/Serie“.
  - Neue Rolle **„Blasengröße VJ (optional)“** (`bubbleSizePrevious`): zusammen mit Vorjahr (Y) und optional
    „X-Achse VJ“ zeichnet jede Kategorie eine PY-Blase in PY-Grau mit eigener Größe hinter der AC-Blase, auf
    derselben Größenskala; Legende ● PY ● AC. Liegen PY- und AC-Wert übereinander, entfällt der PY-Wert (Tooltip).
    Mit Bewegungspfeilen beginnt der Pfeil am Rand der PY-Blase.
  - „Hervorhebung als Farbe“ (`chart.scatterEmphFill`) mit „Hervorhebungsfarbe“ (`chart.scatterEmphColor`, Standard
    #0064FF) und optionalem Legendentext (`chart.scatterEmphLabel`, z. B. „Zukäufe 12/25“) statt des Rings.
  - Bestandsberichte zeichnen SVG-gleich (alle 364 Bestands-Stages per Hash geprüft); einzige sichtbare Änderung
    ohne neue Optionen: das Feld-Intro nennt die neue Rolle (20 statt 19 Rollen). Tests c400 bis c406.
  - **Nach dem Review:** Große Blasen bleiben im Visual: Sie dürfen über die Achse ragen, aber nicht über den Rand
    oder die Titelzeilen; würde eine Blase hinausragen, rückt die Plotfläche auf dieser Seite ein (Achsenursprung
    bleibt). Der eigene Radius ist auf ein Fünftel der kleineren Plotkante gedeckelt (vorher ein Drittel). Im
    Play-Modus gibt es keine PY-Blasen mehr in Achsen, Legende und Größenformat; eine PY-Blase außerhalb fester Achsen
    bestimmt die Größenskala nicht mehr. Werte verschwinden nicht: FC-Blasen zeigen ihren Wert auf der Schraffur, bei
    langen Namen wird nur der Name gekürzt, ohne Namenslabel steht der Wert allein neben der Blase, ein PY-Wert unter
    einer AC-Blase steht am PY-Namen („VAB 32,0“). Hochkontrast mit Statusfarbe: Werte lesbar auf gefüllten Blasen.
    PY-Blasen sind kein eigener Tab-Stopp mehr und werden als „PY“ vorgelesen; „Ellipse“ als Hervorhebung umkreist im
    Scatter die Blase. Statusfarbe mit PY-Blasen: unwesentliche AC-Blasen mit dunklem Umriss, Legende ohne AC. Neuer
    Hinweis im Bearbeitungsmodus, wenn „Blasengröße VJ“ ohne Vorjahr oder ohne Blasengröße gebunden ist. Rezepte 10A
    und 10D mit Größenlegende aus und Mittellinie bei 0,5. Andere Stufen SVG-identisch; Tests c410 bis c422.
- **B13 · Small Multiples gegen Durchschnitt (Blatt 13A, Teil von 13C).** Vorher: Die Bezugskachel war immer
  „Σ Gesamt“, stand vorn und streckte als Summe die gemeinsame Skala, bis alle anderen Kacheln flach wurden; die
  Rest-Kachel hieß fest „Rest (n)“; ein Vergleich mit dem Durchschnitt aller Gruppen brauchte ein Hilfs-Measure.
  Nachher, im Formatbereich Chart → „Small Multiples“:
  - „Bezugs- und Rest-Kachel“ (`chart.multiplesAgg`, „Summe“ | „Durchschnitt“, Standard Summe): Der Durchschnitt
    teilt je Kategorie und Feld durch die Zahl der Kacheln mit Wert (leer zählt nicht als 0), Abweichungen werden
    über die Paare gemittelt, die Bezugskachel rechnet immer über alle Originalgruppen (nie aus der Rest-Kachel).
    Sie bleibt im Wertebereich der Kacheln, die Skala wird nicht gestaucht. Eine Periode ist nur dann Forecast,
    wenn alle Kacheln sie so führen; reine Planjahre bleiben umrandet. Die Nachkommastellen folgen den Daten.
  - „Position der Bezugskachel“ (`chart.multiplesTotalPos`, erste | letzte Kachel), „Bezugskachel hinterlegen“
    (`chart.multiplesTotalShade`, grau, im Hochkontrast Rahmen), „Titel der Bezugskachel“ und „Titel der
    Rest-Kachel“ (`chart.multiplesTotalLabel`, `chart.multiplesRestLabel`, Platzhalter `{n}`, z. B.
    „Durchschnitt {n} Standorte“, „{n} weitere kleine Standorte“). Leer = „Σ Gesamt“ bzw. „Ø Durchschnitt (n)“
    und „Rest (n)“. Eine zuletzt stehende Bezugskachel bleibt auch bei mehr als 24 Kacheln sichtbar.
  - „Abweichungsbasis der Kacheln“ (`chart.multiplesBasis`, „Szenario (PY / PL)“ | „Durchschnitt aller Kacheln (Ø)“,
    nur Säulen, Balken, Linie ohne Stapel und Brücke): Jede Kachel vergleicht je Kategorie mit dem Durchschnitt aller
    Gruppen (Panels „ΔØ“ und „ΔØ %“, Achse als einfache Linie). Reine Planjahre vergleichen den Plan mit dem
    Durchschnitt der Pläne und stehen in Plan-Notation (Δ-Balken umrandet mit blasser Füllung, Pin hohl). Die
    Bezugskachel zeigt keine Abweichung, die doppelte Abweichung ist aus, eine summierte Rest-Kachel vergleicht
    mit n × Ø.
  - Bestehende Stufen zeichneten SVG-identisch (alle 407 Harness-Stufen per Hash verglichen); die Marker
    `mult-tile`, `mult-ref-bg`, `mult-basis` und `var-plan` erscheinen nur mit gesetzter B13-Option. Noch nicht:
    nur das Abweichungs-Panel (`varianceOnly`, 13C und 13D vollständig), frei wählbare große Kachel (13B). Tests
    c500 bis c504 und c510 bis c514.
  - **Nach dem Review:** Mit Basis Ø entsteht der Durchschnitt vor „Nur Auffälliges“ und vor Top N je Kachel:
    Beide arbeiten mit ΔØ, der Ø kommt aus allen Kategorien, und eine Sammelzeile („Other (3)“, „Immaterial“)
    vergleicht mit der Summe der Ø ihrer Mitglieder (vorher bekam z. B. die größte Kategorie einer Kachel den Ø
    nur der Kacheln, in denen sie Top N war). Mit YTD bleibt die Reihenfolge, dort sind beide aus. Die
    Summen-Kopfzeile nennt ΔØ und % nur über Ist und Forecast, Planjahre gegen den Plan-Ø zählen nicht mehr mit
    (ebenso in der automatischen Kernaussage). Durchschnitt bei Stapeln: Ein fehlendes Segment zählt als 0,
    geteilt wird durch die Kacheln mit dieser Kategorie (der Ø-Stapel ist der Durchschnitt der Stapelsummen und
    nicht mehr höher als jede Kachel); bei Balken (Strukturachse) zählt eine Kachel ohne die Kategorie als 0,
    auch für die Basis Ø; ein fehlender Zeitraum (Säulen, Linie) zählt weiter nicht. Mit YTD/QTD/R12 ist die
    Ø-Kachel der Durchschnitt der kumulierten Gruppen, so passt sie zu ΔØ. Eine summierte Rest-Kachel mit
    gemischten Ist- und Plan-Mitgliedern vergleicht nur mit dem Ø der Mitglieder, die sie summiert. ΔØ hat nur ab
    einem Betrag von 10 ganzzahlige Labels, darunter Nachkommastellen statt „+0“/„−0“. Die Bezugskachel unter
    Basis Ø zeichnet ihre leeren Δ-Panels ohne Titel und Achse, kompakt ohne „· ΔØ %“. Mit Stapeln, zuletzt
    stehender Bezugskachel und mehr als 24 Gruppen zählen für die Skala genau die gezeichneten Kacheln. Die
    Option „Abweichungsbasis der Kacheln“ ist bei Stapeln und Brücke ausgeblendet (sie wirkte dort nicht). Zoom
    findet Bezugs- und Rest-Kachel über ihre Art, auch wenn ein Titel einem Gruppennamen gleicht; „(+n weitere)“
    ist lokalisiert (`Label_MoreTiles`).
  - **Verhaltensänderung (Review):** Reine Planperioden (kein Ist, kein Forecast, nur PL-Umriss) tragen jetzt
    ihren Planwert als Beschriftung über dem Umriss, bei Säulen und Balken, auch ohne Small Multiples (Blatt 13A:
    „79“ in 2028). Mit „Szenario-Kürzel“ steht zusätzlich „PL“ unter der ersten Planperiode und, wenn die
    Planperioden am Ende stehen, ein dünner Trennstrich AC | PL unter der Achse. Betroffen sind Berichte mit
    Planmonaten ohne Ist und ohne Forecast, z. B. Vorlage C03 mit Plan bis Dezember (Harness c124, c222 bis
    c234) und Blatt-01B-Säulen mit Planjahren (c291). Die übrigen Bestandsstufen zeichnen SVG-identisch (441
    Stufen per Hash verglichen). Tests c520 bis c532.
- **B11 · Bestand-Fluss-Modus, Teil 1 (Blätter 08E, 08F, 08G, 08H).** Vorher: Bestände mit Zu- und Abflüssen (Kasse,
  Personal, Lager) gingen nur als Behelf aus drei Kacheln mit getrennten Skalen; der Stapel zeigte Plan-Tage solide, es gab
  keine Fläche unter dem Bestand, kein Netto-Panel und keine gruppierte Zeitachse. Nachher:
  - Neuer Chart-Typ **„Bestand & Fluss (Zeit)“** (`chart.orientation = stockflow`) mit eigenem Renderer: oben der Netto-Fluss
    je Periode (neutral grau, mit Vorzeichen), darunter im selben Pixelmaßstab die Zuflüsse über und die Abflüsse unter der
    Nulllinie (Abfluss in der AC-Farbe, Zufluss heller, mehrere Arten je Seite gestapelt) und der Bestand als Linie mit
    Fläche bis null, Punkte am Periodenende plus Anfangsbestand am Beginn der ersten Periode. AC solide, FC schraffiert,
    PL hohl bzw. getönt, wie im Stapel (B06), für Säulen, Punkte und Fläche; negative Flächenstücke rosa.
  - **Datenvertrag:** Langformat über die vorhandenen Rollen. Die Rolle „Stack-Serie“ trägt Flussarten und Bestandsgröße
    („Cash in“, „Cash out“, „Cash at hand“), die Rolle „Waterfall-Typ“ neue Token je Zeile: `stock` (Aliasse `bestand`,
    `balance`), `inflow` (`zufluss`), `outflow` (`abfluss`); ohne Token entscheidet das Vorzeichen. Die kurzen Aliasse
    `in`, `out`, `level` gibt es bewusst nicht. Zweitweg für den Bestand: die Linien-Measure. Netto und Anfangsbestand
    rechnet das Visual. Die Token gelten nur in diesem Modus; als reine Flag-Token bleibt der Zeilentyp leer, andere Modi
    zeichnen unverändert.
  - **Zeitachse:** bei einer Kategorie-Hierarchie (z. B. Jahr, Woche, Tag) bis zu zwei Gruppenzeilen unter dem ersten
    Mitglied, Trennlinien durch alle Panels, die oberste Ebene kräftiger; an Szenariogrenzen die AC|FC|PL-Trennlinie.
  - **Neue Optionen** (Gruppe „Bestand & Fluss“, nur in diesem Modus sichtbar): `sfNet` (Netto-Panel), `sfNetLabel`
    (Beschriftung, leer = „Netto“), `sfArea` (Fläche), `sfNegTint` (Negativtönung), `sfOpening` (Anfangsbestand),
    `sfStockAt` (Ende | Mitte der Periode), `axisGroups` (aus der Hierarchie | aus). Summenkopf: Σ Zufluss · Σ Abfluss ·
    Netto · Endbestand (nicht die Summe der Bestände). YTD ist im Modus gesperrt. Tooltip je Periode mit Zufluss, Abfluss,
    Netto und Bestand; ein Klick wählt alle Zeilen der Periode. Small Multiples teilen eine Skala.
  - **Vorlage C20 „Bestand und Fluss“** (Galerie „Zeitverlauf“): orientation=stockflow · sfNet · sfArea · scenarioLabels ·
    showTotal aus · highlightStyle Ellipse.
  - Bestandsberichte zeichnen SVG-gleich (alle 407 bisherigen Harness-Stufen per Hash geprüft); geändert sind nur die Vorlagen-Galerie
    und die Tour-Karte, die sie öffnet (Kachel C20). Tests c600 bis c613. Noch offen (Teil 2 und 3): letzter Wert statt
    Summe in YTD, Jahressäule und Tabellenbaum (`timeAggregation`), Zoom der Flüsse bei großem Bestand (`sfFlowZoom`,
    08G), Achsengruppen auch in Säulen und Linie, ΔBestand gegen PL oder PY, Parität in der dwg-App.
  - **Nach dem Review:** Σ-, Ø- und Rest-Kachel der Small Multiples behalten Bestand, Abflüsse und die gruppierte
    Zeitachse (vorher wurden in der Ø-Kachel Bestand und Abflüsse zu Zuflüssen, die Kacheln schrumpften, und alle
    Gesamtkacheln verloren Jahresgruppen und Trennlinien). Der Bestand der Σ- und Rest-Kachel ist die Summe, in
    der Ø-Kachel das Mittel über die Kacheln mit einem Bestand; ein fehlender Fluss zählt im Ø als 0 (Stapelregel
    aus B13). Das gilt auch für den Bestand aus der Linien-Measure. Mit gebundener Spaltengruppe oder Trend bleiben
    Bestand und Abflüsse erhalten (vorher alles Zuflüsse ohne Bestand). Top N der Kacheln reiht nach den Flüssen,
    nicht nach den Beständen. Ein übrig gebliebenes „AC + FC im selben Monat“ wirkt im Modus nicht mehr (vorher
    blähte es Bestand und Flüsse auf, wenn AC und FC geliefert wurden). Plan-Säulen sind deckend: Zufluss weiß mit
    Umriss, Abfluss sehr hellgrau, die Fläche scheint nicht mehr durch. Die kräftige Jahreslinie steht auch dort,
    wo sie mit einer Szenariogrenze zusammenfällt (08E, 08H), Szenariogrenzen sind durchgezogen. Beschriftung wie auf
    den Blättern: Flüsse bei schmalen Perioden etwa jede dritte (08F), bei breiten alle, Bestände nur die
    Kernpunkte; optionale Beschriftungen weichen Markern und Bestandslinie, eine Ellipse berührt den Marker nicht.
    Ein Tab-Stopp je Periode (vorher zwei). Der Titel nennt nur die gezeichneten Szenarien („AC, FC, PL“), auch
    mit gebundenem Vorjahr. Hochkontrast: Abflüsse in Tinte gefüllt, Zuflüsse im Mittelton. Im Bearbeitungsmodus
    ein Hinweis, wenn eine Periode mit Ist oder Forecast nur Plan-Flüsse hat (`Hint_StockFlowMixed`, diese Flüsse
    werden nicht gezeichnet). Sehr kleine Kacheln zeigen den Platzhinweis, Szenario-Kürzel ohne Platz entfallen.
    Tooltip „Szenario“ lokalisiert (`Tooltip_Scenario`). Hinweis zu den Token: `stock`, `bestand`, `balance`,
    `inflow`, `zufluss`, `outflow`, `abfluss` sind reine Flag-Token; ein Bericht, der sie in anderen Modi als Freitext
    in der Rolle „Waterfall-Typ“ führt, zeichnet unverändert, aber besteht die Rolle nur aus solchen Zellen, schlägt
    Smart-Start keinen GuV-Wasserfall mehr vor. Tests c620 bis c632; geändert sind nur die Bestand-Fluss-Stufen
    c600 bis c613 (alle übrigen 457 Stufen SVG-gleich).

## 1.54.0.0 (2026-11-19, Backlog IBCS-Templates)

**Ziel: mehr IBCS-Template-Blätter direkt abbildbar. Neue Schalter stehen standardmäßig aus;
Verhaltensänderungen sind je Punkt genannt.**

- **B01 · Vorlagen C14 bis C18 für Blätter, die schon konfigurierbar waren.** Vorher: 04A bis 04C, 06E und 10F
  ließen sich nur mit dem richtigen Satz an Einzel-Properties bauen; die Galerie zeigte sie nicht. Nachher: je
  Blatt eine Vorlage in Formatbereich und Hub-Galerie (neue Gruppe „Rangfolgen gegen Plan“):
  C14 Balkentabelle nach ΔPL (04A), C15 nach ΔPL % (04B), C16 nach AC (04C), C17 Kategorie-Brücke waagerecht
  (06E), C18 Abweichungs-Scatter ΔPY % gegen ΔPL % (10F); C19 siehe B05. C07 und C11 bleiben reserviert.
  - Neue Option **Chart → Tabelle → „Σ-Zeile als Szenario-Legende“** (`tableTotalLegend`). Vorher stand die Σ-Zeile
    als langer Summenbalken auf derselben Skala, die Zeilenbalken schrumpften auf ein Fünftel der Spalte. Nachher
    zeigt die Σ-Zeile ■ AC □ PL (grau PY) mit den Summen, die Zeilenbalken nutzen die volle Breite; Δ-Balken und
    Δ%-Pin der Σ-Zeile bleiben.
  - Vorlagen dürfen Properties anderer Objekte setzen (C18: Referenzlinien bei 0 in `scale`) und die
    Spaltensortierung `tableSort` (C14 bis C16); beides in demselben Speichervorgang.
  - Vorlagenwechsel räumt auf: Einstellungen der vorherigen Vorlage, die die neue nicht nennt, gehen auf ihren
    Standard zurück (vorher blieben z. B. die Referenzlinien von C18 in C09 stehen und verschoben die Quadranten).
  - Tests c258 bis c266.
- **B05 · Jahressäule mit eigener Skala (Blätter 03A, 03B).** Vorher: Das Monatsbild mit Jahressumme ging nur als
  zweite Kachel, ein Skalenband über zwei Visuals gab es nicht, und die Σ-Kopfzeile nannte die Jahreszahl nur als Text.
  Nachher: „Jahressäule (eigene Skala)“ (`chart.yearColumn`) setzt rechts neben die Monate eine Σ-Säule AC + FC (FC
  schraffiert) gegen PY bzw. PL auf einem runden Bruchteil der Monatsskala (z. B. ×0,1); ein blaues Band beim selben
  Wert in Monaten und Jahressäule, verbunden über die Lücke, macht den Skalenwechsel sichtbar. ΔBasis und ΔBasis % der
  Jahressumme stehen in den Abweichungs-Panels auf der Monats-Δ-Skala. Dazu `chart.yearColumnLabel` (z. B. „2025“) und
  `chart.scenarioLabels` (AC/FC an Achse und Jahressäule). Neue Vorlage C19 „Säulen gegen Plan mit Jahressäule“ (03B).
  Monate und Jahr stehen auf derselben Nulllinie (auch bei Verlustmonaten); fehlt die Basis für einzelne Monate,
  rechnet die Säule über die Monate mit Basis und zeigt „2025 (9/12)“. Ein Jahres-Δ über dem Vierfachen der
  Monats-Δ läuft mit dem Faktor der Jahressäule („×0,1“ am Balken).
  Tests: Skalen-Suite YC03A/YC03B (Pixelmessung), Nulllinie, Teilsumme, Dual-Varianz, großes Δ, Small Multiples und
  sechs Rückfälle (SVG gleich wie ohne Option), Render c267. Fable-Review: zwei Blocker und alle Major-Befunde behoben.
- **B14 · Kleinteile.** Neu „Art der Hervorhebung“ (`chart.highlightStyle`): Ellipse um die Zahlen hervorgehobener
  Kategorien statt Band (IBCS-Blätter 04A, 06E). Margen-Werte der Tabelle, die auf null runden, zeigen „0,0 %“ statt
  „−0,0 %“, wie die übrigen Werte; Abweichungen behalten ihr Vorzeichen. Tests c281, c282.
- **B06 · Szenario-Notation im Stapel (Blatt 01C).** Vorher: Gestapelte Säulen und Balken füllten jedes Segment voll,
  ein Forecast sah aus wie ein Ist, Plan-Monate blieben leer, Referenzlinie, Trennlinie alle N Kategorien und
  Kommentar-Marker fehlten im Stapel. Nachher: Forecast-Segmente schraffiert in der Tönung ihrer Serie, Plan-Monate als
  getönter Umriss mit eigener Stapelsumme, gestrichelte Trennlinien zwischen AC, FC und PL, Szenario-Kürzel optional,
  Referenzlinie, Gruppen-Trennlinien und Kommentar-Marker auch im Stapel. Stapel ohne Forecast, ohne Plan für Monate
  ohne Ist, ohne Referenzlinie, ohne „Trennlinie alle N“ und ohne Kommentar-Measure zeichnen unverändert (SVG-Vergleich aller
  345 Bestands-Stages). Verhaltensänderung: (1) Ein Plan, der für zukünftige Monate ohne Ist gebunden ist, erscheint jetzt als
  Plan-Umriss im Stapel (die Skala kann auf die Plan-Summen wachsen, die Direktbeschriftung rückt an die letzte Plan-Säule);
  (2) eine gesetzte Referenzlinie oder „Trennlinie alle N“, die im Stapel bisher wirkungslos war, wird jetzt gezeichnet (die Skala
  schließt die Referenzlinie ein); (3) ein gebundenes Kommentar-Measure zeigt nummerierte Marker an den Segmenten (auf
  Kategorie-Ebene wiederholt sich ein Kommentar je Serie). Gruppen-Trennlinien entfallen dort, wo schon eine
  Szenario-Trennlinie steht; der Titel nennt nur vorkommende Szenarien. Fable-Review: Kommentar-Marker neben statt über
  Beschriftungen, Titel ohne AC bei reinem Plan/Forecast, Schraffur-Ids je Tönung, aria-Text für FC/PL, Hochkontrast-Halo.
  Tests c275 bis c280, c278b bis c278d.
- **B04 · Sortierung nach |Δ|, Δ, Δ % oder AC mit fester Rest-Zeile (Blätter 06F, 06G, 06H, 04A bis 04C).**
  Vorher: „Nach Wirkung sortieren“ war ein Schalter, nur nach |Δ| und nur in Brücken; eine Datenkategorie „Others“
  oder „Rest of USA“ wurde mitsortiert. Nachher: „Sortierung“ (neue Property `chart.sortMode`) wählt Aus, |Δ|, Δ
  vorzeichenbehaftet, Δ % oder AC, in Kategorie-Brücke, Wasserfall-Brücke und jetzt auch in Balken. Rest-Zeilen (Rest,
  Other, Others, Sonstige, Übrige, „Rest of …“, Top-N-Rest; Regel des P&L Statement) bleiben kursiv am Ende, auch bei
  der Spaltensortierung der Tabelle. Das alte `chart.sortByImpact` bleibt als ausgeblendeter Schalter: Berichte bis 1.53 zeichnen
  unverändert (Hash-Vergleich), bis „Sortierung“ gesetzt wird. Rest-Bezeichnungen müssen der ganze Name sein
  („Sonstige betriebliche Erträge“ bleibt ein Konto); Top N nimmt benannte Rest-Zeilen in die Rest-Zeile auf.
  Tests c268 bis c274.


## 1.53.0.0 (2026-10-24)

**Review-Paket: Zeilenstruktur als Datenvertrag, negative Brücken, Export-Layout, generierte Property-Referenz.
Keine neue Datenrolle, keine neue Formatoption; bestehende Berichte zeichnen unverändert (SVG-Vergleich über alle
Altfälle). Metadaten zeigen jetzt auf das Monorepo; Lizenzfeld im Paket sagt wie die LICENSE-Datei Apache-2.0.**

- **Zeilenstruktur per Rolle „Waterfall-Typ" (rowType) statt Zeilennamen.** Je Zeile ein oder mehrere Token,
  getrennt durch Komma, Semikolon, Leerzeichen oder |: `total` (Ergebniszeile), `pct` (Margenzeile), `exclude`
  (nicht in Σ), `hide` (ausblenden), `davon` (eingerückt), `invert` (Wertung umkehren), `emphasize` (hervorheben),
  `graphic` (nur diese Zeilen mit Grafik) — dazu deutsche Aliasse (Summe, Ergebnis, nachrichtlich, ausblenden,
  Kosten, hervorheben, Grafik …) und die RowType-Werte des P&L Statement byDatenWG (Subtotal, Formula, KPI,
  Account), sodass eine Kontendimension beide Visuals speist. Umbenennen oder Übersetzen von Zeilen bricht die
  Struktur nicht mehr. Die sieben Komma-Listen bleiben als Override; wirksam ist die Vereinigung aus Rolle und
  Liste, per Token gesetzte Häkchen erscheinen im Struktur-Modus gesperrt. Unbekannte Token werden ignoriert und
  im Bearbeitungsmodus unten rechts genannt; Leser und Exporte sehen nichts. Tests c248–c257.
- **Negative Brücken.** Integrierte Brücke (C05) und Kategorie-Brücke (C06) zeichnen negative Werte, statt auf
  einen Hinweis auszuweichen. Verlustmonate hängen unter der Nulllinie; liegt ein Anker oder Kaskadenstand unter
  null (Vorjahresverlust → Gewinn, Kostenreihe als negative Beträge), bekommt die Kaskade eine eigene sichtbare
  Nulllinie mit vollen Ankerbalken nach oben oder unten, die Stufen schwebend in echter Höhe — auch eine Stufe,
  die die Null kreuzt (+2 → −5 → −3); die Monatssäulen stehen dann in einem eigenen Streifen darunter.
  Kategorie-Brücke mit rein negativen Summen: Nulllinie rechts (Balken) bzw. oben (Säulen), Beschriftungen außen,
  Färbung nach Vorzeichen-Logik, „Invertieren" wirkt wie gewohnt; läuft die Kaskade durch die eigenen Balken
  einer Zeile, zeigt diese Zeile Balken oben und Stufe unten statt übermalter Balken. Small Multiples mit
  „Gleiche Skala": eine negative Kachel bestimmt die gemeinsame Nulllinie. „Anker kürzen" spiegelt bei rein
  negativen Brücken unter die Nulllinie; über die Null hinweg wird nie geschnitten. Tests c239–c247.
- **Export-Layout (Desktop-PDF, Druck; Service-Export nach Zertifizierung).** Neue Prüfsuite `npm run test:export`:
  Monatssäulen + Δ, Struktur-Balken, Kategorie-Brücke, GuV-Wasserfall und Matrix mit YTD-Spalte, je als
  A4-quer-Kachel (1100×620), halbe Seite (540×620) und PowerPoint-Kachel (960×540), in HD und Full HD. Im
  nicht-interaktiven Kontext sind Datenmarken nicht mehr fokussierbar, Aufklapp-Pfeile entfallen bei „Export: alles
  aufklappen", und der Export schreibt nichts zurück. Zu lange Titel brechen auf eine zweite Zeile um.
  Balken-Panels reservieren Platz nach der breitesten Beschriftung, das Δ%-Panel wird bei Bedarf breiter („+43,3 %"
  läuft nicht mehr über den Rand). Kategorie-Brücke: negative Werte schreiben nicht mehr in die Treibernamen, lange
  Namen brechen zweizeilig um. GuV-Wasserfall: zweizeilige Positionsnamen mit Trennung an Wortfugen
  („Jahres-/überschuss"), sich überlagernde Werte werden aufgelöst (Summen und große Schritte haben Vorrang),
  Δ-Stufen weichen dem Panel-Titel aus. Matrix: Passen die aufgeklappten Monate nicht in die Kachel, fällt der
  Export auf den Aufklappzustand des Berichts und dann auf zugeklappte Quartalsblöcke zurück, statt Quartale
  abzuschneiden; der Hinweis „… +n" steht im Kopf der Namensspalte.
- **AGENT-GUIDE aus dem Paket.** Die Property-Referenz wird mit `npm run guide` aus capabilities.json und
  settings.ts erzeugt (`guide:check` schlägt bei Drift an); 17 Properties und vier Rollen, die nur in
  „Neu-in"-Absätzen standen, sind damit wieder in der Referenz.
- **Website:** neue Seite „Sicherheit & Betrieb" (visuals-sicherheit.html, DE/EN) — Datenfluss, `privileges: []`,
  Freigabe als Organisationsvisual, Export-Grenzen unzertifizierter Visuals, Admin-Checkliste.

## 1.52.4.0 (2026-10-23)

**Größen-Preset heißt jetzt wie in der Produktfamilie: HD · Full HD · UHD. Nur Labels, keine neue Option —
die gespeicherten Werte (`compact`/`fullhd`/`presentation`) bleiben unverändert, bestehende Berichte sind
nicht betroffen.**

- **Formatmenü = Start-Hub-Leiste.** „Kompakt / Full HD / Präsentation" hieß in der unteren Hub-Leiste schon
  „HD · Full HD · UHD" (wie beim P&L Statement byDatenWG). Jetzt sagen Formatmenü (Data labels → Size preset),
  Hub-Pillen und Beschreibungstext in allen vier Sprachen dasselbe; die Klammerzusätze (Dashboard-Kachel,
  1080p, 4K/Beamer) bleiben als Orientierung.

## 1.52.3.0 (2026-10-21)

**Formatstring mit explizitem Plus. Keine neue Option, capabilities.json unverändert; `test:notation` jetzt 37
Prüfungen.**

- **Vorzeichen nur einmal.** Ein Measure-Format wie `+#,##0;-#,##0;0` (typisch für GuV-Kennzahlen mit Vorzeichen)
  ergab in Power BI „++1,17" an den Brückenstufen und „+8,01" an den Ankern (C12). ChartKitchen setzt Vorzeichen
  selbst (Δ mit Vorzeichen, Werte ohne) und entfernt deshalb das Plus aus dem positiven Abschnitt des Formatstrings;
  Minus- und Nullabschnitt, Text in Anführungszeichen und Escapes bleiben. Gilt für Wert, Linie, x und Größe.
  In der Fabric App trat es nicht auf, weil dort kein Formatstring des Modells ankommt.

## 1.52.2.0 (2026-10-20)

**Kosmetische Restpunkte der Showcase-Messung. Keine neue Option, capabilities.json unverändert; `test:notation`
jetzt 34 Prüfungen.**

- **KPI-Karten: Δ mit den Dezimalen des Werts.** „18,5 · ΔPL −1,1" statt einer zweiten Dezimale beim Δ („−0,05");
  rundet ein Δ ungleich null auf null, steht „+0,0" bzw. „−0,0" statt mehr Stellen.
- **Null mit Vorzeichen neben Pins (C04, C05, C13).** Ein Δ, das nicht null ist, aber auf null rundet, behält sein
  Vorzeichen („+0,00M", „+0,0%"); auch eine Brückenstufe, die die summensichere Rundung auf null setzt (C05 August).
  Eine exakte Null bleibt „0".
- **Scatter und Bubble (C09, C10): Einheit wie im Titel.** Achsentitel nennen die Einheit in Langform („Absatz hl
  in Tsd.", vorher „in K"); Ø-Linie, Größenangabe und Größenlegende ohne K/M („Ø 23,3", „○ Umsatz in Mio.
  (max 9,0)").
- **Stapellegende bei Balken (C02).** Die Namen stehen auch dann am Stapel, wenn der erste Balken nicht alle Reihen
  trägt: jede Reihe über ihrem breitesten Segment; der Schlüssel kommt nur zurück, wenn ein Name nicht passt.
- **FC-Trennlinie (C13 und alle Säulen mit Forecast-Ende).** Die gestrichelte Linie wird an Beschriftungen
  unterbrochen (Δ-Labels, Hinweis „Summe weicht rundungsbedingt ab"). Marker `data-icd="fc-boundary"`.
- **C05-Überschrift lokalisiert.** „PY → AC/FC · Brücke + Monatssäulen ×f" kommt aus den Sprachressourcen
  (`WfBridge_Title`) und nutzt die Szenario-Namen.

## 1.52.1.0 (2026-10-20)

**Notation nach der Pixelmessung der Showcase-App (IBCS 2.0 / ISO 24896): Einheit einmal im Titel, Szenarien ohne
Dopplung, höchstens drei Ziffern, Brückenstufen in echter Höhe, Linien-Notation, Scatter-Ränder. Drei neue Optionen;
zwei behalten das bisherige Bild als Standard, die Stapellegende steht neu am Stapel.**

Gemessen mit dem neuen Test `test/notation.html` (`npm run test:notation`, 31 Prüfungen; 1.52.0.0 besteht davon 5):

| Befund | 1.52.0.0 | 1.52.1.0 |
| --- | --- | --- |
| Titel, kpi „Nettoumsatz in EUR je Kanal“ | „Nettoumsatz in EUR je Kanal in M“ | „Nettoumsatz in Mio. EUR je Kanal“ |
| Titel ohne Einheit im kpi, Format „#,0 €“ | „… je Kanal in M€“ | „… je Kanal in Mio. €“ |
| Scatter-Titel | „… (x) je Kunde in %“ | „… (x) je Kunde“ (Einheiten an den Achsen) |
| period „2026 AC&FC gegen PL“ | „…: AC vs. PL, PY“ angehängt | kein Suffix |
| period ohne Kürzel, Ist-Wert „Umsatz AC&FC“ | „AC vs. PL, PY“ | „AC&FC vs. PL, PY“ |
| Wasserfall mit PY und PL gebunden, Basis PY | „AC vs. PY, PL“ | „AC vs. PY“ (PL wird nicht gezeigt) |
| Werte ab 100 der Anzeige-Einheit | „161,8K“, „Σ 407,6K“ | „162K“, „Σ 408K“ |
| Stapel aus einem Segment | „161,8K“ zweimal | einmal |
| Nullwert / unter der Darstellungsgrenze | „0,0M“, „0,00M“ | „0“ |
| KPI-Karte Wert und Δ | „18,5M“ und „−1,05M“ | „18,5M“ und „−1,1M“ |
| C05 Brückenstufen (6,9 px/M) | 4 px Mindesthöhe, bis 4× still vergrößert | echte Höhe 1,0 bis 2,2 px, Haarlinie 1 px |
| C05 mit `chart.bridgeBreak` | nicht vorhanden | Anker mit ⫽ gekürzt, Stufen 38,8 px/M (×5,6), eine lineare Skala |
| C08 Linienstärken AC / PY / PL / FC | 2 / 1,4 / 1,2 gestrichelt / 2 gestrichelt | 3 / 3 / 3 hohl / 3 gestrichelt |
| C08 AC-Beschriftungen auf einer Linie | 10 von 12 | 0 von 12 |
| C09 Punkte in den Ecken (Testfall) | 9 von 12 beschriftet | 12 von 12 |
| C10 x-Achse bei Werten ab 150 | Ursprung im Negativen (Tick 0 liegt 28 px rechts der Achse) | Ursprung 0 |
| C12 mit `sumSafeRounding` | „6,2M · +1,15M · … · 7,3M“, Stufen ergeben 7,34 | „6,21M · +1,14M · … · 7,34M“, Summe exakt |
| Stapellegende C01/C02 | Schlüssel oben | Namen am Stapel |

- **Titel-Einheit (eine Einheit, einmal genannt):** „in <Einheit>“ wird überall im Kennzahltext erkannt
  (Währungscode, Symbol, %, hl, kg, Stk. …) und um die Anzeige-Größenordnung ergänzt, in Langform („in Mio. EUR“,
  „in Tsd. hl“, englisch „in mEUR“, „in k hl“); „M“ oder „K“ stehen nie im Titel. Ohne Einheit im Text hängt das
  Visual Größenordnung plus bekannte Basiseinheit aus dem Formatstring an. Scatter/Bubble bekommen keine Einheit
  am Titel, die Achsentitel tragen sie.
- **Szenario-Suffix:** Nennt `ibcsTitle.period` schon Szenariokürzel (AC, PY, PL, BU, FC oder die Hausbegriffe), hängt
  das Visual nichts an. Sonst bildet es den Suffix aus `comparisonMode` und den gebundenen Rollen; der Ist-Wert heißt
  „AC&FC“, wenn ein Forecast-Anteil gezeigt wird (FC-Monate oder ein Messwertname „… AC&FC“). Wasserfall,
  Kategorie-Brücke, Pareto, Dumbbell und Slope nennen nur die Basis.
- **Höchstens drei Ziffern** in Grafiken: jede Zahl verliert ab 100 (bzw. 10) der Anzeige-Einheit Nachkommastellen,
  gezählt nach dem Runden („99,96“ wird „100“). Tabelle und GuV-Statement behalten ihre Dezimalen. Mit
  `sumSafeRounding` gilt eine Präzision für Labels und Σ, gesetzt von der größten Zahl, damit die Summe aufgeht; der
  Rundungshinweis ohne `sumSafeRounding` vergleicht jetzt die gedruckten Zahlen.
- **Neu: `labels.unitSuffix`** (bool, Standard an wie bisher): aus = nur die Zahl („18,5“), die Einheit steht im
  Titel. KPI-Karten nehmen dann eine gemeinsame Einheit für alle Karten. Die Abkürzung bleibt „K“ wie in Power BI
  (SI wäre „k“), bewusst nicht still geändert.
- **Null:** Werte unter der Darstellungsgrenze zeigen „0“ (Finanzformat „–“), ohne Einheit und Vorzeichen.
- **KPI-Karten:** Wert und Δ einer Einheit haben dieselben Dezimalen, die größte Zahl der Einheit setzt sie. Ein Δ,
  das sonst auf null fiele, bekommt wie bisher eine Stelle dazu („+0,01“).
- **C05 Integrierte Brücke:** Stufen in echter Höhe, darunter eine 1-px-Haarlinie (bisher 4 px Minimum). C05, C06
  (Kategorie-Brücke, Säulen) und C12 teilen für Anker und Stufen eine Präzision; mit `sumSafeRounding` gehen die
  Stufen exakt zwischen den gerundeten Ankern auf.
- **Neu: `chart.bridgeBreak`** (bool, Standard aus): kürzt die Summen-Anker mit sichtbarem ⫽, die Stufen laufen in
  einer linearen Skala darüber (IBCS UN 5.3). C05: Monatssäulen im unteren Band mit ausgewiesenem Faktor, Schnitt im
  Titel („Achse ab 45,0M geschnitten“). C06 senkrecht: Anker PY/PL/AC mit ⫽. C12: schaltet den vorhandenen
  Achsenschnitt (`scale.wfAxisBreak`) ein, solange dieser auf „aus“ steht. Gekürzt wird nur, wenn alle Stände über
  dem Schnitt liegen; Small Multiples mit gleicher Skala bleiben nullbasiert. Markierung `data-icd="bridge-break"`.
- **C08 Linien:** absolute Werte in einer Linienstärke; AC dunkel durchgezogen, PY hellgrau durchgezogen, PL hohl
  (Rand plus Papierkern, `data-icd="line-pl"`), nur FC gestrichelt. Die AC-Beschriftung steht über dem Punkt, wenn
  AC oben liegt, darunter, wenn AC unten liegt, sonst über der höchsten Linie.
- **C09 Scatter:** Randpunkte bekommen diagonale Plätze nach innen bzw. einen nach innen geschobenen Platz, statt
  ohne Beschriftung zu bleiben. **C10:** Reichen die Daten bis an die Null, beginnt die Achse dort; der
  Blasen-Innenabstand verschiebt den Ursprung nicht mehr ins Negative.
- **Stapel:** Ein Stapel aus einem beschrifteten Segment zeigt den Wert einmal. **Neu: `chart.stackLegendDirect`**
  (bool, Standard an): Seriennamen bei Säulen rechts am letzten Stapel, bei Balken über dem ersten Balken; passen
  sie nicht (Serie fehlt dort, Überlappung, negative Segmente, Small Multiples), bleibt der Schlüssel oben.
- 692 resjson-Keys je Sprache.

## 1.52.0.0 (2026-10-20)

**Skalierung nach IBCS 2.0 / ISO 24896 als neuer Standard in allen Chart-Typen: gleiche Einheit, gleiche Skala über alle Panels einer Grafik, sonst ein sichtbarer Faktor. Dazu eine Breite je Grafik, höchstens drei Ziffern und neu ein einklappbares Bedienmenü (☰).**

> **Bestehende Berichte ändern ihr Bild.** Das ist gewollt und nicht abschaltbar: Δ-Panels werden flacher (sie
> zeigen jetzt die wahre Größe der Abweichung), Säulen und Balken etwas breiter, Δ-Zahlen kürzer. Wer Seiten mit
> festen Erwartungen an Panel-Höhen gebaut hat (Screenshots, Abo-PDFs), sieht sie nach dem Update neu an.
> IBCS dient dabei als Referenz, das Visual ist nicht zertifiziert.

Grundlage ist eine Pixelmessung an der Showcase-App; nachgemessen mit dem neuen Geometrie-Test
`test/scale.html` (Werte px je Mio., vorher → nachher):

| Befund | vorher | nachher |
| --- | --- | --- |
| C03 Säulen + ΔPY: ΔPY-Panel gegen AC | 162 zu 43 px/M, **3,76×** still vergrößert | 51,4 zu 51,4 px/M, **1,00×** |
| C08 Linie + ΔPL | **4,67×** | **1,00×** |
| C04 Balken + ΔPL | **2,32×** | **1,00×** |
| C13 Small Multiples + ΔPY | **2,68×** ohne Hinweis | **2,00×**, ausgewiesen als „ΔPY ×2“ mit Skalenband |
| Doppel-Varianz ΔPL/ΔPY | 91,6 / 71,1 zu 43,1 px/M | 49,4 / 49,4 zu 49,4 px/M |
| GuV-Wasserfall, ΔPY-Stufe | **2,86×** | **1,00×** |
| C05 Monatssäulen gegen Anker | **1,85×** | **1,00×** (Ankerskala) |
| C05 Breiten Stein / Anker / Monatspaar | 0,80 / 0,59 / 0,80 je Kategorie | 0,67 / 0,67 / 0,67 |
| C08 Breite der Δ-Säulen | 0,55 | 0,67 |
| C12 Basis-Anker bei Basis PY | Umriss (PL-Notation) | hellgrau gefüllt |
| C04 Δ-Beschriftungen | „+0,150M“, „-0,080M“ | „+0,15M“, „−0,08M“ |
| Σ-Zeile | „ΔPY +1,352M“ | „ΔPY +1,35M“ |
| KPI-Karten derselben Einheit | „-1,000M“ · „-0,138M“ · „+0,100M“ | „−1,00M“ · „−0,14M“ · „+0,10M“ |
| Titel | „Nettoumsatz in EUR in M“ | „Nettoumsatz in Mio. EUR“ |
| Tabelle: ΔPY-Balken gegen AC·PY-Balken | **9,61×** | **1,00×** |
| GuV-Statement: Δ-Spalte gegen Kaskade | **4,87×** | **1,00×** |
| Small Multiples im Zoom (⤢): Δ gegen Basis | **4,0×** | **1,00×** |
| Small Multiples im Zoom: Basis gegen Übersicht | ×2,9, kein Hinweis | ×3,5, Hinweis „Skala ×3,5 zur Übersicht“ |
| Säulen + Brücken-Panel (waterfallStyle) | eigene Skala, 0,04× ohne Hinweis | 0,025×, Titel „PL → AC ×0,025“ |
| C05 mit AC&FC und PY (zwei Szenarien) | PY als Dreieck | PY als graue Säule |
| Kategorie-Brücke, KPI-Karte (Mini-Brücke) | 1,00× | 1,00× (schon eine Skala) |

Gestapelte Säulen/Balken, Pareto, Dumbbell und Slope haben kein Δ-Panel und nur eine Werteskala; Scatter misst
zwei verschiedene Größen. Die senkrechte Kategorie-Brücke nutzt wie die waagrechte eine Skala für alles.

- **Δ-Panels in der Skala der Basis** (CH 4.1, Notation: Abweichungssäulen gleiche Breite und gleiche Skala wie
  die Basis). Die festen Höhenanteile der absoluten Δ-Panels entfallen: ΔBasis und ΔBasis2 bekommen den px-je-Einheit-
  Maßstab des Hauptpanels, ihre Höhe (Säulen) bzw. Breite (Balken) ergibt sich aus der Δ-Spanne plus Platz für die
  Beschriftung. Gilt für Säulen, Balken, Linie, Doppel-Varianz, Small Multiples und die ΔPY-Stufe über dem
  GuV-Wasserfall (mit Achsenschnitt: der lineare Teil oberhalb des Schnitts). Δ%-Pins bleiben eine eigene Skala
  (andere Einheit) und behalten ihre bisherige Größe; das Brücken-Panel behält seine Größe, siehe unten.
- **Tabelle und GuV-Statement:** Die Δ-Balken der Tabelle laufen im Maßstab der AC·PY-Balkenspalte, die Δ-Spalte des
  GuV-Statements im Maßstab der Kaskaden-Spalten (bisher je Spalte auf volle Breite gestreckt, bis 9,6-fach). Passt
  Δ nicht in die Spalte oder bliebe es unsichtbar, gilt ein runder Faktor, ausgewiesen als „×0,5“ bzw. „×4“ im
  Spaltenkopf (`data-icd="scale-zoom-table"` bzw. `scale-zoom-pnl`).
- **Brücken-Panel (Säulen/Balken mit „Wasserfall-Brücke“):** Die Summen-Anker sind n-mal größer als die Einzelwerte;
  das Panel läuft jetzt auf dem Basismaßstab mal einem runden Faktor < 1, der im Titel steht („PL → AC ×0,025“,
  `data-icd="scale-zoom-bridge"`), statt auf einer eigenen, unmarkierten Skala.
- **Small Multiples im Zoom (⤢):** Die vergrößerte Kachel zeichnet mehr px je Einheit als die Übersicht; das steht
  jetzt neben dem Gruppennamen („Skala ×3,5 zur Übersicht“, `data-icd="zoom-scale"`, gemessen an derselben Kachel in
  Gittergröße). Die Δ-Panels folgen im Zoom exakt der vergrößerten Basis.
- **Lupe statt stillem Vergrößern** (CH 4.3/4.5): Wäre die größte Abweichung im Basismaßstab kleiner als etwa
  8 px·Schriftfaktor, wird das Δ-Panel um einen runden Faktor (2, 4, 5, 10, 20 …) vergrößert und sagt das:
  Titel „ΔPY ×4“ und ein hellblaues Skalenband auf derselben Zahl (Zehnerpotenz) in Basis- und Δ-Panel.
  Small Multiples teilen Domain und Faktor. Markierung im SVG: `data-icd="scale-zoom"` mit `data-factor`.
- **C05 Integrierte Brücke:** Monatssäulen stehen auf der Ankerskala. Nur wenn sie in die Kaskade ragen würden
  (Faktor < 1) oder unlesbar klein wären (Faktor > 1), bekommen sie einen runden Faktor, ausgewiesen als
  „Monatssäulen ×0,5“ in der Überschrift plus Skalenband an Ankern und Monatssäulen. Anker, Brückensteine und
  Monatspaare haben dieselbe Breite (2/3 der Kategorie), das Monatspaar ist versetzt wie im Säulen-Chart.
- **C05 mit zwei Szenarien:** AC&FC ist eine Reihe (IBCS), AC&FC + PY also zwei Szenarien: PY ist eine graue,
  versetzte Säule wie in C03. Das PY-Dreieck gibt es nur noch beim dritten Szenario (AC + PY + PL).
- **C12 Varianzbrücke:** Der Basis-Anker folgt der Basis: PY hellgrau gefüllt, PL Umriss, FC Vm schraffiert
  (bisher immer Umriss).
- **Breiten:** Säulen und Balken für absolute Werte nehmen 2/3 der Kategorie ein (ISO 24896; bisher 0,62), in allen
  Modi mit Slots (Säulen, Balken, Brücken-Panel, Wasserfall, Kategorie-Brücke senkrecht, Pareto, gestapelt).
  Δ-Säulen unter einer Linie sind so breit wie der Slot.
- **Zahlen:** Δ-Beschriftungen haben höchstens drei Ziffern (IBCS: max. 3 Stellen in Charts). Die Nachkommastellen
  richtet die größte Abweichung aus („+0,32M“, „+1,64M“, „+12,3M“); größere Zahlen wie die Σ-Zeile kürzen auf drei
  Ziffern, kleinere, die sonst auf null fielen, bekommen Stellen dazu („+0,04M“ statt „+0,0M“). Eine auf null
  gerundete Abweichung trägt kein Vorzeichen mehr, negative Δ verwenden das echte Minus wie die Δ%-Werte. Δ% ab
  100 ohne Nachkommastelle („−100%“). KPI-Karten mit derselben Anzeigeeinheit teilen eine Δ-Präzision.
- **Scatter/Bubble (C09/C10):** Eine lineare Achse, deren sichtbarer Bereich die Null nicht enthält, trägt am
  Ursprung das Bruchzeichen (`data-icd="axis-break-x|y"`). Reicht der Datenbereich fast bis null (unter 15 % der
  Spanne), beginnt die Achse bei null. Liegen alle Werte bei ≥ 0, gibt es keine negativen Ticks mehr.
- **Titel:** Nennt der Kennzahlname schon die Einheit („Nettoumsatz in EUR“) und kommt nur ein Größenzusatz
  hinzu, verschmilzt beides zu „in Mio. EUR“ (deutsch, Tsd./Mio./Mrd.) bzw. „in mEUR“ (andere Sprachen).
- **Neu: „Bedienleisten einklappen (☰)“** (Chart → Interaktion im Bericht, Property `chipMenu`, Standard aus): Die
  In-Chart-Bedienelemente (Sortieren ⇅, YTD, ⫽ Achse, ΔPY|ΔPL, ▶, Ausnahme-Chip, Modus-Chips, Karten-Sortierung,
  Scatter-Play, GuV-Ansicht) liegen dann hinter einem kleinen ☰ oben rechts; Klick klappt sie auf (✕ wieder zu),
  nichts wird gespeichert. Aus: alles wie bisher. Vier Sprachen, 686 resjson-Keys je Sprache.
- **Power-BI-Host und App gleich:** Alle Panel-Größen ergeben sich aus px je Einheit des Basis-Panels in derselben
  Render-Funktion; es gibt keinen host-spezifischen Pfad (Desktop, Service und Fabric-App zeichnen identisch).
- **Tests:** neuer Geometrie-Test `npm run test:scale` (`test/scale.html` + `test/scale.js`, 33 Prüfungen, misst px
  je Einheit von Basis und Δ direkt im SVG). `test/shot.js` hing am Vollseiten-Screenshot der sehr hohen Testseite;
  jetzt Viewport-Bild plus Einzelbilder per `SHOT=c12,c22`, Zusammenfassung „n checks ok, n FAIL“. Render-Test
  153/153, kein FAIL; 208 der 285 Stages zeichnen gewollt anders (Breiten, Δ-Panels, Zahlen).

## 1.51.2.0 (2026-10-19)

**KPI-Karten: gleiche Skala für alle Mini-Brücken.**

- **Neu: „Karten: gleiche Skala“** (Chart → KPI-Karten, Property `cardSameScale`, Standard aus): Alle Mini-Brücken
  Basis → Δ → AC teilen einen Maßstab über alle Karten, gleiche Beträge ergeben gleich hohe Balken (IBCS: identische
  Skalen). Gedacht für Karten derselben Kennzahl je Kategorie (z. B. Umsatz je Kanal); bisher skalierte jede Karte für
  sich, 15,4 Mio. und 3,0 Mio. waren gleich hoch. Bei Karten mit verschiedenen Einheiten aus lassen.
- Sichtbar wie „Mini-Brücke zeigen“; vier Sprachen. Keine Änderung an bestehenden Berichten (Standard aus).

## 1.51.1.0 (2026-10-18)

**Familien-Angleichung mit P&L: Hub-Leiste, Zurück-Pille und Leser-Karte nach einer gemeinsamen Spezifikation.**

- **Hub-Leiste (jede Hub-Seite):** 1 px Trennlinie (10 % ink), 12 px / 8 px
  Innenabstand; „Aa“-Glyph, die Pillen **HD · Full HD · UHD** (rx = h/2,
  6 px Abstand; aktiv Teal #0E8585 mit weißer Schrift, Dark #3FB3C2 mit
  dunkler Schrift, Hochkontrast foregroundSelected-Rahmen), dahinter der
  Hinweis „Schriftgröße — HD für Laptops · Full HD für Monitore · UHD für
  Beamer & 4K“ (weicht als Einziges bei Platzmangel), rechtsbündig
  „📖 Doku öffnen“ als outlined Pille. Darunter mittig die Mikro-Signatur
  „made by Daten-WG“ (9 px, ink-soft, 60 %). `fontPreset`-Werte unverändert.
- **„← Zurück“** als outlined Pille links oben (Titel rechts daneben),
  „✕ Schließen“ im Overlay in derselben Form rechts oben.
- **Startseite:** Untertitel ink-soft, „🚀 Loslegen“ in Teal über die volle
  Block-Breite, die vier Einstiegs-Kacheln mit Radius 10 px, Hover-/Fokus-Lift
  (2 px + Schatten) und einheitlicher Piktogramm-Größe (64 × 44 px·k).
- **Vorlagen-Galerie:** Gruppen-Eyebrow in GROSSBUCHSTABEN, ink-soft, 11 px·k.
- **Lesemodus ohne Daten (Familien-Regel):** statt der klickbaren Galerie eine
  ruhige, nicht interaktive Karte — Produktname, ink-soft-Zeile „Dieses
  Visual hat noch keine Daten — Felder werden im Bearbeitungsmodus gebunden.“
  (eigener Leer-Zustand-Text gewinnt) und drei statische Mini-Schemata; keine
  Knöpfe, Pillen oder Doku-Link. Gilt auch für Hosts ohne Interaktion (Export).
- Pixel-Regression: alle Nicht-Hub-/Nicht-Leser-Fälle byte-identisch;
  geändert gewollt 29 Hub-Fälle und 10 Leser-Fälle (c137, c138, c205, c207,
  c226–c226e, c233d); neue Checks c237–c238c.

## 1.51.0.0 (2026-10-18)

**Hub-Polish für Self-Service von Controllern: Vorlagen nach Zweck, Schriftgröße HD · Full HD · UHD immer unten, alle Felder erklärt, „🚀 Loslegen“ und die Doku einen Klick entfernt.**

- **Vorlagen-Galerie nach Zweck gruppiert:** vier Gruppen mit Überschrift —
  Zeitverlauf (C01, C03, C05, C08) · Struktur (C02, C04, C06) · Korrelation
  (C09, C10) · Brücken & Mehrfach (C12, C13). Jede Kachel nennt den Zweck in
  Finance-Sprache („Säulen mit Vorjahres-Abweichung“ statt „C03“), darunter
  eine Nutzen-Zeile („Monatsbericht AC vs. PY“); die C-Nummer steht als
  kleines Badge in der Vorschau. Größere Vorschauen, Kacheln heben sich beim
  Überfahren oder per Tastatur-Fokus leicht an (Schatten + Akzentrahmen), die
  aktive Vorlage trägt „✓ aktiv“ und einen kräftigen Rahmen. Gruppen, die
  nebeneinander passen, teilen eine Reihe (in Gruppen-Spalten ausgerichtet);
  bei wenig Platz blättert die Galerie reihenweise. Speichern wie bisher:
  `template` + `templateApplied` + Preset in EINEM Merge.
- **HD · Full HD · UHD immer unten:** Jede Hub-Seite (Start, Loslegen, Tour,
  Vorlagen, Demo, Felder) endet in derselben Leiste; ihr erstes Element sind
  die drei Schriftgrößen HD · Full HD · UHD (= `labels.fontPreset`
  `compact` · `fullhd` · `presentation`), die aktive gefüllt. Ein Klick
  speichert sofort (Echo-Guard wie bei den Galerie-Pills) und zeichnet den Hub
  in der neuen Größe; im „☰ Start“-Overlay bleibt der Hub offen, beim
  Schließen erscheint der Chart in der neuen Größe.
- **„📖 Doku öffnen“** in derselben Leiste: öffnet die ChartKitchen-Doku über
  `host.launchUrl` (deutsche Seite bei deutscher Berichtssprache, sonst die
  englische). Kein zusätzliches Privileg; nur wo der Hub erscheint, also nie
  für Leser oder in Exporten.
- **Feld-Intro mit ALLEN 19 Datenrollen** in vier Abschnitten (Pflicht &
  Achse · Szenarien · Gliederung · Spezial), je ✓ wenn gebunden und ein
  kurzer Zweck (voller Name + Zweck im Tooltip). Dazu zwei Prämissen-Boxen:
  **IBCS-Notation** (AC voll · PY grau · PL Rahmen · FC schraffiert, gut/
  schlecht-Farben) und **Zeit vs. Struktur** („Zeit läuft horizontal, Struktur
  vertikal — Smart-Start schlägt die passende Achse nach deinem Kategorie-Feld
  vor“) mit Mini-Piktogramm. Die Blöcke fließen in bis zu drei Spalten; was
  nicht passt, steht auf weiteren Seiten (‹ n / N ›). Gilt auch für den Modus
  `fields`, der jetzt die Host-Palette (Hochkontrast) nutzt.
- **„🚀 Loslegen“** als erster, hervorgehobener Knopf im Hub: geführte
  Checkliste ① Felder binden (✓ live je Pflicht-/Empfehlungsrolle: Ist (AC)
  Pflicht, Kategorie, Vorjahr, Plan empfohlen — mit Hinweis, wo die
  Feldbereiche sind) · ② Template wählen (Sprung in die Galerie, ✓ sobald eine
  Vorlage gesetzt ist) · ③ Feinschliff (Vergleich & Abweichung, IBCS-Titel,
  Größen-Preset). Nichts davon wird gespeichert.
- **„← Zurück“ durchgängig:** jede Unterseite hat den Chip oben rechts; die
  letzte Tour-Karte bietet zusätzlich „← Zurück zum Start“; Esc wie gehabt.
- **„☰ Start“ dauerhaft sichtbar:** im Bearbeitungsmodus über dem fertigen
  Chart abgeschwächt (Deckkraft 0,5), beim Überfahren oder Fokus voll. Liegt
  an seiner Grundposition unten links Text des Charts (z. B. die erste
  Achsenbeschriftung) darunter, rückt die Chip-Leiste eine Stufe nach oben.
  Leser und Exporte sehen ihn weiterhin nie.
- 78 neue resjson-Keys, zwei entfallen (`FI_Minimal`, `FI_Extended`): 677 je
  Sprache, de/en/es/ja identisch. Testfälle c230–c236; c203, c222, c225
  angepasst. Pixel-Regression aller Bestandsfälle gegen 1.50: identisch bis
  auf die Hub-/Leerzustand-Fälle c11, c135, c139, c203, c204, c206,
  c220–c229 und — allein wegen des jetzt sichtbaren ☰-Chips — c223, c223b,
  c224, c225 (Abweichung nur im Chip-Bereich unten links). Lese- und
  Export-Fälle (u. a. c205, c226) unverändert.

## 1.50.0.0 (2026-10-18)

**Start-Hub: Wer das Visual leer auf die Seite zieht, bekommt vier große Knöpfe statt einer Galerie — Feature-Tour, IBCS-Vorlagen mit Vorschau, Demo, Felder erklären.**

- **Start-Hub als neuer Leer-Zustand im Bearbeitungsmodus** (`emptyState.mode`
  = `hub`, neuer Standard): „Was kann das Visual?“ · „Templates“ · „Demo
  ansehen“ · „Felder erklären“. Jede Unterseite hat „← Zurück“, Esc führt
  ebenfalls zurück. Die bisherigen Werte `demo` (nur Galerie, Verhalten bis
  1.49), `fields` und `message` bleiben wählbar und verhalten sich wie
  bisher; Feld-Intro und eigene Nachricht bieten zusätzlich den Umschalter
  „☰ Start-Hub“.
- **Feature-Tour:** 11 durchblätterbare Karten (‹ ›, Pfeiltasten, Pos1/Ende,
  Punkte) mit Mini-Vorschau und ein, zwei Sätzen je Kern-Fähigkeit — die 13
  Chart-Modi in vier Gruppen (Zeitreihen, Struktur, Brücken & GuV, Analyse),
  Varianz-Panels, Small Multiples, Kommentare, Dark Mode & Hochkontrast,
  Play & Animation, YTD/Wesentlichkeit/Exceptions, Vorlagen & Smart-Start
  (mit Sprung in die Vorlagen-Galerie). Die Vorschauen zeichnet dieselbe
  SVG-Pipeline wie die Demo-Galerie (keine Bitmaps).
- **Vorlagen-Galerie:** die IBCS-Vorlagen C01–C13 als Kacheln mit
  Mini-Vorschau; ein Klick schreibt dasselbe wie das Dropdown (`template`,
  `templateApplied` und das Preset in EINEM Merge, Echo-Guard). Ohne
  gebundene Felder wird die Wahl gespeichert („✓ C03 gespeichert — wird
  aktiv, sobald Felder gebunden sind“) und greift beim Binden. Kacheln nennen
  ein noch fehlendes Pflichtfeld (Stack-Serie, Blasengröße, Small Multiples);
  bei wenig Platz blättert die Galerie seitenweise.
- **„☰ Start“ über dem fertigen Chart** (nur Bearbeitungsmodus, erscheint
  beim Überfahren des Visuals oder per Tab): öffnet denselben Hub als
  Overlay — die Vorlagen-Galerie ist damit jederzeit erreichbar. Der Chart
  wird darunter nur verborgen; „✕ Schließen“ bzw. Esc zeigt ihn exakt wie
  vorher. Eine Vorlagen-Wahl im Overlay wendet an und schließt es, damit das
  Ergebnis sofort sichtbar ist.
- **Vorlage erneut anwenden:** Ein Klick auf die bereits aktive Vorlage in der
  Galerie wendet sie wieder an (bisher wirkungslos). Das Dropdown im
  Formatbereich kann den schon gewählten Eintrag nicht erneut melden — dafür
  gibt es die Galerie und den neuen Chip:
- **„↺ Zum Template zurück“** (unten links, nur Bearbeitungsmodus): erscheint,
  sobald eine Vorlage gesetzt ist und eine ihrer Einstellungen davon abweicht;
  ein Klick stellt den Vorlagen-Stand wieder her, alle anderen Einstellungen
  bleiben.
- **Leser und Exporte sehen nie den Hub** und keine der neuen Chips: der
  Leer-Zustand zeigt für sie unverändert Galerie bzw. eigene Nachricht.
- Tastatur: alle Hub-Knöpfe per Tab erreichbar, Enter/Leertaste lösen aus,
  Esc geht zurück bzw. schließt; Dark Mode und Hochkontrast (Host-Palette,
  `foregroundSelected` als Akzent) auch im Hub.
- 53 neue resjson-Keys (601 je Sprache, de/en/es/ja identisch), Testfälle
  c220–c229. Pixel-Regression aller Bestandsfälle gegen 1.49: identisch bis
  auf die Leer-Zustände im Bearbeitungsmodus — c11, c135, c139 zeigen jetzt
  den Hub statt der Galerie (Default-Änderung), c203, c204, c206 haben den
  zusätzlichen Umschalter „☰ Start-Hub“. Lese- und Export-Fälle unverändert.

## 1.49.0.0 (2026-10-17)

**Sechs bewährte Muster aus dem Schwester-Visual P&L zurückübernommen: IBCS-Vorlagen, Nachladen, Lesezeichen, gesperrte Chips, Feld-Intro, Hochkontrast.**

- **IBCS-Chart-Vorlagen** (`chart.template`, erste Position der Chart-Karte,
  Standard „Aus“): C01 gestapelte Säulen · C02 gestapelte Balken · C03 Säulen
  + ΔPY-Panel + ΔPY%-Pins · C04 Balken + ΔPL-Varianzen · C05 Integrierte
  Brücke · C06 Kategorie-Brücke vertikal · C08 Linie · C09 Scatter · C10
  Bubble · C12 Waterfall · C13 Small Multiples (Modus bleibt). Eine Vorlage
  setzt Modus, Vergleich, Panels und die passenden Schalter in EINEM
  Schreibvorgang (versteckte Eigenschaft `chart.templateApplied`, Echo-Guard
  wie im P&L-Visual) — danach ist jede Einstellung frei änderbar. C07 (Fläche)
  und C11 gibt es im Visual nicht und stehen deshalb nicht in der Liste.
- **Keine stille 1000er-Kappung mehr:** Liefert Power BI mehr als ein
  Datenfenster (1000 Kategoriezeilen), lädt das Visual die weiteren Segmente
  per `fetchMoreData` nach. Während des Ladens steht unten rechts dezent
  „⏳ n Zeilen geladen …“; gezeichnet wird das erste Fenster und einmal der
  vollständige Bestand. Verweigert der Host weitere Segmente (100-MB-Grenze)
  oder greift die Sicherheitsgrenze von 30.000 Zeilen, sagt ein Hinweis, dass
  die Daten unvollständig sind. Bis 1000 Zeilen ändert sich nichts.
- **Lesezeichen stellen die Auswahl wieder her:** Ein Lesezeichen mit
  ausgewählten Kategorien (oder eine Auswahl aus einem anderen Visual) dimmt
  die übrigen Marken wie nach einem Klick; ein Lesezeichen ohne Auswahl hebt
  die Dimmung auf.
- **Gesperrte statt stumme Chips:** Knöpfe im Chart, die im aktuellen Zustand
  nichts bewirken würden, sind gedimmt, nicht klickbar und nennen im Tooltip
  den Grund — YTD auf GuV-Zeilen oder bei nur einer Periode, ⇅ wenn die
  Reihenfolge schon der Wirkungs-Sortierung entspricht, ⚠ wenn nichts zu
  verdichten ist (z. B. Benchmark-Karten ohne ΔPY/ΔPL), der Karten-Sortier-Chip
  ohne Vergleichswert sowie ▶/⇅/ΔPY|ΔPL einer Brücke, die nur ihren Hinweis
  zeigt. Ein Klick darauf speichert nichts.
- **Leer-Zustand mit Feld-Intro** (`emptyState.mode`: Demo-Galerie [Standard,
  wie bisher] · Feld-Intro · eigene Nachricht): Das Feld-Intro erklärt dem
  Autor im Bearbeitungsmodus die Kernrollen Kategorie, AC, PY, PL, FC,
  Stack-Serie und Small Multiples und hakt die bereits gebundenen ab; Knöpfe
  im Leer-Zustand schalten zwischen Feld-Intro, Galerie und eigener Nachricht
  um. Leser und Exporte sehen wie bisher Galerie bzw. eigene Nachricht.
- **Echter Hochkontrast:** Farben aus der Host-Palette (Vordergrund,
  Hintergrund, `foregroundSelected` für Hervorhebung und Hover), Status als
  Muster statt Farbe — gut gefüllt, schlecht hohl, unwesentlich gestrichelt —
  jetzt auch in KPI-Karten (Streifen, Mini-Brücke) und im Scatter-Status; die
  PY-Linie im Linienmodus ist gestrichelt. Ohne Hochkontrast bleibt alles
  unverändert.
- 45 neue resjson-Keys (548 je Sprache, 4 Sprachen identisch), Testfälle
  c184–c219. Bestandsfälle pixelidentisch bis auf die Fälle mit bisher
  stummen Chips (jetzt gesperrt) und zwei Hochkontrast-Fälle mit Status-Mustern.

## 1.48.0.0 (2026-10-16)

**Scatter/Bubble-Ausbau: Small Multiples, Gruppen-Färbung und neun Analyse-Features inkl. Play-Modus.**

- **Small Multiples als echte Scatter-Kacheln:** gemeinsame X/Y-Skala,
  Quadranten-Linien (Mittelwert/Median über alle Punkte), refLine/xRefLine
  und Blasengröße gelten für alle Kacheln gleich; Kachel-Vergrößern (⤢)
  behält Skala und Farben. Σ- und Top-N-Rest-Kachel sind im Scatter bewusst
  aus (keine Summen über Quoten).
- **Einfärbung nach Gruppe** (`chart.scatterColorBy` += `group`): sechs
  gedeckte Farben ohne Rot/Grün (bleiben für gut/schlecht reserviert),
  eigene Dark-Palette, Legende oben mit „+n weitere" ab der 7. Gruppe;
  Rückfall auf einfarbig ohne Serie, keine Wirkung im Hochkontrast.
- **PY→AC-Bewegungspfeile** (`chart.scatterArrows`): kleiner grauer
  PY-Startpunkt, dünne Linie, Pfeilspitze an der AC-Markerkante; neue
  optionale Rolle **„X-Achse VJ (Scatter)"** (`xPrevious`) für echte
  2D-Bewegung, sonst nur Y; Tooltip mit Δ je Achse.
- **Größen-Legende** (`chart.scatterSizeLegend`, Default an): drei genestete
  Referenzkreise auf runden Werten in der ersten freien Plot-Ecke; bei
  Kacheln genau einmal.
- **Quadranten-Beschriftung:** vier freie Ecklabels
  (`chart.scatterQuadLabelTR/TL/BL/BR`, leer = aus), dezent in ink-soft.
- **Trendlinie** (`chart.scatterTrend` aus/linear) mit optionalem
  **R²-Label** (`chart.scatterTrendR2`), bei Kacheln je Kachel; im
  Log-Raum regressiert, bleibt also gerade.
- **Log-Skala** (`scale.xLogScale`/`yLogScale`): nur wenn alle Werte,
  Referenzlinien und fixierten Grenzen > 0, sonst linear + Hinweis im
  Edit-Modus; Dekaden-Ticks (1-2-5 bei enger Spanne); bei Kacheln eine
  deckweite Entscheidung.
- **Achsen-Min/Max fixieren** (`scale.xMin/xMax/yMin/yMax`, leer = auto,
  k/M/B-Suffixe): Skalen-Sync über mehrere Scatter-Visuals; Punkte
  außerhalb werden gezählt („n außerhalb der Achsen") statt gezeichnet.
- **Rechteck-Auswahl:** Aufziehen auf leerer Plotfläche selektiert alle
  enthaltenen Punkte als EIN Multi-Select (Crossfilter); Klick ohne Drag
  löscht wie bisher.
- **Punktform je Gruppe** (`chart.scatterShapes`): Kreis/Quadrat/Dreieck/
  Raute flächen-angeglichen, auch in der Legende — S/W-Druck- und
  Farbfehlsicht-tauglich, im Hochkontrast als Umriss-Formen.
- **Play-Modus (Rosling)** (`chart.scatterPlay`, Default aus = Button
  unsichtbar): Kategorie wird zur Zeitachse, je Frame ein Punkt pro Serie;
  animierte Bewegung (900 ms/Periode), großes Perioden-Wasserzeichen
  (Klick = Reset), Achsen/Quadranten/Blasenskala fix über alle Frames;
  statisch zeigt der Chart die letzte Periode. Nur für die einzelne
  Punktwolke (nicht bei Kacheln), Exporte rendern die volle Wolke.
- **Format-Menü:** Scatter-Einstellungen in Prioritätsreihenfolge
  (Quadranten → Färbung → Formen → Pfeile → Trend → R² → Größen-Legende →
  Ecklabels → Play); neue Gruppe „Scatter-Achsen" in der Skala-Karte;
  Sichtbarkeits-Gates (z. B. R² nur bei Trendlinie, Pfeile nur mit PY).
- Tests c170–c183 (+Varianten); 503 resjson-Keys je Sprache (4 Sprachen
  identisch); Bestandsfälle pixelidentisch bis auf die 7 Bubble-Fälle,
  die jetzt die Größen-Legende zeigen.

## 1.47.0.0 (2026-10-16)

**Vier Besitzer-Wünsche: Scatter/Bubble, Trend-Karten, Brücken-Ausrichtung, Sofort-Hierarchie.**

- **Neuer Chart-Typ „Scatter / Bubble (Korrelation)"** — 13. Modus:
  Y = AC, X = neue Measure-Rolle „X-Achse (Scatter)", optionale Rolle
  „Blasengröße" (Fläche proportional, 3–22 px). Quadranten-Linien
  (aus · Mittelwert · Median), refLine/xRefLine übersteuern sie; Achsen
  mit max. 5 runden Ticks, Einheit im Achsentitel; Labels mit
  Kollisionsvermeidung (Hervorgehobene > größte Blasen > Extrempunkte);
  optionale Status-Färbung nach ΔPY/ΔPL inkl. Wesentlichkeit; EMPHASIZE,
  FC-Schraffur, Kommentare, Crossfilter, Dark Mode, Hochkontrast.
  Multiples-Rolle wird zur kombinierten Punktwolke (Kategorie · Gruppe).
- **KPI-Karten mit Zeitreihe:** Neue Grouping-Rolle „Trend (Zeit)" —
  jede Karte wird zur Serie. Mini-Chart wählbar (Aus · Sparkline ·
  Säulen): Sparkline mit PY-Geisterlinie, FC gestrichelt, letzter
  Ist-Punkt beschriftet; Säulen nullbasiert, Negative unter der
  Nulllinie, FC schraffiert. Kartenwert „Letzter Wert" (Default, inkl.
  konsistenter Δ/Ampel aus derselben Periode) oder „Summe". Ohne
  Trend-Feld bleibt alles exakt wie bisher; andere Modi ignorieren die
  Rolle (Zeilen werden re-aggregiert).
- **Kategorie-Brücke: Ausrichtung wählbar** (Automatisch · Balken ·
  Säulen): Die neue vertikale Säulen-Kaskade (PY-Anker → Treiber → AC →
  ΔBasis-Überleitung) mit Δ%-Pins oben; Hervorhebung, Treiber-Notiz,
  n.a.-Regel und Small-Multiples-Skala gelten auch dort.
- **Hierarchie klappt sofort auf:** Mehrere Felder in „Kategorie"
  (Tabelle/GuV) → das Visual ruft die Drilldown-API selbst auf, der
  klickbare Zeilenbaum erscheint ohne die Drill-Knöpfe im Kopf; je
  Feld-Konstellation nur einmal, manuelles Hochklappen bleibt bestehen.
  Schalter „Hierarchie automatisch aufklappen" (Standard an).
- 47 neue Übersetzungs-Keys + 4 nachgezogene Alt-Lücken (465 × 4,
  Parität). Tests c157–c169 (+ Zusatzfälle); Regression: alle
  Bestandsfälle pixelidentisch (nur die Landing zeigt die 13. Kachel).

## 1.46.0.0 (2026-10-16)

**Cross-Interaktion steht jetzt immer auf „Filtern".**
Kundenbefund: Mit `supportsHighlight: true` (seit 1.41) stellte Power BI
die Visual-Wechselwirkung standardmäßig auf „Hervorheben" — dabei kommen
nur Dimm-Signale statt gefilterter Daten an, und in Tabelle, Wasserfall
und GuV wirkte das Visual bei Klicks in anderen Visuals wie unbeteiligt.

- `supportsHighlight` steht jetzt auf `false`: Power BI **filtert** das
  Visual bei jeder Cross-Interaktion automatisch — die Option
  „Hervorheben" wird für dieses Visual gar nicht mehr angeboten, kein
  Berichtsautor muss mehr daran denken, sie umzustellen.
- Σ-Kopf, Skalen und alle 12 Modi arbeiten damit bei Cross-Interaktion
  konsistent auf dem gefilterten Datenbestand.
- Die eigene Selektion IM Visual (Klick auf Balken/Zeile/Karte, Strg =
  Mehrfachauswahl) bleibt unverändert und dimmt weiterhin lokal.
- Der Highlight-Empfangspfad bleibt als toter Codepfad für den
  Test-Harness erhalten (AGENT-GUIDE Falle 8 aktualisiert).

## 1.45.0.0 (2026-10-16)

**Konzern-Paket: Skalierung wasserdicht, Achsenschnitt per Button, Panel neu geführt.**
Grundlage sind drei Audits (AUDIT-2026-10-SKALIERUNG/-UX/-IBCS.md).

**Skalierung (P0-Fixes):**
- **Doppel-Varianz:** ΔPY- und ΔPL-Panels teilen jetzt EINE Skala (abs und %),
  `fixedVarMax` wirkt auf beide, Tabelle nutzt eine Balken-Einheit für Δ/Δ2.
- **Brücken:** Kategorie- und Integrierte Brücke nehmen alle Kaskaden-
  Zwischenstände in die Skala (kein Überlaufen mehr); das Brücken-Panel in
  Säulen/Balken ist nullbasiert (Anker starten bei 0).
- **Gestapelt:** gemeinsame Skala über alle Small-Multiples-Kacheln,
  `fixedMax`/Kappung wirken, negative Segmente stapeln unter der Nulllinie.
- **Einheiten:** Werte und Varianzen teilen EINEN Einheitenmaßstab; Formate
  mit eigenem Präfix („#,0 T€", „Mio €") schalten die Auto-Einheit ab —
  der „K€ neben T€"-Fehler (Faktor 1000) ist behoben, der Titel zieht mit.
- **Wasserfall:** `fixedMax` und Kappung greifen jetzt auch hier; Skalen-
  Sync-Gruppe im Pane sichtbar.
- **Kappung:** ⫽-Marker an JEDEM gekappten Element (PY, PL, BM, Linie);
  eine Ziellinie über dem Cap dehnt die Achse nicht mehr.
- **„n.a.":** Δ% zeigt „n.a." bei Basis 0 oder Vorzeichenwechsel zwischen
  Basis und Ist (statt irreführender Werte wie „−250 %"); GuV-Kostenzeilen
  mit durchgängig negativer Basis behalten ihre Prozente. Überall: Labels,
  Pins, Tooltips, Tabelle, Karten, Σ-Kopf, GuV-Statement.

**Achsenschnitt Wasserfall (IBCS UN 5.3):**
- Neue Skala-Gruppe „Wasserfall-Achse": `wfAxisBreak` (aus · auto · an,
  Default aus) + `wfBreakAt` (0 = automatisch). Geschnitten wird nur, wenn
  alle Anker und Deltas vollständig über dem Schnitt liegen; Anker werden
  zu Stummeln mit ⫽ über die volle Balkenbreite, Titel-Suffix und Export-
  Fußzeile weisen den Schnitt aus. Small Multiples teilen EINEN Schnitt.
- In-Chart-Chip „⫽ Achse": schaltet an/aus, hebt sich bei Auto-Vorschlag
  hervor, ist bei unzulässigem Schnitt deaktiviert (Tooltip nennt den
  Grund bzw. die blockierende Kachel); persistiert mit Echo-Guard.

**Nutzerführung:**
- Chart-Karte an Position 1, `orientation` heißt im Pane „Chart-Typ",
  Enum-Labels eingedeutscht; Kartenreihenfolge nach Arbeitslogik.
- Chart-Karte neu gruppiert (u. a. neue Gruppen „Interaktion im Bericht"
  und „Darstellung") — reine Anzeige, keine Property-Änderung.
- Modus-Chips (✎ Kommentar / ⚙ Struktur / ⇄ Vergleich) beenden ihren
  Modus jetzt per Klick; Struktur-Chip-Tooltip-Bug behoben.
- Landing-Galerie nennt nach der Modus-Wahl den nächsten Schritt
  („Als Nächstes: … in die Feldliste ziehen", lokalisiert).
- `acFcSplit` nur sichtbar mit FC-Measure; „Nur Auffälligkeiten" immer
  sichtbar, Beschreibung nennt ohne Schwelle die Voraussetzung.
- 15 bisher fehlende Übersetzungs-Keys nachgezogen (AC+FC-Split, (blank),
  Export-Aufklappen, Varianz-Preset, Umbenennen-Felder) — 418 Keys × 4.

Tests c140–c156; Regression: alle 145 Bestandsfälle byte-identisch
(Achsenschnitt-Refactoring), GuV-Fälle pixelidentisch (n.a.-Regel).

## 1.44.0.0 (2026-10-07)

**Eigener Leer-Zustand + Dark-Mode-Tooltip.**
Zwei Nutzerwünsche aus dem Dark-Mode-Rollout:

- **Neue Karte „Leer-Zustand"** (`emptyState`: Eigener Titel + Eigener
  Text): Werden keine Daten dargestellt (Felder leer oder Auswahl ohne
  Zeilen), ersetzt der eigene Text das „ChartKitchen byDatenWG"-Branding.
  Im **Lesemodus** sehen Berichtsleser nur noch Titel + Text, zentriert
  und mit Wortumbruch — die Modus-Galerie ist ein Builder-Werkzeug und
  bleibt dem Bearbeitungsmodus vorbehalten (dort als Header-Vorschau der
  eigenen Texte über der Galerie). Ohne eigene Texte bleibt alles wie
  bisher.
- **Hover-Tooltip folgt dem Dark Mode:** Der native Power-BI-Tooltip
  behält das (meist helle) Report-Styling und blendet auf dunklen
  Seiten. Im Dark Mode zeichnet das Visual den Tooltip jetzt selbst —
  dunkler Kasten (#2B2B2B), helle Schrift, Kategorie als Header,
  gedimmte Zeilenlabels, Kantenerkennung am Visual-Rand (klappt am
  Cursor um). Im hellen Modus bleibt der native tooltipService
  unverändert.
- Testfälle c137–c139 (Lesemodus hell/dunkel, Edit-Modus-Vorschau) plus
  Hover-Verifikation in c131/c136; 5 neue String-Keys × 4 Sprachen.

## 1.43.0.0 (2026-09-16)

**Dark Mode: lesbar auf dunklen Berichtsseiten.**
Kundenfeedback: Auf dunklen Report-Themes blieben Schrift und Achsen
dunkel und damit kaum lesbar. Jetzt:

- **Neues Setting „Erscheinungsbild"** (IBCS-Farben → Auto · Hell ·
  Dunkel). *Auto* erkennt dunkle Berichts-Themes an der Luminanz der
  Theme-Hintergrundfarbe (< 0,35) und kippt selbstständig; für manuell
  dunkel eingefärbte Seiten ohne dunkles Theme gibt es *Dunkel* als
  expliziten Schalter.
- **Zentrale Dark-Token:** Tinte, Papier, Sekundärgrau plus die neuen
  cfg-Töne `faint` (Karten-Rahmen/Separatoren), `wash`
  (Emphasis-Kartenfüllung) und `band` (Bullet-Band) — alle bisher
  hart verdrahteten hellen Hex-Werte laufen jetzt über diese Token.
  Halos und hohle Marker füllen mit dem dunklen Papier (Theme-Hintergrund,
  Fallback #1E1E1E), damit sie mit der Seite verschmelzen.
- **Farbwähler-Defaults dark-tauglich:** Steht ein Picker noch auf seinem
  hellen Standard (AC/PL #404040, PY #B3B3B3, Gut #1E8F9E, Schlecht
  #D64541), wird im Dark Mode automatisch die helle bzw. aufgehellte
  Entsprechung gerendert (#D9D9D9 / #8A8A8A / #3FB3C2 / #E4635F) — vom
  Nutzer gewählte Farben bleiben unangetastet. Das Blau/Orange-Preset
  hellt analog auf (#5BA3DC / #F0821E).
- **Landing-Gallery und HTML-Overlays** (Zeilensuche, Struktur-Menü,
  Kommentar-Editor) folgen dem Erscheinungsbild ebenfalls.
- Hochkontrast-Modus bleibt unverändert der eigene Pfad (Palette
  erzwingt Farben); Zebra/Emphasis-Bänder tönen weiter mit `ink` und
  funktionieren dadurch in beiden Modi ohne Sonderfall.
- Testfälle c131–c136 (erzwungen, Auto-Erkennung, Tabelle+Zebra,
  KPI-Karten, Landing, Hell-Regression). 5 neue String-Keys × 4 Sprachen.

## 1.42.0.0 (2026-08-13)

**Quick-Win-Paket: schneller starten, schneller Auffälligkeiten sehen.**
Vier Backlog-Punkte aus Ease-of-Use, Builder-UX und Analytik:

- **Feldrollen-Tooltips:** Alle 15 Datenrollen erklären sich jetzt beim
  Hover im Feld-Bereich selbst — was reinkommt, was es bewirkt, inkl. des
  wichtigsten Fallstricks (z. B. FC-Flag-Werte, colgroup → Matrix). Sauber
  lokalisiert über `descriptionKey` in allen vier Sprachen; die bisherigen
  teils deutschen Hardcode-Texte sind ersetzt.
- **Hervorhebung (EMPHASIZE) in allen Modi:** Das Highlight-Setting griff
  bisher nur in Columns/Bars/Line, Tabelle und Karten. Jetzt auch in
  **Pareto, GuV-Wasserfall, Integrierter Brücke, Kategorie-Brücke und
  gestapelten Säulen/Balken** — einheitlich als schattiertes Band hinter
  dem Slot plus fettes Label, im Hochkontrast-Modus als Rahmen. Der
  Band-Code ist dabei in eine gemeinsame Hilfsfunktion gewandert
  (Columns/Bars/Tabelle nutzen sie jetzt mit). Testfälle c125–c127.
- **Abweichungs-Filter „nur Auffälligkeiten"** (Chart → Analyse,
  `exceptionOnly`): Exception-Reporting auf einen Klick — nur Kategorien
  über der Wesentlichkeitsschwelle bleiben einzeln stehen, der Rest wird
  zu einer neutralen Sammelzeile „Unauffällig (n)" verdichtet (Σ bleibt
  exakt erhalten). Dazu ein ⚠-Chip im Chart zum Umschalten (persistiert,
  bookmarkfähig) und ein Fußzeilen-Hinweis „⚠ n zusammengefasst" für
  Transparenz. Greift bewusst nur in Struktur-Modi (Bars, Karten, flache
  Tabelle) — Zeitachsen und Kaskaden bekommen keine Lücken. Sichtbar nur,
  wenn Materialitätsschwellen gesetzt sind. Testfälle c128–c129.
- **Smart-Start:** Nach dem Binden der Felder erkennt das Visual die
  Konstellation und schlägt im Bearbeitungsmodus per Klick den passenden
  Modus vor (Struktur-Kategorien → Balken, sum/delta-Typen → Wasserfall,
  Spaltengruppen → Matrix, lange Zeitreihe → Linie). Ein Klick wendet den
  Modus an, ✕ verwirft den Vorschlag dauerhaft für diese Konstellation;
  im Lesemodus erscheint nichts. Abschaltbar (Chart → Layout). Testfall
  c130.

## 1.41.0.0 (2026-08-13)

**Cross-Highlighting und zwei Karten-Wünsche aus dem Beta-Feedback.**

- **Cross-Highlight statt stiller Filterung** (`supportsHighlight`): Klickt
  jemand in einem anderen Visual auf einen Balken, bekam ChartKitchen bisher
  nur noch die gefilterten Zeilen — der Vergleichskontext verschwand. Jetzt
  liefert Power BI alle Zeilen plus die Information, welche zur Auswahl
  gehören: **die hervorgehobenen Kategorien bleiben voll deckend, alle
  übrigen rendern gedimmt**. Der Rest des Charts bleibt als Kontext stehen,
  Skalen und Σ-Kopf springen beim Klicken nicht mehr. Gilt für alle Modi
  (Säulen, Balken, Brücken, Tabelle, Matrix, Karten), weil die Dimmung an
  derselben Gruppen-Mechanik hängt wie die eigene Selektion. Eine eigene
  Selektion im Visual hat weiterhin Vorrang, solange sie aktiv ist.
  Teil-Hervorhebungen (die Kategorie ist nur anteilig ausgewählt) zählen als
  hervorgehoben. Testfall c124.
  *Hinweis:* Das ist eine bewusste Verhaltensänderung — wer bisher erwartet
  hat, dass Cross-Filtering die Zahlen im Visual filtert, sieht jetzt den
  vollen Datenkontext mit optischer Hervorhebung (so verhalten sich auch die
  nativen Power-BI-Diagramme).
- **KPI-Karten ohne Kategoriefeld** (Beta-Wunsch): Bisher war ein
  Kategoriefeld Pflicht — wer einfach „Umsatz, Vorjahr, Plan" auf eine
  Karte legen wollte, landete auf der Landing Page. Jetzt reichen die
  Measures: das Visual rendert **eine Kachel, überschrieben mit dem Namen
  der AC-Measure**, inklusive Δ-Zeilen und Mini-Brücke wie gewohnt. Gilt
  technisch für alle Modi (eine Kategorie ohne Namen), gedacht ist es für
  die „eine große Zahl"-Karte. Testfall c122.
- **Referenzwerte auf der Karte** (Beta-Wunsch): Die Karte zeigte bisher nur
  die Abweichung („ΔVJ +700 T€"), nicht den Vergleichswert selbst. Neues
  Setting **„Referenzwerte anzeigen"** (Chart → KPI cards): *Nur
  Abweichungen* (Standard, unverändert), *Basiswert* blendet die
  Vergleichsbasis als eigene Zeile ein, *Alle gebundenen Szenarien*
  zusätzlich VJ, Plan, Prognose und Benchmark. Die Wertzeilen stehen in
  Tinte über den farbigen Δ-Zeilen — die Abweichung behält das optische
  Gewicht. Bei knapper Kachelhöhe entfallen die unteren Zeilen wie bisher.
  Testfall c123.

## 1.40.0.0 (2026-08-05)

**AC + FC im selben Monat: die Splitsäule.** Der laufende Monat ist im
Reporting fast immer halb geschlossen — AC bis zum Stichtag, FC für den
Rest. Bisher zeigte das Visual entweder/oder (FC nur, wenn AC fehlt).
Neu (Beta-Wunsch aus dem zweiten externen Test):

- **Setting „AC + FC in the same period"** (Chart → Layout, Standard aus):
  Liefert ein Monat beide Werte, rendert Columns/Bars einen **soliden
  AC-Sockel mit schraffiertem FC-Aufsatz** in derselben Säule
  (IBCS-Notation).
- **Zwei Interpretationen, explizit wählbar** — die falsche Wahl würde den
  Monat doppelt zählen, deshalb kein Raten: **„Vollmonatsprognose"**
  (Säule = AC + max(0, FC − AC), der FC ist die Prognose für den ganzen
  Monat) oder **„Restmonat"** (Säule = AC + FC, der FC deckt nur die
  verbleibenden Tage).
- **Konsistent gerechnet:** Wert-Label, Σ-Header, Skalen und Δ-Panels
  nutzen den Gesamtwert der Splitsäule; der Tooltip zeigt AC, FC und den
  Composite („AC+FC … (FC-Anteil …)") getrennt aus. Die Umbenennungs-
  Felder (1.39) wirken auch hier.
- Reine FC-Monate und das FC-Flag verhalten sich unverändert; der Split
  greift nur, wenn beide Werte in derselben Periode ankommen.
  Testfall c121 im Harness.

## 1.39.0.0 (2026-08-05)

**Politur-Paket aus dem Beta-Feedback (A. Korn) plus Backlog-Quick-Wins.**
Neun kleine Verbesserungen, vier davon direkt aus dem ersten externen
End-to-End-Test:

- **Rundungshinweis kollidiert nicht mehr (Bars).** „Summe weicht
  rundungsbedingt ab" überlagerte im Bars-Modus die ΔPY-%-Panel-Überschrift;
  der Hinweis sitzt dort jetzt unten rechts (mit Papier-Halo), in Columns
  unverändert unter dem Σ-Header.
- **„Leerkategorie ausblenden"** (Chart → Layout): `(blank)`-Zeilen, -Balken
  und -KPI-Karten lassen sich ausblenden. Bewusst standardmäßig AUS, damit
  keine Daten unbemerkt verschwinden.
- **Gemeinsame Nullachse in der Tabelle.** Δ-Balken- und Δ%-Pin-Spalte
  ankern ihre Nulllinie jetzt auf derselben relativen Spaltenposition,
  bemessen an den echten Negativ-/Positiv-Anteilen — einseitige Daten
  verschenken nicht mehr die halbe Spalte, und die Achsen springen nicht
  mehr gegeneinander. Gilt auch für die Δ2-Spalte (Doppel-Varianz).
- **KPI-Karten: Sortieren-Chip mit Luft zum Rand** statt 2-px-Klebeabstand.
- **WCAG-Kontrast:** Sekundärtexte (Panel-Titel, Datumsangaben, Hinweise)
  von `#8A8A8A` auf `#6E6E6E` angehoben — erfüllt AA (≥ 4,5:1) auf Weiß.
- **Farbpreset „Blau/Orange"** (IBCS colors): ColorBrewer-Paar
  `#2C7BB6`/`#E66101` als Dropdown neben den Good/Bad-Pickern — auch bei
  Achromatopsie und im S/W-Druck über die Helligkeit unterscheidbar.
- **Szenariokürzel umbenennen** (Data labels): AC→„Ist", PY→„VJ",
  PL→„Budget", FC→„Prognose" — wirkt auf Titelblock, Panel-Titel, Tabellen-/
  Matrix-Spaltenköpfe, Brücken-Beschriftungen, GuV-Sichten-Buttons, Legenden
  und Tooltips. Leer = IBCS-Standard.
- **Export: alles aufklappen** (Chart → Table, Standard AN): PDF-/PPT-Export
  und Abo-Mails rendern Tabelle, Matrix und GuV-Statement mit allen Zeilen-
  und Spalten-Ebenen offen — der Bildschirm-Zustand bleibt unberührt.
- **Formelzeilen melden Fehler:** Eine unauflösbare Formel (Tippfehler im
  Zeilennamen, kaputte Syntax) erscheint als „Label = ?"-Zeile statt lautlos
  wegzufallen — in Tabelle und Matrix.

## 1.38.0.0 (2026-07-19)

**Matrix-Breite-Paket: Zwei-Zeilen-Kompaktmodus und Spaltenbreiten per
Drag.** Zwei Verbesserungen, die die Breite von Tabelle und Matrix in den
Griff bekommen:

- **Zwei-Zeilen-Kompaktmodus (Matrix).** Neues Setting „Zellen-Layout
  (Matrix)": „Spalten" (Standard) zeigt Wert und ΔBasis nebeneinander,
  „Zwei Zeilen" setzt den Wert groß nach oben und die kleinere Δ-Zahl
  (in Δ-Farbe, mit Trend-Icon und Δ vs. Vorspalte wie gewohnt) direkt
  darunter in dieselbe Zelle. Ein Spaltenblock ist damit nur noch so
  breit wie seine Wertspalte — die Matrix wird etwa halb so breit und
  passt oft ohne horizontales Scrollen. Der Δ-Minibalken entfällt im
  Zwei-Zeilen-Modus (kein Platz); Referenzspalten (Werte-Spalten AC·PY·PL)
  bleiben als eigene Spalten neben dem Wert. Die Zeilenhöhe wird
  automatisch auf zwei Textzeilen angehoben (auch bei „Kompakt"), zu
  volle Kacheln scrollen wie bisher vertikal. Der Σ-Block wird gleich
  behandelt: Σ-Wert oben, ΔPY (mit Δ% in Klammern, wenn relative
  Abweichung an ist) darunter. Wirkt nur in der Matrix — die flache
  Tabelle hat keine Breitennot.
- **Alle Spaltenbreiten per Drag + Auto-Fit.** Bisher war nur die
  Namensspalte per Drag verstellbar. Jetzt tragen auch die numerischen
  Spalten einen Ziehgriff an ihrer rechten Kante: in der flachen Tabelle
  die AC-Wertspalte (samt Referenzspalten) und die Δ-Spalte, in der
  Matrix ein Griff für die einheitliche Blockbreite aller Blöcke (IBCS)
  plus ein Griff für den Σ-Block. Doppelklick auf einen Griff passt die
  Spalte an den längsten sichtbaren Zellinhalt an (Auto-Fit). Die Breiten
  werden in einer versteckten Eigenschaft `tableColWidths` (JSON) im
  Bericht gespeichert — mit demselben Persist-/Echo-/Drag-Schutz wie die
  Namensspalte, sodass eine Host-Aktualisierung mitten im Ziehen die
  Breite nicht verwirft. Grafik-Spalten (Balken/Pins) teilen sich wie
  bisher den Rest. Griffe nur im interaktiven Modus.

## 1.37.0.0 (2026-07-19)

**Bedienkomfort-Paket für Tabelle und Matrix.** Fünf Verbesserungen rund
um Aufklappen, Lesbarkeit und Layout der IBCS-Tabelle und der Matrix:

- **±Alle-Aufklappen im Kopf.** Neben dem bekannten „Alle Zeilen
  auf-/zuklappen"-Doppelchevron gibt es in der Matrix jetzt auch einen
  ⊞/⊟-Knopf, der alle Spaltengruppen auf einmal öffnet bzw. schließt
  (nur interaktiv, mit Titel/aria-label). Ebenen-Regler wurde bewusst
  ausgelassen — der Doppelchevron öffnet ohnehin alle Ebenen, und
  Spaltengruppen haben max. zwei Ebenen.
- **Hover-Hervorhebung.** Die Zeile unter dem Cursor wird dezent
  hinterlegt (im Hochkontrast-Modus als dünner Rahmen); in der Matrix
  zusätzlich die Spalte/Block unter dem Cursor — auch im horizontal
  gescrollten Zustand. Rein transient, koexistiert mit Cross-Filter.
- **Σ-Zeile oben oder unten.** Neues Setting „Position der Σ-Zeile":
  „Unten" (Standard, deutsche GuV-Lesart) oder „Oben" direkt unter dem
  Kopf (IBCS) — in beiden Fällen beim Scrollen fixiert.
- **Zeilenumbruch für lange Positionsnamen.** Lange Kategorienamen
  (z. B. „Sonstige betriebliche Aufwendungen") brechen automatisch auf
  zwei Zeilen um, wenn die Zeile hoch genug ist, statt abgeschnitten zu
  werden — gilt für flache Tabelle und Matrix.
- **Zeilen-Layoutpaket.** Drei neue Settings: „Zebra-Streifen" (dezenter
  Wechselhintergrund, im Hochkontrast aus), „Zeilenhöhe"
  (kompakt/normal/luftig) und „Gitterlinien" (horizontal/keine/beide, mit
  dezenten Spalten- bzw. Blocktrennern).

## 1.36.0.0 (2026-07-19)

**Breite Matrizen horizontal scrollen statt abschneiden.** Wenn eine
Matrix mit Spaltengruppen zu breit für die Kachel wurde, fielen bisher
als letzte Stufe die rechten Blöcke weg (Hinweis „… +n"). Jetzt bleiben
alle Blöcke erhalten — der Blockstreifen wird stattdessen horizontal
scrollbar:

- **Alle Blöcke bleiben erreichbar.** Die bisherigen Sparstufen
  (Referenzspalten → Minibalken → Δ → Wertspalte schmaler) laufen
  unverändert; erst danach greift statt des Abschneidens das Scrollen.
- **Namensspalte links und Σ-Block rechts bleiben fixiert.** Nur die
  Blockflächen samt ihrer Kopfzeilen (auch die Level-0-Spannzeile bei
  zwei Spaltenebenen) wandern — Einfrieren links und rechts wie bei den
  Zeilen.
- **Bedienung.** Shift + Mausrad bzw. horizontales Wheel-Delta über der
  Matrix, ein Scrollbalken unten am Blockbereich (Ziehen), sowie
  Tastatur auf dem Thumb (←/→ ein Block, Bild auf/ab eine Breite) mit
  `role="scrollbar"` und `aria-orientation="horizontal"`.
- **Export/Druck unverändert.** Ohne Interaktivität (Export, PDF, Druck)
  bleibt das bisherige Verhalten mit „… +n"-Hinweis erhalten, da
  gescrollte Inhalte in einem Standbild nicht erreichbar wären.
- **Passt alles hinein, ändert sich nichts** — pixelgleich zum bisherigen
  Verhalten, kein Scrollbalken.

## 1.35.4.0 (2026-07-19)

**Politur-Paket: acht kleine Funde aus dem Juli-Audit.** Lauter
Randfälle und Feinschliff, ohne Auswirkung auf die Rechnung:

- **Matrix ohne leeren Σ-Slot.** Bei nur einer Top-Level-Zeile
  reservierte die Matrix trotzdem eine Σ-Zeile (Separator/Scroll-Track
  liefen eine Zeile zu weit). Slot-Reservierung und Zeichnung hängen nun
  gleichermaßen an „mehr als eine Zeile".
- **Matrix-Scrollbar per Tastatur.** Der Matrix-Thumb reagiert jetzt wie
  die Flat-Table auf Pfeil- und Bild-auf/ab-Tasten.
- **KPI-Karten: dokumentierter Tiebreaker greift.** Bei gleichem |Δ%|
  entscheidet nun die absolute Abweichung (größere zuerst) — wie seit
  1.25.2.0 versprochen.
- **ja-JP-Größen-Pills laufen nicht mehr aus.** Das Kurzlabel-Stripping
  schneidet auch Klammerzusätze ohne vorangestelltes Leerzeichen und
  Fullwidth-Klammern ab.
- **Tabellen-Modus-Icon zeigt eckigen Pin-Kopf.** Das Mini-Vorschau-Icon
  entspricht wieder dem tatsächlichen Tabellen-Default (quadratisch).
- **Finance-Format + Nullserie: Titel ohne „in –".** Die Einheit wird aus
  einem Nicht-Null-Muster abgeleitet, sodass das echte Suffix (z. B.
  „T€") erhalten bleibt.
- **Test-Harness umbenannt.** Interner Bundle-Global von einem
  Fremdmarken-Namen auf `ChartKitchen` umgestellt.
- **Backlog neutral formuliert.** Wettbewerber-Nennung entfernt.

## 1.35.3.0 (2026-07-19)

**Format-Pane-Tooltips jetzt in allen vier Sprachen.** Die
Beschreibungstexte (Info-Tooltips) der Einstellungen waren fest deutsch
codiert und erschienen dadurch auch bei en-US/es-ES/ja-JP auf Deutsch.
Alle 63 Beschreibungen haben nun einen `descriptionKey` und werden über
den Localization-Manager aufgelöst (analog zu `displayNameKey`); die
Übersetzungen liegen in den vier `resources.resjson`. Der deutsche Text
bleibt als Fallback im Code.

## 1.35.2.0 (2026-07-19)

**Fünf Darstellungs-Fixes aus dem Juli-Audit.** Rechnerisch war alles
korrekt — es ging um Beschriftungen, die am Rand oder auf der Nulllinie
ins Rutschen kamen, und um zwei Einstellungen, die in Einzelmodi nicht
griffen:

- **Randlabel behält sein Vorzeichen.** Wert-, Δ- und Δ%-Labels am
  linken oder rechten Viewport-Rand wurden bisher beschnitten — aus
  „−23,2 %" wurde optisch „23,2 %", eine Verschlechterung sah aus wie
  eine Verbesserung. Solche Labels werden jetzt komplett nach innen
  geschoben statt abgeschnitten; das Minus geht nie mehr verloren.
- **KPI-Karte (Basis fcrev): Wert übermalt das Zeilenlabel nicht mehr.**
  Die Wertspalte startete fix nach 2,6 Zeichen, das Label „ΔFC Vm" ist
  aber breiter — der Wert überschrieb das „m". Die Wertspalte richtet
  sich jetzt an der tatsächlichen Labelbreite aus.
- **GuV respektiert den Pin-Stil.** Die ΔRef%-Pinköpfe im GuV-Modus
  waren fest quadratisch; die Einstellung „Rund" blieb wirkungslos.
  Sie nutzen jetzt denselben Pin-Helfer wie alle anderen Modi.
- **Waterfall auf 0: Δ-Label weicht aus.** Endet die Kaskade auf der
  Nulllinie, kollidierte das Wertlabel des letzten Balkens mit dem
  Kategorie-Achsennamen. Das Label weicht in diesem Fall auf die
  Oberseite des Balkens aus.
- **„Nur Extremwerte" dünnt Kategorienamen nicht mehr aus.** Die
  Beschriftungsdichte „Enden" betrifft laut Einstellung nur die
  Wertlabels — die Kategorie-Achsennamen liefen aber durch dasselbe
  Extremwert-Filter und verschwanden trotz Platz. Sie folgen jetzt der
  normalen Platz-Heuristik.

## 1.35.1.0 (2026-07-19)

**Kommentar-Schriftgröße einstellbar.** Die Kommentar-Liste war fest
auf 10 pt verdrahtet und blieb damit auch bei großen Presets klein.
Neu in der Kommentare-Karte: **„Kommentar-Schriftgröße"** (8–24 pt,
Standard 10). Die Größe multipliziert sich mit Schrift-Preset und
Skalierungs-Faktor, die Panelbreite wächst mit, und auch die
nummerierten Kommentar-Badges im Chart skalieren jetzt mit dem
Preset statt fix bei 9 pt zu bleiben.

## 1.35.0.0 (2026-07-19)

**Matrix respektiert die Tabellen-Anzeige-Einstellungen.** Bisher waren
die Blöcke der Matrix (Tabelle mit Spaltengruppen) fest auf
[AC | Δ | Minibalken] verdrahtet — die Einstellungen aus der
Tabellen-Karte griffen nur in der flachen Tabelle. Jetzt:

- **Werte-Spalten** wirkt auch je Spaltenblock: „AC + Varianzbasis"
  ergänzt die Basis-Spalte (PY oder PL), „AC · PY · PL" beide
  Referenzszenarien — druck- und boardtaugliche Matrizen ohne
  Balken-Interpretation. Bei Platzmangel fallen die Referenzspalten
  zuerst weg (vor Minibalken und Δ), danach greift die bekannte
  Überlauf-Strategie.
- **Absolute Abweichung** (aus) blendet die Δ-Minibalken der Blöcke
  aus — die Δ-Zahlen bleiben, wie in der flachen Tabelle.
- **Relative Abweichung** (aus) entfernt die Δ%-Spalte des Σ-Blocks;
  der frei werdende Platz kommt den Blöcken zugute.
- Nebenbei: Auch die Σ-Zeilen-Referenzwerte werden befüllt, und die
  %-Zeilen der Matrix folgen jetzt ebenfalls der
  Finance-Klammer-Notation (wie seit 1.34.3.0 in der flachen Tabelle).

## 1.34.5.0 (2026-07-19)

**Bugfix-Paket 4 aus dem Juli-Audit — gemeinsame Multiples-Skala:**

- **Verweigerte Kacheln zählen nicht mehr:** Bei „gleiche Skala"
  flossen auch Gruppen in die gemeinsamen Maxima ein, die der Renderer
  gar nicht zeichnet — eine Kachel mit Negativ-Hinweis (integrierte
  Brücke) oder fehlender PY/PL-Basis (Kategorie-Brücke) konnte damit
  alle sichtbaren Kacheln auf Miniaturgröße stauchen bzw. die
  ΔPY%-Pins aller Nachbarn aufs Minimum kollabieren. Die
  Skalen-Berechnung spiegelt jetzt exakt die Verweigerungs-Guards der
  Renderer.
- **Grid-Grenze:** Gruppen jenseits der 24-Kachel-Grenze (die nur als
  „+N weitere" im Titel erscheinen) bestimmen die gemeinsame Skala
  ebenfalls nicht mehr.

## 1.34.4.0 (2026-07-19)

**Bugfix-Paket 3 aus dem Juli-Audit — Zustands-Guards:**

- **Landing-Klicks ohne Deadlock:** Die Echo-Guards für Modus-Kacheln
  und Schriftgrößen-Pills der Landing-Seite hatten kein
  Verfallskriterium — ging das Host-Echo verloren, überschrieben sie
  jede spätere Auswahl im Formatbereich dauerhaft. Beide Guards
  verfallen jetzt nach spätestens fünf Updates; danach gilt wieder der
  Wert aus dem Formatbereich.
- **Bookmarks/Reset klappen wieder zu:** Ein Bookmark im
  Standard-Zustand oder „Auf Standard zurücksetzen" hat aufgeklappte
  Tabellen-Zeilen und Matrix-Spaltengruppen nie zurückgesetzt (der
  leere Zustand wurde verschluckt). Abwesende Drill-Properties werden
  jetzt als „alles zugeklappt" übernommen.
- **Karten-Sortierung:** Nach dem ersten Klick auf den
  In-Chart-Sortier-Chip war das Dropdown im Formatbereich dauerhaft
  wirkungslos (der persistierte Chip-Wert gewann für immer). Eine
  Änderung des Dropdowns löscht jetzt den Chip-Override.
- **Spaltenbreiten-Drag:** Ein Host-Update mitten im Ziehen des
  Namensspalten-Griffs setzte die Breite auf den alten Wert zurück und
  der Drag ging verloren. Während des Ziehens wird der gespeicherte
  Wert nicht mehr übernommen.

## 1.34.3.0 (2026-07-19)

**Bugfix-Paket 2 aus dem Juli-Audit — sichtbare Darstellung:**

- **KPI-Karten · Mini-Brücke:** Negative Werte wurden als positive
  Säulen nach oben gezeichnet (ein EBIT von −80 wirkte wie +80), bei
  Vorzeichenwechsel lief der Δ-Balken unter die Achse und übermalte
  die Legende. Die Brücke hat jetzt eine vorzeichenfähige Skala mit
  echter Nulllinie: Negative wachsen nach unten, der Δ-Balken bleibt
  im Zeichenbereich.
- **Kategorie-Brücke:** Bei rein negativen Summen kollabierten alle
  Balken zu unsichtbaren Slivern. Jetzt erscheint — wie bei der
  integrierten Brücke — ein klarer Hinweis (neuer String in DE/EN/ES/JA).
- **Matrix + Top N:** Top N rankte in Tabellen mit Spaltengruppen
  einzelne Zellen statt Zeilen — verwürfelte Spalten, namenloser
  Rest-Block, irreführende Σ. In der Matrix ist Top N jetzt deaktiviert.
- **Zeilenformate:** Das Power-BI-Muster „#,0" (Ganzzahl mit
  Tausendertrennung) wurde als eine Dezimalstelle gelesen —
  128.400 erschien als „128.400,0". Die Dezimal-Erkennung folgt jetzt
  der PBI-Konvention (Punkt als Dezimaltrenner; „0,0" bleibt möglich).
- **Einheiten-Mix:** Zeilen mit eigenem Zeilenformat (z. B. Stück)
  zählten weiter für die Einheiten-Wahl der €-Spalten — die Tabelle
  sprang auf K€, während Δ bei T€ blieb. Formatierte Zeilen sind jetzt
  aus der gemeinsamen Formatter-Domäne ausgenommen.
- **Δ%-Pin:** Skip-Zeilen mit sehr großem Δ% schossen mit Pin und
  Label über den Spaltenrand hinaus — die Pin-Länge ist jetzt auf die
  Spalten-Halbbreite begrenzt.
- **Finance-Format vollständig:** Klammern-Notation gilt jetzt auch
  für Margen-Prozente und Pp-Deltas in Tabelle und GuV sowie für
  Wert- und Δ-Zellen mit eigenem Zeilenformat — eine einheitliche
  Negativ-Notation pro Bericht statt drei.
- **GuV · Gebietsschema:** Die Margen-Prozente der GuV waren auf
  de-DE festgenagelt; sie folgen jetzt wie alle anderen Formatter der
  Berichtssprache (host.locale).
- **Beschriftungsdichte „Enden":** Die Varianz-Panels (ΔBasis und
  ΔBasis %) markierten Min/Max der Basiswerte statt der eigenen
  Abweichungen — die größte Abweichung blieb unbeschriftet. Jedes
  Panel labelt jetzt seine eigenen Extrema.
- **Matrix · Δ-Icons:** Die Option „Δ-Richtungs-Icons" wirkte nur in
  der flachen Tabelle. Die Matrix zeigt die ▲/▼/●-Icons jetzt in allen
  Δ-Blöcken, im Σ-Block und in der Σ-Gesamtzeile.

## 1.34.2.0 (2026-07-19)

**Bugfix-Paket 1 aus dem Juli-Audit — Zahlen-Korrektheit:**

- **Matrix + Laufsumme:** Bei Tabellen mit Spaltengruppen (Matrix) war
  die Laufsummen-Option aktiv und kumulierte über die flache Liste aus
  Kategorie × Spaltengruppe — dadurch flossen fremde Spaltenwerte in
  die Zellen ein. Die Laufsumme ist in der Matrix jetzt deaktiviert
  (wie bereits bei GuV-Zeilentypen), die Zellen zeigen wieder die
  echten Werte.
- **Σ-Zeile · Mini-Δ-Balken:** Die Δ-Balken der Σ-Gesamtzeile wurden
  mit der Skala der Einzelzeilen gezeichnet. Da die Summe fast immer
  größer ist als jede Einzelzeile, liefen die Balken über ihre Spalte
  hinaus in den Nachbarblock. Die Σ-Deltas gehen jetzt mit in die
  Balken-Skala ein, zusätzlich ist die Balkenlänge hart auf die
  Spaltenbreite begrenzt.

## 1.34.1.0 (2026-07-15)

**Tabelle/Matrix: feste Zeilenhöhe wie die native Matrix.** Bei wenigen
Zeilen in einem hohen Visual wuchsen Zeilen und Balken bisher mit, bis
sie die Fläche füllten. Jetzt ist die Zeilenhöhe wie im GuV-Statement
an die Schriftgröße gekoppelt (max. 2,4 × Kategorien-Schrift) — der
Inhalt bleibt kompakt oben, der Rest der Fläche bleibt frei, exakt wie
bei der Power-BI-Matrix. Dichte Tabellen (Scrolling, Σ-Freeze) sind
unverändert; größer werden die Zeilen weiterhin über das
Schrift-Preset bzw. den Skalierungs-Faktor.

## 1.34.0.0 (2026-07-15)

**Ease-of-Use-Paket (Controlling/Finance):**

- **Finance-Format** (Beschriftungen): negative Werte in Klammern statt
  Minus — (1.234) —, Null als „–". Wirkt zentral auf alle Wert- und
  Δ-Beschriftungen inklusive Δ % (Klammern statt Minuszeichen), in allen
  Modi inkl. Tabelle, Karten und Brücken.
- **Beschriftungs-Dichte** (Beschriftungen): „Automatisch" (bisheriges
  Ausdünnen), „Alle" (jeder Punkt) oder „Anfang · Ende · Extrema" (nur
  erster/letzter Wert plus Minimum und Maximum).
- **Trend-Icons ▲▼●** (Analyse): Richtungspfeile vor den Δ-Werten in
  Tabelle (ΔBasis und Δ2) und KPI-Karten; ● markiert unwesentliche
  Abweichungen unter der Materialitätsschwelle. Lesbar im
  Schwarzweiß-Druck und für Farbenblinde — Farbe bewertet weiter
  gut/schlecht, die Δ-Spalten bekommen automatisch mehr Breite.

Ideation-Backlog aktualisiert (Smart-Start, Drillthrough, Report-Page-
Tooltips, Design-Presets/fx, Measure-Umschalter, Zeitintelligenz ohne
DAX, Persona-Vorlagen → BACKLOG.md).

## 1.33.0.0 (2026-07-15)

**Δ%-Pin-Form einstellbar:** Neues Setting **„Δ%-Pin-Form"** (Gruppe
Analyse) mit drei Optionen: **Automatisch** (Standard — behält den
bisherigen Stil je Modus: Säulen/Balken/Wasserfall rund, integrierte
Brücke/Kategorie-Brücke/Tabellen-Zeilengrafik quadratisch), **Rund**
und **Quadratisch** — letztere vereinheitlichen die Lollipop-Köpfe
über alle Modi hinweg. Schraffur (FC), Hohl-Darstellung und
Kontrastmodus bleiben in beiden Formen erhalten.

## 1.32.0.0 (2026-07-15)

**Small Multiples: gemeinsame Skala auch für Brücken (opt-in):** Neues
Setting **„Brücken: gleiche Skala für alle Kacheln"** (Gruppe Small
Multiples). Säulen, Balken und Wasserfall teilen sich in Small Multiples
schon immer eine Skala (IBCS) — die **integrierte Brücke** und die
**Kategorie-Brücke** skalierten dagegen jede Kachel für sich. Mit dem
Toggle nutzen jetzt auch diese beiden Modi ein gemeinsames Maximum über
alle Kacheln, einschließlich der Δ- und Δ%-Pin-Skalen. Standard bleibt
aus (bisheriges Verhalten unverändert).

## 1.31.1.0 (2026-07-15)

**Startseite reagiert sofort:** Klicks auf den Schriften-Selector und
auf die Modus-Vorschauen rendern die Startseite jetzt **sofort lokal**
neu (optimistisch, mit Echo-Guard) statt auf den Persist-Roundtrip von
Power BI zu warten — die gewählte Pill ist ohne Verzögerung teal, die
Überschrift wechselt im selben Moment.

**Ganze Seite als Vorschau:** Nicht mehr nur die Überschrift — auch
Kachel-Titel, Beschreibungs- und Felder-Zeilen, Hero-Texte und die
Selector-Pills skalieren mit dem gewählten Preset (sanft auf ×1,4
gekappt, damit die Kacheln nicht überlaufen). Man sieht damit überall
direkt, was man eingestellt hat.

## 1.31.0.0 (2026-07-15)

**Freier Schrift-Faktor:** Neues Setting **„Alle Beschriftungen
skalieren %"** (Beschriftungen-Karte, 50–300 %, Standard 100) — wirkt
zusätzlich zum Größen-Preset auf ALLE Schriften im Visual
(effektiv = Preset × Faktor).

**Schriften-Selector auf der Startseite:** Unter der Galerie sitzt jetzt
ein Pill-Selector **Aa · Kompakt / Full HD / Präsentation** (ab
380×260 px, nur interaktiv). Ein Klick persistiert das Größen-Preset —
und die „ChartKitchen byDatenWG"-Überschrift der Startseite skaliert
sofort mit (Titel bis 40 px, Untertitel bis 24 px gekappt), als
Live-Vorschau der Wahl. Die Kopfzeile positioniert sich bei allen
Galerie-Stufen jetzt anhand der tatsächlichen Schriftgrößen, sodass
auch große Presets nicht mit der Galerie kollidieren.

## 1.30.6.0 (2026-07-13)

**Bessere Mini-Vorschauen:** Die Startseiten-Piktogramme für
**Kategorie-Brücke** (Totalzeilen + wandernde Kaskade mit Konnektoren),
**Tabelle (IBCS)** (AC/PY-Doppelbalken, Δ-Achse, Δ%-Pins, Σ-Zeile) und
**GuV-Statement** (Label-Spalte, Anker-Linien, Kaskaden-Treppe) sind neu
gezeichnet und dem echten Modus-Look deutlich näher.

## 1.30.5.0 (2026-07-13)

**Startseite: gestufte Layouts statt Überlappungs-Chaos:** Die Galerie
wählt jetzt je nach Platz eine von drei Stufen — (1) **Hero**: ein
einzelnes Vorschau-Chart mit festem Seitenverhältnis (sieht bei jeder
Größe gleich aus), ‹ ›-Pfeile blättern durch die Modi, Name/Einsatz/
Felder erscheinen darunter, sobald die Höhe reicht; (2) **Kompakt-
Raster** mit Kacheln + Beschriftung; (3) die volle **Listen-Galerie**
mit Texten. Jede Stufe rendert nur, wenn ihre Mindestgrößen wirklich
passen — das Überlappen kleiner Visuals ist damit behoben.

## 1.30.4.0 (2026-07-13)

**Wordmark wieder entfernt:** Das mit 1.30.3.0 eingeführte DATEN-WG-
Wordmark auf der Startseite ist nach Review wieder raus (Look passte
nicht). Startseite entspricht wieder 1.30.2.0; „made by Daten-WG"
bleibt.

## 1.30.2.0 (2026-07-13)

**Startseite: stabile Skalierung:** Die Galerie-Einträge haben jetzt
eine Maximalgröße (410 × 102 px) — zieht man das Visual auf die ganze
Seite, blähen sich die Kacheln nicht mehr auf, sondern der Block behält
seine Proportionen und zentriert sich; Titel und Untertitel wandern mit
über den Block. Auf großen Flächen sind zudem alle Beschreibungs- und
Feld-Texte voll ausgeschrieben (kein Abschneiden mehr).

## 1.30.1.0 (2026-07-13)

**Startseiten-Galerie als Liste:** Statt großer Kacheln jetzt kompakte
Einträge — kleine Vorschau links, daneben Modus-Name (größer, Full-HD-
lesbar), ein Satz „wofür geeignet" und die Feld-Empfehlung („Felder:
Kategorie, AC, PY/PL …"). Aktiver Modus mit ✓ und Teal-Rahmen; Tooltip
zeigt den vollen Text. Bei schmalen/niedrigen Visuals kompakter Kachel-
Fallback ohne Textblock. 25 neue Sprach-Keys in de/en/es/ja.

## 1.30.0.0 (2026-07-13)

**Startseiten-Galerie:** Der leere Zustand (noch keine Felder gebunden)
zeigt statt eines einzelnen Demo-Charts jetzt eine **Modus-Galerie** —
zwölf Mini-Vorschauen (Säulen, Balken, Linie, Wasserfall, beide Brücken,
Tabelle, GuV, KPI-Karten, Pareto, Dumbbell, Slope) in den Markenfarben.
**Klick auf eine Kachel wählt den Chart-Modus** (persistiert) — der
gewählte Modus ist mit Teal-Rahmen und ✓ markiert und startet direkt,
sobald Felder gebunden werden. Unten: „made by Daten-WG“. Bei sehr
kleinen Kacheln kompakter Fallback (Titel + Hinweis). Der Feld-Hinweis
(z. B. „Actual fehlt“) bleibt als Untertitel sichtbar.

## 1.29.0.0 (2026-07-13)

**Barrierefreie Standard-Farbe:** „Gute Abweichung" ist jetzt standardmäßig
das DatenWG-Teal **#1E8F9E** statt klassischem Grün (#61A544). Durch den
Blauanteil bleibt gut/schlecht auch bei Rot-Grün-Schwäche (Deuteranopie,
häufigste Form) klar unterscheidbar — unter Simulation werden Grün und
Rot fast identisch, Teal und Rot nicht. Gleichzeitig trägt der Default
die Markenfarbe. Wie alle Farben über die IBCS-Farben-Karte
übersteuerbar; „Theme-Farben verwenden" bleibt unverändert.

## 1.28.1.0 (2026-07-13)

**AppSource-Vorbereitung:** Support- und GitHub-URL auf das offene Repo
(DevCustomVizPowerBI) gesetzt, Publisher „Daten-WG". Submission-Kit unter
`appsource/`: Listing-Copy (EN), Privacy-Statement, Einreichungs-
Checkliste, 300×300-Listing-Icon und vier Listing-Screenshots. Keine
funktionalen Änderungen am Visual.

## 1.28.0.0 (2026-07-13)

**Neue Visual-Identität:** Interner Name und GUID auf
`chartKitchenByDatenWG…` umgestellt, damit die `.pbiviz`-Datei den
Markennamen trägt. **Achtung:** Für Power BI ist das ein neues Visual —
Berichte mit der alten Version müssen das Visual einmal neu hinzufügen.
Keine funktionalen Änderungen.

## 1.27.0.0 (2026-07-13)

**Rebranding:** Das Visual heißt jetzt **ChartKitchen byDatenWG** — „IBCS"
ist nur noch beschreibender Zusatz („inspired by IBCS"), nicht mehr Teil
des Markennamens (rechtlich sauberer, da IBCS® eine eingetragene Marke
ist). Interne ID und GUID bleiben stabil — bestehende Berichte brechen
nicht. Zusätzlich alle Verweise auf Wettbewerber-Marken aus Code-
Kommentaren, README und Changelog entfernt (generische Begriffe).
Keine funktionalen Änderungen.

## 1.26.0.0 (2026-07-13)

**KPI-Karten — Sortier-Ausbau + In-Chart-Chip:**
- **Zwei neue Sortiermodi:** „Schlechteste zuerst" und „Beste zuerst" —
  richtungsbewusst (invertierte KPIs wie Kosten werden korrekt als
  schlecht behandelt), sodass Probleme bzw. Erfolge oben-links landen.
  Zusammen mit „Größte Abweichung" (Betrag) und „Datenreihenfolge".
- **In-Chart-Sortier-Chip** (oben rechts, nur interaktiv): ein Klick
  schaltet Datenreihenfolge → |Δ| → Schlecht → Gut durch, ohne ins
  Formatmenü zu müssen — wie die Sortier-Buttons in den Brücken. Der
  Chip überschreibt die Pane-Auswahl, ist persistiert und bookmarkfähig.
- Der Sortierschlüssel folgt weiterhin automatisch der Status-Basis
  (Benchmark bzw. ΔPL/ΔPY, je nachdem was gebunden ist).
Render-Fall c80; neue Keys in de/en/es/ja.

## 1.25.2.0 (2026-07-13)

**KPI-Karten — Fokus-Sortierung:** Neue Option „Nach Abweichung
sortieren": ordnet die Karten nach der farbrelevanten Abweichung
(Benchmark bzw. ΔPL/ΔPY, je nach Status-Basis) — größte Abweichung
oben-links, für maximalen Fokus. Relative Abweichung führt (vergleichbar
über gemischte KPIs), absolute bricht Gleichstände; Karten ohne Status
landen hinten. „Datenreihenfolge" lässt alles wie im Modell.
Render-Fall c79; neue Keys in de/en/es/ja.

## 1.25.1.0 (2026-07-13)

**KPI-Karten — zwei Optionen (Kundenwunsch):**
- **Highlight-Status** (Auswahl): „Gut & schlecht“ (Ampel, wie bisher),
  „Nur schlechte“ (Problem-Monitoring — Positives bleibt neutral grau)
  oder „Nur gute“ (Erfolgs-Board). Gilt für Streifen, Hintergrund-Tönung,
  Δ-Zeilen und Mini-Brücke.
- **Mini-Brücke zeigen (AC/PY-Balken)** (Schalter, Standard an): aus
  ergibt reine Zahlen-Karten (großer Wert + Δ-Zeilen) — ruhiger für
  dichte KPI-Wände.
Render-Fall c78; neue Keys in de/en/es/ja.

## 1.25.0.0 (2026-07-13)

**Großes Tabellen-/Matrix-Paket:**
- **Matrix-Vollausbau:** Die Matrix beherrscht jetzt die **Zeilen-
  Hierarchie** (▸/▾ pro Ast, Einrückung, Expand-All), die **Header-
  Sortierung** auf dem Σ-Block (AC · ΔBasis · Δ %) und **Formelzeilen**
  (werden pro Spaltenblock UND für den Σ-Block ausgewertet) — gleichwertig
  zur flachen Tabelle.
- **Mini-Δ-Balken je Block:** kleiner farbiger Abweichungsbalken pro
  Spaltenblock (null-verankert), degradiert bei Platznot sauber weg.
- **Δ vs. Vorspalte (matrixCompare):** ersetzt das ΔBasis je Block durch
  die Veränderung zur vorherigen Spalte (Periodenvergleich Q2 vs. Q1 …).
- **Davon-Zeilen (indentList):** rückt Zeilen als „davon:“-Positionen ein
  und stellt sie dezent dar — ohne Hierarchie-Feld, auch per Klick im
  Struktur-Modus.
- **Zahlenformat pro Zeile (rowFormats):** „Marge = 0.0 %; Menge = #,0“ —
  gemischte €-/%-/Stück-Zeilen in einer Tabelle. Formatierte Zeilen sind
  eine eigene Einheit und zeichnen daher keine €-Balken auf der geteilten
  Skala (Δ erscheint in derselben Einheit).
- **Live-Suche (🔍):** Filter-Feld im Namens-Header (nur interaktiv);
  klappt Treffer in zugeklappten Ästen automatisch auf, Σ bleibt voll,
  „keine Treffer“-Hinweis statt leerer Tabelle.
- **Spaltenbreite der Namensspalte per Drag** (persistiert).
Render-Fälle c75–c77; neue Keys in de/en/es/ja.

## 1.24.0.0 (2026-07-12)

**Zeilen ausblenden + Grafik pro Zeile (Tabelle):**
- **„Zeilen ausblenden“ (hideList):** blendet einzelne Zeilen rein
  visuell aus — Σ-Zeile, Skalen und Formeln rechnen weiter mit ihnen
  (anders als „Aus Summen ausnehmen“). In der Hierarchie verschwindet
  der ganze Teilbaum, im Matrix-Modus die Zeile; die Σ-treue Rundung
  pausiert bei aktiven Ausblendungen (die Identität wäre sonst
  gebrochen).
- **„Grafik nur für diese Zeilen“ (chartList):** Wenn befüllt, zeigen
  nur die gelisteten Zeilen die Balken-/Pin-Grafiken — alle anderen
  bleiben reine Zahlenzeilen (Δ % als Zahl statt Pin). Die Σ-Zeile
  behält ihre Grafik immer.
- Beide Listen sind auch per **Klick im Struktur-Modus** setzbar (das
  Menü hat jetzt fünf Checkboxen) und in allen 4 Sprachen beschriftet.
Render-Fall c74.

## 1.23.0.0 (2026-07-12)

**Matrix-Spaltenhierarchie in der Tabelle:** Neue Feld-Rolle
**„Spalten (Matrix)“** (max. 2 Ebenen, z. B. Quartal → Monat) pivotiert
die Tabelle in Spaltengruppen — mit klappbarer Spalten-Hierarchie wie in
der Power-BI-Matrix:
- Zugeklappt zeigt jede Level-1-Gruppe eine aggregierte Σ-Spalte;
  ▸/▾-Klick im Header öffnet die Unterspalten (persistiert/bookmarkfähig).
- Jeder Block zeigt AC + gefärbtes ΔBasis; rechts ein fester **Σ-Block**
  (Zeilensumme, Δ, Δ %). Σ-Zeile, Skip-/Ergebnis-/Margen-Zeilen und
  vertikales Scrolling funktionieren wie in der flachen Tabelle.
- Breiten-Logik: erst entfällt das Δ je Block, dann schrumpfen die
  Spalten, dann werden Blöcke rechts gekappt („… +n“-Hinweis).
- In allen anderen Diagramm-Modi werden die Spalten-Duplikate
  automatisch zur Kategorie aggregiert (kein kaputtes Chart bei
  Moduswechsel).
- Noch nicht im Matrix-Modus: Zeilen-Hierarchie, Header-Sortierung,
  Formelzeilen (bewusst v1 — auf Zuruf).
Render-Fälle c72/c73; Key Role_ColGroup in de/en/es/ja.

## 1.22.1.0 (2026-07-12)

**Bullet-Zoom:** Schalter „Bullet: Zoom auf Zielbereich“ — das Bullet
spreizt die Skala auf den Bereich um AC und Benchmark statt bei Null zu
starten; KPIs nahe am Ziel (97 vs. 99) werden unterscheidbar. Der
Achsenbruch (Doppel-Schrägstrich) am linken Balkenende kennzeichnet die
gekappte Skala. Key Cards_BulletZoom in de/en/es/ja.

## 1.22.0.0 (2026-07-12)

**Bullet-Chart auf den KPI-Karten:** Neuer Schalter „Bullet vs.
Benchmark“ (KPI-Karten-Gruppe): kleines Bullet-Diagramm — AC-Balken auf
hellem Band, Benchmark als Tick, Null-verankert, FC schraffiert. Sitzt
im Stapel-Layout unter der Zahl bzw. den Δ-Zeilen, im flachen Layout
rechts neben den Δ-Zeilen. Braucht die Benchmark-Rolle; Key Cards_Bullet
in de/en/es/ja.

## 1.21.0.0 (2026-07-12)

**KPI-Karten für Monitoring (Kundenwunsch):** Neue Formatgruppe
„KPI-Karten“ (nur im Cards-Modus sichtbar):
- **Status-Basis wählbar** — Streifen und Ampel bewerten wahlweise gegen
  die Abweichungsbasis (ΔPL/ΔPY, wie bisher) oder gegen die gebundene
  **Benchmark-Measure** (Zielwert/Schwelle) — AC vs. BM.
- **Hintergrund-Ampel** — optional färbt sich die ganze Karte dezent
  grün (besser) oder rot (schlechter); neutral (unter der Wesentlichkeit
  oder Δ=0) bleibt bewusst ohne Farbe. Intensität einstellbar (4–40 %,
  Standard 12). Im Hochkontrast-Modus deaktiviert.
- **ΔBM-Referenzzeile** auf den Karten, sobald Benchmark gebunden ist;
  im Benchmark-Status-Modus führt sie die Δ-Zeilen an.
- Die **Invert-Liste** wirkt dabei pro KPI (Kosten/Ausschuss/Verbrauch:
  weniger = grün), die **Wesentlichkeits-Schwellen** sind jetzt auch
  sichtbar, wenn nur AC + BM gebunden sind (Monitoring ohne PY/PL).
Render-Fälle c70/c71.

## 1.20.0.0 (2026-07-12)

**Filter-Fußzeile:** Optionale zweite Fußzeile mit dem Filterkontext
(IBCS-Titel → „Filter-Fußzeile anzeigen“). Sie kombiniert zwei Quellen:
die neue Feld-Rolle **Filter-Info** — eine Text-Measure, die den
Report-Filterkontext liefert (z. B. via CONCATENATEX/SELECTEDVALUE;
Report-/Seitenfilter sind für Custom Visuals nicht per API sichtbar) —
und den Anzeige-Zustand des Visuals selbst (YTD, Top-N, In-Chart-
Sortierung, Σ-Ausschlüsse, aktiver Vergleich). Die Datenstand-Fußzeile
bleibt unverändert die unterste Zeile. Neue Keys Role_FilterInfo /
Title_FilterFooter / Foot_Filter in de/en/es/ja; Render-Fall c69.

## 1.19.2.0 (2026-07-12)

**Zertifizierungs-Vorarbeiten:** apiVersion auf 5.11.0 angehoben (Paket
und pbiviz.json jetzt synchron), npm audit auf 0 Findings (uuid-Override
für den dev-only webpack-dev-server-Pfad der Build-Tools). Keine
funktionalen Änderungen.

## 1.19.1.0 (2026-07-12)

**Daten-WG-Icon:** Das Visual trägt jetzt das DWG-Kochmützen-Logo
(Balken-Chart in der Mütze, Teal/Gelb) als Icon in der
Visualisierungs-Galerie. Quelle als SVG unter assets/icon-source.svg.

## 1.19.0.0 (2026-07-12)

**Tabelle 2.0 — Welle 3 (Hierarchie, Scrolling, Formelzeilen):**
- **Echte Mehr-Ebenen-Hierarchie:** Die Tabelle baut aus allen
  Kategorie-Spalten einen richtigen Baum — jeder Zweig (Region → Land →
  Produkt …) bekommt sein eigenes ▸/▾-Chevron und rückt pro Ebene ein.
  Zweige lassen sich unabhängig auf-/zuklappen, das ▸▸-Chevron im
  Header öffnet/schließt jetzt auch verschachtelte Ebenen. Gespeicherte
  Aufklapp-Zustände von 2-Ebenen-Tabellen bleiben gültig.
- **Vertikales Scrolling mit Freeze:** Passen die Zeilen nicht in die
  Kachel, scrollt der Tabellenkörper per Mausrad, Scrollbar-Ziehen oder
  Pfeil-/Bild-Tasten — Spalten-Header und Σ-Zeile bleiben stehen. Im
  Export/Druck (keine Interaktionen) bleibt das bisherige Abschneiden
  mit Hinweis, damit sich im gerenderten Bericht nichts bewegt.
- **Formelzeilen (light)** (Chart → Tabelle → Formelzeilen):
  „EBIT = Umsatz - Kosten" ergänzt eine berechnete Summenzeile,
  „Marge = EBIT / Umsatz" eine %-Zeile mit Pp-Abweichungen. Operanden
  sind Zeilennamen (Operatoren mit Leerzeichen umgeben); Formeln dürfen
  frühere Formelzeilen referenzieren und fließen nie in die Σ-Zeile
  oder die Σ-treue Rundung ein.
- **Härtung aus der adversarialen Prüf-Runde:** Zweig-Aggregate folgen
  jetzt der Σ-Basisregel (keine Doppelzählung von sum-/result-Zeilen,
  keine pct-/skip-Beimischung); Formel-Lookup und Balken-Skalen nutzen
  den vollen Baum, damit Auf-/Zuklappen weder Formelwerte noch Skalen
  verändert; strikte null-Semantik in Formeln (fehlendes Szenario eines
  Operanden → Szenario null statt implizit 0); FP-Kante beseitigt, bei
  der eine Scrollbar erschien, obwohl alle Zeilen exakt passten.
- Neue Sprach-Keys Table_FormulaRows/Table_Scroll (de/en/es/ja),
  Render-Fälle c66–c68.

## 1.18.1.0 (2026-07-12)

**Szenario-Versatz vereinheitlicht (User-Feedback):** In Columns und
Bars liegt die PL-Umriss-Säule jetzt leicht versetzt HINTER der
AC-Säule statt exakt darauf — derselbe Look wie in der Tabelle und den
Brücken-Minisäulen. Bei drei Szenarien ohne PY-Dreieck entsteht das
Sandwich PY → PL → AC; mit Dreieck rückt PL auf die hintere Position.
Alle anderen Modi hatten den Versatz bereits bzw. nutzen getrennte
Spalten/Anker.

## 1.18.0.0 (2026-07-12)

**Tabelle 2.0 — Welle 2 (die Kern-Tabellenfeatures):**
- **Numerische Wertspalten** (Chart → Tabelle → Werte-Spalten): PY- und
  PL-Zahlen (oder die gewählte Varianzbasis) beziffert neben AC — für
  druck- und boardtaugliche Tabellen ohne Balken-Interpretation.
- **Ein-Klick-GuV** (Chart → Tabelle → Zeilen-Struktur bearbeiten):
  Im Struktur-Modus (⚙-Chip) öffnet ein Klick auf eine Zeile das Menü
  „Invertieren · Ergebniszeile · Aus Summen ausnehmen". Ergebniszeilen
  werden fett mit Anker-Linie formatiert und wirken auch im
  GuV-Wasserfall als Anker; Skip-Zeilen bleiben sichtbar (kursiv,
  dezent), fließen aber nicht in Σ, Skalen und Kaskade ein. Alles wird
  in editierbaren Listen persistiert — ohne Datenmodell-Änderung,
  weiterhin kompatibel zur Waterfall-Typ-Rolle.
- **Klick-Sortierung auf Spaltenköpfe**: Klick auf AC, ΔBasis, ΔBasis %
  oder ΔBasis2 sortiert ab-/aufsteigend (▼/▲-Marker), dritter Klick
  stellt die Datenreihenfolge wieder her. Persistiert und
  bookmarkfähig; sortiert segmentweise zwischen Zwischensummen
  (GuV-Blöcke bleiben intakt), in Hierarchien Eltern nach Aggregat und
  Kinder innerhalb; bei aktiver Kumulierung deaktiviert.

**14 Härtungs-Fixes aus der adversarialen Prüfung (2 Agenten) vor dem
Release**, u. a.: Persist-Race-Guard für die Struktur-Listen;
Hierarchie-Parent-Klick respektiert den Struktur-Modus; Kommanamen
können die Listen nicht mehr korrumpieren (Menü sperrt + Hinweis);
Skip-Zeilen fliegen auch aus den deck-weiten Sync-Domains;
Ein-Klick-GuV sperrt die Kumulierung wie rowType-Daten; Σ-treue
Rundung und Σ-Zeile konsistent mit Result/Skip; Anker-Eltern bleiben
beim Hierarchie-Sortieren stehen; Null-Werte sortieren stabil ans
Ende; feste Wertspalten laufen auf schmalen Kacheln nicht mehr über;
Struktur-Menü schließt bei Außenklick und Datenwechsel.

## 1.17.0.0 (2026-07-12)

**Tabelle 2.0 — Welle 1 (Richtung IBCS-Tabellenklasse):**
- **Σ-Gesamtzeile ohne Vorarbeit**: „Summen-Kopfzeile (Σ)" wirkt jetzt
  auch im Table-Modus — die Tabelle summiert selbst (fett, unten
  fixiert, inkl. Σ-Varianzen). Automatisch unterdrückt, wenn die Daten
  eigene sum-Zeilen mitbringen oder Kumulierung aktiv ist.
- **Δ% verschwindet nie mehr**: Fällt die Pin-Spalte auf schmalen
  Kacheln weg, rückt eine bezifferte, farbige Δ%-Spalte nach. Die
  Zweitbasis bekommt erstmals eine eigene **Δ2-%-Zahlenspalte** (war
  bisher nur im Tooltip); der Δ2-Balken trägt jetzt FC-Schraffur,
  High-Contrast- und Wesentlichkeits-Notation wie der Primär-Balken.
- **Drill-Zustand persistent + „Alle auf-/zuklappen"**: Hierarchie-
  Expand überlebt Reload/Bookmarks (persistiert mit Race-Guard), Kacheln
  in Small Multiples klappen unabhängig, und ein ▸▸/▾▾-Chevron im
  Tabellenkopf öffnet/schließt alle Ebenen auf einmal.
- **Skalen-Sync**: Die Skala-Karte gilt jetzt auch für Tabellen —
  Balken- und Δ-Spalten teilen die deck-weiten Domains (fixedMax/
  fixedVarMax, Small-Multiples-Kacheln identisch skaliert).
- **Feinschliff**: Σ-treue Rundung wirkt in der Tabelle (Zeilen addieren
  sichtbar auf die Σ-Zeile), „vorläufig"-Schraffur auf dem AC-Balken,
  AC-Balkenspalte auch ohne Vergleichsbasis, Überlauf-Hinweis
  lokalisiert, „Beschriftungen anzeigen" wird respektiert.
- **Echte Textmessung**: Canvas-basierte Breitenmessung (mit Cache)
  ersetzt deck-weit die Zeichenzähl-Heuristik — lange deutsche
  Kontennamen werden exakt gekürzt statt zu früh/zu spät ellipsiert.

## 1.16.0.0 (2026-07-12)

**Drei Controller-Features:**
- **Perioden-Status „vorläufig"**: Forecast-Flag versteht jetzt `2` (oder
  „vorläufig"/„prelim") — die Säule bleibt Ist (solide), bekommt aber eine
  dünne Überlagerungs-Schraffur und einen Status-Eintrag im Tooltip.
  Vorläufige Monate zählen als AC (Summen, YTD, AC|FC-Trennlinie).
- **Σ-treue Rundung** (Datenbeschriftungen → Σ-treue Rundung): Labels
  werden per Restwertverfahren so gerundet, dass sie exakt auf die
  Σ-Kopfzeile aufaddieren. Aus (Standard): exakte Einzelrundung, dafür
  erscheint bei Differenz automatisch ein Rundungshinweis unter der Σ-Zeile.
- **Export-Modus**: In PDF-/PowerPoint-Exporten und Abo-Mails
  (`allowInteractions = false`) verschwinden alle In-Chart-Buttons und
  Chips automatisch — der Export zeigt das nackte Chart.

**14 Fixes aus der adversarialen Verifikations-Runde (4 Prüf-Agenten):**
- GuV-Statement: AC-Sicht zeigte Forecast-only-Zeilen als solide
  Ist-Balken; Kaskaden-Segmente kollidierten bei doppelten
  Positionsnamen (jetzt index-basiert); Wesentlichkeit wurde an der
  falschen (comparisonMode-)Varianz gemessen statt an der angezeigten;
  Sicht-Wahl konnte durch ein stales Update zurückspringen
  (Persist-Guard); Einklappen wirkte über alle Small-Multiples-Kacheln
  (jetzt pane-bezogen); Δ-Balken/Pins kippten bei sehr schmalen Spalten
  auf die falsche Achsseite; AC&FC-Split kollabierte bei
  Vorzeichenwechsel (jetzt betragsbasiert).
- Zeitintelligenz: Kumulierung ist bei GuV-Zeilen (sum/delta/pct)
  gesperrt (Prozente/Anker wurden mitkumuliert); Top N wird bei aktiver
  Kumulierung ausgesetzt (wertsortierte „Laufsummen"); Quartals-Labels
  (Q1–Q4) werden jetzt für YTD-/QTD-Resets erkannt.
- Brücken/Basis: Kategorie-Brücke rechnet ihre Kaskade jetzt lokal gegen
  die eigene PY/PL-Referenz (bei fcrev-Basis rekonzilierte sie nicht auf
  AC); ΔFC-Vm-Referenzachse hat eine eigene gestrichelte Doppellinie
  statt der PL-Notation; Zweitbasis-Achse nutzt die echte basis2-Logik;
  Margen-%-Zeilen fliegen aus allen Modi raus, die sie nicht darstellen
  können (verzerrten Skalen/Σ in Columns/Cards/Pareto); die automatische
  SAY-Botschaft respektiert jetzt „Invertieren je Kategorie".

**In-Chart-Texte lokalisiert:** Tooltips, Hinweis-Meldungen, Button-
Tooltips, Chips, Kommentar-Editor, Treiber-Notiz, „Rest"/„Σ Gesamt" und
Panel-Titel laufen jetzt über die Sprachdateien (DE/EN/ES/JA, je 149
Schlüssel) — vorher hart deutsch/englisch gemischt.

## 1.15.2.0 (2026-07-10)

**Lokalisierungs-Fix — Sprachen greifen jetzt wirklich:**
- 1.15.1.0 nutzte das Legacy-Ressourcen-Format (einzelne JSON-Dateien im
  pbiviz.json-Array), das Power BI Desktop nicht mehr auflöst — Japanisch
  & Co. blieben deshalb im englischen Fallback. Jetzt das offizielle
  Format: `stringResources/<locale>/resources.resjson` je Sprache
  (de-DE, en-US, es-ES, ja-JP, je 105 Schlüssel).
- **Dropdown-Labels**: Die Funktions-Form von `IEnumMember.displayName`
  wird an der Sandbox-Grenze verworfen (Items werden zum Host
  serialisiert). Die Labels werden jetzt einmalig im Konstruktor über
  `localizationManager.getDisplayName()` aufgelöst; englische Literale
  bleiben als Fallback für nicht übersetzte Sprachen.

## 1.15.1.0 (2026-07-10)

**Vollständige Lokalisierung: Englisch, Spanisch, Japanisch:**
- Bisher gab es nur eine saubere Sprache (Deutsch); der Rest war ein
  zufälliger Mix aus englischen Code-Fallbacks und durchrutschenden
  deutschen Enum-Labels. Jetzt vier vollständige, konsistente
  Sprachdateien (je 105 Schlüssel): `de-DE`, `en-US`, `es-ES`, `ja-JP`.
- **Auch die Dropdown-Werte sind jetzt lokalisiert** (Ausrichtung,
  Abweichungsbasis, Kumulierungs-Art, Einheiten, Größen-Preset) — nicht
  nur die Feld-/Property-Labels. Nutzt dafür `IEnumMember.displayName`
  als Funktion (`(resourceProvider) => resourceProvider.get(key)`),
  aufgelöst vom Power-BI-Host anhand der Berichtssprache.
- Formatmenü folgt jetzt vollständig der Power-BI-/Berichtssprache;
  ohne passende Sprachdatei fällt Power BI auf die Code-Fallbacks
  zurück wie bisher.

## 1.15.0.0 (2026-07-10)

**Neuer Modus: GuV-Statement (IBCS):**
- Zeilen-basiertes P&L-Statement nach der interaktiven IBCS-Referenz:
  je GuV-Zeile eine **PY-Kaskaden-Spalte** und eine **Szenario-Spalte**
  (Wasserfall-Positionierung — Kosten wandern nach links), daneben
  **ΔPY-Varianzbalken** und **ΔPY%-Pins** (gedeckelt bei 100 %, Ausreißer
  mit ▸▸) an durchgehenden grauen Referenzachsen.
- **Szenario-Sichten im Chart**: AC (solid) · AC&FC (Split: AC solid +
  FC-Rest schraffiert, Varianzen schraffiert) · PL (Umriss, Varianzen
  umrandet). Buttons erscheinen **nur für gebundene Szenarien** und die
  Wahl wird persistiert (bookmarkfähig); FC ist der Rest-Jahres-Anteil.
- **Ebenen aus sum/delta**: Delta-Blöcke klappen hinter dem Chevron
  ihrer Zwischensumme zu; Buttons „1" (nur Zwischensummen) / „2" (alles).
  `pct`-Zeilen (Margen) bleiben Text: Wert in %, Δ in Prozentpunkten.
- Zwischensummen fett mit IBCS-Doppellinien, abgeleitete +/−/=-Präfixe,
  Crossfilter je Zeile. Ein-/ausschaltbar über „Buttons im Chart".

## 1.14.2.0 (2026-07-10)

**Integrierte Brücke: PL-Notation & zwei Totalsäulen:**
- **Versetzte PL-Minisäulen**: Ist PL die Vergleichsbasis, erscheinen die
  Monats-Basissäulen als weiße Umriss-Säulen (IBCS-PL-Notation) leicht
  versetzt hinter der AC-/FC-Säule — statt grau und überdeckt.
- **Zwei Totalsäulen links** (wie die PL/PY-Summenzeilen der
  Kategorie-Brücke): Sind PY und PL beide gebunden, stehen links beide
  Jahres-Totale — außen das Zweitszenario (PY grau bzw. PL Umriss),
  innen die Basis, an der die Kaskade startet.
- **PY-Dreieck auch bei PL-Basis**: Bei AC + PY + PL (Schalter „PY als
  Dreieck") markiert das graue Dreieck das Vorjahr an den Minisäulen
  zusätzlich zur PL-Umriss-Säule; Wertlabels weichen dem Dreieck aus.

## 1.14.1.0 (2026-07-10)

**PY-Dreiecke in den Brücken + Treiber-Notiz abschaltbar:**
- **Kategorie-Brücke**: Sind AC, PY und PL gebunden, zeigt jede
  Kategorie-Zeile das Vorjahr als graues Dreieck (▼) über dem Balken
  statt als grauen Hintergrund-Balken — gleiche IBCS-Notation wie in
  den Säulen-/Balken-Modi. Schalter: Layout → „PY als Dreieck".
- **Integrierte Brücke (Zeit)**: Die Monats-Minisäulen zeigen PY als
  Dreieck (▶) neben der AC-/FC-Säule; hier zählt auch AC + FC + PY
  als Drei-Szenarien-Fall (der Basis-Vergleich der Brücke ist PY).
- **Treiber-Notiz schaltbar** (Brücken-Optionen → Treiber-Notiz im
  Chart): die kursive Notiz „größter Treiber · n % …" in der
  Kategorie-Brücke lässt sich jetzt ausblenden (Standard: an).

## 1.14.0.0 (2026-07-10)

**Zeitintelligenz & GuV-Paket:**
- **Kumulierungs-Arten**: Neben YTD jetzt **QTD** (Reset an jedem
  Quartalsstart) und **R12** (rollierende 12 Perioden) — Auswahl unter
  Analyse → Kumulierungs-Art, sichtbar sobald „Kumuliert" an ist.
- **Fiskaljahr**: „Fiskaljahr beginnt im Monat" (1–12) verschiebt die
  YTD-/QTD-Resets (z. B. 4 für ein Geschäftsjahr ab April). Die
  Monats-Erkennung liest die Kategorie-Labels (Jan…Dez, MM); ohne
  erkennbare Monate läuft YTD durch und QTD nutzt 3er-Blöcke.
  Der In-Chart-Button und die Panel-Titel zeigen die gewählte Art.
- **Margen-%-Zeilen in der GuV** (Waterfall-Typ-Spalte = „pct"):
  Tabellen-Zeilen wie „Marge %" zeigen den Wert als Prozent und die
  Abweichungen als **Prozentpunkte** (+0,1Pp), ohne €-Balken/-Pins —
  die €-Skalen der übrigen Zeilen bleiben unverfälscht. Im
  Waterfall-Modus fließen pct-Zeilen nicht in die Kaskade ein.


## 1.13.0.0 (2026-07-10)

**Controller-Paket — drei Kernwünsche aus der Review:**
- **Datenstand-Fußzeile** (IBCS-Titel → Fußzeile): freier Text unten
  links, z. B. „Ist per Jun 2026 · Stand 05.07. · Quelle: SAP FI" —
  das Chart reserviert den Platz automatisch.
- **Invertieren je Kategorie** (Analyse → Invertieren je Kategorie):
  kommagetrennte Liste von Kategorien mit umgekehrter Wertung — die
  Kosten-Zeile neben der Umsatz-Zeile wird endlich richtig gefärbt
  (KPI-Karten, GuV-Tabelle, alle Chart-Modi; wirkt auf Farben,
  Streifen, Schraffur-Auswahl und Wesentlichkeit gleichermaßen).
  Intern: zentrales isGood(v, punkt) statt verstreuter invert-Ternaries.
- **FC-Revision als Abweichungsbasis**: neues Feld „FC Vormonat
  (Revision)" + Basis-Option „FC Vormonat" — Panels zeigen ΔFC Vm
  (absolut + %): was hat sich seit dem letzten Forecast-Zyklus
  verschoben? Ist-Monate laufen auf 0 zu, FC-Monate zeigen die echte
  Revision. Titel/Σ-Header/Tooltips ziehen mit; in der KPI-Karten-
  Brücke erscheint der FC-Vm-Anker schraffiert. YTD und Aggregate
  (Σ/Rest/Tabelle) rechnen auf der neuen Basis korrekt.


## 1.12.6.0 (2026-07-10)

**Feinschliff-Paket (Review-Kleinfunde + UX-Schnellgewinne):**
- fcFlag-Spalte wertet "false"/"nein"/"no"/Leerstring nicht mehr als
  Forecast (robustes Text-Parsing).
- **Sichtbarer Modus-Chip**: Solange Kommentar- oder Vergleichs-Modus
  aktiv ist, zeigt eine dunkle Pille oben rechts den Zustand
  („✎ Kommentar-Modus" / „⇄ Vergleich (n/2)") — inkl. Erklär-Tooltip;
  im Kommentar-Modus wird der Cursor zum Text-Cursor.
- Kommentar-Editor schließt jetzt auch bei Klick ins Leere.
- Hover-Tooltips (<title>) an allen In-Chart-Buttons (ΔPY/ΔPL, ⇅, ▶,
  YTD, Kachel-Zoom).
- Tooltip erklärt das Wesentlichkeits-Grau („unter Schwelle").
- Formatbereich: Brücke-Gruppe nur noch in Brücken-fähigen Modi,
  sortByImpact nur wenn wirksam, groupEvery-Gate; Karten-Titel
  „Skala & Referenzlinie", präzisere Preset-Beschreibung.


## 1.12.5.0 (2026-07-10)

**Bugfix-Release Teil 3 — die 13 nachverifizierten Review-Funde:**

- **Kein Geister-Rendering mehr**: Wird die Datenbindung entfernt,
  verwirft das Visual den letzten Datensatz — ein Klick im
  Vergleichs-Modus konnte sonst entfernte Daten zurückrendern.
- **Vergleich per Klick in Small Multiples deaktiviert**: Die Anker
  waren über Kacheln hinweg mehrdeutig (gleiche Kategorien je Kachel).
- **Kommentar-Editor an Tabellen-Eltern-Zeilen**: Das Auf-/Zuklappen
  schluckte den Editor sofort wieder — im Kommentar-Modus hat der
  Editor jetzt Vorrang vor dem Hierarchie-Toggle.
- **Kommentar-Speicherung race-sicher**: Ein zwischenzeitliches Update
  mit altem Metadaten-Stand kann frisch gespeicherte Kommentare nicht
  mehr verwerfen (persistierter Stand wird bis zum Host-Echo gehalten).
- **Benchmark auch in der Tabelle**: BM-Tick in der AC·PY·PL-Balkenzelle;
  die BM-Tooltip-Zeile erscheint nur noch in Modi, die den Marker
  auch zeichnen (Columns, Bars, Line, Tabelle).
- **Kommentar-Marker in Pareto und Dumbbell** (①②③ am Datenpunkt) —
  bisher gab es dort nur die Fußnoten-Liste.
- **KPI-Karten an die Schriftregler gekoppelt**: Textgröße
  (Datenbeschriftungen) skaliert Wert/Δ-Zeilen, Kategorienachsen-Größe
  den Kartentitel — bisher waren beide Regler im Karten-Modus tot.
- **Formatbereich ohne tote Schalter**: Top N zeigt sich jetzt überall,
  wo es wirkt (Bars, Brücke, Tabelle, Dumbbell, Karten); Vergleich per
  Klick nur in Columns/Bars; Σ-Kopfzeile nur in Columns/Bars/Line;
  die Skalen-Karte (Sync/Referenzlinie) nur in Modi, die sie umsetzen
  (Columns/Bars/Line, Referenzlinie auch Waterfall).


## 1.12.4.0 (2026-07-10)

**Bugfix-Release Teil 2 — restliche bestätigte Review-Funde (7–13):**

- **Wesentlichkeit greift jetzt überall**: Dumbbell-Verbinder,
  Slope-Linien, die Monats-Pins und Kaskaden-Segmente der Integrierten
  Brücke sowie Zeilen-Pins und Kaskaden-Bricks der Kategorie-Brücke
  werden unterhalb der Schwellen grau. Gesamt-/Überleitungs-Pins
  bleiben bewusst farbig (wie die Σ-Kopfzeile).
- **Brücken-Kaskade zählt einseitige Punkte**: Kategorien mit AC aber
  ohne Basis (Neugeschäft) bzw. Basis ohne AC (weggefallen) erzeugen
  jetzt eine eigene Kaskadenstufe (Δ = Wert bzw. −Basis) — der
  AC/FC-Endanker stimmt wieder mit der echten Summe überein, die
  FC-Schraffur geht nicht mehr verloren.
- **Integrierte Brücke bei negativen Werten**: statt kaputter
  SVG-Rechtecke erscheint ein klarer Hinweis („unterstützt keine
  negativen Werte — bitte Waterfall oder Columns + Brücke nutzen").
- **BM-Tick durchstreicht keine Labels mehr**: Der Wertelabel-Anker
  berücksichtigt jetzt auch den Benchmark-Marker.
- **Referenzlinie hinter den Marks**: Die gestrichelte Ziellinie läuft
  nicht mehr durch die Wertelabels.
- **„ΔPL %"-Titel-Kollision behoben**: Kollidiert das erste Pin-Label
  mit dem Panel-Titel (kleine Kacheln, positiver erster Wert), weicht
  es automatisch unter den Pin-Kopf aus — in den Rel-Panels (auch
  Doppel-Varianz) und den Wasserfall-Varianz-Stufen. Testfälle c45
  (negative IntWf) ergänzt; c37/c1 dienen als Regressions-Referenz.


## 1.12.3.0 (2026-07-10)

**Bugfix-Release — sechs bestätigte Funde aus der Multi-Agenten-Review,
alle adversarial verifiziert:**

- **Δ2 in Aggregaten korrigiert**: Die Zweitbasis von „Rest"-Zeilen
  (Top N), „Σ Gesamt"/„Rest"-Kacheln und Tabellen-Hierarchie-Eltern
  wird jetzt direkt aus den summierten PY/PL-Werten gebildet statt aus
  var2Abs rekonstruiert — Punkte ohne AC/FC (z. B. eingestellte
  Produkte) zählten vorher im ΔPL, aber nicht im ΔPY.
- **YTD nur noch in Zeit-Modi**: „Kumuliert" wirkt auf Columns, Line
  und Tabelle — Pareto (Reihenfolge drehte sich um), Wasserfälle,
  Brücken, Dumbbell/Slope/Karten und der Stacked-Modus (kumulierte
  über Serien-Grenzen!) werden nicht mehr still kumuliert; die Option
  ist in anderen Modi ausgeblendet.
- **Gemeinsame Skala für Pareto/Dumbbell/Slope in Small Multiples**:
  Diese Renderer skalierten pro Kachel neu — mit Σ-Gesamt-/Hero-Kachel
  ein Widerspruch zur IBCS-Regel. Jetzt teilen alle Kacheln die
  gemeinsame Domain (Testfall c44).
- **ΔBasis-Beschriftung stabil**: Explizit gewählte Plan-Basis zeigte
  „ΔPY", wenn beim ersten Datenpunkt zufällig PL = PY war — die Basis
  wird jetzt aus parseData durchgereicht statt per Wertvergleich
  rekonstruiert.
- **Gesamt-%-Pin bei negativer Basissumme**: Integrierte und
  Kategorie-Brücke teilen jetzt durch |Basis| — Vorzeichen und
  Ampelfarbe des Total-Pins kippten sonst bei negativen Summen.
- **Wesentlichkeit misst Δ2 an Δ2**: Das Zweitbasis-Panel (Charts,
  Tabelle, KPI-Karten) wird jetzt an var2Abs/var2Rel gemessen statt an
  der Erstbasis-Varianz.


## 1.12.2.0 (2026-07-10)

**KPI-Karten: flaches Layout + Einheiten je Karte:**
- **Breite, niedrige Kacheln nutzen den Leerraum**: Ist die Karte flach
  (z. B. KPI-Streifen oben auf der Seite), rutschen die Δ-Zeilen
  (ΔPL/ΔPY absolut + %) neben den großen Wert statt darunter — und wenn
  rechts noch Platz ist, kommt auch die Mini-Brücke daneben. Nichts
  wird mehr stillschweigend abgeschnitten.
- **Auto-Einheiten skalieren pro Karte**: KPI-Kacheln mischen oft
  Größenordnungen (Umsatz in Mio. neben Stückzahlen) — der Wert und die
  Δ-Angaben jeder Karte bekommen jetzt ihre eigene k/M/B-Skalierung
  statt der gemeinsamen des ganzen Visuals (0,1M€ → 128,0K).


## 1.12.1.0 (2026-07-10)

- **KPI-Karten: Indikator-Streifen** — wie im Card-Visual zeigt jede
  Kachel links einen 4-px-Statusstreifen in der Abweichungsfarbe der
  primären Basis (grün/rot nach Wirkung inkl. Invert; grau ohne Basis,
  bei Δ = 0 oder unterhalb der Wesentlichkeits-Schwellen).
- **Crossfilter per Karten-Klick verifiziert**: Klick auf eine Karte
  filtert andere Visuals der Seite (Selection-API, Strg-Klick für
  Mehrfachauswahl, Klick ins Leere hebt auf) — per echtem Klick-Test
  im Harness abgesichert. Im Kommentar-Modus öffnet der Klick weiterhin
  den Editor statt zu filtern.


## 1.12.0.0 (2026-07-10)

**KPI-Karten (Kacheln) — das KPI-Card-Visual als Chart-Modus im Deck:**
- Neuer Eintrag im Ausrichtungs-Dropdown: **„KPI-Karten (Kacheln)"** —
  eine Kachel je Kategorie mit großem Wert (Auto-Einheiten k/M/B,
  FC-Kennzeichnung), **Δ-Referenzzeilen** (ΔPL und ΔPY absolut + %,
  Farbe nach Wirkung inkl. Invert und Wesentlichkeits-Schwellen) und
  der **Mini-Brücke Basis → Δ → AC** in IBCS-Notation: PL-Umriss bzw.
  PY-grau als Anker, schwebendes Δ in gut/schlecht, AC solide
  (FC schraffiert), Referenzachse je Basis (PL-Doppellinie / PY-grau).
- Platz-Stufen: kleine Kacheln lassen die Brücke weg, sehr kleine die
  zweite Referenzzeile — Grid passt Spalten an die Breite an.
- Alles Bestehende greift auch hier: Crossfilter + Tooltips je Karte,
  Kommentar-Marker (inkl. Kommentar-Erfassung per Klick), Hervorhebung,
  Schrift-Presets, High-Contrast, YTD und Small Multiples (Karten je
  Gruppe in Kacheln).
- Keine neuen Felder nötig — Category + AC reichen, PY/PL/FC ergänzen
  Referenzen und Brücke. Das separate ibcsKpiCard-Visual bleibt für
  Karten mit Sparkline/Trend-Feld weiter verfügbar.


## 1.11.1.0 (2026-07-10)

- **Automatische Botschaft (Treiber-Text) jetzt Standard aus.** Die
  Zeile „ΔPL … · stärkster Treiber: … · schwächster: …" unter dem
  IBCS-Titel erscheint nur noch, wenn sie im Menü eingeschaltet wird:
  **IBCS-Titel → Automatische Botschaft**. Eigene Botschafts-Texte
  (Feld „Botschafts-Zeile") erscheinen unabhängig davon weiterhin.


## 1.11.0.0 (2026-07-10)

**PY als Dreieck bei drei Szenarien (IBCS-Jahreschart-Notation):**
- Sind **AC, PY und PL** gleichzeitig gebunden, wird das Vorjahr nicht
  mehr als dritte graue Säule gezeichnet, sondern als **graues Dreieck**
  am Säulenrand auf PY-Höhe (Columns: ▶ links an der Säule, Bars/Tabelle:
  ▼ über dem Balken) — wie im IBCS-Jahreschart. AC und PL-Umriss
  bekommen die volle Slot-Breite zurück, das Tripel wirkt deutlich
  aufgeräumter.
- Gilt überall, wo alle drei Szenarien als Säulen/Balken erscheinen:
  **Columns, Bars (inkl. Kompakt-Modus) und Tabelle**. Linien-Modus
  behält die IBCS-Liniennotation, Brücken-Modi ihre Anker-Logik.
- Neue Option **„PY als Dreieck (bei AC + PY + PL)"** (Layout-Gruppe,
  Standard an, nur sichtbar wenn PY und PL gebunden sind) — ausschalten
  stellt die bisherige graue PY-Säule wieder her.
- Ist nur PY (ohne PL) gebunden, bleibt alles unverändert: PY-Säule wie
  bisher.

## 1.10.0.0 (2026-07-08)

**Drei Controller-Extras — alle einzeln zuschaltbar, Standard aus:**

- **Kommentare im Chart erfassen** (Karte „Kommentare"): Kommentar-Modus
  einschalten → Klick auf eine Kategorie öffnet ein Eingabefeld direkt
  im Chart. Gespeicherte Kommentare werden im Bericht persistiert
  (bookmark-fähig, wandern mit der PBIX), bekommen einen ✎-Marker mit
  Nummer, erscheinen im Tooltip und in der Kommentarliste — auch
  kombiniert mit Kommentaren aus dem Text-Measure. Löschen über
  denselben Editor; solange der Modus an ist, filtern Klicks nicht
  quer. Die Kommentare-Karte ist dafür jetzt immer sichtbar.
- **Wesentlichkeits-Schwellen** (Gruppe „Analyse"): „Wesentlichkeit ab
  (absolut)" und „ab (%)" — Abweichungen unterhalb der Schwellen werden
  grau statt rot/grün dargestellt (Panels inkl. Doppel-Varianz und
  Kompakt-Labels, Wasserfall-Varianz-Stufen und -Brücke, Tabelle).
  Sind beide Schwellen gesetzt, muss eine Abweichung beide
  überschreiten, um farbig zu sein — filtert absolutes und
  prozentuales Rauschen zugleich. Σ-Kopfzeile bleibt immer farbig.
- **YTD-Button im Chart** (Gruppe „Analyse", Columns/Line): klickbarer
  „YTD"-Chip oben rechts — der Enduser schaltet die kumulierte Sicht
  direkt im Bericht um, die Wahl wird persistiert (wie die
  Brücken-Buttons).

## 1.9.0.0 (2026-07-08)

**Zwei Ergänzungen nach Abgleich mit den offiziellen IBCS-Chart-Templates:**

- **Erste Kachel groß (IBCS CT 13)** — neue Option in der Gruppe „Small
  Multiples": die erste Kachel (z. B. „Σ Gesamt" oder die größte Gruppe)
  bekommt eine Zelle über die volle Höhe links, die übrigen Kacheln
  rücken als Raster daneben. Die gemeinsame Skala bleibt unangetastet —
  nur der Platz unterscheidet sich; die kleinen Kacheln fallen bei Bedarf
  automatisch in den Kompakt-Modus. Standard aus; unter 460 px Breite
  greift das normale Raster.
- **Varianz-Stufen am Wasserfall (IBCS CT 12)** — der Waterfall-Modus
  zeigt jetzt, wenn PY oder PL gebunden ist und die Abweichungs-Schalter
  an sind, ΔBasis-Balken und ΔBasis-%-Pins je Rechenzeile über der
  Brücke — mit korrekter Referenzachsen-Notation (PY = fette graue
  Linie, PL = Doppellinie) und Farbe nach Wirkung (Invert wird
  respektiert, FC schraffiert). In der Varianz-Brücke (Basis → AC), wo
  die Brücken-Balken selbst schon die absoluten Deltas sind, kommt nur
  die %-Stufe dazu. Ohne Vergleichs-Measure ändert sich nichts; bei
  wenig Höhe (< ~170 px) bleiben die Stufen aus.

## 1.8.0.0 (2026-07-08)

**Small-Multiples-Optionen: Top N Kacheln + Gesamt-Kachel (Σ)** — neue
Gruppe „Small Multiples" im Chart-Formatbereich, nur sichtbar wenn das
Multiples-Feld gefüllt ist; beide Optionen sind standardmäßig aus:
- **Top N Kacheln**: zeigt nur die N größten Gruppen (nach Summe |AC|,
  absteigend sortiert) — die übrigen werden zu einer Kachel
  **„Rest (k)"** aggregiert (Kategorien nach Label ausgerichtet, Werte
  summiert, Δ/Δ % auf den Summen neu gerechnet). 0 = alle Kacheln.
- **Gesamt-Kachel (Σ)**: stellt eine Kachel **„Σ Gesamt"** voran —
  Summe über *alle* ursprünglichen Gruppen (auch bei aktivem Top N).
  Die gemeinsame IBCS-Skala schließt die größere Gesamt-Kachel mit ein,
  Proportionen zwischen Kacheln bleiben damit ablesbar.
- Funktioniert in allen Kachel-Modi inkl. Gestapelt (Ausrichtung über
  Kategorie + Serie), Waterfall (sum/delta-Typ bleibt erhalten) und mit
  YTD/Top-N-Balken/Sortierung, die danach pro Kachel greifen. Zoom per
  Klick auf den Kachel-Titel funktioniert auch für Σ/Rest-Kacheln.
  Forecast-Schraffur in Σ/Rest nur, wenn die Periode in allen Gruppen
  Forecast ist.

## 1.7.0.0 (2026-07-08)

**Runde 1 — drei neue Chart-Modi ohne neue Felder** (Orientation-Dropdown,
reine Renderer auf vorhandenen AC/PY/PL-Daten):
- **Pareto (Struktur)**: AC-Säulen absteigend sortiert + kumulierte
  %-Linie mit Markern, 80 %-Referenzlinie und hervorgehobenem Marker an
  der Kategorie, die die 80 % reißt — funktioniert schon mit Category + AC.
- **Dumbbell (Struktur)**: Basis → AC je Kategorie als zwei Punkte
  (PY grau bzw. PL als Outline, AC dunkel) mit Verbinder in der
  Abweichungsfarbe; Top N + Rest wird unterstützt.
- **Slope · Vorher/Nachher**: Basis links, AC rechts, eine Linie je
  Kategorie in der Abweichungsfarbe (FC gestrichelt), Labels mit
  Anti-Überlappung auf beiden Seiten.

**Runde 2 — zwei feld-gesteuerte Alltags-Features** (kein Modus-Wechsel
nötig, leeres Feld = alles wie bisher):
- **Kombi Säulen + Linie**: neues optionales Measure-Feld „Line (Kombi)"
  (z. B. Marge %) — erscheint als Linie mit Punktmarkern über den Säulen,
  eigene nullbasierte Skala, eigener Formatstring, Name oben rechts,
  eigene Tooltip-Zeile. Nur Columns.
- **Gestapelt**: neues optionales Grouping-Feld „Stack Series" — Säulen
  oder Balken stapeln sich automatisch nach der Serie (AC je Serie),
  IBCS-Grauabstufung ab der AC-Farbe, Legende, Segment- und
  Summen-Labels, Crossfilter je Segment. Varianz-Panels/Brücke sind im
  Stapel-Modus bewusst aus.

## 1.6.0.0 (2026-07-08)

**Aufklappbare Hierarchie in der Tabelle (IBCS)**:
- Liegt im Category-Feld eine erweiterte Hierarchie (≥ 2 Ebenen, z. B.
  Region → Land über „Alle erweitern" im Drill-Menü), zeigt die Tabelle
  zunächst die Oberkategorien **aggregiert** mit ▸-Chevron. Klick auf die
  Zeile klappt die eingerückten Unterzeilen auf (▾), erneuter Klick wieder
  zu — Kennzahlen, Balken und Varianzen der Eltern-Zeile sind die Summen
  der Kinder, Δ % korrekt auf der summierten Basis gerechnet.
- Kinder-Zeilen behalten Crossfilter/Tooltips; die ganze Zeile ist
  Klickfläche (aria-expanded für Screenreader). Zustand ist transient.
- Ohne Hierarchie rendert die Tabelle unverändert flach — nichts ändert
  sich für einfache Nutzung.

## 1.5.1.0 (2026-07-08)

**Fix: Kachel-Zoom zuverlässig klickbar.** Zwei Ursachen behoben:
- Das ⤢-Icon war nur ~12 px groß und wurde vor dem Kachel-Inhalt gezeichnet —
  Chart-Elemente (Labels, Hit-Flächen) konnten darüber liegen und Klicks
  schlucken. Jetzt ist die **gesamte Titelzeile der Kachel** der Klick-Bereich
  (mit ⤢ rechts und Hover-Feedback) und wird nach dem Inhalt gezeichnet,
  liegt also garantiert obenauf.
- Gleiches Z-Order-Problem beim „← Alle Gruppen"-Chip in der Zoom-Ansicht:
  der Chip wird jetzt nach dem Chart gezeichnet.
- Verifiziert mit echten Maus-Klicks (statt synthetischer Events) im
  Headless-Browser: Klick mitten auf den Titel zoomt, Chip führt zurück.

## 1.5.0.0 (2026-07-08)

**Tabelle (IBCS)** (neuer Chart-Modus im Orientation-Dropdown):
- Eine Zeile je Kategorie mit Wert, AC·PY·PL-Balkenzelle (gemeinsame Skala,
  Nulllinie bei negativen Werten), ΔBasis als Zahl + Balken und ΔBasis % als
  Pin — Kennzahlen-Tabelle mit integrierten Chart-Spalten.
- 'sum'-Zeilen (Waterfall-Type-Rolle) rendern fett mit starker Trennlinie —
  GuV-Zwischensummen wie Bruttoergebnis/EBIT.
- Doppel-Varianz als zusätzliche ΔZweitbasis-Spalten, Highlight-Zeilen,
  Kommentar-Nummern, Crossfilter je Zeile, Tooltips.
- Grafikspalten fallen bei schmalen Visuals gestuft weg — die reine
  Werte-Tabelle bleibt lesbar; bei zu wenig Höhe erscheint ein Hinweis
  statt gequetschter Zeilen.

**Kachel-Zoom bei Small Multiples**:
- ⤢ oben rechts an jeder Kachel vergrößert die Gruppe auf die volle Fläche
  (mit unveränderten gemeinsamen Skalen — IBCS), „← Alle Gruppen" führt
  zurück. Funktioniert in allen Chart-Modi, transienter Zustand.

**Vergleich per Klick** (Chart → Analysis → Compare on click, Standard aus):
- Zwei Säulen/Balken anklicken zeigt die Differenz (absolut + %) als
  gestrichelte Klammer mit Δ-Label — zweiter minus erster Wert. Ein Klick
  wählt (gestrichelter Ring als Merker), Klick ins Leere setzt zurück.
  Solange der Modus aktiv ist, ersetzen die Klicks das Quer-Filtern.

## 1.4.0.0 (2026-07-07)

**Zwei neue Chart-Modi** (Orientation-Dropdown), portiert aus den
HTML-Referenz-Prototypen:
- **Integrierte Brücke (Zeit)**: PY/PL-Totalsäule links, ΔBasis-Wasserfall
  quer über die Monate mit Verbindungslinien, AC·PY-Monatssäulen am Fuß,
  ΔBasis%-Pin-Chart oben, AC|FC-Trennlinie, gestapelte AC+FC-Totalsäule
  rechts und Netto-Abweichung als eingekreistes Callout am rechten Rand.
- **Kategorie-Brücke (Struktur)**: PL- (Outline) und PY-Summenzeilen oben,
  je Kategorie AC·PY-Balken + kaskadierender ΔBasis-Brick + ΔBasis%-Pin,
  AC-Summenzeile, doppelte Überleitung unten (ΔBasis mit Callout-Badge +
  ΔZweitbasis), "größter Treiber"-Notiz an der stärksten Position,
  Gruppentrennlinien (Group separator every N), Top N + Rest und
  Sort by impact werden unterstützt.

**In-Chart-Buttons** (Chart → Bridge → In-chart buttons, Standard an,
nur in den beiden neuen Modi): ΔPY|ΔPL-Umschalter (persistiert
chart.comparisonMode — der Enduser wechselt die Varianz-Basis direkt im
Bericht), ⇅ Sortierung (Kategorie-Brücke) und ▶ Aufbau-Animation, die die
Positionen nacheinander einblendet.

**Schriftgrößen-Preset** (Data labels → Size preset): skaliert sämtliche
Schriften des Visuals auf einmal — Kompakt (×1), **Full HD (×1,5)** für
1080p-Berichte als neuer Standard-Anwendungsfall, Präsentation (×2) für
4K/Beamer. Wirkt auf Wertelabels, Kategorieachse, Panel-Titel, Σ-Header,
IBCS-Titelblock und Small-Multiples-Titel; die Textgrößen-Regler bleiben
als Feinjustierung erhalten.

## 1.3.0.0 (2026-07-07)

**Echte Anker-Balken in der Waterfall-Brücke** (Chart → Bridge), statt der bisherigen
Referenzlinien — matcht die IBCS-Referenzcharts genauer:
- Die Brücke bekommt ihr eigenes Raster (Kategorien + 2 zusätzliche Slots): ein
  Anker-Balken am Anfang zeigt die Basis-Summe (PL als Outline, PY als graue Fläche —
  je nach Abweichungsbasis) mit Wertlabel, ein Anker-Balken am Ende zeigt die
  AC-Summe (bzw. schraffiert AC/FC-Summe bei vorhandenem Forecast). Beide sind über
  Verbindungslinien in die Kaskade eingebunden, genau wie die einzelnen Bricks.
- Funktioniert unverändert in beiden Ausrichtungen (Columns/Bars), mit Sort by
  impact, Top-N + Rest und Small Multiples.

**Gruppen-Trennlinien** (Chart → Layout → Group separator every N, 0 = aus):
- Zeichnet eine dünne Trennlinie quer durch alle sichtbaren Panels (Basis-Chart,
  Brücke, Abweichungs-Panels) nach jeweils N Kategorien — eine Lesehilfe für
  Struktur-Vergleiche mit natürlichen Untergruppen (z. B. Regionen bei einer
  Länder-/Bundesstaaten-Liste), wie im Referenzchart mit den US-Bundesstaaten.

## 1.2.0.0 (2026-07-07)

**Waterfall bridge für Columns und Bars** (Chart → Bridge, optional, Standard aus):
- Zusätzliches Panel neben den normalen AC/PY/PL-Vergleichsbalken (die unverändert
  bleiben): zeigt dieselben Kategorien als kaskadierende Brücke von der Basis
  (PY/PL) zu AC, mit Verbindungslinien zwischen den Bricks — Absolutwerte,
  Überleitung und Abweichungen (ΔPY/ΔPL, ΔPY %/ΔPL %) sind gleichzeitig sichtbar.
  Funktioniert in beiden Ausrichtungen (Columns für Zeitreihen-Brücken,
  Bars für Struktur-Brücken) sowie in Small Multiples (blendet sich bei zu
  wenig Platz pro Kachel automatisch aus, wie das Dual-Variance-Panel).
- **Sort by impact**: sortiert die Kategorien nach Abweichungsgröße
  (größter Treiber zuerst); eine Top-N-Rest-Zeile bleibt am Ende gepinnt.
  Auch per Klick auf den ⇅-Button oben rechts im Chart umschaltbar — der
  Klick persistiert die Formatbereich-Einstellung, bleibt also über
  Neu-Renders, Lesezeichen und Berichts-Neuladen hinweg erhalten.
- Bridge-Panel-Wertelabels zeigen die Brick-eigene Delta-Änderung; die
  Panel-Skala verankert sich nicht künstlich bei null, sondern zeigt exakt
  die relevante Bandbreite der Kaskade.
- **Referenzlinien + Überleitungs-Callout**: Im Bridge-Panel markiert eine
  gestrichelte Linie in PY-Farbe die Basis-Summe (Start der Brücke) und eine
  durchgezogene Linie in AC-Farbe die AC-Summe (Ende der Brücke). Ein
  eingekreistes Badge zeigt den Netto-Saldo der gesamten Brücke (grün/rot
  je nach Geschäftswirkung) — die Überleitung als expliziter Callout, wie
  in den IBCS-Referenzcharts.

## 1.1.0.0 (2026-07-06)

Erste vollständige Version.

**Chart-Modi:** Columns (Zeit), Bars (Struktur), Line (lange Zeitreihen,
IBCS-Liniennotation), Waterfall/Brücke (GuV via sum/delta-Rolle,
Varianz-Brücke PL→AC, Beitrags-Wasserfall).

**IBCS-Bausteine:** Szenario-Notation (AC/PY/PL/FC inkl. Schraffur und
gestrichelter FC-Baseline), absolute + relative Varianz-Panels mit
Baseline-Notation je Basis, Doppel-Varianz (ΔPL + ΔPY), Titelblock mit
Auto-Message (SAY), Σ-Header, Hervorhebung, Ausreißer-Kappung,
Referenzlinie, gleitender Durchschnitt, Kumuliert (YTD), Small Multiples
mit gleicher Skala, Kommentar-Marker + export-feste Fußnotenspalte,
Top N + Rest, Label-Ausdünnung, Kompakt-Modus.

**Power-BI-Integration:** Measure-Formatstrings, Theme-Farben,
Drilldown/Drillthrough, Cross-Filtering, Kontextmenü, Tooltips +
Report-Page-Tooltips, Keyboard-Navigation, High-Contrast,
Multi-Visual-Selection, FC-Flag-Spalte (Chart-Builder-kompatibel),
Live-Demo-Landing, Formatbereich DE/EN.

**Qualität:** Render-Harness (`npm run test:render`, 16 Szenarien),
CI-Pipeline (Build + Lint + Render-Regression, Artefakte je Lauf),
Demo-Datensatz + Desktop-Testplan.
