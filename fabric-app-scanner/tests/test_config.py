"""0.6.2: fabscan.json je App, Modellordner direkt, sichtbare feste Filter, UTF-8-Ausgabe."""
import io
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
PKG_ROOT = os.path.join(HERE, "..")
sys.path.insert(0, PKG_ROOT)

from fabscan import checks, cli, config, dax, tmdl  # noqa: E402
from test_cli import fixture_repo  # noqa: E402


def findings(out):
    with open(os.path.join(out, "befunde.json"), encoding="utf-8") as fh:
        data = json.load(fh)
    return {a["name"]: [(f["rule"], f["severity"], f["title"]) for f in a["findings"]] for a in data["apps"]}


def write_json(path, obj):
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(obj, fh, ensure_ascii=False)


class FilterConditions(unittest.TestCase):
    def test_dwg_treatas_forms(self):
        self.assertEqual(dax.filter_conditions("TREATAS({2026}, 'Calender'[Year])"),
                         [("calender", "year", "in", frozenset({"2026"}))])
        self.assertEqual(dax.filter_conditions("TREATAS({1, 2, 3}, 'Calender'[Month])"),
                         [("calender", "month", "in", frozenset({"1", "2", "3"}))])
        self.assertEqual(dax.filter_conditions('TREATAS({"Actual"}, \'dim-datum\'[Period Status])'),
                         [("dim-datum", "period status", "in", frozenset({"actual"}))])
        self.assertEqual(dax.filter_conditions("TREATAS({TRUE()}, 'Kalender'[Ist])"),
                         [("kalender", "ist", "in", frozenset({"true"}))])

    def test_comparisons(self):
        self.assertEqual(dax.filter_conditions("'Kalender'[Ist] = TRUE"), [("kalender", "ist", "in", frozenset({"true"}))])
        self.assertEqual(dax.filter_conditions("KEEPFILTERS ( Calender[Year] IN { 2025, 2026 } )"),
                         [("calender", "year", "in", frozenset({"2025", "2026"}))])
        self.assertEqual(dax.filter_conditions("'A'[x] = 1 && 'B'[y] = \"a, b\""),
                         [("a", "x", "in", frozenset({"1"})), ("b", "y", "in", frozenset({"a, b"}))])
        self.assertEqual(dax.filter_conditions("'A'[d] >= DATE ( 2026, 1, 1 )"),
                         [("a", "d", ">=", frozenset({"date(2026,1,1)"}))])

    def test_unreadable_forms(self):
        for e in ("'A'[x] = 1 || 'A'[x] = 2", "'A'[x] = 1 OR 'A'[x] = 2", "TREATAS({(1, 2)}, 'A'[x], 'A'[y])",
                  "'A'[x] = 'B'[y]", "SUM('A'[x]) > 3", "TREATAS(VALUES('A'[x]), 'B'[y])", ""):
            self.assertIsNone(dax.filter_conditions(e), e)


