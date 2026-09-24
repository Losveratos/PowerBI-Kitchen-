#!/usr/bin/env python3
"""mockup_to_pbir.py — MockupKitchen-Spec in pbir-taugliche Bausteine zerlegen.

Liest `mockup-spec.json` (Export aus MockupKitchen byDatenWG, specVersion 1, 2
oder 3) und schreibt einen Ausgabeordner, aus dem der Skill `mockup-to-powerbi`
die Seiten mit der pbir-CLI baut. Reine Standardbibliothek, strikt lesend bis
auf --out.

    python mockup_to_pbir.py mockup-spec.json [--out mockup-out]
                             [--report "Meine.Report"] [--plan] [--validate]
                             [--lang de|en]
                             [--page-name "Übersicht"]   (nur specVersion 1)
                             [--ink '#0F1E2E'] [--on-ink '#FFFFFF']
                             [--panel '#F1F3F5'] [--muted '#6B7280']
                             [--tile-border '#E5E7EB']
                             [--ck-fallback] [--force]

Ablauf des Skills: **validate -> plan -> Freigabe -> apply -> verify.**
Ohne gueltige Spec entsteht kein Plan: Schema- und Strukturfehler brechen ab
(Notausgang `--force`, dann aber auf eigene Rechnung).

Erzeugt im Ausgabeordner je Seite:

  <Seitenslug>/pbir-visuals.json      native Visuals + Slicer (ohne Text/Button)
  <Seitenslug>/text-visuals.json      Text-/Button-Kacheln als shape/actionButton
  <Seitenslug>/chrome-visuals.json    Kopfband/Nav/Filter/Fussleiste als Geometrie
  <Seitenslug>/chrome-batch.json      pbir batch v2 — Hauptweg fuer alle Setzungen
  <Seitenslug>/chrome-commands.sh     dieselben Setzungen als Einzelaufrufe
  <Seitenslug>/chrome-commands.ps1    (Fallback, ~1,5 s je Aufruf)
  <Seitenslug>/analysis-commands.sh   Sortierung, Top-N, Slicer-Vorauswahl,
  <Seitenslug>/analysis-commands.ps1  Notiz-Annotationen (kein Batch-Op dafuer)
  <Seitenslug>/delta-batch.json       zweiter Lauf: Position/Groesse/Bindung
  <Seitenslug>/zones.json             Content-Zone fuer Linter und Wireframe
  <Seitenslug>/chartkitchen-slots.json ChartKitchen-Slots inkl. Rollen-Vorschlag
  <Seitenslug>/deneb-slots.json       Deneb-Slots
  <Seitenslug>/custom-visuals.json    Custom Visuals (engine "custom") als Index
  <Seitenslug>/custom-visuals/<id>.visual.json   je Custom Visual eine fertige
                                      PBIR-visual.json (visualType = GUID,
                                      queryState = Buckets aus der Spec)
  <Seitenslug>/custom-commands.sh     Platzhalter anlegen + visual.json kopieren
  <Seitenslug>/custom-commands.ps1    (nur wenn die Seite Custom Visuals hat)

und im Wurzelordner:

  model-todos.md     neue Felder mit DAX-Vorschlag und te-Befehl
  checklist.md       Berichtskopf, Umfang, Issues, Kennzahlen-Steckbrief
  navigation.md      Nav-Buttons, Drill-through, Filter-Lesezeichen
  analysis-todos.md  Analyse-Angaben, die pbir nicht direkt setzen kann
  theme-fragment.json  visualStyles-Fragment statt Overrides je Visual
  commands.md        (nur mit --report) Befehlsfolge ueber alle Seiten
  plan.json          (nur mit --plan) Operationsliste, idempotent formuliert
  acceptance.json    (nur mit --plan) Sollbild fuer scripts/mockup_verify.py

Verifizierte CLI-Fakten, auf denen die Ausgabe beruht (pbir 0.9.32):
  * `pbir add visual --from-json` akzeptiert NUR die Schluessel
    visual_type, name, title, x, y, width, height, fields.
    Ein unbekannter Schluessel (z. B. "text") bricht die GANZE Datei ab.
  * `title` landet im Container-Titel (visualContainerObjects.title.text),
    nicht im Textinhalt einer Textbox.
  * Textinhalt geht ueber `pbir set "<Visual>.text.text"` — das funktioniert bei
    shape und actionButton. Bei textbox NICHT: dort muesste
    `general.paragraphs` ein Array sein; `pbir set` schreibt stattdessen ein
    Literal und die Textbox bleibt leer. Deshalb baut dieses Skript Textzeilen
    UND Text-Kacheln als `shape` mit ausgeschalteter Fuellung.
  * Kachel-Container: `background.show/color`, `border.show/color/radius/width`,
    `dropShadow.show/preset/color/transparency` (Container-Objekte, gelten fuer
    jeden Visual-Typ — `pbir schema describe <typ> border`).
  * Ein fehlendes Feld laesst `--from-json` komplett scheitern ("no visuals were
    created") — neue Kennzahlen also zuerst mit `te add` anlegen.
  * Custom Visuals (dataKitchenGantt, pnlByDatenWG) kann pbir NICHT anlegen:
    `pbir add visual <GUID>` und `--from-json` mit einer GUID melden beide
    "Unknown visual type '<GUID>'", und in einer --from-json-Datei reisst der
    Eintrag die ganze Datei mit. Deshalb: Platzhalter-`shape` mit pbir anlegen
    (dann stimmen Ordner, Visualname und Seiteneintrag) und danach die
    visual.json durch die hier erzeugte Fassung ersetzen. `pbir validate
    --fields` und `pbir ls --json` nehmen sie an (beides verifiziert;
    `pbir ls --json` nennt zu jedem Visual auch seinen `path`).
  * `pbir visuals bind` kann bei einem Custom Visual nur Rollen bedienen, die in
    der queryState bereits stehen ("Role 'x' not valid ... Available: ...").
    Die erzeugte Datei enthaelt deshalb alle Rollen der Spec von Anfang an.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from mockup_spec import (                                     # noqa: E402
    CK_ORIENTATION, CK_ROLE, CK_ROLE_UNSUPPORTED, DRILL_ROLE_ORDER,
    MEASURE_ROLE_ORDER, NO_VARIANT_KINDS, SMALL_MULTIPLES_BUCKET,
    SMALL_MULTIPLES_TYPES, SpecError, as_document,
    a11y_issues, custom_visual_info, footer_nav_entries, half_pt, is_a11y_issue,
    is_light, load, nav_position, slug, split_ref, structural_errors,
    type_sizes, upgrade, validate,
)

# PBIR-Schema, das `pbir add visual` in 0.9.32 schreibt. Custom Visuals kann die
# CLI nicht anlegen (`Unknown visual type '<GUID>'`), deshalb erzeugt dieses
# Skript die visual.json selbst — aber exakt in der Form, die pbir schreibt.
VISUAL_SCHEMA = ("https://developer.microsoft.com/json-schemas/fabric/item/report/"
                 "definition/visualContainer/2.9.0/schema.json")

# Ebenen. --from-json vergibt immer z = 0, deshalb wird alles explizit gesetzt.
Z = {"bg": 0, "text": 4, "button": 5, "content": 10,
     "overlay": 20, "overlayText": 22, "overlayButton": 24}

# analysis.displayUnits -> Enumwert von labels.labelDisplayUnits
DISPLAY_UNITS = {"none": 1, "K": 1000, "M": 1000000}
DISPLAY_UNITS_CLI = {"none": "None", "K": "Thousands", "M": "Millions"}

# Slicer-Art (`zones.filter.slicers[].type`, Tool 0.4.4) -> PBIR-Formatierung.
# VERIFIZIERT mit pbir 0.9.32 (Probe-Report, `pbir batch run` + `pbir validate
# --fields` ohne Befund, danach `pbir visuals json` gelesen):
#   pbir schema describe slicer data --json -> data.mode ist ein Enum:
#     VerticalList, HorizontalList, Between, Before, After, Basic, Dropdown,
#     Relative, Single, RelativeTime, RelativeDatePicker
#     (`pbir set ... data.mode --value List` wird abgelehnt)
#   pbir schema describe slicer general    -> orientation (Enum 0 | 1),
#     selfFilterEnabled (boolean)
#   Die Stil-Vorlagen des Microsoft-Themes Fluent2 (visualStyles.slicer) nutzen
#   genau diese Paare: "List" = data.mode Basic + general.orientation 0,
#   "Tile" = data.mode Basic + general.orientation 1, Vorgabe = Dropdown.
# `search` = Liste mit Suchfeld: das Suchfeld schaltet Power BI ueber
# general.selfFilterEnabled (pbir nimmt es an; in Desktop gegenpruefen).
# `date` = Bereich auf einer Datumsspalte — gleicher Modus wie `between`, das
# Feld muss aber vom Typ Date/DateTime sein, sonst zeigt Power BI keinen Kalender.
SLICER_FORMAT = {
    "dropdown": {"data.mode": "Dropdown"},
    "list": {"data.mode": "Basic", "general.orientation": 0},
    "tile": {"data.mode": "Basic", "general.orientation": 1},
    "between": {"data.mode": "Between"},
    "date": {"data.mode": "Between"},
    "search": {"data.mode": "Basic", "general.orientation": 0,
               "general.selfFilterEnabled": True},
}
SLICER_TYPE_LABEL = {
    "dropdown": "Dropdown", "list": "Liste", "tile": "Kacheln (horizontal)",
    "between": "Bereich von–bis", "date": "Datumsbereich", "search": "Liste mit Suche",
}

# Visual-Typen ohne Datenbeschriftung — dort keine Anzeigeeinheiten setzen
NO_LABELS = {"slicer", "shape", "actionButton", "textbox", "image",
             "tableEx", "pivotTable", "decompositionTreeVisual"}

T = {
    "de": {
        "todo_delta_sort": "Sortierung nach Δ kann pbir nicht setzen (das Modell "
                           "kennt keine Delta-Spalte). In Desktop sortieren oder eine "
                           "Delta-Kennzahl anlegen.",
        "todo_timegrain": "Zeitgranularitaet „%s\": das Kategorie-Feld muss auf "
                          "dieser Ebene gebunden sein (Datumshierarchie oder eigene "
                          "Spalte). pbir bindet, was in der Spec steht.",
        "todo_cumulative": "Kumulierte Darstellung (YTD) braucht eine YTD-Kennzahl im "
                           "Modell (TOTALYTD/DATESYTD) — nicht im Bericht loesbar.",
        "todo_scalegroup": "Gemeinsame Skala „%s\": Wertachse auf allen Kacheln der "
                           "Gruppe auf denselben Bereich setzen "
                           "(`pbir visuals axis <Visual> value --min <a> --max <b>`).",
        "todo_message": "Kernaussage „%s\" als Titelzeile pruefen (Titel steht "
                        "derzeit auf „%s\").",
        "todo_polarity": "Polaritaet „kleiner = besser\": natives Visual faerbt "
                         "nicht automatisch um. ChartKitchen: `chart.invert = true`; "
                         "nativ: bedingte Formatierung oder Farbe pruefen.",
        "todo_unit": "Einheit „%s\" als Untertitel gesetzt — im Bericht gegenlesen.",
        "todo_sm_no_field": "Small Multiples sind eingeschaltet, aber kein "
                            "Aufteilungsfeld gebunden (Tool-Issue `SM_NO_FIELD`). "
                            "Feld in die Rolle „Small Multiples nach\" ziehen und neu "
                            "exportieren — die Kachel bleibt sonst ein normales Visual.",
        "todo_sm_not_native": "Small Multiples: %s hat keinen Small-Multiples-Bucket. "
                              "Als natives Visual bauen oder als Raster aus einer "
                              "Kachel je Auspraegung.",
        "todo_sm_no_bucket": "Small Multiples nach `%s`: `%s` kennt die PBIR-Rolle "
                             "`%s` nicht. Anderen Visualtyp waehlen oder ein Raster "
                             "aus Einzelkacheln bauen.",
        "todo_fieldparam": "Achse per Feldparameter „%s\" (%s): erst die berechnete "
                           "Tabelle anlegen (model-todos.md), dann bindet die Achse "
                           "auf `%s`. Ohne die Tabelle lehnt `--from-json` die "
                           "**ganze** Datei ab.",
        "todo_fieldparam_slicer": "Slicer auf `%s` einplanen — ohne ihn kann niemand "
                                  "die Achse umschalten. Vorschlag steht in "
                                  "analysis-commands.sh (auskommentiert).",
        "todo_fieldparam_few": "Feldparameter „%s\" hat nur %d Feld(er) "
                               "(Tool-Issue `FIELDPARAM_FEW`). Zum Umschalten braucht "
                               "es mindestens zwei — im Workshop nachtragen.",
        "todo_fieldparam_slot": "Achse per Feldparameter „%s\": die Kachel ist kein "
                                "natives Visual. Der Feldparameter gehoert trotzdem "
                                "ins Modell; die Achsenbindung im Slot nachziehen.",
    },
    "en": {
        "todo_delta_sort": "pbir cannot sort by delta (the model has no delta column). "
                           "Sort in Desktop or add a delta measure.",
        "todo_timegrain": "Time grain „%s\": bind the category field at that level "
                          "(date hierarchy or dedicated column).",
        "todo_cumulative": "Cumulative (YTD) needs a YTD measure in the model "
                           "(TOTALYTD/DATESYTD) — not solvable in the report.",
        "todo_scalegroup": "Shared scale „%s\": set the same value axis range on "
                           "every tile of the group.",
        "todo_message": "Check key message „%s\" as the title line (title is "
                        "„%s\").",
        "todo_polarity": "Polarity „lower is better\": native visuals do not "
                         "recolour by themselves. ChartKitchen: `chart.invert = true`.",
        "todo_unit": "Unit „%s\" set as subtitle — proofread in the report.",
        "todo_sm_no_field": "Small multiples are enabled but no split field is bound "
                            "(tool issue `SM_NO_FIELD`). Bind the field and export "
                            "again.",
        "todo_sm_not_native": "Small multiples: %s has no small-multiples bucket. "
                              "Build it as a native visual or as a grid of tiles.",
        "todo_sm_no_bucket": "Small multiples by `%s`: `%s` has no PBIR role `%s`. "
                             "Pick another visual type or build a grid of tiles.",
        "todo_fieldparam": "Axis via field parameter „%s\" (%s): create the "
                           "calculated table first (model-todos.md), then the axis "
                           "binds to `%s`.",
        "todo_fieldparam_slicer": "Plan a slicer on `%s` — without it nobody can "
                                  "switch the axis.",
        "todo_fieldparam_few": "Field parameter „%s\" has only %d field(s) "
                               "(tool issue `FIELDPARAM_FEW`); at least two make sense.",
        "todo_fieldparam_slot": "Axis via field parameter „%s\": the tile is not a "
                                "native visual. The parameter still belongs in the "
                                "model; bind the axis inside the slot.",
    },
}


# --------------------------------------------------------------------------- #
# Helfer
# --------------------------------------------------------------------------- #
def q_sh(value) -> str:
    return '"' + str(value).replace("\\", "\\\\").replace('"', '\\"') + '"'


def q_ps(value) -> str:
    return '"' + str(value).replace('"', '""') + '"'


def rect(node: dict):
    return int(node["x"]), int(node["y"]), int(node["w"]), int(node["h"])


def vis(visual_type: str, name: str, title: str, x, y, w, h, fields=None) -> dict:
    """Ein Eintrag im --from-json-Format. Nur erlaubte Schluessel."""
    item = {"visual_type": visual_type, "name": name, "title": title,
            "x": int(x), "y": int(y), "width": int(w), "height": int(h)}
    if fields:
        item["fields"] = fields
    return item


def usable_rect(v: dict) -> bool:
    r = v.get("rect")
    return (isinstance(r, dict)
            and all(isinstance(r.get(k), int) and not isinstance(r.get(k), bool)
                    for k in ("x", "y", "w", "h")))


def drop_unusable(nspec: dict):
    """Nur fuer --force: Kacheln ohne brauchbares Rechteck entfernen."""
    dropped = []
    for page in nspec["pages"]:
        keep = []
        for v in page.get("visuals") or []:
            if usable_rect(v):
                keep.append(v)
            else:
                dropped.append("%s / %s" % (page.get("name"), v.get("id")))
        page["visuals"] = keep
    return dropped


def has_empty_required_role(v: dict) -> bool:
    return any(str(w).startswith("Pflichtrolle") for w in (v.get("warnings") or []))


def is_text_tile(v: dict) -> bool:
    return v.get("kind") in ("text", "button")


def lead_measure(v: dict):
    roles = v.get("roles") or {}
    for key in MEASURE_ROLE_ORDER:
        if roles.get(key):
            return roles[key][0]
    return None


def lead_category(v: dict):
    roles = v.get("roles") or {}
    for key in DRILL_ROLE_ORDER:
        if roles.get(key):
            return roles[key][0]
    return None


# --------------------------------------------------------------------------- #
# Darstellungsvarianten (Tool 0.4.1)
# --------------------------------------------------------------------------- #
def sm_field(v: dict):
    """Aufteilungsfeld der Small Multiples, oder None (Variante aus / Feld fehlt).

    Das Tool schreibt es doppelt: als `analysis.smallMultiples.field` und als
    Rolle `multiples`. Beides wird gelesen, die Rolle gewinnt nur, wenn der
    Analyse-Block leer bleibt.
    """
    a = v.get("analysis") or {}
    sm = a.get("smallMultiples")
    if not isinstance(sm, dict):
        return None
    if sm.get("field"):
        return sm["field"]
    first = ((v.get("roles") or {}).get("multiples") or [{}])[0]
    return first.get("ref") or None


def field_param(v: dict):
    """`analysis.fieldParam` als Dict, oder None."""
    fp = (v.get("analysis") or {}).get("fieldParam")
    return fp if isinstance(fp, dict) and fp.get("name") else None


def param_ref(fp: dict) -> str:
    """Feldverweis auf die Parameterspalte — Tabelle und Spalte heissen gleich.

    In DAX ist das `'<Name>'[<Name>]`, im pbir-Format `<Name>.<Name>`
    (verifiziert: `pbir add visual --from-json` mit `"Category": "Achse.Achse"`
    legt die Projektion an, `pbir validate --fields` nimmt sie an).
    """
    name = str(fp.get("name") or "").strip()
    return "%s.%s" % (name, name)


def param_slicer_name(fp: dict, page: dict) -> str:
    return "mk_param_%s_p%d" % (slug(fp.get("name")), page.get("index") or 1)


def param_slicer_hint(nspec: dict, page: dict, fp: dict, offset: int = 0) -> str:
    """Fertiger `pbir add visual slicer`-Aufruf als Kommentarzeile.

    Bewusst nur ein Vorschlag: das Mockup kennt diese Kachel nicht, sie taucht
    deshalb weder in `pbir-visuals.json` noch im Sollbild auf. Liegt ein
    Filter-Panel auf der Seite, wird darin die naechste freie Zeile berechnet,
    sonst die linke obere Ecke des Inhaltsbereichs.
    """
    k = nspec["uiScale"]
    filt = (nspec["zones"] or {}).get("filter") or {}
    n = len(filt.get("slicers") or []) + offset
    if filt:
        fx, fy, fw, fh = rect(filt)
        ox, oy = filter_layout(nspec)["origin"]
        if (filt.get("mode") or filt.get("side")) == "top":
            x, y = ox + n * round(168 * k), fy + round(8 * k)
            w, h = round(160 * k), fh - 2 * round(8 * k)
        else:
            x, y = fx + round(8 * k), oy + n * round(64 * k)
            w, h = fw - 2 * round(8 * k), round(56 * k)
    else:
        cr = page.get("contentRect") or {}
        x = int(cr.get("x", 16))
        y = int(cr.get("y", 72)) + n * round(64 * k)
        w, h = round(160 * k), round(56 * k)
    return ('  pbir add visual slicer "{page}" -n %s -x %d -y %d -w %d -h %d '
            '-t "%s" && pbir visuals bind "{page}/%s.Visual" -a "Values:%s"'
            % (param_slicer_name(fp, page), x, y, w, h, fp.get("name"),
               param_slicer_name(fp, page), param_ref(fp)))


def param_bucket(v: dict, buckets: dict):
    """In welchem pbir-Bucket die Kategorie-Felder der Kachel gelandet sind.

    Der Katalog mappt `category` je nach Typ auf `Category`, `Rows` oder
    `ExplainBy` — deshalb wird nicht geraten, sondern das erste Kategorie-Feld
    in den fertigen Buckets gesucht.
    """
    cat_refs = [f.get("ref") for f in ((v.get("roles") or {}).get("category") or [])]
    if not cat_refs:
        return None, []
    for bucket, entries in (buckets or {}).items():
        if any(f.get("ref") == cat_refs[0] for f in entries or []):
            return bucket, cat_refs
    return None, cat_refs


class Commands:
    """Sammelt pbir-Befehle als Argumentlisten mit {page}-Platzhalter."""

    def __init__(self) -> None:
        self.items = []

    def note(self, text: str) -> None:
        self.items.append((text, None))

    def add(self, *argv: str) -> None:
        self.items.append(("", list(argv)))

    def set_prop(self, visual: str, prop: str, value) -> None:
        self.add("pbir", "set", "{page}/%s.Visual.%s" % (visual, prop),
                 "--value", str(value))

    def position(self, visual: str, *args: str) -> None:
        self.add("pbir", "visuals", "position", "{page}/%s.Visual" % visual, *args)

    import re as _re
    BARE = _re.compile(r"^[A-Za-z0-9_.-]+$")

    def render(self, flavour: str, page_expr: str) -> str:
        quote = q_sh if flavour == "sh" else q_ps
        lines = []
        for text, argv in self.items:
            if argv is None:
                lines.append("" if not text else "# " + text.replace("{page}", page_expr))
                continue
            parts = []
            for a in argv:
                a = a.replace("{page}", page_expr)
                parts.append(a if self.BARE.match(a) else quote(a))
            lines.append(" ".join(parts))
        return "\n".join(lines) + "\n"


# --------------------------------------------------------------------------- #
# Batch-Spec (pbir batch, Schema v2) — Hauptweg fuer Setzungen
# --------------------------------------------------------------------------- #
class Batch:
    """Baut eine `pbir batch`-Spec (Version 2). Ein Lauf statt ~120 Prozessstarts."""

    def __init__(self, name: str, root: str) -> None:
        self.spec = {"version": 2, "name": name, "root": root or "<Name>.Report",
                     "stop_on_error": False, "steps": []}
        self._ids = {}

    def _id(self, stem: str) -> str:
        n = self._ids.get(stem, 0) + 1
        self._ids[stem] = n
        return stem if n == 1 else "%s-%d" % (stem, n)

    def set(self, select: str, props: dict, stem: str = "set") -> None:
        if not props:
            return
        self.spec["steps"].append({"id": self._id(stem), "op": "set",
                                   "select": select, "set": props,
                                   "continue_on_error": True})

    def move(self, select: str, x: int, y: int, stem: str = "move") -> None:
        self.spec["steps"].append({"id": self._id(stem), "op": "move",
                                   "select": select, "x": int(x), "y": int(y),
                                   "continue_on_error": True})

    def resize(self, select: str, w: int, h: int, stem: str = "resize") -> None:
        self.spec["steps"].append({"id": self._id(stem), "op": "resize",
                                   "select": select, "width": int(w),
                                   "height": int(h), "continue_on_error": True})

    def bind(self, select: str, add=None, clear=None, stem: str = "bind") -> None:
        step = {"id": self._id(stem), "op": "bind", "select": select,
                "continue_on_error": True}
        if clear:
            step["clear"] = clear
        if add:
            step["add"] = add
        self.spec["steps"].append(step)

    def annotation(self, select: str, name: str, value: str) -> None:
        self.spec["steps"].append({"id": self._id("annotate"), "op": "annotation_set",
                                   "select": select, "name": name, "value": value,
                                   "continue_on_error": True})

    def dump(self) -> str:
        return json.dumps(self.spec, ensure_ascii=False, indent=2) + "\n"


# --------------------------------------------------------------------------- #
# Namen
# --------------------------------------------------------------------------- #
def slicer_names(nspec: dict, page: dict):
    """Slicer-Namen wie das Tool sie vergibt — je Quellversion unterschiedlich."""
    filt = (nspec["zones"] or {}).get("filter") or {}
    src = nspec["sourceVersion"]
    names = []
    for i, s in enumerate(filt.get("slicers") or []):
        if src >= 3:
            names.append("mk_slicer_%s_p%d" % (slug(s["name"]), page["index"]))
        elif src == 2:
            names.append("p%d_slicer%d_%s" % (page["index"], i + 1, slug(s["name"])))
        else:
            names.append("slicer%d_%s" % (i + 1, slug(s["name"])))
    return names


# --------------------------------------------------------------------------- #
# Filterbereich: Ueberschrift, Hinweistext, Slicer-Ursprung (Tool 0.4.4)
# --------------------------------------------------------------------------- #
def filter_layout(nspec: dict):
    """Aufteilung des Filterbereichs — oder None ohne Filterzone.

    Specs vor Tool 0.4.4 kennen weder `heading` noch `text`: dann bleibt alles
    wie bisher (Ueberschrift „Filter", Slicer ab 40 px unter der Oberkante bzw.
    ab dem linken Rand der Leiste). Mit den neuen Schluesseln gilt:

    * `heading` (Text oder null): Ueberschrift oben, null = keine
    * `text` (Text oder null): Hinweistext unter der Ueberschrift (Panel) bzw.
      rechts daneben (Leiste oben, hoechstens 220 px breit wie im Tool)
    * die Slicer beginnen unter bzw. rechts neben beidem.
    """
    filt = (nspec["zones"] or {}).get("filter")
    if not filt:
        return None
    k = nspec["uiScale"]

    def px(base: float) -> int:
        return int(round(base * k))

    fx, fy, fw, fh = rect(filt)
    mode = filt.get("mode") or filt.get("side") or "right"
    new = "heading" in filt or "text" in filt
    if new:
        heading = filt.get("heading")
        heading = (str(heading).strip() or None) if heading is not None else None
        text = str(filt.get("text") or "").strip() or None
    else:
        heading, text = "Filter", None
    out = {"new": new, "mode": mode, "heading": heading, "text": text,
           "title": None, "textRect": None}
    if mode == "top":
        if not new:
            out["title"] = (fx + px(8), fy, px(56), fh)
            out["origin"] = (fx + px(8), fy + px(8))
            return out
        x = fx + px(8)
        if heading:
            w = max(px(56), px(len(heading) * 11 * 0.62 + 8))
            out["title"] = (x, fy, w, fh)
            x += w + px(8)
        if text:
            w = min(px(220), max(px(80), px(len(text) * 9.5 * 0.55)))
            out["textRect"] = (x, fy, w, fh)
            x += w + px(8)
        out["origin"] = (x, fy + px(8))
        return out
    if not new:
        out["title"] = (fx + px(8), fy + px(8), fw - px(16), px(24))
        out["origin"] = (fx + px(8), fy + px(40))
        return out
    y = fy + px(8)
    if heading:
        out["title"] = (fx + px(8), y, fw - px(16), px(24))
        y += px(32)
    if text:
        inner = max(1, fw - px(16))
        per_line = max(1, int(inner / max(1.0, 9.5 * 0.55 * k)))
        lines = min(6, max(1, -(-len(text) // per_line)))
        h = lines * px(13) + px(2)
        out["textRect"] = (fx + px(8), y, inner, h)
        y += h + px(8)
    out["origin"] = (fx + px(8), y)
    return out


def slicer_type(s: dict):
    """Slicer-Art aus der Spec, oder None (aeltere Specs: nichts setzen)."""
    t = str((s or {}).get("type") or "").strip().lower()
    return t if t in SLICER_FORMAT else None


# --------------------------------------------------------------------------- #
# Native Visuals + Slicer  (wie export.js -> buildPbir, aber je Seite)
# --------------------------------------------------------------------------- #
def build_pbir_visuals(nspec: dict, page: dict, ck_fallback: bool = False):
    out = []
    skipped = []
    for v in page["visuals"]:
        native = v.get("native")
        if not native or is_text_tile(v):
            continue
        if v.get("engine") != "native" and not (ck_fallback and v.get("engine") == "ck"):
            continue
        if has_empty_required_role(v):
            skipped.append(v)
            continue
        buckets = native.get("buckets") or {}

        # --- Achse per Feldparameter: Kategorie-Felder durch die Parameterspalte
        #     ersetzen. Der Bucket wird gesucht, nicht geraten (siehe param_bucket).
        fp = field_param(v)
        fp_bucket, fp_refs = (param_bucket(v, buckets) if fp else (None, []))

        fields = {}
        for bucket, entries in buckets.items():
            refs = [f["ref"] for f in entries]
            if fp and bucket == fp_bucket:
                keep = [r for r in refs if r not in fp_refs]
                refs = [param_ref(fp)] + keep
            fields[bucket] = refs[0] if len(refs) == 1 else refs

        # --- Small Multiples: eigener Bucket, den das Katalog-Mapping nicht kennt.
        #     `Rows` gibt es nur bei den kartesischen Typen (verifiziert mit
        #     `pbir schema roles`); alles andere bleibt ein To-do.
        smf = sm_field(v)
        if (smf and native["type"] in SMALL_MULTIPLES_TYPES
                and SMALL_MULTIPLES_BUCKET not in fields):
            fields[SMALL_MULTIPLES_BUCKET] = smf

        out.append(vis(native["type"], v["id"], v.get("title") or v.get("label", ""),
                       *rect(v["rect"]), fields=fields or None))

    filt = (nspec["zones"] or {}).get("filter")
    if filt:
        k = nspec["uiScale"]
        pad = round(8 * k)
        fx, fy, fw, fh = rect(filt)
        ox, oy = filter_layout(nspec)["origin"]
        names = slicer_names(nspec, page)
        for i, s in enumerate(filt.get("slicers") or []):
            if filt.get("mode") == "top":
                x, y = ox + i * round(168 * k), fy + pad
                w, h = round(160 * k), fh - 2 * pad
            else:
                x, y = fx + pad, oy + i * round(64 * k)
                w, h = fw - 2 * pad, round(56 * k)
            out.append(vis("slicer", names[i], s["name"], x, y, w, h,
                           fields={"Values": s["ref"]}))
    return out, skipped


# --------------------------------------------------------------------------- #
# Custom Visuals (engine: "custom") — pbir kann sie nicht anlegen
# --------------------------------------------------------------------------- #
# Verifiziert mit pbir 0.9.32:
#   pbir add visual <GUID> ...            -> "Unknown visual type '<GUID>'"
#   pbir add visual --from-json           -> dieselbe Meldung, und die GANZE Datei
#                                            wird abgelehnt ("no visuals were created")
#   pbir visuals bind --add <rolle>:...   -> nur Rollen, die in der queryState schon
#                                            stehen ("Role 'x' not valid ... Available:")
# Deshalb: Platzhalter-`shape` mit pbir anlegen (dann stimmen Ordner, Name und
# Seiteneintrag) und die visual.json anschliessend durch die hier erzeugte
# Fassung ersetzen. `pbir validate --fields` nimmt sie an (verifiziert).
def _lit(value) -> dict:
    """Literal-Ausdruck in der Form, die pbir schreibt (Zahlen mit D-Suffix)."""
    if isinstance(value, bool):
        text = "true" if value else "false"
    elif isinstance(value, int):
        text = "%dD" % value
    elif isinstance(value, float):
        text = "%gD" % value
    else:
        text = "'%s'" % str(value).replace("'", "''")
    return {"expr": {"Literal": {"Value": text}}}


def _solid(color: str) -> dict:
    return {"solid": {"color": _lit(color)}}


def _container(props: dict) -> list:
    return [{"properties": props}]


def custom_query_state(buckets: dict) -> dict:
    """`customVisual.buckets` -> `visual.query.queryState` (wie bei nativen Visuals)."""
    state = {}
    for role, entries in (buckets or {}).items():
        projections = []
        for i, entry in enumerate(entries or []):
            ref = entry.get("ref") or ""
            table, prop = split_ref(ref)
            is_measure = entry.get("kind") == "measure"
            node = "Measure" if is_measure else "Column"
            proj = {"field": {node: {"Expression": {"SourceRef": {"Entity": table}},
                                     "Property": prop}},
                    "queryRef": ref,
                    "nativeQueryRef": prop}
            if i == 0 and not is_measure:
                proj["active"] = True          # wie bei Gruppierungsrollen ueblich
            projections.append(proj)
        if projections:
            state[role] = {"projections": projections}
    return state


def custom_visual_json(v: dict, st) -> dict:
    """Vollstaendige PBIR-visual.json einer Custom-Visual-Kachel."""
    cv = v.get("customVisual") or {}
    x, y, w, h = rect(v["rect"])
    title = v.get("title") or ""
    subtitle = (v.get("subtitle") or "").strip()
    title_props = {"show": _lit(bool(title)), "text": _lit(title)}
    sub_props = {"show": _lit(bool(subtitle)), "text": _lit(subtitle)}
    ts = st.typo(v) if hasattr(st, "typo") else None
    if ts:                                   # Tool 0.4.3: design.typography
        title_props["fontSize"] = _lit(ts["titlePt"])
        sub_props["fontSize"] = _lit(ts["subPt"])
    container = {
        "title": _container(title_props),
        "subTitle": _container(sub_props),
        "background": _container({"show": _lit(True), "color": _solid(st.tile_bg),
                                  "transparency": _lit(0)}),
    }
    border = {"show": _lit(st.tile_style == "border")}
    if st.tile_style == "border":
        border["color"] = _solid(st.tile_border)
    if st.radius:
        border["radius"] = _lit(st.radius)
    container["border"] = _container(border)
    if st.tile_style == "shadow":
        container["dropShadow"] = _container(
            {"show": _lit(True), "preset": _lit("BottomRight"),
             "color": _solid(st.ink), "transparency": _lit(85)})
    else:
        container["dropShadow"] = _container({"show": _lit(False)})
    return {
        "$schema": VISUAL_SCHEMA,
        "name": v["id"],
        "position": {"x": x, "y": y, "z": Z["content"],
                     "width": w, "height": h, "tabOrder": 0},
        "visual": {
            "visualType": cv.get("guid"),
            "query": {"queryState": custom_query_state(cv.get("buckets"))},
            "objects": {},
            "drillFilterOtherVisuals": True,
            "visualContainerObjects": container,
        },
    }


def custom_bucket_warnings(v: dict, info, buckets: dict):
    """Leere Pflichtrollen des Custom Visuals — das Mockup erzwingt sie nicht."""
    cv = v.get("customVisual") or {}
    warn = []
    if not info:
        warn.append("Custom Visual `%s` (GUID `%s`) steht nicht in der Registry des "
                    "Skills — Pflichtrollen ungeprueft. capabilities.json des Visuals "
                    "gegenlesen." % (cv.get("name") or "?", cv.get("guid") or "?"))
        return warn
    for group in info.get("required") or []:
        if not any(buckets.get(role) for role in group):
            warn.append("Pflichtrolle %s ist leer — %s zeichnet ohne sie nichts. "
                        "Feld im Mockup nachtragen oder im Bericht nachbinden."
                        % (" bzw. ".join("`%s`" % r for r in group), info["label"]))
    unknown = [r for r in (buckets or {}) if r not in (info.get("roles") or [])]
    if unknown:
        warn.append("Rolle(n) %s stehen nicht in der capabilities.json von %s — "
                    "Power BI ignoriert sie."
                    % (", ".join("`%s`" % r for r in sorted(unknown)), info["label"]))
    return warn


def build_custom_visuals(nspec: dict, page: dict, st):
    """(Slot-Liste, Warnungen) fuer alle Kacheln mit `engine: "custom"`."""
    slots, warn = [], []
    for v in page["visuals"]:
        if v.get("engine") != "custom":
            continue
        cv = v.get("customVisual") or {}
        name, info = custom_visual_info(cv)
        buckets = {role: [f.get("ref") for f in entries]
                   for role, entries in (cv.get("buckets") or {}).items() if entries}
        w = custom_bucket_warnings(v, info, cv.get("buckets") or {})
        x, y, cw, ch = rect(v["rect"])
        slots.append({
            "id": v["id"], "stableId": v.get("stableId"), "page": page["name"],
            "kind": v.get("kind"), "label": v.get("label"),
            "title": v.get("title", ""), "subtitle": v.get("subtitle", ""),
            "visualName": cv.get("name"), "guid": cv.get("guid"),
            "registryName": name,
            "pbiviz": (info or {}).get("pbiviz"),
            "source": (info or {}).get("source"),
            "rect": {"x": x, "y": y, "w": cw, "h": ch},
            "buckets": buckets,
            "mockupRoles": {k: [f["ref"] for f in fl]
                            for k, fl in (v.get("roles") or {}).items()},
            "analysis": v.get("analysis"), "workshop": v.get("workshop"),
            "notes": v.get("notes", ""),
            "file": "custom-visuals/%s.visual.json" % v["id"],
            "warnings": w,
            "visualJson": custom_visual_json(v, st),
        })
        warn.extend("[%s / %s] %s" % (page["name"], v["id"], m) for m in w)
    return slots, warn


CUSTOM_HEAD = {
    "sh": """#!/usr/bin/env bash
