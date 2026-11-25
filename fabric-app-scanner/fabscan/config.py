"""fabscan.json lesen: im Scan-Ordner und je App, Pfade relativ zum Ordner der Datei.

Felder:
  models          Ordner mit *.SemanticModel-Ordnern oder direkt ein *.SemanticModel-Ordner
  connectors      {"<App-Ordner>:<Konnektor>": "<Modellname>"} oder {"<itemId>": "<Modellname>"}
  visibleFilters  feste Filter, die die App den Nutzern sichtbar anzeigt (z. B. als Chip). Je Eintrag
                  {"column": "'Tabelle'[Spalte]", "values": [2026], "file": "*.dax"} (values und file optional)
                  oder ein DAX-Ausdruck als Text: "'Kalender'[Ist] = TRUE", "TREATAS({2026}, 'Calender'[Year])".

Die Werte einer App-Datei gelten nur für diese App und gehen den Werten der Wurzel vor.
"""
from __future__ import annotations

import fnmatch
import json
import os
from dataclasses import dataclass, field

from . import dax

FILE_NAME = "fabscan.json"


@dataclass
class VisibleFilter:
    table: str                       # klein, "" = jede Tabelle
    column: str                      # klein
    op: str = "in"                   # "in" für = und IN, sonst der Vergleich (>=, < …)
    values: frozenset | None = None  # None = jeder feste Wert
    files: tuple = ()                # Dateimuster relativ zur App, leer = alle Dateien
    source: str = ""                 # Eintrag, wie er in der Datei steht (für Hinweise)

    def matches(self, cond: tuple, rel_file: str = "") -> bool:
        table, column, op, values = cond
        if self.column != column or (self.table and self.table != table) or self.op != op:
            return False
        if self.values is not None and self.values != values:
            return False
        if self.files:
            rel = rel_file.replace("\\", "/").lower()
            base = rel.rsplit("/", 1)[-1]
            return any(fnmatch.fnmatchcase(rel, p) or ("/" not in p and fnmatch.fnmatchcase(base, p)) for p in self.files)
        return True


@dataclass
class Config:
    path: str = ""
    models: list[str] = field(default_factory=list)          # absolute Pfade
    connectors: dict = field(default_factory=dict)
    visible_filters: list[VisibleFilter] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


def load(path: str, base: str) -> Config:
    """Liest eine fabscan.json. Relative Pfade unter models gelten ab base. Wirft ValueError bei kaputter Datei."""
    try:
        with open(path, encoding="utf-8-sig") as fh:
            raw = json.load(fh)
    except (OSError, ValueError) as err:
        raise ValueError(f"{path} nicht lesbar: {err}") from None
    if not isinstance(raw, dict):
        raise ValueError(f"{path}: erwartet ein JSON-Objekt")
    cfg = Config(path=path)
    models = raw.get("models") or []
    if isinstance(models, str):
        models = [models]
    for m in models:
        if isinstance(m, str) and m.strip():
            cfg.models.append(m if os.path.isabs(m) else os.path.normpath(os.path.join(base, m)))
        else:
            cfg.warnings.append(f"{path}: Eintrag in models ist kein Pfad: {m!r}")
    con = raw.get("connectors") or {}
    if isinstance(con, dict):
        cfg.connectors = {str(k): str(v) for k, v in con.items()}
    else:
        cfg.warnings.append(f"{path}: connectors muss ein Objekt sein")
    vis = raw.get("visibleFilters") or []
    if not isinstance(vis, list):
        vis = [vis]
    for entry in vis:
        got = parse_visible(entry)
        if got:
            cfg.visible_filters += got
        else:
            cfg.warnings.append(f"{path}: Eintrag in visibleFilters nicht lesbar, wird ignoriert: {json.dumps(entry, ensure_ascii=False)}")
    return cfg


def parse_visible(entry) -> list[VisibleFilter]:
    """Ein Eintrag aus visibleFilters → Filter. Leere Liste, wenn die Form nicht passt."""
    src = entry if isinstance(entry, str) else json.dumps(entry, ensure_ascii=False)
    if isinstance(entry, str):
        conds = dax.filter_conditions(entry)
        return [VisibleFilter(t, c, op, v, (), src) for t, c, op, v in conds] if conds else []
    if not isinstance(entry, dict):
        return []
    files = entry.get("file") or entry.get("files") or ()
    files = tuple(p.replace("\\", "/").lower() for p in ([files] if isinstance(files, str) else files) if isinstance(p, str))
    if isinstance(entry.get("filter"), str):          # {"filter": "'T'[S] = 1", "file": "…"}
        return [VisibleFilter(f.table, f.column, f.op, f.values, files, src) for f in parse_visible(entry["filter"])]
    col = entry.get("column")
    if not isinstance(col, str):
        return []
    ref = dax.norm_column(col)
    if ref is None and isinstance(entry.get("table"), str):
        ref = dax.norm_column(f"'{entry['table']}'[{col}]")
    if ref is None:
        return []
    table, column = ref
    if isinstance(entry.get("table"), str) and not table:
        table = entry["table"].strip().lower()
    values = None
    if "values" in entry or "value" in entry:
        v = entry.get("values", entry.get("value"))
        v = v if isinstance(v, list) else [v]
        if not v:
            return []
        values = frozenset(dax.norm_value(x) for x in v)
    op = str(entry.get("op") or "in").strip().upper()
    op = "in" if op in ("IN", "=", "==") else op
    if op != "in" and op not in ("<>", ">=", "<=", ">", "<"):
        return []
    return [VisibleFilter(table, column, op, values, files, src)]


def merge(root: Config, app: Config) -> Config:
    """App-Werte gehen vor: connectors überschreiben, models und visibleFilters der App zuerst."""
    return Config(path=app.path, models=app.models + [m for m in root.models if m not in app.models],
                  connectors={**root.connectors, **app.connectors},
                  visible_filters=app.visible_filters + root.visible_filters, warnings=[])


def visible_match(evidence: str, rel_file: str, filters: list[VisibleFilter]) -> list[VisibleFilter]:
    """Passt ein fester Filter aus der Abfrage zu visibleFilters? Jede Bedingung braucht einen Treffer.
    Gibt die passenden Einträge zurück, leer = nicht als sichtbar gemeldet."""
    if not filters:
        return []
    conds = dax.filter_conditions(evidence)
    if not conds:
        return []
    hits = []
    for c in conds:
        f = next((f for f in filters if f.matches(c, rel_file)), None)
        if f is None:
            return []
        hits.append(f)
    return hits
