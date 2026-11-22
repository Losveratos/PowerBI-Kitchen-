#!/usr/bin/env python3
"""P2-02 Gegenprüfung: BIP-Anteile und Jahreswerte des Dossiers 02 unabhängig nachrechnen.

Eigener Code, übernimmt kein Skript des Dossiers. Eingaben:
- Eurostat nama_10_gdp (Rohdatei aus Phase 1, nur gelesen):
  energiewende/quellen/raw/P1-02/eurostat_nama_10_gdp_de.json
- Studienwerte: von Hand aus den Primärdokumenten übertragen (Fundstellen im
  Prüfbericht research/pruefung/02_pruefung.md).

Aufruf: python3 -I energiewende/scripts/pruefung/p2_02_bip_anteile.py
"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
GDP_FILE = ROOT / "quellen/raw/P1-02/eurostat_nama_10_gdp_de.json"


def gdp_by_year():
    d = json.loads(GDP_FILE.read_text(encoding="utf-8"))
    idx = d["dimension"]["time"]["category"]["index"]
    return {int(t): d["value"][str(i)] / 1000.0 for t, i in idx.items()}  # Mrd. EUR


GDP = gdp_by_year()
B24 = GDP[2024]

# (Bezeichnung, Summe in Mrd. EUR oder None, Jahre oder None, Jahreswert(e) in Mrd. EUR oder None,
#  Wert im Dossier in % BIP 2024 (min, max))
ROWS = [
    ("PwC WWB 13,3 Bio / 26 J. (2025-2050)", 13300, 26, None, (11.7, 11.7)),
    ("PwC WWB 13,3 Bio / 21 J. (bis 2045 lt. WD)", 13300, 21, None, None),
    ("PwC beschleunigt 13,2 Bio / 26 J.", 13200, 26, None, (11.6, 11.6)),
    ("Agora 540 Mrd/a", None, None, (540, 540), (12.3, 12.3)),
    ("ISE 2024 8,6 Bio / 21 J.", 8600, 21, None, (9.3, 9.3)),
    ("KfW/Prognos 2026 270-300 Mrd/a", None, None, (270, 300), (6.2, 7.0)),
    ("KfW 2021 191 Mrd/a", None, None, (191, 191), (4.4, 4.4)),
    ("DIHK 4,8-5,4 Bio / 25 J.", (4800, 5400), 25, None, (4.4, 4.9)),
    ("DIHK ohne Importe 2,8-3,1 Bio / 25 J.", (4800 - 2000, 5400 - 2300), 25, None, (2.6, 2.8)),
    ("Aurora 3,44 Bio / 21 J.", 3440, 21, None, (3.7, 3.7)),
    ("Aurora 3,44 Bio / 20 J. (Fragesteller 21/903)", 3440, 20, None, None),
    ("Ariadne Inv. 116-131 Mrd/a", None, None, (116, 131), (2.6, 3.0)),
    ("Agora Klimaschutzinv. 147 Mrd/a", None, None, (147, 147), (3.4, 3.4)),
    ("KfW 2026 netto 130-150 Mrd/a (Focus)", None, None, (130, 150), (3.0, 3.4)),
    ("KfW 2026 netto 135-153 Mrd/a (Studie)", None, None, (135, 153), None),
    ("KfW 2026 Zuwachs 65 Mrd/a", None, None, (65, 65), (1.5, 1.5)),
    ("KfW 2021 Mehrinv. 72 Mrd/a", None, None, (72, 72), (1.7, 1.7)),
    ("BCG Klimapfade 860 Mrd / 10 J.", 860, 10, None, (2.0, 2.0)),
    ("ISE 2021 1,0-3,3 Bio / 26 J.", (1000, 3300), 26, None, (0.9, 2.9)),
    ("Pittel/Henning 0,5-3 Bio / 32 J. (2019-2050)", (500, 3000), 32, None, (0.4, 2.1)),
    ("ISE 2024 54 (28-85) Mrd/a", None, None, (28, 85), (0.6, 1.9)),
    ("Ariadne Mehrkosten 16-26 Mrd/a", None, None, (16, 26), (0.4, 0.6)),
]


def as_range(x):
    return (x, x) if not isinstance(x, tuple) else x


def main():
    print(f"BIP 2024 nominal (Eurostat): {B24:.2f} Mrd. EUR; BIP 2018: {GDP[2018]:.2f}; BIP 2020: {GDP[2020]:.2f}; BIP 2025: {GDP[2025]:.2f}")
    print()
    print(f"{'Zeile':48s} {'Mrd/a':>13s} {'% BIP24 neu':>13s} {'Dossier':>11s} {'Abw. (Pp)':>10s}")
    for name, total, years, annual, dossier in ROWS:
        if annual is None:
            lo, hi = as_range(total)
            annual = (lo / years, hi / years)
        lo_p, hi_p = (100 * annual[0] / B24, 100 * annual[1] / B24)
        if dossier:
            dev = max(abs(round(lo_p, 1) - dossier[0]), abs(round(hi_p, 1) - dossier[1]))
            dstr = f"{dossier[0]:.1f}-{dossier[1]:.1f}"
            devs = f"{dev:.1f}"
        else:
            dstr, devs = "-", "-"
        print(f"{name:48s} {annual[0]:6.0f}-{annual[1]:6.0f} {lo_p:6.2f}-{hi_p:6.2f} {dstr:>11s} {devs:>10s}")

    print()
    # Prüfungen einzelner Eigenrechnungen
    print("Agora Ohnehin-Anteil 393/540 =", round(100 * 393 / 540, 1), "%")
    print("Agora 147*21 =", 147 * 21, "Mrd. EUR (Dossier ~3,1 Bio)")
    print("KfW 2026 netto 130-150 * 21 =", 130 * 21, "-", 150 * 21, "Mrd. (Dossier 2,7-3,2 Bio)")
    print("KfW 2026 Zuwachs 65*21 =", 65 * 21, "Mrd. (Dossier ~1,4 Bio)")
    print("Ariadne Inv. 116-131 *21 =", 116 * 21, "-", 131 * 21, "Mrd. (Dossier 2,4-2,8 Bio)")
    print("Ariadne Mehrkosten 16-26 *21 =", 16 * 21, "-", 26 * 21, "Mrd. (Dossier 0,34-0,55 Bio)")
    print("ISE 2024 54*21 =", 54 * 21, "; 28*21 =", 28 * 21, "; 85*21 =", 85 * 21, "(Dossier ~1,1; 0,6-1,8)")
    print("ISE 2024 54*25 (Studie: 'nächste 25 Jahre') =", 54 * 25)
    print("ISE 2024 Prüfsumme Effizienz: (54-28)*21 =", (54 - 28) * 21, "Mrd. (Studie: 550 Mrd. bis 2045)")
    print("ISE 2024 Brutto aus Jahreswerten (210+110)*21 .. (270+130)*21 =", 320 * 21, "-", 400 * 21, "Mrd. (Studie: ~8.600)")
    print("Aurora 3440/20 =", 3440 / 20, "; 3440/21 =", round(3440 / 21, 1))
    print("ISE 2021 Referenz 2500/26 Jahre in % BIP 2020 Eurostat =", round(100 * 2500 / 26 / GDP[2020], 2),
          "; mit ISE-BIP 3806 =", round(100 * 2500 / 26 / 3806, 2))
    print("Pittel/Henning in % BIP 2018 (32 J.):", round(100 * 500 / 32 / GDP[2018], 2), "-", round(100 * 3000 / 32 / GDP[2018], 2))
    print("R21 10 / 13,8 Bio in BIP-Jahren:", round(10000 / B24, 2), round(13800 / B24, 2),
          "; pro Jahr über 20 J.:", round(100 * 10000 / 20 / B24, 1), "-", round(100 * 13800 / 20 / B24, 1), "% BIP")
    print("DIHK Plan B 530/4800, 910/5400, 530/5400, 910/4800 =",
          [round(100 * a / b, 1) for a, b in ((530, 4800), (910, 5400), (530, 5400), (910, 4800))])
    print("Ariadne NFhoch 52 gegen 16 / 26 / 15,5:", [round(100 * (52 / x - 1)) for x in (16, 26, 15.5)], "% mehr")
    print("ISE 2021 Inakzeptanz 3300/2500, 3200/2500, Beharrung 2900/2500:",
          [round(100 * (a / 2500 - 1)) for a in (3300, 3200, 2900)], "% mehr")
    print("ISE 2024 Beharrung/Robust 70-85 gegen 54:", [round(100 * (a / 54 - 1)) for a in (70, 85)], "% mehr")
    print("Netze ÜN+VN: BET/EWI 440+235 =", 440 + 235, "; 440+352 (LFS-VN) =", 440 + 352,
          "; ef.Ruhr 301+431 =", 301 + 431, "; BRH (BNetzA) 313,7+150 =", round(313.7 + 150, 1),
          "; NEP 2025 364..392 + 235 =", 364 + 235, "-", 392 + 235)


if __name__ == "__main__":
    main()
