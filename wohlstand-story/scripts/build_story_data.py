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
    return json.loads(s[i:j]), json.loads(s[j + len(",\ndata:"):k]), json.loads(s[k + len(",\nts:"):s.rindex("}")])


topo, data, ts = load_atlas()
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
compare = {k: {"name": by[k]["name"], "gdp": r(by[k]["gdp_pc_ppp"]), "mio": r(by[k]["pop"] / 1e6, 1)} for k in
           ("CN-SH", "CN-BJ", "USA-MS", "RU-MOS", "IN-KL", "IN-SK", "POL", "EST", "NOR", "QAT", "IN-BR", "M-DE004M",
            "JPN", "PRT", "ID-JI", "JP-34")
           if k in by}

# ---------- Wie eng es ist ----------
# Eine Toleranz für die ganze Story: "auf derselben Stufe" heißt höchstens BAND % über oder unter OSL.
# Wie viele Kreise liegen so nah an OSL, und wohin rutscht OSL in Deutschland und in der Welt mit ±BAND %?
BAND = 10
lo_v, hi_v = osl_v * (1 - BAND / 100), osl_v * (1 + BAND / 100)
rank_at = lambda v: sum(1 for x in de_fine if x["id"] != OSL and x["gdp_pc_ppp"] > v) + 1   # OSL selbst zählt nicht mit
tight = {
    "band": BAND,
    "n_near": sum(1 for x in de_fine if x["id"] != OSL and lo_v <= x["gdp_pc_ppp"] <= hi_v),
    "rank_plus": rank_at(hi_v), "rank_minus": rank_at(lo_v),
    "world_plus": r(below(hi_v, "gdp_pc_ppp", FINE) * 100, 1), "world_minus": r(below(lo_v, "gdp_pc_ppp", FINE) * 100, 1),
}
# Länder, die der Atlas nicht zerlegt: dieselbe Einheit auf allen vier Ebenen (die Gegenprobe in Akt 2 prüft sie nicht)
whole = [u for u in lvl(0) if set(u["lv"]) >= {0, 1, 2, 3}]
# Menschen in Regionen auf der Stufe von OSL (höchstens 10 % darüber oder darunter)
near10 = sum(u["pop"] for u in fine if lo_v <= u["gdp_pc_ppp"] <= hi_v)

# ---------- Quadrate: 1 Quadrat = 5 Mio. Menschen, sortiert nach BIP pro Kopf ----------
# Der Wert eines Quadrats ist der seiner Bevölkerungsmitte (Position auf der Skala). Das Land wird so verteilt,
# dass jedes Land so viele Quadrate bekommt, wie es Menschen hat: Jedes Quadrat sammelt die Einwohner aller
# Regionen in seinem Abschnitt je Land ein und geht an das Land mit dem größten noch nicht vergebenen Anteil,
# das in diesem Abschnitt vorkommt. Kleine Länder können deshalb weiter fehlen, große stimmen auf ein Quadrat genau.
# (Nur nach der Bevölkerungsmitte vergeben bekäme Deutschland mit seinen 400 kleinen Kreisen 10 statt 17 Quadrate.)
CONT = {"Afrika": 0, "Asien": 1, "Europa": 2, "Nord- & Mittelamerika": 3, "Südamerika": 4, "Ozeanien": 5}
n_sq = round(WORLD / SQUARE)
step = sum(u["pop"] for u in fine) / n_sq
starts, acc = [], 0.0
for u in fine:
    starts.append(acc); acc += u["pop"]
