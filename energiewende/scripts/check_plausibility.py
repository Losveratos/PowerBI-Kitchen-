#!/usr/bin/env python3
"""P1-03: Jahressummen der Energy-Charts-Reihen gegen UBA/AGEE-Stat-Zeitreihen (Tab. 3.1 Netto, Tab. 3 Brutto, Tab. 7).

Eingabe: quellen/raw/P1-03_stromdaten/uba_zeitreihen_ee.xlsx, public_power_<jahr>.json, total_power_<jahr>.json
Ausgabe: data/plausibilitaet_jahressummen.json
Aufruf: python3 -I energiewende/scripts/check_plausibility.py
"""
import json
import os
import warnings

import openpyxl

warnings.filterwarnings("ignore")
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
RAW = os.path.join(ROOT, "quellen", "raw", "P1-03_stromdaten")
YEARS = list(range(2015, 2026))


def sheet_rows(wb, name):
    ws = wb[name]
    rows = list(ws.iter_rows(values_only=True))
    hdr = None
    for r in rows:
        if r and any(hasattr(x, "year") for x in r if x is not None):
            hdr = r
            break
    cols = {x.year: i for i, x in enumerate(hdr) if hasattr(x, "year")}
    data = {}
    for r in rows:
        if r and isinstance(r[0], str):
            data[r[0].strip().replace("\n", " ")] = r
    return cols, data


def val(data, cols, label_start, year):
    for k, r in data.items():
        if k.startswith(label_start):
            return r[cols[year]]
    raise KeyError(label_start)


def ec_sum(kind, year, name):
    with open(os.path.join(RAW, f"{kind}_power_{year}.json"), encoding="utf-8") as f:
        d = json.load(f)
    for x in d["production_types"]:
        if x["name"] == name:
            return sum(v for v in x["data"] if v is not None) / 4.0 / 1e6  # MW*0.25h -> TWh
    return None


SMARD_TS = {2015: 1420066800000, 2016: 1451602800000, 2017: 1483225200000, 2018: 1514761200000, 2019: 1546297200000,
            2020: 1577833200000, 2021: 1609455600000, 2022: 1640991600000, 2023: 1672527600000, 2024: 1704063600000, 2025: 1735686000000}
SMARD_FILTER = {"pv": 4068, "wind_onshore": 4067, "wind_offshore": 1225, "last": 410, "biomasse": 4066, "wasserkraft": 1226}


def smard_sum(key, year):
    p = os.path.join(RAW, "smard", f"{SMARD_FILTER[key]}_month_{SMARD_TS[year]}.json")
    with open(p, encoding="utf-8") as f:
        d = json.load(f)
    vals = [v for t, v in d["series"] if v is not None]
    return sum(vals) / 1e6, len(vals)


