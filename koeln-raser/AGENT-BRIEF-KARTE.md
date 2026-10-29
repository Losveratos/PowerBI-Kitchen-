# Agent-Brief · Karten-Akt „Köln bei Nacht“ (Raser-Story v3)

> Übergabe an einen **lokal** laufenden Agenten (Claude Code auf dem Rechner des Autors).
> Grund: Die Cloud-Umgebung, in der v1/v2 entstanden sind, darf Geoapify, OpenStreetMap/Overpass
> und die Portale der Stadt Köln nicht erreichen. Lokal geht das.

## 1 · Ziel

Die Story `koelner-raser-story.html` bekommt einen **Karten-Akt**: Köln als dunkle Silhouette
mit leuchtendem Rhein und Straßennetz, darauf alle Messstellen an ihren echten Orten.
Ergebnis ist **Version 3** der Story, gebaut mit derselben Pipeline, geprüft, committet und gepusht.

## 2 · Stand (bitte zuerst lesen)

| Datei | Rolle |
|---|---|
| `koeln-raser/README.md` | Überblick, Pipeline, Versionstabelle |
| `koeln-raser/story_template.html` | die Seite (HTML/CSS/JS); `/*__DATA__*/null` wird beim Build durch JSON ersetzt |
| `koeln-raser/scripts/build_db.py` | Rohdaten (`data/raw/*.csv.gz`) → `data/raser_2025.sqlite` |
| `koeln-raser/scripts/build_story_data.py` | SQL-Kennzahlen → `data/story_data.json` |
| `koeln-raser/scripts/build_story_html.py` | Template + JSON → `/koelner-raser-story.html` |
| `koeln-raser/scripts/fetch_geo.py` | **neu, noch nie gegen echte APIs gelaufen**: Geocodierung + Grenzen + OSM |
| `koelner-raser-story-v1.html` | Version 1 (unverändert archiviert) |
| `rhein-story.html` | Design-Vorbild (Geschwister-Story) |

Versionen: v1 = erste Fassung, v2 = aktuelle `koelner-raser-story.html` (Hero „Lichtspuren“).
Branch: **`claude/dreamy-fermat-dqnb5g`**.

Wichtige Konventionen, die schon gelten:
- **Keine Zahl im HTML, die nicht aus `data/story_data.json` kommt** (per SQL erzeugt).
- Keine Chart-Bibliothek: handgebautes SVG/Canvas, Helfer `el()`, `txt()`, `hover()`, `stage()` im Template.
- Farben nach Aufgabe: Amber `#c2831a` = feste Anlagen (S-01), Blau `#3987e5` = mobile Messung (S-02),
  Rot-Rampe `--sev1 #a65454` → `--red #e66767` = Schwere (≥ 21 / ≥ 31 km/h zu viel). Herkunft: Blau-Rampe `--o1…--o4`.
- Textfarbe in SVG immer über `txt(…, {fill:…})` setzen (CSS `svg text{fill}` schlägt das Attribut, `txt` setzt einen Inline-Style).
- Zwei Geometrien: Desktop 1060×600, Mobil (`MOB`, ≤ 760 px) 640×760 — jede Grafik rechnet aus `W`, `H`, `M`.
- Scrollytelling-Mechanik wie `rhein-story.html`: `<section class="scrolly" data-act="N">`, Steps mit `data-idx`, `ACTS`-Map unten.
- Messarten sind aus dem Verhalten der Daten gedeutet (S-01 fest, S-02 mobil, K-04 Kreuzung) — nicht als amtlich darstellen.

## 3 · Schritte

### A · Setup
```bash
git fetch origin && git checkout claude/dreamy-fermat-dqnb5g && git pull
export GEOAPIFY_KEY=…        # Windows cmd: set GEOAPIFY_KEY=…   PowerShell: $env:GEOAPIFY_KEY="…"
python3 koeln-raser/scripts/build_db.py
```
Der Key kommt **nur** aus der Umgebungsvariable. Nie ausgeben, nie in Dateien, Logs oder Commits schreiben.
Hinweis: Der bisherige Key stand in einem Chatverlauf — besser vorher bei Geoapify einen neuen erzeugen.

