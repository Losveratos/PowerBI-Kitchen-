#!/usr/bin/env python3
"""Wertet firms-*.json aus rechner-population-100k.js aus.
Aufruf: python3 tools/rechner-population-analyse.py out.json firms-agg.json [firms-opus.json ...]
Die erste Datei ist der Hauptlauf; weitere Dateien gehen nur in den Robustheits-Vergleich ein."""
import json, sys, statistics as st
from collections import Counter, defaultdict

out, main, others = sys.argv[1], sys.argv[2], sys.argv[3:]
O = ["paid", "oss", "deneb", "core"]


def load(f):
    d = json.load(open(f, encoding="utf-8"))
    return d["meta"], d["N"], d["cols"]


def q(a, p):
    a = sorted(a)
    if not a:
        return None
    i = (len(a) - 1) * p
    lo, hi = int(i), min(len(a) - 1, int(i) + 1)
    return a[lo] + (a[hi] - a[lo]) * (i - lo)


def winners(meta, N, c):
    """Gewinner je Organisation: ohne K.O. (reine Kosten, Erwartungswert), mit K.O. (zulässig), Ziehung (realisiert)."""
    res = []
    for i in range(N):
        e, d, ko = c["exp"][i], c["draw"][i], c["ko"][i]
        al = [j for j in range(4) if not ko[j]]
        w_free = min(range(4), key=lambda j: e[j])
        w_ok = min(al, key=lambda j: e[j]) if al else -1
        w_draw = min(al, key=lambda j: d[j]) if al else -1
        res.append((w_free, w_ok, w_draw, al))
    return res


def share(cnt, n):
    return {k: round(v / n, 4) for k, v in cnt.items()}


meta, N, c = load(main)
SEG = meta["SEG"]
W = winners(meta, N, c)
R = {"N": N, "segments": SEG}

# 1 · Gewinner gesamt
free = Counter(O[w[0]] for w in W)
ok = Counter(O[w[1]] if w[1] >= 0 else "none" for w in W)
R["win_free"] = share(free, N)
R["win_ok"] = share(ok, N)

# 2 · Gewinner nach Segment und nach Größe (Viewer)
R["win_by_seg"] = {}
for s_i, s in enumerate(SEG):
    idx = [i for i in range(N) if c["seg"][i] == s_i]
    R["win_by_seg"][s] = {"n": len(idx),
                          "free": share(Counter(O[W[i][0]] for i in idx), len(idx)),
                          "ok": share(Counter(O[W[i][1]] if W[i][1] >= 0 else "none" for i in idx), len(idx))}
BINS = [(0, 25), (25, 100), (100, 300), (300, 1000), (1000, 3000), (3000, 10**9)]
R["win_by_viewers"] = []
for lo, hi in BINS:
    idx = [i for i in range(N) if lo <= c["viewers"][i] < hi]
    if not idx:
        continue
    R["win_by_viewers"].append({"lo": lo, "hi": hi, "n": len(idx),
                                "free": share(Counter(O[W[i][0]] for i in idx), len(idx)),
                                "ok": share(Counter(O[W[i][1]] if W[i][1] >= 0 else "none" for i in idx), len(idx))})
R["win_by_horizon"] = {}
for h in (3, 5, 10):
    idx = [i for i in range(N) if c["horizon"][i] == h]
    R["win_by_horizon"][h] = {"n": len(idx), "free": share(Counter(O[W[i][0]] for i in idx), len(idx))}

# 3 · K.O.: wie oft je Ansatz, welche Gründe
R["ko_rate"] = {o: round(sum(c["ko"][i][j] for i in range(N)) / N, 4) for j, o in enumerate(O)}
R["ko_reasons"] = {}
for j, o in enumerate(O):
    cnt = Counter()
    for i in range(N):
        for r in set(c["koIds"][i][j]):
            cnt[r] += 1
    R["ko_reasons"][o] = [[k, round(v / N, 4)] for k, v in cnt.most_common(6)]