# Custom Visuals dieser Seite. `pbir add visual` kennt die GUIDs nicht
# ("Unknown visual type"), und `--from-json` lehnt dann die GANZE Datei ab.
# Deshalb: Platzhalter-Shape mit pbir anlegen (Ordner, Visualname und
# Seiteneintrag entstehen korrekt), dann die visual.json ersetzen.
# ZULETZT ausfuehren — nach chrome-batch.json, sonst ueberschreibt die Kopie
# die Formatierung wieder (sie steckt bereits in der erzeugten Datei).
# Voraussetzung: die .pbiviz ist im Bericht importiert (Desktop-Schritt).
set -uo pipefail
""",
    "ps1": """# Custom Visuals dieser Seite. `pbir add visual` kennt die GUIDs nicht
# ("Unknown visual type"), und `--from-json` lehnt dann die ganze Datei ab.
# Deshalb: Platzhalter-Shape mit pbir anlegen, dann die visual.json ersetzen.
# ZULETZT ausfuehren - nach chrome-batch.json.
# Voraussetzung: die .pbiviz ist im Bericht importiert (Desktop-Schritt).
$ErrorActionPreference = 'Continue'
""",
}


def render_custom_commands(slots, report: str, page: dict, out_dir: str,
                           flavour: str) -> str:
    """Platzhalter anlegen und die erzeugte visual.json daruebersetzen."""
    q = q_sh if flavour == "sh" else q_ps
    L = [CUSTOM_HEAD[flavour]]
    if flavour == "sh":
        L += ['REPORT=%s' % q(report),
              'PAGE=%s' % q(page["name"]),
              'OUT=%s' % q(out_dir),
              'P="$REPORT/$PAGE.Page"', ""]
    else:
        L += ['$Report = %s' % q(report),
              '$Page = %s' % q(page["name"]),
              '$Out = %s' % q(out_dir),
              '$P = "$Report/$Page.Page"', ""]
    for slot in slots:
        r = slot["rect"]
        L.append("# %s — %s (%s)"
                 % (slot["title"] or slot["id"], slot["visualName"], slot["guid"]))
        for w in slot["warnings"]:
            L.append("#   ! %s" % w)
        title = slot["title"] or slot["id"]
        if flavour == "sh":
            L.append('pbir add visual shape "$P" -n %s -x %d -y %d -w %d -h %d -t %s'
                     % (q(slot["id"]), r["x"], r["y"], r["w"], r["h"], q(title)))
            L.append('D=$(find "$REPORT/definition/pages" -type d -name %s | head -1)'
                     % q(slot["id"]))
            L.append('if [ -n "$D" ]; then cp "$OUT/%s" "$D/visual.json"; '
                     'else echo "%s: Visualordner nicht gefunden"; fi'
                     % (slot["file"], slot["id"]))
        else:
            L.append('pbir add visual shape "$P" -n %s -x %d -y %d -w %d -h %d -t %s'
                     % (q(slot["id"]), r["x"], r["y"], r["w"], r["h"], q(title)))
            L.append('$D = Get-ChildItem -Path "$Report/definition/pages" -Directory '
                     '-Recurse -Filter %s | Select-Object -First 1' % q(slot["id"]))
            L.append('if ($D) { Copy-Item "$Out/%s" (Join-Path $D.FullName '
                     '"visual.json") -Force }' % slot["file"])
        L.append("")
    if flavour == "sh":
        L += ['pbir validate "$REPORT" --fields', ""]
    else:
        L += ['pbir validate "$Report" --fields', ""]
    return "\n".join(L)


# --------------------------------------------------------------------------- #
# Farben und Schriftgroessen aus `design`
# --------------------------------------------------------------------------- #
class Style:
    """Leitet aus design + CLI-Optionen die konkreten Werte fuer das Chrome ab."""

    def __init__(self, nspec: dict, opt) -> None:
        d = nspec["design"]
        c = d["colors"]                      # von mockup_spec.normalise_design gefuellt
        self.nspec = nspec
        self.design = d
        self.scale = d["fontScale"]
        # `--ink` ueberschreibt `design.colors.ink`; ohne Flag gewinnt die Spec.
        self.ink = opt.ink or c["ink"]
        self.on_ink = opt.on_ink
        self.muted_on_ink = opt.muted_on_ink
        self.muted = opt.muted
        self.panel = opt.panel
        self.tile_border = opt.tile_border
        self.accent = d["accent"] or self.ink
        self.tile_bg = c["tileBackground"]
        self.page_bg = c["pageBackground"]
        self.radius = int(d["cornerRadius"] or 0)
        self.tile_style = d["tileStyle"] or "border"
        self.palette = d["variancePalette"]
        self.good = d["varianceColors"]["good"]
        self.bad = d["varianceColors"]["bad"]
        self.dark_mode = bool(d["darkMode"])

        style = (d["headerStyle"] or "dark").lower()
        self.header_style = style
        # Grundfarben kommen aus `design.colors` — fuer die Stile light/dark/accent
        # sind die Vorgaben identisch mit der frueheren Herleitung, `custom` traegt
        # seine Farben selbst.
        self.header_bg = c["headerBackground"]
        self.header_fg = c["headerInk"]
        if style == "light":
            self.header_muted = self.muted
            self.header_rule = self.tile_border
        elif style == "accent":
            self.header_muted = self.on_ink
            self.header_rule = None
        elif style == "custom":
            light = is_light(self.header_bg)
            self.header_muted = self.muted if light else self.muted_on_ink
            self.header_rule = self.tile_border if light else None
        else:
            self.header_muted = self.muted_on_ink
            self.header_rule = None

    def sz(self, base: float) -> int:
        """Schriftgroesse skaliert, auf den pbir-Bereich 6-45 begrenzt."""
        return max(6, min(45, int(round(base * self.scale))))

    def fsz(self, base: float):
        """Wie sz(), aber auf 0,5 genau (fuer die kleinen 9,5-px-Texte aus 0.4.3/0.4.4)."""
        return half_pt(base * self.scale)

    def typo(self, visual=None):
        """Wirksame Schriftgroessen aus `design.typography` (None = alte Spec)."""
        return type_sizes(self.nspec, visual)

    def px(self, base: float) -> int:
        return int(round(base * self.scale))


# --------------------------------------------------------------------------- #
# Chrome je Seite
# --------------------------------------------------------------------------- #
def build_chrome(nspec: dict, page: dict, st: Style, opt):
    zones = nspec["zones"] or {}
    visuals = []
    cmds = Commands()
    acts = Commands()         # Button-Aktionen: kein Batch-Op, also CLI
    batch_props = {}          # visual -> {prop: value}   (fuer chrome-batch.json)
    notes = []

    def bset(name: str, prop: str, value) -> None:
        batch_props.setdefault(name, {})[prop] = value

    cmds.note("Seitenhintergrund aus design.pageBackground")
    cmds.add("pbir", "pages", "background", "{page}", "--color", st.page_bg,
             "--transparency", "0")
    cmds.note("")

    def band(name: str, title: str, x, y, w, h, color: str, z: int = Z["bg"],
             rounded: bool = False) -> None:
        visuals.append(vis("shape", name, title, x, y, w, h))
        cmds.note("%s — Flaeche" % title)
        # Achtung: der Enum-Wert heisst `rectangleRounded`, nicht
        # `roundedRectangle` — pbir lehnt Letzteres ab.
        shape_val = "rectangleRounded" if rounded and st.radius else "rectangle"
        cmds.set_prop(name, "shape.tileShape", shape_val)
        bset(name, "shape.tileShape", shape_val)
        if rounded and st.radius:
            cmds.set_prop(name, "shape.rectangleRoundedCurve", str(st.radius))
            bset(name, "shape.rectangleRoundedCurve", st.radius)
        for prop, value in (("fill.show", True), ("fill.fillColor", color),
                            ("outline.show", False)):
            cmds.set_prop(name, prop, str(value).lower() if isinstance(value, bool) else value)
            bset(name, prop, value)
        cmds.position(name, "--z", str(z))
        bset(name, "__z", z)
        cmds.note("")

    def label(name: str, title: str, x, y, w, h, text: str, *,
              size: int, color: str, bold: bool = False, align: str = "left",
              valign: str = "middle", z: int = Z["text"]) -> None:
        visuals.append(vis("shape", name, title, x, y, w, h))
        cmds.note("%s — Text (Shape ohne Fuellung; Textboxen koennen per CLI "
                  "keinen Text bekommen)" % title)
        props = [("fill.show", False), ("outline.show", False), ("text.text", text),
                 ("text.fontSize", size), ("text.fontColor", color),
                 ("text.horizontalAlignment", align),
                 ("text.verticalAlignment", valign)]
        if bold:
            props.append(("text.bold", True))
        for prop, value in props:
            cmds.set_prop(name, prop,
                          str(value).lower() if isinstance(value, bool) else value)
            bset(name, prop, value)
        cmds.position(name, "--z", str(z))
        bset(name, "__z", z)
        cmds.note("")

    hinted = []

    def nav_button(name: str, text: str, x, y, w, h, target: str, *,
                   active: bool, fg: str, size=None, outline=None) -> None:
        visuals.append(vis("actionButton", name, text, x, y, w, h))
        if not hinted:
            hinted.append("x")
            cmds.note("Achtung: pbir schreibt --target 1:1 in navigationSection.")
            cmds.note("Springt der Button in Desktop nicht, den INTERNEN Seitennamen")
            cmds.note("(page.json -> name, z. B. c98a70696fe77757) als --target setzen.")
            cmds.note("")
        cmds.note("Nav-Button '%s'%s" % (text, " — aktive Seite, ohne Aktion"
                                         if active else " -> Seite '%s'" % target))
        if active:
            props = [("fill.show", True), ("fill.fillColor", st.accent),
                     ("text.fontColor", st.on_ink)]
        else:
            props = [("fill.show", False), ("text.fontColor", fg)]
        if outline and not active:
            # Fussleisten-Navigation: duenner Rahmen wie im Tool
            # (actionButton outline.show/lineColor/weight — pbir schema describe)
            props += [("outline.show", True), ("outline.lineColor", outline),
                      ("outline.weight", 1)]
        else:
            props += [("outline.show", False)]
        props += [("text.text", text),
                  ("text.fontSize", st.sz(10) if size is None else size),
                  ("text.horizontalAlignment", "center"),
                  ("text.verticalAlignment", "middle")]
        for prop, value in props:
            cmds.set_prop(name, prop,
                          str(value).lower() if isinstance(value, bool) else value)
            bset(name, prop, value)
        if not active:
            cmds.add("pbir", "visuals", "action", "{page}/%s.Visual" % name,
                     "--type", "PageNavigation", "--target", target)
            acts.note("Nav-Button '%s' -> Seite '%s'" % (text, target))
            acts.add("pbir", "visuals", "action", "{page}/%s.Visual" % name,
                     "--type", "PageNavigation", "--target", target)
            acts.note("")
        cmds.position(name, "--z", str(Z["button"]))
        bset(name, "__z", Z["button"])
        cmds.note("")

    header = zones.get("header") or {}
    nav_zone = zones.get("nav")
    # `zones.header.navOn` (ab Tool 0.4.1, Vorgabe true): ist es false, gehoeren
    # KEINE Seitennavigations-Buttons ins Kopfband. Das Tool liefert `nav` dann
    # ohnehin leer — die Flagge wird trotzdem ausgewertet, damit eine von Hand
    # geschriebene Spec mit `navOn: false` und gefuellter `nav`-Liste nicht
    # heimlich doch Buttons bekommt.
    # Ab Tool 0.4.3 entscheidet `navPosition` (header | footer | off); navOn ist
    # dann nur noch die Kurzform fuer navPosition == "header".
    nav_pos = nav_position(zones)
    has_nav_pos = any("navPosition" in (zones.get(key) or {})
                      for key in ("header", "footer"))
    header_nav_on = nav_pos == "header"
    nav_entries = ([str(n) for n in (header.get("nav") or []) if str(n).strip()]
                   if header_nav_on else [])
    footer_entries = footer_nav_entries(zones)
    if header and nav_pos == "off":
        notes.append("Kopfband ohne Seitennavigation (%s) — "
                     "es werden keine `chrome_nav_*`-Buttons angelegt. Seitenwechsel "
                     "laeuft ueber die Registerkarten"
                     % ('`navPosition: "off"`' if has_nav_pos
                        else "`zones.header.navOn: false`")
                     + (" bzw. die linke Nav-Leiste." if nav_zone else "."))

    # ---- Nav-Leiste (links) --------------------------------------------- #
    if nav_zone:
        nx, ny, nw, nh = rect(nav_zone)
        band("chrome_nav_bg", "Nav-Leiste", nx, ny, nw, nh, st.ink)
        entries = [str(n) for n in (nav_zone.get("pages") or nav_entries)]
        top = ny + st.px(16)
        if header.get("logo") or (header.get("logoPos") or "none") != "none":
            size = st.px(40)
            visuals.append(vis("shape", "chrome_logo", "Logo",
                               nx + st.px(12), ny + st.px(12), size, size))
            cmds.note("Logo-Platzhalter — durch ein Bild ersetzen:")
            cmds.note('  pbir rm "{page}/chrome_logo.Visual" -f')
            cmds.note('  pbir add visual image "{page}" -n chrome_logo '
                      '-x %d -y %d -w %d -h %d --image "<Pfad zum Logo>"'
                      % (nx + st.px(12), ny + st.px(12), size, size))
            for prop, value in (("fill.show", False), ("outline.show", True),
                                ("outline.lineColor", st.on_ink),
                                ("text.text", "LOGO"), ("text.fontSize", st.sz(8)),
                                ("text.fontColor", st.on_ink),
                                ("text.horizontalAlignment", "center")):
                cmds.set_prop("chrome_logo", prop,
                              str(value).lower() if isinstance(value, bool) else value)
                bset("chrome_logo", prop, value)
            cmds.position("chrome_logo", "--z", str(Z["text"]))
            bset("chrome_logo", "__z", Z["text"])
            cmds.note("")
            top = ny + st.px(72)
        step, bh = st.px(48), st.px(40)
        for i, entry in enumerate(entries):
            nav_button("chrome_nav_%d" % (i + 1), entry, nx + st.px(8), top + i * step,
                       max(32, nw - st.px(16)), bh, entry,
                       active=(entry == page["name"]), fg=st.on_ink)
        nav_entries = []  # im Kopfband nicht noch einmal

    # ---- Kopfband -------------------------------------------------------- #
    if header:
        hx, hy, hw, hh = rect(header)
        band("chrome_header_bg", "Kopfband", hx, hy, hw, hh, st.header_bg)
        if st.header_rule:
            visuals.append(vis("shape", "chrome_header_rule", "Kopfband-Unterkante",
                               hx, hy + hh - 1, hw, 1))
            cmds.note("Kopfband-Unterkante (heller Kopfband-Stil braucht eine Trennlinie)")
            for prop, value in (("fill.show", True),
                                ("fill.fillColor", st.header_rule),
                                ("outline.show", False)):
                cmds.set_prop("chrome_header_rule", prop,
                              str(value).lower() if isinstance(value, bool) else value)
                bset("chrome_header_rule", prop, value)
            cmds.position("chrome_header_rule", "--z", str(Z["bg"] + 1))
            bset("chrome_header_rule", "__z", Z["bg"] + 1)
            cmds.note("")

        text_left = hx + st.px(16)

        # Burger-Button fuer das Overlay-Filterpanel
        filt = zones.get("filter") or {}
        burger = bool(header.get("burger")) or filt.get("mode") == "burger"
        if burger:
            bw, bh = st.px(84), st.px(28)
            by = hy + (hh - bh) // 2
            visuals.append(vis("actionButton", "chrome_burger", "Filter-Menü",
                               text_left, by, bw, bh))
            cmds.note("Burger-Button — oeffnet das Filter-Overlay ueber ein Lesezeichen")
            for prop, value in (("fill.show", True), ("fill.fillColor", st.accent),
                                ("outline.show", False),
                                ("text.text", "☰ Filter"),
                                ("text.fontSize", st.sz(10)),
                                ("text.fontColor", st.on_ink),
                                ("text.horizontalAlignment", "center"),
                                ("text.verticalAlignment", "middle")):
                cmds.set_prop("chrome_burger", prop,
                              str(value).lower() if isinstance(value, bool) else value)
                bset("chrome_burger", prop, value)
            cmds.position("chrome_burger", "--z", str(Z["button"]))
            bset("chrome_burger", "__z", Z["button"])
            cmds.note("")
            text_left += bw + st.px(12)

        logo_pos = header.get("logoPos")
        if logo_pos is None:
            logo_pos = "left" if header.get("logo") else "none"
        if logo_pos != "none" and not nav_zone:
            logo_h = min(st.px(32), max(16, hh - st.px(24)))
            logo_w = st.px(120)
            logo_y = hy + (hh - logo_h) // 2
            logo_x = (hx + hw - st.px(16) - logo_w) if logo_pos == "right" else text_left
            visuals.append(vis("shape", "chrome_logo", "Logo",
                               logo_x, logo_y, logo_w, logo_h))
            cmds.note("Logo-Platzhalter — durch ein Bild ersetzen:")
            cmds.note('  pbir rm "{page}/chrome_logo.Visual" -f')
            cmds.note('  pbir add visual image "{page}" -n chrome_logo '
                      '-x %d -y %d -w %d -h %d --image "<Pfad zum Logo>"'
                      % (logo_x, logo_y, logo_w, logo_h))
            for prop, value in (("fill.show", False), ("outline.show", True),
                                ("outline.lineColor", st.header_fg),
                                ("text.text", "LOGO"), ("text.fontSize", st.sz(8)),
                                ("text.fontColor", st.header_fg),
                                ("text.horizontalAlignment", "center")):
                cmds.set_prop("chrome_logo", prop,
                              str(value).lower() if isinstance(value, bool) else value)
                bset("chrome_logo", prop, value)
            cmds.position("chrome_logo", "--z", str(Z["text"]))
            bset("chrome_logo", "__z", Z["text"])
            cmds.note("")
            if logo_pos == "left":
                text_left = logo_x + logo_w + st.px(16)

        # Nav-Buttons rechtsbuendig im Kopfband
        right = hx + hw - st.px(16)
        if logo_pos == "right" and not nav_zone:
            right -= st.px(120) + st.px(16)
        if nav_entries:
            bw, gap = st.px(112), st.px(8)
            bh = min(st.px(32), max(st.px(24), hh - st.px(16)))
            by = hy + (hh - bh) // 2
            block = len(nav_entries) * bw + (len(nav_entries) - 1) * gap
            start = max(text_left + st.px(160), right - block)
            for i, entry in enumerate(nav_entries):
                nav_button("chrome_nav_%d" % (i + 1), entry,
                           start + i * (bw + gap), by, bw, bh, entry,
                           active=(entry == page["name"]), fg=st.header_fg)
            right = start - st.px(16)

        title = header.get("title") or page["name"] or ""
        subtitle = header.get("subtitle") or ""
        text_w = max(st.px(120), right - text_left)
        if title and subtitle and hh >= st.px(48):
            label("chrome_header_title", "Kopfband-Titel", text_left, hy + st.px(6),
                  text_w, st.px(26), title, size=st.sz(16), color=st.header_fg, bold=True)
            label("chrome_header_subtitle", "Kopfband-Untertitel", text_left,
                  hy + st.px(32), text_w, max(st.px(14), hh - st.px(38)), subtitle,
                  size=st.sz(10), color=st.header_muted)
        elif title:
            label("chrome_header_title", "Kopfband-Titel", text_left,
                  hy + (hh - st.px(28)) // 2, text_w, st.px(28), title,
                  size=st.sz(16), color=st.header_fg, bold=True)
            if subtitle:
                notes.append("Kopfband ist zu niedrig fuer einen Untertitel — "
                             "'%s' nicht platziert." % subtitle)

    # ---- Filter-Panel ---------------------------------------------------- #
    filt = zones.get("filter")
    if filt:
        fx, fy, fw, fh = rect(filt)
        mode = filt.get("mode") or filt.get("side") or "right"
        overlay = bool(filt.get("overlay")) or mode == "burger"
        z_bg = Z["overlay"] if overlay else Z["bg"]
        z_tx = Z["overlayText"] if overlay else Z["text"]
        z_bt = Z["overlayButton"] if overlay else Z["button"]
        band("chrome_filter_bg", "Filter-Panel", fx, fy, fw, fh, st.panel,
             z=z_bg, rounded=overlay)
        fl = filter_layout(nspec)
        if not fl["new"]:
            if mode == "top":
                label("chrome_filter_title", "Filter-Überschrift", fx + st.px(8), fy,
                      st.px(56), fh, "Filter", size=st.sz(11), color=st.ink, bold=True,
                      z=z_tx)
            else:
                label("chrome_filter_title", "Filter-Überschrift", fx + st.px(8),
                      fy + st.px(8), fw - st.px(16), st.px(24), "Filter",
                      size=st.sz(11), color=st.ink, bold=True, z=z_tx)
        else:
            # Tool 0.4.4: Ueberschrift frei oder aus, dazu ein Hinweistext —
            # beides als Shape mit Text wie die uebrigen Chrome-Texte.
            if fl["heading"]:
                label("chrome_filter_title", "Filter-Überschrift", *fl["title"],
                      fl["heading"], size=st.sz(11), color=st.ink, bold=True,
                      z=z_tx)
            else:
                notes.append("Filterbereich ohne Überschrift (`zones.filter.heading: "
                             "null`) — es entsteht kein `chrome_filter_title`.")
            if fl["text"]:
                label("chrome_filter_text", "Filter-Hinweistext", *fl["textRect"],
                      fl["text"], size=st.fsz(9.5), color=st.muted,
                      valign="middle" if mode == "top" else "top", z=z_tx)
                if mode != "top" and len(fl["text"]) > 240:
                    notes.append("Der Hinweistext im Filterbereich ist lang (%d Zeichen) "
                                 "— `chrome_filter_text` ist auf höchstens sechs Zeilen "
                                 "bemessen; in Desktop gegenlesen." % len(fl["text"]))
        if mode == "top":
            notes.append("Filter als Leiste oben: die Slicer stehen nebeneinander "
                         "(%d px breit, Abstand %d px)." % (st.px(160), st.px(8)))

        if overlay or filt.get("collapsible"):
            cw = st.px(28)
            visuals.append(vis("actionButton", "chrome_filter_close",
                               "Filter schließen", fx + fw - cw - st.px(8),
                               fy + st.px(8), cw, st.px(24)))
            cmds.note("Schliessen-Button des Panels — Ziel ist das Lesezeichen "
                      "'Filter schliessen' (siehe navigation.md)")
            for prop, value in (("fill.show", False), ("outline.show", False),
                                ("text.text", "✕"),
                                ("text.fontSize", st.sz(11)),
                                ("text.fontColor", st.ink),
                                ("text.horizontalAlignment", "center"),
                                ("text.verticalAlignment", "middle")):
                cmds.set_prop("chrome_filter_close", prop,
                              str(value).lower() if isinstance(value, bool) else value)
                bset("chrome_filter_close", prop, value)
            cmds.position("chrome_filter_close", "--z", str(z_bt))
            bset("chrome_filter_close", "__z", z_bt)
            cmds.note("")

        if overlay:
            notes.append("Filter-Overlay: Panel, Ueberschrift, Schliessen-Button und "
                         "Slicer liegen ueber dem Inhalt und sind im Grundzustand "
                         "ausgeblendet. Lesezeichen und Button-Aktionen stehen in "
                         "navigation.md.")
        elif filt.get("collapsible"):
            notes.append("Filter-Panel ist als ausklappbar markiert: zwei Lesezeichen "
                         "(Panel ein/aus) — Rezept in navigation.md.")

        n_slicers = len(filt.get("slicers") or [])
        off_y = fl["origin"][1] - fy if fl["new"] else st.px(40)
        off_x = fl["origin"][0] - fx if fl["new"] else st.px(8)
        if mode != "top" and n_slicers and off_y + n_slicers * st.px(64) > fh:
            notes.append("%d Slicer passen rechnerisch nicht in das %d px hohe "
                         "Filter-Panel (%d + n*%d px)."
                         % (n_slicers, fh, off_y, st.px(64)))
        if mode == "top" and n_slicers and off_x + n_slicers * st.px(168) > fw:
            notes.append("%d Slicer passen rechnerisch nicht in die %d px breite "
                         "Filter-Leiste (%d + n*%d px)."
                         % (n_slicers, fw, off_x, st.px(168)))

    # ---- Fussleiste ------------------------------------------------------ #
    footer = zones.get("footer")
    if footer:
        gx, gy, gw, gh = rect(footer)
        text = footer.get("text") or ""
        # Tool 0.4.3: Seitennavigation rechtsbuendig in der Fussleiste, kleiner als
        # im Kopfband (Schrift 9,5 px x Skalierung, Abstand 5 px, Rand rechts
        # 16 px — wie render-png.js -> footerZone). Namen wie im Kopfband
        # (`chrome_nav_<i>`), damit navigation.md und Lesezeichen gleich bleiben.
        nav_w = 0
        if footer_entries:
            nfs = st.fsz(9.5)
            gap = st.px(5)
            bh = max(12, min(gh - st.px(4), st.px(20)))
            by = gy + (gh - bh) // 2
            widths = [max(st.px(48), st.px(len(e) * 9.5 * 0.56 + 16))
                      for e in footer_entries]
            block = sum(widths) + gap * (len(widths) - 1)
            x = gx + gw - st.px(16) - block
            for i, (entry, bw) in enumerate(zip(footer_entries, widths)):
                nav_button("chrome_nav_%d" % (i + 1), entry, x, by, bw, bh, entry,
                           active=(entry == page["name"]), fg=st.ink,
                           size=nfs, outline=st.tile_border)
                x += bw + gap
            nav_w = block + st.px(16)
        if text:
            label("chrome_footer_text", "Fußleiste", gx + st.px(16), gy,
                  max(st.px(40), gw - st.px(32) - nav_w), gh, text,
                  size=st.sz(9), color=st.muted)
    if nav_pos == "footer" and not footer:
        notes.append('Seitennavigation steht auf `navPosition: "footer"`, die '
                     "Fußleiste ist aber aus — es entstehen keine Nav-Buttons. "
                     "Fußleiste im Mockup einschalten oder die Navigation ins "
                     "Kopfband legen.")
    elif footer_entries:
        notes.append('Seitennavigation in der Fußleiste (`navPosition: "footer"`): '
                     "%d Buttons `chrome_nav_*` rechtsbündig, Schrift %s pt; "
                     "das Kopfband bleibt ohne Nav." % (len(footer_entries),
                                                       st.fsz(9.5)))

    return visuals, cmds, acts, notes, batch_props


# --------------------------------------------------------------------------- #
# Text- und Button-Kacheln (Spec v3: `content`)
# --------------------------------------------------------------------------- #
def build_text_tiles(nspec: dict, page: dict, st: Style, cmds: Commands,
                     acts: Commands, batch_props: dict, lang: str):
    """Text-/Button-Kacheln als shape bzw. actionButton mit echtem Text."""
    visuals, notes = [], []
    for v in page["visuals"]:
        if not is_text_tile(v):
            continue
        x, y, w, h = rect(v["rect"])
        name = v["id"]
        content = (v.get("content") or "").strip()
        is_button = v.get("kind") == "button"
        vtype = "actionButton" if is_button else "shape"
        visuals.append(vis(vtype, name, v.get("title") or "", x, y, w, h))
        cmds.note("%s-Kachel „%s\" — Text als %s "
                  "(eine Textbox bliebe per CLI leer)"
                  % ("Button" if is_button else "Text", v.get("title") or name, vtype))
        props = [("fill.show", True if is_button else False),
                 ("outline.show", False),
                 ("text.text", content or (v.get("title") or "")),
                 ("text.fontSize", st.sz(11 if not is_button else 10)),
                 ("text.fontColor", st.on_ink if is_button else st.ink),
                 ("text.horizontalAlignment", "center" if is_button else "left"),
                 ("text.verticalAlignment", "middle" if is_button else "top")]
        if is_button:
            props.insert(1, ("fill.fillColor", st.accent))
        for prop, value in props:
            cmds.set_prop(name, prop,
                          str(value).lower() if isinstance(value, bool) else value)
            batch_props.setdefault(name, {})[prop] = value
        cmds.position(name, "--z", str(Z["content"]))
        batch_props.setdefault(name, {})["__z"] = Z["content"]
        cmds.note("")
        if not content:
            notes.append("Kachel „%s\" (%s) hat keinen Text — im Bericht steht "
                         "sonst der Titel. Text im Workshop nachtragen."
                         % (v.get("title") or name, name))
        if is_button and v.get("link"):
            for c in (cmds, acts):
                c.note("Button-Kachel „%s\" -> Seite „%s\""
                       % (v.get("title") or name, v["link"]["pageName"]))
                c.add("pbir", "visuals", "action", "{page}/%s.Visual" % name,
                      "--type", "PageNavigation", "--target", v["link"]["pageName"])
                c.note("")
    return visuals, notes


def add_slicer_formatting(nspec: dict, page: dict, cmds: Commands,
                          batch_props: dict):
    """Slicer-Art (Tool 0.4.4) -> data.mode / general.orientation / Suche.

    Liefert Hinweise fuer checklist.md. Aeltere Specs ohne `type` bekommen
    nichts gesetzt (der Slicer bleibt, wie pbir ihn anlegt).
    """
    filt = (nspec["zones"] or {}).get("filter") or {}
    names = slicer_names(nspec, page)
    notes = []
    for i, s_ in enumerate(filt.get("slicers") or []):
        t = slicer_type(s_)
        if not t:
            continue
        name = names[i]
        cmds.note("Slicer „%s\" als %s (zones.filter.slicers[%d].type = %s)"
                  % (s_.get("name"), SLICER_TYPE_LABEL[t], i, t))
        for prop, value in SLICER_FORMAT[t].items():
            cmds.set_prop(name, prop,
                          str(value).lower() if isinstance(value, bool) else value)
            batch_props.setdefault(name, {})[prop] = value
        cmds.note("")
        if t == "date":
            notes.append("Slicer „%s\" ist ein Datumsbereich: `%s` muss vom Typ "
                         "Date/DateTime sein, sonst zeigt Power BI keinen Kalender "
                         "(`te get`)." % (s_.get("name"), s_.get("ref")))
        if t == "between" and s_.get("kind") != "measure":
            notes.append("Slicer „%s\" als Bereich von–bis: `%s` muss numerisch oder "
                         "ein Datum sein." % (s_.get("name"), s_.get("ref")))
        if t == "search":
            notes.append("Slicer „%s\": Suchfeld über `general.selfFilterEnabled` — "
                         "in Desktop prüfen, ob die Suche erscheint." % s_.get("name"))
    return notes


def add_typography(cmds: Commands, st: Style, page: dict, names) -> None:
    """Visual-Titel und -Untertitel aus `design.typography` (Tool 0.4.3).

    Nur bei Specs mit Typografie-Block; sonst regelt das Theme-Fragment die
    Titelgroesse wie bisher. Groessen in pt = px x 0,75, auf 0,5 gerundet.
    """
    if not st.typo():
        return {}
    by_id = {v["id"]: v for v in page["visuals"]}
    out = {}
    wrote_note = False
    for name in names:
        v = by_id.get(name)
        if not v or is_text_tile(v):
            continue
        ts = st.typo(v)
        if not wrote_note:
            base = st.typo()
            cmds.note("Typografie aus design.typography: Titel %s pt, Untertitel %s pt "
                      "(Kacheln mit eigener Skalierung weichen ab)"
                      % (base["titlePt"], base["subPt"]))
            wrote_note = True
        props = {"title.fontSize": ts["titlePt"], "subTitle.fontSize": ts["subPt"]}
        for prop, value in props.items():
            cmds.set_prop(name, prop, value)
        out[name] = props
    if wrote_note:
        cmds.note("")
    return out


def add_tile_formatting(cmds: Commands, st: Style, names, batch_props: dict) -> None:
    """Kachel-Container gemaess design.tileStyle / cornerRadius."""
    if not names:
        return
    cmds.note("Kachel-Container aus design: tileStyle '%s', Ecken %d px, "
              "Hintergrund %s — dasselbe steht als Theme-Fragment in "
              "theme-fragment.json (Theme schlaegt Overrides)"
              % (st.tile_style, st.radius, st.tile_bg))
    props = [("background.show", True), ("background.color", st.tile_bg),
             ("background.transparency", 0)]
    if st.tile_style == "shadow":
        props += [("border.show", False), ("dropShadow.show", True),
                  ("dropShadow.preset", "BottomRight"), ("dropShadow.color", st.ink),
                  ("dropShadow.transparency", 85)]
    elif st.tile_style == "flat":
        props += [("border.show", False), ("dropShadow.show", False)]
    else:
        props += [("border.show", True), ("border.color", st.tile_border),
                  ("border.width", 1), ("dropShadow.show", False)]
    if st.radius:
        props.append(("border.radius", st.radius))
    for name in names:
        for prop, value in props:
            cmds.set_prop(name, prop,
                          str(value).lower() if isinstance(value, bool) else value)
            batch_props.setdefault(name, {})[prop] = value
    cmds.note("")


# --------------------------------------------------------------------------- #
# Analyse-Angaben (Spec v3)
# --------------------------------------------------------------------------- #
def analysis_actions(nspec: dict, page: dict, built_names, lang: str):
    """Liefert (Commands, To-dos) fuer den Analyse-Block der Kacheln."""
    cmds = Commands()
    todos = []
    tr = T.get(lang, T["de"])
    label_props = {}
    seen_params = []                 # je Parameter nur ein Slicer-Vorschlag

    def todo(v, code, text):
        todos.append({"code": code, "page": page["name"], "visual": v["id"],
                      "title": v.get("title") or v["id"], "text": text})

    for v in page["visuals"]:
        a = v.get("analysis") or {}
        native = v.get("native") or {}
        vtype = native.get("type") or ""
        in_report = v["id"] in built_names
        path = "{page}/%s.Visual" % v["id"]

        # --- Small Multiples (Tool 0.4.1) ----------------------------------- #
        if isinstance(a.get("smallMultiples"), dict):
            smf = sm_field(v)
            engine = v.get("engine")
            if not smf:
                todo(v, "SM_NO_FIELD", tr["todo_sm_no_field"])
            elif engine in ("ck", "deneb", "custom"):
                todo(v, "SM_NOT_NATIVE", tr["todo_sm_not_native"]
                     % ("Ein ChartKitchen-Visual" if engine == "ck"
                        else "Deneb" if engine == "deneb" else "Das Custom Visual"))
            elif vtype and vtype not in SMALL_MULTIPLES_TYPES:
                todo(v, "SM_NO_BUCKET", tr["todo_sm_no_bucket"]
                     % (smf, vtype, SMALL_MULTIPLES_BUCKET))
            if smf and v.get("kind") in NO_VARIANT_KINDS:
                todo(v, "SM_KIND",
                     "Typ `%s` bietet im Mockup gar keine Small Multiples an — die "
                     "Angabe stammt nicht aus dem Tool. Beim Menschen nachfragen."
                     % v.get("kind"))

        # --- Achse per Feldparameter (Tool 0.4.1) --------------------------- #
        fp = field_param(v)
        if fp:
            pref = param_ref(fp)
            flds = fp.get("fields") or []
            if in_report:
                todo(v, "FIELDPARAM", tr["todo_fieldparam"]
                     % (fp["name"], ", ".join("`%s`" % f for f in flds) or "–", pref))
            else:
                todo(v, "FIELDPARAM_SLOT", tr["todo_fieldparam_slot"] % fp["name"])
            if len(flds) < 2:
                todo(v, "FIELDPARAM_FEW", tr["todo_fieldparam_few"]
                     % (fp["name"], len(flds)))
            todo(v, "FIELDPARAM_SLICER", tr["todo_fieldparam_slicer"] % pref)
            if fp["name"] not in seen_params:
                cmds.note("Slicer auf den Feldparameter „%s\" — Vorschlag, nicht "
                          "ausgefuehrt: das Mockup sieht diese Kachel nicht vor."
                          % fp["name"])
                cmds.note(param_slicer_hint(nspec, page, fp, len(seen_params)))
                cmds.note("")
                seen_params.append(fp["name"])

        # --- Polaritaet ---------------------------------------------------- #
        if a.get("polarity") == "lower":
            if v.get("engine") == "ck":
                todo(v, "CK_INVERT", "ChartKitchen-Slot: `chart.invert = true` setzen "
                                     "(kleiner = besser).")
            elif in_report:
                todo(v, "POLARITY", tr["todo_polarity"]
                     + (" (aus dem Kennzahlnamen abgeleitet)" if a.get("polarityAuto") else ""))

        # --- Sortierung ---------------------------------------------------- #
        sort = a.get("sort")
        if sort and in_report:
            by, direction = sort.get("by"), sort.get("dir") or "desc"
            pbir_dir = "Descending" if direction == "desc" else "Ascending"
            field = None
            if by == "value":
                field = lead_measure(v)
            elif by == "category":
                field = lead_category(v)
            if by == "delta":
                todo(v, "SORT_DELTA", tr["todo_delta_sort"])
            elif field:
                cmds.note("Sortierung: %s %s" % (by, direction))
                cmds.add("pbir", "visuals", "sort", path,
                         "--field", field["ref"], "--direction", pbir_dir)
            else:
                todo(v, "SORT_NO_FIELD",
                     "Sortierung nach %s verlangt ein Feld, die Kachel hat keines "
                     "gebunden." % by)
        elif sort and not in_report:
            where = ("das Custom Visual regelt" if v.get("engine") == "custom"
                     else "ChartKitchen/Deneb regeln")
            todo(v, "SORT_NOT_NATIVE",
                 "Sortierung %s %s: Kachel ist kein natives Visual im Bericht "
                 "(%s das selbst)." % (sort.get("by"), sort.get("dir"), where))

        # --- Top N --------------------------------------------------------- #
        if a.get("topN"):
            cat = lead_category(v)
            meas = lead_measure(v)
            if in_report and cat and meas:
                ct, cf = split_ref(cat["ref"])
                mt, mf = split_ref(meas["ref"])
                direction = "Bottom" if (a.get("sort") or {}).get("dir") == "asc" else "Top"
                cmds.note("Top %s nach %s" % (a["topN"], meas["ref"]))
                cmds.add("pbir", "add", "filter", ct, cf, "-v", path,
                         "--type", "TopN", "--n", str(a["topN"]),
                         "--by-table", mt, "--by-field", mf, "--direction", direction)
            else:
                todo(v, "TOPN",
                     "Top %s: braucht ein Kategorie-Feld und eine Kennzahl auf einem "
                     "nativen Visual — hier nicht beides vorhanden." % a["topN"])

        # --- Anzeigeeinheiten / Dezimalstellen ------------------------------ #
        du, dec = a.get("displayUnits"), a.get("decimals")
        if (du or dec is not None) and in_report:
            if vtype in NO_LABELS:
                todo(v, "DISPLAY_UNITS",
                     "Anzeigeeinheit/Dezimalstellen: `%s` kennt keine Datenbeschriftung "
                     "— Spalten- bzw. Kartenformat in Desktop pruefen." % vtype)
            else:
                props = {}
                if du in DISPLAY_UNITS:
                    props["labels.labelDisplayUnits"] = DISPLAY_UNITS[du]
                if dec is not None:
                    props["labels.labelPrecision"] = int(dec)
                label_props[v["id"]] = props
                cmds.note("Anzeigeeinheiten fuer %s" % v["id"])
                if du in DISPLAY_UNITS:
                    cmds.add("pbir", "visuals", "labels", path,
                             "--labelDisplayUnits", DISPLAY_UNITS_CLI[du])
                if dec is not None:
                    cmds.add("pbir", "visuals", "labels", path,
                             "--labelPrecision", str(int(dec)))
        elif du or dec is not None:
            where = ("im Format-Bereich des Custom Visuals (Desktop)"
                     if v.get("engine") == "custom"
                     else "im ChartKitchen- bzw. Deneb-Slot")
            todo(v, "DISPLAY_UNITS_SLOT",
                 "Anzeigeeinheit %s / %s Dezimalstellen %s setzen."
                 % (du or "auto", dec if dec is not None else "auto", where))

        # --- Einheit als Untertitel ----------------------------------------- #
        unit = a.get("unit")
        if unit and in_report and not (v.get("subtitle") or "").strip():
            cmds.note("Einheit als Untertitel")
            cmds.add("pbir", "set", "%s.subTitle.show" % path, "--value", "true")
            cmds.add("pbir", "set", "%s.subTitle.text" % path, "--value", unit)
            todo(v, "UNIT", tr["todo_unit"] % unit)

        # --- nicht setzbar: strukturierte To-dos ---------------------------- #
        if a.get("timeGrain"):
            todo(v, "TIME_GRAIN", tr["todo_timegrain"] % a["timeGrain"])
        if a.get("cumulative"):
            todo(v, "CUMULATIVE", tr["todo_cumulative"])
        if a.get("scaleGroup"):
            todo(v, "SCALE_GROUP", tr["todo_scalegroup"] % a["scaleGroup"])
        if a.get("message"):
            todo(v, "MESSAGE", tr["todo_message"] % (a["message"], v.get("title") or ""))
        # Nur bewusst gesetzte Basen melden — `auto` ist ein Vorschlag, keine Entscheidung
        if a.get("deltaBasis") and not a.get("deltaBasisAuto") and v.get("engine") == "ck":
            todo(v, "DELTA_BASIS",
                 "Δ-Basis %s%s -> ChartKitchen-Rolle `%s` belegen."
                 % (a["deltaBasis"], " (auto)" if a.get("deltaBasisAuto") else "",
                    "previousYear" if a["deltaBasis"] == "PY" else
                    "forecast" if a["deltaBasis"] == "FC" else "plan"))

        # --- Untertitel aus der Spec ---------------------------------------- #
        if (v.get("subtitle") or "").strip() and in_report:
            cmds.note("Untertitel aus der Spec")
            cmds.add("pbir", "set", "%s.subTitle.show" % path, "--value", "true")
            cmds.add("pbir", "set", "%s.subTitle.text" % path, "--value", v["subtitle"])

        # --- Notizen und Workshop-Status als Annotation ---------------------- #
        ann = []
        if (v.get("notes") or "").strip():
            ann.append(v["notes"].strip())
        w = v.get("workshop") or {}
        if w.get("priority"):
            ann.append("Prioritaet: %s" % w["priority"])
        if w.get("status") and w["status"] != "open":
            ann.append("Status: %s" % w["status"])
        if w.get("openQuestion"):
            ann.append("OFFENE FRAGE")
        if ann and in_report:
            cmds.note("Notiz/Workshop-Status als Annotation im Bericht ablegen")
            cmds.add("pbir", "add", "annotation", path, "--text", " · ".join(ann),
                     "--author", "mockup-to-powerbi", "--category", "Documentation")

    # --- Slicer-Vorauswahl -------------------------------------------------- #
    filt = (nspec["zones"] or {}).get("filter") or {}
    names = slicer_names(nspec, page)
    for i, s in enumerate(filt.get("slicers") or []):
        if not s.get("default"):
            continue
        table, field = split_ref(s["ref"])
        cmds.note("Vorauswahl im Slicer „%s\" = %s" % (s["name"], s["default"]))
        cmds.add("pbir", "add", "filter", table, field,
                 "-v", "{page}/%s.Visual" % names[i],
                 "--values", str(s["default"]))
        todos.append({"code": "SLICER_DEFAULT", "page": page["name"],
                      "visual": names[i], "title": s["name"],
                      "text": "Vorauswahl %s = %s: `pbir add filter` legt einen "
                              "kategorialen Visual-Filter an. In Desktop pruefen, ob "
                              "die Auswahl im Slicer sichtbar ist — sonst dort einmal "
                              "klicken und speichern." % (s["ref"], s["default"])})
    return cmds, todos, label_props


# --------------------------------------------------------------------------- #
# Slots fuer ChartKitchen und Deneb
# --------------------------------------------------------------------------- #
def ck_roles_for(v: dict):
    """Mockup-Rollen -> ChartKitchen-Rollen. Gibt (Mapping, Warnungen) zurueck."""
    import re
    warn = []
    roles = v.get("roles") or {}
    scenario = v.get("scenario") or ""
    tokens = [t for t in re.split(r"[/,\s]+", scenario) if t in ("PY", "PL", "BU")]
    ref_targets = ["plan" if t in ("PL", "BU") else "previousYear" for t in tokens]
    for cand in ("plan", "previousYear"):
        if cand not in ref_targets:
            ref_targets.append(cand)

    out = {}
    for key, fields in roles.items():
        refs = [f["ref"] for f in fields]
        if key == "ref":
            for i, r in enumerate(refs):
                target = ref_targets[i] if i < len(ref_targets) else "benchmark"
                out.setdefault(target, []).append(r)
            continue
        if key in CK_ROLE_UNSUPPORTED:
            warn.append("Rolle '%s' (%s) hat keine ChartKitchen-Entsprechung — Typ "
                        "`%s` kann ChartKitchen nicht." % (key, ", ".join(refs), v.get("kind")))
            continue
        target = CK_ROLE.get(key)
        if not target:
            warn.append("Rolle '%s' ist im Mapping nicht hinterlegt — bitte pruefen." % key)
            continue
        if key == "series" and v.get("kind") == "multiples":
            target = "multiples"
        out.setdefault(target, []).extend(refs)

    for role, refs in out.items():
        if len(refs) > 1 and role != "colgroup":
            warn.append("ChartKitchen-Rolle '%s' ist max. 1 Feld, hier %d: %s."
                        % (role, len(refs), ", ".join(refs)))
    return out, warn


def ck_contract_warnings(v: dict, orientation, roles: dict):
    """Regeln aus chartkitchen-report/references/field-contract.md."""
    warn = []
    kind = v.get("kind")
    scenario = v.get("scenario") or ""
    if orientation in ("waterfall", "pnl") and "rowType" not in roles:
        warn.append("Modus `%s` braucht die Rolle `rowType` (sum/delta je Zeile). "
                    "Das Mockup kennt die Rolle nicht — Spalte im Modell bereitstellen "
                    "und im Visual binden, sonst bleibt die Bruecke leer." % orientation)
    if kind == "colline":
        warn.append("Typ `colline`: die zweite Kennzahl gehoert in `lineMeasure` "
                    "(nur `orientation=columns`), nicht in `plan`/`previousYear`. "
                    "Mapping vor dem Binden korrigieren.")
    if "lineMeasure" in roles and orientation != "columns":
        warn.append("`lineMeasure` gibt es nur bei `orientation=columns`, hier `%s`."
                    % orientation)
    if "colgroup" in roles and orientation != "table":
        warn.append("`colgroup` gibt es nur bei `orientation=table`, hier `%s`."
                    % orientation)
    if "FC" in scenario.split("/") and "fcFlag" not in roles:
        warn.append("Szenario `%s` nennt FC, aber weder eine `fcFlag`-Spalte (Zahl 1/0) "
                    "noch eine `forecast`-Kennzahl ist gebunden. Eines von beidem "
                    "nachziehen, sonst zeichnet ChartKitchen keinen Forecast." % scenario)
    if roles.get("fcFlag"):
        warn.append("`fcFlag` muss die **Zahl** 1/0 liefern, kein Boolean "
                    "(%s pruefen)." % ", ".join(roles["fcFlag"]))
    return warn


def build_slots(page: dict, nspec=None):
    ck, deneb, warn = [], [], []
    for v in page["visuals"]:
        base = {"id": v["id"], "stableId": v.get("stableId"), "page": page["name"],
                "title": v.get("title", ""), "subtitle": v.get("subtitle", ""),
                "kind": v.get("kind"), "label": v.get("label"), "rect": v.get("rect"),
                "scenario": v.get("scenario"), "notes": v.get("notes", ""),
                "analysis": v.get("analysis"), "workshop": v.get("workshop"),
                "mockupRoles": {k: [f["ref"] for f in fl]
                                for k, fl in (v.get("roles") or {}).items()}}
        ts = type_sizes(nspec, v) if nspec else None
        if ts:
            # Tool 0.4.3: Schriftgroessen fuer den Slot (ChartKitchen/Deneb setzen
            # sie im eigenen Format-Bereich — pt fuer Titel, px fuer das Spec).
            base["typography"] = {"titlePt": ts["titlePt"], "subtitlePt": ts["subPt"],
                                  "labelPt": ts["chartPt"], "labelPx": ts["chartPx"],
                                  "tileScale": ts["tile"]}
        if v.get("engine") == "ck":
            roles, w = ck_roles_for(v)
            orientation = v.get("chartKitchenMode") or CK_ORIENTATION.get(v.get("kind"))
            if not orientation:
                w.append("Kein ChartKitchen-Modus (chart.orientation) fuer Typ `%s` — "
                         "Deneb oder natives Visual waehlen." % v.get("kind"))
            w += ck_contract_warnings(v, orientation, roles)
            a = v.get("analysis") or {}
            chart_props = {"orientation": orientation}
            if a.get("polarity") == "lower":
                chart_props["invert"] = True
            slot = dict(base)
            slot.update({"chartKitchenType": v.get("chartKitchenType"),
                         "orientation": orientation,
                         "chartProps": chart_props,
                         "chartKitchenRoles": roles,
                         "nativeFallback": v.get("native"),
                         "warnings": w})
            ck.append(slot)
            warn.extend("[%s / %s] %s" % (page["name"], v["id"], m) for m in w)
        elif v.get("engine") == "deneb":
            deneb.append(base)
    return ck, deneb, warn


# --------------------------------------------------------------------------- #
# Navigation, Drill-through, Lesezeichen
# --------------------------------------------------------------------------- #
def drill_field(visual: dict):
    roles = (visual or {}).get("roles") or {}
    for key in DRILL_ROLE_ORDER:
        if roles.get(key):
            return roles[key][0]
    return None


def bookmark_names(nspec: dict, page: dict):
    filt = (nspec["zones"] or {}).get("filter") or {}
    marks = filt.get("bookmarks")
    if not marks and not (filt.get("collapsible") or filt.get("mode") == "burger"):
        return None
    names = [m.get("name") for m in (marks or [])] or ["Filter öffnen", "Filter schließen"]
    if len(names) < 2:
        names = [names[0], "Filter schließen"]
    if len(nspec["pages"]) > 1:
        return "%s · %s" % (names[0], page["name"]), "%s · %s" % (names[1], page["name"])
    return names[0], names[1]


def panel_visual_names(nspec: dict, page: dict):
    filt = (nspec["zones"] or {}).get("filter") or {}
    if not filt:
        return []
    fl = filter_layout(nspec)
    names = ["chrome_filter_bg"]
    if fl["heading"]:
        names.append("chrome_filter_title")
    if fl["text"]:
        names.append("chrome_filter_text")
    names.append("chrome_filter_close")
    return names + slicer_names(nspec, page)


def drill_targets(nspec: dict):
    """(Zielseite, Tabelle, Feld) je Drill-through-Verknuepfung."""
    by_name = {p["name"]: p for p in nspec["pages"]}
    out = []
    for l in nspec["links"]:
        if l.get("kind") != "drillthrough":
            continue
        ref = l.get("drillField")
        if not ref:
            src_page = by_name.get(l.get("fromPage"))
            src = next((v for v in (src_page or {}).get("visuals", [])
                        if v["id"] == l.get("fromVisual")), None)
            fld = drill_field(src) if src else None
            ref = fld["ref"] if fld else None
        table, field = split_ref(ref) if ref else (None, None)
        out.append({"link": l, "toPage": l.get("toPage"), "table": table, "field": field})
    return out


def build_navigation_md(nspec: dict, report: str) -> str:
    rep = report or "<Name>.Report"
    pages = nspec["pages"]
    by_name = {p["name"]: p for p in pages}
    zones = nspec["zones"] or {}
    header = zones.get("header") or {}
    nav_zone = zones.get("nav")
    nav_pos = nav_position(zones)
    header_nav_on = nav_pos == "header"
    footer_entries = footer_nav_entries(zones) if zones.get("footer") else []
    nav_entries = [str(n) for n in ((nav_zone or {}).get("pages")
                                    or (header.get("nav") if header_nav_on else [])
                                    or footer_entries
                                    or []) if str(n).strip()]

    L = ["# Navigation, Drill-through und Lesezeichen", "",
         "Erzeugt aus `mockup-spec.json`. Alle Befehle laufen **nach** dem Anlegen "
         "der Seiten und Visuals.", "",
         "## Seiten", "", "| # | Seite | Ordner-Seed | Fragestellung | Visuals | Zweck |",
         "|---|---|---|---|---|---|"]
    for p in pages:
        L.append("| %s | %s | `%s.Page` | %s | %d | %s |"
                 % (p["index"], p["name"], slug(p["name"]),
                    p.get("question") or "–", len(p["visuals"]), p["notes"] or "–"))
    L.append("")

    # ---- Nav-Buttons ----------------------------------------------------- #
    L += ["## Nav-Buttons (auf jeder Seite)", ""]
    if footer_entries and not nav_zone:
        L += ['Seitennavigation **in der Fußleiste** (`navPosition: "footer"`, '
              "Tool 0.4.3): die Buttons stehen rechtsbündig in der Fußzone, kleiner "
              "als im Kopfband (Schrift ca. 9,5 px × Skalierung); das Kopfband "
              "bleibt ohne Nav.", ""]
    if not nav_entries and header and nav_pos == "off":
        L += ["`zones.header.navOn: false` — das Kopfband bekommt **keine** "
              "Seitennavigation. Es entstehen keine `chrome_nav_*`-Buttons; "
              "Seitenwechsel läuft über die Registerkarten"
              + (" bzw. die linke Nav-Leiste." if nav_zone else "."), ""]
    elif not nav_entries:
        L += ["Keine Nav-Leiste im Mockup — Seitenwechsel läuft über die Registerkarten.", ""]
    else:
        unknown = [n for n in nav_entries if n not in by_name]
        L += ["Ziel-Reihenfolge: %s. Die Buttons heißen auf jeder Seite "
              "`chrome_nav_1 … chrome_nav_n`; der Button der eigenen Seite bekommt "
              "Akzentfüllung und **keine** Aktion (das erledigt `chrome-commands.sh` "
              "bzw. `chrome-batch.json` bereits)." % " · ".join(nav_entries), "",
              "| Seite | Button | Ziel | Aktion |", "|---|---|---|---|"]
        for p in pages:
            for i, entry in enumerate(nav_entries):
                if entry == p["name"]:
                    L.append("| %s | `chrome_nav_%d` | – | aktiv, Akzentfüllung, "
                             "keine Aktion |" % (p["name"], i + 1))
                else:
                    L.append("| %s | `chrome_nav_%d` | %s | `PageNavigation` |"
                             % (p["name"], i + 1, entry))
        L.append("")
        if unknown:
            L += ["> Achtung: " + ", ".join("„%s\"" % u for u in unknown) +
                  " steht in der Nav-Liste, ist aber keine Seite im Mockup. "
                  "Entweder Seite anlegen oder den Eintrag streichen.", ""]
        L += ["> `pbir visuals action --target` schreibt den Text 1:1 in "
              "`navigationSection`. Springt ein Button in Desktop nicht, den internen "
              "Seitennamen aus `definition/pages/<ordner>/page.json` (`name`) als "
              "`--target` setzen:", "", "```bash",
              'pbir cat "%s/%s.Page" | head -5   # interner name' % (rep, pages[0]["name"]),
              "```", ""]

    # ---- Drill-through --------------------------------------------------- #
    dt = drill_targets(nspec)
    nav_links = [l for l in nspec["links"] if l.get("kind") == "navigation"]
    L += ["## Drill-through", ""]
    if not dt:
        L += ["Keine Drill-through-Verknüpfung im Mockup.", ""]
    else:
        L += ["Für jede Verknüpfung: **Zielseite** bekommt das Drill-through-Feld, "
              "die Quellkachel braucht nichts weiter (Power BI bietet den Drill im "
              "Kontextmenü an). Das Drill-Feld steht in der Spec unter "
              "`links[].drillField` (Kategorie-Feld der Quellkachel).", "", "```bash"]
        for d in dt:
            l = d["link"]
            L.append("# %s / %s → %s" % (l["fromPage"], l["fromVisual"], l["toPage"]))
            if d["table"]:
                L.append('pbir pages drillthrough "%s/%s.Page" --table "%s" --field "%s"'
                         % (rep, d["toPage"], d["table"], d["field"]))
            else:
                L.append("# ! Quellkachel hat kein Kategorie-/Zeilen-Feld — "
                         "Drill-Feld beim Menschen erfragen, dann:")
                L.append('# pbir pages drillthrough "%s/%s.Page" --table "<Tabelle>" '
                         '--field "<Feld>"' % (rep, d["toPage"]))
        L += ["```", "",
              "Zurück-Button auf jeder Drill-Zielseite (Power BI setzt ihn beim "
              "Drill automatisch aktiv):", "", "```bash"]
        for target in sorted({d["toPage"] for d in dt}):
            tp = by_name.get(target)
            cr = (tp or {}).get("contentRect") or {}
            bx = int(cr.get("x", 16)) + 8
            by = int(cr.get("y", 72)) + 8
            L.append('pbir add visual actionButton "%s/%s.Page" -n chrome_back '
                     '-x %d -y %d -w 90 -h 28' % (rep, target, bx, by))
            L.append('pbir set "%s/%s.Page/chrome_back.Visual.text.text" '
                     '--value "← Zurück"' % (rep, target))
            L.append('pbir set "%s/%s.Page/chrome_back.Visual.fill.fillColor" '
                     '--value "#FFFFFF"' % (rep, target))
            L.append('pbir visuals action "%s/%s.Page/chrome_back.Visual" --type Back'
                     % (rep, target))
            L.append('pbir visuals position "%s/%s.Page/chrome_back.Visual" --z %d'
                     % (rep, target, Z["overlayButton"]))
        L += ["```", "",
              "> **Offene Entscheidung:** Das Mockup sieht für den Zurück-Button "
              "keinen eigenen Platz vor. Er liegt hier in der linken oberen Ecke des "
              "Inhaltsbereichs und überlappt damit die erste Kachel (`pbir` meldet "
              "`PBIR_VISUAL_OVERLAP`, legt ihn aber an). Mit dem Menschen klären: "
              "eigene Kachel im Mockup vorsehen, in das Kopfband schieben oder als "
              "schwebendes Icon so lassen.", ""]

    if nav_links:
        L += ["## Button-Kacheln mit Seitenwechsel", "",
              "Diese Kacheln sind im Mockup vom Typ `button` und tragen eine "
              "Seitenverknüpfung (die Aktion steht schon in `chrome-commands.sh`):",
              "", "```bash"]
        for l in nav_links:
            L.append('pbir visuals action "%s/%s.Page/%s.Visual" --type PageNavigation '
                     '--target "%s"' % (rep, l["fromPage"], l["fromVisual"], l["toPage"]))
        L += ["```", ""]

    # ---- Lesezeichen ----------------------------------------------------- #
    filt = zones.get("filter") or {}
    L += ["## Filter-Panel und Lesezeichen", ""]
    mode = filt.get("mode") or filt.get("side")
    if not filt:
        L += ["Kein Filter-Panel im Mockup.", ""]
    elif not (filt.get("collapsible") or mode == "burger"):
        L += ["Filter-Modus `%s` — festes Panel, keine Lesezeichen nötig." % mode, ""]
    else:
        kind = ("Overlay per Burger-Button" if mode == "burger"
                else "festes Panel, ein-/ausklappbar")
        L += ["Filter-Modus `%s` (%s). Lesezeichen erfassen **nur die Sichtbarkeit**, "
              "nicht den Datenzustand — sonst friert das Lesezeichen die "
              "Slicer-Auswahl ein." % (mode, kind), "", "```bash"]
        for p in pages:
            names = bookmark_names(nspec, p)
            if not names:
                continue
            open_bm, close_bm = names
            panel = panel_visual_names(nspec, p)
            L.append("# Seite %s" % p["name"])
            for bm in (open_bm, close_bm):
                L.append('pbir add bookmark "%s" "%s" --no-data --no-current-page'
                         % (rep, bm))
                L.append('pbir bookmarks visuals "%s" "%s" ' % (rep, bm)
                         + " ".join('"%s"' % n for n in panel))
            if mode == "burger":
                L.append("#   Grundzustand: Panel ausgeblendet")
                for n in panel:
                    L.append('pbir visuals hide "%s/%s.Page/%s.Visual"'
                             % (rep, p["name"], n))
            L.append('pbir visuals action "%s/%s.Page/chrome_burger.Visual" '
                     '--type Bookmark --target "%s"' % (rep, p["name"], open_bm))
            L.append('pbir visuals action "%s/%s.Page/chrome_filter_close.Visual" '
                     '--type Bookmark --target "%s"' % (rep, p["name"], close_bm))
            L.append("")
        L += ["```", "",
              "```bash", 'pbir bookmarks list "%s"' % rep, "```", "",
              "> `pbir add bookmark` legt das Lesezeichen an; den **Zustand** füllt "
              "Power BI erst, wenn das Lesezeichen in Desktop einmal aktualisiert "
              "wird (Ansicht → Lesezeichen → … → Aktualisieren). Also: Report in "
              "Desktop öffnen, Panel sichtbar schalten, „Filter öffnen\" "
              "aktualisieren; Panel ausblenden, „Filter schließen\" aktualisieren. "
              "Das ist der einzige Schritt dieses Skills, der Desktop braucht.", ""]

    slicer_defaults = [s for s in (filt.get("slicers") or []) if s.get("default")]
    if slicer_defaults:
        L += ["## Slicer-Vorauswahl", "",
              "Aus `zones.filter.slicers[].default`. Die Befehle stehen je Seite in "
              "`<Seitenslug>/analysis-commands.sh`:", "",
              "| Slicer | Feld | Vorauswahl |", "|---|---|---|"]
        for s in slicer_defaults:
            L.append("| %s | `%s` | %s |" % (s["name"], s["ref"], s["default"]))
        L += ["", "> `pbir add filter … --values` legt einen kategorialen Filter auf "
              "dem Slicer-Visual an. Ob Power BI die Auswahl auch im Slicer anzeigt, "
              "in Desktop gegenprüfen.", ""]
    return "\n".join(L)


# --------------------------------------------------------------------------- #
# Markdown-Ausgaben
# --------------------------------------------------------------------------- #
def dax_suggestion(field: dict) -> str:
    """Grober DAX-Vorschlag aus der Mockup-Beschreibung. Der Mensch bestaetigt."""
    import re
    desc = (field.get("description") or "").lower()
    name = (field.get("name") or "").lower()
    words = re.findall(r"[a-zäöüß_]+", desc)
    if "minus" in words or "abzüglich" in words:
        operands = [w for w in words if w in ("umsatz", "kosten", "erlös", "erlöse",
                                              "aufwand", "marge", "rabatt")]
        if len(operands) >= 2:
            return "[%s] - [%s]" % (operands[0].capitalize(), operands[1].capitalize())
        return "[<Minuend>] - [<Subtrahend>]"
    if "%" in name or "quote" in words or "anteil" in words or "rate" in words:
        return "DIVIDE( [<Zähler>], [<Nenner>] )"
    if "summe" in words or "gesamt" in words:
        return "SUM( <Tabelle>[<Spalte>] )"
    if "durchschnitt" in words or "mittel" in words:
        return "AVERAGE( <Tabelle>[<Spalte>] )"
    return "// TODO: DAX ergänzen"


def collect_field_params(nspec: dict):
    """Feldparameter der Spec, je Name einmal (mehrere Kacheln teilen sich einen)."""
    out = {}
    for page in nspec["pages"]:
        for v in page["visuals"]:
            fp = field_param(v)
            if not fp:
                continue
            entry = out.setdefault(fp["name"], {
                "name": fp["name"], "role": fp.get("role") or "category",
                "fields": [], "visuals": []})
            for ref in fp.get("fields") or []:
                if ref not in entry["fields"]:
                    entry["fields"].append(ref)
            entry["visuals"].append({"page": page["name"], "visual": v["id"],
                                     "title": v.get("title") or v["id"]})
    return list(out.values())


def field_param_script(fp: dict) -> list:
    """Headless-Fassung des Tabular-Editor-Makros „Create Field Parameter".

    Das Original in `tabular-editor:c-sharp-scripting`
    (`examples/tables/add-field-parameter.csx`) arbeitet mit `Selected.*`, also
    mit der Auswahl in der Oberflaeche — auf der Kommandozeile gibt es die nicht.
    Deshalb stehen die Felder hier als Liste im Skript. Verifiziert mit
    `te script <Modell> --script <Datei> --save` (te-Preview, Sept. 2026):
    `Model.AddCalculatedTable` legt die drei Spalten **nicht** von selbst an
    (anders als in Tabular Editor 3), deshalb `AddCalculatedTableColumn`.
    """
    refs = ", ".join('"%s"' % r for r in (fp.get("fields") or []))
    return [
        '// Feldparameter "%s" — Achse per Slicer umschalten.' % fp["name"],
        '// Headless-Fassung des Makros "Create Field Parameter"',
        '// (Skill tabular-editor:c-sharp-scripting, examples/tables/'
        'add-field-parameter.csx).',
        'var name = "%s";' % fp["name"],
        'var refs = new[] { %s };' % refs,
        'var parts = new System.Collections.Generic.List<string>();',
        'for (var i = 0; i < refs.Length; i++) {',
        '    var t = refs[i].Substring(0, refs[i].IndexOf(\'.\'));',
        '    var c = refs[i].Substring(refs[i].IndexOf(\'.\') + 1);',
        '    parts.Add(string.Format("(\\"{0}\\", NAMEOF(\'{1}\'[{2}]), {3})", c, t, c, i));',
        '}',
        'var table = Model.AddCalculatedTable(name, "{\\n    " '
        '+ string.Join(",\\n    ", parts) + "\\n}");',
        'var nameCol  = table.AddCalculatedTableColumn(name, "[Value1]");',
        'var fieldCol = table.AddCalculatedTableColumn(name + " Fields", "[Value2]");',
        'var orderCol = table.AddCalculatedTableColumn(name + " Order", "[Value3]");',
        'nameCol.SortByColumn = orderCol;',
        'nameCol.GroupByColumns.Add(fieldCol);',
        'nameCol.SummarizeBy = AggregateFunction.None;',
        'fieldCol.SortByColumn = orderCol;',
        'fieldCol.SetExtendedProperty("ParameterMetadata", '
        '"{\\"version\\":3,\\"kind\\":2}", ExtendedPropertyType.Json);',
        'fieldCol.IsHidden = true; fieldCol.SummarizeBy = AggregateFunction.None;',
        'orderCol.IsHidden = true; orderCol.FormatString = "0";',
    ]


def build_field_param_md(nspec: dict, model_name: str) -> list:
    """Abschnitt „Feldparameter" für `model-todos.md` (leer, wenn keiner da ist)."""
    params = collect_field_params(nspec)
    if not params:
        return []
    model = model_name or "<Name>.SemanticModel"
    L = ["## Feldparameter (Achse per Slicer umschalten)", "",
         "Diese Kacheln holen ihre Kategorieachse aus einem **Feldparameter** — "
         "einer berechneten Tabelle mit dem `NAMEOF`-Muster. Tabelle und Spalte "
         "heißen gleich, deshalb bindet der Bericht die Achse auf "
         "`'<Name>'[<Name>]` (im pbir-Format `<Name>.<Name>`). **Die Tabelle muss "
         "vor dem Bauen existieren** — ein fehlendes Feld lässt "
         "`pbir add visual --from-json` die ganze Datei ablehnen.", "",
         "| Parameter | Felder | Kacheln |", "|---|---|---|"]
    for fp in params:
        L.append("| `%s` | %s | %s |"
                 % (fp["name"],
                    ", ".join("`%s`" % f for f in fp["fields"]) or "**keine**",
                    ", ".join("%s / %s" % (x["page"], x["title"]) for x in fp["visuals"])))
    L += ["", "**Nicht von Hand bauen.** Der Skill `tabular-editor:te-cli` nennt das "
          "Zusammenschreiben von DAX und Annotationen über `te add`/`te set` "
          "ausdrücklich fehleranfällig; die `ParameterMetadata` gehört auf die "
          "versteckte `NAMEOF`-Spalte, sonst schaltet der Slicer nichts um. Also "
          "das Makro laufen lassen — **prüfen**, bevor es gespeichert wird:", ""]
    for fp in params:
        fname = "field-parameter-%s.csx" % slug(fp["name"])
        L += ["```bash", "cat > %s <<'CSX'" % fname]
        L += field_param_script(fp)
        L += ["CSX",
              'te script "%s" --script %s --save' % (model, fname),
              'te get "%s" -m "%s" --output-format tmdl   # ParameterMetadata prüfen'
              % (fp["name"], model),
              'te validate -m "%s" --errors-only' % model,
              "```", ""]
    L += ["So sieht die erzeugte Tabelle aus (gekürzt, **prüfen**):", "",
          "```tmdl",
          "table %s" % params[0]["name"],
          "\tcolumn %s" % params[0]["name"],
          "\t\tsummarizeBy: none",
          "\t\tsourceColumn: [Value1]",
          "\t\tsortByColumn: '%s Order'" % params[0]["name"],
          "",
          "\t\trelatedColumnDetails",
          "\t\t\tgroupByColumn: '%s Fields'" % params[0]["name"],
          "",
          "\tcolumn '%s Fields'" % params[0]["name"],
          "\t\tisHidden",
          "\t\tsummarizeBy: none",
          "\t\tsourceColumn: [Value2]",
          "\t\tsortByColumn: '%s Order'" % params[0]["name"],
          "",
          "\t\textendedProperty ParameterMetadata = {\"version\":3,\"kind\":2}",
          "",
          "\tcolumn '%s Order'" % params[0]["name"],
          "\t\tisHidden",
          "\t\tformatString: 0",
          "\t\tsourceColumn: [Value3]",
          "",
          "\tpartition %s = calculated" % params[0]["name"],
          "\t\tmode: import",
          "\t\tsource =",
          "\t\t\t\t{"]
    for i, ref in enumerate(params[0]["fields"] or ["<Tabelle>.<Spalte>"]):
        table, field = split_ref(ref)
        L.append("\t\t\t\t    (\"%s\", NAMEOF('%s'[%s]), %d)%s"
                 % (field, table, field, i,
                    "," if i < len(params[0]["fields"]) - 1 else ""))
    L += ["\t\t\t\t}", "```", "",
          "> Drei Dinge brechen still, wenn sie fehlen: `ParameterMetadata` auf der "
          "versteckten Spalte (sonst schaltet der Slicer nicht), `sortByColumn` auf "
          "die Order-Spalte (sonst steht die Liste alphabetisch) und eine dichte "
          "Zahlenfolge 0, 1, 2 … in `Value3`. Ein Feldparameter taugt außerdem "
          "**nicht** als Drill-through- oder Tooltip-Feld.", "",
          "Danach je Kachel einen **Slicer** auf die Parameterspalte einplanen — "
          "ohne ihn kann niemand umschalten. Der Vorschlag steht auskommentiert in "
          "`<Seitenslug>/analysis-commands.sh`; das Mockup sieht diese Kachel nicht "
          "vor, deshalb wird sie nicht ungefragt gebaut.", ""]
    return L


