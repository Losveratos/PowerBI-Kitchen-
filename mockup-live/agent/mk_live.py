#!/usr/bin/env python3
"""mk_live.py · Live-Helfer `mk-live` für MockupKitchen live (Beta).

    mk-live setup                         einmal: Pillow und psutil, pbir, Bridge-CLI, te,
                                          Desktop-exe; Befehl mk-live einrichten
    mk-live doctor        "<Projekt>"     Ampel als Text und mockup/doctor.json
    mk-live start         "<Projekt>"     doctor, Runner losgelöst starten, Kitchen öffnen
                          [--open-kitchen URL] [--pin-pid PID] [--no-browser] [-- Runner-Optionen]
    mk-live stop          ["<Projekt>"]   Runner beenden (ohne Projekt: der einzige laufende)
    mk-live diag          "<Projekt>"     Diagnose-ZIP (Status, doctor, Protokoll; Pfade auf <du>
                          [--with-images]  gekürzt; Bilder und out/ nur mit --with-images)
    mk-live register-tool                 Knopf „Externe Tools → MockupKitchen live" in Desktop

Ohne eingerichteten Befehl: python mockup-live/mk_live.py <Befehl> (Dreizeiler, startet diese
Datei), python mockup-live/agent/mk_live.py <Befehl> bzw. mockup-live\\bin\\mk-live.cmd <Befehl>.

Umgebung (vor allem für Tests): MK_HOME (statt %LOCALAPPDATA%\\MockupKitchen), MK_PBIR,
MK_BRIDGE_CMD, MK_TE, MK_KITCHEN_URL, MK_NO_BROWSER=1, MK_TOOL_DIR, MK_SHIM_DIR,
MK_DOCTOR_SYSTEM (JSON mit {"processes": [{pid, name, cmdline}], "pipes": [...]} statt der
echten Prozess- und Pipe-Liste).

Grundsätze: Der Helfer beendet Desktop nie (das macht der Runner nur nach Bestätigung im
Kitchen), schreibt nur in mockup/ des Projekts und in seinen eigenen Ordner, startet je
Projektordner höchstens einen Runner.
"""
from __future__ import annotations

import argparse
import base64
import datetime as _dt
import json
import os
import platform
import re
import struct
import subprocess
import sys
import tempfile
import time
import urllib.parse
import webbrowser
import zipfile
import zlib
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
RUNNER = HERE / "live_runner.py"
LAUNCHER = HERE / "mk_launch.pyw"
BIN_CMD = HERE.parent / "bin" / "mk-live.cmd"

sys.path.insert(0, str(HERE))
import live_runner as LR  # noqa: E402
import model_ops as MO  # noqa: E402
import visuals_install as VI  # noqa: E402
sys.path.pop(0)

MK_LIVE_VERSION = "0.1.2"
# Getestete Werkzeugstände (doctor meldet Abweichungen gelb). Gepinnt ist, was auf dem
# Entwicklungsrechner installiert ist und mit dem die Beta lief (`powerbi-desktop --version`
# am 02.10.2026: 0.1.1). In TESTED steht nur, was tatsächlich gelaufen ist.
PINNED = {"pbir": "0.9.32", "powerbi-desktop-bridge-cli": "0.1.1"}
TESTED = {"pbir": ("0.9.32",), "powerbi-desktop-bridge-cli": ("0.1.1",)}
MIN_PYTHON = (3, 11)
MIN_COMPAT = 1600
TESTED_COMPAT = 1601             # höchster getestete compatibilityLevel (Testbed 1600/1601)
# visualContainer-Schemas, die pbir 0.9.32 lokal mitbringt; neuere prüft es über ein
# Rückfall-Schema („schema not available locally, fallback", Demo B8)
PBIR_VISUAL_SCHEMA_MAX = "2.9.0"
KITCHEN_URL = "https://datenwgknowledgekitchen.com/mockup-kitchen.html"
TOOL_DIR = (r"C:\Program Files (x86)\Common Files\Microsoft Shared\Power BI Desktop"
            r"\External Tools")
TOOL_FILE = "MockupKitchen.pbitool.json"
HEARTBEAT_FRESH_S = 15.0
DESKTOP_IMAGE = "pbidesktop.exe"
PIPE_PREFIX = "pbi-desktop-bridge-"
TE_URL = "https://tabulareditor.com/downloads"
BRIDGE_SETTING = ("Datei → Optionen und Einstellungen → Optionen → Sicherheit: „Zugriff externer "
                  "Tools über sichere lokale APIs“ einschalten")
DETACH_FLAGS = (getattr(subprocess, "DETACHED_PROCESS", 0x8)
                | getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0x200))
BREAKAWAY = getattr(subprocess, "CREATE_BREAKAWAY_FROM_JOB", 0x01000000)


# --------------------------------------------------------------------------- Kleinkram
def say(msg: str = "") -> None:
    """Ausgabe, wenn es eine Konsole gibt (unter pythonw ist sys.stdout None)."""
    if sys.stdout is None:
        return
    try:
        print(msg, flush=True)
    except (OSError, ValueError):
        pass


def home() -> Path:
    base = os.environ.get("MK_HOME")
    if base:
        return Path(base)
    la = os.environ.get("LOCALAPPDATA") or str(Path.home() / "AppData" / "Local")
    return Path(la) / "MockupKitchen"


def load_config() -> dict:
    data = LR.read_json(home() / "config.json", retries=1)
    return data if isinstance(data, dict) else {}


def save_config(cfg: dict) -> Path:
    path = home() / "config.json"
    LR.write_json_atomic(path, cfg)
    return path


def now_iso() -> str:
    return LR.now_iso()


def python_exe() -> str:
    """python.exe neben pythonw.exe (Runner-Ausgabe geht in eine Datei, Konsole egal)."""
    exe = Path(sys.executable)
    if exe.name.lower() == "pythonw.exe" and (exe.parent / "python.exe").is_file():
        return str(exe.parent / "python.exe")
    return str(exe)


def pythonw_exe() -> str:
    exe = Path(sys.executable)
    cand = exe.parent / "pythonw.exe"
    return str(cand) if cand.is_file() else str(exe)


def version_of(text: str):
    m = re.search(r"\d+\.\d+(?:\.\d+)?", text or "")
    return m.group(0) if m else None


def tool_cmd(env_key: str, default: str):
    spec = os.environ.get(env_key) or default
    return spec, LR.resolve_cmd(spec, default)


def run_version(argv, args=("--version",), timeout: int = 60):
    if not argv:
        return None, ""
    rc, out, err = LR.run(list(argv) + list(args), timeout=timeout)
    return rc, (out or "") + "\n" + (err or "")


# --------------------------------------------------------------------------- System
def system_view() -> dict:
    """Laufende pbidesktop.exe (pid, exe, cmdline) und Bridge-Pipes. Nur lesen. Für Tests
    über MK_DOCTOR_SYSTEM (JSON-Datei) ersetzbar."""
    fake = os.environ.get("MK_DOCTOR_SYSTEM")
    if fake:
        data = LR.read_json(Path(fake), retries=0) or {}
        return {"processes": list(data.get("processes") or []),
                "pipes": list(data.get("pipes") or []), "source": "MK_DOCTOR_SYSTEM"}
    procs, pipes = [], []
    try:
        import psutil
        for p in psutil.process_iter(["pid", "name", "exe", "cmdline", "create_time"]):
            if (p.info.get("name") or "").lower() == DESKTOP_IMAGE:
                procs.append({"pid": p.info["pid"], "name": p.info.get("name"),
                              "exe": p.info.get("exe"),
                              "cmdline": " ".join(p.info.get("cmdline") or []),
                              "started": p.info.get("create_time")})
    except Exception:                            # noqa: BLE001 - psutil fehlt: tasklist
        if os.name == "nt":
            rc, out, _ = LR.run(["tasklist", "/FI", "IMAGENAME eq PBIDesktop.exe", "/FO", "CSV",
                                 "/NH"], timeout=30)
            for line in out.splitlines():
                parts = [x.strip('"') for x in line.split('","')]
                if len(parts) >= 2 and parts[1].strip('"').isdigit():
                    procs.append({"pid": int(parts[1].strip('"')), "name": parts[0].strip('"'),
                                  "exe": None, "cmdline": ""})
    if os.name == "nt":
        try:
            pipes = [n for n in os.listdir("\\\\.\\pipe\\") if n.startswith(PIPE_PREFIX)]
        except OSError:
            pipes = []
    return {"processes": procs, "pipes": pipes, "source": "system"}


