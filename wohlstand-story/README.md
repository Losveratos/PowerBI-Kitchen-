# Zwei Heimaten · Köln, die Lausitz und der Rest der Welt

Scrollytelling-Datenstory aus dem [Wohlstandsatlas](../wohlstandsatlas.html), erzählt aus der Sicht von Michael Tenner:
Köln und der Oberspreewald-Lausitz-Kreis liegen in Deutschland weit auseinander (Rang 28 und 307 von 400 Kreisen),
in der Welt stehen beide weit oben. Grundaussage seit der Überarbeitung 11/2026: Wir vergleichen uns in Deutschland am oberen
Ende der Welt, und zwischen den beiden Orten ist es enger, als die Rangliste aussieht. Geschwister-Stück zu `rhein-story.html` und `koelner-raser-story.html`
(gleiches Designsystem, gleiche Scrolly-Mechanik).

Ergebnis: [`/zwei-heimaten.html`](../zwei-heimaten.html) · Markdown-Fassung: [`/md/zwei-heimaten.md`](../md/zwei-heimaten.md)

## Pipeline

```bash
python3 -I wohlstand-story/scripts/fetch_sources.py     # nur zum Auffrischen: Originalquellen → data/sources/ (braucht Netz zu Eurostat, Weltbank, Statistikportal)
python3 -I wohlstand-story/scripts/person_model.py      # nur bei neuen Atlasdaten: Überschlag für einzelne Menschen → data/person_model.json (~1 min)
python3 -I wohlstand-story/scripts/build_story_data.py  # Atlasdaten (+ person_model.json, data/sources/) → data/story_data.json
python3 -I wohlstand-story/scripts/build_story_html.py  # story_template.html + JSON → ../zwei-heimaten.html
python3 -I wohlstand-story/scripts/check_numbers.py     # prüft die im Text ausgeschriebenen Zahlen gegen story_data.json
python3 -I wohlstand-story/scripts/build_md.py          # Text der Story → ../md/zwei-heimaten.md (danach scripts/build_llms_full.py)
node wohlstand-story/scripts/check_page.js              # Browser-Test der fertigen Seite (Playwright, startet eigenen Server)
node tools/og-cards/build.js                            # Vorschaubild assets/og/zwei-heimaten.png neu, wenn sich Zahlen ändern
```

**Regel:** Jede Zahl der Story stammt aus `data/story_data.json`, und die entsteht ausschließlich per Skript aus
`wohlstandsatlas/atlas-data.js`, also aus denselben Daten wie der Atlas. Ändern sich die Atlasdaten, alle Schritte
neu laufen lassen; `check_numbers.py` meldet jede Zahl im Text, die nicht mehr passt.

## Bausteine der Seite

- **Vier Akte** mit mitlaufender Grafik (Deutschlandkarte + Rangfolge, Kurve der Menschheit, 1.624 Quadrate, Balken),
  zusammen 15 Schritte (3/4/4/4). Unter 1020 px steht die Grafik oben fest und die Textkarten laufen darunter; bis 760 px zeichnet
  jede Grafik im Hochformat (viewBox 1060 × 1080 statt 1060 × 640).
- **„Eng“ an drei Stellen:** Akt 1 / Schritt 3 (113 Kreise höchstens 10 % von OSL entfernt, Rang 248 bis 361), Akt 4 / Schritt 3
  (verfügbares Einkommen der beiden Kreise: Faktor 1,14 statt 2,2; 179 Kreise höchstens 10 % von OSL entfernt), Akt 4 / Schritt 4
  (Überschlag für einzelne Menschen).
- **Eine Toleranz:** „Auf derselben Stufe“ heißt überall höchstens 10 % über oder unter OSL (`BAND` in `build_story_data.py`):
  bei den Kreisen (Akt 1), bei den Menschen der Welt (Akt 3) und bei der Unsicherheit des Werts (Akt 2: 83 bis 88 %).
- **„Und früher?“** (`#zeit`): Deutschland unter den Ländern 2000 bis 2024 aus den Zeitreihen des Atlas (reales BIP pro Kopf,
  Anteile und Weltdurchschnitt mit der Bevölkerung des jeweiligen Jahres gewichtet, Weltbank `SP.POP.TOTL`):
  so weit oben wie 2000 (92 → 93 %, Platz 22 → 21 von 187 Ländern, Taiwan fehlt), Vorsprung vor dem Weltdurchschnitt vom
  knapp 4-Fachen auf das knapp 3-Fache. Bezug ist bewusst der Durchschnitt: Das „Land des mittleren Menschen“ war 2000 China
  über ein breites Band der Verteilung, der Faktor dazu (12 → 4) überzeichnet die Veränderung.
- **Schätzfrage** vor Akt 2 (`#quiz`): letzter Platz der deutschen Kreise im Weltmaßstab. Die Auflösung und die eigene
  Schätzung erscheinen in Akt 2 / Schritt 5 auf der Kurve (Band „alle 400 Kreise“).
- **„Wo steht deine Heimat?“** (`#you`): ein oder zwei eigene Orte auf der Kurve, mit Faktor und Anteil der Menschheit
  dazwischen. Die Suche verzeiht Umlaut-Schreibweisen und Tippfehler. Der Zustand steht in der Adresse:
  `zwei-heimaten.html#vs=<ID>` oder `#vs=<ID1>,<ID2>` (IDs der Atlas-Einheiten, Spalte `id` der CSV). Der Wohlstandsatlas
  verlinkt so aus der Profilkarte einer Region hierher; umgekehrt führen die Knöpfe unter dem Diagramm mit
  `wohlstandsatlas.html#<ID>--m0--l<Ebene>--z1` in den Atlas (`--z1` = auf die Region zoomen).
