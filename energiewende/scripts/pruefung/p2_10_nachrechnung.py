"""Gegenprüfung P2-10 (Dossier 10 Wirtschaftslage): unabhängige Nachrechnung.

Liest ausschließlich die in Phase 2 neu abgerufenen Dateien unter
quellen/raw/P2-10/ (Eurostat-API, Ember-Jahresdatei) und rechnet die Zahlen
der Kernaussagen nach. Aufruf:  python3 -I scripts/pruefung/p2_10_nachrechnung.py
"""
import csv
import os
import sys

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import p2_10_jsonstat as js  # noqa: E402

R = os.path.join(HIER, "..", "..", "quellen", "raw", "P2-10")


def pfad(n):
    return os.path.join(R, n)


def pct(a, b):
    return (a / b - 1) * 100


def kopf(t):
    print("\n=== " + t + " ===")


# 1) Industrieproduktion
kopf("Industrieproduktion sts_inpr_a, I21, CA")
ids, e = js.lese(pfad("sts_inpr_a.json"))
for geo in ["DE", "EU27_2020", "FR", "IT", "ES", "PL", "IE"]:
    for nace in ["B-D", "C", "C20", "C24", "C17", "C23", "C29"]:
        s = js.filtere(ids, e, geo=geo, nace_r2=nace)
        if not s:
            continue
        z = {k: s.get(k) for k in ["2017", "2018", "2019", "2022", "2023", "2024", "2025"]}
        v19 = pct(z["2025"], z["2019"]) if z["2025"] and z["2019"] else None
        v18 = pct(z["2025"], z["2018"]) if z["2025"] and z["2018"] else None
        print(f"{geo:10s} {nace:4s} " + " ".join(f"{k}:{v}" for k, v in z.items())
              + f" | 25v19 {v19:+.1f}% | 25v18 {v18:+.1f}%" if v19 is not None else "")

# 2) Strompreise Industrie, Haushalt; Gas Industrie (Halbjahre)
kopf("Industriestrom nrg_pc_205, X_VAT, ct/kWh")
ids, e = js.lese(pfad("nrg_pc_205.json"))
hj = ["2010-S1", "2015-S1", "2019-S1", "2021-S1", "2022-S2", "2023-S1", "2024-S1", "2025-S1", "2025-S2", "2026-S1"]
for band in ["MWH2000-19999", "MWH20000-69999"]:
    print(band)
    for geo in ["DE", "EU27_2020", "FR", "PL", "ES", "IT", "DK", "NL"]:
        s = js.filtere(ids, e, geo=geo, nrg_cons=band)
        print(f"  {geo:10s} " + " ".join(f"{h}:{s[h]*100:.2f}" if h in s else f"{h}:-" for h in hj))
s_de = js.filtere(ids, e, geo="DE", nrg_cons="MWH2000-19999")
s_eu = js.filtere(ids, e, geo="EU27_2020", nrg_cons="MWH2000-19999")
s_fr = js.filtere(ids, e, geo="FR", nrg_cons="MWH2000-19999")
for h in ["2019-S1", "2025-S2", "2026-S1"]:
    print(f"  DE/EU {h}: {s_de[h]/s_eu[h]:.3f}  DE/FR {h}: {s_de[h]/s_fr[h]:.3f}")
# Rangfolge 2026-S1 und 2025-S2 aller abgerufenen Länder
for h in ["2025-S2", "2026-S1"]:
    rang = sorted(((js.filtere(ids, e, geo=g, nrg_cons="MWH2000-19999").get(h), g)
                   for g in ["DE", "EU27_2020", "FR", "PL", "ES", "IT", "DK", "NL"]), reverse=True)
    print("  Rang", h, [(g, round(v * 100, 2)) for v, g in rang if v])

