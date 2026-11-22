#!/usr/bin/env python3
"""P2-05 · Unabhängige Nachrechnung der Dunkelflauten-Kennzahlen aus Dossier 05.

Eigener Code (nicht aus scripts/p1_05_*.py übernommen). Eingabe:
  energiewende/data/profiles_<jahr>.json  (P1-03, Energy-Charts, CC BY 4.0)
  energiewende/quellen/raw/P1-05/ec_price_<jahr>.json (Energy-Charts price, DE-LU)
Ausgabe: energiewende/scripts/pruefung/p2_05_ergebnis.json (nur Prüfzwecke)

Setzung (M) wie im Dossier: PV 215 GW, Wind an Land 115 GW, Wind auf See 30 GW,
Last je Jahr linear auf 520 TWh skaliert. Kapazitätsfaktoren aus den Profilen
(PV gegen DC-Leistung, Energy-Charts installed_power).
Aufruf: python3 -I energiewende/scripts/pruefung/p2_05_nachrechnung.py
"""
import json
import os
import statistics

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
DATA = os.path.join(ROOT, "data")
RAW05 = os.path.join(ROOT, "quellen", "raw", "P1-05")
YEARS = range(2015, 2026)
CAP = {"pv": 215.0, "on": 115.0, "off": 30.0}  # GW, Setzung (M) laut Dossier
TARGET_TWH = 520.0
W = 120  # Stunden


def runs(flags):
    """Längen zusammenhängender True-Folgen."""
    out, n = [], 0
    for f in flags:
        if f:
            n += 1
        elif n:
            out.append(n)
            n = 0
    if n:
        out.append(n)
    return out


def roll_mean(x, k, centered):
    n = len(x)
    out = [None] * n
    if centered:
        h = k // 2
        for i in range(n):
            a, b = i - h, i - h + k
            if a < 0 or b > n:
                continue
            out[i] = sum(x[a:b]) / k
    else:
        s = 0.0
        for i in range(n):
            s += x[i]
            if i >= k:
                s -= x[i - k]
            if i >= k - 1:
                out[i] = s / k
    return out


def window_sums(x, w):
    s = sum(x[:w])
    res = [s]
    for i in range(w, len(x)):
        s += x[i] - x[i - w]
        res.append(s)
    return res


def year_calc(year, solar_key):
    d = json.load(open(os.path.join(DATA, f"profiles_{year}.json"), encoding="utf-8"))
    S = d["series"]
    ts = d["timestamps_utc"]
    load = S["load_mw"]["mw"]
    pv = S[solar_key]["mw"]
    on = S["wind_onshore_mw"]["mw"]
    off = S["wind_offshore_mw"]["mw"]
    cpv = S[solar_key]["capacity_factor"]
    con = S["wind_onshore_mw"]["capacity_factor"]
    coff = S["wind_offshore_mw"]["capacity_factor"]
    bio = S["biomass_mw"]["mw"]
    ror = S["hydro_ror_mw"]["mw"]
    n = len(load)
    miss = sum(1 for v in load + pv + on + off + cpv + con + coff if v is None)
    # Lücken (sollten keine sein) mit Vorwert füllen
    def ff(x):
        y, last = [], 0.0
        for v in x:
            last = v if v is not None else last
            y.append(last)
        return y
    load, pv, on, off, cpv, con, coff, bio, ror = map(ff, (load, pv, on, off, cpv, con, coff, bio, ror))
    # installierte Leistung je Stunde (MW) aus mw/cf zurückgewonnen, wo cf>0
    def capseries(mw, cf):
        caps, last = [], None
        for m, c in zip(mw, cf):
            if c and c > 0:
                last = m / c
            caps.append(last)
        first = next(c for c in caps if c is not None)
        return [c if c is not None else first for c in caps]
    kpv, kon, koff = capseries(pv, cpv), capseries(on, con), capseries(off, coff)

    annual_load_twh = sum(load) / 1e6
    scale = TARGET_TWH / annual_load_twh
    mean_load = sum(load) / n

    # (1) Ereignisse: 6-h-Mittel des kombinierten CF Wind+PV < 10 %
    ws_cf = [(a + b + c) / (x + y + z) for a, b, c, x, y, z in zip(pv, on, off, kpv, kon, koff)]
    w_cf = [(b + c) / (y + z) for b, c, y, z in zip(on, off, kon, koff)]
    res_ev = {}
    for centered in (False, True):
        tag = "zentriert" if centered else "nachlaufend"
        r_ws = runs([(v is not None and v < 0.10) for v in roll_mean(ws_cf, 6, centered)])
        r_w = runs([(v is not None and v < 0.10) for v in roll_mean(w_cf, 6, centered)])
        res_ev[tag] = {
            "ws_ge10h": sum(1 for r in r_ws if r >= 10),
            "ws_ge24h": sum(1 for r in r_ws if r >= 24),
            "ws_ge48h": sum(1 for r in r_ws if r >= 48),
            "ws_laengste_h": max(r_ws) if r_ws else 0,
            "wind_laengste_h": max(r_w) if r_w else 0,
        }
    # stündlich ohne Glättung
    r_raw = runs([v < 0.10 for v in w_cf])
    res_ev["wind_stuendlich_laengste_h"] = max(r_raw)

    # (2) Fenster A: geringster Anteil Wind+PV an der Last (historisch)
    re_hist = [a + b + c for a, b, c in zip(pv, on, off)]
    sh_re = window_sums(re_hist, W)
    sh_load = window_sums(load, W)
    share = [r / l for r, l in zip(sh_re, sh_load)]
    iA = min(range(len(share)), key=lambda i: share[i])

    # projizierte Erzeugung 2030 je Stunde (MW)
    re30 = [(CAP["pv"] * a + CAP["on"] * b + CAP["off"] * c) * 1000 for a, b, c in zip(cpv, con, coff)]
    load30 = [l * scale for l in load]
    gap = [l - r for l, r in zip(load30, re30)]
    gap_pos = [max(0.0, g) for g in gap]

    def window_stats(i):
        sl = slice(i, i + W)
        return {
            "start_utc": ts[i],
            "anteil_wind_pv_an_last_hist": round(sum(re_hist[sl]) / sum(load[sl]), 4),
            "lastfaktor": round((sum(load[sl]) / W) / mean_load, 3),
            "luecke_netto_twh": round(sum(gap[sl]) / 1e6, 3),
            "luecke_nur_defizitstunden_twh": round(sum(gap_pos[sl]) / 1e6, 3),
            "last2030_twh": round(sum(load30[sl]) / 1e6, 3),
            "ee2030_twh": round(sum(re30[sl]) / 1e6, 3),
            "spitze_luecke_gw": round(max(gap[sl]) / 1000, 1),
            "bio_ror_hist_twh": round((sum(bio[sl]) + sum(ror[sl])) / 1e6, 3),
            "cf_wind_pv_gesamt": round(sum(re_hist[sl]) / (sum(kpv[sl]) + sum(kon[sl]) + sum(koff[sl])), 4),
        }

    # Fenster B: maximale projizierte Lücke (das für 2030 eigentlich relevante Fenster)
    gsum = window_sums(gap, W)
    iB = max(range(len(gsum)), key=lambda i: gsum[i])
    peak_year = max(gap) / 1000
    return {
        "fehlwerte": miss,
        "last_twh_jahr": round(annual_load_twh, 2),
        "skalierung": round(scale, 4),
        "ereignisse": res_ev,
        "fenster_min_anteil": window_stats(iA),
        "fenster_max_luecke2030": window_stats(iB),
        "spitze_luecke_jahr_gw": round(peak_year, 1),
    }