def detect_desktop_exe():
    """(Pfad, Quelle) von pbidesktop.exe: PBI_DESKTOP_PATH, Kommandozeile einer laufenden
    Instanz, App-Alias PBIDesktopStore.exe, Get-AppxPackage, klassische Installation."""
    env = os.environ.get("PBI_DESKTOP_PATH")
    if env and Path(env).exists():
        return env, "PBI_DESKTOP_PATH"
    for proc in system_view()["processes"]:
        cand = proc.get("exe")
        if not cand and proc.get("cmdline"):
            m = re.match(r'\s*"([^"]+)"|\s*(\S+)', proc["cmdline"])
            cand = (m.group(1) or m.group(2)) if m else None
        if cand and Path(cand).is_file():
            return cand, "laufende Instanz (pid %s)" % proc.get("pid")
    if os.name != "nt":
        return None, "nur unter Windows"
    la = os.environ.get("LOCALAPPDATA")
    if la:
        alias = Path(la) / "Microsoft" / "WindowsApps" / "PBIDesktopStore.exe"
        if alias.exists():
            return str(alias), "App-Alias (Store)"
    rc, out, _ = LR.run(["powershell", "-NoProfile", "-Command",
                         "(Get-AppxPackage -Name Microsoft.MicrosoftPowerBIDesktop | "
                         "Sort-Object Version -Descending | Select-Object -First 1)"
                         ".InstallLocation"], timeout=60)
    loc = (out or "").strip().splitlines()
    if rc == 0 and loc and loc[-1].strip():
        cand = Path(loc[-1].strip()) / "bin" / "PBIDesktop.exe"
        if cand.is_file():
            return str(cand), "Get-AppxPackage (Store)"
    for root in (os.environ.get("ProgramFiles"), os.environ.get("ProgramFiles(x86)")):
        if not root:
            continue
        for sub in ("Microsoft Power BI Desktop", "Microsoft Power BI Desktop RS"):
            cand = Path(root) / sub / "bin" / "PBIDesktop.exe"
            if cand.is_file():
                return str(cand), "Installer (MSI)"
    return None, "nicht gefunden"


def desktop_status():
    """Desktop-Instanzen mit Bridge wie der Runner sie sieht: `pbir desktop list --json`
    (Vorgabe) bzw. die Bridge-CLI, wenn MK_BRIDGE_CMD gesetzt ist."""
    pbir_spec, pbir_argv = tool_cmd("MK_PBIR", "pbir")
    bridge_spec = os.environ.get("MK_BRIDGE_CMD")
    backend = "bridge" if bridge_spec else "pbir"
    try:
        pbir = LR.Pbir(pbir_spec) if pbir_argv else None
    except LR.RunnerError:
        pbir = None
    if backend == "pbir" and pbir is None:
        backend = "bridge"
    bridge = LR.Bridge(bridge_spec or "powerbi-desktop")
    if backend == "bridge" and not bridge.argv:
        return {"ok": False, "status": "error", "error": "weder pbir noch Bridge-CLI gefunden",
                "instances": [], "backend": None}
    cli = LR.DesktopCli(backend, pbir, bridge, None, log=lambda m: None, retries=1,
                        backoff=0.5)
    data = cli.status(wait=0)
    data["backend"] = backend
    return data


def compat_level(model_dir: Path):
    """compatibilityLevel aus definition/database.tmdl (eine Zeile, kein TMDL-Parser) oder
    model.bim. None, wenn nicht lesbar."""
    db = model_dir / "definition" / "database.tmdl"
    try:
        for line in db.read_text(encoding="utf-8-sig").splitlines():
            m = re.match(r"\s*compatibilityLevel\s*:\s*(\d+)\s*$", line)
            if m:
                return int(m.group(1))
    except OSError:
        pass
    bim = LR.read_json(model_dir / "model.bim", retries=0)
    if isinstance(bim, dict) and str(bim.get("compatibilityLevel") or "").isdigit():
        return int(bim["compatibilityLevel"])
    return None


def visual_schemas_newer(report: Path, limit: str) -> list:
    """visualContainer-Schemaversionen im Bericht, die neuer als `limit` sind (nur lesen,
    je visual.json die ersten Bytes)."""
    seen = set()
    rx = re.compile(rb"visualContainer/(\d+(?:\.\d+)+)/schema\.json")
    for f in (Path(report) / "definition" / "pages").glob("*/visuals/*/visual.json"):
        try:
            with open(f, "rb") as fh:
                m = rx.search(fh.read(400))
        except OSError:
            continue
        if m:
            seen.add(m.group(1).decode("ascii"))
    return sorted((v for v in seen if LR.version_tuple(v) > LR.version_tuple(limit)),
                  key=LR.version_tuple)


def heartbeat_age(doc: dict):
    hb = LR.parse_time(((doc or {}).get("runner") or {}).get("heartbeatAt"))
    if hb is None:
        return None
    return (_dt.datetime.now().astimezone() - hb).total_seconds()


def runner_alive(project) -> dict | None:
    """Laufender Runner für diesen Ordner: Herzschlag jünger als 15 s und nicht gestoppt."""
    doc = LR.read_json(project.status, retries=1)
    if not isinstance(doc, dict):
        return None
    rn = doc.get("runner") or {}
    age = heartbeat_age(doc)
    if age is None or age > HEARTBEAT_FRESH_S or rn.get("state") == "stopped":
        return None
    if rn.get("projectPath") and not LR.same_path(rn["projectPath"], project.root):
        return None
    return {"pid": rn.get("pid"), "sessionId": rn.get("sessionId"), "state": rn.get("state"),
            "age": round(age, 1), "awaiting": doc.get("awaiting"),
            "pinnedPid": rn.get("pinnedPid")}


def policies() -> list:
    """Richtlinien für Power BI Desktop (nur lesen): [(Schlüssel, Name, Wert)]."""
    out = []
    if os.name != "nt":
        return out
    try:
        import winreg
    except ImportError:
        return out
    for hive, hname in ((winreg.HKEY_LOCAL_MACHINE, "HKLM"), (winreg.HKEY_CURRENT_USER, "HKCU")):
        for sub in (r"SOFTWARE\Policies\Microsoft\Power BI Desktop",
                    r"SOFTWARE\Policies\Microsoft\Microsoft Power BI Desktop"):
            try:
                with winreg.OpenKey(hive, sub) as k:
                    i = 0
                    while True:
                        try:
                            name, val, _ = winreg.EnumValue(k, i)
                        except OSError:
                            break
                        out.append(("%s\\%s" % (hname, sub), name, val))
                        i += 1
            except OSError:
                continue
    return out


# --------------------------------------------------------------------------- doctor
class Report:
    def __init__(self) -> None:
        self.checks = []

    def add(self, cid: str, label: str, state: str, detail: str = "", fix: str = "",
            blocking: bool = False, **extra) -> dict:
        c = {"id": cid, "label": label, "state": state, "detail": detail}
        if fix:
            c["fix"] = fix
        if blocking:
            c["blocking"] = True
        c.update({k: v for k, v in extra.items() if v is not None})
        self.checks.append(c)
        return c

    def overall(self) -> str:
        states = {c["state"] for c in self.checks}
        return "red" if "red" in states else "yellow" if "yellow" in states else "green"


def te_info():
    """(argv, Version, abgelaufen?, Ablaufdatum, Rohtext) aus `te --version`; das Datum
    kommt immer aus der Ausgabe (model_ops.expiry_from_text), nie aus dem Code."""
    spec = os.environ.get("MK_TE") or "te"
    argv = LR.resolve_cmd(spec, "te")
    if not argv:
        return None, None, False, None, ""
    rc, text = run_version(argv)
    expired, date = MO.expiry_from_text(text)
    first = next((ln.strip() for ln in text.splitlines() if ln.strip()), "")
    ver = None if expired else version_of(first)
    return argv, ver, expired, date, text


