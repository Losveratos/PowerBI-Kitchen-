"""Die fünf Prüfbereiche: aus App, Abfragen und Modell werden Befunde."""
from __future__ import annotations

import os
import re
from dataclasses import dataclass, field

from . import dax, rayfin, tsscan
from .tmdl import Model, item_to_logical

CATEGORIES = [
    ("calc", "Berechnungen in der App"),
    ("lineage", "Lineage-Brüche"),
    ("security", "Sicherheitsrisiken"),
    ("query", "Veränderte Abfragen"),
    ("deviation", "Abweichungen zum Modell"),
]
SEV_ORDER = {"fail": 0, "warn": 1, "info": 2, "ok": 3}
SENSITIVE = re.compile(r"(?i)gehalt|salary|lohn|iban|bic|steuer|tax.?id|ssn|geburt|birth|e-?mail|telefon|phone|adresse|address|passwort|password|personal|kranken|health|bonus")


@dataclass
class Finding:
    category: str
    severity: str        # fail | warn | info | ok
    rule: str
    title: str
    detail: str = ""
    file: str = ""
    line: int = 0
    evidence: str = ""
    advice: str = ""
    occurrences: list = field(default_factory=list)   # [(file, line, evidence)]


@dataclass
class Binding:
    connector: rayfin.Connector
    model: Model | None = None
    method: str = ""
    coverage: tuple[int, int] = (0, 0)
    queries: list[dax.Query] = field(default_factory=list)
    tables: dict = field(default_factory=dict)        # Tabelle → {"columns": set, "measures": set}
    measures_used: set = field(default_factory=set)
    missing: set = field(default_factory=set)         # nicht auflösbare Tabellen/Felder


@dataclass
class AppResult:
    name: str
    path: str
    rayfin: rayfin.RayfinApp | None
    bindings: list[Binding] = field(default_factory=list)
    files: int = 0
    findings: list[Finding] = field(default_factory=list)
    sql_tables: list[dict] = field(default_factory=list)
    origin: str = "repo"          # repo | log (aus Abfrage-Logs des Tenants)
    meta: dict = field(default_factory=dict)

    def add(self, *a, **kw):
        self.findings.append(Finding(*a, **kw))

    def status(self, cat: str | None = None) -> str:
        fs = [f for f in self.findings if cat is None or f.category == cat]
        if not fs:
            return "ok"
        return min((f.severity for f in fs), key=lambda s: SEV_ORDER[s])

    @property
    def queries(self) -> list[dax.Query]:
        return [q for b in self.bindings for q in b.queries]


# ---------------------------------------------------------------- Zuordnung

def _resolve(q: dax.Query, m: Model) -> tuple[int, int]:
    ok = tot = 0
    for r in q.refs:
        if r.table is None:
            continue
        if r.table.lower() in q.tvars:
            continue
        tot += 1
        t = m.table(r.table)
        if t and (r.name.lower() in t.columns or r.name.lower() in t.measures):
            ok += 1
    return ok, tot


def bind_models(app: AppResult, models: list[Model], overrides: dict) -> None:
    for b in app.bindings:
        c = b.connector
        want = overrides.get(f"{app.name}:{c.name}") or overrides.get(c.item_id)
        if want:
            b.model = next((m for m in models if m.name == want or m.path == want), None)
            b.method = "Konfiguration" if b.model else f"Konfiguration (Modell „{want}“ nicht gefunden)"
        if b.model is None and c.item_id:
            lid = item_to_logical(c.item_id)
            b.model = next((m for m in models if m.logical_id and m.logical_id.lower() in (lid, c.item_id.lower())), None)
            if b.model:
                b.method = "itemId ↔ logicalId (Fabric-Git)"
        ok = tot = 0
        if b.model is None and b.queries and models:
            best = None
            for m in models:
                o = t = 0
                for q in b.queries:
                    a, z = _resolve(q, m)
                    o, t = o + a, t + z
                if t and (best is None or o / t > best[1] / max(best[2], 1)):
                    best = (m, o, t)
            if best and best[2] and best[1] / best[2] >= 0.6:
                b.model = best[0]
                b.method = f"Abdeckung der Abfragen ({best[1]}/{best[2]} Verweise)"
        if b.model:
            for q in b.queries:
                a, z = _resolve(q, b.model)
                ok, tot = ok + a, tot + z
            b.coverage = (ok, tot)