cont_of = {u["country"]: CONT.get(u.get("ct"), 6) for u in fine}
share = [defaultdict(float) for _ in range(n_sq)]       # Einwohner je Land in jedem Quadrat-Abschnitt
for u, st in zip(fine, starts):
    end, q = st + u["pop"], min(n_sq - 1, int(st // step))
    while q < n_sq and q * step < end:
        share[q][u["country"]] += max(0.0, min(end, (q + 1) * step) - max(st, q * step))
        q += 1
squares, open_pop, mi = [], defaultdict(float), 0
for q in range(n_sq):
    for c, p in share[q].items():
        open_pop[c] += p
    while mi < len(fine) - 1 and starts[mi] + fine[mi]["pop"] < (q + 0.5) * step:
        mi += 1
    c = max(share[q], key=lambda c: open_pop[c])        # nur Länder, die in diesem Abschnitt wirklich vorkommen
    open_pop[c] -= step
    squares.append([c, r(fine[mi]["gdp_pc_ppp"]), cont_of[c]])
names = {c: by[c]["name"] for c in sorted({q[0] for q in squares}) if c in by}

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


def de_end(u):
    """Kreis am Ende der deutschen Rangfolge, eingeordnet in die Welt (feinste Ebene)."""
    return {"id": u["id"], "name": u["name"], "gdp": r(u["gdp_pc_ppp"]), "world_below": r(below(u["gdp_pc_ppp"], "gdp_pc_ppp", FINE) * 100, 1)}


germany = {"kreise": kreise, "koeln_xy": centroid(KOELN), "osl_xy": centroid(OSL),
           "w": round((15.1 - LON0) * COS * K), "h": round((LAT0 - 47.2) * K),
           "poorest": de_end(de_fine[-1]), "richest": de_end(de_fine[0])}
# Länder über 1 Mio. Einwohner für „entspricht etwa dem Niveau von …“ im Vergleich zweier Orte
countries = sorted(([c["name"], r(c["gdp_pc_ppp"])] for c in lvl(0) if c.get("gdp_pc_ppp") and c["pop"] > 1e6), key=lambda x: x[1])

# ---------- „Wo stehst du?“: alle Einheiten der feinsten Ebene ----------
# feinste Ebene plus Bundesländer/-staaten und ganze Länder, damit „Bayern“ oder „Texas“ gefunden werden;
# größere Einheiten zuerst, so gewinnt bei gleichem Namen der Bundesstaat Texas vor Texas County
seen, search = set(), []
for u in sorted((u for u in U if u.get("pop") and u.get("gdp_pc_ppp") and not u.get("nogeo") and (u["pop"] or 0) >= 10000
                 and (FINE in u["lv"] or 1 in u["lv"] or 0 in u["lv"]) and not u["id"].startswith(("M-", "R-"))),
                key=lambda u: -u["pop"]):
    if u["id"] in seen:
        continue
    seen.add(u["id"])
    cn = by[u["country"]]["name"] if u["country"] in by else u["country"]
    search.append([u["name"], cn if u["kind"] != "Land/Gebiet" else "", r(u["gdp_pc_ppp"]), u["kind"], u["id"], FINE in u["lv"]])

# ---------- Originalquellen (data/sources/, abgerufen mit fetch_sources.py) ----------
SRC_DIR = ROOT / "data" / "sources"
src = lambda name: json.loads((SRC_DIR / name).read_text(encoding="utf-8"))

# ---------- Und früher? Deutschland unter den Ländern der Welt, 2000 bis 2024 ----------
# Reales BIP pro Kopf (Int.$ von 2021) aus den Länder-Zeitreihen des Atlas, gewichtet mit der Bevölkerung des
# jeweiligen Jahres (Weltbank SP.POP.TOTL; der Atlas selbst führt nur die Bevölkerung von 2024). Nur Länder mit
# durchgehender Reihe und Bevölkerung in allen Jahren.
TS, Y0 = ts["series"], ts["start"]
WBP = src("worldbank_pop.json")
assert WBP["jahre"][0] == Y0, "Zeitreihen und Bevölkerung beginnen nicht im selben Jahr"
POPY = WBP["werte"]
cty = {u["id"]: u for u in lvl(0)}
full = [c for c in TS if c in cty and all(v is not None for v in TS[c]) and c in POPY and all(v is not None for v in POPY[c])]
YN = Y0 + len(TS["DEU"]) - 1


def year_stats(y):
    i, de = y - Y0, TS["DEU"][y - Y0]
    pop = {c: POPY[c][i] for c in full}
    tot = sum(pop.values())
    acc, med = 0.0, None
    for c in sorted(full, key=lambda c: TS[c][i]):
        acc += pop[c]
        if acc >= tot / 2:
            med = TS[c][i]; med_name = cty[c]["name"]; break
    mean = sum(TS[c][i] * pop[c] for c in full) / tot
    return {"deu": r(de), "med": r(med), "med_name": med_name, "x_med": r(de / med, 1), "mean": r(mean), "x_mean": r(de / mean, 1),
            "below": r(sum(pop[c] for c in full if TS[c][i] < de) / tot * 100, 1),
            "rank": sum(1 for c in full if TS[c][i] > de) + 1}


grow = lambda c, a, b: r((TS[c][b - Y0] / TS[c][a - Y0] - 1) * 100, 1)
trend = {"start": Y0, "end": YN, "n": len(full),
         "pop_share": r(sum(cty[c]["pop"] for c in full) / WORLD * 100),
         "pop_source": f"{WBP['quelle']}, {WBP['indikator']}, Stand {WBP['stand']}",
         "deu": [r(v) for v in TS["DEU"]], "med": [year_stats(y)["med"] for y in range(Y0, YN + 1)],
         "mean": [year_stats(y)["mean"] for y in range(Y0, YN + 1)],
         # größtes Land ohne durchgehende Reihe, das heute vor Deutschland läge (laufende KKP)
         "missing_ahead": [u["name"] for u in sorted(lvl(0), key=lambda u: -u["pop"])
                           if u["id"] not in full and (u.get("gdp_pc_ppp") or 0) > by["DEU"]["gdp_pc_ppp"] and u["pop"] > 5e6],
         "first": year_stats(Y0), "last": year_stats(YN),
         "since2019": {c: grow(c, 2019, YN) for c in ("DEU", "USA", "POL")},
         "since2000": {c: grow(c, Y0, YN) for c in ("DEU", "USA", "POL", "CHN")}}

# ---------- Verfügbares Einkommen auf Kreisebene (VGR der Länder) ----------
# Der Atlas kennt Haushaltswerte nur für Regierungsbezirke und Länder. Für Köln und OSL selbst liefern die Statistischen
# Ämter das verfügbare Einkommen je Einwohner. In den Weltvergleich kommt es nach der Logik des Atlas:
# Kreiswert relativ zu Deutschland × Konsum der Haushalte pro Kopf in Deutschland (KKP).
VE = src("vgrdl_verfuegbares_einkommen_kreise.json")
VY = VE["jahre"][-1]
ve = {k: x["werte"][VY] for k, x in VE["regionen"].items() if x["ebene"] == "Kreis" and x["werte"].get(VY)}
ve_de = VE["regionen"]["DE"]["werte"][VY]
ve_sorted = sorted(ve.values(), reverse=True)


def inc(uid):
    e = ve[uid]
    v = e / ve_de * by["DEU"]["hh_pc_ppp"]
    return {"eur": e, "int": r(v), "rank": ve_sorted.index(e) + 1, "world_below": r(below(v, "hh_pc_ppp", FINE) * 100, 1)}


income = {"year": int(VY), "n": len(ve), "de_eur": ve_de, "koeln": inc(KOELN), "osl": inc(OSL),
          "ratio": r(ve[KOELN] / ve[OSL], 2), "band": BAND,
          "n_near": sum(1 for k, e in ve.items() if k != OSL and ve[OSL] * (1 - BAND / 100) <= e <= ve[OSL] * (1 + BAND / 100)),
          "source": f"{VE['quelle']}, Tabelle 2.4, Berechnungsstand {VE['berechnungsstand']}"}
income["world_gap"] = r(abs(income["koeln"]["world_below"] - income["osl"]["world_below"]), 1)

# ---------- Abgleich mit den Originalquellen (für „Zum Nachprüfen“) ----------
# BIP pro Kopf der Kreise aus Eurostat nachgerechnet (Anteil am Land × Landeswert der Weltbank 2024) und mit dem Atlas verglichen.
EU = src("eurostat_nuts3_de.json")
WBG = src("worldbank_gdp_pc_ppp_2024.json")
eu_de = EU["regionen"]["DE"]
ey = str(by[OSL]["year"])
eu_pc = {k: (x[f"bip_mio_eur_{ey}"] / x[f"bev_tsd_{ey}"]) / (eu_de[f"bip_mio_eur_{ey}"] / eu_de[f"bev_tsd_{ey}"]) * WBG["werte"]["DEU"]
         for k, x in EU["regionen"].items() if x["level"] == 3}
dev = {k: abs(by[k]["gdp_pc_ppp"] / v - 1) * 100 for k, v in eu_pc.items() if k in by}
eu_rank = {k: i + 1 for i, (k, _) in enumerate(sorted(eu_pc.items(), key=lambda kv: -kv[1]))}
at_rank = {x["id"]: i + 1 for i, x in enumerate(de_fine)}
# neuerer Rechenstand der Statistischen Ämter: Ränge dort
VB = src("vgrdl_bip_kreise.json")
vb = {k: x["bip_eur_je_ew"][ey] for k, x in VB["regionen"].items() if x["ebene"] == "Kreis" and x["bip_eur_je_ew"].get(ey)}
vb_sorted = sorted(vb.values(), reverse=True)
vb_de = VB["regionen"]["DE"]["bip_eur_je_ew"][ey]
# Wie stark verschiebt der neuere Rechenstand die Kreiswerte? (nur Kreise mit unverändertem Gebiet)
vb_dev = {k: abs((v / vb_de * by["DEU"]["gdp_pc_ppp"]) / by[k]["gdp_pc_ppp"] - 1) * 100 for k, v in vb.items() if k in by}
wb_keys = ("DEU", "POL", "EST", "JPN", "PRT", "NOR", "QAT", "USA", "CHN", "IND", "IDN", "RUS")
checks = {"eurostat_year": int(ey), "eurostat_stand": EU["tabellen"]["nama_10r_3gdp"]["stand"][:10], "wb_stand": WBG["stand"],
          "n_kreise": len(dev), "max_dev_pct": r(max(dev.values()), 3), "ranks_identical": all(eu_rank[k] == at_rank[k] for k in dev),
          "wb_deu": r(WBG["werte"]["DEU"]), "n_countries": len(wb_keys),
          "max_dev_countries_pct": r(max(abs(by[c]["gdp_pc_ppp"] / WBG["werte"][c] - 1) * 100 for c in wb_keys), 3),
          "vgrdl_stand": VB["berechnungsstand"], "vgrdl_rank": {"koeln": vb_sorted.index(vb[KOELN]) + 1, "osl": vb_sorted.index(vb[OSL]) + 1},
          "vgrdl_n": len(vb_dev), "vgrdl_n_over5": sum(1 for v in vb_dev.values() if v > 5), "vgrdl_max_dev_pct": r(max(vb_dev.values()), 1),
          "vgrdl_dev": {"koeln": r(vb_dev[KOELN], 1), "osl": r(vb_dev[OSL], 1)}}

# ---------- Überschlag: wo die einzelnen Menschen stehen (Modellrechnung aus person_model.py) ----------
# Nur Größen, die in allen Rechenvarianten in dieselbe Richtung gehen, mit ihrer Spanne über die Varianten.
PM = ROOT / "data" / "person_model.json"
persons = None
if PM.exists():
    pm = json.loads(PM.read_text(encoding="utf-8"))
    main, var = pm["ergebnisse_hauptvariante"], list(pm["varianten"].values())
    span = lambda key: [r(main[key]["min"], 1), r(main[key]["max"], 1)]
    assert all(abs(main[k]["min"] - min(x[k] for x in var)) < 0.01 and abs(main[k]["max"] - max(x[k] for x in var)) < 0.01
               for k in ("osl_p10", "osl_p50", "koeln_p50", "median_gap", "deu_above_world_median")), "Spannen passen nicht zu den Varianten"
    pick = lambda who: {q: r(main[f"{who}_{q}"]["wert"], 1) for q in ("p10", "p25", "p50", "p75", "p90")}
    persons = {"osl": pick("osl"), "koeln": pick("koeln"),
               "deu": {q: r(main[f"deu_{q}"]["wert"], 1) for q in ("p10", "p50", "p90")},
               "n_variants": len(var), "basis": pm["hauptvariante"]["basis"],
               "span": {k: span(k) for k in ("osl_p10", "osl_p50", "koeln_p10", "koeln_p50", "deu_p50", "median_gap",
                                              "osl_spread_p10_p90", "koeln_spread_p10_p90", "deu_above_world_median")}}

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
              "compare": compare,
              "tight": tight, "n_countries": len(lvl(0)), "n_whole": len(whole), "whole_bn": r(sum(u["pop"] for u in whole) / 1e9, 2),
              "near_osl_mio": r(near10 / 1e6), "near_osl_band": BAND,
              "hh_gap": r(abs(P["koeln"]["world_below_hh"] - P["osl"]["world_below_hh"]), 1)},
    "curve": curve,
    "squares": squares,
    "names": names,
    "countries": countries,
    "germany": germany,
    "search": search,
}
if persons:
    D["persons"] = persons
