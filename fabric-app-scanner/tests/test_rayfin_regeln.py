"""0.6.3: Rayfin-Regeln. Anonyme Datenrolle, Build für alle Nutzer bei delegiertem Modell-Connector,
Besitzer-Identität bei application-Connectoren."""
import json
import os
import shutil
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, ".."))

from fabscan import checks, cli, report, tmdl, tsscan  # noqa: E402
from test_cli import fixture_repo  # noqa: E402


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(text)


def scan(root, name):
    return checks.scan_app(os.path.join(root, "apps", name), root, tmdl.find_models(root), {})


def rules(app, rule):
    return [f for f in app.findings if f.rule == rule]


class EntityRoles(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp(prefix="fabscan-roles-")

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_forms(self):
        write(os.path.join(self.tmp, "rayfin", "connectors", "inv", "Order.ts"),
              "// @role('anonymous', 'delete') nur Kommentar\n"
              "@role('anonymous', ['read', \"create\"], { include: ['id'] })\n@entity()\n"
              "export class Order extends Source({ schema: 'dbo', table: 'Order' }) {}\n")
        write(os.path.join(self.tmp, "packages", "data", "src", "Post.ts"),
              "@entity()\n@role(\"anonymous\", '*')\n"
              "@role('authenticated', ['create'], { policy: (c, i) => c.sub.eq(i.createdBy) })\nexport class BlogPost {}\n")
        write(os.path.join(self.tmp, "node_modules", "x", "A.ts"), "@role('anonymous', 'read')\nexport class A {}\n")
        got = {(r["entity"], r["role"]): r for r in tsscan.entity_roles(self.tmp, self.tmp)}
        self.assertEqual(set(got), {("Order", "anonymous"), ("BlogPost", "anonymous"), ("BlogPost", "authenticated")})
        o = got[("Order", "anonymous")]
        self.assertEqual((o["actions"], o["connector"], o["fields"], o["line"]), (["read", "create"], "inv", True, 2))
        b = got[("BlogPost", "anonymous")]
        self.assertEqual((b["actions"], b["connector"], b["fields"]), (["*"], "", False))
        self.assertEqual(got[("BlogPost", "authenticated")]["actions"], ["create"])


class RayfinRules(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp(prefix="fabscan-063-")
        self.root = fixture_repo(self.tmp)
        self.good = os.path.join(self.root, "apps", "good-app")

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_anonymous_read_on_app_data_is_warn(self):
        write(os.path.join(self.good, "packages", "data", "src", "Termin.ts"),
              "@entity()\n@role('anonymous', 'read')\nexport class Termin {}\n")
        f = rules(scan(self.root, "good-app"), "SEC-ANON")
        self.assertEqual([(x.severity, x.title) for x in f], [("warn", "App-Daten ohne Anmeldung erreichbar (anonyme Rolle)")])
        self.assertIn("Termin", f[0].detail)
        self.assertIn("(alle Felder)", f[0].detail)

    def test_anonymous_write_has_own_title(self):
        write(os.path.join(self.good, "packages", "data", "src", "Todo.ts"),
              "@entity()\n@role('anonymous', ['create', 'read', 'update'])\nexport class Todo {}\n")
        f = rules(scan(self.root, "good-app"), "SEC-ANON")
        self.assertEqual([(x.severity, x.title) for x in f], [("warn", "App-Daten ohne Anmeldung änderbar (anonyme Rolle)")])
        self.assertIn("ändern oder löschen", report.plain(f[0])["head"])

    def test_anonymous_on_connector_entity_is_fail(self):
        write(os.path.join(self.good, "rayfin", "connectors", "demo", "Sales.ts"),
              "@role('anonymous', ['read'])\n@entity()\nexport class Sales extends Source({ table: 'Sales' }) {}\n")
        f = rules(scan(self.root, "good-app"), "SEC-ANON")
        self.assertEqual([x.severity for x in f], ["fail"])
        self.assertIn("Konnektor „demo“ (fabric-semanticmodel)", f[0].detail)
        self.assertIn("Fabric", report.plain(f[0])["head"])
        rc = cli.main([self.root, "-o", os.path.join(self.tmp, "o"), "-q", "--app", "good-app", "--fail-on", "fail"])
        self.assertEqual(rc, 1)

    def test_authenticated_role_is_no_finding(self):
        write(os.path.join(self.good, "packages", "data", "src", "Notiz.ts"),
              "@entity()\n@role('authenticated', ['read'])\nexport class Notiz {}\n")
        self.assertEqual(rules(scan(self.root, "good-app"), "SEC-ANON"), [])

    def test_delegated_model_connector_needs_build(self):
        good = rules(scan(self.root, "good-app"), "SEC-BUILD")
        self.assertEqual([x.severity for x in good], ["info"])
        self.assertIn("Konnektor demo", good[0].occurrences[0][2])
        self.assertEqual(rules(scan(self.root, "bad-app"), "SEC-BUILD"), [], "application: SEC-AUTH, kein Build-Hinweis")

    def test_application_connector_names_the_owner(self):
        f = rules(scan(self.root, "bad-app"), "SEC-AUTH")[0]
        self.assertIn("Besitzer des App-Items", f.detail)
        self.assertIn("nur delegierten Zugriff", f.detail)
        self.assertIn("Besitzer des App-Items", report.plain(f)["why"])

    def test_build_hint_does_not_change_the_traffic_light(self):
        out = os.path.join(self.tmp, "o")
        self.assertEqual(cli.main([self.root, "-o", out, "-q", "--app", "good-app"]), 0)
        with open(os.path.join(out, "befunde.json"), encoding="utf-8") as fh:
            app = json.load(fh)["apps"][0]
        self.assertIn("SEC-BUILD", {f["rule"] for f in app["findings"]})
        self.assertNotIn("SEC-BUILD", {f["rule"] for f in app["findings"] if f["severity"] in ("fail", "warn")})
        self.assertFalse(any("Build" in line for _, line in report.overall([scan(self.root, "good-app")])))


if __name__ == "__main__":
    unittest.main()
