#!/usr/bin/env python3
"""Modellaenderungen aus dem MockupKitchen ueber die Tabular-Editor-CLI `te` (Paket C).

Nur Standardbibliothek, `te` laeuft als Unterprozess. Kein TMDL wird von Hand
gelesen oder geschrieben: lesen ueber `te ls`/`te get`, schreiben ueber
`te add`/`te set`/`te mv` mit `--save`, danach immer `te validate --errors-only`.

API fuer den Runner (live_runner.py):

    ok, version, message = te_available(te=None)
    ops    = plan(spec, model_dir, te=None, probe=True, report_dir=None)
    result = apply(ops, model_dir, approved_ids, te=None, overrides=None,
                   backup_root=None, atomic=False)
    check  = fields_exist(model_dir, refs, te=None)

`model_dir` ist der Ordner `<Name>.SemanticModel` (oder ein TMDL-Ordner).
`te` ist None (dann $MK_TE, sonst `te` im PATH), ein Pfad oder eine Liste als
Befehlspraefix (Tests: [sys.executable, "fake_te.py"]).

Befehlsform: die Doku zur neuen Preview (bis 31.10.2026) schreibt
`-p Name=Value`; die abgelaufene Preview kannte `-q <prop> -i <value>`.
`te_dialect()` liest `te set --help` und waehlt die passende Form ("p" | "qi").
"""
from __future__ import annotations

import hashlib
import json
import locale
import os
import re
import shutil
import subprocess
import tempfile
import time
from pathlib import Path

DOWNLOAD_URL = "https://tabulareditor.com/downloads"

# Wie assets/mockup/app.js (FORMAT_WISH), damit ein Wunsch ohne formatWishString
# trotzdem zu einem Formatstring wird
FORMAT_WISH = {"int": "#,0", "dec1": "#,0.0", "dec2": "#,0.00", "k": '#,0.0, "Tsd."',
               "m": '#,0.0,, "Mio."', "pct0": "0 %", "pct1": "0.0 %", "eur": '#,0 "€"',
               "teur": '#,0, "T€"'}
# Einheit eines neuen Feldes (Steckbrief) -> Formatstring
UNIT_FORMAT = {"%": "0.0 %", "prozent": "0.0 %", "€": '#,0 "€"', "eur": '#,0 "€"',
               "euro": '#,0 "€"', "t€": '#,0, "T€"', "teur": '#,0, "T€"',
               "tsd": '#,0.0, "Tsd."', "mio": '#,0.0,, "Mio."', "stk": '#,0 "Stk."',
               "stück": '#,0 "Stk."'}
DEFAULT_FORMAT = "#,0"

# Ausfuehrungsreihenfolge: neue Kennzahlen zuerst, Umbenennungen zuletzt (die
# Format-/Beschreibungs-Ops zielen noch auf den alten Namen)
KIND_ORDER = ["addMeasure", "changeDax", "setFormat", "setDescription",
              "setDisplayFolder", "rename", "todoColumn"]

_EXPIRED_RX = re.compile(r"expired\s+on\s+(\d{4}-\d{2}-\d{2})", re.I)
_EXPIRES_RX = re.compile(r"(?:expires?|stops functioning)\D{0,40}?(\d{4}-\d{2}-\d{2})", re.I)
_VERSION_RX = re.compile(r"\d+\.\d+(?:\.\d+)?(?:[-+.][0-9A-Za-z.\-+]+)?")
_PLACEHOLDER_RX = re.compile(r"<[A-Za-zÄÖÜäöüß][^<>\n]{0,40}>|\bTODO\b")
_DIALECT_CACHE: dict = {}


class TeError(Exception):
    """`te` fehlt, ist abgelaufen oder lieferte Unbrauchbares."""


# --------------------------------------------------------------------------- te-Aufruf

def resolve_te(te=None) -> list | None:
    """Befehlspraefix fuer `te` als Liste, oder None wenn nicht zu finden."""
    if isinstance(te, (list, tuple)):
        return list(te)
    cand = te or os.environ.get("MK_TE")
    if cand:
        return [str(cand)] if (Path(cand).is_file() or shutil.which(str(cand))) else None
    found = shutil.which("te")
    return [found] if found else None


def _decode(data: bytes) -> str:
    if not data:
        return ""
    try:
        return data.decode("utf-8")
    except UnicodeDecodeError:
        return data.decode(locale.getpreferredencoding(False) or "cp1252", errors="replace")


