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

## Film-Vorlagen (Mottos)

Jede Vorlage bringt eine eigene **Farbwelt** und eine eigene **Spruchwelt**
(die kreisenden Comic-Bursts) mit:

| Motto | Farbwelt | Sprüche |
| ----- | -------- | ------- |
| 🍭 Standard | Comic-Bunt | POW! BOOM! WOW! ZAP! YEAH! BÄM! |
| ⚔️ Kill Bill | Gelb/Schwarz/Blutrot | REVENGE! SWORD! HATTORI! WIGGLE! |
| 🚀 Star Wars | Saber-Gelb/Blau/Rot/Grün | PEW PEW! FORCE! VADER! JEDI! |
| 🛡️ Avengers Endgame | Thanos-Lila/Iron-Rot/Gold | SNAP! ASSEMBLE! 3000! SMASH! |
| 🎩 Der Pate | Sepia/Gold/Dunkelrot | OFFER! FAMILY! RESPECT! CAPISCE? |
| 🍫 Forrest Gump | Pastell-Grün/Blau/Rosa | RUN FORREST! SHRIMP! CHOCOLATE! |
| 🪩 Boogie Nights | 70s-Disco Pink/Gold/Lila | GROOVY! DISCO! BOOGIE! FUNK! |

Der Enduser wechselt sie über **bonbonfarbene Buttons direkt im Chart**
(unten). Die Auswahl wird persistiert (`persistProperties`), überlebt also
Reload. Alternativ im Formatierungsbereich unter **Film-Motto → Vorlage**.

## Formatierungsbereich

- **Film-Motto** – Vorlage (Standard / Kill Bill / Star Wars / …)
- **Animation** – Explosion (0–2.6), Dreh-Tempo (0–1.4), Rotation an/aus, Wackeln & Schweben
- **Comic-Style** – Kulleraugen, Comic-Bursts, Sprechblasen-Labels, schwarze Kontur
- **Farben** – ein Farbwähler pro Kategorie (nur aktiv im Motto „Standard"; ein Film-Motto überschreibt die Farben)

## Interaktion

- **Bonbon-Buttons** (unten) = Film-Motto umschalten (Farb- + Spruchwelt)
- **💥 EXPLODE** (oben rechts) = dreht extrem schnell + reißt voll auf, sodass alles zu explodieren scheint (Toggle)
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