def assign_queries(app: AppResult, queries: list[dax.Query]) -> None:
    sm = [b for b in app.bindings if b.connector.type == "fabric-semanticmodel"]
    for q in queries:
        target = None
        if len(sm) == 1:
            target = sm[0]
        else:
            parts = re.split(r"[\\/]", q.source.lower())
            for b in sm:
                n = b.connector.name.lower()
                if n in parts or any(p.startswith(n) for p in parts[-2:]):
                    target = b
                    break
        if target is None and sm:
            target = sm[0]
            q.connector = "?"
        if target:
            target.queries.append(q)
            q.connector = q.connector or target.connector.name


# ---------------------------------------------------------------- Prüfungen

def _loc(q: dax.Query, line: int) -> tuple[str, int]:
    return q.source, q.abs_line(line)


def check_app(app: AppResult, files: list[tsscan.SourceFile], repo_root: str, app_dir: str) -> None:
    rf = app.rayfin
    sm_bind = [b for b in app.bindings if b.connector.type == "fabric-semanticmodel"]

    # ---------- Sicherheit: Konnektoren, Hosting
    if rf:
        for c in rf.connectors:
            if c.auth != "delegated":
                sev = "fail" if c.type == "fabric-semanticmodel" else "warn"
                app.add("security", sev, "SEC-AUTH", f"Konnektor „{c.name}“ greift mit App-Identität zu ({c.auth})",
                        f"Typ {c.type}. Alle Nutzer sehen, was die App-Identität sehen darf; Zeilensicherheit je Person greift nicht.",
                        os.path.relpath(rf.path, repo_root), 0, f"auth:\n  type: {c.auth}",
                        "Auf auth.type: delegated umstellen oder bewusst dokumentieren, warum alle Nutzer alle Daten sehen dürfen.")
        if rf.get("services", "auth", "password", "enabled") is True:
            app.add("security", "warn", "SEC-PASSWORD", "Passwort-Anmeldung ist aktiv",
                    "Neben Fabric-SSO ist eine eigene Passwort-Anmeldung eingeschaltet.", os.path.relpath(rf.path, repo_root),
                    advice="services.auth.password.enabled: false, Anmeldung nur über Fabric/Entra.")
        if rf.get("services", "auth", "enabled") is False:
            app.add("security", "warn", "SEC-NOAUTH", "Anmeldung ist ausgeschaltet", "", os.path.relpath(rf.path, repo_root))
        access = rf.get("services", "staticHosting", "assetAccess")
        if access and access != "protected":
            app.add("security", "warn", "SEC-ASSETS", f"Statische Dateien sind „{access}“ erreichbar",
                    "Build-Dateien (inkl. eingebetteter Daten oder Abfragen) sind ohne Anmeldung abrufbar.",
                    os.path.relpath(rf.path, repo_root), advice="assetAccess: protected")
        uris = rf.get("services", "auth", "allowedRedirectUris") or []
        local = [u for u in uris if isinstance(u, str) and re.search(r"localhost|127\.0\.0\.1", u)]
        if local and any(isinstance(u, str) and "fabricapps.net" in u for u in uris):
            app.add("security", "info", "SEC-REDIRECT", "Lokale Redirect-URIs auch in der deployten Konfiguration",
                    ", ".join(local), os.path.relpath(rf.path, repo_root),
                    advice="Für Produktion getrennte Konfiguration ohne localhost, sonst unkritisch.")
    for b in sm_bind:
        if b.model is not None and not b.model.roles:
            app.add("security", "info", "SEC-NO-RLS", f"Modell „{b.model.name}“ hat keine Rollen (RLS)",
                    "Delegierter Zugriff schützt nur, wenn das Modell Zeilen nach Nutzer einschränkt. Ohne Rollen sieht jeder mit Lesezugriff alles.",
                    b.model.path, advice="Gewollt bei Demo- oder Gesamtdaten; sonst Rollen im Modell anlegen, nicht in der App.")

    for h in tsscan.security_hits(files):
        f, ln = h.file.rel, h.line
        if h.rule == "storage":
            data_like = re.search(r"(?i)rows|data|result|cache|query|export|daten", h.evidence)
            app.add("security", "warn" if data_like else "info", "SEC-STORAGE",
                    "Daten im Browser-Speicher" if data_like else "Browser-Speicher (vermutlich UI-Zustand)",
                    "localStorage/sessionStorage überlebt die Sitzung und ist für jedes Skript der Seite lesbar.",
                    f, ln, h.evidence, "Nur UI-Zustand speichern, keine Abfrageergebnisse.")
        elif h.rule == "html":
            app.add("security", "warn", "SEC-HTML", "HTML/Code wird zur Laufzeit eingefügt", "", f, ln, h.evidence,
                    "Inhalte escapen oder als Text rendern; kein eval/new Function.")
        elif h.rule == "external":
            app.add("security", "warn", "SEC-EXTERNAL", f"Abruf an fremden Server ({h.extra['host']})",
                    "Daten oder Nutzungsinfos könnten den Tenant verlassen.", f, ln, h.evidence,
                    "Fremde Dienste entfernen oder freigeben und dokumentieren.")
        elif h.rule == "fetch-dynamic":
            app.add("security", "info", "SEC-FETCH", "Netzwerkabrufe mit berechneter Adresse", "Ziel ist statisch nicht erkennbar; meist Konfiguration der App.",
                    f, ln, h.evidence)
        elif h.rule == "client-filter":
            app.add("security", "warn", "SEC-CLIENT-RLS", "Filter nach Nutzer im Browser",
                    "Sieht aus wie Zeilensicherheit in der App. Die Daten sind dann trotzdem im Browser.", f, ln, h.evidence,
                    "Zeilensicherheit im Modell (RLS) umsetzen.")
        elif h.rule == "secret":
            app.add("security", "fail", "SEC-SECRET", f"Mögliches Geheimnis im Code: {h.evidence}", "", f, ln, "(nicht angezeigt)",
                    "Entfernen, Schlüssel rotieren, aus der Git-Historie tilgen.")
    for rel, ln, ev in (tsscan.html_externals(app_dir, repo_root) if app_dir else []):
        host = re.search(r"https?://([^/'\"]+)", ev).group(1)
        app.add("security", "warn", "SEC-CDN", "Ressourcen von fremden Servern beim Seitenaufruf",
                "Beim Öffnen der App gehen IP-Adresse und Browserdaten an Dritte (z. B. Google Fonts), Datenschutz und Verfügbarkeit hängen daran.",
                rel, ln, f"{host}: {ev}", "Schriften und Skripte lokal ausliefern (im Bundle).")
    tracked = tsscan.tracked_files(repo_root, app_dir) if app_dir else []
    for t in tracked:
        base = os.path.basename(t)
        if re.fullmatch(r"\.env(\.(?!example|sample|template)[\w.-]+)?", base) or base in (".deployments.json",) \
                or re.search(r"\.(pem|pfx|p12|key)$", base):
            app.add("security", "fail", "SEC-TRACKED", f"Vertrauliche Datei im Repo: {base}", "", t,
                    advice="Aus dem Repo entfernen, in .gitignore aufnehmen, Werte rotieren.")
        elif re.search(r"\.(csv|parquet|xlsx)$", base) and not re.search(r"(^|/)(test|tests|__tests__|fixtures?)/", t):
            app.add("security", "info", "SEC-DATAFILE", f"Datendatei im Repo: {base}", "", t,
                    advice="Prüfen, ob echte Daten enthalten sind.")

    # ---------- Lineage
    if rf is None and app.origin == "repo":
        app.add("lineage", "warn", "LIN-NO-RAYFIN", "Keine rayfin/rayfin.yml gefunden", "Datenquellen der App unbekannt.", app.path)
    for b in app.bindings:
        c = b.connector
        if c.type != "fabric-semanticmodel":
            app.add("lineage", "warn", "LIN-OTHER-SOURCE", f"Datenweg am Semantikmodell vorbei: {c.type} „{c.name}“",
                    "Die App liest direkt aus der Quelle. Measures, Beziehungen und RLS des Modells gelten hier nicht, die Lineage endet beim Item.",
                    os.path.relpath(rf.path, repo_root) if rf else "", advice="Falls Kennzahlen gezeigt werden: über ein Semantikmodell anbinden.")
            for h in tsscan.sql_reads(files, c.name):
                app.sql_tables.append(h.extra)
                if h.extra["all"] and not h.extra["filtered"]:
                    app.add("lineage", "info", "LIN-FULL-TABLE", "Ganze Tabellen werden ungefiltert in den Browser geladen",
                            "Alle Zeilen landen im Browser; bei App-Identität sieht jeder Nutzer alles.", h.file.rel, h.line, h.evidence)
            continue
        if b.model is None:
            app.add("lineage", "warn", "LIN-NO-MODEL", f"Semantikmodell für „{c.name}“ nicht im Repo",
                    f"itemId {c.item_id}. Abfragen können nicht gegen das Modell geprüft werden.",
                    os.path.relpath(rf.path, repo_root) if rf else "",
                    advice="Modell per Fabric-Git in dasselbe Repo synchronisieren oder Zuordnung in fabscan.json eintragen.")
        if not b.queries and app.origin == "repo":
            app.add("lineage", "info", "LIN-NO-QUERY", f"Keine statischen Abfragen für „{c.name}“ gefunden",
                    "Abfragen entstehen vermutlich zur Laufzeit.", app.path)
    for h in tsscan.local_data_imports(files):
        app.add("lineage", "warn", "LIN-LOCAL-DATA", f"Daten aus Datei statt aus Fabric: {h.evidence}",
                "Zahlen aus mitgelieferten Dateien tauchen in keiner Fabric-Lineage auf.", h.file.rel, h.line, h.evidence)

    for b in sm_bind:
        m = b.model
        if m is None:
            continue
        for q in b.queries:
            for r in q.refs:
                if r.table is not None and r.table.lower() in q.tvars:
                    continue
                if r.pos < q.define_end and q.defined(r.table, r.name):
                    continue  # Kopf eines DEFINE MEASURE/COLUMN
                if r.table is not None:
                    t = m.table(r.table)
                    f, ln = _loc(q, r.line)
                    if t is None:
                        app.add("lineage", "fail", "LIN-MISSING-TABLE", f"Tabelle „{r.table}“ fehlt im Modell", "", f, ln, q.snippet(r.line))
                        continue
                    mem = t.columns.get(r.name.lower()) or t.measures.get(r.name.lower())
                    if mem is None:
                        app.add("lineage", "fail", "LIN-MISSING-FIELD", f"„{r.table}[{r.name}]“ fehlt im Modell",
                                "Umbenannt oder gelöscht? Die Abfrage schlägt fehl oder liefert leer.", f, ln, q.snippet(r.line))
                        continue
                    if t.calc_group:
                        app.add("lineage", "info", "LIN-CALCGROUP", f"Abfrage nutzt Berechnungsgruppe „{t.name}“",
                                "Ergebnisse hängen vom gewählten Berechnungselement ab.", f, ln, q.snippet(r.line))
                    if mem.hidden or t.hidden:
                        sens = bool(SENSITIVE.search(f"{t.name} {mem.name}"))
                        app.add("security", "warn" if sens else "info", "SEC-HIDDEN",
                                "Ausgeblendete Felder mit vertraulich klingendem Namen werden abgefragt" if sens else "Ausgeblendete Felder werden abgefragt",
                                "Ausgeblendet heißt nicht geschützt: Per DAX ist jedes ausgeblendete Feld für jeden Leser abrufbar. Meist harmlos (Sortierspalten).",
                                f, ln, f"{t.name}[{mem.name}]", "Vertrauliches per Objekt-Sicherheit (OLS) schützen, nicht nur ausblenden.")
                else:
                    n = r.name.lower()
                    if n in q.aliases or m.measure(n) or m.any_column(n):
                        mm = m.measure(n)
                        if mm and mm.hidden:
                            f, ln = _loc(q, r.line)
                            app.add("security", "info", "SEC-HIDDEN", "Ausgeblendete Felder werden abgefragt",
                                    "Ausgeblendet heißt nicht geschützt: Per DAX ist jedes ausgeblendete Feld für jeden Leser abrufbar. Meist harmlos (Sortierspalten).",
                                    f, ln, f"[{mm.name}]", "Vertrauliches per Objekt-Sicherheit (OLS) schützen, nicht nur ausblenden.")
                        continue
                    f, ln = _loc(q, r.line)
                    app.add("lineage", "warn", "LIN-UNKNOWN-REF", f"„[{r.name}]“ ist im Modell nicht zu finden", "", f, ln, q.snippet(r.line))

    # ---------- Berechnungen + Abweichungen + Abfrage verändert (DAX)
    for b in sm_bind:
        m = b.model
        for q in b.queries:
            for d in q.defines:
                f, ln = _loc(q, d.line)
                if d.kind == "MEASURE":
                    shadow = m.measure(d.name) if m else None
                    if shadow:
                        same = _norm(shadow.expr) == _norm(d.expr)
                        app.add("query" if not same else "deviation", "fail" if not same else "warn", "QRY-SHADOW",
                                f"Measure [{d.name}] wird in der Abfrage überschrieben" + (" (gleicher Ausdruck)" if same else ""),
                                f"Im Modell ({shadow.table}): {shadow.expr.strip()[:240]}", f, ln, f"{d.kind} {d.table}[{d.name}] = {d.expr[:400]}",
                                "Modell-Measure verwenden; Änderungen im Modell machen, nicht in der App.")
                    else:
                        app.add("calc", "warn", "CALC-DEFINE", f"Kennzahl nur in der App definiert: [{d.name}]",
                                "Die Logik existiert nicht im Modell und ist für andere Berichte unsichtbar.", f, ln, d.expr[:400],
                                "Als Measure ins Modell übernehmen.")
                elif d.kind in ("COLUMN", "TABLE"):
                    app.add("calc", "info", "CALC-DEFINE-" + d.kind, f"Abfrage definiert {d.kind.lower()} „{d.name}“", "", f, ln, d.expr[:300])
            for p in q.projections:
                if p.kind not in ("computed", "variable") or (p.kind == "variable" and not p.funcs):
                    continue
                f, ln = _loc(q, p.line)
                changing = sorted({x for x in p.funcs if x in dax.VALUE_CHANGING})
                pure = changing and not (set(p.funcs) - set(changing) - dax.PASSTHROUGH) \
                    and not re.search(r"[-+*/]", dax._QREF.sub("", dax.mask(p.expr)))
                if changing:
                    app.add("deviation", "warn", "DEV-TRANSFORM", "Werte werden vor der Auslieferung verändert (Runden, Formatieren, Bereinigen)",
                            "Gerundete oder bereinigte Einzelwerte ergeben andere Summen und Schlüssel als das Modell.", f, ln,
                            f'"{p.alias}", {p.expr}  [{", ".join(changing)}]',
                            "Runden und Formatieren erst in der Anzeige; Bereinigung (TRIM) in die Datenaufbereitung.")
                if not pure:
                    app.add("calc", "warn", "CALC-PROJ", "Berechnete Spalten in der Abfrage statt Modell-Measures",
                            "Ausdrücke in SELECTCOLUMNS/ADDCOLUMNS/SUMMARIZECOLUMNS/ROW: Logik, die im Modell nicht existiert.", f, ln,
                            f'"{p.alias}", {p.expr}', "Als Measure oder berechnete Spalte ins Modell übernehmen.")
            for c in q.calls:
                f, ln = _loc(q, c.line)
                if c.func in dax.FILTER_OVERRIDES:
                    app.add("query", "warn", "QRY-OVERRIDE", "Filterkontext wird übersteuert (ALL/REMOVEFILTERS …)",
                            "Die App kann so Filter des Modells oder der Auswahl aufheben.", f, ln, q.snippet(c.line))
                elif c.func in dax.TRUNCATING:
                    app.add("query", "info", "QRY-TRUNC", f"{c.func} schneidet das Ergebnis ab", "", f, ln, q.snippet(c.line))
            for ln0, ev in dax.literal_comparisons(q):
                f, ln = _loc(q, ln0)
                app.add("query", "warn", "QRY-HARDCODED", "Fest verdrahtete Filter in den Abfragen",
                        "Die App filtert auf einen festen Wert. Wer das Modell ändert, sieht diesen Filter nicht.", f, ln, ev[:400],
                        "Filter als Measure-Logik oder Parameter im Modell abbilden, oder in der App sichtbar machen.")
            treat = [c for c in q.calls if c.func == "TREATAS"]
            if treat:
                f, ln = _loc(q, treat[0].line)
                app.add("query", "info", "QRY-TREATAS", "TREATAS setzt Filter aus der App",
                        "Üblich für Auswahl und Slicer der App; filtert virtuell statt über Modellbeziehungen.", f, ln, q.snippet(treat[0].line))

        # Rohdaten statt Measures
        if b.queries and m is not None:
            used_measures = set()
            for q in b.queries:
                for r in q.refs:
                    if q.defined(r.table, r.name):
                        continue  # in der Abfrage definiert, nicht aus dem Modell
                    t = m.table(r.table) if r.table else None
                    if (t and r.name.lower() in t.measures) or (r.table is None and m.measure(r.name)):
                        used_measures.add(r.name.lower())
            raw_projs = [p for q in b.queries for p in q.projections if p.kind == "column"]
            aggs = {c.func for q in b.queries for c in q.calls if c.pos >= q.define_end} & dax.AGGREGATIONS
            if not used_measures and raw_projs and not aggs:
                app.add("calc", "warn", "CALC-RAW", f"Abfragen liefern Rohzeilen, kein einziges Measure ({m.measure_count} im Modell)",
                        "Summen, Quoten und Abweichungen entstehen damit in der App. Die Kennzahlen-Logik des Modells wird umgangen.",
                        b.queries[0].source, 0, ", ".join(sorted({p.alias for p in raw_projs})[:20]),
                        "Kennzahlen als Measures abfragen (SUMMARIZECOLUMNS mit [Measure]).")
            b.used_measures = used_measures  # type: ignore[attr-defined]

    # ---------- Berechnungen im TypeScript
    fields = tsscan.query_fields(app.queries) | {c.lower() for t in app.sql_tables for c in t["columns"]}
    hits = tsscan.calc_hits(files, fields)
    by_file: dict[str, list] = {}
    for h in hits:
        by_file.setdefault(h.file.rel, []).append(h)
    raw_mode = any(f.rule == "CALC-RAW" for f in app.findings)
    for rel, hs in sorted(by_file.items(), key=lambda kv: -len(kv[1])):
        fmt = bool(re.search(r"(?i)format|fmt|i18n|label|axis|scale|layout|render|chart|svg", rel))
        sev = "info" if fmt else ("warn" if raw_mode else "info")
        ex = "\n".join(f"{h.line}: {h.evidence[:140]}" for h in hs[:6])
        flds = sorted({h.extra['field'] for h in hs})
        title = ("Rechnen mit Abfragefeldern im Darstellungscode" if fmt else "Kennzahlen und Abweichungen werden im Browser berechnet")
        for h in hs[:8]:
            app.add("calc", sev, "CALC-TS", title,
                    "Darstellungscode (Skalierung, Formatierung), meist unkritisch." if fmt else
                    "Summen, Quoten oder Abweichungen aus Abfragefeldern entstehen im TypeScript, nicht im Modell.",
                    rel, h.line, f"{h.evidence[:180]}   ‹Feld: {h.extra['field']}›",
                    "" if fmt else "Prüfen, ob die Logik als Measure ins Modell gehört.")

    # ---------- Modell-Kennzahlen, die die App selbst nachbaut
    for b in sm_bind:
        m = b.model
        if m is None:
            continue
        used = getattr(b, "used_measures", set())
        names = {}
        for t in m.tables.values():
            for mm in t.measures.values():
                if len(mm.name) >= 3 and mm.name.lower() not in used:
                    names[mm.name.lower()] = mm
        if not names:
            continue
        seen = set()
        for f in files:
            if f.vendor:
                continue
            for s in f.strings:
                v = s.value.strip().lower()
                if v in names and v not in seen:
                    seen.add(v)
                    mm = names[v]
                    ln0 = f.line(s.start)
                    near = "\n".join(f.masked.split("\n")[max(0, ln0 - 15):ln0 + 15])
                    app.add("deviation", "warn" if tsscan.ARITH.search(near) else "info", "DEV-NAME", "Kennzahlen gibt es im Modell, die App rechnet sie selbst",
                            "Der Name eines Modell-Measures steht im App-Code, das Measure wird aber nicht abgefragt.", f.rel, f.line(s.start),
                            f"[{mm.name}] im Modell ({mm.table}) = {_one_line(mm.expr)[:160]}\n   App: {f.src_line(f.line(s.start))[:160]}",
                            "Measure abfragen statt nachrechnen, sonst laufen App und Bericht auseinander.")

    # ---------- Abfragen zur Laufzeit verändert
    for h in tsscan.runtime_query_hits(files):
        if h.rule == "dax-replace":
            app.add("query", "warn", "QRY-REPLACE", f"Abfrage „{h.extra['query']}“ wird per Textersetzung verändert",
                    "Was tatsächlich ans Modell geht, steht nicht in der .dax-Datei.", h.file.rel, h.line, h.evidence,
                    "Werte nur über klar definierte Parameter einsetzen und escapen.")
        else:
            app.add("query", "info", "QRY-RUNTIME", "DAX wird zur Laufzeit aus Bausteinen zusammengesetzt",
                    "Statisch nur teilweise prüfbar. Werte aus Nutzereingaben müssen escaped werden (DAX-Injection).",
                    h.file.rel, h.line, h.evidence)


