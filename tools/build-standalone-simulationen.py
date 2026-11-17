#!/usr/bin/env python3
"""Baut downloads/visual-standards-simulationen.html: No-free-lunch-Post (100.000 Firmen) + Persona-Seite (150 Firmen)
in einer Datei, Bilder als data-URI, Daten und Skript eingebettet, keine externen Requests.
Aufruf: python3 tools/build-standalone-simulationen.py"""
import base64, re
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
SITE = "https://datenwgknowledgekitchen.com/"
nf = (REPO / "no-free-lunch-visual-standards-post.html").read_text(encoding="utf-8")
pf = (REPO / "persona-firmen-simulation.html").read_text(encoding="utf-8")
js = (REPO / "assets/posts/persona-firmen/persona-firmen.js").read_text(encoding="utf-8")
css = pf[pf.index("<style>"):pf.index("</style>") + 8].replace("</style>", """
.tabs { position:sticky; top:0; z-index:5; display:flex; flex-wrap:wrap; gap:8px; padding:12px 0; margin:0 0 26px; background:var(--bg); border-bottom:1px solid var(--line); }
.tabs a { font-family:var(--mono); font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; text-decoration:none; color:var(--ink-mute); padding:8px 14px; border:1px solid var(--line); border-radius:100px; background:var(--bg-card); }
.tabs a:hover { color:var(--topic); border-color:var(--topic); }
.part { scroll-margin-top:70px; } .part + .part { margin-top:90px; padding-top:40px; border-top:3px solid var(--black); }
</style>""")


def section(h):
    return h[h.index("<header>"):h.index('<div class="post-foot">')] + "</div>"


a, b = section(nf), section(pf)
a = re.sub(r'src="([^"]+\.png)"', lambda m: 'src="data:image/png;base64,' + base64.b64encode((REPO / m.group(1)).read_bytes()).decode() + '"', a)
a = a.replace(' loading="lazy"', "")
fix = lambda h: re.sub(r'href="(?!https?:|#|mailto:|data:)([^"]+)"', lambda m: f'href="{SITE}{m.group(1)}"', h)
a, b = fix(a), fix(b)
for u, t in [(SITE + "persona-firmen-simulation.html", "#teil2"), (SITE + "no-free-lunch-visual-standards-post.html", "#teil1")]:
    a, b = a.replace(f'href="{u}"', f'href="{t}"'), b.replace(f'href="{u}"', f'href="{t}"')
js = js.replace('href="no-free-lunch-visual-standards-post.html"', 'href="#teil1"')
data = pf[pf.index("const DATA="):pf.index("</script>", pf.index("const DATA="))]
html = f"""<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>No free lunch · Visual-Standards in Power BI simuliert</title>
<meta name="description" content="Zwei Simulationen mit dem Visual-Standards-Rechner der Daten-WG: 100.000 Firmen und 150 Persona-Firmen mit KI-Pflege. Eigenständige Fassung, alle Daten eingebettet.">
{css}
</head>
<body>
<div class="container">
  <nav class="tabs" aria-label="Teile"><a href="#teil1">Teil 1 · 100.000 Firmen</a><a href="#teil2">Teil 2 · 150 Persona-Firmen</a><a href="{SITE}visual-standards-10000-firmen.html">Report · 10.000 Firmen ↗</a></nav>
  <section class="part" id="teil1">
{a}
  </section>
  <section class="part" id="teil2">
{b}
  </section>
  <div class="post-foot">Michael Tenner · Daten-WG Knowledge Kitchen · <a href="{SITE}">datenwgknowledgekitchen.com</a> · Eigenständige Fassung: Bilder, Daten und Skript eingebettet; Links zu Daten und Skripten zeigen auf die Website.</div>
</div>
<script>
{data}
</script>
<script>
{js}
</script>
</body>
</html>
"""
(REPO / "downloads/visual-standards-simulationen.html").write_text(html, encoding="utf-8")
print("geschrieben: downloads/visual-standards-simulationen.html", len(html) // 1024, "KB")
