"""Prüfbericht als HTML (eigenständig, ohne externe Ressourcen), JSON und Text."""
from __future__ import annotations

import datetime as _dt
import html
import json
import re
import subprocess
from urllib.parse import quote

from . import __version__
from .checks import CATEGORIES, SEV_ORDER, AppResult
from .texts import OVERALL_LABEL, OVERALL_ORDER, RULES

SYM = {"fail": "✗", "warn": "⚠", "info": "ℹ", "ok": "✓"}
SEV_LABEL = {"fail": "kritisch", "warn": "prüfen", "info": "Hinweis", "ok": "in Ordnung"}


def repo_meta(root: str) -> dict:
    def git(*a):
        try:
            return subprocess.run(["git", "-C", root, *a], capture_output=True, text=True, timeout=20).stdout.strip()
        except (OSError, subprocess.SubprocessError):
            return ""
    remote = git("remote", "get-url", "origin")
    m = re.search(r"github\.com[:/](.+?)(?:\.git)?$", remote)
    return {"remote": f"https://github.com/{m.group(1)}" if m else "", "sha": git("rev-parse", "HEAD"),
            "branch": git("rev-parse", "--abbrev-ref", "HEAD"), "slug": m.group(1) if m else ""}


def _link(meta: dict, path: str, line: int) -> str:
    if not meta.get("remote") or not meta.get("sha") or not path:
        return ""
    return f"{meta['remote']}/blob/{meta['sha']}/{quote(path)}" + (f"#L{line}" if line else "")


def to_json(apps: list[AppResult], root: str) -> str:
    meta = repo_meta(root)
    out = {"scanner": f"dwg-fabric-app-scanner {__version__}", "repo": meta, "created": _dt.datetime.now().isoformat(timespec="seconds"),
           "apps": []}
    for a in apps:
        out["apps"].append({
            "name": a.name, "path": a.path, "status": a.status(),
            "categories": {c: a.status(c) for c, _ in CATEGORIES},
            "connectors": [{"name": b.connector.name, "type": b.connector.type, "auth": b.connector.auth,
                            "model": b.model.name if b.model else None, "match": b.method,
                            "coverage": list(b.coverage), "queries": len(b.queries)} for b in a.bindings],
            "findings": [{"category": f.category, "severity": f.severity, "rule": f.rule, "title": f.title,
                          "detail": f.detail, "advice": f.advice,
                          "occurrences": [{"file": o[0], "line": o[1], "evidence": o[2]} for o in f.occurrences]}
                         for f in a.findings],
        })
    return json.dumps(out, ensure_ascii=False, indent=2)


def to_text(apps: list[AppResult]) -> str:
    w = max([len(a.name) for a in apps] + [4])
    head = "App".ljust(w) + "  " + "  ".join(f"{lbl.split()[0][:10]:<10}" for _, lbl in CATEGORIES)
    rows = [head, "-" * len(head)]
    for a in apps:
        cells = []
        for c, _ in CATEGORIES:
            st = a.status(c)
            n = sum(1 for f in a.findings if f.category == c and f.severity == st) if st != "ok" else 0
            cells.append(f"{SYM[st]} {n if n else '':<8}")
        rows.append(a.name.ljust(w) + "  " + "  ".join(cells))
    return "\n".join(rows)


