#!/usr/bin/env python3
"""Tests fuer mockup-live/agent/live_runner.py.

    python mockup-live/tests/run_tests.py            # alles
    python mockup-live/tests/run_tests.py -k delta   # nur Tests mit "delta" im Namen
    python mockup-live/tests/run_tests.py --fast     # nur Einheitentests (ohne pbir)

Echtes `pbir` schreibt in eine Kopie von PBI-IBCS-Testbed (je Test ein
Temp-Ordner); nur die Desktop-Bridge ist eine Attrappe (fake_bridge.py, ueber
den Shim fake_bridge.cmd bzw. fake_bridge angesprochen).
"""
from __future__ import annotations

import argparse
import copy
import glob
import hashlib
import json
import os
import shutil
import struct
import subprocess
import sys
import tempfile
import time
import unittest
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
RUNNER = REPO / "mockup-live" / "agent" / "live_runner.py"
SHIM = HERE / ("fake_bridge.cmd" if os.name == "nt" else "fake_bridge")
def _testbed() -> Path:
    """PBI-IBCS-Testbed: $MK_TESTBED, im Repo oder neben dem Worktree."""
    cands = [os.environ.get("MK_TESTBED"), REPO / "PBI-IBCS-Testbed"]
    cands += [base / "PBI-IBCS-Testbed" for base in REPO.parents[:3]]
    for c in cands:
        if c and (Path(c) / "PBI-IBCS-Testbed.pbip").is_file():
            return Path(c)
    return REPO / "PBI-IBCS-Testbed"


TESTBED = _testbed()
NAME = "PBI-IBCS-Testbed"

sys.path.insert(0, str(HERE))
sys.path.insert(0, str(RUNNER.parent))
import spec_fixtures as F  # noqa: E402
import live_runner as LR  # noqa: E402

PBIR = shutil.which("pbir")
# Referenz-Instanz von ChartKitchen (aus einem in Desktop gespeicherten Bericht, Seite
# "Seite 1", ohne Felder) und das Paket aus dem Repo-Build
CK_FIXTURE = HERE / "fixtures" / "ck-reference"
CK_PBIVIZ = sorted((REPO / "ibcsInspiredChartDeck" / "dist").glob("%s.*.pbiviz" % LR.CK_GUID))
CK_REF_PAGE, CK_REF_VISUAL = "c84aaf283cd327268e4e", "e1b0858b01a0175d62dd"


def sha(path: Path) -> str:
    return hashlib.sha1(path.read_bytes()).hexdigest()


def tree_hash(root: Path) -> dict:
    return {p.relative_to(root).as_posix(): sha(p)
            for p in sorted(root.rglob("*")) if p.is_file()}


class Project:
    """Temp-Kopie des Testbeds plus Helfer fuer Spec, Anfrage, Bridge und Lauf."""

    def __init__(self) -> None:
        self.tmp = Path(tempfile.mkdtemp(prefix="mk-live-"))
        self.root = self.tmp / "Live Projekt"
        shutil.copytree(TESTBED, self.root, ignore=shutil.ignore_patterns("data", "cache*"))
        self.report = self.root / ("%s.Report" % NAME)
        self.model = self.root / ("%s.SemanticModel" % NAME)
        self.pbip = self.root / ("%s.pbip" % NAME)
        self.mk = self.root / "mockup"
        self.mk.mkdir()
        self.bridge_cfg = self.tmp / "bridge.json"
        self.bridge_log = self.tmp / "bridge-calls.jsonl"
        # Vorgabe der Alt-Tests: Verhalten v1 (keine Installation). Tests fuer Paket A
        # setzen default_args = [] bzw. eigene Optionen.
        self.default_args = ["--no-install"]
        self.procs = []                  # eigene Runner im Hintergrund (start_once)
        self.set_bridge()
        self.protected = self.protected_hashes()

    def cleanup(self) -> None:
        for proc in self.procs:          # nur eigene Kindprozesse dieses Tests
            if proc.poll() is None:
                proc.kill()
                proc.communicate(timeout=30)
        shutil.rmtree(self.tmp, ignore_errors=True)

    # --- Eingaben ------------------------------------------------------ #
    def set_bridge(self, **kw) -> None:
        cfg = {"mode": "connected", "pid": 4242, "currentFilePath": str(self.pbip),
               "hasUnsavedChanges": False, "log": str(self.bridge_log)}
        cfg.update(kw)
        self.bridge_cfg.write_text(json.dumps(cfg), encoding="utf-8")

    def deploy_files(self, spec: dict, seq: int, spec_hash=None, **req) -> None:
        (self.mk / "mockup-spec.json").write_text(
            json.dumps(spec, ensure_ascii=False, indent=1), encoding="utf-8")
        r = {"contract": 1, "seq": seq, "requestedAt": "2026-09-28T14:03:11.412+02:00",
             "specHash": spec_hash or spec["meta"]["specHash"], "target": "desktop",
             "client": "run_tests.py"}
        r.update(req)
        (self.mk / "deploy-request.json").write_text(json.dumps(r), encoding="utf-8")

    # --- Lauf ---------------------------------------------------------- #
    def env(self, **extra) -> dict:
        env = dict(os.environ)
        env["FAKE_BRIDGE_CONFIG"] = str(self.bridge_cfg)
        env["FAKE_BRIDGE_PYTHON"] = sys.executable
        env["PYTHONIOENCODING"] = "utf-8"
        env.pop("MK_RUNNER_FAULT", None)
        env.pop("MK_BRIDGE_CMD", None)
        env.pop("MK_DESKTOP_CLOSE_CMD", None)
        # kein echtes te (abgelaufen oder neu) in Runner-Tests; Modelltests setzen fake_te
        env["MK_TE"] = str(self.tmp / "kein-te.exe")
        # Beta: kein Leerlauf-Status (zählt sonst Bridge-Aufrufe mit), Rückfragen kurz,
        # nie ein Browser, eigener Helfer-Ordner statt %LOCALAPPDATA%\MockupKitchen
        env["MK_IDLE_POLL"] = "0"
        env["MK_CONFIRM_TIMEOUT"] = "120"
        env["MK_NO_BROWSER"] = "1"
        env["MK_HOME"] = str(self.tmp / "mk-home")
        env["MK_LAUNCH_NO_DIALOG"] = "1"
        env.pop("MK_DOCTOR_SYSTEM", None)
        env.pop("MK_LAUNCH_PID", None)
        # Neustart-Tests: nie ein echtes Desktop suchen oder starten
        env["PBI_DESKTOP_PATH"] = str(SHIM)
        # Fake-Desktop liefert leere Einheitsbilder: nicht auf fertiges Rendern warten
        env["MK_SHOT_WAIT"] = "0"
        env.update(extra)
        return env

    def run(self, mode="once", *args, env=None, timeout=600):
        argv = [sys.executable, str(RUNNER), mode, str(self.root),
                "--bridge-cmd", str(SHIM)] + list(self.default_args) + list(args)
        cp = subprocess.run(argv, capture_output=True, text=True, encoding="utf-8",
                            errors="replace", timeout=timeout, env=self.env(**(env or {})))
        return cp.returncode, cp.stdout + cp.stderr, self.status()

    def deploy(self, spec, seq, *args, env=None, **req):
        self.deploy_files(spec, seq, **req)
        return self.run("once", *args, env=env)

    # --- Rückfragen (Beta): Runner im Hintergrund, Antworten als Datei ------ #
    def start_once(self, *args, env=None):
        argv = [sys.executable, str(RUNNER), "once", str(self.root),
                "--bridge-cmd", str(SHIM)] + list(self.default_args) + list(args)
        proc = subprocess.Popen(argv, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                text=True, encoding="utf-8", errors="replace",
                                env=self.env(**(env or {})))
        self.procs.append(proc)
        return proc

    def finish(self, proc, timeout=600):
        out = proc.communicate(timeout=timeout)[0]
        return proc.returncode, out, self.status()

    def status_safe(self) -> dict:
        try:
            return self.status()
        except (OSError, ValueError):
            return {}

    def wait_status(self, pred, timeout=180, proc=None):
        deadline = time.time() + timeout
        st = {}
        while time.time() < deadline:
            st = self.status_safe()
            if st and pred(st):
                return st
            if proc is not None and proc.poll() is not None:
                raise AssertionError("Runner endete vorzeitig (%s): %s\n%s" % (
                    proc.returncode, st.get("message"), proc.stdout.read()[-3000:]))
            time.sleep(0.25)
        raise AssertionError("Zeitüberschreitung, Status: %s" % json.dumps(st)[:2000])

    def wait_awaiting(self, proc=None, **match):
        def ok(st):
            aw = st.get("awaiting") or {}
            return st.get("runner", {}).get("state") == "awaiting" and \
                all(aw.get(k) == v for k, v in match.items())
        return self.wait_status(ok, proc=proc)

    def confirm(self, seq, action) -> None:
        LR.write_json_atomic(self.mk / "deploy-confirm.json",
                             {"seq": seq, "action": action, "at": LR.now_iso()})

    def cancel(self, seq) -> None:
        LR.write_json_atomic(self.mk / "deploy-cancel.json", {"seq": seq, "at": LR.now_iso()})

    def request(self, seq, **req) -> None:
        r = {"contract": 1, "seq": seq, "requestedAt": LR.now_iso(), "target": "desktop",
             "client": "run_tests.py"}
        r.update(req)
        (self.mk / "deploy-request.json").write_text(json.dumps(r), encoding="utf-8")

    def page_tree(self) -> dict:
        return tree_hash(self.report / "definition" / "pages")

    # --- Ausgaben ------------------------------------------------------ #
    @staticmethod
    def _read_retry(read, tries=5, pause=0.1):
        """Liest erneut, wenn der Runner die Datei gerade per os.replace ersetzt
        (Windows: PermissionError) oder sie halb geschrieben ist (JSONDecodeError),
        wie der Runner beim Lesen der Kitchen-Dateien."""
        for i in range(tries):
            try:
                return read()
            except (PermissionError, FileNotFoundError, json.JSONDecodeError):
                if i == tries - 1:
                    raise
                time.sleep(pause)

    def status(self) -> dict:
        p = self.mk / "agent-status.json"
        if not p.exists():
            return {}
        try:
            return self._read_retry(lambda: json.loads(p.read_text(encoding="utf-8")))
        except FileNotFoundError:
            return {}

    def calls(self) -> list:
        if not self.bridge_log.exists():
            return []
        return self._read_retry(lambda: [
            json.loads(l)["argv"] for l in
            self.bridge_log.read_text(encoding="utf-8").splitlines() if l.strip()])

    def protected_hashes(self) -> dict:
        out = {}
        for base in (self.report, self.model):
            for p in base.rglob("*"):
                if p.is_file() and p.name.lower() in LR.PROTECTED_FILES:
                    out[p.relative_to(self.root).as_posix()] = sha(p)
        return out

    def report_hash(self) -> dict:
        return tree_hash(self.report)

    def pages(self) -> dict:
        """displayName -> Ordner (gelesen, nicht geschrieben)."""
        root = self.report / "definition" / "pages"
        out = {}
        for pj in root.glob("*/page.json"):
            out[json.loads(pj.read_text(encoding="utf-8"))["displayName"]] = pj.parent.name
        return out

    def visual(self, name: str, page=None) -> dict:
        pat = str(self.report / "definition" / "pages" / (page or "*") / "visuals" / name /
                  "visual.json")
        hits = glob.glob(pat)
        return json.loads(Path(hits[0]).read_text(encoding="utf-8")) if hits else None

    def visual_names(self, page_id: str) -> set:
        d = self.report / "definition" / "pages" / page_id / "visuals"
        return {p.name for p in d.iterdir()} if d.exists() else set()

    def pbir(self, *args):
        cp = subprocess.run([PBIR, "-q"] + [str(a) for a in args], capture_output=True,
                            text=True, encoding="utf-8", errors="replace",
                            env=self.env(PYTHONUTF8="1", COLUMNS="400"))
        return cp.returncode, cp.stdout + cp.stderr

    def add_ck_reference(self) -> None:
        """Referenz-Instanz einsetzen, wie Desktop sie speichert: Seite mit dem Visual,
        Paket unter CustomVisuals/ und Eintrag in report.json (vor dem Runner, darum
        danach die geschuetzten Hashes neu nehmen)."""
        import zipfile
        defs = self.report / "definition"
        shutil.copytree(CK_FIXTURE / "pages" / CK_REF_PAGE, defs / "pages" / CK_REF_PAGE)
        pj = defs / "pages" / "pages.json"
        pages = json.loads(pj.read_text(encoding="utf-8"))
        pages["pageOrder"].append(CK_REF_PAGE)
        pj.write_text(json.dumps(pages, indent=2), encoding="utf-8")
        cv = self.report / "CustomVisuals" / LR.CK_GUID
        shutil.copytree(CK_FIXTURE / "CustomVisuals" / LR.CK_GUID, cv, dirs_exist_ok=True)
        if CK_PBIVIZ:
            with zipfile.ZipFile(CK_PBIVIZ[-1]) as z:
                name = "resources/%s.pbiviz.json" % LR.CK_GUID
                (cv / "resources").mkdir(parents=True, exist_ok=True)
                (cv / name).write_bytes(z.read(name))
        rj = defs / "report.json"
        rep = json.loads(rj.read_text(encoding="utf-8"))
        pkg = json.loads((CK_FIXTURE / "resource-package.json").read_text(encoding="utf-8"))
        rep.setdefault("resourcePackages", []).append(pkg)
        rj.write_text(json.dumps(rep, indent=2), encoding="utf-8")
        self.protected = self.protected_hashes()

    def ck_ref_hash(self) -> str:
        return sha(self.report / "definition" / "pages" / CK_REF_PAGE / "visuals" /
                   CK_REF_VISUAL / "visual.json")

    def created(self) -> dict:
        p = self.mk / ".state" / "created.json"
        return json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}

    def validate(self) -> dict:
        rc, out = self.pbir("validate", self.report.as_posix(), "--fields", "--json")
        return LR.parse_json_output(out) or {}


def png_size(path: Path):
    data = path.read_bytes()
    assert data[:8] == b"\x89PNG\r\n\x1a\n", "kein PNG: %s" % path
    return struct.unpack(">II", data[16:24])


# --------------------------------------------------------------------------- #
# Einheitentests (ohne pbir)
# --------------------------------------------------------------------------- #
class UnitTests(unittest.TestCase):
    def test_parse_json_output_with_noise(self):
        self.assertEqual(LR.parse_json_output('Warnung\n{"a": 1}\n'), {"a": 1})
        self.assertIsNone(LR.parse_json_output("kein json"))

    def test_resolve_cmd_py_and_shim(self):
        argv = LR.resolve_cmd(str(HERE / "fake_bridge.py"), "bridge")
        self.assertEqual(argv[0], sys.executable)
        self.assertEqual(Path(LR.resolve_cmd(str(SHIM), "bridge")[0]).name, SHIM.name)
        self.assertIsNone(LR.resolve_cmd("gibt-es-nicht-xyz", "bridge"))

    def test_sync_tree_touches_only_differences(self):
        tmp = Path(tempfile.mkdtemp())
        try:
            src, dst = tmp / "a", tmp / "b"
            (src / "x").mkdir(parents=True)
            (src / "x" / "same.json").write_text("1")
            (src / "keep.json").write_text("alt")
            shutil.copytree(src, dst)
            (dst / "keep.json").write_text("neu")
            (dst / "neu").mkdir()
            (dst / "neu" / "v.json").write_text("{}")
            before = (dst / "x" / "same.json").stat().st_mtime_ns
            n = LR.sync_tree(src, dst)
            self.assertEqual(tree_hash(src), tree_hash(dst))
            self.assertFalse((dst / "neu").exists())
            self.assertEqual((dst / "x" / "same.json").stat().st_mtime_ns, before)
            self.assertEqual(n, 2)
        finally:
            shutil.rmtree(tmp, ignore_errors=True)

    def test_vcore_ignores_origin_and_derived_keys(self):
        v = F.card("a", "S", "T", "_Measures.AC", 0, 0)
        w = json.loads(json.dumps(v))
        w["pbir"] = {"page": "p", "visual": "v"}
        w["samples"] = [1, 2]
        w["warnings"] = ["x"]
        self.assertEqual(LR.canon(LR.vcore(v)), LR.canon(LR.vcore(w)))
        w["rect"]["x"] = 5
        self.assertNotEqual(LR.canon(LR.vcore(v)), LR.canon(LR.vcore(w)))

    def test_ck_projection_shapes(self):
        m = LR.ck_projection("_Measures.AC", "measure", "actual", True)
        self.assertEqual(m, {"field": {"Measure": {"Expression": {"SourceRef": {
            "Entity": "_Measures"}}, "Property": "AC"}}, "queryRef": "_Measures.AC",
            "nativeQueryRef": "AC"})
        c = LR.ck_projection("DimDate.MonthName", "column", "category", True)
        self.assertTrue(c["active"])
        self.assertIn("Column", c["field"])
        self.assertNotIn("active", LR.ck_projection("DimDate.Year", "column", "multiples",
                                                    True))
        a = LR.ck_projection("FactActuals.Amount", "column", "actual", True)
        self.assertEqual(a["field"]["Aggregation"]["Function"], 0)
        self.assertEqual(a["queryRef"], "Sum(FactActuals.Amount)")
        props = LR.ck_chart_props({"orientation": "cards",
                                   "chartProps": {"orientation": "cards", "invert": True}})
        self.assertEqual(props, {"orientation": {"expr": {"Literal": {"Value": "'cards'"}}},
                                 "invert": {"expr": {"Literal": {"Value": "true"}}}})
        self.assertEqual(LR.ck_chart_props({"orientation": "erfunden"}), {})
        self.assertEqual(LR.ck_title_props({"title": "Umsatz", "analysis": {"message": "Plus"}}),
                         {"kpi": LR.lit("Umsatz"), "message": LR.lit("Plus")})
        self.assertEqual(LR.ck_title_props({"title": ""}), {})

    def test_ck_reference_fields_by_scenario(self):
        """Referenzfelder nach Szenario (Name, dann Kachel-Szenario), nicht nach Reihenfolge."""
        conv = LR.DEFAULT_CONVERTER
        sys.path.insert(0, str(conv.parent))
        try:
            import mockup_to_pbir as P
        finally:
            sys.path.pop(0)
        def roles(refs, scenario="AC/PL", names=None):
            v = F.ck_bars("x", "S", "T", "DimRegion.Region", "_Measures.AC", refs, 0, 0)
            v["scenario"] = scenario
            for f, n in zip(v["roles"]["ref"], names or []):
                f["name"] = n
            return P.ck_roles_for(v)
        out, warn = roles(["_Measures.PY", "_Measures.PL"])
        self.assertEqual((out["previousYear"], out["plan"]), (["_Measures.PY"], ["_Measures.PL"]))
        out, _ = roles(["_Measures.PL", "_Measures.PY"])
        self.assertEqual((out["previousYear"], out["plan"]), (["_Measures.PY"], ["_Measures.PL"]))
        # Namen ohne Kuerzel: Szenario der Kachel entscheidet (AC/PY -> previousYear)
        out, _ = roles(["_Measures.Umsatz"], "AC/PY", names=["Umsatz Referenz"])
        self.assertEqual(out.get("previousYear"), ["_Measures.Umsatz"])
        # Vorjahr/Budget/Forecast im Namen
        for name, role in (("Umsatz Vorjahr", "previousYear"), ("Budget 2026", "plan"),
                           ("FC_FY", "forecast"), ("Umsatz LY", "previousYear")):
            out, _ = roles(["_Measures.Umsatz"], "AC", names=[name])
            self.assertEqual(out.get(role), ["_Measures.Umsatz"], name)
        # zweimal PY: das zweite bleibt ungebunden und wird gemeldet
        out, warn = roles(["_Measures.PY", "_Measures.PY"], names=["PY", "PY VJ"])
        self.assertEqual(out["previousYear"], ["_Measures.PY"])
        self.assertTrue(any("nicht gebunden" in w for w in warn), warn)

    def test_ck_roles_match_capabilities(self):
        """Rollen und Modi der Konstanten = capabilities.json im Repo-Build."""
        if not CK_PBIVIZ:
            self.skipTest("ChartKitchen-.pbiviz fehlt im Repo")
        import zipfile
        with zipfile.ZipFile(CK_PBIVIZ[-1]) as z:
            caps = json.loads(z.read("resources/%s.pbiviz.json" % LR.CK_GUID))["capabilities"]
        roles = {r["name"]: r["kind"] for r in caps["dataRoles"]}
        self.assertEqual({r for r, k in roles.items() if k == "Measure"},
                         set(LR.CK_MEASURE_ROLES))
        self.assertEqual({r for r, k in roles.items() if k == "Grouping"},
                         set(LR.CK_GROUPING_ROLES))
        enum = caps["objects"]["chart"]["properties"]["orientation"]["type"]["enumeration"]
        self.assertEqual({e["value"] for e in enum}, LR.CK_ORIENTATIONS)
        self.assertEqual(caps["objects"]["chart"]["properties"]["invert"]["type"],
                         {"bool": True})

    def test_fake_bridge_not_connected_matches_real_cli(self):
        env = dict(os.environ, FAKE_BRIDGE_CONFIG="")
        fake = subprocess.run(LR.resolve_cmd(str(SHIM), "b") + ["status"], env=env,
                              capture_output=True, text=True)
        fake_json = json.loads(fake.stdout)
        self.assertEqual(fake_json, {"status": "not_connected", "instances": []})
        real = LR.resolve_cmd("powerbi-desktop", "bridge")
        if not real:
            self.skipTest("powerbi-desktop nicht installiert")
        cp = subprocess.run(real + ["status"], capture_output=True, text=True, timeout=60)
        real_json = LR.parse_json_output(cp.stdout)
        if real_json.get("status") != "not_connected":
            self.skipTest("Desktop laeuft gerade, not_connected nicht vergleichbar")
        self.assertEqual(set(real_json), set(fake_json))

    def test_fake_bridge_connected_shapes(self):
        p = Project()
        try:
            env = dict(os.environ, FAKE_BRIDGE_CONFIG=str(p.bridge_cfg))
            base = LR.resolve_cmd(str(SHIM), "b")
            st = json.loads(subprocess.run(base + ["status"], env=env, capture_output=True,
                                           text=True).stdout)
            inst = st["instances"][0]
            self.assertEqual(st["status"], "ready")
            self.assertEqual(set(inst), {"pid", "bridgeStatus", "currentFilePath",
                                         "hasUnsavedChanges", "reportDir", "pages"})
            self.assertEqual(inst["pages"][0]["id"], "pageIBCS")
            out = p.tmp / "shots"
            cp = subprocess.run(base + ["screenshot-all", "--output-dir", str(out),
                                        "--scale", "1"], env=env, capture_output=True,
                                text=True)
            shots = json.loads(cp.stdout)["screenshots"]
            self.assertEqual(png_size(Path(shots[0]["outputPath"])), (1920, 1080))
        finally:
            p.cleanup()


