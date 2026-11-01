"""fabscan fetch gegen eine nachgebaute Fabric-/Power-BI-API (keine echten Aufrufe)."""
import base64
import io
import json
import os
import re
import shutil
import sys
import tempfile
import unittest
from collections import defaultdict
from contextlib import redirect_stdout
from unittest import mock

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, ".."))

from fabscan import cli, fetch  # noqa: E402

FIX = os.path.join(HERE, "fixtures", "tenant")
WS = "9eb531b4-f97a-4dad-99ff-fac0e31fbeb3"
CLUSTER = "https://trd-abc.z3.kusto.fabric.microsoft.com"


def kusto_response():
    """Beispiel-Logs so zusammengefasst, wie die KQL aus querylog.kql es täte (Kusto-v1-Format)."""
    groups = defaultdict(list)
    with open(os.path.join(FIX, "semantic_model_logs.jsonl"), encoding="utf-8") as fh:
        for line in fh:
            r = json.loads(line)
            if r["OperationName"] != "QueryEnd" or "ReportId" in (r.get("ApplicationContext") or ""):
                continue
            groups[(r["WorkspaceId"], r["WorkspaceName"], r["ItemId"], r["ItemName"], r["ApplicationName"],
                    r["ExecutingUser"], r["EventText"], False)].append(r)
    cols = ["WorkspaceId", "WorkspaceName", "ItemId", "ItemName", "ApplicationName", "ExecutingUser", "EventText",
            "IsReport", "Count", "FirstSeen", "LastSeen", "DurationMs", "OperationName"]
    rows = [list(k) + [len(v), min(x["Timestamp"] for x in v), max(x["Timestamp"] for x in v),
                       sum(x["DurationMs"] for x in v), "QueryEnd"] for k, v in groups.items()]
    return {"Tables": [{"TableName": "Table_0", "Columns": [{"ColumnName": c} for c in cols], "Rows": rows}]}


def tmdl_parts(ds: dict) -> list[dict]:
    """Ein Dataset aus der Scanner-Fixture als TMDL-Teile, wie getDefinition sie liefert."""
    q = lambda n: f"'{n}'" if (" " in n or "-" in n) else n
    b64 = lambda s: base64.b64encode(s.encode("utf-8")).decode()
    parts = [{"path": "definition.pbism", "payload": b64("{}"), "payloadType": "InlineBase64"}]
    for t in ds.get("tables", []):
        lines = [f"table {q(t['name'])}"] + (["\tisHidden"] if t.get("isHidden") else []) + [""]
        for ms in t.get("measures", []):
            lines += [f"\tmeasure {q(ms['name'])} = {ms.get('expression', '')}"]
            if ms.get("formatString"):
                lines += [f"\t\tformatString: {ms['formatString']}"]
            lines += ["\t\tisHidden"] if ms.get("isHidden") else []
            lines += [""]
        for c in t.get("columns", []):
            lines += [f"\tcolumn {q(c['name'])}"] + (["\t\tisHidden"] if c.get("isHidden") else []) + [""]
        parts.append({"path": f"definition/tables/{t['name']}.tmdl", "payload": b64("\n".join(lines)),
                      "payloadType": "InlineBase64"})
    for r in ds.get("roles", []):
        lines = [f"role {q(r['name'])}"] + [f"\ttablePermission {q(p['name'])} = {p.get('filterExpression', '')}"
                                            for p in r.get("tablePermissions", [])]
        parts.append({"path": f"definition/roles/{r['name']}.tmdl", "payload": b64("\n".join(lines)),
                      "payloadType": "InlineBase64"})
    return parts


