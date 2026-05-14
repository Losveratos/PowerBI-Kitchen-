#!/usr/bin/env python3
"""Merge existing_episodes.json (kuratiert, HTML) mit videos.json (auto, yt-dlp)
und schreibe das Ergebnis zurueck in daten_wg_learn_buckets.html.

Mergestrategie:
- Index auto-Episoden nach ytId.
- Fuer jede bestehende Episode versuchen wir, die passende auto-Episode
  via ytId zu finden oder per fuzzy Titel + Datum + Gast zu matchen.
  Wenn matched -> die existierende Episode gewinnt inhaltlich, aber wir
  ergaenzen ytId, chapters (falls leer in existing), tags (Set-Union).
- Auto-Episoden, die NICHT auf bestehende gemappt sind, werden hinzugefuegt.
- Sortierung: bucket asc, Datum desc.
"""
import io
import json
import re
import sys
from difflib import SequenceMatcher
from pathlib import Path

try:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
except Exception:
    pass

ROOT = Path(__file__).parent.parent
HTML = ROOT / "daten_wg_learn_buckets.html"
EXISTING_JSON = ROOT / "existing_episodes.json"
AUTO_JSON = ROOT / "videos.json"
OVERRIDES = ROOT / "manual_overrides.json"
RANGE_JSON = ROOT / ".episodes_range.json"
BACKUP = ROOT / "daten_wg_learn_buckets.backup.html"


def load_override_ids() -> set:
    """Liefert die Set der ytIds, die in manual_overrides.json gepatcht werden.

    Fuer diese IDs gewinnt beim Merge der auto-Eintrag (statt existing),
    damit Override-Aenderungen sofort in der HTML wirksam werden.
    """
    if not OVERRIDES.exists():
        return set()
    try:
        data = json.loads(OVERRIDES.read_text(encoding="utf-8"))
    except Exception:
        return set()
    return {k for k in data.keys() if not k.startswith("_")}


