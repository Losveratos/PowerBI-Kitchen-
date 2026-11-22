---
name: kitchen-update
description: Daten-WG YouTube-Kanal auf neue Folgen checken, in daten_wg_learn_buckets.html einpflegen, folgen.html (Live-Folgen-Bibliothek) synchronisieren und den Feed der Startseite neu bauen. Nutzen, wenn User sinngemaess sagt "neue Videos einpflegen", "Kitchen updaten", "Daten-WG checken", "neue Folgen rein", oder einen Channel-Refresh anfordert.
---

# Daten-WG Knowledge Kitchen · Update-Workflow

Hol neue Folgen vom @Daten-WG YouTube-Kanal, klassifiziere sie, und schreib sie in `daten_wg_learn_buckets.html` — **und synchronisiere anschliessend `folgen.html`** (die Live-Folgen-Bibliothek) **und baue den Feed der Startseite `index.html` neu** (Schritt 11b).

> ⚠️ **Seit Nov 2026 drei Stellen.** `daten_wg_learn_buckets.html` ist die Arbeitsdatei, ausgeliefert wird die Folgen-Bibliothek `folgen.html` (die fruehere Startseite mit allen Folgenkarten, Embeds und Kapiteln). Beide tragen dieselbe `EPISODES`-Konstante und dieselben Counts. Die Startseite `index.html` ist eine News-Seite im Zeitungsstil; sie liest ihre Eintraege aus `assets/start/feed-data.js`, das aus `folgen.html` und `beitraege.html` erzeugt wird. Wer nur die Buckets-Datei anfasst, sieht sein Update **nicht live**. Darum am Ende immer Schritt 11 (Sync) und 11b (Startseiten-Feed) ausfuehren und alles committen.
>
> **`index.html` nie mit der Buckets-Datei ueberschreiben** — das ist seit Nov 2026 eine andere Seite.

## Voraussetzungen

- `yt-dlp` installiert (mind. 2026.x; aktuelle Version checken mit `yt-dlp --version`)
- `node` verfuegbar (fuer Parser-Helper)
- Arbeitsverzeichnis: Repo-Root (`daten_wg_learn_buckets.html` und `folgen.html` direkt sichtbar)
- Fuer Schritt 11b: Python mit Pillow (`pip install pillow`)
- Vor Beginn `git status` checken — Working Tree sollte sauber sein oder klar abgrenzbar. Achte besonders auf **uncommittete Aenderungen an `folgen.html`** (`git diff folgen.html`): die muessen vor dem Sync zuerst in die Buckets-Datei uebernommen werden, sonst gehen sie beim Sync verloren.

## Workflow

### 1. Bestand zaehlen

```bash
node scripts/kitchen_diff.js
```

Liest `EPISODES` aus `daten_wg_learn_buckets.html` und gibt Gesamtzahl, Folgen je Bucket und eventuelle Duplikate aus. Merke dir die Zahl — sie ist Vorher-Stand fuer den Count-Update.

### 2. Channel fetchen (drei Tabs)

```bash
for t in videos shorts streams; do
  yt-dlp --flat-playlist --dump-single-json --skip-download "https://www.youtube.com/@Daten-WG/$t" > _ch_$t.json
done
```

**Alle drei Tabs sind Pflicht.** Die Live-Formate (BI Thinkers Talk, GxP Talk) erscheinen nur im Tab `/streams`, nicht unter `/videos` — so fehlten im Nov 2026 acht Folgen (nr.78–84 und ein GxP Talk). Shorts landen in `bucket-10`.

**Falls 403 / Sign-in required:** `--cookies-from-browser chrome` ergaenzen. Wenn Chrome laeuft und die Cookie-DB lockt, User bitten Chrome zu schliessen — NICHT versuchen Chrome zu killen.

### 3. Diff bilden

```bash
node scripts/kitchen_diff.js _ch_videos.json _ch_shorts.json _ch_streams.json
```

Gibt je Tab die neuen Videos aus und schreibt ihre IDs nach `_new_ids.txt`. **Angekuendigte Livestreams** (`live_status: is_upcoming`) werden uebersprungen und nur genannt — sie kommen nach der Ausstrahlung beim naechsten Lauf rein.

Wenn keine neuen Videos: dem User Bescheid geben und stoppen — kein Commit ohne Aenderung.

