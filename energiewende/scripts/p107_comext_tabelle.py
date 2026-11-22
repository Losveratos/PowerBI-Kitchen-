#!/usr/bin/env python3
"""P1-07: Comext-Importe je Produkt: Wert extra-EU, China, Anteil. Aufruf: python3 -I p107_comext_tabelle.py datei.json [datei2.json ...]"""
import sys, collections
sys.path.insert(0, '/home/user/PowerBI-Kitchen-/energiewende/scripts')
from p107_eurostat_parse import rows

def load(paths):
    t = collections.defaultdict(float)
    labels = {}
    for p in paths:
        d, out, lab = rows(p)
        labels.update(lab.get('product', {}))
        for r in out:
            t[(r['reporter'], r['partner'], r['product'], r['indicators'], r['time'])] = r['value']
    return t, labels

if __name__ == '__main__':
    t, labels = load(sys.argv[1:])
    prods = sorted({k[2] for k in t})
    for rep in ('EU27_2020', 'DE'):
        print('=====', rep)
        for p in prods:
            yrs = sorted({k[4] for k in t if k[0] == rep and k[2] == p})
            line = []
            for y in yrs:
                cn = t.get((rep, 'CN', p, 'VALUE_IN_EUROS', y))
                ext = t.get((rep, 'EXT_EU27_2020', p, 'VALUE_IN_EUROS', y))
                w = t.get((rep, 'WORLD', p, 'VALUE_IN_EUROS', y))
                if cn is None and w is None: continue
                line.append(f"{y}: CN {((cn or 0)/1e6):.0f} / extra {((ext or 0)/1e6):.0f} / welt {((w or 0)/1e6):.0f} -> {(100*(cn or 0)/ext if ext else float('nan')):.0f}% extra")
            print(p, labels.get(p, '')[:70]); [print('   ', l) for l in line]