# --------------------------------------------------------------------------- #
# Runner gegen echtes pbir
# --------------------------------------------------------------------------- #
@unittest.skipUnless(PBIR, "pbir nicht installiert")
class RunnerTests(unittest.TestCase):
    maxDiff = None

    def setUp(self):
        self.p = Project()

    def tearDown(self):
        # Waehrend der Bridge-Preview verboten: definition.pbir, report.json &c.
        self.assertEqual(self.p.protected_hashes(), self.p.protected,
                         "geschuetzte Dateien veraendert")
        if os.environ.get("MK_KEEP"):
            print("\n  behalten: %s" % self.p.root)
        else:
            self.p.cleanup()

    def assertApplied(self, rc, out, st):
        self.assertEqual((rc, st.get("state")), (0, "applied"), out[-3000:])

    def assertFieldsClean(self):
        v = self.p.validate()
        problems = (v.get("errors") or []) + [w for w in v.get("warnings") or []
                                              if str(w.get("code")).startswith("FIELD")]
        self.assertEqual(problems, [], "pbir validate --fields meldet Befunde")

    # 1 ------------------------------------------------------------------ #
    def test_first_deploy(self):
        spec = F.base_spec("h1")
        spec["pages"][0]["visuals"] += [
            F.text_tile("txt1", "Übersicht", "Hinweis", "Zahlen in Tsd. EUR", 952, 96),
            F.ck_columns("ck1", "Übersicht", "AC (IBCS)", "DimDate.MonthName",
                         "_Measures.AC", 1420, 96),
        ]
        rc, out, st = self.p.deploy(spec, 1, "--no-ck-fallback")
        self.assertApplied(rc, out, st)
        self.assertEqual(st["seq"], 1)
        self.assertEqual([s["id"] for s in st["steps"]],
                         ["bridge", "spec", "build", "visuals", "model", "plan", "backup",
                          "write", "validate", "reload", "shots", "compare"])
        # --no-install, kein te, kein Kitchen-Bild: diese drei Schritte sind übersprungen
        self.assertTrue(all(s["state"] == ("skipped" if s["id"] in ("visuals", "model",
                                                                    "compare") else "ok")
                            for s in st["steps"]), st["steps"])
        # Seiten neu angelegt, ohne die Titel-Textbox von `pbir add page`
        pages = self.p.pages()
        for name in ("Übersicht", "Detail"):
            self.assertIn(name, pages)
            self.assertNotIn("Title", self.p.visual_names(pages[name]))
            self.assertEqual(st["pages"][name]["pbir"]["page"], pages[name])
            self.assertEqual(st["pages"][name]["action"], "created")
            shot = self.p.mk / st["pages"][name]["shot"]
            self.assertTrue(shot.is_file(), shot)
            self.assertEqual(png_size(shot), (1920, 1080))         # --scale 1
        self.assertIn("IBCS Testbed", pages)                        # nie geloescht
        # Kacheln
        self.assertEqual(set(st["visuals"]), {"kpi1", "kpi2", "col1", "lin1", "txt1", "ck1"})
        for k in ("kpi1", "kpi2", "col1", "lin1", "txt1"):
            self.assertEqual(st["visuals"][k]["state"], "applied", st["visuals"][k])
        self.assertEqual(st["visuals"]["ck1"]["state"], "warn")     # Platzhalter
        self.assertIn("mk_ck1_slot", self.p.visual_names(pages["Übersicht"]))
        self.assertEqual(self.p.visual("mk_col1")["position"]["x"], 24)
        self.assertEqual(self.p.visual("mk_col1")["position"]["z"], 10)
        self.assertEqual(self.p.visual("mk_kpi1")["visual"]["visualType"], "card")
        self.assertIn("chrome_header_bg", self.p.visual_names(pages["Detail"]))
        # To-dos: Theme (report.json tabu) + ChartKitchen-Platzhalter
        kinds = {t["kind"] for t in st["todos"]}
        self.assertIn("theme", kinds)
        self.assertTrue(any(t["kind"] == "manual" and "ChartKitchen" in t["text"]
                            for t in st["todos"]))
        self.assertFieldsClean()
        # Ablage im mockup/-Ordner: alles ignoriert, Erlaubnisliste (Review E, P1)
        rules = [l.strip() for l in (self.p.mk / ".gitignore").read_text(encoding="utf-8")
                 .splitlines() if l.strip() and not l.startswith("#")]
        self.assertEqual(rules, ["*", "!.gitignore", "!mockup-spec.json", "!AGENT-BRIEF.md",
                                 "!model-approvals.json", "!README.md"])
        self.assertIn("Ins Repo gehören nur", (self.p.mk / "README.md").read_text(
            encoding="utf-8"))
        self.assertTrue((self.p.mk / "backup" / "1" / ("%s.Report" % NAME)).is_dir())
        # Beta: Schritte mit Dauer und Start, Runner mit Sitzung und Pfad, Verlauf, Protokoll
        for s in st["steps"]:
            self.assertIsInstance(s["ms"], int, s)
            self.assertTrue(LR.parse_time(s["startedAt"]), s)
        self.assertEqual(st["runner"]["projectPath"], str(self.p.root.resolve()))
        self.assertTrue(st["runner"]["sessionId"].startswith("mk-"))
        self.assertIsNone(st["runner"]["current"])
        self.assertEqual([(h["seq"], h["state"]) for h in st["history"]], [(1, "applied")])
        self.assertEqual(set(st["history"][0]["counts"]), {"applied", "warn", "error"})
        self.assertIn("Deploy 1 gestartet", (self.p.mk / ".state" / "runner.log").read_text(
            encoding="utf-8"))
        for name in ("Übersicht", "Detail"):
            sp = st["pages"][name]["shotPage"]
            self.assertTrue(sp.endswith(".page.png"), sp)
            self.assertEqual(png_size(self.p.mk / sp), (1920, 1080))
        self.assertEqual(st["plan"]["pages"]["Übersicht"]["new"], 5)
        self.assertTrue((self.p.mk / ".state" / "last-applied-spec.json").is_file())
        self.assertTrue((self.p.mk / "out" / "plan.json").is_file())
        # Bridge: status, manifest, status (Safety 3: Duplikate vor dem Neuladen), reload, je
        # geschriebener Seite ein screenshot (--pid, --scale 1); die unberuehrte
        # Testbed-Seite bekommt kein Bild
        calls = self.p.calls()
        self.assertEqual([c[0] for c in calls],
                         ["status", "manifest", "status", "reload", "screenshot", "screenshot"])
        self.assertEqual({c[1] for c in calls[4:]}, {pages["Übersicht"], pages["Detail"]})
        shot_call = calls[-1]
        self.assertEqual(shot_call[shot_call.index("--scale") + 1], "1")
        self.assertEqual(shot_call[shot_call.index("--pid") + 1], "4242")
        # Dauer je Schritt in der Meldung
        for s in st["steps"]:
            self.assertRegex(s["msg"], r"\(\d+\.\d s\)$", s)
        self.assertTrue(st["desktop"]["reloaded"])
        self.assertIsNotNone(st["runner"]["heartbeatAt"])

    # 2 ------------------------------------------------------------------ #
    def test_delta_second_deploy(self):
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1)
        self.assertApplied(rc, out, st)
        page = self.p.pages()["Übersicht"]
        # "In Desktop" verschoben und gespeichert (hier: mit pbir)
        rc2, o2 = self.p.pbir("visuals", "position",
                              "%s/Übersicht.Page/mk_kpi2.Visual" % self.p.report.as_posix(),
                              "--x", "1400", "--y", "800")
        self.assertEqual(rc2, 0, o2)
        before = self.p.report_hash()
        spec = F.base_spec("h2")
        F.find_visual(spec, "kpi1")["rect"].update({"x": 950, "y": 110})
        spec["pages"][0]["visuals"].append(
            F.bar("bar1", "Übersicht", "AC je Kategorie", "DimProduct.Category",
                  "_Measures.AC", 950, 320))
        spec["pages"][1]["visuals"] = []                    # lin1 im Mockup entfernt
        rc, out, st = self.p.deploy(spec, 2)
        self.assertApplied(rc, out, st)
        self.assertEqual(set(st["visuals"]), {"kpi1", "bar1"})
        self.assertEqual(st["visuals"]["kpi1"]["action"], "updated")
        self.assertEqual(st["visuals"]["bar1"]["action"], "created")
        kpi1 = self.p.visual("mk_kpi1")["position"]
        self.assertEqual((kpi1["x"], kpi1["y"]), (950, 110))
        kpi2 = self.p.visual("mk_kpi2")["position"]
        self.assertEqual((kpi2["x"], kpi2["y"]), (1400, 800))   # Desktop-Stand bleibt
        self.assertEqual(self.p.visual("mk_bar1")["visual"]["visualType"],
                         "clusteredBarChart")
        # Nur kpi1 und bar1 (plus pages.json/Seitenkopf nicht) wurden angefasst
        after = self.p.report_hash()
        changed = {k for k in set(before) | set(after) if before.get(k) != after.get(k)}
        self.assertEqual({c.split("/visuals/")[1].split("/")[0] if "/visuals/" in c else c
                          for c in changed},
                         {"mk_kpi1", "mk_bar1"}, changed)
        # Entfernt wird nur gemeldet
        self.assertIn("mk_lin1", self.p.visual_names(self.p.pages()["Detail"]))
        self.assertTrue(any(t["kind"] == "removed" and t["ref"] == "Detail/mk_lin1"
                            for t in st["todos"]), st["todos"])
        self.assertEqual(st["pages"]["Detail"]["action"], "unchanged")
        self.assertTrue(st["pages"]["Detail"]["shot"])
        self.assertNotIn("theme", {t["kind"] for t in st["todos"]})  # Design unveraendert
        self.assertFieldsClean()
        self.assertEqual(page, self.p.pages()["Übersicht"])

    # 3 ------------------------------------------------------------------ #
    def test_missing_field_isolated(self):
        spec = F.base_spec("h1")
        spec["pages"][0]["visuals"] += [
            F.card("bad1", "Übersicht", "Zauber", "_Measures.Zauberzahl", 952, 96),
            F.card("bad2", "Übersicht", "Markiert", "_Measures.Zauberzahl", 1420, 96),
        ]
        bad2 = F.find_visual(spec, "bad2")
        bad2["roles"]["indicator"][0]["missing"] = True
        spec["newFields"] = [{"table": "_Measures", "name": "Marge Plan", "kind": "measure",
                              "ref": "_Measures.Marge Plan", "description": "Plan-Marge"}]
        spec["fields"][0]["daxComment"] = "Bitte ohne Retouren rechnen"
        spec["fields"][0]["formatWish"] = "teur"
        spec["fields"][0]["formatWishString"] = '#,0, "T€"'
        rc, out, st = self.p.deploy(spec, 1)
        self.assertApplied(rc, out, st)
        v = st["visuals"]
        self.assertEqual(v["bad1"]["state"], "error")
        self.assertIn("not found in model", v["bad1"]["msg"])
        self.assertEqual(v["bad2"]["state"], "error")
        self.assertIn("Feld fehlt im Modell", v["bad2"]["msg"])
        for k in ("kpi1", "kpi2", "col1", "lin1"):
            self.assertEqual(v[k]["state"], "applied")
        names = self.p.visual_names(self.p.pages()["Übersicht"])
        self.assertTrue({"mk_kpi1", "mk_kpi2", "mk_col1"} <= names)
        self.assertFalse({"mk_bad1", "mk_bad2"} & names)
        model = [t for t in st["todos"] if t["kind"] == "model"]
        refs = {t["ref"] for t in model}
        self.assertIn("_Measures.Zauberzahl", refs)
        self.assertIn("_Measures.Marge Plan", refs)
        texts = " ".join(t["text"] for t in model)
        self.assertIn("ohne Retouren", texts)
        self.assertIn("T€", texts)
        self.assertFieldsClean()
        # Fehlerhafte Kacheln gelten nicht als angewendet: naechster Lauf versucht sie
        # erneut, fasst den Rest aber nicht an
        spec["meta"]["specHash"] = "h1b"
        before = self.p.report_hash()
        rc, out, st = self.p.deploy(spec, 2)
        self.assertApplied(rc, out, st)
        self.assertEqual(set(st["visuals"]), {"bad1", "bad2"})
        self.assertEqual(before, self.p.report_hash())

    # 4 ------------------------------------------------------------------ #
    def test_unsaved_changes_applied_with_note(self):
        """--auto-restart (Verhalten bis 0.2): Ungespeichertes blockiert nicht, wird vermerkt.
        Ohne die Option fragt der Runner nach (BetaTests)."""
        self.p.set_bridge(hasUnsavedChanges=True)
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1, "--auto-restart")
        self.assertApplied(rc, out, st)
        bridge = [s for s in st["steps"] if s["id"] == "bridge"][0]
        self.assertEqual(bridge["state"], "warn", bridge)
        self.assertIn("ungespeicherte", bridge["msg"])
        self.assertTrue(st["desktop"]["hasUnsavedChanges"])
        self.assertIn("reload", [c[0] for c in self.p.calls()])
        self.assertIn("mk_kpi1", self.p.visual_names(self.p.pages()["Übersicht"]))

    def test_unsaved_changes_blocked(self):
        self.p.set_bridge(hasUnsavedChanges=True)
        before = self.p.report_hash()
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1, "--respect-unsaved")
        self.assertEqual((rc, st["state"]), (2, "blocked"), out)
        self.assertIn("ungespeicherte", st["message"])
        self.assertTrue(st["desktop"]["hasUnsavedChanges"])
        self.assertEqual(before, self.p.report_hash())
        self.assertFalse((self.p.mk / "backup").exists())
        self.assertFalse((self.p.mk / ".state" / "last-applied-spec.json").exists())
        self.assertEqual([c[0] for c in self.p.calls()], ["status"])

    # 5 ------------------------------------------------------------------ #
    def test_desktop_missing_or_other_project_blocked(self):
        before = self.p.report_hash()
        self.p.set_bridge(mode="not_connected")
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1)
        self.assertEqual((rc, st["state"]), (2, "blocked"), out)
        self.p.set_bridge(currentFilePath=str(self.p.tmp / "Anderes" / "X.pbip"))
        rc, out, st = self.p.deploy(F.base_spec("h1"), 2)
        self.assertEqual((rc, st["state"]), (2, "blocked"), out)
        self.assertIn("anderes Projekt", st["message"])
        self.p.set_bridge()
        rc, out, st = self.p.deploy(F.base_spec("h1"), 3, target="desktop+service")
        self.assertEqual((rc, st["state"]), (2, "blocked"), out)
        self.assertEqual(before, self.p.report_hash())

    # 6 ------------------------------------------------------------------ #
    def test_spec_hash_mismatch(self):
        before = self.p.report_hash()
        self.p.deploy_files(F.base_spec("h1"), 1, spec_hash="anderer")
        t0 = time.time()
        rc, out, st = self.p.run("once")
        self.assertGreaterEqual(time.time() - t0, 3.0)            # wartet bis zu 3 s
        self.assertEqual((rc, st["state"]), (1, "failed"), out)
        self.assertIn("specHash", st["message"])
        self.assertEqual(before, self.p.report_hash())
        self.assertFalse((self.p.mk / "backup").exists())

    # 7 ------------------------------------------------------------------ #
    def test_unapplied_changes_blocked(self):
        (self.p.model / "unappliedChanges.json").write_text("{}", encoding="utf-8")
        before = self.p.report_hash()
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1)
        self.assertEqual((rc, st["state"]), (2, "blocked"), out)
        self.assertIn("unappliedChanges.json", st["message"])
        self.assertEqual(before, self.p.report_hash())

    # 8 ------------------------------------------------------------------ #
    def test_failure_restores_backup(self):
        # a) Fehler mitten im Schreiben: neue Seiten wieder weg, pages.json wie vorher
        pristine = self.p.report_hash()
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1, env={"MK_RUNNER_FAULT": "write"})
        self.assertEqual((rc, st["state"]), (1, "failed"), out)
        self.assertIn("Backup", st["message"])
        self.assertEqual(pristine, self.p.report_hash())
        self.assertFalse((self.p.mk / ".state" / "last-applied-spec.json").exists())
        # b) echter Befund von pbir validate --fields: Custom Visual mit fehlendem Feld
        rc, out, st = self.p.deploy(F.base_spec("h2"), 2)
        self.assertApplied(rc, out, st)
        good = self.p.report_hash()
        spec = F.base_spec("h3")
        spec["pages"][1]["visuals"].append(
            F.gantt("g1", "Detail", "Plan", "DimProduct.Product", "DimDate.Nixda", 24, 560))
        rc, out, st = self.p.deploy(spec, 3)
        self.assertEqual((rc, st["state"]), (1, "failed"), out)
        self.assertIn("Nixda", st["message"])
        self.assertEqual(good, self.p.report_hash())
        self.assertEqual(st["visuals"]["g1"]["state"], "error")
        self.assertIn("Nixda", st["visuals"]["g1"]["msg"])
        self.assertTrue(any(t["kind"] == "model" and t["ref"] == "DimDate.Nixda"
                            for t in st["todos"]))
        last = json.loads((self.p.mk / ".state" / "last-applied-spec.json")
                          .read_text(encoding="utf-8"))
        self.assertEqual(last["meta"]["specHash"], "h2")
        self.assertNotIn("reload", [c[0] for c in self.p.calls()[-2:]])
        # c) dasselbe Custom Visual mit gueltigen Feldern geht durch
        spec = F.base_spec("h4")
        spec["pages"][1]["visuals"].append(
            F.gantt("g1", "Detail", "Plan", "DimProduct.Product", "DimDate.Date", 24, 560))
        rc, out, st = self.p.deploy(spec, 4)
        self.assertApplied(rc, out, st)
        g1 = self.p.visual("mk_g1")
        self.assertEqual(g1["visual"]["visualType"], F.GANTT_GUID)
        self.assertEqual(g1["position"]["y"], 560)
        self.assertTrue(any("pbiviz" in t["text"] for t in st["todos"]))

    # 9 ------------------------------------------------------------------ #
    def test_no_change_fast_path(self):
        """Neue seq, gleiche Spec, nichts offen: ohne pbir, Reload und Bilder fertig."""
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1)
        self.assertApplied(rc, out, st)
        shots1 = {n: r["shot"] for n, r in st["pages"].items()}
        rep, n_calls = self.p.report_hash(), len(self.p.calls())
        t0 = time.time()
        rc, out, st = self.p.deploy(F.base_spec("h1"), 2)
        dt = time.time() - t0
        self.assertApplied(rc, out, st)
        self.assertIn("keine Änderung", st["message"])
        self.assertEqual([s["id"] for s in st["steps"]], ["spec"])
        self.assertEqual(len(self.p.calls()), n_calls)          # keine Bridge
        self.assertEqual(rep, self.p.report_hash())
        self.assertFalse((self.p.mk / "backup" / "2").exists())
        self.assertEqual({n: r["shot"] for n, r in st["pages"].items()}, shots1)
        self.assertLess(dt, 5.0, "Schnellweg dauerte %.1f s" % dt)
        # kleines Delta: nur die geaenderte Seite bekommt ein neues Bild
        spec = F.base_spec("h2")
        F.find_visual(spec, "kpi1")["rect"]["x"] = 950
        rc, out, st = self.p.deploy(spec, 3)
        self.assertApplied(rc, out, st)
        # Manifest nur einmal je pid; zweiter Status: Duplikate vor dem Neuladen (Safety 3)
        self.assertEqual([c[0] for c in self.p.calls()[n_calls:]],
                         ["status", "status", "reload", "screenshot"])
        self.assertTrue(st["pages"]["Übersicht"]["shot"].startswith("shots/3/"))
        self.assertEqual(st["pages"]["Detail"]["shot"], shots1["Detail"])
        self.assertTrue((self.p.mk / shots1["Detail"]).is_file())
        # offene Kachel (Feld fehlt): gleiche Spec laeuft trotzdem normal durch
        spec = F.base_spec("h3")
        spec["pages"][0]["visuals"].append(
            F.card("bad1", "Übersicht", "Zauber", "_Measures.Zauberzahl", 952, 96))
        rc, out, st = self.p.deploy(spec, 4)
        self.assertEqual(st["visuals"]["bad1"]["state"], "error")
        rc, out, st = self.p.deploy(spec, 5)
        self.assertIn("build", [s["id"] for s in st["steps"]])
        self.assertEqual(st["visuals"]["bad1"]["state"], "error")

    def test_idempotent_same_seq(self):
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1)
        self.assertApplied(rc, out, st)
        status_bytes = (self.p.mk / "agent-status.json").read_bytes()
        rep = self.p.report_hash()
        n_calls = len(self.p.calls())
        rc, out, st = self.p.run("once")
        self.assertEqual(rc, 0, out)
        self.assertIn("schon bearbeitet", out)
        self.assertEqual(status_bytes, (self.p.mk / "agent-status.json").read_bytes())
        self.assertEqual(rep, self.p.report_hash())
        self.assertEqual(n_calls, len(self.p.calls()))
        # Zusammenfassung
        rc, out, _ = self.p.run("status", "--no-bridge")
        self.assertEqual(rc, 0, out)
        self.assertIn("seq 1 · applied", out)
        self.assertIn("Angewendet  specHash h1", out)
        # auch ein blockierter Deploy wird nicht wiederholt
        self.p.set_bridge(hasUnsavedChanges=True)
        rc, out, st = self.p.deploy(F.base_spec("h2"), 2, "--respect-unsaved")
        self.assertEqual(rc, 2)
        self.p.set_bridge()
        rc, out, st = self.p.run("once", "--respect-unsaved")
        self.assertEqual((rc, st["state"], st["seq"]), (2, "blocked", 2), out)

    # 10 ----------------------------------------------------------------- #
    def test_pbir_origin_mapping(self):
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1)
        self.assertApplied(rc, out, st)
        pages = self.p.pages()
        uid = pages["Übersicht"]
        # Die Kitchen hat das Layout aus dem PBIR gelesen: Herkunft an Seiten und Kacheln
        spec = F.base_spec("h2")
        p0 = spec["pages"][0]
        p0["pbir"] = {"page": uid}
        p0["name"] = "Übersicht neu"                          # im Kitchen umbenannt
        for v in p0["visuals"]:
            v["pbir"] = {"page": uid, "visual": v["id"]}
            v["page"] = p0["name"]
        kpi1 = F.find_visual(spec, "kpi1")
        kpi1["id"] = "v99"                                  # neue Kitchen-ID, gleiche Herkunft
        kpi1["pbir"] = {"page": uid, "visual": "mk_kpi1"}
        kpi1["rect"]["y"] = 700
        kpi1["title"] = "Umsatz (neu)"
        p0["visuals"].append(F.card("ghost", p0["name"], "Geist", "_Measures.AC", 952, 96,
                                    pbir={"page": uid, "visual": "gibtsnicht"}))
        # bestehende Testbed-Seite, erstmals im Mockup, mit einer neuen Kachel
        spec["pages"].append({
            "id": "pg3", "index": 3, "name": "IBCS Testbed", "pbir": {"page": "pageIBCS"},
            "question": "", "notes": "", "contentRect": spec["pages"][0]["contentRect"],
            "layoutTree": None,
            "visuals": [F.card("ibc1", "IBCS Testbed", "AC", "_Measures.AC", 24, 96)]})
        n_pages = len(pages)
        rc, out, st = self.p.deploy(spec, 2)
        self.assertApplied(rc, out, st)
        self.assertEqual(len(self.p.pages()), n_pages)         # keine Seite neu
        self.assertEqual(st["visuals"]["kpi1"]["pbir"]["visual"], "mk_kpi1")
        pos = self.p.visual("mk_kpi1")["position"]
        self.assertEqual(pos["y"], 700)
        self.assertIsNone(self.p.visual("v99"))
        title = json.dumps(self.p.visual("mk_kpi1")["visual"]["visualContainerObjects"]
                           ["title"], ensure_ascii=False)
        self.assertIn("Umsatz (neu)", title)
        self.assertEqual(st["visuals"]["ghost"]["state"], "skipped")
        self.assertIsNone(self.p.visual("gibtsnicht"))
        self.assertIn("mk_ibc1", self.p.visual_names("pageIBCS"))
        self.assertEqual(st["pages"]["IBCS Testbed"]["action"], "updated")
        self.assertTrue(any(t["kind"] == "manual" and t["ref"] == "Übersicht neu"
                            for t in st["todos"]), st["todos"])
        # nicht angefasst: kpi2, col1 (nur Herkunft ergaenzt)
        self.assertNotIn("kpi2", st["visuals"])
        self.assertNotIn("col1", st["visuals"])
        self.assertFieldsClean()

    # 10b ---------------------------------------------------------------- #
    def test_baseline_lossy_and_groups(self):
        """Kitchen hat das Layout eingelesen (baseline-spec.json), danach geaendert."""
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1)
        self.assertApplied(rc, out, st)
        pages = self.p.pages()
        uid, did = pages["Übersicht"], pages["Detail"]
        rep = self.p.report.as_posix()
        # In Desktop: kpi1 + kpi2 gruppiert, Gruppe bei (0, 80) mit 1000 x 400
        rc2, o2 = self.p.pbir("visuals", "group", "%s/Übersicht.Page" % rep, "--create", "KPIs")
        self.assertEqual(rc2, 0, o2)
        grp = [n for n in self.p.visual_names(uid) if not n.startswith(("mk_", "chrome_"))][0]
        self.assertEqual(self.p.pbir("visuals", "group", "%s/Übersicht.Page/%s.Visual" % (rep, grp),
                                     "--add", "mk_kpi1.Visual", "--add", "mk_kpi2.Visual")[0], 0)
        self.assertEqual(self.p.pbir("visuals", "position", "%s/Übersicht.Page/%s.Visual"
                                     % (rep, grp), "--x", "0", "--y", "80", "--width", "1000",
                                     "--height", "400")[0], 0)
        # gespeicherte Kinder (24,96)/(488,96) passen in 1000x400 -> relativ -> absolut +80
        # Einlesen im Kitchen: Herkunft, absolute Positionen, Titel aus dem Kachel-Label
        base = F.base_spec("b1")
        base["meta"]["exportedAt"] = "2026-09-28T15:00:00.000+02:00"
        for pg, pid in zip(base["pages"], (uid, did)):
            pg["pbir"] = {"page": pid}
            for v in pg["visuals"]:
                v["pbir"] = {"page": pid, "visual": v["id"], "type": v["native"]["type"]}
        for k in ("kpi1", "kpi2"):
            F.find_visual(base, k)["rect"]["y"] += 80
            F.find_visual(base, k)["title"] = "Karte"          # Export: Label statt leer
        F.find_visual(base, "col1")["pbir"].update({"lossy": True, "unmapped": ["Tooltips"]})
        (self.p.mk / "baseline-spec.json").write_text(
            json.dumps(base, ensure_ascii=False), encoding="utf-8")
        # danach im Kitchen geaendert
        spec = json.loads(json.dumps(base))
        spec["meta"].update({"specHash": "h2", "exportedAt": "2026-09-28T15:05:00.000+02:00"})
        F.find_visual(spec, "kpi1")["rect"].update({"x": 500, "y": 200})
        col1 = F.find_visual(spec, "col1")
        col1["rect"].update({"x": 1100, "y": 500})
        col1["title"] = "Neuer Titel"
        col1["native"]["buckets"]["Y"] = [F.bucket("_Measures.AC")]
        before = self.p.report_hash()
        rc, out, st = self.p.deploy(spec, 2)
        self.assertApplied(rc, out, st)
        plan_msg = [s["msg"] for s in st["steps"] if s["id"] == "plan"][0]
        self.assertIn("baseline-spec.json", plan_msg)
        self.assertEqual(set(st["visuals"]), {"kpi1", "col1"})
        # Gruppe: absolute Kitchen-Position (500,200) -> relativ zur Gruppe (500,120)
        pos = self.p.visual("mk_kpi1")["position"]
        self.assertEqual((pos["x"], pos["y"]), (500, 120))
        self.assertIn("Gruppe", st["visuals"]["kpi1"]["msg"])
        # lossy: nur Position/Groesse, weder Titel noch Bindung
        col = self.p.visual("mk_col1")
        self.assertEqual((col["position"]["x"], col["position"]["y"]), (1100, 500))
        col_json = json.dumps(col, ensure_ascii=False)
        self.assertNotIn("Neuer Titel", col_json)
        self.assertIn("_Measures.Umsatz", col_json)
        self.assertNotIn("_Measures.AC", col_json)
        # kpi2: Titel "Karte" nur aus dem Export, unveraendert -> nicht angefasst
        after = self.p.report_hash()
        kpi2_files = [k for k in after if "/mk_kpi2/" in k]
        self.assertTrue(kpi2_files)
        self.assertTrue(all(before[k] == after[k] for k in kpi2_files))
        self.assertNotIn('"Karte"', json.dumps(self.p.visual("mk_kpi2"), ensure_ascii=False))
        self.assertFieldsClean()

    # 13 · ChartKitchen ------------------------------------------------- #
    def ck_spec(self, h, only=None):
        spec = F.base_spec(h)
        tiles = [
            F.ck_columns("ck1", "Übersicht", "AC (IBCS)", "DimDate.MonthName",
                         "_Measures.AC", 1420, 96),
            # Referenzen in der Reihenfolge PY, PL: Zuordnung nach Namen, nicht Position
            F.ck_bars("ckb", "Übersicht", "AC je Region", "DimRegion.Region",
                      "_Measures.AC", ["_Measures.PY", "_Measures.PL"], 760, 300),
            F.ck_varint("ckv", "Übersicht", "AC vs. PL je Monat", "DimDate.MonthName",
                        "_Measures.AC", "_Measures.PL", 1400, 300, w=480),
        ]
        spec["pages"][0]["visuals"] += [t for t in tiles
                                        if only is None or t["stableId"] in only]
        return spec

    @staticmethod
    def qs(vj):
        return {role: [(list(p["field"])[0], p["queryRef"], p.get("active"))
                       for p in st["projections"]]
                for role, st in vj["visual"]["query"]["queryState"].items()}

    @staticmethod
    def ibcs(vj):
        return {k: v["expr"]["Literal"]["Value"] for k, v in
                vj["visual"]["objects"]["ibcsTitle"][0]["properties"].items()}

    @staticmethod
    def chart(vj):
        return {k: v["expr"]["Literal"]["Value"] for k, v in
                vj["visual"]["objects"]["chart"][0]["properties"].items()}

    def test_ck_resync_after_converter_mapping_change(self):
        """Kachel im Kitchen unverändert, aber der Konverter bildet sie anders ab (oder der
        Stand stammt von einem Runner ohne Fingerabdruck): Slot-Objekte werden erneut
        eingemischt, Desktop-eigene Eigenschaften bleiben."""
        self.p.add_ck_reference()
        rc, out, st = self.p.deploy(self.ck_spec("h1"), 1)
        self.assertApplied(rc, out, st)
        page = self.p.pages()["Übersicht"]
        hashes = self.p.mk / ".state" / "ck-objects.json"
        self.assertTrue(json.loads(hashes.read_text(encoding="utf-8")).get("ckb"))
        path = self.p.report / "definition" / "pages" / page / "visuals" / "mk_ckb" / "visual.json"
        vj = json.loads(path.read_text(encoding="utf-8"))
        props = vj["visual"]["objects"]["chart"][0]["properties"]
        slot_val = props.get("orientation")
        props["orientation"] = {"expr": {"Literal": {"Value": "'columns'"}}}   # veraltet
        props["onlyInDesktop"] = {"expr": {"Literal": {"Value": "true"}}}
        path.write_text(json.dumps(vj, indent=2), encoding="utf-8")
        h = json.loads(hashes.read_text(encoding="utf-8"))
        h["ckb"] = "alte-abbildung"
        hashes.write_text(json.dumps(h), encoding="utf-8")
        rc, out, st = self.p.deploy(self.ck_spec("h2"), 2)
        self.assertApplied(rc, out, st)
        self.assertIn("ckb", st["visuals"])
        kb = self.p.visual("mk_ckb", page)
        self.assertEqual(kb["visual"]["objects"]["chart"][0]["properties"]["orientation"],
                         slot_val)
        self.assertEqual(self.chart(kb)["onlyInDesktop"], "true")
        self.assertNotEqual(json.loads(hashes.read_text(encoding="utf-8"))["ckb"],
                            "alte-abbildung")

    def test_ck_replicate_reference(self):
        self.p.add_ck_reference()
        ref_before = self.p.ck_ref_hash()
        rc, out, st = self.p.deploy(self.ck_spec("h1"), 1)
        self.assertApplied(rc, out, st)
        page = self.p.pages()["Übersicht"]
        names = self.p.visual_names(page)
        for k in ("ck1", "ckb", "ckv"):
            self.assertEqual(st["visuals"][k]["state"], "applied", st["visuals"][k])
            # ChartKitchen ist (über die Referenz-Instanz) installiert: frisch aus dem Slot
            self.assertIn("ChartKitchen angelegt", st["visuals"][k]["msg"])
            self.assertIn("mk_" + k, names)
            self.assertNotIn("mk_%s_slot" % k, names)
            vj = self.p.visual("mk_" + k, page)
            self.assertEqual(vj["visual"]["visualType"], LR.CK_GUID)
            self.assertEqual(vj["$schema"], LR.CK_SCHEMA)        # bekannte Version
            self.assertEqual(vj["name"], "mk_" + k)
        # Säulen: Monat + AC, Modus columns, Position und Titel aus der Kachel,
        # Einstellungen (objects) und Container fertig aus dem Konverter-Slot
        k1 = self.p.visual("mk_ck1", page)
        self.assertEqual(self.qs(k1), {"category": [("Column", "DimDate.MonthName", True)],
                                       "actual": [("Measure", "_Measures.AC", None)]})
        self.assertEqual(self.chart(k1)["orientation"], "'columns'")
        self.assertEqual(self.chart(k1)["chartButtons"], "false")
        self.assertEqual(k1["position"], {"x": 1420, "y": 96, "z": 10, "width": 320,
                                          "height": 180, "tabOrder": 0})
        title = k1["visual"]["visualContainerObjects"]["title"][0]["properties"]
        self.assertEqual(title["text"]["expr"]["Literal"]["Value"], "'AC (IBCS)'")
        # Kopf: der Konverter zeigt ihn als Container-Titel, der IBCS-Kopf ist aus (ohne
        # Botschaft), kpi bleibt als Text für den Auswahlbereich
        self.assertEqual(title["show"]["expr"]["Literal"]["Value"], "true")
        self.assertEqual(self.ibcs(k1)["kpi"], "'AC (IBCS)'")
        self.assertEqual(self.ibcs(k1)["show"], "false")
        # bars: Kategorie (aktiv) + AC; Referenzen [PY, PL] nach Szenario zugeordnet
        kb = self.p.visual("mk_ckb", page)
        self.assertEqual(self.qs(kb), {
            "category": [("Column", "DimRegion.Region", True)],
            "actual": [("Measure", "_Measures.AC", None)],
            "previousYear": [("Measure", "_Measures.PY", None)],
            "plan": [("Measure", "_Measures.PL", None)]})
        self.assertEqual(self.chart(kb)["orientation"], "'bars'")
        # varint: Monat, AC, PL, integrierte Bruecke
        kv = self.p.visual("mk_ckv", page)
        self.assertEqual(self.qs(kv), {
            "category": [("Column", "DimDate.MonthName", True)],
            "actual": [("Measure", "_Measures.AC", None)],
            "plan": [("Measure", "_Measures.PL", None)]})
        self.assertEqual(self.chart(kv)["orientation"], "'intwaterfall'")
        # Referenz-Instanz unberuehrt, eigene Visuals protokolliert
        self.assertEqual(ref_before, self.p.ck_ref_hash())
        rec = self.p.created()[page]
        self.assertEqual(rec["mk_ckb"], {"key": "ckb", "cat": "ck", "type": LR.CK_GUID})
        self.assertFalse(any("Platzhalter" in t["text"] for t in st["todos"]))
        self.assertFieldsClean()

        # --- In Desktop formatiert und gespeichert (hier: direkt in visual.json) --- #
        path = Path(glob.glob(str(self.p.report / "definition" / "pages" / page /
                                  "visuals" / "mk_ckb" / "visual.json"))[0])
        vj = json.loads(path.read_text(encoding="utf-8"))
        labels = [{"properties": {"fontPreset": {"expr": {"Literal": {"Value": "'fullhd'"}}},
                                  "labelDensity": {"expr": {"Literal": {"Value": "3D"}}}}}]
        vj["visual"]["objects"]["labels"] = labels
        vj["visual"]["objects"]["chart"][0]["properties"]["comparisonMode"] = {
            "expr": {"Literal": {"Value": "'py'"}}}
        path.write_text(json.dumps(vj, indent=2), encoding="utf-8")
        before = self.p.report_hash()
        # --- Kitchen: ckb verschoben und umbenannt ------------------------------ #
        spec = self.ck_spec("h2")
        F.find_visual(spec, "ckb")["rect"].update({"x": 800, "y": 700})
        F.find_visual(spec, "ckb")["title"] = "AC je Region (neu)"
        rc, out, st = self.p.deploy(spec, 2)
        self.assertApplied(rc, out, st)
        self.assertEqual(set(st["visuals"]), {"ckb"})
        self.assertEqual(st["visuals"]["ckb"]["state"], "applied", st["visuals"]["ckb"])
        self.assertIn("Titel", st["visuals"]["ckb"]["msg"])
        after = self.p.report_hash()
        changed = {k for k in set(before) | set(after) if before.get(k) != after.get(k)}
        self.assertEqual({c.split("/visuals/")[1].split("/")[0] for c in changed},
                         {"mk_ckb"}, changed)
        kb = self.p.visual("mk_ckb", page)
        self.assertEqual((kb["position"]["x"], kb["position"]["y"]), (800, 700))
        self.assertEqual(kb["visual"]["visualContainerObjects"]["title"][0]["properties"]
                         ["text"]["expr"]["Literal"]["Value"], "'AC je Region (neu)'")
        # nur Titel und Lage geändert: Desktop-Formatierung bleibt ganz
        self.assertEqual(kb["visual"]["objects"]["labels"], labels)
        self.assertEqual(self.chart(kb)["orientation"], "'bars'")
        self.assertEqual(self.chart(kb)["comparisonMode"], "'py'")
        self.assertEqual(self.qs(kb)["plan"], [("Measure", "_Measures.PL", None)])
        self.assertEqual(self.ibcs(kb)["kpi"], "'AC je Region (neu)'")
        # --- Kitchen: Typ gewechselt (bars -> columns) ------------------------- #
        spec = json.loads(json.dumps(spec))
        spec["meta"]["specHash"] = "h3"
        F.find_visual(spec, "ckb")["kind"] = "columns"
        rc, out, st = self.p.deploy(spec, 3)
        self.assertApplied(rc, out, st)
        kb = self.p.visual("mk_ckb", page)
        # Kitchen geändert: Slot-Einstellungen gewinnen (Deploy ist führend), was nur in
        # Desktop gesetzt war und der Slot nicht kennt, bleibt
        slot = [s for f in (self.p.mk / "out").glob("*/chartkitchen-slots.json")
                for s in json.loads(f.read_text(encoding="utf-8")) if s["stableId"] == "ckb"][0]
        self.assertEqual(self.chart(kb)["orientation"], "'columns'")
        want_cm = slot["objects"]["chart"][0]["properties"]["comparisonMode"]
        self.assertEqual(kb["visual"]["objects"]["chart"][0]["properties"]["comparisonMode"],
                         want_cm)
        lp = kb["visual"]["objects"]["labels"][0]["properties"]
        self.assertEqual(lp["labelDensity"], labels[0]["properties"]["labelDensity"])
        self.assertEqual(lp["fontPreset"], slot["objects"]["labels"][0]["properties"]["fontPreset"])
        self.assertEqual(self.p.ck_ref_hash(), ref_before)
        self.assertFieldsClean()

    def test_ck_reference_fallback_without_package(self):
        """Referenz-Instanz, aber kein Paket im Bericht (z. B. Organisations-Visual): dann
        und nur dann wird die Referenz repliziert ($schema aus der Referenz)."""
        self.p.add_ck_reference()
        shutil.rmtree(self.p.report / "CustomVisuals" / LR.CK_GUID)
        rj = self.p.report / "definition" / "report.json"
        rep = json.loads(rj.read_text(encoding="utf-8"))
        rep["resourcePackages"] = [r for r in rep["resourcePackages"]
                                   if r.get("name") != LR.CK_GUID]
        rj.write_text(json.dumps(rep, indent=2), encoding="utf-8")
        self.p.protected = self.p.protected_hashes()
        ref_schema = json.loads((CK_FIXTURE / "pages" / CK_REF_PAGE / "visuals" /
                                 CK_REF_VISUAL / "visual.json")
                                .read_text(encoding="utf-8"))["$schema"]
        rc, out, st = self.p.deploy(self.ck_spec("h1", only={"ckb"}), 1)
        self.assertApplied(rc, out, st)
        self.assertIn("ChartKitchen repliziert", st["visuals"]["ckb"]["msg"])
        kb = self.p.visual("mk_ckb", self.p.pages()["Übersicht"])
        self.assertEqual(kb["$schema"], ref_schema)
        self.assertEqual(kb["visual"]["visualType"], LR.CK_GUID)
        self.assertEqual(self.chart(kb)["orientation"], "'bars'")

    def test_ck_replaces_own_substitutes(self):
        # Deploy 1 ohne Referenz (Standard --ck-fallback): ck1 als natives Ersatzvisual,
        # ckv (kein natives Gegenstueck) als Platzhalter
        spec = self.ck_spec("h1", only={"ck1", "ckv"})
        rc, out, st = self.p.deploy(spec, 1)
        self.assertApplied(rc, out, st)
        page = self.p.pages()["Übersicht"]
        self.assertEqual(self.p.visual("mk_ck1", page)["visual"]["visualType"],
                         "clusteredColumnChart")
        self.assertEqual(self.p.visual("mk_ckv_slot", page)["visual"]["visualType"], "shape")
        names_before = self.p.visual_names(page)
        before = self.p.report_hash()
        # aelterer Runner-Stand ohne Protokoll fuer den Platzhalter: Ableitung aus
        # last-applied-spec.json (ebenfalls .state) muss greifen
        cj = self.p.mk / ".state" / "created.json"
        rec = json.loads(cj.read_text(encoding="utf-8"))
        del rec[page]["mk_ckv_slot"]
        cj.write_text(json.dumps(rec), encoding="utf-8")
        # Referenz einsetzen, Kacheln im Kitchen unveraendert
        self.p.add_ck_reference()
        spec["meta"]["specHash"] = "h2"
        rc, out, st = self.p.deploy(spec, 2)
        self.assertApplied(rc, out, st)
        names = self.p.visual_names(page)
        self.assertEqual(names, (names_before - {"mk_ckv_slot"}) | {"mk_ckv"})
        for k in ("ck1", "ckv"):
            self.assertEqual(self.p.visual("mk_" + k, page)["visual"]["visualType"],
                             LR.CK_GUID)
            self.assertEqual(st["visuals"][k]["state"], "applied", st["visuals"][k])
        self.assertEqual(st["visuals"]["ck1"]["replaced"], ["mk_ck1"])
        self.assertEqual(st["visuals"]["ckv"]["replaced"], ["mk_ckv_slot"])
        self.assertEqual(set(st["visuals"]), {"ck1", "ckv"})
        # sonst nichts angefasst
        after = self.p.report_hash()
        changed = {k.split("/visuals/")[1].split("/")[0] for k in set(before) | set(after)
                   if "/visuals/" in k and before.get(k) != after.get(k)
                   and "/%s/" % CK_REF_PAGE not in k}
        self.assertEqual(changed, {"mk_ck1", "mk_ckv", "mk_ckv_slot"})
        rec = self.p.created()[page]
        self.assertNotIn("mk_ckv_slot", rec)
        self.assertEqual(rec["mk_ckv"]["type"], LR.CK_GUID)
        self.assertEqual(rec["mk_ck1"]["type"], LR.CK_GUID)
        self.assertFieldsClean()

    def test_ck_foreign_visual_never_replaced(self):
        """Ein Visual, das der Runner nicht angelegt hat, wird nie entfernt."""
        self.p.add_ck_reference()
        rep = self.p.report.as_posix()
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1)
        self.assertApplied(rc, out, st)
        page = self.p.pages()["Übersicht"]
        # jemand legt in Desktop ein Visual mit dem Namen der spaeteren Kachel an
        rc2, o2 = self.p.pbir("add", "visual", "shape", "%s/Übersicht.Page" % rep,
                              "-n", "mk_ck1", "-x", 0, "-y", 0, "-w", 100, "-h", 100)
        self.assertEqual(rc2, 0, o2)
        rc, out, st = self.p.deploy(self.ck_spec("h2", only={"ck1", "ckb"}), 2)
        self.assertApplied(rc, out, st)
        self.assertEqual(st["visuals"]["ck1"]["state"], "error", st["visuals"]["ck1"])
        self.assertEqual(self.p.visual("mk_ck1", page)["visual"]["visualType"], "shape")
        self.assertEqual(st["visuals"]["ckb"]["state"], "applied")
        self.assertEqual(self.p.visual("mk_ckb", page)["visual"]["visualType"], LR.CK_GUID)

    def test_ck_without_reference(self):
        # Standard (--ck-fallback): natives Ersatzvisual, wo es eins gibt
        rc, out, st = self.p.deploy(self.ck_spec("h1"), 1)
        self.assertApplied(rc, out, st)
        page = self.p.pages()["Übersicht"]
        self.assertEqual(self.p.visual("mk_ck1", page)["visual"]["visualType"],
                         "clusteredColumnChart")
        self.assertEqual(self.p.visual("mk_ckb", page)["visual"]["visualType"],
                         "clusteredBarChart")
        self.assertEqual(st["visuals"]["ck1"]["state"], "applied")
        # varint hat kein natives Ersatzvisual: neutraler Platzhalter
        self.assertEqual(self.p.visual("mk_ckv_slot", page)["visual"]["visualType"], "shape")
        self.assertEqual(st["visuals"]["ckv"]["state"], "warn")
        self.assertFalse(any(self.p.visual(n, page)["visual"]["visualType"] == LR.CK_GUID
                             for n in self.p.visual_names(page)))
        self.assertFieldsClean()
        # --no-ck-fallback: nur Platzhalter
        q = Project()
        try:
            rc, out, st = q.deploy(self.ck_spec("h1"), 1, "--no-ck-fallback")
            self.assertApplied(rc, out, st)
            qp = q.pages()["Übersicht"]
            names = q.visual_names(qp)
            for k in ("ck1", "ckb", "ckv"):
                self.assertIn("mk_%s_slot" % k, names)
                self.assertNotIn("mk_" + k, names)
                self.assertEqual(st["visuals"][k]["state"], "warn")
        finally:
            q.cleanup()

    # 11 ----------------------------------------------------------------- #
    def test_no_bridge_mode(self):
        self.p.set_bridge(mode="not_connected")
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1, "--no-bridge")
        self.assertApplied(rc, out, st)
        states = {s["id"]: s["state"] for s in st["steps"]}
        self.assertEqual((states["bridge"], states["reload"], states["shots"]),
                         ("skipped", "skipped", "skipped"))
        self.assertEqual(self.p.calls(), [])
        self.assertFalse(st["desktop"]["reloaded"])

    # 12 ----------------------------------------------------------------- #
    def test_watch_mode(self):
        argv = [sys.executable, str(RUNNER), "watch", str(self.p.root),
                "--bridge-cmd", str(SHIM)]
        proc = subprocess.Popen(argv, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                text=True, encoding="utf-8", errors="replace",
                                env=self.p.env())
        try:
            deadline = time.time() + 20
            while time.time() < deadline and not self.p.status():
                time.sleep(0.2)
            st = self.p.status()
            self.assertEqual((st.get("state"), st["runner"]["state"]), ("idle", "idle"))
            hb0 = st["runner"]["heartbeatAt"]
            self.p.deploy_files(F.base_spec("h1"), 1)
            deadline = time.time() + 300
            while time.time() < deadline:
                st = self.p.status()
                if st.get("seq") == 1 and st.get("state") in LR.TERMINAL:
                    break
                time.sleep(0.5)
            self.assertEqual(st.get("state"), "applied", st)
            time.sleep(LR.HEARTBEAT_S + 1.5)
            st2 = self.p.status()
            self.assertNotEqual(st2["runner"]["heartbeatAt"], hb0)
            self.assertEqual((st2["state"], st2["seq"], st2["runner"]["state"]),
                             ("applied", 1, "idle"))
            # dieselbe seq noch einmal schreiben: kein zweiter Lauf
            n = len(self.p.calls())
            self.p.deploy_files(F.base_spec("h1"), 1)
            time.sleep(2)
            self.assertEqual(n, len(self.p.calls()))
        finally:
            proc.terminate()
            out = proc.communicate(timeout=30)[0]
        lines = [l for l in out.splitlines() if l.strip()]
        self.assertTrue(any("Deploy 1 gestartet" in l for l in lines), out)
        self.assertTrue(any("=> applied" in l for l in lines), out)


