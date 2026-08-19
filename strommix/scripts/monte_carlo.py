#!/usr/bin/env python3
"""Monte-Carlo-Referenz fuer die Parameterunsicherheit des Mix-Modells.

Fragestellung
    Die Seite zeigt je Szenario einen Punktwert des System-LSCOE. Jeder
    Eingangsparameter ist aber eine Spanne (min/mid/max in
    data/model_params.json). Diese Rechnung zieht aus diesen Spannen
    Dreiecksverteilungen (Modus = mid) und zeigt, wie breit die
    LSCOE-Verteilung je Szenario tatsaechlich ist - und ob sich die
    Verteilungen benachbarter Szenarien ueberlappen.

Methode
    1. Je Szenario-Preset wird der stuendliche Dispatch **einmal** mit den
       mittleren Parametern gerechnet und zwischengespeichert.
    2. Darueber laufen N = 1000 Kostenziehungen. Gezogen werden je
       Technologie CAPEX, Opex und Volllaststunden, optional der WACC
       (Dreieck 3/5/9 %) und optional ein empirischer
       CAPEX-Ueberschreitungsfaktor (Flyvbjerg/Sovacool).
    3. Ergebnis je Konfiguration: P5/P25/P50/P75/P95 und ein Histogramm.

    WICHTIGE VEREINFACHUNG (im Paper als Limitation ausgewiesen):
    Kostenparameter beeinflussen den Dispatch nicht - das ist exakt richtig
    fuer CAPEX, Opex und WACC. Die Volllaststunden-Ziehung wirkt dagegen im
    Modell eigentlich auch auf die Physik (Kapazitaet = Anteil x Bedarf /
    VLh). Hier wirkt sie nur auf die Kostenseite: Erzeugungsmengen,
    Backup-Bedarf, Speicherfuellstaende und Abregelung bleiben die des
    mittleren Laufs. Das haelt die Rechnung im Browser unter zwei Sekunden
    und ist die einzige Abweichung gegenueber einer vollstaendigen
    Neurechnung je Ziehung.

Determinismus
    Eigener PRNG (mulberry32), damit der JavaScript-Port bitidentisch
    dieselbe Ziehungsfolge erzeugt. Zwei Laeufe dieses Skripts liefern
    byteweise identische Dateien.

Aufruf
    python3 scripts/monte_carlo.py

Ausgabe
    data/monte_carlo_reference.json
"""

from __future__ import annotations

import json
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import model  # noqa: E402

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE_PATH = os.path.join(BASE, "data", "page_data.json")
OUT_PATH = os.path.join(BASE, "data", "monte_carlo_reference.json")

N_DRAWS = 1000
BASE_SEED = 20260815
HIST_BINS = 28
PARITY_TOLERANCE = 0.005  # 0,5 % - identisch zur Pruefung im Browser


# ==========================================================================
# 1 - Deterministischer PRNG (mulberry32) und Dreiecksverteilung
# ==========================================================================
MASK32 = 0xFFFFFFFF


def _imul(a: int, b: int) -> int:
    """Entspricht Math.imul(a, b) auf Bit-Ebene (32 Bit, vorzeichenlos gefuehrt)."""
    return (a * b) & MASK32


def mulberry32(seed: int):
    """Gibt eine Zufallsfunktion zurueck, die [0,1) liefert.

    Bitidentische Portierung des mulberry32-Algorithmus aus dem JS-Teil.
    Alle Operationen laufen modulo 2**32; das entspricht der ToUint32-
    Semantik von JavaScript fuer ^, +, | und >>>.
    """
    state = seed & MASK32

    def rnd() -> float:
        nonlocal state
        state = (state + 0x6D2B79F5) & MASK32
        t = state
        t = _imul(t ^ (t >> 15), 1 | t)
        t = ((t + _imul(t ^ (t >> 7), 61 | t)) & MASK32) ^ t
        return ((t ^ (t >> 14)) & MASK32) / 4294967296.0

    return rnd


def triangular(u: float, lo: float, mode: float, hi: float) -> float:
    """Inverse Verteilungsfunktion der Dreiecksverteilung."""
    if hi <= lo:
        return lo
    if mode < lo:
        mode = lo
    if mode > hi:
        mode = hi
    c = (mode - lo) / (hi - lo)
    if u < c:
        return lo + math.sqrt(u * (hi - lo) * (mode - lo))
    return hi - math.sqrt((1.0 - u) * (hi - lo) * (hi - mode))


def percentile(sorted_vals: list[float], p: float) -> float:
    """Lineare Interpolation zwischen Rangplaetzen (identisch im JS-Port)."""
    if not sorted_vals:
        return float("nan")
    idx = (len(sorted_vals) - 1) * p
    lo = math.floor(idx)
    hi = math.ceil(idx)
    if lo == hi:
        return sorted_vals[int(idx)]
    return sorted_vals[lo] + (sorted_vals[hi] - sorted_vals[lo]) * (idx - lo)


# ==========================================================================
# 2 - Was gezogen wird
# ==========================================================================
# Reihenfolge ist Teil des Determinismus: Der JS-Port muss dieselbe Liste in
# derselben Reihenfolge abarbeiten, sonst laufen die Ziehungsfolgen ausein-
# ander. Enthalten sind alle Technologien, die auf der Kostenseite des
# Mix-Modells vorkommen.
DRAW_TECHS = [
    "pv_freiflaeche", "wind_onshore", "wind_offshore", "nuclear",
    "gas_ccgt", "gas_ccs", "battery", "electrolyser", "h2_turbine", "h2_storage",
]

