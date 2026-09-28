#!/usr/bin/env python3
"""Infografik „Köln blitzt“ als eine A4-Hochformatseite (Dashboard-Stil) für LinkedIn.

    python3 koeln-raser/scripts/build_infografik.py

Ausgaben (blog/assets/):
  raser-infografik.html   die Seite (1240 × 1754 px = A4 hoch), eigenständig bis auf Google Fonts
  raser-infografik.png    4960 × 7016 px (Headless-Chrome, vierfache Auflösung, ≈ 600 dpi)
  raser-infografik.jpg    dasselbe als JPG (Qualität 92), kleiner für LinkedIn
  raser-infografik-web.jpg  1600 px breit für den Blogbeitrag
  raser-infografik.pdf    A4, Vektor (Chrome „Drucken als PDF“)

Alle Zahlen kommen aus data/story_data.json; Kartendaten © OpenStreetMap-Mitwirkende (ODbL).
Gestaltung nach den Dataviz-Regeln: eine Hero-Zahl, Beschriftung in Textfarben (Farbe nur an
Marken), Balken ≤ 24 px mit 2 px Lücke, feine durchgezogene Raster, Legende ab zwei Reihen.
"""
import html
import json
import math
import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent
SKALA = 4          # Pixel je CSS-Pixel: 4 → 4960 × 7016 px (≈ 600 dpi auf A4)
OUT = REPO / "blog" / "assets"
D = json.loads((ROOT / "data" / "story_data.json").read_text(encoding="utf-8"))
K = D["karte"]
M = D["meta"]

# Farben nach Aufgabe (wie in der Story)
BG, TILE, LINE, GRID = "#0b0c0e", "#141619", "#26282d", "#2a2c31"
INK, INK2, MUTED = "#ffffff", "#c3c2b7", "#8f8d86"
AMBER, AMBER_SOFT, BLUE = "#c2831a", "#f0b54a", "#3987e5"
SEV0, SEV1, RED = "#8d8b84", "#a65454", "#e66767"          # Schwere: ohne Punkte, Punkte, Fahrverbots-Tempo
O = ["#9cc4f2", "#5b9be6", "#2f68b3", "#4a4a47"]             # Herkunft: nah → fern (eine Farbfamilie)
de = lambda v, d=0: f"{v:,.{d}f}".replace(",", "X").replace(".", ",").replace("X", ".")
esc = lambda s: html.escape(str(s), quote=False)


def txt(x, y, s, size=18, fill=INK2, weight=400, anchor="start", mono=False, extra=""):
    fam = "var(--mono)" if mono else "var(--sans)"
    return (f'<text x="{x:.1f}" y="{y:.1f}" style="font-family:{fam};font-size:{size}px;fill:{fill};font-weight:{weight}" '
            f'text-anchor="{anchor}" {extra}>{esc(s)}</text>')


def bar_h(x, y, w, h, fill, r=4):
    """Waagrechter Balken: eckig an der Basis (links), 4 px rund am Datenende."""
    if w <= r:
        return f'<rect x="{x:.1f}" y="{y:.1f}" width="{max(w, .5):.1f}" height="{h:.1f}" fill="{fill}"/>'
    return (f'<path d="M{x:.1f} {y:.1f}h{w - r:.1f}a{r} {r} 0 0 1 {r} {r}v{h - 2 * r:.1f}a{r} {r} 0 0 1 -{r} {r}h-{w - r:.1f}z" fill="{fill}"/>')


def bar_v(x, y0, w, h, fill, r=3):
    """Säule: eckig an der Grundlinie, rund oben."""
    if h <= r:
        return f'<rect x="{x:.1f}" y="{y0 - h:.1f}" width="{w:.1f}" height="{max(h, .5):.1f}" fill="{fill}"/>'
    return (f'<path d="M{x:.1f} {y0:.1f}v-{h - r:.1f}a{r} {r} 0 0 1 {r} -{r}h{w - 2 * r:.1f}a{r} {r} 0 0 1 {r} {r}v{h - r:.1f}z" fill="{fill}"/>')


