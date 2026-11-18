#!/usr/bin/env python3
"""Auswertung der 10.000-Personas-Simulation: wer gewinnt wann, und was die Entscheidung treibt.
Aufruf: python3 tools/rechner-personas-10k-analyse.py <personas-10k.json> <out.json> <mc-shard.json> [...]
Hauptszenario: "konzern" (KI-Pflege im Konzern). Ergebnis-Variable je Firma: der Weg, der in den meisten
ihrer Zukünfte am günstigsten zulässigen ist (Mehrheit), dazu die Gewinner-Anteile."""
import json, math, sys
from collections import Counter, defaultdict
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

P = {p["id"]: p for p in json.load(open(sys.argv[1], encoding="utf-8"))}
out = sys.argv[2]
R = []
for f in sys.argv[3:]:
    R += json.load(open(f, encoding="utf-8"))["results"]
O = ["paid", "oss", "deneb", "core", "none"]
ON = {"paid": "Paid", "oss": "Open Source", "deneb": "Deneb", "core": "Core + SVG", "none": "kein Weg"}
MODES = ["base", "konzern", "alle"]
M = "konzern"
n = len(R)
res = {"N": n, "draws": None}


def med(a):
    a = sorted(x for x in a if x is not None)
    return a[len(a) // 2] if a else None


def wavg(rows, mode, j, w=None):
    ws = [w(r) if w else 1 for r in rows]
    return sum(wi * r["modes"][mode]["win"][j] for wi, r in zip(ws, rows)) / max(1e-9, sum(ws))


users = lambda r: r["users"]
# 1 · gesamt
res["total"] = {m: {"firms": [wavg(R, m, j) for j in range(5)], "users": [wavg(R, m, j, users) for j in range(5)]} for m in MODES}
res["usersTotal"] = sum(r["users"] for r in R)
res["coverage"] = {"level": Counter(P[r["id"]]["level"] for r in R), "sector": Counter(P[r["id"]]["sector"] for r in R)}
# 2 · nach Größe
BANDS = [(0, 49), (50, 99), (100, 249), (250, 499), (500, 999), (1000, 1999), (2000, 4999), (5000, 9999), (10000, 49999), (50000, 10**9)]
res["bands"] = []
for lo, hi in BANDS:
    g = [r for r in R if lo <= P[r["id"]]["employees"] <= hi]
    if not g:
        continue
    res["bands"].append({"lo": lo, "hi": hi, "n": len(g), "users": sum(r["users"] for r in g),
                         "firms": [wavg(g, M, j) for j in range(5)], "usersW": [wavg(g, M, j, users) for j in range(5)],
                         "base": [wavg(g, "base", j) for j in range(5)],
                         "perV": [med([r["modes"][M]["perV"][j][1] for r in g]) for j in range(4)],
                         "best": med([r["modes"][M]["best"][1] for r in g]),
                         "viewers": med([P[r["id"]]["viewers"][1] for r in g])})
# 3 · nach Sektor / Ebene
for key in ("sector", "level"):
    res["by_" + key] = {}
    for v in sorted(set(P[r["id"]][key] for r in R)):
        g = [r for r in R if P[r["id"]][key] == v]
        res["by_" + key][v] = {"n": len(g), "users": sum(r["users"] for r in g), "firms": [wavg(g, M, j) for j in range(5)],
                               "usersW": [wavg(g, M, j, users) for j in range(5)], "best": med([r["modes"][M]["best"][1] for r in g]),
                               "perV": [med([r["modes"][M]["perV"][j][1] for r in g]) for j in range(4)]}
# 4 · KI-Effekt
K = [r for r in R if P[r["id"]]["level"] == "konzern"]
res["ai"] = {"konzern_n": len(K), "delta_konzern": [med([r["aiDelta"][j] for r in K]) for j in range(4)],
             "delta_all": [med([r["aiDelta"][j] for r in R]) for j in range(4)],
             "shift_konzern_users": {m: [wavg(K, m, j, users) for j in range(5)] for m in ("base", "konzern")},
             "shift_all_users": {m: [wavg(R, m, j, users) for j in range(5)] for m in ("base", "alle")}}
# 5 · Merkmale
FLAGS = ["certonly", "orgstore", "coreonly", "ibcsmust", "nobudget", "rs", "embed", "novat", "budgetnext", "euonly", "noext", "revision"]
MUSTS = sorted({k for p in P.values() for k in (p.get("must") or {})})
FN = {"logMA": "Mitarbeitende (log)", "viewers": "Leser", "creators": "Ersteller", "horizon": "Horizont (Jahre)", "lic": "Lizenzpreis-Niveau (€)",
      "site": "Site-Lizenz verhandelbar", "ibcsAll": "IBCS für alle Reports", "mgmt": "Management-lastige Reports", "ssShare": "Self-Service-Anteil",
      "models": "Semantikmodelle", "library": "Vorlagenbibliothek vorhanden", "existing": "Bestandsreports", "ossDev": "OSS müsste selbst gebaut werden"}
for b in ["paid", "oss", "deneb", "core"]:
    FN["bl_" + b] = "heute im Einsatz: " + ON[b]
for d in ["app", "org", "file"]:
    FN["dist_" + d] = {"app": "Verteilweg AppSource", "org": "Verteilweg Org Store", "file": "Verteilweg Datei-Import"}[d]
FLN = {"certonly": "nur zertifizierte Visuals", "orgstore": "Freigabe über Org Store", "coreonly": "Custom Visuals gesperrt", "ibcsmust": "IBCS-Zertifikat Pflicht",
       "nobudget": "kein Lizenzbudget", "rs": "Report Server", "embed": "Embedded / Publish-to-web", "novat": "kein voller Vorsteuerabzug",
       "budgetnext": "Budget erst im Folgejahr", "euonly": "Vergaberecht / EU-Standort", "noext": "keine Externen", "revision": "Revision will Logik sehen"}
MUN = {"ibcscert": "IBCS-zertifiziertes Visual", "mscert": "Microsoft-zertifiziert", "export": "PDF/PPT-Export", "exportdata": "Datenexport", "interact": "Interaktivität",
       "drill": "Drilldown", "writeback": "Writeback", "maint": "Fachbereich ändert ohne Code", "copilot": "Copilot baut Reports", "agentic": "KI-Agenten bauen Reports",
       "a11y": "Barrierefreiheit", "pin": "Versionshoheit", "alm": "Git / Pipeline", "themeable": "zentral per Theme", "mobile": "Mobile", "copyppt": "Kopie nach PowerPoint",
       "paginated": "Berichtsheft in RDL", "exit": "kein Vendor-Lock-in", "design": "Design ohne Disziplin", "rs": "läuft im Report Server", "scale": "konsistente Skalierung",
       "version": "Code-Review", "sla": "Support mit SLA", "datares": "Daten bleiben im Tenant", "bus": "Wissen bei mehr als einer Person"}
for f in FLAGS:
    FN["f_" + f] = "Rahmen: " + FLN[f]
for m in MUSTS:
    FN["m_" + m] = "Must: " + MUN.get(m, m)
LIC = {"inforiver": 33, "enterprise": 80, "zebra": 170}


def feats(p):
    x = {"logMA": math.log10(p["employees"]), "viewers": math.log10(max(1, p["viewers"][1])), "creators": p["creators"][1], "horizon": p["horizon"],
         "lic": LIC.get(p["licAnchor"], 80), "site": int(bool(p.get("siteLicense"))), "ibcsAll": int(bool(p.get("ibcsAll"))),
         "mgmt": int(p.get("reportClasses") == "mgmt"), "ssShare": p.get("ssShare", 0), "models": (p.get("models") or [1, 1, 1])[1],
         "library": int(bool(p.get("library"))), "existing": p.get("existing", 0), "ossDev": int(p.get("ossBuild") != "ready")}
    for b in ["paid", "oss", "deneb", "core"]:
        x["bl_" + b] = int(p.get("baseline") == b)
    for d in ["app", "org", "file"]:
        x["dist_" + d] = int(p.get("dist") == d)
    for f in FLAGS:
        x["f_" + f] = float((p.get("flags") or {}).get(f, 0))
    for m in MUSTS:
        x["m_" + m] = float((p.get("must") or {}).get(m, 0))
    return x


cols = list(feats(next(iter(P.values()))).keys())
X = np.array([[feats(P[r["id"]])[c] for c in cols] for r in R])
y = np.array([int(np.argmax(r["modes"][M]["win"])) for r in R])
w = np.array([r["users"] for r in R])
res["majority"] = {"firms": Counter(O[v] for v in y), "users": {O[k]: float(w[y == k].sum() / w.sum()) for k in range(5)}}
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=.25, random_state=1, stratify=y)
rf = RandomForestClassifier(n_estimators=300, min_samples_leaf=5, random_state=1, n_jobs=-1).fit(Xtr, ytr)
res["rf_acc"] = float(rf.score(Xte, yte))
res["baseline_acc"] = float(max(Counter(yte).values()) / len(yte))
pi = permutation_importance(rf, Xte, yte, n_repeats=8, random_state=1, n_jobs=-1)
imp = sorted([(cols[i], float(pi.importances_mean[i]), float(pi.importances_std[i])) for i in range(len(cols))], key=lambda t: -t[1])
res["importance"] = [{"id": c, "name": FN.get(c, c), "drop": d, "sd": s} for c, d, s in imp[:18]]
# Richtung je Top-Merkmal: Gewinner-Mehrheit bei niedrigem vs. hohem Wert
res["direction"] = []
for c, d, s in imp[:12]:
    i = cols.index(c)
    v = X[:, i]
    if len(set(v)) <= 2 or c.startswith(("f_", "m_")):
        lo, hi = v <= (0 if not c.startswith(("f_", "m_")) else .49), v >= (1 if not c.startswith(("f_", "m_")) else .5)
        labels = ("nein / unter 50 %", "ja / ab 50 %")
    else:
        q1, q3 = np.quantile(v, [1 / 3, 2 / 3])
        lo, hi = v <= q1, v >= q3
        fmt = (lambda t: f"{10**t:,.0f}".replace(",", ".")) if c in ("logMA", "viewers") else (lambda t: f"{t:g}")
        labels = (f"bis {fmt(q1)}", f"ab {fmt(q3)}")
    dist = lambda mask: [float((y[mask] == k).mean()) if mask.sum() else 0 for k in range(5)]
    res["direction"].append({"id": c, "name": FN.get(c, c), "lo": labels[0], "hi": labels[1], "nlo": int(lo.sum()), "nhi": int(hi.sum()), "dlo": dist(lo), "dhi": dist(hi)})
