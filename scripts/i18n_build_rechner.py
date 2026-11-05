#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Macht aus dem deutschen Visual-Standards-Rechner und seiner frueheren
englischen Schwesterdatei EINE Datei mit Sprachumschalter.

Warum dieses Werkzeug ueberhaupt existiert
------------------------------------------
Bis v0.21 gab es zwei Dateien: visual-standards-rechner.html (deutsch, die
Quelle) und visual-standards-calculator.html (englisch, aus uebersetzten
Fragmenten zusammengesetzt, siehe das alte scripts/i18n-build.js). Zwei
Dateien heissen zwei Pflegeorte und ein Zeilenraster, das bei jeder Aenderung
verrutscht.

Dieses Skript nutzt aus, dass die beiden Fassungen Token fuer Token
deckungsgleich sind - identischer Code, nur andere Zeichenketten. Es richtet
sie mit einem kleinen JS-Lexer aus und gewinnt daraus

  * das Woerterbuch deutsch -> englisch (belegt aus der bestehenden
    Uebersetzung, nicht neu erfunden) und
  * eine deutsche Quelle, in der jede uebersetzbare Textstelle in i18n(...)
    bzw. i18nT`...` steht.

Ergebnis ist eine Datei, die beide Sprachen traegt. Die deutsche Fassung bleibt
die Quelle; fehlt ein Woerterbuch-Eintrag, erscheint deutscher Text - sichtbar,
aber nie kaputt.

EINMALWERKZEUG. Nach der Umstellung wird das Woerterbuch im Rechner selbst
gepflegt (Block I18N_EN am Anfang der Datei). scripts/i18n-check.js meldet,
was fehlt. Dieses Skript bleibt im Baum, damit die Umstellung nachvollziehbar
und wiederholbar ist.

Aufruf:  python scripts/i18n_build_rechner.py <englische-fassung.html>
         (die englische Fassung steckt in Commit 6ae6aef:
          git show 6ae6aef:visual-standards-calculator.html > en.html)