class FakeFabric:
    def __init__(self, admin=True, lro=False, denied_models=()):
        self.calls, self.admin, self.polls = [], admin, 0
        self.lro, self.denied_models, self.op_polls = lro, set(denied_models), 0
        with open(os.path.join(FIX, "scan_result.json"), encoding="utf-8") as fh:
            self.scan = json.load(fh)
        self.datasets = {d["id"]: d for w in self.scan["workspaces"] for d in w["datasets"]}

    def __call__(self, method, url, token, body=None):
        self.calls.append((method, url.split("?")[0], body))
        if "/admin/" in url and not self.admin:
            return 403, {"error": "Forbidden"}
        # --- normale Fabric-API (Workspace-Modus)
        if url.split("?")[0] == f"{fetch.FABRIC}/workspaces":
            return 200, {"value": [{"id": WS, "displayName": "Finance", "type": "Workspace"},
                                   {"id": "p-1", "displayName": "Mein Arbeitsbereich", "type": "Personal"}]}
        if url == f"{fetch.FABRIC}/workspaces/{WS}/semanticModels":
            return 200, {"value": [{"id": i, "displayName": d["name"]} for i, d in self.datasets.items()]}
        m = re.match(rf"{re.escape(fetch.FABRIC)}/workspaces/{WS}/semanticModels/([^/]+)/getDefinition", url)
        if m:
            assert "format=TMDL" in url
            if m.group(1) in self.denied_models:
                return 403, {"error": "InsufficientPrivileges"}
            parts = tmdl_parts(self.datasets[m.group(1)])
            if self.lro:
                self.pending = parts
                return 202, {"_operation": "op-1", "_location": f"{fetch.FABRIC}/operations/op-1", "_retry": "1"}
            return 200, {"definition": {"parts": parts}}
        if url == f"{fetch.FABRIC}/operations/op-1":
            self.op_polls += 1
            return 200, {"status": "Running" if self.op_polls < 2 else "Succeeded"}
        if url == f"{fetch.FABRIC}/operations/op-1/result":
            self.op_polls = 0
            return 200, {"definition": {"parts": self.pending}}
        if url.startswith(f"{fetch.POWERBI}/admin/workspaces/modified"):
            return 200, [{"id": WS}]
        if url.startswith(f"{fetch.POWERBI}/admin/groups"):
            return 200, {"value": [{"id": WS, "name": "Finance"}]} if "Finance" in url else {"value": []}
        if url.startswith(f"{fetch.POWERBI}/admin/workspaces/getInfo"):
            assert "datasetSchema=True" in url and "datasetExpressions=True" in url
            return 202, {"id": "scan-1", "status": "NotStarted"}
        if "/admin/workspaces/scanStatus/" in url:
            self.polls += 1
            return 200, {"status": "Running" if self.polls < 2 else "Succeeded"}
        if "/admin/workspaces/scanResult/" in url:
            return 200, self.scan
        if url == f"{fetch.FABRIC}/workspaces/{WS}/kqlDatabases":
            return 200, {"value": [
                {"displayName": "Monitoring KQL database", "properties": {"queryServiceUri": CLUSTER, "parentEventhouseItemId": "e1"}},
                {"displayName": "Sensoren", "properties": {"queryServiceUri": "https://other"}}]}
        if url == f"{CLUSTER}/v1/rest/query":
            assert body["db"] == "Monitoring KQL database" and "SemanticModelLogs" in body["csl"]
            return 200, kusto_response()
        return 404, {"error": f"unerwartet: {url}"}


class TokenStub:
    method = "Test"

    def token(self, resource):
        return "token-" + resource


