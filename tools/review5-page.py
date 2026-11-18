#!/usr/bin/env python3
"""Baut visual-standards-review.html (+ downloads/visual-standards-review-standalone.html) aus den fünf Reviews
in sessions/visual-standards-review-5/. Aufruf: python3 tools/review5-page.py"""
import html, json, re
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
D = REPO / "sessions" / "visual-standards-review-5"
SITE = "https://datenwgknowledgekitchen.com/"
IDS = [("r1-coe", "Leiterin BI Center of Excellence, DAX-Konzern", "Praxis im Konzern: Tenant-Regeln, Org Store, Report Server, KI-Adoption", "Opus"),
       ("r2-cfo", "CFO-Berater und IBCS-Praktiker", "Fachbereich Finance: Must-Listen, IBCS-Zertifikat, Entscheidbarkeit für den CFO", "Sonnet"),
       ("r3-method", "Statistiker für Simulationen und Entscheidungsmodelle", "Methodik: Monte Carlo, Kopplung, Gewichtung, Vorlagen, Kontrafaktum", "Opus"),
       ("r4-paid", "Lizenz- und Einkaufsmanager, Anwalt von Paid", "Gegenposition: Preise, Staffeln, Site-Lizenz, Benachteiligung gekaufter Visuals", "Sonnet"),
       ("r5-oss", "Open-Source-Maintainer und KI-Coding-Skeptiker", "OSS-Pflege, 1-FTE-Szenario, Deneb, KI-Faktoren, Interessenkonflikt", "Opus")]
R = {i: json.loads((D / f"{i}.json").read_text(encoding="utf-8")) for i, *_ in IDS}
MD = {i: (D / f"{i}.md").read_text(encoding="utf-8") for i, *_ in IDS}
CLAIMS = {
    "C1": "Kein Weg gewinnt immer (100k: Paid 68 % nur Kosten; mit Musts Core 30 / Paid 28)",
    "C2": "47 % dürfen den günstigsten Weg nicht nehmen; Ersatz +60 %",
    "C3": "Jeder zahlt, nur woanders (Kostenmix je Weg)",
    "C4": "150 Personas: 25 sicher, 52 Münzwurf",
    "C5": "KI-Pflege spart 1–13 €/Viewer, ändert die Rangfolge kaum",
    "C6": "Klein → Paid, ab ~1.000 MA → Deneb, Sperre → Core",
    "C7": "Gesamtrating nach Nutzern: Paid 37 / Deneb 36",
    "C8": "Harte Weichen kippen 51–91 %, Kostenhebel 7–33 %",
    "C9": "OSS fertig + 1 FTE gepflegt: 38 %, zertifiziert 45 %",
    "C10": "Die FTE wäre finanzierbar",
    "C11": "Methodik trägt (KI-Populationen, 10k aus 150 Vorlagen, Kontrafaktum)",
    "C12": "Unsicherheit und Interessenkonflikt ausreichend offengelegt",
}
RC = {"hält": ("#2A857A", "hält"), "wackelt": ("#C9962E", "wackelt"), "falsch": ("#8B2E2E", "falsch"), "nicht beurteilbar": ("#B4B2A2", "n. b.")}
e = html.escape


def md2html(t):
    out, lst = [], False
    for line in t.splitlines():
        s = line.rstrip()
        s2 = e(s)
        s2 = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", s2)
        s2 = re.sub(r"`([^`]+)`", r"<code>\1</code>", s2)
        if re.match(r"^\s*[-*] ", s):
            if not lst:
                out.append("<ul>"); lst = True
            out.append("<li>" + re.sub(r"^\s*[-*] ", "", s2) + "</li>"); continue
        if lst:
            out.append("</ul>"); lst = False
        if s.startswith("#"):
            lvl = min(4, len(s) - len(s.lstrip("#")) + 2)
            out.append(f"<h{lvl}>{s2.lstrip('#').strip()}</h{lvl}>")
        elif s.strip():
            out.append(f"<p>{s2}</p>")
    if lst:
        out.append("</ul>")
    return "\n".join(out)


# --- Matrix ---
mat = "<div class='tbl-wrap'><table class='tbl small mx'><thead><tr><th>Kernaussage</th>" + "".join(f"<th class='c'>{n.split(',')[0].split(' und ')[0]}</th>" for _, n, _, _ in IDS) + "</tr></thead><tbody>"
for c, txt in CLAIMS.items():
    mat += f"<tr><td><b>{c}</b> {e(txt)}</td>"
    for i, *_ in IDS:
        v = R[i]["verdicts"].get(c, {})
        col, lab = RC.get(v.get("rating", "nicht beurteilbar"), RC["nicht beurteilbar"])
        mat += f"<td class='c'><span class='pill' style='background:{col}' title='{e(v.get('why', ''))}'>{lab}</span></td>"
    mat += "</tr>"
mat += "</tbody></table></div><p class='note'>Fahre mit der Maus über ein Urteil für die Begründung. Volle Begründungen unten bei jedem Review.</p>"

cards = "<div class='rcards'>" + "".join(
    f"<div class='rcard'><div class='rk'>{m} · Review {k+1}</div><h3>{e(n)}</h3><div class='rf'>{e(f)}</div><div class='rs'>{R[i]['overall']['score']}<small>/5</small></div><p>{e(R[i]['overall']['summary'])}</p><a href='#full-{i}'>ganzes Review ↓</a></div>"
    for k, (i, n, f, m) in enumerate(IDS)) + "</div>"

