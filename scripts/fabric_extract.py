#!/usr/bin/env python3
"""Fabric-Workspace-Backup: Metadaten + Item-Definitionen per Fabric REST API sichern.

Verbindet sich mit der Microsoft Fabric REST API (api.fabric.microsoft.com),
listet alle Items eines Workspace (Notebooks, Reports, Semantic Models,
Lakehouses, Pipelines, ...) und exportiert deren Definitionen als Dateien —
Notebooks als .ipynb, Semantic Models als TMDL, Reports als PBIR usw.

Authentifizierung (erste passende Methode gewinnt):
  1. FABRIC_TOKEN                      — fertiges Bearer-Token (z. B. aus dem Browser / az cli)
  2. FABRIC_TENANT_ID + FABRIC_CLIENT_ID + FABRIC_CLIENT_SECRET
                                       — Service Principal (Client-Credentials-Flow)
  3. az cli                            — `az account get-access-token`, falls installiert & eingeloggt
  4. --auth device                     — interaktiver Device-Code-Flow (Browser auf zweitem Gerät)

Beispiele:
  python3 scripts/fabric_extract.py --list-workspaces
  python3 scripts/fabric_extract.py --workspace "Mein Workspace"
  python3 scripts/fabric_extract.py --workspace 11111111-2222-3333-4444-555555555555 \
      --out fabric_backup --types Notebook,SemanticModel,Report
  python3 scripts/fabric_extract.py --workspace "Mein Workspace" --no-definitions

Details & Setup: scripts/FABRIC_EXTRACT.md
"""

from __future__ import annotations

import argparse
import base64
import datetime as _dt
import json
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

import requests

API = "https://api.fabric.microsoft.com/v1"
SCOPE = "https://api.fabric.microsoft.com/.default"
# Well-known Public-Client-ID der Azure CLI — erlaubt Device-Code ohne eigene App-Registrierung.
AZ_CLI_CLIENT_ID = "04b07795-8ddb-461a-bbee-02f9e1bf7b46"

# Bevorzugtes Export-Format je Item-Typ (Fallback: API-Default ohne format-Parameter).
PREFERRED_FORMAT = {
    "Notebook": "ipynb",
    "SemanticModel": "TMDL",
    "Report": "PBIR",
}

# Typen, die laut API-Doku gar keine getDefinition-Unterstützung haben — hier
# sichern wir nur die Item-Metadaten, ohne einen (immer scheiternden) Call.
NO_DEFINITION_TYPES = {
    "Lakehouse", "Warehouse", "SQLEndpoint", "Dashboard", "Datamart",
    "PaginatedReport", "MLModel", "MLExperiment", "Environment",
}


def log(msg: str) -> None:
    print(msg, flush=True)


def die(msg: str, code: int = 1) -> None:
    print(f"FEHLER: {msg}", file=sys.stderr, flush=True)
    sys.exit(code)


# ---------------------------------------------------------------- Auth

def token_from_service_principal() -> str | None:
    tenant = os.environ.get("FABRIC_TENANT_ID")
    client = os.environ.get("FABRIC_CLIENT_ID")
    secret = os.environ.get("FABRIC_CLIENT_SECRET")
    if not (tenant and client and secret):
        return None
    log(f"→ Auth: Service Principal ({client[:8]}…) in Tenant {tenant[:8]}…")
    resp = requests.post(
        f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token",
        data={
            "grant_type": "client_credentials",
            "client_id": client,
            "client_secret": secret,
            "scope": SCOPE,
        },
        timeout=30,
    )
    if resp.status_code != 200:
        die(f"Service-Principal-Login fehlgeschlagen ({resp.status_code}): {resp.text[:500]}")
    return resp.json()["access_token"]


