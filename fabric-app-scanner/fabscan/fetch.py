"""Tenant-Daten direkt holen: Admin-Scanner-API und Abfrage-Logs aus dem Workspace Monitoring.

Anmeldung (erste, die klappt):
1. Service Principal über AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET
2. Azure CLI (`az login`)
3. azure-identity (DefaultAzureCredential), falls installiert

Nur Lesezugriffe. Nur Python-Standardbibliothek.
"""
from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import time
import urllib.error
import urllib.parse
import urllib.request

from . import querylog

POWERBI = "https://api.powerbi.com/v1.0/myorg"
FABRIC = "https://api.fabric.microsoft.com/v1"
RES_PBI = "https://analysis.windows.net/powerbi/api"
RES_FABRIC = "https://api.fabric.microsoft.com"
RES_KUSTO = "https://kusto.kusto.windows.net"
GUID = re.compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")


class FetchError(RuntimeError):
    pass


# ---------------------------------------------------------------- Anmeldung

class Auth:
    def __init__(self, tenant: str | None = None):
        self.tenant = tenant or os.environ.get("AZURE_TENANT_ID")
        self.cache: dict[str, str] = {}
        self.method = ""

    def token(self, resource: str) -> str:
        if resource in self.cache:
            return self.cache[resource]
        errors = []
        for name, fn in (("Service Principal", self._sp), ("Azure CLI", self._az), ("azure-identity", self._identity)):
            try:
                tok = fn(resource)
            except Exception as e:  # noqa: BLE001 – nächste Quelle versuchen
                errors.append(f"{name}: {e}")
                continue
            if tok:
                self.cache[resource] = tok
                self.method = self.method or name
                return tok
        raise FetchError("Keine Anmeldung gefunden. Entweder `az login` ausführen, oder AZURE_TENANT_ID, "
                         "AZURE_CLIENT_ID und AZURE_CLIENT_SECRET für einen Service Principal setzen.\n  "
                         + "\n  ".join(errors))

    def _sp(self, resource):
        cid, secret = os.environ.get("AZURE_CLIENT_ID"), os.environ.get("AZURE_CLIENT_SECRET")
        if not (self.tenant and cid and secret):
            return None
        body = urllib.parse.urlencode({"grant_type": "client_credentials", "client_id": cid, "client_secret": secret,
                                       "scope": f"{resource}/.default"}).encode()
        req = urllib.request.Request(f"https://login.microsoftonline.com/{self.tenant}/oauth2/v2.0/token", data=body)
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read())["access_token"]

    def _az(self, resource):
        az = shutil.which("az") or shutil.which("az.cmd")
        if not az:
            return None
        cmd = [az, "account", "get-access-token", "--resource", resource, "--query", "accessToken", "-o", "tsv"]
        if self.tenant:
            cmd += ["--tenant", self.tenant]
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if r.returncode != 0:
            raise FetchError(r.stderr.strip().splitlines()[-1] if r.stderr.strip() else "az fehlgeschlagen")
        return r.stdout.strip()

    def _identity(self, resource):
        try:
            from azure.identity import DefaultAzureCredential  # type: ignore
        except ImportError:
            return None
        return DefaultAzureCredential().get_token(f"{resource}/.default").token


# ---------------------------------------------------------------- HTTP

def http(method: str, url: str, token: str, body=None, timeout: int = 120):
    """Gibt (status, json) zurück; wiederholt bei 429/503 mit Retry-After."""
    data = json.dumps(body).encode() if body is not None else None
    for attempt in range(6):
        req = urllib.request.Request(url, data=data, method=method, headers={
            "Authorization": f"Bearer {token}", "Content-Type": "application/json", "Accept": "application/json",
            "x-ms-app": "fabscan"})
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                raw = r.read()
                return r.status, (json.loads(raw) if raw.strip() else {})
        except urllib.error.HTTPError as e:
            if e.code in (429, 503) and attempt < 5:
                time.sleep(min(int(e.headers.get("Retry-After") or 5 * (attempt + 1)), 60))
                continue
            msg = e.read().decode(errors="replace")[:400]
            return e.code, {"error": msg}
        except urllib.error.URLError as e:
            host = urllib.parse.urlparse(url).netloc
            raise FetchError(f"Keine Verbindung zu {host} ({e.reason}). Netzwerk, Proxy oder Firewall prüfen.") from None
    return 429, {"error": "zu viele Anfragen"}


# ---------------------------------------------------------------- Abläufe

