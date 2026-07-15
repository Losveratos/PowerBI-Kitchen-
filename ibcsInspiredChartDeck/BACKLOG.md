# Backlog · ChartKitchen byDatenWG

Ideen-Sammlung: bewusst **nicht** sofort gebaut, aber nicht vergessen.
Aufwand: S (< ½ Tag) · M (½–1 Tag) · L (mehrere Tage) · XL (Architektur).
Neue Ideen bitte als GitHub-Issue anlegen oder hier ergänzen.

## Barrierefreiheit

- [ ] **Schraffur-Redundanz für „schlecht"** (M) — optionaler Schalter:
      schlechte Varianzen zusätzlich schraffiert (Muster + Farbe = doppelter
      Kanal; hilft auch beim S/W-Druck). Stärkster nächster A11y-Schritt.
- [ ] **Blau/Orange-Farbpreset** (S) — ColorBrewer-Standard #2C7BB6/#E66101
      als Dropdown-Preset neben den Pickern (Achromatopsie, S/W-Druck).
- [ ] **▲/▼-Symbole auf KPI-Karten** (S) — Text-Redundanz vor den Δ-Werten.
- [ ] **Fokusverlust nach In-Chart-Rerender** (M) — Zoom/Aufklappen/Sort per
      Enter wirft Tastaturnutzer aus dem Visual; Fokus wiederherstellen.
- [ ] **ARIA-Semantik aufräumen** (M) — role=option ohne listbox, Chart-Label,
      Tab-Stop-Flut bei vielen Kategorien (Fund aus Ideation-Review).
- [ ] **Grautöne auf WCAG-Kontrast anheben** (S) — subtle #8A8A8A → ~#6E6E6E.

## Tabelle & Matrix

- [ ] **Sparklines in der Zeile** (M) — Mini-Trendlinie pro Zeile (letzte N
      Perioden aus Matrix-Spalten oder eigener Perioden-Rolle).
- [ ] **Kommentar-Spalte** (S–M) — Kommentartext sichtbar als eigene Spalte
      rechts (statt nur nummerierter Marker), mit Truncate/Umbruch.
- [ ] **Zeilen-Reihenfolge per Drag** (L) — manuelles Umsortieren, persistiert;
      Verzahnung mit Sort/Hierarchie klären.
- [ ] **Export-Ansicht „alles aufgeklappt"** (S) — beim Druck/PDF automatisch
      alle Zeilen- und Spalten-Ebenen öffnen.
- [ ] **Alle Spaltenbreiten per Drag** (M) — bisher nur Namensspalte;
      Wertspalten/Blöcke ebenfalls (persistierte Breiten-Map).
- [ ] **Formelzeilen: Feedback bei Fehler** (S) — unauflösbare Formel als
      Zeile mit „?"-Werten zeigen statt lautlos weglassen.
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

## Doku & Launch (Tasks, keine Features)

- [ ] **Vollständige Doku mit Settings-Referenz** — Musterseite → Skalierung;
      Pane-Nachbau oder echte Desktop-Screenshots (Entscheidung offen).
- [ ] **Sample-PBIX** für AppSource (braucht Power BI Desktop).
- [ ] **AppSource-Einreichung** — wartet auf Partner-Center-Konto (Artur);
      Kit liegt unter `appsource/`.
- [ ] **Zertifizierung** (optional, nach Listing) — Vorarbeiten erledigt.
- [ ] **IBCS-Markenrichtlinien gegenlesen** — Disclaimer steht in NOTICE;
      vor größerer Sichtbarkeit einmal prüfen (lassen).
