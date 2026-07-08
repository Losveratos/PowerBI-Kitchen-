#!/usr/bin/env python3
"""Lädt alle Microsoft-Learn-Screenshots des Fabric-Guides nach assets/learn/.

Der Guide bindet die Bilder primär vom Learn-CDN ein; bricht ein CDN-Pfad
(Microsoft verschiebt Media-Ordner gelegentlich), greift der JS-Fallback im
Guide auf assets/learn/<dateiname> zu. Dieses Skript erzeugt genau diese
lokalen Kopien. Einmal lokal ausführen und die Dateien mitcommitten:

    python3 scripts/fetch_learn_assets.py

Lizenz der Bilder: Microsoft-Dokumentation, CC BY 4.0 (Quellenangabe steht
in den figcaptions des Guides).
"""
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GUIDE = ROOT / "fabric_einsteiger_guide_v1.html"
TARGET = ROOT / "assets" / "learn"

IMG_RX = re.compile(r'<img src="(https://learn\.microsoft\.com/[^"]+)"')


def main() -> int:
    html = GUIDE.read_text(encoding="utf-8")
    urls = sorted(set(IMG_RX.findall(html)))
    if not urls:
        print("Keine Learn-Bild-URLs im Guide gefunden.")
        return 1

    TARGET.mkdir(parents=True, exist_ok=True)
    ok, fail = 0, 0
    for url in urls:
        name = url.rsplit("/", 1)[-1].split("?")[0]
        dest = TARGET / name
        if dest.exists() and dest.stat().st_size > 0:
            print(f"·  vorhanden  {name}")
            ok += 1
            continue
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=30) as r:
                dest.write_bytes(r.read())
            print(f"✓  geladen    {name}")
            ok += 1
        except Exception as e:  # noqa: BLE001 - Fehler nur melden, weiterladen
            print(f"✗  FEHLER     {name}: {e}")
            fail += 1

    print(f"\n{ok} ok · {fail} Fehler · Ziel: {TARGET}")
    return 0 if fail == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
