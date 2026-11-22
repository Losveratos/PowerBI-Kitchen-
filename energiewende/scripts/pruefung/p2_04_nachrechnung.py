#!/usr/bin/env python3
"""P2-04 Gegenprüfung: unabhängige Nachrechnung der Eigenrechnungen aus Dossier 04.

Alle Eingangswerte sind an der Fundstelle abgelesen (siehe Kommentare); das Skript
des Dossiers (scripts/p104_eurostat_aufbereiten.py) wird nicht verwendet.
Eurostat-Werte rechnet scripts/pruefung/p2_04_eurostat.py aus der Rohdatei.
Aufruf: python3 -I scripts/pruefung/p2_04_nachrechnung.py
"""
from statistics import median

PJ_TWH = 1 / 3.6


def pct(neu, alt):
    return (neu / alt - 1) * 100


def main():
    r = {}
    # --- AGEB Auswertungstabellen, Stand 09/2026 (Tab. 2.1, 2.2, 6.1, 6.2, 6.7, 6.8), PJ
    ageb = {"pev_2024": 10571, "pev_2025": 10628, "eev_2023": 8123, "eev_2024": 8141, "eev_2025": 8288,
            "ind_2024": 2188, "ind_strom_2024": 670, "miv_2024": 1265, "gueter_2024": 733, "oepv_2024": 40,
            "strasse_2024": 2038, "verkehr_2024": 2486}
    for k, v in ageb.items():
        r["ageb_" + k + "_TWh"] = round(v * PJ_TWH, 1)
    # Dossier: AGEB-EEV 2024 abgeleitet aus UBA-Folie 607,6 / 0,269
    r["dossier_ageb_eev_abgeleitet"] = round(607.6 / 0.269, 1)
    r["abw_ageb_eev_pct"] = round(pct(r["dossier_ageb_eev_abgeleitet"], r["ageb_eev_2024_TWh"]), 2)
    # AGEB-Fossilanteil EEV 2024 (Tab. 6.1, %): Steinkohle, Braunkohle, Mineralöle, Gase
    r["ageb_fossil_anteil_eev_2024_pct"] = round(3.5 + 0.8 + 36.5 + 23.8, 1)
    # Eurostat FC_E 2024 (GWh -> TWh, eigene Abfrage): fossil inkl. Kuppelgase und nicht-ern. Abfall
    fc = {"tot": 2067.2, "oel": 705.9, "gas": 523.7, "kohle": 28.4, "kuppelgas": 26.9, "abfall": 13.0}
    r["eurostat_fossil_wie_dossier_pct"] = round((fc["oel"] + fc["gas"] + fc["kohle"]) / fc["tot"] * 100, 1)
    r["eurostat_fossil_inkl_kuppelgas_pct"] = round(
        (fc["oel"] + fc["gas"] + fc["kohle"] + fc["kuppelgas"]) / fc["tot"] * 100, 1)

    # --- Studienmitten Strombedarf (Fundstellen: Ariadne S. 20, Agora S. 46, ISE S. 33, NEP Kurzf. S. 5)
    m2045 = {"ariadne": (1037 + 1423) / 2, "agora": 1267, "ise": (1227 + 1544) / 2, "nep": (989 + 1294) / 2}
    r["mitten_2045"] = m2045
    r["median_2045"] = median(m2045.values())
    m2030 = {"ariadne": (681 + 807) / 2, "agora": 727, "ise": (670 + 789) / 2}
    r["median_2030_studien"] = median(m2030.values())
    r["median_2030_inkl_monitoring"] = median(list(m2030.values()) + [650])
    r["nep_2037_mitte"] = (866 + 1087) / 2
    r["faktor_2045_ggu_2024"] = (round(989 / 518, 2), round(1544 / 518, 2))

    # --- Bruttostromverbrauch, AGEB Strerz-Tabelle 09/2026 (TWh)
    bsv = {"2017_exkl": 595.9, "2017_inkl": 601.9, "2024_exkl": 523.1, "2024_inkl": 529.4,
           "2025_exkl": 522.4, "2025_inkl": 529.3}
    r["rueckgang_2017_2024_dossier_pct"] = round(pct(522, 602), 1)
    r["rueckgang_2017_2024_inkl_pct"] = round(pct(bsv["2024_inkl"], bsv["2017_inkl"]), 1)
    r["rueckgang_2017_2024_exkl_pct"] = round(pct(bsv["2024_exkl"], bsv["2017_exkl"]), 1)
    r["anstieg_bis_650_ab_2025_exkl_pct"] = round(pct(650, bsv["2025_exkl"]), 1)

    # --- Pkw-Endenergie aus Liter (UBA-Excel, BMDV VIZ 2025/26 S. 309) x Heizwert-Setzung des Dossiers
    pkw = 25884.17 * 8.94 / 1000 + 17612.22 * 9.97 / 1000
    r["pkw_TWh_dossier_methode"] = round(pkw, 1)
    r["pkw_gegen_ageb_miv_pct"] = round(pct(pkw, r["ageb_miv_2024_TWh"]), 1)
    r["rest_strasse_dossier"] = round(549.5 - pkw, 1)
    r["ageb_gueter_plus_oepv_TWh"] = round((733 + 40) * PJ_TWH, 1)
    r["verbrenner_kwh_100km"] = (round(7.74 * 8.94, 1), round(6.95 * 9.97, 1), round(7.40 * (0.6 * 8.94 + 0.4 * 9.97), 1))
    r["faktor_pkw"] = (round(69 / 21.5, 2), round(69 / 18, 2), round(69 / 15, 2))

    # --- THG: 1990-Basis aus Expertenrat (Drs. 21/6175 S. 57: 438,6 Mt = -65 %)
    base1990 = 438.6 / 0.35
    r["thg_1990_implizit"] = round(base1990, 1)
    r["thg_2025_ggu_1990_pct"] = round(pct(648.9, base1990), 1)
    r["thg_abstand_angepasst"] = round(648.9 - 661.6, 1)

    # --- Prozesswärme nach Temperatur (UBA V 1.4, Folie 14; HS Niederrhein 2024), TWh/a
    temp = {"<100": 47.5, "100-200": 79.7, "200-500": 42.9, "500-1000": 107.2, "1000-1500": 153.1, ">1500": 28.7}
    tot = sum(temp.values())
    r["prozesswaerme_temp_summe"] = round(tot, 1)
    r["anteil_unter_200_pct"] = round((temp["<100"] + temp["100-200"]) / tot * 100, 1)
    r["anteil_ueber_500_pct"] = round((temp["500-1000"] + temp["1000-1500"] + temp[">1500"]) / tot * 100, 1)
    r["prozesswaerme_uba_folie4_anteil_pct"] = round(407.0 / 607.6 * 100, 1)
    r["strom_anteil_pw_pct"] = round(30.7 / 407.0 * 100, 2)

    # --- Moleküle-Import gegen fossile Importe (Ariadne S. 8/64)
    r["import_gruen_anteil_fossil"] = (round(160 / (943 + 1041), 3), round(380 / (943 + 1041), 3))
    for k, v in r.items():
        print(f"{k}: {v}")


if __name__ == "__main__":
    main()
