#!/usr/bin/env pythonw
"""mk_launch.pyw · Knopf „Externe Tools → MockupKitchen live" in Power BI Desktop.

Desktop startet (MockupKitchen.pbitool.json, angelegt von `mk-live register-tool`):

    pythonw.exe mk_launch.pyw --server "localhost:51234" --database "<Modell-ID>"

1. Desktop-PID: die Elternprozesse hinauf bis pbidesktop.exe. Gegenprobe über den Port aus
   --server: msmdsrv.exe, das auf dem Port lauscht, ist ein Kind genau dieser Instanz.
2. Datei der Instanz: `pbir desktop list --json --pid <pid>`, sonst Bridge-CLI `status`.
3. Nur PBIP mit PBIR-Bericht. Sonst ein Hinweisfenster „Als PBIP mit PBIR speichern“.
4. `mk-live start <Projekt> --pin-pid <pid>`: doctor, Runner losgelöst vom Desktop-
   Prozessbaum, desktop-session.json, Kitchen mit ?live=1&project=<Name>.

Protokoll: %LOCALAPPDATA%\\MockupKitchen\\launch.log (bzw. $MK_HOME). Blockiert Desktop nie:
Desktop wartet nicht auf externe Werkzeuge, Hinweise sind eigene Fenster ohne Besitzer, jeder
Fehler landet im Protokoll statt in einer Ausnahme.

Tests: MK_LAUNCH_PID (statt der Elternsuche), MK_LAUNCH_NO_DIALOG=1 (nur Protokoll),
--dry-run (nichts starten, Ergebnis als JSON auf stdout bzw. im Protokoll).
"""
from __future__ import annotations

import argparse
import datetime as _dt
import json
import os
import re
import sys
import traceback
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import mk_live as MK  # noqa: E402
import live_runner as LR  # noqa: E402
sys.path.pop(0)

TITLE = "MockupKitchen live"


def log(msg: str) -> None:
    try:
        path = MK.home() / "launch.log"
        path.parent.mkdir(parents=True, exist_ok=True)
        if path.is_file() and path.stat().st_size > 1_000_000:
            path.replace(path.with_suffix(".log.1"))
        with open(path, "a", encoding="utf-8") as f:
            f.write("%s %s\n" % (_dt.datetime.now().isoformat(timespec="seconds"), msg))
    except OSError:
        pass


def notify(text: str) -> None:
    """Hinweisfenster ohne Besitzer (blockiert Desktop nicht), sonst nur Protokoll."""
    log("Hinweis: %s" % text)
    if os.environ.get("MK_LAUNCH_NO_DIALOG") or os.name != "nt":
        MK.say(text)
        return
    try:
        import ctypes
        # MB_OK | MB_ICONINFORMATION | MB_SETFOREGROUND | MB_TOPMOST
        ctypes.windll.user32.MessageBoxW(None, text, TITLE, 0x40 | 0x10000 | 0x40000)
    except Exception:                            # noqa: BLE001
        pass


def port_from_server(server) -> int | None:
    m = re.search(r":(\d{2,5})\b", str(server or ""))
    return int(m.group(1)) if m else None


def desktop_from_parents():
    """pid des nächsten pbidesktop.exe unter den Elternprozessen."""
    try:
        import psutil
        for p in psutil.Process(os.getpid()).parents():
            try:
                if p.name().lower() == MK.DESKTOP_IMAGE:
                    return p.pid
            except Exception:                    # noqa: BLE001
                continue
    except Exception as e:                       # noqa: BLE001
        log("Elternprozesse nicht lesbar: %s" % e)
    return None


def desktop_from_port(port):
    """pid von pbidesktop.exe, dessen msmdsrv.exe auf `port` lauscht."""
    if not port:
        return None
    try:
        import psutil
        for c in psutil.net_connections(kind="tcp"):
            if c.laddr and c.laddr.port == port and c.status == psutil.CONN_LISTEN and c.pid:
                proc = psutil.Process(c.pid)
                parent = proc.parent()
                if parent and parent.name().lower() == MK.DESKTOP_IMAGE:
                    return parent.pid
                if proc.name().lower() == MK.DESKTOP_IMAGE:
                    return proc.pid
    except Exception as e:                       # noqa: BLE001 - Zugriff verweigert u. ä.
        log("Port %s nicht zuordenbar: %s" % (port, e))
    return None


def find_desktop_pid(server):
    env = os.environ.get("MK_LAUNCH_PID")
    if env:
        return int(env), "MK_LAUNCH_PID"
    by_parent = desktop_from_parents()
    by_port = desktop_from_port(port_from_server(server))
    if by_parent and by_port and by_parent != by_port:
        log("Elternprozess pid %s, Port gehört zu pid %s: nehme den Elternprozess"
            % (by_parent, by_port))
    if by_parent:
        return by_parent, "Elternprozess" + (" (Port bestätigt)" if by_port == by_parent
                                              else "")
    if by_port:
        return by_port, "Port %s" % port_from_server(server)
    return None, "nicht gefunden"


