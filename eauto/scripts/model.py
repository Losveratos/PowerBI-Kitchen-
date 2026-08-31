#!/usr/bin/env python3
"""Referenzmodell E-Auto-Klimabilanz (Lebenszyklus BEV vs. Verbrenner).

Klein gehalten, aber vollstaendig dokumentiert. Das JS auf
/eauto-klimabilanz.html ist ein 1:1-Port dieser Funktionen; die Seite
verifiziert sich beim Laden gegen data/test_vectors.json.

Alle Emissionen in kg CO2e, sofern nicht anders angegeben.

Modell:
- Produktion: prod_bev_t (ohne Batterie) + batt_kwh * batt_co2  |  prod_ice_t
- Nutzung BEV: cons_bev [kWh/100 km] * Strommix g(t) [g CO2e/kWh],
  Strommix optional als linearer Pfad von strom_start nach strom_ende
  ueber die Nutzungsdauer (Integral geschlossen loesbar).
- Nutzung Verbrenner: cons_ice [l/100 km] * fuel_wtw [kg CO2e/l]
  (Well-to-Wheel = Tank-to-Wheel + Kraftstoff-Vorkette).
- End-of-Life: additive Terme eol_bev_t / eol_ice_t (Gutschrift negativ),
  werden erst in der Gesamtbilanz verrechnet, nicht im Break-even-Verlauf
  (der Break-even vergleicht kumulierte Emissionen WAEHREND der Nutzung).
- Regulierungssicht ("Auspuff-Logik"): BEV = 0 g/km, Verbrenner nur
  Tank-to-Wheel — so bilanziert die EU-Flottenregulierung.
"""
from __future__ import annotations

import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "data")


# ---------------------------------------------------------------- Kernmodell

def lifetime_km(p: dict) -> float:
    return p["km_per_year"] * p["years"]


def strom_integral_gpkwh_years(p: dict, t_years: float) -> float:
    """Integral des Strommix-Pfads g(tau) von 0 bis t in [g/kWh * Jahre].

    g(tau) = strom_start + (strom_ende - strom_start) * tau / years
    (statisch: strom_ende == strom_start).
    """
    y = p["years"]
    start = p["strom_start"]
    ende = p["strom_ende"] if p.get("strom_dynamic") else start
    if y <= 0:
        return 0.0
    return start * t_years + (ende - start) * t_years * t_years / (2.0 * y)


def bev_production_kg(p: dict) -> float:
    return p["prod_bev_t"] * 1000.0 + p["batt_kwh"] * p["batt_co2"]


def ice_production_kg(p: dict) -> float:
    return p["prod_ice_t"] * 1000.0


def bev_cumulative_kg(p: dict, km: float) -> float:
    """Kumulierte BEV-Emissionen (Produktion + Nutzung) nach km Kilometern."""
    t = km / p["km_per_year"] if p["km_per_year"] > 0 else 0.0
    kwh_per_km = p["cons_bev"] / 100.0
    op_g = kwh_per_km * p["km_per_year"] * strom_integral_gpkwh_years(p, t)
    return bev_production_kg(p) + op_g / 1000.0


def ice_cumulative_kg(p: dict, km: float) -> float:
    kg_per_km = p["cons_ice"] / 100.0 * p["fuel_wtw"]
    return ice_production_kg(p) + kg_per_km * km


def break_even_km(p: dict) -> float | None:
    """Erster Schnittpunkt der kumulierten Kurven via Bisektion.

    None, wenn das BEV innerhalb der Lebensfahrleistung nicht unter die
    Verbrenner-Kurve kommt (oder ab km 0 bereits darunter liegt es trivial
    bei 0 — kommt praktisch nicht vor, da Produktion BEV > ICE).
    """
    total = lifetime_km(p)
    diff = lambda km: bev_cumulative_kg(p, km) - ice_cumulative_kg(p, km)
    if diff(0.0) <= 0.0:
        return 0.0
    if diff(total) > 0.0:
        return None
    lo, hi = 0.0, total
    for _ in range(200):
        mid = (lo + hi) / 2.0
        if diff(mid) > 0.0:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2.0


def run(p: dict) -> dict:
    """Gesamtbilanz + Zerlegung + Regulierungssicht fuer einen Parametersatz."""
    total_km = lifetime_km(p)
    bev_prod = bev_production_kg(p)
    bev_batt = p["batt_kwh"] * p["batt_co2"]
    bev_op = bev_cumulative_kg(p, total_km) - bev_prod
    bev_total = bev_prod + bev_op + p["eol_bev_t"] * 1000.0

    ice_prod = ice_production_kg(p)
    ice_op = ice_cumulative_kg(p, total_km) - ice_prod
    # Zerlegung der Verbrenner-Nutzung in Auspuff (TTW) und Vorkette:
    ttw_share = p["fuel_ttw"] / p["fuel_wtw"] if p["fuel_wtw"] > 0 else 0.0
    ice_total = ice_prod + ice_op + p["eol_ice_t"] * 1000.0

    reduction = (1.0 - bev_total / ice_total) * 100.0 if ice_total > 0 else 0.0
    return {
        "total_km": total_km,
        "bev": {
            "prod_base_kg": bev_prod - bev_batt,
            "battery_kg": bev_batt,
            "operation_kg": bev_op,
            "eol_kg": p["eol_bev_t"] * 1000.0,
            "total_kg": bev_total,
            "g_per_km": bev_total / total_km * 1000.0 if total_km else 0.0,
        },
        "ice": {
            "prod_kg": ice_prod,
            "fuel_ttw_kg": ice_op * ttw_share,
            "fuel_chain_kg": ice_op * (1.0 - ttw_share),
            "eol_kg": p["eol_ice_t"] * 1000.0,
            "total_kg": ice_total,
            "g_per_km": ice_total / total_km * 1000.0 if total_km else 0.0,
        },
        "reduction_pct": reduction,
        "break_even_km": break_even_km(p),
        # EU-Flottenregulierung: nur direkte Abgase.
        "regulatory": {
            "bev_g_per_km": 0.0,
            "ice_g_per_km": p["cons_ice"] / 100.0 * p["fuel_ttw"] * 1000.0,
        },
    }


# ---------------------------------------------------------------- Presets

def load_params() -> dict:
    with open(os.path.join(DATA, "model_params.json"), encoding="utf-8") as f:
        return json.load(f)


def preset_params(params_file: dict, preset_id: str) -> dict:
    """Preset-Overrides auf die Default-Mittelwerte anwenden."""
    base = {k: v["value"] for k, v in params_file["defaults"].items()}
    preset = next(x for x in params_file["presets"] if x["id"] == preset_id)
    base.update(preset["overrides"])
    return base


if __name__ == "__main__":
    pf = load_params()
    for pr in pf["presets"]:
        p = preset_params(pf, pr["id"])
        r = run(p)
        be = r["break_even_km"]
        print(
            f"{pr['id']:<22} BEV {r['bev']['g_per_km']:6.1f} g/km | "
            f"ICE {r['ice']['g_per_km']:6.1f} g/km | "
            f"Reduktion {r['reduction_pct']:6.1f} % | "
            f"Break-even {be/1000.0:7.1f} tkm" if be is not None else
            f"{pr['id']:<22} BEV {r['bev']['g_per_km']:6.1f} g/km | "
            f"ICE {r['ice']['g_per_km']:6.1f} g/km | "
            f"Reduktion {r['reduction_pct']:6.1f} % | Break-even —"
        )
