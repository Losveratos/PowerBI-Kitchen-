#!/usr/bin/env python3
"""Baut den Abschnitt „karte“ für data/story_data.json — nur aus Dateien, ohne Netz.

Normalerweise ruft build_story_data.py das hier auf (build_karte). Einzeln:
    python3 koeln-raser/scripts/build_map_data.py      # ergänzt data/story_data.json

Eingaben (data/geo/, erzeugt von fetch_geo.py):
  koeln_grenzen_osm.json.gz    Stadtgrenze, 9 Bezirke, 86 Stadtteile (OSM)
  osm_koeln.json.gz            Rhein + Autobahn/Trunk/Primary (OSM)
  messstellen_geocoded.json    Geocoder-Treffer je Messstelle
  manual_coords.csv            geprüfte Korrekturen — haben Vorrang; leeres lat/lon = bewusst weggelassen

Karte: äquidistante Projektion (cos 50,94°), 1 Einheit = 10 m, Ursprung = Nordwest-Ecke
der Stadtgrenze. Linien per Douglas-Peucker vereinfacht, als relative SVG-Pfade mit
ganzen Zahlen. Kennzahlen je Messstelle stehen schon in DATA.standorte — die Karte
liefert nur Koordinaten (Schlüssel „Dienststelle|Code“), damit nichts doppelt im HTML steht.
"""
import csv
import gzip
import json
import sqlite3
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from geo_util import KX, KY, centroid, in_poly, in_ring, norm_name, simplify   # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
GEO = ROOT / "data" / "geo"
DB = ROOT / "data" / "raser_2025.sqlite"
STORY = ROOT / "data" / "story_data.json"

UNIT = 10                      # Meter je Karteneinheit
TOL = {"stadt": 1.2, "teile": 1.6, "rhein": 1.2, "strassen": 1.6}   # Douglas-Peucker in Einheiten (12–16 m)
MIN_FAELLE = 300               # ab so vielen mobilen Fällen wird der Anteil je Stadtteil ausgewiesen
RECHTS = {"Porz", "Kalk", "Mülheim"}   # rechtsrheinische Stadtbezirke (+ Stadtteil Deutz aus „Innenstadt“)
ACC = {"hausnummer": "h", "strasse": "s", "manuell": "m"}
ORIENTIERUNG = {"Dom": (6.95811, 50.94133)}     # Orientierungspunkt auf der Karte (lon, lat, OSM)


def load_json_gz(name):
    return json.load(gzip.open(GEO / name, "rt", encoding="utf-8"))


class Proj:
    def __init__(self, stadt):
        pts = [p for r in stadt["outer"] for p in r]
        self.lon0 = min(p[0] for p in pts)
        self.lat1 = max(p[1] for p in pts)
        self.w = round((max(p[0] for p in pts) - self.lon0) * KX / UNIT)
        self.h = round((self.lat1 - min(p[1] for p in pts)) * KY / UNIT)

    def __call__(self, lon, lat):
        return (lon - self.lon0) * KX / UNIT, (self.lat1 - lat) * KY / UNIT


def encode(lines, closed):
    """Polylinien (projiziert, vereinfacht) → kompakter relativer SVG-Pfad mit ganzen Zahlen."""
    out = []
    for ln in lines:
        pts = [(round(x), round(y)) for x, y in ln]
        pts = [p for i, p in enumerate(pts) if i == 0 or p != pts[i - 1]]
        if len(pts) < 2:
            continue
        s = f"M{pts[0][0]} {pts[0][1]}"
        rel = " ".join(f"{b[0] - a[0]} {b[1] - a[1]}" for a, b in zip(pts, pts[1:]))
        s += "l" + rel.replace(" -", "-")
        out.append(s + ("z" if closed else ""))
    return "".join(out)


