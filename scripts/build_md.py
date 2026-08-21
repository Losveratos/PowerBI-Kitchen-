#!/usr/bin/env python3
"""HTML -> Markdown-Generator fuer die Inhaltsseiten der Daten-WG Knowledge Kitchen.

Zweck
-----
Die Website liefert zu jeder Inhaltsseite eine maschinenlesbare `.md`-Fassung
unter `md/<basename>.md` aus (GitHub Pages serviert .md direkt). KI-Agenten
sollen daraus den vollen Seiteninhalt verstehen, ohne HTML zu parsen.

Aufruf
------
    python3 scripts/build_md.py            # alle registrierten Seiten
    python3 scripts/build_md.py chartkitchen-doku
    python3 scripts/build_md.py --list     # Registry anzeigen

Der Lauf ist idempotent: gleiche Eingabe -> byte-identische Ausgabe.

Abhaengigkeiten
---------------
Keine. Bewusst nur Standardbibliothek (`html.parser`) — `bs4` ist in dieser
Umgebung nicht installiert. Falls ein spaeterer Agent bs4 nutzen will: der
Mini-DOM (Node/DomBuilder) unten ist die einzige Stelle, die getauscht werden
muesste; Selektor-Matching und Renderer arbeiten nur gegen `Node`.

Architektur
-----------
1. `DomBuilder`  -> baut aus HTML einen Mini-DOM (`Node`), toleriert auch
   einzeilig/minifiziertes Markup und unbalancierte Tags.
2. `Converter`   -> generischer HTML->Markdown-Kern, gesteuert ueber ein
   Konfigurations-Dict pro Seite (Drop-Selektoren, Heading-Klassen,
   Inline-Separatoren, Blockquote-Klassen, Custom-Handler).
3. `PAGES`       -> Seiten-Registry. Neue Seite = neuer Eintrag, kein Eingriff
   in den Kern noetig. Siehe Kommentar am Registry-Kopf.
"""

from __future__ import annotations

import html as html_mod
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "md"
SITE = "https://datenwgknowledgekitchen.com"

# ---------------------------------------------------------------------------
# 1 · Mini-DOM
# ---------------------------------------------------------------------------

VOID_TAGS = {
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
    "meta", "param", "source", "track", "wbr",
}

# Diese Tags fliegen immer raus, auf jeder Seite.
ALWAYS_DROP_TAGS = {
    "script", "style", "svg", "noscript", "form", "button", "input",
    "select", "textarea", "iframe", "canvas", "template", "head", "meta",
    "link", "title",
}

BLOCK_TAGS = {
    "address", "article", "aside", "blockquote", "details", "div", "dl",
    "figure", "footer", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr",
    "li", "main", "nav", "ol", "p", "pre", "section", "table", "ul",
}


class Node:
    __slots__ = ("tag", "attrs", "children", "parent", "text")

    def __init__(self, tag: str, attrs: dict | None = None, text: str = ""):
        self.tag = tag
        self.attrs = attrs or {}
        self.children: list[Node] = []
        self.parent: Node | None = None
        self.text = text

    # -- Komfort ------------------------------------------------------------
    @property
    def classes(self) -> set[str]:
        return set((self.attrs.get("class") or "").split())

    @property
    def id(self) -> str:
        return self.attrs.get("id") or ""

    def get(self, key: str, default: str = "") -> str:
        return self.attrs.get(key, default)

    def find(self, selector: str) -> "Node | None":
        for n in self.walk():
            if matches(n, selector):
                return n
        return None

    def find_all(self, selector: str) -> list["Node"]:
        return [n for n in self.walk() if matches(n, selector)]

    def walk(self):
        for ch in self.children:
            yield ch
            yield from ch.walk()

    def plain_text(self) -> str:
        if self.tag == "#text":
            return self.text
        if self.tag in ALWAYS_DROP_TAGS:
            return ""
        return "".join(ch.plain_text() for ch in self.children)

    def __repr__(self) -> str:  # pragma: no cover - Debug-Hilfe
        return f"<Node {self.tag} {self.attrs}>"


