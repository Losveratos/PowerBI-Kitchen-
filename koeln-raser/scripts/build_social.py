#!/usr/bin/env python3
"""Baut Bilder für Blog und LinkedIn aus data/story_data.json (eigene Grafiken, keine Fremdbilder).

    python3 koeln-raser/scripts/build_social.py          # SVG + PNG + Karussell-PDF nach blog/assets/

Ausgaben (blog/assets/), alle 1080×1350 (4:5, LinkedIn-Feed):
  raser-1-karte-nacht      alle Messstellen auf der Nachtkarte (Titelbild)
  raser-2-lernkurve        B 55a gegen 27 Anlagen im Bestand
  raser-3-nacht-tag        Anteil schwerer Fälle je Uhrzeit (feste Anlagen)
  raser-4-knapp-drueber    97 % ohne Punkte, Verteilung der Überschreitung
  raser-5-grenzen          was die Daten nicht zeigen + Frage an die Stadt
  raser-karussell.pdf      die fünf Folien als LinkedIn-Dokument

PNG entstehen per Headless-Browser (Edge oder Chrome); das PDF per Pillow.
Kartendaten © OpenStreetMap-Mitwirkende (ODbL) — steht auf der Kartenfolie.
"""
import json
import math
import shutil
import subprocess
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent
OUT = REPO / "blog" / "assets"
D = json.loads((ROOT / "data" / "story_data.json").read_text(encoding="utf-8"))
K = D["karte"]
W, H = 1080, 1350

BG, INK, INK2, MUTED, GRID = "#0b0c0e", "#ffffff", "#c3c2b7", "#898781", "#2c2c2a"
AMBER, AMBER_SOFT, BLUE, RED, SEV1 = "#c2831a", "#f0b54a", "#3987e5", "#e66767", "#a65454"
SANS = "Segoe UI, Helvetica, Arial, sans-serif"
MONO = "JetBrains Mono, Consolas, monospace"
DATEN = "Daten: Stadt Köln, Offene Daten (dl-de/zero-2-0) · Auswertung: Daten-WG · datenwgknowledgekitchen.com"
de = lambda v, d=0: f"{v:,.{d}f}".replace(",", "X").replace(".", ",").replace("X", ".")


def t(x, y, s, size=20, fill=INK2, weight=400, anchor="start", font=SANS, extra=""):
    return (f'<text x="{x:.1f}" y="{y:.1f}" font-family="{font}" font-size="{size}" fill="{fill}" '
            f'font-weight="{weight}" text-anchor="{anchor}" {extra}>{escape(s)}</text>')


def kicker(s, col=AMBER_SOFT):
    return t(60, 92, s, 20, col, 600, font=MONO, extra='letter-spacing="3"')


def foot(extra=""):
    return t(60, H - 40, DATEN + extra, 15, MUTED, font=MONO)


def svg(body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
            f'<rect width="{W}" height="{H}" fill="{BG}"/>{body}</svg>')


