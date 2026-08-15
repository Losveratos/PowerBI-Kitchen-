#!/usr/bin/env python3
"""Exportiert Referenz-Ergebnisse des Python-Modells als Testvektoren.

Zweck: Die interaktive Seite `whitepaper-strommix.html` portiert `lcoe()`,
`dispatch()` und `mix_system()` aus `scripts/model.py` nach JavaScript. Damit
diese Portierung nicht stillschweigend auseinanderlaeuft, laedt die Seite beim
Start `data/test_vectors.json` und rechnet jeden Vektor nach. Abweichungen ueber
0,5 % werden in der Konsole gemeldet und schalten das Footer-Badge auf "Modell
NICHT verifiziert".

Aufruf:
    python3 scripts/export_test_vectors.py

Ausgabe:
    data/test_vectors.json
"""

from __future__ import annotations

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import model  # noqa: E402

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PATH = os.path.join(BASE, "data", "test_vectors.json")

TOLERANCE = 0.005  # 0,5 % - identisch zur Pruefung im Browser


# --------------------------------------------------------------------------
# Faelle
# --------------------------------------------------------------------------
# Ebene 1: Technologie x Szenario x WACC x CO2-Preis x IDC
LCOE_CASES = [
    # (id, tech_key, scenario, wacc, co2_price, apply_idc, note, overrides)
    ("lcoe_pv_mid", "pv_freiflaeche", "mittel", 0.05, 0.0, False,
     "Basisfall PV, WACC 5 %, ohne Bauzins", None),
    ("lcoe_pv_guenstig_idc", "pv_freiflaeche", "guenstig", 0.03, 0.0, True,
     "PV im guenstigen Szenariensatz, WACC 3 %, mit Bauzins", None),
    ("lcoe_wind_on_co2", "wind_onshore", "mittel", 0.05, 75.0, True,
     "Wind onshore mit CO2-Preis 75 EUR/t (Emissionsfaktor 0 -> muss wirkungslos sein)", None),
    ("lcoe_wind_off_teuer", "wind_offshore", "teuer", 0.09, 0.0, True,
     "Wind offshore im teuren Satz, WACC 9 %", None),
    ("lcoe_nuclear_mid_noidc", "nuclear", "mittel", 0.05, 0.0, False,
     "Kernkraft EU-Mittel 12.000 EUR/kW ohne Bauzins", None),
    ("lcoe_nuclear_mid_idc", "nuclear", "mittel", 0.05, 0.0, True,
     "Kernkraft EU-Mittel mit Bauzins (12 a Bauzeit) - IDC-Hebel", None),
    ("lcoe_nuclear_wacc9", "nuclear", "teuer", 0.09, 0.0, True,
     "Kernkraft Erstprojekt 17.500 EUR/kW, WACC 9 % - WACC-Hebel", None),
    ("lcoe_nuclear_wacc3", "nuclear", "guenstig", 0.03, 0.0, True,
     "Kernkraft EU-Serie 7.500 EUR/kW, WACC 3 %", None),
    ("lcoe_gas_ccgt_co2_200", "gas_ccgt", "mittel", 0.05, 200.0, True,
     "GuD mit CO2-Preis 200 EUR/t (Brennstoffpreis fehlt in den Dossiers -> 0)", None),
    ("lcoe_gas_ocgt_co2_400", "gas_ocgt", "mittel", 0.05, 400.0, False,
     "OCGT-Peaker beim Slider-Maximum 400 EUR/t", None),
    ("lcoe_h2_turbine", "h2_turbine", "mittel", 0.05, 0.0, True,
     "H2-Rueckverstromung: Kapazitaetskosten je kW, auf 1.000 h normiert "
     "(genau der Pfad, den mix_system() fuer Backup-/Speicherkapazitaeten nutzt)",
     {"full_load_hours": 1000.0}),
]

# Ebene 2/3: zwei vollstaendige Mix-Laeufe (Dispatch + Systemkosten)
MIX_CASES = [
    {
        "id": "mix_ee80_gas",
        "note": "80 % fEE mit Gas-Backup, Backup-Kapazitaet aus dem Dispatch gemessen",
        "shares": {"pv": 0.30, "wind_onshore": 0.35, "wind_offshore": 0.15},
        "demand_twh": 950.0,
        "scenario": "mittel",
        "co2_price": 75.0,
        "apply_idc": True,
        "grid_variant": "mid",
        "storage": {
            "battery_power_gw": 40.0,
            "battery_energy_gwh": 160.0,
            "electrolyser_gw": 0.0,
            "h2_storage_gwh": 0.0,
            "h2_turbine_gw": 0.0,
            "gas_backup_gw": None,
        },
    },
    {
        "id": "mix_kernkraft_h2",
        "note": "Mix mit Kernkraft-Band, Batterie und H2-Kette (vorgefuellter Saisonspeicher)",
        "shares": {"pv": 0.22, "wind_onshore": 0.28, "wind_offshore": 0.12, "nuclear": 0.38},
        "demand_twh": 950.0,
        "scenario": "mittel",
        "co2_price": 0.0,
        "apply_idc": True,
        "grid_variant": "mid",
        "storage": {
            "battery_power_gw": 25.0,
            "battery_energy_gwh": 100.0,
            "electrolyser_gw": 30.0,
            "h2_storage_gwh": 40000.0,
            "h2_turbine_gw": 25.0,
            "h2_initial_fill_share": 0.5,
            "gas_backup_gw": 20.0,
        },
    },
]


