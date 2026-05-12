#!/usr/bin/env python3
"""Klassifiziert die videos_raw.json in 9 Buckets und schreibt videos.json.

Schema-Output entspricht exakt dem JS-Schema in CLAUDE.md:
  bucket, title, guest, solo, date, duration, lang, desc, tags, ytId, chapters, podcastUrl
"""
import io
import json
import re
import sys
from pathlib import Path

try:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
except Exception:
    pass

ROOT = Path(__file__).parent.parent
IN_RAW = ROOT / "videos_raw.json"
OUT = ROOT / "videos.json"

# Reihenfolge ist wichtig: erste passende Regel gewinnt.
# Jede Regel: (bucket_id, [tag-keywords...], [optional check_title_only_keywords])
# Wir matchen die keywords gegen Titel UND Beschreibung (lowercased).
# title_strong = nur im TITEL prüfen (für "self-service" etc., wo Description irreführen kann)
BUCKET_RULES = [
    # ---- bucket-1: Updates & News (sehr spezifische Titel) ----
    ("bucket-1", [
        "quarterly", "fabric quarterly", "power bi quarterly",
        "power bi update", "fabric update", "monatlich update",
        "monthly update", "ignite recap", "fabcon recap",
        "power bi update januar", "power bi update februar",
        "power bi update mai", "power bi update juni",
    ], "title"),
    # ---- bucket-9: Event · Daten-WG-Konferenz, Pre-Events ----
    ("bucket-9", [
        "wie war die daten-wg", "rückblick daten-wg",
        "daten-wg konferenz", "datenwg konferenz",
        "pre-event von", "data:unplugged",
        "datenslam", "data slam", "dataciders",
        "fabric data days vortrag",
    ], "any"),
    # ---- bucket-4: Self-Service / Governance (vor bucket-2!) ----
    ("bucket-4", [
        "self-service", "selfservice", "self service",
        "shadow it", "citizen developer",
        "prinzipien oder paragrafen", "prinzipien oder paragraphen",
        "principles or paragraphs",
        "ist governance", "is governance",
    ], "title"),
    # ---- bucket-7: Karriere & Community (vor bucket-2!) ----
    ("bucket-7", [
        "karriere", "user group", "user-group", "power of user",
        "mvp", "from finance to fabric", "from oracle",
        "passion beats", "mensch bleiben", "mehr als pbix",
        "more than pbix", "how to fullstack",
        "fabric-datendienstleister", "wenn power bi geht",
    ], "title"),
    # ---- bucket-8: Strategie & Big Picture ----
    ("bucket-8", [
        "digitalisierung", "digitalization for 20",
        "10 jahre bi", "10 jahre power bi", "10 years",
        "bullwhip", "cucumber crisis", "supply chain",
        "von patronen zu prozessen",
    ], "title"),
    # ---- bucket-5: Visualisierung & IBCS ----
    ("bucket-5", [
        "ibcs", "deneb", "vega", "write back",
        "writeback", "boring charts", "chart design",
        "dashboard design", "ggplot",
        "y-axis", "y-achse", "sekundär-achse",
        "secondary y-axis", "drill-through", "drillthrough",
        "azure maps", "regionen in azure",
        "declarative visualization", "theme file",
        "broken power bi theme", "visual dynamisch",
    ], "title"),
    # ---- bucket-3: Datenmodellierung ----
    ("bucket-3", [
        "datenmodell", "data model", "modellierung ist",
        "data modeling", "thinking in tables",
        "dax", "stern-schema", "star schema",
        "data vault", "mythos data vault",
        "metadaten", "expanded tables",
        "field parameters", "feldparameter",
        "multi parameter tabelle", "visual calculations",
        "bi thinkers talk", "tmdl magie",
    ], "title"),
    # ---- bucket-2: Microsoft Fabric ----
    ("bucket-2", [
        "fabric", "lakehouse", "onelake", "direct lake",
        "open mirroring", "warehouse",
        "shortcut", "fabric notebook", "fabric capacity",
        "real-time analytics in fabric",
        "600 sql-tabellen", "in fabric",
        "fabric data days", "ssis",
    ], "any"),
    # ---- bucket-6: Power BI Deep Dive (default tech) ----
    ("bucket-6", [
        "power bi", "powerbi", "pbix", "pbir", "pbip", "tmdl",
        "qlik", "tableau", "cognos", "vergleich",
        "url parameter", "pages via url",
        "power bi tutorial", "power bi visual",
        "copilot", "power automate", "forms",
        "ki", "ai dubbed", "iron man",
        "willkommen auf dem daten-wg kanal",
        "daten für ki",
    ], "any"),
]

