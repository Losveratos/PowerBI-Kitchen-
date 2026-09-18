#!/usr/bin/env python3
"""mockup_spec.py — Lesen, Heben und Pruefen einer MockupKitchen-Spec.

Gemeinsamer Unterbau von `mockup_to_pbir.py` (Bericht) und `mockup_to_docs.py`
(Workshop-Doku). Reine Standardbibliothek.

  * `load(pfad)`      liest die JSON-Datei, klare Fehlermeldung statt Traceback
  * `upgrade(spec)`   hebt specVersion 1 und 2 auf die innere Form von v3;
                      v3 bleibt unveraendert. Unbekannte Hauptversion -> SpecError
  * `validate(spec)`  prueft gegen `references/mockup-spec.schema.json`
                      (nutzt das Paket `jsonschema`, wenn installiert, sonst
                      einen kompakten eigenen Validator fuer die hier
                      benoetigten Konstrukte). Ergebnis: Liste von Meldungen
                      mit Feldpfad.
  * `structural_errors(spec)` prueft, was ein Schema nicht kann: doppelte
                      Seitennamen, doppelte Visualnamen je Seite, Links ins
                      Leere, Slicer-Refs.

Quelle der Wahrheit fuer die Spec ist `assets/mockup/export.js` (buildSpec).
"""

from __future__ import annotations

import json
import os
import re
import unicodedata
from pathlib import Path

SUPPORTED_SPEC_VERSION = 3
SCHEMA_PATH = Path(__file__).resolve().parent.parent / "references" / "mockup-spec.schema.json"


class SpecError(Exception):
    """Spec ist nicht lesbar oder nicht unterstuetzt (kein Traceback noetig)."""


# --------------------------------------------------------------------------- #
# Vokabular (Quelle: assets/mockup/catalog.js, chartkitchen-report/field-contract)
# --------------------------------------------------------------------------- #
CK_ROLE = {
    "category": "category",
    "subcategory": "colgroup",
    "series": "series",
    "ac": "actual",
    "indicator": "actual",
    "goal": "plan",
    "fc": "fcFlag",
    "rows": "category",
    "columns": "colgroup",
    "values": "actual",
}
CK_ROLE_UNSUPPORTED = {"x", "y", "size", "start", "end", "field", "text"}

CK_ORIENTATION = {
    "columns": "columns", "kombi": "columns", "colline": "columns",
    "absvar": "columns", "relvar": "columns", "stackcol": "columns",
    "multiples": "columns",
    "bars": "bars", "barskombi": "bars", "bullet": "bars", "tornado": "bars",
    "stackbar": "bars",
    "dotplot": "dumbbell", "pareto": "pareto",
    "line": "line", "fan": "line", "zchart": "line",
    "slope": "slope",
    "varint": "intwaterfall", "wfint": "intwaterfall",
    "waterfall": "waterfall", "wfkombi": "waterfall",
    "bridge": "catbridge",
    "kpi": "cards",
    "table": "table", "sparktable": "table", "heatmap": "table",
}

# Rollen, aus denen sich das Drill-through-Feld einer Quellkachel ergibt
DRILL_ROLE_ORDER = ("category", "rows", "subcategory", "series")
# Rollen, aus denen sich die fuehrende Kennzahl ergibt (Sortierung, Top-N)
MEASURE_ROLE_ORDER = ("ac", "indicator", "values", "y", "size", "ref", "goal")

DEFAULT_DESIGN = {
    "cornerRadius": 0,
    "tileStyle": "border",
    "pageBackground": "#F4F4F1",
    "tileBackground": "#FFFFFF",
    "headerStyle": "dark",     # v1 kannte keinen Stil; das Kopfband war Ink
    "accent": "#C25A2D",
    "darkMode": False,
    "fontScale": 1.0,
}

DEFAULT_REPORT = {"name": "", "audience": "", "purpose": "", "decision": "",
                  "participants": "", "version": "0.1", "dataDate": ""}

DEFAULT_ANALYSIS = {
    "polarity": "higher", "polarityAuto": True,
    "deltaBasis": None, "deltaBasisAuto": True, "deltaKind": ["abs", "rel"],
    "unit": None, "displayUnits": None, "decimals": None,
    "sort": None, "topN": None, "timeGrain": None, "cumulative": False,
    "scaleGroup": None, "message": None,
}
DEFAULT_WORKSHOP = {"priority": None, "status": "open", "openQuestion": False}

