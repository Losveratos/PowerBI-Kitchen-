#!/usr/bin/env python3
"""Rechnet alle Zahlen und Grafikdaten der Story „Zwei Heimaten“ → data/story_data.json.

Einzige Quelle ist der Wohlstandsatlas (wohlstandsatlas/atlas-data.js): dieselben Einheiten,
dieselben Werte wie auf wohlstandsatlas.html. Nichts wird von Hand eingetragen.

    python3 -I wohlstand-story/scripts/build_story_data.py
"""
import json
import math
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent
SRC = REPO / "wohlstandsatlas" / "atlas-data.js"
OUT = ROOT / "data" / "story_data.json"

KOELN, OSL = "DEA23", "DE40B"
SQUARE = 5e6                     # ein Quadrat = 5 Mio. Menschen
FINE = 2                         # feinste Ebene des Atlas


def load_atlas():
    s = SRC.read_text(encoding="utf-8")
    i = s.index("window.WA={topo:") + len("window.WA={topo:")
    j = s.index(",\ndata:")
    k = s.index(",\nts:")
    return json.loads(s[i:j]), json.loads(s[j + len(",\ndata:"):k])


topo, data = load_atlas()
U = data["units"]
by = {u["id"]: u for u in U}
lvl = lambda l: [u for u in U if l in u["lv"] and u.get("pop")]
WORLD = sum(u["pop"] for u in lvl(0))
WORLD_PPP = sum(u.get("gdp_ppp") or 0 for u in lvl(0))


def below(v, key, l):
    """Anteil der Weltbevölkerung in Einheiten mit kleinerem Wert (Bezug: ganze Welt)."""
    return sum(u["pop"] for u in lvl(l) if u.get(key) is not None and u[key] < v) / WORLD


def r(v, d=0):
    return None if v is None else (round(v) if d == 0 else round(v, d))


# ---------- die beiden Orte und ihre Umgebung ----------
de_fine = sorted((u for u in lvl(FINE) if u["country"] == "DEU" and u.get("gdp_pc_ppp")), key=lambda u: -u["gdp_pc_ppp"])
de_pop = sum(u["pop"] for u in de_fine)


def place(uid):
    u = by[uid]
    v = u["gdp_pc_ppp"]
    out = {
        "id": uid, "name": u["name"], "kind": u["kind"], "pop": r(u["pop"]), "year": u.get("year"), "src": u.get("src"),
        "gdp": r(v), "hh": r(u.get("hh_pc_ppp")), "hh_note": u.get("hh_note"), "rp": r(u.get("gdp_pc_rp")),
        "price": r(u.get("price_index"), 1), "usd": r(u.get("gdp_pc_usd")),
        # Anteil der Menschheit in ärmeren Einheiten, je Ebene (Robustheit)
        "world_below": {str(l): r(below(v, "gdp_pc_ppp", l) * 100, 1) for l in range(4)},
        "world_below_hh": r(below(u["hh_pc_ppp"], "hh_pc_ppp", FINE) * 100, 1) if u.get("hh_pc_ppp") else None,
        "world_below_rp": r(below(u["gdp_pc_rp"], "gdp_pc_rp", FINE) * 100, 1) if u.get("gdp_pc_rp") else None,
    }
    if u["country"] == "DEU" and FINE in u["lv"]:
        out["de_rank"] = [x["id"] for x in de_fine].index(uid) + 1
        out["de_n"] = len(de_fine)
        out["de_richer_share"] = r(sum(x["pop"] for x in de_fine if x["gdp_pc_ppp"] > v) / de_pop * 100, 1)
    # Länder mit ähnlichem BIP pro Kopf (über 1 Mio. Einwohner)
    near = sorted((c for c in lvl(0) if c.get("gdp_pc_ppp") and c["pop"] > 1e6), key=lambda c: abs(c["gdp_pc_ppp"] - v))[:4]
    out["like"] = [{"name": c["name"], "gdp": r(c["gdp_pc_ppp"])} for c in near]
    return out


P = {k: place(v) for k, v in {"koeln": KOELN, "osl": OSL, "koeln_metro": "M-DE004M", "nrw": "DEA", "bb": "DE4", "deu": "DEU"}.items()}
P["koeln"]["metro_gdp"] = P["koeln_metro"]["gdp"]