def check_tools(rep: Report, versions: dict) -> None:
    py = sys.version_info
    versions["python"] = "%d.%d.%d" % py[:3]
    if py[:2] >= MIN_PYTHON:
        rep.add("python", "Python", "green", "Python %s" % versions["python"])
    else:
        rep.add("python", "Python", "red", "Python %s ist zu alt" % versions["python"],
                "Python 3.11 oder neuer installieren.", blocking=True)
    missing = []
    for mod, pkg in (("PIL", "Pillow"), ("psutil", "psutil")):
        try:
            __import__(mod)
        except ImportError:
            missing.append(pkg)
    if missing:
        rep.add("packages", "Python-Pakete", "yellow", "fehlt: %s" % ", ".join(missing),
                "mk-live setup ausführen (installiert Pillow und psutil).")
    else:
        rep.add("packages", "Python-Pakete", "green", "Pillow und psutil vorhanden")

    spec, argv = tool_cmd("MK_PBIR", "pbir")
    rc, text = run_version(argv)
    ver = version_of(text) if argv else None
    versions["pbir"] = ver
    note = "pbir ist nur für nicht-kommerzielle Nutzung lizenziert"
    if not argv:
        rep.add("pbir", "pbir", "red", "pbir nicht gefunden (%s)" % spec,
                "uv tool install pbir-cli==%s, danach eine neue Konsole öffnen." % PINNED["pbir"],
                blocking=True)
    elif ver in TESTED["pbir"]:
        rep.add("pbir", "pbir", "green", "pbir %s · %s" % (ver, note))
    else:
        rep.add("pbir", "pbir", "yellow", "pbir %s, getestet mit %s · %s" % (
            ver or "?", PINNED["pbir"], note),
                "uv tool install pbir-cli==%s --force" % PINNED["pbir"])

    spec, argv = tool_cmd("MK_BRIDGE_CMD", "powerbi-desktop")
    ver = None
    if argv:
        rc, text = run_version(argv)
        ver = version_of(text) if rc == 0 else None
    versions["powerbi-desktop-bridge-cli"] = ver
    key = "powerbi-desktop-bridge-cli"
    if not argv:
        rep.add("bridgeCli", "Bridge-CLI", "yellow", "powerbi-desktop nicht gefunden",
                "npm install -g @microsoft/powerbi-desktop-bridge-cli@%s (braucht Node.js). "
                "Ohne sie startet der Helfer Desktop nach einem Neustart nicht selbst."
                % PINNED[key])
    elif ver in TESTED[key]:
        rep.add("bridgeCli", "Bridge-CLI", "green", "powerbi-desktop %s (gepinnt %s)" % (
            ver, PINNED[key]))
    else:
        rep.add("bridgeCli", "Bridge-CLI", "yellow", "powerbi-desktop %s, getestet mit %s"
                % (ver or "?", ", ".join(TESTED[key])),
                "npm install -g @microsoft/powerbi-desktop-bridge-cli@%s" % PINNED[key])

    argv, ver, expired, date, text = te_info()
    versions["te"] = ver
    versions["teExpires"] = date
    if not argv:
        rep.add("te", "Tabular Editor CLI (te)", "yellow", "te nicht gefunden",
                "Nur für Modelländerungen nötig: te von %s ablegen (PATH oder MK_TE), dann "
                "den Helfer neu starten." % TE_URL, expires=None)
    elif expired:
        rep.add("te", "Tabular Editor CLI (te)", "yellow",
                "te abgelaufen%s: Modelländerungen bleiben Aufgaben, Layout-Deploys laufen"
                % (" am %s" % date if date else ""),
                "Neue Preview von %s ablegen (oder MK_TE setzen) und den Helfer neu starten."
                % TE_URL, expires=date, expired=True)
    else:
        days = None
        if date:
            try:
                days = (_dt.date.fromisoformat(date) - _dt.date.today()).days
            except ValueError:
                days = None
        if days is not None and days <= 7:
            rep.add("te", "Tabular Editor CLI (te)", "yellow",
                    "te %s läuft am %s ab (in %d Tag(en))" % (ver or "?", date, days),
                    "Rechtzeitig die nächste Preview von %s holen." % TE_URL, expires=date)
        else:
            rep.add("te", "Tabular Editor CLI (te)", "green", "te %s bereit%s" % (
                ver or "?", ", Preview bis %s" % date if date else ""), expires=date)


def check_project(rep: Report, root: Path):
    """PBIP mit PBIR und TMDL, compatibilityLevel, unappliedChanges.json. -> Project/None"""
    try:
        p = LR.Project(root)
    except LR.RunnerError as e:
        pbix = sorted(Path(root).glob("*.pbix")) if Path(root).is_dir() else []
        rep.add("project", "Projekt", "red", str(e) + (" (nur %s)" % pbix[0].name if pbix
                                                      else ""),
                "In Desktop: Datei → Speichern unter → Power BI-Projekt (.pbip), mit "
                "PBIR-Berichtsformat. Dann den Ordner mit der .pbip angeben.", blocking=True)
        return None
    if not p.pbip:
        rep.add("project", "Projekt", "red", "keine .pbip in %s" % p.root,
                "Den Ordner mit der .pbip angeben (nicht *.Report).", blocking=True)
        return None
    if not (p.model / "definition").is_dir():
        rep.add("project", "Projekt", "yellow", "%s · Modell ohne TMDL-Ordner definition/"
                % p.pbip.name, "In Desktop unter Optionen → Vorschaufeatures das "
                "TMDL-Format einschalten und neu speichern (nur für Modelländerungen nötig).")
    else:
        rep.add("project", "Projekt", "green", "%s · PBIR-Bericht und TMDL-Modell"
                % p.pbip.name)
    lvl = compat_level(p.model)
    if lvl is None:
        rep.add("compat", "compatibilityLevel", "info", "nicht lesbar")
    elif lvl < MIN_COMPAT:
        rep.add("compat", "compatibilityLevel", "red", "%d (Desktop braucht %d)" % (
            lvl, MIN_COMPAT), "Bei geschlossenem Desktop über te anheben (te set --help "
                              "zeigt die Form), danach te validate --errors-only.")
    else:
        rep.add("compat", "compatibilityLevel", "green", str(lvl))
        if lvl > TESTED_COMPAT:
            rep.add("compatNew", "compatibilityLevel (neu)", "info",
                    "%d ist neuer als die getesteten Stände (bis %d). Lief in der Demo durch, "
                    "kein Blocker." % (lvl, TESTED_COMPAT))
    newer = visual_schemas_newer(p.report, PBIR_VISUAL_SCHEMA_MAX)
    if newer:
        rep.add("schemas", "Visual-Schemas", "info",
                "visualContainer %s im Bericht, pbir %s kennt lokal bis %s: es prüft diese "
                "Visuals über ein Rückfall-Schema (Hinweis „schema not available locally, "
                "fallback“). Kein Blocker." % (", ".join(newer), PINNED["pbir"],
                                               PBIR_VISUAL_SCHEMA_MAX))
    if (p.model / "unappliedChanges.json").exists():
        rep.add("unapplied", "unappliedChanges.json", "red",
                "liegt im Modellordner: Deploys blockieren",
                "In Desktop „Änderungen übernehmen“ klicken und speichern.")
    else:
        rep.add("unapplied", "unappliedChanges.json", "green", "keine offenen Modelländerungen")
    return p


def check_gitignore(rep: Report, p) -> None:
    gi = p.mk / ".gitignore"
    was = LR.gitignore_complete(gi)
    p.ensure_mockup_dir()                        # wie der Runner: alles lokal, Erlaubnisliste
    tracked = []
    rc, out, _ = LR.run(["git", "-C", str(p.root), "ls-files", "--", "mockup"], timeout=30)
    if rc == 0:
        allow = {"mockup/%s" % n for n in LR.GITIGNORE_ALLOW}
        tracked = [ln.strip() for ln in out.splitlines()
                   if ln.strip() and ln.strip() not in allow]
    if tracked:
        rep.add("gitignore", "mockup/.gitignore", "yellow",
                "schon versioniert: %s%s" % (", ".join(tracked[:5]),
                                             " …" if len(tracked) > 5 else ""),
                "git rm -r --cached mockup, dann nur Spec, Brief, Freigaben und README wieder "
                "hinzufügen (Bilder und Status enthalten echte Daten).")
    elif was:
        rep.add("gitignore", "mockup/.gitignore", "green",
                "alles lokal, erlaubt: Spec, Brief, Freigaben, README")
    else:
        rep.add("gitignore", "mockup/.gitignore", "green",
                "angelegt bzw. ergänzt: alles lokal, erlaubt nur Spec, Brief, Freigaben, README")


