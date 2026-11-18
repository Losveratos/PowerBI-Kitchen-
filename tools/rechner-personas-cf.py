#!/usr/bin/env python3
"""Kontrafaktum-Varianten: je Hebel zwei Fassungen (A/B) derselben Stichprobe von Personas.
Aufruf: python3 tools/rechner-personas-cf.py <personas-10k.json> <outdir> [Stichprobe] [seed]
Für jeden Hebel entstehen <outdir>/cf-<hebel>-A.json und -B.json in identischer Reihenfolge, so dass die
Simulation (rechner-personas-mc-v3.js: gleicher Index = gleicher Zufallsstrom, fester Strom je Schalter/Must) gepaart
vergleicht. Dazu cf-placebo-A/B: zweimal dieselbe Fassung; B wird mit SEED_OFFSET gerechnet und misst den Rauschboden.
Der Hebel „Site-Lizenz“ ist seit dem Review entfallen (die Wahl Staffel/Site bildet der Test nicht ab).
A = Hebel "aus" bzw. kleiner Wert, B = Hebel "an" bzw. großer Wert. Alles andere bleibt die Persona."""
import json, os, random, sys, copy

src, outdir = sys.argv[1], sys.argv[2]
n = int(sys.argv[3]) if len(sys.argv) > 3 else 1000
rng = random.Random(int(sys.argv[4]) if len(sys.argv) > 4 else 7)
P = json.load(open(src, encoding="utf-8"))
S = rng.sample(P, n)
os.makedirs(outdir, exist_ok=True)


def setflag(p, f, v):
    p.setdefault("flags", {})
    if v: p["flags"][f] = 1
    else: p["flags"].pop(f, None)


def setmust(p, m, v):
    p.setdefault("must", {})
    if v: p["must"][m] = 1
    else: p["must"].pop(m, None)


def size(p, k):
    for f in ("viewers", "creators", "reports"):
        p[f] = [max(1, round(x * k)) for x in p[f]]
    p["employees"] = max(1, round(p["employees"] * k))


LEVERS = {
    "groesse": ("Größe: halb so groß → doppelt so groß (MA, Leser, Ersteller, Reports)", lambda p: size(p, .5), lambda p: size(p, 2)),
    "horizont": ("Horizont: 3 → 10 Jahre", lambda p: p.update(horizon=3), lambda p: p.update(horizon=10)),
    "lizenzpreis": ("Lizenzpreis Paid: 33 € → 170 € je Nutzer und Jahr", lambda p: p.update(licAnchor="inforiver"), lambda p: p.update(licAnchor="zebra")),
    "stunden": ("Stunden je Chart (Erstbau und Rollout, alle Wege): −30 % → +30 %", lambda p: p.update(pMul={"firstH": .7, "reuseH": .7}), lambda p: p.update(pMul={"firstH": 1.3, "reuseH": 1.3})),
    "wartung": ("Wartungsquote (alle Wege): −30 % → +30 %", lambda p: p.update(pMul={"maint": .7}), lambda p: p.update(pMul={"maint": 1.3})),
    "bestand": ("Bestand: grüne Wiese → heutiger Bestand bleibt", lambda p: p.update(baseline="none", existing=0), lambda p: None),
    "bibliothek": ("Vorlagenbibliothek für Deneb/Core: nein → ja", lambda p: p.update(library=False), lambda p: p.update(library=True)),
    "ossbau": ("Open Source: fertiges Visual → selbst bauen (KI-gestützt)", lambda p: p.update(ossBuild="ready"), lambda p: p.update(ossBuild="ki")),
    "ibcsall": ("IBCS für alle Reports: nein → ja", lambda p: p.update(ibcsAll=False), lambda p: p.update(ibcsAll=True)),
    "certonly": ("Tenant nur zertifizierte Visuals (ohne Org Store): nein → ja", lambda p: (setflag(p, "certonly", 0), setflag(p, "orgstore", 0)), lambda p: (setflag(p, "certonly", 1), setflag(p, "orgstore", 0))),
    "coreonly": ("Custom Visuals gesperrt: nein → ja", lambda p: setflag(p, "coreonly", 0), lambda p: setflag(p, "coreonly", 1)),
    "nobudget": ("Kein Lizenzbudget: nein → ja", lambda p: setflag(p, "nobudget", 0), lambda p: setflag(p, "nobudget", 1)),
    "rs": ("Report Server im Einsatz: nein → ja", lambda p: (setflag(p, "rs", 0), setmust(p, "rs", 0)), lambda p: setflag(p, "rs", 1)),
    "exit": ("Must kein Vendor-Lock-in: nein → ja", lambda p: setmust(p, "exit", 0), lambda p: setmust(p, "exit", 1)),
    "paginated": ("Must Berichtsheft in RDL: nein → ja", lambda p: setmust(p, "paginated", 0), lambda p: setmust(p, "paginated", 1)),
    "ibcscert": ("Must IBCS-zertifiziertes Visual: nein → ja", lambda p: setmust(p, "ibcscert", 0), lambda p: setmust(p, "ibcscert", 1)),
    "copilot": ("Must Copilot baut Reports: nein → ja", lambda p: setmust(p, "copilot", 0), lambda p: setmust(p, "copilot", 1)),
    "sla": ("Must Support mit SLA: nein → ja", lambda p: setmust(p, "sla", 0), lambda p: setmust(p, "sla", 1)),
}
LEVERS["placebo"] = ("Placebo: dieselbe Fassung, anderer Zufallsstrom (Rauschboden)", lambda p: None, lambda p: None)
meta = {}
for key, (label, fa, fb) in LEVERS.items():
    A, B = [], []
    for p in S:
        if key == "bestand" and p.get("baseline", "none") == "none":
            continue
        a, b = copy.deepcopy(p), copy.deepcopy(p)
        fa(a); fb(b)
        A.append(a); B.append(b)
    json.dump(A, open(f"{outdir}/cf-{key}-A.json", "w", encoding="utf-8"), ensure_ascii=False)
    json.dump(B, open(f"{outdir}/cf-{key}-B.json", "w", encoding="utf-8"), ensure_ascii=False)
    meta[key] = {"label": label, "n": len(A)}
json.dump(meta, open(f"{outdir}/cf-meta.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(json.dumps(meta, ensure_ascii=False))
