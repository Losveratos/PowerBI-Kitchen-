"""Tenant-Modus: Clients aus den Abfrage-Logs gegen die Modelle aus der Scanner-API prüfen."""
from __future__ import annotations

from . import dax, rayfin
from .checks import AppResult, Binding, group, check_app, usage, SEV_ORDER, CATEGORIES
from .querylog import Client, is_service_principal
from .tmdl import Model


def _find_model(models: list[Model], c: Client) -> Model | None:
    if c.item_id:
        m = next((m for m in models if m.logical_id == c.item_id.lower()), None)
        if m:
            return m
    cand = [m for m in models if m.name.lower() == c.item_name.lower()]
    if len(cand) > 1 and c.workspace:
        cand = [m for m in cand if getattr(m, "workspace", "").lower() == c.workspace.lower()] or cand
    return cand[0] if cand else None


def scan_client(c: Client, models: list[Model]) -> AppResult:
    sp_users = sorted(u for u in c.users if is_service_principal(u))
    auth = "application" if sp_users and len(sp_users) == len(c.users) else "delegated"
    con = rayfin.Connector(name=c.item_name or c.item_id, type="fabric-semanticmodel", auth=auth, item_id=c.item_id)
    app = AppResult(name=c.label, path=f"{c.workspace} / {c.item_name}", rayfin=None, origin="log")
    app.meta = {"runs": c.runs, "distinct": len(c.texts), "users": len(c.users), "first": c.first, "last": c.last,
                "workspace": c.workspace, "model": c.item_name, "mdx": c.skipped_mdx, "sp_users": sp_users,
                "dropped": c.dropped}
    b = Binding(con)
    for i, (text, n) in enumerate(c.texts.most_common(), 1):
        q = dax.parse(text, f"Abfrage {i} · {n}× ausgeführt")
        q.connector = con.name
        b.queries.append(q)
    b.model = _find_model(models, c)
    b.method = "Item-ID aus dem Log" if b.model else ""
    app.bindings = [b]
    check_app(app, [], "", "")
    if sp_users:
        # Ein Service Principal ist für Automatisierung oft Vorgabe. Zum Befund wird er erst auf einem Modell mit
        # Zeilensicherheit: Er lässt sich keiner Rolle zuordnen und liest, wenn überhaupt, ungefiltert.
        rls = b.model is not None and bool(b.model.roles)
        part = "" if auth == "application" else " (teilweise)"
        if rls:
            app.add("security", "warn", "SEC-AUTH", "Service Principal fragt ein Modell mit Zeilensicherheit ab" + part,
                    f"{len(sp_users)} technische Identität(en). RLS filtert Service Principals nicht.", app.path, 0,
                    ", ".join(sp_users[:5]),
                    "Prüfen, wer die Daten des Clients sieht. Für Endnutzer delegiert abfragen oder die Ausnahme begründen.")
        else:
            app.add("security", "info", "SEC-AUTH", "Abfragen laufen unter einem Service Principal" + part,
                    f"{len(sp_users)} technische Identität(en) statt angemeldeter Nutzer.", app.path, 0,
                    ", ".join(sp_users[:5]), "")
    if c.skipped_mdx:
        app.add("lineage", "info", "LIN-MDX", f"{c.skipped_mdx} MDX-Abfragen nicht geprüft (z. B. Excel)", "", app.path)
    usage(b)
    app.findings = group(app.findings)
    app.findings.sort(key=lambda x: (SEV_ORDER[x.severity], [k for k, _ in CATEGORIES].index(x.category), x.title))
    return app


def scan_tenant(models: list[Model], clients: list[Client]) -> list[AppResult]:
    return [scan_client(c, models) for c in clients]


def model_rows(models: list[Model], apps: list[AppResult]) -> list[dict]:
    """Übersicht je Modell: Measures, RLS, abfragende Clients."""
    rows = []
    for m in models:
        users = [a for a in apps for b in a.bindings if b.model is m]
        used = set()
        for a in users:
            for b in a.bindings:
                if b.model is m:
                    used |= {x.lower() for x in b.measures_used}
        rows.append({"model": m.name, "workspace": getattr(m, "workspace", ""), "tables": len(m.tables),
                     "measures": m.measure_count, "rls": None if getattr(m, "roles_unknown", False) else len(m.roles),
                     "clients": [a.name for a in users],
                     "used": len(used), "error": getattr(m, "schema_error", "")})
    rows.sort(key=lambda r: (-len(r["clients"]), r["workspace"], r["model"]))
    return rows


def coverage(models: list[Model], apps: list[AppResult], workspaces: int | None = None,
             workspaces_monitoring: int | None = None, days: int | None = None, include_reports: bool = False,
             max_texts: int = 400) -> dict:
    """Was der Lauf gesehen hat und was nicht (Bericht: Abschnitt Abdeckung)."""
    log_apps = [a for a in apps if a.origin == "log"]
    queried = {id(b.model) for a in log_apps for b in a.bindings if b.model is not None}
    return {
        "workspaces": workspaces, "workspaces_monitoring": workspaces_monitoring,
        "models": len(models),
        "models_unreadable": sum(1 for m in models if getattr(m, "schema_error", "")),
        "models_names_only": sum(1 for m in models if getattr(m, "roles_unknown", False)),
        "models_queried": len(queried),
        "clients": len(log_apps),
        "runs": sum(a.meta.get("runs", 0) for a in log_apps),
        "distinct": sum(a.meta.get("distinct", 0) for a in log_apps),
        "mdx_skipped": sum(a.meta.get("mdx", 0) for a in log_apps),
        "dropped": sum(a.meta.get("dropped", 0) for a in log_apps),
        "max_texts": max_texts, "days": days, "reports_excluded": not include_reports,
    }
