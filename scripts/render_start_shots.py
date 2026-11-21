#!/usr/bin/env python3
"""Rendert Seiten-Vorschaubilder fuer die Startseite (assets/start/shots/p-<slug>.webp).

Fuer neue Beitraege, Tools oder Stories: Seite lokal laden, oberen Ausschnitt
bei 1280x800 fotografieren, auf 720x450 verkleinern. build_start_feed.js nimmt
das Bild automatisch, wenn die Datei p-<slug>.webp heisst (slug = Pfad ohne
.html, Sonderzeichen zu "-").

Aufruf im Repo-Root:  python scripts/render_start_shots.py neue-seite.html talks/xyz/
Braucht Playwright (pip install playwright; playwright install chromium).
"""
import functools
import http.server
import re
import socketserver
import sys
import threading
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "start" / "shots"


def slug(u: str) -> str:
    return "p-" + re.sub(r"[^a-z0-9]+", "-", u.lower().replace(".html", "")).strip("-")


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def main(paths: list[str]) -> int:
    if not paths:
        print(__doc__)
        return 2
    OUT.mkdir(parents=True, exist_ok=True)
    srv = socketserver.ThreadingTCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(ROOT)))
    port = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    failed = 0
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        for u in paths:
            name = slug(u)
            p = b.new_page(viewport={"width": 1280, "height": 800})
            # Einfuehrungs-Touren u. ae. ueberspringen, damit sie nicht im Bild landen
            p.add_init_script("try{localStorage.setItem('dwglib_tour','1')}catch(e){}")
            try:
                p.goto(f"http://127.0.0.1:{port}/{u}", wait_until="load", timeout=30000)
                p.wait_for_timeout(3500)
                p.keyboard.press("Escape")
                p.wait_for_timeout(400)
                png = OUT / f"{name}.png"
                p.screenshot(path=str(png))
                Image.open(png).convert("RGB").resize((720, 450), Image.LANCZOS).save(OUT / f"{name}.webp", "WEBP", quality=80, method=6)
                png.unlink()
                print("ok", name)
            except Exception as exc:
                failed += 1
                print("FEHLER", name, str(exc)[:100])
            p.close()
        b.close()
    srv.shutdown()
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
