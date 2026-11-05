"""Tenant-Daten direkt holen: Admin-Scanner-API und Abfrage-Logs aus dem Workspace Monitoring.

Ohne Fabric-Admin-Rechte (Admin-API antwortet 401/403) fällt fetch in den Workspace-Modus zurück:
Workspaces aus der normalen Fabric-API (nur die, in denen das Konto Mitglied ist), Modelle per
getDefinition als TMDL (braucht mindestens die Rolle Mitwirkender), Abfrage-Logs wie gehabt.
Das Ergebnis hat dasselbe Format wie die Scanner-API, alles danach bleibt gleich.

Anmeldung (erste, die klappt):
1. Service Principal über AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET
2. Azure CLI (`az login`)
3. azure-identity (DefaultAzureCredential), falls installiert

Nur Lesezugriffe. Nur Python-Standardbibliothek.
"""
from __future__ import annotations

import base64
import json
import os
import re
import shutil
import subprocess
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request

from . import querylog, tmdl

POWERBI = "https://api.powerbi.com/v1.0/myorg"
FABRIC = "https://api.fabric.microsoft.com/v1"
RES_PBI = "https://analysis.windows.net/powerbi/api"
RES_FABRIC = "https://api.fabric.microsoft.com"
RES_KUSTO = "https://kusto.kusto.windows.net"
GUID = re.compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")


class FetchError(RuntimeError):
    pass


class AdminDenied(FetchError):
    """Die Admin-API hat 401/403 geantwortet: kein Fabric-Admin und kein freigegebener Service Principal."""


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
                data = json.loads(raw) if raw.strip() else {}
                if data is None:            # Fabric antwortet bei 202 teils mit dem Body „null“
                    data = {}
                if r.status == 202 and isinstance(data, dict):
                    # Lang laufende Fabric-Operation: Kopfzeilen für das Abwarten mitgeben.
                    data.setdefault("_operation", r.headers.get("x-ms-operation-id") or "")
                    data.setdefault("_location", r.headers.get("Location") or "")
                    data.setdefault("_retry", r.headers.get("Retry-After") or "")
                return r.status, data
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

ADMIN_HINT = (" Für die Admin-APIs braucht es die Rolle Fabric-Administrator oder einen Service Principal, "
              "der in den Tenant-Einstellungen für Admin-APIs freigegeben ist.")


