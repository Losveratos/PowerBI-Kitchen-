#!/usr/bin/env python3
"""Baut den Post „No free lunch“ aus dem Ergebnis der 100k-Simulation: Infografik-Daten, Post-HTML, Markdown.
Aufruf: python3 tools/no-free-lunch-build.py <result.json> <population.json>
Danach die Infografik rendern: NODE_PATH=$(npm root -g) node tools/no-free-lunch-render.js
Alle Zahlen kommen aus result.json (tools/rechner-population-analyse.py)."""
import json, re, sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
R = json.load(open(sys.argv[1], encoding="utf-8"))
POP = json.load(open(sys.argv[2], encoding="utf-8"))["segments"]
O = ["paid", "oss", "deneb", "core"]
N = {"paid": "3rd-Party paid", "oss": "Open Source", "deneb": "Deneb / Vega", "core": "Core + SVG"}
C = {"paid": "#eb6834", "oss": "#1baf7a", "deneb": "#2a78d6", "core": "#eda100"}
r = lambda x: round(100 * x)
pc = lambda x: f"{round(100 * x)}&nbsp;%"
pcm = lambda x: f"{round(100 * x)} %"
de = lambda n: f"{n:,.0f}".replace(",", ".")
dec = lambda x, d=2: f"{x:.{d}f}".replace(".", ",")
sw = lambda o: f'<span class="sw" style="background:{C[o]}"></span>'

# ---------- 1 · Infografik-Daten ----------
D = {}
D["lens"] = [{"k": "Nur Kosten", "s": "keine Einschränkung", "v": {k: r(R["win_free"].get(k, 0)) for k in O + ["none"]}},
             {"k": "+ harte Regeln", "s": "Tenant-Regeln, Lizenzbudget", "v": {k: r(R["win_flags"].get(k, 0)) for k in O + ["none"]}},
             {"k": "+ Must-Listen", "s": "K.O. aus der Anforderung", "v": {k: r(R["win_ok"].get(k, 0)) for k in O + ["none"]}}]
wv = R["win_by_viewers"]
D["size"] = [r(wv[0]["free"]["paid"]), r(wv[4]["free"]["paid"])]
D["hor"] = [r(R["win_by_horizon"]["3"]["free"]["paid"]), r(R["win_by_horizon"]["10"]["free"]["paid"])]
D["lic"] = [r(R["win_by_lic"]["inforiver"]["free"]["paid"]), r(R["win_by_lic"]["zebra"]["free"]["paid"])]
D["base"] = {k: [r(R["win_by_baseline"]["none"]["free"].get(k, 0)), r(R["win_by_baseline"][k]["free"].get(k, 0))] for k in O}
D["flip"] = r(R["constraint_flip"]); D["flipPrice"] = r(R["constraint_price"]["p50"]); D["flipP75"] = r(R["constraint_price"]["p75"])
D["hind"] = r(1 - R["hindsight"]["same"]); D["regret"] = r(R["hindsight"]["regret_p50"]); D["none"] = r(R["win_ok"].get("none", 0))
cm = R["cost_mix"]
G = [("lic", "Lizenz & Support", ["lic"]), ("build", "Aufbau & Migration", ["build", "switch"]), ("roll", "Rollout & Schulung", ["rollout", "train"]),
     ("maint", "Wartung & Updates", ["maint"]), ("gov", "Governance, Support, Risiko", ["gov", "risk"])]
D["groups"] = [[g[0], g[1]] for g in G]
D["mix"] = {o: [round(100 * sum(cm[o][c] for c in g[2]), 1) for g in G] for o in O}
D["hard"] = {o: r(R["hard_share"][o]) for o in O}; D["exit"] = {o: r(R["exit_ratio"][o]) for o in O}
D["fte"] = {o: round(R["fte"][o]["p50"], 2) for o in O}
D["dogma"] = {o: {"feas": r(R["dogma"][o]["feasible"]), "ex": r(R["dogma"][o]["excess_total_pct"]), "best": r(R["dogma"][o]["best"])} for o in O}
D["N"] = R["N"]
ip = REPO / "assets/posts/no-free-lunch/infografik.html"
s = ip.read_text(encoding="utf-8")
s = re.sub(r"const D=.*?;\n", "const D=" + json.dumps(D, ensure_ascii=False) + ";\n", s, count=1)
ip.write_text(s, encoding="utf-8")

