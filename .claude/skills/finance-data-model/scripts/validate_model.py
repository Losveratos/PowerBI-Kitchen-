#!/usr/bin/env python3
"""Prüft Kontendimension + Faktentabelle gegen den Datenvertrag der Visuals
"P&L Statement byDatenWG" und "ChartKitchen byDatenWG".

Aufruf:
    python3 -I validate_model.py <dim-konto.csv> <fakt-finanz.csv>
        [--kurse <kurse.csv>] [--cc EUR] [--kurs-multiplizieren]
        [--tol 0.05] [--year 2026] [--stock-mode auto|allStock|allFlow] [--ascii]

Bestand vs. Fluss (P&L-Visual ab 1.7): RowType-Token stock / bestand /
balance / stichtag / point (Stand am Periodenende) bzw. opening /
anfangsbestand / eröffnung / open / begin (Stand am Periodenanfang) und flow
(Fluss erzwingen), auch zusammen mit dem Zeilentyp in einer Zelle
("Account stock", "Formula; stock"). --stock-mode spiegelt statement.stockMode.

Variante A (nur Euro) / B (Fremdwährung) erkennt das Skript an einer
Währungsspalte (Currency/Waehrung) in den Fakten. Bei B sucht es ohne --kurse
eine *kurs*/*rate*/*fx*.csv neben der Faktentabelle.

Die Regeln spiegeln pnlByDatenWG/src/engine.ts (parseRowType, parseBool,
parseSign, rowsFromLevels, buildModel, parseFormula). Nur Standardbibliothek,
liest nur die übergebenen CSVs (bzw. die Kurstabelle daneben).

Exit-Code: 0 = kein ✗ · 1 = mindestens ein ✗ · 2 = Aufruf- oder Lesefehler.
"""
import argparse
import calendar
import csv
import io
import os
import re
import sys
from collections import OrderedDict, defaultdict

# ---------------------------------------------------------------- Ausgabe

SYM = {"ok": "✓", "warn": "⚠", "fail": "✗"}
SYM_ASCII = {"ok": "[OK]  ", "warn": "[WARN]", "fail": "[FAIL]"}


class Report:
    def __init__(self, ascii_only):
        self.sym = SYM_ASCII if ascii_only else SYM
        self.counts = {"ok": 0, "warn": 0, "fail": 0}
        self.lines = []

    def section(self, title):
        self.lines.append("")
        self.lines.append(title)

    def add(self, level, msg, details=None, limit=8):
        self.counts[level] += 1
        self.lines.append(f"  {self.sym[level]} {msg}")
        details = list(details or [])
        for d in details[:limit]:
            self.lines.append(f"      · {d}")
        if len(details) > limit:
            self.lines.append(f"      · … und {len(details) - limit} weitere")

    def text(self, line=""):
        self.lines.append(line)

    def render(self):
        return "\n".join(self.lines)


# ---------------------------------------------------------------- CSV lesen

def read_csv(path):
    raw = None
    for enc in ("utf-8-sig", "cp1252"):
        try:
            with open(path, encoding=enc, newline="") as f:
                raw = f.read()
            break
        except UnicodeDecodeError:
            continue
    if raw is None:
        raise ValueError(f"{path}: Kodierung nicht lesbar (UTF-8 oder Windows-1252 erwartet)")
    first = raw.splitlines()[0] if raw.strip() else ""
    delim = max((";", ",", "\t"), key=first.count)
    reader = csv.reader(io.StringIO(raw), delimiter=delim)
    rows = [r for r in reader]
    if not rows:
        raise ValueError(f"{path}: Datei ist leer")
    header = [h.strip() for h in rows[0]]
    out = []
    for i, r in enumerate(rows[1:], start=2):
        if not any(c.strip() for c in r):
            continue
        r = [c.strip() for c in r] + [""] * (len(header) - len(r))
        rec = {header[j]: r[j] for j in range(len(header))}
        rec["__line__"] = i
        if len(r) > len(header) and any(c for c in r[len(header):]):
            rec["__extra__"] = True
        out.append(rec)
    return header, out, delim


def norm(s):
    return re.sub(r"[^0-9a-z]", "", s.lower().replace("ä", "ae").replace("ö", "oe").replace("ü", "ue"))


def find_col(header, aliases):
    by = {norm(h): h for h in header}
    for a in aliases:
        if a in by:
            return by[a]
    return None


DIM_ALIASES = {
    "id": ["accountid", "kontoid", "kontonummer", "kontonr", "konto", "account"],
    "name": ["accountname", "kontoname", "kontobezeichnung", "bezeichnung", "name"],
    "parent": ["parentid", "parentaccountid", "parentkontoid", "elternid", "parent"],
    "sort": ["sortorder", "sortierung", "reihenfolge", "sort"],
    "rowtype": ["rowtype", "zeilentyp", "typ", "type"],
    "formula": ["formuladef", "formeldefinition", "formel", "formula"],
    "sign": ["signconvention", "rechenvorzeichen", "vorzeichen", "sign"],
    "disp": ["displayinvert", "anzeigeinvertieren"],
    "var": ["varianceinvert", "abweichungsfarbedrehen"],
    "comment": ["comment", "kommentar"],
    "unit": ["einheit", "unit", "mengeneinheit", "uom"],
}
FACT_ALIASES = {
    "id": DIM_ALIASES["id"],
    "date": ["datum", "date", "monatsende", "monatende", "stichtag"],
    "period": ["periode", "period", "monat", "month", "monatkey", "periodkey"],
    "scenario": ["szenario", "scenario", "version"],
    "value": ["wert", "value", "betrag", "amount"],
    "currency": ["currency", "waehrung", "curr", "belegwaehrung", "hauswaehrung", "lc", "currencycode"],
    "entity": ["gesellschaft", "entity", "company", "buchungskreis", "mandant", "bukrs"],
}
RATE_ALIASES = {
    "period": ["periode", "period", "datum", "date", "monatsende", "monat", "month"],
    "currency": FACT_ALIASES["currency"],
    "kind": ["kursart", "ratetype", "kurstyp", "art", "type"],
    "rate": ["kurs", "rate", "wert", "value", "fxrate"],
}
KIND = {"akt": "AKT", "ist": "AKT", "actual": "AKT", "aktuell": "AKT", "avg": "AKT",
        "bud": "BUD", "budget": "BUD", "plan": "BUD", "pl": "BUD",
        "vj": "VJ", "py": "VJ", "vorjahr": "VJ"}
# Kursart je Szenario im "berichteten" Bild: AC/FC zum aktuellen Kurs, PL zum Budgetkurs, PY zum Vorjahreskurs
SCEN_KIND = {"AC": "AKT", "FC": "AKT", "PL": "BUD", "PY": "VJ"}
MONEY_UNITS = {"", "eur", "teur", "keur", "meur", "chf", "usd", "gbp", "waehrung", "currency", "lc", "cc", "geld"}
WIDE_SCEN = {
    "ac": "AC", "ist": "AC", "py": "PY", "vj": "PY", "vorjahr": "PY",
    "pl": "PL", "plan": "PL", "bu": "PL", "budget": "PL", "fc": "FC", "forecast": "FC",
    "plfy": "PL_FY", "plgesamtjahr": "PL_FY", "fcfy": "FC_FY", "acfcfy": "FC_FY", "fcgesamtjahr": "FC_FY",
}
SERIES = ["AC", "PY", "PL", "FC"]
FY = ["PL_FY", "FC_FY"]
ALL_SCEN = SERIES + FY


def level_cols(header):
    found = []
    for h in header:
        m = re.fullmatch(r"(?:l|ebene|level)\s*_?\s*(\d+)", h.strip().lower())
        if m:
            found.append((int(m.group(1)), h))
    return [h for _, h in sorted(found)]


def parse_num(s):
    s = (s or "").strip().replace(" ", "").replace(" ", "")
    if s == "":
        return None
    if "," in s and "." in s:
        s = s.replace(".", "").replace(",", ".") if s.rfind(",") > s.rfind(".") else s.replace(",", "")
    elif "," in s:
        s = s.replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return "NaN"


# ---------------------------------------------------------------- engine.ts-Spiegel

STOCK_TOKENS = {"stock", "bestand", "balance", "stichtag", "point"}
OPENING_TOKENS = {"opening", "anfangsbestand", "eröffnung", "eroeffnung", "open", "begin"}
FLOW_TOKENS = {"flow", "fluss", "bewegung", "movement"}


def parse_row_info(raw):
    """engine.parseRowTypeInfo: (Zeilentyp, Bestand 'last'|'first'|None, Fluss-Token).
    Nur eine Zelle mit Bestands-/Fluss-Token wird in Wörter zerlegt (Trenner Komma,
    Semikolon, Leerzeichen, |) — jeder andere Wert wird wie vor 1.7 als Ganzes gelesen."""
    s = (raw or "").strip().lower()
    toks = [t for t in re.split(r"[\s,;|]+", s) if t]
    stock, flow, rest = None, False, []
    for t in toks:
        if t in STOCK_TOKENS:
            stock, flow = "last", False
        elif t in OPENING_TOKENS:
            stock, flow = "first", False
        elif t in FLOW_TOKENS:
            stock, flow = None, True
        else:
            rest.append(t)
    if len(rest) == len(toks):
        return parse_row_type(s), None, False
    rtype = parse_row_type(" ".join(rest))
    if rtype == "account":
        for t in rest:
            if parse_row_type(t) != "account":
                rtype = parse_row_type(t)
                break
    return rtype, stock, flow


def parse_row_type(raw):
    s = (raw or "").strip().lower()
    if s.startswith("sub") or s.startswith("zwischen") or s in ("sum", "summe"):
        return "subtotal"
    if s.startswith("form"):
        return "formula"
    if s in ("kpi", "ratio", "margin", "kennzahl", "marge", "quote"):
        return "kpi"
    if s.startswith("sep") or s.startswith("trenn") or s.startswith("leer"):
        return "separator"
    return "account"


