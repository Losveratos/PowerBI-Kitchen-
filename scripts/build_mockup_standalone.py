#!/usr/bin/env python3
"""Baut aus mockup-kitchen.html + assets/mockup/*.js eine einzelne, weitergebbare HTML-Datei.

Aufruf (im Repo-Root):  python scripts/build_mockup_standalone.py [Zielpfad]
Standardziel: dist/MockupKitchen.html
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "mockup-kitchen.html"
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "dist" / "MockupKitchen.html"


def main() -> None:
    html = SRC.read_text(encoding="utf-8")

    def inline(match: re.Match) -> str:
        rel = match.group(1)
        js = (ROOT / rel).read_text(encoding="utf-8")
        if "</script" in js.lower():
            raise SystemExit(f"{rel} enthält '</script>' und kann nicht inline eingebettet werden")
        return f"<script>/* {rel} */\n{js}\n</script>"

    out, n = re.subn(r'<script src="(assets/mockup/[^"?]+\.js)(?:\?v=[^"]*)?"></script>', inline, html)
    if n == 0:
        raise SystemExit("Keine Script-Tags gefunden, Vorlage geändert?")
    out = out.replace("<title>MockupKitchen · Power-BI-Seiten skizzieren</title>",
                      "<title>MockupKitchen · Power-BI-Seiten skizzieren (Standalone)</title>")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(out, encoding="utf-8")
    print(f"{n} Skripte eingebettet -> {OUT} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
