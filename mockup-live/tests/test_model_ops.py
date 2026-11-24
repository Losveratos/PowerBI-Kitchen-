#!/usr/bin/env python3
"""Tests fuer mockup-live/agent/model_ops.py (Paket C) gegen die Attrappe fake_te.py.

    python mockup-live/tests/test_model_ops.py
    python mockup-live/tests/test_model_ops.py -k revert

Kein echtes `te` noetig (die installierte Preview ist abgelaufen). Die Attrappe wird
direkt ueber Python aufgerufen (nicht ueber fake_te.cmd), damit cmd.exe Werte mit
% und " nicht verbiegt; ein Rauchtest prueft den Shim nur mit --version.
"""
from __future__ import annotations

import json
import os
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
AGENT = HERE.parent / "agent"
FAKE = HERE / "fake_te.py"
SHIM = HERE / ("fake_te.cmd" if os.name == "nt" else "fake_te")
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(AGENT))

import fake_te  # noqa: E402
import model_ops as MO  # noqa: E402
import spec_fixtures as F  # noqa: E402

TE = [sys.executable, str(FAKE)]

# Modell wie PBI-IBCS-Testbed (siehe spec_fixtures.py)
MODEL = {
    "_Measures": {"measures": {
        "AC": {"expression": "SUM(FactActuals[Amount])", "formatString": "#,##0",
               "description": "", "displayFolder": ""},
        "PY": {"expression": "CALCULATE([AC], SAMEPERIODLASTYEAR(DimDate[Date]))",
               "formatString": "#,##0", "description": "", "displayFolder": ""},
        "PL": {"expression": "SUM(FactPlan[Amount])", "formatString": "#,##0",
               "description": "", "displayFolder": ""},
        "Umsatz": {"expression": "SUM(FactActuals[Amount])", "formatString": "#,##0",
                   "description": "Nettoumsatz", "displayFolder": "Basis"},
        "Kosten": {"expression": "SUM(FactCost[Amount])", "formatString": "#,##0",
                   "description": "", "displayFolder": ""},
        "Marge": {"expression": "[Umsatz] - [Kosten]", "formatString": "#,##0",
                  "description": "", "displayFolder": ""}}},
    "FactActuals": {"columns": {"Amount": {"formatString": "", "description": ""}}},
    "DimRegion": {"columns": {"Region": {"description": ""}}},
    "DimProduct": {"columns": {"Product": {}, "Category": {}}},
    "DimDate": {"columns": {"Year": {}, "MonthName": {}, "Date": {}}},
    "Sales 2024": {"measures": {"Revenue": {"expression": "1", "formatString": ""}}},
}


def wish_spec() -> dict:
    """base_spec plus Workshop-Wuensche (wie export.js sie schreibt)."""
    spec = F.base_spec("h-model")
    fl = {f["ref"]: f for f in spec["fields"]}
    # Formatwunsch (Kuerzel + String wie FORMAT_WISH in app.js)
    fl["_Measures.Umsatz"].update(formatWish="teur", formatWishString='#,0, "T€"')
    # Formatwunsch ohne String: Kuerzel reicht
    fl["_Measures.Kosten"].update(formatWish="pct1", formatWishString="")
    # Steckbrief ohne Modellbeschreibung -> Beschreibung
    fl["_Measures.Kosten"].update(note="Alle Kostenarten", unit="EUR", owner="Controlling")
    # Umbenennung + DAX-Wunsch
    fl["_Measures.AC"].update(alias="Ist", renameInModel=True, confirmed=True,
                              daxComment="ohne Gutschriften")
    spec["fields"] = list(fl.values())
    spec["model"]["tables"] = ["_Measures", "DimRegion", "DimDate", "DimProduct",
                               "FactActuals", "Sales 2024"]
    spec["newFields"] = [
        {"table": "_Measures", "name": "Marge %", "kind": "measure",
         "ref": "_Measures.Marge %", "description": "Anteil Marge am Umsatz", "unit": "%",
         "target": "", "owner": "", "source": "", "openQuestion": "", "used": True},
        {"table": "_Measures", "name": "Deckungsbeitrag", "kind": "measure",
         "ref": "_Measures.Deckungsbeitrag", "description": "Umsatz minus Kosten",
         "unit": "€", "used": True},
        {"table": "DimProduct", "name": "Segment", "kind": "column",
         "ref": "DimProduct.Segment", "description": "", "used": False},
        {"table": "Planung", "name": "Budget", "kind": "measure", "ref": "Planung.Budget",
         "description": "Summe Budget", "used": False, "newTable": True},
    ]
    return spec


