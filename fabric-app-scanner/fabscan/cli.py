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

from . import __version__, ausnahmen, checks, config, export, fetch, querylog, report, scanapi, tenant, tmdl, verlauf


def _scan_parser(prog: str) -> argparse.ArgumentParser:
    ap = argparse.ArgumentParser(prog=prog, description="Governance-Prüfung für Fabric Apps (Rayfin) und den Fabric-Tenant.",
                                 epilog="Weitere Befehle: fabscan fetch · fabscan notebook · fabscan skill")
    ap.add_argument("repo", nargs="?", default=None, help="Repository mit Apps (rayfin/rayfin.yml) und *.SemanticModel-Ordnern; "
                                                          "Standard: aktueller Ordner, außer im reinen Tenant-Modus")
    ap.add_argument("-o", "--out", default="fabscan-bericht", help="Ausgabeordner (Standard: fabscan-bericht)")
    ap.add_argument("--title", default="", help="Titel des Berichts")
    ap.add_argument("--app", action="append", default=[], help="nur diese App(s) prüfen (Ordnername)")
    ap.add_argument("--models", action="append", default=[], help="weitere Ordner mit *.SemanticModel")
    ap.add_argument("--config", help="fabscan.json (Standard: <repo>/fabscan.json); dazu liest fabscan je App "
                                     "<App-Ordner>/fabscan.json, deren Werte für diese App vorgehen")
    ap.add_argument("--scan-result", action="append", default=[], help="Antwort der Admin-Scanner-API (JSON)")
    ap.add_argument("--query-log", action="append", default=[], help="Export der SemanticModelLogs (CSV/JSON/JSONL)")
    ap.add_argument("--include-reports", action="store_true", help="auch Abfragen aus Power-BI-Berichten prüfen")
    ap.add_argument("--fail-on", choices=["fail", "warn", "never"], default="never",
                    help="ab welcher Stufe der Exit-Code 1 ist (für CI: fail)")
    ap.add_argument("--ausnahmen", "--exceptions", dest="ausnahmen", default="",
                    help=f"Ausnahmen-Datei (JSON) mit begründet akzeptierten Befunden; Standard: {ausnahmen.FILE_NAME} "
                         "im Repo bzw. im aktuellen Ordner")
    ap.add_argument("--vorlauf", default="", help="befunde.json (oder Ordner) eines früheren Laufs für den Trend; "
                                                   "Standard: befunde.json im Ausgabeordner, falls vorhanden")
    ap.add_argument("--kein-vorlauf", dest="kein_vorlauf", action="store_true",
                    help="ohne Trend und ohne verlauf.json")
    ap.add_argument("--klarnamen", action="store_true",
                    help="Nutzerkennungen im Klartext (Standard: Pseudonym, App-IDs bleiben)")
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
    cfg_path = a.config or (os.path.join(root, config.FILE_NAME) if root else "")
    try:
        cfg = config.load(cfg_path, root or ".") if cfg_path and os.path.exists(cfg_path) else config.Config()
    except ValueError as err:
        print(f"Konfiguration: {err}", file=sys.stderr)
        return 2

    models = tmdl.find_models(root) if root else []
    for extra in a.models:
        models += tmdl.find_models(extra if os.path.isabs(extra) else os.path.join(root or ".", extra))
    for extra in cfg.models:
        models += tmdl.find_models(extra)
    models = _unique_models(models)
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
        for d in app_dirs:
            try:
                app_cfg, app_models = _app_config(d, cfg, cfg_path, models)
            except ValueError as err:
                print(f"Konfiguration: {err}", file=sys.stderr)
                return 2
            apps.append(checks.scan_app(d, root, app_models, app_cfg.connectors, app_cfg.visible_filters))
    for w in cfg.warnings:
        print(f"Hinweis {w}", file=sys.stderr)
    if a.query_log or (a.scan_result and not apps):
        entries = []
        for ql in a.query_log:
            entries += querylog.load_log(ql)
        log_apps = tenant.scan_tenant(models, querylog.clients(entries, include_reports=a.include_reports), a.klarnamen)
        apps += log_apps
        tenant_info = {"models": tenant.model_rows(models, log_apps), "scope": "Tenant"}

    try:
        extra = {"ausnahmen": _apply_ausnahmen(apps, a.ausnahmen, root, os.getcwd())}
    except ValueError as err:
        print(err, file=sys.stderr)
        return 2
    if tenant_info:
        extra["coverage"] = tenant.coverage(models, apps, include_reports=a.include_reports)
    scope = os.path.basename(root) if root else "Tenant"
    try:
        prev = _previous(a.vorlauf, a.out, a.kein_vorlauf)
    except ValueError as err:
        print(err, file=sys.stderr)
        return 2
    paths = export.write_run(apps, a.out, root, a.title, tenant_info, scope, extra, previous=prev,
                             history_path=None if a.kein_vorlauf else os.path.join(a.out, verlauf.HISTORY_FILE))
    if a.html:
        with open(a.html, "w", encoding="utf-8") as fh:
            fh.write(report.to_html(apps, root, a.title, tenant_info, extra))
    if a.json:
        with open(a.json, "w", encoding="utf-8") as fh:
            fh.write(report.to_json(apps, root))
    if not a.quiet:
        print(report.to_text(apps) if apps else "Keine Apps oder Clients mit Abfragen gefunden.")
        with open(paths["json"], encoding="utf-8") as fh:
            line = verlauf.trend_line(json.load(fh).get("trend"))
        if line:
            print("\n" + line)
        print(f"\nBericht:          {paths['html']}\nZusammenfassung:  {paths['md']}\n"
              f"Daten:            {paths['json']} · {paths['csv']}")
    else:
        print(paths["html"])
    return _fail_code(apps, a.fail_on)


