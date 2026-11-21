#!/usr/bin/env python3
"""Ergaenzt fehlende Head-Metadaten in den HTML-Seiten im Wurzelordner.

Pro Seite (nur <head>, nur Ergaenzungen, vorhandene Tags bleiben unangetastet):
  - <meta name="description">      (feste Zuordnung DESCRIPTIONS, nur wenn fehlend)
  - <link rel="canonical">
  - hreflang de / en / x-default   (fuer Paare X.html / X_en.html)
  - Open Graph (type, site_name, title, description, url, image, image:width,
    image:height, locale) und twitter:card

Aufruf
------
    python3 scripts/build_head_meta.py            # schreibt Aenderungen
    python3 scripts/build_head_meta.py --dry-run  # zeigt nur, was passieren wuerde
    python3 scripts/build_head_meta.py --check    # nur Pruefung (Exit 1 bei Luecken)

Der Lauf ist idempotent: ein zweiter Lauf meldet "0 Aenderungen".
Neue Seiten werden automatisch mit erfasst; Sonderfaelle stehen in SKIP_*.
Fehlt fuer eine neue Seite die Meta-Description, meldet das Skript sie am Ende
(dann einen Eintrag in DESCRIPTIONS ergaenzen) und laesst OG-Description aus.

Bilder: scripts/build_og_images.py erzeugt assets/og/<seite>.jpg (1200x630).
Erst Bilder bauen, dann dieses Skript laufen lassen; fehlt die Datei, wird
og:image uebersprungen und gemeldet.
"""
import argparse
import html as htmllib
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://datenwgknowledgekitchen.com"
SITE_NAME = "Daten-WG Knowledge Kitchen"
OG_W, OG_H = 1200, 630

# Seiten, die gar nicht angefasst werden (Verifizierungsdatei).
SKIP_FILES = {"google9e6d5c62ea939101.html"}

# Sonderfaelle ohne canonical/OG/hreflang (Begruendung steht im Bericht).
SKIP_CANONICAL = {
    "daten_wg_learn_buckets.html",    # inhaltlicher Zwilling von folgen.html
    "koelner-raser-story-v1.html",    # alte Fassung
    "koelner-raser-story-v2.html",    # alte Fassung
    "pnl-treiberbaum-standalone.html",  # gebuendelte 14-MB-Variante der Demo
    "zugfahrten-europa-2024.html",    # iframe-Variante in zugfahrten-infografik
    "zugfahrten-europa-2024-animiert.html",  # animierte Variante davon
}

# og:type article (Beitraege, Geschichten, Vortraege, Whitepaper); sonst website.
ARTICLE = {
    "der-unsichtbare-kampf-post", "fabric-alchemie-post",
    "fabric-apps-controlling-post", "fabric-apps-controlling-post_en",
    "finance-reporting-budapest-post", "finance-reporting-budapest-post_en",
    "koelner-raser-post", "koelner-raser-story", "mobilitaets-karte-post",
    "mockupkitchen-post", "pnl-beta-post", "pnl-beta-post_en",
    "sankey-wasserfall-post", "sankey-wasserfall-post_en",
    "kitchen-fuer-ki-agenten", "ki-entwicklung-zehn-tage",
    "ki-entwicklung-zehn-tage_en", "whitepaper-ki-entwicklung-roi",
    "whitepaper-ki-entwicklung-roi_en", "whitepaper-strommix", "strommix-story",
    "rhein-story", "zwei-heimaten", "waermestreifen-3d", "eauto-klimabilanz",
    "powerbi-design-skill", "prototyping-pnl-treiberbaum",
    "prototyping-pnl-treiberbaum_en", "wissensgraph-aus-transkripten",
    "zugfahrten-infografik", "pdoom-ki-risiko", "power-bi-on-claude",
    "power-bi-on-claude-details", "morally_aligned_ai", "morally_aligned_ai_en",
}

