"""Führt das Fabric-Notebook lokal aus, mit Attrappen für sempy, Spark und notebookutils."""
import json
import os
import shutil
import sys
import tempfile
import types
import unittest
from collections import defaultdict

HERE = os.path.dirname(__file__)
FIX = os.path.join(HERE, "fixtures", "tenant")
sys.path.insert(0, os.path.join(HERE, ".."))
sys.path.insert(0, HERE)

from fabscan import notebook as build_notebook  # noqa: E402
from test_fetch import FakeFabric  # noqa: E402

PKG = "/tmp/fabscan_pkg"


def _under(path: str, root: str) -> bool:
    """Plattformfest: unter Windows wird aus /tmp/... ein Pfad wie C:\\tmp\\..."""
    norm = lambda p: os.path.normcase(os.path.abspath(p))
    return norm(path).startswith(norm(root))


class _Row(dict):
    def asDict(self):
        return dict(self)


def _kql_rows():
    """Nachbau der KQL-Zusammenfassung aus dem Notebook über die Beispiel-Logs."""
    groups = defaultdict(list)
    with open(os.path.join(FIX, "semantic_model_logs.jsonl"), encoding="utf-8") as fh:
        for line in fh:
            r = json.loads(line)
            if r["OperationName"] != "QueryEnd":
                continue
            is_report = "ReportId" in (r.get("ApplicationContext") or "")
            if is_report:
                continue
            key = (r["WorkspaceId"], r["WorkspaceName"], r["ItemId"], r["ItemName"], r["ApplicationName"],
                   r["ExecutingUser"], r["EventText"], is_report)
            groups[key].append(r)
    out = []
    for k, rs in groups.items():
        out.append(_Row(WorkspaceId=k[0], WorkspaceName=k[1], ItemId=k[2], ItemName=k[3], ApplicationName=k[4],
                        ExecutingUser=k[5], EventText=k[6], IsReport=k[7], Count=len(rs),
                        FirstSeen=min(r["Timestamp"] for r in rs), LastSeen=max(r["Timestamp"] for r in rs),
                        DurationMs=sum(r["DurationMs"] for r in rs), OperationName="QueryEnd"))
    return out


class _Reader:
    def __init__(self, log):
        self.opts, self.log = {}, log

    def format(self, f):
        self.log.append(("format", f))
        return self

    def option(self, k, v):
        self.opts[k] = v
        return self

    def load(self):
        self.log.append(("query", self.opts.get("kustoQuery", "")))
        return types.SimpleNamespace(collect=_kql_rows)


class _Writer:
    def __init__(self, log):
        self.log = log

    def mode(self, m):
        return self

    def saveAsTable(self, name):
        self.log.append(("table", name))


