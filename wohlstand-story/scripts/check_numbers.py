#!/usr/bin/env python3
"""Gleicht die fest im Text stehenden Zahlen der Story gegen data/story_data.json ab.

Die Grafiken rechnen aus DATA, der Fließtext nennt Zahlen ausgeschrieben. Jede dieser Zahlen
steht hier mit ihrer Herleitung; nach einem neuen Datenstand meldet das Skript, was nicht mehr passt.

    python3 -I wohlstand-story/scripts/check_numbers.py      # Exit-Code 1 bei Abweichung
"""
import json
import math
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
D = json.loads((ROOT / "data" / "story_data.json").read_text(encoding="utf-8"))
TPL = (ROOT / "story_template.html").read_text(encoding="utf-8").replace("&nbsp;", " ")
TPL = re.sub(r"</?a\b[^>]*>", "", TPL)                     # Links im Fließtext ändern nichts an den Zahlen
P, W, M = D["places"], D["world"], D["meta"]
K, L = P["koeln"], P["osl"]
C = W["compare"]
G = D["germany"]
PS = D["persons"]["span"]                                  # Spannen der Modellrechnung über alle Varianten
PMJ = json.loads((ROOT / "data" / "person_model.json").read_text(encoding="utf-8"))
_ov = PMJ["ergebnisse_hauptvariante"]["koeln_below_osl_median"]
OV = {"gdp": _ov["spanne_gdp"], "hh": _ov["spanne_hh"]}    # Anteil der Kölner unter dem mittleren Menschen in OSL
IN = D["income"]                                           # verfügbares Einkommen der Kreise (VGR der Länder)
CK = D["checks"]                                           # Abgleich mit Eurostat und Weltbank
TR = D["trend"]                                            # Deutschland unter den Ländern, 2000 bis 2024
SQ_DE = sum(1 for q in D["squares"] if q[0] == "DEU")      # Quadrate, die in Akt 3 an Deutschland gehen


def de(v, d=0):
    return f"{v:,.{d}f}".replace(",", "X").replace(".", ",").replace("X", ".")


def h(v):
    """auf drei geltende Stellen, wie im Atlas und im Text: 114.620 → 115.000, 51.305 → 51.300"""
    return de(float(f"{v:.3g}"))


top = {x["iso"]: x["mio"] for x in W["above_osl"]}
T = W["tight"]
rnd = lambda v: de(round(v))                    # ganze Prozent
top_share = 100 - L["world_below"]["2"]         # Anteil der Menschheit in Regionen über OSL

