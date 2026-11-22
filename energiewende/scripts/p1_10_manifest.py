#!/usr/bin/env python3
"""Baut quellen/manifest_P1-10.json aus den Rohdateien (sha256). Aufruf aus energiewende/."""
import hashlib, json, os
E = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/"
W = "https://api.worldbank.org/v2/country/DEU;FRA;GBR;USA;CHN;POL;ESP;ITA;DNK;JPN;KOR/indicator/"
D = "https://www.destatis.de/DE/"
K = "https://www.kfw.de/PDF/Download-Center/Konzernthemen/Research/"
items = {
 "gdp_nama.json": E+"nama_10_gdp (geo=DE)", "gdp_nama_peers.json": E+"nama_10_gdp (EU27,FR,PL,ES,IT,DK)",
 "ip_annual.json": E+"sts_inpr_a", "nrg_pc_205_ind_el.json": E+"nrg_pc_205", "nrg_pc_204_hh_el.json": E+"nrg_pc_204",
 "nrg_pc_203_ind_gas.json": E+"nrg_pc_203", "nrg_pc_202_hh_gas.json": E+"nrg_pc_202",
 "nrg_pc_204_c_de.json": E+"nrg_pc_204_c", "nrg_pc_205_c_de.json": E+"nrg_pc_205_c",
 "emp_a64.json": E+"nama_10_a64_e", "gva_a64.json": E+"nama_10_a64", "eurostat_peh.json": E+"nrg_bal_peh",
 "wb_fdi_net_inflow_usd.json": W+"BX.KLT.DINV.CD.WD", "wb_fdi_net_inflow_gdp.json": W+"BX.KLT.DINV.WD.GD.ZS",
 "wb_fdi_outflow_usd.json": W+"BM.KLT.DINV.CD.WD", "wb_gdp_real_growth.json": W+"NY.GDP.MKTP.KD",
 "wb_industry_va_share.json": W+"NV.IND.MANF.ZS", "wb_elec_fossil_pct.json": W+"EG.ELC.FOSL.ZS",
 "wb_elec_nuclear_pct.json": W+"EG.ELC.NUCL.ZS", "wb_elec_renew_pct.json": W+"EG.ELC.RNEW.ZS",
 "wb_fossil_energy_pct.json": W+"EG.USE.COMM.FO.ZS", "wb_elec_use_pc.json": W+"EG.USE.ELEC.KH.PC",
 "wb_population.json": W+"SP.POP.TOTL",
 "destatis_lrins01.html": D+"Themen/Branchen-Unternehmen/Unternehmen/Gewerbemeldungen-Insolvenzen/Tabellen/lrins01.html",
 "destatis_pm_energieverbrauch_2025.html": D+"Presse/Pressemitteilungen/2026/11/PD26_400_435.html",
 "destatis_insolvenzen_thema.html": D+"Themen/Branchen-Unternehmen/Unternehmen/Gewerbemeldungen-Insolvenzen/_inhalt.html",
 "kfw_energiepreisschock_2025.pdf": K+"PDF-Industriepapier/Kapitel-3-Energiepreisschock-November-2025.pdf",
 "kfw_investitionen_klimaschutz.pdf": K+"PDF-Dokumente-Studien-und-Materialien/Investitionen-für-Klimaschutz.pdf",
 "uba_beschaeftigte_ee.html": "https://www.umweltbundesamt.de/daten/umweltindikatoren/indikator-beschaeftigte-im-bereich-erneuerbare",
 "ember_yearly_page.html": "https://ember-energy.org/data/yearly-electricity-data/",
}
out = []
for f, u in items.items():
    p = "quellen/raw/P1-10/" + f
    if not os.path.exists(p): continue
    out.append({"id": f.rsplit(".",1)[0], "url": u, "datei": "raw/P1-10/" + f,
                "sha256": hashlib.sha256(open(p,"rb").read()).hexdigest(), "abruf": "2026-11-22"})
json.dump({"hinweis": "Auftrag P1-10. Fremde Dokumente werden nicht gespiegelt; raw/ ist von Git ausgenommen. Eurostat-URLs ohne die Filter-Parameter angegeben, die genauen Abfragen stehen in scripts/p1_10_aufbereiten.py bzw. im Dossier.", "eintraege": out}, open("quellen/manifest_P1-10.json","w",encoding="utf-8"), ensure_ascii=False, indent=2)
print(len(out))