def token_from_az_cli() -> str | None:
    az = shutil.which("az")
    if not az:
        return None
    try:
        out = subprocess.run(
            [az, "account", "get-access-token", "--resource", "https://api.fabric.microsoft.com"],
            capture_output=True, text=True, timeout=60,
        )
    except Exception:
        return None
    if out.returncode != 0:
        return None
    log("→ Auth: Azure CLI (az account get-access-token)")
    return json.loads(out.stdout)["access_token"]


def token_from_device_code() -> str:
    tenant = os.environ.get("FABRIC_TENANT_ID", "organizations")
    base = f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0"
    resp = requests.post(
        f"{base}/devicecode",
        data={"client_id": AZ_CLI_CLIENT_ID, "scope": SCOPE},
        timeout=30,
    )
    if resp.status_code != 200:
        die(f"Device-Code-Anforderung fehlgeschlagen ({resp.status_code}): {resp.text[:500]}")
    dc = resp.json()
    log("")
    log(f"  {dc['message']}")
    log("")
    interval = int(dc.get("interval", 5))
    deadline = time.time() + int(dc.get("expires_in", 900))
    while time.time() < deadline:
        time.sleep(interval)
        poll = requests.post(
            f"{base}/token",
            data={
                "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
                "client_id": AZ_CLI_CLIENT_ID,
                "device_code": dc["device_code"],
            },
            timeout=30,
        )
        body = poll.json()
        if poll.status_code == 200:
            log("→ Auth: Device-Code erfolgreich")
            return body["access_token"]
        if body.get("error") in ("authorization_pending", "slow_down"):
            if body.get("error") == "slow_down":
                interval += 5
            continue
        die(f"Device-Code-Login fehlgeschlagen: {body.get('error_description', poll.text[:500])}")
    die("Device-Code-Login: Zeit abgelaufen.")
    raise AssertionError  # unreachable


def get_token(auth_mode: str) -> str:
    if auth_mode == "device":
        return token_from_device_code()
    env_token = os.environ.get("FABRIC_TOKEN")
    if env_token:
        log("→ Auth: Token aus FABRIC_TOKEN")
        return env_token.strip()
    for fn in (token_from_service_principal, token_from_az_cli):
        token = fn()
        if token:
            return token
    die(
        "Keine Authentifizierung gefunden. Setze FABRIC_TOKEN oder "
        "FABRIC_TENANT_ID/FABRIC_CLIENT_ID/FABRIC_CLIENT_SECRET, logge dich mit "
        "`az login` ein, oder starte mit `--auth device`. Siehe scripts/FABRIC_EXTRACT.md"
    )
    raise AssertionError  # unreachable


# ---------------------------------------------------------------- API-Helfer

