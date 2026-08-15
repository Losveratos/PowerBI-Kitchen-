#!/usr/bin/env python3
"""Kosten- und Dispatch-Modell fuer den Strommix (importierbare Bibliothek).

Umsetzung von docs/02_modellkonzept.md:

  Ebene 1  lcoe(tech_params, wacc, co2_price)          Annuitaetenmethode
  Ebene 2  mix_system(shares, demand_twh, params, ...)  Systemkosten (LSCOE)
  Ebene 3  dispatch(capacities_gw, params, profiles)    stuendliche Merit-Order

Alle Zahlen stammen aus data/model_params.json (scripts/consolidate_params.py).
Im Code stehen keine Kostenzahlen - nur Formeln, Einheitenfaktoren und
Strukturkonstanten.

Datenlage: data/profiles_2024.json ist PARTIAL (nur 01.07.-31.12.2024, ohne
Wind offshore / Wasser / Biomasse). Das Modell normalisiert ueber die
coverage- und seasonal_share-Felder; ein Volljahresprofil laeuft ohne
Codeaenderung. Ergebnisse werden entsprechend als "H2-2024-basiert" markiert.
"""

from __future__ import annotations

import json
import math
import os
from typing import Any

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PARAMS_PATH = os.path.join(BASE, "data", "model_params.json")
PROFILES_PATH = os.path.join(BASE, "data", "profiles_2024.json")

HOURS_PER_YEAR_REF = 8760.0  # fuer Verfuegbarkeits-/Bandumrechnung
MWH_PER_TWH = 1_000_000.0
KW_PER_GW = 1_000_000.0
MW_PER_GW = 1_000.0


# ==========================================================================
# Laden
# ==========================================================================
def load_params(path: str = PARAMS_PATH) -> dict:
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def load_profiles(path: str = PROFILES_PATH, params: dict | None = None) -> dict:
    """Liest profiles_*.json und normalisiert Coverage-Informationen.

    Rueckgabe:
        {"series": {name: {"profile": [...], "available": bool,
                           "cf_covered": float|None, "seasonal_share": float}},
         "hours": int, "full_year": bool, "label": str, "timestamps": [...]}
    """
    with open(path, encoding="utf-8") as fh:
        raw = json.load(fh)

    seasonal_cfg = {}
    if params:
        seasonal_cfg = params.get("profiles_meta", {}).get("seasonal_share_covered", {})

    cf_map = raw["meta"].get("capacity_factors_covered_period", {}) or {}

    series: dict[str, Any] = {}
    hours = 0
    timestamps: list[str] = []
    full_year = True
    for name, s in raw["series"].items():
        cov = s.get("coverage", {})
        avail = bool(s.get("available")) and s.get("hourly_profile")
        seasonal = None
        if cov.get("covers_full_calendar_year"):
            seasonal = 1.0
        elif name in seasonal_cfg and seasonal_cfg[name].get("value") is not None:
            seasonal = seasonal_cfg[name]["value"]
        if avail:
            hours = max(hours, len(s["hourly_profile"]))
            timestamps = timestamps or s.get("timestamps", [])
            if not cov.get("covers_full_calendar_year"):
                full_year = False
        series[name] = {
            "label": s.get("label_de", name),
            "available": bool(avail),
            "profile": s.get("hourly_profile"),
            "cf_covered": cf_map.get(name),
            "seasonal_share": seasonal,
            "coverage": cov,
            "sum_mwh_covered": s.get("annual_sum_mwh_covered_period"),
        }

    label = "Volljahr" if full_year else "H2-2024-basiert (Teilzeitraum)"
    return {
        "series": series,
        "hours": hours,
        "full_year": full_year,
        "label": label,
        "timestamps": timestamps,
        "data_completeness": raw["meta"].get("data_completeness"),
        "meta": raw["meta"],
    }


# ==========================================================================
# Ebene 1 - LCOE
# ==========================================================================
def crf(rate: float, lifetime_years: float) -> float:
    """Kapitalwiedergewinnungsfaktor r*(1+r)^n / ((1+r)^n - 1)."""
    if lifetime_years <= 0:
        raise ValueError("lifetime_years muss > 0 sein")
    if rate == 0:
        return 1.0 / lifetime_years
    q = (1.0 + rate) ** lifetime_years
    return rate * q / (q - 1.0)


def idc_surcharge(wacc: float, construction_years: float | None) -> float:
    """Bauzinsen (interest during construction) als Aufschlag auf den CAPEX.

    Naeherung fuer gleichmaessig ueber die Bauzeit verteilte Ausgaben:
        (1 + wacc)^(t/2) - 1
    Kalibrierung: reproduziert die Dossier-Werte Kernkraft +20/33/55 %
    bei wacc = 5 % und t = 8/12/17 Jahren (kosten_kernkraft.md 5.4/7.2).
    """
    if not construction_years:
        return 0.0
    return (1.0 + wacc) ** (construction_years / 2.0) - 1.0


