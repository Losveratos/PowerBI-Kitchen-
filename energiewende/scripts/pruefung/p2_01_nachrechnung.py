"""P2-01 Gegenprüfung Dossier 01: unabhängige Nachrechnung der Factsheets A, B, H, I
und der Wirtschaftsleistungs-Relation. Eigene Umsetzung, nicht aus Dossier-Skripten übernommen.
Aufruf: python3 -I p2_01_nachrechnung.py <pfad zu energiewende/data>"""
import json, sys, os
data = sys.argv[1] if len(sys.argv) > 1 else "energiewende/data"
def pct(a, b): return (a - b) / b * 100

print("== Factsheet A ==")
tage = 5; verbrauch = 520.0; preis = 200_000  # EUR/MWh
twh = verbrauch * tage / 365
print(f"Speicher {twh:.3f} TWh; Kosten {twh*1e6*preis/1e12:.3f} Bio. EUR (Papier: 7 TWh, 1,4 Bio.)")
print(f"mit exakt 7 TWh: {7e6*preis/1e12:.2f} Bio.; Bischof 112 Mrd/560 GWh = {112e9/560e6:.0f} EUR/kWh; 7000/560 = {7000/560}")
print(f"'heute' implizit = 520/1,1 = {520/1.1:.0f} TWh")
# Lastprofile: jährliche Netzlast und schwächstes 5-Tage-Fenster heutiger EE-Erzeugung
for y in (2023, 2024, 2025):
    f = os.path.join(data, f"profiles_{y}.json")
    if not os.path.exists(f): continue
    d = json.load(open(f)); s = d["series"]
    n = len(s["load_mw"]["mw"])
    load = [x or 0 for x in s["load_mw"]["mw"]]
    ee = [sum((s[k]["mw"][i] or 0) for k in ("solar_total_mw", "wind_onshore_mw", "wind_offshore_mw", "hydro_ror_mw", "biomass_mw")) for i in range(n)]
    L = sum(load) / 1e6
    w = 120
    best = None
    cl = sum(load[:w]); ce = sum(ee[:w])
    for i in range(n - w + 1):
        if i:
            cl += load[i + w - 1] - load[i - 1]; ce += ee[i + w - 1] - ee[i - 1]
        gap = cl - ce
        if best is None or gap > best[0]: best = (gap, i, cl, ce)
    gap, i, cl, ce = best
    print(f"{y}: Netzlast {L:.1f} TWh; schwächstes 120-h-Fenster ab {d['timestamps_utc'][i]}: Last {cl/1e6:.2f} TWh, "
          f"EE-Erzeugung (heutiger Park) {ce/1e6:.2f} TWh = {ce/cl:.0%} der Last, Lücke {gap/1e6:.2f} TWh")

print("== Factsheet B ==")
print(f"Mix EE 34+11+6+3={34+11+6+3}; gesamt {54+43+3}")
print(f"430 TWh/57 GW = {430e3/57:.0f} h = {430e3/57/8760:.1%}")
print(f"31 x 1,6 GW = {31*1.6:.1f} GW; 310 Mrd/49,6 GW = {310e9/49.6e6:.0f} EUR/kW; 7000 EUR/kW x 50 GW = {7000*50e6/1e9:.0f} Mrd; x 49,6 GW = {7000*49.6e6/1e9:.0f} Mrd")
foerd = 12.2 * 11 / 12.5
print(f"Gas: Förderung {foerd:.2f} Mrd + Bau 11 Mrd = {foerd+11:.2f} Mrd (Papier 22, davon 10,7)")
print(f"QC Preis 82/105 = {82/105:.3f} -> {pct(82,105):.1f} %; 8,2 ct vs 38 ct = Faktor {38/8.2:.2f}")
print(f"Modernisierung 8,5 Mrd/7 GW = {8.5e9/7e6:.0f} EUR/kW")

print("== Factsheet H ==")
tab = {"USA": (13.83, 8.97, 349), "China": (9.24, 4.38, 1410), "Russland": (14.45, 9.59, 143),
       "Indien": (2.07, -2.79, 1480), "Deutschland": (7.06, 2.20, 83)}
for k, (e, z, b) in tab.items():
    print(f"{k:12s} E-Zukauf = {e-z:.2f} t; Kosten/Kopf {abs(z)*80:.1f} EUR; gesamt {abs(z)*80*b/1e3:.1f} Mrd; "
          f"mit 4,68: Zukauf {e-4.68:.2f} t, gesamt {(e-4.68)*80*b/1e3:.1f} Mrd ({pct((e-4.68),(z)):+.1f} %)")
print(f"Familie: 4 x 176 = {4*176}; /12 = {4*176/12:.2f} (Papier 68,60); mit 4,68: {4*(7.06-4.68)*80:.1f}/Jahr, {4*(7.06-4.68)*80/12:.2f}/Monat")
print(f"USA 14,2/7,06 = {14.2/7.06:.2f}")

print("== Factsheet I ==")
for v in (3200, 20300):
    print(f"{v} TWh / 860 = {v/860:.1f} Jahre; / 200 = {v/200:.0f} Jahre; LNG 105/860 = {105/860:.1%}")
print(f"UBA Vorkette 23600/3805 = {23600/3805:.2f}")

print("== Haupttext S. 12 ==")
for v in (10, 13.8, 13.3):
    print(f"{v} Bio / 4,47 Bio BIP = {v/4.47:.2f}")
print("== Factsheet G ==")
print(f"(58,4/54,2)^(1/9)-1 = {((58.4/54.2)**(1/9)-1)*100:.2f} %")
for k, v in {"CN": 16.1, "US": 6.0, "IN": 4.5, "EU": 3.1, "RU": 2.6, "DE": 0.6}.items():
    print(f"  {k} {v/58.4:.1%}")
