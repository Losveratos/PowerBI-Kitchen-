#!/usr/bin/env python3
"""Hilfsfunktion: Eurostat-JSON-stat (v2) in flache Zeilen umwandeln.
Aufruf: python3 -I p1_10_jsonstat.py <datei.json>   (zeigt Dimensionen und erste Zeilen)"""
import json, itertools, sys

def rows(path):
    d = json.load(open(path, encoding="utf-8"))
    ids, size = d["id"], d["size"]
    cats = []
    for k in ids:
        idx = d["dimension"][k]["category"]["index"]
        if isinstance(idx, dict):
            order = sorted(idx, key=lambda c: idx[c])
        else:
            order = list(idx)
        cats.append(order)
    val = d.get("value", {})
    stat = d.get("status", {})
    out = []
    for pos, combo in enumerate(itertools.product(*[range(s) for s in size])):
        v = val.get(str(pos)) if isinstance(val, dict) else (val[pos] if pos < len(val) else None)
        if v is None:
            continue
        rec = {k: cats[i][combo[i]] for i, k in enumerate(ids)}
        rec["value"] = v
        rec["status"] = stat.get(str(pos)) if isinstance(stat, dict) else None
        out.append(rec)
    return d.get("label"), d.get("updated"), ids, out

if __name__ == "__main__":
    lab, upd, ids, r = rows(sys.argv[1])
    print(lab, upd, ids, len(r))
    for x in r[:8]:
        print(x)