class VisibleFilters(unittest.TestCase):
    def test_entry_forms(self):
        f = config.parse_visible({"column": "'Calender'[Year]", "values": [2026]})[0]
        self.assertEqual((f.table, f.column, f.op, f.values), ("calender", "year", "in", frozenset({"2026"})))
        f = config.parse_visible({"table": "Calender", "column": "Year"})[0]
        self.assertEqual((f.table, f.column, f.values), ("calender", "year", None))
        f = config.parse_visible("'Kalender'[Ist] = TRUE")[0]
        self.assertEqual((f.table, f.column, f.values), ("kalender", "ist", frozenset({"true"})))
        self.assertEqual(config.parse_visible({"column": "Jahr"}), [])
        self.assertEqual(config.parse_visible({"column": "'T'[S]", "values": []}), [])
        self.assertEqual(config.parse_visible(42), [])

    def test_match_is_robust(self):
        vis = config.parse_visible({"column": "calender[YEAR]", "values": ["2026"]})
        self.assertTrue(config.visible_match("TREATAS ( { 2026 } , 'Calender' [Year] )", "a.dax", vis))
        vis = config.parse_visible({"column": "'dim-datum'[Period Status]", "values": ["actual"]})
        self.assertTrue(config.visible_match('TREATAS({"Actual"}, \'DIM-DATUM\'[period status])', "a.dax", vis))
        vis = config.parse_visible({"column": "'Kalender'[Ist]", "values": [True]})
        self.assertTrue(config.visible_match("'Kalender'[Ist] = TRUE()", "a.dax", vis))

    def test_values_must_be_the_same(self):
        vis = config.parse_visible({"column": "'Calender'[Month]", "values": [1, 2, 3, 4, 5, 6, 7, 8]})
        self.assertTrue(config.visible_match("TREATAS({8, 7, 6, 5, 4, 3, 2, 1}, 'Calender'[Month])", "a.dax", vis))
        self.assertFalse(config.visible_match("TREATAS({1, 2, 3}, 'Calender'[Month])", "a.dax", vis))
        self.assertFalse(config.visible_match("TREATAS({2026}, 'Calender'[Year])", "a.dax", vis))

    def test_every_condition_needs_a_match(self):
        vis = config.parse_visible({"column": "'A'[x]"})
        self.assertTrue(config.visible_match("'A'[x] = 5", "a.dax", vis))
        self.assertFalse(config.visible_match("'A'[x] = 5 && 'B'[y] = 1", "a.dax", vis))

    def test_file_pattern(self):
        vis = config.parse_visible({"column": "'A'[x]", "file": "*/pages/GUV-*.dax"})
        self.assertTrue(config.visible_match("'A'[x] = 1", "src\\dwg\\pages\\guv-baum.dax", vis))
        self.assertFalse(config.visible_match("'A'[x] = 1", "src/dwg/pages/plan.dax", vis))
        vis = config.parse_visible({"column": "'A'[x]", "file": "guv-*.dax"})
        self.assertTrue(config.visible_match("'A'[x] = 1", "src/dwg/pages/guv-baum.dax", vis))

    def test_broken_entry_is_a_warning(self):
        tmp = tempfile.mkdtemp(prefix="fabscan-cfg-")
        try:
            p = os.path.join(tmp, "fabscan.json")
            write_json(p, {"visibleFilters": [{"column": "Jahr"}, "'T'[S] = 1"]})
            cfg = config.load(p, tmp)
            self.assertEqual(len(cfg.visible_filters), 1)
            self.assertEqual(len(cfg.warnings), 1)
            with open(p, "w", encoding="utf-8") as fh:
                fh.write("{kaputt")
            with self.assertRaises(ValueError):
                config.load(p, tmp)
        finally:
            shutil.rmtree(tmp, ignore_errors=True)


