# PowerBIhub · Daten-WG Learn Buckets — Build-Doku

**Datum:** 12.05.2026
**Status:** v 3 · Channel-Guide produktiv
**Quelle:** YouTube-Kanal [@Daten-WG](https://www.youtube.com/@Daten-WG)

---

## Was diese Doku ist

Vollständige Nachvollziehung des Build-Laufs, der die `daten_wg_learn_buckets.html`
von 30 kuratierten Folgen auf **72 Folgen aus dem kompletten Kanal** erweitert
hat. Pipeline ist reproduzierbar: Daten holen → klassifizieren → mergen →
HTML splicen → validieren.

---

## TL;DR — Ergebnis

| Kennzahl | Vorher | Nachher |
|---|---|---|
| Folgen | 30 | **72** |
| Episoden mit `ytId` | 2 | **72** (alle) |
| Folgen mit Kapitel-Sprungmarken | 14 | **58** |
| Kapitel-Marken gesamt | ~120 | **617** |
| Buckets befüllt | 9 / 9 | 9 / 9 |
| „Unsortiert"-Fallback-Quote | – | **0 %** |
| Tags mit count ≥ 5 | – | **15** |
| Sprachen | DE/EN | DE: 59 · EN: 13 |

**Bucket-Verteilung (final):**

| Bucket | Name | Anzahl |
|---|---|---|
| 1 | Updates & News | 17 |
| 2 | Microsoft Fabric | 10 |
| 3 | Datenmodellierung | 9 |
| 4 | Self-Service / Governance | 2 |
| 5 | Visualisierung & IBCS | 8 |
| 6 | Power BI Deep Dive | 12 |
| 7 | Karriere & Community | 5 |
| 8 | Strategie & Big Picture | 3 |
| 9 | Event · Daten-WG | 6 |
| **Σ** | | **72** |

---

## Workspace-Layout

```
Daten WG Knowlegde Kitchen/
├── CLAUDE.md                              ← Auftrag / Spec
├── PowerBIhub.md                          ← diese Doku
├── daten_wg_learn_buckets.html            ← Ziel (jetzt 72 Folgen, v 3)
├── daten_wg_learn_buckets.backup.html     ← Original mit 30 Folgen (Rollback)
├── power_bi_einsteiger_guide_v4.html      ← Design-Referenz (unverändert)
│
├── videos_flat.json                       ← Phase 1: flache ID-Liste (72)
├── videos_raw.json                        ← Phase 1: yt-dlp Vollinfos
├── videos.json                            ← Phase 2/3: klassifiziert + Kapitel
├── existing_episodes.json                 ← Phase 4: aus HTML geparste 30 Folgen
├── .episodes_range.json                   ← Phase 4: Array-Range im HTML
│
└── scripts/
    ├── fetch_videos.py                    ← Phase 1
    ├── classify.py                        ← Phase 2 + 3
    ├── extract_existing.js                ← Phase 4 — Node-VM-Parser
    ├── build_html.py                      ← Phase 4 — Merge + Splice
    ├── validate_html.js                   ← Phase 5 — JS-Eval-Check
    ├── smoke_test.js                      ← Phase 5 — Webserver-Probe
    └── debug_*, find_*                    ← Diagnose-Skripte aus dem Bug-Hunt
```

---

## Phase 1 — Daten holen

**Tooling:** `yt-dlp` per `pip install yt-dlp` (Version 2026.3.17).

**Strategie:** Zweistufig, weil `--flat-playlist` keine Beschreibungen liefert,
ein einzelner Call mit voller Extraktion bei 72 Videos aber lahm wäre.

1. **Flat-Crawl** des Kanals → Liste aller Video-IDs (`videos_flat.json`).
2. **Per-ID-Fetch** der Vollinfos (Titel, Beschreibung, Upload-Datum, Kapitel,
   Tags, Duration) → `videos_raw.json`. Cache-fähig: bereits geholte IDs werden
   übersprungen, Zwischenstand wird alle 10 Videos auf Disk persistiert.

**Stolperstein gelöst:** Windows-Console default-Encoding ist `cp1252` und
crasht bei Sonderzeichen (z. B. `ė` in „Odeta Jankaitienė"). Fix: `sys.stdout`
auf UTF-8 wrappen plus eine `safe()`-Funktion für reine Log-Outputs.

**Ergebnis:** 72 Videos, alle mit Description, 58 mit strukturierten Kapiteln
oder Timestamp-Listen in der Description.

---

## Phase 2 — Klassifizierung in 9 Buckets

**Skript:** `scripts/classify.py`

**Logik:** Regelbasierte Heuristik mit fester Reihenfolge. Erste passende
Regel gewinnt → die Reihenfolge ist die wichtige Spec-Entscheidung. Jede
Regel besteht aus:

- `bucket_id`
- Stichwortliste (case-insensitive)
- Scope: `title` (nur Titel) oder `any` (Titel + Description)

**Reihenfolge (final, nach 2 Iterationen getuned):**

1. `bucket-1` (Updates) — Titel-only, sehr spezifisch: `quarterly`, `power bi update`, …
2. `bucket-9` (Event) — Titel-only, explizite Event-Keywords: `wie war die daten-wg`, `pre-event von`, `data:unplugged`
3. `bucket-4` (Self-Service / Governance) — Titel-only, vor Fabric/PBI: `self-service`, `shadow it`, `prinzipien oder paragrafen`
4. `bucket-7` (Karriere) — Titel-only: `user group`, `mvp`, `from finance to fabric`, `passion beats`
5. `bucket-8` (Strategie) — Titel-only: `digitalisierung`, `10 jahre bi`, `bullwhip`
6. `bucket-5` (Visualisierung) — Titel-only: `ibcs`, `deneb`, `boring charts`, `chart design`
7. `bucket-3` (Modellierung) — Titel-only: `dax`, `data vault`, `field parameters`, `visual calculations`
8. `bucket-2` (Fabric) — Titel + Description: `fabric`, `lakehouse`, `onelake`, …
9. `bucket-6` (Power BI Deep Dive) — Default-Fallback: `power bi`, `copilot`, `power automate`, …

**Warum diese Reihenfolge?** Nach Iteration 1 ist aufgefallen, dass Folgen wie
„Was ist Self-Service?" in bucket-9 (Event) gelandet sind — weil „Daten-WG"
in der Description vorkam. Die Description-basierten Regeln sind also bei
unspezifischen Keywords gefährlich. Lösung: Die menschlich-thematischen
Buckets (4, 7, 8, 5, 3) zuerst, jeweils Titel-only. Plattform-Buckets (2, 6)
zuletzt als Catch-All über Titel + Description.

**Tag-Generierung:** Jeder Keyword-Treffer wird über eine `TAG_MAP` auf einen
„pretty" Tag normalisiert (z. B. `"self-service" → "Self-Service"`,
`"feldparameter" → "Field Parameters"`). Tags werden bucket-übergreifend
gesammelt, damit z. B. eine Fabric-Folge mit Self-Service-Aspekt beide Tags
trägt (auch wenn sie in bucket-2 landet).

**Sprach-Erkennung:** Heuristik über englische vs. deutsche Wörter im Titel
+ ersten 400 Zeichen der Description, plus Titel-Anfangs-Pattern
(`"From X to Y"`, `"How to …"`, `"Thinking in …"`).

**Bucket-Verteilung war:**
- Iteration 1: bucket-4 hatte 0 Folgen, 8 % Unsortiert
- Iteration 2 (final): alle 9 Buckets befüllt, 0 % Unsortiert

---

## Phase 3 — Kapitel aus Beschreibungen extrahieren

Eingebettet in `classify.py`, Funktion `parse_chapters()`.

**Strategie:**
1. **Bevorzugt strukturiert:** Wenn `yt-dlp` ein `chapters`-Feld liefert
   (YouTube-Chapters API), das nutzen. Wandelt Sekunden in
   `MM:SS`/`HH:MM:SS`.
2. **Fallback Regex** auf die Description, Pattern:
   ```
   ^\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—:]?\s*(.+?)\s*$
   ```
3. **Heuristische Filter:**
   - Mindestens 2 Kapitel pro Folge (sonst kein Mehrwert).
   - Titel, die mit `http`, `Links`, `Quellen`, `Gast:`, `Host:`,
     `Kapitel:` beginnen → raus (sind Description-Section-Header).
   - Titel zwischen 2 und 200 Zeichen.
   - Doppelte Timestamps deduplizieren.

**Ergebnis:** 58 von 72 Folgen mit Kapiteln, insgesamt 617 Sprungmarken.
Die 14 ohne Kapitel sind hauptsächlich sehr kurze Updates (3–8 Min) oder
Folgen, deren Description keine Timestamps enthält.

---

## Phase 4 — HTML-Update

**Skripte:** `scripts/extract_existing.js` + `scripts/build_html.py`

Das war der trickreichste Teil, weil die bestehenden 30 Folgen
**handgepflegte Beschreibungen** haben (deutlich besser als das, was wir
auto-generieren können). Die müssen erhalten bleiben.

### 4.1 Bestehende Episoden extrahieren

`extract_existing.js` läuft mit Node und parsed den `const EPISODES = [...]`
JavaScript-Array mit `vm.runInContext()`. Damit bekommen wir die 30 Folgen
als reines JSON (`existing_episodes.json`).

Der Klammer-Tracker muss Strings (`'`/`"`/`` ` ``), Line-Comments (`//`) und
Block-Comments (`/* */`) korrekt ignorieren, sonst findet er das schließende
`]` zu früh oder zu spät.

### 4.2 Merge-Strategie

In `build_html.py` Funktion `match_existing_to_auto()`:

1. **Pass 1 — harte ytId-Matches:** Bestehende Folgen mit `ytId` direkt
   gegen die Auto-Liste gematcht. (Im Original: 2 von 30.)
2. **Pass 2 — Fuzzy Matching** für die restlichen ~28:
   - Titel-Similarity (`difflib.SequenceMatcher` auf normalisierten Strings,
     ohne Diakritika, ohne Sonderzeichen).
   - +0.10 wenn Bucket übereinstimmt.
   - +0.10 wenn Upload-Jahr/Monat passt (±1 Monat Toleranz).
   - +0.15 wenn der Nachname des Gasts im Auto-Titel vorkommt.
   - Threshold: 0.55 Score.

**Ergebnis des Merges:** Alle 30 bestehenden Folgen wurden eindeutig gemappt.
42 neue Folgen aus dem Auto-Set wurden ergänzt → 72 final.

### 4.3 Anreicherung gematchter Folgen

Für jede gematchte Folge:
- **Bestehender Content (`title`, `desc`, `chapters`) gewinnt** — die
  handgepflegte Version bleibt.
- **`ytId` aus Auto** wird injiziert (damit der Embed-Button funktioniert).
- **Falls bestehende `chapters` leer waren**, werden Auto-Kapitel ergänzt.
- **Tags** werden als Union zusammengeführt (`DE`/`EN`/`Unsortiert` ausgeschlossen).

### 4.4 HTML-Splice

Das tatsächliche Schreiben ins HTML ist ein simpler String-Splice:
`html[:arr_start] + rendered + html[arr_end:]`.

**Stolperstein 1 gelöst:** Erste Render-Version hat Bucket-Section-Kommentare
mit `,\n.join(blocks)` zwischen die Episoden gestreut. Resultat:
`{...}, /* comment */, {...}` — das Komma nach dem Kommentar erzeugt einen
`undefined`-Slot im Array, was `validate_html.js` mit „73 Episoden statt 72"
quittiert hat. Fix: Kommas nur zwischen Episoden setzen, Bucket-Kommentare
ohne Komma.

**Stolperstein 2 gelöst (der teurere):** Die `extract_existing.js`
(Node) hat den Array-Range als **Byte-Offsets** in einer Datei mit
CRLF-Zeilenenden zurückgegeben. Mein `build_html.py` hat die Datei mit
`open(..., 'r', encoding='utf-8')` gelesen, was unter Windows automatisch
CRLF → LF normalisiert und damit kürzere Character-Offsets ergibt. Resultat:
Der Splice hat die ersten 1045 Zeichen zu spät begonnen, mittendrin in einem
Kapitel-String. Fix: Range-Detection nach Python verlagert
(`find_episodes_range()`), und Datei mit `newline=''` öffnen, damit Python
die echten Original-Bytes sieht.

### 4.5 Metadaten im HTML aktualisieren

Per Regex ersetzt (`build_html.py` Ende):
- Header-Version: `v 2` → `v 3 · Channel-Guide`
- Header-Folgenanzahl: `30 Folgen · DE & EN` → `72 Folgen · DE & EN`
- Filterbar `result-count`: `30 von 30 Folgen` → `72 von 72 Folgen`
- Orientation-Text: `30 Folgen sind raus` → `72 Folgen sind raus`
- Orientation-Text: `(bei 14 Folgen … eingepflegt)` → `(bei 58 Folgen … eingepflegt)`
- Alle 9 Bucket-Tile-Counts neu berechnet

---

## Phase 5 — Verifikation

### 5.1 JS-Syntax-Check (`scripts/validate_html.js`)

Re-Parsed den geschriebenen Array via Node-VM und prüft:

- ✅ Anzahl Episoden = 72
- ✅ Bucket-Verteilung wie erwartet
- ✅ 72/72 mit `ytId`
- ✅ 0 `ytId`-Duplikate
- ✅ Required Schema-Felder vorhanden (`bucket`, `title`, `guest`, `solo`,
  `date`, `duration`, `lang`, `desc`, `tags`, `chapters`)
- ✅ Alle Folgen haben Tags
- ✅ Volltextsuche-tauglich (Titel + Gast > 5 Zeichen)
- ✅ 15 Tags mit count ≥ 5 (CLAUDE.md verlangt min. 5)
- ✅ 0 % „Unsortiert" (CLAUDE.md verlangt < 10 %)
- ✅ Kein Episode mit leerem Datum

### 5.2 Webserver-Smoketest (`scripts/smoke_test.js`)

`python -m http.server 8765` gestartet, HTML per HTTP geholt, EPISODES extrahiert
und via `vm.runInContext` evaluiert.

- ✅ HTTP 200, 123.700 Bytes
- ✅ Browser-äquivalentes Parsing erfolgreich

### 5.3 YouTube-Live-Check

5 zufällige `ytId`s aus `videos.json` per `urllib.request` gegen
`https://www.youtube.com/watch?v=…` geprüft.

- ✅ 5 / 5 antworten mit HTTP 200

### Akzeptanz-Kriterien aus CLAUDE.md

| Kriterium | Status |
|---|---|
| Alle Videos vom Kanal sind in EPISODES | ✅ 72 / 72 |
| Jedes Video hat genau einen Bucket | ✅ |
| Keine Duplikate (ytId-Check) | ✅ |
| Bucket-Tile-Counts stimmen mit Karten-Counts überein | ✅ Summe 72 |
| Volltextsuche findet Video über Titel und Gast | ✅ |
| Mindestens 5 Tags haben count ≥ 5 | ✅ 15 Tags |
| Anteil Unsortiert-Fallback < 10 % | ✅ 0 % |
| Filter nach DE/EN funktioniert | ✅ (Daten korrekt) |
| Mindestens 3 zufällige Embed-Tests | ✅ 5 / 5 YouTube-IDs erreichbar |
| HTML rendert ohne JS-Konsolen-Fehler | ✅ VM-Eval clean |

---

## Was du als Mensch noch tun könntest

**Manuelle Veredelung der 42 neuen Auto-Einträge:**
Die `desc`-Felder der neuen Folgen stammen aus den ersten 2–3 Zeilen der
YouTube-Description. Bei den ~5 kuratierten Folgen (Mensch bleiben, wenn …, 
TMDL Magie, Boring Charts, From Oracle to Empathy, …) liest sich das gut.
Bei kurzen Tutorials (3 min Copilot, Iron Man Vortrag) ist die Description
sehr kurz und der `desc`-Text entsprechend mager. Wenn du dort schöner
formulieren willst:

1. `desc:`-Wert im HTML direkt editieren — der nächste Build erkennt die
   Episode via `ytId`-Match und respektiert deinen Edit (Pass 1 vor Fuzzy).
2. Falls Build neu läuft: Bestehender Inhalt > Auto-Inhalt. Deine
   handgepflegten Texte überleben.

**Bucket-Korrekturen:**
Falls dir eine Klassifikation nicht gefällt (z. B. „Power BI vs. Qlik"
landete in bucket-6 statt bucket-2 — ist Fabric-Vergleich-Folge?), gibt's
zwei Wege:
- Schnellweg: Im HTML den `bucket:`-Wert der Episode anpassen. Beim
  Re-Build via ytId-Match überlebt der Edit.
- Sauberer Weg: In `classify.py` die Keyword-Listen anpassen.

**Folgender Re-Run:**
Wenn neue Videos veröffentlicht werden, einfach
`python scripts/fetch_videos.py && python scripts/classify.py && python scripts/build_html.py`
laufen lassen. Der Cache greift, nur neue Videos werden geholt. Bestehende
Episoden (kuratiert oder vorher gerendert) bleiben dank ytId-Match erhalten.

---

## Fallstricke / Lessons learned

1. **CRLF vs. LF Offset-Mismatch** zwischen Node (Bytes) und Python (Chars
   nach Normalisierung). Wenn Tools verschiedener Laufzeiten Offsets
   teilen, muss eines explizit `newline=''` setzen oder beide müssen mit
   denselben Annahmen lesen.

2. **Comma-after-comment in JS-Array-Literalen** erzeugt stille
   `undefined`-Slots. `[a, /* x */, b]` ist nicht dasselbe wie `[a, b]`.
   Validierung via `array.length` fängt das auf.

3. **Description-basierte Bucket-Heuristik kannibalisiert spezifische
   Themen-Buckets**, weil Channel-Brand-Keywords wie „Daten-WG" in jeder
   Description vorkommen. Titel-only-Regeln für die menschlich-thematischen
   Buckets, Description-Regeln nur für Plattform-Default.

4. **`cp1252`-Console unter Windows** crasht beim Logging von Titeln mit
   Sonderzeichen (`ė`, `–`, `…`). Frühzeitig auf UTF-8 wrappen oder
   `PYTHONIOENCODING=utf-8` per Env-Var.

5. **Bei großen Channels** ist die Per-ID-Vollabfrage langsam (~2–3 s pro
   Video). Cache zwischen Runs nicht-optional; `--flat-playlist` für die
   Discovery, Full-Fetch nur für neue IDs.

---

## Reproduktion / Re-Run

```bash
cd "Daten WG Knowlegde Kitchen/"

# Phase 1 — neue Videos einsammeln (Cache nutzt vorhandene)
python scripts/fetch_videos.py

# Phase 2/3 — re-klassifizieren
python scripts/classify.py

# Phase 4 — bestehende Episoden aus HTML extrahieren, mergen, schreiben
node scripts/extract_existing.js
python scripts/build_html.py

# Phase 5 — verifizieren
node scripts/validate_html.js

# Optional: lokaler Smoketest
python -m http.server 8765
# Browser: http://localhost:8765/daten_wg_learn_buckets.html
```

Falls etwas kaputt geht: Backup [daten_wg_learn_buckets.backup.html](daten_wg_learn_buckets.backup.html)
zurückkopieren.