def lichtspuren(w, h, n=320):
    """Langzeitbelichtung hinter dem Titel: jede Spur ist ein echter Fall einer festen Anlage
    (Stichprobe DATA.hero: Stunde, gemessen, Limit, zu viel). Länge ∝ km/h, Farbe = Schwere."""
    rows = D["hero"]
    seed = [7]

    def rnd():
        seed[0] = (seed[0] * 16807) % 2147483647
        return seed[0] / 2147483647

    col = lambda u: "sr" if u >= 31 else "sc" if u >= 21 else "sa"
    g = [f'<svg class="licht" viewBox="0 0 {w} {h}" width="{w}" height="{h}" preserveAspectRatio="none" aria-hidden="true"><defs>']
    for gid, c in (("sa", "240,181,74"), ("sc", "224,138,104"), ("sr", "230,103,103")):
        g.append(f'<linearGradient id="{gid}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="rgb({c})" stop-opacity=".95"/>'
                 f'<stop offset=".25" stop-color="rgb({c})" stop-opacity=".45"/><stop offset="1" stop-color="rgb({c})" stop-opacity="0"/></linearGradient>')
    g.append('<radialGradient id="fl"><stop offset="0" stop-color="#fffaf0" stop-opacity=".95"/><stop offset=".2" stop-color="#ffe8b8" stop-opacity=".45"/>'
             '<stop offset="1" stop-color="#ffe0a0" stop-opacity="0"/></radialGradient>'
             '<filter id="blur2"><feGaussianBlur stdDeviation="1.4"/></filter></defs>')
    lanes = 22
    for i in range(n):
        r = rows[int(rnd() * len(rows))]
        kmh, ueber = r[1], r[3]
        z = int(rnd() * lanes) / (lanes - 1)                  # 0 = fern (oben, klein) … 1 = nah (unten)
        sc = .3 + .7 * z ** 1.3
        y = h * (.08 + .86 * z ** 1.1) + (rnd() - .5) * 6
        ln = kmh * 3.2 * sc
        x = rnd() * (w + ln) - ln * .3
        th = (2.6 if ueber >= 31 else 1.6) * sc + .4
        g.append(f'<rect x="{x:.1f}" y="{y - th / 2:.2f}" width="{ln:.1f}" height="{th:.2f}" rx="{th / 2:.2f}" fill="url(#{col(ueber)})" opacity="{.35 + .55 * sc:.2f}"/>')
        if ueber >= 21:
            g.append(f'<circle cx="{x:.1f}" cy="{y:.2f}" r="{1.2 + 1.4 * sc:.2f}" fill="#fff4dc" opacity="{.5 + .4 * sc:.2f}"/>')
    for i in range(9):                                         # einzelne Blitze
        fx, fy, fr = w * (.55 + .42 * rnd()), h * (.15 + .7 * rnd()), 26 + 40 * rnd()
        g.append(f'<circle cx="{fx:.1f}" cy="{fy:.1f}" r="{fr:.1f}" fill="url(#fl)" opacity="{.35 + .4 * rnd():.2f}"/>')
    g.append("</svg>")
    return "".join(g)