KNOWN_ROWTYPES = {"account", "konto", "+", "-", "−", "", "subtotal", "zwischensumme", "sum", "summe",
                  "formula", "formel", "kpi", "ratio", "margin", "kennzahl", "marge", "quote",
                  "separator", "trenner", "leerzeile"}
TRUE_SET = {"true", "1", "yes", "ja", "j", "x", "wahr"}
FALSE_SET = {"false", "0", "no", "nein", "n", "falsch", ""}


def parse_bool(raw):
    """engine.parseBool; Zahlentext wird wie eine typisierte Zahlenspalte gelesen."""
    s = (raw or "").strip().lower()
    n = parse_num(s)
    if isinstance(n, float) and s not in TRUE_SET:
        return n != 0, True
    return s in TRUE_SET, (s in TRUE_SET or s in FALSE_SET)


def parse_sign(raw):
    s = (raw or "").strip()
    n = parse_num(s)
    if isinstance(n, float):
        return (-1 if n < 0 else 1), (abs(abs(n) - 1) < 1e-9)
    if s == "":
        return 1, False
    return (-1 if ("-" in s or "−" in s or s.lower().startswith("neg")) else 1), False


class FormulaError(Exception):
    pass


def parse_formula(src):
    pos = 0

    def skip():
        nonlocal pos
        while pos < len(src) and src[pos].isspace():
            pos += 1

    def peek():
        skip()
        return src[pos] if pos < len(src) else ""

    def primary():
        nonlocal pos
        skip()
        ch = src[pos] if pos < len(src) else ""
        if ch == "(":
            pos += 1
            inner = addsub()
            skip()
            if pos >= len(src) or src[pos] != ")":
                raise FormulaError("fehlende )")
            pos += 1
            return inner
        if ch == "[":
            end = src.find("]", pos)
            if end < 0:
                raise FormulaError("fehlende ]")
            ref = src[pos + 1:end].strip()
            pos = end + 1
            if ref == "":
                raise FormulaError("leere Referenz []")
            return ("ref", ref)
        if ch == "-":
            pos += 1
            return ("neg", primary())
        m = re.match(r"\d+(?:[.,]\d+)?", src[pos:])
        if m:
            pos += len(m.group(0))
            return ("num", float(m.group(0).replace(",", ".")))
        raise FormulaError(f'unerwartetes Zeichen "{ch}"' if ch else "Formel endet unerwartet")

    def muldiv():
        nonlocal pos
        left = primary()
        while peek() in ("*", "/"):
            op = src[pos]
            pos += 1
            left = ("bin", op, left, primary())
        return left

    def addsub():
        nonlocal pos
        left = muldiv()
        while peek() in ("+", "-"):
            op = src[pos]
            pos += 1
            left = ("bin", op, left, muldiv())
        return left

    ast = addsub()
    skip()
    if pos < len(src):
        raise FormulaError(f'überzähliger Text "{src[pos:]}"')
    return ast


def refs_of(ast, out):
    if ast[0] == "ref":
        out.append(ast[1])
    elif ast[0] == "neg":
        refs_of(ast[1], out)
    elif ast[0] == "bin":
        refs_of(ast[2], out)
        refs_of(ast[3], out)
    return out


# ---------------------------------------------------------------- Perioden

MONTH_STEM = {"jan": 1, "feb": 2, "mar": 3, "mrz": 3, "apr": 4, "mai": 5, "may": 5, "jun": 6,
              "jul": 7, "aug": 8, "sep": 9, "okt": 10, "oct": 10, "nov": 11, "dez": 12, "dec": 12}


def parse_period(raw):
    """-> (jahr|None, monat, tag|0) oder None. Deckt engine.parsePeriod plus TT.MM.JJJJ/JJJJMM ab."""
    s = (raw or "").strip()
    if not s:
        return None
    m = re.match(r"^(\d{4})[-/.](\d{1,2})(?:[-/.](\d{1,2}))?", s)
    if m:
        mo = int(m.group(2))
        return (int(m.group(1)), mo, int(m.group(3) or 0)) if 1 <= mo <= 12 else None
    m = re.match(r"^(\d{1,2})\.(\d{1,2})\.(\d{4})", s)
    if m:
        mo = int(m.group(2))
        return (int(m.group(3)), mo, int(m.group(1))) if 1 <= mo <= 12 else None
    m = re.fullmatch(r"(\d{4})(\d{2})", s)
    if m and 1 <= int(m.group(2)) <= 12:
        return (int(m.group(1)), int(m.group(2)), 0)
    if re.fullmatch(r"\d{1,2}", s) and 1 <= int(s) <= 12:
        return (None, int(s), 0)
    folded = s.lower().replace("ä", "a").replace("ö", "o").replace("ü", "u")
    y, mo = None, 0
    for tok in re.split(r"[^0-9a-z]+", folded):
        if not tok:
            continue
        if tok.isdigit():
            if len(tok) == 4 and y is None:
                y = int(tok)
            continue
        if mo == 0:
            mo = MONTH_STEM.get(tok) or MONTH_STEM.get(tok[:3]) or 0
    return (y, mo, 0) if mo else None


# ---------------------------------------------------------------- Modell

class Node:
    def __init__(self, nid, name, parent, sort, rtype, formula, sign, disp, var, synthetic=False, line=None):
        self.id, self.name, self.parent, self.sort = nid, name, parent, sort
        self.type, self.formula = rtype, formula
        self.sign, self.disp, self.var = sign, disp, var
        self.synthetic, self.line = synthetic, line
        self.children = []
        self.own = {}
        self.val = {}
        self.error = None
        self.unit, self.money = "", True
        self.stock = None  # 1.7 'last' | 'first' | None (Fluss)


def fmt(v, kpi=False):
    if v is None:
        return "—"
    return f"{v * 100:,.1f} %".replace(",", " ") if kpi else f"{v:,.1f}".replace(",", " ")