def norm(s: str) -> str:
    """Normalisiert einen Titel fuer Fuzzy-Match."""
    if not s:
        return ""
    s = s.lower()
    # Diakritika weg
    s = (s.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")
           .replace("é", "e").replace("è", "e").replace("ė", "e").replace("á", "a")
           .replace("ç", "c"))
    # Trennzeichen vereinheitlichen
    s = re.sub(r"[·|—–\-:]", " ", s)
    s = re.sub(r"[^a-z0-9 ]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def title_similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, norm(a), norm(b)).ratio()


def date_year_month(date_str: str) -> tuple[int, int] | None:
    """Versucht Jahr/Monat aus dem date-Feld (z.B. 'April 2026', 'Q3 2025') zu lesen."""
    if not date_str:
        return None
    months_de = {
        "januar": 1, "jan": 1, "februar": 2, "feb": 2, "märz": 3, "maerz": 3, "mar": 3,
        "april": 4, "apr": 4, "mai": 5, "juni": 6, "jun": 6, "juli": 7, "jul": 7,
        "august": 8, "aug": 8, "september": 9, "sep": 9, "oktober": 10, "okt": 10,
        "november": 11, "nov": 11, "dezember": 12, "dez": 12,
    }
    s = date_str.lower().strip()
    # Patterns: "April 2026", "März 2026", "Q3 2025", "30.03.2026", "19.04.2026"
    m = re.match(r"(\d{1,2})\.(\d{1,2})\.(\d{4})", s)
    if m:
        return int(m.group(3)), int(m.group(2))
    m = re.match(r"q([1-4])\s+(\d{4})", s)
    if m:
        # Quartal -> nimm den ersten Monat des Quartals als Proxy
        q = int(m.group(1))
        return int(m.group(2)), {1: 1, 2: 4, 3: 7, 4: 10}[q]
    m = re.match(r"([a-zäö]+)\s+(\d{4})", s)
    if m:
        mon = months_de.get(m.group(1).lower())
        if mon:
            return int(m.group(2)), mon
    # Roh-Upload-Date YYYYMMDD
    if re.match(r"^\d{8}$", s):
        return int(s[:4]), int(s[4:6])
    return None


def match_existing_to_auto(existing: list[dict], auto: list[dict]) -> dict[int, int]:
    """Mappt index(existing) -> index(auto). Nur sichere Matches."""
    # ytId Map fuer harte Matches
    auto_by_yt = {e.get("ytId"): i for i, e in enumerate(auto) if e.get("ytId")}
    mapping: dict[int, int] = {}
    used_auto: set[int] = set()

    # Pass 1: harte ytId-Matches
    for ei, e in enumerate(existing):
        yt = e.get("ytId")
        if yt and yt in auto_by_yt:
            mapping[ei] = auto_by_yt[yt]
            used_auto.add(auto_by_yt[yt])

    # Pass 2: Fuzzy Titel + Bucket + Datum
    for ei, e in enumerate(existing):
        if ei in mapping:
            continue
        best = None  # (score, ai)
        e_ym = date_year_month(e.get("date", ""))
        for ai, a in enumerate(auto):
            if ai in used_auto:
                continue
            score = title_similarity(e.get("title", ""), a.get("title", ""))
            # Bonus wenn Bucket gleich
            if e.get("bucket") == a.get("bucket"):
                score += 0.10
            # Bonus wenn Datum Y/M passt
            a_ym = date_year_month(a.get("date", ""))
            if e_ym and a_ym and e_ym[0] == a_ym[0] and abs(e_ym[1] - a_ym[1]) <= 1:
                score += 0.10
            # Bonus wenn Gast-Name im auto-Titel oder umgekehrt
            g = (e.get("guest") or "").strip().lower()
            if g and not e.get("solo") and len(g) > 3:
                if g.split()[-1] in a.get("title", "").lower():
                    score += 0.15
            if best is None or score > best[0]:
                best = (score, ai)
        if best and best[0] >= 0.55:
            mapping[ei] = best[1]
            used_auto.add(best[1])
    return mapping


def merge(existing: list[dict], auto: list[dict]) -> list[dict]:
    mapping = match_existing_to_auto(existing, auto)
    used_auto = set(mapping.values())
    override_ids = load_override_ids()
    overridden_count = 0

    merged: list[dict] = []
    # Existierende Episoden behalten, mit Anreicherung
    for ei, e in enumerate(existing):
        merged_ep = dict(e)
        ai = mapping.get(ei)
        if ai is not None:
            a = auto[ai]
            existing_yt = merged_ep.get("ytId")
            # Manual-Override-Pfad: wenn diese ytId in manual_overrides.json
            # gepatcht wurde, wins der auto-Eintrag komplett (guest/bucket/
            # solo/lang/tags), damit Override-Updates ankommen.
            if existing_yt and existing_yt in override_ids:
                # Wir starten mit auto und reichern es ggf. mit existing-Kapiteln an
                merged_ep = {
                    "bucket": a["bucket"],
                    "title": a.get("title") or merged_ep.get("title"),
                    "guest": a["guest"] or "Solo",
                    "solo": a["solo"],
                    "date": a.get("date") or merged_ep.get("date"),
                    "duration": a.get("duration") or merged_ep.get("duration"),
                    "lang": a["lang"],
                    "desc": a.get("desc") or merged_ep.get("desc"),
                    "tags": list(a.get("tags") or []),
                    "podcastUrl": a.get("podcastUrl"),
                    "ytId": a["ytId"],
                    "chapters": a.get("chapters") or merged_ep.get("chapters") or [],
                }
                overridden_count += 1
            else:
                # ytId injizieren falls fehlt
                if not merged_ep.get("ytId") and a.get("ytId"):
                    merged_ep["ytId"] = a["ytId"]
                # chapters: existing gewinnt, falls existing leer aber auto reich -> nimm auto
                if not merged_ep.get("chapters") and a.get("chapters"):
                    merged_ep["chapters"] = a["chapters"]
                # tags: Union, existing-Reihenfolge zuerst
                existing_tags = list(merged_ep.get("tags") or [])
                for t in (a.get("tags") or []):
                    if t not in existing_tags and t not in ("DE", "EN", "Unsortiert"):
                        existing_tags.append(t)
                merged_ep["tags"] = existing_tags
        # _upload_date intern fuer Sortierung
        merged_ep["_upload_date"] = (
            auto[mapping[ei]].get("_upload_date") if ei in mapping else None
        )
        merged.append(merged_ep)
    if overridden_count:
        print(f"[merge] {overridden_count} Eintraege via manual_overrides.json forciert")

    # Neue Episoden aus auto, die nicht gematcht wurden
    for ai, a in enumerate(auto):
        if ai in used_auto:
            continue
        merged_ep = {
            "bucket": a["bucket"],
            "title": a["title"],
            "guest": a["guest"] or "Solo",
            "solo": a["solo"],
            "date": a["date"],
            "duration": a["duration"],
            "lang": a["lang"],
            "desc": a["desc"],
            "tags": a["tags"],
            "podcastUrl": a.get("podcastUrl"),
            "ytId": a["ytId"],
            "chapters": a["chapters"],
            "_upload_date": a.get("_upload_date"),
        }
        merged.append(merged_ep)

    # Sortierung: bucket asc, Upload-Datum desc (Auto-Episoden),
    # bestehende ohne upload_date am Ende ihres Buckets (alt)
    def sort_key(e):
        ud = e.get("_upload_date") or "00000000"
        return (e["bucket"], -int(ud))
    merged.sort(key=sort_key)

    # _upload_date wieder entfernen
    for e in merged:
        e.pop("_upload_date", None)

    return merged


# ---------- JS-Render ----------

def js_string(s: str) -> str:
    """JS-Single-Quoted-String mit korrektem Escape."""
    if s is None:
        return "null"
    s = s.replace("\\", "\\\\").replace("'", "\\'")
    s = s.replace("\r", "").replace("\n", " ")
    return f"'{s}'"


def render_episode(e: dict, indent: str = "  ") -> str:
    pad = indent * 2
    lines = ["  {"]
    fields_order = ["bucket", "title", "guest", "solo", "date", "duration",
                    "lang", "desc", "tags", "podcastUrl", "ytId", "chapters"]
    for f in fields_order:
        v = e.get(f)
        if f == "solo":
            lines.append(f"{pad}solo: {'true' if v else 'false'},")
        elif f == "tags":
            tags = v or []
            tag_str = ", ".join(js_string(t) for t in tags)
            lines.append(f"{pad}tags: [{tag_str}],")
        elif f == "chapters":
            chs = v or []
            if not chs:
                lines.append(f"{pad}chapters: []")
            else:
                lines.append(f"{pad}chapters: [")
                for ch in chs:
                    ts = js_string(ch[0])
                    title = js_string(ch[1])
                    lines.append(f"{pad}  [{ts}, {title}],")
                # Trailing-Komma am letzten loeschen
                last = lines[-1]
                if last.endswith(","):
                    lines[-1] = last[:-1]
                lines.append(f"{pad}]")
        elif f == "ytId":
            if v:
                lines.append(f"{pad}ytId: {js_string(v)},")
            else:
                lines.append(f"{pad}ytId: null,")
        elif f == "podcastUrl":
            if v:
                lines.append(f"{pad}podcastUrl: {js_string(v)},")
            else:
                lines.append(f"{pad}podcastUrl: null,")
        else:
            lines.append(f"{pad}{f}: {js_string(v)},")
    lines.append("  }")
    return "\n".join(lines)


def render_array(merged: list[dict]) -> str:
    """Rendert die EPISODES als JS-Array-Literal mit Bucket-Section-Kommentaren.
    Wichtig: Kommas duerfen nur ZWISCHEN Episode-Objekten stehen, nicht nach Kommentaren."""
    bucket_titles = {
        "bucket-1": "BUCKET 1: QUARTERLY",
        "bucket-2": "BUCKET 2: FABRIC",
        "bucket-3": "BUCKET 3: DATENMODELLIERUNG",
        "bucket-4": "BUCKET 4: SELF-SERVICE / GOVERNANCE",
        "bucket-5": "BUCKET 5: VISUALISIERUNG & IBCS",
        "bucket-6": "BUCKET 6: POWER BI DEEP DIVE",
        "bucket-7": "BUCKET 7: KARRIERE & COMMUNITY",
        "bucket-8": "BUCKET 8: STRATEGIE & BIG PICTURE",
        "bucket-9": "BUCKET 9: EVENT · DATEN-WG",
    }
    out = ["["]
    current_bucket = None
    for idx, ep in enumerate(merged):
        if ep["bucket"] != current_bucket:
            current_bucket = ep["bucket"]
            out.append("")
            out.append(f"  /* ========== {bucket_titles.get(current_bucket, current_bucket.upper())} ========== */")
        ep_str = render_episode(ep)
        # Komma nach Episode wenn nicht letzte
        if idx < len(merged) - 1:
            ep_str = ep_str + ","
        out.append(ep_str)
    out.append("]")
    return "\n".join(out)


def folge_word(n: int) -> str:
    return "Folge" if n == 1 else "Folgen"


def find_episodes_range(html: str) -> tuple[int, int]:
    """Findet [start, end) im html-string fuer den EPISODES-Array.
    Macht balanciertes Klammer-Match unter Beruecksichtigung von Strings/Comments."""
    marker = "const EPISODES = ["
    start_idx = html.find(marker)
    if start_idx == -1:
        raise RuntimeError("'const EPISODES = [' nicht gefunden")
    arr_start = html.find("[", start_idx)
    depth = 0
    in_str = None
    esc = False
    i = arr_start
    while i < len(html):
        c = html[i]
        if in_str:
            if esc:
                esc = False
            elif c == "\\":
                esc = True
            elif c == in_str:
                in_str = None
            i += 1
            continue
        if c in ('"', "'", "`"):
            in_str = c
            i += 1
            continue
        if c == "/" and i + 1 < len(html) and html[i + 1] == "/":
            while i < len(html) and html[i] != "\n":
                i += 1
            continue
        if c == "/" and i + 1 < len(html) and html[i + 1] == "*":
            i = html.find("*/", i + 2) + 2
            continue
        if c == "[":
            depth += 1
        elif c == "]":
            depth -= 1
            if depth == 0:
                return arr_start, i + 1
        i += 1
    raise RuntimeError("Array-Ende nicht gefunden")


def main():
    existing = json.loads(EXISTING_JSON.read_text(encoding="utf-8"))
    auto = json.loads(AUTO_JSON.read_text(encoding="utf-8"))

    merged = merge(existing, auto)
    print(f"[merge] existing={len(existing)} auto={len(auto)} -> merged={len(merged)}")

    # Bucket-Verteilung
    from collections import Counter
    bucket_counts = Counter(e["bucket"] for e in merged)
    print("[merge] Bucket-Verteilung:")
    for b in sorted(bucket_counts):
        print(f"   {b}: {bucket_counts[b]}")

    # ytId-Dedupe-Check
    seen_yt = set()
    dupes = 0
    for e in merged:
        yt = e.get("ytId")
        if yt:
            if yt in seen_yt:
                dupes += 1
            seen_yt.add(yt)
    if dupes:
        print(f"[warn] {dupes} ytId-Duplikate im Merge!")

    # HTML einlesen — preserve original line endings (CRLF unter Windows)
    with open(HTML, "r", encoding="utf-8", newline="") as f:
        html = f.read()
    # Backup falls noch nicht vorhanden
    if not BACKUP.exists():
        with open(BACKUP, "w", encoding="utf-8", newline="") as f:
            f.write(html)
        print(f"[backup] {BACKUP.name} erstellt")

    arr_start, arr_end = find_episodes_range(html)
    print(f"[range] EPISODES Array: {arr_start} .. {arr_end} ({arr_end-arr_start} bytes)")

    rendered = render_array(merged)
    new_html = html[:arr_start] + rendered + html[arr_end:]

    # ----------------- Header-Meta anpassen -----------------
    total = len(merged)
    chapter_count = sum(1 for e in merged if e.get("chapters"))

    # Version-Label
    new_html = re.sub(
        r"<strong>v\s*\d+(?:\.\d+)?\s*·\s*Channel-Guide</strong>",
        "<strong>v 3 · Channel-Guide</strong>",
        new_html,
    )
    # "30 Folgen · DE & EN"
    new_html = re.sub(
        r"(<strong>v\s*3[^<]*</strong>\s*\n?\s*)\d+\s+Folgen\s+·\s+DE\s+&\s+EN",
        rf"\g<1>{total} Folgen · DE & EN",
        new_html,
    )
    # "Stand · Mai 2026" -> aktualisieren
    new_html = re.sub(
        r"Stand\s+·\s+\w+\s+\d{4}",
        "Stand · Mai 2026",
        new_html,
    )

    # Orientation-Text
    new_html = re.sub(
        r"(seit\s+knapp\s+einem\s+Jahr\s+live,\s+)\d+\s+Folgen\s+sind\s+raus",
        rf"\g<1>{total} Folgen sind raus",
        new_html,
    )
    new_html = re.sub(
        r"\(bei\s+\d+\s+Folgen\s+detailliert\s+eingepflegt\)",
        f"(bei {chapter_count} Folgen detailliert eingepflegt)",
        new_html,
    )

    # Result-Count im Filter-Bar: "<strong id="result-count">30</strong> von 30 Folgen"
    new_html = re.sub(
        r'(<strong id="result-count">)\d+(</strong>\s*von\s*)\d+\s+Folgen',
        rf"\g<1>{total}\g<2>{total} Folgen",
        new_html,
    )

    # Hero-Subtitle: "NNN Folgen aus dem Daten-WG-Podcast"
    new_html = re.sub(
        r'(<p class="subtitle">)\d+(\s+Folgen aus dem)',
        rf"\g<1>{total}\g<2>",
        new_html,
    )

    # Header-Stats: "<strong>NNN</strong>Folgen" und "<strong>NNN</strong>Transkripte"
    new_html = re.sub(
        r'(<span class="header-stat"><strong>)\d+(</strong>Folgen</span>)',
        rf"\g<1>{total}\g<2>",
        new_html,
    )
    # Transcripte: aus transcripts.json zaehlen, falls vorhanden
    transcripts_count = 0
    try:
        tdata = json.loads((ROOT / "transcripts.json").read_text(encoding="utf-8"))
        transcripts_count = sum(1 for v in tdata.values() if v.get("text"))
    except Exception:
        pass
    if transcripts_count:
        new_html = re.sub(
            r'(<span class="header-stat"><strong>)\d+(</strong>Transkripte</span>)',
            rf"\g<1>{transcripts_count}\g<2>",
            new_html,
        )

    # Bucket-Tile-Counts ersetzen: jeder Tile hat einen festen Bucket-Index
    # Wir suchen Bloecke `<a class="bucket-tile" href="#bucket-N" ... <div class="bucket-tile-count">M Folge[n]</div>`
    def replace_tile_count(match):
        prefix = match.group(1)
        bucket_id = match.group(2)
        middle = match.group(3)
        n = bucket_counts.get(bucket_id, 0)
        new_count = f"{n} {folge_word(n)}"
        return f"{prefix}{bucket_id}{middle}<div class=\"bucket-tile-count\">{new_count}</div>"

    tile_rx = re.compile(
        r'(<a class="bucket-tile" href="#)(bucket-\d)(".*?)<div class="bucket-tile-count">[^<]*</div>',
        re.DOTALL,
    )
    new_html = tile_rx.sub(replace_tile_count, new_html)

    with open(HTML, "w", encoding="utf-8", newline="") as f:
        f.write(new_html)
    print(f"[done] HTML aktualisiert: {HTML.name}")

    # Mirror auf index.html, damit GitHub Pages das als Root-URL ausliefert
    index_html = ROOT / "index.html"
    with open(index_html, "w", encoding="utf-8", newline="") as f:
        f.write(new_html)
    print(f"[done] HTML gespiegelt: {index_html.name} (fuer GitHub Pages)")
    print(f"        total={total}  mit_chapters={chapter_count}")


if __name__ == "__main__":
    main()