class Repo(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp(prefix="fabscan-062-")
        self.root = fixture_repo(self.tmp)

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def run_scan(self, *args):
        out = os.path.join(self.tmp, f"out{len(os.listdir(self.tmp))}")
        self.assertEqual(cli.main([*args, "-o", out, "-q"]), 0)
        return findings(out)

    def move_model_out(self):
        """Modell aus dem Repo nehmen, wie bei den dwg-Apps (Modell liegt neben den Apps, nicht darin)."""
        dst = os.path.join(self.tmp, "modelle", "Demo.SemanticModel")
        os.makedirs(os.path.dirname(dst))
        shutil.move(os.path.join(self.root, "Demo.SemanticModel"), dst)
        return dst

    def test_models_entry_may_point_at_the_model_folder(self):
        dst = self.move_model_out()
        self.assertEqual([m.name for m in tmdl.find_models(dst)], ["Demo"])
        self.assertEqual(len(tmdl.find_models(os.path.dirname(dst))), 1)
        r = self.run_scan(self.root, "--models", dst)
        self.assertNotIn("LIN-NO-MODEL", {x[0] for x in r["good-app"]})

    def test_app_config_is_read_with_paths_relative_to_the_app(self):
        self.move_model_out()
        apps = os.path.join(self.root, "apps")
        before = self.run_scan(apps)
        self.assertIn("LIN-NO-MODEL", {x[0] for x in before["good-app"]})
        write_json(os.path.join(apps, "good-app", "fabscan.json"),
                   {"models": ["../../../modelle/Demo.SemanticModel"], "connectors": {"good-app:demo": "Demo"}})
        after = self.run_scan(apps)
        self.assertNotIn("LIN-NO-MODEL", {x[0] for x in after["good-app"]})
        self.assertIn("LIN-NO-MODEL", {x[0] for x in after["bad-app"]}, "gilt nur für die eigene App")

    def bound_model(self, out_dir, app):
        with open(os.path.join(out_dir, "befunde.json"), encoding="utf-8") as fh:
            data = json.load(fh)
        return next(a for a in data["apps"] if a["name"] == app)["connectors"][0]["model"]

    def test_app_values_win_over_root_values(self):
        second = os.path.join(self.root, "Zweit.SemanticModel")
        shutil.copytree(os.path.join(self.root, "Demo.SemanticModel"), second)
        write_json(os.path.join(second, ".platform"), {"metadata": {"type": "SemanticModel", "displayName": "Zweit"}})
        write_json(os.path.join(self.root, "fabscan.json"), {"connectors": {"good-app:demo": "Zweit"}})
        out = os.path.join(self.tmp, "a")
        cli.main([self.root, "-o", out, "-q"])
        self.assertEqual(self.bound_model(out, "good-app"), "Zweit")
        write_json(os.path.join(self.root, "apps", "good-app", "fabscan.json"), {"connectors": {"good-app:demo": "Demo"}})
        out = os.path.join(self.tmp, "b")
        cli.main([self.root, "-o", out, "-q"])
        self.assertEqual(self.bound_model(out, "good-app"), "Demo")

    def test_visible_filter_becomes_info(self):
        apps = os.path.join(self.root, "apps")
        r = self.run_scan(self.root)
        self.assertIn(("QRY-HARDCODED", "warn", "Fest verdrahtete Filter in den Abfragen"), r["bad-app"])
        write_json(os.path.join(apps, "bad-app", "fabscan.json"),
                   {"visibleFilters": [{"column": "Sales[Region]", "values": ["NORD"]}]})
        r = self.run_scan(self.root)
        self.assertIn(("QRY-HARDCODED", "info", checks.VISIBLE_TITLE), r["bad-app"])
        self.assertNotIn(("QRY-HARDCODED", "warn", "Fest verdrahtete Filter in den Abfragen"), r["bad-app"])

    def test_unlisted_fixed_filter_stays_warn(self):
        write_json(os.path.join(self.root, "fabscan.json"),
                   {"visibleFilters": [{"column": "Sales[Region]", "values": ["Süd"]}]})
        r = self.run_scan(self.root)
        self.assertIn(("QRY-HARDCODED", "warn", "Fest verdrahtete Filter in den Abfragen"), r["bad-app"])

    def test_visible_filter_does_not_count_for_the_traffic_light(self):
        apps = os.path.join(self.root, "apps")
        q = os.path.join(apps, "good-app", "packages", "frontend", "src", "queries", "demo", "jahr.dax")
        with open(q, "w", encoding="utf-8") as fh:
            fh.write("EVALUATE\nSUMMARIZECOLUMNS (\n    Sales[Region],\n    TREATAS ( { 2026 }, 'Dim Datum'[Jahr] ),\n"
                     "    \"umsatz\", [Umsatz]\n)\n")
        out = os.path.join(self.tmp, "a")
        cli.main([self.root, "-o", out, "-q", "--app", "good-app"])
        self.assertIn(("QRY-HARDCODED", "warn", "Fest verdrahtete Filter in den Abfragen"), findings(out)["good-app"])
        write_json(os.path.join(apps, "good-app", "fabscan.json"), {"visibleFilters": ["TREATAS({2026}, 'Dim Datum'[Jahr])"]})
        out = os.path.join(self.tmp, "b")
        self.assertEqual(cli.main([self.root, "-o", out, "-q", "--app", "good-app", "--fail-on", "warn"]), 0)
        self.assertIn(("QRY-HARDCODED", "info", checks.VISIBLE_TITLE), findings(out)["good-app"])
        with open(os.path.join(out, "zusammenfassung.md"), encoding="utf-8") as fh:
            md = fh.read()
        self.assertNotIn("feste Filterwerte in den Abfragen", md)

    def test_broken_app_config_is_an_error(self):
        with open(os.path.join(self.root, "apps", "good-app", "fabscan.json"), "w", encoding="utf-8") as fh:
            fh.write("{kaputt")
        self.assertEqual(cli.main([self.root, "-o", os.path.join(self.tmp, "x"), "-q"]), 2)


class Utf8Output(unittest.TestCase):
    def test_reconfigure_cp1252_stream(self):
        raw = io.BytesIO()
        stream = io.TextIOWrapper(raw, encoding="cp1252")
        old = sys.stdout, sys.stderr
        sys.stdout = sys.stderr = stream
        try:
            cli.utf8_output()
            print("✓ ✗ ℹ Größe")
            stream.flush()
        finally:
            sys.stdout, sys.stderr = old
        self.assertIn("✓ ✗ ℹ Größe", raw.getvalue().decode("utf-8"))

    def test_cli_without_pythonioencoding(self):
        tmp = tempfile.mkdtemp(prefix="fabscan-utf8-")
        try:
            root = fixture_repo(tmp)
            env = {k: v for k, v in os.environ.items() if k not in ("PYTHONIOENCODING", "PYTHONUTF8")}
            env["PYTHONUTF8"] = "0"
            env["PYTHONPATH"] = os.path.abspath(PKG_ROOT)
            p = subprocess.run([sys.executable, "-m", "fabscan", root, "-o", os.path.join(tmp, "out")],
                               capture_output=True, env=env, cwd=tmp, timeout=300)
            self.assertEqual(p.returncode, 0, p.stderr.decode("utf-8", "replace"))
            self.assertIn("✓", p.stdout.decode("utf-8"))
        finally:
            shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    unittest.main()