crit = []
for i, n, *_ in IDS:
    for fd in R[i]["findings"]:
        crit.append((fd["severity"], i, n, fd))
order = {"kritisch": 0, "wichtig": 1, "klein": 2}
crit.sort(key=lambda t: order.get(t[0], 3))
SEVC = {"kritisch": "#8B2E2E", "wichtig": "#C9962E", "klein": "#6B6B6B"}
findings = "".join(
    f"<details class='fd'><summary><span class='pill' style='background:{SEVC.get(sv, '#6B6B6B')}'>{sv}</span> <b>{e(fd.get('claim', ''))}</b> · {e(fd['issue'][:170])}{'…' if len(fd['issue']) > 170 else ''} <span class='who'>{e(n.split(',')[0])}</span></summary>"
    f"<p><b>Befund:</b> {e(fd['issue'])}</p><p><b>Beleg:</b> {e(fd.get('evidence', ''))}</p><p><b>Vorschlag:</b> {e(fd.get('fix', ''))}</p><p><b>Wirkung:</b> {e(fd.get('impact', ''))}</p></details>"
    for sv, i, n, fd in crit)
full = "".join(f"<section class='full' id='full-{i}'><h3>Review {k+1}: {e(n)} <span class='note'>({m}, {R[i]['overall']['score']}/5)</span></h3>{md2html(MD[i])}</section>" for k, (i, n, f, m) in enumerate(IDS))

body = (REPO / "tools" / "review5-body.html").read_text(encoding="utf-8")
body = body.replace("<!--CARDS-->", cards).replace("<!--MATRIX-->", mat).replace("<!--FINDINGS-->", findings).replace("<!--FULL-->", full)
src = (REPO / "no-free-lunch-visual-standards-post.html").read_text(encoding="utf-8")
css = src[src.index("<style>") + 7:src.index("</style>")] + """
.rcards { display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:14px; margin:18px 0; }
.rcard { background:var(--bg-card); border:1px solid var(--line); border-radius:var(--radius-lg); padding:16px 18px; box-shadow:var(--shadow-sm); position:relative; }
.rcard h3 { font-size:1.02rem; margin:4px 0 4px; color:var(--black); padding-right:56px; } .rcard .rk { font-family:var(--mono); font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--topic); }
.rcard .rf { font-size:12.5px; color:var(--ink-mute); margin-bottom:8px; } .rcard p { font-size:13.5px; color:var(--ink-soft); margin:0 0 8px; } .rcard a { font-size:12.5px; color:var(--accent); }
.rcard .rs { position:absolute; top:14px; right:16px; font-family:var(--serif); font-size:2rem; font-weight:300; font-style:italic; color:var(--topic); line-height:1; } .rcard .rs small { font-size:.9rem; color:var(--ink-mute); }
.pill { display:inline-block; padding:2px 9px; border-radius:100px; color:#fff; font-size:11.5px; font-weight:600; white-space:nowrap; }
.mx td.c, .mx th.c { text-align:center; } .mx th.c { font-size:10px; }
.fd { border-bottom:1px solid var(--line); padding:8px 0; font-size:14px; } .fd summary { cursor:pointer; color:var(--ink-soft); line-height:1.5; } .fd p { font-size:13.5px; color:var(--ink-soft); margin:6px 0 6px 4px; }
.fd .who { font-family:var(--mono); font-size:10.5px; color:var(--ink-mute); text-transform:uppercase; letter-spacing:.06em; }
.full { border-top:1px solid var(--line); padding-top:18px; margin-top:26px; } .full h3 { font-size:1.15rem; color:var(--black); margin-bottom:10px; } .full h4 { font-size:1rem; margin:14px 0 6px; color:var(--black); }
.full p, .full li { font-size:14.5px; color:var(--ink-soft); } .full ul { padding-left:20px; } .full ul li { list-style:disc; padding:2px 0; border:none; } .full ul li::before { display:none; }
.tbl td.num { white-space:nowrap; }
"""


def page(standalone):
    b = body
    if standalone:
        b = re.sub(r'href="(?!https?:|#|mailto:)([^"]+)"', lambda m: f'href="{SITE}{m.group(1)}"', b)
        b = re.sub(r"href='(?!https?:|#|mailto:)([^']+)'", lambda m: f"href='{SITE}{m.group(1)}'", b)
    chrome = "" if standalone else '<script src="assets/js/site-chrome.js" data-chrome="full"></script>\n'
    return f"""<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Fünf Experten prüfen die Visual-Standards-Simulationen · Daten-WG</title>
<meta name="description" content="Fünf Experten-Agents (Konzern-CoE, CFO/IBCS, Methodik, Einkauf/Paid, Open Source) prüfen die Simulationen mit dem Visual-Standards-Rechner: was hält, was nicht, und was korrigiert wird.">
<link rel="canonical" href="{SITE}visual-standards-review.html">
<style>{css}</style>
</head>
<body>
{chrome}<div class="container">
{b}
</div>
</body>
</html>
"""


(REPO / "visual-standards-review.html").write_text(page(False), encoding="utf-8")
(REPO / "downloads" / "visual-standards-review-standalone.html").write_text(page(True), encoding="utf-8")
print("geschrieben: visual-standards-review.html + downloads/visual-standards-review-standalone.html")
