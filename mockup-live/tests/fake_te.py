#!/usr/bin/env python3
"""Attrappe der Tabular-Editor-CLI `te` fuer mockup-live/tests/test_model_ops.py.

Befehlsform und JSON nach der Doku (docs.tabulareditor.com, te-cli-commands,
te-cli-findings, Stand Okt. 2026):

  --version                     "te <version>"
  <cmd> --help                  Hilfe in der eingestellten Form ("p" | "qi")
  ls --type measure|column      [{"objectPath", "type", "properties"}]
  get <pfad> [-p|-q prop]       {"objectPath", "type", "properties"} | Wert
  add <pfad> -t Measure -p k=v… [--if-not-exists] [--save]
  set <pfad> -p k=v… [--save]   (alte Form: -q k -i v)
  mv <alt> <neu> [--save]       benennt um, korrigiert [alt] in Ausdruecken (fixup)
  validate [--errors-only]      {"command","summary","findings","valid"}, Exit 1 bei Fehlern
  Fehler                        Text auf stderr, Exit 1
  Ohne --save: "Dry run - nothing saved." und nichts geschrieben.
  Save-Gate: Ausdruck mit BROKEN wird abgelehnt (neue DAX-Fehler), Exit 1.
  Ausdruck mit INVALID besteht das Save-Gate, faellt aber in validate durch.

Das "Modell" liegt als JSON in <model>/definition/fake_te_model.json (bzw. direkt im
Modellordner), damit Sicherung/Ruecksicherung des Definitionsordners es mitnimmt.

Steuerung ueber $FAKE_TE_CONFIG (JSON-Datei):
  {"expired": false, "version": "0.9.3-preview", "dialect": "p",
   "banner": false,                      # "expires on 2026-10-31" auf stderr
   "validate": "ok" | "errorWhenChanged",
   "preexistingErrors": 0,
   "log": "<pfad>.jsonl"}                # jeder Aufruf eine Zeile
"""
from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

EXPIRED = ("This early preview version of the Tabular Editor CLI expired on 2026-09-30.\n"
           "  Please update to the latest version at https://tabulareditor.com/downloads\n")
MODEL_FILE = "fake_te_model.json"


def config() -> dict:
    p = os.environ.get("FAKE_TE_CONFIG")
    if p and Path(p).is_file():
        return json.loads(Path(p).read_text(encoding="utf-8"))
    return {}


def model_file(model_dir: str) -> Path:
    md = Path(model_dir)
    return (md / "definition" if (md / "definition").is_dir() else md) / MODEL_FILE


def seed(model_dir, tables: dict) -> Path:
    """Testhilfe: {"T": {"measures": {"M": {props}}, "columns": {"C": {props}}}}."""
    f = model_file(str(model_dir))
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(json.dumps({"tables": tables, "changes": 0}, ensure_ascii=False, indent=1),
                 encoding="utf-8")
    return f


def load(model_dir):
    f = model_file(model_dir)
    if not f.is_file():
        return None
    return json.loads(f.read_text(encoding="utf-8"))


def save(model_dir, m):
    m["changes"] = m.get("changes", 0) + 1
    model_file(model_dir).write_text(json.dumps(m, ensure_ascii=False, indent=1),
                                     encoding="utf-8")


def split(path: str):
    m = re.match(r"^'((?:[^']|'')*)'\[((?:[^\]]|\]\])*)\]$", path)
    if m:
        return m.group(1).replace("''", "'"), m.group(2).replace("]]", "]")
    t, _, n = path.partition("/")
    return t.strip("'\""), n.strip("'\"")


def opath(t, n):
    q = (lambda s: '"%s"' % s if " " in s else s)
    return "%s/%s" % (q(t), q(n))


def find(m, t, n):
    tb = m["tables"].get(t)
    if not tb:
        return None, None
    for kind in ("measures", "columns"):
        if n in tb.get(kind, {}):
            return kind, tb[kind][n]
    return None, None


def err(msg, code=1):
    sys.stderr.write("Error: %s\n" % msg)
    return code


