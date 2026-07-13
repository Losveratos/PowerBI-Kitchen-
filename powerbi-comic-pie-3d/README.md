# 3D Comic Pie · Power BI Custom Visual

Ein verrücktes 3D-Comic-Tortendiagramm für Power BI – portiert aus dem
`comicpie3d.html`-Prototyp (Three.js). Explodierende Segmente, Wackel-Tanz,
Kulleraugen und um das Diagramm kreisende Comic-Bursts (POW! BOOM! WOW!).

Statt fester Beispieldaten liest das Visual **Kategorie + Wert** aus dem Report
und filtert beim Klick auf ein Stück den restlichen Report (Cross-Highlighting).

![Icon](assets/icon.png)

## Datenfelder

| Feld       | Rolle     | Beschreibung                               |
| ---------- | --------- | ------------------------------------------ |
| Kategorie  | Grouping  | Ein Tortenstück pro Kategorie (max. 30)    |
| Wert       | Measure   | Bestimmt die Größe des Stücks              |

## Formatierungsbereich

- **Animation** – Explosion (0–2.6), Dreh-Tempo (0–1.4), Rotation an/aus, Wackeln & Schweben
- **Comic-Style** – Kulleraugen, Comic-Bursts, Sprechblasen-Labels, schwarze Kontur
- **Farben** – ein Farbwähler pro Kategorie (Standard: Report-Theme-Palette)

## Interaktion

- **Ziehen** = drehen
- **Scrollen** = Zoom
- **Klick auf ein Stück** = poppt heraus **und** filtert den Report
- **Klick ins Leere / Rechtsklick** = Auswahl aufheben / Kontextmenü

## Entwicklung

```bash
cd powerbi-comic-pie-3d
npm install

# Live-Entwicklung (startet den pbiviz-Dev-Server für "Developer Visual" in Power BI Service)
npm start

# Signiertes Paket bauen -> dist/comicPie3D.pbiviz
npm run package
```

Voraussetzung: Node 18+. Beim ersten `npm start` legt `pbiviz` bei Bedarf ein
lokales Dev-Zertifikat an (`pbiviz --install-cert`).

## Import in Power BI

1. `npm run package` erzeugt `dist/comicPie3D.pbiviz`.
2. In Power BI Desktop: **Visualisierungen → … → Aus Datei importieren →**
   die `.pbiviz` auswählen.
3. Kategorie- und Wert-Feld zuweisen. Poppt. 💥

## Technik

- **Three.js r0.160** (als npm-Dependency gebündelt, kein CDN)
- `MeshToonMaterial` + 3-Band-Gradient → Cel-Shading
- Inverted-Hull-Outline + `EdgesGeometry` → Comic-Kontur
- Federmodell (Spring `k=150`, Dämpfung `16`) → „boing"-Explosion
- `ISelectionManager` → Cross-Filtering
- Formatting Model API (v6) → Formatierungsbereich
