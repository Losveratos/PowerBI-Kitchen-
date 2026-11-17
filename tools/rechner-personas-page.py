#!/usr/bin/env python3
"""Baut persona-firmen-simulation.html (v2) aus Personas + Monte-Carlo-Ergebnis v2 (tools/rechner-personas-mc-v2.js).
Aufruf: python3 tools/rechner-personas-page.py <personas.json> <mc-v2.json> [review-log.md ...]
Die Seite bettet alle Daten ein (keine Nachlade-Requests) und übernimmt das CSS des No-free-lunch-Posts."""
import json, re, sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
pers = json.load(open(sys.argv[1], encoding="utf-8"))
mc = json.load(open(sys.argv[2], encoding="utf-8"))
reviews = [Path(x).read_text(encoding="utf-8") for x in sys.argv[3:]]
byid = {r["id"]: r for r in mc["results"]}
KEEP = ["id", "name", "industry", "city", "employees", "segment", "story", "decider", "why", "creators", "viewers", "reports",
        "types", "models", "growth", "ssShare", "horizon", "licAnchor", "siteLicense", "reportClasses", "ibcsAll", "baseline",
        "existing", "dist", "library", "ossBuild", "flags", "must", "author"]
r4 = lambda v: None if v is None else round(v, 4)
r0 = lambda v: None if v is None else round(v)
def rnd(v):
    if isinstance(v, float): return round(v, 3)
    if isinstance(v, list): return [rnd(x) for x in v]
    return v
rows = []
for p in pers:
    r = byid[p["id"]]
    d = {k: p.get(k) for k in KEEP}
    d["mc"] = {"users": round(r["users"]), "ko": [r4(x) for x in r["ko"]], "aiDelta": [r0(x) for x in r["aiDelta"]],
               "modes": {m: {"win": [r4(x) for x in v["win"]], "perV": [[r0(x) for x in t] for t in v["perV"]],
                             "best": [r0(x) for x in v["best"]], "ai": r0(v["ai"])} for m, v in r["modes"].items()},
               "drivers": [{k: rnd(v) for k, v in dd.items()} for dd in r["drivers"][:3]]}
    rows.append(d)
verdicts = []
for i, rv in enumerate(reviews):
    m = re.split(r"\n#+ [^\n]*(?:Gesamt|Urteil|Fazit)[^\n]*\n", rv)
    if len(m) > 1:
        verdicts.append({"t": "Urteil des Opus-Reviewers" + (f", Runde {i+1}" if len(reviews) > 1 else ""), "x": m[-1].strip()})
data = {"N": mc["N"], "rows": rows, "verdicts": verdicts, "ki": mc["ki"]}

