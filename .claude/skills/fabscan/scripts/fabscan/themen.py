"""Ampel je Thema und Maßnahmenliste (Bewertung 5.3): fünf Fragen in Klartext, je App oder Client eine Zeile.

Zustände: rot, gelb, grün, grau. Grau heißt „nicht prüfbar“; grün nur „geprüft und unauffällig“. Es gibt keine
Gesamtnote. Akzeptierte Befunde (Ausnahmen) zählen nicht, Hinweise (ℹ) machen keine Farbe.
"""
from __future__ import annotations

from .checks import AppResult, Finding

THEMES = [
    ("zahl", "Eine Zahl", "Rechnet die App selbst oder verändert sie Kennzahlen des Modells?"),
    ("rls", "Zeilensicherheit", "Sieht jeder nur, was er sehen darf?"),
    ("weg", "Datenweg", "Kommt alles aus dem Modell, und ist der Weg vollständig?"),
    ("abfluss", "Abfluss", "Gehen Daten ohne Anmeldung, an fremde Server oder in den Browser-Speicher?"),
    ("zuordnung", "Zuordnung", "Wie sicher ist, wer der Client ist?"),
]
STATES = ("rot", "gelb", "gruen", "grau")
STATE_ORDER = {"rot": 0, "gelb": 1, "grau": 2, "gruen": 3}   # Vorrang, wenn mehrere zutreffen
STATE_SYM = {"rot": "✗", "gelb": "⚠", "gruen": "✓", "grau": "?"}
STATE_LABEL = {"rot": "kritisch", "gelb": "prüfen", "gruen": "geprüft, unauffällig", "grau": "nicht prüfbar"}
STATE_SHORT = {"rot": "kritisch", "gelb": "prüfen", "gruen": "unauffällig", "grau": "nicht prüfbar"}
STATE_CSS = {"rot": "fail", "gelb": "warn", "gruen": "ok", "grau": "grey"}

THEME_OF_RULE = {
    # Eine Zahl
    **{r: "zahl" for r in ("CALC-RAW", "CALC-DEFINE", "CALC-PROJ", "CALC-TS", "CALC-DEFINE-COLUMN", "CALC-DEFINE-TABLE",
                           "DEV-TRANSFORM", "DEV-NAME", "QRY-SHADOW", "QRY-OVERRIDE", "QRY-HARDCODED", "QRY-REPLACE",
                           "QRY-RUNTIME", "QRY-TRUNC", "QRY-TREATAS")},
    # Zeilensicherheit
    **{r: "rls" for r in ("SEC-AUTH", "SEC-NO-RLS", "SEC-CLIENT-RLS", "SEC-HIDDEN", "SEC-BUILD", "SEC-PASSWORD",
                          "SEC-NOAUTH", "SEC-REDIRECT")},
    # Datenweg
    **{r: "weg" for r in ("LIN-MISSING-TABLE", "LIN-MISSING-FIELD", "LIN-UNKNOWN-REF", "LIN-NO-MODEL", "LIN-OTHER-SOURCE",
                          "LIN-LOCAL-DATA", "LIN-NO-RAYFIN", "LIN-NO-QUERY", "LIN-CALCGROUP", "LIN-MDX")},
    # Abfluss
    **{r: "abfluss" for r in ("SEC-SECRET", "SEC-TRACKED", "SEC-ANON", "SEC-EXTERNAL", "SEC-CDN", "SEC-STORAGE",
                              "SEC-HTML", "SEC-ASSETS", "SEC-DATAFILE", "SEC-FETCH", "LIN-FULL-TABLE")},
}
_CATEGORY_FALLBACK = {"calc": "zahl", "deviation": "zahl", "query": "zahl", "lineage": "weg", "security": "abfluss"}

# Wer handelt, und wie groß ist der Schritt ungefähr (Maßnahmenliste)
OWNER = {"SEC-NO-RLS": "Modell", "SEC-HIDDEN": "Modell", "SEC-BUILD": "Modell", "LIN-MISSING-TABLE": "App und Modell",
         "LIN-MISSING-FIELD": "App und Modell", "QRY-SHADOW": "App und Modell", "DEV-NAME": "App und Modell",
         "CALC-DEFINE": "App und Modell", "CALC-PROJ": "App und Modell"}