class Base(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix="mo-test-"))
        self.model = self.tmp / "PBI-IBCS-Testbed.SemanticModel"
        (self.model / "definition").mkdir(parents=True)
        fake_te.seed(self.model, json.loads(json.dumps(MODEL)))
        self.log = self.tmp / "te-calls.jsonl"
        self.cfg_path = self.tmp / "fake_te.json"
        self.configure()
        MO._DIALECT_CACHE.clear()

    def tearDown(self):
        os.environ.pop("FAKE_TE_CONFIG", None)
        shutil.rmtree(self.tmp, ignore_errors=True)

    def configure(self, **cfg):
        cfg.setdefault("log", str(self.log))
        self.cfg_path.write_text(json.dumps(cfg), encoding="utf-8")
        os.environ["FAKE_TE_CONFIG"] = str(self.cfg_path)

    def calls(self, verb=None):
        if not self.log.is_file():
            return []
        rows = [json.loads(ln)["argv"] for ln in self.log.read_text(encoding="utf-8")
                .splitlines() if ln.strip()]
        rows = [r for r in rows if "--help" not in r]       # Dialekt-Probe zaehlt nicht
        return [r for r in rows if verb is None or (r and r[0] == verb)]

    def state(self):
        return fake_te.load(str(self.model))

    def by_id(self, ops):
        return {o["id"]: o for o in ops}


class TeAvailable(Base):
    def test_ok_version(self):
        ok, ver, msg = MO.te_available(TE)
        self.assertTrue(ok)
        self.assertEqual(ver, "0.9.3-preview+fake")
        self.assertIn("bereit", msg)

    def test_expired(self):
        self.configure(expired=True)
        ok, ver, msg = MO.te_available(TE)
        self.assertFalse(ok)
        self.assertIsNone(ver)
        self.assertIn("abgelaufen", msg)
        self.assertIn("2026-09-30", msg)
        self.assertIn("tabulareditor.com", msg)

    def test_expiry_text_of_real_binary(self):
        # Wortlaut der installierten te.exe (01.10.2026, stderr, Exit 1)
        text = ("This early preview version of the Tabular Editor CLI expired on "
                "2026-09-30.\n  Please update to the latest version at "
                "https://tabulareditor.com/downloads")
        self.assertEqual(MO.expiry_from_text(text), (True, "2026-09-30"))
        self.assertEqual(MO.expiry_from_text("te 1.0.0"), (False, None))
        self.assertEqual(MO.expiry_from_text("Preview build: expires on 2026-10-31."),
                         (False, "2026-10-31"))

    def test_banner_date_in_message(self):
        self.configure(banner=True)
        ok, _, msg = MO.te_available(TE)
        self.assertTrue(ok)
        self.assertIn("2026-10-31", msg)

    def test_not_found(self):
        ok, ver, msg = MO.te_available(str(self.tmp / "gibtsnicht.exe"))
        self.assertFalse(ok)
        self.assertIn("nicht gefunden", msg)

    def test_shim_smoke(self):
        ok, ver, _ = MO.te_available(str(SHIM))
        self.assertTrue(ok, "Shim %s" % SHIM)
        self.assertEqual(ver, "0.9.3-preview+fake")

    def test_dialect(self):
        self.assertEqual(MO.te_dialect(TE), "p")
        MO._DIALECT_CACHE.clear()
        self.configure(dialect="qi")
        self.assertEqual(MO.te_dialect(TE), "qi")