EXPECT = {
    # Hero, Akt 1
    "495 km": f"{de(M['dist_km'])} km",
    "Köln 115.000": f"{h(K['gdp'])} Int.$", "OSL 51.300": f"{h(L['gdp'])} Int.$",
    "Rang 28": f"Rang {K['de_rank']}", "Rang 307": f"Rang {L['de_rank']}", "400 Kreise": f"{K['de_n']} Kreise",
    "Faktor 2,2": f"Faktor von <span class=\"big\">{de(W['koeln_x_osl'], 1)}</span>",
    "Deutschland 74.000": f"{h(P['deu']['gdp'])} Int.$",
    "81 %": f"(<span class=\"big\">{rnd(L['de_richer_share'])} %</span>) wohnen in einem Kreis",
    "vier von fünf": "Vier von fünf" if 77 <= L["de_richer_share"] <= 83 else "!!",
    "113 Kreise ±10 %": f"<span class=\"big\">{T['n_near']}</span> andere Kreise, mehr als jeder vierte, liegen höchstens {T['band']} %" if T["n_near"] / (K["de_n"] - 1) > 0.25 else "!!",
    "Rang 248 / 361": f"Mit {T['band']} % mehr stünde OSL auf Rang {T['rank_plus']}, mit {T['band']} % weniger auf Rang {T['rank_minus']}",
    "eine Toleranz": "ok" if T["band"] == W["near_osl_band"] else "!!",
    # Schätzfrage
    "letzter Kreis": f"<b>{G['poorest']['name']}</b> mit {h(G['poorest']['gdp'])} Int.$", "Kreise im Atlas": f"letzten Platz der {K['de_n']} Kreise",
    # Akt 2
    "Mitte 15.000": f"rund <span class=\"big m\">{de(round(W['median'], -3))} Int.$</span>", "Kerala": W["median_name"],
    "Ost-Java": "Ost-Java" if abs(C["ID-JI"]["gdp"] / W["median"] - 1) < 0.06 else "!!", "24.500": h(W["mean"]),
    "16 %": f"{rnd(W['poor_half_share'])} %</span> der Weltwirtschaft", "rund 86 %": f"Rund <span class=\"big l\">{rnd(L['world_below']['2'])} %</span> der Menschheit", "rund 86 % (Titel)": f"OSL steht bei rund {rnd(L['world_below']['2'])} %",
    "rund 86 % (Gegenprobe)": f"„rund {rnd(L['world_below']['2'])} %“ und keine Nachkommastelle",
    "oberstes Siebtel": "zum obersten Siebtel" if 13.5 < top_share < 15.5 else "!!",
    "rund 98 %": f"rund <span class=\"big k\">{rnd(K['world_below']['2'])} %</span>",
    "knapp 13 %": f"knapp <span class=\"big\">{rnd(W['between_share'])} %</span> der Menschheit wohnen" if W["between_share"] < round(W["between_share"]) else "!!",
    "85,1": de(min(L["world_below"].values()), 1), "85,8 %": f"{de(max(L['world_below'].values()), 1)} %",
    "98,3": de(min(K["world_below"].values()), 1), "99,3 %": f"{de(max(K['world_below'].values()), 1)} %",
    "weniger als ein Punkt": "um weniger als einen Punkt" if max(L["world_below"].values()) - min(L["world_below"].values()) < 1 else "!!",
    "157 von 217": f"{W['n_whole']} der {W['n_countries']} Länder", "83 bis 88 %": f"liegt der Anteil zwischen {rnd(T['world_minus'])} und {rnd(T['world_plus'])} %",
    "83 bis 88 % (Methode)": f"für OSL liegt der Anteil zwischen {rnd(T['world_minus'])} und {rnd(T['world_plus'])} %",
    "Gegenprobe Länder": f"<td>{de(L['world_below']['0'], 1)} %</td><td>{de(K['world_below']['0'], 1)} %</td>",
    "Gegenprobe Bundesländer": f"<td>{de(L['world_below']['1'], 1)} %</td><td>{de(K['world_below']['1'], 1)} %</td>",
    "Gegenprobe Kreise": f"<td>{de(L['world_below']['2'], 1)} %</td><td>{de(K['world_below']['2'], 1)} %</td>",
    "Gegenprobe Metropolregionen": f"<td>{de(L['world_below']['3'], 1)} %</td><td>{de(K['world_below']['3'], 1)} %</td>",
    "5.929 Regionen": f"{de(M['n_fine'])} Regionen", "8,1 Mrd.": f"{de(M['world_pop'] / 1e9, 1)} Mrd.",
    "Rang 400": f"{G['poorest']['name']} steht in Deutschland auf Rang {K['de_n']}",
    "rund 73 %": f"rund <span class=\"big\">{rnd(G['poorest']['world_below'])} %</span>", "über 99 %": f"{G['richest']['name']}, der Sitz von Volkswagen, bei über <span class=\"big\">{int(G['richest']['world_below'])} %</span>",
    "gut ein Viertel": "nur gut ein Viertel auf, ganz rechts" if 25 < G["richest"]["world_below"] - G["poorest"]["world_below"] <= 29 and G["richest"]["world_below"] > 99 else "!!",
    # Akt 3
    "1.624 Quadraten": f"{de(M['n_sq'])} Quadraten",
    "Deutschland 84 Mio.": f"Deutschlands {de(P['deu']['pop'] / 1e6)} Mio. Menschen",
    "knapp 17 Quadrate": f"knapp {SQ_DE} Quadrate" if 0 < SQ_DE - P["deu"]["pop"] / M["square"] < 0.5 else "!!",
    "1.134 Mio.": f"{de(W['above_osl_mio'])} Mio.", "1,1 Mrd.": f"{de(W['above_osl_mio'] / 1000, 1)} Mrd. Menschen",
    "ein Siebtel": "Mio.</span>, ein Siebtel der Menschheit" if 13.5 < W["above_osl_mio"] * 1e6 / M["world_pop"] * 100 < 15 else "!!",
    "USA (283 Mio.)": f"USA ({de(round(top['USA']))} Mio.)", "China (120 Mio.)": f"China ({de(round(top['CHN']))} Mio.)",
    "379 Mio. ±10 %": f"höchstens {W['near_osl_band']} % über oder unter OSL liegt: <span class=\"big\">{de(W['near_osl_mio'])} Mio.</span>",
    "Japan (54.200)": f"Landesdurchschnitt von <b>Japan</b> ({h(C['JPN']['gdp'])})", "Portugal (52.500)": f"Portugal</b> ({h(C['PRT']['gdp'])})",
    "Polen (51.300)": f"Polen</b> ({h(C['POL']['gdp'])})", "Estland (50.400)": f"Estland</b> ({h(C['EST']['gdp'])})",
    "Mississippi (53.000)": f"Mississippi</b> ({h(C['USA-MS']['gdp'])})",
    "auf der Stufe ±10 %": "ok" if all(abs(C[k]["gdp"] / L["gdp"] - 1) <= 0.1 for k in ("JPN", "PRT", "POL", "EST", "USA-MS")) else "!!",
    "China 120 Mio. (Daten)": "ok" if round(top["CHN"]) == W["cn_above_osl_mio"] else "!!",
    "Shanghai (61.900)": f"Shanghai</b> ({h(C['CN-SH']['gdp'])})", "Peking (65.000)": f"Peking</b> ({h(C['CN-BJ']['gdp'])})",
    "Indien 0": "keinen Bundesstaat über OSL" if W["in_above_osl_mio"] == 0 else "!!",
    "rund 100 Mio.": f"rund <span class=\"big k\">{de(round(W['above_koeln_mio'], -1))} Mio.</span>", "Moskau (115.000)": f"Moskau</b> ({h(C['RU-MOS']['gdp'])})",
    "Moskau auf Kölns Stufe": "ok" if abs(C["RU-MOS"]["gdp"] / K["gdp"] - 1) < 0.02 else "!!",
    "Norwegen < Köln < Katar": "ok" if C["NOR"]["gdp"] < K["gdp"] < C["QAT"]["gdp"] else "!!",
    # Akt 4
    "Metro 89.100": h(K["metro_gdp"]), "Preis 109": f"{de(K['price'])}</span>", "Preis 92": f"in OSL bei <span class=\"big l\">{de(L['price'])}</span>",
    "Faktor 1,9": f"Faktor <span class=\"big\">{de(W['rp_ratio'], 1)}</span>", "105.000": f"<span class=\"k\">{h(K['rp'])}</span>", "55.600": h(L["rp"]),
    # Akt 4 / Schritt 3: verfügbares Einkommen der beiden Kreise (VGR der Länder), umgerechnet
    "Einkommen 28.800 / 25.100": f"in Köln <span class=\"big k\">{h(IN['koeln']['eur'])}</span>,\n      in OSL <span class=\"big l\">{h(IN['osl']['eur'])}</span> Euro im Jahr",
    "Faktor 1,14": f"Faktor <span class=\"big\">{de(IN['ratio'], 2)}</span> statt {de(W['koeln_x_osl'], 1)}",
    "179 Kreise beim Einkommen": f"{IN['n_near']} Kreise, fast jeder zweite, liegen beim Einkommen höchstens {IN['band']} %" if 0.42 < IN["n_near"] / (IN["n"] - 1) < 0.5 else "!!",
    "39.400 / 34.400": f"<span class=\"k\">{h(IN['koeln']['int'])}</span> gegen <span class=\"l\">{h(IN['osl']['int'])}</span> Int.$",
    "86 und 84 %": f"bei rund {rnd(IN['koeln']['world_below'])} und {rnd(IN['osl']['world_below'])} %", "knapp 3 Punkte": f"knapp {math.ceil(IN['world_gap'])} Punkte auseinander" if IN["world_gap"] % 1 >= 0.5 else "!!",
    "Einkommen 2023": f"Verfügbares Einkommen {IN['year']}",
    "Faktor 1,14 (Fazit)": f"trennt Köln und OSL Faktor {de(IN['ratio'], 2)} statt {de(W['koeln_x_osl'], 1)}",
    # Akt 4 / Schritt 5: Überschlag für einzelne Menschen (nur Aussagen, die in allen Varianten gelten)
    "Hauptrechnung 89 / 90 %": f"in OSL bei <span class=\"big l\">{rnd(D['persons']['osl']['p50'])} %</span>, der in Köln bei <span class=\"big k\">{rnd(D['persons']['koeln']['p50'])} %</span>",
    "mittlerer Mensch > 80 %": "sind es mehr als 80 %" if min(PS["osl_p50"][0], PS["koeln_p50"][0]) > 80 else "!!",
    "ärmstes Zehntel OSL > 60 %": "noch mehr als 60 % der Menschheit hinter sich" if PS["osl_p10"][0] > 60 else "!!",
    "höchstens 12 Punkte": f"höchstens {math.ceil(PS['median_gap'][1])} Punkte",
    "mindestens 20": f"Zehntel in OSL mindestens {int(PS['osl_spread_p10_p90'][0])}" if PS["osl_spread_p10_p90"][0] > PS["median_gap"][1] else "!!",
    "20 Varianten": f"In allen {D['persons']['n_variants']} gerechneten Varianten", "20 Varianten (Methode)": f"Gerechnet sind {D['persons']['n_variants']} Varianten",
    "Überlappung BIP 6–14 %": f"{rnd(OV['gdp'][0])} bis {rnd(OV['gdp'][1])} % der Kölner", "Überlappung Konsum 44–53 %": f"mit dem Konsum {rnd(OV['hh'][0])} bis {rnd(OV['hh'][1])} %",
    "ärmere Hälfte 9–14 %": f"{rnd(PMJ['plausibilitaet']['aermere_haelfte_spanne'][0])} bis {rnd(PMJ['plausibilitaet']['aermere_haelfte_spanne'][1])} % des Gesamten",
    # Und früher? (Länder, reales BIP pro Kopf 2000–2024)
    "93 % / 92 %": f"Rund {rnd(TR['last']['below'])} % der Menschheit leben in Ländern mit niedrigerem BIP pro Kopf, im Jahr {TR['start']} waren es {rnd(TR['first']['below'])} %",
    "so weit oben wie damals": "so weit oben wie damals" if TR["last"]["below"] >= TR["first"]["below"] and abs(TR["last"]["rank"] - TR["first"]["rank"]) <= 2 else "!!",
    "Platz 22 → 21 von 187": f"Unter den {TR['n']} Ländern der Reihe stand Deutschland damals auf Platz {TR['first']['rank']}, heute auf Platz {TR['last']['rank']}",
    "Taiwan fehlt": "Taiwan fehlt in der Reihe und läge heute davor" if TR["missing_ahead"] == ["Taiwan"] else "!!",
    "knapp 4-mal (Durchschnitt)": f"knapp {math.ceil(TR['first']['x_mean'])}-mal so hoch wie der Weltdurchschnitt" if TR["first"]["x_mean"] % 1 >= 0.5 else "!!",
    "knapp 3-mal": f"heute ist es knapp {math.ceil(TR['last']['x_mean'])}-mal so hoch" if TR["last"]["x_mean"] % 1 >= 0.5 else "!!",
    "Median 2000 China, noch stärker": "im Jahr 2000 war das China, ist der Abstand noch stärker gefallen" if TR["first"]["med_name"] == "China" and TR["first"]["x_med"] / TR["last"]["x_med"] > TR["first"]["x_mean"] / TR["last"]["x_mean"] else "!!",
    "seit 2019 pro Kopf nicht gewachsen": "seit 2019 ist das reale BIP pro Kopf in Deutschland nicht mehr gewachsen" if TR["since2019"]["DEU"] <= 0 else "!!",
    "USA knapp 10 %, Polen 18 %": f"in den USA um knapp {math.ceil(TR['since2019']['USA'])} % und in Polen um {rnd(TR['since2019']['POL'])} %" if TR["since2019"]["USA"] % 1 >= 0.5 else "!!",
    "187 Länder, 98 %": f"{TR['n']} Länder mit durchgehender Reihe ({rnd(TR['pop_share'])} % der Weltbevölkerung)",
    "Stillstand seit 2019 (Fazit)": "Stillstand seit 2019" if abs(TR["since2019"]["DEU"]) < 1 else "!!",
    "Shanghai 11 %": f"rund {rnd((C['CN-SH']['gdp'] / L['rp'] - 1) * 100)} % über dem chinesischen Schnitt",
    # Abgleich mit den Originalquellen
    "400 Kreise, 0,004 %": f"aller {CK['n_kreise']} deutschen Kreise" if CK["ranks_identical"] else "!!", "max. Abweichung": f"um höchstens {de(CK['max_dev_pct'], 3)} % ab, alle Ränge sind gleich",
    "Eurostat-Jahr": f"<code>nama_10r_3popgdp</code>, {CK['eurostat_year']})",
    "zwölf Länder": f"Zwölf geprüfte Länderwerte weichen ebenfalls um höchstens {de(CK['max_dev_countries_pct'], 3)} % ab" if CK["n_countries"] == 12 else "!!",
    "Rang 27 / 300 (neuerer Stand)": f"({CK['vgrdl_stand']}) stünden Köln und OSL auf Rang {CK['vgrdl_rank']['koeln']} und {CK['vgrdl_rank']['osl']}",
    # Fazit, Grenzen, Methode
    "279 Plätze": f"{de(L['de_rank'] - K['de_rank'])} Plätze", "113 Kreise (Fazit)": f"{T['n_near']} Kreise liegen höchstens {T['band']} % von OSL entfernt",
    "73 % (Fazit)": f"rund {rnd(G['poorest']['world_below'])} % der Menschheit leben",
    "Niveau Japans": "ok" if abs(C["JPN"]["gdp"] / L["gdp"] - 1) <= 0.1 else "!!",
    "157 Länder (Grenzen)": f"{W['n_whole']} Länder gar nicht",
    "genau 85,6 / 98,3 / 12,7": f"{de(L['world_below']['2'], 1)} % für OSL und {de(K['world_below']['2'], 1)} % für Köln, dazwischen {de(W['between_share'], 1)} %",
    "genau 114.620 / 51.305": f"Köln genau {de(K['gdp'])}, OSL {de(L['gdp'])}",
    "8,12 Mrd.": f"{de(M['world_pop'] / 1e9, 2)} Mrd.", "39 Mio.": f"{de(M['nodata_mio'])} Mio. Menschen",
}
TPL += " ok "          # Bedingungen ohne Textstelle liefern "ok" oder "!!"

bad = [(k, v) for k, v in EXPECT.items() if v not in TPL]
for k, v in EXPECT.items():
    print(("✗ " if (k, v) in bad else "✓ ") + f"{k:24s} → {v}")
if bad:
    print(f"\n{len(bad)} Zahl(en) passen nicht mehr zum Text.")
    sys.exit(1)
print(f"\nAlle {len(EXPECT)} Zahlen stimmen.")