# --------------------------------------------------------------------------- #
# Agent-Modus v2: Bildvergleich (ohne pbir)
# --------------------------------------------------------------------------- #
import tile_compare as TC  # noqa: E402

KPI_GUID = "ibcsKpiCard2771CF65D0C343A19EAB34E43D7B8682"
FAKE_CLOSE = HERE / "fake_close.py"
FAKE_PBIR = HERE / "fake_pbir.py"
FAKE_TE = HERE / "fake_te.py"


def draw_page(w, h, tiles, page_bg=244):
    """Synthetische Seite (Graustufen): je Kachel Fläche, Rahmen, optional Titel-„Text"
    und Balken. tiles: [{rect, bg, title, bars, ink}]"""
    px = bytearray([page_bg]) * (w * h)

    def fill(x0, y0, x1, y1, v):
        x0, y0 = max(0, int(x0)), max(0, int(y0))
        x1, y1 = min(w, int(x1)), min(h, int(y1))
        for y in range(y0, y1):
            px[y * w + x0:y * w + x1] = bytes([v]) * (x1 - x0)
    for t in tiles:
        r = t["rect"]
        x, y, tw, th = r["x"], r["y"], r["w"], r["h"]
        bg, ink = t.get("bg", 255), t.get("ink", 40)
        fill(x, y, x + tw, y + th, 220)
        fill(x + 1, y + 1, x + tw - 1, y + th - 1, bg)
        if t.get("title"):
            for i in range(8):                                 # Buchstabenblöcke
                fill(x + 14 + i * 14, y + 12, x + 24 + i * 14, y + 26, ink)
        if t.get("hbars"):                                     # liegende Balken
            lengths = t.get("heights") or [0.3, 0.6, 0.45, 0.8, 0.55, 0.7]
            bh = (th - 90) / (2 * len(lengths))
            for i, f in enumerate(lengths):
                by = y + 60 + i * 2 * bh
                fill(x + 30, by, x + 30 + f * (tw - 60), by + bh, t.get("bar", 64))
        if t.get("bars"):
            heights = t.get("heights") or [0.3, 0.6, 0.45, 0.8, 0.55, 0.7]
            bw = (tw - 60) / (2 * len(heights))
            base = y + th - 30
            for i, f in enumerate(heights):
                bx = x + 30 + i * 2 * bw
                fill(bx, base - f * (th - 90), bx + bw, base, t.get("bar", 64))
    return px


def write_page_png(path, w, h, tiles, scale=1, page_bg=244):
    if scale == 1:
        TC.write_gray_png(path, w, h, draw_page(w, h, tiles, page_bg))
        return
    big = [dict(t, rect={k: v * scale for k, v in t["rect"].items()}) for t in tiles]
    TC.write_gray_png(path, w * scale, h * scale, draw_page(w * scale, h * scale, big, page_bg))