CSS = """
:root{--bg:#FAFAF7;--card:#fff;--ink:#0F1E2E;--text:#26364A;--soft:#475569;--mute:#6B7686;--line:#E4E2DA;--sand:#F4F1E8;
--accent:#C25A2D;--teal:#0E8585;--fail:#B3282D;--warn:#B7791F;--info:#3B6FB5;--ok:#1E8F6E;--code:#F6F4EE}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#14181D;--card:#1B2027;--ink:#EEF1F4;--text:#D3D9E0;--soft:#AEB7C2;
--mute:#8A94A1;--line:#2C333C;--sand:#20262E;--code:#11161B;--fail:#F07075;--warn:#E3A84A;--info:#7FA8E6;--ok:#4CC29B;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#14181D;--card:#1B2027;--ink:#EEF1F4;--text:#D3D9E0;--soft:#AEB7C2;--mute:#8A94A1;--line:#2C333C;--sand:#20262E;
--code:#11161B;--fail:#F07075;--warn:#E3A84A;--info:#7FA8E6;--ok:#4CC29B;color-scheme:dark}
*{box-sizing:border-box}html,body{background:var(--bg)}
body{margin:0;font-family:"Segoe UI Variable Text","Segoe UI",system-ui,-apple-system,Roboto,Arial,sans-serif;color:var(--text);font-size:15px;line-height:1.55}
.wrap{max-width:1180px;margin:0 auto;padding-block:32px 80px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
h1{font-size:34px;line-height:1.1;letter-spacing:-.02em;color:var(--ink);margin:6px 0 8px;font-weight:750}
h2{font-size:22px;color:var(--ink);margin:40px 0 12px;font-weight:700;border-bottom:2px solid var(--accent);padding-bottom:6px}
h3{font-size:16px;color:var(--ink);margin:18px 0 8px;font-weight:650}
.eyebrow,.mono,code,pre{font-family:"Cascadia Mono",Consolas,"JetBrains Mono",ui-monospace,monospace}
.eyebrow{font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}
.lead{color:var(--soft);max-width:80ch;margin:0 0 6px}
.meta{font-size:12.5px;color:var(--mute)}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:22px 0}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 14px}
.kpi b{display:block;font-size:26px;color:var(--ink);line-height:1.1}.kpi span{font-size:12.5px;color:var(--mute)}
.tbl{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden}
.tbl th,.tbl td{padding:9px 10px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
.tbl th{font-size:12px;letter-spacing:.04em;color:var(--soft);background:var(--sand);font-weight:650}
.tbl td.c{text-align:center;white-space:nowrap}.tbl a{color:var(--ink);font-weight:600;text-decoration:none}
.scroll{overflow-x:auto}
.s{display:inline-flex;align-items:center;gap:5px;font-weight:700}
.s.fail{color:var(--fail)}.s.warn{color:var(--warn)}.s.info{color:var(--info)}.s.ok{color:var(--ok)}
.pill{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;border-radius:99px;padding:2px 9px;
border:1.5px solid currentColor;white-space:nowrap}
.pill.fail{color:var(--fail)}.pill.warn{color:var(--warn)}.pill.info{color:var(--info)}.pill.ok{color:var(--ok)}
.app{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px 20px;margin:18px 0}
.app header{display:flex;flex-wrap:wrap;align-items:baseline;gap:10px 14px}
.app header h2{border:0;margin:0;padding:0;font-size:21px}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 4px}
.chip{font-size:12.5px;border:1px solid var(--line);background:var(--sand);border-radius:99px;padding:3px 10px;color:var(--soft)}
.chip b{color:var(--ink);font-weight:650}
details{border-top:1px solid var(--line)}details:first-of-type{border-top:0}
summary{cursor:pointer;list-style:none;display:flex;gap:10px;align-items:baseline;padding:9px 2px}
summary::-webkit-details-marker{display:none}
summary .t{color:var(--ink);font-weight:600;flex:1}summary .n{font-size:12.5px;color:var(--mute);white-space:nowrap}
.body{padding:0 2px 12px 2px}
.body p{margin:4px 0;color:var(--soft);max-width:95ch}.body .adv{color:var(--text)}.body .adv b{color:var(--teal)}
.occ{margin:8px 0 0;padding:0;list-style:none}
.occ li{margin:6px 0}.occ .loc{font-size:12.5px}.occ .loc a{color:var(--teal)}
pre{background:var(--code);border:1px solid var(--line);border-radius:8px;padding:8px 10px;margin:4px 0 0;font-size:12.5px;line-height:1.45;
white-space:pre-wrap;word-break:break-word;color:var(--text)}
.cat{margin-top:14px}.cat>h3{display:flex;gap:8px;align-items:center}
.note{background:var(--sand);border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:10px;padding:12px 16px;color:var(--soft)}
.legend{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}
.legend div{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 14px;font-size:13.5px;color:var(--soft)}
.legend b{color:var(--ink);display:block;margin-bottom:2px}
a,.loc,.chip,.meta,summary .t,td{overflow-wrap:anywhere}
.big{list-style:none;padding:0;margin:8px 0}
.big li{position:relative;padding:9px 0 9px 30px;border-bottom:1px solid var(--line);color:var(--text)}
.big li:last-child{border-bottom:0}.big li .s{position:absolute;left:4px;top:9px}
.big li small{display:block;color:var(--soft);font-size:13.5px;margin-top:2px}.big li small b{color:var(--teal);font-weight:650}
.profile{font-size:15px;color:var(--text);margin:8px 0 2px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:12px 0}
.stat{border:1px solid var(--line);border-radius:10px;padding:8px 12px;background:var(--bg)}
.stat b{display:block;font-size:22px;color:var(--ink);line-height:1.15}.stat span{font-size:12.5px;color:var(--mute)}
.stat.bad b{color:var(--warn)}.stat.good b{color:var(--ok)}
.lin{margin:10px 0 4px;overflow-x:auto}.lin svg{display:block;min-width:640px;width:100%;height:auto}
.lin .bx{fill:var(--card);stroke:var(--line);stroke-width:1.5}.lin .bx.app{fill:var(--sand);stroke:var(--ink)}
.lin .bx.ok{stroke:var(--teal)}.lin .bx.bad{stroke:var(--fail);stroke-dasharray:5 4}.lin .bx.warn{stroke:var(--warn);stroke-dasharray:5 4}
.lin .ln{stroke:var(--soft);stroke-width:1.4;fill:none}.lin .ln.bad{stroke:var(--fail);stroke-dasharray:5 4}.lin .ln.warn{stroke:var(--warn);stroke-dasharray:5 4}
.lin text{font-size:12.5px;fill:var(--text);font-family:inherit}.lin text.t{font-weight:650;fill:var(--ink)}.lin text.m{fill:var(--mute);font-size:11.5px}
.lin text.bad{fill:var(--fail)}
details.dev{margin-top:12px;border:1px dashed var(--line);border-radius:10px;padding:0 12px}
details.dev>summary{font-size:13.5px;color:var(--soft)}
footer{margin-top:40px;font-size:12.5px;color:var(--mute)}
@media (max-width:640px){h1{font-size:27px}.app{padding:14px}}
"""