# Reihenfolge: pretty-Tags pro Stichwort
TAG_MAP = {
    "fabric": "Fabric",
    "lakehouse": "Lakehouse",
    "onelake": "OneLake",
    "direct lake": "Direct Lake",
    "open mirroring": "Mirroring",
    "fabric notebook": "Notebook",
    "fabric data days": "Fabric Data Days",
    "warehouse": "Warehouse",
    "shortcuts": "Shortcuts",
    "power bi": "Power BI",
    "powerbi": "Power BI",
    "pbix": "Power BI",
    "pbir": "PBIR",
    "pbip": "PBIP",
    "tmdl": "TMDL",
    "ssis": "SSIS",
    "url parameter": "URL Params",
    "pages via url": "URL Params",
    "qlik": "Qlik",
    "tableau": "Tableau",
    "vergleich": "Vergleich",
    "10 jahre power bi": "10 Jahre Power BI",
    "dax": "DAX",
    "datenmodell": "Datenmodell",
    "data model": "Datenmodell",
    "modellierung": "Modellierung",
    "modeling": "Modellierung",
    "stern-schema": "Stern-Schema",
    "star schema": "Stern-Schema",
    "data vault": "Data Vault",
    "vault": "Data Vault",
    "metadaten": "Metadaten",
    "thinking in tables": "Tabellen-Denken",
    "expanded tables": "Expanded Tables",
    "relationship": "Relationships",
    "feldparameter": "Field Parameters",
    "field parameters": "Field Parameters",
    "key-tabelle": "Key-Tabelle",
    "self-service": "Self-Service",
    "selfservice": "Self-Service",
    "self service": "Self-Service",
    "governance": "Governance",
    "citizen developer": "Citizen Dev",
    "shadow it": "Shadow IT",
    "compliance": "Compliance",
    "prinzipien oder paragraphen": "Prinzipien",
    "principles or paragraphs": "Prinzipien",
    "ibcs": "IBCS",
    "deneb": "Deneb",
    "vega": "Vega",
    "writeback": "Writeback",
    "boring charts": "Boring Charts",
    "chart design": "Chart Design",
    "dashboard design": "Dashboard Design",
    "ggplot in power bi": "ggplot",
    "y-axis": "Y-Achse",
    "y-achse": "Y-Achse",
    "secondary y": "Y-Achse",
    "sekundär-achse": "Y-Achse",
    "drill-through": "Drill-Through",
    "drillthrough": "Drill-Through",
    "azure maps": "Azure Maps",
    "regionen in azure": "Maps",
    "declarative visualization": "Visualisierung",
    "quarterly": "Quarterly",
    "power bi update": "Update",
    "fabric update": "Update",
    "monatlich update": "Update",
    "monthly update": "Update",
    "ignite recap": "Ignite",
    "fabcon recap": "FabCon",
    "karriere": "Karriere",
    "career": "Karriere",
    "community": "Community",
    "user group": "User Group",
    "user-group": "User Group",
    "mvp": "MVP",
    "from finance to fabric": "Career-Switch",
    "from oracle": "Career-Switch",
    "journey": "Journey",
    "passion": "Mensch",
    "mensch hinter": "Mensch",
    "menschen hinter": "Mensch",
    "wie kam zu": "Journey",
    "digitalisierung": "Digitalisierung",
    "digitalization": "Digitalisierung",
    "strategie": "Strategie",
    "strategy": "Strategie",
    "transformation": "Transformation",
    "mittelstand": "Mittelstand",
    "bullwhip": "Supply Chain",
    "supply chain": "Supply Chain",
    "20 jahre": "Big Picture",
    "20 years": "Big Picture",
    "daten-wg 2025": "Daten-WG 2025",
    "daten-wg 2026": "Daten-WG 2026",
    "daten-wg konferenz": "Konferenz",
    "datenwg konferenz": "Konferenz",
    "wie war die daten-wg": "Rückblick",
    "rückblick daten-wg": "Rückblick",
    "rueckblick daten-wg": "Rückblick",
    "pre-event": "Pre-Event",
}

CHAPTER_RX = re.compile(
    r"^\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—:]?\s*(.+?)\s*$",
    re.MULTILINE,
)

GUEST_RX = re.compile(
    r"\b(?:mit|with|featuring|feat\.?|x)\s+([A-ZÄÖÜ][\w\-']+(?:\s+[A-ZÄÖÜ][\w\-']+){1,3})",
    re.IGNORECASE,
)

PODCAST_RX = re.compile(r"https?://(?:www\.)?podcast\.de/[^\s)\]]+", re.IGNORECASE)


