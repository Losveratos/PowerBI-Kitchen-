#!/usr/bin/env python3
"""Kitchen-Custom-Visuals in einen PBIR-Bericht installieren (Paket A, MockupKitchen live).

Bildet nach, was Power BI Desktop beim Import einer .pbiviz in einen PBIP-Bericht schreibt:

    <Report>.Report/
      CustomVisuals/<guid>/package.json                     (gekürzt: resources, visual.guid, metadata)
      CustomVisuals/<guid>/resources/<guid>.pbiviz.json     (aus dem Zip, neu serialisiert)
      definition/report.json  -> resourcePackages[]  {name: <guid>, type: CustomVisual,
                                  items: [{name: "resources/<guid>.pbiviz.json",
                                           path: "<guid>.pbiviz.json",
                                           type: "CustomVisualMetadata"}]}

Desktop serialisiert die Dateien unter CustomVisuals/ mit 2er-Einrückung, CRLF, ohne BOM und
ersetzt dabei jedes Nicht-ASCII-Zeichen durch "?" (je UTF-16-Codeeinheit, verlustbehaftet).
Standard hier: gleiche Form, aber Nicht-ASCII als \\uXXXX-Escape (rein ASCII und verlustfrei).
encoding="desktop" erzeugt byteidentische Dateien wie Desktop (nur für Vergleiche).

pbir hat (Stand Okt. 2026) keinen Befehl dafür; dieses Modul ist die bewusste Ausnahme von
"kein Berichts-JSON von Hand". Danach immer `pbir validate <Report> --all`.
report.json darf nur bei geschlossenem Desktop geändert werden (Desktop überschreibt sonst
beim Speichern bzw. sieht die Registrierung erst nach Neustart).

CLI:
    python visuals_install.py catalog
    python visuals_install.py installed <Report-Ordner>
    python visuals_install.py install <Report-Ordner> <name|pfad.pbiviz> [--dry-run] [--encoding desktop]
"""
from __future__ import annotations

import json
import os
import re
import shutil
import sys
import tempfile
import zipfile
from pathlib import Path

# Kitchen-Name -> Projektordner im Repo (dist/ darunter)
KITCHEN_VISUALS: dict[str, str] = {
    "chartkitchen": "ibcsInspiredChartDeck",
    "gantt": "dataKitchenGantt",
    "pnl": "pnlByDatenWG",
    "kpicard": "ibcsKpiCard",
    "pnlwaterfall": "ibcsPnLWaterfall",
    "zugkpi": "zugKpi",
}

_GUID_RX = re.compile(r"^[A-Za-z0-9_]+$")
_FILE_RX = re.compile(r"^(?P<guid>[A-Za-z0-9_]+)\.(?P<ver>\d+(?:\.\d+){1,3})\.pbiviz$")


# --------------------------------------------------------------------------- Hilfen
def _ver_tuple(v: str | None) -> tuple[int, ...]:
    try:
        return tuple(int(x) for x in (v or "0").split("."))
    except ValueError:
        return (0,)


def _dump_cv(obj, encoding: str) -> bytes:
    """Serialisierung wie Desktop für Dateien unter CustomVisuals/ (indent 2, CRLF, kein BOM)."""
    if encoding == "desktop":
        txt = json.dumps(obj, indent=2, ensure_ascii=False)
        txt = "".join(c if ord(c) < 128 else ("??" if ord(c) > 0xFFFF else "?") for c in txt)
    else:
        txt = json.dumps(obj, indent=2, ensure_ascii=True)
    return txt.replace("\n", "\r\n").encode("ascii")


def _read_pkg(zf: zipfile.ZipFile) -> dict:
    return json.loads(zf.read("package.json").decode("utf-8-sig"))


def _repo_roots(repo_root: Path) -> list[Path]:
    """Repo-Wurzel plus, falls es ein Git-Worktree ist, der Haupt-Checkout (dort liegen
    teils ungetrackte dist-Ordner, z. B. ibcsPnLWaterfall, zugKpi)."""
    roots = [repo_root]
    git = repo_root / ".git"
    if git.is_file():
        m = re.match(r"gitdir:\s*(.+)", git.read_text(encoding="utf-8").strip())
        if m:
            gd = Path(m.group(1).strip())
            if not gd.is_absolute():
                gd = (repo_root / gd).resolve()
            # <main>/.git/worktrees/<name>
            if gd.parent.name == "worktrees":
                main = gd.parent.parent.parent
                if main.exists() and main.resolve() != repo_root.resolve():
                    roots.append(main)
    extra = os.environ.get("KITCHEN_VISUALS_ROOTS")
    if extra:
        roots += [Path(p) for p in extra.split(os.pathsep) if p]
    return roots


def _default_repo_root() -> Path:
    return Path(__file__).resolve().parents[2]  # mockup-live/agent/ -> Repo