kopf("Haushaltsstrom nrg_pc_204, I_TAX, ct/kWh")
ids, e = js.lese(pfad("nrg_pc_204.json"))
hj2 = ["2010-S1", "2019-S1", "2022-S2", "2023-S1", "2025-S1", "2025-S2", "2026-S1"]
for geo in ["DE", "EU27_2020", "FR", "PL", "ES", "IT", "DK", "NL"]:
    s = js.filtere(ids, e, geo=geo)
    print(f"  {geo:10s} " + " ".join(f"{h}:{s[h]*100:.2f}" if h in s else f"{h}:-" for h in hj2))
de = js.filtere(ids, e, geo="DE")
eu = js.filtere(ids, e, geo="EU27_2020")
for h in ["2010-S1", "2019-S1", "2026-S1"]:
    print(f"  DE/EU {h}: {de[h]/eu[h]:.3f}")
print("  Halbjahre mit DE <= EU27:", [h for h in sorted(de) if h in eu and de[h] <= eu[h]])
print("  Mittel 2025 S1/S2:", (de["2025-S1"] + de["2025-S2"]) / 2 * 100)

kopf("Industriegas nrg_pc_203, X_VAT, ct/kWh")
ids, e = js.lese(pfad("nrg_pc_203.json"))
for geo in ["DE", "EU27_2020", "FR", "ES", "IT", "PL", "NL"]:
    s = js.filtere(ids, e, geo=geo)
    print(f"  {geo:10s} " + " ".join(f"{h}:{s[h]*100:.2f}" if h in s else f"{h}:-" for h in ["2010-S1", "2019-S1", "2022-S2", "2023-S1", "2026-S1"]))

# 3) Preiskomponenten
for datei, name in [("nrg_pc_204_c.json", "Haushalt 2500-4999 kWh"), ("nrg_pc_205_c.json", "Industrie 2000-19999 MWh")]:
    kopf("Komponenten " + name + " ct/kWh")
    ids, e = js.lese(pfad(datei))
    for comp in ["NRG_SUP", "NETC", "TAX_FEE_LEV_CHRG", "TAX_RNW", "VAT"]:
        s = js.filtere(ids, e, nrg_prc=comp)
        print(f"  {comp:18s} " + " ".join(f"{y}:{s[y]*100:.2f}" for y in sorted(s) if y >= "2019"))
    tot = {}
    for comp in ["NRG_SUP", "NETC", "TAX_FEE_LEV_CHRG", "VAT"]:
        for y, v in js.filtere(ids, e, nrg_prc=comp).items():
            tot[y] = tot.get(y, 0) + v
    print("  Summe (SUP+NETC+TAX+VAT) " + " ".join(f"{y}:{tot[y]*100:.2f}" for y in sorted(tot) if y >= "2019"))
    ohne = {y: tot[y] - js.filtere(ids, e, nrg_prc="VAT").get(y, 0) for y in tot}
    print("  Summe ohne MwSt          " + " ".join(f"{y}:{ohne[y]*100:.2f}" for y in sorted(ohne) if y >= "2019"))

# 4) BIP und Investitionen
kopf("nama_10_gdp")
ids, e = js.lese(pfad("nama_10_gdp.json"))
for geo in ["DE", "EU27_2020", "FR", "ES", "IT"]:
    bipr = js.filtere(ids, e, geo=geo, na_item="B1GQ", unit="CLV20_MEUR")
    invr = js.filtere(ids, e, geo=geo, na_item="P51G", unit="CLV20_MEUR")
    bipn = js.filtere(ids, e, geo=geo, na_item="B1GQ", unit="CP_MEUR")
    invn = js.filtere(ids, e, geo=geo, na_item="P51G", unit="CP_MEUR")
    quote = js.filtere(ids, e, geo=geo, na_item="P51G", unit="PC_GDP")
    print(f"  {geo}: BIP real 25v19 {pct(bipr['2025'], bipr['2019']):+.2f}% | Inv real 25v19 {pct(invr['2025'], invr['2019']):+.2f}%"
          f" | BIP nom 2025 {bipn.get('2025')} | Inv nom 2025 {invn.get('2025')} | Quote 2019 {quote.get('2019')} 2025 {quote.get('2025')}"
          f" | BIP real 2023 {bipr.get('2023')} 2024 {bipr.get('2024')}")

