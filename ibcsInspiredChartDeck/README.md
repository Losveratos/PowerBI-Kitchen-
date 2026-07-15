# ChartKitchen byDatenWG — Custom Visual für Power BI

*inspired by IBCS*

Ein echtes Power BI Custom Visual (`.pbiviz`), das die wichtigsten IBCS-Bausteine
in **einem** Visual löst:

![Screenshot](assets/screenshot.png)

## Features

- **Szenario-Notation nach IBCS**
  - **AC** (Actual): solide, dunkel
  - **PY** (Previous Year): graue Säule/Balken, versetzt hinter AC
  - **PL** (Plan/Budget): Outline (weiß gefüllt, umrandet)
  - **FC** (Forecast): schraffiert — Monate ohne AC-Wert zeigen automatisch den FC
- **Absolutes Abweichungs-Panel** (ΔPY oder ΔPL): grün/rot gefärbte Balken
- **Relatives Abweichungs-Panel** (ΔPY % / ΔPL %): Pin-Chart (Lollipop), FC-Pins hohl
- **IBCS-Baseline-Notation**: AC = solide schwarze Achse, PY = dicke graue Achse,
  PL = doppelte dünne Linie
- **PY als Dreieck** bei drei Szenarien: Sind AC, PY und PL gebunden, erscheint
  das Vorjahr als graues Dreieck am Säulen-/Balkenrand auf PY-Höhe statt als
  dritte Säule (Columns, Bars, Tabelle, Kategorie-Brücke; in der Integrierten
  Brücke zählt auch AC + FC + PY; abschaltbar) — IBCS-Jahreschart-Notation
- **Columns & Bars**: vertikale Säulen für Zeitreihen, horizontale Balken für
  Struktur-Vergleiche (Panels dann nebeneinander)
- **Invert-Schalter** für Kosten-KPIs (Mehrwert = schlecht = rot) — global oder
  **je Kategorie** (kommagetrennte Liste, z. B. Opex neben Umsatz in KPI-Karten)
- **Datenstand-Fußzeile**: „Ist per Jun 2026 · Stand 05.07. · Quelle: …" unten links
- **Perioden-Status „vorläufig"**: Forecast-Flag `2` (oder „vorläufig") markiert
  vorläufige Ist-Monate — solide Säule mit dünner Überlagerungs-Schraffur + Tooltip-Status
- **Σ-treue Rundung** (opt-in): Labels addieren per Restwertverfahren exakt auf die
  Σ-Kopfzeile; ausgeschaltet erscheint bei Differenz automatisch ein Rundungshinweis
- **Export-Modus**: PDF-/PowerPoint-Export und Abo-Mails zeigen das Chart automatisch
  ohne In-Chart-Buttons und Chips
- **FC-Revision**: Feld „FC Vormonat" + Basis „FC Vormonat (Revision)" — ΔFC Vm
  zeigt, was sich seit dem letzten Forecast-Zyklus verschoben hat
- **IBCS-Titelblock**: automatischer Titel „KPI in Einheit · Zeitraum: AC, FC vs. PL"
  plus optionale Botschafts-Zeile (SAY) — alle Teile überschreibbar
- **Waterfall / Brücke**: GuV-Wasserfall (sum/delta-Rolle), Varianz-Brücke PL→AC
  oder Beitrags-Wasserfall mit Σ-Anker — inkl. Konnektoren und FC-Schraffur
- **GuV-Statement (IBCS)** (eigener Chart-Modus): P&L-Zeilen mit PY- und
  Szenario-Kaskaden-Spalten (Wasserfall-Positionierung), ΔPY-Balken und
  ΔPY%-Pins an Referenzachsen; Szenario-Sichten AC · AC&FC (Split schraffiert)
  · PL (Umriss) als In-Chart-Buttons (nur gebundene Szenarien, persistiert);
  sum/delta-Blöcke klappen per Chevron oder Ebenen-Buttons 1/2 zusammen,
  pct-Zeilen als Margen-Text (Wert %, Δ in Pp)
