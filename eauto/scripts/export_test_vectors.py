#!/usr/bin/env python3
"""Exportiert Referenz-Testvektoren fuer den JS-Selbsttest der Seite.

Die Seite rechnet beim Laden jeden Vektor mit dem JS-Port nach
(Toleranz 0,1 %) und zeigt das Ergebnis als Footer-Badge.
"""
import json
import os

from model import DATA, load_params, preset_params, run


def main() -> None:
    pf = load_params()
    vectors = []

    # 1) Alle Presets komplett.
    for pr in pf["presets"]:
        p = preset_params(pf, pr["id"])
        vectors.append({"name": f"preset:{pr['id']}", "params": p, "expect": run(p)})

    # 2) Randfaelle: Extremwerte der Slider.
    base = {k: v["value"] for k, v in pf["defaults"].items()}
    edge_sets = {
        "edge:min_batt_oeko": dict(base, batt_kwh=30, batt_co2=40, strom_start=0),
        "edge:max_batt_kohle": dict(base, batt_kwh=100, batt_co2=130,
                                    strom_start=1100, cons_bev=25.0),
        "edge:kurzstrecke": dict(base, km_per_year=5000, years=9),
        "edge:vielfahrer_pfad": dict(base, km_per_year=30000, years=22,
                                     strom_dynamic=True, strom_ende=0),
        "edge:diesel_artig": dict(base, cons_ice=6.5, fuel_ttw=2.65, fuel_wtw=3.24),
    }
    for name, p in edge_sets.items():
        vectors.append({"name": name, "params": p, "expect": run(p)})

    out = os.path.join(DATA, "test_vectors.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump({"tolerance_pct": 0.1, "vectors": vectors}, f,
                  ensure_ascii=False, indent=1)
    print(f"[ok] {len(vectors)} Testvektoren -> {out}")


if __name__ == "__main__":
    main()