def detect_lang(title: str, desc: str) -> str:
    text = f"{title} {desc[:400]}".lower()
    # Englisch-Indikatoren
    en_markers = [
        " with ", "data-wg podcast", "data working group", "data flat share",
        "thinking in tables", "what is ", "where is my data",
        "is governance", "how to use", "declarative visualization",
        "open mirroring", "for 20 years", "does anyone really",
        " from ", " bullwhip ", "principles or paragraphs",
        "boring charts", "why passion", "from oracle",
        " how to ", " is winning", " to write back", "of user groups",
        "from finance to fabric", "more than pbix",
        "data modeling is", "data belongs",
    ]
    de_markers = [
        " mit ", " warum ", " wie ", " für ", " ist ", " hat ", " kann ",
        "rückblick", "monatlich", "quartal", " der ", " die ", " das ",
        " den ", " ein ", " eine ", "wenn ", "kanal", "tutorial",
        "vorbereiten", "willkommen", "feedback-alarm", "tabellen",
        " bringst du", "deine", "deinen", "deinem",
    ]
    en_score = sum(1 for m in en_markers if m in text)
    de_score = sum(1 for m in de_markers if m in text)
    # Wenn EN klar dominant
    if en_score >= 2 and en_score >= de_score:
        return "EN"
    # Wenn der Titel mit englischer Konstruktion startet
    t_lower = title.lower().strip()
    if any(t_lower.startswith(p) for p in (
        "the ", "how to", "from ", "what is", "where is", "why ",
        "thinking", "more than", "boring ", "open mirroring",
        "data modeling", "declarative", "understanding ",
        "sorting drill", "control power bi", "analytics speed",
        "data projects",
    )):
        return "EN"
    if "data-wg podcast" in text or "data working group" in text or "data flat share" in text:
        return "EN"
    return "DE"


def classify(title: str, desc: str) -> tuple[str, list[str]]:
    title_l = title.lower()
    desc_l = (desc or "").lower()
    haystack = f"{title_l}\n{desc_l}"
    chosen_bucket = None
    tags: list[str] = []
    for bucket_id, keywords, scope in BUCKET_RULES:
        target = title_l if scope == "title" else haystack
        hits = [k for k in keywords if k in target]
        if hits and chosen_bucket is None:
            chosen_bucket = bucket_id
        # tags trotzdem sammeln, fuer einen reicheren tag-set
        # (auch wenn anderes Bucket gewinnt — bringt Vielfalt)
        for k in hits:
            t = TAG_MAP.get(k)
            if t and t not in tags:
                tags.append(t)
    if chosen_bucket is None:
        chosen_bucket = "bucket-6"
        if "Unsortiert" not in tags:
            tags.append("Unsortiert")
    return chosen_bucket, tags


def parse_chapters(description: str, structured: list | None) -> list[list[str]]:
    """Bevorzugt strukturierte Kapitel von YouTube, sonst Regex auf Description."""
    if structured:
        out = []
        for ch in structured:
            t = ch.get("start_time")
            title = (ch.get("title") or "").strip()
            if t is None or not title:
                continue
            # Format HH:MM:SS oder MM:SS
            seconds = int(t)
            h, rem = divmod(seconds, 3600)
            m, s = divmod(rem, 60)
            ts = f"{h}:{m:02d}:{s:02d}" if h else f"{m:02d}:{s:02d}"
            out.append([ts, title])
        if out:
            return out

    if not description:
        return []
    out = []
    seen = set()
    skip_starts = ("http", "links", "quellen", "gast", "host", "kapitel:")
    for m in CHAPTER_RX.finditer(description):
        ts, title = m.group(1), m.group(2).strip()
        if not title or title.lower().startswith(skip_starts):
            continue
        # Vorne stehender Bindestrich aus zB " - Intro"
        title = title.lstrip("-–—:").strip()
        if len(title) < 2 or len(title) > 200:
            continue
        if ts in seen:
            continue
        seen.add(ts)
        out.append([ts, title])
    # Mindestens 2 Kapitel, sonst macht es keinen Sinn
    if len(out) < 2:
        return []
    return out


def extract_guest(title: str) -> tuple[str, bool]:
    """Liefert (guest_name, solo_flag)."""
    # Pattern: "Title | ... mit Vorname Nachname"
    m = GUEST_RX.search(title)
    if m:
        return m.group(1).strip(), False
    # Pattern: "Title - Vorname Nachname" am Ende
    tail = title.split("-")[-1].strip() if "-" in title else ""
    # Heuristisch: Zwei Worte am Ende mit Caps
    m2 = re.search(r"([A-ZÄÖÜ][\w]+\s+[A-ZÄÖÜ][\w]+)\s*$", tail)
    if m2 and len(tail) < 40:
        return m2.group(1), False
    return "", True


