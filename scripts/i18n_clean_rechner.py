#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Raeumt tote Eintraege aus dem Woerterbuch I18N_EN im Visual-Standards-Rechner.

Tot heisst: kein i18n(...)-Aufruf im Quelltext nutzt diesen Schluessel mehr.
Das passiert, wenn eine Textstelle umgebaut wird - etwa als aus
fmtN(x)+i18n(' € je Nutzer und Jahr') ein eurN(x)+i18n(' je Nutzer und Jahr')
wurde.

Nicht geprueft werden die Gruppen h (statisches Markup) und m (Kopf): die
werden zur Laufzeit gegen den Seiteninhalt gematcht, nicht gegen den Quelltext.
Dafuer meldet die Seite selbst, was fehlt (window.i18nFehlt).

Aufruf:  python scripts/i18n_clean_rechner.py          nur berichten
         python scripts/i18n_clean_rechner.py --schreiben
"""
import io
import json
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(REPO, "visual-standards-rechner.html")
ANF = "const I18N_EN=\n"
END = ";\n</script>"

# Werte, die nicht als Literal im Aufruf stehen, sondern als Variable
# hereinkommen: die Herkunfts-Klassen aus SRC_CLASS und dpBadge.
DYNAMISCH = {"belegt", "Faustregel", "Meinung", "Angebot"}

_ESC = {"n": "\n", "r": "\r", "t": "\t", "b": "\b", "f": "\f", "v": "\v", "0": "\0"}


def cook(s):
    out, i, n = [], 0, len(s)
    while i < n:
        c = s[i]
        if c != "\\":
            out.append(c)
            i += 1
            continue
        d = s[i + 1] if i + 1 < n else ""
        if d == "u":
            if s[i + 2] == "{":
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
        out.append(_ESC.get(d, d))
        i += 2
    return "".join(out)


def main():
    s = io.open(PATH, encoding="utf-8").read()
    a = s.index(ANF) + len(ANF)
    b = s.index(END, a)
    dic = json.loads(s[a:b])
    quelle = s[b:]        # nur der Code hinter dem Woerterbuch

    CALL = re.compile(r"i18n\('((?:\\.|[^'\\])*)'(?:,'([A-Za-z_$][\w$]*#\d+)')?\)")
    benutzt_s, benutzt_c = set(DYNAMISCH), set()
    for m in CALL.finditer(quelle):
        if m.group(2):
            benutzt_c.add(m.group(2))
        else:
            benutzt_s.add(cook(m.group(1)))

    TM = re.compile(r"i18nT`")
    tot_s = sorted(k for k in dic["s"] if k not in benutzt_s)
    tot_c = sorted(k for k in dic["c"] if k not in benutzt_c)

    print("Woerterbuch: %s" % ", ".join("%s=%d" % (k, len(dic[k])) for k in ("s", "c", "t", "h", "m")))
    print("i18nT-Aufrufe im Quelltext: %d, Templates im Woerterbuch: %d"
          % (len(TM.findall(quelle)), len(dic["t"])))
    print("\ntote Schluessel: s=%d c=%d" % (len(tot_s), len(tot_c)))
    for k in tot_s:
        print("   [s] %r -> %r" % (k[:70], dic["s"][k][:60]))
    for k in tot_c:
        print("   [c] %s -> %r" % (k, dic["c"][k][:60]))

    if "--schreiben" in sys.argv and (tot_s or tot_c):
        for k in tot_s:
            del dic["s"][k]
        for k in tot_c:
            del dic["c"][k]
        js = json.dumps(dic, ensure_ascii=False, indent=1, sort_keys=True)
        io.open(PATH, "w", encoding="utf-8", newline="").write(s[:a] + js + s[b:])
        print("\nentfernt und geschrieben.")


if __name__ == "__main__":
    main()