EFFORT = {"SEC-SECRET": "klein", "SEC-TRACKED": "klein", "SEC-CDN": "klein", "SEC-ASSETS": "klein", "SEC-PASSWORD": "klein",
          "SEC-ANON": "klein", "SEC-AUTH": "mittel", "QRY-SHADOW": "klein", "QRY-HARDCODED": "mittel", "QRY-OVERRIDE": "klein",
          "CALC-RAW": "groß", "CALC-TS": "mittel", "CALC-DEFINE": "mittel", "CALC-PROJ": "mittel", "DEV-NAME": "mittel",
          "DEV-TRANSFORM": "klein", "LIN-NO-MODEL": "klein", "LIN-MISSING-TABLE": "klein", "LIN-MISSING-FIELD": "klein",
          "LIN-OTHER-SOURCE": "groß", "LIN-LOCAL-DATA": "mittel", "SEC-NO-RLS": "mittel", "SEC-CLIENT-RLS": "groß",
          "SEC-HIDDEN": "mittel", "SEC-EXTERNAL": "mittel", "SEC-STORAGE": "klein", "SEC-HTML": "mittel"}


def theme_of(f: Finding) -> str:
    return THEME_OF_RULE.get(f.rule) or _CATEGORY_FALLBACK.get(f.category, "abfluss")


def _color(a: AppResult, f: Finding) -> str | None:
    """Farbe, die ein Befund in seinem Thema auslöst (None = keine)."""
    if f.severity == "fail":
        return "rot"
    if f.severity != "warn":
        return None
    if f.rule == "DEV-NAME":                              # Kennzahl mit Modellnamen anders gerechnet
        return "rot"
    if f.rule == "SEC-AUTH" and a.origin == "log":       # Service Principal auf einem Modell mit RLS
        return "rot"
    if f.rule == "SEC-ANON":                             # anonyme Datenrolle
        return "rot"
    if f.rule == "LIN-OTHER-SOURCE" and any(b.connector.auth != "delegated" and b.connector.type != "fabric-semanticmodel"
                                            for b in a.bindings):
        return "rot"                                     # am Modell vorbei mit App-Identität
    if f.rule == "LIN-NO-MODEL":
        return None                                      # macht das Thema grau, nicht gelb
    return "gelb"


def _grey(a: AppResult) -> dict[str, str]:
    """Gründe, warum ein Thema nicht prüfbar ist."""
    sm = [b for b in a.bindings if b.connector.type == "fabric-semanticmodel"]
    no_model = bool(sm) and all(b.model is None for b in sm)
    out = {}
    if no_model:
        out["zahl"] = "Modell nicht gefunden, Abfragen nicht gegen das Modell prüfbar"
        out["weg"] = "kein Modell zugeordnet"
        out["rls"] = "Modell nicht gefunden, Rollen unbekannt"
    elif sm and all(getattr(b.model, "roles_unknown", False) for b in sm if b.model is not None):
        out["rls"] = "Rollen des Modells nicht lesbar (nur Leserecht)"
    if a.origin == "log":
        if not a.queries and a.meta.get("mdx"):
            out["zahl"] = "nur MDX-Abfragen, nicht geprüft"
        out["abfluss"] = "das Log enthält keine Ergebnismengen"
        if a.name.startswith("(ohne"):
            out["zuordnung"] = "Client meldet keinen Anwendungsnamen"
    elif a.rayfin is None:
        out["zuordnung"] = "keine rayfin/rayfin.yml"
    if not a.bindings and a.origin == "repo":
        out.setdefault("weg", "keine Datenquelle gefunden")
        out.setdefault("zahl", "keine Datenquelle gefunden")
    return out


