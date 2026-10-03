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

    missing = []

    def inline(match: re.Match) -> str:
        rel = match.group(1)
        path = ROOT / rel
        # Optionale Module (z. B. pbir-import.js für den Live-Modus) dürfen fehlen; live.js prüft, ob sie da sind
        if not path.exists():
            missing.append(rel)
            return f"<!-- {rel} fehlt beim Bauen, übersprungen -->"
        js = path.read_text(encoding="utf-8")
        if "</script" in js.lower():
            raise SystemExit(f"{rel} enthält '</script>' und kann nicht inline eingebettet werden")
        return f"<script>/* {rel} */\n{js}\n</script>"

    out, n = re.subn(r'<script src="(assets/mockup/[^"?]+\.js)(?:\?v=[^"]*)?"></script>', inline, html)
    if n == 0:
        raise SystemExit("Keine Script-Tags gefunden, Vorlage geändert?")
    out = out.replace("<title>MockupKitchen · Power-BI-Seiten skizzieren</title>",
                      "<title>MockupKitchen · Power-BI-Seiten skizzieren (Standalone)</title>")
    # Standalone: Live-Oberfläche ohne ?live=1 an (live.js liest window.MK_STANDALONE). Fehlt der Anker, bricht der Bau ab:
    # sonst entstünde still eine Datei ohne Live-Oberfläche (Safety-Review 7).
    anchor = "<script>/* assets/mockup/i18n.js */"
    if anchor not in out:
        raise SystemExit("Anker für den Standalone-Schalter fehlt (%s): Vorlage geändert, Bau abgebrochen" % anchor)
    if "/* assets/mockup/live.js */" not in out:
        raise SystemExit("assets/mockup/live.js wurde nicht eingebettet, Bau abgebrochen")
    out = out.replace(anchor, "<script>window.MK_STANDALONE = true; /* Standalone: Live-Oberfläche an */</script>\n" + anchor, 1)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(out, encoding="utf-8")
    print(f"{n - len(missing)} Skripte eingebettet -> {OUT} ({OUT.stat().st_size // 1024} KB)")
    for rel in missing:
        print(f"Hinweis: {rel} fehlt und wurde übersprungen")


if __name__ == "__main__":
    main()
