#!/usr/bin/env python3
"""Baut den Report „10.000 Firmen: wann was gewinnt" als HTML (Website-Fassung und eigenständige Fassung).
Aufruf: python3 tools/rechner-10k-report.py [--oss oss-fte.json] [--ck ck-variante.json] <report10k.json> <cf-result.json> <personas-10k.json> <mc10k-*.json ...>
Schreibt visual-standards-10000-firmen.html (Repo) und downloads/visual-standards-10000-firmen-standalone.html."""
import json, sys
OSS = None
if "--oss" in sys.argv:
    i = sys.argv.index("--oss"); OSS = json.load(open(sys.argv[i + 1], encoding="utf-8")); del sys.argv[i:i + 2]
CK = None  # ChartKitchen + P&L byDatenWG als konkrete OSS-Variante (tools/rechner-ck-variante.py)
if "--ck" in sys.argv:
    i = sys.argv.index("--ck"); CK = json.load(open(sys.argv[i + 1], encoding="utf-8")); del sys.argv[i:i + 2]
from collections import Counter
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
rep = json.load(open(sys.argv[1], encoding="utf-8"))
cf = json.load(open(sys.argv[2], encoding="utf-8"))
P = {p["id"]: p for p in json.load(open(sys.argv[3], encoding="utf-8"))}
R = []
for f in sys.argv[4:]:
    R += json.load(open(f, encoding="utf-8"))["results"]