class CompareTests(unittest.TestCase):
    W, H = 800, 450
    RECT = {"x": 40, "y": 60, "w": 360, "h": 300}

    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix="mk-cmp-"))

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def run_cmp(self, kitchen, desktop, scale=1, tile=None):
        k, d = self.tmp / "k.png", self.tmp / "d.png"
        write_page_png(k, self.W, self.H, kitchen)
        write_page_png(d, self.W, self.H, desktop, scale=scale)
        tile = tile or {"page": "S", "rect": self.RECT, "headH": 36, "title": "Umsatz",
                        "body": {"x": 50, "y": 100, "w": 340, "h": 230}}
        return TC.compare_page(k, d, self.W, self.H, {"t1": tile})["tiles"]["t1"]

    def tile(self, **kw):
        t = {"rect": self.RECT, "title": True, "bars": True}
        t.update(kw)
        return t

    def test_identical_is_green(self):
        r = self.run_cmp([self.tile()], [self.tile()])
        self.assertGreaterEqual(r["score"], 0.95, r)
        self.assertEqual(r["notes"], [])

    def test_other_data_same_structure_stays_high(self):
        r = self.run_cmp([self.tile()], [self.tile(heights=[0.5, 0.4, 0.7, 0.6, 0.35, 0.8])])
        self.assertGreaterEqual(r["score"], 0.8, r)

    def test_scaled_screenshot(self):
        # Desktop-Bild mit --scale 2: gleiche Kachel, doppelte Pixel (die Testzeichnung
        # skaliert Ränder und Schrift nicht mit, daher nicht ganz identisch)
        r = self.run_cmp([self.tile()], [self.tile()], scale=2)
        self.assertGreaterEqual(r["score"], 0.9, r)
        self.assertEqual(r["notes"], [])

    def test_empty_tile(self):
        r = self.run_cmp([self.tile()], [self.tile(title=False, bars=False)])
        self.assertTrue(any("Fläche leer" in n for n in r["notes"]), r)
        self.assertLessEqual(r["score"], 0.4)

    def test_missing_title(self):
        r = self.run_cmp([self.tile()], [self.tile(title=False)])
        self.assertIn("Titel fehlt in Desktop", r["notes"])
        self.assertLess(r["score"], 0.9)
        r = self.run_cmp([self.tile(title=False)], [self.tile()],
                         tile={"page": "S", "rect": self.RECT, "headH": 0, "title": ""})
        self.assertIn("Desktop zeigt einen Titel, das Kitchen nicht", r["notes"])

    def test_dark_background_and_structure(self):
        r = self.run_cmp([self.tile()], [self.tile(bg=30, ink=230, bar=200)])
        self.assertTrue(any("Kachelhintergrund" in n for n in r["notes"]), r)
        r = self.run_cmp([self.tile()], [self.tile(heights=[0.05, 0.05, 0.05, 0.95, 0.95,
                                                            0.95])])
        self.assertLess(r["metrics"]["struct"], 0.95)

    def test_tile_outside_image(self):
        tile = {"page": "S", "rect": {"x": 900, "y": 500, "w": 100, "h": 100}}
        r = self.run_cmp([self.tile()], [self.tile()], tile=tile)
        self.assertEqual(r["score"], 0.0)

    def test_stdlib_decoder_matches_pillow(self):
        if not TC.have_pillow():
            self.skipTest("Pillow fehlt")
        from PIL import Image
        import random
        rnd = random.Random(7)
        im = Image.new("RGB", (97, 61), (250, 248, 240))
        for _ in range(60):
            x, y = rnd.randrange(90), rnd.randrange(55)
            im.paste((rnd.randrange(256), rnd.randrange(256), rnd.randrange(256)),
                     (x, y, x + rnd.randrange(1, 12), y + rnd.randrange(1, 8)))
        p = self.tmp / "rgb.png"
        im.save(p, optimize=True)                 # adaptive Filter (Sub/Up/Avg/Paeth)
        rgba = self.tmp / "rgba.png"
        im.convert("RGBA").save(rgba)
        for path in (p, rgba):
            a = TC.read_gray(path, prefer_pillow=True)
            b = TC.read_gray(path, prefer_pillow=False)
            self.assertEqual((a.w, a.h, b.decoder), (b.w, b.h, "stdlib"))
            worst = max(abs(x - y) for x, y in zip(a.px, b.px))
            self.assertLessEqual(worst, 1, path.name)

    def test_full_hd_page_is_fast(self):
        tiles = [{"rect": {"x": 15 + 470 * (i % 4), "y": 99 + 470 * (i // 4), "w": 450,
                           "h": 450}, "title": True, "bars": True} for i in range(8)]
        k, d = self.tmp / "k.png", self.tmp / "d.png"
        write_page_png(k, 1920, 1080, tiles)
        write_page_png(d, 1920, 1080, tiles)
        tj = {"t%d" % i: {"page": "S", "rect": t["rect"], "headH": 36, "title": "x"}
              for i, t in enumerate(tiles)}
        t0 = time.time()
        out = TC.compare_page(k, d, 1920, 1080, tj)
        dt = time.time() - t0
        if TC.have_pillow():
            self.assertLess(dt, 2.0, "Vergleich dauerte %.2f s" % dt)
        self.assertTrue(all(r["score"] >= 0.95 for r in out["tiles"].values()), out)

    def test_columns_vs_horizontal_bars_flagged(self):
        # andere Daten sind erlaubt, eine andere Diagrammform nicht
        r = self.run_cmp([self.tile()], [self.tile(bars=False, hbars=True)])
        self.assertLess(r["score"], 0.7, r)
        self.assertTrue(any("andere Diagrammform" in n for n in r["notes"]), r)
        self.assertLess(r["metrics"]["shape"], 0.4)

    def test_more_categories_same_form_tolerated(self):
        # Kitchen zeichnet 6 Beispielsäulen, Desktop 12 echte: gleiche Form, hoher Score
        r = self.run_cmp([self.tile()], [self.tile(heights=[0.5, 0.4, 0.7, 0.6, 0.35, 0.8,
                                                            0.55, 0.45, 0.65, 0.3, 0.5, 0.6])])
        self.assertGreaterEqual(r["score"], 0.85, r)
        self.assertFalse(any("Diagrammform" in n for n in r["notes"]), r)


# --------------------------------------------------------------------------- #
# Seitenfläche im Desktop-Bild (Berichtsansicht mit Hintergrund und Filterbereich)
# --------------------------------------------------------------------------- #
DESKTOP_FIX = HERE / "fixtures" / "desktop-shots"
REAL_BOX = [0, 114, 1016, 685]          # Seitenfläche in beiden echten 1317x798-Bildern


def desktop_view(page_px, pw, ph, vw, vh, box, bg, pane=0, shadow=0, shadow_end=None):
    """Synthetische Berichtsansicht: Arbeitsflächen-Hintergrund bg, Seite (page_px, pw x ph)
    per nächstem Nachbarn in box=(x0, y0, x1, y1) skaliert, Schlagschatten der Breite
    `shadow` (Verlauf von bg nach shadow_end), rechts ein Filterbereich der Breite pane."""
    px = bytearray([bg]) * (vw * vh)

    def rect(x0, y0, x1, y1, v):
        x0, y0, x1, y1 = max(0, x0), max(0, y0), min(vw, x1), min(vh, y1)
        for y in range(y0, y1):
            px[y * vw + x0:y * vw + x1] = bytes([v]) * max(0, x1 - x0)
    x0, y0, x1, y1 = box
    for k in range(shadow, 0, -1):          # außen nah am Hintergrund, innen kräftiger
        v = int(round(bg + (shadow_end - bg) * (shadow - k + 1) / float(shadow)))
        rect(x0 - k, y0 - k, x1 + k, y1 + k, v)
    bw, bh = x1 - x0, y1 - y0
    xs = [min(pw - 1, int((i + 0.5) * pw / bw)) for i in range(bw)]
    for j in range(bh):
        y = y0 + j
        if not 0 <= y < vh:
            continue
        sy = min(ph - 1, int((j + 0.5) * ph / bh))
        row = page_px[sy * pw:(sy + 1) * pw]
        line = bytes(map(row.__getitem__, xs))
        a, b = max(0, x0), min(vw, x1)
        px[y * vw + a:y * vw + b] = line[a - x0:b - x0]
    if pane:
        rect(vw - pane, 0, vw, vh, 244)
        rect(vw - pane, 0, vw - pane + 1, vh, 179)
        for i in range(6):                                     # etwas „Text" im Bereich
            rect(vw - pane + 20, 30 + i * 60, vw - pane + 20 + 120, 30 + i * 60 + 14, 40)
    return bytes(px)


class CanvasTests(unittest.TestCase):
    PW, PH = 1920, 1080
    TILES = [{"rect": {"x": 15 + 950 * (i % 2), "y": 99 + 470 * (i // 2), "w": 930, "h": 450},
              "title": True, "bars": i != 1, "hbars": i == 1} for i in range(4)]

    @classmethod
    def setUpClass(cls):
        cls.page = bytes(draw_page(cls.PW, cls.PH, cls.TILES))
        cls.tj = {"t%d" % i: {"page": "S", "rect": t["rect"], "headH": 36, "title": "x",
                              "body": {"x": t["rect"]["x"] + 12, "y": t["rect"]["y"] + 44,
                                       "w": t["rect"]["w"] - 24, "h": t["rect"]["h"] - 60}}
                  for i, t in enumerate(cls.TILES)}

    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix="mk-canvas-"))

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def view(self, vw, vh, box, **kw):
        return TC.Gray(vw, vh, desktop_view(self.page, self.PW, self.PH, vw, vh, box, **kw), "t")

    def assertBox(self, got, want, tol=1):
        self.assertIsNotNone(got)
        self.assertTrue(all(abs(a - b) <= tol for a, b in zip(got, want)), (got, want))

    # --- echte Desktop-Bilder ------------------------------------------------- #
    def test_real_dark_shot_with_filter_pane(self):
        img = TC.read_gray(DESKTOP_FIX / "dark-filterpane.png")
        c = TC.find_canvas(img, self.PW, self.PH)
        self.assertTrue(c["ok"], c)
        self.assertEqual(c["how"], "erkannt")
        self.assertBox(c["box"], REAL_BOX)
        self.assertLess(c["bg"], 60)                            # dunkles Navy
        self.assertEqual(c["pane"], 1016)

    def test_real_light_shot_with_filter_pane(self):
        img = TC.read_gray(DESKTOP_FIX / "light-filterpane.png")
        c = TC.find_canvas(img, self.PW, self.PH)
        self.assertTrue(c["ok"], c)
        self.assertBox(c["box"], REAL_BOX)
        self.assertGreater(c["bg"], 200)                        # helles Grau

    def test_real_page_compare(self):
        """Echter Lauf (MockupLive-Demo): drei Diagramme mit echten statt Beispieldaten bleiben
        grün, die KPI-Kachel (anderes Visual, kein Titelband) fällt auf."""
        tj = json.loads((DESKTOP_FIX / "tiles.json").read_text(encoding="utf-8"))
        pg = tj["pages"][0]
        out = TC.compare_page(DESKTOP_FIX / "kitchen.png", DESKTOP_FIX / "dark-filterpane.png",
                              pg["width"], pg["height"], tj["tiles"])
        self.assertTrue(out["ok"], out)
        self.assertBox(out["canvas"]["box"], REAL_BOX)
        by_kind = {tj["tiles"][k]["kind"]: r for k, r in out["tiles"].items()}
        for kind in ("kombi", "bars", "wfint"):
            self.assertGreaterEqual(by_kind[kind]["score"], 0.9, (kind, by_kind[kind]))
            self.assertEqual(by_kind[kind]["notes"], [], kind)
        kpi = by_kind["kpi"]
        self.assertLess(kpi["score"], 0.5, kpi)
        self.assertIn("Titel fehlt in Desktop", kpi["notes"])

    def test_real_page_compare_stdlib(self):
        tj = json.loads((DESKTOP_FIX / "tiles.json").read_text(encoding="utf-8"))
        pg = tj["pages"][0]
        out = TC.compare_page(DESKTOP_FIX / "kitchen.png", DESKTOP_FIX / "dark-filterpane.png",
                              pg["width"], pg["height"], tj["tiles"], prefer_pillow=False)
        self.assertTrue(out["ok"], out)
        self.assertBox(out["canvas"]["box"], REAL_BOX)
        for k, r in out["tiles"].items():
            if tj["tiles"][k]["kind"] != "kpi":
                self.assertGreaterEqual(r["score"], 0.9, (k, r))

    # --- synthetische Varianten ----------------------------------------------- #
    def test_dark_fit_to_width_with_pane_and_shadow(self):
        box = (0, 114, 1016, 685)
        img = self.view(1317, 798, box, bg=28, pane=300, shadow=14, shadow_end=76)
        c = TC.find_canvas(img, self.PW, self.PH)
        self.assertTrue(c["ok"], c)
        self.assertBox(c["box"], box)

    def test_light_fit_to_page_centered_without_pane(self):
        box = (131, 30, 1269, 670)                    # 1138 x 640, links/rechts Rand
        img = self.view(1400, 700, box, bg=229, shadow=6, shadow_end=222)
        c = TC.find_canvas(img, self.PW, self.PH)
        self.assertTrue(c["ok"], c)
        self.assertBox(c["box"], box)
        self.assertIsNone(c["pane"])

    def test_dark_centered_with_light_shadow_and_collapsed_pane(self):
        box = (60, 40, 1060, 602)                     # 1000 x 562
        img = self.view(1150, 640, box, bg=28, pane=32, shadow=10, shadow_end=90)
        c = TC.find_canvas(img, self.PW, self.PH)
        self.assertTrue(c["ok"], c)
        self.assertBox(c["box"], box)

    def test_scale_2_shot(self):
        box = (0, 228, 2032, 1371)
        img = self.view(2634, 1596, box, bg=28, pane=600, shadow=20, shadow_end=76)
        c = TC.find_canvas(img, self.PW, self.PH)
        self.assertTrue(c["ok"], c)
        self.assertBox(c["box"], box, tol=2)

    def test_clipped_page_scores_visible_tiles_only(self):
        # Seite höher als die Ansicht (unten abgeschnitten): obere Kacheln werden verglichen,
        # untere nicht (Hinweis statt Score)
        img = self.view(1317, 500, (0, 114, 1016, 685), bg=28, pane=300, shadow=14,
                        shadow_end=76)
        c = TC.find_canvas(img, self.PW, self.PH)
        self.assertTrue(c["ok"], c)
        self.assertTrue(c["clipped"])
        self.assertBox(c["box"], (0, 114, 1016, 685))
        d = self.tmp / "d.png"
        TC.write_gray_png(d, img.w, img.h, img.px)
        k = self.tmp / "k.png"
        TC.write_gray_png(k, self.PW, self.PH, self.page)
        out = TC.compare_page(k, d, self.PW, self.PH, self.tj)
        self.assertTrue(out["ok"], out)
        self.assertEqual(sorted(out["tiles"]), ["t0", "t1"])
        self.assertEqual(sorted(out["hidden"]), ["t2", "t3"])
        self.assertTrue(all(r["score"] >= 0.9 for r in out["tiles"].values()), out)

    def test_mostly_hidden_page_is_not_scored(self):
        # weniger als 40 % der Seite sichtbar: kein Score, sondern Hinweis
        img = self.view(1317, 300, (0, 114, 1016, 685), bg=28, pane=300, shadow=14,
                        shadow_end=76)
        c = TC.find_canvas(img, self.PW, self.PH)
        self.assertFalse(c["ok"], c)
        d = self.tmp / "d.png"
        TC.write_gray_png(d, img.w, img.h, img.px)
        k = self.tmp / "k.png"
        TC.write_gray_png(k, self.PW, self.PH, self.page)
        out = TC.compare_page(k, d, self.PW, self.PH, self.tj)
        self.assertFalse(out["ok"])
        self.assertEqual(out["tiles"], {})
        self.assertIn("nicht sicher erkannt", out["note"])

    def test_no_uniform_background(self):
        import random
        rnd = random.Random(3)
        img = TC.Gray(900, 700, bytes(rnd.randrange(256) for _ in range(900 * 700)), "t")
        c = TC.find_canvas(img, self.PW, self.PH)
        self.assertFalse(c["ok"])
        self.assertIn("nicht", c["note"])

    def test_page_only_image_is_used_whole(self):
        img = TC.Gray(self.PW, self.PH, self.page, "t")
        c = TC.find_canvas(img, self.PW, self.PH)
        self.assertEqual((c["ok"], c["how"], c["box"]), (True, "voll", [0, 0, self.PW, self.PH]))

    def test_real_window_capture_clipped(self):
        """Späteres `pbir desktop screenshot`: ganzes Fenster (Titelleiste, Menüband, linke
        Navigation, Filterbereich), helle Arbeitsfläche #EAE8E1, Seite unten abgeschnitten."""
        img = TC.read_gray(DESKTOP_FIX / "window-clipped.png")
        c = TC.find_canvas(img, self.PW, self.PH)
        self.assertTrue(c["ok"], c)
        self.assertTrue(c["clipped"])
        self.assertBox(c["box"], [61, 354, 1077, 926])
        self.assertAlmostEqual(c["visible"], 0.776, delta=0.01)

    def test_real_clipped_page_compares_visible_tiles(self):
        tj = json.loads((DESKTOP_FIX / "tiles-8.json").read_text(encoding="utf-8"))
        out = TC.compare_page(DESKTOP_FIX / "kitchen.png", DESKTOP_FIX / "window-clipped.png",
                              1920, 1080, tj["tiles"])
        self.assertTrue(out["ok"], out)
        top = {k for k, t in tj["tiles"].items() if t["rect"]["y"] < 300}
        self.assertEqual(set(out["tiles"]), top)
        self.assertEqual(set(out["hidden"]), set(tj["tiles"]) - top)
        self.assertIn("abgeschnitten", out["note"])

    def test_real_blank_tiles_before_render(self):
        """Deploy 8: Bild direkt nach dem Reload zeigt die vier ChartKitchen-Kacheln leer,
        eine Minute später fertig gezeichnet."""
        tj = json.loads((DESKTOP_FIX / "tiles-8.json").read_text(encoding="utf-8"))
        frame, c = TC.page_frame(DESKTOP_FIX / "dark-blank-tiles.png", 1920, 1080)
        self.assertIsNotNone(frame, c)
        self.assertEqual(sorted(TC.blank_tiles(frame, 1920, 1080, tj["tiles"])),
                         sorted(tj["tiles"]))
        later, _ = TC.page_frame(DESKTOP_FIX / "dark-rendered.png", 1920, 1080)
        self.assertEqual(TC.blank_tiles(later, 1920, 1080, tj["tiles"]), [])
        self.assertFalse(TC.frames_equal(frame, later))
        self.assertTrue(TC.frames_equal(later, later))

    def test_light_window_with_ribbon_nav_and_clipped_page(self):
        # synthetisch: Titelleiste, Menüband, Navigation, helle Arbeitsfläche nah am Seiten-
        # hintergrund (232 gegen 244), Seite unten abgeschnitten
        vw, vh, box = 1317, 798, (61, 354, 1077, 926)
        px = bytearray(desktop_view(self.page, self.PW, self.PH, vw, vh, box, bg=232,
                                    pane=240, shadow=16, shadow_end=217))
        for y in range(vh):
            if y < 51:
                px[y * vw:(y + 1) * vw] = bytes([58]) * vw
            elif y < 240:
                px[y * vw:(y + 1) * vw] = bytes([250]) * vw
            else:
                px[y * vw:y * vw + 60] = bytes([242]) * 60
                px[y * vw + 60] = 223
        for i in range(8):                                     # Symbole im Menüband
            for y in range(90, 140):
                px[y * vw + 40 + i * 150:y * vw + 80 + i * 150] = bytes([90]) * 40
        c = TC.find_canvas(TC.Gray(vw, vh, bytes(px), "t"), self.PW, self.PH)
        self.assertTrue(c["ok"], c)
        self.assertTrue(c["clipped"])
        self.assertBox(c["box"], box)

    # --- Render abwarten ------------------------------------------------------ #
    def _frames(self, names):
        """Folge von Desktop-Bildern als Dateien: 'leer' (Kacheln ohne Diagramm), 'halb',
        'fertig'. -> capture()-Funktion, die sie nacheinander liefert (das letzte bleibt)."""
        tiles_blank = [dict(t, bars=False, hbars=False) for t in self.TILES]
        tiles_half = [dict(t, bars=t["bars"] and i < 2, hbars=t["hbars"] and i < 2)
                      for i, t in enumerate(self.TILES)]
        pages = {"leer": bytes(draw_page(self.PW, self.PH, tiles_blank)),
                 "halb": bytes(draw_page(self.PW, self.PH, tiles_half)),
                 "fertig": self.page}
        files = []
        for i, n in enumerate(names):
            v = desktop_view(pages[n], self.PW, self.PH, 1317, 798, (0, 114, 1016, 685),
                             bg=28, pane=300, shadow=14, shadow_end=76)
            p = self.tmp / ("f%d.png" % i)
            TC.write_gray_png(p, 1317, 798, v)
            files.append(p)
        state = {"i": 0}

        def capture():
            p = files[min(state["i"], len(files) - 1)]
            state["i"] += 1
            return str(p), None
        return capture

    def _clock(self):
        t = {"now": 0.0}
        return (lambda: t["now"]), (lambda s: t.__setitem__("now", t["now"] + s))

    def _spec_tiles(self):
        return {k: {"rect": v["rect"], "kind": "kombi"} for k, v in self.tj.items()}

    def test_wait_until_rendered_and_stable(self):
        clock, sleep = self._clock()
        res = TC.wait_for_render(self._frames(["leer", "leer", "halb", "fertig", "fertig"]),
                                 self.PW, self.PH, self._spec_tiles(), max_wait=20,
                                 interval=1.5, sleep=sleep, clock=clock)
        self.assertEqual(res["tries"], 5, res)
        self.assertTrue(res["stable"])
        self.assertEqual(res["blank"], [])
        self.assertAlmostEqual(res["waited"], 6.0)
        self.assertTrue(res["path"].endswith("f4.png"))

    def test_wait_gives_up_after_max_wait(self):
        clock, sleep = self._clock()
        res = TC.wait_for_render(self._frames(["leer"]), self.PW, self.PH, self._spec_tiles(),
                                 max_wait=6, interval=1.5, sleep=sleep, clock=clock)
        self.assertEqual(len(res["blank"]), 4, res)
        self.assertFalse(res["waited"] > 6)
        self.assertEqual(res["tries"], 5)

    def test_wait_zero_takes_one_shot(self):
        clock, sleep = self._clock()
        res = TC.wait_for_render(self._frames(["leer", "fertig"]), self.PW, self.PH,
                                 self._spec_tiles(), max_wait=0, sleep=sleep, clock=clock)
        self.assertEqual((res["tries"], len(res["blank"])), (1, 4))

    def test_wait_ignores_text_tiles_and_reports_capture_error(self):
        clock, sleep = self._clock()
        tiles = {k: {"rect": v["rect"], "kind": "text"} for k, v in self.tj.items()}
        res = TC.wait_for_render(self._frames(["leer", "leer"]), self.PW, self.PH, tiles,
                                 max_wait=20, sleep=sleep, clock=clock)
        self.assertEqual((res["tries"], res["blank"], res["stable"]), (2, [], True))
        res = TC.wait_for_render(lambda: (None, "Bridge weg"), self.PW, self.PH, tiles,
                                 sleep=sleep, clock=clock)
        self.assertEqual((res["path"], res["err"]), (None, "Bridge weg"))

    def test_compare_on_report_view_matches_page_only(self):
        """Gleiche Seite einmal als Berichtsansicht (dunkel, Filterbereich), einmal als
        reines Seitenbild: beide Vergleiche grün, Kachel-Scores fast gleich."""
        k = self.tmp / "k.png"
        TC.write_gray_png(k, self.PW, self.PH, self.page)
        img = self.view(1317, 798, (0, 114, 1016, 685), bg=28, pane=300, shadow=14,
                        shadow_end=76)
        d = self.tmp / "d.png"
        TC.write_gray_png(d, img.w, img.h, img.px)
        view = TC.compare_page(k, d, self.PW, self.PH, self.tj)
        whole = TC.compare_page(k, k, self.PW, self.PH, self.tj)
        self.assertTrue(view["ok"], view)
        self.assertLessEqual(abs(view["work"][0] - 1016), 1, view["work"])
        for key in self.tj:
            self.assertGreaterEqual(view["tiles"][key]["score"], 0.9, view["tiles"][key])
            self.assertLessEqual(abs(view["tiles"][key]["score"]
                                     - whole["tiles"][key]["score"]), 0.1)


class HelperTests(unittest.TestCase):
    def test_theme_page_outspace_and_background(self):
        f = LR.Deploy.theme_page_formatting
        solid = lambda c, t=0: [{"color": {"solid": {"color": c}}, "transparency": t}]  # noqa: E731
        frag = {"visualStyles": {"page": {"*": {"outspace": solid("#EAE8E1"),
                                                "background": solid("#F4F3F0")}}}}
        self.assertEqual(f(frag, {}), [("page.*.outspace.color", "#EAE8E1"),
                                       ("page.*.outspace.transparency", "0"),
                                       ("page.*.background.color", "#F4F3F0"),
                                       ("page.*.background.transparency", "0")])
        self.assertEqual(f(frag, frag), [])                    # schon gesetzt: nichts
        # Fragment ohne outspace: Vorgabe #EAE8E1 statt dunklem Navy
        self.assertEqual(f({}, {})[0], ("page.*.outspace.color", LR.DEFAULT_OUTSPACE))
        cur = {"visualStyles": {"page": {"*": {"outspace": solid("#eae8e1")}}}}
        self.assertEqual(f({}, cur), [])

    def test_slot_text_uses_state_keys(self):
        keys = set(LR.SLOT_LOOK)
        self.assertIn("text.show", keys)
        self.assertFalse([k for k in keys if k.startswith("text.") and k != "text.show"
                          and not k.startswith("text.default.")], keys)

    def test_ck_slot_hash_tracks_converter_mapping(self):
        a = {"objects": {"chart": [{"properties": {"showRelativeVariance": LR.lit(True)}}]},
             "container": {"title": [{"properties": {"show": LR.lit(True)}}],
                           "background": [{"properties": {}}]}}
        b = copy.deepcopy(a)
        b["objects"]["chart"][0]["properties"]["showRelativeVariance"] = LR.lit(False)
        c = copy.deepcopy(a)
        c["container"]["background"] = [{"properties": {"show": LR.lit(False)}}]
        self.assertNotEqual(LR.ck_slot_hash(a), LR.ck_slot_hash(b))
        self.assertEqual(LR.ck_slot_hash(a), LR.ck_slot_hash(c))   # Stil zählt hier nicht
        self.assertEqual(LR.ck_slot_hash({}), "")
        d = copy.deepcopy(a)                                         # nur umbenannt
        d["container"]["title"][0]["properties"]["text"] = LR.lit("Neu")
        self.assertEqual(LR.ck_slot_hash(a), LR.ck_slot_hash(d))

    def test_merge_objects_per_property(self):
        cur = {"labels": [{"properties": {"fontPreset": LR.lit("fullhd"),
                                          "labelDensity": LR.lit(3)}}]}
        src = {"labels": [{"properties": {"fontPreset": LR.lit("compact")}}],
               "chart": [{"properties": {"orientation": LR.lit("bars")}}]}
        changed = LR.merge_objects(cur, src)
        self.assertEqual(sorted(changed), ["chart", "labels"])
        self.assertEqual(cur["labels"][0]["properties"]["fontPreset"], LR.lit("compact"))
        self.assertEqual(cur["labels"][0]["properties"]["labelDensity"], LR.lit(3))
        self.assertEqual(LR.merge_objects(cur, src), [])

    def test_literal_values(self):
        self.assertEqual(LR.literal_value(LR.lit("#E1DFD6")), "#E1DFD6")
        self.assertEqual(LR.literal_value(LR.lit(12)), 12.0)
        self.assertIs(LR.literal_value(LR.lit(True)), True)
        self.assertEqual(LR.literal_value({"solid": {"color": LR.lit("#FFF")}}), "#FFF")
        vj = {"visual": {"visualContainerObjects": {"border": [{"properties": {
            "color": {"solid": {"color": LR.lit("#E1DFD6")}}, "radius": LR.lit(12)}}]}}}
        self.assertEqual(LR.container_value(vj, "border.color"), "#E1DFD6")
        self.assertTrue(LR.same_value(LR.container_value(vj, "border.radius"), 12))
        self.assertIsNone(LR.container_value(vj, "background.color"))

    def test_ascii_json_for_pbir(self):
        tmp = Path(tempfile.mkdtemp())
        try:
            LR.write_json_atomic(tmp / "a.json", {"t": "Fußleiste Δ"}, ascii_only=True)
            raw = (tmp / "a.json").read_bytes()
            self.assertTrue(all(b < 128 for b in raw))
            self.assertEqual(json.loads(raw.decode("cp1252"))["t"], "Fußleiste Δ")
        finally:
            shutil.rmtree(tmp, ignore_errors=True)


# --------------------------------------------------------------------------- #
# Agent-Modus v2: Runner gegen echtes pbir, Desktop/te als Attrappe
# --------------------------------------------------------------------------- #
@unittest.skipUnless(PBIR, "pbir nicht installiert")
class V2Tests(unittest.TestCase):
    maxDiff = None

    def setUp(self):
        self.p = Project()
        # --auto-restart: Verhalten bis Runner 0.2 (Neustart ohne Rückfrage); die Rückfragen
        # selbst prüft BetaTests
        self.p.default_args = ["--close-cmd", str(FAKE_CLOSE), "--desktop-timeout", "8",
                               "--auto-restart"]

    def tearDown(self):
        # report.json darf sich nur durch Installation/Theme ändern (Test prüft das selbst
        # und setzt self.p.protected neu); definition.pbir & Co. nie
        self.assertEqual(self.p.protected_hashes(), self.p.protected,
                         "geschuetzte Dateien unerwartet veraendert")
        if os.environ.get("MK_KEEP"):
            print("\n  behalten: %s" % self.p.root)
        else:
            self.p.cleanup()

    # --- Hilfen ------------------------------------------------------------ #
    def accept_report_json(self):
        """Nur report.json darf sich geändert haben (Installation, Theme)."""
        now = self.p.protected_hashes()
        diff = {k for k in set(now) | set(self.p.protected)
                if now.get(k) != self.p.protected.get(k)}
        self.assertTrue(diff <= {"%s.Report/definition/report.json" % NAME}, diff)
        self.p.protected = now

    def report_json(self):
        return json.loads((self.p.report / "definition" / "report.json")
                          .read_text(encoding="utf-8-sig"))

    def registered(self):
        return {r["name"] for r in self.report_json().get("resourcePackages") or []
                if r.get("type") == "CustomVisual"}

    def steps(self, st):
        return {s["id"]: s for s in st["steps"]}

    def spec_v2(self, h="h1"):
        spec = F.base_spec(h)
        spec["pages"][0]["visuals"] += [
            F.ck_bars("ckb", "Übersicht", "AC je Region", "DimRegion.Region",
                      "_Measures.AC", ["_Measures.PY", "_Measures.PL"], 760, 300),
            F.ck_kpi("ck1", "Übersicht", "AC (IBCS)", "_Measures.AC", 1420, 96),
        ]
        return spec

    def assertApplied(self, rc, out, st):
        self.assertEqual((rc, st.get("state")), (0, "applied"), out[-3000:])

    def obj(self, vj, name):
        return {k: LR.literal_value(v) for k, v in
                vj["visual"]["objects"][name][0]["properties"].items()}

    # --- A · Installation, Desktop offen: schließen, installieren, öffnen ---- #
    def test_install_restarts_open_desktop(self):
        self.p.set_bridge(open="ok", openDelay=0.5)
        t0 = time.time()
        rc, out, st = self.p.deploy(self.spec_v2(), 1)
        dt = time.time() - t0
        self.assertApplied(rc, out, st)
        steps = self.steps(st)
        self.assertIn("ChartKitchen", steps["visuals"]["msg"])
        self.assertIn("IBCS KPI Card", steps["visuals"]["msg"])
        self.assertEqual(steps["desktop"]["state"], "ok", steps["desktop"])
        self.assertIn("geöffnet", steps["desktop"]["msg"])
        self.assertIn("frisch geöffnet", steps["reload"]["msg"])
        self.assertIn("MockupKitchen", steps["theme"]["msg"])
        # Reihenfolge der Desktop-Aufrufe: Status, schließen, ..., öffnen, Bilder (neue pid)
        calls = self.p.calls()
        verbs = [c[0] for c in calls]
        self.assertIn("_close", verbs)
        self.assertEqual(calls[verbs.index("_close")], ["_close", "4242"])
        self.assertLess(verbs.index("_close"), verbs.index("open"))
        self.assertNotIn("reload", verbs)
        shots = [c for c in calls if c[0] == "screenshot"]
        self.assertTrue(shots)
        self.assertTrue(all(c[c.index("--pid") + 1] == "4243" for c in shots), shots)
        opened = [json.loads(l) for l in self.p.bridge_log.read_text(encoding="utf-8")
                  .splitlines() if json.loads(l)["argv"][0] == "open"][0]
        self.assertEqual(opened["PBI_DESKTOP_PATH"], str(SHIM))
        self.assertTrue(st["desktop"]["reopened"])
        self.assertEqual(st["desktop"]["pid"], 4243)
        # Dateien: beide Visuals installiert und registriert, Theme registriert
        self.assertTrue({LR.CK_GUID, KPI_GUID} <= self.registered())
        for g in (LR.CK_GUID, KPI_GUID):
            self.assertTrue((self.p.report / "CustomVisuals" / g / "resources" /
                             ("%s.pbiviz.json" % g)).is_file())
        ct = self.report_json()["themeCollection"]["customTheme"]
        self.assertEqual(ct["name"], "MockupKitchen.json")
        theme = json.loads((self.p.report / "StaticResources" / "RegisteredResources" /
                            "MockupKitchen.json").read_text(encoding="utf-8"))
        frag = json.loads((self.p.mk / "out" / "theme-fragment.json").read_text(encoding="utf-8"))
        self.assertEqual(theme["good"].lower(), frag["good"].lower())
        self.assertEqual(theme["background"].lower(), frag["background"].lower())
        self.accept_report_json()
        # ChartKitchen ohne Referenz-Instanz, Einstellungen aus dem Slot
        page = self.p.pages()["Übersicht"]
        kb = self.p.visual("mk_ckb", page)
        self.assertEqual(kb["visual"]["visualType"], LR.CK_GUID)
        self.assertIn("2.9.0", kb["$schema"])
        slots = [s for f in (self.p.mk / "out").glob("*/chartkitchen-slots.json")
                 for s in json.loads(f.read_text(encoding="utf-8"))]
        slot = [s for s in slots if s["stableId"] == "ckb"][0]
        self.assertEqual(kb["visual"]["objects"], slot["objects"])
        self.assertEqual(kb["visual"]["visualContainerObjects"], slot["container"])
        self.assertEqual(self.obj(kb, "chart")["orientation"], "bars")
        self.assertIs(self.obj(kb, "chart")["chartButtons"], False)
        self.assertEqual(kb["position"]["z"], slot.get("z", 10))
        self.assertIn("ChartKitchen angelegt", st["visuals"]["ckb"]["msg"])
        # kpi -> ibcsKpiCard (Custom Visual), keine pbiviz-To-dos mehr
        k1 = self.p.visual("mk_ck1", page)
        self.assertEqual(k1["visual"]["visualType"], KPI_GUID)
        self.assertIn("display", k1["visual"]["objects"])
        self.assertFalse(any("pbiviz" in t["text"] for t in st["todos"]), st["todos"])
        v = self.p.validate()
        self.assertEqual(v.get("errors") or [], [])
        self.assertLess(dt, 120)
        # 2. Deploy: alles installiert -> kein Neustart, normales Delta mit Reload
        n = len(self.p.calls())
        spec = self.spec_v2("h2")
        F.find_visual(spec, "ckb")["rect"]["x"] = 700
        rc, out, st = self.p.deploy(spec, 2)
        self.assertApplied(rc, out, st)
        verbs = [c[0] for c in self.p.calls()[n:]]
        self.assertNotIn("_close", verbs)
        self.assertNotIn("open", verbs)
        self.assertIn("reload", verbs)
        self.assertIn("schon aktuell", self.steps(st)["visuals"]["msg"])
        self.assertEqual(self.p.visual("mk_ckb", page)["position"]["x"], 700)
        self.assertEqual(self.p.protected_hashes(), self.p.protected)

    # --- A · Desktop lief nicht: installieren, dann öffnen ------------------ #
    def test_install_desktop_closed_then_open(self):
        self.p.set_bridge(mode="not_connected", open="ok", openDelay=0.2)
        rc, out, st = self.p.deploy(self.spec_v2(), 1)
        self.assertApplied(rc, out, st)
        steps = self.steps(st)
        self.assertEqual(steps["bridge"]["state"], "warn")
        self.assertEqual(steps["desktop"]["state"], "ok")
        verbs = [c[0] for c in self.p.calls()]
        self.assertNotIn("_close", verbs)
        self.assertIn("open", verbs)
        self.assertIn("screenshot", verbs)
        self.assertTrue({LR.CK_GUID, KPI_GUID} <= self.registered())
        self.accept_report_json()

    # --- A · Desktop kommt nicht hoch (Anmeldedialog): blockiert -------------- #
    def test_install_desktop_start_timeout_blocked(self):
        self.p.set_bridge(open="hang")
        self.p.default_args = ["--close-cmd", str(FAKE_CLOSE), "--desktop-timeout", "2",
                               "--auto-restart"]
        rc, out, st = self.p.deploy(self.spec_v2(), 1)
        self.assertEqual((rc, st["state"]), (2, "blocked"), out[-2000:])
        self.assertIn("Desktop startet nicht, bitte Desktop öffnen und anmelden, dann erneut "
                      "deployen", st["message"])
        self.assertTrue(any(t["kind"] == "manual" and "Desktop startet nicht" in t["text"]
                            for t in st["todos"]))
        # Dateien bleiben: Visuals installiert, Kacheln geschrieben
        self.assertTrue({LR.CK_GUID, KPI_GUID} <= self.registered())
        self.assertIsNotNone(self.p.visual("mk_ckb"))
        self.assertFalse((self.p.mk / ".state" / "applied.json").exists())
        self.accept_report_json()
        # Mensch öffnet Desktop: nächster Deploy (gleiche Spec) läuft normal durch
        self.p.set_bridge()
        rc, out, st = self.p.deploy(self.spec_v2(), 2)
        self.assertApplied(rc, out, st)
        self.assertNotIn("_close", [c[0] for c in self.p.calls()][-6:])

    # --- A · --no-desktop-restart: installieren, To-do Neustart ------------ #
    def test_install_without_restart(self):
        self.p.default_args = ["--close-cmd", str(FAKE_CLOSE), "--no-desktop-restart"]
        rc, out, st = self.p.deploy(self.spec_v2(), 1)
        self.assertApplied(rc, out, st)
        verbs = [c[0] for c in self.p.calls()]
        self.assertNotIn("_close", verbs)
        self.assertNotIn("open", verbs)
        self.assertIn("reload", verbs)
        self.assertTrue({LR.CK_GUID, KPI_GUID} <= self.registered())
        self.assertTrue(any(t["kind"] == "manual" and "Neustart" in t["text"]
                            for t in st["todos"]), st["todos"])
        # Theme braucht ein geschlossenes Desktop -> To-do statt Registrierung
        self.assertNotIn("customTheme", self.report_json()["themeCollection"])
        self.assertIn("theme", {t["kind"] for t in st["todos"]})
        self.accept_report_json()

    # --- kpi: altes ChartKitchen-cards-Visual wird durch ibcsKpiCard ersetzt ---- #
    def plant_ck_cards(self, page_id, name="mk_ck1", record=True):
        rep = self.p.report.as_posix()
        rc, o = self.p.pbir("add", "visual", "shape", "%s/Übersicht.Page" % rep, "-n", name,
                            "-x", 1420, "-y", 96, "-w", 320, "-h", 180)
        self.assertEqual(rc, 0, o)
        path = Path(glob.glob(str(self.p.report / "definition" / "pages" / page_id /
                                  "visuals" / name / "visual.json"))[0])
        vj = json.loads(path.read_text(encoding="utf-8"))
        vj["visual"] = {"visualType": LR.CK_GUID, "query": {"queryState": {"actual": {
            "projections": [LR.ck_projection("_Measures.AC", "measure", "actual", True)]}}},
            "objects": {"chart": [{"properties": {"orientation": LR.lit("cards")}}]}}
        path.write_text(json.dumps(vj, indent=2), encoding="utf-8")
        if record:
            cj = self.p.mk / ".state" / "created.json"
            rec = json.loads(cj.read_text(encoding="utf-8"))
            rec.setdefault(page_id, {})[name] = {"key": "ck1", "cat": "ck", "type": LR.CK_GUID}
            cj.write_text(json.dumps(rec), encoding="utf-8")

    def test_kpi_replaces_own_ck_cards(self):
        self.p.set_bridge(open="ok")
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1)        # Theme-Neustart? nein
        self.assertApplied(rc, out, st)
        page = self.p.pages()["Übersicht"]
        self.plant_ck_cards(page)                                # Stand eines alten Runners
        last = self.p.mk / ".state" / "last-applied-spec.json"
        spec = json.loads(last.read_text(encoding="utf-8"))
        spec["pages"][0]["visuals"].append(
            F.ck_kpi("ck1", "Übersicht", "AC (IBCS)", "_Measures.AC", 1420, 96))
        last.write_text(json.dumps(spec, ensure_ascii=False), encoding="utf-8")
        spec2 = json.loads(json.dumps(spec))
        spec2["meta"]["specHash"] = "h2"
        rc, out, st = self.p.deploy(spec2, 2)
        self.assertApplied(rc, out, st)
        self.assertEqual(self.p.visual("mk_ck1", page)["visual"]["visualType"], KPI_GUID)
        self.assertEqual(st["visuals"]["ck1"]["replaced"], ["mk_ck1"])
        self.assertEqual(self.p.created()[page]["mk_ck1"]["type"], KPI_GUID)
        self.accept_report_json()

    def test_kpi_never_replaces_foreign_visual(self):
        self.p.set_bridge(open="ok")
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1)
        self.assertApplied(rc, out, st)
        page = self.p.pages()["Übersicht"]
        self.plant_ck_cards(page, record=False)                  # von Hand in Desktop
        spec = F.base_spec("h2")
        spec["pages"][0]["visuals"].append(
            F.ck_kpi("ck1", "Übersicht", "AC (IBCS)", "_Measures.AC", 1420, 96))
        rc, out, st = self.p.deploy(spec, 2)
        self.assertApplied(rc, out, st)
        self.assertEqual(st["visuals"]["ck1"]["state"], "error", st["visuals"]["ck1"])
        self.assertEqual(self.p.visual("mk_ck1", page)["visual"]["visualType"], LR.CK_GUID)
        self.accept_report_json()

    # --- Umlaute über --from-json und batch ---------------------------------- #
    def test_umlauts_arrive_intact(self):
        self.p.default_args = ["--no-install"]
        spec = F.base_spec("h1")
        spec["pages"][0]["visuals"].append(
            F.text_tile("txt1", "Übersicht", "Fußleiste", "Größe: Ä Ö Ü ß € Δ", 952, 96))
        F.find_visual(spec, "kpi1")["title"] = "Umsatz (Größe) Δ"
        rc, out, st = self.p.deploy(spec, 1)
        self.assertApplied(rc, out, st)
        page = self.p.pages()["Übersicht"]
        raw = json.dumps(self.p.visual("mk_txt1", page), ensure_ascii=False)
        self.assertIn("Fußleiste", raw)
        self.assertIn("Größe: Ä Ö Ü ß € Δ", raw)
        kpi = json.dumps(self.p.visual("mk_kpi1", page), ensure_ascii=False)
        self.assertIn("Umsatz (Größe) Δ", kpi)
        for name in self.p.visual_names(page):
            text = json.dumps(self.p.visual(name, page), ensure_ascii=False)
            self.assertNotIn("Ã", text, name)

    # --- Delta: Seitenhintergrund und Stil gegen den Bericht ----------------- #
    def test_delta_design_against_report(self):
        self.p.default_args = ["--no-install"]
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1)
        self.assertApplied(rc, out, st)
        pages = self.p.pages()
        uid, did = pages["Übersicht"], pages["Detail"]
        rep = self.p.report.as_posix()
        # in Desktop: Hintergrund und Rahmenfarbe geändert, gespeichert
        self.assertEqual(self.p.pbir("pages", "background", "%s/Übersicht.Page" % rep,
                                     "--color", "#FFFFFF")[0], 0)
        rc2, o2 = self.p.pbir("set", "%s/Übersicht.Page/mk_kpi2.Visual.border.color" % rep,
                              "--value", "#FF0000")
        self.assertEqual(rc2, 0, o2)
        self.assertEqual(str(LR.container_value(self.p.visual("mk_kpi2", uid),
                                                "border.color")).upper(), "#FF0000")
        # Kitchen liest das Projekt ein (baseline, gleiche Gestaltung wie die Spec)
        base = F.base_spec("b1")
        base["meta"]["exportedAt"] = "2026-09-28T15:00:00.000+02:00"
        for pg, pid in zip(base["pages"], (uid, did)):
            pg["pbir"] = {"page": pid}
            for v in pg["visuals"]:
                v["pbir"] = {"page": pid, "visual": v["id"], "type": v["native"]["type"]}
        (self.p.mk / "baseline-spec.json").write_text(json.dumps(base, ensure_ascii=False),
                                                      encoding="utf-8")
        spec = json.loads(json.dumps(base))
        spec["meta"].update({"specHash": "h2", "exportedAt": "2026-09-28T15:05:00.000+02:00"})
        # Demo B2: eingelesene Seiten und Visuals bleiben, wie sie im Bericht gestaltet sind,
        # solange design seit der Basis gleich ist (kein Stil-Abgleich, kein Hintergrund)
        before = self.p.report_hash()
        rc, out, st = self.p.deploy(spec, 2)
        self.assertApplied(rc, out, st)
        self.assertEqual(before, self.p.report_hash())
        pj = json.loads((self.p.report / "definition" / "pages" / uid / "page.json")
                        .read_text(encoding="utf-8"))
        color = LR.literal_value(pj["objects"]["background"][0]["properties"]["color"])
        self.assertEqual(color.upper(), "#FFFFFF")
        k2 = self.p.visual("mk_kpi2", uid)
        self.assertEqual(str(LR.container_value(k2, "border.color")).upper(), "#FF0000")
        self.assertNotIn("kpi2", st["visuals"])
        self.assertNotIn("Stil-Abgleich", self.steps(st).get("plan", {}).get("msg", ""))
        self.assertNotIn("Seitenhintergrund", self.steps(st).get("plan", {}).get("msg", ""))
        # bewusste Designänderung im Kitchen: jetzt Hintergrund und Kachelstil gegen den Bericht
        spec3 = json.loads(json.dumps(spec))
        spec3["meta"].update({"specHash": "h3", "exportedAt": "2026-09-28T15:10:00.000+02:00"})
        spec3["design"]["pageBackground"] = "#EEEEEE"
        spec3["design"]["colors"]["pageBackground"] = "#EEEEEE"
        rc, out, st = self.p.deploy(spec3, 3)
        self.assertApplied(rc, out, st)
        pj = json.loads((self.p.report / "definition" / "pages" / uid / "page.json")
                        .read_text(encoding="utf-8"))
        color = LR.literal_value(pj["objects"]["background"][0]["properties"]["color"])
        self.assertEqual(color.upper(), "#EEEEEE")
        k2 = self.p.visual("mk_kpi2", uid)
        self.assertNotEqual(str(LR.container_value(k2, "border.color")).upper(), "#FF0000")
        self.assertIn("kpi2", st["visuals"])
        self.assertIn("Stil-Abgleich", self.steps(st)["plan"]["msg"])
        # nächster Lauf: Basis ist der eigene Stand, nichts mehr abzugleichen
        before = self.p.report_hash()
        spec3["meta"]["specHash"] = "h4"
        F.find_visual(spec3, "kpi1")["rect"]["x"] = 30
        rc, out, st = self.p.deploy(spec3, 4)
        self.assertApplied(rc, out, st)
        self.assertEqual(set(st["visuals"]), {"kpi1"})
        after = self.p.report_hash()
        changed = {k.split("/visuals/")[1].split("/")[0] for k in set(before) | set(after)
                   if before.get(k) != after.get(k) and "/visuals/" in k}
        self.assertEqual(changed, {"mk_kpi1"})

    def test_delta_ck_origin_orientation_and_style(self):
        """Eingelesenes ChartKitchen-Visual (Referenz-Fixture ohne Modus, ohne Stil): der
        erste Deploy nach dem Einlesen lässt es unverändert (Demo B2, PBIP ist die Wahrheit);
        erst eine Designänderung im Kitchen setzt Modus und Kachelstil."""
        self.p.default_args = ["--no-install"]
        self.p.add_ck_reference()
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1)
        self.assertApplied(rc, out, st)
        base = F.base_spec("b1")
        base["meta"]["exportedAt"] = "2026-09-28T15:00:00.000+02:00"
        v = F.ck_bars("cko", "Seite 1", "", "DimRegion.Region", "_Measures.AC",
                      ["_Measures.PL"], 10, 0, w=280, h=280)
        v["pbir"] = {"page": CK_REF_PAGE, "visual": CK_REF_VISUAL}
        base["pages"].append({"id": "pg9", "index": 9, "name": "Seite 1",
                              "pbir": {"page": CK_REF_PAGE}, "question": "", "notes": "",
                              "contentRect": base["pages"][0]["contentRect"],
                              "layoutTree": None, "visuals": [v]})
        (self.p.mk / "baseline-spec.json").write_text(json.dumps(base, ensure_ascii=False),
                                                      encoding="utf-8")
        spec = json.loads(json.dumps(base))
        spec["meta"].update({"specHash": "h2", "exportedAt": "2026-09-28T15:05:00.000+02:00"})
        ref_before = self.p.ck_ref_hash()
        rc, out, st = self.p.deploy(spec, 2)
        self.assertApplied(rc, out, st)
        self.assertEqual(self.p.ck_ref_hash(), ref_before)       # B2: unverändert
        self.assertNotIn("cko", st["visuals"])
        spec3 = json.loads(json.dumps(spec))
        spec3["meta"].update({"specHash": "h3", "exportedAt": "2026-09-28T15:10:00.000+02:00"})
        spec3["design"]["cornerRadius"] = 10                      # bewusste Designänderung
        rc, out, st = self.p.deploy(spec3, 3)
        self.assertApplied(rc, out, st)
        vj = self.p.visual(CK_REF_VISUAL, CK_REF_PAGE)
        self.assertEqual(self.obj(vj, "chart")["orientation"], "bars")
        self.assertIsNotNone(LR.container_value(vj, "border.color"))
        self.assertIn("Abgleich mit dem Bericht", st["visuals"]["cko"]["msg"])
        # Bindung (Desktop-Stand ohne Felder) bleibt unangetastet
        self.assertNotIn("query", vj["visual"])

    # --- Modell über te (Attrappe), pbir-Desktop-Weg ----------------------------- #
    def model_env(self, **cfg):
        sys.path.insert(0, str(HERE))
        import fake_te
        sys.path.pop(0)
        seed = json.loads(json.dumps(MODEL_SEED))
        fake_te.seed(self.p.model, seed)
        cfg_path = self.p.tmp / "fake_te.json"
        cfg.setdefault("log", str(self.p.tmp / "te-calls.jsonl"))
        cfg_path.write_text(json.dumps(cfg), encoding="utf-8")
        self.te_log = Path(cfg["log"])
        return {"MK_TE": str(FAKE_TE), "FAKE_TE_CONFIG": str(cfg_path),
                "FAKE_TE_PYTHON": sys.executable}

    def te_calls(self, verb):
        if not self.te_log.is_file():
            return []
        rows = [json.loads(l)["argv"] for l in self.te_log.read_text(encoding="utf-8")
                .splitlines() if l.strip()]
        return [r for r in rows if r and r[0] == verb and "--help" not in r]

    def model_spec(self, h):
        spec = F.base_spec(h)
        fl = {f["ref"]: f for f in spec["fields"]}
        fl["_Measures.Umsatz"].update(formatWish="teur", formatWishString='#,0, "T€"')
        spec["fields"] = list(fl.values())
        spec["newFields"] = [{"table": "_Measures", "name": "Marge %", "kind": "measure",
                              "ref": "_Measures.Marge %", "description": "Anteil Marge",
                              "unit": "%", "dax": "DIVIDE([Marge], [Umsatz])"}]
        return spec

    def test_model_ops_auto_and_approval(self):
        env = self.model_env()
        self.p.default_args = ["--no-install", "--desktop-cli", "pbir", "--pbir", str(FAKE_PBIR)]
        rc, out, st = self.p.deploy(self.model_spec("h1"), 1, env=env)
        self.assertApplied(rc, out, st)
        steps = self.steps(st)
        self.assertIn("te 0.9", steps["model"]["msg"])
        self.assertIn("1 angewendet", steps["model"]["msg"])
        sets = self.te_calls("set")
        self.assertTrue(any("formatString=#,0, \"T€\"" in a for c in sets for a in c), sets)
        self.assertEqual(self.te_calls("add"), [])                 # wartet auf Freigabe
        todo = [t for t in st["todos"] if t.get("id") == "addMeasure:_Measures.Marge %"][0]
        self.assertTrue(todo["needsApproval"])
        self.assertTrue(todo["commandLines"])
        self.assertIn("model-approvals.json", todo["text"])
        # pbir desktop: Status, Reload mit Modell, Bilder; keine Bridge-CLI
        calls = self.p.calls()
        self.assertTrue(all(c[0] == "pbir-desktop" for c in calls), calls)
        reloads = [c for c in calls if c[1] in ("reload", "refresh")]
        self.assertEqual(len(reloads), 1)
        self.assertIn("--model", reloads[0])
        self.assertTrue(any(c[1] == "screenshot" for c in calls))
        self.assertTrue(st["desktop"]["modelReloaded"])
        # Freigabe über die Datei (neue Form mit Hash aus dem To-do; die alte Form {ids} ohne
        # Hash gilt seit Safety-Review 5 als veraltet) -> nächster Deploy legt die Kennzahl an
        self.assertEqual((todo["opKind"], todo["target"], todo["after"]["expression"]),
                         ("addMeasure", "_Measures/Marge %", "DIVIDE([Marge], [Umsatz])"))
        (self.p.mk / "model-approvals.json").write_text(json.dumps(
            {"approvals": [{"id": "addMeasure:_Measures.Marge %", "hash": todo["hash"],
                            "by": "Test", "at": LR.now_iso()}]}), encoding="utf-8")
        rc, out, st = self.p.deploy(self.model_spec("h1"), 2, env=env)
        self.assertApplied(rc, out, st)
        adds = self.te_calls("add")
        self.assertEqual(len(adds), 1, adds)
        self.assertFalse(any(t.get("id") == "addMeasure:_Measures.Marge %"
                             for t in st["todos"]))
        done = json.loads((self.p.mk / ".state" / "model-applied.json")
                          .read_text(encoding="utf-8"))
        self.assertEqual(done["addMeasure:_Measures.Marge %"]["status"], "applied")
        # dritter Deploy: Freigabe verbraucht, Schnellweg
        rc, out, st = self.p.deploy(self.model_spec("h1"), 3, env=env)
        self.assertApplied(rc, out, st)
        self.assertEqual([s["id"] for s in st["steps"]], ["spec"])
        self.assertEqual(len(self.te_calls("add")), 1)

    def test_model_te_expired_todo(self):
        env = self.model_env(expired=True)
        self.p.default_args = ["--no-install"]
        rc, out, st = self.p.deploy(self.model_spec("h1"), 1, env=env)
        self.assertApplied(rc, out, st)
        self.assertEqual(self.steps(st)["model"]["state"], "warn")
        te = [t for t in st["todos"] if t["kind"] == "model" and t["ref"] == "te"]
        self.assertTrue(te and "abgelaufen" in te[0]["text"], st["todos"])
        self.assertEqual(self.te_calls("set"), [])
        self.assertTrue(any(t.get("id") == "setFormat:_Measures.Umsatz" for t in st["todos"]))

    # --- Render abwarten ------------------------------------------------------ #
    def test_shots_wait_for_render(self):
        """Fake-Desktop liefert leere Seiten: der Runner wiederholt das Bild bis zur
        Wartezeit und meldet die leeren Kacheln, statt das erste Bild zu nehmen."""
        spec = F.base_spec("h1")
        rc, out, st = self.p.deploy(spec, 1, env={"MK_SHOT_WAIT": "2.5"})
        self.assertApplied(rc, out, st)
        shots = self.steps(st)["shots"]
        self.assertEqual(shots["state"], "warn", shots)
        self.assertIn("noch leer", shots["msg"])
        n = sum(1 for c in self.p.calls() if c and c[0] == "screenshot")
        self.assertGreaterEqual(n, 2 * len(spec["pages"]), self.p.calls())

    # --- Bildvergleich im Deploy ---------------------------------------------- #
    def test_compare_after_shots(self):
        self.p.default_args = ["--no-install", "--compare-wait", "5"]
        spec = F.base_spec("h1")
        kdir = self.p.mk / "kitchen" / "1"
        kdir.mkdir(parents=True)
        tiles, ktiles = {}, {}
        for pg in spec["pages"]:
            drawn = []
            for v in pg["visuals"]:
                r = v["rect"]
                tiles[v["stableId"]] = {"page": pg["name"], "id": v["id"], "kind": v["kind"],
                                        "title": v["title"], "rect": r, "headH": 36,
                                        "body": {"x": r["x"] + 12, "y": r["y"] + 40,
                                                 "w": r["w"] - 24, "h": r["h"] - 52}}
                drawn.append({"rect": r, "title": True, "bars": True})
            ktiles[pg["name"]] = drawn
        pages = []
        for pg in spec["pages"]:
            fname = "%s.png" % pg["name"]
            write_page_png(kdir / fname, 1920, 1080, ktiles[pg["name"]])
            pages.append({"id": pg["id"], "name": pg["name"], "file": fname,
                          "png": "kitchen/1/%s" % fname, "width": 1920, "height": 1080})
        (kdir / "tiles.json").write_text(json.dumps(
            {"contract": 1, "seq": 1, "specHash": "h1", "scale": 1, "pages": pages,
             "tiles": tiles}, ensure_ascii=False), encoding="utf-8")
        rc, out, st = self.p.deploy(spec, 1)
        self.assertApplied(rc, out, st)
        cmp_step = self.steps(st)["compare"]
        self.assertIn("4 Kachel(n) verglichen", cmp_step["msg"])
        self.assertEqual(cmp_step["state"], "warn")       # Fake-Desktop zeigt leere Seiten
        for k in ("kpi1", "kpi2", "col1", "lin1"):
            d = st["visuals"][k]["diff"]
            self.assertTrue(0 <= d["score"] <= 1)
            self.assertTrue(any("Fläche leer" in n for n in d["notes"]), d)
        self.assertIn("*", (self.p.mk / ".gitignore").read_text(encoding="utf-8").split())
        # untouched tile on a later deploy still gets a diff entry, state ok
        kdir2 = self.p.mk / "kitchen" / "2"
        shutil.copytree(kdir, kdir2)
        tj = json.loads((kdir2 / "tiles.json").read_text(encoding="utf-8"))
        tj["seq"] = 2
        for pg in tj["pages"]:
            pg["png"] = pg["png"].replace("kitchen/1/", "kitchen/2/")
        (kdir2 / "tiles.json").write_text(json.dumps(tj, ensure_ascii=False), encoding="utf-8")
        spec2 = F.base_spec("h2")
        F.find_visual(spec2, "kpi1")["rect"]["x"] = 30
        rc, out, st = self.p.deploy(spec2, 2)
        self.assertApplied(rc, out, st)
        self.assertEqual(st["visuals"]["lin1"]["state"], "ok")
        self.assertIn("diff", st["visuals"]["lin1"])


