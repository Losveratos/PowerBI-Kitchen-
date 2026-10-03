#!/usr/bin/env python3
"""Attrappe der Bridge-CLI `powerbi-desktop` (npm @microsoft/powerbi-desktop-bridge-cli).

Die JSON-Formen folgen dem Quelltext der echten CLI (dist/index.js, 1.0.0):

  status            {"status": "ready", "instances": [{"pid", "bridgeStatus":
                     "connected", "currentFilePath", "hasUnsavedChanges",
                     "reportDir", "pages": [{"id", "displayName", "pagePath"}]}]}
                    bzw. {"status": "not_connected", "instances": []}
  manifest          {"status": "ok", "pid", "manifest": {"methods": [{"name"}]}}
  reload            {"status": "ok", "pid", "result": {"success": true}}
  screenshot <id>   {"status": "ok", "pid", "pageId", "pageDisplayName", "mimeType",
                     "outputPath"}   (--output <png>, --scale)
  screenshot-all    {"status": "ok"|"partial", "pid", "reportDir",
                     "screenshots": [{"pageId", "pageDisplayName", "outputPath"}],
                     "failures": []}
  Fehler            {"status": "error", "error": {"message", "code", ...}}, Exit 1

Steuerung ueber eine JSON-Datei in $FAKE_BRIDGE_CONFIG:

  {"mode": "connected" | "not_connected",
   "pid": 4242,
   "currentFilePath": "C:/.../X.pbip",
   "hasUnsavedChanges": false,
   "reload": "ok" | "fail",
   "shots": "ok" | "fail",
   "open": "ok" | "hang" | (fehlt: "open is not simulated"),
   "openDelay": 0.3,                        # Sekunden, bis Desktop nach open bereit ist
   "reloadMarksUnsaved": true,              # wie echtes Desktop: nach reload „ungespeichert"
   "unsavedUntil": 1767000000.0,            # ab diesem Zeitpunkt gespeichert (Nutzer speichert)
   "busy": 2,                               # die nächsten n Aufrufe: Pipe belegt (Fehler busy)
   "extraInstances": [{"pid": 4343, "currentFilePath": "…"}],   # weitere Fenster
   "extraFromStatus": 2,                    # … erst ab dem 2. Status-Aufruf sichtbar
   "unsavedFromStatus": 2,                  # ab dem 2. Status-Aufruf „ungespeichert"
                                            # (jemand arbeitet während des Deploys in Desktop)
   "log": "C:/.../bridge-calls.jsonl"}      # jeder Aufruf eine Zeile

`open` (ok) schreibt die Konfiguration um: verbunden, currentFilePath = Bericht, neue
pid, bereit ab readyAt. "hang" bildet den Anmeldedialog nach: Desktop startet, meldet
sich aber nie mit Datei. Schließen simuliert fake_close.py (Aufruf: <pid>), die
Desktop-Befehle von pbir fake_pbir.py.
"""
from __future__ import annotations

import json
import os
import re
import struct
import sys
import time
import zlib
from pathlib import Path

METHODS = ["application.state.get/v1", "file.reload/v1", "report.snapshot.capture/v1",
           "bridge.manifest"]


def config() -> dict:
    path = os.environ.get("FAKE_BRIDGE_CONFIG")
    if path and Path(path).is_file():
        return json.loads(Path(path).read_text(encoding="utf-8"))
    return {"mode": "not_connected"}


def emit(obj, code: int = 0) -> int:
    sys.stdout.write(json.dumps(obj, indent=2) + "\n")
    sys.stdout.flush()
    return code


def error(message: str, code: str, **details) -> int:
    return emit({"status": "error", "error": {"message": message, "code": code,
                                              "retryable": False, "details": details}}, 1)


def opt(args, name, default=None):
    if name in args:
        i = args.index(name)
        if i + 1 < len(args):
            return args[i + 1]
    return default


def report_dir(current: str):
    """Wie resolveReportDir() der echten CLI: .pbip -> <Name>.Report daneben."""
    if not current:
        return None
    p = Path(current)
    if p.is_dir() and p.name.lower().endswith(".report"):
        return p
    if p.suffix.lower() == ".pbip":
        cand = p.with_name(p.stem + ".Report")
        return cand if cand.exists() else None
    return None


def read_pages(rdir: Path) -> list:
    root = rdir / "definition" / "pages"
    meta = json.loads((root / "pages.json").read_text(encoding="utf-8"))
    out = []
    for pid in meta.get("pageOrder") or []:
        page_path = root / pid / "page.json"
        disp = pid
        if page_path.exists():
            pj = json.loads(page_path.read_text(encoding="utf-8"))
            disp = pj.get("displayName") or pj.get("name") or pid
        out.append({"id": pid, "displayName": disp, "pagePath": str(page_path),
                    "_size": _size(page_path)})
    return out


