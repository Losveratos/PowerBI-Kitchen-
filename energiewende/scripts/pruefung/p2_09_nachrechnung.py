#!/usr/bin/env python3
"""P2-09 Gegenprüfung: unabhängige Nachrechnung der Eigenrechnungen in
research/09_referenzpfade.md. Eingangswerte stammen aus den Primärdokumenten
(Fundstelle jeweils im Kommentar), nicht aus dem Skript des Dossiers.
Aufruf: python3 -I energiewende/scripts/pruefung/p2_09_nachrechnung.py
"""


def pct(a, b):
    """Abweichung a gegen b in Prozent."""
    return (a - b) / b * 100


rows = []


def rep(name, ours, dossier, unit=""):
    dev = pct(ours, dossier) if dossier else float("nan")
    rows.append((name, ours, dossier, unit, dev))


# 1 R21 Factsheet B (S. B-3): 31 Blöcke à 1.600 MW, 310 Mrd. EUR
gw = 31 * 1.6
rep("R21 Neubau GW", gw, 49.6, "GW")
rep("R21 Neubau EUR/kW", 310e9 / (gw * 1e6), 6250, "EUR/kW")

# 2 Nettoleistung (WNA/PRIS laut Suchtreffer): Isar 2, Emsland, GKN II, Brokdorf, Grohnde, KRB C
konvoi = 1410 + 1335 + 1310
rep("Konvoi-Trio MW", konvoi, 4055, "MW")
rep("Gruppe A MW", konvoi + 1410 + 1360, 6825, "MW")
rep("plus Gundremmingen C MW", konvoi + 1410 + 1360 + 1288, 8113, "MW")

# 3 Emissionsfaktoren UBA CC 28/2022, Tab. 23 (Wert 2020), t CO2/TJ -> t/MWh_el
TJ_PER_MWH = 0.0036
ef = {"gas": 55.8, "stk": 93.6, "bk_rh": 113.3, "bk_la": 110.2}
rep("Gas-GuD 58 % t/MWh_el", ef["gas"] * TJ_PER_MWH / 0.58, 0.35)
rep("Gasturbine 40 % t/MWh_el", ef["gas"] * TJ_PER_MWH / 0.40, 0.50)
rep("Steinkohle 45 % t/MWh_el", ef["stk"] * TJ_PER_MWH / 0.45, 0.75)
rep("Braunkohle Rheinland 40 %", ef["bk_rh"] * TJ_PER_MWH / 0.40, 1.02)
rep("Braunkohle Lausitz 40 %", ef["bk_la"] * TJ_PER_MWH / 0.40, 0.99)

# 4 Reaktivierung, Rechenbeispiel (Setzung M des Dossiers: 8.000 h)
for gwr, d_twh, d_gas, d_bk in [(6.8, 55, 19, 56), (4.1, 32, 11, 33)]:
    twh = gwr * 8000 / 1000
    rep(f"{gwr} GW TWh/a", twh, d_twh, "TWh")
    rep(f"{gwr} GW Mt ggü. Gas-GuD (0,35)", twh * 0.35, d_gas, "Mt")
    rep(f"{gwr} GW Mt ggü. Braunkohle (1,0)", twh * 1.0, d_bk, "Mt")
# mit dem mid-Wert der Volllaststunden (7.800 h) statt 8.000 h
rows.append(("6,8 GW TWh/a bei 7.800 h (mid)", 6.8 * 7.8, None, "TWh", float("nan")))

# 5 Schiefergas-Vollkette: UBA CC 21/2019 S. 19 (23.600 / 3.805 g/GJ), S. 14 (6,5-19 g/MJ)
burn = 55.8  # kg/GJ = t/TJ
lng = 23.6 + burn
nor = 3.805 + burn
sh_lo, sh_hi = 6.5 + burn, 19.0 + burn
rep("Faktor Vorkette LNG USA / Norwegen", 23.6 / 3.805, 6.2)
rep("Norwegen ggü. US-LNG %", (1 - nor / lng) * 100, 25)
rep("Schiefergas ggü. US-LNG max. Einsparung %", (1 - sh_lo / lng) * 100, 22)
rep("Schiefergas ggü. US-LNG min. Einsparung %", (1 - sh_hi / lng) * 100, 6)
rep("Schiefergas ggü. Norwegen min. Mehr %", (sh_lo / nor - 1) * 100, 5)
rep("Schiefergas ggü. Norwegen max. Mehr %", (sh_hi / nor - 1) * 100, 26)
# Mittlerer Wert ca. 12 g/MJ (UBA S. 11: US/UK/AUS unkonventionell)
rows.append(("Schiefergas 12 g/MJ ggü. US-LNG %", (1 - (12 + burn) / lng) * 100, None, "%", float("nan")))

