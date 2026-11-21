"""Baut fabscan_tenant.ipynb: ein Fabric-Notebook, das fabscan eingebettet mitbringt.

Aufruf:  fabscan notebook [-o fabscan_tenant.ipynb]
Das Notebook braucht danach keinen Repo-Zugriff und kein pip install.
"""
import base64
import io
import json
import os
import zipfile

PKG = os.path.dirname(os.path.abspath(__file__))


def bundle() -> str:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        for fn in sorted(os.listdir(PKG)):
            if fn.endswith(".py"):
                z.write(os.path.join(PKG, fn), f"fabscan/{fn}")
    return base64.b64encode(buf.getvalue()).decode()


def md(text):
    return {"cell_type": "markdown", "metadata": {}, "source": text.strip("\n").splitlines(True)}


def code(text, tags=None, hidden=False):
    meta = {}
    if tags:
        meta["tags"] = tags
    if hidden:
        meta["jupyter"] = {"source_hidden": True}
    return {"cell_type": "code", "metadata": meta, "execution_count": None, "outputs": [],
            "source": text.strip("\n").splitlines(True)}


INTRO = """
# Fabric App Scan · Tenant

Prüft, **wer die Semantikmodelle des Tenants außerhalb von Power-BI-Berichten abfragt und wie**: Fabric Apps,
Notebooks, Skripte, Excel. Grundlage sind die tatsächlich ausgeführten DAX-Abfragen aus dem Workspace Monitoring
und die Modell-Metadaten aus der Admin-Scanner-API. Am Ende steht ein Bericht in Klartext
(Gesamtbild, Modelle, Ampel und je Client Steckbrief, Datenweg und „Das Wichtigste“).

**Fünf Fragen je Client**
1. Rechnet er selbst, statt Measures des Modells abzufragen?
2. Fragt er Tabellen oder Felder ab, die es nicht gibt?
3. Läuft er unter einem Service Principal, liest er ausgeblendete Felder, hat das Modell keine RLS?
4. Verändert er Filter (ALL, REMOVEFILTERS, feste Werte) oder überschreibt er Measures?
5. Rundet oder bereinigt er Werte schon in der Abfrage?

**Voraussetzungen**
- Für den ganzen Tenant: Fabric-Administrator oder Service Principal mit Zugriff auf die Admin-APIs, dazu die
  Tenant-Einstellungen *Enhance admin APIs responses with detailed metadata* und
  *Enhance admin APIs responses with DAX and mashup expressions* (sonst fehlen Tabellen und Measures).
- **Ohne Admin-Rechte** prüft das Notebook die Workspaces, in denen du Mitglied bist: Modelle per getDefinition
  (mindestens Rolle Mitwirkender, mit nur Leserecht die Namen über INFO.VIEW), das Workspace Monitoring wird dort
  selbst gesucht.
- Für die Abfragen: **Workspace Monitoring** in den Workspaces mit den Modellen (Workspace-Einstellungen →
  Monitoring, legt ein Monitoring-Item mit Eventhouse und KQL-Datenbank an, Datensammlung einschalten).
  Ohne Monitoring zeigt der Bericht nur die Modell-Übersicht.
- Ein Lakehouse als Standard an das Notebook hängen (dort landen Bericht und Rohdaten).

**So geht's:** Parameter in der nächsten Zelle ausfüllen, dann *Alle ausführen*. Danach lässt sich das Notebook
planen (z. B. wöchentlich).
"""