def short_desc(desc: str) -> str:
    """Kurze 2-3 Satz-Zusammenfassung aus den ersten Zeilen."""
    if not desc:
        return ""
    # Erste Zeilen nehmen die keine Links/Hashtags sind
    paragraphs = []
    for line in desc.splitlines():
        line = line.strip()
        if not line:
            if paragraphs:
                break
            continue
        if line.startswith(("http", "#", "Links", "Quellen", "Kapitel", "Daten-WG", "Gast:", "Host:", "00:", "0:0")):
            continue
        if re.match(r"^\d+:\d{2}", line):
            continue
        paragraphs.append(line)
        if len(" ".join(paragraphs)) > 280:
            break
    text = " ".join(paragraphs).strip()
    if not text:
        # Fallback: erste 280 Zeichen, Links rausgefiltert
        text = re.sub(r"https?://\S+", "", desc).strip()
    # Auf erste 2-3 Saetze kuerzen
    sentences = re.split(r"(?<=[.!?])\s+", text)
    snippet = " ".join(sentences[:3]).strip()
    if len(snippet) > 360:
        snippet = snippet[:357].rstrip() + "..."
    return snippet


def format_date(yyyymmdd: str | None) -> str:
    if not yyyymmdd or len(yyyymmdd) != 8:
        return ""
    months_de = [
        "", "Januar", "Februar", "März", "April", "Mai", "Juni",
        "Juli", "August", "September", "Oktober", "November", "Dezember"
    ]
    y, m, d = yyyymmdd[:4], yyyymmdd[4:6], yyyymmdd[6:8]
    try:
        mi = int(m)
        return f"{months_de[mi]} {y}"
    except Exception:
        return f"{y}-{m}-{d}"


def format_duration(seconds: int | None) -> str:
    if not seconds:
        return ""
    seconds = int(seconds)
    m = round(seconds / 60)
    return f"{m} min"


def find_podcast_url(desc: str) -> str | None:
    if not desc:
        return None
    m = PODCAST_RX.search(desc)
    return m.group(0) if m else None


def pretty_title(raw: str) -> str:
    """Saeubert YouTube-Titel: schneidet ' | Daten-WG Podcast ...' Trailer ab."""
    if not raw:
        return ""
    t = raw.strip()
    # Strip duplicate noise endings
    for cut in [" | Daten-WG", " | Data-WG", " | Data Working", " | Data Flat Share", " | Datenwerkstatt"]:
        idx = t.find(cut)
        if idx > 20:
            t = t[:idx].strip()
            break
    return t


def main():
    raw = json.loads(IN_RAW.read_text(encoding="utf-8"))
    out = []
    bucket_counts: dict[str, int] = {}
    unsorted_count = 0
    for v in raw:
        vid = v.get("id")
        title_raw = v.get("title") or ""
        desc = v.get("description") or ""
        bucket, tags = classify(title_raw, desc)
        bucket_counts[bucket] = bucket_counts.get(bucket, 0) + 1
        if "Unsortiert" in tags:
            unsorted_count += 1
        lang = detect_lang(title_raw, desc)
        # Sprache als letzten Tag anhaengen
        if lang not in tags:
            tags.append(lang)
        guest, solo = extract_guest(title_raw)
        chapters = parse_chapters(desc, v.get("chapters"))
        episode = {
            "bucket": bucket,
            "title": pretty_title(title_raw),
            "guest": guest,
            "solo": solo,
            "date": format_date(v.get("upload_date")),
            "duration": format_duration(v.get("duration")),
            "lang": lang,
            "desc": short_desc(desc),
            "tags": tags,
            "ytId": vid,
            "chapters": chapters,
            "podcastUrl": find_podcast_url(desc),
            "_upload_date": v.get("upload_date"),  # interne Sortierung
        }
        out.append(episode)
    # Sortierung: Bucket, dann Upload-Datum absteigend
    out.sort(key=lambda e: (e["bucket"], -int(e.get("_upload_date") or "00000000")))

    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[done] {len(out)} Episoden klassifiziert -> {OUT.name}")
    print(f"  Bucket-Verteilung:")
    for b in sorted(bucket_counts.keys()):
        print(f"    {b}: {bucket_counts[b]}")
    print(f"  Unsortiert-Fallbacks: {unsorted_count} ({100*unsorted_count/len(out):.0f}%)")


if __name__ == "__main__":
    main()