def lcoe(tech_params: dict, wacc: float, co2_price: float = 0.0) -> dict:
    """Stromgestehungskosten einer Technologie (Annuitaetenmethode).

    tech_params (flache Skalare, i. d. R. aus resolve_tech()):
        capex_eur_kw, lifetime_years, full_load_hours   (Pflicht)
        opex_eur_kw_a   absoluter Fixbetrieb  -> hat Vorrang
        opex_pct        Anteil eines Referenz-CAPEX (nur wenn kein Absolutwert)
        opex_reference_capex_eur_kw  fixer Bezugs-CAPEX fuer opex_pct
                                     (Default: nomineller CAPEX, NICHT der
                                      IDC-/Ueberschreitungs-erhoehte Wert)
        fuel_eur_mwh, waste_eur_mwh, emission_factor_t_mwh
        construction_years, apply_idc (bool), cost_overrun_factor

    Rueckgabe: dict mit Gesamtwert und Komponenten in EUR/MWh.
    """
    capex = float(tech_params["capex_eur_kw"])
    n = float(tech_params["lifetime_years"])
    flh = float(tech_params["full_load_hours"])
    if flh <= 0:
        raise ValueError("full_load_hours muss > 0 sein")

    overrun = float(tech_params.get("cost_overrun_factor") or 1.0)
    apply_idc = bool(tech_params.get("apply_idc", False))
    idc = idc_surcharge(wacc, tech_params.get("construction_years")) if apply_idc else 0.0
    capex_eff = capex * overrun * (1.0 + idc)

    annuity_eur_kw_a = capex_eff * crf(wacc, n)

    opex_abs = tech_params.get("opex_eur_kw_a")
    if opex_abs is not None:
        # Kernkraft & Co.: absolut, damit der CAPEX-Slider die Betriebskosten
        # nicht mit hochzieht (kosten_kernkraft.md 4.2).
        fixed_opex_eur_kw_a = float(opex_abs)
        opex_mode = "absolut"
    else:
        ref_capex = float(tech_params.get("opex_reference_capex_eur_kw") or capex)
        fixed_opex_eur_kw_a = ref_capex * float(tech_params.get("opex_pct") or 0.0)
        opex_mode = "prozentual"

    per_mwh = flh / 1000.0  # MWh je kW und Jahr
    capital = annuity_eur_kw_a / per_mwh
    fixed_opex = fixed_opex_eur_kw_a / per_mwh
    fuel = float(tech_params.get("fuel_eur_mwh") or 0.0)
    waste = float(tech_params.get("waste_eur_mwh") or 0.0)
    ef = float(tech_params.get("emission_factor_t_mwh") or 0.0)
    co2 = co2_price * ef

    return {
        "lcoe_eur_mwh": capital + fixed_opex + fuel + waste + co2,
        "components_eur_mwh": {
            "kapital": capital,
            "fixbetrieb": fixed_opex,
            "brennstoff": fuel,
            "entsorgung": waste,
            "co2": co2,
        },
        "capex_effective_eur_kw": capex_eff,
        "idc_surcharge": idc,
        "crf": crf(wacc, n),
        "annuity_eur_kw_a": annuity_eur_kw_a,
        "fixed_opex_eur_kw_a": fixed_opex_eur_kw_a,
        "opex_mode": opex_mode,
        "wacc": wacc,
        "co2_price_eur_t": co2_price,
    }


# --------------------------------------------------------------------------
# Parameteraufloesung (min/mid/max -> konsistente Szenariensaetze)
# --------------------------------------------------------------------------
_SCENARIO_FIELD_MAP = {
    "capex_eur_kw": "capex",
    "opex_pct": "opex",
    "opex_eur_kw_a": "opex",
    "full_load_hours": "full_load_hours",
    "lifetime_years": "lifetime_years",
    "fuel_eur_mwh": "fuel",
    "waste_eur_mwh": "waste",
}


def _pick(entry: dict, which: str) -> Any:
    """Holt min/mid/max aus einem Parameterobjekt, mit Rueckfall auf value."""
    if entry is None:
        return None
    val = entry.get(which)
    if val is None:
        val = entry.get("mid")
    if val is None:
        val = entry.get("value")
    return val


