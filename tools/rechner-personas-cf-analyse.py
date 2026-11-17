#!/usr/bin/env python3
"""Wertet die Kontrafaktum-Läufe aus: Wie oft kippt der Gewinner, wohin, und was kostet es je Viewer?
Aufruf: python3 tools/rechner-personas-cf-analyse.py <cf-dir> <out.json>"""
import json, sys
from collections import Counter
d, out = sys.argv[1], sys.argv[2]
meta = json.load(open(f"{d}/cf-meta.json", encoding="utf-8"))
O = ["paid", "oss", "deneb", "core", "none"]
res = {}
for k, m in meta.items():
    A = json.load(open(f"{d}/cf-{k}-A.mc.json"))["results"]; B = json.load(open(f"{d}/cf-{k}-B.mc.json"))["results"]
    PA = json.load(open(f"{d}/cf-{k}-A.json", encoding="utf-8"))
    n = len(A); assert n == len(B)
    wa = [max(range(5), key=lambda j: r["modes"]["konzern"]["win"][j]) for r in A]
    wb = [max(range(5), key=lambda j: r["modes"]["konzern"]["win"][j]) for r in B]
    u = [r["users"] for r in A]; U = sum(u)
    flip = sum(a != b for a, b in zip(wa, wb)) / n
    flipU = sum(ui for ui, a, b in zip(u, wa, wb) if a != b) / U
    trans = Counter((O[a], O[b]) for a, b in zip(wa, wb) if a != b).most_common(4)
    dshare = [sum(rb["modes"]["konzern"]["win"][j] - ra["modes"]["konzern"]["win"][j] for ra, rb in zip(A, B)) / n for j in range(5)]
    db = sorted((rb["modes"]["konzern"]["best"][1] or 0) - (ra["modes"]["konzern"]["best"][1] or 0) for ra, rb in zip(A, B) if ra["modes"]["konzern"]["best"][1] and rb["modes"]["konzern"]["best"][1])
    res[k] = {"label": m["label"], "n": n, "flip": flip, "flipUsers": flipU, "trans": [[a, b, c / n] for (a, b), c in trans],
              "dshare": dshare, "dbest": db[len(db) // 2] if db else None, "A": [sum(r["modes"]["konzern"]["win"][j] for r in A) / n for j in range(5)],
              "B": [sum(r["modes"]["konzern"]["win"][j] for r in B) / n for j in range(5)]}
json.dump(res, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for k, v in sorted(res.items(), key=lambda t: -t[1]["flip"]):
    print(f"{v['flip']*100:5.1f}% (Nutzer {v['flipUsers']*100:4.1f}%) Δ€/V {v['dbest'] and round(v['dbest'])!s:>5} {v['label'][:60]:60s} Δ " + " ".join(f"{O[j]}{v['dshare'][j]*100:+.0f}" for j in range(5)) + "  " + str([(a, b, round(c*100)) for a, b, c in v['trans'][:2]]))
