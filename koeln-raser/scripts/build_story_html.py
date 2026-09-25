#!/usr/bin/env python3
"""Setzt data/story_data.json in story_template.html ein → ../koelner-raser-story.html.

Die Seite ist danach komplett eigenständig (keine Laufzeit-Abhängigkeiten
außer Google Fonts), wie rhein-story.html.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "story_template.html"
DATA = ROOT / "data" / "story_data.json"
OUT = ROOT.parent / "koelner-raser-story.html"

MARKER = "/*__DATA__*/null"


def main():
    tpl = TEMPLATE.read_text(encoding="utf-8")
    if tpl.count(MARKER) != 1:
        raise SystemExit(f"Platzhalter {MARKER!r} nicht genau einmal im Template gefunden")
    data = json.loads(DATA.read_text(encoding="utf-8"))
    # „</" im JSON würde einen <script>-Block vorzeitig schließen
    blob = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    OUT.write_text(tpl.replace(MARKER, blob), encoding="utf-8")
    print(f"✓ {OUT.name} · {OUT.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    main()