def check_desktop(rep: Report, p, versions: dict, cfg: dict) -> dict:
    """Desktop-Instanzen (Bridge-Liste), Prozesse und Pipes, Duplikate, exe."""
    sysv = system_view()
    data = desktop_status()
    inst = data.get("instances") or []
    pipes = {str(n)[len(PIPE_PREFIX):] for n in sysv["pipes"]}
    procs = sysv["processes"]
    listed = {str(i.get("pid")) for i in inst}
    mine = [i for i in inst if p is not None and LR.instance_is_project(i, p.pbip, p.report)]
    info = {"instances": [{"pid": i.get("pid"), "file": i.get("currentFilePath"),
                           "hasUnsavedChanges": i.get("hasUnsavedChanges")} for i in inst],
            "processes": [{"pid": x.get("pid")} for x in procs], "pipes": sorted(pipes),
            "backend": data.get("backend")}
    # Fenster ohne Bridge, Pipes ohne Antwort
    no_bridge = [x for x in procs if str(x.get("pid")) not in pipes
                 and str(x.get("pid")) not in listed]
    silent = [pid for pid in pipes if pid not in listed]
    for x in no_bridge:
        rep.add("bridge", "Bridge je Desktop-Fenster", "yellow",
                "Desktop pid %s ohne Bridge" % x.get("pid"),
                "%s, Desktop-Fenster pid %s speichern, schließen und neu öffnen (Instanzen von "
                "vor dem Einschalten haben keine Bridge)." % (BRIDGE_SETTING, x.get("pid")),
                pid=x.get("pid"))
    for pid in silent:
        rep.add("bridge", "Bridge je Desktop-Fenster", "yellow",
                "Desktop pid %s hat eine Bridge, antwortet aber nicht (%s)" % (
                    pid, data.get("error") or "keine Antwort"),
                "Warten, bis Desktop fertig geladen hat; hängt es, dieses Fenster speichern und "
                "neu starten.", pid=pid)
    if not procs and not inst:
        rep.add("desktop", "Power BI Desktop", "yellow", "Desktop läuft nicht",
                "%s in Desktop öffnen (genau einmal)." % (p.pbip.name if p else "Die .pbip"))
    elif not data.get("ok") and not inst:
        rep.add("desktop", "Power BI Desktop", "yellow", "Desktop-Status nicht lesbar: %s"
                % (data.get("error") or data.get("status")),
                "%s; Desktop danach neu starten." % BRIDGE_SETTING)
    elif p is not None:
        cmd_dupes = [str(x.get("pid")) for x in procs
                     if LR.cmdline_has_file(str(x.get("cmdline") or ""), p.pbip)]
        pids = sorted({str(i.get("pid")) for i in mine} | set(cmd_dupes))
        if len(pids) > 1:
            rep.add("desktop", "Power BI Desktop", "red",
                    "%s ist in %d Desktop-Fenstern offen (pid %s)" % (
                        p.pbip.name, len(pids), ", ".join(pids)),
                    "Alle bis auf eines ohne Speichern schließen. Der Helfer arbeitet nur mit "
                    "genau einer Instanz.", pids=pids)
        elif mine:
            i = mine[0]
            rep.add("desktop", "Power BI Desktop", "green", "%s offen in pid %s%s" % (
                p.pbip.name, i.get("pid"),
                ", ungespeicherte Änderungen" if i.get("hasUnsavedChanges") else ""),
                    pid=i.get("pid"))
            info["pid"] = i.get("pid")
        elif cmd_dupes:
            rep.add("desktop", "Power BI Desktop", "yellow",
                    "%s offen in pid %s, aber ohne Bridge" % (p.pbip.name, cmd_dupes[0]),
                    "%s, dann Desktop neu starten." % BRIDGE_SETTING)
        else:
            others = ", ".join(Path(i.get("currentFilePath") or "?").name for i in inst) or "–"
            rep.add("desktop", "Power BI Desktop", "yellow",
                    "%s ist in keiner Desktop-Instanz offen (offen: %s)" % (p.pbip.name, others),
                    "%s in Desktop öffnen (genau einmal)." % p.pbip.name)
    exe = cfg.get("desktopExe")
    src = cfg.get("desktopExeSource")
    if not exe or not Path(exe).exists():
        exe, src = detect_desktop_exe()
    versions["desktopExe"] = exe
    if exe:
        kind = "Store" if "WindowsApps" in str(exe) else "Installer"
        rep.add("desktopExe", "Desktop-Programm", "green", "%s (%s, %s)" % (exe, kind, src))
    else:
        rep.add("desktopExe", "Desktop-Programm", "yellow", "pbidesktop.exe nicht gefunden",
                "PBI_DESKTOP_PATH setzen, z. B. (Get-AppxPackage Microsoft.MicrosoftPowerBI"
                "Desktop).InstallLocation + '\\bin\\PBIDesktop.exe', dann mk-live setup.")
    return info


def check_report(rep: Report, p) -> None:
    """Kitchen-Visuals und Theme (Sitzung vorbereiten)."""
    try:
        cat = VI.catalog(REPO)
    except Exception:                            # noqa: BLE001
        cat = {}
    try:
        have = {i["guid"]: i for i in VI.installed(p.report)}
    except Exception:                            # noqa: BLE001
        have = {}
    missing, old, ok = [], [], []
    for name in LR.PREPARE_VISUALS:
        c = cat.get(name)
        if not c:
            continue
        i = have.get(c["guid"])
        label = c.get("displayName") or name
        if not i or not i.get("registered") or not i.get("folder"):
            missing.append(label)
        elif LR.version_tuple(i.get("version")) < LR.version_tuple(c.get("version")):
            old.append("%s %s → %s" % (label, i.get("version"), c.get("version")))
        else:
            ok.append("%s %s" % (label, i.get("version")))
    if missing or old:
        rep.add("visuals", "Kitchen-Visuals im Bericht", "yellow",
                "; ".join(x for x in ("fehlt: " + ", ".join(missing) if missing else "",
                                      "veraltet: " + ", ".join(old) if old else "") if x),
                "Im Kitchen „Sitzung vorbereiten“ (installiert alles, ein Desktop-Neustart nach "
                "Bestätigung).")
    elif ok:
        rep.add("visuals", "Kitchen-Visuals im Bericht", "green", ", ".join(ok))
    else:
        rep.add("visuals", "Kitchen-Visuals im Bericht", "info", "kein Build im Repo gefunden")
    rj = LR.read_json(p.report / "definition" / "report.json", retries=0) or {}
    ct = (rj.get("themeCollection") or {}).get("customTheme") or {}
    if ct.get("name"):
        rep.add("theme", "Theme", "green", "Custom Theme %s registriert" % ct["name"])
    else:
        rep.add("theme", "Theme", "yellow", "kein Custom Theme",
                "„Sitzung vorbereiten“ registriert das Theme %s (ein Neustart)." % LR.THEME_NAME)


def check_helper(rep: Report, p) -> None:
    alive = runner_alive(p)
    if alive:
        aw = alive.get("awaiting")
        if aw:
            rep.add("helper", "Live-Helfer", "yellow", "läuft (pid %s), wartet auf eine Antwort: "
                    "%s" % (alive["pid"], aw.get("reason")),
                    "Im Kitchen antworten (Neustart-Dialog bzw. Sitzungsband).",
                    pid=alive["pid"], sessionId=alive["sessionId"])
        else:
            rep.add("helper", "Live-Helfer", "green", "läuft (pid %s, Sitzung %s, Herzschlag vor "
                    "%s s)" % (alive["pid"], alive["sessionId"], LR.fmt_num(alive["age"])),
                    pid=alive["pid"], sessionId=alive["sessionId"])
        # Safety (6b): ohne Breakaway kann ein bestätigter Desktop-Neustart (taskkill /T) den
        # Helfer mitbeenden, wenn er im Job von Desktop läuft (Start über Externe Tools)
        sess = LR.read_json(p.session, retries=1)
        spawn = (sess or {}).get("spawn") if isinstance(sess, dict) else None
        if isinstance(spawn, dict) and spawn.get("breakaway") is False:
            rep.add("spawn", "Losgelöster Start", "yellow",
                    "Live-Helfer ohne CREATE_BREAKAWAY_FROM_JOB gestartet (Flags %s, %s)" % (
                        spawn.get("innerFlags") or spawn.get("flags"),
                        spawn.get("note") or "Job erlaubt keinen Ausbruch"),
                    "Vor einem Neustart über das Kitchen: mk-live stop, dann mk-live start aus "
                    "einer eigenen Konsole (nicht aus Desktop heraus). Sonst kann der Neustart "
                    "den Helfer mitbeenden und Desktop bleibt geschlossen.")
        # Store-Desktop (MSIX): aus Externe Tools gestartet, läuft der Helfer im Paketkontext.
        # Windows kann dann Schreibzugriffe auf %LOCALAPPDATA% in den Paketordner umleiten.
        if isinstance(spawn, dict) and spawn.get("packaged"):
            rep.add("package", "Paketkontext", "info",
                    "Helfer im Paketkontext von %s gestartet. Eigene Dateien unter "
                    "%%LOCALAPPDATA%%\\MockupKitchen (sessions.json, launch.log) können dann im "
                    "Paketordner landen; Status und Sitzung im Projektordner gelten unverändert."
                    % spawn["packaged"])
    else:
        rep.add("helper", "Live-Helfer", "info", "läuft nicht (mk-live start startet ihn)")


def check_pbip_reload(rep: Report) -> None:
    """Desktop-Vorschau „Detect and reload external PBIP changes": nicht auslesbar. Desktop
    speichert Vorschaufunktionen nur als Kennungen ohne Namen (User.zip,
    FeatureSwitches/FeatureSwitches.xml); welche dieser Kennungen die PBIP-Erkennung ist,
    ist nicht dokumentiert. Der doctor liest die Datei deshalb nicht."""
    rep.add("pbipReload", "Desktop-Vorschau externe PBIP-Änderungen", "info",
            "nicht prüfbar: Desktop speichert Vorschaufunktionen nur als Kennungen ohne Namen. "
            "Ist „Detect and reload external PBIP changes“ eingeschaltet, kann Desktop nach "
            "einem Deploy zusätzlich selbst neu laden (ungeprüft).")