# 6 · Entscheidungsbaum (lesbare Regeln)
dt = DecisionTreeClassifier(max_depth=4, min_samples_leaf=150, random_state=1).fit(X, y)
res["tree_acc"] = float(dt.score(X, y))
T = dt.tree_


def node(i):
    if T.children_left[i] == -1:
        v = T.value[i][0]
        v = v / v.sum()
        full = [0.0] * 5
        for k, cls in enumerate(dt.classes_):
            full[int(cls)] = float(v[k])
        return {"leaf": True, "n": int(T.n_node_samples[i]), "dist": full, "win": O[int(np.argmax(full))]}
    c = cols[T.feature[i]]
    th = float(T.threshold[i])
    if c in ("logMA", "viewers"):
        tt = f"{10**th:,.0f}".replace(",", ".")
    elif c.startswith(("f_", "m_")):
        tt = f"{round(th*100)} %"
    else:
        tt = f"{th:g}"
    return {"leaf": False, "feat": c, "name": FN.get(c, c), "th": tt, "n": int(T.n_node_samples[i]),
            "le": node(T.children_left[i]), "gt": node(T.children_right[i])}


res["tree"] = node(0)
# 6b · Seit dem Review: Cluster-Bootstrap über die Vorlagen (die Firmen sind skalierte Varianten von Vorlagen),
#      Mehrheits-Definition neben dem Mittel der Gewinner-Anteile, Konzentration, Null-Option, Verhandlung
import random as _rnd
byT = defaultdict(list)
for r in R:
    byT[P[r["id"]]["template"]].append(r)
