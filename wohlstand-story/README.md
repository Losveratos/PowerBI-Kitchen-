# Zwei Heimaten · Köln, die Lausitz und der Rest der Welt

Scrollytelling-Datenstory aus dem [Wohlstandsatlas](../wohlstandsatlas.html), erzählt aus der Sicht von Michael Tenner:
Köln und der Oberspreewald-Lausitz-Kreis liegen in Deutschland weit auseinander (Rang 28 und 307 von 400 Kreisen),
in der Welt stehen beide weit oben. Geschwister-Stück zu `rhein-story.html` und `koelner-raser-story.html`
(gleiches Designsystem, gleiche Scrolly-Mechanik).

Ergebnis: [`/zwei-heimaten.html`](../zwei-heimaten.html) · Markdown-Fassung: [`/md/zwei-heimaten.md`](../md/zwei-heimaten.md)

## Pipeline

```bash
python3 -I wohlstand-story/scripts/build_story_data.py  # Atlasdaten → data/story_data.json
python3 -I wohlstand-story/scripts/build_story_html.py  # story_template.html + JSON → ../zwei-heimaten.html
python3 -I wohlstand-story/scripts/check_numbers.py     # prüft die im Text ausgeschriebenen Zahlen gegen story_data.json
python3 -I wohlstand-story/scripts/build_md.py          # Text der Story → ../md/zwei-heimaten.md (danach scripts/build_llms_full.py)
```

**Regel:** Jede Zahl der Story stammt aus `data/story_data.json`, und die entsteht ausschließlich per Skript aus
`wohlstandsatlas/atlas-data.js`, also aus denselben Daten wie der Atlas. Ändern sich die Atlasdaten, alle drei Schritte
neu laufen lassen; `check_numbers.py` meldet jede Zahl im Text, die nicht mehr passt.

## Ordner

```
wohlstand-story/
├── story_template.html   ← Seite (HTML/CSS/JS, Platzhalter /*__DATA__*/null für die Daten)
├── data/story_data.json  ← verdichtete Kennzahlen, Weltkurve, Quadrate, Deutschlandkarte (Kreispfade), Suchliste
└── scripts/              ← build_story_data / build_story_html / check_numbers / build_md
```

## Kennzahlen und Definitionen

- **BIP pro Kopf (KKP), 2024, internationale Dollar.** Regionen = Anteil an BIP und Bevölkerung laut Statistikamt
  (Deutschland: Eurostat NUTS-3 2023) × Weltbank-Landeswert 2024.
- **„x % der Menschheit leben in ärmeren Regionen“:** Einwohner aller Einheiten der feinsten Ebene mit niedrigerem
  BIP pro Kopf, geteilt durch die Weltbevölkerung (inkl. 39 Mio. ohne Daten im Nenner). Der Härtetest rechnet dasselbe
  auf allen vier Ebenen des Atlas.
- **Quadrate:** 1 Quadrat = 5 Mio. Menschen; jedes Quadrat bekommt die Einheit, in der seine Bevölkerungsmitte liegt.
  Kleine Länder können deshalb in der Quadrat-Ansicht fehlen, die Summen im Text sind exakt gerechnet.
- **Luftlinie:** Rathaus Köln bis Rathaus Senftenberg (Kreisstadt OSL), Großkreis.

## Quellen

Weltbank WDI (2024), IWF WEO (Oktober 2026), Eurostat (NUTS-3, regionale Haushaltseinkommen), regionale Preisniveaus
der deutschen Kreise (Regionaler Preisindex 2022, BBSR/IW); Grenzen: Eurostat GISCO. Details und alle weiteren Länder: Methodik des Wohlstandsatlas.
