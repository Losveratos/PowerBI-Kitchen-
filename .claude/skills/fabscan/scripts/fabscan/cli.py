"""fabscan – Governance-Prüfung für Fabric Apps.

  fabscan [PFAD]                         Apps im Repo prüfen (Standard: aktueller Ordner)
  fabscan --scan-result S --query-log L  Tenant prüfen (Admin-Scanner-API + Abfrage-Logs)
  fabscan fetch [-w WORKSPACE]           Tenant direkt prüfen (Anmeldung über az login oder Service Principal)
  fabscan notebook [-o DATEI]            Fabric-Notebook für den Tenant-Scan schreiben
  fabscan skill [--ziel ORDNER | --zip DATEI]   Skill für Claude installieren oder als ZIP packen

Jeder Prüflauf schreibt einen Ordner (Standard: fabscan-bericht/) mit
bericht.html, zusammenfassung.md, befunde.json und befunde.csv.
Exit-Code: 0 = unter der Schwelle (--fail-on) · 1 = Befunde ab Schwelle · 2 = Aufruffehler.
"""
from __future__ import annotations

import argparse
import json
import os
import sys

from . import __version__, checks, export, fetch, querylog, report, scanapi, tenant, tmdl


def _scan_parser(prog: str) -> argparse.ArgumentParser:
    ap = argparse.ArgumentParser(prog=prog, description="Governance-Prüfung für Fabric Apps (Rayfin) und den Fabric-Tenant.",
                                 epilog="Weitere Befehle: fabscan fetch · fabscan notebook · fabscan skill")
    ap.add_argument("repo", nargs="?", default=None, help="Repository mit Apps (rayfin/rayfin.yml) und *.SemanticModel-Ordnern; "
                                                          "Standard: aktueller Ordner, außer im reinen Tenant-Modus")
    ap.add_argument("-o", "--out", default="fabscan-bericht", help="Ausgabeordner (Standard: fabscan-bericht)")
    ap.add_argument("--title", default="", help="Titel des Berichts")
    ap.add_argument("--app", action="append", default=[], help="nur diese App(s) prüfen (Ordnername)")
    ap.add_argument("--models", action="append", default=[], help="weitere Ordner mit *.SemanticModel")
    ap.add_argument("--config", help="fabscan.json (Standard: <repo>/fabscan.json)")
    ap.add_argument("--scan-result", action="append", default=[], help="Antwort der Admin-Scanner-API (JSON)")
    ap.add_argument("--query-log", action="append", default=[], help="Export der SemanticModelLogs (CSV/JSON/JSONL)")
    ap.add_argument("--include-reports", action="store_true", help="auch Abfragen aus Power-BI-Berichten prüfen")
    ap.add_argument("--fail-on", choices=["fail", "warn", "never"], default="never",
                    help="ab welcher Stufe der Exit-Code 1 ist (für CI: fail)")
    ap.add_argument("--html", help=argparse.SUPPRESS)   # Altaufrufe: einzelne Dateien
    ap.add_argument("--json", help=argparse.SUPPRESS)
    ap.add_argument("-q", "--quiet", action="store_true", help="nur Pfade ausgeben")
    ap.add_argument("--version", action="version", version=f"fabscan {__version__}")
    return ap