def map_layers(ox, oy, s):
    px = lambda v: f"{v / s:.2f}"
    g = [f'<g transform="translate({ox:.1f} {oy:.1f}) scale({s:.5f})"><clipPath id="c"><rect width="{K["w"]}" height="{K["h"]}"/></clipPath><g clip-path="url(#c)">',
         f'<path d="{K["stadt"]}" fill="#15171b"/>']
    g += [f'<path d="{tl["d"]}" fill="none" stroke="#25272c" stroke-width="{px(.8)}"/>' for tl in K["stadtteile"]]
    g.append(f'<path d="{K["stadt"]}" fill="none" stroke="#44464c" stroke-width="{px(1.2)}"/>')
    for cls, w, gw, a, ga in (("primary", .8, 3, .16, .045), ("trunk", 1.1, 4, .22, .05), ("motorway", 1.3, 5, .28, .06)):
        d = K["strassen"][cls]
        g.append(f'<path d="{d}" fill="none" stroke="rgba(255,210,140,{ga})" stroke-width="{px(gw)}" stroke-linecap="round"/>')
        g.append(f'<path d="{d}" fill="none" stroke="rgba(255,230,190,{a})" stroke-width="{px(w)}" stroke-linecap="round"/>')
    for w, c in ((90, "rgba(110,160,220,.07)"), (46, "rgba(120,170,225,.18)"), (24, "rgba(150,190,235,.38)"), (7, "rgba(215,230,250,.75)")):
        g.append(f'<path d="{K["rhein"]}" fill="none" stroke="{c}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>')
    g.append("</g></g>")
    S = D["standorte"]
    mx = {d: max(q["n"] for q in S if q["d"] == d) for d in ("S-01", "S-02")}
    f = 1.35
    rad = lambda q: f * (2.2 + 9.5 * math.sqrt(q["n"] / mx["S-01"])) if q["d"] == "S-01" else \
        f * (1.3 + 4.2 * math.sqrt(q["n"] / mx["S-02"])) if q["d"] == "S-02" else f * 3.4
    for dst in ("S-02", "K-04", "S-01"):
        for q in sorted((q for q in S if q["d"] == dst), key=lambda q: -q["n"]):
            p = K["punkte"].get(f'{q["d"]}|{q["c"]}')
            if not p:
                continue
            x, y, r = ox + p[0] * s, oy + p[1] * s, rad(q)
            if dst == "K-04":
                g.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="none" stroke="{AMBER_SOFT}" stroke-width="2"/>')
            else:
                g.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="{AMBER if dst == "S-01" else BLUE}" '
                         f'fill-opacity="{.9 if dst == "S-01" else .8}" stroke="{BG}" stroke-width=".8"/>')
    return "".join(g)


def folie_karte():
    box = (60, 250, W - 120, 900)
    s = min(box[2] / K["w"], box[3] / K["h"])
    ox, oy = box[0] + (box[2] - K["w"] * s) / 2, box[1]
    m = D["meta"]
    b = [kicker("KÖLNER RASER-ATLAS · GESCHWINDIGKEITSÜBERWACHUNG 2025"),
         t(60, 168, "Köln blitzt.", 68, INK, 750), t(470, 168, f"{de(m['tempofaelle'])} Mal.", 68, AMBER_SOFT, 750),
         t(60, 214, f"Alle {de(round(m['sekunden_pro_fall']))} Sekunden ein Blitz · {m['messstellen']} Messstellen an ihren Orten", 26, INK2),
         map_layers(ox, oy, s)]
    ly = 1190
    b += [f'<circle cx="74" cy="{ly - 8}" r="11" fill="{AMBER}"/>', t(94, ly, "feste Anlage", 22, INK2),
          f'<circle cx="274" cy="{ly - 8}" r="6" fill="{BLUE}"/>', t(290, ly, "mobile Messung", 22, INK2),
          f'<circle cx="494" cy="{ly - 8}" r="6" fill="none" stroke="{AMBER_SOFT}" stroke-width="2"/>', t(510, ly, "Kreuzung", 22, INK2),
          t(660, ly, "Kreisfläche ∝ Fälle 2025", 22, MUTED),
          t(60, ly + 50, "Die größten Punkte: B 55a · Innere Kanalstraße · Kaiser-Wilhelm-Ring", 22, INK),
          foot(" · Karte © OpenStreetMap-Mitwirkende")]
    return svg("".join(b))


