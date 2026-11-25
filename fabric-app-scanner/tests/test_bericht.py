"""0.7.0: Ampel je Thema, Maßnahmenliste, Trend gegen den Vorlauf, Verlauf, Pseudonyme (Bewertung 5.3)."""
import csv
import json
import os
import shutil
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, ".."))

from fabscan import ausnahmen, checks, cli, export, querylog, scanapi, tenant, themen, tmdl, verlauf  # noqa: E402
from test_cli import fixture_repo  # noqa: E402

FIX = os.path.join(HERE, "fixtures", "tenant")


def repo_apps(root, models=None):
    models = tmdl.find_models(root) if models is None else models
    apps = [checks.scan_app(d, root, models, {}) for d in checks.find_apps(root)]
    ausnahmen.apply(apps, [])
    return {a.name: a for a in apps}


def log_apps():
    models = scanapi.load_scan(os.path.join(FIX, "scan_result.json"))
    apps = tenant.scan_tenant(models, querylog.clients(querylog.load_log(os.path.join(FIX, "semantic_model_logs.jsonl"))))
    ausnahmen.apply(apps, [])
    return {a.name: a for a in apps}


def read(out, name):
    with open(os.path.join(out, name), encoding="utf-8") as fh:
        return fh.read()


def states(a):
    return {k: v[0] for k, v in themen.theme_status(a).items()}


def load(out, name="befunde.json"):
    with open(os.path.join(out, name), encoding="utf-8") as fh:
        return json.load(fh)