def _previous(path: str, out_dir: str, off: bool) -> dict | None:
    """Vorlauf für den Trend: ausdrücklich angegeben (muss lesbar sein) oder befunde.json im Ausgabeordner."""
    if off:
        return None
    if path:
        if not os.path.exists(path):
            raise ValueError(f"Vorlauf nicht gefunden: {path}")
        return verlauf.load_previous(path)
    try:
        return verlauf.load_previous(out_dir)
    except ValueError as err:
        print(f"Hinweis: {err}; Lauf ohne Trend.", file=sys.stderr)
        return None


def _unique_models(models: list) -> list:
    """Gleicher *.SemanticModel-Ordner über mehrere Wege gefunden: nur einmal."""
    seen, out = set(), []
    for m in models:
        key = os.path.normcase(m.folder) if getattr(m, "folder", "") else None
        if key and key in seen:
            continue
        if key:
            seen.add(key)
        out.append(m)
    return out


def _app_config(app_dir: str, root_cfg, root_cfg_path: str, models: list):
    """fabscan.json im App-Ordner: Pfade ab dem App-Ordner, Werte gehen der Wurzel vor. Modelle der App zuerst."""
    path = os.path.join(app_dir, config.FILE_NAME)
    if not os.path.exists(path) or (root_cfg_path and os.path.abspath(path) == os.path.abspath(root_cfg_path)):
        return root_cfg, models
    app_cfg = config.load(path, app_dir)
    for w in app_cfg.warnings:
        print(f"Hinweis {w}", file=sys.stderr)
    own = []
    for p in app_cfg.models:
        own += tmdl.find_models(p)
    if app_cfg.models and not own:
        print(f"Hinweis {path}: unter models kein *.SemanticModel-Ordner gefunden", file=sys.stderr)
    own = _unique_models(own)
    folders = {os.path.normcase(m.folder) for m in own if m.folder}
    rest = [m for m in models if not (m.folder and os.path.normcase(m.folder) in folders)]
    return config.merge(root_cfg, app_cfg), own + rest


