#!/usr/bin/env python3
"""P1-05 · Dunkelflauten empirisch aus Energy-Charts-Daten (2015–2025).

Eingang (nicht im Repo, siehe quellen/manifest_P1-05.json):
  quellen/raw/P1-05/ec_public_power_<Jahr>.json   Nettoerzeugung öffentlich, 15-min bzw. 1-h
  quellen/raw/P1-05/ec_installed_power_monthly.json  installierte Leistung je Monat
  quellen/raw/P1-05/ec_price_<Jahr>.json            Day-Ahead DE-LU (2019–2025)
Quelle: Energy-Charts (Fraunhofer ISE), Daten u. a. von Bundesnetzagentur/SMARD
und ENTSO-E; Lizenz CC BY 4.0.

Ausgang: data/p1_05_dunkelflaute.json

Aufruf (aus dem Repo-Wurzelverzeichnis):
  python3 -I energiewende/scripts/p1_05_dunkelflaute.py
Kein Zufall, deterministisch.
"""
import json
import os
from datetime import datetime, timezone

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
RAW = os.path.join(BASE, "quellen", "raw", "P1-05")
OUT = os.path.join(BASE, "data", "p1_05_dunkelflaute.json")
YEARS = list(range(2015, 2026))
THRESH = 0.10          # 10 % der installierten Leistung (DWD/Ohlendorf-Schill/Uniper)
ROLL = 6               # gleitender 6-h-Mittelwert (Uniper, Ohlendorf-Schill)
WINDOW_5D = 120        # 5 Tage in Stunden (R21 Factsheet A)

# Setzung (M) für die Hochrechnung: gesetzliche Ziele 2030 (EEG 2023 §4 / WindSeeG)
TARGET_2030_GW = {"solar": 215.0, "won": 115.0, "woff": 30.0}
LOAD_2030_TWH = 520.0  # R21-Annahme Jahresverbrauch, hier übernommen


def load_json(name):
    with open(os.path.join(RAW, name), encoding="utf-8") as f:
        return json.load(f)


def capacity_lookup():
    d = load_json("ec_installed_power_monthly.json")
    idx = {t: i for i, t in enumerate(d["time"])}
    series = {p["name"]: p["data"] for p in d["production_types"]}

    def cap(name, year, month):
        v = series[name][idx[f"{month:02d}.{year}"]]
        return float(v or 0.0)

    def get(year, month):
        solar = cap("Solar AC", year, month) or cap("Solar DC", year, month)
        return {
            "won": cap("Wind onshore", year, month),
            "woff": cap("Wind offshore", year, month),
            "solar": solar,
        }
    return get


def hourly(year):
    d = load_json(f"ec_public_power_{year}.json")
    ts = d["unix_seconds"]
    pt = {p["name"]: p["data"] for p in d["production_types"]}
    keys = {
        "won": "Wind onshore", "woff": "Wind offshore", "solar": "Solar",
        "load": "Load", "bio": "Biomass", "ror": "Hydro Run-of-River",
    }
    buckets = {}
    for i, t in enumerate(ts):
        h = t - (t % 3600)
        b = buckets.setdefault(h, {k: [] for k in keys})
        for k, name in keys.items():
            v = pt.get(name, [None] * len(ts))[i]
            if v is not None:
                b[k].append(v)
    out = []
    for h in sorted(buckets):
        b = buckets[h]
        row = {"t": h}
        for k in keys:
            row[k] = (sum(b[k]) / len(b[k]) / 1000.0) if b[k] else None  # GW
        out.append(row)
    # Lücken einfach vorwärts füllen (dokumentiert)
    gaps = 0
    for k in keys:
        last = 0.0
        for r in out:
            if r[k] is None:
                r[k] = last
                gaps += 1
            else:
                last = r[k]
    return out, gaps


def rolling(vals, n):
    res, s = [], 0.0
    for i, v in enumerate(vals):
        s += v
        if i >= n:
            s -= vals[i - n]
        res.append(s / min(i + 1, n))
    return res


def runs_below(vals, thr):
    runs, cur = [], 0
    for v in vals:
        if v < thr:
            cur += 1
        else:
            if cur:
                runs.append(cur)
            cur = 0
    if cur:
        runs.append(cur)
    return runs