R["none_feasible"] = round(sum(1 for w in W if w[1] < 0) / N, 4)
# Kippt die Rahmenbedingung den Gewinner?
# seit dem Review: Firmen ohne jeden zulässigen Weg zählen mit (vorher fehlten sie, 47 % statt 57,5 %)
flip = sum(1 for w in W if w[1] != w[0])
R["constraint_flip"] = round(flip / N, 4)
R["constraint_flip_feasible"] = round(sum(1 for w in W if w[1] >= 0 and w[1] != w[0]) / N, 4)
# Preis der Rahmenbedingung: Mehrkosten des zulässigen Besten gegen den freien Besten
pc = [c["exp"][i][W[i][1]] / c["exp"][i][W[i][0]] - 1 for i in range(N) if W[i][1] >= 0 and W[i][1] != W[i][0]]
R["constraint_price"] = {"p50": q(pc, .5), "p75": q(pc, .75), "p90": q(pc, .9)}

# 4 · Knappheit: wie weit liegen Platz 1 und 2 (zulässig, Erwartungswert) auseinander?
gaps = []
for i in range(N):
    al = W[i][3]
    if len(al) >= 2:
        s = sorted(c["exp"][i][j] for j in al)
        gaps.append(s[1] / s[0] - 1)
R["gap12"] = {"n": len(gaps), "lt5": round(sum(g < .05 for g in gaps) / len(gaps), 4),
              "lt10": round(sum(g < .10 for g in gaps) / len(gaps), 4), "lt25": round(sum(g < .25 for g in gaps) / len(gaps), 4),
              "p50": q(gaps, .5)}

# 5 · Unsicherheit: Empfehlung (Erwartungswert) gegen realisierte Welt (eine gepaarte Ziehung)
hit = [W[i][1] == W[i][2] for i in range(N) if W[i][1] >= 0]
hit2 = [W[i][1] == W[i][2] for i in range(N) if len(W[i][3]) >= 2]
reg = [c["draw"][i][W[i][1]] / c["draw"][i][W[i][2]] - 1 for i in range(N) if W[i][1] >= 0 and W[i][1] != W[i][2]]
R["hindsight"] = {"same": round(sum(hit) / len(hit), 4), "same_choice": round(sum(hit2) / len(hit2), 4), "n_choice": len(hit2), "regret_p50": q(reg, .5), "regret_p90": q(reg, .9)}

# 6 · Dogma: jede Organisation nimmt Ansatz X
R["dogma"] = {}
for j, o in enumerate(O):
    feas = [i for i in range(N) if W[i][1] >= 0 and not c["ko"][i][j]]
    ex = [c["exp"][i][j] / c["exp"][i][W[i][1]] - 1 for i in feas]
    exE = [(c["exp"][i][j] - c["exp"][i][W[i][1]]) / c["div"][i] for i in feas]
    tot_ex = sum(c["exp"][i][j] - c["exp"][i][W[i][1]] for i in feas)
    tot_best = sum(c["exp"][i][W[i][1]] for i in feas)
    R["dogma"][o] = {"feasible": round(len(feas) / N, 4), "best": round(sum(1 for i in feas if W[i][1] == j) / N, 4),
                     "within10": round(sum(1 for x in ex if x <= .10) / N, 4),
                     "excess_p50": q(ex, .5), "excess_p90": q(ex, .9), "excess_eur_viewer_p50": q(exE, .5),
                     "excess_total_pct": tot_ex / tot_best}

