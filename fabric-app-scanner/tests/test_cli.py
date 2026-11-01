import csv
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, ".."))

from fabscan import cli, export  # noqa: E402

TEN = os.path.join(HERE, "fixtures", "tenant")


def fixture_repo(tmp):
    """Testdaten mit richtigen Namen (im Repo ohne .platform, damit Fabric-Git sie nicht als Item liest)."""
    root = os.path.join(tmp, "repo")
    shutil.copytree(os.path.join(HERE, "fixtures", "repo"), root)
    os.rename(os.path.join(root, "Demo_SemanticModel"), os.path.join(root, "Demo.SemanticModel"))
    os.rename(os.path.join(root, "Demo.SemanticModel", "_platform"), os.path.join(root, "Demo.SemanticModel", ".platform"))
    return root


class Cli(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp(prefix="fabscan-cli-")

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_repo_run_writes_folder(self):
        out = os.path.join(self.tmp, "out")
        rc = cli.main([fixture_repo(self.tmp), "-o", out, "-q"])
        self.assertEqual(rc, 0)
        self.assertEqual(sorted(os.listdir(out)), ["befunde.csv", "befunde.json", "bericht.html", "zusammenfassung.md"])
        with open(os.path.join(out, "befunde.csv"), encoding="utf-8") as fh:
            rows = list(csv.DictReader(fh))
        self.assertEqual(list(rows[0].keys()), export.COLUMNS)
        self.assertIn("QRY-SHADOW", {r["rule"] for r in rows})
        with open(os.path.join(out, "befunde.json"), encoding="utf-8") as fh:
            data = json.load(fh)
        self.assertEqual(data["schema_version"], 1)
        md = open(os.path.join(out, "zusammenfassung.md"), encoding="utf-8").read()
        self.assertIn("bad-app", md)
        self.assertNotIn("demo-geheimnis", md + open(os.path.join(out, "bericht.html"), encoding="utf-8").read())

    def test_fail_on(self):
        root = fixture_repo(self.tmp)
        self.assertEqual(cli.main([root, "-o", os.path.join(self.tmp, "a"), "-q", "--fail-on", "fail"]), 1)
        self.assertEqual(cli.main([root, "-o", os.path.join(self.tmp, "b"), "-q", "--app", "good-app", "--fail-on", "warn"]), 0)

    def test_tenant_without_repo(self):
        out = os.path.join(self.tmp, "t")
        rc = cli.main(["--scan-result", os.path.join(TEN, "scan_result.json"),
                       "--query-log", os.path.join(TEN, "semantic_model_logs.jsonl"), "-o", out, "-q"])
        self.assertEqual(rc, 0)
        html = open(os.path.join(out, "bericht.html"), encoding="utf-8").read()
        self.assertIn("Modelle im Tenant", html)

    def test_no_apps_is_usage_error(self):
        empty = os.path.join(self.tmp, "leer")
        os.makedirs(empty)
        self.assertEqual(cli.main([empty, "-q"]), 2)

    def test_notebook_command(self):
        out = os.path.join(self.tmp, "nb.ipynb")
        self.assertEqual(cli.main(["notebook", "-o", out]), 0)
        self.assertEqual(json.load(open(out))["nbformat"], 4)

    def test_skill_install_and_run(self):
        target = os.path.join(self.tmp, "skills", "fabscan")
        self.assertEqual(cli.main(["skill", "--ziel", target]), 0)
        self.assertTrue(os.path.exists(os.path.join(target, "SKILL.md")))
        env = {k: v for k, v in os.environ.items() if k != "PYTHONPATH"}
        r = subprocess.run([sys.executable, "-I", os.path.join(target, "run.py"), "--version"],
                           capture_output=True, text=True, env=env, cwd=self.tmp)
        self.assertIn("fabscan", r.stdout + r.stderr)
        out = os.path.join(self.tmp, "skill-out")
        r = subprocess.run([sys.executable, "-I", os.path.join(target, "run.py"), fixture_repo(self.tmp), "-o", out, "-q"],
                           capture_output=True, text=True, env=env, cwd=self.tmp)
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertTrue(os.path.exists(os.path.join(out, "bericht.html")))

    def test_skill_zip(self):
        z = os.path.join(self.tmp, "fabscan-skill.zip")
        cli.main(["skill", "--zip", z])
        names = zipfile.ZipFile(z).namelist()
        self.assertIn("fabscan/SKILL.md", names)
        self.assertIn("fabscan/run.py", names)
        self.assertIn("fabscan/scripts/fabscan/cli.py", names)
        head = zipfile.ZipFile(z).read("fabscan/SKILL.md").decode()
        self.assertTrue(head.startswith("---\nname: fabscan\n"))


if __name__ == "__main__":
    unittest.main()
