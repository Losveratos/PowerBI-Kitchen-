#!/usr/bin/env python3
"""Holt fehlende YouTube-Vorschaubilder fuer die Startseite und legt sie lokal ab.

Die Startseite (index.html) zeigt fuer jede Folge ein Vorschaubild. Damit beim
Laden keine Anfrage an YouTube geht, liegen die Bilder unter assets/start/yt/
als WebP (480x270, aus hqdefault zugeschnitten). Dieses Skript laedt nur die
Bilder, die noch fehlen; es laeuft einmalig beim Einpflegen neuer Folgen.

Aufruf im Repo-Root:  python scripts/fetch_start_thumbs.py
Danach:               node scripts/build_start_feed.js
"""
import io
import re
import sys
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "start" / "yt"


def main() -> int:
    html = (ROOT / "folgen.html").read_text(encoding="utf-8")
    ids = sorted(set(re.findall(r"ytId:\s*'([A-Za-z0-9_-]{11})'", html)))
    OUT.mkdir(parents=True, exist_ok=True)
    missing = [i for i in ids if not (OUT / f"{i}.webp").exists()]
    print(f"{len(ids)} Folgen, {len(missing)} ohne Vorschaubild")
    failed = []
    for vid in missing:
        try:
            req = urllib.request.Request(f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg", headers={"User-Agent": "Mozilla/5.0"})
            data = urllib.request.urlopen(req, timeout=20).read()
            # hqdefault ist 480x360 mit schwarzen Balken oben/unten: auf 16:9 zuschneiden
            img = Image.open(io.BytesIO(data)).convert("RGB").crop((0, 45, 480, 315))
            img.save(OUT / f"{vid}.webp", "WEBP", quality=78, method=6)
            print("  ok", vid)
        except Exception as exc:  # Netzwerkfehler sichtbar machen, nicht verschlucken
            failed.append(vid)
            print("  FEHLER", vid, exc)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