def _one_line(s: str) -> str:
    return re.sub(r"\s+", " ", s.strip())


def _norm(s: str) -> str:
    return re.sub(r"\s+", "", dax.mask(s)).lower()


def scan_app(app_dir: str, repo_root: str, models: list[Model], overrides: dict) -> AppResult:
    name = os.path.basename(app_dir.rstrip("/"))
    rf = rayfin.load(app_dir)
    app = AppResult(name, os.path.relpath(app_dir, repo_root), rf)
    if rf:
        app.bindings = [Binding(c) for c in rf.connectors]
    files = tsscan.list_sources(app_dir, repo_root)
    app.files = len(files)
    queries = []
    for p in tsscan.dax_files(app_dir):
        with open(p, encoding="utf-8-sig") as fh:
            queries.append(dax.parse(fh.read(), os.path.relpath(p, repo_root)))
    for f in files:
        for s, txt in tsscan.inline_queries(f):
            queries.append(dax.parse(txt, f.rel, f.line(s.start)))
    assign_queries(app, queries)
    bind_models(app, models, overrides)
    check_app(app, files, repo_root, app_dir)
    for b in app.bindings:
        usage(b)
    app.findings = group(app.findings)
    app.findings.sort(key=lambda x: (SEV_ORDER[x.severity], [c for c, _ in CATEGORIES].index(x.category), x.title))
    return app


