#!/usr/bin/env python3
"""ChartKitchen + P&L byDatenWG als konkrete Variante des Open-Source-Wegs.
Führt die unabhängigen Agent-Schätzungen zusammen (Dreipunkte: Mittel je Ecke; Fähigkeiten: Mittel, abgerundet, also im
Zweifel gegen das eigene Produkt) und legt die Personas-Varianten für rechner-personas-mc-v3.js an.
Aufruf: python3 tools/rechner-ck-variante.py <personas.json> <outdir> <schaetzung-1.json> [schaetzung-2.json ...]
Schreibt <outdir>/ck-annahmen.json und <outdir>/{ck_heute,ck_zert}-{0..3}.json (4 Shards, gleiche Reihenfolge wie die
Referenzläufe, damit die Zukünfte gepaart sind)."""
import copy, json, math, os, statistics as st, sys

src, outdir, files = sys.argv[1], sys.argv[2], sys.argv[3:]
E = [json.load(open(f, encoding="utf-8")) for f in files]
os.makedirs(outdir, exist_ok=True)
OPTS = ["paid", "oss", "deneb", "core"]


def tri_mean(xs):
    t = [round(st.mean(x[i] for x in xs), 3) for i in range(3)]
    t[1] = min(max(t[1], t[0]), t[2])
    return t


def merge_tri(key_fn):
    keys = sorted(set(k for e in E for k in (key_fn(e) or {})))
    out, spread = {}, {}
    for k in keys:
        xs = [key_fn(e)[k] for e in E if k in (key_fn(e) or {})]
        out[k] = tri_mean(xs)
        spread[k] = {"n": len(xs), "values": xs}
    return out, spread


pOver, pSpread = merge_tri(lambda e: e.get("pOver"))
extra, eSpread = merge_tri(lambda e: (e.get("ck_zert") or {}).get("pOverExtra"))
capKeys = sorted(set(k for e in E for k in (e.get("capOver") or {})))
capOver, cSpread = {}, {}
for k in capKeys:
    xs = [e["capOver"][k] for e in E if k in (e.get("capOver") or {})]
    capOver[k] = max(1, min(5, math.floor(st.mean(xs))))
    cSpread[k] = xs
fees = [e["ck_zert"]["certFee"] for e in E if (e.get("ck_zert") or {}).get("certFee")]
certFee = tri_mean(fees) if fees else [150, 800, 2550]
lags = [e["ck_zert"]["lagWeeks"] for e in E if (e.get("ck_zert") or {}).get("lagWeeks")]
A = {"method": "Mittel je Dreipunkt-Ecke bzw. Mittel der Fähigkeiten (abgerundet) aus " + ", ".join(e.get("estimator", f) for e, f in zip(E, files)),
     "pOver": pOver, "capOver": capOver, "certFee": certFee, "lagWeeks": tri_mean(lags) if lags else None, "pOverExtra_zert": extra,
     "spread": {"pOver": pSpread, "capOver": cSpread, "pOverExtra": eSpread}}
json.dump(A, open(f"{outdir}/ck-annahmen.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

P = json.load(open(src, encoding="utf-8"))


def variant(p, zert):
    q = copy.deepcopy(p)
    q["ossBuild"] = "ready"
    po = copy.deepcopy(q.get("pOver") or {})
    po.setdefault("oss", {}).update(copy.deepcopy(pOver))
    if zert:
        po["oss"].update(copy.deepcopy(extra))
        po["oss"]["certFee"] = list(certFee)
    q["pOver"] = po
    co = copy.deepcopy(q.get("capOver") or {})
    for k, v in capOver.items():
        co[k] = [None, v, None, None]
    q["capOver"] = co
    q["certOpt"] = bool(zert)
    return q


for name, zert in (("ck_heute", False), ("ck_zert", True)):
    Q = [variant(p, zert) for p in P]
    for k in range(4):
        json.dump(Q[k::4], open(f"{outdir}/{name}-{k}.json", "w", encoding="utf-8"), ensure_ascii=False)
print(json.dumps({k: A[k] for k in ("pOver", "capOver", "certFee", "lagWeeks", "pOverExtra_zert")}, ensure_ascii=False))
