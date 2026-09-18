#!/usr/bin/env python3
"""run_tests.py — Evals fuer den Skill `mockup-to-powerbi`.

Reine Standardbibliothek, kein pytest, kein Netz, kein Power BI.

    python tests/run_tests.py              # alles pruefen
    python tests/run_tests.py --only v3    # nur Faelle mit "v3" im Namen
    python tests/run_tests.py --update     # Golden-Dateien neu schreiben
    python tests/run_tests.py -v           # Abweichungen als Diff zeigen

Drei Arten von Tests:

1. **Golden-Vergleich** — `mockup_to_pbir.py` und `mockup_to_docs.py` laufen ueber
   die Fixtures in `tests/fixtures/` (specVersion 1, 2, 3, Burger-Filter,
   ChartKitchen ohne Referenz-Instanz, voller Analyse-Block, Custom Visuals).
   Jede erzeugte Datei
   wird gegen `tests/golden/<Fall>/` verglichen. `.ps1` bleibt aussen vor — sie
   entsteht aus demselben Renderer wie die `.sh`.
2. **Negativtests der Validierung** — kaputte Spec, unbekannte Hauptversion,
   doppelte Seitennamen: Exit-Code 2, Meldung mit Feldpfad, kein Traceback.
   Laeuft zweimal: mit dem Paket `jsonschema` und mit dem eigenen Validator
   (`MOCKUP_NO_JSONSCHEMA=1`).
3. **Einheiten** — kleine Funktionen aus `mockup_spec.py` und `mockup_verify.py`,
   die ohne CLI pruefbar sind.
"""

from __future__ import annotations

import argparse
import difflib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

sys.dont_write_bytecode = True      # kein __pycache__ im Skill-Ordner

HERE = Path(__file__).resolve().parent
SKILL = HERE.parent
SCRIPTS = SKILL / "scripts"
FIXTURES = HERE / "fixtures"
GOLDEN = HERE / "golden"
sys.path.insert(0, str(SCRIPTS))

REPORT = "Test.Report"
SKIP_SUFFIX = (".ps1",)

# --------------------------------------------------------------------------- #
# Faelle
# --------------------------------------------------------------------------- #
CASES = [
    {"name": "v1-einseitig", "spec": "v1-einseitig.json", "docs": True},
    {"name": "v2-zweiseitig", "spec": "v2-zweiseitig.json", "docs": True},
    {"name": "v3-burger-filter", "spec": "v3-burger-filter.json", "docs": True,
     "docs_lang": "en"},
    {"name": "v3-analyse", "spec": "v3-analyse.json", "docs": True},
    {"name": "v3-ck-ohne-instanz", "spec": "v3-ck-ohne-instanz.json",
     "extra": ["--ck-fallback"], "docs": False},
    {"name": "v3-custom-visuals", "spec": "v3-custom-visuals.json", "docs": True},
]

