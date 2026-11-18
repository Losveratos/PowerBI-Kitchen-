#!/usr/bin/env python3
"""Wertet die ChartKitchen-Variante aus (10k gepaart gegen „heute“, 150 Personas) und schreibt ck-variante.json für den Report.
Aufruf: python3 tools/rechner-ck-auswertung.py <sim-dir> <personas-10k.json> <schaetzungs-dir> <out.json>
<sim-dir> enthält oss/heute-{k}.mc.json (Referenz), ck/ck_{heute,zert}-{k}.mc.json, p150/s{k}.mc.json und
ck150/ck_{heute,zert}-{k}.mc.json. <schaetzungs-dir> enthält 01-*.json, 02-*.json (Agents) und 03-zusammengefuehrt.json."""
import glob, json, os, subprocess, sys, tempfile
from pathlib import Path

sim, pers, est, out = sys.argv[1:5]
TOOLS = Path(__file__).resolve().parent
VAR = {"heute": f"{sim}/oss/heute", "ck_heute": f"{sim}/ck/ck_heute", "ck_zert": f"{sim}/ck/ck_zert"}
with tempfile.TemporaryDirectory() as d:
    for v, pre in VAR.items():
        for k in range(4):
            os.symlink(os.path.abspath(f"{pre}-{k}.mc.json"), f"{d}/{v}-{k}.mc.json")
    json.dump({v: {} for v in VAR}, open(f"{d}/annahmen.json", "w"))
    subprocess.run([sys.executable, str(TOOLS / "rechner-oss-fte-analyse.py"), d, pers, f"{d}/res.json"], check=True, stdout=subprocess.DEVNULL)
    res = json.load(open(f"{d}/res.json"))

# 150 Personas: Rating nach Nutzern, KI-Pflege im Konzern
def p150(files):
    R = []
    for f in files:
        R += json.load(open(f))["results"]
    U = sum(r["users"] for r in R)
    return {"users": [sum(r["users"] * r["modes"]["konzern"]["win"][j] for r in R) / U for j in range(5)],
            "firms": [sum(r["modes"]["konzern"]["win"][j] for r in R) / len(R) for j in range(5)],
            "ossKo": sum(r["ko"][1] for r in R) / len(R)}
res["p150"] = {"heute": p150(sorted(glob.glob(f"{sim}/p150/s[0-3].mc.json"))),
               "ck_heute": p150(sorted(glob.glob(f"{sim}/ck150/ck_heute-[0-3].mc.json"))),
               "ck_zert": p150(sorted(glob.glob(f"{sim}/ck150/ck_zert-[0-3].mc.json")))}
# Cluster-Bootstrap über die Vorlagen (wie im 10k-Report): Wie stabil ist Platz 1 nach Nutzern?
import random
PP = {p["id"]: p for p in json.load(open(pers, encoding="utf-8"))}
res["boot"] = {}
for v, pre in VAR.items():
    R = []
    for k in range(4):
        R += json.load(open(f"{pre}-{k}.mc.json"))["results"]
    T = {}
    for r in R:
        T.setdefault(PP[r["id"]]["template"], []).append(r)
    agg = {t: ([sum(r["users"] * r["modes"]["konzern"]["win"][j] for r in g) for j in range(5)], sum(r["users"] for r in g)) for t, g in T.items()}
    keys, rng, first, sh = list(T), random.Random(20261118), [0] * 4, []
    for _ in range(1000):
        smp = [rng.choice(keys) for _ in keys]; U = sum(agg[t][1] for t in smp)
        x = [sum(agg[t][0][j] for t in smp) / U for j in range(5)]; sh.append(x); first[max(range(4), key=lambda j: x[j])] += 1
    qq = lambda j, p: sorted(a[j] for a in sh)[int(p * (len(sh) - 1))]
    res["boot"][v] = {"p1": [c / len(sh) for c in first], "lo": [qq(j, .05) for j in range(5)], "hi": [qq(j, .95) for j in range(5)]}
print("boot", {v: [round(x, 3) for x in b["p1"]] for v, b in res["boot"].items()})
res["ann"] = json.load(open(f"{est}/03-zusammengefuehrt.json", encoding="utf-8"))
res["agents"] = []
for f in sorted(glob.glob(f"{est}/0[12]-*.json")):
    a = json.load(open(f, encoding="utf-8"))
    res["agents"].append({"estimator": a.get("estimator"), "pros": a.get("pros", []), "cons": a.get("cons", []),
                          "heute": a.get("ck_heute", {}).get("note"), "zert": a.get("ck_zert", {}).get("note"),
                          "unsicher": a.get("biggest_uncertainties", [])})
json.dump(res, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for v, x in res["variants"].items():
    print(v, "Firmen", [round(100 * a, 1) for a in x["firms"]], "Nutzer", [round(100 * a, 1) for a in x["users"]], "flip", round(100 * x["flip"], 1),
          "OSS-KO", round(100 * x["ossKo"], 1), "Zert", round(100 * x["certUse"], 1), "trans", x["trans"][:3])
    print("   Bänder", [(b["lo"], [round(100 * a) for a in b["firms"]]) for b in x["bands"]], "Sektor", {k: [round(100 * a) for a in v] for k, v in x["sector"].items()})
for v, x in res["p150"].items():
    print("150", v, [round(100 * a, 1) for a in x["users"]], "OSS-KO", round(100 * x["ossKo"], 1))