def _run(prefix: list, args: list, timeout: int = 300) -> dict:
    """Ein te-Aufruf. Werte gehen als argv (UTF-16 unter Windows, Umlaute sicher),
    nie ueber stdin (die .NET-Konsole liest stdin in der Codepage)."""
    argv = list(prefix) + [str(a) for a in args]
    t0 = time.time()
    try:
        cp = subprocess.run(argv, capture_output=True, timeout=timeout,
                            stdin=subprocess.DEVNULL,
                            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0)
                            if os.name == "nt" else 0)
    except FileNotFoundError as exc:
        return {"argv": argv, "code": 127, "out": "", "err": str(exc), "ms": 0}
    except subprocess.TimeoutExpired:
        return {"argv": argv, "code": 124, "out": "", "err": "Zeitlimit %ss" % timeout,
                "ms": int((time.time() - t0) * 1000)}
    return {"argv": argv, "code": cp.returncode, "out": _decode(cp.stdout),
            "err": _decode(cp.stderr), "ms": int((time.time() - t0) * 1000)}


def _json(text: str):
    """Erstes JSON-Dokument aus stdout (te kann Banner davor schreiben)."""
    text = (text or "").strip()
    if not text:
        return None
    try:
        return json.loads(text)
    except ValueError:
        pass
    for opener in ("{", "["):
        i = text.find(opener)
        if i >= 0:
            try:
                obj, _ = json.JSONDecoder().raw_decode(text[i:])
                return obj
            except ValueError:
                continue
    return None


def _tail(text: str, n: int = 600) -> str:
    text = (text or "").strip()
    return text if len(text) <= n else "…" + text[-n:]


def expiry_from_text(text: str) -> tuple:
    """(abgelaufen?, Datum) aus einer te-Ausgabe."""
    m = _EXPIRED_RX.search(text or "")
    if m:
        return True, m.group(1)
    if text and "expired" in text.lower():
        return True, None
    m = _EXPIRES_RX.search(text or "")
    return False, (m.group(1) if m else None)


def te_available(te=None) -> tuple:
    """(ok, version, message). Erkennt die Ablaufmeldung der Preview."""
    prefix = resolve_te(te)
    if not prefix:
        return False, None, ("te nicht gefunden (PATH oder MK_TE). Tabular Editor CLI "
                             "installieren: %s" % DOWNLOAD_URL)
    r = _run(prefix, ["--version"], timeout=60)
    both = (r["out"] or "") + "\n" + (r["err"] or "")
    expired, date = expiry_from_text(both)
    if expired:
        return False, None, ("te abgelaufen%s, bitte aktualisieren: %s"
                             % (" (Preview lief bis %s)" % date if date else "", DOWNLOAD_URL))
    if r["code"] != 0:
        return False, None, "te --version schlug fehl (Exit %s): %s" % (
            r["code"], _tail(both, 300))
    first = next((ln.strip() for ln in (r["out"] or "").splitlines() if ln.strip()), "")
    m = _VERSION_RX.search(first)
    version = m.group(0) if m else (first or None)
    msg = "te %s bereit" % (version or "?")
    if date:
        msg += " · Preview läuft bis %s" % date
    return True, version, msg


def te_dialect(te=None) -> str:
    """"p" (`-p Name=Value`, Doku Okt. 2026) oder "qi" (`-q prop -i value`, alte Preview)."""
    prefix = resolve_te(te)
    if not prefix:
        return "p"
    key = tuple(prefix)
    if key not in _DIALECT_CACHE:
        r = _run(prefix, ["set", "--help"], timeout=60)
        h = (r["out"] or "") + (r["err"] or "")
        if "--property" in h:
            _DIALECT_CACHE[key] = "p"
        elif "--input" in h or re.search(r"(^|\s)-i[,\s]", h):
            _DIALECT_CACHE[key] = "qi"
        else:
            _DIALECT_CACHE[key] = "p"
    return _DIALECT_CACHE[key]


# --------------------------------------------------------------------------- Pfade

def te_path(table: str, name: str | None = None) -> str:
    """te-Objektpfad. Slash-Form, bei / [ ] ' " im Namen die DAX-Form 'T'[N]."""
    if name is None:
        return table if not re.search(r"[/\[\]'\"]", table) else "'%s'" % table.replace("'", "''")
    if re.search(r"[/\[\]'\"]", table + name):
        return "'%s'[%s]" % (table.replace("'", "''"), name.replace("]", "]]"))
    return "%s/%s" % (table, name)


def split_path(path: str) -> list:
    """te-Objektpfad in Segmente: Sales/Revenue, "Sales 2024"/Revenue, 'T'[N], T[N]."""
    p = (path or "").strip()
    m = re.match(r"^'((?:[^']|'')*)'\[((?:[^\]]|\]\])*)\]$", p) or \
        re.match(r"^([^'\[/\"]+)\[((?:[^\]]|\]\])*)\]$", p)
    if m:
        return [m.group(1).replace("''", "'"), m.group(2).replace("]]", "]")]
    segs, cur, q, i = [], "", None, 0
    while i < len(p):
        ch = p[i]
        if q:
            if ch == q and i + 1 < len(p) and p[i + 1] == q:
                cur += ch
                i += 2
                continue
            if ch == q:
                q = None
            else:
                cur += ch
        elif ch in "'\"" and cur == "":
            q = ch
        elif ch == "/":
            segs.append(cur)
            cur = ""
        else:
            cur += ch
        i += 1
    segs.append(cur)
    return [s for s in segs if s != ""]