# ---------------------------------------------------------------------------------------------
# Karte „Köln bei Nacht“
# ---------------------------------------------------------------------------------------------
def karte(w, h):
    s = min((w - 20) / K["w"], (h - 20) / K["h"])
    ox, oy = (w - K["w"] * s) / 2, 10
    px = lambda v: f"{v / s:.2f}"
    g = [f'<svg viewBox="0 0 {w} {h}" width="100%" style="display:block;height:auto" role="img" aria-label="Karte von Köln mit allen Messstellen">',
         f'<g transform="translate({ox:.1f} {oy:.1f}) scale({s:.5f})"><clipPath id="ck"><rect width="{K["w"]}" height="{K["h"]}"/></clipPath><g clip-path="url(#ck)">',
         f'<path d="{K["stadt"]}" fill="#1b1e23"/>']
    g += [f'<path d="{t["d"]}" fill="none" stroke="#2a2d33" stroke-width="{px(.7)}"/>' for t in K["stadtteile"]]
    g.append(f'<path d="{K["stadt"]}" fill="none" stroke="#474a51" stroke-width="{px(1)}"/>')
    for cls, lw, gw, a, ga in (("primary", .7, 2.6, .17, .045), ("trunk", 1, 3.4, .23, .05), ("motorway", 1.2, 4.2, .3, .06)):
        g.append(f'<path d="{K["strassen"][cls]}" fill="none" stroke="rgba(255,210,140,{ga})" stroke-width="{px(gw)}" stroke-linecap="round"/>')
        g.append(f'<path d="{K["strassen"][cls]}" fill="none" stroke="rgba(255,230,190,{a})" stroke-width="{px(lw)}" stroke-linecap="round"/>')
    for sw, c in ((90, "rgba(110,160,220,.07)"), (46, "rgba(120,170,225,.18)"), (24, "rgba(150,190,235,.38)"), (7, "rgba(215,230,250,.75)")):
        g.append(f'<path d="{K["rhein"]}" fill="none" stroke="{c}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>')
    g.append("</g></g>")
    S = D["standorte"]
    mx = {d: max(q["n"] for q in S if q["d"] == d) for d in ("S-01", "S-02")}
    f = 1.0
    rad = lambda q: f * (2.4 + 10 * math.sqrt(q["n"] / mx["S-01"])) if q["d"] == "S-01" else \
        f * (1.4 + 3.6 * math.sqrt(q["n"] / mx["S-02"])) if q["d"] == "S-02" else 3.4
    pos = {}
    g.append('<defs><filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="5"/></filter>'
             '<radialGradient id="stadtlicht"><stop offset="0" stop-color="#f0b54a" stop-opacity=".16"/><stop offset="1" stop-color="#f0b54a" stop-opacity="0"/></radialGradient></defs>')
    do0 = next(o for o in K["orte"] if o["name"] == "Dom")
    g.append(f'<circle cx="{ox + do0["x"] * s:.1f}" cy="{oy + do0["y"] * s:.1f}" r="{K["w"] * s * .32:.1f}" fill="url(#stadtlicht)"/>')
    for q in S:
        p = K["punkte"].get(f'{q["d"]}|{q["c"]}')
        if p and q["d"] == "S-01":
            g.append(f'<circle cx="{ox + p[0] * s:.1f}" cy="{oy + p[1] * s:.1f}" r="{2.2 * rad(q):.1f}" fill="{AMBER_SOFT}" opacity=".32" filter="url(#glow)"/>')
    for dst in ("S-02", "K-04", "S-01"):
        for q in sorted((q for q in S if q["d"] == dst), key=lambda q: -q["n"]):
            p = K["punkte"].get(f'{q["d"]}|{q["c"]}')
            if not p:
                continue
            x, y, r = ox + p[0] * s, oy + p[1] * s, rad(q)
            pos[(q["d"], q["c"])] = (x, y, r)
            if dst == "K-04":
                g.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="none" stroke="{AMBER_SOFT}" stroke-width="1.6"/>')
            else:   # 2 px Ring in Flächenfarbe trennt überlappende Punkte
                g.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="{AMBER if dst == "S-01" else BLUE}" '
                         f'fill-opacity="{.95 if dst == "S-01" else .85}" stroke="{TILE}" stroke-width="{1.2 if dst == "S-01" else .6}"/>')
    halo = f'paint-order="stroke" stroke="{TILE}" stroke-width="5" stroke-linejoin="round"'
    for code, name, side in (("0015", "B 55a", 1), ("0005", "Innere Kanalstraße", -1), ("0061", "Kaiser-Wilhelm-Ring", -1)):
        x, y, r = pos[("S-01", code)]
        lx = x + side * (r + 8)
        dy = {"0005": -10, "0061": 12, "0015": 5}[code]
        g.append(txt(lx, y + dy + 5, name, 16, INK, 600, "start" if side > 0 else "end", extra=halo))
    do = next(o for o in K["orte"] if o["name"] == "Dom")
    dx, dy = ox + do["x"] * s, oy + do["y"] * s
    g.append(f'<rect x="{dx - 3:.1f}" y="{dy - 3:.1f}" width="6" height="6" fill="{INK}" transform="rotate(45 {dx:.1f} {dy:.1f})"/>')
    g.append(txt(dx + 8, dy + 18, "Dom", 14, INK2, extra=halo))
    g.append("</svg>")
    return "".join(g)


# ---------------------------------------------------------------------------------------------
# Kleine Diagramme
# ---------------------------------------------------------------------------------------------
def lernkurve(w, h):
    L = D["lernkurven"]["0015"]
    per = lambda arr, ws: sum(x["n"] for x in arr if x["w"] in ws) / sum(x["tage"] for x in arr if x["w"] in ws)
    last = L["wochen"][-1]["w"]
    b0, c0 = per(L["wochen"], [0, 1]), per(L["kontrolle"], [0, 1])
    pts = [(x["w"], 100 * x["n"] / x["tage"] / b0) for x in L["wochen"]]
    ctl = [(x["w"], 100 * x["n"] / x["tage"] / c0) for x in L["kontrolle"] if x["w"] <= last]
    plat, cplat = 100 * per(L["wochen"], range(12, 20)) / b0, 100 * per(L["kontrolle"], range(12, 20)) / c0
    x0, x1, y0, y1 = 44, w - 118, h - 30, 12
    X = lambda v: x0 + (x1 - x0) * v / last
    Y = lambda v: y0 - (y0 - y1) * v / 130
    path = lambda ps: "M" + " L".join(f"{X(a):.1f} {Y(v):.1f}" for a, v in ps)
    g = [f'<svg viewBox="0 0 {w} {h}" width="100%" style="display:block;height:auto" role="img" aria-label="Lernkurve B 55a gegen Anlagen im Bestand">']
    for v in (0, 50, 100):
        g += [f'<line x1="{x0}" x2="{x1}" y1="{Y(v):.1f}" y2="{Y(v):.1f}" stroke="{GRID}" stroke-width="1"/>',
              txt(x0 - 8, Y(v) + 5, str(v), 13, MUTED, anchor="end", mono=True)]
    g += [f'<rect x="{X(12):.1f}" y="{y1}" width="{X(last) - X(12):.1f}" height="{y0 - y1}" fill="#ffffff" fill-opacity=".035"/>',
          txt((X(12) + X(last)) / 2, y1 + 14, "Woche 12–19", 12, MUTED, anchor="middle")]
    for wk in (0, 8, 16):
        g.append(txt(X(wk), y0 + 20, f"W {wk}", 13, MUTED, anchor="start" if wk == 0 else "middle", mono=True))
    g += [f'<path d="{path(ctl)}" fill="none" stroke="{SEV0}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>',
          f'<path d="{path(pts)}" fill="none" stroke="{AMBER}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>',
          f'<circle cx="{X(last):.1f}" cy="{Y(pts[-1][1]):.1f}" r="4" fill="{AMBER}" stroke="{TILE}" stroke-width="2"/>',
          f'<circle cx="{X(last):.1f}" cy="{Y(ctl[-1][1]):.1f}" r="4" fill="{SEV0}" stroke="{TILE}" stroke-width="2"/>',
          txt(X(last) + 10, Y(ctl[-1][1]) - 2, "Bestand", 14, INK2, 600), txt(X(last) + 10, Y(ctl[-1][1]) + 15, f"{cplat - 100:+.0f} %".replace("-", "−"), 14, INK2),
          txt(X(last) + 10, Y(pts[-1][1]) - 2, "B 55a", 14, INK, 700), txt(X(last) + 10, Y(pts[-1][1]) + 15, f"−{100 - plat:.0f} %", 14, INK, 700),
          "</svg>"]
    return "".join(g), b0, per(L["wochen"], range(12, 20)), L["kontrolle_anlagen"]


