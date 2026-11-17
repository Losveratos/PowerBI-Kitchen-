#!/usr/bin/env python3
"""Fasst mehrere unabhängige Populations-Schätzungen (pop-*.json) zu einer zusammen.
Dreipunkt-Werte: elementweiser Median. Einzel-Wahrscheinlichkeiten (flags, must, ibcsAll, ...): Median.
Kategoriale Verteilungen (horizon, licAnchor, ...): Mittelwert, danach auf 1 normiert. Segment-Anteile ebenso.
Aufruf: python3 tools/rechner-population-merge.py out.json pop-a.json pop-b.json pop-c.json"""
import json, statistics, sys

out, files = sys.argv[1], sys.argv[2:]
est = [json.load(open(f, encoding="utf-8")) for f in files]
segs = list(est[0]["segments"].keys())
med = statistics.median


def norm(d):
    s = sum(max(0, v) for v in d.values()) or 1
    return {k: round(max(0, v) / s, 4) for k, v in d.items()}


res, spread = {}, {}
shares = norm({s: statistics.mean(e["segments"][s]["share"] for e in est) for s in segs})
for s in segs:
    vals = [e["segments"][s] for e in est]
    r = {"share": shares[s]}
    for k, v in vals[0].items():
        if k == "share":
            continue
        if isinstance(v, list):
            r[k] = [round(med(x[k][i] for x in vals), 3) for i in range(3)]
        elif isinstance(v, (int, float)):
            xs = [x[k] for x in vals]
            r[k] = round(med(xs), 3)
            spread[f"{s}.{k}"] = [min(xs), max(xs)]
        elif isinstance(v, dict):
            keys = v.keys()
            if k in ("flags", "must"):
                r[k] = {}
                for kk in keys:
                    xs = [x[k].get(kk, 0) for x in vals]
                    r[k][kk] = round(med(xs), 3)
                    spread[f"{s}.{k}.{kk}"] = [min(xs), max(xs)]
            else:
                r[k] = norm({kk: statistics.mean(x[k].get(kk, 0) for x in vals) for kk in keys})
    res[s] = r
json.dump({"method": "Median (Dreipunkt, Einzel-Wahrscheinlichkeiten) bzw. Mittel (Verteilungen) aus "
           + ", ".join(e.get("estimator", f) for e, f in zip(est, files)),
           "segments": res, "spread": spread}, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("geschrieben:", out, {s: res[s]["share"] for s in segs})