# Mengenbeispiel: 200 TWh, davon 106 TWh statt US-LNG, 94 TWh statt Norwegen
pj_lng, pj_nor = 106 * 3.6, 94 * 3.6  # PJ = 1e6 GJ
best = (sh_lo - lng) * pj_lng + (sh_lo - nor) * pj_nor  # kg/GJ * PJ = kt -> /1000 Mt
worst = (sh_hi - lng) * pj_lng + (sh_hi - nor) * pj_nor
rep("Netto-Effekt günstig Mt/a", best / 1000, -5.6, "Mt")
rep("Netto-Effekt ungünstig Mt/a", worst / 1000, 3.3, "Mt")

# 6 Plateau 20 Mrd. m3 ~ 200 TWh gegen Verbrauch 864 und Förderung 34 TWh (BNetzA 2025)
rep("Plateau / Verbrauch %", 200 / 864 * 100, 23, "%")
rep("Plateau / heimische Förderung", 200 / 34, 6, "x")
rep("LNG-Anteil Importe %", 106 / 1031 * 100, 10.3, "%")

# 7 CCS-Mehrkosten (Setzung M des Dossiers: +15 % / +25 % Brennstoff, 90 % Abscheidung)
cap_gas = 0.35 * 1.15 * 0.90
cap_bk = 1.00 * 1.25 * 0.90
rep("Gas abgeschieden t/MWh", cap_gas, 0.36)
rep("Gas Mehrkosten min EUR/MWh", cap_gas * 150, 54)
rep("Gas Mehrkosten max EUR/MWh", cap_gas * 300, 108)
rep("Braunkohle abgeschieden t/MWh", cap_bk, 1.15)
rep("Braunkohle Mehrkosten min EUR/MWh", cap_bk * 150, 170)
rep("Braunkohle Mehrkosten max EUR/MWh", cap_bk * 300, 345)
rep("Gas Rest bei 57 % t/MWh", 0.35 * 1.15 * 0.43, 0.17)
rep("Braunkohle Rest bei 57 % t/MWh", 1.0 * 1.25 * 0.43, 0.55)
# vermiedene statt abgeschiedene Tonne (Gas): 0,35 - Rest bei 90 %
avoided = 0.35 - 0.35 * 1.15 * 0.10
rows.append(("Gas vermieden t/MWh (90 %)", avoided, None, "t", float("nan")))
rows.append(("Gas Kosten je vermiedene t bei 150-300 EUR/t abgeschieden",
             cap_gas * 150 / avoided, None, f"bis {cap_gas*300/avoided:.0f} EUR/t", float("nan")))

# 8 Zeitachse Neubau
for lo, d in [((5, 8), 2040), ((8, 12), 2047), ((12, 17), 2056)]:
    rep(f"Erster Block {lo}", 2027 + sum(lo), d, "Jahr")

# 9 EPR2: 72,8 Mrd. EUR2020 für 6 Blöcke; Nettoleistung je Block 1,67 GW (Setzung Prüfer)
for gw_block in (1.6, 1.67):
    rows.append((f"EPR2 EUR/kW bei {gw_block} GW/Block", 72.8e9 / (6 * gw_block * 1e6), 7300, "EUR/kW",
                 pct(72.8e9 / (6 * gw_block * 1e6), 7300)))
rows.append(("EPR2 EUR/kW zu heutigen Preisen (~85 Mrd., Presse)", 85e9 / (6 * 1.67e6), None, "EUR/kW", float("nan")))

# 10 ETS-1-Cap: Cap 2024 = 1.386,05 Mio. (EK, inkl. Seeverkehr +78,4);
# LRF-Minderung 84 Mio./a (4,3 %), 86 Mio./a ab 2028 (4,4 %) laut UBA-Rahmendaten S. 32;
# Rebasing -27 Mio. 2026 (EK-Seite ETS-Cap).
def cap_path(start):
    cap, path = start, {2024: start}
    for y in range(2025, 2046):
        cap -= 84 if y <= 2027 else 86
        if y == 2026:
            cap -= 27
        path[y] = cap
    return path

for label, start in [("inkl. Seeverkehr", 1386.05), ("ohne Seeverkehr", 1386.05 - 78.4)]:
    p = cap_path(start)
    first_zero = min(y for y, v in p.items() if v <= 0)
    rows.append((f"ETS-1-Cap {label}: Cap 2039 Mio.", p[2039], None, "Mio.", float("nan")))
    rep(f"ETS-1-Cap {label}: erstes Jahr <= 0", first_zero, 2039, "Jahr")

w = max(len(r[0]) for r in rows)
for name, ours, d, unit, dev in rows:
    ds = "" if d is None else f"{d:>10}"
    dv = "" if dev != dev else f"{dev:+6.1f} %"
    print(f"{name:<{w}}  {ours:>10.3f}  {ds:>10}  {unit:<18} {dv}")