PARAMS = """
# Welche Workspaces? Leer = alle aktiven Workspaces im Tenant (ohne Admin-Rechte: alle eigenen). Namen oder IDs.
WORKSPACES = []

# Admin-API: None = versuchen, bei fehlenden Rechten nur die eigenen Workspaces prüfen; False = gleich ohne.
ADMIN_API = None

# Workspace Monitoring: je KQL-Datenbank des Monitorings die Abfrage-URI und der Name.
# Zu finden im Monitoring-Item → KQL-Datenbank „<Workspace>_<Item>_Database“ → Abfrage-URI kopieren.
# Ohne Admin-Rechte und leer: wird in den geprüften Workspaces selbst gesucht.
MONITORING = [
    # {"cluster": "https://<id>.<region>.kusto.fabric.microsoft.com", "database": "Finance_Monitoring_Database"},
]

# Alternativ oder zusätzlich: exportierte Logs im Lakehouse (CSV, JSON oder JSON Lines).
QUERY_LOG_FILES = []

DAYS = 14                          # Zeitraum der Abfragen
INCLUDE_REPORT_QUERIES = False     # True = auch Abfragen aus Power-BI-Berichten prüfen
LOG_TABLE = "SemanticModelLogs"    # Tabelle in der Monitoring-Datenbank
OUTPUT_DIR = "/lakehouse/default/Files/fabscan"
REPORT_TITLE = "Tenant-Prüfbericht Fabric Apps"
WRITE_DELTA = True                 # Befunde zusätzlich als Tabelle fabscan_findings (für Power BI)
AUSNAHMEN = "/lakehouse/default/Files/fabscan/fabscan-ausnahmen.json"   # begründet akzeptierte Befunde (optional)
"""

INSTALL = """
# fabscan ist hier eingebettet (Python-Standardbibliothek, keine Installation nötig).
import base64, io, os, sys, zipfile
_FABSCAN_ZIP = "{zip}"
_dir = "/tmp/fabscan_pkg"
zipfile.ZipFile(io.BytesIO(base64.b64decode(_FABSCAN_ZIP))).extractall(_dir)
if _dir not in sys.path:
    sys.path.insert(0, _dir)
import fabscan
print("fabscan", fabscan.__version__)
"""

SCAN = """
# 1 · Modelle: Admin-Scanner-API, ohne Admin-Rechte die eigenen Workspaces per getDefinition
import datetime as dt, json
from fabscan import scanapi, fetch as fsfetch

os.makedirs(OUTPUT_DIR, exist_ok=True)
stamp = dt.datetime.now().strftime("%Y-%m-%d")
SCOPE = "Tenant"
scan_results = []


class _NotebookAuth:
    method = "Notebook"

    def token(self, resource):
        # Das Power-BI-Token nimmt auch api.fabric.microsoft.com an; Kusto braucht ein Token für den Cluster.
        if resource in (fsfetch.RES_PBI, fsfetch.RES_FABRIC):
            return notebookutils.credentials.getToken("pbi")
        return notebookutils.credentials.getToken(resource)


def _admin_denied(e):
    # sempy wirft FabricHTTPException(response): der Status steht an der Ausnahme oder an e.response.
    if isinstance(e, ImportError):
        return True                                        # sempy ohne Admin-Modul
    for x in (e, e.__cause__, e.__context__):
        code = getattr(x, "status_code", None) or getattr(getattr(x, "response", None), "status_code", None)
        if code is not None:
            return int(code) in (401, 403)
    t = f"{type(e).__name__} {e}".lower()
    return any(s in t for s in (" 401", " 403", "unauthorized", "forbidden"))


use_admin = ADMIN_API is not False
if use_admin:
    try:
        import sempy.fabric.admin as fa
        ws = fa.list_workspaces(workspace_state="Active", workspace_type="Workspace")
        if WORKSPACES:
            want = {str(w).lower() for w in WORKSPACES}
            ws = ws[ws["Id"].astype(str).str.lower().isin(want) | ws["Name"].astype(str).str.lower().isin(want)]
        ids = [str(x) for x in ws["Id"]]
        print(f"{len(ids)} Workspaces werden gescannt …")
        for i in range(0, len(ids), 100):
            scan_results.append(fa.scan_workspaces(workspace=ids[i:i + 100], dataset_schema=True,
                                                   dataset_expressions=True, return_dataframe=False,
                                                   timeout_seconds=900))
    except Exception as e:  # noqa: BLE001
        if ADMIN_API or not _admin_denied(e):
            raise
        print("Keine Admin-Rechte: weiter mit den Workspaces, in denen du Mitglied bist (getDefinition).")
        use_admin = False

if not use_admin:
    SCOPE = "Workspaces"
    _f = fsfetch.Fetcher(_NotebookAuth(), request=globals().get("FABSCAN_HTTP") or fsfetch.http, admin=False)
    ids = _f.workspaces([str(w) for w in WORKSPACES])
    scan_results = _f.scan(ids)
    if not MONITORING:
        MONITORING = [{"cluster": c, "database": d} for c, d in _f.find_monitoring(ids)]
        print(f"{len(MONITORING)} Monitoring-Datenbank(en) gefunden")
    for n in _f.notes:
        print("Hinweis:", n)
    if REPORT_TITLE == "Tenant-Prüfbericht Fabric Apps":
        REPORT_TITLE = "Prüfbericht Fabric Apps (Workspaces mit eigenem Zugriff)"
elif not MONITORING:
    # Ganzer Tenant: Monitoring-Items und Datenbanken aus der Fabric-Admin-API suchen
    _f = fsfetch.Fetcher(_NotebookAuth(), request=globals().get("FABSCAN_HTTP") or fsfetch.http, admin=True)
    _f.ws_names.update({w.get("id", ""): w.get("name", "") for r in scan_results for w in r.get("workspaces", []) or []})
    MONITORING = [{"cluster": c, "database": d} for c, d in _f.find_monitoring(ids)]
    print(f"{len(MONITORING)} Monitoring-Datenbank(en) gefunden")
    for n in _f.notes:
        print("Hinweis:", n)

with open(f"{OUTPUT_DIR}/scan-{stamp}.json", "w", encoding="utf-8") as fh:
    json.dump(scan_results, fh, ensure_ascii=False, default=str)

models = scanapi.load_scan(scan_results)
print(f"{len(models)} Semantikmodelle, {sum(m.measure_count for m in models)} Measures")
if models and not any(m.tables for m in models) and SCOPE == "Tenant":
    print("Achtung: keine Tabellen im Scan. Sind die Tenant-Einstellungen für detaillierte Metadaten aktiv?")
"""

