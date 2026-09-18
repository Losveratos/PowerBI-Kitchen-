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
    MEASURE_ROLE_ORDER, SpecError, as_document, load, slug, split_ref,
    structural_errors, upgrade, validate,
)

# Ebenen. --from-json vergibt immer z = 0, deshalb wird alles explizit gesetzt.
Z = {"bg": 0, "text": 4, "button": 5, "content": 10,
     "overlay": 20, "overlayText": 22, "overlayButton": 24}

# analysis.displayUnits -> Enumwert von labels.labelDisplayUnits
DISPLAY_UNITS = {"none": 1, "K": 1000, "M": 1000000}
DISPLAY_UNITS_CLI = {"none": "None", "K": "Thousands", "M": "Millions"}

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
        fields = {}
        for bucket, entries in (native.get("buckets") or {}).items():
            refs = [f["ref"] for f in entries]
            fields[bucket] = refs[0] if len(refs) == 1 else refs
        out.append(vis(native["type"], v["id"], v.get("title") or v.get("label", ""),
                       *rect(v["rect"]), fields=fields or None))

    filt = (nspec["zones"] or {}).get("filter")
    if filt:
        k = nspec["uiScale"]
        pad = round(8 * k)
        fx, fy, fw, fh = rect(filt)
        names = slicer_names(nspec, page)
        for i, s in enumerate(filt.get("slicers") or []):
            if filt.get("mode") == "top":
                x, y = fx + pad + i * round(168 * k), fy + pad
                w, h = round(160 * k), fh - 2 * pad
            else:
                x, y = fx + pad, fy + round(40 * k) + i * round(64 * k)
                w, h = fw - 2 * pad, round(56 * k)
            out.append(vis("slicer", names[i], s["name"], x, y, w, h,
                           fields={"Values": s["ref"]}))
    return out, skipped


