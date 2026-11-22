"""P2-01 Gegenprüfung: Barwert-Plausibilität ZEW (Rausch 2026), Tabelle 1, S. 15.
Interpoliert die Stützjahre 2028/2033/2038/2043/2048 linear und diskontiert mit 1,5 % p. a.
auf 2028 (Annahme laut Tabellenfußnote). Ziel: Ist 824 Mrd. der Gesamteffekt
'Strong ETS2' gegenüber BAU oder ein Zusatzeffekt über 'Strong ETS2 with national measures'?"""
yrs = [2028, 2033, 2038, 2043, 2048]
rows = {"BAU (vs. keine Klimapolitik)": [93, 175, 279, 406, 590],
        "Strong ETS2 mit nat. Maßnahmen": [15, 14, 13, 13, 14],
        "Strong ETS2": [26, 39, 58, 82, 105]}
def pv(v, r=0.015):
    tot = 0.0
    for y in range(2028, 2049):
        i = min((y - 2028) // 5, 3)
        y0, y1 = yrs[i], yrs[i + 1]
        x = v[i] + (v[i + 1] - v[i]) * (y - y0) / (y1 - y0)
        tot += x / (1 + r) ** (y - 2028)
    return tot
res = {k: pv(v) for k, v in rows.items()}
for k, v in res.items():
    print(f"{k:35s} Barwert ≈ {v:7.0f} Mrd. EUR")
b = res["BAU (vs. keine Klimapolitik)"]
print("Tabelle: BAU 5257, mit nat. Maßn. 247 (4,7 %), Strong 824 (20,4 %)")
print(f"824/5257 = {824/5257:.1%};  (247+824)/5257 = {(247+824)/5257:.1%}")
print(f"Strong-Barwert/BAU-Barwert (eigene Interpolation) = {res['Strong ETS2']/b:.1%}")