# ---------- 2 · Post-HTML ----------
src = (REPO / "finance-reporting-budapest-post.html").read_text(encoding="utf-8")
css = src[src.index("<style>"):src.index("</style>") + 8]
css = css.replace("rgba(42,133,122,.06)", "rgba(194,90,45,.06)").replace("--topic:#2A857A;", "--topic:#C25A2D;")
css = css.replace("</style>", """.kpis { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin:24px 0 30px; }
.kpi { background:var(--bg-card); border:1px solid var(--line); border-radius:var(--radius); padding:16px 18px; box-shadow:var(--shadow-sm); }
.kpi .v { font-family:var(--serif); font-weight:300; font-style:italic; font-size:2.3rem; line-height:1; color:var(--topic); }
.kpi .l { font-size:13.5px; color:var(--ink-soft); margin-top:6px; line-height:1.45; }
@media (max-width:640px){ .kpis { grid-template-columns:1fr; } }
.tbl td.num, .tbl th.num { text-align:right; font-variant-numeric:tabular-nums; } .tbl td.num { color:var(--ink); white-space:nowrap; }
.sw { display:inline-block; width:10px; height:10px; border-radius:3px; margin-right:7px; vertical-align:baseline; }
.tbl-wrap { overflow-x:auto; }
</style>""")
SEGN = {"klein": "Klein (&lt; 250 MA)", "mittelstand": "Mittelstand", "gehoben": "Gehobener Mittelstand", "konzern": "Konzern", "finanz": "Bank, Versicherung, Klinik", "oeffentlich": "Öffentliche Hand"}
segrows = "".join(f"<tr><td>{SEGN[k]}</td><td class='num'>{pc(v['share'])}</td><td class='num'>{de(v['creators'][1])}</td><td class='num'>{de(v['viewers'][1])}</td><td class='num'>{pc(v['flags']['certonly'])}</td><td class='num'>{pc(v['flags']['nobudget'])}</td><td class='num'>{pc(v['baseline']['none'])}</td></tr>" for k, v in POP.items())
lens = [("Nur Kosten", R["win_free"]), ("+ harte Regeln (Tenant-Regeln, Lizenzbudget, gesperrte Custom Visuals)", R["win_flags"]),
        ("+ Must-Listen aus der Anforderung", R["win_ok"]), ("+ Must-Listen, verhandelbar wenn nichts übrig bleibt", R["win_neg"])]
lensrows = "".join(f"<tr><td>{n}</td>" + "".join(f"<td class='num'>{pc(d.get(o, 0))}</td>" for o in O) + f"<td class='num'>{pc(d.get('none', 0))}</td></tr>" for n, d in lens)
RBN = {"opus": "Schätzer A · Opus", "sonnet-1": "Schätzer B · Sonnet", "sonnet-2": "Schätzer C · Sonnet"}
robrows = "".join(f"<tr><td>{RBN[k]}</td>" + "".join(f"<td class='num'>{pc(v['ok'].get(o, 0))}</td>" for o in O) + f"<td class='num'>{pc(v['ok'].get('none', 0))}</td></tr>" for k, v in R["robust"].items())
rob = {o: (min(v["ok"].get(o, 0) for v in R["robust"].values()), max(v["ok"].get(o, 0) for v in R["robust"].values())) for o in O}
GH = [("Lizenz &amp; Support", ["lic"]), ("Aufbau &amp; Migration", ["build", "switch"]), ("Rollout &amp; Schulung", ["rollout", "train"]), ("Wartung &amp; Updates", ["maint"]), ("Governance, Support, Risiko", ["gov", "risk"])]
mixrows = "".join(f"<tr><td>{sw(o)}{N[o]}</td>" + "".join(f"<td class='num'>{round(100 * sum(cm[o][c] for c in g[1]))}&nbsp;%</td>" for g in GH)
                  + f"<td class='num'>{pc(1 - R['hard_share'][o])}</td><td class='num'>{dec(R['fte'][o]['p50'])}</td><td class='num'>{de(R['per_viewer'][o]['p50'])}&nbsp;€</td><td class='num'>{pc(R['exit_ratio'][o])}</td></tr>" for o in O)
dg = R["dogma"]
dogrows = "".join(f"<tr><td>{sw(o)}Immer {N[o]}</td><td class='num'>{pc(dg[o]['feasible'])}</td><td class='num'>{pc(dg[o]['best'])}</td><td class='num'>+{round(100 * dg[o]['excess_total_pct'])}&nbsp;%</td></tr>" for o in O)
VB = ["unter 25", "25–99", "100–299", "300–999", "1.000–2.999", "ab 3.000"]
vrows = "".join(f"<tr><td>{VB[i]}</td><td class='num'>{de(b['n'])}</td>" + "".join(f"<td class='num'>{pc(b['free'].get(o, 0))}</td>" for o in O) + "</tr>" for i, b in enumerate(wv))
KN = {"must:exit": "Must „kein Vendor-Lock-in“", "flag:nobudget": "kein Lizenzbudget", "must:rs": "Must „läuft im Report Server“", "must:paginated": "Must „Paginated Reports (RDL)“",
      "flag:rs": "Report Server im Einsatz", "must:copilot": "Must „Copilot erstellt Reports“", "must:sla": "Must „Support mit SLA“", "flag:certonly": "nur zertifizierte Visuals",
      "flag:coreonly": "Custom Visuals gesperrt", "must:ibcscert": "Must „IBCS-zertifiziert“", "must:writeback": "Must „Writeback im Visual“", "flag:ibcsmust": "IBCS-Zertifikat Pflicht",
      "must:export": "Must „PDF/PPT-Export &amp; Abos“", "must:mscert": "Must „Microsoft-zertifiziert“"}