class Paths(unittest.TestCase):
    def test_te_path(self):
        self.assertEqual(MO.te_path("_Measures", "Marge %"), "_Measures/Marge %")
        self.assertEqual(MO.te_path("Sales 2024", "Revenue"), "Sales 2024/Revenue")
        self.assertEqual(MO.te_path("Bob's", "A/B"), "'Bob''s'[A/B]")

    def test_split_path(self):
        self.assertEqual(MO.split_path('"Sales 2024"/Revenue'), ["Sales 2024", "Revenue"])
        self.assertEqual(MO.split_path("'Bob''s'[A]]B]"), ["Bob's", "A]B"])
        self.assertEqual(MO.split_path("Sales/Measures/Revenue"),
                         ["Sales", "Measures", "Revenue"])
        self.assertEqual(MO.split_path("Sales[Amount]"), ["Sales", "Amount"])


class Plan(Base):
    def test_static_plan_from_spec(self):
        """Ohne te (probe=False): alle Ops aus der Spec, Freigaberegeln, Befehle."""
        ops = MO.plan(wish_spec(), self.model, probe=False, report_dir="X.Report")
        o = self.by_id(ops)
        self.assertEqual(self.calls(), [], "probe=False ruft te nicht auf")
        # Reihenfolge: anlegen, DAX, Format, Beschreibung, Ordner, Umbenennung, To-do
        kinds = [x["kind"] for x in ops]
        self.assertEqual(kinds, sorted(kinds, key=MO.KIND_ORDER.index))
        self.assertEqual(kinds[-1], "todoColumn")
        self.assertLess(kinds.index("setFormat"), kinds.index("rename"))

        add = o["addMeasure:_Measures.Deckungsbeitrag"]
        self.assertTrue(add["needsApproval"])
        self.assertTrue(add["executable"])
        self.assertTrue(add["daxProposed"])
        self.assertEqual(add["action"]["props"]["expression"], "[Umsatz] - [Kosten]")
        self.assertEqual(add["action"]["props"]["formatString"], '#,0 "€"')
        cmd = add["commands"][0]
        self.assertEqual(cmd[:5], ["te", "add", "_Measures/Deckungsbeitrag", "-t", "Measure"])
        for flag in ("--if-not-exists", "--save", "-m", "--output-format"):
            self.assertIn(flag, cmd)
        self.assertIn("expression=[Umsatz] - [Kosten]", cmd)
        self.assertIn("description=Umsatz minus Kosten", cmd)
        self.assertIn(str(self.model), cmd)

        pct = o["addMeasure:_Measures.Marge %"]
        self.assertFalse(pct["executable"])
        self.assertIn("DAX-Vorschlag unvollständig", pct["blockedReason"])
        self.assertEqual(pct["action"]["props"]["formatString"], "0.0 %")

        self.assertFalse(o["addMeasure:Planung.Budget"]["executable"])
        self.assertIn("Tabelle", o["addMeasure:Planung.Budget"]["blockedReason"])
        self.assertFalse(o["todoColumn:DimProduct.Segment"]["executable"])

        fmt = o["setFormat:_Measures.Umsatz"]
        self.assertFalse(fmt["needsApproval"])
        self.assertEqual(fmt["before"]["formatString"], "#,##0")
        self.assertEqual(fmt["commands"][0][:4], ["te", "set", "_Measures/Umsatz", "-p"])
        self.assertIn('formatString=#,0, "T€"', fmt["commands"][0])
        self.assertIn("„#,##0“ → „#,0, \"T€\"“", fmt["summary"])
        self.assertEqual(o["setFormat:_Measures.Kosten"]["after"]["formatString"], "0.0 %")

        desc = o["setDescription:_Measures.Kosten"]
        self.assertFalse(desc["needsApproval"])
        self.assertEqual(desc["after"]["description"],
                         "Alle Kostenarten. Einheit: EUR. Verantwortlich: Controlling.")
        # Umsatz hat schon eine Beschreibung: nie ueberschreiben
        self.assertNotIn("setDescription:_Measures.Umsatz", o)

        ren = o["rename:_Measures.AC"]
        self.assertTrue(ren["needsApproval"])
        self.assertEqual(ren["commands"][0][:5], ["te", "mv", "_Measures/AC", "_Measures/Ist",
                                                  "--save"])
        self.assertEqual(ren["followUp"][0], ["pbir", "fields", "replace", "X.Report",
                                              "--from", "_Measures.AC", "--to",
                                              "_Measures.Ist"])
        self.assertEqual(ren["followUp"][1], ["pbir", "validate", "X.Report", "--fields"])

        dax = o["changeDax:_Measures.AC"]
        self.assertTrue(dax["needsApproval"])
        self.assertFalse(dax["executable"])           # nur Wunsch, noch kein DAX
        self.assertIn("ohne Gutschriften", dax["summary"])

        for op in ops:
            self.assertTrue(op["summary"])
            self.assertNotIn("—", op["summary"])     # Schreibstil: keine Gedankenstriche
            if op["kind"] in ("addMeasure", "changeDax", "rename"):
                self.assertTrue(op["needsApproval"], op["id"])

    def test_ids_stable(self):
        a = [o["id"] for o in MO.plan(wish_spec(), self.model, probe=False)]
        b = [o["id"] for o in MO.plan(wish_spec(), self.model, probe=False)]
        self.assertEqual(a, b)
        self.assertEqual(len(a), len(set(a)))

    def test_probe_drops_noops_and_blocks_existing(self):
        st = self.state()
        st["tables"]["_Measures"]["measures"]["Umsatz"]["formatString"] = '#,0, "T€"'
        st["tables"]["_Measures"]["measures"]["Deckungsbeitrag"] = {"expression": "1"}
        st["tables"]["_Measures"]["measures"]["Ist"] = {"expression": "2"}
        fake_te.model_file(str(self.model)).write_text(json.dumps(st), encoding="utf-8")
        o = self.by_id(MO.plan(wish_spec(), self.model, te=TE))
        self.assertNotIn("setFormat:_Measures.Umsatz", o, "Format steht schon so im Modell")
        self.assertIn("existiert bereits", o["addMeasure:_Measures.Deckungsbeitrag"]
                      ["blockedReason"])
        self.assertIn("gibt es", o["rename:_Measures.AC"]["blockedReason"])
        self.assertEqual(self.calls("add") + self.calls("set") + self.calls("mv"), [],
                         "plan schreibt nie")

    def test_probe_reads_current_values(self):
        spec = wish_spec()
        for f in spec["fields"]:
            if f["ref"] == "_Measures.Umsatz":
                f["formatString"] = "veraltet in der Spec"
        o = self.by_id(MO.plan(spec, self.model, te=TE))
        self.assertEqual(o["setFormat:_Measures.Umsatz"]["before"]["formatString"], "#,##0")

    def test_expired_te_plans_statically(self):
        self.configure(expired=True)
        ops = MO.plan(wish_spec(), self.model, te=TE)
        self.assertIn("setFormat:_Measures.Umsatz", self.by_id(ops))

    def test_qi_dialect_commands(self):
        self.configure(dialect="qi")
        o = self.by_id(MO.plan(wish_spec(), self.model, te=TE))
        add = o["addMeasure:_Measures.Deckungsbeitrag"]["commands"]
        self.assertEqual(add[0][:7], ["te", "add", "_Measures/Deckungsbeitrag", "-t",
                                      "Measure", "-i", "[Umsatz] - [Kosten]"])
        self.assertTrue(all(c[1] == "set" and "-q" in c for c in add[1:]))
        fmt = o["setFormat:_Measures.Umsatz"]["commands"][0]
        self.assertEqual(fmt[:7], ["te", "set", "_Measures/Umsatz", "-q", "formatString",
                                   "-i", '#,0, "T€"'])


