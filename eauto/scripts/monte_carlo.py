#!/usr/bin/env python3
"""Monte-Carlo-Referenz fuer das E-Auto-Klimabilanz-Modell.

Fragestellung
    Das Punktmodell (model.py) rechnet mit Mittelwerten. Jeder Parameter ist
    aber eine Spanne (min/value/max in data/model_params.json). Diese Rechnung
    zieht daraus Dreiecksverteilungen und zeigt:
      1. die Verteilung des Produktions-"Rucksacks" von E-Auto und Verbrenner,
      2. die Verteilung der Lebenszyklus-Bilanz und der Ersparnis je Fahrzeug
         fuer drei Netz-Regionen (DE / EU-27 / Welt),
      3. die Hochrechnung: was eine vollelektrische Pkw-Flotte pro Jahr
         einsparen wuerde - in Mt CO2e und relativ zu Gesamt- und
         Pkw-Emissionen der Region.

Korrelationsstruktur (der inhaltliche Kern)
    Drei gemeinsame Faktoren je Ziehung, damit die Annahmen konsistent sind:
      u_segment  Fahrzeuggroesse: treibt Batteriegroesse, beide Verbraeuche
                 und beide Produktionsemissionen (grosses Auto = ueberall mehr).
      u_energy   Sauberkeit des Energiesystems: treibt Strommix (Start UND
                 Ende des Pfads), Batteriefertigung und Kraftstoff-Vorkette.
                 Wird der Strom sauberer, wird also auch der Verbrenner
                 sauberer - nur schwaecher, weil nur seine Vorkette am
                 Stromsystem haengt, nicht die Verbrennung selbst.
      Fahrprofil: km/Jahr und Nutzungsdauer werden je Ziehung EINMAL gezogen
                 (zwei unabhaengige Ziehungen, kein eigener Mischfaktor) und
                 fuer beide Antriebe identisch verwendet - derselbe Fahrer.
    Mischung: u = clamp01(w * u_shared + (1-w) * u_eigen). Die Gewichte sind
    Setzungen (Konfidenz C, dokumentiert in model_params.json -> mc.weights).
    Die Mischung macht die Randverteilungen leicht mittenlastiger als ein
    reines Dreieck - bewusst in Kauf genommen.

Determinismus
    PRNG mulberry32 (identisch zum Strommix-Projekt), damit der JS-Port
    bitidentisch dieselbe Ziehungsfolge erzeugt. Die ZIEHUNGSREIHENFOLGE ist
    normativ und darf nur synchron mit dem JS-Port geaendert werden:
      je Ziehung: u_segment, u_energy, km_per_year, years,
                  batt_kwh, batt_co2, prod_bev, prod_ice,
                  cons_bev, cons_ice, fuel_chain, eol_bev, eol_ice,
                  [nur mit scaleup-Block:] km_fleet, years_fleet,
                                           cons_bev_fleet, cons_ice_fleet,
      dann je Region (Reihenfolge wie mc.regions):
                  strom_start, strom_ende,
                  [nur mit scaleup-Block:] bestand, total_mt, pkw_mt

Hochrechnung: Streuung vs. Unsicherheit des Mittels
    Die km/Jahr-Ziehung oben bildet die HETEROGENITAET der Fahrer ab
    (5.000-30.000 km) - richtig fuer die Einzelfahrzeug-Verteilung, aber
    falsch fuer die Flotte: deren Erwartungswert ist das KBA-Mittel, nicht
    der Mittelwert der Dreiecksverteilung (der laege ~25 % zu hoch). Die
    Hochrechnung nutzt deshalb EIGENE, enge Ziehungen um die Flottenmittel
    (scaleup.km_fleet / years_fleet / cons_bev_fleet / cons_ice_fleet) und
    rechnet die Fahrzeugbilanz damit noch einmal. Die uebrigen
    Fahrzeugparameter (Batterie, Produktion) behalten die Ziehung des
    Einzelfahrzeugs - deren Verteilungsmittel liegt nahe am Flottenmittel.

Aufruf:  python3 scripts/monte_carlo.py
Ausgabe: data/monte_carlo_reference.json
"""
from __future__ import annotations

