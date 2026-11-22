#!/usr/bin/env python3
"""P2-06 Gegenprüfung Dossier 06 Europa: unabhängige Nachrechnung.

Eigenständiger Code (nicht aus scripts/europa_*.py übernommen).
Liest Energy-Charts-Rohdaten unter data/raw/europa/ (CC BY 4.0, Fraunhofer ISE;
Preise: Bundesnetzagentur | SMARD.de) und Eurostat nrg_cb_e aus
quellen/raw/P1-06_europa/.

Aufruf: python3 -I energiewende/scripts/pruefung/p2_06_nachrechnung.py
Ausgabe: JSON auf stdout.

Methodische Entscheidungen des Prüfers (können vom Dossier abweichen):
- Jahressumme TWh = Summe der 15-min-Werte (GW) * 0,25 h / 1000 über die
  Länderspalten (nicht die Spalte "sum"); die Spalte "sum" wird separat
  verglichen.
- Stundenmittel = Mittel der vier Viertelstunden, Stunde = floor(unix/3600).
- Preise 2025 ab Oktober im 15-min-Raster: Stundenmittel gebildet.
- Wind-CF = (onshore + offshore) / installierte Leistung des Jahres (Energy-Charts).
"""
import json
import math
import os
import sys
from collections import defaultdict

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW = os.path.join(ROOT, "data", "raw", "europa")


def load(name):
    with open(os.path.join(RAW, name), encoding="utf-8") as f:
        return json.load(f)