EXPLAIN = {
    "calc": "Rechnet die App selbst, statt die Kennzahlen des Modells (Measures) abzufragen?",
    "lineage": "Ist der Weg von der App über das Modell bis zur Datenquelle vollständig und nachvollziehbar?",
    "security": "Sieht jeder Nutzer nur, was er sehen darf? Verlassen Daten den Tenant?",
    "query": "Verändert die App, was das Modell rechnet, etwa durch feste oder aufgehobene Filter?",
    "deviation": "Können in der App andere Zahlen herauskommen als im Power-BI-Bericht auf demselben Modell?",
}


def _names(f) -> str:
    names = []
    for _, _, ev in f.occurrences:
        m = re.match(r"^\[(.+?)\] im Modell", ev or "")
        if m and m.group(1) not in names:
            names.append(m.group(1))
    return ", ".join(names[:8]) + (" …" if len(names) > 8 else "")


def plain(f, origin: str = "repo") -> dict:
    d = _plain(f)
    if origin == "log":
        d = {k: (v.replace("Die App ", "Der Client ").replace("die App ", "der Client ").replace("der App", "des Clients")
                 .replace("in der App", "im Client") if isinstance(v, str) else v) for k, v in d.items()}
    return d


def _plain(f) -> dict:
    t = RULES.get(f.rule)
    n = len(f.occurrences)
    if not t:
        return {"head": f.title, "why": f.detail, "todo": f.advice}
    head = t["head"].format(n=n, names=_names(f))
    if f.rule == "CALC-TS" and f.severity == "info":
        head = f"An {n} Stellen rechnet der Darstellungscode mit Werten aus den Abfragen (Skalierung, Formatierung)."
    if f.rule == "SEC-STORAGE" and f.severity == "info":
        head = "Die App merkt sich Einstellungen im Browser."
    if f.rule == "SEC-HIDDEN" and f.severity == "warn":
        head = f"Die App liest ausgeblendete Felder mit vertraulich klingendem Namen ({n})."
    if f.rule in ("LIN-MISSING-FIELD", "LIN-MISSING-TABLE"):
        head += " " + f.title
    return {"head": head, "why": t["why"], "todo": t["todo"]}