import json
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import model  # noqa: E402

DATA = model.DATA
OUT = os.path.join(DATA, "monte_carlo_reference.json")
HIST_BINS = 40
MASK32 = 0xFFFFFFFF


# ----------------------------------------------------------- PRNG + Verteilung
def _imul(a: int, b: int) -> int:
    return (a * b) & MASK32


def mulberry32(seed: int):
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
    if hi <= lo:
        return lo
    mode = min(max(mode, lo), hi)
    c = (mode - lo) / (hi - lo)
    if u < c:
        return lo + math.sqrt(u * (hi - lo) * (mode - lo))
    return hi - math.sqrt((1.0 - u) * (hi - lo) * (hi - mode))


def blend(u_shared: float, u_own: float, w: float) -> float:
    return min(max(w * u_shared + (1.0 - w) * u_own, 0.0), 1.0)


def percentile(sorted_vals: list[float], p: float) -> float:
    n = len(sorted_vals)
    if n == 0:
        return float("nan")
    idx = (n - 1) * p
    lo, hi = int(math.floor(idx)), int(math.ceil(idx))
    if lo == hi:
        return sorted_vals[lo]
    return sorted_vals[lo] + (sorted_vals[hi] - sorted_vals[lo]) * (idx - lo)


def summarize(values: list[float]) -> dict:
    s = sorted(values)
    return {
        "p5": percentile(s, 0.05), "p25": percentile(s, 0.25),
        "p50": percentile(s, 0.50), "p75": percentile(s, 0.75),
        "p95": percentile(s, 0.95), "n": len(s),
    }


def histogram(values: list[float], lo: float, hi: float, bins: int = HIST_BINS) -> dict:
    counts = [0] * bins
    if hi <= lo:
        hi = lo + 1.0
    for v in values:
        k = int((v - lo) / (hi - lo) * bins)
        counts[min(max(k, 0), bins - 1)] += 1
    return {"lo": lo, "hi": hi, "bins": bins, "counts": counts}


# ----------------------------------------------------------------- Simulation
def tri_spec(d: dict) -> tuple[float, float, float]:
    return d["min"], d.get("mid", d.get("value")), d["max"]


def tornado(pf: dict) -> dict:
    """Eine-Annahme-nach-der-anderen-Analyse (deterministisch, kein Zufall).

    Ausgangspunkt: alle Parameter auf Mittelwert, deutsches Netz mit
    Pfad-Mittelwerten. Dann wird je Annahme EINZELN auf min bzw. max
    gestellt und die Aenderung der Ersparnis je Fahrzeug (t CO2e) relativ
    zum Ausgangspunkt festgehalten. Sortiert nach Hebelwirkung.
    Der JS-Port rechnet identisch; Werte stehen in der Paritaetsliste.
    """
    dflt = pf["defaults"]
    mc = pf["mc"]
    de = next(r for r in mc["regions"] if r["id"] == "de")
    ttw = dflt["fuel_ttw"]["value"]
    keys = ["batt_kwh", "batt_co2", "prod_bev_t", "prod_ice_t",
            "cons_bev", "cons_ice", "km_per_year", "years",
            "eol_bev_t", "eol_ice_t"]

    def make_p(over: dict) -> dict:
        p = {k: dflt[k]["value"] for k in keys}
        p["fuel_ttw"] = ttw
        p["fuel_wtw"] = ttw + mc["fuel_chain"]["mid"]
        p["strom_start"] = tri_spec(de["strom_start"])[1]
        p["strom_ende"] = min(tri_spec(de["strom_ende"])[1], p["strom_start"])
        p["strom_dynamic"] = True
        p.update(over)
        return p

    def delta_of(over: dict) -> float:
        r = model.run(make_p(over))
        return (r["ice"]["total_kg"] - r["bev"]["total_kg"]) / 1000.0

    baseline = delta_of({})
    levers = []

    def add(lid: str, label: str, over_lo: dict, over_hi: dict,
            lo_label: str, hi_label: str) -> None:
        levers.append({
            "id": lid, "label": label,
            "lo_label": lo_label, "hi_label": hi_label,
            "d_lo": delta_of(over_lo) - baseline,
            "d_hi": delta_of(over_hi) - baseline,
        })

    for k in keys:
        d = dflt[k]
        add(k, d["label"], {k: d["min"]}, {k: d["max"]},
            f"{d['min']:g} {d['unit']}", f"{d['max']:g} {d['unit']}")
    fc = mc["fuel_chain"]
    add("fuel_chain", "Kraftstoff-Vorkette",
        {"fuel_wtw": ttw + fc["min"]}, {"fuel_wtw": ttw + fc["max"]},
        f"+{fc['min']:g} kg/l", f"+{fc['max']:g} kg/l")
    ss, se = de["strom_start"], de["strom_ende"]
    add("strommix", "Strommix-Pfad (DE, Start und Ende)",
        {"strom_start": ss["min"], "strom_ende": min(se["min"], ss["min"])},
        {"strom_start": ss["max"], "strom_ende": min(se["max"], ss["max"])},
        f"{ss['min']:g}→{min(se['min'], ss['min']):g} g/kWh",
        f"{ss['max']:g}→{min(se['max'], ss['max']):g} g/kWh")

    levers.sort(key=lambda l: max(abs(l["d_lo"]), abs(l["d_hi"])), reverse=True)
    return {
        "metric": "Ersparnis je Fahrzeug, Deutschland, mit Strompfad [t CO2e]",
        "baseline_t": baseline,
        "levers": levers,
    }


