#!/usr/bin/env python3
"""P2-07: Comext-Energieeinfuhrwerte (HS 2709, 2711) und Uran (284420) gegenprüfen.
Eigener Code. Aufruf: python3 -I p2_07_energiewerte.py <raw-ordner>"""
import json, os, sys
RAW = sys.argv[1]

def rows(fn):
    d = json.load(open(os.path.join(RAW, fn)))
    ids, size = d['id'], d['size']
    inv = {k: {v: c for c, v in d['dimension'][k]['category']['index'].items()} for k in ids}
    st, s = [], 1
    for n in reversed(size):
        st.insert(0, s); s *= n
    for key, val in d['value'].items():
        i = int(key); rec = {}
        for k, a, n in zip(ids, st, size):
            rec[k] = inv[k][i // a]; i %= a
        rec['v'] = val
        yield rec

def s(fn, **kw):
    return sum(r['v'] for r in rows(fn) if all(r.get(k) == v for k, v in kw.items()))

E = 'comext_energy_bill.json'
for y in ['2021', '2022', '2024', '2025']:
    print(y, 'EU27 ExtraEU 2711 Mrd', round(s(E, reporter='EU27_2020', partner='EXT_EU27_2020', product='2711', time=y, indicators='VALUE_IN_EUROS') / 1e9, 1),
          '| DE Welt 2709 Mrd', round(s(E, reporter='DE', partner='WORLD', product='2709', time=y, indicators='VALUE_IN_EUROS') / 1e9, 1))
U = 'comext_uranium.json'
for y in ['2019', '2021', '2022', '2023', '2024', '2025']:
    ru = s(U, reporter='EU27_2020', partner='RU', product='284420', time=y, indicators='VALUE_IN_EUROS')
    ex = s(U, reporter='EU27_2020', partner='EXT_EU27_2020', product='284420', time=y, indicators='VALUE_IN_EUROS')
    print(y, 'Uran 284420 RU-Anteil Extra-EU %', round(100 * ru / ex, 1) if ex else None)