def overall(apps: list[AppResult], noun: str = "Apps") -> list[tuple[str, str]]:
    out = []
    N = len(apps)
    for rule in OVERALL_ORDER:
        label = OVERALL_LABEL.get(rule)
        if not label:
            continue
        hit = [a for a in apps if any(f.rule == rule and (f.severity in ("fail", "warn") or rule == "SEC-NO-RLS") for f in a.findings)]
        if not hit:
            continue
        sev = min((f.severity for a in hit for f in a.findings if f.rule == rule), key=lambda x: SEV_ORDER[x])
        names = ", ".join(a.name.replace("datenwg-", "") for a in hit) if len(hit) < N else "alle"
        out.append((sev, f"<b>{len(hit)} von {N} {noun}</b>: {html.escape(label)} <span class='meta'>({html.escape(names)})</span>"))
    return out


def _date(ts: str) -> str:
    m = re.match(r"(\d{4})-(\d{2})-(\d{2})", ts or "")
    return f"{m.group(3)}.{m.group(2)}.{m.group(1)}" if m else (ts or "?")


def profile(a: AppResult) -> str:
    if a.origin == "log":
        mt = a.meta
        b = a.bindings[0] if a.bindings else None
        who = "unter einem Service Principal" if b and b.connector.auth != "delegated" else "als angemeldete Nutzer"
        model = f"das Semantikmodell „{b.model.name}“" if b and b.model else f"das Modell „{mt.get('model')}“ (nicht im Scan)"
        return (f"Der Client „{a.name}“ fragt {model} im Workspace „{mt.get('workspace')}“ ab, {who}: "
                f"{mt.get('distinct')} verschiedene Abfragen, {mt.get('runs')} Ausführungen von {mt.get('users')} Nutzern "
                f"zwischen {_date(mt.get('first'))} und {_date(mt.get('last'))}.")
    parts = []
    for b in a.bindings:
        c = b.connector
        who = "als angemeldeter Nutzer" if c.auth == "delegated" else f"mit eigener App-Identität ({c.auth})"
        if c.type == "fabric-semanticmodel":
            if b.model:
                parts.append(f"liest das Semantikmodell „{b.model.name}“ {who}, mit {len(b.queries)} Abfragen auf "
                             f"{len(b.tables)} Tabellen")
            else:
                parts.append(f"liest ein Semantikmodell {who}, das nicht im Repository liegt ({len(b.queries)} Abfragen)")
        else:
            kind = {"fabric-sqlanalytics": "den SQL-Endpunkt eines Lakehouse", "fabric-lakehouse": "ein Lakehouse",
                    "fabric-warehouse": "ein Warehouse"}.get(c.type, c.type)
            n = len({t["table"] for t in a.sql_tables})
            parts.append(f"liest {kind} direkt {who}" + (f", {n} Tabellen" if n else ""))
    return ("Die App " + "; außerdem ".join(parts) + ".") if parts else "Keine Datenquelle gefunden."