# Kennzahl-Namen, die „kleiner ist besser" bedeuten (wie CAT.polarityFor)
LOWER_IS_BETTER = re.compile(
    r"kosten|aufwand|ausschuss|fehler|reklamation|storno|retour|cost|expense|"
    r"defect|churn|complaint|waste|krank|abwesen", re.I)


# --------------------------------------------------------------------------- #
# Helfer
# --------------------------------------------------------------------------- #
def slug(text, limit: int = 40) -> str:
    """Identisch zur slug()-Funktion in assets/mockup/export.js."""
    s = unicodedata.normalize("NFD", str(text or "seite"))
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"[^A-Za-z0-9]+", "_", s).strip("_")[:limit]
    return s or "Seite"


def split_ref(ref: str) -> tuple:
    """`Tabelle.Feld` -> (Tabelle, Feld). Punkte im Feldnamen bleiben beim Feld."""
    table, _, field = str(ref).partition(".")
    return table, field


def fnv1a(text: str) -> str:
    """FNV-1a wie fnv() in export.js — ueber UTF-16-Codeeinheiten (charCodeAt)."""
    h = 0x811C9DC5
    for ch in text:
        o = ord(ch)
        units = [o]
        if o > 0xFFFF:                       # JS liefert hier zwei Surrogate
            o -= 0x10000
            units = [0xD800 + (o >> 10), 0xDC00 + (o & 0x3FF)]
        for u in units:
            h ^= u
            h = (h * 0x01000193) & 0xFFFFFFFF
    return ("0000000" + format(h, "x"))[-8:]


def _canon(obj) -> str:
    """Kanonische Serialisierung wie canon() in export.js (JS-JSON-Stil)."""
    if isinstance(obj, list):
        return "[" + ",".join(_canon(o) for o in obj) + "]"
    if isinstance(obj, dict):
        return "{" + ",".join(
            json.dumps(k, ensure_ascii=False) + ":" + _canon(obj[k])
            for k in sorted(obj.keys())) + "}"
    if obj is True:
        return "true"
    if obj is False:
        return "false"
    if obj is None:
        return "null"
    return json.dumps(obj, ensure_ascii=False)


def spec_hash(spec: dict) -> str:
    """FNV-1a ueber den bau-relevanten Kern — gleiche Felder wie export.js."""
    core = {
        "canvas": {"width": (spec.get("canvas") or {}).get("width"),
                   "height": (spec.get("canvas") or {}).get("height")},
        "design": spec.get("design") or {},
        "zones": spec.get("zones") or {},
        "pages": [{
            "name": p.get("name"), "question": p.get("question") or "",
            "visuals": [{"id": v.get("id"), "kind": v.get("kind"),
                         "engine": v.get("engine"), "title": v.get("title"),
                         "content": v.get("content") or "", "rect": v.get("rect"),
                         "roles": v.get("roles") or {},
                         "analysis": v.get("analysis"), "link": v.get("link")}
                        for v in (p.get("visuals") or [])],
        } for p in (spec.get("pages") or [])],
        "fields": spec.get("fields") or [],
        "newFields": spec.get("newFields") or [],
        "links": spec.get("links") or [],
    }
    return fnv1a(_canon(core))


def spec_version(spec: dict) -> int:
    meta = spec.get("meta") or {}
    if meta.get("specVersion"):
        try:
            return int(meta["specVersion"])
        except (TypeError, ValueError):
            raise SpecError("meta.specVersion ist keine Zahl: %r" % meta["specVersion"])
    return 2 if isinstance(spec.get("pages"), list) else 1


def load(path) -> dict:
    p = Path(path).expanduser()
    if not p.is_file():
        raise SpecError("Spec nicht gefunden: %s" % p)
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        raise SpecError("mockup-spec.json ist kein gueltiges JSON: %s (Zeile %d, Spalte %d)"
                        % (e.msg, e.lineno, e.colno))
    if not isinstance(data, dict):
        raise SpecError("mockup-spec.json enthaelt kein Objekt, sondern %s"
                        % type(data).__name__)
    if "zones" not in data or "canvas" not in data:
        raise SpecError("Das sieht nicht nach einer MockupKitchen-Spec aus "
                        "(zones/canvas fehlen).")
    return data


