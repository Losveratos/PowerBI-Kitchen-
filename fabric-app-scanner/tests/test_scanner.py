import os
import shutil
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fabscan import checks, dax, rayfin, report, tmdl  # noqa: E402

# Die Testdaten liegen ohne .platform und ohne Endung .SemanticModel im Repo, damit die
# Fabric-Git-Integration sie nicht als echtes Modell in den Workspace übernimmt.
# Für die Tests wird eine Kopie mit den richtigen Namen angelegt.
_TMP = tempfile.mkdtemp(prefix="fabscan-")
ROOT = os.path.join(_TMP, "repo")
shutil.copytree(os.path.join(os.path.dirname(__file__), "fixtures", "repo"), ROOT)
os.rename(os.path.join(ROOT, "Demo_SemanticModel"), os.path.join(ROOT, "Demo.SemanticModel"))
os.rename(os.path.join(ROOT, "Demo.SemanticModel", "_platform"), os.path.join(ROOT, "Demo.SemanticModel", ".platform"))


def tearDownModule():
    shutil.rmtree(_TMP, ignore_errors=True)


def scan(name):
    models = tmdl.find_models(ROOT)
    return checks.scan_app(os.path.join(ROOT, "apps", name), ROOT, models, {})


def rules(app):
    return {f.rule: f for f in app.findings}


class Dax(unittest.TestCase):
    def test_mask_keeps_positions(self):
        t = 'EVALUATE // Kommentar mit [Feld]\nROW("a", "x[y]")'
        m = dax.mask(t)
        self.assertEqual(len(m), len(t))
        self.assertNotIn("[Feld]", m)
        self.assertNotIn("x[y]", m)

    def test_refs_and_order_by(self):
        q = dax.parse("EVALUATE SELECTCOLUMNS(T, \"s\", 'Dim A'[B C])\nORDER BY [s]", "x")
        self.assertIn(("Dim A", "B C"), [(r.table, r.name) for r in q.refs])
        self.assertIn((None, "s"), [(r.table, r.name) for r in q.refs])
        self.assertNotIn("BY", [r.table for r in q.refs])

    def test_projection_kinds(self):
        q = dax.parse('EVALUATE ROW("c", 1, "a", T[x], "m", [M], "r", RELATED(U[y]), "k", T[x] * 2)', "x")
        kinds = {p.alias: p.kind for p in q.projections}
        self.assertEqual(kinds, {"c": "constant", "a": "column", "m": "measure", "r": "column", "k": "computed"})

    def test_define_and_literals(self):
        q = dax.parse('DEFINE MEASURE T[M] = 1\nVAR v = 2\nEVALUATE CALCULATETABLE(T, T[a] = "x", TREATAS({2026}, D[J]))', "x")
        self.assertEqual([(d.kind, d.table, d.name) for d in q.defines][0], ("MEASURE", "T", "M"))
        self.assertEqual(len(dax.literal_comparisons(q)), 2)

    def test_treatas_with_variable_is_not_literal(self):
        q = dax.parse("EVALUATE VAR y = 2026 RETURN CALCULATETABLE(T, TREATAS({ y - 1 }, D[J]))", "x")
        self.assertEqual(dax.literal_comparisons(q), [])


class Model(unittest.TestCase):
    def test_tmdl(self):
        m = tmdl.find_models(ROOT)[0]
        s = m.table("sales")
        self.assertEqual(set(s.measures), {"umsatz", "marge", "db"})
        self.assertIn("DIVIDE", s.measures["marge"].expr)
        self.assertEqual(s.measures["marge"].folder, "KPI")
        self.assertTrue(s.columns["cost"].hidden)
        self.assertIn("Leser", m.roles)
        self.assertIsNotNone(m.table("Dim Datum"))

    def test_item_to_logical(self):
        self.assertEqual(tmdl.item_to_logical("56f44b5a-9b2f-4540-86aa-a400d0c2a7c2"), "d0c2a7c2-a400-86aa-4540-9b2f56f44b5a")


class Rayfin(unittest.TestCase):
    def test_yaml(self):
        r = rayfin.load(os.path.join(ROOT, "apps", "bad-app"))
        self.assertEqual(r.connectors[0].auth, "application")
        self.assertEqual(r.get("services", "auth", "allowedRedirectUris"), ["http://localhost:5173"])
        self.assertIs(r.get("services", "auth", "password", "enabled"), False)


class Apps(unittest.TestCase):
    def test_good_app_is_clean(self):
        a = scan("good-app")
        self.assertEqual(a.bindings[0].model.name, "Demo")
        self.assertIn("logicalId", a.bindings[0].method)
        self.assertEqual(a.bindings[0].coverage, (4, 4))
        self.assertEqual([f for f in a.findings if f.severity in ("fail", "warn")], [])

    def test_bad_app_findings(self):
        a = scan("bad-app")
        r = rules(a)
        expect = {"SEC-AUTH": "fail", "QRY-SHADOW": "fail", "CALC-DEFINE": "warn", "LIN-MISSING-FIELD": "fail",
                  "LIN-MISSING-TABLE": "fail", "QRY-OVERRIDE": "warn", "QRY-HARDCODED": "warn", "DEV-TRANSFORM": "warn",
                  "CALC-RAW": "warn", "CALC-TS": "warn", "SEC-SECRET": "fail", "SEC-STORAGE": "warn", "SEC-EXTERNAL": "warn",
                  "SEC-CLIENT-RLS": "warn", "SEC-CDN": "warn", "QRY-REPLACE": "warn", "DEV-NAME": "warn"}
        for rule, sev in expect.items():
            self.assertIn(rule, r, rule)
            self.assertEqual(r[rule].severity, sev, rule)
        hidden = [f for f in a.findings if f.rule == "SEC-HIDDEN"]
        self.assertEqual({f.severity for f in hidden}, {"warn", "info"})  # Gehalt = vertraulich, Cost = Sortier-/Hilfsfeld
        self.assertEqual(a.status(), "fail")

    def test_reports(self):
        apps = [scan("good-app"), scan("bad-app")]
        h = report.to_html(apps, ROOT)
        self.assertIn("bad-app", h)
        self.assertNotIn("demo-geheimnis-1234567", h)  # Geheimnisse nie im Bericht
        self.assertIn('"rule": "QRY-SHADOW"', report.to_json(apps, ROOT))
        self.assertIn("✗", report.to_text(apps))


if __name__ == "__main__":
    unittest.main()
