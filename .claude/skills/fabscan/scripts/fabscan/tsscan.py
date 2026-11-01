"""TypeScript/JavaScript einer Fabric App lesen: Abfragen, Rechnungen, Risiken."""
from __future__ import annotations

import os
import re
import subprocess
from dataclasses import dataclass, field

from . import dax

CODE_EXT = (".ts", ".tsx", ".js", ".jsx", ".mjs")
SKIP_DIRS = {"node_modules", "dist", "build", "coverage", ".git", "test", "tests", "__tests__", "inspection", ".agents"}
TEST_RX = re.compile(r"\.(spec|test|stories)\.[jt]sx?$")
ALLOWED_HOSTS = ("fabric.microsoft.com", "powerbi.com", "analysis.windows.net", "microsoft.com",
                 "microsoftonline.com", "windows.net", "fabricapps.net", "azure.com", "localhost", "127.0.0.1")
SECRET_RX = [
    ("Zugangsdaten im Code", re.compile(r"(?i)\b(client_?secret|api_?key|access_?token|auth_?token|password|passwd|secret)\b\s*[:=]\s*['\"`][^'\"`\s]{8,}['\"`]")),
    ("JWT-Token", re.compile(r"\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}")),
    ("Privater Schlüssel", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----")),
    ("Azure-Storage-Schlüssel", re.compile(r"AccountKey=[A-Za-z0-9+/=]{20,}|SharedAccessSignature=")),
    ("GitHub-Token", re.compile(r"\bgh[pousr]_[A-Za-z0-9]{36}\b")),
    ("AWS-Schlüssel", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
]
STOP_FIELDS = {"id", "key", "sort", "name", "label", "typ", "type", "text", "date", "jahr", "year", "monat",
               "month", "kpi", "info", "url", "title", "code", "kind", "row", "col", "level"}


@dataclass
class StrLit:
    start: int
    end: int
    value: str
    template: bool
    interp: bool


@dataclass
class SourceFile:
    path: str            # absolut
    rel: str             # relativ zum Repo
    text: str
    masked: str
    strings: list[StrLit]
    vendor: bool

    def line(self, pos: int) -> int:
        return self.text.count("\n", 0, pos) + 1

    def src_line(self, no: int) -> str:
        lines = self.text.split("\n")
        return lines[no - 1].strip() if 0 < no <= len(lines) else ""


def mask_ts(text: str) -> tuple[str, list[StrLit]]:
    out = list(text)
    lits: list[StrLit] = []
    i, n = 0, len(text)
    tstack: list[int] = []  # offene Template-Literale (Startpos), deren ${ } wir betreten haben
    brace: list[int] = []

    def blank(a, b):
        for k in range(a, b):
            if text[k] != "\n":
                out[k] = " "

    def read_template(start):
        """ab start (nach `) bis zum schließenden ` oder ${ – gibt (pos, interp) zurück"""
        j = start
        while j < n:
            if text[j] == "\\":
                j += 2
                continue
            if text[j] == "`":
                return j, False
            if text[j] == "$" and j + 1 < n and text[j + 1] == "{":
                return j, True
            j += 1
        return n, False

    while i < n:
        c = text[i]
        nx = text[i + 1] if i + 1 < n else ""
        if c == "/" and nx == "/":
            j = text.find("\n", i)
            j = n if j < 0 else j
            blank(i, j)
            i = j
        elif c == "/" and nx == "*":
            j = text.find("*/", i + 2)
            j = n if j < 0 else j + 2
            blank(i, j)
            i = j
        elif c in "\"'":
            j = i + 1
            while j < n and text[j] != c and text[j] != "\n":
                j += 2 if text[j] == "\\" else 1
            lits.append(StrLit(i, j + 1, text[i + 1:j], False, False))
            blank(i + 1, min(j, n))
            i = j + 1
        elif c == "`":
            j, interp = read_template(i + 1)
            parts = [text[i + 1:j]]
            blank(i + 1, j)
            start = i
            if interp:
                # Template mit ${…}: Ausdrücke bleiben Code, Textteile werden geblankt
                depth_end = j
                while interp and depth_end < n:
                    k, depth = depth_end + 2, 1
                    while k < n and depth:
                        if text[k] == "{":
                            depth += 1
                        elif text[k] == "}":
                            depth -= 1
                        k += 1
                    parts.append("${…}")
                    j2, interp = read_template(k)
                    parts.append(text[k:j2])
                    blank(k, j2)
                    depth_end = j2
                j = depth_end
                lits.append(StrLit(start, j + 1, "".join(parts), True, True))
            else:
                lits.append(StrLit(start, j + 1, parts[0], True, False))
            i = j + 1
        else:
            i += 1
    return "".join(out), lits


def list_sources(app_dir: str, repo_root: str) -> list[SourceFile]:
    files = []
    for dirpath, dirnames, filenames in os.walk(app_dir):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".")]
        if os.sep + "rayfin" in dirpath.replace(app_dir, ""):
            continue  # generierte Konnektor-Schemas
        for fn in filenames:
            if not fn.endswith(CODE_EXT) or fn.endswith(".d.ts") or TEST_RX.search(fn):
                continue
            if fn in ("vite.config.ts", "eslint.config.js", "vitest.config.ts", "tailwind.config.js", "postcss.config.js"):
                continue
            p = os.path.join(dirpath, fn)
            try:
                with open(p, encoding="utf-8") as fh:
                    text = fh.read()
            except (OSError, UnicodeDecodeError):
                continue
            if "scripts" in os.path.relpath(p, app_dir).split(os.sep)[:1]:
                continue
            masked, lits = mask_ts(text)
            rel = os.path.relpath(p, repo_root)
            files.append(SourceFile(p, rel, text, masked, lits, "/vendor/" in "/" + rel.replace(os.sep, "/")))
    return files


