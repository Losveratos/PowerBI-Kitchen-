"""P2-01: zählt das Inventar in research/01_r21_behauptungen.md (Abschnitt 2) unabhängig nach.
Liest nur die Tabellenzeilen | Nr | Seite | Zitat | Typ | Quelle | Prüfweg | Teil |."""
import re, sys, collections
p = sys.argv[1]
rows = []
for line in open(p, encoding="utf-8"):
    m = re.match(r"^\| (\d+) \| ([^|]+)\| (.+?) \| ([ZKPFW]) \| (.+?) \| (.+?) \| (.+?) \|$", line.rstrip("\n"))
    if m:
        rows.append(dict(nr=int(m[1]), typ=m[4], quelle=m[5].strip()))
print("Zeilen:", len(rows), "Nr. 1..", max(r["nr"] for r in rows))
for name, sel in [("gesamt", rows), ("Haupttext 1-91", [r for r in rows if r["nr"] <= 91]),
                  ("Factsheets 92-170", [r for r in rows if r["nr"] >= 92])]:
    c = collections.Counter(r["typ"] for r in sel)
    print(name, len(sel), dict(sorted(c.items())))
def kat(q):
    ql = q.lower()
    if ql.startswith("keine") and "verweis" not in ql and "implizit" not in ql: return "keine"
    if "eigene rechnung" in ql or "eigene ableitung" in ql: return "eigene Rechnung"
    if "verweis" in ql or ql.startswith("factsheet"): return "Verweis"
    if "ohne fundstelle" in ql or "genannt" in ql: return "genannt"
    return "Literatur/sonst"
for name, sel in [("Haupttext Z", [r for r in rows if r["nr"] <= 91 and r["typ"] == "Z"]),
                  ("Factsheets Z", [r for r in rows if r["nr"] >= 92 and r["typ"] == "Z"])]:
    c = collections.Counter(kat(r["quelle"]) for r in sel)
    print(name, len(sel), dict(c))
    for r in sel:
        if kat(r["quelle"]) == "Literatur/sonst": print("   ", r["nr"], r["quelle"][:70])
