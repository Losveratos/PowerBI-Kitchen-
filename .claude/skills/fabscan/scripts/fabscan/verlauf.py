"""Trend gegen den Vorlauf und Verlauf über mehrere Läufe (Bewertung 5.3).

Verglichen wird über die stabile Befund-ID (ausnahmen.finding_id). Gezählt werden nur ✗ und ⚠, Hinweise nicht.
„Behoben“ heißt: im Vorlauf offen, jetzt nicht mehr da, und die App oder der Client wurde wieder geprüft.
Verschwundene und neue Apps oder Clients stehen eigens, weil sie sonst als behoben oder neu durchrutschen.
"""
from __future__ import annotations

import datetime as _dt
import json
import os

from . import themen

HISTORY_FILE = "verlauf.json"
HISTORY_MAX = 52


def load_previous(path: str) -> dict | None:
    """befunde.json eines früheren Laufs (Datei oder Ordner). None, wenn nicht da. Wirft ValueError bei kaputter Datei."""
    if not path:
        return None
    p = os.path.join(path, "befunde.json") if os.path.isdir(path) else path
    if not os.path.exists(p):
        return None
    try:
        with open(p, encoding="utf-8") as fh:
            data = json.load(fh)
    except (OSError, ValueError) as err:
        raise ValueError(f"Vorlauf {p} nicht lesbar: {err}") from None
    if not isinstance(data, dict) or not isinstance(data.get("findings"), list):
        raise ValueError(f"Vorlauf {p}: keine befunde.json von fabscan")
    data["_path"] = p
    return data


def latest_run(base: str, exclude: str = "") -> str:
    """Jüngster Unterordner von base mit befunde.json (Notebook: Files/fabscan/<datum>/), außer exclude."""
    if not os.path.isdir(base):
        return ""
    cand = [d for d in os.listdir(base) if os.path.exists(os.path.join(base, d, "befunde.json"))
            and os.path.normcase(os.path.abspath(os.path.join(base, d))) != os.path.normcase(os.path.abspath(exclude or "\0"))]
    return os.path.join(base, sorted(cand)[-1]) if cand else ""


def _open(sev: str, status: str) -> bool:
    return sev in ("fail", "warn") and status != "akzeptiert"


def compare(apps, previous: dict | None, run_date: str | None = None) -> dict:
    """Trend gegen den Vorlauf. Ohne Vorlauf: nur first_seen = heute."""
    today = run_date or _dt.date.today().isoformat()
    cur = {}                       # id → (client, open?)
    for a in apps:
        for f in a.findings + a.accepted:
            cur[f.id] = (a.name, _open(f.severity, f.status))
    if not previous:
        return {"previous": None, "first_seen": {i: today for i in cur}}
    rows = previous["findings"]
    prev_date = previous.get("run_date") or (rows[0].get("run_date") if rows else "") or str(previous.get("created") or "")[:10]
    prev = {}
    seen = {}
    for r in rows:
        fid = r.get("finding_id")
        if not fid:
            continue
        prev[fid] = (r.get("client", ""), _open(r.get("severity", ""), r.get("status", "")))
        seen[fid] = r.get("first_seen") or r.get("run_date") or prev_date
    first_seen = {i: seen.get(i, today) for i in cur}
    cur_clients = {a.name for a in apps}
    prev_clients = {c for c, _ in prev.values()} | {a.get("name") for a in previous.get("apps", []) if a.get("name")}
    open_now = {i for i, (_, o) in cur.items() if o}
    open_prev = {i for i, (_, o) in prev.items() if o}
    accepted_ids = {f.id for a in apps for f in a.accepted}
    accepted = len(accepted_ids)
    # behoben: weg, oder nur noch Hinweis; die App bzw. der Client wurde wieder geprüft
    fixed = [i for i in open_prev - open_now if i not in accepted_ids and prev[i][0] in cur_clients]
    newly_accepted = [i for i in open_prev if i in accepted_ids]
    return {
        "previous": {"date": prev_date, "path": previous.get("_path", ""), "run_id": previous.get("run_id", ""),
                     "clients": len(prev_clients), "coverage": previous.get("coverage")},
        "first_seen": first_seen,
        "neu": len(open_now - open_prev),
        "behoben": len(fixed),
        "unveraendert": len(open_now & open_prev),
        "akzeptiert": accepted,
        "neu_akzeptiert": len(newly_accepted),
        "neue_clients": sorted(cur_clients - prev_clients),
        "verschwundene_clients": sorted(c for c in prev_clients - cur_clients if c),
    }


def snapshot(apps, run_id: str, run_date: str, coverage: dict | None = None) -> dict:
    """Eine Zeile für verlauf.json: je Thema, wie viele Apps oder Clients rot, gelb, grau sind."""
    counts = {k: {"rot": 0, "gelb": 0, "grau": 0} for k, _, _ in themen.THEMES}
    for a in apps:
        for k, (st, _) in themen.theme_status(a).items():
            if st in counts[k]:
                counts[k][st] += 1
    open_ = sum(1 for a in apps for f in a.findings if _open(f.severity, f.status))
    return {"run_id": run_id, "date": run_date, "clients": len(apps), "open": open_,
            "accepted": sum(len(a.accepted) for a in apps), "themes": counts,
            "coverage": {k: (coverage or {}).get(k) for k in ("workspaces", "workspaces_monitoring", "models", "runs")}
            if coverage else None}


def load_history(path: str) -> list[dict]:
    try:
        with open(path, encoding="utf-8") as fh:
            data = json.load(fh)
        return data.get("runs", []) if isinstance(data, dict) else []
    except (OSError, ValueError):
        return []


def write_history(path: str, runs: list[dict]) -> None:
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump({"runs": runs[-HISTORY_MAX:]}, fh, ensure_ascii=False, indent=2)


def trend_line(t: dict | None) -> str:
    """„Seit dem letzten Lauf (12.11.2026): 3 neu, 5 behoben, 12 unverändert, 2 akzeptiert.“"""
    if not t or not t.get("previous"):
        return ""
    d = t["previous"]["date"]
    dd = f"{d[8:10]}.{d[5:7]}.{d[0:4]}" if len(d) >= 10 else d
    s = (f"Seit dem letzten Lauf ({dd}): {t['neu']} neu, {t['behoben']} behoben, {t['unveraendert']} unverändert, "
         f"{t['akzeptiert']} bewusst akzeptiert.")
    if t.get("neue_clients"):
        s += " Neu dabei: " + ", ".join(t["neue_clients"][:8]) + ("…" if len(t["neue_clients"]) > 8 else "") + "."
    if t.get("verschwundene_clients"):
        s += " Nicht mehr dabei: " + ", ".join(t["verschwundene_clients"][:8]) + \
             ("…" if len(t["verschwundene_clients"]) > 8 else "") + "."
    return s
