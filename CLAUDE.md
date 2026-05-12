# Daten-WG Learn Buckets · Channel-Guide

> **Ziel:** Alle ~100+ Videos vom YouTube-Kanal [@Daten-WG](https://www.youtube.com/@Daten-WG)
> automatisch holen, thematisch in 9 Learn Buckets clustern, und in eine bestehende
> HTML-Seite einbinden — mit Tags, Volltextsuche, lazy-loaded YouTube-Embeds und
> Kapitel-Sprungmarken aus den Video-Beschreibungen.

---

## Quick Start für Claude Code

Workspace-Layout, das du erwarten solltest:

```
projekt/
├── CLAUDE.md                          ← diese Datei
├── daten_wg_learn_buckets.html        ← bestehende HTML mit 30 Folgen, soll erweitert werden
├── power_bi_einsteiger_guide_v4.html  ← Design-Referenz (nur lesen, nicht ändern)
└── scripts/                           ← legst du selber an
    ├── fetch_videos.py
    ├── classify.py
    └── build_html.py
```

**Eine-Zeilen-Auftrag an dich (Claude Code):**
> Lies diese `CLAUDE.md` vollständig, dann führe alle Phasen durch (1 → 5).
> Mach Zwischenstände nach jeder Phase als Commit oder Backup-Datei, damit ich
> auch bei Abbruch nicht von vorne anfangen muss.

---

## Phase 1 · Daten holen

### Tools installieren

```bash
pip install yt-dlp
# ffmpeg nur falls Transkripte gewollt (Phase 3 optional)
# brew install ffmpeg     # macOS
# choco install ffmpeg    # Windows
# apt install ffmpeg      # Linux
```

### Channel ziehen

```bash
yt-dlp \
  --flat-playlist \
  --dump-single-json \
  --skip-download \
  "https://www.youtube.com/@Daten-WG/videos" \
  > videos_flat.json
```

**Falls 403 / Sign-in required:**

```bash
yt-dlp \
  --cookies-from-browser chrome \
  --flat-playlist \
  --dump-single-json \
  "https://www.youtube.com/@Daten-WG/videos" \
  > videos_flat.json
```

`--flat-playlist` liefert pro Video nur `id`, `title`, `duration`, `upload_date`,
keine vollständige Beschreibung. Daher Phase 2.

### Beschreibungen + Kapitel holen

Für jedes Video aus `videos_flat.json`:

```bash
yt-dlp \
  --skip-download \
  --write-info-json \
  --no-write-thumbnail \
  -o "data/videos/%(id)s.%(ext)s" \
  "https://www.youtube.com/watch?v=VIDEO_ID"
```

Oder besser: Batch in einem Rutsch via Python `yt_dlp` als Library
(kein Subprocess pro Video). Beispiel-Skript siehe `scripts/fetch_videos.py`
unten.

### Datenstruktur, die wir am Ende brauchen (`videos.json`)

```json
[
  {
    "id": "z4ZeHPzIeeU",
    "title": "Wie war die Daten-WG? | Im Gespräch mit Artur König",
    "guest": "Artur König",
    "solo": false,
    "date": "März 2025",
    "duration": "20 min",
    "lang": "DE",
    "desc": "Kurzbeschreibung 2-3 Sätze.",
    "tags": ["Event", "Konferenz", "Köln", "DE"],
    "ytId": "z4ZeHPzIeeU",
    "bucket": "bucket-9",
    "chapters": [
      ["00:00", "Intro"],
      ["02:30", "Wie kommt es zur Idee?"]
    ],
    "podcastUrl": null
  }
]
```

---

## Phase 2 · Klassifizierung in Buckets

Es gibt 9 Buckets. Jedes Video bekommt **genau einen** Bucket. Regel: Erste
passende Heuristik gewinnt (Reihenfolge wichtig).

| ID         | Name                  | Farbe (CSS-Var) | Trigger-Stichworte im Titel (case-insensitive)                                                              |
| ---------- | --------------------- | --------------- | ----------------------------------------------------------------------------------------------------------- |
| `bucket-1` | Updates & News        | `--c-update`    | `quarterly`, `update`, `monatlich`, `power bi update`, `fabric update`, `news`                              |
| `bucket-2` | Microsoft Fabric      | `--c-fabric`    | `fabric`, `lakehouse`, `onelake`, `direct lake`, `f-sku`, `warehouse` (sofern nicht Data Vault)             |
| `bucket-3` | Datenmodellierung     | `--c-model`     | `modell`, `model`, `dax`, `stern`, `vault`, `metadat`, `tabellen`, `relationship`                           |
| `bucket-4` | Self-Service / Governance | `--c-gov`   | `self-service`, `governance`, `citizen`, `shadow it`, `compliance`, `prinzipien`                           |
| `bucket-5` | Visualisierung & IBCS | `--c-viz`       | `ibcs`, `chart`, `visual`, `deneb`, `vega`, `dashboard design`, `writeback`, `boring charts`                |
| `bucket-6` | Power BI Deep Dive    | `--c-pbi`       | `power bi`, `pbix`, `qlik`, `tableau`, `vergleich`, `10 jahre`, sonst Default für Power-BI-lastige Folgen   |
| `bucket-7` | Karriere & Community  | `--c-career`    | `karriere`, `community`, `user group`, `mvp`, `mensch`, `journey`, `from … to`, `passion`, `oracle`         |
| `bucket-8` | Strategie & Big Picture | `--c-strategy` | `digitalisierung`, `strategie`, `transformation`, `mittelstand`                                            |
| `bucket-9` | Event · Daten-WG      | `--c-event`     | `daten-wg 2025`, `daten-wg 2026`, `konferenz`, `event`, `pre-event`, `rückblick`                            |

**Fallback:** Wenn keine Heuristik greift → `bucket-6` (Power BI Deep Dive)
als Default, plus Tag `"Unsortiert"`, damit ich das manuell prüfen kann.

**Tag-Generierung:** Für jeden Treffer das passende Stichwort als Tag
mitnehmen, plus die Sprache (DE/EN — entscheiden über Titel-Detection:
viele englische Wörter ohne deutsche Artikel → EN).

---

## Phase 3 · Kapitel aus Beschreibungen extrahieren (optional aber wichtig)

Die meisten Daten-WG-Beschreibungen enthalten Timestamps im Format `MM:SS Titel`
oder `H:MM:SS Titel`, eine pro Zeile. Regex:

```python
import re
CHAPTER_RX = re.compile(
    r"^\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—:]?\s*(.+?)\s*$",
    re.MULTILINE
)

def extract_chapters(description: str) -> list[tuple[str, str]]:
    return [
        (m.group(1), m.group(2).strip())
        for m in CHAPTER_RX.finditer(description)
        if not m.group(2).startswith(("http", "Links", "Quellen"))
    ]
```

Wenn yt-dlp `chapters` als strukturierte Daten zurückgibt (manche Videos
haben das), nimm die — sonst Regex auf Description.

---

## Phase 4 · HTML-Update

Die bestehende `daten_wg_learn_buckets.html` enthält am Ende einen
`<script>`-Block mit einer Konstante `const EPISODES = [...]` (rund 30 Einträge).
Das ist die einzige Stelle, die du anpassen musst.

### Strategie

1. Datei parsen, `const EPISODES = [` finden, das schließende `];` für diesen
   spezifischen Array finden (am besten via balanciertem Klammer-Match).
2. Bestehende EPISODES-Einträge mit den neuen mergen — **deduplizieren via
   `ytId`** (falls schon vorhanden → bestehender Eintrag gewinnt, weil der
   ggf. manuell schöngeschriebene Beschreibungen hat).
3. Komplettes Array (alt + neu, sortiert nach `bucket` und `date` absteigend)
   zurückschreiben.
4. Im Header das Meta updaten: `<strong>v 3 · Channel-Guide</strong>`
   und die Folgen-Anzahl (`30 Folgen` → tatsächliche neue Zahl).
5. Die 9 Bucket-Tile-Counts (`<div class="bucket-tile-count">N Folgen</div>`)
   neu berechnen und ersetzen.
6. Im Filterbar `<strong id="result-count">30</strong> von 30 Folgen` updaten.
7. Im Orientation-Text die "30 Folgen" und "14 detaillierte Kapitel" Zahlen
   refreshen.

### JS-Schema (eines Episode-Objekts), das bereits unterstützt wird

```javascript
{
  bucket: 'bucket-2',        // bucket-1 ... bucket-9
  title: 'Episode-Titel',
  guest: 'Gast-Name',
  solo: false,                // true wenn keine Gast-Folge
  date: 'März 2026',           // human-readable
  duration: '47 min',
  lang: 'DE',                 // DE | EN
  desc: 'Kurzbeschreibung 2-3 Sätze. Keine HTML-Tags.',
  tags: ['Fabric', 'DE', ...], // Erste Tag ist der "Eyebrow"-Tag auf der Karte
  podcastUrl: 'https://...',   // optional, Podcast.de-Link wenn vorhanden
  ytId: 'abc123XYZ_4',         // 11-Zeichen YouTube ID — wenn gesetzt, wird Embed verfügbar
  chapters: [
    ['00:00', 'Intro'],
    ['02:30', 'Thema A'],
    // ...
  ]
}
```

**Wichtig:**

- Wenn `ytId` vorhanden ist, schaltet die Karte automatisch den
  "Video laden"-Button frei (lazy-loaded YouTube-Embed).
- Wenn `chapters` nicht leer ist, gibt's einen "Kapitel"-Toggle.
- `tags[0]` erscheint als farbiger Eyebrow auf der Karte — sollte sinnvoll
  sein (z. B. `Fabric` oder `Update`, nicht `DE`).

---

## Phase 5 · Verifikation

Bevor du committest, prüfe lokal:

```bash
# einfacher Web-Server, damit Fonts und Embeds richtig laden
python3 -m http.server 8000
# Browser: http://localhost:8000/daten_wg_learn_buckets.html
```

**Akzeptanz-Kriterien:**

- [ ] Alle Videos vom Kanal sind in `EPISODES` (per Channel-Suche vs. Liste
      gegenchecken)
- [ ] Jedes Video hat genau einen Bucket
- [ ] Keine Duplikate (ytId-Check)
- [ ] Bucket-Tile-Counts stimmen mit tatsächlichen Karten-Counts überein
- [ ] Volltextsuche findet jedes Video über Titel und Gast
- [ ] Mindestens 5 Tags haben `count >= 5` (Heuristik klassifiziert sinnvoll)
- [ ] Anteil "Unsortiert"-Fallback unter 10 %
- [ ] Filtern nach DE/EN funktioniert
- [ ] Mindestens 3 zufällige Videos mit ytId per Embed-Button getestet
- [ ] HTML-Datei rendert ohne JS-Konsolen-Fehler

---

## Design-System (nicht ändern)

Schriften: `Fraunces` (Serif, Titel), `Geist` (Sans, Body), `JetBrains Mono`
(Tags/Metadata). Bereits via Google-Fonts eingebunden.

CSS-Variablen, die für neue Karten/Buckets gelten:

```css
:root {
  --bg: #FAFAF7;
  --bg-card: #FFFFFF;
  --ink: #0F1E2E;
  --ink-soft: #475569;
  --accent: #C25A2D;
  /* Bucket-Farben siehe Tabelle oben */
}
```

Wenn ein 10. Bucket entstehen sollte (z. B. neuer Themen-Cluster „KI-Agents"):
- Neue Farb-Variable in `:root` (z. B. `--c-agents: #4A6B5B;`)
- Neuer Eintrag in `const BUCKETS = [...]`
- Neuer `<a class="bucket-tile">` im Bucket-Overview-Grid

---

## Beispiel-Skript: `scripts/fetch_videos.py`

```python
#!/usr/bin/env python3
"""Holt alle Videos vom Daten-WG-Kanal mit yt-dlp und schreibt videos.json."""
import json
import re
from yt_dlp import YoutubeDL

CHANNEL = "https://www.youtube.com/@Daten-WG/videos"

ydl_opts = {
    "quiet": True,
    "extract_flat": False,         # wir wollen volle Infos
    "skip_download": True,
    "ignoreerrors": True,
    # "cookiesfrombrowser": ("chrome",),  # bei 403 entkommentieren
}

CHAPTER_RX = re.compile(
    r"^\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—:]?\s*(.+?)\s*$",
    re.MULTILINE,
)


def extract_chapters(description: str) -> list[list[str]]:
    if not description:
        return []
    return [
        [m.group(1), m.group(2).strip()]
        for m in CHAPTER_RX.finditer(description)
        if m.group(2)
        and not m.group(2).lower().startswith(("http", "links", "quellen", "gast", "host"))
    ]


def main():
    with YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(CHANNEL, download=False)

    videos = []
    for entry in info.get("entries", []):
        if not entry:
            continue
        videos.append({
            "id": entry.get("id"),
            "title": entry.get("title"),
            "duration": entry.get("duration"),
            "upload_date": entry.get("upload_date"),
            "description": entry.get("description", ""),
            "chapters_raw": entry.get("chapters") or [],
            "chapters_parsed": extract_chapters(entry.get("description", "")),
        })

    with open("videos.json", "w", encoding="utf-8") as f:
        json.dump(videos, f, ensure_ascii=False, indent=2)

    print(f"✓ {len(videos)} Videos gespeichert in videos.json")


if __name__ == "__main__":
    main()
```

---

## Bonus (optional)

**A. Echte Transkripte (Volltextsuche statt nur Beschreibung):**

```bash
yt-dlp --write-auto-sub --sub-lang de,en --skip-download VIDEO_URL
```

Auto-Subs sind nicht perfekt, aber für Suche gut. Pro Video ~30 KB VTT.
Bei 100 Videos = ~3 MB Daten — kann in einem separaten `transcripts.json`
liegen und lazy in der Suche dazugeladen werden.

**B. Thumbnails als Karten-Hintergrund:**

YouTube-Thumbnails sind unter `https://i.ytimg.com/vi/{ytId}/hqdefault.jpg`
direkt erreichbar. Falls gewünscht, jede Karte mit Hover-Thumbnail
ausstatten.

**C. Datum-Filter:**

Bei 100+ Videos wäre eine Zeitachse / Jahr-Filter (`2025` · `2026`) zusätzlich
zur Bucket-Navigation hilfreich. Würde als zweite Filterleiste neben den
Tag-Chips passen.

---

## Was nicht ändern

- Die `power_bi_einsteiger_guide_v4.html` — nur Referenz für Design.
- Die Bucket-IDs und Farben (`bucket-1` ... `bucket-9`).
- Die Schriftart-Imports.
- Die JS-Render-Logik (`renderCard`, `renderBuckets`, `applyFilters`) — sie
  unterstützt das Episode-Schema oben bereits vollständig. Nur die
  `EPISODES`-Konstante austauschen.

---

## Bei Problemen

- **yt-dlp gibt nichts zurück:** Mit `--cookies-from-browser chrome` probieren,
  oder yt-dlp updaten (`pip install -U yt-dlp`).
- **YouTube throttled:** Längere Sleeps zwischen Requests (`--sleep-interval 2`).
- **HTML-Parsing schief:** Lieber regex auf `const EPISODES = [` ... `];` als
  versuchen, die ganze HTML durch DOMParser zu schicken — das Markup ist stabil.
- **Mehr als ein 10. Bucket nötig:** Frag mich zuerst, statt eigenmächtig
  neue Cluster zu erfinden.

Viel Spaß. Wenn was unklar ist, frag den Menschen kurz, statt zu raten.