MODEL_SEED = {
    "_Measures": {"measures": {
        "AC": {"expression": "SUM(FactActuals[Amount])", "formatString": "#,##0",
               "description": "", "displayFolder": ""},
        "PY": {"expression": "1", "formatString": "#,##0", "description": "",
               "displayFolder": ""},
        "PL": {"expression": "1", "formatString": "#,##0", "description": "",
               "displayFolder": ""},
        "Umsatz": {"expression": "SUM(FactActuals[Amount])", "formatString": "#,##0",
                   "description": "Nettoumsatz", "displayFolder": "Basis"},
        "Kosten": {"expression": "1", "formatString": "#,##0", "description": "x",
                   "displayFolder": ""},
        "Marge": {"expression": "[Umsatz] - [Kosten]", "formatString": "#,##0",
                  "description": "", "displayFolder": ""}}},
    "DimRegion": {"columns": {"Region": {"description": ""}}},
    "DimProduct": {"columns": {"Product": {}, "Category": {}}},
    "DimDate": {"columns": {"Year": {}, "MonthName": {}, "Date": {}}},
}


# --------------------------------------------------------------------------- #
# Beta 02.10.2026: Einheitentests ohne pbir
# --------------------------------------------------------------------------- #
AGENT = REPO / "mockup-live" / "agent"
MK_LIVE = AGENT / "mk_live.py"
MK_LAUNCH = AGENT / "mk_launch.pyw"


class BetaUnitTests(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix="mk-beta-unit-"))

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_gitignore_form(self):
        gi = self.tmp / ".gitignore"
        gi.write_text(LR.gitignore_text(), encoding="utf-8")
        self.assertTrue(LR.gitignore_complete(gi))
        gi.write_text("out/\nbackup/\n", encoding="utf-8")
        self.assertFalse(LR.gitignore_complete(gi))
        gi.write_text("!mockup-spec.json\n*\n", encoding="utf-8")   # Reihenfolge zählt
        self.assertFalse(LR.gitignore_complete(gi))

    def test_fmt_num_and_plan_text(self):
        self.assertEqual((LR.fmt_num(10), LR.fmt_num(2.5), LR.fmt_num(0.04)), ("10", "2,5", "0"))
        plan = {"pages": {"A": {"new": 2, "changed": 1, "moved": 1, "removed": 0, "page": "new"}},
                "modelOps": [{"willRun": True}, {"willRun": False}], "restart": True,
                "restartReason": "ChartKitchen fehlt im Bericht", "estMs": 52000,
                "theme": True, "nothing": False}
        txt = LR.Deploy.plan_text(plan)
        for part in ("2 neu", "1 geändert", "1 verschoben", "1 Seite(n) neu", "Theme",
                     "1 Modell-Op(s)", "Neustart nötig (ChartKitchen fehlt im Bericht)",
                     "ca. 52 s"):
            self.assertIn(part, txt)
        self.assertNotIn("—", txt)
        self.assertEqual(LR.Deploy.plan_text({"nothing": True}),
                         "seit dem letzten Deploy nichts geändert")
        self.assertIn("würde blockieren", LR.Deploy.plan_text({"blockers": ["x"]}))

    def test_desktop_digest_changes_on_save(self):
        class P:                                 # wie LR.Project, nur die Pfade
            root = self.tmp
            report = self.tmp / "X.Report"
            model = self.tmp / "X.SemanticModel"
            reload_marker = self.tmp / "desktop-reload.json"
        f = P.report / "definition" / "report.json"
        f.parent.mkdir(parents=True)
        f.write_text("{}", encoding="utf-8")
        (P.report / ".pbi").mkdir()
        d0 = LR.desktop_digest(P)
        LR.write_json_atomic(P.reload_marker, {"pid": 7, "digest": d0})
        self.assertTrue(LR.reload_marker_matches(P, 7))
        self.assertFalse(LR.reload_marker_matches(P, 8))
        (P.report / ".pbi" / "cache.abf").write_bytes(b"x")    # Cache zählt nicht
        self.assertEqual(LR.desktop_digest(P), d0)
        st = f.stat()
        os.utime(f, ns=(st.st_atime_ns, st.st_mtime_ns + 2_000_000_000))   # Desktop speichert
        self.assertNotEqual(LR.desktop_digest(P), d0)
        self.assertFalse(LR.reload_marker_matches(P, 7))

    def test_crop_page_from_window_shot(self):
        page = bytes(draw_page(CanvasTests.PW, CanvasTests.PH, CanvasTests.TILES))
        box = (40, 160, 40 + 1440, 160 + 810)
        src = self.tmp / "shot.png"
        TC.write_gray_png(src, 1700, 1000, desktop_view(page, 1920, 1080, 1700, 1000, box, 30,
                                                       pane=200))
        res = TC.crop_page(src, 1920, 1080, self.tmp / "shot.page.png")
        self.assertTrue(res["ok"], res)
        self.assertEqual(png_size(self.tmp / "shot.page.png"), (1920, 1080))
        self.assertTrue(all(abs(a - b) <= 2 for a, b in zip(res["box"], box)), res["box"])
        g = TC.read_gray(self.tmp / "shot.page.png")
        ref = TC.Gray(1920, 1080, page, "t")
        diff = sum(abs(g.at(x, y) - ref.at(x, y)) for x in range(10, 1900, 97)
                   for y in range(10, 1070, 89)) / float(20 * 12)
        self.assertLess(diff, 25)
        res2 = TC.crop_page(src, 1920, 1080, self.tmp / "grau.png", prefer_pillow=False)
        self.assertEqual((res2["ok"], res2["mode"]), (True, "stdlib-grau"))
        self.assertEqual(png_size(self.tmp / "grau.png"), (1920, 1080))

    def test_busy_detection(self):
        for text in ("All pipe instances are busy.", "ERROR_PIPE_BUSY", "Desktop busy"):
            self.assertTrue(LR.DesktopCli.is_busy(text), text)
        self.assertFalse(LR.DesktopCli.is_busy("Report not found"))

    def test_kitchen_url_and_tool_json(self):
        sys.path.insert(0, str(AGENT))
        import mk_live as MK
        sys.path.pop(0)
        url = MK.kitchen_url("https://example.test/mockup-kitchen.html?lang=de&live=0",
                             "IBCS Testbed")
        self.assertEqual(url, "https://example.test/mockup-kitchen.html?lang=de&live=1&"
                              "project=IBCS+Testbed")
        tj = MK.tool_json()
        self.assertEqual(set(tj), {"version", "name", "description", "path", "arguments",
                                   "iconData"})
        self.assertIn('--server "%server%" --database "%database%"', tj["arguments"])
        self.assertIn("mk_launch.pyw", tj["arguments"])
        self.assertTrue(tj["iconData"].startswith("image/png;base64,"))
        import base64
        png = base64.b64decode(tj["iconData"].split(",", 1)[1])
        self.assertEqual(png[:8], b"\x89PNG\r\n\x1a\n")
        self.assertEqual(struct.unpack(">II", png[16:24]), (32, 32))


# --------------------------------------------------------------------------- #
# Beta 02.10.2026: Rückfragen, Vorschau, Vorbereiten, Zurück, Instanz (echtes pbir)
# --------------------------------------------------------------------------- #
class BetaTests(unittest.TestCase):
    maxDiff = None
    accept_report_json = V2Tests.accept_report_json
    report_json = V2Tests.report_json
    registered = V2Tests.registered
    steps = V2Tests.steps
    spec_v2 = V2Tests.spec_v2
    model_env = V2Tests.model_env
    te_calls = V2Tests.te_calls
    model_spec = V2Tests.model_spec
    assertApplied = V2Tests.assertApplied

    def setUp(self):
        self.p = Project()
        self.p.default_args = ["--close-cmd", str(FAKE_CLOSE), "--desktop-timeout", "8"]

    def tearDown(self):
        self.assertEqual(self.p.protected_hashes(), self.p.protected,
                         "geschuetzte Dateien unerwartet veraendert")
        if os.environ.get("MK_KEEP"):
            print("\n  behalten: %s" % self.p.root)
        else:
            self.p.cleanup()

    def verbs(self, start=0):
        return [c[0] for c in self.p.calls()[start:]]

    # --- Neustart nur nach Bestätigung (Fall A) ------------------------------ #
    def test_restart_waits_for_confirmation(self):
        self.p.set_bridge(open="ok", openDelay=0.5)
        before = self.p.report_hash()
        self.p.deploy_files(self.spec_v2(), 1, sessionId="mk-kitchen")
        proc = self.p.start_once()
        st = self.p.wait_awaiting(proc, kind="restart")
        aw = st["awaiting"]
        self.assertEqual(aw["options"], ["restart", "skipRestart", "cancel"])
        self.assertEqual((aw["unsavedByUs"], aw["hasUnsavedChanges"], aw["pid"], aw["seq"]),
                         (False, False, 4242, 1))
        self.assertTrue(aw["countdown"])                 # Fall A: nichts Ungespeichertes
        self.assertIn("ChartKitchen", aw["reason"])
        self.assertTrue(st["plan"]["restart"])
        self.assertTrue({"ChartKitchen byDatenWG", "IBCS KPI Card"}
                        <= set(st["plan"]["visualsToInstall"]), st["plan"])
        self.assertGreater(st["plan"]["estMs"], 40000)
        self.assertEqual(st["state"], "running")
        self.assertEqual(st["sessionMismatch"]["request"], "mk-kitchen")
        self.assertNotIn("_close", self.verbs())
        self.assertEqual(before, self.p.report_hash())       # vor der Antwort nichts geschrieben
        hb = st["runner"]["heartbeatAt"]
        self.p.wait_status(lambda s: s["runner"]["heartbeatAt"] != hb, timeout=20, proc=proc)
        self.p.confirm(1, "skipRestart-gibt-es-nicht")     # unbekannte Aktion: ignoriert
        time.sleep(1)
        self.assertEqual(self.p.status_safe().get("runner", {}).get("state"), "awaiting")
        self.p.confirm(1, "restart")
        rc, out, st = self.p.finish(proc)
        self.assertApplied(rc, out, st)
        self.assertNotIn("awaiting", st)
        verbs = self.verbs()
        self.assertLess(verbs.index("_close"), verbs.index("open"))
        self.assertTrue(st["desktop"]["reopened"])
        self.assertTrue({LR.CK_GUID, KPI_GUID} <= self.registered())
        self.assertTrue(st["history"][-1]["restart"])
        steps = self.steps(st)
        self.assertTrue(all(isinstance(s["ms"], int) for s in st["steps"]))
        self.assertIn("geöffnet", steps["desktop"]["msg"])
        self.accept_report_json()

    def test_restart_timeout_cancel_and_skip(self):
        self.p.set_bridge(open="ok", openDelay=0.2)
        before = self.p.report_hash()
        # 1 · keine Antwort: blockiert, nichts geschrieben, Desktop bleibt
        rc, out, st = self.p.deploy(self.spec_v2(), 1, "--confirm-timeout", "2")
        self.assertEqual((rc, st["state"]), (2, "blocked"), out[-2000:])
        self.assertIn("Neustart nicht bestätigt", st["message"])
        self.assertEqual(before, self.p.report_hash())
        self.assertNotIn("_close", self.verbs())
        self.assertEqual(st["runner"]["state"], "idle")
        # 2 · Abbrechen
        self.p.deploy_files(self.spec_v2("h2"), 2)
        proc = self.p.start_once()
        self.p.wait_awaiting(proc, kind="restart", seq=2)
        self.p.confirm(2, "cancel")
        rc, out, st = self.p.finish(proc)
        self.assertEqual((rc, st["state"]), (3, "cancelled"), out[-2000:])
        self.assertEqual(before, self.p.report_hash())
        self.assertEqual([(h["seq"], h["state"]) for h in st["history"]],
                         [(1, "blocked"), (2, "cancelled")])
        # 3 · Ohne Neustart deployen: Kacheln geschrieben, Visuals bleiben To-do
        self.p.deploy_files(self.spec_v2("h3"), 3)
        proc = self.p.start_once()
        self.p.wait_awaiting(proc, kind="restart", seq=3)
        self.p.confirm(3, "skipRestart")
        rc, out, st = self.p.finish(proc)
        self.assertApplied(rc, out, st)
        self.assertNotIn("_close", self.verbs())
        self.assertIn("ohne Neustart gewählt", self.steps(st)["visuals"]["msg"])
        self.assertTrue(any("Ohne Neustart deployt" in t["text"] for t in st["todos"]))
        self.assertFalse({LR.CK_GUID, KPI_GUID} & self.registered())
        self.assertIn("reload", self.verbs())

    # --- Fall B: echte Arbeit in Desktop -------------------------------------- #
    def test_restart_with_user_work_offers_case_b(self):
        self.p.set_bridge(open="ok", openDelay=0.2, hasUnsavedChanges=True)
        self.p.deploy_files(self.spec_v2(), 1)
        proc = self.p.start_once()
        st = self.p.wait_awaiting(proc, kind="restart")
        aw = st["awaiting"]
        self.assertEqual(aw["options"], ["saveFirst", "skipRestart", "discard", "cancel"])
        self.assertEqual((aw["unsavedByUs"], aw["hasUnsavedChanges"]), (False, True))
        self.p.confirm(1, "restart")                     # nicht angeboten: bleibt wartend
        time.sleep(1.2)
        self.assertEqual(self.p.status_safe()["runner"]["state"], "awaiting")
        self.assertNotIn("_close", self.verbs())
        self.p.confirm(1, "discard")
        rc, out, st = self.p.finish(proc)
        self.assertApplied(rc, out, st)
        self.assertIn("_close", self.verbs())
        self.accept_report_json()

    # --- Ungespeichertes vom Nutzer: erst speichern, dann weiter ----------------- #
    def test_unsaved_by_user_save_first(self):
        self.p.default_args = ["--no-install"]
        self.p.set_bridge(hasUnsavedChanges=True)
        before = self.p.report_hash()
        self.p.deploy_files(F.base_spec("h1"), 1)
        proc = self.p.start_once()
        st = self.p.wait_awaiting(proc, kind="unsaved")
        aw = st["awaiting"]
        self.assertEqual(aw["options"], ["saveFirst", "discard", "skipRestart", "cancel"])
        self.assertFalse(aw["unsavedByUs"])
        self.assertIn("nicht vom Live-Helfer", aw["reason"])
        self.assertFalse(st["plan"]["nothing"])
        self.p.confirm(1, "saveFirst")
        st = self.p.wait_awaiting(proc, kind="unsaved", waitingForSave=True)
        self.assertEqual(st["awaiting"]["options"], ["discard", "cancel"])
        self.assertEqual(before, self.p.report_hash())
        self.p.set_bridge(hasUnsavedChanges=False)       # Nutzer speichert in Desktop
        rc, out, st = self.p.finish(proc)
        self.assertApplied(rc, out, st)
        self.assertIn("reload", self.verbs())
        self.assertIn("mk_kpi1", self.p.visual_names(self.p.pages()["Übersicht"]))

    def test_unsaved_skip_reload_and_cancel_file(self):
        self.p.default_args = ["--no-install"]
        self.p.set_bridge(hasUnsavedChanges=True)
        # deploy-cancel.json während der Rückfrage
        before = self.p.report_hash()
        self.p.deploy_files(F.base_spec("h1"), 1)
        proc = self.p.start_once()
        self.p.wait_awaiting(proc, kind="unsaved")
        self.p.cancel(1)
        rc, out, st = self.p.finish(proc)
        self.assertEqual((rc, st["state"]), (3, "cancelled"), out[-2000:])
        self.assertIn("zurückgezogen", st["message"])
        self.assertEqual(before, self.p.report_hash())
        # skipRestart bei „unsaved": schreiben, nicht neu laden
        self.p.deploy_files(F.base_spec("h1"), 2)
        proc = self.p.start_once()
        self.p.wait_awaiting(proc, kind="unsaved", seq=2)
        self.p.confirm(2, "skipRestart")
        rc, out, st = self.p.finish(proc)
        self.assertApplied(rc, out, st)
        self.assertNotIn("reload", self.verbs())
        self.assertIn("ohne Neuladen", self.steps(st)["reload"]["msg"])
        self.assertTrue(any("nicht neu geladen" in t["text"] for t in st["todos"]))
        self.assertIn("mk_kpi1", self.p.visual_names(self.p.pages()["Übersicht"]))

    # --- Markierung vom eigenen Reload: keine Rückfrage ------------------------ #
    def test_unsaved_by_our_reload_needs_no_question(self):
        self.p.default_args = ["--no-install", "--confirm-timeout", "3"]
        self.p.set_bridge(reloadMarksUnsaved=True)
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1)
        self.assertApplied(rc, out, st)
        marker = json.loads((self.p.mk / ".state" / "desktop-reload.json")
                            .read_text(encoding="utf-8"))
        self.assertEqual((marker["pid"], marker["seq"]), (4242, 1))
        spec = F.base_spec("h2")
        F.find_visual(spec, "kpi1")["rect"]["x"] = 40
        rc, out, st = self.p.deploy(spec, 2)             # Desktop „ungespeichert" durch uns
        self.assertApplied(rc, out, st)
        self.assertTrue(st["desktop"]["hasUnsavedChanges"])
        self.assertTrue(st["desktop"]["unsavedByUs"])
        self.assertIn("nur durch den Reload", self.steps(st)["bridge"]["msg"])
        self.assertEqual([h["seq"] for h in st["history"]], [1, 2])
        # Nutzer speichert in Desktop und ändert danach etwas: jetzt ist es seine Arbeit
        pj = self.p.report / "definition" / "pages" / "pages.json"
        s0 = pj.stat()
        os.utime(pj, ns=(s0.st_atime_ns, s0.st_mtime_ns + 3_000_000_000))
        spec3 = F.base_spec("h3")
        F.find_visual(spec3, "kpi1")["rect"]["x"] = 60
        self.p.deploy_files(spec3, 3)
        proc = self.p.start_once("--confirm-timeout", "60")
        st = self.p.wait_awaiting(proc, kind="unsaved")
        self.assertFalse(st["awaiting"]["unsavedByUs"])
        self.p.confirm(3, "discard")
        rc, out, st = self.p.finish(proc)
        self.assertApplied(rc, out, st)
        self.assertEqual(self.p.visual("mk_kpi1")["position"]["x"], 60)

    # --- deploy-cancel.json vor dem Start ------------------------------------- #
    def test_cancel_file_withdraws_pending_request(self):
        self.p.default_args = ["--no-install"]
        before = self.p.report_hash()
        self.p.deploy_files(F.base_spec("h1"), 1)
        self.p.cancel(1)
        rc, out, st = self.p.run("once")
        self.assertEqual((rc, st["state"], st["seq"]), (3, "cancelled", 1), out)
        self.assertIn("zurückgezogen, bevor er begann", st["message"])
        self.assertEqual(self.p.calls(), [])
        self.assertEqual(before, self.p.report_hash())
        self.assertEqual(st.get("history"), [])
        rc, out, st = self.p.run("once")                 # gleiche seq: nicht noch einmal
        self.assertEqual(rc, 3)
        self.assertIn("schon bearbeitet", out)

    # --- Vorschau (dryRun) ---------------------------------------------------- #
    def test_dry_run_plans_restart_without_writing(self):
        self.p.set_bridge(open="ok")
        before = self.p.report_hash()
        rc, out, st = self.p.deploy(self.spec_v2(), 1, dryRun=True)
        self.assertEqual((rc, st["state"]), (0, "planned"), out[-2000:])
        plan = st["plan"]
        self.assertTrue(plan["dryRun"])
        self.assertEqual(plan["blockers"], [])
        self.assertTrue(plan["restart"])
        self.assertIn("fehlen im Bericht", plan["restartReason"])
        self.assertEqual(plan["pages"]["Übersicht"]["new"], 5)
        self.assertEqual(plan["pages"]["Übersicht"]["page"], "new")
        self.assertFalse(plan["nothing"])
        self.assertTrue(plan["reload"])
        self.assertGreater(plan["estMs"], 0)
        self.assertEqual(before, self.p.report_hash())
        self.assertEqual(set(self.verbs()), {"status", "manifest"})
        self.assertFalse((self.p.mk / "backup").exists())
        self.assertFalse((self.p.mk / "out").exists())
        self.assertTrue((self.p.mk / ".state" / "preview-out" / "plan.json").is_file())
        self.assertEqual(st["history"], [])
        self.assertIn("Vorschau:", st["message"])
        self.assertIn("Neustart nötig", st["message"])

    def test_dry_run_after_deploy_and_blockers(self):
        self.p.default_args = ["--no-install"]
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1)
        self.assertApplied(rc, out, st)
        spec = F.base_spec("h2")
        F.find_visual(spec, "kpi1")["rect"]["x"] = 40
        F.find_visual(spec, "col1")["title"] = "Umsatz je Monat (neu)"
        rc, out, st = self.p.deploy(spec, 2, dryRun=True)
        self.assertEqual((rc, st["state"]), (0, "planned"), out[-2000:])
        pg = st["plan"]["pages"]["Übersicht"]
        self.assertEqual((pg["new"], pg["moved"], pg["changed"]), (0, 1, 1), pg)
        self.assertFalse(st["plan"]["restart"])
        # Ergebnis von Deploy 1 bleibt sichtbar
        self.assertEqual(st["previous"]["seq"], 1)
        self.assertIn("Übersicht", st["pages"])
        self.assertTrue(st["pages"]["Übersicht"].get("shot"))
        # nichts geändert
        rc, out, st = self.p.deploy(F.base_spec("h1"), 3, dryRun=True)
        self.assertTrue(st["plan"]["nothing"], st["plan"])
        self.assertIn("nichts geändert", st["message"])
        # Blocker: zwei Fenster mit dem Projekt
        self.p.set_bridge(extraInstances=[{"pid": 4343, "currentFilePath": str(self.p.pbip)}])
        rc, out, st = self.p.deploy(spec, 4, dryRun=True)
        self.assertEqual(st["state"], "planned")
        self.assertTrue(any("2 Desktop-Fenstern" in b for b in st["plan"]["blockers"]))
        self.assertEqual([h["seq"] for h in st["history"]], [1])

    # --- Sitzung vorbereiten (prepare) --------------------------------------- #
    def test_prepare_session(self):
        self.p.set_bridge(open="ok", openDelay=0.3)
        pages0 = set(self.p.pages())
        self.p.request(1, prepare=True)
        proc = self.p.start_once()
        st = self.p.wait_awaiting(proc, kind="restart")
        self.assertEqual(st["awaiting"]["options"], ["restart", "cancel"])
        self.assertIn("Sitzung vorbereiten", st["awaiting"]["reason"])
        self.assertTrue(st["plan"]["prepare"])
        self.assertTrue(st["plan"]["themeRegister"])
        self.p.confirm(1, "restart")
        rc, out, st = self.p.finish(proc)
        self.assertApplied(rc, out, st)
        self.assertIn("Sitzung vorbereitet", st["message"])
        self.assertTrue({LR.CK_GUID, KPI_GUID} <= self.registered())
        self.assertEqual(self.report_json()["themeCollection"]["customTheme"]["name"],
                         "MockupKitchen.json")
        self.assertEqual(set(self.p.pages()), pages0)     # keine Seite geschrieben
        self.assertTrue((self.p.mk / "backup" / "1").is_dir())
        self.assertTrue(st["history"][-1]["prepare"])
        verbs = self.verbs()
        self.assertLess(verbs.index("_close"), verbs.index("open"))
        self.accept_report_json()
        # zweites Mal: alles da, kein Neustart, keine Rückfrage
        n = len(self.p.calls())
        self.p.request(2, prepare=True)
        rc, out, st = self.p.run("once", "--confirm-timeout", "3")
        self.assertApplied(rc, out, st)
        self.assertIn("Sitzung bereit", st["message"])
        self.assertNotIn("_close", self.verbs(n))

    # --- Zurück zu Deploy n (restore) ---------------------------------------- #
    def test_restore_to_deploy_n(self):
        self.p.default_args = ["--no-install"]
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1)
        self.assertApplied(rc, out, st)
        after1 = self.p.page_tree()
        spec = F.base_spec("h2")
        F.find_visual(spec, "kpi1")["rect"]["x"] = 40
        spec["pages"][0]["visuals"].append(
            F.text_tile("txt9", "Übersicht", "Neu", "erst in Deploy 2", 952, 96))
        rc, out, st = self.p.deploy(spec, 2)
        self.assertApplied(rc, out, st)
        self.assertNotEqual(self.p.page_tree(), after1)
        self.p.request(3, restore={"fromBackup": 1})
        rc, out, st = self.p.run("once")
        self.assertApplied(rc, out, st)
        self.assertEqual(self.p.page_tree(), after1)
        self.assertEqual(st["restored"]["fromBackup"], 1)
        self.assertEqual(st["restored"]["source"], "backup/2")
        self.assertEqual(st["restored"]["spec"], ".state/specs/1.json")
        self.assertTrue((self.p.mk / ".state" / "specs" / "1.json").is_file())
        self.assertEqual(json.loads((self.p.mk / ".state" / "last-applied-spec.json")
                                    .read_text(encoding="utf-8")),
                         json.loads((self.p.mk / ".state" / "specs" / "1.applied.json")
                                    .read_text(encoding="utf-8")))
        self.assertTrue((self.p.mk / "backup" / "3").is_dir())   # Stand nach 2 gesichert
        self.assertEqual(st["history"][-1]["restoredFrom"], 1)
        self.assertEqual(st["plan"]["pages"]["Übersicht"]["new"], 0)
        self.assertEqual(st["plan"]["pages"]["Übersicht"]["removed"], 1)
        self.assertEqual(st["plan"]["pages"]["Übersicht"]["changed"], 1)
        self.assertIn("reload", self.verbs())
        self.assertTrue(st["pages"]["Übersicht"]["shot"].startswith("shots/3/"))
        self.assertTrue(any(t["ref"] == "kitchen" for t in st["todos"]))
        # Kitchen lädt Stand 1 und deployt ihn: Schnellweg „nichts zu tun"
        spec1 = json.loads((self.p.mk / ".state" / "specs" / "1.json").read_text(
            encoding="utf-8"))
        rc, out, st = self.p.deploy(spec1, 4)
        self.assertApplied(rc, out, st)
        self.assertEqual([s["id"] for s in st["steps"]], ["spec"])
        # unbekannter Stand: blockiert
        self.p.request(5, restore={"fromBackup": 42})
        rc, out, st = self.p.run("once")
        self.assertEqual((rc, st["state"]), (2, "blocked"), out[-1500:])
        self.assertIn("Deploy 42", st["message"])

    # --- Teilziele (scope) ---------------------------------------------------- #
    def test_scope_model_and_layout(self):
        env = self.model_env()
        self.p.default_args = ["--no-install"]
        before = self.p.page_tree()
        rc, out, st = self.p.deploy(self.model_spec("h1"), 1, env=env, scope="model")
        self.assertApplied(rc, out, st)
        self.assertEqual(self.p.page_tree(), before)    # keine Seite, keine Kachel
        self.assertTrue(self.te_calls("set"))
        self.assertEqual(st["scope"], "model")
        reloads = [c for c in self.p.calls() if c[0] == "reload"]
        self.assertEqual(len(reloads), 1)
        n_set = len(self.te_calls("set"))
        rc, out, st = self.p.deploy(self.model_spec("h1"), 2, env=env, scope="layout")
        self.assertApplied(rc, out, st)
        self.assertEqual(len(self.te_calls("set")), n_set)   # Modell nicht angefasst
        self.assertIn("Teilziel layout", self.steps(st)["model"]["msg"])
        self.assertNotEqual(self.p.page_tree(), before)
        rc, out, st = self.p.deploy(self.model_spec("h1"), 3, env=env, scope="bunt")
        self.assertEqual((rc, st["state"]), (2, "blocked"))

    # --- Freigaben mit Hash -------------------------------------------------- #
    def test_model_approvals_hash(self):
        env = self.model_env()
        self.p.default_args = ["--no-install"]
        oid = "addMeasure:_Measures.Marge %"
        rc, out, st = self.p.deploy(self.model_spec("h1"), 1, env=env)
        self.assertApplied(rc, out, st)
        op = [o for o in st["plan"]["modelOps"] if o["id"] == oid][0]
        todo = [t for t in st["todos"] if t.get("id") == oid][0]
        self.assertEqual(len(op["hash"]), 64)
        self.assertEqual(todo["hash"], op["hash"])
        self.assertFalse(op["approved"])
        appr = self.p.mk / "model-approvals.json"
        appr.write_text(json.dumps({"approvals": [
            {"id": oid, "hash": "0" * 64, "by": "Test", "at": LR.now_iso()}]}),
            encoding="utf-8")
        rc, out, st = self.p.deploy(self.model_spec("h1"), 2, env=env)
        self.assertApplied(rc, out, st)
        self.assertEqual(self.te_calls("add"), [])
        todo = [t for t in st["todos"] if t.get("id") == oid][0]
        self.assertTrue(todo.get("staleApproval"), todo)
        self.assertIn("erneut freigeben", todo["text"])
        appr.write_text(json.dumps({"approvals": [
            {"id": oid, "hash": op["hash"], "by": "Test", "at": LR.now_iso()}]}),
            encoding="utf-8")
        rc, out, st = self.p.deploy(self.model_spec("h1"), 3, env=env)
        self.assertApplied(rc, out, st)
        self.assertEqual(len(self.te_calls("add")), 1)
        done = json.loads((self.p.mk / ".state" / "model-applied.json").read_text(
            encoding="utf-8"))[oid]
        self.assertEqual((done["status"], done["hash"], done["by"]),
                         ("applied", op["hash"], "Test"))
        # geänderter Vorschlag: der Hash passt nicht mehr
        spec = self.model_spec("h4")
        spec["newFields"][0]["dax"] = "DIVIDE([Marge], [Umsatz]) * 100"
        sys.path.insert(0, str(AGENT))
        import model_ops as MO
        sys.path.pop(0)
        self.assertNotEqual(MO.op_hash({"kind": "addMeasure", "target": op["target"],
                                        "after": {"expression": "x"}}), op["hash"])

    # --- Instanz festnageln, doppelte Fenster, busy ---------------------------- #
    def test_pin_pid_duplicates_and_busy(self):
        self.p.default_args = ["--no-install"]
        before = self.p.report_hash()
        # Safety (6): festgenagelte pid lebt noch (anderes Projekt offen) -> blockiert
        other = self.p.tmp / "Anderes.pbip"
        self.p.set_bridge(extraInstances=[{"pid": 4343, "currentFilePath": str(other)}])
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1, "--pin-pid", "4343")
        self.assertEqual((rc, st["state"]), (2, "blocked"), out[-1500:])
        self.assertIn("pid 4343", st["message"])
        self.assertIn("Externe Tools", st["message"])
        self.assertEqual(st["desktop"]["pinnedPid"], 4343)
        self.assertEqual(before, self.p.report_hash())
        self.p.set_bridge(extraInstances=[{"pid": 4343, "currentFilePath": str(self.p.pbip)}])
        rc, out, st = self.p.deploy(F.base_spec("h1"), 2)
        self.assertEqual((rc, st["state"]), (2, "blocked"), out[-1500:])
        self.assertIn("2 Desktop-Fenstern", st["message"])
        self.assertEqual(st["desktop"]["duplicates"], [4242, 4343])
        self.assertEqual(before, self.p.report_hash())
        self.p.set_bridge(busy=2)
        rc, out, st = self.p.deploy(F.base_spec("h1"), 3, "--busy-backoff", "0.1")
        self.assertApplied(rc, out, st)
        self.assertEqual(st["desktop"]["busyRetries"], 2)
        calls = [c for c in self.p.calls() if c[0] == "status"]
        self.assertGreaterEqual(len(calls), 3)
        busy = [c for c in st["desktop"]["calls"] if c.get("busy")]
        self.assertEqual(len(busy), 2)
        self.assertTrue(all(c["via"] == "bridge" for c in st["desktop"]["calls"]))
        rc, out, st = self.p.deploy(F.base_spec("h2"), 4, "--pin-pid", "4242")
        self.assertApplied(rc, out, st)
        # Safety (6): Desktop von Hand neu gestartet (pid 999 gibt es nicht mehr, genau eine
        # Instanz hat das Projekt): Festnagelung zieht um statt Sackgasse
        spec = F.base_spec("h3")
        F.find_visual(spec, "kpi1")["rect"]["x"] = 40
        rc, out, st = self.p.deploy(spec, 5, "--pin-pid", "999")
        self.assertApplied(rc, out, st)
        self.assertEqual(st["desktop"]["repinned"], {"from": 999, "to": 4242})
        self.assertEqual(st["runner"]["pinnedPid"], 4242)
        self.assertIn("umgezogen", self.steps(st)["bridge"]["msg"])

    # --- .gitignore: alte Form wird ersetzt, eigene Zeilen bleiben ------------- #
    def test_gitignore_allowlist_with_git(self):
        self.p.default_args = ["--no-install"]
        (self.p.mk / ".gitignore").write_text("out/\nbackup/\nshots/\nnotizen/\n",
                                              encoding="utf-8")
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1)
        self.assertApplied(rc, out, st)
        text = (self.p.mk / ".gitignore").read_text(encoding="utf-8")
        rules = [l for l in text.splitlines() if l.strip() and not l.startswith("#")]
        self.assertEqual(rules[0], "*")
        self.assertIn("notizen/", rules)
        self.assertNotIn("out/", rules)
        git = shutil.which("git")
        if not git:
            self.skipTest("git fehlt")
        (self.p.mk / "AGENT-BRIEF.md").write_text("# Brief\n", encoding="utf-8")
        (self.p.mk / "model-approvals.json").write_text("{}", encoding="utf-8")
        subprocess.run([git, "init", "-q", str(self.p.root)], check=True)
        cp = subprocess.run([git, "-C", str(self.p.root), "status", "--porcelain",
                             "--untracked-files=all", "mockup"], capture_output=True, text=True,
                            encoding="utf-8")
        listed = sorted(l[3:].strip().strip('"') for l in cp.stdout.splitlines())
        self.assertEqual(listed, ["mockup/.gitignore", "mockup/AGENT-BRIEF.md",
                                  "mockup/README.md", "mockup/mockup-spec.json",
                                  "mockup/model-approvals.json"])


