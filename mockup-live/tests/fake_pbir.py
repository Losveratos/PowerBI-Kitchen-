#!/usr/bin/env python3
"""pbir mit Attrappe für `pbir desktop ...` (Tests von live_runner.py --desktop-cli pbir).

Alles außer `desktop` geht unverändert an das echte pbir ($FAKE_PBIR_REAL, sonst pbir im
PATH). `desktop list/reload/screenshot` beantwortet diese Datei aus $FAKE_BRIDGE_CONFIG
(gleicher Zustand wie fake_bridge.py) und schreibt ins selbe Log ["pbir-desktop", …].

JSON von `pbir desktop list --json` wie pbir 0.9.32 (Instanzen mit pid,
currentFilePath, hasUnsavedChanges, reportDir, status, pages[{name, displayName}],
dazu connectionErrors). `reload` hat kein --json (nur Exit-Code), `screenshot -o` legt
das PNG an.

$FAKE_PBIR_BATCH_CUSTOM=empty|fail: `pbir batch run` scheitert an Schritten auf Custom
Visuals (Demo B1, siehe batch_custom). $FAKE_PBIR_LOG: jede Weitergabe an das echte pbir
und jeder Batch als JSON-Zeile.
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import fake_bridge as FB  # noqa: E402


def opt(args, *names, default=None):
    for n in names:
        if n in args:
            i = args.index(n)
            if i + 1 < len(args):
                return args[i + 1]
    return default


def desktop(args) -> int:
    cfg = FB.config()
    FB.log_call(cfg, ["pbir-desktop"] + list(args))
    verb, rest = (args[0] if args else ""), args[1:]
    connected = FB.is_connected(cfg)
    current = cfg.get("currentFilePath") or ""
    rdir = FB.report_dir(current)
    pid = int(cfg.get("pid") or 4242)
    if verb in ("list", "status", "reload", "refresh", "screenshot") and FB.take_busy(cfg):
        print("Error: All pipe instances are busy.", file=sys.stderr)
        return 1
    if verb in ("list", "status"):
        cfg = FB.count_status(cfg)
        inst = []
        if connected:
            pages = [{"name": pg["id"], "displayName": pg["displayName"]}
                     for pg in (FB.read_pages(rdir) if rdir else [])]
            inst.append({"pid": pid, "currentFilePath": current,
                         "hasUnsavedChanges": FB.unsaved(cfg),
                         "reportDir": str(rdir) if rdir else None, "status": None,
                         "pages": pages})
        for e in FB.extra_instances(cfg):
            inst.append({"pid": e["pid"], "currentFilePath": e["currentFilePath"],
                         "hasUnsavedChanges": e["hasUnsavedChanges"],
                         "reportDir": e["reportDir"], "status": None,
                         "pages": [{"name": pg["id"], "displayName": pg["displayName"]}
                                   for pg in e["pages"]]})
        print(json.dumps({"status": "ready" if inst else "not_connected", "instances": inst,
                          "connectionErrors": []}, indent=2))
        return 0
    if not connected:
        print("Error: No Power BI Desktop instance is connected", file=sys.stderr)
        return 1
    if verb in ("reload", "refresh"):
        if cfg.get("reload") == "fail":
            print("Error: reload failed", file=sys.stderr)
            return 1
        FB.mark_reloaded(cfg)
        print("✓ Reloaded%s" % (" (model)" if ("--model" in rest or "-m" in rest) else ""))
        return 0
    if verb == "screenshot":
        if cfg.get("shots") == "fail":
            print("Error: capture failed", file=sys.stderr)
            return 1
        target = opt(rest, "-o", "--output")
        page = rest[0] if rest and not rest[0].startswith("-") else ""
        name = page.split("/")[-1][:-len(".Page")] if page.endswith(".Page") else None
        pages = {pg["displayName"]: pg for pg in (FB.read_pages(rdir) if rdir else [])}
        pg = pages.get(name) if name else None
        if not target or pg is None:
            print("Error: page not found: %s" % page, file=sys.stderr)
            return 1
        scale = float(opt(rest, "--scale", default="1"))
        w, h = pg["_size"]
        Path(target).parent.mkdir(parents=True, exist_ok=True)
        Path(target).write_bytes(FB.png(max(1, int(w * scale)), max(1, int(h * scale))))
        print(json.dumps({"status": "ok", "page": pg["id"], "path": str(Path(target).resolve())}))
        return 0
    print("Error: unknown desktop command %s" % verb, file=sys.stderr)
    return 2


NATIVE_HINT = "Unknown component"


def visual_type(root: Path, select: str):
    """Typ des Visuals hinter "<Seite>.Page/<Visual>.Visual" (Seite per displayName)."""
    page, _, vis = select.partition(".Page/")
    vis = vis[:-len(".Visual")] if vis.endswith(".Visual") else vis
    for pj in (root / "definition" / "pages").glob("*/page.json"):
        try:
            if json.loads(pj.read_text(encoding="utf-8-sig")).get("displayName") != page:
                continue
            vj = json.loads((pj.parent / "visuals" / vis / "visual.json")
                            .read_text(encoding="utf-8-sig"))
        except (OSError, ValueError):
            return None
        return (vj.get("visual") or {}).get("visualType")
    return None


def batch_custom(argv, mode: str) -> int:
    """Demo B1 nachgestellt: `pbir batch run` scheitert an jedem Schritt auf einem Custom
    Visual (GUID-Typ) mit status error, target_count 1 und result {} (mode "empty", wie in
    der Demo gemeldet) bzw. mit failures[].message „Unknown component: …" (mode "fail", wie
    pbir 0.9.32 bei `set`). Die übrigen Schritte laufen über das echte pbir. Jeder Aufruf
    landet in $FAKE_PBIR_LOG als {"batch": [[op, Typ, Ergebnis], …]}."""
    rest = [a for a in argv if a not in ("-q", "--quiet")]
    src = Path(rest[2])
    root = None
    if "--root" in rest:
        root = Path(rest[rest.index("--root") + 1])
    batch = json.loads(src.read_text(encoding="utf-8-sig"))
    root = root or Path(batch.get("root") or ".")
    steps = batch.get("steps") or []
    fake, keep = {}, []
    for st in steps:
        t = visual_type(root, st.get("select") or "")
        if t and len(t) > 32 and all(c in "0123456789ABCDEFabcdef" for c in t[-32:]):
            entry = {"id": st.get("id"), "op": st.get("op"), "status": "error",
                     "target_count": 1, "timing_ms": 5, "result": {}}
            if mode == "fail" and st.get("op") == "set":
                comp = next(iter(st.get("set") or {"title.text": ""})).split(".")[0]
                entry["failures"] = [{"code": "target_execution_failed",
                                      "message": "%s: %s" % (NATIVE_HINT, comp),
                                      "step_id": st.get("id")}]
            fake[st.get("id")] = (entry, t)
        else:
            keep.append(st)
    results = {}
    rc = 0
    real_out = {}
    if keep:
        tmp = src.with_name(src.stem + ".native.json")
        tmp.write_text(json.dumps(dict(batch, steps=keep), ensure_ascii=True),
                       encoding="ascii")
        real = os.environ.get("FAKE_PBIR_REAL") or shutil.which("pbir")
        cp = subprocess.run([real] + [a if a != rest[2] else str(tmp) for a in argv],
                            capture_output=True, text=True, encoding="utf-8", errors="replace",
                            stdin=subprocess.DEVNULL)
        rc = cp.returncode
        start = cp.stdout.find("{")
        try:
            real_out = json.loads(cp.stdout[start:]) if start >= 0 else {}
        except ValueError:
            real_out = {}
        for s in real_out.get("steps") or []:
            results[s.get("id")] = s
        try:
            tmp.unlink()
        except OSError:
            pass
    out_steps, log = [], []
    for st in steps:
        sid = st.get("id")
        if sid in fake:
            out_steps.append(fake[sid][0])
            log.append([st.get("op"), fake[sid][1], "error"])
        elif sid in results:
            out_steps.append(results[sid])
            log.append([st.get("op"), "native", results[sid].get("status")])
    if os.environ.get("FAKE_PBIR_LOG"):
        with open(os.environ["FAKE_PBIR_LOG"], "a", encoding="utf-8") as f:
            f.write(json.dumps({"batch": log}) + "\n")
    failures = [f for s in out_steps for f in (s.get("failures") or [])]
    doc = dict(real_out or {"version": 2, "name": batch.get("name"), "dry_run": False},
               steps=out_steps, failures=failures,
               ok=not any(s.get("status") != "ok" for s in out_steps))
    print(json.dumps(doc, indent=2))
    return 1 if (fake or rc) else 0


def from_json_drop(argv, rest, drop: str):
    """Demo B4 nachgestellt: `add visual --from-json` meldet Erfolg, legt aber das Visual
    `<name>` nicht an. "<name>:once" nur beim ersten Mal (Marker-Datei neben der Konfiguration
    der Bridge-Attrappe), sonst jedes Mal."""
    name, _, how = drop.partition(":")
    marker = Path(os.environ.get("FAKE_BRIDGE_CONFIG") or ".").with_name("fromjson-drop.done")
    if how == "once" and marker.exists():
        return argv
    src = rest[rest.index("--from-json") + 1]
    specs = json.loads(Path(src).read_text(encoding="utf-8-sig"))
    keep = [s for s in specs if s.get("name") != name]
    if len(keep) == len(specs):
        return argv
    if how == "once":
        marker.write_text("1", encoding="utf-8")
    if not keep:                              # nichts übrig: Erfolg ohne Visual
        print("✓ Created 0 visuals")
        raise SystemExit(0)
    tmp = Path(src).with_name(Path(src).stem + ".drop.json")
    tmp.write_text(json.dumps(keep, ensure_ascii=True), encoding="ascii")
    return [a if a != src else str(tmp) for a in argv]


def main(argv) -> int:
    rest = [a for a in argv if a not in ("-q", "--quiet")]
    if rest and rest[0] == "desktop":
        return desktop(rest[1:])
    mode = os.environ.get("FAKE_PBIR_BATCH_CUSTOM")
    if mode and rest[:2] == ["batch", "run"] and len(rest) > 2:
        return batch_custom(argv, mode)
    drop = os.environ.get("FAKE_PBIR_FROMJSON_DROP")
    if drop and rest[:2] == ["add", "visual"] and "--from-json" in rest:
        argv = from_json_drop(argv, rest, drop)
    if os.environ.get("FAKE_PBIR_LOG") and rest:
        with open(os.environ["FAKE_PBIR_LOG"], "a", encoding="utf-8") as f:
            f.write(json.dumps({"argv": rest[:3]}) + "\n")
    real = os.environ.get("FAKE_PBIR_REAL") or shutil.which("pbir")
    if not real:
        print("pbir nicht gefunden", file=sys.stderr)
        return 127
    cp = subprocess.run([real] + list(argv), stdin=subprocess.DEVNULL)
    return cp.returncode


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