D["trend"] = trend
D["income"] = income
D["checks"] = checks
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(D, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(f"✓ {OUT.relative_to(REPO)} · {OUT.stat().st_size / 1024:.0f} KB · {len(kreise)} Kreise · {n_sq} Quadrate · {len(search)} Orte")
for k in ("koeln", "osl"):
    p = P[k]; print(f"  {p['name']}: {p['gdp']} Int.$, Welt darunter {p['world_below']}, DE-Rang {p.get('de_rank')}/{p.get('de_n')}")
print("  eng:", tight, "| ungeteilte Länder", len(whole), "von", len(lvl(0)), "| ±10 % um OSL", r(near10 / 1e6), "Mio.")
print("  Zeit:", trend["first"], "→", trend["last"], trend["since2019"], trend["n"], "Länder,", trend["pop_share"], "% der Welt")
print("  Einkommen (Kreise):", income)
print("  Abgleich:", checks)
print("  Personen-Überschlag:", persons and persons["span"])
print("  DE-Spanne", germany["poorest"], germany["richest"])
print("  Median", D["world"]["median"], D["world"]["median_name"], "| Mittel", D["world"]["mean"], "| zwischen", D["world"]["between_share"],
      "| ärmere Hälfte", D["world"]["poor_half_share"], "% BIP | über OSL", D["world"]["above_osl_mio"], "Mio | über Köln", D["world"]["above_koeln_mio"])