class Notebook(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp(prefix="fabscan-nb-")
        out = build_notebook.build(os.path.join(self.tmp, "fabscan_tenant.ipynb"))
        with open(out, encoding="utf-8") as fh:
            self.nb = json.load(fh)

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)
        sys.path[:] = [p for p in sys.path if p != "/tmp/fabscan_pkg"]

    def test_structure(self):
        cells = self.nb["cells"]
        self.assertEqual(self.nb["metadata"]["kernel_info"]["name"], "synapse_pyspark")
        self.assertIn("parameters", cells[1]["metadata"].get("tags", []))
        self.assertTrue(cells[2]["metadata"]["jupyter"]["source_hidden"])

    def _run(self, admin_ok=True, monitoring=True):
        log = []
        with open(os.path.join(FIX, "scan_result.json"), encoding="utf-8") as fh:
            scan = json.load(fh)
        admin = types.ModuleType("sempy.fabric.admin")

        def list_workspaces(**kw):
            if not admin_ok:
                raise RuntimeError("FabricHTTPException: 403 Forbidden on /v1/admin/workspaces")
            return {"Id": [w["id"] for w in scan["workspaces"]], "Name": [w["name"] for w in scan["workspaces"]]}
        admin.list_workspaces = list_workspaces
        admin.scan_workspaces = lambda **kw: (log.append(("scan", kw)), scan)[1]
        fake_pd = types.ModuleType("pandas")
        fake_pd.DataFrame = lambda rows: rows
        mods = {"sempy": types.ModuleType("sempy"), "sempy.fabric": types.ModuleType("sempy.fabric"),
                "sempy.fabric.admin": admin, "pandas": fake_pd}
        mods["sempy"].fabric = mods["sempy.fabric"]
        mods["sempy.fabric"].admin = admin
        saved = {k: sys.modules.get(k) for k in mods}
        sys.modules.update(mods)
        kept = {k: v for k, v in sys.modules.items() if k == "fabscan" or k.startswith("fabscan.")}
        for k in kept:
            del sys.modules[k]  # das eingebettete Paket laden, nicht das aus dem Repo
        shown = []
        spark = types.SimpleNamespace(read=_Reader(log),
                                      createDataFrame=lambda rows: types.SimpleNamespace(write=_Writer(log)))
        fake = FakeFabric(admin=False)
        ns = {"spark": spark, "displayHTML": shown.append, "FABSCAN_HTTP": fake,
              "notebookutils": types.SimpleNamespace(credentials=types.SimpleNamespace(getToken=lambda uri: "token"))}
        try:
            for cell in self.nb["cells"]:
                if cell["cell_type"] != "code":
                    continue
                src = "".join(cell["source"])
                if "parameters" in cell["metadata"].get("tags", []):
                    src += f"\nOUTPUT_DIR = {self.tmp!r}\n"
                    if monitoring:
                        src += "MONITORING = [{'cluster': 'https://x.kusto.fabric.microsoft.com', 'database': 'Monitoring'}]\n"
                exec(compile(src, "notebook", "exec"), ns)
        finally:
            for k in [k for k in sys.modules if k == "fabscan" or k.startswith("fabscan.")]:
                del sys.modules[k]
            sys.modules.update(kept)
            for k, v in saved.items():
                if v is None:
                    sys.modules.pop(k, None)
                else:
                    sys.modules[k] = v
        return ns, log, shown, fake

    def test_runs_end_to_end(self):
        ns, log, shown, fake = self._run()
        self.assertTrue(_under(ns["fabscan"].__file__, PKG))
        self.assertEqual(ns["SCOPE"], "Tenant")
        self.assertFalse(fake.calls)                       # Admin-Weg: keine Aufrufe der normalen API
        self._assert_report(ns, log, shown)

    def test_without_admin_uses_own_workspaces(self):
        ns, log, shown, fake = self._run(admin_ok=False, monitoring=False)
        self.assertEqual(ns["SCOPE"], "Workspaces")
        self.assertEqual(ns["MONITORING"], [{"cluster": "https://trd-abc.z3.kusto.fabric.microsoft.com",
                                             "database": "Monitoring KQL database"}])   # selbst gefunden
        self.assertTrue(any("getDefinition" in u for _, u, _ in fake.calls))
        self.assertIn("eigenem Zugriff", ns["REPORT_TITLE"])
        self._assert_report(ns, log, shown)

    def _assert_report(self, ns, log, shown):
        self.assertEqual(len(ns["models"]), 2)
        self.assertIn("SemanticModelLogs", dict(log)["query"])
        names = {a.name for a in ns["apps"]}
        self.assertEqual(names, {"Finance Cockpit", "Sales App", "Notebook Export", "Pipeline App", "Microsoft Office"})
        self.assertEqual(sum(a.meta["runs"] for a in ns["apps"] if a.name == "Finance Cockpit"), 30)
        self.assertTrue(shown and "Modelle im Tenant" in shown[0])
        self.assertIn(("table", "fabscan_findings"), log)
        run_dir = [d for d in os.listdir(self.tmp) if os.path.isdir(os.path.join(self.tmp, d))][0]
        self.assertEqual(sorted(os.listdir(os.path.join(self.tmp, run_dir))),
                         ["befunde.csv", "befunde.json", "bericht.html", "zusammenfassung.md"])


if __name__ == "__main__":
    unittest.main()