def resolve_tech(
    params: dict,
    tech_key: str,
    scenario: str = "mittel",
    overrides: dict | None = None,
    apply_idc: bool = True,
) -> dict:
    """Flacher Parametersatz einer Technologie fuer ein Szenario.

    Szenarien sind konsistente Saetze (scenario_sets in model_params.json),
    keine mechanische min/max-Kombination.
    """
    tech = params["technologies"][tech_key]
    sset = params["scenario_sets"][scenario]
    flat: dict[str, Any] = {}
    for field, entry in tech["params"].items():
        which = sset.get(_SCENARIO_FIELD_MAP.get(field, ""), "mid")
        if not isinstance(which, str):
            which = "mid"
        flat[field] = _pick(entry, which)
    flat["tech_key"] = tech_key
    flat["label"] = tech.get("label", tech_key)
    flat["role"] = tech.get("role")
    flat["apply_idc"] = apply_idc
    flat["wacc"] = sset.get("wacc", params["global"]["wacc"]["mid"])
    if overrides:
        flat.update(overrides)
    return flat


def scenario_wacc(params: dict, scenario: str) -> float:
    return params["scenario_sets"][scenario].get("wacc", params["global"]["wacc"]["mid"])


# ==========================================================================
# Ebene 3 - stuendlicher Dispatch
# ==========================================================================
DEFAULT_CAPACITY_KEYS = (
    "pv",
    "wind_onshore",
    "wind_offshore",
    "nuclear",
    "hydro_band",
    "biomass_band",
    "battery_power",
    "electrolyser",
    "h2_turbine",
    "gas_backup",
)

# Technologieschluessel -> Kapazitaetsschluessel (fuer VRE-Profilzuordnung)
VRE_TECHS = {
    "pv": "pv_freiflaeche",
    "wind_onshore": "wind_onshore",
    "wind_offshore": "wind_offshore",
}


def _series_for(profiles: dict, params: dict, tech_key: str) -> tuple[list[float], str | None]:
    """Profilreihe einer Technologie inkl. dokumentierter Ersatzloesung."""
    tech = params["technologies"][tech_key]
    name = tech.get("profile_series")
    s = profiles["series"].get(name)
    note = None
    if s is None or not s["available"]:
        raise KeyError(f"Profilreihe '{name}' fuer {tech_key} nicht verfuegbar")
    if tech.get("profile_note"):
        note = tech["profile_note"]
    return s["profile"], note


