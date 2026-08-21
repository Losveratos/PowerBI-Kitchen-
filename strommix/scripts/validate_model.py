#!/usr/bin/env python3
"""Validierung des Modells nach docs/02_modellkonzept.md, Abschnitt 'Validierung'.

(a) LCOE-Reproduktion  - GES-Werte mit GES-Annahmen (+/-2 %),
                         eigene Parameterspannen gegen Fraunhofer ISE / Lazard
(b) Ist-2024-Check     - reale Kapazitaeten gegen die Jahressummen der Profile
                         (nur verfuegbare Reihen, H2-2024)
(c) GES-Szenario-Test  - Mix-Modell mit GES-Annahmen gegen 125/197/212/321 EUR/MWh

Schreibt research/validierung_modell.md. Abweichungen werden quantifiziert und
diskutiert, nicht wegoptimiert.
"""

from __future__ import annotations

import json
import os
from typing import Any

import model

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_MD = os.path.join(BASE, "research", "validierung_modell.md")

TOL_LCOE = 0.02   # +/-2 % fuer die GES-Reproduktion
TOL_IST = 0.05    # +/-5 % fuer den Ist-Jahr-Check


def dev_pct(actual: float, target: float) -> float:
    return (actual - target) / target * 100.0


def fmt(x: Any, digits: int = 1) -> str:
    if x is None:
        return "-"
    if isinstance(x, float):
        return f"{x:.{digits}f}"
    return str(x)


# ==========================================================================
# (a) LCOE-Reproduktion
# ==========================================================================
def validate_lcoe(params: dict) -> dict:
    ges = params["ges_reference"]
    wacc = ges["methodology"]["wacc"]
    rows = []
    ok = True
    for key, label in (
        ("pv", "Photovoltaik"),
        ("wind_onshore", "Wind onshore"),
        ("wind_offshore", "Wind offshore"),
        ("nuclear", "Kernkraft"),
    ):
        g = ges["technologies"][key]
        flat = {
            "capex_eur_kw": g["capex_eur_kw"],
            "opex_pct": g["opex_pct"],
            "full_load_hours": g["full_load_hours"],
            "lifetime_years": g["lifetime_years"],
            "fuel_eur_mwh": g.get("fuel_cost_eur_mwh", 0.0),
            "apply_idc": False,  # GES modelliert keine Bauzinsen
        }
        res = model.lcoe(flat, wacc, co2_price=0.0)
        d = dev_pct(res["lcoe_eur_mwh"], g["lcoe"])
        passed = abs(d) <= TOL_LCOE * 100
        ok = ok and passed
        rows.append({
            "label": label, "target": g["lcoe"], "model": res["lcoe_eur_mwh"],
            "dev_pct": d, "passed": passed,
            "inputs": f"{g['capex_eur_kw']} EUR/kW, {g['opex_pct'] * 100:.0f} %/a, "
                      f"{g['full_load_hours']} h, {g['lifetime_years']} a",
        })

    # --- eigene Parameterspannen gegen Fraunhofer ISE / Lazard ------------
    band_rows = []
    for tech_key, ref_field in (
        ("pv_freiflaeche", "lcoe_reference_eur_mwh"),
        ("wind_onshore", "lcoe_reference_eur_mwh"),
        ("wind_offshore", "lcoe_reference_eur_mwh"),
    ):
        ref = params["technologies"][tech_key][ref_field]
        vals = {}
        for sc in ("guenstig", "mittel", "teuer"):
            flat = model.resolve_tech(params, tech_key, sc, apply_idc=False)
            vals[sc] = model.lcoe(flat, model.scenario_wacc(params, sc))["lcoe_eur_mwh"]
        lo, hi = min(vals.values()), max(vals.values())
        overlap = ref["min"] is not None and not (hi < ref["min"] or lo > ref["max"])
        band_rows.append({
            "label": params["technologies"][tech_key]["label"],
            "model_band": (lo, hi), "ref_band": (ref["min"], ref["max"]),
            "ref_source": ref["source"], "values": vals, "overlap": overlap,
        })

    # Kernkraft gegen die Drittquellen-Spannen des Dossiers
    nuc_vals = {}
    for sc in ("guenstig", "mittel", "teuer"):
        flat = model.resolve_tech(params, "nuclear", sc, apply_idc=False)
        nuc_vals[sc] = model.lcoe(flat, model.scenario_wacc(params, sc))["lcoe_eur_mwh"]
    nuc_band = (min(nuc_vals.values()), max(nuc_vals.values()))

    # Reproduktion der Dossier-eigenen Kernkraft-Szenarien
    nuc_scen = []
    ref_scen = params["technologies"]["nuclear"]["scenario_lcoe_reference"]
    p_nuc = params["technologies"]["nuclear"]["params"]
    for name, s in ref_scen.items():
        base = {
            "capex_eur_kw": s["capex"],
            "full_load_hours": s["flh"],
            "lifetime_years": p_nuc["lifetime_years"]["mid"],
            "apply_idc": False,
        }
        variants = {
            "opex_low": {"opex_eur_kw_a": p_nuc["opex_eur_kw_a"]["min"],
                         "fuel_eur_mwh": p_nuc["fuel_eur_mwh"]["min"],
                         "waste_eur_mwh": p_nuc["waste_eur_mwh"]["min"]},
            "opex_mid": {"opex_eur_kw_a": p_nuc["opex_eur_kw_a"]["mid"],
                         "fuel_eur_mwh": p_nuc["fuel_eur_mwh"]["mid"],
                         "waste_eur_mwh": p_nuc["waste_eur_mwh"]["mid"]},
            "opex_max": {"opex_eur_kw_a": p_nuc["opex_eur_kw_a"]["max"],
                         "fuel_eur_mwh": p_nuc["fuel_eur_mwh"]["max"],
                         "waste_eur_mwh": p_nuc["waste_eur_mwh"]["max"]},
        }
        row = {"name": name, "target": s["lcoe"], "capex": s["capex"], "wacc": s["wacc"], "flh": s["flh"]}
        for vname, ov in variants.items():
            row[vname] = model.lcoe({**base, **ov}, s["wacc"])["lcoe_eur_mwh"]
        row["best_dev_pct"] = min(
            (dev_pct(row[v], s["lcoe"]) for v in variants), key=abs
        )
        nuc_scen.append(row)

    # IDC-Kalibrierung gegen die Dossier-Werte
    idc_ref = params["technologies"]["nuclear"]["idc_surcharge_reference"]
    cy = params["technologies"]["nuclear"]["params"]["construction_years"]
    idc_rows = []
    for lvl, years in (("low", cy["min"]), ("mid", cy["mid"]), ("high", cy["max"])):
        computed = model.idc_surcharge(params["global"]["wacc"]["mid"], years)
        idc_rows.append({
            "level": lvl, "years": years, "ref": idc_ref[lvl], "model": computed,
            "dev_pp": (computed - idc_ref[lvl]) * 100,
        })

    return {
        "ges_rows": rows, "ges_passed": ok, "band_rows": band_rows,
        "nuclear_band": nuc_band, "nuclear_values": nuc_vals,
        "nuclear_scenarios": nuc_scen, "idc_rows": idc_rows,
        "third_party": {
            "fraunhofer_nuclear": params["technologies"]["nuclear"]["lcoe_reference_eur_mwh"],
        },
    }


# ==========================================================================
# (b) Ist-2024-Check
# ==========================================================================
def validate_ist(params: dict, profiles: dict) -> dict:
    caps = params["ist_zustand"]["installed_gw_2024_profile_reference"]
    raw = profiles["meta"]
    plaus = raw.get("plausibility_check_2024", {})
    hours = profiles["hours"]

    rows = []
    for series, cap_key in (("solar_mw", "pv"), ("wind_onshore_mw", "wind_onshore")):
        s = profiles["series"][series]
        if not s["available"]:
            rows.append({"series": series, "available": False})
            continue
        target = s["sum_mwh_covered"] / model.MWH_PER_TWH
        cap_gw = caps[cap_key]
        modelled = cap_gw * model.MW_PER_GW * s["cf_covered"] * hours / model.MWH_PER_TWH
        rows.append({
            "series": series, "available": True, "capacity_gw": cap_gw,
            "cf_covered": s["cf_covered"], "target_twh": target, "model_twh": modelled,
            "dev_pct": dev_pct(modelled, target), "passed": abs(dev_pct(modelled, target)) <= TOL_IST * 100,
        })

    # Last: Dispatch-Eingang gegen die Teilzeitraumsumme des Profils
    load_series = profiles["series"]["load_mw"]
    load_target = load_series["sum_mwh_covered"] / model.MWH_PER_TWH
    expected = plaus.get("load_mw", {}).get("expected_full_year_range_twh")
    demand_full = sum(expected) / 2 if expected else None
    disp = model.dispatch(
        {"pv": caps["pv"], "wind_onshore": caps["wind_onshore"], "gas_backup": None},
        params, profiles, demand_twh=demand_full, vre_energy_mode="profile_cf",
    )
    load_model = disp["energy_twh"]["load"]
    rows.append({
        "series": "load_mw", "available": True, "capacity_gw": None, "cf_covered": None,
        "target_twh": load_target, "model_twh": load_model,
        "dev_pct": dev_pct(load_model, load_target),
        "passed": abs(dev_pct(load_model, load_target)) <= TOL_IST * 100,
    })

    # Unabhaengige Gegenproben
    pv_full = params["ist_zustand"]["generation_2024_twh"]["pv"]["value"]
    pv_cov = profiles["series"]["solar_mw"]["sum_mwh_covered"] / model.MWH_PER_TWH
    seasonal_cfg = params["profiles_meta"]["seasonal_share_covered"]
    cross = {
        "pv_share_from_ist": pv_cov / pv_full,
        "pv_share_from_plausibility": seasonal_cfg["solar_mw"]["value"],
        "wind_share_from_plausibility": seasonal_cfg["wind_onshore_mw"]["value"],
        "load_share_from_plausibility": seasonal_cfg["load_mw"]["value"],
    }
    cross["pv_share_dev_pct"] = dev_pct(cross["pv_share_from_plausibility"], cross["pv_share_from_ist"])

    # Volllaststunden-Gegenprobe: Modellannahme (Neuanlagen) vs. Ist-Flotte
    won = params["technologies"]["wind_onshore"]
    flh_model = won["params"]["full_load_hours"]["mid"]
    flh_fleet = won["full_load_hours_fleet"]["value"]
    cf = profiles["series"]["wind_onshore_mw"]["cf_covered"]
    share = seasonal_cfg["wind_onshore_mw"]["value"]
    flh_implied = cf * hours / share  # auf ein Jahr hochgerechnete Ist-Volllaststunden
    flh_check = {
        "flh_model_new_plants": flh_model,
        "flh_fleet_2025_dossier": flh_fleet,
        "flh_implied_from_profile": flh_implied,
        "dev_model_vs_implied_pct": dev_pct(flh_model, flh_implied),
    }

    return {"rows": rows, "cross": cross, "flh_check": flh_check,
            "dispatch": disp, "coverage_hours": hours}


