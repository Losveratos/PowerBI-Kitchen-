#!/usr/bin/env python3
"""Erzeugt Vorschaubilder (Open Graph, JPG 1200x630) unter assets/og/.

Quelle je Seite, in dieser Reihenfolge:
  1. Cover aus dem Start-Feed (assets/start/feed-data.js, nur assets/start/covers/,
     960x600 WebP): mittig auf 1200x630 zugeschnitten und mit Pillow skaliert.
     Die _en-Fassung nutzt das Cover der deutschen Seite.
  2. sonst Playwright-Screenshot des Seitenanfangs (Viewport 1200x630) ueber
     scripts/og_screenshot.js (lokaler Server auf Port 8792).
Seiten mit vorhandenem og:image, Sonderfaelle (SKIP_*) und die Verifizierungsdatei
werden ausgelassen. Impressum/Datenschutz teilen sich assets/og/default.jpg
(Screenshot der Startseite).

Aufruf
------
    python3 scripts/build_og_images.py            # nur fehlende Bilder
    python3 scripts/build_og_images.py --force    # vorhandene ueberschreiben
    python3 scripts/build_og_images.py --only a.html b.html   # einzelne Seiten
Danach scripts/build_head_meta.py ausfuehren (verdrahtet die Bilder im <head>).
"""
import argparse
import json
import re
import subprocess
import sys
import tempfile
import time
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_head_meta import (ROOT, SKIP_FILES, SKIP_CANONICAL, DEFAULT_IMAGE_PAGES,  # noqa: E402
                             eligible_pages, mask, find_tag)

OUT = ROOT / "assets" / "og"
W, H = 1200, 630
MAX_BYTES = 145_000
PORT = 8792

# Seiten, bei denen der Screenshot Wartezeit oder eine Aktion braucht:
# Dateiname -> {"wait": ms, "js": "Code im Seitenkontext"}.
TWEAKS = {}


def feed_covers():
    s = (ROOT / "assets/start/feed-data.js").read_text(encoding="utf-8")
    feed = json.loads(s[s.index("["):s.rindex("]") + 1])
    out = {}
    for e in feed:
        url, img = e.get("url", ""), e.get("img", "")
        if "/covers/" in img and url.endswith(".html"):
            out[url] = ROOT / img
    return out


def has_own_og_image(name):
    raw = (ROOT / name).read_text(encoding="utf-8")
    m = re.search(r"</head\s*>", raw, re.I)
    head = mask(raw[:m.start()]) if m else ""
    pos = find_tag(head, "og:image")
    if pos is None:
        return False
    # Bilder aus assets/og/ stammen von diesem Skript und zaehlen nicht als "eigenes" Bild
    return "/assets/og/" not in raw[pos[0]:pos[1]]


def save_jpg(im, dest):
    im = im.convert("RGB")
    dest.parent.mkdir(parents=True, exist_ok=True)
    for q in range(90, 40, -4):
        im.save(dest, "JPEG", quality=q, optimize=True, progressive=True)
        if dest.stat().st_size <= MAX_BYTES:
            break
    return dest.stat().st_size


def from_cover(src, dest):
    im = Image.open(src).convert("RGB")
    w, h = im.size
    target = W / H
    if w / h > target:      # zu breit: seitlich beschneiden
        nw = round(h * target)
        box = ((w - nw) // 2, 0, (w - nw) // 2 + nw, h)
    else:                   # zu hoch: oben/unten beschneiden
        nh = round(w / target)
        box = (0, (h - nh) // 2, w, (h - nh) // 2 + nh)
    im = im.crop(box).resize((W, H), Image.LANCZOS)
    return save_jpg(im, dest)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--force", action="store_true", help="vorhandene Bilder ueberschreiben")
    ap.add_argument("--only", nargs="*", help="nur diese Seiten (Dateinamen)")
    args = ap.parse_args()

    covers = feed_covers()
    jobs, made = [], []
    names = [n for n in eligible_pages(ROOT) if n not in SKIP_CANONICAL and n not in SKIP_FILES]
    if args.only:
        names = [n for n in names if n in args.only]
    shots = []  # (name, dest)
    for name in names:
        stem = name[:-5]
        if stem in DEFAULT_IMAGE_PAGES:
            continue  # nutzt default.jpg
        if has_own_og_image(name):
            continue
        dest = OUT / f"{stem}.jpg"
        if dest.exists() and not args.force:
            continue
        src = covers.get(name) or (covers.get(stem[:-3] + ".html") if stem.endswith("_en") else None)
        if src and src.exists():
            size = from_cover(src, dest)
            made.append((name, "cover", size))
        else:
            shots.append((name, dest))
    default = OUT / "default.jpg"
    if (not default.exists() or args.force) and not args.only:
        shots.append(("index.html", default))

    if shots:
        tmp = Path(tempfile.mkdtemp(prefix="og_"))
        srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1",
                                "--directory", str(ROOT)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        try:
            time.sleep(1)
            for i, (name, dest) in enumerate(shots):
                tw = TWEAKS.get(name, {})
                jobs.append({"url": f"http://127.0.0.1:{PORT}/{name}", "out": str(tmp / f"{i}.png"),
                             "wait": tw.get("wait", 1500), "js": tw.get("js")})
            jf = tmp / "jobs.json"
            jf.write_text(json.dumps(jobs), encoding="utf-8")
            r = subprocess.run(["node", str(ROOT / "scripts/og_screenshot.js"), str(jf)], cwd=ROOT)
            for i, (name, dest) in enumerate(shots):
                png = tmp / f"{i}.png"
                if png.exists():
                    size = save_jpg(Image.open(png), dest)
                    made.append((name if dest != default else "default (index.html)", "screenshot", size))
            if r.returncode:
                print("Warnung: nicht alle Screenshots erfolgreich")
        finally:
            srv.terminate()

    total = sum(s for _, _, s in made)
    for n, k, s in made:
        print(f"{k:10s} {s/1024:6.1f} KB  {n}")
    print(f"{len(made)} Bilder erzeugt, {total/1024:.0f} KB" if made else "0 Bilder erzeugt (alles vorhanden)")


if __name__ == "__main__":
    main()
