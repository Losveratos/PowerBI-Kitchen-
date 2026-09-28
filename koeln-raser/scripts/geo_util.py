#!/usr/bin/env python3
"""Kleine Geo-Helfer für check_geo.py und build_map_data.py (nur Standardbibliothek).

Projektion: äquidistant mit cos(Breite) um 50,94° N — für ein Stadtgebiet von
knapp 30 km praktisch verzerrungsfrei. Einheiten in Metern.
"""
import math
import re
import unicodedata

LAT0 = 50.94
KX = 111_320 * math.cos(math.radians(LAT0))   # m je Grad Länge
KY = 111_230                                   # m je Grad Breite (bei 51° N)


def to_m(lon, lat):
    """lon/lat → Meter (x nach Osten, y nach Norden) relativ zu 0°/LAT0."""
    return lon * KX, (lat - LAT0) * KY


def dist_m(a, b):
    """Abstand zweier (lon, lat)-Punkte in Metern."""
    return math.hypot((a[0] - b[0]) * KX, (a[1] - b[1]) * KY)


def seg_dist_m(p, a, b):
    """Abstand Punkt p zu Strecke a–b (alle lon/lat) in Metern."""
    px, py = to_m(*p); ax, ay = to_m(*a); bx, by = to_m(*b)
    dx, dy = bx - ax, by - ay
    L = dx * dx + dy * dy
    t = 0 if L == 0 else max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / L))
    return math.hypot(px - ax - t * dx, py - ay - t * dy)


def line_dist_m(p, lines):
    """Kleinster Abstand von p zu einer Liste von Polylinien (lon/lat)."""
    best = math.inf
    for ln in lines:
        for a, b in zip(ln, ln[1:]):
            # grober Vorfilter: 0,01° ≈ 700–1100 m
            if min(a[0], b[0]) - .01 > p[0] or max(a[0], b[0]) + .01 < p[0] or \
               min(a[1], b[1]) - .01 > p[1] or max(a[1], b[1]) + .01 < p[1]:
                continue
            best = min(best, seg_dist_m(p, a, b))
    return best


def in_ring(p, ring):
    x, y, inside = p[0], p[1], False
    j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i][0], ring[i][1]
        xj, yj = ring[j][0], ring[j][1]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            inside = not inside
        j = i
    return inside


def in_poly(p, feat):
    """feat: {'outer': [ring…], 'inner': [ring…]} in lon/lat."""
    return any(in_ring(p, r) for r in feat["outer"]) and not any(in_ring(p, r) for r in feat.get("inner", []))


def poly_dist_m(p, feat):
    """0, wenn p in der Fläche liegt, sonst Abstand zum Rand in Metern."""
    return 0.0 if in_poly(p, feat) else line_dist_m(p, feat["outer"])


def centroid(feat):
    """Flächenschwerpunkt des größten Außenrings (lon/lat)."""
    ring = max(feat["outer"], key=len)
    a = cx = cy = 0.0
    for (x0, y0), (x1, y1) in zip(ring, ring[1:]):
        f = x0 * y1 - x1 * y0
        a += f; cx += (x0 + x1) * f; cy += (y0 + y1) * f
    return (cx / (3 * a), cy / (3 * a)) if a else tuple(ring[0])


def simplify(pts, tol):
    """Douglas-Peucker (iterativ) auf bereits projizierten Punkten [(x, y)…]."""
    if len(pts) < 3:
        return list(pts)
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        i, j = stack.pop()
        ax, ay = pts[i]; bx, by = pts[j]
        dx, dy = bx - ax, by - ay
        L = math.hypot(dx, dy)
        best, bi = -1.0, -1
        for k in range(i + 1, j):
            px, py = pts[k]
            d = abs(dy * (px - ax) - dx * (py - ay)) / L if L else math.hypot(px - ax, py - ay)
            if d > best:
                best, bi = d, k
        if best > tol:
            keep[bi] = True
            stack += [(i, bi), (bi, j)]
    return [p for p, k in zip(pts, keep) if k]


def norm_name(s):
    """Normalisierte Schreibweise für Namensvergleiche (Straßen, Stadtteile): „Höhenhaus“ = „Hoehenhaus“,
    „André-Citroën-Straße“ = „Andre-Citroen-Str.“. Beide Seiten laufen durch dieselbe Funktion."""
    s = (s or "").lower().replace("ß", "ss").replace("ae", "ä").replace("oe", "ö").replace("ue", "ü")
    s = "".join(c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c))
    s = re.sub(r"\bsankt\b|\bst\.", "st", s)
    s = re.sub(r"strasse\b|str\.|str\b", "str", s)
    return re.sub(r"[^a-z0-9]", "", s)