### B · Geodaten holen
```bash
python3 koeln-raser/scripts/fetch_geo.py            # alles; einzeln: --nur geocode|grenzen|osm
python3 koeln-raser/scripts/fetch_geo.py --testlauf # nur Adress-Bereinigung ansehen, ohne Netz
```
Das Skript ist offline getestet (Adress-Bereinigung an allen 656 Standorten, Ablauf mit Attrappen),
aber **nicht gegen die echten APIs**. Wenn etwas bricht: Ursache in `fetch_geo.py` beheben, nicht umgehen.
Bekannte Unsicherheiten:
- `step_boundaries`: Ob `/v1/boundaries/consists-of` mit `sublevel=2` wirklich die **86 Stadtteile** liefert,
  ist ungeprüft. Liefert es nur Bezirke oder nichts: Stadtteile per Overpass holen
  (`area["name"="Köln"]["admin_level"="6"]` → `relation["boundary"="administrative"]["admin_level"="10"](area)`,
  `out geom;`) und Ringe aus den Member-Ways zu Polygonen zusammensetzen. Namen mit den `ort`-Werten
  der mobilen Messstellen abgleichen (Schreibweisen wie „Neustadt/Nord“ vs. „Neustadt-Nord“ normalisieren).
- Rate-Limit Free Tier: 5 Anfragen/s — das Skript wartet 0,22 s pro Anfrage; der Cache
  `data/geo/geocode_cache.json` erlaubt Fortsetzen (ist in `.gitignore`, nicht committen).

### C · Koordinaten prüfen (wichtig, nicht überspringen)
`data/geo/messstellen_review.csv` öffnen. **Alle 43 festen Anlagen (S-01) und 12 Kreuzungen (K-04)
einzeln prüfen** (OSM-Link in der CSV), bei den 600 mobilen Stichproben + alles mit `genauigkeit` ≠ `hausnummer`.
Heikel sind vor allem:
- B 55a: `0001`, `0002`, `0015` (Ausfahrt Frankfurter Straße → Olpe; die wichtigste Anlage der Story)
- Innere Kanalstraße: `0005`–`0010` (Laternen-/Kreuzungsangaben, keine Hausnummern)
- A 4 Anschluss Köln-Eifeltor: `0095`, `0096` · Zoobrücke `0003`, `0004`, `0012`, `0013` · Severinsbrücke `0011`
- Aachener Straße am Aachener Weiher `0016`, `0017` · Venloer Straße/B 59 an der A 1 `7043`–`7045`
- Straßen ohne Hausnummer (Geocoder liefert irgendeinen Punkt auf langen Straßen)

Korrekturen in **`data/geo/manual_coords.csv`** (`dienststelle,code,lat,lon,notiz`). Die Datei gibt es noch nicht —
anlegen, und der Build muss sie **vorrangig** vor der Geocodierung verwenden (Merge ist noch nicht implementiert).
Messstellen ohne verlässlichen Punkt lieber weglassen (und zählen) als falsch zeigen.

### D · Kartendaten in die Pipeline
Neues Skript `koeln-raser/scripts/build_map_data.py` (oder Erweiterung von `build_story_data.py`), das
**nur aus Dateien** baut (kein Netz), damit der Cloud-Agent später weiterbauen kann:
- Koordinaten: `messstellen_geocoded.json` + `manual_coords.csv` → je Messstelle `x, y` in einer festen
  Projektion (Web-Mercator oder äquidistant mit cos(Breite)); Kennzahlen aus `story_data.json` übernehmen
  (`n`, `pt`, `p21`, `k`, `h[24]`, `lim`, `von`, `bis`).
- Stadtgrenze, Stadtteile, Rhein, Autobahn/Trunk/Primary als **vereinfachte** SVG-Pfade (Douglas-Peucker,
  ca. 10–20 m Toleranz). Budget: Kartendaten zusammen **≤ 250 KB** im HTML.
- Je Stadtteil: Name, Fälle der mobilen Messung, Zahl der Messstellen, Anteil ≥ 21 km/h (nur ausweisen ab
  ≥ 300 Fällen, sonst „zu wenig Fälle“).
- Ergebnis als Abschnitt `karte` in `story_data.json`; Genauigkeits-Statistik (`hausnummer`/`strasse`/`manuell`/`fehlt`) mit ausgeben.