def _apply_ausnahmen(apps, path: str, *folders: str) -> dict:
    """Setzt Befund-IDs, nimmt akzeptierte Befunde aus der Wertung. Wirft ValueError bei kaputter Datei."""
    if path and not os.path.exists(path):
        raise ValueError(f"Ausnahmen-Datei nicht gefunden: {path}")
    path = path or ausnahmen.default_path(*folders)
    try:
        rules, warns = ausnahmen.load(path)
    except (OSError, ValueError) as err:
        raise ValueError(f"Ausnahmen-Datei {path} nicht lesbar: {err}") from None
    info = ausnahmen.apply(apps, rules)
    info.update({"datei": path, "warnungen": warns})
    for w in warns:
        print(f"Hinweis Ausnahmen: {w}", file=sys.stderr)
    return info


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
    ap.add_argument("--ausnahmen", "--exceptions", dest="ausnahmen", default="",
                    help=f"Ausnahmen-Datei (JSON); Standard: {ausnahmen.FILE_NAME} im aktuellen Ordner")
    ap.add_argument("--vorlauf", default="", help="befunde.json (oder Ordner) eines früheren Laufs für den Trend; "
                                                   "Standard: befunde.json im Ausgabeordner, falls vorhanden")
    ap.add_argument("--kein-vorlauf", dest="kein_vorlauf", action="store_true",
                    help="ohne Trend und ohne verlauf.json")
    ap.add_argument("--klarnamen", action="store_true",
                    help="Nutzerkennungen im Klartext (Standard: Pseudonym, App-IDs bleiben)")
    ap.add_argument("--ohne-admin", "--no-admin", dest="no_admin", action="store_true",
                    help="Admin-API überspringen: nur Workspaces mit eigenem Zugriff, Modelle per getDefinition. "
                         "Ohne den Schalter wechselt fetch bei 401/403 der Admin-API von selbst in diesen Modus.")
    a = ap.parse_args(argv)
    f = fetcher or fetch.Fetcher(fetch.Auth(a.tenant), admin=False if a.no_admin else None)
    if fetcher is not None and a.no_admin:
        f.admin, f.mode = False, "workspace"
    raw = os.path.join(a.out, "rohdaten")
    try:
        print("1 · Workspaces")
        ids = f.workspaces(a.workspace)
        print(f"2 · Modelle ({f.source})")
        results = f.scan(ids)
        os.makedirs(raw, exist_ok=True)
        with open(os.path.join(raw, "scan.json"), "w", encoding="utf-8") as fh:
            json.dump(results, fh, ensure_ascii=False, default=str)
        models = scanapi.load_scan(results)
        print(f"  {len(models)} Semantikmodelle, {sum(m.measure_count for m in models)} Measures")
        if models and not any(m.tables for m in models) and f.mode == "admin":
            print("  Achtung: keine Tabellen im Scan. Tenant-Einstellungen für detaillierte Metadaten und "
                  "DAX-Ausdrücke prüfen.")
        print("3 · Abfragen (Workspace Monitoring)")
        mons = [tuple(m.split("=", 1)) for m in a.monitoring if "=" in m] or f.find_monitoring(ids)
        rows, counts = f.logs_all(mons, a.days, a.include_reports, a.log_table)
        for label, n in counts:
            print(f"  {label}: {n} verschiedene Abfragen")
        with open(os.path.join(raw, "abfragen.json"), "w", encoding="utf-8") as fh:
            json.dump(rows, fh, ensure_ascii=False, default=str)
    except fetch.FetchError as e:
        print(f"\nAbbruch: {e}", file=sys.stderr)
        return 2
    entries = querylog.load_log(rows)
    log_apps = tenant.scan_tenant(models, querylog.clients(entries, include_reports=a.include_reports), a.klarnamen)
    scope = "Tenant" if f.mode == "admin" else "Workspaces"
    title = a.title or ("Tenant-Prüfbericht Fabric Apps" if f.mode == "admin"
                        else "Prüfbericht Fabric Apps (Workspaces mit eigenem Zugriff)")
    info = {"models": tenant.model_rows(models, log_apps), "scope": scope}
    try:
        extra = {"ausnahmen": _apply_ausnahmen(log_apps, a.ausnahmen, os.getcwd())}
    except ValueError as err:
        print(err, file=sys.stderr)
        return 2
    wanted = {w.lower() for w in ids}
    extra["coverage"] = tenant.coverage(
        models, log_apps, workspaces=len(ids),
        workspaces_monitoring=None if a.monitoring else len(f.monitored_ws & wanted),
        days=a.days, include_reports=a.include_reports)
    try:
        prev = _previous(a.vorlauf, a.out, a.kein_vorlauf)
    except ValueError as err:
        print(err, file=sys.stderr)
        return 2
    paths = export.write_run(log_apps, a.out, "", title, info, scope=scope, extra=extra, previous=prev,
                             history_path=None if a.kein_vorlauf else os.path.join(a.out, verlauf.HISTORY_FILE))
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


def utf8_output() -> None:
    """Ausgabe als UTF-8, damit ✓, ✗ und Umlaute auch unter Git Bash/Windows (cp1252) nicht abstürzen."""
    for stream in (sys.stdout, sys.stderr):
        enc = (getattr(stream, "encoding", "") or "").lower().replace("-", "")
        if enc != "utf8" and hasattr(stream, "reconfigure"):
            try:
                stream.reconfigure(encoding="utf-8", errors="replace")
            except (ValueError, OSError):
                pass


def main(argv=None) -> int:
    utf8_output()
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
