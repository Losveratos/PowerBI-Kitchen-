"""Weniger Fehlalarme, Ausnahmen mit Begründung und stabile Befund-IDs, Abdeckung im Bericht."""
import csv
import json
import os
import shutil
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, ".."))

from fabscan import ausnahmen, cli, export, querylog, report, scanapi, tenant, tmdl  # noqa: E402

FIX = os.path.join(HERE, "fixtures", "tenant")
SCAN = os.path.join(FIX, "scan_result.json")
LOGS = os.path.join(FIX, "semantic_model_logs.jsonl")


def run_tenant():
    models = scanapi.load_scan(SCAN)
    apps = tenant.scan_tenant(models, querylog.clients(querylog.load_log(LOGS)))
    return models, apps


def client(label, model, texts, users=("anna@contoso.com",)):
    c = querylog.Client(label=label, app=label, item_id=model["id"], item_name=model["name"], workspace="Finance")
    for t in texts:
        c.texts[t] += 1
    c.users.update(users)
    return c


def scan_model(**extra):
    """Ein Modell im Format der Scanner-API mit ausgeblendeter Sortier- und Schlüsselspalte."""
    ds = {"id": "m-1", "name": "Personal", "tables": [
        {"name": "Monat", "columns": [{"name": "Monat"}, {"name": "MonatSort", "isHidden": True}],
         "measures": []},
        {"name": "Fakten", "columns": [{"name": "MonatKey", "isHidden": True}, {"name": "Intern", "isHidden": True},
                                       {"name": "GehaltSort", "isHidden": True}],
         "measures": [{"name": "Summe", "expression": "SUM(Fakten[Wert])"}]}], "roles": []}
    ds.update(extra)
    return ds


class FalseAlarms(unittest.TestCase):
    def test_service_principal_on_model_without_rls_is_info(self):
        _, apps = run_tenant()
        nb = next(a for a in apps if a.name == "Notebook Export")
        auth = [f for f in nb.findings if f.rule == "SEC-AUTH"]
        self.assertEqual([f.severity for f in auth], ["info"])
        self.assertNotIn("Service Principal", " ".join(t for _, t in report.overall(apps)))   # nicht im Gesamtbild

    def test_service_principal_on_rls_model_is_warn(self):
        models, _ = run_tenant()
        vt = json.load(open(SCAN, encoding="utf-8"))["workspaces"][0]["datasets"][1]
        c = client("Export", vt, ["EVALUATE SUMMARIZECOLUMNS(\"P\", [Pipeline])"], users=("app@contoso.onmicrosoft.com",))
        a = tenant.scan_client(c, models)
        f = next(f for f in a.findings if f.rule == "SEC-AUTH")
        self.assertEqual(f.severity, "warn")
        self.assertIn("Zeilensicherheit", report.plain(f, "log")["head"])

    def test_service_principal_detection(self):
        sp = querylog.is_service_principal
        self.assertTrue(sp("app@contoso.onmicrosoft.com"))
        self.assertTrue(sp("1c2d3e4f-0000-1111-2222-333344445555"))
        self.assertTrue(sp("1c2d3e4f-0000-1111-2222-333344445555@9e8d7c6b-0000-1111-2222-333344445555"))
        self.assertFalse(sp("anna@contoso.com"))
        self.assertFalse(sp("Power BI Service"))           # Systemkennung ohne @ ist kein SP
        self.assertFalse(sp(""))

    def test_hidden_helper_columns_are_not_reported(self):
        ds = scan_model(helperColumns=[["Monat", "MonatSort"], ["Fakten", "GehaltSort"]],
                        relationships=[{"fromTable": "Fakten", "fromColumn": "MonatKey", "toTable": "Monat",
                                        "toColumn": "Monat"}])
        models = scanapi.load_scan({"workspaces": [{"id": "w", "name": "Finance", "datasets": [ds]}]})
        q = ("EVALUATE SUMMARIZECOLUMNS(Monat[Monat], Monat[MonatSort], Fakten[MonatKey], Fakten[Intern], "
             "Fakten[GehaltSort], \"S\", [Summe])")
        a = tenant.scan_client(client("App", ds, [q]), models)
        hidden = [o[2] for f in a.findings if f.rule == "SEC-HIDDEN" for o in f.occurrences]
        self.assertIn("Fakten[Intern]", hidden)              # gewöhnliche ausgeblendete Spalte bleibt Hinweis
        self.assertIn("Fakten[GehaltSort]", hidden)          # vertraulicher Name meldet trotz Sortierspalte
        self.assertNotIn("Monat[MonatSort]", hidden)
        self.assertNotIn("Fakten[MonatKey]", hidden)

    def test_tmdl_reads_sort_by_and_relationships(self):
        tmp = tempfile.mkdtemp(prefix="fabscan-tmdl-")
        try:
            d = os.path.join(tmp, "M.SemanticModel", "definition")
            os.makedirs(os.path.join(d, "tables"))
            with open(os.path.join(d, "tables", "Dim Datum.tmdl"), "w", encoding="utf-8") as fh:
                fh.write("table 'Dim Datum'\n\n\tcolumn Monat\n\t\tsortByColumn: 'Monat Nr'\n\n"
                         "\tcolumn 'Monat Nr'\n\t\tisHidden\n")
            with open(os.path.join(d, "relationships.tmdl"), "w", encoding="utf-8") as fh:
                fh.write("relationship r1\n\tfromColumn: Sales.'Order Date'\n\ttoColumn: 'Dim Datum'.Datum\n")
            m = tmdl.load_model(os.path.join(tmp, "M.SemanticModel"), tmp)
            self.assertEqual(m.helper_columns, {("dim datum", "monat nr"), ("sales", "order date"),
                                                ("dim datum", "datum")})
        finally:
            shutil.rmtree(tmp, ignore_errors=True)
        self.assertEqual(tmdl.split_column_ref("'It''s'.Wert"), ("It's", "Wert"))