### 4. Vollinfo fetchen

Fuer jede neue ID:

```bash
while read -r id; do
  yt-dlp --skip-download --write-info-json --no-write-thumbnail -o "data/videos/%(id)s.%(ext)s" "https://www.youtube.com/watch?v=$id"
done < _new_ids.txt
```

Liefert `data/videos/NEW_ID.info.json` mit `title`, `description`, `duration`, `upload_date`, `release_date`, `chapters` (strukturiert, wenn der Creator sie in der Beschreibung hatte).

**Falls „Sign in to confirm you're not a bot“ / „The page needs to be reloaded“:** mit dem mweb-Client und ohne Formate holen, das liefert die Metadaten trotzdem (bei HTTP 429 eine Minute warten):

```bash
pip install -U yt-dlp
yt-dlp --js-runtimes node --extractor-args "youtube:player_client=mweb" --ignore-no-formats-error \
  --sleep-requests 3 --skip-download --write-info-json --no-write-thumbnail \
  -o "data/videos/%(id)s.%(ext)s" "https://www.youtube.com/watch?v=NEW_ID"
```

Die Dauer steht notfalls auch in den `_ch_*.json` (`duration`).

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

Sprache (DE/EN) aus dem Titel ableiten. Datum aus `release_date` (bei Livestreams der Sendetag; sonst `upload_date`; YYYYMMDD → "Monat YYYY", deutsche Monatsnamen). Tags: 3–5 Stueck; erste = Eyebrow (sinnvoll, z. B. `Update`, `DAX`, `Fabric` — NICHT `DE`/`EN`).

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
node scripts/kitchen_diff.js
```

Pruefen: Gesamtzahl = Neuer Gesamtcount, keine Duplikate. Wenn das Skript einen Parse-Error wirft (Syntax kaputt), zurueck zur Insertion und Anfuehrungszeichen pruefen.

### 11. `folgen.html` synchronisieren (PFLICHT)

`folgen.html` ist die Live-Folgen-Bibliothek und muss denselben Stand wie `daten_wg_learn_buckets.html` bekommen — sonst ist das Update **nicht live**.

Erst pruefen, ob sich die beiden **nur** in Folgen + Counts unterscheiden (Normalfall):

```bash
# Zeigt alle Unterschiede AUSSER EPISODES-Eintraegen und Count-Strings.
# Leere Ausgabe = sauberer cp moeglich.
diff folgen.html daten_wg_learn_buckets.html | grep -E "^[<>]" \
  | grep -vE "Folgen|bucket-tile-count|result-count|ytId:|bucket: '|title: '|guest: '|solo: |date: '|duration: '|lang: '|desc: '|tags: |podcastUrl:|chapters:|\['[0-9]|^[<>] *\]|^[<>] *\},?|^[<>] *\{" \
  | grep -E "^<"
```

- **Nur `>`-Zeilen bzw. leer** (folgen.html hat nichts Eigenes) → einfach spiegeln:
  ```bash
  cp daten_wg_learn_buckets.html folgen.html
  diff -q folgen.html daten_wg_learn_buckets.html && echo "IDENTICAL"
  ```
- **`<`-Zeilen mit echtem Eigen-Content in folgen.html** (z. B. jemand hat nur die Bibliothek umgebaut) → **nicht** blind `cp`. Diese Aenderungen zuerst in `daten_wg_learn_buckets.html` uebernehmen, dann spiegeln. Im Zweifel den User fragen.

Danach Counts in `folgen.html` gegenchecken:

```bash
grep -oE "header-stat\"><strong>[0-9]+</strong>Folgen|result-count\">[0-9]+</strong>" folgen.html
grep -c "bucket: 'bucket-" folgen.html   # muss == Neuer Gesamtcount sein
```

### 11b. Startseiten-Feed neu bauen (PFLICHT)

Die Startseite `index.html` zeigt die neuen Folgen erst, wenn der Feed neu gebaut ist. Vorschaubilder liegen lokal (Datenschutz: beim Laden keine Anfrage an YouTube), also zuerst die fehlenden holen:

```bash
python scripts/fetch_start_thumbs.py     # laedt nur fehlende Bilder nach assets/start/yt/
node scripts/build_start_feed.js         # schreibt assets/start/feed-data.js + statische Liste in index.html
node scripts/build_seo.js                # Canonicals, JSON-LD, sitemap-seiten.xml (lastmod)
```

`build_start_feed.js` gibt Eintraege ohne Bild als Warnung aus; bei neuen Folgen darf da nichts stehen. Die Kopfzahlen der Startseite (Folgen, Talks, Stories) rechnet die Seite selbst aus dem Feed, dort gibt es keine Count-Marker zu pflegen.

Neue Beitraege, Tools oder Stories (nicht Teil dieses Skills, aber gleicher Feed): Eintrag in `beitraege.html`, Vorschaubild mit `python scripts/render_start_shots.py <seite.html>`, bei textlastigen Seiten Titelbild mit `python scripts/build_start_covers.py` (URL dort in `TEXTY` eintragen), danach `node scripts/build_start_feed.js` und `node scripts/build_seo.js` (neue Seiten landen damit in Sitemap und JSON-LD; nach dem Push meldet der Workflow `indexnow.yml` sie an Bing & Co.).

### 12. Commit

Nur wenn der User explizit committen will. Bibliothek, Arbeitsdatei und Startseiten-Feed committen. Commit-Message-Konvention:

```
Kitchen: N neue Folgen - <Kurzfassung>