### E · Der Karten-Akt
Einfügen **nach Akt 3 (Die Orte)** als neuer Akt 4 — die folgenden Akte werden zu 5–7 (Überschriften,
Step-Nummern `Akt N / Schritt M`, `data-act`, IDs `g…`/`svg…`, `ACTS`-Map und CSS-Selektoren konsistent umnummerieren).
Vorschlag für die Schritte (Texte aus den Daten ableiten, nichts erfinden):
1. **Die Stadt bei Nacht** — Silhouette, Rhein leuchtend, Straßennetz als feine Lichtlinien; 43 feste Anlagen amber, Fläche ∝ Fälle.
2. **600 Stellen, an denen mobil gemessen wurde** — blaue Punkte kommen dazu; Verteilung über die Stadt.
3. **24 Stunden im Zeitraffer** — Blitze an den echten Orten, Dichte je Messstelle aus ihrem Stundenprofil `h[24]`; Uhr im Bild.
4. **Wo schwer gerast wird** — Stadtteil-Flächen, eine Farbrampe (sequenziell, eine Farbe) für den Anteil ≥ 21 km/h
   bei mobilen Messungen; Stadtteile unter der Mindestfallzahl neutral grau.
Pflicht: Hover **und** Tippen (Tooltip mit Name, Fälle, pro Tag, Ø zu viel, Köln-Anteil), Legende, Mobil-Geometrie,
`prefers-reduced-motion` → Standbild, keine horizontale Scrollbar. Optional: Klick im Raser-Atlas hebt die Messstelle auf der Karte hervor.

### F · Texte, Grenzen, Quellen
- Neue Grenzen-Karte bzw. Appendix-Eintrag „Karte & Geocodierung“: Methode, Genauigkeit (Anteile), manuelle Korrekturen, weggelassene Stellen.
- Footer/Appendix: „Kartendaten © OpenStreetMap-Mitwirkende (ODbL) · Geocodierung: Geoapify“.
- Deutsch, sachlich, keine Kausalbehauptungen über Unfälle; Kennzeichen = Halter, nicht Fahrer.

### G · Versionierung
1. **Vor** der ersten Änderung: aktuelle `koelner-raser-story.html` unverändert als `koelner-raser-story-v2.html` ablegen.
2. Footer-Zeile im Template auf „Version 3 (Karten-Akt) · Entwicklungsstand ansehen: Version 1 · Version 2“ ändern.
3. Versionstabelle in `koeln-raser/README.md` ergänzen.

### H · Prüfen
```bash
python3 koeln-raser/scripts/build_db.py && python3 koeln-raser/scripts/build_story_data.py \
  && python3 koeln-raser/scripts/build_story_html.py
python3 -m http.server 8000   # → http://localhost:8000/koelner-raser-story.html
```
- Browser-Screenshots Desktop 1440×900 und Mobil 390×844 von **jedem Schritt** des Karten-Akts ansehen:
  keine Label-Kollisionen, Schrift mobil ≥ 11 px, Punkte liegen plausibel (Rhein/Innenstadt als Kontrolle).
- Keine JS-Fehler in der Konsole (der Google-Fonts-Zertifikatsfehler in Sandboxes ist bekannt und egal).
- Jede neue Zahl im Text per SQL bzw. aus `story_data.json` gegenprüfen.
- `md/koelner-raser-story.md` um den Karten-Akt ergänzen, dann `python3 scripts/build_llms_full.py`.

### I · Abschluss
Committen und pushen auf `claude/dreamy-fermat-dqnb5g` (kein neuer Branch, kein Force-Push, kein PR ohne Auftrag).
Committen: `data/geo/*` (außer Cache), neue Skripte, Template, gebaute HTML, v2-Archiv, README, md, llms-full.
**Nicht** committen: `GEOAPIFY_KEY`, `geocode_cache.json`, `raser_2025.sqlite`, entpackte Roh-CSV.

## 4 · Akzeptanzkriterien

- [ ] `fetch_geo.py` lief gegen die echten APIs; Fehler im Skript sind behoben und committet
- [ ] alle 43 festen Anlagen und 12 Kreuzungen geprüft; Korrekturen in `manual_coords.csv`
- [ ] Anteil Messstellen mit Punkt ≥ 95 %; fehlende sind gezählt und im Appendix genannt
- [ ] Karten-Akt mit 4 Schritten, Hover + Tippen, Legende, Desktop + Mobil, reduced motion
- [ ] Kartendaten ≤ 250 KB, Seite lädt ohne externe Laufzeit-Abhängigkeiten (außer Google Fonts)
- [ ] Akte korrekt umnummeriert, alle bestehenden Akte funktionieren weiter
- [ ] v2 archiviert, Footer + README-Versionstabelle aktualisiert, Quellen/Lizenz im Footer
- [ ] Pipeline von Rohdaten bis HTML läuft komplett durch; Screenshots gesichtet; Zahlen gegengeprüft
- [ ] gepusht auf `claude/dreamy-fermat-dqnb5g`, kein Key im Repo