# --------------------------------------------------------------------------- #
# Beta 02.10.2026: mk-live (doctor, start/stop, diag, register-tool, setup, Launcher)
# --------------------------------------------------------------------------- #
class MkLiveTests(unittest.TestCase):
    maxDiff = None

    def setUp(self):
        self.p = Project()
        self.home = self.p.tmp / "mk-home"
        self.procs = []

    def tearDown(self):
        for proc in self.procs:                  # eigene Hilfsprozesse, nie fremde
            try:
                import psutil
                psutil.Process(proc).kill()
            except Exception:                    # noqa: BLE001
                pass
        if os.environ.get("MK_KEEP"):
            print("\n  behalten: %s" % self.p.root)
        else:
            self.p.cleanup()

    def env(self, **extra):
        e = self.p.env(MK_PBIR=str(FAKE_PBIR), MK_BRIDGE_CMD=str(SHIM))
        e.update({k: str(v) for k, v in extra.items()})
        return e

    def mk(self, *args, env=None, timeout=300, script=MK_LIVE):
        cp = subprocess.run([sys.executable, str(script)] + [str(a) for a in args],
                            capture_output=True, text=True, encoding="utf-8", errors="replace",
                            timeout=timeout, env=env or self.env())
        return cp.returncode, cp.stdout + cp.stderr

    def system(self, processes, pipes):
        path = self.p.tmp / "system.json"
        path.write_text(json.dumps({"processes": processes, "pipes": pipes}), encoding="utf-8")
        return path

    def checks(self, doc):
        out = {}
        for c in doc["checks"]:
            out.setdefault(c["id"], []).append(c)
        return out

    def set_compat(self, level):
        db = self.p.model / "definition" / "database.tmdl"
        text = db.read_text(encoding="utf-8")
        import re as _re
        db.write_text(_re.sub(r"compatibilityLevel: \d+", "compatibilityLevel: %d" % level,
                              text), encoding="utf-8")

    # --- doctor -------------------------------------------------------------- #
    def test_doctor_json_and_text(self):
        te_cfg = self.p.tmp / "fake_te.json"
        te_cfg.write_text(json.dumps({"banner": True, "version": "0.9.3-preview"}),
                          encoding="utf-8")
        sysf = self.system([{"pid": 4242, "name": "PBIDesktop.exe",
                             "cmdline": '"C:\\PBI\\PBIDesktop.exe" "%s"' % self.p.pbip},
                            {"pid": 5672, "name": "PBIDesktop.exe", "cmdline": "PBIDesktop.exe"}],
                           ["pbi-desktop-bridge-4242"])
        env = self.env(MK_TE=FAKE_TE, FAKE_TE_CONFIG=te_cfg, FAKE_TE_PYTHON=sys.executable,
                       MK_DOCTOR_SYSTEM=sysf, PBI_DESKTOP_PATH=SHIM)
        self.set_compat(1600)
        rc, out = self.mk("doctor", self.p.root, "--json", env=env)
        doc = json.loads(out[out.index("{"):])
        c = self.checks(doc)
        self.assertEqual(c["te"][0]["state"], "green", c["te"])
        self.assertEqual(c["te"][0]["expires"], "2026-10-31")
        self.assertIn("Preview bis 2026-10-31", c["te"][0]["detail"])
        self.assertEqual(c["desktop"][0]["state"], "green", c["desktop"])
        self.assertEqual(c["desktop"][0]["pid"], 4242)
        self.assertEqual([x["pid"] for x in c["bridge"]], [5672])
        self.assertIn("Sicherheit", c["bridge"][0]["fix"])
        self.assertEqual(c["compat"][0]["state"], "green")
        self.assertEqual(c["unapplied"][0]["state"], "green")
        self.assertEqual(c["gitignore"][0]["state"], "green")
        self.assertEqual(c["visuals"][0]["state"], "yellow")
        self.assertEqual(c["theme"][0]["state"], "yellow")
        self.assertEqual(c["helper"][0]["state"], "info")
        self.assertEqual(c["pbir"][0]["state"], "green")
        self.assertEqual(doc["pinned"], {"pbir": "0.9.32",
                                         "powerbi-desktop-bridge-cli": "0.1.1"})
        self.assertEqual(c["pbipReload"][0]["state"], "info")
        self.assertIn("nicht prüfbar", c["pbipReload"][0]["detail"])
        self.assertEqual(doc["versions"]["teExpires"], "2026-10-31")
        self.assertTrue(all(x.get("fix") for x in doc["checks"]
                            if x["state"] in ("yellow", "red")), doc["checks"])
        self.assertEqual(doc["overall"], "yellow")
        written = json.loads((self.p.mk / "doctor.json").read_text(encoding="utf-8"))
        self.assertEqual(written["overall"], "yellow")
        self.assertTrue(LR.gitignore_complete(self.p.mk / ".gitignore"))
        self.assertEqual(rc, 0)
        # rot: compatibilityLevel, unappliedChanges, zweites Fenster, te abgelaufen (gelb)
        self.set_compat(1567)
        (self.p.model / "unappliedChanges.json").write_text("{}", encoding="utf-8")
        te_cfg.write_text(json.dumps({"expired": True}), encoding="utf-8")
        sysf = self.system([{"pid": 4242, "name": "PBIDesktop.exe", "cmdline": "x"},
                            {"pid": 4343, "name": "PBIDesktop.exe",
                             "cmdline": 'PBIDesktop.exe "%s"' % self.p.pbip}],
                           ["pbi-desktop-bridge-4242", "pbi-desktop-bridge-4343"])
        env["MK_DOCTOR_SYSTEM"] = str(sysf)
        rc, out = self.mk("doctor", self.p.root, env=env)
        self.assertEqual(rc, 1, out)
        doc = json.loads((self.p.mk / "doctor.json").read_text(encoding="utf-8"))
        c = self.checks(doc)
        self.assertEqual(doc["overall"], "red")
        self.assertEqual(c["compat"][0]["state"], "red")
        self.assertEqual(c["unapplied"][0]["state"], "red")
        self.assertEqual(c["desktop"][0]["state"], "red")
        self.assertIn("4343", c["desktop"][0]["detail"])
        self.assertEqual((c["te"][0]["state"], c["te"][0]["expires"]), ("yellow", "2026-09-30"))
        for word in ("ROT ", "GELB", "→", "Ergebnis: rot"):
            self.assertIn(word, out)
        self.assertNotIn("—", out)

    def test_doctor_without_pbip_is_red_blocking(self):
        empty = self.p.tmp / "leer"
        empty.mkdir()
        (empty / "Bericht.pbix").write_bytes(b"x")
        rc, out = self.mk("doctor", empty, "--json", env=self.env(
            MK_DOCTOR_SYSTEM=self.system([], [])))
        doc = json.loads(out[out.index("{"):])
        proj = self.checks(doc)["project"][0]
        self.assertEqual((proj["state"], proj.get("blocking")), ("red", True))
        self.assertIn("Bericht.pbix", proj["detail"])
        self.assertIn("PBIR", proj["fix"])
        self.assertEqual(rc, 1)

    # --- diag ---------------------------------------------------------------- #
    def test_diag_zip(self):
        sys.path.insert(0, str(AGENT))
        import mk_live as MK
        sys.path.pop(0)
        self.p.default_args = ["--no-install"]
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1)
        self.assertEqual(st["state"], "applied", out[-1500:])
        rc, out = self.mk("diag", self.p.root, env=self.env(
            MK_DOCTOR_SYSTEM=self.system([], [])))
        self.assertEqual(rc, 0, out)
        path = Path(out.split("Diagnose: ", 1)[1].split(" (", 1)[0])
        self.assertTrue(path.is_file(), out)
        self.assertEqual(path.resolve().parent, (self.p.mk / ".state" / "diag").resolve())
        with zipfile.ZipFile(path) as z:
            names = set(z.namelist())
            versions = json.loads(z.read("versions.json"))
        for n in ("LIESMICH.txt", "versions.json", "mockup/agent-status.json",
                  "mockup/doctor.json", "mockup/.state/runner.log",
                  "mockup/.state/history.json"):
            self.assertIn(n, names)
        # Safety (8/4): ohne --with-images keine Bilder und keine Konverter-Ausgabe, Pfade
        # mit Benutzernamen auf <du> gekürzt
        self.assertFalse(any(n.startswith(("mockup/shots/", "mockup/kitchen/", "mockup/out/"))
                             for n in names), names)
        self.assertEqual(versions["seq"], 1)
        self.assertEqual(versions["pinned"]["pbir"], "0.9.32")
        self.assertIn("runner", versions)
        self.assertFalse(versions["withImages"])
        user = Path.home().name
        root_forms = {str(self.p.root), str(self.p.root).replace("\\", "\\\\"),
                      str(self.p.root).replace("\\", "/")}
        with zipfile.ZipFile(path) as z:
            for n in names:
                if n.endswith((".json", ".log", ".txt")):
                    text = z.read(n).decode("utf-8", "replace")
                    self.assertNotIn("Users\\%s" % user, text, n)
                    self.assertNotIn("Users\\\\%s" % user, text, n)
                    self.assertNotIn("Users/%s" % user, text, n)
                    # Safety-Review 2 (8): Benutzername auch nicht in anderen Ordnernamen,
                    # Projektordner (samt Kundenordnern darüber) als <Projekt>
                    self.assertNotIn(user.lower(), text.lower(), n)
                    for f in root_forms:
                        self.assertNotIn(f.lower(), text.lower(), n)
            status = z.read("mockup/agent-status.json").decode("utf-8")
            self.assertIn("<Projekt>", status)
            readme = z.read("LIESMICH.txt").decode("utf-8")
            self.assertIn("Ohne Bilder", readme)
            self.assertIn("<Projekt>", readme)
        self.assertEqual(MK.scrub_text(
            r'{"p": "C:\\Users\\Max\\Kunde X\\Proj\\a.pbip", "s": "C:\\tmp\\c--Users-Max-Desk"}',
            r"C:\Users\Max\Kunde X\Proj", ["Max"]),
            r'{"p": "<Projekt>\\a.pbip", "s": "C:\\tmp\\c--Users-<du>-Desk"}')
        self.assertEqual(MK.scrub_text("C:/Users/Max/Kunde X/Proj/x Maximum", r"C:\Users\Max\Kunde X\Proj",
                                       ["Max"]), "<Projekt>/x Maximum")
        # mit --with-images: Bilder des letzten Deploys und out/
        rc, out = self.mk("diag", self.p.root, "--with-images", env=self.env(
            MK_DOCTOR_SYSTEM=self.system([], [])))
        self.assertEqual(rc, 0, out)
        path2 = Path(out.split("Diagnose: ", 1)[1].split(" (", 1)[0])
        with zipfile.ZipFile(path2) as z:
            names2 = set(z.namelist())
        self.assertIn("mockup/out/plan.json", names2)
        self.assertTrue(any(n.startswith("mockup/shots/1/") and n.endswith(".page.png")
                            for n in names2), names2)
        self.assertEqual(MK.shorten_user_paths(r'"C:\\Users\\Max Muster\\x"'
                                               ' C:/Users/Ann/y C:\\Users\\Public\\z'),
                         r'"C:\\Users\\<du>\\x" C:/Users/<du>/y C:\Users\Public\z')

    # --- losgelöster Start ---------------------------------------------------- #
    def test_detached_spawn_survives_parent_kill(self):
        if os.name != "nt":
            self.skipTest("nur Windows")
        import psutil
        marker = self.p.tmp / "pids.json"
        parent = self.p.tmp / "parent.py"
        parent.write_text(
            "import json, subprocess, sys, time\n"
            "sys.path.insert(0, %r)\n"
            "import mk_live\n"
            "sleeper = [sys.executable, '-c', 'import time; time.sleep(60)']\n"
            "free = mk_live.spawn_detached(sleeper, log_path=%r)\n"
            "child = subprocess.Popen(sleeper)\n"
            "open(%r, 'w').write(json.dumps({'free': free, 'child': child.pid}))\n"
            "time.sleep(120)\n" % (str(AGENT), str(self.p.tmp / "free.log"), str(marker)),
            encoding="utf-8")
        proc = subprocess.Popen([sys.executable, str(parent)], env=self.env())
        self.procs.append(proc.pid)
        deadline = time.time() + 60
        while time.time() < deadline and not marker.is_file():
            time.sleep(0.2)
        pids = json.loads(marker.read_text(encoding="utf-8"))
        self.procs += [pids["free"], pids["child"]]
        self.assertTrue(psutil.pid_exists(pids["free"]))
        self.assertNotEqual(psutil.Process(pids["free"]).ppid(), proc.pid)
        subprocess.run(["taskkill", "/PID", str(proc.pid), "/T", "/F"], capture_output=True)
        time.sleep(1.5)
        self.assertFalse(psutil.pid_exists(pids["child"]), "Gegenprobe: Kind im Baum lebt noch")
        self.assertTrue(psutil.pid_exists(pids["free"]), "losgelöster Prozess wurde beendet")
        self.assertIn("time.sleep(60)", " ".join(psutil.Process(pids["free"]).cmdline()))

    def test_start_stop_and_no_second_runner(self):
        env = self.env(MK_DOCTOR_SYSTEM=self.system([], []))
        rc, out = self.mk("start", self.p.root, "--no-browser", "--", "--no-install", env=env)
        self.assertEqual(rc, 0, out)
        self.assertIn("Live-Helfer läuft", out)
        self.assertIn("live=1&project=PBI-IBCS-Testbed", out)
        sess = json.loads((self.p.mk / "desktop-session.json").read_text(encoding="utf-8"))
        self.assertEqual(sess["projectPath"], str(self.p.root.resolve()))
        self.assertEqual(sess["pid"], 4242)
        self.procs.append(sess["runnerPid"])
        st = self.p.status()
        self.assertEqual(st["runner"]["sessionId"], sess["sessionId"])
        self.assertEqual(st["runner"]["pid"], sess["runnerPid"])
        # zweiter Start: kein zweiter Runner
        rc, out = self.mk("start", self.p.root, "--no-browser", env=env)
        self.assertEqual(rc, 0, out)
        self.assertIn("läuft schon", out)
        self.assertEqual(json.loads((self.p.mk / "desktop-session.json").read_text(
            encoding="utf-8"))["sessionId"], sess["sessionId"])
        # der Runner arbeitet einen Deploy ab
        self.p.deploy_files(F.base_spec("h1"), 1)
        st = self.p.wait_status(lambda s: s.get("seq") == 1 and s.get("state") in LR.TERMINAL,
                                timeout=300)
        self.assertEqual(st["state"], "applied", st.get("message"))
        # stop ohne Projekt: der einzige laufende
        rc, out = self.mk("stop", env=env)
        self.assertEqual(rc, 0, out)
        self.assertIn("beendet", out)
        st = self.p.status()
        self.assertEqual(st["runner"]["state"], "stopped")
        import psutil
        deadline = time.time() + 15
        while time.time() < deadline and psutil.pid_exists(sess["runnerPid"]):
            time.sleep(0.3)
        self.assertFalse(psutil.pid_exists(sess["runnerPid"]))
        rc, out = self.mk("stop", env=env)
        self.assertIn("Kein laufender Live-Helfer", out)

    def test_start_replaces_differently_pinned_runner(self):
        """Safety (6): Desktop von Hand neu gestartet, Start aus der neuen Instanz (Externe
        Tools, --pin-pid) ersetzt den alten, anders festgenagelten Helfer. Safety (6b): die
        Start-Flags stehen in desktop-session.json, ohne Breakaway meldet doctor gelb."""
        import psutil
        env = self.env(MK_DOCTOR_SYSTEM=self.system([], []))
        rc, out = self.mk("start", self.p.root, "--no-browser", "--pin-pid", "4242", "--",
                          "--no-install", env=env)
        self.assertEqual(rc, 0, out)
        sess = json.loads((self.p.mk / "desktop-session.json").read_text(encoding="utf-8"))
        first = sess["runnerPid"]
        self.procs.append(first)
        self.assertIn("breakaway", sess["spawn"])
        self.assertTrue(sess["spawn"].get("innerFlags") or sess["spawn"].get("flags"))
        self.assertIn("packaged", sess["spawn"])           # Testprozess: kein Paketkontext
        self.assertIsNone(sess["spawn"]["packaged"])
        self.p.wait_status(lambda s: s["runner"].get("pinnedPid") == 4242, timeout=30)
        rc, out = self.mk("start", self.p.root, "--no-browser", "--pin-pid", "4343", "--",
                          "--no-install", env=env)
        self.assertEqual(rc, 0, out)
        self.assertIn("ersetzt", out)
        sess2 = json.loads((self.p.mk / "desktop-session.json").read_text(encoding="utf-8"))
        self.procs.append(sess2["runnerPid"])
        self.assertNotEqual(sess2["runnerPid"], first)
        self.p.wait_status(lambda s: s["runner"].get("pinnedPid") == 4343 and
                           s["runner"].get("pid") == sess2["runnerPid"], timeout=30)
        deadline = time.time() + 15
        while time.time() < deadline and psutil.pid_exists(first):
            time.sleep(0.3)
        self.assertFalse(psutil.pid_exists(first), "alter Helfer läuft noch")
        # gleiche Festnagelung: kein zweiter Start
        rc, out = self.mk("start", self.p.root, "--no-browser", "--pin-pid", "4343", env=env)
        self.assertIn("läuft schon", out)
        sess2["spawn"]["breakaway"] = False
        sess2["spawn"]["packaged"] = "Microsoft.MicrosoftPowerBIDesktop_2.149.0.0_x64__8wekyb3d8bbwe"
        (self.p.mk / "desktop-session.json").write_text(json.dumps(sess2), encoding="utf-8")
        rc, out = self.mk("doctor", self.p.root, "--json", env=env)
        doc = json.loads(out[out.index("{"):])
        spawn = self.checks(doc)["spawn"][0]
        self.assertEqual(spawn["state"], "yellow")
        self.assertIn("mk-live stop", spawn["fix"])
        pkg = self.checks(doc)["package"][0]              # Store-Desktop: nur Info
        self.assertEqual(pkg["state"], "info")
        self.assertIn("MicrosoftPowerBIDesktop", pkg["detail"])
        self.assertIn("%LOCALAPPDATA%", pkg["detail"])
        rc, out = self.mk("stop", self.p.root, env=env)
        self.assertEqual(rc, 0, out)

    # --- External Tools ------------------------------------------------------- #
    def test_register_tool_and_fallback(self):
        tools = self.p.tmp / "External Tools"
        rc, out = self.mk("register-tool", "--target-dir", tools)
        self.assertEqual(rc, 0, out)
        data = json.loads((tools / "MockupKitchen.pbitool.json").read_text(encoding="utf-8"))
        self.assertTrue(data["path"].lower().endswith("pythonw.exe"), data["path"])
        self.assertIn(str(MK_LAUNCH), data["arguments"])
        self.assertIn('"%server%"', data["arguments"])
        blocker = self.p.tmp / "datei"
        blocker.write_text("x", encoding="utf-8")
        rc, out = self.mk("register-tool", "--target-dir", blocker / "unter")
        self.assertEqual(rc, 2, out)
        self.assertTrue((self.home / "MockupKitchen.pbitool.json").is_file())
        self.assertIn("als Administrator", out)
        self.assertIn("copy /Y", out)

    def test_launcher_finds_project_and_starts_pinned(self):
        env = self.env(MK_LAUNCH_PID="4242", MK_DOCTOR_SYSTEM=self.system([], []))
        rc, out = self.mk("--server", "localhost:51234", "--database", "x", "--dry-run",
                          env=env, script=MK_LAUNCH)
        self.assertEqual(rc, 0, out)
        res = json.loads(out.strip().splitlines()[-1])
        self.assertEqual((res["pid"], res["project"]), (4242, str(self.p.root)))
        # .pbix offen: Hinweis statt Start
        pbix = self.p.tmp / "Alt.pbix"
        pbix.write_bytes(b"x")
        self.p.set_bridge(currentFilePath=str(pbix))
        rc, out = self.mk("--server", "localhost:51234", "--dry-run", env=env,
                          script=MK_LAUNCH)
        self.assertEqual(rc, 1, out)
        log = (self.home / "launch.log").read_text(encoding="utf-8")
        self.assertIn("Als PBIP mit PBIR speichern", log)
        # echter Start aus „Desktop": Runner festgenagelt auf pid 4242
        self.p.set_bridge()
        rc, out = self.mk("--server", "localhost:51234", "--no-browser", env=env,
                          script=MK_LAUNCH, timeout=120)
        self.assertEqual(rc, 0, out + (self.home / "launch.log").read_text(encoding="utf-8"))
        sess = json.loads((self.p.mk / "desktop-session.json").read_text(encoding="utf-8"))
        self.procs.append(sess["runnerPid"])
        self.assertEqual((sess["pid"], sess["pinned"]), (4242, True))
        self.assertIn("Externe Tools", sess["launcher"])
        st = self.p.wait_status(lambda s: s["runner"].get("pinnedPid") == 4242, timeout=30)
        self.assertEqual(st["runner"]["sessionId"], sess["sessionId"])
        rc, out = self.mk("stop", self.p.root, env=env)
        self.assertEqual(rc, 0, out)

    # --- setup ---------------------------------------------------------------- #
    def test_setup_writes_config_and_command(self):
        shim = self.p.tmp / "shim"
        rc, out = self.mk("setup", "--no-pip", env=self.env(MK_SHIM_DIR=shim,
                                                           MK_DOCTOR_SYSTEM=self.system([], [])),
                          timeout=300)
        self.assertIn("Einstellungen:", out)
        cfg = json.loads((self.home / "config.json").read_text(encoding="utf-8"))
        self.assertEqual(cfg["pinned"]["pbir"], "0.9.32")
        self.assertEqual(cfg["versions"]["pbir"], "0.9.32")
        self.assertEqual(cfg["kitchenUrl"], "https://datenwgknowledgekitchen.com/"
                                            "mockup-kitchen.html")
        self.assertIn("desktopExe", cfg)
        cmd = (shim / "mk-live.cmd").read_text(encoding="utf-8")
        self.assertIn(str(MK_LIVE), cmd)
        self.assertIn("%*", cmd)
        self.assertIn(rc, (0, 1))


