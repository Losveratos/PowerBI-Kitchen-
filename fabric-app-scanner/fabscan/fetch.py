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
        self.db_ids: dict[str, str] = {}          # KQL-Datenbank: Anzeigename → Item-ID
        self.monitored_ws: set[str] = set()       # Workspaces, deren Monitoring-Datenbank gefunden wurde
        self._kql_cache: dict[str, list[dict]] = {}
        self._all_ws_loaded = False

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
            for w in results[-1].get("workspaces", []) or []:     # Namen für die Monitoring-Suche
                self.ws_names.setdefault(w.get("id", ""), w.get("name", ""))
            self.log(f"  Scan {i // 100 + 1}: {len(chunk)} Workspaces gelesen")
        return results

    def _scan_member(self, ids: list[str], timeout_s: int) -> dict:
        """Baut ein Ergebnis im Format der Scanner-API aus getDefinition (TMDL) je Semantikmodell."""
        out = {"workspaces": [], "source": "getDefinition"}
        n_ok = n_info = n_err = 0
        for wid in ids:
            ws = {"id": wid, "name": self._ws_name(wid) or wid, "datasets": []}
            data = self._call("GET", f"{FABRIC}/workspaces/{wid}/semanticModels", RES_FABRIC)
            for sm in data.get("value", []):
                ds = {"id": sm.get("id", ""), "name": sm.get("displayName", "?")}
                try:
                    ds.update(_dataset_from_parts(ds["name"], self._definition(wid, ds["id"], timeout_s)))
                    n_ok += 1
                except FetchError as e:
                    try:        # nur Leserecht: Namen über INFO.VIEW per executeQueries (braucht Build-Recht)
                        ds.update(self._dataset_from_info(wid, ds["id"], ds["name"]))
                        n_info += 1
                    except FetchError as e2:
                        ds["schemaRetrievalError"] = f"{e} · executeQueries: {e2}"
                        n_err += 1
                ws["datasets"].append(ds)
            out["workspaces"].append(ws)
        self.log(f"  {n_ok} Modelle per getDefinition gelesen" + (f", {n_info} nur per INFO.VIEW" if n_info else "")
                 + (f", {n_err} ohne Zugriff" if n_err else ""))
        if n_info:
            self.notes.append(f"{n_info} Modell(e) nur mit Leserecht gelesen (executeQueries mit INFO.VIEW): Tabellen, "
                              "Spalten und Measures mit Namen, aber ohne DAX-Ausdrücke und ohne Rollen. Ob dort RLS "
                              "greift, bleibt offen; dafür mindestens die Rolle Mitwirkender.")
        if n_err:
            self.notes.append(f"{n_err} Modell(e) ließen sich nicht lesen (getDefinition braucht mindestens die Rolle "
                              "Mitwirkender, executeQueries das Build-Recht). Sie stehen mit Fehler in der "
                              "Modell-Übersicht.")
        if any("capacity does not support" in d.get("schemaRetrievalError", "")
               for w in out["workspaces"] for d in w["datasets"]):
            self.notes.append("Direct-Lake-Modelle brauchen eine Fabric-Kapazität. Mindestens ein Workspace hängt an "
                              "keiner passenden Kapazität (abgelaufene Testversion?), dort ist auch kein Workspace "
                              "Monitoring möglich.")
        return out

    def _info_view(self, wid: str, mid: str, fn: str) -> list[dict]:
        body = {"queries": [{"query": f"EVALUATE {fn}()"}], "serializerSettings": {"includeNulls": True}}
        status, data = self.request("POST", f"{POWERBI}/groups/{wid}/datasets/{mid}/executeQueries",
                                    self.auth.token(RES_PBI), body)
        res = ((data or {}).get("results") or [{}])[0] if status == 200 and isinstance(data, dict) else {}
        if status != 200 or "error" in res:
            err = data.get("error", "") if isinstance(data, dict) else ""
            raise FetchError(f"{fn} → {status} {err or res.get('error', '')}".strip()[:300])
        rows = ((res.get("tables") or [{}])[0]).get("rows", [])
        return [{k.strip("[]"): v for k, v in r.items()} for r in rows]

    def _dataset_from_info(self, wid: str, mid: str, name: str) -> dict:
        """Dataset im Format der Scanner-API aus INFO.VIEW.TABLES/COLUMNS/MEASURES. Über executeQueries bleibt
        Expression leer (auch als Workspace-Admin), Rollen gibt es gar nicht (INFO.ROLES lehnt executeQueries ab)."""
        truth = lambda v: v is True or str(v).lower() == "true"
        tables = {str(t.get("Name")): {"name": t.get("Name"), "isHidden": truth(t.get("IsHidden")),
                                        "columns": [], "measures": []}
                  for t in self._info_view(wid, mid, "INFO.VIEW.TABLES")}
        helpers = []
        for c in self._info_view(wid, mid, "INFO.VIEW.COLUMNS"):
            if c.get("Type") == "RowNumber" or str(c.get("Table")) not in tables:
                continue
            if c.get("SortByColumn"):
                helpers.append([str(c["Table"]), str(c["SortByColumn"])])
            tables[str(c["Table"])]["columns"].append({"name": c.get("Name"), "isHidden": truth(c.get("IsHidden")),
                                                       "expression": c.get("Expression") or "",
                                                       "formatString": c.get("FormatString") or ""})
        for m in self._info_view(wid, mid, "INFO.VIEW.MEASURES"):
            if str(m.get("Table")) in tables:
                tables[str(m["Table"])]["measures"].append({"name": m.get("Name"), "isHidden": truth(m.get("IsHidden")),
                                                            "expression": m.get("Expression") or "",
                                                            "formatString": m.get("FormatString") or ""})
        if not tables:
            raise FetchError("INFO.VIEW.TABLES lieferte keine Tabellen")
        try:            # Schlüsselspalten; ohne sie gibt es nur mehr Hinweise SEC-HIDDEN, kein Abbruch
            for r in self._info_view(wid, mid, "INFO.VIEW.RELATIONSHIPS"):
                helpers += [[str(r.get("FromTable", "")), str(r.get("FromColumn", ""))],
                            [str(r.get("ToTable", "")), str(r.get("ToColumn", ""))]]
        except FetchError:
            pass
        return {"name": name, "tables": list(tables.values()), "roles": [], "helperColumns": helpers,
                "schemaSource": "executeQueries",
                "rolesUnknown": True}

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

    # ------------------------------------------------------------ Workspace Monitoring

    def _list(self, url: str) -> list[dict] | None:
        """GET mit continuationToken; None bei Fehler (kein Zugriff, Endpunkt fehlt)."""
        out: list[dict] = []
        nxt = url
        while nxt:
            status, data = self.request("GET", nxt, self.auth.token(RES_FABRIC))
            if status != 200 or not isinstance(data, dict):
                return None
            out += data.get("value", [])
            token = data.get("continuationToken")
            nxt = f"{url}{'&' if '?' in url else '?'}continuationToken={urllib.parse.quote(token)}" if token else ""
        return out

    def _kql_databases(self, wid: str) -> list[dict]:
        if wid not in self._kql_cache:
            self._kql_cache[wid] = self._list(f"{FABRIC}/workspaces/{wid}/kqlDatabases") or []
        return self._kql_cache[wid]

    def _monitoring_items(self, wid: str) -> list[dict]:
        """Monitoring-Items (Typ „Monitoring“). monitoringItems liefert den Sammelstatus mit, /items ist der Rückweg."""
        items = self._list(f"{FABRIC}/workspaces/{wid}/monitoringItems")
        if items is None:
            items = self._list(f"{FABRIC}/workspaces/{wid}/items?type=Monitoring")
        return [i for i in items or [] if (i.get("type") or "Monitoring") == "Monitoring"]

    def _member_workspaces(self) -> dict[str, str]:
        if not self._all_ws_loaded:
            for w in self._list(f"{FABRIC}/workspaces") or []:
                if (w.get("type") or "Workspace") == "Workspace":
                    self.ws_names.setdefault(w["id"], w.get("displayName", ""))
            self._all_ws_loaded = True
        return self.ws_names

    def _ws_name(self, wid: str) -> str:
        if wid not in self.ws_names:
            status, data = self.request("GET", f"{FABRIC}/workspaces/{wid}", self.auth.token(RES_FABRIC))
            self.ws_names[wid] = data.get("displayName", "") if status == 200 and isinstance(data, dict) else ""
        return self.ws_names[wid]

    def _monitoring_db(self, wid: str, ws_name: str, item_name: str) -> dict | None:
        """KQL-Datenbank eines Monitoring-Items: Name „<Workspace>_<Item>_Database“ (Sonderzeichen werden zu „_“).
        Erst im eigenen Workspace, dann (zentrales Eventhouse eines anderen Monitoring-Items) in den übrigen."""
        want, ws_key = monitoring_db_key(ws_name, item_name), _kql_key(ws_name)

        def pick(dbs):
            usable = [d for d in dbs if (d.get("properties") or {}).get("queryServiceUri")]
            return (next((d for d in usable if _kql_key(d.get("displayName")) == want), None)
                    or next((d for d in usable if ws_key and _kql_key(d.get("displayName")).startswith(ws_key)
                             and _kql_key(d.get("displayName")).endswith("database")), None))

        hit = pick(self._kql_databases(wid))
        if hit:
            return hit
        others = [w for w in self._member_workspaces() if w != wid]
        if others:
            self.log(f"  Monitoring-Datenbank von „{ws_name}“ nicht im Workspace selbst, suche in {len(others)} weiteren")
        for other in others:
            hit = pick(self._kql_databases(other))
            if hit:
                return hit
        return None

    def find_monitoring(self, ids: list[str]) -> list[tuple[str, str]]:
        """KQL-Datenbanken des Workspace Monitoring in den Workspaces.

        Neu: Monitoring-Item (Typ „Monitoring“) mit eigener KQL-Datenbank oder Weiterleitung an das Eventhouse eines
        anderen Monitoring-Items. Alt: Monitoring-Eventhouse mit einer KQL-Datenbank, die „Monitoring“ im Namen hat."""
        found: list[tuple[str, str]] = []

        def add(db, wid=""):
            if wid:
                self.monitored_ws.add(wid.lower())
            entry = (db["properties"]["queryServiceUri"], db.get("displayName", ""))
            if entry not in found:
                found.append(entry)
                if db.get("id"):
                    self.db_ids[entry[1]] = db["id"]

        if self.mode == "admin" and self._find_monitoring_admin(ids, add):
            return found
        for wid in ids:
            items = self._monitoring_items(wid)
            ws_name = self._ws_name(wid) if items else ""
            for mon in items:
                name = mon.get("displayName", "")
                state = (mon.get("properties") or {}).get("dataCollectionState", "")
                if state and state != "Enabled":
                    self.notes.append(f"Monitoring-Item „{name}“ in „{ws_name}“ sammelt keine Daten "
                                      f"(dataCollectionState {state}). In den Workspace-Einstellungen unter Monitoring "
                                      "die Datensammlung einschalten.")
                db = self._monitoring_db(wid, ws_name, name)
                if db:
                    add(db, wid)
                else:
                    self.notes.append(f"Monitoring-Item „{name}“ in „{ws_name}“ gefunden, aber keine KQL-Datenbank "
                                      f"„{ws_name}_{name}_Database“ mit Zugriff. Liegt das Eventhouse in einem Workspace "
                                      "ohne Mitgliedschaft, dort Mitwirkender werden oder --monitoring URI=DATENBANK "
                                      "angeben.")
            if not items:
                for db in self._kql_databases(wid):
                    props = db.get("properties") or {}
                    if "monitoring" in (db.get("displayName") or "").lower() and props.get("queryServiceUri"):
                        add(db, wid)
        if not found:
            self.notes.append("Kein Workspace Monitoring gefunden (weder Monitoring-Item noch Monitoring-Eventhouse, "
                              "oder kein Zugriff auf den Workspace). Mit --monitoring URI=DATENBANK angeben.")
        return found

    def _admin_items(self, item_type: str) -> list[dict] | None:
        """Fabric-Admin-API: alle Items eines Typs im Tenant (10 Aufrufe je Minute, 429 wiederholt http())."""
        out: list[dict] = []
        url = f"{FABRIC}/admin/items?type={item_type}"
        while url:
            status, data = self.request("GET", url, self.auth.token(RES_FABRIC))
            if status != 200 or not isinstance(data, dict):
                return None
            out += data.get("itemEntities", [])
            token = data.get("continuationToken")
            url = f"{FABRIC}/admin/items?type={item_type}&continuationToken={urllib.parse.quote(token)}" if token else ""
        return out

    def _find_monitoring_admin(self, ids: list[str], add) -> bool:
        """Ganzer Tenant: Monitoring-Items und KQL-Datenbanken aus der Admin-API (zwei Listen statt je Workspace
        mehrere Aufrufe). Lesen lässt sich eine Datenbank trotzdem nur mit Zugriff auf ihren Workspace; bei
        zentralem Eventhouse reicht der eine Workspace. False, wenn die Admin-API nicht antwortet."""
        mons, dbs = self._admin_items("Monitoring"), self._admin_items("KQLDatabase")
        if mons is None or dbs is None:
            return False
        wanted = {w.lower() for w in ids}
        by_ws: dict[str, list[dict]] = {}
        for m in mons:
            if (m.get("workspaceId") or "").lower() in wanted:
                by_ws.setdefault(m["workspaceId"].lower(), []).append(m)
        missing = [w for w in ids if w.lower() not in by_ws]
        denied: dict[str, int] = {}
        props_cache: dict[str, dict | None] = {}

        def resolve(db: dict, src: str) -> bool:
            if db["id"] not in props_cache:
                status, data = self.request("GET", f"{FABRIC}/workspaces/{db['workspaceId']}/kqlDatabases/{db['id']}",
                                            self.auth.token(RES_FABRIC))
                ok = status == 200 and isinstance(data, dict) and (data.get("properties") or {}).get("queryServiceUri")
                props_cache[db["id"]] = data if ok else None
            data = props_cache[db["id"]]
            if data is None:
                host = self.ws_names.get(db["workspaceId"]) or db["workspaceId"]
                denied[host] = denied.get(host, 0) + 1
                return False
            add({"id": db["id"], "displayName": data.get("displayName") or db.get("name", ""),
                 "properties": data["properties"]}, src)
            return True

        for wid, items in by_ws.items():
            ws_name = self._ws_name(wid)
            for mon in items:
                want, ws_key = monitoring_db_key(ws_name, mon.get("name", "")), _kql_key(ws_name)
                cand = sorted((d for d in dbs if _kql_key(d.get("name")) == want or
                               (ws_key and _kql_key(d.get("name")).startswith(ws_key)
                                and _kql_key(d.get("name")).endswith("database"))),
                              key=lambda d: (_kql_key(d.get("name")) != want, (d.get("workspaceId") or "").lower() != wid))
                if not cand:
                    self.notes.append(f"Monitoring-Item „{mon.get('name', '')}“ in „{ws_name}“: keine KQL-Datenbank "
                                      f"„{ws_name}_{mon.get('name', '')}_Database“ im Tenant gefunden.")
                    continue
                resolve(cand[0], wid)
        off = []
        for wid in missing:                      # altes Workspace Monitoring ohne Item
            legacy = [d for d in dbs if (d.get("workspaceId") or "").lower() == wid.lower()
                      and "monitoring" in (d.get("name") or "").lower()]
            for d in legacy:
                resolve(d, wid)
            if not legacy:
                off.append(wid)
        if off:
            names = [self.ws_names.get(w) or w for w in off][:8]
            self.notes.append(f"{len(off)} von {len(ids)} geprüften Workspaces ohne Workspace Monitoring, dort fehlen die "
                              f"Abfragen (z. B. {', '.join(names)}). Empfehlung: in jedem Workspace ein Monitoring-Item, "
                              "das an ein zentrales Eventhouse weiterleitet.")
        for host, n in sorted(denied.items()):
            self.notes.append(f"{n} Monitoring-Datenbank(en) in „{host}“ ohne Lesezugriff. Das prüfende Konto braucht "
                              "dort mindestens die Rolle Mitwirkender (Fabric-Admin allein gibt keinen Datenzugriff).")
        return True

    def logs_all(self, mons: list[tuple[str, str]], days: int, include_reports: bool,
                 table: str = "SemanticModelLogs", chunk: int = 25):
        """Abfrage-Logs aller Monitoring-Datenbanken. Mehrere Datenbanken auf demselben Eventhouse (zentrales
        Monitoring: eine Datenbank je Workspace) gehen per union in einer Abfrage je 25 Datenbanken.
        Liefert Zeilen und je Abfrage (Beschriftung, Anzahl verschiedener Abfragen)."""
        rows, report = [], []
        by_cluster: dict[str, list[str]] = {}
        for cluster, db in mons:
            by_cluster.setdefault(cluster, []).append(db)
        for cluster, dbs in by_cluster.items():
            for i in range(0, len(dbs), chunk):
                part_dbs = dbs[i:i + chunk]
                part = None
                if len(part_dbs) > 1:
                    status, data = self._kusto(cluster, "/v1/rest/query", part_dbs[0],
                                               querylog.kql(days, include_reports, querylog.union_source(part_dbs, table)))
                    if status == 200:
                        part = kusto_rows(data)
                        report.append((f"{urllib.parse.urlparse(cluster).netloc or cluster}: {len(part_dbs)} Datenbanken",
                                       len(part)))
                if part is None:        # eine Datenbank, oder union gescheitert: einzeln
                    part = []
                    for d in part_dbs:
                        try:
                            got = self.logs(cluster, d, days, include_reports, table)
                        except FetchError as e:
                            if len(mons) == 1:
                                raise          # nur eine Datenbank: Abbruch mit Klartext wie bisher
                            self.notes.append(str(e))
                            continue           # im Tenant-Lauf hält eine Datenbank den Rest nicht auf
                        report.append((d, len(got)))
                        part += got
                rows += part
        return rows, report

    def _kusto(self, cluster: str, path: str, database: str, csl: str):
        """Kusto-REST (v1) mit Token für den Cluster, sonst für kusto.windows.net. Gibt (status, data) zurück."""
        url = cluster.rstrip("/") + path
        last = (0, {"error": ""})
        for resource in (cluster.rstrip("/"), RES_KUSTO):
            try:
                status, data = self.request("POST", url, self.auth.token(resource), {"db": database, "csl": csl})
            except FetchError as e:
                last = (0, {"error": str(e)})
                continue
            if status == 200:
                return status, data
            last = (status, data if isinstance(data, dict) else {"error": str(data)})
            if status not in (401, 403):
                break
        return last

    def logs(self, cluster: str, database: str, days: int, include_reports: bool, table: str = "SemanticModelLogs"):
        dbs = [database] + [x for x in (self.db_ids.get(database),) if x]   # Anzeigename, dann Item-ID
        status, data = 0, {"error": ""}
        for db in dbs:
            status, data = self._kusto(cluster, "/v1/rest/query", db, querylog.kql(days, include_reports, table))
            if status == 200:
                return kusto_rows(data)
            err = data.get("error", "")
            if re.search(r"resolve|not found|SEM0100", err, re.I):
                other = self._log_table(cluster, db, table)
                if other:
                    self.notes.append(f"Log-Tabelle in {database} heißt „{other}“ statt „{table}“.")
                    status, data = self._kusto(cluster, "/v1/rest/query", db, querylog.kql(days, include_reports, other))
                    if status == 200:
                        return kusto_rows(data)
            if status in (401, 403):
                break
        raise FetchError(f"Abfrage-Logs aus {database} nicht lesbar: {status} {data.get('error', '')}".strip())

    def _log_table(self, cluster: str, database: str, table: str) -> str:
        """Fehlt die Log-Tabelle, unter .show tables nach der Tabelle der Semantikmodell-Logs suchen."""
        status, data = self._kusto(cluster, "/v1/rest/mgmt", database, ".show tables | project TableName")
        if status != 200:
            return ""
        names = [str(r.get("TableName", "")) for r in kusto_rows(data)]
        return next((n for n in names if n.lower() == table.lower()), "") or \
            next((n for n in names if re.fullmatch(r"semantic_?models?_?logs?", n, re.I)), "") or \
            next((n for n in names if "semanticmodel" in n.lower().replace("_", "") and "log" in n.lower()), "")


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
        "helperColumns": sorted([t, c] for t, c in model.helper_columns),
    }


def _kql_key(name) -> str:
    """Vergleichsschlüssel für KQL-Datenbanknamen: nur Buchstaben und Ziffern, klein. Fabric ersetzt Sonderzeichen
    durch „_“ und verbindet Workspace, Item und „Database“; so passen „A B_C_Database“ und „A_B_C_Database“."""
    return "".join(ch for ch in str(name or "").lower() if ch.isalnum())


def monitoring_db_key(ws_name: str, item_name: str) -> str:
    return _kql_key(ws_name) + _kql_key(item_name) + "database"


def kusto_rows(data: dict) -> list[dict]:
    """Kusto v1: Tables[0].Columns / Rows → Liste von dicts."""
    tables = data.get("Tables") or data.get("tables") or []
    if not tables:
        return []
    t = tables[0]
    cols = [c.get("ColumnName") or c.get("name") for c in t.get("Columns", [])]
    return [dict(zip(cols, row)) for row in t.get("Rows", [])]
