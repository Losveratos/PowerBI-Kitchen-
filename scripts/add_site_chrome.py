#!/usr/bin/env python3
"""Bindet die globale Kitchen-Navigation (assets/js/site-chrome.js) in alle öffentlichen Unterseiten ein.

Idempotent: Ein vorhandenes site-chrome-Tag wird durch das aktuelle ersetzt (z. B. wenn sich der
Modus einer Seite ändert). Neu generierte Seiten (etwa wissensgraph/thema/*.html) einfach erneut
durchlaufen lassen:

    python3 scripts/add_site_chrome.py            # schreiben
    python3 scripts/add_site_chrome.py --check    # nur anzeigen, was sich ändern würde

Modi (siehe Kopf von assets/js/site-chrome.js):
    full    Navigation + Footer           (Standard für Inhaltsseiten)
    footer  nur Footer                    (App-Seiten mit eigener Werkzeugleiste)
    mini    Pille „← Kitchen“ + Footer    (immersive Storys und Visualisierungen)
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Seiten, die NICHT angefasst werden (eigene Navigation, Verifizierung, Fragmente, Weiterleitungen)
EXCLUDE_FILES = {
    "index.html",                      # Startseite: eigene Navigation
    "daten_wg_learn_buckets.html",     # Arbeitskopie der Startseite
    "library/index.html",              # reine Weiterleitung auf wissensgraph/
    "koeln-raser/story_template.html", # Vorlage, keine Seite
    "pnl-treiberbaum-standalone.html", # Bundle, ersetzt beim Laden das ganze Dokument; läuft im iframe von pnl-treiberbaum-demo.html
}
EXCLUDE_DIRS = (
    "cert-export/", "ibcsInspiredChartDeck/", "pnlByDatenWG/", "dataKitchenGantt/", "ibcsKpiCard/",
    "tests/", "tools/", "downloads/", "node_modules/", "design-out/", "whitepaper-assets/",
    "doku-assets/", "blog/assets/", "assets/", "md/", "strommix/", "eauto/", "p17/", "scripts/",
    ".claude/", ".git/",
)

FOOTER = {
    "mockup-kitchen.html", "business-chart-builder.html", "daten-wg-game.html",
    "laender-indikatoren-explorer.html", "visual-standards-rechner.html", "ki-co2-simulator.html",
    "daten-wg-sponsoren.html", "daten-wg-agenda.html",
    "wissensgraph/index.html", "wissensgraph/graph.html",
}
MINI = {
    "zugfahrten-europa-2024.html", "zugfahrten-europa-2024-animiert.html", "waermestreifen-3d.html",
    "rhein-story.html", "strommix-story.html", "koelner-raser-story.html",
    "koelner-raser-story-v1.html", "koelner-raser-story-v2.html", "eauto-klimabilanz.html",
    "pdoom-ki-risiko.html", "pdoom-rollen.html", "pdoom-verteilung.html", "pdoom-zeitverlauf.html",
    "fermi_paradox_en.html", "pnl-treiberbaum-demo.html",
    "sessions/how-i-started-to-build-custom-visuals.html",
}
# Zusatz-Attribute je Seite
EXTRA = {
    # Vollbild-Spiel: Footer läge unter der Spielfläche -> kleine Rechtliches-Ecke
    "daten-wg-game.html": ' data-chrome-legal="corner-br"',
    # Folien-Deck: HUD sitzt oben rechts, Pille nach unten links
    "sessions/how-i-started-to-build-custom-visuals.html": ' data-chrome-pill="bl"',
    # Einzel-Charts: Titel steht oben links, Pille nach unten links
    "pdoom-rollen.html": ' data-chrome-pill="bl"',
    "pdoom-verteilung.html": ' data-chrome-pill="bl"',
    "pdoom-zeitverlauf.html": ' data-chrome-pill="bl"',
    "zugfahrten-europa-2024.html": ' data-chrome-pill="bl"',
    "zugfahrten-europa-2024-animiert.html": ' data-chrome-pill="bl"',
}

TAG_RX = re.compile(r'\n?[ \t]*<script[^>]*site-chrome\.js[^>]*></script>', re.I)
BODY_RX = re.compile(r'<body\b[^>]*>', re.I)


def targets():
    for p in sorted(ROOT.rglob("*.html")):
        rel = p.relative_to(ROOT).as_posix()
        if rel in EXCLUDE_FILES or rel.startswith(EXCLUDE_DIRS):
            continue
        if re.match(r"google[0-9a-f]+\.html$", rel):
            continue
        yield p, rel


def tag_for(rel: str) -> str:
    depth = rel.count("/")
    mode = "footer" if rel in FOOTER else "mini" if rel in MINI else "full"
    src = "../" * depth + "assets/js/site-chrome.js"
    return f'<script src="{src}" data-chrome="{mode}"{EXTRA.get(rel, "")}></script>'


def main():
    check = "--check" in sys.argv
    changed = 0
    for p, rel in targets():
        s = p.read_text(encoding="utf-8")
        tag = tag_for(rel)
        new = TAG_RX.sub("", s)
        m = BODY_RX.search(new)
        if m:
            new = new[: m.end()] + "\n" + tag + new[m.end():]
        else:
            print(f"!! kein <body> in {rel}, übersprungen")
            continue
        if new != s:
            changed += 1
            print(("würde ändern: " if check else "geändert:     ") + rel + "  ->  " + tag.split("data-chrome=")[1][:40])
            if not check:
                p.write_text(new, encoding="utf-8")
    print(f"{changed} Datei(en) {'zu ändern' if check else 'geändert'}")


if __name__ == "__main__":
    main()