# --------------------------------------------------------------------------- #
# Korrekturrunde 02.10.2026: Demo B1 bis B9 und Safety-Review Runde 1 (ohne pbir)
# --------------------------------------------------------------------------- #
class FixUnitTests(unittest.TestCase):
    PW, PH = CanvasTests.PW, CanvasTests.PH

    @classmethod
    def setUpClass(cls):
        cls.page = bytes(draw_page(cls.PW, cls.PH, CanvasTests.TILES))

    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix="mk-fix-unit-"))

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    # --- Safety-Review 2: Antwort nur nach der Frage, „geschlossen" nur, wenn wirklich zu --- #
    def test_r2_confirm_only_after_question(self):
        from types import SimpleNamespace as NS
        conf = self.tmp / "deploy-confirm.json"
        d = NS(p=NS(confirm=conf), seq=3, consumed=set(), r=NS(log=lambda m: None),
               CONFIRM_SKEW_S=LR.Deploy.CONFIRM_SKEW_S)
        since = "2026-10-03T10:00:00.000+02:00"
        opts = ["restart", "cancel"]
        LR.write_json_atomic(conf, {"seq": 3, "action": "restart",
                                    "at": "2026-10-03T09:00:00.000+02:00"})
        self.assertIsNone(LR.Deploy.read_confirm(d, opts, since))      # alt
        LR.write_json_atomic(conf, {"seq": 3, "action": "cancel"})
        self.assertIsNone(LR.Deploy.read_confirm(d, opts, since))      # ohne at
        LR.write_json_atomic(conf, {"seq": 3, "action": "restart",
                                    "at": "2026-10-03T09:59:59.000+02:00"})
        self.assertEqual(LR.Deploy.read_confirm(d, opts, since), "restart")   # Toleranz 2 s
        LR.write_json_atomic(conf, {"seq": 3, "action": "cancel", "at": "2026-10-03T08:00:05Z"})
        self.assertEqual(LR.Deploy.read_confirm(d, opts, since), "cancel")    # andere Zone

    def test_r2_probe_none_only_when_really_closed(self):
        from types import SimpleNamespace as NS
        d = NS(p=NS(pbip=None))
        alive, files = {"v": True}, {"v": []}
        orig = (LR.desktop_alive, LR.desktop_pids_with_file)
        LR.desktop_alive = lambda pid: alive["v"]
        LR.desktop_pids_with_file = lambda path: files["v"]
        try:
            f = LR.Deploy.project_still_open
            self.assertTrue(f(d, {"instances": []}, 4242))            # läuft, meldet sich nicht
            self.assertFalse(f(d, {"instances": [{"pid": 4242}]}, 4242))   # andere Datei offen
            alive["v"] = False
            self.assertFalse(f(d, {"instances": []}, 4242))           # wirklich beendet
            d.p.pbip = self.tmp / "X.pbip"
            files["v"] = [999]
            self.assertTrue(f(d, {"instances": []}, 4242))            # Fenster ohne Bridge
            self.assertFalse(f(d, {"instances": [{"pid": 999}]}, 4242))
        finally:
            LR.desktop_alive, LR.desktop_pids_with_file = orig

    def test_r3_idle_probe_reload_seq(self):
        """Safety-Review 2 (2): desktopLive nennt den Deploy des eigenen Reloads (reloadSeq),
        solange die Markierung „ungespeichert" vom Runner stammen kann; das Kitchen zeigt
        daraus die Bandzeile „… wird beim nächsten Deploy verworfen"."""
        from types import SimpleNamespace as NS
        marker = self.tmp / "desktop-reload.json"
        pbip = self.tmp / "X.pbip"
        inst = {"pid": 77, "currentFilePath": str(pbip), "hasUnsavedChanges": True}
        got = {}
        r = NS(desktop=NS(status=lambda wait=0: {"ok": True, "instances": [dict(inst)]}),
               p=NS(pbip=pbip, report=self.tmp / "X.Report", model=self.tmp / "X.SemanticModel",
                    reload_marker=marker),
               pin_pid=None, log=lambda m: None, status=NS(set_live=lambda d: got.update(live=d)))
        LR.write_json_atomic(marker, {"pid": 77, "at": LR.now_iso(), "seq": 5})
        LR.Runner.idle_probe(r)
        self.assertTrue(got["live"]["unsavedByUs"])
        self.assertEqual(got["live"]["reloadSeq"], 5)
        LR.write_json_atomic(marker, {"pid": 88, "at": LR.now_iso(), "seq": 6})   # andere Instanz
        LR.Runner.idle_probe(r)
        self.assertFalse(got["live"]["unsavedByUs"])
        self.assertNotIn("reloadSeq", got["live"])
        inst["hasUnsavedChanges"] = False                                         # gespeichert
        LR.write_json_atomic(marker, {"pid": 77, "at": LR.now_iso(), "seq": 7})
        LR.Runner.idle_probe(r)
        self.assertFalse(got["live"]["unsavedByUs"])
        self.assertNotIn("reloadSeq", got["live"])
        self.assertFalse(marker.exists())

    # --- B1 ------------------------------------------------------------------ #
    def test_batch_step_error_real_message(self):
        """Form aus pbir 0.9.32 (nachgestellt an der Demo-Kopie): result {}, die Meldung steht
        in failures[] am Schritt bzw. oben mit step_id. Nie „{}"."""
        step = {"id": "s3", "op": "set", "status": "error", "target_count": 1, "result": {},
                "failures": [{"code": "target_execution_failed",
                              "message": "Unknown component: title", "step_id": "s3"}]}
        self.assertEqual(LR.batch_step_error(step), "Unknown component: title")
        bare = {"id": "s1", "op": "move", "status": "error", "target_count": 1, "result": {}}
        res = {"failures": [{"step_id": "s1", "message": "Visual exceeds page height: y(986) + "
                             "height(95) = 1081 > page.height(1080)"}]}
        self.assertIn("exceeds page height", LR.batch_step_error(bare, res))
        msg = LR.batch_step_error(bare, {})
        self.assertNotIn("{}", msg)
        self.assertIn("ohne Meldung", msg)
        self.assertIn("runner.log", msg)

    def test_container_literal(self):
        self.assertEqual(LR.container_literal("color", "#E1DFD6"),
                         {"solid": {"color": {"expr": {"Literal": {"Value": "'#E1DFD6'"}}}}})
        self.assertEqual(LR.container_literal("radius", 12),
                         {"expr": {"Literal": {"Value": "12D"}}})
        self.assertEqual(LR.container_literal("show", False),
                         {"expr": {"Literal": {"Value": "false"}}})
        self.assertEqual(LR.container_literal("text", "Umsatz"),
                         {"expr": {"Literal": {"Value": "'Umsatz'"}}})

    def test_native_type_detection(self):
        class R:
            asked = 0

            def pbir_types(self):
                R.asked += 1
                return frozenset({"card", "neuesNativ"}), LR.CONTAINER_OBJECTS_FALLBACK

            def catalog_guids(self):
                return {"zugKpiOhneGuid"}
        r = R()
        for t in ("clusteredColumnChart", "shape", "slicer", "card"):
            self.assertTrue(LR.Runner.is_native(r, t), t)
        for t in (LR.CK_GUID, KPI_GUID, "pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358",
                  "zugKpiOhneGuid"):
            self.assertFalse(LR.Runner.is_native(r, t), t)
        self.assertEqual(R.asked, 0)                 # bekannte Typen ohne pbir-Aufruf
        self.assertTrue(LR.Runner.is_native(r, "neuesNativ"))
        self.assertFalse(LR.Runner.is_native(r, "fremdesVisual"))
        self.assertEqual(R.asked, 2)

    # --- B5 ------------------------------------------------------------------ #
    def test_shot_defaults(self):
        old = {k: os.environ.pop(k, None) for k in ("MK_SHOT_WAIT", "MK_SHOT_BUDGET")}
        try:
            opt = LR.build_parser().parse_args(["once", "x"])
        finally:
            for k, v in old.items():
                if v is not None:
                    os.environ[k] = v
        self.assertEqual((opt.shot_wait, opt.shot_budget), (8.0, 30.0))

    def test_canvas_fallback_to_remembered_rect(self):
        import random
        box = (40, 160, 40 + 1280, 160 + 720)
        good = TC.Gray(1600, 1000, desktop_view(self.page, self.PW, self.PH, 1600, 1000, box,
                                                40, pane=200), "t")
        c = TC.find_canvas(good, self.PW, self.PH)
        self.assertTrue(c["ok"] and c["reliable"], c)
        self.assertEqual((c["how"], c["img"]), ("erkannt", [1600, 1000]))
        hint = c["box"]
        same = TC.find_canvas(good, self.PW, self.PH, hint=hint)
        self.assertEqual((same["how"], same["reliable"], same["box"]), ("erkannt", True, hint))
        # Seitenfläche nicht erkennbar (große helle Flächen o. ä.): gemerktes Rechteck, unsicher
        rnd = random.Random(5)
        noise = TC.Gray(1600, 1000, bytes(rnd.randrange(256) for _ in range(1600 * 1000)), "t")
        self.assertFalse(TC.find_canvas(noise, self.PW, self.PH)["ok"])
        g = TC.find_canvas(noise, self.PW, self.PH, hint=hint)
        self.assertEqual((g["ok"], g["how"], g["reliable"], g["box"]),
                         (True, "gemerkt", False, list(hint)))
        self.assertIn("früheren Aufnahme", g["note"])
        # eine sichere neue Erkennung schlägt ein gemerktes Rechteck anderer Größe
        other = [hint[0], hint[1], hint[2] - 100, hint[3] - 56]
        s = TC.find_canvas(good, self.PW, self.PH, hint=other)
        self.assertEqual((s["how"], s["reliable"], s["box"]), ("erkannt", True, hint))
        # Zuschnitt, Vergleich und Warten aufs Zeichnen mit gemerktem Rechteck
        src = self.tmp / "noise.png"
        TC.write_gray_png(src, 1600, 1000, noise.px)
        crop = TC.crop_page(src, self.PW, self.PH, self.tmp / "noise.page.png",
                            hint=lambda w, h: hint if (w, h) == (1600, 1000) else None)
        self.assertEqual((crop["ok"], crop["how"], crop["reliable"]), (True, "gemerkt", False))
        k = self.tmp / "k.png"
        TC.write_gray_png(k, self.PW, self.PH, self.page)
        tiles = {"t0": {"page": "S", "rect": CanvasTests.TILES[0]["rect"], "headH": 36,
                        "title": "x"}}
        out = TC.compare_page(k, src, self.PW, self.PH, tiles, hint=hint)
        self.assertTrue(out["ok"])
        self.assertFalse(out["reliable"])
        self.assertFalse(out["tiles"]["t0"]["reliable"])
        self.assertTrue(any("unsicher" in n for n in out["tiles"]["t0"]["notes"]))
        res = TC.wait_for_render(lambda: (str(src), None), self.PW, self.PH, {}, max_wait=3,
                                 interval=0.01, sleep=lambda s: None, hint=hint)
        self.assertEqual(res["canvas"]["how"], "gemerkt")
        self.assertIn("früheren Aufnahme", res["note"])

    # --- Safety (5), (8/4), B8 ----------------------------------------------- #
    def test_approval_hash_covers_overrides(self):
        import hashlib
        sys.path.insert(0, str(AGENT))
        import model_ops as MO
        sys.path.pop(0)
        op = {"kind": "addMeasure", "ref": "_Measures.Marge %", "target": "_Measures/Marge %",
              "table": "_Measures",
              "after": {"expression": "DIVIDE([Marge], [Umsatz])", "formatString": "0.0 %"}}
        op["hash"] = MO.op_hash(op)
        self.assertIn(op["hash"], MO.approval_hashes(op))
        ov = {"dax": "DIVIDE([Marge], [Umsatz], 0)"}
        hs = MO.approval_hashes(op, ov)
        self.assertNotIn(op["hash"], hs)
        self.assertIn(MO.op_hash(dict(op, after={"expression": ov["dax"],
                                                 "formatString": "0.0 %"})), hs)
        # so rechnet das Kitchen 0.6: target aus der Op-ID, after mit dem bearbeiteten DAX
        content = json.dumps({"expression": ov["dax"], "formatString": "0.0 %"},
                             sort_keys=True, ensure_ascii=False, separators=(",", ":"))
        kitchen = hashlib.sha256(("addMeasure\n_Measures.Marge %\n" + content)
                                 .encode("utf-8")).hexdigest()
        self.assertIn(kitchen, hs)
        ren = {"kind": "rename", "ref": "_Measures.AC", "target": "_Measures/AC",
               "table": "_Measures", "newRef": "_Measures.Ist"}
        self.assertIn(MO.op_hash(dict(ren, newRef="_Measures.Istwert")),
                      MO.approval_hashes(ren, {"alias": "Istwert"}))

    def test_visual_schemas_newer_and_user_paths(self):
        sys.path.insert(0, str(AGENT))
        import mk_live as MK
        sys.path.pop(0)
        for i, ver in enumerate(("2.9.0", "2.10.0", "2.12.0", "2.10.0")):
            d = self.tmp / "R.Report" / "definition" / "pages" / "p" / "visuals" / ("v%d" % i)
            d.mkdir(parents=True)
            (d / "visual.json").write_text(json.dumps({"$schema": "https://developer.microsoft"
                                                       ".com/json-schemas/fabric/item/report/"
                                                       "definition/visualContainer/%s/schema"
                                                       ".json" % ver}), encoding="utf-8")
        self.assertEqual(MK.visual_schemas_newer(self.tmp / "R.Report", "2.9.0"),
                         ["2.10.0", "2.12.0"])
        self.assertEqual(MK.shorten_user_paths(
            '"C:\\\\Users\\\\Max Muster\\\\x" C:/Users/Ann/y C:\\Users\\Public\\z '
            'C:\\Users\\BENUTZ~1\\AppData'),
            '"C:\\\\Users\\\\<du>\\\\x" C:/Users/<du>/y C:\\Users\\Public\\z '
            'C:\\Users\\<du>\\AppData')