class Fetch(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp(prefix="fabscan-fetch-")

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def run_fetch(self, fake, args, admin=None):
        f = fetch.Fetcher(TokenStub(), request=fake, log=lambda *a: None, sleep=lambda s: None, admin=admin)
        out = io.StringIO()
        with redirect_stdout(out), mock.patch("sys.stderr", new=io.StringIO()) as err:
            rc = cli.cmd_fetch(args + ["-o", os.path.join(self.tmp, "out")], fetcher=f)
        return rc, out.getvalue(), err.getvalue(), f

    def test_full_run(self):
        fake = FakeFabric()
        rc, out, err, _ = self.run_fetch(fake, [])
        self.assertEqual(rc, 0, err)
        base = os.path.join(self.tmp, "out")
        self.assertEqual(sorted(os.listdir(base)), ["befunde.csv", "befunde.json", "bericht.html", "rohdaten", "zusammenfassung.md"])
        self.assertEqual(sorted(os.listdir(os.path.join(base, "rohdaten"))), ["abfragen.json", "scan.json"])
        self.assertIn("Notebook Export", out)
        self.assertIn("Monitoring KQL database: 8 verschiedene Abfragen", out)
        self.assertGreaterEqual(fake.polls, 2)                                       # Scan-Status abgewartet
        with open(os.path.join(base, "bericht.html"), encoding="utf-8") as fh:
            html = fh.read()
        self.assertIn("Modelle im Tenant", html)
        self.assertIn("Der Client", html)

    def test_workspace_by_name_and_manual_monitoring(self):
        fake = FakeFabric()
        rc, out, err, _ = self.run_fetch(fake, ["-w", "Finance", "--monitoring", f"{CLUSTER}=Monitoring KQL database"])
        self.assertEqual(rc, 0, err)
        urls = [u for _, u, _ in fake.calls]
        self.assertIn(f"{fetch.POWERBI}/admin/groups", urls)
        self.assertNotIn(f"{fetch.FABRIC}/workspaces/{WS}/kqlDatabases", urls)    # keine Suche nötig

    def test_unknown_workspace(self):
        rc, _, err, _ = self.run_fetch(FakeFabric(), ["-w", "Gibtsnicht"])
        self.assertEqual(rc, 2)
        self.assertIn("nicht gefunden", err)

    def test_admin_only_still_fails_without_rights(self):
        rc, _, err, _ = self.run_fetch(FakeFabric(admin=False), [], admin=True)
        self.assertEqual(rc, 2)
        self.assertIn("Fabric-Administrator", err)

    def _scan_json(self):
        with open(os.path.join(self.tmp, "out", "rohdaten", "scan.json"), encoding="utf-8") as fh:
            return json.load(fh)

    def test_no_admin_falls_back_to_workspace_mode(self):
        fake = FakeFabric(admin=False)
        rc, out, err, f = self.run_fetch(fake, [])
        self.assertEqual(rc, 0, err)
        self.assertEqual(f.mode, "workspace")
        self.assertIn("2 · Modelle (Workspace-Modus, getDefinition)", out)
        self.assertIn("Ohne Fabric-Admin-Rechte geprüft", out)
        self.assertIn("Monitoring KQL database: 8 verschiedene Abfragen", out)
        scan = self._scan_json()[0]
        self.assertEqual(scan["source"], "getDefinition")
        self.assertEqual([w["name"] for w in scan["workspaces"]], ["Finance"])        # kein persönlicher Workspace
        orig = {d["id"]: d for w in fake.scan["workspaces"] for d in w["datasets"]}
        for ds in scan["workspaces"][0]["datasets"]:
            want = orig[ds["id"]]
            self.assertEqual({t["name"] for t in ds["tables"]}, {t["name"] for t in want["tables"]})
            self.assertEqual(sum(len(t["measures"]) for t in ds["tables"]),
                             sum(len(t.get("measures", [])) for t in want["tables"]))
            self.assertEqual(len(ds.get("roles", [])), len(want.get("roles", [])))
        with open(os.path.join(self.tmp, "out", "befunde.json"), encoding="utf-8") as fh:
            self.assertEqual(json.load(fh)["scope"], "Workspaces")

    def test_no_admin_findings_match_admin_run(self):
        """Gleiche Modelle über getDefinition müssen dieselben Befunde ergeben wie über die Scanner-API."""
        def findings():
            with open(os.path.join(self.tmp, "out", "befunde.json"), encoding="utf-8") as fh:
                return sorted((r["client"], r["rule"], r["severity"]) for r in json.load(fh)["findings"])
        self.run_fetch(FakeFabric(), [])
        admin = findings()
        self.run_fetch(FakeFabric(admin=False), [])
        self.assertEqual(findings(), admin)

    def test_get_definition_long_running(self):
        fake = FakeFabric(admin=False, lro=True)
        rc, _, err, _ = self.run_fetch(fake, ["-w", "Finance"])
        self.assertEqual(rc, 0, err)
        urls = [u for _, u, _ in fake.calls]
        self.assertIn(f"{fetch.FABRIC}/operations/op-1/result", urls)
        self.assertTrue(all(d.get("tables") for d in self._scan_json()[0]["workspaces"][0]["datasets"]))

    def test_force_without_admin(self):
        fake = FakeFabric()
        rc, out, err, _ = self.run_fetch(fake, ["--ohne-admin"])
        self.assertEqual(rc, 0, err)
        self.assertFalse(any("/admin/" in u for _, u, _ in fake.calls))
        self.assertIn("Workspace-Modus", out)

    def test_model_without_access_is_reported(self):
        fake = FakeFabric(admin=False, denied_models=["66666666-7777-8888-9999-000000000000"])
        rc, out, err, _ = self.run_fetch(fake, [])
        self.assertEqual(rc, 0, err)
        ds = {d["name"]: d for d in self._scan_json()[0]["workspaces"][0]["datasets"]}
        self.assertIn("403", ds["Vertrieb"]["schemaRetrievalError"])
        self.assertTrue(ds["Finanzmodell"]["tables"])
        self.assertIn("1 Modell(e) ließen sich nicht lesen", out)

    def test_unknown_workspace_without_admin(self):
        rc, _, err, _ = self.run_fetch(FakeFabric(admin=False), ["-w", "Gibtsnicht"])
        self.assertEqual(rc, 2)
        self.assertIn("kein Zugriff", err)

    def test_no_monitoring_found(self):
        fake = FakeFabric()
        orig = fake.__call__

        def no_kql(method, url, token, body=None):
            if url.endswith("/kqlDatabases"):
                return 200, {"value": []}
            return orig(method, url, token, body)
        rc, out, err, _ = self.run_fetch(no_kql, [])
        self.assertEqual(rc, 0, err)
        self.assertIn("Kein Monitoring-Eventhouse gefunden", out)
        self.assertIn("nur Modell-Übersicht", out)

    def test_network_error_is_readable(self):
        import urllib.error
        with mock.patch("urllib.request.urlopen", side_effect=urllib.error.URLError("Tunnel connection failed")):
            with self.assertRaises(fetch.FetchError) as cm:
                fetch.http("GET", fetch.FABRIC + "/workspaces", "t")
        self.assertIn("Keine Verbindung zu api.fabric.microsoft.com", str(cm.exception))

    def test_http_202_null_body_keeps_operation_headers(self):
        """Echter Fabric-Fall: getDefinition antwortet 202 mit Body „null“, die Operation steht nur im Header."""
        resp = mock.MagicMock()
        resp.__enter__.return_value.status = 202
        resp.__enter__.return_value.read.return_value = b"null"
        resp.__enter__.return_value.headers = {"x-ms-operation-id": "op-9", "Location": f"{fetch.FABRIC}/operations/op-9",
                                               "Retry-After": "3"}
        with mock.patch("urllib.request.urlopen", return_value=resp):
            status, data = fetch.http("POST", fetch.FABRIC + "/x/getDefinition", "t")
        self.assertEqual(status, 202)
        self.assertEqual((data["_operation"], data["_retry"]), ("op-9", "3"))

    def test_kusto_rows(self):
        rows = fetch.kusto_rows({"Tables": [{"Columns": [{"ColumnName": "a"}, {"ColumnName": "b"}], "Rows": [[1, 2]]}]})
        self.assertEqual(rows, [{"a": 1, "b": 2}])


class AuthOrder(unittest.TestCase):
    def test_service_principal_first(self):
        env = {"AZURE_TENANT_ID": "t", "AZURE_CLIENT_ID": "c", "AZURE_CLIENT_SECRET": "s"}
        resp = mock.MagicMock()
        resp.__enter__.return_value.read.return_value = b'{"access_token": "sp-token"}'
        with mock.patch.dict(os.environ, env), mock.patch("urllib.request.urlopen", return_value=resp) as uo:
            a = fetch.Auth()
            self.assertEqual(a.token(fetch.RES_PBI), "sp-token")
            self.assertEqual(a.method, "Service Principal")
            sent = uo.call_args[0][0]
            self.assertIn("login.microsoftonline.com/t/", sent.full_url)
            self.assertIn(b"scope=https%3A%2F%2Fanalysis.windows.net%2Fpowerbi%2Fapi%2F.default", sent.data)

    def test_azure_cli(self):
        clean = {k: v for k, v in os.environ.items() if not k.startswith("AZURE_")}
        done = mock.MagicMock(returncode=0, stdout="cli-token\n", stderr="")
        with mock.patch.dict(os.environ, clean, clear=True), mock.patch("shutil.which", return_value="/usr/bin/az"), \
                mock.patch("subprocess.run", return_value=done) as run:
            a = fetch.Auth()
            self.assertEqual(a.token(fetch.RES_FABRIC), "cli-token")
            self.assertEqual(a.method, "Azure CLI")
            self.assertIn("--resource", run.call_args[0][0])

    def test_no_login(self):
        clean = {k: v for k, v in os.environ.items() if not k.startswith("AZURE_")}
        with mock.patch.dict(os.environ, clean, clear=True), mock.patch("shutil.which", return_value=None), \
                mock.patch.dict(sys.modules, {"azure.identity": None}):
            with self.assertRaises(fetch.FetchError) as cm:
                fetch.Auth().token(fetch.RES_PBI)
            self.assertIn("az login", str(cm.exception))


if __name__ == "__main__":
    unittest.main()
