#!/usr/bin/env python3
"""P1-05 · Nachrechnung R21 Factsheet A („1,4 Billionen Euro für Batterien“).

Liest data/p1_05_dunkelflaute.json (erzeugt von p1_05_dunkelflaute.py) und rechnet
die Factsheet-A-Rechnung mit jeweils einer korrigierten Annahme nach.
Alle Kostensätze sind im Dossier research/05_speicher_dunkelflaute.md belegt;
was keine Quelle hat, heißt hier SETZUNG_M.

Aufruf: python3 -I energiewende/scripts/p1_05_factsheet_a.py
Ausgabe: data/p1_05_factsheet_a.json
"""
import json
import os
import statistics as st

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
IN = os.path.join(BASE, "data", "p1_05_dunkelflaute.json")
OUT = os.path.join(BASE, "data", "p1_05_factsheet_a.json")

# --- R21 Factsheet A (PDF S. A-1) ---
R21_LOAD_TWH = 520.0
R21_SHARE = 1 / 73            # 5 Tage
R21_EUR_PER_MWH = 200_000.0   # = 200 EUR/kWh

# --- belegte Kostensätze (Quellen im Dossier) ---
BAT_EUR_KWH = {"min": 130, "mid": 200, "max": 600}   # ISE 2024 Tab. 8 (2045 niedrig 130; 2024 hoch 600), R21/Bischof 200
GT_H2_EUR_KW = {"min": 550, "mid": 875, "max": 1200}  # ISE 2024 Tab. 1, H2-Gasturbine 2024 niedrig/hoch; mid = Mittel
# INES/DBI 2026 laut cleanthinking 06.11.2026: Umstellung 18 Mrd/35,7 TWh = 0,50; Neubau 37,6 Mrd/59,5 TWh = 0,63 EUR/kWh_H2.
# max = SETZUNG_M (Faktor ~2 für Kostenüberschreitung), nicht belegt
H2_CAVERN_EUR_KWH = {"min": 0.50, "mid": 0.63, "max": 1.26}
ETA_GT = 0.40                  # Wirkungsgrad H2-Gasturbine, strommix kosten_ee_speicher.md (B)
STROMVKG_EUR_PER_MW_A = 155_296  # BNetzA PM 03.11.2026, mengengewichteter Zuschlagswert je rMW und Jahr
STROMVKG_YEARS = 15
WACC = 0.05                    # SETZUNG_M für Annuität
BAT_LIFE = 15                  # ISE 2024 Tab. 2 (Batteriespeicher Lebensdauer 15 a)
BIO_ROR_TWH_5D = 0.8           # gemessen 2015–2025 im schwächsten 5-Tage-Fenster (0,73–0,83 TWh), heutiger Park


def annuity(rate, n):
    return rate / (1 - (1 + rate) ** -n)