def folie_lernkurve():
    L = D["lernkurven"]["0015"]
    per = lambda arr, ws: sum(w["n"] for w in arr if w["w"] in ws) / sum(w["tage"] for w in arr if w["w"] in ws)
    last = L["wochen"][-1]["w"]
    b0, c0 = per(L["wochen"], [0, 1]), per(L["kontrolle"], [0, 1])
    pts = [(w["w"], 100 * w["n"] / w["tage"] / b0) for w in L["wochen"]]
    ctl = [(w["w"], 100 * w["n"] / w["tage"] / c0) for w in L["kontrolle"] if w["w"] <= last]
    x0, x1, y0, y1 = 120, W - 190, 1010, 330
    x = lambda w: x0 + (x1 - x0) * w / last
    y = lambda v: y0 - (y0 - y1) * v / 130
    path = lambda ps: "M" + " L".join(f"{x(a):.1f} {y(v):.1f}" for a, v in ps)
    end, plat = per(L["wochen"], range(12, 20)), 100 * per(L["wochen"], range(12, 20)) / b0
    cend = 100 * per(L["kontrolle"], range(12, 20)) / c0
    B55 = D["b55a"]
    b = [kicker("KÖLNER RASER-ATLAS 2025 · B 55a, AB 14.08.2025"),
         t(60, 160, "Ein neuer Blitzer wirkt,", 56, INK, 750), t(60, 226, "und zwar schnell.", 56, AMBER_SOFT, 750),
         t(60, 276, "Fälle pro Betriebstag, Woche für Woche nach dem Start · Durchschnitt der Wochen 0 und 1 = 100", 22, INK2)]
    for v in (0, 25, 50, 75, 100, 125):
        b += [f'<line x1="{x0}" x2="{x1}" y1="{y(v):.1f}" y2="{y(v):.1f}" stroke="{GRID}"/>', t(x0 - 14, y(v) + 7, str(v), 20, MUTED, anchor="end")]
    for w in range(0, last + 1, 4):
        b.append(t(x(w), y0 + 34, f"Woche {w}" if w else "Woche 0", 19, MUTED, anchor="middle" if w else "start"))
    b += [f'<rect x="{x(12):.1f}" y="{y1}" width="{x(last) - x(12):.1f}" height="{y0 - y1}" fill="#ffffff" fill-opacity=".03"/>',
          t(x(15.5), y1 + 26, "Wochen 12–19", 18, MUTED, anchor="middle"),
          f'<path d="{path(ctl)}" fill="none" stroke="{MUTED}" stroke-width="3" stroke-dasharray="3 6" stroke-linecap="round"/>',
          f'<path d="{path(pts)}" fill="none" stroke="{AMBER}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>',
          t(x(last) + 14, y(cend) + 7, f"Bestand: {cend - 100:+.0f} %".replace("-", "−"), 22, INK2, 600),
          t(x(last) + 14, y(cend) + 33, f"{L['kontrolle_anlagen']} Anlagen", 18, MUTED),
          t(x(last) + 14, y(plat) + 7, f"B 55a: −{100 - plat:.0f} %", 22, AMBER_SOFT, 700),
          t(x(0) + 12, y(124) - 16, f"{de(b0)} Fälle pro Tag", 24, INK, 700),
          t(x(15.5), y(plat) + 46, f"{de(end)} pro Tag", 24, INK, 700, "middle"),
          t(60, 1110, f"Anlagen im Bestand bleiben im selben Zeitraum fast gleich: Die Jahreszeit erklärt den Rückgang nicht.", 21, INK2),
          t(60, 1142, f"Auch schwere Fälle werden seltener: Anteil mit 21 km/h und mehr zu viel {de(B55['p21_anfang'], 1)} % → {de(B55['p21_ende'], 1)} %.", 21, INK2),
          t(60, 1174, "Nicht jede neue Anlage wirkt so stark. Verkehrsmengen liegen nicht vor.", 21, MUTED),
          foot()]
    return svg("".join(b))


