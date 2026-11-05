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
- Fabric-Administrator oder Service Principal mit Zugriff auf die Admin-APIs.
- Tenant-Einstellungen für die Scanner-API: *Enhance admin APIs responses with detailed metadata* und
  *Enhance admin APIs responses with DAX and mashup expressions* (sonst fehlen Tabellen und Measures).
- Für die Abfragen: **Workspace Monitoring** in den Workspaces mit den Modellen (legt ein Monitoring-Eventhouse an).
  Ohne Monitoring zeigt der Bericht nur die Modell-Übersicht.
- Ein Lakehouse als Standard an das Notebook hängen (dort landen Bericht und Rohdaten).

**So geht's:** Parameter in der nächsten Zelle ausfüllen, dann *Alle ausführen*. Danach lässt sich das Notebook
planen (z. B. wöchentlich).
"""

PARAMS = """
# Welche Workspaces? Leer = alle aktiven Workspaces im Tenant (Admin-Rechte nötig). Namen oder IDs.
WORKSPACES = []

# Workspace Monitoring: je Monitoring-Eventhouse die Abfrage-URI und die KQL-Datenbank.
# Zu finden im Workspace unter „Monitoring Eventhouse“ → KQL-Datenbank → Abfrage-URI kopieren.
MONITORING = [
    # {"cluster": "https://<id>.<region>.kusto.fabric.microsoft.com", "database": "Monitoring KQL database"},
]

# Alternativ oder zusätzlich: exportierte Logs im Lakehouse (CSV, JSON oder JSON Lines).
QUERY_LOG_FILES = []

DAYS = 14                          # Zeitraum der Abfragen
INCLUDE_REPORT_QUERIES = False     # True = auch Abfragen aus Power-BI-Berichten prüfen
LOG_TABLE = "SemanticModelLogs"    # Tabelle im Monitoring-Eventhouse
OUTPUT_DIR = "/lakehouse/default/Files/fabscan"
REPORT_TITLE = "Tenant-Prüfbericht Fabric Apps"
WRITE_DELTA = True                 # Befunde zusätzlich als Tabelle fabscan_findings (für Power BI)
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
# 1 · Modelle des Tenants über die Admin-Scanner-API
import datetime as dt, json
import sempy.fabric.admin as fa
from fabscan import scanapi

os.makedirs(OUTPUT_DIR, exist_ok=True)
stamp = dt.datetime.now().strftime("%Y-%m-%d")

ws = fa.list_workspaces(workspace_state="Active", workspace_type="Workspace")
if WORKSPACES:
    want = {str(w).lower() for w in WORKSPACES}
    ws = ws[ws["Id"].astype(str).str.lower().isin(want) | ws["Name"].astype(str).str.lower().isin(want)]
ids = [str(x) for x in ws["Id"]]
print(f"{len(ids)} Workspaces werden gescannt …")

scan_results = []
for i in range(0, len(ids), 100):
    scan_results.append(fa.scan_workspaces(workspace=ids[i:i + 100], dataset_schema=True,
                                           dataset_expressions=True, return_dataframe=False, timeout_seconds=900))
with open(f"{OUTPUT_DIR}/scan-{stamp}.json", "w", encoding="utf-8") as fh:
    json.dump(scan_results, fh, ensure_ascii=False, default=str)

models = scanapi.load_scan(scan_results)
print(f"{len(models)} Semantikmodelle, {sum(m.measure_count for m in models)} Measures")
if models and not any(m.tables for m in models):
    print("Achtung: keine Tabellen im Scan. Sind die Tenant-Einstellungen für detaillierte Metadaten aktiv?")
"""

LOGS = """
# 2 · Tatsächlich ausgeführte Abfragen aus dem Workspace Monitoring (in KQL vorab zusammengefasst)
from fabscan import querylog

kql = querylog.kql(DAYS, INCLUDE_REPORT_QUERIES, LOG_TABLE)

log_rows = []
for mon in MONITORING:
    token = notebookutils.credentials.getToken(mon["cluster"])
    df = (spark.read.format("com.microsoft.kusto.spark.synapse.datasource")
          .option("accessToken", token).option("kustoCluster", mon["cluster"])
          .option("kustoDatabase", mon["database"]).option("kustoQuery", kql).load())
    part = [r.asDict() for r in df.collect()]
    print(f"{mon['database']}: {len(part)} verschiedene Abfragen")
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
from fabscan import export, report, tenant

clients = querylog.clients(entries, include_reports=INCLUDE_REPORT_QUERIES)
apps = tenant.scan_tenant(models, clients)
info = {"models": tenant.model_rows(models, apps), "scope": "Tenant"}
paths = export.write_run(apps, f"{OUTPUT_DIR}/{stamp}", "", REPORT_TITLE, info, scope="Tenant")
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
    rows = export.rows(apps, "Tenant", run_date=stamp)   # Datenvertrag wie befunde.csv
    if rows:
        spark.createDataFrame(pd.DataFrame(rows)).write.mode("append").saveAsTable("fabscan_findings")
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
