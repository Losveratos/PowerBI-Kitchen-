# Gestaltungsregeln für Power-BI-Seiten

Diese Regeln sind das „Warum" hinter dem Framework. Sie gelten für jede
Seite, unabhängig von Branding und Layout-Variante.

## 1 · Raster & Abstände (8-px-System)

Alle Maße sind Vielfache von 8 px (Canvas-Pixel, nicht Zoll). Das macht
Layouts reproduzierbar — gerade für Agenten, die Koordinaten setzen.

- **Außenrand (Margin):** 16 px zu jeder Canvas-Kante (24 px bei 1920×1080).
- **Gutter (Abstand zwischen Kacheln):** 8 px, bei luftigem Management-Look 16 px.
- **Innenabstand in Kacheln (Padding):** 12–16 px; Titel nie an der Kante kleben.
- Visuals **snappen auf das Raster**: x, y, Breite, Höhe alle durch 8 teilbar.

## 2 · Gestalt-Prinzipien angewendet

- **Nähe = Zusammengehörigkeit.** Was fachlich zusammengehört (KPI + sein
  Trend), steht dichter beieinander als zu allem anderen. Der Gutter innerhalb
  einer Gruppe ist kleiner als der Abstand zwischen Gruppen.
- **Ausrichtung.** Jede Kachel-Kante liegt auf einer gemeinsamen Fluchtlinie.
  Ein einziges „fast ausgerichtetes" Visual zerstört den Eindruck der ganzen
  Seite — deshalb Koordinaten aus dem AGENT-BRIEF übernehmen, nicht schätzen.
- **Ähnlichkeit.** Gleiche Rolle = gleiches Aussehen: alle KPI-Kacheln haben
  identische Höhe, Titelgröße, Hintergrund. Abweichung nur als bewusstes
  Signal (z. B. die eine kritische Kennzahl).
- **Weißraum ist Struktur, kein verschwendeter Platz.** Lieber ein Visual
  weniger als Gutter opfern. Faustregel: ≤ 6–8 Visuals pro Seite (KPI-Kacheln
  zählen als halbe).
- **Figur/Grund.** Seitenhintergrund minimal getönt (z. B. `#FAFAFB`),
  Kacheln weiß — so tragen die Kacheln die Struktur ohne Rahmenlinien.
  Rahmen und Schatten sparsam: entweder zarte Kontur **oder** zarter
  Schatten, nie beides.

## 2b · Standard-Look „modern-soft"

Der Default-Look des Frameworks hat einen Namen, damit Spec, Theme und
`bulk_restyle.py`-Preset dasselbe meinen: **keine Schatten**, Struktur über
**Tonwert** (weiße Kacheln auf leicht getöntem Grund), **zarte Kontur**
(Grau-200) und **leicht gerundete Ecken (Radius 8)**. Schatten sind in
BI-Reports fast immer Rauschen — Tonwert-Trennung leistet dasselbe ruhiger.
Im IBCS-Modus wird der Look strenger (Radius 0, keine Kontur) — siehe
[`ibcs-mode.md`](ibcs-mode.md).

## 3 · Visuelle Hierarchie (Lese-Reihenfolge)

Westliche Leser scannen im Z-/F-Muster: links oben → rechts oben → diagonal
runter. Daraus folgt:

1. **Links oben:** Seitentitel + Kernbotschaft (im Zweifel die wichtigste Zahl).
2. **Obere Reihe:** KPI-Kacheln (Overview — „Wo stehen wir?").
3. **Mitte:** Haupt-Analyse-Visual (größtes Element der Seite, ~40–50 % der
   Content-Fläche). Eine Seite hat **einen** Hauptdarsteller.
4. **Unten/rechts:** Detail, Treiber, Tabellen.

Das entspricht Shneidermans Mantra (Overview → Zoom/Filter → Details) und
passt zum IBCS-Aufbau der übrigen Projekt-Skills.

## 4 · Kachel-Regeln (KPI-Reihe)

- **3–5 KPI-Kacheln**, nicht mehr — ab 6 vergleicht niemand mehr.
- Gleiche Breite: Content-Breite minus Gutter, geteilt durch Anzahl.
- Aufbau je Kachel (von oben): Label (klein, grau) → Wert (groß) →
  Vergleich/Delta (klein, mit Vorzeichen und Richtung).
- Deltas nicht nur über Farbe kodieren (Farbfehlsicht): Vorzeichen, Pfeil
  oder ▲▼ dazu.
- Kachelhöhe 88–120 px (1280er Canvas); alle identisch.

## 5 · Typografie-Skala

Power BI rendert Segoe UI zuverlässig auf allen Clients — bei Corporate-Fonts
prüfen, ob sie im Service/Browser verfügbar sind, sonst Segoe UI als Fallback
festschreiben. Skala (für 1280×720; bei 1920×1080 ×1,25–1,5):

| Rolle                | Größe (pt) | Schnitt            |
| -------------------- | ---------- | ------------------ |
| Seitentitel          | 16–20      | Semibold           |
| Visual-Titel         | 11–12      | Semibold           |
| KPI-Wert (Callout)   | 24–28      | Regular/Semibold   |
| Achsen/Labels/Body   | 9–10       | Regular            |
| Fußleiste/Metadaten  | 8–9        | Regular, grau      |

**Untergrenze 8 pt, Ziel ≥ 9 pt** für alles Lesbare. Kleiner ist auf
Beamern/Screenshots nicht mehr entzifferbar — das ist eine Accessibility-
Grenze, keine Geschmacksfrage.

## 6 · Farb-Rollen (Chrome vs. Daten trennen)

- **Chrome-Palette** (Navigation, Kopfband, Kacheln): Ink (fast-schwarz),
  Grauleiter (aus Ink abgeleitet, nicht reines Grau), Hintergrund, **eine**
  Akzentfarbe (Corporate-Primärfarbe). Akzent nur für Interaktion/Hervorhebung
  (aktiver Nav-Button, Auswahl), nie als große Fläche hinter Text ohne
  Kontrast-Check.
- **Datenfarben**: max. 6–8, farbfehlsicht-tauglich, untereinander
  unterscheidbar. Corporate-Blau darf die erste Datenfarbe sein; die übrigen
  daraus ableiten (nicht 8 Corporate-Töne erzwingen).
- **IBCS-Kontext** (wenn ChartKitchen/IBCS im Spiel): AC = dunkel/solide,
  PY = grau, PL = Kontur, FC = schraffiert — dann trägt die Semantik die
  Farben, und die Corporate-Farbe bleibt dem Chrome vorbehalten.
- Ampel-Logik (rot/grün) sparsam und immer mit zweitem Kanal (Symbol,
  Position, Text).

## 7 · Accessibility-Checkliste (WCAG AA als Standard)

- **Kontrast Text↔Hintergrund ≥ 4,5:1** (große Titel ≥ 18 pt: ≥ 3:1).
  Prüfen mit `scripts/check_contrast.py` — nie nach Augenmaß.
- **Kontrast UI-Elemente** (Buttons, Icons, Chart-Linien vor Hintergrund)
  ≥ 3:1.
- **Schriftgrößen** siehe Skala oben; nichts unter 8 pt.
- **Farbfehlsicht:** keine Information, die *nur* über Rot-vs.-Grün kodiert
  ist. Deltas mit Vorzeichen/Pfeil, Serien zusätzlich über Label/Position
  unterscheidbar.
- **Tab-Reihenfolge** in Desktop setzen (Auswahl-Bereich): folgt der
  Lese-Reihenfolge (Titel → KPIs → Haupt-Visual → Details). Dekoratives
  (Shapes, Linien) aus der Tab-Reihenfolge nehmen.
- **Alt-Text** je Visual: eine Zeile, die die Botschaft nennt („Umsatz AC vs.
  PL je Monat, AC liegt ab Juni unter Plan"), nicht den Chart-Typ.
- **Nicht nur Hover:** Kernaussagen dürfen nicht ausschließlich in Tooltips
  leben.

## 8 · Do / Don't Kurzliste

| Do                                          | Don't                                      |
| ------------------------------------------- | ------------------------------------------ |
| Ein Haupt-Visual pro Seite                  | 10 gleich große Visuals im Patchwork       |
| Kacheln auf 8-px-Raster                     | Freihand-Platzierung „nach Gefühl"         |
| Eine Akzentfarbe, Grau für Kontext          | Jede Corporate-Farbe irgendwo unterbringen |
| Titel als Botschaft („X wächst 12 %")       | Titel als Feldname („Sum of Sales by …")   |
| Weißraum lassen                             | Jede Lücke mit einem Visual füllen         |
| Kontrast messen                             | „Sieht gut aus" entscheiden lassen         |
