"""Semantikmodell aus TMDL (Fabric-Git-/PBIP-Ordner) oder model.bim lesen.

Gelesen wird nur, was der Scanner braucht: Tabellen, Spalten, Measures,
Ausblendungen, Berechnungsgruppen und RLS-Rollen.
"""
from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass, field

from .dax import unquote_table


@dataclass
class Member:
    name: str
    kind: str                 # column | measure
    table: str
    hidden: bool = False
    expr: str = ""
    format: str = ""
    folder: str = ""
    file: str = ""
    line: int = 0


@dataclass
class Table:
    name: str
    hidden: bool = False
    calc_group: bool = False
    columns: dict[str, Member] = field(default_factory=dict)   # key: lower
    measures: dict[str, Member] = field(default_factory=dict)  # key: lower
    file: str = ""


@dataclass
class Model:
    name: str
    path: str
    logical_id: str = ""
    tables: dict[str, Table] = field(default_factory=dict)     # key: lower
    roles: dict[str, list[tuple[str, str]]] = field(default_factory=dict)

    def table(self, name: str) -> Table | None:
        return self.tables.get(name.lower())

    def measure(self, name: str) -> Member | None:
        for t in self.tables.values():
            m = t.measures.get(name.lower())
            if m:
                return m
        return None

    def any_column(self, name: str) -> Member | None:
        for t in self.tables.values():
            c = t.columns.get(name.lower())
            if c:
                return c
        return None

    @property
    def measure_count(self) -> int:
        return sum(len(t.measures) for t in self.tables.values())


_HEAD = re.compile(r"^(measure|column|calculationItem)\s+('(?:[^']|'')+'|[^=]+?)\s*(?:=\s*(.*))?$")


def _depth(line: str) -> int:
    d = 0
    for ch in line:
        if ch == "\t":
            d += 1
        else:
            break
    if d == 0:
        sp = len(line) - len(line.lstrip(" "))
        d = sp // 4
    return d


def _parse_tmdl_table(path: str, rel: str, model: Model) -> None:
    with open(path, encoding="utf-8-sig") as fh:
        lines = fh.read().split("\n")
    table: Table | None = None
    cur: Member | None = None
    cur_depth = 0
    in_expr = False
    fence = False
    for no, raw in enumerate(lines, 1):
        line = raw.rstrip("\r")
        s = line.strip()
        d = _depth(line)
        if fence:
            if s.startswith("```"):
                fence = False
            elif cur:
                cur.expr += "\n" + s
            continue
        if not s:
            continue
        if d == 0:
            m = re.match(r"^table\s+(.+)$", s)
            if m:
                table = Table(unquote_table(m.group(1)), file=rel)
                model.tables[table.name.lower()] = table
            cur = None
            continue
        if table is None:
            continue
        if cur and in_expr and d >= cur_depth + 2:
            cur.expr += "\n" + s
            continue
        in_expr = False
        if d == 1:
            cur = None
            if s == "isHidden":
                table.hidden = True
                continue
            if s.startswith("calculationGroup"):
                table.calc_group = True
                continue
            m = _HEAD.match(s)
            if m and m.group(1) in ("measure", "column"):
                kind = m.group(1)
                name = unquote_table(m.group(2))
                cur = Member(name, kind, table.name, file=rel, line=no)
                cur_depth = 1
                expr = (m.group(3) or "").strip()
                if expr.startswith("```"):
                    fence = True
                    expr = expr[3:]
                cur.expr = expr
                in_expr = True
                (table.measures if kind == "measure" else table.columns)[name.lower()] = cur
            continue
        if cur and d == cur_depth + 1:
            if s == "isHidden":
                cur.hidden = True
            elif s.startswith("formatString:"):
                cur.format = s.split(":", 1)[1].strip()
            elif s.startswith("displayFolder:"):
                cur.folder = s.split(":", 1)[1].strip()


