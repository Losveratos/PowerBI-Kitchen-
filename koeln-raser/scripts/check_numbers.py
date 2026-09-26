#!/usr/bin/env python3
"""Gleicht die fest im Text stehenden Zahlen der Story gegen data/story_data.json ab.

Die Seite rechnet ihre Grafiken aus DATA, der Fließtext nennt Zahlen aber ausgeschrieben.
Dieses Skript prüft, dass jede dieser Zahlen noch zu den Daten passt, z. B. nach einem
neuen Datenstand oder einer geänderten Bereinigung.

    python3 koeln-raser/scripts/check_numbers.py      # Exit-Code 1 bei Abweichung
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
D = json.loads((ROOT / "data" / "story_data.json").read_text(encoding="utf-8"))
TPL = (ROOT / "story_template.html").read_text(encoding="utf-8")


def de(v, d=0):
    """Deutsche Zahl: Tausenderpunkt, Dezimalkomma."""
    return f"{v:,.{d}f}".replace(",", "X").replace(".", ",").replace("X", ".")


M, S, H = D["meta"], {(s["d"], s["c"]): s for s in D["standorte"]}, D["stunde_s01"]
NT, IO, B55, FV = D["nacht_tag"], D["innerorts_p31"], D["b55a"], D["fahrverbot"]
K = D.get("karte", {})
n = M["tempofaelle"]
wt = D["wochentag"]["S-01"]
kal_s01 = max(D["kalender"], key=lambda c: c[1])
L = D["lernkurven"]["0015"]
per = lambda ws, k: sum(w[k] for w in L["wochen"] if w["w"] in ws) / sum(w["tage"] for w in L["wochen"] if w["w"] in ws)
ctl = lambda ws: sum(w["n"] for w in L["kontrolle"] if w["w"] in ws) / sum(w["tage"] for w in L["kontrolle"] if w["w"] in ws)
W01, W1219 = [0, 1], range(12, 20)
neu = {a["c"]: a for a in D["neue_anlagen"]}
klein = [a["delta"] for a in D["neue_anlagen"] if a["delta"] is not None and a["c"] not in ("0015", "0005")]
her = {k: v for k, v in D["herkunft"].items()}
share = lambda g, k: 100 * her[g][k] / sum(her[g].values())
hist = D["hist_ueber"]
tp = lambda s: next(t for t in K["stadtteile"] if t["name"] == s)

CHECKS = [
    # Kopf, Prolog
    ("Tempofälle", de(n)), ("Zeilen", de(M["zeilen_gesamt"])), ("pro Tag", de(M["pro_tag"])),
    ("Sekunden pro Fall", f"Alle {de(round(M['sekunden_pro_fall']))} Sekunden"),
    ("Messstellen", f"{M['messstellen']} Messstellen"), ("Kürzel", f"<b>{M['kennz_bezirke']}</b> Kennzeichen-Kürzel"),
    # Akt 1
    ("feste Anlagen Fälle", de(M["je_dienststelle"]["S-01"])), ("mobile Fälle", de(M["je_dienststelle"]["S-02"])),
    ("Wochenende vs. Montag", f"{de(round(100 * ((wt[5] + wt[6]) / 2 / wt[0] - 1)))} % öfter"),
    ("hellster Tag", f"mit {de(kal_s01[1])} Fällen"), ("Tage ohne mobile Messung", f"{365 - M['mobil_tage']} Tagen"),
    # Akt 2
    ("11 Uhr", de(H[11]["n"])), ("3 Uhr", de(H[3]["n"])),
    ("≥21 um 14 Uhr", f"{de(H[14]['p21'], 1)} %"), ("≥21 um 3 Uhr", f"{de(H[3]['p21'], 1)} %"),
    ("≥31 um 14 Uhr", f"{de(H[14]['p31'], 2)} %"), ("≥31 um 3 Uhr", f"{de(H[3]['p31'], 1)} %"),
    ("innerorts 14 Uhr", f"{de(IO['14']['p'], 2)} %"), ("innerorts 3 Uhr", f"{de(IO['3']['p'], 2)} %"),
    ("absolut 3 vs 14", f"{round(H[3]['n'] * H[3]['p21'] / 100)} gegen {round(H[14]['n'] * H[14]['p21'] / 100)} Fälle"),
    ("Nacht/Tag ≥21", f"{de(NT['p21']['faktor_je_anlage'], 1)}-mal"), ("Nacht/Tag ≥31", f"{de(NT['p31']['faktor_je_anlage'], 1)}-mal"),
    # Akt 3
    ("B 55a Fälle", de(S[("S-01", "0015")]["n"])), ("Innere Kanalstraße Fälle", de(S[("S-01", "0005")]["n"])),
    ("A 4 pro Tag", f"{de(round(S[('S-01', '0096')]['pt']))}</span> Fällen am Tag"),
    ("B 55a pro Tag", f"{de(round(S[('S-01', '0015')]['pt']))}</span>"),
    ("Katalogwert", f"rund <span class=\"big am\">{de(round(D['bussgeld']['summe_eur'] / 1e6))} Mio. €"),
    ("je Fall", f"{de(round(D['bussgeld']['summe_eur'] / n))} €</span> pro Fall"),
    ("B 55a als innerorts", f"≈ {de(D['bussgeld']['b55a_als_innerorts_eur'] / 1e6, 1)} Mio. €"),
    # Akt 4 · Karte
    ("Anlagen ≤ 3 km Dom", f"{K['fakten']['s01_um_dom']['anlagen']}</span> Anlagen"),
    ("Anteil ≤ 3 km Dom", f"{de(K['fakten']['s01_um_dom']['anteil'], 1)} %"),
    ("Stadtteile mit mobil", f"{K['fakten']['stadtteile_mit_mobil']}</span> von 86"),
    ("mobile mit Punkt", f"{K['fakten']['S-02']['mit_punkt']}</span> der 600"),
    ("mobile ohne Punkt", f"bei {600 - K['fakten']['S-02']['mit_punkt']} reicht"),
    ("11 Uhr je Stunde", f"rund <span class=\"big\">{round(sum(K['fakten']['stunde_mix'][11]) / 365)}</span>-mal"),
    ("3 Uhr je Stunde", f"nur noch <span class=\"big\">{round(sum(K['fakten']['stunde_mix'][3]) / 365)}</span>"),
    ("3 Uhr Anteil fest", f"{round(100 * K['fakten']['stunde_mix'][3][0] / sum(K['fakten']['stunde_mix'][3]))} %</span>)"),
    ("Köln mobil ≥21", f"<span class=\"big\">{de(K['fakten']['mobil_p21'], 1)} %</span>"),
    ("Merkenich eine Stelle", f"{tp('Merkenich')['top']['anteil']} % der schweren Fälle"),
    ("Merkenich Limit", f"Tempo-{tp('Merkenich')['top']['lim']}-Strecke"),
    ("Eil eine Stelle", f"In Eil stammen {tp('Eil')['top']['anteil']} %"),
    # Akt 5
    ("B 55a Woche 0–1", f"{round(per(W01, 'n'))}-mal am Tag"), ("B 55a Woche 12–19", f"noch <span class=\"big am\">{round(per(W1219, 'n'))}</span>"),
    ("B 55a Rückgang", f"−{round(100 * (1 - per(W1219, 'n') / per(W01, 'n')))} %"),
    ("Kontrollanlagen", f"{L['kontrolle_anlagen']} Anlagen, die das ganze Jahr"),
    ("Kontrolle", f"(−{round(100 * (1 - ctl(W1219) / ctl(W01)))} %)"),
    ("B 55a ≥21 vorher/nachher", f"von {de(B55['p21_anfang'], 1)} % auf {de(B55['p21_ende'], 1)} %"),
    ("K", f"von {round(per(W01, 'k'))} auf {round(per(W1219, 'k'))} Fälle"), ("andere", f"von {round(per(W01, 'a'))} auf {round(per(W1219, 'a'))} ("),
    ("K Rückgang", f"−{round(100 * (1 - per(W1219, 'k') / per(W01, 'k')))} %"), ("andere Rückgang", f"−{round(100 * (1 - per(W1219, 'a') / per(W01, 'a')))} %"),
    ("Innere Kanalstraße", f"−{-neu['0005']['delta']} %"),
    ("kleinere neue Anlagen", f"zwischen −{-min(klein)} % und +{max(klein)} %"),
    # Akt 6
    ("Köln-Anteil alle", f"{de(share('alle', 'Köln'), 1)} %"), ("Köln-Anteil mobil", f"{de(share('S-02', 'Köln'), 1)} %"),
    ("Köln-Anteil fest", f"{de(share('S-01', 'Köln'), 1)} %"), ("übriges D fest", f"{de(share('S-01', 'Übriges Deutschland'), 1)} %"),
    # Akt 7
    ("genau 6", f"{de(100 * FV['genau6'] / n, 1)} % aller Fälle"), ("6 bis 10", f"{round(100 * sum(hist[6:11]) / n)} %</span> aller Fälle"),
    ("≤ 20", f"{de(100 * FV['bis20'] / n, 1)} %"), ("Punkte-Fälle", de(FV["punkte_ab21"])),
    ("Fahrverbot", de(FV["innerorts_ab31"] + FV["ausserorts_ab41"])), ("Fahrverbot obere Grenze", de(FV["alle_ab31"])),
    ("über 70", f"{hist[71]} Fälle"),
    # Fazit
    ("97 %", f"{round(100 * FV['bis20'] / n)} % der Fälle"),
    ("mobil tagsüber", f"zu {round(100 - M['mobil_nacht_anteil'])} % tagsüber"), ("mobil werktags", f"zu {round(100 - M['mobil_wochenende_anteil'])} % werktags"),
]


def main():
    bad = [(name, want) for name, want in CHECKS if want not in TPL]
    for name, want in bad:
        print(f"✗ {name}: „{want}“ steht nicht (mehr) im Text")
    print(f"{'✓' if not bad else '✗'} {len(CHECKS) - len(bad)} von {len(CHECKS)} Textzahlen passen zu story_data.json")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