def hourly(ts, vals):
    acc = defaultdict(list)
    for t, v in zip(ts, vals):
        if v is None:
            continue
        acc[t // 3600].append(v)
    return {h: sum(v) / len(v) for h, v in acc.items()}


def flows(kind, year):
    d = load(f"{kind}_de_{year}.json")
    ts = d["unix_seconds"]
    step_h = (ts[1] - ts[0]) / 3600.0
    countries = [c for c in d["countries"] if c["name"] != "sum"]
    summ = next((c for c in d["countries"] if c["name"] == "sum"), None)
    total = [0.0] * len(ts)
    per = {}
    for c in countries:
        s = 0.0
        for i, v in enumerate(c["data"]):
            if v is None:
                continue
            total[i] += v
            s += v
        per[c["name"]] = s * step_h / 1000.0
    net = sum(total) * step_h / 1000.0
    imp = sum(sum(max(v or 0, 0) for v in c["data"]) for c in countries) * step_h / 1000.0
    exp = sum(sum(min(v or 0, 0) for v in c["data"]) for c in countries) * step_h / 1000.0
    sumcol = None
    if summ:
        sumcol = sum(v for v in summ["data"] if v is not None) * step_h / 1000.0
    h = hourly(ts, total)
    hmax = max(h.items(), key=lambda kv: kv[1])
    hmin = min(h.items(), key=lambda kv: kv[1])
    return {
        "netto_twh": round(net, 2),
        "sum_spalte_twh": round(sumcol, 2) if sumcol is not None else None,
        "import_brutto_je_grenze_twh": round(imp, 1),
        "export_brutto_je_grenze_twh": round(-exp, 1),
        "max_import_gw_h": round(hmax[1], 2),
        "max_import_zeit_utc_h": hmax[0] * 3600,
        "max_export_gw_h": round(-hmin[1], 2),
        "stunden_ueber_15gw_import": sum(1 for v in h.values() if v > 15),
        "je_land_twh": {k: round(v, 1) for k, v in per.items()},
        "hourly": h,
    }


def price_hourly(zone, year):
    d = load(f"price_{zone}_{year}.json")
    return hourly(d["unix_seconds"], d["price"])


ZONE = {"Austria": "AT", "Belgium": "BE", "Czech Republic": "CZ", "Denmark": "DK1",
        "France": "FR", "Netherlands": "NL", "Norway": "NO2", "Poland": "PL",
        "Sweden": "SE4", "Switzerland": "CH"}


def preise(year):
    de = price_hourly("DE-LU", year)
    d = load(f"cbet_de_{year}.json")
    ts = d["unix_seconds"]
    per_h = {}
    for c in d["countries"]:
        if c["name"] == "sum":
            continue
        per_h[c["name"]] = hourly(ts, c["data"])
    hours = sorted(de)
    tot = {h: sum(per_h[c].get(h, 0.0) for c in per_h) for h in hours}
    zp = {c: price_hourly(z, year) for c, z in ZONE.items()}
    # mengengewichteter Importpreis (Nachbarzone), DE-Preis in denselben Importflüssen
    num_imp = den_imp = num_de_imp = 0.0
    num_exp = den_exp = 0.0
    for h in hours:
        for c, ser in per_h.items():
            v = ser.get(h)
            if v is None:
                continue
            if v > 0 and c in zp and h in zp[c]:
                num_imp += v * zp[c][h]
                num_de_imp += v * de[h]
                den_imp += v
            elif v < 0:
                num_exp += -v * de[h]
                den_exp += -v
    imp_h = [h for h in hours if tot[h] > 0]
    exp_h = [h for h in hours if tot[h] < 0]
    spitzen = [h for h in hours if de[h] > 200]
    sp_imp = [h for h in spitzen if tot[h] > 0]
    mean = lambda xs: sum(xs) / len(xs) if xs else float("nan")
    # Netto-Import in den Spitzen vs. Gesamtmittel Netto-Import in Importstunden
    return {
        "de_preis_mittel": round(mean([de[h] for h in hours]), 1),
        "stunden": len(hours),
        "importpreis_mengengew": round(num_imp / den_imp, 1),
        "de_preis_in_importfluessen_mengengew": round(num_de_imp / den_imp, 1),
        "exportpreis_mengengew": round(num_exp / den_exp, 1),
        "stunden_netto_import": len(imp_h),
        "stunden_netto_export": len(exp_h),
        "de_preis_netto_importstunden": round(mean([de[h] for h in imp_h]), 1),
        "de_preis_netto_exportstunden": round(mean([de[h] for h in exp_h]), 1),
        "stunden_ueber_200": len(spitzen),
        "davon_netto_import": len(sp_imp),
        "mittl_netto_import_in_spitzen_gw": round(mean([tot[h] for h in spitzen]), 2),
        "mittl_netto_import_in_allen_importstunden_gw": round(mean([tot[h] for h in imp_h]), 2),
        "anteil_importstunden_gesamt": round(len(imp_h) / len(hours), 3),
        "max_preis": round(max(de.values()), 1),
        "max_preis_zeit_utc_h": max(de, key=de.get) * 3600,
    }


def inst(country, year):
    d = load(f"inst_{country}.json")
    idx = d["time"].index(str(year))
    out = {}
    for p in d["production_types"]:
        out[p["name"]] = p["data"][idx]
    return out


def wind_cf(country, year):
    d = load(f"pp_{country}_{year}.json")
    ts = d["unix_seconds"]
    tot = [0.0] * len(ts)
    have = False
    for p in d["production_types"]:
        if p["name"] in ("Wind onshore", "Wind offshore"):
            have = True
            for i, v in enumerate(p["data"]):
                if v is not None:
                    tot[i] += v
    if not have:
        return None, None
    h = hourly(ts, tot)  # MW
    ins = inst(country, year)
    cap = (ins.get("Wind onshore") or 0) + (ins.get("Wind offshore") or 0)  # GW
    return {k: v / 1000.0 / cap for k, v in h.items()}, cap


def pearson(a, b):
    n = len(a)
    ma, mb = sum(a) / n, sum(b) / n
    sab = sum((x - ma) * (y - mb) for x, y in zip(a, b))
    sa = math.sqrt(sum((x - ma) ** 2 for x in a))
    sb = math.sqrt(sum((y - mb) ** 2 for y in b))
    return sab / (sa * sb)


def wind(year):
    de, capde = wind_cf("de", year)
    res = {"cap_de_gw": round(capde, 2)}
    nb = ["fr", "nl", "dk", "pl", "at", "be", "cz", "no", "se", "ch"]
    cfs, caps = {}, {}
    for c in nb:
        s, cap = wind_cf(c, year)
        if s is None:
            continue
        cfs[c], caps[c] = s, cap
    common = sorted(set(de).intersection(*[set(v) for v in cfs.values()]))
    res["gemeinsame_stunden"] = len(common)
    dev = [de[h] for h in common]
    thr = sorted(dev)[int(0.1 * len(dev))]
    low = [h for h in common if de[h] <= thr]
    for c, s in cfs.items():
        res[c] = {"r": round(pearson(dev, [s[h] for h in common]), 3),
                  "cap_gw": round(caps[c], 2),
                  "cf_mittel": round(sum(s[h] for h in common) / len(common), 3),
                  "cf_in_de_dezil": round(sum(s[h] for h in low) / len(low), 3)}
    agg_c = [c for c in ["fr", "nl", "dk", "pl", "at", "be", "cz", "no", "se"] if c in cfs]
    capsum = sum(caps[c] for c in agg_c)
    agg = {h: sum(cfs[c][h] * caps[c] for c in agg_c) / capsum for h in common}
    av = [agg[h] for h in common]
    res["aggregat"] = {"r": round(pearson(dev, av), 3), "cap_gw": round(capsum, 1),
                       "cf_mittel": round(sum(av) / len(av), 3),
                       "cf_in_de_dezil": round(sum(agg[h] for h in low) / len(low), 3)}
    res["de_dezil_schwelle"] = round(thr, 4)
    res["de_unter_10pct_h"] = sum(1 for h in common if de[h] < 0.10)
    res["beide_unter_10pct_h"] = sum(1 for h in common if de[h] < 0.10 and agg[h] < 0.10)
    # längste Phase DE<10 % und Aggregat<15 %, nur echte Folgestunden
    best = run = 0
    prev = None
    for h in common:
        if de[h] < 0.10 and agg[h] < 0.15:
            run = run + 1 if prev is not None and h == prev + 1 else 1
            prev = h
        else:
            run = 0
            prev = None
        best = max(best, run)
    res["laengste_phase_de10_agg15_h"] = best
    # Empfindlichkeit: DK-CF 2024 mit 2023er Kapazität
    return res


def fr_nuclear(year_pairs):
    out = {}
    for label, files in year_pairs.items():
        vals = []
        for fname, months in files:
            d = load(fname)
            ts = d["unix_seconds"]
            nuc = next(p for p in d["production_types"] if p["name"] == "Nuclear")["data"]
            import time
            for t, v in zip(ts, nuc):
                if v is None:
                    continue
                m = time.gmtime(t + 3600).tm_mon
                if m in months:
                    vals.append(v / 1000.0)
        out[label] = {"mittel_gw": round(sum(vals) / len(vals), 2), "min_gw": round(min(vals), 2), "n": len(vals)}
    for y in (2023, 2024):
        d = load(f"pp_fr_{y}.json")
        nuc = next(p for p in d["production_types"] if p["name"] == "Nuclear")["data"]
        step = (d["unix_seconds"][1] - d["unix_seconds"][0]) / 3600
        out[f"jahr_{y}_twh"] = round(sum(v for v in nuc if v is not None) * step / 1e6, 1)
    return out


def eurostat():
    p = os.path.join(ROOT, "quellen", "raw", "P1-06_europa", "eurostat_nrg_cb_e.json")
    with open(p, encoding="utf-8") as f:
        d = json.load(f)
    dims = d["id"]
    size = d["size"]
    cats = {k: d["dimension"][k]["category"]["index"] for k in dims}
    labels = {k: {v: kk for kk, v in (cats[k].items() if isinstance(cats[k], dict) else enumerate(cats[k]))} for k in dims}
    out = {}
    for flat, val in d["value"].items():
        i = int(flat)
        coords = []
        for s in reversed(size):
            coords.append(i % s)
            i //= s
        coords = list(reversed(coords))
        key = tuple(labels[k][c] for k, c in zip(dims, coords))
        out["|".join(key)] = val
    return dims, out


def main():
    res = {"fluesse": {}, "preise": {}, "wind": {}, "eurostat": None}
    for kind, years in (("cbet", range(2018, 2026)), ("cbpf", range(2015, 2026))):
        for y in years:
            r = flows(kind, y)
            r.pop("hourly")
            res["fluesse"][f"{kind}_{y}"] = r
    for y in (2023, 2024, 2025):
        res["preise"][y] = preise(y)
    for y in (2023, 2024):
        res["wind"][y] = wind(y)
    res["fr_kernkraft"] = fr_nuclear({
        "winter_2023_jan_feb_dez": [("pp_fr_2023.json", (1, 2, 12))],
        "winter_2024_jan_feb_dez": [("pp_fr_2024.json", (1, 2, 12))],
    })
    res["fr_inst_nuclear_2023_2024"] = [inst("fr", 2023).get("Nuclear"), inst("fr", 2024).get("Nuclear")]
    try:
        dims, es = eurostat()
        res["eurostat_dims"] = dims
        res["eurostat"] = {k: v for k, v in es.items()}
    except Exception as e:  # noqa
        res["eurostat"] = f"Fehler: {e}"
    json.dump(res, sys.stdout, ensure_ascii=False, indent=1, default=str)


if __name__ == "__main__":
    main()


def brutto_spitzen(year, kind="cbet"):
    """Zusatz: höchste Stundensumme der Brutto-Importe (nur positive Grenzwerte) und Brutto-Exporte."""
    d = load(f"{kind}_de_{year}.json")
    ts = d["unix_seconds"]
    per = [hourly(ts, c["data"]) for c in d["countries"] if c["name"] != "sum"]
    hours = set().union(*[set(p) for p in per])
    gi = {h: sum(max(p.get(h, 0), 0) for p in per) for h in hours}
    ge = {h: sum(min(p.get(h, 0), 0) for p in per) for h in hours}
    return round(max(gi.values()), 2), round(-min(ge.values()), 2)