def _ref_key(table: str, name: str) -> str:
    return ("%s.%s" % (table, name)).casefold()


def _split_ref(ref: str, tables=None) -> tuple:
    """Kitchen-Ref "Tabelle.Feld"; bekannte Tabellennamen mit Punkt gewinnen."""
    for t in sorted(tables or [], key=len, reverse=True):
        if ref.startswith(t + "."):
            return t, ref[len(t) + 1:]
    t, _, n = ref.partition(".")
    return t, n


# --------------------------------------------------------------------------- Befehle

def _globals(model_dir) -> list:
    return ["-m", str(model_dir), "--output-format", "json", "--non-interactive"]


def render(action: dict, model_dir, dialect: str = "p") -> list:
    """Strukturierte Aktion -> Liste von argv-Listen (ohne te-Praefix, mit "te" vorn)."""
    verb, path = action["verb"], action["path"]
    props = action.get("props") or {}
    g = _globals(model_dir)
    if verb == "mv":
        return [["te", "mv", path, action["dest"], "--save"] + g]
    if dialect == "qi":
        cmds = []
        if verb == "add":
            expr = props.get("expression", "")
            cmds.append(["te", "add", path, "-t", action.get("type", "Measure"), "-i", expr,
                         "--if-not-exists", "--save"] + g)
            rest = {k: v for k, v in props.items() if k != "expression"}
        else:
            rest = props
        for k, v in rest.items():
            cmds.append(["te", "set", path, "-q", k, "-i", v, "--save"] + g)
        return cmds
    argv = ["te", verb, path]
    if verb == "add":
        argv += ["-t", action.get("type", "Measure")]
    for k, v in props.items():
        argv += ["-p", "%s=%s" % (k, v)]
    if verb == "add":
        argv.append("--if-not-exists")
    argv.append("--save")
    return [argv + g]


def command_line(argv: list) -> str:
    """Lesbare Shell-Zeile (Anzeige im Chat/Status, nicht zum Ausfuehren)."""
    out = []
    for a in argv:
        if a and re.fullmatch(r"[A-Za-z0-9_./:=,\-#@%+]+", a):
            out.append(a)
        else:
            out.append('"%s"' % a.replace("\\", "\\\\").replace('"', '\\"'))
    return " ".join(out)


# --------------------------------------------------------------------------- Modellsicht

def model_index(model_dir, te=None) -> dict | None:
    """{"t.n" (casefold): {table, name, type, props}} aus `te ls --type measure|column`.
    None, wenn te nicht laeuft oder kein JSON liefert."""
    prefix = resolve_te(te)
    if not prefix:
        return None
    idx = {}
    for typ in ("measure", "column"):
        r = _run(prefix, ["ls", "--type", typ] + _globals(model_dir))
        data = _json(r["out"])
        if r["code"] != 0 or data is None:
            return None
        items = data if isinstance(data, list) else (data.get("objects") or data.get("items") or [])
        for it in items:
            if not isinstance(it, dict):
                continue
            props = {str(k).casefold(): v for k, v in (it.get("properties") or {}).items()}
            segs = split_path(it.get("objectPath") or it.get("path") or "")
            table = props.get("table") or (segs[0] if segs else None)
            name = props.get("name") or (segs[-1] if len(segs) > 1 else None)
            if not table or not name:
                continue
            idx[_ref_key(table, name)] = {"table": table, "name": name,
                                          "type": it.get("type") or typ, "props": props}
    return idx


def fields_exist(model_dir, refs, te=None) -> dict:
    """Pruefung fuer den Runner: existieren die Felder im Modell?

    refs: "Tabelle.Feld", (tabelle, feld) oder {"table","name"} / {"ref"}.
    Rueckgabe {"ok", "message", "exists": {ref: bool|None}, "missing": [ref]}.
    ok=False heisst: te lief nicht, exists-Werte sind dann None."""
    keys = []
    for r in refs or []:
        if isinstance(r, dict):
            label = r.get("ref") or "%s.%s" % (r.get("table"), r.get("name"))
            key = _ref_key(r["table"], r["name"]) if r.get("table") and r.get("name") \
                else str(label).casefold()
        elif isinstance(r, (list, tuple)):
            label, key = "%s.%s" % (r[0], r[1]), _ref_key(r[0], r[1])
        else:
            label, key = str(r), str(r).casefold()
        keys.append((label, key))
    ok, _, msg = te_available(te)
    if not ok:
        return {"ok": False, "message": msg, "exists": {lb: None for lb, _ in keys},
                "missing": []}
    idx = model_index(model_dir, te)
    if idx is None:
        return {"ok": False, "message": "te ls lieferte keine Feldliste (JSON).",
                "exists": {lb: None for lb, _ in keys}, "missing": []}
    exists = {lb: k in idx for lb, k in keys}
    missing = [lb for lb, v in exists.items() if not v]
    return {"ok": True, "exists": exists, "missing": missing,
            "message": "alle %d Felder im Modell" % len(exists) if not missing
            else "%d von %d Feldern fehlen im Modell" % (len(missing), len(exists))}