# CAPEX / Opex / Volllaststunden. `capex_eur_kwh` ist der CAPEX der Batterie
# (Energie statt Leistung).
#
# BEWUSST NICHT enthalten: `storage_cost_eur_mwh_h2` (H2-Kavernenspeicher).
# Die Spanne dieses Feldes ist 19,8 / 105 / 105 EUR/MWh_H2 und oeffnet damit
# nur nach unten - erreichbar laut Parameternotiz aber ausschliesslich "bei
# hoher Zyklenzahl". Der hier simulierte Speicher ist ein Saisonspeicher mit
# genau einem Lade-/Entladezyklus im Jahr; eine Ziehung Richtung 19,8 wuerde
# ihm Kosten eines Betriebsregimes zuweisen, das er im Dispatch nicht hat.
# Der Wert bleibt deshalb auf dem Zentralwert (105) und ist in den
# Limitationen als nicht variierter Parameter ausgewiesen.
DRAW_FIELDS = [
    "capex_eur_kw", "capex_eur_kwh", "opex_pct", "opex_eur_kw_a",
    "full_load_hours",
    # v0.2 (M2): Erdgas-Brennstoffpreis, thermisch. Wird ueber den
    # Wirkungsgrad in EUR/MWh_el umgerechnet (model._fuel_eur_mwh_el).
    "fuel_eur_mwh_th",
    # v0.2b: CO2-Abscheidung - Vollkettenkosten je Tonne und Abscheiderate.
    "ccs_cost_eur_t", "capture_rate",
]

# v0.2 (M1/M7): Wenn der CAPEX gezogen wird, muessen die Anwendungsanteile fuer
# Bauzins und Ueberschreitungsfaktor mitgezogen werden - sie haengen an der
# Kostenabgrenzung des jeweiligen Ankers.
SCOPE_SHARE_FIELDS = ("idc_applicable_share", "overrun_applicable_share")

# Empirische Kostenueberschreitung: Zuordnung Technologie -> Projektklasse in
# page_data.kostenueberschreitung_faktoren.technologien. Fuer Batterie,
# Elektrolyse und H2 gibt es in Flyvbjerg/Sovacool keine Klasse - sie bleiben
# deshalb bei 1,00 statt eine Zahl zu erfinden.
OVERRUN_CLASS = {
    "pv_freiflaeche": "solar",
    "wind_onshore": "wind",
    "wind_offshore": "wind",
    "nuclear": "kernkraft",
    "gas_ccgt": "fossil_thermisch",
    "gas_ccs": "fossil_thermisch",
    "netz": "netz_uebertragung",
}

CONFIGS = [
    {"id": "base", "wacc_uncertain": False, "co2_uncertain": False, "overrun": False,
     "label": "WACC fest (5 %), CO2 fest (75 EUR/t), ohne Kostenueberschreitung"},
    {"id": "wacc", "wacc_uncertain": True, "co2_uncertain": False, "overrun": False,
     "label": "WACC unsicher (Dreieck 3/5/9 %), CO2 fest"},
    {"id": "co2", "wacc_uncertain": False, "co2_uncertain": True, "overrun": False,
     "label": "CO2-Preis unsicher (Dreieck 0/75/400 EUR/t), WACC fest"},
    {"id": "wacc_co2", "wacc_uncertain": True, "co2_uncertain": True, "overrun": False,
     "label": "WACC und CO2-Preis unsicher"},
    {"id": "overrun", "wacc_uncertain": False, "co2_uncertain": False, "overrun": True,
     "label": "WACC fest, CO2 fest, mit empirischer Kostenueberschreitung"},
    {"id": "wacc_overrun", "wacc_uncertain": True, "co2_uncertain": False, "overrun": True,
     "label": "WACC unsicher, mit empirischer Kostenueberschreitung"},
    # ---- v0.2b: Kontrastverteilung Asien/Golf fuer den Kernkraft-CAPEX -----
    # NICHT in die Basisspanne gemischt (kosten_kernkraft.md 7.1). Bewusst
    # NICHT mit dem Ueberschreitungsfaktor kombiniert: die Anker sind
    # realisierte Ist-Kosten, kein Schaetzwert (siehe M7).
    {"id": "asia", "wacc_uncertain": False, "co2_uncertain": False, "overrun": False,
     "nuclear_capex": "asia_gulf",
     "label": "Kontrast: Kernkraft-CAPEX aus dem Cluster Asien/Golf (1.870/3.150/4.950 EUR/kW, "
              "Bauzeit 8 a), WACC fest"},
    {"id": "asia_wacc", "wacc_uncertain": True, "co2_uncertain": False, "overrun": False,
     "nuclear_capex": "asia_gulf",
     "label": "Kontrast Asien/Golf mit unsicherem WACC (Dreieck 3/5/9 %)"},
]


def drawable(entry) -> bool:
    """Ein Feld wird gezogen, wenn min/mid/max eine echte Spanne bilden."""
    if not isinstance(entry, dict):
        return False
    lo, mid, hi = entry.get("min"), entry.get("mid"), entry.get("max")
    if lo is None or hi is None or mid is None:
        return False
    return hi > lo


