# Changelog · ChartKitchen byDatenWG

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
