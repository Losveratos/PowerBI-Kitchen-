# Daten-WG · Knowledge Kitchen

Statische Single-Page, die alle Videos vom YouTube-Kanal [@Daten-WG](https://www.youtube.com/@Daten-WG)
thematisch in 9 Buckets sortiert. Inklusive Tag-Filter, Volltextsuche (auch in Auto-Transkripten),
lazy-loaded YouTube-Embeds und Kapitel-Sprungmarken aus den Video-Beschreibungen.

**Stand:** 72 Folgen · v 3 · Channel-Guide

## Live-Version

→ **https://losveratos.github.io/PowerBI-Kitchen-/**

(Aktiv ab dem ersten erfolgreichen GitHub-Pages-Build. Falls 404: in
Repo-Settings → Pages prüfen, ob `main` / root als Source gewählt ist.)

## Lokal anschauen

```
python -m http.server 8000
# Browser: http://localhost:8000/
```

`index.html` und `daten_wg_learn_buckets.html` sind identisch — die `index.html`
ist nur für GitHub Pages, damit die Root-URL direkt funktioniert.

## Daten aktualisieren

Wenn neue Folgen veröffentlicht wurden:

```
python scripts/fetch_videos.py    # holt nur neue Videos (Cache greift)
python scripts/classify.py        # klassifiziert in Buckets, extrahiert Kapitel
node   scripts/extract_existing.js
python scripts/build_html.py      # mergt, schreibt HTML + index.html
node   scripts/validate_html.js   # Sanity-Check
```

Dann committen und pushen:

```
git add -A
git commit -m "Update: neue Folgen vom YouTube-Kanal"
git push
```

GitHub Pages liefert nach dem Push automatisch die neue Version aus
(meist innerhalb 1–2 Minuten).

## Pipeline-Details

Siehe [PowerBIhub.md](PowerBIhub.md) für die komplette Doku der Build-Pipeline:
Heuristik-Regeln, Bucket-Reihenfolge, Merge-Strategie, Fallstricke.

## Was wird NICHT versioniert

Siehe [.gitignore](.gitignore). Kurz:

- `videos_*.json` (yt-dlp Caches, regenerierbar)
- `existing_episodes.json`, `.episodes_range.json` (Build-Zwischenstände)
- `daten_wg_learn_buckets.backup.html` (lokales Pre-Build-Backup)

## Lizenz

Der Code in diesem Repository (inkl. der Power-BI-Custom-Visuals) steht unter
der [MIT-Lizenz](LICENSE): Nutzung, Änderung und Weitergabe sind frei — auch
kommerziell —, solange der Autor-/Copyright-Hinweis
(© Michael Tenner · PowerBI Kitchen) erhalten bleibt.
Video-Inhalte gehören dem Daten-WG-Kanal.
