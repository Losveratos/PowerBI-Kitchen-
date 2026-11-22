#!/usr/bin/env python3
"""P1-08: Regler-Rechnung Lkw-Anteil H2 (h) und Importanteil (m) -> deutscher Strombedarf, Elektrolyse-GW.
Alle Parameter siehe energiewende/research/08_wasserstoff_efuels_lkw.md (Abschnitt 7). 'low'=geringer Bedarf, 'high'=hoher Bedarf."""
import json

P = {  # low, mid, high  (Setzung (M) oder Quelle laut Dossier)
    "E_d":      (130, 170, 185),     # TWh Diesel-Energie Lkw>3,5 t (2023: 169,7 TREMOD); Zukunftswerte Setzung
    "R_BEV":    (0.40, 0.50, 0.58),  # TWh Netzstrom je TWh ersetzter Diesel-Energie
    "R_H2":     (0.73, 0.88, 1.00),  # TWh H2 je TWh Diesel-Energie (Brennstoffzellen-Lkw)
    "eta_el":   (0.75, 0.70, 0.64),  # Elektrolyse-Systemwirkungsgrad (LHV)
    "eta_dist": (1.00, 0.95, 0.90),  # Verdichtung/Verteilung/Speicherung bis Verbraucher
    "D_H2":     (100, 150, 250),     # TWh H2 Industrie/Stahl/Chemie ohne Rueckverstromung, ohne E-Fuel-Vorprodukt
    "D_EF":     (100, 150, 195),     # TWh E-Kraftstoff (Flug+Schiff) Endenergie
    "eta_ptl":  (0.57, 0.45, 0.37),  # Strom -> Kraftstoff gate-to-gate (UBA/LBST 2022 Tab. 3)
    "H2_per_EF": (1.35, 1.35, 1.35), # TWh H2 je TWh E-Kraftstoff (UBA TEXTE 169/2021)
    "VLS":      (5500, 4000, 3000),  # Volllaststunden Elektrolyse
}

def run(case, h, m_h2, m_ef):
    i = {"low": 0, "mid": 1, "high": 2}[case]
    g = {k: v[i] for k, v in P.items()}
    eta_sys = g["eta_el"] * g["eta_dist"]
    lkw_bev = (1 - h) * g["E_d"] * g["R_BEV"]
    h2_dem = g["D_H2"] + h * g["E_d"] * g["R_H2"]
    h2_strom_total = h2_dem / eta_sys                      # Strom, wenn alles im Inland
    h2_strom_de = (1 - m_h2) * h2_strom_total
    ef_strom_total = g["D_EF"] / g["eta_ptl"]
    ef_strom_de = (1 - m_ef) * ef_strom_total
    ef_elektrolyse_total = g["H2_per_EF"] * g["D_EF"] / g["eta_el"]
    p_gw = ((1 - m_h2) * h2_strom_total + (1 - m_ef) * ef_elektrolyse_total) / g["VLS"] * 1000
    de = lkw_bev + h2_strom_de + ef_strom_de
    ausland = m_h2 * h2_strom_total + m_ef * ef_strom_total
    return dict(Lkw_BEV=lkw_bev, H2_Strom_DE=h2_strom_de, EF_Strom_DE=ef_strom_de,
                Strom_DE=de, Strom_Ausland=ausland, Elektrolyse_GW=p_gw)

if __name__ == "__main__":
    out = {}
    for case in ("low", "mid", "high"):
        rows = []
        for h in (0, .5, 1):
            for m in (0, .5, 1):
                r = run(case, h, m, m)
                r.update(h=h, m=m)
                rows.append({k: round(v, 1) if isinstance(v, float) else v for k, v in r.items()})
        out[case] = rows
    print(json.dumps(out, indent=1))
