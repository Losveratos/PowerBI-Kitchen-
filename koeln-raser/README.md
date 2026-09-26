# Köln blitzt · Raser-Atlas 2025

Scrollytelling-Datenstory zur Geschwindigkeitsüberwachung der Stadt Köln 2025 —
Geschwister-Stück zu `rhein-story.html` (gleiches Designsystem, gleiche Scrolly-Mechanik).

Ergebnis: [`/koelner-raser-story.html`](../koelner-raser-story.html)

## Versionen

Frühere Fassungen bleiben unverändert im Repo liegen, damit die Entwicklung sichtbar bleibt.

| Version | Datei | Stand |
|---|---|---|
| v1 | [`/koelner-raser-story-v1.html`](../koelner-raser-story-v1.html) | 25.09.2026 · sechs Akte, Ausreißer, Atlas; Hero mit Blitzpunkten |
| v2 | [`/koelner-raser-story-v2.html`](../koelner-raser-story-v2.html) | 26.09.2026 · Hero „Lichtspuren“ (Stichprobe echter Fälle als Langzeitbelichtung) |
| v3 | [`/koelner-raser-story.html`](../koelner-raser-story.html) | laufend · Karten-Akt „Köln bei Nacht“ (Akt 4): alle Messstellen an ihren Orten, 24-Stunden-Zeitraffer, Stadtteil-Karte; Akte 4–6 → 5–7 |

## Pipeline

```bash
python3 koeln-raser/scripts/build_db.py          # Rohdaten → data/raser_2025.sqlite
python3 koeln-raser/scripts/build_story_data.py  # SQL-Abfragen + Karte (build_map_data.py) → data/story_data.json
python3 koeln-raser/scripts/build_story_html.py  # story_template.html + JSON → ../koelner-raser-story.html
```

Die Karte baut nur aus Dateien in `data/geo/` (kein Netz). Diese Geodaten entstehen einmalig **lokal**:

```bash
python3 koeln-raser/scripts/fetch_geo.py         # Geoapify (Key nur aus GEOAPIFY_KEY) + OSM/Overpass
python3 koeln-raser/scripts/check_geo.py --korrekturen   # unabhängiger OSM-Abgleich → manual_coords.csv
```

Koordinaten: `manual_coords.csv` hat Vorrang vor dem Geocoder (Spalte `genauigkeit`: hausnummer/strasse/manuell;
leeres lat/lon = weggelassen). Von Hand gepflegte Zeilen überschreibt `check_geo.py` nie.

**Regel:** Jede Zahl der Story stammt aus `data/story_data.json`, und die entsteht
ausschließlich per SQL aus den Rohdaten.

## Ordner

```
koeln-raser/
├── story_template.html     ← Seite (HTML/CSS/JS, Platzhalter für die Daten)
├── data/
│   ├── raw/                ← Originaldateien Offene Daten Köln (Fall-CSV gepackt als .csv.gz)
│   ├── geo/                ← Kfz-Kürzel (npm, CC BY 3.0), Karten- und Geocodierungsdaten (OSM, Geoapify) + SOURCES.md
│   ├── bussgeld_2025.json  ← Bußgeldkatalog Pkw (BKatV) für die Schätzung
│   └── story_data.json     ← verdichtete Kennzahlen für die Seite
├── research/kontext.md     ← Kontext-Recherche mit Konfidenzstufen
└── scripts/                ← build_db / build_story_data / build_map_data / build_story_html
                               + fetch_geo / check_geo / geo_util (Geodaten, nur lokal)
```

`data/raser_2025.sqlite` wird nicht versioniert (per Skript in ~5 s erzeugt).
Tabellen: `verstoss` (451.676 Zeilen), `standort` (2.504), `monat_kontrolle`.

## Quellen & Lizenzen

- Stadt Köln, Offene Daten Köln: „Geschwindigkeitsüberwachung Köln ab 2025“ + Standorttabellen
  sloc-01/02/04/11 — Datenlizenz Deutschland – Zero – 2.0
- npm `german-license-plate-prefixes` — CC BY 3.0
- Bußgeldsätze: Bußgeldkatalog-Verordnung, Tabelle 1 (Stand seit 09.11.2021)
- Karte: © OpenStreetMap-Mitwirkende (ODbL) · Geocodierung: Geoapify

## Bereinigung (Kurzfassung)

- 47 Export-Artefaktzeilen (Kopf, Trennlinie, „N Zeile(n) betroffen“) übersprungen; Monats-Kontrollsummen stimmen
- 5.911 Zeilen ohne Kennzeichen-Feld und einige zweiteilige Sonderkennzeichen normalisiert, 1 unvollständige Zeile verworfen
- K-04 (Kreuzungsanlagen): nur Zeilen mit plausiblem Limit 50/70 als Tempofall (6.016 vermutliche Rotlichtfälle ausgeschlossen) → 445.660 Tempofälle
- Tempolimit = gemessen − Überschreitung − Toleranz (3 km/h bis 100, sonst 3 %)

## Karte & Geocodierung (v3, Kurzfassung)

- 655 Messstellen: 433 punktgenau (Hausnummer oder Kreuzung), 144 auf Straßenebene (höchstens ±1 km),
  52 von Hand verortet, 26 ohne verlässlichen Punkt weggelassen (7.036 Fälle; zählen in den Stadtteilwerten mit)
- Alle 43 festen Anlagen und 12 Kreuzungsanlagen einzeln geprüft (OSM-Adressen, -Kreuzungen, -Anschlussstellen,
  Pressemitteilung der Stadt zur B 55a, öffentliche Standortlisten)
- Geocoder-Treffer zählen nur, wenn Straße und Stadtteil passen (sonst griff er z. B. zur „Kalker Hauptstraße 55“
  statt zur Hauptstraße in Widdersdorf); danach unabhängiger Abgleich gegen 167.551 OSM-Adresspunkte
- Kartendaten im HTML: ~65 KB (Budget 250 KB)
