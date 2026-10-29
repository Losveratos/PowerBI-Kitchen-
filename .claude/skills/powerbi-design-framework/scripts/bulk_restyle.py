#!/usr/bin/env python3
"""Bulk-Restyle & Design-Linter für Power-BI-PBIR-Reports.

Arbeitet auf `*.Report/definition/pages/*/visuals/*/visual.json` und ändert
NUR Container-Formatierung (Schatten, Hintergrund, Rahmen/Ecken) unter
`visual.visualContainerObjects` — nie Query/Feldbindungen. Sicherheitsmodell:

  * Default ist DRY-RUN: zeigt geplante Änderungen, schreibt nichts.
  * --apply schreibt — vorher wird jede geänderte Datei nach
    design-out/backup-<zeit>/ gesichert (Git-Commit vorher trotzdem empfohlen).
  * Power BI Desktop muss dabei GESCHLOSSEN sein (hält sonst die Dateien).

Modi:
  Restyle:  bulk_restyle.py <Report-Pfad> --preset modern-soft [--apply]
            bulk_restyle.py <Report-Pfad> --rules rules.json [--apply]
  Strip:    bulk_restyle.py <Report-Pfad> --strip dropShadow,border [--apply]
            (entfernt manuelle Overrides, damit wieder das THEME greift —
             die nachhaltigste Bulk-Änderung)
  Linter:   bulk_restyle.py <Report-Pfad> --check [--zones zones.json]

Presets:
  modern-soft  Schatten aus, Kachel-Hintergrund weiß, zarte Kontur, Radius 8
  ibcs         Schatten aus, Hintergrund weiß, kein Rahmen, Radius 0

rules.json-Format (überschreibt/ergänzt das Preset; gleiche Objekt-Reihenfolge):
  { "set": [ {"object": "dropShadow", "property": "show", "value": false},
             {"object": "border", "property": "radius", "value": 8},
             {"object": "background", "property": "color",
              "value": "#FFFFFF", "kind": "fill"} ] }

zones.json-Format (für --check; kommt aus dem AGENT-BRIEF):
  { "content": [16, 72, 1032, 616], "ignorePages": ["_Design-System"] }

PBIR-Fakten, auf denen das Skript beruht (verifiziert):
  * Container-Formatierung liegt in `visual.visualContainerObjects`;
    dieselben Properties unter `visual.objects` werden STILL ignoriert,
    `visualContainerObjects` auf Root-Ebene ist ein Fehler.
  * Literal-Kodierung: {"expr":{"Literal":{"Value": …}}} mit
    Bool "true"/"false" · Double "14D" (u. a. fontSize) · Integer "50L"
    (u. a. Pixel, transparency) · String "'…'" (innere ' verdoppelt).
    Wo der Report selbst schon ein Beispiel für eine Property enthält,
    wird dessen Suffix übernommen (replizieren statt raten).
"""
from __future__ import annotations

import argparse
import copy
import json
import re
import shutil
import sys
import time
from pathlib import Path

FILL_PROPERTIES = {"color"}  # als Fill { solid: { color } } kodierte Properties

# Suffix je Property, falls der Report kein eigenes Beispiel enthält
# (D = Double, L = Integer, "" = ohne). Quelle: PBIR-Beispiele/Schema.
NUMBER_SUFFIX_DEFAULTS = {"fontSize": "D", "transparency": "L", "radius": "L"}
NUMBER_SUFFIX_FALLBACK = "D"

PRESETS = {
    "modern-soft": [
        {"object": "dropShadow", "property": "show", "value": False},
        {"object": "background", "property": "show", "value": True},
        {"object": "background", "property": "color", "value": "#FFFFFF", "kind": "fill"},
        {"object": "background", "property": "transparency", "value": 0},
        {"object": "border", "property": "show", "value": True},
        {"object": "border", "property": "color", "value": "#E5E7EB", "kind": "fill"},
        {"object": "border", "property": "radius", "value": 8},
    ],
    "ibcs": [
        {"object": "dropShadow", "property": "show", "value": False},
        {"object": "background", "property": "show", "value": True},
        {"object": "background", "property": "color", "value": "#FFFFFF", "kind": "fill"},
        {"object": "border", "property": "show", "value": False},
        {"object": "border", "property": "radius", "value": 0},
    ],
}