kr = R["ko_reasons"]
korows = "".join(f"<tr><td>{sw(o)}{N[o]}</td><td class='num'>{pc(R['ko_rate'][o])}</td><td class='num'>{pc(R['ko_flags'][o])}</td><td>{', '.join(KN.get(k, k) + ' (' + str(round(100 * v)) + '&nbsp;%)' for k, v in kr[o][:3])}</td></tr>" for o in O)
bl = R["win_by_baseline"]; H = R["hindsight"]; gp = R["gap12"]; wn = R["win_ok"]
lead_o = max(O, key=lambda o: wn.get(o, 0)); sec_o = sorted(O, key=lambda o: -wn.get(o, 0))[1]

BANNER = '''<div class="src-box" style="border-left-color:#2A857A;margin-top:22px"><h3>Aktualisiert nach Experten-Review (Rechner v0.24)</h3>Fünf Experten-Agents haben diese Simulation am 18.11.2026 geprüft. Daraufhin wurde die K.O.-Matrix des Rechners angeglichen (RDL für alle gleich, Report Server und Lock-in bei Paid Warnung statt K.O., unzertifiziertes Open Source scheidet bei Export- und Zertifizierungs-Pflicht aus, Deneb bei SLA-Pflicht), das IBCS-Zertifikat wird nur noch einmal gezogen, und alle Zahlen sind neu gerechnet. <a href="visual-standards-review.html">Zum Review und zur Umsetzung →</a></div>'''