def run_doctor(project, write: bool = True) -> dict:
    """Alle Prüfungen; schreibt mockup/doctor.json, wenn das Projekt gültig ist."""
    rep, versions = Report(), {"mkLive": MK_LIVE_VERSION, "runner": LR.RUNNER_VERSION,
                               "os": platform.platform()}
    cfg = load_config()
    root = Path(project).expanduser().resolve() if project else None
    check_tools(rep, versions)
    p = check_project(rep, root) if root else None
    if p is not None:
        check_gitignore(rep, p)
    desk = check_desktop(rep, p, versions, cfg)
    check_pbip_reload(rep)
    if p is not None:
        check_report(rep, p)
        check_helper(rep, p)
    pols = list(policies())
    for key, name, val in pols:
        rep.add("policy", "Richtlinie", "info", "%s\\%s = %s" % (key, name, val))
    if not pols:                                 # Vertrag: Zeile immer da (nur Info)
        rep.add("policy", "Richtlinie", "info", "keine Power-BI-Desktop-Richtlinien gefunden")
    doc = {"contract": LR.CONTRACT_VERSION, "tool": "mk-live doctor %s" % MK_LIVE_VERSION,
           "at": now_iso(), "project": p.name if p else None,
           "projectPath": str(p.root) if p else (str(root) if root else None),
           "overall": rep.overall(), "checks": rep.checks, "versions": versions,
           "pinned": PINNED, "desktop": desk}
    if write and p is not None:
        LR.write_json_atomic(p.doctor, doc)
        doc["file"] = str(p.doctor)
    return doc


WORD = {"green": "OK  ", "yellow": "GELB", "red": "ROT ", "info": "info"}


def print_doctor(doc: dict, only_problems: bool = False) -> None:
    say("MockupKitchen live · doctor · %s" % (doc.get("projectPath") or "ohne Projekt"))
    for c in doc["checks"]:
        if only_problems and c["state"] in ("green", "info"):
            continue
        say("  %s  %-26s %s" % (WORD.get(c["state"], c["state"]), c["label"], c["detail"]))
        if c.get("fix") and c["state"] in ("yellow", "red"):
            say("        → %s" % c["fix"])
    n_red = sum(1 for c in doc["checks"] if c["state"] == "red")
    n_yel = sum(1 for c in doc["checks"] if c["state"] == "yellow")
    say("Ergebnis: %s (%d rot, %d gelb)%s" % (
        {"green": "grün", "yellow": "gelb", "red": "rot"}[doc["overall"]], n_red, n_yel,
        " · %s" % doc["file"] if doc.get("file") else ""))


def cmd_doctor(args) -> int:
    doc = run_doctor(args.project, write=not args.no_write)
    if args.json:
        say(json.dumps(doc, ensure_ascii=False, indent=2))
    else:
        print_doctor(doc)
    return 1 if doc["overall"] == "red" else 0


# --------------------------------------------------------------------------- Start
def package_identity():
    """Voller Paketname (MSIX), wenn dieser Prozess im Paketkontext läuft, sonst None.

    Startet Power BI Desktop aus dem Microsoft Store den Helfer über Externe Tools, erben
    pythonw und seine Kinder in der Regel die Paketidentität. Windows kann dann neue Dateien
    unter %LOCALAPPDATA% in den privaten Paketordner umleiten (config.json, sessions.json,
    launch.log), ein Start aus der Konsole sähe andere Dateien. Der Projektordner ist davon nicht
    betroffen. Nur Diagnose: steht als `spawn.packaged` in desktop-session.json, doctor meldet es
    als Info, mk_launch.pyw schreibt es ins Protokoll (am Store-Desktop noch ungeprüft)."""
    if os.name != "nt":
        return None
    try:
        import ctypes
        fn = ctypes.windll.kernel32.GetCurrentPackageFullName
        n = ctypes.c_uint32(0)
        rc = fn(ctypes.byref(n), None)
        if rc != 122 or not n.value:             # 15700 = APPMODEL_ERROR_NO_PACKAGE
            return None
        buf = ctypes.create_unicode_buffer(n.value)
        if fn(ctypes.byref(n), buf) == 0:
            return buf.value or None
    except Exception:                            # noqa: BLE001 - nur Diagnose
        return None
    return None


def spawn_detached(argv, log_path=None, cwd=None, info=None) -> int:
    """argv losgelöst vom eigenen Prozessbaum starten (Review A, P1): unter Windows über
    einen kurzlebigen Zwischenprozess (`_spawn`), beide mit DETACHED_PROCESS |
    CREATE_NEW_PROCESS_GROUP | CREATE_BREAKAWAY_FROM_JOB. Der Zwischenprozess endet sofort,
    damit `taskkill /T` auf Desktop oder den Aufrufer den Runner nicht mitnimmt. -> pid

    info (dict, optional) bekommt die tatsächlich benutzten Flags (Safety 6b): `outerFlags`
    (Zwischenprozess), `innerFlags` (Runner), `breakaway` (beide mit Breakaway gestartet),
    `note`. Ohne Breakaway (Job verbietet es) startet der Helfer trotzdem; doctor meldet es."""
    info = info if isinstance(info, dict) else {}
    payload = json.dumps({"argv": [str(a) for a in argv],
                          "log": str(log_path) if log_path else None,
                          "cwd": str(cwd) if cwd else None}).encode("utf-8")
    if os.name != "nt":
        logf = open(log_path, "ab") if log_path else subprocess.DEVNULL
        try:
            proc = subprocess.Popen([str(a) for a in argv], stdin=subprocess.DEVNULL,
                                    stdout=logf, stderr=subprocess.STDOUT, cwd=cwd,
                                    start_new_session=True, close_fds=True)
        finally:
            if log_path:
                logf.close()
        info.update({"flags": "start_new_session", "breakaway": None, "at": now_iso()})
        return proc.pid
    info["packaged"] = package_identity()        # Store-Desktop: Start im Paketkontext?
    cmd = [python_exe(), str(Path(__file__).resolve()), "_spawn"]
    last, notes = None, []
    for flags in (DETACH_FLAGS | BREAKAWAY, DETACH_FLAGS):
        try:
            proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                    stderr=subprocess.PIPE, creationflags=flags, close_fds=True)
        except OSError as e:                     # Job ohne Breakaway-Erlaubnis
            last = e
            notes.append("Zwischenprozess ohne Breakaway: %s" % e)
            continue
        out, err = proc.communicate(payload, timeout=60)
        data = LR.parse_json_output(out.decode("utf-8", "replace"))
        if isinstance(data, dict) and data.get("pid"):
            inner = int(data.get("flags") or 0)
            if data.get("note"):
                notes.append(str(data["note"]))
            info.update({"outerFlags": "0x%X" % flags, "innerFlags": "0x%X" % inner if inner
                         else None, "breakaway": bool(flags & BREAKAWAY and inner & BREAKAWAY),
                         "note": "; ".join(notes) or None, "at": now_iso()})
            return int(data["pid"])
        raise RuntimeError("Runner nicht gestartet: %s" % (
            (err or out).decode("utf-8", "replace").strip()[:400] or "keine Antwort"))
    raise RuntimeError("Runner nicht gestartet: %s" % last)


def cmd_spawn(_args) -> int:
    """Zwischenprozess für spawn_detached: startet argv, meldet pid und Flags, endet sofort."""
    req = json.loads(sys.stdin.buffer.read().decode("utf-8"))
    logf = open(req["log"], "ab") if req.get("log") else subprocess.DEVNULL
    note = None
    try:
        last = None
        for flags in (DETACH_FLAGS | BREAKAWAY, DETACH_FLAGS):
            try:
                proc = subprocess.Popen(req["argv"], stdin=subprocess.DEVNULL, stdout=logf,
                                        stderr=subprocess.STDOUT, cwd=req.get("cwd"),
                                        creationflags=flags, close_fds=True)
                break
            except OSError as e:
                last = e
                note = "Runner ohne Breakaway: %s" % e
        else:
            sys.stderr.write("Start fehlgeschlagen: %s\n" % last)
            return 1
    finally:
        if req.get("log"):
            logf.close()
    sys.stdout.write(json.dumps({"pid": proc.pid, "flags": flags, "note": note}) + "\n")
    sys.stdout.flush()
    return 0


def kitchen_url(override=None, name=None) -> str:
    url = override or os.environ.get("MK_KITCHEN_URL") or load_config().get("kitchenUrl") \
        or KITCHEN_URL
    parts = urllib.parse.urlsplit(url)
    q = [(k, v) for k, v in urllib.parse.parse_qsl(parts.query, keep_blank_values=True)
         if k not in ("live", "project")]
    q.append(("live", "1"))
    if name:
        q.append(("project", name))
    return urllib.parse.urlunsplit(parts._replace(query=urllib.parse.urlencode(q)))


def open_browser(url: str, no_browser: bool) -> None:
    if no_browser or os.environ.get("MK_NO_BROWSER"):
        say("Kitchen: %s" % url)
        return
    try:
        target = url
        if os.name == "nt" and url.lower().startswith("file:") and "?" in url:
            # Windows verwirft beim Öffnen lokaler Dateien die Parameter (?live=1 ginge verloren):
            # kleine Weiterleitungsseite öffnen, die die volle Adresse lädt.
            hop = Path(tempfile.gettempdir()) / "mk-live-open.html"
            hop.write_text('<!doctype html><meta charset="utf-8"><script>location.replace(%s)</script>'
                           % json.dumps(url), encoding="utf-8")
            target = hop.as_uri()
        webbrowser.open(target, new=2)
        say("Kitchen geöffnet: %s" % url)
    except Exception as e:                       # noqa: BLE001
        say("Kitchen bitte selbst öffnen: %s (%s)" % (url, e))


