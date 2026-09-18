#!/usr/bin/env python3
"""mockup_to_pbir.py — MockupKitchen-Spec in pbir-taugliche Bausteine zerlegen.

Liest `mockup-spec.json` (Export aus MockupKitchen byDatenWG) und schreibt einen
Ausgabeordner, aus dem der Skill `mockup-to-powerbi` die Seite mit der pbir-CLI
bauen kann. Reine Standardbibliothek, strikt lesend bis auf --out.

    python mockup_to_pbir.py mockup-spec.json [--out mockup-out]
                             [--page-name "Übersicht"]
                             [--report "Meine.Report"]
                             [--ink '#0F1E2E'] [--on-ink '#FFFFFF']
                             [--panel '#F1F3F5'] [--muted '#6B7280']
                             [--ck-fallback]

Erzeugt im Ausgabeordner:
  pbir-visuals.json      native Visuals + Slicer (identisch zur Tool-Ausgabe)
  chrome-visuals.json    Kopfband/Nav/Filter-Hintergrund/Fußleiste als Geometrie
  chrome-commands.sh     pbir-Befehle für Text, Farbe, Aktion, z-Order (bash)
  chrome-commands.ps1    dieselben Befehle für PowerShell
  zones.json             Content-Zone für Design-Linter und Wireframe-Renderer
  chartkitchen-slots.json  ChartKitchen-Slots inkl. Rollen-Vorschlag
  deneb-slots.json       Deneb-Slots
  model-todos.md         neue Felder mit DAX-Vorschlag und te-Befehl
  checklist.md           Warnungen, leere Pflichtrollen, Feldliste zum Abgleich
  commands.md            (nur mit --report) komplette Befehlsfolge in Reihenfolge

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

CHROME_Z = {"bg": 0, "text": 4, "button": 5}


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


class Commands:
    """Sammelt pbir-Befehle als Argumentlisten mit {page}-Platzhalter."""

    def __init__(self) -> None:
        self.items: list[tuple[str, list[str]] | tuple[str, None]] = []

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
# Native Visuals + Slicer  (1:1 wie export.js → buildPbir)
# --------------------------------------------------------------------------- #
def build_pbir_visuals(spec: dict, ck_fallback: bool = False) -> list[dict]:
    out: list[dict] = []
    for v in spec.get("visuals", []):
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
    filt = (spec.get("zones") or {}).get("filter")
    if filt:
        zx, zy, zw, _zh = rect(filt)
        for i, s in enumerate(filt.get("slicers") or []):
            out.append(vis("slicer", "slicer%d_%s" % (i + 1, slug(s["name"])),
                           s["name"], zx + 8, zy + 40 + i * 64, zw - 16, 56,
                           fields={"Values": s["ref"]}))
    return out


# --------------------------------------------------------------------------- #
# Chrome
# --------------------------------------------------------------------------- #
def build_chrome(spec: dict, opt) -> tuple[list[dict], Commands, list[str]]:
    zones = spec.get("zones") or {}
    visuals: list[dict] = []
    cmds = Commands()
    notes: list[str] = []

    def band(name: str, title: str, x, y, w, h, color: str) -> None:
        visuals.append(vis("shape", name, title, x, y, w, h))
        cmds.note(f"{title} — Fläche")
        cmds.set_prop(name, "shape.tileShape", "rectangle")
        cmds.set_prop(name, "fill.show", "true")
        cmds.set_prop(name, "fill.fillColor", color)
        cmds.set_prop(name, "outline.show", "false")
        cmds.position(name, "--z", str(CHROME_Z["bg"]))
        cmds.note("")

    def label(name: str, title: str, x, y, w, h, text: str, *,
              size: int, color: str, bold: bool = False, align: str = "left") -> None:
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
        cmds.position(name, "--z", str(CHROME_Z["text"]))
        cmds.note("")

    hinted: list[str] = []

    def button(name: str, text: str, x, y, w, h, target: str) -> None:
        visuals.append(vis("actionButton", name, text, x, y, w, h))
        if not hinted:
            hinted.append("x")
            cmds.note("Achtung: pbir schreibt --target 1:1 in navigationSection.")
            cmds.note("Springt der Button in Desktop nicht, den INTERNEN Seitennamen")
            cmds.note("(page.json -> name, z. B. c98a70696fe77757) als --target setzen.")
            cmds.note("")
        cmds.note(f"Nav-Button '{text}' → Seite '{target}'")
        cmds.set_prop(name, "fill.show", "true")
        cmds.set_prop(name, "fill.fillColor", opt.ink)
        cmds.set_prop(name, "text.text", text)
        cmds.set_prop(name, "text.fontSize", "10")
        cmds.set_prop(name, "text.fontColor", opt.on_ink)
        cmds.set_prop(name, "text.horizontalAlignment", "center")
        cmds.set_prop(name, "text.verticalAlignment", "middle")
        cmds.add("pbir", "visuals", "action", "{page}/%s.Visual" % name,
                 "--type", "PageNavigation", "--target", target)
        cmds.position(name, "--z", str(CHROME_Z["button"]))
        cmds.note("")

    header = zones.get("header") or {}
    nav_zone = zones.get("nav")
    nav_entries = [n for n in (header.get("nav") or []) if str(n).strip()]

    # ---- Nav-Leiste (links) --------------------------------------------- #
    if nav_zone:
        nx, ny, nw, nh = rect(nav_zone)
        band("chrome_nav_bg", "Nav-Leiste", nx, ny, nw, nh, opt.ink)
        top = ny + 16
        if header.get("logo"):
            visuals.append(vis("shape", "chrome_logo", "Logo", nx + 12, ny + 12, 40, 40))
            cmds.note("Logo-Platzhalter — durch ein Bild ersetzen:")
            cmds.note('  pbir rm "{page}/chrome_logo.Visual" -f')
            cmds.note('  pbir add visual image "{page}" -n chrome_logo '
                      f'-x {nx + 12} -y {ny + 12} -w 40 -h 40 --image "<Pfad zum Logo>"')
            cmds.set_prop("chrome_logo", "fill.show", "false")
            cmds.set_prop("chrome_logo", "outline.show", "true")
            cmds.set_prop("chrome_logo", "outline.lineColor", opt.on_ink)
            cmds.set_prop("chrome_logo", "text.text", "LOGO")
            cmds.set_prop("chrome_logo", "text.fontSize", "8")
            cmds.set_prop("chrome_logo", "text.fontColor", opt.on_ink)
            cmds.set_prop("chrome_logo", "text.horizontalAlignment", "center")
            cmds.position("chrome_logo", "--z", str(CHROME_Z["text"]))
            cmds.note("")
            top = ny + 72
        for i, entry in enumerate(nav_entries):
            button("chrome_nav_%d" % (i + 1), str(entry), nx + 8, top + i * 48,
                   max(32, nw - 16), 40, str(entry))
        nav_entries = []  # im Kopfband nicht noch einmal

    # ---- Kopfband -------------------------------------------------------- #
    if header:
        hx, hy, hw, hh = rect(header)
        band("chrome_header_bg", "Kopfband", hx, hy, hw, hh, opt.ink)

        text_left = hx + 16
        if header.get("logo") and not nav_zone:
            logo_h = min(32, max(16, hh - 24))
            logo_y = hy + (hh - logo_h) // 2
            visuals.append(vis("shape", "chrome_logo", "Logo", hx + 16, logo_y, 120, logo_h))
            cmds.note("Logo-Platzhalter — durch ein Bild ersetzen:")
            cmds.note('  pbir rm "{page}/chrome_logo.Visual" -f')
            cmds.note('  pbir add visual image "{page}" -n chrome_logo '
                      f'-x {hx + 16} -y {logo_y} -w 120 -h {logo_h} --image "<Pfad zum Logo>"')
            cmds.set_prop("chrome_logo", "fill.show", "false")
            cmds.set_prop("chrome_logo", "outline.show", "true")
            cmds.set_prop("chrome_logo", "outline.lineColor", opt.on_ink)
            cmds.set_prop("chrome_logo", "text.text", "LOGO")
            cmds.set_prop("chrome_logo", "text.fontSize", "8")
            cmds.set_prop("chrome_logo", "text.fontColor", opt.on_ink)
            cmds.set_prop("chrome_logo", "text.horizontalAlignment", "center")
            cmds.position("chrome_logo", "--z", str(CHROME_Z["text"]))
            cmds.note("")
            text_left = hx + 152  # 16 + 120 + 16, wie chrome-layouts.md

        # Nav-Buttons rechtsbündig im Kopfband
        right = hx + hw - 16
        if nav_entries:
            bw, gap, bh = 112, 8, min(32, max(24, hh - 16))
            by = hy + (hh - bh) // 2
            block = len(nav_entries) * bw + (len(nav_entries) - 1) * gap
            start = max(text_left + 160, right - block)
            for i, entry in enumerate(nav_entries):
                button("chrome_nav_%d" % (i + 1), str(entry),
                       start + i * (bw + gap), by, bw, bh, str(entry))
            right = start - 16

        title = header.get("title") or spec.get("page", {}).get("name") or ""
        subtitle = header.get("subtitle") or ""
        text_w = max(120, right - text_left)
        if title and subtitle and hh >= 48:
            label("chrome_header_title", "Kopfband-Titel", text_left, hy + 6,
                  text_w, 26, title, size=16, color=opt.on_ink, bold=True)
            label("chrome_header_subtitle", "Kopfband-Untertitel", text_left, hy + 32,
                  text_w, max(14, hh - 38), subtitle, size=10, color=opt.muted_on_ink)
        elif title:
            label("chrome_header_title", "Kopfband-Titel", text_left, hy + (hh - 28) // 2,
                  text_w, 28, title, size=16, color=opt.on_ink, bold=True)
            if subtitle:
                notes.append("Kopfband ist zu niedrig für einen Untertitel — "
                             f"'{subtitle}' nicht platziert.")

    # ---- Filter-Panel ---------------------------------------------------- #
    filt = zones.get("filter")
    if filt:
        fx, fy, fw, fh = rect(filt)
        band("chrome_filter_bg", "Filter-Panel", fx, fy, fw, fh, opt.panel)
        label("chrome_filter_title", "Filter-Überschrift", fx + 8, fy + 8, fw - 16, 24,
              "Filter", size=11, color=opt.ink, bold=True)
        if filt.get("collapsible"):
            notes.append("Filter-Panel ist als ausklappbar markiert: Bookmark-Technik "
                         "(Panel ein/aus) in Desktop ergänzen — pbir baut sie nicht.")
        n_slicers = len(filt.get("slicers") or [])
        if n_slicers and fy + 40 + n_slicers * 64 > fy + fh:
            notes.append(f"{n_slicers} Slicer passen rechnerisch nicht in das "
                         f"{fh} px hohe Filter-Panel (40 + n·64 px).")

    # ---- Fußleiste ------------------------------------------------------- #
    footer = zones.get("footer")
    if footer:
        gx, gy, gw, gh = rect(footer)
        text = footer.get("text") or ""
        if text:
            label("chrome_footer_text", "Fußleiste", gx + 16, gy, gw - 32, gh,
                  text, size=9, color=opt.muted)

    return visuals, cmds, notes


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


def build_slots(spec: dict) -> tuple[list[dict], list[dict], list[str]]:
    ck, deneb, warn = [], [], []
    for v in spec.get("visuals", []):
        base = {"id": v["id"], "title": v.get("title", ""),
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
            warn.extend(f"[{v['id']}] {m}" for m in w)
        elif v.get("engine") == "deneb":
            deneb.append(base)
    return ck, deneb, warn


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
    L += ["Diese Felder existieren im Modell noch nicht. **Zuerst anlegen**, DAX vom "
          "Menschen bestätigen lassen, dann `te validate --errors-only`, erst danach "
          "Visuals binden.", "",
          "| Feld | Art | Tabelle | Beschreibung aus dem Mockup | im Layout benutzt |",
          "|---|---|---|---|---|"]
    for f in new:
        L.append(f"| `{f['ref']}` | {'Measure' if f.get('kind') == 'measure' else 'Spalte'} "
                 f"| {f['table']} | {f.get('description') or '–'} "
                 f"| {'ja' if f.get('used') else 'nein'} |")
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
    return "\n".join(L)


def build_checklist(spec: dict, chrome_notes: list[str], slot_warn: list[str],
                    pbir_visuals: list[dict]) -> str:
    L = ["# Checkliste vor dem Schreiben", "",
         f"Mockup: **{spec.get('meta',{}).get('name','?')}** · Seite "
         f"`{spec.get('page',{}).get('name','?')}` · Canvas "
         f"{spec.get('canvas',{}).get('width')}×{spec.get('canvas',{}).get('height')}", ""]

    counts = {}
    for v in spec.get("visuals", []):
        counts[v.get("engine", "?")] = counts.get(v.get("engine", "?"), 0) + 1
    filt = (spec.get("zones") or {}).get("filter") or {}
    L += ["## Umfang", "",
          f"- Visuals gesamt: {len(spec.get('visuals', []))} "
          f"(ChartKitchen {counts.get('ck',0)} · nativ {counts.get('native',0)} · "
          f"Deneb {counts.get('deneb',0)})",
          f"- Slicer im Filter-Panel: {len(filt.get('slicers') or [])}",
          f"- Einträge in `pbir-visuals.json`: {len(pbir_visuals)}", ""]

    reqs = [(v["id"], w) for v in spec.get("visuals", [])
            for w in (v.get("warnings") or [])]
    L += ["## Offene Punkte aus der Spec", ""]
    if reqs:
        for vid, w in reqs:
            L.append(f"- [ ] `{vid}`: {w}")
    else:
        L.append("- keine")
    for w in spec.get("warnings") or []:
        L.append(f"- [ ] Layout: {w}")
    L.append("")

    L += ["## Hinweise aus dem Chrome-Aufbau", ""]
    L += [f"- [ ] {n}" for n in chrome_notes] or ["- keine"]
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


def build_commands_md(spec: dict, report: str, page: str, out_dir: Path,
                      pbir_visuals: list[dict], chrome: list[dict],
                      ck_slots: list[dict], deneb_slots: list[dict],
                      model_name: str) -> str:
    page_path = f"{report}/{page}.Page"
    canvas = spec.get("canvas", {})
    o = out_dir.as_posix()
    L = [f"# Befehlsfolge · {page}", "",
         "Reihenfolge einhalten. Vor dem ersten schreibenden Befehl: Power BI Desktop "
         "schließen, `pbir backup` oder Git-Commit.", "",
         "```bash",
         "# 0 · Ausgangslage sichern",
         f'pbir backup "{report}"',
         "",
         "# 1 · Modell zuerst (siehe model-todos.md), dann prüfen",
         f'te validate -m "{model_name or "<Name>.SemanticModel"}" --errors-only',
         "",
         "# 2 · Seite anlegen (legt automatisch eine Textbox 'Title' an — entfernen)",
         f'pbir add page "{report}/{slug(page)}.Page" -n "{page}" '
         f'-w {canvas.get("width", 1280)} -h {canvas.get("height", 720)}',
         f'pbir rm "{page_path}/Title.Visual" -f',
         "",
         "#   Bei einer bestehenden Seite stattdessen nur die Canvas-Größe setzen:",
         f'# pbir pages resize "{page_path}" -w {canvas.get("width", 1280)} '
         f'-h {canvas.get("height", 720)}',
         "",
         "# 3 · Chrome-Geometrie (Flächen, Textrahmen, Buttons)",
         f'pbir add visual "{page_path}" --from-json "{o}/chrome-visuals.json"',
         "",
         "# 4 · Native Visuals + Slicer",
         f'pbir add visual "{page_path}" --from-json "{o}/pbir-visuals.json"',
         "",
         "# 5 · Texte, Farben, Aktionen, z-Order — erst wenn alle Visuals existieren",
         f'bash "{o}/chrome-commands.sh"   # PowerShell: {o}/chrome-commands.ps1',
         "",
         "# 6 · Verifizieren",
         f'pbir validate "{report}" --fields',
         f'te validate -m "{model_name or "<Name>.SemanticModel"}" --errors-only',
         "```", ""]

    if ck_slots:
        L += ["## ChartKitchen-Slots (nicht per from-json)", "",
              "Nur über eine vorhandene Referenz-Instanz replizieren — Vorgehen in "
              "`.claude/skills/chartkitchen-report/references/pbir-insertion.md`. "
              "Solange keine Instanz im Report liegt: Platzhalter setzen.", "", "```bash"]
        for s in ck_slots:
            r = s["rect"]
            L.append(f'# {s["title"]} ({s["kind"]} → orientation {s.get("orientation") or "?"})')
            L.append(f'pbir add visual shape "{page_path}" -n "{s["id"]}_slot" '
                     f'-x {r["x"]} -y {r["y"]} -w {r["w"]} -h {r["h"]} '
                     f'-t "ChartKitchen: {s["kind"]}"')
            L.append(f'pbir set "{page_path}/{s["id"]}_slot.Visual.text.text" '
                     f'--value "ChartKitchen: {s["kind"]} · {s["title"]}"')
        L += ["```", ""]
    if deneb_slots:
        L += ["## Deneb-Slots", "",
              "Über den Skill `deploy-to-powerbi` (Template aus dem Chart-Builder) "
              "bzw. `pbir visuals deneb`. Slots:", ""]
        for s in deneb_slots:
            r = s["rect"]
            L.append(f"- `{s['id']}` — {s['title']} bei x={r['x']}, y={r['y']}, "
                     f"w={r['w']}, h={r['h']}")
        L.append("")
    L += ["## Design-Gegenprobe", "", "```bash",
          "export PYTHONIOENCODING=utf-8   # sonst brechen beide Skripte an Umlauten ab",
          f'python .claude/skills/powerbi-design-framework/scripts/bulk_restyle.py "{report}" \\',
          f'  --check --zones "{o}/zones.json" --grid 0 \\',
          "  --skip-types shape,textbox,actionButton,image,slicer",
          f'python .claude/skills/powerbi-design-framework/scripts/render_wireframe.py "{report}" \\',
          f'  --zones "{o}/zones.json" --html',
          "```",
          "",
          "`--grid 0` weil MockupKitchen-Splits selten auf dem 8-px-Raster landen; "
          "`--skip-types` weil Chrome-Elemente absichtlich außerhalb der Content-Zone liegen.",
          ""]
    return "\n".join(L)


# --------------------------------------------------------------------------- #
# main
# --------------------------------------------------------------------------- #
def main() -> int:
    p = argparse.ArgumentParser(
        description="MockupKitchen-Spec → pbir-Bausteine",
        formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("spec", help="Pfad zu mockup-spec.json")
    p.add_argument("--out", default="mockup-out", help="Ausgabeordner (Default: mockup-out)")
    p.add_argument("--page-name", help="Seitenname überschreiben (sonst page.name aus der Spec)")
    p.add_argument("--report", help='Report-Ordner, z. B. "Meine.Report" — erzeugt commands.md')
    p.add_argument("--ink", default="#0F1E2E", help="Farbe für Kopfband/Nav/Buttons")
    p.add_argument("--on-ink", dest="on_ink", default="#FFFFFF", help="Textfarbe auf Ink")
    p.add_argument("--muted-on-ink", dest="muted_on_ink", default="#C8CDD4",
                   help="Untertitelfarbe im Kopfband")
    p.add_argument("--panel", default="#F1F3F5", help="Fläche des Filter-Panels")
    p.add_argument("--muted", default="#6B7280", help="Textfarbe der Fußleiste")
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

    page = opt.page_name or (spec.get("page") or {}).get("name") or "Seite"
    model_name = (spec.get("model") or {}).get("source") or ""
    out = Path(opt.out).expanduser()
    out.mkdir(parents=True, exist_ok=True)

    pbir_visuals = build_pbir_visuals(spec, ck_fallback=opt.ck_fallback)
    chrome_visuals, chrome_cmds, chrome_notes = build_chrome(spec, opt)
    if pbir_visuals:
        chrome_cmds.note("Inhalt und Slicer ueber die Chrome-Flaechen legen "
                         "(--from-json vergibt immer z=0)")
        for item in pbir_visuals:
            chrome_cmds.position(item["name"], "--z", "10")
        chrome_cmds.note("")
    ck_slots, deneb_slots, slot_warn = build_slots(spec)
    content = (spec.get("zones") or {}).get("content") or {}
    zones = {"content": [content.get("x", 0), content.get("y", 0),
                         content.get("w", 0), content.get("h", 0)],
             "ignorePages": []}

    page_expr_sh = f'{opt.report}/{page}.Page' if opt.report else "$REPORT/$PAGE.Page"
    page_expr_ps = f'{opt.report}/{page}.Page' if opt.report else "$Report/$Page.Page"
    head_text = ("Chrome-Texte, -Farben, -Aktionen und z-Order.\n"
                 "# Zuletzt ausfuehren: erst chrome-visuals.json, dann "
                 "pbir-visuals.json einspielen.\n")
    sh_head = ("#!/usr/bin/env bash\n# " + head_text
               + "set -euo pipefail\n"
               + ("" if opt.report else
                  'REPORT="<Name>.Report"\nPAGE="%s"\n' % page) + "\n")
    ps_head = ("# " + head_text
               + "$ErrorActionPreference = 'Stop'\n"
               + ("" if opt.report else
                  '$Report = "<Name>.Report"\n$Page = "%s"\n' % page) + "\n")

    written: list[tuple[str, str]] = [
        ("pbir-visuals.json", json.dumps(pbir_visuals, ensure_ascii=False, indent=2) + "\n"),
        ("chrome-visuals.json", json.dumps(chrome_visuals, ensure_ascii=False, indent=2) + "\n"),
        ("chrome-commands.sh", sh_head + chrome_cmds.render("sh", page_expr_sh)),
        ("chrome-commands.ps1", ps_head + chrome_cmds.render("ps1", page_expr_ps)),
        ("zones.json", json.dumps(zones, ensure_ascii=False, indent=2) + "\n"),
        ("chartkitchen-slots.json", json.dumps(ck_slots, ensure_ascii=False, indent=2) + "\n"),
        ("deneb-slots.json", json.dumps(deneb_slots, ensure_ascii=False, indent=2) + "\n"),
        ("model-todos.md", build_model_todos(spec, model_name)),
        ("checklist.md", build_checklist(spec, chrome_notes, slot_warn, pbir_visuals)),
    ]
    if opt.report:
        written.append(("commands.md",
                        build_commands_md(spec, opt.report, page, out, pbir_visuals,
                                          chrome_visuals, ck_slots, deneb_slots, model_name)))
    for name, text in written:
        (out / name).write_text(text, encoding="utf-8")

    print(f"Seite '{page}' · Canvas {spec.get('canvas',{}).get('width')}×"
          f"{spec.get('canvas',{}).get('height')} · Modell "
          f"{model_name or '(nicht in der Spec)'}")
    print(f"-> {out}")
    for name, _ in written:
        print(f"   {name}")
    print(f"\nNative Visuals + Slicer: {len(pbir_visuals)} · Chrome-Elemente: "
          f"{len(chrome_visuals)} · ChartKitchen-Slots: {len(ck_slots)} · "
          f"Deneb-Slots: {len(deneb_slots)} · neue Felder: "
          f"{len(spec.get('newFields') or [])}")
    open_points = (sum(len(v.get('warnings') or []) for v in spec.get('visuals', []))
                   + len(spec.get('warnings') or []) + len(chrome_notes) + len(slot_warn))
    if open_points:
        print(f"{open_points} offene(r) Punkt(e) — siehe checklist.md")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