# Gemeinsames Standardbild fuer Rechtsseiten.
DEFAULT_IMAGE_PAGES = {"impressum", "datenschutz"}

# Feste Zuordnung Dateiname -> Meta-Description (120 bis 160 Zeichen).
DESCRIPTIONS = {
    "business-chart-builder.html":
        "Browser-Werkzeug für Business-Charts in semantischer Notation: Diagrammtyp wählen, "
        "Szenarien vergleichen, IBCS-Check, Export als PNG, SVG oder Vega für Deneb.",
    "datenschutz.html":
        "Datenschutzerklärung der Daten-WG Knowledge Kitchen: Verantwortlicher, Hosting bei "
        "GitHub, lokal gespeicherte Einstellungen und Einbettungen externer Anbieter.",
    "impressum.html":
        "Impressum der Daten-WG Knowledge Kitchen nach § 5 DDG: Diensteanbieter in Köln, "
        "Kontakt, inhaltlich Verantwortlicher und Haftungshinweise.",
    "fabric_einsteiger_guide_v1.html":
        "Einsteiger-Guide zu Microsoft Fabric für Power-BI-Kenner: OneLake, Lakehouse, Warehouse, "
        "Pipelines und Direct Lake mit End-to-End-Beispiel und Snowflake.",
    "power_bi_einsteiger_guide_v4.html":
        "Einsteiger-Guide Power BI von A bis Z: zehn Sektionen von Datenanbindung über Query "
        "Folding, DAX und IBCS bis Service und RLS, mit Schritt-für-Schritt-Karten.",
    "fermi_paradox_en.html":
        "Interactive Fermi paradox simulation: how fast one technological civilization with a "
        "sub-light drive could spread across the Milky Way. Parameters adjustable.",
    "ibcs-trainer.html":
        "Lernspiel zu den IBCS-Regeln: Quiz mit 25 Fragen und acht fehlerhaften Charts zum Erkennen, "
        "wahlweise mit Zeit und Highscore oder in Ruhe, dazu ein Spickzettel.",
    "morally_aligned_ai.html":
        "Begleitseite zum Daten-Grillen-Vortrag über moralisch ausgerichtete KI: sechs spielbare "
        "Module vom Fermi-Paradoxon bis zum AI-Dilemma, mit Thesen und Quellen.",
    "morally_aligned_ai_en.html":
        "Companion page to the Daten Grillen talk on morally aligned AI: six playable modules from "
        "the Fermi paradox to the AI dilemma, with theses and sources.",
    "pdoom-rollen.html":
        "p(doom)-Schätzungen zur KI-Katastrophe nach Rolle: Forschung, Industrie, Journalismus, "
        "Prognose und Umfragen im Vergleich, jeder Punkt eine öffentliche Aussage.",
    "pdoom-verteilung.html":
        "Verteilung der p(doom)-Schätzungen zur KI-Katastrophe: wie viele der 57 öffentlichen "
        "Zahlenwerte aus den Jahren 2011 bis 2025 in welchen Wertebereich fallen.",
    "pdoom-zeitverlauf.html":
        "Interaktive Grafik der p(doom)-Schätzungen von 2011 bis 2025: wer wann wie hoch schätzt "
        "und wo die eigene Schätzung im Vergleich liegt.",
    "pnl-treiberbaum-standalone.html":
        "Eigenständige Einzeldatei der interaktiven Profit-and-Loss-Demo mit Treiberbaum: GuV "
        "als Baum, EBIT-Brücke und Treiber-Simulation, direkt im Browser.",
    "rhein-story.html":
        "Datengeschichte zum Rhein bei Köln: 209 Jahre Abflussdaten von 1816 bis 2025 und warum "
        "ein Klimasignal im Rauschen untergeht, obwohl es in den Daten steckt.",
    "zugfahrten-europa-2024.html":
        "Metro-Karte der Zugfahrten pro Kopf in Europa 2024 nach Eurostat: Die Schweiz liegt weit "
        "vor dem europäischen Median, die Länder sind nach Rang angeordnet.",
    "zugfahrten-europa-2024-animiert.html":
        "Animierte Metro-Karte der Zugfahrten pro Kopf in Europa 2024 nach Eurostat: Die Länder "
        "bauen sich nach Rang auf, die Schweiz liegt weit vor dem Median.",
}