# 7 · Kostenstruktur je Ansatz (realisiert, Mittel der Anteile über alle Organisationen)
CATS = meta["CATS"]
R["cost_mix"], R["hard_share"], R["phase"], R["per_viewer"], R["exit_ratio"], R["fte"] = {}, {}, {}, {}, {}, {}
for j, o in enumerate(O):
    mix = defaultdict(float)
    hs, ph, pv, xr, ft = [], [0, 0, 0, 0], [], [], []
    for i in range(N):
        t = max(1, c["draw"][i][j])
        for k, v in zip(CATS, c["cats"][i][j]):
            mix[k] += v / t
        hs.append(c["hard"][i][j] / t)
        for k in range(4):
            ph[k] += c["phase"][i][j][k] / t
        pv.append(c["exp"][i][j] / c["div"][i])
        xr.append(c["exitCost"][i][j] / max(1, c["exp"][i][j]))
        ft.append(c["hoursInt"][i][j] / max(1, c["horizon"][i]) / 1500)
    R["cost_mix"][o] = {k: round(v / N, 4) for k, v in mix.items()}
    R["hard_share"][o] = round(st.mean(hs), 4)
    R["phase"][o] = [round(x / N, 4) for x in ph]
    R["per_viewer"][o] = {"p10": q(pv, .1), "p50": q(pv, .5), "p90": q(pv, .9)}
    R["exit_ratio"][o] = q(xr, .5)
    R["fte"][o] = {"p50": q(ft, .5), "p90": q(ft, .9)}

# 8 · Profil der Gewinner (zulässig)
R["winner_profile"] = {}
for j, o in enumerate(O):
    idx = [i for i in range(N) if W[i][1] == j]
    if not idx:
        continue
    R["winner_profile"][o] = {"n": len(idx), "viewers_p50": q([c["viewers"][i] for i in idx], .5),
                              "creators_p50": q([c["creators"][i] for i in idx], .5),
                              "h10": round(sum(c["horizon"][i] == 10 for i in idx) / len(idx), 3),
                              "seg": share(Counter(SEG[c["seg"][i]] for i in idx), len(idx))}

# 9 · Streudiagramm-Stichprobe (Viewer × Ersteller × Gewinner frei)
R["scatter"] = [[c["viewers"][i], c["creators"][i], W[i][0], W[i][1]] for i in range(0, N, 40)]

# 9b · Linse "nur harte Rahmenbedingungen": K.O. nur aus Governance-Schaltern, Must-Listen ignoriert
okF = []
for i in range(N):
    al = [j for j in range(4) if not any(r.startswith("flag:") for r in c["koIds"][i][j])]
    okF.append(min(al, key=lambda j: c["exp"][i][j]) if al else -1)
R["win_flags"] = share(Counter(O[w] if w >= 0 else "none" for w in okF), N)
R["win_neg"] = share(Counter(O[W[i][1]] if W[i][1] >= 0 else (O[okF[i]] if okF[i] >= 0 else "none") for i in range(N)), N)
R["negotiated"] = round(sum(1 for i in range(N) if W[i][1] < 0 and okF[i] >= 0) / N, 4)
R["ko_flags"] = {o: round(sum(1 for i in range(N) if any(r.startswith("flag:") for r in c["koIds"][i][j])) / N, 4) for j, o in enumerate(O)}

# 9c · Bestandseffekt: Gewinnquote (frei) je heutigem Ansatz
BL = ["none", "paid", "oss", "deneb", "core"]
R["win_by_baseline"] = {}
for b_i, b in enumerate(BL):
    idx = [i for i in range(N) if c["baseline"][i] == b_i]
    if idx:
        R["win_by_baseline"][b] = {"n": len(idx), "free": share(Counter(O[W[i][0]] for i in idx), len(idx))}
LA = ["inforiver", "enterprise", "zebra"]
R["win_by_lic"] = {}
for l_i, l in enumerate(LA):
    idx = [i for i in range(N) if c["licAnchor"][i] == l_i]
    R["win_by_lic"][l] = {"n": len(idx), "free": share(Counter(O[W[i][0]] for i in idx), len(idx))}

# 9d · Was entscheidet? Transinformation (bits) zwischen Merkmal und zulässigem Gewinner
import math
def mi(xs, ys):
    n = len(xs); cx, cy, cxy = Counter(xs), Counter(ys), Counter(zip(xs, ys))
    return sum(v / n * math.log2((v / n) / (cx[a] / n * cy[b] / n)) for (a, b), v in cxy.items())
Y = [w[1] for w in W]
def vbin(v):
    return next(k for k, (lo, hi) in enumerate(BINS) if lo <= v < hi)
