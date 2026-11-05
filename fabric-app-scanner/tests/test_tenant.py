import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fabscan import querylog, report, scanapi, tenant  # noqa: E402

FIX = os.path.join(os.path.dirname(__file__), "fixtures", "tenant")


def run(include_reports=False):
    models = scanapi.load_scan(os.path.join(FIX, "scan_result.json"))
    entries = querylog.load_log(os.path.join(FIX, "semantic_model_logs.jsonl"))
    apps = tenant.scan_tenant(models, querylog.clients(entries, include_reports=include_reports))
    return models, {a.name: a for a in apps}


class Tenant(unittest.TestCase):
    def test_scan_result(self):
        models, _ = run()
        fin = next(m for m in models if m.name == "Finanzmodell")
        self.assertEqual(fin.workspace, "Finance")
        self.assertTrue(fin.table("Sales").columns["gehalt"].hidden)
        self.assertEqual(fin.measure("marge").expr, "DIVIDE([DB], [Umsatz])")
        vt = next(m for m in models if m.name == "Vertrieb")
        self.assertIn("Region", vt.roles)

    def test_log_grouping(self):
        _, apps = run()
        self.assertNotIn("PowerBI", apps)                       # Berichte ausgenommen
        self.assertEqual(apps["Finance Cockpit"].meta["runs"], 30)
        self.assertEqual(apps["Finance Cockpit"].meta["distinct"], 1)
        self.assertEqual(apps["Sales App"].meta["runs"], 5)     # QueryBegin nicht doppelt
        self.assertEqual(apps["Microsoft Office"].meta["mdx"], 1)
        _, with_reports = run(include_reports=True)
        self.assertIn("PowerBI", with_reports)

    def test_findings(self):
        _, apps = run()
        rules = lambda n: {(f.rule, f.severity) for f in apps[n].findings}  # noqa: E731
        self.assertNotIn("warn", {s for _, s in rules("Finance Cockpit")})
        self.assertIn(("CALC-RAW", "warn"), rules("Sales App"))
        self.assertIn(("DEV-TRANSFORM", "warn"), rules("Sales App"))
        self.assertIn(("SEC-AUTH", "fail"), rules("Notebook Export"))
        self.assertIn(("QRY-SHADOW", "fail"), rules("Notebook Export"))
        self.assertIn(("SEC-HIDDEN", "warn"), rules("Notebook Export"))  # Gehalt
        self.assertEqual(apps["Pipeline App"].status(), "ok")             # Modell mit RLS, Measure genutzt
        self.assertEqual(apps["Finance Cockpit"].bindings[0].measures_used, {"Umsatz", "Marge"})

    def test_report(self):
        models, apps = run()
        info = {"models": tenant.model_rows(models, list(apps.values())), "scope": "Tenant"}
        h = report.to_html(list(apps.values()), "", "Test", info)
        self.assertIn("Modelle im Tenant", h)
        self.assertIn("Der Client", h)
        self.assertIn("von 5 Clients", h)
        self.assertNotIn("Die App greift", h)

    def test_service_principal(self):
        self.assertTrue(querylog.is_service_principal("app@contoso.onmicrosoft.com"))
        self.assertTrue(querylog.is_service_principal("1c2d3e4f-0000-1111-2222-333344445555"))
        self.assertFalse(querylog.is_service_principal("anna@contoso.com"))

    def test_mdx(self):
        self.assertTrue(querylog.is_mdx("SELECT {[Measures].[X]} ON 0 FROM [Model]"))
        self.assertFalse(querylog.is_mdx("// Kommentar\nEVALUATE ROW(\"a\", 1)"))


if __name__ == "__main__":
    unittest.main()