def sessions_file() -> Path:
    return home() / "sessions.json"


def remember_session(root: Path, entry) -> None:
    data = LR.read_json(sessions_file(), retries=1)
    data = data if isinstance(data, dict) else {}
    key = os.path.normcase(str(root))
    if entry is None:
        data.pop(key, None)
    else:
        data[key] = entry
    try:
        LR.write_json_atomic(sessions_file(), data)
    except OSError:
        pass


def project_desktop(doctor: dict):
    """(pid, exe) der Desktop-Instanz mit diesem Projekt aus dem doctor-Ergebnis."""
    pid = (doctor.get("desktop") or {}).get("pid")
    exe = None
    if pid:
        exe = LR.process_info(pid)[1]
    return pid, exe or (doctor.get("versions") or {}).get("desktopExe")


def cmd_start(args) -> int:
    try:
        p = LR.Project(args.project)
    except LR.RunnerError as e:
        say("Fehler: %s" % e)
        return 1
    doc = run_doctor(p.root, write=True)
    print_doctor(doc, only_problems=True)
    blocking = [c for c in doc["checks"] if c["state"] == "red" and c.get("blocking")]
    if blocking and not args.force:
        say("Start abgebrochen: %s" % "; ".join(c["detail"] for c in blocking))
        return 1
    url = kitchen_url(args.open_kitchen, p.name)
    alive = runner_alive(p)
    if alive and args.pin_pid and str(alive.get("pinnedPid") or "") != str(int(args.pin_pid)):
        # Safety (6): Start aus einer anderen Desktop-Instanz (Externe Tools nach einem
        # Neustart von Hand): den alten, anders festgenagelten Helfer ersetzen statt Sackgasse
        say("Live-Helfer (pid %s) ist auf Desktop pid %s festgenagelt, gestartet wird aus pid %s: "
            "alter Helfer wird ersetzt." % (alive["pid"], alive.get("pinnedPid") or "keine",
                                           int(args.pin_pid)))
        if not stop_runner(p, alive.get("pid"), timeout=float(args.replace_timeout)):
            say("Der alte Live-Helfer (pid %s) beendet sich erst nach dem laufenden Deploy. "
                "Danach erneut starten (Externe Tools → MockupKitchen live)." % alive["pid"])
            return 1
        alive = None
    if alive:
        say("Live-Helfer läuft schon für %s (pid %s, Sitzung %s). Kein zweiter Start."
            % (p.root, alive["pid"], alive["sessionId"]))
        open_browser(url, args.no_browser)
        return 0
    pid, exe = project_desktop(doc)
    if args.pin_pid:
        pid = int(args.pin_pid)
        exe = LR.process_info(pid)[1] or exe
    sid = LR.new_session_id()
    p.state_dir.mkdir(parents=True, exist_ok=True)
    try:
        p.stop_request.unlink()
    except OSError:
        pass
    session = {"sessionId": sid, "projectPath": str(p.root), "pid": pid, "exe": exe,
               "startedAt": now_iso(), "runnerPid": None, "pinned": bool(args.pin_pid),
               "launcher": args.launcher or "mk-live start"}
    LR.write_json_atomic(p.session, session)
    extra = [a for a in (args.runner_args or []) if a != "--"]
    argv = [python_exe(), str(RUNNER), "watch", str(p.root), "--session-id", sid]
    if args.pin_pid:
        argv += ["--pin-pid", str(int(args.pin_pid))]
    argv += extra
    console = p.state_dir / "runner.console.log"
    spawn = {}
    try:
        rpid = spawn_detached(argv, console, cwd=str(REPO), info=spawn)
    except Exception as e:                       # noqa: BLE001
        say("Live-Helfer nicht gestartet: %s" % e)
        return 1
    session["runnerPid"] = rpid
    session["spawn"] = spawn                     # Safety (6b): gewählte Flags, Breakaway ja/nein
    cur = LR.read_json(p.session, retries=1)
    if isinstance(cur, dict) and cur.get("sessionId") == sid:
        cur["runnerPid"] = rpid                  # der Runner hat die Datei schon ergänzt
        cur["spawn"] = spawn
        session = cur
    LR.write_json_atomic(p.session, session)
    if spawn.get("breakaway") is False:
        say("Hinweis: Live-Helfer ohne Breakaway gestartet (%s). Ein Desktop-Neustart kann ihn "
            "mitbeenden; mk-live doctor zeigt das gelb." % (spawn.get("note") or "Job"))
    remember_session(p.root, {"sessionId": sid, "runnerPid": rpid, "startedAt": now_iso(),
                              "projectPath": str(p.root)})
    deadline = time.time() + float(args.wait)
    ok = False
    while time.time() < deadline:
        st = LR.read_json(p.status, retries=1) or {}
        rn = st.get("runner") or {}
        if rn.get("sessionId") == sid and rn.get("state") != "stopped" and \
                (heartbeat_age(st) or 99) < HEARTBEAT_FRESH_S:
            ok = True
            break
        if not LR.pid_alive(rpid):
            break
        time.sleep(0.3)
    if ok:
        say("Live-Helfer läuft (pid %s, Sitzung %s%s). Protokoll: %s" % (
            rpid, sid, ", Desktop pid %s" % pid if pid else "", p.log_file))
    else:
        say("Live-Helfer meldet sich noch nicht (pid %s). Protokoll: %s, Konsole: %s"
            % (rpid, p.log_file, console))
    open_browser(url, args.no_browser)
    return 0 if ok else 1


def start_project(project, pin_pid=None, no_browser=False, open_kitchen=None, launcher=None,
                  runner_args=(), wait: float = 20.0, force: bool = False,
                  replace_timeout: float = 60.0) -> int:
    """mk-live start als Funktion (mk_launch.pyw)."""
    ns = argparse.Namespace(project=str(project), pin_pid=pin_pid, no_browser=no_browser,
                            open_kitchen=open_kitchen, launcher=launcher,
                            runner_args=list(runner_args), wait=wait, force=force,
                            replace_timeout=replace_timeout)
    return cmd_start(ns)


def stop_runner(p, rpid, timeout: float = 20.0) -> bool:
    """Runner dieses Projekts über .state/stop-request.json beenden und warten (nie hart).
    True, wenn er sich beendet hat (Status „stopped" oder Prozess weg)."""
    LR.write_json_atomic(p.stop_request, {"at": now_iso(), "by": "mk-live", "runnerPid": rpid})
    deadline = time.time() + float(timeout)
    while time.time() < deadline:
        st = LR.read_json(p.status, retries=1) or {}
        if (st.get("runner") or {}).get("state") == "stopped" or \
                (rpid and not LR.pid_alive(rpid)):
            return True
        time.sleep(0.3)
    return False


def cmd_stop(args) -> int:
    roots = []
    if args.project:
        roots = [Path(args.project).expanduser().resolve()]
    else:
        data = LR.read_json(sessions_file(), retries=1) or {}
        for key, e in (data.items() if isinstance(data, dict) else []):
            root = Path(e.get("projectPath") or key)
            try:
                if runner_alive(LR.Project(root)):
                    roots.append(root)
            except LR.RunnerError:
                remember_session(root, None)
        if not roots:
            say("Kein laufender Live-Helfer bekannt.")
            return 0
        if len(roots) > 1:
            say("Mehrere Live-Helfer laufen, bitte den Projektordner angeben:")
            for r in roots:
                say("  mk-live stop \"%s\"" % r)
            return 2
    rc = 0
    for root in roots:
        try:
            p = LR.Project(root)
        except LR.RunnerError as e:
            say("Fehler: %s" % e)
            rc = 1
            continue
        st = LR.read_json(p.status, retries=1) or {}
        rpid = (st.get("runner") or {}).get("pid")
        if not runner_alive(p) and not (rpid and runner_process(rpid, p.root)):
            say("Kein laufender Live-Helfer für %s." % p.root)
            remember_session(p.root, None)
            continue
        LR.write_json_atomic(p.stop_request, {"at": now_iso(), "by": "mk-live stop",
                                              "runnerPid": rpid})
        deadline = time.time() + float(args.timeout)
        stopped = False
        while time.time() < deadline:
            st = LR.read_json(p.status, retries=1) or {}
            if (st.get("runner") or {}).get("state") == "stopped" or \
                    (rpid and not LR.pid_alive(rpid)):
                stopped = True
                break
            time.sleep(0.3)
        if not stopped and args.force and rpid and runner_process(rpid, p.root):
            try:
                import psutil
                psutil.Process(int(rpid)).terminate()
                stopped = True
            except Exception as e:               # noqa: BLE001
                say("Runner pid %s ließ sich nicht beenden: %s" % (rpid, e))
        if stopped:
            say("Live-Helfer für %s beendet." % p.root)
            remember_session(p.root, None)
        else:
            say("Live-Helfer für %s reagiert nicht (pid %s). Läuft gerade ein Deploy, endet er "
                "danach; sonst mk-live stop --force." % (p.root, rpid))
            rc = 1
    return rc


