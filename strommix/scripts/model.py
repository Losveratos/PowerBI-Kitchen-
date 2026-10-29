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


def _fuel_eur_mwh_el(tech_params: dict) -> tuple[float, str]:
    """Brennstoffkosten je MWh_el.

    Modell v0.2 (M2): Fuer thermische Technologien wird der Brennstoffpreis
    THERMISCH gefuehrt (`fuel_eur_mwh_th`) und ueber den Wirkungsgrad in
    EUR/MWh_el umgerechnet. Ein direkt gesetzter elektrischer Wert
    (`fuel_eur_mwh`, z. B. Kernbrennstoff) hat Vorrang.
    """
    direct = tech_params.get("fuel_eur_mwh")
    if direct is not None:
        return float(direct), "direkt (EUR/MWh_el)"
    th = tech_params.get("fuel_eur_mwh_th")
    if th is None:
        return 0.0, "nicht gesetzt (0)"
    eta = tech_params.get("efficiency") or tech_params.get("efficiency_lhv")
    if not eta:
        return 0.0, "thermisch gesetzt, aber kein Wirkungsgrad hinterlegt (0)"
    return float(th) / float(eta), f"thermisch {float(th):.1f} EUR/MWh_th / eta {float(eta):.3f}"


def ccs_balance(tech_params: dict) -> dict | None:
    """Massenbilanz der CO2-Abscheidung je MWh_el (Modell v0.2c, Fix 4).

    Bis v0.2b wurden abgeschiedene Menge und Restemission aus zwei getrennten
    Groessen gebildet und summierten sich auf 116 % des Brennstoffeintrags
    (Versorger-Review R2 N7, Peer-Review R2 N2). Jetzt gibt es EINE Bilanz:

        input     = emission_factor_t_mwh_th / eta          (Gesamteintrag)
        vorkette  = input x upstream_share_of_lifecycle     (nicht abscheidbar)
        verbrenng = input - vorkette
        captured  = verbrenng x capture_rate
        residual  = verbrenng x (1 - capture_rate) + vorkette

    Damit gilt `captured + residual == input` exakt - auch dann, wenn die
    Monte-Carlo-Rechnung Wirkungsgrad oder Abscheiderate zieht: eine
    Abscheideraten-Ziehung bewegt beide Seiten gleichzeitig.

    Gibt None zurueck, wenn die Technologie keine Abscheidung hat.
    """
    cost_t = tech_params.get("ccs_cost_eur_t")
    ef_th = tech_params.get("emission_factor_t_mwh_th")
    rate = tech_params.get("capture_rate")
    if not cost_t or not ef_th or not rate:
        return None
    eta = tech_params.get("efficiency") or tech_params.get("efficiency_lhv")
    if not eta:
        return None
    rate = float(rate)
    rate = 0.0 if rate < 0.0 else (1.0 if rate > 1.0 else rate)
    up = tech_params.get("upstream_share_of_lifecycle")
    up = 0.0 if up is None else float(up)
    up = 0.0 if up < 0.0 else (1.0 if up > 1.0 else up)
    total_in = float(ef_th) / float(eta)
    upstream = total_in * up
    combustion = total_in - upstream
    captured = combustion * rate
    residual = combustion * (1.0 - rate) + upstream
    return {
        "input_t_mwh_el": total_in,
        "upstream_t_mwh_el": upstream,
        "combustion_t_mwh_el": combustion,
        "captured_t_mwh_el": captured,
        "residual_t_mwh_el": residual,
        "cost_eur_mwh_el": float(cost_t) * captured,
        "balance_residual": captured + residual - total_in,  # muss 0 sein
    }


def ccs_chain(tech_params: dict) -> tuple[float, float]:
    """CO2-Abscheidung: (Kosten EUR/MWh_el, abgeschiedene t CO2/MWh_el).

    Duenne Huelle um `ccs_balance` - gibt (0, 0) zurueck, wenn die Technologie
    keine Abscheidung hat.
    """
    b = ccs_balance(tech_params)
    if b is None:
        return 0.0, 0.0
    return b["cost_eur_mwh_el"], b["captured_t_mwh_el"]


def emission_factor_eff(tech_params: dict) -> float:
    """Wirksamer Emissionsfaktor t CO2/MWh_el.

    Fuer Technologien mit Abscheidung ist das die aus der Massenbilanz
    berechnete RESTemission (v0.2c) - nicht mehr der unabhaengig gesetzte
    Lebenszyklus-Restwert. Der Datensatzwert `emission_factor_t_mwh` bleibt als
    Kalibrierungsziel und als Rueckfall fuer Technologien ohne Abscheidung.
    """
    b = ccs_balance(tech_params)
    if b is not None:
        return b["residual_t_mwh_el"]
    return float(tech_params.get("emission_factor_t_mwh") or 0.0)


def _share(tech_params: dict, key: str) -> float:
    """Anwendungsanteil 0..1 (Default 1.0, wenn das Feld fehlt)."""
    v = tech_params.get(key)
    if v is None:
        return 1.0
    v = float(v)
    return 0.0 if v < 0.0 else (1.0 if v > 1.0 else v)