class DomBuilder(HTMLParser):
    """Baut einen Mini-DOM. Robust gegen fehlende End-Tags."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("#root")
        self.stack: list[Node] = [self.root]

    def _append(self, node: Node) -> None:
        node.parent = self.stack[-1]
        self.stack[-1].children.append(node)

    def handle_starttag(self, tag, attrs):
        node = Node(tag, {k: (v if v is not None else "") for k, v in attrs})
        self._append(node)
        if tag not in VOID_TAGS:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self._append(Node(tag, {k: (v if v is not None else "") for k, v in attrs}))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                return
        # kein passender Start-Tag -> ignorieren

    def handle_data(self, data):
        if data:
            self._append(Node("#text", text=data))


def parse_html(text: str) -> Node:
    builder = DomBuilder()
    builder.feed(text)
    builder.close()
    return builder.root


# ---------------------------------------------------------------------------
# 2 · Selektoren  (Untermenge: "tag", ".klasse", "tag.klasse", "#id",
#     "tag#id", Komma-Listen)
# ---------------------------------------------------------------------------

_SEL_CACHE: dict[str, list[tuple[str | None, frozenset, str | None]]] = {}


def _parse_selector(selector: str):
    if selector in _SEL_CACHE:
        return _SEL_CACHE[selector]
    parsed = []
    for part in selector.split(","):
        part = part.strip()
        if not part:
            continue
        m = re.match(r"^([a-zA-Z0-9]+)?((?:[.#][A-Za-z0-9_\-]+)*)$", part)
        if not m:
            raise ValueError(f"Selektor nicht unterstuetzt: {part!r}")
        tag = m.group(1)
        classes, node_id = set(), None
        for token in re.findall(r"[.#][A-Za-z0-9_\-]+", m.group(2) or ""):
            if token[0] == ".":
                classes.add(token[1:])
            else:
                node_id = token[1:]
        parsed.append((tag, frozenset(classes), node_id))
    _SEL_CACHE[selector] = parsed
    return parsed


def matches(node: Node, selector: str) -> bool:
    if node.tag.startswith("#"):
        return False
    for tag, classes, node_id in _parse_selector(selector):
        if tag and node.tag != tag:
            continue
        if classes and not classes <= node.classes:
            continue
        if node_id and node.id != node_id:
            continue
        return True
    return False


def matches_any(node: Node, selectors) -> bool:
    return any(matches(node, s) for s in selectors)


# ---------------------------------------------------------------------------
# 3 · Konvertierungs-Kern
# ---------------------------------------------------------------------------

WS_RX = re.compile(r"[\s ]+")
MULTI_BLANK_RX = re.compile(r"\n{3,}")
MULTI_SPACE_RX = re.compile(r"[ \t]{2,}")


def squash(text: str) -> str:
    return WS_RX.sub(" ", text)


class Converter:
    """Generischer HTML->Markdown-Kern; das Verhalten steuert `cfg`."""

    def __init__(self, cfg: dict, dom: Node):
        self.cfg = cfg
        self.dom = dom
        self.drop = list(cfg.get("drop", []))
        self.headings: dict[str, int] = cfg.get("headings", {})
        self.heading_offset: int = int(cfg.get("heading_offset", 0))
        self.inline_sep: dict[str, str] = cfg.get("inline_sep", {})
        self.inline_join: dict[str, str] = cfg.get("inline_join", {})
        self.inline_wrap: dict[str, tuple] = cfg.get("inline_wrap", {})
        self.blockquotes = list(cfg.get("blockquote", []))
        self.custom: dict = cfg.get("custom", {})
        self.link_prefix = cfg.get("link_prefix", "../")
        # Der sichtbare "Diese Seite als Markdown"-Link im HTML-Footer zeigt auf
        # genau diese Datei — in der MD-Fassung waere er ein Selbstverweis.
        self.self_md = f"md/{cfg['basename']}.md" if cfg.get("basename") else ""

    # -- Hilfen -------------------------------------------------------------
    def is_dropped(self, node: Node) -> bool:
        if node.tag in ALWAYS_DROP_TAGS:
            return True
        if node.tag == "a" and self.self_md and node.get("href").strip() == self.self_md:
            return True
        return bool(self.drop) and matches_any(node, self.drop)

    def heading_level(self, node: Node) -> int | None:
        for cls in node.classes:
            if cls in self.headings:
                return self.headings[cls]
        if re.fullmatch(r"h[1-6]", node.tag):
            # `heading_offset` verschiebt NUR die echten h-Tags; per Klasse
            # gesetzte Ebenen (siehe `headings`) bleiben unberuehrt.
            return min(min(int(node.tag[1]), 4) + self.heading_offset, 6)
        return None

    def rewrite_url(self, url: str) -> str:
        url = (url or "").strip()
        if not url:
            return url
        if re.match(r"^(https?:|mailto:|tel:|data:|#|/)", url):
            return url
        return self.link_prefix + url

    # -- Inline -------------------------------------------------------------
    def inline(self, node: Node) -> str:
        """Rendert einen Knoten als Inline-Markdown."""
        if node.tag == "#text":
            return squash(node.text)
        if self.is_dropped(node):
            return ""
        for cls in node.classes:
            if cls in self.inline_wrap:
                pre, post = self.inline_wrap[cls]
                inner = self.inline_children(node).strip()
                return f"{pre}{inner}{post}" if inner else ""
        tag = node.tag
        if tag == "br":
            return " "
        if tag == "img":
            return self.image(node)
        inner = self.inline_children(node)
        if not inner.strip():
            return "" if tag != "a" else ""
        if tag in ("strong", "b"):
            return f"**{inner.strip()}**"
        if tag in ("em", "i", "cite"):
            return f"*{inner.strip()}*"
        if tag in ("code", "kbd", "samp", "tt"):
            return f"`{inner.strip()}`"
        if tag == "a":
            href = self.rewrite_url(node.get("href"))
            if not href:
                return inner
            return f"[{inner.strip()}]({href})"
        return inner

    def inline_children(self, node: Node) -> str:
        """Kinder als Inline-Text; verhindert verklebte Woerter."""
        join = None
        for cls in node.classes:
            if cls in self.inline_join:
                join = self.inline_join[cls]
                break

        parts: list[tuple[str, str, str]] = []  # (markdown, plaintext, sep_after)
        for ch in node.children:
            if ch.tag != "#text" and self.is_dropped(ch):
                continue
            md = self.inline(ch)
            if not md:
                continue
            plain = squash(ch.plain_text()) if ch.tag != "#text" else md
            sep = ""
            for cls in ch.classes:
                if cls in self.inline_sep:
                    sep = self.inline_sep[cls]
                    break
            parts.append((md, plain, sep))

        if join is not None:
            return join.join(p[0].strip() for p in parts if p[0].strip())

        out = ""
        prev_plain = ""
        pending_sep = ""
        for md, plain, sep in parts:
            if out and pending_sep:
                out = out.rstrip() + pending_sep
            elif out and not out.endswith(" ") and not md.startswith(" "):
                # "…</span>Text" wuerde sonst zu "…Text" verkleben
                if (prev_plain[-1:] or " ").isalnum() and (plain[:1] or " ").isalnum():
                    out += " "
            out += md.lstrip() if pending_sep else md
            pending_sep = sep
            prev_plain = plain.rstrip() or prev_plain
        return MULTI_SPACE_RX.sub(" ", out).strip()

    def image(self, node: Node) -> str:
        alt = squash(node.get("alt")).strip()
        src = self.rewrite_url(node.get("src"))
        return f"![{alt}]({src})"

    # -- Bloecke ------------------------------------------------------------
    def blocks(self, node: Node) -> list[str]:
        out: list[str] = []
        buf: list[Node] = []

        def flush():
            if not buf:
                return
            holder = Node("div")
            holder.children = list(buf)
            text = self.inline_children(holder)
            buf.clear()
            if text.strip():
                out.append(text.strip())

        for ch in node.children:
            if ch.tag == "#text":
                if ch.text.strip():
                    buf.append(ch)
                elif buf:
                    buf.append(ch)  # Leerraum zwischen Inline-Elementen halten
                continue
            if self.is_dropped(ch):
                continue

            handler = None
            for sel, fn in self.custom.items():
                if matches(ch, sel):
                    handler = fn
                    break
            if handler is not None:
                flush()
                res = handler(self, ch)
                if res:
                    out.append(res.strip())
                continue

            level = self.heading_level(ch)
            if level is not None:
                flush()
                text = self.inline_children(ch)
                if text.strip():
                    out.append("#" * level + " " + text.strip())
                continue

            if self.inline_join and (ch.classes & set(self.inline_join)):
                # Chip-/Meta-Leiste: alle Kinder in EINE Zeile
                flush()
                text = self.inline_children(ch)
                if text.strip():
                    out.append(text.strip())
                continue

            if self.blockquotes and matches_any(ch, self.blockquotes):
                flush()
                inner = "\n\n".join(self.blocks(ch)) or self.inline_children(ch)
                if inner.strip():
                    out.append(quote(inner.strip()))
                continue

            if ch.tag == "br":
                flush()
                continue

            if ch.tag in BLOCK_TAGS or ch.tag in ("figure", "table"):
                flush()
                out.extend(self.block(ch))
                continue

            buf.append(ch)

        flush()
        return [b for b in out if b.strip()]

    def block(self, node: Node) -> list[str]:
        tag = node.tag
        if tag == "hr":
            return ["---"]
        if tag == "figure":
            return self.figure(node)
        if tag == "table":
            return self.table(node)
        if tag in ("ul", "ol"):
            return self.list_block(node)
        if tag == "blockquote":
            inner = "\n\n".join(self.blocks(node))
            return [quote(inner)] if inner.strip() else []
        if tag == "pre":
            code = node.plain_text().strip("\n")
            return ["```\n" + code + "\n```"] if code.strip() else []
        if tag == "details":
            out = []
            summary = node.find("summary")
            if summary is not None:
                title = self.inline_children(summary).strip()
                if title:
                    out.append("### " + title)
            body = Node("div")
            body.children = [c for c in node.children if c.tag != "summary"]
            out.extend(self.blocks(body))
            return out
        if tag == "p":
            text = self.inline_children(node).strip()
            return [text] if text else []
        # Container: div, section, main, header, footer, nav, article, aside …
        return self.blocks(node)

    def figure(self, node: Node) -> list[str]:
        img = node.find("img")
        cap_node = node.find("figcaption")
        caption = self.inline_children(cap_node).strip() if cap_node is not None else ""
        out: list[str] = []
        if img is not None:
            alt = squash(img.get("alt")).strip()
            if not alt:
                # alt="" ist auf den Doku-Seiten die Regel — Bildunterschrift
                # ist dann der beste verfuegbare Alternativtext.
                alt = strip_md(caption) or "Abbildung"
                caption = ""
            out.append(f"![{alt}]({self.rewrite_url(img.get('src'))})")
        if caption:
            out.append(f"*{caption}*")
        rest = Node("div")
        rest.children = [c for c in node.children
                         if c is not img and c is not cap_node and c.tag != "figcaption"]
        out.extend(self.blocks(rest))
        return out

    def list_block(self, node: Node, depth: int = 0) -> list[str]:
        ordered = node.tag == "ol"
        lines: list[str] = []
        idx = 0
        if ordered and node.get("start").strip().isdigit():
            # <ol start="6"> setzt eine unterbrochene Nummerierung fort.
            idx = max(int(node.get("start")) - 1, 0)
        for li in node.children:
            if li.tag != "li" or self.is_dropped(li):
                continue
            idx += 1
            marker = f"{idx}. " if ordered else "- "
            nested: list[str] = []
            body = Node("div")
            for ch in li.children:
                if ch.tag in ("ul", "ol"):
                    nested.extend(self.list_block(ch, depth + 1))
                else:
                    body.children.append(ch)
            blocks = self.blocks(body)
            text = " ".join(b.replace("\n", " ") for b in blocks).strip()
            text = MULTI_SPACE_RX.sub(" ", text)
            pad = "  " * depth
            if text:
                lines.append(pad + marker + text)
            elif nested:
                lines.append(pad + marker.rstrip())
            lines.extend(nested)
        return ["\n".join(lines)] if lines else []

    def table(self, node: Node) -> list[str]:
        rows: list[tuple[bool, list[str]]] = []
        for tr in node.find_all("tr"):
            cells, header = [], False
            for cell in tr.children:
                if cell.tag not in ("td", "th"):
                    continue
                if cell.tag == "th":
                    header = True
                text = self.inline_children(cell).replace("\n", " ").strip()
                cells.append(text.replace("|", "\\|"))
            if cells:
                rows.append((header, cells))
        if not rows:
            return []
        head = rows[0][1]
        body = [r[1] for r in rows[1:]]
        width = max(len(r) for _, r in rows)
        head = head + [""] * (width - len(head))
        lines = ["| " + " | ".join(head) + " |",
                 "|" + "|".join([" --- "] * width) + "|"]
        for cells in body:
            cells = cells + [""] * (width - len(cells))
            lines.append("| " + " | ".join(cells) + " |")
        return ["\n".join(lines)]


def quote(text: str) -> str:
    return "\n".join(("> " + line).rstrip() for line in text.split("\n"))


def strip_md(text: str) -> str:
    """Markdown-Auszeichnung aus einem String entfernen (fuer alt-Texte)."""
    text = re.sub(r"!\[([^\]]*)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"[*`_]", "", text)
    return text.replace("[", "").replace("]", "").strip()


# ---------------------------------------------------------------------------
# 4 · Custom-Handler  (seitenspezifisch, in der Registry referenziert)
#     Signatur: fn(conv: Converter, node: Node) -> str  (Markdown-Block)
# ---------------------------------------------------------------------------

def h_steps_grid(conv: Converter, node: Node) -> str:
    """`.steps-grid` (3 nummerierte Karten) -> nummerierte Liste."""
    items = []
    for step in node.children:
        if step.tag != "div" or "step" not in step.classes:
            continue
        head = step.find("h3")
        title = conv.inline_children(head).strip() if head is not None else ""
        body = Node("div")
        body.children = [c for c in step.children
                         if c is not head and "step-n" not in c.classes]
        text = " ".join(conv.blocks(body)).strip()
        items.append(f"**{title}** — {text}" if title else text)
    return "\n".join(f"{i}. {t}" for i, t in enumerate(items, 1))


def h_tiles(conv: Converter, node: Node) -> str:
    """`.tiles` (Karten-Grid mit Thumbnails) -> flache Linkliste."""
    lines = []
    for tile in node.children:
        if tile.tag != "a":
            continue
        href = conv.rewrite_url(tile.get("href"))
        head = tile.find("h3")
        title = conv.inline_children(head).strip() if head is not None else href
        eyebrow_node = tile.find(".tile-eyebrow")
        eyebrow = conv.inline_children(eyebrow_node).strip() if eyebrow_node is not None else ""
        desc_node = tile.find("p")
        desc = conv.inline_children(desc_node).strip() if desc_node is not None else ""
        parts = [f"**[{title}]({href})**"]
        if eyebrow:
            parts.append(eyebrow)
        line = " · ".join(parts)
        if desc:
            line += f" — {desc}"
        lines.append("- " + line)
    return "\n".join(lines)


def h_download_button(conv: Converter, node: Node) -> str:
    """Download-Button -> Satz mit absoluter URL (Buttons sind in MD nutzlos)."""
    href = node.get("href").lstrip("./")
    label = "Download" if conv.cfg.get("lang") == "de" else "Download"
    return f"**{label}:** {SITE}/{href}"


def h_agent_button(conv: Converter, node: Node) -> str:
    """Agent-Guide-Button -> Satz mit relativem und absolutem Link."""
    href = node.get("href").lstrip("./")
    if conv.cfg.get("lang") == "de":
        return (f"**Agent-Guide:** [{href}]({conv.link_prefix}{href}) · "
                f"absolut: {SITE}/{href}")
    return (f"**Agent guide:** [{href}]({conv.link_prefix}{href}) · "
            f"absolute: {SITE}/{href}")


# -- Post-Seiten (ki-entwicklung-zehn-tage, prototyping-pnl-treiberbaum, …) --

def h_figure(conv: Converter, node: Node) -> str:
    """<figure> mit Bildunterschrift — robuster als der generische Zweig.

    Deckt drei Faelle ab, an denen `Converter.figure()` scheitert:
    1. die Unterschrift steht in `<div class="figure-cap">` statt <figcaption>,
    2. das Medium liegt eine Ebene tiefer (`.figure-embed`) — der generische
       Zweig gaebe das Bild dann zweimal aus,
    3. `<video>` statt `<img>` (wird zur Link-Zeile).
    Ausserdem: Unterschriften, die mit **fett** beginnen, werden nicht zusaetzlich
    kursiv gesetzt — das ergaebe das mehrdeutige "***".
    """
    out: list[str] = []
    cap_node = node.find(".figure-cap") or node.find("figcaption")
    caption = conv.inline_children(cap_node).strip() if cap_node is not None else ""
    img = node.find("img")
    video = node.find("video")
    if img is not None:
        alt = squash(img.get("alt")).strip() or strip_md(caption) or "Abbildung"
        out.append(f"![{alt}]({conv.rewrite_url(img.get('src'))})")
    elif video is not None:
        label = "Demo-Video" if conv.cfg.get("lang") == "de" else "Demo video"
        out.append(f"**{label}:** {conv.rewrite_url(video.get('src'))}")
        poster = video.get("poster")
        if poster:
            word = "Standbild" if conv.cfg.get("lang") == "de" else "Poster frame"
            out.append(f"**{word}:** {conv.rewrite_url(poster)}")
    if caption:
        # Die Bildunterschriften beginnen fast alle mit einem **fetten** Vorspann;
        # ein zusaetzliches Kursiv-Paar daraus machte "***…" (mehrdeutig).
        out.append(caption if caption.startswith("**") else f"*{caption}*")
    return "\n\n".join(out)


def h_note_box(conv: Converter, node: Node) -> str:
    """`.example` · `.trap` · `.tip` — Kasten aus <strong>Label</strong> + Fliesstext.

    Ohne Doppelpunkt klebte das Label am ersten Satz ("**Praxis-Beispiel** Du …").
    """
    label, label_node = "", None
    for ch in node.children:
        if ch.tag == "#text" and ch.text.strip():
            break
        if ch.tag in ("strong", "b"):
            label_node = ch
            label = conv.inline_children(ch).strip()
            break
    rest = Node("div")
    rest.children = [c for c in node.children if c is not label_node]
    blocks = conv.blocks(rest)
    if label:
        sep = "" if label[-1] in ".:!?…—-" else ":"
        head = f"**{label}{sep}**"
        # Nur vor Fliesstext einruecken — vor Code-Fence, Liste oder Tabelle
        # muss das Label eine eigene Zeile bleiben.
        if blocks and re.match(r"[^`|>#\-]", blocks[0]) and not re.match(r"\d+\. ", blocks[0]):
            blocks[0] = f"{head} {blocks[0]}"
        else:
            blocks.insert(0, head)
    return quote("\n\n".join(b for b in blocks if b.strip()))


def h_step_card(conv: Converter, node: Node) -> str:
    """`.step` — nummerierte Schrittkarte: Nummer-Div, h3 mit Badge-<span>, Text."""
    num_node = node.find(".step-num")
    num = squash(num_node.plain_text()).strip() if num_node is not None else ""
    head = node.find("h3")
    title, badge = "", ""
    if head is not None:
        span = head.find("span")
        if span is not None:
            badge = conv.inline_children(span).strip()
        rest = Node("h3")
        rest.children = [c for c in head.children if c is not span]
        title = conv.inline_children(rest).strip()
    line = "### " + (f"{num} · " if num else "") + title
    if badge:
        line += f" — {badge}"
    out = [line.strip()]
    for p in node.find_all("p"):
        text = conv.inline_children(p).strip()
        if text:
            out.append(text)
    return "\n\n".join(out)


# -- business-chart-builder-anleitung ---------------------------------------

def h_live_link(conv: Converter, node: Node) -> str:
    """`a.live` — Live-Beispiel oder Download.

    Die Live-Links tragen die komplette Chart-Konfiguration als komprimierten
    `#s=`-Hash (1–2 KB Base64 pro Link). In der MD-Fassung waere das Muell, also
    bleibt nur die Basis-URL stehen plus ein Hinweis, wo der Permalink steht.
    """
    href = node.get("href").strip()
    label = conv.inline_children(node).strip()
    label = re.sub(r"^(?:[▶⬇]\s*)?(?:Live|Demo)\s*:\s*", "", label).strip("▶⬇ ").strip()
    de = conv.cfg.get("lang") == "de"
    if "#s=" in href:
        base = href.split("#s=")[0]
        note = ("Konfiguration steckt im Permalink der HTML-Fassung" if de
                else "configuration lives in the permalink of the HTML version")
        head = "Live-Beispiel" if de else "Live example"
        return f"**{head}:** {label} — {base} ({note})"
    return f"**Download:** [{label}]({conv.rewrite_url(href)})"


# -- powerbi_praxis_pfad -----------------------------------------------------

def h_shot_figure(conv: Converter, node: Node) -> str:
    """`figure.pp-shot` — Screenshot; alt-Text und <figcaption> sind identisch.

    Der generische Zweig wuerde beide ausgeben und damit jeden Screenshot-Text
    verdoppeln.
    """
    img = node.find("img")
    if img is None:
        return ""
    cap_node = node.find("figcaption")
    caption = squash(cap_node.plain_text()).strip() if cap_node is not None else ""
    alt = squash(img.get("alt")).strip() or caption or "Screenshot"
    out = [f"![{alt}]({conv.rewrite_url(img.get('src'))})"]
    if caption and caption != alt:
        out.append(f"*{caption}*")
    return "\n\n".join(out)


_PP_LIST_BREAK = re.compile(r"\n(?=[ \t]*(?:\d{1,2}\.|-)[ \t])")


def h_pp_paragraph(conv: Converter, node: Node) -> str:
    """Absaetze, in denen im Quelltext eine Liste als Klartext steckt.

    Im Praxis-Pfad sind einige Fortsetzungs-Aufzaehlungen im HTML in einem <p>
    gelandet (Zeilenumbrueche statt <li>) — der Browser macht daraus eine
    Bleiwueste ("… auf OK. 4. Jetzt fragt Power BI … 5. Du siehst …"). Fuer die
    MD-Fassung stellen wir die Zeilenstruktur wieder her; alle anderen Absaetze
    laufen unveraendert durch.
    """
    if not _PP_LIST_BREAK.search(node.plain_text()):
        return conv.inline_children(node).strip()

    groups: list[list[Node]] = [[]]
    for ch in node.children:
        if ch.tag == "#text" and _PP_LIST_BREAK.search(ch.text):
            pieces = _PP_LIST_BREAK.split(ch.text)
            groups[-1].append(Node("#text", text=pieces[0]))
            for piece in pieces[1:]:
                groups.append([Node("#text", text=piece)])
        else:
            groups[-1].append(ch)

    rendered = []
    for group in groups:
        holder = Node("div")
        holder.children = group
        text = conv.inline_children(holder).strip()
        if text:
            rendered.append(text)
    if not rendered:
        return ""
    lead, items = rendered[0], rendered[1:]
    if not items:
        return lead
    return lead + "\n\n" + "\n".join(items)


# -- Einsteiger-Guides (Power BI · Fabric) -----------------------------------
#
# Beide Guides sind Klick-Erkundungen: die Seite zeigt nur Karten-Kacheln, der
# eigentliche Inhalt (87 bzw. 43 Detail-Karten) liegt als HTML-Bausteine in
# einem `const DETAILS = {…}`-Objekt im <script> und wird per Klick in ein Modal
# gerendert. Ohne diese Aufloesung waere die MD-Fassung eine leere Huelle.

GUIDE_CARD_CONTAINERS = [
    ".arch-flow", ".card-grid", ".col-body", ".star-grid-inner",
    ".star-aside", ".success-wheel", ".notation-grid",
]

_DETAILS_CACHE: dict[str, dict] = {}

_DETAILS_RX = re.compile(
    r"'(?P<key>[A-Za-z0-9_-]+)':\s*\{\s*"
    r"eyebrow:\s*'(?P<eyebrow>(?:[^'\\]|\\.)*)',\s*"
    r"title:\s*'(?P<title>(?:[^'\\]|\\.)*)',\s*"
    r"body:\s*`(?P<body>(?:[^`\\]|\\.)*)`\s*\}",
    re.S,
)

_JS_ESCAPES = {"n": "\n", "t": "\t", "r": "\r"}


def js_unescape(text: str) -> str:
    return re.sub(r"\\(.)", lambda m: _JS_ESCAPES.get(m.group(1), m.group(1)), text)


def guide_details(conv: Converter) -> dict[str, dict]:
    base = conv.cfg["basename"]
    if base not in _DETAILS_CACHE:
        src = (ROOT / f"{base}.html").read_text(encoding="utf-8")
        block = re.search(r"const DETAILS = \{(.*?)\n\};", src, re.S)
        found: dict[str, dict] = {}
        if block:
            for m in _DETAILS_RX.finditer(block.group(1)):
                found[m.group("key")] = {
                    # eyebrow/title sind JS-Strings mit HTML-Entities ("&amp;"),
                    # landen aber direkt in der Ueberschrift statt im Parser.
                    "eyebrow": html_mod.unescape(js_unescape(m.group("eyebrow"))).strip(),
                    "title": html_mod.unescape(js_unescape(m.group("title"))).strip(),
                    "body": js_unescape(m.group("body")),
                }
        _DETAILS_CACHE[base] = found
    return _DETAILS_CACHE[base]


def _first_visible(children) -> "Node | None":
    for ch in children:
        if ch.tag == "#text" and not ch.text.strip():
            continue
        return ch
    return None


def guide_card_level(conv: Converter, node: Node) -> int:
    """Ebene der Karten-Ueberschriften: 3, sonst 4 unter einer h3-Gruppe.

    Manche Karten-Container haengen unter einer eigenen Gruppenueberschrift
    (Pipeline-Spalte, Stern-Seitenspalte, die SUCCESS-/Notations-Gruppen im
    Viz-Kapitel) — dort muessen die Karten eine Ebene tiefer stehen.
    """
    inner = _first_visible(node.children)
    if inner is not None and conv.heading_level(inner) == 3:
        return 4
    parent = node.parent
    if parent is None:
        return 3
    preceding = []
    for ch in parent.children:
        if ch is node:
            break
        if ch.tag == "#text" and not ch.text.strip():
            continue
        preceding.append(ch)
    for ch in reversed(preceding):
        level = conv.heading_level(ch)
        if level is not None:
            return 4 if level == 3 else 3
        if matches_any(ch, GUIDE_CARD_CONTAINERS):
            return 3
    return 3


_EPISODES_CACHE: dict[str, dict] = {}

_EPI_KEY_RX = re.compile(r"'(?P<key>[A-Za-z0-9_-]+)':\s*\[(?P<rows>.*?)\n\s*\],", re.S)
_EPI_ROW_RX = re.compile(
    r"\[\s*'(?P<id>(?:[^'\\]|\\.)*)',\s*"
    r"'(?P<eyebrow>(?:[^'\\]|\\.)*)',\s*"
    r"'(?P<title>(?:[^'\\]|\\.)*)'(?P<external>\s*,\s*true)?\s*,?\s*\]",
    re.S,
)


def guide_episodes(conv: Converter) -> dict[str, list]:
    """`const EPISODE_LINKS = {…}` — Daten-WG-Folgen, die das Modal je Karte anhaengt."""
    base = conv.cfg["basename"]
    if base not in _EPISODES_CACHE:
        src = (ROOT / f"{base}.html").read_text(encoding="utf-8")
        block = re.search(r"const EPISODE_LINKS = \{(.*?)\n\};", src, re.S)
        found: dict[str, list] = {}
        if block:
            for m in _EPI_KEY_RX.finditer(block.group(1)):
                rows = []
                for r in _EPI_ROW_RX.finditer(m.group("rows")):
                    rows.append({
                        "id": js_unescape(r.group("id")),
                        "eyebrow": html_mod.unescape(js_unescape(r.group("eyebrow"))),
                        "title": html_mod.unescape(js_unescape(r.group("title"))),
                        "external": bool(r.group("external")),
                    })
                if rows:
                    found[m.group("key")] = rows
        _EPISODES_CACHE[base] = found
    return _EPISODES_CACHE[base]


def render_episodes(conv: Converter, key: str) -> list[str]:
    rows = guide_episodes(conv).get(key)
    if not rows:
        return []
    de = conv.cfg.get("lang") != "en"
    head = "**Daten-WG dazu:**" if de else "**Daten-WG on this topic:**"
    lines = []
    for row in rows:
        parts = [f"**[{row['title']}](https://youtu.be/{row['id']})**"]
        if row["eyebrow"]:
            parts.append(row["eyebrow"])
        if not row["external"]:
            parts.append(f"[Knowledge Kitchen]({conv.link_prefix}index.html#ep-{row['id']})")
        lines.append("- " + " · ".join(parts))
    return [head, "\n".join(lines)]


def h_guide_cards(conv: Converter, node: Node) -> str:
    """Karten-Container -> je Karte ein Abschnitt mit dem vollen Detail-Inhalt."""
    details = guide_details(conv)
    seen: set = conv.__dict__.setdefault("_guide_seen", set())
    de = conv.cfg.get("lang") != "en"
    level = guide_card_level(conv, node)
    hashes = "#" * level
    out: list[str] = []
    buf: list[Node] = []

    def flush():
        if buf:
            holder = Node("div")
            holder.children = list(buf)
            buf.clear()
            out.extend(conv.blocks(holder))

    for ch in node.children:
        key = ch.get("data-key") if ch.tag == "button" else ""
        if not key:
            buf.append(ch)
            continue
        flush()
        entry = details.get(key)
        if entry is None:
            continue
        title = entry["title"]
        if key in seen:
            again = (f"{hashes} {title}\n\nSiehe den gleichnamigen Abschnitt weiter oben."
                     if de else
                     f"{hashes} {title}\n\nSee the section of the same name above.")
            out.append(again)
            continue
        seen.add(key)
        out.append(f"{hashes} {title}")
        if entry["eyebrow"]:
            out.append(f"*{entry['eyebrow']}*")
        # Was auf der Kachel steht und NICHT im Detail wiederkehrt (z. B. die
        # Spaltenlisten des Stern-Schemas) — der Rest der Kachel ist gedroppt.
        # Die Spaltenlisten trennen teils selbst schon mit "·".
        out.extend(re.sub(r"·\s+·", "·", b) for b in conv.blocks(ch))
        # Die <h4> im Detail-Rumpf liegen genau eine Ebene unter der Karte.
        saved = conv.heading_offset
        conv.heading_offset = saved + level - 3
        try:
            out.extend(conv.blocks(node_from_html(entry["body"])))
        finally:
            conv.heading_offset = saved
        out.extend(render_episodes(conv, key))
    flush()
    return "\n\n".join(b for b in out if b.strip())


def node_from_html(fragment: str) -> Node:
    return parse_html(fragment)


def h_hero_block(conv: Converter, node: Node) -> str:
    """`.hero-block` — grosse Kennzahl + Label + Fliesstext.

    Zahl und Label stehen als zwei Divs nebeneinander und wuerden sonst zu zwei
    zusammenhanglosen Ein-Wort-Absaetzen.
    """
    out: list[str] = []
    stat = node.find(".hero-stat")
    if stat is not None:
        label = node.find(".hero-stat-label")
        num = squash(stat.plain_text()).strip()
        lbl = squash(label.plain_text()).strip() if label is not None else ""
        out.append(f"**{num}** — {lbl}" if lbl else f"**{num}**")
    for ch in node.children:
        if ch.tag == "#text" or conv.is_dropped(ch):
            continue
        out.extend(conv.blocks(ch))
    return "\n\n".join(b for b in out if b.strip())


def h_journey_steps(conv: Converter, node: Node) -> str:
    """`.journey-steps` — Etappen-Navigation als schlichte Inhaltsuebersicht.

    Die `#anchor`-Links haben in der MD-Fassung kein Ziel, der Ueberblick ueber
    die Sektionen ist aber wertvoll — also Text statt Link.
    """
    lines = []
    for step in node.children:
        if step.tag != "a":
            continue
        num = step.find(".journey-step-num")
        name = step.find(".journey-step-name")
        num_t = squash(num.plain_text()).strip() if num is not None else ""
        name_t = squash(name.plain_text()).strip() if name is not None else ""
        if name_t:
            lines.append(f"- **{name_t}**" + (f" — {num_t}" if num_t else ""))
    return "\n".join(lines)


def h_dwg_folgen(conv: Converter, node: Node) -> str:
    """`.dwg-folgen-list` — verlinkte Daten-WG-Folgen als Liste."""
    lines = []
    for folge in node.children:
        if folge.tag != "div" or "dwg-folge" not in folge.classes:
            continue
        title_n = folge.find(".dwg-folge-title")
        eyebrow_n = folge.find(".dwg-folge-eyebrow")
        yt = folge.find("a.dwg-folge-yt")
        page = folge.find("a.dwg-folge-link")
        title = squash(title_n.plain_text()).strip() if title_n is not None else ""
        eyebrow = squash(eyebrow_n.plain_text()).strip() if eyebrow_n is not None else ""
        if not title:
            continue
        href = (yt.get("href") if yt is not None else "") or ""
        item = f"**[{title}]({href})**" if href else f"**{title}**"
        parts = [item]
        if eyebrow:
            parts.append(eyebrow)
        if page is not None and page.get("href"):
            parts.append(f"[Knowledge Kitchen]({conv.rewrite_url(page.get('href'))})")
        lines.append("- " + " · ".join(parts))
    return "\n".join(lines)


# -- Code-Bloecke ------------------------------------------------------------

_LANG_M = re.compile(
    r"\b(?:Table|List|Text|Record|Csv|Json|Web|Sql|Excel|Folder|Number|Date|"
    r"DateTime|Duration|Replacer|Splitter|Binary|Value|Lines|Character)\.[A-Z]\w*\s*\(")
_LANG_DAX = re.compile(
    r"\b(?:VAR|RETURN|CALCULATE|CALCULATETABLE|SUMX|AVERAGEX|MAXX|MINX|COUNTROWS|"
    r"DIVIDE|TOTALYTD|TOTALQTD|TOTALMTD|SAMEPERIODLASTYEAR|DATESINPERIOD|DATESYTD|"
    r"EVALUATE|SUMMARIZECOLUMNS|USERELATIONSHIP|USERPRINCIPALNAME|LOOKUPVALUE|"
    r"IFERROR|SELECTEDVALUE|ALLEXCEPT|ALLSELECTED|IF|SWITCH|FORMAT|SUM|RELATED)\s*[\(\[ ]")


def sniff_code_lang(code: str) -> str:
    """Sprache eines Code-Blocks raten. Im Zweifel lieber kein Tag als ein falsches."""
    s = code.strip()
    if not s:
        return ""
    if s.startswith("{") and '":' in s:
        return "json"
    if re.match(r"^\s*let\b", s) or _LANG_M.search(s):
        return "powerquery"
    if re.match(r"^\s*(SELECT|WITH)\b", s, re.I) and re.search(r"\bFROM\b", s, re.I):
        return "sql"
    if _LANG_DAX.search(s):
        return "dax"
    if re.match(r"^\s*(//|\[)", s) and "=" in s:
        return "dax"
    if re.match(r"^[^\n=]{1,60}=\s*[^=\s]", s) and re.search(r"\[[A-Za-zÄÖÜ]", s):
        return "dax"
    return ""


def h_code(conv: Converter, node: Node) -> str:
    """`<pre>` -> ```-Fence samt geratener Sprache (DAX · M · SQL · JSON)."""
    code = node.plain_text().strip("\n").rstrip()
    if not code.strip():
        return ""
    fence = "```" if "```" not in code else "````"
    return f"{fence}{sniff_code_lang(code)}\n{code}\n{fence}"


# ---------------------------------------------------------------------------
# 5 · Seiten-Registry
# ---------------------------------------------------------------------------
#
# JEDER EINTRAG = EINE SEITE.  Neue Seite hinzufuegen heisst: hier einen Dict
# anhaengen — am Kern (Converter) muss nichts geaendert werden.
#
#   basename      Dateiname ohne .html; bestimmt Quelle (<basename>.html),
#                 Ziel (md/<basename>.md) und die kanonische URL im Kopfblock.
#   title         Ueberschrift der MD-Datei (H1). Ohne Angabe: <title> der Seite.
#   lang          "de" | "en" — steuert nur den Wortlaut des Kopfblocks.
#   root          Selektor des Inhalts-Wurzelknotens (Default: "body").
#   drop          Selektoren, die komplett entfallen (Navigation, Chips,
#                 Deko-Icons, Thumbnails …). script/style/svg/button/form usw.
#                 fliegen ohnehin immer raus.
#   headings      Klasse -> Ueberschriftenebene. Noetig fuer <div>s, die optisch
#                 Ueberschriften sind (z. B. .grp-h), oder um die Ebene eines
#                 h-Tags zu korrigieren.
#   heading_offset Verschiebt ALLE echten h-Tags um n Ebenen (h2 -> h3 bei 1).
#                 Fuer Seiten, die h2 als Absatz-Ueberschrift innerhalb eines
#                 Kapitels benutzen. Per `headings` gesetzte Ebenen bleiben.
#   inline_wrap   Klasse -> (Praefix, Suffix) um ein Inline-Element herum, z. B.
#                 Evidenz-Badges: <span class="ev">S</span> -> "[Evidenz: S]".
#   inline_sep    Klasse -> Trenner, der NACH diesem Inline-Element eingefuegt
#                 wird (z. B. Nummern-Badge .snum -> " · ").
#   inline_join   Klasse eines Containers -> Trenner, mit dem seine Kinder zu
#                 EINER Zeile verbunden werden (Chip-/Meta-Leisten).
#   blockquote    Selektoren, die als Zitatblock ("> …") gerendert werden.
#   custom        Selektor -> Handler-Funktion (siehe Abschnitt 4). Fuer alles,
#                 wo der generische Kern Murks liefert (Karten-Grids, Buttons).
#   append_md     Fester Markdown-Block, der ans Ende gehaengt wird.
#   version_json  Optional: JSON-Datei mit {"version":…,"date":…}; die statisch
#                 im HTML stehenden (per JS ersetzten) Werte werden dadurch
#                 aktualisiert. `version_ids` nennt die betroffenen Element-IDs.
#
# Selektor-Syntax: "tag", ".klasse", "tag.klasse", "#id", "tag#id",
# Komma-Listen ("nav, .topbar"). Bewusst simpel gehalten.

DOKU_DROP = [
    ".topbar",       # Zurueck-/Sprach-/PDF-Pills = Seiten-Chrome
    "h1",            # H1 liefert der Kopfblock
]

DOKU_COMMON = {
    "root": ".wrap",
    "drop": DOKU_DROP,
    "headings": {
        "toc-t": 2,      # <div class="toc-t">Inhalt</div>
        "mode-head": 3,  # <div class="mode-head"><span>01</span><h3>Saeulen</h3></div>
        "card-h": 3,     # Format-Karte
        "grp-h": 4,      # Untergruppe innerhalb einer Format-Karte
    },
    "inline_sep": {
        "snum": " · ",       # Kapitelnummer vor dem H2-Text
        "mode-n": " · ",     # Modus-Nummer vor dem Modus-Titel
        "pbi-badge": ": ",   # "So sieht es in Power BI Desktop aus" + Text
    },
    "inline_join": {
        "meta": " · ",       # Version · Stand · IBCS-inspired
    },
    "blockquote": [".notebox", ".ibcs"],
}

SCHNELLSTART_COMMON = {
    "root": ".wrap",
    "drop": [
        ".topbar",      # Seiten-Chrome
        "h1",           # H1 liefert der Kopfblock
        ".dl-icon",     # reines Emoji-Icon
        ".tile-thumb",  # Thumbnails, die Bilder stehen in der Doku
        ".tile-go",     # "Oeffnen →"-Pfeil einer klickbaren Karte
    ],
    "headings": {
        "dl-title": 3,
    },
    "inline_join": {
        "chips": " · ",
        "meta": " · ",
    },
    "inline_sep": {
        "snum": " · ",
        "pbi-badge": " · ",  # Badge ist hier nur das Wort "Power BI"
    },
    "blockquote": [".dl-beta", ".ibcs"],
    "custom": {
        "a#dl-btn": h_download_button,
        "a.gate-btn": h_agent_button,   # greift nur noch fuer den Agent-Guide
        ".steps-grid": h_steps_grid,
        ".tiles": h_tiles,
    },
    "version_json": "downloads/latest.json",
    "version_ids": {"dl-version": "version", "ck-version": "version", "dl-date": "date"},
}

# --- Einsteiger-Guides (Power BI v4 · Fabric v1) ----------------------------
# Beide Seiten teilen dasselbe Geruest: Sektionen mit Karten-Kacheln, der
# Inhalt der Kacheln kommt aus `const DETAILS = {…}` (siehe h_guide_cards).
# Karten-Container -> Detail-Abschnitte; die Kachel-Beschriftungen selbst
# fliegen raus, weil Titel/Eyebrow/Teaser im Detail-Datensatz stehen.

GUIDE_COMMON = {
    "root": ".container",
    "drop": [
        "nav",                       # Sticky-Topnav = Seiten-Chrome
        "h1",                        # H1 liefert der Kopfblock
        ".read-progress",            # Lesefortschritt (JS-Zustand)
        ".author-avatar", ".author-footer-avatar",   # Initialen-Kreis
        ".start-here-icon", ".col-icon",             # Deko
        ".section-hint", ".beispiele-num", ".beispiele-hint",
        ".rel-label",                # Beziehungs-Labels im Stern-Diagramm
        ".beispiel-frame",           # iframe-Rahmen; Link steht in .beispiel-meta
        ".url",                      # Klartext-URL neben dem Quellen-Link
        # Kachel-Beschriftungen — stehen alle im DETAILS-Datensatz:
        ".card-eyebrow", ".card-title", ".card-desc", ".card-more",
        ".arch-box-meta", ".arch-box-title",
        ".item-marker", ".item-body",
        ".dim-title", ".fact-title", ".aside-meta",
        ".success-big", ".success-name",
        ".notation-card-title", ".notation-card-meaning", ".notation-card-desc",
        ".hero-stat", ".hero-stat-label",             # h_hero_block baut daraus eine Zeile
        ".arch-arrow",               # Pfeil-Deko zwischen den Architektur-Kacheln
        ".footer-nav-sep",           # "·" als eigenes Element in der Fussleiste
    ],
    "headings": {
        "section-head": 2,
        "start-here-title": 2,
        "journey-title": 2,
        "beispiele-head": 2,
        "sources-title": 2,
        "col-header": 3,
        "sources-group-label": 3,
        "dwg-folgen-block-head": 3,
        "beispiel-title": 3,
    },
    "inline_sep": {
        "section-num": " · ",
        "start-with-label": ": ",
        "col-num": " · ",
        "dwg-folgen-block-eyebrow": " · ",
        "rls-role": " · ",
    },
    "inline_join": {
        "header-meta": " · ",
        "author-card": " · ",
        "author-footer": " · ",
        "author-footer-info": " · ",
        "author-info": " · ",
        "dim-cols": " · ",
        "fact-cols": " · ",
        "beispiel-meta": " · ",
        "footer-nav": " · ",
        "rls-row": " · ",
    },
    "blockquote": [".start-with"],
    "custom": {
        **{sel: h_guide_cards for sel in GUIDE_CARD_CONTAINERS},
        ".example": h_note_box,
        ".trap": h_note_box,
        ".tip": h_note_box,
        "figure": h_figure,
        ".journey-steps": h_journey_steps,
        ".dwg-folgen-list": h_dwg_folgen,
        ".hero-block": h_hero_block,
        "pre": h_code,
    },
}

# --- Post-Seiten (gemeinsames Layout: .container > header + .prose) ---------

POST_COMMON = {
    "root": ".container",
    "drop": [
        ".back-link",     # "Zurueck zur Knowledge Kitchen"
        ".lang-switch",   # DE/EN-Umschalter; Verweis steht in append_md
        "h1",             # H1 liefert der Kopfblock
    ],
    "headings": {
        "li-head": 3,     # <div class="li-head"><span>LinkedIn-Post</span><button>…
    },
    "inline_join": {
        "post-meta": " · ",
        "bigstat": " — ",
        "cta-actions": " · ",
    },
    "blockquote": [".src-box"],
    "custom": {
        ".figure": h_figure,
        ".step": h_step_card,
        "pre": h_code,
    },
}


PAGES: list[dict] = [
    {
        **DOKU_COMMON,
        "basename": "chartkitchen-doku",
        "lang": "de",
        "title": "ChartKitchen byDatenWG — Dokumentation",
        "append_md": (
            "---\n\n"
            "## Weitere Fassungen dieser Seite\n\n"
            "- HTML (maßgeblich): https://datenwgknowledgekitchen.com/chartkitchen-doku.html\n"
            "- PDF: [chartkitchen-doku.pdf](../chartkitchen-doku.pdf)\n"
            "- Englisch: [chartkitchen-doku_en.html](../chartkitchen-doku_en.html) · "
            "[chartkitchen-doku_en.md](chartkitchen-doku_en.md)\n"
            "- Schnellstart: [chartkitchen-schnellstart.html](../chartkitchen-schnellstart.html) · "
            "[chartkitchen-schnellstart.md](chartkitchen-schnellstart.md)\n"
            "- Referenz für KI-Agenten (Datenvertrag, alle Format-Properties): "
            "[ibcsInspiredChartDeck/AGENT-GUIDE.md](../ibcsInspiredChartDeck/AGENT-GUIDE.md)\n"
        ),
    },
    {
        **DOKU_COMMON,
        "basename": "chartkitchen-doku_en",
        "lang": "en",
        "title": "ChartKitchen byDatenWG — Documentation",
        "append_md": (
            "---\n\n"
            "## Other versions of this page\n\n"
            "- HTML (authoritative): https://datenwgknowledgekitchen.com/chartkitchen-doku_en.html\n"
            "- PDF: [chartkitchen-doku_en.pdf](../chartkitchen-doku_en.pdf)\n"
            "- German: [chartkitchen-doku.html](../chartkitchen-doku.html) · "
            "[chartkitchen-doku.md](chartkitchen-doku.md)\n"
            "- Quick start: [chartkitchen-schnellstart_en.html](../chartkitchen-schnellstart_en.html) · "
            "[chartkitchen-schnellstart_en.md](chartkitchen-schnellstart_en.md)\n"
            "- Reference for AI agents (data contract, all format properties): "
            "[ibcsInspiredChartDeck/AGENT-GUIDE.md](../ibcsInspiredChartDeck/AGENT-GUIDE.md)\n"
        ),
    },
    {
        **SCHNELLSTART_COMMON,
        "basename": "chartkitchen-schnellstart",
        "lang": "de",
        "title": "ChartKitchen byDatenWG — Schnellstart",
    },
    {
        **SCHNELLSTART_COMMON,
        "basename": "chartkitchen-schnellstart_en",
        "lang": "en",
        "title": "ChartKitchen byDatenWG — Quick Start",
    },

    # --- Lern-Guides -------------------------------------------------------
    {
        **GUIDE_COMMON,
        "basename": "power_bi_einsteiger_guide_v4",
        "lang": "de",
        "title": "Power BI von A bis Z — Einsteiger-Guide (End-to-End)",
        "append_md": (
            "---\n\n"
            "## Weiter\n\n"
            "- HTML (maßgeblich): https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html\n"
            "- Anschluss-Guide: [fabric_einsteiger_guide_v1.html](../fabric_einsteiger_guide_v1.html) · "
            "[fabric_einsteiger_guide_v1.md](fabric_einsteiger_guide_v1.md)\n"
            "- Übungspfad für absolute Anfänger: [powerbi_praxis_pfad.html](../powerbi_praxis_pfad.html) · "
            "[powerbi_praxis_pfad.md](powerbi_praxis_pfad.md)\n"
        ),
    },
    {
        **GUIDE_COMMON,
        "basename": "fabric_einsteiger_guide_v1",
        "lang": "de",
        "title": "Microsoft Fabric — Einsteiger-Guide",
        "append_md": (
            "---\n\n"
            "## Weiter\n\n"
            "- HTML (maßgeblich): https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html\n"
            "- Grundlagen-Guide: [power_bi_einsteiger_guide_v4.html](../power_bi_einsteiger_guide_v4.html) · "
            "[power_bi_einsteiger_guide_v4.md](power_bi_einsteiger_guide_v4.md)\n"
        ),
    },
    {
        "basename": "powerbi_praxis_pfad",
        "lang": "de",
        "title": "Dein erstes Dashboard — Power-BI-Praxis-Pfad",
        "root": ".pp-wrap",
        # Modul-Ueberschriften stehen als h2.pp-modul-titel fest auf Ebene 2;
        # alle uebrigen h-Tags sind Abschnitte INNERHALB eines Moduls und
        # rutschen deshalb eine Ebene tiefer.
        "heading_offset": 1,
        "drop": [
            ".pp-topbar",   # Sprungleiste
            ".pp-nav",      # Modul-Kacheln = dieselbe Navigation nochmal
            "h1",           # H1 liefert der Kopfblock
        ],
        "headings": {
            "pp-modul-titel": 2,
            "pp-check-titel": 3,
            "pp-wort-label": 4,
        },
        "inline_join": {"pp-meta": " · "},
        "blockquote": [".pp-hinweis", ".pp-wort"],
        "custom": {".pp-shot": h_shot_figure, "p": h_pp_paragraph},
    },
    {
        "basename": "business-chart-builder-anleitung",
        "lang": "de",
        "title": "Business Chart Builder — Anleitung",
        "root": ".wrap",
        "drop": [
            ".top",   # Zurueck-/Sprach-Leiste
            "h1",     # H1 liefert der Kopfblock
        ],
        # <span class="pill">AC</span> sind Szenario-Kuerzel — als Code-Span
        # bleiben sie im Fliesstext als Kuerzel erkennbar.
        "inline_wrap": {"pill": ("`", "`")},
        "blockquote": [".tip"],
        "custom": {".live": h_live_link},
        "append_md": (
            "---\n\n"
            "## Weitere Fassungen dieser Seite\n\n"
            "- HTML (maßgeblich, mit DE/EN-Umschalter und allen Live-Permalinks): "
            "https://datenwgknowledgekitchen.com/business-chart-builder-anleitung.html\n"
            "- Das Werkzeug selbst: [business-chart-builder.html](../business-chart-builder.html)\n"
        ),
    },

    # --- Posts -------------------------------------------------------------
    {
        **POST_COMMON,
        "basename": "ki-entwicklung-zehn-tage",
        "lang": "de",
        "title": "Zehn Tage bis zum marktfähigen Stand",
        # <span class="ev ev-S">S</span> markiert die Evidenzstufe einer Aussage.
        # Ohne Klammer stuende mitten im Satz ein nacktes "S".
        "inline_wrap": {"ev": ("[Evidenz: ", "]")},
        "append_md": (
            "---\n\n"
            "## Weiterlesen\n\n"
            "- HTML (maßgeblich): https://datenwgknowledgekitchen.com/ki-entwicklung-zehn-tage.html\n"
            "- Englische Fassung: [ki-entwicklung-zehn-tage_en.html](../ki-entwicklung-zehn-tage_en.html) · "
            "[ki-entwicklung-zehn-tage_en.md](ki-entwicklung-zehn-tage_en.md)\n"
            "- Das vollständige Thesenpapier: "
            "[whitepaper-ki-entwicklung-roi.html](../whitepaper-ki-entwicklung-roi.html) · "
            "[whitepaper-ki-entwicklung-roi.md](../whitepaper-ki-entwicklung-roi.md) · "
            "[PDF](../whitepaper-ki-entwicklung-roi.pdf)\n"
            "- Evidenz-Labels: M = gemessen · A = Annahme · S = Schätzung · H = Hypothese\n"
        ),
    },
    {
        **POST_COMMON,
        "basename": "ki-entwicklung-zehn-tage_en",
        "lang": "en",
        "title": "Ten Days to a Market-Ready State",
        "inline_wrap": {"ev": ("[Evidence: ", "]")},
        "append_md": (
            "---\n\n"
            "## Read on\n\n"
            "- HTML (authoritative): https://datenwgknowledgekitchen.com/ki-entwicklung-zehn-tage_en.html\n"
            "- German version: [ki-entwicklung-zehn-tage.html](../ki-entwicklung-zehn-tage.html) · "
            "[ki-entwicklung-zehn-tage.md](ki-entwicklung-zehn-tage.md)\n"
            "- The full position paper: "
            "[whitepaper-ki-entwicklung-roi_en.html](../whitepaper-ki-entwicklung-roi_en.html) · "
            "[whitepaper-ki-entwicklung-roi_en.md](../whitepaper-ki-entwicklung-roi_en.md) · "
            "[PDF](../whitepaper-ki-entwicklung-roi_en.pdf)\n"
            "- Evidence labels: M = measured · A = assumption · S = estimate · H = hypothesis\n"
        ),
    },
    {
        **POST_COMMON,
        "basename": "powerbi-design-skill",
        "lang": "de",
        "title": "Report-Design als Framework — ein Skill für Power BI",
        "append_md": (
            "---\n\n"
            "## Mehr dazu\n\n"
            "- HTML (maßgeblich): https://datenwgknowledgekitchen.com/powerbi-design-skill.html\n"
            "- Skill-Repository (englische Standalone-Edition): "
            "https://github.com/Losveratos/Power-BI-Design-Skill\n"
            "- Deutsches Original in der PowerBI-Kitchen: "
            "https://github.com/Losveratos/PowerBI-Kitchen-\n"
        ),
    },
    {
        **POST_COMMON,
        "basename": "prototyping-pnl-treiberbaum",
        "lang": "de",
        "title": "Ist KI das neue Papier — und Markdown der neue Stift?",
        "append_md": (
            "---\n\n"
            "## Weiterlesen\n\n"
            "- HTML (maßgeblich): https://datenwgknowledgekitchen.com/prototyping-pnl-treiberbaum.html\n"
            "- Englische Fassung: [prototyping-pnl-treiberbaum_en.html](../prototyping-pnl-treiberbaum_en.html) · "
            "[prototyping-pnl-treiberbaum_en.md](prototyping-pnl-treiberbaum_en.md)\n"
            "- Interaktive Demo: [pnl-treiberbaum-demo.html](../pnl-treiberbaum-demo.html) · "
            "https://datenwgknowledgekitchen.com/pnl-treiberbaum-demo.html\n"
        ),
    },
    {
        **POST_COMMON,
        "basename": "prototyping-pnl-treiberbaum_en",
        "lang": "en",
        "title": "Is AI the New Paper — and Markdown the New Pen?",
        "append_md": (
            "---\n\n"
            "## Read on\n\n"
            "- HTML (authoritative): https://datenwgknowledgekitchen.com/prototyping-pnl-treiberbaum_en.html\n"
            "- German version: [prototyping-pnl-treiberbaum.html](../prototyping-pnl-treiberbaum.html) · "
            "[prototyping-pnl-treiberbaum.md](prototyping-pnl-treiberbaum.md)\n"
            "- Interactive demo: [pnl-treiberbaum-demo.html](../pnl-treiberbaum-demo.html) · "
            "https://datenwgknowledgekitchen.com/pnl-treiberbaum-demo.html\n"
        ),
    },
]


# ---------------------------------------------------------------------------
# 6 · Seiten-Build
# ---------------------------------------------------------------------------

def header_block(cfg: dict, title: str) -> str:
    base = cfg["basename"]
    url = f"{SITE}/{base}.html"
    if cfg.get("lang") == "en":
        note = (f"> Markdown version of [{base}.html](../{base}.html) · {url} · "
                f"generated with scripts/build_md.py — if the two differ, "
                f"the HTML version prevails.")
    else:
        note = (f"> Markdown-Fassung von [{base}.html](../{base}.html) · {url} · "
                f"generiert mit scripts/build_md.py — bei Abweichungen gilt "
                f"die HTML-Fassung.")
    return f"# {title}\n\n{note}\n"


def apply_version_json(cfg: dict, dom: Node, md: str) -> str:
    """Statische Versionsangaben durch die Werte aus latest.json ersetzen.

    Die Seite laedt die Version zur Laufzeit per fetch(); im Markup steht ein
    veralteter Platzhalter. Fuer die MD-Fassung ersetzen wir ihn direkt.
    """
    rel = cfg.get("version_json")
    if not rel:
        return md
    path = ROOT / rel
    if not path.exists():
        return md
    data = json.loads(path.read_text(encoding="utf-8"))
    for elem_id, key in cfg.get("version_ids", {}).items():
        node = dom.find(f"#{elem_id}")
        new = data.get(key)
        if node is None or not new:
            continue
        old = squash(node.plain_text()).strip()
        # "Version 1.40.0.0" -> nur die Zahl ersetzen
        old = old.replace("Version", "").strip()
        if old and old != new:
            md = md.replace(old, new)
    return md


def page_title(cfg: dict, dom: Node) -> str:
    if cfg.get("title"):
        return cfg["title"]
    node = dom.find("h1")
    if node is not None:
        return squash(node.plain_text()).strip()
    return cfg["basename"]


def build_page(cfg: dict) -> tuple[Path, str]:
    src = ROOT / f"{cfg['basename']}.html"
    if not src.exists():
        raise FileNotFoundError(src)
    dom = parse_html(src.read_text(encoding="utf-8"))

    title = page_title(cfg, dom)
    conv = Converter(cfg, dom)
    root_sel = cfg.get("root", "body")
    root = dom.find(root_sel) or dom.find("body") or dom

    blocks = conv.blocks(root)
    body = "\n\n".join(blocks)
    md = header_block(cfg, title) + "\n" + body + "\n"
    if cfg.get("append_md"):
        md += "\n" + cfg["append_md"]
    md = apply_version_json(cfg, dom, md)

    md = MULTI_BLANK_RX.sub("\n\n", md)
    md = "\n".join(line.rstrip() for line in md.split("\n"))
    if not md.endswith("\n"):
        md += "\n"
    return OUT_DIR / f"{cfg['basename']}.md", md


def main(argv: list[str]) -> int:
    if "--list" in argv:
        for cfg in PAGES:
            print(f"{cfg['basename']:34s} -> md/{cfg['basename']}.md  ({cfg.get('lang')})")
        return 0

    wanted = [a for a in argv if not a.startswith("-")]
    pages = PAGES
    if wanted:
        names = {w.removesuffix(".html").removesuffix(".md") for w in wanted}
        pages = [p for p in PAGES if p["basename"] in names]
        missing = names - {p["basename"] for p in pages}
        if missing:
            print(f"Nicht in der Registry: {', '.join(sorted(missing))}", file=sys.stderr)
            print("Bekannt: " + ", ".join(p["basename"] for p in PAGES), file=sys.stderr)
            return 2

    # --check: zweimal rendern, gegeneinander und gegen die Platte vergleichen,
    # nichts schreiben (Konvention aus md/README.md)
    check = "--check" in argv
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    dirty = 0
    for cfg in pages:
        out, md = build_page(cfg)
        if check:
            _, md2 = build_page(cfg)
            on_disk = out.read_text(encoding="utf-8") if out.exists() else None
            ok = md == md2 and md == on_disk
            print(f"{'✓' if ok else '✗'} {out.relative_to(ROOT)}  "
                  + ("ok" if ok else "WEICHT AB" if md == md2 else "NICHT DETERMINISTISCH"))
            dirty += 0 if ok else 1
            continue
        changed = (not out.exists()) or out.read_text(encoding="utf-8") != md
        out.write_text(md, encoding="utf-8")
        state = "geschrieben" if changed else "unveraendert"
        print(f"✓ {out.relative_to(ROOT)}  {len(md.encode('utf-8')):>7,d} B  {state}")
    return 1 if dirty else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
