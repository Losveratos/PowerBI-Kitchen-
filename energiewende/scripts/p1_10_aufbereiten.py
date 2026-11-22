#!/usr/bin/env python3
"""P1-10: Rohdaten (Eurostat, Weltbank, Destatis-Tabelle) in flache CSV unter data/ umwandeln.
Aufruf (aus energiewende/): python3 -I scripts/p1_10_aufbereiten.py
Lizenz der Quelldaten: Eurostat (CC BY 4.0), Weltbank (CC BY 4.0), Destatis (Datenlizenz Deutschland 2.0, Namensnennung)."""
import csv, json, re, html, sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__))))
from p1_10_jsonstat import rows

RAW = "quellen/raw/P1-10/"
OUT = "data/"

def w(name, header, recs):
    with open(OUT + name, "w", newline="", encoding="utf-8") as f:
        c = csv.writer(f); c.writerow(header); c.writerows(recs)
    print(name, len(recs))

# 1 BIP / Investitionen
recs = []
for fn in ("gdp_nama.json", "gdp_nama_peers.json"):
    _, _, _, r = rows(RAW + fn)
    for x in r:
        recs.append([x["geo"], x["na_item"], x["unit"], x["time"], x["value"]])
recs.sort()
w("p1_10_bip_investitionen.csv", ["geo", "na_item(B1GQ=BIP,P51G=Bruttoanlageinvest.)", "unit", "jahr", "wert"], recs)

# 2 Industrieproduktion
_, _, _, r = rows(RAW + "ip_annual.json")
w("p1_10_industrieproduktion.csv", ["geo", "nace_r2", "jahr", "index_2021=100_kalenderbereinigt"],
  sorted([x["geo"], x["nace_r2"], x["time"], x["value"]] for x in r))

# 3 Energiepreise Halbjahr
recs = []
for fn, lab in (("nrg_pc_205_ind_el.json", "strom_industrie"), ("nrg_pc_204_hh_el.json", "strom_haushalt"),
                ("nrg_pc_203_ind_gas.json", "gas_industrie"), ("nrg_pc_202_hh_gas.json", "gas_haushalt")):
    _, _, _, r = rows(RAW + fn)
    for x in r:
        recs.append([lab, x["geo"], x["nrg_cons"], x["tax"], x["time"], x["value"]])
w("p1_10_energiepreise_halbjahr.csv", ["reihe", "geo", "verbrauchsband", "steuer(X_TAX=ohne,X_VAT=ohne MwSt/erstattbar,I_TAX=alles)", "halbjahr", "EUR_je_kWh"], sorted(recs))

# 4 Komponenten
recs = []
for fn, lab in (("nrg_pc_204_c_de.json", "haushalt_2500-4999kWh"), ("nrg_pc_205_c_de.json", "industrie_2000-19999MWh")):
    _, _, _, r = rows(RAW + fn)
    for x in r:
        recs.append([lab, x["nrg_prc"], x["time"], x["value"]])
w("p1_10_strompreis_komponenten_de.csv", ["kundengruppe", "komponente", "jahr", "EUR_je_kWh"], sorted(recs))

# 5 Branchen: Erwerbstaetige, BWS
recs = []
for fn in ("emp_a64.json", "gva_a64.json"):
    _, _, _, r = rows(RAW + fn)
    for x in r:
        recs.append([x["nace_r2"], x["na_item"], x["unit"], x["time"], x["value"]])
w("p1_10_branchen_beschaeftigung_bws_de.csv", ["nace_r2", "na_item", "unit", "jahr", "wert"], sorted(recs))

# 6 Stromerzeugung
_, _, _, r = rows(RAW + "eurostat_peh.json")
w("p1_10_stromerzeugung_brutto_gwh.csv", ["geo", "siec(FE=fossil gesamt,N900H=Kernenergie,RA000=Erneuerbare)", "jahr", "GWh"],
  sorted([x["geo"], x["siec"], x["time"], x["value"]] for x in r))

# 7 Weltbank
recs = []
for fn, ind in (("wb_fdi_net_inflow_usd", "BX.KLT.DINV.CD.WD"), ("wb_fdi_net_inflow_gdp", "BX.KLT.DINV.WD.GD.ZS"),
                ("wb_fdi_outflow_usd", "BM.KLT.DINV.CD.WD"), ("wb_gdp_real_growth", "NY.GDP.MKTP.KD"),
                ("wb_industry_va_share", "NV.IND.MANF.ZS"), ("wb_elec_fossil_pct", "EG.ELC.FOSL.ZS"),
                ("wb_elec_nuclear_pct", "EG.ELC.NUCL.ZS"), ("wb_elec_renew_pct", "EG.ELC.RNEW.ZS"),
                ("wb_fossil_energy_pct", "EG.USE.COMM.FO.ZS")):
    meta, data = json.load(open(RAW + fn + ".json"))
    for x in data:
        if x["value"] is not None:
            recs.append([ind, x["countryiso3code"], x["date"], x["value"]])
w("p1_10_weltbank.csv", ["indikator", "land", "jahr", "wert"], sorted(recs))

# 8 Insolvenzen (Destatis lrins01, Stand 13.03.2026)
s = open(RAW + "destatis_lrins01.html", encoding="utf-8", errors="ignore").read()
i = s.find("<table"); t = s[i:s.find("</table>", i)]
recs = []
for tr in re.findall(r"<tr.*?</tr>", t, re.S):
    c = [re.sub(r"\s+", "", html.unescape(re.sub(r"<[^>]+>", "", x))) for x in re.findall(r"<t[hd].*?</t[hd]>", tr, re.S)]
    if len(c) == 6 and c[0].isdigit():
        recs.append([c[0], c[4], c[5]])
w("p1_10_insolvenzen_de.csv", ["jahr", "insolvenzen_insgesamt", "unternehmensinsolvenzen"], recs)