def merge_lines(lines):
    """Linienstücke mit gemeinsamen Endpunkten zu längeren Linien verbinden."""
    lines = [list(l) for l in lines if len(l) >= 2]
    ends = defaultdict(set)
    for i, l in enumerate(lines):
        ends[l[0]].add(i); ends[l[-1]].add(i)
    alive, out = set(range(len(lines))), []
    while alive:
        i = alive.pop()
        cur = lines[i]
        ends[cur[0]].discard(i); ends[cur[-1]].discard(i)
        grown = True
        while grown:
            grown = False
            for at_end in (True, False):
                p = cur[-1] if at_end else cur[0]
                cand = next(iter(ends[p] & alive), None)
                if cand is None:
                    continue
                l = lines[cand]
                alive.discard(cand); ends[l[0]].discard(cand); ends[l[-1]].discard(cand)
                if at_end:
                    cur = cur + (l[1:] if l[0] == p else l[::-1][1:])
                else:
                    cur = (l[:-1] if l[-1] == p else l[::-1][:-1]) + cur
                grown = True
        out.append(cur)
    return out


def clip_inside(line, ring):
    """Polylinie an einer Fläche kappen: nur Abschnitte mit Punkten innerhalb behalten."""
    parts, cur = [], []
    for p in line:
        if in_ring(p, ring):
            cur.append(p)
        elif cur:
            parts.append(cur); cur = []
    if cur:
        parts.append(cur)
    return [c for c in parts if len(c) >= 2]


def load_coords():
    """Koordinaten je Messstelle: manual_coords.csv vor Geocoder; nur hausnummer/strasse gelten."""
    coords, notes = {}, {}
    gp = GEO / "messstellen_geocoded.json"
    for g in (json.loads(gp.read_text(encoding="utf-8")) if gp.exists() else []):
        if g.get("lat") is not None and g.get("genauigkeit") in ("hausnummer", "strasse"):
            coords[(g["d"], g["c"])] = (g["lon"], g["lat"], g["genauigkeit"])
    mp = GEO / "manual_coords.csv"
    if mp.exists():
        with open(mp, encoding="utf-8", newline="") as fh:
            for r in csv.DictReader(fh):
                if r["dienststelle"].startswith("#"):
                    continue
                k = (r["dienststelle"], r["code"].zfill(4))
                notes[k] = r["notiz"]
                if r["lat"].strip():
                    # Spalte genauigkeit (optional): Straßenmitten zählen ehrlich als „strasse“, OSM-Hausnummern als „hausnummer“
                    coords[k] = (float(r["lon"]), float(r["lat"]), (r.get("genauigkeit") or "manuell").strip())
                else:
                    coords.pop(k, None)                  # bewusst weggelassen: kein verlässlicher Punkt
    return coords, notes


