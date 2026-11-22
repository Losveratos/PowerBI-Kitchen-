#!/usr/bin/env python3
"""P2-07 Gegenprüfung: China-Anteile an Extra-EU-Einfuhren direkt aus den
Comext-Rohdateien (JSON-stat) neu berechnen. Eigener Code, unabhängig von
scripts/p107_*.py. Aufruf: python3 -I p2_07_comext.py <raw-ordner>"""
import json, sys, os
from itertools import product as iprod

RAW = sys.argv[1]

def load(fn):
    d = json.load(open(os.path.join(RAW, fn)))
    ids, size = d['id'], d['size']
    cats = {k: d['dimension'][k]['category']['index'] for k in ids}
    inv = {k: {v: c for c, v in cats[k].items()} for k in ids}
    strides = []
    s = 1
    for n in reversed(size):
        strides.insert(0, s); s *= n
    out = {}
    for key, val in d['value'].items():
        i = int(key); coords = []
        for st, n in zip(strides, size):
            coords.append(i // st); i %= st
        out[tuple(inv[k][c] for k, c in zip(ids, coords))] = val
    return ids, out

def get(ids, data, **kw):
    tot = 0; hit = False
    for k, v in data.items():
        rec = dict(zip(ids, k))
        if all(rec.get(a) in (b if isinstance(b, (list, tuple)) else [b]) for a, b in kw.items()):
            tot += v; hit = True
    return tot if hit else None

def share(fn, rep, prods, year, ind='VALUE_IN_EUROS'):
    ids, d = load(fn)
    cn = get(ids, d, reporter=rep, partner='CN', product=prods, time=year, indicators=ind)
    ex = get(ids, d, reporter=rep, partner='EXT_EU27_2020', product=prods, time=year, indicators=ind)
    w = get(ids, d, reporter=rep, partner='WORLD', product=prods, time=year, indicators=ind)
    return cn, ex, w

PV_OLD, PV_NEW = ['85414090'], ['854142', '854143']
CASES = [
    ('PV (85414090 bis 2021, 854142+3 ab 2022)', 'comext_pv.json', None),
    ('Li-Ion 850760', 'comext_batt_inv_wind.json', ['850760']),
    ('Stromrichter 850440', 'comext_batt_inv_wind.json', ['850440']),
    ('Magnete 850511', 'comext_batt_inv_wind.json', ['850511']),
    ('Waermepumpen 841861', 'comext_batt_inv_wind.json', ['841861']),
    ('Windgeneratoren 850231', 'comext_batt_inv_wind.json', ['850231']),
    ('Trafo >10MVA 850423', 'comext_grid_cu_mat.json', ['850423']),
    ('Trafo 650kVA-10MVA 850422', 'comext_grid_cu_mat.json', ['850422']),
    ('Kabel >1kV 854460', 'comext_grid_cu_mat.json', ['854460']),
    ('Polysilizium 280461', 'comext_grid_cu_mat.json', ['280461']),
    ('Kupferkathoden 740311', 'comext_grid_cu_mat.json', ['740311']),
    ('Kupfererz 260300', 'comext_grid_cu_mat.json', ['260300']),
]
YEARS = ['2015', '2019', '2021', '2022', '2023', '2024', '2025']
for rep in ['EU27_2020', 'DE']:
    print(f'=== Berichtsland {rep}: China-Anteil an Extra-EU (%), Extra-EU 2025 Mrd EUR, CN Mio EUR 2025, Welt Mio 2025')
    for name, fn, prods in CASES:
        row = []
        for y in YEARS:
            p = prods or (PV_OLD if int(y) <= 2021 else PV_NEW)
            cn, ex, w = share(fn, rep, p, y)
            row.append('-' if not ex or cn is None else f'{100*cn/ex:.1f}')
        p = prods or PV_NEW
        cn, ex, w = share(fn, rep, p, '2025')
        print(f'{name:42s}', ' '.join(f'{y}:{r}' for y, r in zip(YEARS, row)),
              f'| ExEU25 {ex/1e9 if ex else 0:.2f} | CN25 {cn/1e6 if cn else 0:.0f} | W25 {w/1e6 if w else 0:.0f}')
# Mengenanteil PV (100 kg) als Gegenprobe Wert vs. Menge
print('=== PV EU27 Mengenanteil China (100kg)')
for y in YEARS:
    p = PV_OLD if int(y) <= 2021 else PV_NEW
    cn, ex, w = share('comext_pv.json', 'EU27_2020', p, y, 'QUANTITY_IN_100KG')
    print(y, None if not ex else f'{100*cn/ex:.1f}')
# PV Extra-EU 2022
for y in ['2022', '2023', '2024', '2025']:
    cn, ex, w = share('comext_pv.json', 'EU27_2020', ['854143'], y)
    print('Module 854143 EU ExEU', y, f'{ex/1e9:.2f}', 'CN-Anteil', f'{100*cn/ex:.1f}')
# DE PV NL
ids, d = load('comext_pv.json')
print('DE PV aus NL 2025 Mio', get(ids, d, reporter='DE', partner='NL', product=PV_NEW, time='2025', indicators='VALUE_IN_EUROS') / 1e6)
print('DE PV aus NL 2023 Mio', get(ids, d, reporter='DE', partner='NL', product=PV_NEW, time='2023', indicators='VALUE_IN_EUROS') / 1e6)