class Apply(Base):
    def plan(self, spec=None):
        return MO.plan(spec or wish_spec(), self.model, te=TE)

    def test_gating_without_approval(self):
        ops = self.plan()
        r = MO.apply(ops, self.model, [], te=TE)
        st = {x["id"]: x["status"] for x in r["results"]}
        self.assertEqual(st["setFormat:_Measures.Umsatz"], "applied")
        self.assertEqual(st["setDescription:_Measures.Kosten"], "applied")
        self.assertEqual(st["addMeasure:_Measures.Deckungsbeitrag"], "awaitingApproval")
        self.assertEqual(st["rename:_Measures.AC"], "awaitingApproval")
        self.assertEqual(st["addMeasure:_Measures.Marge %"], "blocked")
        self.assertEqual(self.calls("add") + self.calls("mv"), [])
        m = self.state()["tables"]["_Measures"]["measures"]
        self.assertEqual(m["Umsatz"]["formatString"], '#,0, "T€"')
        self.assertEqual(m["Kosten"]["formatString"], "0.0 %")
        self.assertIn("AC", m)
        self.assertEqual(r["status"], "applied")
        self.assertTrue(r["ok"])
        self.assertTrue(r["reloadModel"])
        self.assertEqual(len(self.calls("validate")), 2, "vorher und nachher")
        self.assertIn("--errors-only", self.calls("validate")[-1])
        self.assertIn("2 warten auf Freigabe", r["message"])
        self.assertIsNone(r["backup"], "eigene Sicherung nach Erfolg weg")

    def test_with_approval(self):
        ops = self.plan()
        r = MO.apply(ops, self.model, ["addMeasure:_Measures.Deckungsbeitrag",
                                       "rename:_Measures.AC"], te=TE)
        m = self.state()["tables"]["_Measures"]["measures"]
        self.assertEqual(m["Deckungsbeitrag"]["expression"], "[Umsatz] - [Kosten]")
        self.assertEqual(m["Deckungsbeitrag"]["formatString"], '#,0 "€"')
        self.assertIn("Ist", m)
        self.assertNotIn("AC", m)
        adds = self.calls("add")
        self.assertEqual(len(adds), 1)
        self.assertIn("--if-not-exists", adds[0])
        self.assertIn("--save", adds[0])
        self.assertEqual(r["followUps"][0][:3], ["pbir", "fields", "replace"])
        # Erst Änderungen an Bestehendem (set vor mv, der Format-Aufruf traf noch den alten
        # Namen), neue Kennzahlen zuletzt: sie dürfen den neuen Namen schon nutzen (te 0.7)
        order = [c[0] for c in self.calls() if c and c[0] in ("add", "set", "mv")]
        self.assertEqual(order[-1], "add")
        self.assertEqual(order[-2], "mv")
        self.assertLess(order.index("set"), order.index("mv"))

    def test_add_follows_rename_in_same_run(self):
        # DAX mit dem alten Namen einer im selben Lauf umbenannten Kennzahl wird mitgezogen
        ops = self.plan()
        oid = "addMeasure:_Measures.Deckungsbeitrag"
        r = MO.apply(ops, self.model, [oid, "rename:_Measures.AC"], te=TE,
                     overrides={oid: {"dax": "[AC] - [Kosten] + 'Fact'[AC]"}})
        m = self.state()["tables"]["_Measures"]["measures"]
        self.assertEqual(m["Deckungsbeitrag"]["expression"], "[Ist] - [Kosten] + 'Fact'[AC]")
        self.assertTrue(r["ok"], r["message"])

    def test_te_message_drops_preview_warning(self):
        r = {"err": "Warning: Early preview expires in 19 day(s), on 2026-10-31. Update to the "
                    "latest version at https://tabulareditor.com/downloads\nError: Save blocked: "
                    "this mutation introduced 1 DAX validation error(s). Use --force to save anyway.",
             "out": "Validation: 1 error(s)\n  DAX0002 Wert fehlt in X\n  x DAX0002 Wert fehlt in X"}
        msg = MO.te_message(r)
        self.assertNotIn("Early preview", msg)
        self.assertIn("Save blocked", msg)
        self.assertEqual(msg.count("DAX0002"), 1)
        self.assertEqual(MO.te_message({"err": "Warning: Early preview expires", "out": "kaputt"}),
                         "kaputt")

    def test_override_unblocks_placeholder(self):
        ops = self.plan()
        oid = "addMeasure:_Measures.Marge %"
        r = MO.apply(ops, self.model, [oid], te=TE,
                     overrides={oid: {"dax": "DIVIDE([Marge], [Umsatz])"}})
        st = {x["id"]: x["status"] for x in r["results"]}
        self.assertEqual(st[oid], "applied")
        m = self.state()["tables"]["_Measures"]["measures"]
        self.assertEqual(m["Marge %"]["expression"], "DIVIDE([Marge], [Umsatz])")
        self.assertEqual(m["Marge %"]["formatString"], "0.0 %")

    def test_override_unblocks_dax_change(self):
        ops = self.plan()
        oid = "changeDax:_Measures.AC"
        MO.apply(ops, self.model, [oid], te=TE,
                 overrides={oid: {"dax": "CALCULATE([Umsatz], FactActuals[Amount] > 0)"}})
        self.assertEqual(self.state()["tables"]["_Measures"]["measures"]["AC"]["expression"],
                         "CALCULATE([Umsatz], FactActuals[Amount] > 0)")

    def test_revert_on_validation_error(self):
        self.configure(validate="errorWhenChanged")
        f = fake_te.model_file(str(self.model))
        (self.model / "definition" / "tables").mkdir()
        (self.model / "definition" / "tables" / "x.tmdl").write_text("table X", "utf-8")
        before = f.read_bytes()
        ops = self.plan()
        r = MO.apply(ops, self.model, [], te=TE)
        self.assertEqual(r["status"], "reverted")
        self.assertTrue(r["reverted"])
        self.assertFalse(r["ok"])
        self.assertFalse(r["reloadModel"])
        self.assertEqual(f.read_bytes(), before, "Definitionsordner zurückgesetzt")
        self.assertTrue((self.model / "definition" / "tables" / "x.tmdl").is_file())
        self.assertEqual(len(r["validation"]["newErrors"]), 1)
        self.assertEqual(r["validation"]["afterRevert"], 0)
        self.assertIn("zurückgesetzt", r["message"])
        self.assertTrue(r["backup"] and Path(r["backup"]).is_dir(),
                        "Sicherung bleibt nach Rücksetzen liegen")
        self.assertTrue(all(x["status"] in ("reverted", "awaitingApproval", "blocked")
                            for x in r["results"]))

    def test_validate_only_error_reverts(self):
        """DAX besteht das Save-Gate, faellt aber in validate durch -> zuruecksetzen."""
        ops = self.plan()
        oid = "addMeasure:_Measures.Deckungsbeitrag"
        r = MO.apply(ops, self.model, [oid], te=TE,
                     overrides={oid: {"dax": "[Umsatz] INVALID"}})
        self.assertEqual(r["status"], "reverted")
        self.assertNotIn("Deckungsbeitrag", self.state()["tables"]["_Measures"]["measures"])
        self.assertEqual(self.state()["tables"]["_Measures"]["measures"]["Umsatz"]
                         ["formatString"], "#,##0", "auch die Format-Op ist zurück")

    def test_preexisting_errors_do_not_revert(self):
        self.configure(preexistingErrors=2)
        r = MO.apply(self.plan(), self.model, [], te=TE)
        self.assertEqual(r["status"], "applied")
        self.assertEqual(r["validation"]["before"], 2)
        self.assertEqual(r["validation"]["newErrors"], [])
        self.assertIn("bestanden schon vorher", r["message"])

    def test_save_gate_refusal_is_reported(self):
        ops = self.plan()
        oid = "addMeasure:_Measures.Deckungsbeitrag"
        r = MO.apply(ops, self.model, [oid], te=TE, overrides={oid: {"dax": "BROKEN("}})
        st = {x["id"]: x for x in r["results"]}
        self.assertEqual(st[oid]["status"], "failed")
        self.assertIn("Save refused", st[oid]["message"])
        self.assertEqual(st["setFormat:_Measures.Umsatz"]["status"], "applied")
        self.assertEqual(r["status"], "partial")
        self.assertFalse(r["ok"])
        self.assertTrue(r["reloadModel"])
        self.assertTrue(r["backup"], "bei Fehlern bleibt die Sicherung")

    def test_atomic_reverts_everything(self):
        ops = self.plan()
        oid = "addMeasure:_Measures.Deckungsbeitrag"
        before = fake_te.model_file(str(self.model)).read_bytes()
        r = MO.apply(ops, self.model, [oid], te=TE, overrides={oid: {"dax": "BROKEN("}},
                     atomic=True)
        self.assertEqual(r["status"], "reverted")
        self.assertEqual(fake_te.model_file(str(self.model)).read_bytes(), before)

    def test_expired_does_nothing(self):
        ops = MO.plan(wish_spec(), self.model, probe=False)
        self.configure(expired=True)
        r = MO.apply(ops, self.model, [o["id"] for o in ops], te=TE)
        self.assertEqual(r["status"], "teUnavailable")
        self.assertIn("abgelaufen", r["message"])
        self.assertFalse(r["reloadModel"])
        self.assertEqual([c for c in self.calls() if c != ["--version"]], [])

    def test_nothing_to_do(self):
        r = MO.apply([], self.model, [], te=TE)
        self.assertEqual(r["status"], "nothing")
        self.assertTrue(r["ok"])
        self.assertEqual(self.calls(), [])

    def test_backup_root_kept(self):
        root = self.tmp / "state" / "model-backups"
        r = MO.apply(self.plan(), self.model, [], te=TE, backup_root=root)
        self.assertEqual(r["status"], "applied")
        self.assertTrue(Path(r["backup"]).is_dir())
        self.assertTrue((Path(r["backup"]) / fake_te.MODEL_FILE).is_file())