class FabricClient:
    def __init__(self, token: str):
        self.s = requests.Session()
        self.s.headers["Authorization"] = f"Bearer {token}"

    def _request(self, method: str, url: str, **kw) -> requests.Response:
        """Request mit Retry bei 429 (Throttling) und transienten 5xx."""
        for attempt in range(6):
            resp = self.s.request(method, url, timeout=120, **kw)
            if resp.status_code == 429 or resp.status_code >= 500:
                wait = int(resp.headers.get("Retry-After", 2 ** attempt))
                log(f"    … HTTP {resp.status_code}, warte {wait}s (Versuch {attempt + 1}/6)")
                time.sleep(min(wait, 120))
                continue
            return resp
        return resp

    def get_paged(self, path: str, key: str = "value") -> list[dict]:
        """GET mit continuationToken-Paginierung."""
        items: list[dict] = []
        url = f"{API}{path}"
        params: dict = {}
        while True:
            resp = self._request("GET", url, params=params)
            if resp.status_code == 401:
                die("401 Unauthorized — Token abgelaufen oder falsche Ressource/Scope.")
            if resp.status_code == 403:
                die(f"403 Forbidden für {path} — fehlende Workspace-Rolle oder "
                    "Tenant-Setting 'Service principals can use Fabric APIs' ist aus.")
            if resp.status_code != 200:
                die(f"GET {path} → {resp.status_code}: {resp.text[:500]}")
            body = resp.json()
            items.extend(body.get(key, []))
            token = body.get("continuationToken")
            if not token:
                return items
            params = {"continuationToken": token}

    def post_lro(self, path: str, params: dict | None = None) -> dict | None:
        """POST mit Long-Running-Operation-Handling (202 → Polling → Result).

        Gibt das Ergebnis-JSON zurück, oder None wenn der Server den Call mit
        einem Client-Fehler ablehnt (z. B. Format/Typ nicht unterstützt).
        """
        resp = self._request("POST", f"{API}{path}", params=params or {})
        if resp.status_code == 200:
            return resp.json()
        if resp.status_code != 202:
            return None
        op_url = resp.headers.get("Location")
        if not op_url:
            return None
        for _ in range(120):
            time.sleep(int(resp.headers.get("Retry-After", 3)))
            resp = self._request("GET", op_url)
            if resp.status_code != 200:
                return None
            body = resp.json()
            status = body.get("status")
            if status == "Succeeded":
                result = self._request("GET", f"{op_url}/result")
                return result.json() if result.status_code == 200 else None
            if status in ("Failed", "Cancelled"):
                log(f"    … Operation {status}: {json.dumps(body.get('error', {}))[:300]}")
                return None
        return None


# ---------------------------------------------------------------- Extraktion

def sanitize(name: str) -> str:
    cleaned = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", name).strip(" .")
    return cleaned or "unnamed"


def write_definition(def_result: dict, target: Path) -> int:
    """Base64-Parts einer Item-Definition dekodiert auf die Platte schreiben."""
    parts = (def_result.get("definition") or {}).get("parts") or []
    written = 0
    for part in parts:
        rel = part.get("path")
        payload = part.get("payload")
        if not rel or payload is None:
            continue
        rel_path = Path(rel.replace("\\", "/"))
        if rel_path.is_absolute() or ".." in rel_path.parts:
            log(f"    ! übersprungen (unsicherer Pfad): {rel}")
            continue
        out = target / rel_path
        out.parent.mkdir(parents=True, exist_ok=True)
        if part.get("payloadType") == "InlineBase64":
            out.write_bytes(base64.b64decode(payload))
        else:
            out.write_text(str(payload), encoding="utf-8")
        written += 1
    return written


def resolve_workspace(client: FabricClient, ident: str) -> dict:
    workspaces = client.get_paged("/workspaces")
    guid_rx = re.compile(r"^[0-9a-fA-F-]{36}$")
    if guid_rx.match(ident):
        for ws in workspaces:
            if ws["id"].lower() == ident.lower():
                return ws
        die(f"Workspace mit ID {ident} nicht gefunden (oder keine Berechtigung).")
    matches = [ws for ws in workspaces if ws.get("displayName", "").lower() == ident.lower()]
    if not matches:
        names = ", ".join(sorted(ws.get("displayName", "?") for ws in workspaces)) or "—"
        die(f"Workspace '{ident}' nicht gefunden. Sichtbare Workspaces: {names}")
    if len(matches) > 1:
        die(f"Workspace-Name '{ident}' ist mehrdeutig — bitte GUID angeben.")
    return matches[0]