# --------------------------------------------------------------------------- Katalog
def catalog(repo_root: str | Path | None = None) -> dict[str, dict]:
    """Kitchen-Name -> neueste .pbiviz {guid, version, path, displayName, apiVersion}.
    Sucht <root>/<Projekt>/dist/*.pbiviz in Repo und ggf. Haupt-Checkout; Version und GUID
    kommen aus package.json im Zip (Dateiname nur als Plausibilitätscheck)."""
    root = Path(repo_root) if repo_root else _default_repo_root()
    out: dict[str, dict] = {}
    for name, folder in KITCHEN_VISUALS.items():
        best = None
        for r in _repo_roots(root):
            for p in sorted((r / folder / "dist").glob("*.pbiviz")):
                try:
                    with zipfile.ZipFile(p) as zf:
                        pkg = _read_pkg(zf)
                except (zipfile.BadZipFile, KeyError, json.JSONDecodeError):
                    continue
                vis = pkg.get("visual", {})
                cand = {
                    "guid": vis.get("guid"),
                    "version": vis.get("version") or pkg.get("version"),
                    "displayName": vis.get("displayName"),
                    "path": str(p),
                }
                if best is None or _ver_tuple(cand["version"]) > _ver_tuple(best["version"]):
                    best = cand
        if best:
            out[name] = best
    return out


def resolve(name_or_path: str, repo_root: str | Path | None = None) -> Path:
    """Kitchen-Name (catalog) oder Pfad zu einer .pbiviz -> Pfad."""
    p = Path(name_or_path)
    if p.suffix.lower() == ".pbiviz" and p.exists():
        return p
    cat = catalog(repo_root)
    key = name_or_path.lower()
    if key in cat:
        return Path(cat[key]["path"])
    for v in cat.values():  # auch per GUID
        if v["guid"] == name_or_path:
            return Path(v["path"])
    raise FileNotFoundError(f"Kein Kitchen-Visual/pbiviz gefunden: {name_or_path} (bekannt: {', '.join(cat)})")


# --------------------------------------------------------------------------- report.json
def _report_json_path(report_dir: Path) -> Path:
    p = report_dir / "definition" / "report.json"
    if not p.exists():
        raise FileNotFoundError(f"Kein PBIR-Bericht (definition/report.json fehlt): {report_dir}")
    return p


def _resource_entry(guid: str, resources: list[dict]) -> dict:
    items = []
    for res in resources:
        f = res["file"]  # "resources/<guid>.pbiviz.json"
        items.append({"name": f, "path": Path(f).name, "type": "CustomVisualMetadata"})
    return {"name": guid, "type": "CustomVisual", "items": items}


def _write_report_json(path: Path, data: dict, original: str) -> None:
    nl = "\r\n" if "\r\n" in original else "\n"
    txt = json.dumps(data, indent=2, ensure_ascii=False).replace("\n", nl)
    if original.endswith(("\n", "\r\n")):
        txt += nl
    bom = original.startswith("﻿")
    path.write_bytes((("﻿" if bom else "") + txt).encode("utf-8"))


# --------------------------------------------------------------------------- installed
def installed(report_dir: str | Path) -> list[dict]:
    """Installierte Custom Visuals: GUID, Version, Anzeigename, registriert/Ordner vorhanden."""
    report_dir = Path(report_dir)
    rj = json.loads(_report_json_path(report_dir).read_text(encoding="utf-8-sig"))
    registered = {p.get("name") for p in rj.get("resourcePackages", []) if p.get("type") == "CustomVisual"}
    guids = set(registered)
    cv = report_dir / "CustomVisuals"
    if cv.is_dir():
        guids |= {d.name for d in cv.iterdir() if d.is_dir()}
    out = []
    for g in sorted(guids):
        info = {"guid": g, "version": None, "displayName": None,
                "registered": g in registered, "folder": (cv / g).is_dir()}
        mf = cv / g / "resources" / f"{g}.pbiviz.json"
        if mf.exists():
            try:
                vis = json.loads(mf.read_text(encoding="utf-8-sig", errors="replace")).get("visual", {})
                info["version"], info["displayName"] = vis.get("version"), vis.get("displayName")
            except json.JSONDecodeError:
                info["version"] = "?"
        out.append(info)
    return out