# ---------- PBIR lesen ----------

def find_report_dir(root: Path) -> Path:
    if root.name.endswith(".Report") and (root / "definition").is_dir():
        return root
    hits = sorted(p for p in root.glob("*.Report") if (p / "definition").is_dir())
    if len(hits) == 1:
        return hits[0]
    if not hits:
        sys.exit(f"Kein *.Report/definition unter {root} gefunden — PBIP-Format nötig.")
    sys.exit("Mehrere *.Report-Ordner gefunden — bitte einen direkt angeben:\n  "
             + "\n  ".join(str(h) for h in hits))


def load_pages(report: Path) -> list[dict]:
    pages = []
    for page_json in sorted(report.glob("definition/pages/*/page.json")):
        try:
            meta = json.loads(page_json.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            sys.exit(f"Kaputtes JSON in {page_json}: {e}")
        visuals = []
        for vj in sorted(page_json.parent.glob("visuals/*/visual.json")):
            try:
                visuals.append((vj, json.loads(vj.read_text(encoding="utf-8"))))
            except json.JSONDecodeError as e:
                sys.exit(f"Kaputtes JSON in {vj}: {e}")
        pages.append({
            "folder": page_json.parent,
            "name": meta.get("name", page_json.parent.name),
            "displayName": meta.get("displayName", page_json.parent.name),
            "visuals": visuals,
        })
    if not pages:
        sys.exit(f"Keine Seiten unter {report}/definition/pages gefunden.")
    return pages


def visual_type(v: dict) -> str:
    if "visualGroup" in v:
        return "<gruppe>"
    return (v.get("visual") or {}).get("visualType", "<unbekannt>")


def container_objects(v: dict, create: bool = False) -> dict | None:
    """`visual.visualContainerObjects` — der einzige Ort, an dem
    Container-Formatierung wirkt (objects: wirkungslos; Root: Fehler)."""
    vis = v.get("visual")
    if not isinstance(vis, dict):
        return None
    objs = vis.get("visualContainerObjects")
    if isinstance(objs, dict):
        return objs
    if create:
        vis["visualContainerObjects"] = {}
        return vis["visualContainerObjects"]
    return None


# ---------- Literal-Kodierung ----------

def learn_number_suffixes(pages) -> dict[str, str]:
    """Suffix je Property aus vorhandenen visual.json lernen ('14D' → D)."""
    learned: dict[str, str] = {}
    rx = re.compile(r'"(\w+)"\s*:\s*\{\s*"expr"\s*:\s*\{\s*"Literal"\s*:\s*'
                    r'\{\s*"Value"\s*:\s*"(-?\d+(?:\.\d+)?)([DLM]?)"')
    for pg in pages:
        for path, _ in pg["visuals"]:
            for prop, _num, suf in rx.findall(path.read_text(encoding="utf-8")):
                learned.setdefault(prop, suf)
    return learned


def encode_literal(prop: str, value, suffixes: dict[str, str]) -> dict:
    if isinstance(value, bool):
        raw = "true" if value else "false"
    elif isinstance(value, (int, float)):
        suf = suffixes.get(prop, NUMBER_SUFFIX_DEFAULTS.get(prop, NUMBER_SUFFIX_FALLBACK))
        raw = f"{value:g}{suf}"
    else:
        raw = "'" + str(value).replace("'", "''") + "'"
    return {"expr": {"Literal": {"Value": raw}}}


def encode_value(rule: dict, suffixes: dict[str, str]) -> dict:
    lit = encode_literal(rule["property"], rule["value"], suffixes)
    if rule.get("kind") == "fill" or (rule["property"] in FILL_PROPERTIES
                                      and isinstance(rule["value"], str)):
        return {"solid": {"color": lit}}
    return lit


# ---------- Restyle ----------

def apply_rules(v: dict, rules: list[dict], suffixes: dict[str, str]) -> list[str]:
    if "visual" not in v:  # Gruppen haben keine Container-Formatierung
        return []
    objs = container_objects(v, create=bool(rules))
    if objs is None:
        return []
    changes = []
    for rule in rules:
        obj_name, prop = rule["object"], rule["property"]
        entries = objs.setdefault(obj_name, [])
        if not entries:
            entries.append({"properties": {}})
        props = entries[0].setdefault("properties", {})
        new = encode_value(rule, suffixes)
        if props.get(prop) != new:
            props[prop] = new
            changes.append(f"{obj_name}.{prop} = {rule['value']!r}")
    return changes


def strip_objects(v: dict, names: list[str]) -> list[str]:
    objs = container_objects(v)
    if not objs:
        return []
    changes = []
    for n in names:
        if n in objs:
            del objs[n]
            changes.append(f"{n}: Override entfernt (Theme greift wieder)")
    return changes


# ---------- Linter ----------

LITERAL_NUM_RX = re.compile(r"^-?\d+(?:\.\d+)?")


def literal_value(node) -> str | None:
    try:
        return node["expr"]["Literal"]["Value"]
    except (KeyError, TypeError):
        return None


def literal_number(node) -> float | None:
    raw = literal_value(node)
    if raw is None:
        return None
    m = LITERAL_NUM_RX.match(raw)
    return float(m.group(0)) if m else None


def walk_properties(node):
    """Alle (property_name, wert)-Paare unter allen 'properties'-Blöcken."""
    if isinstance(node, dict):
        for k, val in node.items():
            if k == "properties" and isinstance(val, dict):
                for pname, pval in val.items():
                    yield pname, pval
            yield from walk_properties(val)
    elif isinstance(node, list):
        for item in node:
            yield from walk_properties(item)


def lint_visual(v: dict, args, zones) -> list[str]:
    issues = []
    pos = v.get("position", {})
    if args.grid:
        off = [f"{k}={pos[k]:g}" for k in ("x", "y", "width", "height")
               if isinstance(pos.get(k), (int, float)) and round(pos[k]) % args.grid]
        if off:
            issues.append(f"nicht auf {args.grid}-px-Raster: {', '.join(off)}")
    if zones and "content" in zones:
        cx, cy, cw, ch = zones["content"]
        x, y = pos.get("x", 0), pos.get("y", 0)
        w, h = pos.get("width", 0), pos.get("height", 0)
        if x < cx or y < cy or x + w > cx + cw or y + h > cy + ch:
            issues.append(f"ragt aus der Content-Zone {zones['content']} heraus "
                          f"(x={x:g}, y={y:g}, w={w:g}, h={h:g})")
    if args.require_taborder and "visual" in v and "tabOrder" not in pos:
        issues.append("kein tabOrder gesetzt (Lese-Reihenfolge/Accessibility)")
    allowed_fonts = ({f.strip().lower() for f in args.fonts.split(",")}
                     if args.fonts else None)
    for pname, pval in walk_properties(v):
        if pname == "fontSize":
            n = literal_number(pval)
            if n is not None and n < args.min_font:
                issues.append(f"fontSize {n:g} pt < Minimum {args.min_font:g} pt")
        elif allowed_fonts and pname == "fontFamily":
            raw = literal_value(pval)
            if raw is None:
                continue
            fam = raw.strip("'").split(",")[0].strip().strip("'")
            if fam.lower() not in allowed_fonts:
                issues.append(f"fontFamily '{fam}' nicht in erlaubter Liste")
    objs = container_objects(v) or {}
    shadow = objs.get("dropShadow") or []
    if shadow:
        raw = literal_value((shadow[0].get("properties") or {}).get("show"))
        if raw != "false":  # dropShadow-Objekt ohne show=false ⇒ Schatten aktiv
            issues.append("dropShadow aktiv (Spec: keine Schatten)")
    return issues


# ---------- main ----------

def main() -> int:
    p = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("report", help="Pfad zum *.Report-Ordner oder PBIP-Projektordner")
    p.add_argument("--preset", choices=sorted(PRESETS))
    p.add_argument("--rules", help="rules.json mit zusätzlichen/eigenen set-Regeln")
    p.add_argument("--strip", help="Container-Objekte entfernen, z. B. 'dropShadow,border'")
    p.add_argument("--check", action="store_true", help="Linter-Modus (schreibt nie)")
    p.add_argument("--zones", help="zones.json für Content-Zonen-Check")
    p.add_argument("--pages", help="nur diese Seiten (displayName, kommagetrennt)")
    p.add_argument("--skip-types", default="", help="Visual-Typen auslassen (z. B. 'slicer,image')")
    p.add_argument("--grid", type=int, default=8, help="Raster für --check (0 = aus)")
    p.add_argument("--min-font", type=float, default=9, help="Mindest-Schriftgröße für --check")
    p.add_argument("--fonts", default="", help="erlaubte fontFamily-Liste für --check")
    p.add_argument("--require-taborder", action="store_true",
                   help="--check: Visuals ohne tabOrder melden")
    p.add_argument("--apply", action="store_true", help="Änderungen wirklich schreiben")
    args = p.parse_args()

    report = find_report_dir(Path(args.report).resolve())
    pages = load_pages(report)

    zones = None
    ignore_pages: set[str] = set()
    if args.zones:
        zones = json.loads(Path(args.zones).read_text(encoding="utf-8"))
        ignore_pages = set(zones.get("ignorePages", []))
    page_filter = ({s.strip() for s in args.pages.split(",")} if args.pages else None)
    skip_types = {s.strip().lower() for s in args.skip_types.split(",") if s.strip()}

    def selected(pg) -> bool:
        if page_filter and pg["displayName"] not in page_filter and pg["name"] not in page_filter:
            return False
        return pg["displayName"] not in ignore_pages

    # ---- Linter ----
    if args.check:
        total = 0
        for pg in pages:
            if not selected(pg):
                continue
            for path, v in pg["visuals"]:
                if visual_type(v).lower() in skip_types:
                    continue
                for issue in lint_visual(v, args, zones):
                    total += 1
                    print(f"[{pg['displayName']}] {path.parent.name} "
                          f"({visual_type(v)}): {issue}")
        print(f"\n{total} Verstoß/Verstöße." if total else "Alles sauber ✓")
        return 1 if total else 0

    # ---- Restyle / Strip ----
    rules: list[dict] = list(PRESETS.get(args.preset, []))
    if args.rules:
        rules += json.loads(Path(args.rules).read_text(encoding="utf-8")).get("set", [])
    strip_names = [s.strip() for s in args.strip.split(",")] if args.strip else []
    if not rules and not strip_names:
        p.error("Nichts zu tun: --preset, --rules, --strip oder --check angeben.")

    suffixes = learn_number_suffixes(pages)
    planned: list[tuple[Path, dict, list[str]]] = []
    for pg in pages:
        if not selected(pg):
            continue
        for path, v in pg["visuals"]:
            if visual_type(v).lower() in skip_types:
                continue
            work = copy.deepcopy(v)
            changes = strip_objects(work, strip_names) if strip_names else []
            changes += apply_rules(work, rules, suffixes)
            if changes:
                planned.append((path, work, [f"[{pg['displayName']}] {c}" for c in changes]))

    if not planned:
        print("Keine Änderungen nötig — alles entspricht bereits den Regeln.")
        return 0

    for path, _, changes in planned:
        print(f"{path.relative_to(report)}:")
        for c in changes:
            print(f"  {c}")

    if not args.apply:
        print(f"\nDRY-RUN: {len(planned)} Datei(en) WÜRDEN geändert. "
              "Mit --apply schreiben (Desktop vorher schließen, Git-Commit empfohlen).")
        return 0

    backup = report.parent / "design-out" / f"backup-{time.strftime('%Y%m%d-%H%M%S')}"
    for path, work, _ in planned:
        dest = backup / path.relative_to(report)
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, dest)
        path.write_text(json.dumps(work, indent=2, ensure_ascii=False) + "\n",
                        encoding="utf-8")
    print(f"\n{len(planned)} Datei(en) geschrieben. Backup: {backup}\n"
          "Jetzt in Power BI Desktop öffnen und verifizieren; bei Problemen "
          "Backup zurückkopieren.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