def theme_status(a: AppResult) -> dict[str, tuple[str, list[str]]]:
    """Je Thema (Zustand, Gründe). Gründe sind die Klartext-Überschriften der auslösenden Befunde."""
    from .report import plain
    hits: dict[str, dict[str, list[str]]] = {k: {"rot": [], "gelb": []} for k, _, _ in THEMES}
    for f in a.findings:
        c = _color(a, f)
        if c:
            head = plain(f, a.origin)["head"]
            if head not in hits[theme_of(f)][c]:
                hits[theme_of(f)][c].append(head)
    if a.origin == "log":
        hits["zuordnung"]["gelb"].append("Zuordnung nur über den Anwendungsnamen, den der Client selbst meldet")
    grey = _grey(a)
    out = {}
    for k, _, _ in THEMES:
        # rot vor gelb vor grau: ein gefundener Befund zählt, auch wenn der Rest nicht prüfbar ist
        if hits[k]["rot"]:
            out[k] = ("rot", hits[k]["rot"])
        elif hits[k]["gelb"]:
            out[k] = ("gelb", hits[k]["gelb"] + ([f"außerdem nicht prüfbar: {grey[k]}"] if k in grey else []))
        elif k in grey:
            out[k] = ("grau", [grey[k]])
        else:
            out[k] = ("gruen", [])
    return out


def actions(apps: list[AppResult], trend: dict | None = None) -> list[dict]:
    """Maßnahmenliste: je Regel und Modell eine Zeile über alle Apps oder Clients. Nur ✗ und ⚠ (offen oder
    abgelaufen). Status aus dem Trend: neu, offen seit <Datum>; akzeptierte stehen eigens im Bericht."""
    from .report import plain
    seen = (trend or {}).get("first_seen", {})
    groups: dict[tuple, dict] = {}
    for a in apps:
        models = sorted({b.model.name for b in a.bindings if b.model is not None}) or [a.meta.get("model") or ""]
        for f in a.findings:
            if f.severity not in ("fail", "warn"):
                continue
            model_scoped = OWNER.get(f.rule) == "Modell"
            key = (f.rule, f.severity, models[0] if model_scoped else "", plain(f, a.origin)["head"])
            g = groups.get(key)
            if g is None:
                t = plain(f, a.origin)
                who = OWNER.get(f.rule, "App")
                if a.origin == "log":
                    who = f"Modell-Verantwortliche ({a.meta.get('workspace')})" if who != "App" else \
                        f"Betreiber des Clients ({a.meta.get('workspace')})"
                else:
                    who = {"Modell": "Modell-Verantwortliche", "App und Modell": "App-Team mit Modell-Verantwortlichen",
                           "App": "App-Team"}[who]
                g = groups[key] = {"rule": f.rule, "severity": f.severity, "theme": theme_of(f), "head": t["head"],
                                   "why": t["why"], "todo": t["todo"], "who": who, "effort": EFFORT.get(f.rule, "mittel"),
                                   "clients": [], "model": models[0] if model_scoped else "", "ids": [],
                                   "occurrences": 0, "status": "", "since": "", "color": _color(a, f) or "gelb"}
            if a.name not in g["clients"]:
                g["clients"].append(a.name)
            g["ids"].append(f.id)
            g["occurrences"] += len(f.occurrences)
            if f.status == "abgelaufen":
                g["status"] = "Ausnahme abgelaufen"
    for g in groups.values():
        dates = [seen[i] for i in g["ids"] if i in seen]
        if not g["status"]:
            if trend and trend.get("previous") and dates and len(dates) == len(g["ids"]):
                g["status"], g["since"] = "offen", min(dates)
            elif trend and trend.get("previous") and dates:
                g["status"], g["since"] = "teils neu", min(dates)
            elif trend and trend.get("previous"):
                g["status"] = "neu"
            else:
                g["status"] = "offen"
    rank = {"fail": 0, "warn": 1}
    color = {"rot": 0, "gelb": 1}
    return sorted(groups.values(), key=lambda g: (color[g["color"]], rank[g["severity"]], -len(g["clients"]), g["head"]))