def nacht(w, h):
    hrs = D["stunde_s01"]
    x0, x1, y0, y1 = 36, w - 6, h - 28, 26
    bw = (x1 - x0) / 24
    cw = min(24, bw - 2)
    Y = lambda v: (y0 - y1) * v / 9
    g = [f'<svg viewBox="0 0 {w} {h}" width="100%" style="display:block;height:auto" role="img" aria-label="Anteil schwerer Fälle je Uhrzeit">']
    for v in (0, 5):
        yy = y0 - Y(v)
        g += [f'<line x1="{x0}" x2="{x1}" y1="{yy:.1f}" y2="{yy:.1f}" stroke="{GRID}" stroke-width="1"/>', txt(x0 - 6, yy + 5, f"{v} %", 12, MUTED, anchor="end", mono=True)]
    for hr in hrs:
        night = hr["h"] < 6 or hr["h"] >= 22
        g.append(bar_v(x0 + hr["h"] * bw + (bw - cw) / 2, y0, cw, Y(hr["p21"]), RED if night else SEV0))
    for hh in (0, 6, 12, 18):
        g.append(txt(x0 + hh * bw + bw / 2, y0 + 20, f"{hh:02d}", 12, MUTED, anchor="middle", mono=True))
    for hh in (3, 14):
        v = hrs[hh]["p21"]
        g.append(txt(x0 + hh * bw + bw / 2, y0 - Y(v) - 8, f"{de(v, 1)} %", 14, INK, 700, "middle"))
    g.append("</svg>")
    return "".join(g)


def top5(w):
    names = {"0015": ("B 55a · Ausfahrt Frankfurter Str.", "Tempo 80 · seit 14.08."), "0005": ("Innere Kanalstraße → Niehler Str.", "Tempo 50 · seit 15.05."),
             "0061": ("Kaiser-Wilhelm-Ring 17–21", "Tempo 30"), "0028": ("Escher Straße 146", "Tempo 30"),
             "0053": ("Dellbrücker Hauptstraße 95", "Tempo 20 · seit 20.03.")}
    sites = [q for q in D["standorte"] if q["d"] == "S-01"][:5]
    mx = sites[0]["n"]
    row, bh = 44, 12
    g = [f'<svg viewBox="0 0 {w} {row * 5}" width="100%" style="display:block;height:auto" role="img" aria-label="Die fünf festen Anlagen mit den meisten Fällen">']
    for i, q in enumerate(sites):
        y = i * row
        nm, meta = names.get(q["c"], (q["name"], ""))
        bw = (w - 205) * q["n"] / mx
        g += [txt(0, y + 15, nm, 15, INK, 600), bar_h(0, y + 22, bw, bh, AMBER),
              txt(bw + 8, y + 33, de(q["n"]), 13, INK2, mono=True), txt(bw + 64, y + 33, meta, 12, MUTED)]
    g.append("</svg>")
    return "".join(g)


def histo(w, h):
    hist, n = D["hist_ueber"], M["tempofaelle"]
    x0, x1, y0, y1 = 4, w - 4, h - 26, 10
    bw = (x1 - x0) / 40
    cw = bw - 2
    mx = max(hist[1:41])
    g = [f'<svg viewBox="0 0 {w} {h}" width="100%" style="display:block;height:auto" role="img" aria-label="Verteilung der Überschreitung">',
         f'<line x1="{x0}" x2="{x1}" y1="{y0}" y2="{y0}" stroke="{GRID}" stroke-width="1"/>']
    for u in range(1, 41):
        c = RED if u >= 31 else SEV1 if u >= 21 else SEV0
        g.append(bar_v(x0 + (u - 1) * bw + 1, y0, cw, max(1.2, (y0 - y1) * hist[u] / mx), c, r=2))
    for u in (1, 10, 20, 30, 40):
        g.append(txt(x0 + (u - 1) * bw + bw / 2, y0 + 18, str(u), 12, MUTED, anchor="middle", mono=True))
    pk = x0 + 5 * bw + bw / 2
    g.append(txt(pk + 10, y1 + 14, f"Gipfel: 6 km/h zu viel · {de(100 * hist[6] / n, 1)} %", 13, INK, 600))
    g.append("</svg>")
    return "".join(g)


