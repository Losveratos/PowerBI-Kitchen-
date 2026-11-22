#!/usr/bin/env python3
"""P2-07: Stresstest-Preisfaktoren und Kostenaufschlag nachrechnen, mit zwei
Bezugsbasen. Eingangswerte abgelesen aus ISE-Foliensatz S. 17 und ISE
Photovoltaics Report S. 51/52 (Diagramme, Ablesegenauigkeit ca. +-10 EUR/kWp)."""
markt = 8.7                      # ct/Wp, aktueller Modulmarktpreis (Folie 17)
msp = {'China': 15.9, 'SO-Asien': 16.5, 'EU skaliert': 25.5, 'EU unskaliert': 30.8}
for k, v in msp.items():
    print(f'Faktor {k:14s} {v/markt:.2f}')
anteil = 0.30                    # Modulanteil Großanlage, Mittel der Länder (S. 51)
de_capex = 758                   # EUR/kWp, Deutschland 2025 (S. 51/52)
de_modul_irena = 255             # EUR/kWp, Modulblock Deutschland 2025 (abgelesen)
print('Modulanteil DE laut IRENA:', round(de_modul_irena / de_capex, 3))
print('Modulanteil DE beim Marktpreis 8,7 ct/Wp:', round(10 * markt / de_capex, 3))
for f in (1.25, 1.9, 2.9):
    dossier = anteil * (f - 1)
    konsistent = 10 * markt * (f - 1) / de_capex
    print(f'F={f}: Dossier +{100*dossier:.1f} %  | konsistent (8,7 ct/Wp in 758 EUR/kWp) +{100*konsistent:.1f} %')
# Gegenprobe: IRENA-Modulblock DE als Basis gegen EU-skalierten MSP
print('EU skaliert gegen IRENA-Modulblock DE:', round(10 * 25.5 / de_modul_irena, 2), 'x')
# Bestand gegen Fluss
pv_twh_per_gwp = 87 / ((108 + 108 - 16.6) / 2)
j1 = 16.6 * pv_twh_per_gwp
print('TWh/GWp', round(pv_twh_per_gwp, 3), 'Jahr1', round(j1, 1), 'Jahr2', round(2 * j1, 1),
      'Faktor', round(767 / (2 * j1), 1), round(767 / j1, 1), '| Jahr1 mit Halbjahreseffekt', round(j1 / 2, 1))
print('Gas netto AGEB 2024 692,5 TWh Hi; Faktoren', round(692.5 / (2 * j1), 1), round(692.5 / j1, 1))
