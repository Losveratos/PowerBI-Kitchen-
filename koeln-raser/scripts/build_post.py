#!/usr/bin/env python3
"""Baut die Post-Seite /koelner-raser-post.html aus blog/koeln-blitzt.md.

    python3 koeln-raser/scripts/build_post.py

Übernimmt das Layout der bestehenden Kitchen-Posts (CSS aus wissensgraph-aus-transkripten.html)
und kennt genau das Markdown, das der Beitrag nutzt: Überschriften, Absätze, Listen, Tabellen,
Bilder mit kursiver Bildunterschrift in der Folgezeile, **fett**, `code` und Links.
"""
import html
import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
MD = REPO / "blog" / "koeln-blitzt.md"
OUT = REPO / "koelner-raser-post.html"
CSS_FROM = REPO / "wissensgraph-aus-transkripten.html"

DEK = ("445.483 Tempoverstöße, offen als Daten: ein neuer Blitzer, der nach drei Monaten nur noch gut ein Viertel so oft auslöst, "
       "Nächte mit deutlich mehr schweren Fällen und 97 % der Fälle ohne Punkt. Dazu, was die Daten nicht können.")
EXTRA_CSS = """
.post-hero { margin:0 0 30px; }
.post-hero img { width:100%; max-width:none; height:auto; display:block; border-radius:var(--radius); box-shadow:none; }
figure { margin:26px 0 30px; }
figure img { width:100%; max-width:560px; height:auto; display:block; border-radius:var(--radius); box-shadow:var(--shadow-md); }
figure.wide img { max-width:100%; }
figure > a { display:block; }
figcaption, .post-hero figcaption { font-size:12.5px; color:var(--ink-mute); margin-top:8px; }
.prose table { width:100%; max-width:70ch; border-collapse:collapse; font-size:14px; margin:8px 0 10px; }
.prose th { text-align:left; font-weight:600; color:var(--ink); border-bottom:2px solid var(--line-strong); padding:7px 8px; }
.prose td { border-bottom:1px solid var(--line); padding:6px 8px; color:var(--ink-soft); font-variant-numeric:tabular-nums; }
.prose th.r, .prose td.r { text-align:right; white-space:nowrap; }
.table-wrap { overflow-x:auto; margin-bottom:6px; }
.prose p.note { font-size:13px; color:var(--ink-mute); }
.cta { display:flex; flex-wrap:wrap; gap:12px; margin:26px 0 8px; }
.cta a { display:inline-block; padding:11px 18px; border-radius:999px; background:var(--black); color:#fff; text-decoration:none; font-weight:600; font-size:14px; }
.cta a.ghost { background:transparent; color:var(--ink); border:1px solid var(--line-strong); }
"""


def href(u):
    """Relative Pfade im Markdown gelten ab blog/, die Seite liegt eine Ebene höher."""
    return u if re.match(r"(https?:|#|/)", u) else "blog/" + u


def link(text, u):
    dl = " download" if u.endswith(".pdf") and not u.startswith("http") else ""
    return f'<a href="{href(u)}"{dl}>{text}</a>'


def inline(s):
    s = html.escape(s, quote=False)
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    s = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", lambda m: link(m.group(1), m.group(2)), s)
    s = re.sub(r"(?<![\"=])(https?://[^\s)<]+)", lambda m: f'<a href="{m.group(1)}">{m.group(1).replace("https://", "")}</a>', s)
    return s


def table(rows):
    cells = [[c.strip() for c in r.strip().strip("|").split("|")] for r in rows]
    head, align, body = cells[0], cells[1], cells[2:]
    right = [a.endswith(":") for a in align]
    th = "".join(f'<th{" class=\"r\"" if r else ""}>{inline(c)}</th>' for c, r in zip(head, right))
    trs = "".join("<tr>" + "".join(f'<td{" class=\"r\"" if r else ""}>{inline(c)}</td>' for c, r in zip(row, right)) + "</tr>" for row in body)
    return f'<div class="table-wrap"><table><thead><tr>{th}</tr></thead><tbody>{trs}</tbody></table></div>'