def herkunft(w):
    cats = ["Köln", "Umland", "Übriges Deutschland", "Ohne/Sonder/Ausland"]
    rows = [("fest", "S-01"), ("mobil", "S-02")]
    g = [f'<svg viewBox="0 0 {w} 104" width="100%" style="display:block;height:auto" role="img" aria-label="Herkunft laut Kennzeichen, fest gegen mobil">']
    x0, bh = 58, 30
    for i, (lab, k) in enumerate(rows):
        H = D["herkunft"][k]
        tot = sum(H[c] for c in cats)
        y = i * 48 + 6
        g.append(txt(0, y + 21, lab, 15, INK2, 600))
        x = x0
        for j, c in enumerate(cats):
            sw = (w - x0) * H[c] / tot
            g.append(f'<rect x="{x:.1f}" y="{y}" width="{max(0, sw - 2):.1f}" height="{bh}" fill="{O[j]}"/>')
            if j == 0:
                g.append(txt(x + 8, y + 21, f"{de(100 * H[c] / tot, 1)} %", 15, "#0b0c0e", 700))
            x += sw
    g.append("</svg>")
    return "".join(g)


def meter(label, v, col, w):
    """Balken-Meter 0–100 %: Füllung trägt den Wert, die Spur ist ein dunkler Schritt."""
    return (f'<div class="meter"><div class="mlab"><span>{esc(label)}</span><b>{de(v, 1)} %</b></div>'
            f'<div class="track"><div class="fill" style="width:{v:.2f}%;background:{col}"></div></div></div>')


