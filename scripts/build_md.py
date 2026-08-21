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
        self.inline_sep: dict[str, str] = cfg.get("inline_sep", {})
        self.inline_join: dict[str, str] = cfg.get("inline_join", {})
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
            return min(int(node.tag[1]), 4)
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

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for cfg in pages:
        out, md = build_page(cfg)
        changed = (not out.exists()) or out.read_text(encoding="utf-8") != md
        out.write_text(md, encoding="utf-8")
        state = "geschrieben" if changed else "unveraendert"
        print(f"✓ {out.relative_to(ROOT)}  {len(md.encode('utf-8')):>7,d} B  {state}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