class ApprovalHash(Base):
    """Freigabe-Hash (CONTRACT.md, Beta-Ergänzungen): sha256 über kind, target, Inhalt."""

    def test_hash_in_plan_and_definition(self):
        import hashlib
        ops = MO.plan(wish_spec(), self.model, probe=False)
        for op in ops:
            self.assertEqual(op["hash"], MO.op_hash(op), op["id"])
            self.assertRegex(op["hash"], r"^[0-9a-f]{64}$")
        add = self.by_id(ops)["addMeasure:_Measures.Deckungsbeitrag"]
        text = "addMeasure\n%s\n%s" % (add["target"], json.dumps(
            add["after"], sort_keys=True, ensure_ascii=False, separators=(",", ":")))
        self.assertEqual(add["hash"], hashlib.sha256(text.encode("utf-8")).hexdigest())
        ren = self.by_id(ops)["rename:_Measures.AC"]
        self.assertTrue(MO.op_content(ren))          # Umbenennung: Ziel oder neuer Name
        self.assertEqual(len({o["hash"] for o in ops}), len(ops))

    def test_hash_stable_and_content_bound(self):
        a = {o["id"]: o["hash"] for o in MO.plan(wish_spec(), self.model, probe=False)}
        b = {o["id"]: o["hash"] for o in MO.plan(wish_spec(), self.model, probe=False)}
        self.assertEqual(a, b)
        op = {"kind": "addMeasure", "target": "_Measures/X",
              "after": {"expression": "1", "formatString": "#,0"}}
        h = MO.op_hash(op)
        self.assertEqual(h, MO.op_hash(dict(op, after={"formatString": "#,0",
                                                       "expression": "1"})))
        self.assertNotEqual(h, MO.op_hash(dict(op, after={"expression": "2",
                                                          "formatString": "#,0"})))
        self.assertNotEqual(h, MO.op_hash(dict(op, target="_Measures/Y")))
        self.assertNotEqual(h, MO.op_hash(dict(op, kind="changeDax")))
        spec = wish_spec()
        for nf in spec.get("newFields") or []:
            if nf.get("name") == "Deckungsbeitrag":
                nf["dax"] = "[Umsatz] - [Kosten] - 1"
        c = {o["id"]: o["hash"] for o in MO.plan(spec, self.model, probe=False)}
        self.assertNotEqual(c["addMeasure:_Measures.Deckungsbeitrag"],
                            a["addMeasure:_Measures.Deckungsbeitrag"])
        self.assertEqual(c["setFormat:_Measures.Umsatz"], a["setFormat:_Measures.Umsatz"])

    def test_hash_covers_overrides(self):
        """Safety-Review 5: eine Freigabe mit Korrektur (overrides) gilt nur, wenn ihr Hash
        über die Op MIT der Korrektur gerechnet ist; die Korrektur ändert die te-Aktion und
        den Hash gleich (_with_overrides gegen with_override_content)."""
        ops = self.by_id(MO.plan(wish_spec(), self.model, probe=False))
        add = ops["addMeasure:_Measures.Deckungsbeitrag"]
        ov = {"dax": "[Umsatz] - [Kosten] - 2", "formatString": "#,0.0"}
        hs = MO.approval_hashes(add, ov)
        self.assertNotIn(add["hash"], hs)
        run = MO._with_overrides(add, ov)                 # so läuft die Op in te
        want = dict(add, after={"expression": run["action"]["props"]["expression"],
                                "formatString": run["action"]["props"]["formatString"]})
        self.assertIn(MO.op_hash(want), hs)
        self.assertIn(MO.op_hash(dict(want, target=add["ref"])), hs)   # Kitchen: Ref der ID
        self.assertEqual(MO.approval_hashes(add, {}), MO.approval_hashes(add))
        self.assertIn(add["hash"], MO.approval_hashes(add))
        ren = ops["rename:_Measures.AC"]
        hs = MO.approval_hashes(ren, {"alias": "Istwert"})
        self.assertIn(MO.op_hash(dict(ren, newRef="_Measures.Istwert")), hs)
        self.assertNotIn(ren["hash"], hs)


class FieldsExist(Base):
    def test_exist_and_missing(self):
        r = MO.fields_exist(self.model, ["_Measures.Umsatz", "DimRegion.Region",
                                         "_Measures.Zauberzahl", "DimDate.Nixda",
                                         ("Sales 2024", "Revenue"),
                                         {"table": "dimdate", "name": "year"}], te=TE)
        self.assertTrue(r["ok"])
        self.assertEqual(r["exists"], {"_Measures.Umsatz": True, "DimRegion.Region": True,
                                       "_Measures.Zauberzahl": False, "DimDate.Nixda": False,
                                       "Sales 2024.Revenue": True, "dimdate.year": True})
        self.assertEqual(r["missing"], ["_Measures.Zauberzahl", "DimDate.Nixda"])
        self.assertEqual(len(self.calls("ls")), 2)

    def test_expired(self):
        self.configure(expired=True)
        r = MO.fields_exist(self.model, ["_Measures.Umsatz"], te=TE)
        self.assertFalse(r["ok"])
        self.assertIsNone(r["exists"]["_Measures.Umsatz"])
        self.assertIn("abgelaufen", r["message"])


if __name__ == "__main__":
    unittest.main(verbosity=1)
