---
name: kitchen-update
description: Daten-WG YouTube-Kanal auf neue Folgen checken und in daten_wg_learn_buckets.html einpflegen. Nutzen, wenn User sinngemaess sagt "neue Videos einpflegen", "Kitchen updaten", "Daten-WG checken", "neue Folgen rein", oder einen Channel-Refresh anfordert.
---

# Daten-WG Knowledge Kitchen · Update-Workflow

Hol neue Folgen vom @Daten-WG YouTube-Kanal, klassifiziere sie, und schreib sie in `daten_wg_learn_buckets.html`.

## Voraussetzungen

- `yt-dlp` installiert (mind. 2026.x; aktuelle Version checken mit `yt-dlp --version`)
- `node` verfuegbar (fuer Parser-Helper)
- Arbeitsverzeichnis: Repo-Root (`daten_wg_learn_buckets.html` direkt sichtbar)
- Vor Beginn `git status` checken — Working Tree sollte sauber sein oder klar abgrenzbar

## Workflow

### 1. Bestand dumpen

```bash
node scripts/_dump_eps.js
```

Liest `EPISODES` aus dem HTML, schreibt `_eps_by_bucket.json`, gibt Bucket-Counts aus. Total = Summe der 9 Buckets. Merke dir die Zahl — sie ist Vorher-Stand fuer den Count-Update.

### 2. Channel fetchen

```bash
yt-dlp --flat-playlist --dump-single-json --skip-download "https://www.youtube.com/@Daten-WG/videos" > _channel_fresh.json
```

**Falls 403 / Sign-in required:** `--cookies-from-browser chrome` ergaenzen. Wenn Chrome laeuft und die Cookie-DB lockt, User bitten Chrome zu schliessen — NICHT versuchen Chrome zu killen.

### 3. Diff bilden

Inline-Node-Skript: Lese `_channel_fresh.json`, vergleiche `entries[].id` gegen die `ytId`s aus `_eps_by_bucket.json`. Die Differenz sind die neuen Videos.

```bash
node -e "
const fs = require('fs');
const fresh = JSON.parse(fs.readFileSync('_channel_fresh.json', 'utf8'));
const byBucket = JSON.parse(fs.readFileSync('_eps_by_bucket.json', 'utf8'));
const existing = new Set();
for (const b of Object.keys(byBucket)) for (const ep of byBucket[b]) if (ep.ytId) existing.add(ep.ytId);
const newOnes = (fresh.entries || []).filter(e => e && e.id && !existing.has(e.id));
console.log('Existing:', existing.size, '| Channel:', (fresh.entries || []).length, '| New:', newOnes.length);
for (const v of newOnes) console.log(v.id, '|', Math.round((v.duration || 0)/60) + 'min', '|', v.title);
"
```

Wenn keine neuen Videos: dem User Bescheid geben und stoppen — kein Commit ohne Aenderung.

### 4. Vollinfo fetchen

Fuer jede neue ID:

```bash
yt-dlp --skip-download --write-info-json --no-write-thumbnail -o "data/videos/%(id)s.%(ext)s" "https://www.youtube.com/watch?v=NEW_ID"
```

Liefert `data/videos/NEW_ID.info.json` mit `title`, `description`, `duration`, `upload_date`, `chapters` (strukturiert, wenn der Creator sie in der Beschreibung hatte).

### 5. Klassifizieren

Pro Video: Bucket waehlen anhand der Heuristik in `CLAUDE.md` (Stichwoerter im Titel). Reihenfolge wichtig — erste passende gewinnt:

| Bucket | Trigger |
|---|---|
| `bucket-1` Updates & News | `quarterly`, `update`, `news` |
| `bucket-2` Microsoft Fabric | `fabric`, `lakehouse`, `onelake`, `direct lake` |
| `bucket-3` Datenmodellierung | `modell`, `dax`, `stern`, `vault` |
| `bucket-4` Self-Service / Governance | `governance`, `citizen`, `shadow it` |
| `bucket-5` Visualisierung & IBCS | `ibcs`, `visual`, `deneb`, `dashboard` |
| `bucket-6` Power BI Deep Dive | `power bi`, `pbix`, `vergleich` — Default |
| `bucket-7` Karriere & Community | `karriere`, `community`, `mvp`, `journey` |
| `bucket-8` Strategie & Big Picture | `strategie`, `transformation`, `mittelstand` |
| `bucket-9` Event · Daten-WG | `daten-wg`, `konferenz`, `event`, `rueckblick` |

Sprache (DE/EN) aus dem Titel ableiten. Datum aus `upload_date` (YYYYMMDD → "Monat YYYY", deutsche Monatsnamen). Tags: 3–5 Stueck; erste = Eyebrow (sinnvoll, z. B. `Update`, `DAX`, `Fabric` — NICHT `DE`/`EN`).

### 6. Description schreiben