def build_karte(con, data):
    grenzen = load_json_gz("koeln_grenzen_osm.json.gz")
    osm = load_json_gz("osm_koeln.json.gz")
    stadt, teile, bezirke = grenzen["stadt"], grenzen["stadtteile"], grenzen["bezirke"]
    P = Proj(stadt)
    proj = lambda line: [P(*p) for p in line]
    K = {"quelle": "Kartendaten © OpenStreetMap-Mitwirkende (ODbL) · Geocodierung: Geoapify",
         "einheit_m": UNIT, "w": P.w, "h": P.h}

    # ---- Geometrie ----------------------------------------------------------
    K["stadt"] = encode([simplify(proj(r), TOL["stadt"]) for r in stadt["outer"]], True)
    K["orte"] = [{"name": n, "x": round(P(*ll)[0]), "y": round(P(*ll)[1])} for n, ll in ORIENTIERUNG.items()]
    bez_of = {}
    for f in teile:
        c = centroid(f)
        bez_of[f["name"]] = next((b["name"] for b in bezirke if in_poly(c, b)), "")
    ring_c = max(stadt["outer"], key=len)
    ring_test = [p for i, p in enumerate(ring_c) if i % 3 == 0] + [ring_c[0]]   # reicht fürs Kappen
    rhein = [w["geom"] for w in osm["ways"] if w["tags"].get("waterway") == "river"]
    K["rhein"] = encode([simplify(proj(l), TOL["rhein"]) for l in merge_lines([[tuple(p) for p in l] for l in rhein])], False)
    K["strassen"] = {}
    for cls in ("motorway", "trunk", "primary"):
        ls = [[tuple(p) for p in w["geom"]] for w in osm["ways"] if w["tags"].get("highway") == cls]
        clipped = [c for l in merge_lines(ls) for c in clip_inside(l, ring_test)]
        K["strassen"][cls] = encode([simplify(proj(l), TOL["strassen"]) for l in clipped], False)

    # ---- Koordinaten der Messstellen ------------------------------------------
    coords, notes = load_coords()
    key = lambda s: f"{s['d']}|{s['c']}"
    teil_by_norm = {norm_name(f["name"]): f for f in teile}
    punkte, acc, fehlend, st_of = {}, Counter(), [], {}
    for s in data["standorte"]:
        c = coords.get((s["d"], s["c"]))
        # Stadtteil: bei mobilen Messstellen nennt die Standorttabelle ihn im Feld „Ort“, sonst über die Lage des Punkts
        st = teil_by_norm.get(norm_name(s["ort"]))
        if not st and c:
            st = next((f for f in teile if in_poly(c[:2], f)), None)
        st_of[key(s)] = st["name"] if st else None
        if c:
            x, y = P(c[0], c[1])
            punkte[key(s)] = [round(x), round(y), ACC[c[2]]]
            acc[c[2]] += 1
        else:
            acc["fehlt"] += 1
            fehlend.append({"k": key(s), "name": s.get("name") or " · ".join(filter(None, [s["lage"] or s["ort"], s["ri"]])),
                            "ort": s["ort"], "n": s["n"], "grund": notes.get((s["d"], s["c"]), "kein verlässlicher Punkt")})
    K["punkte"] = punkte
    # Herkunft der Punkte (für den Appendix): von Hand geprüft vs. automatischer OSM-Abgleich (check_geo.py)
    story = {(s["d"], s["c"]) for s in data["standorte"]}
    auto = {k for k, n in notes.items() if n.startswith("OSM-Abgleich:") and k in story}
    K["korrekturen"] = {"von_hand": sum(1 for k in notes if k in story and k not in auto),
                        "osm_abgleich": sum(1 for k in auto if k in coords), "weggelassen": sum(1 for k in auto if k not in coords)}
    K["genauigkeit"] = {k: acc.get(k, 0) for k in ("hausnummer", "strasse", "manuell", "fehlt")}
    K["fehlend"] = sorted(fehlend, key=lambda f: -f["n"])
    K["fehlend_faelle"] = sum(f["n"] for f in fehlend)

    # ---- Stadtteile: mobile Messung per SQL je Messstelle, dann je Stadtteil summiert ----
    per = {}
    for code, n, n21, su, k in con.execute("""
        SELECT standort, COUNT(*), SUM(ueber>=21), SUM(ueber), SUM(kennz='K') FROM tempo
        WHERE dienststelle='S-02' AND standort!='0000' GROUP BY 1"""):
        per[code] = (n, n21, su, k)
    agg = defaultdict(lambda: [0, 0, 0, 0, 0])            # Fälle, ≥21, Summe zu viel, K, Messstellen
    for s in data["standorte"]:
        if s["d"] != "S-02" or not st_of.get(key(s)):
            continue
        a = agg[st_of[key(s)]]
        n, n21, su, k = per[s["c"]]
        a[0] += n; a[1] += n21; a[2] += su; a[3] += k; a[4] += 1
    fest = Counter(st_of[key(s)] for s in data["standorte"] if s["d"] != "S-02" and st_of.get(key(s)))
    K["stadtteile"] = []
    for f in teile:
        n, n21, su, k, ms = agg.get(f["name"], [0, 0, 0, 0, 0])
        cx, cy = P(*centroid(f))
        K["stadtteile"].append({
            "name": f["name"], "bezirk": bez_of[f["name"]], "c": [round(cx), round(cy)],
            "d": encode([simplify(proj(r), TOL["teile"]) for r in f["outer"] + f["inner"]], True),
            "n": n, "ms": ms, "fest": fest.get(f["name"], 0),
            "p21": round(100 * n21 / n, 1) if n >= MIN_FAELLE else None,
            "avg": round(su / n, 1) if n else None, "k": round(100 * k / n, 1) if n else None})
    K["min_faelle"] = MIN_FAELLE

    # ---- Kennzahlen für die Texte des Karten-Akts ----------------------------------
    rechts = lambda name: name and (bez_of.get(name) in RECHTS or name == "Deutz")
    by = lambda dst: [s for s in data["standorte"] if s["d"] == dst]
    fz = {}
    for dst in ("S-01", "S-02"):
        tot = sum(s["n"] for s in by(dst))
        r = sum(s["n"] for s in by(dst) if rechts(st_of.get(key(s))))
        fz[dst] = {"standorte": len(by(dst)), "faelle": tot, "rechts_faelle": r, "rechts_anteil": round(100 * r / tot, 1),
                   "rechts_standorte": sum(1 for s in by(dst) if rechts(st_of.get(key(s)))),
                   "mit_punkt": sum(1 for s in by(dst) if key(s) in punkte)}
    # Ballung: Fälle fester Anlagen im Umkreis von 3 km um den Dom
    dom = next(o for o in K["orte"] if o["name"] == "Dom")
    nah = [s for s in by("S-01") if key(s) in punkte and
           ((punkte[key(s)][0] - dom["x"]) ** 2 + (punkte[key(s)][1] - dom["y"]) ** 2) ** .5 * UNIT <= 3000]
    fz["s01_um_dom"] = {"radius_m": 3000, "anlagen": len(nah), "faelle": sum(s["n"] for s in nah),
                        "anteil": round(100 * sum(s["n"] for s in nah) / fz["S-01"]["faelle"], 1)}
    fz["stadtteile_mit_mobil"] = sum(1 for t in K["stadtteile"] if t["ms"])
    fz["stadtteile_ohne_mobil"] = [t["name"] for t in K["stadtteile"] if not t["ms"]]
    fz["stadtteile_ab_min"] = sum(1 for t in K["stadtteile"] if t["p21"] is not None)
    tot = [0, 0]
    for n, n21 in con.execute("SELECT COUNT(*), SUM(ueber>=21) FROM tempo WHERE dienststelle='S-02' AND standort!='0000'"):
        tot = [n, n21]
    fz["mobil_p21"] = round(100 * tot[1] / tot[0], 2)
    ranked = sorted((t for t in K["stadtteile"] if t["p21"] is not None), key=lambda t: -t["p21"])
    fz["p21_top"] = [{"name": t["name"], "p21": t["p21"], "n": t["n"], "ms": t["ms"]} for t in ranked[:5]]
    fz["p21_min"] = [{"name": t["name"], "p21": t["p21"], "n": t["n"], "ms": t["ms"]} for t in ranked[-3:]]
    fz["meist_messstellen"] = sorted(({"name": t["name"], "ms": t["ms"], "n": t["n"]} for t in K["stadtteile"]),
                                     key=lambda t: (-t["ms"], -t["n"]))[:3]
    # Stundenmix: welcher Anteil der Blitze kommt je Stunde von den festen Anlagen?
    hmix = [[0, 0, 0] for _ in range(24)]
    for h, dst, c in con.execute("SELECT stunde, dienststelle, COUNT(*) FROM tempo GROUP BY 1, 2"):
        hmix[h][{"S-01": 0, "S-02": 1, "K-04": 2}[dst]] = c
    fz["stunde_mix"] = hmix
    K["fakten"] = fz
    return K


def main():
    if not DB.exists():
        raise SystemExit("data/raser_2025.sqlite fehlt → erst build_db.py")
    data = json.loads(STORY.read_text(encoding="utf-8"))
    import build_story_data                                          # tol() + View „tempo“ wie dort
    con = sqlite3.connect(DB)
    build_story_data.prepare(con)
    data["karte"] = build_karte(con, data)
    STORY.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    report(data["karte"])


def report(K):
    size = lambda o: len(json.dumps(o, ensure_ascii=False, separators=(",", ":")).encode("utf-8"))
    parts = {k: size(K[k]) for k in K}
    print(f"✓ karte · {size(K) / 1024:.0f} KB (Budget 250 KB) · " +
          " · ".join(f"{k} {v / 1024:.0f}" for k, v in sorted(parts.items(), key=lambda kv: -kv[1]) if v > 2048))
    print(f"  Genauigkeit: {K['genauigkeit']} · ohne Punkt: {len(K['fehlend'])} Messstellen, {K['fehlend_faelle']:,} Fälle")


if __name__ == "__main__":
    main()