def main():
    capf = capacity_lookup()
    years = {}
    worst_overall = None
    for y in YEARS:
        rows, gaps = hourly(y)
        cf_ws, cf_w = [], []
        for r in rows:
            dt = datetime.fromtimestamp(r["t"], tz=timezone.utc)
            c = capf(dt.year, dt.month)
            ctot = c["won"] + c["woff"] + c["solar"]
            cw = c["won"] + c["woff"]
            r["cap"] = c
            cf_ws.append((r["won"] + r["woff"] + r["solar"]) / ctot if ctot else 0.0)
            cf_w.append((r["won"] + r["woff"]) / cw if cw else 0.0)
        roll_ws = rolling(cf_ws, ROLL)
        roll_w = rolling(cf_w, ROLL)
        runs_ws = runs_below(roll_ws, THRESH)
        runs_w = runs_below(roll_w, THRESH)

        # schwächstes 5-Tage-Fenster: minimale Wind+PV-Energie relativ zur Last
        n = len(rows)
        best = None
        for i in range(0, n - WINDOW_5D):
            win = rows[i:i + WINDOW_5D]
            ee = sum(r["won"] + r["woff"] + r["solar"] for r in win)
            ld = sum(r["load"] for r in win)
            share = ee / ld if ld else 1
            if best is None or share < best[0]:
                best = (share, i)
        share, i0 = best
        win = rows[i0:i0 + WINDOW_5D]
        cf_win = sum(cf_ws[i0:i0 + WINDOW_5D]) / WINDOW_5D
        cfw = {k: sum(r[k] for r in win) / sum(r["cap"][k] for r in win)
               for k in ("won", "woff", "solar")}
        load_twh = sum(r["load"] for r in win) / 1000.0
        ee_twh = sum(r["won"] + r["woff"] + r["solar"] for r in win) / 1000.0
        bio_ror_twh = sum(r["bio"] + r["ror"] for r in win) / 1000.0
        annual_load_twh = sum(r["load"] for r in rows) / 1000.0
        load_factor = load_twh / (annual_load_twh * WINDOW_5D / len(rows))
        start = datetime.fromtimestamp(win[0]["t"], tz=timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

        # Hochrechnung Setzung (M): Ziel-Kapazitäten 2030 bei den CF dieses Fensters,
        # Last skaliert auf 520 TWh/a mit dem beobachteten Lastfaktor des Fensters
        ee_2030_twh = sum(TARGET_2030_GW[k] * cfw[k] for k in cfw) * WINDOW_5D / 1000.0
        load_2030_twh = LOAD_2030_TWH * WINDOW_5D / 8760.0 * load_factor
        scale = LOAD_2030_TWH / annual_load_twh
        gaps_gw = [r["load"] * scale - sum(TARGET_2030_GW[k] * r[k] / r["cap"][k] for k in cfw)
                   for r in win]
        min_share_h = min((r["won"] + r["woff"] + r["solar"]) / r["load"] for r in win)
        rec = {
            "stunden": len(rows), "luecken_gefuellt": gaps,
            "ereignisse_ws_rolling6h_ge24h": sum(1 for x in runs_ws if x >= 24),
            "ereignisse_ws_rolling6h_ge48h": sum(1 for x in runs_ws if x >= 48),
            "ereignisse_ws_rolling6h_ge10h": sum(1 for x in runs_ws if x >= 10),
            "laengstes_ws_rolling6h_h": max(runs_ws) if runs_ws else 0,
            "ereignisse_wind_rolling6h_ge48h": sum(1 for x in runs_w if x >= 48),
            "laengstes_wind_rolling6h_h": max(runs_w) if runs_w else 0,
            "schwaechstes_5d_fenster": {
                "start": start,
                "anteil_wind_pv_an_last": round(share, 4),
                "cf_wind_pv_gesamt": round(cf_win, 4),
                "cf_onshore": round(cfw["won"], 4), "cf_offshore": round(cfw["woff"], 4),
                "cf_solar": round(cfw["solar"], 4),
                "last_twh": round(load_twh, 3), "wind_pv_twh": round(ee_twh, 3),
                "biomasse_laufwasser_twh": round(bio_ror_twh, 3),
                "lastfaktor_vs_jahresmittel": round(load_factor, 3),
                "hochrechnung_ziel2030_setzung_M": {
                    "last_twh": round(load_2030_twh, 3),
                    "wind_pv_twh": round(ee_2030_twh, 3),
                    "luecke_vor_bio_import_twh": round(load_2030_twh - ee_2030_twh, 3),
                    "spitze_luecke_gw": round(max(gaps_gw), 1),
                    "mittlere_luecke_gw": round(sum(gaps_gw) / len(gaps_gw), 1),
                },
                "min_stundenanteil_wind_pv_an_last": round(min_share_h, 4),
            },
        }
        years[y] = rec
        if worst_overall is None or share < worst_overall[0]:
            worst_overall = (share, y)

    # negative Preisstunden (Stundenmittel; ab 10/2025 Viertelstundenpreise)
    neg = {}
    for y in range(2019, 2026):
        p = load_json(f"ec_price_{y}.json")
        hrs = {}
        for t, v in zip(p["unix_seconds"], p["price"]):
            if v is None:
                continue
            hrs.setdefault(t - t % 3600, []).append(v)
        neg[y] = {
            "stunden_negativ": sum(1 for v in hrs.values() if sum(v) / len(v) < 0),
            "stunden_gesamt": len(hrs),
            "viertelstunden_negativ": sum(1 for v in p["price"] if v is not None and v < 0)
            if len(p["price"]) > 9000 else None,
        }

    out = {
        "titel": "Dunkelflauten und negative Preise · Auswertung Energy-Charts 2015–2025",
        "stand": "2026-11-22",
        "quelle": "Energy-Charts (Fraunhofer ISE), api.energy-charts.info: public_power, installed_power, price",
        "lizenz": "CC BY 4.0; Preisdaten laut API: Bundesnetzagentur | SMARD.de",
        "methode": {
            "schwelle": "Kapazitätsfaktor < 10 % der installierten Leistung (Monatswert Energy-Charts)",
            "rolling6h": "gleitender 6-h-Mittelwert unter Schwelle, zusammenhängende Stunden",
            "ws": "Wind onshore + offshore + PV", "wind": "Wind onshore + offshore",
            "fenster_5d": "120-h-Fenster mit dem geringsten Anteil Wind+PV an der Last",
            "einschraenkungen": [
                "Öffentliche Nettoerzeugung; Eigenverbrauch der Industrie und PV-Eigenverbrauch fehlen in Last und Erzeugung",
                "Kapazität als Monatswert; Zubau innerhalb des Monats verschiebt CF leicht",
                "Last ist die beobachtete Last inkl. Reaktion auf Preise; Importe/Exporte nicht abgezogen",
                "Hochrechnung 2030 ist eine Setzung (M): Ziel-Kapazitäten x beobachtete CF; ignoriert Abschattung offshore und Lastprofiländerung durch Wärmepumpen",
            ],
        },
        "jahre": years,
        "schwaechstes_jahr_5d": worst_overall[1],
        "negative_preisstunden_de_lu": neg,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(json.dumps(out, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