# --------------------------------------------------------------------------- #
# Farben und Schriftgroessen aus `design`
# --------------------------------------------------------------------------- #
class Style:
    """Leitet aus design + CLI-Optionen die konkreten Werte fuer das Chrome ab."""

    def __init__(self, nspec: dict, opt) -> None:
        d = nspec["design"]
        self.design = d
        self.scale = d["fontScale"]
        self.ink = opt.ink
        self.on_ink = opt.on_ink
        self.muted_on_ink = opt.muted_on_ink
        self.muted = opt.muted
        self.panel = opt.panel
        self.tile_border = opt.tile_border
        self.accent = d["accent"] or opt.ink
        self.tile_bg = d["tileBackground"] or "#FFFFFF"
        self.page_bg = d["pageBackground"] or "#FFFFFF"
        self.radius = int(d["cornerRadius"] or 0)
        self.tile_style = d["tileStyle"] or "border"

        style = (d["headerStyle"] or "dark").lower()
        self.header_style = style
        if style == "light":
            self.header_bg = "#FFFFFF"
            self.header_fg = self.ink
            self.header_muted = self.muted
            self.header_rule = self.tile_border
        elif style == "accent":
            self.header_bg = self.accent
            self.header_fg = self.on_ink
            self.header_muted = self.on_ink
            self.header_rule = None
        else:
            self.header_bg = self.ink
            self.header_fg = self.on_ink
            self.header_muted = self.muted_on_ink
            self.header_rule = None

    def sz(self, base: float) -> int:
        """Schriftgroesse skaliert, auf den pbir-Bereich 6-45 begrenzt."""
        return max(6, min(45, int(round(base * self.scale))))

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
                   active: bool, fg: str) -> None:
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
        props += [("outline.show", False), ("text.text", text),
                  ("text.fontSize", st.sz(10)),
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
    nav_entries = [str(n) for n in (header.get("nav") or []) if str(n).strip()]

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
        if mode == "top":
            label("chrome_filter_title", "Filter-Überschrift", fx + st.px(8), fy,
                  st.px(56), fh, "Filter", size=st.sz(11), color=st.ink, bold=True,
                  z=z_tx)
            notes.append("Filter als Leiste oben: die Slicer stehen nebeneinander "
                         "(%d px breit, Abstand %d px)." % (st.px(160), st.px(8)))
        else:
            label("chrome_filter_title", "Filter-Überschrift", fx + st.px(8),
                  fy + st.px(8), fw - st.px(16), st.px(24), "Filter",
                  size=st.sz(11), color=st.ink, bold=True, z=z_tx)

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
        if mode != "top" and n_slicers and st.px(40) + n_slicers * st.px(64) > fh:
            notes.append("%d Slicer passen rechnerisch nicht in das %d px hohe "
                         "Filter-Panel (%d + n*%d px)."
                         % (n_slicers, fh, st.px(40), st.px(64)))
        if mode == "top" and n_slicers and st.px(8) + n_slicers * st.px(168) > fw:
            notes.append("%d Slicer passen rechnerisch nicht in die %d px breite "
                         "Filter-Leiste (%d + n*%d px)."
                         % (n_slicers, fw, st.px(8), st.px(168)))

    # ---- Fussleiste ------------------------------------------------------ #
    footer = zones.get("footer")
    if footer:
        gx, gy, gw, gh = rect(footer)
        text = footer.get("text") or ""
        if text:
            label("chrome_footer_text", "Fußleiste", gx + st.px(16), gy,
                  gw - st.px(32), gh, text, size=st.sz(9), color=st.muted)

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

    def todo(v, code, text):
        todos.append({"code": code, "page": page["name"], "visual": v["id"],
                      "title": v.get("title") or v["id"], "text": text})

    for v in page["visuals"]:
        a = v.get("analysis") or {}
        native = v.get("native") or {}
        vtype = native.get("type") or ""
        in_report = v["id"] in built_names
        path = "{page}/%s.Visual" % v["id"]

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
            todo(v, "SORT_NOT_NATIVE",
                 "Sortierung %s %s: Kachel ist kein natives Visual im Bericht "
                 "(ChartKitchen/Deneb regeln das selbst)."
                 % (sort.get("by"), sort.get("dir")))

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
            todo(v, "DISPLAY_UNITS_SLOT",
                 "Anzeigeeinheit %s / %s Dezimalstellen im ChartKitchen- bzw. "
                 "Deneb-Slot setzen." % (du or "auto", dec if dec is not None else "auto"))

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


def build_slots(page: dict):
    ck, deneb, warn = [], [], []
    for v in page["visuals"]:
        base = {"id": v["id"], "stableId": v.get("stableId"), "page": page["name"],
                "title": v.get("title", ""), "subtitle": v.get("subtitle", ""),
                "kind": v.get("kind"), "label": v.get("label"), "rect": v.get("rect"),
                "scenario": v.get("scenario"), "notes": v.get("notes", ""),
                "analysis": v.get("analysis"), "workshop": v.get("workshop"),
                "mockupRoles": {k: [f["ref"] for f in fl]
                                for k, fl in (v.get("roles") or {}).items()}}
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
    names = ["chrome_filter_bg", "chrome_filter_title", "chrome_filter_close"]
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
    nav_entries = [str(n) for n in ((nav_zone or {}).get("pages")
                                    or header.get("nav") or []) if str(n).strip()]

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
    if not nav_entries:
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


def build_model_todos(nspec: dict, model_name: str) -> str:
    new = nspec["newFields"]
    meta = nspec["meta"]
    L = ["# Modell-To-dos", "",
         "Quelle: `%s` · Modell: `%s`"
         % (meta.get("name", "Mockup"), model_name or "<Name>.SemanticModel"), ""]
    renames = [f for f in nspec["fields"] if f.get("renameInModel") and f.get("alias")]
    if not new and not renames:
        L += ["Keine neuen Felder und keine Umbenennungswünsche im Mockup. Trotzdem vor "
              "dem Bauen prüfen, dass jede `ref` aus der Spec im Modell existiert "
              "(`te list`), sonst bricht `pbir add visual --from-json` die **ganze** "
              "Datei ab.", ""]
        return "\n".join(L)
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


def build_checklist(nspec: dict, per_page, chrome_notes, slot_warn, todos) -> str:
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
         "- Kopfband-Stil `%s` · Schriftfaktor ×%s (Visual-Titel ≈ %d pt)"
         % (d["headerStyle"], d["fontScale"], int(round(12 * d["fontScale"]))), ""]

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
             filt.get("mode") or filt.get("side") or "–"),
          "- Verknüpfungen: %d (%d Drill-through, %d Seitenwechsel)"
          % (len(nspec["links"]),
             sum(1 for l in nspec["links"] if l.get("kind") == "drillthrough"),
             sum(1 for l in nspec["links"] if l.get("kind") == "navigation")),
          "", "| Seite | Ordner | Fragestellung | native Visuals + Slicer | Text/Button "
          "| Chrome | CK | Deneb |", "|---|---|---|---|---|---|---|---|"]
    for e in per_page:
        L.append("| %s | `%s/` | %s | %d | %d | %d | %d | %d |"
                 % (e["name"], e["dir"], e["question"] or "–", len(e["pbir"]),
                    len(e["text"]), len(e["chrome"]), len(e["ck"]), len(e["deneb"])))
    L.append("")

    # ---- Issues aus der Spec --------------------------------------------- #
    levels = {"error": [], "warn": [], "info": []}
    for i in nspec["issues"]:
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

    L += ["## Hinweise aus dem Chrome-Aufbau", ""]
    L += ["- [ ] %s" % n for n in dict.fromkeys(chrome_notes)] or ["- keine"]
    L.append("")
    L += ["## ChartKitchen-Rollen-Mapping", ""]
    L += ["- [ ] %s" % w for w in slot_warn] or ["- keine Auffälligkeiten"]
    L.append("")
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
              'bash "%s/%s/analysis-commands.sh"' % (o, e["dir"]),
              "```", ""]
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
    return {
        "name": "%s · Mockup-Fragment" % (nspec["meta"].get("name") or "Mockup"),
        "$comment": ("Kachel-Optik aus `design` als Theme-Fragment. In ein bestehendes "
                     "Theme mergen (Skill reports:modifying-theme-json bzw. "
                     "powerbi-design-framework), danach die background/border/"
                     "dropShadow-Schritte aus chrome-batch.json weglassen. "
                     "Seitenhintergrund %s setzt `pbir pages background`, "
                     "Akzentfarbe %s steckt in Nav-Buttons und Burger."
                     % (st.page_bg, st.accent)),
        "visualStyles": {"*": {"*": star}},
    }


