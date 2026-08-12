# Branding-Extraktion — Farben & Schrift aus einer Quelle ableiten

Ziel: aus dem, was der Nutzer schon hat (Präsi, Webseite, Logo), eine
belastbare Palette ableiten — statt ihn nach Hexwerten zu fragen. Das ist
der „native Einstieg": Quelle geben reicht.

Ergebnis der Extraktion ist immer dasselbe Set von **Farbrollen**:

| Rolle       | Zweck                                  | Herkunft                         |
| ----------- | -------------------------------------- | -------------------------------- |
| `ink`       | Text, Titel                            | dunkelste Marken-/Textfarbe      |
| `accent`    | Interaktion, aktive Nav, Hervorhebung  | Primär-/Markenfarbe              |
| `bg`        | Seiten-Hintergrund (leicht getönt)     | abgeleitet: fast-weiß mit Stich Richtung ink/accent |
| `bg-card`   | Kachel-Hintergrund                     | meist reines Weiß                |
| `grau-leiter` | Sekundärtext, Linien, Panel-Flächen  | aus `ink` abgestuft (nicht reines Grau) |
| `dataColors`| Serienfarben (6–8)                     | accent-kompatibel, farbfehlsicht-tauglich |

## Quelle: Firmen-Präsentation (`.pptx`)

Das Office-Theme steckt als XML im Paket — kein Screenshot-Raten nötig:

```bash
unzip -p praesi.pptx ppt/theme/theme1.xml | grep -o 'srgbClr val="[0-9A-Fa-f]\{6\}"' | sort | uniq -c | sort -rn
```

Interpretation der Theme-Slots in `theme1.xml` (`<a:clrScheme>`):
`dk1`/`dk2` → Ink-Kandidaten, `accent1` → Akzent-Kandidat, `accent2–6` →
Datenfarben-Kandidaten, `lt1`/`lt2` → Hintergründe. Zusätzlich lohnt ein
Blick auf die Master-Folie (Logo dort oft eingebettet:
`unzip -l praesi.pptx | grep media`). Bei `.pdf`-Präsentationen: Seiten als
Bild rendern und wie beim Logo (unten) die dominanten Farben ziehen.

## Quelle: Webseite (URL)

1. HTML + CSS holen (WebFetch oder `curl`), nach Farbdefinitionen suchen:
   CSS-Variablen (`--primary`, `--brand`, `:root`-Block), `theme-color`-Meta-
   Tag, häufigste Hexwerte in Stylesheets.
2. Häufigkeit zählen; Navigations-/Button-Farben sind meist die Markenfarbe.
3. Logo-URL aus dem `<img>`/SVG im Header ziehen — SVG enthält Hexwerte
   direkt im Text.
4. Unklarheiten (z. B. drei Blau-Kandidaten) → als offene Entscheidung mit
   den Hexwerten und Fundort („Nav-Hintergrund vs. Button vs. Link") vorlegen.

## Quelle: Logo-Datei (Bild)

Dominante Farben per Pixel-Statistik (Python + Pillow, im Zweifel inline):

```python
from PIL import Image
from collections import Counter
img = Image.open("logo.png").convert("RGBA").resize((64, 64))
px = [p[:3] for p in img.getdata() if p[3] > 128]          # transparent raus
common = Counter(px).most_common(12)                        # dann Weiß/Schwarz-Nähe filtern
```

Cluster nahe Weiß (#F0+) und nahe Schwarz als BG/Ink-Hinweise werten, die
kräftigste verbleibende Farbe als Akzent-Kandidat.

## Keine Quelle → neutrale moderne Palette

Default anbieten (funktioniert, AA-geprüft, unaufgeregt):
`ink #1F2937` · `accent #2563EB` · `bg #FAFAFB` · `bg-card #FFFFFF` ·
Sekundärgrau `#6B7280`. Der Nutzer kann jede Rolle später tauschen — die
Rollen-Struktur bleibt.

## Ableitungsregeln (Quelle → Rollen)

1. **Akzent:** die eine Markenfarbe. Wenn die Marke mehrere hat: die mit der
   stärksten Interaktions-Assoziation (Button-/Link-Farbe der Webseite).
2. **Ink:** dunkelste Textfarbe der Quelle; wenn nur „Schwarz" existiert,
   leicht Richtung Akzent tönen (z. B. sehr dunkles Blau statt #000) —
   wirkt moderner und bleibt AA-konform.
3. **Grauleiter:** `ink` in 4–5 Stufen Richtung `bg` aufhellen
   (`check_contrast.py --ladder` erzeugt sie). Reine Grautöne neben getöntem
   Ink wirken schmutzig.
4. **bg:** fast-weiß mit minimalem Stich der Marke (1–3 % Sättigung).
5. **dataColors:** Akzent als erste Serie nur, wenn er sich von Rot/Grün-
   Semantik fernhält; Rest als abgestimmte, unterscheidbare Palette. Bei
   IBCS-Reports stattdessen die IBCS-Semantik (siehe design-rules.md §6).

## Pflicht: Kontrast-Validierung

Jede abgeleitete Kombination durch das Skript:

```bash
python scripts/check_contrast.py "#1F2937" --bg "#FAFAFB"        # Einzelpaar
python scripts/check_contrast.py --palette design-out/palette.json  # alle Rollen-Paare
python scripts/check_contrast.py --ladder "#1F2937" --bg "#FAFAFB"  # Grauleiter erzeugen
```

Das Skript meldet PASS/FAIL gegen AA (4,5:1 Text, 3:1 groß/UI) und schlägt
bei FAIL automatisch die nächstliegende bestehende Variante vor (abgedunkelt/
aufgehellt). **Corporate-Farbe reißt AA?** → angepasste Variante verwenden,
Original nur für große Flächen/Logos, Abweichung in der DESIGN-SPEC
dokumentieren („Markenblau #4F8FE0 → Text-Variante #2B6CB8, 4,6:1").

`palette.json`-Format für den Palette-Modus:

```json
{ "ink": "#1F2937", "accent": "#2563EB", "bg": "#FAFAFB", "bg-card": "#FFFFFF",
  "pairs": [["ink","bg"], ["ink","bg-card"], ["accent","bg"]] }
```
