"""rayfin/rayfin.yml lesen (kleiner YAML-Teil: Mappings, Listen, Skalare)."""
from __future__ import annotations

import os
import re
from dataclasses import dataclass, field


def _scalar(v: str):
    v = v.strip()
    if not v:
        return None
    if (v[0] == v[-1]) and v[0] in "\"'" and len(v) >= 2:
        return v[1:-1]
    low = v.lower()
    if low in ("true", "yes", "on"):
        return True
    if low in ("false", "no", "off"):
        return False
    if low in ("null", "~"):
        return None
    if re.fullmatch(r"-?\d+", v):
        return int(v)
    return v


def _strip_comment(line: str) -> str:
    out, q = [], None
    for i, ch in enumerate(line):
        if q:
            if ch == q:
                q = None
        elif ch in "\"'":
            q = ch
        elif ch == "#" and (i == 0 or line[i - 1] in " \t"):
            break
        out.append(ch)
    return "".join(out).rstrip()


def parse_yaml(text: str):
    lines = []
    for raw in text.split("\n"):
        s = _strip_comment(raw.replace("\t", "  "))
        if s.strip():
            lines.append((len(s) - len(s.lstrip(" ")), s.strip()))
    pos = 0

    def block(indent):
        nonlocal pos
        if pos >= len(lines):
            return None
        if lines[pos][1].startswith("- ") or lines[pos][1] == "-":
            out = []
            while pos < len(lines) and lines[pos][0] == indent and (lines[pos][1].startswith("- ") or lines[pos][1] == "-"):
                ind, s = lines[pos]
                item = s[1:].strip()
                if not item:
                    pos += 1
                    out.append(block(lines[pos][0]) if pos < len(lines) and lines[pos][0] > indent else None)
                elif re.match(r"^[^\s:]+(\s[^:]+)?:(\s|$)", item) and not item.startswith(('"', "'")):
                    # Mapping beginnt in der Listenzeile
                    lines[pos] = (ind + 2, item)
                    out.append(block(ind + 2))
                else:
                    pos += 1
                    out.append(_scalar(item))
            return out
        out = {}
        while pos < len(lines) and lines[pos][0] == indent and not lines[pos][1].startswith("- "):
            _, s = lines[pos]
            m = re.match(r"^([^:]+?):\s*(.*)$", s)
            pos += 1
            if not m:
                continue
            key, val = m.group(1).strip().strip("\"'"), m.group(2)
            if val.strip():
                out[key] = _scalar(val)
            elif pos < len(lines) and (lines[pos][0] > indent or (lines[pos][0] == indent and lines[pos][1].startswith("- "))):
                out[key] = block(lines[pos][0])
            else:
                out[key] = None
        return out

    return block(lines[0][0]) if lines else {}


@dataclass
class Connector:
    name: str
    type: str
    auth: str
    workspace_id: str = ""
    item_id: str = ""
    operations: list[str] = field(default_factory=list)


@dataclass
class RayfinApp:
    path: str
    raw: dict
    connectors: list[Connector]

    def get(self, *keys, default=None):
        cur = self.raw
        for k in keys:
            if not isinstance(cur, dict):
                return default
            cur = cur.get(k)
        return default if cur is None else cur


def load(app_dir: str) -> RayfinApp | None:
    p = os.path.join(app_dir, "rayfin", "rayfin.yml")
    if not os.path.exists(p):
        return None
    with open(p, encoding="utf-8-sig") as fh:
        raw = parse_yaml(fh.read()) or {}
    cons = []
    for c in raw.get("connectors") or []:
        if not isinstance(c, dict):
            continue
        cfg = c.get("config") or {}
        auth = (c.get("auth") or {}).get("type") or "?"
        ops = [o.get("name") for o in (c.get("operations") or []) if isinstance(o, dict)]
        cons.append(Connector(str(c.get("name")), str(c.get("type")), str(auth),
                              str(cfg.get("workspaceId") or ""), str(cfg.get("itemId") or ""), ops))
    return RayfinApp(p, raw, cons)