# Luftlinie Köln – Senftenberg (Kreisstadt OSL), Koordinaten der Rathäuser
def km(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (*a, *b))
    return 6371 * 2 * math.asin(math.sqrt(math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2))


DIST = r(km((50.9384, 6.9597), (51.5160, 14.0040)))

# ---------- Weltverteilung (feinste Ebene) ----------
fine = sorted((u for u in lvl(FINE) if u.get("gdp_pc_ppp")), key=lambda u: u["gdp_pc_ppp"])
nodata = WORLD - sum(u["pop"] for u in fine)
curve, acc = [], 0.0
for u in fine:
    curve.append([round(acc / WORLD * 100, 3), r(u["gdp_pc_ppp"])])
    acc += u["pop"]
acc_ppp, half, median_u = 0.0, WORLD / 2, None
acc = 0.0
for u in fine:
    acc += u["pop"]
    if acc >= half and median_u is None:
        median_u = u
mean = WORLD_PPP / WORLD
poor_half_ppp = 0.0
acc = 0.0
for u in fine:
    if acc + u["pop"] <= half:
        poor_half_ppp += u.get("gdp_ppp") or 0
    elif acc < half:
        poor_half_ppp += (u.get("gdp_ppp") or 0) * (half - acc) / u["pop"]
    acc += u["pop"]

osl_v, kol_v = by[OSL]["gdp_pc_ppp"], by[KOELN]["gdp_pc_ppp"]
between = sum(u["pop"] for u in fine if osl_v <= u["gdp_pc_ppp"] < kol_v) / WORLD


def above_by_country(v):
    agg = defaultdict(float)
    for u in fine:
        if u["gdp_pc_ppp"] > v:
            agg[u["country"]] += u["pop"]
    return sorted(({"iso": c, "name": by[c]["name"], "mio": round(p / 1e6, 1)} for c, p in agg.items()), key=lambda x: -x["mio"])


above_osl, above_koeln = above_by_country(osl_v), above_by_country(kol_v)
cn_fine = [u for u in fine if u["country"] == "CHN"]
in_fine = [u for u in fine if u["country"] == "IND"]
compare = {k: {"name": by[k]["name"], "gdp": r(by[k]["gdp_pc_ppp"])} for k in
           ("CN-SH", "CN-BJ", "USA-MS", "RU-MOS", "IN-KL", "POL", "EST", "NOR", "QAT", "IN-BR", "DE91C", "M-DE004M")
           if k in by}

# ---------- Quadrate: 1 Quadrat = 5 Mio. Menschen, sortiert nach BIP pro Kopf ----------
n_sq = round(WORLD / SQUARE)
squares, acc, ui = [], 0.0, 0
for q in range(n_sq):
    mid = (q + 0.5) * SQUARE * (sum(u["pop"] for u in fine) / (n_sq * SQUARE))
    while ui < len(fine) - 1 and acc + fine[ui]["pop"] < mid:
        acc += fine[ui]["pop"]; ui += 1
    u = fine[ui]
    squares.append([u["country"], r(u["gdp_pc_ppp"]), {"Afrika": 0, "Asien": 1, "Europa": 2, "Nord- & Mittelamerika": 3,
                                                       "Südamerika": 4, "Ozeanien": 5}.get(u.get("ct"), 6)])

# ---------- Deutschlandkarte: Kreise als SVG-Pfade ----------
tr = topo["transform"]
arcs = []
for a in topo["arcs"]:
    x = y = 0; pts = []
    for dx, dy in a:
        x += dx; y += dy
        pts.append((x * tr["scale"][0] + tr["translate"][0], y * tr["scale"][1] + tr["translate"][1]))
    arcs.append(pts)


def ring(idx):
    pts = []
    for i in idx:
        seg = arcs[i] if i >= 0 else arcs[~i][::-1]
        pts.extend(seg if not pts else seg[1:])
    return pts


LON0, LAT0, K = 5.8, 55.1, 100.0
COS = math.cos(math.radians(51.2))
proj = lambda p: ((p[0] - LON0) * COS * K, (LAT0 - p[1]) * K)


