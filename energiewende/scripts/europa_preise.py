#!/usr/bin/env python3
"""P1-06: Preise bei Import und Export (Day-Ahead), Energy-Charts (Datenquelle: Bundesnetzagentur | SMARD.de, CC BY 4.0).
Methode: stündlich; Flüsse = kommerzieller Handel (cbet) je Grenze; Preis des Nachbarn = Gebotszone laut Zuordnung unten (DK -> DK1, NO -> NO2, SE -> SE4: Setzung (M)).
Mengengewichtete Mittel: Importpreis = Σ(Import_h · Preis_Nachbar_h)/Σ Import_h; Exportpreis = Σ(Export_h · Preis_DE_h)/Σ Export_h (DE-LU-Preis, die Ausfuhr wird zum deutschen Marktpreis erlöst, vereinfachend).
Aufruf: python3 -I europa_preise.py <raw-dir> <out-json> <jahr>..."""
import json, sys
raw, out = sys.argv[1], sys.argv[2]
years = sys.argv[3:]
ZONE = {"Austria": "AT", "Belgium": "BE", "Switzerland": "CH", "Czech Republic": "CZ", "Denmark": "DK1", "France": "FR",
        "Netherlands": "NL", "Norway": "NO2", "Poland": "PL", "Sweden": "SE4"}
def hourly_price(zone, y):
    d = json.load(open(f"{raw}/price_{zone}_{y}.json"))
    acc = {}
    for t, p in zip(d["unix_seconds"], d["price"]):
        if p is None: continue
        acc.setdefault(t // 3600, []).append(p)
    return {h: sum(v) / len(v) for h, v in acc.items()}
res = {}
for y in years:
    de = hourly_price("DE-LU", y)
    f = json.load(open(f"{raw}/cbet_de_{y}.json"))
    ts = f["unix_seconds"]
    flows = {}
    for c in f["countries"]:
        acc = {}
        for t, x in zip(ts, c["data"]):
            if x is None: continue
            acc.setdefault(t // 3600, []).append(x)
        flows[c["name"]] = {h: sum(v) / len(v) for h, v in acc.items()}   # GW, +Import
    r = {"de_mittel_eur_mwh": round(sum(de.values()) / len(de), 1), "grenzen": {}}
    tot = {"imp": 0, "imp_p": 0, "exp": 0, "exp_p": 0, "imp_pde": 0}
    for name, z in ZONE.items():
        if name not in flows: continue
        pz = hourly_price(z, y)
        iv = ip = ipde = ev = ep = 0.0
        for h, x in flows[name].items():
            if h not in pz or h not in de: continue
            if x > 0: iv += x; ip += x * pz[h]; ipde += x * de[h]
            elif x < 0: ev += -x; ep += -x * de[h]
        if iv and ev:
            r["grenzen"][name] = {"zone": z, "import_TWh": round(iv / 1000, 2), "export_TWh": round(ev / 1000, 2),
                                  "importpreis_nachbar": round(ip / iv, 1), "deutscher_preis_in_importstunden": round(ipde / iv, 1),
                                  "exportpreis_de": round(ep / ev, 1)}
        tot["imp"] += iv; tot["imp_p"] += ip; tot["imp_pde"] += ipde; tot["exp"] += ev; tot["exp_p"] += ep
    r["gesamt_je_grenze"] = {"import_TWh": round(tot["imp"] / 1000, 1), "export_TWh": round(tot["exp"] / 1000, 1),
                             "importpreis_mw": round(tot["imp_p"] / tot["imp"], 1), "de_preis_in_importstunden_mw": round(tot["imp_pde"] / tot["imp"], 1),
                             "exportpreis_mw": round(tot["exp_p"] / tot["exp"], 1)}
    # Residual: Anteil Stunden, in denen DE Netto-Importeur ist, und DE-Preis dann vs. sonst
    s = [c for c in f["countries"] if c["name"] == "sum"][0]
    acc = {}
    for t, x in zip(ts, s["data"]):
        if x is not None: acc.setdefault(t // 3600, []).append(x)
    sm = {h: sum(v) / len(v) for h, v in acc.items()}
    imp_h = [h for h, x in sm.items() if x > 0 and h in de]; exp_h = [h for h, x in sm.items() if x < 0 and h in de]
    r["netto_importstunden"] = len(imp_h); r["netto_exportstunden"] = len(exp_h)
    r["de_preis_mittel_in_netto_importstunden"] = round(sum(de[h] for h in imp_h) / len(imp_h), 1)
    r["de_preis_mittel_in_netto_exportstunden"] = round(sum(de[h] for h in exp_h) / len(exp_h), 1)
    # Preisspitzen: Stunden mit DE-Preis > 200 EUR/MWh und Netto-Importanteil dort
    sp = [h for h in de if de[h] > 200 and h in sm]
    r["stunden_de_preis_ueber_200"] = len(sp)
    r["davon_netto_import"] = sum(1 for h in sp if sm[h] > 0)
    r["mittlerer_netto_import_gw_in_spitzen"] = round(sum(sm[h] for h in sp) / len(sp), 2) if sp else None
    res[y] = r
json.dump(res, open(out, "w"), ensure_ascii=False, indent=1)
print(json.dumps(res, ensure_ascii=False, indent=1))