TK = list(byT.keys())
_rg = _rnd.Random(20261118)
bs = {"users": [], "firms": [], "p1u": [0] * 4, "p1f": [0] * 4}
for _ in range(1000):
    smp = [r for t in (_rg.choice(TK) for _ in TK) for r in byT[t]]
    uu = sum(r["users"] for r in smp)
    su = [sum(r["users"] * r["modes"][M]["win"][j] for r in smp) / uu for j in range(5)]
    sf = [sum(r["modes"][M]["win"][j] for r in smp) / len(smp) for j in range(5)]
    bs["users"].append(su); bs["firms"].append(sf)
    bs["p1u"][max(range(4), key=lambda j: su[j])] += 1; bs["p1f"][max(range(4), key=lambda j: sf[j])] += 1
qq = lambda L, j, pp: sorted(x[j] for x in L)[int(pp * (len(L) - 1))]
res["boot"] = {"users": {"lo": [qq(bs["users"], j, .05) for j in range(5)], "hi": [qq(bs["users"], j, .95) for j in range(5)], "p1": [c / 1000 for c in bs["p1u"]]},
               "firms": {"lo": [qq(bs["firms"], j, .05) for j in range(5)], "hi": [qq(bs["firms"], j, .95) for j in range(5)], "p1": [c / 1000 for c in bs["p1f"]]}}
