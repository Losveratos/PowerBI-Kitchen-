#!/usr/bin/env python3
"""mockup_to_docs.py — Workshop-Doku und PowerPoint aus der MockupKitchen-Spec.

Zweiter Ausgang des Skills `mockup-to-powerbi`: nicht der Bericht, sondern das
Protokoll. Aus `mockup-spec.json` (specVersion 1, 2 oder 3) entstehen

  WORKSHOP-DOKU.md    gleiche Struktur wie `buildDocs` in assets/mockup/export.js
                      (wird uebersprungen, wenn die Datei schon neben der Spec
                      liegt — das Tool schreibt sie selbst; mit --force-md
                      trotzdem neu erzeugen)
  WORKSHOP-DOKU.pptx  Folien: Titel · Berichtskopf · Gestaltung · je Seite ein
                      Seitenbild (PNG aus dem Tool, sonst massstaebliches
                      Wireframe aus Shapes) + eine Kachel-Tabelle ·
                      Navigation/Drill · Kennzahlen-Steckbrief · neue Kennzahlen
                      · offene Punkte · naechste Schritte

    python mockup_to_docs.py mockup-spec.json [--out .] [--no-pptx] [--force-md]
                             [--lang de|en] [--docs WORKSHOP-DOKU.md]
                             [--images <Ordner mit page-<i>-<slug>.png>]

Liegen neben der Spec Seitenbilder `page-<Index>-<Slug>.png` (Export „Alle
Dateien" im Tool), werden sie in die Folien eingebettet; sonst zeichnet das
Skript das Wireframe aus nativen Shapes.

Die PowerPoint braucht `python-pptx`:

    pip install python-pptx

Fehlt das Paket, schreibt das Skript trotzdem die Markdown-Fassung und meldet
den fehlenden Import. Alternative ohne Installation: die Markdown-Datei an den
Skill `anthropic-skills:pptx` geben.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from mockup_spec import SpecError, load, slug, upgrade                # noqa: E402

# --------------------------------------------------------------------------- #
# Beschriftungen (Quelle: assets/mockup/catalog.js), zweisprachig
# --------------------------------------------------------------------------- #
ROLE_LABEL = {
    "de": {"category": "Kategorie / Zeit", "subcategory": "Unterkategorie",
           "series": "Reihe / Legende", "ac": "AC · Ist-Wert",
           "ref": "Referenz (PL / PY / BU)", "fc": "FC-Flag (1/0)",
           "values": "Werte", "rows": "Zeilen", "columns": "Spalten",
           "x": "X-Wert", "y": "Y-Wert", "size": "Größe",
           "indicator": "Kennzahl", "goal": "Ziel / Referenz",
           "start": "Start", "end": "Ende", "field": "Feld", "text": "Text",
           "rowType": "Zeilentyp (Position / Summe / Formel)"},
    "en": {"category": "Category / time", "subcategory": "Sub-category",
           "series": "Series / legend", "ac": "AC · actual",
           "ref": "Reference (PL / PY / BU)", "fc": "FC flag (1/0)",
           "values": "Values", "rows": "Rows", "columns": "Columns",
           "x": "X value", "y": "Y value", "size": "Size",
           "indicator": "Measure", "goal": "Target / reference",
           "start": "Start", "end": "End", "field": "Field", "text": "Text",
           "rowType": "Row type (item / subtotal / formula)"},
}
ENGINE_LABEL = {"ck": "ChartKitchen", "native": "Nativ", "deneb": "Deneb",
                "custom": "Custom Visual"}


def engine_label(v: dict) -> str:
    """Engine einer Kachel als Text — Custom Visuals mit ihrem Namen."""
    if v.get("engine") == "custom":
        return (v.get("customVisual") or {}).get("name") or ENGINE_LABEL["custom"]
    return ENGINE_LABEL.get(v.get("engine"), v.get("engine"))
PRIORITY = {"de": {"must": "Must", "should": "Should", "could": "Could"},
            "en": {"must": "Must", "should": "Should", "could": "Could"}}
STATUS = {"de": {"open": "offen", "agreed": "abgestimmt", "approved": "abgenommen"},
          "en": {"open": "open", "agreed": "agreed", "approved": "approved"}}
TILE_STYLE = {"de": {"border": "mit feinem Rahmen", "shadow": "mit weichem Schatten",
                     "flat": "flach"},
              "en": {"border": "with a hairline border", "shadow": "with a soft shadow",
                     "flat": "flat"}}
FILTER_MODE = {"de": {"right": "als Panel rechts", "left": "als Panel links",
                      "top": "als Leiste oben", "burger": "als Burger-Menü (Bookmark)"},
               "en": {"right": "as a panel on the right", "left": "as a panel on the left",
                      "top": "as a bar on top", "burger": "as a burger menu (bookmark)"}}
PRESET_LABEL = {"1280x720": "HD", "1920x1080": "Full HD", "3840x2160": "Ultra HD"}
PALETTE_LABEL = {"de": {"teal": "Teal (Petrol / Rot)", "ibcs": "IBCS (Gruen / Rot)"},
                 "en": {"teal": "teal (petrol / red)", "ibcs": "IBCS (green / red)"}}

TXT = {
    "de": {
        "doc_title": "Workshop-Dokumentation", "as_of": "Stand", "version": "Version",
        "hash": "Spec-Hash", "made_with": "erstellt mit",
        "participants": "Teilnehmende", "audience": "Zielgruppe",
        "purpose": "Ziel des Berichts", "decision": "Entscheidung",
        "data_date": "Datenstand / Aktualisierung", "pages": "Seiten",
        "model": "Datenmodell", "fill_in": "[ausfüllen]",
        "not_connected": "noch nicht angebunden", "tables": "Tabellen",
        "design": "Entscheidungen zur Gestaltung", "format": "Format",
        "header": "Kopfband", "style": "Stil", "logo": "Logo",
        "logo_none": "ohne", "logo_right": "rechts", "logo_left": "links",
        "filter": "Filter", "no_filter": "keine", "no_fields": "noch ohne Felder",
        "footer": "Fußleiste", "without": "ohne", "tiles": "Kacheln",
        "rounded": "gerundet", "square": "eckig", "page_bg": "Seitenhintergrund",
        "accent": "Akzent", "page": "Seite", "question": "Fragestellung",
        "notes": "Notizen", "no_tiles": "_Noch keine Kacheln._",
        "th": ["#", "Kachel", "Darstellung", "Felder", "Analyse", "Prio", "Status",
               "Notizen"],
        "nav": "Navigation und Drill-Wege", "from": "Von", "to": "nach",
        "pagechange": "Seitenwechsel", "drill": "Drill-through",
        "profile": "Kennzahlen-Steckbrief",
        "profile_th": ["Feld", "Heißt beim Fachbereich", "Definition laut Modell",
                       "Einheit", "Ziel", "Owner", "Quelle", "bestätigt"],
        "new_fields": "Neu zu erstellen",
        "new_th": ["Feld", "Art", "Tabelle", "Beschreibung / Logik", "Einheit",
                   "Ziel", "Owner", "Quelle", "Offene Frage"],
        "measure": "Kennzahl", "dimension": "Dimension",
        "open": "Offene Punkte", "none_open": "keine offenen Punkte erfasst",
        "hints": "Hinweise", "next": "Nächste Schritte",
        "next_items": [
            "Kennzahlen-Definitionen bestätigen (Steckbrief), fehlende Kennzahlen im "
            "Semantikmodell anlegen",
            "Seiten mit dem Skill `mockup-to-powerbi` ins PBIP übertragen",
            "Review der gebauten Seiten mit den Teilnehmenden, Status auf "
            "„abgenommen\" setzen"],
        "slide_sub": "Workshop-Dokumentation zur Berichtsskizze",
        "slide_report": "Berichtskopf", "slide_tiles": "Kacheln",
        "slide_new": "Neue Kennzahlen und Felder",
        "no_new": "Keine neuen Felder — alles kommt aus dem bestehenden Modell.",
        "no_nav": "Keine Navigations- oder Drill-Wege im Mockup festgelegt.",
        "nav_header": "Nav-Buttons im Kopfband",
        "nav_left": "Linke Nav-Leiste mit einem Button je Seite",
        "bookmarks": "Filter-Panel über zwei Lesezeichen (öffnen / schließen); "
                     "Lesezeichen erfassen nur die Sichtbarkeit, nicht die Auswahl",
        "no_open": "Keine offenen Punkte erfasst.",
        "pptx_next": [
            "Fehlende Kennzahlen im Semantikmodell anlegen (te add, DAX bestätigen)",
            "Seiten mit dem Skill `mockup-to-powerbi` ins PBIP übertragen",
            "ChartKitchen-Slots über die Referenz-Instanz füllen",
            "Navigation, Drill-through und Filter-Lesezeichen in Desktop testen",
            "Review der gebauten Seiten mit den Teilnehmenden"],
        "theme_check": "Formatierung gegen das Theme prüfen",
        "lower_better": "kleiner = besser", "sorted_by": "sortiert nach",
        "top": "Top", "cum": "kumuliert", "scale": "Skalengruppe",
        "palette": "Varianz-Palette", "good": "gut", "bad": "schlecht",
        "ink": "Schriftfarbe", "custom_visuals": "Custom Visuals",
        "custom_hint": "Diese Kacheln sind Custom Visuals aus dem Repository. "
                       "Die passende `.pbiviz` muss im Bericht importiert sein, "
                       "sonst bleibt die Kachel leer.",
    },
    "en": {
        "doc_title": "Workshop documentation", "as_of": "As of", "version": "Version",
        "hash": "Spec hash", "made_with": "created with",
        "participants": "Participants", "audience": "Audience",
        "purpose": "Purpose of the report", "decision": "Decision",
        "data_date": "Data as of / refresh", "pages": "Pages",
        "model": "Semantic model", "fill_in": "[to be filled in]",
        "not_connected": "not connected yet", "tables": "tables",
        "design": "Design decisions", "format": "Format",
        "header": "Header band", "style": "style", "logo": "logo",
        "logo_none": "none", "logo_right": "right", "logo_left": "left",
        "filter": "Filter", "no_filter": "none", "no_fields": "no fields yet",
        "footer": "Footer", "without": "none", "tiles": "Tiles",
        "rounded": "rounded", "square": "square", "page_bg": "page background",
        "accent": "accent", "page": "Page", "question": "Question",
        "notes": "Notes", "no_tiles": "_No tiles yet._",
        "th": ["#", "Tile", "Rendering", "Fields", "Analysis", "Prio", "Status",
               "Notes"],
        "nav": "Navigation and drill paths", "from": "From", "to": "to",
        "pagechange": "page navigation", "drill": "drill-through",
        "profile": "Measure profile",
        "profile_th": ["Field", "Business name", "Definition in the model", "Unit",
                       "Target", "Owner", "Source", "confirmed"],
        "new_fields": "To be created",
        "new_th": ["Field", "Kind", "Table", "Description / logic", "Unit",
                   "Target", "Owner", "Source", "Open question"],
        "measure": "Measure", "dimension": "Dimension",
        "open": "Open points", "none_open": "no open points recorded",
        "hints": "Notes", "next": "Next steps",
        "next_items": [
            "Confirm measure definitions (profile), create missing measures in the "
            "semantic model",
            "Build the pages with the `mockup-to-powerbi` skill",
            "Review the built pages with the participants, set status to „approved\""],
        "slide_sub": "Workshop documentation for the report sketch",
        "slide_report": "Report brief", "slide_tiles": "Tiles",
        "slide_new": "New measures and fields",
        "no_new": "No new fields — everything comes from the existing model.",
        "no_nav": "No navigation or drill paths defined in the mockup.",
        "nav_header": "Navigation buttons in the header band",
        "nav_left": "Left navigation rail with one button per page",
        "bookmarks": "Filter panel via two bookmarks (open / close); bookmarks capture "
                     "visibility only, not the selection",
        "no_open": "No open points recorded.",
        "pptx_next": [
            "Create missing measures in the semantic model (te add, confirm DAX)",
            "Build the pages with the `mockup-to-powerbi` skill",
            "Fill the ChartKitchen slots from the reference instance",
            "Test navigation, drill-through and filter bookmarks in Desktop",
            "Review the built pages with the participants"],
        "theme_check": "Check formatting against the theme",
        "lower_better": "lower is better", "sorted_by": "sorted by",
        "top": "Top", "cum": "cumulative", "scale": "scale group",
        "palette": "Variance palette", "good": "good", "bad": "bad",
        "ink": "Text colour", "custom_visuals": "Custom visuals",
        "custom_hint": "These tiles are custom visuals from the repository. "
                       "The matching `.pbiviz` has to be imported into the report, "
                       "otherwise the tile stays empty.",
    },
}

INK = "0F1E2E"
INK_SOFT = "475569"
LINE = "D5D8DC"
PAPER = "FFFFFF"


def role_label(key: str, lang: str) -> str:
    return ROLE_LABEL.get(lang, ROLE_LABEL["de"]).get(key, key)


def fields_summary(v: dict, lang: str) -> str:
    roles = v.get("roles") or {}
    parts = []
    for key, fl in roles.items():
        names = ", ".join(f["name"] + (" (neu)" if f.get("isNew") else "") for f in fl)
        parts.append("%s: %s" % (role_label(key, lang), names))
    return "; ".join(parts) or "–"


def analysis_summary(v: dict, lang: str) -> str:
    """Analyse-Kurzform fuer die Kachel-Tabelle (wie analysisLine in export.js)."""
    t = TXT[lang]
    a = v.get("analysis") or {}
    if not (v.get("roles") or {}) or v.get("kind") in ("slicer", "text", "button"):
        return "–"
    parts = []
    if a.get("polarity") == "lower":
        parts.append(t["lower_better"])
    if a.get("sort"):
        parts.append("%s %s" % (t["sorted_by"], a["sort"].get("by")))
    if a.get("topN"):
        parts.append("%s %s" % (t["top"], a["topN"]))
    if a.get("unit"):
        parts.append(a["unit"])
    if a.get("displayUnits"):
        parts.append(str(a["displayUnits"]))
    if a.get("decimals") is not None:
        parts.append("%s dec" % a["decimals"])
    if a.get("timeGrain"):
        parts.append(str(a["timeGrain"]))
    if a.get("cumulative"):
        parts.append(t["cum"])
    if a.get("scaleGroup"):
        parts.append("%s %s" % (t["scale"], a["scaleGroup"]))
    return ", ".join(parts) or "–"


def open_points(nspec: dict, lang: str):
    out = []
    for f in nspec["newFields"]:
        if f.get("openQuestion"):
            out.append("%s: %s" % (f["name"], f["openQuestion"]))
    for p in nspec["pages"]:
        for v in p["visuals"]:
            if (v.get("workshop") or {}).get("openQuestion"):
                out.append("%s / %s: %s" % (p["name"], v.get("title"),
                                            v.get("notes") or "offene Frage ohne Text"))
    for i in nspec["issues"]:
        if i.get("level") != "info":
            out.append(("%s: " % i["page"] if i.get("page") else "") + i.get("text", ""))
    for f in nspec["fields"]:
        if f.get("note"):
            out.append("%s: %s" % (f["ref"], f["note"]))
    seen, uniq = set(), []
    for o in out:
        if o not in seen:
            seen.add(o)
            uniq.append(o)
    return uniq


def page_image(nspec: dict, page: dict, folder: Path):
    """`page-<Index>-<Slug>.png` neben der Spec, falls exportiert."""
    if not folder:
        return None
    cand = folder / ("page-%d-%s.png" % (page["index"], slug(page["name"])))
    return cand if cand.is_file() else None


# --------------------------------------------------------------------------- #
# WORKSHOP-DOKU.md  (Struktur wie buildDocs in assets/mockup/export.js, v3)
# --------------------------------------------------------------------------- #
def build_docs_md(nspec: dict, lang: str) -> str:
    t = TXT[lang]
    z, d = nspec["zones"], nspec["design"]
    meta, rp = nspec["meta"], nspec["report"]
    canvas = nspec["canvas"]
    model = nspec["model"]
    L = ["# %s · %s" % (t["doc_title"], meta.get("name", "Mockup")), "",
         ("%s: %s · %s %s · %s `%s` · %s %s %s"
          % (t["as_of"], date.today().isoformat(), t["version"],
             rp.get("version") or "0.1", t["hash"], meta.get("specHash") or "–",
             t["made_with"], meta.get("tool", "MockupKitchen byDatenWG"),
             meta.get("version", ""))).rstrip(),
         "", "| | |", "|---|---|",
         "| %s | %s |" % (t["participants"], rp.get("participants") or t["fill_in"]),
         "| %s | %s |" % (t["audience"], rp.get("audience") or t["fill_in"]),
         "| %s | %s |" % (t["purpose"], rp.get("purpose") or t["fill_in"]),
         "| %s | %s |" % (t["decision"], rp.get("decision") or t["fill_in"]),
         "| %s | %s |" % (t["data_date"], rp.get("dataDate") or t["fill_in"]),
         "| %s | %s |" % (t["pages"], " · ".join(p["name"] for p in nspec["pages"])),
         "| %s | %s (%d %s) |" % (t["model"], model.get("source") or t["not_connected"],
                                  len(model.get("tables") or []), t["tables"]), ""]

    preset = canvas.get("preset")
    fmt = "- %s %s × %s px" % (t["format"], canvas.get("width"), canvas.get("height"))
    if preset and preset != "custom":
        fmt += " (%s)" % PRESET_LABEL.get(preset, preset)
    header = z.get("header")
    if header:
        h = ("„%s\"" % (header.get("title") or "")
             + (" · %s" % header["subtitle"] if header.get("subtitle") else "")
             + ", %s %s" % (t["style"], header.get("style", d["headerStyle"])))
        logo = header.get("logoPos") or ("left" if header.get("logo") else "none")
        h += ", %s %s" % (t["logo"], {"none": t["logo_none"], "right": t["logo_right"]}
                          .get(logo, t["logo_left"]))
    else:
        h = t["without"]
    filt = z.get("filter")
    if filt:
        mode = filt.get("mode") or filt.get("side") or "right"
        f_txt = FILTER_MODE[lang].get(mode, mode)
        sl = filt.get("slicers") or []
        if sl:
            f_txt += ": " + ", ".join(
                s["name"] + ((" (%s %s)" % ("Vorauswahl" if lang == "de" else "default",
                                            s["default"])) if s.get("default") else "")
                for s in sl)
        else:
            f_txt += ", " + t["no_fields"]
    else:
        f_txt = t["no_filter"]
    L += ["## %s" % t["design"], "", fmt + ".",
          "- %s %s." % (t["header"], h),
          "- %s %s." % (t["filter"], f_txt),
          "- %s %s." % (t["footer"], ("„%s\"" % z["footer"].get("text", ""))
                        if z.get("footer") else t["without"]),
          "- %s %s, %s, %s %s, %s %s."
          % (t["tiles"],
             ("%s (%s px)" % (t["rounded"], d["cornerRadius"])) if d["cornerRadius"]
             else t["square"],
             TILE_STYLE[lang].get(d["tileStyle"], d["tileStyle"]),
             t["page_bg"], d["pageBackground"], t["accent"], d["accent"]),
          "- %s %s: %s %s, %s %s. %s %s."
          % (t["palette"], PALETTE_LABEL[lang].get(d["variancePalette"],
                                                   d["variancePalette"]),
             t["good"], d["varianceColors"]["good"],
             t["bad"], d["varianceColors"]["bad"],
             t["ink"], d["colors"]["ink"]), ""]

    for p in nspec["pages"]:
        L += ["## %s %s · %s" % (t["page"], p["index"], p["name"]), "",
              "**%s:** %s" % (t["question"], p.get("question") or t["fill_in"]), ""]
        if p.get("notes"):
            L += ["**%s:** %s" % (t["notes"], p["notes"]), ""]
        if p["visuals"]:
            L += ["| " + " | ".join(t["th"]) + " |",
                  "|" + "---|" * len(t["th"])]
            for i, v in enumerate(p["visuals"], start=1):
                render = (v.get("label") or v.get("kind", ""))
                if v.get("scenario"):
                    render += ", %s" % v["scenario"]
                eng = engine_label(v) if v.get("engine") != "native" else ""
                if eng and eng not in render:
                    render += ", %s" % eng
                w = v.get("workshop") or {}
                a = v.get("analysis") or {}
                title = v.get("title", "")
                if v.get("subtitle"):
                    title += " (%s)" % v["subtitle"]
                if a.get("message"):
                    title += "<br>_%s_" % a["message"]
                note = " · ".join(x for x in [
                    ("Text: %s" % v["content"]) if v.get("content") else "",
                    v.get("notes") or "",
                    ("→ %s" % v["link"]["pageName"]) if v.get("link") else ""] if x)
                L.append("| %s.%s | %s | %s | %s | %s | %s | %s | %s |"
                         % (p["index"], i, title, render, fields_summary(v, lang),
                            analysis_summary(v, lang),
                            PRIORITY[lang].get(w.get("priority"), "–"),
                            STATUS[lang].get(w.get("status", "open"), "–"),
                            note or "–"))
        else:
            L.append(t["no_tiles"])
        L.append("")

    if nspec["links"]:
        L += ["## %s" % t["nav"], ""]
        for l in nspec["links"]:
            kind = (t["pagechange"] if l.get("kind") == "navigation"
                    else t["drill"] + (" (%s)" % l["drillField"] if l.get("drillField") else ""))
            L.append("- %s „%s\" (%s) %s „%s\" (%s)"
                     % (t["from"], l["fromPage"], l["fromVisual"], t["to"],
                        l["toPage"], kind))
        L.append("")

    custom = [(pg, v) for pg in nspec["pages"] for v in pg["visuals"]
              if v.get("engine") == "custom"]
    if custom:
        L += ["## %s" % t["custom_visuals"], "", t["custom_hint"], ""]
        for pg, v in custom:
            cv = v.get("customVisual") or {}
            roles = ", ".join(
                "`%s`: %s" % (role, ", ".join(e.get("ref", "") for e in entries))
                for role, entries in sorted((cv.get("buckets") or {}).items()))
            L.append("- %s %s · **%s** — `%s` (%s)"
                     % (t["page"], pg["index"], v.get("title") or v["id"],
                        cv.get("name") or "?", cv.get("guid") or "?"))
            if roles:
                L.append("  - %s" % roles)
        L.append("")

    L += ["## %s" % t["profile"], "",
          "| " + " | ".join(t["profile_th"]) + " |",
          "|" + "---|" * len(t["profile_th"])]
    for f in nspec["fields"]:
        L.append("| %s%s | %s | %s | %s | %s | %s | %s | %s |"
                 % (f["ref"], " (neu)" if f.get("isNew") else "",
                    f.get("alias") or "–", f.get("description") or t["fill_in"],
                    f.get("unit") or f.get("formatString") or "–",
                    f.get("target") or "–", f.get("owner") or "–",
                    f.get("source") or "–", "☑" if f.get("confirmed") else "☐"))
    L.append("")

    if nspec["newFields"]:
        L += ["### %s" % t["new_fields"], "",
              "| " + " | ".join(t["new_th"]) + " |",
              "|" + "---|" * len(t["new_th"])]
        for f in nspec["newFields"]:
            L.append("| %s | %s | %s | %s | %s | %s | %s | %s | %s |"
                     % (f["name"],
                        t["measure"] if f.get("kind") == "measure" else t["dimension"],
                        f["table"], f.get("description") or t["fill_in"],
                        f.get("unit") or "–", f.get("target") or "–",
                        f.get("owner") or "–", f.get("source") or "–",
                        f.get("openQuestion") or "–"))
        L.append("")

    op = open_points(nspec, lang)
    L += ["## %s" % t["open"], ""]
    L += ["- [ ] %s" % o for o in op] or ["- [ ] %s" % t["none_open"]]
    L.append("")
    hints = [i for i in nspec["issues"] if i.get("level") == "info"]
    if hints:
        L += ["## %s" % t["hints"], ""] + ["- %s" % i["text"] for i in hints] + [""]
    L += ["## %s" % t["next"], ""] + ["- [ ] %s" % s for s in t["next_items"]] + [""]
    return "\n".join(L)


# --------------------------------------------------------------------------- #
# WORKSHOP-DOKU.pptx
# --------------------------------------------------------------------------- #
def hexcolor(value: str, fallback: str = INK):
    v = str(value or "").lstrip("#")
    return v.upper() if re.fullmatch(r"[0-9A-Fa-f]{6}", v or "") else fallback


def build_pptx(nspec: dict, target: Path, lang: str, images: Path):
    try:
        from pptx import Presentation
        from pptx.dml.color import RGBColor
        from pptx.enum.shapes import MSO_SHAPE
        from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
        from pptx.util import Emu, Pt
    except ImportError:
        return False, ("python-pptx ist nicht installiert — keine PowerPoint erzeugt.\n"
                       "  Installieren:  pip install python-pptx\n"
                       "  Alternative:   WORKSHOP-DOKU.md an den Skill "
                       "`anthropic-skills:pptx` geben.")

    t = TXT[lang]
    d = nspec["design"]
    rp = nspec["report"]
    accent = RGBColor.from_string(hexcolor(d["accent"], "C25A2D"))
    ink = RGBColor.from_string(INK)
    ink_soft = RGBColor.from_string(INK_SOFT)
    line = RGBColor.from_string(LINE)
    page_bg = RGBColor.from_string(hexcolor(d["pageBackground"], "F4F4F1"))
    tile_bg = RGBColor.from_string(hexcolor(d["tileBackground"], "FFFFFF"))

    prs = Presentation()
    prs.slide_width, prs.slide_height = Emu(12192000), Emu(6858000)   # 16:9
    SW, SH = prs.slide_width, prs.slide_height
    blank = prs.slide_layouts[6]

    def textbox(slide, x, y, w, h, text, *, size=18, bold=False, color=ink,
                align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, wrap=True):
        box = slide.shapes.add_textbox(Emu(int(x)), Emu(int(y)), Emu(int(w)), Emu(int(h)))
        tf = box.text_frame
        tf.word_wrap = wrap
        tf.vertical_anchor = anchor
        for i, ln in enumerate(str(text).split("\n")):
            para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
            para.alignment = align
            run = para.add_run()
            run.text = ln
            run.font.size = Pt(size)
            run.font.bold = bold
            run.font.color.rgb = color
        return box

    def slide_frame(title: str, kicker: str = ""):
        s = prs.slides.add_slide(blank)
        bar = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, SW, Emu(45720 * 22))
        bar.fill.solid()
        bar.fill.fore_color.rgb = RGBColor.from_string(PAPER)
        bar.line.color.rgb = line
        bar.line.width = Pt(0.75)
        bar.shadow.inherit = False
        rule = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Emu(45720 * 22), SW, Emu(22860))
        rule.fill.solid()
        rule.fill.fore_color.rgb = accent
        rule.line.fill.background()
        rule.shadow.inherit = False
        textbox(s, Emu(457200), Emu(150000), SW - Emu(914400), Emu(500000),
                title, size=24, bold=True, anchor=MSO_ANCHOR.MIDDLE)
        if kicker:
            textbox(s, Emu(457200), Emu(150000), SW - Emu(914400), Emu(500000),
                    kicker, size=12, color=ink_soft, align=PP_ALIGN.RIGHT,
                    anchor=MSO_ANCHOR.MIDDLE)
        return s

    def bullets(slide, items, *, x=457200, y=1300000, w=None, size=15, gap=430000):
        w = w or (SW - Emu(914400))
        for i, it in enumerate(items):
            textbox(slide, Emu(x), Emu(y + i * gap), w, Emu(gap), "•  " + it, size=size)

    def table(slide, heads, rows, widths, *, top=1350000, head_size=11, size=9):
        n = len(rows) + 1
        tbl = slide.shapes.add_table(n, len(heads), Emu(457200), Emu(top),
                                     SW - Emu(914400),
                                     Emu(min(4600000, 340000 * n))).table
        for c, wdt in enumerate(widths):
            tbl.columns[c].width = Emu(wdt)
        for c, head in enumerate(heads):
            cell = tbl.cell(0, c)
            cell.text = head
            run = cell.text_frame.paragraphs[0].runs[0]
            run.font.size, run.font.bold, run.font.color.rgb = Pt(head_size), True, ink
        for r, values in enumerate(rows, start=1):
            for c, txt in enumerate(values):
                cell = tbl.cell(r, c)
                cell.text = str(txt)
                for para in cell.text_frame.paragraphs:
                    for run in para.runs:
                        run.font.size = Pt(size)
                        run.font.color.rgb = ink if c == 0 else ink_soft
        return tbl

    # ---------------------------------------------------------------- Titel
    s = prs.slides.add_slide(blank)
    band = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, SW, SH)
    band.fill.solid()
    band.fill.fore_color.rgb = RGBColor.from_string(PAPER)
    band.line.fill.background()
    band.shadow.inherit = False
    stripe = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Emu(2200000), Emu(180000),
                                Emu(1500000))
    stripe.fill.solid()
    stripe.fill.fore_color.rgb = accent
    stripe.line.fill.background()
    stripe.shadow.inherit = False
    textbox(s, Emu(700000), Emu(2150000), SW - Emu(1400000), Emu(700000),
            nspec["meta"].get("name", "Mockup"), size=40, bold=True)
    textbox(s, Emu(700000), Emu(2900000), SW - Emu(1400000), Emu(500000),
            t["slide_sub"], size=20, color=ink_soft)
    model = nspec["model"]
    textbox(s, Emu(700000), Emu(3500000), SW - Emu(1400000), Emu(900000),
            "%d %s · %d %s · %s × %s px\n%s: %s\n%s: %s · %s %s · %s %s"
            % (len(nspec["pages"]), t["pages"],
               sum(len(p["visuals"]) for p in nspec["pages"]), t["tiles"],
               nspec["canvas"].get("width"), nspec["canvas"].get("height"),
               t["model"], model.get("source") or t["not_connected"],
               t["as_of"], date.today().strftime("%d.%m.%Y"),
               t["hash"], nspec["meta"].get("specHash") or "–",
               t["made_with"], nspec["meta"].get("tool", "MockupKitchen byDatenWG")),
            size=14, color=ink_soft)

    # ------------------------------------------------------------ Berichtskopf
    s = slide_frame(t["slide_report"])
    bullets(s, ["%s: %s" % (t["audience"], rp.get("audience") or t["fill_in"]),
                "%s: %s" % (t["purpose"], rp.get("purpose") or t["fill_in"]),
                "%s: %s" % (t["decision"], rp.get("decision") or t["fill_in"]),
                "%s: %s" % (t["participants"], rp.get("participants") or t["fill_in"]),
                "%s: %s · %s %s" % (t["data_date"], rp.get("dataDate") or t["fill_in"],
                                    t["version"], rp.get("version") or "0.1")], size=16)

    # ------------------------------------------------- Gestaltungsentscheidungen
    z = nspec["zones"]
    header = z.get("header")
    filt = z.get("filter")
    items = ["%s %s × %s px%s, ×%s"
             % (t["format"], nspec["canvas"].get("width"), nspec["canvas"].get("height"),
                (" (%s)" % PRESET_LABEL.get(nspec["canvas"].get("preset"), ""))
                if PRESET_LABEL.get(nspec["canvas"].get("preset")) else "",
                nspec["uiScale"])]
    if header:
        logo = header.get("logoPos") or ("left" if header.get("logo") else "none")
        items.append("%s „%s\", %s %s, %s %s%s"
                     % (t["header"], header.get("title", ""), t["style"],
                        header.get("style", d["headerStyle"]), t["logo"],
                        {"none": t["logo_none"], "right": t["logo_right"]}
                        .get(logo, t["logo_left"]),
                        (", Nav: %s" % " · ".join(header.get("nav") or []))
                        if header.get("nav") else ""))
    if z.get("nav"):
        items.append(t["nav_left"])
    if filt:
        mode = filt.get("mode") or filt.get("side") or "right"
        sl = ", ".join(x["name"] for x in (filt.get("slicers") or [])) or t["no_fields"]
        items.append("%s %s: %s%s" % (t["filter"], FILTER_MODE[lang].get(mode, mode), sl,
                                      (" · " + t["bookmarks"])
                                      if filt.get("collapsible") or mode == "burger" else ""))
    if z.get("footer"):
        items.append("%s: %s" % (t["footer"], z["footer"].get("text", "")))
    items.append("%s %s, %s, %s %s · %s %s"
                 % (t["tiles"],
                    ("%s (%s px)" % (t["rounded"], d["cornerRadius"]))
                    if d["cornerRadius"] else t["square"],
                    TILE_STYLE[lang].get(d["tileStyle"], d["tileStyle"]),
                    t["page_bg"], d["pageBackground"], t["accent"], d["accent"]))
    items.append("%s %s: %s %s · %s %s · %s %s"
                 % (t["palette"],
                    PALETTE_LABEL[lang].get(d["variancePalette"], d["variancePalette"]),
                    t["good"], d["varianceColors"]["good"],
                    t["bad"], d["varianceColors"]["bad"],
                    t["ink"], d["colors"]["ink"]))
    s = slide_frame(t["design"])
    bullets(s, items)

    # ---------------------------------------------------------- Seiten
    def wireframe(slide, page):
        """Zeichnet die Zonen und Kacheln massstaeblich in die Folie."""
        cw = int(nspec["canvas"].get("width") or 1280)
        ch = int(nspec["canvas"].get("height") or 720)
        margin_x, top = 700000, 1450000
        avail_w = SW - 2 * margin_x
        avail_h = SH - top - 700000
        scale = min(avail_w / cw, avail_h / ch)
        ox = int((SW - cw * scale) / 2)
        oy = int(top)

        def box(rx, ry, rw, rh, *, fill, outline=None, text="", sub="",
                size=9, color=ink, bold=False):
            shp = slide.shapes.add_shape(
                MSO_SHAPE.RECTANGLE, Emu(int(ox + rx * scale)), Emu(int(oy + ry * scale)),
                Emu(max(9144, int(rw * scale))), Emu(max(9144, int(rh * scale))))
            shp.fill.solid()
            shp.fill.fore_color.rgb = fill
            if outline is None:
                shp.line.fill.background()
            else:
                shp.line.color.rgb = outline
                shp.line.width = Pt(0.75)
            shp.shadow.inherit = False
            tf = shp.text_frame
            tf.word_wrap = True
            tf.vertical_anchor = MSO_ANCHOR.TOP
            p0 = tf.paragraphs[0]
            p0.alignment = PP_ALIGN.LEFT
            r = p0.add_run()
            r.text = text
            r.font.size = Pt(size)
            r.font.bold = bold
            r.font.color.rgb = color
            if sub:
                p1 = tf.add_paragraph()
                p1.alignment = PP_ALIGN.LEFT
                r1 = p1.add_run()
                r1.text = sub
                r1.font.size = Pt(max(7, size - 2))
                r1.font.color.rgb = ink_soft
            return shp

        box(0, 0, cw, ch, fill=page_bg, outline=line)
        zz = nspec["zones"]
        if zz.get("nav"):
            r = zz["nav"]
            box(r["x"], r["y"], r["w"], r["h"], fill=ink, text="Nav",
                size=8, color=RGBColor.from_string("FFFFFF"))
        if zz.get("header"):
            r = zz["header"]
            style = r.get("style", d["headerStyle"])
            fill = (RGBColor.from_string("FFFFFF") if style == "light"
                    else accent if style == "accent" else ink)
            fg = ink if style == "light" else RGBColor.from_string("FFFFFF")
            nav = " · ".join(r.get("nav") or [])
            box(r["x"], r["y"], r["w"], r["h"], fill=fill,
                outline=line if style == "light" else None,
                text=r.get("title", "Kopfband"), sub=nav, size=9, color=fg, bold=True)
        if zz.get("filter"):
            r = zz["filter"]
            mode = r.get("mode") or r.get("side") or "right"
            sl = ", ".join(x["name"] for x in (r.get("slicers") or []))
            box(r["x"], r["y"], r["w"], r["h"],
                fill=RGBColor.from_string("EDEFF2"), outline=line,
                text="%s (%s)" % (t["filter"], mode), sub=sl, size=8)
        if zz.get("footer"):
            r = zz["footer"]
            box(r["x"], r["y"], r["w"], r["h"], fill=page_bg, outline=line,
                text=zz["footer"].get("text", ""), size=7, color=ink_soft)
        for i, v in enumerate(page["visuals"], start=1):
            r = v.get("rect") or {}
            if not r:
                continue
            sub = (v.get("label") or v.get("kind", ""))
            eng = engine_label(v) if v.get("engine") != "native" else ""
            if eng and eng not in sub:
                sub += " · %s" % eng
            box(r["x"], r["y"], r["w"], r["h"], fill=tile_bg, outline=line,
                text="%s.%s  %s" % (page["index"], i, v.get("title", "")), sub=sub,
                size=9, bold=True)

    for page in nspec["pages"]:
        kicker = (page.get("question") or page.get("notes") or "")[:90]
        s = slide_frame("%s %s · %s" % (t["page"], page["index"], page["name"]), kicker)
        png = page_image(nspec, page, images)
        if png:
            cw = int(nspec["canvas"].get("width") or 1280)
            ch = int(nspec["canvas"].get("height") or 720)
            top = 1450000
            avail_w = SW - 2 * 700000
            avail_h = SH - top - 500000
            scale = min(avail_w / cw, avail_h / ch)
            w_emu, h_emu = int(cw * scale), int(ch * scale)
            s.shapes.add_picture(str(png), Emu(int((SW - w_emu) / 2)), Emu(top),
                                 width=Emu(w_emu), height=Emu(h_emu))
        else:
            wireframe(s, page)

        s = slide_frame("%s %s · %s — %s" % (t["page"], page["index"], page["name"],
                                             t["slide_tiles"]))
        if not page["visuals"]:
            textbox(s, Emu(457200), Emu(1400000), SW - Emu(914400), Emu(400000),
                    t["no_tiles"].strip("_"), size=14, color=ink_soft)
            continue
        rows = []
        for r_i, v in enumerate(page["visuals"], start=1):
            render = v.get("label") or v.get("kind", "")
            if v.get("scenario"):
                render += ", %s" % v["scenario"]
            eng = engine_label(v) if v.get("engine") != "native" else ""
            if eng and eng not in render:
                render += " · %s" % eng
            w = v.get("workshop") or {}
            note = " · ".join(x for x in [
                ("Text: %s" % v["content"]) if v.get("content") else "",
                v.get("notes") or "",
                ("→ %s" % v["link"]["pageName"]) if v.get("link") else ""] if x)
            title = v.get("title", "")
            if v.get("subtitle"):
                title += "\n%s" % v["subtitle"]
            rows.append(["%s.%s  %s" % (page["index"], r_i, title), render,
                         fields_summary(v, lang), analysis_summary(v, lang),
                         "%s / %s" % (PRIORITY[lang].get(w.get("priority"), "–"),
                                      STATUS[lang].get(w.get("status", "open"), "–")),
                         note or "–"])
        table(s, [t["th"][1], t["th"][2], t["th"][3], t["th"][4], "Prio / Status",
                  t["th"][7]], rows,
              [2500000, 1900000, 2700000, 1800000, 1300000,
               SW - Emu(914400) - 2500000 - 1900000 - 2700000 - 1800000 - 1300000])

    # ---------------------------------------------------------- Navigation
    s = slide_frame(t["nav"])
    items = []
    if header and header.get("nav"):
        items.append("%s: %s" % (t["nav_header"], " · ".join(header["nav"])))
    if z.get("nav"):
        items.append(t["nav_left"])
    for l in nspec["links"]:
        kind = (t["pagechange"] if l.get("kind") == "navigation"
                else t["drill"] + (" · %s" % l["drillField"] if l.get("drillField") else ""))
        items.append("„%s\" (%s) → „%s\": %s"
                     % (l["fromPage"], l["fromVisual"], l["toPage"], kind))
    if filt and (filt.get("collapsible") or (filt.get("mode") == "burger")):
        items.append(t["bookmarks"])
    if not items:
        items = [t["no_nav"]]
    bullets(s, items)

    # ---------------------------------------------------------- Steckbrief
    if nspec["fields"]:
        s = slide_frame(t["profile"])
        rows = [[f["ref"] + (" (neu)" if f.get("isNew") else ""),
                 f.get("alias") or "–", (f.get("description") or t["fill_in"])[:70],
                 f.get("unit") or f.get("formatString") or "–",
                 f.get("owner") or "–", "☑" if f.get("confirmed") else "☐"]
                for f in nspec["fields"][:12]]
        table(s, [t["profile_th"][0], t["profile_th"][1], t["profile_th"][2],
                  t["profile_th"][3], t["profile_th"][5], t["profile_th"][7]], rows,
              [2600000, 1800000, 3800000, 1200000, 1400000,
               SW - Emu(914400) - 2600000 - 1800000 - 3800000 - 1200000 - 1400000])
        if len(nspec["fields"]) > 12:
            textbox(s, Emu(457200), SH - Emu(700000), SW - Emu(914400), Emu(300000),
                    "… %d weitere Felder in WORKSHOP-DOKU.md"
                    % (len(nspec["fields"]) - 12), size=11, color=ink_soft)

    # ---------------------------------------------------------- Kennzahlen
    new = nspec["newFields"]
    s = slide_frame(t["slide_new"])
    if not new:
        textbox(s, Emu(457200), Emu(1400000), SW - Emu(914400), Emu(400000),
                t["no_new"], size=15, color=ink_soft)
    else:
        rows = [["%s.%s" % (f["table"], f["name"]),
                 t["measure"] if f.get("kind") == "measure" else t["dimension"],
                 f.get("description") or t["fill_in"], f.get("openQuestion") or "–"]
                for f in new]
        table(s, [t["new_th"][0], t["new_th"][1], t["new_th"][3], t["new_th"][8]], rows,
              [2600000, 1500000, 4000000,
               SW - Emu(914400) - 2600000 - 1500000 - 4000000], size=10)

    # ---------------------------------------------------------- Offene Punkte
    op = open_points(nspec, lang)
    s = slide_frame(t["open"])
    bullets(s, op[:10] or [t["no_open"]], size=14, gap=400000)

    # ---------------------------------------------------------- Naechste Schritte
    s = slide_frame(t["next"])
    steps = list(t["pptx_next"])
    if not any(v.get("engine") == "ck" for p in nspec["pages"] for v in p["visuals"]):
        steps[2] = t["theme_check"]
    s_items = steps
    bullets(s, s_items, size=15)

    target.parent.mkdir(parents=True, exist_ok=True)
    prs.save(str(target))
    return True, "%s  (%d Folien)" % (target, len(prs.slides))


# --------------------------------------------------------------------------- #
# main
# --------------------------------------------------------------------------- #
def main() -> int:
    p = argparse.ArgumentParser(
        description="MockupKitchen-Spec → Workshop-Doku (Markdown + PowerPoint)")
    p.add_argument("spec", help="Pfad zu mockup-spec.json")
    p.add_argument("--out", default=None,
                   help="Ausgabeordner (Default: Ordner der Spec)")
    p.add_argument("--docs", default=None,
                   help="vorhandene WORKSHOP-DOKU.md (Default: neben der Spec)")
    p.add_argument("--images", default=None,
                   help="Ordner mit page-<Index>-<Slug>.png (Default: neben der Spec)")
    p.add_argument("--lang", choices=("de", "en"), default=None,
                   help="Sprache der erzeugten Texte (Default: meta.lang, sonst de)")
    p.add_argument("--force-md", action="store_true",
                   help="WORKSHOP-DOKU.md auch dann schreiben, wenn sie schon existiert")
    p.add_argument("--no-pptx", action="store_true", help="nur Markdown erzeugen")
    opt = p.parse_args()

    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

    try:
        raw = load(opt.spec)
        nspec = upgrade(raw)
    except SpecError as e:
        print("Fehler: %s" % e, file=sys.stderr)
        return 2

    spec_path = Path(opt.spec).expanduser()
    lang = opt.lang or (nspec["meta"].get("lang") or "de")
    if lang not in TXT:
        lang = "de"
    out = Path(opt.out).expanduser() if opt.out else spec_path.parent
    out.mkdir(parents=True, exist_ok=True)
    images = Path(opt.images).expanduser() if opt.images else spec_path.parent

    suffix = "" if lang == "de" else ".en"
    md_path = (Path(opt.docs).expanduser() if opt.docs
               else (out / ("WORKSHOP-DOKU%s.md" % suffix)))
    if md_path.is_file() and not opt.force_md:
        print("WORKSHOP-DOKU%s.md vorhanden, bleibt unverändert: %s" % (suffix, md_path))
    else:
        md_path.write_text(build_docs_md(nspec, lang), encoding="utf-8")
        print("WORKSHOP-DOKU%s.md geschrieben: %s" % (suffix, md_path))

    found = [page_image(nspec, p, images) for p in nspec["pages"]]
    n_png = len([f for f in found if f])
    rc = 0
    if opt.no_pptx:
        print("PowerPoint übersprungen (--no-pptx).")
    else:
        ok, msg = build_pptx(nspec, out / ("WORKSHOP-DOKU%s.pptx" % suffix), lang, images)
        print(("PowerPoint: " if ok else "") + msg)
        if ok:
            print("Seitenbilder: %d von %d als PNG eingebettet%s"
                  % (n_png, len(nspec["pages"]),
                     "" if n_png else " (Wireframe aus Shapes gezeichnet)"))
        if not ok:
            rc = 1

    print("\nspecVersion %d (gelesen als v%d) · %d Seite(n) · %d Kacheln · "
          "%d neue Felder · %d offene Punkte · Sprache %s"
          % (nspec["sourceVersion"], nspec["version"], len(nspec["pages"]),
             sum(len(p["visuals"]) for p in nspec["pages"]),
             len(nspec["newFields"]), len(open_points(nspec, lang)), lang))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
