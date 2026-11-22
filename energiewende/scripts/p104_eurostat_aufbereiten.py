#!/usr/bin/env python3
"""P1-04: Eurostat nrg_bal_c (Deutschland) aus raw/P1-04 in eine flache JSON (TWh) umsetzen.
Aufruf: python3 -I energiewende/scripts/p104_eurostat_aufbereiten.py
Quelle: Eurostat, nrg_bal_c, Stand der Datenbank 2026-08-27. Lizenz: CC BY 4.0 (Eurostat-Nachnutzung)."""
import itertools, json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
RAW = os.path.join(ROOT, "quellen", "raw", "P1-04")

def flat(path):
    d = json.load(open(path))
    ids, sz, dim = d["id"], d["size"], d["dimension"]
    cats = {k: list(dim[k]["category"]["index"]) for k in ids}
    vals = d["value"]
    out = []
    for coords in itertools.product(*[range(s) for s in sz]):
        i = 0
        for c, s in zip(coords, sz):
            i = i * s + c
        v = vals.get(str(i)) if isinstance(vals, dict) else vals[i]
        if v is None:
            continue
        r = {k: cats[k][c] for k, c in zip(ids, coords)}
        r["wert"] = v
        out.append(r)
    return out

rows = []
for f, unit in (("eurostat_balances_DE_2024.json", "GWH"), ("eurostat_zeitreihe_DE.json", "GWH")):
    for r in flat(os.path.join(RAW, f)):
        rows.append({"bilanz": r["nrg_bal"], "traeger": r["siec"], "jahr": int(r["time"]),
                     "twh": round(r["wert"] / 1000.0, 2)})
seen = {}
for r in rows:
    seen[(r["bilanz"], r["traeger"], r["jahr"])] = r
rows = sorted(seen.values(), key=lambda r: (r["bilanz"], r["traeger"], r["jahr"]))
doc = {
    "id": "p104_eurostat_de_energiebilanz",
    "quelle": "Eurostat, Complete energy balances (nrg_bal_c), Land DE, Einheit GWh -> hier TWh",
    "url": "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_bal_c",
    "stand_datenbank": "2026-08-27",
    "lizenz": "Eurostat-Daten: Nachnutzung mit Quellenangabe (Beschluss 2011/833/EU, CC BY 4.0)",
    "hinweis": "Eurostat-Abgrenzung, nicht AGEB: FC_E = Endenergie ohne internationalen Luftverkehr/Seeverkehr; INTAVI und INTMARB getrennt. TOTAL = alle Energieträger; E7000 Strom; RA000 erneuerbare; G3000 Erdgas; O4000XBIO Öl ohne Biokraftstoffe; C0000X0350-0370 feste fossile Brennstoffe; H8000 Wärme.",
    "daten": rows,
}
out = os.path.join(ROOT, "data", "p104_eurostat_de_energiebilanz.json")
json.dump(doc, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(rows), "Zeilen ->", out)
