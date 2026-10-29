#!/usr/bin/env python3
"""
build_profiles.py
==================
Liest die stündliche Rohdaten-CSV aus strommix/data/raw/ (Ausgabe von
fetch_hourly_2024.py) und erzeugt daraus normierte, simulationstaugliche
Profile in strommix/data/profiles_2024.json:

  - pro Reihe: stündliche Werte normiert auf Summe(Reihe) = 1
    (d.h. profile[h] = wert[h] / jahressumme(reihe); die Simulation
    multipliziert dann mit der gewünschten Jahresenergie/Kapazität)
  - Metadaten: Quelle, Einheiten, Abdeckungszeitraum, Jahressummen (TWh),
    Kapazitätsfaktoren (soweit Kapazitäts-Richtwert vorhanden), Lücken.

WICHTIG: Dieses Skript rechnet nur mit Werten, die tatsächlich in der
Rohdaten-CSV stehen. Fehlende Stunden werden NICHT interpoliert/aufgefüllt,
fehlende Reihen NICHT synthetisch erzeugt — beides wird in den Metadaten
als Lücke dokumentiert (`data_completeness`, `series[*].available`,
`series[*].coverage`).
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd

REPO_ROOT = Path(__file__).resolve().parents[1]  # strommix/
RAW_DIR = REPO_ROOT / "data" / "raw"
OUT_PATH = REPO_ROOT / "data" / "profiles_2024.json"

YEAR = 2024
EXPECTED_HOURS = 8784  # Schaltjahr

ROUND_DECIMALS = 6

# Alle Zielreihen, die das Simulations-Schema kennt (auch wenn nicht
# jede Quelle sie liefert).
ALL_SERIES = {
    "load_mw": {"label_de": "Netzlast (Stromverbrauch)", "mandatory": True},
    "solar_mw": {"label_de": "Photovoltaik", "mandatory": True},
    "wind_onshore_mw": {"label_de": "Wind Onshore", "mandatory": True},
    "wind_offshore_mw": {"label_de": "Wind Offshore", "mandatory": True},
    "hydro_ror_mw": {"label_de": "Wasserkraft (Laufwasser)", "mandatory": False},
    "biomass_mw": {"label_de": "Biomasse", "mandatory": False},
}

# Installierte-Leistung-Richtwerte Ende 2024 (GW) — NICHT per API abgerufen,
# sondern Literaturwerte für die Kapazitätsfaktor-Einordnung. Quelle:
# Fraunhofer ISE "Öffentliche Nettostromerzeugung in Deutschland 2024"
# (energy-charts.info/Fraunhofer ISE Jahresrückblick, Pressemitteilung
# 2025-01, sowie BNetzA-Marktstammdatenregister-Jahresmeldungen). Bewusst
# als grobe Richtwerte gekennzeichnet — für belastbare LCOE-/Kapazitäts-
# Aussagen im Whitepaper separat mit Primärquelle (MaStR-Export) verifizieren.
INSTALLED_CAPACITY_GW_REF = {
    "solar_mw": 99.3,
    "wind_onshore_mw": 62.4,
    "wind_offshore_mw": 9.2,
    "hydro_ror_mw": 4.0,
    "biomass_mw": 9.6,
}
CAPACITY_SOURCE_NOTE = (
    "Richtwerte installierte Leistung Ende 2024 (GW), NICHT per Skript "
    "abgerufen, sondern Literaturwerte (Fraunhofer ISE Jahresrückblick "
    "'Öffentliche Nettostromerzeugung in Deutschland 2024' / BNetzA "
    "Marktstammdatenregister-Jahresmeldungen). Für belastbare Aussagen "
    "im Whitepaper separat mit Primärquelle verifizieren."
)

# Grobe Plausibilitäts-Bandbreiten für Jahressummen 2024 (TWh), aus dem
# Auftrag / öffentlich bekannten Eckwerten (Fraunhofer ISE, BNetzA).
PLAUSIBILITY_RANGES_TWH_FULL_YEAR = {
    "load_mw": (455, 470),
    "solar_mw": (60, 75),
    "wind_onshore_mw": (100, 115),
    "wind_offshore_mw": (23, 27),
}


def find_input_csv() -> Path:
    candidates = [
        RAW_DIR / "de_2024_hourly.csv",           # vollständig
        RAW_DIR / "de_2024_hourly_PARTIAL.csv",    # Notlösung / Teildaten
    ]
    for c in candidates:
        if c.exists():
            return c
    raise FileNotFoundError(
        "Keine Rohdaten-CSV in data/raw/ gefunden. Erst fetch_hourly_2024.py ausführen."
    )


def read_header_comment(path: Path) -> list[str]:
    lines = []
    with path.open(encoding="utf-8") as f:
        for line in f:
            if line.startswith("#"):
                lines.append(line.rstrip("\n").lstrip("#").strip())
            else:
                break
    return lines


def main() -> int:
    csv_path = find_input_csv()
    header_comment = read_header_comment(csv_path)
    df = pd.read_csv(csv_path, comment="#", parse_dates=["timestamp_utc"], index_col="timestamp_utc")

    is_partial_file = "PARTIAL" in csv_path.name

    full_year_index = pd.date_range(f"{YEAR}-01-01 00:00", f"{YEAR}-12-31 23:00", freq="1h")

    series_out = {}
    annual_sums_twh = {}
    capacity_factors = {}
    gaps_report = {}

    for col, meta in ALL_SERIES.items():
        if col not in df.columns:
            series_out[col] = {
                "label_de": meta["label_de"],
                "unit": "MW",
                "available": False,
                "reason": "nicht in Rohdaten-CSV enthalten (Quelle liefert diese Reihe nicht, siehe fetch_report.json)",
                "coverage": {"hours_present": 0, "hours_expected": EXPECTED_HOURS, "missing_hours": EXPECTED_HOURS},
                "hourly_profile": None,
            }
            gaps_report[col] = "Reihe komplett fehlend"
            continue

        s = df[col].dropna()
        hours_present = int(len(s))
        missing_hours = EXPECTED_HOURS - hours_present

        # Deckt der vorhandene Zeitraum eine echte Teilmenge des Jahres ab?
        covered_start = s.index.min()
        covered_end = s.index.max()

        annual_sum_mwh = float(s.sum())  # MW-Stundenmittel * 1h = MWh
        annual_sum_twh = annual_sum_mwh / 1e6
        annual_sums_twh[col] = round(annual_sum_twh, 3)

        profile = (s / s.sum()).round(ROUND_DECIMALS)

        # Kapazitätsfaktor auf Basis des TATSÄCHLICH abgedeckten Zeitraums
        # (nicht auf 8784h hochgerechnet, um nichts zu erfinden).
        if col in INSTALLED_CAPACITY_GW_REF:
            cap_mw = INSTALLED_CAPACITY_GW_REF[col] * 1000
            cf = annual_sum_mwh / (cap_mw * hours_present) if hours_present else None
            capacity_factors[col] = round(cf, 4) if cf is not None else None

        series_out[col] = {
            "label_de": meta["label_de"],
            "unit": "MW (Rohwert) -> normiertes Profil dimensionslos, Summe=1 über den abgedeckten Zeitraum",
            "available": True,
            "mandatory": meta["mandatory"],
            "coverage": {
                "hours_present": hours_present,
                "hours_expected": EXPECTED_HOURS,
                "missing_hours": missing_hours,
                "covers_full_calendar_year": missing_hours == 0,
                "period_start": str(covered_start),
                "period_end": str(covered_end),
            },
            "annual_sum_mwh_covered_period": round(annual_sum_mwh, 1),
            "annual_sum_twh_covered_period": round(annual_sum_twh, 3),
            "timestamps": [t.strftime("%Y-%m-%dT%H:%M:%S") for t in s.index],
            "hourly_profile": [float(x) for x in profile.to_numpy()],
        }

        if missing_hours != 0:
            gaps_report[col] = (
                f"nur {hours_present}/{EXPECTED_HOURS} Stunden abgedeckt "
                f"({covered_start} bis {covered_end}); Jahressumme daher NICHT "
                f"die volle Kalenderjahressumme 2024, sondern Summe über den "
                f"abgedeckten Zeitraum"
            )

    # Plausibilitätscheck nur sinnvoll für Reihen mit vollem Kalenderjahr;
    # bei Teildaten wird stattdessen der Anteil an der bekannten Bandbreite
    # dokumentiert (informativ, kein harter Check).
    plausibility = {}
    for col, (lo, hi) in PLAUSIBILITY_RANGES_TWH_FULL_YEAR.items():
        if col not in annual_sums_twh:
            plausibility[col] = "keine Daten"
            continue
        value = annual_sums_twh[col]
        full_year = series_out[col]["coverage"]["covers_full_calendar_year"]
        if full_year:
            in_range = lo <= value <= hi
            plausibility[col] = {
                "annual_sum_twh": value,
                "expected_range_twh": [lo, hi],
                "plausible": in_range,
            }
        else:
            plausibility[col] = {
                "partial_sum_twh": value,
                "note": "Teilzeitraum, nicht direkt mit Jahres-Bandbreite vergleichbar",
                "expected_full_year_range_twh": [lo, hi],
            }

    data_completeness = "COMPLETE" if not is_partial_file and not gaps_report else "PARTIAL"

    output = {
        "meta": {
            "year": YEAR,
            "generated_at_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "input_csv": str(csv_path.relative_to(REPO_ROOT)),
            "source_header_comment": header_comment,
            "data_completeness": data_completeness,
            "gaps": gaps_report,
            "capacity_reference_note": CAPACITY_SOURCE_NOTE,
            "capacity_factors_covered_period": capacity_factors,
            "plausibility_check_2024": plausibility,
            "normalization": (
                "hourly_profile[i] = rohwert[i] / summe(rohwert über den "
                "abgedeckten Zeitraum). Zum Rekonstruieren: wert_mwh[i] = "
                "hourly_profile[i] * gewuenschte_jahresenergie_mwh. "
                "'timestamps' listet die zu hourly_profile[i] gehörenden "
                "Stunden 1:1 (ISO 8601, siehe coverage/tz-Hinweis in "
                "source_header_comment)."
            ),
        },
        "series": series_out,
    }

    OUT_PATH.write_text(
        json.dumps(output, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )

    size_kb = OUT_PATH.stat().st_size / 1024
    print(f"[build] geschrieben: {OUT_PATH} ({size_kb:.1f} KB)")
    print(f"[build] data_completeness: {data_completeness}")
    if gaps_report:
        print("[build] Lücken:")
        for k, v in gaps_report.items():
            print(f"  - {k}: {v}")
    print("[build] Jahressummen (TWh, abgedeckter Zeitraum):", annual_sums_twh)
    print("[build] Kapazitätsfaktoren (abgedeckter Zeitraum):", capacity_factors)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