def scope_share_for_capex(capex_entry: dict, share_entry: dict, capex_value: float) -> float:
    """Anwendungsanteil (IDC bzw. Ueberschreitung) fuer einen GEZOGENEN CAPEX.

    Die drei Stuetzstellen min/mid/max eines CAPEX-Parameters koennen auf
    unterschiedlichen Kostenabgrenzungen ruhen (Kernkraft: overnight bei 7.500,
    Gesamtprojekt bei 12.000/17.500). Zwischen den Stuetzstellen wird der
    Anteil linear interpoliert, damit eine Monte-Carlo-Ziehung keinen Sprung
    bekommt. Ausserhalb der Stuetzstellen wird geklemmt.
    """
    if not isinstance(share_entry, dict):
        return 1.0
    xs = [capex_entry.get("min"), capex_entry.get("mid"), capex_entry.get("max")]
    ys = [share_entry.get("min"), share_entry.get("mid"), share_entry.get("max")]
    pts = [(float(x), float(y)) for x, y in zip(xs, ys) if x is not None and y is not None]
    if not pts:
        return 1.0
    pts.sort(key=lambda p: p[0])
    x = float(capex_value)
    if x <= pts[0][0]:
        return pts[0][1]
    if x >= pts[-1][0]:
        return pts[-1][1]
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        if x0 <= x <= x1:
            if x1 == x0:
                return y1
            return y0 + (y1 - y0) * (x - x0) / (x1 - x0)
    return pts[-1][1]


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

    # --- Modell v0.2: Kostenabgrenzung der CAPEX-Anker beachten -----------
    # M1: Bauzinsen duerfen nur auf Anker gelegt werden, die die Finanzierung
    #     noch nicht enthalten (idc_applicable_share).
    # M7: Der empirische Ueberschreitungsfaktor gilt nur fuer Anker, die eine
    #     Schaetzung sind - nicht fuer bereits realisierte Ist-Kosten
    #     (overrun_applicable_share).
    overrun = float(tech_params.get("cost_overrun_factor") or 1.0)
    overrun_share = _share(tech_params, "overrun_applicable_share")
    overrun_eff = 1.0 + (overrun - 1.0) * overrun_share

    apply_idc = bool(tech_params.get("apply_idc", False))
    idc_gross = idc_surcharge(wacc, tech_params.get("construction_years")) if apply_idc else 0.0
    idc_share = _share(tech_params, "idc_applicable_share")
    idc = idc_gross * idc_share

    # --- Modell v0.2c, Fix 3: Ueberschreitung auf EINER Schaetzbasis --------
    # Wenn eine Technologie einen Schaetzanker fuehrt (Kernkraft: 7.500 EUR/kW),
    # wird der Ueberschreitungsaufschlag als ABSOLUTER Betrag auf diesem Anker
    # gerechnet statt multiplikativ auf dem gezogenen CAPEX. Grund: Die drei
    # CAPEX-Stuetzstellen liegen auf verschiedenen Seiten der Ueberschreitungs-
    # Transformation (7.500 ist eine Entscheidungsschaetzung, 17.500 ihr Ergeb-
    # nis). Multiplikativ mit interpoliertem Anteil war die Abbildung
    # "gezogener CAPEX -> effektiver CAPEX" nicht monoton (Nuklear-Review R2 N1).
    # Der Bauzins wird auf den Ueberschreitungsbetrag NICHT zusaetzlich gelegt -
    # die zugrunde liegenden Eskalationsangaben sind Gesamtprojektwerte.
    ovr_base = tech_params.get("overrun_estimate_base_eur_kw")
    if ovr_base:
        overrun_surcharge = (overrun - 1.0) * float(ovr_base) * overrun_share
        capex_eff = capex * (1.0 + idc) + overrun_surcharge
        overrun_mode = "absolut auf Schaetzanker"
    else:
        overrun_surcharge = capex * (overrun_eff - 1.0) * (1.0 + idc)
        capex_eff = capex * overrun_eff * (1.0 + idc)
        overrun_mode = "multiplikativ auf gezogenem CAPEX"

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
    fuel, fuel_basis = _fuel_eur_mwh_el(tech_params)
    waste = float(tech_params.get("waste_eur_mwh") or 0.0)
    # v0.2c (Fix 4): Bei Technologien mit Abscheidung ist die Restemission die
    # aus der Massenbilanz berechnete Groesse, nicht der unabhaengige Datensatzwert.
    ef = emission_factor_eff(tech_params)
    co2 = co2_price * ef
    ccs_cost, ccs_captured = ccs_chain(tech_params)
    ccs_bal = ccs_balance(tech_params)

    return {
        "lcoe_eur_mwh": capital + fixed_opex + fuel + waste + co2 + ccs_cost,
        "components_eur_mwh": {
            "kapital": capital,
            "fixbetrieb": fixed_opex,
            "brennstoff": fuel,
            "entsorgung": waste,
            "co2": co2,
            "ccs": ccs_cost,
        },
        "ccs_captured_t_mwh": ccs_captured,
        "ccs_residual_t_mwh": ccs_bal["residual_t_mwh_el"] if ccs_bal else None,
        "ccs_input_t_mwh": ccs_bal["input_t_mwh_el"] if ccs_bal else None,
        "emission_factor_effective_t_mwh": ef,
        "capex_effective_eur_kw": capex_eff,
        "overrun_surcharge_eur_kw": overrun_surcharge,
        "overrun_mode": overrun_mode,
        # `idc_surcharge` ist der TATSAECHLICH angewandte Aufschlag (v0.2:
        # bereits mit dem Abgrenzungsanteil multipliziert). Der ungekuerzte
        # Wert steht daneben, damit der Unterschied sichtbar bleibt.
        "idc_surcharge": idc,
        "idc_surcharge_gross": idc_gross,
        "idc_applicable_share": idc_share,
        "cost_overrun_factor_effective": overrun_eff,
        "overrun_applicable_share": overrun_share,
        "fuel_basis": fuel_basis,
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
    "fuel_eur_mwh_th": "fuel",
    "ccs_cost_eur_t": "fuel",  # variabler Kostenblock, folgt dem Brennstoff-Szenario
    "waste_eur_mwh": "waste",
    # v0.2c: der CCS-CAPEX-Faktor folgt derselben Stuetzstelle wie der CAPEX
    "capex_factor_on_ccgt": "capex",
    # v0.2: Kostenabgrenzung folgt der CAPEX-Stuetzstelle
    "capex_scope": "capex",
    "idc_applicable_share": "capex",
    "overrun_applicable_share": "capex",
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


def _socket_share(grid: dict, override: float | str | None = None) -> float:
    """Mixunabhaengige Sockelquote des Uebertragungsnetzes (v0.2c, Fix 1).

    `override` kann eine Zahl sein (direkte Quote fuer den Sensitivitaetslauf),
    "min"/"mid"/"max" (Stuetzstelle der dokumentierten Setzung) oder None
    (Zentralwert). Fehlt der Parameter im Datensatz, faellt die Funktion auf
    0,0 zurueck - das ist exakt die v0.2b-Regel.
    """
    entry = grid.get("transmission_socket_share")
    if isinstance(override, (int, float)):
        v = float(override)
    elif isinstance(override, str) and isinstance(entry, dict):
        v = _pick(entry, override)
        v = 0.0 if v is None else float(v)
    elif isinstance(entry, dict):
        v = float(_pick(entry, "mid") or 0.0)
    else:
        v = 0.0
    return 0.0 if v < 0.0 else (1.0 if v > 1.0 else v)


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
    "coal_band",
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
    # v0.2 (M6): Kohle als Bestandsband, damit der Ist-Anker nicht seine
    # gesamte Residuallast aus Gas decken muss.
    coal_mw = float(capacities_gw.get("coal_band") or 0.0) * MW_PER_GW
    band_mw += hydro_mw + bio_mw + coal_mw

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
            # Bandkomponenten getrennt (v0.2/M6) - Grundlage der Emissionsrechnung
            "nuclear_band": twh(nuclear_band_mw * hours),
            "hydro_band": twh(hydro_mw * hours),
            "biomass_band": twh(bio_mw * hours),
            "coal_band": twh(coal_mw * hours),
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


MODEL_VERSION = "0.2c"

# Maschinenlesbare Limitationen (v0.2). Sie gehen unveraendert in
# data/test_vectors.json, data/monte_carlo_reference.json und ueber
# build_story_data.py in die Seite - damit keine Einschraenkung nur im
# Fliesstext lebt.
LIMITATIONS = [
    {"id": "scenarios_not_emission_equivalent", "severity": "hoch",
     "text": "Die verglichenen Szenarien haben sehr unterschiedliche Restemissionen (1 bis ueber "
             "100 Mt CO2/a). Ein Kostenvergleich in EUR/MWh ist nur unter gleicher "
             "Emissionsnebenbedingung eine Aussage ueber Technologien. Seit v0.2b gibt es dafuer "
             "die CCS-Varianten - die Szenarien OHNE CCS bleiben untereinander nicht "
             "emissionsaequivalent.",
     "affects": "alle Szenarien", "ref_field": "emissions.total_mt_co2_a"},
    {"id": "ccs_storage_availability", "severity": "hoch",
     "text": "Deutschland hat keine in Betrieb befindliche CO2-Speicherstaette. Die CCS-Varianten "
             "unterstellen Export in norwegische/niederlaendische Offshore-Speicher samt Logistik, "
             "Genehmigungen und Akzeptanz. Modelliert ist davon NUR der Kostensatz je Tonne - keine "
             "Kapazitaetsgrenze, keine Hochlaufkurve, kein Verfuegbarkeitsrisiko. Die jaehrlich "
             "einzulagernde Menge steht als `emissions.captured_mt_co2_a` im Ergebnis.",
     "affects": "kostenminimum_ccs, ee80_gas_ccs", "ref_field": "gaps.ccs_speicher_verfuegbarkeit"},
    {"id": "ccs_cost_band_optimistic", "severity": "mittel",
     "text": "Der CCS-Vollkettensatz 50/80/100 EUR/t ist die im Repository belegte Spanne. Eine "
             "Recherche (2026-08-19, Clean Air Task Force / Carbon Management Europe) nennt fuer "
             "europaeische Anlagen mit den derzeit geplanten Speichern rund 70-250 EUR/t. Das "
             "Modellband liegt am unteren Rand und beguenstigt den CCS-Pfad.",
     "affects": "kostenminimum_ccs, ee80_gas_ccs", "ref_field": "gaps.ccs_kostenband_optimistisch"},
    {"id": "ccs_on_full_backup_fleet", "severity": "hoch",
     "text": "Die CCS-Varianten ruesten den GESAMTEN Backup-Park aus, auch die Stunden mit sehr "
             "wenigen Volllaststunden. Weil der CAPEX-Block dabei rund verdoppelt wird, die Anlage "
             "aber nur 1.300-1.900 h im Jahr laeuft, faellt der Kapitalanteil je abgeschiedener "
             "Tonne sehr hoch aus. Ein real optimiertes System wuerde CCS nur an den "
             "hochausgelasteten Bloecken bauen und die Spitzenlast unabgeschieden fahren. Die hier "
             "ausgewiesenen Vermeidungskosten sind deshalb eine OBERGRENZE.",
     "affects": "kostenminimum_ccs, ee80_gas_ccs", "ref_field": "model.mix_system (gas_tech)"},
    {"id": "ccs_residual_is_lifecycle", "severity": "mittel",
     "text": "Die Restemission von Gas+CCS bleibt ein LEBENSZYKLUS-Wert: Seit v0.2c wird sie aus "
             "der Massenbilanz gerechnet (Brennstoffeintrag minus abgeschiedene Verbrennungs"
             "emissionen), der Eintrag selbst ist aber weiterhin der Lebenszyklus-Faktor inklusive "
             "Vorkette. Fuer eine reine ETS-Bepreisung ist der Wert eher zu hoch - dieselbe "
             "Richtung wie beim GuD-Proxy, also gegen den CCS-Pfad. Der Vorkettenanteil "
             "(upstream_share_of_lifecycle) ist gegen die belegte Restemission von 120 g/kWh "
             "KALIBRIERT, nicht eigenstaendig belegt.",
     "affects": "kostenminimum_ccs, ee80_gas_ccs", "ref_field": "gaps.emissionsfaktor_direkt"},
    {"id": "grid_transmission_socket_assumption", "severity": "hoch",
     "text": "Die mixunabhaengige Sockelquote des Uebertragungsnetzes (v0.2c: 0,40; Sensitivitaet "
             "0,20-0,60) ist eine SETZUNG. Weder NEP 2037/2045 V2025 noch die IMK-Studie teilen die "
             "328 (bzw. 365-392) Mrd. EUR nach Treibern auf - eine belastbare Quote existiert "
             "nicht. Die Setzung bewegt den Abstand zwischen dem Kernkraft- und dem gasgestuetzten "
             "Pfad unmittelbar; das Ergebnis weist die Differenz zum sockellosen Lauf (v0.2b) je "
             "Szenario als detail.netz.socket_effect_eur_mwh aus.",
     "affects": "alle Zukunftsszenarien, Kernkraft-Pfad am staerksten",
     "ref_field": "system.grid.transmission_socket_share"},
    {"id": "overrun_estimate_base_assumption", "severity": "mittel",
     "text": "Der empirische Ueberschreitungsfaktor wird seit v0.2c als absoluter Betrag auf EINER "
             "Schaetzbasis gerechnet (Kernkraft 7.500 EUR/kW) und nur auf den Rest-Anteil der "
             "Eskalation gelegt (0,48/0,50/0,00). Das beseitigt die Nicht-Monotonie und die "
             "Doppelzaehlung an den unteren Ankern, ist aber eine Modellstruktur: Die Rest-Anteile "
             "sind aus den Eskalationsangaben des eigenen Datensatzes abgeleitet (EPR2 +40 %, "
             "Sizewell C +90 %, Lubiatowo Planzahl), der mid-Wert zusaetzlich auf 0,50 abgerundet, "
             "damit die Abbildung ueber den gesamten Faktor-Support monoton bleibt.",
     "affects": "Konfigurationen mit Kostenueberschreitung",
     "ref_field": "technologies.nuclear.params.overrun_estimate_base_eur_kw"},
    {"id": "emission_factor_proxy", "severity": "mittel",
     "text": "Der Emissionsfaktor fuer Gas (0,403 t/MWh_el) und Kohle (0,751 t/MWh_el) ist die "
             "UNECE-Lebenszyklus-Untergrenze, kein direkter Verbrennungsfaktor. Fuer die "
             "ETS-Bepreisung ueberschaetzt das die CO2-Kosten um rund 10-20 %.",
     "affects": "CO2-Kosten und Mt-Ausweis", "ref_field": "gaps.emissionsfaktor_direkt"},
    {"id": "grid_opex_missing", "severity": "hoch",
     "text": "Netzbetrieb, Instandhaltung, Verluste und Redispatch sind nicht enthalten - nur die "
             "Investitionsannuitaet. Der Netzblock der Zukunftsszenarien ist eine Untergrenze.",
     "affects": "alle Zukunftsszenarien", "ref_field": "gaps.netz_opex"},
    {"id": "overrun_asymmetry", "severity": "hoch",
     "text": "Der empirische Ueberschreitungsfaktor ist fuer Batterie, Elektrolyse, H2-Speicher und "
             "H2-Turbine NICHT gemessen (Faktor 1,00 = Datenluecke). Das Ueberschreitungs-Szenario "
             "stresst deshalb die Kernkraft- und Netzseite staerker als die Speicher-/H2-Seite.",
     "affects": "Konfigurationen mit Kostenueberschreitung",
     "ref_field": "system.cost_overrun_factors.unmeasured_technologies"},
    {"id": "grid_allocation_assumption", "severity": "mittel",
     "text": "Die Aufteilung 328 Mrd. (Uebertragung) / 323 Mrd. (Verteilung) ist quellenbelegt, die "
             "ZUORDNUNG der Treiber (Transport vs. Elektrifizierung) ist eine begruendete "
             "Modellannahme. Keine raeumliche Netzsimulation, keine ueberproportionale Kostenkurve.",
     "affects": "alle Szenarien", "ref_field": "system.grid.scaling_rule"},
    {"id": "gas_price_transfer", "severity": "mittel",
     "text": "Der Erdgaspreis (20/35/60 EUR/MWh_th) ist eine Marktspanne von August 2026. Die "
             "Uebertragbarkeit auf ein Zieljahr 2045 ist nicht belegt (Konfidenz C).",
     "affects": "alle Szenarien mit Gas-Backup", "ref_field": "technologies.gas_ccgt.params.fuel_eur_mwh_th"},
    {"id": "h2_initial_fill_free", "severity": "hoch",
     "text": "Der Saisonspeicher startet in den H2-Presets gefuellt; die Stromkosten dieser "
             "Anfangsfuellung liegen ausserhalb des abgedeckten Halbjahres und sind NICHT enthalten. "
             "Die H2-Pfade sind insoweit eine Untergrenze - das ist die Gegenrichtung zur "
             "Gas-Asymmetrie und bleibt auch nach M2 bestehen.",
     "affects": "ee80_h2, ee100", "ref_field": "model.mix_system (h2_initial_fill_share)"},
    {"id": "nuclear_base_range_is_western", "severity": "mittel",
     "text": "Die Kernkraft-Basisverteilung (7.500/12.000/17.500 EUR/kW) enthaelt bewusst kein "
             "asiatisches oder Golf-Projekt - Begruendung in kosten_kernkraft.md 7.1 "
             "(Uebertragbarkeit). Der Cluster Asien/Golf (1.870-4.950 EUR/kW) ist real und belegt "
             "und wird seit v0.2b als EIGENE Monte-Carlo-Konfiguration ('asia', 'asia_wacc') "
             "gerechnet - nicht in die Basisspanne gemischt.",
     "affects": "alle Szenarien mit Kernkraft",
     "ref_field": "technologies.nuclear.capex_alternative_asia_gulf"},
    {"id": "half_year_profile", "severity": "hoch",
     "text": "Das Stundenprofil deckt nur Jul-Dez 2024 ab (4.416 von 8.784 h) und enthaelt den "
             "Sommerueberschuss nicht, aus dem Saisonspeicher befuellt werden.",
     "affects": "alle Szenarien, H2-Pfade am staerksten", "ref_field": "gaps.profile_partial"},
]


def model_limitations(grid_cost_basis: str = "buildout_2045") -> list[dict]:
    out = [dict(x) for x in LIMITATIONS]
    if grid_cost_basis == "ist_netzentgelt":
        out.append({
            "id": "ist_anchor_not_comparable", "severity": "hoch",
            "text": "Dieser Lauf verwendet das heutige Netzentgelt (Bestandsnetz inkl. Betrieb) statt "
                    "der Netzinvestition bis 2045 (nur Zusatzinvestition). Die beiden Netzbloecke "
                    "haben unterschiedliche Systemgrenzen - der Anker ist ein Groessenordnungs-Bezug, "
                    "kein Ranking-Teilnehmer. Zusaetzlich laufen die Bestandsbaender Kohle, Biomasse "
                    "und Wasser ohne Kapital- und Betriebskosten.",
            "affects": "Ist-2025-Anker", "ref_field": "system.grid.ist_2025_eur_mwh",
        })
    return out


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
    bands_twh: dict | None = None,
    grid_cost_basis: str = "buildout_2045",
    grid_socket_share: float | str | None = None,
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

    # Bestandsbaender (v0.2/M6): als JAHRESENERGIE vorgegeben, hier in die
    # konstante Bandleistung des abgedeckten Zeitraums umgerechnet.
    bands_twh = dict(bands_twh or {})
    share_load_cfg = (profiles["series"]["load_mw"].get("seasonal_share") or 1.0)
    for band_key in ("hydro_band", "biomass_band", "coal_band"):
        energy_twh = float(bands_twh.get(band_key) or 0.0)
        if energy_twh <= 0:
            capacities_gw[band_key] = 0.0
            continue
        # Jahresenergie -> MW-Band: E_a * share_load / Stunden des Zeitraums
        capacities_gw[band_key] = (
            energy_twh * MWH_PER_TWH * share_load_cfg / profiles["hours"] / MW_PER_GW
        )

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
                gen_twh = disp["energy_twh"]["nuclear_band"] if share_key == "nuclear" else 0.0
            cost[share_key] = cost.get(share_key, 0.0) + var * gen_twh * annualize * MWH_PER_TWH

    # Backup (Gas): Kapazitaet aus dem Dispatch, nicht pauschal
    gas_gw = capacities_gw["gas_backup"]
    if gas_gw is None:
        gas_gw = disp["gas_peak_gw"]
    if gas_gw > 0:
        add_capacity_cost("gas_backup", gas_tech, gas_gw)
        flat = techs[gas_tech]
        # v0.2 (M2): Brennstoffpreis thermisch, ueber den Wirkungsgrad umgerechnet.
        fuel, fuel_basis = _fuel_eur_mwh_el(flat)
        if not fuel:
            warnings.append(
                "Gas-Brennstoffkosten konnten nicht bestimmt werden - im Ergebnis mit 0 EUR/MWh "
                "angesetzt. Das LSCOE ist insoweit eine UNTERGRENZE."
            )
        # v0.2c: Bei CCS ist die Restemission die Bilanzgroesse, nicht der
        # unabhaengig gesetzte Lebenszyklus-Restwert.
        ef = emission_factor_eff(flat)
        # v0.2b: CO2-Abscheidung, falls die Backup-Technologie eine hat.
        ccs_eur_mwh, ccs_captured_t_mwh = ccs_chain(flat)
        ccs_bal_gas = ccs_balance(flat)
        gas_twh = disp["energy_twh"]["gas_backup"] * annualize
        cost["gas_backup"] = cost.get("gas_backup", 0.0) + (
            float(fuel) + co2_price * ef + ccs_eur_mwh) * gas_twh * MWH_PER_TWH
        detail.setdefault("gas_backup", {})
        detail["gas_backup"].update({"generation_twh_a": gas_twh, "flh": disp["gas_full_load_hours"] * annualize,
                                     "fuel_eur_mwh_el": fuel, "fuel_basis": fuel_basis,
                                     "tech_key": gas_tech,
                                     "ccs_eur_mwh_el": ccs_eur_mwh,
                                     "ccs_captured_t_mwh_el": ccs_captured_t_mwh,
                                     "emission_factor_eff_t_mwh_el": ef,
                                     "ccs_balance": ccs_bal_gas})

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

    # --- Bestandsbaender: nur CO2-Kosten (v0.2/M6) ------------------------
    legacy = params["system"].get("legacy_bands", {})
    legacy_map = {"coal_band": "coal", "biomass_band": "biomass", "hydro_band": "hydro"}
    for band_key, legacy_key in legacy_map.items():
        band_twh = disp["energy_twh"].get(band_key, 0.0) * annualize
        if band_twh <= 0:
            continue
        ef = float((legacy.get(legacy_key, {}).get("emission_factor_t_mwh") or {}).get("value") or 0.0)
        if ef:
            cost[band_key] = cost.get(band_key, 0.0) + co2_price * ef * band_twh * MWH_PER_TWH
        detail[band_key] = {"generation_twh_a": band_twh, "emission_factor_t_mwh": ef,
                            "note": "Bestandsanlage: nur CO2-Kosten, keine Kapital-/Betriebskosten "
                                    "(in keinem Dossier belegt) - ausgewiesene Untergrenze."}
        if band_twh > 0 and legacy_key in ("coal", "biomass"):
            warnings.append(
                f"Bestandsband {legacy_key}: {band_twh:.1f} TWh/a laufen ohne Kapital- und "
                "Betriebskosten in die Rechnung (keine Kostenparameter in den Dossiers, "
                "gaps.hydro_biomasse_band). Das LSCOE ist insoweit eine UNTERGRENZE."
            )

    # --- Netzkosten (v0.2/M3: Uebertragung + Verteilnetz getrennt) ---------
    grid = params["system"]["grid"]
    variant = grid_variant if grid_variant in ("min", "mid", "max") else "mid"
    grid_life = grid["lifetime_years"]["value"]
    grid_crf = crf(wacc, grid_life)

    # Genutzte (nicht abgeregelte) fEE-Energie. Abregelung wird zwischen fEE
    # und Must-run-Band anteilig aufgeteilt, weil im Kernkraft-Preset ein Teil
    # des Ueberschusses aus dem Band stammt.
    vre_gen = disp["energy_twh"]["vre_generated"] * annualize
    band_gen = disp["energy_twh"]["band"] * annualize
    curt = disp["energy_twh"]["curtailed"] * annualize
    vre_used = vre_gen - (curt * vre_gen / (vre_gen + band_gen) if (vre_gen + band_gen) else 0.0)
    fee_share_generated = sum(v for k, v in shares.items() if k in VRE_TECHS)
    fee_share_used = vre_used / demand_twh if demand_twh else 0.0

    ref_share = grid["reference_fee_share"]["value"]
    ref_demand = grid["reference_demand_twh"]["value"]

    if grid_cost_basis == "ist_netzentgelt":
        # M6: Der Ist-Anker traegt NICHT die Netzinvestition bis 2045, sondern
        # das dokumentierte heutige Netzentgelt.
        ist_grid = _pick(grid["ist_2025_eur_mwh"], variant)
        served_probe = disp["energy_twh"]["served"] * annualize
        cost["netz"] = float(ist_grid) * served_probe * MWH_PER_TWH
        detail["netz"] = {
            "basis": "ist_netzentgelt",
            "eur_mwh": float(ist_grid),
            "note": "Heutiges Netzentgelt (9,3 ct/kWh Haushalt 2026). ANDERE SYSTEMGRENZE als der "
                    "Ausbaublock der Zukunftsszenarien: Bestandsnetz inkl. Betrieb statt "
                    "Zusatzinvestition. Der Anker ist deshalb nicht direkt vergleichbar.",
        }
        grid_scaling_raw = {"transmission": None, "distribution": None}
    elif grid_cost_basis == "none":
        cost["netz"] = 0.0
        detail["netz"] = {"basis": "none", "note": "Netzkosten bewusst ausgeschlossen (Kontrastlauf)."}
        grid_scaling_raw = {"transmission": None, "distribution": None}
    elif grid_cost_basis == "legacy_fee_linear":
        # Regel aus Modell v0.1 (GES-Konvention): das GESAMTE Netzbudget linear
        # mit dem ERZEUGTEN fEE-Anteil, ungedeckelt. Nur noch als Vergleichs-
        # und Sensitivitaetslauf vorgehalten (Persona-Review 04, K1).
        invest_bn = _pick(grid["investment_bn_eur_until_2045"], variant)
        cost["netz"] = invest_bn * 1e9 * grid_crf * (fee_share_generated / ref_share)
        detail["netz"] = {"basis": "legacy_fee_linear", "invest_bn_eur": invest_bn,
                          "fee_share": fee_share_generated,
                          "note": "v0.1-Konvention: linear mit dem erzeugten fEE-Anteil, ungedeckelt."}
        grid_scaling_raw = {"transmission": fee_share_generated / ref_share if ref_share else None,
                            "distribution": None}
    else:
        trans_bn = _pick(grid["transmission_bn_eur_until_2045"], variant)
        dist_bn = _pick(grid["distribution_bn_eur_until_2045"], variant)
        # v0.2c (Fix 1): Auch das Uebertragungsnetz hat einen mixunabhaengigen
        # Sockel (Altersersatz, Lastzuwachs, n-1, Anschluss neuer Grosskraft-
        # werke). Er skaliert - wie der Verteilnetz-Sockel - mit dem Bedarf;
        # der Rest bleibt fEE-getrieben (HGUE-Korridore, Offshore-Anbindung).
        # Die Sockelquote ist eine ausgewiesene SETZUNG mit Sensitivitaet.
        socket = _socket_share(grid, grid_socket_share)
        raw_d = (demand_twh / ref_demand) if ref_demand else 0.0
        raw_fee = (fee_share_used / ref_share) if ref_share else 0.0
        raw_t = socket * min(1.0, raw_d) + (1.0 - socket) * raw_fee
        raw_t_nosocket = raw_fee
        scale_t, scale_d = min(1.0, raw_t), min(1.0, raw_d)
        cost_t = trans_bn * 1e9 * grid_crf * scale_t
        cost_t_nosocket = trans_bn * 1e9 * grid_crf * min(1.0, raw_t_nosocket)
        cost_d = dist_bn * 1e9 * grid_crf * scale_d
        cost["netz"] = cost_t + cost_d
        detail["netz"] = {
            "basis": "buildout_2045",
            "transmission_bn_eur": trans_bn, "distribution_bn_eur": dist_bn,
            "fee_share_generated": fee_share_generated,
            "fee_share_used": fee_share_used,
            "transmission_socket_share": socket,
            "scaling_transmission": scale_t, "scaling_distribution": scale_d,
            "scaling_transmission_raw": raw_t, "scaling_distribution_raw": raw_d,
            "scaling_transmission_raw_without_socket": raw_t_nosocket,
            "cost_transmission_bn_eur_a": cost_t / 1e9,
            "cost_transmission_without_socket_bn_eur_a": cost_t_nosocket / 1e9,
            "cost_distribution_bn_eur_a": cost_d / 1e9,
            "note": "Uebertragungsnetz: mixunabhaengiger Sockel (Anteil "
                    f"{socket:.2f}, SETZUNG mit Sensitivitaet) mit dem Jahresbedarf plus "
                    "fEE-getriebener Rest mit der GENUTZTEN fEE-Energie (abgeregelte Energie erzeugt "
                    "keinen Transportbedarf). Verteilnetz als mixunabhaengiger Sockel mit dem "
                    "Jahresbedarf. Beide Faktoren sind auf 1,0 gedeckelt. Netzbetrieb, Redispatch "
                    "und Verluste sind NICHT enthalten (gaps.netz_opex). "
                    "cost_transmission_without_socket_bn_eur_a zeigt den Lauf ohne Sockel (v0.2b).",
        }
        grid_scaling_raw = {"transmission": raw_t, "distribution": raw_d,
                            "transmission_without_socket": raw_t_nosocket}
        if raw_t > 1.0:
            warnings.append(
                f"Uebertragungsnetz-Skalierung {raw_t:.2f} auf 1,00 gedeckelt - das Szenario wuerde "
                "sonst mehr als das gesamte nationale Uebertragungsnetzbudget tragen."
            )
        if raw_d > 1.0:
            warnings.append(
                f"Verteilnetz-Skalierung {raw_d:.2f} auf 1,00 gedeckelt "
                f"(Bedarf ueber dem Referenzbedarf von {ref_demand:.0f} TWh)."
            )

    served_twh_a = disp["energy_twh"]["served"] * annualize
    total = sum(cost.values())
    lscoe = total / (served_twh_a * MWH_PER_TWH) if served_twh_a else float("nan")

    # v0.2c (Fix 1): Der Sockel-Effekt wird ausgewiesen, damit die Differenz zur
    # v0.2b-Regel (Uebertragungsnetz ohne Sockel) nicht in der Zahl verschwindet.
    if detail.get("netz", {}).get("basis") == "buildout_2045" and served_twh_a:
        d = detail["netz"]
        d["socket_effect_eur_mwh"] = (
            (d["cost_transmission_bn_eur_a"] - d["cost_transmission_without_socket_bn_eur_a"])
            * 1e9 / (served_twh_a * MWH_PER_TWH)
        )

    # --- Restemissionen (v0.2/M5) -----------------------------------------
    ef_gas = emission_factor_eff(techs[gas_tech])
    gas_twh_a = disp["energy_twh"]["gas_backup"] * annualize
    coal_twh_a = disp["energy_twh"].get("coal_band", 0.0) * annualize
    ef_coal = float((legacy.get("coal", {}).get("emission_factor_t_mwh") or {}).get("value") or 0.0)
    _, captured_t_mwh = ccs_chain(techs[gas_tech])
    gas_balance = ccs_balance(techs[gas_tech])
    emissions = {
        "gas_mt_co2_a": gas_twh_a * ef_gas,
        "coal_mt_co2_a": coal_twh_a * ef_coal,
        "total_mt_co2_a": gas_twh_a * ef_gas + coal_twh_a * ef_coal,
        # v0.2b: Menge, die ein CCS-Pfad jaehrlich transportieren und einlagern
        # muesste. Deutschland hat dafuer keine Speicherstaette - siehe
        # gaps.ccs_speicher_verfuegbarkeit.
        "captured_mt_co2_a": gas_twh_a * captured_t_mwh,
        # v0.2c (Fix 4): geschlossene Massenbilanz der Abscheidung. Die Summe aus
        # eingelagerter Menge und Restemission der Gasarbeit ist per Konstruktion
        # gleich dem Brennstoffeintrag - `mass_balance_gap_mt_co2_a` muss 0 sein.
        "ccs_balance_t_mwh_el": gas_balance,
        "gas_carbon_input_mt_co2_a": (gas_twh_a * gas_balance["input_t_mwh_el"]) if gas_balance else None,
        "mass_balance_gap_mt_co2_a": (
            gas_twh_a * (gas_balance["captured_t_mwh_el"] + gas_balance["residual_t_mwh_el"]
                         - gas_balance["input_t_mwh_el"]) if gas_balance else 0.0
        ),
        "backup_tech": gas_tech,
        "g_co2_per_kwh_delivered": (
            (gas_twh_a * ef_gas + coal_twh_a * ef_coal) * 1e6 / (served_twh_a * 1e6) * 1000.0
            if served_twh_a else 0.0
        ),
        "emission_factor_gas_t_mwh": ef_gas,
        "emission_factor_coal_t_mwh": ef_coal,
        "factor_status": "PROXY - UNECE-Lebenszyklus-Untergrenze statt direktem Verbrennungsfaktor "
                         "(gaps.emissionsfaktor_direkt). Der direkte ETS-Faktor liegt bei eta = 0,58-0,60 "
                         "rund 10-20 % niedriger.",
        "ccs": "NICHT MODELLIERT (gaps.ccs_nicht_modelliert). Die geprueften GES-Szenarien rechnen "
               "ihren Gas-Pfad mit CCS; dieses Modell tut das nicht. Die Szenarien sind damit NICHT "
               "emissionsaequivalent - der Kostenvergleich haengt insoweit.",
    }

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
        # Nur echte GW-Groessen: `_gwh` sind Energien, `h2_initial_fill_share`
        # ist ein dimensionsloser Anteil, und `gas_backup` wird separat addiert
        # (sonst doppelt, wenn eine feste Backup-Leistung vorgegeben wird).
        "installed_gw_total": sum(
            v for k, v in capacities_gw.items()
            if isinstance(v, (int, float)) and not k.endswith("_gwh")
            and k not in ("h2_initial_fill_share", "gas_backup")
        ) + (gas_gw or 0.0),
        "served_twh_a": served_twh_a,
        "dispatch": disp,
        "scenario": scenario,
        "wacc": wacc,
        "co2_price_eur_t": co2_price,
        "emissions": emissions,
        "emissions_mt_co2_a": emissions["total_mt_co2_a"],
        "captured_mt_co2_a": emissions["captured_mt_co2_a"],
        "grid_cost_basis": grid_cost_basis,
        "grid_scaling_raw": grid_scaling_raw,
        "comparable_to_target_scenarios": grid_cost_basis == "buildout_2045",
        "limitations": model_limitations(grid_cost_basis),
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
