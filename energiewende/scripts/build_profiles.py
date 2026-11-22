#!/usr/bin/env python3
"""P1-03: Stundenprofile Deutschland je Wetterjahr aus Energy-Charts-Rohdaten.

Eingabe (lokale Rohdateien, per curl geholt, keine Netzabrufe in diesem Skript):
  energiewende/quellen/raw/P1-03_stromdaten/public_power_<jahr>.json   (Netzlast, öffentl. Nettoerzeugung)
  energiewende/quellen/raw/P1-03_stromdaten/total_power_<jahr>.json    (inkl. Eigenverbrauch)
  energiewende/quellen/raw/P1-03_stromdaten/installed_power_monthly.json
  energiewende/quellen/raw/P1-03_stromdaten/installed_power_yearly.json
Ausgabe:
  energiewende/data/profiles_<jahr>.json   (Format angelehnt an strommix/data/profiles_2024.json)
  energiewende/data/stats_wetterjahre.json (Kennzahlen je Jahr, Dunkelflaute, Plausibilität)

Regeln: 15-min-Werte werden zu Stundenmitteln (MW == MWh/h) nur dann, wenn alle vier
Viertelstunden vorliegen. Fehlende Stunden bleiben null, nichts wird aufgefüllt oder
interpoliert. Zeitachse: UTC-Sekunden; Lokalzeit (Europe/Berlin) nur als Beschriftung.
Aufruf: python3 -I energiewende/scripts/build_profiles.py
"""
import json
import math
import os
import sys
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)  # energiewende/
RAW = os.path.join(ROOT, "quellen", "raw", "P1-03_stromdaten")
OUT = os.path.join(ROOT, "data")
YEARS = list(range(2015, 2026))
TZ = ZoneInfo("Europe/Berlin")
UTC = timezone.utc

# Reihe -> (Energy-Charts-Name, Quelle-Datei public/total, Vorzeichen, Kapazitätsreihe)
SERIES = {
    "load_mw": ("Load", "public", 1, None),
    "solar_mw": ("Solar", "public", 1, "Solar DC"),
    "solar_total_mw": ("Solar", "total", 1, "Solar DC"),
    "wind_onshore_mw": ("Wind onshore", "public", 1, "Wind onshore"),
    "wind_offshore_mw": ("Wind offshore", "public", 1, "Wind offshore"),
    "hydro_ror_mw": ("Hydro Run-of-River", "public", 1, "Hydro"),
    "biomass_mw": ("Biomass", "public", 1, "Biomass"),
    "pumped_gen_mw": ("Hydro pumped storage", "public", 1, "Hydro pumped storage"),
    "pumped_cons_mw": ("Hydro pumped storage consumption", "public", 1, "Hydro pumped storage"),
}
LABELS = {
    "load_mw": "Netzlast (Stromverbrauch, ohne Eigenverbrauch)",
    "solar_mw": "Photovoltaik (öffentliche Nettoerzeugung)",
    "solar_total_mw": "Photovoltaik (Gesamt inkl. Eigenverbrauch)",
    "wind_onshore_mw": "Wind an Land",
    "wind_offshore_mw": "Wind auf See",
    "hydro_ror_mw": "Laufwasser",
    "biomass_mw": "Biomasse",
    "pumped_gen_mw": "Pumpspeicher Erzeugung",
    "pumped_cons_mw": "Pumpspeicher Verbrauch (Pumpen)",
}


def jload(name):
    with open(os.path.join(RAW, name), encoding="utf-8") as f:
        return json.load(f)