# Korrekturen an bestehenden Descriptions: Datei -> (alt, neu).
DESCRIPTION_FIXES = {
    "chartkitchen-schnellstart.html": ("13 IBCS-inspirierte Modi", "14 IBCS-inspirierte Modi"),
    "chartkitchen-schnellstart_en.html": ("13 IBCS-inspired modes", "14 IBCS-inspired modes"),
}

# Reihenfolge der Tags im Head (angelehnt an mobilitaets-karte-post.html).
ORDER = [
    "description", "canonical", "hl:de", "hl:en", "hl:x-default",
    "og:type", "og:site_name", "og:title", "og:description", "og:url",
    "og:image", "og:image:width", "og:image:height", "og:locale", "twitter:card",
]


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def mask(head):
    """Kommentare, Skripte, Styles durch Leerzeichen gleicher Laenge ersetzen."""
    def blank(m):
        return re.sub(r"[^\n]", " ", m.group(0))
    head = re.sub(r"<!--.*?-->", blank, head, flags=re.S)
    return re.sub(r"<(script|style)\b.*?</\1>", blank, head, flags=re.S | re.I)


def find_tag(masked, key):
    """Gibt (start, end) des vorhandenen Tags oder None zurueck."""
    if key == "description":
        pat = r'<meta\b(?=[^>]*\bname\s*=\s*["\']description["\'])[^>]*>'
    elif key == "canonical":
        pat = r'<link\b(?=[^>]*\brel\s*=\s*["\']canonical["\'])[^>]*>'
    elif key.startswith("hl:"):
        pat = (r'<link\b(?=[^>]*\brel\s*=\s*["\']alternate["\'])'
               r'(?=[^>]*\bhreflang\s*=\s*["\']' + re.escape(key[3:]) + r'["\'])[^>]*>')
    elif key == "twitter:card":
        pat = r'<meta\b(?=[^>]*\bname\s*=\s*["\']twitter:card["\'])[^>]*>'
    else:
        pat = r'<meta\b(?=[^>]*\bproperty\s*=\s*["\']' + re.escape(key) + r'["\'])[^>]*>'
    m = re.search(pat, masked, re.I)
    return (m.start(), m.end()) if m else None


def attr(tag, name):
    m = re.search(r'\b' + name + r'\s*=\s*("([^"]*)"|\'([^\']*)\')', tag, re.I)
    return (m.group(2) if m.group(2) is not None else m.group(3)) if m else None


def insert_after(head, masked, pos_end, text):
    """Fuegt text als neue Zeile nach dem Tag ein (Einrueckung der Ankerzeile)."""
    line_start = head.rfind("\n", 0, pos_end) + 1
    indent = re.match(r"[ \t]*", head[line_start:]).group(0)
    rest_end = head.find("\n", pos_end)
    rest = head[pos_end:rest_end if rest_end != -1 else len(head)]
    if rest.strip() == "":
        return head[:pos_end] + "\n" + indent + text + head[pos_end:]
    return head[:pos_end] + text + head[pos_end:]


def eligible_pages(root):
    pages = sorted(p.name for p in root.glob("*.html"))
    return [p for p in pages if p not in SKIP_FILES]


def pair_of(name, root):
    """Gibt (de_name, en_name) zurueck, wenn die Seite zu einem Paar gehoert."""
    stem = name[:-5]
    if stem.endswith("_en"):
        de = stem[:-3] + ".html"
        return (de, name) if (root / de).exists() else None
    en = stem + "_en.html"
    return (name, en) if (root / en).exists() else None