def main():
    wb = openpyxl.load_workbook(os.path.join(RAW, "uba_zeitreihen_ee.xlsx"), read_only=True, data_only=True)
    c31, d31 = sheet_rows(wb, "3.1")
    c3, d3 = sheet_rows(wb, "3")
    c7, d7 = sheet_rows(wb, "7")
    out = {"hinweis": ("Vergleich Energy-Charts-Jahressummen (aus Viertelstundenwerten, TWh) gegen UBA/AGEE-Stat Tab. 3.1 (Nettostromerzeugung) "
                       "bzw. Tab. 7 (Bruttostromverbrauch). Stand der UBA-Tabelle: September 2026, teilweise vorläufig. "
                       "Achtung: Energy-Charts-Jahreswerte stimmen für Wind und PV in 2015-2022 auf die Gigawattstunde mit UBA Tab. 3.1 überein; "
                       "der Abgleich ist dort nicht unabhängig (vermutlich gleiche Datenbasis, AGEE-Stat/Energy-Charts-Kalibrierung)."),
           "quelle_vergleich": "UBA, Zeitreihen zur Entwicklung der erneuerbaren Energien in Deutschland, Stand 09/2026",
           "jahre": {}}
    for y in YEARS:
        rec = {}
        wind_on = ec_sum("public", y, "Wind onshore")
        wind_off = ec_sum("public", y, "Wind offshore")
        pv_pub = ec_sum("public", y, "Solar")
        pv_tot = ec_sum("total", y, "Solar")
        ror = ec_sum("public", y, "Hydro Run-of-River")
        res = ec_sum("public", y, "Hydro water reservoir")
        bio = ec_sum("public", y, "Biomass")
        load = ec_sum("public", y, "Load")
        u_on = val(d31, c31, "Windenergie an Land", y) / 1000
        u_off = val(d31, c31, "Windenergie auf See", y) / 1000
        u_pv = val(d31, c31, "Photovoltaik", y) / 1000
        u_pv_sv = val(d31, c31, "davon: Selbstverbrauch", y) / 1000
        u_hy = val(d31, c31, "Wasserkraft", y) / 1000
        u_bio = sum(val(d31, c31, k, y) for k in ("biogene Festbrennstoffe", "biogene flüssige", "Biogas", "Biomethan", "Klärgas", "Deponiegas")) / 1000
        u_abf = val(d31, c31, "biogener Anteil des Abfalls", y) / 1000
        u_brutto = val(d7, c7, "Bruttostromverbrauch", y)

        def row(ec, ref, note):
            return {"energy_charts_twh": round(ec, 2), "referenz_twh": round(ref, 2), "abweichung_pct": round((ec / ref - 1) * 100, 1), "abgrenzung": note}

        rec["wind_onshore"] = row(wind_on, u_on, "EC public_power vs UBA Tab. 3.1 Netto")
        rec["wind_offshore"] = row(wind_off, u_off, "EC public_power vs UBA Tab. 3.1 Netto")
        rec["pv_gesamt"] = row(pv_tot, u_pv, "EC total_power (inkl. Eigenverbrauch) vs UBA Tab. 3.1 Netto inkl. Selbstverbrauch")
        rec["pv_oeffentlich"] = row(pv_pub, u_pv - u_pv_sv, "EC public_power vs UBA Tab. 3.1 Netto abzüglich Selbstverbrauch (Einspeisung)")
        rec["wasserkraft"] = row(ror + res, u_hy, "EC Laufwasser+Speicher (ohne Pumpspeicher) vs UBA Wasserkraft (inkl. natürlicher Zufluss Pumpspeicher)")
        rec["biomasse"] = row(bio, u_bio, "EC Biomass (öffentlich) vs UBA Biomasse netto ohne biogenen Abfall")
        rec["biomasse_inkl_abfall"] = row(bio, u_bio + u_abf, "EC Biomass vs UBA Biomasse netto inkl. biogenem Abfallanteil")
        rec["last_vs_bruttostromverbrauch"] = {"energy_charts_netzlast_twh": round(load, 1), "bruttostromverbrauch_twh": round(u_brutto, 1),
                                               "verhaeltnis": round(load / u_brutto, 3),
                                               "abgrenzung": "Netzlast ist nicht Bruttostromverbrauch (Verluste, Kraftwerkseigenverbrauch, Eigenverbrauch fehlen); nur Konsistenzblick auf die Entwicklung"}
        sm = {}
        for key, ecv in (("pv", pv_pub), ("wind_onshore", wind_on), ("wind_offshore", wind_off), ("last", load), ("biomasse", bio), ("wasserkraft", ror + res)):
            sv, nm = smard_sum(key, y)
            sm[key] = {"smard_twh": round(sv, 2), "energy_charts_twh": round(ecv, 2), "abweichung_pct": round((ecv / sv - 1) * 100, 1), "monate": nm}
        rec["smard_vergleich"] = sm
        out["jahre"][str(y)] = rec
    with open(os.path.join(ROOT, "data", "plausibilitaet_jahressummen.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    keys = ["wind_onshore", "wind_offshore", "pv_gesamt", "pv_oeffentlich", "wasserkraft", "biomasse", "biomasse_inkl_abfall"]
    print("Jahr  " + "  ".join(f"{k[:12]:>12}" for k in keys) + "  Last/Brutto")
    for y in YEARS:
        r = out["jahre"][str(y)]
        print(y, "  ".join(f"{r[k]['abweichung_pct']:>12.1f}" for k in keys), "  ", r["last_vs_bruttostromverbrauch"]["verhaeltnis"])
    print("SMARD-Vergleich (EC gegen SMARD, %): pv wind_on wind_off last biomasse wasserkraft(ror+speicher)")
    for y in YEARS:
        r = out["jahre"][str(y)]["smard_vergleich"]
        print(y, [r[k]["abweichung_pct"] for k in SMARD_FILTER], [r[k]["monate"] for k in ("pv",)])


if __name__ == "__main__":
    main()