def build_model_todos(nspec: dict, model_name: str) -> str:
    new = nspec["newFields"]
    meta = nspec["meta"]
    L = ["# Modell-To-dos", "",
         "Quelle: `%s` · Modell: `%s`"
         % (meta.get("name", "Mockup"), model_name or "<Name>.SemanticModel"), ""]
    renames = [f for f in nspec["fields"] if f.get("renameInModel") and f.get("alias")]
    params = build_field_param_md(nspec, model_name)
    if not new and not renames and not params:
        L += ["Keine neuen Felder und keine Umbenennungswünsche im Mockup. Trotzdem vor "
              "dem Bauen prüfen, dass jede `ref` aus der Spec im Modell existiert "
              "(`te list`), sonst bricht `pbir add visual --from-json` die **ganze** "
              "Datei ab.", ""]
        return "\n".join(L)
    if not new and not renames:
        L += ["Keine neuen Felder und keine Umbenennungswünsche im Mockup — aber ein "
              "Feldparameter (siehe unten). Trotzdem vor dem Bauen jede `ref` aus der "
              "Spec gegen `te list` prüfen.", ""]
    if new:
        has_q = any(f.get("openQuestion") for f in new)
        L += ["## Neu anzulegen", "",
              "Diese Felder existieren im Modell noch nicht. **Zuerst anlegen**, DAX vom "
              "Menschen bestätigen lassen, dann `te validate --errors-only`, erst danach "
              "Visuals binden.", "",
              "| Feld | Art | Tabelle | Beschreibung | Einheit | Ziel | Owner | Quelle |"
              + (" offene Frage |" if has_q else "") + " im Layout benutzt |",
              "|---|---|---|---|---|---|---|---|" + ("---|" if has_q else "") + "---|"]
        for f in new:
            row = ("| `%s` | %s | %s | %s | %s | %s | %s | %s |"
                   % (f["ref"], "Measure" if f.get("kind") == "measure" else "Spalte",
                      f["table"], f.get("description") or "–", f.get("unit") or "–",
                      f.get("target") or "–", f.get("owner") or "–",
                      f.get("source") or "–"))
            if has_q:
                row += " %s |" % (f.get("openQuestion") or "–")
            row += " %s |" % ("ja" if f.get("used") else "nein")
            L.append(row)
        L += ["", "## Vorschlag (DAX bestätigen lassen, nicht ungefragt anlegen)", "",
              "```bash"]
        for f in new:
            if f.get("kind") != "measure":
                L.append("# %s ist eine Spalte — gehört in die Quelle/Power Query, "
                         "nicht in te add" % f["ref"])
                continue
            L.append('te add "%s/%s" -m "%s" -t Measure \\'
                     % (f["table"], f["name"], model_name or "<Name>.SemanticModel"))
            L.append('  -i "%s" \\' % dax_suggestion(f))
            if f.get("description"):
                L.append('  -q description -i "%s" \\' % f["description"].replace('"', "'"))
            L.append('  -q formatString -i "#,##0" --if-not-exists --save')
        L += ['te validate -m "%s" --errors-only' % (model_name or "<Name>.SemanticModel"),
              "```", ""]
        if has_q:
            L += ["## Offene Fragen aus dem Workshop", ""]
            for f in new:
                if f.get("openQuestion"):
                    L.append("- [ ] `%s`: %s" % (f["ref"], f["openQuestion"]))
            L.append("")
    if renames:
        L += ["## Umbenennungswünsche aus dem Fachbereich", "",
              "Der Workshop hat für diese Felder einen Alias notiert und "
              "`renameInModel` gesetzt. **Erst nach Freigabe** umbenennen — ein "
              "Rename kaskadiert nur halb (queryRef/metadata im Bericht bleiben "
              "stehen, danach `pbir fields replace` + `pbir validate --fields`).", "",
              "| Feld | soll heißen | bestätigt | Owner |", "|---|---|---|---|"]
        for f in renames:
            L.append("| `%s` | %s | %s | %s |"
                     % (f["ref"], f["alias"], "ja" if f.get("confirmed") else "nein",
                        f.get("owner") or "–"))
        L += ["", "```bash"]
        for f in renames:
            table, field = split_ref(f["ref"])
            L.append('te rename "%s/%s" "%s" -m "%s" --save'
                     % (table, field, f["alias"], model_name or "<Name>.SemanticModel"))
        L += ["```", ""]
    L += params
    return "\n".join(L)