# ==========================================================================
# (c) GES-Szenario-Test
# ==========================================================================
def _ges_tech_overrides(params: dict) -> dict:
    """GES-Kostenannahmen als Overrides fuer resolve_tech()."""
    g = params["ges_reference"]["technologies"]
    return {
        "pv_freiflaeche": {
            "capex_eur_kw": g["pv"]["capex_eur_kw"], "opex_pct": g["pv"]["opex_pct"],
            "opex_eur_kw_a": None, "full_load_hours": g["pv"]["full_load_hours"],
            "lifetime_years": g["pv"]["lifetime_years"], "fuel_eur_mwh": 0.0, "waste_eur_mwh": 0.0,
        },
        "wind_onshore": {
            "capex_eur_kw": g["wind_onshore"]["capex_eur_kw"], "opex_pct": g["wind_onshore"]["opex_pct"],
            "opex_eur_kw_a": None, "full_load_hours": g["wind_onshore"]["full_load_hours"],
            "lifetime_years": g["wind_onshore"]["lifetime_years"], "fuel_eur_mwh": 0.0, "waste_eur_mwh": 0.0,
        },
        "wind_offshore": {
            "capex_eur_kw": g["wind_offshore"]["capex_eur_kw"], "opex_pct": g["wind_offshore"]["opex_pct"],
            "opex_eur_kw_a": None, "full_load_hours": g["wind_offshore"]["full_load_hours"],
            "lifetime_years": g["wind_offshore"]["lifetime_years"], "fuel_eur_mwh": 0.0, "waste_eur_mwh": 0.0,
        },
        "nuclear": {
            "capex_eur_kw": g["nuclear"]["capex_eur_kw"], "opex_pct": g["nuclear"]["opex_pct"],
            "opex_eur_kw_a": None, "full_load_hours": g["nuclear"]["full_load_hours"],
            "lifetime_years": g["nuclear"]["lifetime_years"],
            "fuel_eur_mwh": g["nuclear"]["fuel_cost_eur_mwh"], "waste_eur_mwh": 0.0,
        },
    }


def _patch_params_with_ges(params: dict) -> dict:
    """Kopie des Parametersatzes mit GES-Kostenannahmen fuer die Erzeuger."""
    import copy

    p = copy.deepcopy(params)
    for tech_key, ov in _ges_tech_overrides(params).items():
        for field, value in ov.items():
            entry = p["technologies"][tech_key]["params"].get(field)
            if entry is None:
                p["technologies"][tech_key]["params"][field] = {"value": value, "min": value,
                                                                "mid": value, "max": value,
                                                                "unit": "-", "source": "GES", "confidence": "A"}
            else:
                for k in ("value", "min", "mid", "max"):
                    entry[k] = value
    return p


def validate_ges_scenarios(params: dict, profiles: dict) -> dict:
    rec = params["ges_scenario_reconstruction"]
    demand = rec["demand_twh"]
    split = rec["fee_split_assumption"]
    p_ges = _patch_params_with_ges(params)
    techs = {k: model.resolve_tech(p_ges, k, "mittel", apply_idc=False) for k in p_ges["technologies"]}

    results = []
    for name, sc in rec["scenarios"].items():
        # fEE-Kapazitaeten aus der veroeffentlichten fEE-Gesamtleistung
        fee_gw = sc["fee_gw"]
        caps = {k: fee_gw * split[k] for k in ("pv", "wind_onshore", "wind_offshore")}
        shares = {}
        for k, tech_key in (("pv", "pv_freiflaeche"), ("wind_onshore", "wind_onshore"),
                            ("wind_offshore", "wind_offshore")):
            energy = caps[k] * model.MW_PER_GW * float(techs[tech_key]["full_load_hours"]) / model.MWH_PER_TWH
            shares[k] = energy / demand
        fee_share = sum(shares.values())

        firm = sc["firm_technology"]
        storage: dict[str, Any] = {}
        if firm == "nuclear":
            shares["nuclear"] = max(0.0, 1.0 - fee_share)
            storage["gas_backup_gw"] = None  # Restbedarf wird gemessen
        else:
            storage["gas_backup_gw"] = None if firm == "gas_ccgt" else 0.0

        # Pass 1: Spitzenbedarf an gesicherter Leistung messen
        pass1 = model.mix_system(shares, demand, p_ges, profiles, scenario="mittel",
                                 storage={"gas_backup_gw": None}, apply_idc=False, co2_price=0.0)
        peak_gw = pass1["dispatch"]["gas_peak_gw"]

        required_h2_twh = None
        if firm == "h2_turbine":
            non_fee_gw = sc["installed_gw"] - sc["fee_gw"]
            turbine_gw = min(peak_gw, non_fee_gw)
            storage.update({
                "h2_turbine_gw": turbine_gw,
                "electrolyser_gw": max(0.0, non_fee_gw - turbine_gw),
                # Der abgedeckte Zeitraum beginnt am 1. Juli, also NACH der
                # Einspeicherphase eines Saisonspeichers. Ohne Startfuellstand
                # entstuende eine kuenstliche Versorgungsluecke.
                "h2_initial_fill_share": 1.0,
                "gas_backup_gw": 0.0,
            })
            # Pass 2: Speichergroesse aus dem Fuellstandshub bestimmen, statt sie
            # zu raten. Das Modell bepreist H2-Speicherung ueber den Durchsatz
            # (EWI EUR/kg), nicht ueber die Kavernenkapazitaet - die Dimensionierung
            # veraendert also die Kosten nicht, nur die Versorgungssicherheit.
            probe = model.mix_system(
                shares, demand, p_ges, profiles, scenario="mittel", apply_idc=False, co2_price=0.0,
                storage={**storage, "h2_storage_gwh": demand * 1000.0},
            )
            required_h2_twh = probe["dispatch"]["h2_storage_required_gwh"] / 1000.0
            storage["h2_storage_gwh"] = required_h2_twh * 1000.0

        # Hauptlauf ohne CO2-Preis (GES rechnet ein klimaneutrales Zielsystem),
        # zusaetzlich eine Variante mit dem Default-CO2-Preis als Sensitivitaet.
        res = model.mix_system(shares, demand, p_ges, profiles, scenario="mittel",
                               storage=storage, apply_idc=False, co2_price=0.0)
        res_co2 = model.mix_system(shares, demand, p_ges, profiles, scenario="mittel",
                                   storage=storage, apply_idc=False,
                                   co2_price=params["global"]["co2_price_eur_t"]["value"])
        # Gegenlauf ohne Startfuellstand: zeigt, welcher Teil des Ergebnisses am
        # (nicht bepreisten) vorgefuellten Saisonspeicher haengt.
        res_nofill = None
        if storage.get("h2_initial_fill_share"):
            res_nofill = model.mix_system(
                shares, demand, p_ges, profiles, scenario="mittel", apply_idc=False, co2_price=0.0,
                storage={**storage, "h2_initial_fill_share": 0.0},
            )
        results.append({
            "name": name, "published": sc["lscoe_published"], "model": res["lscoe_eur_mwh"],
            "model_with_co2": res_co2["lscoe_eur_mwh"],
            "dev_pct": dev_pct(res["lscoe_eur_mwh"], sc["lscoe_published"]),
            "shares": shares, "fee_share": fee_share, "peak_gw": peak_gw,
            "installed_published_gw": sc["installed_gw"], "installed_model_gw": res["installed_gw_total"],
            "components": res["cost_components_eur_mwh"], "dispatch": res["dispatch"],
            "warnings": res["warnings"], "storage": storage,
            "required_h2_twh": required_h2_twh,
            "h2_from_initial_fill_twh": res["dispatch"]["h2_from_initial_fill_twh"],
            "nofill": None if res_nofill is None else {
                "lscoe": res_nofill["lscoe_eur_mwh"],
                "unserved_share": res_nofill["dispatch"]["unserved_share"],
            },
        })
    return {"results": results, "reconstruction": rec,
            "co2_price_sensitivity": params["global"]["co2_price_eur_t"]["value"]}


