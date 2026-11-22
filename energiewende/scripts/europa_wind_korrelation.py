#!/usr/bin/env python3
"""P1-06: Korrelation der Wind-Kapazitätsfaktoren DE vs. Nachbarn (stündlich), Energy-Charts.
Quelle: api.energy-charts.info /public_power und /installed_power (Fraunhofer ISE, CC BY 4.0).
Setzung (M): Kapazitätsfaktor = Erzeugung / installierte Jahres-Leistung (Jahreswert aus installed_power, keine unterjährige Zubauanpassung).
Aufruf: python3 -I europa_wind_korrelation.py <raw-dir> <out-json> <jahr> [<jahr> ...]"""
import json, sys, math
raw, out = sys.argv[1], sys.argv[2]
years = sys.argv[3:]
C = ["de", "fr", "nl", "dk", "pl", "at", "ch", "be", "cz", "no", "se"]
def inst(c, y):
    d = json.load(open(f"{raw}/inst_{c}.json"))
    i = d["time"].index(y)
    tot = 0.0
    for p in d["production_types"]:
        if p["name"] in ("Wind onshore", "Wind offshore") and p["data"][i] is not None:
            tot += p["data"][i]
    return tot
def hourly(c, y, names):
    d = json.load(open(f"{raw}/pp_{c}_{y}.json"))
    ts = d["unix_seconds"]
    acc = {}
    for p in d["production_types"]:
        if p["name"] in names:
            for t, x in zip(ts, p["data"]):
                if x is None: continue
                a = acc.setdefault(t // 3600, {}); a.setdefault(p["name"], []).append(x)
    return {h: sum(sum(v) / len(v) for v in a.values()) for h, a in acc.items()}  # MW Stundenmittel
def corr(x, y):
    n = len(x); mx = sum(x)/n; my = sum(y)/n
    sxy = sum((a-mx)*(b-my) for a, b in zip(x, y)); sx = sum((a-mx)**2 for a in x); sy = sum((b-my)**2 for b in y)
    return sxy / math.sqrt(sx*sy)
res = {}
for y in years:
    cap = {c: inst(c, y) for c in C}
    gen = {c: hourly(c, y, ("Wind onshore", "Wind offshore")) for c in C}
    sol = {c: hourly(c, y, ("Solar",)) for c in ("de",)}
    hrs = sorted(set.intersection(*[set(g) for g in gen.values()]))
    cf = {c: [gen[c].get(h, 0) / 1000 / cap[c] if cap[c] else None for h in hrs] for c in C}
    de = cf["de"]
    q = sorted(de)[int(0.1 * len(de))]            # unteres Dezil DE-Wind
    low = [i for i, v in enumerate(de) if v <= q]
    # Flaute DE: Wind-CF < 5 %
    f5 = [i for i, v in enumerate(de) if v < 0.05]
    r = {"stunden": len(hrs), "inst_wind_GW": {c: round(cap[c], 2) for c in C}, "de_wind_cf_mittel": round(sum(de)/len(de), 3), "de_wind_cf_dezil10_grenze": round(q, 3), "laender": {}}
    for c in C[1:]:
        if not cap[c]: continue
        v = cf[c]
        r["laender"][c] = {"cf_mittel": round(sum(v)/len(v), 3), "korrelation_mit_DE": round(corr(de, v), 3),
                           "cf_mittel_in_DE_flautestunden_unteres_Dezil": round(sum(v[i] for i in low)/len(low), 3),
                           "cf_mittel_in_DE_wind_unter_5pct": round(sum(v[i] for i in f5)/len(f5), 3) if f5 else None,
                           "stunden_DE_wind_unter_5pct": len(f5)}
    # Länder mit Windbasis: NL DK PL FR BE CZ AT SE NO: Gewichteter Mittel-CF der Nachbarn (nach installierter Leistung)
    nb = [c for c in C[1:] if cap[c] and c not in ("ch",)]
    w = sum(cap[c] for c in nb)
    agg = [sum(cf[c][i] * cap[c] for c in nb) / w for i in range(len(hrs))]
    r["nachbarn_aggregat"] = {"laender": nb, "inst_GW": round(w, 1), "cf_mittel": round(sum(agg)/len(agg), 3),
                              "korrelation_mit_DE": round(corr(de, agg), 3),
                              "cf_mittel_wenn_DE_unteres_Dezil": round(sum(agg[i] for i in low)/len(low), 3),
                              "cf_mittel_wenn_DE_unter_5pct": round(sum(agg[i] for i in f5)/len(f5), 3) if f5 else None}
    # gleichzeitige Flaute: Anteil Stunden, in denen DE <10 % UND Nachbaraggregat <10 %
    both = sum(1 for i in range(len(hrs)) if de[i] < 0.10 and agg[i] < 0.10)
    r["gleichzeitig_unter_10pct_stunden"] = both
    r["de_unter_10pct_stunden"] = sum(1 for v in de if v < 0.10)
    # längste zusammenhängende Phase, in der DE <10 % und Nachbaraggregat <15 %
    best = cur = 0
    for i in range(len(hrs)):
        if de[i] < 0.10 and agg[i] < 0.15: cur += 1; best = max(best, cur)
        else: cur = 0
    r["laengste_phase_DE_unter10_und_Nachbarn_unter15_h"] = best
    # Wind+Solar DE als Dunkelflaute: CF Wind + Solar-CF; Solar-Kapazität nicht geladen -> nur Wind (siehe Lücken)
    res[y] = r
json.dump(res, open(out, "w"), ensure_ascii=False, indent=1)
print(json.dumps(res, ensure_ascii=False, indent=1))
