#!/usr/bin/env python3
"""tile_compare.py - Bildvergleich Kitchen gegen Desktop je Kachel (Agent-Modus v2, Paket B).

Vergleicht das Kitchen-Bild einer Seite (`mockup/kitchen/<seq>/<Seite>.png`, Seiten-px,
Maßstab 1) mit dem Desktop-Screenshot derselben Seite (`mockup/shots/<seq>/<Seite>.png`)
je Kachel aus `tiles.json`. Der Desktop-Screenshot ist kein Seitenbild, sondern die
Berichtsansicht oder das ganze Fenster: find_canvas() sucht darin die Seitenfläche, beide
Bilder kommen auf dieselbe Arbeitsgröße (siehe „Seitenfläche im Desktop-Bild finden").

Die Skizzen im Kitchen zeichnen Beispieldaten, Desktop echte Zahlen. Verglichen werden deshalb
keine Pixel, sondern grobe, robuste Merkmale auf dem Graustufenbild (Gewichte in WEIGHTS):

* Struktur:  Verteilung der „Tinte" (Pixel, die sich deutlich vom Kachelhintergrund abheben)
             auf einem groben Raster der Diagrammfläche, Kosinus-Ähnlichkeit
* Form:      Ausrichtung der Vollflächen (Balken, Säulen; ohne dünne Linien und Schrift):
             Säulen statt liegender Balken fallen auf, andere Werte und Anzahlen nicht
* Menge:     Anteil Tinte in der Diagrammfläche (bis Faktor 2 toleriert)
* Kanten:    Dichte starker Helligkeitssprünge (bis Faktor 2 toleriert)
* Kopf:      Titelband vorhanden oder nicht
* Fläche:    Helligkeit des Kachelhintergrunds

Dazu wait_for_render(): Desktop-Bilder wiederholen, bis die Seite stabil gezeichnet ist und
keine Kachel mit Visual mehr leer ist (Custom Visuals zeichnen erst nach dem Reload).

Ergebnis je Kachel: {"score": 0..1, "notes": [deutsche Befunde], "metrics": {...}}.

Nur Standardbibliothek. Ist Pillow installiert, dekodiert es die PNGs (schnell); sonst
dekodiert ein eigener PNG-Leser (zlib, alle Filter, 8/16 Bit, Graustufe/RGB/RGBA/Palette,
ohne Interlace), der bei Full-HD einige Sekunden braucht.

    python tile_compare.py <kitchen.png> <desktop.png> <tiles.json> [Seitenname]
    python tile_compare.py crop <desktop.png> <Breite> <Höhe> <ziel.page.png>

`crop` schneidet die Seitenfläche aus einem Desktop-Bild und speichert sie in PBIR-Seitengröße
(crop_page, so schreibt der Runner `shots/<seq>/<Seite>.page.png`).
"""
from __future__ import annotations

import json
import math
import re
import struct
import sys
import time
import zlib
from pathlib import Path

INK = 48            # Helligkeitsabstand zum Hintergrund, ab dem ein Punkt als Tinte zählt
EDGE = 48           # Sprung zwischen Nachbarpunkten, ab dem er als Kante zählt
GRID = 16           # Spalten des Strukturrasters
SUB = 4             # Stichproben je Rasterzelle und Richtung
SOLID_RUN = 7       # Mindestdicke (Seiten-px) einer Vollfläche; Schrift und Linien sind dünner
SOLID_MIN = 0.02    # Anteil Vollfläche, ab dem eine Kachel „Flächen" zeigt
# Struktur und Form zählen am meisten; Menge und Kanten hängen an den Daten (Kitchen zeichnet
# Beispielwerte, Desktop echte) und bekommen Toleranz bis Faktor 2 und wenig Gewicht
WEIGHTS = {"struct": 0.25, "shape": 0.25, "amount": 0.1, "edges": 0.1, "title": 0.15,
           "bg": 0.15}


# --------------------------------------------------------------------------- #
# PNG lesen
# --------------------------------------------------------------------------- #
class Gray:
    """Graustufenbild: Breite, Höhe, Bytes zeilenweise (0 = schwarz)."""

    __slots__ = ("w", "h", "px", "decoder")

    def __init__(self, w: int, h: int, px, decoder: str) -> None:
        self.w, self.h, self.px, self.decoder = w, h, px, decoder

    def at(self, x: int, y: int) -> int:
        if x < 0:
            x = 0
        elif x >= self.w:
            x = self.w - 1
        if y < 0:
            y = 0
        elif y >= self.h:
            y = self.h - 1
        return self.px[y * self.w + x]


def have_pillow() -> bool:
    import importlib.util
    try:
        return importlib.util.find_spec("PIL") is not None
    except Exception:                            # noqa: BLE001
        return False


def read_gray(path, prefer_pillow: bool = True) -> Gray:
    """PNG als Graustufen; Transparenz wird auf Weiß gelegt."""
    path = Path(path)
    if prefer_pillow:
        try:
            from PIL import Image
        except Exception:                        # noqa: BLE001
            Image = None
        if Image is not None:
            with Image.open(path) as im:
                im.load()
                if im.mode in ("RGBA", "LA", "PA") or (im.mode == "P" and
                                                     "transparency" in im.info):
                    im = im.convert("RGBA")
                    bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
                    im = Image.alpha_composite(bg, im)
                g = im.convert("L")
                return Gray(g.width, g.height, g.tobytes(), "pillow")
    return _read_png_stdlib(path)


def _paeth(a: int, b: int, c: int) -> int:
    p = a + b - c
    pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    return b if pb <= pc else c