def round_deep(obj, digits: int = 8):
    """Rundet Floats rekursiv, damit der JSON-Diff stabil bleibt."""
    if isinstance(obj, float):
        return round(obj, digits)
    if isinstance(obj, dict):
        return {k: round_deep(v, digits) for k, v in obj.items()}
    if isinstance(obj, list):
        return [round_deep(v, digits) for v in obj]
    return obj


def main() -> None:
    params = model.load_params()
    profiles = model.load_profiles(params=params)

    vectors: dict = {
        "meta": {
            "generated_by": "scripts/export_test_vectors.py",
            "purpose": ("Referenzwerte des Python-Modells (scripts/model.py) zum Selbsttest "
                        "der JavaScript-Portierung in whitepaper-strommix.html"),
            "tolerance_relative": TOLERANCE,
            "params_source": "data/model_params.json",
            "profiles_source": "data/profiles_2024.json",
            "profiles_data_completeness": profiles.get("data_completeness"),
            "profiles_hours": profiles["hours"],
            "profiles_label": profiles["label"],
        },
        "crf": [],
        "idc": [],
        "lcoe": [],
        "mix": [],
    }

    # --- Skalare Hilfsfunktionen (fangen Formelfehler frueh ab) -----------
    for rate, n in ((0.03, 30.0), (0.05, 27.0), (0.05, 60.0), (0.09, 20.0), (0.0, 25.0)):
        vectors["crf"].append({"rate": rate, "lifetime_years": n,
                               "expected": round(model.crf(rate, n), 10)})
    for wacc, years in ((0.05, 8.0), (0.05, 12.0), (0.05, 17.0), (0.09, 12.0), (0.03, 1.0)):
        vectors["idc"].append({"wacc": wacc, "construction_years": years,
                               "expected": round(model.idc_surcharge(wacc, years), 10)})

    # --- Ebene 1 ----------------------------------------------------------
    for case_id, tech_key, scenario, wacc, co2, idc, note, ov in LCOE_CASES:
        flat = model.resolve_tech(params, tech_key, scenario, overrides=ov, apply_idc=idc)
        res = model.lcoe(flat, wacc, co2)
        vectors["lcoe"].append(round_deep({
            "id": case_id,
            "note": note,
            "input": {"tech_key": tech_key, "scenario": scenario, "wacc": wacc,
                      "co2_price_eur_t": co2, "apply_idc": idc,
                      "overrides": ov},
            "expected": {
                "lcoe_eur_mwh": res["lcoe_eur_mwh"],
                "components_eur_mwh": res["components_eur_mwh"],
                "capex_effective_eur_kw": res["capex_effective_eur_kw"],
                "idc_surcharge": res["idc_surcharge"],
                "crf": res["crf"],
                "annuity_eur_kw_a": res["annuity_eur_kw_a"],
                "fixed_opex_eur_kw_a": res["fixed_opex_eur_kw_a"],
            },
        }))

    # --- Ebene 2 + 3 ------------------------------------------------------
    for case in MIX_CASES:
        res = model.mix_system(
            case["shares"], case["demand_twh"], params, profiles,
            scenario=case["scenario"], storage=case["storage"],
            co2_price=case["co2_price"], grid_variant=case["grid_variant"],
            apply_idc=case["apply_idc"],
        )
        d = res["dispatch"]
        vectors["mix"].append(round_deep({
            "id": case["id"],
            "note": case["note"],
            "input": {k: case[k] for k in
                      ("shares", "demand_twh", "scenario", "co2_price", "apply_idc",
                       "grid_variant", "storage")},
            "expected": {
                "lscoe_eur_mwh": res["lscoe_eur_mwh"],
                "total_cost_bn_eur_a": res["total_cost_bn_eur_a"],
                "cost_components_eur_mwh": res["cost_components_eur_mwh"],
                "capacities_gw": res["capacities_gw"],
                "served_twh_a": res["served_twh_a"],
                "dispatch": {
                    "energy_twh": d["energy_twh"],
                    "vre_potential_twh": d["vre_potential_twh"],
                    "coverage_ratio": d["coverage_ratio"],
                    "curtailment_share_of_vre": d["curtailment_share_of_vre"],
                    "gas_peak_gw": d["gas_peak_gw"],
                    "gas_full_load_hours": d["gas_full_load_hours"],
                    "battery_soc_max_gwh": d["battery_soc_max_gwh"],
                    "h2_storage_required_gwh": d["h2_storage_required_gwh"],
                    "h2_soc_max_gwh": d["h2_soc_max_gwh"],
                    "unserved_share": d["unserved_share"],
                    "nuclear_band_gw": d["nuclear_band_gw"],
                    "seasonal_share_load": d["seasonal_share_load"],
                },
            },
        }))

    with open(OUT_PATH, "w", encoding="utf-8") as fh:
        json.dump(vectors, fh, ensure_ascii=False, indent=1)

    n = len(vectors["crf"]) + len(vectors["idc"]) + len(vectors["lcoe"]) + len(vectors["mix"])
    print(f"OK {n} Testvektoren -> {os.path.relpath(OUT_PATH, BASE)}")
    print(f"   crf {len(vectors['crf'])} · idc {len(vectors['idc'])} · "
          f"lcoe {len(vectors['lcoe'])} · mix {len(vectors['mix'])}")
    for v in vectors["lcoe"]:
        print(f"   {v['id']:26s} {v['expected']['lcoe_eur_mwh']:8.2f} EUR/MWh")
    for v in vectors["mix"]:
        print(f"   {v['id']:26s} {v['expected']['lscoe_eur_mwh']:8.2f} EUR/MWh (System)")


if __name__ == "__main__":
    main()
