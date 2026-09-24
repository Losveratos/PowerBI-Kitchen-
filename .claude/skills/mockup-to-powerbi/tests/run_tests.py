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
   ChartKitchen ohne Referenz-Instanz, voller Analyse-Block, Custom Visuals,
   Darstellungsvarianten aus Tool 0.4.1, Typografie/Filterbereich/Fussleisten-
   Navigation/Barrierefreiheit aus Tool 0.4.3/0.4.4).
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
    {"name": "v3-variants", "spec": "v3-variants.json", "docs": True,
     "docs_lang": "en"},
    {"name": "v3-typo-filter", "spec": "v3-typo-filter.json", "docs": True,
     "docs_lang": "en"},
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

    # --- Darstellungsvarianten (Tool 0.4.1) -------------------------------- #
    import mockup_to_docs as D

    var = M.upgrade(M.load(FIXTURES / "v3-variants.json"))
    res.check("Varianten-Spec Schema sauber", M.validate(M.as_document(var)) == [])
    res.check("Varianten-Spec Struktur sauber", M.structural_errors(var) == [])
    vt = {v["id"]: v for v in var["pages"][0]["visuals"]}

    res.check("Small-Multiples-Bucket ist `Rows`", M.SMALL_MULTIPLES_BUCKET == "Rows")
    res.check("pivotTable zaehlt NICHT als Small-Multiples-Typ",
              "pivotTable" not in M.SMALL_MULTIPLES_TYPES
              and "clusteredColumnChart" in M.SMALL_MULTIPLES_TYPES)
    res.check("donutChart hat keinen Small-Multiples-Bucket",
              "donutChart" not in M.SMALL_MULTIPLES_TYPES)
    res.check("ndonut bietet keine Varianten an", "ndonut" in M.NO_VARIANT_KINDS)
    res.check("Rolle `multiples` hat eine ChartKitchen-Entsprechung",
              M.CK_ROLE.get("multiples") == "multiples")
    for key in ("series", "values", "multiples"):
        res.check("Rollen-Vokabular kennt `%s`" % key, key in M.ROLE_KEYS)

    res.check("smallMultiples wird durchgereicht",
              vt["mk_col1"]["analysis"]["smallMultiples"] == {"field": "DimRegion.Region"})
    res.check("smallMultiples ohne Feld bleibt ein Objekt",
              vt["mk_line1"]["analysis"]["smallMultiples"] == {"field": None})
    res.check("P.sm_field liest das Aufteilungsfeld",
              P.sm_field(vt["mk_col1"]) == "DimRegion.Region"
              and P.sm_field(vt["mk_line1"]) is None
              and P.sm_field(vt["mk_donut1"]) is None)

    fp = P.field_param(vt["mk_bar1"])
    res.check("fieldParam wird durchgereicht",
              fp and fp["name"] == "Achse" and len(fp["fields"]) == 3)
    res.check("param_ref() ist Tabelle.Feld mit gleichem Namen",
              P.param_ref(fp) == "Achse.Achse")
    res.check("Kacheln ohne Feldparameter liefern None",
              P.field_param(vt["mk_col1"]) is None)

    items, _ = P.build_pbir_visuals(var, var["pages"][0])
    by_name = {i["name"]: i for i in items}
    res.check("Small Multiples landen im Bucket `Rows`",
              by_name["mk_col1"]["fields"].get("Rows") == "DimRegion.Region")
    res.check("ohne Aufteilungsfeld kein `Rows`",
              "Rows" not in by_name["mk_line1"]["fields"])
    res.check("Typ ohne Bucket bekommt kein `Rows`",
              "Rows" not in by_name["mk_wf1"]["fields"])
    res.check("Feldparameter ersetzt die Kategorie-Felder",
              by_name["mk_bar1"]["fields"]["Category"] == "Achse.Achse")
    res.check("Feldparameter laesst die uebrigen Buckets in Ruhe",
              by_name["mk_bar1"]["fields"]["Series"] == "DimProduct.Brand"
              and by_name["mk_bar1"]["fields"]["Y"]
              == ["_Measures.Umsatz", "_Measures.Kosten"])
    res.check("ChartKitchen-Kachel steht nicht in pbir-visuals.json",
              "mk_ck1" not in by_name)
    res.check("native Klassiker behalten ihren Typ",
              by_name["mk_donut1"]["visual_type"] == "donutChart"
              and by_name["mk_line1"]["visual_type"] == "lineChart"
              and by_name["mk_col1"]["visual_type"] == "clusteredColumnChart"
              and by_name["mk_bar1"]["visual_type"] == "clusteredBarChart")

    built = {i["name"] for i in items}
    _, var_todos, _ = P.analysis_actions(var, var["pages"][0], built, "de")
    codes = {t["code"] for t in var_todos}
    for code in ("SM_NO_FIELD", "SM_NO_BUCKET", "SM_NOT_NATIVE",
                 "FIELDPARAM", "FIELDPARAM_FEW", "FIELDPARAM_SLICER"):
        res.check("Analyse-To-do `%s` entsteht" % code, code in codes,
                  ", ".join(sorted(codes)))

    params = P.collect_field_params(var)
    res.check("zwei Feldparameter gesammelt", len(params) == 2)
    script = "\n".join(P.field_param_script(params[0]))
    res.check("Feldparameter-Skript nutzt NAMEOF", "NAMEOF" in script)
    res.check("Feldparameter-Skript setzt ParameterMetadata",
              'SetExtendedProperty("ParameterMetadata"' in script
              and '\\"version\\":3,\\"kind\\":2' in script)
    res.check("Feldparameter-Skript legt die drei Spalten selbst an "
              "(te legt sie nicht automatisch an)",
              script.count("AddCalculatedTableColumn") == 3)
    res.check("Feldparameter-Skript bindet Sortierung und Gruppierung",
              "SortByColumn" in script and "GroupByColumns.Add" in script)
    md = P.build_model_todos(var, "Vertrieb.SemanticModel")
    res.check("model-todos.md nennt den Feldparameter",
              "## Feldparameter" in md and "te script" in md and "prüfen" in md)

    # navOn: false -> keine chrome_nav_*-Buttons im Kopfband
    class _Opt2(_Opt):
        pass

    st_var = P.Style(var, _Opt2())
    chrome, _, _, notes_var, _ = P.build_chrome(var, var["pages"][0], st_var, _Opt2())
    res.check("navOn: false legt keine Nav-Buttons an",
              not any(c["name"].startswith("chrome_nav_") for c in chrome),
              ", ".join(c["name"] for c in chrome))
    res.check("navOn: false wird als Hinweis gemeldet",
              any("navOn" in n for n in notes_var), "; ".join(notes_var)[:120])

    nav_md = P.build_navigation_md(var, "Test.Report")
    res.check("navigation.md erklaert navOn: false", "navOn" in nav_md)

    with_nav = json.loads((FIXTURES / "v3-variants.json").read_text(encoding="utf-8"))
    with_nav["zones"]["header"]["navOn"] = True
    with_nav["zones"]["header"]["nav"] = ["Varianten"]
    nspec_nav = M.upgrade(with_nav)
    chrome2, _, _, _, _ = P.build_chrome(nspec_nav, nspec_nav["pages"][0],
                                         P.Style(nspec_nav, _Opt2()), _Opt2())
    res.check("navOn: true legt die Nav-Buttons wieder an",
              any(c["name"] == "chrome_nav_1" for c in chrome2))

    # Doku: Analyse-Zeile wie analysisLine in export.js
    line = D.analysis_summary(vt["mk_col1"], "de")
    res.check("Doku nennt Small Multiples",
              "Small Multiples nach DimRegion.Region" in line, line)
    line_fp = D.analysis_summary(vt["mk_bar1"], "de")
    res.check("Doku nennt den Feldparameter",
              "Achse per Feldparameter „Achse\"" in line_fp
              and "DimRegion.Region" in line_fp, line_fp)
    line_en = D.analysis_summary(vt["mk_col1"], "en")
    res.check("Doku englisch: small multiples",
              "Small multiples by DimRegion.Region" in line_en, line_en)
    res.check("Doku kennt das Rollen-Label `multiples`",
              D.role_label("multiples", "de") == "Small Multiples nach"
              and D.role_label("multiples", "en") == "Small multiples by")

    # Hash bleibt stabil: die neuen Schluessel zaehlen nur, wenn sie benutzt werden
    v1_hash = M.upgrade(M.load(FIXTURES / "v1-einseitig.json"))["meta"]["specHash"]
    plain_a = M.upgrade(M.load(FIXTURES / "v1-einseitig.json"))
    for pg in plain_a["pages"]:
        for tile in pg["visuals"]:
            res.check("v1 bekommt die neuen Analyse-Schluessel als None",
                      tile["analysis"]["smallMultiples"] is None
                      and tile["analysis"]["fieldParam"] is None)
            break
        break
    res.check("ungenutzte Varianten aendern den Hash nicht",
              v1_hash == M.spec_hash(plain_a), v1_hash)
    used = json.loads(json.dumps(plain_a["pages"][0]["visuals"][0]["analysis"]))
    used["smallMultiples"] = {"field": "DimRegion.Region"}
    plain_a["pages"][0]["visuals"][0]["analysis"] = used
    res.check("benutzte Varianten aendern den Hash", v1_hash != M.spec_hash(plain_a))

    bad_name = json.loads((FIXTURES / "v3-variants.json").read_text(encoding="utf-8"))
    bad_name["pages"][0]["visuals"][1]["analysis"]["fieldParam"]["name"] = "Ach'se[x]"
    res.check("kaputter Feldparameter-Name faellt auf",
              any("Feldparameter-Name" in m
                  for m in M.structural_errors(M.upgrade(bad_name))))

    typo_filter_tests(res, P, M, D, _Opt)

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
# 3b · Typografie, Filterbereich, Fussleisten-Navigation, Barrierefreiheit
#      (Tool 0.4.3 / 0.4.4)
# --------------------------------------------------------------------------- #
def typo_filter_tests(res: Results, P, M, D, Opt):
    raw = json.loads((FIXTURES / "v3-typo-filter.json").read_text(encoding="utf-8"))
    tf = M.upgrade(raw)
    res.check("0.4.4-Spec Schema sauber (jsonschema bzw. Standard)",
              M.validate(M.as_document(tf)) == [])
    bad = json.loads(json.dumps(raw))
    bad["zones"]["filter"]["slicers"][0]["type"] = "karussell"
    bad["zones"]["header"]["navPosition"] = "sidebar"
    os.environ["MOCKUP_NO_JSONSCHEMA"] = "1"
    try:
        res.check("0.4.4-Spec Schema sauber (eigener Validator)",
                  M.validate(M.as_document(tf)) == [])
        msgs = M.validate(M.as_document(M.upgrade(bad)))
        res.check("unbekannte Slicer-Art faellt auf (eigener Validator)",
                  any("slicers[0].type" in m for m in msgs), "; ".join(msgs)[:160])
        res.check("unbekannte navPosition faellt auf (eigener Validator)",
                  any("navPosition" in m for m in msgs), "; ".join(msgs)[:160])
    finally:
        os.environ.pop("MOCKUP_NO_JSONSCHEMA", None)
    msgs = M.validate(M.as_document(M.upgrade(bad)))
    res.check("unbekannte Slicer-Art faellt auf (jsonschema bzw. Standard)",
              any("slicers" in m for m in msgs), "; ".join(msgs)[:160])
    res.check("Struktur sauber (0.4.4)", M.structural_errors(tf) == [])

    # --- Typografie -------------------------------------------------------- #
    res.check("half_pt rundet auf 0,5 (kaufmaennisch)",
              M.half_pt(16.0875) == 16 and M.half_pt(12.375) == 12.5
              and M.half_pt(14.25) == 14.5 and M.half_pt(2) == 6)
    res.check("px_to_pt: 12 px = 9 pt", M.px_to_pt(12) == 9)
    ts = M.type_sizes(tf)
    res.check("Typografie: Titel 13 x 1,1 x 1,5 px = 16 pt",
              ts["titlePx"] == 21.45 and ts["titlePt"] == 16, str(ts))
    res.check("Typografie: Untertitel 12,5 pt, Diagramm 11 pt",
              ts["subPt"] == 12.5 and ts["chartPt"] == 11, str(ts))
    tiles = {v["id"]: v for pg in tf["pages"] for v in pg["visuals"]}
    res.check("Kachel-Override x1,3 hebt den Titel auf 21 pt",
              M.type_sizes(tf, tiles["mk_col1"])["titlePt"] == 21)
    res.check("Kachel ohne Override bleibt bei 16 pt",
              M.type_sizes(tf, tiles["mk_kpi1"])["titlePt"] == 16)
    old = M.upgrade(M.load(FIXTURES / "v3-analyse.json"))
    res.check("alte Spec hat keine Typografie", M.type_sizes(old) is None
              and "typography" not in old["design"])
    res.check("Typografie-Vorgaben werden ergaenzt",
              M.normalise_typography({"scale": 1.2}) ==
              {"basis": "1280px", "scale": 1.2, "title": 12.0, "sub": 9.5, "chart": 9.0})

    st = P.Style(tf, Opt())
    page1, page2 = tf["pages"]
    chrome1, _, _, _, batch1 = P.build_chrome(tf, page1, st, Opt())
    typo_props = P.add_typography(P.Commands(), st, page1,
                                  ["mk_kpi1", "mk_col1", "mk_txt1"])
    res.check("title/subTitle.fontSize je Visual",
              typo_props.get("mk_kpi1") == {"title.fontSize": 16,
                                            "subTitle.fontSize": 12.5}
              and typo_props["mk_col1"]["title.fontSize"] == 21, str(typo_props))
    res.check("Text-Kachel bekommt keine Titelgroesse", "mk_txt1" not in typo_props)
    res.check("alte Spec: keine Titelgroessen je Visual",
              P.add_typography(P.Commands(), P.Style(old, Opt()), old["pages"][0],
                               [v["id"] for v in old["pages"][0]["visuals"]]) == {})
    theme = P.build_theme_fragment(tf, st)
    res.check("Theme-Fragment: Titel 16 pt, Untertitel 12,5 pt",
              theme["visualStyles"]["*"]["*"]["title"][0]["fontSize"] == 16
              and theme["visualStyles"]["*"]["*"]["subTitle"][0]["fontSize"] == 12.5)
    res.check("Theme-Fragment: textClasses largeTitle/title/label",
              theme.get("textClasses", {}).get("largeTitle", {}).get("fontSize") == 16
              and theme["textClasses"]["title"]["fontSize"] == 11
              and theme["textClasses"]["label"]["fontSize"] == 11
              and "callout" not in theme["textClasses"])
    res.check("alte Spec: Theme-Fragment ohne textClasses",
              "textClasses" not in P.build_theme_fragment(old, P.Style(old, Opt())))
    cvs_raw = json.loads((FIXTURES / "v3-custom-visuals.json").read_text(encoding="utf-8"))
    cvs_raw["design"]["typography"] = {"basis": "1280px", "scale": 1, "title": 12,
                                       "sub": 9.5, "chart": 9}
    cvs = M.upgrade(cvs_raw)
    doc = P.custom_visual_json(cvs["pages"][0]["visuals"][0], P.Style(cvs, Opt()))
    vco = doc["visual"]["visualContainerObjects"]
    res.check("Custom Visual: Titel 9 pt als Literal 9D",
              vco["title"][0]["properties"]["fontSize"]["expr"]["Literal"]["Value"]
              == "9D", json.dumps(vco["title"])[:120])
    ck, _, _ = P.build_slots(page2, tf)
    res.check("ChartKitchen-Slot traegt die Typografie (x0,85)",
              bool(ck) and ck[0].get("typography", {}).get("titlePt") == 13.5
              and ck[0]["typography"]["tileScale"] == 0.85)

    # --- Fussleisten-Navigation ------------------------------------------- #
    res.check("nav_position: footer", M.nav_position(tf["zones"]) == "footer")
    res.check("nav_position: alte Spec mit navOn false -> off",
              M.nav_position({"header": {"navOn": False}}) == "off"
              and M.nav_position({"header": {}}) == "header")
    footer = tf["zones"]["footer"]
    navs = [c for c in chrome1 if c["name"].startswith("chrome_nav_")]
    res.check("zwei Nav-Buttons in der Fussleiste",
              len(navs) == 2 and all(footer["y"] <= c["y"] and
                                     c["y"] + c["height"] <= footer["y"] + footer["h"]
                                     for c in navs), str(navs)[:160])
    res.check("Fussleisten-Nav ist rechtsbuendig (16 px x k Rand)",
              max(c["x"] + c["width"] for c in navs)
              == footer["x"] + footer["w"] - st.px(16))
    res.check("kein Nav-Button im Kopfband",
              not any(c["y"] < tf["zones"]["header"]["h"] for c in navs))
    res.check("Fussleisten-Nav kleiner als im Kopfband (14,5 < 15 pt)",
              batch1["chrome_nav_1"]["text.fontSize"] == 14.5 and st.sz(10) == 15)
    res.check("aktive Seite gefuellt, andere mit Rahmen",
              batch1["chrome_nav_1"]["fill.show"] is True
              and batch1["chrome_nav_2"]["outline.show"] is True)
    ftext = next(c for c in chrome1 if c["name"] == "chrome_footer_text")
    res.check("Fusszeilentext endet vor der Navigation",
              ftext["x"] + ftext["width"] <= min(c["x"] for c in navs))
    _, _, _, _, batch2 = P.build_chrome(tf, page2, st, Opt())
    res.check("auf Seite 2 ist Button 2 aktiv",
              batch2["chrome_nav_2"]["fill.show"] is True
              and batch2["chrome_nav_1"]["fill.show"] is False)
    no_footer = json.loads(json.dumps(raw))
    del no_footer["zones"]["footer"]
    nf = M.upgrade(no_footer)
    ch_nf, _, _, notes_nf, _ = P.build_chrome(nf, nf["pages"][0], P.Style(nf, Opt()),
                                              Opt())
    res.check("navPosition footer ohne Fussleiste: keine Buttons, aber Hinweis",
              not any(c["name"].startswith("chrome_nav_") for c in ch_nf)
              and any("Fußleiste ist aber aus" in n for n in notes_nf))
    nav_md = P.build_navigation_md(tf, "Test.Report")
    res.check("navigation.md nennt die Fussleiste",
              "in der Fußleiste" in nav_md and "`chrome_nav_2`" in nav_md)

    # --- Filterbereich ---------------------------------------------------- #
    title = next(c for c in chrome1 if c["name"] == "chrome_filter_title")
    res.check("Filter-Ueberschrift aus der Spec",
              batch1["chrome_filter_title"]["text.text"] == "Auswahl")
    ftx = next((c for c in chrome1 if c["name"] == "chrome_filter_text"), None)
    res.check("Filter-Hinweistext als Shape unter der Ueberschrift",
              ftx is not None and ftx["y"] >= title["y"] + title["height"]
              and batch1["chrome_filter_text"]["text.text"].startswith("Alle Werte"))
    items, _ = P.build_pbir_visuals(tf, page1)
    sl = [i for i in items if i["visual_type"] == "slicer"]
    res.check("Slicer beginnen unter dem Hinweistext",
              bool(sl) and min(i["y"] for i in sl) >= ftx["y"] + ftx["height"])
    bp = {}
    P.add_slicer_formatting(tf, page1, P.Commands(), bp)
    res.check("Slicer-Art dropdown -> data.mode Dropdown",
              bp.get("mk_slicer_Year_p1") == {"data.mode": "Dropdown"})
    res.check("Slicer-Art tile -> Basic + orientation 1",
              bp.get("mk_slicer_Region_p1") == {"data.mode": "Basic",
                                                "general.orientation": 1})
    res.check("Slicer-Art date -> Between",
              bp.get("mk_slicer_Date_p1") == {"data.mode": "Between"})
    res.check("Slicer-Art list/search: Basic + orientation 0 (+ Suche)",
              P.SLICER_FORMAT["list"] == {"data.mode": "Basic", "general.orientation": 0}
              and P.SLICER_FORMAT["search"].get("general.selfFilterEnabled") is True
              and P.SLICER_FORMAT["between"] == {"data.mode": "Between"})
    res.check("Slicer-Arten decken das Schema-Enum ab",
              set(P.SLICER_FORMAT) == set(M.SLICER_TYPES))
    # Tool 0.4.6: relatives Datum + Button-Slicer
    rb = json.loads(json.dumps(raw))
    rb["zones"]["filter"]["slicers"][0]["type"] = "button"
    rb["zones"]["filter"]["slicers"][2]["type"] = "relative"
    trb = M.upgrade(rb)
    items_rb, _ = P.build_pbir_visuals(trb, trb["pages"][0])
    btn = next((i for i in items_rb if i["name"] == "mk_slicer_Year_p1"), None)
    res.check("Slicer-Art button -> Visual advancedSlicerVisual mit Feld in Values",
              btn is not None and btn["visual_type"] == "advancedSlicerVisual"
              and btn["fields"] == {"Values": "DimDate.Year"}
              and P.SLICER_VISUAL_TYPE["button"] == "advancedSlicerVisual")
    bp_rb = {}
    notes_rb = P.add_slicer_formatting(trb, trb["pages"][0], P.Commands(), bp_rb)
    res.check("Slicer-Art relative -> data.mode Relative, button ohne Slicer-Formatierung",
              bp_rb.get("mk_slicer_Date_p1") == {"data.mode": "Relative"}
              and "mk_slicer_Year_p1" not in bp_rb
              and any("advancedSlicerVisual" in n for n in notes_rb)
              and any("Relative" in n for n in notes_rb))
    res.check("Schema kennt relative und button",
              {"relative", "button"} <= set(M.SLICER_TYPES))
    bp_old = {}
    P.add_slicer_formatting(old, old["pages"][0], P.Commands(), bp_old)
    res.check("alte Spec: Slicer ohne Art bleiben unformatiert",
              bp_old == {} and P.slicer_type({"name": "x"}) is None)
    no_head = json.loads(json.dumps(raw))
    no_head["zones"]["filter"]["heading"] = None
    no_head["zones"]["filter"]["text"] = None
    nh = M.upgrade(no_head)
    ch_nh, _, _, _, _ = P.build_chrome(nh, nh["pages"][0], P.Style(nh, Opt()), Opt())
    res.check("heading null: keine Filter-Ueberschrift, kein Hinweistext",
              not any(c["name"] in ("chrome_filter_title", "chrome_filter_text")
                      for c in ch_nh))
    res.check("heading null: Slicer rutschen nach oben",
              min(i["y"] for i in P.build_pbir_visuals(nh, nh["pages"][0])[0]
                  if i["visual_type"] == "slicer")
              == nh["zones"]["filter"]["y"] + round(8 * nh["uiScale"]))
    res.check("Lesezeichen-Liste folgt Ueberschrift/Hinweis",
              "chrome_filter_text" in P.panel_visual_names(tf, page1)
              and "chrome_filter_title" not in P.panel_visual_names(nh, nh["pages"][0]))
    old_fl = P.filter_layout(old)
    res.check("alte Spec: Ueberschrift „Filter“, Slicer ab 40 px",
              old_fl["heading"] == "Filter" and not old_fl["new"]
              and old_fl["origin"][1] == old["zones"]["filter"]["y"]
              + round(40 * old["uiScale"]))
    top = json.loads(json.dumps(raw))
    top["zones"]["filter"].update({"mode": "top", "side": "top", "x": 0, "y": 84,
                                   "w": 1920, "h": 84})
    tl = P.filter_layout(M.upgrade(top))
    res.check("Leiste oben: Hinweistext hoechstens 220 px x k, Slicer rechts daneben",
              tl["textRect"][2] <= round(220 * 1.5)
              and tl["origin"][0] >= tl["textRect"][0] + tl["textRect"][2])

    # --- Barrierefreiheit ------------------------------------------------- #
    a11y = M.a11y_issues(tf)
    res.check("A11Y-Befunde erkannt, Fehler zuerst",
              [i["code"] for i in a11y] == ["A11Y_TILE_SMALL", "A11Y_CONTRAST_ACCENT"])
    cl = P.build_checklist(tf, [], [], [], [])
    block = cl.split("## Barrierefreiheit", 1)[-1].split("\n## ", 1)[0]
    res.check("checklist.md hat den Block Barrierefreiheit mit Blocker",
              "## Barrierefreiheit" in cl and "**Blocker**" in block
              and "1 Fehler ist ein Blocker" in block)
    rest = cl.split("## Offene Punkte aus der Spec", 1)[-1].split("## Kennzahlen", 1)[0]
    res.check("A11Y-Befunde stehen nicht doppelt in der Issue-Tabelle",
              "A11Y_" not in rest)
    plan = P.build_plan(tf, "Test.Report", Path("out"), [], "", [])
    res.check("plan.json: Barrierefreiheit als erster Schritt",
              plan["steps"][0]["id"] == "accessibility"
              and plan["accessibility"]["acceptBeforeBuild"] is True
              and plan["accessibility"]["blockers"] == 1)
    res.check("plan.json: Typografie, Filter und Navigation",
              plan["typography"]["titlePt"] == 16
              and plan["filter"]["slicers"][1]["type"] == "tile"
              and plan["navigation"]["position"] == "footer")
    plan_old = P.build_plan(old, "Test.Report", Path("out"), [], "", [])
    res.check("alte Spec: plan.json ohne die neuen Bloecke",
              not any(k in plan_old for k in ("accessibility", "typography",
                                              "filter", "navigation")))
    md_de = D.build_docs_md(tf, "de")
    md_en = D.build_docs_md(tf, "en")
    res.check("Doku (de): Barrierefreiheit mit Blocker",
              "## Barrierefreiheit" in md_de and "**Blocker**" in md_de)
    res.check("Doku (en): Accessibility mit blocker",
              "## Accessibility" in md_en and "**blocker**" in md_en
              and "1 error is a blocker" in md_en)
    res.check("Doku: A11Y nicht doppelt unter Offene Punkte",
              "A11Y" not in md_de.split("## Offene Punkte", 1)[-1])
    res.check("Doku nennt Typografie, Slicer-Art und Fussleisten-Nav",
              "Typografie: Basis 1280px" in md_de and "Region (Kacheln)" in md_de
              and "Seitennavigation in der Fußleiste" in md_de
              and "Region (tiles)" in md_en)


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
