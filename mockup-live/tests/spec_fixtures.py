"""Spec-Bausteine fuer die Runner-Tests.

Alle Felder existieren im Modell von PBI-IBCS-Testbed (per `te list` geprueft):
_Measures.{AC, PY, PL, Umsatz, Kosten, Marge}, DimRegion.Region,
DimProduct.{Product, Category}, DimDate.{Year, MonthName}.
Ausnahme mit Absicht: `_Measures.Zauberzahl` (fehlt im Modell) fuer den
Isolations-Test.
"""
from __future__ import annotations

import copy

ANALYSIS = {"polarity": "higher", "polarityAuto": True, "deltaBasis": None,
            "deltaBasisAuto": True, "deltaKind": ["abs", "rel"], "unit": None,
            "displayUnits": None, "decimals": None, "sort": None, "topN": None,
            "timeGrain": None, "cumulative": False, "scaleGroup": None,
            "message": None, "smallMultiples": None, "fieldParam": None}

FIELD_META = {
    "_Measures.Umsatz": ("_Measures", "Umsatz", "measure"),
    "_Measures.Kosten": ("_Measures", "Kosten", "measure"),
    "_Measures.AC": ("_Measures", "AC", "measure"),
    "_Measures.PY": ("_Measures", "PY", "measure"),
    "_Measures.PL": ("_Measures", "PL", "measure"),
    "FactActuals.Amount": ("FactActuals", "Amount", "column"),
    "_Measures.Zauberzahl": ("_Measures", "Zauberzahl", "measure"),
    "DimRegion.Region": ("DimRegion", "Region", "column"),
    "DimProduct.Category": ("DimProduct", "Category", "column"),
    "DimDate.MonthName": ("DimDate", "MonthName", "column"),
    "DimDate.Year": ("DimDate", "Year", "column"),
    "DimDate.Date": ("DimDate", "Date", "column"),
    "DimDate.Nixda": ("DimDate", "Nixda", "column"),
    "DimProduct.Product": ("DimProduct", "Product", "column"),
}

GANTT_GUID = "dataKitchenGanttD7C41F0A93E24B6BA1F3C5E8A20D9B44"


def fref(ref: str, **extra) -> dict:
    table, name, kind = FIELD_META[ref]
    d = {"table": table, "name": name, "kind": kind, "ref": ref, "isNew": False}
    d.update(extra)
    return d


def bucket(ref: str) -> dict:
    return {"ref": ref, "kind": FIELD_META[ref][2], "isNew": False}


def card(vid, page, title, measure, x, y, w=440, h=180, **kw) -> dict:
    return _visual(vid, page, "card", "card", title, x, y, w, h,
                   {"Values": [bucket(measure)]}, {"indicator": [fref(measure)]}, **kw)


def column(vid, page, title, cat, measure, x, y, w=700, h=420, **kw) -> dict:
    return _visual(vid, page, "ncolumn", "clusteredColumnChart", title, x, y, w, h,
                   {"Category": [bucket(cat)], "Y": [bucket(measure)]},
                   {"category": [fref(cat)], "ac": [fref(measure)]}, **kw)


def bar(vid, page, title, cat, measure, x, y, w=700, h=420, **kw) -> dict:
    return _visual(vid, page, "nbar", "clusteredBarChart", title, x, y, w, h,
                   {"Category": [bucket(cat)], "Y": [bucket(measure)]},
                   {"category": [fref(cat)], "ac": [fref(measure)]}, **kw)


def line(vid, page, title, cat, measure, x, y, w=700, h=420, **kw) -> dict:
    return _visual(vid, page, "nline", "lineChart", title, x, y, w, h,
                   {"Category": [bucket(cat)], "Y": [bucket(measure)]},
                   {"category": [fref(cat)], "ac": [fref(measure)]}, **kw)