def build_analysis_todos(nspec: dict, todos, report: str) -> str:
    L = ["# Analyse-To-dos", "",
         "Was der Analyse-Block der Spec (v3) verlangt und `pbir` **nicht** direkt "
         "setzen kann. Alles andere steht bereits in den "
         "`<Seitenslug>/analysis-commands.sh`.", ""]
    if not todos:
        L += ["Keine offenen Analyse-Punkte — die Spec verlangt nur, was gesetzt "
              "werden konnte.", ""]
        return "\n".join(L)
    L += ["| Seite | Kachel | Code | Was zu tun ist |", "|---|---|---|---|"]
    for t in todos:
        L.append("| %s | %s (`%s`) | `%s` | %s |"
                 % (t["page"], t["title"], t["visual"], t["code"],
                    t["text"].replace("|", "\\|")))
    L.append("")
    return "\n".join(L)


def build_checklist(nspec: dict, per_page, chrome_notes, slot_warn, todos,
                    custom_warn=()) -> str:
    canvas = nspec["canvas"]
    d = nspec["design"]
    meta = nspec["meta"]
    rp = nspec["report"]
    L = ["# Checkliste vor dem Schreiben", "",
         "Mockup: **%s** · specVersion %s (gelesen als v%d) · Hash `%s` · "
         "%d Seite(n) · Canvas %s×%s (uiScale ×%s)"
         % (meta.get("name", "?"), nspec["sourceVersion"], nspec["version"],
            meta.get("specHash") or "–", len(nspec["pages"]),
            canvas.get("width"), canvas.get("height"), nspec["uiScale"]), "",
         "## Berichtskopf", "", "| | |", "|---|---|",
         "| Zielgruppe | %s |" % (rp.get("audience") or "**offen**"),
         "| Ziel | %s |" % (rp.get("purpose") or "**offen**"),
         "| Entscheidung | %s |" % (rp.get("decision") or "**offen**"),
         "| Teilnehmende | %s |" % (rp.get("participants") or "–"),
         "| Version / Datenstand | %s / %s |"
         % (rp.get("version") or "–", rp.get("dataDate") or "**offen**"), "",
         "## Gestaltung (aus `design`, geht in die Container-Formatierung "
         "bzw. das Theme-Fragment)", "",
         "- Kacheln: Stil `%s`, Ecken %s px, Hintergrund %s"
         % (d["tileStyle"], d["cornerRadius"], d["tileBackground"]),
         "- Seitenhintergrund %s · Akzent %s" % (d["pageBackground"], d["accent"]),
         "- Kopfband-Stil `%s` (Fläche %s, Text %s) · Schriftfaktor ×%s "
         "(%s)"
         % (d["headerStyle"], d["colors"]["headerBackground"], d["colors"]["headerInk"],
            d["fontScale"],
            "Visual-Titel ≈ %d pt" % int(round(12 * d["fontScale"]))
            if not type_sizes(nspec) else "Visual-Titel siehe Typografie"),
         "- Varianz-Palette `%s`: gut %s · schlecht %s · Ink %s · dunkler Modus %s"
         % (d["variancePalette"], d["varianceColors"]["good"], d["varianceColors"]["bad"],
            d["colors"]["ink"], "ja" if d["darkMode"] else "nein")]
    ts = type_sizes(nspec)
    if ts:
        ty = d["typography"]
        overrides = ["`%s` ×%s (Titel %s pt)" % (v["id"], type_sizes(nspec, v)["tile"],
                                                  type_sizes(nspec, v)["titlePt"])
                     for p in nspec["pages"] for v in p["visuals"]
                     if type_sizes(nspec, v)["tile"] != 1]
        L += ["- Typografie (`design.typography`, Basis %s, Skalierung ×%s, k = %s): "
              "Titel %s px → **%s pt**, Untertitel %s px → **%s pt**, "
              "Diagrammbeschriftung %s px → **%s pt** (pt = px × 0,75). Geht als "
              "`title`/`subTitle.fontSize` in `chrome-batch.json` und als "
              "`textClasses` in `theme-fragment.json`."
              % (ty.get("basis"), ty["scale"], ts["k"], ts["titlePx"], ts["titlePt"],
                 ts["subPx"], ts["subPt"], ts["chartPx"], ts["chartPt"])]
        if overrides:
            L.append("- Kacheln mit eigener Schrift-Skalierung: " + ", ".join(overrides))
    L.append("")

    counts = {}
    for p in nspec["pages"]:
        for v in p["visuals"]:
            counts[v.get("engine", "?")] = counts.get(v.get("engine", "?"), 0) + 1
    filt = (nspec["zones"] or {}).get("filter") or {}
    total = sum(len(p["visuals"]) for p in nspec["pages"])
    L += ["## Umfang", "",
          "- Visuals gesamt: %d (ChartKitchen %d · nativ %d · Deneb %d)"
          % (total, counts.get("ck", 0), counts.get("native", 0), counts.get("deneb", 0)),
          "- Slicer je Seite: %d (Filter-Modus `%s`)"
          % (len(filt.get("slicers") or []),
             filt.get("mode") or filt.get("side") or "–")]
    fl = filter_layout(nspec)
    if fl and fl["new"]:
        L.append("- Filterbereich: Überschrift %s · Hinweistext %s"
                 % ("„%s\"" % fl["heading"] if fl["heading"] else "**keine**",
                    "„%s\"" % fl["text"] if fl["text"] else "keiner"))
    typed = [(s_, slicer_type(s_)) for s_ in (filt.get("slicers") or [])]
    if any(t for _, t in typed):
        L.append("- Slicer-Arten: " + " · ".join(
            "%s → %s (%s)" % (s_.get("name"), SLICER_TYPE_LABEL[t],
                              ", ".join("`%s = %s`" % (k_, str(v_).lower()
                                                       if isinstance(v_, bool) else v_)
                                        for k_, v_ in SLICER_FORMAT[t].items()))
            if t else "%s → wie angelegt" % s_.get("name")
            for s_, t in typed))
    pos = nav_position(nspec["zones"] or {})
    if any("navPosition" in ((nspec["zones"] or {}).get(z_) or {})
           for z_ in ("header", "footer")):
        L.append("- Seitennavigation: %s"
                 % {"header": "im Kopfband",
                    "footer": "in der Fußleiste (rechtsbündig, Schrift ca. 9,5 px × k)",
                    "off": "aus"}[pos])
    L += [
          "- Verknüpfungen: %d (%d Drill-through, %d Seitenwechsel)"
          % (len(nspec["links"]),
             sum(1 for l in nspec["links"] if l.get("kind") == "drillthrough"),
             sum(1 for l in nspec["links"] if l.get("kind") == "navigation")),
          "", "| Seite | Ordner | Fragestellung | native Visuals + Slicer | Text/Button "
          "| Chrome | CK | Deneb | Custom |",
          "|---|---|---|---|---|---|---|---|---|"]
    for e in per_page:
        L.append("| %s | `%s/` | %s | %d | %d | %d | %d | %d | %d |"
                 % (e["name"], e["dir"], e["question"] or "–", len(e["pbir"]),
                    len(e["text"]), len(e["chrome"]), len(e["ck"]), len(e["deneb"]),
                    len(e["custom"])))
    L.append("")

    # ---- Barrierefreiheit (Tool 0.4.4, Codes A11Y_*) ------------------------ #
    a11y = a11y_issues(nspec)
    if a11y:
        blockers = [i for i in a11y if i.get("level") == "error"]
        L += ["## Barrierefreiheit", "",
              "Befunde der Barrierefreiheits-Prüfung im Tool (Kontrast, Schriftgrößen, "
              "Kachelgrößen, Titel, Dichte, Lesereihenfolge, Navigation, "
              "Slicer-Beschriftung)."
              + (" **%s:** vor dem Bau im Mockup beheben oder "
                 "vom Menschen ausdrücklich akzeptieren lassen (Begründung notieren)."
                 % ("1 Fehler ist ein Blocker" if len(blockers) == 1
                    else "%d Fehler sind Blocker" % len(blockers))
                 if blockers else ""), "",
              "| | Schwere | Code | Seite | Kachel | Befund |", "|---|---|---|---|---|---|"]
        for i in a11y:
            L.append("| %s | %s | `%s` | %s | %s | %s |"
                     % ("☐ **Blocker**" if i.get("level") == "error" else
                        "☐" if i.get("level") == "warn" else "–",
                        i.get("level"), i.get("code"), i.get("page") or "–",
                        i.get("visual") or "–", i.get("text", "").replace("|", "\\|")))
        L.append("")

    # ---- Issues aus der Spec --------------------------------------------- #
    levels = {"error": [], "warn": [], "info": []}
    for i in nspec["issues"]:
        if is_a11y_issue(i):
            continue                      # stehen oben im eigenen Block
        levels.setdefault(i.get("level", "warn"), []).append(i)
    L += ["## Offene Punkte aus der Spec (`issues`)", ""]
    if not any(levels.values()):
        L += ["- keine", ""]
    else:
        L += ["| Schwere | Code | Seite | Kachel | Text |", "|---|---|---|---|---|"]
        for level in ("error", "warn", "info"):
            for i in levels.get(level) or []:
                L.append("| %s | `%s` | %s | %s | %s |"
                         % (level, i.get("code", "?"), i.get("page") or "–",
                            i.get("visual") or "–", i.get("text", "")))
        L.append("")
        if levels.get("error"):
            L += ["> **Fehler-Issues zuerst klären.** Kacheln mit leerer Pflichtrolle "
                  "landen nicht in `pbir-visuals.json` — sonst würde `--from-json` die "
                  "ganze Datei ablehnen.", ""]

    skipped = [s for e in per_page for s in e["skipped"]]
    if skipped:
        L += ["## Nicht gebaute Kacheln (leere Pflichtrolle)", ""]
        for v in skipped:
            L.append("- [ ] `%s` — %s (%s): %s"
                     % (v["id"], v.get("title") or "", v.get("kind"),
                        "; ".join(v.get("warnings") or [])))
        L.append("")

    # ---- Darstellungsvarianten (Tool 0.4.1) -------------------------------- #
    variants = []
    for p in nspec["pages"]:
        for v in p["visuals"]:
            smf = sm_field(v)
            has_sm = isinstance((v.get("analysis") or {}).get("smallMultiples"), dict)
            fp = field_param(v)
            if not has_sm and not fp:
                continue
            vtype = (v.get("native") or {}).get("type") or "–"
            sm_txt = "–"
            if has_sm:
                if not smf:
                    sm_txt = "**Feld fehlt** (`SM_NO_FIELD`)"
                elif v.get("engine") != "native":
                    sm_txt = "`%s` — %s kann es nicht" % (smf, v.get("engine"))
                elif vtype in SMALL_MULTIPLES_TYPES:
                    sm_txt = "`%s` → Bucket `%s`" % (smf, SMALL_MULTIPLES_BUCKET)
                else:
                    sm_txt = "`%s` — `%s` hat keinen Bucket" % (smf, vtype)
            fp_txt = ("`%s` ← %s" % (param_ref(fp),
                                     ", ".join("`%s`" % f for f in fp.get("fields") or [])
                                     or "**keine Felder**")
                      if fp else "–")
            variants.append("| %s | %s (`%s`) | %s | %s | %s |"
                            % (p["name"], v.get("title") or v["id"], v["id"],
                               vtype, sm_txt, fp_txt))
    if variants:
        L += ["## Darstellungsvarianten (Small Multiples, Feldparameter)", "",
              "Small Multiples gehen in PBIR in den Bucket `%s` der kartesischen "
              "Visuals (verifiziert mit `pbir schema roles`); `donutChart`, "
              "`pieChart`, `card`, `treemap`, `map` und `waterfallChart` haben ihn "
              "nicht. ChartKitchen und Deneb haben ihn ebenfalls nicht — dort "
              "entweder nativ bauen oder ein Raster aus Einzelkacheln. Der "
              "Feldparameter ist eine **berechnete Tabelle im Modell** und muss vor "
              "dem Bauen existieren (siehe [`model-todos.md`](model-todos.md)); "
              "dazu gehört ein Slicer, sonst schaltet niemand um."
              % SMALL_MULTIPLES_BUCKET, "",
              "| Seite | Kachel | natives Visual | Small Multiples | Feldparameter |",
              "|---|---|---|---|---|"] + variants + [""]

    L += ["## Hinweise aus dem Chrome-Aufbau", ""]
    L += ["- [ ] %s" % n for n in dict.fromkeys(chrome_notes)] or ["- keine"]
    L.append("")
    L += ["## ChartKitchen-Rollen-Mapping", ""]
    L += ["- [ ] %s" % w for w in slot_warn] or ["- keine Auffälligkeiten"]
    L.append("")

    # ---- Custom Visuals ---------------------------------------------------- #
    custom_all = [(e["name"], sl) for e in per_page for sl in e["custom"]]
    if custom_all:
        L += ["## Custom Visuals (`engine: \"custom\"`)", "",
              "`pbir add visual` kennt diese GUIDs nicht — die Kacheln stehen deshalb "
              "**nicht** in `pbir-visuals.json`, sondern als fertige `visual.json` in "
              "`<Seitenslug>/custom-visuals/`. Die `.pbiviz` muss **vorher** im Bericht "
              "importiert sein, sonst lädt das Visual nicht.", "",
              "| Seite | Kachel | Visual | GUID | .pbiviz | Rollen |",
              "|---|---|---|---|---|---|"]
        for page_name, sl in custom_all:
            roles = ", ".join("`%s`: %s" % (r, ", ".join(refs))
                              for r, refs in sorted(sl["buckets"].items())) or "–"
            L.append("| %s | %s (`%s`) | %s | `%s` | `%s` | %s |"
                     % (page_name, sl["title"] or sl["id"], sl["id"],
                        sl["visualName"] or "?", sl["guid"] or "?",
                        sl["pbiviz"] or "selbst bauen: `pbiviz package`", roles))
        L.append("")
        if custom_warn:
            L += ["- [ ] %s" % w for w in custom_warn] + [""]
        else:
            L += ["- Pflichtrollen aller Custom Visuals belegt.", ""]

    if todos:
        L += ["## Analyse-Angaben ohne direkten pbir-Befehl", "",
              "Vollständig in [`analysis-todos.md`](analysis-todos.md) — hier nur die "
              "Zahl je Code:", ""]
        codes = {}
        for t in todos:
            codes[t["code"]] = codes.get(t["code"], 0) + 1
        for code, n in sorted(codes.items()):
            L.append("- `%s`: %d" % (code, n))
        L.append("")

    # ---- Kennzahlen-Steckbrief ------------------------------------------- #
    L += ["## Kennzahlen-Steckbrief (`fields`) — gegen das Modell prüfen "
          "(`te list`, nicht per Regex)", "",
          "| Feld | Art | Alias (Fachbereich) | Definition laut Modell | Format | "
          "Einheit | Owner | Quelle | Ziel | bestätigt | neu |",
          "|---|---|---|---|---|---|---|---|---|---|---|"]
    for f in sorted(nspec["fields"], key=lambda x: x.get("ref") or ""):
        L.append("| `%s` | %s | %s%s | %s | %s | %s | %s | %s | %s | %s | %s |"
                 % (f.get("ref"), f.get("kind") or "?",
                    f.get("alias") or "–",
                    " (umbenennen)" if f.get("renameInModel") else "",
                    f.get("description") or "–", f.get("formatString") or "–",
                    f.get("unit") or "–", f.get("owner") or "–", f.get("source") or "–",
                    f.get("target") or "–", "☑" if f.get("confirmed") else "☐",
                    "ja" if f.get("isNew") else "nein"))
    L += ["", "> Ein einziges fehlendes Feld lässt `pbir add visual --from-json` die "
          "komplette Datei ablehnen ('no visuals were created'). Erst Modell, dann "
          "Report. Nicht bestätigte Definitionen (☐) im Workshop klären — sie sind "
          "der häufigste Grund für „die Zahl stimmt nicht\".", ""]
    return "\n".join(L)