class RepoFalseAlarms(unittest.TestCase):
    def test_hidden_folders_are_skipped(self):
        """Kopien des Repos unter .claude/worktrees dürfen Apps und Modelle nicht verdoppeln."""
        from fabscan import checks
        tmp = tempfile.mkdtemp(prefix="fabscan-hidden-")
        try:
            for base in ("", os.path.join(".claude", "worktrees", "kopie")):
                os.makedirs(os.path.join(tmp, base, "apps", "a", "rayfin"))
                open(os.path.join(tmp, base, "apps", "a", "rayfin", "rayfin.yml"), "w").close()
                os.makedirs(os.path.join(tmp, base, "M.SemanticModel", "definition", "tables"))
            self.assertEqual(checks.find_apps(tmp), [os.path.join(tmp, "apps", "a")])
            self.assertEqual(len(tmdl.find_models(tmp)), 1)
        finally:
            shutil.rmtree(tmp, ignore_errors=True)

    def test_labels_are_not_recomputed_measures(self):
        from fabscan.checks import _is_label
        t = ('"displayNames": {\n  "[actual]": "EBIT AC",\n"id": "umsatz",\nconst x = "Umsatz";\n'
             'rows.map(r => r["Umsatz"] * 2)\ntitle: "Umsatz"\n')
        at = lambda w: t.index('"', t.index(w))  # noqa: E731
        self.assertTrue(_is_label(t, at('"EBIT AC"')))       # Anzeigename eines Felds
        self.assertTrue(_is_label(t, at('"umsatz"')))        # Kachel-ID
        self.assertTrue(_is_label(t, at('title: "Umsatz"')))
        self.assertFalse(_is_label(t, at('= "Umsatz"')))
        self.assertFalse(_is_label(t, at('["Umsatz"]')))     # Feldzugriff bleibt verdächtig