def _size(page_path: Path):
    try:
        pj = json.loads(page_path.read_text(encoding="utf-8"))
        return int(pj.get("width") or 1280), int(pj.get("height") or 720)
    except (OSError, ValueError):
        return 1280, 720


def safe_file_name(name: str) -> str:
    cleaned = re.sub(r'[<>:"/\\|?*\x00-\x1F]', "_", str(name or "page"))
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    cleaned = re.sub(r"[. ]+$", "", cleaned)
    return cleaned or "page"


def png(width: int, height: int, shade: int = 235) -> bytes:
    """Kleines, gueltiges Graustufen-PNG in Seitengroesse."""
    def chunk(kind: bytes, data: bytes) -> bytes:
        return (struct.pack(">I", len(data)) + kind + data
                + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF))
    row = b"\x00" + bytes([shade]) * width
    raw = zlib.compress(row * height, 6)
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 0, 0, 0, 0)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", raw) + chunk(b"IEND", b"")


def save_config(cfg: dict) -> None:
    path = os.environ.get("FAKE_BRIDGE_CONFIG")
    if path:
        tmp = Path(path + ".tmp")
        tmp.write_text(json.dumps(cfg), encoding="utf-8")
        os.replace(tmp, path)


def log_call(cfg: dict, argv, **extra) -> None:
    if cfg.get("log"):
        entry = {"argv": argv}
        entry.update(extra)
        with open(cfg["log"], "a", encoding="utf-8") as f:
            f.write(json.dumps(entry) + "\n")


def is_connected(cfg: dict) -> bool:
    if cfg.get("mode") != "connected":
        return False
    return not cfg.get("readyAt") or time.time() >= float(cfg["readyAt"])


def unsaved(cfg: dict) -> bool:
    """hasUnsavedChanges; „unsavedUntil" bildet das Speichern durch den Nutzer nach."""
    since = int(cfg.get("unsavedFromStatus") or 0)
    if since and int(cfg.get("statusCalls") or 0) >= since:
        return True
    until = cfg.get("unsavedUntil")
    if until is not None and time.time() >= float(until):
        cfg = dict(cfg, hasUnsavedChanges=False)
        cfg.pop("unsavedUntil", None)
        save_config(cfg)
        return False
    return bool(cfg.get("hasUnsavedChanges"))


def take_busy(cfg: dict) -> bool:
    """True, solange „busy" > 0 (und zählt herunter): Pipe belegt."""
    n = int(cfg.get("busy") or 0)
    if n <= 0:
        return False
    save_config(dict(cfg, busy=n - 1))
    return True


def mark_reloaded(cfg: dict) -> None:
    if cfg.get("reloadMarksUnsaved"):
        save_config(dict(cfg, hasUnsavedChanges=True, reloads=int(cfg.get("reloads") or 0) + 1))


def count_status(cfg: dict) -> dict:
    """Zählt Status-Aufrufe (bridge status, pbir desktop list) für „extraFromStatus"."""
    if cfg.get("extraFromStatus") or cfg.get("unsavedFromStatus"):
        cfg = dict(cfg, statusCalls=int(cfg.get("statusCalls") or 0) + 1)
        save_config(cfg)
    return cfg


def extra_instances(cfg: dict) -> list:
    """Weitere Desktop-Fenster. Mit "extraFromStatus": n erscheinen sie erst ab dem n-ten
    Status-Aufruf (zweites Fenster taucht mitten im Deploy auf, Safety 3)."""
    out = []
    since = int(cfg.get("extraFromStatus") or 0)
    if since and int(cfg.get("statusCalls") or 0) < since:
        return out
    for e in cfg.get("extraInstances") or []:
        cur = e.get("currentFilePath") or ""
        rdir = report_dir(cur)
        out.append({"pid": int(e.get("pid") or 0), "currentFilePath": cur,
                    "hasUnsavedChanges": bool(e.get("hasUnsavedChanges")),
                    "reportDir": str(rdir) if rdir else None,
                    "pages": [{k: v for k, v in pg.items() if not k.startswith("_")}
                              for pg in (read_pages(rdir) if rdir else [])]})
    return out


def do_open(cfg: dict, args, pid: int) -> int:
    how = cfg.get("open")
    if how not in ("ok", "hang"):
        return error("open is not simulated", "NOT_SUPPORTED")
    report = Path(args[0]).resolve() if args else None
    if report is None or not report.exists():
        return error("Report file not found", "REPORT_NOT_FOUND")
    cfg = dict(cfg)
    cfg["opened"] = int(cfg.get("opened") or 0) + 1
    if how == "ok":
        cfg.update({"mode": "connected", "pid": pid + 1, "currentFilePath": str(report),
                    "hasUnsavedChanges": False,
                    "readyAt": time.time() + float(cfg.get("openDelay", 0.3))})
    else:                                   # Anmeldedialog: Desktop meldet sich nie
        cfg.update({"mode": "not_connected"})
    save_config(cfg)
    return emit({"status": "launched", "launched": {
        "executablePath": os.environ.get("PBI_DESKTOP_PATH") or "PBIDesktop.exe",
        "reportPath": str(report), "launchedProcessId": 31337},
        "bridgeStatus": "not_connected", "pid": None, "diagnostics": [], "lastError": None})