# --------------------------------------------------------------------------- #
# v1/v2 -> v3 heben
# --------------------------------------------------------------------------- #
def _analysis_for(visual: dict) -> dict:
    """Analyse-Vorgaben fuer v1/v2-Kacheln (das Tool kannte den Block noch nicht)."""
    a = dict(DEFAULT_ANALYSIS)
    a["deltaKind"] = ["abs", "rel"]
    scenario = visual.get("scenario") or ""
    for token in ("PL", "PY", "BU", "FC"):
        if re.search(r"\b%s\b" % token, scenario):
            a["deltaBasis"] = token
            break
    roles = visual.get("roles") or {}
    lead = None
    for key in MEASURE_ROLE_ORDER:
        if roles.get(key):
            lead = roles[key][0].get("name") or ""
            break
    name = lead or visual.get("title") or ""
    if LOWER_IS_BETTER.search(str(name)):
        a["polarity"] = "lower"
    return a


def _drill_field_ref(visual: dict):
    roles = (visual or {}).get("roles") or {}
    for key in DRILL_ROLE_ORDER:
        if roles.get(key):
            return roles[key][0].get("ref")
    return None


def _field_record(f: dict) -> dict:
    """Feld auf den v3-Steckbrief heben (leere Felder, nicht erfunden)."""
    out = {"table": f.get("table"), "name": f.get("name"),
           "kind": f.get("kind"), "ref": f.get("ref"),
           "isNew": bool(f.get("isNew"))}
    for key in ("description", "formatString", "dataType", "alias",
                "owner", "source", "target", "unit", "note"):
        out[key] = f.get(key) or ""
    out["renameInModel"] = bool(f.get("renameInModel"))
    out["confirmed"] = bool(f.get("confirmed"))
    return out