- **Waterfall bridge für Columns/Bars** (optional, Chart → Bridge): zusätzliches
  Panel neben den normalen AC/PY/PL-Vergleichsbalken, das dieselben Kategorien als
  kaskadierende Brücke von der Basis zu AC mit Verbindungslinien zeigt — Absolutwerte,
  Überleitung und Abweichungs-Panels (ΔPY/ΔPL, ΔPY %/ΔPL %) sind gleichzeitig sichtbar.
  Echte Anker-Balken markieren Start (Basis-Summe, PL-Outline oder PY-grau) und Ende
  (AC- bzw. gestrichelt AC/FC-Summe) der Brücke, ein eingekreistes Badge zeigt den
  Netto-Saldo als Überleitungs-Callout. Inkl. **Sort by impact** (größter Treiber
  zuerst, Top-N-Rest bleibt am Ende) und einem klickbaren ⇅-Button im Chart, der die
  Sortierung persistiert umschaltet
- **Gruppen-Trennlinien** (Chart → Layout → Group separator every N): dünne Linien
  quer durch alle Panels nach jeweils N Kategorien — Lesehilfe für Struktur-Vergleiche
  mit natürlichen Untergruppen (z. B. Regionen), 0 = aus
- **Margen-%-Zeilen** (Waterfall-Typ „pct"): GuV-Zeilen wie „Marge %" zeigen
  Prozente statt €, Abweichungen in Prozentpunkten — ohne die €-Skalen zu stören
- **Tabelle (IBCS)** (eigener Chart-Modus): Kennzahlen-Tabelle mit integrierten
  Chart-Spalten — AC·PY·PL-Balken, ΔBasis-Zahl + -Balken, ΔBasis %-Pins, fette
  'sum'-Zwischensummen (GuV), Doppel-Varianz-Spalten inkl. Δ2-%-Zahl; auto-
  berechnete **Σ-Gesamtzeile** (unten fixiert, abschaltbar über „Summen-Kopfzeile");
  Grafikspalten fallen bei schmalen Visuals gestuft weg, die Δ%-Spalte rückt
  dann als bezifferte Zahl nach. **Mit Hierarchie im Category-Feld**:
  Oberkategorien aggregiert mit ▸/▾ (Klick klappt Unterzeilen auf/zu),
  ▸▸/▾▾ im Kopf klappt alle auf einmal, Drill-Zustand wird persistiert
  (bookmarkfähig, je Small-Multiples-Kachel getrennt); Skala-Karte wirkt
  auch hier (deck-weiter Skalen-Sync). **Kern-Tabelle**: numerische
  PY/PL-Wertspalten (Chart → Tabelle), Klick-Sortierung auf Spaltenköpfe
  (persistiert, segmentweise zwischen Zwischensummen) und die
  **Ein-Klick-GuV** — Struktur-Modus mit Invertieren/Ergebniszeile/
  Aus-Summen-ausnehmen je Zeile, wirkt bis in den GuV-Wasserfall
- **Pareto (Struktur)**: AC absteigend + kumulierte %-Linie, 80 %-Marke —
  braucht nur Category + AC
- **Dumbbell (Struktur)**: Basis → AC als zwei Punkte mit Verbinder in der
  Abweichungsfarbe
- **Slope · Vorher/Nachher**: Basis links, AC rechts, eine Linie je Kategorie
- **KPI-Karten (Kacheln)** (eigener Chart-Modus): eine Kachel je Kategorie mit
  großem Wert, Δ-Referenzzeilen (ΔPL/ΔPY) und Mini-Brücke Basis → Δ → AC in
  IBCS-Notation — das KPI-Card-Layout direkt im Deck, inkl. Crossfilter,
  Kommentaren und Wesentlichkeit
- **Kombi Säulen + Linie** (Feld „Line (Kombi)" füllen): zweite Kennzahl als
  Linie über den Säulen (z. B. Marge %), eigene Skala + Formatstring
- **Gestapelt** (Feld „Stack Series" füllen): Säulen/Balken stapeln sich
  automatisch nach der Serie — Legende, Segment- + Summen-Labels
- **Kachel-Zoom**: ⤢ an jeder Small-Multiples-Kachel vergrößert die Gruppe auf
  die volle Fläche (gleiche Skalen), „← Alle Gruppen" führt zurück
- **Vergleich per Klick** (optional): zwei Säulen/Balken anklicken zeigt die
  Differenz (absolut + %) als Klammer-Overlay
- **Integrierte Brücke (Zeit)** (eigener Chart-Modus): PY/PL-Totalsäulen links
  (beide, wenn beide gebunden — Kaskade startet an der gewählten Basis),
  ΔBasis-Wasserfall quer über die Monate, versetzte Basis·AC-Monatssäulen am Fuß
  (PL als Umriss, PY grau oder als Dreieck), ΔBasis%-Pins oben, AC|FC-Trennlinie,
  gestapelte AC+FC-Totalsäule rechts + Netto-Callout
- **Kategorie-Brücke (Struktur)** (eigener Chart-Modus): PL/PY-Summenzeilen oben,
  je Kategorie AC·PY-Balken + Kaskaden-Brick + ΔBasis%-Pin, AC-Summenzeile und
  doppelte Überleitung (ΔBasis mit Callout + ΔZweitbasis) unten — inkl.
  "größter Treiber"-Notiz (abschaltbar), Gruppentrennlinien, Top N + Rest,
  Sort by impact
- **In-Chart-Buttons** (optional, Chart → Bridge): ΔPY|ΔPL-Referenz-Umschalter
  (persistiert — Enduser wechselt die Varianz-Basis direkt im Bericht),
  ⇅ Sortierung und ▶ Aufbau-Animation für die beiden Brücken-Modi
- **Schriftgrößen-Preset** (Data labels → Size preset): Kompakt ×1 ·
  **Full HD ×1,5** (Standard für 1080p-Berichte) · Präsentation ×2 — skaliert alle
  Schriften im Visual auf einmal, Textgrößen-Regler bleiben zur Feinjustierung
- **Hervorhebung** (EMPHASIZE): Kategorien per Formatbereich markieren —
  schattiertes Band über alle Panels, fettes Label
- **Ausreißer-Kappung**: hartes Skalen-Maximum mit IBCS-Doppelstrich-Marker,
  Label zeigt den echten Wert
- **FC-Flag-Spalte** (1/0) als Alternative zur FC-Measure — kompatibel zu den
  Deneb-Templates des Chart-Builders
- **Formatbereich lokalisiert** (EN-Standard, deutsche Übersetzung)
- **Kommentar-Liste**: Kommentare erscheinen als nummerierte Fußnoten-Spalte rechts
  neben dem Chart — bleibt in PDF/PowerPoint-Exporten sichtbar (Tooltips nicht)
- **Theme-Farben**: optional Good/Bad und Neutraltöne aus dem Berichtsdesign übernehmen
- **Drilldown & Drillthrough**: Datums-/Kategorien-Hierarchien per Drill-Steuerung
  bzw. Rechtsklick → Drillthrough auf Detailseiten
- **Linien-Modus** für lange Zeitreihen: AC solide mit Punktmarkern (FC gestrichelt,
  hohle Marker), PY dünn grau, PL dünn gestrichelt — IBCS-Liniennotation
- **Kumuliert (YTD/QTD/R12)**: Umschalter stellt alle Panels auf kumulierte
  Sicht um — wahlweise Jahr, Quartal oder rollierende 12 Perioden, mit
  einstellbarem Fiskaljahres-Beginn (z. B. April)
- **Referenzlinie**: Ziel-/Schwellenwert als gestrichelte Linie mit Beschriftung
- **Gleitender Durchschnitt**: Ø-N-Overlay-Linie zur Glättung von Saisonalität
- **Doppel-Varianz**: ΔPL und ΔPY gleichzeitig — bis zu fünf Panels mit je
  korrekter IBCS-Baseline-Notation
- **Auto-Message**: die Botschafts-Zeile schreibt sich selbst (Gesamtabweichung
  plus stärkster/schwächster Treiber), eigene Texte haben Vorrang
- **Live-Demo**: ohne Felder rendert das Visual ein Beispiel-Chart statt einer
  leeren Fläche
- **Small Multiples**: Grouping-Feld teilt das Chart in Kacheln pro Gruppe —
  alle mit identischer Skalierung (IBCS-Regel „gleiche Skalen")
- **Multiples-Optionen** (Gruppe „Small Multiples", nur bei gefülltem
  Multiples-Feld): **Top N Kacheln** (die übrigen Gruppen werden zu einer
  „Rest (k)"-Kachel aggregiert), **Gesamt-Kachel (Σ)** — „Σ Gesamt" als
  erste Kachel, Summe über alle Gruppen auf derselben Skala — und
  **Erste Kachel groß** (IBCS CT 13): die erste Kachel bekommt volle Höhe
  links, der Rest rückt als Raster daneben, Skala bleibt identisch
- **Varianz-Stufen am Wasserfall** (IBCS CT 12): mit PY/PL am Waterfall
  erscheinen ΔBasis-Balken und ΔBasis-%-Pins je Rechenzeile über der
  Brücke, mit korrekter Referenzachsen-Notation und Farbe nach Wirkung
- **Kommentare im Chart erfassen** (optional): Kommentar-Modus an → Klick
  auf eine Kategorie öffnet einen Editor, der Kommentar wird im Bericht
  gespeichert (✎-Marker, Tooltip, Kommentarliste, bookmark-fähig)
- **Wesentlichkeits-Schwellen** (optional): Abweichungen unter der
  absoluten und/oder %-Schwelle werden grau statt rot/grün — weniger
  Ampel-Rauschen, Fokus auf materielle Abweichungen
- **YTD-Button im Chart** (optional): Enduser schaltet die kumulierte
  Sicht per Chip oben rechts um, persistiert wie die Brücken-Buttons
- **Σ-Header**: Summe + Gesamtabweichung (absolut & %) als Kopfzeile, gut/schlecht gefärbt
- **Kompakt-Modus**: unter ~190 px Höhe klappen die Varianz-Panels automatisch zu
  farbigen Δ-Labels an den Säulenenden — funktioniert auch als kleine Dashboard-Kachel
- **Label-Ausdünnung** bei vielen Kategorien (jedes k-te Label, danach Min/Max/Erster/Letzter)
- **AC/FC-Trennlinie**: gestrichelte Linie markiert den Übergang Ist → Forecast
- **Top N + Rest** (Bars-Modus): zeigt die N größten Kategorien, Rest wird korrekt aggregiert
- **Kommentar-Marker**: Text-Measure im Feld „Comments" erzeugt nummerierte Marker
  (①②③) an den Datenpunkten, Kommentartext im Tooltip
- **Skalen-Synchronisation**: fixierbares Skalen-Maximum (Basis-Chart und Varianz-Panel),
  damit mehrere Instanzen auf einer Seite dieselbe Skala nutzen
- **Measure-Formatstrings** werden übernommen (€, %, Dezimalstellen aus dem Modell),
  Varianz-Panels bekommen automatisch passende Einheiten
- **Barrierefreiheit**: Keyboard-Navigation (Tab, Enter/Space = Auswahl),
  High-Contrast-Modus (nur Vorder-/Hintergrundfarbe, Unterscheidung über Outlines/Muster)
- Wertelabels mit Halo, kompakte Einheiten (k/M/B, auto), Hover-Feedback,
  Tooltips (AC/FC/PY/PL/ΔBasis/ΔBasis %), Cross-Filtering per Klick (Strg = Mehrfachauswahl),
  Kontextmenü (Rechtsklick), Landing Page bei leeren Feldern

## Installation in Power BI

1. Fertiges Paket: [`dist/`](dist/) (`ibcsInspiredChartDeck….pbiviz`)
2. In Power BI Desktop: **Visualisierungen → ⋯ → Visual aus Datei importieren**
   und die `.pbiviz`-Datei auswählen.
3. Felder zuordnen:

| Feld | Rolle | Pflicht |
| --- | --- | --- |
| Category | Monat/Datum oder Struktur (Land, Produkt …) | ✔ |
| Actual (AC) | Ist-Measure | ✔ (oder FC) |
| Previous Year (PY) | Vorjahres-Measure | optional |
| Plan / Budget (PL) | Plan-Measure | optional |
| Forecast (FC) | Forecast-Measure | optional |
| Line (Kombi) | zweite Kennzahl als Linie über den Säulen | optional |
| Stack Series | Grouping → gestapelte Säulen/Balken mit Legende | optional |
| Comments | Text-Measure → nummerierte Marker + Tooltip | optional |
| Small Multiples | Grouping → Kachel-Grid mit gleicher Skala | optional |
| Waterfall Type | Spalte 'sum'/'delta' → GuV-Wasserfall | optional |
| Forecast Flag | 1/0-Spalte → AC-Zeilen als Forecast (schraffiert) | optional |

**Abweichungsbasis**: Standardmäßig „Auto" — PL, wenn befüllt, sonst PY.
Im Formatbereich unter **Chart → Variance basis** umstellbar.

## Formatbereich

- **IBCS title**: an/aus, KPI-Name, Zeitraum, Botschafts-Zeile (auto wenn leer)
- **Chart**: unterteilt in die Gruppen **Layout** (Orientation Columns/Bars/Line/Waterfall,
  Variance basis, Absolute/Relative variance, Dual variance, Total-Header, Group separator
  every N), **Analysis** (Cumulative YTD, Moving average, Top N, Highlight, Invert) und
  **Bridge** (Waterfall bridge, Sort by impact — nur bei Columns/Bars sichtbar)
- **IBCS colors**: AC, PY, PL-Outline, Good/Bad
- **Data labels**: an/aus, Textgröße, Dezimalstellen, Einheiten (Auto/k/M/B)
- **Comments**: Kommentarliste rechts an/aus
- **Scale sync**: Skalen-Mindest-Maximum für Basis-Chart und Varianz-Panel
  (gleiche Werte auf mehreren Instanzen = gleiche Skalen), Ausreißer-Kappung,
  Referenzlinie mit Beschriftung
- **Category axis**: Textgröße

## Selbst bauen

```bash
cd ibcsInspiredChartDeck
npm install
npx pbiviz package        # erzeugt dist/*.pbiviz
```

Voraussetzungen: Node ≥ 18. Für den Dev-Server (`npx pbiviz start`) zusätzlich
ein Entwickler-Visual-Setup im Power-BI-Dienst
(https://learn.microsoft.com/power-bi/developer/visuals/environment-setup).

## Sprachen

Formatbereich und In-Chart-Texte (Tooltips, Hinweise, Button-Tooltips,
Chips, Treiber-Notiz, Editor) vollständig lokalisiert für Deutsch
(`de-DE`), Englisch (`en-US`), Spanisch (`es-ES`) und Japanisch (`ja-JP`)
— inkl. aller Dropdown-Werte. Power BI wählt automatisch anhand der
Berichts-/Anzeigesprache.

Hinweis nach Versions-Update: Power BI cached importierte Visuals pro
Bericht — nach dem Import einer neuen `.pbiviz` das Visual einmal frisch
auf die Seite ziehen. Zeigt der Formatbereich rohe Schlüssel wie
`Title_Show`, ist noch eine alte Instanz/Version aktiv.

## Roadmap-Ideen

Die vollständige, gepflegte Ideen-Sammlung liegt in **[BACKLOG.md](BACKLOG.md)**
(Barrierefreiheit, Tabelle/Matrix, Karten, Charts, Lokalisierung, Technik).
Neue Wünsche gern als GitHub-Issue.

## Lizenz

**Apache License 2.0** — © 2026 Daten-WG und ChartKitchen-Contributors
(siehe [LICENSE](LICENSE) und [NOTICE](NOTICE)).

Die Lizenz deckt den **Quellcode** ab. **Name und Logo** („ChartKitchen",
„byDatenWG", DWG-Logo) sind Marken der Daten-WG und **nicht** mitlizenziert —
Forks brauchen eigenes Branding. „IBCS" ist eine eingetragene Marke der IBCS
Association; dieses Projekt ist nicht zertifiziert und nutzt den Begriff rein
beschreibend. Beiträge bitte per [CONTRIBUTING.md](CONTRIBUTING.md) (DCO,
`git commit -s`).
Nutzung, Änderung und Weitergabe sind frei, auch kommerziell — der
Autor-/Copyright-Hinweis muss dabei erhalten bleiben.
