#!/usr/bin/env python3
"""Gleicht die fest im Text stehenden Zahlen der Story gegen data/story_data.json ab.

Die Grafiken rechnen aus DATA, der Fließtext nennt Zahlen ausgeschrieben. Jede dieser Zahlen
steht hier mit ihrer Herleitung; nach einem neuen Datenstand meldet das Skript, was nicht mehr passt.

    python3 -I wohlstand-story/scripts/check_numbers.py      # Exit-Code 1 bei Abweichung
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
D = json.loads((ROOT / "data" / "story_data.json").read_text(encoding="utf-8"))
TPL = (ROOT / "story_template.html").read_text(encoding="utf-8")
P, W, M = D["places"], D["world"], D["meta"]
K, L = P["koeln"], P["osl"]
C = W["compare"]


def de(v, d=0):
    return f"{v:,.{d}f}".replace(",", "X").replace(".", ",").replace("X", ".")


h = lambda v: de(round(v / 100) * 100)          # auf Hunderter gerundet: 114.600
top = {x["iso"]: x["mio"] for x in W["above_osl"]}

EXPECT = {
    # Hero, Akt 1
    "494 km": f"{de(M['dist_km'])} km",
    "Köln 114.600": h(K["gdp"]), "OSL 51.300": h(L["gdp"]),
    "Rang 28": f"Rang {K['de_rank']}", "Rang 307": f"Rang {L['de_rank']}", "400 Kreise": f"{K['de_n']} Kreise",
    "mehr als 85 %": f"mehr als {int(L['world_below']['2'])} % der Menschheit",
    "Faktor 2,2": f"Faktor {de(W['koeln_x_osl'], 1)}",
    "Deutschland 74.000": f"{de(round(P['deu']['gdp'], -3))} Int.$",
    "81,2 %": f"{de(L['de_richer_share'], 1)} %", "10,8 %": f"{de(K['de_richer_share'], 1)} %",
    # Akt 2
    "15.300": h(W["median"]), "Kerala": W["median_name"], "24.500": h(W["mean"]),
    "15,8 %": f"{de(W['poor_half_share'], 1)} %", "85,6 %": f"{de(L['world_below']['2'], 1)} %",
    "3,4-Fachen": f"{de(W['osl_x_median'], 1)}-Fachen", "98,3 %": f"{de(K['world_below']['2'], 1)} %",
    "12,7 %": f"{de(W['between_share'], 1)} %",
    "85,1": de(min(L["world_below"].values()), 1), "85,8 %": f"{de(max(L['world_below'].values()), 1)} %",
    "99,3 %": f"{de(max(K['world_below'].values()), 1)} %",
    "5.929 Regionen": f"{de(M['n_fine'])} Regionen", "8,1 Mrd.": f"{de(M['world_pop'] / 1e9, 1)} Mrd.",
    # Akt 3
    "1.624 Quadraten": f"{de(M['n_sq'])} Quadraten", "1.134 Mio.": f"{de(W['above_osl_mio'])} Mio.",
    "USA (283 Mio.)": f"USA ({de(round(top['USA']))} Mio.)", "China (120 Mio.)": f"China ({de(round(top['CHN']))} Mio.)",
    "Polen (51.300)": f"Polen</b> ({h(C['POL']['gdp'])})", "Estland (50.400)": f"Estland</b> ({h(C['EST']['gdp'])})",
    "Mississippi (53.000)": f"Mississippi</b> ({de(round(C['USA-MS']['gdp'], -3))})",
    "120 Mio. Chinesen": f"{de(W['cn_above_osl_mio'])} Mio.</span> Chinesen",
    "Shanghai (61.900)": f"Shanghai</b> ({h(C['CN-SH']['gdp'])})", "Peking (65.000)": f"Peking</b> ({h(C['CN-BJ']['gdp'])})",
    "Indien 0": "keine einzige Region" if W["in_above_osl_mio"] == 0 else "!!",
    "101 Mio.": f"{de(W['above_koeln_mio'])} Mio.", "Moskau (114.700)": f"Moskau</b> ({h(C['RU-MOS']['gdp'])})",
    # Akt 4
    "Metro 89.100": h(K["metro_gdp"]), "Preis 109": f"{de(K['price'])}</span>", "Preis 92": f"({de(L['price'])}</span>)" if False else f"(<span class=\"big l\">{de(L['price'])}</span>)",
    "Faktor 1,9": f"Faktor <span class=\"big\">{de(W['rp_ratio'], 1)}</span>", "104.800": h(K["rp"]), "55.600": h(L["rp"]),
    "38.700": h(K["hh"]), "35.900": h(L["hh"]), "Faktor 1,08": f"Faktor <span class=\"big\">{de(W['hh_ratio'], 2)}</span>",
    # Epilog, Methode
    "279 Plätze": f"{de(L['de_rank'] - K['de_rank'])} Plätze", "13 % der Menschen": f"{de(W['between_share'])} % der Menschen",
    "8,12 Mrd.": f"{de(M['world_pop'] / 1e9, 2)} Mrd.", "39 Mio.": f"{de(M['nodata_mio'])} Mio. Menschen",
}

bad = [(k, v) for k, v in EXPECT.items() if v not in TPL]
for k, v in EXPECT.items():
    print(("✗ " if (k, v) in bad else "✓ ") + f"{k:24s} → {v}")
if bad:
    print(f"\n{len(bad)} Zahl(en) passen nicht mehr zum Text.")
    sys.exit(1)
print(f"\nAlle {len(EXPECT)} Zahlen stimmen.")