class Fetcher:
    """admin: None = Admin-API versuchen und bei 401/403 in den Workspace-Modus wechseln,
    True = nur Admin-API, False = gleich Workspace-Modus."""

    def __init__(self, auth: Auth | None = None, request=http, log=print, sleep=time.sleep, admin: bool | None = None):
        self.auth = auth or Auth()
        self.request = request
        self.log = log
        self.sleep = sleep
        self.notes: list[str] = []
        self.admin = admin
        self.mode = "workspace" if admin is False else "admin"
        self.ws_names: dict[str, str] = {}

    @property
    def source(self) -> str:
        return "Admin-Scanner-API" if self.mode == "admin" else "Workspace-Modus, getDefinition"

    def _call(self, method, url, resource, body=None, ok=(200, 201, 202)):
        status, data = self.request(method, url, self.auth.token(resource), body)
        if status in ok:
            return data
        err = data.get("error", "") if isinstance(data, dict) else ""
        if status in (401, 403) and "/admin/" in url:
            raise AdminDenied(f"{method} {url.split('?')[0]} → {status}.{ADMIN_HINT} {err}".strip())
        raise FetchError(f"{method} {url.split('?')[0]} → {status}. {err}".strip())

    # ------------------------------------------------------------ Workspaces

    def workspaces(self, wanted: list[str]) -> list[str]:
        if self.mode == "workspace":
            return self._workspaces_member(wanted)
        try:
            return self._workspaces_admin(wanted)
        except AdminDenied:
            if self.admin:
                raise
            self.mode = "workspace"
            self.log("  Keine Admin-Rechte: weiter im Workspace-Modus (nur Workspaces mit eigenem Zugriff)")
            self.notes.append("Ohne Fabric-Admin-Rechte geprüft (Workspace-Modus): nur Workspaces, in denen das Konto "
                              "Mitglied ist. Modelle kommen per getDefinition und brauchen mindestens die Rolle "
                              "Mitwirkender. Für den ganzen Tenant: Rolle Fabric-Administrator oder ein für Admin-APIs "
                              "freigegebener Service Principal.")
            return self._workspaces_member(wanted)

    def _workspaces_member(self, wanted: list[str]) -> list[str]:
        """Workspaces aus der normalen Fabric-API, in denen das Konto Mitglied ist (ohne „Mein Arbeitsbereich“)."""
        found: list[dict] = []
        url = f"{FABRIC}/workspaces"
        while url:
            data = self._call("GET", url, RES_FABRIC)
            found += [w for w in data.get("value", []) if (w.get("type") or "Workspace") == "Workspace"]
            token = data.get("continuationToken")
            url = f"{FABRIC}/workspaces?continuationToken={urllib.parse.quote(token)}" if token else ""
        for w in found:
            self.ws_names[w["id"]] = w.get("displayName", "")
        if not wanted:
            ids = [w["id"] for w in found]
            self.log(f"  {len(ids)} Workspaces mit eigenem Zugriff")
            return ids
        ids = []
        for want in wanted:
            hits = [w["id"] for w in found
                    if w["id"].lower() == want.lower() or (w.get("displayName") or "").lower() == want.lower()]
            if not hits:
                raise FetchError(f"Workspace „{want}“ nicht gefunden oder kein Zugriff. Ohne Admin-Rechte sind nur "
                                 "Workspaces sichtbar, in denen das Konto Mitglied ist.")
            ids += hits
        self.log(f"  {len(ids)} Workspace(s) ausgewählt")
        return ids

    def _workspaces_admin(self, wanted: list[str]) -> list[str]:
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

    # ------------------------------------------------------------ Modelle

    def scan(self, ids: list[str], timeout_s: int = 900) -> list[dict]:
        if self.mode == "workspace":
            return [self._scan_member(ids, timeout_s)]
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

    def _scan_member(self, ids: list[str], timeout_s: int) -> dict:
        """Baut ein Ergebnis im Format der Scanner-API aus getDefinition (TMDL) je Semantikmodell."""
        out = {"workspaces": [], "source": "getDefinition"}
        n_ok = n_err = 0
        for wid in ids:
            name = self.ws_names.get(wid)
            if name is None:
                status, data = self.request("GET", f"{FABRIC}/workspaces/{wid}", self.auth.token(RES_FABRIC))
                name = data.get("displayName", wid) if status == 200 else wid
            ws = {"id": wid, "name": name, "datasets": []}
            data = self._call("GET", f"{FABRIC}/workspaces/{wid}/semanticModels", RES_FABRIC)
            for sm in data.get("value", []):
                ds = {"id": sm.get("id", ""), "name": sm.get("displayName", "?")}
                try:
                    ds.update(_dataset_from_parts(ds["name"], self._definition(wid, ds["id"], timeout_s)))
                    n_ok += 1
                except FetchError as e:
                    ds["schemaRetrievalError"] = str(e)
                    n_err += 1
                ws["datasets"].append(ds)
            out["workspaces"].append(ws)
        self.log(f"  {n_ok} Modelle per getDefinition gelesen" + (f", {n_err} ohne Zugriff" if n_err else ""))
        if n_err:
            self.notes.append(f"{n_err} Modell(e) ließen sich nicht lesen (getDefinition braucht mindestens die Rolle "
                              "Mitwirkender). Sie stehen mit Fehler in der Modell-Übersicht.")
        return out

    def _definition(self, wid: str, mid: str, timeout_s: int) -> list[dict]:
        """getDefinition als TMDL; wartet bei 202 auf die lang laufende Operation."""
        status, data = self.request("POST", f"{FABRIC}/workspaces/{wid}/semanticModels/{mid}/getDefinition?format=TMDL",
                                    self.auth.token(RES_FABRIC), None)
        if status == 200:
            return (data.get("definition") or {}).get("parts", [])
        if status != 202:
            err = data.get("error", "") if isinstance(data, dict) else ""
            raise FetchError(f"getDefinition → {status}. {err}".strip())
        op = data.get("_operation") or (data.get("_location") or "").rstrip("/").split("/")[-1]
        if not op:
            raise FetchError("getDefinition → 202 ohne Operations-ID")
        waited, delay = 0, int(data.get("_retry") or 2)
        while True:
            self.sleep(delay)
            waited += delay
            st = self._call("GET", f"{FABRIC}/operations/{op}", RES_FABRIC)
            state = st.get("status")
            if state == "Succeeded":
                break
            if state in ("Failed", "Undefined"):
                raise FetchError(f"getDefinition: Operation {state} {st.get('error', '')}".strip())
            if waited > timeout_s:
                raise FetchError(f"getDefinition nach {timeout_s} s nicht fertig")
            delay = min(delay * 2, 30)
        res = self._call("GET", f"{FABRIC}/operations/{op}/result", RES_FABRIC)
        return (res.get("definition") or {}).get("parts", [])

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


def _dataset_from_parts(name: str, parts: list[dict]) -> dict:
    """TMDL-Teile aus getDefinition → Dataset im Format der Scanner-API (tables, columns, measures, roles)."""
    with tempfile.TemporaryDirectory(prefix="fabscan-def-") as tmp:
        folder = os.path.join(tmp, "model.SemanticModel")
        for p in parts:
            rel = (p.get("path") or "").replace("\\", "/").lstrip("/")
            if not rel or ".." in rel.split("/"):
                continue
            dest = os.path.join(folder, *rel.split("/"))
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            with open(dest, "wb") as fh:
                fh.write(base64.b64decode(p.get("payload") or ""))
        model = tmdl.load_model(folder, tmp)
    if not model.tables:
        raise FetchError("getDefinition lieferte keine Tabellen (kein TMDL im Ergebnis)")
    member = lambda m: {"name": m.name, "isHidden": m.hidden, "expression": m.expr, "formatString": m.format}
    return {
        "name": name,
        "tables": [{"name": t.name, "isHidden": t.hidden,
                    "columns": [member(c) for c in t.columns.values()],
                    "measures": [member(m) for m in t.measures.values()]} for t in model.tables.values()],
        "roles": [{"name": r, "tablePermissions": [{"name": tb, "filterExpression": f} for tb, f in perms]}
                  for r, perms in model.roles.items()],
    }


def kusto_rows(data: dict) -> list[dict]:
    """Kusto v1: Tables[0].Columns / Rows → Liste von dicts."""
    tables = data.get("Tables") or data.get("tables") or []
    if not tables:
        return []
    t = tables[0]
    cols = [c.get("ColumnName") or c.get("name") for c in t.get("Columns", [])]
    return [dict(zip(cols, row)) for row in t.get("Rows", [])]
