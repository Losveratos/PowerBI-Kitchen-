#!/usr/bin/env python3
"""P1-06: Jahreswerte der grenzüberschreitenden Flüsse Deutschlands aus Energy-Charts.
Quelle: api.energy-charts.info (cbpf = physikalische Flüsse, cbet = kommerzieller Handel), Fraunhofer ISE, CC BY 4.0.
Vorzeichen (geprüft): negativ = Export aus DE, positiv = Import nach DE. Einheit GW, 15-min-Raster.
Aufruf: python3 -I europa_flows.py <raw-dir> <out-json>"""
import json, sys, datetime as dt
raw, out = sys.argv[1], sys.argv[2]
res = {}
for kind in ("cbpf", "cbet"):
    for y in range(2015 if kind == "cbpf" else 2018, 2026):
        try:
            d = json.load(open(f"{raw}/{kind}_de_{y}.json"))
        except FileNotFoundError:
            continue
        ts = d["unix_seconds"]
        for c in d["countries"]:
            v = [x if x is not None else 0.0 for x in c["data"]]
            nmiss = sum(1 for x in c["data"] if x is None)
            imp = sum(x for x in v if x > 0) * 0.25 / 1000   # TWh
            exp = -sum(x for x in v if x < 0) * 0.25 / 1000
            # Stundenmittel für Spitzen
            hrs = {}
            for t, x in zip(ts, v):
                hrs.setdefault(t // 3600, []).append(x)
            hm = [sum(a) / len(a) for a in hrs.values()]
            res.setdefault(kind, {}).setdefault(str(y), {})[c["name"]] = {
                "import_TWh": round(imp, 2), "export_TWh": round(exp, 2),
                "netto_import_TWh": round(imp - exp, 2),
                "max_import_GW_h": round(max(hm), 2), "max_export_GW_h": round(-min(hm), 2),
                "fehlende_werte": nmiss, "punkte": len(v)}
json.dump(res, open(out, "w"), ensure_ascii=False, indent=1)
for kind in res:
    print(kind)
    for y, cs in res[kind].items():
        s = cs["sum"]
        print(y, s)