def path(geom):
    polys = [geom["arcs"]] if geom["type"] == "Polygon" else geom["arcs"]
    out = []
    for poly in polys:
        for rg in poly:
            pts = [proj(p) for p in ring(rg)]
            out.append("M" + "L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + "Z")
    return "".join(out)


kreise = []
for g in topo["objects"]["n3"]["geometries"]:
    gid = g.get("id", "")
    if gid.startswith("DE") and gid in by and by[gid].get("gdp_pc_ppp"):
        u = by[gid]
        kreise.append({"id": gid, "n": u["name"], "k": u["kind"], "p": r(u["pop"]), "v": r(u["gdp_pc_ppp"]), "d": path(g)})
cx = lambda gid: next(k for k in kreise if k["id"] == gid)
# Kreismittelpunkte für die beiden Markierungen (Mittel der Punkte des größten Rings)
def centroid(gid):
    g = next(x for x in topo["objects"]["n3"]["geometries"] if x.get("id") == gid)
    polys = [g["arcs"]] if g["type"] == "Polygon" else g["arcs"]
    pts = max((ring(p[0]) for p in polys), key=len)
    xs, ys = zip(*[proj(p) for p in pts])
    return [round(sum(xs) / len(xs), 1), round(sum(ys) / len(ys), 1)]


germany = {"kreise": kreise, "koeln_xy": centroid(KOELN), "osl_xy": centroid(OSL),
           "w": round((15.1 - LON0) * COS * K), "h": round((LAT0 - 47.2) * K)}

# ---------- „Wo stehst du?“: alle Einheiten der feinsten Ebene ----------
search = [[u["name"], by[u["country"]]["name"] if u["country"] in by else u["country"], r(u["gdp_pc_ppp"]), u["kind"], u["id"]]
          for u in sorted(fine, key=lambda u: -u["pop"]) if (u["pop"] or 0) >= 10000 and not u.get("nogeo")]

D = {
    "meta": {"source": "Wohlstandsatlas, Daten-WG Knowledge Kitchen (Weltbank WDI 2024, IWF WEO, Eurostat und nationale Statistikämter)",
             "world_pop": r(WORLD), "world_ppp_bn": r(WORLD_PPP / 1e9), "nodata_mio": r(nodata / 1e6),
             "n_fine": len(fine), "square": SQUARE, "n_sq": n_sq, "dist_km": DIST},
    "places": P,
    "world": {"mean": r(mean), "median": r(median_u["gdp_pc_ppp"]), "median_name": median_u["name"],
              "median_country": by[median_u["country"]]["name"], "poor_half_share": r(poor_half_ppp / WORLD_PPP * 100, 1),
              "between_share": r(between * 100, 1),
              "osl_x_median": r(osl_v / median_u["gdp_pc_ppp"], 1), "koeln_x_osl": r(kol_v / osl_v, 2),
              "rp_ratio": r(by[KOELN]["gdp_pc_rp"] / by[OSL]["gdp_pc_rp"], 2),
              "hh_ratio": r(by[KOELN]["hh_pc_ppp"] / by[OSL]["hh_pc_ppp"], 2),
              "above_osl_mio": r(sum(x["mio"] for x in above_osl)), "above_koeln_mio": r(sum(x["mio"] for x in above_koeln)),
              "above_osl": above_osl[:8], "above_koeln": above_koeln[:6],
              "cn_above_osl_mio": r(sum(u["pop"] for u in cn_fine if u["gdp_pc_ppp"] > osl_v) / 1e6),
              "in_above_osl_mio": r(sum(u["pop"] for u in in_fine if u["gdp_pc_ppp"] > osl_v) / 1e6),
              "compare": compare},
    "curve": curve,
    "squares": squares,
    "germany": germany,
    "search": search,
}
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(D, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(f"✓ {OUT.relative_to(REPO)} · {OUT.stat().st_size / 1024:.0f} KB · {len(kreise)} Kreise · {n_sq} Quadrate · {len(search)} Orte")
for k in ("koeln", "osl"):
    p = P[k]; print(f"  {p['name']}: {p['gdp']} Int.$, Welt darunter {p['world_below']}, DE-Rang {p.get('de_rank')}/{p.get('de_n')}")
print("  Median", D["world"]["median"], D["world"]["median_name"], "| Mittel", D["world"]["mean"], "| zwischen", D["world"]["between_share"],
      "| ärmere Hälfte", D["world"]["poor_half_share"], "% BIP | über OSL", D["world"]["above_osl_mio"], "Mio | über Köln", D["world"]["above_koeln_mio"])
