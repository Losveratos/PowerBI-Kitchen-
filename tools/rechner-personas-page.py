#!/usr/bin/env python3
"""Baut persona-firmen-simulation.html aus Personas + Monte-Carlo-Ergebnis.
Aufruf: python3 tools/rechner-personas-page.py <personas.json> <mc.json> [review-log.md]
Die Seite bettet alle Daten ein (keine Nachlade-Requests) und übernimmt das CSS des No-free-lunch-Posts."""
import json, re, sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
pers = json.load(open(sys.argv[1], encoding="utf-8"))
mc = json.load(open(sys.argv[2], encoding="utf-8"))
review = Path(sys.argv[3]).read_text(encoding="utf-8") if len(sys.argv) > 3 else ""
byid = {r["id"]: r for r in mc["results"]}
KEEP = ["id", "name", "industry", "city", "employees", "segment", "story", "decider", "why", "creators", "viewers", "reports",
        "types", "models", "growth", "ssShare", "horizon", "licAnchor", "siteLicense", "reportClasses", "ibcsAll", "baseline",
        "existing", "dist", "library", "ossBuild", "flags", "must", "author"]
rows = []
for p in pers:
    r = byid[p["id"]]
    d = {k: p.get(k) for k in KEEP}
    d["mc"] = {"win": [round(x, 4) for x in r["win"]], "winFree": [round(x, 4) for x in r["winFree"]], "ko": [round(x, 4) for x in r["ko"]],
               "perV": [[round(c["p10"]), round(c["p50"]), round(c["p90"])] for c in r["perV"]],
               "rec": r["rec"]["win"], "recKo": r["rec"]["ko"], "gap50": r["gap50"], "close10": r["close10"],
               "drivers": [{k: (round(v, 3) if isinstance(v, float) else ([round(x, 3) for x in v] if isinstance(v, list) else v)) for k, v in dd.items()} for dd in r["drivers"][:3]]}
    rows.append(d)
# Review-Gesamturteil (Absätze nach der letzten Überschrift) für die Seite
verdict = ""
if review:
    m = re.split(r"\n#+ [^\n]*(Gesamt|Urteil|Fazit)[^\n]*\n", review)
    verdict = m[-1].strip() if len(m) > 1 else ""