- Titel A (ytId, bucket-X, duration, lang): Kurz-Pitch
- Titel B (ytId, bucket-Y, duration, lang): Kurz-Pitch

Counts: AlterTotal -> NeuerTotal Folgen, bucket-N M -> M+1.
```

`git add daten_wg_learn_buckets.html folgen.html assets/start/feed-data.js assets/start/yt/` (NICHT `git add -A` — internal Helper-Files mit `_`-Praefix sollen lokal bleiben). Push erst auf explizite Bitte.

Nach dem Push braucht GitHub Pages (legacy build) oft 1–3 Min; der `pages/builds/latest`-API-Status hinkt dem CDN teils noch weiter hinterher. „Noch nicht live" ist fast immer Build-Lag oder Browser-Cache (Strg+F5), kein fehlgeschlagener Push. Live gegenchecken:

```bash
curl -s "https://datenwgknowledgekitchen.com/folgen.html?cb=$(date +%s)" | grep -o 'header-stat"><strong>[0-9]*</strong>Folgen' | head -1
curl -s "https://datenwgknowledgekitchen.com/assets/start/feed-data.js?cb=$(date +%s)" | grep -o 'NEUE_YTID' | head -1   # neue Folge im Startseiten-Feed
```

## Edge Cases

- **Placeholder-Eintrag mit falschem ytId**: Wenn ein bestehender Eintrag eine ytId hat, die zu einem anderen Video gehoert (z. B. Channel-Trailer als Platzhalter), den Eintrag **updaten** statt einen neuen einfuegen. Pruefen mit `yt-dlp --skip-download --print "%(title)s" "https://www.youtube.com/watch?v=XYZ"`.
- **Channel-Liste unvollstaendig**: yt-dlp gibt evtl. nur ~75 neueste Folgen zurueck. Das ist OK — wir suchen nur nach NEUEN, nicht nach fehlenden alten. Wenn User explizit "alle alten checken" sagt, mit `--playlist-end 200` o.ae. paginieren.
- **Mehr als 5 neue Videos**: User-Check anbieten, ob alle uebernommen werden sollen oder nur ausgewaehlte.
- **Keine Kapitel verfuegbar**: `chapters: []` ist OK. Nicht erfinden.

## Was NICHT tun

- Keine Eintraege ohne ytId mit Daten-WG-Inhalten anlegen
- Keine `analysis.html` oder `_*.json` Dateien committen — sind via `.gitignore` lokal
- Keinen automatischen Push — immer auf User-Greenlight warten
- **Nicht `folgen.html` und den Feed vergessen** — nur die Buckets-Datei zu aendern heisst: Update ist nicht live (Schritte 11 und 11b sind Pflicht)
- **`index.html` nicht mit der Buckets-Datei ueberschreiben** — die Startseite ist seit Nov 2026 eine eigene Seite
- Keine Aenderungen an `power_bi_einsteiger_guide_v4.html` oder `morally_aligned_ai*.html` — andere Subseiten