src = (REPO / "no-free-lunch-visual-standards-post.html").read_text(encoding="utf-8")
css = src[src.index("<style>"):src.index("</style>")]
css += """
.filters { display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin:8px 0 14px; }
.filters .lbl { font-family:var(--mono); font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--ink-mute); margin-right:4px; }
.chip { font:inherit; font-size:13px; padding:5px 11px; border:1px solid var(--line); border-radius:100px; background:var(--bg-card); color:var(--ink-soft); cursor:pointer; }
.chip[aria-pressed="true"] { background:var(--black); color:#fff; border-color:var(--black); }
.chip:focus-visible, .prow:focus-visible { outline:2px solid var(--topic); outline-offset:2px; }
select.chip { padding-right:6px; }
.legend { display:flex; flex-wrap:wrap; gap:14px; font-size:13px; color:var(--ink-soft); margin:4px 0 10px; }
.legend i { display:inline-block; width:11px; height:11px; border-radius:3px; margin-right:6px; vertical-align:-1px; }
.pchart { border-top:1px solid var(--line); }
.seg-h { font-family:var(--mono); font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--ink-mute); padding:12px 0 4px; }
.prow { display:grid; grid-template-columns:minmax(0,230px) 1fr 46px 64px; gap:10px; align-items:center; padding:3px 4px; border-radius:6px; cursor:pointer; }
.prow:hover, .prow.sel { background:var(--bg-soft); }
.prow .nm { font-size:13px; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.prow .nm b { font-family:var(--mono); font-size:11px; color:var(--ink-mute); font-weight:600; margin-right:6px; }
.bar { display:flex; height:16px; gap:2px; }
.bar span { display:block; height:100%; border-radius:3px; min-width:0; }
.bar .none { background:repeating-linear-gradient(45deg,#B4B2A2 0 3px,#E7E4DA 3px 6px); }
.prow .cf { font-family:var(--mono); font-size:12px; text-align:right; color:var(--ink); }
.prow .cf.lo { color:var(--ink-mute); }
.prow .pv { font-family:var(--mono); font-size:11.5px; text-align:right; color:var(--ink-soft); }
@media (max-width:640px){ .prow { grid-template-columns:100px 1fr 38px 54px; } .prow .nm { font-size:12px; } .prow .pv { font-size:10.5px; } }
.ubar { display:flex; align-items:center; gap:8px; min-width:140px; } .ubar i { display:block; height:14px; border-radius:3px; } .ubar span { font-family:var(--mono); font-size:12px; white-space:nowrap; }
@media (max-width:640px){ .kpis { grid-template-columns:1fr; } }
.tbl td.num { white-space:nowrap; }
.detail { background:var(--bg-card); border:1px solid var(--line); border-radius:var(--radius-lg); padding:22px 24px; margin:22px 0 10px; box-shadow:var(--shadow-sm); }
.detail h3 { font-family:var(--serif); font-weight:500; font-size:1.45rem; color:var(--black); margin-bottom:2px; }
.detail .sub { font-size:13.5px; color:var(--ink-mute); margin-bottom:12px; }
.detail .story { font-size:15px; color:var(--ink-soft); margin-bottom:12px; }
.facts { display:flex; flex-wrap:wrap; gap:6px; margin:6px 0 14px; }
.facts span { font-size:12.5px; background:var(--bg-soft); border:1px solid var(--line); border-radius:100px; padding:2px 9px; color:var(--ink-soft); }
.facts span b { color:var(--ink); font-weight:600; }
.dgrid { display:grid; grid-template-columns:1fr 1fr; gap:18px 26px; }
@media (max-width:700px){ .dgrid { grid-template-columns:1fr; } }
.dgrid h4 { font-family:var(--mono); font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--ink-mute); margin-bottom:8px; font-weight:600; }
.orow { display:grid; grid-template-columns:96px 1fr 48px; gap:8px; align-items:center; font-size:13px; margin:5px 0; color:var(--ink); }
.orow .track { position:relative; height:12px; background:#EEECE4; border-radius:3px; }
.orow .track i { position:absolute; top:0; bottom:0; border-radius:3px; }
.orow .v { font-family:var(--mono); font-size:12px; text-align:right; }
.rng .track { background:transparent; border-bottom:1px solid var(--line); height:14px; }
.rng .track i { height:6px; top:4px; }
.rng .track b { position:absolute; top:0; width:2px; height:14px; background:var(--ink); }
.drv { font-size:13.5px; color:var(--ink-soft); margin:8px 0; line-height:1.45; }
.drv b { color:var(--ink); }
.drv .mini { display:flex; height:9px; gap:1px; margin:4px 0 2px; max-width:320px; }
.drv .mini span { height:100%; border-radius:2px; }
.note { font-size:13.5px; color:var(--ink-mute); }
.hbar { display:grid; grid-template-columns:minmax(0,260px) 1fr 34px; gap:10px; align-items:center; font-size:13.5px; margin:4px 0; }
.hbar .t { height:14px; border-radius:3px; background:var(--topic); }
.hbar .n { font-family:var(--mono); font-size:12px; text-align:right; }
details.tv summary { cursor:pointer; font-family:var(--mono); font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--accent); margin:16px 0 8px; }
.tbl.small { font-size:12.5px; } .tbl.small td, .tbl.small th { padding:6px 6px; }
"""