# ---------------------------------------------------------------------------------------------
def seite():
    NT, FV, n = D["nacht_tag"], D["fahrverbot"], M["tempofaelle"]
    lk, b0, bend, ctl_n = lernkurve(480, 150)
    fz = K["fakten"]
    s01 = [q for q in D["standorte"] if q["d"] == "S-01"]
    fest_n = sum(q["n"] for q in s01)
    fest_nacht = 100 * sum(sum(q["h"][:6]) + sum(q["h"][22:]) for q in s01) / fest_n
    genau = K["genauigkeit"]
    css = f"""
:root{{--sans:"Segoe UI",system-ui,-apple-system,Arial,sans-serif;--mono:"JetBrains Mono",Consolas,ui-monospace,monospace}}
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{background:{BG}}}
.page{{width:1240px;height:1754px;overflow:hidden;padding:42px 52px 30px;color:{INK2};font-family:var(--sans);display:flex;flex-direction:column;gap:14px;
  background:radial-gradient(ellipse 60% 30% at 70% 12%,rgba(194,131,26,.10),transparent 70%),radial-gradient(ellipse 50% 30% at 10% 60%,rgba(57,135,229,.06),transparent 70%),{BG}}}
.page{{position:relative}}
.licht{{position:absolute;left:0;top:0;width:1240px;height:360px;z-index:0}}
.vign{{position:absolute;left:0;top:0;width:1240px;height:370px;z-index:0;background:linear-gradient(90deg,rgba(11,12,14,.94) 0%,rgba(11,12,14,.78) 42%,rgba(11,12,14,.25) 72%,rgba(11,12,14,.55) 100%),linear-gradient(180deg,rgba(11,12,14,0) 60%,{BG} 100%)}}
.head,.kpis,.row,.foot{{position:relative;z-index:1}}
.kick{{font-family:var(--mono);font-size:15px;letter-spacing:.24em;text-transform:uppercase;color:{AMBER_SOFT};font-weight:600}}
.head{{display:grid;grid-template-columns:1fr 330px;gap:28px;align-items:end}}
h1{{font-size:76px;line-height:.98;font-weight:750;letter-spacing:-.025em;color:{INK};margin-top:12px}}
h1 em{{font-style:normal;color:{AMBER_SOFT}}}
.dek{{font-size:19px;line-height:1.45;color:{INK2};margin-top:10px;max-width:760px}}
.headnote{{font-size:14px;line-height:1.5;color:{INK2};border-left:2px solid {AMBER};padding:8px 0 8px 16px;background:rgba(11,12,14,.72);border-radius:0 8px 8px 0}}
.headnote b{{color:{INK};font-weight:600}}
.kpis{{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}}
.tile{{background:linear-gradient(180deg,#17191d,{TILE} 40%);border:1px solid {LINE};border-radius:12px;padding:15px 18px;min-width:0;box-shadow:0 10px 30px rgba(0,0,0,.35)}}
.a-amber{{box-shadow:inset 0 2px 0 {AMBER},0 10px 30px rgba(0,0,0,.35)}}
.a-red{{box-shadow:inset 0 2px 0 {RED},0 10px 30px rgba(0,0,0,.35)}}
.a-blue{{box-shadow:inset 0 2px 0 {BLUE},0 10px 30px rgba(0,0,0,.35)}}
.a-ink{{box-shadow:inset 0 2px 0 {INK2},0 10px 30px rgba(0,0,0,.35)}}
.kpi{{background:linear-gradient(160deg,#1a1d22,{TILE} 60%)}}
.kpi .v{{font-size:44px;font-weight:700;color:{INK};line-height:1;letter-spacing:-.02em}}
.kpi .v small{{font-size:22px;font-weight:600;color:{INK2};margin-left:4px}}
.kpi .l{{font-size:14px;line-height:1.4;margin-top:8px;color:{INK2}}}
.kpi .dot{{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;vertical-align:1px}}
.row{{display:grid;gap:16px}}
.r2{{grid-template-columns:600px minmax(0,1fr)}}
.r3{{grid-template-columns:repeat(3,minmax(0,1fr))}}
.r4{{grid-template-columns:repeat(2,minmax(0,1fr))}}
.t{{font-size:20px;font-weight:700;color:{INK};letter-spacing:-.01em;line-height:1.2}}
.s{{font-size:13.5px;color:{MUTED};margin-top:3px;line-height:1.4}}
.big{{font-size:30px;font-weight:700;color:{INK};line-height:1.05;margin:8px 0 2px}}
.big small{{font-size:15px;font-weight:500;color:{INK2};margin-left:6px}}
.note{{font-size:13.5px;line-height:1.42;color:{INK2};margin-top:6px}}
.note b{{color:{INK};font-weight:600}}
.stack{{display:flex;flex-direction:column;gap:14px;min-width:0}}
.legend{{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:13.5px;color:{INK2};margin-top:6px}}
.legend i{{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:6px;vertical-align:-1px}}
.legend i.c{{border-radius:50%}}
.legend i.ring{{background:none;border:2px solid {AMBER_SOFT};border-radius:50%}}
.legend i.ln{{height:3px;width:18px;border-radius:2px;vertical-align:4px}}
.map{{position:relative;padding:15px 18px 12px}}
.maplab{{position:absolute;right:20px;top:18px;text-align:right}}
.meter{{margin-top:10px}}
.track{{height:10px;border-radius:3px;background:#23262b;overflow:hidden}}
.fill{{height:10px;border-radius:0 3px 3px 0}}
.mlab{{display:flex;justify-content:space-between;font-size:14px;margin-bottom:5px;color:{INK2}}}
.mlab b{{color:{INK};font-weight:700}}
.chips{{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}}
.chip{{border:1px solid {LINE};border-radius:8px;padding:8px 10px;font-size:13px;line-height:1.35;color:{INK2}}}
.chip b{{display:block;color:{INK};font-size:15px;margin-bottom:2px}}
.q{{border-left:3px solid {AMBER};padding:4px 0 4px 12px;margin-top:12px;font-size:16px;line-height:1.4;color:{INK};font-weight:600}}
.foot{{margin-top:auto;display:flex;justify-content:space-between;gap:20px;font-family:var(--mono);font-size:12px;color:{MUTED};line-height:1.55;border-top:1px solid {LINE};padding-top:10px}}
.foot b{{color:{INK2};font-weight:600}}
@page{{size:210mm 297mm;margin:0}}
@media print{{html,body{{width:210mm;height:297mm;overflow:hidden}} .page{{zoom:.6395;break-after:avoid}}}}
"""
    body = f"""
<div class="page">
  {lichtspuren(1240, 360)}
  <div class="vign"></div>
  <div class="head">
    <div>
      <div class="kick">Kölner Raser-Atlas · Offene Daten 2025</div>
      <h1>Köln blitzt.<br><em>{de(n)}</em> Mal.</h1>
      <p class="dek">Ein Jahr Geschwindigkeitsüberwachung der Stadt Köln, jeder Fall mit Uhrzeit, Ort und Herkunft.
      Was die Daten zeigen, und was nicht.</p>
    </div>
    <div class="headnote"><b>Ein Blitz zählt nicht die Raser.</b> Er zählt die Raser, die dort vorbeikommen, wo die Stadt gerade misst.
      Belastbar sind deshalb Anteile und die 43 festen Anlagen, die rund um die Uhr gleich messen.</div>
  </div>

  <div class="kpis">
    <div class="tile kpi"><div class="v">{de(round(M['sekunden_pro_fall']))}<small>s</small></div><div class="l">im Schnitt ein Blitz, rund um die Uhr: {de(M['pro_tag'])} Fälle am Tag</div></div>
    <div class="tile kpi"><div class="v">{M['messstellen']}</div><div class="l"><span class="dot" style="background:{AMBER}"></span>{M['stationaer_standorte']} fest · <span class="dot" style="background:{BLUE}"></span>{M['mobil_standorte']} mobil · {M['kreuzung_standorte']} Kreuzungen</div></div>
    <div class="tile kpi"><div class="v">{round(100 * FV['bis20'] / n)}<small>%</small></div><div class="l">höchstens 20 km/h zu schnell, also ohne Punkt in Flensburg</div></div>
    <div class="tile kpi"><div class="v">203<small>km/h</small></div><div class="l">Rekord bei Tempo 50, Raderthalgürtel, Vorabend des 1. Mai</div></div>
  </div>

  <div class="row r2">
    <div class="tile map a-ink">
      <div class="t">Köln bei Nacht</div>
      <div class="s">Alle Messstellen an ihren Orten · Kreisfläche ∝ Fälle 2025</div>
      {karte(560, 468)}
      <div class="legend"><span><i class="c" style="background:{AMBER}"></i>feste Anlage</span><span><i class="c" style="background:{BLUE}"></i>mobile Messung</span>
        <span><i class="ring"></i>Kreuzungsanlage</span></div>
      <div class="note" style="color:{MUTED}">{fz['s01_um_dom']['anlagen']} feste Anlagen stehen ≤ 3 km vom Dom, sie erzeugen {de(fz['s01_um_dom']['anteil'], 1)} % der Fälle fester Anlagen.
      {de(genau['hausnummer'] + genau['strasse'] + genau['manuell'])} von {M['messstellen']} Messstellen geprüft verortet, {genau['fehlt']} ohne verlässlichen Punkt weggelassen.</div>
    </div>
    <div class="stack">
      <div class="tile a-amber">
        <div class="t">Ein neuer Blitzer wirkt, und zwar schnell</div>
        <div class="s">B 55a ab 14.08.2025, Fälle pro Tag · Wochen 0–1 = 100</div>
        <div class="big">{de(b0)} → {de(bend)}<small>Fälle pro Tag</small></div>
        {lk}
        <div class="legend"><span><i class="ln" style="background:{AMBER}"></i>B 55a</span><span><i class="ln" style="background:{SEV0}"></i>{ctl_n} Anlagen im Bestand</span></div>
        <div class="note">Die Jahreszeit erklärt es nicht. Schwere Fälle (≥ 21 km/h zu viel) sinken von {de(D['b55a']['p21_anfang'], 1)} % auf {de(D['b55a']['p21_ende'], 1)} %. Nicht jede neue Anlage wirkt so stark.</div>
      </div>
      <div class="tile a-red">
        <div class="t">Nachts öfter richtig schnell</div>
        <div class="s">Feste Anlagen · Anteil der Fälle mit ≥ 21 km/h zu viel, je Uhrzeit</div>
        {nacht(480, 112)}
        <div class="legend"><span><i style="background:{RED}"></i>Nacht 22–6 Uhr</span><span><i style="background:{SEV0}"></i>Tag</span></div>
        <div class="note">Nacht gegen Tag, je Anlage bereinigt: Anteil ab 21 km/h <b>{de(NT['p21']['faktor_je_anlage'], 1)}-mal</b>, ab 31 km/h <b>{de(NT['p31']['faktor_je_anlage'], 1)}-mal</b> so hoch.</div>
      </div>
    </div>
  </div>

  <div class="row r3">
    <div class="tile a-amber">
      <div class="t">Die fünf größten festen Anlagen</div>
      <div class="s">Fälle 2025 · beide Spitzenreiter auf der Achse Innere Kanalstraße, Zoobrücke, B 55a</div>
      <div style="margin-top:14px">{top5(330)}</div>
    </div>
    <div class="tile a-red">
      <div class="t">Die Masse ist knapp drüber</div>
      <div class="s">Fälle je km/h zu viel (1 bis 40)</div>
      <div style="margin-top:12px">{histo(330, 146)}</div>
      <div class="legend"><span><i style="background:{SEV0}"></i>ohne Punkte</span><span><i style="background:{SEV1}"></i>1 Punkt</span><span><i style="background:{RED}"></i>Fahrverbots-Tempo</span></div>
      <div class="note"><b>{de(FV['innerorts_ab31'] + FV['ausserorts_ab41'])}</b> Fälle mit Fahrverbots-Tempo. Katalogwert aller Fälle rund {de(round(D['bussgeld']['summe_eur'] / 1e6))} Mio. €, im Schnitt {de(round(D['bussgeld']['summe_eur'] / n))} €. Keine Einnahme.</div>
    </div>
    <div class="tile a-blue">
      <div class="t">Wer geblitzt wird</div>
      <div class="s">Herkunft laut Kennzeichen (Halter, nicht Fahrer)</div>
      <div style="margin-top:14px">{herkunft(330)}</div>
      <div class="legend"><span><i style="background:{O[0]}"></i>Köln</span><span><i style="background:{O[1]}"></i>Umland</span><span><i style="background:{O[2]}"></i>übriges Deutschland</span><span><i style="background:{O[3]}"></i>sonstige</span></div>
      <div class="note">Mobil wird vor allem in Wohnstraßen gemessen, fest an Hauptachsen mit Einpendlern. Dazu die Hypothese: Einen festen Blitzer kennt, wer von hier ist.</div>
    </div>
  </div>

  <div class="row r4">
    <div class="tile a-amber">
      <div class="t">Eine Frage an die Stadt</div>
      <div class="s">Anteil der Fälle nachts (22–6 Uhr) · mobil nur {de(M['mobil_wochenende_anteil'], 1)} % am Wochenende</div>
      {meter("feste Anlagen, rund um die Uhr gleich im Einsatz", fest_nacht, AMBER, 0)}
      {meter("mobile Messung, mit Dienstzeiten", M['mobil_nacht_anteil'], BLUE, 0)}
      <div class="q">Die schweren Verstöße passieren vor allem nachts. Warum wird mobil nicht öfter nachts gemessen?</div>
    </div>
    <div class="tile">
      <div class="t">Was die Daten nicht zeigen</div>
      <div class="chips">
        <div class="chip"><b>Keine Verkehrsmengen</b>also keine „Raserquote“, nur wer geblitzt wird</div>
        <div class="chip"><b>Keine Unfälle</b>ob Blitzer Unfälle verhindern, bleibt offen</div>
        <div class="chip"><b>Kennzeichen = Halter</b>Firmen- und Mietwagen oft zentral zugelassen</div>
        <div class="chip"><b>Nur die Stadt</b>Messungen der Polizei sind nicht enthalten</div>
      </div>
    </div>
  </div>

  <div class="foot">
    <div>Daten: Stadt Köln, Offene Daten Köln, „Geschwindigkeitsüberwachung Köln ab 2025“ (dl-de/zero-2-0) · Karte © OpenStreetMap-Mitwirkende (ODbL) · Geocodierung: Geoapify<br>
    Auswertung: Daten-WG · SQLite, handgebautes SVG · alle Zahlen per SQL aus den Rohdaten</div>
    <div style="text-align:right;white-space:nowrap">Ganze Story mit Zeitraffer und Atlas:<br><b>datenwgknowledgekitchen.com/koelner-raser-story.html</b></div>
  </div>
</div>"""
    return f"""<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8"><title>Köln blitzt · Infografik</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>{css}</style></head><body>{body}</body></html>"""


