#!/usr/bin/env python3
"""Baut das LinkedIn-Demo-Video fuer MockupKitchen (1920x1080, MP4, ohne Ton, Untertitel im Bild).

Ablauf: Playwright rendert das Tool (lokaler Server, Port 8022) in Englisch und faehrt ein Skript
durch Modell, Vorlage, Typauswahl, Feldbindung, Kachel-Fenster, Design, Praesentation und Export.
Je Szene ein Screenshot; Pillow legt Titelkarten und Untertitel darueber, ffmpeg (aus dem
Playwright-Paket) schneidet alles mit Ueberblendungen zu einem H.264-MP4.

    python scripts/build_mockup_demo_video.py            -> dist/mockupkitchen-demo.mp4
"""
import os
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "dist" / "demo-frames"
OUT_MP4 = ROOT / "dist" / "mockupkitchen-demo.mp4"
URL = os.environ.get("MK_URL", "http://localhost:8022/mockup-kitchen.html?demo=1")
W, H = 1920, 1080
FPS = 30
FADE_FRAMES = 12          # Frames je Ueberblendung
FONTS = Path("C:/Windows/Fonts")

BG = (250, 250, 247)
INK = (15, 30, 46)
INK_SOFT = (71, 85, 105)
ACCENT = (194, 90, 45)
TEAL = (30, 143, 158)


def font(size, bold=False):
    name = "segoeuib.ttf" if bold else "segoeui.ttf"
    return ImageFont.truetype(str(FONTS / name), size)


def ffmpeg_exe():
    # Das ffmpeg im Playwright-Paket kann kein libx264; imageio-ffmpeg bringt ein vollstaendiges mit.
    import imageio_ffmpeg  # noqa
    return imageio_ffmpeg.get_ffmpeg_exe()


# --------------------------------------------------------------------------- Karten
def card(lines, sub=None, kicker=None, footer=None, big=True):
    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)
    # Akzentlinie links oben wie auf der Kitchen-Seite
    d.rectangle([120, 150, 132, 210], fill=ACCENT)
    y = 140
    if kicker:
        d.text((160, y), kicker, font=font(30, True), fill=ACCENT)
        y += 70
    f = font(74 if big else 58, True)
    for ln in lines:
        d.text((160, y), ln, font=f, fill=INK)
        y += (92 if big else 74)
    if sub:
        y += 30
        for ln in sub:
            d.text((160, y), ln, font=font(38), fill=INK_SOFT)
            y += 56
    if footer:
        d.text((160, H - 130), footer, font=font(30), fill=INK_SOFT)
    d.text((W - 620, H - 130), "MockupKitchen byDatenWG", font=font(30, True), fill=INK)
    return im


def bullets_card(title, items, footer=None):
    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)
    d.rectangle([120, 120, 132, 180], fill=ACCENT)
    d.text((160, 110), title, font=font(64, True), fill=INK)
    y = 250
    for it in items:
        d.ellipse([170, y + 18, 190, y + 38], fill=TEAL)
        d.text((220, y), it, font=font(40), fill=INK)
        y += 78
    if footer:
        d.text((160, H - 130), footer, font=font(30), fill=INK_SOFT)
    d.text((W - 620, H - 130), "MockupKitchen byDatenWG", font=font(30, True), fill=INK)
    return im


def caption(im, step, text, sub=None):
    """Untertitel-Band unten mit Schrittnummer."""
    im = im.convert("RGB")
    band_h = 150 if sub else 110
    ov = Image.new("RGBA", (W, band_h), (15, 30, 46, 232))
    im.paste(ov, (0, H - band_h), ov)
    d = ImageDraw.Draw(im)
    x = 80
    if step:
        d.rounded_rectangle([x, H - band_h + 28, x + 74, H - band_h + 80], radius=10, fill=ACCENT)
        d.text((x + 37, H - band_h + 54), str(step), font=font(34, True), fill="white", anchor="mm")
        x += 104
    d.text((x, H - band_h + 30), text, font=font(40, True), fill="white")
    if sub:
        d.text((x, H - band_h + 90), sub, font=font(30), fill=(220, 226, 233))
    return im


# --------------------------------------------------------------------------- Aufnahme
SETUP_JS = r"""
window.confirm = () => true;
MK.setLang('en');
"""