def dispatch(
    capacities_gw: dict,
    params: dict,
    profiles: dict,
    demand_twh: float | None = None,
    scenario: str = "mittel",
    techs: dict | None = None,
    vre_energy_mode: str = "flh",
    return_hourly: bool = False,
) -> dict:
    """Stuendliche Merit-Order nach docs/02_modellkonzept.md, Ebene 3.

    capacities_gw: {"pv","wind_onshore","wind_offshore","nuclear","hydro_band",
                    "biomass_band","battery_power","electrolyser","h2_turbine",
                    "gas_backup"} in GW  (gas_backup=None -> unbegrenzt, der
                    Bedarf wird gemessen) sowie die Energiegroessen
                    "battery_energy_gwh" und "h2_storage_gwh".

    vre_energy_mode:
        "flh"        Energieniveau aus den Volllaststunden-Annahmen, Form aus
                     dem Profil (Standard, konsistent zur LCOE-Ebene)
        "profile_cf" Energieniveau aus dem Kapazitaetsfaktor des Profils
                     (fuer den Ist-Jahr-Check)

    Merit-Order je Stunde:
        Ueberschuss: Batterie laden -> Elektrolyse -> Abregelung
        Defizit:     Batterie entladen -> H2-Rueckverstromung -> Gas-Backup
                     -> ungedeckte Last
    """
    warnings: list[str] = []
    if profiles.get("data_completeness") != "FULL" and not profiles["full_year"]:
        warnings.append(
            f"Profil unvollstaendig ({profiles['label']}, {profiles['hours']} h) - "
            "alle Dispatch-Ergebnisse sind auf diesen Zeitraum bezogen."
        )

    techs = techs or {k: resolve_tech(params, k, scenario) for k in params["technologies"]}
    hours = profiles["hours"]
    if hours == 0:
        raise ValueError("Profil enthaelt keine Stunden")

    demand_twh = demand_twh if demand_twh is not None else params["global"]["demand_twh"]["value"]
    load_series = profiles["series"]["load_mw"]
    if not load_series["available"]:
        raise ValueError("Lastprofil fehlt - Dispatch nicht moeglich")
    share_load = load_series["seasonal_share"] or 1.0
    load_total_mwh = demand_twh * MWH_PER_TWH * share_load
    load = [p * load_total_mwh for p in load_series["profile"]]

    # ---- fEE-Erzeugung (Profilform x Energieniveau) ----------------------
    vre_hourly: dict[str, list[float]] = {}
    vre_potential: dict[str, float] = {}
    for cap_key, tech_key in VRE_TECHS.items():
        cap_gw = float(capacities_gw.get(cap_key) or 0.0)
        if cap_gw <= 0:
            continue
        profile, note = _series_for(profiles, params, tech_key)
        if note:
            warnings.append(f"{tech_key}: {note}")
        series_name = params["technologies"][tech_key]["profile_series"]
        s = profiles["series"][series_name]
        if vre_energy_mode == "profile_cf":
            if s["cf_covered"] is None:
                raise ValueError(f"Kein Kapazitaetsfaktor fuer {series_name} im Profil hinterlegt")
            energy_mwh = cap_gw * MW_PER_GW * s["cf_covered"] * hours
        else:
            flh = float(techs[tech_key]["full_load_hours"])
            share = s["seasonal_share"]
            if share is None:
                expected = float(s["coverage"].get("hours_expected") or hours)
                share = hours / expected
                warnings.append(
                    f"{series_name}: kein Saisonanteil hinterlegt, Stundenanteil {share:.3f} verwendet"
                )
            energy_mwh = cap_gw * MW_PER_GW * flh * share
        vre_hourly[cap_key] = [p * energy_mwh for p in profile]
        vre_potential[cap_key] = energy_mwh

    # ---- Muss-Einspeisung / Band ----------------------------------------
    band_mw = 0.0
    nuclear_gw = float(capacities_gw.get("nuclear") or 0.0)
    nuclear_band_mw = 0.0
    if nuclear_gw > 0:
        availability = float(techs["nuclear"]["full_load_hours"]) / HOURS_PER_YEAR_REF
        nuclear_band_mw = nuclear_gw * MW_PER_GW * availability
        band_mw += nuclear_band_mw
    hydro_mw = float(capacities_gw.get("hydro_band") or 0.0) * MW_PER_GW
    bio_mw = float(capacities_gw.get("biomass_band") or 0.0) * MW_PER_GW
    band_mw += hydro_mw + bio_mw

    # ---- Speicher- und Backup-Parameter ----------------------------------
    bat_power_mw = float(capacities_gw.get("battery_power") or 0.0) * MW_PER_GW
    bat_energy_mwh = float(capacities_gw.get("battery_energy_gwh") or 0.0) * MW_PER_GW
    eta_bat = float(techs["battery"]["efficiency_roundtrip"] or 1.0)
    eta_leg = math.sqrt(eta_bat)  # symmetrisch auf Lade- und Entladeseite

    ely_mw = float(capacities_gw.get("electrolyser") or 0.0) * MW_PER_GW
    eta_ely = float(techs["electrolyser"]["efficiency_lhv"] or 1.0)
    h2_store_mwh = float(capacities_gw.get("h2_storage_gwh") or 0.0) * MW_PER_GW
    h2_turb_mw = float(capacities_gw.get("h2_turbine") or 0.0) * MW_PER_GW
    eta_h2 = float(techs["h2_turbine"]["efficiency"] or 1.0)
    # Saisonspeicher-Startfuellstand: bei einem Teilzeitraum, der erst im Juli
    # beginnt, liegt die Einspeicherphase (Fruehjahr/Sommer) davor. Der Anteil
    # ist deshalb explizit setzbar und wird im Ergebnis ausgewiesen.
    h2_fill_share = float(capacities_gw.get("h2_initial_fill_share") or 0.0)
    if h2_fill_share and profiles["full_year"]:
        warnings.append(
            "h2_initial_fill_share > 0 bei Volljahresprofil - der Saisonspeicher startet "
            "damit gefuellt, ohne dass die Einspeicherung im Modell bezahlt wird."
        )

    gas_cap = capacities_gw.get("gas_backup")
    gas_mw = math.inf if gas_cap is None else float(gas_cap) * MW_PER_GW

    if bat_power_mw > 0 and bat_energy_mwh > 0:
        duration = bat_energy_mwh / bat_power_mw
        ref_duration = float(techs["battery"]["duration_hours"] or duration)
        if abs(duration - ref_duration) > 0.5:
            warnings.append(
                f"Batterie-Auslegung {duration:.1f} h weicht von der CAPEX-Referenz "
                f"({ref_duration:.0f} h System) ab - EUR/kWh-Ansatz nur naeherungsweise gueltig."
            )

    # ---- Stundenschleife -------------------------------------------------
    soc_bat = 0.0
    soc_h2 = h2_store_mwh * h2_fill_share
    soc_h2_start = soc_h2
    tot = dict(
        load=0.0, vre=0.0, band=0.0, curtailed=0.0, bat_charge=0.0, bat_discharge=0.0,
        ely_in=0.0, h2_produced=0.0, h2_reelec=0.0, h2_in_from_store=0.0,
        gas=0.0, unserved=0.0, residual_pos=0.0,
    )
    gas_peak = 0.0
    unserved_peak = 0.0
    soc_bat_max = 0.0
    soc_h2_max = soc_h2
    soc_h2_min = soc_h2
    hourly: dict[str, list[float]] = {k: [] for k in
                                      ("residual", "gas", "unserved", "curtailed", "soc_bat", "soc_h2")} \
        if return_hourly else {}

    for i in range(hours):
        vre = sum(v[i] for v in vre_hourly.values())
        l = load[i]
        residual = l - vre - band_mw
        tot["load"] += l
        tot["vre"] += vre
        tot["band"] += band_mw
        gas_h = 0.0
        uns_h = 0.0
        curt_h = 0.0

        if residual < 0:
            surplus = -residual
            # 1. Batterie laden
            if bat_power_mw > 0 and bat_energy_mwh > 0:
                room = (bat_energy_mwh - soc_bat) / eta_leg
                charge = min(surplus, bat_power_mw, max(room, 0.0))
                soc_bat += charge * eta_leg
                surplus -= charge
                tot["bat_charge"] += charge
            # 2. Elektrolyse
            if ely_mw > 0 and h2_store_mwh > 0:
                room = (h2_store_mwh - soc_h2) / eta_ely
                use = min(surplus, ely_mw, max(room, 0.0))
                soc_h2 += use * eta_ely
                surplus -= use
                tot["ely_in"] += use
                tot["h2_produced"] += use * eta_ely
            # 3. Abregelung
            curt_h = surplus
            tot["curtailed"] += curt_h
        elif residual > 0:
            need = residual
            tot["residual_pos"] += residual
            # 1. Batterie entladen
            if bat_power_mw > 0 and soc_bat > 0:
                out = min(need, bat_power_mw, soc_bat * eta_leg)
                soc_bat -= out / eta_leg
                need -= out
                tot["bat_discharge"] += out
            # 2. H2-Rueckverstromung
            if h2_turb_mw > 0 and soc_h2 > 0:
                out = min(need, h2_turb_mw, soc_h2 * eta_h2)
                soc_h2 -= out / eta_h2
                need -= out
                tot["h2_reelec"] += out
                tot["h2_in_from_store"] += out / eta_h2
            # 3. Gas-Backup
            if gas_mw > 0:
                gas_h = min(need, gas_mw)
                need -= gas_h
                tot["gas"] += gas_h
                gas_peak = max(gas_peak, gas_h)
            # 4. ungedeckte Last
            uns_h = need
            tot["unserved"] += uns_h
            unserved_peak = max(unserved_peak, uns_h)

        soc_bat_max = max(soc_bat_max, soc_bat)
        soc_h2_max = max(soc_h2_max, soc_h2)
        soc_h2_min = min(soc_h2_min, soc_h2)
        if return_hourly:
            hourly["residual"].append(residual)
            hourly["gas"].append(gas_h)
            hourly["unserved"].append(uns_h)
            hourly["curtailed"].append(curt_h)
            hourly["soc_bat"].append(soc_bat)
            hourly["soc_h2"].append(soc_h2)

    twh = lambda mwh: mwh / MWH_PER_TWH  # noqa: E731

    served = tot["load"] - tot["unserved"]
    result = {
        "label": profiles["label"],
        "hours": hours,
        "vre_energy_mode": vre_energy_mode,
        "demand_twh_input": demand_twh,
        "seasonal_share_load": share_load,
        "energy_twh": {
            "load": twh(tot["load"]),
            "served": twh(served),
            "vre_generated": twh(tot["vre"]),
            "band": twh(tot["band"]),
            "curtailed": twh(tot["curtailed"]),
            "battery_charge": twh(tot["bat_charge"]),
            "battery_discharge": twh(tot["bat_discharge"]),
            "electrolysis_input": twh(tot["ely_in"]),
            "h2_produced": twh(tot["h2_produced"]),
            "h2_reelectrified": twh(tot["h2_reelec"]),
            "gas_backup": twh(tot["gas"]),
            "unserved": twh(tot["unserved"]),
        },
        "vre_potential_twh": {k: twh(v) for k, v in vre_potential.items()},
        "coverage_ratio": served / tot["load"] if tot["load"] else 0.0,
        "unserved_share": (tot["unserved"] / tot["load"]) if tot["load"] else 0.0,
        "curtailment_share_of_vre": (tot["curtailed"] / tot["vre"]) if tot["vre"] else 0.0,
        # Bei Must-run-Band (z. B. Kernkraft) stammt ein Teil des Ueberschusses
        # nicht aus fEE - deshalb zusaetzlich der Bezug auf die Gesamterzeugung.
        "curtailment_share_of_generation": (
            tot["curtailed"] / (tot["vre"] + tot["band"]) if (tot["vre"] + tot["band"]) else 0.0
        ),
        "h2_soc_start_gwh": soc_h2_start / MW_PER_GW,
        "h2_withdrawn_twh": twh(tot["h2_in_from_store"]),
        "h2_from_initial_fill_twh": twh(max(0.0, soc_h2_start - soc_h2)),
        "gas_peak_gw": gas_peak / MW_PER_GW,
        "gas_full_load_hours": (tot["gas"] / gas_peak) if gas_peak > 0 else 0.0,
        "unserved_peak_gw": unserved_peak / MW_PER_GW,
        "battery_soc_max_gwh": soc_bat_max / MW_PER_GW,
        "h2_soc_max_gwh": soc_h2_max / MW_PER_GW,
        "h2_soc_end_gwh": soc_h2 / MW_PER_GW,
        "h2_soc_min_gwh": soc_h2_min / MW_PER_GW,
        # benoetigte Speichergroesse = maximaler Fuellstandshub im Zeitraum
        "h2_storage_required_gwh": (soc_h2_max - soc_h2_min) / MW_PER_GW,
        "nuclear_band_gw": nuclear_band_mw / MW_PER_GW,
        "warnings": warnings,
    }
    if return_hourly:
        result["hourly"] = hourly
        result["timestamps"] = profiles["timestamps"]
    return result


