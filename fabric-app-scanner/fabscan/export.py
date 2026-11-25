"""Ausgabeordner eines Laufs: Bericht, Zusammenfassung und Daten nach festem Datenvertrag.

Datenvertrag (schema_version 1), gleich für CSV, JSON und die Tabelle fabscan_findings im Notebook.
Eine Zeile je Befund:

run_id, run_date, source, scope, client, client_path, workspace, model, category, category_label,
severity, rule, title, headline, why, todo, occurrences, runs, users, scanner_version,
finding_id, status, exception_reason, exception_owner, exception_until

Version 2 (fabscan 0.6): finding_id ist über Läufe stabil, status ist offen, akzeptiert oder abgelaufen.
Akzeptierte Befunde stehen mit drin, damit ein Trend „behoben“ und „akzeptiert“ unterscheiden kann.
Version 3 (fabscan 0.7): Spalte first_seen (erster Lauf mit diesem Befund, aus dem Vorlauf übernommen; gleich
run_date heißt neu), Spalte theme (Thema der Ampel: zahl, rls, weg, abfluss, zuordnung).
"""
from __future__ import annotations

import csv
import re
import datetime as _dt
import json
import os
import uuid

from . import __version__, report, themen, verlauf
from .checks import CATEGORIES, AppResult

SCHEMA_VERSION = 3
COLUMNS = ["run_id", "run_date", "source", "scope", "client", "client_path", "workspace", "model", "category",
           "category_label", "severity", "rule", "title", "headline", "why", "todo", "occurrences", "runs", "users",
           "scanner_version", "finding_id", "status", "exception_reason", "exception_owner", "exception_until",
           "first_seen", "theme"]
LABEL = dict(CATEGORIES)
SYM = {"fail": "✗", "warn": "⚠", "info": "ℹ", "ok": "✓"}


def rows(apps: list[AppResult], scope: str = "", run_id: str | None = None, run_date: str | None = None,
         first_seen: dict | None = None) -> list[dict]:
    run_id = run_id or uuid.uuid4().hex[:12]
    run_date = run_date or _dt.date.today().isoformat()
    out = []
    for a in apps:
        model = a.meta.get("model") or ", ".join(b.model.name for b in a.bindings if b.model)
        for f in a.findings + a.accepted:
            t = report.plain(f, a.origin)
            ex = f.exception or {}
            out.append({"run_id": run_id, "run_date": run_date, "source": a.origin, "scope": scope, "client": a.name,
                        "client_path": a.path, "workspace": a.meta.get("workspace", ""), "model": model,
                        "category": f.category, "category_label": LABEL.get(f.category, f.category),
                        "severity": f.severity, "rule": f.rule, "title": f.title, "headline": t["head"],
                        "why": t["why"], "todo": t["todo"], "occurrences": len(f.occurrences),
                        "runs": a.meta.get("runs", 0), "users": a.meta.get("users", 0), "scanner_version": __version__,
                        "finding_id": f.id, "status": f.status, "exception_reason": ex.get("begruendung", ""),
                        "exception_owner": ex.get("verantwortlich", ""), "exception_until": ex.get("bis", ""),
                        "first_seen": (first_seen or {}).get(f.id, run_date), "theme": themen.theme_of(f)})
    return out