# --------------------------------------------------------------------------- Plan

def dax_suggestion(field: dict) -> str:
    """Grober DAX-Vorschlag aus der Beschreibung (wie mockup_to_pbir.dax_suggestion).
    Platzhalter <...> blockieren die Ausfuehrung, bis echtes DAX vorliegt."""
    desc = (field.get("description") or "").lower()
    name = (field.get("name") or "").lower()
    words = re.findall(r"[a-zäöüß_]+", desc)
    if "minus" in words or "abzüglich" in words:
        ops = [w for w in words if w in ("umsatz", "kosten", "erlös", "erlöse", "aufwand",
                                         "marge", "rabatt")]
        if len(ops) >= 2:
            return "[%s] - [%s]" % (ops[0].capitalize(), ops[1].capitalize())
        return "[<Minuend>] - [<Subtrahend>]"
    if "%" in name or "quote" in words or "anteil" in words or "rate" in words:
        return "DIVIDE( [<Zähler>], [<Nenner>] )"
    if "summe" in words or "gesamt" in words:
        return "SUM( <Tabelle>[<Spalte>] )"
    if "durchschnitt" in words or "mittel" in words:
        return "AVERAGE( <Tabelle>[<Spalte>] )"
    return "// TODO: DAX ergänzen"


def has_placeholder(dax: str) -> bool:
    return bool(_PLACEHOLDER_RX.search(dax or ""))


def _wish_format(f: dict | None) -> str | None:
    if not f:
        return None
    fs = (f.get("formatWishString") or "").strip()
    if fs:
        return fs
    return FORMAT_WISH.get((f.get("formatWish") or "").strip()) or None


def _unit_format(unit: str | None) -> str | None:
    u = (unit or "").strip().casefold().rstrip(".")
    return UNIT_FORMAT.get(u) if u else None


def _steckbrief(f: dict) -> str:
    """Beschreibung aus dem Steckbrief (Notiz, Einheit, Ziel, Quelle, Owner)."""
    parts = []
    if (f.get("note") or "").strip():
        parts.append(f["note"].strip().rstrip(".") + ".")
    for key, label in (("unit", "Einheit"), ("target", "Ziel"), ("source", "Quelle"),
                       ("owner", "Verantwortlich")):
        if (f.get(key) or "").strip():
            parts.append("%s: %s." % (label, f[key].strip().rstrip(".")))
    return " ".join(parts)


def _op(kind, ref, table, name, summary, *, approval, action=None, executable=True,
        blocked=None, **extra) -> dict:
    op = {"id": "%s:%s" % (kind, ref), "kind": kind, "ref": ref, "table": table,
          "name": name, "target": te_path(table, name), "needsApproval": approval,
          "executable": executable and action is not None and not blocked,
          "blockedReason": blocked, "summary": summary, "action": action}
    op.update(extra)
    return op