def build_commands_md(nspec: dict, report: str, out_dir: Path, per_page,
                      model_name: str) -> str:
    canvas = nspec["canvas"]
    o = out_dir.as_posix()
    w, h = canvas.get("width", 1280), canvas.get("height", 720)
    meta = nspec["meta"]
    L = ["# Befehlsfolge · %s" % meta.get("name", "Mockup"), "",
         "%d Seite(n), Canvas %s×%s, Spec-Hash `%s`. Reihenfolge einhalten. "
         "Vor dem ersten schreibenden Befehl: Power BI Desktop schließen, "
         "`pbir backup` oder Git-Commit."
         % (len(nspec["pages"]), w, h, meta.get("specHash") or "–"), "",
         "```bash",
         "# 0 · Ausgangslage sichern",
         'pbir backup "%s"' % report,
         "",
         "# 1 · Modell zuerst (siehe model-todos.md), dann prüfen",
         'te validate -m "%s" --errors-only' % (model_name or "<Name>.SemanticModel"),
         "```", ""]

    for i, e in enumerate(per_page, start=1):
        page_path = "%s/%s.Page" % (report, e["name"])
        L += ["## %d · Seite „%s\"" % (i, e["name"]), "", "```bash",
              "# Seite anlegen (legt automatisch eine Textbox 'Title' an — entfernen)",
              'pbir add page "%s/%s.Page" -n "%s" -w %s -h %s'
              % (report, slug(e["name"]), e["name"], w, h),
              'pbir rm "%s/Title.Visual" -f' % page_path,
              "#   Bestehende Seite stattdessen nur umskalieren:",
              '# pbir pages resize "%s" -w %s -h %s' % (page_path, w, h),
              "",
              "# Chrome-Geometrie (Flächen, Textrahmen, Buttons)",
              'pbir add visual "%s" --from-json "%s/%s/chrome-visuals.json"'
              % (page_path, o, e["dir"]),
              "",
              "# Native Visuals + Slicer",
              'pbir add visual "%s" --from-json "%s/%s/pbir-visuals.json"'
              % (page_path, o, e["dir"])]
        if e["text"]:
            L += ["",
                  "# Text-/Button-Kacheln (als shape/actionButton, nicht als textbox)",
                  'pbir add visual "%s" --from-json "%s/%s/text-visuals.json"'
                  % (page_path, o, e["dir"])]
        L += ["",
              "# Seitenhintergrund (kann `pbir batch` nicht — nur als CLI-Aufruf)",
              'pbir pages background "%s" --color "%s" --transparency 0'
              % (page_path, e["page_bg"]),
              "",
              "# Hauptweg: alle uebrigen Setzungen in EINEM Lauf (Texte, Farben,",
              "#           Kachel-Container, Anzeigeeinheiten, z-Order)",
              'pbir batch validate "%s/%s/chrome-batch.json"' % (o, e["dir"]),
              'pbir batch plan "%s/%s/chrome-batch.json" --root "%s"' % (o, e["dir"], report),
              'pbir batch run "%s/%s/chrome-batch.json" --root "%s"' % (o, e["dir"], report),
              "",
              "# Fallback, wenn batch streikt (~1,5 s je Aufruf, läuft ein paar Minuten)",
              '# bash "%s/%s/chrome-commands.sh"   # PowerShell: chrome-commands.ps1'
              % (o, e["dir"]),
              "",
              "# Analyse: Sortierung, Top-N, Slicer-Vorauswahl, Annotationen",
              'bash "%s/%s/analysis-commands.sh"' % (o, e["dir"])]
        if e["custom"]:
            L += ["",
                  "# Custom Visuals ZULETZT (Platzhalter + visual.json kopieren);",
                  "# die .pbiviz muss vorher im Bericht importiert sein",
                  'bash "%s/%s/custom-commands.sh"' % (o, e["dir"])]
        L += ["```", ""]
        if e["notes_block"]:
            L += ["> %s" % n for n in e["notes_block"]] + [""]

    L += ["## Zweiter Lauf (Delta)", "",
          "Visualnamen sind stabil (`id` aus der Spec). Läuft der Bau ein zweites Mal, "
          "**nicht neu anlegen**: `pbir add visual --from-json` würde an den "
          "vorhandenen Namen scheitern. Stattdessen je Seite:", "", "```bash"]
    for e in per_page:
        L += ['pbir batch run "%s/%s/delta-batch.json" --root "%s"' % (o, e["dir"], report)]
    L += ["```", "",
          "Das aktualisiert Position, Größe und Feldbindung der vorhandenen Visuals. "
          "Was im Bericht steht, aber nicht mehr im Mockup: wird **nur gemeldet** "
          "(`mockup_verify.py`), nie gelöscht.", "",
          "## Theme statt Overrides", "",
          "`theme-fragment.json` enthält dieselbe Kachel-Optik als `visualStyles`-`*`-"
          "Eintrag. Wer ein Theme pflegt, merged das Fragment dorthin (Skill "
          "`reports:modifying-theme-json`) und lässt die `background`/`border`/"
          "`dropShadow`-Schritte aus der Batch-Spec weg — dann steht die Gestaltung an "
          "einer Stelle statt an jedem Visual.", "",
          "## Navigation, Drill-through, Lesezeichen", "",
          "Erst wenn **alle** Seiten stehen — Ziele müssen existieren. "
          "Befehle in [`navigation.md`](navigation.md).", ""]

    custom_all = [(e["name"], sl) for e in per_page for sl in e["custom"]]
    if custom_all:
        pbivizes = sorted({sl["pbiviz"] or "" for _, sl in custom_all})
        L += ["## Custom Visuals (dataKitchenGantt, pnlByDatenWG …)", "",
              "`pbir add visual` kennt die GUIDs dieser Visuals **nicht** "
              "(`Unknown visual type '<GUID>'`), und in `--from-json` würde ein "
              "solcher Eintrag die **ganze Datei** ablehnen. Deshalb stehen die "
              "Kacheln nicht in `pbir-visuals.json`, sondern als fertige "
              "`visual.json` unter `<Seitenslug>/custom-visuals/`.", "",
              "**Schritt 1 — `.pbiviz` in den Bericht importieren** (Power BI Desktop: "
              "Visualisierungen → … → *Visual aus Datei importieren*). Ohne Import "
              "bleibt die Kachel leer, auch wenn die JSON stimmt:", ""]
        for path in pbivizes:
            L.append("- `%s`" % (path or "kein Build im Repo — mit `pbiviz package` "
                                         "im Visual-Ordner erzeugen"))
        L += ["", "**Schritt 2 — Platzhalter anlegen und Datei ersetzen** "
              "(erledigt `custom-commands.sh` je Seite):", "", "```bash"]
        for page_name, sl in custom_all:
            r = sl["rect"]
            pp = "%s/%s.Page" % (report, page_name)
            L.append("# %s · %s — %s" % (page_name, sl["title"] or sl["id"],
                                           sl["visualName"]))
            L.append('pbir add visual shape "%s" -n "%s" -x %s -y %s -w %s -h %s -t "%s"'
                     % (pp, sl["id"], r["x"], r["y"], r["w"], r["h"],
                        sl["title"] or sl["id"]))
            L.append('D=$(find "%s/definition/pages" -type d -name "%s" | head -1)'
                     % (report, sl["id"]))
            L.append('cp "%s/%s/%s" "$D/visual.json"' % (o, next(
                e["dir"] for e in per_page if e["name"] == page_name), sl["file"]))
        L += ["```", "",
              "Danach `pbir validate \"%s\" --fields` — die erzeugte `visual.json` "
              "ist in der Form geschrieben, die `pbir add visual` selbst verwendet "
              "(Schema 2.9.0, `visualContainerObjects` als Arrays) und wird "
              "angenommen. **Reihenfolge:** erst `chrome-batch.json`, dann kopieren "
              "— die Kopie überschreibt sonst die Formatierung (sie steckt bereits "
              "in der Datei)." % report, "",
              "Im **zweiten Lauf** entfällt der Platzhalter-Schritt: nur die neu "
              "erzeugte `visual.json` erneut kopieren. `delta-batch.json` fasst "
              "Custom Visuals bewusst nicht an.", ""]

    ck_all = [(e["name"], s) for e in per_page for s in e["ck"]]
    if ck_all:
        L += ["## ChartKitchen-Slots (nicht per from-json)", "",
              "Nur über eine vorhandene Referenz-Instanz replizieren — Vorgehen in "
              "`.claude/skills/chartkitchen-report/references/pbir-insertion.md`. "
              "Solange keine Instanz im Report liegt: Platzhalter setzen.", "", "```bash"]
        for page_name, s in ck_all:
            r = s["rect"]
            pp = "%s/%s.Page" % (report, page_name)
            L.append("# %s · %s (%s → orientation %s)"
                     % (page_name, s["title"], s["kind"], s.get("orientation") or "?"))
            L.append('pbir add visual shape "%s" -n "%s_slot" -x %s -y %s -w %s -h %s '
                     '-t "ChartKitchen: %s"'
                     % (pp, s["id"], r["x"], r["y"], r["w"], r["h"], s["kind"]))
            L.append('pbir set "%s/%s_slot.Visual.text.text" --value "ChartKitchen: %s · %s"'
                     % (pp, s["id"], s["kind"], s["title"]))
        L += ["```", ""]

    deneb_all = [(e["name"], s) for e in per_page for s in e["deneb"]]
    if deneb_all:
        L += ["## Deneb-Slots", "",
              "Über den Skill `deploy-to-powerbi` (Template aus dem Chart-Builder) "
              "bzw. `pbir visuals deneb`. Slots:", ""]
        for page_name, s in deneb_all:
            r = s["rect"]
            L.append("- %s · `%s` — %s bei x=%s, y=%s, w=%s, h=%s"
                     % (page_name, s["id"], s["title"], r["x"], r["y"], r["w"], r["h"]))
        L.append("")

    first = per_page[0]["dir"] if per_page else ""
    pages_arg = ",".join(e["name"] for e in per_page)
    L += ["## Verifizieren", "", "```bash",
          'pbir validate "%s" --fields' % report,
          'te validate -m "%s" --errors-only' % (model_name or "<Name>.SemanticModel"),
          "",
          "# Abnahme gegen das Sollbild aus der Spec (Rechtecke ±1 px, Bindungen, Slicer)",
          'python .claude/skills/mockup-to-powerbi/scripts/mockup_verify.py "%s" "%s/acceptance.json"'
          % (report, o),
          "",
          "export PYTHONIOENCODING=utf-8   # sonst brechen beide Skripte an Umlauten ab",
          'python .claude/skills/powerbi-design-framework/scripts/bulk_restyle.py "%s" \\' % report,
          '  --check --zones "%s/%s/zones.json" --grid 0 \\' % (o, first),
          '  --skip-types shape,textbox,actionButton,image,slicer --pages "%s"' % pages_arg,
          'python .claude/skills/powerbi-design-framework/scripts/render_wireframe.py "%s" \\' % report,
          '  --zones "%s/%s/zones.json" --pages "%s" --html' % (o, first, pages_arg),
          "```", "",
          "Alle Seiten teilen dieselbe Inhaltszone, deshalb reicht eine `zones.json`. "
          "`--grid 0` weil MockupKitchen-Splits selten auf dem 8-px-Raster landen; "
          "`--skip-types` weil Chrome-Elemente absichtlich außerhalb der Content-Zone "
          "liegen. **`--pages` erwartet eine kommagetrennte Liste**, keine einzelnen "
          "Argumente.", ""]
    return "\n".join(L)