O = ["paid", "oss", "deneb", "core", "none"]
# KI als zusätzlicher Hebel: Mehrheitsgewinner ohne KI gegen KI überall (gepaart, alle 10.000)
maj = lambda r, m: max(range(5), key=lambda j: r["modes"][m]["win"][j])
U = sum(r["users"] for r in R)
flip = sum(maj(r, "base") != maj(r, "alle") for r in R) / len(R)
flipU = sum(r["users"] for r in R if maj(r, "base") != maj(r, "alle")) / U
trans = Counter((O[maj(r, "base")], O[maj(r, "alle")]) for r in R if maj(r, "base") != maj(r, "alle")).most_common(3)
dsh = [sum(r["modes"]["alle"]["win"][j] - r["modes"]["base"]["win"][j] for r in R) / len(R) for j in range(5)]
db = sorted(r["modes"]["alle"]["best"][1] - r["modes"]["base"]["best"][1] for r in R if r["modes"]["alle"]["best"][1] and r["modes"]["base"]["best"][1])
cf = {k: v for k, v in cf.items() if k != "site"}
cf["ki"] = {"label": "KI-Pflege: keine → mit dem Adoptionsgrad der Ebene (alle 10.000 Firmen)", "n": len(R), "flip": flip, "flipUsers": flipU,
            "trans": [[a, b, c / len(R)] for (a, b), c in trans], "dshare": dsh, "dbest": db[len(db) // 2]}
HARD = {"zertifizierung", "copilot", "paginated", "coreonly", "ibcscert", "nobudget", "exit", "rs", "certonly", "sla"}
for k in cf:
    cf[k]["kind"] = "hard" if k in HARD else "cost"
# MA-Verteilung
edges = [20, 50, 100, 250, 500, 1000, 2000, 5000, 10000, 50000, 10**9]
hist = []
for lo, hi in zip(edges[:-1], edges[1:]):
    hist.append({"lo": lo, "hi": hi, "n": sum(1 for p in P.values() if lo <= p["employees"] < hi or (lo == 20 and p["employees"] < 20))})
data = {"rep": rep, "cf": cf, "hist": hist, "U": U, "oss": OSS, "ck": CK}

src = (REPO / "no-free-lunch-visual-standards-post.html").read_text(encoding="utf-8")
css = src[src.index("<style>") + 7:src.index("</style>")]
css += """
.legend { display:flex; flex-wrap:wrap; gap:14px; font-size:13px; color:var(--ink-soft); margin:4px 0 10px; }
.legend i { display:inline-block; width:11px; height:11px; border-radius:3px; margin-right:6px; vertical-align:-1px; }
.brow { display:grid; grid-template-columns:118px 1fr 70px; gap:10px; align-items:center; margin:5px 0; font-size:13px; }
.brow .lab { color:var(--ink); font-variant-numeric:tabular-nums; } .brow .lab small { display:block; color:var(--ink-mute); font-size:11.5px; }
.brow .val { font-family:var(--mono); font-size:12px; text-align:right; color:var(--ink); }
.sbar { display:flex; height:20px; gap:2px; } .sbar span { display:flex; align-items:center; justify-content:center; height:100%; border-radius:3px; font-size:11px; font-weight:600; color:#1A1A1A; overflow:hidden; white-space:nowrap; }
.sbar .none { background:repeating-linear-gradient(45deg,#B4B2A2 0 3px,#E7E4DA 3px 6px); }
.hist { display:flex; align-items:flex-end; gap:6px; height:130px; margin:14px 0 4px; border-bottom:1px solid var(--line); }
.hist div { flex:1; background:var(--ink-soft); border-radius:3px 3px 0 0; position:relative; min-height:2px; }
.hist div span { position:absolute; top:-18px; left:0; right:0; text-align:center; font-family:var(--mono); font-size:11px; color:var(--ink); }
.hlab { display:flex; gap:6px; font-size:11px; color:var(--ink-mute); } .hlab span { flex:1; text-align:center; }
.lever { display:grid; grid-template-columns:minmax(0,1fr) 150px; gap:6px 16px; padding:12px 0; border-bottom:1px solid var(--line); }
.lever .t { font-size:14.5px; color:var(--ink); font-weight:600; } .lever .s { font-size:13px; color:var(--ink-soft); grid-column:1 / -1; }
.lever .fl { display:flex; align-items:center; gap:8px; } .lever .fl i { display:block; height:12px; border-radius:3px; background:var(--topic); } .lever .fl b { font-family:var(--mono); font-size:12.5px; white-space:nowrap; }
.dv { display:grid; grid-template-columns:repeat(5,1fr); gap:6px; grid-column:1 / -1; }
.dv div { font-size:11.5px; color:var(--ink-mute); } .dv .tr { position:relative; height:10px; background:#EEECE4; border-radius:2px; margin:3px 0; }
.dv .tr i { position:absolute; top:0; bottom:0; border-radius:2px; } .dv .tr:after { content:''; position:absolute; left:50%; top:-2px; bottom:-2px; width:1px; background:var(--ink-mute); }
.dv b { font-family:var(--mono); font-size:11.5px; color:var(--ink); font-weight:600; }
@media (max-width:640px){ .lever { grid-template-columns:1fr; } .brow { grid-template-columns:84px 1fr 52px; } .dv { grid-template-columns:repeat(3,1fr); } }
.rule { display:grid; grid-template-columns:28px 1fr; gap:10px; padding:10px 0; border-bottom:1px solid var(--line); font-size:14.5px; color:var(--ink-soft); }
.rule .n { font-family:var(--serif); font-style:italic; font-size:1.5rem; color:var(--topic); line-height:1; } .rule b { color:var(--ink); }
.tbl td.num { white-space:nowrap; }
"""
body = open(REPO / "tools" / "rechner-10k-report.body.html", encoding="utf-8").read()
js = open(REPO / "tools" / "rechner-10k-report.js", encoding="utf-8").read()
SITE = "https://datenwgknowledgekitchen.com/"


def page(standalone):
    b = body
    if standalone:
        import re
        b = re.sub(r'href="(?!https?:|#|mailto:)([^"]+)"', lambda m: f'href="{SITE}{m.group(1)}"', b)
    chrome = "" if standalone else '<script src="assets/js/site-chrome.js" data-chrome="full"></script>\n'
    return f"""<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>10.000 Firmen: Wann welcher Visual-Standard gewinnt · Daten-WG</title>
<meta name="description" content="10.000 Firmen mit realistischen Mitarbeiterzahlen durch den Visual-Standards-Rechner: wann Paid, Open Source, Deneb oder Core + SVG gewinnt, und welche Entscheidungen den Ausschlag geben (Kontrafaktum-Test mit 19 Hebeln, Rechner v0.25).">
<link rel="canonical" href="{SITE}visual-standards-10000-firmen.html">
<style>{css}</style>
</head>
<body>
{chrome}<div class="container">
{b}
</div>
<script>const DATA={json.dumps(data, ensure_ascii=False, default=dict)};</script>
<script>{js}</script>
</body>
</html>
"""


(REPO / "visual-standards-10000-firmen.html").write_text(page(False), encoding="utf-8")
(REPO / "downloads" / "visual-standards-10000-firmen-standalone.html").write_text(page(True), encoding="utf-8")
print("geschrieben: visual-standards-10000-firmen.html + downloads/visual-standards-10000-firmen-standalone.html")