LOGS = """
# 2 · Tatsächlich ausgeführte Abfragen aus dem Workspace Monitoring (in KQL vorab zusammengefasst)
from fabscan import querylog

kql = querylog.kql(DAYS, INCLUDE_REPORT_QUERIES, LOG_TABLE)


def _read_kusto(cluster, database, query):
    token = notebookutils.credentials.getToken(cluster)
    df = (spark.read.format("com.microsoft.kusto.spark.synapse.datasource")
          .option("accessToken", token).option("kustoCluster", cluster)
          .option("kustoDatabase", database).option("kustoQuery", query).load())
    return [r.asDict() for r in df.collect()]


# Mehrere Datenbanken auf einem Eventhouse (zentrales Monitoring) per union, je 25 in einer Abfrage
log_rows = []
_by_cluster = {}
for mon in MONITORING:
    _by_cluster.setdefault(mon["cluster"], []).append(mon["database"])
for _cluster, _dbs in _by_cluster.items():
    for i in range(0, len(_dbs), 25):
        _part_dbs = _dbs[i:i + 25]
        if len(_part_dbs) > 1:
            try:
                part = _read_kusto(_cluster, _part_dbs[0], querylog.kql(DAYS, INCLUDE_REPORT_QUERIES,
                                                                        querylog.union_source(_part_dbs, LOG_TABLE)))
                print(f"{len(_part_dbs)} Datenbanken: {len(part)} verschiedene Abfragen")
                log_rows += part
                continue
            except Exception as e:  # noqa: BLE001 – einzeln versuchen
                print("union nicht möglich, einzeln:", str(e)[:200])
        for _db in _part_dbs:
            try:
                part = _read_kusto(_cluster, _db, kql)
            except Exception as e:  # noqa: BLE001
                if len(MONITORING) == 1:
                    raise
                print(f"{_db}: nicht lesbar ({str(e)[:200]})")
                continue
            print(f"{_db}: {len(part)} verschiedene Abfragen")
            log_rows += part

entries = querylog.load_log(log_rows)
for path in QUERY_LOG_FILES:
    entries += querylog.load_log(path)
with open(f"{OUTPUT_DIR}/abfragen-{stamp}.json", "w", encoding="utf-8") as fh:
    json.dump(log_rows, fh, ensure_ascii=False, default=str)
print(f"{sum(e.count for e in entries)} Ausführungen gelesen")
if not MONITORING and not QUERY_LOG_FILES:
    print("Kein Workspace Monitoring angegeben: Der Bericht zeigt nur die Modell-Übersicht.")
"""