def og_image_for(stem, root):
    """Relativer Pfad des zu erzeugenden/vorhandenen OG-Bilds oder None."""
    base = "default" if stem in DEFAULT_IMAGE_PAGES else stem
    rel = f"assets/og/{base}.jpg"
    return rel if (root / rel).exists() else None


def image_size(path):
    try:
        from PIL import Image
        with Image.open(path) as im:
            return im.size
    except Exception:
        return None


def process(name, root, notes):
    path = root / name
    raw = path.read_bytes().decode("utf-8")
    m = re.search(r"</head\s*>", raw, re.I)
    if not m:
        notes["nohead"].append(name)
        return raw, raw, []
    head, tail = raw[:m.start()], raw[m.start():]
    orig_head = head
    changes = []
    stem = name[:-5]
    lang_m = re.search(r'<html[^>]*\blang\s*=\s*["\']([^"\']+)', head, re.I)
    lang = (lang_m.group(1).lower()[:2] if lang_m else "de")

    def masked():
        return mask(head)

    # 1) Descriptions (Korrektur, dann Ergaenzung)
    if name in DESCRIPTION_FIXES:
        old, new = DESCRIPTION_FIXES[name]
        pos = find_tag(masked(), "description")
        if pos:
            tag = head[pos[0]:pos[1]]
            if old in tag:
                head = head[:pos[0]] + tag.replace(old, new) + head[pos[1]:]
                changes.append("description-fix")

    skip_seo = name in SKIP_CANONICAL
    want = {}
    if name in DESCRIPTIONS and not find_tag(masked(), "description"):
        want["description"] = f'<meta name="description" content="{esc(DESCRIPTIONS[name])}">'

    if not skip_seo:
        url = BASE + "/" if name == "index.html" else f"{BASE}/{name}"
        want["canonical"] = f'<link rel="canonical" href="{url}">'
        pr = pair_of(name, root)
        if pr and pr[0] not in SKIP_CANONICAL and pr[1] not in SKIP_CANONICAL:
            de_url, en_url = f"{BASE}/{pr[0]}", f"{BASE}/{pr[1]}"
            want["hl:de"] = f'<link rel="alternate" hreflang="de" href="{de_url}">'
            want["hl:en"] = f'<link rel="alternate" hreflang="en" href="{en_url}">'
            want["hl:x-default"] = f'<link rel="alternate" hreflang="x-default" href="{de_url}">'
        # Open Graph
        want["og:type"] = f'<meta property="og:type" content="{"article" if stem in ARTICLE else "website"}">'
        want["og:site_name"] = f'<meta property="og:site_name" content="{SITE_NAME}">'
        want["og:url"] = f'<meta property="og:url" content="{url}">'
        want["og:locale"] = f'<meta property="og:locale" content="{"en_US" if lang == "en" else "de_DE"}">'
        want["twitter:card"] = '<meta name="twitter:card" content="summary_large_image">'
        t = re.search(r"<title[^>]*>(.*?)</title>", head, re.S | re.I)
        if t:
            title = htmllib.unescape(re.sub(r"\s+", " ", t.group(1)).strip())
            title = re.sub(r"\s·\sDaten-WG$", "", title)
            want["og:title"] = f'<meta property="og:title" content="{esc(title)}">'

    # Reihenfolge abarbeiten; og:description/og:image brauchen den aktuellen Stand
    for key in ORDER:
        if key == "og:description" and not skip_seo:
            pos = find_tag(masked(), "description")
            if pos:
                d = attr(head[pos[0]:pos[1]], "content")
                want[key] = f'<meta property="og:description" content="{d}">'
            else:
                notes["nodesc"].append(name)
        if key in ("og:image", "og:image:width", "og:image:height") and not skip_seo:
            pos = find_tag(masked(), "og:image")
            if key == "og:image":
                if not pos:
                    rel = og_image_for(stem, root)
                    if rel:
                        want[key] = f'<meta property="og:image" content="{BASE}/{rel}">'
                    else:
                        notes["noimage"].append(name)
            else:
                # Breite/Hoehe nur, wenn das Bild lokal lesbar ist
                src = None
                if pos:
                    c = attr(head[pos[0]:pos[1]], "content") or ""
                elif "og:image" in want:
                    c = attr(want["og:image"], "content")
                else:
                    c = ""
                if c.startswith(BASE + "/"):
                    src = root / c[len(BASE) + 1:]
                if src and src.exists():
                    sz = image_size(src)
                    if sz:
                        want[key] = (f'<meta property="{key}" '
                                     f'content="{sz[0] if key.endswith("width") else sz[1]}">')
        if key not in want or find_tag(masked(), key):
            continue
        mk = masked()
        anchor = None
        for prev in reversed(ORDER[:ORDER.index(key)]):
            p = find_tag(mk, prev)
            if p:
                anchor = p[1]
                break
        if anchor is None:
            tm = re.search(r"</title\s*>", mk, re.I)
            if tm:
                anchor = tm.end()
            else:
                vm = re.search(r"<meta[^>]*charset[^>]*>", mk, re.I)
                anchor = vm.end() if vm else None
        if anchor is None:
            notes["noanchor"].append(name)
            continue
        head = insert_after(head, mk, anchor, want[key])
        changes.append(key)

    return orig_head + tail, head + tail, changes