# --------------------------------------------------------------------------- #
# Plan und Abnahme
# --------------------------------------------------------------------------- #
def build_plan(nspec: dict, report: str, out_dir: Path, per_page, model_name: str,
               todos) -> dict:
    o = out_dir.as_posix()
    canvas = nspec["canvas"]
    w, h = canvas.get("width", 1280), canvas.get("height", 720)
    steps = []

    def step(sid, op, commands, *, page=None, idempotent="", delta="", batch=None):
        steps.append({"id": sid, "op": op, "page": page,
                      "idempotent": idempotent, "delta": delta,
                      "commands": commands, "batch": batch})

    step("backup", "backup", ['pbir backup "%s"' % report],
         idempotent="Legt eine weitere Sicherung an; mehrfach ausführen schadet nicht.",
         delta="immer vor dem ersten schreibenden Schritt")
    if nspec["newFields"]:
        step("model", "model", ["# siehe model-todos.md — DAX bestätigen lassen",
                                'te validate -m "%s" --errors-only'
                                % (model_name or "<Name>.SemanticModel")],
             idempotent="`te add --if-not-exists` legt nichts doppelt an.",
             delta="neue Kennzahlen zuerst, sonst lehnt --from-json die ganze Datei ab")

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

    return {
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
    }


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
    p.add_argument("--ink", default="#0F1E2E", help="Farbe für Nav-Leiste/dunkles Kopfband")
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
        ck_slots, deneb_slots, slot_warn = build_slots(page)

        slicers = slicer_names(nspec, page)
        content_names = ([i["name"] for i in pbir_visuals if i["name"] not in slicers]
                         + [i["name"] for i in text_visuals])
        add_tile_formatting(cmds, st, content_names, batch_props)
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

        files = [
            ("pbir-visuals.json", json.dumps(pbir_visuals, ensure_ascii=False, indent=2) + "\n"),
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
        for name, text in files:
            (pout / name).write_text(text, encoding="utf-8")
            written.append("%s/%s" % (pdir, name))

        all_chrome_notes += notes
        all_slot_warn += slot_warn
        per_page.append({"name": page["name"], "dir": pdir, "question": page.get("question"),
                         "page_bg": st.page_bg,
                         "pbir": pbir_visuals, "text": text_visuals,
                         "chrome": chrome_visuals, "ck": ck_slots, "deneb": deneb_slots,
                         "slicers": slicers, "skipped": skipped, "notes_block": notes})

    root_files = [
        ("model-todos.md", build_model_todos(nspec, model_name)),
        ("checklist.md", build_checklist(nspec, per_page, all_chrome_notes,
                                         all_slot_warn, all_todos)),
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
                                                 model_name, all_todos),
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
              "ChartKitchen %d · Deneb %d%s"
              % (e["name"], len(e["pbir"]), len(e["text"]), len(e["chrome"]),
                 len(e["ck"]), len(e["deneb"]),
                 " · %d wegen leerer Pflichtrolle ausgelassen" % len(e["skipped"])
                 if e["skipped"] else ""))
    print("\nVerknüpfungen: %d · neue Felder: %d · Analyse-To-dos: %d"
          % (len(nspec["links"]), len(nspec["newFields"]), len(all_todos)))
    open_points = (sum(len(v.get("warnings") or [])
                       for p in nspec["pages"] for v in p["visuals"])
                   + len([i for i in nspec["issues"] if i.get("level") != "info"])
                   + len(set(all_chrome_notes)) + len(all_slot_warn))
    if open_points:
        print("%d offene(r) Punkt(e) — siehe checklist.md" % open_points)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