RUN = """
# 3 · Prüfen und Bericht schreiben: bericht.html, zusammenfassung.md, befunde.json, befunde.csv
from fabscan import ausnahmen, export, report, tenant

clients = querylog.clients(entries, include_reports=INCLUDE_REPORT_QUERIES)
apps = tenant.scan_tenant(models, clients)
info = {"models": tenant.model_rows(models, apps), "scope": SCOPE}
_rules, _warns = ausnahmen.load(AUSNAHMEN)
for w in _warns:
    print("Hinweis Ausnahmen:", w)
aus_info = ausnahmen.apply(apps, _rules)
aus_info.update({"datei": AUSNAHMEN if _rules or _warns else "", "warnungen": _warns})
_mon = globals().get("_f")
coverage = tenant.coverage(models, apps, workspaces=len(ids),
                           workspaces_monitoring=len(_mon.monitored_ws & {w.lower() for w in ids}) if _mon else None,
                           days=DAYS, include_reports=INCLUDE_REPORT_QUERIES)
paths = export.write_run(apps, f"{OUTPUT_DIR}/{stamp}", "", REPORT_TITLE, info, scope=SCOPE,
                         extra={"coverage": coverage, "ausnahmen": aus_info})
with open(paths["html"], encoding="utf-8") as fh:
    html = fh.read()
print(report.to_text(apps) if apps else "Keine Clients im Zeitraum.")
print("\\nBericht:", paths["html"])
"""

SHOW = """
# 4 · Bericht anzeigen
displayHTML(html)
"""

DELTA = """
# 5 · Befunde als Tabelle fabscan_findings (für einen Power-BI-Bericht über die Zeit)
if WRITE_DELTA and apps:
    import pandas as pd
    rows = export.rows(apps, SCOPE, run_date=stamp)      # Datenvertrag wie befunde.csv
    if rows:
        (spark.createDataFrame(pd.DataFrame(rows)).write.mode("append")
         .option("mergeSchema", "true").saveAsTable("fabscan_findings"))      # Datenvertrag 2: neue Spalten
        print(f"{len(rows)} Befunde in fabscan_findings geschrieben")
"""

OUTRO = """
## Weiter

- **Planen:** Notebook → *Planen* (z. B. montags), die Läufe sammeln sich datiert in `Files/fabscan/<datum>/`.
- **Teilen:** `bericht.html` aus dem Lakehouse herunterladen, `zusammenfassung.md` in Teams oder ein Ticket kopieren,
  oder `fabscan_findings` in einem Power-BI-Bericht bzw. einer Fabric App zeigen.
- **Code dazunehmen:** Was nur im App-Code steht (Rechnungen im Browser, fremde Schriften, Browser-Speicher),
  prüft fabscan im Repository: `python3 -m fabscan <repo>`.
- **Grenzen:** Erkannt werden Muster in DAX, kein vollständiges Verständnis. Welche Anwendung hinter einem
  `ApplicationName` steckt, hängt davon ab, was der Client meldet.
"""


def build(out: str = "fabscan_tenant.ipynb") -> str:
    nb = {
        "nbformat": 4, "nbformat_minor": 5,
        "metadata": {"kernel_info": {"name": "synapse_pyspark"},
                     "kernelspec": {"name": "synapse_pyspark", "display_name": "Synapse PySpark", "language": "Python"},
                     "language_info": {"name": "python"}},
        "cells": [md(INTRO), code(PARAMS, tags=["parameters"]), code(INSTALL.replace("{zip}", bundle()), hidden=True),
                  code(SCAN), code(LOGS), code(RUN), code(SHOW), code(DELTA), md(OUTRO)],
    }
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(nb, fh, ensure_ascii=False, indent=1)
    return out