html = f"""<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>150 Persona-Firmen, KI-Pflege und Kosten je Viewer · Daten-WG</title>
<meta name="description" content="150 fiktive DACH-Organisationen (25 je Ebene), von Claude Opus und Sonnet geschrieben und geprüft, je 5.000-mal durch den Visual-Standards-Rechner simuliert, mit KI-gestützter Pflege im Konzern. Kosten je Viewer und Jahr, Gesamtrating gewichtet nach Nutzern.">
<link rel="canonical" href="https://datenwgknowledgekitchen.com/persona-firmen-simulation.html">
<meta property="og:type" content="article">
<meta property="og:title" content="150 Persona-Firmen: Wer gewinnt, wenn Konzerne mit KI pflegen?">
<meta property="og:image" content="https://datenwgknowledgekitchen.com/assets/posts/persona-firmen/persona-firmen.png">
{css}</style>
</head>
<body>
<script src="assets/js/site-chrome.js" data-chrome="full"></script>
<div class="container">
  <a class="back-link" href="no-free-lunch-visual-standards-post.html">← No free lunch</a>
  <header>
    <div class="post-eyebrow">Post · Visual-Standards-Rechner · Persona-Simulation v2</div>
    <h1 class="post-title">150 Firmen, <em>KI-Pflege</em> und was ein Viewer kostet</h1>
    <p class="post-dek">25 fiktive Firmen je Ebene, vom Kleinbetrieb bis zum Konzern, jede 5.000-mal durch den Rechner geschickt. Neu: Konzerne pflegen ihre Visuals mit KI-Assistenten und Coding-Agents, alle Kosten stehen je Viewer und Jahr, und das Gesamtrating zählt Nutzer statt Firmen.</p>
    <div class="post-meta">
      <span>Von <strong>Michael Tenner</strong></span>
      <span>Stand · <strong>November 2026</strong></span>
      <span>Werkzeug · <strong><a href="visual-standards-rechner.html">Visual-Standards-Rechner v0.23</a></strong></span>
      <span>Daten · <strong><a href="assets/posts/persona-firmen/personas.json">personas.json</a></strong></span>
    </div>
  </header>
  <div class="prose">
    <div class="filters f-mode"><span class="lbl">Szenario</span></div>
    <div class="kpis"><div class="kpi" id="k-rate"></div><div class="kpi" id="k-sure"></div><div class="kpi" id="k-coin"></div></div>

    <h2>Gesamtrating <em>nach Nutzern</em></h2>
    <p>Eine Firma mit 5.000 Nutzern zählt hier 250-mal so viel wie eine mit 20. Für jede Firma gilt: Wie oft ist der Weg in ihren Zukünften am günstigsten zulässigen? Das gewichten wir mit ihren Nutzern und summieren über alle 150.</p>
    <div id="rating"></div>

    <h2>Was ein Viewer <em>je Ebene</em> kostet</h2>
    <div id="levels"></div>

    <h2>Was <em>KI-Pflege</em> im Konzern ändert</h2>
    <p>Im Szenario „KI-Pflege im Konzern" nutzen die Ersteller der Konzerne KI-Assistenten und Coding-Agents, um Charts zu bauen, auszurollen und zu warten. Wie stark das die Stunden senkt, haben zwei Agents unabhängig geschätzt (Opus und Sonnet, mit Quellen von METR bis DORA), gerechnet wird mit dem Mittel. Die KI ist nicht gratis: Lizenzen und Tokens kosten, und KI-Code braucht mehr Review.</p>
    <div id="ai"></div>

    <h2>Die 150 Firmen <em>auf einen Blick</em></h2>
    <p>Jede Zeile ist eine Firma: der Balken zeigt, wie oft welcher Weg in ihren 5.000 Zukünften am günstigsten war, dann der Anteil des häufigsten Wegs (wie sicher?) und die Kosten des günstigsten Wegs je Viewer und Jahr. Klick öffnet die Firma.</p>
    <div class="filters f-mode"><span class="lbl">Szenario</span></div>
    <div class="filters" id="f-seg"><span class="lbl">Ebene</span></div>
    <div class="filters" id="f-more"><span class="lbl">Autor</span></div>
    <div class="legend" id="legend"></div>
    <div id="detail-top"></div>
    <div class="pchart" id="pchart" role="list"></div>

    <h2>Was die Antwort <em>wackeln lässt</em></h2>
    <div id="drvcount"></div>

    <h2>Opus- und Sonnet-Firmen <em>im Vergleich</em></h2>
    <div id="authors"></div>
    <div id="verdict"></div>

    <details class="tv"><summary>Alle 150 als Tabelle</summary><div class="tbl-wrap"><table class="tbl small" id="tbl"></table></div></details>

    <h2>So ist es <em>gemacht</em></h2>
    <div class="step"><div class="step-num">1</div><div><h3>150 Personas <span>25 je Ebene, Opus und Sonnet</span></h3><p>Sieben Agents haben die Firmen geschrieben, jeder für eine Ecke des Markts, ohne die Kostenlogik zu kennen: Konzerne, Banken und Versicherungen von Opus, Mittelstand, Kleine und öffentliche Hand überwiegend von Sonnet. Zwei Review-Runden durch Opus haben Widersprüche korrigiert (Leser größer als die Belegschaft, fehlender Vorsteuer-Schalter, Doppelungen). Die Ebene folgt der Größe: klein unter 250 Mitarbeitenden, Konzern über 10.000.</p></div></div>
    <div class="step"><div class="step-num">2</div><div><h3>KI-Effekt schätzen <span>Opus + Sonnet, unabhängig</span></h3><p>Multiplikatoren auf die Stunden je Weg (Erstbau, Rollout, Wartung, Fixes, Schulung, Governance), KI-Kosten je Ersteller und der Adoptionsgrad je Ebene. Gerechnet wird mit dem Mittel beider Schätzungen.</p></div></div>
    <div class="step"><div class="step-num">3</div><div><h3>Monte Carlo, gepaart <span>5.000 Zukünfte je Firma, drei Szenarien</span></h3><p>Je Ziehung schwanken Mengen, Wachstum, unsichere Schalter und Musts sowie alle Kostenannahmen des Rechners. Dieselbe Ziehung wird ohne KI, mit KI im Konzern und mit KI überall gerechnet, so dass Unterschiede nur aus der KI kommen. Realismus: Viewer wachsen höchstens bis zur Belegschaft (oder bis zum oberen Viewer-Wert, wenn externe Leser dazukommen).</p></div></div>

    <div class="src-box">
      <h3>Ehrlich eingeordnet</h3>
      <p style="margin-bottom:10px">Die Firmen sind <strong>erfunden</strong>, von Sprachmodellen geschrieben und geprüft. 25 je Ebene ist eine Setzung, kein Abbild des Markts: Im echten Markt gibt es viel mehr kleine Firmen als Konzerne. Das Gesamtrating nach Nutzern gleicht das teilweise aus, weil es Nutzer statt Firmen zählt, bleibt aber an diese Auswahl gebunden.</p>
      <p style="margin-bottom:10px">Für den KI-Effekt auf Power-BI-Report-Pflege gibt es <strong>keine direkte Messung</strong>. Die Studien reichen von −19 % (METR 2025, erfahrene Entwickler) bis +56 % (Greenfield-Aufgabe). Die Faktoren sind Schätzungen mit Bandbreite, und sie skalieren mit dem Adoptionsgrad.</p>
      <p style="margin:0">Kostenannahmen = Visual-Standards-Rechner v0.23. Gerankt wird nach Kosten unter den zulässigen Wegen, ohne Anforderungs-Score. Offenlegung: ChartKitchen byDatenWG ist unser eigenes Open-Source-Projekt und fällt in die Kategorie Open Source.</p>
    </div>

    <h2>Daten und <em>Skripte</em></h2>
    <ul>
      <li><a href="assets/posts/persona-firmen/personas.json">personas.json</a> (150 geprüfte Personas) · <a href="assets/posts/persona-firmen/mc-ergebnis.json">mc-ergebnis.json</a> · <a href="assets/posts/persona-firmen/ki-annahmen.json">ki-annahmen.json</a></li>
      <li>Aufträge, Rohfassungen, KI-Schätzungen und Review-Logs unter <code>sessions/visual-standards-personas-100/</code></li>
      <li><code>tools/rechner-personas-mc-v2.js</code> (Simulation im Browser-Rechenkern) · <code>tools/rechner-personas-page.py</code> (diese Seite)</li>
      <li>Weiter: <a href="visual-standards-10000-firmen.html">10.000 Firmen mit realen Mitarbeiterzahlen: wann was gewinnt und was die Entscheidung treibt</a></li>
    </ul>

    <div class="cta-card">
      <div class="cta-card-text"><span class="k">Selbst rechnen</span><h3>Eure Firma als 151.</h3><p>Im Rechner lässt sich die Frage für eure Eingaben stellen, inklusive Monte-Carlo-Seite.</p></div>
      <div class="cta-actions"><a class="cta-btn" href="visual-standards-rechner.html">Zum Rechner →</a><a class="cta-btn ghost" href="no-free-lunch-visual-standards-post.html">100.000 Firmen</a></div>
    </div>
    <div class="post-foot">Fragen, Feedback, eigene Zahlen: <strong>Michael Tenner</strong> · Daten-WG Knowledge Kitchen · <a href="impressum.html">Impressum</a></div>
  </div>
</div>
<script>
const DATA={json.dumps(data, ensure_ascii=False)};
</script>
<script src="assets/posts/persona-firmen/persona-firmen.js"></script>
</body>
</html>
"""
(REPO / "persona-firmen-simulation.html").write_text(html, encoding="utf-8")
print("geschrieben: persona-firmen-simulation.html", len(html))