# Demo-Modelle tragen deutsche Kennzahlnamen; fuer das englische Video werden Modell, Rollen und Titel umbenannt.
LOCALIZE_JS = r"""
() => {
  const MAP = { 'Umsatz': 'Revenue', 'Marge': 'Margin', 'Marge%': 'Margin%', 'Marge %': 'Margin %', 'Kunden': 'Customers',
    'Ø Auftragswert': 'Avg order value', 'Kosten': 'Cost', 'Aufträge': 'Orders', 'Auftragseingang': 'Order intake',
    'Menge': 'Quantity', 'Neukunden': 'New customers', 'Retouren%': 'Returns%', 'Rabatt%': 'Discount%', 'Win-Rate%': 'Win rate%' };
  const S = MK.state;
  const ren = f => { if (f && MAP[f.name]) f.name = MAP[f.name]; };
  S.model.tables.forEach(t => { (t.measures || []).forEach(ren); (t.columns || []).forEach(ren); });
  const walk = n => { if (n.type === 'leaf') { const v = n.visual; if (v) { Object.values(v.roles || {}).forEach(l => l.forEach(ren)); Object.keys(MAP).forEach(k => { if (v.title && v.title.includes(k)) v.title = v.title.split(k).join(MAP[k]); }); } } else n.children.forEach(c => walk(c.node)); };
  S.pages.forEach(p => walk(p.layout));
  MK.persist(); MK.setLang('en');
}
"""


def shoot(page, name):
    page.evaluate("document.getElementById('toast').classList.remove('show')")
    page.wait_for_timeout(120)
    path = OUT_DIR / f"{name}.png"
    page.screenshot(path=str(path), full_page=False)
    return Image.open(path).convert("RGB")