# --------------------------------------------------------------------------- install
def install(report_dir: str | Path, pbiviz_path: str | Path, *, encoding: str = "escape",
            dry_run: bool = False) -> dict:
    """Installiert/aktualisiert eine .pbiviz im Bericht. Idempotent.

    Rückgabe: {guid, version, previous_version, action, files_changed, report_json_changed}
    action: "installed" | "upgraded" | "downgraded" | "repaired" | "unchanged".
    Desktop muss geschlossen sein (der Aufrufer prüft das)."""
    report_dir = Path(report_dir)
    pbiviz_path = Path(pbiviz_path)
    rj_path = _report_json_path(report_dir)

    with zipfile.ZipFile(pbiviz_path) as zf:
        pkg = _read_pkg(zf)
        guid = pkg.get("visual", {}).get("guid")
        if not guid or not _GUID_RX.match(guid):
            raise ValueError(f"Ungültige oder fehlende GUID in {pbiviz_path}: {guid!r}")
        resources = pkg.get("resources") or []
        if not resources:
            raise ValueError(f"package.json ohne resources: {pbiviz_path}")
        files: dict[str, bytes] = {}
        version = None
        for res in resources:
            rel = res["file"].replace("\\", "/")
            if rel.startswith("/") or ".." in rel.split("/"):
                raise ValueError(f"Unsicherer Ressourcenpfad: {rel}")
            obj = json.loads(zf.read(rel).decode("utf-8-sig"))
            vis = obj.get("visual", {})
            if vis.get("guid") and vis["guid"] != guid:
                raise ValueError(f"GUID-Konflikt package.json {guid} vs. {rel} {vis['guid']}")
            version = vis.get("version") or version
            files[rel] = _dump_cv(obj, encoding)
    version = version or pkg.get("version")
    files["package.json"] = _dump_cv(
        {"resources": resources, "visual": {"guid": guid}, "metadata": pkg.get("metadata", {})}, encoding)

    target = report_dir / "CustomVisuals" / guid
    prev = next((i for i in installed(report_dir) if i["guid"] == guid), None)
    prev_version = prev["version"] if prev else None

    # Dateien vergleichen
    existing = {}
    if target.is_dir():
        for f in target.rglob("*"):
            if f.is_file():
                existing[f.relative_to(target).as_posix()] = f.read_bytes()
    files_changed = sorted(k for k in set(files) | set(existing) if files.get(k) != existing.get(k))

    # report.json
    raw_original = rj_path.read_bytes().decode("utf-8")
    rj = json.loads(raw_original.lstrip("﻿"))
    pkgs = rj.setdefault("resourcePackages", [])
    want = _resource_entry(guid, resources)
    idx = next((i for i, p in enumerate(pkgs) if p.get("name") == guid and p.get("type") == "CustomVisual"), None)
    if idx is None:
        pkgs.append(want)
        rj_changed = True
    else:
        rj_changed = pkgs[idx] != want
        pkgs[idx] = want

    if prev is None or not prev["folder"]:
        action = "installed" if prev is None else "repaired"
    elif _ver_tuple(version) > _ver_tuple(prev_version):
        action = "upgraded"
    elif _ver_tuple(version) < _ver_tuple(prev_version):
        action = "downgraded"
    else:
        action = "repaired" if (files_changed or rj_changed) else "unchanged"

    result = {"guid": guid, "version": version, "previous_version": prev_version, "action": action,
              "files_changed": files_changed, "report_json_changed": rj_changed,
              "target": str(target), "dry_run": dry_run}
    if dry_run or (not files_changed and not rj_changed):
        return result

    if files_changed:
        # in Temp-Ordner neben dem Ziel aufbauen, dann austauschen (keine Altdateien übrig)
        target.parent.mkdir(parents=True, exist_ok=True)
        tmp = Path(tempfile.mkdtemp(prefix=f".{guid}.", dir=target.parent))
        try:
            for rel, data in files.items():
                dst = tmp / rel
                dst.parent.mkdir(parents=True, exist_ok=True)
                dst.write_bytes(data)
            if target.exists():
                shutil.rmtree(target)
            tmp.rename(target)
        finally:
            if tmp.exists():
                shutil.rmtree(tmp, ignore_errors=True)
    if rj_changed:
        _write_report_json(rj_path, rj, raw_original)
    return result


def install_many(report_dir: str | Path, names: list[str], **kw) -> list[dict]:
    return [install(report_dir, resolve(n), **kw) for n in names]


# --------------------------------------------------------------------------- CLI
def _main(argv: list[str]) -> int:
    if not argv or argv[0] in ("-h", "--help"):
        print(__doc__)
        return 0
    cmd, rest = argv[0], argv[1:]
    if cmd == "catalog":
        print(json.dumps(catalog(), indent=2, ensure_ascii=False))
    elif cmd == "installed" and rest:
        print(json.dumps(installed(rest[0]), indent=2, ensure_ascii=False))
    elif cmd == "install" and len(rest) >= 2:
        enc = rest[rest.index("--encoding") + 1] if "--encoding" in rest else "escape"
        res = install(rest[0], resolve(rest[1]), encoding=enc, dry_run="--dry-run" in rest)
        print(json.dumps(res, indent=2, ensure_ascii=False))
    else:
        print(__doc__)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(_main(sys.argv[1:]))