- **Vorschaubild** fürs Teilen: `assets/og/zwei-heimaten.png`, erzeugt mit `tools/og-cards/build.js` aus `story_data.json`.

## Ordner

```
wohlstand-story/
├── story_template.html   ← Seite (HTML/CSS/JS, Platzhalter /*__DATA__*/null für die Daten)
├── data/story_data.json  ← verdichtete Kennzahlen, Weltkurve, Quadrate, Deutschlandkarte (Kreispfade), Suchliste
├── data/person_model.json← Ergebnis der Modellrechnung für einzelne Menschen (20 Varianten)
├── data/sources/         ← Originalquellen, aufbereitet (Eurostat, Weltbank, VGR der Länder) + Prüfbericht ABGLEICH.md
└── scripts/              ← fetch_sources / person_model / build_story_data / build_story_html / check_numbers / build_md / check_page
```

## Abgleich mit den Originalquellen

Der Atlas selbst entsteht außerhalb des Repos. Damit die Story nicht nur gegen den Atlas geprüft ist, rechnet
`build_story_data.py` das BIP pro Kopf aller 400 deutschen Kreise aus Eurostat (`nama_10r_3gdp`, `nama_10r_3popgdp`) und dem
Landeswert der Weltbank nach und vergleicht es mit dem Atlas (`checks` in `story_data.json`; Stand 11/2026: höchstens
0,004 % Abweichung, alle Ränge gleich). Aus den Quellen kommen außerdem zwei Größen, die der Atlas nicht hat: das verfügbare
Einkommen je Einwohner auf Kreisebene (VGR der Länder, `income`) und die Bevölkerung der Länder je Jahr (Weltbank, für
„Und früher?“). Einzelheiten und offene Punkte (neuerer Rechenstand der Ämter: Rang 27 und 300; Gini Deutschland) stehen in
`data/sources/ABGLEICH.md`.

## Regeln für den Text

- **Regionen, nicht Menschen:** Prozentwerte zählen Menschen nach dem Durchschnitt ihrer Region. Also „Regionen, in denen
  … wohnen“, nie „… % der Menschen sind ärmer“.
- **Rundung:** ganze Prozent mit „rund/knapp/über“ (85,6 % → „rund 86 %“), Werte in Int.$ mit drei geltenden Stellen wie im
  Atlas (114.620 → 115.000). Eine Nachkommastelle nur in der Gegenprobe unter „Zum Nachprüfen“. Grund: ±5 % beim Wert eines
  kleinen Kreises verschieben den Anteil um rund einen Punkt und den Rang um 30 Plätze.
- **Überschlag:** Aus `person_model.json` kommen nur Aussagen in den Text, die in allen Rechenvarianten gleich ausgehen, mit
  der vorsichtigeren Grenze der Spanne.
- **Farben, je eine Bedeutung:** Amber = Köln, Blau = OSL und „über OSL“, Rot nur der mittlere Mensch, Magenta nur
  „höchstens 10 % von OSL entfernt“ (Akt 1 und Akt 3), Weiß nur China in Akt 3, Graustufen der Karte „je heller, desto
  höher“. Das Farbsystem steht als Kommentar am Kopf des `<style>`-Blocks im Template.
- **Handy:** Beschriftungen in den Grafiken effektiv mindestens 11 px bei 390 px Breite (10 px bei 360 px);
  `check_page.js` misst das je Schritt.

## Kennzahlen und Definitionen

- **BIP pro Kopf (KKP), 2024, internationale Dollar.** Regionen = Anteil an BIP und Bevölkerung laut Statistikamt
  (Deutschland: Eurostat NUTS-3 2023) × Weltbank-Landeswert 2024.
- **„x % der Menschheit leben in Regionen mit niedrigerem BIP pro Kopf“:** Einwohner aller Einheiten der feinsten Ebene mit
  niedrigerem BIP pro Kopf, geteilt durch die Weltbevölkerung (inkl. 39 Mio. ohne Daten im Nenner). Die Gegenprobe in Akt 2
  rechnet dasselbe auf allen vier Ebenen des Atlas.
- **Quadrate:** 1 Quadrat = 5 Mio. Menschen. Der Wert eines Quadrats ist der seiner Bevölkerungsmitte (Platz auf der Skala).
  Das Land wird so verteilt, dass jedes Land so viele Quadrate bekommt, wie es Menschen hat (auf ein Quadrat genau):
  Jedes Quadrat geht an das Land mit dem größten noch nicht vergebenen Bevölkerungsanteil in seinem Abschnitt.
  Kleine Länder können weiter fehlen, die Summen im Text sind exakt gerechnet.
- **Letzter und erster Kreis:** `germany.poorest` / `germany.richest` in `story_data.json`, mit Anteil der Menschheit
  darunter auf der feinsten Ebene.
- **Luftlinie:** Rathaus Köln bis Rathaus Senftenberg (Kreisstadt OSL), Großkreis.

## Quellen

Weltbank WDI (2024), IWF WEO (Oktober 2026), Eurostat (NUTS-3, regionale Haushaltseinkommen), regionale Preisniveaus
der deutschen Kreise (Regionaler Preisindex 2022, BBSR/IW); Grenzen: Eurostat GISCO. Details und alle weiteren Länder: Methodik des Wohlstandsatlas.