def usage(b: Binding) -> None:
    """Welche Tabellen, Spalten und Measures des Modells die Abfragen tatsächlich nutzen."""
    m = b.model
    if m is None:
        return
    for q in b.queries:
        for r in q.refs:
            if q.defined(r.table, r.name) or (r.table and r.table.lower() in q.tvars):
                continue
            if r.table:
                t = m.table(r.table)
                if t is None:
                    b.missing.add(r.table)
                    continue
                n = r.name.lower()
                slot = b.tables.setdefault(t.name, {"columns": set(), "measures": set()})
                if n in t.measures:
                    slot["measures"].add(t.measures[n].name)
                    b.measures_used.add(t.measures[n].name)
                elif n in t.columns:
                    slot["columns"].add(t.columns[n].name)
                else:
                    b.missing.add(f"{t.name}[{r.name}]")
            else:
                mm = m.measure(r.name)
                if mm:
                    b.tables.setdefault(mm.table, {"columns": set(), "measures": set()})["measures"].add(mm.name)
                    b.measures_used.add(mm.name)


def group(findings: list[Finding]) -> list[Finding]:
    """Gleiche Befunde (Bereich, Stufe, Regel, Titel) zusammenfassen; Fundstellen bleiben erhalten."""
    out: dict[tuple, Finding] = {}
    for f in findings:
        k = (f.category, f.severity, f.rule, f.title)
        if k not in out:
            out[k] = Finding(f.category, f.severity, f.rule, f.title, f.detail, f.file, f.line, "", f.advice, [])
        g = out[k]
        occ = (f.file, f.line, f.evidence)
        if occ not in g.occurrences:
            g.occurrences.append(occ)
    return list(out.values())


def find_apps(root: str) -> list[str]:
    out = []
    for dirpath, dirnames, _ in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in ("node_modules", ".git", "dist", "build", "fixtures")]
        if os.path.exists(os.path.join(dirpath, "rayfin", "rayfin.yml")):
            out.append(dirpath)
            dirnames[:] = []
    return sorted(out)
