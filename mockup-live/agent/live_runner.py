#!/usr/bin/env python3
"""live_runner.py - Deploy-Runner für "MockupKitchen live" (Stufe 1, Desktop).

Arbeitet den Dateivertrag aus mockup-live/CONTRACT.md ab: beobachtet
`<Projekt>/mockup/deploy-request.json`, schreibt den Bericht per `pbir`,
laedt Power BI Desktop über die Bridge-CLI `powerbi-desktop` neu, holt
Screenshots und meldet alles in `<Projekt>/mockup/agent-status.json`.

    python live_runner.py watch  "<Projekt>" [Optionen]   # Dauerlauf
    python live_runner.py once   "<Projekt>" [Optionen]   # aktuellen Deploy, dann Ende
    python live_runner.py status "<Projekt>" [Optionen]   # Zusammenfassung

Optionen:
    --bridge-cmd CMD    Bridge-CLI (Vorgabe: $MK_BRIDGE_CMD, sonst powerbi-desktop).
                        .py-Dateien laufen mit diesem Python, npm-Shims (.cmd/.ps1)
                        werden aufgeloest. Gesetzt (Tests) heißt zugleich
                        --desktop-cli bridge.
    --desktop-cli X     pbir (Vorgabe: `pbir desktop list/reload/screenshot`) oder
                        bridge (powerbi-desktop). Scheitert pbir, versucht der Runner
                        denselben Schritt einmal über die Bridge-CLI.
    --no-bridge         ohne Desktop: keine Status-Prüfung, kein Reload, keine
                        Screenshots (CI, Tests)
    --scale N           Screenshot-Massstab 1..3 (Vorgabe 1 = PBIR-Seitenpixel)
    --keep-backups N    so viele backup/<seq> und shots/<seq> behalten (Vorgabe 10)
    --ck-fallback       ChartKitchen-Kacheln ohne installiertes ChartKitchen und ohne
                        Referenz-Instanz als natives Ersatzvisual bauen (Vorgabe;
                        --no-ck-fallback: Platzhalter)
    --no-install        Kitchen-Visuals und Theme nicht installieren (Verhalten v1:
                        Referenz-Instanz, Ersatzvisual, To-dos)
    --no-desktop-restart  Desktop für die Installation nicht schließen/öffnen; die
                        Dateien werden trotzdem installiert, dazu das To-do
                        „Desktop neu starten"
    --restart-for-theme Desktop auch dann neu starten, wenn nur das Theme einmalig
                        registriert werden muss (Vorgabe: nur für Visuals)
    --desktop-timeout S so lange auf Desktop nach dem Start warten (Vorgabe 180)
    --close-cmd CMD     Programm, das Desktop schließt (Aufruf: CMD <pid>); Vorgabe
                        taskkill mit Prüfung, dass die PID pbidesktop.exe ist ($MK_DESKTOP_CLOSE_CMD)
    --compare-wait S    so lange auf mockup/kitchen/<seq>/tiles.json warten (Vorgabe 30)
    --shot-wait S       je Seite höchstens so lange Desktop-Bilder wiederholen, bis die Seite
                        stabil gezeichnet und keine Kachel mehr leer ist (Vorgabe 8,
                        $MK_SHOT_WAIT); Custom Visuals zeichnen erst nach dem Reload
    --shot-budget S     Zeit je Deploy für Bilder von Seiten ohne Bild, die der Deploy nicht
                        angefasst hat (Vorgabe 30, $MK_SHOT_BUDGET, 0 = nur angefasste Seiten)
    --te CMD            Tabular-Editor-CLI für Modelländerungen (Vorgabe: $MK_TE, sonst te)
    --pbir CMD          pbir-Programm (Vorgabe: $MK_PBIR, sonst pbir)
    --converter PATH    mockup_to_pbir.py (Vorgabe: Skill im Repo, $MK_CONVERTER)
    --auto-restart      Verhalten bis Runner 0.2 (nur für unbeaufsichtigte Tests): Desktop ohne
                        Rückfrage neu starten, Ungespeichertes ohne Rückfrage überschreiben
    --confirm-timeout S so lange auf eine Antwort in deploy-confirm.json warten (Vorgabe 600),
                        danach blockiert („Neustart nicht bestätigt")
    --pin-pid PID       nur diese Desktop-Instanz ansprechen (External Tools, mk_live start)
    --session-id ID     Sitzungs-ID (sonst aus mockup/desktop-session.json oder neu)
    --idle-poll S       im Leerlauf alle S Sekunden den Desktop-Status lesen (Vorgabe 30,
                        0 = aus): desktopLive im Status, eigene Reload-Markierung aufheben,
                        sobald Desktop gespeichert wurde
    --busy-backoff S    Desktop „busy": bis zu 3 Wiederholungen nach S, 2·S, 4·S Sekunden
                        (Vorgabe 1), kein Wechsel auf die Bridge-CLI

Anfragen (CONTRACT.md, Beta-Ergänzungen 02.10.2026): `scope` (all|layout|theme|model),
`dryRun` (nur Vorschau `plan`), `prepare` (Sitzung vorbereiten: Kitchen-Visuals und Theme,
ein bestätigter Neustart), `restore` ({"fromBackup": n}: Bericht auf den Stand nach Deploy n,
als neuer Deploy), `sessionId`. Rückfragen über `awaiting` im Status und
mockup/deploy-confirm.json; mockup/deploy-cancel.json zieht eine Anfrage zurück. Desktop
wird nie ohne passende Bestätigung („restart" oder „discard") beendet.

Exit-Codes von `once`: 0 angewendet, Vorschau oder nichts zu tun, 2 blockiert,
1 fehlgeschlagen, 3 abgebrochen bzw. zurückgezogen.

Grundregeln (aus dem Vertrag und dem Skill mockup-to-powerbi):
  * Bericht nur über pbir. Ausnahmen: der Kopierweg für Custom Visuals und
    ChartKitchen (Hülle per pbir, dann visual.json), Lage, Größe und Container-Stil
    von Custom Visuals (pbir batch kennt deren Typ nicht, Demo B1), das Entfernen eines
    eigenen Visuals, wenn pbir rm es verweigert (Typwechsel, Demo B9), und die Installation
    der Kitchen-Visuals (visuals_install.py, CustomVisuals/ + report.json).
  * Modell nur über `te` (model_ops.py): Format, Beschreibung, Ordner laufen
    automatisch, DAX und Umbenennungen erst nach Freigabe
    (mockup/model-approvals.json). Ohne te bleiben es `model`-To-dos.
  * report.json und definition.pbir ändert der Runner nur, wenn Desktop das
    Projekt nicht offen hat (Installation, Theme-Registrierung). Dafür darf er
    die Desktop-Instanz genau dieses Projekts schließen und danach neu öffnen
    (Entscheidung 01.10.2026). Sonst prüft er per Hash und rollt zurück.
  * Nie löschen. Was im Mockup fehlt, wird als `removed` gemeldet. Einzige
    Ausnahme: eigene Ersatz-Visuals einer Kachel (Platzhalter `<id>_slot`,
    natives Ersatzvisual, ChartKitchen `cards` einer KPI-Kachel), sobald sie als
    echtes Kitchen-Visual angelegt wird; welche das sind, steht in .state
    (created.json bzw. last-applied-spec.json).
  * ChartKitchen: Ist das Visual im Bericht installiert, baut der Runner die
    visual.json aus dem Slot des Konverters (Projektionen, `objects`, Container).
    Nur wenn das nicht geht, repliziert er eine Referenz-Instanz oder baut ein
    natives Ersatzvisual bzw. einen Platzhalter.
  * Delta-Regel: Vergleich mit .state/last-applied-spec.json (bzw. der
    baseline-spec.json). Eingelesene Seiten und Visuals bekommen Kitchen-Gestaltung
    (Seitenhintergrund, Kachelstil, Theme) nur nach einer Änderung von design gegenüber
    dieser Basis und nie den Kitchen-Rahmen (Demo B2); neue Seiten wie bisher.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import logging
import logging.handlers
import os
import re
import shlex
import shutil
import subprocess
import sys
import tempfile
import threading
import time
import unicodedata
import uuid
from datetime import datetime
from pathlib import Path

RUNNER_VERSION = "0.3.2"
CONTRACT_VERSION = 1

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
DEFAULT_CONVERTER = REPO / ".claude" / "skills" / "mockup-to-powerbi" / "scripts" / "mockup_to_pbir.py"

sys.path.insert(0, str(HERE))
import model_ops as MO  # noqa: E402
import tile_compare as TC  # noqa: E402
import visuals_install as VI  # noqa: E402
sys.path.pop(0)

# Dateien, die bei offenem Desktop extern nicht geändert werden duerfen
PROTECTED_FILES = {"definition.pbir", "report.json", "mobilestate.json",
                   "semanticmodeldiagramlayout.json"}
# Schlüssel, die beim Kachelvergleich nicht zaehlen: abgeleitet oder Herkunft
IGNORED_VISUAL_KEYS = {"samples", "pbir", "page", "label", "slug", "warnings"}
# Kachel-Eigenschaften, die eigene Delta-Operationen haben
RECT_KEYS, TITLE_KEYS, BIND_KEYS = ({"rect"}, {"title", "titleShown"},
                                    {"native", "roles", "customVisual"})
# Container-Stil eingelesener Visuals (Herkunft `pbir`): nur bei Abgleich mit dem Bericht
# (erster Deploy nach dem Einlesen, Gestaltung oder Kachel im Kitchen geändert) und nur
# Werte, die im Bericht anders stehen. Die Ebene (position.z) bleibt immer.
STYLE_PREFIXES = ("background.", "border.", "dropShadow.")
ORIGIN_KEEP_PREFIXES = STYLE_PREFIXES + ("position.",)
THEME_NAME = "MockupKitchen"
THEME_TEMPLATE = "Custom"         # pbir-Vorlage ohne visualStyles: das Basis-Theme bleibt sichtbar
DESKTOP_IMAGE = "pbidesktop.exe"
# Schalter für die Bridge in Desktop (Optionen → Sicherheit, nicht unter Vorschaufunktionen)
BRIDGE_SETTING = ("Datei → Optionen und Einstellungen → Optionen → Sicherheit: „Zugriff externer "
                  "Tools über sichere lokale APIs“ einschalten")
TERMINAL = ("applied", "blocked", "failed", "cancelled", "planned")
EXIT_CODE = {"applied": 0, "idle": 0, "planned": 0, "blocked": 2, "failed": 1,
             "cancelled": 3}
POLL_S, HEARTBEAT_S = 0.5, 5.0
SCOPES = ("all", "layout", "theme", "model")
CONFIRM_ACTIONS = ("restart", "saveFirst", "discard", "skipRestart", "cancel")
HISTORY_MAX = 20
# „Sitzung vorbereiten" installiert immer diese Kitchen-Visuals (visuals_install-Namen),
# dazu alles, was die aktuelle Spec braucht (Gantt, GuV …)
PREPARE_VISUALS = ("chartkitchen", "kpicard")
PROBE_S = 3.0                     # Desktop-Status während einer Rückfrage alle 3 s lesen
# Desktop bzw. Bridge-Pipe gerade belegt: wiederholen statt auf die Bridge-CLI wechseln
BUSY_RX = re.compile(r"\bbusy\b|ERROR_PIPE_BUSY|pipe instances|EBUSY", re.I)
# mockup/.gitignore: alles lokal, nur diese Dateien gehören ins Repo (Review E, P1)
GITIGNORE_ALLOW = (".gitignore", "mockup-spec.json", "AGENT-BRIEF.md", "model-approvals.json",
                   "README.md")
GITIGNORE_OLD = {"out/", "backup/", "shots/", ".state/", "kitchen/"}   # Form bis Runner 0.2
GITIGNORE_HEAD = ("# Von MockupKitchen live angelegt. Alles in mockup/ bleibt lokal: Status,\n"
                  "# Sicherungen, Desktop- und Kitchen-Bilder mit echten Daten. Ins Repo gehören\n"
                  "# nur die Dateien mit Ausrufezeichen.\n")
README_TEXT = """# mockup/ · Arbeitsordner von MockupKitchen live

Diesen Ordner legen das MockupKitchen (Browser) und der Live-Helfer (Runner) an. Hier
tauschen beide Dateien aus: die Skizze, Deploy-Anfragen, den Status, Bilder und Sicherungen.
Der Bericht selbst liegt daneben in `<Name>.Report`, das Modell in `<Name>.SemanticModel`.

Ins Repo gehören nur:

- `mockup-spec.json`: die Skizze (Seiten, Kacheln, Felder, Wünsche ans Modell)
- `AGENT-BRIEF.md`: Kurzbeschreibung für Menschen und Agenten
- `model-approvals.json`: Freigaben für Modelländerungen, mit Urheber und Zeit
- `README.md`: diese Datei

Alles andere bleibt lokal (`.gitignore`): Status (`agent-status.json`), Sicherungen
(`backup/`), Desktop-Bilder (`shots/`), Kitchen-Bilder (`kitchen/`), Ausgaben des
Konverters (`out/`), Protokolle und Verlauf (`.state/`). Die Bilder zeigen echte Daten.

Den Ordner zu löschen schadet dem Bericht nicht. Verlauf und Sicherungen sind dann weg, und
der nächste Deploy gleicht alles neu gegen den Bericht ab.

Dateivertrag: `mockup-live/CONTRACT.md` im MockupKitchen-Repo.
"""



# Optik der Platzhalter für ChartKitchen- und Deneb-Kacheln: neutral statt Standardblau, kein Container-Titel
# Arbeitsfläche um die Seite (Theme visualStyles.page["*"].outspace), wenn das Fragment nichts sagt
DEFAULT_OUTSPACE = "#EAE8E1"
# Text von shape/actionButton ist zustandsabhängig: text.default.* (text.show ohne Zustand)
SLOT_LOOK = {"title.show": False, "fill.show": True, "fill.fillColor": "#F3F4F6", "outline.show": True,
             "outline.lineColor": "#C9CED6", "text.show": True, "text.default.fontSize": 10,
             "text.default.fontColor": "#6B7280", "text.default.horizontalAlignment": "center",
             "text.default.verticalAlignment": "middle"}

# ChartKitchen byDatenWG: steht irgendwo im Bericht eine Instanz (die Referenz-Instanz,
# vom Menschen einmal platziert), repliziert der Runner sie für ChartKitchen-Kacheln
# (Weg aus .claude/skills/chartkitchen-report/references/pbir-insertion.md).
CK_GUID = "chartKitchenByDatenWGD9DE0F7AD44D41058672C6FBF6F5A18D"
# Datenrollen aus der capabilities.json des Visuals (dataRoles, kind Measure/Grouping)
CK_MEASURE_ROLES = ("actual", "previousYear", "plan", "forecast", "prevForecast",
                    "benchmark", "lineMeasure", "comments", "filterInfo")
CK_GROUPING_ROLES = ("category", "multiples", "series", "rowType", "fcFlag", "colgroup")
# Höchstzahl Felder je Rolle (dataViewMappings.conditions: max 1, colgroup max 2).
# category nimmt in Desktop mehrere Spalten als Drill-Hierarchie an (Beschreibung der Rolle).
CK_ROLE_MAX = {"colgroup": 2, "category": None}
# chart.orientation, Enumeration aus capabilities.json
CK_ORIENTATIONS = {"columns", "bars", "line", "waterfall", "intwaterfall", "catbridge",
                   "table", "pareto", "dumbbell", "slope", "cards", "pnl"}
# Spec-Unterschiede, die Bindung bzw. chart.* eines replizierten Visuals ändern
CK_BIND_DIFF = {"kind", "scenario", "chartKitchenMode", "chartKitchenType", "engine"}
# Kachel-Änderungen, nach denen die Slot-Objekte (chart.*, labels.*, ibcsTitle.*) gewinnen
CK_PROP_DIFF = {"kind", "chartKitchenMode", "chartKitchenType", "engine", "analysis",
                "display", "roles", "scenario"}
# Fallback, falls die Referenz-Instanz keine $schema-URL trägt
CK_SCHEMA = ("https://developer.microsoft.com/json-schemas/fabric/item/report/definition/"
             "visualContainer/2.9.0/schema.json")

# Native Visualtypen, die pbir kennt (`pbir schema types --json`, pbir 0.9.32). Nur diese gehen
# über `pbir batch` (move, resize, set, bind). Alles andere (Custom Visuals: ChartKitchen,
# KPI-Karte, Gantt, GuV, jede GUID) schreibt der Runner direkt in visual.json (Demo B1:
# `pbir batch set` auf einem Custom Visual endet mit „Unknown component: title"). Unbekannte
# Typen ohne GUID fragt der Runner einmal bei pbir nach.
NATIVE_TYPES_FALLBACK = frozenset((
    "accessibleTable", "actionButton", "advancedSlicerVisual", "aiNarratives", "animatedNumber",
    "areaChart", "azureMap", "barChart", "basicShape", "bookmarkNavigator", "card", "cardVisual",
    "clusteredBarChart", "clusteredColumnChart", "columnChart", "dataQueryVisual", "debugVisual",
    "decompositionTreeVisual", "donutChart", "filledMap", "filter", "filterSlicer", "funnel",
    "ganttChart", "gauge", "group", "heatMap", "hundredPercentStackedAreaChart",
    "hundredPercentStackedBarChart", "hundredPercentStackedColumnChart", "image",
    "keyDriversVisual", "kpi", "lineChart", "lineClusteredColumnComboChart",
    "lineStackedColumnComboChart", "listSlicer", "map", "matrix", "multiRowCard",
    "pageNavigator", "pieChart", "pivotTable", "pythonVisual", "qnaVisual", "rdlVisual",
    "realTimeLineChart", "ribbonChart", "scatterChart", "scorecard", "scriptVisual", "shape",
    "shapeMap", "slicer", "stackedAreaChart", "table", "tableEx", "textSlicer", "textbox",
    "treemap", "waterfallChart"))
# Container-Objekte jedes Visuals (`pbir schema types --containers`): nur diese Eigenschaften
# schreibt der Runner bei Custom Visuals direkt (Titel, Fläche, Rahmen, Schatten …)
CONTAINER_OBJECTS_FALLBACK = frozenset((
    "background", "border", "divider", "dropShadow", "general", "lockAspect", "padding",
    "spacing", "stylePreset", "subTitle", "title", "visualHeader", "visualHeaderTooltip",
    "visualLink", "visualTooltip"))
CUSTOM_TYPE_RX = re.compile(r"[0-9A-Fa-f]{32}$")
COLOR_PROPS = {"color", "fontColor", "fillColor", "lineColor", "backgroundColor",
               "borderColor", "titleColor"}
HEX_RX = re.compile(r"^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$")
# Meldungen, die sich ohne Änderung an Kachel oder Bericht nicht von selbst erledigen: eine
# unveränderte Kachel mit so einem Fehler versucht der Runner nicht in jedem Deploy erneut
PERMANENT_RX = re.compile(r"Unknown component|unknown visual ?type|kann den Typ nicht|"
                          r"schon durch ein .* belegt|exceeds page|überschreitet die Seite",
                          re.I)
PERMANENT_AFTER = 2              # so oft unverändert gescheitert, dann nicht mehr versuchen
SHOT_WAIT_DEFAULT = 8.0          # je Seite höchstens so lange aufs Zeichnen warten (Demo B5)
SHOT_BUDGET_DEFAULT = 30.0       # Zeit für Seiten ohne Bild, die dieser Deploy nicht anfasst
BATCH_LOG_MAX = 64000            # Rohausgabe eines gescheiterten pbir batch im Protokoll


def lit(value) -> dict:
    """Literal-Ausdruck wie Desktop ihn schreibt ('text', true/false, 3D)."""
    if isinstance(value, bool):
        text = "true" if value else "false"
    elif isinstance(value, int):
        text = "%dD" % value
    elif isinstance(value, float):
        text = "%gD" % value
    else:
        text = "'%s'" % str(value).replace("'", "''")
    return {"expr": {"Literal": {"Value": text}}}


def ck_projection(ref: str, kind: str, role: str, first: bool) -> dict:
    """Eine Projektion in der Form, die Desktop für ChartKitchen schreibt.
    Spalte in einer Measure-Rolle: Summe (Aggregation Function 0) wie in Desktop."""
    table, _, prop = str(ref).partition(".")
    src = {"Expression": {"SourceRef": {"Entity": table}}, "Property": prop}
    if role in CK_MEASURE_ROLES and kind != "measure":
        return {"field": {"Aggregation": {"Expression": {"Column": src}, "Function": 0}},
                "queryRef": "Sum(%s)" % ref, "nativeQueryRef": "Summe von %s" % prop}
    node = "Measure" if kind == "measure" else "Column"
    proj = {"field": {node: src}, "queryRef": ref, "nativeQueryRef": prop}
    if role == "category" and first:
        proj["active"] = True
    return proj


def ck_chart_props(slot: dict) -> dict:
    """chart.* aus dem Slot des Konverters, nur sichere Werte:
    orientation (Enum geprüft) und invert (Polarität „kleiner ist besser")."""
    cp = slot.get("chartProps") or {}
    props = {}
    orient = cp.get("orientation") or slot.get("orientation")
    if orient in CK_ORIENTATIONS:
        props["orientation"] = lit(orient)
    if cp.get("invert") is True:
        props["invert"] = lit(True)
    return props


def ck_title_props(slot: dict) -> dict:
    """ibcsTitle.* (Kopfzeile des Visuals, capabilities.json: kpi, message als Text):
    kpi = Titel der Kachel (sonst nimmt ChartKitchen den Feldnamen), message =
    Botschaft aus analysis.message."""
    props = {}
    title = str(slot.get("title") or "").strip()
    if title and slot.get("titleShown") is not False:
        props["kpi"] = lit(title)
    msg = (slot.get("analysis") or {}).get("message")
    if isinstance(msg, str) and msg.strip():
        props["message"] = lit(msg.strip())
    return props


def ck_objects(slot: dict) -> dict:
    """visual.objects einer ChartKitchen-Kachel. Ab Konverter 0.5.5 steht alles fertig im
    Slot (`objects`, Desktop-Form); ältere Slots: orientation/invert und IBCS-Titel."""
    objs = slot.get("objects")
    if isinstance(objs, dict) and objs:
        return copy.deepcopy(objs)
    out = {}
    props = ck_chart_props(slot)
    if props:
        out["chart"] = [{"properties": props}]
    tprops = ck_title_props(slot)
    if tprops:
        out["ibcsTitle"] = [{"properties": tprops}]
    return out


def merge_objects(target: dict, source: dict, only=None) -> list:
    """source ({objekt: [{"properties": {...}}]}) je Objekt in target mischen: Eigenschaften
    aus source gewinnen, andere (z. B. in Desktop gesetzte) bleiben. Gibt die geänderten
    Objektnamen zurück. Einträge mit `selector` werden ganz übernommen."""
    changed = []
    for name, entries in (source or {}).items():
        if only is not None and name not in only:
            continue
        if not isinstance(entries, list) or not entries:
            continue
        cur = target.get(name)
        if not isinstance(cur, list) or not cur:
            target[name] = copy.deepcopy(entries)
            changed.append(name)
            continue
        before = canon(cur)
        plain = [e for e in entries if isinstance(e, dict) and "selector" not in e]
        if plain:
            props = cur[0].setdefault("properties", {})
            for e in plain:
                for k, val in (e.get("properties") or {}).items():
                    props[k] = copy.deepcopy(val)
        for e in entries:
            if isinstance(e, dict) and "selector" in e:
                sel = canon(e["selector"])
                hit = next((i for i, c in enumerate(cur) if isinstance(c, dict)
                            and canon(c.get("selector")) == sel), None)
                if hit is None:
                    cur.append(copy.deepcopy(e))
                else:
                    cur[hit] = copy.deepcopy(e)
        if canon(cur) != before:
            changed.append(name)
    return changed


def literal_value(node):
    """Wert eines PBIR-Ausdrucks ({"expr": {"Literal": …}} oder {"solid": {"color": …}})
    als Python-Wert: Text ohne Anführungszeichen, Zahl, bool; sonst None."""
    if not isinstance(node, dict):
        return None
    if "solid" in node:
        return literal_value((node.get("solid") or {}).get("color"))
    raw = ((node.get("expr") or {}).get("Literal") or {}).get("Value")
    if not isinstance(raw, str):
        return None
    if raw in ("true", "false"):
        return raw == "true"
    if raw.startswith("'") and raw.endswith("'"):
        return raw[1:-1].replace("''", "'")
    m = re.fullmatch(r"(-?\d+(?:\.\d+)?)[DLM]?", raw)
    return float(m.group(1)) if m else raw


def same_value(a, b) -> bool:
    if isinstance(a, bool) or isinstance(b, bool):
        return a is b or (isinstance(a, bool) and isinstance(b, bool) and a == b)
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return abs(float(a) - float(b)) < 1e-6
    return str(a).strip().lower() == str(b).strip().lower()


def container_value(vj: dict, key: str):
    """Ist-Wert einer pbir-Eigenschaft wie "border.color" aus visualContainerObjects."""
    obj, _, prop = key.partition(".")
    entries = ((vj or {}).get("visual") or {}).get("visualContainerObjects") or {}
    lst = entries.get(obj)
    if not isinstance(lst, list) or not lst:
        return None
    props = (lst[0] or {}).get("properties") or {}
    alias = {"color": ("color", "fillColor")}.get(prop, (prop,))
    for p in alias:
        if p in props:
            return literal_value(props[p])
    return None


def version_tuple(v) -> tuple:
    try:
        return tuple(int(x) for x in str(v or "0").split("."))
    except ValueError:
        return (0,)


def container_literal(prop: str, value) -> dict:
    """Wert für visualContainerObjects in der Form, die pbir für native Visuals schreibt:
    Farben als {"solid": {"color": Literal}}, sonst Literal (Text, Zahl mit D, bool)."""
    if isinstance(value, str) and (prop in COLOR_PROPS or prop.endswith("Color")) \
            and HEX_RX.match(value.strip()):
        return {"solid": {"color": lit(value.strip())}}
    if isinstance(value, dict):                  # schon ein Ausdruck
        return copy.deepcopy(value)
    return lit(value)


def batch_step_error(step: dict, res: dict | None = None) -> str:
    """Echte Meldung eines gescheiterten pbir-batch-Schritts (pbir 0.9.32: `failures[].message`
    am Schritt bzw. oben mit `step_id`; `result` ist dann {}). Nie „{}"."""
    msgs = []
    for f in step.get("failures") or []:
        if isinstance(f, dict) and f.get("message"):
            msgs.append(str(f["message"]))
    err = step.get("error")
    if isinstance(err, dict) and err.get("message"):
        msgs.append(str(err["message"]))
    elif isinstance(err, str) and err.strip():
        msgs.append(err.strip())
    for f in (res or {}).get("failures") or []:
        if isinstance(f, dict) and f.get("step_id") == step.get("id") and f.get("message"):
            msgs.append(str(f["message"]))
    if not msgs:
        result = step.get("result")
        if result not in (None, {}, [], ""):
            msgs.append(json.dumps(result, ensure_ascii=False))
    msgs = list(dict.fromkeys(msgs))
    if msgs:
        return "; ".join(msgs)
    return "Status %s ohne Meldung von pbir (Rohausgabe in mockup/.state/runner.log)" % (
        step.get("status") or "unbekannt")


class RunnerError(Exception):
    """Fehler mit Meldung für agent-status.json."""


class Blocked(Exception):
    """Voraussetzung fehlt, es wurde nichts geschrieben."""


class Cancelled(Exception):
    """Mensch hat den Deploy abgebrochen (deploy-confirm „cancel" oder deploy-cancel.json)."""


# --------------------------------------------------------------------------- #
# Kleinkram
# --------------------------------------------------------------------------- #
def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="milliseconds")


def iso_from_ts(ts: float) -> str:
    return datetime.fromtimestamp(ts).astimezone().isoformat(timespec="milliseconds")


def fmt_num(x: float) -> str:
    """Zahl für Meldungen: ganze Zahlen ohne Nachkomma, sonst eine Stelle mit Komma."""
    x = float(x)
    if abs(x - round(x)) < 0.05:
        return "%d" % round(x)
    return ("%.1f" % x).replace(".", ",")


def new_session_id() -> str:
    return "mk-" + uuid.uuid4().hex[:12]


def gitignore_text(extra=()) -> str:
    lines = GITIGNORE_HEAD.rstrip("\n").split("\n") + ["*"]
    lines += ["!%s" % n for n in GITIGNORE_ALLOW]
    if extra:
        lines += ["", "# weitere Einträge"] + list(extra)
    return "\n".join(lines) + "\n"


def gitignore_complete(path: Path) -> bool:
    """mockup/.gitignore ignoriert alles (`*`) und erlaubt danach genau die Allowlist."""
    try:
        rules = [ln.strip() for ln in Path(path).read_text(encoding="utf-8").splitlines()
                 if ln.strip() and not ln.strip().startswith("#")]
    except OSError:
        return False
    if "*" not in rules:
        return False
    star = rules.index("*")
    return all(("!%s" % n) in rules[star + 1:] for n in GITIGNORE_ALLOW)


def instance_is_project(inst: dict, pbip, report) -> bool:
    """Gehört eine Desktop-Instanz (normiert) zu diesem Projekt?"""
    return bool((pbip and same_path(inst.get("currentFilePath"), pbip))
                or same_path(inst.get("reportDir"), report))


def desktop_digest(project) -> str:
    """Fingerabdruck der Dateien, die Desktop beim Speichern schreibt (definition/ von Bericht
    und Modell: Pfad, Größe, Änderungszeit). Ändert er sich nach dem eigenen Reload, hat
    jemand in Desktop gespeichert, und eine spätere Markierung „ungespeichert" stammt nicht
    mehr vom Runner. Ordner .pbi (Cache, lokale Einstellungen) zählen nicht."""
    h = hashlib.sha1()
    for base in (project.report / "definition", project.model / "definition"):
        if not base.is_dir():
            continue
        for p in sorted(base.rglob("*")):
            try:
                if not p.is_file():
                    continue
                st = p.stat()
            except OSError:
                continue
            h.update(("%s|%d|%d\n" % (p.relative_to(project.root).as_posix(), st.st_size,
                                      st.st_mtime_ns)).encode("utf-8"))
    return h.hexdigest()[:16]


def reload_marker_matches(project, pid) -> bool:
    """Stammt „ungespeichert" in Desktop (pid) vom letzten Reload des Runners? Ja, wenn die
    Markierung .state/desktop-reload.json diese pid nennt und Desktop seitdem nichts
    gespeichert hat (Fingerabdruck gleich)."""
    m = read_json(project.reload_marker, retries=0)
    if not isinstance(m, dict) or str(m.get("pid")) != str(pid):
        return False
    return not m.get("digest") or m["digest"] == desktop_digest(project)


def canon(obj) -> str:
    return json.dumps(obj, sort_keys=True, ensure_ascii=False, separators=(",", ":"))


def ck_slot_hash(slot: dict) -> str:
    """Fingerabdruck dessen, was der Konverter für eine ChartKitchen-Kachel einstellt
    (Slot-`objects` plus Container-Titel). Ändert er sich, ohne dass die Kachel im Kitchen
    geändert wurde (neue Konverter-Abbildung), mischt der Runner die Objekte erneut ein."""
    objs = slot.get("objects") if isinstance(slot.get("objects"), dict) else None
    if not objs:
        return ""
    cont = slot.get("container") if isinstance(slot.get("container"), dict) else {}

    def no_text(entries, keys):
        # Titeltexte zählen nicht: eine reine Umbenennung ist eine Titeländerung und
        # lässt die übrige Desktop-Formatierung stehen
        out = []
        for e in entries if isinstance(entries, list) else []:
            e = dict(e) if isinstance(e, dict) else e
            if isinstance(e, dict) and isinstance(e.get("properties"), dict):
                e["properties"] = {k: v for k, v in e["properties"].items() if k not in keys}
            out.append(e)
        return out
    body = dict(objs)
    if "ibcsTitle" in body:
        body["ibcsTitle"] = no_text(body["ibcsTitle"], {"kpi", "message"})
    body = canon({"objects": body,
                  "title": {k: no_text(v, {"text"}) for k, v in cont.items()
                            if k in ("title", "subTitle")}})
    return hashlib.sha1(body.encode("utf-8")).hexdigest()[:16]


def vkey(v: dict) -> str:
    """Schlüssel einer Kachel in visuals{}: stableId, sonst id."""
    return str(v.get("stableId") or v.get("id") or "")


def vcore(v: dict) -> dict:
    return {k: val for k, val in (v or {}).items() if k not in IGNORED_VISUAL_KEYS}


def read_json(path: Path, retries: int = 3, wait: float = 0.3):
    """JSON lesen; halbe Dateien (Kitchen schreibt nicht atomar) erneut versuchen."""
    for attempt in range(retries + 1):
        try:
            return json.loads(path.read_text(encoding="utf-8-sig"))
        except FileNotFoundError:
            return None
        except (json.JSONDecodeError, UnicodeDecodeError, PermissionError):
            if attempt == retries:
                return None
            time.sleep(wait)
    return None


def write_json_atomic(path: Path, data, ascii_only: bool = False) -> None:
    """UTF-8 ohne BOM, atomar. ascii_only: Nicht-ASCII als \\uXXXX-Escape (für Dateien,
    die pbir liest: `add visual --from-json` und `batch run` lesen unter Windows in der
    Codepage cp1252, aus „Fußleiste" würde sonst „FuÃŸleiste")."""
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(data, ensure_ascii=ascii_only, indent=2) + "\n"
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(text, encoding="utf-8")
    for attempt in range(20):
        try:
            os.replace(tmp, path)
            return
        except PermissionError:           # Windows: Leser haelt die Datei kurz offen
            if attempt == 19:
                raise
            time.sleep(0.05)


def parse_json_output(text: str):
    """JSON aus einer CLI-Ausgabe lesen, auch wenn vorher Rauschen steht."""
    text = (text or "").strip()
    if not text:
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    start = text.find("{")
    while start != -1:
        try:
            return json.loads(text[start:])
        except json.JSONDecodeError:
            start = text.find("{", start + 1)
    return None


def parse_time(value):
    """ISO-8601 (auch mit Z) als zeitzonenbewusstes datetime, sonst None."""
    if not value or not isinstance(value, str):
        return None
    try:
        dt = datetime.fromisoformat(value.strip().replace("Z", "+00:00"))
    except ValueError:
        return None
    return dt if dt.tzinfo else dt.astimezone()


def same_path(a, b) -> bool:
    if not a or not b:
        return False
    try:
        return os.path.samefile(a, b)
    except OSError:
        return os.path.normcase(os.path.abspath(a)) == os.path.normcase(os.path.abspath(b))


def tree_hashes(root: Path, only=None) -> dict:
    """Pfad -> sha1 für alle Dateien unter root (optional nur bestimmte Namen)."""
    out = {}
    if not root.exists():
        return out
    for p in sorted(root.rglob("*")):
        if p.is_file() and (only is None or p.name.lower() in only):
            out[p.relative_to(root).as_posix()] = hashlib.sha1(p.read_bytes()).hexdigest()
    return out


def sync_tree(src: Path, dst: Path) -> int:
    """dst auf den Stand von src bringen; nur abweichende Dateien anfassen."""
    changed = 0
    src_files = {p.relative_to(src) for p in src.rglob("*") if p.is_file()}
    for p in sorted(dst.rglob("*"), reverse=True):
        rel = p.relative_to(dst)
        if p.is_file() and rel not in src_files:
            p.unlink()
            changed += 1
        elif p.is_dir() and not (src / rel).is_dir():
            shutil.rmtree(p, ignore_errors=True)
    for rel in sorted(src_files):
        s, d = src / rel, dst / rel
        if d.is_file() and d.read_bytes() == s.read_bytes():
            continue
        d.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(s, d)
        changed += 1
    return changed


def safe_file_name(name: str) -> str:
    """Dateiname wie in der Bridge-CLI (safeFileName)."""
    import re
    cleaned = re.sub(r'[<>:"/\\|?*\x00-\x1F]', "_", str(name or "page"))
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    cleaned = re.sub(r"[. ]+$", "", cleaned)
    return cleaned or "page"


def import_spec_tools(converter: Path):
    """mockup_spec.py aus dem Skill (upgrade, slug, spec_hash) laden."""
    sys.path.insert(0, str(converter.parent))
    try:
        import mockup_spec  # noqa: E402
    finally:
        sys.path.pop(0)
    return mockup_spec


# --------------------------------------------------------------------------- #
# Projekt
# --------------------------------------------------------------------------- #
class Project:
    def __init__(self, root) -> None:
        self.root = Path(root).expanduser().resolve()
        if not self.root.is_dir():
            raise RunnerError("Projektordner fehlt: %s" % self.root)
        pbips = sorted(self.root.glob("*.pbip"))
        if len(pbips) > 1:
            raise RunnerError("Mehrere .pbip im Projektordner: %s"
                              % ", ".join(p.name for p in pbips))
        if pbips:
            self.name, self.pbip = pbips[0].stem, pbips[0]
        else:
            reports = sorted(self.root.glob("*.Report"))
            if len(reports) != 1:
                raise RunnerError("Kein eindeutiges PBIP im Projektordner %s" % self.root)
            self.name, self.pbip = reports[0].name[:-len(".Report")], None
        self.report = self.root / ("%s.Report" % self.name)
        self.model = self.root / ("%s.SemanticModel" % self.name)
        if not (self.report / "definition").is_dir():
            raise RunnerError("PBIR-Bericht fehlt: %s/definition" % self.report)
        self.mk = self.root / "mockup"
        self.spec = self.mk / "mockup-spec.json"
        self.request = self.mk / "deploy-request.json"
        self.status = self.mk / "agent-status.json"
        self.out = self.mk / "out"
        self.backups = self.mk / "backup"
        self.shots = self.mk / "shots"
        self.state_dir = self.mk / ".state"
        self.last_spec = self.state_dir / "last-applied-spec.json"
        self.runner_state = self.state_dir / "runner.json"
        # vom Runner angelegte Visuals je Seite: {pageId: {name: {key, cat, type}}}
        self.created = self.state_dir / "created.json"
        # Stand des letzten erfolgreichen Deploys: specHash, offene Kacheln, Seitenbilder
        self.applied = self.state_dir / "applied.json"
        # Befunde von pbir validate --fields nach dem letzten erfolgreichen Deploy
        self.validate_cache = self.state_dir / "validate-baseline.json"
        # Freigaben für Modelländerungen (Kitchen oder Agent) und was davon schon lief
        self.approvals = self.mk / "model-approvals.json"
        self.model_applied = self.state_dir / "model-applied.json"
        self.kitchen = self.mk / "kitchen"
        # Beta-Ergänzungen 02.10.2026
        self.confirm = self.mk / "deploy-confirm.json"       # Kitchen: Antwort auf awaiting
        self.cancel = self.mk / "deploy-cancel.json"         # Kitchen: Anfrage zurückziehen
        self.session = self.mk / "desktop-session.json"      # Launcher bzw. Runner
        self.doctor = self.mk / "doctor.json"                # mk_live doctor
        self.reload_marker = self.state_dir / "desktop-reload.json"   # eigener Reload {pid, at}
        self.history_file = self.state_dir / "history.json"  # letzte Deploys (Zeitleiste)
        self.specs = self.state_dir / "specs"                # Spec-Stand je Deploy (Zurück zu n)
        self.log_file = self.state_dir / "runner.log"        # Protokoll (rotierend)
        self.stop_request = self.state_dir / "stop-request.json"   # mk_live stop
        # Korrekturrunde Demo: dauerhafte Fehler je Kachel (nicht in jedem Deploy erneut) und
        # die Seitenfläche im Desktop-Bild je Desktop-Sitzung (Rückfall der Erkennung)
        self.failures = self.state_dir / "failures.json"
        self.canvas_mem = self.state_dir / "canvas.json"

    @property
    def report_arg(self) -> str:
        return self.report.as_posix()

    def ensure_mockup_dir(self) -> None:
        """mockup/ mit .gitignore (alles ignoriert, Allowlist) und README.md. Eigene Zeilen
        einer vorhandenen .gitignore bleiben erhalten, die alte Runner-Form wird ersetzt."""
        self.mk.mkdir(parents=True, exist_ok=True)
        gi = self.mk / ".gitignore"
        if not gitignore_complete(gi):
            have = gi.read_text(encoding="utf-8").splitlines() if gi.exists() else []
            known = GITIGNORE_OLD | {"*"} | {"!%s" % n for n in GITIGNORE_ALLOW}
            extra = [ln.strip() for ln in have if ln.strip() and not ln.strip().startswith("#")
                     and ln.strip() not in known]
            gi.write_text(gitignore_text(extra), encoding="utf-8")
        readme = self.mk / "README.md"
        if not readme.exists():
            readme.write_text(README_TEXT, encoding="utf-8")

    def protected_hashes(self) -> dict:
        h = {"Report/" + k: v for k, v in tree_hashes(self.report, PROTECTED_FILES).items()}
        h.update({"Model/" + k: v for k, v in
                  tree_hashes(self.model, PROTECTED_FILES).items()})
        return h