"""
import io
import json
import os
import re
import sys
import difflib
from collections import Counter, defaultdict

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DE_PATH = os.path.join(REPO, "visual-standards-rechner.html")

TMPLSEP = "\u0001"          # verbindet die statischen Stuecke eines Templates
FN_STR = "i18n"             # Name der Uebersetzungsfunktion im Rechner
FN_TMPL = "i18nT"           # Name des Template-Tags
ATTRS = ("placeholder", "title", "aria-label", "alt")

bericht = []


def log(*a):
    bericht.append(" ".join(str(x) for x in a))


# ======================================================================
#  1. JS-Lexer: genau so viel, wie fuer die Ausrichtung noetig ist
# ======================================================================
class Tok(object):
    __slots__ = ("kind", "text", "start", "end", "parts", "exprs")

    def __init__(self, kind, text, start, end, parts=None, exprs=None):
        self.kind, self.text, self.start, self.end = kind, text, start, end
        self.parts, self.exprs = parts, exprs


_REGEX_PREV = set("(,=:[!&|?{};+-*%~^<>") | {"\n"}


def _prev_sig(src, i):
    j = i - 1
    while j >= 0 and src[j] in " \t\r\n":
        j -= 1
    return src[j] if j >= 0 else "\n"


def _skip_quoted(src, k, n):
    """ueberspringt eine Zeichenkette ab k (src[k] ist das Anfuehrungszeichen)"""
    q = src[k]
    k += 1
    while k < n:
        if src[k] == "\\":
            k += 2
            continue
        if src[k] == q:
            return k + 1
        k += 1
    return k


def lex(src):
    toks, i, n, code_start = [], 0, len(src), 0

    def flush(upto):
        if upto > code_start:
            toks.append(Tok("code", src[code_start:upto], code_start, upto))

    while i < n:
        c = src[i]
        if c == "/" and i + 1 < n and src[i + 1] == "/":
            flush(i)
            j = src.find("\n", i)
            j = n if j < 0 else j
            toks.append(Tok("lc", src[i:j], i, j))
            i = code_start = j
            continue
        if c == "/" and i + 1 < n and src[i + 1] == "*":
            flush(i)
            j = src.find("*/", i + 2)
            j = n if j < 0 else j + 2
            toks.append(Tok("bc", src[i:j], i, j))
            i = code_start = j
            continue
        if c == "/":
            if _prev_sig(src, i) in _REGEX_PREV:
                j, incls, ok = i + 1, False, False
                while j < n:
                    d = src[j]
                    if d == "\\":
                        j += 2
                        continue
                    if d == "\n":
                        break
                    if incls:
                        if d == "]":
                            incls = False
                    elif d == "[":
                        incls = True
                    elif d == "/":
                        ok = True
                        j += 1
                        while j < n and src[j].isalpha():
                            j += 1
                        break
                    j += 1
                if ok:
                    flush(i)
                    toks.append(Tok("regex", src[i:j], i, j))
                    i = code_start = j
                    continue
            i += 1
            continue
        if c in "'\"":
            flush(i)
            j = _skip_quoted(src, i, n)
            toks.append(Tok("str", src[i:j], i, j))
            i = code_start = j
            continue
        if c == "`":
            flush(i)
            j = i + 1
            parts, exprs, cur = [], [], []
            while j < n:
                d = src[j]
                if d == "\\":
                    cur.append(src[j:j + 2])
                    j += 2
                    continue
                if d == "`":
                    j += 1
                    break
                if d == "$" and j + 1 < n and src[j + 1] == "{":
                    parts.append("".join(cur))
                    cur = []
                    depth, k = 1, j + 2
                    estart = k
                    while k < n:
                        e = src[k]
                        if e in "'\"`":
                            k = _skip_quoted(src, k, n)
                            continue
                        if e == "{":
                            depth += 1
                        elif e == "}":
                            depth -= 1
                            if depth == 0:
                                break
                        k += 1
                    exprs.append(src[estart:k])
                    j = k + 1
                    continue
                cur.append(d)
                j += 1
            parts.append("".join(cur))
            toks.append(Tok("tmpl", src[i:j], i, j, parts=parts, exprs=exprs))
            i = code_start = j
            continue
        i += 1
    flush(n)
    return toks


# ======================================================================
#  2. Escape-Folgen aufloesen: der Schluessel im Woerterbuch ist der Text,
#     den die Funktion zur Laufzeit sieht, nicht der Quelltext.
# ======================================================================
_ESC = {"n": "\n", "r": "\r", "t": "\t", "b": "\b", "f": "\f", "v": "\v", "0": "\0"}


def cook(s):
    out, i, n = [], 0, len(s)
    while i < n:
        c = s[i]
        if c != "\\":
            out.append(c)
            i += 1
            continue
        if i + 1 >= n:
            out.append(c)
            break
        d = s[i + 1]
        if d == "u":
            if i + 2 < n and s[i + 2] == "{":
                j = s.index("}", i + 3)
                out.append(chr(int(s[i + 3:j], 16)))
                i = j + 1
            else:
                out.append(chr(int(s[i + 2:i + 6], 16)))
                i += 6
            continue
        if d == "x":
            out.append(chr(int(s[i + 2:i + 4], 16)))
            i += 4
            continue
        if d == "\n":
            i += 2
            continue
        out.append(_ESC.get(d, d))
        i += 2
    return "".join(out)


# ======================================================================
#  3. Ausrichtung
# ======================================================================
IGN = ("lc", "bc")


def sig(t):
    if t.kind == "code":
        return re.sub(r"\s+", "", t.text)
    if t.kind == "str":
        return "@STR"
    if t.kind == "tmpl":
        return "@TMPL%d" % len(t.parts)
    return "@" + t.kind + t.text


def align(a, b):
    a = [t for t in a if t.kind not in IGN]
    b = [t for t in b if t.kind not in IGN]
    sm = difflib.SequenceMatcher(None, [sig(t) for t in a], [sig(t) for t in b], autojunk=False)
    pairs, breaks = [], []
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            for k in range(i2 - i1):
                pairs.append((a[i1 + k], b[j1 + k]))
        else:
            breaks.append((tag, a[i1:i2], b[j1:j2]))
    return pairs, breaks


HAT_BUCHSTABEN = re.compile(r"[A-Za-zÄÖÜäöüß]")


def unsicher(key, votes):
    """Schluessel, die als globaler Eintrag Schaden anrichten: Satzbruchstuecke
    ohne eigene Bedeutung (' ', ')', ' €', Plural-Endungen) und alles mit
    mehreren Uebersetzungen. Sie bekommen einen Kontext-Schluessel je Fundstelle."""
    if len(votes) > 1:
        return "mehrdeutig"
    if not HAT_BUCHSTABEN.search(key):
        return "ohne Buchstaben"
    if len(key.strip()) <= 3:
        return "zu kurz"
    return None


# ======================================================================
#  4. Hauptlauf
# ======================================================================
def js_region(src):
    m = re.search(r"\n<script>\n", src)
    a = m.end()
    return a, src.index("\n</script>", a)


def body_region(src):
    a = src.index("<body>") + len("<body>")
    return a, src.index("\n<script>\n", a)


def main(en_path):
    DE = io.open(DE_PATH, encoding="utf-8").read()
    EN = io.open(en_path, encoding="utf-8").read()

    # ---------------------------------------------------------- JS
    da, db = js_region(DE)
    ea, eb = js_region(EN)
    dejs, enjs = DE[da:db], EN[ea:eb]

    def jsline(pos):
        return DE.count("\n", 0, da + pos) + 1

    pairs, breaks = align(lex(dejs), lex(enjs))
    log("Token-Paare ausgerichtet: %d, Bruchstellen: %d" % (len(pairs), len(breaks)))

    str_votes, tmpl_votes = defaultdict(Counter), defaultdict(Counter)
    for x, y in pairs:
        if x.kind == "str":
            d, e = cook(x.text[1:-1]), cook(y.text[1:-1])
            if d != e:
                str_votes[d][e] += 1
        elif x.kind == "tmpl":
            if len(x.parts) != len(y.parts):
                log("TEMPLATE Form ungleich, Zeile %d - bleibt deutsch" % jsline(x.start))
                continue
            if x.parts != y.parts:
                tmpl_votes[TMPLSEP.join(x.parts)][TMPLSEP.join(cook(p) for p in y.parts)] += 1
            # Einschuebe pruefen: dort steckt Text, den die Ausrichtung nicht sieht
            for de_e, en_e in zip(x.exprs, y.exprs):
                if re.sub(r"\s+", "", de_e) != re.sub(r"\s+", "", en_e):
                    log("TEMPLATE Einschub unterschiedlich, Zeile %d" % jsline(x.start))
                    log("    DE %r" % de_e[:150])
                    log("    EN %r" % en_e[:150])

    log("")
    log("=== Schluessel, die nicht global gelten duerfen ===")
    STR, STR_UNSAFE, TMPL = {}, {}, {}
    for k, c in str_votes.items():
        grund = unsicher(k, c)
        if grund:
            STR_UNSAFE[k] = grund
            log("  (%-14s) %r -> %s" % (grund, k[:60], [v[:50] for v in c]))
        else:
            STR[k] = c.most_common(1)[0][0]
    for k, c in tmpl_votes.items():
        if len(c) > 1:
            log("  TEMPLATE mehrdeutig, bleibt deutsch: %r" % k[:60])
        else:
            TMPL[k] = c.most_common(1)[0][0]

    # ---- Quelle umschreiben -------------------------------------------
    COMPARE = re.compile(r"(===|!==|==|!=|\bcase\b|\.includes\(|\.indexOf\(|\bin\b)\s*$")
    COMPARE_AFTER = re.compile(r"^\s*(===|!==|==|!=)")
    DEF_RX = re.compile(r"(?:function\s+([A-Za-z_$][\w$]*)"
                        r"|(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=)")
    defs = [(m.start(), m.group(1) or m.group(2)) for m in DEF_RX.finditer(dejs)]

    def kontext(pos):
        lo, hi = 0, len(defs)
        while lo < hi:
            mid = (lo + hi) // 2
            if defs[mid][0] <= pos:
                lo = mid + 1
            else:
                hi = mid
        return defs[lo - 1][1] if lo else "top"

    ctr, CTX, edits = Counter(), {}, []
    stat = Counter()
    for x, y in pairs:
        if x.kind == "str":
            raw, en = cook(x.text[1:-1]), cook(y.text[1:-1])
            if raw not in STR and raw not in STR_UNSAFE:
                continue
            vor = dejs[max(0, x.start - 24):x.start].rstrip()
            nach = dejs[x.end:x.end + 8]
            if nach.lstrip()[:1] == ":" and vor[-1:] in "{,":
                stat["uebersprungen: Objektschluessel"] += 1
                log("UEBERSPRUNGEN Objektschluessel Zeile %d %r" % (jsline(x.start), raw[:50]))
                continue
            if COMPARE.search(vor) or COMPARE_AFTER.match(nach):
                stat["uebersprungen: Vergleich"] += 1
                log("UEBERSPRUNGEN Vergleich        Zeile %d %r" % (jsline(x.start), raw[:50]))
                continue
            if raw in STR_UNSAFE:
                name = kontext(x.start)
                ctr[name] += 1
                k = "%s#%d" % (name, ctr[name])
                CTX[k] = en
                edits.append((x.start, x.end, "%s(%s,'%s')" % (FN_STR, x.text, k)))
                stat["Kontext-Schluessel"] += 1
            else:
                edits.append((x.start, x.end, "%s(%s)" % (FN_STR, x.text)))
                stat["globale Fundstellen"] += 1
        elif x.kind == "tmpl":
            if TMPLSEP.join(x.parts) in TMPL:
                edits.append((x.start, x.start, FN_TMPL))
                stat["Templates"] += 1

    newjs = dejs
    for s, e, txt in sorted(edits, key=lambda z: z[0], reverse=True):
        newjs = newjs[:s] + txt + newjs[e:]

    log("")
    log("=== JS ===")
    log("globale Schluessel: %d" % len(STR))
    log("Kontext-Schluessel: %d" % len(CTX))
    log("Templates:          %d" % len(TMPL))
    for k in sorted(stat):
        log("%-30s %d" % (k, stat[k]))

    log("")
    log("=== Bruchstellen im JS (von Hand nachzuziehen) ===")
    for tag, xa, xb in breaks:
        log("  %-7s Zeile %d" % (tag, jsline(xa[0].start) if xa else 0))
        for t_ in xa[:3]:
            log("      DE %-5s %r" % (t_.kind, t_.text[:110]))
        for t_ in xb[:3]:
            log("      EN %-5s %r" % (t_.kind, t_.text[:110]))

    # ---------------------------------------------------------- Markup
    H = markup_dict(DE, EN)
    M = head_dict(DE, EN)

    out = {"s": STR, "c": CTX, "t": TMPL, "h": H, "m": M}
    return DE, da, db, newjs, out


# ---------------------------------------------------------------- Markup
TAG = re.compile(r"<[^>]*>", re.S)
ATTR_RX = re.compile(r"\b(" + "|".join(ATTRS) + r")\s*=\s*(?:\"([^\"]*)\"|'([^']*)')", re.I)
SKIP_TAGS = ("script", "style")


def scan_markup(src, a, b):
    out, i = [], a
    while i < b:
        m = TAG.search(src, i, b)
        if not m:
            out.append(("text", src[i:b]))
            break
        if m.start() > i:
            out.append(("text", src[i:m.start()]))
        out.append(("tag", m.group(0)))
        name = re.match(r"<\s*([a-zA-Z0-9-]+)", m.group(0))
        if name and name.group(1).lower() in SKIP_TAGS:
            close = src.find("</" + name.group(1), m.end())
            close = b if close < 0 else close
            out.append(("raw", src[m.end():close]))
            i = close
            continue
        i = m.end()
    return out


def unent(s):
    try:
        import html
        return html.unescape(s)
    except Exception:
        return s


def markup_dict(DE, EN):
    da, db = body_region(DE)
    ea, eb = body_region(EN)
    dtok, etok = scan_markup(DE, da, db), scan_markup(EN, ea, eb)

    def msig(tok):
        k, s = tok
        if k == "text":
            return "@TEXT" if s.strip() else "@WS"
        if k == "raw":
            return "@RAW"
        return ATTR_RX.sub(lambda m: m.group(1) + '="@"', s)

    sm = difflib.SequenceMatcher(None, [msig(t) for t in dtok], [msig(t) for t in etok],
                                 autojunk=False)
    votes = defaultdict(Counter)
    brueche = 0
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag != "equal":
            brueche += 1
            for t_ in dtok[i1:i2]:
                if t_[0] == "text" and t_[1].strip():
                    log("MARKUP nicht ausgerichtet: %r" % t_[1].strip()[:90])
            continue
        for k in range(i2 - i1):
            (dk, ds), (ek, es) = dtok[i1 + k], etok[j1 + k]
            if dk == "text":
                d, e = unent(ds.strip()), unent(es.strip())
                if d and d != e:
                    votes[d][e] += 1
            elif dk == "tag":
                dm = [(a, unent((b or c).strip())) for a, b, c in ATTR_RX.findall(ds)]
                em = [(a, unent((b or c).strip())) for a, b, c in ATTR_RX.findall(es)]
                if len(dm) == len(em):
                    for (an, dv), (_, ev) in zip(dm, em):
                        if dv and dv != ev:
                            votes[dv][ev] += 1
    H = {}
    log("")
    log("=== Markup ===")
    for k, c in votes.items():
        H[k] = c.most_common(1)[0][0]
        if len(c) > 1:
            log("  mehrdeutig %r -> %s (genommen: erste)" % (k[:60], [v[:50] for v in c]))
    log("Markup-Eintraege: %d, nicht ausgerichtete Stellen: %d" % (len(H), brueche))
    return H


def head_dict(DE, EN):
    def bits(src):
        out = {}
        m = re.search(r"<title>(.*?)</title>", src, re.S)
        if m:
            out["title"] = unent(m.group(1).strip())
        for name, attr in (("description", "name"), ("og:title", "property"),
                           ("og:description", "property")):
            m = re.search(r'<meta %s="%s" content="(.*?)">' % (attr, re.escape(name)), src, re.S)
            if m:
                out[name] = unent(m.group(1).strip())
        return out

    hd, he = bits(DE), bits(EN)
    M = {}
    for k in hd:
        if k in he and hd[k] != he[k]:
            M[hd[k]] = he[k]
    log("")
    log("=== Kopfbereich: %d Angaben ===" % len(M))
    for k, v in M.items():
        log("  %r\n    -> %r" % (k[:80], v[:80]))
    return M


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    DE, da, db, newjs, dic = main(sys.argv[1])
    outdir = os.path.join(REPO, "i18n", "out")
    if not os.path.isdir(outdir):
        os.makedirs(outdir)
    io.open(os.path.join(outdir, "newjs.txt"), "w", encoding="utf-8", newline="").write(newjs)
    io.open(os.path.join(outdir, "dict.json"), "w", encoding="utf-8", newline="").write(
        json.dumps(dic, ensure_ascii=False, indent=1, sort_keys=True))
    io.open(os.path.join(outdir, "bericht.txt"), "w", encoding="utf-8", newline="").write(
        "\n".join(bericht))
    print("Woerterbuch: " + "  ".join("%s=%d" % (k, len(dic[k])) for k in ("s", "c", "t", "h", "m")))
    print("geschrieben nach i18n/out/ - Bericht in i18n/out/bericht.txt")