def cmd_scan(argv) -> int:
    ap = _scan_parser("fabscan")
    a = ap.parse_args(argv)
    tenant_only = bool(a.query_log or a.scan_result) and a.repo is None
    root = "" if tenant_only else os.path.abspath(a.repo or ".")
    if root and not os.path.isdir(root):
        print(f"Kein Ordner: {root}", file=sys.stderr)
        return 2
    cfg_path = a.config or (os.path.join(root, "fabscan.json") if root else "")
    cfg = {}
    if cfg_path and os.path.exists(cfg_path):
        with open(cfg_path, encoding="utf-8") as fh:
            cfg = json.load(fh)

    models = tmdl.find_models(root) if root else []
    for extra in a.models + cfg.get("models", []):
        models += tmdl.find_models(extra if os.path.isabs(extra) else os.path.join(root or ".", extra))
    for sr in a.scan_result:
        models += scanapi.load_scan(sr)

    apps, tenant_info = [], None
    if root:
        app_dirs = checks.find_apps(root)
        if a.app:
            app_dirs = [d for d in app_dirs if os.path.basename(d) in a.app]
        if not app_dirs and not a.query_log:
            print(f"Keine Fabric App gefunden (rayfin/rayfin.yml) unter {root}.\n"
                  "Für den Tenant: fabscan --scan-result scan.json --query-log logs.csv, "
                  "oder das Notebook erzeugen: fabscan notebook", file=sys.stderr)
            return 2
        apps = [checks.scan_app(d, root, models, cfg.get("connectors", {})) for d in app_dirs]
    if a.query_log or (a.scan_result and not apps):
        entries = []
        for ql in a.query_log:
            entries += querylog.load_log(ql)
        log_apps = tenant.scan_tenant(models, querylog.clients(entries, include_reports=a.include_reports))
        apps += log_apps
        tenant_info = {"models": tenant.model_rows(models, log_apps), "scope": "Tenant"}

    scope = os.path.basename(root) if root else "Tenant"
    paths = export.write_run(apps, a.out, root, a.title, tenant_info, scope)
    if a.html:
        with open(a.html, "w", encoding="utf-8") as fh:
            fh.write(report.to_html(apps, root, a.title, tenant_info))
    if a.json:
        with open(a.json, "w", encoding="utf-8") as fh:
            fh.write(report.to_json(apps, root))
    if not a.quiet:
        print(report.to_text(apps) if apps else "Keine Apps oder Clients mit Abfragen gefunden.")
        print(f"\nBericht:          {paths['html']}\nZusammenfassung:  {paths['md']}\n"
              f"Daten:            {paths['json']} · {paths['csv']}")
    else:
        print(paths["html"])
    return _fail_code(apps, a.fail_on)


def _fail_code(apps, fail_on: str) -> int:
    if fail_on == "never":
        return 0
    worst = min((checks.SEV_ORDER[f.severity] for x in apps for f in x.findings), default=9)
    return 1 if worst <= checks.SEV_ORDER[fail_on] else 0


