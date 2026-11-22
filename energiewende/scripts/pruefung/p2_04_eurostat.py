#!/usr/bin/env python3
"""P2-04 Gegenprüfung: Eurostat-Energiebilanz DE unabhängig auswerten.

Liest die selbst abgerufene Datei quellen/raw/P2-04/eurostat_nrg_bal_c_DE_pruef.json
(JSON-stat 2.0) und gibt die Werte aus, auf die sich Dossier 04 stützt.
Aufruf: python3 -I scripts/pruefung/p2_04_eurostat.py <pfad-zur-json>
"""
import itertools
import json
import sys


def load(path):
    d = json.load(open(path, encoding="utf-8"))
    ids = d["id"]
    sizes = d["size"]
    cats = [sorted(d["dimension"][i]["category"]["index"].items(), key=lambda kv: kv[1]) for i in ids]
    vals = {}
    for flat, combo in enumerate(itertools.product(*[[k for k, _ in c] for c in cats])):
        v = d["value"].get(str(flat))
        if v is not None:
            vals[combo] = v
    return ids, vals


def main():
    ids, vals = load(sys.argv[1])
    pos = {k: i for i, k in enumerate(ids)}

    def g(bal, siec, year):
        for combo, v in vals.items():
            if combo[pos["nrg_bal"]] == bal and combo[pos["siec"]] == siec and combo[pos["time"]] == year:
                return v / 1000.0  # GWh -> TWh
        return None

    out = {}
    for y in ("2008", "2017", "2023", "2024"):
        out[y] = {}
        for bal in ("GAE", "GIC", "FC_E", "INTAVI", "INTMARB", "FC_IND_E", "FC_TRA_E", "FC_TRA_ROAD_E",
                    "FC_OTH_HH_E", "FC_OTH_CP_E", "FC_OTH_AF_E"):
            out[y][bal] = {s: g(bal, s, y) for s in ("TOTAL", "C0000X0350-0370", "O4000XBIO", "G3000", "E7000",
                                                      "H8000", "RA000", "N900H", "W6100_6220", "P1000", "S2000",
                                                      "C0350-0370")}
    fc = out["2024"]["FC_E"]
    tot = fc["TOTAL"]
    fossil = fc["O4000XBIO"] + fc["G3000"] + fc["C0000X0350-0370"]
    res = {
        "FC_E_2024": tot,
        "FC_E_2008": out["2008"]["FC_E"]["TOTAL"],
        "Rueckgang_2008_2024_pct": (tot / out["2008"]["FC_E"]["TOTAL"] - 1) * 100,
        "FC_E_plus_INTAVI_2024": tot + out["2024"]["INTAVI"]["O4000XBIO"] if out["2024"]["INTAVI"]["O4000XBIO"] else None,
        "INTAVI_TOTAL_2024": out["2024"]["INTAVI"]["TOTAL"],
        "INTMARB_TOTAL_2024": out["2024"]["INTMARB"]["TOTAL"],
        "fossil_anteil_pct": fossil / tot * 100,
        "fossil_TWh": fossil,
        "oel": fc["O4000XBIO"], "gas": fc["G3000"], "kohle_ohne_kuppelgas": fc["C0000X0350-0370"],
        "strom": fc["E7000"], "fernwaerme": fc["H8000"], "ee": fc["RA000"],
        "strom_anteil_pct": fc["E7000"] / tot * 100,
        "ee_anteil_pct": fc["RA000"] / tot * 100,
        "fw_anteil_pct": fc["H8000"] / tot * 100,
        "verkehr_oel_anteil_pct": out["2024"]["FC_TRA_E"]["O4000XBIO"] / out["2024"]["FC_TRA_E"]["TOTAL"] * 100,
        "sektoren_2024": {b: out["2024"][b]["TOTAL"] for b in ("FC_IND_E", "FC_TRA_E", "FC_TRA_ROAD_E", "FC_OTH_HH_E",
                                                               "FC_OTH_CP_E", "FC_OTH_AF_E")},
        "strom_FC_2008": out["2008"]["FC_E"]["E7000"],
        "strom_IND_2008": out["2008"]["FC_IND_E"]["E7000"],
        "strom_IND_2024": out["2024"]["FC_IND_E"]["E7000"],
        "GAE_2024": out["2024"]["GAE"],
        "GIC_2024": out["2024"]["GIC"]["TOTAL"],
        "GIC_2008": out["2008"]["GIC"]["TOTAL"],
        "road_2024": out["2024"]["FC_TRA_ROAD_E"],
    }
    print(json.dumps(res, indent=1, ensure_ascii=False))


if __name__ == "__main__":
    main()


def zeitreihe(path):
    """FC_E TOTAL je Jahr; prüft 'niedrigster Wert seit 1990'."""
    ids, vals = load(path)
    pos = {k: i for i, k in enumerate(ids)}
    ser = {}
    for combo, v in vals.items():
        if combo[pos["nrg_bal"]] == "FC_E" and combo[pos["siec"]] == "TOTAL":
            ser[combo[pos["time"]]] = round(v / 1000, 1)
    return dict(sorted(ser.items()))