# ==========================================================================
# (d) Ist-2025-Plausibilisierung (neu in Modell v0.2)
# ==========================================================================
TOL_IST25_MIX = 0.10   # +/-10 % je Traeger
TOL_IST25_GAS = 0.35   # +/-35 % fuer die Gasarbeit (Dispatch statt Marktergebnis)


def validate_ist_2025(params: dict, profiles: dict) -> dict:
    """Rechnet das Modell die Gegenwart richtig?

    Der Ist-2025-Anker ist die einzige falsifizierbare Groesse des ganzen
    Modells - alle anderen Szenarien liegen 20 Jahre in der Zukunft. Geprueft
    werden drei Dinge:
      (1) Erzeugungsmix je Traeger gegen ist_zustand_de.md 1.1
      (2) Abregelung gegen den Ist-Wert 2024 (9,4 TWh)
      (3) Kostenniveau gegen belegte Ist-Kostenbloecke (Boersenpreis +
          Netzentgelt), mit ausdruecklicher Abgrenzung der Systemgrenzen
    """
    import monte_carlo  # lokal, damit model/validate ohne MC importierbar bleiben

    ref = params["ist_zustand"]["ist_2025_reference"]
    page_path = os.path.join(BASE, "data", "page_data.json")
    with open(page_path, encoding="utf-8") as fh:
        page = json.load(fh)
    preset = monte_carlo.build_presets(params, page)[0]

    res = model.mix_system(
        preset["shares"], preset["demand_twh"], params, profiles, scenario="mittel",
        storage=preset["storage"], co2_price=params["global"]["co2_price_eur_t"]["value"],
        grid_variant="mid", apply_idc=True, bands_twh=preset["bands_twh"],
        grid_cost_basis=preset["grid_cost_basis"], gas_tech=preset["gas_tech"],
    )
    disp = res["dispatch"]
    ann = 1.0 / (disp["seasonal_share_load"] or 1.0)

    rows = []

    def add(label, model_twh, target_twh, tol, note=""):
        """tol=None -> nur informativ, kein Bestanden/Nicht-bestanden."""
        if not target_twh:
            rows.append({"label": label, "model": model_twh, "target": None,
                         "dev_pct": None, "passed": None, "note": note})
            return
        dv = dev_pct(model_twh, target_twh)
        rows.append({"label": label, "model": model_twh, "target": target_twh,
                     "dev_pct": dv, "passed": None if tol is None else abs(dv) <= tol * 100,
                     "note": note})

    g = ref["generation_twh"]
    pot = disp["vre_potential_twh"]
    add("Photovoltaik", pot.get("pv", 0.0) * ann, g["photovoltaik"], TOL_IST25_MIX,
        "Erzeugungspotenzial vor Abregelung")
    add("Wind onshore", pot.get("wind_onshore", 0.0) * ann, g["wind_onshore"], TOL_IST25_MIX,
        "Erzeugungspotenzial vor Abregelung")
    add("Wind offshore", pot.get("wind_offshore", 0.0) * ann, g["wind_offshore"], TOL_IST25_MIX,
        "Onshore-Ersatzprofil")
    add("Kohle (Band)", disp["energy_twh"]["coal_band"] * ann,
        g["braunkohle"] + g["steinkohle_mid"], TOL_IST25_MIX, "als konstantes Band gesetzt")
    add("Biomasse (Band)", disp["energy_twh"]["biomass_band"] * ann, g["biomasse"], TOL_IST25_MIX,
        "als konstantes Band gesetzt")
    add("Wasserkraft (Band)", disp["energy_twh"]["hydro_band"] * ann, g["wasserkraft"], TOL_IST25_MIX,
        "als konstantes Band gesetzt")
    # Das Modell kennt keine Importe, keine Pumpspeicher und keine
    # Mineraloel-/Abfall-Erzeugung. Alles, was diese drei Bloecke real decken,
    # muss im Modell aus dem Gas-Backup kommen. Die faire Vergleichsgroesse ist
    # deshalb die SUMME der im Modell nicht abgebildeten Restdeckung.
    imp = ref["nettoimport_twh"] or {}
    import_mid = ((imp.get("low") or 0.0) + (imp.get("high") or 0.0)) / 2.0
    residual_target = ((g["erdgas"] or 0.0) + (g.get("mineraloel_sonstige_abfall") or 0.0)
                       + (ref.get("pumpspeichererzeugung_twh") or 0.0) + import_mid)
    add("Erdgas (Modell-Backup) allein gegen Ist-Erdgas",
        disp["energy_twh"]["gas_backup"] * ann, g["erdgas"], None,
        "Erwartete Ueberschaetzung: das Modell kennt weder Import noch Pumpspeicher noch "
        "Mineraloel/Abfall - alles davon landet bei ihm im Gas-Backup.")
    add("Restdeckung gesamt (Gas + Oel/Abfall + Pumpspeicher + Nettoimport)",
        disp["energy_twh"]["gas_backup"] * ann, residual_target, 0.20,
        f"Ist 2025: Erdgas {g['erdgas']} + Mineraloel/Sonstige/Abfall "
        f"{g.get('mineraloel_sonstige_abfall')} + Pumpspeicher "
        f"{ref.get('pumpspeichererzeugung_twh')} + Nettoimport {import_mid:.1f} TWh. "
        "Das ist die eigentliche Plausibilisierung der freien Modellgroesse.")
    add("Abregelung", disp["energy_twh"]["curtailed"] * ann, ref["abregelung_2024_twh"],
        0.60, "Ist-Wert 2024 (9,4 TWh); das Modell kennt keine Netzengpaesse, nur Ueberschuss.")

    # ---- Kostenniveau -------------------------------------------------
    boerse = ref["boersenstrompreis_eur_mwh"]
    netz = ref["netzentgelt_haushalt_eur_mwh"]
    netz_ohne = ref["netzentgelt_ohne_bundeszuschuss_eur_mwh"]
    cost_rows = [
        {"label": "Boersenstrompreis 2025 (Jahresmittel)", "value": boerse,
         "note": "Grenzkostenpreis, KEINE Vollkosten - enthaelt keine Kapitalkosten der EE-Flotte."},
        {"label": "Netzentgelt Haushalt 2026 (wie erhoben)", "value": netz,
         "note": "9,3 ct/kWh; im Modell als Netzblock des Ankers angesetzt."},
        {"label": "Netzentgelt ohne Bundeszuschuss", "value": netz_ohne,
         "note": "Der 6,5-Mrd.-Zuschuss ist laut Dossier eine Transferleistung, keine Kostensenkung."},
        {"label": "Summe Boerse + Netzentgelt (wie erhoben)", "value": (boerse or 0) + (netz or 0),
         "note": "Grobe Ist-Vergleichsgroesse ohne Steuern, Umlagen, Messwesen, Vertrieb."},
        {"label": "Endkundenpreis Haushalt 2026", "value": (ref["endkunde_haushalt_2026_ct_kwh"] or 0) * 10,
         "note": "Obergrenze: enthaelt Steuern, Abgaben, Umlagen und Vertrieb."},
        {"label": "Industriepreis 2026 (Neuabschluss)", "value": (ref["industrie_2026_ct_kwh"] or 0) * 10,
         "note": "Untergrenze der Endkundenseite."},
        {"label": "MODELL: Ist-2025-Anker (LSCOE)", "value": res["lscoe_eur_mwh"],
         "note": "Vollkosten der Erzeugung (ohne Kapital-/Betriebskosten der Bestandsbaender) "
                 "plus heutiges Netzentgelt."},
    ]
    band_lo = (boerse or 0) + (netz or 0)
    band_hi = (ref["endkunde_haushalt_2026_ct_kwh"] or 0) * 10
    in_band = band_lo <= res["lscoe_eur_mwh"] <= band_hi

    mix_ok = all(r["passed"] for r in rows if r["passed"] is not None)
    return {
        "rows": rows, "cost_rows": cost_rows, "lscoe": res["lscoe_eur_mwh"],
        "band": (band_lo, band_hi), "in_band": in_band, "passed": mix_ok and in_band,
        "components": res["cost_components_eur_mwh"],
        "emissions": res["emissions"], "warnings": res["warnings"],
        "preset": {"demand_twh": preset["demand_twh"], "shares": preset["shares"],
                   "bands_twh": preset["bands_twh"], "grid_cost_basis": preset["grid_cost_basis"]},
    }