def draw_plan(params: dict) -> list[dict]:
    """Feste Liste aller Ziehungen (Technologie, Feld, lo/mid/hi)."""
    plan = []
    for tech_key in DRAW_TECHS:
        tech = params["technologies"].get(tech_key)
        if not tech:
            continue
        for field in DRAW_FIELDS:
            entry = tech["params"].get(field)
            if drawable(entry):
                plan.append({"tech": tech_key, "field": field,
                             "min": entry["min"], "mid": entry["mid"], "max": entry["max"]})
    return plan


def overrun_plan(page: dict) -> list[dict]:
    """Feste Liste der Ueberschreitungs-Ziehungen (belegte Werte, keine Setzung)."""
    tab = page["kostenueberschreitung_faktoren"]["technologien"]
    plan = []
    for key in DRAW_TECHS + ["netz"]:
        cls = OVERRUN_CLASS.get(key)
        if not cls or cls not in tab:
            continue
        rec = tab[cls]
        mode = rec.get("flyvbjerg")
        if mode is None:
            mode = rec.get("sovacool")
        lo, hi = rec["spanne"][0], rec["spanne"][1]
        plan.append({"target": key, "class": cls, "min": lo, "mid": mode, "max": hi})
    return plan


# ==========================================================================
# 3 - Kostenrechnung ueber einem zwischengespeicherten Dispatch
# ==========================================================================
def system_cost(shares, demand_twh, params, techs, disp, wacc, co2_price,
                storage, overrun=None, grid_variant="mid",
                gas_tech="gas_ccgt", firm_tech="nuclear",
                grid_cost_basis="buildout_2045") -> dict:
    """Schritt 3 aus model.mix_system, aber mit vorgegebenem Parametersatz.

    `techs`  flache Parametersaetze je Technologie (gezogen oder mittel)
    `disp`   Ergebnis eines bereits gerechneten Dispatch-Laufs
    `overrun` {tech_key: Faktor}, Default 1,0
    """
    overrun = overrun or {}
    share_load = disp["seasonal_share_load"] or 1.0
    annualize = 1.0 / share_load
    cost: dict[str, float] = {}

    tech_for_share = {
        "pv": "pv_freiflaeche", "wind_onshore": "wind_onshore",
        "wind_offshore": "wind_offshore", "nuclear": firm_tech,
    }

    def fixed_cost(tech_key: str) -> float:
        flat = dict(techs[tech_key])
        flat["cost_overrun_factor"] = overrun.get(tech_key, 1.0)
        return model._annual_fixed_cost_eur_kw(flat, wacc)

    # --- Erzeugung: Kapazitaet aus Anteil x Bedarf / (gezogene) VLh --------
    for share_key, share in shares.items():
        tech_key = tech_for_share.get(share_key, share_key)
        flh = float(techs[tech_key]["full_load_hours"])
        cap_gw = share * demand_twh * model.MWH_PER_TWH / flh / model.MW_PER_GW
        if cap_gw > 0:
            cost[share_key] = cost.get(share_key, 0.0) + fixed_cost(tech_key) * cap_gw * model.KW_PER_GW
        flat = techs[tech_key]
        var = (float(flat.get("fuel_eur_mwh") or 0.0) + float(flat.get("waste_eur_mwh") or 0.0)
               + co2_price * float(flat.get("emission_factor_t_mwh") or 0.0))
        if var:
            gen_twh = disp["vre_potential_twh"].get(share_key)
            if gen_twh is None:
                gen_twh = disp["energy_twh"]["nuclear_band"] if share_key == "nuclear" else 0.0
            cost[share_key] = cost.get(share_key, 0.0) + var * gen_twh * annualize * model.MWH_PER_TWH

    # --- Gas-Backup: Leistung aus dem zwischengespeicherten Dispatch -------
    gas_gw = storage.get("gas_backup_gw")
    if gas_gw is None:
        gas_gw = disp["gas_peak_gw"]
    ef_gas = float(techs[gas_tech].get("emission_factor_t_mwh") or 0.0)
    ccs_eur_mwh, ccs_captured_t_mwh = model.ccs_chain(techs[gas_tech])  # v0.2b
    gas_twh = disp["energy_twh"]["gas_backup"] * annualize
    if gas_gw > 0:
        cost["gas_backup"] = cost.get("gas_backup", 0.0) + fixed_cost(gas_tech) * gas_gw * model.KW_PER_GW
        flat = techs[gas_tech]
        fuel, _ = model._fuel_eur_mwh_el(flat)  # v0.2: thermisch -> elektrisch
        cost["gas_backup"] += (fuel + co2_price * ef_gas + ccs_eur_mwh) * gas_twh * model.MWH_PER_TWH

    # --- Bestandsbaender (v0.2/M6): nur CO2-Kosten ------------------------
    legacy = params["system"].get("legacy_bands", {})
    coal_twh = disp["energy_twh"].get("coal_band", 0.0) * annualize
    ef_coal = float((legacy.get("coal", {}).get("emission_factor_t_mwh") or {}).get("value") or 0.0)
    if coal_twh > 0 and ef_coal:
        cost["coal_band"] = cost.get("coal_band", 0.0) + co2_price * ef_coal * coal_twh * model.MWH_PER_TWH

    # --- Speicher ---------------------------------------------------------
    bat_gwh = storage.get("battery_energy_gwh") or 0.0
    if bat_gwh:
        bat = techs["battery"]
        ann = (float(bat["capex_eur_kwh"]) * overrun.get("battery", 1.0)
               * (model.crf(wacc, float(bat["lifetime_years"])) + float(bat["opex_pct"])))
        cost["battery"] = ann * bat_gwh * 1e6
    ely_gw = storage.get("electrolyser_gw") or 0.0
    if ely_gw:
        cost["electrolyser"] = fixed_cost("electrolyser") * ely_gw * model.KW_PER_GW
    if storage.get("h2_storage_gwh"):
        h2_cost = float(techs["h2_storage"]["storage_cost_eur_mwh_h2"]) * overrun.get("h2_storage", 1.0)
        throughput_twh = max(disp["energy_twh"]["h2_produced"], disp["h2_withdrawn_twh"]) * annualize
        cost["h2_storage"] = h2_cost * throughput_twh * model.MWH_PER_TWH
    h2t_gw = storage.get("h2_turbine_gw") or 0.0
    if h2t_gw:
        cost["h2_turbine"] = fixed_cost("h2_turbine") * h2t_gw * model.KW_PER_GW

    # --- Netzausbau (v0.2/M3: Uebertragung + Verteilnetz getrennt) --------
    grid = params["system"]["grid"]
    variant = grid_variant if grid_variant in ("min", "mid", "max") else "mid"
    grid_life = grid["lifetime_years"]["value"]
    grid_crf = model.crf(wacc, grid_life)
    served_twh_a = disp["energy_twh"]["served"] * annualize

    if grid_cost_basis == "ist_netzentgelt":
        ist_grid = float(model._pick(grid["ist_2025_eur_mwh"], variant))
        cost["netz"] = ist_grid * served_twh_a * model.MWH_PER_TWH
    elif grid_cost_basis == "none":
        cost["netz"] = 0.0
    else:
        vre_gen = disp["energy_twh"]["vre_generated"] * annualize
        band_gen = disp["energy_twh"]["band"] * annualize
        curt = disp["energy_twh"]["curtailed"] * annualize
        vre_used = vre_gen - (curt * vre_gen / (vre_gen + band_gen) if (vre_gen + band_gen) else 0.0)
        fee_share_used = vre_used / demand_twh if demand_twh else 0.0
        ref_share = grid["reference_fee_share"]["value"]
        ref_demand = grid["reference_demand_twh"]["value"]
        trans_bn = model._pick(grid["transmission_bn_eur_until_2045"], variant)
        dist_bn = model._pick(grid["distribution_bn_eur_until_2045"], variant)
        scale_t = min(1.0, (fee_share_used / ref_share) if ref_share else 0.0)
        scale_d = min(1.0, (demand_twh / ref_demand) if ref_demand else 0.0)
        cost["netz"] = (overrun.get("netz", 1.0) * grid_crf * 1e9
                        * (trans_bn * scale_t + dist_bn * scale_d))

    total = sum(cost.values())
    lscoe = total / (served_twh_a * model.MWH_PER_TWH) if served_twh_a else float("nan")
    emissions_mt = gas_twh * ef_gas + coal_twh * ef_coal
    return {"lscoe_eur_mwh": lscoe, "total_cost_bn_eur_a": total / 1e9,
            "emissions_mt_co2_a": emissions_mt,
            "captured_mt_co2_a": gas_twh * ccs_captured_t_mwh,
            "cost_components_bn_eur_a": {k: v / 1e9 for k, v in sorted(cost.items())}}