body = f'''<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>No free lunch: 100.000 Firmen, vier Wege zum Visual-Standard · Daten-WG</title>
<link rel="alternate" type="text/markdown" title="Markdown" href="blog/no-free-lunch-visual-standards.md">
<meta name="description" content="Wir haben 100.000 Organisationen durch den Visual-Standards-Rechner geschickt: Paid-Visual, Open Source, Deneb oder Core + SVG. Keiner der vier Wege gewinnt immer. Welche Kosten zählen und welche Entscheidungen die Rangfolge kippen.">
<link rel="canonical" href="https://datenwgknowledgekitchen.com/no-free-lunch-visual-standards-post.html">
<meta property="og:type" content="article">
<meta property="og:title" content="No free lunch: 100.000 Firmen, vier Wege, kein Sieger">
<meta property="og:image" content="https://datenwgknowledgekitchen.com/assets/posts/no-free-lunch/no-free-lunch-1.png">
{css}
</head>
<body>
<script src="assets/js/site-chrome.js" data-chrome="full"></script>
<div class="container">

  <a class="back-link" href="index.html">← Zurück zur Knowledge Kitchen</a>

  <header>
    <div class="post-eyebrow">Post · Visual-Standards-Rechner · Simulation</div>
    <h1 class="post-title">No free lunch: <em>100.000 Firmen</em>, vier Wege, kein Sieger</h1>
    <p class="post-dek">Paid-Visual, Open Source, Deneb oder Core Visuals mit SVG: Welcher Weg zum visuellen Standard in Power BI ist der günstigste? Wir haben die Frage nicht einer Firma gestellt, sondern 100.000. Die Antwort: Jeder Weg gewinnt irgendwo, keiner überall, und jeder kostet etwas, nur an einer anderen Stelle.</p>
    <div class="post-meta">
      <span>Von <strong>Michael Tenner</strong></span>
      <span>Stand · <strong>18. November 2026 (v0.24)</strong></span>
      <span>Werkzeug · <strong><a href="visual-standards-rechner.html">Visual-Standards-Rechner v0.24</a></strong></span>
      <span>Daten · <strong><a href="assets/posts/no-free-lunch/ergebnis.json">ergebnis.json</a></strong></span>
    </div>
  </header>
{BANNER}

  <div class="prose">

    <figure>
      <img src="assets/posts/no-free-lunch/no-free-lunch-1.png" alt="Infografik No free lunch, Folie 1: Anteil der Organisationen, bei denen ein Weg am günstigsten ist, in drei Linsen, und die Hebel Größe, Horizont, Lizenzpreis und Bestand" loading="lazy" width="1080" height="1350">
      <figcaption>Folie 1 von 2. Als PDF-Karussell für LinkedIn: <a href="assets/posts/no-free-lunch/no-free-lunch-carousel.pdf">no-free-lunch-carousel.pdf</a>.</figcaption>
    </figure>

    <h2>Die Frage <em>hinter dem Rechner</em></h2>
    <p>Der <a href="visual-standards-rechner.html">Visual-Standards-Rechner</a> beantwortet für eine Organisation, was ein visueller Standard für Controlling und Finance über drei, fünf oder zehn Jahre kostet: mit einem gekauften Visual (Paid), einem fertigen Open-Source-Visual, Deneb-Vorlagen oder Core Visuals mit SVG-Measures. Die naheliegende Frage danach lautet: <strong>Und welcher Weg ist denn nun der richtige?</strong></p>
    <p>Die ehrliche Antwort ist „kommt drauf an". Das klingt nach Ausweichen, also haben wir es durchgerechnet. Nicht für einen Fall, sondern für eine ganze Population von Organisationen, mit demselben Rechenkern, den der Rechner im Browser benutzt.</p>

    <div class="kpis">
      <div class="kpi"><div class="v">{pc(wn[lead_o])}</div><div class="l">höchster Anteil, den ein einzelner Weg bekommt, wenn Rahmenbedingungen und Musts zählen ({N[lead_o]})</div></div>
      <div class="kpi"><div class="v">{pc(R['constraint_flip'])}</div><div class="l">dürfen ihren rechnerisch günstigsten Weg nicht nehmen (davon {pc(R['none_feasible'])} gar keinen); der zulässige Ersatz kostet im Median +{round(100 * R['constraint_price']['p50'])}&nbsp;%</div></div>
      <div class="kpi"><div class="v">{pc(1 - H['same_choice'])}</div><div class="l">der Organisationen mit echter Wahl hätten trotz richtiger Rechnung im Nachhinein anders gewählt, weil die Zukunft streut</div></div>
    </div>

    <h2>So haben wir <em>simuliert</em></h2>
    <div class="step"><div class="step-num">1</div><div><h3>Population schätzen <span>drei KI-Agents, blind</span></h3><p>Wie sehen Organisationen im DACH-Raum aus, die Power BI nutzen und einen visuellen Standard einführen wollen? Größe, Betriebsmodell, Horizont, was heute schon im Haus ist, welche Tenant-Regeln gelten, welche Anforderungen als Must auf der Liste stehen. Drei Agents haben das unabhängig voneinander geschätzt, einer mit Claude Opus, zwei mit Claude Sonnet, jeder mit einer anderen Perspektive (neutral, BI-Leitung, skeptischer Controller). Keiner kannte die Kostenlogik des Rechners. <strong>Übernommen wurde der Median.</strong></p></div></div>
    <div class="step"><div class="step-num">2</div><div><h3>100.000 Organisationen ziehen <span>sechs Segmente</span></h3><p>Aus dieser Population entstehen 100.000 Profile. Jede Organisation läuft durch den <strong>Rechenkern v0.24</strong>: einmal mit den Erwartungswerten aller Annahmen (das ist die Empfehlung, die der Rechner geben würde) und einmal mit einer gepaarten Zufallsziehung (das ist eine Welt, wie sie tatsächlich hätte kommen können).</p></div></div>
    <div class="step"><div class="step-num">3</div><div><h3>Vier Linsen <span>was darf man überhaupt?</span></h3><p>Erst nur die Kosten. Dann mit den harten Rahmenbedingungen (nur zertifizierte Visuals, kein Lizenzbudget, Custom Visuals gesperrt, IBCS-Zertifikat Pflicht). Dann zusätzlich mit den Must-Kriterien aus der Anforderungsliste, die einen Weg per K.O. ausschließen. Und schließlich so, wie es in der Praxis läuft: Bleibt kein Weg übrig, wird die Must-Liste verhandelt.</p></div></div>

    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Segment</th><th class="num">Anteil</th><th class="num">Ersteller</th><th class="num">Viewer</th><th class="num">nur zertifiziert</th><th class="num">kein Lizenzbudget</th><th class="num">heute nichts</th></tr></thead>
      <tbody>{segrows}</tbody>
    </table></div>
    <p style="font-size:13.5px">Ersteller und Viewer: wahrscheinlichster Wert der Dreipunkt-Schätzung. Gewichtet ist nach Anzahl Organisationen, nicht nach Nutzern. Deshalb dominieren kleine und mittlere Organisationen. Die vollständige Population steht in <a href="assets/posts/no-free-lunch/population.json">population.json</a>.</p>

    <h2>Ergebnis 1: <em>Kein Weg gewinnt immer</em></h2>
    <p>Anteil der Organisationen, bei denen der jeweilige Weg über den Horizont am wenigsten kostet:</p>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Linse</th><th class="num">{sw('paid')}Paid</th><th class="num">{sw('oss')}Open Source</th><th class="num">{sw('deneb')}Deneb</th><th class="num">{sw('core')}Core + SVG</th><th class="num">kein Weg</th></tr></thead>
      <tbody>{lensrows}</tbody>
    </table></div>
    <p>Auf reine Kosten gerechnet liegt Paid in gut zwei Dritteln der Fälle vorn. Das liegt an der Population: Die meisten Organisationen sind klein, und bei 20 Lesern ist eine Lizenz billiger als jede Stunde, die man in Deneb-Vorlagen oder SVG-Measures steckt. Mit Rahmenbedingungen und Musts bleibt Paid vorn ({pc(wn['paid'])}), Core + SVG ist Zweiter ({pc(wn['core'])}): Core übersteht fast jede Regel, weil es nichts zu installieren gibt. <strong>Open Source fällt auf {pc(wn['oss'])}</strong>: Ein nicht zertifiziertes Visual kann im Service weder PDF/PPT exportieren noch abonniert werden, und diese Anforderung steht bei {pc(dict(kr['oss']).get('must:export', 0))} der Organisationen als Must auf der Liste. Für Open Source ist die Microsoft-Zertifizierung damit der entscheidende Hebel, nicht der Preis.</p>
    <p>Das Bild hängt nicht an einem der drei Schätzer. Rechnet man jede Population einzeln, verschieben sich die Anteile (Paid {pcm(rob['paid'][0])}–{pcm(rob['paid'][1])}, Core {pcm(rob['core'][0])}–{pcm(rob['core'][1])}), die Aussage bleibt:</p>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Population (mit Must-Listen)</th><th class="num">Paid</th><th class="num">Open Source</th><th class="num">Deneb</th><th class="num">Core + SVG</th><th class="num">kein Weg</th></tr></thead>
      <tbody>{robrows}</tbody>
    </table></div>

    <h2>Ergebnis 2: <em>Was die Rangfolge kippt</em></h2>
    <p>Fünf Größen entscheiden, welcher Weg vorn liegt. Keine davon ist eine Eigenschaft des Tools.</p>
    <ul>
      <li><strong>Größe.</strong> Bei weniger als 25 Lesern gewinnt Paid in {pc(wv[0]['free']['paid'])} der Fälle, bei 1.000 bis 3.000 Lesern nur noch in {pc(wv[4]['free']['paid'])} (nur Kosten). Die Lizenz wächst mit jedem Kopf, eine Vorlage nicht. Ganz oben kommt Paid wieder ({pc(wv[5]['free']['paid'])}), weil große Häuser Site-Lizenzen verhandeln.</li>
      <li><strong>Horizont.</strong> Über drei Jahre gewinnt Paid in {pc(R['win_by_horizon']['3']['free']['paid'])} der Fälle, über zehn Jahre in {pc(R['win_by_horizon']['10']['free']['paid'])}. Lizenzen laufen jedes Jahr, Aufbau zahlt man einmal.</li>
      <li><strong>Lizenzpreis.</strong> Auf Inforiver-Niveau (33&nbsp;€ je Nutzer und Jahr) liegt Paid in {pc(R['win_by_lic']['inforiver']['free']['paid'])} vorn, auf Zebra-Niveau (170&nbsp;€, abgeleitet) in {pc(R['win_by_lic']['zebra']['free']['paid'])}. „Paid" ist keine Kategorie mit einem Preis.</li>
      <li><strong>Was schon im Haus ist.</strong> Der stärkste einzelne Prädiktor. Steht heute schon Deneb im Einsatz, gewinnt Deneb in {pc(bl['deneb']['free'].get('deneb', 0))} der Fälle, auf der grünen Wiese in {pc(bl['none']['free'].get('deneb', 0))}. Bei Open Source: {pc(bl['oss']['free'].get('oss', 0))} gegen {pc(bl['none']['free'].get('oss', 0))}. Migration ist der Posten, den kaum jemand mitrechnet.</li>
      <li><strong>Rahmenbedingungen.</strong> In {pc(R['constraint_flip'])} der Organisationen ist der günstigste Weg nicht zulässig, in {pc(R['none_feasible'])} ist gar keiner zulässig, solange die Must-Liste nicht verhandelt wird. Open Source fällt am häufigsten heraus ({pc(R['ko_rate']['oss'])}), Core am seltensten ({pc(R['ko_rate']['core'])}).</li>
    </ul>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Viewer</th><th class="num">Organisationen</th><th class="num">Paid</th><th class="num">Open Source</th><th class="num">Deneb</th><th class="num">Core + SVG</th></tr></thead>
      <tbody>{vrows}</tbody>
    </table></div>
    <p style="font-size:13.5px">Anteil, bei dem der Weg auf reine Kosten am günstigsten ist, je Größenklasse.</p>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Weg</th><th class="num">K.O. gesamt</th><th class="num">davon harte Regeln</th><th>häufigste Gründe (Anteil aller Organisationen)</th></tr></thead>
      <tbody>{korows}</tbody>
    </table></div>

    <figure>
      <img src="assets/posts/no-free-lunch/no-free-lunch-2.png" alt="Infografik No free lunch, Folie 2: Kostenmix je Weg, Kosten eines Dogmas und sechs Fragen vor der Toolfrage" loading="lazy" width="1080" height="1350">
      <figcaption>Folie 2 von 2: Wofür das Geld fließt, was ein Dogma kostet, und sechs Fragen vor der Toolfrage.</figcaption>
    </figure>

    <h2>Ergebnis 3: <em>Jeder zahlt, nur woanders</em></h2>
    <p>Kein Weg ist gratis. Die Kosten verschieben sich zwischen den Blöcken, und die Niveaus unterscheiden sich:</p>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Weg</th>{''.join(f'<th class="num">{g[0]}</th>' for g in GH)}<th class="num">eigene Zeit</th><th class="num">FTE intern</th><th class="num">€ je Viewer und Jahr</th><th class="num">Ausstieg</th></tr></thead>
      <tbody>{mixrows}</tbody>
    </table></div>
    <p style="font-size:13.5px">Anteile: Mittel über alle Organisationen. „Eigene Zeit" = intern bewertete Stunden. FTE und € je Viewer: Median über alle Organisationen (Erwartungswert). „Ausstieg" = was ein Wechsel nach dem Horizont kosten würde, im Verhältnis zur Summe (Median); nicht in der Summe enthalten.</p>
    <ul>
      <li><strong>Paid</strong> zahlt Lizenz, rund ein Viertel der Kosten. Trotzdem ist mehr als die Hälfte eigene Zeit, weil ein gekauftes Visual keinen Report baut. In absoluten Zahlen braucht Paid aber am wenigsten eigene Zeit ({dec(R['fte']['paid']['p50'])} FTE im Median) und ist je Viewer am günstigsten. Der Ausstieg ist am teuersten, weil die Definitionen am Visual des Herstellers hängen.</li>
      <li><strong>Open Source</strong> zahlt keine Lizenz, dafür Wartung, Freigabe und das Risiko, dass das Projekt eingestellt wird. Drei Viertel der Kosten sind eigene Zeit.</li>
      <li><strong>Deneb</strong> zahlt beim Lernen: Schulung und Rollout sind der größte Block, der Ausstieg ist am billigsten, weil Vega-Lite-Specs das Visual überleben.</li>
      <li><strong>Core + SVG</strong> zahlt in der Wartung: {round(100 * cm['core']['maint'])}&nbsp;% der Kosten fließen in das Nachziehen von Workarounds. Billig ist der Weg nur, wenn er schon steht.</li>
    </ul>

    <h2>Ergebnis 4: <em>Was ein Dogma kostet</em></h2>
    <p>„Wir nehmen immer X" ist eine bequeme Regel. So sieht sie aus, über alle Organisationen gerechnet (mit allen Rahmenbedingungen und Musts):</p>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Regel</th><th class="num">überhaupt zulässig</th><th class="num">am günstigsten</th><th class="num">Mehrkosten, wo zulässig</th></tr></thead>
      <tbody>{dogrows}</tbody>
    </table></div>
    <p>Paid ist dort, wo es erlaubt ist, das billigste Dogma (+{round(100 * dg['paid']['excess_total_pct'])}&nbsp;%), und es ist in {pc(dg['paid']['feasible'])} der Organisationen erlaubt. Core ist fast überall zulässig ({pc(dg['core']['feasible'])}) und kostet dafür rund +{round(100 * dg['core']['excess_total_pct'])}&nbsp;% mehr als nötig. Open Source als Dogma scheitert schon an der Zulässigkeit ({pc(dg['oss']['feasible'])}) und ist dort, wo es geht, am teuersten, weil es auch die Fälle einschließt, in denen das Visual erst gebaut werden muss.</p>

    <h2>Ergebnis 5: <em>Auch die richtige Rechnung irrt</em></h2>
    <p>Bei der einzelnen Organisation ist die Rangfolge meist klar: Im Median liegt der zweitbeste zulässige Weg {round(100 * gp['p50'])}&nbsp;% über dem besten, nur bei {pc(gp['lt10'])} sind es weniger als 10&nbsp;%. Aber die Zukunft streut. Unter den Organisationen, die zwischen mindestens zwei zulässigen Wegen wählen können, wäre in {pc(1 - H['same_choice'])} der simulierten Welten im Nachhinein ein anderer Weg billiger gewesen als der empfohlene, im Median um {round(100 * H['regret_p50'])}&nbsp;%. Das ist kein Fehler der Rechnung, das ist der Preis der Unsicherheit. Deshalb zeigt der Rechner Bandbreiten statt Punktwerte.</p>

    <h2>Sechs Fragen <em>vor</em> der Toolfrage</h2>
    <ul>
      <li><strong>Wie viele lesen in fünf Jahren mit?</strong> Die Lizenz je Kopf wächst mit jedem Leser, die Stunden kaum.</li>
      <li><strong>Über welchen Horizont rechnet ihr?</strong> Drei Jahre begünstigen das Kaufen, zehn Jahre das Bauen.</li>
      <li><strong>Was ist heute schon im Haus?</strong> Der Bestand ist ein starker Hebel, weil Migration teuer ist.</li>
      <li><strong>Welche Regeln sind wirklich hart?</strong> Certified-only, Lizenzbudget, Export-Pflicht: Sie streichen Wege, bevor gerechnet wird.</li>
      <li><strong>Welche Musts sind wirklich Must?</strong> Ein K.O. zu viel kostet im Median +{round(100 * R['constraint_price']['p50'])}&nbsp;%, im oberen Viertel +{round(100 * R['constraint_price']['p75'])}&nbsp;%.</li>
      <li><strong>Wer pflegt es in drei Jahren?</strong> Wartung und Fluktuation fressen den Vorsprung, den Bauen am Anfang hat.</li>
    </ul>

    <div class="src-box">
      <h3>Ehrlich eingeordnet</h3>
      <p style="margin-bottom:10px">Die Population ist <strong>keine Erhebung</strong>. Sie stammt aus drei unabhängigen Schätzungen durch Sprachmodelle (Claude Opus und zweimal Claude Sonnet), Median übernommen. Nur einer der Schätzer hat Quellen gesucht (Destatis-Größenklassen, BARC, Microsoft Learn). Am unsichersten sind die Segmentanteile, die Verbreitung von „nur zertifizierte Visuals" und die Must-Wahrscheinlichkeiten. Musts werden unabhängig voneinander gezogen; deshalb gibt es die vierte Linse, in der eine Organisation ihre Liste verhandelt, wenn sonst nichts übrig bleibt.</p>
      <p style="margin-bottom:10px">Die Kostenannahmen sind die des Rechners (v0.24): Stundenwerte aus einem simulierten Expertenpanel, Preise aus Herstellerseiten und Such-Auszügen, viele Autoren-Schätzungen, alle mit Quelle im Rechner. Gerankt wird hier nur nach Kosten, ohne den Anforderungs-Score, den der Rechner mit 30&nbsp;% gewichtet. Die K.O.-Bewertungen hat ein Review durch fünf Experten-Agents korrigiert; vorher benachteiligten sie Paid (RDL, Report Server, Lock-in) und begünstigten Open Source (Export und Zertifizierung). <a href="visual-standards-review.html">Was das Review gefunden hat</a>.</p>
      <p style="margin:0"><strong>Offenlegung:</strong> ChartKitchen byDatenWG ist unser eigenes Open-Source-Projekt und fällt in die Kategorie Open Source. Auch die Deneb-Vorlagen des Business Chart Builders stammen von uns; sie stehen hinter dem Schalter „Vorlagenbibliothek vorhanden". Der Rechner nennt selbst sechs bekannte Lücken, von denen vier zugunsten der Ansätze wirken, die wir vertreten. Die Simulation ist ein Indikator für Muster, keine Empfehlung für eine einzelne Organisation. Dafür gibt es den Rechner.</p>
    </div>

    <h2>Nachtrag: <em>Personas, 10.000 Firmen, Review</em></h2>
    <p>Wie sicher ist die Antwort für eine einzelne Firma? Dafür gibt es <a href="persona-firmen-simulation.html">150 Persona-Firmen mit je 5.000 Zukünften</a>, den <a href="visual-standards-10000-firmen.html">Report über 10.000 Firmen mit realen Mitarbeiterzahlen</a> und das <a href="visual-standards-review.html">Review durch fünf Experten-Agents</a>.</p>

    <h2>Daten und <em>Skripte</em></h2>
    <ul>
      <li><a href="assets/posts/no-free-lunch/ergebnis.json">ergebnis.json</a>: alle Auswertungen dieser Seite</li>
      <li><a href="assets/posts/no-free-lunch/population.json">population.json</a>: die zusammengeführte Population; die drei Rohschätzungen und der Auftrag an die Agents unter <code>sessions/visual-standards-population-100k/</code></li>
      <li><code>tools/rechner-population-100k.js</code> (Simulation im Browser-Rechenkern), <code>tools/rechner-population-merge.py</code>, <code>tools/rechner-population-analyse.py</code>, <code>tools/no-free-lunch-build.py</code> (diese Seite)</li>
      <li><a href="assets/posts/no-free-lunch/no-free-lunch-carousel.pdf">Infografik als PDF</a> · <a href="assets/posts/no-free-lunch/infografik.html">als HTML</a></li>
    </ul>

    <div class="cta-card">
      <div class="cta-card-text">
        <span class="k">Selbst rechnen</span>
        <h3>Eure Organisation statt 100.000</h3>
        <p>Sieben Fragen, dann seht ihr, welcher Weg bei euch vorn liegt und welche Annahme das Ergebnis kippt.</p>
      </div>
      <div class="cta-actions">
        <a class="cta-btn" href="visual-standards-rechner.html">Zum Rechner →</a>
        <a class="cta-btn ghost" href="finance-reporting-budapest-post.html">Sechs Sprossen</a>
      </div>
    </div>

    <div class="post-foot">
      Fragen, Feedback, eigene Zahlen: <strong>Michael Tenner</strong> · Daten-WG Knowledge Kitchen · <a href="impressum.html">Impressum</a>
      <br><a href="blog/no-free-lunch-visual-standards.md">📄 Diese Seite als Markdown</a>
    </div>

  </div>
</div>
</body>
</html>
'''
(REPO / "no-free-lunch-visual-standards-post.html").write_text(body, encoding="utf-8")

