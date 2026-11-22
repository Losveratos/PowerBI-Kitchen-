#!/usr/bin/env python3
"""P2-07: Importquoten (nrg_ind_id), Russland-Anteile und HHI (nrg_ti_*) aus
Eurostat-Rohdateien neu berechnen. Eigener Code. Aufruf mit Raw-Ordner."""
import json, sys, os
RAW = sys.argv[1]

def load(fn):
    d = json.load(open(os.path.join(RAW, fn)))
    ids, size = d['id'], d['size']
    inv = {k: {v: c for c, v in d['dimension'][k]['category']['index'].items()} for k in ids}
    strides, s = [], 1
    for n in reversed(size):
        strides.insert(0, s); s *= n
    rows = []
    vals = d['value']
    items = vals.items() if isinstance(vals, dict) else enumerate(vals)
    for key, val in items:
        if val is None: continue
        i = int(key); rec = {}
        for k, st, n in zip(ids, strides, size):
            rec[k] = inv[k][i // st]; i %= st
        rec['v'] = val; rows.append(rec)
    return d, rows

d, rows = load('ind_id.json')
print('ind_id dims', d['id'], {k: list(d['dimension'][k]['category']['index'])[:12] for k in d['id'] if k not in ('time',)})
for geo in ['DE', 'EU27_2020']:
    for sib in sorted({r['siec'] for r in rows}):
        out = {r['time']: r['v'] for r in rows if r['geo'] == geo and r['siec'] == sib}
        print(geo, sib, {y: out.get(y) for y in ['2015', '2021', '2022', '2023', '2024']})

for fn in ['ti_gas.json', 'ti_oil.json', 'ti_sff.json']:
    d, rows = load(fn)
    dims = {k: list(d['dimension'][k]['category']['index']) for k in d['id']}
    print('\n', fn, {k: (v if len(v) < 15 else v[:15] + ['...']) for k, v in dims.items() if k not in ('partner', 'time')})
    print('  partner count', len(dims['partner']), 'TOTAL' in dims['partner'])
    print('  units', dims.get('unit'))

AGG = {'TOTAL', 'EU27_2020', 'EXT_EU27_2020', 'INT_EU27_2020', 'EU28', 'EA19', 'EA20', 'EXT_EU28', 'INT_EU28',
       'EUR_OTH', 'AFR_OTH', 'ASI_OTH', 'AME_OTH', 'OCE_OTH', 'NSP', 'EUR', 'AFR', 'ASI', 'AME', 'OCE',
       'EFTA', 'OPEC', 'NAM', 'SAM', 'CAM', 'NAF', 'MEA', 'EXT_EA', 'INT_EA', 'UNK', 'NOT_SPEC', 'OTH'}
print('\n=== Russland-Anteil am TOTAL und HHI (nur Einzelländer, Anteile am TOTAL), DE')
for fn, sib in [('ti_gas.json', 'G3000'), ('ti_oil.json', 'O4100_TOT'), ('ti_sff.json', 'C0000X0350-0370'), ('ti_sff.json', 'C0100'), ('ti_sff.json', 'C0200')]:
    d, rows = load(fn)
    labels = d['dimension']['partner']['category'].get('label', {})
    for y in ['2015', '2019', '2021', '2022', '2023', '2024']:
        sel = [r for r in rows if r['geo'] == 'DE' and r['siec'] == sib and r['time'] == y]
        tot = sum(r['v'] for r in sel if r['partner'] == 'TOTAL')
        ru = sum(r['v'] for r in sel if r['partner'] == 'RU')
        ctry = [r for r in sel if len(r['partner']) == 2 and r['partner'] not in AGG and r['v'] > 0]
        sumc = sum(r['v'] for r in ctry)
        hhi = sum((100 * r['v'] / tot) ** 2 for r in ctry) if tot else None
        hhi_c = sum((100 * r['v'] / sumc) ** 2 for r in ctry) if sumc else None
        top = sorted(ctry, key=lambda r: -r['v'])[:4]
        print(fn, sib, y, f'RU {100*ru/tot:.1f}%' if tot else '-', f'HHI(TOTAL) {hhi:.0f}' if hhi else '', f'HHI(Summe Länder) {hhi_c:.0f}' if hhi_c else '',
              f'Abdeckung {100*sumc/tot:.0f}%' if tot else '', [(r['partner'], round(100 * r['v'] / tot, 1)) for r in top])
    if fn == 'ti_gas.json':
        print('DE Gas TOTAL 2024 TJ', [r['v'] for r in rows if r['geo'] == 'DE' and r['time'] == '2024' and r['partner'] == 'TOTAL'])
