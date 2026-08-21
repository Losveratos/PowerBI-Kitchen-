#!/usr/bin/env python3
"""
build_learn_md.py

Erzeugt md/daten_wg_learn_buckets.md aus den Episodendaten, die in
daten_wg_learn_buckets.html als `const EPISODES = [...]` und
`const BUCKETS = [...]` eingebettet sind.

Die HTML-Datei ist die maßgebliche Datenquelle (nicht videos.json, das
stale sein kann). Dieses Skript benutzt nur die Standardbibliothek:

  - Findet die beiden JS-Array-Literale per Marker + balanciertem
    Klammer-Match (kein Regex-Overreach auf beliebigen JS-Code).
  - Parst das gefundene JS-Array-Literal mit einem kleinen, robusten
    Tokenizer/Parser (kein JSON, da einfache Anführungszeichen,
    unquotete Keys und escapte Apostrophe wie \\' vorkommen).
  - Rendert eine lesbare Markdown-Fassung, sortiert wie im HTML
    (Bucket-Reihenfolge 1..9, innerhalb der Bucket-Reihenfolge im Array).

Aufruf:
    python3 scripts/build_learn_md.py

Idempotent: zweimaliges Ausführen erzeugt byte-identischen Output.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML_PATH = ROOT / "daten_wg_learn_buckets.html"
MD_PATH = ROOT / "md" / "daten_wg_learn_buckets.md"

CHANNEL_URL = "https://www.youtube.com/@Daten-WG"
HTML_URL = "https://datenwgknowledgekitchen.com/daten_wg_learn_buckets.html"


# --------------------------------------------------------------------------
# 1) Balanciertes Klammer-Match: findet den Text von `const NAME = [ ... ];`
# --------------------------------------------------------------------------

def find_array_literal(html: str, const_name: str) -> str:
    """Liefert den rohen JS-Array-Literal-Text (inkl. [ ]) für `const NAME = [...]`.

    Läuft zeichenweise durch den Text und respektiert String-Literale
    (einfach/doppelt/Template) sowie // und /* */ Kommentare, damit
    Klammern innerhalb von Strings/Kommentaren nicht mitgezählt werden.
    """
    marker = f"const {const_name} = ["
    start_idx = html.find(marker)
    if start_idx == -1:
        raise RuntimeError(f"'{marker}' nicht in HTML gefunden")
    arr_start = html.find("[", start_idx)

    depth = 0
    in_str: str | None = None
    esc = False
    i = arr_start
    n = len(html)
    while i < n:
        c = html[i]
        if in_str:
            if esc:
                esc = False
            elif c == "\\":
                esc = True
            elif c == in_str:
                in_str = None
            i += 1
            continue
        if c in ("'", '"', "`"):
            in_str = c
            i += 1
            continue
        if c == "/" and i + 1 < n and html[i + 1] == "/":
            while i < n and html[i] != "\n":
                i += 1
            continue
        if c == "/" and i + 1 < n and html[i + 1] == "*":
            end = html.find("*/", i + 2)
            if end == -1:
                raise RuntimeError("unterminierter Block-Kommentar im Array-Literal")
            i = end + 2
            continue
        if c == "[":
            depth += 1
        elif c == "]":
            depth -= 1
            if depth == 0:
                return html[arr_start:i + 1]
        i += 1
    raise RuntimeError(f"Array-Ende für '{const_name}' nicht gefunden")


# --------------------------------------------------------------------------
# 2) Mini JS-Literal-Parser (Objekte/Arrays/Strings/Zahlen/Bool/Null)
# --------------------------------------------------------------------------

_TOKEN_RX = re.compile(r"""
    (?P<ws>\s+)
  | (?P<linecomment>//[^\n]*)
  | (?P<blockcomment>/\*.*?\*/)
  | (?P<string>'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")
  | (?P<number>-?\d+(?:\.\d+)?)
  | (?P<ident>[A-Za-z_$][A-Za-z0-9_$]*)
  | (?P<punct>[{}\[\]:,])
""", re.VERBOSE | re.DOTALL)

_ESCAPES = {
    "n": "\n", "t": "\t", "r": "\r", "b": "\b", "f": "\f",
    "'": "'", '"': '"', "\\": "\\", "`": "`", "/": "/",
    "\n": "",  # escaped literal newline inside a string -> line continuation
}


def _decode_string(raw: str) -> str:
    """raw enthält die umschließenden Anführungszeichen."""
    quote = raw[0]
    body = raw[1:-1]
    out = []
    i = 0
    n = len(body)
    while i < n:
        c = body[i]
        if c == "\\" and i + 1 < n:
            nxt = body[i + 1]
            if nxt == "u" and i + 5 < n + 1:
                hex4 = body[i + 2:i + 6]
                try:
                    out.append(chr(int(hex4, 16)))
                    i += 6
                    continue
                except ValueError:
                    pass
            out.append(_ESCAPES.get(nxt, nxt))
            i += 2
            continue
        out.append(c)
        i += 1
    return "".join(out)


def _tokenize(text: str):
    tokens = []
    pos = 0
    n = len(text)
    while pos < n:
        m = _TOKEN_RX.match(text, pos)
        if not m:
            raise RuntimeError(f"Unerwartetes Zeichen an Position {pos}: {text[pos:pos+30]!r}")
        pos = m.end()
        kind = m.lastgroup
        if kind in ("ws", "linecomment", "blockcomment"):
            continue
        tokens.append((kind, m.group()))
    return tokens


class _Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.i = 0

    def peek(self):
        return self.tokens[self.i] if self.i < len(self.tokens) else (None, None)

    def next(self):
        tok = self.peek()
        self.i += 1
        return tok

    def expect(self, value):
        kind, val = self.next()
        if val != value:
            raise RuntimeError(f"Erwartet {value!r}, bekommen {val!r} (Token #{self.i})")

    def parse_value(self):
        kind, val = self.peek()
        if val == "{":
            return self.parse_object()
        if val == "[":
            return self.parse_array()
        if kind == "string":
            self.next()
            return _decode_string(val)
        if kind == "number":
            self.next()
            return float(val) if "." in val else int(val)
        if kind == "ident":
            self.next()
            if val == "true":
                return True
            if val == "false":
                return False
            if val == "null":
                return None
            raise RuntimeError(f"Unerwarteter Bezeichner als Wert: {val!r}")
        raise RuntimeError(f"Unerwarteter Token als Wert: {(kind, val)!r}")

    def parse_array(self):
        self.expect("[")
        result = []
        while True:
            kind, val = self.peek()
            if val == "]":
                self.next()
                break
            result.append(self.parse_value())
            kind, val = self.peek()
            if val == ",":
                self.next()
                # trailing comma vor ] erlaubt
                kind, val = self.peek()
                if val == "]":
                    self.next()
                    break
                continue
            elif val == "]":
                self.next()
                break
            else:
                raise RuntimeError(f"',' oder ']' erwartet, bekommen {(kind, val)!r}")
        return result

    def parse_object(self):
        self.expect("{")
        result = {}
        while True:
            kind, val = self.peek()
            if val == "}":
                self.next()
                break
            if kind not in ("string", "ident"):
                raise RuntimeError(f"Objekt-Key erwartet, bekommen {(kind, val)!r}")
            self.next()
            key = _decode_string(val) if kind == "string" else val
            self.expect(":")
            value = self.parse_value()
            result[key] = value
            kind, val = self.peek()
            if val == ",":
                self.next()
                kind, val = self.peek()
                if val == "}":
                    self.next()
                    break
                continue
            elif val == "}":
                self.next()
                break
            else:
                raise RuntimeError(f"',' oder '}}' erwartet, bekommen {(kind, val)!r}")
        return result


def parse_js_array(text: str) -> list:
    tokens = _tokenize(text)
    parser = _Parser(tokens)
    value = parser.parse_array()
    return value


# --------------------------------------------------------------------------
# 3) Hilfsfunktionen für die Markdown-Erzeugung
# --------------------------------------------------------------------------

_TAG_RX = re.compile(r"<[^>]+>")


def strip_tags(s: str) -> str:
    return _TAG_RX.sub("", s or "").strip()


def time_to_seconds(t: str) -> int:
    parts = t.strip().split(":")
    parts = [int(p) for p in parts]
    if len(parts) == 2:
        m, s = parts
        return m * 60 + s
    if len(parts) == 3:
        h, m, s = parts
        return h * 3600 + m * 60 + s
    raise ValueError(f"Unerwartetes Zeitformat: {t!r}")


def md_escape_inline(s: str) -> str:
    """Escaped Zeichen, die in normalem Markdown-Fließtext Sonderbedeutung haben."""
    if s is None:
        return ""
    # Backslash zuerst, dann die übrigen Markdown-Sonderzeichen.
    for ch in ("\\", "*", "_", "`", "[", "]"):
        s = s.replace(ch, "\\" + ch)
    return s


def bucket_heading(bucket: dict) -> str:
    """Baut eine lesbare Überschrift aus BUCKETS[i] (title-Feld enthält <em>)."""
    title = strip_tags(bucket.get("title", "")) or bucket.get("name", bucket.get("id", ""))
    num = bucket.get("num", "")
    return f"{num} · {title}" if num else title


def render_episode(ep: dict) -> str:
    lines = []
    title = ep.get("title", "").strip()
    lines.append(f"### {md_escape_inline(title)}")
    lines.append("")

    meta_parts = []
    if not ep.get("solo") and ep.get("guest"):
        meta_parts.append(f"Gast: {ep['guest']}")
    meta_parts.append(ep.get("date", ""))
    meta_parts.append(ep.get("duration", ""))
    meta_parts.append(ep.get("lang", ""))
    tags = ep.get("tags") or []
    if tags:
        meta_parts.append("Tags: " + ", ".join(tags))
    lines.append(" · ".join(p for p in meta_parts if p))
    lines.append("")

    yt_id = ep.get("ytId")
    if yt_id:
        lines.append(f"YouTube: https://www.youtube.com/watch?v={yt_id}")
    podcast_url = ep.get("podcastUrl")
    if podcast_url:
        lines.append(f"Podcast: {podcast_url}")
    if yt_id or podcast_url:
        lines.append("")

    desc = (ep.get("desc") or "").strip()
    if desc:
        lines.append(desc)
        lines.append("")

    chapters = ep.get("chapters") or []
    if chapters:
        lines.append("Kapitel:")
        for ts, label in chapters:
            label_clean = md_escape_inline((label or "").strip())
            if yt_id:
                seconds = time_to_seconds(ts)
                lines.append(f"- [{ts}](https://www.youtube.com/watch?v={yt_id}&t={seconds}s) {label_clean}")
            else:
                lines.append(f"- {ts} {label_clean}")
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


# --------------------------------------------------------------------------
# 4) Main
# --------------------------------------------------------------------------

def main():
    html = HTML_PATH.read_text(encoding="utf-8")

    buckets_raw = find_array_literal(html, "BUCKETS")
    episodes_raw = find_array_literal(html, "EPISODES")

    buckets = parse_js_array(buckets_raw)
    episodes = parse_js_array(episodes_raw)

    bucket_order = [b["id"] for b in buckets]
    bucket_by_id = {b["id"]: b for b in buckets}

    # Episoden nach Bucket-Reihenfolge (1..9) gruppieren, innerhalb der
    # Reihenfolge im Original-Array (== Reihenfolge im HTML) beibehalten.
    by_bucket: dict[str, list[dict]] = {bid: [] for bid in bucket_order}
    unknown_bucket_eps = []
    for ep in episodes:
        bid = ep.get("bucket")
        if bid in by_bucket:
            by_bucket[bid].append(ep)
        else:
            unknown_bucket_eps.append(ep)

    total = len(episodes)
    lang_counts: dict[str, int] = {}
    for ep in episodes:
        lang_counts[ep.get("lang", "?")] = lang_counts.get(ep.get("lang", "?"), 0) + 1
    de_count = lang_counts.get("DE", 0)
    en_count = lang_counts.get("EN", 0)
    other_count = total - de_count - en_count

    out = []
    out.append("# Daten-WG · Knowledge Kitchen — Episoden-Guide")
    out.append("")
    out.append(
        "> Markdown-Fassung von [daten_wg_learn_buckets.html](../daten_wg_learn_buckets.html) · "
        f"{HTML_URL} · generiert mit scripts/build_learn_md.py aus den Episodendaten — "
        "bei Abweichungen gilt die HTML-Fassung."
    )
    out.append("")

    lang_bits = [f"{de_count} DE", f"{en_count} EN"]
    if other_count:
        lang_bits.append(f"{other_count} weitere")
    out.append(
        f"Kanal: [@Daten-WG]({CHANNEL_URL}) · **{total} Folgen** insgesamt · "
        f"Sprachverteilung: {' / '.join(lang_bits)}."
    )
    out.append("")

    out.append("## Übersicht")
    out.append("")
    out.append("| Bucket | Folgen |")
    out.append("| --- | --- |")
    for bid in bucket_order:
        b = bucket_by_id[bid]
        count = len(by_bucket[bid])
        out.append(f"| {bucket_heading(b)} | {count} |")
    if unknown_bucket_eps:
        out.append(f"| _Unbekannter Bucket_ | {len(unknown_bucket_eps)} |")
    out.append("")

    for bid in bucket_order:
        eps = by_bucket[bid]
        if not eps:
            continue
        b = bucket_by_id[bid]
        out.append(f"## {bucket_heading(b)}")
        out.append("")
        intro = strip_tags(b.get("intro", ""))
        if intro:
            out.append(f"_{intro}_")
            out.append("")
        for ep in eps:
            out.append(render_episode(ep))

    if unknown_bucket_eps:
        out.append("## Unbekannter Bucket")
        out.append("")
        for ep in unknown_bucket_eps:
            out.append(render_episode(ep))

    text = "\n".join(out).rstrip() + "\n"

    MD_PATH.parent.mkdir(parents=True, exist_ok=True)
    MD_PATH.write_text(text, encoding="utf-8")

    print(f"OK: {len(episodes)} Folgen in {sum(len(v) for v in by_bucket.values())} Buckets geschrieben")
    print(f"-> {MD_PATH.relative_to(ROOT)} ({MD_PATH.stat().st_size} bytes)")
    if unknown_bucket_eps:
        print(f"WARNUNG: {len(unknown_bucket_eps)} Folgen ohne bekannten Bucket", file=sys.stderr)


if __name__ == "__main__":
    main()