def current_file(pid):
    """currentFilePath der Instanz pid: pbir desktop list, sonst Bridge-CLI status."""
    spec, argv = MK.tool_cmd("MK_PBIR", "pbir")
    if argv:
        rc, out, err = LR.run(argv + ["-q", "desktop", "list", "--pid", str(pid), "--json"],
                              timeout=60)
        data = LR.parse_json_output(out)
        for i in (data or {}).get("instances") or []:
            if str(i.get("pid")) == str(pid) and i.get("currentFilePath"):
                return i["currentFilePath"], "pbir desktop list"
        log("pbir desktop list: %s" % LR.short(err or out, 300))
    bridge = LR.Bridge(os.environ.get("MK_BRIDGE_CMD") or "powerbi-desktop")
    if bridge.argv:
        rc, data, _ = bridge("status", "--pid", str(pid), "--wait-seconds", "5", timeout=60)
        for i in (data or {}).get("instances") or []:
            if str(i.get("pid")) == str(pid) and i.get("currentFilePath"):
                return i["currentFilePath"], "Bridge-CLI"
        log("Bridge-CLI status: %s" % LR.short(json.dumps(data, ensure_ascii=False), 300))
    return None, "nicht ermittelt"


def pbip_project(path):
    """Projektordner, wenn path eine .pbip mit PBIR-Bericht ist, sonst None."""
    p = Path(str(path or ""))
    if p.suffix.lower() != ".pbip" or not p.is_file():
        return None
    if not (p.with_name(p.stem + ".Report") / "definition").is_dir():
        return None
    return p.parent


def run(argv=None) -> dict:
    ap = argparse.ArgumentParser(prog="mk_launch")
    ap.add_argument("--server", default=None)
    ap.add_argument("--database", default=None)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--no-browser", action="store_true")
    args, rest = ap.parse_known_args(argv)
    log("Start aus Desktop: server=%s database=%s %s" % (args.server, args.database,
                                                         " ".join(rest)))
    # Store-Desktop: im Paketkontext kann dieses Protokoll im Paketordner landen (mk_live.package_identity)
    log("Paketkontext: %s" % (MK.package_identity() or "keiner"))
    pid, how = find_desktop_pid(args.server)
    if not pid:
        notify("Power BI Desktop nicht gefunden. Bitte MockupKitchen live über Externe Tools "
               "aus dem Desktop-Fenster mit dem Projekt starten.")
        return {"ok": False, "reason": "kein Desktop"}
    log("Desktop pid %s (%s)" % (pid, how))
    path, src = current_file(pid)
    log("Datei: %s (%s)" % (path, src))
    if not path:
        notify("Die geöffnete Datei von Desktop (pid %s) ist nicht lesbar. Bridge einschalten: "
               "%s, dann Desktop neu starten." % (pid, MK.BRIDGE_SETTING))
        return {"ok": False, "reason": "Datei unbekannt", "pid": pid}
    project = pbip_project(path)
    if project is None:
        notify("MockupKitchen live braucht ein Power-BI-Projekt: Als PBIP mit PBIR speichern "
               "(Datei → Speichern unter → Power BI-Projekt, Berichtsformat PBIR). Offen ist: %s"
               % Path(str(path)).name)
        return {"ok": False, "reason": "kein PBIP mit PBIR", "pid": pid, "file": str(path)}
    result = {"ok": True, "pid": pid, "how": how, "file": str(path), "project": str(project)}
    if args.dry_run:
        log("dry-run: %s" % json.dumps(result, ensure_ascii=False))
        return result
    rc = MK.start_project(project, pin_pid=pid, no_browser=args.no_browser,
                          launcher="Externe Tools (pid %s)" % pid)
    result["rc"] = rc
    log("mk-live start: Exit %s" % rc)
    if rc != 0:
        doctor = LR.read_json(LR.Project(project).doctor, retries=1) or {}
        reds = [c for c in doctor.get("checks") or [] if c.get("state") == "red"]
        notify("Live-Helfer nicht gestartet. %s Details: %s" % (
            " ".join("%s: %s → %s" % (c.get("label"), c.get("detail"), c.get("fix") or "")
                     for c in reds[:3]) or "Siehe Protokoll.",
            MK.home() / "launch.log"))
        result["ok"] = False
    return result


def main(argv=None) -> int:
    try:
        res = run(argv)
    except Exception:                            # noqa: BLE001 - Desktop nie stören
        log(traceback.format_exc())
        notify("MockupKitchen live ist beim Start gestolpert. Protokoll: %s"
               % (MK.home() / "launch.log"))
        return 1
    if "--dry-run" in (argv if argv is not None else sys.argv[1:]):
        MK.say(json.dumps(res, ensure_ascii=False))
    return 0 if res.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
