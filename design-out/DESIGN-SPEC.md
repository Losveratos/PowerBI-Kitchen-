# Daten-WG · Report-Design-Spec v1

Management-Report · Canvas **1920×1080** · Look **modern-soft** · WCAG AA.
Branding extrahiert aus https://datenwgknowledgekitchen.com (CSS-Variablen
der Live-Seite) — Logo: `assets/daten-wg-logo.png` (S/W-Wortmarke, ~2:1).

## Farbrollen (Kontraste gemessen, nicht geschätzt)

| Rolle | Hex | Verwendung | Kontrast (gemessen) |
| --- | --- | --- | --- |
| `ink` | `#1A1A1A` | Text, Titel | 16,62:1 auf bg · 17,40:1 auf Kachel — PASS AA |
| `accent` | `#117865` | aktiver Nav-Button, Auswahl, Tabellen-Akzent | 5,15:1 auf bg · 5,39:1 auf Kachel — PASS AA |
| `ink-mute` | `#6B6B6B` | Fußleiste, Sekundärtext | 5,09:1 auf bg · 5,33:1 auf Kachel — PASS AA |
| `bg` | `#FAFAF5` | Seiten-Hintergrund + Outspace (warmes Creme) | — |
| `bg-card` | `#FFFFFF` | Kachel-/Visual-Hintergrund | — |
| `line` | `#E5E2D8` | Kachel-Kontur (Radius 8), Trennlinien | dekorativ |

**Datenfarben** (aus den Bucket-Farben der Webseite, alle ≥ 3:1 auf Weiß,
farbfehlsicht-verträglich gemischt — Blau/Orange als Leitpaar):

| # | Hex | Herkunft | Kontrast auf Weiß |
| - | --- | --- | --- |
| 1 | `#166088` | Bucket „Power BI" | 6,86:1 |
| 2 | `#C25A2D` | Bucket „Updates" | 4,38:1 |
| 3 | `#5B3B7A` | Bucket „Strategie" | 8,93:1 |
| 4 | `#B8860B` | Bucket „Event" | 3,25:1 |
| 5 | `#B8336A` | Bucket „Karriere" | 5,65:1 |
| 6 | `#6B6B6B` | Neutral | 5,33:1 |

Bewusst **nicht** in der Datenpalette: das Marken-Teal `#117865` (bleibt
exklusiv im Chrome — sonst ist unklar, ob Teal „Marke" oder „Serie 3"
bedeutet) und `#2A857A` (zu nah am Marken-Teal).

## Typografie (Segoe UI; Skala für 1920×1080)

| Rolle | Größe | Schnitt |
| --- | --- | --- |
| Seitentitel | 24 pt | Semibold |
| Visual-Titel | 14 pt | Semibold |
| KPI-Wert (callout) | 32 pt | Semibold |
| Achsen/Labels | 11–12 pt | Regular |
| Fußleiste | 10 pt | Regular, `ink-mute` |

Die Webseite nutzt Fraunces/Geist/JetBrains Mono — im Power-BI-Service
nicht zuverlässig verfügbar, daher Segoe UI als verbindliche Report-Schrift.
Wer die Marken-Fonts lokal installiert hat, kann Titel auf Fraunces stellen;
dann im Team dokumentieren (Fallback bleibt Segoe UI).

## Layout (Variante A · Kopfband, Filter rechts)

```
┌──────────────────────────────────────────────────────────────────────┐
│ Seitentitel (24pt)        [Übersicht][Detail][Trend]     [DATEN-WG]  │ Kopfband 80px, weiß
├────────────────────────────────────────────────────────┬─────────────┤
│  KPI 1      KPI 2      KPI 3      KPI 4                │             │
│ (384×144)  (384×144)  (384×144)  (384×144)             │   Filter-   │
│                                                        │   Panel     │
│  ┌───────────────────────────────┐  ┌──────────────┐   │   240px     │
│  │   Haupt-Visual (1024×552)     │  │    Detail    │   │             │
│  │                               │  │  (560×552)   │   │  [Reset]    │
│  └───────────────────────────────┘  └──────────────┘   │             │
│  Leiste unten (1608×192) — Tabelle/Zeitachse           │             │
├────────────────────────────────────────────────────────┴─────────────┤
│ Stand: <Datum> · Quelle: <System> · Kontakt: Daten-WG                │ Fußleiste 32px
└──────────────────────────────────────────────────────────────────────┘
```

- **Kopfband** weiß (`#FFFFFF`), untere Trennlinie 1 px `line` — das
  S/W-Comic-Logo braucht hellen Grund. **Logo klein rechts:** 80×40 px bei
  x=1816, y=20 (Wunsch: rechte Ecke). Aktiver Nav-Button: Grund `accent`,
  Text Weiß (Buttons enden bei x=1792, 24 px Abstand zum Logo).
- **Raster:** 8-px-Basis, Außenrand 24, Gutter 24. Exakte Koordinaten:
  `zones.json` / `AGENT-BRIEF.md`.
- **modern-soft:** keine Schatten, weiße Kacheln mit `line`-Kontur und
  Radius 8 auf cremefarbenem Grund.

## Do / Don't

| Do | Don't |
| --- | --- |
| Teal nur für Interaktion/Hervorhebung | Teal als Chartfarbe |
| Ein Haupt-Visual je Seite (Slot `haupt-visual`) | 8 gleichgroße Charts |
| Deltas mit Vorzeichen/Pfeil **und** Farbe | nur Rot/Grün |
| Kacheln exakt auf Slot-Koordinaten | Freihand-Platzierung |
| Titel als Botschaft | „Sum of Umsatz by Monat" |

## Accessibility

WCAG AA erfüllt (Belege oben). Mindestgröße 10 pt (Fußleiste), sonst ≥ 11 pt.
Tab-Reihenfolge = Lese-Reihenfolge (Titel → KPI 1–4 → Haupt → Detail →
Leiste unten); Logo und Deko-Shapes aus der Tab-Reihenfolge nehmen.
Alt-Text je Visual: die Botschaft, nicht der Chart-Typ.
