#!/usr/bin/env python3
"""Erzeugt Titelbilder (960x600 WebP) fuer textlastige Beitraege der Startseite.

Ein Titelbild: Flaeche in der Ressort-Farbe, schraeg gestellter Ausschnitt aus der
Seite oder ihrer staerksten Grafik, Kochmuetze mit DWG. Kein eingebrannter Titel,
die Schlagzeile steht auf der Startseite darunter.

Ablage: assets/start/covers/<feed-id>.webp; build_start_feed.js nimmt sie vorrangig.
Neue Beitraege: URL in TEXTY eintragen (optional Grafik in ART), vorher den
Seiten-Screenshot mit render_start_shots.py erzeugen.

Aufruf im Repo-Root:  python scripts/build_start_covers.py
Braucht Playwright und eine aktuelle assets/start/feed-data.js.
"""
import base64
import json
import mimetypes
import re
import sys
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
START = ROOT / "assets" / "start"
OUT = START / "covers"

# Beitrags-URL -> Grafik fuer den schraegen Ausschnitt (sonst Seiten-Screenshot shots/p-<slug>.webp)
ART = {
    "powerbi_praxis_pfad.html": "assets/praxis-pfad/modul-03-karte.png",
    "zugfahrten-infografik.html": "assets/start/shots/p-zugfahrten-europa-2024.webp",
    "powerbi-design-skill.html": "assets/powerbi-design-skill-wireframe.svg",
    "whitepaper-ki-entwicklung-roi.html": "whitepaper-assets/landing-galerie.png",
    "ki-entwicklung-zehn-tage.html": "whitepaper-assets/fig-kostenvergleich.svg",
    "fabric_einsteiger_guide_v1.html": "assets/learn/fabric-architecture.png",
    "business-chart-builder-anleitung.html": "assets/start/shots/tool-chart-builder.webp",
    "mockupkitchen-post.html": "assets/start/shots/tool-mockup-kitchen.webp",
    "pnl-schnellstart.html": "assets/start/shots/vis-pnl-tabelle.webp",
    "chartkitchen-schnellstart.html": "assets/start/shots/vis-chartkitchen.webp",
    "blog/ibcs-reporting-power-bi.md": "assets/start/shots/p-blog.webp",
}
# Beitraege, die ein Titelbild statt des reinen Seiten-Screenshots bekommen
TEXTY = [
    "fabric-alchemie-post.html", "wissensgraph-aus-transkripten.html", "visual-standards-rechner.html",
    "sessions/visual-standards-rechner-reviews/monte-carlo-kosten-je-viewer.html", "zugfahrten-infografik.html",
    "eauto-klimabilanz.html", "kitchen-fuer-ki-agenten.html", "powerbi-design-skill.html",
    "whitepaper-ki-entwicklung-roi.html", "ki-entwicklung-zehn-tage.html", "fabric_einsteiger_guide_v1.html",
    "pdoom-ki-risiko.html", "power_bi_einsteiger_guide_v4.html", "powerbi_praxis_pfad.html",
    "blog/ibcs-reporting-power-bi.md", "visuals-sicherheit.html", "daten-wg-agenda.html",
    "business-chart-builder-anleitung.html", "mockupkitchen-post.html", "pnl-schnellstart.html",
    "chartkitchen-schnellstart.html",
]
# Ressort-Farben (dunkel, hell) passend zu den Ressorts der Startseite
RCOL = {
    "KI": ("#3B2470", "#7A4FD0"), "Visualisierung & IBCS": ("#7A2E12", "#D9662F"),
    "Planung & Finance": ("#7A2E12", "#D9662F"), "Datenstorys": ("#6E1640", "#C93D7C"),
    "Fabric": ("#0E2440", "#2B5C96"), "Power BI": ("#0B3550", "#1E7DAF"),
    "Modellierung & DAX": ("#0B3550", "#1E7DAF"), "Strategie & Governance": ("#4A1414", "#9C3A3A"),
    "Karriere & Community": ("#5A4300", "#C59A12"), "Event": ("#5A4300", "#C59A12"),
}
TPL = """<html><body style="margin:0"><div style="width:960px;height:600px;position:relative;overflow:hidden;
background:radial-gradient(800px 500px at 80% 0%,{c2},transparent 70%),{c1}">
<div style="position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.08) 1.2px,transparent 1.2px);background-size:22px 22px"></div>
<div style="position:absolute;left:150px;top:96px;width:720px;height:470px;transform:rotate(-4deg);border-radius:16px;overflow:hidden;
box-shadow:0 34px 70px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.18);background:#fff">
<img src="{art}" style="width:100%;height:100%;object-fit:cover;object-position:top left"></div>
<img src="{hat}" style="position:absolute;left:34px;bottom:30px;width:92px;height:92px;filter:drop-shadow(0 6px 14px rgba(0,0,0,.4))">
</div></body></html>"""


def data_uri(p: Path) -> str:
    mt = mimetypes.guess_type(str(p))[0] or "image/webp"
    return f"data:{mt};base64," + base64.b64encode(p.read_bytes()).decode()


def slug(u: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", u.lower().replace(".html", "")).strip("-")


def main() -> int:
    src = (START / "feed-data.js").read_text(encoding="utf-8")
    feed = json.loads(src[src.index("["): src.rindex("]") + 1])
    hat = data_uri(START / "hat.svg")
    OUT.mkdir(parents=True, exist_ok=True)
    missing = 0
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        page = b.new_page(viewport={"width": 960, "height": 600})
        for u in TEXTY:
            item = next((i for i in feed if i["url"] == u), None)
            art = ROOT / ART.get(u, f"assets/start/shots/p-{slug(u)}.webp")
            if not item or not art.exists():
                missing += 1
                print("uebersprungen (kein Feed-Eintrag oder kein Bild):", u)
                continue
            c1, c2 = RCOL.get(item["topic"], ("#0C3B33", "#178A73"))
            page.set_content(TPL.format(c1=c1, c2=c2, art=data_uri(art), hat=hat))
            page.wait_for_timeout(250)
            png = OUT / "_tmp.png"
            page.screenshot(path=str(png))
            Image.open(png).convert("RGB").save(OUT / f"{item['id']}.webp", "WEBP", quality=82, method=6)
            png.unlink()
            print("ok", item["id"])
        b.close()
    print("Danach: node scripts/build_start_feed.js")
    return 1 if missing else 0


if __name__ == "__main__":
    sys.exit(main())