def out(obj):
    sys.stdout.write(json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
    return 0


def parse(argv):
    g = {"model": None, "fmt": "text", "flags": set(), "props": [], "pos": [],
         "type": None, "q": None, "i": None}
    i = 0
    while i < len(argv):
        a = argv[i]
        nxt = argv[i + 1] if i + 1 < len(argv) else None
        if a in ("-m", "--model"):
            g["model"] = nxt; i += 2; continue
        if a == "--output-format":
            g["fmt"] = nxt; i += 2; continue
        if a in ("-p", "--property"):
            g["props"].append(nxt); i += 2; continue
        if a in ("-t", "--type"):
            g["type"] = nxt; i += 2; continue
        if a in ("-q", "--query"):
            g["q"] = nxt; i += 2; continue
        if a in ("-i", "--input"):
            g["i"] = nxt; i += 2; continue
        if a.startswith("--"):
            g["flags"].add(a); i += 1; continue
        g["pos"].append(a); i += 1
    return g


def errors_of(m, cfg):
    found = []
    for t, tb in m["tables"].items():
        for n, p in tb.get("measures", {}).items():
            if "INVALID" in (p.get("expression") or ""):
                found.append({"severity": "error", "source": "validate", "code": "DAX0001",
                              "message": "Ungültiger Ausdruck in %s" % n, "object": n,
                              "objectType": "Measure", "objectPath": opath(t, n),
                              "fixable": False})
    for k in range(int(cfg.get("preexistingErrors") or 0)):
        found.append({"severity": "error", "source": "validate", "code": "TE0012",
                      "message": "Altlast %d" % k, "object": "X", "objectType": "Column",
                      "objectPath": "Alt/X%d" % k, "fixable": False})
    if cfg.get("validate") == "errorWhenChanged" and m.get("changes", 0) > 0:
        found.append({"severity": "error", "source": "validate", "code": "TE9999",
                      "message": "Simulierter Fehler nach Änderung", "object": "Model",
                      "objectType": "Model", "fixable": False})
    return found


def main(argv) -> int:
    cfg = config()
    if cfg.get("log"):
        with open(cfg["log"], "a", encoding="utf-8") as fh:
            fh.write(json.dumps({"argv": argv}, ensure_ascii=False) + "\n")
    if cfg.get("expired"):
        sys.stderr.write(EXPIRED)
        return 1
    if cfg.get("banner"):
        sys.stderr.write("Preview build: expires on 2026-10-31.\n")
    if argv[:1] == ["--version"]:
        sys.stdout.write("te %s\n" % cfg.get("version", "0.9.3-preview+fake"))
        return 0
    if not argv:
        return err("no command")
    cmd, rest = argv[0], argv[1:]
    if "--help" in rest:
        if cfg.get("dialect") == "qi":
            sys.stdout.write("Usage: te set <path> -q, --query <prop> -i, --input <value> --save\n")
        else:
            sys.stdout.write("Usage: te set <path> -p, --property <Name=Value> --save\n")
        return 0
    g = parse(rest)
    if not g["model"]:
        return err("no model (-m)")
    m = load(g["model"])
    if m is None:
        return err("model not found: %s" % g["model"])
    persist = "--save" in g["flags"]

    if cmd in ("ls", "list"):
        kinds = {"measure": ["measures"], "column": ["columns"]}.get(g["type"] or "",
                                                                     ["measures", "columns"])
        items = []
        for t, tb in m["tables"].items():
            for kind in kinds:
                for n, p in tb.get(kind, {}).items():
                    items.append({"objectPath": opath(t, n),
                                  "type": "Measure" if kind == "measures" else "DataColumn",
                                  "properties": dict(p, name=n)})
        return out(items)

    if cmd == "get":
        t, n = split(g["pos"][0])
        kind, p = find(m, t, n)
        if p is None:
            return err("Object '%s' not found." % g["pos"][0])
        prop = (g["props"][0] if g["props"] else g["q"])
        if prop:
            return out(p.get(prop))
        return out({"objectPath": opath(t, n),
                    "type": "Measure" if kind == "measures" else "DataColumn",
                    "properties": p})

    def assignments():
        if g["props"]:
            return dict(a.split("=", 1) for a in g["props"])
        if g["q"]:
            return {g["q"]: g["i"] or ""}
        return {}

    if cmd == "add":
        t, n = split(g["pos"][0])
        if t not in m["tables"]:
            return err("Table '%s' not found." % t)
        if find(m, t, n)[1] is not None:
            if "--if-not-exists" in g["flags"]:
                sys.stdout.write("Object '%s/%s' already exists, skipped.\n" % (t, n))
                return 0
            return err("Object '%s/%s' already exists." % (t, n))
        props = assignments()
        if g["i"] is not None and not g["props"] and g["q"] is None:
            props = {"expression": g["i"]}
        props = {k[0].lower() + k[1:]: v for k, v in props.items()}
        if "BROKEN" in props.get("expression", ""):
            return err("Save refused: the change introduces new DAX errors in %s/%s." % (t, n))
        if not persist:
            sys.stdout.write("Dry run - nothing saved. Add --save to persist.\n")
            return 0
        m["tables"][t].setdefault("measures", {})[n] = props
        save(g["model"], m)
        return out({"changes": [{"objectPath": opath(t, n), "changeKind": "created"}]})

    if cmd == "set":
        t, n = split(g["pos"][0])
        kind, p = find(m, t, n)
        if p is None:
            return err("Object '%s' not found." % g["pos"][0])
        props = {k[0].lower() + k[1:]: v for k, v in assignments().items()}
        if not props:
            return err("nothing to set")
        if "BROKEN" in props.get("expression", ""):
            return err("Save refused: the change introduces new DAX errors in %s/%s." % (t, n))
        if not persist:
            sys.stdout.write("Dry run - nothing saved. Add --save to persist.\n")
            return 0
        p.update(props)
        save(g["model"], m)
        return out({"changes": [{"objectPath": opath(t, n), "changeKind": "modified"}]})

    if cmd in ("mv", "move"):
        (t, n), (t2, n2) = split(g["pos"][0]), split(g["pos"][1])
        kind, p = find(m, t, n)
        if p is None:
            return err("Object '%s' not found." % g["pos"][0])
        if find(m, t2, n2)[1] is not None:
            return err("Destination '%s' already exists." % g["pos"][1])
        if not persist:
            sys.stdout.write("Dry run - nothing saved. Add --save to persist.\n")
            return 0
        del m["tables"][t][kind][n]
        m["tables"][t2].setdefault(kind, {})[n2] = p
        for tb in m["tables"].values():
            for q in tb.get("measures", {}).values():
                if q.get("expression"):
                    q["expression"] = q["expression"].replace("[%s]" % n, "[%s]" % n2)
        save(g["model"], m)
        return out({"changes": [{"objectPath": opath(t2, n2), "changeKind": "moved",
                                 "movedFromObjectPath": opath(t, n)}]})

    if cmd == "validate":
        found = errors_of(m, cfg)
        out({"command": "validate", "durationMs": 5,
             "summary": {"errors": len(found), "warnings": 0, "info": 0, "total": len(found)},
             "findings": found, "valid": not found})
        return 1 if found else 0

    return err("unknown command '%s'" % cmd)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