# ---------- 3 · Markdown ----------
t = "| Linse | Paid | Open Source | Deneb | Core + SVG | kein Weg |\n|:--|--:|--:|--:|--:|--:|\n" + "".join(
    f"| {re.sub('<[^>]+>', '', n)} | " + " | ".join(pcm(d.get(o, 0)) for o in O + ["none"]) + " |\n" for n, d in lens)
m = "| Weg | Lizenz & Support | Aufbau & Migration | Rollout & Schulung | Wartung & Updates | Governance, Support, Risiko | eigene Zeit | FTE intern | € je Viewer/Jahr | Ausstieg |\n|:--|" + "--:|" * 9 + "\n" + "".join(
    f"| {N[o]} | " + " | ".join(f"{round(100 * sum(cm[o][c] for c in g[1]))} %" for g in GH) + f" | {pcm(1 - R['hard_share'][o])} | {dec(R['fte'][o]['p50'])} | {de(R['per_viewer'][o]['p50'])} € | {pcm(R['exit_ratio'][o])} |\n" for o in O)
d = "| Regel | zulässig | am günstigsten | Mehrkosten, wo zulässig |\n|:--|--:|--:|--:|\n" + "".join(
    f"| Immer {N[o]} | {pcm(dg[o]['feasible'])} | {pcm(dg[o]['best'])} | +{round(100 * dg[o]['excess_total_pct'])} % |\n" for o in O)
