# Backlog · ChartKitchen byDatenWG

Ideen-Sammlung: bewusst **nicht** sofort gebaut, aber nicht vergessen.
Aufwand: S (< ½ Tag) · M (½–1 Tag) · L (mehrere Tage) · XL (Architektur).
Neue Ideen bitte als GitHub-Issue anlegen oder hier ergänzen.

## Abgrenzung: ChartKitchen ↔ P&L Statement byDatenWG

Mit **P&L Statement byDatenWG** (`../pnlByDatenWG/`, aktueller Stand auf Branch
`claude/visual-chartkitchen-git-link-rvi81z`) gibt es ein eigenständiges
Schwester-Visual für GuV-/P&L-Statements. Die Arbeitsteilung ist bewusst — es
ist keine Doppelung, sondern eine andere Problemklasse:

- **ChartKitchen = Breite.** Viele Diagrammtypen über beliebige Kategorien aus
  einer flachen Faktentabelle; die GuV-Modi (Waterfall, GuV-Statement, Tabelle)
  decken den schnellen Fall ab.
- **P&L Statement = Tiefe für genau ein Artefakt.** Kontenhierarchie aus einer
  Dimensionstabelle (Sternschema `L1..Ln` primär, Parent-Child alternativ),
  `RowType`/`FormulaDef` mit Formel-auf-Formel und Zirkelbezug-Erkennung,
  dreiteilige Vorzeichenlogik (`SignConvention` · `DisplayInvert` ·
  `VarianceInvert`), Rechenkern ohne Power-BI-Abhängigkeit isoliert getestet.
  Dort sind Reconciliation-Fehler Vertrauens-Killer, nicht Schönheitsfehler.

Der strukturelle Unterschied: ChartKitchen konfiguriert solche Sonderfälle über
**Listen im Formatbereich**, das P&L liest sie **datengetrieben aus der
Kontendimension**. Für Ad-hoc-Tabellen ist Ersteres richtig, für einen echten
Kontenrahmen Letzteres.

**Konsequenz für dieses Backlog:** Mehrere Punkte im Block „Fachliche
Korrektheit" sind im P&L bereits gelöst (unten markiert). Vor dem Bau hier bitte
prüfen: Braucht ChartKitchen wirklich eine Light-Version für Ad-hoc-Fälle — oder
gehört der Punkt ins P&L und kann hier entfallen? Sonst droht Parallelentwicklung
derselben Anforderung auf zwei Architektur-Ebenen.

## Beta-Feedback (extern) — Kandidaten für die nächste Version

### Alexander Korn (Juli 2026)

Erster externer End-to-End-Test: 4 Instanzen (Columns · Bars · Tabelle ·
KPI-Karten) auf einer Seite, Destatis-Hochschuldaten (~17,4 M Studierende,
2019–2024), Desktop **und** Service (PBIR + gebündeltes Visual via Fabric
REST API). Befund: rendert identisch, keine Konsolenfehler. Fünf Punkte:

- [x] **Bug: Rundungshinweis überlagert ΔPY-%-Spaltenkopf** (S) — erledigt in 1.39.0.0. — im
      Bars-Modus mit vielen Kategorien (17) kollidiert „Summe weicht
      rundungsbedingt ab" mit der Panel-Überschrift; Hinweis versetzen
      oder bei Platzmangel unter den Σ-Header ziehen (Screenshot ①).
- [x] **Schalter „Leerkategorie ausblenden"** (S) — erledigt in 1.39.0.0 (Chart → Layout, Standard aus). — `(blank)`-Kategorien
      erscheinen als eigene Zeile/Balken/KPI-Karte; Opt-out-Toggle
      (Standard: anzeigen, damit nichts still verschwindet) für alle Modi
      inkl. Karten (Screenshot ②).
- [x] **Tabelle: gemeinsame Nullachse für ΔPY-Balken und ΔPY-%-Pins** (S–M) — erledigt in 1.39.0.0 (geteilte Nullachsen-Position nach Neg-/Pos-Anteilen, inkl. Δ2). —
      die beiden Varianz-Grafikspalten nutzen unterschiedliche
      Nullachsen-Positionen, wirkt unruhig; Nulllinien vertikal alignen
      oder zumindest optisch koppeln (Screenshot ③).