def local_year_grid(year):
    """Liste der UTC-Stundenstarts (Unix-Sekunden) des lokalen Kalenderjahres."""
    start = datetime(year, 1, 1, tzinfo=TZ).astimezone(UTC)
    end = datetime(year + 1, 1, 1, tzinfo=TZ).astimezone(UTC)
    n = int((end - start).total_seconds() // 3600)
    s0 = int(start.timestamp())
    return [s0 + 3600 * i for i in range(n)]


def hourly_from_quarters(unix, values, grid):
    """Stundenmittel; None, wenn nicht alle vier Viertelstunden gültig sind."""
    acc = {}
    for t, v in zip(unix, values):
        h = t - (t % 3600)
        a = acc.setdefault(h, [0.0, 0])
        if v is not None:
            a[0] += v
            a[1] += 1
    out = []
    partial = 0
    for h in grid:
        a = acc.get(h)
        if a is None or a[1] == 0:
            out.append(None)
        elif a[1] < 4:
            out.append(None)
            partial += 1
        else:
            out.append(a[0] / 4.0)
    return out, partial


def capacity_series(inst_m, inst_y, name, grid):
    """Installierte Leistung (GW) je Stunde. Monatsreihen: Bestand zum Monatsende,
    linear zwischen Monatsenden interpoliert. Jahresreihen: Bestand zum Jahresende
    (== Dezember), ebenfalls linear zwischen Jahresenden interpoliert."""
    pts = {}  # unix(Monatsende 00:00 lokal des Folgemonats) -> GW
    src = None
    for x in inst_m["production_types"]:
        if x["name"] == name:
            src = ("m", x["data"])
    if src:
        for t, v in zip(inst_m["time"], src[1]):
            if v is None:
                continue
            mo, yr = int(t[:2]), int(t[3:])
            ny, nm = (yr + 1, 1) if mo == 12 else (yr, mo + 1)
            pts[int(datetime(ny, nm, 1, tzinfo=TZ).astimezone(UTC).timestamp())] = v
    else:
        for x in inst_y["production_types"]:
            if x["name"] == name:
                for t, v in zip(inst_y["time"], x["data"]):
                    if v is None:
                        continue
                    pts[int(datetime(int(t) + 1, 1, 1, tzinfo=TZ).astimezone(UTC).timestamp())] = v
    if not pts:
        return None
    ks = sorted(pts)
    out = []
    j = 0
    for h in grid:
        mid = h + 1800
        while j + 1 < len(ks) and ks[j + 1] < mid:
            j += 1
        if mid <= ks[0]:
            out.append(pts[ks[0]])
        elif j + 1 >= len(ks):
            out.append(pts[ks[-1]])
        else:
            a, b = ks[j], ks[j + 1]
            if mid < a:
                out.append(pts[a])
            else:
                f = (mid - a) / (b - a)
                out.append(pts[a] + f * (pts[b] - pts[a]))
    return out


def fmt(x, nd):
    return None if x is None else round(x, nd)


def longest_runs(flags, grid, min_len=1, top=3):
    """Längste zusammenhängende Phasen mit flag==True; None bricht die Phase ab."""
    runs = []
    s = None
    for i, f in enumerate(flags + [None]):
        if f is True:
            if s is None:
                s = i
        else:
            if s is not None:
                runs.append((i - s, s, i - 1))
                s = None
    runs.sort(reverse=True)
    res = []
    for ln, a, b in runs[:top]:
        if ln < min_len:
            continue
        ta = datetime.fromtimestamp(grid[a], UTC).astimezone(TZ)
        tb = datetime.fromtimestamp(grid[b], UTC).astimezone(TZ)
        res.append({"stunden": ln, "von_lokal": ta.strftime("%Y-%m-%d %H:%M"), "bis_lokal": tb.strftime("%Y-%m-%d %H:%M")})
    return res, runs


def main():
    inst_m = jload("installed_power_monthly.json")
    inst_y = jload("installed_power_yearly.json")
    os.makedirs(OUT, exist_ok=True)
    stats = {}
    # Zusatz: Winter-Dezember des Vorjahres für Meteo-Winter -> hier nicht, nur Q1/Q4
    for year in YEARS:
        grid = local_year_grid(year)
        n = len(grid)
        src = {"public": jload(f"public_power_{year}.json"), "total": jload(f"total_power_{year}.json")}
        qinfo = {}
        for k in src:
            u = src[k]["unix_seconds"]
            qinfo[k] = {"viertelstunden": len(u), "erster_utc": datetime.fromtimestamp(u[0], UTC).isoformat(),
                        "letzter_utc": datetime.fromtimestamp(u[-1], UTC).isoformat()}
        series = {}
        mw = {}
        cap = {}
        for key, (ecname, which, sign, capname) in SERIES.items():
            d = src[which]
            names = {x["name"]: x["data"] for x in d["production_types"]}
            if ecname == "Load" and which == "total":
                ecname = "Load (incl. self-consumption)"
            vals = names.get(ecname)
            if vals is None:
                series[key] = {"label_de": LABELS[key], "available": False}
                continue
            hv, partial = hourly_from_quarters(d["unix_seconds"], vals, grid)
            if key == "pumped_cons_mw":
                # Vorzeichen prüfen: Energy-Charts liefert Pumpen negativ -> als positive Größe führen
                neg = sum(1 for v in hv if v is not None and v < 0)
                pos = sum(1 for v in hv if v is not None and v > 0)
                if neg > pos:
                    hv = [None if v is None else -v for v in hv]
            mw[key] = hv
            c = capacity_series(inst_m, inst_y, capname, grid) if capname else None
            cap[key] = c
            series[key] = {"partial": partial}
        # Solar-AC-Hilfsreihe nur für Kennzahl
        cap_ac = capacity_series(inst_m, inst_y, "Solar AC", grid)

        out_series = {}
        ystats = {"stunden_erwartet": n, "quellen_raster": qinfo, "reihen": {}}
        for key, (ecname, which, sign, capname) in SERIES.items():
            if key not in mw:
                out_series[key] = series[key]
                continue
            hv = mw[key]
            present = [v for v in hv if v is not None]
            miss_idx = [i for i, v in enumerate(hv) if v is None]
            tot = sum(present)
            cf = None
            cff = None
            if cap[key]:
                cf = [None if v is None else v / (cap[key][i] * 1000.0) for i, v in enumerate(hv)]
                cff = [x for x in cf if x is not None]
            neg = sum(1 for v in present if v < -1e-9)
            out_of = sum(1 for x in (cff or []) if x > 1.0 or x < 0)
            max_cf = max(cff) if cff else None
            # Lücken als Bereiche
            gaps = []
            s = None
            for i in miss_idx + [None]:
                if i is None:
                    if s is not None:
                        gaps.append((s, p))
                    break
                if s is None:
                    s, p = i, i
                elif i == p + 1:
                    p = i
                else:
                    gaps.append((s, p))
                    s, p = i, i
            gap_txt = [{"von_lokal": datetime.fromtimestamp(grid[a], UTC).astimezone(TZ).strftime("%Y-%m-%d %H:%M"),
                        "stunden": b - a + 1} for a, b in gaps]
            norm = None
            if tot > 0:
                norm = [None if v is None else float("%.7g" % (v / tot)) for v in hv]
            ent = {
                "label_de": LABELS[key],
                "unit": "MW (Stundenmittel == MWh je Stunde); hourly_profile dimensionslos, Summe=1 über vorhandene Stunden",
                "available": True,
                "mandatory": key in ("load_mw", "solar_mw", "wind_onshore_mw", "wind_offshore_mw"),
                "source_endpoint": ("total_power" if which == "total" else "public_power") + " (api.energy-charts.info), Name: " + ecname,
                "coverage": {
                    "hours_present": len(present), "hours_expected": n, "missing_hours": len(miss_idx),
                    "covers_full_calendar_year": len(miss_idx) == 0,
                    "period_start_utc": datetime.fromtimestamp(grid[0], UTC).strftime("%Y-%m-%d %H:%M:%S"),
                    "period_end_utc": datetime.fromtimestamp(grid[-1], UTC).strftime("%Y-%m-%d %H:%M:%S"),
                    "gaps": gap_txt,
                },
                "annual_sum_mwh_covered_period": round(tot, 1),
                "annual_sum_twh_covered_period": round(tot / 1e6, 3),
                "negative_values": neg,
                "capacity_factor_gt1_or_lt0": out_of,
                "capacity_factor_max": fmt(max_cf, 4),
                "hourly_profile": norm,
                "mw": [fmt(v, 1) for v in hv],
            }
            if cf is not None:
                ent["capacity_factor"] = [fmt(x, 4) for x in cf]
                ent["capacity_factor_basis"] = ("installierte Leistung " + capname +
                                                " (GW), Monatsendbestand linear interpoliert; Quelle installed_power Energy-Charts")
                ent["installed_gw_start_of_year"] = fmt(cap[key][0], 3)
                ent["installed_gw_end_of_year"] = fmt(cap[key][-1], 3)
                ent["installed_gw_mean"] = fmt(sum(cap[key]) / n, 3)
                ent["full_load_hours"] = fmt(sum(cff), 1)
                ent["capacity_factor_mean"] = fmt(sum(cff) / len(cff), 4)
            out_series[key] = ent
            ystats["reihen"][key] = {
                "summe_twh": round(tot / 1e6, 3),
                "fehlstunden": len(miss_idx),
                "luecken": gap_txt,
                "negative_werte": neg,
                "cf_ausserhalb_0_1": out_of,
                "cf_max": fmt(max_cf, 4),
                "installiert_gw_mittel": ent.get("installed_gw_mean"),
                "installiert_gw_ende": ent.get("installed_gw_end_of_year"),
                "volllaststunden": ent.get("full_load_hours"),
                "cf_mittel": ent.get("capacity_factor_mean"),
            }
        # Solar-AC-Volllaststunden als Zusatzkennzahl
        if "solar_mw" in mw:
            f_ac = [v / (cap_ac[i] * 1000.0) for i, v in enumerate(mw["solar_mw"]) if v is not None]
            ystats["reihen"]["solar_mw"]["volllaststunden_bezogen_auf_AC"] = round(sum(f_ac), 1)
            f_t = [v / (cap_ac[i] * 1000.0) for i, v in enumerate(mw["solar_total_mw"]) if v is not None]
            ystats["reihen"]["solar_total_mw"]["volllaststunden_bezogen_auf_AC"] = round(sum(f_t), 1)

        # Wind+PV-Kombireihe (Kapazitätsfaktor gesamt) für Dunkelflaute
        def combined(pv_key):
            res_ = []
            for i in range(n):
                vs = [mw[k][i] for k in (pv_key, "wind_onshore_mw", "wind_offshore_mw")]
                if any(v is None for v in vs):
                    res_.append(None)
                    continue
                c = cap["solar_mw"][i] + cap["wind_onshore_mw"][i] + cap["wind_offshore_mw"][i]
                res_.append(sum(vs) / (c * 1000.0))
            return res_
        comb = combined("solar_mw")
        comb_total = combined("solar_total_mw")
        wind = []
        for i in range(n):
            vs = [mw[k][i] for k in ("wind_onshore_mw", "wind_offshore_mw")]
            if any(v is None for v in vs):
                wind.append(None)
                continue
            c = cap["wind_onshore_mw"][i] + cap["wind_offshore_mw"][i]
            wind.append(sum(vs) / (c * 1000.0))
        df = {}
        for thr in (0.10, 0.05):
            flags = [None if x is None else (x < thr) for x in comb]
            res, runs = longest_runs(flags, grid)
            df[f"cf_unter_{int(thr*100)}pct"] = {"laengste_phasen": res,
                                               "phasen_ab_24h": sum(1 for r in runs if r[0] >= 24),
                                               "phasen_ab_48h": sum(1 for r in runs if r[0] >= 48)}
        ystats["dunkelflaute_wind_pv"] = df
        dft = {}
        for thr in (0.10, 0.05):
            flags = [None if x is None else (x < thr) for x in comb_total]
            res, runs = longest_runs(flags, grid)
            dft[f"cf_unter_{int(thr*100)}pct"] = {"laengste_phasen": res,
                                                "phasen_ab_24h": sum(1 for r in runs if r[0] >= 24),
                                                "phasen_ab_48h": sum(1 for r in runs if r[0] >= 48)}
        ystats["dunkelflaute_wind_pv_gesamt_inkl_eigenverbrauch"] = dft
        ystats["dunkelflaute_hinweis"] = ("Kombi-CF = (PV öffentlich + Wind an Land + Wind auf See) / Summe der installierten "
                                          "Leistungen (PV in DC). Fehlende Stunden brechen eine Phase ab (werden nicht als Flaute gezählt).")
        # Winterquartale (Wind)
        def qmean(series_, months):
            vals = []
            for i, h in enumerate(grid):
                m = datetime.fromtimestamp(h, UTC).astimezone(TZ).month
                if m in months and series_[i] is not None:
                    vals.append(series_[i])
            return (sum(vals) / len(vals), len(vals)) if vals else (None, 0)
        q1, n1 = qmean(wind, (1, 2, 3))
        q4, n4 = qmean(wind, (10, 11, 12))
        djf, nd = qmean(wind, (1, 2))
        ystats["wind_cf_quartale"] = {"Q1_Jan_Mrz": fmt(q1, 4), "Q4_Okt_Dez": fmt(q4, 4), "Jan_Feb": fmt(djf, 4),
                                      "wind_cf_jahr": fmt(sum(x for x in wind if x is not None) / max(1, sum(1 for x in wind if x is not None)), 4),
                                      "stunden_Q1": n1, "stunden_Q4": n4}
        stats[str(year)] = ystats

        meta = {
            "year": year,
            "generated_at_utc": datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "generator": "energiewende/scripts/build_profiles.py (P1-03)",
            "data_completeness": "FULL" if all(out_series[k].get("coverage", {}).get("missing_hours", 1) == 0 for k in out_series if out_series[k].get("available")) else "FULL_WITH_GAPS",
            "hours_in_year": n,
            "source": "Energy-Charts (Fraunhofer ISE), api.energy-charts.info, Endpunkte public_power, total_power, installed_power; Lizenz CC BY 4.0, siehe data/raw/strom/QUELLE_LIZENZ.md",
            "time_axis": "timestamps_utc: Beginn der Stunde in UTC (Sekunden seit 1970) -> ISO. timestamps: lokale Zeit Europe/Berlin (naiv); in der Herbst-Zeitumstellung kommt die Stunde 02:00 doppelt vor, im Frühjahr fehlt 02:00. Arrays sind nach UTC geordnet und 1:1 zu beiden Zeitstempel-Listen.",
            "resolution": "Quelle liefert Viertelstunden; Stundenwert = Mittel von 4 Viertelstunden, sonst null",
            "capacity_note": "capacity_factor = mw / (installierte Leistung*1000). Installierte Leistung: Energy-Charts installed_power (Monatsendbestand, linear interpoliert; Solar = DC-Leistung; Laufwasser = gesamte Wasserkraft ohne Pumpspeicher, daher CF unterschätzt; Pumpspeicher = Turbinenleistung).",
            "curtailment_note": "Messwerte enthalten Abregelung bereits (Erzeugung nach Abregelung); Kapazitätsfaktoren sind dadurch nach unten verzerrt. Siehe research/03_stromdaten.md.",
            "normalization": "hourly_profile[i] = mw[i] / Summe(mw über vorhandene Stunden); null bei fehlender Stunde.",
            "installed_gw_end_of_year": {k: out_series[k].get("installed_gw_end_of_year") for k in out_series if out_series[k].get("available")},
        }
        # Zeitstempel
        ts_utc = [datetime.fromtimestamp(h, UTC).strftime("%Y-%m-%dT%H:%M:%SZ") for h in grid]
        ts_loc = [datetime.fromtimestamp(h, UTC).astimezone(TZ).strftime("%Y-%m-%dT%H:%M:%S") for h in grid]
        doc = {"meta": meta, "timestamps_utc": ts_utc, "timestamps": ts_loc, "series": out_series}
        path = os.path.join(OUT, f"profiles_{year}.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
        print(year, n, "h", round(os.path.getsize(path) / 1e6, 2), "MB")
    with open(os.path.join(OUT, "stats_wetterjahre.json"), "w", encoding="utf-8") as f:
        json.dump(stats, f, ensure_ascii=False, indent=1)
    print("stats ok")


if __name__ == "__main__":
    main()
