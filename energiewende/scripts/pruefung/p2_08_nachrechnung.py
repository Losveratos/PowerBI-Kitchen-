#!/usr/bin/env python3
"""P2-08 Gegenpruefung: unabhaengige Nachrechnung der Eigenrechnungen in
research/08_wasserstoff_efuels_lkw.md (Abschnitte 3.4, 6, 7).

Eigener Code nach den im Dossier abgedruckten Formeln (7.2) und Parametern (7.3);
das Skript scripts/p1_08_regler.py wird nicht importiert. Ausgabe: Tabelle mit
Dossierwert, Nachrechnung und Abweichung in Prozent.
"""

# Parameter je Fall aus Dossier-Tabelle 7.3 (abgeschrieben, nicht importiert)
CASES = {
    "low":  dict(Ed=130, rb=0.40, rh=0.73, el=0.75, di=1.00, dh=100, de=100, ptl=0.57, hpe=1.35, vls=5500),
    "mid":  dict(Ed=170, rb=0.50, rh=0.88, el=0.70, di=0.95, dh=150, de=150, ptl=0.45, hpe=1.35, vls=4000),
    "high": dict(Ed=185, rb=0.58, rh=1.00, el=0.64, di=0.90, dh=250, de=195, ptl=0.37, hpe=1.35, vls=3000),
}


def calc(c, h, mh, me):
    p = CASES[c]
    strom_h2_einheit = 1.0 / (p["el"] * p["di"])          # TWh Strom je TWh H2 beim Verbraucher
    h2 = p["dh"] + h * p["Ed"] * p["rh"]                     # TWh H2
    s_h2 = h2 * strom_h2_einheit                             # Strom fuer H2, falls alles Inland
    s_ef = p["de"] / p["ptl"]                                # Strom fuer E-Fuels, falls alles Inland
    s_lkw = (1 - h) * p["Ed"] * p["rb"]
    inland = s_lkw + (1 - mh) * s_h2 + (1 - me) * s_ef
    ausland = mh * s_h2 + me * s_ef
    # Elektrolyse-Eingangsstrom: H2-Pfad komplett, E-Fuel-Pfad nur der Elektrolyse-Anteil
    el_in = (1 - mh) * s_h2 + (1 - me) * (p["hpe"] * p["de"] / p["el"])
    gw = el_in * 1000.0 / p["vls"]
    return dict(inland=inland, ausland=ausland, gw=gw, s_lkw=s_lkw,
                s_h2_de=(1 - mh) * s_h2, s_ef_de=(1 - me) * s_ef)


def row(label, dossier, mine):
    dev = (mine - dossier) / dossier * 100 if dossier else float("nan")
    print(f"{label:58s} {dossier:10.1f} {mine:10.1f} {dev:+7.1f} %")