def upgrade(raw: dict, page_name_override=None) -> dict:
    """Liefert eine v3-foermige Spec. v3 wird durchgereicht, v1/v2 gehoben."""
    version = spec_version(raw)
    if version > SUPPORTED_SPEC_VERSION:
        raise SpecError(
            "Spec-Version %d wird von diesem Skill nicht unterstuetzt (bekannt: 1-%d). "
            "MockupKitchen ist neuer als der Skill — Skill aktualisieren, nicht raten."
            % (version, SUPPORTED_SPEC_VERSION))
    if version < 1:
        raise SpecError("Spec-Version %d ist ungueltig." % version)

    spec = json.loads(json.dumps(raw))          # tiefe Kopie, Original bleibt
    meta = dict(spec.get("meta") or {})
    canvas = spec.get("canvas") or {}
    zones = spec.get("zones") or {}
    ui_scale = float(canvas.get("uiScale") or 1) or 1.0

    design = dict(DEFAULT_DESIGN)
    design.update({k: v for k, v in (spec.get("design") or {}).items() if v is not None})
    if not (spec.get("design") or {}).get("fontScale"):
        design["fontScale"] = ui_scale
    design["fontScale"] = float(design["fontScale"] or 1) or 1.0

    # ---- Seiten ---------------------------------------------------------- #
    if version >= 2:
        pages = []
        for i, p in enumerate(spec.get("pages") or []):
            pages.append({
                "id": p.get("id") or "p%d" % (i + 1),
                "index": int(p.get("index") or i + 1),
                "name": p.get("name") or "Seite %d" % (i + 1),
                "question": p.get("question") or "",
                "notes": p.get("notes") or "",
                "contentRect": p.get("contentRect") or zones.get("content") or {},
                "visuals": p.get("visuals") or [],
                "layoutTree": p.get("layoutTree"),
            })
        links = spec.get("links") or []
    else:
        name = page_name_override or (spec.get("page") or {}).get("name") or "Seite"
        pages = [{
            "id": "p1", "index": 1, "name": name, "question": "",
            "notes": (spec.get("page") or {}).get("notes") or "",
            "contentRect": zones.get("content") or {},
            "visuals": spec.get("visuals") or [],
            "layoutTree": spec.get("layoutTree"),
        }]
        links = []
        filt = zones.get("filter")
        if filt and not filt.get("mode"):
            filt["mode"] = filt.get("side") or "right"

    if not pages:
        pages = [{"id": "p1", "index": 1, "name": page_name_override or "Seite",
                  "question": "", "notes": "",
                  "contentRect": zones.get("content") or {},
                  "visuals": [], "layoutTree": None}]

    # ---- Kacheln auf v3 heben -------------------------------------------- #
    by_id = {}
    for page in pages:
        for v in page["visuals"]:
            v.setdefault("page", page["name"])
            v.setdefault("link", None)
            v.setdefault("warnings", [])
            v.setdefault("notes", "")
            v.setdefault("subtitle", "")
            v.setdefault("roles", {})
            if version < 3:
                v.setdefault("stableId", str(v.get("id") or ""))
                v.setdefault("slug", slug(v.get("title") or v.get("kind") or "Kachel"))
                v.setdefault("content", "")
                if v.get("engine") == "ck":
                    v.setdefault("chartKitchenMode", CK_ORIENTATION.get(v.get("kind")))
                else:
                    v.setdefault("chartKitchenMode", None)
                v.setdefault("chartKitchenType", None)
                v.setdefault("analysis", _analysis_for(v))
                v.setdefault("workshop", dict(DEFAULT_WORKSHOP))
            else:
                v.setdefault("content", "")
                if not isinstance(v.get("analysis"), dict):
                    v["analysis"] = dict(DEFAULT_ANALYSIS)
                if not isinstance(v.get("workshop"), dict):
                    v["workshop"] = dict(DEFAULT_WORKSHOP)
            a = dict(DEFAULT_ANALYSIS)
            a.update({k: val for k, val in (v.get("analysis") or {}).items()})
            v["analysis"] = a
            w = dict(DEFAULT_WORKSHOP)
            w.update({k: val for k, val in (v.get("workshop") or {}).items()})
            v["workshop"] = w
            by_id[v.get("id")] = (page, v)

    # ---- Links: drillField nachtragen ------------------------------------ #
    norm_links = []
    for l in links:
        l = dict(l)
        if l.get("kind") == "drillthrough" and not l.get("drillField"):
            src = by_id.get(l.get("fromVisual"))
            l["drillField"] = _drill_field_ref(src[1]) if src else None
        l.setdefault("drillField", None)
        norm_links.append(l)
    # v1/v2: Links aus visual.link rekonstruieren, falls die Liste fehlt
    if not norm_links:
        for page in pages:
            for v in page["visuals"]:
                link = v.get("link")
                if not link:
                    continue
                kind = "navigation" if v.get("kind") == "button" else "drillthrough"
                norm_links.append({
                    "fromVisual": v.get("id"), "fromPage": page["name"],
                    "toPage": link.get("pageName"), "toPageId": link.get("pageId"),
                    "kind": kind,
                    "drillField": None if kind == "navigation" else _drill_field_ref(v),
                })

    # ---- Felder / Steckbriefe -------------------------------------------- #
    model = spec.get("model") or {}
    fields = spec.get("fields")
    if not isinstance(fields, list) or not fields:
        seen = {}
        for page in pages:
            for v in page["visuals"]:
                for role_fields in (v.get("roles") or {}).values():
                    for f in role_fields:
                        seen[f.get("ref")] = f
        for s in ((zones.get("filter") or {}).get("slicers") or []):
            seen[s.get("ref")] = s
        base = {f.get("ref"): f for f in (model.get("usedFields") or [])}
        fields = [_field_record(dict(base.get(ref, {}), **f)) for ref, f in seen.items()]
    else:
        fields = [_field_record(f) for f in fields]

    new_fields = []
    used_refs = {f["ref"] for f in fields}
    for f in (spec.get("newFields") or []):
        nf = dict(f)
        for key in ("description", "unit", "target", "owner", "source", "openQuestion"):
            nf[key] = nf.get(key) or ""
        nf["used"] = bool(nf.get("used")) or nf.get("ref") in used_refs
        new_fields.append(nf)

    # ---- Slicer: default ergaenzen --------------------------------------- #
    filt = zones.get("filter")
    if filt:
        for s in (filt.get("slicers") or []):
            s.setdefault("default", None)

    # ---- Issues ----------------------------------------------------------- #
    issues = spec.get("issues")
    if not isinstance(issues, list):
        issues = []
        for page in pages:
            for v in page["visuals"]:
                for w in (v.get("warnings") or []):
                    code = ("ROLE_EMPTY" if str(w).startswith("Pflichtrolle")
                            else "ANTI_PATTERN")
                    level = "error" if (code == "ROLE_EMPTY"
                                        and v.get("engine") == "native") else "warn"
                    issues.append({"level": level, "code": code, "text": w,
                                   "page": page["name"], "visual": v.get("id")})
            if not (page.get("question") or "").strip():
                issues.append({"level": "info", "code": "PAGE_NO_QUESTION",
                               "text": "Seite ohne Fragestellung / Kernbotschaft",
                               "page": page["name"], "visual": None})
        for w in (spec.get("warnings") or []):
            if not any(i["text"] in str(w) for i in issues):
                issues.append({"level": "warn", "code": "EMPTY_TILE", "text": str(w),
                               "page": None, "visual": None})
    else:
        issues = [dict(i, page=i.get("page"), visual=i.get("visual")) for i in issues]

    warnings = spec.get("warnings")
    if not isinstance(warnings, list):
        warnings = [(("Seite „%s\": " % i["page"]) if i.get("page") else "") + i["text"]
                    for i in issues if i.get("level") != "info"]

    report = dict(DEFAULT_REPORT)
    report["name"] = meta.get("name") or ""
    report.update({k: v for k, v in (spec.get("report") or {}).items() if v is not None})

    out = {
        "sourceVersion": version,
        "version": SUPPORTED_SPEC_VERSION,
        "meta": meta,
        "report": report,
        "canvas": canvas,
        "uiScale": ui_scale,
        "spacing": spec.get("spacing") or {},
        "design": design,
        "zones": zones,
        "pages": pages,
        "links": norm_links,
        "model": model,
        "fields": fields,
        "newFields": new_fields,
        "issues": issues,
        "warnings": warnings,
    }
    meta["sourceSpecVersion"] = version
    meta["specVersion"] = SUPPORTED_SPEC_VERSION
    meta.setdefault("name", "Mockup")
    meta.setdefault("lang", "de")
    if not meta.get("specHash"):
        meta["specHash"] = spec_hash(out)
    return out