def gantt(vid, page, title, task, start, x, y, w=700, h=300, **kw) -> dict:
    """Custom Visual dataKitchenGantt (engine custom)."""
    v = _visual(vid, page, "gantt", None, title, x, y, w, h, {},
                {"category": [fref(task)], "start": [fref(start)]}, **kw)
    v["engine"] = "custom"
    v["native"] = None
    v["customVisual"] = {"name": "dataKitchenGantt", "guid": GANTT_GUID,
                         "buckets": {"task": [bucket(task)], "start": [bucket(start)]}}
    return v


def ck_kpi(vid, page, title, measure, x, y, w=320, h=180, **kw) -> dict:
    """KPI-Kachel (engine ck). Ab Konverter 0.5.5 macht mockup_spec.upgrade() daraus das
    Custom Visual ibcsKpiCard (engine custom, engineSource ck)."""
    v = _visual(vid, page, "kpi", "card", title, x, y, w, h,
                {"Values": [bucket(measure)]}, {"indicator": [fref(measure)]}, **kw)
    v.update({"engine": "ck", "chartKitchenType": "kpi", "chartKitchenMode": "cards"})
    return v


def ck_columns(vid, page, title, cat, measure, x, y, w=320, h=180, **kw) -> dict:
    """ChartKitchen-Säulen (engine ck) ohne Referenz: category + ac. Natives Ersatzvisual
    clusteredColumnChart. (Bis Konverter 0.5.4 stand hier ck_kpi; kpi ist seit 0.5.5 das
    Custom Visual ibcsKpiCard, siehe ck_kpi.)"""
    v = _visual(vid, page, "columns", "clusteredColumnChart", title, x, y, w, h,
                {"Category": [bucket(cat)], "Y": [bucket(measure)]},
                {"category": [fref(cat)], "ac": [fref(measure)]}, **kw)
    v.update({"engine": "ck", "chartKitchenType": "columns", "chartKitchenMode": None,
              "scenario": "AC"})
    return v


def ck_bars(vid, page, title, cat, measure, ref, x, y, w=620, h=380, **kw) -> dict:
    """ChartKitchen-Balken (Struktur): category + ac + ref (ein Feld oder Liste),
    Szenario AC/PL."""
    refs = ref if isinstance(ref, list) else [ref]
    v = _visual(vid, page, "bars", "clusteredBarChart", title, x, y, w, h,
                {"Category": [bucket(cat)], "Y": [bucket(measure)]},
                {"category": [fref(cat)], "ac": [fref(measure)],
                 "ref": [fref(r) for r in refs]}, **kw)
    v.update({"engine": "ck", "chartKitchenType": "bars", "chartKitchenMode": None,
              "scenario": "AC/PL"})
    return v


def ck_varint(vid, page, title, cat, measure, ref, x, y, w=620, h=380, **kw) -> dict:
    """ChartKitchen integrierte Abweichung (Zeit), kein natives Ersatzvisual."""
    v = _visual(vid, page, "varint", None, title, x, y, w, h, {},
                {"category": [fref(cat)], "ac": [fref(measure)], "ref": [fref(ref)]}, **kw)
    v.update({"engine": "ck", "chartKitchenType": "varint", "chartKitchenMode": None,
              "scenario": "AC/PL", "native": None})
    return v


def text_tile(vid, page, title, content, x, y, w=440, h=120, **kw) -> dict:
    v = _visual(vid, page, "text", "textbox", title, x, y, w, h, {}, {}, **kw)
    v["content"] = content
    return v


def _visual(vid, page, kind, ntype, title, x, y, w, h, buckets, roles,
            stable=None, pbir=None) -> dict:
    v = {"id": "mk_" + vid, "stableId": stable or vid, "slug": title.replace(" ", "_"),
         "page": page, "kind": kind, "label": kind, "engine": "native",
         "chartKitchenType": None, "chartKitchenMode": None,
         "native": {"type": ntype, "buckets": buckets}, "customVisual": None,
         "title": title, "subtitle": "", "content": "", "scenario": None,
         "analysis": copy.deepcopy(ANALYSIS),
         "workshop": {"priority": None, "status": "open", "openQuestion": False},
         "typography": None,
         "interaction": {"drillDown": False, "crossFilter": True, "drillThrough": None},
         "rect": {"x": x, "y": y, "w": w, "h": h}, "roles": roles, "notes": "",
         "link": None, "warnings": []}
    if pbir:
        v["pbir"] = pbir
    return v


