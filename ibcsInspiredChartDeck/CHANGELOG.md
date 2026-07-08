# Changelog · IBCS Inspired Chart Deck

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
  Pin — Kennzahlen-Tabelle mit integrierten Chart-Spalten im Zebra-Stil.
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
Referenzlinien — matcht die Zebra-BI-Referenzcharts genauer:
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
  in den Zebra-BI-Referenzcharts.

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
