#!/usr/bin/env python3
"""P2-03 Gegenprüfung: unabhängige Nachrechnung der Wetterjahr-Kennzahlen aus Dossier 03.

Liest direkt die Energy-Charts-Rohdateien (Viertelstunden, UTC) und die
SMARD-Monatsdateien — nicht die aufbereiteten profiles_*.json und nicht
build_profiles.py. Zusätzlich Gegenprobe gegen data/profiles_*.json.

Aufruf: python3 -I energiewende/scripts/pruefung/p2_03_nachrechnung.py <repo-root>
Ausgabe: JSON auf stdout.
"""
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(sys.argv[1]) / "energiewende"
RAW = ROOT / "quellen/raw/P1-03_stromdaten"
TZ = ZoneInfo("Europe/Berlin")
YEARS = range(2015, 2026)


def hours_utc(year):
    a = int(datetime(year, 1, 1, tzinfo=TZ).timestamp())
    b = int(datetime(year + 1, 1, 1, tzinfo=TZ).timestamp())
    return list(range(a, b, 3600))


def hourly(raw, name):
    """Stundenmittel aus Viertelstunden; nur wenn alle vier vorhanden."""
    for p in raw["production_types"]:
        if p["name"] == name:
            acc = {}
            for t, v in zip(raw["unix_seconds"], p["data"]):
                h = t - t % 3600
                acc.setdefault(h, []).append(v)
            return {h: (sum(vs) / 4 if len(vs) == 4 and None not in vs else None) for h, vs in acc.items()}
    raise KeyError(name)


inst = json.loads((RAW / "installed_power_monthly.json").read_text())
MON = {}
for p in inst["production_types"]:
    MON[p["name"]] = dict(zip(inst["time"], p["data"]))


def cap_monthend(name, year, month):
    return MON[name][f"{month:02d}.{year}"]


def cap_interp(name, ts):
    """Linear zwischen Vormonatsende und Monatsende (eigene Umsetzung)."""
    d = datetime.fromtimestamp(ts, timezone.utc).astimezone(TZ)
    y, m = d.year, d.month
    py, pm = (y, m - 1) if m > 1 else (y - 1, 12)
    c0 = MON[name][f"{pm:02d}.{py}"]
    c1 = MON[name][f"{m:02d}.{y}"]
    start = datetime(y, m, 1, tzinfo=TZ)
    end = datetime(y + (m == 12), m % 12 + 1, 1, tzinfo=TZ)
    f = (ts - start.timestamp()) / (end.timestamp() - start.timestamp())
    return c0 + (c1 - c0) * f


def runs(flags):
    out, cur, start = [], 0, None
    for i, f in enumerate(flags):
        if f:
            if cur == 0:
                start = i
            cur += 1
        else:
            if cur:
                out.append((cur, start))
            cur = 0
    if cur:
        out.append((cur, start))
    return out


def loc(ts):
    return datetime.fromtimestamp(ts, timezone.utc).astimezone(TZ).strftime("%Y-%m-%d %H:%M")