def record():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    shots = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
        pg.goto(URL, wait_until="networkidle")
        pg.evaluate("localStorage.removeItem('mockupkitchen.state.v1'); localStorage.setItem('mockupkitchen.lang', 'en')")
        pg.goto(URL + "&r=2", wait_until="networkidle")
        pg.wait_for_timeout(600)
        pg.evaluate(SETUP_JS)
        pg.wait_for_timeout(400)

        # 1 Modell: Sales-Demo laden, Tabellen aufgeklappt zeigen
        pg.evaluate("""() => { const s = document.getElementById('demoModelSel'); s.value = 'sales'; s.dispatchEvent(new Event('change')); document.getElementById('btnDemoModel').click(); }""")
        pg.wait_for_timeout(300)
        pg.evaluate("""document.getElementById('btnTemplates').click(); document.querySelector('#tplGrid [data-tpl="exec"]').click()""")
        pg.wait_for_timeout(400)
        pg.evaluate(LOCALIZE_JS)
        pg.wait_for_timeout(300)
        pg.evaluate("""() => { document.querySelectorAll('.table-block .table-head').forEach((h, i) => { if (i < 2) h.click(); }); }""")
        pg.wait_for_timeout(300)
        shots["model"] = shoot(pg, "01-model")

        # 2 Vorlage waehlen (Dialog offen zeigen, dann anwenden)
        pg.evaluate("document.getElementById('btnTemplates').click()")
        pg.wait_for_timeout(300)
        shots["templates"] = shoot(pg, "02-templates")
        pg.evaluate("document.getElementById('dlgTemplates').close()")
        pg.wait_for_timeout(300)
        pg.evaluate("""() => { const t = [...document.querySelectorAll('.tile[data-leaf]')].find(x => { const n = MK.findNode(x.dataset.leaf).node; return n.visual && n.visual.kind === 'kombi'; }); if (t) t.click(); }""")
        pg.wait_for_timeout(300)
        shots["page"] = shoot(pg, "03-page")

        # 3 Typauswahl (Katalog offen)
        pg.evaluate("""() => { const t = document.querySelector('.tile.sel') || document.querySelector('.tile[data-leaf]'); t.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })); }""")
        pg.wait_for_timeout(300)
        shots["catalog"] = shoot(pg, "04-catalog")
        pg.evaluate("document.getElementById('dlgCatalog').close()")

        # 4 Felder und Luecke: neues Feld aus der Rolle heraus anlegen
        pg.evaluate("""() => { const b = document.querySelector('#insEl [data-newfield="fc"]') || document.querySelector('#insEl [data-newfield]'); if (b) b.click(); }""")
        pg.wait_for_timeout(300)
        pg.evaluate("""() => { document.getElementById('nmName').value = 'Forecast flag'; document.getElementById('nmDesc').value = 'Marks months after the last actual month'; document.getElementById('nmOwner').value = 'Controlling'; }""")
        shots["newfield"] = shoot(pg, "05-newfield")
        pg.evaluate("document.getElementById('nmOk').click()")
        pg.wait_for_timeout(400)
        shots["roles"] = shoot(pg, "06-roles")

        # 5 Kachel-Fenster (Notiz & Einstellungen), fuer die Aufnahme kompakter als im Tool
        pg.add_style_tag(content="#dlgTile{width:1440px;max-width:1440px;height:720px;max-height:720px} #dlgTileBody textarea.big{min-height:120px}")
        pg.evaluate("""() => { const b = document.querySelector('#insEl [data-tilewin]'); if (b) b.click(); }""")
        pg.wait_for_timeout(300)
        pg.evaluate("""() => { const body = document.getElementById('dlgTileBody'); const set = (sel, val) => { const el = body.querySelector(sel); if (!el) return; if (el.type === 'checkbox') el.checked = val; else el.value = val; el.dispatchEvent(new Event(el.tagName === 'TEXTAREA' ? 'input' : 'change', { bubbles: true })); }; set('[data-tk="priority"]', 'must'); set('[data-tkb="openQuestion"]', true); set('[data-tk="notes"]', 'Revenue = net revenue after returns (agreed).\\nOpen: which forecast version, FC3 or FC6? Owner: Head of Sales.'); set('[data-ti="drillDown"]', true); }""")
        pg.wait_for_timeout(300)
        shots["tilewin"] = shoot(pg, "07-tilewin")
        pg.evaluate("document.getElementById('dlgTileClose').click()")
        pg.wait_for_timeout(400)

        # 6 Design: Palette klassisch, dunkle Kacheln, Kopfband eigene Farbe
        pg.evaluate("""() => { document.querySelector('.tab[data-tab="design"]').click(); const fire = (id, v, ev) => { const el = document.getElementById(id); el.value = v; el.dispatchEvent(new Event(ev || 'change', { bubbles: true })); }; fire('dsTileBg', '#1B2735', 'input'); fire('dsTileBg', '#1B2735'); fire('dsPageBg', 'custom'); fire('dsPageBgHex', '#E8EEF4', 'input'); fire('dsPageBgHex', '#E8EEF4'); fire('dsHeader', 'custom'); fire('dsHeaderBg', '#2B4A6F', 'input'); fire('dsHeaderBg', '#2B4A6F'); fire('dsHeaderInk', '#FFE9C7', 'input'); fire('dsHeaderInk', '#FFE9C7'); }""")
        pg.wait_for_timeout(400)
        shots["design"] = shoot(pg, "08-design")

        # 7 Praesentiermodus
        pg.evaluate("document.dispatchEvent(new KeyboardEvent('keydown', { key: 'p', bubbles: true }))")
        pg.wait_for_timeout(500)
        shots["present"] = shoot(pg, "09-present")
        pg.evaluate("document.dispatchEvent(new KeyboardEvent('keydown', { key: 'p', bubbles: true }))")
        pg.wait_for_timeout(300)

        # 8 Export: Spec und Brief
        pg.evaluate("document.getElementById('btnExport').click()")
        pg.wait_for_timeout(500)
        shots["export_json"] = shoot(pg, "10-export-json")
        pg.evaluate("""document.querySelector('#expTabs [data-exp="brief"]').click()""")
        pg.wait_for_timeout(300)
        shots["export_brief"] = shoot(pg, "11-export-brief")
        b.close()
    return shots