def _parse_roles(folder: str, rel_base: str, model: Model) -> None:
    for fn in sorted(os.listdir(folder)):
        if not fn.endswith(".tmdl"):
            continue
        role = None
        with open(os.path.join(folder, fn), encoding="utf-8-sig") as fh:
            for raw in fh:
                s = raw.strip()
                m = re.match(r"^role\s+(.+)$", s)
                if m:
                    role = unquote_table(m.group(1))
                    model.roles.setdefault(role, [])
                    continue
                m = re.match(r"^tablePermission\s+('(?:[^']|'')+'|\S+)\s*=\s*(.*)$", s)
                if m and role:
                    model.roles[role].append((unquote_table(m.group(1)), m.group(2)))


def _parse_bim(path: str, model: Model) -> None:
    with open(path, encoding="utf-8-sig") as fh:
        data = json.load(fh)
    mdl = data.get("model", data)
    for t in mdl.get("tables", []):
        tb = Table(t["name"], hidden=bool(t.get("isHidden")), calc_group="calculationGroup" in t, file="model.bim")
        for c in t.get("columns", []):
            tb.columns[c["name"].lower()] = Member(c["name"], "column", tb.name, bool(c.get("isHidden")),
                                                    _join(c.get("expression", "")), c.get("formatString", ""), file="model.bim")
        for ms in t.get("measures", []):
            tb.measures[ms["name"].lower()] = Member(ms["name"], "measure", tb.name, bool(ms.get("isHidden")),
                                                     _join(ms.get("expression", "")), ms.get("formatString", ""),
                                                     ms.get("displayFolder", ""), file="model.bim")
        model.tables[tb.name.lower()] = tb
    for r in mdl.get("roles", []):
        model.roles[r["name"]] = [(tp["name"], _join(tp.get("filterExpression", ""))) for tp in r.get("tablePermissions", [])]


def _join(v) -> str:
    return "\n".join(v) if isinstance(v, list) else (v or "")


def load_model(folder: str, root: str) -> Model:
    """folder: der *.SemanticModel-Ordner."""
    name = os.path.basename(folder.rstrip("/"))
    if name.endswith(".SemanticModel"):
        name = name[: -len(".SemanticModel")]
    model = Model(name=name, path=os.path.relpath(folder, root))
    plat = os.path.join(folder, ".platform")
    if os.path.exists(plat):
        try:
            with open(plat, encoding="utf-8-sig") as fh:
                p = json.load(fh)
            model.name = p.get("metadata", {}).get("displayName", name)
            model.logical_id = p.get("config", {}).get("logicalId", "")
        except (OSError, ValueError):
            pass
    definition = os.path.join(folder, "definition")
    if os.path.isdir(definition):
        tdir = os.path.join(definition, "tables")
        if os.path.isdir(tdir):
            for fn in sorted(os.listdir(tdir)):
                if fn.endswith(".tmdl"):
                    p = os.path.join(tdir, fn)
                    _parse_tmdl_table(p, os.path.relpath(p, root), model)
        rdir = os.path.join(definition, "roles")
        if os.path.isdir(rdir):
            _parse_roles(rdir, root, model)
    elif os.path.exists(os.path.join(folder, "model.bim")):
        _parse_bim(os.path.join(folder, "model.bim"), model)
    return model


def find_models(root: str) -> list[Model]:
    out = []
    for dirpath, dirnames, _ in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in ("node_modules", ".git", "dist", "build", "fixtures")]
        for d in list(dirnames):
            if d.endswith(".SemanticModel"):
                out.append(load_model(os.path.join(dirpath, d), root))
                dirnames.remove(d)
    return out


def item_to_logical(item_id: str) -> str:
    """Fabric-Git legt die Item-ID im logicalId umgestellt ab (Blöcke gedreht).

    Beobachtet: itemId b0-b1-b2-b3 (je 8 Hex) → logicalId b3, swap(b2), swap(b1), b0,
    wobei swap die zwei 4er-Hälften tauscht. Gibt "" zurück, wenn keine GUID.
    """
    h = item_id.replace("-", "").lower()
    if not re.fullmatch(r"[0-9a-f]{32}", h):
        return ""
    b = [h[i:i + 8] for i in range(0, 32, 8)]
    sw = lambda x: x[4:] + x[:4]
    r = b[3] + sw(b[2]) + sw(b[1]) + b[0]
    return f"{r[0:8]}-{r[8:12]}-{r[12:16]}-{r[16:20]}-{r[20:]}"