# ==========================================================================
# 4 - Szenario-Presets (identisch zu den Chips im Mix-Simulator)
# ==========================================================================
def _round_js(x: float) -> float:
    """Math.round aus JavaScript (haelfte immer aufwaerts, nicht bankers rounding)."""
    return math.floor(x + 0.5)


def fee_shares_from_gw(fee_gw: float, split: dict, params: dict, demand: float) -> dict:
    out = {}
    for key, tech_key in (("pv", "pv_freiflaeche"), ("wind_onshore", "wind_onshore"),
                          ("wind_offshore", "wind_offshore")):
        flh = float(model.resolve_tech(params, tech_key, "mittel")["full_load_hours"])
        out[key] = fee_gw * split[key] * model.MW_PER_GW * flh / model.MWH_PER_TWH / demand
    return out


def build_presets(params: dict, page: dict) -> list[dict]:
    rec = page["ges"]["reconstruction"]
    split = rec["fee_split_assumption"]
    mix25 = page["ist_mix"]["2025"]["traeger_twh"]
    bsv = page["ist_mix"]["2025"]["bruttostromverbrauch"]
    demand25 = (bsv["low"] + bsv["high"]) / 2.0
    bat25 = page["installierte_leistung_gw"]["batteriespeicher"]["leistung_gw"]["high"]
    dur = float(model.resolve_tech(params, "battery", "mittel")["duration_hours"] or 4)

    def storage(bat_gw, ely_gw, h2t_gw, h2s_twh, fill, gas_auto):
        return {
            "battery_power_gw": bat_gw,
            "battery_energy_gwh": bat_gw * dur,
            "electrolyser_gw": ely_gw,
            "h2_storage_gwh": h2s_twh * 1000.0,
            "h2_turbine_gw": h2t_gw,
            "h2_initial_fill_share": fill,
            "gas_backup_gw": None if gas_auto else 20.0,
        }

    presets = []

    d25 = _round_js(demand25 / 10.0) * 10.0
    # v0.2 (M6): Kohle-, Biomasse- und Wasserband aus ist_zustand_de.md; der
    # Anker deckt seine Residuallast nicht mehr vollstaendig aus Gas. Ausserdem
    # traegt er NICHT die Netzinvestition bis 2045, sondern das heutige
    # Netzentgelt (grid_cost_basis) - und ist damit ein Groessenordnungs-Bezug,
    # kein Ranking-Teilnehmer.
    lb = params["system"]["legacy_bands"]
    presets.append({
        "id": "ist2025", "label": "Ist 2025 (Referenzsystem)", "demand_twh": d25,
        "shares": {"pv": mix25["photovoltaik"]["wert"] / d25,
                   "wind_onshore": mix25["wind_onshore"]["wert"] / d25,
                   "wind_offshore": mix25["wind_offshore"]["wert"] / d25},
        "storage": storage(_round_js(bat25 / 5.0) * 5.0, 0, 0, 0, 0.0, True),
        "bands_twh": {
            "coal_band": lb["coal"]["generation_2025_twh"]["value"],
            "biomass_band": lb["biomass"]["generation_2025_twh"]["value"],
            "hydro_band": lb["hydro"]["generation_2025_twh"]["value"],
        },
        "grid_cost_basis": "ist_netzentgelt",
        "comparable": False,
        "gas_tech": "gas_ccgt",
    })

    # v0.2b: Zu den beiden gasgestuetzten Presets gibt es je eine CCS-Variante.
    # Sie unterscheidet sich AUSSCHLIESSLICH in der Backup-Technologie - gleicher
    # Mix, gleiches Dispatch, gleiche Auslegung. Damit ist der Vergleich sauber.
    for pid, label, bat, ely, h2t, h2s, fill, gas_auto, base_id in (
        ("kostenminimum", "GES · Kostenminimum", 0, 0, 0, 0, 0.0, True, "kostenminimum"),
        ("kostenminimum_ccs", "GES · Kostenminimum (Gas mit CCS)", 0, 0, 0, 0, 0.0, True, "kostenminimum"),
        ("ee80_gas", "GES · 80 % EE + Gas", 40, 0, 0, 0, 0.0, True, "ee80_gas"),
        ("ee80_gas_ccs", "GES · 80 % EE + Gas mit CCS", 40, 0, 0, 0, 0.0, True, "ee80_gas"),
        ("ee80_h2", "GES · 80 % EE + H₂", 40, 100, 80, 300, 1.0, False, "ee80_h2"),
        ("ee100", "GES · 100 % Erneuerbare", 60, 160, 90, 120, 1.0, False, "ee100"),
    ):
        demand = float(rec["demand_twh"])
        s = fee_shares_from_gw(rec["scenarios"][base_id]["fee_gw"], split, params, demand)
        shares = {"pv": s["pv"], "wind_onshore": s["wind_onshore"], "wind_offshore": s["wind_offshore"]}
        if base_id == "kostenminimum":
            nuc = max(0.0, 1.0 - (s["pv"] + s["wind_onshore"] + s["wind_offshore"]))
            if nuc > 0:
                shares["nuclear"] = nuc
        presets.append({"id": pid, "label": label, "demand_twh": demand, "shares": shares,
                        "storage": storage(bat, ely, h2t, h2s, fill, gas_auto),
                        "bands_twh": {}, "grid_cost_basis": "buildout_2045",
                        "comparable": True,
                        "gas_tech": "gas_ccs" if pid.endswith("_ccs") else "gas_ccgt"})
    return presets