# --------------------------------------------------------------------------- #
# Theme-Fragment
# --------------------------------------------------------------------------- #
def build_theme_fragment(nspec: dict, st: Style) -> dict:
    d = nspec["design"]
    star = {
        "background": [{"show": True, "color": {"solid": {"color": st.tile_bg}},
                        "transparency": 0}],
        "border": [{"show": st.tile_style == "border",
                    "color": {"solid": {"color": st.tile_border}},
                    "radius": st.radius}],
        "dropShadow": [{"show": st.tile_style == "shadow", "preset": "BottomRight",
                        "color": {"solid": {"color": st.ink}}, "transparency": 85}],
        "title": [{"show": True, "fontSize": st.sz(12),
                   "fontColor": {"solid": {"color": st.ink}}}],
    }
    ts = st.typo()
    extra = {}
    if ts:
        # Tool 0.4.3: design.typography. Groessen in pt (px x 0,75, auf 0,5
        # gerundet). textClasses nach reports:modifying-theme-json und
        # powerbi-report-authoring/references/theming.md: `largeTitle` = Visual-
        # Titel, `title` = Achsentitel / Slicer-Kopf, `label` = Werte und
        # Beschriftungen (die kleinen Klassen smallLightLabel & Co. leiten sich
        # daraus ab). Die Diagrammbeschriftung des Mockups gilt fuer `title` und
        # `label`. `callout` (KPI-Werte) kennt das Mockup nicht — bleibt dem
        # Theme ueberlassen. Farben in textClasses als reiner Hex-String; `title`
        # bekommt Ink ausdruecklich, sonst leitet Power BI sie aus dataColors[0] ab.
        star["title"] = [{"show": True, "fontSize": ts["titlePt"],
                          "fontColor": {"solid": {"color": st.ink}}}]
        star["subTitle"] = [{"fontSize": ts["subPt"]}]
        extra["textClasses"] = {
            "largeTitle": {"fontSize": ts["titlePt"], "color": st.ink},
            "title": {"fontSize": ts["chartPt"], "color": st.ink},
            "label": {"fontSize": ts["chartPt"]},
        }
    typo_note = ""
    if ts:
        typo_note = (" Typografie aus design.typography (Basis 1280 px, ×%s, k %s): "
                     "Titel %s px = %s pt, Untertitel %s px = %s pt, "
                     "Diagrammbeschriftung %s px = %s pt; Kacheln mit eigener "
                     "Skalierung stehen als title/subTitle.fontSize in "
                     "chrome-batch.json."
                     % (ts["scale"], ts["k"], ts["titlePx"], ts["titlePt"],
                        ts["subPx"], ts["subPt"], ts["chartPx"], ts["chartPt"]))
    return dict({
        "name": "%s · Mockup-Fragment" % (nspec["meta"].get("name") or "Mockup"),
        "$comment": ("Kachel-Optik und Farben aus `design` als Theme-Fragment. In ein "
                     "bestehendes Theme mergen (Skill reports:modifying-theme-json bzw. "
                     "powerbi-design-framework), danach die background/border/"
                     "dropShadow-Schritte aus chrome-batch.json weglassen. "
                     "Seitenhintergrund %s setzt `pbir pages background`, "
                     "Akzentfarbe %s steckt in Nav-Buttons und Burger. "
                     "good/bad kommen aus der Varianz-Palette `%s`%s."
                     % (st.page_bg, st.accent, st.palette,
                        " (dunkler Modus)" if st.dark_mode else "")) + typo_note,
        # Farbrollen des Themes: Hintergrund = Seitenhintergrund, Vordergrund = Ink,
        # good/bad = Varianzfarben (Abweichung positiv/negativ), tableAccent = Akzent.
        "background": st.page_bg,
        "foreground": st.ink,
        "tableAccent": st.accent,
        "good": st.good,
        "bad": st.bad,
        "neutral": st.muted,
        "visualStyles": {"*": {"*": star}},
    }, **extra)