# --------------------------------------------------------------------------- #
# Externe Programme
# --------------------------------------------------------------------------- #
def child_env() -> dict:
    env = dict(os.environ)
    env.setdefault("PYTHONIOENCODING", "utf-8")
    env["PYTHONUTF8"] = "1"
    env["NO_COLOR"] = "1"
    env["COLUMNS"] = "400"        # rich bricht Fehlermeldungen sonst bei 80 Zeichen um
    env["TERM"] = "dumb"
    return env


def resolve_cmd(spec: str, what: str):
    """Programmaufruf als Argumentliste; loest npm-Shims (.cmd/.ps1) auf."""
    if not spec:
        return None
    p = Path(spec)
    if p.suffix.lower() == ".py" and p.is_file():
        return [sys.executable, str(p)]
    exe = str(p) if p.is_file() else shutil.which(spec)
    if exe is None and " " in spec.strip():
        parts = shlex.split(spec, posix=(os.name != "nt"))
        head = resolve_cmd(parts[0], what)
        return head + parts[1:] if head else None
    if exe is None:
        return None
    ext = Path(exe).suffix.lower()
    if os.name == "nt" and ext in ("", ".ps1"):
        for alt in (".cmd", ".exe", ".bat"):
            cand = Path(exe).with_suffix(alt) if ext else Path(exe + alt)
            if cand.is_file():
                return [str(cand)]
        if ext == ".ps1":
            return ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", exe]
    return [exe]


# Kindprozesse ohne eigenes Konsolenfenster: der losgelöste Runner (mk-live start, External
# Tools) hat keine Konsole, jedes pbir/te/node bekäme sonst ein sichtbares Fenster
NO_WINDOW = getattr(subprocess, "CREATE_NO_WINDOW", 0) if os.name == "nt" else 0


def run(argv, timeout=600, env=None):
    try:
        e = child_env()
        if env:
            e.update({k: str(v) for k, v in env.items() if v is not None})
        cp = subprocess.run(argv, capture_output=True, text=True, encoding="utf-8",
                            errors="replace", timeout=timeout, env=e,
                            stdin=subprocess.DEVNULL, creationflags=NO_WINDOW)
        return cp.returncode, cp.stdout or "", cp.stderr or ""
    except FileNotFoundError as e:
        return 127, "", str(e)
    except subprocess.TimeoutExpired:
        return 124, "", "Zeitüberschreitung nach %s s" % timeout


def short(text: str, n: int = 300) -> str:
    text = " ".join((text or "").split())
    return text if len(text) <= n else text[:n - 1] + "…"


class Pbir:
    def __init__(self, cmd: str) -> None:
        self.argv = resolve_cmd(cmd, "pbir")
        if not self.argv:
            raise RunnerError("pbir nicht gefunden (%s)" % cmd)
        self.calls = 0

    def __call__(self, *args, timeout=600):
        self.calls += 1
        return run(self.argv + ["-q"] + [str(a) for a in args], timeout)

    def json(self, *args):
        rc, out, err = self(*args)
        data = parse_json_output(out)
        if data is None:
            raise RunnerError("pbir %s lieferte kein JSON: %s"
                              % (args[0], short(err or out)))
        return data


class Bridge:
    def __init__(self, cmd: str) -> None:
        self.spec = cmd
        self.argv = resolve_cmd(cmd, "bridge")

    def __call__(self, *args, timeout=300, env=None):
        if not self.argv:
            return 127, {"status": "error", "error": {
                "message": "Bridge-CLI nicht gefunden: %s" % self.spec,
                "code": "BRIDGE_CLI_MISSING"}}, ""
        rc, out, err = run(self.argv + [str(a) for a in args], timeout, env=env)
        data = parse_json_output(out)
        if data is None:
            data = {"status": "error", "error": {"message": short(err or out) or
                                                 "keine Ausgabe", "code": "NO_JSON"}}
        return rc, data, err


def bridge_error(data: dict) -> str:
    e = (data or {}).get("error") or {}
    msg = e.get("message") or (data or {}).get("lastError") or (data or {}).get("status")
    return "%s%s" % (msg, " (%s)" % e["code"] if e.get("code") else "")


def _norm_instance(i: dict, connected: bool) -> dict:
    pages = [{"id": pg.get("id") or pg.get("name"), "displayName": pg.get("displayName")}
             for pg in (i.get("pages") or []) if isinstance(pg, dict)]
    return {"pid": i.get("pid"), "currentFilePath": i.get("currentFilePath"),
            "hasUnsavedChanges": bool(i.get("hasUnsavedChanges")),
            "reportDir": i.get("reportDir"), "connected": connected, "pages": pages}


class DesktopCli:
    """Power BI Desktop steuern: Vorgabe `pbir desktop list/reload/screenshot`, sonst bzw.
    als Rückfall die Bridge-CLI `powerbi-desktop`. Öffnen geht nur über die Bridge-CLI
    (`open`, mit PBI_DESKTOP_PATH) oder direkt über die exe. Jeder Aufruf wird mit Dauer
    in `calls` vermerkt (Messung pbir gegen Bridge).

    Meldet Desktop bzw. die Pipe „busy", wiederholt der Runner denselben Aufruf bis zu
    `retries`-mal mit Backoff (backoff, 2·backoff, 4·backoff) und wechselt dafür nicht auf
    die Bridge-CLI (Review B, P2). Alle Desktop-Aufrufe laufen unter einer Sperre."""

    def __init__(self, backend: str, pbir: "Pbir", bridge: "Bridge", project, log=None,
                 retries: int = 3, backoff: float = 1.0) -> None:
        self.backend = backend
        self.pbir, self.bridge, self.p = pbir, bridge, project
        self.calls = []
        self.log = log or (lambda m: print("%s %s" % (datetime.now().strftime("%H:%M:%S"), m),
                                           flush=True))
        self.retries, self.backoff = max(0, int(retries)), max(0.0, float(backoff))
        self.busy_events = 0
        self._lock = threading.RLock()

    def _note(self, verb: str, how: str, t0: float, ok: bool, busy: bool = False) -> None:
        entry = {"verb": verb, "via": how, "s": round(time.time() - t0, 2), "ok": bool(ok)}
        if busy:
            entry["busy"] = True
        self.calls.append(entry)

    def _bridge_ok(self) -> bool:
        return bool(self.bridge.argv)

    @staticmethod
    def is_busy(text) -> bool:
        return bool(text and BUSY_RX.search(str(text)))

    def _pause(self, what: str, attempt: int) -> None:
        delay = self.backoff * (2 ** attempt)
        self.busy_events += 1
        self.log("Desktop beschäftigt (%s), Versuch %d von %d in %.1f s"
                 % (what, attempt + 2, self.retries + 1, delay))
        time.sleep(delay)

    # --- Status ------------------------------------------------------------ #
    def status(self, wait: float = 2) -> dict:
        """{"ok", "status", "error", "instances": [verbundene Instanzen, normiert]}"""
        with self._lock:
            return self._status(wait)

    def _status(self, wait) -> dict:
        err = None
        if self.backend == "pbir":
            for attempt in range(self.retries + 1):
                t0 = time.time()
                rc, out, se = self.pbir("desktop", "list", "--json", timeout=120)
                data = parse_json_output(out)
                if isinstance(data, dict) and isinstance(data.get("instances"), list):
                    busy_conn = [e for e in (data.get("connectionErrors") or [])
                                 if self.is_busy(json.dumps(e, ensure_ascii=False))]
                    if busy_conn and attempt < self.retries:
                        self._note("status", "pbir", t0, False, busy=True)
                        self._pause("Status", attempt)
                        continue
                    self._note("status", "pbir", t0, True)
                    inst = [_norm_instance(i, True) for i in data["instances"]
                            if isinstance(i, dict) and i.get("pid")]
                    return {"ok": True, "status": data.get("status"), "error": None,
                            "instances": inst}
                err = short(se or out) or "pbir desktop list ohne JSON"
                busy = self.is_busy(err)
                self._note("status", "pbir", t0, False, busy=busy)
                if not busy or attempt == self.retries:
                    break
                self._pause("Status", attempt)
            if self.is_busy(err):
                return {"ok": False, "status": "busy", "error": "Desktop beschäftigt: %s" % err,
                        "instances": []}
            if not self._bridge_ok():
                return {"ok": False, "status": "error", "error": err, "instances": []}
        data = {}
        for attempt in range(self.retries + 1):
            t0 = time.time()
            rc, data, _ = self.bridge("status", "--wait-seconds", str(wait))
            ok = data.get("status") != "error"
            busy = not ok and self.is_busy(bridge_error(data))
            self._note("status", "bridge", t0, ok, busy=busy)
            if ok or not busy or attempt == self.retries:
                break
            self._pause("Status", attempt)
        if data.get("status") == "error":
            return {"ok": False, "status": "busy" if self.is_busy(bridge_error(data))
                    else "error", "error": bridge_error(data), "instances": []}
        inst = [_norm_instance(i, i.get("bridgeStatus") == "connected")
                for i in (data.get("instances") or []) if isinstance(i, dict)]
        return {"ok": True, "status": data.get("status"), "error": err,
                "instances": [i for i in inst if i["connected"]]}

    def manifest(self, pid):
        if self.backend == "pbir" or not self._bridge_ok():
            return None
        with self._lock:
            t0 = time.time()
            rc, man, _ = self.bridge("manifest", "--pid", pid)
            self._note("manifest", "bridge", t0, man.get("status") == "ok")
            return man

    # --- Reload ------------------------------------------------------------ #
    def reload(self, pid, model: bool = False):
        """(ok, Meldung, Modell neu geladen)"""
        with self._lock:
            return self._reload(pid, model)

    def _reload(self, pid, model):
        msg = None
        if self.backend == "pbir":
            args = ["desktop", "reload", self.p.report_arg, "--wait-seconds", "60"]
            if pid:
                args += ["--pid", pid]
            if model:
                args.append("--model")
            for attempt in range(self.retries + 1):
                t0 = time.time()
                rc, out, err = self.pbir(*args, timeout=300)
                if rc == 0:
                    self._note("reload", "pbir", t0, True)
                    return True, "pbir desktop reload%s" % (" --model" if model else ""), model
                msg = short(err or out) or "Exit %d" % rc
                busy = self.is_busy(msg)
                self._note("reload", "pbir", t0, False, busy=busy)
                if not busy or attempt == self.retries:
                    break
                self._pause("Reload", attempt)
            if self.is_busy(msg):
                return False, "Desktop beschäftigt: %s" % msg, False
            if not self._bridge_ok():
                return False, msg, False
            self.log("pbir desktop reload: %s, Rückfall auf die Bridge-CLI" % msg)
        args = ["reload", "--wait-seconds", "60"]
        if pid:
            args += ["--pid", pid]
        data = {}
        for attempt in range(self.retries + 1):
            t0 = time.time()
            rc, data, _ = self.bridge(*args)
            ok = rc == 0 and data.get("status") == "ok" and \
                (data.get("result") or {}).get("success", True) is not False
            busy = not ok and self.is_busy(bridge_error(data))
            self._note("reload", "bridge", t0, ok, busy=busy)
            if ok:
                return True, "Bridge-Reload", False
            if not busy or attempt == self.retries:
                break
            self._pause("Reload", attempt)
        return False, bridge_error(data), False

    # --- Screenshot -------------------------------------------------------- #
    def screenshot(self, page_id, display, target: Path, scale, pid):
        """(Pfad oder None, Fehler)"""
        with self._lock:
            return self._screenshot(page_id, display, target, scale, pid)

    def _screenshot(self, page_id, display, target, scale, pid):
        err = None
        if self.backend == "pbir":
            args = ["desktop", "screenshot", "%s/%s.Page" % (self.p.report_arg, display),
                    "-o", str(target), "--scale", scale, "--json"]
            if pid:
                args += ["--pid", pid]
            for attempt in range(self.retries + 1):
                t0 = time.time()
                rc, out, se = self.pbir(*args, timeout=300)
                ok = rc == 0 and target.is_file()
                if ok:
                    self._note("screenshot", "pbir", t0, True)
                    return str(target), None
                err = short(se or out) or "Exit %d" % rc
                busy = self.is_busy(err)
                self._note("screenshot", "pbir", t0, False, busy=busy)
                if not busy or attempt == self.retries:
                    break
                self._pause("Bild", attempt)
            if self.is_busy(err) or not self._bridge_ok():
                return None, err
        args = ["screenshot", page_id, "--output", str(target), "--scale", scale,
                "--wait-seconds", "60"]
        if pid:
            args += ["--pid", pid]
        data = {}
        for attempt in range(self.retries + 1):
            t0 = time.time()
            rc, data, _ = self.bridge(*args, timeout=300)
            path = data.get("outputPath") if data.get("status") == "ok" else None
            ok = bool(path and Path(path).is_file())
            busy = not ok and self.is_busy(bridge_error(data))
            self._note("screenshot", "bridge", t0, ok, busy=busy)
            if ok:
                return path, None
            if not busy or attempt == self.retries:
                break
            self._pause("Bild", attempt)
        return None, bridge_error(data) + (" (pbir: %s)" % err if err else "")

    # --- Öffnen ------------------------------------------------------------ #
    def open(self, pbip: Path, exe):
        """Desktop mit der .pbip starten, nicht auf die Bridge warten (das macht der Runner
        selbst, weil `open` die erste beliebige Instanz meldet). (ok, Meldung)"""
        t0 = time.time()
        env = {"PBI_DESKTOP_PATH": exe} if exe else None
        if self._bridge_ok():
            rc, data, _ = self.bridge("open", str(pbip), "--timeout", "0", env=env,
                                      timeout=120)
            ok = data.get("status") in ("launched", "ok")
            self._note("open", "bridge", t0, ok)
            if ok:
                launched = data.get("launched") or {}
                return True, "powerbi-desktop open (%s)" % (
                    Path(launched.get("executablePath") or exe or "?").name)
            if not exe:
                return False, bridge_error(data)
        if exe and Path(exe).is_file():
            flags = 0
            if os.name == "nt":
                flags = getattr(subprocess, "DETACHED_PROCESS", 0) | \
                    getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0)
            subprocess.Popen([exe, str(pbip)], creationflags=flags, close_fds=True,
                             stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL,
                             stderr=subprocess.DEVNULL)
            self._note("open", "exe", t0, True)
            return True, "direkt gestartet (%s)" % Path(exe).name
        return False, ("Power BI Desktop nicht gefunden (PBI_DESKTOP_PATH auf "
                       "pbidesktop.exe setzen)")

    def summary(self) -> str:
        by = {}
        for c in self.calls:
            by.setdefault((c["verb"], c["via"]), []).append(c["s"])
        return ", ".join("%s/%s %.1f s" % (v, w, sum(t) / len(t))
                         for (v, w), t in sorted(by.items()))


# --------------------------------------------------------------------------- #
# Prozesse (nur für das Schließen der Desktop-Instanz dieses Projekts)
# --------------------------------------------------------------------------- #
def process_info(pid):
    """(Image-Name klein, exe-Pfad oder None) eines Prozesses, sonst (None, None)."""
    try:
        pid = int(pid)
    except (TypeError, ValueError):
        return None, None
    try:
        import psutil
        try:
            p = psutil.Process(pid)
            name = p.name().lower()
            try:
                exe = p.exe()
            except Exception:                    # noqa: BLE001 - Store-App: Zugriff verweigert
                exe = None
            return name, exe
        except Exception:                        # noqa: BLE001 - Prozess weg
            return None, None
    except ImportError:
        pass
    if os.name != "nt":
        return None, None
    rc, out, _ = run(["tasklist", "/FI", "PID eq %d" % pid, "/FO", "CSV", "/NH"], timeout=30)
    for line in out.splitlines():
        parts = [x.strip().strip('"') for x in line.split('","')]
        if len(parts) >= 2 and parts[1].strip('"') == str(pid):
            return parts[0].strip('"').lower(), None
    return None, None


def desktop_pids_with_file(path) -> list:
    """PIDs laufender pbidesktop.exe, deren Kommandozeile diese Datei nennt (mit der .pbip
    gestartet). Nur lesen. Ohne psutil über PowerShell/CIM."""
    if not path or os.name != "nt":
        return []
    want = os.path.normcase(os.path.abspath(str(path)))
    rows = []
    try:
        import psutil
        for p in psutil.process_iter(["pid", "name", "cmdline"]):
            if (p.info.get("name") or "").lower() == DESKTOP_IMAGE:
                rows.append((p.info["pid"], " ".join(p.info.get("cmdline") or [])))
    except ImportError:
        rc, out, _ = run(["powershell", "-NoProfile", "-Command",
                          "Get-CimInstance Win32_Process -Filter \"Name='PBIDesktop.exe'\" | "
                          "Select-Object ProcessId,CommandLine | ConvertTo-Json -Compress"],
                         timeout=60)
        data = parse_json_output(out) if out.strip().startswith("{") else None
        if data is None and out.strip().startswith("["):
            try:
                data = json.loads(out)
            except ValueError:
                data = None
        for d in (data if isinstance(data, list) else [data] if data else []):
            rows.append((d.get("ProcessId"), d.get("CommandLine") or ""))
    except Exception:                            # noqa: BLE001 - kein Zugriff: nichts melden
        return []
    return [pid for pid, cmd in rows
            if want in os.path.normcase(cmd.replace('"', "")) or cmdline_has_file(cmd, path)]


def cmdline_has_file(cmd: str, path) -> bool:
    """Nennt die Kommandozeile diese Datei? Vergleicht jede .pbip/.pbix darin als Datei
    (kurze 8.3-Namen und lange Namen gelten als gleich)."""
    if not cmd or not path:
        return False
    cands = re.findall(r'"([^"]+\.pbi[px])"', cmd, re.I) + \
        re.findall(r'(?:^|\s)([^\s"]+\.pbi[px])(?=\s|$)', cmd, re.I)
    return any(same_path(c, path) for c in cands)


def pid_alive(pid) -> bool:
    name, _ = process_info(pid)
    return name is not None


def desktop_alive(pid) -> bool:
    """Läuft unter dieser pid (noch) ein Power BI Desktop? Eine wiederverwendete pid eines
    anderen Programms zählt nicht."""
    name, _ = process_info(pid)
    return name == DESKTOP_IMAGE


def find_desktop_exe(remembered=None):
    """pbidesktop.exe für den Neustart: PBI_DESKTOP_PATH, dann der Pfad der gerade
    geschlossenen Instanz, dann laufende Instanzen, die neueste Store-Version unter
    WindowsApps (glob, Get-AppxPackage), klassische Installation, App-Alias."""
    env = os.environ.get("PBI_DESKTOP_PATH")
    if env and Path(env).is_file():
        return env
    if remembered and Path(remembered).is_file():
        return remembered
    if os.name != "nt":
        return None
    try:
        import psutil
        for p in psutil.process_iter(["name", "exe"]):
            if (p.info.get("name") or "").lower() == DESKTOP_IMAGE and p.info.get("exe"):
                return p.info["exe"]
    except Exception:                            # noqa: BLE001 - psutil fehlt oder kein Zugriff
        pass
    pf = os.environ.get("ProgramFiles", r"C:\Program Files")
    hits = [Path(x) for x in __import__("glob").glob(
        os.path.join(pf, "WindowsApps", "Microsoft.MicrosoftPowerBIDesktop_*", "bin",
                     "pbidesktop.exe"))]
    if not hits:
        rc, out, _ = run(["powershell", "-NoProfile", "-Command",
                          "(Get-AppxPackage -Name Microsoft.MicrosoftPowerBIDesktop | "
                          "Sort-Object Version -Descending | Select-Object -First 1)"
                          ".InstallLocation"], timeout=60)
        loc = (out or "").strip().splitlines()
        if rc == 0 and loc:
            cand = Path(loc[-1].strip()) / "bin" / "pbidesktop.exe"
            if cand.is_file():
                hits.append(cand)
    if hits:
        def ver(p: Path):
            m = re.search(r"_(\d+(?:\.\d+)+)_", p.parent.parent.name)
            return version_tuple(m.group(1)) if m else (0,)
        return str(max(hits, key=ver))
    for root in (pf, os.environ.get("ProgramFiles(x86)")):
        if not root:
            continue
        for sub in ("Microsoft Power BI Desktop", "Microsoft Power BI Desktop RS"):
            cand = Path(root) / sub / "bin" / "PBIDesktop.exe"
            if cand.is_file():
                return str(cand)
    la = os.environ.get("LOCALAPPDATA")
    if la:
        for alias in ("PBIDesktopStore.exe", "PBIDesktop.exe"):
            cand = Path(la) / "Microsoft" / "WindowsApps" / alias
            if cand.exists():
                return str(cand)
    return None


# --------------------------------------------------------------------------- #
# agent-status.json
# --------------------------------------------------------------------------- #
class Status:
    """agent-status.json: Ergebnis der letzten seq, Herzschlag, laufender Schritt, Rückfragen
    (`awaiting`), Vorschau (`plan`) und Verlauf (`history`, letzte 20 Deploys)."""

    CARRY = ("seq", "state", "message", "finishedAt", "pages", "visuals", "desktop", "todos")

    def __init__(self, project: Project, log, session_id=None) -> None:
        self.p = project
        self.log = log
        self.lock = threading.RLock()
        old = read_json(project.status, retries=1) or {}
        self.doc = old if isinstance(old, dict) and old.get("contract") == CONTRACT_VERSION else {}
        self.doc.setdefault("contract", CONTRACT_VERSION)
        self.doc.setdefault("seq", 0)
        self.doc.setdefault("state", "idle")
        self.doc.pop("awaiting", None)                # eine alte Rückfrage gilt nicht mehr
        if self.doc.get("state") == "running":      # Absturz während eines Laufs
            self.doc["state"] = "failed"
            self.doc["message"] = "Runner wurde während des Laufs beendet"
        hist = read_json(project.history_file, retries=0)
        self.history = [h for h in hist if isinstance(h, dict)][-HISTORY_MAX:] \
            if isinstance(hist, list) else []
        self.doc["history"] = self.history
        self.doc["runner"] = {"version": RUNNER_VERSION, "pid": os.getpid(),
                              "heartbeatAt": now_iso(), "state": "idle",
                              "sessionId": session_id, "projectPath": str(project.root),
                              "current": None, "startedAt": now_iso()}
        self.prev = {}
        self.t0 = self.t_last = time.time()

    def save(self) -> None:
        with self.lock:
            self.doc["runner"]["heartbeatAt"] = now_iso()
            write_json_atomic(self.p.status, self.doc)

    def heartbeat(self) -> None:
        with self.lock:
            self.save()

    def begin(self, req: dict) -> None:
        with self.lock:
            runner = self.doc["runner"]
            runner["state"] = "running"
            runner["current"] = None
            self.prev = {k: copy.deepcopy(self.doc.get(k)) for k in self.CARRY}
            live = self.doc.get("desktopLive")
            self.doc = {"contract": CONTRACT_VERSION, "runner": runner,
                        "seq": req.get("seq"), "state": "running",
                        "startedAt": now_iso(), "finishedAt": None,
                        "message": "Deploy %s läuft" % req.get("seq"),
                        "desktop": {"connected": False, "file": None,
                                    "hasUnsavedChanges": None, "unsavedByUs": None,
                                    "reloaded": False},
                        "steps": [], "pages": {}, "visuals": {}, "todos": [],
                        "history": self.history}
            scope = req.get("scope")
            if scope and scope != "all":
                self.doc["scope"] = scope
            for flag in ("dryRun", "prepare"):
                if req.get(flag):
                    self.doc[flag] = True
            if isinstance(req.get("restore"), dict):
                self.doc["restore"] = req["restore"]
            if req.get("sessionId"):
                self.doc["sessionId"] = req["sessionId"]
            if live:
                self.doc["desktopLive"] = live
            self.t0 = self.t_last = time.time()
            self.save()

    def begin_step(self, sid: str) -> None:
        """Laufenden Schritt melden (runner.current), damit das Kitchen den Stepper zeigt."""
        with self.lock:
            if self.doc["runner"].get("current") != sid:
                self.doc["runner"]["current"] = sid
                self.save()

    def step(self, sid: str, state: str, msg: str) -> None:
        """Schritt melden, mit Dauer seit dem vorigen Schritt (Schritte laufen nacheinander):
        `msg` endet mit „(x,x s)", dazu `ms` und `startedAt`."""
        now = time.time()
        start = getattr(self, "t_last", now)
        dt = now - start
        self.t_last = now
        with self.lock:
            steps = [s for s in self.doc["steps"] if s["id"] != sid]
            steps.append({"id": sid, "state": state, "msg": "%s (%.1f s)" % (msg, dt),
                          "ms": int(round(dt * 1000)), "startedAt": iso_from_ts(start)})
            self.doc["steps"] = steps
            if self.doc["runner"].get("current") == sid:
                self.doc["runner"]["current"] = None
            self.save()
        self.log("%s %s (%.1f s): %s" % (sid, state, dt, msg))

    def set_awaiting(self, info: dict) -> None:
        with self.lock:
            self.doc["awaiting"] = info
            self.doc["runner"]["state"] = "awaiting"
            self.doc["message"] = "Deploy %s wartet: %s" % (self.doc.get("seq"), info.get("reason"))
            self.save()

    def clear_awaiting(self) -> None:
        with self.lock:
            self.doc.pop("awaiting", None)
            if self.doc["runner"].get("state") == "awaiting":
                self.doc["runner"]["state"] = "running"
            self.doc["message"] = "Deploy %s läuft" % self.doc.get("seq")
            self.save()

    def set_live(self, info: dict) -> None:
        """Desktop-Zustand aus dem Leerlauf (--idle-poll), unabhängig vom letzten Deploy."""
        with self.lock:
            self.doc["desktopLive"] = info
            self.save()

    def finish(self, state: str, message: str, entry=None) -> None:
        total = time.time() - getattr(self, "t0", time.time())
        with self.lock:
            self.doc["state"] = state
            self.doc["message"] = message
            self.doc["finishedAt"] = now_iso()
            self.doc["ms"] = int(round(total * 1000))
            self.doc.pop("awaiting", None)
            self.doc["runner"]["state"] = "idle"
            self.doc["runner"]["current"] = None
            if entry:
                entry = dict(entry, at=self.doc["finishedAt"], ms=self.doc["ms"])
                self.history = [h for h in self.history if h.get("seq") != entry.get("seq")]
                self.history = (self.history + [entry])[-HISTORY_MAX:]
                self.doc["history"] = self.history
                try:
                    self.p.state_dir.mkdir(parents=True, exist_ok=True)
                    write_json_atomic(self.p.history_file, self.history)
                except OSError as e:
                    self.log("Verlauf nicht gespeichert: %s" % e)
            self.save()
        self.log("=> %s (%.1f s): %s" % (state, total, message))