2–3 knappe Saetze. Aus dem ersten Absatz der YouTube-Description ableiten, aber **nicht** copy-pasten. Konkret, ohne Marketing-Sprech. Bei Gast-Folgen den Gast und das Kern-Thema nennen.

### 7. Kapitel uebernehmen

Aus `info.chapters` (strukturiert) den Array `[[mm:ss, "Titel"], ...]` bauen. Sekunden → `mm:ss` formatieren. Wenn `info.chapters` leer ist, parse mit Regex aus `info.description` (siehe CLAUDE.md).

### 8. Insertion in EPISODES

Insertion-Punkt: **Vor dem ersten Eintrag des jeweiligen Buckets** (chronologisch absteigend, also neuestes oben). Such-Anker fuer Edit:

```
/* ========== BUCKET N: ... ========== */
  {
    bucket: 'bucket-N',
    title: '<Erster bestehender Eintrag>',
```

Neuen Eintrag im selben Stil davor einfuegen (Einrueckung: 2 Spaces fuer Object-Block, 4 fuer Properties). Anfuehrungszeichen: Single Quotes; Apostrophe im Text mit `\'` escapen; Double Quotes in Kapiteltiteln gehen ungescaped in single-quoted Strings.

Episode-Schema:

```js
{
    bucket: 'bucket-N',
    title: '...',
    guest: 'Name' | 'Solo',
    solo: true | false,
    date: 'Monat YYYY',
    duration: 'N min',
    lang: 'DE' | 'EN',
    desc: '...',
    tags: ['Eyebrow', 'Topic', 'Lang'],
    podcastUrl: null | 'https://...',
    ytId: '...',
    chapters: [['00:00', 'Intro'], ...]
  },
```

### 9. Counts updaten

Folgende Stellen anpassen (Vorher → Nachher, exakt diese Stellen — sonst zerschiesst die Pipeline-Doku):

- `<p class="subtitle">N Folgen aus dem` (Header-Subtitle)
- `<span class="header-stat"><strong>N</strong>Folgen</span>` (Header-Stat)
- `Der Daten-WG-Kanal ist seit knapp einem Jahr live, N Folgen sind raus.` (Orientation-Text)
- `<strong id="result-count">N</strong> von N Folgen` (Filter-Bar)
- Pro betroffenes Bucket: `<div class="bucket-tile-count">N Folgen</div>`

Transkripte-Count (`<strong>N</strong>Transkripte`) **nur** anfassen, wenn der User das explizit erwaehnt — Transkripte werden in einer separaten Pipeline aktualisiert.

### 10. Verifizieren

```bash
node scripts/_dump_eps.js
```

Pruefen: Summe der Buckets = Neuer Gesamtcount. Wenn das Skript einen Parse-Error wirft (Syntax kaputt), zurueck zur Insertion und Anfuehrungszeichen pruefen.

### 11. Commit

Nur wenn der User explizit committen will. Commit-Message-Konvention:

```
Kitchen: N neue Folgen - <Kurzfassung>

- Titel A (ytId, bucket-X, duration, lang): Kurz-Pitch
- Titel B (ytId, bucket-Y, duration, lang): Kurz-Pitch

Counts: AlterTotal -> NeuerTotal Folgen, bucket-N M -> M+1.
```

`git add daten_wg_learn_buckets.html` (NICHT `git add -A` — internal Helper-Files mit `_`-Praefix sollen lokal bleiben). Push erst auf explizite Bitte.

## Edge Cases

- **Placeholder-Eintrag mit falschem ytId**: Wenn ein bestehender Eintrag eine ytId hat, die zu einem anderen Video gehoert (z. B. Channel-Trailer als Platzhalter), den Eintrag **updaten** statt einen neuen einfuegen. Pruefen mit `yt-dlp --skip-download --print "%(title)s" "https://www.youtube.com/watch?v=XYZ"`.
- **Channel-Liste unvollstaendig**: yt-dlp gibt evtl. nur ~75 neueste Folgen zurueck. Das ist OK — wir suchen nur nach NEUEN, nicht nach fehlenden alten. Wenn User explizit "alle alten checken" sagt, mit `--playlist-end 200` o.ae. paginieren.
- **Mehr als 5 neue Videos**: User-Check anbieten, ob alle uebernommen werden sollen oder nur ausgewaehlte.
- **Keine Kapitel verfuegbar**: `chapters: []` ist OK. Nicht erfinden.

## Was NICHT tun

- Keine Eintraege ohne ytId mit Daten-WG-Inhalten anlegen
- Keine `analysis.html` oder `_*.json` Dateien committen — sind via `.gitignore` lokal
- Keinen automatischen Push — immer auf User-Greenlight warten
- Keine Aenderungen an `power_bi_einsteiger_guide_v4.html` oder `morally_aligned_ai*.html` — andere Subseiten