# --------------------------------------------------------------------------- #
# Plan und Abnahme
# --------------------------------------------------------------------------- #
def build_plan(nspec: dict, report: str, out_dir: Path, per_page, model_name: str,
               todos, custom_warn=()) -> dict:
    o = out_dir.as_posix()
    canvas = nspec["canvas"]
    w, h = canvas.get("width", 1280), canvas.get("height", 720)
    steps = []

    def step(sid, op, commands, *, page=None, idempotent="", delta="", batch=None):
        steps.append({"id": sid, "op": op, "page": page,
                      "idempotent": idempotent, "delta": delta,
                      "commands": commands, "batch": batch})

    a11y = a11y_issues(nspec)
    a11y_block = []
    if a11y:
        blockers = [i for i in a11y if i.get("level") == "error"]
        step("accessibility", "confirm",
             ["# Barrierefreiheit: %d Befund(e), davon %d Fehler — siehe "
              "checklist.md, Abschnitt „Barrierefreiheit\"" % (len(a11y), len(blockers))]
             + ["# BLOCKER %s%s: %s" % (i.get("code"),
                                         " (%s)" % i["page"] if i.get("page") else "",
                                         i.get("text", "")) for i in blockers],
             idempotent="reine Freigabe, schreibt nichts",
             delta="Fehler (`error`) müssen vor dem Bau im Mockup behoben oder vom "
                   "Menschen ausdrücklich akzeptiert sein; Warnungen vorlegen.")
        a11y_block = [{"level": i.get("level"), "code": i.get("code"),
                       "page": i.get("page"), "visual": i.get("visual"),
                       "text": i.get("text"),
                       "blocker": i.get("level") == "error"} for i in a11y]
    step("backup", "backup", ['pbir backup "%s"' % report],
         idempotent="Legt eine weitere Sicherung an; mehrfach ausführen schadet nicht.",
         delta="immer vor dem ersten schreibenden Schritt")
    if nspec["newFields"]:
        step("model", "model", ["# siehe model-todos.md — DAX bestätigen lassen",
                                'te validate -m "%s" --errors-only'
                                % (model_name or "<Name>.SemanticModel")],
             idempotent="`te add --if-not-exists` legt nichts doppelt an.",
             delta="neue Kennzahlen zuerst, sonst lehnt --from-json die ganze Datei ab")
    params = collect_field_params(nspec)
    if params:
        step("fieldparams", "model",
             ["# Feldparameter anlegen — Skript und Prüfschritte in model-todos.md: %s"
              % ", ".join("'%s' (%d Feld(er))" % (fp["name"], len(fp["fields"]))
                          for fp in params),
              'te validate -m "%s" --errors-only'
              % (model_name or "<Name>.SemanticModel")],
             idempotent="`Model.AddCalculatedTable` wirft bei gleichem Namen — vorher "
                        "`te list` prüfen und den Schritt sonst überspringen.",
             delta="Die Parametertabelle muss **vor** `pbir add visual --from-json` "
                   "stehen, sonst wird die ganze Datei abgelehnt.")

    for e in per_page:
        page_path = "%s/%s.Page" % (report, e["name"])
        step("page:%s" % e["dir"], "add_page",
             ['pbir add page "%s/%s.Page" -n "%s" -w %s -h %s'
              % (report, slug(e["name"]), e["name"], w, h),
              'pbir rm "%s/Title.Visual" -f' % page_path],
             page=e["name"],
             idempotent="Seite existiert bereits → diesen Schritt überspringen und "
                        "stattdessen `pbir pages resize \"%s\" -w %s -h %s`."
                        % (page_path, w, h),
             delta="vorhandene Seite wird nie gelöscht")
        step("chrome:%s" % e["dir"], "add_visuals",
             ['pbir add visual "%s" --from-json "%s/%s/chrome-visuals.json"'
              % (page_path, o, e["dir"])],
             page=e["name"],
             idempotent="Schlägt fehl, wenn die Chrome-Visuals schon existieren → "
                        "dann delta-batch.json statt dieses Schritts.",
             delta="delta-batch.json aktualisiert Position/Größe")
        step("visuals:%s" % e["dir"], "add_visuals",
             ['pbir add visual "%s" --from-json "%s/%s/pbir-visuals.json"'
              % (page_path, o, e["dir"])],
             page=e["name"],
             idempotent="Namen sind stabil; ein zweiter Lauf legt nichts doppelt an, "
                        "sondern scheitert → delta-batch.json.",
             delta="delta-batch.json aktualisiert Position, Größe und Bindung")
        if e["text"]:
            step("text:%s" % e["dir"], "add_visuals",
                 ['pbir add visual "%s" --from-json "%s/%s/text-visuals.json"'
                  % (page_path, o, e["dir"])],
                 page=e["name"],
                 idempotent="wie oben", delta="delta-batch.json")
        step("background:%s" % e["dir"], "page_background",
             ['pbir pages background "%s" --color "%s" --transparency 0'
              % (page_path, e["page_bg"])],
             page=e["name"],
             idempotent="Setzt eine feste Farbe — beliebig oft ausfuehrbar.",
             delta="unveraendert im zweiten Lauf")
        step("format:%s" % e["dir"], "batch",
             ['pbir batch validate "%s/%s/chrome-batch.json"' % (o, e["dir"]),
              'pbir batch plan "%s/%s/chrome-batch.json" --root "%s"' % (o, e["dir"], report),
              'pbir batch run "%s/%s/chrome-batch.json" --root "%s"' % (o, e["dir"], report)],
             page=e["name"], batch="%s/chrome-batch.json" % e["dir"],
             idempotent="Setzt Eigenschaften auf feste Werte — beliebig oft ausführbar.",
             delta="unverändert im zweiten Lauf")
        step("analysis:%s" % e["dir"], "commands",
             ['bash "%s/%s/analysis-commands.sh"' % (o, e["dir"])],
             page=e["name"],
             idempotent="Sortierung und Untertitel ja; `pbir add filter` legt bei "
                        "erneutem Lauf ggf. einen zweiten Filter an — vorher "
                        "`pbir filters list` prüfen.",
             delta="Top-N/Vorauswahl vor dem zweiten Lauf prüfen")
        if e["custom"]:
            step("custom:%s" % e["dir"], "custom_visuals",
                 ['# .pbiviz zuerst in den Bericht importieren (Desktop): %s'
                  % ", ".join(sorted({sl["pbiviz"] or "pbiviz package"
                                      for sl in e["custom"]})),
                  'bash "%s/%s/custom-commands.sh"' % (o, e["dir"])],
                 page=e["name"],
                 idempotent="Platzhalter-Shape schlägt beim zweiten Mal fehl "
                            "(Name existiert); das Kopieren der visual.json ist "
                            "beliebig wiederholbar.",
                 delta="Im Delta-Lauf reicht das Kopieren der neu erzeugten "
                       "visual.json — sie enthält Position, Größe, Bindung und "
                       "Container-Formatierung vollständig.")

    step("navigation", "commands", ["# Befehle in navigation.md — erst wenn alle "
                                    "Seiten stehen"],
         idempotent="`pbir add bookmark` legt bei gleichem Namen keinen zweiten an "
                    "(prüfen mit `pbir bookmarks list`).",
         delta="Lesezeichen nur ergänzen, nie löschen")
    step("annotate", "annotation",
         ['pbir add annotation "%s" --name mockup-spec-hash --value "%s"'
          % (report, nspec["meta"].get("specHash") or ""),
          'pbir add annotation "%s" --name mockup-spec-name --value "%s"'
          % (report, nspec["meta"].get("name") or "")],
         idempotent="Gleicher Name überschreibt den Wert.",
         delta="Beim nächsten Lauf mit `pbir annotations list \"%s\" --json` vergleichen: "
               "gleicher Hash = nichts zu tun." % report)
    step("verify", "verify",
         ['pbir validate "%s" --fields' % report,
          'te validate -m "%s" --errors-only' % (model_name or "<Name>.SemanticModel"),
          'python .claude/skills/mockup-to-powerbi/scripts/mockup_verify.py "%s" "%s/acceptance.json"'
          % (report, o)],
         idempotent="reine Prüfung", delta="immer")

    extra = {}
    if a11y_block:
        extra["accessibility"] = {
            "acceptBeforeBuild": any(i["blocker"] for i in a11y_block),
            "blockers": sum(1 for i in a11y_block if i["blocker"]),
            "findings": a11y_block,
        }
    ts = type_sizes(nspec)
    if ts:
        extra["typography"] = {
            "basis": nspec["design"]["typography"].get("basis"),
            "scale": ts["scale"], "k": ts["k"],
            "titlePt": ts["titlePt"], "subtitlePt": ts["subPt"],
            "labelPt": ts["chartPt"],
            "tileOverrides": [{"page": p["name"], "visual": v["id"],
                               "scale": type_sizes(nspec, v)["tile"],
                               "titlePt": type_sizes(nspec, v)["titlePt"]}
                              for p in nspec["pages"] for v in p["visuals"]
                              if type_sizes(nspec, v)["tile"] != 1]}
    filt = (nspec["zones"] or {}).get("filter") or {}
    fl = filter_layout(nspec)
    if fl and (fl["new"] or any(slicer_type(s_) for s_ in filt.get("slicers") or [])):
        extra["filter"] = {
            "heading": fl["heading"], "text": fl["text"],
            "slicers": [{"name": s_.get("name"), "ref": s_.get("ref"),
                         "type": slicer_type(s_),
                         "format": SLICER_FORMAT.get(slicer_type(s_) or "", {})}
                        for s_ in filt.get("slicers") or []]}
    if any("navPosition" in ((nspec["zones"] or {}).get(z_) or {})
           for z_ in ("header", "footer")):
        extra["navigation"] = {"position": nav_position(nspec["zones"] or {}),
                               "footer": footer_nav_entries(nspec["zones"] or {})}
    return dict({
        "generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "tool": "mockup_to_pbir.py",
        "spec": {"name": nspec["meta"].get("name"),
                 "specVersion": nspec["sourceVersion"],
                 "specHash": nspec["meta"].get("specHash"),
                 "lang": nspec["meta"].get("lang")},
        "report": report, "model": model_name or None,
        "canvas": {"width": w, "height": h},
        "pages": [{"name": e["name"], "dir": e["dir"], "slug": slug(e["name"]),
                   "visuals": len(e["pbir"]) + len(e["text"]),
                   "chrome": len(e["chrome"]), "ck": len(e["ck"]),
                   "deneb": len(e["deneb"])} for e in per_page],
        "rules": [
            "Visualname = `id` aus der Spec (stabil über Läufe).",
            "Vorhandene Visuals werden aktualisiert (delta-batch.json), nie neu angelegt.",
            "Was im Bericht steht, aber nicht mehr im Mockup: nur melden, nie löschen.",
            "Kein Schritt schreibt, bevor der Mensch den Plan freigegeben hat.",
        ],
        "steps": steps,
        "todos": todos,
        "issues": [{"level": "warn", "code": "CUSTOM_VISUAL", "text": w}
                   for w in custom_warn]
        + [{"level": "info" if len(fp["fields"]) >= 2 else "warn",
            "code": "FIELDPARAM" if len(fp["fields"]) >= 2 else "FIELDPARAM_FEW",
            "text": ("Feldparameter „%s\" mit %d Feld(ern) (%s) — berechnete Tabelle "
                     "im Modell anlegen, dann bindet die Achse auf `%s`. Dazu einen "
                     "Slicer einplanen."
                     % (fp["name"], len(fp["fields"]),
                        ", ".join(fp["fields"]) or "keine", param_ref(fp)))}
           for fp in collect_field_params(nspec)],
        "fieldParams": [
            {"name": fp["name"], "role": fp["role"], "fields": fp["fields"],
             "ref": param_ref(fp), "visuals": fp["visuals"]}
            for fp in collect_field_params(nspec)],
        "smallMultiples": [
            {"page": p["name"], "visual": v["id"],
             "field": sm_field(v), "bucket": SMALL_MULTIPLES_BUCKET,
             "nativeType": (v.get("native") or {}).get("type"),
             "supported": bool(sm_field(v)) and v.get("engine") == "native"
             and (v.get("native") or {}).get("type") in SMALL_MULTIPLES_TYPES}
            for p in nspec["pages"] for v in p["visuals"]
            if isinstance((v.get("analysis") or {}).get("smallMultiples"), dict)],
        "customVisuals": [
            {"page": e["name"], "visual": sl["id"], "name": sl["visualName"],
             "guid": sl["guid"], "pbiviz": sl["pbiviz"],
             "file": "%s/%s/%s" % (o, e["dir"], sl["file"]),
             "buckets": sl["buckets"], "warnings": sl["warnings"]}
            for e in per_page for sl in e["custom"]],
    }, **extra)