# ==========================================================================
# Ebene 2 - Mix-Modell (Systemkosten)
# ==========================================================================
def _annual_fixed_cost_eur_kw(tech_flat: dict, wacc: float) -> float:
    """Kapitaldienst + Fixbetrieb je kW und Jahr (VLh-unabhaengig)."""
    res = lcoe({**tech_flat, "full_load_hours": 1000.0}, wacc, 0.0)
    return res["annuity_eur_kw_a"] + res["fixed_opex_eur_kw_a"]


def mix_system(
    shares: dict,
    demand_twh: float,
    params: dict,
    profiles: dict,
    scenario: str = "mittel",
    storage: dict | None = None,
    co2_price: float | None = None,
    grid_variant: str = "mid",
    apply_idc: bool = True,
    gas_tech: str = "gas_ccgt",
    firm_tech: str = "nuclear",
) -> dict:
    """Systemkosten (LSCOE) eines gewaehlten Mixes.

    shares: Energieanteile am Bedarf, z. B.
        {"pv": 0.30, "wind_onshore": 0.35, "wind_offshore": 0.15, "nuclear": 0.20}
    storage: {"battery_energy_gwh","battery_power_gw","electrolyser_gw",
              "h2_storage_gwh","h2_turbine_gw","gas_backup_gw"}  (optional)

    Vorgehen (docs/02_modellkonzept.md, Ebene 2):
      1. Kapazitaeten aus Anteil x Bedarf / Volllaststunden
      2. Dispatch (Ebene 3) liefert Backup-, Speicher- und Abregelungsmengen
      3. Kosten = Kapazitaetskosten + variable Kosten + Netzzuschlag
      4. LSCOE = Gesamtkosten / tatsaechlich gedeckte Last
    """
    warnings: list[str] = []
    storage = dict(storage or {})
    wacc = scenario_wacc(params, scenario)
    co2_price = co2_price if co2_price is not None else params["global"]["co2_price_eur_t"]["value"]

    techs = {k: resolve_tech(params, k, scenario, apply_idc=apply_idc) for k in params["technologies"]}

    # --- 1. Kapazitaeten aus Energieanteilen ------------------------------
    capacities_gw: dict[str, Any] = {}
    tech_for_share = {
        "pv": "pv_freiflaeche",
        "wind_onshore": "wind_onshore",
        "wind_offshore": "wind_offshore",
        "nuclear": firm_tech,
    }
    for share_key, share in shares.items():
        tech_key = tech_for_share.get(share_key, share_key)
        flh = float(techs[tech_key]["full_load_hours"])
        energy_mwh = share * demand_twh * MWH_PER_TWH
        capacities_gw[share_key] = energy_mwh / flh / MW_PER_GW

    capacities_gw["battery_power"] = storage.get("battery_power_gw", 0.0)
    capacities_gw["battery_energy_gwh"] = storage.get("battery_energy_gwh", 0.0)
    capacities_gw["electrolyser"] = storage.get("electrolyser_gw", 0.0)
    capacities_gw["h2_storage_gwh"] = storage.get("h2_storage_gwh", 0.0)
    capacities_gw["h2_turbine"] = storage.get("h2_turbine_gw", 0.0)
    capacities_gw["h2_initial_fill_share"] = storage.get("h2_initial_fill_share", 0.0)
    capacities_gw["gas_backup"] = storage.get("gas_backup_gw", None)  # None = Bedarf messen

    # --- 2. Dispatch ------------------------------------------------------
    disp = dispatch(
        capacities_gw, params, profiles, demand_twh=demand_twh,
        scenario=scenario, techs=techs, vre_energy_mode="flh",
    )
    warnings.extend(disp["warnings"])

    # Hochrechnung des Teilzeitraums auf ein Jahr ueber den Lastanteil.
    share_load = disp["seasonal_share_load"] or 1.0
    annualize = 1.0 / share_load
    if share_load < 0.999:
        warnings.append(
            f"Teilzeitraum-Hochrechnung: Dispatch-Mengen wurden mit Faktor {annualize:.3f} "
            "(Lastanteil des abgedeckten Zeitraums) auf ein Jahr hochgerechnet. "
            "Der abgedeckte Zeitraum Jul-Dez ist winterlastig - Backup- und Speichermengen "
            "werden dadurch eher ueber- als unterschaetzt."
        )

    # --- 3. Kosten --------------------------------------------------------
    cost: dict[str, float] = {}
    detail: dict[str, Any] = {}

    def add_capacity_cost(name: str, tech_key: str, cap_gw: float) -> None:
        if cap_gw <= 0:
            return
        flat = techs[tech_key]
        fixed = _annual_fixed_cost_eur_kw(flat, wacc)
        cost[name] = cost.get(name, 0.0) + fixed * cap_gw * KW_PER_GW
        detail[name] = {"capacity_gw": cap_gw, "fixed_eur_kw_a": fixed}

    # Erzeugung (Kapazitaetskosten; Abregelung wirkt automatisch verteuernd)
    for share_key in shares:
        tech_key = tech_for_share.get(share_key, share_key)
        add_capacity_cost(share_key, tech_key, capacities_gw[share_key])
        flat = techs[tech_key]
        var = (float(flat.get("fuel_eur_mwh") or 0.0) + float(flat.get("waste_eur_mwh") or 0.0)
               + co2_price * float(flat.get("emission_factor_t_mwh") or 0.0))
        if var:
            # variable Kosten auf die tatsaechlich erzeugte (nicht abgeregelte) Energie
            gen_twh = disp["vre_potential_twh"].get(share_key)
            if gen_twh is None:
                gen_twh = disp["energy_twh"]["band"] if share_key == "nuclear" else 0.0
            cost[share_key] = cost.get(share_key, 0.0) + var * gen_twh * annualize * MWH_PER_TWH

    # Backup (Gas): Kapazitaet aus dem Dispatch, nicht pauschal
    gas_gw = capacities_gw["gas_backup"]
    if gas_gw is None:
        gas_gw = disp["gas_peak_gw"]
    if gas_gw > 0:
        add_capacity_cost("gas_backup", gas_tech, gas_gw)
        flat = techs[gas_tech]
        fuel = flat.get("fuel_eur_mwh")
        if fuel is None:
            warnings.append(
                "Gas-Brennstoffkosten fehlen in den Dossiers (gaps.gaspreis_erdgas) - "
                "im Ergebnis mit 0 EUR/MWh angesetzt. Das LSCOE ist insoweit eine UNTERGRENZE."
            )
            fuel = 0.0
        ef = float(flat.get("emission_factor_t_mwh") or 0.0)
        gas_twh = disp["energy_twh"]["gas_backup"] * annualize
        cost["gas_backup"] = cost.get("gas_backup", 0.0) + (float(fuel) + co2_price * ef) * gas_twh * MWH_PER_TWH
        detail.setdefault("gas_backup", {})
        detail["gas_backup"].update({"generation_twh_a": gas_twh, "flh": disp["gas_full_load_hours"] * annualize})

    # Speicher
    if capacities_gw["battery_energy_gwh"]:
        bat = techs["battery"]
        e_kwh = capacities_gw["battery_energy_gwh"] * 1e6
        ann = float(bat["capex_eur_kwh"]) * (crf(wacc, float(bat["lifetime_years"])) + float(bat["opex_pct"]))
        cost["battery"] = ann * e_kwh
        detail["battery"] = {"energy_gwh": capacities_gw["battery_energy_gwh"],
                             "throughput_twh_a": disp["energy_twh"]["battery_discharge"] * annualize}
    if capacities_gw["electrolyser"]:
        add_capacity_cost("electrolyser", "electrolyser", capacities_gw["electrolyser"])
    if capacities_gw["h2_storage_gwh"]:
        h2_cost = float(params["technologies"]["h2_storage"]["params"]["storage_cost_eur_mwh_h2"]["value"])
        # Durchsatz = groessere der beiden Seiten, damit ein vorgefuellter
        # Saisonspeicher nicht kostenlos wird.
        throughput_twh = max(disp["energy_twh"]["h2_produced"], disp["h2_withdrawn_twh"]) * annualize
        cost["h2_storage"] = h2_cost * throughput_twh * MWH_PER_TWH
        detail["h2_storage"] = {"throughput_twh_a": throughput_twh,
                                "max_fill_gwh": disp["h2_soc_max_gwh"],
                                "from_initial_fill_twh": disp["h2_from_initial_fill_twh"],
                                "capacity_gwh": capacities_gw["h2_storage_gwh"]}
        if disp["h2_from_initial_fill_twh"] > 0:
            warnings.append(
                f"{disp['h2_from_initial_fill_twh']:.1f} TWh H2 stammen aus dem gesetzten "
                "Anfangsfuellstand des Saisonspeichers. Die Stromkosten fuer deren Erzeugung "
                "liegen ausserhalb des abgedeckten Zeitraums und sind NICHT enthalten - "
                "das LSCOE ist insoweit eine Untergrenze."
            )
    if capacities_gw["h2_turbine"]:
        add_capacity_cost("h2_turbine", "h2_turbine", capacities_gw["h2_turbine"])

    # Netzausbau (top-down, linear mit dem fEE-Anteil - wie GES, inkl. Limitation)
    fee_share = sum(v for k, v in shares.items() if k in VRE_TECHS)
    grid = params["system"]["grid"]
    invest_bn = _pick(grid["investment_bn_eur_until_2045"], grid_variant if grid_variant in ("min", "mid", "max") else "mid")
    grid_life = grid["lifetime_years"]["value"]
    ref_share = grid["reference_fee_share"]["value"]
    cost["netz"] = invest_bn * 1e9 * crf(wacc, grid_life) * (fee_share / ref_share)
    detail["netz"] = {"invest_bn_eur": invest_bn, "fee_share": fee_share,
                      "note": "linear mit fEE-Anteil skaliert (GES-Vereinfachung, keine raeumliche Netzsimulation)"}

    served_twh_a = disp["energy_twh"]["served"] * annualize
    total = sum(cost.values())
    lscoe = total / (served_twh_a * MWH_PER_TWH) if served_twh_a else float("nan")

    if disp["energy_twh"]["unserved"] > 0:
        warnings.append(
            f"Ungedeckte Last: {disp['energy_twh']['unserved']:.2f} TWh im abgedeckten Zeitraum "
            f"({(1 - disp['coverage_ratio']) * 100:.2f} % der Last), Spitze {disp['unserved_peak_gw']:.1f} GW. "
            "Import/Export und Lastmanagement sind bewusst nicht modelliert (konservativ)."
        )

    return {
        "lscoe_eur_mwh": lscoe,
        "total_cost_bn_eur_a": total / 1e9,
        "cost_components_bn_eur_a": {k: v / 1e9 for k, v in sorted(cost.items())},
        "cost_components_eur_mwh": {
            k: v / (served_twh_a * MWH_PER_TWH) for k, v in sorted(cost.items())
        } if served_twh_a else {},
        "capacities_gw": {k: v for k, v in capacities_gw.items() if not isinstance(v, type(None))},
        "installed_gw_total": sum(
            v for k, v in capacities_gw.items()
            if isinstance(v, (int, float)) and not k.endswith("_gwh")
        ) + (gas_gw or 0.0),
        "served_twh_a": served_twh_a,
        "dispatch": disp,
        "scenario": scenario,
        "wacc": wacc,
        "co2_price_eur_t": co2_price,
        "detail": detail,
        "warnings": warnings,
    }


# --------------------------------------------------------------------------
# Hilfsfunktion fuer Sichtprüfung
# --------------------------------------------------------------------------
def _demo() -> None:
    params = load_params()
    profiles = load_profiles(params=params)
    print(f"Profil: {profiles['label']}, {profiles['hours']} h")
    for key in ("pv_freiflaeche", "wind_onshore", "wind_offshore", "nuclear"):
        flat = resolve_tech(params, key, "mittel")
        r = lcoe(flat, scenario_wacc(params, "mittel"), params["global"]["co2_price_eur_t"]["value"])
        print(f"  {flat['label']:38s} {r['lcoe_eur_mwh']:7.1f} EUR/MWh (IDC {r['idc_surcharge'] * 100:.1f} %)")


if __name__ == "__main__":
    _demo()