def cmd_fetch(argv, fetcher=None) -> int:
    ap = argparse.ArgumentParser(prog="fabscan fetch",
                                 description="Tenant direkt prüfen: Modelle über die Admin-Scanner-API, tatsächlich "
                                             "ausgeführte Abfragen aus dem Workspace Monitoring. Nur Lesezugriffe.")
    ap.add_argument("-w", "--workspace", action="append", default=[],
                    help="Workspace-Name oder -ID (mehrfach möglich); ohne Angabe alle aktiven Workspaces")
    ap.add_argument("--monitoring", action="append", default=[], metavar="URI=DATENBANK",
                    help="Monitoring-KQL-Datenbank; ohne Angabe sucht fabscan sie in den Workspaces")
    ap.add_argument("--days", type=int, default=14, help="Zeitraum der Abfragen in Tagen (Standard 14)")
    ap.add_argument("--include-reports", action="store_true", help="auch Abfragen aus Power-BI-Berichten prüfen")
    ap.add_argument("--tenant", help="Tenant-ID (sonst AZURE_TENANT_ID bzw. der aktuelle az-Kontext)")
    ap.add_argument("--log-table", default="SemanticModelLogs")
    ap.add_argument("-o", "--out", default="fabscan-tenant", help="Ausgabeordner (Standard: fabscan-tenant)")
    ap.add_argument("--title", default="")
    ap.add_argument("--fail-on", choices=["fail", "warn", "never"], default="never")
    a = ap.parse_args(argv)
    f = fetcher or fetch.Fetcher(fetch.Auth(a.tenant))
    raw = os.path.join(a.out, "rohdaten")
    try:
        print("1 · Workspaces")
        ids = f.workspaces(a.workspace)
        print("2 · Modelle (Admin-Scanner-API)")
        results = f.scan(ids)
        os.makedirs(raw, exist_ok=True)
        with open(os.path.join(raw, "scan.json"), "w", encoding="utf-8") as fh:
            json.dump(results, fh, ensure_ascii=False, default=str)
        models = scanapi.load_scan(results)
        print(f"  {len(models)} Semantikmodelle, {sum(m.measure_count for m in models)} Measures")
        if models and not any(m.tables for m in models):
            print("  Achtung: keine Tabellen im Scan. Tenant-Einstellungen für detaillierte Metadaten und "
                  "DAX-Ausdrücke prüfen.")
        print("3 · Abfragen (Workspace Monitoring)")
        mons = [tuple(m.split("=", 1)) for m in a.monitoring if "=" in m] or f.find_monitoring(ids)
        rows = []
        for cluster, db in mons:
            part = f.logs(cluster, db, a.days, a.include_reports, a.log_table)
            print(f"  {db}: {len(part)} verschiedene Abfragen")
            rows += part
        with open(os.path.join(raw, "abfragen.json"), "w", encoding="utf-8") as fh:
            json.dump(rows, fh, ensure_ascii=False, default=str)
    except fetch.FetchError as e:
        print(f"\nAbbruch: {e}", file=sys.stderr)
        return 2
    entries = querylog.load_log(rows)
    log_apps = tenant.scan_tenant(models, querylog.clients(entries, include_reports=a.include_reports))
    info = {"models": tenant.model_rows(models, log_apps), "scope": "Tenant"}
    paths = export.write_run(log_apps, a.out, "", a.title or "Tenant-Prüfbericht Fabric Apps", info, scope="Tenant")
    print("4 · Bericht\n")
    print(report.to_text(log_apps) if log_apps else "Keine Clients mit Abfragen im Zeitraum (nur Modell-Übersicht).")
    for n in f.notes:
        print(f"\nHinweis: {n}")
    print(f"\nBericht:          {paths['html']}\nZusammenfassung:  {paths['md']}\n"
          f"Daten:            {paths['json']} · {paths['csv']}\nRohdaten:         {raw}\n"
          f"Angemeldet über:  {f.auth.method or '–'}")
    return _fail_code(log_apps, a.fail_on)


def cmd_notebook(argv) -> int:
    ap = argparse.ArgumentParser(prog="fabscan notebook", description="Fabric-Notebook für den Tenant-Scan schreiben.")
    ap.add_argument("-o", "--out", default="fabscan_tenant.ipynb")
    a = ap.parse_args(argv)
    from . import notebook
    path = notebook.build(a.out)
    print(f"{path}\nIn einen Fabric-Workspace importieren, Lakehouse anhängen, Parameter ausfüllen, alle ausführen.")
    return 0


def cmd_skill(argv) -> int:
    ap = argparse.ArgumentParser(prog="fabscan skill", description="Skill für Claude installieren oder als ZIP packen.")
    ap.add_argument("--ziel", help="Zielordner (Standard: ~/.claude/skills/fabscan)")
    ap.add_argument("--zip", help="ZIP für claude.ai schreiben (Einstellungen → Skills → hochladen)")
    a = ap.parse_args(argv)
    from . import skill
    if a.zip:
        print(skill.write_zip(a.zip))
        print("In claude.ai unter Einstellungen → Fähigkeiten/Skills hochladen.")
    else:
        target = a.ziel or os.path.join(os.path.expanduser("~"), ".claude", "skills", "fabscan")
        print(skill.install(target))
        print("Fertig. In Claude Code einfach fragen: „Prüf meine Fabric Apps“ oder /fabscan.")
    return 0


def main(argv=None) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)
    if argv and argv[0] == "fetch":
        return cmd_fetch(argv[1:])
    if argv and argv[0] == "notebook":
        return cmd_notebook(argv[1:])
    if argv and argv[0] == "skill":
        return cmd_skill(argv[1:])
    if argv and argv[0] == "scan":
        argv = argv[1:]
    return cmd_scan(argv)


if __name__ == "__main__":
    sys.exit(main())
