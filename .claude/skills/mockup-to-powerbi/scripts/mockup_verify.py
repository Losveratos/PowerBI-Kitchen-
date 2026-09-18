#!/usr/bin/env python3
"""mockup_verify.py — Abnahme: gebauter Bericht gegen das Sollbild aus dem Mockup.

    python mockup_verify.py "<Name>.Report" acceptance.json [--json] [--quiet]
                            [--tolerance 1] [--cwd <Ordner mit dem Report>]

`acceptance.json` erzeugt `mockup_to_pbir.py --plan`. Geprueft wird ueber die
**pbir-CLI**, nicht mit Regex auf den Rohdateien:

    pbir ls "<Report>" --json                  Seiten, Lesezeichen
    pbir ls "<Report>/<Seite>.Page" --json     Visuals (Name, Typ, z), Seitenfilter
    pbir cat "<Report>/<Seite>.Page/<V>.Visual"  Position und Feldbindungen
    pbir annotations list "<Report>" --json    Spec-Hash des letzten Laufs

Geprueft wird je Seite: existiert jedes erwartete Visual, stimmt der Typ, liegt
das Rechteck innerhalb der Toleranz (Default +/-1 px), sind die Buckets mit den
erwarteten Feldern belegt. Dazu Lesezeichen, Drill-through-Felder und der
Spec-Hash als Report-Annotation.

Was im Bericht steht, aber nicht im Sollbild: wird **nur gemeldet**, nie
geloescht ("nur im Bericht"). Exit-Code 0 = abgenommen, 1 = Abweichungen,
2 = Aufruf- oder CLI-Fehler.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

OK, WARN, BAD = "ok", "offen", "ABWEICHUNG"


def run_pbir(args, cwd=None):
    """pbir aufrufen und stdout zurueckgeben (utf-8, nie Traceback)."""
    try:
        proc = subprocess.run(["pbir"] + list(args), cwd=cwd, capture_output=True)
    except FileNotFoundError:
        raise SystemExit("pbir nicht gefunden — CLI installieren oder PATH pruefen.")
    out = proc.stdout.decode("utf-8", "replace")
    err = proc.stderr.decode("utf-8", "replace")
    return proc.returncode, out, err


def run_json(args, cwd=None):
    code, out, err = run_pbir(args, cwd)
    text = out.strip()
    if not text:
        return None, (err.strip() or "keine Ausgabe (Exit %d)" % code)
    try:
        return json.loads(text), None
    except json.JSONDecodeError:
        first = text.splitlines()[0] if text.splitlines() else text
        return None, first[:200]


# --------------------------------------------------------------------------- #
# Lesen
# --------------------------------------------------------------------------- #
def visual_facts(report, page, name, cwd):
    """(rect, typ, buckets) eines Visuals aus `pbir cat`."""
    data, err = run_json(["cat", "%s/%s.Page/%s.Visual" % (report, page, name)], cwd)
    if data is None:
        return None, None, None, err
    pos = data.get("position") or {}
    rect = {"x": pos.get("x"), "y": pos.get("y"),
            "w": pos.get("width"), "h": pos.get("height")}
    vis = data.get("visual") or {}
    buckets = {}
    query_state = ((vis.get("query") or {}).get("queryState") or {})
    for bucket, body in query_state.items():
        refs = []
        for proj in (body or {}).get("projections") or []:
            ref = proj.get("queryRef")
            if ref:
                refs.append(ref)
        if refs:
            buckets[bucket] = refs
    return rect, vis.get("visualType"), buckets, None


def near(a, b, tol):
    if a is None or b is None:
        return False
    return abs(int(a) - int(b)) <= tol


def type_ok(expected, actual):
    if not expected or not actual:
        return True
    options = [t.strip() for t in str(expected).split("|")]
    return actual in options or "shape" in options and actual == "shape"


# --------------------------------------------------------------------------- #
# Pruefen
# --------------------------------------------------------------------------- #
def check(report, acceptance, cwd, tol):
    result = {"report": report, "specHash": acceptance.get("specHash"),
              "tolerance": tol, "pages": [], "bookmarks": [], "drillthrough": [],
              "annotation": None, "counts": {OK: 0, WARN: 0, BAD: 0}}

    top, err = run_json(["ls", report, "--json"], cwd)
    if top is None:
        raise SystemExit("`pbir ls \"%s\" --json` lieferte nichts Lesbares: %s"
                         % (report, err))
    page_names = {p.get("displayName") for p in (top.get("pages") or [])}
    bookmark_names = {b.get("displayName") for b in (top.get("bookmarks") or [])}

    def tally(status):
        result["counts"][status] = result["counts"].get(status, 0) + 1

    for page in acceptance.get("pages") or []:
        pname = page.get("name")
        entry = {"name": pname, "status": OK, "rows": [], "extra": []}
        result["pages"].append(entry)
        if pname not in page_names:
            entry["status"] = BAD
            entry["rows"].append({"visual": "(Seite)", "status": BAD,
                                  "detail": "Seite fehlt im Bericht"})
            tally(BAD)
            continue
        listing, err = run_json(["ls", "%s/%s.Page" % (report, pname), "--json"], cwd)
        if listing is None:
            entry["status"] = BAD
            entry["rows"].append({"visual": "(Seite)", "status": BAD,
                                  "detail": "pbir ls: %s" % err})
            tally(BAD)
            continue
        present = {v.get("id"): v for v in (listing.get("visuals") or [])}
        expected_names = set()

        for exp in page.get("visuals") or []:
            name = exp.get("name")
            expected_names.add(name)
            row = {"visual": name, "role": exp.get("role"), "status": OK, "detail": ""}
            entry["rows"].append(row)
            if name not in present:
                if exp.get("optional"):
                    row["status"] = WARN
                    row["detail"] = "noch nicht gebaut (%s-Slot)" % exp.get("role")
                else:
                    row["status"] = BAD
                    row["detail"] = "fehlt"
                tally(row["status"])
                continue
            rect, vtype, buckets, cat_err = visual_facts(report, pname, name, cwd)
            if rect is None:
                row["status"] = BAD
                row["detail"] = "pbir cat: %s" % cat_err
                tally(BAD)
                continue
            problems = []
            want = exp.get("rect") or {}
            if not all(near(rect[k], want.get(k), tol) for k in ("x", "y", "w", "h")):
                problems.append("Rechteck %s/%s/%s/%s statt %s/%s/%s/%s"
                                % (rect["x"], rect["y"], rect["w"], rect["h"],
                                   want.get("x"), want.get("y"),
                                   want.get("w"), want.get("h")))
            if not type_ok(exp.get("type"), vtype):
                problems.append("Typ `%s` statt `%s`" % (vtype, exp.get("type")))
            for bucket, refs in (exp.get("fields") or {}).items():
                have = buckets.get(bucket) or []
                if sorted(have) != sorted(refs):
                    problems.append("Bucket %s: %s statt %s"
                                    % (bucket, ", ".join(have) or "leer", ", ".join(refs)))
            if problems:
                row["status"] = BAD
                row["detail"] = "; ".join(problems)
            tally(row["status"])

        for name in present:
            if name not in expected_names:
                entry["extra"].append({"visual": name, "type": present[name].get("type")})
        if any(r["status"] == BAD for r in entry["rows"]):
            entry["status"] = BAD
        elif any(r["status"] == WARN for r in entry["rows"]):
            entry["status"] = WARN

        # Drill-through-Felder dieser Seite
        for f in (listing.get("filters") or []):
            if f.get("howCreated") == "Drillthrough":
                col = (f.get("field") or {}).get("Column") or {}
                ent = (((col.get("Expression") or {}).get("SourceRef")) or {}).get("Entity")
                result["drillthrough"].append({"page": pname, "table": ent,
                                               "field": col.get("Property")})

    for bm in acceptance.get("bookmarks") or []:
        status = OK if bm in bookmark_names else BAD
        result["bookmarks"].append({"name": bm, "status": status})
        tally(status)

    for want in acceptance.get("drillthrough") or []:
        hit = any(d["page"] == want["page"] and d["table"] == want["table"]
                  and d["field"] == want["field"] for d in result["drillthrough"])
        result["bookmarks"].append({
            "name": "Drill-through %s → %s.%s" % (want["page"], want["table"],
                                                  want["field"]),
            "status": OK if hit else BAD})
        tally(OK if hit else BAD)

    ann, _ = run_json(["annotations", "list", report, "--json"], cwd)
    want_hash = (acceptance.get("annotations") or {}).get("mockup-spec-hash")
    if want_hash:
        found = None
        for a in ((ann or {}).get("annotations") or []):
            if a.get("name") == "mockup-spec-hash":
                found = a.get("value")
        if found == want_hash:
            result["annotation"] = {"status": OK,
                                    "detail": "Spec-Hash %s stimmt" % want_hash}
        elif found:
            result["annotation"] = {"status": BAD,
                                    "detail": "Bericht traegt Hash %s, das Sollbild "
                                              "erwartet %s — der Bericht stammt aus "
                                              "einem anderen Mockup-Stand"
                                              % (found, want_hash)}
        else:
            result["annotation"] = {"status": WARN,
                                    "detail": "keine Annotation `mockup-spec-hash` im "
                                              "Bericht — nach dem Bau setzen: "
                                              "pbir add annotation \"%s\" --name "
                                              "mockup-spec-hash --value \"%s\""
                                              % (report, want_hash)}
        tally(result["annotation"]["status"])
    return result


# --------------------------------------------------------------------------- #
# Ausgabe
# --------------------------------------------------------------------------- #
def render(result, quiet=False) -> str:
    L = ["# Abnahme · %s" % result["report"], "",
         "Sollbild: Spec-Hash `%s` · Toleranz ±%d px"
         % (result.get("specHash") or "–", result["tolerance"]), ""]
    for page in result["pages"]:
        bad = [r for r in page["rows"] if r["status"] == BAD]
        warn = [r for r in page["rows"] if r["status"] == WARN]
        L.append("## %s — %d geprueft, %d Abweichung(en), %d offen"
                 % (page["name"], len(page["rows"]), len(bad), len(warn)))
        L.append("")
        rows = page["rows"] if not quiet else bad + warn
        if rows:
            L += ["| Visual | Rolle | Status | Befund |", "|---|---|---|---|"]
            for r in rows:
                L.append("| `%s` | %s | %s | %s |"
                         % (r["visual"], r.get("role") or "–", r["status"],
                            r.get("detail") or ""))
            L.append("")
        if page["extra"]:
            L += ["Nur im Bericht, nicht im Mockup (wird **nicht** geloescht):", ""]
            L += ["- `%s` (%s)" % (e["visual"], e["type"]) for e in page["extra"]]
            L.append("")
    if result["bookmarks"]:
        L += ["## Lesezeichen und Drill-through", "", "| Erwartet | Status |",
              "|---|---|"]
        for b in result["bookmarks"]:
            L.append("| %s | %s |" % (b["name"], b["status"]))
        L.append("")
    if result.get("annotation"):
        L += ["## Spec-Hash", "",
              "%s — %s" % (result["annotation"]["status"], result["annotation"]["detail"]),
              ""]
    c = result["counts"]
    verdict = ("abgenommen" if not c.get(BAD) else "%d Abweichung(en)" % c[BAD])
    L += ["---", "", "**Ergebnis: %s** (%d ok, %d offen, %d Abweichung(en))"
          % (verdict, c.get(OK, 0), c.get(WARN, 0), c.get(BAD, 0)), ""]
    return "\n".join(L)


def main() -> int:
    p = argparse.ArgumentParser(
        description="Gebauten Bericht gegen acceptance.json pruefen (pbir-CLI)")
    p.add_argument("report", help='Report-Ordner, z. B. "Meine.Report"')
    p.add_argument("acceptance", help="acceptance.json aus mockup_to_pbir.py --plan")
    p.add_argument("--cwd", default=None,
                   help="Arbeitsverzeichnis, in dem der Report liegt")
    p.add_argument("--tolerance", type=int, default=None,
                   help="erlaubte Abweichung je Kante in px (Default: aus acceptance.json)")
    p.add_argument("--json", dest="as_json", action="store_true",
                   help="Ergebnis als JSON statt als Tabelle")
    p.add_argument("--quiet", action="store_true",
                   help="nur Abweichungen und offene Punkte auflisten")
    opt = p.parse_args()

    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

    path = Path(opt.acceptance).expanduser()
    if not path.is_file():
        print("acceptance.json nicht gefunden: %s" % path, file=sys.stderr)
        return 2
    try:
        acceptance = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print("acceptance.json ist kein gueltiges JSON: %s" % e, file=sys.stderr)
        return 2

    tol = opt.tolerance if opt.tolerance is not None else int(acceptance.get("tolerance", 1))
    result = check(opt.report, acceptance, opt.cwd, tol)
    if opt.as_json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(render(result, opt.quiet))
    return 1 if result["counts"].get(BAD) else 0


if __name__ == "__main__":
    raise SystemExit(main())