# ==========================================================================
# 5 - Simulation
# ==========================================================================
def mid_techs(params: dict) -> dict:
    return {k: model.resolve_tech(params, k, "mittel", apply_idc=True) for k in params["technologies"]}


def summarize(raw_values: list[float], seed: int) -> dict:
    values = sorted(raw_values)
    lo, hi = values[0], values[-1]
    span = hi - lo
    counts = [0] * HIST_BINS
    for v in values:
        idx = HIST_BINS - 1 if span <= 0 else int((v - lo) / span * HIST_BINS)
        if idx >= HIST_BINS:
            idx = HIST_BINS - 1
        counts[idx] += 1
    return {
        "seed": seed,
        "p5": percentile(values, 0.05), "p25": percentile(values, 0.25),
        "p50": percentile(values, 0.50), "p75": percentile(values, 0.75),
        "p95": percentile(values, 0.95),
        "mean": sum(values) / len(values), "min": lo, "max": hi,
        "hist": {"lo": lo, "hi": hi, "bins": HIST_BINS, "counts": counts},
    }


def run_config_paired(presets, params, disps, plan, ov_plan, config, seed, co2_price):
    """N GEPAARTE Ziehungen (common random numbers) ueber ALLE Presets.

    Modell v0.2, Fix M4: Je Ziehung wird EIN Parametersatz gezogen und
    anschliessend auf jedes Szenario angewandt. Damit ist der PV-CAPEX im
    Kernkraft-Szenario derselbe wie im Gas-Szenario - so, wie es in der Welt
    auch waere. Ausgewertet wird zusaetzlich die Verteilung der DIFFERENZ je
    Szenario-Paar; daraus folgt P(A guenstiger als B). Das ersetzt das
    (unzulaessige) Argument ueber die Ueberlappung der Randverteilungen.
    """
    rnd = mulberry32(seed)
    base_techs = mid_techs(params)
    wacc_spec = params["global"]["wacc"]
    co2_spec = params["global"]["co2_price_eur_t"]
    values: dict[str, list[float]] = {p["id"]: [] for p in presets}
    emissions: dict[str, list[float]] = {p["id"]: [] for p in presets}

    # v0.2b: Kontrastverteilung fuer den Kernkraft-CAPEX. Sie ersetzt die
    # Basisverteilung an genau einer Stelle des Ziehungsplans - die Zahl der
    # rnd()-Aufrufe bleibt identisch, damit die Ziehungsfolge zwischen den
    # Konfigurationen vergleichbar bleibt.
    alt = None
    if config.get("nuclear_capex") == "asia_gulf":
        alt = params["technologies"]["nuclear"]["capex_alternative_asia_gulf"]

    for _ in range(N_DRAWS):
        techs = {k: dict(v) for k, v in base_techs.items()}
        for d in plan:
            u = rnd()
            lo, mid, hi = d["min"], d["mid"], d["max"]
            if alt is not None and d["tech"] == "nuclear" and d["field"] == "capex_eur_kw":
                lo, mid, hi = alt["min"], alt["mid"], alt["max"]
            techs[d["tech"]][d["field"]] = triangular(u, lo, mid, hi)
        if alt is not None:
            techs["nuclear"]["construction_years"] = alt["construction_years"]["value"]
        # v0.2 (M1/M7): Abgrenzungsanteile folgen dem gezogenen CAPEX.
        for tech_key in DRAW_TECHS:
            tech = params["technologies"].get(tech_key)
            if not tech:
                continue
            cap_entry = tech["params"].get("capex_eur_kw") or tech["params"].get("capex_eur_kwh")
            if not isinstance(cap_entry, dict):
                continue
            drawn = techs[tech_key].get("capex_eur_kw")
            if drawn is None:
                drawn = techs[tech_key].get("capex_eur_kwh")
            if drawn is None:
                continue
            if alt is not None and tech_key == "nuclear":
                cap_entry = alt
            for field in SCOPE_SHARE_FIELDS:
                share_entry = (alt.get(field) if (alt is not None and tech_key == "nuclear")
                               else tech["params"].get(field))
                if isinstance(share_entry, dict):
                    techs[tech_key][field] = model.scope_share_for_capex(cap_entry, share_entry, drawn)

        wacc = model.scenario_wacc(params, "mittel")
        if config["wacc_uncertain"]:
            wacc = triangular(rnd(), wacc_spec["min"], wacc_spec["mid"], wacc_spec["max"])
        co2 = co2_price
        if config.get("co2_uncertain"):
            co2 = triangular(rnd(), co2_spec["min"], co2_spec["mid"], co2_spec["max"])
        overrun = {}
        if config["overrun"]:
            for o in ov_plan:
                overrun[o["target"]] = triangular(rnd(), o["min"], o["mid"], o["max"])

        for preset in presets:
            res = system_cost(preset["shares"], preset["demand_twh"], params, techs,
                              disps[preset["id"]], wacc, co2, preset["storage"],
                              overrun=overrun, grid_cost_basis=preset["grid_cost_basis"],
                              gas_tech=preset["gas_tech"])
            values[preset["id"]].append(res["lscoe_eur_mwh"])
            emissions[preset["id"]].append(res["emissions_mt_co2_a"])

    stats = {pid: summarize(v, seed) for pid, v in values.items()}
    for pid, e in emissions.items():
        se = sorted(e)
        stats[pid]["emissions_mt_co2_a"] = {
            "p5": percentile(se, 0.05), "p50": percentile(se, 0.50), "p95": percentile(se, 0.95),
            "mean": sum(se) / len(se),
        }
    return stats, values