def as_document(nspec: dict) -> dict:
    """Die gehobene Spec in der Form, wie sie das Schema erwartet."""
    return {
        "meta": nspec["meta"], "report": nspec["report"], "canvas": nspec["canvas"],
        "spacing": nspec["spacing"], "design": nspec["design"], "zones": nspec["zones"],
        "pages": nspec["pages"], "links": nspec["links"], "model": nspec["model"],
        "fields": nspec["fields"], "newFields": nspec["newFields"],
        "issues": nspec["issues"], "warnings": nspec["warnings"],
    }


# --------------------------------------------------------------------------- #
# Validierung
# --------------------------------------------------------------------------- #
def _type_ok(value, expected) -> bool:
    types = expected if isinstance(expected, list) else [expected]
    for t in types:
        if t == "object" and isinstance(value, dict):
            return True
        if t == "array" and isinstance(value, list):
            return True
        if t == "string" and isinstance(value, str):
            return True
        if t == "integer" and isinstance(value, int) and not isinstance(value, bool):
            return True
        if t == "number" and isinstance(value, (int, float)) and not isinstance(value, bool):
            return True
        if t == "boolean" and isinstance(value, bool):
            return True
        if t == "null" and value is None:
            return True
    return False


def _resolve(root: dict, ref: str) -> dict:
    node = root
    for part in ref.lstrip("#/").split("/"):
        if not part:
            continue
        node = node[part]
    return node


