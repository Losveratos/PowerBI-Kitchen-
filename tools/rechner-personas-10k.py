#!/usr/bin/env python3
"""Erzeugt 10.000 realistische Persona-Firmen mit Mitarbeiterzahlen aus der realen Größenverteilung.

Aufruf: python3 tools/rechner-personas-10k.py <personas-150.json> <out.json> [N] [seed]

1. Sektor: 85 % Wirtschaft, 5 % Bank/Versicherung/Klinik, 10 % öffentliche Hand (Setzung).
2. Mitarbeiterzahl (Wirtschaft): Größenklassen nach Unternehmensregister (DE, gerundet) mal der
   Wahrscheinlichkeit, dass eine Firma dieser Größe Power BI nutzt UND in 12 Monaten einen Standard
   einführen will (Setzung, angelehnt an die Populations-Schätzung der 100.000er-Simulation).
     Klasse         Unternehmen  P(Power BI)  P(Standard | PBI)
     20–49          160.000      0,20         0,03
     50–249          75.000      0,30         0,05
     250–999         14.570      0,40         0,10
     1.000–2.999      2.095      0,50         0,15
     ab 3.000           635      0,60         0,20     (Pareto-Tail, alpha 1,33, aus 17.300 ab 250 und 635 ab 3.000)
   Bank/Versicherung/Klinik und öffentliche Hand: Mitarbeiterzahl einer Vorlage aus diesem Segment × Lognormal(0, 0,6).
3. Ebene nach MA: klein < 250, Mittelstand 250–1.999, gehoben 2.000–10.000, Konzern > 10.000.
4. Vorlage: eine der 150 geprüften Personas derselben Ebene (bzw. desselben Sektors), gewählt nach Nähe der
   Mitarbeiterzahl (Gewicht exp(−Δlog²/(2·0,7²))). Rahmenbedingungen, Musts, Bestand, Horizont, Lizenzniveau usw.
   kommen aus der Vorlage; Mengen werden auf die neue Mitarbeiterzahl skaliert:
   Viewer × r^0,85, Ersteller × r^0,6, Reports × r^0,6, Modelle × r^0,4, Bestandsreports × r^0,6, r = MA_neu / MA_Vorlage.
Quellen der Eckwerte: Destatis Unternehmensregister (≈ 17.300 Unternehmen ab 250 Beschäftigte),
IW Köln, Analysen 157 (635 Unternehmen mit mehr als 2.999 Beschäftigten, 2022)."""
import json, math, random, sys

src, out = sys.argv[1], sys.argv[2]
N = int(sys.argv[3]) if len(sys.argv) > 3 else 10000
rng = random.Random(int(sys.argv[4]) if len(sys.argv) > 4 else 20261117)
P = json.load(open(src, encoding="utf-8"))
pool = {}
for p in P:
    pool.setdefault(p["segment"], []).append(p)

BANDS = [(20, 49, 160000, .20, .03), (50, 249, 75000, .30, .05), (250, 999, 14570, .40, .10),
         (1000, 2999, 2095, .50, .15), (3000, None, 635, .60, .20)]
bw = [n * a * b for _, _, n, a, b in BANDS]
ALPHA = 1.33


def emp_wirtschaft():
    lo, hi, *_ = rng.choices(BANDS, weights=bw)[0]
    if hi is None:  # Pareto ab 3.000, gedeckelt bei 300.000
        while True:
            e = lo * (1 - rng.random()) ** (-1 / ALPHA)
            if e <= 300000:
                return round(e)
    return round(math.exp(rng.uniform(math.log(lo), math.log(hi + 1))))


def level(e):
    return "klein" if e < 250 else "mittelstand" if e < 2000 else "gehoben" if e <= 10000 else "konzern"


def pick(cands, e):
    w = [math.exp(-(math.log(e) - math.log(max(1, c["employees"]))) ** 2 / (2 * .7 ** 2)) for c in cands]
    return rng.choices(cands, weights=w)[0]


def scale(t, r, x, lo=1):
    v = sorted(max(lo, round(float(a) * r ** x)) for a in t)
    return v


res = []
for i in range(N):
    u = rng.random()
    if u < .85:
        sector, e = "wirtschaft", emp_wirtschaft()
        seg = level(e)
        t = pick(pool[seg], e)
    else:
        seg = "finanz" if u < .90 else "oeffentlich"
        sector = seg
        t0 = rng.choice(pool[seg])
        e = max(15, round(t0["employees"] * math.exp(rng.gauss(0, .6))))
        t = pick(pool[seg], e)
    r = e / max(1, t["employees"])
    p = json.loads(json.dumps(t))
    p["template"] = t["id"]
    p["id"] = f"R{i+1:05d}"
    p["name"] = f"{t['industry']} · {e:,} MA".replace(",", ".")
    p["employees"] = e
    p["segment"] = seg
    p["sector"] = sector
    p["level"] = level(e)
    p["viewers"] = scale(t["viewers"], r, .85)
    vmax = max(e, t["viewers"][2]) if t["viewers"][2] > t["employees"] else e
    p["viewers"] = sorted(min(v, vmax) for v in p["viewers"])
    p["creators"] = scale(t["creators"], r, .6)
    p["creators"] = sorted(min(c, max(1, p["viewers"][2])) for c in p["creators"])
    p["reports"] = scale(t["reports"], r, .6)
    p["models"] = scale(t.get("models") or [1, 1, 1], r, .4)
    if p.get("baseline", "none") != "none":
        p["existing"] = max(1, round((t.get("existing") or 0) * r ** .6))
    for k in ("story", "decider", "why"):
        p.pop(k, None)
    res.append(p)
json.dump(res, open(out, "w", encoding="utf-8"), ensure_ascii=False)
from collections import Counter
print("geschrieben:", out, len(res), Counter(p["level"] for p in res), Counter(p["sector"] for p in res))
