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
    # ---- Modell v0.2 -------------------------------------------------------
    ("lcoe_nuclear_overrun_high", "nuclear", "teuer", 0.05, 0.0, True,
     "v0.2/M7: Ueberschreitungsfaktor 2,2 auf den HIGH-Anker (Hinkley Point C, laufende "
     "Preise). overrun_applicable_share = 0 -> der Faktor darf NICHT wirken; ebenso kein IDC.",
     {"cost_overrun_factor": 2.2}),
    ("lcoe_nuclear_overrun_low", "nuclear", "guenstig", 0.05, 0.0, True,
     "v0.2/M7: derselbe Faktor auf den LOW-Anker (EPR2-Overnight-Schaetzung). "
     "overrun_applicable_share = 1 und idc_applicable_share = 1 -> beide wirken voll.",
     {"cost_overrun_factor": 2.2}),
    ("lcoe_gas_fuel_from_thermal", "gas_ccgt", "mittel", 0.05, 75.0, False,
     "v0.2/M2: Brennstoffpreis thermisch (35 EUR/MWh_th) ueber den Wirkungsgrad in "
     "EUR/MWh_el umgerechnet, plus CO2 bei 75 EUR/t.", None),
    ("lcoe_gas_fuel_max", "gas_ccgt", "teuer", 0.05, 75.0, False,
     "v0.2/M2: teurer Szenariensatz -> Gaspreis 60 EUR/MWh_th bei niedrigerem Wirkungsgrad.",
     None),
    # ---- Modell v0.2b: CO2-Abscheidung -------------------------------------
    ("lcoe_gas_ccs_mid", "gas_ccs", "mittel", 0.05, 75.0, True,
     "v0.2b: GuD mit CCS. Prueft die ganze Kette - hoeherer CAPEX, niedrigerer Wirkungsgrad "
     "(mehr Brennstoff je MWh_el), Vollkettenkosten je abgeschiedener Tonne und die "
     "RESTemission, die weiterhin den vollen CO2-Preis traegt.", None),
    ("lcoe_gas_ccs_teuer", "gas_ccs", "teuer", 0.09, 200.0, True,
     "v0.2b: CCS im teuren Satz bei WACC 9 % und CO2 200 EUR/t - hier muss der CCS-Block mit "
     "100 EUR/t und der CO2-Block auf die Restemission gleichzeitig sichtbar sein.", None),
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
    {
        # v0.2: Bestandsbaender (M6) + Ist-Netzentgelt statt Ausbau-Annuitaet
        "id": "mix_ist_bands_grid",
        "note": "Referenzsystem-Variante: Kohle-, Biomasse- und Wasserband als Jahresenergie, "
                "Netzkosten auf Basis des heutigen Netzentgelts. Prueft M3 (Netzaufteilung/"
                "Netzbasis), M5 (Emissionsausweis) und M6 (Baender) in einem Lauf.",
        "shares": {"pv": 0.17, "wind_onshore": 0.21, "wind_offshore": 0.05},
        "demand_twh": 520.0,
        "scenario": "mittel",
        "co2_price": 75.0,
        "apply_idc": True,
        "grid_variant": "mid",
        "storage": {
            "battery_power_gw": 20.0,
            "battery_energy_gwh": 80.0,
            "gas_backup_gw": None,
        },
        "bands_twh": {"coal_band": 101.7, "biomass_band": 42.7, "hydro_band": 21.0},
        "grid_cost_basis": "ist_netzentgelt",
    },
    {
        # v0.2: Netzaufteilung im Ausbaufall, inkl. Deckelung des Skalierungsfaktors
        "id": "mix_grid_split_ee100",
        "note": "Sehr hoher fEE-Anteil mit Abregelung: prueft, dass das Uebertragungsnetz mit der "
                "GENUTZTEN fEE-Energie skaliert und der Faktor auf 1,0 gedeckelt wird.",
        "shares": {"pv": 0.62, "wind_onshore": 0.63, "wind_offshore": 0.24},
        "demand_twh": 950.0,
        "scenario": "mittel",
        "co2_price": 75.0,
        "apply_idc": True,
        "grid_variant": "mid",
        "storage": {
            "battery_power_gw": 60.0,
            "battery_energy_gwh": 240.0,
            "electrolyser_gw": 160.0,
            "h2_storage_gwh": 120000.0,
            "h2_turbine_gw": 90.0,
            "h2_initial_fill_share": 1.0,
            "gas_backup_gw": 20.0,
        },
        "bands_twh": {},
        "grid_cost_basis": "buildout_2045",
    },
    {
        # v0.2b: derselbe Mix wie mix_ee80_gas, aber mit CCS-Backup
        "id": "mix_ee80_gas_ccs",
        "note": "80 % fEE mit CCS-Backup. Identisch zu mix_ee80_gas bis auf gas_tech - prueft, "
                "dass die CCS-Kette in mix_system greift und die Restemission bepreist wird.",
        "shares": {"pv": 0.30, "wind_onshore": 0.35, "wind_offshore": 0.15},
        "demand_twh": 950.0,
        "scenario": "mittel",
        "co2_price": 75.0,
        "apply_idc": True,
        "grid_variant": "mid",
        "gas_tech": "gas_ccs",
        "storage": {
            "battery_power_gw": 40.0,
            "battery_energy_gwh": 160.0,
            "electrolyser_gw": 0.0,
            "h2_storage_gwh": 0.0,
            "h2_turbine_gw": 0.0,
            "gas_backup_gw": None,
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
            "model_version": model.MODEL_VERSION,
            "limitations": model.model_limitations(),
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
            bands_twh=case.get("bands_twh"),
            grid_cost_basis=case.get("grid_cost_basis", "buildout_2045"),
            gas_tech=case.get("gas_tech", "gas_ccgt"),
        )
        d = res["dispatch"]
        vectors["mix"].append(round_deep({
            "id": case["id"],
            "note": case["note"],
            "input": {k: case.get(k) for k in
                      ("shares", "demand_twh", "scenario", "co2_price", "apply_idc",
                       "grid_variant", "storage", "bands_twh", "grid_cost_basis", "gas_tech")},
            "expected": {
                "lscoe_eur_mwh": res["lscoe_eur_mwh"],
                "total_cost_bn_eur_a": res["total_cost_bn_eur_a"],
                "cost_components_eur_mwh": res["cost_components_eur_mwh"],
                "capacities_gw": res["capacities_gw"],
                "served_twh_a": res["served_twh_a"],
                "emissions_mt_co2_a": res["emissions"]["total_mt_co2_a"],
                "captured_mt_co2_a": res["emissions"]["captured_mt_co2_a"],
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