def _read_png_stdlib(path: Path) -> Gray:
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError("kein PNG: %s" % path)
    pos, idat, plte, trns = 8, [], None, None
    w = h = depth = ctype = interlace = None
    while pos < len(data):
        n = struct.unpack(">I", data[pos:pos + 4])[0]
        kind = data[pos + 4:pos + 8]
        body = data[pos + 8:pos + 8 + n]
        pos += 12 + n
        if kind == b"IHDR":
            w, h, depth, ctype, _, _, interlace = struct.unpack(">IIBBBBB", body)
        elif kind == b"PLTE":
            plte = body
        elif kind == b"tRNS":
            trns = body
        elif kind == b"IDAT":
            idat.append(body)
        elif kind == b"IEND":
            break
    if w is None:
        raise ValueError("PNG ohne IHDR: %s" % path)
    if interlace:
        raise ValueError("PNG mit Interlace wird ohne Pillow nicht gelesen: %s" % path)
    channels = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}.get(ctype)
    if channels is None or depth not in (8, 16) or (ctype == 3 and depth != 8):
        raise ValueError("PNG-Format (Farbtyp %s, %s Bit) ohne Pillow nicht lesbar"
                         % (ctype, depth))
    bpp = channels * depth // 8
    stride = w * bpp
    raw = zlib.decompress(b"".join(idat))
    prev = bytearray(stride)
    out = bytearray(w * h)
    o = 0
    p = 0
    for _ in range(h):
        ftype = raw[p]
        cur = bytearray(raw[p + 1:p + 1 + stride])
        p += 1 + stride
        if ftype == 1:
            for i in range(bpp, stride):
                cur[i] = (cur[i] + cur[i - bpp]) & 255
        elif ftype == 2:
            for i in range(stride):
                cur[i] = (cur[i] + prev[i]) & 255
        elif ftype == 3:
            for i in range(stride):
                a = cur[i - bpp] if i >= bpp else 0
                cur[i] = (cur[i] + ((a + prev[i]) >> 1)) & 255
        elif ftype == 4:
            for i in range(stride):
                a = cur[i - bpp] if i >= bpp else 0
                c = prev[i - bpp] if i >= bpp else 0
                cur[i] = (cur[i] + _paeth(a, prev[i], c)) & 255
        prev = cur
        step = 2 if depth == 16 else 1       # 16 Bit: nur das hohe Byte
        if ctype == 0:
            out[o:o + w] = cur[0:stride:step]
        elif ctype == 3:
            pal = plte or b""
            alpha = trns or b""
            for x in range(w):
                k = cur[x]
                r, g, b = pal[3 * k:3 * k + 3] if 3 * k + 3 <= len(pal) else (0, 0, 0)
                lum = (299 * r + 587 * g + 114 * b) // 1000
                if k < len(alpha):
                    a = alpha[k]
                    lum = (lum * a + 255 * (255 - a)) // 255
                out[o + x] = lum
        else:
            for x in range(w):
                q = x * bpp
                if ctype == 4:
                    lum, a = cur[q], cur[q + step]
                elif ctype == 2:
                    lum = (299 * cur[q] + 587 * cur[q + step] + 114 * cur[q + 2 * step]) // 1000
                    a = 255
                else:
                    lum = (299 * cur[q] + 587 * cur[q + step] + 114 * cur[q + 2 * step]) // 1000
                    a = cur[q + 3 * step]
                if a != 255:
                    lum = (lum * a + 255 * (255 - a)) // 255
                out[o + x] = lum
        o += w
    return Gray(w, h, bytes(out), "stdlib")


def write_gray_png(path, w: int, h: int, px) -> None:
    """Graustufen-PNG schreiben (Testhilfe und Diagnose)."""
    def chunk(kind: bytes, body: bytes) -> bytes:
        return (struct.pack(">I", len(body)) + kind + body
                + struct.pack(">I", zlib.crc32(kind + body) & 0xFFFFFFFF))
    rows = b"".join(b"\x00" + bytes(px[y * w:(y + 1) * w]) for y in range(h))
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 0, 0, 0, 0)
    Path(path).write_bytes(b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr)
                           + chunk(b"IDAT", zlib.compress(rows, 6)) + chunk(b"IEND", b""))


# --------------------------------------------------------------------------- #
# Seitenfläche im Desktop-Bild finden
# --------------------------------------------------------------------------- #
# Die Desktop-Bilder (`pbir desktop screenshot`, Bridge `report.snapshot.capture/v1`) sind
# keine Seitenbilder. Gesehen wurden (Oktober 2026):
#   * die Berichtsansicht: verkleinerte Seite auf dem Arbeitsflächen-Hintergrund (dunkles
#     Navy ~ (18,30,45), helles Grau ~ 229 oder per Theme `outspace` #EAE8E1), mit
#     Schlagschatten, rechts der Filterbereich;
#   * das ganze Desktop-Fenster im selben Bildformat: Titelleiste, Menüband, linke
#     Navigationsleiste, Filterbereich, die Seite unten abgeschnitten.
# Beide CLIs kennen nur `--scale` (Bridge-Parameter `{pageId, scale}`), keinen Ausschnitt.
#
# Verfahren (Bytes-Operationen, auch ohne Pillow schnell):
#   1. Kandidaten für die Arbeitsflächen-Farbe = Grauwerte langer einfarbiger Läufe in
#      Zeilen und Spalten (die Arbeitsfläche ist exakt einfarbig), nach Länge geordnet.
#   2. Je Kandidat: Arbeitsbereich [L, R) x [T, Bildende) = Spalten bzw. Zeilen mit langen
#      Läufen dieser Farbe (schneidet Titelleiste, Menüband, Navigation, Filterbereich ab).
#   3. Grobes Rechteck = längster Block von Zeilen/Spalten, die überwiegend nicht diese Farbe
#      haben; jede Kante auf den stärksten Helligkeitssprung in der Nähe einrasten.
#   4. Kantenkandidaten kombinieren: Seitenverhältnis muss zur PBIR-Seite passen; stößt die
#      Fläche unten an das Bildende und ist zu niedrig, gilt sie als unten abgeschnitten
#      (Höhe aus der Breite). Gültig nur, wenn ein Ring knapp außerhalb (jenseits des
#      Schattens) überwiegend die Arbeitsflächen-Farbe hat.
#   5. Es gilt der erste gültige Kandidat mit reinem Ring; ohne gültigen Kandidaten gibt es
#      einen Hinweis statt eines Scores.
BG_TOL = 2          # Grauwert-Abstand zur Arbeitsflächen-Farbe (sie ist exakt einfarbig;
                    # eng, weil helle Arbeitsfläche und Seitenhintergrund nah beieinander liegen)
ASPECT_TOL = 0.015  # erlaubte relative Abweichung des Seitenverhältnisses
FULL_TOL = 0.005    # Bild mit (fast) genau dem Seitenverhältnis = reines Seitenbild
MIN_CANVAS_W = 320  # schmalere Seitenflächen sind für einen Vergleich zu klein
MIN_VISIBLE = 0.4   # unten abgeschnittene Seite: mindestens dieser Anteil muss sichtbar sein
RING_PURITY = 0.7   # Anteil Arbeitsflächen-Farbe im Ring um die Seite, ab dem sie gilt
MAX_INSIDE = 0.3    # höchstens dieser Anteil der Seite darf die Arbeitsflächen-Farbe haben