def stats(a: AppResult) -> list[tuple[str, str, str]]:
    sm = [b for b in a.bindings if b.model is not None]
    out = []
    if sm:
        total = sum(b.model.measure_count for b in sm)
        used = sum(len(b.measures_used) for b in sm)
        out.append((str(total), "Measures im Modell", ""))
        out.append((str(used), "davon vom Client genutzt" if a.origin == "log" else "davon von der App genutzt", "good" if used else "bad"))
    calc = sum(len(f.occurrences) for f in a.findings if f.rule in ("CALC-TS",) and f.severity == "warn") + \
        sum(len(f.occurrences) for f in a.findings if f.rule in ("CALC-PROJ", "CALC-DEFINE"))
    out.append((str(calc), "Rechenstellen in den Abfragen" if a.origin == "log" else "Rechenstellen in der App", "bad" if calc else "good"))
    dup = sum(len(f.occurrences) for f in a.findings if f.rule == "DEV-NAME")
    if sm:
        out.append((str(dup), "Modell-Kennzahlen erkennbar nachgerechnet", "bad" if dup else ""))
    if a.origin == "log":
        out.append((str(a.meta.get("runs", 0)), "Ausführungen im Zeitraum", ""))
        out.append((str(a.meta.get("users", 0)), "Nutzer", ""))
    elif a.queries or not a.sql_tables:
        out.append((str(len(a.queries)), "Abfragen", ""))
    else:
        out.append((str(len({t["table"] for t in a.sql_tables})), "Tabellen direkt gelesen", "bad"))
    return out


def _txt(x, y, s, cls="", anchor="start"):
    return f"<text x='{x}' y='{y}' class='{cls}' text-anchor='{anchor}'>{html.escape(s)}</text>"


def _cut(s: str, n: int) -> str:
    return s if len(s) <= n else s[: n - 1] + "…"


def lineage_svg(a: AppResult) -> str:
    """App → Konnektor → Modell/Quelle → Tabellen; Brüche gestrichelt rot/gelb."""
    W, BW, BH, GAP = 960, 210, 40, 10
    X = [10, 250, 490, 740]
    rows = []  # pro Konnektor: (binding, tabellenliste)
    for b in a.bindings:
        if b.connector.type == "fabric-semanticmodel":
            tl = sorted(b.tables.items(), key=lambda kv: -(len(kv[1]["columns"]) + len(kv[1]["measures"])))
            items = [(t, f"{len(v['columns'])} Spalten · {len(v['measures'])} Measures", "ok") for t, v in tl]
            items += [(x, "fehlt im Modell", "bad") for x in sorted(b.missing)]
        else:
            items = [(t["table"], f"{len(t['columns'])} Spalten" + (" · ungefiltert" if t["all"] and not t["filtered"] else ""), "warn")
                     for t in a.sql_tables]
        if len(items) > 7:
            items = items[:6] + [(f"+ {len(items) - 6} weitere", "", items[6][2])]
        rows.append((b, items or [("keine Abfragen erkannt", "", "warn")]))
    if not rows:
        return ""
    H = sum(max(len(it), 1) * (BH + GAP) + 18 for _, it in rows) + 10
    out = [f"<svg viewBox='0 0 {W} {H}' role='img' aria-label='Lineage der App'>"]
    app_y = H / 2 - BH / 2
    out.append(f"<rect class='bx app' x='{X[0]}' y='{app_y}' width='{BW}' height='{BH}' rx='8'/>")
    out.append(_txt(X[0] + 12, app_y + 17, "Client" if a.origin == "log" else "App", "m") + _txt(X[0] + 12, app_y + 32, _cut(a.name, 28), "t"))
    y0 = 10
    for b, items in rows:
        c = b.connector
        block = len(items) * (BH + GAP)
        cy = y0 + block / 2 - BH / 2
        auth_bad = c.auth != "delegated"
        out.append(f"<path class='ln {'warn' if auth_bad else ''}' d='M{X[0] + BW},{app_y + BH / 2} C{X[0] + BW + 20},{app_y + BH / 2} "
                   f"{X[1] - 20},{cy + BH / 2} {X[1]},{cy + BH / 2}'/>")
        out.append(f"<rect class='bx {'warn' if auth_bad else 'ok'}' x='{X[1]}' y='{cy}' width='{BW}' height='{BH}' rx='8'/>")
        out.append(_txt(X[1] + 12, cy + 17, "Konnektor · " + ("Nutzer" if not auth_bad else "App-Identität"), "m")
                   + _txt(X[1] + 12, cy + 32, _cut(c.name, 28), "t"))
        if c.type == "fabric-semanticmodel":
            lbl, sub, cls = (b.model.name, f"{len(b.measures_used)} von {b.model.measure_count} Measures genutzt",
                             "ok" if b.measures_used or not b.queries else "warn") if b.model \
                else ("Modell nicht im Repo", "nicht prüfbar", "bad")
        else:
            lbl, sub, cls = (c.type.replace("fabric-", ""), "am Modell vorbei", "warn")
        out.append(f"<path class='ln {cls if cls != 'ok' else ''}' d='M{X[1] + BW},{cy + BH / 2} L{X[2]},{cy + BH / 2}'/>")
        out.append(f"<rect class='bx {cls}' x='{X[2]}' y='{cy}' width='{BW}' height='{BH}' rx='8'/>")
        out.append(_txt(X[2] + 12, cy + 17, sub, "m") + _txt(X[2] + 12, cy + 32, _cut(lbl, 28), "t"))
        for i, (name, meta, st) in enumerate(items):
            ty = y0 + i * (BH + GAP)
            out.append(f"<path class='ln {st if st != 'ok' else ''}' d='M{X[2] + BW},{cy + BH / 2} C{X[2] + BW + 20},{cy + BH / 2} "
                       f"{X[3] - 20},{ty + BH / 2} {X[3]},{ty + BH / 2}'/>")
            out.append(f"<rect class='bx {st}' x='{X[3]}' y='{ty}' width='{W - X[3] - 10}' height='{BH}' rx='8'/>")
            out.append(_txt(X[3] + 12, ty + 17, meta, "m bad" if st == "bad" else "m") + _txt(X[3] + 12, ty + 32, _cut(name, 30), "t"))
        y0 += block + 18
    out.append("</svg>")
    return "".join(out)