# --------------------------------------------------------------------------- #
# Deploy
# --------------------------------------------------------------------------- #
class Deploy:
    """Ein Deploy-Lauf für eine seq."""

    def __init__(self, runner: "Runner", req: dict) -> None:
        self.r = runner
        self.p = runner.p
        self.opt = runner.opt
        self.st = runner.status
        self.req = req
        self.seq = req.get("seq")
        self.pbir = runner.pbir
        self.todos = []
        self.visuals = {}          # stableId -> Ergebnis
        self.pages = {}            # Seitenname -> Ergebnis
        self.applied_keys = set()  # Kacheln, die jetzt im Bericht dem Spec-Stand entsprechen
        self.failed_keys = set()
        self.report_pages = []     # [{id, displayName}]
        self.page_visuals = {}     # page id -> {name: {type, path}}
        self.counts = {"created": 0, "updated": 0, "error": 0, "skipped": 0}
        self.ck_ref = None         # Referenz-Instanz {page, name, json}
        self.created = {}          # .state/created.json
        self.desk = runner.desktop
        self.inst = None           # Desktop-Instanz mit diesem Projekt (normiert) oder None
        self.others = []           # andere Desktop-Instanzen (nie anfassen)
        self.desk_error = None     # Meldung, warum Desktop nicht erreichbar ist
        self.window = None         # None | "closed" (Desktop zu) | "open" (Desktop offen)
        self.closed_by_us = False  # Runner hat Desktop geschlossen -> am Ende neu öffnen
        self.open_after = False    # Desktop am Ende öffnen (geschlossen oder lief nicht)
        self.desktop_exe = None    # exe der geschlossenen Instanz (für den Neustart)
        self.vis_state = {}        # guid -> ok | installed | missing | outdated | nobuild
        self.vis_needed = {}       # guid -> {"name", "version", "ids"}
        self.ck_installed = False
        self.theme_registered = False
        self.model_reload = False
        self.model_followups = []
        self.reopened = False
        self.chrome_sets = {}      # Seite -> {Visual: chrome-batch-set-Werte}
        self.base_src = None
        # Beta-Ergänzungen 02.10.2026
        self.scope = str(req.get("scope") or "all")
        self.dry = bool(req.get("dryRun"))
        self.preparing = bool(req.get("prepare"))
        rst = req.get("restore")
        self.restore_from = rst.get("fromBackup") if isinstance(rst, dict) else None
        self.todo_install = []     # GUIDs, die installiert werden müssten
        self.theme_reg = False     # Theme muss einmalig registriert werden
        self.restart_reason = None # Text, wenn dieser Deploy einen Desktop-Neustart braucht
        self.confirmed = None      # bestätigte Antwort: restart | discard | skipRestart | auto
        self.skip_restart = False  # „Ohne Neustart deployen"
        self.consumed = set()      # schon bearbeitete deploy-confirm-Einträge (at, action)
        self.model_ops = []        # Ops aus model_ops.plan
        self.te_state = None       # (ok, version, Meldung) aus model_ops.te_available
        self.extra_visuals = []    # prepare: zusätzlich zu installierende Kitchen-Visuals
        self.plan_doc = None       # Vorschau im Status (`plan`)
        self.restored = None       # restore: {fromBackup, source, spec}
        self.wrote = False         # dieser Deploy hat den Bericht geschrieben (backup/<seq>)
        self.model_plan_error = None
        self.no_reload = False     # Rückfrage „unsaved" mit skipRestart: schreiben, nicht neu laden
        self.out_dir = self.p.out  # Konverter-Ausgabe (Vorschau: .state/preview-out)
        self.kseq = self.seq       # Kitchen-Bilder für den Vergleich (restore: Deploy n)
        # Korrekturrunde Demo 02.10.2026
        self.pbir_calls0 = self.pbir.calls   # pbir-Aufrufe zählen je Deploy, nicht je Runner
        self.confirmed_pid = None  # Desktop-pid, für die eine Antwort (restart/discard) galt
        self.state_snap = None     # .state-Dateien vor save_state (Rücknahme vor dem Reload)
        self.restyle_report = True  # Gestaltung (Theme, Hintergrund, Stil) darf geschrieben werden
        self.design_changed_base = False   # design anders als in der Vergleichsbasis
        self.direct = 0            # direkt geschriebene visual.json (Custom Visuals, B1)
        self.raw_spec = None       # Spec dieses Deploys (für .state/specs/<seq>.json)
        self.fail_mem = None       # .state/failures.json
        self.failed_targets = set()  # Ziele mit Fehler (auch Rahmen-Elemente ohne Kachel)
        self.mem_kept = {}         # Dauerfehler, die dieser Deploy nicht erneut versucht hat
        self.asked = False         # dieser Deploy hat eine Rückfrage gestellt (awaiting)
        self.gate_unsaved = None   # Ungespeichertes in Desktop, wie es die Prüfung vor dem
                                   # Schreiben sah (None: nicht geprüft)
        self.design_info = None    # design_state(): eingelesen, Gestaltung geändert
        self.kept_versions = []    # B7: ältere Kitchen-Visuals, die bleiben (Name, alt, neu)

    # ---------------- Hilfen ---------------- #
    def todo(self, kind: str, ref: str, text: str, **extra) -> None:
        item = {"kind": kind, "ref": ref, "text": text}
        item.update({k: v for k, v in extra.items() if v is not None})
        if item not in self.todos:
            self.todos.append(item)

    RANK = {"applied": 0, "ok": 0, "warn": 1, "skipped": 2, "error": 3}

    def vres(self, key: str, state: str, msg: str = "", **extra) -> None:
        """Ergebnis je Kachel; der schlechteste Zustand gewinnt, Meldungen sammeln sich."""
        entry = self.visuals.setdefault(key, {"state": state, "msg": ""})
        if self.RANK.get(state, 0) >= self.RANK.get(entry["state"], 0):
            entry["state"] = state
        if msg and msg not in entry["msg"]:
            entry["msg"] = (entry["msg"] + " · " + msg) if entry["msg"] else msg
        for k, v in extra.items():
            if isinstance(v, dict) and isinstance(entry.get(k), dict):
                entry[k].update({kk: vv for kk, vv in v.items() if vv is not None})
            else:
                entry[k] = v

    # Nur lesen: Seiten und Visuals direkt aus den PBIR-Dateien (schneller als `pbir ls`,
    # geschrieben wird weiter nur über pbir)
    def load_report_pages(self) -> None:
        root = self.p.report / "definition" / "pages"
        meta = read_json(root / "pages.json", retries=1) or {}
        order = [str(x) for x in (meta.get("pageOrder") or [])]
        if root.is_dir():
            order += sorted(d.name for d in root.iterdir()
                            if d.is_dir() and d.name not in order and (d / "page.json").is_file())
        pages = []
        for folder in order:
            pj = read_json(root / folder / "page.json", retries=1)
            if not isinstance(pj, dict):
                continue
            pages.append({"id": pj.get("name") or folder,
                          "displayName": pj.get("displayName") or folder,
                          "dir": root / folder,
                          "width": pj.get("width"), "height": pj.get("height")})
        self.report_pages = pages
        self.page_visuals = {}

    def visuals_on(self, page_id: str, refresh: bool = False) -> dict:
        if refresh or page_id not in self.page_visuals:
            pg = self.page_by_id(page_id)
            if pg is None:                      # Seite gerade angelegt: neu einlesen
                self.load_report_pages()
                pg = self.page_by_id(page_id)
            out = {}
            vdir = (pg["dir"] / "visuals") if pg else None
            if vdir is not None and vdir.is_dir():
                for d in sorted(vdir.iterdir()):
                    vj = read_json(d / "visual.json", retries=1) if d.is_dir() else None
                    if not isinstance(vj, dict):
                        continue
                    vtype = (vj.get("visual") or {}).get("visualType")
                    if not vtype and "visualGroup" in vj:
                        vtype = "group"
                    out[vj.get("name") or d.name] = {"type": vtype, "path": str(d)}
            self.page_visuals[page_id] = out
        return self.page_visuals[page_id]

    def page_by_id(self, pid):
        return next((pg for pg in self.report_pages if pg["id"] == pid), None)

    def page_by_name(self, name):
        hits = [pg for pg in self.report_pages if pg["displayName"] == name]
        return hits[0] if len(hits) == 1 else None

    def validate_problems(self):
        rc, out, err = self.pbir("validate", self.p.report_arg, "--fields", "--json")
        data = parse_json_output(out)
        if data is None:
            raise RunnerError("pbir validate --fields lieferte kein JSON: %s"
                              % short(err or out))
        probs = {}
        for issue in (data.get("errors") or []):
            probs[self._sig(issue)] = issue
        for issue in (data.get("warnings") or []):
            if str(issue.get("code") or "").upper().startswith("FIELD"):
                probs[self._sig(issue)] = issue
        return probs, data

    @staticmethod
    def _sig(issue: dict) -> str:
        d = issue.get("details") or {}
        return "|".join(str(x) for x in (issue.get("code"), issue.get("location"),
                                          issue.get("message"), d.get("path")))

    # ---------------- Ablauf ---------------- #
    def execute(self) -> str:
        self.st.begin(self.req)
        self.r.log("Deploy %s gestartet%s" % (self.seq, self.mode_note()))
        try:
            self.check_request()
            if self.preparing:
                return self.run_prepare()
            if self.restore_from is not None:
                return self.run_restore()
            if self.dry:
                return self.run_dry()
            if self.scope == "all" and self.unchanged():
                return self.done()
            self.st.begin_step("bridge")
            self.check_bridge()
            self.check_model()
            self.st.begin_step("spec")
            raw = self.check_spec()
            self.raw_spec = raw
            self.snapshot_request_spec(raw)      # .state/specs/<seq>.json je Deploy
            self.st.begin_step("build")
            nspec = self.build(raw)
            self.visuals_decide(nspec)
            self.model_plan(raw)
            self.preview(raw, nspec)             # Vorschau im Status, bevor gefragt wird
            self.desktop_gate()                  # Neustart / Ungespeichertes: Rückfrage
            if self.asked:                       # Safety (3): nach einer Rückfrage erneut
                self.check_duplicates("nach der Rückfrage, vor dem Schreiben")
            if self.opt.install and (self.todo_install or self.theme_reg):
                # Safety-Review 2: Sicherung vor der Installation bzw. Theme-Registrierung (wie
                # beim Vorbereiten), damit Rücknahmen auch report.json, CustomVisuals/ und
                # RegisteredResources auf den Stand vor dem Deploy bringen
                self.st.begin_step("backup")
                self.backup()
            self.st.begin_step("visuals")
            self.visuals_step(nspec)
            self.model_step(raw)
            self.st.begin_step("plan")
            plan = self.plan(raw, nspec)
            if self.scope in ("theme", "model"):
                plan = self.scope_plan(plan)
            self.publish_plan_doc(self.plan_summary(plan))
            if any(pw["items"] or pw["action"] == "create" or pw["background"]
                   for pw in plan) or self.theme_wanted() or self.model_followups:
                if not getattr(self, "backup_dir", None):
                    self.st.begin_step("backup")
                    self.backup()
                self.st.begin_step("write")
                changed = self.write(plan, nspec)
            else:
                changed = False
                for sid in ("backup", "write", "validate"):
                    if sid == "backup" and getattr(self, "backup_dir", None):
                        continue                 # schon vor der Installation gesichert
                    self.st.step(sid, "skipped", "nichts zu schreiben")
                for pw in plan:
                    self.pages[pw["name"]] = {"state": "applied", "shot": None,
                                              "action": "unchanged",
                                              "pbir": {"page": pw["pageId"]}}
            self.state_snap = self.snapshot_state()
            if self.scope not in ("theme", "model"):
                self.save_state(raw, nspec)
            if self.open_after:
                self.st.begin_step("desktop")
                reloaded = self.reopen()         # frisch geöffnet: kein Reload nötig
            else:
                self.st.begin_step("reload")
                if changed or self.model_reload:
                    try:                         # Safety (3): zweites Fenster seit der Rückfrage,
                        # Safety-Review 2 (2): neue ungespeicherte Arbeit seit dem Schreibbeginn
                        self.check_duplicates("vor dem Neuladen", unsaved_check=True)
                    except Blocked as e:
                        self.undo_write(str(e))
                        raise Blocked("%s Der Bericht ist zurückgesetzt, nichts geändert."
                                      % e) from None
                reloaded = self.reload(changed, model=self.model_reload)
            self.st.begin_step("shots")
            self.shots(reloaded, plan)
            self.st.begin_step("compare")
            self.compare()
            self.save_applied(raw)
            self.snapshot_spec()
            self.remember_failures(plan)
            return self.done()
        except Cancelled as e:
            self.reopen_after_error()
            self.publish()
            self.finish("cancelled", str(e))
            return "cancelled"
        except Blocked as e:
            self.reopen_after_error()
            self.publish()
            self.finish("blocked", str(e))
            return "blocked"
        except RunnerError as e:
            self.reopen_after_error()
            self.publish()
            self.finish("failed", str(e))
            return "failed"
        except Exception as e:                   # noqa: BLE001 - nie im Zustand running hängen
            import traceback
            self.r.log(traceback.format_exc())
            self.reopen_after_error()
            self.publish()
            self.finish("failed", "Interner Fehler im Runner: %s: %s"
                        % (type(e).__name__, e))
            return "failed"

    def mode_note(self) -> str:
        parts = []
        if self.dry:
            parts.append("Vorschau")
        if self.preparing:
            parts.append("Sitzung vorbereiten")
        if self.restore_from is not None:
            parts.append("zurück zu Deploy %s" % self.restore_from)
        if self.scope != "all":
            parts.append("Teilziel %s" % self.scope)
        return " (%s)" % ", ".join(parts) if parts else ""

    def finish(self, state: str, message: str) -> None:
        """Ergebnis melden; echte Deploys (keine Vorschau) kommen in den Verlauf. Vorschau
        und Abbruch ohne Schreiben lassen das Ergebnis des letzten Deploys sichtbar."""
        if state in ("planned", "cancelled") and not self.wrote:
            self.carry_previous()
        entry = None if state == "planned" else self.history_entry(state)
        if entry is not None:
            entry["message"] = message
        self.st.finish(state, message, entry)

    def withdraw(self) -> str:
        """deploy-cancel.json nennt diese seq, bevor sie begann: nichts tun, nur melden."""
        self.st.begin(self.req)
        self.carry_previous()
        self.st.finish("cancelled", "Deploy %s zurückgezogen, bevor er begann" % self.seq)
        return "cancelled"

    def history_entry(self, state: str) -> dict:
        counts = {"applied": 0, "warn": 0, "error": 0}
        for v in self.visuals.values():
            s = v.get("state")
            if s == "applied" or (s == "ok" and v.get("msg") != "unverändert"):
                counts["applied"] += 1
            elif s == "warn":
                counts["warn"] += 1
            elif s == "error":
                counts["error"] += 1
        kpng = None
        tj = read_json(self.p.kitchen / str(self.kseq) / "tiles.json", retries=0)
        if isinstance(tj, dict):
            for pg in tj.get("pages") or []:
                rel = pg.get("png") or ("kitchen/%s/%s" % (self.kseq, pg.get("file")))
                if (self.p.mk / rel).is_file():
                    kpng = rel
                    break
        shot_page = next((r.get("shotPage") for r in self.pages.values()
                          if r.get("shotPage")), None) or \
            next((r.get("shot") for r in self.pages.values() if r.get("shot")), None)
        entry = {"seq": self.seq, "state": state, "counts": counts, "kitchenPng": kpng,
                 "shotPage": shot_page, "scope": self.scope,
                 "restart": bool(self.closed_by_us or self.reopened),
                 "backup": (self.p.backups / str(self.seq)).is_dir() and self.wrote,
                 "message": self.st.doc.get("message"), "pbirCalls": self.pbir_calls()}
        if (self.p.specs / ("%s.json" % self.seq)).is_file():
            entry["spec"] = ".state/specs/%s.json" % self.seq
        if self.preparing:
            entry["prepare"] = True
        if self.restore_from is not None:
            entry["restoredFrom"] = self.restore_from
        return entry

    def reopen_after_error(self) -> None:
        """Hat der Runner Desktop geschlossen, öffnet er es auch nach einem Fehler wieder."""
        if self.closed_by_us and not self.reopened:
            try:
                self.reopen()
            except Blocked as e:
                self.r.log("Desktop nach Fehler nicht wieder geöffnet: %s" % e)
            except Exception as e:               # noqa: BLE001
                self.r.log("Desktop nach Fehler nicht wieder geöffnet: %s" % e)

    def unchanged(self) -> bool:
        """Schnellweg: Spec = Vergleichsbasis und nichts offen -> ohne pbir, Reload und
        Screenshots fertig. Seitenbilder des letzten Deploys werden übernommen."""
        raw = read_json(self.p.spec, retries=1)
        if not isinstance(raw, dict):
            return False
        try:
            have = self.spec_hash_of(raw)
        except Exception:                        # noqa: BLE001 - normaler Weg meldet es
            return False
        want = self.req.get("specHash")
        if want and have != want:
            return False
        base_raw, base_src = self.load_base()
        if not isinstance(base_raw, dict):
            return False
        try:
            base_hash = self.spec_hash_of(base_raw)
        except Exception:                        # noqa: BLE001
            return False
        if base_hash != have:
            return False
        applied = read_json(self.p.applied, retries=0) or {}
        if base_src == self.p.last_spec.name and (
                applied.get("specHash") != have or applied.get("pending")):
            return False
        if applied.get("scope") not in (None, "all"):
            return False                         # letzter Lauf war nur ein Teilziel
        if self.open_approvals():
            return False                         # neue Modell-Freigaben: normaler Lauf
        if self.opt.install:
            have_vis = {i["guid"]: i for i in self.safe_installed()}
            for guid, ver in (applied.get("visuals") or {}).items():
                i = have_vis.get(guid)
                if not i or not i.get("registered") or not i.get("folder") or \
                        version_tuple(i.get("version")) < version_tuple(ver):
                    return False                 # z. B. Desktop hat report.json überschrieben
        for name, pg in (applied.get("pages") or {}).items():
            shot = pg.get("shot")
            if shot and not (self.p.mk / shot).is_file():
                shot = None
            self.pages[name] = {"state": "applied", "shot": shot, "action": "unchanged",
                                "pbir": pg.get("pbir")}
            sp = pg.get("shotPage")
            if shot and sp and (self.p.mk / sp).is_file():
                self.pages[name]["shotPage"] = sp
        with self.st.lock:
            self.st.doc["desktop"].update(applied.get("desktop") or {})
            self.st.doc["desktop"]["reloaded"] = False
        # To-dos des letzten Deploys gelten weiter (gleicher Stand), z. B. „erneut freigeben"
        self.todos = [t for t in (self.st.prev or {}).get("todos") or [] if isinstance(t, dict)]
        self.st.step("spec", "ok", "specHash %s · keine Änderung seit dem letzten Deploy "
                     "(Basis %s), nichts zu tun" % (have, base_src))
        return True

    def save_applied(self, raw: dict) -> None:
        """Merkt specHash, offene Kacheln und die Seitenbilder für den Schnellweg."""
        # offen = mit Fehler (z. B. Feld fehlt im Modell): ein erneuter Deploy soll es
        # wieder versuchen. Übersprungenes (nicht baubar, in Desktop gelöscht) bleibt so.
        pending = sorted(k for k, r in self.visuals.items() if r.get("state") == "error")
        desk = {k: v for k, v in (self.st.doc.get("desktop") or {}).items()
                if k in ("connected", "file", "pid")}
        vis = {g: (self.vis_needed.get(g) or {}).get("version")
               for g, s in self.vis_state.items() if s in ("ok", "installed")}
        doc = {"specHash": self.spec_hash_of(raw), "seq": self.seq, "pending": pending,
               "pages": {n: {k: r.get(k) for k in ("shot", "shotPage", "pbir")}
                         for n, r in self.pages.items() if r.get("state") == "applied"},
               "desktop": desk, "visuals": vis}
        if self.scope != "all":
            doc["scope"] = self.scope            # kein Schnellweg nach einem Teilziel
        write_json_atomic(self.p.applied, doc)

    def snapshot_request_spec(self, raw: dict) -> None:
        """.state/specs/<seq>.json: die Spec genau dieses Deploys, sobald sie gelesen ist (auch
        wenn der Deploy danach blockiert oder scheitert). Das Kitchen lädt sie bei „Zurück zu
        Deploy n" (CONTRACT: restore). Das Kitchen schreibt mockup-spec.json laufend weiter,
        darum die gelesene Fassung, nicht eine spätere Kopie der Datei."""
        try:
            self.p.specs.mkdir(parents=True, exist_ok=True)
            write_json_atomic(self.p.specs / ("%s.json" % self.seq), raw)
            self.prune_specs()
        except OSError as e:
            self.r.log("Spec-Stand nicht gesichert: %s" % e)

    def prune_specs(self) -> None:
        keep = max(HISTORY_MAX, int(self.opt.keep_backups))
        seqs = sorted({int(f.name.split(".")[0]) for f in self.p.specs.glob("*.json")
                       if f.name.split(".")[0].isdigit()})
        for old in seqs[:-keep]:
            for f in self.p.specs.glob("%d.*" % old):
                f.unlink()

    def snapshot_spec(self) -> None:
        """Spec-Stand dieses Deploys für „Zurück zu Deploy n": roh (was das Kitchen wollte)
        und angewendet (Vergleichsbasis). Nur die letzten max(20, --keep-backups) bleiben."""
        try:
            self.p.specs.mkdir(parents=True, exist_ok=True)
            target = self.p.specs / ("%s.json" % self.seq)
            if isinstance(self.raw_spec, dict):
                if not target.is_file():
                    write_json_atomic(target, self.raw_spec)
            elif self.p.spec.is_file() and not target.is_file():
                shutil.copyfile(self.p.spec, target)
            if self.p.last_spec.is_file():
                shutil.copyfile(self.p.last_spec, self.p.specs / ("%s.applied.json" % self.seq))
            self.prune_specs()
        except OSError as e:
            self.r.log("Spec-Stand nicht gesichert: %s" % e)

    # --- Rücknahme kurz vor dem Reload (Safety 3) --------------------------- #
    STATE_FILES = ("last-applied-spec.json", "page-map.json", "created.json",
                   "ck-objects.json", "validate-baseline.json")

    def snapshot_state(self) -> dict:
        snap = {}
        for name in self.STATE_FILES:
            f = self.p.state_dir / name
            try:
                snap[name] = f.read_bytes() if f.is_file() else None
            except OSError:
                snap[name] = None
        return snap

    def undo_write(self, why: str) -> None:
        """Bericht aus backup/<seq> zurück und die .state-Dateien wie vor dem Deploy: der
        Deploy blockiert, ohne dass ein Desktop-Fenster einen halben Stand sieht."""
        n = self.restore() if getattr(self, "backup_dir", None) else 0
        for name, data in (self.state_snap or {}).items():
            f = self.p.state_dir / name
            try:
                if data is None:
                    if f.is_file():
                        f.unlink()
                else:
                    f.write_bytes(data)
            except OSError as e:
                self.r.log(".state/%s nicht zurückgesetzt: %s" % (name, e))
        for key, r in self.visuals.items():
            if r.get("state") in ("applied", "ok", "warn"):
                r.update(state="skipped", msg="Zurückgenommen: %s" % short(why, 160))
        for res in self.pages.values():
            res.update(state="skipped", shot=None)
        note = " Modelländerungen über te bleiben (in Desktop neu laden)." \
            if self.model_reload else ""
        self.st.step("reload", "error", "nicht neu geladen, Bericht zurückgesetzt (%d Datei(en))."
                     "%s %s" % (n, note, why))

    def check_duplicates(self, when: str, unsaved_check: bool = False) -> None:
        """Safety (3): das Projekt darf nur in genau einem Desktop-Fenster offen sein, und
        es muss die Instanz sein, mit der dieser Deploy arbeitet (bzw. bestätigt wurde).
        unsaved_check (vor dem Neuladen, Safety-Review 2 (2)): hat Desktop seit der Prüfung
        vor dem Schreiben ungespeicherte Änderungen bekommen (jemand hat während des Deploys
        in Desktop gearbeitet), würde der Reload sie still verwerfen -> Blocked."""
        if self.opt.no_bridge or self.inst is None:
            return
        data = self.desk.status(wait=0)
        if not data.get("ok"):
            return                               # nicht lesbar: der Reload meldet es selbst
        mine = [i for i in data["instances"] if self.is_mine(i)]
        want = self.confirmed_pid or self.inst.get("pid")
        pids = [i.get("pid") for i in mine]
        if self.p.pbip:
            # Fenster ohne Bridge, deren Kommandozeile die .pbip nennt; Instanzen in der
            # Bridge-Liste melden ihre aktuelle Datei selbst (Kommandozeile kann alt sein)
            listed = {str(i.get("pid")) for i in data["instances"]}
            pids += [p for p in desktop_pids_with_file(self.p.pbip)
                     if str(p) not in {str(x) for x in pids} and str(p) not in listed]
        if len(pids) > 1:
            msg = ("Das Projekt ist in %d Desktop-Fenstern offen (pid %s, bemerkt %s). Bitte alle "
                   "bis auf eines ohne Speichern schließen, dann erneut deployen."
                   % (len(pids), ", ".join(map(str, pids)), when))
            with self.st.lock:
                self.st.doc["desktop"]["duplicates"] = pids
            self.st.step("bridge", "error", msg)
            raise Blocked(msg)
        if mine and want and str(mine[0].get("pid")) != str(want):
            msg = ("Das Projekt ist jetzt in Desktop pid %s offen, der Deploy galt pid %s (bemerkt "
                   "%s). Nichts überschrieben, bitte erneut deployen." % (
                       mine[0].get("pid"), want, when))
            self.st.step("bridge", "error", msg)
            raise Blocked(msg)
        if unsaved_check and mine and self.gate_unsaved is False and not self.no_reload \
                and self.confirmed != "discard" and mine[0].get("hasUnsavedChanges"):
            msg = ("Desktop hat seit dem Start von Deploy %s ungespeicherte Änderungen (bemerkt "
                   "%s). Der Reload würde sie verwerfen. Bitte in Desktop speichern (Strg+S) "
                   "oder verwerfen, dann erneut deployen; während eines Deploys nicht in "
                   "Desktop arbeiten." % (self.seq, when))
            with self.st.lock:
                self.st.doc["desktop"].update({"hasUnsavedChanges": True, "unsavedByUs": False})
            self.st.step("bridge", "error", msg)
            raise Blocked(msg)

    def pbir_calls(self) -> int:
        """pbir-Aufrufe dieses Deploys (der Zähler des Runners läuft über alle Deploys)."""
        return max(0, self.pbir.calls - self.pbir_calls0)

    def publish(self) -> None:
        # Jede übersprungene oder fehlerhafte Kachel trägt einen Grund (Demo B4)
        for key, r in self.visuals.items():
            if r.get("state") in ("skipped", "error", "warn") and not r.get("msg"):
                r["msg"] = "%s ohne Meldung (siehe mockup/.state/runner.log)" % {
                    "skipped": "übersprungen", "error": "Fehler", "warn": "Hinweis"}[r["state"]]
        with self.st.lock:
            self.st.doc["pages"] = self.pages
            self.st.doc["visuals"] = self.visuals
            self.st.doc["todos"] = self.todos
            self.st.doc["pbirCalls"] = self.pbir_calls()
            # Vertrag (Korrekturrunde B1): immer da, 0 ohne Direktschreiben; shotsMs 0 ohne Bilder
            self.st.doc["directWrites"] = self.direct
            self.st.doc.setdefault("shotsMs", 0)
            if self.kept_versions:               # B7: ältere Kitchen-Visuals blieben
                self.st.doc["desktop"]["visualsKept"] = list(self.kept_versions)
            if self.restored:
                self.st.doc["restored"] = self.restored
            if self.desk.calls:                  # Messung pbir desktop gegen Bridge-CLI
                self.st.doc["desktop"]["calls"] = list(self.desk.calls)
            if self.desk.busy_events:
                self.st.doc["desktop"]["busyRetries"] = self.desk.busy_events

    def done(self) -> str:
        self.publish()
        c = self.counts
        parts = []
        if c["updated"]:
            parts.append("%d Visuals aktualisiert" % c["updated"])
        if c["created"]:
            parts.append("%d neu angelegt" % c["created"])
        if c["error"]:
            parts.append("%d mit Fehler" % c["error"])
        if c["skipped"]:
            why = [r.get("msg") for r in self.visuals.values()
                   if r.get("state") == "skipped" and r.get("msg")]
            parts.append("%d übersprungen%s" % (c["skipped"], " (%s)" % short(
                "; ".join(dict.fromkeys(why)), 160) if why else ""))
        for key, r in sorted(self.visuals.items()):
            if r.get("state") in ("skipped", "error"):
                self.r.log("Kachel %s: %s · %s" % (key, r.get("state"), r.get("msg")))
        if not parts:
            parts.append("keine Änderung am Bericht")
        if self.st.doc["desktop"].get("reloaded"):
            parts.append("Desktop neu geladen")
        if self.todos:
            parts.append("%d To-do(s)" % len(self.todos))
        if self.scope == "all" and not (self.p.specs / ("%s.json" % self.seq)).is_file():
            self.snapshot_spec()                 # auch der Schnellweg ist ein Stand
        self.finish("applied", ", ".join(parts))
        return "applied"

    # ---------------- 0 · Anfrage ---------------- #
    def check_request(self) -> None:
        if self.req.get("contract") not in (None, CONTRACT_VERSION):
            raise Blocked("Vertragsversion %s unbekannt (Runner kennt %d)"
                          % (self.req.get("contract"), CONTRACT_VERSION))
        if self.scope not in SCOPES:
            raise Blocked("Teilziel „%s\" unbekannt (all, layout, theme, model)" % self.scope)
        if self.restore_from is not None:
            try:
                self.restore_from = int(self.restore_from)
            except (TypeError, ValueError):
                raise Blocked("restore.fromBackup muss eine Deploy-Nummer sein, nicht „%s\""
                              % self.restore_from)
        target = self.req.get("target") or "desktop"
        if target != "desktop":
            raise Blocked("Ziel „%s\" gibt es erst in Stufe 2; der Runner kann nur "
                          "„desktop\"" % target)
        sid = self.req.get("sessionId")
        if sid and self.r.session_id and str(sid) != str(self.r.session_id):
            # anderes Kitchen-Fenster oder alte Sitzung: nur vermerken, das Kitchen warnt
            with self.st.lock:
                self.st.doc["sessionMismatch"] = {"request": sid, "runner": self.r.session_id}
            self.r.log("Sitzungs-ID der Anfrage (%s) passt nicht zum Live-Helfer (%s)"
                       % (sid, self.r.session_id))

    # ---------------- Beta · Vorschau (plan) ---------------- #
    def snapshot_results(self):
        return (copy.deepcopy(self.todos), copy.deepcopy(self.visuals),
                copy.deepcopy(self.pages), dict(self.counts), set(self.applied_keys),
                set(self.failed_keys))

    def restore_results(self, snap) -> None:
        (self.todos, self.visuals, self.pages, self.counts, self.applied_keys,
         self.failed_keys) = snap

    def preview(self, raw: dict, nspec: dict) -> dict:
        """Plan ohne Schreiben: dieselbe Delta-Entscheidung wie der Deploy, Ergebnisse danach
        verworfen. Steht vor jeder Rückfrage im Status (`plan`)."""
        snap = self.snapshot_results()
        ck_before = self.ck_installed
        # so planen, wie es nach der Installation aussieht
        self.ck_installed = self.vis_state.get(CK_GUID) == "ok" or bool(
            self.opt.install and CK_GUID in self.todo_install and not self.skip_restart)
        try:
            plan = self.plan(raw, nspec, report=False)
            if self.scope in ("theme", "model"):
                plan = self.scope_plan(plan)
            summary = self.plan_summary(plan)
        finally:
            self.restore_results(snap)
            self.ck_installed = ck_before
        self.publish_plan_doc(summary)
        return summary

    def scope_plan(self, plan: list) -> list:
        """Teilziel theme bzw. model: keine Kacheln, keine neuen Seiten; beim Theme bleibt der
        Seitenhintergrund (Gestaltung)."""
        out = []
        for pw in plan:
            if pw["action"] != "update":
                continue
            out.append(dict(pw, items=[], chrome=False,
                            background=bool(pw["background"]) and self.scope == "theme"))
        return out

    def model_op_view(self) -> list:
        """plan.modelOps: je Op Freigabestand mit Hash (das Kitchen übernimmt den Hash)."""
        if not self.model_ops:
            return []
        ok_te = bool(self.te_status()[0])
        view = self.approval_view()
        done = read_json(self.p.model_applied, retries=0) or {}
        out = []
        for o in self.model_ops:
            v = view.get(o["id"]) or {}
            e = v.get("entry")
            used = bool(e and (done.get(o["id"]) or {}).get("sig") == self.approval_sig(e))
            approved = bool(v.get("approved"))
            will = ok_te and bool(o.get("executable")) and (
                not o.get("needsApproval") or (approved and not used))
            out.append({"id": o["id"], "kind": o.get("kind"), "summary": o.get("summary"),
                        "target": o.get("target"), "needsApproval": bool(o.get("needsApproval")),
                        "approved": approved, "stale": bool(v.get("stale")),
                        "hash": o.get("hash"), "executable": bool(o.get("executable")),
                        "blockedReason": o.get("blockedReason"), "willRun": bool(will)})
        return out

    def plan_summary(self, plan: list) -> dict:
        """plan im Status: Änderungen je Seite, Modell-Ops, Neustart, Dauer."""
        removed = {}
        for t in self.todos:
            if t.get("kind") == "removed":
                ref = str(t.get("ref") or "")
                page = ref.split("/", 1)[0]
                removed.setdefault(page, 0)
                if "/" in ref:
                    removed[page] += 1
        pages, writes, touched = {}, False, 0
        for pw in plan:
            c = {"new": 0, "changed": 0, "moved": 0, "removed": removed.get(pw["name"], 0),
                 "page": "new" if pw["action"] == "create" else "update",
                 "background": bool(pw["background"]), "chrome": 0}
            for it in pw["items"]:
                if not it.get("key"):
                    c["chrome"] += 1
                elif it["action"] == "create":
                    c["new"] += 1
                elif set(it.get("changes") or ()) <= {"rect"}:
                    c["moved"] += 1
                else:
                    c["changed"] += 1
            if pw["items"] or pw["action"] == "create" or pw["background"]:
                writes = True
                touched += 1
            pages[pw["name"]] = c
        removed_pages = sorted(p for p in removed if p not in pages)
        theme = self.theme_wanted()
        ops = self.model_op_view()
        model_run = any(o["willRun"] for o in ops)
        restart = bool(self.restart_reason) and not self.skip_restart
        installs = [self.vis_needed[g]["name"] for g in self.todo_install if g in self.vis_needed]
        inst = self.inst or {}
        doc = {"scope": self.scope, "restart": restart,
               "restartReason": self.restart_reason or "",
               "modelOps": ops, "pages": pages, "removedPages": removed_pages,
               "theme": bool(theme), "themeRegister": bool(self.theme_reg),
               "visualsToInstall": installs,
               "reload": bool(writes or theme or model_run) and not self.opt.no_bridge,
               "nothing": not (writes or theme or model_run or restart or installs
                               or self.theme_reg),
               "estMs": self.estimate_ms(restart, writes or theme or model_run, touched),
               "desktop": {"open": self.inst is not None, "pid": inst.get("pid"),
                           "hasUnsavedChanges": bool(inst.get("hasUnsavedChanges")),
                           "unsavedByUs": bool(inst.get("hasUnsavedChanges"))
                           and self.unsaved_by_us(inst) if self.inst else False},
               "at": now_iso()}
        if self.model_plan_error:
            doc["modelError"] = self.model_plan_error
        return doc

    def estimate_ms(self, restart: bool, writes: bool, pages: int) -> int:
        """Dauer aus dem Verlauf (Median der letzten Deploys mit bzw. ohne Neustart),
        sonst Richtwerte: 8 s + 3 s je Seite, Neustart 45 s dazu."""
        hist = [h for h in self.st.history if h.get("state") == "applied" and h.get("ms")
                and not h.get("prepare") and h.get("restoredFrom") is None]

        def median(xs):
            xs = sorted(xs)
            return xs[len(xs) // 2] if xs else None
        plain = median([h["ms"] for h in hist if not h.get("restart")][-8:])
        with_restart = median([h["ms"] for h in hist if h.get("restart")][-5:])
        base = plain or (8000 + 3000 * max(1, pages))
        if not writes:
            base = min(base, 3000)
        if restart:
            base = with_restart or base + 45000
        return int(base)

    def publish_plan_doc(self, summary: dict) -> None:
        with self.st.lock:
            self.st.doc["plan"] = summary
            self.st.save()

    # ---------------- Beta · Rückfragen (awaiting, deploy-confirm.json) ---------------- #
    def awaiting_info(self, kind: str, reason: str, options, **extra) -> dict:
        inst = self.inst or {}
        unsaved = bool(inst.get("hasUnsavedChanges"))
        # Safety (2): Countdown (Kitchen startet nach 10 s selbst neu) nur, wenn Desktop nichts
        # Ungespeichertes hat. Ob „ungespeichert" nur vom eigenen Reload stammt, ist nie sicher:
        # Änderungen in Desktop nach dem Reload sieht der Runner erst nach dem Speichern.
        info = {"kind": kind, "reason": reason, "seq": self.seq,
                "unsavedByUs": bool(unsaved and self.unsaved_by_us(inst)),
                "unsavedByUsCertain": False,
                "hasUnsavedChanges": unsaved, "pid": inst.get("pid"), "since": now_iso(),
                "timeoutS": int(float(self.opt.confirm_timeout)), "options": list(options),
                "countdown": bool(kind == "restart" and not unsaved
                                  and "restart" in options)}
        if self.restart_reason:
            info["restartReason"] = self.restart_reason
        info.update(extra)
        return info

    CONFIRM_SKEW_S = 2.0       # Toleranz für Uhren und Rundung (Kitchen und Runner, ein Rechner)

    def update_extra(self) -> dict:
        """B7: Rückfrage nennt Updates schon installierter Kitchen-Visuals (`updates`) und ob
        der Neustart nur dafür nötig ist (`updateOnly`): dann heißt skipRestart „Vorhandene
        Version behalten"."""
        ups = [{"name": (self.vis_needed.get(g) or {}).get("name") or g,
                "from": (self.vis_needed.get(g) or {}).get("previous"),
                "to": (self.vis_needed.get(g) or {}).get("version")}
               for g in self.todo_install if self.vis_state.get(g) == "outdated"]
        if not ups:
            return {}
        only = len(ups) == len(self.todo_install) and not self.theme_reg
        return {"updates": ups, "updateOnly": bool(only)}

    def read_confirm(self, options, since=None):
        """Antwort aus mockup/deploy-confirm.json für genau diese seq und nur eine angebotene
        Aktion; jede Antwort (seq, action, at) zählt einmal. Safety-Review 2 (1): nur eine
        Antwort, die nach der Frage geschrieben wurde (`at` >= awaiting.since): eine alte Datei
        mit derselben seq (mockup/ teilweise gelöscht, Kitchen-Zähler zurückgesetzt) gilt nicht."""
        c = read_json(self.p.confirm, retries=1)
        if not isinstance(c, dict):
            return None
        try:
            if int(c.get("seq")) != int(self.seq):
                return None
        except (TypeError, ValueError):
            return None
        act = c.get("action")
        key = (str(c.get("at")), str(act))
        if key in self.consumed:
            return None
        self.consumed.add(key)
        asked = parse_time(since) if since else None
        if asked is not None:
            at = parse_time(c.get("at"))
            if at is None or (asked - at).total_seconds() > self.CONFIRM_SKEW_S:
                self.r.log("deploy-confirm.json: „%s\" (at %s) ist älter als die Rückfrage "
                           "(%s), ignoriert" % (act, c.get("at"), since))
                return None
        if act not in options:
            self.r.log("deploy-confirm.json: „%s\" wird gerade nicht angeboten (%s), ignoriert"
                       % (act, ", ".join(options)))
            return None
        return act

    def cancel_requested(self) -> bool:
        c = read_json(self.p.cancel, retries=1)
        return isinstance(c, dict) and str(c.get("seq")) == str(self.seq)

    def probe_instance(self, expect_pid=None):
        """Frischer Desktop-Status genau der Instanz, für die gefragt bzw. bestätigt wurde
        (Safety 3): dict, None (diese Instanz hat das Projekt nicht mehr offen) oder False
        (Status nicht lesbar, z. B. beschäftigt). Kein Rückfall auf eine andere Instanz:
        mehrere Fenster mit dem Projekt oder ein anderes Fenster als das erwartete -> Blocked."""
        data = self.desk.status(wait=0)
        if not data.get("ok"):
            return False
        mine = [i for i in data["instances"] if self.is_mine(i)]
        want = expect_pid or (self.inst or {}).get("pid") or self.r.pin_pid
        if len(mine) > 1:
            pids = ", ".join(str(i.get("pid")) for i in mine)
            msg = ("Das Projekt ist inzwischen in %d Desktop-Fenstern offen (pid %s). Bitte alle "
                   "bis auf eines ohne Speichern schließen, dann erneut deployen. Nichts "
                   "geschrieben." % (len(mine), pids))
            with self.st.lock:
                self.st.doc["desktop"]["duplicates"] = [i.get("pid") for i in mine]
            self.st.step("desktop", "error", msg)
            raise Blocked(msg)
        if mine and want and str(mine[0].get("pid")) != str(want):
            msg = ("Das Projekt ist jetzt in Desktop pid %s offen, gefragt wurde für pid %s. "
                   "Nichts geschrieben, bitte erneut deployen." % (mine[0].get("pid"), want))
            self.st.step("desktop", "error", msg)
            raise Blocked(msg)
        if mine:
            return mine[0]
        return False if self.project_still_open(data, want) else None

    def project_still_open(self, data: dict, want=None) -> bool:
        """Safety-Review 2 (3): Meldet die Bridge das Projekt nicht mehr, ist es nur dann
        „geschlossen", wenn auch sonst nichts darauf hindeutet: die gefragte Instanz läuft
        noch als pbidesktop.exe, ohne sich in der Bridge-Liste zu melden, oder ein Desktop-
        Fenster ohne Bridge nennt die .pbip in der Kommandozeile. Dann gilt der Status als
        nicht lesbar (False beim Aufrufer), nie als geschlossen."""
        listed = {str(i.get("pid")) for i in data.get("instances") or []}
        if want and str(want) not in listed and desktop_alive(want):
            return True
        if self.p.pbip:
            silent = [pid for pid in desktop_pids_with_file(self.p.pbip)
                      if str(pid) not in listed]
            if silent:
                return True
        return False

    def await_confirm(self, info: dict, until_saved: bool = False) -> str:
        """awaiting setzen und warten: Antwort aus deploy-confirm.json, deploy-cancel.json,
        Stopp des Helfers oder Zeitlimit (--confirm-timeout, Vorgabe 10 Min.). Desktop wird
        alle 3 s gelesen: „_saved" (gespeichert), „_gone" (Projekt nicht mehr offen)."""
        self.st.set_awaiting(info)
        self.asked = True
        self.r.log("Deploy %s wartet (%s): %s · Optionen: %s" % (
            self.seq, info["kind"], info["reason"], ", ".join(info["options"])))
        deadline = time.time() + float(self.opt.confirm_timeout)
        next_probe = time.time() + PROBE_S
        # Speichern in Desktop löst jede Frage mit Ungespeichertem auf (auch das vom eigenen
        # Reload: es ist nie sicher, dass seitdem niemand in Desktop gearbeitet hat)
        user_work = bool(info.get("hasUnsavedChanges"))
        try:
            while True:
                act = self.read_confirm(info["options"], info.get("since"))
                if act:
                    self.r.log("Antwort auf die Rückfrage: %s" % act)
                    return act
                if self.cancel_requested():
                    raise Cancelled("Deploy %s zurückgezogen (deploy-cancel.json), nichts "
                                    "geschrieben" % self.seq)
                if self.r.stop_requested():
                    raise Cancelled("Live-Helfer wird beendet, Deploy %s abgebrochen" % self.seq)
                now = time.time()
                if now >= deadline:
                    mins = float(self.opt.confirm_timeout) / 60.0
                    if until_saved:
                        msg = ("Desktop hat nach %s Min. nicht gespeichert gemeldet, Deploy %s "
                               "nicht ausgeführt" % (fmt_num(mins), self.seq))
                    elif info["kind"] == "restart":
                        msg = ("Neustart nicht bestätigt (keine Antwort nach %s Min.), Desktop "
                               "bleibt offen, nichts geschrieben" % fmt_num(mins))
                    else:
                        msg = ("Keine Antwort nach %s Min. (Desktop hat ungespeicherte "
                               "Änderungen), nichts geschrieben" % fmt_num(mins))
                    self.st.step("desktop", "error", msg)
                    raise Blocked(msg)
                if now >= next_probe and not self.opt.no_bridge:
                    next_probe = now + PROBE_S
                    probe = self.probe_instance(info.get("pid"))
                    if probe is None:
                        self.r.log("Desktop hat das Projekt nicht mehr offen")
                        return "_gone"
                    if probe and not probe.get("hasUnsavedChanges") and (until_saved
                                                                         or user_work):
                        self.inst = probe
                        self.clear_reload_marker()
                        with self.st.lock:
                            self.st.doc["desktop"].update({"hasUnsavedChanges": False,
                                                           "unsavedByUs": False})
                        self.r.log("Desktop meldet: gespeichert")
                        return "_saved"
                time.sleep(POLL_S)
        finally:
            self.st.clear_awaiting()

    def wait_saved(self, info: dict) -> str:
        """Nach „saveFirst": warten, bis Desktop gespeichert meldet (oder eine andere Antwort)."""
        opts = ["discard", "cancel"] + (["skipRestart"] if info["kind"] == "restart"
                                        and "skipRestart" in info["options"] else [])
        # dieselbe Rückfrage (since bleibt): eine Antwort aus dem offenen Dialog zählt weiter
        wait = dict(info, reason="Wartet, bis Desktop gespeichert meldet (in Desktop "
                                 "Datei → Speichern).", waitingForSave=True, options=opts,
                    countdown=False)
        return self.await_confirm(wait, until_saved=True)

    def desktop_gate(self, summary=None) -> None:
        """Vor allem, was Desktop-Arbeit kosten kann, fragt der Runner nach (UX-Prinzip 4):
        Neustart nur mit „restart"/„discard", ungespeicherte Arbeit, die nicht vom eigenen
        Reload stammt, nie ohne Antwort überschreiben. --auto-restart: Verhalten bis 0.2."""
        if self.opt.no_bridge or self.inst is None:
            return
        summary = summary if summary is not None else (self.st.doc.get("plan") or {})
        restart = bool(self.restart_reason) and not self.skip_restart
        self.gate_unsaved = bool(self.inst.get("hasUnsavedChanges"))
        if self.opt.auto_restart:
            if restart:
                self.confirmed = "auto"
            return
        while self.inst is not None:
            inst = self.inst
            unsaved = bool(inst.get("hasUnsavedChanges"))
            by_us = unsaved and self.unsaved_by_us(inst)
            user_work = unsaved and not by_us
            touches = restart or bool(summary.get("reload")) or not summary.get("nothing", True)
            if restart:
                what = "Sitzung vorbereiten" if self.preparing else "Deploy %s" % self.seq
                if unsaved:
                    # Safety (2): Fall B, sobald Desktop etwas Ungespeichertes hat. Auch wenn die
                    # Markierung vom eigenen Reload stammt: was danach in Desktop geändert wurde,
                    # sieht der Runner nicht. Kein „restart" mit stillem Verwerfen, kein Countdown.
                    opts = ["saveFirst", "discard", "cancel"] if self.preparing else \
                        ["saveFirst", "skipRestart", "discard", "cancel"]
                    if by_us:
                        last = (self.reload_marker() or {}).get("seq")
                        reason = ("%s braucht einen Desktop-Neustart (%s). Ungespeichert ist, was "
                                  "Deploy %s geladen hat, und alles, was du seitdem in Desktop "
                                  "geändert hast." % (what, self.restart_reason, last or "?"))
                    else:
                        reason = ("%s braucht einen Desktop-Neustart (%s). Desktop hat "
                                  "ungespeicherte Änderungen, die nicht vom Live-Helfer stammen."
                                  % (what, self.restart_reason))
                else:
                    opts = ["restart", "cancel"] if self.preparing else \
                        ["restart", "skipRestart", "cancel"]
                    reason = "%s braucht einen Desktop-Neustart (%s)." % (
                        what, self.restart_reason)
                info = self.awaiting_info("restart", reason, opts, **self.update_extra())
                act = self.await_confirm(info)
                if act in ("restart", "discard"):
                    self.confirmed = act
                    self.confirmed_pid = inst.get("pid")
                    return
                if act == "skipRestart":
                    self.skip_restart, restart = True, False
                    self.todo_install = self.keep_existing_versions(   # B7: alte Version bleibt
                        self.todo_install, self.vis_needed, "ohne Neustart gewählt")
                    continue                     # ohne Neustart: Ungespeichertes noch prüfen
                if act == "saveFirst":
                    act = self.wait_saved(info)
                    if act == "_saved":
                        self.gate_unsaved = False
                        self.confirmed = "restart"   # gespeichert, wie angekündigt neu starten
                        self.confirmed_pid = (self.inst or inst).get("pid")
                        return
                    if act == "discard":
                        self.confirmed = act
                        self.confirmed_pid = inst.get("pid")
                        return
                    if act == "skipRestart":
                        self.skip_restart, restart = True, False
                        self.todo_install = self.keep_existing_versions(
                            self.todo_install, self.vis_needed, "ohne Neustart gewählt")
                        continue
                if act == "_saved":
                    self.gate_unsaved = False
                    continue                     # Lage neu bewerten (jetzt Fall A)
                if act == "_gone":
                    self.inst = None             # Desktop zu: installieren und öffnen
                    return
                raise Cancelled("%s abgebrochen, nichts geschrieben" % what)
            if user_work and touches:
                reason = ("Desktop hat ungespeicherte Änderungen, die nicht vom Live-Helfer "
                          "stammen. Deploy %s lädt Desktop neu und würde sie verwerfen."
                          % self.seq)
                opts = ["saveFirst", "discard", "skipRestart", "cancel"]
                info = self.awaiting_info("unsaved", reason, opts)
                act = self.await_confirm(info)
                if act == "saveFirst":
                    act = self.wait_saved(info)
                if act in ("_saved", "_gone"):
                    if act == "_gone":
                        self.inst = None
                    else:
                        self.gate_unsaved = False
                    return
                if act == "discard":
                    self.confirmed = "discard"
                    self.confirmed_pid = inst.get("pid")
                    self.r.log("Ungespeichertes in Desktop wird verworfen (bestätigt)")
                    return
                if act == "skipRestart":
                    self.no_reload = True        # schreiben, Desktop nicht neu laden
                    return
                raise Cancelled("Deploy %s abgebrochen, nichts geschrieben" % self.seq)
            return

    # ---------------- Beta · Vorschau ohne Deploy (dryRun) ---------------- #
    def carry_previous(self) -> None:
        """Vorschau oder Abbruch ohne Schreiben: Ergebnis des letzten echten Deploys
        (Seiten, Kacheln, To-dos) bleibt im Status sichtbar."""
        prev = self.st.prev or {}
        with self.st.lock:
            for k in ("pages", "visuals", "todos"):
                if not self.st.doc.get(k) and prev.get(k):
                    self.st.doc[k] = prev[k]
            if prev.get("seq") not in (None, self.seq):
                self.st.doc["previous"] = {k: prev.get(k) for k in
                                           ("seq", "state", "message", "finishedAt")}

    def run_dry(self) -> str:
        """Vorschau: liest Desktop-Status, Spec, Modell und Bericht, baut nach
        .state/preview-out und meldet `plan`. Schreibt nichts in Bericht oder Modell, kein
        Reload, keine Bilder."""
        self.out_dir = self.p.state_dir / "preview-out"
        blockers, raw, nspec = [], None, None
        self.st.begin_step("bridge")
        for check in (self.check_bridge, self.check_model):
            try:
                check()
            except Blocked as e:
                blockers.append(str(e))
        try:
            raw = self.check_spec()
            nspec = self.build(raw)
        except RunnerError as e:
            blockers.append(str(e))
        if nspec is not None:
            self.visuals_decide(nspec)
            self.model_plan(raw)
            summary = self.preview(raw, nspec)
        else:
            summary = {"scope": self.scope, "restart": False, "restartReason": "",
                       "modelOps": [], "pages": {}, "removedPages": [], "theme": False,
                       "themeRegister": False, "visualsToInstall": [], "reload": False,
                       "nothing": True, "estMs": 0, "at": now_iso()}
        if not blockers and self.inst is None and not self.opt.no_bridge and \
                self.desk_error and not (self.todo_install or self.theme_reg):
            blockers.append(self.desk_error)
        summary["dryRun"] = True
        summary["blockers"] = blockers
        summary["todos"] = list(self.todos)
        self.publish_plan_doc(summary)
        self.st.step("plan", "warn" if blockers else "ok", self.plan_text(summary))
        self.todos, self.visuals, self.pages = [], {}, {}
        self.publish()
        self.finish("planned", "Vorschau: " + self.plan_text(summary))
        return "planned"

    @staticmethod
    def plan_text(summary: dict) -> str:
        if summary.get("blockers"):
            return "würde blockieren: " + "; ".join(summary["blockers"])
        if summary.get("nothing"):
            return "seit dem letzten Deploy nichts geändert"
        tot = {k: sum(int(p.get(k) or 0) for p in (summary.get("pages") or {}).values())
               for k in ("new", "changed", "moved", "removed")}
        parts = []
        for k, word in (("new", "neu"), ("changed", "geändert"), ("moved", "verschoben"),
                        ("removed", "nur im Bericht")):
            if tot[k]:
                parts.append("%d %s" % (tot[k], word))
        n_new_pages = sum(1 for p in (summary.get("pages") or {}).values()
                          if p.get("page") == "new")
        if n_new_pages:
            parts.append("%d Seite(n) neu" % n_new_pages)
        if summary.get("theme"):
            parts.append("Theme")
        runs = [o for o in summary.get("modelOps") or [] if o.get("willRun")]
        waits = [o for o in summary.get("modelOps") or [] if not o.get("willRun")]
        if runs:
            parts.append("%d Modell-Op(s)" % len(runs))
        if waits:
            parts.append("%d Modellwunsch/-wünsche warten" % len(waits))
        if summary.get("restart"):
            parts.append("Neustart nötig (%s)" % summary.get("restartReason"))
        else:
            parts.append("kein Neustart")
        if summary.get("estMs"):
            parts.append("ca. %s s" % fmt_num(summary["estMs"] / 1000.0))
        return " · ".join(parts)

    # ---------------- Beta · Sitzung vorbereiten (prepare) ---------------- #
    def run_prepare(self) -> str:
        """Alle Kitchen-Visuals der Sitzung installieren und das Theme registrieren, mit
        einem bestätigten Neustart. Keine Seite wird geschrieben."""
        if not self.opt.install:
            raise Blocked("--no-install: Sitzung vorbereiten ist abgeschaltet")
        self.st.begin_step("bridge")
        self.check_bridge()
        self.check_model()
        names = self.req.get("visuals")
        self.extra_visuals = [str(n) for n in names] if isinstance(names, list) and names \
            else list(PREPARE_VISUALS)
        nspec = None
        raw = None
        if self.p.spec.is_file():
            try:
                raw = self.check_spec()
                nspec = self.build(raw)
            except RunnerError as e:
                self.st.step("build", "warn", "Spec nicht gebaut, nur die Standard-Visuals: %s"
                             % e)
                nspec = None
        # .state/specs/<seq>.json auch beim Vorbereiten (CONTRACT „Spec je Deploy"): es
        # schreibt keine Seiten, der Bericht steht danach auf dem Stand der Vergleichsbasis.
        # Diese Fassung kommt in die Datei, damit „Zurück zu Deploy n" keine Lücke findet.
        base_raw, _ = self.load_base()
        self.raw_spec = base_raw if isinstance(base_raw, dict) else raw
        if isinstance(self.raw_spec, dict):
            self.snapshot_request_spec(self.raw_spec)
        self.visuals_decide(nspec)
        installs = [self.vis_needed[g]["name"] for g in self.todo_install]
        restart = bool(self.restart_reason)
        self.publish_plan_doc({
            "prepare": True, "scope": "all", "restart": restart,
            "restartReason": self.restart_reason or "", "visualsToInstall": installs,
            "themeRegister": bool(self.theme_reg), "pages": {}, "modelOps": [],
            "nothing": not (installs or self.theme_reg), "reload": False,
            "estMs": self.estimate_ms(restart, False, 0) if restart else 5000, "at": now_iso()})
        if not installs and not self.theme_reg:
            have = [self.vis_needed[g]["name"] for g, s in self.vis_state.items() if s == "ok"]
            theme = (self.theme_info() or {}).get("name")
            kept = (self.design_info or {}).get("imported") and not theme
            self.st.step("visuals", "ok", "schon installiert: %s%s" % (
                ", ".join(have) or "–", ", Theme des Berichts bleibt (eingelesen, Gestaltung "
                "unverändert)" if kept else ", Theme %s registriert" % (theme or "–")))
            self.publish()
            self.snapshot_spec()
            self.finish("applied", "Sitzung bereit: Kitchen-Visuals sind schon da, das Theme des "
                                   "Berichts bleibt, kein Neustart nötig" if kept else
                        "Sitzung bereit: Kitchen-Visuals und Theme sind schon da, "
                        "kein Neustart nötig")
            return "applied"
        self.desktop_gate({"nothing": True, "reload": False})   # nur der Neustart zählt
        if self.inst is not None and self.restart_reason and not self.confirmed \
                and not self.opt.no_desktop_restart:
            raise Cancelled("Sitzung nicht vorbereitet, Desktop bleibt offen")
        if self.asked:                           # Safety-Review 2 (3): zweites Fenster während
            self.check_duplicates("nach der Rückfrage, vor dem Schreiben")   # der Rückfrage
        self.st.begin_step("backup")
        self.backup()
        self.st.begin_step("visuals")
        self.visuals_step(nspec)
        self.prepare_theme()
        self.prepare_validate()
        if self.open_after:
            self.st.begin_step("desktop")
            self.reopen()
        self.publish()
        done = [i.get("name") for i in self.st.doc["desktop"].get("visualsInstalled") or []]
        parts = []
        if done:
            parts.append("installiert: " + ", ".join(done))
        if self.theme_registered:
            parts.append("Theme %s registriert" % THEME_NAME)
        if self.reopened:
            parts.append("Desktop neu gestartet")
        if not done and not self.theme_registered:
            parts.append("nichts installiert")
        if not self.theme_registered and (self.design_info or {}).get("imported") \
                and self.theme_info() is None:
            parts.append("Theme des Berichts bleibt")
        self.snapshot_spec()                     # specs/<seq>(.applied).json wie jeder Deploy
        self.finish("applied", "Sitzung vorbereitet: %s. Ab jetzt ohne Neustart."
                    % ", ".join(parts) if done or self.theme_registered
                    else "Sitzung nicht vollständig vorbereitet: %s" % ", ".join(parts))
        return "applied"

    def prepare_theme(self) -> None:
        """Nach der Registrierung gleich die Farben aus dem Theme-Fragment setzen (nur die
        Theme-Datei), solange Desktop geschlossen ist."""
        if self.theme_registered and self.theme_fragment():
            if hasattr(self, "_theme_changes"):
                del self._theme_changes
            self.apply_theme()

    def prepare_validate(self) -> None:
        """pbir validate --fields nach der Installation; neue Befunde: Sicherung zurück."""
        if not self.wrote_files():
            return
        cache = read_json(self.p.validate_cache, retries=0)
        baseline = cache.get("problems") if isinstance(cache, dict) and isinstance(
            cache.get("problems"), dict) else None
        after, data = self.validate_problems()
        new = [i for s, i in after.items() if baseline is not None and s not in baseline]
        if baseline is None:
            new = [i for i in (data.get("errors") or [])]
        if new:
            n = self.restore()
            msg = ("pbir validate --fields: %d neue(r) Befund(e) nach der Installation, "
                   "Sicherung zurückgespielt (%d Datei(en)): %s" % (
                       len(new), n, "; ".join(str(i.get("message")) for i in new[:3])))
            self.st.step("validate", "error", msg)
            raise RunnerError(msg)
        self.st.step("validate", "ok", "pbir validate --fields: %d Fehler"
                     % len(data.get("errors") or []))

    def wrote_files(self) -> bool:
        bdir = getattr(self, "backup_dir", None)
        return bool(bdir and tree_hashes(Path(bdir)) != tree_hashes(self.p.report))

    # ---------------- Beta · Zurück zu Deploy n (restore) ---------------- #
    def restore_source(self, n: int):
        """Stand nach Deploy n = Sicherung vor dem nächsten Deploy, der geschrieben hat.
        -> (Ordner oder None, Quelle als Text); None heißt: der Bericht ist schon so."""
        hist = {h.get("seq"): h for h in self.st.history}
        if n not in hist and not (self.p.specs / ("%d.json" % n)).is_file():
            raise Blocked("Deploy %d steht nicht im Verlauf" % n)
        if hist.get(n) and hist[n].get("state") not in ("applied",):
            raise Blocked("Deploy %d war nicht erfolgreich (%s), dahin geht es nicht zurück"
                          % (n, hist[n].get("state")))
        later = sorted(int(d.name) for d in (self.p.backups.iterdir()
                                              if self.p.backups.is_dir() else [])
                       if d.is_dir() and d.name.isdigit() and int(d.name) > n
                       and (d / self.p.report.name / "definition").is_dir())
        if later:
            m = later[0]
            gap = [s for s, h in hist.items() if isinstance(s, int) and n < s < m
                   and h.get("backup")]
            if gap:
                raise Blocked("Sicherung für den Stand nach Deploy %d fehlt (nur die letzten "
                              "%d bleiben)" % (n, int(self.opt.keep_backups)))
            return self.p.backups / str(m) / self.p.report.name, "backup/%d" % m
        wrote_later = [s for s, h in hist.items() if isinstance(s, int) and s > n
                       and h.get("backup")]
        if wrote_later:
            raise Blocked("Sicherung für den Stand nach Deploy %d fehlt (nur die letzten %d "
                          "bleiben)" % (n, int(self.opt.keep_backups)))
        return None, "aktueller Bericht"

    @staticmethod
    def page_tree(root: Path) -> dict:
        """Seitenordner -> {Visual-Ordner oder "": Hash} unter definition/pages."""
        out = {}
        pages = root / "definition" / "pages"
        if not pages.is_dir():
            return out
        for d in sorted(pages.iterdir()):
            if not d.is_dir():
                continue
            vis = {"": hashlib.sha1(b"".join(
                (p.read_bytes() for p in sorted(d.glob("*")) if p.is_file()))).hexdigest()}
            vdir = d / "visuals"
            if vdir.is_dir():
                for v in sorted(vdir.iterdir()):
                    if v.is_dir():
                        vis[v.name] = hashlib.sha1(json.dumps(
                            tree_hashes(v), sort_keys=True).encode("utf-8")).hexdigest()
            out[d.name] = vis
        return out

    @staticmethod
    def page_display(root: Path, folder: str) -> str:
        pj = read_json(root / "definition" / "pages" / folder / "page.json", retries=0) or {}
        return pj.get("displayName") or folder

    def run_restore(self) -> str:
        """Bericht auf den Stand nach Deploy n bringen, als neuer Deploy nach vorn: der
        aktuelle Stand kommt nach backup/<seq>, nur definition/pages wird zurückgespielt
        (report.json, Kitchen-Visuals und Theme bleiben), Vergleichsbasis = Spec von n."""
        n = self.restore_from
        self.st.begin_step("bridge")
        self.check_bridge()
        self.check_model()
        self.require_desktop()
        src, src_note = self.restore_source(n)
        spec_raw = read_json(self.p.specs / ("%d.json" % n), retries=0)
        spec_app = read_json(self.p.specs / ("%d.applied.json" % n), retries=0)
        base = spec_app if isinstance(spec_app, dict) else spec_raw
        self.kseq = n
        self.restored = {"fromBackup": n, "source": src_note,
                         "spec": (".state/specs/%d.json" % n) if isinstance(spec_raw, dict)
                         else None}
        cur_tree = self.page_tree(self.p.report)
        src_tree = self.page_tree(src) if src else cur_tree
        pages, changed_pages = {}, []
        for folder in sorted(set(cur_tree) | set(src_tree)):
            a, b = cur_tree.get(folder), src_tree.get(folder)
            if a == b:
                continue
            name = self.page_display(src if b is not None else self.p.report, folder)
            a, b = a or {}, b or {}
            vis = (set(a) | set(b)) - {""}
            pages[name] = {"new": sum(1 for v in vis if v in b and v not in a),
                           "changed": sum(1 for v in vis if v in a and v in b and a[v] != b[v]),
                           "moved": 0,
                           "removed": sum(1 for v in vis if v in a and v not in b),
                           "page": "new" if not cur_tree.get(folder) else (
                               "removed" if not src_tree.get(folder) else "update")}
            changed_pages.append((folder, name, folder in src_tree))
        summary = {"restore": n, "scope": "layout", "restart": False, "restartReason": "",
                   "modelOps": [], "pages": pages, "removedPages": [], "theme": False,
                   "themeRegister": False, "visualsToInstall": [],
                   "reload": bool(changed_pages) and not self.opt.no_bridge,
                   "nothing": not changed_pages,
                   "estMs": self.estimate_ms(False, bool(changed_pages), len(changed_pages)),
                   "at": now_iso()}
        self.publish_plan_doc(summary)
        if not changed_pages:
            self.st.step("plan", "ok", "Bericht ist schon auf dem Stand nach Deploy %d" % n)
            self.restore_state(n, base, spec_raw)
            self.publish()
            self.finish("applied", "Zurück zu Deploy %d: der Bericht ist schon auf diesem Stand"
                        % n)
            return "applied"
        self.st.step("plan", "ok", "Zurück zu Deploy %d aus %s: %d Seite(n)" % (
            n, src_note, len(changed_pages)))
        self.desktop_gate(summary)
        # Safety-Review 2 (3): Desktop während der Rückfrage geschlossen (_gone) -> ohne
        # Desktop kein Zurückspielen; zweites Fenster während der Rückfrage -> blockiert
        self.require_desktop()
        if self.asked:
            self.check_duplicates("nach der Rückfrage, vor dem Schreiben")
        self.st.begin_step("backup")
        self.backup(keep=(src.parent.name,))    # Quelle beim Aufräumen nicht löschen
        self.st.begin_step("write")
        protected = self.p.protected_hashes()
        cache = read_json(self.p.validate_cache, retries=0)
        baseline = cache.get("problems") if isinstance(cache, dict) and isinstance(
            cache.get("problems"), dict) else None
        if baseline is None:
            baseline, _ = self.validate_problems()
        n_files = sync_tree(src / "definition" / "pages",
                            self.p.report / "definition" / "pages")
        if self.p.protected_hashes() != protected:      # darf nicht passieren
            self.restore()
            raise RunnerError("Zurückspielen hätte geschützte Dateien verändert, abgebrochen")
        self.st.step("write", "ok", "%d Datei(en) aus %s zurückgespielt (definition/pages)"
                     % (n_files, src_note))
        after, data = self.validate_problems()
        new = [i for s, i in after.items() if s not in baseline]
        if new:
            k = self.restore()
            msg = ("pbir validate --fields: %d neue(r) Befund(e), der Stand von Deploy %d passt "
                   "nicht mehr zum Modell. Sicherung zurückgespielt (%d Datei(en)): %s" % (
                       len(new), n, k, "; ".join(str(i.get("message")) for i in new[:3])))
            self.st.step("validate", "error", msg)
            raise RunnerError(msg)
        write_json_atomic(self.p.validate_cache, {"seq": self.seq, "problems": after})
        self.st.step("validate", "ok", "pbir validate --fields: %d Fehler, 0 neue Befunde"
                     % len(data.get("errors") or []))
        self.load_report_pages()
        spec_pages = {}
        for pg in (base or {}).get("pages") or []:
            if isinstance(pg, dict):
                spec_pages[(pg.get("pbir") or {}).get("page") or pg.get("name")] = pg
                spec_pages.setdefault(pg.get("name"), pg)
        plan = []
        for folder, name, exists in changed_pages:
            if not exists:
                continue
            rp = self.page_by_id(folder) or {}
            spg = spec_pages.get(folder) or spec_pages.get(name) or {}
            key = spg.get("name") or name
            canvas = dict((base or {}).get("canvas") or {})
            if rp.get("width") and rp.get("height"):
                canvas.update(width=rp["width"], height=rp["height"])
            self.pages[key] = {"state": "applied", "shot": None, "action": "updated",
                               "pbir": {"page": folder}}
            plan.append({"name": key, "display": rp.get("displayName") or name,
                         "pageId": folder, "action": "update", "page": spg,
                         "canvas": canvas, "items": [], "background": False})
        self.state_snap = self.snapshot_state()
        self.restore_state(n, base, spec_raw)
        self.st.begin_step("reload")
        try:                                     # wie beim Deploy: Fenster, pid, neue Arbeit
            self.check_duplicates("vor dem Neuladen", unsaved_check=True)
        except Blocked as e:
            self.undo_write(str(e))
            raise Blocked("%s Der Bericht ist zurückgesetzt, nichts geändert." % e) from None
        reloaded = self.reload(True)
        self.st.begin_step("shots")
        self.shots(reloaded, plan)
        self.st.begin_step("compare")
        self.compare()
        if isinstance(base, dict):
            try:
                self.save_applied(base)
            except Exception as e:               # noqa: BLE001 - nur der Schnellweg fehlt dann
                self.r.log("applied.json nach dem Zurückspielen nicht geschrieben: %s" % e)
        self.publish()
        gone = [name for _, name, exists in changed_pages if not exists]
        msg = "Zurück auf den Stand nach Deploy %d: %d Seite(n) zurückgesetzt" % (
            n, len(changed_pages) - len(gone))
        if gone:
            msg += ", %d Seite(n) aus späteren Deploys entfernt (%s, liegen in backup/%s)" % (
                len(gone), ", ".join(gone), self.seq)
        if self.st.doc["desktop"].get("reloaded"):
            msg += ", Desktop neu geladen"
        if self.restored.get("spec"):
            self.todo("manual", "kitchen", "Skizze auf den Stand von Deploy %d laden (mockup/%s), "
                      "sonst bringt der nächste Deploy die späteren Änderungen zurück."
                      % (n, self.restored["spec"]))
            self.publish()
        self.finish("applied", msg)
        return "applied"

    def restore_state(self, n: int, base, spec_raw) -> None:
        """Vergleichsbasis und Spec-Stand auf Deploy n setzen."""
        self.p.state_dir.mkdir(parents=True, exist_ok=True)
        if isinstance(base, dict):
            write_json_atomic(self.p.last_spec, base)
        try:
            self.p.specs.mkdir(parents=True, exist_ok=True)
            if isinstance(spec_raw, dict):
                write_json_atomic(self.p.specs / ("%s.json" % self.seq), spec_raw)
            if isinstance(base, dict):
                write_json_atomic(self.p.specs / ("%s.applied.json" % self.seq), base)
        except OSError as e:
            self.r.log("Spec-Stand nicht gesichert: %s" % e)

    # ---------------- 1 · Bridge ---------------- #
    def check_bridge(self) -> None:
        desk = self.st.doc["desktop"]
        if self.opt.no_bridge:
            self.st.step("bridge", "skipped", "--no-bridge: Desktop wird nicht geprüft")
            return
        desk["cli"] = self.desk.backend
        data = self.desk.status(wait=2)
        instances = data["instances"]
        mine = [i for i in instances if self.is_mine(i)]
        self.others = [i for i in instances if not self.is_mine(i)]
        pin = self.r.pin_pid
        if pin:
            desk["pinnedPid"] = pin
        # Instanz festnageln (Review B, P1): mehrere Fenster mit diesem Projekt -> blockiert.
        # Fenster ohne Bridge zählen mit, wenn ihre Kommandozeile die .pbip nennt.
        if len(mine) == 1 and self.p.pbip:
            listed = {str(i.get("pid")) for i in instances}   # melden ihre Datei selbst
            silent = [pid for pid in desktop_pids_with_file(self.p.pbip)
                      if str(pid) != str(mine[0].get("pid")) and str(pid) not in listed]
            if silent:
                msg = ("Das Projekt ist in mehreren Desktop-Fenstern offen (pid %s, dazu pid %s "
                       "ohne Bridge). Bitte alle bis auf eines ohne Speichern schließen, dann "
                       "erneut deployen." % (mine[0].get("pid"), ", ".join(map(str, silent))))
                desk.update({"connected": True, "file": mine[0].get("currentFilePath"),
                             "duplicates": [mine[0].get("pid")] + silent})
                self.st.step("bridge", "error", msg)
                raise Blocked(msg)
        if len(mine) > 1:
            pids = ", ".join(str(i.get("pid")) for i in mine)
            msg = ("Das Projekt ist in %d Desktop-Fenstern offen (pid %s). Bitte alle bis auf "
                   "eines ohne Speichern schließen, dann erneut deployen." % (len(mine), pids))
            desk.update({"connected": True, "file": mine[0].get("currentFilePath"),
                         "duplicates": [i.get("pid") for i in mine]})
            self.st.step("bridge", "error", msg)
            raise Blocked(msg)
        if pin and mine and str(mine[0].get("pid")) != str(pin):
            new = mine[0].get("pid")
            pinned_listed = any(str(i.get("pid")) == str(pin) for i in instances)
            if not pinned_listed and not desktop_alive(pin):
                # Safety (6): festgenagelte Instanz ist beendet (Desktop von Hand neu gestartet)
                # und genau eine Instanz hat dieses Projekt: auf sie umziehen statt Sackgasse
                self.r.repin(new, "pid %s beendet" % pin)
                desk["pinnedPid"] = new
                desk["repinned"] = {"from": pin, "to": new}
                pin = new
            else:
                msg = ("Der Live-Helfer ist auf Desktop pid %s festgenagelt, das Projekt ist aber "
                       "in pid %s offen. In Desktop pid %s: Externe Tools → MockupKitchen live "
                       "(ersetzt den Helfer), oder mk-live stop und mk-live start."
                       % (pin, new, new))
                self.st.step("bridge", "error", msg)
                raise Blocked(msg)
        if not data["ok"] or not instances:
            self.desk_error = ("Power BI Desktop nicht erreichbar (%s). Projekt in Desktop "
                               "öffnen; ohne Verbindung in Desktop %s." % (
                                   data.get("error") or data.get("status") or "not_connected",
                                   BRIDGE_SETTING))
            if pin:
                self.desk_error = "Desktop (pid %s) meldet sich nicht. %s" % (pin, self.desk_error)
        elif not mine:
            files = ", ".join(Path(i.get("currentFilePath") or "?").name for i in instances)
            self.desk_error = "Desktop hat ein anderes Projekt offen (%s), nicht %s" % (
                files, self.p.pbip.name if self.p.pbip else self.p.report.name)
            if pin:
                self.desk_error = "Desktop (pid %s): %s" % (pin, self.desk_error)
            desk.update({"connected": True, "file": instances[0].get("currentFilePath")})
        if not mine:
            # erst nach dem Build entscheidbar: Kitchen-Visuals installieren und Desktop
            # selbst öffnen, sonst blockiert (require_desktop)
            self.st.step("bridge", "warn", self.desk_error)
            return
        inst = mine[0]
        self.inst = inst
        self.r.pid = inst.get("pid")
        self.r.update_session(pid=inst.get("pid"))
        unsaved = bool(inst.get("hasUnsavedChanges"))
        by_us = unsaved and self.unsaved_by_us(inst)
        if not unsaved:
            self.clear_reload_marker()           # gespeichert oder frisch: Markierung gilt nicht
        desk.update({"connected": True, "file": inst.get("currentFilePath"),
                     "hasUnsavedChanges": unsaved, "unsavedByUs": bool(by_us),
                     "pid": inst.get("pid")})
        # --respect-unsaved (alt): jede ungespeicherte Änderung blockiert sofort. Sonst fragt
        # der Runner bei fremder ungespeicherter Arbeit im Kitchen nach (desktop_gate).
        if unsaved and getattr(self.opt, "respect_unsaved", False):
            msg = ("Desktop hat ungespeicherte Änderungen. Bitte in Desktop speichern, "
                   "dann erneut deployen.")
            self.st.step("bridge", "error", msg)
            raise Blocked(msg)
        note = ""
        if desk.get("repinned"):
            note += " · Festnagelung von pid %s auf pid %s umgezogen (alte Instanz beendet)" % (
                desk["repinned"]["from"], desk["repinned"]["to"])
        if unsaved and by_us:
            note += " · ungespeicherte Änderungen nur durch den Reload des Runners"
        elif unsaved:
            note += (" · ungespeicherte Änderungen in Desktop, nicht vom Runner"
                     + (" (werden überschrieben)" if self.opt.auto_restart else ""))
        # Manifest je Desktop-Prozess nur einmal holen (in .state gemerkt, gilt je pid);
        # nur über die Bridge-CLI (pbir prüft die Methoden selbst)
        cache_path = self.p.state_dir / "bridge-manifest.json"
        cache = read_json(cache_path, retries=0) or {}
        man = cache.get(str(inst.get("pid")))
        if not isinstance(man, dict):
            man = self.desk.manifest(inst.get("pid"))
            if isinstance(man, dict) and man.get("status") == "ok":
                self.p.state_dir.mkdir(parents=True, exist_ok=True)
                write_json_atomic(cache_path, {str(inst.get("pid")): man})
        man = man if isinstance(man, dict) else {}
        methods = {m.get("name") for m in ((man.get("manifest") or {}).get("methods") or [])}
        need = {"file.reload/v1", "report.snapshot.capture/v1"}
        if man.get("status") == "ok" and not need <= methods:
            note += " · Bridge ohne %s" % ", ".join(sorted(need - methods))
        self.st.step("bridge", "warn" if note else "ok",
                     "Desktop offen mit %s (pid %s, über %s)%s"
                     % (Path(inst.get("currentFilePath") or "?").name, inst.get("pid"),
                        self.desk.backend, note))

    def is_mine(self, inst: dict) -> bool:
        return instance_is_project(inst, self.p.pbip, self.p.report)

    # --- eigene Reload-Markierung (Desktop meldet nach jedem Reload „ungespeichert") --- #
    def reload_marker(self):
        m = read_json(self.p.reload_marker, retries=0)
        return m if isinstance(m, dict) else None

    def unsaved_by_us(self, inst: dict) -> bool:
        """Stammt die Markierung „ungespeichert" von unserem eigenen Reload? Ja, wenn der
        letzte Reload des Runners diese Desktop-Instanz traf, Desktop seitdem nie
        „gespeichert" gemeldet hat (sonst wurde die Markierung gelöscht) und keine Datei in
        definition/ seit dem Reload neu geschrieben wurde (Speichern in Desktop)."""
        return reload_marker_matches(self.p, inst.get("pid"))

    def set_reload_marker(self, pid) -> None:
        if not pid:
            return
        try:
            self.p.state_dir.mkdir(parents=True, exist_ok=True)
            write_json_atomic(self.p.reload_marker, {"pid": pid, "at": now_iso(),
                                                     "seq": self.seq,
                                                     "digest": desktop_digest(self.p)})
        except OSError as e:
            self.r.log("Reload-Markierung nicht geschrieben: %s" % e)

    def clear_reload_marker(self) -> None:
        try:
            self.p.reload_marker.unlink()
        except OSError:
            pass

    def require_desktop(self) -> None:
        """Ohne Desktop mit diesem Projekt und ohne eigenen Neustart: blockiert."""
        if self.opt.no_bridge or self.inst is not None or self.open_after:
            return
        msg = self.desk_error or "Power BI Desktop nicht erreichbar"
        self.st.step("bridge", "error", msg)
        raise Blocked(msg)

    # ---------------- 1b · Modell ---------------- #
    def check_model(self) -> None:
        pending = self.p.model / "unappliedChanges.json"
        if pending.exists():
            msg = ("%s liegt im Modellordner: Änderungen zuerst in Desktop übernehmen "
                   "(Banner „Apply changes\"), sonst verwirft Desktop externe Änderungen"
                   % pending.name)
            self.st.step("model", "error", msg)
            raise Blocked(msg)

    # ---------------- 3b · Kitchen-Visuals installieren (Paket A) ---------------- #
    def safe_installed(self) -> list:
        try:
            return VI.installed(self.p.report)
        except Exception as e:                   # noqa: BLE001 - report.json kaputt o. ä.
            self.r.log("visuals_install.installed: %s" % e)
            return []

    def needed_visuals(self, nspec: dict) -> dict:
        """GUID -> {"ids": [Kacheln]} für ChartKitchen-Kacheln (gültiger Modus) und Custom
        Visuals aus custom-visuals.json (dazu ibcsKpiCard für kpi-Kacheln)."""
        need = {}
        for page in nspec["pages"]:
            slots = {s["id"]: s for s in self.load_out(page["name"],
                                                         "chartkitchen-slots.json", [])}
            for v in page["visuals"]:
                s = slots.get(v["id"])
                if v.get("engine") == "ck" and s and s.get("orientation") in CK_ORIENTATIONS:
                    need.setdefault(CK_GUID, {"ids": []})["ids"].append(vkey(v))
            for c in self.load_out(page["name"], "custom-visuals.json", []):
                if c.get("guid"):
                    need.setdefault(c["guid"], {"ids": []})["ids"].append(
                        c.get("stableId") or c.get("id"))
        return need

    def design_state(self, nspec) -> dict:
        """Safety-Review 2 (11), B2 auf Theme-Ebene, vor plan(): eingelesenes Projekt
        (`pages[].pbir`)? Gestaltung gegen die Vergleichsbasis geändert? `restyle`: darf
        Kitchen-Gestaltung (Theme registrieren, Theme-Farben) in den Bericht, also nach einer
        Designänderung, beim ersten Deploy eines nicht eingelesenen Projekts oder mit
        `scope: "theme"`. Dieselbe Regel wie `restyle_report` in plan()."""
        imported = bool(nspec) and any(
            (pg.get("pbir") or {}).get("page") or any(
                (v.get("pbir") or {}).get("visual") for v in pg.get("visuals") or [])
            for pg in nspec.get("pages") or [])
        last = None
        if nspec:
            last_raw, _ = self.load_base()
            if isinstance(last_raw, dict):
                try:
                    last = self.r.spec_tools.upgrade(last_raw)
                except Exception:                # noqa: BLE001 - alter Stand unlesbar
                    last = None
        changed = bool(nspec) and last is not None and \
            canon(nspec.get("design")) != canon(last.get("design"))
        restyle = self.scope == "theme" or changed or (last is None and not imported)
        return {"imported": imported, "designChanged": changed, "restyle": restyle}

    def visuals_decide(self, nspec) -> None:
        """Welche Kitchen-Visuals fehlen oder sind veraltet, muss das Theme registriert werden,
        braucht dieser Deploy dafür einen Desktop-Neustart? Entscheidet nur, schreibt nichts."""
        need = self.needed_visuals(nspec) if nspec else {}
        try:
            cat = VI.catalog(REPO)
        except Exception as e:                   # noqa: BLE001
            self.r.log("visuals_install.catalog: %s" % e)
            cat = {}
        for name in self.extra_visuals:          # prepare: Kitchen-Visuals für die Sitzung
            c = cat.get(str(name).lower())
            if c and c.get("guid"):
                need.setdefault(c["guid"], {"ids": []})
            elif c is None:
                self.todo("manual", str(name), "Kitchen-Visual „%s\" ist im Repo nicht gebaut "
                          "(dist/*.pbiviz fehlt)." % name)
        if self.scope in ("theme", "model"):
            need = {}
        self.vis_needed = need
        have = {i["guid"]: i for i in self.safe_installed()}
        by_guid = {e.get("guid"): e for e in cat.values()}
        todo_install = []
        for guid, info in need.items():
            c, i = by_guid.get(guid), have.get(guid)
            info["name"] = (c or {}).get("displayName") or (i or {}).get("displayName") or guid
            info["version"] = (c or {}).get("version") or (i or {}).get("version")
            ok = bool(i and i.get("registered") and i.get("folder"))
            if c is None:
                self.vis_state[guid] = "ok" if ok else "nobuild"
                continue
            if ok and version_tuple(i.get("version")) >= version_tuple(c.get("version")):
                self.vis_state[guid] = "ok"
                continue
            self.vis_state[guid] = "outdated" if ok else "missing"
            info.update(path=c["path"], previous=(i or {}).get("version"))
            todo_install.append(guid)
        if (getattr(self.opt, "keep_visual_versions", False) or self.req.get("keepVersions"))                 and not self.preparing:
            # B7: vorhandene Version behalten (Anfrage keepVersions oder Option), kein Update
            todo_install = self.keep_existing_versions(todo_install, need, "gewünscht")
        if self.preparing:
            theme_reg = bool(self.opt.install and self.theme_info() is None)
        elif self.scope in ("layout", "model"):
            theme_reg = False
        else:
            theme_reg = self.theme_needs_registration()
        # B2 auf Theme-Ebene: ein eingelesener Bericht ohne eigenes Theme behält sein Basis-
        # Theme, solange die Gestaltung im Kitchen unverändert ist (Registrieren ersetzt es und
        # färbt alle Seiten um). Nach einer Designänderung sagt die Rückfrage es ausdrücklich.
        ds = self.design_state(nspec)
        self.design_info = ds
        if theme_reg and ds["imported"] and not ds["restyle"]:
            theme_reg = False
            self.r.log("Theme %s nicht registriert: eingelesener Bericht, Gestaltung im Kitchen "
                       "unverändert (Theme des Berichts bleibt)" % THEME_NAME)
        for guid, s in self.vis_state.items():
            if s == "nobuild":
                self.todo("manual", need[guid]["name"],
                          "Kein Build von %s im Repo (im Visual-Ordner `pbiviz package` "
                          "laufen lassen). Die Kachel(n) %s bleiben bis dahin Ersatz oder "
                          "Platzhalter." % (guid, ", ".join(need[guid]["ids"]) or "–"))
        self.todo_install, self.theme_reg = todo_install, theme_reg
        # Neustart nötig? Nur wenn Desktop dieses Projekt offen hat und ein Neustart erlaubt ist
        self.restart_reason = None
        if not self.opt.install or self.opt.no_bridge or self.inst is None \
                or self.opt.no_desktop_restart:
            return
        theme_restart = theme_reg and (self.opt.restart_for_theme or self.scope == "theme"
                                       or self.preparing)
        if not (todo_install or theme_restart):
            return
        reasons = []
        missing = [need[g]["name"] for g in todo_install if self.vis_state.get(g) == "missing"]
        old = [need[g]["name"] for g in todo_install if self.vis_state.get(g) == "outdated"]
        if missing:
            reasons.append("%s %s im Bericht" % (", ".join(missing),
                                                 "fehlt" if len(missing) == 1 else "fehlen"))
        if old:
            reasons.append("%s %s veraltet" % (", ".join(old), "ist" if len(old) == 1 else "sind"))
        if theme_reg:
            reasons.append("Theme %s einmalig registrieren%s" % (
                THEME_NAME, " (Theme des Berichts wird ersetzt)"
                if (getattr(self, "design_info", None) or {}).get("imported") else ""))
        self.restart_reason = "; ".join(reasons)

    def keep_existing_versions(self, todo_install: list, need: dict, why: str) -> list:
        """B7: ältere, aber registrierte Kitchen-Visuals bleiben in ihrer Version (kein Update,
        das den Bericht des Nutzers verändert). Sie gelten als nutzbar („ok"), damit Kacheln
        nicht zu Ersatz oder Platzhalter werden. Gibt die verbleibenden Installationen zurück."""
        rest = []
        for guid in todo_install:
            if self.vis_state.get(guid) != "outdated":
                rest.append(guid)
                continue
            info = need.get(guid) or {}
            self.vis_state[guid] = "ok"
            entry = {"guid": guid, "name": info.get("name") or guid,
                     "from": info.get("previous"), "to": info.get("version")}
            if entry not in self.kept_versions:
                self.kept_versions.append(entry)
            self.todo("manual", entry["name"], "%s %s bleibt im Bericht (%s), im Repo gibt es %s. "
                      "Aktualisieren: Sitzung vorbereiten oder ohne „Vorhandene Version "
                      "behalten\" deployen." % (entry["name"], entry["from"] or "?", why,
                                                entry["to"] or "?"))
        return rest

    def visuals_step(self, nspec) -> None:
        """Fehlende oder veraltete Kitchen-Visuals installieren. report.json nur bei
        geschlossenem Desktop: offen mit diesem Projekt -> genau diese Instanz schließen
        (nur nach Bestätigung, siehe desktop_gate), installieren, am Ende neu öffnen."""
        need, todo_install, theme_reg = self.vis_needed, self.todo_install, self.theme_reg
        if not self.opt.install:
            self.ck_installed = self.vis_state.get(CK_GUID) == "ok"
            self.require_desktop()
            if need or theme_reg:
                self.st.step("visuals", "skipped", "--no-install: %d Kitchen-Visual(s) "
                             "benötigt, %d nicht installiert" % (
                                 len(need), len(todo_install)))
            return

        restart_ok = not self.opt.no_desktop_restart
        window = None
        if self.opt.no_bridge:
            window = "nobridge" if (todo_install or theme_reg) else None
        elif self.inst is None:
            if (todo_install or theme_reg) and restart_ok:
                # Sicherung: Desktop mit diesem Projekt, das sich nicht über die Bridge meldet
                # (Bridge aus, hängt): dann weder report.json schreiben noch ein zweites öffnen
                silent = [pid for pid in desktop_pids_with_file(self.p.pbip)
                          if pid not in {i.get("pid") for i in self.others}]
                if silent:
                    msg = ("Desktop (pid %s) hat %s offen, meldet sich aber nicht über die "
                           "Bridge. Bitte dort speichern und Desktop schließen (oder in Desktop "
                           "%s), dann erneut deployen." % (", ".join(map(str, silent)),
                                                          self.p.pbip.name, BRIDGE_SETTING))
                    self.st.step("bridge", "error", msg)
                    raise Blocked(msg)
                window, self.open_after = "closed", True
        elif self.restart_reason and not self.skip_restart:
            self.require_desktop()
            self.st.begin_step("desktop")
            self.close_desktop()
            window = "closed"
        elif todo_install and not restart_ok:    # --no-desktop-restart: Dateien trotzdem
            window = "open"
        self.require_desktop()

        done, failed = [], []
        if window and todo_install:
            for guid in todo_install:
                info = need[guid]
                try:
                    res = VI.install(self.p.report, info["path"])
                except Exception as e:           # noqa: BLE001 - Kachel fällt zurück
                    self.vis_state[guid] = "failed"
                    failed.append("%s: %s" % (info["name"], e))
                    continue
                self.vis_state[guid] = "installed"
                how = {"installed": "neu", "upgraded": "aktualisiert von %s" % info.get(
                    "previous"), "repaired": "repariert", "downgraded": "zurückgesetzt von %s"
                    % info.get("previous"), "unchanged": "unverändert"}.get(res["action"],
                                                                          res["action"])
                done.append("%s %s (%s)" % (info["name"], res.get("version") or "", how))
                info["result"] = res["action"]
        if window in ("closed", "nobridge") and theme_reg:
            self.register_theme()
        if window == "open" and done:
            self.todo("manual", "desktop", "Kitchen-Visuals installiert (%s), Desktop sieht sie "
                      "erst nach einem Neustart: Desktop schließen (nicht speichern, sonst "
                      "überschreibt Desktop die Registrierung) und das Projekt neu öffnen."
                      % "; ".join(done))
        if window == "nobridge" and done:
            self.todo("manual", "desktop", "Kitchen-Visuals installiert (%s). Hat Desktop das "
                      "Projekt offen: ohne Speichern schließen und neu öffnen." % "; ".join(done))
        if self.skip_restart and (todo_install or theme_reg):
            self.todo("manual", "desktop", "Ohne Neustart deployt: %s. Kacheln mit diesen "
                      "Visuals bleiben Ersatz oder Platzhalter, bis die Sitzung vorbereitet "
                      "ist (ein Neustart)." % (self.restart_reason or "Kitchen-Visuals fehlen"))
        for f in failed:
            self.todo("manual", "visuals", "Installation fehlgeschlagen: %s" % f)
        self.ck_installed = self.vis_state.get(CK_GUID) in ("ok", "installed")
        if not need and not theme_reg:
            self.st.step("visuals", "ok", "keine Kitchen-Visuals nötig")
            return
        kept = {k["guid"] for k in self.kept_versions}
        ok_now = [need[g]["name"] for g, s in self.vis_state.items() if s == "ok" and g not in kept]
        parts = []
        if done:
            parts.append("installiert: " + "; ".join(done))
        if ok_now:
            parts.append("schon aktuell: " + ", ".join(ok_now))
        if self.kept_versions:
            parts.append("vorhandene Version behalten: " + ", ".join(
                "%s %s (Repo %s)" % (k["name"], k["from"] or "?", k["to"] or "?")
                for k in self.kept_versions))
        if todo_install and not window:
            why = "ohne Neustart gewählt" if self.skip_restart else \
                "Desktop offen, kein Neustart erlaubt"
            parts.append("nicht installiert (%s): " % why
                         + ", ".join(need[g]["name"] for g in todo_install))
        if failed:
            parts.append("Fehler: " + "; ".join(failed))
        if window == "closed":
            parts.append("Desktop wird danach neu geöffnet")
        bad = failed or any(s == "nobuild" for s in self.vis_state.values()) or \
            (todo_install and not window)
        self.st.step("visuals", "warn" if bad else "ok",
                     " · ".join(parts) or "Kitchen-Visuals aktuell")
        with self.st.lock:
            self.st.doc["desktop"]["visualsInstalled"] = [
                {"guid": g, "name": need[g]["name"], "version": need[g].get("version"),
                 "action": need[g].get("result")} for g in need if need[g].get("result")]

    # --- Desktop schließen und öffnen --------------------------------------- #
    def wait_gone(self, pid, seconds: float) -> bool:
        deadline = time.time() + seconds
        while time.time() < deadline:
            if not pid_alive(pid):
                return True
            time.sleep(0.5)
        return not pid_alive(pid)

    def close_desktop(self) -> None:
        """Nur die Instanz mit diesem Projekt (PID aus dem Desktop-Status, Image
        pbidesktop.exe geprüft) und nur nach Bestätigung im Kitchen: deploy-confirm.json mit
        „restart" oder „discard" für diese seq (desktop_gate), Ausnahme --auto-restart.
        Ungespeichertes wird dann verworfen; --respect-unsaved hat vorher schon blockiert."""
        if not (self.opt.auto_restart or self.confirmed in ("restart", "discard", "auto")):
            msg = "Neustart nicht bestätigt, Desktop bleibt offen"
            self.st.step("desktop", "error", msg)
            raise Blocked(msg)
        if self.confirmed in ("restart", "discard"):
            # Gegenprobe direkt vor dem Schließen, gebunden an die bestätigte Instanz (Safety 3):
            # nie eine andere pid schließen; bei „restart" seit der Antwort keine neue Arbeit
            want = self.confirmed_pid or (self.inst or {}).get("pid")
            probe = self.probe_instance(want)
            if probe is False:
                msg = ("Desktop-Status vor dem Schließen nicht lesbar, Neustart abgebrochen. "
                       "Nichts geschlossen, bitte erneut deployen.")
                self.st.step("desktop", "error", msg)
                raise Blocked(msg)
            if probe is None:
                # in der Zwischenzeit selbst geschlossen: installieren, danach öffnen
                self.inst, self.r.pid = None, None
                self.open_after = True
                with self.st.lock:
                    self.st.doc["desktop"].update({"connected": False})
                self.st.step("desktop", "ok", "Desktop (pid %s) ist schon geschlossen, wird "
                             "danach geöffnet" % want)
                return
            if self.confirmed == "restart" and probe.get("hasUnsavedChanges"):
                msg = ("Desktop hat inzwischen ungespeicherte Änderungen. Neustart abgebrochen, "
                       "nichts geschlossen, bitte erneut deployen.")
                self.st.step("desktop", "error", msg)
                raise Blocked(msg)
            self.inst = probe
        inst = self.inst
        pid = inst.get("pid")
        unsaved = bool(inst.get("hasUnsavedChanges"))
        if self.r.close_cmd:                     # Tests und eigene Steuerung
            rc, out, err = run(self.r.close_cmd + [str(pid)], timeout=120)
            if rc != 0:
                msg = "Desktop (pid %s) ließ sich nicht schließen: %s" % (
                    pid, short(err or out))
                self.st.step("desktop", "error", msg)
                raise Blocked(msg)
            how = "über %s" % Path(self.r.close_cmd[-1]).name
        else:
            name, exe = process_info(pid)
            if name != DESKTOP_IMAGE:
                msg = ("PID %s ist kein Power BI Desktop (%s), nichts geschlossen. Desktop "
                       "bitte selbst schließen und erneut deployen." % (pid, name or "Prozess weg"))
                self.st.step("desktop", "error", msg)
                raise Blocked(msg)
            self.desktop_exe = exe
            gone = False
            if not unsaved:                      # höflich: WM_CLOSE an den Prozessbaum
                run(["taskkill", "/PID", str(pid), "/T"], timeout=60)
                gone = self.wait_gone(pid, 20)
            how = "geschlossen"
            if not gone:
                run(["taskkill", "/PID", str(pid), "/T", "/F"], timeout=60)
                how = "beendet (ungespeicherte Änderungen verworfen)" if unsaved else \
                    "beendet (reagierte nicht auf Schließen)"
                if not self.wait_gone(pid, 30):
                    msg = "Desktop (pid %s) ließ sich nicht beenden" % pid
                    self.st.step("desktop", "error", msg)
                    raise Blocked(msg)
        # Gegenprobe: der Desktop-Status nennt das Projekt nicht mehr
        deadline = time.time() + 30
        while any(self.is_mine(i) for i in self.desk.status(wait=0)["instances"]):
            if time.time() > deadline:
                msg = "Desktop meldet %s nach dem Schließen noch als offen" % self.p.pbip.name
                self.st.step("desktop", "error", msg)
                raise Blocked(msg)
            time.sleep(1)
        self.closed_by_us = self.open_after = True
        self.inst, self.r.pid = None, None
        with self.st.lock:
            self.st.doc["desktop"].update({"connected": False, "closedForInstall": True})
        self.st.step("desktop", "ok", "Desktop (pid %s) %s, damit report.json geschrieben "
                     "werden darf" % (pid, how))

    def reopen(self) -> bool:
        """Desktop mit dem Projekt öffnen und warten, bis der Status es mit Dateipfad
        meldet. Bleibt es aus (Anmeldedialog, gesperrter Bildschirm): blockiert, die
        installierten Dateien bleiben (harmlos)."""
        self.reopened = True
        if self.opt.no_bridge or not self.p.pbip:
            return False
        exe = find_desktop_exe(self.desktop_exe)
        ok, how = self.desk.open(self.p.pbip, exe)
        stop = ("Desktop startet nicht, bitte Desktop öffnen und anmelden, dann erneut "
                "deployen.")
        if not ok:
            msg = "%s (%s)" % (stop, how)
            self.st.step("desktop", "error", msg)
            self.todo("manual", "desktop", msg)
            raise Blocked(msg)
        t0 = time.time()
        deadline = t0 + float(self.opt.desktop_timeout)
        mine = []
        while True:
            mine = [i for i in self.desk.status(wait=0)["instances"] if self.is_mine(i)]
            if mine or time.time() >= deadline:
                break
            time.sleep(min(2.0, max(0.2, float(self.opt.desktop_timeout) / 10)))
        if not mine:
            msg = ("%s Nach %d s meldet Desktop %s nicht (Anmeldedialog, gesperrter "
                   "Bildschirm?). Bericht und Kitchen-Visuals sind geschrieben."
                   % (stop, int(time.time() - t0), self.p.pbip.name))
            self.st.step("desktop", "error", msg)
            self.todo("manual", "desktop", stop)
            raise Blocked(msg)
        inst = mine[0]
        self.inst, self.r.pid = inst, inst.get("pid")
        self.clear_reload_marker()               # frisch geöffnet: nichts Ungespeichertes
        if self.r.pin_pid:                       # festgenagelt: auf die neue Instanz umziehen
            self.r.repin(inst.get("pid"), "Desktop vom Runner neu gestartet")
        self.r.update_session(pid=inst.get("pid"), exe=exe)
        with self.st.lock:
            self.st.doc["desktop"].update({
                "connected": True, "file": inst.get("currentFilePath"), "pid": inst.get("pid"),
                "hasUnsavedChanges": bool(inst.get("hasUnsavedChanges")), "reopened": True,
                "reloaded": True, "unsavedByUs": False})
        self.st.step("desktop", "ok", "Desktop mit %s geöffnet (pid %s, %s, %.0f s bis bereit)"
                     % (self.p.pbip.name, inst.get("pid"), how, time.time() - t0))
        self.st.step("reload", "skipped", "Desktop frisch geöffnet, kein Reload nötig")
        return True

    # --- Theme --------------------------------------------------------------- #
    def theme_info(self):
        rj = read_json(self.p.report / "definition" / "report.json", retries=0) or {}
        ct = (rj.get("themeCollection") or {}).get("customTheme")
        if not isinstance(ct, dict) or not ct.get("name"):
            return None
        return {"name": ct["name"],
                "file": self.p.report / "StaticResources" / "RegisteredResources" / ct["name"]}

    def theme_fragment(self):
        frag = read_json(self.out_dir / "theme-fragment.json", retries=0)
        return frag if isinstance(frag, dict) else None

    def theme_needs_registration(self) -> bool:
        return bool(self.opt.install and self.theme_fragment() and self.theme_info() is None)

    def register_theme(self) -> None:
        """Einmalig, nur bei geschlossenem Desktop: pbir legt ein Custom Theme an
        (schreibt report.json + RegisteredResources). Danach je Deploy nur set-colors/
        set-fonts (nur die Theme-Datei)."""
        rc, out, err = self.pbir("theme", "apply-template", self.p.report_arg, THEME_TEMPLATE)
        if rc != 0:
            self.st.step("theme", "warn", "Theme nicht registriert: %s" % short(err or out))
            return
        rc2, out2, err2 = self.pbir("theme", "rename", self.p.report_arg, THEME_NAME)
        self.theme_registered = True
        self.__dict__.pop("_theme_changes", None)    # Vorschau rechnete ohne Theme-Datei
        self.st.step("theme", "ok", "Custom Theme %s registriert (Vorlage %s)%s" % (
            THEME_NAME if rc2 == 0 else THEME_TEMPLATE, THEME_TEMPLATE,
            "" if rc2 == 0 else ", Umbenennen ging nicht: %s" % short(err2 or out2)))

    def theme_changes(self):
        """(set-colors-Argumente, [(Klasse, set-fonts-Argumente)],
        [(set-formatting-Pfad, Wert)]) für alles, was im Theme-Fragment anders steht als in
        der Theme-Datei des Berichts."""
        if hasattr(self, "_theme_changes"):
            return self._theme_changes
        frag, info = self.theme_fragment(), self.theme_info()
        self._theme_changes = ([], [], [])
        if not self.opt.install or not frag or not info or not info["file"].is_file():
            return self._theme_changes
        cur = read_json(info["file"], retries=0) or {}
        colors = []
        for key, flag in (("background", "--background"), ("foreground", "--foreground"),
                          ("tableAccent", "--table-accent"), ("good", "--good"),
                          ("bad", "--bad"), ("neutral", "--neutral")):
            want = frag.get(key)
            if isinstance(want, str) and want and str(cur.get(key) or "").lower() != want.lower():
                colors += [flag, want]
        dc = frag.get("dataColors")
        if isinstance(dc, list) and dc and \
                [str(c).lower() for c in cur.get("dataColors") or []] != [str(c).lower() for c in dc]:
            colors += ["--data-colors", json.dumps(dc)]
        fonts = []
        for cls, spec in (frag.get("textClasses") or {}).items():
            if not isinstance(spec, dict):
                continue
            have = (cur.get("textClasses") or {}).get(cls) or {}
            args = []
            if isinstance(spec.get("fontSize"), (int, float)):
                size = int(spec["fontSize"] + 0.5)         # set-fonts nimmt nur ganze pt
                if have.get("fontSize") != size:
                    args += ["--font-size", size]
            if isinstance(spec.get("color"), str) and \
                    str(have.get("color") or "").lower() != spec["color"].lower():
                args += ["--color", spec["color"]]
            if args:
                fonts.append((cls, args))
        self._theme_changes = (colors, fonts, self.theme_page_formatting(frag, cur))
        return self._theme_changes

    @staticmethod
    def theme_page_formatting(frag: dict, cur: dict) -> list:
        """visualStyles.page["*"].outspace/.background aus dem Fragment
        ([{"color": {"solid": {"color": "#EAE8E1"}}, "transparency": 0}]) als
        set-formatting-Paare, soweit die Theme-Datei anders ist. Ohne outspace im Fragment
        gilt #EAE8E1: die Arbeitsfläche um die Seite ist sonst dunkles Navy (Desktop-
        Vorgabe), was Bildvergleich und Lesbarkeit stört."""
        def first(styles, prop):
            v = ((((styles or {}).get("page") or {}).get("*") or {}).get(prop))
            return v[0] if isinstance(v, list) and v and isinstance(v[0], dict) else None

        def hexcol(entry):
            c = (entry or {}).get("color")
            if isinstance(c, dict):
                c = ((c.get("solid") or {}).get("color"))
            return str(c).lower() if isinstance(c, str) else None
        want_styles = frag.get("visualStyles") if isinstance(frag.get("visualStyles"), dict) else {}
        have_styles = cur.get("visualStyles") if isinstance(cur.get("visualStyles"), dict) else {}
        out = []
        for prop in ("outspace", "background"):
            want = first(want_styles, prop)
            if want is None and prop == "outspace":
                want = {"color": {"solid": {"color": DEFAULT_OUTSPACE}}, "transparency": 0}
            if want is None:
                continue
            have = first(have_styles, prop) or {}
            col = hexcol(want)
            if col and hexcol(have) != col:
                out.append(("page.*.%s.color" % prop, col.upper()))
            tr = want.get("transparency")
            if isinstance(tr, (int, float)) and have.get("transparency") != tr:
                out.append(("page.*.%s.transparency" % prop, str(int(tr) if tr == int(tr)
                                                                  else tr)))
        return out

    def theme_allowed(self) -> bool:
        """Demo B2: Theme-Farben und -Schriften aus dem Kitchen nur, wenn die Gestaltung seit
        der Basis geändert wurde, beim ersten Deploy eines nicht eingelesenen Projekts, nach
        der Registrierung des Kitchen-Themes in diesem Lauf oder auf ausdrücklichen Wunsch
        (Teilziel theme). Sonst bleibt das Theme des Berichts (z. B. ein eigenes Firmen-Theme)."""
        if self.scope in ("layout", "model"):
            return False
        return self.scope == "theme" or self.theme_registered or bool(self.restyle_report)

    def theme_wanted(self) -> bool:
        if not self.theme_allowed():
            return False
        colors, fonts, fmt = self.theme_changes()
        return bool(colors or fonts or fmt)

    def apply_theme(self) -> None:
        """Farben und Schriften aus dem Theme-Fragment (nur die Theme-Datei, report.json
        bleibt). Fehler sind To-dos, kein Abbruch."""
        if not self.theme_allowed():
            return
        info = self.theme_info()
        colors, fonts, fmt = self.theme_changes()
        if not info or not (colors or fonts or fmt):
            return
        done, errs = [], []
        if colors:
            rc, out, err = self.pbir("theme", "set-colors", self.p.report_arg, *colors)
            (done if rc == 0 else errs).append(
                "Farben %s" % ", ".join(a[2:] for a in colors[::2]) if rc == 0
                else "set-colors: %s" % short(err or out))
        for cls, args in fonts:
            rc, out, err = self.pbir("theme", "set-fonts", self.p.report_arg, cls, *args)
            (done if rc == 0 else errs).append(
                "Schrift %s" % cls if rc == 0 else "set-fonts %s: %s" % (cls, short(err or out)))
        for path, value in fmt:                  # Seite: Arbeitsfläche (outspace), Hintergrund
            rc, out, err = self.pbir("theme", "set-formatting", self.p.report_arg, path,
                                     "--value", value)
            (done if rc == 0 else errs).append(
                "%s %s" % (path, value) if rc == 0
                else "set-formatting %s: %s" % (path, short(err or out)))
        for e in errs:
            self.todo("theme", info["name"], "Theme nicht vollständig gesetzt: %s" % e)
        self.st.step("theme", "warn" if errs else "ok", "Theme %s: %s" % (
            info["name"], ", ".join(done) or "keine Änderung"))

    # ---------------- 3c · Modell über te (Paket C) ---------------- #
    def read_approvals(self) -> list:
        """Freigaben aus mockup/model-approvals.json, beide Formen:
        neu  {"approvals": [{"id", "hash", "by", "at", "overrides": {"dax": …}}]}
        alt  {"ids": [...], "overrides": {id: {...}}}  (ohne Hash, weiter lesbar)."""
        a = read_json(self.p.approvals, retries=1)
        out = []
        if not isinstance(a, dict):
            return out
        for e in a.get("approvals") or []:
            if isinstance(e, dict) and e.get("id"):
                ov = e.get("overrides") if isinstance(e.get("overrides"), dict) else {}
                out.append({"id": str(e["id"]), "hash": e.get("hash"), "by": e.get("by"),
                            "at": e.get("at"), "overrides": ov, "form": "hash"})
        ovs = a.get("overrides") if isinstance(a.get("overrides"), dict) else {}
        seen = {x["id"] for x in out}
        for i in a.get("ids") or []:
            if i and str(i) not in seen:
                ov = ovs.get(str(i)) if isinstance(ovs.get(str(i)), dict) else {}
                out.append({"id": str(i), "hash": None, "by": None, "at": None,
                            "overrides": ov, "form": "ids"})
                seen.add(str(i))
        return out

    @staticmethod
    def approval_sig(entry: dict) -> str:
        """Signatur einer Freigabe in .state/model-applied.json. Alte Form wie bis Runner 0.2
        (nur overrides); neue Form mit Hash und Zeitpunkt: eine erneute Freigabe (neues `at`)
        gilt als neue Freigabe, auch für eine fehlgeschlagene Op."""
        if entry.get("form") == "hash":
            return canon({"hash": entry.get("hash"), "at": entry.get("at"),
                          "overrides": entry.get("overrides") or {}})
        return canon(entry.get("overrides") or {})

    def open_approvals(self) -> list:
        """Freigaben, die noch nicht (in dieser Form) bearbeitet wurden."""
        done = read_json(self.p.model_applied, retries=0) or {}
        return [e["id"] for e in self.read_approvals()
                if (done.get(e["id"]) or {}).get("sig") != self.approval_sig(e)]

    def te_status(self):
        if self.te_state is None:
            self.te_state = MO.te_available(self.r.te)
        return self.te_state

    def model_plan(self, raw: dict) -> None:
        """Modellwünsche als Ops planen (liest nur, auch für die Vorschau)."""
        self.model_ops, self.model_plan_error = [], None
        if self.scope in ("layout", "theme"):
            return
        ok, _, _ = self.te_status()
        try:
            self.model_ops = MO.plan(raw, self.p.model, te=self.r.te, probe=ok,
                                     report_dir=self.p.report_arg)
        except Exception as e:                   # noqa: BLE001 - Wünsche nie den Deploy kosten
            self.model_plan_error = str(e)

    def approval_view(self) -> dict:
        """op-id -> {approved, stale, entry, why} für die aktuellen Ops. Safety-Review 5: der
        Hash deckt auch die Korrektur der Freigabe (overrides: DAX, Format, alias), also gilt
        eine Freigabe nur, wenn `hash` dem Hash der Op MIT dieser Korrektur entspricht. Die
        alte Form {ids, overrides} hat keinen Hash und gilt als veraltet (erneut freigeben)."""
        entries = {e["id"]: e for e in self.read_approvals()}
        out = {}
        for o in self.model_ops:
            e = entries.get(o["id"])
            if not e:
                out[o["id"]] = {"approved": False, "stale": False, "entry": None, "why": None}
                continue
            if e["form"] != "hash" or not e.get("hash"):
                why = "Freigabe ohne Hash (alte Form)"
                stale = True
            else:
                stale = e.get("hash") not in MO.approval_hashes(o, e.get("overrides") or {})
                why = "Hash passt nicht mehr" if stale else None
            out[o["id"]] = {"approved": not stale, "stale": stale, "entry": e, "why": why}
        return out

    def model_step(self, raw: dict) -> None:
        """Modellwünsche aus der Roh-Spec: Ops ohne Freigabe (Format, Beschreibung, Ordner)
        laufen automatisch, wenn te da ist; DAX und Umbenennung nach Freigabe in
        mockup/model-approvals.json (neue Form: nur mit passendem Hash). Danach lädt
        Desktop das Modell neu."""
        if self.scope in ("layout", "theme"):
            self.st.step("model", "skipped", "Teilziel %s: Modell nicht angefasst" % self.scope)
            return
        te = self.r.te
        ok, version, te_msg = self.te_status()
        if self.model_plan_error:
            self.st.step("model", "warn", "Modellwünsche nicht auswertbar: %s"
                         % self.model_plan_error)
            return
        ops = self.model_ops
        if not ops:
            self.st.step("model", "ok" if ok else "skipped", "%s · keine Modellwünsche" % te_msg)
            return
        done = read_json(self.p.model_applied, retries=0) or {}
        view = self.approval_view()
        entries = {e["id"]: e for e in self.read_approvals()}
        approved, ov, stale = [], {}, []
        for oid, e in entries.items():
            if (done.get(oid) or {}).get("sig") == self.approval_sig(e):
                continue                         # schon bearbeitet
            if (view.get(oid) or {}).get("stale"):
                stale.append(oid)
                continue
            approved.append(oid)
            if e.get("overrides"):
                ov[oid] = e["overrides"]
        runnable = [o for o in ops if not o.get("needsApproval") or o["id"] in approved]
        res = None
        if ok and any(o.get("executable") for o in runnable):
            res = MO.apply(runnable, self.p.model, approved_ids=approved, te=te, overrides=ov,
                           backup_root=self.p.state_dir / "model-backups")
            if res.get("reloadModel"):
                self.model_reload = True
            self.model_followups = list(res.get("followUps") or [])
        results = {r["id"]: r for r in ((res or {}).get("results") or [])}
        if approved and ok:
            for i in approved:
                r = results.get(i) or {}
                e = entries[i]
                done[i] = {"seq": self.seq, "at": now_iso(), "sig": self.approval_sig(e),
                           "status": r.get("status") or "unbekannte Op-ID",
                           "hash": e.get("hash"), "by": e.get("by"), "approvedAt": e.get("at")}
                if i not in {o["id"] for o in ops}:
                    self.todo("model", i, "Freigabe für „%s“ passt zu keinem Modellwunsch "
                              "der Spec (schon erledigt oder Tippfehler)." % i)
            self.p.state_dir.mkdir(parents=True, exist_ok=True)
            write_json_atomic(self.p.model_applied, done)
        n_app = n_wait = n_block = n_fail = 0
        for o in ops:
            r = results.get(o["id"]) or {}
            s = r.get("status")
            if s == "applied":
                n_app += 1
                continue
            # Safety-Review 5: das Kitchen braucht Art, Ziel und Inhalt der Op, um den Hash für
            # bearbeitetes DAX selbst zu rechnen (sha256 über opKind, target, after mit DAX)
            extra = {"id": o["id"], "summary": o.get("summary"),
                     "commandLines": o.get("commandLines") or [],
                     "needsApproval": bool(o.get("needsApproval")), "hash": o.get("hash"),
                     "opKind": o.get("kind"), "target": o.get("target"),
                     "opRef": o.get("ref"), "after": o.get("after"),
                     "newRef": o.get("newRef")}
            if o["id"] in stale:
                n_wait += 1
                extra["staleApproval"] = True
                text = ("%s Geändert seit der Freigabe, bitte erneut freigeben (%s)." % (
                    o["summary"], (view.get(o["id"]) or {}).get("why") or "Hash passt nicht"))
            elif not o.get("executable") and not (o["id"] in approved and ov.get(o["id"])):
                n_block += 1
                text = "%s Nicht ausführbar: %s." % (o["summary"], o.get("blockedReason")
                                                       or "fehlt")
            elif s in ("failed", "reverted"):
                n_fail += 1
                extra["retry"] = True
                text = "%s Fehlgeschlagen: %s Nach einer Korrektur erneut freigeben." % (
                    o["summary"], r.get("message") or (res or {}).get("message"))
            elif o.get("needsApproval") and (done.get(o["id"]) or {}).get("status") in (
                    "failed", "reverted"):
                # früher gescheitert, seitdem nicht neu freigegeben: weiter „erneut freigeben"
                # (eine Freigabe mit neuem `at` gilt als neue Freigabe, auch mit gleichem Hash)
                n_wait += 1
                extra["retry"] = True
                extra["failedSeq"] = (done.get(o["id"]) or {}).get("seq")
                text = ("%s In Deploy %s fehlgeschlagen. Nach einer Korrektur erneut freigeben "
                        "(neue Freigabe mit neuem Zeitpunkt)." % (
                            o["summary"], (done.get(o["id"]) or {}).get("seq")))
            elif o.get("needsApproval"):
                n_wait += 1
                text = ("%s Freigabe im Kitchen (oder in mockup/model-approvals.json: "
                        "{\"approvals\": [{\"id\": \"%s\", \"hash\": \"%s\", \"by\", \"at\"}]}), "
                        "dann erneut deployen." % (o["summary"], o["id"], o.get("hash")))
            else:
                n_wait += 1
                text = "%s Läuft automatisch, sobald te verfügbar ist." % o["summary"]
            self.todo("model", o.get("ref") or o["id"], text, **extra)
        if not ok:
            self.todo("model", "te", "%s. Modellwünsche bleiben To-dos." % te_msg)
        parts = [te_msg]
        if n_app:
            parts.append("%d angewendet" % n_app)
        if n_wait:
            parts.append("%d warten (Freigabe oder te)" % n_wait)
        if stale:
            parts.append("%d Freigabe(n) veraltet" % len(stale))
        if n_block:
            parts.append("%d nicht ausführbar" % n_block)
        if n_fail:
            parts.append("%d fehlgeschlagen" % n_fail)
        if res and res.get("message"):
            parts.append(res["message"])
        state = "ok" if ok and not n_fail and (res or {}).get("status") not in (
            "reverted", "failed", "partial") else "warn"
        self.st.step("model", state, " · ".join(parts))

    # ---------------- 2 · Spec ---------------- #
    def spec_hash_of(self, raw: dict) -> str:
        h = (raw.get("meta") or {}).get("specHash")
        if h:
            return str(h)
        return self.r.spec_tools.spec_hash(self.r.spec_tools.upgrade(raw))

    def check_spec(self) -> dict:
        want = self.req.get("specHash")
        deadline = time.time() + 3.0
        raw, have = None, None
        while True:
            raw = read_json(self.p.spec)
            if isinstance(raw, dict):
                try:
                    have = self.spec_hash_of(raw)
                except Exception as e:           # noqa: BLE001 - Spec-Fehler melden
                    have = "?"
                    self.r.log("Spec nicht lesbar: %s" % e)
            if raw is not None and (not want or have == want):
                break
            if time.time() >= deadline:
                break
            time.sleep(0.3)
        if raw is None:
            self.st.step("spec", "error", "mockup-spec.json fehlt oder ist kein JSON")
            raise RunnerError("mockup-spec.json fehlt oder ist kein gültiges JSON")
        if want and have != want:
            msg = ("specHash passt nicht: Anfrage %s, mockup-spec.json %s (nach 3 s)"
                   % (want, have))
            self.st.step("spec", "error", msg)
            raise RunnerError(msg)
        self.st.step("spec", "ok", "specHash %s" % have)
        return raw

    # ---------------- 3 · Build ---------------- #
    def build(self, raw: dict) -> dict:
        out = self.out_dir
        if out.exists():
            shutil.rmtree(out, ignore_errors=True)
        argv = [sys.executable, str(self.r.converter), str(self.p.spec), "--out", str(out),
                "--report", self.p.report_arg, "--plan"]
        if self.opt.ck_fallback:
            argv.append("--ck-fallback")
        rc, so, se = run(argv, timeout=300)
        if rc != 0:
            msg = "mockup_to_pbir.py Exit %d: %s" % (rc, short(se or so, 500))
            self.st.step("build", "error", msg)
            raise RunnerError(msg)
        try:
            nspec = self.r.spec_tools.upgrade(raw)
        except Exception as e:                   # noqa: BLE001
            self.st.step("build", "error", str(e))
            raise RunnerError("Spec nicht lesbar: %s" % e)
        self.plan_json = read_json(out / "plan.json") or {}
        self.page_dirs = {pg["name"]: pg["dir"] for pg in self.plan_json.get("pages") or []}
        self.st.step("build", "ok", "mockup_to_pbir.py --plan%s → mockup/out"
                     % (" --ck-fallback" if self.opt.ck_fallback else ""))
        return nspec

    def page_out(self, page_name: str) -> Path:
        d = self.page_dirs.get(page_name) or self.r.spec_tools.slug(page_name)
        return self.out_dir / d

    def load_out(self, page_name: str, fname: str, default):
        data = read_json(self.page_out(page_name) / fname, retries=0)
        return default if data is None else data

    # ---------------- 4 · Plan (Delta) ---------------- #
    def plan(self, raw: dict, nspec: dict, report: bool = True) -> list:
        """Arbeitsliste je Seite. Reine Entscheidung, schreibt nichts (report=False: ohne
        Schritt `plan` im Status, für die Vorschau)."""
        tools = self.r.spec_tools
        last_raw, base_src = self.load_base()
        self.base_raw = last_raw
        last = None
        if isinstance(last_raw, dict):
            try:
                last = tools.upgrade(last_raw)
            except Exception:                    # noqa: BLE001 - alter Stand unlesbar
                last = None
        self.first = last is None
        self.base_src = base_src if last else None
        last_vis = {}
        last_pages = {}
        last_page_ids = set()
        if last:
            for pg in last["pages"]:
                last_pages[pg["name"]] = pg
                last_page_ids.add(pg.get("id"))
                for v in pg["visuals"]:
                    last_vis[vkey(v)] = (pg, v)
        page_map = (read_json(self.p.state_dir / "page-map.json", retries=0) or {})
        self.load_report_pages()
        created = read_json(self.p.created, retries=0)
        self.created = created if isinstance(created, dict) else {}
        hashes = read_json(self.p.state_dir / "ck-objects.json", retries=0)
        self.ck_hashes = hashes if isinstance(hashes, dict) else {}
        if any(v.get("engine") == "ck" for pg in nspec["pages"] for v in pg["visuals"]):
            self.ck_ref = self.find_ck_reference()

        chrome_changed = (last is None or canon(nspec["zones"]) != canon(last["zones"])
                          or canon(nspec["design"]) != canon(last["design"])
                          or canon(nspec["canvas"]) != canon(last["canvas"]))
        design_changed = last is None or canon(nspec["design"]) != canon(last["design"])
        # Demo B2 (PBIP ist die Wahrheit): Eingelesene Seiten und Visuals bekommen Kitchen-
        # Gestaltung (Seitenhintergrund, Kachelstil, Theme) nur, wenn sich design seit der
        # Vergleichsbasis (baseline-spec.json bzw. letzter Deploy) wirklich geändert hat, und
        # nie den Kitchen-Rahmen (Zonen gelten im Kitchen für alle Seiten). Neue Seiten werden
        # gestaltet wie bisher.
        self.design_changed_base = last is not None and \
            canon(nspec["design"]) != canon(last["design"])
        imported = any((pg.get("pbir") or {}).get("page") or any(
            (v.get("pbir") or {}).get("visual") for v in pg.get("visuals") or [])
            for pg in nspec["pages"])
        self.restyle_report = self.design_changed_base or (last is None and not imported)
        canvas = nspec["canvas"]
        plan = []
        seen_keys = set()
        frame_skipped = []                       # eingelesene Seiten ohne Kitchen-Rahmen
        relayout_pages = {}                      # eingelesene Seiten: Lage aus dem Bericht

        for page in nspec["pages"]:
            name = page["name"]
            origin = (page.get("pbir") or {}).get("page")
            rp = None
            if origin:
                rp = self.page_by_id(origin)
                if not rp:
                    self.pages[name] = {"state": "skipped", "shot": None,
                                        "msg": "Seite %s steht nicht mehr im Bericht "
                                               "(in Desktop gelöscht?), nicht neu angelegt"
                                               % origin}
                    for v in page["visuals"]:
                        seen_keys.add(vkey(v))
                        self.vres(vkey(v), "skipped", "Seite fehlt im Bericht")
                        self.counts["skipped"] += 1
                    continue
            if not rp and page.get("id") and page_map.get(page["id"]):
                rp = self.page_by_id(page_map[page["id"]])
            if not rp:
                rp = self.page_by_name(name)
            if rp and rp["displayName"] != name:
                self.todo("manual", name, "Seite „%s\" heißt im Bericht „%s\". "
                          "Umbenennen geht während der Bridge-Preview nicht extern "
                          "(pbir schreibt dabei report.json): in Desktop umbenennen."
                          % (name, rp["displayName"]))
            action = "update" if rp else "create"
            # Seite zum ersten Mal im Mockup (auch eine bestehende Berichtsseite):
            # Chrome und Hintergrund wie beim Neubau
            fresh = action == "create" or (name not in last_pages
                                           and page.get("id") not in last_page_ids)
            bg_note = None
            imported_page = bool(origin) and action == "update"
            if imported_page:
                # B2: eingelesene Seite bleibt, wie sie im Bericht gestaltet ist
                chrome = False
                background = self.design_changed_base
                if chrome_changed and self.zones_have_frame(nspec):
                    frame_skipped.append(name)
            else:
                own_page = bool(rp) and rp["id"] in set(page_map.values())
                if rp and own_page and not (design_changed or fresh):
                    bg_note = self.page_background_differs(rp, nspec)
                chrome = chrome_changed or fresh
                background = bool(design_changed or fresh or bg_note)
            pw = {"page": page, "name": name, "action": action,
                  "pageId": rp["id"] if rp else None,
                  "display": rp["displayName"] if rp else name,
                  "items": [], "chrome": chrome, "imported": imported_page,
                  "background": bool(background),
                  "canvas": canvas}
            if bg_note:
                self.r.log("Seite %s: %s" % (name, bg_note))
            # Demo B2 (Prüfung an der Demo-Kopie): Ändert sich der Rahmen im Kitchen, setzt das
            # Kitchen die Kacheln aller Seiten in den neuen Inhaltsbereich. Auf eingelesenen
            # Seiten schreibt der Runner den Rahmen nicht, also auch diese Verschiebung nicht.
            relayout = bool(imported_page and name in last_pages and canon(
                page.get("contentRect")) != canon(last_pages[name].get("contentRect")))
            kept_rect = []
            existing = self.visuals_on(rp["id"]) if rp else {}
            pw["existing"] = existing
            built = {i["name"]: i for i in
                     self.load_out(name, "pbir-visuals.json", [])
                     + self.load_out(name, "text-visuals.json", [])}
            custom = {c["id"]: c for c in self.load_out(name, "custom-visuals.json", [])}
            slots = {s["id"]: ("ck", s) for s in
                     self.load_out(name, "chartkitchen-slots.json", [])}
            slots.update({s["id"]: ("deneb", s) for s in
                          self.load_out(name, "deneb-slots.json", [])})

            # --- Kacheln aus der Spec --------------------------------------- #
            for v in page["visuals"]:
                key = vkey(v)
                seen_keys.add(key)
                prev = last_vis.get(key, (None, None))[1]
                vpbir = v.get("pbir") if isinstance(v.get("pbir"), dict) else {}
                vorigin = vpbir.get("visual")
                lossy = bool(vpbir.get("lossy"))
                target = vorigin or (prev or {}).get("id") or v["id"]
                diff = set()
                own = set()
                if prev is None:
                    changes = {"rect", "title", "bind", "format"}
                    if vorigin:
                        # eingelesen, aber ohne Basis: Titel und Bindung sind unbekannt
                        # (der Export fuellt leere Titel mit dem Kachel-Label) -> nur Geometrie
                        changes = {"rect"}
                else:
                    a, b = vcore(v), vcore(prev)
                    diff = {k for k in set(a) | set(b) if canon(a.get(k)) != canon(b.get(k))}
                    changes = set()
                    if diff & RECT_KEYS:
                        changes.add("rect")
                    if diff & TITLE_KEYS:
                        changes.add("title")
                    if diff & BIND_KEYS:
                        changes.add("bind")
                    own = diff - RECT_KEYS - TITLE_KEYS - BIND_KEYS - {"displayName"}
                    if vorigin:
                        # `display` leitet das Kitchen aus Kachel und Größe ab (was die Skizze
                        # zeigt); allein ist es keine Änderung am eingelesenen Visual (B2)
                        own -= {"id", "stableId", "display"}
                        if own:                  # eigene Änderung, nicht das Berichtsdesign
                            changes.add("format")
                    elif own or design_changed:
                        changes.add("format")
                if lossy:                        # Vertrag: nur Position und Größe
                    changes &= {"rect"}
                if relayout and vorigin and "rect" in changes and prev is not None:
                    changes.discard("rect")
                    kept_rect.append(v.get("title") or v.get("displayName") or key)
                # eingelesene Kachel: Stil (und ChartKitchen-Modus) gegen den Bericht nur
                # abgleichen, wenn sich die Gestaltung seit der Basis geändert hat (Demo B2;
                # vorher auch beim ersten Deploy nach dem Einlesen, Audit Deploy 4)
                if vorigin and not lossy and self.design_changed_base:
                    changes.add("sync")
                # ChartKitchen replizieren: Referenz-Instanz im Bericht, Slot mit Modus
                slot = slots.get(v["id"])
                ck_live = ((self.ck_installed or self.ck_ref is not None)
                           and v.get("engine") == "ck"
                           and slot is not None and slot[0] == "ck"
                           and slot[1].get("orientation") in CK_ORIENTATIONS)
                ck_subs = []
                if ck_live and action == "update":
                    etype = (existing.get(target) or {}).get("type")
                    if vorigin and etype != CK_GUID:
                        ck_live = False          # fremdes Visual: nie ersetzen
                    elif etype != CK_GUID:
                        # Platzhalter oder Ersatzvisual aus einem früheren Deploy: ersetzen,
                        # auch wenn die Kachel im Kitchen unverändert ist
                        ck_subs = self.own_substitutes(pw["pageId"], key, v, prev, target,
                                                       existing, CK_GUID)
                        if ck_subs:
                            changes = {"rect", "title", "bind", "format"}
                # Custom Visual (auch kpi -> ibcsKpiCard): eigenes Visual anderen Typs
                # (ChartKitchen cards, natives Ersatzvisual, Platzhalter) ersetzen
                cv_subs = []
                if v.get("engine") == "custom" and v["id"] in custom and action == "update" \
                        and not vorigin:
                    guid = custom[v["id"]].get("guid")
                    cv_subs = self.own_substitutes(pw["pageId"], key, v, prev, target,
                                                   existing, guid)
                    if cv_subs and self.vis_state.get(guid) not in ("ok", "installed"):
                        # nicht installiert: ein funktionierendes Ersatzvisual nicht gegen
                        # eine leere Hülle tauschen; der nächste Deploy versucht es wieder
                        self.vres(key, "warn", "%s ist im Bericht nicht installiert, das "
                                  "bisherige Visual (%s) bleibt" % (
                                      custom[v["id"]].get("visualName") or guid,
                                      ", ".join(cv_subs)),
                                  pbir={"page": pw["pageId"], "visual": target})
                        self.counts["skipped"] += 1
                        continue
                    etype = (existing.get(target) or {}).get("type")
                    if cv_subs or (etype and etype != guid and prev is not None):
                        changes = {"rect", "title", "bind", "format"}
                # ChartKitchen-Einstellungen (chart.*, labels.*, ibcsTitle.*, Container-Titel)
                # erneut einmischen, wenn der Konverter sie anders abbildet als beim letzten
                # Deploy; eigene Visuals auch ohne gemerkten Stand (Altbestand), eingelesene
                # nur bei gemerktem, geändertem Stand (sonst bliebe ihr Format nicht stehen)
                if ck_live and action == "update" and not lossy and not ck_subs:
                    h = ck_slot_hash(slot[1])
                    old = self.ck_hashes.get(key)
                    if h and old != h and (old is not None or not vorigin):
                        changes.add("objsync")
                if action == "update" and not changes:
                    self.applied_keys.add(key)          # unverändert, nicht anfassen
                    continue
                item = self.classify(v, built, custom, slots, ck=ck_live)
                if "sync" in changes and not self.plan_sync(pw, v, item, target, existing):
                    changes.discard("sync")
                    if action == "update" and not changes:
                        self.applied_keys.add(key)
                        continue
                if item["cat"] == "ck":
                    item.update(self.plan_ck(pw, v, key, prev, target, action, existing,
                                             ck_subs, changes, diff))
                    if item.get("skip"):
                        continue
                    pw["items"].append(item)
                    continue
                if item["cat"] == "custom" and action == "update" and not vorigin:
                    res = self.plan_custom(pw, v, key, prev, target, existing, cv_subs, changes)
                    if res is None:
                        continue
                    if res:
                        item.update(res)
                        pw["items"].append(item)
                        continue
                if vorigin and item["cat"] == "custom":
                    # eingelesenes Custom Visual (GuV, Gantt, KPI-Karte …): nie durch die
                    # Konverter-visual.json ersetzen (das verwirft Bindung und Einstellungen des
                    # Berichts), nur verschieben (Demo B2, Prüfung an der Demo-Kopie)
                    asked = changes - {"rect", "sync"}
                    if asked & {"title", "bind"}:
                        self.todo("manual", "%s/%s" % (name, target),
                                  "Eingelesenes Custom Visual: %s im Kitchen geändert. Der "
                                  "Live-Helfer ersetzt eingelesene Custom Visuals nicht, bitte in "
                                  "Desktop übernehmen." % " und ".join(
                                      {"title": "Titel", "bind": "Bindung"}[c]
                                      for c in sorted(asked & {"title", "bind"})))
                    changes &= {"rect"}
                    item = {"cat": "origin", "build": None}
                    if not changes:
                        self.applied_keys.add(key)
                        continue
                if item["cat"] == "none" and vorigin and changes <= {"rect", "sync"}:
                    item = {"cat": "origin", "build": None}   # nur verschieben
                if item["cat"] == "none":
                    self.visual_not_buildable(v, key)
                    continue
                item["origin"] = bool(vorigin)
                item["diff"] = diff
                exists = target in existing if action == "update" else False
                if item["cat"] == "slot" and not vorigin:
                    target = ((prev or {}).get("id") or v["id"]) + "_slot"
                    exists = target in existing if action == "update" else False
                if exists:
                    vact = "update"
                elif vorigin or (prev is not None and action == "update"):
                    self.vres(key, "skipped",
                              "Visual %s steht nicht mehr im Bericht (in Desktop "
                              "gelöscht?), nicht neu angelegt" % target,
                              pbir={"page": pw["pageId"], "visual": target})
                    self.counts["skipped"] += 1
                    continue
                else:
                    vact = "create"
                item.update({"key": key, "target": target, "action": vact,
                             "changes": changes, "visual": v, "prev": prev})
                if vact == "update" and item["cat"] == "native":
                    rtype = existing[target].get("type")
                    want_type = item["build"]["visual_type"]
                    if rtype and want_type != rtype:
                        # Demo B9: ein vom Runner selbst angelegtes Visual (created.json bzw.
                        # letzter Stand) wird bei einem Typwechsel ersetzt (entfernen, neu
                        # anlegen); fremde Visuals bleiben, Typwechsel dort ist ein To-do
                        own_old = [] if vorigin else self.own_substitutes(
                            pw["pageId"], key, v, prev, target, existing, want_type)
                        if target in own_old:
                            item.update({"action": "create", "replace": [target],
                                         "changes": {"rect", "title", "bind", "format"},
                                         "typeChange": [rtype, want_type]})
                            pw["items"].append(item)
                            continue
                        asked = "bind" in item["changes"] or "kind" in diff
                        item["changes"].discard("bind")
                        if asked:
                            self.todo("manual", "%s/%s" % (name, target),
                                      "Visualtyp geändert (%s → %s). Das Visual stammt nicht vom "
                                      "Live-Helfer und wird nicht ersetzt: in Desktop umstellen "
                                      "oder das Visual löschen und erneut deployen."
                                      % (rtype, want_type))
                        if not self.r.is_native(rtype):
                            # fremdes Custom Visual: nur Lage und Größe (direkt geschrieben),
                            # keine nativen Formatkarten auf einem fremden Typ
                            item["changes"] &= {"rect"}
                            if not item["changes"]:
                                self.applied_keys.add(key)
                                continue
                if vact == "create" and item["cat"] == "origin":
                    continue
                pw["items"].append(item)

            if kept_rect:
                relayout_pages[name] = len(kept_rect)
                self.r.log("Seite %s: Lage aus dem Bericht behalten (Rahmen-Anpassung im "
                           "Kitchen): %s" % (name, ", ".join(map(str, kept_rect))))
            # bekannte Dauerfehler unveränderter Kacheln nicht in jedem Deploy wiederholen
            pw["items"] = [it for it in pw["items"]
                           if not (it.get("key") and self.known_failure(it, existing))]
            # --- Chrome und Slicer (aus den Zonen) --------------------------- #
            if pw["chrome"]:
                slicer_names = [i["name"] for i in self.load_out(name, "pbir-visuals.json", [])
                                if i["name"] not in {x.get("id") for x in page["visuals"]}]
                chrome = self.load_out(name, "chrome-visuals.json", [])
                chrome += [built[n] for n in slicer_names if n in built]
                for c in chrome:
                    exists = c["name"] in existing
                    pw["items"].append({"cat": "chrome", "build": c, "key": None,
                                        "target": c["name"],
                                        "action": "update" if exists else "create",
                                        "changes": {"rect", "format"}, "visual": None,
                                        "prev": None})
            plan.append(pw)

        # --- entfernt: im letzten Stand, jetzt nicht mehr im Mockup ---------- #
        for key, (pg, v) in last_vis.items():
            if key not in seen_keys:
                self.todo("removed", "%s/%s" % (pg["name"], (v.get("pbir") or {}).get("visual")
                                                or v.get("id")),
                          "Kachel „%s\" fehlt im Mockup, steht aber im Bericht. Der Runner "
                          "löscht nie: bei Bedarf in Desktop entfernen."
                          % (v.get("title") or v.get("id")))
        for pname in last_pages:
            if pname not in {p["name"] for p in nspec["pages"]}:
                self.todo("removed", pname, "Seite „%s\" fehlt im Mockup, steht aber im "
                          "Bericht. Nicht gelöscht." % pname)

        if frame_skipped:
            self.todo("manual", "frame", "Rahmen aus dem Kitchen (Kopfband, Filterbereich, "
                      "Navigation) schreibt der Runner nur auf neue Seiten. Eingelesene Seiten "
                      "behalten ihren Rahmen (%d Seite(n): %s). Bei Bedarf in Desktop übernehmen."
                      % (len(frame_skipped), short(", ".join(frame_skipped), 160)))
        if relayout_pages:
            self.todo("manual", "frame-layout", "Das Kitchen hat nach der Rahmenänderung %d "
                      "Kachel(n) auf %d eingelesenen Seite(n) in den neuen Inhaltsbereich "
                      "verschoben. Diese Seiten bekommen den Rahmen nicht, deshalb bleibt die "
                      "Lage aus dem Bericht (%s)." % (
                          sum(relayout_pages.values()), len(relayout_pages),
                          short(", ".join(relayout_pages), 160)))
        self.model_todos(nspec, raw)
        self.other_todos(nspec, last, design_changed and self.restyle_report, plan)
        n_items = sum(len(pw["items"]) for pw in plan)
        n_new = sum(1 for pw in plan if pw["action"] == "create")
        n_sync = sum(1 for pw in plan for it in pw["items"]
                     if "sync" in (it.get("changes") or ()))
        n_bg = sum(1 for pw in plan if pw["background"])
        if not report:
            return plan
        self.st.step("plan", "ok", "%s: %d Seite(n) neu, %d Element(e) zu schreiben%s%s"
                     % ("Erster Deploy (keine Basis)" if self.first
                        else "Delta gegen %s" % self.base_src, n_new, n_items,
                        ", %d Stil-Abgleich(e) gegen den Bericht" % n_sync if n_sync else "",
                        ", Seitenhintergrund auf %d Seite(n)" % n_bg if n_bg else ""))
        return plan

    def load_base(self):
        """Vergleichsbasis: die jüngere von last-applied-spec.json und baseline-spec.json
        (nach meta.exportedAt, ersatzweise Änderungszeit der Datei)."""
        cands = []
        for rank, path in enumerate((self.p.last_spec, self.p.mk / "baseline-spec.json")):
            raw = read_json(path, retries=1)
            if not isinstance(raw, dict) or not isinstance(raw.get("pages"), list):
                continue
            ts = parse_time((raw.get("meta") or {}).get("exportedAt"))
            if ts is None:
                ts = datetime.fromtimestamp(path.stat().st_mtime).astimezone()
            cands.append((ts, -rank, path, raw))   # Gleichstand: last-applied gewinnt
        if not cands:
            return None, None
        ts, _, path, raw = max(cands, key=lambda c: (c[0], c[1]))
        return raw, path.name

    # --- ChartKitchen: Referenz-Instanz ----------------------------------- #
    def find_ck_reference(self):
        """Erste ChartKitchen-Instanz im Bericht (jede Seite). Vom Menschen gesetzte
        Instanzen gehen vor den eigenen Repliken (mk_*). Wird nur gelesen."""
        hits = []
        for pg in self.report_pages:
            for name, info in sorted(self.visuals_on(pg["id"]).items()):
                if info.get("type") == CK_GUID and info.get("path"):
                    hits.append((str(name).startswith("mk_"), pg["id"], name, info["path"]))
        for _, pid, name, path in sorted(hits, key=lambda h: h[0]):
            data = read_json(Path(path) / "visual.json", retries=0)
            if isinstance(data, dict) and isinstance(data.get("visual"), dict):
                self.r.log("ChartKitchen-Referenz-Instanz: %s/%s" % (pid, name))
                return {"page": pid, "name": name, "json": data}
        return None

    # --- Dauerfehler (Demo B1/B9: keine 200 pbir-Aufrufe durch Wiederholungen) --- #
    def load_failures(self) -> dict:
        if self.fail_mem is None:
            d = read_json(self.p.failures, retries=0)
            self.fail_mem = d if isinstance(d, dict) else {}
        return self.fail_mem

    @staticmethod
    def item_sig(it: dict, existing: dict) -> str:
        """Fingerabdruck einer Kachel samt Ziel im Bericht: ändert sich die Kachel im Kitchen
        oder das Visual im Bericht (Typ, Ordner), wird ein Dauerfehler wieder versucht."""
        target = existing.get(it.get("target")) or {}
        body = {"v": vcore(it.get("visual") or {}), "type": target.get("type"),
                "action": it.get("action"), "cat": it.get("cat"),
                "replace": it.get("replace") or []}
        return hashlib.sha1(canon(body).encode("utf-8")).hexdigest()[:16]

    def known_failure(self, it: dict, existing: dict) -> bool:
        it["sig"] = self.item_sig(it, existing)
        rec = self.load_failures().get(it["key"]) or {}
        if not (rec.get("permanent") and rec.get("sig") == it["sig"]
                and int(rec.get("count") or 0) >= PERMANENT_AFTER):
            return False
        self.vres(it["key"], "error", "Nicht erneut versucht: seit Deploy %s unverändert "
                  "fehlgeschlagen (%s). Kachel im Kitchen ändern oder das Visual in Desktop "
                  "korrigieren, dann versucht der Live-Helfer es wieder." % (
                      rec.get("since") or rec.get("seq"), short(rec.get("msg") or "", 200)),
                  pbir={"visual": it.get("target")})
        self.counts["error"] += 1
        self.failed_keys.add(it["key"])
        self.mem_kept[it["key"]] = rec
        return True

    def remember_failures(self, plan: list) -> None:
        """.state/failures.json: Kacheln mit Fehler in diesem Deploy (Fingerabdruck, Meldung,
        wie oft in Folge). Einträge ohne erneuten Fehler fallen weg."""
        mem = self.load_failures()
        out = dict(self.mem_kept)
        for pw in plan:
            for it in pw["items"]:
                key = it.get("key")
                if not key or key in out or key not in self.failed_keys:
                    continue
                r = self.visuals.get(key) or {}
                if r.get("state") != "error":
                    continue
                old = mem.get(key) or {}
                sig = it.get("sig") or ""
                same = old.get("sig") == sig
                out[key] = {"sig": sig, "msg": r.get("msg"), "seq": self.seq,
                            "since": old.get("since") if same else self.seq,
                            "count": int(old.get("count") or 0) + 1 if same else 1,
                            "permanent": bool(PERMANENT_RX.search(str(r.get("msg") or "")))}
        try:
            if out or self.p.failures.is_file():
                write_json_atomic(self.p.failures, out)
        except OSError as e:
            self.r.log("failures.json nicht geschrieben: %s" % e)

    def own_substitutes(self, page_id, key, v, prev, target, existing, want_type) -> list:
        """Visuals, die der Runner selbst für diese Kachel angelegt hat und die nicht den
        gewünschten Typ haben (Platzhalter `<id>_slot`, natives Ersatzvisual `<id>`,
        ChartKitchen `cards` einer KPI-Kachel). Quelle ist .state: created.json,
        ersatzweise der letzte angewendete Stand. Nie etwas anderes."""
        if (v.get("pbir") or {}).get("visual"):
            return []
        rec = self.created.get(page_id) or {}
        out = []
        for name in (target, target + "_slot"):
            info = existing.get(name)
            if not info or info.get("type") == want_type:
                continue
            r = rec.get(name)
            if r:
                if r.get("key") == key:
                    out.append(name)
                continue
            if prev is None or (prev.get("pbir") or {}).get("visual"):
                continue
            engines = {prev.get("engine"), prev.get("engineSource")}
            if name.endswith("_slot") and name != target:
                if info.get("type") == "shape" and engines & {"ck", "deneb", "custom"}:
                    out.append(name)
            elif info.get("type") in {(prev.get("native") or {}).get("type"), CK_GUID} - {None} \
                    and engines & {"ck", "native"}:
                out.append(name)
        return out

    def plan_custom(self, pw, v, key, prev, target, existing, subs, changes):
        """Custom Visual auf einer bestehenden Seite: None = übersprungen (Fehler gemeldet),
        {} = normaler Weg, sonst Ersetzen eigener Visuals anderen Typs."""
        guid = (self.custom_index(pw["name"]).get(v["id"]) or {}).get("guid")
        etype = (existing.get(target) or {}).get("type")
        where = {"page": pw["pageId"], "visual": target}
        if etype and etype != guid and target not in subs:
            self.vres(key, "error", "Name %s ist schon durch ein %s-Visual belegt, das der "
                      "Runner nicht angelegt hat. Nicht ersetzt." % (target, etype), pbir=where)
            self.counts["error"] += 1
            self.failed_keys.add(key)
            return None
        if not subs:
            return {}
        return {"key": key, "target": target, "action": "create",
                "changes": {"rect", "title", "bind", "format"}, "visual": v, "prev": prev,
                "diff": set(), "replace": list(subs), "origin": False}

    def custom_index(self, page_name: str) -> dict:
        return {c["id"]: c for c in self.load_out(page_name, "custom-visuals.json", [])}

    def page_background_differs(self, rp: dict, nspec: dict):
        """Meldung, wenn der Seitenhintergrund im Bericht nicht dem Kitchen entspricht
        (Audit: der Hintergrund kam nie an, weil nur gegen die Basis verglichen wurde)."""
        want = self.page_color(nspec)
        if not want:
            return None
        pj = read_json(rp["dir"] / "page.json", retries=0) or {}
        bg = ((pj.get("objects") or {}).get("background") or [{}])
        props = (bg[0] or {}).get("properties") or {} if bg else {}
        have = literal_value(props.get("color"))
        transp = literal_value(props.get("transparency"))
        if have is None:
            return "Seitenhintergrund fehlt im Bericht (Kitchen %s)" % want
        if not same_value(have, want) or (isinstance(transp, float) and transp > 0):
            return "Seitenhintergrund %s im Bericht, Kitchen %s" % (have, want)
        return None

    @staticmethod
    def zones_have_frame(nspec: dict) -> bool:
        """Hat das Kitchen einen Rahmen (Kopfband, Fußleiste, Filter, Navigation)?"""
        zones = nspec.get("zones") or {}
        return any(isinstance(z, dict) and z for k, z in zones.items() if k != "content")

    @staticmethod
    def page_color(nspec: dict):
        d = nspec.get("design") or {}
        return (d.get("colors") or {}).get("pageBackground") or d.get("pageBackground")

    def plan_sync(self, pw, v, item, target, existing) -> bool:
        """Stil-Abgleich einer eingelesenen Kachel gegen den Bericht vorbereiten. True, wenn
        im Bericht etwas anders steht als im Kitchen (dann steht es in item["sync"])."""
        vis = existing.get(target)
        if not vis or not vis.get("path"):
            return False
        vj = read_json(Path(vis["path"]) / "visual.json", retries=0) or {}
        want = {}
        if item["cat"] == "native":
            sets = self.chrome_sets_for(pw["name"], v["id"])
            for k, val in sets.items():
                if k.startswith(STYLE_PREFIXES) and not same_value(container_value(vj, k), val):
                    want[k] = val
            if want:
                item["sync"] = {"set": want}
            return bool(want)
        if item["cat"] == "ck" and vis.get("type") == CK_GUID:
            slot = item["build"] or {}
            out = {}
            cont = slot.get("container") if isinstance(slot.get("container"), dict) else {}
            vco = (vj.get("visual") or {}).get("visualContainerObjects") or {}
            for obj in ("background", "border", "dropShadow"):
                src = ((cont.get(obj) or [{}])[0] or {}).get("properties") or {}
                cur = ((vco.get(obj) or [{}])[0] or {}).get("properties") or {}
                diff = {k: val for k, val in src.items()
                        if not same_value(literal_value(cur.get(k)), literal_value(val))}
                if diff:
                    out[obj] = diff
            orient = slot.get("orientation")
            have = literal_value(((((vj.get("visual") or {}).get("objects") or {}).get(
                "chart") or [{}])[0] or {}).get("properties", {}).get("orientation"))
            if orient in CK_ORIENTATIONS and have != orient:
                out["orientation"] = orient
            if out:
                item["sync"] = out
            return bool(out)
        return False

    def chrome_sets_for(self, page_name: str, vid: str) -> dict:
        """Alle `set`-Werte aus chrome-batch.json für ein Visual der Seite (Spec-Namen)."""
        cache = self.chrome_sets.setdefault(page_name, None)
        if cache is None:
            cache = {}
            prefix = "%s.Page/" % page_name
            for st in (self.load_out(page_name, "chrome-batch.json", {}) or {}).get("steps") or []:
                sel = st.get("select") or ""
                if st.get("op") == "set" and sel.startswith(prefix) and sel.endswith(".Visual"):
                    cache.setdefault(sel[len(prefix):-len(".Visual")], {}).update(
                        st.get("set") or {})
            self.chrome_sets[page_name] = cache
        return cache.get(vid) or {}

    def plan_ck(self, pw, v, key, prev, target, action, existing, subs, changes, diff):
        """Entscheidung für eine replizierte ChartKitchen-Kachel."""
        etype = (existing.get(target) or {}).get("type") if action == "update" else None
        where = {"page": pw["pageId"], "visual": target}
        if etype == CK_GUID:
            return {"key": key, "target": target, "action": "update", "changes": changes,
                    "visual": v, "prev": prev, "diff": diff, "replace": [],
                    "origin": bool((v.get("pbir") or {}).get("visual"))}
        if etype is not None and target not in subs:
            self.vres(key, "error", "Name %s ist schon durch ein %s-Visual belegt, das der "
                      "Runner nicht angelegt hat. Nicht ersetzt." % (target, etype),
                      pbir=where)
            self.counts["error"] += 1
            self.failed_keys.add(key)
            return {"skip": True}
        if etype is None and not subs and prev is not None and action == "update":
            self.vres(key, "skipped", "Visual %s steht nicht mehr im Bericht (in Desktop "
                      "gelöscht?), nicht neu angelegt" % target, pbir=where)
            self.counts["skipped"] += 1
            return {"skip": True}
        return {"key": key, "target": target, "action": "create",
                "changes": {"rect", "title", "bind", "format"}, "visual": v, "prev": prev,
                "diff": diff, "replace": list(subs), "origin": False}

    def classify(self, v, built, custom, slots, ck=False) -> dict:
        vid = v["id"]
        if ck:
            return {"cat": "ck", "build": slots[vid][1]}
        if v.get("engine") == "custom" and vid in custom:
            return {"cat": "custom", "build": custom[vid]}
        if vid in built:
            return {"cat": "native", "build": built[vid]}
        if vid in slots:
            kind, s = slots[vid]
            return {"cat": "slot", "slotKind": kind, "build": s}
        return {"cat": "none", "build": None}

    def visual_not_buildable(self, v: dict, key: str) -> None:
        missing = [f.get("ref") for fl in (v.get("roles") or {}).values()
                   for f in (fl or []) if f.get("missing")]
        warns = [w for w in (v.get("warnings") or [])]
        if missing:
            for ref in missing:
                self.todo("model", ref, "Feld fehlt im Modell (Kachel „%s\")."
                          % (v.get("title") or v["id"]))
            self.vres(key, "error", "Feld fehlt im Modell: %s" % ", ".join(missing))
            self.counts["error"] += 1
            self.failed_keys.add(key)
        elif warns:
            self.vres(key, "skipped", "; ".join(str(w) for w in warns))
            self.counts["skipped"] += 1
            self.failed_keys.add(key)
        else:
            self.vres(key, "skipped", "Kachel ohne baubares Visual (engine %s, kind %s)"
                      % (v.get("engine"), v.get("kind")))
            self.counts["skipped"] += 1
            self.failed_keys.add(key)

    def model_todos(self, nspec: dict, raw: dict) -> None:
        """Nur noch fehlende Felder; alle übrigen Modellwünsche meldet model_step als Ops
        (mit Op-ID, Befehl und Freigabeweg)."""
        fields = raw.get("fields") if isinstance(raw.get("fields"), list) else None
        for f in fields or nspec.get("fields") or []:
            if isinstance(f, dict) and f.get("missing") and not f.get("isNew"):
                self.todo("model", f.get("ref"), "Feld fehlt im Modell, ist aber nicht als "
                          "neu markiert: umbenennen, zuordnen oder anlegen.")

    def other_todos(self, nspec, last, design_changed, plan) -> None:
        if self.theme_fragment() and self.theme_info() is None and design_changed:
            self.todo("theme", "design", "Der Bericht hat kein Custom Theme. Registrieren "
                      "schreibt report.json und geht nur bei geschlossenem Desktop: einmal mit "
                      "--restart-for-theme deployen oder Desktop schließen und erneut "
                      "deployen. Bis dahin: Theme-Fragment mockup/out/theme-fragment.json.")
        if nspec.get("links") and (last is None or
                                   canon(nspec["links"]) != canon(last.get("links"))):
            self.todo("manual", "links", "Drill-through und Lesezeichen laut "
                      "mockup/out/navigation.md in Desktop prüfen bzw. einrichten.")
        filt = (nspec.get("zones") or {}).get("filter") or {}
        if (filt.get("mode") == "burger" or filt.get("collapsible")) and \
                (last is None or canon(nspec["zones"]) != canon(last["zones"])):
            self.todo("manual", "filter", "Filter-Lesezeichen (Burger/einklappbar) "
                      "stehen in mockup/out/navigation.md; Zustand in Desktop einmal "
                      "aktualisieren.")
        touched = {(it["visual"] or {}).get("id") for pw in plan for it in pw["items"]}
        inverted = {(it["visual"] or {}).get("id") for pw in plan for it in pw["items"]
                    if it["cat"] == "ck" and "invert" in ck_chart_props(it["build"])}
        for t in self.plan_json.get("todos") or []:
            if t.get("code") == "CK_INVERT" and t.get("visual") in inverted:
                continue                         # setzt der Runner selbst (chart.invert)
            if t.get("visual") in touched or t.get("code") == "SLICER_DEFAULT":
                self.todo("manual", "%s/%s" % (t.get("page"), t.get("visual")),
                          t.get("text") or t.get("code"))

    # ---------------- 5 · Backup ---------------- #
    def backup(self, keep=()) -> None:
        dst = self.p.backups / str(self.seq)
        if dst.exists():
            shutil.rmtree(dst)
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(self.p.report, dst / self.p.report.name)
        self.backup_dir = dst / self.p.report.name
        self.wrote = True
        self.r.prune(self.p.backups, keep)
        self.st.step("backup", "ok", "mockup/backup/%s" % self.seq)

    def restore(self) -> int:
        return sync_tree(self.backup_dir, self.p.report)

    # ---------------- 6 · Schreiben ---------------- #
    def write(self, plan: list, nspec: dict) -> bool:
        """Schreibt, prüft einmal mit pbir validate --fields. Gibt zurück, ob sich
        Dateien im Bericht geändert haben."""
        protected_before = self.p.protected_hashes()
        report_before = tree_hashes(self.p.report)
        cache = read_json(self.p.validate_cache, retries=0)
        if isinstance(cache, dict) and isinstance(cache.get("problems"), dict):
            baseline, base_note = cache["problems"], "Ausgangslage aus .state"
        else:
            baseline, _ = self.validate_problems()
            base_note = "Ausgangslage neu geprüft"
        try:
            for pw in plan:
                self.write_page(pw, nspec)
            self.apply_theme()
            for cmd in self.model_followups:     # Umbenennung im Modell -> Bericht nachziehen
                if cmd and cmd[0] == "pbir" and len(cmd) > 2 and cmd[1] != "validate":
                    rc, out, err = self.pbir(*cmd[1:])
                    if rc != 0:
                        self.todo("model", " ".join(cmd[1:4]), "Nach der Umbenennung im "
                                  "Modell: %s schlug fehl: %s" % (" ".join(cmd[:3]),
                                                                 short(err or out)))
            fault = os.environ.get("MK_RUNNER_FAULT")
            if fault == "write":
                raise RunnerError("Testfehler nach dem Schreiben (MK_RUNNER_FAULT)")
        except (RunnerError, Exception, KeyboardInterrupt) as e:  # noqa: BLE001
            n = self.restore()
            msg = "Schreiben abgebrochen (%s), Backup zurückgespielt (%d Datei(en))" % (
                e if isinstance(e, RunnerError) else "%s: %s" % (type(e).__name__, e), n)
            self.st.step("write", "error", msg)
            self.mark_all_failed(plan)
            if isinstance(e, KeyboardInterrupt):
                self.publish()
                self.st.finish("failed", msg)
                raise
            raise RunnerError(msg)
        n_items = sum(len(pw["items"]) for pw in plan)
        self.st.step("write", "warn" if self.counts["error"] else "ok",
                     "%d Element(e) geschrieben, %d Fehler · %d pbir-Aufrufe%s"
                     % (n_items - self.counts["error"], self.counts["error"], self.pbir_calls(),
                        " · %d Custom Visual(s) direkt in visual.json" % self.direct
                        if self.direct else ""))

        changed = tree_hashes(self.p.report) != report_before
        fault = os.environ.get("MK_RUNNER_FAULT") == "validate"
        if not changed and not fault:
            self.st.step("validate", "ok", "keine Datei geändert, nichts zu prüfen")
            return False
        after, data = self.validate_problems()
        new, foreign = [], []
        ours = self.touched_prefixes(plan)
        for sig, issue in after.items():
            if sig in baseline:
                continue
            loc = str(issue.get("location") or "")
            if not loc or any(loc == p or loc.startswith(p + "/") for p in ours):
                new.append(issue)
            else:
                foreign.append(issue)            # stammt nicht aus diesem Deploy (Desktop)
        if fault:
            new.append({"code": "TEST_FAULT", "location": "-", "message": "MK_RUNNER_FAULT"})
        protected_after = self.p.protected_hashes()
        touched = sorted(k for k in set(protected_before) | set(protected_after)
                         if protected_before.get(k) != protected_after.get(k))
        if new or touched:
            n = self.restore()
            if touched:
                what = "geschützte Datei(en) verändert: %s" % ", ".join(touched)
            else:
                what = "%d neue(r) Befund(e): %s" % (len(new), "; ".join(
                    "%s %s" % (i.get("display_location") or i.get("location"),
                               i.get("message")) for i in new[:3]))
            msg = "pbir validate --fields: %s. Backup zurückgespielt (%d Datei(en))" % (
                what, n)
            self.st.step("validate", "error", msg)
            self.mark_all_failed(plan, new)
            raise RunnerError(msg)
        self.p.state_dir.mkdir(parents=True, exist_ok=True)
        write_json_atomic(self.p.validate_cache, {"seq": self.seq, "problems": after})
        self.st.step("validate", "ok", "pbir validate --fields: %d Fehler, %d neue Befunde "
                     "(%s: %d%s)" % (len(data.get("errors") or []), 0, base_note, len(baseline),
                                     ", %d fremde Befunde nicht aus diesem Deploy"
                                     % len(foreign) if foreign else ""))
        return True

    def touched_prefixes(self, plan) -> set:
        """Orte (pageId bzw. pageId/visual), die dieser Deploy geschrieben hat."""
        out = set()
        for pw in plan:
            if not pw.get("pageId"):
                continue
            if pw["action"] == "create":
                out.add(pw["pageId"])
            for it in pw["items"]:
                out.add("%s/%s" % (pw["pageId"], it["target"]))
                for old in it.get("replace") or []:
                    out.add("%s/%s" % (pw["pageId"], old))
        return out

    def mark_all_failed(self, plan, problems=()) -> None:
        """Nach dem Zurückspielen: nichts aus diesem Lauf steht mehr im Bericht."""
        cause = {}
        for issue in problems or ():
            loc = str(issue.get("location") or "")
            cause.setdefault(loc, []).append(str(issue.get("message") or issue.get("code")))
            ref = (issue.get("details") or {}).get("field_ref")
            if ref and str(issue.get("code") or "").upper().startswith("FIELD"):
                self.todo("model", ref, "Feld fehlt im Modell (%s)." % issue.get("message"))
        for pw in plan:
            for it in pw["items"]:
                if not it["key"]:
                    continue
                why = cause.get("%s/%s" % (pw.get("pageId"), it["target"]))
                self.visuals[it["key"]] = {
                    "state": "error",
                    "msg": ("Zurückgerollt: %s" % "; ".join(dict.fromkeys(why))) if why
                    else "Zurückgerollt (Deploy fehlgeschlagen)"}
                self.failed_keys.add(it["key"])
            if pw["name"] in self.pages:
                self.pages[pw["name"]] = {"state": "error", "shot": None,
                                          "msg": "Zurückgerollt"}

    def page_path(self, pw) -> str:
        return "%s/%s.Page" % (self.p.report_arg, pw["display"])

    def write_page(self, pw: dict, nspec: dict) -> None:
        name = pw["name"]
        canvas = pw["canvas"]
        w, h = int(canvas.get("width") or 1280), int(canvas.get("height") or 720)
        if pw["action"] == "create":
            before = {pg["id"] for pg in self.report_pages}
            seed = "%s/%s.Page" % (self.p.report_arg, self.r.spec_tools.slug(name))
            rc, out, err = self.pbir("add", "page", seed, "-n", name, "-w", w, "-h", h)
            if rc != 0:
                raise RunnerError("Seite „%s\" nicht angelegt: %s" % (name, short(err or out)))
            self.load_report_pages()
            new = [pg for pg in self.report_pages if pg["id"] not in before]
            if len(new) != 1:
                raise RunnerError("Neue Seite „%s\" nicht gefunden" % name)
            pw["pageId"], pw["display"] = new[0]["id"], new[0]["displayName"]
            # `add page` legt eine Titel-Textbox an (pbir 0.9.32 hat kein --no-title,
            # obwohl die Hilfe es nennt)
            self.pbir("rm", "%s/Title.Visual" % self.page_path(pw), "-f")
            pw["existing"] = self.visuals_on(pw["pageId"], refresh=True)
            self.r.log("Seite „%s\" angelegt (%s)" % (name, pw["pageId"]))
        elif pw["chrome"]:
            rp = self.page_by_id(pw["pageId"]) or {}
            if (int(rp.get("width") or 0), int(rp.get("height") or 0)) != (w, h):
                self.pbir("pages", "resize", self.page_path(pw), "-w", w, "-h", h)

        items = pw["items"]
        # 0 · eigene Ersatz-Visuals (Platzhalter, natives Ersatzvisual) einer Kachel entfernen,
        #     die jetzt als echtes ChartKitchen-Visual repliziert wird
        removed = False
        for it in items:
            for old in it.get("replace") or []:
                rc, out, err = self.pbir("rm", "%s/%s.Visual" % (self.page_path(pw), old), "-f")
                if rc != 0 and not self.remove_own_folder(pw, old, short(err or out)):
                    self.fail_item(it, "Ersatz %s nicht entfernt: %s" % (old, short(err or out)))
                    break
                removed = True
                (self.created.get(pw["pageId"]) or {}).pop(old, None)
                self.vres(it["key"], "applied", "ersetzt %s" % old,
                          replaced=(self.visuals.get(it["key"], {}).get("replaced") or [])
                          + [old])
        if removed:
            pw["existing"] = self.visuals_on(pw["pageId"], refresh=True)
        creates = [it for it in items if it["action"] == "create"
                   and not (it["key"] and it["key"] in self.failed_keys)]
        # 1 · alles Neue in EINEM `add visual --from-json`: Chrome, native Visuals + Slicer,
        #     Text-Kacheln, danach die Hüllen (shape) für Platzhalter, Custom Visuals und
        #     replizierte ChartKitchen-Visuals
        order = {"chrome": 0, "native": 1, "slot": 2, "custom": 2, "ck": 2}
        for it in creates:
            if it["cat"] in ("slot", "custom", "ck"):
                it["fj"] = self.shell_spec(it)
        fj = sorted([it for it in creates if it["cat"] in order],
                    key=lambda it: (order[it["cat"]],
                                    1 if it["cat"] == "native" and it["build"]["visual_type"]
                                    in ("shape", "actionButton") else 0))
        self.add_from_json(pw, fj)
        # 2 · Hüllen füllen: Platzhalter-Text/To-dos, ChartKitchen-visual.json
        refreshed = False
        for it in creates:
            if it["key"] and it["key"] in self.failed_keys:
                continue
            if it["cat"] in ("slot", "custom"):
                self.after_placeholder(pw, it)
            elif it["cat"] == "ck":
                if not refreshed:
                    self.visuals_on(pw["pageId"], refresh=True)
                    refreshed = True
                self.add_ck(pw, it)
        # 3 · Seitenhintergrund (kann batch nicht)
        if pw["background"]:
            color = self.page_color(nspec)
            if color:
                rc, out, err = self.pbir("pages", "background", self.page_path(pw),
                                         "--color", color, "--transparency", "0")
                if rc != 0:
                    self.todo("manual", name, "Seitenhintergrund %s nicht gesetzt: %s"
                              % (color, short(err or out)))
        # 4 · ein Batch: Delta-Operationen + Formatierung
        self.run_batch(pw, nspec)
        # 5 · Analyse-Befehle (Sortierung, Top-N, Aktionen, Untertitel, Annotationen)
        self.run_analysis(pw)
        # 6 · Custom Visuals zuletzt: visual.json kopieren (Weg aus dem Skill)
        for it in items:
            if it["cat"] == "custom" and it["key"] not in self.failed_keys:
                self.copy_custom(pw, it)
            elif it["cat"] == "ck" and it["action"] == "update" and \
                    it["key"] not in self.failed_keys:
                self.update_ck(pw, it)
        # Ergebnisse
        rec = self.created.setdefault(pw["pageId"], {})
        for it in items:
            if not it["key"] or it["key"] in self.failed_keys:
                continue
            if it["action"] == "create":
                rec[it["target"]] = {"key": it["key"], "cat": it["cat"],
                                     "type": self.created_type(it)}
            if it["cat"] == "ck" and ck_slot_hash(it["build"] or {}):
                self.ck_hashes[it["key"]] = ck_slot_hash(it["build"] or {})
            self.applied_keys.add(it["key"])
            self.counts["created" if it["action"] == "create" else "updated"] += 1
            note = ""
            if it.get("typeChange"):
                note = "Typ gewechselt (%s → %s), eigenes Visual ersetzt" % tuple(
                    it["typeChange"])
            self.vres(it["key"], "applied", note, action="created" if it["action"] == "create"
                      else "updated", pbir={"page": pw["pageId"], "visual": it["target"]})
        if pw["action"] == "create":
            paction = "created"
        else:
            paction = "updated" if items or pw["background"] else "unchanged"
        self.pages[name] = {"state": "applied", "shot": None, "action": paction,
                            "pbir": {"page": pw["pageId"]}}

    def remove_own_folder(self, pw: dict, name: str, why: str) -> bool:
        """Rückfall, wenn `pbir rm` ein eigenes Visual nicht entfernt (z. B. Custom-Typ, den
        pbir nicht kennt): den Visual-Ordner direkt löschen (dokumentierte Ausnahme, nur für
        Visuals, die der Runner selbst angelegt hat; die Sicherung backup/<seq> liegt vor)."""
        vis = self.visuals_on(pw["pageId"], refresh=True).get(name)
        root = self.p.report / "definition" / "pages" / str(pw["pageId"]) / "visuals"
        if not vis or not vis.get("path"):
            return False
        path = Path(vis["path"])
        try:
            path.resolve().relative_to(root.resolve())
        except ValueError:
            return False
        children = [n for n, i in self.visuals_on(pw["pageId"]).items()
                    if n != name and (read_json(Path(i["path"]) / "visual.json", retries=0)
                                      or {}).get("parentGroupName") == name]
        if children:
            return False
        shutil.rmtree(path, ignore_errors=True)
        if path.exists():
            return False
        self.direct += 1
        self.r.log("pbir rm %s verweigert (%s), eigenen Visual-Ordner direkt entfernt"
                   % (name, why))
        return True

    def fail_item(self, it: dict, msg: str) -> None:
        self.failed_targets.add(it["target"])
        if it["key"]:
            if it["key"] not in self.failed_keys:
                self.counts["error"] += 1
            self.failed_keys.add(it["key"])
            self.vres(it["key"], "error", msg, pbir={"visual": it["target"]})
        else:
            self.todo("manual", it["target"], "Chrome-Element %s: %s" % (it["target"], msg))

    # --- anlegen ---------------------------------------------------------- #
    def add_from_json(self, pw: dict, items: list) -> None:
        if not items:
            return
        specs = []
        for it in items:
            spec = dict(it.get("fj") or it["build"])
            spec["name"] = it["target"]
            specs.append(spec)
        rc, out, err = self._from_json(pw, specs)
        if rc == 0:
            self.verify_created(pw, items, specs, "")
            return
        text = (out or "") + "\n" + (err or "")
        reasons = {}
        for line in text.splitlines():
            line = line.strip()
            if line.startswith("spec #") and ":" in line:
                num, _, why = line[6:].partition(":")
                if num.strip().isdigit():
                    reasons.setdefault(int(num) - 1, why.strip())
        self.r.log("from-json abgelehnt (rc %d), einzeln wiederholen. stdout: %s · stderr: %s"
                   % (rc, (out or "")[:BATCH_LOG_MAX // 4], (err or "")[:BATCH_LOG_MAX // 4]))
        present = self.visuals_on(pw["pageId"], refresh=True)
        for i, (it, spec) in enumerate(zip(items, specs)):
            if i in reasons:
                self.item_error(it, reasons[i])
                continue
            if it["target"] in present:          # pbir hat es trotz Fehler angelegt
                continue
            rc, out, err = self._from_json(pw, [spec])
            if rc != 0:
                self.item_error(it, short((out or "") + " " + (err or ""), 240))
        self.verify_created(pw, items, specs, short(text, 160))

    def verify_created(self, pw: dict, items: list, specs: list, first: str) -> None:
        """Demo B4: Steht ein neues Element danach nicht im Bericht (pbir meldet Erfolg, legt es
        aber nicht an, oder Teil-Ablehnung), im selben Deploy einmal einzeln wiederholen; bleibt
        es aus, Fehler mit pbirs Meldung statt stillem Überspringen."""
        present = self.visuals_on(pw["pageId"], refresh=True)
        for it, spec in zip(items, specs):
            if (it["key"] and it["key"] in self.failed_keys) or it["target"] in present \
                    or it["target"] in self.failed_targets:
                continue
            rc, out, err = self._from_json(pw, [spec])
            present = self.visuals_on(pw["pageId"], refresh=True)
            raw = short((out or "") + " " + (err or ""), 240)
            if it["target"] in present:
                note = "im zweiten Versuch angelegt%s" % (
                    " (erster Versuch: %s)" % first if first else "")
                self.r.log("%s: %s" % (it["target"], note))
                if it["key"]:
                    self.vres(it["key"], "ok", note)
                continue
            self.r.log("from-json %s: rc %d, stdout: %s · stderr: %s" % (
                it["target"], rc, (out or "")[:4000], (err or "")[:4000]))
            self.item_error(it, "nicht angelegt, auch nicht im zweiten Versuch: %s" % (
                raw or "pbir meldete keinen Fehler, das Visual fehlt aber im Bericht"))

    def item_error(self, it: dict, why: str) -> None:
        self.fail_item(it, "pbir add visual: %s" % why)
        if "not found in model" in why:
            ref = why.split("'")[1] if "'" in why else why
            self.todo("model", ref, "Feld fehlt im Modell (pbir hat die Kachel „%s\" "
                      "abgelehnt)." % ((it.get("visual") or {}).get("title") or it["target"]))

    def _from_json(self, pw, specs):
        fd, tmp = tempfile.mkstemp(prefix="mk-fromjson-", suffix=".json",
                                   dir=str(self.out_dir))
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            # ASCII mit \uXXXX: pbir liest die Datei unter Windows als cp1252 (Audit Deploy 4:
            # „FuÃŸleiste"); eine BOM lehnt pbir ab
            json.dump(specs, f, ensure_ascii=True, indent=2)
        try:
            return self.pbir("add", "visual", self.page_path(pw), "--from-json", tmp)
        finally:
            try:
                os.unlink(tmp)
            except OSError:
                pass

    @staticmethod
    def shell_label(it: dict) -> str:
        title = it["build"].get("title") or it["target"]
        if it["cat"] in ("custom", "ck"):
            return title
        return "%s: %s" % ("ChartKitchen" if it.get("slotKind") == "ck" else "Deneb",
                           it["build"].get("kind") or title)

    def shell_spec(self, it: dict) -> dict:
        """--from-json-Eintrag einer Hülle (shape): Ordner, Name und Seiteneintrag
        stimmen dann; Platzhalter bleiben so, Custom/ChartKitchen bekommen danach ihre
        visual.json (Weg aus dem Skill)."""
        r = (it.get("visual") or {}).get("rect") if it["cat"] == "ck" else it["build"]["rect"]
        return {"visual_type": "shape", "name": it["target"], "title": self.shell_label(it),
                "x": int(r["x"]), "y": int(r["y"]), "width": int(r["w"]), "height": int(r["h"])}

    def after_placeholder(self, pw: dict, it: dict) -> None:
        title = it["build"].get("title") or it["target"]
        label = self.shell_label(it)
        if it["cat"] == "slot":
            it["slotText"] = "%s · %s" % (label, title)
            what = "ChartKitchen-Visual" if it.get("slotKind") == "ck" else "Deneb-Visual"
            self.todo("manual", "%s/%s" % (pw["name"], it["target"]),
                      "%s in den Platzhalter setzen (Referenz-Instanz replizieren, siehe "
                      "mockup/out/commands.md)." % what)
            self.vres(it["key"], "warn", "Platzhalter angelegt, %s fehlt noch" % what)
        elif self.vis_state.get(it["build"].get("guid")) not in ("ok", "installed"):
            self.todo("manual", "%s/%s" % (pw["name"], it["target"]),
                      "Custom Visual %s: .pbiviz muss im Bericht importiert sein (%s)."
                      % (it["build"].get("visualName"), it["build"].get("pbiviz") or "?"))

    def copy_custom(self, pw: dict, it: dict) -> None:
        src = self.page_out(pw["name"]) / it["build"]["file"]
        data = read_json(src, retries=0)
        if data is None:
            self.fail_item(it, "erzeugte visual.json fehlt: %s" % src.name)
            return
        data["name"] = it["target"]
        vis = self.visuals_on(pw["pageId"], refresh=True).get(it["target"])
        if not vis or not vis.get("path"):
            self.fail_item(it, "Visualordner %s nicht gefunden" % it["target"])
            return
        dst = Path(vis["path"]) / "visual.json"
        write_json_atomic(dst, data)
        if it["action"] == "update":
            self.vres(it["key"], "warn", "Custom Visual komplett ersetzt (Position aus "
                      "dem Mockup)")

    @staticmethod
    def created_type(it: dict):
        b = it.get("build") or {}
        if it["cat"] == "ck":
            return CK_GUID
        if it["cat"] == "slot":
            return "shape"
        if it["cat"] == "custom":
            return b.get("guid")
        return b.get("visual_type")

    # --- ChartKitchen replizieren ----------------------------------------- #
    def ck_query_state(self, it: dict):
        """Spec-Rollen -> queryState mit ChartKitchen-Rollennamen.
        Gibt (queryState, nicht abbildbare Felder) zurück."""
        slot, v = it["build"], it["visual"] or {}
        kinds, unmapped, wanted = {}, [], []
        for key, fields in (v.get("roles") or {}).items():
            for f in fields or []:
                if f.get("ref"):
                    kinds.setdefault(f["ref"], f.get("kind"))
                    wanted.append((f["ref"], key))
        state = {}
        for role, refs in (slot.get("chartKitchenRoles") or {}).items():
            if role not in CK_MEASURE_ROLES and role not in CK_GROUPING_ROLES:
                unmapped += ["%s (Rolle %s)" % (r, role) for r in refs]
                continue
            limit = CK_ROLE_MAX.get(role, 1)
            projections = []
            for ref in refs:
                kind = kinds.get(ref) or ("measure" if role in CK_MEASURE_ROLES else "column")
                if role in CK_GROUPING_ROLES and kind == "measure":
                    unmapped.append("%s (Kennzahl in der Gruppierungsrolle %s)" % (ref, role))
                    continue
                if limit is not None and len(projections) >= limit:
                    unmapped.append("%s (Rolle %s nimmt max. %d Feld(er))" % (ref, role, limit))
                    continue
                projections.append(ck_projection(ref, kind, role, not projections))
            if projections:
                state[role] = {"projections": projections}
        # jedes Feld der Kachel, das in keiner Rolle gelandet ist (Rolle ohne
        # Entsprechung, Referenz ohne erkennbares Szenario, Rolle voll)
        bound = {p["queryRef"] for st in state.values() for p in st["projections"]}
        bound |= {"Sum(%s)" % r for r in list(bound)}
        for ref, key in wanted:
            if ref not in bound and "Sum(%s)" % ref not in bound and                     not any(ref in u for u in unmapped):
                unmapped.append("%s (Rolle %s)" % (ref, key))
        return state, unmapped

    def ck_container(self, it: dict) -> dict:
        """visualContainerObjects: ab Konverter 0.5.5 fertig im Slot (`container`: Fläche,
        Rahmen, Radius, Schatten; Titel/Untertitel als Text, aber aus, weil ChartKitchen
        den Kopf selbst zeichnet). Ältere Slots: Titel aus der Kachel."""
        slot = it["build"]
        if isinstance(slot.get("container"), dict):
            return copy.deepcopy(slot["container"])
        title = slot.get("title") or ""
        vco = {"title": [{"properties": {"show": lit(bool(title)), "text": lit(title)}}]}
        if "kpi" in ck_title_props(slot):
            # der Titel steht im IBCS-Kopf des Visuals (ibcsTitle.kpi); der Container-
            # Titel behält den Text (Auswahlbereich), wird aber nicht doppelt gezeigt
            for entry in vco.get("title") or []:
                entry.setdefault("properties", {})["show"] = lit(False)
        return vco

    def ck_report(self, pw, it, unmapped, what: str, warnings: bool = True) -> None:
        """Status und To-dos einer replizierten Kachel."""
        ref = "%s/%s" % (pw["name"], it["target"])
        if unmapped:
            self.vres(it["key"], "warn", "Rolle(n) ohne ChartKitchen-Entsprechung: %s"
                      % ", ".join(unmapped))
            self.todo("manual", ref, "ChartKitchen: nicht gebunden: %s. In Desktop passend "
                      "binden oder die Kachel als natives Visual bauen." % ", ".join(unmapped))
        for w in (it["build"].get("warnings") or []) if warnings else []:
            self.todo("manual", ref, "ChartKitchen: %s" % w)
        self.vres(it["key"], "applied", what)

    def ck_visual_json(self, it: dict):
        """ChartKitchen-visual.json. Ist das Visual installiert: frisch aus dem Slot
        ($schema der bekannten Version, visualType, Position, Projektionen, `objects`,
        Container). Sonst Rückfall: Referenz-Instanz kopieren ($schema, Grundschlüssel)."""
        slot = it["build"]
        use_ref = self.ck_ref is not None and not self.ck_installed
        ref = copy.deepcopy(self.ck_ref["json"]) if use_ref else {}
        rv = ref.get("visual") or {}
        r = it["visual"]["rect"]
        qs, unmapped = self.ck_query_state(it)
        doc = {"$schema": ref.get("$schema") or CK_SCHEMA, "name": it["target"],
               "position": {"x": int(r["x"]), "y": int(r["y"]),
                            "z": int(slot.get("z") or 10),
                            "width": int(r["w"]), "height": int(r["h"]), "tabOrder": 0}}
        for k, val in ref.items():               # weitere Container-Schlüssel der Referenz
            if k not in doc and k not in ("visual", "filterConfig", "parentGroupName",
                                          "isHidden", "howCreated"):
                doc[k] = val
        visual = {k: val for k, val in rv.items()
                  if k not in ("query", "objects", "visualContainerObjects", "vcObjects")}
        visual["visualType"] = rv.get("visualType") or CK_GUID
        visual["query"] = {"queryState": qs}
        visual["objects"] = ck_objects(slot)
        visual["visualContainerObjects"] = self.ck_container(it)
        visual.setdefault("drillFilterOtherVisuals", True)
        doc["visual"] = visual
        return doc, unmapped

    @staticmethod
    def _ck_obj(visual: dict, name: str) -> dict:
        """properties von visual.objects.<name>[0], bei Bedarf angelegt."""
        objs = visual.get("objects")
        if not isinstance(objs, dict):
            objs = visual["objects"] = {}
        entry = objs.get(name)
        if not isinstance(entry, list) or not entry:
            entry = objs[name] = [{"properties": {}}]
        return entry[0].setdefault("properties", {})

    def add_ck(self, pw: dict, it: dict) -> None:
        """Wie beim Custom-Visual-Weg des Skills: die Hülle (Ordner, Name) hat pbir im
        gemeinsamen --from-json angelegt, hier kommt die replizierte visual.json hinein."""
        vis = self.visuals_on(pw["pageId"]).get(it["target"])
        if not vis or not vis.get("path"):
            self.fail_item(it, "Visualordner %s nicht gefunden" % it["target"])
            return
        doc, unmapped = self.ck_visual_json(it)
        write_json_atomic(Path(vis["path"]) / "visual.json", doc)
        self.page_visuals[pw["pageId"]][it["target"]]["type"] = CK_GUID
        slot = it["build"]
        if self.ck_installed:
            objs = sorted((slot.get("objects") or {}).keys()) if isinstance(
                slot.get("objects"), dict) else []
            self.ck_report(pw, it, unmapped, "ChartKitchen angelegt (%s%s)" % (
                slot.get("orientation"), ", " + ", ".join(objs) if objs else ""))
            if not objs:
                self.todo("manual", "%s/%s" % (pw["name"], it["target"]),
                          "ChartKitchen angelegt (chart.orientation = %s), der Konverter "
                          "lieferte keine Einstellungen (objects): Δ-Basis, Einheit, "
                          "Beschriftung im Format-Bereich prüfen." % slot.get("orientation"))
            return
        self.ck_report(pw, it, unmapped, "ChartKitchen repliziert (%s)"
                       % slot.get("orientation"))
        self.todo("manual", "%s/%s" % (pw["name"], it["target"]),
                  "ChartKitchen repliziert (chart.orientation = %s). Weitere Einstellungen "
                  "(Δ-Basis, Einheit, Beschriftung, IBCS-Titel) im Format-Bereich setzen und "
                  "die Darstellung in Desktop prüfen." % slot.get("orientation"))

    def update_ck(self, pw: dict, it: dict) -> None:
        """Delta einer ChartKitchen-Kachel. Mit Slot-`objects` (Konverter 0.5.5): Kitchen-
        Einstellungen je Objekt einmischen, in Desktop gesetzte andere Eigenschaften bleiben.
        Titel nach `title`/`titleShown`. Eingelesene Visuals: Stil und Modus nur, wo der
        Bericht vom Kitchen abweicht (it["sync"]). Position lief über pbir."""
        diff, changes = it.get("diff") or set(), it["changes"]
        slot = it["build"] or {}
        has_objs = isinstance(slot.get("objects"), dict) and bool(slot.get("objects"))
        lossy = bool(((it.get("visual") or {}).get("pbir") or {}).get("lossy"))
        bind = ("bind" in changes or bool(diff & CK_BIND_DIFF)) and not lossy
        # objsync: Konverter bildet die Kachel anders ab (oder Altbestand ohne Stand):
        # Slot-Objekte und Container-Titel wie bei einer Formatänderung einmischen
        objsync = "objsync" in changes and has_objs and not lossy
        props = (bool(diff & CK_PROP_DIFF) or "format" in changes or objsync) and not lossy
        title = ("title" in changes or bool(diff & {"subtitle"}) or objsync) and not lossy
        sync = it.get("sync") or {}
        done = ["Position"] if "rect" in changes else []
        if not (bind or props or title or sync):
            self.vres(it["key"], "applied", "ChartKitchen · %s"
                      % (", ".join(done) or "unverändert"))
            return
        vis = self.visuals_on(pw["pageId"], refresh=True).get(it["target"])
        path = Path(vis["path"]) / "visual.json" if vis and vis.get("path") else None
        doc = read_json(path, retries=0) if path else None
        if not isinstance(doc, dict) or not isinstance(doc.get("visual"), dict):
            self.fail_item(it, "visual.json von %s nicht lesbar" % it["target"])
            return
        visual = doc["visual"]
        objs = visual.get("objects")
        if not isinstance(objs, dict):
            objs = visual["objects"] = {}
        vco = visual.get("visualContainerObjects")
        if not isinstance(vco, dict):
            vco = visual["visualContainerObjects"] = {}
        unmapped = []
        if bind:
            qs, unmapped = self.ck_query_state(it)
            query = visual.setdefault("query", {})
            query["queryState"] = qs
            bound = {canon(p["field"]) for st in qs.values() for p in st["projections"]}
            sort = [s for s in ((query.get("sortDefinition") or {}).get("sort") or [])
                    if canon(s.get("field")) in bound]
            if "sortDefinition" in query:
                if sort:
                    query["sortDefinition"]["sort"] = sort
                else:
                    del query["sortDefinition"]
            done.append("Bindung")
        if props and has_objs:
            changed = merge_objects(objs, slot["objects"])
            cont = slot.get("container") if isinstance(slot.get("container"), dict) else {}
            changed += ["Kachel"] if merge_objects(
                vco, {k: v for k, v in cont.items() if k in ("background", "border",
                                                             "dropShadow")}) else []
            done.append("Einstellungen (%s)" % ", ".join(changed) if changed
                        else "Einstellungen unverändert")
        elif props:
            new = ck_chart_props(slot)
            chart = objs.get("chart")
            if not isinstance(chart, list) or not chart:
                chart = objs["chart"] = [{"properties": {}}]
            cprops = chart[0].setdefault("properties", {})
            if "orientation" in new:
                cprops["orientation"] = new["orientation"]
            prev_slot_lower = ((it.get("prev") or {}).get("analysis") or {}).get(
                "polarity") == "lower"
            if "invert" in new:
                cprops["invert"] = new["invert"]
            elif prev_slot_lower and "invert" in cprops:
                cprops["invert"] = lit(False)    # Kitchen: Polarität zurückgenommen
            prev_msg = ((it.get("prev") or {}).get("analysis") or {}).get("message")
            msg = ck_title_props(slot).get("message")
            if msg or prev_msg:
                tprops = self._ck_obj(visual, "ibcsTitle")
                if msg:
                    tprops["message"] = msg
                else:
                    tprops.pop("message", None)
            done.append("Modus")
        if title:
            has_cont = isinstance(slot.get("container"), dict) and bool(slot.get("container"))
            if has_objs or has_cont:
                # Slot gewinnt: der Konverter zeigt den Kitchen-Kopf als Container-Titel und
                # schaltet ibcsTitle.show aus, außer es gibt eine Botschaft
                if has_objs:
                    merge_objects(objs, slot["objects"], only={"ibcsTitle"})
                if has_cont:
                    merge_objects(vco, {k: v for k, v in slot["container"].items()
                                        if k in ("title", "subTitle")})
            else:
                text = (it["visual"] or {}).get("title") or ""
                entry = vco.get("title")
                if not isinstance(entry, list) or not entry:
                    entry = vco["title"] = [{"properties": {}}]
                tp = entry[0].setdefault("properties", {})
                tp["text"] = lit(text)
                ibcs = self._ck_obj(visual, "ibcsTitle")
                if text.strip() and (it["visual"] or {}).get("titleShown") is not False:
                    ibcs["kpi"] = lit(text.strip())
                    tp["show"] = lit(False)      # Titel steht im IBCS-Kopf
                else:
                    ibcs.pop("kpi", None)        # leer: ChartKitchen nimmt den Feldnamen
            done.append("Titel")
        if sync:
            if sync.get("orientation"):
                chart = objs.get("chart")
                if not isinstance(chart, list) or not chart:
                    chart = objs["chart"] = [{"properties": {}}]
                chart[0].setdefault("properties", {})["orientation"] = lit(sync["orientation"])
            style = {k: [{"properties": v}] for k, v in sync.items()
                     if k in ("background", "border", "dropShadow")}
            if style:
                merge_objects(vco, style)
            done.append("Abgleich mit dem Bericht (%s)" % ", ".join(sorted(sync)))
        write_json_atomic(path, doc)
        self.ck_report(pw, it, unmapped, "ChartKitchen · %s" % ", ".join(done),
                       warnings=bind)

    # --- Gruppen ---------------------------------------------------------- #
    def _raw_visual(self, page_id: str, name: str):
        """visual.json lesen (nur lesen; Pfad liefert `pbir ls --json`)."""
        vis = self.visuals_on(page_id).get(name)
        if not vis or not vis.get("path"):
            return None
        return read_json(Path(vis["path"]) / "visual.json", retries=0)

    def _abs_rect(self, page_id: str, name: str, depth: int = 0):
        """Absolute Position wie im Kitchen-Import (pbir-import.js -> abs()):
        Kinder einer Gruppe gelten als relativ, wenn sie in die Gruppengroesse passen
        oder absolut nicht in der Gruppe liegen."""
        vj = self._raw_visual(page_id, name) or {}
        pos = vj.get("position") or {}
        r = {k: float(pos.get(src) or 0) for k, src in
             (("x", "x"), ("y", "y"), ("w", "width"), ("h", "height"))}
        parent = vj.get("parentGroupName")
        if not parent or depth > 20:
            return r, None, False
        pj = self._raw_visual(page_id, parent) or {}
        ppos = pj.get("position") or {}
        prel = {"w": float(ppos.get("width") or 0), "h": float(ppos.get("height") or 0)}
        pr, _, _ = self._abs_rect(page_id, parent, depth + 1)
        rel_fits = r["x"] + r["w"] <= prel["w"] + 2 and r["y"] + r["h"] <= prel["h"] + 2
        abs_fits = (r["x"] >= pr["x"] - 2 and r["y"] >= pr["y"] - 2
                    and r["x"] + r["w"] <= pr["x"] + pr["w"] + 2
                    and r["y"] + r["h"] <= pr["y"] + pr["h"] + 2)
        relative = rel_fits or not abs_fits
        if relative:
            r = dict(r, x=r["x"] + pr["x"], y=r["y"] + pr["y"])
        return r, pr, relative

    def to_group_coords(self, page_id: str, name: str, x, y):
        """Absolute Kitchen-Position -> PBIR-Position (relativ zur Gruppe, falls dort so)."""
        vj = self._raw_visual(page_id, name) or {}
        parent = vj.get("parentGroupName")
        if not parent:
            return x, y, None
        _, pr, relative = self._abs_rect(page_id, name)
        if relative and pr:
            return x - pr["x"], y - pr["y"], parent
        return x, y, None

    # --- Batch ------------------------------------------------------------ #
    def run_batch(self, pw: dict, nspec: dict) -> None:
        name = pw["name"]
        spec_prefix = "%s.Page/" % name
        rep_prefix = "%s.Page/" % pw["display"]
        steps, owner = [], {}

        def add(step, it):
            step["continue_on_error"] = True
            step["id"] = "s%d" % (len(steps) + 1)
            owner[step["id"]] = it
            steps.append(step)

        present = self.visuals_on(pw["pageId"], refresh=True)
        live = [it for it in pw["items"] if not (it["key"] and it["key"] in self.failed_keys)
                and it["target"] in present]
        # Delta-Operationen für vorhandene Visuals
        for it in live:
            if it["action"] != "update" or it["cat"] == "custom":
                continue
            sel = rep_prefix + "%s.Visual" % it["target"]
            b = it["build"] or {}
            if it.get("visual") and isinstance(it["visual"].get("rect"), dict):
                r = it["visual"]["rect"]              # Kitchen: absolute Seitenkoordinaten
                x, y, wd, ht = r["x"], r["y"], r["w"], r["h"]
            elif it["cat"] == "slot":
                r = b["rect"]
                x, y, wd, ht = r["x"], r["y"], r["w"], r["h"]
            else:
                x, y, wd, ht = b["x"], b["y"], b["width"], b["height"]
            if "rect" in it["changes"]:
                x, y, grp = self.to_group_coords(pw["pageId"], it["target"], x, y)
                if grp and it["key"]:
                    self.vres(it["key"], "ok", "in Gruppe %s: Position relativ zur Gruppe "
                              "geschrieben" % grp)
                add({"op": "move", "select": sel, "x": int(x), "y": int(y)}, it)
                add({"op": "resize", "select": sel, "width": int(wd), "height": int(ht)}, it)
            if "title" in it["changes"] and it["cat"] == "native":
                vis = it.get("visual") or {}
                text = vis.get("title") if "titleShown" in vis else b.get("title")
                if vis.get("titleShown") is False or ("titleShown" in vis and not text):
                    add({"op": "set", "select": sel, "set": {"title.show": False}}, it)
                elif text:
                    tset = {"title.text": text}
                    if vis.get("titleShown") is True:
                        tset["title.show"] = True
                    add({"op": "set", "select": sel, "set": tset}, it)
            if (it.get("sync") or {}).get("set") and it["cat"] == "native":
                # eingelesenes Visual: Kitchen-Stil, wo der Bericht anders aussieht
                add({"op": "set", "select": sel, "set": dict(it["sync"]["set"])}, it)
            if "bind" in it["changes"] and it["cat"] == "native":
                fields = b.get("fields") or {}
                old = ((it.get("prev") or {}).get("native") or {}).get("buckets") or {}
                clear = sorted(set(fields) | set(old))
                if clear:
                    add({"op": "bind", "select": sel, "clear": clear}, it)
                adds = []
                for bucket, refs in fields.items():
                    for ref in (refs if isinstance(refs, list) else [refs]):
                        adds.append("%s:%s" % (bucket, ref))
                if adds:
                    add({"op": "bind", "select": sel, "add": adds}, it)
        # Formatierung aus chrome-batch.json für neue und geaenderte Elemente
        fmt = {}
        for it in live:
            if it["cat"] in ("ck", "custom"):
                # pbir kennt die Formatkarten der Custom Visuals nicht; ihre visual.json bringt
                # Container-Stil und Titel aus dem Konverter mit (copy_custom, update_ck)
                continue
            if it["action"] == "create" or "format" in it["changes"] or it["cat"] == "chrome":
                vid = (it.get("visual") or {}).get("id") or it["target"]
                fmt[vid] = it
        chrome_batch = self.load_out(name, "chrome-batch.json", {}) or {}
        for s in chrome_batch.get("steps") or []:
            sel = s.get("select") or ""
            if not sel.startswith(spec_prefix) or not sel.endswith(".Visual"):
                continue
            vid = sel[len(spec_prefix):-len(".Visual")]
            it = fmt.get(vid)
            if not it:
                continue
            step = {k: v for k, v in s.items() if k not in ("id", "continue_on_error")}
            step["select"] = rep_prefix + "%s.Visual" % it["target"]
            if it.get("origin") and step.get("op") == "set":
                # eingelesene Visuals behalten ihren Container-Stil und ihre Ebene;
                # nur Texte und Schrift aus der Kachel übernehmen
                keep = {k: v for k, v in (step.get("set") or {}).items()
                        if not k.startswith(ORIGIN_KEEP_PREFIXES)}
                if not keep:
                    continue
                step["set"] = keep
            add(step, it)
        for it in live:
            if it["cat"] == "slot" and it.get("slotText"):
                add({"op": "set", "select": rep_prefix + "%s.Visual" % it["target"],
                     "set": dict(SLOT_LOOK, **{"text.default.text": it["slotText"]})}, it)
        # Demo B1: pbir batch nur für Visualtypen, die pbir kennt (native Visuals, Shapes,
        # Slicer). Custom Visuals (ChartKitchen, KPI-Karte, Gantt, GuV, jede GUID): Lage, Größe
        # und Container-Stil direkt in visual.json (dokumentierte Ausnahme, wie beim Anlegen)
        native_steps, direct = [], {}
        for st in steps:
            it = owner[st["id"]]
            vtype = (present.get(it["target"]) or {}).get("type")
            if self.r.is_native(vtype):
                native_steps.append(st)
            else:
                direct.setdefault(it["target"], (it, []))[1].append(st)
        for target, (it, ops) in direct.items():
            self.write_direct(pw, it, ops)
        steps = native_steps
        if not steps:
            return
        batch = {"version": 2, "name": "mockup live %s · %s" % (self.seq, name),
                 "root": self.p.report_arg, "stop_on_error": False, "steps": steps}
        path = self.page_out(name) / "live-batch.json"
        write_json_atomic(path, batch, ascii_only=True)
        rc, out, err = self.pbir("batch", "run", str(path), "--root", self.p.report_arg,
                                 "--json")
        res = parse_json_output(out)
        bad = res is None or rc != 0 or any(s.get("status") != "ok"
                                            for s in (res or {}).get("steps") or [])
        if bad:                                  # Rohausgabe ins Protokoll (Demo B1)
            self.r.log("pbir batch run %s (Seite %s) mit Fehler, rc %d\nstdout:\n%s\nstderr:\n%s"
                       % (path.name, name, rc, (out or "")[:BATCH_LOG_MAX],
                          (err or "")[:BATCH_LOG_MAX // 4]))
        if res is None:
            why = short(err or out) or "keine Ausgabe (rc %d)" % rc
            for it in {id(i): i for i in owner.values()
                       if any(owner.get(s["id"]) is i for s in steps)}.values():
                self.fail_item(it, "pbir batch: %s" % why)
            return
        for s in res.get("steps") or []:
            it = owner.get(s.get("id"))
            if not it:
                continue
            if s.get("status") != "ok":
                self.fail_item(it, "pbir batch %s: %s" % (s.get("op"),
                                                          short(batch_step_error(s, res), 240)))
            elif s.get("target_count") == 0:
                self.fail_item(it, "pbir batch %s: Visual %s nicht gefunden"
                               % (s.get("op"), it["target"]))

    def write_direct(self, pw: dict, it: dict, ops: list) -> None:
        """move/resize/set eines Custom Visuals direkt in visual.json (Demo B1). Prüft die
        Seitengrenzen wie pbir; `set` nur für Container-Objekte (title, background, border,
        dropShadow …), andere Formatkarten gehören zum nativen Typ und gelten hier nicht."""
        vis = self.visuals_on(pw["pageId"]).get(it["target"])
        path = Path(vis["path"]) / "visual.json" if vis and vis.get("path") else None
        doc = read_json(path, retries=1) if path else None
        if not isinstance(doc, dict):
            self.fail_item(it, "visual.json von %s nicht lesbar" % it["target"])
            return
        pos = doc.get("position") if isinstance(doc.get("position"), dict) else {}
        before = canon(doc)
        conts = self.r.container_objects()
        skipped, done = [], []
        for op in ops:
            kind = op.get("op")
            if kind == "move":
                pos["x"], pos["y"] = int(op["x"]), int(op["y"])
                done.append("Lage")
            elif kind == "resize":
                pos["width"], pos["height"] = int(op["width"]), int(op["height"])
                done.append("Größe")
            elif kind == "set":
                for key, val in (op.get("set") or {}).items():
                    comp, _, prop = str(key).partition(".")
                    if comp not in conts or not prop or "." in prop:
                        skipped.append(key)
                        continue
                    visual = doc.setdefault("visual", {})
                    vco = visual.get("visualContainerObjects")
                    if not isinstance(vco, dict):
                        vco = visual["visualContainerObjects"] = {}
                    entries = vco.get(comp)
                    if not isinstance(entries, list) or not entries or \
                            not isinstance(entries[0], dict):
                        entries = vco[comp] = [{"properties": {}}]
                    entries[0].setdefault("properties", {})[prop] = container_literal(prop, val)
                    done.append(key)
            else:
                skipped.append(kind)
        doc["position"] = pos
        if not doc.get("parentGroupName"):
            rp = self.page_by_id(pw["pageId"]) or {}
            pgw = float(rp.get("width") or (pw.get("canvas") or {}).get("width") or 0)
            pgh = float(rp.get("height") or (pw.get("canvas") or {}).get("height") or 0)
            x, y = float(pos.get("x") or 0), float(pos.get("y") or 0)
            w, h = float(pos.get("width") or 0), float(pos.get("height") or 0)
            over = []
            if pgw and x + w > pgw + 0.5:
                over.append("x(%g) + width(%g) = %g > page.width(%g)" % (x, w, x + w, pgw))
            if pgh and y + h > pgh + 0.5:
                over.append("y(%g) + height(%g) = %g > page.height(%g)" % (y, h, y + h, pgh))
            if x < 0 or y < 0:
                over.append("negative Lage (%g, %g)" % (x, y))
            if over:
                self.fail_item(it, "Visual überschreitet die Seite: %s (nicht geschrieben)"
                               % "; ".join(over))
                return
        if skipped:
            self.r.log("%s (%s): nicht übertragen, gilt nur für native Visuals: %s"
                       % (it["target"], (vis or {}).get("type"), ", ".join(sorted(set(skipped)))))
        if canon(doc) != before:
            write_json_atomic(path, doc)
            self.direct += 1
            self.r.log("%s (%s) direkt geschrieben: %s" % (
                it["target"], (vis or {}).get("type"), ", ".join(dict.fromkeys(done))))

    # --- Analyse ---------------------------------------------------------- #
    def run_analysis(self, pw: dict) -> None:
        path = self.page_out(pw["name"]) / "analysis-commands.sh"
        if not path.exists():
            return
        spec_page = "%s/%s.Page" % (self.p.report_arg, pw["name"])
        rep_page = self.page_path(pw)
        by_vid = {}
        for it in pw["items"]:
            if it["key"] and it["key"] in self.failed_keys:
                continue
            if it["action"] == "create" or "format" in it["changes"] or it["cat"] == "chrome":
                by_vid[(it.get("visual") or {}).get("id") or it["target"]] = it
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line.startswith("pbir ") or any(t in line for t in ("&&", "||", "|", "$(", ";")):
                continue
            try:
                argv = shlex.split(line, posix=True)
            except ValueError:
                continue
            vid, idx = None, None
            for i, tok in enumerate(argv):
                if tok.startswith(spec_page + "/") and ".Visual" in tok:
                    vid = tok[len(spec_page) + 1:].split(".Visual")[0]
                    idx = i
                    break
            it = by_vid.get(vid) if vid else None
            if not it:
                continue
            if it["cat"] == "ck":
                # für das native Ersatzvisual gedacht; ChartKitchen regelt das selbst
                self.todo("manual", "%s/%s" % (pw["name"], it["target"]),
                          "ChartKitchen: nicht übertragen, im Format-Bereich einstellen: %s"
                          % " ".join(argv[1:4]))
                continue
            if it["action"] == "update" and argv[1] == "add":
                # add filter/annotation würde beim zweiten Lauf doppeln
                self.todo("manual", "%s/%s" % (pw["name"], it["target"]),
                          "Nicht wiederholt (würde doppeln): %s" % " ".join(argv[1:4]))
                continue
            argv[idx] = argv[idx].replace(spec_page + "/" + vid + ".Visual",
                                          rep_page + "/" + it["target"] + ".Visual", 1)
            rc, out, err = self.pbir(*argv[1:])
            if rc != 0:
                msg = "%s: %s" % (" ".join(argv[1:3]), short(err or out, 160))
                if it["key"]:
                    self.vres(it["key"], "warn", msg)
                else:
                    self.todo("manual", it["target"], msg)

    # ---------------- 7 · Stand sichern ---------------- #
    def save_state(self, raw: dict, nspec: dict) -> None:
        """Nur was jetzt im Bericht steht, wird als angewendet gemerkt."""
        last_raw = self.base_raw
        prev = {}
        if isinstance(last_raw, dict):
            for pg in last_raw.get("pages") or []:
                for v in pg.get("visuals") or []:
                    prev[vkey(v)] = v
        state = copy.deepcopy(raw)
        for pg in state.get("pages") or []:
            keep = []
            for v in pg.get("visuals") or []:
                k = vkey(v)
                if k in self.failed_keys or k not in self.applied_keys:
                    if k in prev:
                        keep.append(prev[k])          # alter Stand: nächster Lauf probiert neu
                    continue
                keep.append(v)
            pg["visuals"] = keep
        self.p.state_dir.mkdir(parents=True, exist_ok=True)
        write_json_atomic(self.p.last_spec, state)
        page_map = read_json(self.p.state_dir / "page-map.json", retries=0) or {}
        for page in nspec["pages"]:
            res = self.pages.get(page["name"]) or {}
            pid = (res.get("pbir") or {}).get("page")
            if page.get("id") and pid:
                page_map[page["id"]] = pid
        write_json_atomic(self.p.state_dir / "page-map.json", page_map)
        write_json_atomic(self.p.created, {pid: rec for pid, rec in self.created.items() if rec})
        if getattr(self, "ck_hashes", None):
            write_json_atomic(self.p.state_dir / "ck-objects.json", self.ck_hashes)

    # ---------------- 8 · Reload + Screenshots ---------------- #
    def reload(self, changed: bool = True, model: bool = False) -> bool:
        if self.opt.no_bridge:
            self.st.step("reload", "skipped", "--no-bridge")
            if model:
                self.todo("manual", "reload", "Modell geändert: in Desktop neu laden "
                          "(pbir desktop reload --model).")
            return False
        if not changed and not model:
            self.st.step("reload", "skipped", "keine Datei im Bericht geändert")
            return False
        if self.no_reload:
            self.st.step("reload", "skipped", "ohne Neuladen gewählt: das Ungespeicherte in "
                         "Desktop bleibt, Desktop zeigt den alten Stand")
            self.todo("manual", "reload", "Deploy %s ist geschrieben, aber Desktop nicht neu "
                      "geladen (deine ungespeicherten Änderungen bleiben). Speichern in Desktop "
                      "überschreibt den Deploy; zum Anzeigen in Desktop neu laden bzw. erneut "
                      "deployen." % self.seq)
            return False
        ok, how, model_done = self.desk.reload(self.r.pid, model=model)
        if ok:
            self.set_reload_marker(self.r.pid)   # „ungespeichert" stammt ab jetzt von uns
        with self.st.lock:
            self.st.doc["desktop"]["reloaded"] = ok
            if model:
                self.st.doc["desktop"]["modelReloaded"] = bool(ok and model_done)
        self.st.step("reload", "ok" if ok and (model_done or not model) else "warn",
                     ("Desktop neu geladen (%s)" % how) if ok else
                     "Reload fehlgeschlagen: %s. Dateien sind geschrieben, Desktop zeigt "
                     "den alten Stand bis zum nächsten Reload." % how)
        if not ok:
            self.todo("manual", "reload", "Desktop neu laden (Reload ging nicht).")
        elif model and not model_done:
            self.todo("manual", "reload", "Modell geändert, aber nicht neu geladen: in "
                      "Desktop `pbir desktop reload --model` bzw. „Änderungen übernehmen“.")
        return ok

    # --- Seitenfläche je Desktop-Sitzung merken (Demo B5) -------------------- #
    @staticmethod
    def canvas_key(img_w, img_h, page_w, page_h) -> str:
        return "%dx%d|%gx%g" % (int(img_w), int(img_h), float(page_w), float(page_h))

    def canvas_memory(self) -> dict:
        """.state/canvas.json {pid, entries: {"<Bild>|<Seite>": {box, at, seq}}}: gilt nur für
        dieselbe Desktop-Instanz (pid), ein neues Desktop beginnt leer."""
        mem = getattr(self, "_canvas", None)
        if mem is None or str(mem.get("pid")) != str(self.r.pid):
            d = read_json(self.p.canvas_mem, retries=0)
            if not isinstance(d, dict) or str(d.get("pid")) != str(self.r.pid) or \
                    not isinstance(d.get("entries"), dict):
                d = {"pid": self.r.pid, "entries": {}}
            mem = self._canvas = d
        return mem

    def canvas_hint(self, page_w, page_h):
        mem = self.canvas_memory()

        def hint(img_w, img_h):
            e = mem["entries"].get(self.canvas_key(img_w, img_h, page_w, page_h))
            return e.get("box") if isinstance(e, dict) else None
        return hint

    def canvas_learn(self, res, page_w, page_h) -> None:
        """Nur sichere Erkennungen merken (how „erkannt", reliable)."""
        if not isinstance(res, dict) or res.get("how") != "erkannt" or \
                not res.get("reliable", True) or not res.get("img") or not res.get("box"):
            return
        try:
            mem = self.canvas_memory()
            key = self.canvas_key(res["img"][0], res["img"][1], page_w, page_h)
        except (TypeError, ValueError):
            return
        if (mem["entries"].get(key) or {}).get("box") != list(res["box"]):
            mem["entries"][key] = {"box": list(res["box"]), "at": now_iso(), "seq": self.seq}
            try:
                self.p.state_dir.mkdir(parents=True, exist_ok=True)
                write_json_atomic(self.p.canvas_mem, mem)
            except OSError as e:
                self.r.log("canvas.json nicht geschrieben: %s" % e)

    def shots(self, reloaded: bool, plan: list) -> None:
        """Bilder nur für Seiten, die dieser Deploy geschrieben hat (`screenshot <page-id>`
        je Seite); unberührte Seiten behalten das Bild des letzten Deploys. Seiten ganz ohne
        Bild kommen dazu, solange das Zeitbudget (--shot-budget) reicht (Demo B5). Je Seite
        höchstens --shot-wait Sekunden aufs Zeichnen warten (Vorgabe 8)."""
        prev = (read_json(self.p.applied, retries=0) or {}).get("pages") or {}
        touched, noimg = [], []
        for pw in plan:
            res = self.pages.get(pw["name"])
            if res is None or res.get("state") != "applied":
                continue
            if pw["action"] == "create" or res.get("action") == "updated":
                touched.append(pw)
                continue
            shot = (prev.get(pw["name"]) or {}).get("shot")
            if shot and (self.p.mk / shot).is_file():
                res["shot"] = shot
                sp = (prev.get(pw["name"]) or {}).get("shotPage")
                if sp and (self.p.mk / sp).is_file():
                    res["shotPage"] = sp
            elif pw.get("pageId"):
                noimg.append(pw)
        if self.opt.no_bridge or not reloaded:
            self.st.step("shots", "skipped", "--no-bridge" if self.opt.no_bridge else
                         "ohne Reload keine neuen Bilder, %d Seite(n) mit Bild vom letzten "
                         "Deploy" % sum(1 for r in self.pages.values() if r.get("shot")))
            self.r.prune(self.p.shots, self.shot_dirs())
            return
        out = self.p.shots / str(self.seq)
        if out.exists():
            shutil.rmtree(out, ignore_errors=True)
        out.mkdir(parents=True, exist_ok=True)
        time.sleep(0.3)                          # kurz setzen lassen nach dem Reload
        ok, fails, waits, still_blank, not_cropped = 0, [], [], [], []
        unsure, later = [], []
        cap = max(0.0, float(self.opt.shot_wait))
        budget = max(0.0, float(getattr(self.opt, "shot_budget", SHOT_BUDGET_DEFAULT)))
        t_all = time.time()
        t_extra = None                           # Beginn der Seiten ohne Bild
        for pw in touched + noimg:
            extra = pw not in touched
            if extra:
                t_extra = t_extra or time.time()
                if budget <= 0 or time.time() - t_extra >= budget:
                    later.append(pw["name"])
                    continue
            target = out / ("%s.png" % safe_file_name(pw["display"] or pw["name"]))
            # Custom Visuals (ChartKitchen, Deneb) zeichnen erst Sekunden nach dem Reload:
            # Bilder wiederholen, bis die Seite stabil ist und keine Kachel mehr leer ist
            canvas = pw.get("canvas") or {}
            rp = self.page_by_id(pw.get("pageId")) or {}
            pw_w = rp.get("width") or canvas.get("width") or 1280
            pw_h = rp.get("height") or canvas.get("height") or 720
            hint = self.canvas_hint(pw_w, pw_h)
            tiles = {vkey(v): {"rect": v.get("rect"), "kind": v.get("kind"),
                               "label": v.get("title") or v.get("label") or v.get("kind")}
                     for v in (pw.get("page") or {}).get("visuals") or []}
            capture = (lambda pw=pw, target=target: self.desk.screenshot(
                pw["pageId"], pw["display"] or pw["name"], target, self.opt.scale, self.r.pid))
            if cap <= 0:                         # Warten abgeschaltet: ein Bild, keine Prüfung
                path, err = capture()
                res = {"path": path, "err": err, "tries": 1, "waited": 0.0, "stable": False,
                       "blank": [], "note": "", "canvas": None}
            else:
                res = TC.wait_for_render(capture, pw_w, pw_h, tiles, max_wait=cap, hint=hint)
            path, err = res["path"], res["err"]
            if not path:
                fails.append("%s: %s" % (pw["name"], err))
                continue
            self.r.log("Seite %s: Bild nach %.1f s (%d Aufnahme(n)%s%s%s)" % (
                pw["name"], res["waited"], res["tries"], ", stabil" if res["stable"] else "",
                ", ohne Bild bisher" if extra else "",
                ", " + res["note"] if res["note"] else ""))
            self.canvas_learn(res.get("canvas"), pw_w, pw_h)
            if res["tries"] > 1:
                waits.append("%s %.1f s" % (pw["name"], res["waited"]))
            if res["blank"]:
                still_blank.append("%s: %s" % (pw["name"], ", ".join(
                    str(tiles[k]["label"]) for k in res["blank"])))
            try:
                rel = Path(path).resolve().relative_to(self.p.mk.resolve()).as_posix()
            except ValueError:
                rel = path
            self.pages[pw["name"]]["shot"] = rel
            # zugeschnittene Seite in PBIR-Seitengröße (Kitchen: Overlay, Schieber, Verlauf)
            try:
                crop = TC.crop_page(path, pw_w, pw_h, Path(path).with_name(
                    Path(path).stem + ".page.png"), hint=hint)
            except Exception as e:               # noqa: BLE001 - Zugabe, nie den Deploy kosten
                crop = {"ok": False, "note": "%s: %s" % (type(e).__name__, e)}
            if crop.get("ok"):
                self.canvas_learn(crop, pw_w, pw_h)
                try:
                    self.pages[pw["name"]]["shotPage"] = Path(crop["path"]).resolve() \
                        .relative_to(self.p.mk.resolve()).as_posix()
                except ValueError:
                    self.pages[pw["name"]]["shotPage"] = crop["path"]
                if crop.get("clipped"):
                    self.pages[pw["name"]]["shotClipped"] = crop.get("visible")
                if crop.get("reliable") is False:
                    self.pages[pw["name"]]["shotPageReliable"] = False
                    unsure.append(pw["name"])
            else:
                not_cropped.append("%s: %s" % (pw["name"], crop.get("note")))
            ok += 1
        total = time.time() - t_all
        self.r.prune(self.p.shots, self.shot_dirs())
        state = "ok" if not fails else ("warn" if ok else "error")
        if still_blank and state == "ok":
            state = "warn"
        kept = sum(1 for pw in plan if pw not in touched and pw not in noimg
                   and (self.pages.get(pw["name"]) or {}).get("shot"))
        n_extra = sum(1 for pw in noimg if pw["name"] not in later
                      and (self.pages.get(pw["name"]) or {}).get("shot"))
        self.r.log("Bilder: %d Seite(n) in %.1f s (je Seite höchstens %s s, davon %d ohne Bild "
                   "bisher%s)" % (ok, total, fmt_num(cap), n_extra,
                                  ", %d auf später" % len(later) if later else ""))
        with self.st.lock:
            self.st.doc["shotsMs"] = int(round(total * 1000))
        self.st.step("shots", state, "%d Seite(n) neu in %s s%s%s%s%s%s%s%s" % (
            ok, fmt_num(total),
            ", davon %d bisher ohne Bild" % n_extra if n_extra else "",
            ", %d unverändert vom letzten Deploy" % kept if kept else "",
            ", %d ohne Bild auf den nächsten Deploy verschoben (Zeitbudget %s s)" % (
                len(later), fmt_num(budget)) if later else "",
            ", Render abgewartet: " + ", ".join(waits) if waits else "",
            ", nach %s s noch leer: %s" % (fmt_num(cap), "; ".join(still_blank))
            if still_blank else "",
            ", Seitenfläche unsicher (gemerktes Rechteck): " + ", ".join(unsure)
            if unsure else "",
            ", nicht zugeschnitten: " + "; ".join(not_cropped) if not_cropped else "",
        ) + ((", Fehler: " + "; ".join(fails)) if fails else ""))

    # ---------------- 9 · Bildvergleich Kitchen gegen Desktop ---------------- #
    def compare(self) -> None:
        """kitchen/<seq>/tiles.json (vom Kitchen beim Deploy) gegen die Desktop-Bilder:
        je Kachel score 0..1 und Befunde in visuals[id].diff (CONTRACT.md)."""
        kdir = self.p.kitchen / str(self.kseq)
        tj_path = kdir / "tiles.json"
        if not any(r.get("shot") for r in self.pages.values()):
            self.st.step("compare", "skipped", "keine Desktop-Bilder")
            return
        wait = float(self.opt.compare_wait)
        client = str(self.req.get("client") or "")
        m = re.search(r"MockupKitchen\s+(\d+(?:\.\d+)+)", client)
        expects = kdir.is_dir() or (m and version_tuple(m.group(1)) >= (0, 5, 5)
                                    and self.kseq == self.seq)
        deadline = time.time() + (wait if expects else 0)
        tj = None
        while True:
            tj = read_json(tj_path, retries=1) if tj_path.is_file() else None
            if isinstance(tj, dict) or time.time() >= deadline:
                break
            time.sleep(0.5)
        if not isinstance(tj, dict):
            self.st.step("compare", "skipped", "kein Kitchen-Bild für seq %s (%s)" % (
                self.kseq, "nach %.0f s" % wait if expects else "Kitchen ohne Vergleichsbild"))
            return
        nfc = lambda x: unicodedata.normalize("NFC", str(x or ""))   # noqa: E731
        res_by_page = {nfc(n): r for n, r in self.pages.items()}
        scores, low, notes_pages, slow, no_canvas, unsure = [], 0, [], [], [], []
        decoders = set()
        for pg in tj.get("pages") or []:
            res = res_by_page.get(nfc(pg.get("name")))
            shot = (res or {}).get("shot")
            kpng = self.p.mk / (pg.get("png") or "kitchen/%s/%s" % (self.kseq, pg.get("file")))
            if not shot or not kpng.is_file() or not (self.p.mk / shot).is_file():
                notes_pages.append("%s: %s fehlt" % (pg.get("name"), "Desktop-Bild" if not shot
                                                     else "Bild"))
                continue
            tiles = {k: t for k, t in (tj.get("tiles") or {}).items()
                     if nfc(t.get("page")) == nfc(pg.get("name"))}
            if not tiles:
                continue
            try:
                out = TC.compare_page(kpng, self.p.mk / shot, pg.get("width"), pg.get("height"),
                                      tiles, hint=self.canvas_hint(pg.get("width"),
                                                                   pg.get("height")))
            except Exception as e:               # noqa: BLE001 - Vergleich ist Zugabe
                notes_pages.append("%s: %s" % (pg.get("name"), e))
                continue
            self.canvas_learn(out.get("canvas"), pg.get("width"), pg.get("height"))
            decoders.add(out["decoder"])
            if out["ms"] > 2000:
                slow.append("%s %.1f s" % (pg.get("name"), out["ms"] / 1000.0))
            # Desktop-Bilder zeigen die Berichtsansicht (Seite verkleinert auf dem Arbeits-
            # flächen-Hintergrund, Filterbereich rechts). Ist die Seitenfläche darin nicht
            # sicher zu finden, wird nicht gewertet (sonst Scores aus falsch zugeordneten Pixeln)
            if not out.get("ok", True) or not out["tiles"]:
                no_canvas.append("%s: %s" % (pg.get("name"), out.get("note") or "kein Ergebnis"))
                continue
            res["compare"] = {"score": round(sum(r["score"] for r in out["tiles"].values())
                                             / len(out["tiles"]), 3), "ms": out["ms"]}
            canvas = out.get("canvas") or {}
            if canvas.get("how") in ("erkannt", "gemerkt"):
                res["compare"]["canvas"] = canvas.get("box")
            if out.get("reliable") is False:     # Demo B5: gemerktes Rechteck, unsicher
                res["compare"]["reliable"] = False
                res["compare"]["canvasHow"] = canvas.get("how")
                unsure.append(pg.get("name"))
            if out.get("hidden"):                # Seite im Bild unten abgeschnitten
                notes_pages.append("%s: %s" % (pg.get("name"), out.get("note")))
            for key, r in out["tiles"].items():
                diff = {"score": r["score"], "notes": r["notes"]}
                if r.get("reliable") is False:
                    diff["reliable"] = False
                if key in self.visuals:
                    self.visuals[key]["diff"] = diff
                else:                            # nicht angefasst: nur der Bildvergleich
                    self.visuals[key] = {"state": "ok", "msg": "unverändert", "diff": diff}
                scores.append(r["score"])
                low += r["score"] < 0.7
        if not scores:
            if no_canvas:
                self.st.step("compare", "warn", "nicht gewertet: %s" % "; ".join(
                    no_canvas + notes_pages))
                return
            self.st.step("compare", "skipped", "nichts zu vergleichen%s" % (
                ": " + "; ".join(notes_pages) if notes_pages else ""))
            return
        msg = "%d Kachel(n) verglichen, Mittel %d %%, %d unter 70 %%" % (
            len(scores), round(100 * sum(scores) / len(scores)), low)
        if no_canvas:
            msg += " · nicht gewertet: " + "; ".join(no_canvas)
        if unsure:
            msg += " · unsicher (Seitenfläche aus früherer Aufnahme): " + ", ".join(unsure)
        if notes_pages:
            msg += " · " + "; ".join(notes_pages)
        if slow:
            msg += " · langsam (%s%s)" % (", ".join(slow), ", Pillow installieren"
                                          if not TC.have_pillow() else "")
        msg += " · %s" % ", ".join(sorted(decoders))
        self.st.step("compare", "warn" if low or notes_pages or no_canvas or unsure else "ok",
                     msg)

    def shot_dirs(self) -> set:
        """shots/<seq>-Ordner, auf die der Status noch zeigt (nicht wegräumen)."""
        out = set()
        for r in self.pages.values():
            parts = str(r.get("shot") or "").replace("\\", "/").split("/")
            if len(parts) >= 2 and parts[0] == "shots":
                out.add(parts[1])
        return out


# --------------------------------------------------------------------------- #
# Runner
# --------------------------------------------------------------------------- #
class Runner:
    def __init__(self, opt) -> None:
        self.opt = opt
        for key, default in (("auto_restart", False), ("confirm_timeout", 600.0),
                             ("pin_pid", None), ("session_id", None), ("idle_poll", 0.0),
                             ("busy_backoff", 1.0), ("respect_unsaved", False),
                             ("shot_budget", SHOT_BUDGET_DEFAULT)):
            if not hasattr(opt, key):
                setattr(opt, key, default)
        self.p = Project(opt.project)
        self.p.ensure_mockup_dir()
        self._logger = self._setup_log() if getattr(opt, "mode", "") != "status" else None
        sess = read_json(self.p.session, retries=1)
        sess = sess if isinstance(sess, dict) else {}
        own = same_path(sess.get("projectPath"), self.p.root) if sess.get("projectPath") \
            else bool(sess)
        self.session_id = opt.session_id or (sess.get("sessionId") if own else None) or \
            new_session_id()
        self.pin_pid = int(opt.pin_pid) if opt.pin_pid else None
        self.session_active = False
        self.converter = Path(opt.converter or os.environ.get("MK_CONVERTER")
                              or DEFAULT_CONVERTER).resolve()
        if not self.converter.is_file():
            raise RunnerError("Konverter fehlt: %s" % self.converter)
        self.spec_tools = import_spec_tools(self.converter)
        self.pbir = Pbir(opt.pbir or os.environ.get("MK_PBIR") or "pbir")
        bridge_override = opt.bridge_cmd or os.environ.get("MK_BRIDGE_CMD")
        self.bridge = Bridge(bridge_override or "powerbi-desktop")
        backend = opt.desktop_cli or ("bridge" if bridge_override else "pbir")
        self.desktop = DesktopCli(backend, self.pbir, self.bridge, self.p, log=self.log,
                                  retries=3, backoff=float(opt.busy_backoff))
        te = opt.te or os.environ.get("MK_TE") or None
        if te and te.lower().endswith(".py") and Path(te).is_file():
            te = [sys.executable, te]            # Tests: fake_te.py ohne Shim
        self.te = te
        close = opt.close_cmd or os.environ.get("MK_DESKTOP_CLOSE_CMD")
        self.close_cmd = resolve_cmd(close, "close") if close else None
        if close and not self.close_cmd:
            raise RunnerError("--close-cmd nicht gefunden: %s" % close)
        self.pid = None
        self.status = Status(self.p, self.log, session_id=self.session_id)
        if self.pin_pid:
            self.status.doc["runner"]["pinnedPid"] = self.pin_pid
        self._stop = threading.Event()

    # --- Protokoll: Konsole und mockup/.state/runner.log (rotierend, 3 × 1 MB) ----- #
    def _setup_log(self):
        try:
            self.p.state_dir.mkdir(parents=True, exist_ok=True)
            name = "mk_live_runner.%s" % hashlib.sha1(
                str(self.p.root).lower().encode("utf-8")).hexdigest()[:10]
            lg = logging.getLogger(name)
            lg.setLevel(logging.INFO)
            lg.propagate = False
            if not lg.handlers:
                h = logging.handlers.RotatingFileHandler(
                    str(self.p.log_file), maxBytes=1_000_000, backupCount=3, encoding="utf-8",
                    delay=True)
                h.setFormatter(logging.Formatter("%(asctime)s %(message)s"))
                lg.addHandler(h)
            return lg
        except Exception:                        # noqa: BLE001 - ohne Datei weiter
            return None

    def log(self, msg: str) -> None:
        line = "%s %s" % (datetime.now().strftime("%H:%M:%S"), msg)
        if sys.stdout is not None:
            try:
                print(line, flush=True)
            except (OSError, ValueError):
                pass
        lg = getattr(self, "_logger", None)
        if lg is not None:
            try:
                lg.info(msg)
            except Exception:                    # noqa: BLE001
                pass

    # --- Sitzung (mockup/desktop-session.json) ---------------------------- #
    def write_session(self, **kw) -> None:
        """desktop-session.json anlegen bzw. ergänzen: sessionId, projectPath, pid, exe,
        startedAt, runnerPid. Werte des Launchers (pid, exe, startedAt) bleiben."""
        cur = read_json(self.p.session, retries=1)
        cur = cur if isinstance(cur, dict) else {}
        if cur.get("sessionId") != self.session_id:
            cur = {"sessionId": self.session_id, "startedAt": now_iso(), "pid": None,
                   "exe": None}
        cur.update({"projectPath": str(self.p.root), "runnerPid": os.getpid()})
        if self.pin_pid and not cur.get("pid"):
            cur["pid"] = self.pin_pid
        cur.update({k: v for k, v in kw.items() if v is not None})
        if cur.get("pid") and not cur.get("exe"):
            cur["exe"] = process_info(cur["pid"])[1]
        cur.setdefault("startedAt", now_iso())
        write_json_atomic(self.p.session, cur)

    def update_session(self, **kw) -> None:
        if not self.session_active:
            return
        try:
            self.write_session(**kw)
        except OSError as e:
            self.log("desktop-session.json nicht geschrieben: %s" % e)

    def repin(self, new_pid, why: str) -> None:
        """Festnagelung auf eine neue Desktop-Instanz (nach Neustart durch den Runner oder,
        Safety 6, nachdem der Nutzer Desktop selbst neu gestartet hat)."""
        old = self.pin_pid
        self.pin_pid = int(new_pid) if str(new_pid).isdigit() else new_pid
        with self.status.lock:
            self.status.doc["runner"]["pinnedPid"] = self.pin_pid
        self.log("Festnagelung von pid %s auf pid %s umgezogen (%s)" % (old, self.pin_pid, why))
        self.update_session(pid=self.pin_pid, repinnedFrom=old, repinnedAt=now_iso())

    # --- Welche Visualtypen kennt pbir? (Demo B1) --------------------------- #
    def pbir_types(self):
        """(native Visualtypen, Container-Objekte) aus `pbir schema types --json`, einmal je
        Runner; ohne Antwort die Liste von pbir 0.9.32."""
        if getattr(self, "_pbir_types", None) is None:
            types, conts = set(NATIVE_TYPES_FALLBACK), set(CONTAINER_OBJECTS_FALLBACK)
            try:
                rc, out, _ = self.pbir("--output-format", "json", "schema", "types", timeout=60)
                data = parse_json_output(out) if rc == 0 else None
                if isinstance(data, dict) and isinstance(data.get("visual_types"), list):
                    types = {str(t) for t in data["visual_types"]} | {"group"}
                rc, out, _ = self.pbir("--output-format", "json", "schema", "types",
                                       "--containers", timeout=60)
                data = parse_json_output(out) if rc == 0 else None
                if isinstance(data, dict) and isinstance(data.get("visualContainerObjects"), list):
                    conts = {str(t) for t in data["visualContainerObjects"]}
            except Exception as e:               # noqa: BLE001 - Rückfall genügt
                self.log("pbir schema types: %s" % e)
            self._pbir_types = (frozenset(types), frozenset(conts))
        return self._pbir_types

    def is_native(self, vtype) -> bool:
        """Kennt pbir diesen Visualtyp (dann über pbir batch)? Custom Visuals (GUID am Ende,
        Kitchen-Visuals aus visuals_install.catalog) nie; unbekannte Namen fragt der Runner
        einmal bei pbir nach."""
        if not vtype:
            return True                          # Gruppe ohne Typ, Seite …
        vtype = str(vtype)
        if vtype in NATIVE_TYPES_FALLBACK:
            return True
        if CUSTOM_TYPE_RX.search(vtype) or vtype in self.catalog_guids():
            return False
        return vtype in self.pbir_types()[0]

    def container_objects(self) -> frozenset:
        return getattr(self, "_pbir_types", None) and self._pbir_types[1] \
            or CONTAINER_OBJECTS_FALLBACK

    def catalog_guids(self) -> set:
        if getattr(self, "_catalog_guids", None) is None:
            try:
                self._catalog_guids = {c.get("guid") for c in VI.catalog(REPO).values()
                                       if c.get("guid")}
            except Exception:                    # noqa: BLE001
                self._catalog_guids = set()
        return self._catalog_guids

    # --- Stopp (mk_live stop) -------------------------------------------- #
    def stop_requested(self) -> bool:
        return self.session_active and self.p.stop_request.is_file()

    def clear_stop(self) -> None:
        try:
            self.p.stop_request.unlink()
        except OSError:
            pass

    # --- Leerlauf: Desktop-Zustand für das Kitchen ------------------------- #
    def idle_probe(self) -> None:
        """desktopLive im Status (Desktop verbunden, ungespeichert, von wem) und die eigene
        Reload-Markierung aufheben, sobald Desktop gespeichert meldet."""
        try:
            data = self.desktop.status(wait=0)
        except Exception as e:                   # noqa: BLE001
            self.log("Desktop-Status im Leerlauf: %s" % e)
            return
        mine = [i for i in data["instances"]
                if instance_is_project(i, self.p.pbip, self.p.report)]
        if self.pin_pid:
            mine = [i for i in mine if str(i.get("pid")) == str(self.pin_pid)] or mine
        inst = mine[0] if mine else None
        unsaved = bool(inst and inst.get("hasUnsavedChanges"))
        if inst and not unsaved and self.p.reload_marker.is_file():
            try:
                self.p.reload_marker.unlink()    # gespeichert: Markierung gilt nicht mehr
            except OSError:
                pass
        by_us = bool(unsaved and reload_marker_matches(self.p, inst.get("pid")))
        live = {"at": now_iso(), "ok": bool(data.get("ok")), "connected": inst is not None,
                "pid": (inst or {}).get("pid"), "file": (inst or {}).get("currentFilePath"),
                "hasUnsavedChanges": unsaved,
                "unsavedByUs": by_us,
                "instances": len(mine),
                "otherInstances": max(0, len(data["instances"]) - len(mine))}
        if by_us:
            # Safety-Review 2 (2): seit welchem Deploy Desktop „ungespeichert" vom eigenen Reload
            # ist. Der nächste Deploy ohne Neustart lädt ohne Rückfrage neu und verwirft dabei
            # auch, was seitdem in Desktop ungespeichert geändert wurde (Bandzeile im Kitchen).
            m = read_json(self.p.reload_marker, retries=0) or {}
            if isinstance(m, dict) and isinstance(m.get("seq"), int):
                live["reloadSeq"] = m["seq"]
        if len(mine) > 1:
            live["duplicates"] = [i.get("pid") for i in mine]
        if not data.get("ok"):
            live["error"] = data.get("error") or data.get("status")
        self.status.set_live(live)

    # --- Zustand ---------------------------------------------------------- #
    def processed_seq(self) -> int:
        st = read_json(self.p.runner_state, retries=0) or {}
        seq = int(st.get("lastSeq") or 0)
        doc = self.status.doc
        if doc.get("state") in TERMINAL and isinstance(doc.get("seq"), int):
            seq = max(seq, doc["seq"])
        return seq

    def remember(self, seq: int, state: str) -> None:
        self.p.state_dir.mkdir(parents=True, exist_ok=True)
        write_json_atomic(self.p.runner_state, {"lastSeq": seq, "lastState": state,
                                                "at": now_iso()})

    def prune(self, base: Path, keep_names=()) -> None:
        keep = max(1, int(self.opt.keep_backups))
        dirs = sorted((d for d in base.iterdir() if d.is_dir() and d.name.isdigit()),
                      key=lambda d: int(d.name)) if base.exists() else []
        for d in dirs[:-keep]:
            if d.name not in keep_names:
                shutil.rmtree(d, ignore_errors=True)

    def read_request(self):
        req = read_json(self.p.request)
        if not isinstance(req, dict):
            return None
        try:
            req["seq"] = int(req.get("seq"))
        except (TypeError, ValueError):
            return None
        return req

    # --- Herzschlag ------------------------------------------------------- #
    def _beat(self) -> None:
        while not self._stop.wait(HEARTBEAT_S):
            try:
                self.status.heartbeat()
            except Exception as e:               # noqa: BLE001 - Herzschlag darf nie sterben
                self.log("Herzschlag nicht geschrieben: %s" % e)

    def start_heartbeat(self) -> None:
        self.status.save()
        threading.Thread(target=self._beat, name="heartbeat", daemon=True).start()

    # --- Modi ------------------------------------------------------------- #
    def withdrawn(self, req: dict) -> bool:
        """deploy-cancel.json nennt diese seq: Anfrage zurückgezogen, bevor sie begann."""
        c = read_json(self.p.cancel, retries=1)
        return isinstance(c, dict) and str(c.get("seq")) == str(req.get("seq"))

    def handle(self, req: dict) -> str:
        self.desktop.calls = []
        self.desktop.busy_events = 0
        deploy = Deploy(self, req)
        if self.withdrawn(req):
            state = deploy.withdraw()
        else:
            state = deploy.execute()
        self.remember(req["seq"], state)
        if self.desktop.calls:
            self.log("Desktop-Aufrufe: %s" % self.desktop.summary())
        return state

    def once(self) -> int:
        req = self.read_request()
        if not req:
            self.log("keine deploy-request.json, nichts zu tun")
            return 0
        done = self.processed_seq()
        if req["seq"] <= done:
            prev = self.status.doc.get("state") if self.status.doc.get("seq") == req["seq"] \
                else "applied"
            self.log("seq %d schon bearbeitet (%s), nichts zu tun" % (req["seq"], prev))
            return EXIT_CODE.get(prev, 0)
        self.start_heartbeat()
        try:
            return EXIT_CODE[self.handle(req)]
        finally:
            self._stop.set()

    def watch(self) -> int:
        self.session_active = True
        self.clear_stop()                        # alter Stopp-Wunsch gilt nicht für diesen Lauf
        try:
            self.write_session()
        except OSError as e:
            self.log("desktop-session.json nicht geschrieben: %s" % e)
        self.log("Runner %s beobachtet %s (Desktop: %s, Sitzung %s%s)" % (
            RUNNER_VERSION, self.p.request, "aus" if self.opt.no_bridge
            else "%s, Bridge-CLI %s" % (self.desktop.backend,
                                        " ".join(self.bridge.argv or ["nicht gefunden"])),
            self.session_id, ", festgenagelt auf pid %s" % self.pin_pid if self.pin_pid else ""))
        self.start_heartbeat()
        done = self.processed_seq()
        idle = 0.0 if self.opt.no_bridge else max(0.0, float(self.opt.idle_poll or 0))
        next_idle = time.time() + min(idle, 3.0) if idle else None
        try:
            while True:
                if self.stop_requested():
                    self.log("beendet (mk-live stop)")
                    self.clear_stop()
                    return 0
                req = self.read_request()
                if req and req["seq"] > done:
                    self.handle(req)
                    done = req["seq"]
                    if idle:
                        next_idle = time.time() + idle
                elif next_idle and time.time() >= next_idle:
                    self.idle_probe()
                    next_idle = time.time() + idle
                time.sleep(POLL_S)
        except KeyboardInterrupt:
            self.log("beendet (Strg+C)")
            return 0
        finally:
            self._stop.set()
            with self.status.lock:
                self.status.doc["runner"]["state"] = "stopped"
                self.status.doc["runner"]["current"] = None
                self.status.doc["runner"]["stoppedAt"] = now_iso()
                try:
                    self.status.save()
                except OSError:
                    pass

    def summary(self) -> int:
        p, doc = self.p, read_json(self.p.status, retries=0) or {}
        req = self.read_request() or {}
        last = read_json(p.last_spec, retries=0) or {}
        hb = (doc.get("runner") or {}).get("heartbeatAt")
        age = None
        if hb:
            try:
                age = (datetime.now().astimezone() - datetime.fromisoformat(hb)).total_seconds()
            except ValueError:
                pass
        print("Projekt     %s (%s)" % (p.root, p.name))
        print("Anfrage     seq %s, specHash %s" % (req.get("seq", "–"), req.get("specHash", "–")))
        print("Status      seq %s · %s · %s" % (doc.get("seq", "–"), doc.get("state", "–"),
                                                doc.get("message", "")))
        rn = doc.get("runner") or {}
        print("Runner      %s%s · Herzschlag %s · Sitzung %s" % (
            rn.get("state", "–"), " (%s)" % rn["current"] if rn.get("current") else "",
            "vor %.0f s%s" % (age, " (inaktiv)" if age > 15 else "") if age is not None
            else "–", rn.get("sessionId") or "–"))
        aw = doc.get("awaiting")
        if aw:
            print("Wartet      %s: %s · Optionen %s" % (aw.get("kind"), aw.get("reason"),
                                                      ", ".join(aw.get("options") or [])))
        plan = doc.get("plan")
        if isinstance(plan, dict) and plan:
            print("Vorschau    %s" % Deploy.plan_text(plan))
        print("Angewendet  specHash %s" % ((last.get("meta") or {}).get("specHash") or "–"))
        for s in doc.get("steps") or []:
            print("  %-9s %-7s %s" % (s.get("id"), s.get("state"), s.get("msg")))
        vis = doc.get("visuals") or {}
        if vis:
            states = {}
            for v in vis.values():
                states[v.get("state")] = states.get(v.get("state"), 0) + 1
            print("Visuals     " + ", ".join("%s %d" % kv for kv in sorted(states.items())))
        for t in doc.get("todos") or []:
            print("  todo %-8s %s: %s" % (t.get("kind"), t.get("ref"), t.get("text")))
        backups = sorted(d.name for d in p.backups.iterdir()) if p.backups.exists() else []
        print("Backups     %s" % (", ".join(backups) or "–"))
        if not self.opt.no_bridge:
            data = self.desktop.status()
            inst = data["instances"]
            print("Desktop     %s" % ("; ".join("pid %s %s%s" % (
                i.get("pid"), i.get("currentFilePath"),
                " (ungespeichert)" if i.get("hasUnsavedChanges") else "") for i in inst)
                or data.get("error") or data.get("status")))
        return 0


def main(argv=None) -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:                        # noqa: BLE001
            pass
    opt = build_parser().parse_args(argv)
    try:
        runner = Runner(opt)
    except RunnerError as e:
        print("Fehler: %s" % e, file=sys.stderr, flush=True)
        return 1
    if opt.mode == "once":
        return runner.once()
    if opt.mode == "watch":
        return runner.watch()
    return runner.summary()


def build_parser() -> argparse.ArgumentParser:
    ap = argparse.ArgumentParser(description="MockupKitchen live · Deploy-Runner",
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("mode", choices=("watch", "once", "status"))
    ap.add_argument("project", help="Projektordner mit <Name>.pbip")
    ap.add_argument("--bridge-cmd", default=None)
    ap.add_argument("--no-bridge", action="store_true")
    ap.add_argument("--scale", type=int, default=1, choices=(1, 2, 3))
    ap.add_argument("--keep-backups", type=int, default=10)
    # Live-Standard: ChartKitchen-Kacheln als natives Ersatzvisual, damit Desktop echte Zahlen zeigt.
    # Ohne Ersatz (z. B. varint) bleibt ein neutraler Platzhalter. --no-ck-fallback schaltet das ab.
    ap.add_argument("--ck-fallback", dest="ck_fallback", action="store_true", default=True)
    ap.add_argument("--no-ck-fallback", dest="ck_fallback", action="store_false")
    ap.add_argument("--respect-unsaved", action="store_true",
                    help="bei ungespeicherten Änderungen in Desktop sofort blockieren statt nachzufragen")
    ap.add_argument("--desktop-cli", choices=("pbir", "bridge"), default=None,
                    help="Desktop über pbir desktop (Vorgabe) oder die Bridge-CLI steuern")
    ap.add_argument("--no-install", dest="install", action="store_false", default=True,
                    help="Kitchen-Visuals und Theme nicht installieren (Verhalten v1)")
    ap.add_argument("--no-desktop-restart", action="store_true",
                    help="Desktop für die Installation nicht schließen und neu öffnen")
    ap.add_argument("--restart-for-theme", action="store_true",
                    help="Desktop auch für die einmalige Theme-Registrierung neu starten")
    ap.add_argument("--keep-visual-versions", action="store_true",
                    help="Schon installierte, ältere Kitchen-Visuals nicht aktualisieren "
                         "(Demo B7; je Deploy auch über deploy-request keepVersions)")
    ap.add_argument("--desktop-timeout", type=float, default=180.0,
                    help="Sekunden, die der Runner nach dem Start auf Desktop wartet")
    ap.add_argument("--close-cmd", default=None,
                    help="Programm zum Schließen von Desktop (Aufruf mit der PID)")
    ap.add_argument("--compare-wait", type=float, default=30.0,
                    help="Sekunden, die der Runner auf kitchen/<seq>/tiles.json wartet")
    ap.add_argument("--shot-wait", type=float,
                    default=float(os.environ.get("MK_SHOT_WAIT") or SHOT_WAIT_DEFAULT),
                    help="Sekunden, die der Runner je Seite höchstens auf ein fertig "
                         "gezeichnetes Desktop-Bild wartet (Vorgabe $MK_SHOT_WAIT, sonst 8)")
    ap.add_argument("--shot-budget", type=float,
                    default=float(os.environ.get("MK_SHOT_BUDGET") or SHOT_BUDGET_DEFAULT),
                    help="Sekunden je Deploy für Bilder von Seiten, die der Deploy nicht "
                         "angefasst hat und die noch kein Bild haben (Vorgabe 30, 0 = keine)")
    ap.add_argument("--te", default=None, help="Tabular-Editor-CLI (Vorgabe $MK_TE, sonst te)")
    ap.add_argument("--pbir", default=None)
    ap.add_argument("--converter", default=None)
    ap.add_argument("--auto-restart", action="store_true",
                    help="nur für unbeaufsichtigte Tests: Desktop ohne Rückfrage neu starten, "
                         "Ungespeichertes ohne Rückfrage überschreiben (Verhalten bis 0.2)")
    ap.add_argument("--confirm-timeout", type=float,
                    default=float(os.environ.get("MK_CONFIRM_TIMEOUT") or 600.0),
                    help="Sekunden, die der Runner auf deploy-confirm.json wartet (Vorgabe 600)")
    ap.add_argument("--pin-pid", type=int, default=None,
                    help="nur diese Desktop-Instanz ansprechen (External Tools, mk-live start)")
    ap.add_argument("--session-id", default=None,
                    help="Sitzungs-ID (sonst aus mockup/desktop-session.json oder neu)")
    ap.add_argument("--idle-poll", type=float,
                    default=float(os.environ.get("MK_IDLE_POLL") or 30.0),
                    help="im Leerlauf alle N s den Desktop-Status lesen (0 = aus)")
    ap.add_argument("--busy-backoff", type=float, default=1.0,
                    help="Desktop beschäftigt: bis zu 3 Wiederholungen nach N, 2N, 4N s")
    return ap


if __name__ == "__main__":
    raise SystemExit(main())