feats = {"Größe (Viewer)": [vbin(v) for v in c["viewers"]], "Segment": c["seg"], "Horizont": c["horizon"],
         "Lizenz-Preisniveau": c["licAnchor"], "Heutiger Ansatz": c["baseline"], "Report-Klassen": c["rc"],
         "IBCS für alle Reports": c["ibcsAll"], "Verteilweg": c["dist"], "Vorlagenbibliothek": c["lib"],
         "OSS fertig/selbst gebaut": c["ossBuild"], "Site-Lizenz": c["site"],
         "Semantikmodelle": [min(m, 6) for m in c["models"]], "Ersteller": [min(4, int(math.log2(max(1, x)))) for x in c["creators"]]}
for j, f in enumerate(meta["FL"]):
    feats["Flag: " + f] = [(m >> j) & 1 for m in c["flags"]]
for j, m in enumerate(meta["MUST"]):
    feats["Must: " + m] = [(x >> j) & 1 for x in c["must"]]
H = -sum(v / N * math.log2(v / N) for v in Counter(Y).values())
R["mi"] = sorted([[k, round(mi(v, Y), 4)] for k, v in feats.items()], key=lambda x: -x[1])
R["mi_H"] = H
Yf = [w[0] for w in W]
R["mi_free"] = sorted([[k, round(mi(v, Yf), 4)] for k, v in feats.items() if not k.startswith(("Flag", "Must"))], key=lambda x: -x[1])

# 9e · v0.25: Zertifizierung als Option für Open Source (Spalte ossCert: 0 keine Option, 1 nicht genutzt, 2 genutzt)
if "ossCert" in c:
    oc = c["ossCert"]
    win_oss = [i for i in range(N) if W[i][1] == 1]
    R["cert"] = {"available": round(sum(1 for x in oc if x >= 1) / N, 4),
                 "used": round(sum(1 for x in oc if x == 2) / N, 4),
                 "oss_winners": len(win_oss),
                 "oss_winners_cert": round(sum(1 for i in win_oss if oc[i] == 2) / max(1, len(win_oss)), 4),
                 "by_build": {b: round(sum(1 for i in range(N) if c["ossBuild"][i] == k and oc[i] == 2) /
                                       max(1, sum(1 for i in range(N) if c["ossBuild"][i] == k)), 4)
                              for k, b in enumerate(["ready", "ki", "classic"])}}

# 10 · Robustheit über die Einzel-Schätzer
R["robust"] = {}
for f in others:
    m2, n2, c2 = load(f)
    W2 = winners(m2, n2, c2)
    R["robust"][f.split("firms-")[-1].replace(".json", "")] = {
        "free": share(Counter(O[w[0]] for w in W2), n2),
        "ok": share(Counter(O[w[1]] if w[1] >= 0 else "none" for w in W2), n2)}

json.dump(R, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("cert", R.get("cert"))
for k in ["win_free", "win_ok", "ko_rate", "none_feasible", "constraint_flip", "constraint_price", "gap12", "hindsight"]:
    print(k, R[k])
print("dogma", json.dumps(R["dogma"], indent=0))
print("ko_reasons", json.dumps(R["ko_reasons"]))
print("by_viewers", json.dumps([(b["lo"], b["n"], b["free"], b["ok"]) for b in R["win_by_viewers"]]))
print("by_seg", json.dumps({s: (v["n"], v["free"], v["ok"]) for s, v in R["win_by_seg"].items()}))
print("cost_mix", json.dumps(R["cost_mix"]))
print("hard", R["hard_share"], "phase", R["phase"])
print("per_viewer", R["per_viewer"], "exit", R["exit_ratio"], "fte", R["fte"])
print("profile", json.dumps(R["winner_profile"]))
print("robust", json.dumps(R["robust"]))
print("win_flags", R["win_flags"], R["ko_flags"])
print("baseline", json.dumps(R["win_by_baseline"]))
print("lic", json.dumps(R["win_by_lic"]))
print("mi H", H, R["mi"][:14])
print("mi_free", R["mi_free"][:8])
print("horizon", R["win_by_horizon"])