def folie_nacht_tag():
    hrs, NT = D["stunde_s01"], D["nacht_tag"]
    x0, x1, y0, y1 = 110, W - 60, 900, 360
    bw = (x1 - x0) / 24
    y = lambda v: y0 - (y0 - y1) * v / 10
    b = [kicker("KÖLNER RASER-ATLAS 2025 · FESTE ANLAGEN"),
         t(60, 160, "Nachts wird aus „etwas zu schnell“", 50, INK, 750), t(60, 222, "„deutlich zu schnell“.", 50, RED, 750),
         t(60, 280, "Anteil der Geblitzten mit 21 km/h und mehr zu viel, je Uhrzeit (Punkte in Flensburg)", 23, INK2)]
    for v in (0, 5, 10):
        b += [f'<line x1="{x0}" x2="{x1}" y1="{y(v):.1f}" y2="{y(v):.1f}" stroke="{GRID}"/>', t(x0 - 14, y(v) + 7, f"{v} %", 20, MUTED, anchor="end")]
    for h in hrs:
        c = RED if h["h"] < 6 or h["h"] >= 22 else SEV1
        b.append(f'<rect x="{x0 + h["h"] * bw + 4:.1f}" y="{y(h["p21"]):.1f}" width="{bw - 8:.1f}" height="{y0 - y(h["p21"]):.1f}" fill="{c}"/>')
    for hh in range(0, 24, 3):
        b.append(t(x0 + hh * bw + bw / 2, y0 + 32, f"{hh:02d}", 20, MUTED, anchor="middle"))
    h3, h14 = hrs[3], hrs[14]
    b += [t(x0 + 3 * bw + bw / 2, y(h3["p21"]) - 14, f"{de(h3['p21'], 1)} %", 26, INK, 700, "middle"),
          t(x0 + 14 * bw + bw / 2, y(h14["p21"]) - 14, f"{de(h14['p21'], 1)} %", 26, INK, 700, "middle"),
          t(60, 1010, f"Über die ganze Nacht (22–6 Uhr) gegen den Tag (10–18 Uhr), je Anlage bereinigt:", 22, INK2),
          t(60, 1046, f"Anteil ab 21 km/h {de(NT['p21']['faktor_je_anlage'], 1)}-mal, ab 31 km/h {de(NT['p31']['faktor_je_anlage'], 1)}-mal so hoch.", 22, INK, 700),
          t(60, 1096, f"Grundlage: {de(sum(h['n'] for h in hrs))} Fälle der 43 festen Anlagen, die rund um die Uhr gleich messen.", 20, MUTED),
          t(60, 1126, "Ein Anteil unter den Geblitzten, keine Zahl der Raser: Verkehrsmengen fehlen.", 20, MUTED),
          foot()]
    return svg("".join(b))


def folie_knapp():
    FV, n, hist = D["fahrverbot"], D["meta"]["tempofaelle"], D["hist_ueber"]
    x0, x1, y0, y1 = 110, W - 60, 1010, 640
    mx = max(hist[1:41])
    bw = (x1 - x0) / 40
    b = [kicker("KÖLNER RASER-ATLAS 2025 · WIE SCHNELL?"),
         t(60, 250, f"{round(100 * FV['bis20'] / n)} %", 190, AMBER_SOFT, 750),
         t(60, 320, f"der {de(n)} Fälle liegen höchstens 20 km/h über dem Limit,", 28, INK),
         t(60, 358, "also ohne Punkt in Flensburg.", 28, INK),
         t(60, 430, f"Häufigster Wert: 6 km/h zu viel ({de(100 * FV['genau6'] / n, 1)} % aller Fälle), darunter wird praktisch nicht geahndet.", 21, INK2),
         t(60, 464, f"{de(100 * next(l['n'] for l in D['limits'] if l['lim'] == 30) / n, 1)} % der Fälle passieren bei Tempo 30. "
                    f"Verwarnungsgeld (bis 15 km/h): {round(100 * sum(hist[:16]) / n)} %.", 21, INK2),
         t(60, 498, f"Katalogwert aller Fälle rund {de(round(D['bussgeld']['summe_eur'] / 1e6))} Mio. €, im Schnitt {de(round(D['bussgeld']['summe_eur'] / n))} € pro Fall. Keine Einnahme.", 21, INK2),
         t(60, 600, "Fälle je km/h zu viel (1 bis 40)", 20, MUTED)]
    for u in range(1, 41):
        v = hist[u]
        c = RED if u >= 31 else SEV1 if u >= 21 else "#a3a19a"
        hgt = (y0 - y1) * math.sqrt(v / mx)
        b.append(f'<rect x="{x0 + (u - 1) * bw + 2:.1f}" y="{y0 - hgt:.1f}" width="{bw - 4:.1f}" height="{hgt:.1f}" fill="{c}"/>')
    for u in (1, 6, 10, 20, 30, 40):
        b.append(t(x0 + (u - 1) * bw + bw / 2, y0 + 32, str(u), 20, MUTED, anchor="middle"))
    b += [t(x0, y0 + 70, "grau: ohne Punkte · dunkelrot: 1 Punkt · rot: Fahrverbots-Tempo (innerorts ab 31)", 19, MUTED),
          t(x1, y0 + 70, "Höhe: Wurzelskala", 19, MUTED, anchor="end"),
          t(60, 1150, f"{de(FV['innerorts_ab31'] + FV['ausserorts_ab41'])} Fälle erreichen Fahrverbots-Tempo. Rekord: 203 km/h bei Tempo 50.", 22, INK),
          foot()]
    return svg("".join(b))