def plan(spec: dict, model_dir, *, te=None, probe=True, report_dir=None,
         dialect: str | None = None) -> list:
    """Ops aus der Kitchen-Spec. Schreibt nichts.

    Liest die ROH-Spec (fields[].formatWish/formatWishString/daxComment/renameInModel/
    alias, newFields[]). probe=True und te verfuegbar: aktuelle Werte ueber `te ls`
    lesen, Ops ohne Wirkung weglassen, vorhandene Ziele blockieren."""
    idx = None
    if probe:
        ok, _, _ = te_available(te)
        idx = model_index(model_dir, te) if ok else None
    if dialect is None:
        dialect = te_dialect(te) if (probe and idx is not None) else "p"
    tables = list((spec.get("model") or {}).get("tables") or [])
    fields = [f for f in (spec.get("fields") if isinstance(spec.get("fields"), list)
                          else (spec.get("model") or {}).get("usedFields") or [])
              if isinstance(f, dict)]
    by_ref = {f.get("ref"): f for f in fields if f.get("ref")}
    report = str(report_dir) if report_dir else "<Name>.Report"

    def cur(table, name, prop, fallback=None):
        if idx is None:
            return fallback
        hit = idx.get(_ref_key(table, name))
        if hit is None:
            return fallback
        return hit["props"].get(prop.casefold(), fallback)

    def exists(table, name):
        return None if idx is None else _ref_key(table, name) in idx

    ops = []
    new_keys = set()
    # ---- neue Felder
    for nf in spec.get("newFields") or []:
        if not isinstance(nf, dict) or not nf.get("table") or not nf.get("name"):
            continue
        table, name = nf["table"], nf["name"]
        ref = nf.get("ref") or "%s.%s" % (table, name)
        new_keys.add(_ref_key(table, name))
        if nf.get("kind") != "measure":
            ops.append(_op("todoColumn", ref, table, name,
                           "Neue Spalte „%s“ in %s gehört in die Quelle bzw. Power Query, "
                           "nicht über te anlegen." % (name, table),
                           approval=False, executable=False,
                           blocked="Spalte: Quelle/Power Query"))
            continue
        dax = (nf.get("dax") or nf.get("daxProposal") or nf.get("expression") or "").strip()
        proposed = not dax
        if proposed:
            dax = dax_suggestion(nf)
        fwish = by_ref.get(ref)
        fs = _wish_format(fwish) or _wish_format(nf) or _unit_format(nf.get("unit")) \
            or DEFAULT_FORMAT
        props = {"expression": dax, "formatString": fs}
        desc = (nf.get("description") or "").strip()
        if desc:
            props["description"] = desc
        folder = (nf.get("displayFolder") or "").strip()
        if folder:
            props["displayFolder"] = folder
        blocked = None
        if nf.get("newTable") or (tables and table not in tables):
            blocked = "Tabelle „%s“ fehlt im Modell (erst klären bzw. anlegen)" % table
        elif exists(table, name):
            blocked = "existiert bereits im Modell"
        elif has_placeholder(dax):
            blocked = "DAX-Vorschlag unvollständig, bitte DAX angeben"
        summary = "Neue Kennzahl „%s“ in %s anlegen: DAX `%s`, Format „%s“%s." % (
            name, table, dax, fs, " (Vorschlag aus der Beschreibung, bitte prüfen)"
            if proposed else "")
        ops.append(_op("addMeasure", ref, table, name, summary, approval=True,
                       action={"verb": "add", "path": te_path(table, name),
                               "type": "Measure", "props": props},
                       blocked=blocked, daxProposed=proposed,
                       after={"expression": dax, "formatString": fs}))

    # ---- bestehende Felder: Steckbrief-Wuensche
    for f in fields:
        table, name, ref = f.get("table"), f.get("name"), f.get("ref")
        if not table or not name:
            if not ref:
                continue
            table, name = _split_ref(ref, tables)
        ref = ref or "%s.%s" % (table, name)
        if f.get("isNew") or f.get("missing") or _ref_key(table, name) in new_keys:
            continue
        if idx is not None and not exists(table, name):
            continue                # fehlt im Modell: meldet der Runner, nicht unser Job
        path = te_path(table, name)
        is_measure = f.get("kind") == "measure"

        note = (f.get("daxComment") or f.get("daxNote") or "").strip()
        new_dax = (f.get("daxProposal") or f.get("daxNew") or "").strip()
        if note or new_dax:
            blocked = None
            if not is_measure:
                blocked = "DAX-Änderung nur für Kennzahlen vorgesehen"
            elif not new_dax:
                blocked = "DAX-Vorschlag fehlt, Wunsch erst in DAX übersetzen"
            ops.append(_op("changeDax", ref, table, name,
                           "DAX von „%s“ ändern%s%s." % (
                               name, ": Wunsch „%s“" % note if note else "",
                               ", neu `%s`" % new_dax if new_dax else ""),
                           approval=True,
                           action={"verb": "set", "path": path,
                                   "props": {"expression": new_dax or ""}},
                           blocked=blocked, wish=note,
                           before={"expression": cur(table, name, "expression",
                                                     f.get("expression"))},
                           after={"expression": new_dax}))

        fs = _wish_format(f)
        if fs:
            now = cur(table, name, "formatString", f.get("formatString") or "")
            if (now or "") != fs:
                dyn = bool(f.get("formatDynamic") or f.get("formatExpression"))
                ops.append(_op("setFormat", ref, table, name,
                               "Format von „%s“ ändern: „%s“ → „%s“%s." % (
                                   name, now or "ohne", fs,
                                   " (Achtung: dynamischer Formatausdruck vorhanden, der "
                                   "statische Wert wirkt erst ohne ihn)" if dyn else ""),
                               approval=dyn,
                               action={"verb": "set", "path": path,
                                       "props": {"formatString": fs}},
                               wish=f.get("formatWish") or None,
                               before={"formatString": now}, after={"formatString": fs}))

        now_desc = cur(table, name, "description", f.get("description") or "") or ""
        want = (f.get("descriptionWish") or "").strip()
        if not want and not now_desc.strip():
            want = _steckbrief(f)
        if want and want != now_desc:
            ops.append(_op("setDescription", ref, table, name,
                           "Beschreibung von „%s“ setzen: „%s“." % (name, want),
                           approval=False,
                           action={"verb": "set", "path": path,
                                   "props": {"description": want}},
                           before={"description": now_desc}, after={"description": want}))

        folder = (f.get("displayFolderWish") or "").strip()
        if folder:
            now_f = cur(table, name, "displayFolder", f.get("displayFolder") or "") or ""
            if folder != now_f:
                ops.append(_op("setDisplayFolder", ref, table, name,
                               "Anzeigeordner von „%s“: „%s“ → „%s“." % (
                                   name, now_f or "ohne", folder),
                               approval=False,
                               action={"verb": "set", "path": path,
                                       "props": {"displayFolder": folder}},
                               before={"displayFolder": now_f},
                               after={"displayFolder": folder}))

        alias = (f.get("alias") or "").strip()
        if f.get("renameInModel") and alias and alias != name:
            blocked = "„%s“ gibt es in %s schon" % (alias, table) \
                if exists(table, alias) else None
            new_ref = "%s.%s" % (table, alias)
            ops.append(_op("rename", ref, table, name,
                           "„%s“ im Modell umbenennen in „%s“%s; danach im Bericht "
                           "pbir fields replace und pbir validate --fields." % (
                               name, alias, "" if f.get("confirmed")
                               else " (im Workshop noch nicht bestätigt)"),
                           approval=True,
                           action={"verb": "mv", "path": path,
                                   "dest": te_path(table, alias)},
                           blocked=blocked, newRef=new_ref,
                           followUp=[
                               ["pbir", "fields", "replace", report, "--from", ref,
                                "--to", new_ref],
                               ["pbir", "validate", report, "--fields"]]))

    ops.sort(key=lambda o: KIND_ORDER.index(o["kind"]))
    for op in ops:
        empty_dax = op["kind"] == "changeDax" and not op["action"]["props"]["expression"]
        op["commands"] = render(op["action"], model_dir, dialect) \
            if op["action"] and not empty_dax else []
        op["commandLines"] = [command_line(c) for c in op["commands"]]
        op["hash"] = op_hash(op)
    return ops