def main():
    ap = argparse.ArgumentParser(description="Validiert DimKonto + FaktFinanz für P&L Statement / ChartKitchen byDatenWG.")
    ap.add_argument("dim", help="CSV der Kontendimension")
    ap.add_argument("fact", help="CSV der Faktentabelle (breit: AC/PY/PL/FC[/PL_FY/FC_FY] · schmal: Szenario + Wert)")
    ap.add_argument("--tol", type=float, default=0.05, help="absolute Toleranz für Summen-Abgleiche (Dateneinheiten, Standard 0.05)")
    ap.add_argument("--year", type=int, default=None, help="Berichtsjahr für Stichprobe (Standard: letztes Jahr mit AC)")
    ap.add_argument("--kurse", default=None, help="CSV der Kurstabelle (Variante B). Ohne Angabe: *kurs*/*rate*/*fx*.csv neben der Faktentabelle")
    ap.add_argument("--cc", default="EUR", help="Konzern-/Berichtswährung (Standard EUR)")
    ap.add_argument("--kurs-multiplizieren", action="store_true",
                    help="Kurs = CC je 1 Fremdwährung (multiplizieren). Standard: Fremdwährung je 1 CC (EZB-Notierung, dividieren)")
    ap.add_argument("--stock-mode", default="auto", choices=["auto", "allStock", "allFlow"],
                    help="statement.stockMode des Visuals (1.7): auto = Token im RowType, allStock = jede Zeile Bestand "
                         "(Bilanz ohne Token-Spalte), allFlow = jede Zeile Fluss (Verhalten vor 1.7). Standard: auto")
    ap.add_argument("--ascii", action="store_true", help="[OK]/[WARN]/[FAIL] statt ✓/⚠/✗")
    a = ap.parse_args()

    if not a.ascii:
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except (AttributeError, ValueError):
            pass
    R = Report(a.ascii)
    tol = a.tol

    try:
        dh, drows, ddelim = read_csv(a.dim)
        fh, frows, fdelim = read_csv(a.fact)
    except (OSError, ValueError) as e:
        print(f"Fehler: {e}", file=sys.stderr)
        return 2

    dc = {k: find_col(dh, v) for k, v in DIM_ALIASES.items()}
    lv = level_cols(dh)
    has_parent = dc["parent"] is not None and any(r[dc["parent"]] for r in drows)
    mode = "parent" if has_parent else ("levels" if lv else None)

    R.text("Finance-Datenmodell · Validierung gegen den Datenvertrag (P&L Statement + ChartKitchen)")
    R.text(f"  Dimension: {a.dim} ({len(drows)} Zeilen, Trenner '{ddelim}', Modus: "
           + ("Parent-Child" if mode == "parent" else f"Ebenen {lv[0]}–{lv[-1]}" if mode == "levels" else "unbekannt") + ")")

    # ============================================================ [1] Spaltenvertrag
    R.section("[1] Spaltenvertrag DimKonto")
    if dc["id"] is None:
        R.add("fail", "Spalte AccountID fehlt — ohne Schlüssel keine Beziehung zur Faktentabelle")
        print(R.render())
        return 1
    if mode is None:
        R.add("fail", "Weder ParentID noch Ebenen-Spalten L1..Ln gefunden — das Visual kann keine Hierarchie bauen")
        print(R.render())
        return 1
    if has_parent and lv:
        R.add("warn", "ParentID und L1..Ln vorhanden — im Visual nur einen Modus binden (gebunden gewinnt Parent-Child)")
    if mode == "levels" and len(lv) > 8:
        R.add("fail", f"{len(lv)} Ebenen-Spalten — das Visual nimmt höchstens 8")
    missing = [k for k in ("sort", "rowtype", "sign", "disp", "var") if dc[k] is None]
    labels = {"sort": "SortOrder", "rowtype": "RowType", "sign": "SignConvention", "disp": "DisplayInvert", "var": "VarianceInvert"}
    if missing:
        R.add("warn", "Optionale Vertragsspalten fehlen: " + ", ".join(labels[k] for k in missing),
              ["ohne SortOrder: Datenreihenfolge", "ohne RowType: alle Zeilen = Account (reine Hierarchie, keine Formeln)",
               "ohne Vorzeichen-Trio: alles +1 / false / false"] if missing else None)
    else:
        R.add("ok", "Alle Vertragsspalten vorhanden (AccountID, " + ("ParentID" if mode == "parent" else "L1..Ln")
              + ", SortOrder, RowType, FormulaDef, Vorzeichen-Trio" + (", Comment" if dc["comment"] else "") + ")")
    if any(r.get("__extra__") for r in drows):
        R.add("fail", "Zeilen mit mehr Feldern als Spaltenköpfe — Trennzeichen im Text? (Text mit Trenner in Anführungszeichen setzen)",
              [f"Zeile {r['__line__']}" for r in drows if r.get("__extra__")])

    ids = [r[dc["id"]] for r in drows]
    empty_ids = [r["__line__"] for r in drows if not r[dc["id"]]]
    dup = sorted({i for i in ids if i and ids.count(i) > 1})
    if empty_ids:
        R.add("fail", f"{len(empty_ids)} Zeile(n) ohne AccountID", [f"Zeile {n}" for n in empty_ids])
    if dup:
        R.add("fail", f"{len(dup)} AccountID(s) doppelt — die Beziehung 1:* bricht, das Visual meldet 'duplicate id'", dup)
    if not empty_ids and not dup:
        R.add("ok", f"{len(ids)} AccountIDs, eindeutig und gefüllt")

    # ---- Zeilen lesen
    rows = []
    rt_raw_unknown, sign_odd, bool_odd = [], [], []
    for r in drows:
        rid = r[dc["id"]]
        if not rid:
            continue
        rt_raw = r[dc["rowtype"]] if dc["rowtype"] else ""
        rtype, stock_tok, flow_tok = parse_row_info(rt_raw)
        rest = [t for t in re.split(r"[\s,;|]+", rt_raw.strip().lower()) if t
                and t not in STOCK_TOKENS | OPENING_TOKENS | FLOW_TOKENS]
        known = rt_raw.strip().lower() in KNOWN_ROWTYPES or (
            (stock_tok or flow_tok) and all(t in KNOWN_ROWTYPES for t in rest))
        if not known:
            rt_raw_unknown.append(f"{rid}: '{rt_raw}' → {rtype.capitalize()}")
        sign, clean = parse_sign(r[dc["sign"]]) if dc["sign"] else (1, True)
        if not clean and dc["sign"]:
            sign_odd.append(f"{rid}: '{r[dc['sign']]}' → {sign:+d}")
        disp, k1 = parse_bool(r[dc["disp"]]) if dc["disp"] else (False, True)
        var, k2 = parse_bool(r[dc["var"]]) if dc["var"] else (False, True)
        if not k1:
            bool_odd.append(f"{rid}: DisplayInvert '{r[dc['disp']]}' → false")
        if not k2:
            bool_odd.append(f"{rid}: VarianceInvert '{r[dc['var']]}' → false")
        sort = parse_num(r[dc["sort"]]) if dc["sort"] else None
        rows.append({
            "id": rid, "line": r["__line__"], "rt_raw": rt_raw, "type": rtype, "stock_tok": stock_tok, "flow_tok": flow_tok,
            "formula": (r[dc["formula"]] if dc["formula"] else "").strip(),
            "sign": sign, "disp": disp, "var": var,
            "sort": sort if isinstance(sort, float) else None, "sort_raw": r[dc["sort"]] if dc["sort"] else "",
            "name": (r[dc["name"]] if dc["name"] else "").strip(),
            "parent": (r[dc["parent"]] if dc["parent"] else "").strip(),
            "levels": [r[c] for c in lv],
            "unit": (r[dc["unit"]] if dc["unit"] else "").strip(),
        })

    R.section("[2] Zeilentypen, Sortierung, Hierarchie")
    tcount = defaultdict(int)
    for x in rows:
        tcount[x["type"]] += 1
    R.add("ok", "Zeilentypen (wie das Visual sie liest): " + " · ".join(f"{t} {n}" for t, n in sorted(tcount.items())))
    if rt_raw_unknown:
        R.add("warn", "Unbekannte RowType-Werte — das Visual liest sie als Account", rt_raw_unknown)
    # 1.7 Bestand vs. Fluss — die Zeilen-Semantik, wie das Visual sie liest
    smode = a.stock_mode
    for x in rows:
        if smode == "allFlow" or x["type"] == "separator":
            x["stock"] = None
        elif smode == "allStock":
            x["stock"] = "first" if x["stock_tok"] == "first" else "last"
        else:
            x["stock"] = x["stock_tok"]
    n_stock = sum(1 for x in rows if x["stock"] == "last")
    n_open = sum(1 for x in rows if x["stock"] == "first")
    n_tok = sum(1 for x in rows if x["stock_tok"] or x["flow_tok"])
    if n_stock or n_open:
        R.add("ok", f"Bestand vs. Fluss (statement.stockMode = {smode}): {n_stock} Bestand (Stand am Periodenende)"
              + (f" · {n_open} Anfangsbestand (Stand am Periodenanfang)" if n_open else "")
              + f" · {len(rows) - n_stock - n_open} Fluss — YTD = Stand der letzten Periode, FY = FC-Endstand, Δ zum selben Stichtag")
    elif n_tok and smode == "allFlow":
        R.add("warn", f"{n_tok} Bestands-/Fluss-Token, aber --stock-mode allFlow: das Visual ignoriert sie (statement.stockMode)")
    minus_plus = [f"{x['id']} ('{x['rt_raw']}', SignConvention {x['sign']:+d})" for x in rows
                  if x["rt_raw"].strip() in ("-", "−") and x["sign"] == 1]
    if minus_plus:
        R.add("warn", "RowType '-' mit SignConvention +1: '-' ist nur ein Account-Etikett, das Vorzeichen kommt allein aus SignConvention",
              minus_plus)
    no_sort = [x["id"] for x in rows if x["sort"] is None]
    if dc["sort"] and no_sort:
        R.add("warn", f"{len(no_sort)} Zeile(n) ohne numerische SortOrder — Reihenfolge fällt auf die Datenreihenfolge zurück", no_sort)

    nodes = OrderedDict()
    synth_paths = {}
    if mode == "levels":
        gaps, collide = [], []
        leaf_paths = {}
        for x in rows:
            path = []
            ended = False
            for j, raw in enumerate(x["levels"]):
                v = (raw or "").strip()
                if ended:
                    if v and v != path[-1]:
                        gaps.append(f"{x['id']}: {lv[j]} = '{v}' wird ignoriert (Ebene davor leer oder wiederholt)")
                    continue
                if v == "" or (path and v == path[-1]):
                    ended = True
                    continue
                path.append(v)
            if not path:
                gaps.append(f"{x['id']}: alle Ebenen leer — Zeile fällt im Visual weg")
                continue
            x["path"] = path
            for d in range(1, len(path)):
                key = tuple(path[:d])
                if key not in synth_paths:
                    sid = "L:" + "¦".join(key)
                    synth_paths[key] = sid
                    nodes[sid] = Node(sid, key[-1], ("L:" + "¦".join(key[:-1])) if d > 1 else None, None,
                                      "subtotal", "", 1, False, False, synthetic=True)
            leaf_paths[x["id"]] = tuple(path)
        for x in rows:
            if "path" not in x:
                continue
            p = tuple(x["path"])
            parent = synth_paths.get(p[:-1]) if len(p) > 1 else None
            nodes[x["id"]] = Node(x["id"], x["name"] or p[-1], parent, x["sort"], x["type"], x["formula"],
                                  x["sign"], x["disp"], x["var"], line=x["line"])
        for x in rows:
            if "path" in x and tuple(x["path"]) in synth_paths:
                collide.append(f"{x['id']}: Pfad '{' › '.join(x['path'])}' ist zugleich Ebenen-Knoten — "
                               "Zwischensummen entstehen im Ebenen-Modus synthetisch; diese Zeile erzeugt eine zweite, gleichnamige Zeile")
        if gaps:
            R.add("warn", "Ebenen-Lücken (das Visual bricht den Pfad an der ersten leeren/wiederholten Ebene ab)", gaps)
        if collide:
            R.add("fail", "Konto auf dem Pfad eines Ebenen-Knotens", collide)
        depth = max((len(x.get("path", [])) for x in rows), default=0)
        ragged = sum(1 for x in rows if 0 < len(x.get("path", [])) < depth and x["type"] in ("account", "subtotal"))
        if not gaps and not collide:
            R.add("ok", f"Ebenen konsistent: {len(synth_paths)} synthetische Zwischensumme(n), Tiefe {depth}"
                  + (f", {ragged} ragged Konto/Konten (endet vor der letzten Ebene — erlaubt)" if ragged else ""))
        # Vererbung DisplayInvert / VarianceInvert auf synthetische Knoten (engine.rowsFromLevels)
        for n in nodes.values():
            if n.parent and n.parent in nodes:
                nodes[n.parent].children.append(n)
        for _ in range(8):
            changed = False
            for n in nodes.values():
                if not n.synthetic:
                    continue
                kids = [c for c in n.children if c.type in ("account", "subtotal")]
                if not kids:
                    continue
                kid_sorts = [c.sort for c in n.children if c.sort is not None]
                if kid_sorts and (n.sort is None or min(kid_sorts) < n.sort):
                    n.sort = min(kid_sorts)
                    changed = True
                if all(c.disp for c in kids) and not n.disp:
                    n.disp = changed = True
                if all(c.var for c in kids) and not n.var:
                    n.var = changed = True
            if not changed:
                break
    else:
        for x in rows:
            nodes[x["id"]] = Node(x["id"], x["name"] or x["id"], x["parent"] or None, x["sort"], x["type"], x["formula"],
                                  x["sign"], x["disp"], x["var"], line=x["line"])
        orphans = [f"{n.id} → Parent '{n.parent}' fehlt" for n in nodes.values() if n.parent and n.parent not in nodes]
        selfp = [n.id for n in nodes.values() if n.parent == n.id]
        for n in nodes.values():
            if n.parent == n.id:
                n.parent = None
            if n.parent and n.parent in nodes:
                nodes[n.parent].children.append(n)
        # Zyklen: Knoten, die von keiner Wurzel erreichbar sind
        reach = set()
        stack = [n for n in nodes.values() if not n.parent or n.parent not in nodes]
        while stack:
            n = stack.pop()
            if n.id in reach:
                continue
            reach.add(n.id)
            stack.extend(n.children)
        cyc = [n.id for n in nodes.values() if n.id not in reach]
        if orphans:
            R.add("fail", f"{len(orphans)} Waise(n) — landen im Visual rot unter 'Nicht zugeordnet'", orphans)
        if cyc:
            R.add("fail", f"{len(cyc)} Zeile(n) in einem Parent-Child-Zyklus", cyc)
        if selfp:
            R.add("warn", "ParentID = eigene AccountID — wird als Wurzel gelesen", selfp)
        posted_parents = [n.id for n in nodes.values() if n.type == "account" and n.children]
        if posted_parents:
            R.add("warn", "Account-Zeilen mit Kindern rechnen eigenen Wert + Kinder (bebuchbarer Knoten) — sonst RowType Subtotal",
                  posted_parents)
        empty_sub = [n.id for n in nodes.values() if n.type == "subtotal" and not n.children]
        if empty_sub:
            R.add("warn", "Subtotal ohne Kinder — zeigt nur eigene Fakten", empty_sub)
        if not (orphans or cyc):
            roots = [n for n in nodes.values() if not n.parent]
            R.add("ok", f"Parent-Child konsistent: {len(roots)} Wurzel(n), keine Waisen, keine Zyklen")

    # 1.7 Bestand vs. Fluss: die Zeilen-Semantik je Knoten (Vererbung wie im Visual: eine Summe ohne
    # Token ist Bestand, wenn alle beitragenden Kinder Bestände sind; Formeln nach ihren Operanden,
    # gemischt nach dem ersten Operanden — für die Stichprobe zählt nur die Aggregation der Konten)
    stock_of = {x["id"]: x["stock"] for x in rows}
    for n in nodes.values():
        n.stock = stock_of.get(n.id)
    for _ in range(8):
        for n in nodes.values():
            if n.synthetic and n.children and n.stock is None and a.stock_mode != "allFlow":
                kids = [c for c in n.children if c.type in ("account", "subtotal")]
                if kids and all(c.stock for c in kids):
                    n.stock = "first" if all(c.stock == "first" for c in kids) else "last"

    # Einheiten: Geld (EUR …) und Mengen (hl, Stk, FTE) dürfen sich in keiner Summe treffen
    unit_of = {x["id"]: x["unit"] for x in rows}
    for n in nodes.values():
        n.unit = unit_of.get(n.id, "")
        n.money = n.unit.lower() in MONEY_UNITS
    for _ in range(8):
        for n in nodes.values():
            if n.synthetic and n.children:
                us = {c.unit for c in n.children if c.type in ("account", "subtotal")}
                if len(us) == 1:
                    n.unit = us.pop()
                    n.money = n.unit.lower() in MONEY_UNITS
    mixed = []
    for n in nodes.values():
        kids = [c for c in n.children if c.type in ("account", "subtotal")]
        if kids and len({c.money for c in kids} | ({n.money} if not n.synthetic else set())) > 1:
            mixed.append(f"{n.name}: " + ", ".join(f"{c.name} [{c.unit or 'Geld'}]" for c in kids))
    qty = [n for n in nodes.values() if not n.synthetic and not n.money]
    if mixed:
        R.add("fail", "Geld und Mengen in derselben Summe — Mengenzeilen gehören in einen eigenen Block oder eine eigene Wurzel", mixed)
    if qty and not mixed:
        units = sorted({n.unit for n in qty})
        R.add("ok", f"{len(qty)} Mengenzeile(n) ({', '.join(units)}) getrennt vom Geld — im P&L-Visual per Visualfilter "
              "Einheit = EUR ausblenden (keine Zeilenformate dort), in ChartKitchen per rowFormats zeigen",
              [f"{n.id} {n.name}" for n in qty])

    excluded = [f"{n.id} ({n.type})" for n in nodes.values()
                if n.type in ("formula", "kpi", "separator") and any(c.type in ("account", "subtotal") for c in n.children)]
    if excluded:
        R.add("warn", "Kinder unter Formel-/KPI-/Trennzeilen gehen in keine Summe ein", excluded)
    dsort = defaultdict(list)
    for n in nodes.values():
        if n.sort is not None and not n.synthetic:
            dsort[(n.parent, n.sort)].append(n.id)
    dsorts = [f"{', '.join(v)} (SortOrder {k[1]:g})" for k, v in dsort.items() if len(v) > 1]
    if dsorts:
        R.add("warn", "Gleiche SortOrder unter demselben Elternknoten — Reihenfolge entscheidet dann der Name", dsorts)

    # Namen (Formelreferenzen lösen erst per ID, dann per eindeutigem Namen auf)
    by_name = defaultdict(list)
    for n in nodes.values():
        by_name[n.name].append(n.id)

    def resolve(ref):
        if ref in nodes and not ref.startswith("L:"):
            return nodes[ref], None
        hits = by_name.get(ref, [])
        if len(hits) == 1:
            return nodes[hits[0]], None
        return None, ("mehrdeutig (" + ", ".join(hits) + ")") if hits else "unbekannt"

    # ============================================================ [3] Formeln
    R.section("[3] Formeln (FormulaDef)")
    asts, graph, ferr, referenced, unit_kpi = {}, {}, [], set(), []
    for n in nodes.values():
        if n.type not in ("formula", "kpi"):
            continue
        if not n.formula:
            ferr.append(f"{n.id} ({n.name}): leere Formel")
            continue
        try:
            ast = parse_formula(n.formula)
        except FormulaError as e:
            ferr.append(f"{n.id}: '{n.formula}' — {e}")
            continue
        asts[n.id] = ast
        graph[n.id] = []
        for ref in refs_of(ast, []):
            tgt, why = resolve(ref)
            if tgt is None:
                ferr.append(f"{n.id}: Referenz [{ref}] {why}")
                continue
            referenced.add(tgt.id)
            if n.money and not tgt.money:
                (ferr if n.type == "formula" else unit_kpi).append(
                    f"{n.id}: [{ref}] ist eine Mengenzeile ({tgt.unit})"
                    + ("" if n.type == "formula" else " — das P&L-Visual zeigt KPI-Zeilen als %, Kennzahlen wie EUR/hl gehören in ChartKitchen"))
            if tgt.type == "separator":
                ferr.append(f"{n.id}: Referenz [{ref}] ist eine Trennzeile (immer leer)")
            if tgt.type in ("formula", "kpi"):
                graph[n.id].append(tgt.id)
    # Zirkel
    state, cycles = {}, []

    def dfs(u, trail):
        state[u] = 1
        for v in graph.get(u, []):
            if state.get(v) == 1:
                cyc = trail[trail.index(v):] + [v] if v in trail else [u, v]
                cycles.append(" → ".join(nodes[c].name for c in cyc))
            elif state.get(v) is None:
                dfs(v, trail + [v])
        state[u] = 2

    for u in graph:
        if state.get(u) is None:
            dfs(u, [u])
    for c in cycles:
        ferr.append(f"Zirkelbezug: {c} (das Visual zeigt '⚠ cycle')")
    ignored_f = [f"{n.id}: '{n.formula}'" for n in nodes.values() if n.formula and n.type not in ("formula", "kpi")]
    nf = sum(1 for n in nodes.values() if n.type in ("formula", "kpi"))
    if ferr:
        R.add("fail", f"{len(ferr)} Formelfehler", ferr)
    elif nf:
        chained = sum(1 for v in graph.values() if v)
        R.add("ok", f"{nf} Formel-/KPI-Zeilen parsen, alle Referenzen eindeutig, keine Zirkel"
              + (f" ({chained} bauen auf anderen Formeln auf)" if chained else ""))
    else:
        R.add("ok", "Keine Formel-/KPI-Zeilen (reine Hierarchie)")
    if ignored_f:
        R.add("warn", "FormulaDef auf Nicht-Formelzeilen wird ignoriert", ignored_f)
    if unit_kpi:
        R.add("warn", "KPI-Zeile rechnet mit einer Mengenzeile", unit_kpi)
    amb = [f"'{k}': {', '.join(v)}" for k, v in by_name.items() if len(v) > 1 and not any(i in referenced for i in v)]
    if amb:
        R.add("warn", "Doppelte Zeilennamen — als Formelreferenz und für 'Nach Spalte sortieren' (ChartKitchen) unbrauchbar", amb)

    # ============================================================ [4] Vorzeichen-Trio
    R.section("[4] Vorzeichen-Trio (SignConvention · DisplayInvert · VarianceInvert)")
    if sign_odd:
        R.add("warn", "SignConvention nicht als ±1 lesbar — das Visual interpretiert", sign_odd)
    if bool_odd:
        R.add("warn", "Unbekannte Wahrheitswerte — parseBool liest sie als false (erlaubt: true/1/yes/ja/j/x/wahr)", bool_odd)
    combo = defaultdict(list)
    scombo = defaultdict(list)  # 1.7 Bestände: eigene Regeln
    for x in rows:
        if x["type"] in ("account", "subtotal"):
            (scombo if x["stock"] else combo)[(x["sign"], x["disp"], x["var"])].append(x["id"])
    names = {(1, False, False): "Erlös/Ertrag", (-1, True, False): "Kosten, positiv gebucht (Standard)",
             (1, True, False): "Kosten, negativ gebucht", (1, False, True): "Kosten positiv ohne Vorzeichen / 'mehr ist schlecht'",
             (-1, False, False): "Kosten negativ angezeigt"}
    if combo:
        R.add("ok", "Kombinationen: " + " · ".join(
            f"{s:+d}·{str(d).lower()}·{str(v).lower()} ×{len(ids_)}" + (f" ({names[(s, d, v)]})" if (s, d, v) in names else "")
            for (s, d, v), ids_ in sorted(combo.items(), key=lambda kv: -len(kv[1]))))
    if scombo:
        # 1.7 Regel für Bestandszeilen: SignConvention nach Bilanzseite (Aktiva +1; Passiva −1, wenn die Quelle
        # Haben-Salden negativ liefert), DisplayInvert false, VarianceInvert nach Fachlogik (mehr Verbindlichkeiten,
        # Rückstellungen, Vorräte oder Forderungen = ungünstig → true). −1 · false · true ist hier KEIN Doppel-Dreh:
        # das −1 dreht nur das Vorzeichen der Haben-Salden, nicht die Bewertung von Kosten.
        snames = {(1, False, False): "Aktiva / Kasse", (1, False, True): "Aktiva, mehr ist ungünstig (Working Capital)",
                  (-1, False, False): "Passiva, mehr ist günstig (Eigenkapital)",
                  (-1, False, True): "Passiva, mehr ist ungünstig (Verbindlichkeiten, Rückstellungen)"}
        R.add("ok", "Bestandszeilen: " + " · ".join(
            f"{s:+d}·{str(d).lower()}·{str(v).lower()} ×{len(ids_)}" + (f" ({snames[(s, d, v)]})" if (s, d, v) in snames else "")
            for (s, d, v), ids_ in sorted(scombo.items(), key=lambda kv: -len(kv[1]))))
        sdisp = [f"{i} ({nodes[i].name})" for (s, d, v), l in scombo.items() if d for i in l if i in nodes]
        if sdisp:
            R.add("warn", "Bestandszeile mit DisplayInvert true: Bestände zeigen ihr Vorzeichen über SignConvention "
                  "(Bilanzseite), DisplayInvert bleibt false", sdisp)
    bad1 = [f"{i} ({nodes[i].name})" for (s, d, v), l in combo.items() if s == -1 and v for i in l if i in nodes]
    bad2 = [f"{i} ({nodes[i].name})" for (s, d, v), l in combo.items() if s == 1 and d and v for i in l if i in nodes]
    neg_shown = [f"{i} ({nodes[i].name})" for (s, d, v), l in combo.items() if s == -1 and not d and not v for i in l if i in nodes]
    if bad1:
        R.add("warn", "SignConvention -1 + VarianceInvert true: Bewertung doppelt gedreht — eine Kostenüberschreitung wird günstig gefärbt. "
              "Kostenzeile = -1 · true · false", bad1)
    if bad2:
        R.add("warn", "+1 · DisplayInvert true · VarianceInvert true: negativ gebuchte Kosten sind schon richtig bewertet, "
              "das Drehen färbt Überschreitungen günstig", bad2)
    if neg_shown:
        R.add("warn", "-1 ohne DisplayInvert: Kosten erscheinen mit Minus — nur so lassen, wenn das gewollt ist", neg_shown)
    dbl = [f"{n.id} ({n.name})" for n in nodes.values() if n.type == "subtotal" and not n.synthetic and n.sign == -1
           and n.children and all(c.sign == -1 for c in n.children if c.type in ("account", "subtotal"))]
    if dbl:
        R.add("warn", "Subtotal mit -1 über Kindern mit -1: doppelte Negation, der Block rechnet positiv", dbl)
    fsign = [f"{x['id']}" for x in rows if x["type"] in ("formula", "kpi") and x["sign"] == -1]
    if fsign:
        R.add("warn", "SignConvention -1 auf Formel-/KPI-Zeilen wirkt nicht (die Formel bestimmt das Vorzeichen)", fsign)
    if not (bad1 or bad2 or dbl):
        R.add("ok", "Keine doppelt gedrehte Bewertung")
    # 1.7 Bestände erscheinen positiv: das Vorzeichen der gelieferten Salden passt zur SignConvention
    stock_ids = {x["id"]: x for x in rows if x["stock"] and x["type"] in ("account", "subtotal")}

    # ============================================================ Fakten lesen
    fc = {k: find_col(fh, v) for k, v in FACT_ALIASES.items()}
    narrow = fc["scenario"] is not None and fc["value"] is not None
    wide_cols = {}
    if not narrow:
        for h in fh:
            s = WIDE_SCEN.get(norm(h))
            if s and s not in wide_cols.values():
                wide_cols[h] = s
    pcol = fc["date"] or fc["period"]
    R.text("")
    fx = fc["currency"] is not None
    R.text(f"  Fakten:    {a.fact} ({len(frows)} Zeilen, Trenner '{fdelim}', Format: "
           + ("schmal (Szenario + Wert)" if narrow else "breit (" + " ".join(wide_cols.values()) + ")") + ")")
    R.text("  Variante:  " + (f"B · Fremdwährung (Spalte '{fc['currency']}', Konzernwährung {a.cc})" if fx
                              else "A · nur Euro (keine Währungsspalte)"))

    R.section("[5] Fakten ↔ Dimension")
    if fc["id"] is None or pcol is None:
        R.add("fail", "Faktentabelle braucht AccountID und eine Perioden-Spalte (Datum/Periode)")
        print(R.render())
        return 1
    if not narrow and not wide_cols:
        R.add("fail", "Keine Szenario-Spalten erkannt (breit: AC/PY/PL/FC/PL_FY/FC_FY · schmal: Szenario + Wert)")
        print(R.render())
        return 1
    if "AC" not in (wide_cols.values() if not narrow else {"AC"}):
        R.add("fail", "Keine AC-Spalte — AC ist die Pflichtrolle des P&L-Visuals")

    facts = defaultdict(lambda: defaultdict(lambda: defaultdict(list)))  # id -> scen -> (y,m) -> [values]
    unknown_ids, bad_period, bad_num, unknown_scen = defaultdict(int), [], [], defaultdict(int)
    days = defaultdict(set)
    not_month_end, per_mismatch = [], []
    fact_ids_any = set()
    entries = []  # (id, szenario, jahr, monat, wert, währung)
    row_count = defaultdict(int)
    cur_by = defaultdict(set)   # (id, gesellschaft) -> {währung}
    cur_ent = defaultdict(set)  # gesellschaft -> {währung}
    no_cur, qty_cur = [], []
    for r in frows:
        rid = r[fc["id"]]
        p = parse_period(r[pcol])
        if p is None or p[0] is None:
            bad_period.append(f"Zeile {r['__line__']}: '{r[pcol]}'")
            continue
        y, m, d = p
        if d:
            days[(y, m)].add(d)
            if d != calendar.monthrange(y, m)[1]:
                not_month_end.append(f"Zeile {r['__line__']}: {r[pcol]}")
        if fc["date"] and fc["period"] and fc["period"] != pcol:
            p2 = parse_period(r[fc["period"]])
            if p2 is None or p2[:2] != (y, m):
                per_mismatch.append(f"Zeile {r['__line__']}: {r[pcol]} ≠ {r[fc['period']]}")
        fact_ids_any.add(rid)
        if rid not in nodes:
            unknown_ids[rid] += 1
        cur = r[fc["currency"]].strip().upper() if fx else a.cc.upper()
        ent = r[fc["entity"]].strip() if fc["entity"] else ""
        row_count[(rid, ent, y, m) if not narrow else (rid, ent, y, m, r[fc["scenario"]])] += 1
        if narrow:
            sc = WIDE_SCEN.get(norm(r[fc["scenario"]]))
            if sc is None:
                unknown_scen[r[fc["scenario"]]] += 1
                continue
            items = [(sc, r[fc["value"]])]
        else:
            items = [(sc, r[h]) for h, sc in wide_cols.items()]
        for sc, raw in items:
            v = parse_num(raw)
            if v == "NaN":
                bad_num.append(f"Zeile {r['__line__']} {sc}: '{raw}'")
                continue
            if v is not None:
                facts[rid][sc][(y, m)].append(v)
                entries.append((rid, sc, y, m, v, cur))
                node = nodes.get(rid)
                if fx and node is not None and node.money:
                    if not cur:
                        no_cur.append(f"Zeile {r['__line__']}: {rid} {sc}")
                    else:
                        cur_by[(rid, ent)].add(cur)
                        cur_ent[ent].add(cur)
                elif fx and node is not None and not node.money and cur:
                    qty_cur.append(f"Zeile {r['__line__']}: {rid} ({node.unit}) mit Währung {cur}")

    if unknown_ids:
        R.add("fail", f"{len(unknown_ids)} AccountID(s) der Fakten fehlen in der Dimension — diese Werte fallen im Visual weg",
              [f"{k} ({v} Zeilen)" for k, v in sorted(unknown_ids.items())])
    else:
        R.add("ok", "Jede AccountID der Fakten existiert in der Dimension")
    if bad_num:
        R.add("fail", "Nicht lesbare Zahlen", bad_num)
    if unknown_scen:
        R.add("warn", "Unbekannte Szenarien (erwartet AC/PY/PL/FC/PL_FY/FC_FY)", [f"'{k}' ×{v}" for k, v in unknown_scen.items()])
    on_formula = [i for i in facts if i in nodes and nodes[i].type in ("formula", "kpi", "separator")
                  and any(facts[i][s] for s in facts[i])]
    if on_formula:
        R.add("warn", "Werte auf Formel-/KPI-/Trennzeilen werden ignoriert (das Visual rechnet sie selbst)", on_formula)
    acc_nofact = [f"{n.id} ({n.name})" for n in nodes.values()
                  if not n.synthetic and n.type == "account" and not any(facts[n.id][s] for s in facts.get(n.id, {}))]
    if acc_nofact:
        R.add("warn", f"{len(acc_nofact)} Konto/Konten ohne Fakten — erscheinen nur mit 'Elemente ohne Daten anzeigen'", acc_nofact)
    calc_rows = [n for n in nodes.values() if not n.synthetic and n.type in ("formula", "kpi")]
    calc_nofact = [n.id for n in calc_rows if n.id not in fact_ids_any]
    if calc_rows:
        if calc_nofact:
            R.add("warn", "Formel-/KPI-Zeilen ohne Faktzeile: im Visual am Konto-Feld 'Elemente ohne Daten anzeigen' "
                  "aktivieren oder je Zeile eine Leer-Faktzeile anlegen — sonst fehlen EBITDA & Co.", calc_nofact)
        else:
            R.add("ok", f"Alle {len(calc_rows)} Formel-/KPI-Zeilen haben eine (Leer-)Faktzeile — in der Abnahme prüfen, dass sie erscheinen")

    # 1.7 Vorzeichen der Bestände: gerechnet (Fakt × SignConvention) überwiegend positiv
    neg_stock = []
    for rid, x in stock_ids.items():
        vals = [v for (_, _), vs in facts.get(rid, {}).get("AC", {}).items() for v in vs]
        if vals and sum(1 for v in vals if v * x["sign"] < 0) > len(vals) / 2:
            neg_stock.append(f"{rid} ({nodes[rid].name if rid in nodes else rid}): Fakten {'positiv' if vals[0] > 0 else 'negativ'}, "
                             f"SignConvention {x['sign']:+d} → erscheint negativ")
    if neg_stock:
        R.add("warn", "Bestandszeile erscheint negativ — SignConvention nach Bilanzseite: Aktiva +1; Passiva −1, "
              "wenn die Quelle Haben-Salden negativ liefert (Saldenliste), sonst +1", neg_stock)
    elif stock_ids:
        R.add("ok", f"{len(stock_ids)} Bestandszeile(n) erscheinen positiv (SignConvention passt zur Bilanzseite)")

    # ============================================================ [6] Perioden
    R.section("[6] Perioden")
    if bad_period:
        R.add("fail", f"{len(bad_period)} Perioden nicht lesbar (Jahr + Monat nötig: JJJJ-MM-TT, JJJJ-MM, TT.MM.JJJJ)", bad_period)
    multi_day = [f"{y}-{m:02d}: Tage {sorted(ds)}" for (y, m), ds in sorted(days.items()) if len(ds) > 1]
    if multi_day:
        R.add("fail", "Mehrere Tage je Monat — das Visual erwartet Monatsgranularität (auf Monatsende verdichten)", multi_day)
    if not_month_end:
        R.add("warn", f"{len(not_month_end)} Datum/Daten nicht auf Monatsende (Konvention dieses Modells)", not_month_end)
    elif days:
        R.add("ok", "Monatsgranularität, Datum = Monatsende")
    else:
        R.add("ok", "Monatsgranularität (Periodenschlüssel ohne Tag)")
    if per_mismatch:
        R.add("fail", "Datum und Periode widersprechen sich", per_mismatch)

    months_by = defaultdict(lambda: defaultdict(set))  # scen -> year -> {m}
    zero_ac = defaultdict(lambda: defaultdict(lambda: True))
    dup_rows = []
    for rid, sc_map in facts.items():
        for sc, per in sc_map.items():
            for (y, m), vs in per.items():
                months_by[sc][y].add(m)
                if sc == "AC":
                    zero_ac[y][m] = zero_ac[y][m] and all(v == 0 for v in vs)
    dup_rows = [f"{k[0]}{' / ' + k[1] if k[1] else ''} {k[2]}-{k[3]:02d}: {n} Zeilen" for k, n in row_count.items() if n > 1]
    years = sorted({y for sc in months_by for y in months_by[sc]})
    if len(years) > 1:
        R.add("warn", f"Mehrere Jahre in den Fakten ({', '.join(map(str, years))}) — der Bericht muss ein Berichtsjahr filtern, "
              "sonst summieren AC/PY/PL/FC über Jahre")
    gaps, short, ac_zero_tail = [], [], []
    for sc in SERIES:
        for y in years:
            ms = months_by[sc].get(y, set())
            if not ms:
                continue
            hole = [m for m in range(min(ms), max(ms) + 1) if m not in ms]
            if hole:
                gaps.append(f"{sc} {y}: Monate {', '.join(f'{m:02d}' for m in hole)} fehlen")
            if sc in ("PY", "PL", "FC") and (min(ms) > 1 or max(ms) < 12):
                short.append(f"{sc} {y}: {min(ms):02d}–{max(ms):02d}")
        if sc == "AC":
            for y in years:
                ms = sorted(months_by["AC"].get(y, set()))
                tail = []
                for m in reversed(ms):
                    if zero_ac[y][m]:
                        tail.append(m)
                    else:
                        break
                if tail:
                    ac_zero_tail.append(f"{y}: Monate {', '.join(f'{m:02d}' for m in sorted(tail))} haben AC = 0 statt leer")
    acc_gaps = []
    for rid, sc_map in facts.items():
        if rid not in nodes or nodes[rid].type not in ("account", "subtotal"):
            continue
        for sc in SERIES:
            for y in years:
                ms = {m for (yy, m) in sc_map.get(sc, {}) if yy == y}
                hole = [m for m in range(min(ms), max(ms) + 1) if m not in ms] if ms else []
                if hole:
                    acc_gaps.append(f"{rid} {sc} {y}: Monate {', '.join(f'{m:02d}' for m in hole)}")
    if acc_gaps:
        R.add("warn", "Lücken je Konto (Monat ohne Buchung — gewollt, oder fehlt eine Lieferung?)", acc_gaps)
    if gaps:
        R.add("fail", "Perioden-Lücken je Szenario", gaps)
    else:
        R.add("ok", "Perioden lückenlos je Szenario: " + " · ".join(
            f"{sc} {min(months_by[sc][y]):02d}–{max(months_by[sc][y]):02d}/{y}"
            for sc in SERIES for y in years if months_by[sc].get(y)))
    if short:
        R.add("warn", "PY/PL/FC decken nicht das ganze Jahr — der FY-Block (PY = Σ Vorjahr, PL, AC&FC) wird unvollständig", short)
    if ac_zero_tail:
        R.add("warn", "AC ist für offene Monate 0 statt leer — das Visual hält den letzten Monat mit AC-Daten für den Ist-Monat",
              ac_zero_tail)
    if dup_rows:
        R.add("warn", "Mehrere Faktzeilen je Konto und Monat (werden summiert — Granularität prüfen)", dup_rows)

    # FY-Skalare
    fy_err, fy_dev = [], []
    for rid, sc_map in facts.items():
        for sc in FY:
            per = sc_map.get(sc, {})
            for y in years:
                vals = {v for (yy, _), vs in per.items() if yy == y for v in vs}
                if len(vals) > 1:
                    fy_err.append(f"{rid} {sc} {y}: {len(vals)} verschiedene Werte ({', '.join(fmt(v) for v in sorted(vals)[:3])} …)")
    if fy_err:
        R.add("fail", "FY-Skalare nicht konstant je Konto und Jahr — das Visual nimmt den ersten Wert", fy_err)
    has_fy = any(sc_map.get(s) for sc_map in facts.values() for s in FY)
    if has_fy:
        for rid, sc_map in facts.items():
            for y in years:
                def tot(sc, months=None):
                    return sum(v for (yy, mm), vs in sc_map.get(sc, {}).items() if yy == y and (months is None or mm in months)
                               for v in vs)

                def first(sc):
                    for (yy, _), vs in sorted(sc_map.get(sc, {}).items()):
                        if yy == y and vs:
                            return vs[0]
                    return None
                plfy, fcfy = first("PL_FY"), first("FC_FY")
                st = nodes[rid].stock if rid in nodes else None
                ac_ms = months_by["AC"].get(y, set())
                if st:
                    # 1.7 Bestand: der FY-Wert ist der Stand am Jahresende (Anfangsbestand: am Jahresanfang)
                    mm = 12 if st == "last" else 1
                    last = max(ac_ms) if ac_ms else 0
                    if plfy is not None and len(months_by["PL"].get(y, ())) == 12 and abs(plfy - tot("PL", {mm})) > tol:
                        fy_dev.append(f"{rid} {y}: PL_FY {fmt(plfy)} ≠ PL-Stand {mm:02d} {fmt(tot('PL', {mm}))} (Bestand)")
                    if fcfy is not None and (sc_map.get("FC") or ac_ms):
                        src = "AC" if mm <= last else "FC"
                        if abs(fcfy - tot(src, {mm})) > tol:
                            fy_dev.append(f"{rid} {y}: FC_FY {fmt(fcfy)} ≠ {src}-Stand {mm:02d} {fmt(tot(src, {mm}))} (Bestand)")
                    continue
                if plfy is not None and len(months_by["PL"].get(y, ())) == 12 and abs(plfy - tot("PL")) > tol:
                    fy_dev.append(f"{rid} {y}: PL_FY {fmt(plfy)} ≠ Σ PL {fmt(tot('PL'))}")
                if fcfy is not None and ac_ms and sc_map.get("FC"):
                    last = max(ac_ms)
                    expect = tot("AC", set(range(1, last + 1))) + tot("FC", set(range(last + 1, 13)))
                    if abs(fcfy - expect) > tol:
                        fy_dev.append(f"{rid} {y}: FC_FY {fmt(fcfy)} ≠ AC 01–{last:02d} + FC {last + 1:02d}–12 = {fmt(expect)}")
        if fy_dev:
            R.add("warn", "FY-Skalare passen nicht zu den Monatswerten (PL_FY = Σ PL · FC_FY = AC bis Ist-Monat + FC Restjahr; "
                  "Bestand: der Stand am Jahresende, Anfangsbestand: am Jahresanfang)", fy_dev)
        elif not fy_err:
            R.add("ok", "FY-Skalare konstant je Konto, PL_FY = Σ PL und FC_FY = AC + FC-Restjahr"
                  + (" (Bestände: Stand am Jahresende, Anfangsbestände: am Jahresanfang)" if stock_ids else ""))

    # ============================================================ [7] Währung
    rates = {}  # (währung, jahr, monat, kursart) -> kurs
    cc = a.cc.upper()
    R.section("[7] Währung")
    if not fx:
        R.add("ok", f"Variante A · nur Euro: Werte direkt in {cc}, keine Kurstabelle, Measures = dünne Wrapper")
        if a.kurse:
            R.add("warn", f"--kurse angegeben, aber die Fakten haben keine Währungsspalte — Kurstabelle wird ignoriert")
    else:
        kpath = a.kurse
        if not kpath:
            fdir = os.path.dirname(os.path.abspath(a.fact))
            cands = sorted(f for f in os.listdir(fdir) if f.lower().endswith(".csv")
                           and re.search(r"kurs|rate|fx", f.lower())
                           and os.path.abspath(os.path.join(fdir, f)) not in (os.path.abspath(a.fact), os.path.abspath(a.dim)))
            kpath = os.path.join(fdir, cands[0]) if cands else None
        currencies = sorted({c for v in cur_by.values() for c in v})
        if no_cur:
            R.add("fail", f"{len(no_cur)} Geld-Werte ohne Währung — Umrechnung unmöglich", no_cur)
        if qty_cur:
            R.add("warn", "Mengenzeilen mit Währung — Mengen werden nie umgerechnet, Währung leer lassen", qty_cur)
        multi = [f"{k[0]}{' / ' + k[1] if k[1] else ''}: {', '.join(sorted(v))}" for k, v in sorted(cur_by.items()) if len(v) > 1]
        if multi:
            R.add("fail", "Mischwährung je Konto" + ("" if fc["entity"] else " ohne Kennzeichnung (Gesellschaft-Spalte fehlt)")
                  + " — eine Währung je Konto und Gesellschaft", multi)
        ent_multi = [f"{e}: {', '.join(sorted(v))}" for e, v in cur_ent.items() if e and len(v) > 1]
        if ent_multi:
            R.add("warn", "Gesellschaft bucht in mehreren Währungen — Hauswährung prüfen", ent_multi)
        if not multi and not no_cur:
            per_cur = defaultdict(int)
            for (rid, _), v in cur_by.items():
                per_cur[next(iter(v))] += 1
            R.add("ok", "Eine Währung je Konto: " + " · ".join(f"{c} {n} Konten" for c, n in sorted(per_cur.items())))
        if not kpath or not os.path.exists(kpath):
            R.add("fail", "Keine Kurstabelle gefunden — mit --kurse angeben (Periode · Currency · Kursart · Kurs)")
        else:
            try:
                kh, krows, _ = read_csv(kpath)
            except (OSError, ValueError) as e:
                kh, krows = [], []
                R.add("fail", f"Kurstabelle nicht lesbar: {e}")
            kc = {k: find_col(kh, v) for k, v in RATE_ALIASES.items()}
            R.text(f"  Kurse:     {kpath} ({len(krows)} Zeilen)")
            if krows and None in kc.values():
                R.add("fail", "Kurstabelle braucht die Spalten Periode, Currency, Kursart, Kurs")
            elif krows:
                bad_k, unk_kind, dup_k = [], defaultdict(int), []
                for r in krows:
                    p = parse_period(r[kc["period"]])
                    kind = KIND.get(norm(r[kc["kind"]]))
                    v = parse_num(r[kc["rate"]])
                    if kind is None:
                        unk_kind[r[kc["kind"]]] += 1
                        continue
                    if p is None or p[0] is None or not isinstance(v, float) or v <= 0:
                        bad_k.append(f"Zeile {r['__line__']}: {r[kc['period']]} / {r[kc['rate']]}")
                        continue
                    key = (r[kc["currency"]].strip().upper(), p[0], p[1], kind)
                    if key in rates:
                        dup_k.append(f"{key[0]} {key[1]}-{key[2]:02d} {kind}")
                    rates[key] = v
                if bad_k:
                    R.add("fail", "Kurse nicht lesbar oder ≤ 0", bad_k)
                if dup_k:
                    R.add("fail", "Doppelte Kurse (Periode × Währung × Kursart)", dup_k)
                if unk_kind:
                    R.add("warn", "Unbekannte Kursarten (erwartet AKT · BUD · VJ)", [f"'{k}' ×{n}" for k, n in unk_kind.items()])
                fmonths = sorted({(e[2], e[3]) for e in entries})
                need = [c for c in currencies if c != cc]
                missing, missing_vj = [], []
                has_py = any(e[1] == "PY" for e in entries)
                for c in need:
                    for kind in ("AKT", "BUD"):
                        gap = [f"{y}-{m:02d}" for y, m in fmonths if (c, y, m, kind) not in rates]
                        if gap:
                            missing.append(f"{c} {kind}: {', '.join(gap[:6])}{' …' if len(gap) > 6 else ''}")
                    gap = [f"{y}-{m:02d}" for y, m in fmonths if (c, y, m, "VJ") not in rates]
                    if has_py and gap:
                        missing_vj.append(f"{c}: {len(gap)} Monate")
                if missing:
                    R.add("fail", "Kurse fehlen — jede Fakten-Währung braucht für jede Periode einen aktuellen (AKT) und einen Budget-Kurs (BUD)", missing)
                elif need:
                    R.add("ok", f"Kurse vollständig: {', '.join(need)} × {len(fmonths)} Perioden × AKT/BUD")
                if missing_vj:
                    R.add("warn", "Kein Vorjahreskurs (VJ) — PY wird zum aktuellen Kurs umgerechnet (= konstante Kurse). Gewollt?", missing_vj)
                cc_bad = sorted({f"{k[3]} {k[1]}-{k[2]:02d}: {v:g}" for k, v in rates.items() if k[0] == cc and abs(v - 1) > 1e-9})
                if cc_bad:
                    R.add("fail", f"Kurs der Konzernwährung {cc} ≠ 1", cc_bad)
                bud_var = []
                for c in need:
                    for y in sorted({k[1] for k in rates if k[0] == c}):
                        vals = {v for k, v in rates.items() if k[0] == c and k[1] == y and k[3] == "BUD"}
                        if len(vals) > 1:
                            bud_var.append(f"{c} {y}: {len(vals)} verschiedene Budgetkurse")
                if bud_var:
                    R.add("warn", "Budgetkurs schwankt im Jahr — üblich ist ein fixer Kurs je Planjahr", bud_var)
                quote = "CC je 1 Fremdwährung (multiplizieren)" if a.kurs_multiplizieren else f"Fremdwährung je 1 {cc} (dividieren)"
                R.add("ok", f"Kursnotierung angenommen: {quote} · Kursart je Szenario: AC/FC → AKT, PL → BUD, PY → VJ; "
                      "FX-bereinigt: AC → BUD")

    def conv(rid, sc, y, m, v, cur, kind=None):
        node = nodes.get(rid)
        if not fx or node is None or not node.money or not cur or cur == cc:
            return v
        kind = kind or SCEN_KIND.get(sc, "AKT")
        k = rates.get((cur, y, m, kind)) or (rates.get((cur, y, m, "AKT")) if kind == "VJ" else None)
        if not k:
            return None
        return v * k if a.kurs_multiplizieren else v / k

    # ============================================================ [8] Summen-Stichprobe
    R.section("[8] Summen-Stichprobe (rechnet wie das Visual)")
    ac_years = sorted(months_by["AC"].keys())
    year = a.year or (ac_years[-1] if ac_years else (years[-1] if years else None))
    if year is None:
        R.add("fail", "Keine Werte — Stichprobe nicht möglich")
        print(R.render())
        print(f"\nErgebnis: {R.counts['fail']} {R.sym['fail']} · {R.counts['warn']} {R.sym['warn']} · {R.counts['ok']} {R.sym['ok']}")
        return 1
    last = max(months_by["AC"].get(year, {0}))
    window = set(range(1, last + 1)) if last else set(range(1, 13))

    fy_cols = {e[1] for e in entries if e[1] in FY}
    derive_fy = fx or not fy_cols
    if fx and fy_cols:
        R.add("warn", "FY-Spalten in Fremdwährung lassen sich nicht sauber umrechnen — FY in Variante B als Measure "
              "aus den umgerechneten Monatswerten bilden (Stichprobe rechnet so)")
    any_fc = any(e[1] == "FC" and e[2] == year for e in entries)
    own = defaultdict(dict)

    def add(rid, key, v):
        if v is not None:
            own[rid][key] = own[rid].get(key, 0.0) + v

    def setv(rid, key, v):
        if v is not None:
            own[rid][key] = v

    for rid, sc, y, m, v, cur in sorted(entries, key=lambda e: (e[2], e[3])):
        if y != year:
            continue
        if sc in FY:
            if not derive_fy and sc not in own[rid]:
                own[rid][sc] = v
            continue
        cv = conv(rid, sc, y, m, v, cur)
        st = nodes[rid].stock if rid in nodes else None
        if st:
            # 1.7 Bestand: der Stand zum Stichtag statt der Summe der Monate — YTD am letzten Monat mit AC
            # (Anfangsbestand: am ersten Monat des Fensters), FY am Jahresende (bzw. am Jahresanfang)
            at = max(window) if st == "last" else min(window)
            fy_m = 12 if st == "last" else 1
            if m == at:
                setv(rid, sc, cv)
                if sc == "AC" and fx:
                    setv(rid, "AC_BUD", conv(rid, sc, y, m, v, cur, "BUD"))
            if sc == "PY" and m == fy_m:
                setv(rid, "PY_FY", cv)
            if derive_fy and m == fy_m:
                if sc == "PL":
                    setv(rid, "PL_FY", cv)
                if any_fc and ((sc == "AC" and m <= last) or (sc == "FC" and m > last)):
                    setv(rid, "FC_FY", cv)
            continue
        if m in window:
            add(rid, sc, cv)
            if sc == "AC" and fx:
                add(rid, "AC_BUD", conv(rid, sc, y, m, v, cur, "BUD"))
        if sc == "PY":
            add(rid, "PY_FY", cv)
        if derive_fy:
            if sc == "PL":
                add(rid, "PL_FY", cv)
            if any_fc and ((sc == "AC" and m <= last) or (sc == "FC" and m > last)):
                add(rid, "FC_FY", cv)
    for n in nodes.values():
        n.own = dict(own.get(n.id, {}))
    scen = SERIES + ["PY_FY"] + FY + (["AC_BUD"] if fx else [])

    def contributes(n):
        return n.type in ("account", "subtotal")

    def sort_key(n):
        return (n.sort if n.sort is not None else float("inf"), n.name)

    roots = sorted([n for n in nodes.values() if not n.parent or n.parent not in nodes], key=sort_key)
    for n in nodes.values():
        n.children.sort(key=sort_key)

    explicit = []

    def sum_node(n):
        for c in n.children:
            sum_node(c)
        if not contributes(n):
            return
        for sc in scen:
            kid = [c.val.get(sc) for c in n.children if contributes(c) and c.val.get(sc) is not None]
            ks = sum(kid) if kid else None
            own = n.own.get(sc)
            if n.type == "subtotal":
                base = ks if ks is not None else own
                n.val[sc] = None if base is None else base * n.sign
                if ks is not None and own is not None and sc in ("AC", "PL"):
                    explicit.append((n, sc, own, ks))
            else:
                acc = own * n.sign if own is not None else None
                if ks is not None:
                    acc = (acc or 0) + ks
                n.val[sc] = acc

    for r in roots:
        sum_node(r)

    done, visiting = set(), set()

    def ev(ast, owner, sc):
        k = ast[0]
        if k == "num":
            return ast[1]
        if k == "neg":
            v = ev(ast[1], owner, sc)
            return None if v is None else -v
        if k == "ref":
            tgt, _ = resolve(ast[1])
            if tgt is None:
                owner.error = "ref"
                return None
            eval_node(tgt)
            if tgt.error:
                owner.error = owner.error or "ref"
                return None
            return tgt.val.get(sc)
        lv_, rv = ev(ast[2], owner, sc), ev(ast[3], owner, sc)
        if lv_ is None or rv is None:
            return None
        return {"+": lv_ + rv, "-": lv_ - rv, "*": lv_ * rv, "/": (lv_ / rv) if rv else None}[ast[1]]

    def eval_node(n):
        if n.type not in ("formula", "kpi") or n.id in done:
            return
        if n.id in visiting:
            n.error = "cycle"
            return
        visiting.add(n.id)
        if n.id not in asts:
            n.error = "parse"
        else:
            for sc in scen:
                n.val[sc] = ev(asts[n.id], n, sc)
        visiting.discard(n.id)
        done.add(n.id)
        if n.error:
            n.val = {}

    for n in nodes.values():
        eval_node(n)

    # (a) explizite Zwischensummen in den Fakten gegen ihre Kinder
    if explicit:
        bad = []
        for n, sc, own, ks in explicit:
            if abs(own - ks) > tol and abs(own + ks) > tol:
                bad.append(f"{n.id} ({n.name}) {sc}: gebucht {fmt(own)} · Σ Kinder {fmt(ks)} (das Visual zeigt die Kindersumme)")
        if bad:
            R.add("warn", "Gebuchte Zwischensummen weichen von der Kindersumme ab", bad)
        else:
            R.add("ok", f"{len(explicit)} gebuchte Zwischensummen-Werte = Σ Kinder")
    else:
        nsub = sum(1 for n in nodes.values() if n.type == "subtotal" and n.children)
        R.add("ok", f"Keine Zwischensummen in den Fakten gebucht — {nsub} Zwischensumme(n) entstehen im Visual aus den Kindern")

    # 1.7 Bilanz: zwei Bestands-Wurzeln (Aktiva, Passiva) müssen zum Stichtag gleich sein
    sroots = [n for n in roots if n.stock and n.type in ("account", "subtotal") and n.val]
    if len(sroots) == 2 and all(n.stock == "last" for n in sroots):
        bad_bal = [f"{sc}: {sroots[0].name} {fmt(sroots[0].val.get(sc))} ≠ {sroots[1].name} {fmt(sroots[1].val.get(sc))}"
                   for sc in ("AC", "PY", "PL", "FC") if sroots[0].val.get(sc) is not None and sroots[1].val.get(sc) is not None
                   and abs(sroots[0].val[sc] - sroots[1].val[sc]) > tol]
        if bad_bal:
            R.add("warn", "Bilanz nicht ausgeglichen (zwei Bestands-Wurzeln zum Stichtag)", bad_bal)
        else:
            R.add("ok", f"Bilanz ausgeglichen: {sroots[0].name} = {sroots[1].name} zum Stichtag (AC/PY/PL/FC)")

    # (b) Staffelform: Ergebniszeile = laufende Summe aller Konten davor (Voraussetzung für das ChartKitchen-DAX-Muster)
    order = []

    def walk(ns, factor):
        for n in ns:
            order.append((n, factor))
            walk(n.children, factor * (n.sign if n.type == "subtotal" else 1))

    walk(roots, 1)
    run = defaultdict(float)
    stair_bad, stair_n = [], 0
    for n, factor in order:
        if n.type == "account" and not n.children and n.money:
            for sc in ("AC", "PL"):
                if n.val.get(sc) is not None:
                    run[sc] += n.val[sc] * factor
        elif n.type == "formula" and n.val:
            stair_n += 1
            for sc in ("AC", "PL"):
                v = n.val.get(sc)
                if v is not None and abs(v - run[sc]) > tol:
                    stair_bad.append(f"{n.name} {sc}: Formel {fmt(v)} · laufende Summe {fmt(run[sc])}")
                    break
    if stair_n:
        if stair_bad:
            R.add("warn", "Keine reine Staffelform — für ChartKitchen-Wasserfälle die Summenzeilen per eigenem Measure "
                  "oder 'formulaRows' liefern (das P&L-Visual betrifft das nicht)", stair_bad)
        else:
            R.add("ok", f"Staffelform: alle {stair_n} Formelzeilen = laufende Summe der Konten davor "
                  "(ChartKitchen-Summenzeilen per DAX-Muster möglich)")

    # (c) Kennzahlen-Tabelle zum Gegenrechnen mit dem Quellsystem
    shown = [n for n, _ in order if n.type != "separator" and (n.parent is None or n.parent not in nodes)]
    big = max((abs(v) for n in shown if n.type != "kpi" for v in n.val.values() if v is not None), default=0)
    scale, sname = (1e6, "Mio.") if big >= 1e8 else (1e3, "Tsd.") if big >= 1e5 else (1, "")
    if fx:
        cols = [("AC", "AC"), ("AC@BUD", "AC_BUD"), ("PL", "PL"), ("ΔPL", "d:AC:PL"), ("ΔPL@BUD", "d:AC_BUD:PL"),
                ("PY", "PY"), ("PL FY", "PL_FY"), ("AC&FC FY", "FC_FY")]
    else:
        cols = [("AC", "AC"), ("PY", "PY"), ("PL", "PL"), ("ΔPL", "d:AC:PL"), ("PY FY", "PY_FY"), ("PL FY", "PL_FY"),
                ("AC&FC FY", "FC_FY")]
    R.text("")
    if any(n.stock for n in nodes.values()):
        R.text("  ·B = Bestand: Stand zum Stichtag (YTD = Monat " + f"{last:02d}" + ", FY = Dezember) · ·A = Anfangsbestand (Stand am Jahresanfang)")
    R.text(f"  Stichprobe {year}: YTD 01–{last:02d} (letzter Monat mit AC) · FY = Gesamtjahr · Werte wie angezeigt"
           + f", in {sname + ' ' if sname else ''}{cc}"
           + (" (AC/FC zum AKT-, PL zum BUD-, PY zum VJ-Kurs; @BUD = zum Budgetkurs, FX-bereinigt)" if fx else ""))
    if derive_fy:
        R.text("  FY-Spalten aus den Monatswerten abgeleitet (PL FY = Σ PL · AC&FC FY = AC bis Ist-Monat + FC Restjahr)")
    hdr = f"    {'Zeile':<30}" + "".join(f"{h:>11}" for h, _ in cols)
    R.text(hdr)
    R.text("    " + "─" * (len(hdr) - 4))
    for n in shown:
        kpi = n.type == "kpi"
        flip = -1 if (n.disp and not kpi) else 1
        cells = []
        for _, key in cols:
            if key.startswith("d:"):
                _, x, y_ = key.split(":")
                if n.val.get(x) is None or n.val.get(y_) is None:
                    cells.append("—")
                elif kpi:
                    cells.append(f"{(n.val[x] - n.val[y_]) * 100:+.1f} pp")
                else:
                    cells.append(f"{(n.val[x] - n.val[y_]) * flip / scale:+,.1f}".replace(",", " "))
            else:
                v = n.val.get(key)
                cells.append(fmt(None if v is None else v * flip / (1 if kpi else scale), kpi))
        label = ("= " if n.type == "formula" else "  " if kpi else "") + n.name
        if n.stock:
            mark = " ·B" if n.stock == "last" else " ·A"
            label = label[:29 - len(mark)] + mark
        R.text(f"    {label[:29]:<30}" + "".join(f"{c:>11}" for c in cells))
    errs = [n.id for n in nodes.values() if n.error]
    if errs:
        R.add("fail", "Zeilen mit Rechenfehler (siehe [3])", errs)

    print(R.render())
    c = R.counts
    print(f"\nErgebnis: {c['fail']} {R.sym['fail'].strip()} · {c['warn']} {R.sym['warn'].strip()} · {c['ok']} {R.sym['ok'].strip()}"
          + ("  — Datenvertrag erfüllt" if c["fail"] == 0 else "  — vor dem Binden beheben"))
    return 1 if c["fail"] else 0


if __name__ == "__main__":
    sys.exit(main())