def folie_grenzen():
    M = D["meta"]
    zeilen = [("Keine Verkehrsmengen", "Die Daten zählen Geblitzte, nicht Autos. Eine „Raserquote“ lässt sich nicht berechnen."),
              ("Keine Unfälle", "Ob Blitzer Unfälle verhindern, zeigen diese Daten nicht."),
              ("Kennzeichen = Halter", "Das Kürzel nennt den Zulassungsbezirk, nicht, wer am Steuer saß."),
              ("Nur die Stadt", "Messungen der Polizei, etwa auf Autobahnen, sind nicht enthalten.")]
    b = [kicker("KÖLNER RASER-ATLAS 2025 · EHRLICH GESAGT"),
         t(60, 170, "Was die Daten", 60, INK, 750), t(60, 240, "nicht zeigen.", 60, INK, 750)]
    y = 340
    for h, s in zeilen:
        b += [f'<rect x="60" y="{y - 22}" width="6" height="58" fill="{AMBER}"/>', t(86, y, h, 28, INK, 700), t(86, y + 34, s, 21, INK2)]
        y += 110
    b += [f'<rect x="60" y="{y + 10}" width="{W - 120}" height="250" fill="#15171b" stroke="#2c2c2a"/>',
          t(90, y + 62, "Eine Frage an die Stadt", 20, AMBER_SOFT, 600, font=MONO, extra='letter-spacing="2"'),
          t(90, y + 112, f"Mobil wird zu {round(100 - M['mobil_nacht_anteil'])} % tagsüber und zu {round(100 - M['mobil_wochenende_anteil'])} % werktags gemessen.", 26, INK, 600),
          t(90, y + 152, "Die schweren Verstöße passieren aber vor allem nachts.", 26, INK, 600),
          t(90, y + 206, "Warum wird mobil nicht öfter nachts gemessen?", 24, INK2),
          t(60, H - 140, "Ganze Story mit Karte, Zeitraffer und Atlas aller 655 Messstellen:", 22, INK2),
          t(60, H - 104, "datenwgknowledgekitchen.com/koelner-raser-story.html", 26, AMBER_SOFT, 700),
          foot()]
    return svg("".join(b))


def to_png(svg_path):
    # Chrome zuerst; ein eigenes Profil verhindert, dass der Aufruf an ein offenes Browserfenster abgibt
    exe = next((p for p in (shutil.which("chrome"), r"C:\Program Files\Google\Chrome\Application\chrome.exe",
                            shutil.which("msedge"), r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")
                if p and Path(p).exists()), None)
    if not exe:
        print(f"  (kein Headless-Browser gefunden, nur {svg_path.name})")
        return None
    import tempfile
    png = svg_path.with_suffix(".png")
    png.unlink(missing_ok=True)
    subprocess.run([exe, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--user-data-dir={tempfile.mkdtemp(prefix='raser-social-')}",
                    f"--window-size={W},{H}", f"--screenshot={png}", svg_path.resolve().as_uri()], capture_output=True, timeout=120)
    if not png.exists():
        print(f"  ! {png.name} nicht erzeugt")
        return None
    print(f"✓ {png.relative_to(REPO)} · {png.stat().st_size / 1024:.0f} KB")
    return png


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    pngs = []
    for name, fn in (("raser-1-karte-nacht", folie_karte), ("raser-2-lernkurve", folie_lernkurve),
                     ("raser-3-nacht-tag", folie_nacht_tag), ("raser-4-knapp-drueber", folie_knapp),
                     ("raser-5-grenzen", folie_grenzen)):
        p = OUT / f"{name}.svg"
        p.write_text(fn(), encoding="utf-8")
        pngs.append(to_png(p))
    if all(pngs):
        from PIL import Image
        imgs = [Image.open(p).convert("RGB") for p in pngs]
        pdf = OUT / "raser-karussell.pdf"
        imgs[0].save(pdf, save_all=True, append_images=imgs[1:], resolution=144)
        print(f"✓ {pdf.relative_to(REPO)} · {pdf.stat().st_size / 1024:.0f} KB · {len(imgs)} Folien")


if __name__ == "__main__":
    main()