def main(argv) -> int:
    cfg = config()
    extra = {}
    if argv and argv[0] == "open":
        extra["PBI_DESKTOP_PATH"] = os.environ.get("PBI_DESKTOP_PATH")
    log_call(cfg, argv, **extra)
    if not argv:
        return error("missing command", "USAGE")
    cmd, args = argv[0], argv[1:]
    pid = int(cfg.get("pid") or 4242)
    if cmd == "open":
        return do_open(cfg, args, pid)
    connected = is_connected(cfg)
    current = cfg.get("currentFilePath") or ""
    rdir = report_dir(current)
    if cmd in ("status", "manifest", "reload", "screenshot", "screenshot-all") and \
            take_busy(cfg):
        return error("All pipe instances are busy.", "PIPE_BUSY", retryable=True)

    if cmd == "status":
        cfg = count_status(cfg)
        extra = [dict(e, bridgeStatus="connected") for e in extra_instances(cfg)]
        if not connected:
            return emit({"status": "ready" if extra else "not_connected", "instances": extra})
        pages = [{k: v for k, v in pg.items() if not k.startswith("_")}
                 for pg in (read_pages(rdir) if rdir else [])]
        return emit({"status": "ready", "instances": [{
            "pid": pid, "bridgeStatus": "connected", "currentFilePath": current,
            "hasUnsavedChanges": unsaved(cfg),
            "reportDir": str(rdir) if rdir else None, "pages": pages}] + extra})

    if not connected:
        return error("No Power BI Desktop Bridge connection is available", "NO_BRIDGE",
                     pid=opt(args, "--pid"), lastError=None, diagnostics=[])

    if cmd == "manifest":
        return emit({"status": "ok", "pid": pid,
                     "manifest": {"methods": [{"name": m} for m in METHODS]}})

    if cmd == "reload":
        if cfg.get("reload") == "fail":
            return error("Reload failed in Desktop", "BRIDGE_ERROR")
        if not rdir:
            return error("reload requires the selected Desktop instance to have a "
                         "PBIP/PBIR current file.", "REPORT_DIR_REQUIRED",
                         currentFilePath=current)
        mark_reloaded(cfg)
        return emit({"status": "ok", "pid": pid, "result": {"success": True}})

    if cmd == "screenshot-all":
        if not rdir:
            return error("screenshot-all requires the selected Desktop instance to have "
                         "a PBIP/PBIR current file.", "REPORT_DIR_REQUIRED")
        scale = float(opt(args, "--scale", "2"))
        out = Path(opt(args, "--output-dir", "screenshots")).resolve()
        out.mkdir(parents=True, exist_ok=True)
        shots, failures = [], []
        for pg in read_pages(rdir):
            if cfg.get("shots") == "fail":
                failures.append({"pageId": pg["id"], "pageDisplayName": pg["displayName"],
                                 "error": {"message": "capture failed", "code": "X"}})
                continue
            w, h = pg["_size"]
            target = out / ("%s.png" % safe_file_name(pg["displayName"]))
            target.write_bytes(png(max(1, int(w * scale)), max(1, int(h * scale))))
            shots.append({"pageId": pg["id"], "pageDisplayName": pg["displayName"],
                          "outputPath": str(target)})
        if not shots and failures:
            return error("Failed to capture screenshots for all pages.",
                         "SCREENSHOT_ALL_FAILED", reportDir=str(rdir), failures=failures)
        return emit({"status": "partial" if failures else "ok", "pid": pid,
                     "reportDir": str(rdir), "screenshots": shots, "failures": failures},
                    1 if failures else 0)

    if cmd == "screenshot":
        # wie registerScreenshotCommand() der echten CLI: eine Seite, --output <png>
        page_id = args[0] if args and not args[0].startswith("--") else None
        pages = {pg["id"]: pg for pg in (read_pages(rdir) if rdir else [])}
        if cfg.get("shots") == "fail" or page_id not in pages:
            return error("capture failed", "BRIDGE_ERROR", pageId=page_id)
        pg = pages[page_id]
        scale = float(opt(args, "--scale", "2"))
        target = Path(opt(args, "--output", str(Path("screenshots") / (
            "%s.png" % safe_file_name(pg["displayName"]))))).resolve()
        target.parent.mkdir(parents=True, exist_ok=True)
        w, h = pg["_size"]
        target.write_bytes(png(max(1, int(w * scale)), max(1, int(h * scale))))
        return emit({"status": "ok", "pid": pid, "pageId": page_id,
                     "pageDisplayName": pg["displayName"], "mimeType": "image/png",
                     "outputPath": str(target)})

    return error("unknown command %s" % cmd, "USAGE")


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