class Exceptions(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp(prefix="fabscan-aus-")

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def write(self, items):
        p = os.path.join(self.tmp, "fabscan-ausnahmen.json")
        with open(p, "w", encoding="utf-8") as fh:
            json.dump({"ausnahmen": items}, fh)
        return p

    def test_finding_id_is_stable_and_ignores_numbers(self):
        _, a1 = run_tenant()
        _, a2 = run_tenant()
        ausnahmen.apply(a1, [])
        ausnahmen.apply(a2, [])
        ids1 = sorted(f.id for a in a1 for f in a.findings)
        self.assertEqual(ids1, sorted(f.id for a in a2 for f in a.findings))
        self.assertEqual(len(ids1), len(set(ids1)))
        f = a1[0].findings[0]
        g = type(f)(f.category, f.severity, f.rule, "12 MDX-Abfragen nicht geprüft")
        h = type(f)(f.category, f.severity, f.rule, "3 MDX-Abfragen nicht geprüft")
        self.assertEqual(ausnahmen.finding_id(a1[0], g), ausnahmen.finding_id(a1[0], h))

    def test_load_rejects_missing_reason(self):
        rules, warns = ausnahmen.load(self.write([{"regel": "SEC-AUTH"}, {"id": "abc", "begruendung": "ok",
                                                                         "bis": "31.12.2027"}]))
        self.assertEqual(len(rules), 1)
        self.assertNotIn("bis", rules[0])
        self.assertTrue(any("ohne Begründung" in w for w in warns))
        self.assertTrue(any("JJJJ-MM-TT" in w for w in warns))

    def test_apply_by_rule_id_and_expiry(self):
        _, apps = run_tenant()
        ausnahmen.apply(apps, [])
        nb = next(a for a in apps if a.name == "Notebook Export")
        shadow = next(f for f in nb.findings if f.rule == "QRY-SHADOW")
        rules, _ = ausnahmen.load(self.write([
            {"id": shadow.id, "begruendung": "Bewusst, Testabfrage", "verantwortlich": "Data Team"},
            {"regel": "sec-hidden", "client": "notebook*", "begruendung": "Lohnspalte nur für HR", "bis": "2020-01-01"},
            {"regel": "CALC-RAW", "client": "Gibtsnicht", "begruendung": "alt"}]))
        info = ausnahmen.apply(apps, rules, today="2026-11-19")
        self.assertEqual((info["akzeptiert"], info["abgelaufen"]), (1, 1))
        self.assertEqual([x["regel"] for x in info["unbenutzt"]], ["CALC-RAW"])
        self.assertEqual([f.rule for f in nb.accepted], ["QRY-SHADOW"])
        self.assertNotIn("QRY-SHADOW", {f.rule for f in nb.findings})
        hidden = next(f for f in nb.findings if f.rule == "SEC-HIDDEN")
        self.assertEqual(hidden.status, "abgelaufen")
        rows = export.rows(apps, "Tenant")
        acc = [r for r in rows if r["status"] == "akzeptiert"]
        self.assertEqual((len(acc), acc[0]["exception_reason"], acc[0]["finding_id"]),
                         (1, "Bewusst, Testabfrage", shadow.id))

    def test_cli_run_with_exceptions_file(self):
        _, apps = run_tenant()
        ausnahmen.apply(apps, [])
        fails = {a.name: [f.id for f in a.findings if f.severity == "fail"] for a in apps}
        all_fails = [i for ids in fails.values() for i in ids]
        path = self.write([{"id": i, "begruendung": "geprüft", "verantwortlich": "CoE"} for i in all_fails])
        out = os.path.join(self.tmp, "out")
        rc = cli.main(["--scan-result", SCAN, "--query-log", LOGS, "-o", out, "-q", "--fail-on", "fail",
                       "--ausnahmen", path])
        self.assertEqual(rc, 0)                                 # akzeptierte Befunde zählen nicht für den Exit-Code
        with open(os.path.join(out, "befunde.csv"), encoding="utf-8") as fh:
            rows = list(csv.DictReader(fh))
        self.assertEqual(sorted(r["finding_id"] for r in rows if r["status"] == "akzeptiert"), sorted(all_fails))
        html = open(os.path.join(out, "bericht.html"), encoding="utf-8").read()
        self.assertIn("Bewusst akzeptiert", html)
        self.assertIn("Abdeckung", html)
        md = open(os.path.join(out, "zusammenfassung.md"), encoding="utf-8").read()
        self.assertIn(f"{len(all_fails)} bewusst akzeptiert", md)
        rc = cli.main(["--scan-result", SCAN, "--query-log", LOGS, "-o", out, "-q", "--fail-on", "fail"])
        self.assertEqual(rc, 1)                                 # ohne Datei wieder rot

    def test_missing_explicit_file_is_an_error(self):
        rc = cli.main(["--scan-result", SCAN, "--query-log", LOGS, "-o", os.path.join(self.tmp, "o"), "-q",
                       "--ausnahmen", os.path.join(self.tmp, "fehlt.json")])
        self.assertEqual(rc, 2)


class Coverage(unittest.TestCase):
    def test_coverage_counts(self):
        models, apps = run_tenant()
        cov = tenant.coverage(models, apps, workspaces=3, workspaces_monitoring=1, days=14)
        self.assertEqual((cov["models"], cov["clients"], cov["mdx_skipped"]), (2, 5, 1))
        self.assertEqual(cov["runs"], sum(a.meta["runs"] for a in apps))
        lines = report.coverage_lines(cov)
        self.assertIn("Workspaces: 3 geprüft, davon 1 mit Workspace Monitoring", lines[0])
        self.assertTrue(any(x.startswith("Nicht geprüft: 1 MDX-Ausführung (z. B. Excel)") and "Power-BI-Berichten" in x
                            for x in lines))

    def test_dropped_texts_are_counted(self):
        entries = [querylog.LogQuery("2026-11-01", "W", "w", "m", "M", "App", "", "a@b.de", f"EVALUATE ROW(\"x\", {i})")
                   for i in range(5)]
        c = querylog.clients(entries, max_texts=2)[0]
        self.assertEqual((len(c.texts), c.dropped), (2, 3))

    def test_no_monitoring_is_stated(self):
        lines = report.coverage_lines({"workspaces": 4, "workspaces_monitoring": 0, "models": 0, "clients": 0,
                                       "reports_excluded": False})
        self.assertIn("keinem Workspace Monitoring", lines[-1])


if __name__ == "__main__":
    unittest.main()
