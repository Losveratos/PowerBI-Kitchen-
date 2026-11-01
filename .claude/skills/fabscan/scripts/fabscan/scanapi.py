"""Semantikmodelle aus der Admin-Scanner-API (WorkspaceInfo GetScanResult).

Aufruf mit datasetSchema=True und datasetExpressions=True, sonst fehlen Tabellen bzw. DAX.
Format: https://learn.microsoft.com/rest/api/power-bi/admin/workspace-info-get-scan-result
"""
from __future__ import annotations

import json

from .tmdl import Member, Model, Table


def _models_from_result(data: dict) -> list[Model]:
    out = []
    for ws in data.get("workspaces", []) or []:
        for ds in ws.get("datasets", []) or []:
            m = Model(name=ds.get("name", "?"), path=f"{ws.get('name', '?')} / {ds.get('name', '?')}",
                      logical_id=(ds.get("id") or "").lower())
            m.workspace = ws.get("name", "")            # type: ignore[attr-defined]
            m.workspace_id = ws.get("id", "")           # type: ignore[attr-defined]
            m.schema_error = ds.get("schemaRetrievalError", "")  # type: ignore[attr-defined]
            m.endorsement = (ds.get("endorsementDetails") or {}).get("endorsement", "")  # type: ignore[attr-defined]
            for t in ds.get("tables", []) or []:
                tb = Table(t.get("name", "?"), hidden=bool(t.get("isHidden")), file=m.path)
                for c in t.get("columns", []) or []:
                    tb.columns[c["name"].lower()] = Member(c["name"], "column", tb.name, bool(c.get("isHidden")),
                                                            c.get("expression", "") or "", c.get("formatString", "") or "", file=m.path)
                for ms in t.get("measures", []) or []:
                    tb.measures[ms["name"].lower()] = Member(ms["name"], "measure", tb.name, bool(ms.get("isHidden")),
                                                             ms.get("expression", "") or "", ms.get("formatString", "") or "", file=m.path)
                m.tables[tb.name.lower()] = tb
            for r in ds.get("roles", []) or []:
                m.roles[r.get("name", "?")] = [(tp.get("name", ""), tp.get("filterExpression", "")) for tp in r.get("tablePermissions", []) or []]
            out.append(m)
    return out


def load_scan(src) -> list[Model]:
    """src: Pfad zu einer JSON-Datei, ein dict oder eine Liste von Scan-Ergebnissen."""
    if isinstance(src, str):
        with open(src, encoding="utf-8-sig") as fh:
            src = json.load(fh)
    results = src if isinstance(src, list) else [src]
    models = []
    for r in results:
        models += _models_from_result(r)
    return models