def extract_workspace(client: FabricClient, ws: dict, out_root: Path,
                      with_definitions: bool, type_filter: set[str] | None) -> None:
    ts = _dt.datetime.now(_dt.timezone.utc).strftime("%Y%m%d_%H%M%S")
    target = out_root / f"{sanitize(ws['displayName'])}_{ts}"
    target.mkdir(parents=True, exist_ok=True)
    log(f"→ Backup-Ziel: {target}")

    (target / "workspace.json").write_text(
        json.dumps(ws, indent=2, ensure_ascii=False), encoding="utf-8")

    items = client.get_paged(f"/workspaces/{ws['id']}/items")
    (target / "items.json").write_text(
        json.dumps(items, indent=2, ensure_ascii=False), encoding="utf-8")
    log(f"→ {len(items)} Items im Workspace gefunden")

    manifest = []
    for item in items:
        itype, iname, iid = item.get("type", "?"), item.get("displayName", "?"), item["id"]
        if type_filter and itype not in type_filter:
            continue
        item_dir = target / sanitize(itype) / sanitize(iname)
        item_dir.mkdir(parents=True, exist_ok=True)
        (item_dir / "item.json").write_text(
            json.dumps(item, indent=2, ensure_ascii=False), encoding="utf-8")

        entry = {"id": iid, "type": itype, "name": iname, "definition": None}
        if with_definitions and itype not in NO_DEFINITION_TYPES:
            log(f"  · {itype} / {iname} — hole Definition …")
            path = f"/workspaces/{ws['id']}/items/{iid}/getDefinition"
            fmt = PREFERRED_FORMAT.get(itype)
            result = client.post_lro(path, {"format": fmt} if fmt else None)
            if result is None and fmt:
                result = client.post_lro(path)  # Fallback ohne format-Parameter
            if result:
                n = write_definition(result, item_dir / "definition")
                entry["definition"] = f"{n} Dateien"
                log(f"    ✓ {n} Definition-Dateien")
            else:
                entry["definition"] = "nicht verfügbar"
                log("    – keine Definition exportierbar (Typ nicht unterstützt oder Fehler)")
        else:
            log(f"  · {itype} / {iname} — nur Metadaten")
        manifest.append(entry)

    (target / "manifest.json").write_text(
        json.dumps({
            "workspace": ws.get("displayName"),
            "workspaceId": ws["id"],
            "extractedAtUtc": ts,
            "itemCount": len(manifest),
            "items": manifest,
        }, indent=2, ensure_ascii=False), encoding="utf-8")
    log(f"✓ Fertig: {len(manifest)} Items gesichert → {target}")


# ---------------------------------------------------------------- CLI

def main() -> None:
    ap = argparse.ArgumentParser(
        description="Fabric-Workspace-Metadaten + Item-Definitionen als Backup sichern.")
    ap.add_argument("--workspace", "-w", help="Workspace-Name oder GUID")
    ap.add_argument("--list-workspaces", action="store_true",
                    help="Nur sichtbare Workspaces auflisten")
    ap.add_argument("--out", "-o", default="fabric_backup",
                    help="Ziel-Ordner (Default: fabric_backup/)")
    ap.add_argument("--types", help="Nur diese Item-Typen, kommagetrennt (z. B. Notebook,Report)")
    ap.add_argument("--no-definitions", action="store_true",
                    help="Nur Metadaten sichern, keine Definitionen exportieren")
    ap.add_argument("--auth", choices=["auto", "device"], default="auto",
                    help="'device' erzwingt interaktiven Device-Code-Login")
    args = ap.parse_args()

    if not args.list_workspaces and not args.workspace:
        ap.error("--workspace angeben oder --list-workspaces nutzen")

    client = FabricClient(get_token(args.auth))

    if args.list_workspaces:
        workspaces = client.get_paged("/workspaces")
        if not workspaces:
            log("Keine Workspaces sichtbar (Berechtigungen prüfen).")
            return
        log(f"{len(workspaces)} Workspaces:")
        for ws in sorted(workspaces, key=lambda w: w.get("displayName", "")):
            log(f"  {ws['id']}  {ws.get('displayName', '?')}  [{ws.get('type', '?')}]")
        return

    ws = resolve_workspace(client, args.workspace)
    type_filter = {t.strip() for t in args.types.split(",")} if args.types else None
    extract_workspace(client, ws, Path(args.out),
                      with_definitions=not args.no_definitions,
                      type_filter=type_filter)


if __name__ == "__main__":
    main()