def audit(root, notes):
    """Pruefung: OG-Bild-URLs zeigen auf lokale Dateien."""
    problems = []
    for name in eligible_pages(root):
        raw = (root / name).read_text(encoding="utf-8")
        m = re.search(r"</head\s*>", raw, re.I)
        head = mask(raw[:m.start()]) if m else ""
        pos = find_tag(head, "og:image")
        if not pos:
            continue
        c = attr(raw[pos[0]:pos[1]], "content") or ""
        if c.startswith(BASE + "/"):
            f = root / c[len(BASE) + 1:]
            if not f.exists():
                problems.append(f"{name}: og:image fehlt lokal: {c}")
        else:
            problems.append(f"{name}: og:image nicht auf eigener Domain: {c}")
    return problems


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()

    for n, d in DESCRIPTIONS.items():
        if not 120 <= len(d) <= 160:
            print(f"WARN Description-Laenge {len(d)}: {n}")
        if "—" in d or "–" in d:
            print(f"WARN Gedankenstrich in {n}")

    notes = {"nohead": [], "nodesc": [], "noimage": [], "noanchor": []}
    total_tags, pages_changed = 0, 0
    for name in eligible_pages(ROOT):
        old, new, changes = process(name, ROOT, notes)
        if new != old:
            pages_changed += 1
            total_tags += len(changes)
            print(f"{'~' if (args.dry_run or args.check) else '+'} {name}: {', '.join(changes)}")
            if not (args.dry_run or args.check):
                with open(ROOT / name, "w", encoding="utf-8", newline="") as fh:
                    fh.write(new)
    if total_tags == 0:
        print("0 Änderungen")
    else:
        print(f"{total_tags} Tags in {pages_changed} Seiten")
    for k, label in (("nodesc", "ohne Description (OG-Description uebersprungen)"),
                     ("noimage", "ohne OG-Bild (assets/og/ fehlt, erst build_og_images.py)"),
                     ("noanchor", "ohne Einfuegepunkt"), ("nohead", "ohne </head>")):
        if notes[k]:
            print(f"Hinweis, {label}: " + ", ".join(sorted(set(notes[k]))))
    problems = audit(ROOT, notes)
    for p in problems:
        print("FEHLER", p)
    if problems:
        sys.exit(1)
    if args.check and total_tags:
        sys.exit(1)


if __name__ == "__main__":
    main()
