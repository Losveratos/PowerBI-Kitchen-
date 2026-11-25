"""DAX-Analyse ohne vollständigen Parser.

Arbeitet auf einer "maskierten" Kopie der Abfrage: Kommentare werden zu
Leerzeichen, der Inhalt von String-Literalen ebenfalls (die Anführungszeichen
bleiben). Damit stimmen alle Positionen und Zeilennummern mit dem Original
überein, und Regeln greifen nicht versehentlich in Text oder Kommentaren.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field

# Funktionen, die den Filterkontext des Modells übersteuern
FILTER_OVERRIDES = {
    "REMOVEFILTERS", "ALL", "ALLEXCEPT", "ALLSELECTED", "ALLNOBLANKROW",
    "ALLCROSSFILTERED", "KEEPFILTERS", "CROSSFILTER", "USERELATIONSHIP",
}
# Funktionen, die Ergebnisse abschneiden oder stichprobenhaft liefern
TRUNCATING = {"TOPN", "TOPNSKIP", "SAMPLE"}
# Funktionen, die gelieferte Werte gegenüber dem Modell verändern
VALUE_CHANGING = {
    "ROUND", "ROUNDUP", "ROUNDDOWN", "MROUND", "TRUNC", "INT", "FIXED",
    "FORMAT", "TRIM", "UPPER", "LOWER", "LEFT", "RIGHT", "MID", "SUBSTITUTE",
    "REPLACE", "VALUE", "CONVERT", "CURRENCY",
}
AGGREGATIONS = {
    "SUM", "SUMX", "AVERAGE", "AVERAGEX", "MIN", "MINX", "MAX", "MAXX",
    "COUNT", "COUNTX", "COUNTROWS", "COUNTA", "COUNTAX", "DISTINCTCOUNT",
    "DIVIDE", "PRODUCT", "PRODUCTX", "MEDIAN", "MEDIANX", "RANKX",
    "PERCENTILE.INC", "PERCENTILEX.INC", "CALCULATE", "TOTALYTD", "SAMEPERIODLASTYEAR",
    "DATEADD", "PARALLELPERIOD", "DATESYTD",
}
PROJECTIONS = {"SELECTCOLUMNS", "ADDCOLUMNS", "SUMMARIZECOLUMNS", "SUMMARIZE", "ROW", "GROUPBY"}
# Ein reiner Spaltenzugriff über diese Funktionen gilt noch nicht als Berechnung
PASSTHROUGH = {"RELATED", "VALUES", "DISTINCT", "SELECTEDVALUE", "FIRSTNONBLANK", "LASTNONBLANK"}

_QREF = re.compile(r"('(?:[^']|'')+'|[A-Za-z_][\w\.]*)\s*\[((?:[^\]]|\]\])+)\]")
_BREF = re.compile(r"\[((?:[^\]]|\]\])+)\]")
_FUNC = re.compile(r"(?<![\w\.'\]])([A-Za-z][A-Za-z0-9\.]*)\s*\(")
KEYWORDS = {"BY", "ORDER", "RETURN", "EVALUATE", "IN", "VAR", "ASC", "DESC", "AND", "OR", "NOT",
            "DEFINE", "MEASURE", "START", "AT", "COLUMN", "TABLE"}
_DEFINE_ENTRY = re.compile(
    r"(?:^[ \t]*|\bDEFINE[ \t]+)(MEASURE|VAR|COLUMN|TABLE|FUNCTION)\s+(.+?)\s*=", re.IGNORECASE | re.MULTILINE)


def unquote_table(name: str) -> str:
    name = name.strip()
    if len(name) >= 2 and name[0] == "'" and name[-1] == "'":
        return name[1:-1].replace("''", "'")
    return name


def mask(text: str) -> str:
    """Kommentare und String-Inhalte durch Leerzeichen ersetzen (Länge bleibt)."""
    out = list(text)
    i, n = 0, len(text)
    while i < n:
        c = text[i]
        nx = text[i + 1] if i + 1 < n else ""
        if c == "/" and nx == "/" or c == "-" and nx == "-":
            j = text.find("\n", i)
            j = n if j < 0 else j
            for k in range(i, j):
                out[k] = " "
            i = j
        elif c == "/" and nx == "*":
            j = text.find("*/", i + 2)
            j = n if j < 0 else j + 2
            for k in range(i, j):
                if text[k] != "\n":
                    out[k] = " "
            i = j
        elif c == '"':
            j = i + 1
            while j < n:
                if text[j] == '"':
                    if j + 1 < n and text[j + 1] == '"':
                        j += 2
                        continue
                    break
                j += 1
            for k in range(i + 1, min(j, n)):
                if text[k] != "\n":
                    out[k] = " "
            i = j + 1
        elif c == "'":  # Tabellenname, unverändert lassen
            j = i + 1
            while j < n:
                if text[j] == "'":
                    if j + 1 < n and text[j + 1] == "'":
                        j += 2
                        continue
                    break
                j += 1
            i = j + 1
        elif c == "[":
            j = text.find("]", i + 1)
            while j >= 0 and j + 1 < n and text[j + 1] == "]":
                j = text.find("]", j + 2)
            i = n if j < 0 else j + 1
        else:
            i += 1
    return "".join(out)


def line_of(text: str, pos: int) -> int:
    return text.count("\n", 0, pos) + 1


def matching_paren(masked: str, open_pos: int) -> int:
    depth = 0
    for k in range(open_pos, len(masked)):
        ch = masked[k]
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
            if depth == 0:
                return k
    return len(masked) - 1


def split_args(masked: str, start: int, end: int) -> list[tuple[int, int]]:
    """Top-Level-Argumente zwischen start (nach '(') und end (')') als Spannen."""
    spans, depth, s = [], 0, start
    for k in range(start, end):
        ch = masked[k]
        if ch in "({":
            depth += 1
        elif ch in ")}":
            depth -= 1
        elif ch == "," and depth == 0:
            spans.append((s, k))
            s = k + 1
    spans.append((s, end))
    return [(a, b) for a, b in spans if masked[a:b].strip()]


@dataclass
class Ref:
    table: str | None   # None = unqualifiziert ([Name])
    name: str
    pos: int
    line: int


@dataclass
class Call:
    func: str
    pos: int
    line: int
    open_pos: int
    close_pos: int


@dataclass
class Projection:
    alias: str
    expr: str
    kind: str            # column | measure | computed
    funcs: list[str]
    line: int


@dataclass
class Define:
    kind: str            # MEASURE | VAR | COLUMN | TABLE | FUNCTION
    table: str | None
    name: str
    expr: str
    line: int


@dataclass
class Query:
    source: str          # Datei (relativ)
    line0: int           # Zeile der Abfrage in der Datei (1-basiert)
    text: str
    masked: str = ""
    refs: list[Ref] = field(default_factory=list)
    calls: list[Call] = field(default_factory=list)
    defines: list[Define] = field(default_factory=list)
    projections: list[Projection] = field(default_factory=list)
    aliases: set[str] = field(default_factory=set)
    evaluates: int = 0
    vars: dict = field(default_factory=dict)
    define_end: int = 0
    tvars: set = field(default_factory=set)   # Namen, die als Tabelle verwendet werden können (VAR, DEFINE TABLE)

    def defined(self, table: str | None, name: str) -> bool:
        return any(d.name.lower() == name.lower() and (table is None or (d.table or "").lower() == table.lower())
                   for d in self.defines if d.kind in ("MEASURE", "COLUMN"))
    connector: str | None = None

    def abs_line(self, line: int) -> int:
        return self.line0 + line - 1

    def snippet(self, line: int, ctx: int = 0) -> str:
        lines = self.text.split("\n")
        a, b = max(0, line - 1 - ctx), min(len(lines), line + ctx)
        return "\n".join(l.rstrip() for l in lines[a:b])


def parse(text: str, source: str, line0: int = 1) -> Query:
    q = Query(source=source, line0=line0, text=text)
    m = q.masked = mask(text)
    q.evaluates = len(re.findall(r"\bEVALUATE\b", m, re.IGNORECASE))

    for f in _FUNC.finditer(m):
        name = f.group(1).upper()
        if name in {"EVALUATE", "DEFINE", "VAR", "RETURN", "ORDER", "BY", "MEASURE", "IN", "NOT", "AND", "OR"}:
            continue
        op = f.end() - 1
        q.calls.append(Call(name, f.start(), line_of(text, f.start()), op, matching_paren(m, op)))

    spans = []
    for r in _QREF.finditer(m):
        if r.group(1).upper() in KEYWORDS:
            continue  # z. B. ORDER BY [sort]: unqualifizierter Verweis
        q.refs.append(Ref(unquote_table(r.group(1)), r.group(2).replace("]]", "]"), r.start(), line_of(text, r.start())))
        spans.append((r.start(), r.end()))
    for r in _BREF.finditer(m):
        if any(a <= r.start() < b for a, b in spans):
            continue
        q.refs.append(Ref(None, r.group(1).replace("]]", "]"), r.start(), line_of(text, r.start())))

    # DEFINE-Block: Einträge bis zum ersten EVALUATE
    dm = re.search(r"\bDEFINE\b", m, re.IGNORECASE)
    if dm:
        ev = re.search(r"\bEVALUATE\b", m[dm.end():], re.IGNORECASE)
        block_end = dm.end() + ev.start() if ev else len(m)
        q.define_end = block_end
        entries = [e for e in _DEFINE_ENTRY.finditer(m, dm.start(), block_end)]
        for idx, e in enumerate(entries):
            kind = e.group(1).upper()
            head = text[e.start(2):e.end(2)].strip()
            nxt = entries[idx + 1].start() if idx + 1 < len(entries) else block_end
            expr = text[e.end():nxt].strip()
            qr = _QREF.match(m[e.start(2):e.end(2)].strip())
            if qr and kind in ("MEASURE", "COLUMN"):
                d = Define(kind, unquote_table(qr.group(1)), qr.group(2), expr, line_of(text, e.start()))
            else:
                d = Define(kind, None, head.strip("'"), expr, line_of(text, e.start()))
            q.defines.append(d)
            q.aliases.add(d.name.lower())
            if d.kind in ("VAR", "TABLE"):
                q.tvars.add(d.name.lower())
    # VAR auch außerhalb von DEFINE (innerhalb von Ausdrücken): Name → Ausdruck
    vstarts = [v for v in re.finditer(r"\bVAR\s+([A-Za-z_][\w]*)\s*=", m, re.IGNORECASE)]
    for idx, v in enumerate(vstarts):
        q.aliases.add(v.group(1).lower())
        q.tvars.add(v.group(1).lower())
        stop = re.compile(r"\b(VAR|RETURN|EVALUATE|MEASURE|DEFINE)\b", re.IGNORECASE).search(m, v.end())
        q.vars[v.group(1).lower()] = text[v.end():stop.start() if stop else len(m)].strip()

    # Projektionen: "alias", Ausdruck
    for c in q.calls:
        if c.func not in PROJECTIONS:
            continue
        args = split_args(m, c.open_pos + 1, c.close_pos)
        first = next((k for k, (a0, a1) in enumerate(args) if _is_str(m[a0:a1])), None)
        if first is None:
            continue
        for k in range(first, len(args) - 1, 2):
            a0, a1 = args[k]
            if not _is_str(m[a0:a1]):
                break
            alias = text[a0:a1].strip()[1:-1]
            q.aliases.add(alias.lower())
            b0, b1 = args[k + 1]
            expr_m = m[b0:b1].strip()
            expr = text[b0:b1].strip()
            funcs = [f.group(1).upper() for f in _FUNC.finditer(expr_m)]
            kind = _classify(expr_m, funcs)
            if kind == "computed" and re.fullmatch(r"[A-Za-z_]\w*", expr_m) and expr_m.lower() in q.vars:
                kind = "variable"
                expr = f"{expr}  ← VAR {expr} = {q.vars[expr_m.lower()]}"
                funcs = [f.group(1).upper() for f in _FUNC.finditer(mask(q.vars[expr_m.lower()]))]
            q.projections.append(Projection(alias, expr, kind, funcs, line_of(text, b0)))
    return q


def _is_str(seg: str) -> bool:
    seg = seg.strip()
    return len(seg) >= 2 and seg[0] == '"' and seg[-1] == '"' and '"' not in seg[1:-1].replace('""', '')


def _classify(expr_m: str, funcs: list[str]) -> str:
    e = expr_m.strip()
    if _is_str(e) or re.fullmatch(r"-?\d+(\.\d+)?|TRUE\(\)|FALSE\(\)|BLANK\(\)", e, re.IGNORECASE):
        return "constant"
    stripped = _QREF.sub("R", expr_m)
    stripped = _BREF.sub("B", stripped)
    stripped = re.sub(r"\s+", "", stripped)
    if stripped == "R":
        return "column"
    if stripped == "B":
        return "measure"
    if funcs and all(f in PASSTHROUGH for f in funcs) and not re.search(r"[-+*/&<>=]", stripped):
        return "column"
    return "computed"


def literal_comparisons(q: Query) -> list[tuple[int, str]]:
    """Vergleiche mit festen Werten in Filterargumenten (FILTER, CALCULATE …)."""
    out = []
    m = q.masked
    rx = re.compile(r"(==|<>|>=|<=|=|>|<|\bIN\b)\s*(-?\d+(?:[\.,]\d+)?\b|\"|\{|TRUE\b|FALSE\b|DATE\s*\(|BLANK\s*\(\s*\))",
                    re.IGNORECASE)
    for c in q.calls:
        if c.func not in ("FILTER", "CALCULATE", "CALCULATETABLE", "KEEPFILTERS"):
            continue
        args = split_args(m, c.open_pos + 1, c.close_pos)
        for a0, a1 in (args[1:] if c.func in ("FILTER", "CALCULATE", "CALCULATETABLE") else args):
            for hit in rx.finditer(m, a0, a1):
                out.append((line_of(q.text, hit.start()), q.text[a0:a1].strip()))
                break
    for c in q.calls:
        if c.func == "TREATAS":
            args = split_args(m, c.open_pos + 1, c.close_pos)
            if args and re.fullmatch(r"\{[\s\d\.,\"()\-]*\}", m[args[0][0]:args[0][1]].strip()):
                out.append((c.line, q.text[c.pos:c.close_pos + 1].strip()))
    seen, uniq = set(), []
    for ln, ev in out:
        if (ln, ev) not in seen and not any(ln == l2 and ev in e2 and ev != e2 for l2, e2 in out):
            seen.add((ln, ev))
            uniq.append((ln, ev))
    return uniq


# ---------------------------------------------------------------- feste Filter vergleichbar machen
# Für visibleFilters in fabscan.json: ein fester Filter aus der Abfrage und ein Eintrag der Konfiguration werden auf
# dieselbe Form gebracht, (tabelle, spalte, operator, werte), alles klein, ohne Anführungszeichen und Leerzeichen.

_COLREF = re.compile(r"""^\s*(?:'((?:[^']|'')+)'|([^\s'\[\]]+(?:\s+[^\s'\[\]]+)*?))?\s*\[\s*((?:[^\]]|\]\])+?)\s*\]\s*$""")
_NUM = re.compile(r"^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$")
_OPS = ("==", "<>", ">=", "<=", "=", ">", "<")


def norm_column(ref: str) -> tuple[str, str] | None:
    """'Kalender'[Ist], Kalender[Ist], ' Kalender ' [ Ist ] → ("kalender", "ist"). Ohne Tabelle: ("", spalte)."""
    m = _COLREF.match(ref or "")
    if not m:
        return None
    table = (m.group(1) or "").replace("''", "'") if m.group(1) is not None else (m.group(2) or "")
    return re.sub(r"\s+", " ", table.strip()).lower(), re.sub(r"\s+", " ", m.group(3).replace("]]", "]").strip()).lower()


def norm_value(v) -> str:
    """Wert aus DAX oder JSON vergleichbar machen: "Actual" → actual, TRUE() → true, 2026.0 → 2026."""
    if v is None:
        return "blank"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return _num(float(v))
    s = str(v).strip()
    if len(s) >= 2 and s[0] == s[-1] == '"':
        s = s[1:-1].replace('""', '"')
    elif len(s) >= 2 and s[0] == s[-1] == "'":
        s = s[1:-1]
    else:
        flat = re.sub(r"\s+", "", s).lower()
        if flat in ("true", "true()", "false", "false()"):
            return flat.rstrip("()")
        if flat == "blank()":
            return "blank"
        if _NUM.match(flat):
            return _num(float(flat))
        if re.match(r"^[a-z.]+\(", flat):    # DATE(2026,1,1), DATEVALUE(…)
            return flat
    s = s.strip().lower()
    return _num(float(s)) if _NUM.match(s) else re.sub(r"\s+", " ", s)


def _num(x: float) -> str:
    return str(int(x)) if x == int(x) else repr(x)


def _walk(text: str):
    """(index, zeichen, tiefe) außerhalb von Strings, 'Tabelle' und [Spalte]; tiefe vor dem Zeichen."""
    depth, i, n = 0, 0, len(text)
    while i < n:
        c = text[i]
        if c in "\"'":
            j = i + 1
            while j < n:
                if text[j] == c:
                    if j + 1 < n and text[j + 1] == c:
                        j += 2
                        continue
                    break
                j += 1
            i = j + 1
            continue
        if c == "[":
            j = text.find("]", i + 1)
            while 0 <= j < n - 1 and text[j + 1] == "]":
                j = text.find("]", j + 2)
            i = n if j < 0 else j + 1
            continue
        yield i, c, depth
        if c in "({":
            depth += 1
        elif c in ")}":
            depth -= 1
        i += 1


def _scan_top(text: str):
    """Zeichen auf oberster Ebene (außerhalb von Klammern, Strings, 'Tabelle' und [Spalte]): (index, zeichen)."""
    for i, c, d in _walk(text):
        if d == 0 and c not in "({)}":
            yield i, c


def _balanced(text: str) -> bool:
    depth = 0
    for _i, c, d in _walk(text):
        depth = d + (1 if c in "({" else -1 if c in ")}" else 0)
        if depth < 0:
            return False
    return depth == 0


def _split_top(text: str, sep: str) -> list[str]:
    """An sep (",", "&&" oder "AND") auf oberster Ebene trennen."""
    cuts, last = [], 0
    for i, _c in _scan_top(text):
        if i < last:
            continue
        if sep == "AND":
            if re.match(r"(?i)AND\b", text[i:i + 4]) and (i == 0 or not re.match(r"\w", text[i - 1])):
                cuts.append(text[last:i])
                last = i + 3
        elif text.startswith(sep, i):
            cuts.append(text[last:i])
            last = i + len(sep)
    cuts.append(text[last:])
    return cuts


def _unwrap(text: str, func: str) -> str | None:
    """Inneres von FUNC( … ), wenn die äußere Klammer den ganzen Ausdruck umschließt."""
    m = re.match(r"(?is)^\s*" + func + r"\s*\(", text)
    t = text.rstrip()
    if not m or not t.endswith(")"):
        return None
    body = t[m.end():-1]
    return body if _balanced(body) else None


def _values(text: str) -> frozenset | None:
    t = text.strip()
    if t.startswith("{") and t.endswith("}"):
        parts = [p for p in _split_top(t[1:-1], ",") if p.strip()]
        if not parts or any(p.strip().startswith("(") for p in parts):
            return None          # Tupel über mehrere Spalten
        return frozenset(norm_value(p) for p in parts)
    if not t or t.startswith("(") or re.search(r"\[|\|\||&&", t) or any(c in "=<>" for _, c in _scan_top(t)):
        return None
    return frozenset([norm_value(t)])


def filter_conditions(expr: str) -> list[tuple[str, str, str, frozenset]] | None:
    """Fester Filter → Liste von (tabelle, spalte, operator, werte). Formen: TREATAS({…}, 'T'[S]),
    'T'[S] = Wert, 'T'[S] IN {…}, mehrere mit && oder AND, KEEPFILTERS(…). None, wenn die Form nicht passt."""
    text = (expr or "").strip()
    while text.startswith("(") and text.endswith(")") and _balanced(text[1:-1]):
        text = text[1:-1].strip()
    if any(c == "|" or (c in "oO" and re.match(r"(?i)OR\b", text[i:i + 3]) and (i == 0 or not re.match(r"\w", text[i - 1])))
           for i, c in _scan_top(text)):
        return None             # Oder-Verknüpfung: kein einfacher fester Filter
    inner = _unwrap(text, "KEEPFILTERS")
    if inner is not None:
        return filter_conditions(inner)
    inner = _unwrap(text, "TREATAS")
    if inner is not None:
        args = _split_top(inner, ",")
        col = norm_column(args[1]) if len(args) == 2 else None
        vals = _values(args[0]) if len(args) == 2 and args[0].strip().startswith("{") else None
        return [(col[0], col[1], "in", vals)] if col and vals else None
    parts = [p for chunk in _split_top(text, "&&") for p in _split_top(chunk, "AND")]
    if len(parts) > 1:
        out = []
        for p in parts:
            sub = filter_conditions(p)
            if sub is None:
                return None
            out += sub
        return out
    for i, _c in _scan_top(text):
        if re.match(r"(?i)IN\b", text[i:i + 3]) and i > 0 and not re.match(r"\w", text[i - 1]):
            op, j = "in", i + 2
        else:
            op = next((o for o in _OPS if text.startswith(o, i)), None)
            if op is None:
                continue
            j = i + len(op)
            op = "in" if op in ("=", "==") else op
        col, vals = norm_column(text[:i]), _values(text[j:])
        return [(col[0], col[1], op, vals)] if col and vals else None
    return None