def build_acceptance(nspec: dict, report: str, per_page, st: Style) -> dict:
    pages = []
    for e in per_page:
        expected = []
        for item in e["chrome"]:
            expected.append({"name": item["name"], "type": item["visual_type"],
                             "rect": {"x": item["x"], "y": item["y"],
                                      "w": item["width"], "h": item["height"]},
                             "role": "chrome", "fields": {}})
        for item in e["text"]:
            expected.append({"name": item["name"], "type": item["visual_type"],
                             "rect": {"x": item["x"], "y": item["y"],
                                      "w": item["width"], "h": item["height"]},
                             "role": "text", "fields": {}})
        slicers = set(e["slicers"])
        for item in e["pbir"]:
            fields = {}
            for bucket, refs in (item.get("fields") or {}).items():
                fields[bucket] = refs if isinstance(refs, list) else [refs]
            expected.append({"name": item["name"], "type": item["visual_type"],
                             "rect": {"x": item["x"], "y": item["y"],
                                      "w": item["width"], "h": item["height"]},
                             "role": "slicer" if item["name"] in slicers else "content",
                             "fields": fields})
        for s in e["ck"]:
            r = s["rect"]
            expected.append({"name": s["id"], "type": "chartKitchen|shape",
                             "rect": {"x": r["x"], "y": r["y"], "w": r["w"], "h": r["h"]},
                             "role": "chartkitchen", "optional": True, "fields": {}})
        for s in e["deneb"]:
            r = s["rect"]
            expected.append({"name": s["id"], "type": "deneb|shape",
                             "rect": {"x": r["x"], "y": r["y"], "w": r["w"], "h": r["h"]},
                             "role": "deneb", "optional": True, "fields": {}})
        for s in e["custom"]:
            r = s["rect"]
            # `optional`, weil der Platzhalter noch ein `shape` sein kann, solange
            # die visual.json nicht kopiert wurde. Ist sie kopiert, pruefen Typ
            # (GUID) und Buckets ganz normal.
            expected.append({"name": s["id"],
                             "type": "%s|shape" % (s["guid"] or "custom"),
                             "rect": {"x": r["x"], "y": r["y"], "w": r["w"], "h": r["h"]},
                             "role": "custom", "optional": True,
                             "fields": dict(s["buckets"])})
        pages.append({"name": e["name"], "background": st.page_bg,
                      "canvas": {"width": nspec["canvas"].get("width"),
                                 "height": nspec["canvas"].get("height")},
                      "visuals": expected})

    bookmarks = []
    for p in nspec["pages"]:
        names = bookmark_names(nspec, p)
        if names:
            bookmarks.extend(names)
    return {
        "generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "report": report,
        "specHash": nspec["meta"].get("specHash"),
        "specName": nspec["meta"].get("name"),
        "tolerance": 1,
        "pages": pages,
        "bookmarks": sorted(set(bookmarks)),
        "drillthrough": [{"page": d["toPage"], "table": d["table"], "field": d["field"]}
                         for d in drill_targets(nspec) if d["table"]],
        "annotations": {"mockup-spec-hash": nspec["meta"].get("specHash")},
    }


# --------------------------------------------------------------------------- #
# Batch-Dateien je Seite
# --------------------------------------------------------------------------- #
def build_chrome_batch(nspec: dict, page: dict, report: str, st: Style,
                       batch_props: dict, label_props: dict) -> Batch:
    b = Batch("mockup · %s" % page["name"], report)
    page_sel = "%s.Page" % page["name"]
    # Achtung: Die Batch-Spec erlaubt KEINE Zusatzschluessel (auch kein "$comment") —
    # `pbir batch validate` lehnt die Datei sonst ab. Erklaerungen stehen in
    # commands.md. Der Seitenhintergrund fehlt hier absichtlich: `set` kennt auf
    # Seitenebene nur display_name, display_option, height, is_hidden, page_type,
    # visibility, width. Dafuer laeuft vorher `pbir pages background --color`.
    # z-Order laeuft ueber `position.z` (verifiziert, pbir 0.9.32).
    for name in sorted(batch_props):
        props = dict(batch_props[name])
        z = props.pop("__z", None)
        if z is not None:
            props["position.z"] = z
        if props:
            b.set("%s/%s.Visual" % (page_sel, name), props, stem="format")
    for name, props in sorted(label_props.items()):
        if props:
            b.set("%s/%s.Visual" % (page_sel, name), props, stem="labels")
    return b


def build_delta_batch(nspec: dict, page: dict, report: str, items) -> Batch:
    b = Batch("mockup delta · %s" % page["name"], report)
    page_sel = "%s.Page" % page["name"]
    for item in items:
        sel = "%s/%s.Visual" % (page_sel, item["name"])
        b.move(sel, item["x"], item["y"], stem="move-%s" % item["name"])
        b.resize(sel, item["width"], item["height"], stem="resize-%s" % item["name"])
        for bucket, refs in (item.get("fields") or {}).items():
            ref_list = refs if isinstance(refs, list) else [refs]
            b.bind(sel, clear=[bucket], stem="clear-%s" % item["name"])
            b.bind(sel, add=["%s:%s" % (bucket, r) for r in ref_list],
                   stem="bind-%s" % item["name"])
    return b


# --------------------------------------------------------------------------- #
# main
# --------------------------------------------------------------------------- #
def main() -> int:
    p = argparse.ArgumentParser(
        description="MockupKitchen-Spec → pbir-Bausteine (specVersion 1, 2 und 3)",
        formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("spec", help="Pfad zu mockup-spec.json")
    p.add_argument("--out", default="mockup-out", help="Ausgabeordner (Default: mockup-out)")
    p.add_argument("--page-name", help="Seitenname überschreiben (nur specVersion 1)")
    p.add_argument("--report", help='Report-Ordner, z. B. "Meine.Report" — erzeugt commands.md')
    p.add_argument("--plan", action="store_true",
                   help="plan.json und acceptance.json erzeugen (Freigabe-Vorlage "
                        "und Sollbild für mockup_verify.py)")
    p.add_argument("--validate", action="store_true",
                   help="nur prüfen: Schema + Struktur, keine Dateien schreiben")
    p.add_argument("--lang", choices=("de", "en"), default=None,
                   help="Sprache der erzeugten Texte (Default: meta.lang, sonst de)")
    p.add_argument("--force", action="store_true",
                   help="trotz Schemafehlern weitermachen (Notausgang, nicht empfohlen)")
    p.add_argument("--ink", default=None,
                   help="Farbe für Nav-Leiste/dunkles Kopfband "
                        "(Vorgabe: design.colors.ink, sonst #0F1E2E)")
    p.add_argument("--on-ink", dest="on_ink", default="#FFFFFF", help="Textfarbe auf Ink")
    p.add_argument("--muted-on-ink", dest="muted_on_ink", default="#C8CDD4",
                   help="Untertitelfarbe im dunklen Kopfband")
    p.add_argument("--panel", default="#F1F3F5", help="Fläche des Filter-Panels")
    p.add_argument("--muted", default="#6B7280", help="Textfarbe der Fußleiste")
    p.add_argument("--tile-border", dest="tile_border", default="#E5E7EB",
                   help="Rahmenfarbe der Kacheln (tileStyle 'border')")
    p.add_argument("--ck-fallback", action="store_true",
                   help="ChartKitchen-Slots zusätzlich als natives Ersatzvisual in "
                        "pbir-visuals.json aufnehmen (nur wenn die Spec ein natives "
                        "Gegenstück kennt) — nützlich, solange keine Referenz-Instanz "
                        "des Custom Visuals im Report liegt")
    opt = p.parse_args()

    # Windows-Konsole ist oft cp1252 -- Umlaute im Report duerfen daran nicht
    # scheitern. Die geschriebenen Dateien sind immer UTF-8.
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

    try:
        raw = load(opt.spec)
        nspec = upgrade(raw, opt.page_name)
    except SpecError as e:
        print("Fehler: %s" % e, file=sys.stderr)
        return 2

    problems = validate(as_document(nspec)) + structural_errors(nspec)
    if problems:
        print("Spec-Prüfung: %d Befund(e)" % len(problems), file=sys.stderr)
        for m in problems:
            print("  - %s" % m, file=sys.stderr)
        if not opt.force:
            print("\nOhne gültige Spec kein Plan. Entweder im Mockup-Tool korrigieren "
                  "und neu exportieren oder --force setzen (auf eigene Rechnung).",
                  file=sys.stderr)
            return 2
        dropped = drop_unusable(nspec)
        print("--force gesetzt: es wird trotzdem gebaut.", file=sys.stderr)
        if dropped:
            print("  Ohne brauchbares Rechteck und deshalb ausgelassen: %s"
                  % ", ".join(dropped), file=sys.stderr)
    if opt.validate:
        print("Spec in Ordnung: specVersion %d (gelesen als v%d) · %d Seite(n) · "
              "%d Kachel(n) · Hash %s"
              % (nspec["sourceVersion"], nspec["version"], len(nspec["pages"]),
                 sum(len(p["visuals"]) for p in nspec["pages"]),
                 nspec["meta"].get("specHash")))
        return 0

    lang = opt.lang or (nspec["meta"].get("lang") or "de")
    if lang not in T:
        lang = "de"
    st = Style(nspec, opt)
    model_name = (nspec["model"] or {}).get("source") or ""
    out = Path(opt.out).expanduser()
    out.mkdir(parents=True, exist_ok=True)
    report = opt.report or "<Name>.Report"

    all_chrome_notes = []
    all_slot_warn = []
    all_custom_warn = []
    all_todos = []
    per_page = []
    written = []

    filt = (nspec["zones"] or {}).get("filter") or {}
    overlay_filter = bool(filt.get("overlay")) or filt.get("mode") == "burger"

    for page in nspec["pages"]:
        pdir = slug(page["name"])
        if any(e["dir"] == pdir for e in per_page):
            pdir = "%s_%s" % (pdir, page["index"])
        pout = out / pdir
        pout.mkdir(parents=True, exist_ok=True)

        pbir_visuals, skipped = build_pbir_visuals(nspec, page,
                                                   ck_fallback=opt.ck_fallback)
        chrome_visuals, cmds, acts, notes, batch_props = build_chrome(nspec, page, st, opt)
        text_visuals, text_notes = build_text_tiles(nspec, page, st, cmds, acts,
                                                    batch_props, lang)
        notes += text_notes
        ck_slots, deneb_slots, slot_warn = build_slots(page, nspec)
        custom_slots, custom_warn = build_custom_visuals(nspec, page, st)

        slicers = slicer_names(nspec, page)
        content_names = ([i["name"] for i in pbir_visuals if i["name"] not in slicers]
                         + [i["name"] for i in text_visuals])
        add_tile_formatting(cmds, st, content_names, batch_props)
        for name, props in add_typography(cmds, st, page, content_names).items():
            batch_props.setdefault(name, {}).update(props)
        notes += add_slicer_formatting(nspec, page, cmds, batch_props)
        if content_names:
            cmds.note("Inhalt ueber die Chrome-Flaechen legen "
                      "(--from-json vergibt immer z=0)")
            for name in content_names:
                cmds.position(name, "--z", str(Z["content"]))
                batch_props.setdefault(name, {})["__z"] = Z["content"]
            cmds.note("")
        if slicers:
            z_slicer = Z["overlayButton"] if overlay_filter else Z["content"]
            cmds.note("Slicer" + (" (Overlay-Panel)" if overlay_filter else ""))
            for name in slicers:
                cmds.position(name, "--z", str(z_slicer))
                batch_props.setdefault(name, {})["__z"] = z_slicer
            cmds.note("")

        built_names = {i["name"] for i in pbir_visuals} | {i["name"] for i in text_visuals}
        an_cmds, todos, label_props = analysis_actions(nspec, page, built_names, lang)
        an_cmds.items = acts.items + an_cmds.items      # Aktionen zuerst
        all_todos += todos

        chrome_batch = build_chrome_batch(nspec, page, report, st,
                                          batch_props, label_props)
        delta_batch = build_delta_batch(nspec, page, report,
                                        pbir_visuals + text_visuals + chrome_visuals)

        page_expr_sh = ("%s/%s.Page" % (opt.report, page["name"]) if opt.report
                        else "$REPORT/$PAGE.Page")
        page_expr_ps = ("%s/%s.Page" % (opt.report, page["name"]) if opt.report
                        else "$Report/$Page.Page")
        head = ("Seitenhintergrund, Chrome-Texte, -Farben, Kachel-Container, "
                "Aktionen und z-Order.\n"
                "# Fallback zu chrome-batch.json (ein Lauf statt vieler Aufrufe).\n"
                "# Zuletzt ausfuehren: erst chrome-visuals.json, dann "
                "pbir-visuals.json einspielen.\n")
        sh_head = ("#!/usr/bin/env bash\n# " + head + "set -euo pipefail\n"
                   + ("" if opt.report else
                      'REPORT="<Name>.Report"\nPAGE="%s"\n' % page["name"]) + "\n")
        ps_head = ("# " + head + "$ErrorActionPreference = 'Stop'\n"
                   + ("" if opt.report else
                      '$Report = "<Name>.Report"\n$Page = "%s"\n' % page["name"]) + "\n")
        an_head = ("Alles, was `pbir batch` nicht kann: Button-Aktionen, Sortierung, "
                   "Top-N,\n# Anzeigeeinheiten, Untertitel, Slicer-Vorauswahl, "
                   "Annotationen.\n"
                   "# Bewusst OHNE set -e: einzelne Visualtypen kennen manche "
                   "Eigenschaft nicht,\n# das darf den Rest nicht abbrechen.\n")
        an_sh = ("#!/usr/bin/env bash\n# " + an_head
                 + ("" if opt.report else
                    'REPORT="<Name>.Report"\nPAGE="%s"\n' % page["name"]) + "\n")
        an_ps = ("# " + an_head + "$ErrorActionPreference = 'Continue'\n"
                 + ("" if opt.report else
                    '$Report = "<Name>.Report"\n$Page = "%s"\n' % page["name"]) + "\n")

        cr = page["contentRect"] or {}
        zones_json = {"content": [cr.get("x", 0), cr.get("y", 0),
                                  cr.get("w", 0), cr.get("h", 0)],
                      "ignorePages": []}

        custom_index = [{k: v for k, v in slot.items() if k != "visualJson"}
                        for slot in custom_slots]
        files = [
            ("pbir-visuals.json", json.dumps(pbir_visuals, ensure_ascii=False, indent=2) + "\n"),
            ("custom-visuals.json", json.dumps(custom_index, ensure_ascii=False, indent=2) + "\n"),
            ("text-visuals.json", json.dumps(text_visuals, ensure_ascii=False, indent=2) + "\n"),
            ("chrome-visuals.json", json.dumps(chrome_visuals, ensure_ascii=False, indent=2) + "\n"),
            ("chrome-batch.json", chrome_batch.dump()),
            ("delta-batch.json", delta_batch.dump()),
            ("chrome-commands.sh", sh_head + cmds.render("sh", page_expr_sh)),
            ("chrome-commands.ps1", ps_head + cmds.render("ps1", page_expr_ps)),
            ("analysis-commands.sh", an_sh + an_cmds.render("sh", page_expr_sh)),
            ("analysis-commands.ps1", an_ps + an_cmds.render("ps1", page_expr_ps)),
            ("zones.json", json.dumps(zones_json, ensure_ascii=False, indent=2) + "\n"),
            ("chartkitchen-slots.json", json.dumps(ck_slots, ensure_ascii=False, indent=2) + "\n"),
            ("deneb-slots.json", json.dumps(deneb_slots, ensure_ascii=False, indent=2) + "\n"),
        ]
        if custom_slots:
            out_expr = (pout.as_posix() if opt.report else "<Ausgabeordner>/%s" % pdir)
            files.append(("custom-commands.sh",
                          render_custom_commands(custom_slots, report, page,
                                                 out_expr, "sh")))
            files.append(("custom-commands.ps1",
                          render_custom_commands(custom_slots, report, page,
                                                 out_expr, "ps1")))
            for slot in custom_slots:
                files.append((slot["file"],
                              json.dumps(slot["visualJson"], ensure_ascii=False,
                                         indent=2) + "\n"))
        for name, text in files:
            target = pout / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(text, encoding="utf-8")
            written.append("%s/%s" % (pdir, name))

        all_chrome_notes += notes
        all_slot_warn += slot_warn
        all_custom_warn += custom_warn
        per_page.append({"name": page["name"], "dir": pdir, "question": page.get("question"),
                         "page_bg": st.page_bg,
                         "pbir": pbir_visuals, "text": text_visuals,
                         "chrome": chrome_visuals, "ck": ck_slots, "deneb": deneb_slots,
                         "custom": custom_slots,
                         "slicers": slicers, "skipped": skipped, "notes_block": notes})

    root_files = [
        ("model-todos.md", build_model_todos(nspec, model_name)),
        ("checklist.md", build_checklist(nspec, per_page, all_chrome_notes,
                                         all_slot_warn, all_todos, all_custom_warn)),
        ("navigation.md", build_navigation_md(nspec, opt.report or "")),
        ("analysis-todos.md", build_analysis_todos(nspec, all_todos, report)),
        ("theme-fragment.json",
         json.dumps(build_theme_fragment(nspec, st), ensure_ascii=False, indent=2) + "\n"),
    ]
    if opt.report:
        root_files.append(("commands.md",
                           build_commands_md(nspec, opt.report, out, per_page, model_name)))
    if opt.plan:
        root_files.append(("plan.json",
                           json.dumps(build_plan(nspec, report, out, per_page,
                                                 model_name, all_todos,
                                                 all_custom_warn),
                                      ensure_ascii=False, indent=2) + "\n"))
        root_files.append(("acceptance.json",
                           json.dumps(build_acceptance(nspec, report, per_page, st),
                                      ensure_ascii=False, indent=2) + "\n"))
    for name, text in root_files:
        (out / name).write_text(text, encoding="utf-8")
        written.append(name)

    canvas = nspec["canvas"]
    print("specVersion %d (gelesen als v%d) · %d Seite(n) · Canvas %s×%s "
          "(uiScale ×%s) · Sprache %s · Hash %s · Modell %s"
          % (nspec["sourceVersion"], nspec["version"], len(nspec["pages"]),
             canvas.get("width"), canvas.get("height"), nspec["uiScale"], lang,
             nspec["meta"].get("specHash"), model_name or "(nicht in der Spec)"))
    print("-> %s" % out)
    for name in written:
        print("   %s" % name)
    for e in per_page:
        print("\nSeite '%s': native Visuals + Slicer %d · Text/Button %d · Chrome %d · "
              "ChartKitchen %d · Deneb %d · Custom %d%s"
              % (e["name"], len(e["pbir"]), len(e["text"]), len(e["chrome"]),
                 len(e["ck"]), len(e["deneb"]), len(e["custom"]),
                 " · %d wegen leerer Pflichtrolle ausgelassen" % len(e["skipped"])
                 if e["skipped"] else ""))
    print("\nVerknüpfungen: %d · neue Felder: %d · Analyse-To-dos: %d"
          % (len(nspec["links"]), len(nspec["newFields"]), len(all_todos)))
    open_points = (sum(len(v.get("warnings") or [])
                       for p in nspec["pages"] for v in p["visuals"])
                   + len([i for i in nspec["issues"] if i.get("level") != "info"])
                   + len(set(all_chrome_notes)) + len(all_slot_warn)
                   + len(all_custom_warn))
    if open_points:
        print("%d offene(r) Punkt(e) — siehe checklist.md" % open_points)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