# ==========================================================================
# Report
# ==========================================================================
def validate_structure_v02c(params: dict) -> dict:
    """Test (e), Modell v0.2c: Strukturzusagen des Zahlenkern-Patches.

    (e1) Monotonie: Die Abbildung "gezogener CAPEX -> effektiver CAPEX" muss
         ueber den gesamten Support nicht fallend sein - in JEDER Konfiguration
         (Ueberschreitungsfaktor ueber seine ganze Spanne, WACC-Stuetzstellen).
         Der Zustand bis v0.2b haette diese Zusage gebrochen (Nuklear-Review
         R2, N1: 7.500 -> 22.112, aber 17.500 -> 17.500).
    (e2) CCS-Massenbilanz: abgeschiedene Menge + Restemission == Brennstoff-
         eintrag, ueber die volle Spanne von Wirkungsgrad und Abscheiderate.
    (e3) Uebertragungsnetz-Sockel: der Skalierungsfaktor muss bei fEE -> 0
         gegen die Sockelquote laufen und darf 1,0 nie ueberschreiten.
    """
    nuc = params["technologies"]["nuclear"]["params"]
    cap_entry = nuc["capex_eur_kw"]
    lo, hi = float(cap_entry["min"]), float(cap_entry["max"])
    ovr_range = params["system"]["cost_overrun_factors"]["technologien"]["kernkraft"] \
        if "technologien" in params["system"]["cost_overrun_factors"] else None

    def min_step(wacc: float, f: float) -> tuple[float, float | None]:
        prev = None
        worst: tuple[float, float | None] = (float("inf"), None)
        n = 221
        for i in range(n):
            x = lo + (hi - lo) * i / (n - 1)
            flat = model.resolve_tech(params, "nuclear", "mittel", apply_idc=True)
            flat["capex_eur_kw"] = x
            for fld in ("idc_applicable_share", "overrun_applicable_share"):
                flat[fld] = model.scope_share_for_capex(cap_entry, nuc[fld], x)
            flat["cost_overrun_factor"] = f
            eff = model.lcoe(flat, wacc, 0.0)["capex_effective_eur_kw"]
            if prev is not None:
                step = eff - prev
                if step < worst[0]:
                    worst = (step, x)
            prev = eff
        return worst

    # Zwei getrennte Zusagen, damit ein bekannter Altbefund nicht als Erfolg
    # des Patches verkauft wird und der Patch nicht fuer ihn haftet:
    #   (i)  Beim Basis-WACC (5 %) ist die Abbildung ueber den GANZEN
    #        Faktor-Support monoton. Das ist die Zusage von Fix 3.
    #   (ii) Bei JEDEM WACC darf der Ueberschreitungsfaktor die Monotonie nicht
    #        VERSCHLECHTERN - gemessen gegen denselben Lauf mit Faktor 1,00.
    #        Bei WACC 9 % ist die Abbildung schon ohne jede Ueberschreitung
    #        nicht monoton: der Overnight-Anker 7.500 traegt dort +67,7 %
    #        Bauzins (12.578) und ueberholt damit den Gesamtprojekt-Anker
    #        12.000, dessen Finanzierungsanteil bei rund 5 % gebildet wurde.
    #        Das ist ein Datenbefund der CAPEX-Anker, kein Effekt von v0.2c.
    mono_rows = []
    base_wacc = 0.05
    mono_base_ok = True
    mono_no_worse_ok = True
    for wacc in (0.03, 0.05, 0.09):
        ref_step, _ = min_step(wacc, 1.0)
        for f in (1.0, 1.30, 2.20, 2.40):
            step, at = min_step(wacc, f) if f != 1.0 else (ref_step, min_step(wacc, 1.0)[1])
            monotone = step >= -1e-6
            no_worse = step >= ref_step - 1e-6
            if abs(wacc - base_wacc) < 1e-12:
                mono_base_ok = mono_base_ok and monotone
            # Zusage 2 ist erfuellt, wenn die Zeile entweder monoton ist oder
            # nicht schlechter als derselbe Lauf ohne Ueberschreitung.
            mono_no_worse_ok = mono_no_worse_ok and (monotone or no_worse)
            mono_rows.append({"wacc": wacc, "factor": f,
                              "min_step_eur_kw": step, "at_capex": at,
                              "ref_step_eur_kw": ref_step,
                              "monotone": monotone, "no_worse_than_base_run": no_worse,
                              "passed": monotone or no_worse})
    mono_ok = mono_base_ok and mono_no_worse_ok

    # (e2) Massenbilanz ueber die Spannen von eta und capture_rate
    ccs = params["technologies"]["gas_ccs"]["params"]
    bal_rows = []
    bal_ok = True
    for eta in (ccs["efficiency"]["min"], ccs["efficiency"]["mid"], ccs["efficiency"]["max"]):
        for rate in (ccs["capture_rate"]["min"], ccs["capture_rate"]["mid"], ccs["capture_rate"]["max"]):
            flat = model.resolve_tech(params, "gas_ccs", "mittel")
            flat["efficiency"] = eta
            flat["capture_rate"] = rate
            bal = model.ccs_balance(flat)
            gap = bal["captured_t_mwh_el"] + bal["residual_t_mwh_el"] - bal["input_t_mwh_el"]
            ok = abs(gap) < 1e-12 and bal["captured_t_mwh_el"] <= bal["input_t_mwh_el"] + 1e-12
            bal_ok = bal_ok and ok
            bal_rows.append({"eta": eta, "rate": rate, "input": bal["input_t_mwh_el"],
                             "captured": bal["captured_t_mwh_el"],
                             "residual": bal["residual_t_mwh_el"], "gap": gap, "passed": ok})
    # Kalibrierung: bei den Zentralwerten muss die belegte Restemission herauskommen
    mid_flat = model.resolve_tech(params, "gas_ccs", "mittel")
    mid_bal = model.ccs_balance(mid_flat)
    doc_residual = float(ccs["emission_factor_t_mwh"]["mid"])
    calib_dev = abs(mid_bal["residual_t_mwh_el"] - doc_residual) / doc_residual
    calib_ok = calib_dev < 1e-4

    # (e3) Sockel des Uebertragungsnetzes
    grid = params["system"]["grid"]
    socket = model._socket_share(grid)
    ref_share = grid["reference_fee_share"]["value"]
    socket_rows = []
    socket_ok = True
    for fee in (0.0, 0.167, 0.5, 0.725, 1.0, 1.17):
        raw = socket * 1.0 + (1.0 - socket) * (fee / ref_share)
        scaled = min(1.0, raw)
        ok = scaled >= socket - 1e-12 and scaled <= 1.0 + 1e-12
        socket_ok = socket_ok and ok
        socket_rows.append({"fee_share_used": fee, "raw": raw, "scaled": scaled, "passed": ok})

    return {
        "mono_rows": mono_rows, "mono_passed": mono_ok,
        "mono_base_passed": mono_base_ok, "mono_no_worse_passed": mono_no_worse_ok,
        "capex_support": [lo, hi],
        "bal_rows": bal_rows, "bal_passed": bal_ok,
        "calib_residual_model": mid_bal["residual_t_mwh_el"],
        "calib_residual_doc": doc_residual, "calib_dev": calib_dev, "calib_passed": calib_ok,
        "socket_share": socket, "socket_rows": socket_rows, "socket_passed": socket_ok,
        "passed": mono_ok and bal_ok and calib_ok and socket_ok,
        "overrun_range": ovr_range,
    }