def base_spec(spec_hash="h1") -> dict:
    """Zwei Seiten, Kopfband ohne Nav, keine Filter-/Fusszone (schnell)."""
    p1, p2 = "Übersicht", "Detail"
    pages = [
        {"id": "pg1", "index": 1, "name": p1, "question": "Wie laeuft der Umsatz?",
         "notes": "", "contentRect": {"x": 24, "y": 96, "w": 1872, "h": 960},
         "layoutTree": None,
         "visuals": [
             card("kpi1", p1, "Umsatz", "_Measures.Umsatz", 24, 96),
             card("kpi2", p1, "Kosten", "_Measures.Kosten", 488, 96),
             column("col1", p1, "Umsatz je Region", "DimRegion.Region",
                    "_Measures.Umsatz", 24, 300),
         ]},
        {"id": "pg2", "index": 2, "name": p2, "question": "Wie entwickelt sich AC?",
         "notes": "", "contentRect": {"x": 24, "y": 96, "w": 1872, "h": 960},
         "layoutTree": None,
         "visuals": [
             line("lin1", p2, "AC je Monat", "DimDate.MonthName", "_Measures.AC", 24, 96),
         ]},
    ]
    used = sorted({f["ref"] for p in pages for v in p["visuals"]
                   for fl in v["roles"].values() for f in fl})
    fields = [fref(r, description="", formatString="#,##0", alias="", confirmed=False,
                   owner="", source="", target="", unit="", note="") for r in used]
    return {
        "meta": {"tool": "MockupKitchen byDatenWG", "version": "0.6.0", "specVersion": 3,
                 "specHash": spec_hash, "name": "Live-Testfall", "lang": "de",
                 "exportedAt": "2026-09-28T12:00:00.000Z", "skill": "mockup-to-powerbi"},
        "report": {"name": "Live-Testfall", "audience": "Test", "purpose": "Runner-Tests",
                   "decision": "", "participants": "", "version": "0.6.0",
                   "dataDate": ""},
        "canvas": {"width": 1920, "height": 1080, "preset": "1920x1080", "uiScale": 1.5},
        "spacing": {"margin": 24, "gutter": 24, "tilePadding": 18},
        "design": {"cornerRadius": 6, "tileStyle": "border", "pageBackground": "#F4F4F1",
                   "tileBackground": "#FFFFFF", "headerStyle": "dark",
                   "accent": "#C25A2D", "variancePalette": "teal",
                   "varianceColors": {"good": "#1E8F9E", "bad": "#D64541"},
                   "colors": {"pageBackground": "#F4F4F1", "tileBackground": "#FFFFFF",
                              "ink": "#0F1E2E", "headerBackground": "#0F1E2E",
                              "headerInk": "#FFFFFF"},
                   "darkMode": False, "fontScale": 1.5},
        "zones": {
            "header": {"x": 0, "y": 0, "w": 1920, "h": 72, "style": "dark",
                       "logoPos": "none", "title": "Live-Testfall", "subtitle": "",
                       "nav": [], "navOn": False, "navPosition": "header",
                       "navAuto": False, "burger": False},
            "content": {"x": 24, "y": 96, "w": 1872, "h": 960},
        },
        "pages": pages,
        "links": [],
        "model": {"source": "PBI-IBCS-Testbed", "tables": ["_Measures", "DimRegion",
                                                          "DimDate", "DimProduct"],
                  "usedFields": fields},
        "fields": fields,
        "newFields": [],
        "issues": [],
        "warnings": [],
    }


def find_visual(spec: dict, stable: str) -> dict:
    for p in spec["pages"]:
        for v in p["visuals"]:
            if v.get("stableId") == stable:
                return v
    raise KeyError(stable)