def run_mc(pf: dict) -> dict:
    mc = pf["mc"]
    w = mc["weights"]
    dflt = pf["defaults"]
    regions = mc["regions"]
    scaleup = pf.get("scaleup")
    n = mc["n_draws"]
    rnd = mulberry32(mc["base_seed"])

    def dspec(key):
        d = dflt[key]
        return d["min"], d["value"], d["max"]

    draws = {
        "rucksack_bev_t": [], "rucksack_ice_t": [], "rucksack_diff_t": [],
        "km_life": [], "years": [],
    }
    per_region: dict[str, dict[str, list[float]]] = {
        r["id"]: {"bev_t": [], "ice_t": [], "delta_t": [], "reduction_pct": [],
                  "breakeven_km": [], "ersparnis_a_t": [],
                  "mt_a": [], "pct_total": [], "pct_pkw": []}
        for r in regions
    }
    no_breakeven = {r["id"]: 0 for r in regions}

    for _ in range(n):
        u_segment = rnd()
        u_energy = rnd()
        km_per_year = triangular(rnd(), *dspec("km_per_year"))
        years = triangular(rnd(), *dspec("years"))
        batt_kwh = triangular(blend(u_segment, rnd(), w["segment_on_batt_kwh"]), *dspec("batt_kwh"))
        batt_co2 = triangular(blend(u_energy, rnd(), w["energy_on_batt"]), *dspec("batt_co2"))
        prod_bev = triangular(blend(u_segment, rnd(), w["segment_on_prod"]), *dspec("prod_bev_t"))
        prod_ice = triangular(blend(u_segment, rnd(), w["segment_on_prod"]), *dspec("prod_ice_t"))
        cons_bev = triangular(blend(u_segment, rnd(), w["segment_on_cons"]), *dspec("cons_bev"))
        cons_ice = triangular(blend(u_segment, rnd(), w["segment_on_cons"]), *dspec("cons_ice"))
        fuel_chain = triangular(blend(u_energy, rnd(), w["energy_on_fuelchain"]), *tri_spec(mc["fuel_chain"]))
        eol_bev = triangular(rnd(), *dspec("eol_bev_t"))
        eol_ice = triangular(rnd(), *dspec("eol_ice_t"))
        if scaleup:
            km_fleet = triangular(rnd(), *tri_spec(scaleup["km_fleet"]))
            years_fleet = triangular(rnd(), *tri_spec(scaleup["years_fleet"]))
            cons_bev_fleet = triangular(rnd(), *tri_spec(scaleup["cons_bev_fleet"]))
            cons_ice_fleet = triangular(rnd(), *tri_spec(scaleup["cons_ice_fleet"]))

        fuel_ttw = dflt["fuel_ttw"]["value"]
        rucksack_bev = prod_bev + batt_kwh * batt_co2 / 1000.0
        draws["rucksack_bev_t"].append(rucksack_bev)
        draws["rucksack_ice_t"].append(prod_ice)
        draws["rucksack_diff_t"].append(rucksack_bev - prod_ice)
        draws["km_life"].append(km_per_year * years)
        draws["years"].append(years)

        for r in regions:
            strom_start = triangular(blend(u_energy, rnd(), w["energy_on_grid"]), *tri_spec(r["strom_start"]))
            strom_ende = triangular(blend(u_energy, rnd(), w["energy_on_grid"]), *tri_spec(r["strom_ende"]))
            strom_ende = min(strom_ende, strom_start)  # Pfad faellt, steigt nie

            p = {
                "batt_kwh": batt_kwh, "batt_co2": batt_co2,
                "prod_bev_t": prod_bev, "prod_ice_t": prod_ice,
                "cons_bev": cons_bev, "cons_ice": cons_ice,
                "fuel_ttw": fuel_ttw, "fuel_wtw": fuel_ttw + fuel_chain,
                "strom_start": strom_start, "strom_ende": strom_ende,
                "strom_dynamic": True,
                "km_per_year": km_per_year, "years": years,
                "eol_bev_t": eol_bev, "eol_ice_t": eol_ice,
            }
            res = model.run(p)
            rid = r["id"]
            bev_t = res["bev"]["total_kg"] / 1000.0
            ice_t = res["ice"]["total_kg"] / 1000.0
            delta = ice_t - bev_t
            per_region[rid]["bev_t"].append(bev_t)
            per_region[rid]["ice_t"].append(ice_t)
            per_region[rid]["delta_t"].append(delta)
            per_region[rid]["reduction_pct"].append(res["reduction_pct"])
            be = res["break_even_km"]
            if be is None:
                no_breakeven[rid] += 1
            else:
                per_region[rid]["breakeven_km"].append(be)
            ersparnis_a = delta / years
            per_region[rid]["ersparnis_a_t"].append(ersparnis_a)

            if scaleup:
                sc = next(s for s in scaleup["regions"] if s["id"] == rid)
                bestand = triangular(rnd(), *tri_spec(sc["bestand_mio"]))
                total_mt = triangular(rnd(), *tri_spec(sc["total_mt"]))
                pkw_mt = triangular(rnd(), *tri_spec(sc["pkw_mt"]))
                # Flottenbilanz: gleiches Fahrzeug/Netz, aber Flottenmittel-
                # Fahrprofil statt Fahrer-Streuung (siehe Docstring).
                p_fleet = dict(p, km_per_year=km_fleet, years=years_fleet,
                               cons_bev=cons_bev_fleet, cons_ice=cons_ice_fleet)
                res_fleet = model.run(p_fleet)
                delta_fleet = (res_fleet["ice"]["total_kg"] - res_fleet["bev"]["total_kg"]) / 1000.0
                mt_a = delta_fleet / years_fleet * bestand  # t/Fzg/a * Mio Fzg = Mt/a
                per_region[rid]["mt_a"].append(mt_a)
                per_region[rid]["pct_total"].append(mt_a / total_mt * 100.0)
                per_region[rid]["pct_pkw"].append(mt_a / pkw_mt * 100.0)

    # ---------------- Auswertung
    ruck_lo = 0.0
    ruck_hi = max(max(draws["rucksack_bev_t"]), max(draws["rucksack_ice_t"])) * 1.02
    out = {
        "meta": {
            "n_draws": n, "base_seed": mc["base_seed"],
            "prng": "mulberry32 (bitidentisch nach JS portierbar)",
            "tolerance_pct": mc["tolerance_pct"],
            "note": "Ziehungsreihenfolge normativ, siehe scripts/monte_carlo.py-Docstring.",
            "has_scaleup": bool(scaleup),
        },
        "rucksack": {
            "bev": summarize(draws["rucksack_bev_t"]),
            "ice": summarize(draws["rucksack_ice_t"]),
            "diff": summarize(draws["rucksack_diff_t"]),
            "hist_bev": histogram(draws["rucksack_bev_t"], ruck_lo, ruck_hi),
            "hist_ice": histogram(draws["rucksack_ice_t"], ruck_lo, ruck_hi),
        },
        "usage": {
            "km_life": summarize(draws["km_life"]),
            "years": summarize(draws["years"]),
        },
        "regions": {},
        "tornado": tornado(pf),
    }
    for r in regions:
        rid = r["id"]
        d = per_region[rid]
        delta_lo = min(min(d["delta_t"]), 0.0)
        delta_hi = max(d["delta_t"]) * 1.02
        entry = {
            "label": r["label"],
            "bev_t": summarize(d["bev_t"]),
            "ice_t": summarize(d["ice_t"]),
            "delta_t": summarize(d["delta_t"]),
            "reduction_pct": summarize(d["reduction_pct"]),
            "ersparnis_a_t": summarize(d["ersparnis_a_t"]),
            "hist_delta": histogram(d["delta_t"], delta_lo, delta_hi),
            "share_ice_better_pct": 100.0 * sum(1 for v in d["delta_t"] if v < 0) / n,
            "breakeven_km": summarize(d["breakeven_km"]) if d["breakeven_km"] else None,
            "no_breakeven_pct": 100.0 * no_breakeven[rid] / n,
        }
        if scaleup:
            entry["mt_a"] = summarize(d["mt_a"])
            entry["pct_total"] = summarize(d["pct_total"])
            entry["pct_pkw"] = summarize(d["pct_pkw"])
        out["regions"][rid] = entry

    # Paritaetsliste fuer den JS-Selbsttest: kompakte Kennzahlen (P50s).
    parity = {
        "rucksack_bev_p50": out["rucksack"]["bev"]["p50"],
        "rucksack_ice_p50": out["rucksack"]["ice"]["p50"],
        "rucksack_diff_p50": out["rucksack"]["diff"]["p50"],
    }
    for rid, e in out["regions"].items():
        parity[f"{rid}_delta_p50"] = e["delta_t"]["p50"]
        parity[f"{rid}_delta_p5"] = e["delta_t"]["p5"]
        parity[f"{rid}_delta_p95"] = e["delta_t"]["p95"]
        parity[f"{rid}_reduction_p50"] = e["reduction_pct"]["p50"]
        if scaleup:
            parity[f"{rid}_mt_a_p50"] = e["mt_a"]["p50"]
            parity[f"{rid}_pct_total_p50"] = e["pct_total"]["p50"]
    parity["tor_baseline"] = out["tornado"]["baseline_t"]
    for lv in out["tornado"]["levers"]:
        parity[f"tor_{lv['id']}_lo"] = lv["d_lo"]
        parity[f"tor_{lv['id']}_hi"] = lv["d_hi"]
    out["parity"] = parity
    return out


def main() -> None:
    pf = model.load_params()
    out = run_mc(pf)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f"[ok] Monte Carlo -> {OUT}")
    print(f"  Rucksack BEV P50 {out['rucksack']['bev']['p50']:.2f} t "
          f"[{out['rucksack']['bev']['p5']:.2f}-{out['rucksack']['bev']['p95']:.2f}] | "
          f"ICE P50 {out['rucksack']['ice']['p50']:.2f} t")
    for rid, e in out["regions"].items():
        line = (f"  {e['label']:<12} Ersparnis/Fzg P50 {e['delta_t']['p50']:6.1f} t "
                f"[{e['delta_t']['p5']:.1f}-{e['delta_t']['p95']:.1f}] | "
                f"Reduktion P50 {e['reduction_pct']['p50']:5.1f} % | "
                f"ICE besser in {e['share_ice_better_pct']:.1f} %")
        if "mt_a" in e:
            line += (f" | Flotte {e['mt_a']['p50']:6.0f} Mt/a "
                     f"= {e['pct_total']['p50']:.1f} % Gesamt / {e['pct_pkw']['p50']:.0f} % Pkw")
        print(line)


if __name__ == "__main__":
    main()
