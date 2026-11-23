"""Stabile Befund-IDs und bewusst akzeptierte Befunde (Ausnahmen mit Begründung).

Ausnahmen stehen in einer JSON-Datei (Standard: fabscan-ausnahmen.json im Repo bzw. im aktuellen Ordner):

    {"ausnahmen": [
      {"id": "3f2a9c1b7d4e", "begruendung": "Demo-Daten, alle dürfen alles sehen",
       "verantwortlich": "Team Finance", "bis": "2027-03-31"},
      {"regel": "SEC-AUTH", "client": "Pipeline*", "modell": "Finanzmodell",
       "begruendung": "Nächtlicher Export, nur für das Data-Team", "verantwortlich": "Data Platform"}
    ]}

Eine Ausnahme trifft über die Befund-ID oder über die Regel, eingeschränkt auf client, modell und workspace
(Platzhalter * und ?, ohne Groß- und Kleinschreibung). Ohne Begründung gilt sie nicht. Ist „bis“ überschritten,
zählt der Befund wieder und der Bericht sagt, dass die Ausnahme abgelaufen ist.
"""
from __future__ import annotations

import datetime as _dt
import fnmatch
import hashlib
import json
import os
import re

FILE_NAME = "fabscan-ausnahmen.json"


def finding_id(app, f) -> str:
    """Gleich über Läufe hinweg, solange Client, Ort, Modell, Regel und Titel gleich bleiben (Zahlen im Titel zählen
    nicht, damit „3 MDX-Abfragen“ und „5 MDX-Abfragen“ derselbe Befund sind)."""
    model = app.meta.get("model") or ", ".join(sorted(b.model.name for b in app.bindings if b.model))
    title = re.sub(r"\d+", "#", f.title)
    key = "|".join([app.origin, app.name, app.path, model, f.rule, title]).lower()
    return hashlib.sha1(key.encode("utf-8")).hexdigest()[:12]


def load(path: str) -> tuple[list[dict], list[str]]:
    """Gibt (gültige Ausnahmen, Warnungen) zurück. Eine fehlende Datei ist kein Fehler."""
    if not path or not os.path.exists(path):
        return [], []
    with open(path, encoding="utf-8-sig") as fh:
        data = json.load(fh)
    items = data.get("ausnahmen", []) if isinstance(data, dict) else data
    ok, warn = [], []
    for i, x in enumerate(items or [], 1):
        if not isinstance(x, dict):
            warn.append(f"Ausnahme {i}: kein Objekt, übersprungen.")
            continue
        if not (x.get("id") or x.get("regel")):
            warn.append(f"Ausnahme {i}: weder id noch regel, übersprungen.")
            continue
        if not str(x.get("begruendung") or "").strip():
            warn.append(f"Ausnahme {i} ({x.get('id') or x.get('regel')}): ohne Begründung, gilt nicht.")
            continue
        if x.get("bis") and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(x["bis"])):
            warn.append(f"Ausnahme {i}: „bis“ muss JJJJ-MM-TT sein, ohne Ablaufdatum übernommen.")
            x = {k: v for k, v in x.items() if k != "bis"}
        ok.append(dict(x, _nr=i))
    return ok, warn


def _like(pattern, value) -> bool:
    return not pattern or fnmatch.fnmatch(str(value or "").lower(), str(pattern).lower())


def _matches(x: dict, app, f, fid: str) -> bool:
    if x.get("id"):
        return str(x["id"]).lower() == fid
    model = app.meta.get("model") or ", ".join(b.model.name for b in app.bindings if b.model)
    return (str(x["regel"]).upper() == f.rule and _like(x.get("client"), app.name) and _like(x.get("modell"), model)
            and _like(x.get("workspace"), app.meta.get("workspace", "")))


def apply(apps, rules: list[dict], today: str | None = None) -> dict:
    """Setzt f.id an jedem Befund. Akzeptierte Befunde wandern nach app.accepted und zählen nicht mehr für Ampel,
    Exit-Code und Gesamtbild. Abgelaufene bleiben Befunde mit Vermerk."""
    today = today or _dt.date.today().isoformat()
    used: set[int] = set()
    n_ok = n_old = 0
    for a in apps:
        keep = []
        for f in a.findings:
            f.id = finding_id(a, f)
            hit = next((x for x in rules if _matches(x, a, f, f.id)), None)
            if hit is None:
                keep.append(f)
                continue
            used.add(hit["_nr"])
            f.exception = {k: v for k, v in hit.items() if not k.startswith("_")}
            if hit.get("bis") and str(hit["bis"]) < today:
                f.status = "abgelaufen"
                keep.append(f)
                n_old += 1
            else:
                f.status = "akzeptiert"
                a.accepted.append(f)
                n_ok += 1
        a.findings = keep
    unused = [x for x in rules if x["_nr"] not in used]
    return {"akzeptiert": n_ok, "abgelaufen": n_old,
            "unbenutzt": [{k: v for k, v in x.items() if not k.startswith("_")} for x in unused]}


def default_path(*folders: str) -> str:
    for d in folders:
        if d and os.path.exists(os.path.join(d, FILE_NAME)):
            return os.path.join(d, FILE_NAME)
    return ""