# --------------------------------------------------------------------------- #
# Korrekturrunde 02.10.2026: Demo B1 bis B9 und Safety-Review Runde 1 (echtes pbir)
# --------------------------------------------------------------------------- #
class FixTests(unittest.TestCase):
    maxDiff = None
    accept_report_json = V2Tests.accept_report_json
    report_json = V2Tests.report_json
    registered = V2Tests.registered
    steps = V2Tests.steps
    spec_v2 = V2Tests.spec_v2
    model_env = V2Tests.model_env
    te_calls = V2Tests.te_calls
    model_spec = V2Tests.model_spec
    assertApplied = V2Tests.assertApplied
    obj = V2Tests.obj
    verbs = BetaTests.verbs

    def setUp(self):
        self.p = Project()
        self.p.default_args = ["--close-cmd", str(FAKE_CLOSE), "--desktop-timeout", "8"]

    def tearDown(self):
        self.assertEqual(self.p.protected_hashes(), self.p.protected,
                         "geschuetzte Dateien unerwartet veraendert")
        if os.environ.get("MK_KEEP"):
            print("\n  behalten: %s" % self.p.root)
        else:
            self.p.cleanup()

    def changed(self, before) -> list:
        after = self.p.report_hash()
        return sorted(k for k in set(before) | set(after) if before.get(k) != after.get(k))

    def log_text(self) -> str:
        return "".join(p.read_text(encoding="utf-8", errors="replace")
                       for p in sorted((self.p.mk / ".state").glob("runner.log*")))

    def todo_of(self, st, oid):
        hits = [t for t in st["todos"] if t.get("id") == oid]
        return hits[0] if hits else None

    def fields_clean(self):
        v = self.p.validate()
        problems = (v.get("errors") or []) + [w for w in v.get("warnings") or []
                                              if str(w.get("code")).startswith("FIELD")]
        self.assertEqual(problems, [], "pbir validate --fields meldet Befunde")

    # --- B1: Custom Visuals nie über pbir batch ---------------------------------- #
    def test_b1_custom_visuals_written_directly_not_batched(self):
        log = self.p.tmp / "pbir.jsonl"
        env = {"FAKE_PBIR_BATCH_CUSTOM": "empty", "FAKE_PBIR_LOG": str(log)}
        self.p.default_args = ["--no-install", "--pbir", str(FAKE_PBIR)]
        self.p.add_ck_reference()
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1, env=env)
        self.assertApplied(rc, out, st)
        uid = self.p.pages()["Übersicht"]
        # fremdes Custom Visual (GuV) neben der ChartKitchen-Referenz, wie in der Demo
        src = self.p.report / "definition" / "pages" / CK_REF_PAGE / "visuals" / CK_REF_VISUAL
        dst = src.parent / "fremd_pnl"
        shutil.copytree(src, dst)
        vj = json.loads((dst / "visual.json").read_text(encoding="utf-8"))
        vj["name"] = "fremd_pnl"
        vj["visual"]["visualType"] = "pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358"
        vj["position"].update(x=400, y=20)
        (dst / "visual.json").write_text(json.dumps(vj, indent=2), encoding="utf-8")
        # Kitchen liest ein (baseline), danach im Kitchen verschoben und umbenannt
        base = F.base_spec("b1")
        base["meta"]["exportedAt"] = "2026-09-28T15:00:00.000+02:00"
        cko = F.ck_bars("cko", "Seite 1", "", "DimRegion.Region", "_Measures.AC",
                        ["_Measures.PL"], 10, 0, w=280, h=280)
        cko["pbir"] = {"page": CK_REF_PAGE, "visual": CK_REF_VISUAL}
        pnl = F.card("pnl", "Seite 1", "GuV", "_Measures.AC", 400, 20, w=280, h=280)
        pnl["pbir"] = {"page": CK_REF_PAGE, "visual": "fremd_pnl"}
        base["pages"].append({"id": "pg9", "index": 9, "name": "Seite 1",
                              "pbir": {"page": CK_REF_PAGE}, "question": "", "notes": "",
                              "contentRect": base["pages"][0]["contentRect"],
                              "layoutTree": None, "visuals": [cko, pnl]})
        (self.p.mk / "baseline-spec.json").write_text(json.dumps(base, ensure_ascii=False),
                                                      encoding="utf-8")
        spec = json.loads(json.dumps(base))
        spec["meta"].update({"specHash": "h2", "exportedAt": "2026-09-28T15:05:00.000+02:00"})
        F.find_visual(spec, "cko")["rect"]["x"] = 30
        F.find_visual(spec, "pnl")["rect"].update({"x": 430, "y": 30})
        F.find_visual(spec, "pnl")["title"] = "GuV neu"
        F.find_visual(spec, "kpi1")["rect"]["x"] = 40
        log.write_text("", encoding="utf-8")
        rc, out, st = self.p.deploy(spec, 2, env=env)
        self.assertApplied(rc, out, st)
        for k in ("cko", "pnl", "kpi1"):
            self.assertIn(st["visuals"][k]["state"], ("applied", "ok"), st["visuals"][k])
            self.assertNotIn("{}", st["visuals"][k]["msg"])
        self.assertEqual(self.p.visual(CK_REF_VISUAL, CK_REF_PAGE)["position"]["x"], 30)
        fp = self.p.visual("fremd_pnl", CK_REF_PAGE)
        self.assertEqual((fp["position"]["x"], fp["position"]["y"]), (430, 30))
        self.assertEqual(fp["visual"]["visualType"],
                         "pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358")   # fremd: Typ bleibt
        self.assertEqual(self.p.visual("mk_kpi1", uid)["position"]["x"], 40)
        batches = [json.loads(l)["batch"] for l in log.read_text(encoding="utf-8").splitlines()
                   if l.strip() and "batch" in json.loads(l)]
        self.assertTrue(batches)                        # kpi1 (nativ) über pbir batch
        self.assertEqual([s for b in batches for s in b if s[1] != "native"], [], batches)
        self.assertIn("direkt in visual.json", self.steps(st)["write"]["msg"])
        self.assertIn("direkt geschrieben", self.log_text())
        self.assertLess(st["pbirCalls"], 30)
        # nativer Schritt scheitert: pbirs echte Meldung im Status, Rohausgabe im Protokoll
        spec3 = json.loads(json.dumps(spec))
        spec3["meta"]["specHash"] = "h3"
        F.find_visual(spec3, "kpi2")["rect"]["x"] = 1700        # 1700 + 440 > 1920
        rc, out, st = self.p.deploy(spec3, 3, env=env)
        self.assertApplied(rc, out, st)
        self.assertEqual(st["visuals"]["kpi2"]["state"], "error")
        self.assertIn("exceeds page width", st["visuals"]["kpi2"]["msg"])
        self.assertIn("pbir batch run live-batch.json", self.log_text())
        # bekannter Dauerfehler bei unveränderter Kachel: einmal erneut, dann nicht mehr
        spec3["meta"]["specHash"] = "h4"
        rc, out, st = self.p.deploy(spec3, 4, env=env)
        self.assertIn("exceeds page width", st["visuals"]["kpi2"]["msg"])
        n = len(log.read_text(encoding="utf-8").splitlines())
        spec3["meta"]["specHash"] = "h5"
        rc, out, st = self.p.deploy(spec3, 5, env=env)
        self.assertApplied(rc, out, st)
        self.assertEqual(st["visuals"]["kpi2"]["state"], "error")
        self.assertIn("Nicht erneut versucht", st["visuals"]["kpi2"]["msg"])
        later = [json.loads(l) for l in log.read_text(encoding="utf-8").splitlines()[n:]]
        self.assertFalse(any("batch" in e for e in later), later)
        mem = json.loads((self.p.mk / ".state" / "failures.json").read_text(encoding="utf-8"))
        self.assertEqual((mem["kpi2"]["since"], mem["kpi2"]["permanent"]), (3, True))

    # --- B9: Typwechsel eines eigenen Visuals ----------------------------------- #
    def test_b9_own_native_type_change_replaced_foreign_stays(self):
        self.p.default_args = ["--no-install"]
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1)
        self.assertApplied(rc, out, st)
        uid = self.p.pages()["Übersicht"]
        self.assertEqual(self.p.created()[uid]["mk_kpi1"]["type"], "card")
        rep = self.p.report.as_posix()
        rc2, o2 = self.p.pbir("add", "visual", "card", "%s/Übersicht.Page" % rep, "-n",
                              "mk_kpi9", "-x", 24, "-y", 800, "-w", 300, "-h", 150)
        self.assertEqual(rc2, 0, o2)                      # in Desktop angelegt (fremd)
        spec = F.base_spec("h2")
        vis = spec["pages"][0]["visuals"]
        vis[0] = F.column("kpi1", "Übersicht", "Umsatz je Region", "DimRegion.Region",
                          "_Measures.Umsatz", 24, 96)
        vis.append(F.column("kpi9", "Übersicht", "Fremd", "DimRegion.Region", "_Measures.AC",
                            24, 800, w=600, h=250))
        rc, out, st = self.p.deploy(spec, 2)
        self.assertApplied(rc, out, st)
        self.assertEqual(self.p.visual("mk_kpi1", uid)["visual"]["visualType"],
                         "clusteredColumnChart")
        self.assertIn("Typ gewechselt (card → clusteredColumnChart)", st["visuals"]["kpi1"]["msg"])
        self.assertEqual(self.p.created()[uid]["mk_kpi1"]["type"], "clusteredColumnChart")
        self.assertEqual(self.p.visual("mk_kpi9", uid)["visual"]["visualType"], "card")
        self.assertTrue(any("nicht vom Live-Helfer" in t["text"] for t in st["todos"]
                            if str(t.get("ref")).endswith("mk_kpi9")), st["todos"])
        self.fields_clean()

    def test_b9_own_kpi_card_to_native_card(self):
        """Wie in der Demo: KPI-Karten (Custom Visual, vom Runner angelegt) im Kitchen auf
        nativ (card) umgestellt: ersetzen statt „pbir kann den Typ nicht tauschen"."""
        self.p.set_bridge(open="ok", openDelay=0.3)
        self.p.default_args = self.p.default_args + ["--auto-restart"]
        spec = F.base_spec("h1")
        spec["pages"][0]["visuals"].append(
            F.ck_kpi("k9", "Übersicht", "Umsatz KPI", "_Measures.Umsatz", 1420, 96))
        rc, out, st = self.p.deploy(spec, 1)
        self.assertApplied(rc, out, st)
        self.accept_report_json()
        uid = self.p.pages()["Übersicht"]
        self.assertEqual(self.p.visual("mk_k9", uid)["visual"]["visualType"], KPI_GUID)
        spec2 = F.base_spec("h2")
        spec2["pages"][0]["visuals"].append(
            F.card("k9", "Übersicht", "Umsatz KPI", "_Measures.Umsatz", 1420, 96))
        rc, out, st = self.p.deploy(spec2, 2)
        self.assertApplied(rc, out, st)
        self.assertEqual(self.p.visual("mk_k9", uid)["visual"]["visualType"], "card")
        self.assertEqual(st["visuals"]["k9"]["state"], "applied", st["visuals"]["k9"])
        self.assertIn("Typ gewechselt", st["visuals"]["k9"]["msg"])
        self.assertLess(st["pbirCalls"], 40)
        self.assertFalse(any("Visualtyp geändert" in t["text"] for t in st["todos"]))
        spec2["meta"]["specHash"] = "h3"
        F.find_visual(spec2, "kpi1")["rect"]["x"] = 40
        rc, out, st = self.p.deploy(spec2, 3)
        self.assertApplied(rc, out, st)
        self.assertNotIn("k9", st["visuals"])            # erledigt, keine Wiederholung
        self.accept_report_json()

    # --- B2: eingelesener Bericht, nur eine Seite ergänzt ------------------------ #
    def test_b2_import_then_add_page_touches_only_new_page(self):
        self.p.set_bridge(open="ok", openDelay=0.3)
        self.p.default_args = self.p.default_args + ["--auto-restart"]
        rc, out, st = self.p.deploy(self.spec_v2(), 1)    # installiert, Theme registriert
        self.assertApplied(rc, out, st)
        self.accept_report_json()
        pages = self.p.pages()
        uid, did = pages["Übersicht"], pages["Detail"]
        rep = self.p.report.as_posix()
        # in Desktop gestaltet und gespeichert: eigenes Theme, eigener Seitenhintergrund
        theme = self.p.report / "StaticResources" / "RegisteredResources" / "MockupKitchen.json"
        t = json.loads(theme.read_text(encoding="utf-8"))
        t["good"] = "#123456"
        theme.write_text(json.dumps(t, indent=2), encoding="utf-8")
        self.assertEqual(self.p.pbir("pages", "background", "%s/Übersicht.Page" % rep,
                                     "--color", "#FFFFFF")[0], 0)
        # Kitchen liest ein: Herkunft an Seiten und Kacheln, gleiche Gestaltung
        base = self.spec_v2("b1")
        base["meta"]["exportedAt"] = "2026-09-28T15:00:00.000+02:00"
        for pg, pid in zip(base["pages"], (uid, did)):
            pg["pbir"] = {"page": pid}
            for v in pg["visuals"]:
                v["pbir"] = {"page": pid, "visual": v["id"]}
        (self.p.mk / "baseline-spec.json").write_text(json.dumps(base, ensure_ascii=False),
                                                      encoding="utf-8")
        # eine Seite ergänzt, Rahmen im Kitchen (für alle Seiten) geändert
        spec = json.loads(json.dumps(base))
        spec["meta"].update({"specHash": "h2", "exportedAt": "2026-09-28T15:05:00.000+02:00"})
        spec["zones"]["header"]["subtitle"] = "in T€ · YTD"
        spec["pages"].append({"id": "pg3", "index": 3, "name": "Neu", "question": "",
                              "notes": "", "contentRect": base["pages"][0]["contentRect"],
                              "layoutTree": None, "visuals": [
                                  F.card("n1", "Neu", "Neu", "_Measures.AC", 24, 96)]})
        before = self.p.report_hash()
        n = len(self.p.calls())
        rc, out, st = self.p.deploy(spec, 2)
        self.assertApplied(rc, out, st)
        new = self.p.pages()["Neu"]
        changed = self.changed(before)
        self.assertTrue(changed)
        stray = [k for k in changed if not k.startswith("definition/pages/%s/" % new)
                 and k != "definition/pages/pages.json"]
        self.assertEqual(stray, [], "nur die neue Seite darf sich ändern")
        self.assertEqual(json.loads(theme.read_text(encoding="utf-8"))["good"], "#123456")
        for name in ("Übersicht", "Detail"):
            self.assertFalse(st["plan"]["pages"][name]["background"])
            self.assertEqual(st["plan"]["pages"][name]["chrome"], 0)
        self.assertTrue(any(t["ref"] == "frame" for t in st["todos"]), st["todos"])
        shots = [c for c in self.p.calls()[n:] if c[0] == "screenshot"]
        self.assertEqual([c[1] for c in shots], [new])   # nur die neue Seite aufgenommen
        # bewusste Designänderung: jetzt Hintergrund und Theme auch für eingelesene Seiten
        spec3 = json.loads(json.dumps(spec))
        spec3["meta"].update({"specHash": "h3", "exportedAt": "2026-09-28T15:10:00.000+02:00"})
        spec3["design"]["pageBackground"] = "#EEEEEE"
        spec3["design"]["colors"]["pageBackground"] = "#EEEEEE"
        rc, out, st = self.p.deploy(spec3, 3)
        self.assertApplied(rc, out, st)
        pj = json.loads((self.p.report / "definition" / "pages" / uid / "page.json")
                        .read_text(encoding="utf-8"))
        self.assertEqual(LR.literal_value(pj["objects"]["background"][0]["properties"]["color"])
                         .upper(), "#EEEEEE")
        self.assertNotEqual(json.loads(theme.read_text(encoding="utf-8"))["good"], "#123456")

    def test_b2_imported_custom_kept_and_relayout_not_written(self):
        """Prüfung an der Demo-Kopie: (1) eingelesene Custom Visuals nie durch die
        Konverter-visual.json ersetzen (nur verschieben, Titel/Bindung als To-do), (2) passt
        das Kitchen nach einer Rahmenänderung die Kacheln eingelesener Seiten an den neuen
        Inhaltsbereich an, bleibt dort die Lage aus dem Bericht."""
        self.p.default_args = ["--no-install"]
        self.p.add_ck_reference()
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1)
        self.assertApplied(rc, out, st)
        src = self.p.report / "definition" / "pages" / CK_REF_PAGE / "visuals" / CK_REF_VISUAL
        dst = src.parent / "fremd_gantt"
        shutil.copytree(src, dst)
        vj = json.loads((dst / "visual.json").read_text(encoding="utf-8"))
        vj["name"] = "fremd_gantt"
        vj["visual"]["visualType"] = F.GANTT_GUID
        vj["position"].update(x=400, y=20)
        (dst / "visual.json").write_text(json.dumps(vj, indent=2), encoding="utf-8")
        base = F.base_spec("b1")
        base["meta"]["exportedAt"] = "2026-09-28T15:00:00.000+02:00"
        cko = F.ck_bars("cko", "Seite 1", "", "DimRegion.Region", "_Measures.AC",
                        ["_Measures.PL"], 10, 0, w=280, h=280)
        cko["pbir"] = {"page": CK_REF_PAGE, "visual": CK_REF_VISUAL}
        gt = F.gantt("gt", "Seite 1", "Plan", "DimProduct.Product", "DimDate.Date", 400, 20,
                     w=280, h=280)
        gt["pbir"] = {"page": CK_REF_PAGE, "visual": "fremd_gantt"}
        base["pages"].append({"id": "pg9", "index": 9, "name": "Seite 1",
                              "pbir": {"page": CK_REF_PAGE}, "question": "", "notes": "",
                              "contentRect": {"x": 0, "y": 0, "w": 1920, "h": 1080},
                              "layoutTree": None, "visuals": [cko, gt]})
        (self.p.mk / "baseline-spec.json").write_text(json.dumps(base, ensure_ascii=False),
                                                      encoding="utf-8")
        visual_before = json.loads((dst / "visual.json").read_text(encoding="utf-8"))["visual"]
        spec = json.loads(json.dumps(base))
        spec["meta"].update({"specHash": "h2", "exportedAt": "2026-09-28T15:05:00.000+02:00"})
        F.find_visual(spec, "gt")["rect"]["x"] = 430
        F.find_visual(spec, "gt")["title"] = "Plan neu"
        rc, out, st = self.p.deploy(spec, 2)
        self.assertApplied(rc, out, st)
        now = json.loads((dst / "visual.json").read_text(encoding="utf-8"))
        self.assertEqual(now["position"]["x"], 430)
        self.assertEqual(now["visual"], visual_before)          # nicht ersetzt
        self.assertNotIn("komplett ersetzt", st["visuals"]["gt"]["msg"])
        self.assertTrue(any("Eingelesenes Custom Visual" in t["text"] for t in st["todos"]),
                        st["todos"])
        # Rahmen im Kitchen geändert, Kacheln der eingelesenen Seite in den Inhaltsbereich
        spec3 = json.loads(json.dumps(spec))
        spec3["meta"].update({"specHash": "h3", "exportedAt": "2026-09-28T15:10:00.000+02:00"})
        spec3["pages"][-1]["contentRect"] = {"x": 15, "y": 99, "w": 1590, "h": 966}
        F.find_visual(spec3, "cko")["rect"].update({"x": 25, "y": 110})
        F.find_visual(spec3, "gt")["rect"].update({"x": 440, "y": 120})
        before = self.p.report_hash()
        rc, out, st = self.p.deploy(spec3, 3)
        self.assertApplied(rc, out, st)
        ref_page = [k for k in self.changed(before) if "/%s/" % CK_REF_PAGE in k]
        self.assertEqual(ref_page, [])
        self.assertTrue(any(t["ref"] == "frame-layout" for t in st["todos"]), st["todos"])

    # --- B4: übersprungenes neues Visual im selben Deploy erneut ------------------ #
    def test_b4_missing_new_visual_retried_in_same_deploy(self):
        self.p.default_args = ["--no-install", "--pbir", str(FAKE_PBIR)]
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1,
                                    env={"FAKE_PBIR_FROMJSON_DROP": "mk_col1:once"})
        self.assertApplied(rc, out, st)
        uid = self.p.pages()["Übersicht"]
        self.assertIn("mk_col1", self.p.visual_names(uid))
        self.assertEqual(st["visuals"]["col1"]["state"], "applied", st["visuals"]["col1"])
        self.assertIn("im zweiten Versuch angelegt", st["visuals"]["col1"]["msg"])
        spec = F.base_spec("h2")
        spec["pages"][0]["visuals"].append(F.bar("bar1", "Übersicht", "Neu",
                                                 "DimProduct.Category", "_Measures.AC", 950, 320))
        rc, out, st = self.p.deploy(spec, 2, env={"FAKE_PBIR_FROMJSON_DROP": "mk_bar1"})
        self.assertApplied(rc, out, st)
        self.assertEqual(st["visuals"]["bar1"]["state"], "error")
        self.assertIn("nicht angelegt, auch nicht im zweiten Versuch", st["visuals"]["bar1"]["msg"])
        self.assertIn("1 mit Fehler", st["message"])
        self.assertIn("from-json mk_bar1", self.log_text())

    # --- B5: Bilder nur für angefasste Seiten (plus Seiten ohne Bild, mit Budget) -- #
    def test_b5_shots_touched_plus_imageless_within_budget(self):
        self.p.default_args = ["--no-install"]
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1)
        self.assertApplied(rc, out, st)
        pages = self.p.pages()
        applied_path = self.p.mk / ".state" / "applied.json"

        def forget_detail_shot():
            a = json.loads(applied_path.read_text(encoding="utf-8"))
            a["pages"]["Detail"]["shot"] = None
            applied_path.write_text(json.dumps(a), encoding="utf-8")
        forget_detail_shot()
        spec = F.base_spec("h2")
        F.find_visual(spec, "kpi1")["rect"]["x"] = 40
        n = len(self.p.calls())
        rc, out, st = self.p.deploy(spec, 2)
        self.assertApplied(rc, out, st)
        shots = [c[1] for c in self.p.calls()[n:] if c[0] == "screenshot"]
        self.assertEqual(sorted(shots), sorted([pages["Übersicht"], pages["Detail"]]))
        self.assertIn("bisher ohne Bild", self.steps(st)["shots"]["msg"])
        self.assertIsInstance(st["shotsMs"], int)
        self.assertIn("Bilder: 2 Seite(n) in", self.log_text())
        forget_detail_shot()
        spec["meta"]["specHash"] = "h3"
        F.find_visual(spec, "kpi1")["rect"]["x"] = 60
        n = len(self.p.calls())
        rc, out, st = self.p.deploy(spec, 3, "--shot-budget", "0")
        self.assertApplied(rc, out, st)
        shots = [c[1] for c in self.p.calls()[n:] if c[0] == "screenshot"]
        self.assertEqual(shots, [pages["Übersicht"]])
        self.assertIn("auf den nächsten Deploy verschoben", self.steps(st)["shots"]["msg"])

    # --- Safety (3): Instanz binden, Duplikate blockieren ------------------------- #
    def test_safety3_second_window_or_other_pid_during_question_blocks(self):
        self.p.set_bridge(open="ok", openDelay=0.3)
        before = self.p.report_hash()
        self.p.deploy_files(self.spec_v2(), 1)
        proc = self.p.start_once()
        self.p.wait_awaiting(proc, kind="restart")
        self.p.set_bridge(open="ok", extraInstances=[{"pid": 4343,
                                                      "currentFilePath": str(self.p.pbip)}])
        rc, out, st = self.p.finish(proc)
        self.assertEqual((rc, st["state"]), (2, "blocked"), out[-2000:])
        self.assertIn("2 Desktop-Fenstern", st["message"])
        self.assertIn("Nichts geschrieben", st["message"])
        self.assertNotIn("_close", self.verbs())
        self.assertEqual(before, self.p.report_hash())
        # nach der Frage meldet sich eine andere Instanz mit dem Projekt: keine Antwort zählt
        self.p.set_bridge(open="ok")
        self.p.deploy_files(self.spec_v2("h2"), 2)
        proc = self.p.start_once()
        self.p.wait_awaiting(proc, kind="restart", seq=2)
        self.p.set_bridge(open="ok", pid=5555)
        rc, out, st = self.p.finish(proc)
        self.assertEqual((rc, st["state"]), (2, "blocked"), out[-2000:])
        self.assertIn("gefragt wurde für pid 4242", st["message"])
        self.assertNotIn("_close", self.verbs())
        self.assertEqual(before, self.p.report_hash())

    def test_safety3_second_window_before_reload_rolls_back(self):
        self.p.default_args = ["--no-install"]
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1)
        self.assertApplied(rc, out, st)
        last = (self.p.mk / ".state" / "last-applied-spec.json").read_bytes()
        before = self.p.report_hash()
        self.p.set_bridge(extraInstances=[{"pid": 4343, "currentFilePath": str(self.p.pbip)}],
                          extraFromStatus=2)
        spec = F.base_spec("h2")
        F.find_visual(spec, "kpi1")["rect"]["x"] = 40
        n = len(self.p.calls())
        rc, out, st = self.p.deploy(spec, 2)
        self.assertEqual((rc, st["state"]), (2, "blocked"), out[-2000:])
        self.assertIn("zurückgesetzt", st["message"])
        self.assertIn("2 Desktop-Fenstern", st["message"])
        self.assertEqual(before, self.p.report_hash())
        self.assertEqual(last, (self.p.mk / ".state" / "last-applied-spec.json").read_bytes())
        self.assertNotIn("reload", [c[0] for c in self.p.calls()[n:]])
        self.p.set_bridge()
        rc, out, st = self.p.deploy(spec, 3)
        self.assertApplied(rc, out, st)
        self.assertEqual(self.p.visual("mk_kpi1")["position"]["x"], 40)

    # --- Safety (2): Neustart bei Ungespeichertem nur nach ausdrücklicher Wahl ----- #
    def test_safety2_restart_after_own_reload_is_case_b_without_countdown(self):
        self.p.set_bridge(open="ok", openDelay=0.3, reloadMarksUnsaved=True)
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1, "--no-install")
        self.assertApplied(rc, out, st)
        self.assertTrue((self.p.mk / ".state" / "desktop-reload.json").is_file())
        self.p.deploy_files(self.spec_v2("h2"), 2)
        proc = self.p.start_once()
        st = self.p.wait_awaiting(proc, kind="restart")
        aw = st["awaiting"]
        self.assertEqual(aw["options"], ["saveFirst", "skipRestart", "discard", "cancel"])
        self.assertEqual((aw["unsavedByUs"], aw["unsavedByUsCertain"], aw["countdown"]),
                         (True, False, False))
        self.assertIn("was Deploy 1 geladen hat, und alles, was du seitdem", aw["reason"])
        self.p.confirm(2, "saveFirst")
        self.p.wait_awaiting(proc, kind="restart", waitingForSave=True)
        self.assertNotIn("_close", self.verbs())
        self.p.set_bridge(open="ok", openDelay=0.3)     # Nutzer speichert in Desktop
        rc, out, st = self.p.finish(proc)
        self.assertApplied(rc, out, st)
        self.assertIn("_close", self.verbs())
        self.accept_report_json()

    # --- Safety (5): Hash deckt Korrekturen, Wiederholung nach Fehlschlag ---------- #
    def test_safety5_override_hash_old_form_and_retry(self):
        import hashlib
        env = self.model_env(validate="errorWhenChanged")
        self.p.default_args = ["--no-install"]
        oid = "addMeasure:_Measures.Marge %"
        rc, out, st = self.p.deploy(self.model_spec("h1"), 1, env=env)
        self.assertApplied(rc, out, st)
        todo = self.todo_of(st, oid)
        self.assertEqual((todo["opKind"], todo["target"]), ("addMeasure", "_Measures/Marge %"))
        appr = self.p.mk / "model-approvals.json"
        dax2 = "DIVIDE([Marge], [Umsatz], 0)"

        def approve(h, at, ov=True):
            e = {"id": oid, "hash": h, "by": "Test", "at": at}
            if ov:
                e["overrides"] = {"dax": dax2}
            appr.write_text(json.dumps({"approvals": [e]}), encoding="utf-8")
        # Korrektur in der Freigabe, Hash noch über den Vorschlag ohne Korrektur: veraltet
        approve(todo["hash"], LR.now_iso())
        rc, out, st = self.p.deploy(self.model_spec("h1"), 2, env=env)
        self.assertTrue(self.todo_of(st, oid).get("staleApproval"))
        self.assertEqual(self.te_calls("add"), [])
        # alte Form ohne Hash: veraltet, erneut freigeben
        appr.write_text(json.dumps({"ids": [oid]}), encoding="utf-8")
        rc, out, st = self.p.deploy(self.model_spec("h1"), 3, env=env)
        t3 = self.todo_of(st, oid)
        self.assertTrue(t3.get("staleApproval"))
        self.assertIn("alte Form", t3["text"])
        self.assertEqual(self.te_calls("add"), [])
        # Hash wie das Kitchen ihn rechnet (target aus der ID, after mit bearbeitetem DAX)
        content = json.dumps(dict(todo["after"], expression=dax2), sort_keys=True,
                             ensure_ascii=False, separators=(",", ":"))
        h = hashlib.sha256(("addMeasure\n_Measures.Marge %\n" + content).encode("utf-8")) \
            .hexdigest()
        approve(h, "2026-10-02T10:00:00.000+02:00")
        rc, out, st = self.p.deploy(self.model_spec("h1"), 4, env=env)
        adds = self.te_calls("add")
        self.assertEqual(len(adds), 1, adds)
        self.assertIn(dax2, " ".join(adds[0]))
        t4 = self.todo_of(st, oid)
        self.assertTrue(t4.get("retry"), t4)               # te validate: zurückgenommen
        # ohne neue Freigabe: weiter „erneut freigeben", kein zweiter te-Lauf (Schnellweg:
        # To-dos des letzten Deploys bleiben; voller Lauf: retry mit failedSeq)
        rc, out, st = self.p.deploy(self.model_spec("h1"), 5, env=env)
        self.assertEqual([s["id"] for s in st["steps"]], ["spec"])
        self.assertTrue(self.todo_of(st, oid).get("retry"))
        rc, out, st = self.p.deploy(self.model_spec("h5"), 50, env=env)
        t5 = self.todo_of(st, oid)
        self.assertTrue(t5.get("retry"))
        self.assertEqual(t5.get("failedSeq"), 4)
        self.assertEqual(len(self.te_calls("add")), 1)
        # Ursache behoben, gleiche Freigabe mit neuem Zeitpunkt: läuft wieder
        (self.p.tmp / "fake_te.json").write_text(json.dumps(
            {"log": str(self.te_log)}), encoding="utf-8")
        approve(h, "2026-10-02T11:00:00.000+02:00")
        rc, out, st = self.p.deploy(self.model_spec("h5"), 60, env=env)
        self.assertApplied(rc, out, st)
        self.assertEqual(len(self.te_calls("add")), 2)
        self.assertIsNone(self.todo_of(st, oid))
        done = json.loads((self.p.mk / ".state" / "model-applied.json").read_text(
            encoding="utf-8"))[oid]
        self.assertEqual((done["status"], done["hash"]), ("applied", h))

    # --- Punkt 6: Spec je Deploy für „Zurück zu Deploy n" ------------------------ #
    def test_specs_written_per_deploy(self):
        self.p.default_args = ["--no-install"]
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1)
        self.assertApplied(rc, out, st)
        specs = self.p.mk / ".state" / "specs"
        self.assertEqual(st["history"][-1]["spec"], ".state/specs/1.json")
        self.assertTrue((specs / "1.applied.json").is_file())
        spec = F.base_spec("h2")
        F.find_visual(spec, "kpi1")["rect"]["x"] = 40
        rc, out, st = self.p.deploy(spec, 2, env={"MK_RUNNER_FAULT": "write"})
        self.assertEqual(st["state"], "failed", out[-1500:])
        saved = json.loads((specs / "2.json").read_text(encoding="utf-8"))
        self.assertEqual(saved["meta"]["specHash"], "h2")
        self.assertFalse((specs / "2.applied.json").exists())
        self.assertEqual(st["history"][-1]["spec"], ".state/specs/2.json")
        self.assertIsInstance(st["history"][-1]["pbirCalls"], int)

    # --- Folgerunde 1 (Verifikation r4, Safety-Review 2) ------------------------- #
    def test_r2_unsaved_during_write_rolls_back(self):
        """Desktop war beim Start sauber, bekommt während des Schreibens ungespeicherte
        Änderungen: kein stiller Reload, Bericht und .state zurück. Statusfelder immer da."""
        self.p.default_args = ["--no-install"]
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1)
        self.assertApplied(rc, out, st)
        self.assertEqual(st["directWrites"], 0)
        self.assertIsInstance(st["shotsMs"], int)
        last = (self.p.mk / ".state" / "last-applied-spec.json").read_bytes()
        before = self.p.report_hash()
        self.p.set_bridge(unsavedFromStatus=2)
        spec = F.base_spec("h2")
        F.find_visual(spec, "kpi1")["rect"]["x"] = 40
        n = len(self.p.calls())
        rc, out, st = self.p.deploy(spec, 2)
        self.assertEqual((rc, st["state"]), (2, "blocked"), out[-2000:])
        self.assertIn("ungespeicherte Änderungen", st["message"])
        self.assertIn("zurückgesetzt", st["message"])
        self.assertEqual(before, self.p.report_hash())
        self.assertEqual(last, (self.p.mk / ".state" / "last-applied-spec.json").read_bytes())
        self.assertNotIn("reload", [c[0] for c in self.p.calls()[n:]])
        self.p.set_bridge()                              # in Desktop gespeichert
        rc, out, st = self.p.deploy(spec, 3)
        self.assertApplied(rc, out, st)
        self.assertEqual(self.p.visual("mk_kpi1")["position"]["x"], 40)
        # „Zurück zu Deploy n" prüft vor dem Neuladen genauso
        tree3 = self.p.page_tree()
        self.p.set_bridge(unsavedFromStatus=2)
        self.p.request(4, restore={"fromBackup": 1})
        rc, out, st = self.p.run("once")
        self.assertEqual((rc, st["state"]), (2, "blocked"), out[-2000:])
        self.assertIn("zurückgesetzt", st["message"])
        self.assertEqual(tree3, self.p.page_tree())
        rc, out, st = self.p.deploy(F.base_spec("h1"), 5, "--no-bridge")
        self.assertEqual(st["shotsMs"], 0)
        self.assertEqual(st["directWrites"], 0)

    def test_r2_stale_confirm_ignored_and_prepare_writes_spec(self):
        self.p.set_bridge(open="ok", openDelay=0.3)
        before = self.p.report_hash()
        # alte Antwort mit derselben seq (z. B. mockup/ teilweise gelöscht): zählt nicht
        LR.write_json_atomic(self.p.mk / "deploy-confirm.json",
                             {"seq": 1, "action": "restart", "at": "2026-01-01T10:00:00.000+01:00"})
        self.p.deploy_files(self.spec_v2(), 1)
        proc = self.p.start_once()
        self.p.wait_awaiting(proc, kind="restart")
        time.sleep(2.5)
        self.assertEqual(self.p.status_safe()["runner"]["state"], "awaiting")
        self.assertNotIn("_close", self.verbs())
        self.assertIn("älter als die Rückfrage", self.log_text())
        self.p.confirm(1, "cancel")
        rc, out, st = self.p.finish(proc)
        self.assertEqual((rc, st["state"]), (3, "cancelled"), out[-2000:])
        self.assertEqual(before, self.p.report_hash())
        # Vorbereiten schreibt .state/specs/<seq>.json wie jeder Deploy (Vertrag)
        self.p.request(2, prepare=True)
        proc = self.p.start_once()
        self.p.wait_awaiting(proc, kind="restart", seq=2)
        self.p.confirm(2, "restart")
        rc, out, st = self.p.finish(proc)
        self.assertApplied(rc, out, st)
        self.accept_report_json()
        self.assertTrue((self.p.mk / ".state" / "specs" / "2.json").is_file())
        self.assertEqual(st["history"][-1]["spec"], ".state/specs/2.json")
        self.assertTrue(st["history"][-1]["prepare"])

    def test_r2_failed_write_after_install_restores_visuals_and_report_json(self):
        """Sicherung vor der Installation: ein gescheiterter Deploy bringt auch report.json,
        CustomVisuals/ und RegisteredResources zurück."""
        self.p.set_bridge(open="ok", openDelay=0.3)
        before = self.p.report_hash()
        rc, out, st = self.p.deploy(self.spec_v2(), 1, "--auto-restart",
                                    env={"MK_RUNNER_FAULT": "write"})
        self.assertEqual(st["state"], "failed", out[-2000:])
        ids = [s["id"] for s in st["steps"]]
        self.assertLess(ids.index("backup"), ids.index("visuals"), ids)
        self.assertIn("installiert", self.steps(st)["visuals"]["msg"])
        self.assertEqual(before, self.p.report_hash())   # auch report.json und CustomVisuals
        self.assertFalse((self.p.report / "CustomVisuals" / LR.CK_GUID).exists())
        self.assertTrue(st["history"][-1]["backup"])

    def test_r2_imported_report_keeps_theme_until_design_changes(self):
        self.p.set_bridge(open="ok", openDelay=0.3)
        rc, out, st = self.p.deploy(F.base_spec("h1"), 1, "--no-install")
        self.assertApplied(rc, out, st)
        self.assertIsNone(self.report_json().get("themeCollection", {}).get("customTheme"))
        pages = self.p.pages()
        base = F.base_spec("b1")
        base["meta"]["exportedAt"] = "2026-09-28T15:00:00.000+02:00"
        for pg in base["pages"]:
            pid = pages[pg["name"]]
            pg["pbir"] = {"page": pid}
            for v in pg["visuals"]:
                v["pbir"] = {"page": pid, "visual": "mk_" + v["id"]}
        (self.p.mk / "baseline-spec.json").write_text(json.dumps(base, ensure_ascii=False),
                                                      encoding="utf-8")
        spec = json.loads(json.dumps(base))
        spec["meta"].update({"specHash": "h2", "exportedAt": "2026-09-28T15:05:00.000+02:00"})
        spec["pages"].append({"id": "pg3", "index": 3, "name": "Neu", "question": "",
                              "notes": "", "contentRect": base["pages"][0]["contentRect"],
                              "layoutTree": None, "visuals": [
                                  F.ck_kpi("ckn", "Neu", "AC (IBCS)", "_Measures.AC", 24, 96)]})
        rc, out, st = self.p.deploy(spec, 2, "--auto-restart", "--restart-for-theme")
        self.assertApplied(rc, out, st)
        self.accept_report_json()
        self.assertIn(KPI_GUID, self.registered())       # KPI-Karte installiert
        self.assertIsNone(self.report_json().get("themeCollection", {}).get("customTheme"))
        self.assertFalse(st["plan"].get("themeRegister"), st["plan"])
        self.assertNotIn("Theme", st["plan"].get("restartReason") or "")
        # Sitzung vorbereiten im eingelesenen Bericht: Theme des Berichts bleibt
        self.p.request(3, prepare=True)
        proc = self.p.start_once()
        st = self.p.wait_awaiting(proc, kind="restart", seq=3)
        self.assertFalse(st["plan"]["themeRegister"], st["plan"])
        self.p.confirm(3, "cancel")
        self.p.finish(proc)
        # bewusste Designänderung: jetzt Registrierung, ausdrücklich angekündigt
        spec4 = json.loads(json.dumps(spec))
        spec4["meta"].update({"specHash": "h4", "exportedAt": "2026-09-28T15:10:00.000+02:00"})
        spec4["design"]["accent"] = "#123456"
        self.p.deploy_files(spec4, 4)
        proc = self.p.start_once("--restart-for-theme")
        st = self.p.wait_awaiting(proc, kind="restart", seq=4)
        self.assertIn("Theme des Berichts wird ersetzt", st["awaiting"]["restartReason"])
        self.p.confirm(4, "restart")
        rc, out, st = self.p.finish(proc)
        self.assertApplied(rc, out, st)
        self.accept_report_json()
        self.assertEqual(self.report_json()["themeCollection"]["customTheme"]["name"],
                         "MockupKitchen.json")

    def test_r2_keep_existing_visual_version(self):
        """B7: ein Update eines schon installierten Kitchen-Visuals ist wählbar."""
        self.p.set_bridge(open="ok", openDelay=0.3)
        rc, out, st = self.p.deploy(self.spec_v2(), 1, "--auto-restart")
        self.assertApplied(rc, out, st)
        self.accept_report_json()
        mf = self.p.report / "CustomVisuals" / LR.CK_GUID / "resources" / (
            "%s.pbiviz.json" % LR.CK_GUID)
        doc = json.loads(mf.read_text(encoding="utf-8-sig"))
        doc["visual"]["version"] = "0.0.1.0"             # älter als der Build im Repo
        mf.write_text(json.dumps(doc), encoding="utf-8")
        spec = self.spec_v2("h2")
        F.find_visual(spec, "ckb")["rect"]["x"] = 780
        self.p.deploy_files(spec, 2)
        n = len(self.p.calls())
        proc = self.p.start_once()
        st = self.p.wait_awaiting(proc, kind="restart", seq=2)
        aw = st["awaiting"]
        self.assertTrue(aw["updateOnly"], aw)
        self.assertEqual([u["from"] for u in aw["updates"]], ["0.0.1.0"])
        self.p.confirm(2, "skipRestart")                 # „Vorhandene Version behalten"
        rc, out, st = self.p.finish(proc)
        self.assertApplied(rc, out, st)
        self.assertNotIn("_close", self.verbs(n))
        self.assertEqual(json.loads(mf.read_text(encoding="utf-8-sig"))["visual"]["version"],
                         "0.0.1.0")
        self.assertEqual(st["visuals"]["ckb"]["state"], "applied", st["visuals"]["ckb"])
        self.assertEqual(st["desktop"]["visualsKept"][0]["from"], "0.0.1.0")
        self.assertIn("vorhandene Version behalten", self.steps(st)["visuals"]["msg"])
        self.assertTrue(any("bleibt im Bericht" in t["text"] for t in st["todos"]), st["todos"])
        # je Deploy auch ohne Rückfrage: keepVersions in der Anfrage
        spec3 = self.spec_v2("h3")
        F.find_visual(spec3, "ckb")["rect"]["x"] = 800
        n = len(self.p.calls())
        rc, out, st = self.p.deploy(spec3, 3, "--confirm-timeout", "5", keepVersions=True)
        self.assertApplied(rc, out, st)
        self.assertNotIn("_close", self.verbs(n))
        self.assertNotIn("awaiting", st)
        self.assertEqual(json.loads(mf.read_text(encoding="utf-8-sig"))["visual"]["version"],
                         "0.0.1.0")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("-k", dest="pattern", default=None, help="nur Tests mit diesem Namensteil")
    ap.add_argument("--fast", action="store_true", help="nur Einheitentests")
    ap.add_argument("-v", action="store_true")
    opt = ap.parse_args()
    if not TESTBED.is_dir():
        print("Testbed fehlt: %s (MK_TESTBED setzen)" % TESTBED)
        return 2
    loader = unittest.TestLoader()
    if opt.pattern:
        loader.testNamePatterns = ["*%s*" % opt.pattern]
    suite = unittest.TestSuite()
    suite.addTests(loader.loadTestsFromTestCase(UnitTests))
    suite.addTests(loader.loadTestsFromTestCase(HelperTests))
    suite.addTests(loader.loadTestsFromTestCase(CompareTests))
    suite.addTests(loader.loadTestsFromTestCase(CanvasTests))
    suite.addTests(loader.loadTestsFromTestCase(BetaUnitTests))
    suite.addTests(loader.loadTestsFromTestCase(FixUnitTests))
    if not opt.fast:
        suite.addTests(loader.loadTestsFromTestCase(RunnerTests))
        suite.addTests(loader.loadTestsFromTestCase(V2Tests))
        suite.addTests(loader.loadTestsFromTestCase(BetaTests))
        suite.addTests(loader.loadTestsFromTestCase(FixTests))
        suite.addTests(loader.loadTestsFromTestCase(MkLiveTests))
    t0 = time.time()
    res = unittest.TextTestRunner(verbosity=2 if opt.v else 1).run(suite)
    total = res.testsRun
    failed = len(res.failures) + len(res.errors)
    skipped = len(res.skipped)
    print("\nErgebnis: %d Tests, %d bestanden, %d fehlgeschlagen, %d uebersprungen (%.0f s)"
          % (total, total - failed - skipped, failed, skipped, time.time() - t0))
    return 0 if res.wasSuccessful() else 1


if __name__ == "__main__":
    raise SystemExit(main())