def main():
    lines = MD.read_text(encoding="utf-8").splitlines()
    title = lines[0].lstrip("# ").strip()
    body, i, hero = [], 1, ""
    while i < len(lines):
        ln = lines[i].rstrip()
        img = re.match(r"\[?!\[([^\]]*)\]\(([^)]+)\)(?:\]\(([^)]+)\))?", ln)
        if not ln or ln.startswith(">"):
            i += 1
            continue
        if img:
            cap = ""
            if i + 1 < len(lines) and lines[i + 1].startswith("*") and lines[i + 1].rstrip().endswith("*"):
                cap = lines[i + 1].strip().strip("*")
                i += 1
            src = "blog/" + img.group(2)
            tag = f'<img src="{src}" alt="{html.escape(img.group(1))}" loading="lazy">'
            if img.group(3):                               # verlinktes Bild: volle Breite, Klick öffnet das Original
                tag = f'<a href="{href(img.group(3))}">{tag}</a>'
            fig = (f'<figure{" class=\"wide\"" if img.group(3) else ""}>{tag}'
                   + (f"<figcaption>{inline(cap)}</figcaption>" if cap else "") + "</figure>")
            if not hero:                                   # erstes Bild = Titelbild über dem Artikel
                hero = fig.replace("<figure>", '<figure class="post-hero">').replace(' loading="lazy"', "")
            else:
                body.append(fig)
        elif ln.startswith("## "):
            body.append(f"<h2>{inline(ln[3:])}</h2>")
        elif ln.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                rows.append(lines[i]); i += 1
            body.append(table(rows))
            continue
        elif ln.startswith("- "):
            items = []
            while i < len(lines) and lines[i].startswith("- "):
                items.append(f"<li>{inline(lines[i][2:])}</li>"); i += 1
            body.append("<ul>" + "".join(items) + "</ul>")
            continue
        elif ln.startswith("*") and ln.endswith("*"):
            body.append(f'<p class="note">{inline(ln.strip("*"))}</p>')
        else:
            body.append(f"<p>{inline(ln)}</p>")
        i += 1
    src = CSS_FROM.read_text(encoding="utf-8")
    css = src.split("<style>", 1)[1].split("</style>", 1)[0] + EXTRA_CSS
    page = f"""<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{html.escape(title)} · Daten-WG</title>
<link rel="alternate" type="text/markdown" title="Markdown" href="blog/koeln-blitzt.md">
<meta name="description" content="{html.escape(DEK)}">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(DEK)}">
<meta property="og:image" content="https://datenwgknowledgekitchen.com/blog/assets/raser-1-karte-nacht.png">
<style>{css}</style>
</head>
<body>
<div class="container">

  <a class="back-link" href="index.html#posts-talks">← Zurück zur Knowledge Kitchen</a>

  <header>
    <div class="post-eyebrow">Post · Köln blitzt, Raser-Atlas 2025</div>
    <h1 class="post-title">{html.escape(title)}</h1>
    <p class="post-dek">{html.escape(DEK)}</p>
    <div class="post-meta">
      <span>Von <strong>Michael Tenner</strong></span>
      <span>Stand · <strong>September 2026</strong></span>
      <span>Quelle · <strong>Offene Daten Köln 2025</strong></span>
      <span>Story · <strong><a href="koelner-raser-story.html">Karte, Zeitraffer, Atlas</a></strong></span>
    </div>
  </header>

  {hero}

  <div class="prose">
    {chr(10).join("    " + b for b in body).strip()}
    <div class="cta"><a href="koelner-raser-story.html">Zur interaktiven Story</a><a class="ghost" href="koelner-raser-story.html#atlas">Meinen Blitzer suchen</a></div>
  </div>
</div>
</body>
</html>
"""
    OUT.write_text(page, encoding="utf-8")
    print(f"✓ {OUT.name} · {OUT.stat().st_size / 1024:.0f} KB · {len(body)} Blöcke")


if __name__ == "__main__":
    main()
