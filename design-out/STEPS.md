# STEPS · Umsetzung in Power BI Desktop

Reihenfolge einhalten — das Theme zuerst, dann erbt alles Weitere.

## 1 · Theme importieren
1. **Ansicht → Designs → Nach Designs suchen** → `design-out/theme.json`.
2. Prüfen: Seiten-Hintergrund creme (`#FAFAF5`), Kacheln weiß mit zarter
   Kontur (Radius 8), keine Schatten, KPI-Karten-Wert 32 pt.

## 2 · Canvas einstellen (je Seite)
Seite anklicken → Format → Canvas-Einstellungen → Typ **Benutzerdefiniert**,
Breite **1920**, Höhe **1080**. Vertikale Ausrichtung: Oben.

## 3 · Kopfband bauen (einmal, dann kopieren)
1. Rechteck-Shape 0/0/1920/80, Füllung `#FFFFFF`, kein Rahmen; darunter
   Linie 1 px `#E5E2D8` (oder Shape-Unterkante als Rahmen unten).
2. Textfeld Seitentitel bei 24/24 (Breite 640, Höhe 40), 24 pt Segoe UI
   Semibold, `#1A1A1A`.
3. Nav-Buttons (Einfügen → Buttons → Leer): je 128×40, y=20, rechtsbündig
   bis x=1792, 16 px Abstand. Aktion „Seitennavigation" + Zielseite.
   Zustands-Formatierung: Standard = Text `#1A1A1A` auf Weiß; beim Button
   der **aktuellen** Seite Zustand „Deaktiviert" mit Grund `#117865`,
   Text `#FFFFFF` (zeigt „du bist hier").
4. **Logo klein rechts:** Einfügen → Bild → `assets/daten-wg-logo.png`,
   Position 1816/20, Größe 80×40. Alt-Text „Logo Daten-WG", im
   Auswahl-Bereich aus der Tab-Reihenfolge nehmen.

## 4 · Filter-Panel rechts
1. Rechteck 1656/96/240/936, Füllung `#F4F1E8`, Radius 8, kein Rahmen.
2. Titel „Filter" (14 pt Semibold) oben, dann Slicer gestapelt (Dropdown-
   Stil, je 16 px Abstand), Breite 208 (Panel minus 2×16 Innenabstand).
3. Unten Reset-Button: Lesezeichen „Filter-Reset" (Standardzustand ohne
   Datenauswahl speichern) + Button mit Aktion „Lesezeichen".

## 5 · Fußleiste
Textfeld 24/1048/1600/32: `Stand: <Datum> · Quelle: <System> · Kontakt:
Daten-WG` — 10 pt, `#6B6B6B`. Datenstand besser als Measure-Karte, damit
er nicht veraltet.

## 6 · Content-Slots füllen
Koordinaten aus `AGENT-BRIEF.md`/`zones.json`: KPI-Kacheln (Karten-Visuals)
auf kpi-1…4, Haupt-Visual 24/264/1024/552, Detail 1072/264/560/552,
optionale Leiste unten 24/840/1608/192. Serienfarben laufen über das Theme —
nichts manuell umfärben.

## 7 · Komponenten-Seite `_Design-System`
1. Neue Seite `_Design-System`, per Rechtsklick **Seite ausblenden**.
2. Darauf ablegen und im Auswahl-Bereich benennen (`ebene/name`):
   - `org/kopfband` — das komplette Kopfband aus Schritt 3 als Gruppe
     (inkl. Logo + Buttons in allen Zuständen: default/aktiv/disabled)
   - `org/filter-panel`, `org/fussleiste`
   - `mol/kpi-kachel` — Karte + Label + Wert + Delta in Slot-Geometrie
     (384×144), plus Variante `mol/kpi-kachel-kritisch`
   - `atom/h1-titel` (24 pt), `atom/h2` (14 pt), `atom/body` (12 pt),
     `atom/caption` (10 pt grau)
   - Farb-Swatches: je Rolle ein 64×64-Shape mit Hexwert als Beschriftung
3. Neue Report-Seiten: Elemente von hier **kopieren** (Strg+C/V behält
   Position exakt) — nie neu formatieren.

## 8 · Accessibility-Abschluss
- Tab-Reihenfolge je Seite (Auswahl-Bereich): Titel → KPI 1–4 →
  Haupt-Visual → Detail → Leiste unten; Logo/Shapes entfernen.
- Alt-Text je Daten-Visual: eine Zeile Botschaft.
- Kontraste sind vorab geprüft (siehe DESIGN-SPEC) — bei Farbänderungen
  neu messen: `python .claude/skills/powerbi-design-framework/scripts/check_contrast.py …`

## 9 · Qualitäts-Gate (sobald als PBIP gespeichert)
```bash
python .claude/skills/powerbi-design-framework/scripts/bulk_restyle.py <Name>.Report \
  --check --zones design-out/zones.json --fonts "Segoe UI,Segoe UI Semibold" \
  --skip-types shape,textbox,actionButton,image,slicer
python .claude/skills/powerbi-design-framework/scripts/render_wireframe.py <Name>.Report \
  --zones design-out/zones.json --html
```