def dax_files(app_dir: str) -> list[str]:
    out = []
    for dirpath, dirnames, filenames in os.walk(app_dir):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".")]
        out += [os.path.join(dirpath, f) for f in filenames if f.endswith(".dax")]
    return sorted(out)


DAX_HINT = re.compile(r"\b(EVALUATE|SUMMARIZECOLUMNS|CALCULATETABLE|SELECTCOLUMNS|TREATAS)\b")


def inline_queries(f: SourceFile) -> list[tuple[StrLit, str]]:
    """String-Literale, die nach DAX aussehen (Text, ${…} durch Platzhalter ersetzt)."""
    out = []
    for s in f.strings:
        if s.template and DAX_HINT.search(s.value) and "EVALUATE" in s.value.upper():
            out.append((s, s.value.replace("${…}", "__X__")))
    return out


@dataclass
class Hit:
    file: SourceFile
    line: int
    rule: str
    evidence: str
    extra: dict = field(default_factory=dict)


ARITH = re.compile(r"\+=|-=|\*=|/=|\.reduce\s*\(|\bsum[A-Z]?\w*\s*\(|d3\.sum\s*\(|[\w\)\]]\s*[/*]\s*[\w\(\[]|[\w\)\]]\s+-\s+[\w\(]")


def calc_hits(files: list[SourceFile], fields: set[str]) -> list[Hit]:
    fields = {f for f in fields if len(f) >= 3 and f not in STOP_FIELDS}
    if not fields:
        return []
    frx = re.compile(r"(?:\.|\[\s*['\"])(" + "|".join(re.escape(f) for f in sorted(fields, key=len, reverse=True)) + r")\b", re.IGNORECASE)
    hits = []
    for f in files:
        if f.vendor:
            continue
        ml = f.masked.split("\n")
        tl = f.text.split("\n")
        for no, (m, t) in enumerate(zip(ml, tl), 1):
            if not ARITH.search(m):
                continue
            fm = frx.search(t)
            if not fm:
                continue
            if re.search(r"\bimport\b|^\s*(export\s+)?(interface|type)\b", m):
                continue
            if re.search(r"\.sort\s*\(", m) and not re.search(r"\+=|-=|reduce|[\w\)\]]\s*[/*]\s*[\w\(\[]", m):
                continue  # Sortier-Vergleich, keine Rechnung
            hits.append(Hit(f, no, "calc", t.strip(), {"field": fm.group(1)}))
    return hits


def security_hits(files: list[SourceFile]) -> list[Hit]:
    hits = []
    for f in files:
        for no, m in enumerate(f.masked.split("\n"), 1):
            t = f.src_line(no)
            if re.search(r"\b(localStorage|sessionStorage)\.setItem\s*\(|\bindexedDB\.open\s*\(", m):
                hits.append(Hit(f, no, "storage", t))
            if re.search(r"dangerouslySetInnerHTML|\.(inner|outer)HTML\s*=|insertAdjacentHTML\s*\(|(?<![\w.])eval\s*\(|new\s+Function\s*\(", m):
                hits.append(Hit(f, no, "html", t))
            if re.search(r"(?<![\w.])fetch\s*\(|\baxios\b|new\s+XMLHttpRequest|new\s+WebSocket\s*\(|navigator\.sendBeacon\s*\(", m):
                url = re.search(r"https?://([^/'\"`\s]+)", t)
                if url:
                    host = url.group(1).lower()
                    if not any(host == h or host.endswith("." + h) for h in ALLOWED_HOSTS):
                        hits.append(Hit(f, no, "external", t, {"host": host}))
                elif not f.vendor:
                    hits.append(Hit(f, no, "fetch-dynamic", t))
            if not f.vendor and re.search(r"(userPrincipalName|preferred_username|\bupn\b|\.email\b|account\.username)", t) \
                    and re.search(r"\.filter\s*\(|===|!==|\.includes\s*\(", m):
                hits.append(Hit(f, no, "client-filter", t))
        for label, rx in SECRET_RX:
            for s in rx.finditer(f.text):
                hits.append(Hit(f, f.line(s.start()), "secret", label))
    return hits