def chrome():
    return next((p for p in (shutil.which("chrome"), r"C:\Program Files\Google\Chrome\Application\chrome.exe",
                             shutil.which("msedge"), r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")
                 if p and Path(p).exists()), None)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    page = OUT / "raser-infografik.html"
    page.write_text(seite(), encoding="utf-8")
    print(f"✓ {page.relative_to(REPO)} · {page.stat().st_size / 1024:.0f} KB")
    exe = chrome()
    if not exe:
        print("  (kein Headless-Browser gefunden, nur HTML)")
        return
    base = [exe, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--user-data-dir={tempfile.mkdtemp(prefix='raser-info-')}",
            "--virtual-time-budget=5000", "--run-all-compositor-stages-before-draw"]
    png, pdf = page.with_suffix(".png"), page.with_suffix(".pdf")
    for f in (png, pdf):
        f.unlink(missing_ok=True)
    subprocess.run(base + ["--window-size=1240,1754", f"--force-device-scale-factor={SKALA}", f"--screenshot={png}", page.resolve().as_uri()],
                   capture_output=True, timeout=240)
    if png.exists():
        from PIL import Image
        im = Image.open(png).convert("RGB")
        im.save(png.with_suffix(".jpg"), quality=92, optimize=True, progressive=True, dpi=(600, 600))
        print(f"✓ {png.with_suffix('.jpg').relative_to(REPO)} · {im.width} × {im.height} px · "
              f"{png.with_suffix('.jpg').stat().st_size / 1024 / 1024:.1f} MB")
        web = png.with_name(png.stem + "-web.jpg")
        im.resize((1600, round(1600 * im.height / im.width)), Image.LANCZOS).save(web, quality=86, optimize=True, progressive=True)
        print(f"✓ {web.relative_to(REPO)} · 1600 px · {web.stat().st_size / 1024:.0f} KB")
    subprocess.run(base + ["--no-pdf-header-footer", f"--print-to-pdf={pdf}", page.resolve().as_uri()], capture_output=True, timeout=120)
    for f in (png, pdf):
        print(f"{'✓' if f.exists() else '✗'} {f.relative_to(REPO)}" + (f" · {f.stat().st_size / 1024:.0f} KB" if f.exists() else ""))


if __name__ == "__main__":
    main()