def pairwise_ranks(values: dict[str, list[float]], order: list[str]) -> list[dict]:
    """P(A guenstiger als B) und Verteilung der Differenz ueber gepaarte Ziehungen."""
    out = []
    for i, a in enumerate(order):
        for b in order[i + 1:]:
            diff = [x - y for x, y in zip(values[a], values[b])]  # A - B
            n = len(diff)
            wins = sum(1 for d in diff if d < 0)
            sd = sorted(diff)
            out.append({
                "a": a, "b": b,
                "p_a_cheaper": wins / n,
                "p_b_cheaper": (n - wins) / n,
                "median_diff_a_minus_b": percentile(sd, 0.50),
                "p5_diff": percentile(sd, 0.05),
                "p95_diff": percentile(sd, 0.95),
                "mean_diff": sum(sd) / n,
                "decided": max(wins / n, (n - wins) / n) >= 0.95,
            })
    return out


def main() -> None:
    params = model.load_params()
    profiles = model.load_profiles(params=params)
    with open(PAGE_PATH, encoding="utf-8") as fh:
        page = json.load(fh)

    co2_price = float(params["global"]["co2_price_eur_t"]["value"])
    presets = build_presets(params, page)
    plan = draw_plan(params)
    ov_plan = overrun_plan(page)

    results = {}
    order = [p["id"] for p in presets]
    disps = {}
    for preset in presets:
        det = model.mix_system(preset["shares"], preset["demand_twh"], params, profiles,
                               scenario="mittel", storage=preset["storage"],
                               co2_price=co2_price, grid_variant="mid", apply_idc=True,
                               bands_twh=preset["bands_twh"],
                               grid_cost_basis=preset["grid_cost_basis"],
                               gas_tech=preset["gas_tech"])
        disp = det["dispatch"]
        disps[preset["id"]] = disp

        # Kontrolle: Der mittlere Parametersatz ueber dem gecachten Dispatch muss
        # das deterministische LSCOE exakt reproduzieren. Wenn nicht, weicht die
        # Kostenfunktion hier von model.mix_system ab.
        check = system_cost(preset["shares"], preset["demand_twh"], params, mid_techs(params),
                            disp, model.scenario_wacc(params, "mittel"), co2_price,
                            preset["storage"], grid_cost_basis=preset["grid_cost_basis"],
                            gas_tech=preset["gas_tech"])
        rel = abs(check["lscoe_eur_mwh"] - det["lscoe_eur_mwh"]) / abs(det["lscoe_eur_mwh"])
        if rel > 1e-9:
            raise SystemExit(
                f"Kostenfunktion weicht von model.mix_system ab ({preset['id']}): "
                f"{check['lscoe_eur_mwh']:.6f} statt {det['lscoe_eur_mwh']:.6f}")

        results[preset["id"]] = {
            "label": preset["label"], "demand_twh": preset["demand_twh"],
            "shares": preset["shares"], "storage": preset["storage"],
            "bands_twh": preset["bands_twh"],
            "grid_cost_basis": preset["grid_cost_basis"],
            "gas_tech": preset["gas_tech"],
            "comparable_to_target_scenarios": preset["comparable"],
            "deterministic_lscoe_eur_mwh": det["lscoe_eur_mwh"],
            "deterministic_components_eur_mwh": det["cost_components_eur_mwh"],
            "emissions_mt_co2_a": det["emissions"]["total_mt_co2_a"],
            "captured_mt_co2_a": det["emissions"]["captured_mt_co2_a"],
            "emissions_detail": det["emissions"],
            "gas_peak_gw": disp["gas_peak_gw"],
            "gas_backup_twh_a": disp["energy_twh"]["gas_backup"] / (disp["seasonal_share_load"] or 1.0),
            "curtailed_twh_a": disp["energy_twh"]["curtailed"] / (disp["seasonal_share_load"] or 1.0),
            "unserved_twh_a": disp["energy_twh"]["unserved"] / (disp["seasonal_share_load"] or 1.0),
            "grid_scaling_raw": det["grid_scaling_raw"],
            "configs": {},
        }

    # ---- Gepaarte Ziehungen: EIN Ziehungsstrom je Konfiguration ----------
    rank_probabilities = {}
    for ci, config in enumerate(CONFIGS):
        seed = BASE_SEED + ci
        stats, values = run_config_paired(presets, params, disps, plan, ov_plan,
                                          config, seed, co2_price)
        for pid in order:
            results[pid]["configs"][config["id"]] = stats[pid]
        rank_probabilities[config["id"]] = pairwise_ranks(values, order)

    out = {
        "meta": {
            "title": "Monte-Carlo-Referenz System-LSCOE",
            "generated_by": "scripts/monte_carlo.py",
            "model_reference": "scripts/model.py (mix_system, Schritt 3)",
            "n_draws": N_DRAWS,
            "base_seed": BASE_SEED,
            "prng": "mulberry32 (32-Bit, bitidentisch nach JavaScript portierbar)",
            "distribution": "Dreieck, Modus = mid, Grenzen = min/max aus data/model_params.json",
            "percentile_method": "lineare Interpolation zwischen Rangplaetzen, Index = (n-1)*p",
            "parity_tolerance_relative": PARITY_TOLERANCE,
            "co2_price_eur_t": co2_price,
            "scenario_set": "mittel",
            "grid_variant": "mid",
            "profiles": {"label": profiles["label"], "hours": profiles["hours"],
                         "data_completeness": profiles["data_completeness"]},
            "model_version": model.MODEL_VERSION,
            "paired_draws": True,
            "paired_draws_note": (
                "v0.2 (M4): common random numbers. Je Konfiguration laeuft EIN Ziehungsstrom "
                "(Seed = base_seed + Konfigurationsindex); jede Ziehung wird auf ALLE Presets "
                "angewandt. Technologieparameter sind damit je Ziehung ueber die Szenarien "
                "identisch. Ausgewertet wird zusaetzlich die Differenzverteilung je Szenariopaar "
                "(rank_probabilities) - die Ueberlappung der Randverteilungen ist KEIN "
                "zulaessiges Rangfolgen-Argument."
            ),
            "assumptions": [
                "Der Dispatch wird je Preset EINMAL mit mittleren Parametern gerechnet und "
                "zwischengespeichert; die 1000 Ziehungen wirken nur auf die Kostenseite.",
                "Damit wirkt die Volllaststunden-Ziehung nur auf die abgeleiteten Kapazitaeten "
                "und deren Kosten, nicht auf Erzeugungsmengen, Backup-Bedarf oder Abregelung.",
                "Gezogen werden CAPEX, Opex, Volllaststunden und der Erdgas-Brennstoffpreis je "
                "Technologie; optional WACC (Dreieck 3/5/9 %), CO2-Preis (Dreieck 0/75/400 EUR/t) "
                "und ein empirischer CAPEX-Ueberschreitungsfaktor.",
                "Bauzins- und Ueberschreitungsaufschlag werden nur auf die dafuer geeignete "
                "Kostenabgrenzung gelegt (idc_applicable_share / overrun_applicable_share, zwischen "
                "den CAPEX-Stuetzstellen linear interpoliert). Fuer Kernkraft heisst das: kein "
                "zusaetzlicher Bauzins auf Gesamtprojekt-Anker, kein Ueberschreitungsfaktor auf den "
                "bereits eskalierten Hinkley-Point-C-Anker.",
                "Der Ist-2025-Anker traegt das heutige Netzentgelt statt der Netzinvestition bis "
                "2045 und ist deshalb NICHT direkt mit den Zielszenarien vergleichbar "
                "(comparable_to_target_scenarios = false).",
                "Innerhalb einer Ziehung sind die Parameter ueber alle Presets identisch; zwischen "
                "den Parametern sind die Ziehungen unabhaengig. Reale Korrelationen (z. B. hoher CAPEX an "
                "guten Standorten, gemeinsame Rohstoffpreise) sind NICHT abgebildet - das "
                "unterschaetzt die Breite der Verteilung an den Raendern eher, als sie zu "
                "uebertreiben.",
                "Nicht variiert werden: Wetterjahr, Lastprofil, Lebensdauern, Wirkungsgrade, "
                "Kernbrennstoff- und Entsorgungskosten, Netzinvestitionsvolumen (ausser ueber den "
                "Ueberschreitungsfaktor 'netz').",
                "Ebenfalls nicht variiert: die H2-Speicherkosten (105 EUR/MWh_H2). Ihre "
                "dokumentierte Spanne oeffnet nur nach unten und ist laut Parameternotiz nur "
                "bei hoher Zyklenzahl erreichbar - der simulierte Saisonspeicher hat aber genau "
                "einen Zyklus im Jahr.",
                "Batterie, Elektrolyse, H2-Speicher und H2-Turbine haben in den "
                "Ueberschreitungsdatensaetzen (Flyvbjerg, Sovacool & Ryu) keine Projektklasse "
                "und bleiben deshalb bei Faktor 1,00. Das ist eine LUECKE, keine Messung - das "
                "Ueberschreitungs-Szenario ist damit asymmetrisch (siehe limitations.overrun_asymmetry).",
            ],
            "limitations": model.model_limitations(),
            "ccs": {
                "technology": "gas_ccs",
                "presets": ["kostenminimum_ccs", "ee80_gas_ccs"],
                "note": "v0.2b: Die CCS-Varianten unterscheiden sich von ihrem Basis-Preset "
                        "AUSSCHLIESSLICH in der Backup-Technologie - gleicher Mix, gleiches "
                        "Dispatch, gleiche Auslegung. Die gepruefte GES-Studie rechnet ihren "
                        "Gas-Pfad mit CCS; erst dieser Vergleich ist deshalb fair.",
                "storage_availability": "Deutschland hat keine CO2-Speicherstaette - die "
                                        "eingelagerte Menge steht als captured_mt_co2_a je Preset "
                                        "im Ergebnis (SETZUNG, siehe limitations).",
            },
            "nuclear_capex_contrast": {
                "configs": ["asia", "asia_wacc"],
                "distribution_eur_kw": {
                    "min": params["technologies"]["nuclear"]["capex_alternative_asia_gulf"]["min"],
                    "mid": params["technologies"]["nuclear"]["capex_alternative_asia_gulf"]["mid"],
                    "max": params["technologies"]["nuclear"]["capex_alternative_asia_gulf"]["max"],
                },
                "anchors": params["technologies"]["nuclear"]["capex_alternative_asia_gulf"]["anchors"],
                "construction_years": params["technologies"]["nuclear"]
                                            ["capex_alternative_asia_gulf"]["construction_years"],
                "rationale_not_in_base_range": params["technologies"]["nuclear"]
                                                     ["capex_alternative_asia_gulf"]
                                                     ["rationale_not_in_base_range"],
                "counterposition": params["technologies"]["nuclear"]
                                         ["capex_alternative_asia_gulf"]["counterposition"],
                "usage": params["technologies"]["nuclear"]["capex_alternative_asia_gulf"]["usage"],
            },
            "overrun_source": "page_data.kostenueberschreitung_faktoren (Flyvbjerg 2023, "
                              "Sovacool & Ryu 2025); Modus = Flyvbjerg-Wert, sonst Sovacool, "
                              "Grenzen = dokumentierte Modellspanne",
        },
        "configs": CONFIGS,
        "draw_plan": plan,
        "overrun_plan": ov_plan,
        "preset_order": order,
        "presets": results,
        "rank_probabilities": rank_probabilities,
    }
    with open(OUT_PATH, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1, sort_keys=False)
        fh.write("\n")

    print(f"✓ {OUT_PATH}")
    print(f"  {len(presets)} Presets x {len(CONFIGS)} Konfigurationen x {N_DRAWS} Ziehungen")
    print(f"  {len(plan)} gezogene Parameter, {len(ov_plan)} Ueberschreitungsfaktoren")
    for pid in order:
        r = results[pid]
        b, o = r["configs"]["base"], r["configs"]["asia"]
        print(f"  {r['label']:34s} det {r['deterministic_lscoe_eur_mwh']:6.1f} | "
              f"P50 {b['p50']:6.1f} [{b['p5']:6.1f}-{b['p95']:6.1f}] | "
              f"Asien {o['p50']:6.1f} | {r['emissions_mt_co2_a']:6.1f} Mt "
              f"| eingelagert {r['captured_mt_co2_a']:5.1f} Mt")
    for cid in ("base", "asia"):
        print(f"  Rangwahrscheinlichkeiten ({cid}):")
        for rp in rank_probabilities[cid]:
            print(f"    P({rp['a']:18s} < {rp['b']:18s}) = {rp['p_a_cheaper'] * 100:5.1f} %  "
                  f"Median Delta {rp['median_diff_a_minus_b']:+7.1f}")


if __name__ == "__main__":
    main()