def _dev_details(a: AppResult, meta: dict) -> str:
    e = html.escape
    parts = []
    for c, lbl in CATEGORIES:
        fs = [f for f in a.findings if f.category == c]
        if not fs:
            continue
        cst = a.status(c)
        parts.append(f"<div class='cat'><h3><span class='s {cst}'>{SYM[cst]}</span>{e(lbl)}</h3>")
        for f in fs:
            n = len(f.occurrences)
            parts.append(f"<details><summary><span class='pill {f.severity}'>{SEV_LABEL[f.severity]}</span>"
                         f"<span class='t'>{e(f.title)}</span><span class='n mono'>{e(f.rule)} · {n}×</span></summary><div class='body'>")
            if f.detail:
                parts.append(f"<p>{e(f.detail)}</p>")
            parts.append("<ul class='occ'>")
            for file, line, ev in f.occurrences[:40]:
                href = _link(meta, file, line) if a.origin == "repo" else ""
                loc = e(f"{file}:{line}" if line else file)
                loc = f"<a href='{e(href)}'>{loc}</a>" if href else loc
                parts.append(f"<li><div class='loc mono'>{loc}</div>" + (f"<pre>{e(ev)}</pre>" if ev else "") + "</li>")
            if n > 40:
                parts.append(f"<li class='meta'>… und {n - 40} weitere Fundstellen</li>")
            parts.append("</ul></div></details>")
        parts.append("</div>")
    return "".join(parts)


def _tenant_section(t: dict) -> str:
    e = html.escape
    rows = t.get("models", [])
    used_rows = [r for r in rows if r["clients"]]
    P = ["<h2>Modelle im Tenant</h2>",
         f"<p class='meta'>{len(rows)} Semantikmodelle im Scan, {len(used_rows)} davon im Zeitraum von Clients außerhalb "
         "von Power-BI-Berichten abgefragt.</p><div class='scroll'><table class='tbl'><thead><tr><th>Modell</th><th>Workspace</th>"
         "<th>Measures</th><th>von Clients genutzt</th><th>RLS-Rollen</th><th>Clients</th></tr></thead><tbody>"]
    for r in rows[:60]:
        rls = f"<span class='s ok'>{r['rls']}</span>" if r["rls"] else "<span class='s info'>keine</span>"
        cl = ", ".join(e(x) for x in r["clients"][:4]) + (f" +{len(r['clients']) - 4}" if len(r["clients"]) > 4 else "")
        err = f" <span class='meta'>(Schema nicht lesbar)</span>" if r.get("error") else ""
        P.append(f"<tr><td>{e(r['model'])}{err}</td><td class='meta'>{e(r['workspace'])}</td><td class='c'>{r['measures']}</td>"
                 f"<td class='c'>{r['used'] if r['clients'] else '–'}</td><td class='c'>{rls}</td><td>{cl or '<span class=meta>–</span>'}</td></tr>")
    P.append("</tbody></table></div>")
    if len(rows) > 60:
        P.append(f"<p class='meta'>… und {len(rows) - 60} weitere Modelle ohne Client-Abfragen.</p>")
    return "".join(P)


