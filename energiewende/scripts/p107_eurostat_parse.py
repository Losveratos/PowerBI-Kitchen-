#!/usr/bin/env python3
"""P1-07: Eurostat-JSON-stat (Comext, nrg_ti_*) in flache Zeilen umwandeln. Aufruf: python3 -I p107_eurostat_parse.py datei.json"""
import json, sys, itertools

def rows(path):
    d = json.load(open(path))
    ids = d['id']; size = d['size']
    cats = {k: list(d['dimension'][k]['category']['index'].keys()) for k in ids}
    # index -> Position
    pos = {k: sorted(d['dimension'][k]['category']['index'].items(), key=lambda x: x[1]) for k in ids}
    labels = {k: d['dimension'][k]['category'].get('label', {}) for k in ids}
    val = d['value']
    stat = d.get('status', {})
    out = []
    for flat, v in (val.items() if isinstance(val, dict) else enumerate(val)):
        flat = int(flat); idx = []
        for s in reversed(size):
            idx.append(flat % s); flat //= s
        idx = list(reversed(idx))
        rec = {ids[i]: pos[ids[i]][idx[i]][0] for i in range(len(ids))}
        rec['value'] = v
        out.append(rec)
    return d, out, labels

if __name__ == '__main__':
    d, out, labels = rows(sys.argv[1])
    print(d['label'], d['updated'])
    for r in out[:20]: print(r)