class Themes(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp(prefix="fabscan-themen-")
        self.root = fixture_repo(self.tmp)

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_repo_states(self):
        apps = repo_apps(self.root)
        self.assertEqual(states(apps["bad-app"]), {"zahl": "rot", "rls": "rot", "weg": "rot", "abfluss": "rot", "zuordnung": "gruen"})
        self.assertEqual(set(states(apps["good-app"]).values()), {"gruen"}, "SEC-BUILD ist nur Hinweis")

    def test_no_model_is_grey_not_green(self):
        apps = repo_apps(self.root, models=[])
        st = themen.theme_status(apps["good-app"])
        self.assertEqual((st["zahl"][0], st["weg"][0], st["rls"][0]), ("grau", "grau", "grau"))
        self.assertIn("kein Modell zugeordnet", st["weg"][1])
        self.assertEqual(st["abfluss"][0], "gruen")

    def test_red_wins_over_grey(self):
        apps = repo_apps(self.root, models=[])
        self.assertEqual(states(apps["bad-app"])["abfluss"], "rot")
        self.assertEqual(states(apps["bad-app"])["rls"], "rot", "App-Identität am Modell bleibt rot, auch ohne Modell")

    def test_log_clients(self):
        apps = log_apps()
        for a in apps.values():
            st = themen.theme_status(a)
            self.assertEqual(st["abfluss"][0], "grau", a.name)       # keine Ergebnismengen im Log
            self.assertEqual(st["zuordnung"][0], "gelb", a.name)     # Name kommt vom Client
        self.assertEqual(states(apps["Microsoft Office"])["zahl"], "grau")   # nur MDX

    def test_accepted_findings_do_not_color(self):
        apps = repo_apps(self.root)
        bad = apps["bad-app"]
        rules = [{"regel": r, "begruendung": "Test", "_nr": i} for i, r in
                 enumerate(sorted({f.rule for f in bad.findings if themen.theme_of(f) == "abfluss"}))]
        ausnahmen.apply([bad], rules)
        self.assertEqual(states(bad)["abfluss"], "gruen")


class Actions(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp(prefix="fabscan-massn-")
        self.root = fixture_repo(self.tmp)

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_bundled_across_apps_and_sorted(self):
        # zweite App mit derselben fremden Schrift
        src = os.path.join(self.root, "apps", "bad-app", "packages", "frontend", "index.html")
        dst = os.path.join(self.root, "apps", "good-app", "packages", "frontend", "index.html")
        shutil.copy(src, dst)
        acts = themen.actions(list(repo_apps(self.root).values()))
        cdn = [g for g in acts if g["rule"] == "SEC-CDN"]
        self.assertEqual(len(cdn), 1)
        self.assertEqual(sorted(cdn[0]["clients"]), ["bad-app", "good-app"])
        self.assertEqual([g["color"] for g in acts], sorted((g["color"] for g in acts), key=lambda c: c != "rot"))
        self.assertTrue(all(g["severity"] in ("fail", "warn") for g in acts))
        self.assertEqual({g["status"] for g in acts}, {"offen"}, "ohne Vorlauf kein „neu“")

    def test_owner_and_effort(self):
        acts = {g["rule"]: g for g in themen.actions(list(repo_apps(self.root).values()))}
        self.assertEqual(acts["SEC-HIDDEN"]["who"], "Modell-Verantwortliche")
        self.assertEqual(acts["SEC-HIDDEN"]["model"], "Demo")
        self.assertEqual(acts["SEC-CDN"]["who"], "App-Team")
        self.assertEqual(acts["SEC-SECRET"]["effort"], "klein")

    def test_log_owner_names_workspace(self):
        acts = themen.actions(list(log_apps().values()))
        self.assertTrue(acts)
        self.assertTrue(all("Finance" in g["who"] or "(" in g["who"] for g in acts))


class Trend(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp(prefix="fabscan-trend-")
        self.root = fixture_repo(self.tmp)
        self.out = os.path.join(self.tmp, "out")

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def run_scan(self, *extra):
        self.assertEqual(cli.main([self.root, "-o", self.out, "-q", *extra]), 0)
        return load(self.out)

    def test_first_run_has_no_trend(self):
        d = self.run_scan()
        self.assertEqual(d["schema_version"], 3)
        self.assertIsNone(d["trend"]["previous"])
        self.assertEqual({r["first_seen"] for r in d["findings"]}, {d["run_date"]})
        with open(os.path.join(self.out, "befunde.csv"), encoding="utf-8") as fh:
            self.assertIn("theme", next(csv.reader(fh)))
        self.assertEqual(len(load(self.out, "verlauf.json")["runs"]), 1)

    def test_second_run_compares(self):
        self.run_scan()
        first = load(self.out)
        # bad-app verliert die fremde Schrift (behoben), good-app bekommt sie (neu), neue App kommt dazu
        os.remove(os.path.join(self.root, "apps", "bad-app", "packages", "frontend", "index.html"))
        with open(os.path.join(self.root, "apps", "good-app", "packages", "frontend", "index.html"), "w", encoding="utf-8") as fh:
            fh.write('<link href="https://fonts.googleapis.com/css2?family=Inter" rel="stylesheet">\n')
        shutil.copytree(os.path.join(self.root, "apps", "good-app"), os.path.join(self.root, "apps", "third-app"))
        d = self.run_scan()
        t = d["trend"]
        self.assertEqual(t["previous"]["run_id"], first["run_id"])
        self.assertEqual(t["behoben"], 1)
        self.assertEqual(t["neu"], 2)                      # SEC-CDN in good-app und third-app
        self.assertEqual(t["neue_clients"], ["third-app"])
        self.assertGreater(t["unveraendert"], 5)
        rows = {(r["client"], r["rule"]): r for r in d["findings"]}
        self.assertEqual(rows[("bad-app", "SEC-SECRET")]["first_seen"], first["findings"][0]["run_date"])
        self.assertEqual(len(load(self.out, "verlauf.json")["runs"]), 2)
        html = read(self.out, "bericht.html")
        self.assertIn("Seit dem letzten Lauf", html)
        self.assertIn("<h2>Verlauf</h2>", html)
        md = read(self.out, "zusammenfassung.md")
        self.assertIn("Neu dabei: third-app", md)

    def test_vanished_app_is_not_fixed(self):
        self.run_scan()
        shutil.rmtree(os.path.join(self.root, "apps", "bad-app"))
        t = self.run_scan()["trend"]
        self.assertEqual(t["behoben"], 0)
        self.assertEqual(t["verschwundene_clients"], ["bad-app"])

    def test_accepted_is_counted_separately(self):
        self.run_scan()
        with open(os.path.join(self.root, ausnahmen.FILE_NAME), "w", encoding="utf-8") as fh:
            json.dump({"ausnahmen": [{"regel": "SEC-CDN", "begruendung": "Test"}]}, fh)
        t = self.run_scan()["trend"]
        self.assertEqual((t["behoben"], t["neu_akzeptiert"], t["akzeptiert"]), (0, 1, 1))

    def test_explicit_vorlauf_and_switch_off(self):
        self.run_scan()
        keep = os.path.join(self.tmp, "alt.json")
        shutil.copy(os.path.join(self.out, "befunde.json"), keep)
        shutil.rmtree(self.out)
        self.assertIsNotNone(self.run_scan("--vorlauf", keep)["trend"]["previous"])
        shutil.rmtree(self.out)
        d = self.run_scan("--kein-vorlauf")
        self.assertIsNone(d["trend"]["previous"])
        self.assertFalse(os.path.exists(os.path.join(self.out, "verlauf.json")))
        self.assertEqual(cli.main([self.root, "-o", self.out, "-q", "--vorlauf", os.path.join(self.tmp, "fehlt.json")]), 2)

    def test_latest_run_for_notebook(self):
        base = os.path.join(self.tmp, "nb")
        for d in ("2026-11-01", "2026-11-08", "2026-11-15"):
            os.makedirs(os.path.join(base, d))
            with open(os.path.join(base, d, "befunde.json"), "w", encoding="utf-8") as fh:
                json.dump({"findings": []}, fh)
        self.assertTrue(verlauf.latest_run(base).endswith("2026-11-15"))
        self.assertTrue(verlauf.latest_run(base, exclude=os.path.join(base, "2026-11-15")).endswith("2026-11-08"))
        self.assertEqual(verlauf.latest_run(os.path.join(self.tmp, "gibtsnicht")), "")


class Pseudonyms(unittest.TestCase):
    def test_kennung(self):
        self.assertEqual(querylog.kennung("6a1f0c3e-1111-2222-3333-444455556666"), "6a1f0c3e-1111-2222-3333-444455556666")
        self.assertEqual(querylog.kennung("app@contoso.onmicrosoft.com"), "app@contoso.onmicrosoft.com")
        p = querylog.kennung("Anna.Muster@contoso.com")
        self.assertRegex(p, r"^Kennung-[0-9a-f]{8}$")
        self.assertEqual(p, querylog.kennung("anna.muster@contoso.com"), "gleich über Läufe und Schreibweise")
        self.assertEqual(querylog.kennung("Anna.Muster@contoso.com", klarnamen=True), "Anna.Muster@contoso.com")

    def test_people_never_in_report(self):
        c = querylog.Client(label="Skript", app="Skript", item_id="x", item_name="Finanzmodell", workspace="Finance")
        c.texts["EVALUATE ROW(\"a\", 1)"] += 1
        c.users.update({"anna.muster@contoso.com", "6a1f0c3e-1111-2222-3333-444455556666"})
        a = tenant.scan_client(c, [])
        txt = json.dumps([f.occurrences for f in a.findings] + [a.meta], default=list)
        self.assertNotIn("anna.muster", txt)


if __name__ == "__main__":
    unittest.main()
