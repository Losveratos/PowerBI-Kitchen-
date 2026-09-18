#!/usr/bin/env python3
"""mockup_to_pbir.py — MockupKitchen-Spec in pbir-taugliche Bausteine zerlegen.

Liest `mockup-spec.json` (Export aus MockupKitchen byDatenWG, specVersion 1 oder
2) und schreibt einen Ausgabeordner, aus dem der Skill `mockup-to-powerbi` die
Seiten mit der pbir-CLI bauen kann. Reine Standardbibliothek, strikt lesend bis
auf --out.

    python mockup_to_pbir.py mockup-spec.json [--out mockup-out]
                             [--report "Meine.Report"]
                             [--page-name "Übersicht"]   (nur specVersion 1)
                             [--ink '#0F1E2E'] [--on-ink '#FFFFFF']
                             [--panel '#F1F3F5'] [--muted '#6B7280']
                             [--tile-border '#E5E7EB']
                             [--ck-fallback]

Erzeugt im Ausgabeordner:

  <Seitenslug>/pbir-visuals.json       native Visuals + Slicer dieser Seite
                                       (inhaltsgleich zur Tool-Ausgabe
                                       `pbir-visuals.<Seitenslug>.json`)
  <Seitenslug>/chrome-visuals.json     Kopfband/Nav/Filter/Fußleiste als Geometrie
  <Seitenslug>/chrome-commands.sh      pbir-Befehle: Seitenhintergrund, Text,
  <Seitenslug>/chrome-commands.ps1     Farbe, Kachel-Container, Aktion, z-Order
  <Seitenslug>/zones.json              Content-Zone für Linter und Wireframe
  <Seitenslug>/chartkitchen-slots.json ChartKitchen-Slots inkl. Rollen-Vorschlag
  <Seitenslug>/deneb-slots.json        Deneb-Slots
  model-todos.md                       neue Felder mit DAX-Vorschlag und te-Befehl
  checklist.md                         Warnungen, leere Pflichtrollen, Feldliste
  navigation.md                        Seiten, Nav-Buttons, Drill-through, Bookmarks
  commands.md                          (nur mit --report) Befehlsfolge über alle Seiten

Verifizierte CLI-Fakten, auf denen die Ausgabe beruht (pbir 0.9.32):
  * `pbir add visual --from-json` akzeptiert NUR die Schlüssel
    visual_type, name, title, x, y, width, height, fields.
    Ein unbekannter Schlüssel (z. B. "text") bricht die GANZE Datei ab.
  * `title` landet im Container-Titel (visualContainerObjects.title.text),
    nicht im Textinhalt einer Textbox.
  * Textinhalt geht über `pbir set "<Visual>.text.text"` — das funktioniert bei
    shape und actionButton. Bei textbox NICHT: dort müsste
    `general.paragraphs` ein Array sein; `pbir set` schreibt stattdessen ein
    Literal und die Textbox bleibt leer. Deshalb baut dieses Skript Textzeilen
    als `shape` mit ausgeschalteter Füllung.
  * Kachel-Container: `background.show/color`, `border.show/color/radius/width`,
    `dropShadow.show/preset/color/transparency` (alles Container-Objekte, gelten
    für jeden Visual-Typ — `pbir schema describe <typ> border`).
  * Ein fehlendes Feld lässt `--from-json` komplett scheitern ("no visuals were
    created") — neue Kennzahlen also zuerst mit `te add` anlegen.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

# --------------------------------------------------------------------------- #
# Rollen-Mapping Mockup → ChartKitchen (Feld-Vertrag des Skills
# chartkitchen-report, references/field-contract.md). Vorschlag, kein Gesetz:
# die Referenz-Instanz im Report bleibt die verbindliche Vorlage.
# --------------------------------------------------------------------------- #
CK_ROLE = {
    "category": "category",
    "subcategory": "colgroup",
    "series": "series",
    "ac": "actual",
    "indicator": "actual",
    "goal": "plan",
    "fc": "fcFlag",
    "rows": "category",
    "columns": "colgroup",
    "values": "actual",
}
# Rollen ohne Entsprechung im ChartKitchen-Feld-Vertrag
CK_ROLE_UNSUPPORTED = {"x", "y", "size", "start", "end", "field", "text"}

# Kachel-Typ → chart.orientation (Werte aus dem Feld-Vertrag)
CK_ORIENTATION = {
    "columns": "columns", "kombi": "columns", "colline": "columns",
    "absvar": "columns", "relvar": "columns", "stackcol": "columns",
    "multiples": "columns",
    "bars": "bars", "barskombi": "bars", "bullet": "bars", "tornado": "bars",
    "stackbar": "bars",
    "dotplot": "dumbbell", "pareto": "pareto",
    "line": "line", "fan": "line", "zchart": "line",
    "slope": "slope",
    "varint": "intwaterfall", "wfint": "intwaterfall",
    "waterfall": "waterfall", "wfkombi": "waterfall",
    "bridge": "catbridge",
    "kpi": "cards",
    "table": "table", "sparktable": "table", "heatmap": "table",
}

# Ebenen. --from-json vergibt immer z = 0, deshalb wird alles explizit gesetzt.
Z = {"bg": 0, "text": 4, "button": 5, "content": 10,
     "overlay": 20, "overlayText": 22, "overlayButton": 24}

# Rollen, aus denen sich das Drill-through-Feld einer Quellkachel ergibt
DRILL_ROLE_ORDER = ("category", "rows", "subcategory", "series")


# --------------------------------------------------------------------------- #
# Helfer
# --------------------------------------------------------------------------- #
def slug(text: str, limit: int = 40) -> str:
    """Identisch zur slug()-Funktion in assets/mockup/export.js."""
    s = unicodedata.normalize("NFD", str(text or "seite"))
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"[^A-Za-z0-9]+", "_", s).strip("_")[:limit]
    return s or "Seite"


def q_sh(value) -> str:
    return '"' + str(value).replace("\\", "\\\\").replace('"', '\\"') + '"'


def q_ps(value) -> str:
    return '"' + str(value).replace('"', '""') + '"'


def rect(node: dict) -> tuple[int, int, int, int]:
    return int(node["x"]), int(node["y"]), int(node["w"]), int(node["h"])


def vis(visual_type: str, name: str, title: str, x, y, w, h, fields=None) -> dict:
    """Ein Eintrag im --from-json-Format. Nur erlaubte Schlüssel."""
    item = {"visual_type": visual_type, "name": name, "title": title,
            "x": int(x), "y": int(y), "width": int(w), "height": int(h)}
    if fields:
        item["fields"] = fields
    return item


def split_ref(ref: str) -> tuple[str, str]:
    """`Tabelle.Feld` → (Tabelle, Feld). Punkte im Feldnamen bleiben beim Feld."""
    table, _, field = str(ref).partition(".")
    return table, field


class Commands:
    """Sammelt pbir-Befehle als Argumentlisten mit {page}-Platzhalter."""

    def __init__(self) -> None:
        self.items: list[tuple[str, list[str] | None]] = []

    def note(self, text: str) -> None:
        self.items.append((text, None))

    def add(self, *argv: str) -> None:
        self.items.append(("", list(argv)))

    def set_prop(self, visual: str, prop: str, value) -> None:
        self.add("pbir", "set", "{page}/%s.Visual.%s" % (visual, prop),
                 "--value", str(value))

    def position(self, visual: str, *args: str) -> None:
        self.add("pbir", "visuals", "position", "{page}/%s.Visual" % visual, *args)

    BARE = re.compile(r"^[A-Za-z0-9_.-]+$")

    def render(self, flavour: str, page_expr: str) -> str:
        quote = q_sh if flavour == "sh" else q_ps
        lines: list[str] = []
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
# Spec normalisieren: v1 und v2 auf dieselbe innere Form bringen
# --------------------------------------------------------------------------- #
DEFAULT_DESIGN = {
    "cornerRadius": 0,
    "tileStyle": "border",
    "pageBackground": "#F4F4F1",
    "tileBackground": "#FFFFFF",
    "headerStyle": "dark",     # v1 kannte keinen Stil; das Kopfband war Ink
    "accent": "#C25A2D",
    "fontScale": 1.0,
}


def spec_version(spec: dict) -> int:
    meta = spec.get("meta") or {}
    if meta.get("specVersion"):
        return int(meta["specVersion"])
    return 2 if isinstance(spec.get("pages"), list) else 1


def normalize(spec: dict, page_name_override: str | None = None) -> dict:
    """Liefert {version, canvas, uiScale, design, zones, pages, links}."""
    version = spec_version(spec)
    canvas = spec.get("canvas") or {}
    ui_scale = float(canvas.get("uiScale") or 1) or 1.0
    zones = spec.get("zones") or {}

    design = dict(DEFAULT_DESIGN)
    design.update({k: v for k, v in (spec.get("design") or {}).items() if v is not None})
    if not (spec.get("design") or {}).get("fontScale"):
        design["fontScale"] = ui_scale
    design["fontScale"] = float(design["fontScale"] or 1) or 1.0

    if version >= 2:
        pages = []
        for i, p in enumerate(spec.get("pages") or []):
            pages.append({
                "id": p.get("id") or f"p{i + 1}",
                "index": int(p.get("index") or i + 1),
                "name": p.get("name") or f"Seite {i + 1}",
                "notes": p.get("notes") or "",
                "contentRect": p.get("contentRect") or zones.get("content") or {},
                "visuals": p.get("visuals") or [],
                "layoutTree": p.get("layoutTree"),
            })
        links = spec.get("links") or []
    else:
        name = page_name_override or (spec.get("page") or {}).get("name") or "Seite"
        pages = [{
            "id": "p1", "index": 1, "name": name,
            "notes": (spec.get("page") or {}).get("notes") or "",
            "contentRect": zones.get("content") or {},
            "visuals": spec.get("visuals") or [],
            "layoutTree": spec.get("layoutTree"),
        }]
        for v in pages[0]["visuals"]:
            v.setdefault("page", name)
            v.setdefault("link", None)
        links = []
        # v1 kannte kein `mode`; `side` war right/left
        filt = zones.get("filter")
        if filt and not filt.get("mode"):
            filt["mode"] = filt.get("side") or "right"

    if not pages:
        pages = [{"id": "p1", "index": 1, "name": page_name_override or "Seite",
                  "notes": "", "contentRect": zones.get("content") or {},
                  "visuals": [], "layoutTree": None}]

    return {"version": version, "canvas": canvas, "uiScale": ui_scale,
            "design": design, "zones": zones, "pages": pages, "links": links}


# --------------------------------------------------------------------------- #
# Native Visuals + Slicer  (1:1 wie export.js → buildPbir, aber je Seite)
# --------------------------------------------------------------------------- #
def build_pbir_visuals(nspec: dict, page: dict, ck_fallback: bool = False) -> list[dict]:
    out: list[dict] = []
    for v in page["visuals"]:
        native = v.get("native")
        if not native:
            continue
        if v.get("engine") != "native" and not (ck_fallback and v.get("engine") == "ck"):
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
        for i, s in enumerate(filt.get("slicers") or []):
            if nspec["version"] >= 2:
                name = "p%d_slicer%d_%s" % (page["index"], i + 1, slug(s["name"]))
            else:
                name = "slicer%d_%s" % (i + 1, slug(s["name"]))
            if filt.get("mode") == "top":
                x, y = fx + pad + i * round(168 * k), fy + pad
                w, h = round(160 * k), fh - 2 * pad
            else:
                x, y = fx + pad, fy + round(40 * k) + i * round(64 * k)
                w, h = fw - 2 * pad, round(56 * k)
            out.append(vis("slicer", name, s["name"], x, y, w, h,
                           fields={"Values": s["ref"]}))
    return out


def slicer_names(nspec: dict, page: dict) -> list[str]:
    filt = (nspec["zones"] or {}).get("filter") or {}
    names = []
    for i, s in enumerate(filt.get("slicers") or []):
        if nspec["version"] >= 2:
            names.append("p%d_slicer%d_%s" % (page["index"], i + 1, slug(s["name"])))
        else:
            names.append("slicer%d_%s" % (i + 1, slug(s["name"])))
    return names


# --------------------------------------------------------------------------- #
# Farben und Schriftgrößen aus `design`
# --------------------------------------------------------------------------- #
class Style:
    """Leitet aus design + CLI-Optionen die konkreten Werte für das Chrome ab."""

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
        """Schriftgröße skaliert, auf den pbir-Bereich 6–45 begrenzt."""
        return max(6, min(45, int(round(base * self.scale))))

    def px(self, base: float) -> int:
        return int(round(base * self.scale))


# --------------------------------------------------------------------------- #
# Chrome je Seite
# --------------------------------------------------------------------------- #
def build_chrome(nspec: dict, page: dict, st: Style, opt) -> tuple[list[dict], Commands, list[str]]:
    zones = nspec["zones"] or {}
    visuals: list[dict] = []
    cmds = Commands()
    notes: list[str] = []
    page_names = [p["name"] for p in nspec["pages"]]

    cmds.note("Seitenhintergrund aus design.pageBackground")
    cmds.add("pbir", "pages", "background", "{page}", "--color", st.page_bg,
             "--transparency", "0")
    cmds.note("")

    def band(name: str, title: str, x, y, w, h, color: str, z: int = Z["bg"],
             rounded: bool = False) -> None:
        visuals.append(vis("shape", name, title, x, y, w, h))
        cmds.note(f"{title} — Fläche")
        # Achtung: der Enum-Wert heisst `rectangleRounded`, nicht
        # `roundedRectangle` — pbir lehnt Letzteres ab.
        cmds.set_prop(name, "shape.tileShape",
                      "rectangleRounded" if rounded and st.radius else "rectangle")
        if rounded and st.radius:
            cmds.set_prop(name, "shape.rectangleRoundedCurve", str(st.radius))
        cmds.set_prop(name, "fill.show", "true")
        cmds.set_prop(name, "fill.fillColor", color)
        cmds.set_prop(name, "outline.show", "false")
        cmds.position(name, "--z", str(z))
        cmds.note("")

    def label(name: str, title: str, x, y, w, h, text: str, *,
              size: int, color: str, bold: bool = False, align: str = "left",
              z: int = Z["text"]) -> None:
        visuals.append(vis("shape", name, title, x, y, w, h))
        cmds.note(f"{title} — Text (Shape ohne Füllung; Textboxen können per CLI keinen Text bekommen)")
        cmds.set_prop(name, "fill.show", "false")
        cmds.set_prop(name, "outline.show", "false")
        cmds.set_prop(name, "text.text", text)
        cmds.set_prop(name, "text.fontSize", str(size))
        cmds.set_prop(name, "text.fontColor", color)
        cmds.set_prop(name, "text.horizontalAlignment", align)
        cmds.set_prop(name, "text.verticalAlignment", "middle")
        if bold:
            cmds.set_prop(name, "text.bold", "true")
        cmds.position(name, "--z", str(z))
        cmds.note("")

    hinted: list[str] = []

    def nav_button(name: str, text: str, x, y, w, h, target: str, *,
                   active: bool, fg: str) -> None:
        visuals.append(vis("actionButton", name, text, x, y, w, h))
        if not hinted:
            hinted.append("x")
            cmds.note("Achtung: pbir schreibt --target 1:1 in navigationSection.")
            cmds.note("Springt der Button in Desktop nicht, den INTERNEN Seitennamen")
            cmds.note("(page.json -> name, z. B. c98a70696fe77757) als --target setzen.")
            cmds.note("")
        cmds.note(f"Nav-Button '{text}'" + (" — aktive Seite, ohne Aktion"
                                            if active else f" → Seite '{target}'"))
        if active:
            cmds.set_prop(name, "fill.show", "true")
            cmds.set_prop(name, "fill.fillColor", st.accent)
            cmds.set_prop(name, "text.fontColor", st.on_ink)
        else:
            cmds.set_prop(name, "fill.show", "false")
            cmds.set_prop(name, "text.fontColor", fg)
        cmds.set_prop(name, "outline.show", "false")
        cmds.set_prop(name, "text.text", text)
        cmds.set_prop(name, "text.fontSize", str(st.sz(10)))
        cmds.set_prop(name, "text.horizontalAlignment", "center")
        cmds.set_prop(name, "text.verticalAlignment", "middle")
        if not active:
            cmds.add("pbir", "visuals", "action", "{page}/%s.Visual" % name,
                     "--type", "PageNavigation", "--target", target)
        cmds.position(name, "--z", str(Z["button"]))
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
                      f'-x {nx + st.px(12)} -y {ny + st.px(12)} -w {size} -h {size} '
                      '--image "<Pfad zum Logo>"')
            cmds.set_prop("chrome_logo", "fill.show", "false")
            cmds.set_prop("chrome_logo", "outline.show", "true")
            cmds.set_prop("chrome_logo", "outline.lineColor", st.on_ink)
            cmds.set_prop("chrome_logo", "text.text", "LOGO")
            cmds.set_prop("chrome_logo", "text.fontSize", str(st.sz(8)))
            cmds.set_prop("chrome_logo", "text.fontColor", st.on_ink)
            cmds.set_prop("chrome_logo", "text.horizontalAlignment", "center")
            cmds.position("chrome_logo", "--z", str(Z["text"]))
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
            cmds.set_prop("chrome_header_rule", "fill.show", "true")
            cmds.set_prop("chrome_header_rule", "fill.fillColor", st.header_rule)
            cmds.set_prop("chrome_header_rule", "outline.show", "false")
            cmds.position("chrome_header_rule", "--z", str(Z["bg"] + 1))
            cmds.note("")

        text_left = hx + st.px(16)

        # Burger-Button für das Overlay-Filterpanel
        filt = zones.get("filter") or {}
        burger = bool(header.get("burger")) or filt.get("mode") == "burger"
        if burger:
            bw, bh = st.px(84), st.px(28)
            by = hy + (hh - bh) // 2
            visuals.append(vis("actionButton", "chrome_burger", "Filter-Menü",
                               text_left, by, bw, bh))
            cmds.note("Burger-Button — öffnet das Filter-Overlay über ein Lesezeichen")
            cmds.set_prop("chrome_burger", "fill.show", "true")
            cmds.set_prop("chrome_burger", "fill.fillColor", st.accent)
            cmds.set_prop("chrome_burger", "outline.show", "false")
            cmds.set_prop("chrome_burger", "text.text", "☰ Filter")
            cmds.set_prop("chrome_burger", "text.fontSize", str(st.sz(10)))
            cmds.set_prop("chrome_burger", "text.fontColor", st.on_ink)
            cmds.set_prop("chrome_burger", "text.horizontalAlignment", "center")
            cmds.set_prop("chrome_burger", "text.verticalAlignment", "middle")
            cmds.position("chrome_burger", "--z", str(Z["button"]))
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
                      f'-x {logo_x} -y {logo_y} -w {logo_w} -h {logo_h} '
                      '--image "<Pfad zum Logo>"')
            cmds.set_prop("chrome_logo", "fill.show", "false")
            cmds.set_prop("chrome_logo", "outline.show", "true")
            cmds.set_prop("chrome_logo", "outline.lineColor", st.header_fg)
            cmds.set_prop("chrome_logo", "text.text", "LOGO")
            cmds.set_prop("chrome_logo", "text.fontSize", str(st.sz(8)))
            cmds.set_prop("chrome_logo", "text.fontColor", st.header_fg)
            cmds.set_prop("chrome_logo", "text.horizontalAlignment", "center")
            cmds.position("chrome_logo", "--z", str(Z["text"]))
            cmds.note("")
            if logo_pos == "left":
                text_left = logo_x + logo_w + st.px(16)

        # Nav-Buttons rechtsbündig im Kopfband
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
                notes.append("Kopfband ist zu niedrig für einen Untertitel — "
                             f"'{subtitle}' nicht platziert.")

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
                         f"({st.px(160)} px breit, Abstand {st.px(8)} px).")
        else:
            label("chrome_filter_title", "Filter-Überschrift", fx + st.px(8),
                  fy + st.px(8), fw - st.px(16), st.px(24), "Filter",
                  size=st.sz(11), color=st.ink, bold=True, z=z_tx)

        if overlay or filt.get("collapsible"):
            cw = st.px(28)
            visuals.append(vis("actionButton", "chrome_filter_close",
                               "Filter schließen", fx + fw - cw - st.px(8),
                               fy + st.px(8), cw, st.px(24)))
            cmds.note("Schließen-Button des Panels — Ziel ist das Lesezeichen "
                      "'Filter schließen' (siehe navigation.md)")
            cmds.set_prop("chrome_filter_close", "fill.show", "false")
            cmds.set_prop("chrome_filter_close", "outline.show", "false")
            cmds.set_prop("chrome_filter_close", "text.text", "✕")
            cmds.set_prop("chrome_filter_close", "text.fontSize", str(st.sz(11)))
            cmds.set_prop("chrome_filter_close", "text.fontColor", st.ink)
            cmds.set_prop("chrome_filter_close", "text.horizontalAlignment", "center")
            cmds.set_prop("chrome_filter_close", "text.verticalAlignment", "middle")
            cmds.position("chrome_filter_close", "--z", str(z_bt))
            cmds.note("")

        if overlay:
            notes.append("Filter-Overlay: Panel, Überschrift, Schließen-Button und "
                         "Slicer liegen über dem Inhalt und sind im Grundzustand "
                         "ausgeblendet. Lesezeichen und Button-Aktionen stehen in "
                         "navigation.md.")
        elif filt.get("collapsible"):
            notes.append("Filter-Panel ist als ausklappbar markiert: zwei Lesezeichen "
                         "(Panel ein/aus) — Rezept in navigation.md.")

        n_slicers = len(filt.get("slicers") or [])
        if mode != "top" and n_slicers and st.px(40) + n_slicers * st.px(64) > fh:
            notes.append(f"{n_slicers} Slicer passen rechnerisch nicht in das "
                         f"{fh} px hohe Filter-Panel ({st.px(40)} + n·{st.px(64)} px).")
        if mode == "top" and n_slicers and st.px(8) + n_slicers * st.px(168) > fw:
            notes.append(f"{n_slicers} Slicer passen rechnerisch nicht in die "
                         f"{fw} px breite Filter-Leiste ({st.px(8)} + n·{st.px(168)} px).")

    # ---- Fußleiste ------------------------------------------------------- #
    footer = zones.get("footer")
    if footer:
        gx, gy, gw, gh = rect(footer)
        text = footer.get("text") or ""
        if text:
            label("chrome_footer_text", "Fußleiste", gx + st.px(16), gy,
                  gw - st.px(32), gh, text, size=st.sz(9), color=st.muted)

    return visuals, cmds, notes


def add_tile_formatting(cmds: Commands, st: Style, names: list[str]) -> None:
    """Kachel-Container gemäß design.tileStyle / cornerRadius."""
    if not names:
        return
    cmds.note("Kachel-Container aus design: tileStyle '%s', Ecken %d px, "
              "Hintergrund %s" % (st.tile_style, st.radius, st.tile_bg))
    for name in names:
        cmds.set_prop(name, "background.show", "true")
        cmds.set_prop(name, "background.color", st.tile_bg)
        cmds.set_prop(name, "background.transparency", "0")
        if st.tile_style == "shadow":
            cmds.set_prop(name, "border.show", "false")
            cmds.set_prop(name, "dropShadow.show", "true")
            cmds.set_prop(name, "dropShadow.preset", "BottomRight")
            cmds.set_prop(name, "dropShadow.color", st.ink)
            cmds.set_prop(name, "dropShadow.transparency", "85")
        elif st.tile_style == "flat":
            cmds.set_prop(name, "border.show", "false")
            cmds.set_prop(name, "dropShadow.show", "false")
        else:  # border
            cmds.set_prop(name, "border.show", "true")
            cmds.set_prop(name, "border.color", st.tile_border)
            cmds.set_prop(name, "border.width", "1")
            cmds.set_prop(name, "dropShadow.show", "false")
        if st.radius:
            cmds.set_prop(name, "border.radius", str(st.radius))
    cmds.note("")


# --------------------------------------------------------------------------- #
# Slots für ChartKitchen und Deneb
# --------------------------------------------------------------------------- #
def ck_roles_for(v: dict) -> tuple[dict, list[str]]:
    """Mockup-Rollen → ChartKitchen-Rollen. Gibt (Mapping, Warnungen) zurück."""
    warn: list[str] = []
    roles = v.get("roles") or {}
    scenario = v.get("scenario") or ""
    tokens = [t for t in re.split(r"[/,\s]+", scenario) if t in ("PY", "PL", "BU")]
    ref_targets = ["plan" if t in ("PL", "BU") else "previousYear" for t in tokens]
    for cand in ("plan", "previousYear"):
        if cand not in ref_targets:
            ref_targets.append(cand)

    out: dict[str, list[str]] = {}
    for key, fields in roles.items():
        refs = [f["ref"] for f in fields]
        if key == "ref":
            for i, r in enumerate(refs):
                target = ref_targets[i] if i < len(ref_targets) else "benchmark"
                out.setdefault(target, []).append(r)
            continue
        if key in CK_ROLE_UNSUPPORTED:
            warn.append(f"Rolle '{key}' ({', '.join(refs)}) hat keine ChartKitchen-"
                        f"Entsprechung — Typ `{v.get('kind')}` kann ChartKitchen nicht.")
            continue
        target = CK_ROLE.get(key)
        if not target:
            warn.append(f"Rolle '{key}' ist im Mapping nicht hinterlegt — bitte prüfen.")
            continue
        if key == "series" and v.get("kind") == "multiples":
            target = "multiples"
        out.setdefault(target, []).extend(refs)

    for role, refs in out.items():
        if len(refs) > 1 and role != "colgroup":
            warn.append(f"ChartKitchen-Rolle '{role}' ist max. 1 Feld, hier {len(refs)}: "
                        f"{', '.join(refs)}.")
    return out, warn


def build_slots(page: dict) -> tuple[list[dict], list[dict], list[str]]:
    ck, deneb, warn = [], [], []
    for v in page["visuals"]:
        base = {"id": v["id"], "page": page["name"], "title": v.get("title", ""),
                "subtitle": v.get("subtitle", ""), "kind": v.get("kind"),
                "label": v.get("label"), "rect": v.get("rect"),
                "scenario": v.get("scenario"), "notes": v.get("notes", ""),
                "mockupRoles": {k: [f["ref"] for f in fl]
                                for k, fl in (v.get("roles") or {}).items()}}
        if v.get("engine") == "ck":
            roles, w = ck_roles_for(v)
            orientation = CK_ORIENTATION.get(v.get("kind"))
            if not orientation:
                w.append(f"Kein ChartKitchen-Modus (chart.orientation) für Typ "
                         f"`{v.get('kind')}` — Deneb oder natives Visual wählen.")
            slot = dict(base)
            slot.update({"chartKitchenType": v.get("chartKitchenType"),
                         "orientation": orientation,
                         "chartKitchenRoles": roles,
                         "nativeFallback": v.get("native"),
                         "warnings": w})
            ck.append(slot)
            warn.extend(f"[{page['name']} / {v['id']}] {m}" for m in w)
        elif v.get("engine") == "deneb":
            deneb.append(base)
    return ck, deneb, warn


# --------------------------------------------------------------------------- #
# Navigation, Drill-through, Lesezeichen
# --------------------------------------------------------------------------- #
def drill_field(visual: dict) -> dict | None:
    roles = visual.get("roles") or {}
    for key in DRILL_ROLE_ORDER:
        if roles.get(key):
            return roles[key][0]
    return None


def bookmark_names(nspec: dict, page: dict) -> tuple[str, str] | None:
    filt = (nspec["zones"] or {}).get("filter") or {}
    marks = filt.get("bookmarks")
    if not marks and not (filt.get("collapsible") or filt.get("mode") == "burger"):
        return None
    names = [m.get("name") for m in (marks or [])] or ["Filter öffnen", "Filter schließen"]
    if len(names) < 2:
        names = [names[0], "Filter schließen"]
    if len(nspec["pages"]) > 1:
        return f"{names[0]} · {page['name']}", f"{names[1]} · {page['name']}"
    return names[0], names[1]


def panel_visual_names(nspec: dict, page: dict) -> list[str]:
    filt = (nspec["zones"] or {}).get("filter") or {}
    if not filt:
        return []
    names = ["chrome_filter_bg", "chrome_filter_title", "chrome_filter_close"]
    return names + slicer_names(nspec, page)


def build_navigation_md(nspec: dict, report: str, out_dir: Path) -> str:
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
         "## Seiten", "", "| # | Seite | Ordner-Seed | Visuals | Zweck |",
         "|---|---|---|---|---|"]
    for p in pages:
        L.append(f"| {p['index']} | {p['name']} | `{slug(p['name'])}.Page` | "
                 f"{len(p['visuals'])} | {p['notes'] or '–'} |")
    L.append("")

    # ---- Nav-Buttons ----------------------------------------------------- #
    L += ["## Nav-Buttons (auf jeder Seite)", ""]
    if not nav_entries:
        L += ["Keine Nav-Leiste im Mockup — Seitenwechsel läuft über die Registerkarten.", ""]
    else:
        unknown = [n for n in nav_entries if n not in by_name]
        L += [f"Ziel-Reihenfolge: {' · '.join(nav_entries)}. Die Buttons heißen auf "
              "jeder Seite `chrome_nav_1 … chrome_nav_n`; der Button der eigenen "
              "Seite bekommt Akzentfüllung und **keine** Aktion "
              "(das erledigt `chrome-commands.sh` bereits).", "",
              "| Seite | Button | Ziel | Aktion |", "|---|---|---|---|"]
        for p in pages:
            for i, entry in enumerate(nav_entries):
                if entry == p["name"]:
                    L.append(f"| {p['name']} | `chrome_nav_{i + 1}` | – | aktiv, "
                             "Akzentfüllung, keine Aktion |")
                else:
                    L.append(f"| {p['name']} | `chrome_nav_{i + 1}` | {entry} | "
                             f"`PageNavigation` |")
        L.append("")
        if unknown:
            L += ["> Achtung: " + ", ".join(f"„{u}\"" for u in unknown) +
                  " steht in der Nav-Liste, ist aber keine Seite im Mockup. "
                  "Entweder Seite anlegen oder den Eintrag streichen.", ""]
        L += ["> `pbir visuals action --target` schreibt den Text 1:1 in "
              "`navigationSection`. Springt ein Button in Desktop nicht, den internen "
              "Seitennamen aus `definition/pages/<ordner>/page.json` (`name`) als "
              "`--target` setzen:", "", "```bash",
              f'pbir cat "{rep}/{pages[0]["name"]}.Page" | head -5   # interner name',
              "```", ""]

    # ---- Drill-through --------------------------------------------------- #
    dt = [l for l in nspec["links"] if l.get("kind") == "drillthrough"]
    nav_links = [l for l in nspec["links"] if l.get("kind") == "navigation"]
    L += ["## Drill-through", ""]
    if not dt:
        L += ["Keine Drill-through-Verknüpfung im Mockup.", ""]
    else:
        L += ["Für jede Verknüpfung: **Zielseite** bekommt das Drill-through-Feld, "
              "die Quellkachel braucht nichts weiter (Power BI bietet den Drill im "
              "Kontextmenü an). Das Drill-Feld ist das Kategorie-Feld der "
              "Quellkachel.", "", "```bash"]
        for l in dt:
            src_page = by_name.get(l["fromPage"])
            src = None
            if src_page:
                src = next((v for v in src_page["visuals"]
                            if v["id"] == l["fromVisual"]), None)
            fld = drill_field(src) if src else None
            L.append(f'# {l["fromPage"]} / {l["fromVisual"]} → {l["toPage"]}')
            if fld:
                table, field = split_ref(fld["ref"])
                L.append(f'pbir pages drillthrough "{rep}/{l["toPage"]}.Page" '
                         f'--table "{table}" --field "{field}"')
            else:
                L.append(f'# ! Quellkachel hat kein Kategorie-/Zeilen-Feld — '
                         f'Drill-Feld beim Menschen erfragen, dann:')
                L.append(f'# pbir pages drillthrough "{rep}/{l["toPage"]}.Page" '
                         f'--table "<Tabelle>" --field "<Feld>"')
        L += ["```", "",
              "Zurück-Button auf jeder Drill-Zielseite (Power BI setzt ihn beim "
              "Drill automatisch aktiv):", "", "```bash"]
        for target in sorted({l["toPage"] for l in dt}):
            tp = by_name.get(target)
            cr = (tp or {}).get("contentRect") or {}
            bx = int(cr.get("x", 16)) + 8
            by = int(cr.get("y", 72)) + 8
            L.append(f'pbir add visual actionButton "{rep}/{target}.Page" '
                     f'-n chrome_back -x {bx} -y {by} -w 90 -h 28')
            L.append(f'pbir set "{rep}/{target}.Page/chrome_back.Visual.text.text" '
                     '--value "← Zurück"')
            L.append(f'pbir set "{rep}/{target}.Page/chrome_back.Visual.fill.fillColor" '
                     '--value "#FFFFFF"')
            L.append(f'pbir visuals action "{rep}/{target}.Page/chrome_back.Visual" '
                     '--type Back')
            L.append(f'pbir visuals position "{rep}/{target}.Page/chrome_back.Visual" '
                     f'--z {Z["overlayButton"]}')
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
              "Seitenverknüpfung:", "", "```bash"]
        for l in nav_links:
            L.append(f'pbir visuals action "{rep}/{l["fromPage"]}.Page/'
                     f'{l["fromVisual"]}.Visual" --type PageNavigation '
                     f'--target "{l["toPage"]}"')
        L += ["```", ""]

    # ---- Lesezeichen ----------------------------------------------------- #
    filt = zones.get("filter") or {}
    L += ["## Filter-Panel und Lesezeichen", ""]
    mode = filt.get("mode") or filt.get("side")
    if not filt:
        L += ["Kein Filter-Panel im Mockup.", ""]
    elif not (filt.get("collapsible") or mode == "burger"):
        L += [f"Filter-Modus `{mode}` — festes Panel, keine Lesezeichen nötig.", ""]
    else:
        kind = ("Overlay per Burger-Button" if mode == "burger"
                else "festes Panel, ein-/ausklappbar")
        L += [f"Filter-Modus `{mode}` ({kind}). Lesezeichen erfassen **nur die "
              "Sichtbarkeit**, nicht den Datenzustand — sonst friert das Lesezeichen "
              "die Slicer-Auswahl ein.", "", "```bash"]
        for p in pages:
            names = bookmark_names(nspec, p)
            if not names:
                continue
            open_bm, close_bm = names
            panel = panel_visual_names(nspec, p)
            L.append(f'# Seite {p["name"]}')
            for bm in (open_bm, close_bm):
                L.append(f'pbir add bookmark "{rep}" "{bm}" --no-data --no-current-page')
                L.append(f'pbir bookmarks visuals "{rep}" "{bm}" ' +
                         " ".join(f'"{n}"' for n in panel))
            if mode == "burger":
                L.append("#   Grundzustand: Panel ausgeblendet")
                for n in panel:
                    L.append(f'pbir visuals hide "{rep}/{p["name"]}.Page/{n}.Visual"')
            L.append(f'pbir visuals action "{rep}/{p["name"]}.Page/chrome_burger.Visual" '
                     f'--type Bookmark --target "{open_bm}"')
            L.append(f'pbir visuals action "{rep}/{p["name"]}.Page/'
                     f'chrome_filter_close.Visual" --type Bookmark --target "{close_bm}"')
            L.append("")
        L += ["```", "",
              "```bash", f'pbir bookmarks list "{rep}"', "```", "",
              "> `pbir add bookmark` legt das Lesezeichen an; den **Zustand** füllt "
              "Power BI erst, wenn das Lesezeichen in Desktop einmal aktualisiert "
              "wird (Ansicht → Lesezeichen → … → Aktualisieren). Also: Report in "
              "Desktop öffnen, Panel sichtbar schalten, „Filter öffnen\" "
              "aktualisieren; Panel ausblenden, „Filter schließen\" aktualisieren. "
              "Das ist der einzige Schritt dieses Skills, der Desktop braucht.", ""]
    return "\n".join(L)


# --------------------------------------------------------------------------- #
# Markdown-Ausgaben
# --------------------------------------------------------------------------- #
def dax_suggestion(field: dict) -> str:
    """Grober DAX-Vorschlag aus der Mockup-Beschreibung. Der Mensch bestätigt."""
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


def build_model_todos(spec: dict, model_name: str) -> str:
    new = spec.get("newFields") or []
    L = ["# Modell-To-dos", "",
         f"Quelle: `{spec.get('meta',{}).get('name','Mockup')}` · Modell: "
         f"`{model_name or '<Name>.SemanticModel'}`", ""]
    if not new:
        L += ["Keine neuen Felder im Mockup. Trotzdem vor dem Bauen prüfen, dass jede "
              "`ref` aus der Spec im Modell existiert (`te list`), sonst bricht "
              "`pbir add visual --from-json` die **ganze** Datei ab.", ""]
        return "\n".join(L)
    has_q = any(f.get("openQuestion") for f in new)
    header = ("| Feld | Art | Tabelle | Beschreibung aus dem Mockup | offene Frage "
              "| im Layout benutzt |") if has_q else (
        "| Feld | Art | Tabelle | Beschreibung aus dem Mockup | im Layout benutzt |")
    sep = "|---|---|---|---|---|---|" if has_q else "|---|---|---|---|---|"
    L += ["Diese Felder existieren im Modell noch nicht. **Zuerst anlegen**, DAX vom "
          "Menschen bestätigen lassen, dann `te validate --errors-only`, erst danach "
          "Visuals binden.", "", header, sep]
    for f in new:
        row = (f"| `{f['ref']}` | {'Measure' if f.get('kind') == 'measure' else 'Spalte'} "
               f"| {f['table']} | {f.get('description') or '–'} ")
        if has_q:
            row += f"| {f.get('openQuestion') or '–'} "
        row += f"| {'ja' if f.get('used') else 'nein'} |"
        L.append(row)
    L += ["", "## Vorschlag (DAX bestätigen lassen, nicht ungefragt anlegen)", "", "```bash"]
    for f in new:
        if f.get("kind") != "measure":
            L.append(f'# {f["ref"]} ist eine Spalte — gehört in die Quelle/Power Query, nicht in te add')
            continue
        L.append('te add "%s/%s" -m "%s" -t Measure \\' % (
            f["table"], f["name"], model_name or "<Name>.SemanticModel"))
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
                L.append(f"- [ ] `{f['ref']}`: {f['openQuestion']}")
        L.append("")
    return "\n".join(L)


def build_checklist(spec: dict, nspec: dict, per_page: list[dict],
                    chrome_notes: list[str], slot_warn: list[str]) -> str:
    canvas = nspec["canvas"]
    d = nspec["design"]
    L = ["# Checkliste vor dem Schreiben", "",
         f"Mockup: **{spec.get('meta',{}).get('name','?')}** · specVersion "
         f"{nspec['version']} · {len(nspec['pages'])} Seite(n) · Canvas "
         f"{canvas.get('width')}×{canvas.get('height')} (uiScale ×{nspec['uiScale']})", "",
         "## Gestaltung (aus `design`, geht in die Container-Formatierung)", "",
         f"- Kacheln: Stil `{d['tileStyle']}`, Ecken {d['cornerRadius']} px, "
         f"Hintergrund {d['tileBackground']}",
         f"- Seitenhintergrund {d['pageBackground']} · Akzent {d['accent']}",
         f"- Kopfband-Stil `{d['headerStyle']}` · Schriftfaktor ×{d['fontScale']} "
         f"(Visual-Titel ≈ {int(round(12 * d['fontScale']))} pt)", ""]

    counts: dict[str, int] = {}
    for p in nspec["pages"]:
        for v in p["visuals"]:
            counts[v.get("engine", "?")] = counts.get(v.get("engine", "?"), 0) + 1
    filt = (nspec["zones"] or {}).get("filter") or {}
    total = sum(len(p["visuals"]) for p in nspec["pages"])
    L += ["## Umfang", "",
          f"- Visuals gesamt: {total} (ChartKitchen {counts.get('ck',0)} · nativ "
          f"{counts.get('native',0)} · Deneb {counts.get('deneb',0)})",
          f"- Slicer je Seite: {len(filt.get('slicers') or [])} "
          f"(Filter-Modus `{filt.get('mode') or filt.get('side') or '–'}`)",
          f"- Verknüpfungen: {len(nspec['links'])} "
          f"({sum(1 for l in nspec['links'] if l.get('kind') == 'drillthrough')} Drill-through, "
          f"{sum(1 for l in nspec['links'] if l.get('kind') == 'navigation')} Seitenwechsel)",
          "", "| Seite | Ordner | native Visuals + Slicer | Chrome | CK | Deneb |",
          "|---|---|---|---|---|---|"]
    for e in per_page:
        L.append(f"| {e['name']} | `{e['dir']}/` | {len(e['pbir'])} | "
                 f"{len(e['chrome'])} | {len(e['ck'])} | {len(e['deneb'])} |")
    L.append("")

    L += ["## Offene Punkte aus der Spec", ""]
    any_req = False
    for p in nspec["pages"]:
        for v in p["visuals"]:
            for w in (v.get("warnings") or []):
                any_req = True
                L.append(f"- [ ] {p['name']} / `{v['id']}`: {w}")
    if not any_req:
        L.append("- keine")
    for w in spec.get("warnings") or []:
        L.append(f"- [ ] Layout: {w}")
    L.append("")

    L += ["## Hinweise aus dem Chrome-Aufbau", ""]
    L += [f"- [ ] {n}" for n in dict.fromkeys(chrome_notes)] or ["- keine"]
    L.append("")
    L += ["## ChartKitchen-Rollen-Mapping", ""]
    L += [f"- [ ] {w}" for w in slot_warn] or ["- keine Auffälligkeiten"]
    L.append("")

    refs, new_refs = {}, {f["ref"] for f in spec.get("newFields") or []}
    for f in (spec.get("model") or {}).get("usedFields") or []:
        refs[f["ref"]] = f.get("kind")
    L += ["## Felder gegen das Modell prüfen (`te list`, nicht per Regex)", "",
          "| Feld | Art | im Mockup als neu markiert |", "|---|---|---|"]
    for ref, kind in sorted(refs.items()):
        L.append(f"| `{ref}` | {kind} | {'ja' if ref in new_refs else 'nein'} |")
    L += ["", "> Ein einziges fehlendes Feld lässt `pbir add visual --from-json` die "
          "komplette Datei ablehnen ('no visuals were created'). Erst Modell, dann Report.", ""]
    return "\n".join(L)


def build_commands_md(spec: dict, nspec: dict, report: str, out_dir: Path,
                      per_page: list[dict], model_name: str) -> str:
    canvas = nspec["canvas"]
    o = out_dir.as_posix()
    w, h = canvas.get("width", 1280), canvas.get("height", 720)
    L = [f"# Befehlsfolge · {spec.get('meta',{}).get('name','Mockup')}", "",
         f"{len(nspec['pages'])} Seite(n), Canvas {w}×{h}. Reihenfolge einhalten. "
         "Vor dem ersten schreibenden Befehl: Power BI Desktop schließen, "
         "`pbir backup` oder Git-Commit.", "",
         "```bash",
         "# 0 · Ausgangslage sichern",
         f'pbir backup "{report}"',
         "",
         "# 1 · Modell zuerst (siehe model-todos.md), dann prüfen",
         f'te validate -m "{model_name or "<Name>.SemanticModel"}" --errors-only',
         "```", ""]

    for i, e in enumerate(per_page, start=1):
        page_path = f'{report}/{e["name"]}.Page'
        L += [f'## {i} · Seite „{e["name"]}"', "", "```bash",
              "# Seite anlegen (legt automatisch eine Textbox 'Title' an — entfernen)",
              f'pbir add page "{report}/{slug(e["name"])}.Page" -n "{e["name"]}" '
              f'-w {w} -h {h}',
              f'pbir rm "{page_path}/Title.Visual" -f',
              "#   Bestehende Seite stattdessen nur umskalieren:",
              f'# pbir pages resize "{page_path}" -w {w} -h {h}',
              "",
              "# Chrome-Geometrie (Flächen, Textrahmen, Buttons)",
              f'pbir add visual "{page_path}" --from-json "{o}/{e["dir"]}/chrome-visuals.json"',
              "",
              "# Native Visuals + Slicer",
              f'pbir add visual "{page_path}" --from-json "{o}/{e["dir"]}/pbir-visuals.json"',
              "",
              "# Seitenhintergrund, Texte, Farben, Kachel-Container, Aktionen, z-Order",
              f'bash "{o}/{e["dir"]}/chrome-commands.sh"   '
              f'# PowerShell: {o}/{e["dir"]}/chrome-commands.ps1',
              "```", ""]
        if e["notes_block"]:
            L += [f"> {n}" for n in e["notes_block"]] + [""]

    L += ["## Navigation, Drill-through, Lesezeichen", "",
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
            pp = f'{report}/{page_name}.Page'
            L.append(f'# {page_name} · {s["title"]} ({s["kind"]} → orientation '
                     f'{s.get("orientation") or "?"})')
            L.append(f'pbir add visual shape "{pp}" -n "{s["id"]}_slot" '
                     f'-x {r["x"]} -y {r["y"]} -w {r["w"]} -h {r["h"]} '
                     f'-t "ChartKitchen: {s["kind"]}"')
            L.append(f'pbir set "{pp}/{s["id"]}_slot.Visual.text.text" '
                     f'--value "ChartKitchen: {s["kind"]} · {s["title"]}"')
        L += ["```", ""]

    deneb_all = [(e["name"], s) for e in per_page for s in e["deneb"]]
    if deneb_all:
        L += ["## Deneb-Slots", "",
              "Über den Skill `deploy-to-powerbi` (Template aus dem Chart-Builder) "
              "bzw. `pbir visuals deneb`. Slots:", ""]
        for page_name, s in deneb_all:
            r = s["rect"]
            L.append(f"- {page_name} · `{s['id']}` — {s['title']} bei x={r['x']}, "
                     f"y={r['y']}, w={r['w']}, h={r['h']}")
        L.append("")

    first = per_page[0]["dir"] if per_page else ""
    pages_arg = " ".join(f'"{e["name"]}"' for e in per_page)
    L += ["## Verifizieren", "", "```bash",
          f'pbir validate "{report}" --fields',
          f'te validate -m "{model_name or "<Name>.SemanticModel"}" --errors-only',
          "",
          "export PYTHONIOENCODING=utf-8   # sonst brechen beide Skripte an Umlauten ab",
          f'python .claude/skills/powerbi-design-framework/scripts/bulk_restyle.py "{report}" \\',
          f'  --check --zones "{o}/{first}/zones.json" --grid 0 \\',
          f"  --skip-types shape,textbox,actionButton,image,slicer --pages {pages_arg}",
          f'python .claude/skills/powerbi-design-framework/scripts/render_wireframe.py "{report}" \\',
          f'  --zones "{o}/{first}/zones.json" --html',
          "```", "",
          "Alle Seiten teilen dieselbe Inhaltszone, deshalb reicht eine `zones.json`. "
          "`--grid 0` weil MockupKitchen-Splits selten auf dem 8-px-Raster landen; "
          "`--skip-types` weil Chrome-Elemente absichtlich außerhalb der Content-Zone "
          "liegen.", ""]
    return "\n".join(L)


# --------------------------------------------------------------------------- #
# main
# --------------------------------------------------------------------------- #
def main() -> int:
    p = argparse.ArgumentParser(
        description="MockupKitchen-Spec → pbir-Bausteine (specVersion 1 und 2)",
        formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("spec", help="Pfad zu mockup-spec.json")
    p.add_argument("--out", default="mockup-out", help="Ausgabeordner (Default: mockup-out)")
    p.add_argument("--page-name", help="Seitenname überschreiben (nur specVersion 1)")
    p.add_argument("--report", help='Report-Ordner, z. B. "Meine.Report" — erzeugt commands.md')
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
                        "Gegenstück kennt)")
    opt = p.parse_args()

    # Windows-Konsole ist oft cp1252 -- Umlaute im Report duerfen daran nicht
    # scheitern. Die geschriebenen Dateien sind immer UTF-8.
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

    spec_path = Path(opt.spec).expanduser()
    if not spec_path.is_file():
        print(f"Spec nicht gefunden: {spec_path}", file=sys.stderr)
        return 2
    try:
        spec = json.loads(spec_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"mockup-spec.json ist kein gültiges JSON: {e}", file=sys.stderr)
        return 2
    if "zones" not in spec or "canvas" not in spec:
        print("Das sieht nicht nach einer MockupKitchen-Spec aus "
              "(zones/canvas fehlen).", file=sys.stderr)
        return 2

    nspec = normalize(spec, opt.page_name)
    st = Style(nspec, opt)
    model_name = (spec.get("model") or {}).get("source") or ""
    out = Path(opt.out).expanduser()
    out.mkdir(parents=True, exist_ok=True)

    all_chrome_notes: list[str] = []
    all_slot_warn: list[str] = []
    per_page: list[dict] = []
    written: list[str] = []

    filt = (nspec["zones"] or {}).get("filter") or {}
    overlay_filter = bool(filt.get("overlay")) or filt.get("mode") == "burger"

    for page in nspec["pages"]:
        pdir = slug(page["name"])
        # Doppelte Seitenslugs auseinanderhalten
        if any(e["dir"] == pdir for e in per_page):
            pdir = f"{pdir}_{page['index']}"
        pout = out / pdir
        pout.mkdir(parents=True, exist_ok=True)

        pbir_visuals = build_pbir_visuals(nspec, page, ck_fallback=opt.ck_fallback)
        chrome_visuals, cmds, notes = build_chrome(nspec, page, st, opt)
        ck_slots, deneb_slots, slot_warn = build_slots(page)

        slicers = set(slicer_names(nspec, page))
        content_names = [i["name"] for i in pbir_visuals if i["name"] not in slicers]
        add_tile_formatting(cmds, st, content_names)
        if content_names:
            cmds.note("Inhalt ueber die Chrome-Flaechen legen "
                      "(--from-json vergibt immer z=0)")
            for name in content_names:
                cmds.position(name, "--z", str(Z["content"]))
            cmds.note("")
        if slicers:
            z_slicer = Z["overlayButton"] if overlay_filter else Z["content"]
            cmds.note("Slicer" + (" (Overlay-Panel)" if overlay_filter else ""))
            for name in slicer_names(nspec, page):
                cmds.position(name, "--z", str(z_slicer))
            cmds.note("")

        page_expr_sh = (f'{opt.report}/{page["name"]}.Page' if opt.report
                        else "$REPORT/$PAGE.Page")
        page_expr_ps = (f'{opt.report}/{page["name"]}.Page' if opt.report
                        else "$Report/$Page.Page")
        head = ("Seitenhintergrund, Chrome-Texte, -Farben, Kachel-Container, "
                "Aktionen und z-Order.\n"
                "# Zuletzt ausfuehren: erst chrome-visuals.json, dann "
                "pbir-visuals.json einspielen.\n")
        sh_head = ("#!/usr/bin/env bash\n# " + head + "set -euo pipefail\n"
                   + ("" if opt.report else
                      'REPORT="<Name>.Report"\nPAGE="%s"\n' % page["name"]) + "\n")
        ps_head = ("# " + head + "$ErrorActionPreference = 'Stop'\n"
                   + ("" if opt.report else
                      '$Report = "<Name>.Report"\n$Page = "%s"\n' % page["name"]) + "\n")

        cr = page["contentRect"] or {}
        zones_json = {"content": [cr.get("x", 0), cr.get("y", 0),
                                  cr.get("w", 0), cr.get("h", 0)],
                      "ignorePages": []}

        files = [
            ("pbir-visuals.json", json.dumps(pbir_visuals, ensure_ascii=False, indent=2) + "\n"),
            ("chrome-visuals.json", json.dumps(chrome_visuals, ensure_ascii=False, indent=2) + "\n"),
            ("chrome-commands.sh", sh_head + cmds.render("sh", page_expr_sh)),
            ("chrome-commands.ps1", ps_head + cmds.render("ps1", page_expr_ps)),
            ("zones.json", json.dumps(zones_json, ensure_ascii=False, indent=2) + "\n"),
            ("chartkitchen-slots.json", json.dumps(ck_slots, ensure_ascii=False, indent=2) + "\n"),
            ("deneb-slots.json", json.dumps(deneb_slots, ensure_ascii=False, indent=2) + "\n"),
        ]
        for name, text in files:
            (pout / name).write_text(text, encoding="utf-8")
            written.append(f"{pdir}/{name}")

        all_chrome_notes += notes
        all_slot_warn += slot_warn
        per_page.append({"name": page["name"], "dir": pdir, "pbir": pbir_visuals,
                         "chrome": chrome_visuals, "ck": ck_slots,
                         "deneb": deneb_slots, "notes_block": notes})

    root_files = [
        ("model-todos.md", build_model_todos(spec, model_name)),
        ("checklist.md", build_checklist(spec, nspec, per_page,
                                         all_chrome_notes, all_slot_warn)),
        ("navigation.md", build_navigation_md(nspec, opt.report or "", out)),
    ]
    if opt.report:
        root_files.append(("commands.md",
                           build_commands_md(spec, nspec, opt.report, out,
                                             per_page, model_name)))
    for name, text in root_files:
        (out / name).write_text(text, encoding="utf-8")
        written.append(name)

    canvas = nspec["canvas"]
    print(f"specVersion {nspec['version']} · {len(nspec['pages'])} Seite(n) · Canvas "
          f"{canvas.get('width')}×{canvas.get('height')} (uiScale ×{nspec['uiScale']}) "
          f"· Modell {model_name or '(nicht in der Spec)'}")
    print(f"-> {out}")
    for name in written:
        print(f"   {name}")
    for e in per_page:
        print(f"\nSeite '{e['name']}': native Visuals + Slicer {len(e['pbir'])} · "
              f"Chrome {len(e['chrome'])} · ChartKitchen {len(e['ck'])} · "
              f"Deneb {len(e['deneb'])}")
    print(f"\nVerknüpfungen: {len(nspec['links'])} · neue Felder: "
          f"{len(spec.get('newFields') or [])}")
    open_points = (sum(len(v.get("warnings") or [])
                       for p in nspec["pages"] for v in p["visuals"])
                   + len(spec.get("warnings") or [])
                   + len(set(all_chrome_notes)) + len(all_slot_warn))
    if open_points:
        print(f"{open_points} offene(r) Punkt(e) — siehe checklist.md")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