# 5) Erwerbstätige
kopf("nama_10_a64_e, Tsd.")
ids, e = js.lese(pfad("nama_10_a64_e.json"))
for nace in ["C", "D", "C20", "TOTAL"]:
    s = js.filtere(ids, e, nace_r2=nace)
    print(f"  {nace}: " + " ".join(f"{y}:{s[y]}" for y in sorted(s)))

# 6) Stromerzeugung Eurostat
kopf("nrg_bal_peh GEP, TWh")
ids, e = js.lese(pfad("nrg_bal_peh.json"))
for geo in ["DE", "ES", "IT", "DK", "FR", "PL", "EU27_2020"]:
    for siec in ["TOTAL", "FE", "N900H", "RA000"]:
        s = js.filtere(ids, e, geo=geo, siec=siec)
        print(f"  {geo:10s} {siec:6s} " + " ".join(f"{y}:{s[y]/1000:.1f}" for y in sorted(s)))

# 7) Ember: "als einziges Industrieland"
kopf("Ember yearly: OECD/G20-Länder, 2005 -> 2024 und 2025")
daten = {}
meta = {}
with open(pfad("ember_yearly_global.csv"), encoding="utf-8") as f:
    for r in csv.DictReader(f):
        if r["Area type"] != "Country or economy":
            continue
        if not (r["OECD member"] == "True" or r["G20 member"] == "True"):
            continue
        a = r["Area"]
        meta[a] = (r["OECD member"], r["G20 member"], r["G7 member"])
        src = r["Electricity source"]
        if src not in ("Fossil", "Renewables", "Nuclear", "Total generation", "Clean", "Coal", "Gas", "Demand"):
            continue
        try:
            daten[(a, int(r["Year"]), src)] = float(r["Generation (TWh)"])
        except ValueError:
            pass
zeilen = []
for a in sorted(meta):
    try:
        f05, f24 = daten[(a, 2005, "Fossil")], daten[(a, 2024, "Fossil")]
        r05, r24 = daten[(a, 2005, "Renewables")], daten[(a, 2024, "Renewables")]
        t05, t24 = daten[(a, 2005, "Total generation")], daten[(a, 2024, "Total generation")]
        n05, n24 = daten.get((a, 2005, "Nuclear"), 0), daten.get((a, 2024, "Nuclear"), 0)
    except KeyError:
        continue
    zeilen.append((a, f05, f24, r05, r24, n05, n24, t05, t24))
print(f"{'Land':22s} fossil05 fossil24 dFossil  EE05  EE24  Kern05 Kern24 Ges05 Ges24  G7")
for z in sorted(zeilen, key=lambda z: (z[2] - z[1]) / z[1] if z[1] else 0):
    a, f05, f24, r05, r24, n05, n24, t05, t24 = z
    print(f"{a:22s} {f05:8.1f} {f24:8.1f} {pct(f24, f05) if f05 else 0:+6.1f}% {r05:6.1f} {r24:6.1f} {n05:6.1f} {n24:6.1f} {t05:6.0f} {t24:6.0f}  {meta[a][2]}")
fall = [z[0] for z in zeilen if z[2] < z[1] * 0.9 and z[4] > z[3]]
print("\nLänder mit fossil 2024 < 90 % von 2005 und mehr EE:", len(fall), "von", len(zeilen))
print(fall)
kern = [z[0] for z in zeilen if z[5] > 5 and z[6] < 0.5 * z[5]]
print("Länder mit Kernenergie 2024 < 50 % von 2005 (Start > 5 TWh):", kern)
for a in ["Germany", "United Kingdom", "Japan", "United States of America", "France", "Spain", "Italy", "Korea (the Republic of)", "Belgium", "Sweden", "Switzerland"]:
    if (a, 2025, "Fossil") in daten:
        print(f"  {a} 2025: fossil {daten[(a, 2025, 'Fossil')]}, EE {daten[(a, 2025, 'Renewables')]}, Kern {daten.get((a, 2025, 'Nuclear'))}, gesamt {daten[(a, 2025, 'Total generation')]}")