def main():
    d = json.load(open(IN, encoding="utf-8"))
    yrs = d["jahre"]
    gaps = [yrs[y]["schwaechstes_5d_fenster"]["hochrechnung_ziel2030_setzung_M"]["luecke_vor_bio_import_twh"] for y in yrs]
    peaks = [yrs[y]["schwaechstes_5d_fenster"]["hochrechnung_ziel2030_setzung_M"]["spitze_luecke_gw"] for y in yrs]
    lf = [yrs[y]["schwaechstes_5d_fenster"]["lastfaktor_vs_jahresmittel"] for y in yrs]
    gap = {"min": min(gaps), "mid": st.median(gaps), "max": max(gaps)}
    peak = {"min": min(peaks), "mid": st.median(peaks), "max": max(peaks)}

    r21_twh = R21_LOAD_TWH * R21_SHARE
    r21_cost_bn = 7.0 * 1e6 * R21_EUR_PER_MWH / 1e9  # R21 rundet auf 7 TWh

    res = {"r21_original": {"speicher_twh_exakt": round(r21_twh, 3), "speicher_twh_r21": 7.0,
                            "kosten_mrd_eur": r21_cost_bn}}

    # V1: nur „Erzeugung null“ korrigiert (beobachtete Wind/PV im schwächsten 5-Tage-Fenster,
    #     Ziel-Kapazitäten 2030, Winterlastfaktor), Biomasse/Laufwasser abgezogen; weiter nur Batterie à 200 EUR/kWh
    v1_twh = {k: max(gap[k] - BIO_ROR_TWH_5D, 0) for k in gap}
    res["v1_resterzeugung_batterie_200"] = {
        "speicher_twh": {k: round(v, 2) for k, v in v1_twh.items()},
        "kosten_mrd_eur": {k: round(v * 1e9 * 200 / 1e9, 0) for k, v in v1_twh.items()},
        "hinweis": "Lücke vor Importen; Batterie bleibt einzige Technik",
    }
    # V2: wie V1, Batteriepreis-Bandbreite
    res["v2_wie_v1_batteriepreis_bandbreite"] = {
        "kosten_mrd_eur": {"min": round(v1_twh["min"] * BAT_EUR_KWH["min"], 0),
                           "max": round(v1_twh["max"] * BAT_EUR_KWH["max"], 0)},
        "eur_kwh": BAT_EUR_KWH,
    }
    # V3: Technikmix — H2-Gasturbinen für die Spitzenlücke + H2-Kavernenspeicher für die Energie
    turb_bn = {k: peak[k] * GT_H2_EUR_KW[k] / 1000 for k in peak}           # GW * EUR/kW = Mio -> /1000 = Mrd
    h2_twh = {k: v1_twh[k] / ETA_GT for k in v1_twh}
    cav_bn = {k: h2_twh[k] * H2_CAVERN_EUR_KWH[k] for k in h2_twh}           # TWh * EUR/kWh = Mrd
    res["v3_h2_turbinen_plus_kaverne"] = {
        "turbinen_gw": {k: round(v, 1) for k, v in peak.items()},
        "turbinen_mrd_eur": {k: round(v, 0) for k, v in turb_bn.items()},
        "h2_speicher_twh": {k: round(v, 1) for k, v in h2_twh.items()},
        "kaverne_mrd_eur": {k: round(v, 1) for k, v in cav_bn.items()},
        "summe_mrd_eur": {k: round(turb_bn[k] + cav_bn[k], 0) for k in peak},
        "nicht_enthalten": "Elektrolyseure, H2-Netz, Brennstoffkosten je Ereignis, Netzanschluss; ohne Abzug von Importen, Batterien, Lastflexibilität",
    }
    # V4: Marktpreis gesicherter Leistung (StromVKG, 1. Runde) für die Spitzenlücke
    v4 = {k: peak[k] * 1000 * STROMVKG_EUR_PER_MW_A for k in peak}
    res["v4_stromvkg_marktpreis"] = {
        "mrd_eur_pro_jahr": {k: round(v / 1e9, 1) for k, v in v4.items()},
        "mrd_eur_15_jahre_nominal": {k: round(v * STROMVKG_YEARS / 1e9, 0) for k, v in v4.items()},
        "hinweis": "Zuschlagswert je reduziertem MW; hier vereinfacht 1 GW Lücke = 1 GW rMW; ohne Brennstoff",
    }
    # Vergleich Annuität R21-Batterie
    res["vergleich_annuitaet_r21_batterie_mrd_eur_pro_jahr"] = round(r21_cost_bn * annuity(WACC, BAT_LIFE), 0)
    res["eingang"] = {"luecke_5d_twh_2030_setzung": gap, "spitze_luecke_gw": peak,
                      "winterlastfaktor": {"min": min(lf), "max": max(lf)},
                      "wacc_setzung_M": WACC, "batterie_lebensdauer_a": BAT_LIFE}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(res, f, ensure_ascii=False, indent=1)
    print(json.dumps(res, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
