#!/usr/bin/env python3
"""P1-07: Eurostat-Rohdaten (quellen/raw/P1-07/*.json) -> CSV in data/. Aufruf: python3 -I p107_build_data.py"""
import sys, csv, collections
BASE = '/home/user/PowerBI-Kitchen-/energiewende'
sys.path.insert(0, BASE + '/scripts')
from p107_eurostat_parse import rows
RAW = BASE + '/quellen/raw/P1-07/'
OUT = BASE + '/data/'

# 1) Comext: Importe nach China-Anteil
files = ['comext_pv.json', 'comext_batt_inv_wind.json', 'comext_grid_cu_mat.json', 'comext_wind_parts.json', 'comext_battmat.json']
val = {}; lab = {}
for f in files:
    d, out, l = rows(RAW + f)
    lab.update(l.get('product', {}))
    for r in out:
        val[(r['reporter'], r['partner'], r['product'], r['indicators'], r['time'])] = r['value']
with open(OUT + 'p107_comext_china_anteile.csv', 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh)
    w.writerow(['berichtsland', 'produkt_code', 'produkt', 'jahr', 'import_china_eur', 'import_extra_eu_eur', 'import_welt_eur', 'import_intra_eu_eur', 'china_anteil_an_extra_eu_pct'])
    for rep, prod, y in sorted({(k[0], k[2], k[4]) for k in val if k[3] == 'VALUE_IN_EUROS'}):
        g = lambda p: val.get((rep, p, prod, 'VALUE_IN_EUROS', y))
        cn, ex, wo, it = g('CN'), g('EXT_EU27_2020'), g('WORLD'), g('INT_EU27_2020')
        w.writerow([rep, prod, lab.get(prod, '')[:90], y, cn, ex, wo, it, round(100 * cn / ex, 1) if cn is not None and ex else ''])

# 2) Eurostat Energieimporte DE und EU27: Partneranteile
agg = {'TOTAL', 'EXT_EU27_2020', 'EU27_2020', 'NSP', 'INT_EU27_2020'}
with open(OUT + 'p107_energieimporte_partner.csv', 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh)
    w.writerow(['datensatz', 'traeger_code', 'einheit', 'geo', 'jahr', 'partner', 'menge', 'anteil_an_total_pct'])
    for f, ds in [('ti_gas.json', 'nrg_ti_gas'), ('ti_oil.json', 'nrg_ti_oil'), ('ti_sff.json', 'nrg_ti_sff')]:
        d, out, l = rows(RAW + f)
        tot = {(r['siec'], r['geo'], r['time']): r['value'] for r in out if r['partner'] == 'TOTAL'}
        for r in out:
            if r['partner'] in agg or not r['value']: continue
            t = tot.get((r['siec'], r['geo'], r['time']))
            w.writerow([ds, r['siec'], r['unit'], r['geo'], r['time'], r['partner'], r['value'], round(100 * r['value'] / t, 2) if t else ''])
# 3) Importabhaengigkeit
d, out, l = rows(RAW + 'ind_id.json')
with open(OUT + 'p107_importabhaengigkeit.csv', 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh); w.writerow(['geo', 'traeger_code', 'traeger', 'jahr', 'importabhaengigkeit_pct'])
    for r in out: w.writerow([r['geo'], r['siec'], l['siec'].get(r['siec'], ''), r['time'], round(r['value'], 2)])
# 4) Energie-Importwerte (Comext)
d, out, l = rows(RAW + 'comext_energy_bill.json')
with open(OUT + 'p107_energie_importwerte_comext.csv', 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh); w.writerow(['berichtsland', 'partner', 'produkt_code', 'produkt', 'jahr', 'wert_eur'])
    for r in out: w.writerow([r['reporter'], r['partner'], r['product'], l['product'].get(r['product'], '')[:60], r['time'], r['value']])
print('ok')
