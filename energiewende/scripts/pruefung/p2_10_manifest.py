"""Schreibt quellen/manifest_P2-10.json (URL, Datei, sha256, Abrufdatum) für die Gegenprüfung P2-10."""
import hashlib
import json
import os

HIER = os.path.dirname(os.path.abspath(__file__))
Q = os.path.join(HIER, "..", "..", "quellen")
ES = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/"
EINTRAEGE = [
    ("sts_inpr_a", ES + "sts_inpr_a?geo=DE&geo=EU27_2020&geo=FR&geo=IT&geo=ES&geo=PL&geo=IE&nace_r2=B-D&nace_r2=C&nace_r2=C20&nace_r2=C24&nace_r2=C17&nace_r2=C23&nace_r2=C29&unit=I21&s_adj=CA&sinceTimePeriod=2015", "sts_inpr_a.json"),
    ("nrg_pc_205", ES + "nrg_pc_205?geo=DE&geo=EU27_2020&geo=FR&geo=IT&geo=ES&geo=PL&geo=DK&geo=NL&nrg_cons=MWH2000-19999&nrg_cons=MWH20000-69999&tax=X_VAT&currency=EUR&unit=KWH", "nrg_pc_205.json"),
    ("nrg_pc_204", ES + "nrg_pc_204?geo=DE&geo=EU27_2020&geo=FR&geo=IT&geo=ES&geo=PL&geo=DK&geo=NL&nrg_cons=KWH2500-4999&tax=I_TAX&currency=EUR&unit=KWH", "nrg_pc_204.json"),
    ("nrg_pc_203", ES + "nrg_pc_203?geo=DE&geo=EU27_2020&geo=FR&geo=IT&geo=ES&geo=PL&geo=NL&nrg_cons=GJ10000-99999&tax=X_VAT&currency=EUR&unit=KWH", "nrg_pc_203.json"),
    ("nrg_pc_204_c", ES + "nrg_pc_204_c?geo=DE&nrg_cons=KWH2500-4999&currency=EUR", "nrg_pc_204_c.json"),
    ("nrg_pc_205_c", ES + "nrg_pc_205_c?geo=DE&nrg_cons=MWH2000-19999&currency=EUR", "nrg_pc_205_c.json"),
    ("nama_10_gdp", ES + "nama_10_gdp?geo=DE&geo=EU27_2020&geo=FR&geo=ES&geo=IT&na_item=B1GQ&na_item=P51G&unit=CP_MEUR&unit=CLV20_MEUR&unit=PC_GDP&sinceTimePeriod=2010", "nama_10_gdp.json"),
    ("nrg_bal_peh", ES + "nrg_bal_peh?geo=DE&geo=ES&geo=IT&geo=DK&geo=FR&geo=PL&geo=EU27_2020&nrg_bal=GEP&siec=TOTAL&siec=FE&siec=N900H&siec=RA000&unit=GWH&time=2005&time=2010&time=2019&time=2024", "nrg_bal_peh.json"),
    ("nama_10_a64_e", ES + "nama_10_a64_e?geo=DE&nace_r2=C&nace_r2=D&nace_r2=TOTAL&nace_r2=C20&na_item=EMP_DC&unit=THS_PER&sinceTimePeriod=2018", "nama_10_a64_e.json"),
    ("nama_10_a64_c_va", ES + "nama_10_a64?geo=EU27_2020&geo=IE&geo=DE&nace_r2=C&nace_r2=C20&na_item=B1G&unit=CP_MEUR&time=2021", "nama_10_a64_c_va.json"),
    ("ember_yearly_global", "https://files.ember-energy.org/public-downloads/generation/outputs/release_generation_yearly_global.csv", "ember_yearly_global.csv"),
    ("destatis_lrins01", "https://www.destatis.de/DE/Themen/Branchen-Unternehmen/Unternehmen/Gewerbemeldungen-Insolvenzen/Tabellen/lrins01.html", "destatis_lrins01.html"),
    ("destatis_pm400", "https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/11/PD26_400_435.html", "destatis_pm400.html"),
    ("bbk_monatsbericht_2022_12", "https://www.bundesbank.de/resource/blob/895890/21ca496375acb5acea78bae3f00f2760/mL/2022-12-monatsbericht-data.pdf", "bbk_mb_2022_12.pdf"),
    ("svr_jg202223_kap5", "https://www.sachverstaendigenrat-wirtschaft.de/fileadmin/dateiablage/gutachten/jg202223/JG202223_Kapitel_5.pdf", "svr_jg202223_kap5.pdf"),
    ("btd_21_601_finanzplan", "https://dserver.bundestag.de/btd/21/006/2100601.pdf", "btd_21_601_finanzplan.pdf"),
    ("btd_20_14522", "https://dserver.bundestag.de/btd/20/145/2014522.pdf", "btd_20_14522.pdf"),
    ("bt_hib_1039794", "https://www.bundestag.de/presse/hib/kurzmeldungen-1039794", "bt_hib_1039794.html"),
]

aus = {"hinweis": "Auftrag P2-10 (Gegenprüfung Dossier 10). Fremde Dokumente werden nicht gespiegelt; raw/ ist von Git ausgenommen.", "eintraege": []}
for i, url, datei in EINTRAEGE:
    p = os.path.join(Q, "raw", "P2-10", datei)
    with open(p, "rb") as f:
        h = hashlib.sha256(f.read()).hexdigest()
    aus["eintraege"].append({"id": i, "url": url, "datei": "raw/P2-10/" + datei, "sha256": h, "abruf": "2026-11-22"})
with open(os.path.join(Q, "manifest_P2-10.json"), "w", encoding="utf-8") as f:
    json.dump(aus, f, ensure_ascii=False, indent=2)
    f.write("\n")
print(len(aus["eintraege"]), "Einträge")