def runner_process(pid, root) -> bool:
    """Ist pid wirklich ein live_runner.py für diesen Ordner? (vor jedem Beenden prüfen)"""
    try:
        import psutil
        cmd = " ".join(psutil.Process(int(pid)).cmdline())
    except Exception:                            # noqa: BLE001
        return False
    norm = os.path.normcase(cmd.replace('"', ""))
    return "live_runner.py" in norm and os.path.normcase(str(root)) in norm


# --------------------------------------------------------------------------- diag
def cmd_diag(args) -> int:
    try:
        p = LR.Project(args.project)
    except LR.RunnerError as e:
        say("Fehler: %s" % e)
        return 1
    doc = run_doctor(p.root, write=True)
    st = LR.read_json(p.status, retries=1) or {}
    seq = st.get("seq")
    hist = [h for h in st.get("history") or [] if isinstance(h, dict)]
    last = str(seq) if seq else (str(hist[-1].get("seq")) if hist else None)
    stamp = _dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    out = Path(args.out) if args.out else p.state_dir / "diag" / ("mk-live-diag-%s.zip" % stamp)
    out.parent.mkdir(parents=True, exist_ok=True)
    files = [p.status, p.doctor, p.session, p.request, p.mk / "deploy-confirm.json",
             p.mk / "deploy-cancel.json", p.history_file, p.applied, p.runner_state,
             p.state_dir / "runner.console.log", p.reload_marker, p.failures]
    files += sorted(p.state_dir.glob("runner.log*"))
    with_images = bool(getattr(args, "with_images", False))
    # Safety (8/4): Bilder und Konverter-Ausgabe (echte Daten, Feldnamen) nur auf Wunsch
    if with_images:
        if p.out.is_dir():
            files += sorted(f for f in p.out.rglob("*") if f.is_file())
        if last:
            for base in (p.shots / last, p.kitchen / last):
                if base.is_dir():
                    files += sorted(f for f in base.rglob("*") if f.is_file())
    versions = dict(doc.get("versions") or {}, pinned=PINNED, seq=seq,
                    createdAt=now_iso(), project=p.name, withImages=with_images)
    readme = ("MockupKitchen live · Diagnose\n\n"
              "Enthält Status, doctor-Ergebnis, Sitzung, Verlauf und Runner-Protokoll. "
              "Benutzerpfade sind auf C:\\Users\\<du> gekürzt, der Projektordner samt "
              "übergeordneten Ordnern heißt <Projekt>, der Benutzername auch in anderen "
              "Ordnernamen <du>. Der Name des Berichts (.pbip) bleibt stehen.\n" +
              ("Dazu Konverter-Ausgabe (out/) und Bilder des letzten Deploys (shots/, kitchen/), "
               "weil --with-images gesetzt war. Bilder und Ausgaben zeigen echte Daten und "
               "Feldnamen.\n" if with_images else
               "Ohne Bilder und ohne Konverter-Ausgabe (nur mit mk-live diag --with-images).\n") +
              "Status und Protokoll enthalten Seiten-, Kachel- und Feldnamen. Vor dem "
              "Weitergeben öffnen und prüfen. Issues auf GitHub sind öffentlich.\n")
    n = 0
    names = user_names()

    def scrub(text):
        return scrub_text(text, p.root, names)
    with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr("LIESMICH.txt", readme)
        z.writestr("versions.json", scrub(json.dumps(versions, ensure_ascii=False, indent=2)))
        seen = set()
        for f in files:
            if not f or not Path(f).is_file() or str(f) in seen:
                continue
            seen.add(str(f))
            try:
                arc = "mockup/" + Path(f).resolve().relative_to(p.mk.resolve()).as_posix()
            except ValueError:
                arc = Path(f).name
            try:
                if Path(f).suffix.lower() in TEXT_SUFFIXES or ".log" in Path(f).name:
                    z.writestr(arc, scrub(Path(f).read_bytes().decode("utf-8", "replace")))
                else:
                    z.write(f, arc)
                n += 1
            except OSError as e:
                z.writestr(arc + ".fehler.txt", scrub(str(e)))
    say("Diagnose: %s (%d Dateien, %s). Vor dem Weitergeben ansehen." % (
        out, n + 2, "mit Bildern: zeigen echte Daten" if with_images
        else "ohne Bilder, Pfade gekürzt"))
    return 0


TEXT_SUFFIXES = {".json", ".log", ".txt", ".md", ".jsonl", ".csv", ".sh", ".ps1"}
# C:\Users\<Name>\…, auch als C:/Users/…, C:\\Users\\… (JSON) und kurzer 8.3-Name
USER_PATH_RX = re.compile(r"(?i)\b([A-Z]:(?:\\\\|\\|/)Users(?:\\\\|\\|/))([^\\/\"'<>|:*?\r\n\t]+)")


def shorten_user_paths(text: str) -> str:
    """Benutzernamen in Pfaden durch <du> ersetzen (Diagnose-ZIP, Safety 8/4)."""
    def repl(m):
        name = m.group(2)
        if name.lower() in ("public", "default", "all users", "<du>"):
            return m.group(0)
        return m.group(1) + "<du>"
    return USER_PATH_RX.sub(repl, text or "")


def short_path(path):
    """8.3-Kurzform eines vorhandenen Pfads (Windows), sonst None."""
    if os.name != "nt" or not path:
        return None
    try:
        import ctypes
        buf = ctypes.create_unicode_buffer(1024)
        n = ctypes.windll.kernel32.GetShortPathNameW(str(path), buf, 1024)
        return buf.value if 0 < n < 1024 else None
    except Exception:                            # noqa: BLE001 - nur Kosmetik
        return None


def user_names() -> list:
    """Benutzername in allen Formen, die in Pfaden oder Ordnernamen stehen können
    (USERNAME, Profilordner, dessen 8.3-Kurzname), für das Diagnose-ZIP."""
    prof = os.environ.get("USERPROFILE") or str(Path.home())
    cands = {os.environ.get("USERNAME") or "", Path(prof).name}
    sp = short_path(prof)
    if sp:
        cands.add(Path(sp).name)
    return sorted((c for c in cands if len(c) >= 3 and c.lower() not in
                   ("public", "default", "all users", "<du>")), key=len, reverse=True)


def scrub_text(text: str, root=None, names=()) -> str:
    """Diagnose-ZIP (Safety-Review 2, 8): Projektordner samt übergeordneten Ordnern ->
    <Projekt> (auch in JSON-, Schrägstrich- und 8.3-Form), Benutzerpfade -> C:\\Users\\<du>,
    danach der Benutzername auch als Teil anderer Ordnernamen (c--Users-<Name>-…) -> <du>."""
    text = text or ""
    if root:
        forms = set()
        for r in {str(root), str(Path(root).resolve()), short_path(root) or ""}:
            if r:
                forms |= {r, r.replace("\\", "\\\\"), r.replace("\\", "/")}
        for f in sorted(forms, key=len, reverse=True):
            text = re.sub(re.escape(f), "<Projekt>", text, flags=re.I)
    text = shorten_user_paths(text)
    for name in names:
        text = re.sub(r"(?i)(?<![A-Za-z0-9])%s(?![A-Za-z0-9])" % re.escape(name), "<du>", text)
    return text


# --------------------------------------------------------------------------- External Tools
def icon_png(size: int = 32) -> bytes:
    """Kleines Symbol (Tinte, zwei helle Kacheln) als PNG, nur Standardbibliothek."""
    ink, light = (15, 30, 46, 255), (234, 232, 225, 255)
    rows = []
    for y in range(size):
        row = bytearray([0])
        for x in range(size):
            r = 6
            cx = min(x, size - 1 - x)
            cy = min(y, size - 1 - y)
            inside = not (cx < r and cy < r and (r - cx) ** 2 + (r - cy) ** 2 > r * r)
            px = ink if inside else (0, 0, 0, 0)
            if inside and 7 <= y <= 24 and (6 <= x <= 14 or 17 <= x <= 25):
                px = light if (x <= 14 or y <= 14) else ink
            row += bytes(px)
        rows.append(bytes(row))

    def chunk(kind: bytes, body: bytes) -> bytes:
        return (struct.pack(">I", len(body)) + kind + body
                + struct.pack(">I", zlib.crc32(kind + body) & 0xFFFFFFFF))
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr)
            + chunk(b"IDAT", zlib.compress(b"".join(rows), 9)) + chunk(b"IEND", b""))


def tool_json() -> dict:
    return {"version": "1.0", "name": "MockupKitchen live",
            "description": "Live-Helfer starten: Skizze im MockupKitchen, Deploy in diesen "
                           "Bericht (nur PBIP mit PBIR, nur Testkopien)",
            "path": pythonw_exe(),
            "arguments": '"%s" --server "%%server%%" --database "%%database%%"' % LAUNCHER,
            "iconData": "image/png;base64," + base64.b64encode(icon_png()).decode("ascii")}