def _bg_candidates(img: Gray, keep: int = 4) -> list:
    """Grauwerte langer einfarbiger Läufe (Zeilen und Spalten), nach Länge geordnet."""
    W, H = img.w, img.h
    px = img.px
    weight = [0] * 256
    step = max(1, min(W, H) // 100)
    rx_h = re.compile(rb"(.)\1{%d,}" % (max(16, W // 5) - 1), re.S)
    rx_v = re.compile(rb"(.)\1{%d,}" % (max(16, H // 5) - 1), re.S)
    for y in range(0, H, step):
        for m in rx_h.finditer(px[y * W:(y + 1) * W]):
            weight[m.group()[0]] += len(m.group())
    for x in range(0, W, step):
        for m in rx_v.finditer(px[x::W]):
            weight[m.group()[0]] += len(m.group())
    out = []
    for v in sorted(range(256), key=lambda i: -weight[i]):
        if not weight[v] or len(out) >= keep:
            break
        if all(abs(v - o) > 2 * BG_TOL for o in out):
            out.append(v)
    return out


def _longest_run(flags, gap: int):
    """Längster Block von Indizes mit flags[i], Lücken bis `gap` überbrückt -> (a, b) oder None."""
    best, cur_a, last_ok = None, None, None
    for i, ok in enumerate(flags):
        if ok:
            if cur_a is None or i - last_ok > gap + 1:
                cur_a = i
            last_ok = i
            if best is None or best[0] == cur_a or (last_ok + 1 - cur_a) > (best[1] - best[0]):
                best = (cur_a, last_ok + 1)
    return best


def _edge_candidates(profile, lo: int, hi: int, keep: int = 3):
    """Positionen mit den stärksten Sprüngen |p[i] - p[i-1]| in [lo, hi] -> [(pos, Stärke)].
    pos ist die erste Zeile/Spalte innerhalb der Fläche (oben/links) bzw. die erste
    außerhalb (unten/rechts) - beides ist derselbe Index i."""
    lo, hi = max(1, lo), min(len(profile) - 1, hi)
    steps = [(abs(profile[i] - profile[i - 1]), i) for i in range(lo, hi + 1)]
    if not steps:
        return []
    top = max(s for s, _ in steps) or 1.0
    steps.sort(reverse=True)
    out = []
    for s, i in steps:
        if s < 0.25 * top or s < 3:
            break
        if all(abs(i - j) > 2 for j, _ in out):
            out.append((i, s / top))
        if len(out) >= keep:
            break
    return out


def _canvas_for_bg(img: Gray, aspect: float, bg: int) -> dict:
    """Schritte 2-4 für eine angenommene Arbeitsflächen-Farbe bg."""
    W, H = img.w, img.h
    px = img.px
    fail = {"ok": False, "box": None, "how": "erkannt", "bg": bg}
    tbl = bytes((0x30 if abs(v - bg) <= BG_TOL else 0x31) for v in range(256))   # 0 = Hgr.
    min_col, min_row = max(8, int(0.05 * H)), max(8, int(0.05 * W))

    def col_has(x):
        return max(map(len, px[x::W].translate(tbl).split(b"1"))) >= min_col
    L = next((x for x in range(W) if col_has(x)), None)
    if L is None:
        return dict(fail, note="keine Arbeitsfläche")
    R = next(x for x in range(W - 1, -1, -1) if col_has(x)) + 1
    if R - L < MIN_CANVAS_W // 2:
        return dict(fail, note="Arbeitsfläche zu schmal")

    def row_has(y):
        return max(map(len, px[y * W + L:y * W + R].translate(tbl).split(b"1"))) >= min_row
    T = next((y for y in range(H) if row_has(y)), 0)
    rw = float(R - L)
    rows = [px[y * W + L:y * W + R].translate(tbl).count(b"1") / rw for y in range(T, H)]
    fmax = max(rows) if rows else 0.0
    span = _longest_run([f >= 0.6 * fmax for f in rows], gap=max(2, H // 50)) if fmax else None
    if not span:
        return dict(fail, note="keine Fläche auf der Arbeitsfläche")
    y0c, y1c = span[0] + T, span[1] + T
    hh = max(1, y1c - y0c)
    cols = [px[y0c * W + x:y1c * W:W].translate(tbl).count(b"1") / float(hh)
            for x in range(L, R)]
    cmax = max(cols) or 1.0
    span = _longest_run([f >= 0.6 * cmax for f in cols], gap=max(2, W // 50))
    if not span:
        return dict(fail, note="keine Fläche auf der Arbeitsfläche")
    x0c, x1c = span[0] + L, span[1] + L
    # Kanten einrasten: mittlere Helligkeit je Zeile/Spalte im inneren Bereich
    ix0, ix1 = x0c + (x1c - x0c) // 10, x1c - (x1c - x0c) // 10
    iy0, iy1 = y0c + (y1c - y0c) // 10, y1c - (y1c - y0c) // 10
    rprof = [sum(px[y * W + ix0:y * W + ix1]) / float(max(1, ix1 - ix0)) for y in range(H)]
    cprof = [sum(px[iy0 * W + x:iy1 * W:W]) / float(max(1, iy1 - iy0)) for x in range(W)]
    win = max(24, int(0.03 * max(W, H)))

    def cands(prof, coarse, inward, border):
        if inward > 0:
            lo, hi = max(border + 1, coarse - 4), coarse + win
        else:
            lo, hi = coarse - win, min(border - 1, coarse + 4)
        out = _edge_candidates(prof, lo, hi)
        if abs(coarse - border) <= 2:        # Fläche stößt an Bildrand bzw. Bereichsgrenze:
            out = [(border, 1.5)] + [c for c in out if c[0] != border]   # die Grenze gewinnt
        return out or [(coarse, 0.0)]
    tops = cands(rprof, y0c, +1, T)
    bots = cands(rprof, y1c, -1, H)
    lefts = cands(cprof, x0c, +1, L)
    rights = cands(cprof, x1c, -1, R)
    best = None
    for x0, sl in lefts:
        for x1, sr in rights:
            for y0, st in tops:
                for y1, sb in bots:
                    w, h = x1 - x0, y1 - y0
                    if w < MIN_CANVAS_W // 2 or h < 10:
                        continue
                    full = w / aspect
                    if y1 >= H - 1 and h < full - 3:          # unten abgeschnitten
                        if h < MIN_VISIBLE * full:
                            continue
                        err, clipped = 0.0, True
                    else:
                        err, clipped = abs(w / float(h) - aspect) / aspect, False
                        if err > ASPECT_TOL and abs(h - full) > 2.5:
                            continue
                    sc = sl + sr + st + sb - 4 * err - (0.5 if clipped else 0.0)
                    if best is None or sc > best[0]:
                        y1f = y0 + int(round(full)) if clipped else y1
                        best = (sc, [x0, y0, x1, y1f], err, clipped)
    if best is None:
        w, h = x1c - x0c, y1c - y0c
        return dict(fail, note="Seitenverhältnis passt nicht (gefunden %dx%d)" % (w, h),
                    pane=R if R < W else None)
    sc, box, err, clipped = best
    # Ring knapp außerhalb (jenseits des Schattens) muss Arbeitsflächen-Farbe sein, außer
    # an Seiten, die an Bildrand oder Bereichsgrenze stoßen
    d = max(4, int(0.02 * max(W, H)))
    x0, y0, x1, y1 = box
    pts = []
    xs = range(x0 + d, x1 - d, 3)
    ys = range(y0 + d, min(y1, H) - d, 3)
    if y0 - d >= T and y0 - T > 2:
        pts += [(x, y0 - d) for x in xs]
    if not clipped and y1 + d < H:
        pts += [(x, y1 + d) for x in xs]
    if x0 - d >= L and x0 - L > 2:
        pts += [(x0 - d, y) for y in ys]
    if x1 + d < R and R - x1 > 2:
        pts += [(x1 + d, y) for y in ys]
    good = sum(1 for x, y in pts if abs(px[y * W + x] - bg) <= BG_TOL)
    purity = good / float(len(pts)) if pts else None
    if purity is not None and purity < RING_PURITY:
        return dict(fail, note="Rand um die gefundene Fläche ist keine Arbeitsfläche",
                    box=box)
    # Gegenprobe: innen darf die Farbe kaum vorkommen, sonst ist sie eine Seitenfarbe (z. B.
    # Weiß von Menüband und Kacheln) und nicht die Arbeitsfläche
    inner = [px[y * W + x] for y in range(y0 + d, min(y1, H) - 1, 5)
             for x in range(x0 + d, x1 - d, 5)]
    inside = sum(1 for v in inner if abs(v - bg) <= BG_TOL) / float(len(inner) or 1)
    if inside > MAX_INSIDE:
        return dict(fail, note="Arbeitsflächen-Farbe auch in der Seite", box=box)
    if box[2] - box[0] < MIN_CANVAS_W:
        return dict(fail, box=box, note="Seitenfläche im Desktop-Bild zu klein für einen "
                    "Vergleich (%d px breit)" % (box[2] - box[0]))
    return {"ok": True, "box": box, "how": "erkannt", "note": "", "bg": bg,
            "pane": R if R < W else None, "area": [L, T, R, H],
            "clipped": clipped, "visible": round(min(1.0, (H - y0) / float(y1 - y0)), 4),
            "purity": None if purity is None else round(purity, 3),
            "aspectErr": round(err, 4), "strength": round(sc, 3),
            # Seiten am Bildrand sind schwache Belege (alles Bildbreite Füllende passt dort)
            "atImageEdge": int(x0 <= 0) + int(x1 >= W) + int(y0 <= 0) + int(y1 >= H)}


SIZE_TOL = 3        # px: gleiche Größe wie eine frühere Erkennung derselben Desktop-Sitzung


def _same_size(box, hint, tol: int = SIZE_TOL) -> bool:
    return bool(box and hint) and abs((box[2] - box[0]) - (hint[2] - hint[0])) <= tol and \
        abs((box[3] - box[1]) - (hint[3] - hint[1])) <= tol


def _strong(r: dict) -> bool:
    """Sichere Erkennung: reiner Ring um die Fläche und kaum Bildrand als Beleg."""
    return (r.get("purity") is not None and r["purity"] >= 0.9) and r.get("atImageEdge", 0) <= 1


def find_canvas(img: Gray, page_w: float, page_h: float, hint=None) -> dict:
    """Seitenfläche im Desktop-Bild -> {"ok", "box": [x0, y0, x1, y1], "how", "note",
    "reliable", "img": [W, H], ...}.

    `how`: "voll" (das Bild ist die Seite), "erkannt" (aus der Ansicht ausgeschnitten),
    "gemerkt" (nicht erkannt, Rechteck aus einer früheren Aufnahme derselben Desktop-Sitzung
    mit gleicher Bildgröße übernommen, `reliable: False`).
    `hint`: Rechteck einer früheren sicheren Erkennung (gleiche pid, gleiche Bildgröße, gleiche
    Seitengröße). Unter mehreren Kandidaten gewinnt der mit derselben Größe; passt keiner und
    ist die neue Erkennung nicht sicher, gilt das gemerkte Rechteck (Demo B5: große helle
    Visuals oder weiße Flächen verwirren die Umgebungsfarben-Suche, das Fenster bleibt gleich).
    `clipped`: Seite unten abgeschnitten; `box` reicht dann über das Bild hinaus und
    `visible` ist der sichtbare Anteil der Seitenhöhe."""
    W, H = img.w, img.h
    pw, ph = float(page_w or W), float(page_h or H)
    aspect = pw / ph
    if abs((W / float(H)) / aspect - 1.0) <= FULL_TOL:
        return {"ok": True, "box": [0, 0, W, H], "how": "voll", "note": "",
                "clipped": False, "visible": 1.0, "reliable": True, "img": [W, H]}
    hint = [int(v) for v in hint] if hint and len(hint) == 4 else None
    found, notes = [], []
    for bg in _bg_candidates(img):
        r = _canvas_for_bg(img, aspect, bg)
        if r["ok"]:
            found.append(r)
        else:
            notes.append(r["note"])

    def rank(r):
        # gleiche Größe wie früher vor reinem Ring vor wenigen Seiten am Bildrand vor Kanten
        return (_same_size(r["box"], hint),
                (r["purity"] if r["purity"] is not None else 0.8) >= 0.9,
                -r["atImageEdge"], r["strength"])
    if found:
        best = dict(max(found, key=rank), reliable=True, img=[W, H])
        if hint is None or _same_size(best["box"], hint) or _strong(best):
            return best
        return _from_hint(hint, W, H, pw, ph,
                          "Erkennung unsicher (%dx%d statt %dx%d wie zuvor)" % (
                              best["box"][2] - best["box"][0], best["box"][3] - best["box"][1],
                              hint[2] - hint[0], hint[3] - hint[1]))
    note = ("Seitenfläche im Desktop-Bild nicht sicher erkannt (%s; Bild %dx%d, Seite %gx%g)"
            % (notes[0] if notes else "keine einfarbige Arbeitsfläche", W, H, pw, ph))
    if hint is not None:
        return _from_hint(hint, W, H, pw, ph, note)
    return {"ok": False, "box": None, "how": "erkannt", "note": note, "reliable": False,
            "img": [W, H]}


def _from_hint(hint, W: int, H: int, pw: float, ph: float, why: str) -> dict:
    """Gemerktes Rechteck dieser Desktop-Sitzung als Rückfall (unsicher markiert)."""
    x0, y0, x1, y1 = hint
    clipped = y1 > H
    visible = 1.0 if not clipped else round(max(0.0, min(1.0, (H - y0) / float(y1 - y0))), 4)
    return {"ok": True, "box": list(hint), "how": "gemerkt", "reliable": False,
            "clipped": clipped, "visible": visible, "img": [W, H],
            "note": "%s; Rechteck aus einer früheren Aufnahme dieser Desktop-Sitzung "
                    "übernommen (unsicher)" % why}


def resample(img: Gray, box, out_w: int, out_h: int, prefer_pillow: bool = True,
             pad: int = 255) -> Gray:
    """Ausschnitt box=(x0, y0, x1, y1) auf out_w x out_h bringen (Pillow: Flächenmittel bzw.
    bilinear; ohne Pillow: nächster Nachbar). Reicht box unten über das Bild hinaus
    (abgeschnittene Seite), wird der fehlende Teil mit `pad` gefüllt."""
    x0, y0, x1, y1 = [int(v) for v in box]
    if (x0, y0, x1, y1) == (0, 0, img.w, img.h) and (out_w, out_h) == (img.w, img.h):
        return img
    if y1 > img.h:                               # sichtbaren Teil skalieren, Rest füllen
        vis_h = max(1, int(round(out_h * (img.h - y0) / float(y1 - y0))))
        top = resample(img, (x0, y0, x1, img.h), out_w, min(out_h, vis_h), prefer_pillow)
        return Gray(out_w, out_h, bytes(top.px) + bytes([pad]) * (out_w * (out_h - top.h)),
                    img.decoder)
    if prefer_pillow:
        try:
            from PIL import Image
        except Exception:                        # noqa: BLE001
            Image = None
        if Image is not None:
            im = Image.frombytes("L", (img.w, img.h), bytes(img.px)).crop((x0, y0, x1, y1))
            down = out_w <= (x1 - x0)
            im = im.resize((out_w, out_h), Image.BOX if down else Image.BILINEAR)
            return Gray(out_w, out_h, im.tobytes(), img.decoder)
    sw, sh = x1 - x0, y1 - y0
    xs = [x0 + min(sw - 1, int((i + 0.5) * sw / out_w)) for i in range(out_w)]
    out = bytearray()
    px = img.px
    for j in range(out_h):
        y = y0 + min(sh - 1, int((j + 0.5) * sh / out_h))
        row = px[y * img.w:(y + 1) * img.w]
        out += bytes(map(row.__getitem__, xs))
    return Gray(out_w, out_h, bytes(out), img.decoder)


# --------------------------------------------------------------------------- #
# Render abwarten: Custom Visuals zeichnen erst Sekunden nach dem Reload
# --------------------------------------------------------------------------- #
FRAME_W = 480           # Arbeitsbreite für den Stabilitätsvergleich
STABLE_MEAN = 1.5       # mittlere Grauwert-Abweichung zweier Bilder, bis zu der sie „gleich" sind
STABLE_CHANGED = 0.003  # Anteil deutlich (>= 24) geänderter Punkte, bis zu dem sie „gleich" sind
BLANK_INK = 0.002       # Anteil Tinte, unter dem eine Kachelfläche als leer gilt
NO_BLANK_CHECK = {"text", "image", "button", "shape", "spacer"}   # dürfen leer sein


def _hint(hint, img: Gray):
    """hint als Rechteck oder als Funktion (Bildbreite, Bildhöhe) -> Rechteck oder None."""
    if callable(hint):
        try:
            return hint(img.w, img.h)
        except Exception:                        # noqa: BLE001 - ohne Rückfall weiter
            return None
    return hint


def page_frame(path, page_w: float, page_h: float, prefer_pillow: bool = True, hint=None):
    """Desktop-Bild -> (Seitenfläche als kleines Graustufenbild oder None, find_canvas)."""
    img = read_gray(path, prefer_pillow)
    pw, ph = float(page_w or img.w), float(page_h or img.h)
    c = find_canvas(img, pw, ph, hint=_hint(hint, img))
    if not c["ok"]:
        return None, c
    ow = min(FRAME_W, c["box"][2] - c["box"][0])
    oh = max(1, int(round(ph * ow / pw)))
    return resample(img, c["box"], ow, oh, prefer_pillow), c


def crop_page(desktop_png, page_w: float, page_h: float, out_path,
              prefer_pillow: bool = True, hint=None) -> dict:
    """Seitenfläche aus einem Desktop-Bild ausschneiden und in PBIR-Seitengröße speichern
    (für das Kitchen: Overlay, Schieber, Verlauf ohne Menüband und Filterbereich).

    Mit Pillow in Farbe (RGB); ist die Seite unten abgeschnitten, bleibt der unsichtbare
    Teil durchsichtig (RGBA). Ohne Pillow ein Graustufenbild. hint wie bei find_canvas
    (Rechteck oder Funktion der Bildgröße).
    -> {"ok", "path", "box", "how", "reliable", "img", "clipped", "visible", "mode", "note"}"""
    gray = read_gray(desktop_png, prefer_pillow)
    pw, ph = float(page_w or gray.w), float(page_h or gray.h)
    c = find_canvas(gray, pw, ph, hint=_hint(hint, gray))
    if not c["ok"]:
        return {"ok": False, "path": None, "box": None, "how": c.get("how"),
                "img": c.get("img"), "reliable": False,
                "note": c.get("note") or "Seitenfläche nicht erkannt"}
    W, H = max(1, int(round(pw))), max(1, int(round(ph)))
    x0, y0, x1, y1 = [int(v) for v in c["box"]]
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    mode = None
    if prefer_pillow:
        try:
            from PIL import Image
        except Exception:                        # noqa: BLE001
            Image = None
        if Image is not None:
            with Image.open(desktop_png) as im:
                im.load()
                im = im.convert("RGB")
                down = (x1 - x0) >= W
                filt = Image.LANCZOS if down else Image.BICUBIC
                if y1 > im.height:               # unten abgeschnitten: Rest durchsichtig
                    vis_h = max(1, min(H, int(round(H * (im.height - y0) / float(y1 - y0)))))
                    top = im.crop((x0, y0, x1, im.height)).resize((W, vis_h), filt)
                    page = Image.new("RGBA", (W, H), (255, 255, 255, 0))
                    page.paste(top.convert("RGBA"), (0, 0))
                else:
                    page = im.crop((x0, y0, x1, y1)).resize((W, H), filt)
                page.save(out_path, "PNG")
            mode = "pillow"
    if mode is None:
        g = resample(gray, (x0, y0, x1, y1), W, H, prefer_pillow=False)
        write_gray_png(out_path, W, H, g.px)
        mode = "stdlib-grau"
    return {"ok": True, "path": str(out_path), "box": [x0, y0, x1, y1], "how": c["how"],
            "reliable": c.get("reliable", True), "img": c.get("img"),
            "clipped": bool(c.get("clipped")), "visible": c.get("visible", 1.0),
            "mode": mode, "note": c.get("note") or ""}


def frames_equal(a: Gray, b: Gray) -> bool:
    if a is None or b is None or (a.w, a.h) != (b.w, b.h):
        return False
    tot = changed = 0
    for x, y in zip(a.px, b.px):
        d = x - y if x >= y else y - x
        tot += d
        changed += d >= 24
    n = float(len(a.px) or 1)
    return tot / n <= STABLE_MEAN and changed / n <= STABLE_CHANGED


def blank_tiles(frame: Gray, page_w: float, page_h: float, tiles: dict,
                visible: float = 1.0) -> list:
    """Schlüssel der Kacheln, deren Diagrammfläche (ohne Titelzone) noch leer ist.
    tiles: {key: {"rect": {x, y, w, h} in Seiten-px, "kind"}}; visible = sichtbarer Anteil
    der Seitenhöhe (unten abgeschnittene Seite: Kacheln darunter zählen nicht)."""
    s = frame.w / float(page_w or frame.w)
    vis_ph = float(page_h or frame.h) * float(visible or 1.0)
    out = []
    for key, t in tiles.items():
        r = t.get("rect") or {}
        if (t.get("kind") or "") in NO_BLANK_CHECK or not r.get("w") or not r.get("h"):
            continue
        if float(r.get("y", 0)) + float(r["h"]) > vis_ph + 2:
            continue
        rect = _rect(r, s, s, frame)
        if rect[2] - rect[0] < 6 or rect[3] - rect[1] < 6:
            continue
        bg = _background(frame, rect, max(1, int(round(4 * s))))
        h = float(r["h"])
        top = float(r["y"]) + max(0.2 * h, 36.0)            # Titel zählt nicht als Inhalt
        inner = _rect({"x": float(r["x"]) + 8, "y": top, "w": float(r["w"]) - 16,
                       "h": float(r["y"]) + h - 8 - top}, s, s, frame)
        n = ink = 0
        for y in range(inner[1], inner[3]):
            row = frame.px[y * frame.w + inner[0]:y * frame.w + inner[2]]
            n += len(row)
            ink += sum(1 for v in row if abs(v - bg) >= 24)
        if n and ink / float(n) < BLANK_INK:
            out.append(key)
    return out


def wait_for_render(capture, page_w: float, page_h: float, tiles: dict,
                    max_wait: float = 20.0, interval: float = 1.5,
                    sleep=time.sleep, clock=time.time, prefer_pillow: bool = True,
                    hint=None) -> dict:
    """Bilder holen, bis zwei aufeinanderfolgende Seitenflächen fast gleich sind und keine
    Kachel mit Visual mehr leer ist, höchstens max_wait Sekunden (Runner: 8 s je Seite).

    capture() -> (Pfad oder None, Fehler); jedes Bild überschreibt das vorige. hint wie bei
    find_canvas (gemerktes Rechteck dieser Desktop-Sitzung).
    -> {"path", "err", "tries", "waited", "stable", "blank": [keys], "note", "canvas"}"""
    t0 = clock()
    prev, last_path, last_blank, tries, stable, note = None, None, [], 0, False, ""
    canvas = None
    while True:
        path, err = capture()
        tries += 1
        if not path:
            if last_path is None:
                return {"path": None, "err": err, "tries": tries, "waited": clock() - t0,
                        "stable": False, "blank": [], "note": "", "canvas": None}
            note = "letztes Bild: %s" % err
            break
        last_path = path
        try:
            frame, canvas = page_frame(path, page_w, page_h, prefer_pillow, hint=hint)
        except Exception as e:                   # noqa: BLE001 - Bild nicht lesbar
            frame, canvas = None, {"note": str(e)}
        if frame is None:                        # Seitenfläche nicht erkennbar: nicht warten
            note = canvas.get("note") or "Seitenfläche nicht erkannt"
            last_blank = []
            break
        if canvas.get("how") == "gemerkt":
            note = canvas.get("note") or ""
        last_blank = blank_tiles(frame, page_w, page_h, tiles, canvas.get("visible") or 1.0)
        stable = frames_equal(prev, frame)
        if stable and not last_blank:
            break
        if clock() - t0 + interval > max_wait:
            break
        prev = frame
        sleep(interval)
    return {"path": last_path, "err": None, "tries": tries, "waited": clock() - t0,
            "stable": stable, "blank": last_blank, "note": note, "canvas": canvas}


# --------------------------------------------------------------------------- #
# Merkmale
# --------------------------------------------------------------------------- #
def _rect(r, sx: float, sy: float, img: Gray):
    """Seiten-px-Rechteck -> Bild-px (x0, y0, x1, y1), auf das Bild begrenzt."""
    x0 = max(0, int(round(float(r.get("x", 0)) * sx)))
    y0 = max(0, int(round(float(r.get("y", 0)) * sy)))
    x1 = min(img.w, int(round((float(r.get("x", 0)) + float(r.get("w", 0))) * sx)))
    y1 = min(img.h, int(round((float(r.get("y", 0)) + float(r.get("h", 0))) * sy)))
    return x0, y0, x1, y1


def _median(vals):
    vals = sorted(vals)
    return vals[len(vals) // 2] if vals else 255


def _background(img: Gray, box, inset: int) -> int:
    """Kachelhintergrund: Median entlang eines leicht eingerückten Rahmens."""
    x0, y0, x1, y1 = box
    xa, xb = x0 + inset, x1 - 1 - inset
    ya, yb = y0 + inset, y1 - 1 - inset
    if xb <= xa or yb <= ya:
        return _median([img.at(x0, y0)])
    pts = []
    for i in range(24):
        t = i / 23.0
        x = int(xa + t * (xb - xa))
        y = int(ya + t * (yb - ya))
        pts += [img.at(x, ya), img.at(x, yb), img.at(xa, y), img.at(xb, y)]
    return _median(pts)


def _lattice(img: Gray, box, cols: int, rows: int, sub: int):
    """Stichprobengitter (cols*sub) x (rows*sub) über box, zeilenweise."""
    x0, y0, x1, y1 = box
    nx, ny = cols * sub, rows * sub
    bw, bh = max(1, x1 - x0), max(1, y1 - y0)
    xs = [x0 + int((i + 0.5) * bw / nx) for i in range(nx)]
    ys = [y0 + int((j + 0.5) * bh / ny) for j in range(ny)]
    return [[img.at(x, y) for x in xs] for y in ys]


_SHORT_RUN = {}


def _drop_short(buf: bytes, n: int) -> bytes:
    """In einem 0/1-Puffer (Zeilen durch 0 getrennt) Läufe kürzer als n auf 0 setzen."""
    rx = _SHORT_RUN.get(n)
    if rx is None:
        rx = _SHORT_RUN[n] = re.compile(rb"(?<!\x01)\x01{1,%d}(?!\x01)" % (n - 1))
    return rx.sub(lambda m: bytes(len(m.group())), buf)


def _solid(img: Gray, body, bg: int, min_run: int) -> dict:
    """Vollflächen der Diagrammfläche (Balken, Säulen, Kästen): Tinte, die waagerecht UND
    senkrecht mindestens min_run Punkte dick ist. Dünne Linien und Schrift fallen weg.
    -> {"area": Anteil, "h": mittlere waagerechte, "v": mittlere senkrechte Lauflänge in px}
    (längengewichtet, damit wenige große Flächen zählen, nicht Krümel)."""
    x0, y0, x1, y1 = body
    bw, bh = x1 - x0, y1 - y0
    tbl = bytes((1 if abs(v - bg) >= INK else 0) for v in range(256))
    rows = [img.px[y * img.w + x0:y * img.w + x1].translate(tbl) for y in range(y0, y1)]
    if len(rows) < 2 or bw < 2:
        return {"area": 0.0, "h": 0.0, "v": 0.0}
    hs = _drop_short(b"\x00".join(rows), min_run)
    mask = b"".join(rows)
    vs = _drop_short(b"\x00".join(mask[x::bw] for x in range(bw)), min_run)
    solid = []
    for y in range(bh):
        a = int.from_bytes(hs[y * (bw + 1):y * (bw + 1) + bw], "big")
        b = int.from_bytes(vs[y::bh + 1], "big")
        solid.append((a & b).to_bytes(bw, "big"))
    hl = [len(r) for row in solid for r in row.split(b"\x00") if r]
    flat = b"".join(solid)
    vl = [len(r) for x in range(bw) for r in flat[x::bw].split(b"\x00") if r]
    area = sum(hl) / float(bw * bh)

    def wmean(lens):
        return sum(n * n for n in lens) / float(sum(lens)) if lens else 0.0
    return {"area": area, "h": wmean(hl), "v": wmean(vl)}


def features(img: Gray, page_w: float, page_h: float, tile: dict) -> dict:
    sx = img.w / float(page_w or img.w)
    sy = img.h / float(page_h or img.h)
    rect = tile.get("rect") or {}
    box = _rect(rect, sx, sy, img)
    if box[2] - box[0] < 4 or box[3] - box[1] < 4:
        return {"outside": True}
    inset = max(2, int(round(4 * sx)))
    bg = _background(img, box, inset)
    body_r = tile.get("body") or rect
    body = _rect(body_r, sx, sy, img)
    if body[2] - body[0] < 4 or body[3] - body[1] < 4:
        body = box
    bw, bh = body[2] - body[0], body[3] - body[1]
    cols = GRID
    rows = max(4, min(GRID, int(round(GRID * bh / float(bw)))))
    lat = _lattice(img, body, cols, rows, SUB)
    grid = []
    for r in range(rows):
        for c in range(cols):
            ink = 0
            for j in range(r * SUB, (r + 1) * SUB):
                row = lat[j]
                for i in range(c * SUB, (c + 1) * SUB):
                    if abs(row[i] - bg) >= INK:
                        ink += 1
            grid.append(ink / float(SUB * SUB))
    edges = pairs = 0
    for j in range(len(lat)):
        row = lat[j]
        nxt = lat[j + 1] if j + 1 < len(lat) else None
        for i in range(len(row)):
            if i + 1 < len(row):
                pairs += 1
                if abs(row[i] - row[i + 1]) >= EDGE:
                    edges += 1
            if nxt is not None:
                pairs += 1
                if abs(row[i] - nxt[i]) >= EDGE:
                    edges += 1
    # Kopfband: Kitchen-Kopf (headH) bzw. die oberen 36 Seiten-px; dicht abtasten (Text ist dünn)
    head_h = float(tile.get("headH") or 0) or min(36.0, float(rect.get("h", 0)) * 0.18)
    band = _rect({"x": float(rect.get("x", 0)) + 6, "y": float(rect.get("y", 0)) + 2,
                  "w": float(rect.get("w", 0)) - 12, "h": head_h}, sx, sy, img)
    band_ink = band_n = 0
    step = max(1, int(round(2 * sx)))
    for y in range(band[1], band[3], step):
        base = y * img.w
        for x in range(band[0], band[2], step):
            band_n += 1
            if abs(img.px[base + x] - bg) >= INK:
                band_ink += 1
    solid = _solid(img, body, bg, max(3, int(round(SOLID_RUN * sx))))
    return {"outside": False, "bg": bg, "grid": grid, "cols": cols, "rows": rows,
            "ink": sum(grid) / float(len(grid) or 1),
            "edges": edges / float(pairs or 1),
            "band": band_ink / float(band_n or 1), "solid": solid}


def _cos(a, b) -> float:
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(x * x for x in b))
    if na < 1e-9 and nb < 1e-9:
        return 1.0
    if na < 1e-9 or nb < 1e-9:
        return 0.0
    return sum(x * y for x, y in zip(a, b)) / (na * nb)


def _blur(grid, cols, rows):
    """3x3-Mittel: kleine Verschiebungen (andere Daten, andere Balkenlängen) zählen weniger."""
    out = []
    for r in range(rows):
        for c in range(cols):
            s = n = 0
            for dr in (-1, 0, 1):
                for dc in (-1, 0, 1):
                    rr, cc = r + dr, c + dc
                    if 0 <= rr < rows and 0 <= cc < cols:
                        s += grid[rr * cols + cc]
                        n += 1
            out.append(s / n)
    return out


def _ratio_sim(a: float, b: float, floor: float) -> float:
    a, b = max(a, floor), max(b, floor)
    return min(a, b) / max(a, b)


def _tol_sim(a: float, b: float, floor: float) -> float:
    """Mengenvergleich mit Toleranz: bis Faktor 2 Abstand voll (andere Daten, mehr oder
    weniger Kategorien), darüber linear abnehmend."""
    return min(1.0, _ratio_sim(a, b, floor) / 0.5)


def _form(s: dict):
    """(Form, Orientierung) der Vollflächen: o = ln(waagerechte / senkrechte Lauflänge)."""
    if not s or s.get("area", 0) < SOLID_MIN:
        return "ohne Flächen (Linien, Text)", None
    o = math.log(max(s["h"], 1.0) / max(s["v"], 1.0))
    if o >= 0.7:
        return "liegende Balken", o
    if o <= -0.3:
        return "Säulen", o
    return "Flächen", o


def _shape_sim(ks: dict, ds: dict) -> float:
    """Ähnlichkeit der Diagrammform aus den Vollflächen. Andere Daten ändern Balkenlängen
    und -anzahl (Δo bis etwa 1), Säulen statt liegender Balken kippen o um 2 bis 4."""
    _, ko = _form(ks)
    _, do = _form(ds)
    if ko is None and do is None:
        return 1.0
    if ko is None or do is None:
        big = max((ks or {}).get("area", 0), (ds or {}).get("area", 0))
        return 0.2 if big >= 3 * SOLID_MIN else 0.6
    return max(0.0, min(1.0, 1.0 - (abs(ko - do) - 1.0) / 1.5))


def score_tile(k: dict, d: dict, tile: dict | None = None) -> dict:
    """Kitchen-Merkmale k gegen Desktop-Merkmale d -> {score, notes, metrics}."""
    tile = tile or {}
    if k.get("outside") or d.get("outside"):
        return {"score": 0.0, "notes": ["Kachel liegt außerhalb des Bildes"],
                "metrics": {}}
    notes = []
    s_struct = _cos(_blur(k["grid"], k["cols"], k["rows"]),
                    _blur(d["grid"], d["cols"], d["rows"]))
    s_shape = _shape_sim(k.get("solid"), d.get("solid"))
    s_amount = _tol_sim(k["ink"], d["ink"], 0.004)
    s_edges = _tol_sim(k["edges"], d["edges"], 0.003)
    k_head = k["band"] >= 0.01 or bool(tile.get("headH")) and bool(tile.get("title"))
    d_head = d["band"] >= 0.01
    s_title = 1.0 if k_head == d_head else 0.0
    s_bg = max(0.0, 1.0 - abs(k["bg"] - d["bg"]) / 60.0)
    score = (WEIGHTS["struct"] * s_struct + WEIGHTS["shape"] * s_shape
             + WEIGHTS["amount"] * s_amount + WEIGHTS["edges"] * s_edges
             + WEIGHTS["title"] * s_title + WEIGHTS["bg"] * s_bg)
    empty_d = d["ink"] < 0.004 and d["edges"] < 0.003
    if empty_d and k["ink"] >= 0.02:
        notes.append("Fläche leer: Desktop zeigt in der Kachel kein Diagramm")
        score = min(score, 0.4)
    if k_head and not d_head:
        notes.append("Titel fehlt in Desktop")
    elif d_head and not k_head:
        notes.append("Desktop zeigt einen Titel, das Kitchen nicht")
    if not empty_d:
        k_form, d_form = _form(k.get("solid"))[0], _form(d.get("solid"))[0]
        if s_shape < 0.4:
            notes.append("andere Diagrammform: Kitchen %s, Desktop %s" % (k_form, d_form)
                         if k_form != d_form else
                         "andere Diagrammform (Flächen anders geformt)")
        if s_struct < 0.5:
            notes.append("deutlich andere Struktur (Lage der Elemente weicht ab)")
        if d["ink"] > 2.5 * max(k["ink"], 0.004):
            notes.append("Desktop deutlich voller (mehr Beschriftung oder Elemente)")
        elif k["ink"] > 2.5 * max(d["ink"], 0.004):
            notes.append("Desktop deutlich leerer als das Kitchen")
    if abs(k["bg"] - d["bg"]) > 40:
        notes.append("Kachelhintergrund weicht ab (%s statt %s)"
                     % ("dunkel" if d["bg"] < 128 else "hell",
                        "dunkel" if k["bg"] < 128 else "hell"))
    metrics = {"struct": round(s_struct, 3), "shape": round(s_shape, 3),
               "amount": round(s_amount, 3),
               "edges": round(s_edges, 3), "title": s_title, "bg": round(s_bg, 3),
               "inkKitchen": round(k["ink"], 4), "inkDesktop": round(d["ink"], 4)}
    return {"score": round(max(0.0, min(1.0, score)), 3), "notes": notes, "metrics": metrics}


def compare_page(kitchen_png, desktop_png, page_w: float, page_h: float, tiles: dict,
                 prefer_pillow: bool = True, hint=None) -> dict:
    """tiles: {key: tile aus tiles.json} -> {"ok", "tiles": {key: Ergebnis}, "ms", "decoder",
    "canvas", "work", "reliable"}.

    Das Desktop-Bild wird zuerst auf die Seitenfläche zugeschnitten (find_canvas), dann
    werden beide Bilder auf dieselbe Arbeitsgröße (Seiten-px mal dem kleineren Maßstab)
    gebracht. Ist die Seitenfläche nicht sicher zu finden, gibt es keine Kachel-Ergebnisse,
    sondern "ok": False und "note" (kein Score aus falsch zugeordneten Pixeln). Mit hint
    (gemerktes Rechteck dieser Desktop-Sitzung) wird trotzdem gewertet, aber `reliable: False`
    und je Kachel ein Hinweis."""
    t0 = time.time()
    kimg = read_gray(kitchen_png, prefer_pillow)
    dimg = read_gray(desktop_png, prefer_pillow)
    pw, ph = float(page_w or kimg.w), float(page_h or kimg.h)
    canvas = find_canvas(dimg, pw, ph, hint=_hint(hint, dimg))
    base = {"decoder": "%s/%s" % (kimg.decoder, dimg.decoder),
            "sizes": [[kimg.w, kimg.h], [dimg.w, dimg.h]], "canvas": canvas}
    if not canvas["ok"]:
        return dict(base, ok=False, note=canvas["note"], tiles={},
                    ms=int((time.time() - t0) * 1000))
    kcan = find_canvas(kimg, pw, ph)
    if not kcan["ok"] or kcan["how"] != "voll":
        note = "Kitchen-Bild hat nicht das Seitenverhältnis der Seite (%dx%d statt %gx%g)" % (
            kimg.w, kimg.h, pw, ph)
        return dict(base, ok=False, note=note, tiles={}, ms=int((time.time() - t0) * 1000))
    # gemeinsame Arbeitsgröße: Seiten-px mal dem kleineren Maßstab der beiden Bilder (das
    # schärfere Bild wird verkleinert, nicht das unschärfere vergrößert)
    x0, y0, x1, y1 = canvas["box"]
    ws = min(1.0, (x1 - x0) / pw, kimg.w / pw)
    ow, oh = max(1, int(round(pw * ws))), max(1, int(round(ph * ws)))
    kimg = resample(kimg, (0, 0, kimg.w, kimg.h), ow, oh, prefer_pillow)
    dimg = resample(dimg, canvas["box"], ow, oh, prefer_pillow)
    out, hidden = {}, {}
    vis_ph = ph * float(canvas.get("visible") or 1.0)       # sichtbare Seitenhöhe
    for key, tile in tiles.items():
        r = tile.get("rect") or {}
        if canvas.get("clipped") and float(r.get("y", 0)) + float(r.get("h", 0)) > vis_ph + 2:
            hidden[key] = ("Kachel im Desktop-Bild nicht ganz sichtbar (Seite unten "
                           "abgeschnitten, %d %% sichtbar)" % round(100 * vis_ph / ph))
            continue
        try:
            out[key] = score_tile(features(kimg, pw, ph, tile),
                                  features(dimg, pw, ph, tile), tile)
        except Exception as e:                   # noqa: BLE001 - eine Kachel stoppt nichts
            out[key] = {"score": 0.0, "notes": ["Vergleich nicht möglich: %s" % e],
                        "metrics": {}}
    reliable = bool(canvas.get("reliable", True))
    if not reliable:
        for r in out.values():
            r["reliable"] = False
            r["notes"] = list(r.get("notes") or []) + [
                "Seitenfläche nicht sicher erkannt, Rechteck aus einer früheren Aufnahme "
                "übernommen: Ergebnis unsicher"]
    note = ("%d Kachel(n) nicht im Bild (Seite unten abgeschnitten)" % len(hidden)
            if hidden else "")
    return dict(base, ok=True, note=note, tiles=out, hidden=hidden, work=[ow, oh],
                reliable=reliable, ms=int((time.time() - t0) * 1000))


def _main(argv) -> int:
    if argv[:1] == ["crop"] and len(argv) == 5:
        res = crop_page(argv[1], float(argv[2]), float(argv[3]), argv[4])
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0 if res.get("ok") else 1
    if len(argv) < 3:
        print(__doc__)
        return 2
    tj = json.loads(Path(argv[2]).read_text(encoding="utf-8-sig"))
    pages = tj.get("pages") or []
    page = next((p for p in pages if len(argv) < 4 or p.get("name") == argv[3]), None)
    if page is None:
        print("Seite nicht in tiles.json")
        return 2
    tiles = {k: t for k, t in (tj.get("tiles") or {}).items() if t.get("page") == page["name"]}
    res = compare_page(argv[0], argv[1], page.get("width"), page.get("height"), tiles)
    print(json.dumps(res, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    for s in (sys.stdout, sys.stderr):
        try:
            s.reconfigure(encoding="utf-8", errors="replace")
        except Exception:                        # noqa: BLE001
            pass
    raise SystemExit(_main(sys.argv[1:]))
