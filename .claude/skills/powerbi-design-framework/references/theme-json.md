# Power-BI-Theme (`theme.json`) — Aufbau & Befüllung

Das Report-Theme ist der Hebel für Konsistenz, der **ohne** manuelles
Formatieren jedes Visuals wirkt. Basis ist
[`../assets/theme-template.json`](../assets/theme-template.json) — kopieren
und die unten markierten Schlüssel aus dem Interview/Branding befüllen.

Import in Desktop: **Ansicht → Designs → Nach Designs suchen** →
`design-out/theme.json`. Änderungen am Theme wirken sofort auf alle Visuals,
die nicht manuell überschrieben wurden — deshalb: so viel wie möglich ins
Theme, so wenig wie möglich per Hand formatieren.

## Struktur und was wohin gehört

```jsonc
{
  "name": "…",                    // sprechender Name: "<Firma> Report Theme v1"
  "dataColors": ["#…", …],        // DATENfarben (Serien), 6–8 Stück,
                                  // farbfehlsicht-geprüft — NICHT die Chrome-Palette
  "foreground": "#…",             // Ink: Standard-Textfarbe
  "background": "#FFFFFF",        // Kachel-/Visual-Hintergrund
  "tableAccent": "#…",            // Akzent in Tabellen/Matrix (Gitter, Summen)

  "textClasses": {                // globale Typo-Skala (pt) — deckt die
    "title":    { … },            //   Visual-Titel ab
    "header":   { … },            //   Kopfzeilen (Tabellen, Karten-Header)
    "label":    { … },            //   Achsen, Datenlabels, Legenden
    "callout":  { … }             //   KPI-Karten-Wert (Standard wäre 45pt — zu groß!)
  },

  "visualStyles": {
    "*": { "*": { … } },          // Wildcard: gilt für ALLE Visuals
    "page": { "*": { … } }        // Seiten-Hintergrund + Wallpaper (outspace)
  }
}
```

### `textClasses` — empfohlene Werte (1280×720)

| Klasse    | fontSize | Hinweis                                           |
| --------- | -------- | ------------------------------------------------- |
| `title`   | 11–12    | Visual-Titel, Semibold via `fontFace`             |
| `header`  | 10       |                                                   |
| `label`   | 9–10     | nie unter 9 — Accessibility-Grenze                |
| `callout` | 24–28    | Power-BI-Default ist 45 pt und sprengt KPI-Kacheln |

Jede Klasse: `{ "fontFace": "Segoe UI", "fontSize": 10, "color": "<Ink>" }`
(Titel: `"Segoe UI Semibold"`). Corporate-Font nur eintragen, wenn er im
Service verfügbar ist; sonst Segoe UI und den Wunsch-Font in der
DESIGN-SPEC als „wenn installiert" dokumentieren.

### `visualStyles."*"."*"` — die globalen Defaults

Die wichtigsten Blöcke (jeweils Array mit einem Objekt — Power-BI-Eigenheit):

```jsonc
"*": { "*": {
  "background": [{ "show": true, "color": { "solid": { "color": "#FFFFFF" }}, "transparency": 0 }],
  "border":     [{ "show": false }],                       // ODER zarte Kontur — nie beides mit Schatten
  "dropShadow": [{ "show": false }],
  "visualHeaderTooltip": [{ "transparency": 0 }],
  "title": [{
    "show": true,
    "fontColor": { "solid": { "color": "<Ink>" }},
    "background": { "solid": { "color": "" }},
    "alignment": "left",
    "fontSize": 12,
    "fontFamily": "Segoe UI Semibold"
  }]
}}
```

Zarter Kachel-Look statt Rahmen: `background` weiß auf leicht getöntem
Seiten-BG (siehe unten) trägt die Struktur; wenn Kontur gewünscht:
`"border": [{ "show": true, "color": {"solid": {"color": "<Grau-200>"}}, "radius": 8 }]`.

### `visualStyles.page` — Seiten-Hintergrund

```jsonc
"page": { "*": {
  "background": [{ "color": { "solid": { "color": "<BG, z. B. #FAFAFB>" }}, "transparency": 0 }],
  "outspace":   [{ "color": { "solid": { "color": "<BG>" }}, "transparency": 0 }]
}}
```

`outspace` ist die Fläche um das Canvas (Wallpaper) — gleiche Farbe wie
`background` wirkt im Service am ruhigsten.

## Befüll-Logik aus dem Interview

| Interview-Ergebnis          | Theme-Schlüssel                                    |
| --------------------------- | -------------------------------------------------- |
| Ink (aus Branding/Neutral)  | `foreground`, `textClasses.*.color`, Titel-`fontColor` |
| Akzentfarbe                 | `tableAccent`; erste `dataColors`-Position nur, wenn sie als Datenfarbe taugt |
| Seiten-BG (getönt)          | `page.background` + `outspace`                     |
| Kachel-BG (weiß)            | `background` + `visualStyles.*.*.background`       |
| Datenpalette                | `dataColors` (6–8, geprüft)                        |
| Typo-Skala                  | `textClasses`                                      |

**Kontrast-Pflicht:** `foreground` auf `background` UND auf Seiten-BG,
Titel-Farbe auf Kopfband-Farbe, Fußleisten-Grau auf Seiten-BG — alle durch
`scripts/check_contrast.py` (Ziel ≥ 4,5:1; Fußleiste/Sekundärtext ebenfalls,
nicht „ist ja nur Metatext").

## Grenzen des Themes (→ STEPS.md)

Nicht alles kann ein Theme: Canvas-Größe, Shapes/Buttons des Chromes,
Filter-Panel, Bookmarks, Tab-Reihenfolge, Alt-Texte sind Handarbeit in
Desktop und gehören in die STEPS.md. Das Theme liefert Farben + Typo +
Visual-Defaults; das Chrome liefert die Spec.
