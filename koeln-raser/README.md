# Köln blitzt · Raser-Atlas 2025

Scrollytelling-Datenstory zur Geschwindigkeitsüberwachung der Stadt Köln 2025 —
Geschwister-Stück zu `rhein-story.html` (gleiches Designsystem, gleiche Scrolly-Mechanik).

Ergebnis: [`/koelner-raser-story.html`](../koelner-raser-story.html)

## Pipeline

```bash
python3 koeln-raser/scripts/build_db.py          # Rohdaten → data/raser_2025.sqlite
python3 koeln-raser/scripts/build_story_data.py  # SQL-Abfragen → data/story_data.json
python3 koeln-raser/scripts/build_story_html.py  # story_template.html + JSON → ../koelner-raser-story.html
```

**Regel:** Jede Zahl der Story stammt aus `data/story_data.json`, und die entsteht
ausschließlich per SQL aus den Rohdaten.

## Ordner

```
koeln-raser/
├── story_template.html     ← Seite (HTML/CSS/JS, Platzhalter für die Daten)
├── data/
│   ├── raw/                ← Originaldateien Offene Daten Köln (Fall-CSV gepackt als .csv.gz)
│   ├── geo/                ← Kfz-Kürzel → Zulassungsbezirk (npm, CC BY 3.0) + Quellen
│   ├── bussgeld_2025.json  ← Bußgeldkatalog Pkw (BKatV) für die Schätzung
│   └── story_data.json     ← verdichtete Kennzahlen für die Seite
├── research/kontext.md     ← Kontext-Recherche mit Konfidenzstufen
└── scripts/                ← build_db / build_story_data / build_story_html
```

`data/raser_2025.sqlite` wird nicht versioniert (per Skript in ~5 s erzeugt).
Tabellen: `verstoss` (451.676 Zeilen), `standort` (2.504), `monat_kontrolle`.

## Quellen & Lizenzen

- Stadt Köln, Offene Daten Köln: „Geschwindigkeitsüberwachung Köln ab 2025“ + Standorttabellen
  sloc-01/02/04/11 — Datenlizenz Deutschland – Zero – 2.0
- npm `german-license-plate-prefixes` — CC BY 3.0
- Bußgeldsätze: Bußgeldkatalog-Verordnung, Tabelle 1 (Stand seit 09.11.2021)

## Bereinigung (Kurzfassung)

- 47 Export-Artefaktzeilen (Kopf, Trennlinie, „N Zeile(n) betroffen“) übersprungen; Monats-Kontrollsummen stimmen
- 5.911 Zeilen ohne Kennzeichen-Feld und einige zweiteilige Sonderkennzeichen normalisiert, 1 unvollständige Zeile verworfen
- K-04 (Kreuzungsanlagen): nur Zeilen mit plausiblem Limit 50/70 als Tempofall (6.016 vermutliche Rotlichtfälle ausgeschlossen) → 445.660 Tempofälle
- Tempolimit = gemessen − Überschreitung − Toleranz (3 km/h bis 100, sonst 3 %)