# --------------------------------------------------------------------------- Freigabe-Hash

def op_content(op: dict) -> str:
    """Inhalt einer Op für den Freigabe-Hash: `after` als kanonisches JSON (Schlüssel
    sortiert, ohne Leerzeichen, Unicode unverändert), bei Umbenennungen `newRef`, sonst ""."""
    after = op.get("after")
    if isinstance(after, dict) and after:
        return json.dumps(after, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    if op.get("newRef"):
        return str(op["newRef"])
    return ""


def op_hash(op: dict) -> str:
    """sha256 (hex) über kind, target und Inhalt, je durch einen Zeilenumbruch getrennt.
    Eine Freigabe in model-approvals.json gilt nur, solange dieser Hash gleich bleibt
    (geänderter DAX-Vorschlag, anderes Format, anderes Ziel: erneut freigeben)."""
    text = "%s\n%s\n%s" % (op.get("kind") or "", op.get("target") or "", op_content(op))
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def with_override_content(op: dict, ov: dict | None) -> dict:
    """Op so, wie sie MIT der Korrektur aus der Freigabe laufen würde, für den Hash
    (Safety-Review 5): `after.expression` = overrides.dax (addMeasure, changeDax), dazu
    formatString/description/displayFolder, bei Umbenennung `newRef` aus dem alias. Ohne
    Korrektur die Op selbst. Gegenstück zu _with_overrides (das die te-Aktion ändert)."""
    if not ov:
        return op
    out = json.loads(json.dumps(op))
    after = dict(out.get("after") or {})
    if ov.get("dax") and out.get("kind") in ("addMeasure", "changeDax"):
        after["expression"] = ov["dax"]
    for k in ("formatString", "description", "displayFolder"):
        if ov.get(k) is not None and (out.get("kind") == "addMeasure" or k in after):
            after[k] = ov[k]
    if after:
        out["after"] = after
    if ov.get("alias") and out.get("kind") == "rename" and out.get("table"):
        out["newRef"] = "%s.%s" % (out["table"], ov["alias"])
    return out


def approval_hashes(op: dict, ov: dict | None = None) -> set:
    """Hashes, unter denen eine Freigabe diese Op (mit ihrer Korrektur) deckt: target als
    te-Pfad (`target`, so rechnet op_hash) oder als Referenz aus der Op-ID (`ref`, so rechnet
    das Kitchen 0.6 mit targetOf(id)). Beides bezeichnet dieselbe Op."""
    base = with_override_content(op, ov)
    out = {op_hash(base)}
    if op.get("ref") and op.get("ref") != op.get("target"):
        out.add(op_hash(dict(base, target=op["ref"])))
    return out


# --------------------------------------------------------------------------- Apply

def _definition_dir(model_dir) -> Path:
    md = Path(model_dir)
    return md / "definition" if (md / "definition").is_dir() else md


def snapshot(model_dir, backup_root) -> Path:
    """Kopie des Definitionsordners (TMDL) vor dem Eingriff."""
    src = _definition_dir(model_dir)
    stamp = "definition-" + time.strftime("%Y%m%d-%H%M%S")
    dst, n = Path(backup_root) / stamp, 1
    while dst.exists():
        n += 1
        dst = Path(backup_root) / ("%s-%d" % (stamp, n))
    shutil.copytree(src, dst)
    return dst


def restore(model_dir, backup: Path) -> None:
    """Definitionsordner aus der Kopie zurueckholen (Dateien, keine TMDL-Bearbeitung)."""
    dst = _definition_dir(model_dir)

    def _onerr(func, p, _exc):
        os.chmod(p, 0o666)
        func(p)

    if dst.exists():
        shutil.rmtree(dst, onerror=_onerr)
    shutil.copytree(backup, dst)


def validate(model_dir, te=None) -> dict:
    """`te validate --errors-only`. {"ok", "ran", "errors": [{code,message,objectPath}]}."""
    prefix = resolve_te(te)
    if not prefix:
        return {"ok": False, "ran": False, "errors": [], "raw": "te fehlt"}
    r = _run(prefix, ["validate", "--errors-only"] + _globals(model_dir))
    data = _json(r["out"])
    errors = []
    if isinstance(data, dict):
        for fnd in data.get("findings") or data.get("results") or []:
            if not isinstance(fnd, dict):
                continue
            if str(fnd.get("severity", "error")).lower() != "error":
                continue
            errors.append({"code": fnd.get("code"), "message": fnd.get("message"),
                           "objectPath": fnd.get("objectPath") or fnd.get("object")})
        summ = data.get("summary") or {}
        if not errors and isinstance(summ.get("errors"), int) and summ["errors"] > 0:
            errors = [{"code": None, "message": "%d Fehler (ohne Einzelbefund)"
                       % summ["errors"], "objectPath": None}]
    elif r["code"] != 0:
        errors = [{"code": "EXIT%d" % r["code"], "message": _tail(r["err"] or r["out"], 400),
                   "objectPath": None}]
    if r["code"] != 0 and not errors:
        errors = [{"code": "EXIT%d" % r["code"], "message": _tail(r["err"] or r["out"], 400),
                   "objectPath": None}]
    return {"ok": not errors, "ran": True, "errors": errors, "exitCode": r["code"]}


def _err_key(e: dict) -> tuple:
    return (e.get("code"), e.get("objectPath"), e.get("message"))


def _with_overrides(op: dict, ov: dict | None) -> dict:
    """Freigabe mit Korrektur aus dem Chat: {"dax", "formatString", "alias",
    "description", "displayFolder"}."""
    if not ov or not op.get("action"):
        return op
    op = json.loads(json.dumps(op))
    act = op["action"]
    if act["verb"] in ("add", "set"):
        if ov.get("dax") and op["kind"] in ("addMeasure", "changeDax"):
            act["props"]["expression"] = ov["dax"]
            if op.get("blockedReason", "") and ("DAX" in op["blockedReason"]):
                op["blockedReason"] = None
        for k in ("formatString", "description", "displayFolder"):
            if ov.get(k) is not None and (op["kind"] == "addMeasure" or k in act["props"]):
                act["props"][k] = ov[k]
    if act["verb"] == "mv" and ov.get("alias"):
        act["dest"] = te_path(op["table"], ov["alias"])
        op["newRef"] = "%s.%s" % (op["table"], ov["alias"])
        for fu in op.get("followUp") or []:
            if "--to" in fu:
                fu[fu.index("--to") + 1] = op["newRef"]
    op["executable"] = not op.get("blockedReason")
    return op


def apply(ops: list, model_dir, approved_ids=(), *, te=None, overrides: dict | None = None,
          backup_root=None, atomic: bool = False) -> dict:
    """Freigegebene Ops ueber te ausfuehren, danach te validate --errors-only.

    - needsApproval=False laeuft immer, needsApproval=True nur mit id in approved_ids.
    - overrides: {op_id: {"dax": ...}} (z. B. im Chat korrigiertes DAX).
    - Vorher Kopie des Definitionsordners; bringt validate NEUE Fehler (gegenueber dem
      Stand vorher), wird die Kopie zurueckgespielt (status "reverted").
    - atomic=True: der erste fehlgeschlagene te-Aufruf spielt sofort alles zurueck.
    Rueckgabe: {"ok", "status", "message", "results", "validation", "reverted",
    "backup", "reloadModel", "followUps", "te"}."""
    approved = set(approved_ids or ())
    overrides = overrides or {}
    res = {"ok": False, "status": "nothing", "message": "", "results": [],
           "validation": None, "reverted": False, "backup": None, "reloadModel": False,
           "followUps": [], "te": None}

    run, results = [], []
    for op in ops:
        op2 = _with_overrides(op, overrides.get(op["id"]))
        if not op2.get("executable"):
            results.append({"id": op["id"], "status": "blocked",
                            "message": op2.get("blockedReason") or "nicht ausführbar"})
        elif op2.get("needsApproval") and op["id"] not in approved:
            results.append({"id": op["id"], "status": "awaitingApproval",
                            "message": "Freigabe fehlt (DAX oder Umbenennung)"})
        else:
            run.append(op2)
    res["results"] = results
    if not run:
        res["ok"] = True
        res["message"] = "Nichts auszuführen (%d Ops warten auf Freigabe oder sind blockiert)." \
            % len(results) if results else "Keine Modelländerungen."
        return res

    ok, version, msg = te_available(te)
    res["te"] = {"ok": ok, "version": version, "message": msg}
    if not ok:
        res["status"] = "teUnavailable"
        res["message"] = msg
        for op in run:
            results.append({"id": op["id"], "status": "skipped", "message": msg})
        return res
    if not _definition_dir(model_dir).is_dir():
        res["status"] = "failed"
        res["message"] = "Modellordner fehlt: %s" % model_dir
        return res
    prefix = resolve_te(te)
    dialect = te_dialect(te)

    own_backup = backup_root is None
    root = Path(backup_root) if backup_root else Path(tempfile.mkdtemp(prefix="mk-model-"))
    root.mkdir(parents=True, exist_ok=True)
    backup = snapshot(model_dir, root)
    res["backup"] = str(backup)

    before = validate(model_dir, te)
    applied, failed = [], []
    for op in run:
        cmds = render(op["action"], model_dir, dialect)
        out = {"id": op["id"], "status": "applied", "commands": [], "message": ""}
        for argv in cmds:
            r = _run(prefix, argv[1:])
            out["commands"].append({"line": command_line(argv), "exitCode": r["code"],
                                    "ms": r["ms"]})
            if r["code"] != 0:
                out["status"] = "failed"
                out["message"] = _tail(r["err"] or r["out"], 600) or "Exit %d" % r["code"]
                break
        results.append(out)
        (applied if out["status"] == "applied" else failed).append(op)
        if failed and atomic:
            break

    if failed and atomic:
        restore(model_dir, backup)
        res.update(status="reverted", reverted=True,
                   message="„%s“ schlug fehl, alle Änderungen zurückgenommen (atomic)."
                   % failed[0]["id"])
        for r in results:
            if r["status"] == "applied":
                r["status"] = "reverted"
        res["validation"] = {"before": len(before["errors"]), "after": None,
                             "newErrors": []}
        return res

    after = validate(model_dir, te) if applied else before
    old = {_err_key(e) for e in before["errors"]}
    new_errors = [e for e in after["errors"] if _err_key(e) not in old]
    res["validation"] = {"before": len(before["errors"]), "after": len(after["errors"]),
                         "newErrors": new_errors}
    if new_errors:
        restore(model_dir, backup)
        check = validate(model_dir, te)
        res["validation"]["afterRevert"] = len(check["errors"])
        res.update(status="reverted", reverted=True,
                   message="te validate meldet %d neue Fehler, Modell auf den Stand "
                   "vorher zurückgesetzt: %s" % (
                       len(new_errors), "; ".join(str(e.get("message")) for e in new_errors[:3])))
        for r in results:
            if r["status"] == "applied":
                r["status"] = "reverted"
        return res

    for op in applied:
        res["followUps"] += op.get("followUp") or []
    res["reloadModel"] = bool(applied)
    res["ok"] = not failed
    res["status"] = "applied" if not failed else ("partial" if applied else "failed")
    parts = ["%d Modelländerung%s gespeichert" % (len(applied), "" if len(applied) == 1 else "en")]
    if failed:
        parts.append("%d fehlgeschlagen" % len(failed))
    waiting = sum(1 for r in results if r["status"] == "awaitingApproval")
    if waiting:
        parts.append("%d warten auf Freigabe" % waiting)
    if before["errors"]:
        parts.append("%d Validierungsfehler bestanden schon vorher" % len(before["errors"]))
    res["message"] = ", ".join(parts) + "."
    if own_backup and not failed:
        shutil.rmtree(root, ignore_errors=True)
        res["backup"] = None
    return res


__all__ = ["te_available", "te_dialect", "plan", "apply", "fields_exist", "validate",
           "model_index", "render", "te_path", "split_path", "expiry_from_text",
           "dax_suggestion", "op_hash", "op_content", "approval_hashes",
           "with_override_content", "FORMAT_WISH", "TeError"]
