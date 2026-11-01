"""Ausgabeordner eines Laufs: Bericht, Zusammenfassung und Daten nach festem Datenvertrag.

Datenvertrag (schema_version 1), gleich für CSV, JSON und die Tabelle fabscan_findings im Notebook.
Eine Zeile je Befund:

run_id, run_date, source, scope, client, client_path, workspace, model, category, category_label,
severity, rule, title, headline, why, todo, occurrences, runs, users, scanner_version
"""
from __future__ import annotations

import csv
import re
import datetime as _dt
import json
import os
import uuid

from . import __version__, report
from .checks import CATEGORIES, AppResult

SCHEMA_VERSION = 1
COLUMNS = ["run_id", "run_date", "source", "scope", "client", "client_path", "workspace", "model", "category",
           "category_label", "severity", "rule", "title", "headline", "why", "todo", "occurrences", "runs", "users",
           "scanner_version"]
LABEL = dict(CATEGORIES)
SYM = {"fail": "✗", "warn": "⚠", "info": "ℹ", "ok": "✓"}


def rows(apps: list[AppResult], scope: str = "", run_id: str | None = None, run_date: str | None = None) -> list[dict]:
    run_id = run_id or uuid.uuid4().hex[:12]
    run_date = run_date or _dt.date.today().isoformat()
    out = []
    for a in apps:
        model = a.meta.get("model") or ", ".join(b.model.name for b in a.bindings if b.model)
        for f in a.findings:
            t = report.plain(f, a.origin)
            out.append({"run_id": run_id, "run_date": run_date, "source": a.origin, "scope": scope, "client": a.name,
                        "client_path": a.path, "workspace": a.meta.get("workspace", ""), "model": model,
                        "category": f.category, "category_label": LABEL.get(f.category, f.category),
                        "severity": f.severity, "rule": f.rule, "title": f.title, "headline": t["head"],
                        "why": t["why"], "todo": t["todo"], "occurrences": len(f.occurrences),
                        "runs": a.meta.get("runs", 0), "users": a.meta.get("users", 0), "scanner_version": __version__})
    return out


def summary_md(apps: list[AppResult], title: str, html_name: str = "bericht.html") -> str:
    """Kurzfassung in Klartext, für Chat, Pull Request oder Ticket."""
    noun = "Clients" if any(a.origin == "log" for a in apps) else "Apps"
    single = noun[:-1]
    cnt = {s: sum(1 for a in apps for f in a.findings if f.severity == s) for s in ("fail", "warn", "info")}
    L = [f"# {title}", "",
         f"{len(apps)} {noun} geprüft · {cnt['fail']} kritisch · {cnt['warn']} zu prüfen · {cnt['info']} Hinweise", "",
         "## Gesamtbild", ""]
    ov = report.overall(apps, noun)
    L += [f"- {SYM[s]} " + re.sub(r"<[^>]+>", "", t) for s, t in ov] or ["- ✓ Keine Befunde, die geprüft werden müssten."]
    L += ["", f"## Je {single}", "",
          f"| {single} | " + " | ".join(lbl for _, lbl in CATEGORIES) + " |",
          "|---" * (len(CATEGORIES) + 1) + "|"]
    for a in apps:
        L.append(f"| {a.name} | " + " | ".join(SYM[a.status(c)] for c, _ in CATEGORIES) + " |")
    for a in apps:
        main = [f for f in a.findings if f.severity in ("fail", "warn")]
        if not main:
            continue
        L += ["", f"### {a.name}", "", report.profile(a), ""]
        for f in main:
            t = report.plain(f, a.origin)
            L.append(f"- {SYM[f.severity]} **{t['head']}** {t['why']}" + (f" *Was tun:* {t['todo']}" if t["todo"] else ""))
    L += ["", f"Ausführlich mit Datenweg und Fundstellen: `{html_name}`", ""]
    return "\n".join(L)


def write_run(apps: list[AppResult], out_dir: str, root: str = "", title: str = "", tenant: dict | None = None,
              scope: str = "") -> dict:
    """Schreibt bericht.html, zusammenfassung.md, befunde.json und befunde.csv nach out_dir."""
    os.makedirs(out_dir, exist_ok=True)
    title = title or ("Tenant-Prüfbericht Fabric Apps" if tenant else "Prüfbericht Fabric Apps")
    run_id = uuid.uuid4().hex[:12]
    data = rows(apps, scope, run_id)
    paths = {k: os.path.join(out_dir, v) for k, v in
             {"html": "bericht.html", "md": "zusammenfassung.md", "json": "befunde.json", "csv": "befunde.csv"}.items()}
    with open(paths["html"], "w", encoding="utf-8") as fh:
        fh.write(report.to_html(apps, root, title, tenant))
    with open(paths["md"], "w", encoding="utf-8") as fh:
        fh.write(summary_md(apps, title))
    detail = json.loads(report.to_json(apps, root))
    with open(paths["json"], "w", encoding="utf-8") as fh:
        json.dump({"schema_version": SCHEMA_VERSION, "run_id": run_id, "title": title, "scope": scope,
                   "created": detail.get("created"), "scanner": detail.get("scanner"), "findings": data,
                   "apps": detail.get("apps", []), "models": (tenant or {}).get("models", [])},
                  fh, ensure_ascii=False, indent=2, default=list)
    with open(paths["csv"], "w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=COLUMNS)
        w.writeheader()
        w.writerows(data)
    return paths