def runtime_query_hits(files: list[SourceFile]) -> list[Hit]:
    hits = []
    for f in files:
        if f.vendor:
            continue
        imports = re.findall(r"import\s+(\w+)\s+from\s+['\"][^'\"]+\.dax(?:\?raw)?['\"]", f.text)
        for name in imports:
            for r in re.finditer(r"\b" + re.escape(name) + r"\s*\.\s*(replace|replaceAll|concat)\s*\(", f.masked):
                hits.append(Hit(f, f.line(r.start()), "dax-replace", f.src_line(f.line(r.start())), {"query": name}))
        for s, _ in inline_queries(f):
            if s.interp:
                hits.append(Hit(f, f.line(s.start), "dax-template", f.src_line(f.line(s.start))))
    return hits


def sql_reads(files: list[SourceFile], connector: str) -> list[Hit]:
    hits = []
    for f in files:
        if f.vendor or not re.search(r"connectors\s*\.\s*" + re.escape(connector) + r"\b|connectors\[\s*['\"]" + re.escape(connector), f.text):
            continue
        for r in re.finditer(r"\.\s*([A-Za-z_]\w*)\s*\.\s*select\s*\(\s*\[([^\]]*)\]\s*\)((?:\s*\.\s*\w+\s*\([^)]*\))*)", f.text):
            cols = re.findall(r"['\"]([^'\"]+)['\"]", r.group(2))
            chain = r.group(3)
            hits.append(Hit(f, f.line(r.start()), "sql-read", f"{r.group(1)}: {', '.join(cols)}",
                            {"table": r.group(1), "columns": cols, "filtered": bool(re.search(r"\.\s*where\s*\(", chain)),
                             "all": bool(re.search(r"first\s*\(\s*ALL\s*\)", chain))}))
    return hits


def local_data_imports(files: list[SourceFile]) -> list[Hit]:
    hits = []
    for f in files:
        if f.vendor:
            continue
        for r in re.finditer(r"import\s+[^;]*?from\s+['\"]([^'\"]+\.(?:json|csv|tsv|parquet|xlsx))['\"]", f.text):
            path = r.group(1)
            if re.search(r"\.vl\.json$|\.vg\.json$|/i18n/|locale|translations|theme|tsconfig|package\.json", path):
                continue
            hits.append(Hit(f, f.line(r.start()), "local-data", path))
    return hits


def tracked_files(repo_root: str, app_dir: str) -> list[str]:
    try:
        out = subprocess.run(["git", "-C", repo_root, "ls-files", "--", os.path.relpath(app_dir, repo_root)],
                             capture_output=True, text=True, timeout=30, check=False).stdout
        return [l for l in out.split("\n") if l]
    except (OSError, subprocess.SubprocessError):
        return []


def html_externals(app_dir: str, repo_root: str) -> list[tuple[str, int, str]]:
    out = []
    for dirpath, dirnames, filenames in os.walk(app_dir):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".")]
        for fn in filenames:
            if fn.endswith(".html"):
                p = os.path.join(dirpath, fn)
                with open(p, encoding="utf-8", errors="replace") as fh:
                    for no, line in enumerate(fh, 1):
                        if re.search(r"<script[^>]+src=['\"]https?://|<link[^>]+href=['\"]https?://", line, re.I):
                            url = re.search(r"https?://([^/'\"]+)", line).group(1)
                            if not any(url == h or url.endswith("." + h) for h in ALLOWED_HOSTS):
                                out.append((os.path.relpath(p, repo_root), no, line.strip()))
    return out


def query_fields(queries: list[dax.Query]) -> set[str]:
    out = set()
    for q in queries:
        for p in q.projections:
            out.add(p.alias.lower())
        for r in q.refs:
            out.add(r.name.lower())
    return out