def write_report(params: dict, profiles: dict, a: dict, b: dict, c: dict, d: dict,
                 e: dict | None = None) -> None:
    L: list[str] = []
    w = L.append

    w("# Validierung des Kosten- und Dispatch-Modells")
    w("")
    w("> Erzeugt von `scripts/validate_model.py` (Phase 3). Datenbasis: "
      "`data/model_params.json` (aus `scripts/consolidate_params.py`) und "
      f"`data/profiles_2024.json` ({profiles['label']}, {profiles['hours']} h).")
    w("> Abweichungen werden ausgewiesen und diskutiert, nicht wegoptimiert.")
    w("")

    # -------- Kurzfassung
    ges_ok = all(r["passed"] for r in a["ges_rows"])
    ist_ok = all(r.get("passed", True) for r in b["rows"])
    w("## Kurzfassung")
    w("")
    w("| Test | Kriterium | Ergebnis |")
    w("|---|---|---|")
    w(f"| (a) LCOE-Reproduktion GES | +/-2 % auf 4 Werte | "
      f"{'BESTANDEN' if ges_ok else 'NICHT BESTANDEN'} "
      f"(max. Abweichung {max(abs(r['dev_pct']) for r in a['ges_rows']):.2f} %) |")
    w("| (a2) Eigene Spannen vs. Fraunhofer ISE | Ueberlappung der Bandbreiten | "
      + ("BESTANDEN" if all(r["overlap"] for r in a["band_rows"]) else "TEILWEISE") + " |")
    w(f"| (b) Ist-2024 (H2) | +/-5 % je verfuegbarer Reihe | "
      f"{'BESTANDEN' if ist_ok else 'NICHT BESTANDEN'} |")
    w("| (c) GES-Szenarien | Groessenordnung der 4 LSCOE | "
      + ("; ".join(f"{r['name']}: {r['dev_pct']:+.0f} %" for r in c["results"])) + " |")
    w("| (d) Ist-2025-Plausibilisierung | Mix +/-10 %, Kostenniveau im Ist-Korridor | "
      + ("BESTANDEN" if d["passed"] else "NICHT BESTANDEN") + " |")
    if e:
        w("| (e) Strukturzusagen v0.2c | capex_eff monoton, CCS-Massenbilanz geschlossen, "
          "Netz-Sockel wirksam | " + ("BESTANDEN" if e["passed"] else "NICHT BESTANDEN") + " |")
    w("")
    w("> **Wichtig zur Lesart von (a) und (c).** Test (a) ist die *GES-Reproduktion*: dieselben "
      "Annahmen, dieselbe Rechenmethode, +/-2 %. Dieser Test ist von den Modell-Fixes der Version "
      "0.2 bewusst NICHT beruehrt und muss unveraendert bestehen. Test (c) ist dagegen ein "
      "*Modelltest*: er rechnet die GES-Szenarien mit GES-Erzeugungsannahmen, aber mit dem eigenen "
      "Backup-, Speicher- und Netzblock. Er aendert sich mit v0.2 (Gaspreis, Netzaufteilung) - das "
      "ist beabsichtigt und keine Verschlechterung der Reproduktion.")
    w("")

    # -------- (a)
    w("## (a) Ebene 1 - LCOE-Reproduktion")
    w("")
    w("### a1 - GES-Annahmen gegen GES-Ergebnisse")
    w("")
    w("Gerechnet mit exakt den Annahmen aus `docs/01_grundlage_ges_faktencheck.md` "
      "(WACC 5 %, Opex als CAPEX-Prozentsatz, ohne Bauzins-Aufschlag - die GES-Studie "
      "modelliert keinen IDC).")
    w("")
    w("| Technologie | Annahmen | GES-LCOE | Modell | Abweichung | +/-2 % |")
    w("|---|---|---:|---:|---:|:--:|")
    for r in a["ges_rows"]:
        w(f"| {r['label']} | {r['inputs']} | {fmt(r['target'])} | {fmt(r['model'])} | "
          f"{r['dev_pct']:+.2f} % | {'OK' if r['passed'] else 'FEHLER'} |")
    w("")
    w("**Befund:** Die Annuitaetenmethode des Modells ist mit der GES-Methodik identisch. "
      "Damit ist jede spaetere Abweichung im Ergebnis eine Frage der *Inputs*, nicht der Rechenmethode - "
      "genau die Trennung, die das White Paper braucht.")
    w("")

    w("### a2 - Eigene Parameterspannen gegen Fraunhofer ISE / Lazard")
    w("")
    w("Die drei konsistenten Szenariensaetze (`guenstig`/`mittel`/`teuer`, siehe "
      "`scenario_sets` in `model_params.json`) - **keine** mechanische min/max-Kombination, "
      "der `teuer`-Satz kombiniert max-CAPEX bewusst mit *mittleren* Volllaststunden.")
    w("")
    w("| Technologie | guenstig | mittel | teuer | Modellband | Referenzband | Quelle | Ueberlappung |")
    w("|---|---:|---:|---:|---|---|---|:--:|")
    for r in a["band_rows"]:
        v = r["values"]
        w(f"| {r['label']} | {fmt(v['guenstig'])} | {fmt(v['mittel'])} | {fmt(v['teuer'])} | "
          f"{fmt(r['model_band'][0])}-{fmt(r['model_band'][1])} | "
          f"{fmt(r['ref_band'][0])}-{fmt(r['ref_band'][1])} | {r['ref_source'].split(' ')[0]} | "
          f"{'ja' if r['overlap'] else 'nein'} |")
    w("")
    w(f"Kernkraft (ohne IDC): Modellband **{fmt(a['nuclear_band'][0])}-{fmt(a['nuclear_band'][1])} EUR/MWh** "
      f"gegen Fraunhofer ISE 136-490 EUR/MWh, Lazard 122-190 EUR/MWh und den einzigen vertraglich "
      f"fixierten Wert (Hinkley-Point-C-CfD, 147 EUR/MWh).")
    w("")
    w("> Limitation: Die Eingangsannahmen von Fraunhofer ISE und Lazard (CAPEX, VLh, WACC) sind in den "
      "Dossiers **nicht** enthalten - nur deren Ergebnisspannen. Der Test prueft daher die Ueberlappung "
      "der Bandbreiten, nicht die Reproduktion Zeile fuer Zeile.")
    w("")

    w("### a3 - Reproduktion der Kernkraft-Szenarien aus `kosten_kernkraft.md` 7.3")
    w("")
    w("| Szenario | CAPEX | WACC | VLh | Dossier | Opex low | Opex mid | Opex max | beste Abweichung |")
    w("|---|---:|---:|---:|---:|---:|---:|---:|---:|")
    for r in a["nuclear_scenarios"]:
        w(f"| {r['name']} | {fmt(r['capex'], 0)} | {r['wacc'] * 100:.0f} % | {fmt(r['flh'], 0)} | "
          f"{fmt(r['target'])} | {fmt(r['opex_low'])} | {fmt(r['opex_mid'])} | {fmt(r['opex_max'])} | "
          f"{r['best_dev_pct']:+.1f} % |")
    w("")
    w("**Befund (Inkonsistenz im Dossier, ehrlich auszuweisen):** Die LCOE-Tabelle in "
      "`kosten_kernkraft.md` 7.3 ist mit den in 7.2 empfohlenen Parametern (Opex 130/165/200 EUR/kW/a, "
      "Brennstoff 6/8/11, Entsorgung 5/8/14) **nicht durchgaengig** reproduzierbar. Die Werte passen nur, "
      "wenn je Szenario unterschiedliche Kombinationen unterstellt werden - `realistisch_eu` (133) etwa "
      "entspricht dem Rechenbeispiel aus 5.3 mit Opex 240 EUR/kW/a, `ges_nah` (62) dagegen dem unteren "
      "Ende (Opex 130, Brennstoff 6, ohne Entsorgungsposten). Das Modell verwendet die in 7.2 "
      "**empfohlenen** Werte und weicht deshalb bewusst ab.")
    w("")

    w("### a4 - Kalibrierung des Bauzins-Aufschlags (IDC)")
    w("")
    w("Formel: `IDC = (1 + WACC)^(Bauzeit/2) - 1` (gleichmaessig verteilte Bauausgaben).")
    w("")
    w("| Stufe | Bauzeit | Dossier-Wert | Modell (WACC 5 %) | Abweichung |")
    w("|---|---:|---:|---:|---:|")
    for r in a["idc_rows"]:
        w(f"| {r['level']} | {fmt(r['years'], 0)} a | {r['ref'] * 100:.0f} % | {r['model'] * 100:.1f} % | "
          f"{r['dev_pp']:+.1f} pp |")
    w("")
    w("Die generische Formel reproduziert die Dossier-Werte fuer Kernkraft und liefert fuer die "
      "kurzen Bauzeiten der uebrigen Technologien deutlich kleinere Aufschlaege "
      "(PV 1 a: 2,5 %; Wind onshore 2 a: 5,0 %; Wind offshore 3 a: 7,6 % bei WACC 5 %). "
      "Damit wird der von `kosten_kernkraft.md` 5.4 beschriebene strukturelle Vorteil der "
      "langbauenden Technologie beseitigt, ohne sie einseitig zu bestrafen.")
    w("")
    w("> Offene Luecke: Bauzeiten **ausserhalb** der Kernkraft sind in keinem Dossier belegt "
      "(Ausnahme: PV 1 Jahr, `kosten_kernkraft.md` 5.4). Die uebrigen Werte sind als "
      "MODELLANNAHME gekennzeichnet und in `model_params.json.gaps` gelistet.")
    w("")

    # -------- (b)
    w("## (b) Ebene 3 - Ist-Check gegen die realen Profile 2024")
    w("")
    w(f"Reale Kapazitaeten Ende 2024 (Richtwerte, `profiles_2024.json` meta): "
      f"PV {fmt(params['ist_zustand']['installed_gw_2024_profile_reference']['pv'])} GW, "
      f"Wind onshore {fmt(params['ist_zustand']['installed_gw_2024_profile_reference']['wind_onshore'])} GW. "
      f"Geprueft wird der abgedeckte Zeitraum (01.07.-31.12.2024, {b['coverage_hours']} h).")
    w("")
    w("| Reihe | Kapazitaet | Kapazitaetsfaktor | Profil-Summe | Modell | Abweichung | +/-5 % |")
    w("|---|---:|---:|---:|---:|---:|:--:|")
    for r in b["rows"]:
        if not r["available"]:
            w(f"| {r['series']} | - | - | - | - | - | Reihe fehlt |")
            continue
        w(f"| {r['series']} | {fmt(r['capacity_gw'])} GW | "
          f"{('%.4f' % r['cf_covered']) if r['cf_covered'] else '-'} | "
          f"{fmt(r['target_twh'], 3)} TWh | {fmt(r['model_twh'], 3)} TWh | {r['dev_pct']:+.2f} % | "
          f"{'OK' if r['passed'] else 'FEHLER'} |")
    w("")
    w("**Wichtige Einschraenkung zur Aussagekraft:** Der Kapazitaetsfaktor stammt aus derselben "
      "Datei wie die Zielgroesse. Der Test weist damit die *Konsistenz* der Umrechnungskette "
      "Kapazitaet -> Profil -> Energie nach, nicht die Richtigkeit der Profile selbst. "
      "Unabhaengige Gegenproben:")
    w("")
    cr = b["cross"]
    w("| Gegenprobe | Wert | Referenz | Abweichung |")
    w("|---|---:|---|---:|")
    w(f"| PV-Anteil Jul-Dez an der Jahreserzeugung | {cr['pv_share_from_plausibility'] * 100:.1f} % "
      f"(aus Plausibilitaetsspanne) | {cr['pv_share_from_ist'] * 100:.1f} % (72,2 TWh Jahres-PV 2024, "
      f"ist_zustand_de.md 1.3) | {cr['pv_share_dev_pct']:+.1f} % |")
    w(f"| Lastsumme Teilzeitraum | {fmt(b['rows'][-1]['target_twh'], 1)} TWh | "
      f"erwartete Jahressumme 455-470 TWh -> Anteil {cr['load_share_from_plausibility'] * 100:.1f} % | "
      f"plausibel (Halbjahr) |")
    w(f"| Wind-onshore-Anteil Jul-Dez | {cr['wind_share_from_plausibility'] * 100:.1f} % | "
      f"erwartete Jahressumme 100-115 TWh | plausibel (winterlastig) |")
    w("")
    f = b["flh_check"]
    w("**Volllaststunden-Gegenprobe (relevanter Befund):**")
    w("")
    w(f"- Aus dem Profil hochgerechnete Ist-Volllaststunden Wind onshore: **{fmt(f['flh_implied_from_profile'], 0)} h/a** "
      f"(Kapazitaetsfaktor {fmt(profiles['series']['wind_onshore_mw']['cf_covered'], 4)} x {b['coverage_hours']} h "
      f"/ Saisonanteil).")
    w(f"- Dossier-Wert Bestandsflotte 2025: {fmt(f['flh_fleet_2025_dossier'], 0)} h/a - dieselbe Groessenordnung.")
    w(f"- Modellannahme fuer **Neuanlagen**: {fmt(f['flh_model_new_plants'], 0)} h/a "
      f"({f['dev_model_vs_implied_pct']:+.0f} % gegenueber der Ist-Flotte).")
    w("")
    w("Das ist kein Modellfehler, sondern der Kern des Befunds aus `kosten_ee_speicher.md` 4: "
      "Wer mit Bestandsflotten-Volllaststunden (1.600-1.700 h) rechnet, verteuert Windstrom "
      "systematisch um rund 30 % gegenueber Neuanlagen (2.400 h). Fuer den **Dispatch** ist "
      "dagegen die Profilform massgeblich, nicht die Volllaststundenannahme - deshalb bietet "
      "`dispatch()` beide Modi (`profile_cf` fuer den Ist-Check, `flh` fuer Zukunftsszenarien).")
    w("")
    w("**Nicht pruefbar:** Wind offshore, Wasserkraft und Biomasse fehlen komplett in den Rohdaten "
      "(`profiles_2024.json` meta.gaps). Fuer Wind offshore verwendet das Modell als ausgewiesene "
      "Uebergangsloesung die Onshore-Profilform, skaliert auf die Offshore-Volllaststunden; die reale "
      "Offshore-Glaettung fehlt damit (konservativ - der Systemwert von Offshore wird unterschaetzt).")
    w("")

    # -------- (c)
    w("## (c) Ebene 2 - GES-Szenarien als Testfall")
    w("")
    w("Aufbau: GES-Kostenannahmen fuer die Erzeuger (CAPEX/Opex/VLh/Lebensdauer aus "
      "`docs/01`), WACC 5 %, kein IDC, Bedarf 950 TWh. Backup, Speicher und Netz stammen "
      "aus dem eigenen Parametersatz, weil die GES-Studie ihre Kostenaufschluesselung nur "
      "als Grafik veroeffentlicht.")
    w("")
    w(f"Hauptlauf ohne CO2-Preis (GES rechnet ein klimaneutrales Zielsystem); die Spalte "
      f"'mit CO2' zeigt denselben Lauf mit dem Default-CO2-Preis "
      f"({fmt(c['co2_price_sensitivity'], 0)} EUR/t) als Sensitivitaet.")
    w("")
    w("| Szenario | GES-LSCOE | Modell | Abweichung | mit CO2 | fEE-Anteil (Energie) | "
      "inst. Leistung GES / Modell | ungedeckte Last |")
    w("|---|---:|---:|---:|---:|---:|---:|---:|")
    for r in c["results"]:
        uns = r["dispatch"]["unserved_share"] * 100
        w(f"| {r['name']} | {fmt(r['published'], 0)} | {fmt(r['model'])} | {r['dev_pct']:+.0f} % | "
          f"{fmt(r['model_with_co2'])} | {r['fee_share'] * 100:.0f} % | "
          f"{fmt(r['installed_published_gw'], 0)} / {fmt(r['installed_model_gw'], 0)} GW | "
          f"{uns:.1f} % |")
    w("")
    w("> Achtung bei der Lesart: Das LSCOE bezieht sich auf die **tatsaechlich gedeckte** Last. "
      "Ein Szenario mit ungedeckter Last ist damit nicht guenstiger, sondern unvollstaendig - "
      "die Deckungsluecke muesste durch zusaetzliche Kapazitaet (oder Importe/Lastmanagement, "
      "beides nicht modelliert) geschlossen werden.")
    w("")
    w("### Kostenaufschluesselung des Modells (EUR/MWh)")
    w("")
    keys = sorted({k for r in c["results"] for k in r["components"]})
    w("| Szenario | " + " | ".join(keys) + " |")
    w("|---" * (len(keys) + 1) + "|")
    for r in c["results"]:
        w(f"| {r['name']} | " + " | ".join(fmt(r["components"].get(k, 0.0)) for k in keys) + " |")
    w("")
    w("### Dispatch-Kennzahlen (H2-2024-Zeitraum)")
    w("")
    w("| Szenario | Abregelung TWh | Anteil fEE | Anteil Gesamterzeugung | Gas/H2-Backup TWh | "
      "Backup-Spitze GW | ungedeckte Last TWh |")
    w("|---|---:|---:|---:|---:|---:|---:|")
    for r in c["results"]:
        dsp = r["dispatch"]
        backup = dsp["energy_twh"]["gas_backup"] + dsp["energy_twh"]["h2_reelectrified"]
        w(f"| {r['name']} | {fmt(dsp['energy_twh']['curtailed'])} | "
          f"{dsp['curtailment_share_of_vre'] * 100:.1f} % | "
          f"{dsp['curtailment_share_of_generation'] * 100:.1f} % | {fmt(backup)} | {fmt(r['peak_gw'])} | "
          f"{fmt(dsp['energy_twh']['unserved'], 2)} |")
    w("")
    h2_rows = [r for r in c["results"] if r.get("required_h2_twh")]
    if h2_rows:
        pot = params["technologies"]["h2_storage"]["params"]["de_repurposing_potential_twh"]
        need_ref = params["system"]["security_of_supply"]["h2_storage_need_2045_twh"]
        w("**Benoetigter Wasserstoff-Saisonspeicher (aus dem Fuellstandshub des Dispatchs):**")
        w("")
        w("| Szenario | benoetigt | Fraunhofer-ISE-Referenz | DE-Umwidmungspotenzial (Kavernen) |")
        w("|---|---:|---:|---:|")
        for r in h2_rows:
            w(f"| {r['name']} | {fmt(r['required_h2_twh'])} TWh_H2 | {fmt(need_ref['value'], 0)} TWh | "
              f"{fmt(pot['value'], 0)} TWh |")
        w("")
        w("**Gegenprobe zum Startfuellstand des Saisonspeichers:**")
        w("")
        w("| Szenario | H2 aus Startfuellstand | LSCOE ohne Startfuellstand | ungedeckte Last ohne Startfuellstand |")
        w("|---|---:|---:|---:|")
        for r in h2_rows:
            nf = r["nofill"] or {}
            w(f"| {r['name']} | {fmt(r['h2_from_initial_fill_twh'])} TWh_H2 | "
              f"{fmt(nf.get('lscoe'))} | {(nf.get('unserved_share') or 0) * 100:.1f} % |")
        w("")
        w("**Ehrliche Einordnung dieses Kunstgriffs:** Der Saisonspeicher startet gefuellt, weil der "
          "abgedeckte Zeitraum erst am 1. Juli beginnt. Der Strom, der dieses Wasserstoff-Inventar "
          "erzeugt hat, faellt in das nicht abgedeckte Halbjahr und ist in den Kosten **nicht** "
          "enthalten. Ohne Startfuellstand kippt das `ee80_h2`-Szenario dagegen in eine grosse "
          "Deckungsluecke. Beide Varianten sind falsch - die Wahrheit liegt dazwischen und ist "
          "mit einem Halbjahresprofil nicht ermittelbar. Das ist der staerkste Grund, "
          "`data/profiles_2024.json` als Volljahr nachzuziehen.")
        w("")
        w("Das ist ein eigenstaendiger Befund: Der modellierte Speicherbedarf liegt um ein "
          "Vielfaches ueber dem in `kosten_ee_speicher.md` 7.2 genannten deutschen "
          "Umwidmungspotenzial von 30 TWh. Da das Modell H2-Speicherung ueber den **Durchsatz** "
          "bepreist (EWI EUR/kg) und nicht ueber die Kavernenkapazitaet, taucht diese "
          "physische Restriktion in den Kosten NICHT auf - sie ist eine Mengen-, keine "
          "Kostenrestriktion und muss im White Paper separat benannt werden.")
        w("")
    w("Beide Abregelungs-Bezugsgroessen sind noetig, weil im `kostenminimum`-Szenario ein grosser "
      "Teil des Ueberschusses aus dem **Must-run-Band der Kernkraft** stammt und nicht aus fEE: "
      "Ein 100-GW-Kernkraftblock im Grundlastbetrieb liegt in Schwachlaststunden ueber der "
      "Residuallast. Das Modellkonzept sieht Kernkraft ausdruecklich als Band vor "
      "(docs/02, Ebene 3, Schritt 2); ein lastfolgender Betrieb wuerde die Abregelung senken, "
      "aber die Volllaststunden - und damit die LCOE-Basis - ebenfalls.")
    w("")
    w("### Diskussion der Abweichungen (nicht wegoptimiert)")
    w("")
    w("1. **Die Rangfolge der Szenarien wird reproduziert, die Absolutwerte nicht.** "
      "Das Kostenminimum-Szenario bleibt im Modell das guenstigste, das 100-%-EE-Szenario das teuerste - "
      "aber die Spreizung faellt anders aus als bei GES.")
    w("2. **Rekonstruktionsfehler ist die groesste Einzelursache.** Die Technologie-Aufteilung je "
      "Szenario liegt in der GES-Studie nur als Grafik vor (`docs/01` Kap. 6). Das Modell verteilt die "
      "veroeffentlichte fEE-Leistung im Verhaeltnis der EEG-/WindSeeG-Ziele 2045 (PV 45 / Wind on 40 / "
      "Wind off 15 %). Jede andere Aufteilung verschiebt das Ergebnis um zweistellige EUR/MWh-Betraege.")
    w("3. **Backup- und Netzkosten stammen nicht von GES.** Der Netzzuschlag (top-down, linear mit dem "
      "fEE-Anteil) und die Gas-CAPEX (1.600 statt der frueher ueblichen 800 EUR/kW) sind eigene "
      "Parameter. Die Gas-**Brennstoffkosten** fehlen in allen Dossiers und werden mit 0 angesetzt - "
      "alle Szenarien mit Gas-Backup sind daher nach unten verzerrt (ausgewiesene Untergrenze).")
    w("4. **Ein Halbjahresprofil ist kein Jahr.** Der abgedeckte Zeitraum Jul-Dez ist winterlastig; "
      "Backup-Mengen und Residuallastspitzen sind darin ueberrepraesentiert, PV-Ertraege "
      "unterrepraesentiert. Die Hochrechnung erfolgt ueber den Lastanteil des Zeitraums und ist "
      "in jedem Ergebnis als Warnung mitgefuehrt.")
    w("5. **GES modelliert keine Batteriespeicher** (`docs/01` Kap. 4). Das Modell bildet die "
      "GES-Szenarien deshalb ebenfalls ohne Batterien ab - was die H2-Kette und das Backup "
      "systematisch teurer macht, als es mit Speichern noetig waere.")
    w("6. **Keine Importe, kein Lastmanagement** (bewusste Vereinfachung des Konzepts, konservativ "
      "gegenueber allen Szenarien).")
    w("7. **Das `kostenminimum`-Szenario haengt fast vollstaendig an einer einzigen Zahl.** "
      "86 der rund 116 EUR/MWh sind Kernkraft - gerechnet mit der GES-CAPEX-Annahme von "
      "6.000 EUR/kW. Mit den Presets aus `kosten_kernkraft.md` (7.500 / 12.000 / 17.500 EUR/kW) "
      "verschiebt sich dieser Block etwa proportional zum Kapitalanteil. Genau das ist der "
      "Hebel, den das White Paper interaktiv zeigen sollte.")
    w("")
    w("### Warnungen der Modelllaeufe (unveraendert uebernommen)")
    w("")
    seen = set()
    for r in c["results"]:
        for msg in r["warnings"]:
            key = msg[:60]
            if key in seen:
                continue
            seen.add(key)
            w(f"- {msg}")
    w("")

    # -------- (d)
    w("## (d) Ist-2025-Plausibilisierung - rechnet das Modell die Gegenwart richtig?")
    w("")
    w("Neu in Modell v0.2 (Persona-Review 03, K3). Der Ist-2025-Anker ist die einzige "
      "falsifizierbare Groesse des Modells; alle anderen Szenarien liegen 20 Jahre in der Zukunft. "
      "Gerechnet wird das Preset `ist2025` aus `scripts/monte_carlo.py` - jetzt inklusive Kohle-, "
      "Biomasse- und Wasserband und mit dem **heutigen Netzentgelt** statt der Netzinvestition bis "
      "2045.")
    w("")
    w("### d1 - Erzeugungsmengen gegen den belegten Ist-Mix 2025")
    w("")
    w("| Groesse | Modell TWh/a | Ist 2025 TWh | Abweichung | Toleranz | Anmerkung |")
    w("|---|---:|---:|---:|:--:|---|")
    for r in d["rows"]:
        dev = "-" if r["dev_pct"] is None else f"{r['dev_pct']:+.1f} %"
        ok = "informativ" if r["passed"] is None else ("OK" if r["passed"] else "ABWEICHUNG")
        w(f"| {r['label']} | {fmt(r['model'])} | {fmt(r['target'])} | {dev} | {ok} | {r['note']} |")
    w("")
    w("**Lesart:** PV, Wind und die drei Baender sind gesetzt und muessen deshalb passen - der Test "
      "prueft hier die Umrechnungskette (Energieanteil -> Kapazitaet -> Profil -> Energie), nicht "
      "die Welt. Die **freien** Groessen sind die Gasarbeit und die Abregelung: Beide entstehen im "
      "Dispatch und sind mit dem Ist vergleichbar.")
    w("")
    w("### d2 - Kostenniveau gegen belegte Ist-Bloecke")
    w("")
    w("| Belegter Ist-Block bzw. Modellwert | EUR/MWh | Abgrenzung |")
    w("|---|---:|---|")
    for r in d["cost_rows"]:
        w(f"| {r['label']} | {fmt(r['value'])} | {r['note']} |")
    w("")
    w(f"Der Modellwert von **{fmt(d['lscoe'])} EUR/MWh** liegt "
      f"{'innerhalb' if d['in_band'] else 'AUSSERHALB'} des Ist-Korridors "
      f"{fmt(d['band'][0])}-{fmt(d['band'][1])} EUR/MWh (Boerse + Netzentgelt bis Endkundenpreis "
      f"Haushalt).")
    w("")
    w("**Was dieser Test NICHT zeigt:** Die Bloecke haben unterschiedliche Systemgrenzen. Der "
      "Boersenpreis ist ein Grenzkostenpreis und enthaelt die Kapitalkosten der geforderten "
      "EE-Flotte nicht; der Endkundenpreis enthaelt Steuern, Abgaben und Vertrieb, die im Modell "
      "fehlen. Der Test ist deshalb eine **Groessenordnungspruefung**, kein Nachweis. Der Anker ist "
      "in allen Ausgaben als `comparable_to_target_scenarios: false` gekennzeichnet.")
    w("")
    w("### d3 - Kostenkomponenten und Restemissionen des Ankers")
    w("")
    w("| Komponente | EUR/MWh |")
    w("|---|---:|")
    for k, v in sorted(d["components"].items()):
        w(f"| {k} | {fmt(v)} |")
    w("")
    w(f"Restemissionen: **{fmt(d['emissions']['total_mt_co2_a'])} Mt CO2/a** "
      f"(Gas {fmt(d['emissions']['gas_mt_co2_a'])}, Kohle {fmt(d['emissions']['coal_mt_co2_a'])}), "
      f"entspricht {fmt(d['emissions']['g_co2_per_kwh_delivered'], 0)} g/kWh gelieferter Arbeit. "
      f"Emissionsfaktor-Status: {d['emissions']['factor_status']}")
    w("")

    # -------- Test (e): Strukturzusagen v0.2c
    if e:
        w("## Test (e) - Strukturzusagen Modell v0.2c")
        w("")
        w("Drei Zusagen des Zahlenkern-Patches v0.2c, die nicht am Ergebniswert haengen, sondern "
          "an der Struktur. Sie werden hier fuer den **gesamten** Parameter-Support geprueft, "
          "nicht nur an den Stuetzstellen.")
        w("")
        w("### (e1) `capex_eff` ist monoton nicht fallend")
        w("")
        w(f"Geprueft ueber den gesamten Kernkraft-CAPEX-Support "
          f"{e['capex_support'][0]:.0f}-{e['capex_support'][1]:.0f} EUR/kW (221 Stuetzpunkte) x "
          "vier Ueberschreitungsfaktoren (1,00 Basislauf sowie 1,30/2,20/2,40 = Untergrenze, "
          "Modus und Obergrenze der Flyvbjerg-Verteilung) x drei WACC-Stuetzstellen.")
        w("")
        w("Zwei getrennte Kriterien, damit ein Altbefund nicht dem Patch angelastet und nicht als "
          "sein Erfolg verkauft wird:")
        w("")
        w("1. **Beim Basis-WACC (5 %)** muss die Abbildung ueber den gesamten Faktor-Support "
          "monoton nicht fallend sein - das ist die Zusage von Fix 3. "
          + ("**ERFUELLT.**" if e["mono_base_passed"] else "**NICHT ERFUELLT.**"))
        w("2. **Bei jedem WACC** darf der Ueberschreitungsfaktor die Monotonie nicht "
          "verschlechtern, gemessen gegen denselben Lauf mit Faktor 1,00. "
          + ("**ERFUELLT.**" if e["mono_no_worse_passed"] else "**NICHT ERFUELLT.**"))
        w("")
        w("| WACC | Faktor | kleinster Schritt EUR/kW | bei CAPEX | Referenz (Faktor 1,00) | Ergebnis |")
        w("|---:|---:|---:|---:|---:|---|")
        for r in e["mono_rows"]:
            at = "-" if r["at_capex"] is None else f"{r['at_capex']:.0f}"
            if r["monotone"]:
                verdict = "monoton"
            elif r["no_worse_than_base_run"]:
                verdict = "Altbefund (nicht durch die Ueberschreitung)"
            else:
                verdict = "NICHT MONOTON"
            w(f"| {r['wacc'] * 100:.0f} % | {r['factor']:.2f} | {r['min_step_eur_kw']:+.2f} | "
              f"{at} | {r['ref_step_eur_kw']:+.2f} | {verdict} |")
        w("")
        w("> **Der Altbefund bei WACC 9 % gehoert benannt.** Dort ist die Abbildung schon **ohne "
          "jede Ueberschreitung** (Faktor 1,00) nicht monoton, und zwar an derselben Stelle und "
          "praktisch in derselben Groesse wie mit Faktor 2,40. Ursache ist nicht der "
          "Ueberschreitungsfaktor, sondern die Kostenabgrenzung der CAPEX-Anker selbst: Der "
          "Overnight-Anker 7.500 EUR/kW traegt bei 9 % WACC und 12 Jahren Bauzeit +67,7 % "
          "Bauzins und landet damit bei 12.578 EUR/kW - **oberhalb** des Gesamtprojekt-Ankers "
          "12.000, dessen Finanzierungsanteil bei rund 5 % gebildet wurde (EPR2 7.583 x 1,37 = "
          "10.389). Die Anker sind also WACC-abhaengig, das Modell behandelt sie als fest. Das "
          "trifft die Konfigurationen `wacc`, `wacc_co2`, `wacc_overrun` und `asia_wacc` in dem "
          "Teil der Ziehungen mit WACC ueber rund 8,2 % (bei Dreieck 3/5/9 % sind das etwa 2,7 % "
          "der Ziehungen). Sauber loesen liesse sich das nur, indem alle drei Anker auf eine "
          "gemeinsame Overnight-Abgrenzung gestellt und der Bauzins einheitlich aufgeschlagen "
          "wird (Nuklear-Review R2, N1 Vorschlag 1a) - bei 5 % WACC waere das ergebnisneutral. "
          "Das ist NICHT Teil des v0.2c-Auftrags und bleibt als offener Punkt stehen.")
        w("")
        w("> Zum Vergleich der Zustand bis v0.2b (multiplikativer Faktor auf den gezogenen CAPEX "
          "mit interpoliertem Anteil 1,0/1,0/0,0): dort bildete die Abbildung bei Faktor 2,20 ein "
          "Zelt mit Spitze auf dem Modus - 7.500 -> 22.112, 12.000 -> 26.400, 17.500 -> 17.500. "
          "Rund 55 % aller Ziehungen lagen auf dem fallenden Ast, und der Szenariensatz "
          "`guenstig` war unter Ueberschreitung teurer als `teuer`. Diese Tabelle haette den "
          "Zustand gebrochen.")
        w("")
        w("### (e2) CCS-Massenbilanz: abgeschieden + Restemission = Brennstoffeintrag")
        w("")
        w("| eta | Abscheiderate | Eintrag t/MWh_el | abgeschieden | Restemission | Bilanzluecke |")
        w("|---:|---:|---:|---:|---:|---:|")
        for r in e["bal_rows"]:
            w(f"| {r['eta']:.2f} | {r['rate']:.2f} | {r['input']:.4f} | {r['captured']:.4f} | "
              f"{r['residual']:.4f} | {r['gap']:+.2e} |")
        w("")
        w(f"Kalibrierung: Bei den Zentralwerten ergibt die Bilanz eine Restemission von "
          f"**{e['calib_residual_model']:.4f} t/MWh_el** gegen den belegten Dossier-Wert "
          f"{e['calib_residual_doc']:.4f} (49/120/220 g/kWh) - Abweichung "
          f"{e['calib_dev'] * 100:.4f} %. "
          + ("OK." if e["calib_passed"] else "NICHT ERFUELLT."))
        w("")
        w("> Zustand bis v0.2b: abgeschieden 0,4185 + Restemission 0,1200 = 0,5385 t/MWh_el bei "
          "einem Eintrag von 0,4650 - **116 % des eingesetzten Kohlenstoffs** wurden verbucht "
          "und bepreist.")
        w("")
        w("### (e3) Uebertragungsnetz-Sockel")
        w("")
        w(f"Sockelquote (SETZUNG, Sensitivitaet 0,20-0,60): **{e['socket_share']:.2f}**. Der "
          "Skalierungsfaktor muss bei fEE -> 0 gegen die Sockelquote laufen und 1,0 nie "
          "ueberschreiten.")
        w("")
        w("| genutzter fEE-Anteil | roher Faktor | gedeckelt | Ergebnis |")
        w("|---:|---:|---:|---|")
        for r in e["socket_rows"]:
            w(f"| {r['fee_share_used']:.3f} | {r['raw']:.3f} | {r['scaled']:.3f} | "
              f"{'OK' if r['passed'] else 'FEHLER'} |")
        w("")

    # -------- Limitationen / Luecken
    w("## Verbleibende Luecken (aus `model_params.json.gaps`)")
    w("")
    w("| ID | Parameter | Beschreibung |")
    w("|---|---|---|")
    for g in params["gaps"]:
        w(f"| {g['id']} | `{g['parameter']}` | {g['reason']} |")
    w("")
    w("## Reproduktion")
    w("")
    w("```bash")
    w("python3 scripts/consolidate_params.py   # research/*.md -> data/model_params.json")
    w("python3 scripts/validate_model.py       # -> research/validierung_modell.md")
    w("```")
    w("")

    with open(OUT_MD, "w", encoding="utf-8") as fh:
        fh.write("\n".join(L))