- [x] **KPI-Karten: Sortieren-Button vom Panel-Rand lösen** (S) — erledigt in 1.39.0.0. — Chip
      klebt an der Kachelkante; Innenabstand analog zu den
      Brücken-Buttons.
- [ ] **Erstlade-Performance bei mehreren Instanzen im Service messen** (M) —
      4 Instanzen/Seite verlängern die Erstladung spürbar. Analyse:
      Data-Reduction-Fenster (top 1000) vs. Render-Zeit profilen
      (Performance Analyzer + `renderingFinished`-Telemetrie), dann
      entscheiden: Lazy-Render, kleinere Erst-Fetches oder Doku-Hinweis.

### Beta-Tester (Juli 2026, EN — Name nachtragen)

Gesamturteil „the tool is amazing", ein inhaltlicher Wunsch — und zwar ein
klassischer, den jedes Monatsreporting hat:

- [x] **AC und FC im selben Monat als Split-Säule** (M) — erledigt in 1.40.0.0 (Setting „AC + FC in the same period", Modi Vollmonatsprognose/Restmonat, Columns + Bars, Composite in Σ/Δ/Labels, Tooltip zeigt beide Anteile; Testfall c121). — Zitat: *„if on the
      category axis I've month, is there a way to manage data that can be
      either FC and AC in a certain month? It would be great if in the month
      that contains both FC and AC data, the chosen graph could represent
      both of them."* Der laufende Monat ist typischerweise halb geschlossen:
      AC bis Stichtag, FC für den Rest. **Heute:** entweder/oder — FC wird nur
      gezeigt, wenn AC fehlt.
      **Gewünscht:** eine Säule mit solidem AC-Sockel + schraffiertem
      FC-Aufsatz (IBCS-konform).
      *Teile davon existieren schon* — nicht neu erfinden, sondern
      übernehmen: die Integrierte Brücke hat die gestapelte AC+FC-Totalsäule,
      das GuV-Statement die Szenario-Sicht „AC&FC (Split schraffiert)", und
      das FC-Flag `2` („vorläufig") kann eine Säule solide + überlagert
      schraffiert zeichnen. Was fehlt, ist der **echte Split je Kategorie im
      Standard-Columns/Bars-Modus**.
      **Vor dem Bau zu klären** (der eigentliche Knackpunkt): Wenn AC und FC
      für denselben Monat geliefert werden — ist FC die *Vollmonatsprognose*
      (dann Säule = AC + max(0, FC − AC)) oder nur der *Restmonat* (dann
      Säule = AC + FC)? Braucht eine Konvention oder ein Setting; falsch
      geraten ergibt doppelt gezählte Monate. Mitzudenken: Δ rechnet gegen
      das Composite, das Label zeigt die Summe (Einzelteile im Tooltip), die
      AC|FC-Trennlinie liegt dann *innerhalb* einer Säule statt zwischen
      zweien, und YTD/kumuliert muss entscheiden, ob der FC-Anteil mitzählt.

## Barrierefreiheit

- [ ] **Schraffur-Redundanz für „schlecht"** (M) — optionaler Schalter:
      schlechte Varianzen zusätzlich schraffiert (Muster + Farbe = doppelter
      Kanal; hilft auch beim S/W-Druck). Stärkster nächster A11y-Schritt.
- [x] **Blau/Orange-Farbpreset** (S) — erledigt in 1.39.0.0 (Dropdown in IBCS colors).
- [x] **▲/▼-Symbole auf KPI-Karten** (S) — erledigt in 1.34.0.0 („Trend-Icons
      ▲▼●" in der Analyse-Gruppe, Tabelle + Karten).
- [ ] **Fokusverlust nach In-Chart-Rerender** (M) — Zoom/Aufklappen/Sort per
      Enter wirft Tastaturnutzer aus dem Visual; Fokus wiederherstellen.
- [ ] **ARIA-Semantik aufräumen** (M) — role=option ohne listbox, Chart-Label,
      Tab-Stop-Flut bei vielen Kategorien (Fund aus Ideation-Review).
- [x] **Grautöne auf WCAG-Kontrast anheben** (S) — erledigt in 1.39.0.0 (Textfarben; UI-Rahmen bewusst belassen, 3:1 genügt).

## Tabelle & Matrix

Konsolidiert aus 4 Ideation-Runden (Juli 2026) + Altbestand, dedupliziert.

### Bedienung & Layout

- [x] **Alle Spaltenbreiten per Drag + Auto-Fit** (M) — erledigt in 1.38.0.0
      (Wertspalte + Δ-Spalte der flachen Tabelle, einheitliche Blockbreite +
      Σ-Block der Matrix; persistierte Breiten-Map `tableColWidths`, Doppelklick
      = Auto-Fit auf den Inhalt; Persist-/Echo-/Drag-Schutz wie Namensspalte).
- [x] **Horizontales Scrollen statt „… +n"-Cut** (L) — erledigt in 1.36.0.0
      (Blockstreifen horizontal scrollbar mit fixierter Namensspalte und
      fixiertem Σ-Block; Shift-Wheel/Scrollbalken/Tastatur; Export behält den
      „… +n"-Cut).
- [x] **Aufklapp-Steuerung ±Alle / „bis Ebene N"** (S–M) — erledigt in 1.37.0.0
      (Zeilen-Doppelchevron auf/zu bestand bereits; neu: ⊞/⊟-Knopf für alle
      Matrix-Spaltengruppen. Ebenen-Regler bewusst ausgelassen).
- [x] **Zeilen-Layoutpaket** (S–M) — erledigt in 1.37.0.0 (Zebra-Streifen,
      Zeilenhöhe kompakt/normal/luftig, Gitterlinien horizontal/keine/beide).
- [x] **Zeilenumbruch für lange Positionsnamen** (S) — erledigt in 1.37.0.0
      (automatischer 2-Zeilen-Umbruch statt Truncate, Tabelle + Matrix).
- [x] **Hover-Highlight** (S) — erledigt in 1.37.0.0 (Zeile, Matrix zusätzlich
      Spalte/Block unterm Cursor; transient, hc-Modus als Rahmen).
- [ ] **Zeilen-Pinning** (S–M) — pinList: markierte Zeilen (EBIT, Cash) beim
      Scrollen fixiert über der Σ-Zeile halten.
- [x] **Zwei-Zeilen-Kompaktmodus** (M) — erledigt in 1.38.0.0 (Setting
      „Zellen-Layout (Matrix)": Wert groß, Δ/Δ % klein darunter in derselben
      Zelle; halbiert die Matrix-Breite. Minibalken entfällt, Referenzspalten
      bleiben eigene Spalten; Σ-Block gleich behandelt).
- [ ] **Teilbaum-Zoom mit Breadcrumb** (M) — ⤢ an Hierarchie-Zeile zeigt nur
      diesen Teilbaum, Breadcrumb „Gesamt › DACH › DE" zurück (Mechanik wie
      Small-Multiples-Zoom).
- [ ] **Matrix transponieren** (M) — Schalter Zeilen ↔ Spalten ohne Feld-Umbau.
- [ ] **Audit-/Abstimm-Modus** (S) — Preset: Zeilennummern, Vollgitter, keine
      Balken/Pins, Werte unverkürzt (WP-Abstimmung, Excel-Abgleich, Druck).
- [x] **Σ-Zeile wahlweise oben oder unten** (S) — erledigt in 1.37.0.0
      (Setting „Position der Σ-Zeile", oben/unten, beim Scrollen fixiert).
- [ ] **Zeilen-Reihenfolge per Drag** (L) — manuelles Umsortieren, persistiert;
      Verzahnung mit Sort/Hierarchie klären.
- [x] **Export-Ansicht „alles aufgeklappt"** (S) — erledigt in 1.39.0.0 (Chart → Table, Standard an; auch GuV-Statement).

### Spalten & Skalierung

- [ ] **Spalten-Baukasten** (M–L) — freie Auswahl + Reihenfolge der Spalten
      (AC, PY, PL, FC, Δ, Δ %, Δ-Balken, Grafik) statt fester Presets.
- [ ] **Szenario-Spalten je Matrix-Block** (L) — pro Periode wählbar: nur AC ·
      AC+Δ · AC+PY+Δ · +Δ % (Baukasten-Gedanke für die Matrix).
- [ ] **3. Spalten-Ebene + Gruppen-Zwischensummen** (L) — Jahr → Quartal →
      Monat, Σ-Spalte je aufgeklappter Gruppe.
- [ ] **Automatische YTD-/Σ-Spalte neben Monatsblöcken** (M) — kumulierte
      Spalte („YTD Jun") bzw. Jahres-Σ rechts der Perioden.
- [x] **Spalten-Labels umbenennen** (S) — erledigt in 1.39.0.0 (4 Textfelder in Data labels, wirkt auf Titel/Köpfe/Legenden/Tooltips).
- [ ] **ΔBM-Spalten** (S–M) — Benchmark als echte Wertspalten (ΔBM, ΔBM %)
      statt nur Strich-Marker im Balken.
- [ ] **Sparklines in der Zeile** (M) — Mini-Trendlinie pro Zeile (letzte N
      Perioden aus Matrix-Spalten oder eigener Perioden-Rolle).
- [ ] **Saisonalitäts-/Range-Spalte** (M) — min–max-Strich über die Perioden
      mit Punkt für den aktuellen Monat (Korridor-Check).
- [ ] **Kommentar-Spalte** (S–M) — Kommentartext sichtbar als eigene Spalte
      rechts (statt nur nummerierter Marker), mit Truncate/Umbruch.
- [ ] **Status-Rolle aus dem Modell** (M) — optionale Feld-Rolle: Measure
      liefert Text/Symbol je Zeile (eigene Ampel-Logik in DAX), Visual rendert
      als Spalte.

### Analytik

- [ ] **Abweichungs-Filter „nur Auffälligkeiten"** (S–M) — nur Zeilen über der
      Materialitätsschwelle zeigen, Rest als „Unauffällig (n)"-Sammelzeile;
      optional In-Chart-Chip ⚠ (Exception-Reporting).
- [ ] **Zielerreichungs-Spalte** (S–M) — AC/PL in % mit Mini-Balken und
      100 %-Marke (Bullet-Logik der Karten wiederverwenden).
- [ ] **Common-Size-/%-vom-Total-Spalte** (S) — Anteil je Zeile an Σ oder an
      einer Referenzzeile („Umsatz = 100 %"), GuV-Strukturanalyse.
- [ ] **Rang-Spalte mit Bewegung** (S) — #1–#n nach AC plus ↑2/↓1 vs. PY.
- [ ] **Varianz-Brücke als Spalte** (M) — Δ-Spalte als kumulierte Kaskade von
      oben nach unten; unten steht die Gesamtabweichung (Treiber-Sicht).
- [ ] **Mix-Shift-Spalte** (M) — Anteil am Total in % + Anteils-Änderung vs.
      PY in Prozentpunkten (Portfolio-Verschiebung).
- [ ] **Ausreißer-Radar** (M) — z-Score je Zeile über die Perioden; Zellen
      außerhalb ±2σ dezent umrahmt.
- [ ] **Heatmap-/Ampel-Zellen** (M) — Zellhintergrund nach Wert oder Δ
      (Zwei-Farb-Skala an Teal/Rot + Materialitätsschwellen gekoppelt).
- [ ] **Vorjahresmonat-Vergleich in der Matrix** (M) — „vs. Jan PY" statt
      „vs. Dez" (Vorspalte), sobald 13+ Perioden vorhanden.

### Fachliche Korrektheit

Abgleich mit dem P&L-Visual siehe Abschnitt „Abgrenzung" oben — `↔ P&L`
markiert Punkte, die dort bereits (oder besser) gelöst sind.

- [ ] **Σ-Aggregation Summe / Ø / letzter Wert** (M) — Bestandsgrößen
      (Headcount, Cash) dürfen nicht summiert werden; Wahl pro Zeile analog
      zur pct-Logik. *(in beiden Visuals offen — gemeinsame Lösung überlegen)*
- [ ] **Vorzeichen-Liste** (S) — signList: positiv gelieferte Kosten als
      Abzug anzeigen (−4.200), korrekt in Σ und Formeln.
      **↔ P&L:** dort als `SignConvention` + `DisplayInvert` + `VarianceInvert`
      aus der Kontendimension gelöst. Hier nur bauen, wenn Ad-hoc-Tabellen ohne
      Dimensionstabelle das wirklich brauchen.
- [ ] **Abschnitts-Überschriften & Leerzeilen** (S) — sectionList:
      Zwischenüberschriften ohne Werte + Trennlinien (GuV-Gliederung).
      **↔ P&L:** dort `RowType = Separator` — datengetrieben statt Liste.
- [ ] **Plausibilitäts-Wächter** (S–M) — Formelzeile vs. gleichnamige
      gelieferte Zeile vergleichen, Differenzen mit ⚠ markieren (fängt
      kaputte Measures). **↔ P&L:** teilweise — dort Zirkelbezug-Erkennung und
      Fehleranzeige an der Zeile; der Abgleich Formel vs. geliefert fehlt noch
      in beiden.
- [ ] **FC-Zeilen-Liste** (S) — fcList: Zeilen als Forecast/vorläufig
      markieren → Schraffur + kursiv wie die FC-Notation der Charts.
      *(im P&L ist FC ein Szenario-Slot, keine Zeilen-Markierung — anderer
      Anwendungsfall, hier eigenständig sinnvoll)*
- [x] **Formelzeilen: Feedback bei Fehler** (S) — erledigt in 1.39.0.0 („Label = ?"-Zeile in Tabelle und Matrix).
      **↔ P&L:** dort bereits gelöst (Fehleranzeige an der Zeile) — Muster von
      dort übernehmen statt neu erfinden.

### Interaktion & Integration

- [ ] **Zell-Crossfilter in der Matrix** (M–L) — Klick auf Zelle filtert die
      Seite auf Kategorie × Periode (SelectionIds je Zelle); größter
      „verhält sich wie Power BI"-Gewinn.
- [ ] **Zellen-Kommentare in der Matrix** (M–L) — Kommentar-Modus auf
      Zellebene (Zeile × Monat) mit Marker ¹ + Fußnote.
- [ ] **Review-Häkchen** (M) — Zeilen im Meeting abhaken (✓/⚑), persistiert
      wie Kommentare; offene Punkte bleiben sichtbar.

### Technik

- [ ] **fetchMoreData für große Matrizen** (L) — Segmente > 30k Zeilen
      nachladen + Hinweis „n von m geladen" statt stillem Abschneiden.
- [ ] **Vertikales Scrolling im Export** (—/Doku) — bewusst deaktiviert;
      dokumentieren statt bauen.

## KPI-Karten

- [ ] **Schwellen-Bänder im Bullet** (M) — Ampelzonen (z. B. rot < 95 %,
      gelb 95–100 %, neutral darüber) als Hintergrundbänder; Grenzen per
      Setting oder Measures.
- [ ] **Karten-Layout-Presets** (M) — kompakt/Standard/groß erzwingen statt
      nur auto (flat vs. stacked).

## Charts & Brücken

- [ ] **Best-/Worst-Case-Korridor am Forecast-Ende** (M) — Bandbreite um FC.
- [ ] **Index-Darstellung (PY = 100)** (M) — Zusatzmodus für Zeitreihen.
- [ ] **Skalierungsbänder / Scale Bands** (M) — bei bewusst abweichenden
      Skalen (IBCS CH-Regelgruppe).
- [ ] **Automatische Ausreißer-Kennzeichnung** (M) — statt nur manuellem Cap.
- [ ] **Highlight (EMPHASIZE) in allen Modi** (M) — greift bisher nicht in
      Pareto, Waterfall, IntWf, CatBridge, Stacked.
- [ ] **refLine / fixedMax in allen Modi** (M–L) — wirken bisher nur in
      columns/bars/line; überall respektieren oder Pane-Optionen ausblenden.
- [ ] **YTD-Reset bei Wochen-Labels** (S) — Kumulierung erkennt Jahreswechsel
      bei KW-Achsen nicht (dokumentierter Altfund).
- [ ] **Kombi-Linie: Legendenname + deklarierte zweite Skala** (S).

## Kommentare & Zusammenarbeit

- [ ] **Kommentar-Metadaten** (M) — Autor, Zeitstempel, Status offen/erledigt.
- [ ] **Kommentar-Marker in allen Modi** (M) — fehlen in mehreren Modi,
      obwohl das Fußnoten-Panel nummeriert.

## Lokalisierung & Format

- [ ] **descriptionKeys für alle Beschreibungstexte** (M) — ~30 Descriptions
      sind hart deutsch; über resjson in alle 4 Sprachen (Formatbereich wird
      dann vollständig einsprachig).
- [ ] **Weitere Sprachen** (S je Sprache) — FR, IT als nächste Kandidaten.
- [ ] **Zahlenformat-Ausbau** (M) — Dezimalen für abs/rel getrennt,
      Basispunkte, Modell-Formatstrings übernehmen.

## Interaktion & Technik

- [ ] **Touch-/Mobile-Support** (M) — Pointer-Events statt reiner Maus-Events
      (Scroll-Thumb, Drag, Chips).
- [ ] **Interaction-Settings-Karte** (M) — In-Chart-Buttons/Chips einzeln
      an-/abschaltbar für Report-Autoren.
- [ ] **Viewer-Layout-Umschalter** (M) — Chart-Slider-Äquivalent: Betrachter
      wechselt zwischen Modi ohne Formatbereich.
- [ ] **Highlight-Data-API unterstützen** (M) — von pbiviz empfohlen; Voraus-
      setzung für sauberes Crossfilter-Highlighting (auch fürs Listing schön).
- [ ] **Adversariale Prüf-Runde 1.25+** (M) — die letzten großen Pakete
      (Matrix-Vollausbau, Formel-pro-Zelle) sind nur selbst-verifiziert;
      volle Agenten-Runde nachholen, sobald Kapazität da ist.

## Ease of Use (Ideation Juli 2026 — Auswahl 5/6/9 gebaut in 1.34.0.0)

- [ ] **Smart-Start: Modus-Vorschlag nach Feldern** (S) — nach dem Binden
      erkennt das Visual die Feld-Konstellation und schlägt per Klick den
      passenden Modus vor („Datum + AC + PL → Säulen mit ΔPL?").
- [ ] **Drillthrough & Rechtsklick-Kontextmenü** (M) — natives Power-BI-
      Kontextmenü (selectionManager.showContextMenu) auf Balken, Brücken-
      Segmenten und Tabellenzeilen; größtes „verhält sich nicht wie
      Power BI"-Loch.
- [ ] **Report-Page-Tooltips + reicher Standard-Tooltip** (M) — Hover zeigt
      alle Szenarien (AC/PY/PL/FC + Δ + Δ%); Unterstützung für
      Berichtsseiten-Tooltips (canvas tooltips).
- [ ] **Design-Presets + fx-Farben** (M) — Stil-Dropdown (IBCS klassisch /
      Corporate hell / Dark / Kompakt) setzt Farben+Schriften+Labels als
      Paket; gut/schlecht-Farben per bedingter Formatierung (fx) aus dem
      Modell steuerbar.
- [ ] **Measure-Umschalter-Chip** (M) — mehrere Kennzahlen im AC-Feld, im
      Chart per Chip durchschaltbar (Field Parameters light), persistiert
      und bookmarkfähig.
- [ ] **Zeitintelligenz ohne DAX** (L) — Datumsfeld + AC reicht: Visual
      berechnet PY/Vormonat/YTD selbst („PY automatisch"). Größter
      Ease-of-Use-Hebel, strategische Abgrenzung zu marktüblichen Matrix-Visuals.
- [ ] **Persona-Vorlagen mit Share-Code** (M) — Ein-Klick-Pakete
      („Monats-Reporting", „Forecast-Review", „GuV-Analyse",
      „Kosten-Monitoring") + Einstellungen als Code exportieren/importieren
      (wie im CO₂-Simulator), damit Teams ihre Hauskonfiguration teilen.

## Builder-UX (Ideation Juli 2026 — für den Report-Ersteller)

Ergänzend zahlen aus „Ease of Use" auch Smart-Start, Design-Presets und
Persona-Vorlagen/Share-Code auf die Builder-UX ein.

- [ ] **Diagnose-Leiste im Bearbeitungsmodus** (S–M) — Chip-Zeile nur im
      Edit-Modus: gebundene Rollen (AC ✓ · PY ✓ · PL —), Modus, aktive
      Sonderoptionen + Warnungen („Basis=PL, aber PL nicht gebunden");
      im Lesemodus unsichtbar.
- [ ] **Feldrollen-Tooltips** (S) — description je Datenrolle in den
      capabilities („Plan/Budget → Rahmen-Notation, Basis für ΔPL"),
      erscheint beim Hover im Feld-Bereich.
- [ ] **Struktur-Editor als Übersicht** (M) — Overlay mit allen Zeilen als
      Matrix (Σ/Formel/Skip/Hide/Grafik/Einrücken/Invertieren),
      Mehrfachauswahl per Shift-Klick statt Zeile-für-Zeile-Menü.
- [ ] **Formel-Editor mit Autocomplete** (M) — Zeilennamen-Vorschläge beim
      Tippen + Live-Validierung („'Umsazt' nicht gefunden — meintest du
      'Umsatz'?") statt freiem Textfeld.
- [ ] **Demo-Daten im gewählten Modus** (S–M) — Landing-Klick rendert
      Beispieldaten im Zielmodus (Wasserzeichen „Beispieldaten"), bis echte
      Felder gebunden sind; Format konfigurierbar vor den Measures.
- [ ] **Direktmanipulation der Panels** (M–L) — Panel-Titel-Klick toggelt
      Δ/Δ%-Panels, Höhenverhältnis per Drag an der Trennlinie (persistiert).
- [ ] **Aktive Gruppe nach oben** (S) — Formatpanel sortiert kontextabhängig
      (Tabellen-Gruppe oben im Tabellen-Modus etc.), ergänzend zur
      vorhandenen Sichtbarkeits-Logik.
- [ ] **A/B-Konfigurations-Slots** (M) — zwei Einstellungs-Schnappschüsse
      speichern und umschalten (Abstimmung mit dem Fachbereich), Mechanik
      wie die Szenario-Slots im CO₂-Simulator.
- [ ] **Hilfe-Anker je Modus** (S) — ?-Symbol nur im Edit-Modus, verlinkt
      auf den Doku-Abschnitt des aktiven Modus inkl. Pflichtfeldern
      (voraussetzt: Doku-Seite steht).
- [ ] **„Alle Kennzahlen"-Schnellrolle** (L, experimentell) — Sammelrolle
      mit Namens-Auto-Zuordnung (Plan/Budget→PL, VJ→PY, Forecast→FC),
      Zuordnung im Panel korrigierbar; Opt-in wegen Fehlzuordnungs-Risiko.

## Doku & Launch (Tasks, keine Features)

- [ ] **Vollständige Doku mit Settings-Referenz** — Musterseite → Skalierung;
      Pane-Nachbau oder echte Desktop-Screenshots (Entscheidung offen).
- [ ] **Sample-PBIX** für AppSource (braucht Power BI Desktop).
- [ ] **AppSource-Einreichung** — wartet auf Partner-Center-Konto (Artur);
      Kit liegt unter `appsource/`.
- [ ] **Zertifizierung** (optional, nach Listing) — Vorarbeiten erledigt.
- [ ] **IBCS-Markenrichtlinien gegenlesen** — Disclaimer steht in NOTICE;
      vor größerer Sichtbarkeit einmal prüfen (lassen).