def neg_hours(year):
    p = os.path.join(RAW05, f"ec_price_{year}.json")
    d = json.load(open(p, encoding="utf-8"))
    ts, pr = d["unix_seconds"], d["price"]
    hours = {}
    for t, v in zip(ts, pr):
        if v is None:
            continue
        hours.setdefault(t - t % 3600, []).append(v)
    neg_h_mean = sum(1 for v in hours.values() if sum(v) / len(v) < 0)
    neg_any = sum(1 for v in hours.values() if min(v) < 0)
    neg_vals = sum(1 for v in pr if v is not None and v < 0)
    return {"stunden_mittel_negativ": neg_h_mean, "stunden_mit_neg_wert": neg_any,
            "werte_negativ": neg_vals, "werte": len(pr)}


def mmm(xs):
    return {"min": round(min(xs), 3), "median": round(statistics.median(xs), 3),
            "mean": round(statistics.mean(xs), 3), "max": round(max(xs), 3)}


def main():
    out = {"setzung": {"cap_gw": CAP, "last_twh": TARGET_TWH, "fenster_h": W}, "jahre": {}}
    for solar_key in ("solar_mw", "solar_total_mw"):
        res = {y: year_calc(y, solar_key) for y in YEARS}
        out["jahre"][solar_key] = res
        sm = {}
        for fk in ("fenster_min_anteil", "fenster_max_luecke2030"):
            sm[fk] = {k: mmm([res[y][fk][k] for y in YEARS]) for k in
                      ("luecke_netto_twh", "luecke_nur_defizitstunden_twh", "spitze_luecke_gw",
                       "lastfaktor", "anteil_wind_pv_an_last_hist", "bio_ror_hist_twh", "cf_wind_pv_gesamt")}
        for tag in ("nachlaufend", "zentriert"):
            ev = [res[y]["ereignisse"][tag] for y in YEARS]
            sm["ereignisse_" + tag] = {
                "ws_ge10h_2016_2025": sum(e["ws_ge10h"] for e, y in zip(ev, YEARS) if y >= 2016),
                "ws_ge48h_je_jahr": mmm([e["ws_ge48h"] for e in ev]),
                "wind_laengste_h": mmm([e["wind_laengste_h"] for e in ev]),
            }
        sm["spitze_luecke_jahr_gw"] = mmm([res[y]["spitze_luecke_jahr_gw"] for y in YEARS])
        out["zusammenfassung_" + solar_key] = sm
    out["negative_preise"] = {y: neg_hours(y) for y in range(2019, 2026)}
    with open(os.path.join(HERE, "p2_05_ergebnis.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(json.dumps({k: v for k, v in out.items() if k.startswith("zusammenfassung") or k == "negative_preise"},
                     ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()


def sensitivitaet():
    """Lücke mit Kapazitäten Stand 11/2026 (Energy-Charts: PV DC 133,4; Wind an Land 72,3; See 11,7 GW)
    statt Ziel 2030 — zeigt, wie stark das Ergebnis an der Ausbauannahme hängt."""
    global CAP
    alt = dict(CAP)
    CAP = {"pv": 133.4, "on": 72.3, "off": 11.7}
    res = {y: year_calc(y, "solar_mw") for y in YEARS}
    CAP = alt
    return {k: mmm([res[y]["fenster_max_luecke2030"][k] for y in YEARS])
            for k in ("luecke_netto_twh", "spitze_luecke_gw")}


if __name__ == "__main__" and os.environ.get("P2_05_SENS") == "1":
    print(json.dumps(sensitivitaet(), ensure_ascii=False))