md = f"""# No free lunch: 100.000 Firmen, vier Wege, kein Sieger

> Post · Visual-Standards-Rechner · Simulation · Von Michael Tenner · Stand 18. November 2026 (Rechner v0.24, nach Experten-Review)
> HTML-Fassung: https://datenwgknowledgekitchen.com/no-free-lunch-visual-standards-post.html
> Daten: https://datenwgknowledgekitchen.com/assets/posts/no-free-lunch/ergebnis.json
> Review: https://datenwgknowledgekitchen.com/visual-standards-review.html

Paid-Visual, Open Source, Deneb oder Core Visuals mit SVG: Welcher Weg zum visuellen Standard in Power BI ist der günstigste? 100.000 synthetische Organisationen durch den Rechenkern des Visual-Standards-Rechners (v0.24). Ergebnis: Jeder Weg gewinnt irgendwo, keiner überall, und jeder kostet etwas, nur an einer anderen Stelle.

## Methode

1. **Population:** drei unabhängige Blindschätzungen durch KI-Agents (1× Claude Opus, 2× Claude Sonnet) für sechs Segmente; Median übernommen. Keine Erhebung.
2. **Simulation:** 100.000 Profile, je Organisation Erwartungswert (Empfehlung des Rechners) und eine gepaarte Zufallsziehung (eine mögliche Zukunft). Gewichtet nach Anzahl Organisationen.
3. **Vier Linsen:** nur Kosten · plus harte Rahmenbedingungen · plus Must-Kriterien als K.O. · Must-Liste verhandelbar, wenn sonst nichts übrig bleibt.

## Ergebnis 1: Kein Weg gewinnt immer

{t}
Robust über die drei Einzelschätzungen (mit Must-Listen): Paid {pcm(rob['paid'][0])}–{pcm(rob['paid'][1])}, Core {pcm(rob['core'][0])}–{pcm(rob['core'][1])}, Deneb {pcm(rob['deneb'][0])}–{pcm(rob['deneb'][1])}, Open Source {pcm(rob['oss'][0])}–{pcm(rob['oss'][1])}. Open Source scheitert meist an der Must „PDF/PPT-Export & Abos", die ein unzertifiziertes Visual nicht erfüllt.

## Ergebnis 2: Was die Rangfolge kippt

- **Größe:** Paid vorn bei < 25 Lesern in {pcm(wv[0]['free']['paid'])}, bei 1.000–3.000 Lesern in {pcm(wv[4]['free']['paid'])} (nur Kosten).
- **Horizont:** Paid vorn über 3 Jahre {pcm(R['win_by_horizon']['3']['free']['paid'])}, über 10 Jahre {pcm(R['win_by_horizon']['10']['free']['paid'])}.
- **Lizenzpreis:** Paid vorn auf Inforiver-Niveau (33 €) {pcm(R['win_by_lic']['inforiver']['free']['paid'])}, auf Zebra-Niveau (170 €, abgeleitet) {pcm(R['win_by_lic']['zebra']['free']['paid'])}.
- **Bestand:** Deneb gewinnt mit Bestand {pcm(bl['deneb']['free']['deneb'])}, auf der grünen Wiese {pcm(bl['none']['free']['deneb'])}; Open Source {pcm(bl['oss']['free']['oss'])} gegen {pcm(bl['none']['free']['oss'])}.
- **Rahmenbedingungen:** {pcm(R['constraint_flip'])} dürfen ihren günstigsten Weg nicht nehmen (davon {pcm(R['none_feasible'])} keinen); der zulässige Ersatz kostet im Median +{round(100 * R['constraint_price']['p50'])} %. K.O.-Quote: Paid {pcm(R['ko_rate']['paid'])}, Open Source {pcm(R['ko_rate']['oss'])}, Deneb {pcm(R['ko_rate']['deneb'])}, Core {pcm(R['ko_rate']['core'])}.

## Ergebnis 3: Jeder zahlt, nur woanders

{m}
## Ergebnis 4: Was ein Dogma kostet

{d}
## Ergebnis 5: Auch die richtige Rechnung irrt

Je Organisation ist die Rangfolge meist klar (Abstand Platz 1 zu 2 im Median {round(100 * gp['p50'])} %). Unter Organisationen mit echter Wahl wäre in {pcm(1 - H['same_choice'])} der simulierten Welten im Nachhinein ein anderer Weg billiger gewesen, im Median um {round(100 * H['regret_p50'])} %.

## Ehrlich eingeordnet

- Population aus KI-Schätzungen, keine Erhebung; Musts unabhängig gezogen (deshalb die Linse „verhandelbar").
- Kostenannahmen = Visual-Standards-Rechner v0.24; K.O.-Matrix nach Experten-Review angeglichen. Ranking nur nach Kosten, ohne Anforderungs-Score.
- Offenlegung: ChartKitchen byDatenWG (Open Source) und die Deneb-Vorlagen des Business Chart Builders sind eigene Projekte der Autoren; der Rechner nennt selbst eine Schlagseite zugunsten dieser Ansätze.
"""
(REPO / "blog/no-free-lunch-visual-standards.md").write_text(md, encoding="utf-8")
print("gebaut: infografik-Daten, Post, Markdown")
