# LinkedIn-Karussell · Ein halbes Jahr Kitchen

`kitchen-karussell.pdf` ist der fertige Dokument-Post für LinkedIn (22 Folien, 1080 × 1350).

## Neu bauen

1. Statistik aus der Git-Historie (braucht die volle Historie, kein Shallow-Clone):
   `python3 -I inventar/stats.py <repo> inventar/items.json`
   Projekte, Pfade, Titel und Kurztexte stehen in `inventar/items_def.py`.
2. Vorschaubilder: je Projekt ein Screenshot `<id>.png` (1280 × 800) in einem Ordner,
   eigene Bilder in `src/<id>.png` haben Vorrang.
3. `python3 build.py inventar/items.json <screenshot-ordner>` schreibt `data.js` und `img/`.
4. `carousel.html` im Browser öffnen bzw. mit Playwright als PDF drucken
   (Seitengröße 1080 × 1350 px, Hintergründe an).

## Regeln

- Commits und Zeilen je Projekt zählen nur die Dateien dieses Projekts.
- Zeilen Code: Quelltext ohne Daten, generierte Seiten, Kopien und Vendor-Bibliotheken.
- Enddatum ohne seitenweite Sammel-Commits (Schriften, Navigation, Markdown-Export).
- „läuft" nur für Produkte und Werkzeuge mit eigenen Commits ab 29.10.2026,
  die mindestens 21 Tage vorher gestartet sind: Start, dann Pfeil.
