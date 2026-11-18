#!/usr/bin/env python3
"""Vergleich der Szenario-Varianten über dieselben 10.000 Firmen (gepaart, KI im Konzern).
Aufruf: python3 tools/rechner-oss-fte-analyse.py <dir mit {variante}-{k}.mc.json und annahmen.json> <personas-10k.json> <out.json>
Varianten = Schlüssel aus annahmen.json, die erste ist die Referenz („heute“)."""
import json, sys, glob
from collections import Counter
d, pf, out = sys.argv[1], sys.argv[2], sys.argv[3]
P = {p["id"]: p for p in json.load(open(pf, encoding="utf-8"))}
O = ["paid", "oss", "deneb", "core", "none"]; M = "konzern"
V = {}
VAR = list(json.load(open(f"{d}/annahmen.json", encoding="utf-8")).keys())
for v in VAR:
    R = []
    for f in sorted(glob.glob(f"{d}/{v}-[0-3].mc.json")):
        R += json.load(open(f))["results"]
    V[v] = {r["id"]: r for r in R}
REF = VAR[0]
ids = list(V[REF].keys())
U = sum(V[REF][i]["users"] for i in ids)
maj = lambda r: max(range(5), key=lambda j: r["modes"][M]["win"][j])
BANDS = [(0, 249), (250, 999), (1000, 9999), (10000, 10**9)]
res = {"n": len(ids), "users": U, "variants": {}}
for v, R in V.items():
    rows = [R[i] for i in ids]
    firms = [sum(r["modes"][M]["win"][j] for r in rows) / len(rows) for j in range(5)]
    users = [sum(r["users"] * r["modes"][M]["win"][j] for r in rows) / U for j in range(5)]
    bands = []
    for lo, hi in BANDS:
        g = [R[i] for i in ids if lo <= P[i]["employees"] <= hi]
        bands.append({"lo": lo, "hi": hi, "n": len(g), "firms": [sum(r["modes"][M]["win"][j] for r in g) / len(g) for j in range(5)]})
    sect = {}
    for s in ["wirtschaft", "finanz", "oeffentlich"]:
        g = [R[i] for i in ids if P[i]["sector"] == s]
        sect[s] = [sum(r["modes"][M]["win"][j] for r in g) / len(g) for j in range(5)]
    # Vorsprung von OSS dort, wo OSS gewinnt: Median der Kostendifferenz zum nächstbesten Weg je Jahr
    gaps = sorted(r["modes"][M]["gapYr"][1] for r in rows if r["modes"][M]["gapYr"][1] is not None and maj(r) == 1)
    pool = sum(r["modes"][M]["win"][1] * (r["modes"][M]["gapYr"][1] or 0) for r in rows)
    flip = sum(maj(R[i]) != maj(V[REF][i]) for i in ids) / len(ids)
    trans = Counter((O[maj(V[REF][i])], O[maj(R[i])]) for i in ids if maj(R[i]) != maj(V[REF][i])).most_common(4)
    ossMaj = [i for i in ids if maj(R[i]) == 1]
    res["variants"][v] = {"firms": firms, "users": users, "bands": bands, "sector": sect, "flip": flip,
                          "trans": [[a, b, c / len(ids)] for (a, b), c in trans], "ossMajority": len(ossMaj) / len(ids),
                          "gap": {"p25": gaps[len(gaps) // 4] if gaps else None, "p50": gaps[len(gaps) // 2] if gaps else None, "p75": gaps[3 * len(gaps) // 4] if gaps else None, "n": len(gaps)},
                          "poolPerFirm": pool / len(ids),
                          "ossKo": sum(r["ko"][1] for r in rows) / len(rows),
                          "certUse": sum(r["modes"][M].get("certUse", 0) for r in rows) / len(rows),
                          "certWin": sum(r["modes"][M].get("certWin", 0) for r in rows) / len(rows),
                          "certWinUsers": sum(r["users"] * r["modes"][M].get("certWin", 0) for r in rows) / U,
                          "ossMajSize": sorted(P[i]["employees"] for i in ossMaj)[len(ossMaj) // 2] if ossMaj else None}
json.dump(res, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for v, x in res["variants"].items():
    print(v, "Firmen", [round(100 * a, 1) for a in x["firms"]], "Nutzer", [round(100 * a, 1) for a in x["users"]], "flip", round(100 * x["flip"], 1), "OSS-Mehrheit", round(100 * x["ossMajority"], 1), "OSS-KO", round(100 * x["ossKo"], 1), "Zert genutzt/gewinnt", round(100 * x["certUse"], 1), round(100 * x["certWin"], 1))
    print("   Bänder", [(b["lo"], [round(100 * a) for a in b["firms"]]) for b in x["bands"]])
    print("   Sektor", {k: [round(100 * a) for a in s] for k, s in x["sector"].items()})
    print("   Vorsprung €/Jahr (wo OSS Mehrheit)", {k: (round(v2) if isinstance(v2, float) else v2) for k, v2 in x["gap"].items()}, "Pool je Firma", round(x["poolPerFirm"]), "MA med", x["ossMajSize"], "trans", [(a, b, round(100 * c, 1)) for a, b, c in x["trans"]])