DATE_RX = re.compile(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z")
DAY_RX = re.compile(r"\d{4}-\d{2}-\d{2}")
DAY_DE_RX = re.compile(r"\d{2}\.\d{2}\.\d{4}")


def normalise(text: str, out_dir=None) -> str:
    """Zeitstempel und den temporaeren Ausgabepfad raus — sonst schlagen die
    Goldens bei jedem Lauf fehl."""
    text = DATE_RX.sub("<zeitstempel>", text)
    text = DAY_RX.sub("<datum>", text)
    text = DAY_DE_RX.sub("<datum>", text)
    if out_dir is not None:
        p = Path(out_dir)
        for variant in (p.as_posix(), str(p), str(p).replace("\\", "\\\\")):
            text = text.replace(variant, "<out>")
    return text.replace("\r\n", "\n")


def run(cmd, env=None):
    e = dict(os.environ)
    e["PYTHONIOENCODING"] = "utf-8"
    e["PYTHONDONTWRITEBYTECODE"] = "1"   # kein __pycache__ im Skill-Ordner
    if env:
        e.update(env)
    proc = subprocess.run([sys.executable] + cmd, capture_output=True, env=e)
    return (proc.returncode, proc.stdout.decode("utf-8", "replace"),
            proc.stderr.decode("utf-8", "replace"))


# --------------------------------------------------------------------------- #
# Ergebnis-Sammler
# --------------------------------------------------------------------------- #
class Results:
    def __init__(self, verbose=False):
        self.rows = []
        self.verbose = verbose

    def check(self, name, ok, detail=""):
        self.rows.append((name, bool(ok), detail))
        mark = "ok  " if ok else "FAIL"
        print("  [%s] %s%s" % (mark, name, ("  — " + detail) if detail and not ok else ""))

    def diff(self, name, want, have):
        if want == have:
            self.check(name, True)
            return
        detail = "Inhalt weicht ab"
        if self.verbose:
            d = list(difflib.unified_diff(want.splitlines(), have.splitlines(),
                                          "golden", "neu", lineterm="", n=1))
            detail += "\n" + "\n".join(d[:40])
        self.check(name, False, detail)

    @property
    def failed(self):
        return [r for r in self.rows if not r[1]]


# --------------------------------------------------------------------------- #
# 1 · Golden-Vergleich
# --------------------------------------------------------------------------- #
def collect(folder: Path, out_dir=None):
    out = {}
    for path in sorted(folder.rglob("*")):
        if path.is_file() and not path.name.endswith(SKIP_SUFFIX):
            out[path.relative_to(folder).as_posix()] = normalise(
                path.read_text(encoding="utf-8"), out_dir)
    return out


def golden_case(case, tmp: Path, res: Results, update: bool):
    spec = FIXTURES / case["spec"]
    out = tmp / case["name"]
    args = [str(SCRIPTS / "mockup_to_pbir.py"), str(spec), "--out", str(out),
            "--report", REPORT, "--plan"] + case.get("extra", [])
    code, stdout, stderr = run(args)
    res.check("%s · Konverter laeuft" % case["name"], code == 0,
              stderr.strip().splitlines()[-1] if code else "")
    if code != 0:
        return
    if case.get("docs"):
        d_args = [str(SCRIPTS / "mockup_to_docs.py"), str(spec), "--out", str(out),
                  "--no-pptx", "--force-md"]
        code, _, stderr = run(d_args)
        res.check("%s · Doku laeuft" % case["name"], code == 0,
                  stderr.strip()[-200:] if code else "")
        if case.get("docs_lang"):
            code, _, stderr = run(d_args + ["--lang", case["docs_lang"]])
            res.check("%s · Doku (%s) laeuft" % (case["name"], case["docs_lang"]),
                      code == 0, stderr.strip()[-200:] if code else "")

    gold_dir = GOLDEN / case["name"]
    produced = collect(out, out)
    if update:
        if gold_dir.exists():
            shutil.rmtree(gold_dir)
        for rel, text in produced.items():
            target = gold_dir / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            # newline='\n': sonst schreibt Windows CRLF und jede Golden-Datei
            # taucht im Diff auf, obwohl sich inhaltlich nichts geaendert hat.
            target.write_text(text, encoding="utf-8", newline="\n")
        res.check("%s · Golden geschrieben (%d Dateien)" % (case["name"], len(produced)),
                  True)
        return
    if not gold_dir.is_dir():
        res.check("%s · Golden vorhanden" % case["name"], False,
                  "tests/golden/%s fehlt — einmal mit --update erzeugen" % case["name"])
        return
    expected = collect(gold_dir)
    missing = sorted(set(expected) - set(produced))
    extra = sorted(set(produced) - set(expected))
    res.check("%s · Dateiliste" % case["name"], not missing and not extra,
              "fehlt: %s | zusaetzlich: %s" % (", ".join(missing) or "–",
                                               ", ".join(extra) or "–"))
    for rel in sorted(set(expected) & set(produced)):
        res.diff("%s · %s" % (case["name"], rel), expected[rel], produced[rel])


# --------------------------------------------------------------------------- #
# 2 · Negativtests der Validierung
# --------------------------------------------------------------------------- #
def validation_tests(tmp: Path, res: Results):
    for label, env in (("jsonschema", None),
                       ("eigener Validator", {"MOCKUP_NO_JSONSCHEMA": "1"})):
        code, stdout, stderr = run(
            [str(SCRIPTS / "mockup_to_pbir.py"), str(FIXTURES / "kaputt.json"),
             "--out", str(tmp / "kaputt")], env)
        res.check("kaputte Spec (%s) · Exit 2" % label, code == 2, "Exit %d" % code)
        res.check("kaputte Spec (%s) · kein Traceback" % label,
                  "Traceback" not in stderr)
        for needle in ("design.tileStyle", "engine", "rect", "Seitenname"):
            res.check("kaputte Spec (%s) · meldet %s" % (label, needle),
                      needle in stderr, stderr.strip()[:200])
        res.check("kaputte Spec (%s) · schreibt nichts" % label,
                  not (tmp / "kaputt").exists())

    code, stdout, stderr = run(
        [str(SCRIPTS / "mockup_to_pbir.py"), str(FIXTURES / "v4-zukunft.json"),
         "--out", str(tmp / "v4")])
    res.check("Spec-Version 4 · Abbruch", code == 2, "Exit %d" % code)
    res.check("Spec-Version 4 · nennt die Version",
              "Spec-Version 4" in stderr and "Skill aktualisieren" in stderr,
              stderr.strip()[:200])

    code, stdout, stderr = run(
        [str(SCRIPTS / "mockup_to_pbir.py"), str(FIXTURES / "kaputt.json"),
         "--out", str(tmp / "kaputt-force"), "--force"])
    res.check("kaputte Spec mit --force · baut trotzdem", code == 0, "Exit %d" % code)
    res.check("kaputte Spec mit --force · schreibt Dateien",
              (tmp / "kaputt-force" / "checklist.md").is_file())

    code, stdout, stderr = run(
        [str(SCRIPTS / "mockup_to_pbir.py"), str(FIXTURES / "v3-analyse.json"),
         "--validate"])
    res.check("--validate · gute Spec = Exit 0", code == 0, stderr.strip()[:200])
    res.check("--validate · schreibt nichts", "mockup-out" not in stdout
              or not Path("mockup-out").exists())

    missing = tmp / "gibtsnicht.json"
    code, stdout, stderr = run([str(SCRIPTS / "mockup_to_pbir.py"), str(missing)])
    res.check("fehlende Spec · Exit 2", code == 2, "Exit %d" % code)
    res.check("fehlende Spec · klare Meldung", "nicht gefunden" in stderr)

    broken = tmp / "kaputt.json.txt"
    broken.write_text("{ das ist kein json", encoding="utf-8")
    code, stdout, stderr = run([str(SCRIPTS / "mockup_to_pbir.py"), str(broken)])
    res.check("kein JSON · Exit 2", code == 2, "Exit %d" % code)
    res.check("kein JSON · nennt Zeile/Spalte", "Zeile" in stderr and "Spalte" in stderr)

    code, stdout, stderr = run(
        [str(SCRIPTS / "mockup_verify.py"), REPORT, str(tmp / "fehlt.json")])
    res.check("verify ohne acceptance.json · Exit 2", code == 2, "Exit %d" % code)


# --------------------------------------------------------------------------- #
# 3 · Einheiten
# --------------------------------------------------------------------------- #
def unit_tests(res: Results):
    import mockup_spec as M
    import mockup_verify as V

    res.check("slug() wie im Tool", M.slug("Detail Produktlinie") == "Detail_Produktlinie")
    res.check("slug() entfernt Umlaute", M.slug("Übersicht") == "Ubersicht")
    res.check("split_ref()", M.split_ref("_Measures.Marge%") == ("_Measures", "Marge%"))

    spec = M.load(FIXTURES / "v3-analyse.json")
    n = M.upgrade(spec)
    res.check("upgrade() laesst v3 in Ruhe", n["sourceVersion"] == 3 and n["version"] == 3)
    res.check("upgrade() findet Steckbriefe", any(f.get("alias") for f in n["fields"]))
    res.check("Schema sauber", M.validate(M.as_document(n)) == [])
    res.check("Struktur sauber", M.structural_errors(n) == [])

    v1 = M.upgrade(M.load(FIXTURES / "v1-einseitig.json"))
    res.check("v1 wird auf v3 gehoben", v1["sourceVersion"] == 1 and v1["version"] == 3)
    res.check("v1 bekommt einen Analyse-Block",
              all("analysis" in v for p in v1["pages"] for v in p["visuals"]))
    res.check("v1 bekommt einen Spec-Hash", bool(v1["meta"].get("specHash")))
    res.check("v1 Schema sauber", M.validate(M.as_document(v1)) == [])

    v2 = M.upgrade(M.load(FIXTURES / "v2-zweiseitig.json"))
    res.check("v2 wird auf v3 gehoben", v2["sourceVersion"] == 2)
    res.check("v2 Drill-Feld ergaenzt",
              all(l.get("drillField") for l in v2["links"]
                  if l.get("kind") == "drillthrough") or not v2["links"])

    try:
        M.upgrade(M.load(FIXTURES / "v4-zukunft.json"))
        res.check("upgrade() bricht bei v4 ab", False, "keine SpecError")
    except M.SpecError as e:
        res.check("upgrade() bricht bei v4 ab", "Spec-Version 4" in str(e))

    dup = M.upgrade(M.load(FIXTURES / "kaputt.json"))
    res.check("doppelte Seitennamen fallen auf",
              any("mehrfach" in m for m in M.structural_errors(dup)))

    # --- Custom Visuals (Tool 0.4) ---------------------------------------- #
    import mockup_to_pbir as P

    cvs = M.upgrade(M.load(FIXTURES / "v3-custom-visuals.json"))
    res.check("Custom-Spec Schema sauber", M.validate(M.as_document(cvs)) == [])
    res.check("Custom-Spec Struktur sauber", M.structural_errors(cvs) == [])
    tiles = {v["id"]: v for v in cvs["pages"][0]["visuals"]}
    res.check("engine `custom` bleibt erhalten",
              tiles["mk_pnl1"]["engine"] == "custom")
    res.check("customVisual wird durchgereicht",
              (tiles["mk_pnl1"].get("customVisual") or {}).get("guid")
              == "pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358")
    name, info = M.custom_visual_info(tiles["mk_gantt1"]["customVisual"])
    res.check("Registry findet dataKitchenGantt ueber den Namen",
              name == "dataKitchenGantt" and "task" in info["roles"])
    name2, _ = M.custom_visual_info({"guid": "pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358"})
    res.check("Registry findet pnlByDatenWG ueber die GUID", name2 == "pnlByDatenWG")

    qs = P.custom_query_state(tiles["mk_pnl1"]["customVisual"]["buckets"])
    res.check("queryState hat eine Projektion je Rolle",
              sorted(qs) == ["ac", "fc", "levels", "pl", "py", "rowType"])
    res.check("Spalten werden als Column projiziert",
              "Column" in qs["levels"]["projections"][0]["field"])
    res.check("Measures werden als Measure projiziert",
              "Measure" in qs["ac"]["projections"][0]["field"])
    res.check("queryRef bleibt Tabelle.Feld",
              qs["ac"]["projections"][0]["queryRef"] == "_Measures.AC"
              and qs["ac"]["projections"][0]["nativeQueryRef"] == "AC")
    res.check("erste Spaltenprojektion ist aktiv",
              qs["levels"]["projections"][0].get("active") is True
              and "active" not in qs["levels"]["projections"][1])

    class _Opt:
        ink = None
        on_ink = "#FFFFFF"
        muted_on_ink = "#C8CDD4"
        muted = "#6B7280"
        panel = "#F1F3F5"
        tile_border = "#E5E7EB"

    st = P.Style(cvs, _Opt())
    res.check("Kopfband `custom` nimmt die Spec-Farben",
              st.header_bg == "#123B4F" and st.header_fg == "#F7FAFC")
    res.check("Ink kommt aus design.colors", st.ink == "#1F2933")
    res.check("IBCS-Palette wird uebernommen",
              (st.good, st.bad) == ("#3A9A5B", "#C8412F"))
    doc = P.custom_visual_json(tiles["mk_pnl1"], st)
    res.check("visualType ist die GUID",
              doc["visual"]["visualType"] == "pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358")
    res.check("visual.json traegt das pbir-Schema 2.9.0",
              doc["$schema"].endswith("visualContainer/2.9.0/schema.json"))
    res.check("visualContainerObjects sind Arrays",
              all(isinstance(x, list)
                  for x in doc["visual"]["visualContainerObjects"].values()))
    slots, warn = P.build_custom_visuals(cvs, cvs["pages"][0], st)
    res.check("drei Custom-Slots erkannt", len(slots) == 3)
    res.check("leere Pflichtrolle wird gemeldet",
              any("`start`" in w for w in warn), "; ".join(warn)[:120])
    res.check("belegte Pflichtrollen melden nichts",
              not any(s_["id"] == "mk_pnl1" and s_["warnings"] for s_ in slots))
    res.check("Custom Visuals stehen nicht in pbir-visuals.json",
              not any(i["name"].startswith("mk_gantt")
                      for i in P.build_pbir_visuals(cvs, cvs["pages"][0])[0]))

    theme = P.build_theme_fragment(cvs, st)
    res.check("Theme-Fragment traegt die Varianzfarben",
              theme["good"] == "#3A9A5B" and theme["bad"] == "#C8412F")
    res.check("Theme-Fragment traegt Hintergrund und Ink",
              theme["background"] == "#F7F4EF" and theme["foreground"] == "#1F2933")

    plain = M.upgrade(M.load(FIXTURES / "v3-analyse.json"))
    res.check("alte Spec bekommt die Teal-Palette",
              plain["design"]["variancePalette"] == "teal"
              and plain["design"]["varianceColors"]["good"] == "#1E8F9E")
    res.check("alte Spec bekommt den Farbsatz",
              plain["design"]["colors"]["ink"] == "#0F1E2E"
              and plain["design"]["colors"]["headerBackground"] == "#FFFFFF")
    res.check("rowType hat eine ChartKitchen-Rolle", M.CK_ROLE.get("rowType") == "rowType")

    broken = json.loads((FIXTURES / "v3-custom-visuals.json").read_text(encoding="utf-8"))
    broken["pages"][0]["visuals"][0]["customVisual"] = None
    res.check("engine custom ohne customVisual faellt auf",
              any("customVisual" in m for m in M.structural_errors(M.upgrade(broken))))

    res.check("near() haelt Toleranz ein", V.near(100, 101, 1) and not V.near(100, 102, 1))
    res.check("type_ok() erlaubt Alternativen",
              V.type_ok("chartKitchen|shape", "shape") and not V.type_ok("card", "slicer"))
    res.check("type_ok() erkennt eine Custom-Visual-GUID",
              V.type_ok("pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358|shape",
                        "pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358"))
    demo = {"report": REPORT, "specHash": "abc", "tolerance": 1,
            "pages": [{"name": "S1", "status": "ok",
                       "rows": [{"visual": "v1", "role": "content", "status": "ok",
                                 "detail": ""}],
                       "extra": [{"visual": "alt", "type": "card"}]}],
            "bookmarks": [], "drillthrough": [], "annotation": None,
            "counts": {"ok": 1, "offen": 0, "ABWEICHUNG": 0}}
    text = V.render(demo)
    res.check("verify-Bericht nennt das Ergebnis", "abgenommen" in text)
    res.check("verify-Bericht meldet Zusatzvisuals", "nur im Bericht" in text.lower()
              or "Nur im Bericht" in text)


# --------------------------------------------------------------------------- #
def main() -> int:
    ap = argparse.ArgumentParser(description="Evals fuer mockup-to-powerbi")
    ap.add_argument("--update", action="store_true",
                    help="Golden-Dateien neu schreiben (nach bewussten Aenderungen)")
    ap.add_argument("--only", default=None, help="nur Faelle mit diesem Text im Namen")
    ap.add_argument("-v", "--verbose", action="store_true", help="Diffs zeigen")
    opt = ap.parse_args()

    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

    res = Results(opt.verbose)
    tmp = Path(tempfile.mkdtemp(prefix="mockup-tests-"))
    try:
        print("Golden-Vergleich")
        for case in CASES:
            if opt.only and opt.only not in case["name"]:
                continue
            golden_case(case, tmp, res, opt.update)
        if not opt.only:
            print("Validierung (Negativtests)")
            validation_tests(tmp, res)
            print("Einheiten")
            unit_tests(res)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    total = len(res.rows)
    bad = res.failed
    print("\n%d Pruefungen · %d ok · %d fehlgeschlagen" % (total, total - len(bad), len(bad)))
    if bad:
        print("\nFehlgeschlagen:")
        for name, _, detail in bad:
            print("  - %s%s" % (name, ("  — " + detail.splitlines()[0]) if detail else ""))
    return 1 if bad else 0


if __name__ == "__main__":
    raise SystemExit(main())