kopf("Ember: Ersatz-Kennzahl (fossil+Kern) 2005->2024 gegen EE-Zuwachs, Gesamterzeugung, Nachfrage")
print(f"{'Land':16s} d(fossil+Kern) dEE   dGesamt dNachfrage  Ersatzquote=-d(fossil+Kern)/dEE")
for a in ["Germany", "United Kingdom", "Denmark", "Spain", "Italy", "France", "Belgium", "Japan",
          "United States", "Portugal", "Netherlands", "Sweden", "Finland", "Greece", "Australia", "Canada", "South Korea", "China"]:
    try:
        df = (daten[(a, 2024, "Fossil")] + daten.get((a, 2024, "Nuclear"), 0)) - (daten[(a, 2005, "Fossil")] + daten.get((a, 2005, "Nuclear"), 0))
        de_ = daten[(a, 2024, "Renewables")] - daten[(a, 2005, "Renewables")]
        dg = daten[(a, 2024, "Total generation")] - daten[(a, 2005, "Total generation")]
        dn = daten.get((a, 2024, "Demand"), 0) - daten.get((a, 2005, "Demand"), 0)
        print(f"{a:16s} {df:+10.1f} {de_:+8.1f} {dg:+8.1f} {dn:+9.1f}   {-df/de_ if de_ else 0:6.2f}")
    except KeyError as ex:
        print(a, "fehlt", ex)

kopf("EU27 ohne Irland (Näherung mit Wertschöpfungsgewichten 2021, nama_10_a64 B1G CP_MEUR)")
ids_w, ew = js.lese(pfad("nama_10_a64_c_va.json"))
ids, e = js.lese(pfad("sts_inpr_a.json"))
for nace in ["C", "C20"]:
    w_eu = js.filtere(ids_w, ew, geo="EU27_2020", nace_r2=nace).get("2021")
    w_ie = js.filtere(ids_w, ew, geo="IE", nace_r2=nace).get("2021")
    w_de = js.filtere(ids_w, ew, geo="DE", nace_r2=nace).get("2021")
    eu = js.filtere(ids, e, geo="EU27_2020", nace_r2=nace)
    ie = js.filtere(ids, e, geo="IE", nace_r2=nace)
    if not (w_eu and w_ie and ie):
        print(nace, "Gewicht oder Irland-Index fehlt", w_eu, w_ie, bool(ie))
        continue
    a = w_ie / w_eu
    oh = {y: (eu[y] - a * ie[y]) / (1 - a) for y in ("2019", "2025")}
    print(f"{nace}: Anteil IE {a*100:.1f} %, DE {w_de/w_eu*100:.1f} %; EU27 25v19 {pct(eu['2025'], eu['2019']):+.1f} %, "
          f"EU27 ohne IE (Näherung) {pct(oh['2025'], oh['2019']):+.1f} %")
w_eu = js.filtere(ids_w, ew, geo="EU27_2020", nace_r2="C")["2021"]
a_ie = js.filtere(ids_w, ew, geo="IE", nace_r2="C")["2021"] / w_eu
a_de = js.filtere(ids_w, ew, geo="DE", nace_r2="C")["2021"] / w_eu
eu = js.filtere(ids, e, geo="EU27_2020", nace_r2="C")
ie = js.filtere(ids, e, geo="IE", nace_r2="C")
dd = js.filtere(ids, e, geo="DE", nace_r2="C")
r = {y: (eu[y] - a_ie * ie[y] - a_de * dd[y]) / (1 - a_ie - a_de) for y in ("2019", "2025")}
print(f"C: EU27 ohne IE und ohne DE (Näherung) 25v19 {pct(r['2025'], r['2019']):+.1f} %")