uT = Counter()
for r in R:
    uT[P[r["id"]]["template"]] += r["users"]
cT = Counter(P[r["id"]]["template"] for r in R)
res["templatesEff"] = {"firms": 1 / sum((v / n) ** 2 for v in cT.values()), "users": 1 / sum((v / res["usersTotal"]) ** 2 for v in uT.values()),
                       "topUser": [[k, v / res["usersTotal"]] for k, v in uT.most_common(3)],
                       "usersGtEmp": sum(1 for r in R if P[r["id"]]["creators"][1] + P[r["id"]]["viewers"][1] > P[r["id"]]["employees"]) / n}
majv = [max(range(5), key=lambda j: r["modes"][M]["win"][j]) for r in R]
res["majorityShares"] = {"firms": [sum(1 for v in majv if v == j) / n for j in range(5)],
                         "users": [sum(r["users"] for r, v in zip(R, majv) if v == j) / res["usersTotal"] for j in range(5)]}
res["negotiation"] = {"strictNone": sum(r.get("strictNone", 0) for r in R) / n, "none": sum(r.get("none", 0) for r in R) / n}
for b in res["bands"]:
    g = [r for r in R if b["lo"] <= P[r["id"]]["employees"] <= b["hi"]]
    b["sq"] = med([r["modes"][M].get("sq") for r in g]); b["beatSQ"] = med([r["modes"][M].get("beatSQ") for r in g])
    b["bestHard"] = med([r["modes"][M].get("bestHard") for r in g])
res["regret"] = {"notBest": med([r["modes"][M].get("notBest") for r in R]), "ifWrong": med([r["modes"][M].get("regretIfWrong") for r in R])}

# 7 · Sicherheit
conf = [max(r["modes"][M]["win"]) for r in R]
res["conf"] = {"sure": sum(c >= .8 for c in conf) / n, "coin": sum(c < .5 for c in conf) / n, "median": float(np.median(conf))}
res["templates"] = len(set(P[r["id"]]["template"] for r in R))
# v0.25: Zertifizierung als Option für Open Source (Anteil der Zukünfte, in denen OSS zertifiziert gerechnet wird / damit gewinnt)
if "certUse" in R[0]["modes"][M]:
    res["cert"] = {"use": sum(r["modes"][M]["certUse"] for r in R) / n, "win": sum(r["modes"][M]["certWin"] for r in R) / n,
                   "winUsers": sum(r["users"] * r["modes"][M]["certWin"] for r in R) / res["usersTotal"],
                   "ossWinUsers": res["total"][M]["users"][1]}
    print("cert", res["cert"])
json.dump(res, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1, default=lambda o: dict(o) if isinstance(o, Counter) else str(o))
print("Gesamt Nutzer", {m: [round(100 * x, 1) for x in res["total"][m]["users"]] for m in MODES})
print("Gesamt Firmen", {m: [round(100 * x, 1) for x in res["total"][m]["firms"]] for m in MODES})
print("RF acc", round(res["rf_acc"], 3), "vs", round(res["baseline_acc"], 3), "Baum", round(res["tree_acc"], 3))
print("Top", [(t["name"], round(t["drop"], 3)) for t in res["importance"][:12]])
for b in res["bands"]:
    print(b["lo"], b["n"], [round(100 * x) for x in b["firms"]], "best €/V", b["best"])
print("KI", res["ai"]["delta_konzern"], {m: [round(100 * x, 1) for x in v] for m, v in res["ai"]["shift_konzern_users"].items()})
print("conf", res["conf"])
print("boot", {k: [round(x, 3) for x in v["p1"]] for k, v in res["boot"].items()}, "users lo/hi", [(round(a, 3), round(b, 3)) for a, b in zip(res["boot"]["users"]["lo"], res["boot"]["users"]["hi"])])
print("templatesEff", res["templatesEff"]); print("majority", {k: [round(100 * x, 1) for x in v] for k, v in res["majorityShares"].items()}); print("neg", res["negotiation"], "regret", res["regret"])