# --------------------------------------------------------------------------- Schnitt
def build(shots):
    seq = []   # (Image, Sekunden)
    seq.append((card(["MockupKitchen"], sub=["From a vague request to a build-ready", "semantic Power BI mockup."],
                     kicker="POWER BI · WORKSHOP TOOL", footer="Free · open source · nothing leaves your browser"), 3.2))
    seq.append((card(['"Just build me a dashboard."'], sub=["Which revenue? Compared to what?", "Does the measure even exist?"],
                     kicker="THE REQUEST EVERY DEVELOPER KNOWS", footer="A mockup should say what a visual means, not only where it goes."), 3.6))
    seq.append((caption(shots["model"], 1, "Bring your semantic model",
                        "Drop the TMDL folder: every table, column and measure is ready. Or start with a demo model."), 4.0))
    seq.append((caption(shots["templates"], 2, "Start from a page template",
                        "Pages are built from containers, not pixels. Header, filter panel and footer are zones."), 3.4))
    seq.append((caption(shots["page"], 2, "A report page with real semantic notation",
                        "Scenarios AC · PY · PL · FC, variances as bridges, teal/red or classic palette."), 3.6))
    seq.append((caption(shots["catalog"], 3, "47 tile types",
                        "ChartKitchen sketches, native Power BI visuals, custom visuals like Gantt and P&L."), 3.6))
    seq.append((caption(shots["newfield"], 4, "Missing measure? Create it as a gap",
                        "Straight from the data role: name, description, owner. It stays visible until someone builds it."), 4.0))
    seq.append((caption(shots["roles"], 4, "Bind fields to data roles",
                        "Existing measures are mapped, new ones are marked. No guessing later."), 3.4))
    seq.append((caption(shots["tilewin"], 5, "Capture the workshop decisions",
                        "Priority, open questions, notes, drill-down, cross-filter, field parameters, small multiples."), 4.2))
    seq.append((caption(shots["design"], 6, "Design without leaving the room",
                        "Palette, colours, dark tiles, custom header. Presets or your own values."), 3.4))
    seq.append((caption(shots["present"], 6, "Presentation mode for the projector",
                        "Press P. Panels disappear, the page fills the screen."), 3.0))
    seq.append((caption(shots["export_json"], 7, "Export a machine-readable spec",
                        "Exact rectangles in Power BI pixels, real field names, decisions as data, gaps as issues."), 4.0))
    seq.append((caption(shots["export_brief"], 8, "Hand over to a developer or an AI coding agent",
                        "Agent brief and workshop doc come for free. A Claude Code skill builds the pages in your PBIP project."), 4.4))
    seq.append((bullets_card("What you get", [
        "Container layout that maps 1:1 to Power BI report pages",
        "TMDL import, five demo models, new measures as gaps with owners",
        "47 tile types incl. semantic sketches and custom visuals",
        "Notes, priorities, drill behaviour and field parameters per tile",
        "Spec + agent brief + workshop doc, PNG per page, DE/EN",
        "Free, open source, runs in the browser, nothing is uploaded",
    ], footer="Beta · feedback welcome"), 6.0))
    seq.append((card(["Try it"], sub=["datenwgknowledgekitchen.com/mockup-kitchen.html"],
                     kicker="MOCKUPKITCHEN · FREE · OPEN SOURCE", footer="Not a report generator. A requirements tool with a deterministic outcome."), 4.0))

    # Frames + Concat-Liste mit Ueberblendungen
    frames_dir = OUT_DIR / "seq"
    frames_dir.mkdir(exist_ok=True)
    for f in frames_dir.glob("*.jpg"):
        f.unlink()
    lines = []
    idx = 0
    def put(im, dur):
        nonlocal idx
        p = frames_dir / f"f{idx:04d}.jpg"
        im.save(p, quality=93)
        lines.append(f"file '{p.as_posix()}'\nduration {dur:.3f}")
        idx += 1
    for i, (im, dur) in enumerate(seq):
        hold = dur - (FADE_FRAMES / FPS if i < len(seq) - 1 else 0)
        put(im, max(0.5, hold))
        if i < len(seq) - 1:
            nxt = seq[i + 1][0]
            for k in range(1, FADE_FRAMES + 1):
                put(Image.blend(im, nxt, k / (FADE_FRAMES + 1)), 1 / FPS)
    last = frames_dir / f"f{idx - 1:04d}.jpg"
    lines.append(f"file '{last.as_posix()}'")   # concat-Demuxer: letzte Datei ohne Dauer wiederholen
    lst = OUT_DIR / "list.txt"
    lst.write_text("\n".join(lines), encoding="utf-8")

    cmd = [ffmpeg_exe(), "-y", "-f", "concat", "-safe", "0", "-i", str(lst),
           "-vf", f"fps={FPS},format=yuv420p", "-c:v", "libx264", "-preset", "slow", "-crf", "18",
           "-movflags", "+faststart", str(OUT_MP4)]
    subprocess.run(cmd, check=True, capture_output=True)
    total = sum(d for _, d in seq)
    print(f"OK {OUT_MP4} ({OUT_MP4.stat().st_size // 1024} KB, ~{total:.0f} s, {len(seq)} scenes)")


if __name__ == "__main__":
    if "--cut-only" in sys.argv:
        names = {"model": "01-model", "templates": "02-templates", "page": "03-page", "catalog": "04-catalog", "newfield": "05-newfield",
                 "roles": "06-roles", "tilewin": "07-tilewin", "design": "08-design", "present": "09-present",
                 "export_json": "10-export-json", "export_brief": "11-export-brief"}
        shots = {k: Image.open(OUT_DIR / f"{v}.png").convert("RGB") for k, v in names.items()}
    else:
        shots = record()
    build(shots)