def cmd_register_tool(args) -> int:
    data = tool_json()
    text = json.dumps(data, ensure_ascii=True, indent=2) + "\n"
    target_dir = Path(args.target_dir or os.environ.get("MK_TOOL_DIR") or TOOL_DIR)
    target = target_dir / TOOL_FILE
    if args.dry_run:
        say(text)
        return 0
    try:
        if not target_dir.is_dir():
            target_dir.mkdir(parents=True)
        target.write_text(text, encoding="utf-8")
        say("Registriert: %s" % target)
        say("Nach dem nächsten Desktop-Start: Menüband Externe Tools → MockupKitchen live.")
        return 0
    except OSError as e:
        fallback = home() / TOOL_FILE
        fallback.parent.mkdir(parents=True, exist_ok=True)
        fallback.write_text(text, encoding="utf-8")
        say("Keine Schreibrechte für %s (%s)." % (target_dir, type(e).__name__))
        say("Die Datei liegt jetzt hier: %s" % fallback)
        say("Einmal in einer Konsole als Administrator ausführen:")
        say('  copy /Y "%s" "%s\\"' % (fallback, target_dir))
        say("oder in PowerShell (fragt nach Administratorrechten):")
        say("  Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -Command "
            "New-Item -ItemType Directory -Force ''%s'' | Out-Null; Copy-Item -Force ''%s'' "
            "''%s'''" % (target_dir, fallback, target))
        return 2


# --------------------------------------------------------------------------- setup
def shim_dirs() -> list:
    """Ordner für den Befehl mk-live: MK_SHIM_DIR, sonst Ordner aus PATH, in denen schon
    Benutzerwerkzeuge liegen (~/.local/bin, Python-Scripts)."""
    if os.environ.get("MK_SHIM_DIR"):
        return [Path(os.environ["MK_SHIM_DIR"])]
    path = [os.path.normcase(os.path.abspath(x)) for x in
            os.environ.get("PATH", "").split(os.pathsep) if x]
    cands = [Path.home() / ".local" / "bin"]
    try:
        import sysconfig
        cands.append(Path(sysconfig.get_path("scripts", "nt_user" if os.name == "nt"
                                             else "posix_user")))
        cands.append(Path(sysconfig.get_path("scripts")))
    except (KeyError, ValueError):
        pass
    return [c for c in cands if os.path.normcase(os.path.abspath(str(c))) in path]


def install_shim():
    body = '@echo off\r\n"%s" "%s" %%*\r\n' % (python_exe(), Path(__file__).resolve())
    for d in shim_dirs():
        try:
            d.mkdir(parents=True, exist_ok=True)
            target = d / "mk-live.cmd"
            target.write_text(body, encoding="utf-8")
            return target
        except OSError:
            continue
    return None


def cmd_setup(args) -> int:
    say("MockupKitchen live · setup")
    if sys.version_info[:2] < MIN_PYTHON:
        say("  ROT   Python %d.%d ist zu alt, bitte 3.11 oder neuer." % sys.version_info[:2])
        return 1
    missing = []
    for mod, pkg in (("PIL", "pillow"), ("psutil", "psutil")):
        try:
            __import__(mod)
        except ImportError:
            missing.append(pkg)
    if missing and not args.no_pip:
        say("  installiere %s …" % ", ".join(missing))
        rc, out, err = LR.run([python_exe(), "-m", "pip", "install", "--disable-pip-version-check"]
                              + missing, timeout=600)
        if rc != 0:
            rc, out, err = LR.run([python_exe(), "-m", "pip", "install", "--user",
                                   "--disable-pip-version-check"] + missing, timeout=600)
        say("  %s pip: %s" % ("OK  " if rc == 0 else "GELB", LR.short(err or out, 200)
                              if rc != 0 else "fertig"))
    elif missing:
        say("  GELB  fehlt: %s (pip install %s)" % (", ".join(missing), " ".join(missing)))
    else:
        say("  OK    Pillow und psutil vorhanden")
    rep, versions = Report(), {}
    check_tools(rep, versions)
    for c in rep.checks:
        say("  %s  %-26s %s" % (WORD.get(c["state"], c["state"]), c["label"], c["detail"]))
        if c.get("fix") and c["state"] in ("yellow", "red"):
            say("        → %s" % c["fix"])
    exe, src = detect_desktop_exe()
    say("  %s  %-26s %s" % ("OK  " if exe else "GELB", "Desktop-Programm",
                            "%s (%s)" % (exe, src) if exe else
                            "nicht gefunden: PBI_DESKTOP_PATH setzen"))
    cfg = load_config()
    cfg.update({"python": python_exe(), "pythonw": pythonw_exe(), "repo": str(REPO),
                "mkLive": str(Path(__file__).resolve()), "runner": str(RUNNER),
                "launcher": str(LAUNCHER), "desktopExe": exe, "desktopExeSource": src,
                "versions": versions, "pinned": PINNED, "setupAt": now_iso(),
                "mkLiveVersion": MK_LIVE_VERSION})
    cfg.setdefault("kitchenUrl", KITCHEN_URL)
    path = save_config(cfg)
    say("  OK    Einstellungen: %s" % path)
    if not args.no_shim:
        shim = install_shim()
        if shim:
            say("  OK    Befehl mk-live: %s" % shim)
        else:
            say("  GELB  Befehl mk-live nicht eingerichtet: Ordner %s zum PATH hinzufügen oder "
                "\"%s\" aufrufen." % (BIN_CMD.parent, BIN_CMD))
    say("")
    say("Weiter: mk-live doctor \"<Projektordner>\", dann mk-live start \"<Projektordner>\".")
    say("Knopf in Desktop (einmal, als Administrator): mk-live register-tool")
    return 1 if any(c["state"] == "red" for c in rep.checks) else 0


# --------------------------------------------------------------------------- CLI
def build_parser() -> argparse.ArgumentParser:
    ap = argparse.ArgumentParser(prog="mk-live", description="MockupKitchen live · Live-Helfer",
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("setup", help="einmal einrichten")
    s.add_argument("--no-pip", action="store_true", help="fehlende Pakete nicht installieren")
    s.add_argument("--no-shim", action="store_true", help="Befehl mk-live nicht einrichten")
    s = sub.add_parser("doctor", help="Ampel für ein Projekt")
    s.add_argument("project", nargs="?", default=None)
    s.add_argument("--json", action="store_true", help="JSON statt Text")
    s.add_argument("--no-write", action="store_true", help="mockup/doctor.json nicht schreiben")
    s = sub.add_parser("start", help="Runner losgelöst starten, Kitchen öffnen")
    s.add_argument("project")
    s.add_argument("--open-kitchen", default=None, metavar="URL")
    s.add_argument("--pin-pid", type=int, default=None)
    s.add_argument("--no-browser", action="store_true")
    s.add_argument("--force", action="store_true", help="trotz roter Ampel starten")
    s.add_argument("--wait", type=float, default=20.0,
                   help="Sekunden, die start auf den ersten Herzschlag wartet")
    s.add_argument("--replace-timeout", type=float, default=60.0,
                   help="Sekunden, die start auf das Ende eines anders festgenagelten Helfers "
                        "wartet (Start mit --pin-pid)")
    s.add_argument("--launcher", default=None, help=argparse.SUPPRESS)
    s = sub.add_parser("stop", help="Runner beenden")
    s.add_argument("project", nargs="?", default=None)
    s.add_argument("--timeout", type=float, default=20.0)
    s.add_argument("--force", action="store_true",
                   help="nach dem Zeitlimit den Runner-Prozess beenden (nur live_runner.py)")
    s = sub.add_parser("diag", help="Diagnose-ZIP (ohne Bilder, Pfade gekürzt)")
    s.add_argument("project")
    s.add_argument("--out", default=None)
    s.add_argument("--with-images", action="store_true",
                   help="auch Bilder des letzten Deploys und die Konverter-Ausgabe einpacken "
                        "(echte Daten)")
    s = sub.add_parser("register-tool", help="External Tools: Knopf in Desktop")
    s.add_argument("--target-dir", default=None)
    s.add_argument("--dry-run", action="store_true")
    sub.add_parser("_spawn", help=argparse.SUPPRESS)
    return ap


def main(argv=None) -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            if stream is not None:
                stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:                        # noqa: BLE001
            pass
    argv = list(sys.argv[1:] if argv is None else argv)
    extra = []
    if argv and argv[0] == "start" and "--" in argv:   # start … -- <Runner-Optionen>
        i = argv.index("--")
        argv, extra = argv[:i], argv[i + 1:]
    args = build_parser().parse_args(argv)
    args.runner_args = extra
    handler = {"setup": cmd_setup, "doctor": cmd_doctor, "start": cmd_start, "stop": cmd_stop,
               "diag": cmd_diag, "register-tool": cmd_register_tool, "_spawn": cmd_spawn}
    return handler[args.cmd](args)


if __name__ == "__main__":
    raise SystemExit(main())
