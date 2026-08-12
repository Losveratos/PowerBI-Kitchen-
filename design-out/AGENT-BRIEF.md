# AGENT-BRIEF · Daten-WG Management-Report v1

Regelsatz für Agenten, die auf diesen Seiten Visuals platzieren.
Wer nur diese Datei liest, baut konsistent. Maschinenlesbare Zonen:
`zones.json` (gleiche Werte).

## Canvas & Raster
- Canvas: **1920×1080**. Theme: `design-out/theme.json` (muss importiert sein).
- Raster 8 px: x, y, w, h aller Visuals durch 8 teilbar. Außenrand 24,
  Gutter 24.
- Look **modern-soft**: Schatten verboten; Kacheln weiß, Kontur `#E5E2D8`,
  Radius 8 (macht das Theme — keine lokalen Format-Overrides setzen!).

## Zonen (x, y, w, h)
| Zone | Koordinaten | Regel |
| --- | --- | --- |
| Kopfband | 0, 0, 1920, 80 | weiß; 1-px-Linie `#E5E2D8` unten |
| Logo | 1816, 20, 80, 40 | `assets/daten-wg-logo.png`, Alt-Text „Logo Daten-WG", kein tabOrder |
| Seitentitel | 24, 24, 640, 40 | 24 pt Semibold, `#1A1A1A` |
| Nav-Buttons | rechtsbündig bis 1792, y=20, je 128×40 | aktiv: Grund `#117865`, Text `#FFFFFF`, Zustand „Deaktiviert" |
| Filter-Panel | 1656, 96, 240, 936 | Grund `#F4F1E8`; Slicer gestapelt, oben Titel „Filter" 14 pt, unten Reset-Button |
| Content | 24, 96, 1608, 936 | **alle Daten-Visuals nur hier** |
| Fußleiste | 0, 1048, 1920, 32 | 10 pt `#6B6B6B`: `Stand: … · Quelle: … · Kontakt: …` |

## Content-Slots
| Slot | Koordinaten | Inhalt |
| --- | --- | --- |
| kpi-1 … kpi-4 | 24/432/840/1248, 96, je 384, 144 | KPI-Kacheln: Label 12 pt grau → Wert 32 pt → Delta mit Vorzeichen |
| haupt-visual | 24, 264, 1024, 552 | das eine Haupt-Visual der Seite |
| detail-visual | 1072, 264, 560, 552 | Treiber/Detail |
| leiste-unten | 24, 840, 1608, 192 | Tabelle oder Zeitachse (optional) |

## Pflicht-Properties je Visual
- Titel: an, links, 14 pt Segoe UI Semibold, `#1A1A1A`; Titeltext =
  Botschaft, nie Feldname.
- Hintergrund/Rahmen/Schatten: **nicht lokal setzen** — Theme regelt das.
  (`bulk_restyle.py --strip background,border,dropShadow` stellt das wieder her.)
- Datenfarben: Serienreihenfolge = Theme-Palette (`#166088`, `#C25A2D`,
  `#5B3B7A`, `#B8860B`, `#B8336A`, `#6B6B6B`). **Verboten:** `#117865`
  (Marken-Teal = nur Chrome) und eigene Farben.
- tabOrder: Lese-Reihenfolge (Titel → kpi-1…4 → haupt → detail → leiste);
  Logo/Deko ohne tabOrder. Alt-Text je Daten-Visual: eine Botschafts-Zeile.
- Schriften: nur Segoe UI / Segoe UI Semibold. Minimum 10 pt.

## Verbote
1. Kein Visual außerhalb der Content-Zone (Chrome-Zonen sind reserviert).
2. Keine Schatten, keine abweichenden Radien, keine lokalen Farb-Overrides.
3. Kein Rot/Grün als einzige Kodierung — immer Vorzeichen/Pfeil dazu.
4. Chrome (Kopfband, Panel, Fußleiste) wird von `_Design-System` kopiert,
   nie neu gebaut; Änderungen am Chrome auf allen Seiten nachziehen.

## Selbstkontrolle nach jedem Seitenbau
```bash
python .claude/skills/powerbi-design-framework/scripts/bulk_restyle.py <Report> \
  --check --zones design-out/zones.json --fonts "Segoe UI,Segoe UI Semibold" \
  --skip-types shape,textbox,actionButton,image,slicer
python .claude/skills/powerbi-design-framework/scripts/render_wireframe.py <Report> \
  --zones design-out/zones.json --html
```
Linter muss 0 Verstöße melden; Wireframe ansehen (Proportionen, Lücken).