def to_html(apps: list[AppResult], root: str, title: str = "", tenant: dict | None = None) -> str:
    meta = repo_meta(root) if root else {}
    e = html.escape
    now = _dt.datetime.now().strftime("%d.%m.%Y %H:%M")
    nq = sum(len(a.queries) for a in apps)
    cnt = {s: sum(1 for a in apps for f in a.findings if f.severity == s) for s in ("fail", "warn", "info")}
    slug = meta.get("slug") or root or (tenant or {}).get("scope", "Tenant")
    lead = ("Rechnen die Apps mit den Kennzahlen des Semantikmodells oder mit eigener Logik? Ist der Datenweg "
            "nachvollziehbar, und sieht jeder nur, was er sehen darf? Geprüft wurden der Code und die Abfragen jeder App gegen "
            "das Modell im Repository, ohne Zugriff auf Fabric oder echte Daten.")
    if tenant:
        lead = ("Welche Anwendungen fragen die Semantikmodelle des Tenants ab, und wie? Geprüft wurden die tatsächlich "
                "ausgeführten DAX-Abfragen aus dem Workspace Monitoring gegen die Modelle aus der Admin-Scanner-API: "
                "Rechnen die Clients selbst, verändern sie Filter, lesen sie ausgeblendete Felder, laufen sie unter "
                "technischen Identitäten? Power-BI-Berichte sind ausgenommen, geprüft wird alles andere.")
    firsts = [a.meta.get("first") for a in apps if a.meta.get("first")]
    lasts = [a.meta.get("last") for a in apps if a.meta.get("last")]
    period = f"Abfragen {_date(min(firsts))} bis {_date(max(lasts))}" if firsts else "keine Abfragen im Zeitraum"
    kpis = ([(len(apps), "Apps geprüft"), (nq, "Abfragen gelesen")] if not tenant else
            [(len(tenant.get("models", [])), "Modelle im Scan"), (len(apps), "Clients"),
             (sum(a.meta.get("runs", 0) for a in apps), "Abfragen ausgeführt")])
    P = [f"<!doctype html><html lang='de'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>"
         f"<title>Fabric App Scan</title><style>{CSS}</style></head><body><div class='wrap'>",
         f"<div class='eyebrow'>Governance-Prüfung · Fabric Apps</div>",
         f"<h1>{e(title or 'Prüfbericht Fabric Apps')}</h1>",
         f"<p class='lead'>{e(lead)}</p>",
         f"<div class='meta mono'>{e(slug)} · {e(period if tenant else (meta.get('sha') or '')[:10])} · erstellt {now}</div>",
         "<div class='kpis'>",
         "".join(f"<div class='kpi'><b>{v}</b><span>{e(l)}</span></div>" for v, l in kpis),
         f"<div class='kpi'><b class='s fail'>{cnt['fail']}</b><span>kritisch</span></div>",
         f"<div class='kpi'><b class='s warn'>{cnt['warn']}</b><span>zu prüfen</span></div>",
         f"<div class='kpi'><b class='s info'>{cnt['info']}</b><span>Hinweise</span></div>",
         "</div>",
         "<h2>Gesamtbild</h2><ul class='big'>"]
    ov = overall(apps, "Clients" if tenant else "Apps")
    for sev, sent in ov:
        P.append(f"<li><span class='s {sev}'>{SYM[sev]}</span>{sent}</li>")
    if not ov:
        P.append("<li><span class='s ok'>✓</span>Keine Befunde, die geprüft werden müssten.</li>")
    P.append("</ul>")
    if tenant:
        P.append(_tenant_section(tenant))

    who = "Client" if tenant else "App"
    P.append(f"<h2>Ampel je {who}</h2><div class='scroll'><table class='tbl'><thead><tr><th>{who}</th>")
    P += [f"<th title='{e(EXPLAIN[c])}'>{e(lbl)}</th>" for c, lbl in CATEGORIES]
    P.append("</tr></thead><tbody>")
    for a in apps:
        P.append(f"<tr><td><a href='#{e(a.name)}'>{e(a.name)}</a></td>")
        for c, _ in CATEGORIES:
            st = a.status(c)
            P.append(f"<td class='c'><span class='s {st}' title='{SEV_LABEL[st]}'>{SYM[st]}</span></td>")
        P.append("</tr>")
    P.append("</tbody></table></div><p class='meta'>✗ kritisch · ⚠ zu prüfen · ℹ Hinweis · ✓ nichts gefunden.</p>")
    P.append("<div class='legend'>" + "".join(f"<div><b>{e(lbl)}</b>{e(EXPLAIN[c])}</div>" for c, lbl in CATEGORIES) + "</div>")

    for a in apps:
        st = a.status()
        P.append(f"<section class='app' id='{e(a.name)}'><header><h2>{e(a.name)}</h2>"
                 f"<span class='pill {st}'>{SYM[st]} {SEV_LABEL[st]}</span></header>")
        P.append(f"<p class='profile'>{e(profile(a))}</p><div class='stats'>")
        for v, lbl, cls in stats(a):
            P.append(f"<div class='stat {cls}'><b>{e(v)}</b><span>{e(lbl)}</span></div>")
        P.append("</div><h3>Datenweg</h3>")
        P.append(f"<div class='lin'>{lineage_svg(a)}</div>")
        main = [f for f in a.findings if f.severity in ("fail", "warn")]
        rest = [f for f in a.findings if f.severity == "info"]
        P.append("<h3>Das Wichtigste</h3>")
        if not main:
            P.append("<p class='s ok'>✓ Nichts, was geprüft werden müsste.</p>")
        else:
            P.append("<ul class='big'>")
            for f in main:
                t = plain(f, a.origin)
                P.append(f"<li><span class='s {f.severity}'>{SYM[f.severity]}</span>{e(t['head'])}"
                         f"<small>{e(t['why'])}" + (f" <b>Was tun:</b> {e(t['todo'])}" if t['todo'] else "") + "</small></li>")
            P.append("</ul>")
        if rest:
            P.append("<details><summary><span class='t'>Weitere Hinweise</span><span class='n'>" + str(len(rest)) + "</span></summary><ul class='big'>")
            for f in rest:
                t = plain(f, a.origin)
                P.append(f"<li><span class='s info'>ℹ</span>{e(t['head'])}<small>{e(t['why'])}</small></li>")
            P.append("</ul></details>")
        dev_lbl = "Abfragen im Wortlaut (für Entwickler)" if a.origin == "log" else "Fundstellen im Code (für Entwickler)"
        P.append(f"<details class='dev'><summary><span class='t'>{dev_lbl}</span></summary>"
                 + _dev_details(a, meta) + "</details></section>")

    P.append("<h2>Grenzen dieser Prüfung</h2><div class='note'><p>Geprüft wurden Code und Modell-Definition, nicht die laufende App und nicht "
             "die Daten. Der Scanner erkennt Muster; Befunde sind Hinweise zum Prüfen, kein Urteil. Abfragen, die erst zur Laufzeit "
             "entstehen, sind nur teilweise sichtbar. Noch nicht enthalten: der Live-Abgleich jeder Zahl der App gegen das Modell "
             "und die Rechte im Workspace.</p></div>")
    P.append(f"<footer>dwg fabric app scanner {e(__version__)} · Daten-WG Knowledge Kitchen</footer></div></body></html>")
    return "".join(P)