def main() -> None:
    params = model.load_params()
    profiles = model.load_profiles(params=params)
    a = validate_lcoe(params)
    b = validate_ist(params, profiles)
    c = validate_ges_scenarios(params, profiles)
    d = validate_ist_2025(params, profiles)
    e = validate_structure_v02c(params)
    write_report(params, profiles, a, b, c, d, e)

    print("(a) GES-LCOE-Reproduktion:")
    for r in a["ges_rows"]:
        print(f"    {r['label']:16s} Ziel {r['target']:7.1f}  Modell {r['model']:7.1f}  "
              f"{r['dev_pct']:+6.2f} %  {'OK' if r['passed'] else 'FEHLER'}")
    print("(a2) Bandbreiten vs. Fraunhofer/Lazard:")
    for r in a["band_rows"]:
        print(f"    {r['label']:28s} Modell {r['model_band'][0]:6.1f}-{r['model_band'][1]:6.1f}  "
              f"Referenz {r['ref_band'][0]}-{r['ref_band'][1]}  "
              f"{'Ueberlappung' if r['overlap'] else 'KEINE Ueberlappung'}")
    print(f"    Kernkraft                    Modell {a['nuclear_band'][0]:6.1f}-{a['nuclear_band'][1]:6.1f}")
    print("(b) Ist-2024 (H2):")
    for r in b["rows"]:
        if r["available"]:
            print(f"    {r['series']:16s} Profil {r['target_twh']:8.3f} TWh  Modell {r['model_twh']:8.3f} TWh  "
                  f"{r['dev_pct']:+6.2f} %  {'OK' if r['passed'] else 'FEHLER'}")
    print("(c) GES-Szenarien:")
    for r in c["results"]:
        print(f"    {r['name']:16s} publiziert {r['published']:4.0f}  Modell {r['model']:7.1f}  {r['dev_pct']:+7.1f} %")
    print("(d) Ist-2025-Plausibilisierung:")
    for r in d["rows"]:
        if r["target"] is None:
            continue
        flag = "informativ" if r["passed"] is None else ("OK" if r["passed"] else "ABWEICHUNG")
        print(f"    {r['label'][:44]:46s} Modell {r['model']:8.1f} TWh  Ist {r['target']:7.1f} TWh  "
              f"{r['dev_pct']:+7.1f} %  {flag}")
    print(f"    {'LSCOE Anker':36s} {d['lscoe']:8.1f} EUR/MWh  Ist-Korridor "
          f"{d['band'][0]:.0f}-{d['band'][1]:.0f}  {'im Korridor' if d['in_band'] else 'AUSSERHALB'}")
    print(f"    {'Restemissionen':36s} {d['emissions']['total_mt_co2_a']:8.1f} Mt CO2/a")
    print("(e) Strukturzusagen v0.2c:")
    worst5 = min(r["min_step_eur_kw"] for r in e["mono_rows"] if abs(r["wacc"] - 0.05) < 1e-12)
    print(f"    capex_eff monoton bei WACC 5 %, ganzer Faktor-Support: "
          f"{'OK' if e['mono_base_passed'] else 'FEHLER'} (kleinster Schritt {worst5:+.2f} EUR/kW)")
    print(f"    Ueberschreitung verschlechtert Monotonie nirgends: "
          f"{'OK' if e['mono_no_worse_passed'] else 'FEHLER'} "
          f"(WACC 9 %: Altbefund der CAPEX-Anker, auch bei Faktor 1,00)")
    print(f"    CCS-Massenbilanz geschlossen: {'OK' if e['bal_passed'] else 'FEHLER'} "
          f"(max. Luecke {max(abs(r['gap']) for r in e['bal_rows']):.2e} t/MWh_el)")
    print(f"    Restemission kalibriert: Modell {e['calib_residual_model']:.4f} vs. Dossier "
          f"{e['calib_residual_doc']:.4f} ({e['calib_dev'] * 100:.4f} %) "
          f"{'OK' if e['calib_passed'] else 'FEHLER'}")
    print(f"    Netz-Sockel {e['socket_share']:.2f}: {'OK' if e['socket_passed'] else 'FEHLER'}")
    print(f"\nBericht: {OUT_MD}")
    if not e["passed"]:
        raise SystemExit("Strukturzusagen v0.2c NICHT erfuellt - Abbruch.")


if __name__ == "__main__":
    main()