if __name__ == "__main__":
    print(f"{'Groesse':58s} {'Dossier':>10s} {'P2':>10s} {'Abw.':>8s}")
    # Tabelle 7.4 (mid)
    tab = {(0, 0): (85, 226, 333, 644, 0, 129), (0, .5): (85, 113, 167, 364, 279, 64),
           (0, 1): (85, 0, 0, 85, 559, 0), (.5, 0): (43, 338, 333, 714, 0, 157),
           (.5, .5): (43, 169, 167, 378, 336, 78), (.5, 1): (43, 0, 0, 43, 671, 0),
           (1, 0): (0, 451, 333, 784, 0, 185), (1, .5): (0, 225, 167, 392, 392, 93),
           (1, 1): (0, 0, 0, 0, 784, 0)}
    for (h, m), d in tab.items():
        r = calc("mid", h, m, m)
        for lab, dv, mv in zip(("Lkw", "H2", "EF", "DE", "Ausland", "GW"), d,
                               (r["s_lkw"], r["s_h2_de"], r["s_ef_de"], r["inland"], r["ausland"], r["gw"])):
            if dv:
                row(f"7.4 mid h={h} m={m} {lab}", dv, mv)
    # Bandbreiten Strom DE
    band = {(0, 0): (361, 644, 1068), (1, 0): (435, 784, 1282), (0, .5): (206, 364, 588), (1, .5): (218, 392, 641)}
    for (h, m), vals in band.items():
        for c, dv in zip(("low", "mid", "high"), vals):
            row(f"Band Strom DE h={h} m={m} {c}", dv, calc(c, h, m, m)["inland"])
    for c, dv in zip(("low", "mid", "high"), (57, 129, 282)):
        row(f"Elektrolyse GW h=0 m=0 {c}", dv, calc(c, 0, 0, 0)["gw"])
    # Lkw-Regler allein
    for c, dt, dg in (("low", 75, 23), ("mid", 140, 56), ("high", 214, 107)):
        a, b = calc(c, 1, 0, 0), calc(c, 0, 0, 0)
        row(f"Lkw-Regler dTWh {c} (m=0)", dt, a["inland"] - b["inland"])
        row(f"Lkw-Regler dGW {c} (m=0)", dg, a["gw"] - b["gw"])
    for c, dt in (("low", 11), ("mid", 27), ("high", 53)):
        a, b = calc(c, 1, .5, .5), calc(c, 0, .5, .5)
        row(f"Lkw-Regler dTWh {c} (m=0,5)", dt, a["inland"] - b["inland"])
    a, b = calc("mid", 1, .5, .5), calc("mid", 0, .5, .5)
    row("Lkw-Regler dGW mid (m=0,5)", 28, a["gw"] - b["gw"])
    # Plausibilitaetsprobe Ariadne
    row("Plausi h=0 mH2=0,32 mEF=0,8 GW mid", 53, calc("mid", 0, .32, .8)["gw"])
    # Abschnitt 3.4: Strom je TWh Diesel
    for c, dv in zip(("low", "mid", "high"), (0.97, 1.32, 1.74)):
        p = CASES[c]
        row(f"3.4 Strom je TWh Diesel FCEV {c}", dv, p["rh"] / (p["el"] * p["di"]))
    row("3.4 Lkw Batterie 170 TWh mid", 85, 170 * 0.5)
    row("3.4 FCEV 170 TWh mid", 225, 170 * 0.88 / (0.70 * 0.95))
    row("3.4 Band BEV min (130*0,40)", 52, 130 * 0.40)
    row("3.4 Band BEV max (185*0,58)", 107, 185 * 0.58)
    row("3.4 Band FCEV min (130*0,97)", 127, 130 * 0.73 / 0.75)
    row("3.4 Band FCEV max (185*1,74)", 321, 185 * 1.0 / (0.64 * 0.90))
    # Abschnitt 6 / Kernaussage 1
    row("UBA 73/31 Faktor", 2.35, 73 / 31)
    row("10 GW * 4000 h * 70 % (TWh)", 28, 10 * 4000 * 0.70 / 1000)
    row("10 GW * 4000 h * 75 % (TWh, EWI-Basis)", 28, 10 * 4000 * 0.75 / 1000)
    row("EWI FID+Betrieb 1451,5 MW*4000*0,75 (TWh)", 4.3, (180.5 + 1271.0) * 4000 * 0.75 / 1e6)
    row("Anteil 4,3/28 (%)", 100 / 7, 4.3 / 28 * 100)
    row("Anteil 26,8/28 (%)", 26.8 / 28 * 100, (4.3 + 22.5) / 28 * 100)
    row("Faktor Ziel/Betrieb 10/0,1805", 60, 10 / 0.1805)
    row("Faktor Ziel/KfW 10/2,4", 4, 10 / 2.4)
    # TREMOD-Umrechnungen
    row("Kerosin 402,3 PJ -> TWh", 111.7, 402.3 / 3.6)
    row("SNF 611 PJ -> TWh", 169.7, 611 / 3.6)
    row("SNF kWh/km (611 PJ / 60,5 Mrd km)", 2.8, 611 / 3.6 / 60.5)
    row("Diesel gesamt 1415 PJ -> TWh", 393, 1415 / 3.6)
    row("H2 2024 Summe 43,2+0,4+6,3", 49.9, 43.2 + 0.4 + 6.3)
    # E-Kerosin EUR/l (Heizwert 11,94 kWh/kg, 0,8 kg/l)
    kwh_l = 11.94 * 0.8
    for lab, dv, eur_mwh in (("2030 DE min", 1.6, 167.7), ("2030 DE max", 2.1, 219.2),
                             ("2050 DE min", 1.1, 115.0), ("2050 DE max", 1.6, 166.1),
                             ("2050 ES/MA min", 0.85, 89.1), ("2050 ES/MA max", 1.3, 133.7)):
        row(f"E-Kerosin EUR/l {lab}", dv, eur_mwh * kwh_l / 1000)
    row("EASA 7695 EUR/t -> EUR/l", 6.2, 7695 * 0.8 / 1000)
    row("EASA 7695 EUR/t -> EUR/MWh", 644, 7695 / 11.94)
    row("Fossil 600 EUR/t -> EUR/l", 0.5, 600 * 0.8 / 1000)
    row("Fossil 816 EUR/t -> EUR/l", 0.65, 816 * 0.8 / 1000)
    # Gegenprobe Lkw-Regler mit UBA-Kette (73 % / 31 %) statt R_BEV/R_H2/eta_sys
    print()
    print("Gegenprobe UBA-Kette, E_d=170 TWh:")
    print(f"  a) R_BEV=0,50, FCEV = BEV*73/31: Differenz {170*0.5*(73/31-1):.1f} TWh")
    print(f"  b) Diesel TtW 0,42: BEV {170*0.42/0.73:.1f}, FCEV {170*0.42/0.31:.1f}, Differenz {170*0.42*(1/0.31-1/0.73):.1f} TWh")
    print(f"  Modell mid Verhaeltnis FCEV/BEV: {(0.88/0.665)/0.5:.2f} gegen UBA {73/31:.2f}")
    # UBA TEXTE 169/2021 S. 70: 1,35 MWh H2 (AEL 67 %) + 0,92 MWh PtL-Strom + 0,26 t*0,7 MWh DAC
    tot = 1.35 / 0.67 + 0.92 + 0.26 * 0.7
    print(f"UBA 169/2021 implizit: {tot:.2f} MWh Strom je MWh Kraftstoff = eta {1/tot:.2f}")
    # Konsistenz PtL-Parameter: Elektrolysestrom je MWh Kraftstoff vs. Gesamtstrom 1/eta_ptl
    print()
    for c, p in CASES.items():
        el = p["hpe"] / p["el"]
        tot = 1 / p["ptl"]
        print(f"Konsistenz {c}: Elektrolysestrom {el:.3f} MWh/MWh, Gesamtstrom PtL {tot:.3f} MWh/MWh, "
              f"Rest fuer Synthese/DAC {tot - el:+.3f}")
