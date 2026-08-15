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
    "gas_ccgt", "battery", "electrolyser", "h2_turbine", "h2_storage",
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
]

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
    "netz": "netz_uebertragung",
}

CONFIGS = [
    {"id": "base", "wacc_uncertain": False, "overrun": False,
     "label": "WACC fest (5 %), ohne Kostenueberschreitung"},
    {"id": "wacc", "wacc_uncertain": True, "overrun": False,
     "label": "WACC unsicher (Dreieck 3/5/9 %), ohne Kostenueberschreitung"},
    {"id": "overrun", "wacc_uncertain": False, "overrun": True,
     "label": "WACC fest (5 %), mit empirischer Kostenueberschreitung"},
    {"id": "wacc_overrun", "wacc_uncertain": True, "overrun": True,
     "label": "WACC unsicher, mit empirischer Kostenueberschreitung"},
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
                gas_tech="gas_ccgt", firm_tech="nuclear") -> dict:
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
                gen_twh = disp["energy_twh"]["band"] if share_key == "nuclear" else 0.0
            cost[share_key] = cost.get(share_key, 0.0) + var * gen_twh * annualize * model.MWH_PER_TWH

    # --- Gas-Backup: Leistung aus dem zwischengespeicherten Dispatch -------
    gas_gw = storage.get("gas_backup_gw")
    if gas_gw is None:
        gas_gw = disp["gas_peak_gw"]
    if gas_gw > 0:
        cost["gas_backup"] = cost.get("gas_backup", 0.0) + fixed_cost(gas_tech) * gas_gw * model.KW_PER_GW
        flat = techs[gas_tech]
        fuel = float(flat.get("fuel_eur_mwh") or 0.0)  # fehlt in den Dossiers -> 0 (Untergrenze)
        ef = float(flat.get("emission_factor_t_mwh") or 0.0)
        gas_twh = disp["energy_twh"]["gas_backup"] * annualize
        cost["gas_backup"] += (fuel + co2_price * ef) * gas_twh * model.MWH_PER_TWH

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

    # --- Netzausbau -------------------------------------------------------
    fee_share = sum(v for k, v in shares.items() if k in model.VRE_TECHS)
    grid = params["system"]["grid"]
    invest_bn = model._pick(grid["investment_bn_eur_until_2045"],
                            grid_variant if grid_variant in ("min", "mid", "max") else "mid")
    grid_life = grid["lifetime_years"]["value"]
    ref_share = grid["reference_fee_share"]["value"]
    cost["netz"] = (invest_bn * 1e9 * overrun.get("netz", 1.0)
                    * model.crf(wacc, grid_life) * (fee_share / ref_share))

    served_twh_a = disp["energy_twh"]["served"] * annualize
    total = sum(cost.values())
    lscoe = total / (served_twh_a * model.MWH_PER_TWH) if served_twh_a else float("nan")
    return {"lscoe_eur_mwh": lscoe, "total_cost_bn_eur_a": total / 1e9,
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
    presets.append({
        "id": "ist2025", "label": "Ist 2025", "demand_twh": d25,
        "shares": {"pv": mix25["photovoltaik"]["wert"] / d25,
                   "wind_onshore": mix25["wind_onshore"]["wert"] / d25,
                   "wind_offshore": mix25["wind_offshore"]["wert"] / d25},
        "storage": storage(_round_js(bat25 / 5.0) * 5.0, 0, 0, 0, 0.0, True),
    })

    for pid, label, bat, ely, h2t, h2s, fill, gas_auto in (
        ("kostenminimum", "GES · Kostenminimum", 0, 0, 0, 0, 0.0, True),
        ("ee80_gas", "GES · 80 % EE + Gas", 40, 0, 0, 0, 0.0, True),
        ("ee80_h2", "GES · 80 % EE + H₂", 40, 100, 80, 300, 1.0, False),
        ("ee100", "GES · 100 % Erneuerbare", 60, 160, 90, 120, 1.0, False),
    ):
        demand = float(rec["demand_twh"])
        s = fee_shares_from_gw(rec["scenarios"][pid]["fee_gw"], split, params, demand)
        shares = {"pv": s["pv"], "wind_onshore": s["wind_onshore"], "wind_offshore": s["wind_offshore"]}
        if pid == "kostenminimum":
            nuc = max(0.0, 1.0 - (s["pv"] + s["wind_onshore"] + s["wind_offshore"]))
            if nuc > 0:
                shares["nuclear"] = nuc
        presets.append({"id": pid, "label": label, "demand_twh": demand, "shares": shares,
                        "storage": storage(bat, ely, h2t, h2s, fill, gas_auto)})
    return presets


# ==========================================================================
# 5 - Simulation
# ==========================================================================
def mid_techs(params: dict) -> dict:
    return {k: model.resolve_tech(params, k, "mittel", apply_idc=True) for k in params["technologies"]}


def run_config(preset, params, page, disp, plan, ov_plan, config, seed, co2_price):
    """N Ziehungen fuer ein Preset und eine Toggle-Kombination."""
    rnd = mulberry32(seed)
    base_techs = mid_techs(params)
    wacc_spec = params["global"]["wacc"]
    values = []
    for _ in range(N_DRAWS):
        techs = {k: dict(v) for k, v in base_techs.items()}
        for d in plan:
            techs[d["tech"]][d["field"]] = triangular(rnd(), d["min"], d["mid"], d["max"])
        wacc = model.scenario_wacc(params, "mittel")
        if config["wacc_uncertain"]:
            wacc = triangular(rnd(), wacc_spec["min"], wacc_spec["mid"], wacc_spec["max"])
        overrun = {}
        if config["overrun"]:
            for o in ov_plan:
                overrun[o["target"]] = triangular(rnd(), o["min"], o["mid"], o["max"])
        res = system_cost(preset["shares"], preset["demand_twh"], params, techs, disp,
                          wacc, co2_price, preset["storage"], overrun=overrun)
        values.append(res["lscoe_eur_mwh"])

    values.sort()
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
    order = []
    for pi, preset in enumerate(presets):
        det = model.mix_system(preset["shares"], preset["demand_twh"], params, profiles,
                               scenario="mittel", storage=preset["storage"],
                               co2_price=co2_price, grid_variant="mid", apply_idc=True)
        disp = det["dispatch"]

        # Kontrolle: Der mittlere Parametersatz ueber dem gecachten Dispatch muss
        # das deterministische LSCOE exakt reproduzieren. Wenn nicht, weicht die
        # Kostenfunktion hier von model.mix_system ab.
        check = system_cost(preset["shares"], preset["demand_twh"], params, mid_techs(params),
                            disp, model.scenario_wacc(params, "mittel"), co2_price,
                            preset["storage"])
        rel = abs(check["lscoe_eur_mwh"] - det["lscoe_eur_mwh"]) / abs(det["lscoe_eur_mwh"])
        if rel > 1e-9:
            raise SystemExit(
                f"Kostenfunktion weicht von model.mix_system ab ({preset['id']}): "
                f"{check['lscoe_eur_mwh']:.6f} statt {det['lscoe_eur_mwh']:.6f}")

        entry = {"label": preset["label"], "demand_twh": preset["demand_twh"],
                 "shares": preset["shares"], "storage": preset["storage"],
                 "deterministic_lscoe_eur_mwh": det["lscoe_eur_mwh"],
                 "gas_peak_gw": disp["gas_peak_gw"], "configs": {}}
        for ci, config in enumerate(CONFIGS):
            seed = BASE_SEED + pi * 1000 + ci
            entry["configs"][config["id"]] = run_config(
                preset, params, page, disp, plan, ov_plan, config, seed, co2_price)
        results[preset["id"]] = entry
        order.append(preset["id"])

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
            "assumptions": [
                "Der Dispatch wird je Preset EINMAL mit mittleren Parametern gerechnet und "
                "zwischengespeichert; die 1000 Ziehungen wirken nur auf die Kostenseite.",
                "Damit wirkt die Volllaststunden-Ziehung nur auf die abgeleiteten Kapazitaeten "
                "und deren Kosten, nicht auf Erzeugungsmengen, Backup-Bedarf oder Abregelung.",
                "Gezogen werden CAPEX, Opex und Volllaststunden je Technologie; optional WACC "
                "(Dreieck 3/5/9 %) und ein empirischer CAPEX-Ueberschreitungsfaktor.",
                "Alle Ziehungen sind unabhaengig. Reale Korrelationen (z. B. hoher CAPEX an "
                "guten Standorten, gemeinsame Rohstoffpreise) sind NICHT abgebildet - das "
                "unterschaetzt die Breite der Verteilung an den Raendern eher, als sie zu "
                "uebertreiben.",
                "Nicht variiert werden: Wetterjahr, Lastprofil, Lebensdauern, Wirkungsgrade, "
                "Brennstoff- und Entsorgungskosten, CO2-Preis, Netzinvestitionsvolumen.",
                "Ebenfalls nicht variiert: die H2-Speicherkosten (105 EUR/MWh_H2). Ihre "
                "dokumentierte Spanne oeffnet nur nach unten und ist laut Parameternotiz nur "
                "bei hoher Zyklenzahl erreichbar - der simulierte Saisonspeicher hat aber genau "
                "einen Zyklus im Jahr.",
                "Batterie, Elektrolyse, H2-Speicher und H2-Turbine haben in den "
                "Ueberschreitungsdatensaetzen (Flyvbjerg, Sovacool & Ryu) keine Projektklasse "
                "und bleiben deshalb bei Faktor 1,00.",
            ],
            "overrun_source": "page_data.kostenueberschreitung_faktoren (Flyvbjerg 2023, "
                              "Sovacool & Ryu 2025); Modus = Flyvbjerg-Wert, sonst Sovacool, "
                              "Grenzen = dokumentierte Modellspanne",
        },
        "configs": CONFIGS,
        "draw_plan": plan,
        "overrun_plan": ov_plan,
        "preset_order": order,
        "presets": results,
    }
    with open(OUT_PATH, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1, sort_keys=False)
        fh.write("\n")

    print(f"✓ {OUT_PATH}")
    print(f"  {len(presets)} Presets x {len(CONFIGS)} Konfigurationen x {N_DRAWS} Ziehungen")
    print(f"  {len(plan)} gezogene Parameter, {len(ov_plan)} Ueberschreitungsfaktoren")
    for pid in order:
        r = results[pid]
        b, o = r["configs"]["base"], r["configs"]["overrun"]
        print(f"  {r['label']:26s} det {r['deterministic_lscoe_eur_mwh']:6.1f} | "
              f"P50 {b['p50']:6.1f} [{b['p5']:6.1f}-{b['p95']:6.1f}] | "
              f"mit Ueberschreitung P50 {o['p50']:6.1f} [{o['p5']:6.1f}-{o['p95']:6.1f}]")


if __name__ == "__main__":
    main()