class Fetcher:
    def __init__(self, auth: Auth | None = None, request=http, log=print, sleep=time.sleep):
        self.auth = auth or Auth()
        self.request = request
        self.log = log
        self.sleep = sleep
        self.notes: list[str] = []

    def _call(self, method, url, resource, body=None, ok=(200, 201, 202)):
        status, data = self.request(method, url, self.auth.token(resource), body)
        if status in ok:
            return data
        hint = ""
        if status in (401, 403) and "admin" in url:
            hint = (" Für die Admin-APIs braucht es die Rolle Fabric-Administrator oder einen Service Principal, "
                    "der in den Tenant-Einstellungen für Admin-APIs freigegeben ist.")
        raise FetchError(f"{method} {url.split('?')[0]} → {status}.{hint} {data.get('error', '')}".strip())

    def workspaces(self, wanted: list[str]) -> list[str]:
        if not wanted:
            data = self._call("GET", f"{POWERBI}/admin/workspaces/modified?excludePersonalWorkspaces=true"
                                     f"&excludeInActiveWorkspaces=true", RES_PBI)
            ids = [w["id"] for w in (data if isinstance(data, list) else data.get("value", []))]
            self.log(f"  {len(ids)} aktive Workspaces im Tenant")
            return ids
        ids = []
        for w in wanted:
            if GUID.match(w):
                ids.append(w)
                continue
            filt = urllib.parse.quote(f"name eq '{w.replace(chr(39), chr(39) * 2)}'")
            data = self._call("GET", f"{POWERBI}/admin/groups?$top=5000&$filter={filt}", RES_PBI)
            hits = [g["id"] for g in data.get("value", [])]
            if not hits:
                raise FetchError(f"Workspace „{w}“ nicht gefunden.")
            ids += hits
        self.log(f"  {len(ids)} Workspace(s) ausgewählt")
        return ids

    def scan(self, ids: list[str], timeout_s: int = 900) -> list[dict]:
        results = []
        for i in range(0, len(ids), 100):
            chunk = ids[i:i + 100]
            req = self._call("POST", f"{POWERBI}/admin/workspaces/getInfo?lineage=False&datasourceDetails=False"
                                     f"&datasetSchema=True&datasetExpressions=True", RES_PBI, {"workspaces": chunk})
            scan_id = req["id"]
            waited, delay = 0, 2
            while True:
                st = self._call("GET", f"{POWERBI}/admin/workspaces/scanStatus/{scan_id}", RES_PBI)
                if st.get("status") == "Succeeded":
                    break
                if st.get("status") not in ("NotStarted", "Running"):
                    raise FetchError(f"Scan {scan_id}: Status {st.get('status')} {st.get('error', '')}")
                if waited > timeout_s:
                    raise FetchError(f"Scan {scan_id} nach {timeout_s} s nicht fertig")
                self.sleep(delay)
                waited += delay
                delay = min(delay * 2, 30)
            results.append(self._call("GET", f"{POWERBI}/admin/workspaces/scanResult/{scan_id}", RES_PBI))
            self.log(f"  Scan {i // 100 + 1}: {len(chunk)} Workspaces gelesen")
        return results

    def find_monitoring(self, ids: list[str]) -> list[tuple[str, str]]:
        """Monitoring-KQL-Datenbanken in den Workspaces (Name enthält „Monitoring“)."""
        found = []
        for wid in ids:
            status, data = self.request("GET", f"{FABRIC}/workspaces/{wid}/kqlDatabases", self.auth.token(RES_FABRIC))
            if status != 200:
                continue
            for db in data.get("value", []):
                props = db.get("properties") or {}
                if "monitoring" in (db.get("displayName") or "").lower() and props.get("queryServiceUri"):
                    found.append((props["queryServiceUri"], db.get("displayName")))
        if not found:
            self.notes.append("Kein Monitoring-Eventhouse gefunden (Workspace Monitoring aus oder kein Zugriff auf den "
                              "Workspace). Mit --monitoring URI=DATENBANK angeben.")
        return found

    def logs(self, cluster: str, database: str, days: int, include_reports: bool, table: str = "SemanticModelLogs"):
        csl = querylog.kql(days, include_reports, table)
        url = cluster.rstrip("/") + "/v1/rest/query"
        last = None
        for resource in (cluster.rstrip("/"), RES_KUSTO):
            try:
                status, data = self.request("POST", url, self.auth.token(resource), {"db": database, "csl": csl})
            except FetchError as e:
                last = str(e)
                continue
            if status == 200:
                return kusto_rows(data)
            last = f"{status} {data.get('error', '')}"
        raise FetchError(f"Abfrage-Logs aus {database} nicht lesbar: {last}")


def kusto_rows(data: dict) -> list[dict]:
    """Kusto v1: Tables[0].Columns / Rows → Liste von dicts."""
    tables = data.get("Tables") or data.get("tables") or []
    if not tables:
        return []
    t = tables[0]
    cols = [c.get("ColumnName") or c.get("name") for c in t.get("Columns", [])]
    return [dict(zip(cols, row)) for row in t.get("Rows", [])]
