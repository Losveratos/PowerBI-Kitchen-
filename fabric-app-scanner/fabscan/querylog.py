"""Abfragen aus den Semantikmodell-Logs (Workspace Monitoring, Tabelle SemanticModelLogs).

Spalten wie dokumentiert: Timestamp, WorkspaceId, WorkspaceName, ItemId, ItemName, ApplicationName,
ApplicationContext, ExecutingUser, User, EventText, OperationName, DurationMs.
https://learn.microsoft.com/fabric/enterprise/powerbi/semantic-model-operations

Gelesen werden CSV, JSON (Liste) oder JSON Lines.
"""
from __future__ import annotations

import csv
import json
import re
from collections import Counter
from dataclasses import dataclass, field

QUERY_OPS = {"queryend", ""}   # QueryEnd trägt Text und Dauer; QueryBegin wäre doppelt


@dataclass
class LogQuery:
    ts: str
    workspace: str
    workspace_id: str
    item_id: str
    item_name: str
    app: str
    context: str
    user: str
    text: str
    duration: float = 0.0
    count: int = 1                # bei vorab zusammengefassten Logs (KQL summarize)
    last: str = ""


@dataclass
class Client:
    """Eine Anwendung, die ein Modell abfragt (z. B. eine Fabric App)."""
    label: str
    app: str
    item_id: str
    item_name: str
    workspace: str
    texts: Counter = field(default_factory=Counter)
    users: set = field(default_factory=set)
    first: str = ""
    last: str = ""
    duration_ms: float = 0.0
    skipped_mdx: int = 0

    @property
    def runs(self) -> int:
        return sum(self.texts.values())


def _rows(path: str):
    with open(path, encoding="utf-8-sig") as fh:
        head = fh.read(2048)
        fh.seek(0)
        if path.lower().endswith(".csv"):
            yield from csv.DictReader(fh)
        elif head.lstrip().startswith("["):
            yield from json.load(fh)
        else:
            for line in fh:
                if line.strip():
                    yield json.loads(line)


def _s(v) -> str:
    if v is None:
        return ""
    if hasattr(v, "isoformat"):
        return v.isoformat()
    return v if isinstance(v, str) else json.dumps(v, ensure_ascii=False, default=str)


def load_log(src) -> list[LogQuery]:
    rows = _rows(src) if isinstance(src, str) else src
    out = []
    for r in rows:
        op = _s(r.get("OperationName")).lower()
        if op not in QUERY_OPS:
            continue
        text = _s(r.get("EventText") or r.get("QueryText"))
        if not text.strip():
            continue
        ctx = _s(r.get("ApplicationContext"))
        if str(r.get("IsReport")).lower() == "true":
            ctx = ctx or '{"ReportId": "?"}'
        first = _s(r.get("FirstSeen") or r.get("Timestamp"))
        out.append(LogQuery(first, _s(r.get("WorkspaceName")), _s(r.get("WorkspaceId")),
                            _s(r.get("ItemId")).lower(), _s(r.get("ItemName")), _s(r.get("ApplicationName")),
                            ctx, _s(r.get("ExecutingUser") or r.get("User")), text,
                            float(r.get("DurationMs") or 0), int(r.get("Count") or 1), _s(r.get("LastSeen") or r.get("Timestamp"))))
    return out


def is_report_query(q: LogQuery) -> bool:
    """Abfragen aus Power-BI-Berichten tragen eine ReportId im ApplicationContext."""
    return bool(re.search(r'"?ReportId"?\s*:', q.context, re.I)) or q.app.lower() in ("powerbi", "power bi", "pbidesktop")


def is_mdx(text: str) -> bool:
    t = re.sub(r"^(\s|//[^\n]*\n|--[^\n]*\n)*", "", text).upper()
    return t.startswith("SELECT") or t.startswith("WITH ") or t.startswith("DRILLTHROUGH")


def is_service_principal(user: str) -> bool:
    u = user.strip().lower()
    return bool(u) and ("@" not in u or u.startswith("app@") or re.fullmatch(r"[0-9a-f-]{36}(@.*)?", u) is not None)


def kql(days: int = 14, include_reports: bool = False, table: str = "SemanticModelLogs") -> str:
    """KQL für das Monitoring-Eventhouse: QueryEnd der letzten Tage, gleiche Abfragen zusammengefasst."""
    return (f"{table}\n"
            f"| where Timestamp > ago({int(days)}d) and OperationName == \"QueryEnd\"\n"
            "| extend IsReport = tostring(ApplicationContext) has \"ReportId\"\n"
            f"| where {'true' if include_reports else 'false'} or not(IsReport)\n"
            "| summarize Count = count(), FirstSeen = min(Timestamp), LastSeen = max(Timestamp), DurationMs = sum(DurationMs)\n"
            "    by WorkspaceId, WorkspaceName, ItemId, ItemName, ApplicationName, ExecutingUser, EventText, IsReport\n"
            "| extend OperationName = \"QueryEnd\"")


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def clients(entries: list[LogQuery], include_reports: bool = False, max_texts: int = 400) -> list[Client]:
    """Gruppiert nach Anwendung und Modell; gleiche Abfragen (bis auf Leerraum) werden gezählt."""
    out: dict[tuple, Client] = {}
    for q in entries:
        if not include_reports and is_report_query(q):
            continue
        app = q.app or "(ohne Anwendungsname)"
        key = (app.lower(), q.item_id or q.item_name.lower())
        c = out.get(key)
        if c is None:
            c = out[key] = Client(label=app, app=app, item_id=q.item_id, item_name=q.item_name, workspace=q.workspace)
        if is_mdx(q.text):
            c.skipped_mdx += q.count
            continue
        norm = normalize(q.text)
        if norm in c.texts or len(c.texts) < max_texts:
            c.texts[norm] += q.count
        if q.user:
            c.users.add(q.user)
        c.first = min(c.first, q.ts) if c.first else q.ts
        c.last = max(c.last, q.last or q.ts)
        c.duration_ms += q.duration
    return sorted(out.values(), key=lambda c: (-c.runs, c.label))