def _check(value, schema: dict, root: dict, path: str, out: list) -> None:
    """Kompakter Validator fuer die im Schema benutzten Konstrukte."""
    if "$ref" in schema:
        _check(value, _resolve(root, schema["$ref"]), root, path, out)
        return
    for sub in schema.get("allOf") or []:
        _check(value, sub, root, path, out)
    if "type" in schema and not _type_ok(value, schema["type"]):
        want = schema["type"]
        out.append("%s: erwartet %s, gefunden %s"
                   % (path, want if isinstance(want, str) else "/".join(want),
                      "null" if value is None else type(value).__name__))
        return
    if "enum" in schema and value not in schema["enum"]:
        out.append("%s: %r ist nicht erlaubt (erlaubt: %s)"
                   % (path, value, ", ".join(repr(e) for e in schema["enum"])))
        return
    if "const" in schema and value != schema["const"]:
        out.append("%s: erwartet %r" % (path, schema["const"]))
        return
    if isinstance(value, str):
        if "minLength" in schema and len(value) < schema["minLength"]:
            out.append("%s: darf nicht leer sein" % path)
        if "pattern" in schema and not re.search(schema["pattern"], value):
            out.append("%s: %r passt nicht zum Muster %s"
                       % (path, value, schema["pattern"]))
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        if "minimum" in schema and value < schema["minimum"]:
            out.append("%s: %s ist kleiner als %s" % (path, value, schema["minimum"]))
        if "maximum" in schema and value > schema["maximum"]:
            out.append("%s: %s ist groesser als %s" % (path, value, schema["maximum"]))
    if isinstance(value, list):
        if "minItems" in schema and len(value) < schema["minItems"]:
            out.append("%s: braucht mindestens %d Eintrag/Eintraege"
                       % (path, schema["minItems"]))
        item_schema = schema.get("items")
        if item_schema:
            for i, item in enumerate(value):
                _check(item, item_schema, root, "%s[%d]" % (path, i), out)
    if isinstance(value, dict):
        for key in schema.get("required") or []:
            if key not in value or value[key] is None:
                out.append("%s.%s fehlt" % (path, key) if path else "%s fehlt" % key)
        props = schema.get("properties") or {}
        for key, sub in props.items():
            if key in value:
                _check(value[key], sub, root, ("%s.%s" % (path, key)) if path else key, out)


def validate(document: dict, schema_path=None) -> list:
    """Liste von Meldungen; leere Liste = in Ordnung."""
    path = Path(schema_path or SCHEMA_PATH)
    if not path.is_file():
        return ["Schema nicht gefunden: %s" % path]
    schema = json.loads(path.read_text(encoding="utf-8"))
    try:
        if os.environ.get("MOCKUP_NO_JSONSCHEMA"):           # fuer die Tests
            raise ImportError
        import jsonschema                                    # optional
    except ImportError:
        out: list = []
        _check(document, schema, schema, "", out)
        return out
    validator = jsonschema.Draft202012Validator(schema)
    msgs = []
    for err in sorted(validator.iter_errors(document), key=lambda e: list(e.path)):
        where = "".join("[%d]" % p if isinstance(p, int) else ".%s" % p
                        for p in err.path).lstrip(".")
        msgs.append("%s: %s" % (where or "(Wurzel)", err.message))
    return msgs


def structural_errors(nspec: dict) -> list:
    """Regeln, die ein JSON-Schema nicht ausdruecken kann."""
    out = []
    seen_pages = {}
    for p in nspec["pages"]:
        name = p.get("name") or ""
        if name in seen_pages:
            out.append("pages: Seitenname „%s\" kommt mehrfach vor "
                       "(Seite %s und %s). In Power BI muss jede Seite einen "
                       "eigenen Anzeigenamen haben." % (name, seen_pages[name], p.get("index")))
        seen_pages[name] = p.get("index")
        seen_visuals = set()
        for v in p.get("visuals") or []:
            vid = v.get("id")
            if vid in seen_visuals:
                out.append("pages[%s].visuals: Visualname „%s\" kommt auf der Seite "
                           "mehrfach vor." % (p.get("index"), vid))
            seen_visuals.add(vid)
            if not re.fullmatch(r"[A-Za-z0-9_.\-]+", str(vid or "")):
                out.append("pages[%s].visuals: „%s\" ist kein brauchbarer "
                           "PBIR-Visualname (nur Buchstaben, Ziffern, _ . -)."
                           % (p.get("index"), vid))
    names = {p.get("name") for p in nspec["pages"]}
    for l in nspec["links"]:
        if l.get("toPage") not in names:
            out.append("links: Ziel „%s\" ist keine Seite im Mockup." % l.get("toPage"))
        if l.get("fromPage") not in names:
            out.append("links: Quelle „%s\" ist keine Seite im Mockup." % l.get("fromPage"))
    for f in nspec["fields"]:
        if "." not in str(f.get("ref") or ""):
            out.append("fields: „%s\" ist kein Feldverweis der Form Tabelle.Feld"
                       % f.get("ref"))
    return out