res = {}
for y in YEARS:
    pub = json.loads((RAW / f"public_power_{y}.json").read_text())
    tot = json.loads((RAW / f"total_power_{y}.json").read_text())
    grid = hours_utc(y)
    on = hourly(pub, "Wind onshore")
    off = hourly(pub, "Wind offshore")
    pvp = hourly(pub, "Solar")
    pvt = hourly(tot, "Solar")
    load = hourly(pub, "Load")
    r = {}
    S = lambda d: sum(d.get(h) or 0 for h in grid) / 1e6  # TWh
    r["twh"] = {"load": S(load), "pv_pub": S(pvp), "pv_tot": S(pvt), "on": S(on), "off": S(off)}
    # Volllaststunden, Variante A: interpoliert, Variante B: Jahresmittel der 12 Monatsendwerte
    for key, ser, nm in (("on", on, "Wind onshore"), ("off", off, "Wind offshore"),
                         ("pv_pub", pvp, "Solar DC"), ("pv_tot", pvt, "Solar DC")):
        a = sum((ser.get(h) or 0) / (cap_interp(nm, h) * 1000) for h in grid)
        mean_cap = sum(cap_monthend(nm, y, m) for m in range(1, 13)) / 12
        b = sum(ser.get(h) or 0 for h in grid) / (mean_cap * 1000)
        r[f"vls_{key}"] = {"interp": round(a, 1), "jahresmittel_monatsende": round(b, 1)}
    # Kombi-CF (PV gesamt bzw. öffentlich + Wind) mit interpolierter Leistung
    for pvkey, pvser in (("gesamt", pvt), ("oeff", pvp)):
        cf = []
        for h in grid:
            vs = (pvser.get(h), on.get(h), off.get(h))
            if None in vs:
                cf.append(None)
                continue
            c = cap_interp("Solar DC", h) + cap_interp("Wind onshore", h) + cap_interp("Wind offshore", h)
            cf.append(sum(vs) / (c * 1000))
        # Variante Jahresende-Leistung
        cend = cap_monthend("Solar DC", y, 12) + cap_monthend("Wind onshore", y, 12) + cap_monthend("Wind offshore", y, 12)
        cf_end = []
        for h in grid:
            vs = (pvser.get(h), on.get(h), off.get(h))
            cf_end.append(None if None in vs else sum(vs) / (cend * 1000))
        out = {}
        for thr in (0.10, 0.05):
            rr = runs([x is not None and x < thr for x in cf])
            rr.sort(reverse=True)
            ln, st = rr[0]
            out[f"unter_{int(thr*100)}"] = {"laengste_h": ln, "beginn_lokal": loc(grid[st]),
                                           "phasen_ge24": sum(1 for q in rr if q[0] >= 24),
                                           "phasen_ge48": sum(1 for q in rr if q[0] >= 48)}
            rre = sorted(runs([x is not None and x < thr for x in cf_end]), reverse=True)
            out[f"unter_{int(thr*100)}_jahresendleistung"] = {"laengste_h": rre[0][0], "beginn_lokal": loc(grid[rre[0][1]])}
        # Sensitivität: gleitendes 24-h-Mittel unter 10 %
        vals = [x if x is not None else 1.0 for x in cf]
        ma = [sum(vals[i:i + 24]) / 24 for i in range(len(vals) - 23)]
        rr = sorted(runs([v < 0.10 for v in ma]), reverse=True)
        out["24h_mittel_unter_10_fensterbeginne"] = {"laengste_folge_h": rr[0][0], "beginn_lokal": loc(grid[rr[0][1]]),
                                                    "entspricht_periode_h": rr[0][0] + 23}
        # Sensitivität: feste Leistungsgewichte (Mix Ende 2015 bzw. Ende 2025) statt jahreseigener Gewichte
        for wy in (2015, 2025):
            cp, co, cf_ = (cap_monthend(n_, wy, 12) for n_ in ("Solar DC", "Wind onshore", "Wind offshore"))
            tot_ = cp + co + cf_
            fixed = []
            for h in grid:
                vs = (pvser.get(h), on.get(h), off.get(h))
                if None in vs:
                    fixed.append(None)
                    continue
                c_pv = vs[0] / (cap_interp("Solar DC", h) * 1000)
                c_on = vs[1] / (cap_interp("Wind onshore", h) * 1000)
                c_off = vs[2] / (cap_interp("Wind offshore", h) * 1000)
                fixed.append((cp * c_pv + co * c_on + cf_ * c_off) / tot_)
            for thr in (0.10, 0.05):
                rr = sorted(runs([x is not None and x < thr for x in fixed]), reverse=True)
                out[f"unter_{int(thr*100)}_gewichte_{wy}"] = {"laengste_h": rr[0][0], "beginn_lokal": loc(grid[rr[0][1]]),
                                                              "stunden_gesamt": sum(1 for x in fixed if x is not None and x < thr)}
        r[f"dunkelflaute_{pvkey}"] = out
    # Wind-CF Quartale (stündlich kapazitätsgewichtet, Mittel über Stunden)
    wcf = {}
    for h in grid:
        if on.get(h) is None or off.get(h) is None:
            continue
        m = datetime.fromtimestamp(h, timezone.utc).astimezone(TZ).month
        c = cap_interp("Wind onshore", h) + cap_interp("Wind offshore", h)
        wcf.setdefault(m, []).append((on[h] + off[h]) / (c * 1000))
    q = lambda ms: sum(sum(wcf[m]) for m in ms) / sum(len(wcf[m]) for m in ms)
    r["wind_cf"] = {"Q1": round(q((1, 2, 3)), 4), "Q4": round(q((10, 11, 12)), 4), "Jahr": round(q(range(1, 13)), 4)}
    res[y] = r

# SMARD-Monatsdateien -> Jahressummen
sm = {}
for f in sorted((RAW / "smard").glob("*_month_*.json")):
    filt, _, ms = f.stem.split("_")
    y = datetime.fromtimestamp(int(ms) / 1000, TZ).year
    d = json.loads(f.read_text())
    vals = [v for t, v in d["series"] if datetime.fromtimestamp(t / 1000, TZ).year == y and v is not None]
    nmon = len(vals)
    sm.setdefault(filt, {})[y] = (sum(vals) / 1e6, nmon)
smard_cmp = {}
for y in YEARS:
    ec = res[y]["twh"]
    smard_cmp[y] = {
        "pv_ec_pub_twh": round(ec["pv_pub"], 2), "pv_smard_twh": round(sm["4068"][y][0], 2), "monate": sm["4068"][y][1],
        "pv_abw_pct": round((ec["pv_pub"] / sm["4068"][y][0] - 1) * 100, 2),
        "pv_tot_abw_pct": round((ec["pv_tot"] / sm["4068"][y][0] - 1) * 100, 2),
        "on_abw_pct": round((ec["on"] / sm["4067"][y][0] - 1) * 100, 2),
        "off_abw_pct": round((ec["off"] / sm["1225"][y][0] - 1) * 100, 2),
        "load_abw_pct": round((ec["load"] / sm["410"][y][0] - 1) * 100, 2),
    }

# Gegenprobe gegen die aufbereiteten Dateien
prof = {}
for y in YEARS:
    p = json.loads((ROOT / f"data/profiles_{y}.json").read_text())
    s = p["series"]
    prof[y] = {k: s[k].get("full_load_hours") for k in ("wind_onshore_mw", "wind_offshore_mw", "solar_mw", "solar_total_mw")}
    prof[y]["twh_on"] = s["wind_onshore_mw"]["annual_sum_twh_covered_period"]

print(json.dumps({"nachrechnung": res, "smard_vergleich": smard_cmp, "profiles_vls": prof}, ensure_ascii=False, indent=1))