data = {"N": mc["N"], "rows": rows, "verdict": verdict}

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
.prow { display:grid; grid-template-columns:minmax(0,230px) 1fr 52px; gap:10px; align-items:center; padding:3px 4px; border-radius:6px; cursor:pointer; }
.prow:hover, .prow.sel { background:var(--bg-soft); }
.prow .nm { font-size:13px; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.prow .nm b { font-family:var(--mono); font-size:11px; color:var(--ink-mute); font-weight:600; margin-right:6px; }
.bar { display:flex; height:16px; gap:2px; }
.bar span { display:block; height:100%; border-radius:3px; min-width:0; }
.bar .none { background:repeating-linear-gradient(45deg,#B4B2A2 0 3px,#E7E4DA 3px 6px); }
.prow .cf { font-family:var(--mono); font-size:12px; text-align:right; color:var(--ink); }
.prow .cf.lo { color:var(--ink-mute); }
@media (max-width:640px){ .prow { grid-template-columns:110px 1fr 40px; } .prow .nm { font-size:12px; } }
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
<title>100 Persona-Firmen, 5.000 Zukünfte · Visual-Standards · Daten-WG</title>
<meta name="description" content="100 fiktive DACH-Organisationen, geschrieben von Claude Opus und Claude Sonnet, je 5.000-mal durch den Visual-Standards-Rechner simuliert: Wie sicher ist die Antwort Paid, Open Source, Deneb oder Core + SVG, und was lässt sie kippen?">
<link rel="canonical" href="https://datenwgknowledgekitchen.com/persona-firmen-simulation.html">
<meta property="og:type" content="article">
<meta property="og:title" content="100 Persona-Firmen, 5.000 Zukünfte je Firma">
<meta property="og:image" content="https://datenwgknowledgekitchen.com/assets/posts/persona-firmen/persona-firmen.png">
{css}</style>
</head>
<body>
<script src="assets/js/site-chrome.js" data-chrome="full"></script>
<div class="container">
  <a class="back-link" href="no-free-lunch-visual-standards-post.html">← No free lunch</a>
  <header>
    <div class="post-eyebrow">Post · Visual-Standards-Rechner · Persona-Simulation</div>
    <h1 class="post-title">100 Firmen, <em>5.000 Zukünfte</em> je Firma</h1>
    <p class="post-dek">Nach den 100.000 anonymen Firmen jetzt 100 mit Namen, Geschichte und offenen Fragen. Jede wird 5.000-mal durch den Rechner geschickt, mit schwankenden Mengen, unsicheren Rahmenbedingungen und allen Kostenannahmen in ihrer Bandbreite. Die Frage ist nicht mehr nur „welcher Weg?", sondern „wie sicher?".</p>
    <div class="post-meta">
      <span>Von <strong>Michael Tenner</strong></span>
      <span>Stand · <strong>November 2026</strong></span>
      <span>Werkzeug · <strong><a href="visual-standards-rechner.html">Visual-Standards-Rechner v0.23</a></strong></span>
      <span>Daten · <strong><a href="assets/posts/persona-firmen/personas.json">personas.json</a></strong></span>
    </div>
  </header>
  <div class="prose">
    <div class="kpis" id="kpis"></div>

    <h2>So ist es <em>gemacht</em></h2>
    <div class="step"><div class="step-num">1</div><div><h3>100 Personas schreiben <span>2× Opus, 2× Sonnet</span></h3><p>Vier Agents haben je 25 fiktive Organisationen beschrieben: Konzerne und gehobener Mittelstand (Opus), Banken, Kliniken und öffentliche Hand (Opus), Mittelstand (Sonnet), Kleine und Sonderfälle (Sonnet). Jede mit Story, Entscheider, Mengen als Spanne und Rahmenbedingungen als Wahrscheinlichkeit: 1 steht fest, 0,5 wird diskutiert. Keiner kannte die Kostenlogik des Rechners.</p></div></div>
    <div class="step"><div class="step-num">2</div><div><h3>Review <span>Opus als Berater</span></h3><p>Ein weiterer Opus-Agent hat alle 100 auf Realismus und Widersprüche geprüft (Leser zu Mitarbeitenden, Report Server ohne passendes Must, Site-Lizenz bei 15 Lesern) und minimal korrigiert, ohne auf ein Ergebnis hin zu ändern.</p></div></div>
    <div class="step"><div class="step-num">3</div><div><h3>Monte Carlo je Firma <span>{mc['N']:,} Ziehungen</span></h3><p>Je Ziehung schwanken die Mengen der Firma, ihr Wachstum, die unsicheren Schalter und Musts (gewürfelt nach ihrer Wahrscheinlichkeit) und alle Kostenannahmen des Rechners. Gewinner ist der günstigste zulässige Weg über den Horizont. Zum Vergleich steht die „Punkt-Rechnung": wahrscheinlichste Mengen, Schalter ab 50 %, Erwartungswerte.</p></div></div>

    <h2>Die 100 Firmen <em>auf einen Blick</em></h2>
    <p>Jede Zeile ist eine Firma, der Balken zeigt, wie oft welcher Weg in ihren {mc['N']:,} Zukünften am günstigsten war. Rechts der Anteil des häufigsten Wegs: <strong>Wie sicher ist die Antwort?</strong> Klick auf eine Zeile öffnet die Firma.</p>
    <div class="filters" id="f-seg"><span class="lbl">Segment</span></div>
    <div class="filters" id="f-more"><span class="lbl">Autor</span></div>
    <div class="legend" id="legend"></div>
    <div id="detail-top"></div>
    <div class="pchart" id="pchart" role="list"></div>

    <h2>Wo welcher Weg <em>gewinnt</em></h2>
    <div id="where"></div>

    <h2>Was die Antwort <em>wackeln lässt</em></h2>
    <p>Für jede Firma haben wir gemessen, welcher unsichere Input die Gewinner-Verteilung am stärksten verschiebt (Abstand der Verteilungen mit und ohne Schalter bzw. im unteren und oberen Drittel einer Menge). So oft war es der stärkste Treiber:</p>
    <div id="drvcount"></div>

    <h2>Punkt-Rechnung <em>gegen</em> Monte Carlo</h2>
    <div id="recvs"></div>

    <h2>Opus- und Sonnet-Firmen <em>im Vergleich</em></h2>
    <div id="authors"></div>
    <div id="verdict"></div>

    <details class="tv"><summary>Alle 100 als Tabelle</summary><div class="tbl-wrap"><table class="tbl small" id="tbl"></table></div></details>

    <div class="src-box">
      <h3>Ehrlich eingeordnet</h3>
      <p style="margin-bottom:10px">Die Firmen sind <strong>erfunden</strong>, von Sprachmodellen geschrieben und von einem Sprachmodell geprüft. Ähnlichkeiten mit echten Organisationen sind nicht beabsichtigt. Sie sind keine repräsentative Stichprobe, sondern ein absichtlich breiter Satz von Fällen: 25 je Ecke des Markts, Sonderfälle überrepräsentiert.</p>
      <p style="margin-bottom:10px">Die Kostenannahmen sind die des Rechners (v0.23), mit Quelle an jedem Wert im Rechner. Gerankt wird nur nach Kosten unter den zulässigen Wegen, ohne den Anforderungs-Score. Die Wahrscheinlichkeiten für Schalter und Musts sind Einschätzungen der Agents, wie offen eine Frage in der jeweiligen Firma ist.</p>
      <p style="margin:0">Offenlegung: ChartKitchen byDatenWG ist unser eigenes Open-Source-Projekt und fällt in die Kategorie Open Source.</p>
    </div>

    <h2>Daten und <em>Skripte</em></h2>
    <ul>
      <li><a href="assets/posts/persona-firmen/personas.json">personas.json</a>: die 100 geprüften Personas · <a href="assets/posts/persona-firmen/mc-ergebnis.json">mc-ergebnis.json</a>: Monte-Carlo-Ergebnis je Firma</li>
      <li>Aufträge an die Agents, Rohfassungen und Review-Log unter <code>sessions/visual-standards-personas-100/</code></li>
      <li><code>tools/rechner-personas-mc.js</code> (Simulation im Browser-Rechenkern) · <code>tools/rechner-personas-page.py</code> (diese Seite)</li>
    </ul>

    <div class="cta-card">
      <div class="cta-card-text"><span class="k">Selbst rechnen</span><h3>Eure Firma als 101.</h3><p>Im Rechner unter „Monte Carlo" lässt sich dieselbe Frage für eure Eingaben stellen: wie sicher ist die Rangfolge?</p></div>
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
(REPO / "persona-firmen-simulation.html").write_text(html.replace("5,000", "5.000").replace(f"{mc['N']:,}", f"{mc['N']:,}".replace(",", ".")), encoding="utf-8")
print("geschrieben: persona-firmen-simulation.html", len(html))