def summary_md(apps: list[AppResult], title: str, html_name: str = "bericht.html", extra: dict | None = None) -> str:
    """Kurzfassung in Klartext, für Chat, Pull Request oder Ticket."""
    noun = "Clients" if any(a.origin == "log" for a in apps) else "Apps"
    single = noun[:-1]
    cnt = {s: sum(1 for a in apps for f in a.findings if f.severity == s) for s in ("fail", "warn", "info")}
    n_acc = sum(len(a.accepted) for a in apps)
    L = [f"# {title}", "",
         f"{len(apps)} {noun} geprüft · {cnt['fail']} kritisch · {cnt['warn']} zu prüfen · {cnt['info']} Hinweise"
         + (f" · {n_acc} bewusst akzeptiert" if n_acc else ""), ""]
    cov = report.coverage_lines((extra or {}).get("coverage"))
    if cov:
        L += ["## Abdeckung", ""] + [f"- {x}" for x in cov] + [""]
    tr = verlauf.trend_line((extra or {}).get("trend"))
    L += ["## Auf einen Blick", ""] + ([tr, ""] if tr else [])
    L += [f"| {single} | " + " | ".join(lbl for _, lbl, _ in themen.THEMES) + " |",
          "|---" * (len(themen.THEMES) + 1) + "|"]
    for a in apps:
        ts = themen.theme_status(a)
        L.append(f"| {a.name} | " + " | ".join(themen.STATE_SYM[ts[k][0]] for k, _, _ in themen.THEMES) + " |")
    L += ["", "✗ kritisch · ⚠ prüfen · ✓ geprüft, unauffällig · ? nicht prüfbar", ""]
    acts = themen.actions(apps, (extra or {}).get("trend"))
    if acts:
        L += ["**Die wichtigsten Maßnahmen**", ""]
        for i, g in enumerate(acts[:3], 1):
            L.append(f"{i}. {g['head']} *Nächster Schritt:* {g['todo'] or g['why']} ({g['who']}, Aufwand {g['effort']}, "
                     f"{len(g['clients'])} {noun if len(g['clients']) != 1 else single})")
        L.append("")
    L += ["## Gesamtbild", ""]
    ov = report.overall(apps, noun)
    L += [f"- {SYM[s]} " + re.sub(r"<[^>]+>", "", t) for s, t in ov] or ["- ✓ Keine Befunde, die geprüft werden müssten."]
    for a in apps:
        main = [f for f in a.findings if f.severity in ("fail", "warn")]
        if not main:
            continue
        L += ["", f"### {a.name}", "", report.profile(a), ""]
        for f in main:
            t = report.plain(f, a.origin)
            L.append(f"- {SYM[f.severity]} **{t['head']}** {t['why']}" + (f" *Was tun:* {t['todo']}" if t["todo"] else ""))
    if n_acc:
        L += ["", "## Bewusst akzeptiert", ""]
        for a in apps:
            for f in a.accepted:
                ex = f.exception or {}
                L.append(f"- {a.name}: {report.plain(f, a.origin)['head']} *Begründung:* {ex.get('begruendung', '')}"
                         + (f" ({ex['verantwortlich']}" + (f", bis {ex['bis']})" if ex.get("bis") else ")")
                            if ex.get("verantwortlich") else "") + f" `{f.id}`")
    L += ["", f"Ausführlich mit Datenweg und Fundstellen: `{html_name}`", ""]
    return "\n".join(L)


def write_run(apps: list[AppResult], out_dir: str, root: str = "", title: str = "", tenant: dict | None = None,
              scope: str = "", extra: dict | None = None, previous: dict | None = None,
              history_path: str | None = None) -> dict:
    """Schreibt bericht.html, zusammenfassung.md, befunde.json und befunde.csv nach out_dir.
    extra: {"coverage": …, "ausnahmen": …} für Abdeckung und Ausnahmen im Bericht.
    previous: befunde.json des Vorlaufs (verlauf.load_previous) für den Trend; history_path: verlauf.json, an die
    dieser Lauf angehängt wird (Zeitreihe je Thema)."""
    os.makedirs(out_dir, exist_ok=True)
    title = title or ("Tenant-Prüfbericht Fabric Apps" if tenant else "Prüfbericht Fabric Apps")
    run_id = uuid.uuid4().hex[:12]
    run_date = _dt.date.today().isoformat()
    trend = verlauf.compare(apps, previous, run_date)
    history = verlauf.load_history(history_path) if history_path else []
    history.append(verlauf.snapshot(apps, run_id, run_date, (extra or {}).get("coverage")))
    extra = {**(extra or {}), "trend": trend, "history": history}
    data = rows(apps, scope, run_id, run_date, trend["first_seen"])
    paths = {k: os.path.join(out_dir, v) for k, v in
             {"html": "bericht.html", "md": "zusammenfassung.md", "json": "befunde.json", "csv": "befunde.csv"}.items()}
    with open(paths["html"], "w", encoding="utf-8") as fh:
        fh.write(report.to_html(apps, root, title, tenant, extra))
    with open(paths["md"], "w", encoding="utf-8") as fh:
        fh.write(summary_md(apps, title, extra=extra))
    detail = json.loads(report.to_json(apps, root))
    with open(paths["json"], "w", encoding="utf-8") as fh:
        json.dump({"schema_version": SCHEMA_VERSION, "run_id": run_id, "run_date": run_date, "title": title, "scope": scope,
                   "trend": {k: v for k, v in trend.items() if k != "first_seen"},
                   "themes": {a.name: {k: v[0] for k, v in themen.theme_status(a).items()} for a in apps},
                   "created": detail.get("created"), "scanner": detail.get("scanner"), "findings": data,
                   "apps": detail.get("apps", []), "models": (tenant or {}).get("models", []),
                   "coverage": (extra or {}).get("coverage"), "ausnahmen": (extra or {}).get("ausnahmen")},
                  fh, ensure_ascii=False, indent=2, default=list)
    with open(paths["csv"], "w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=COLUMNS)
        w.writeheader()
        w.writerows(data)
    if history_path:
        verlauf.write_history(history_path, history)
        paths["history"] = history_path
    return paths
