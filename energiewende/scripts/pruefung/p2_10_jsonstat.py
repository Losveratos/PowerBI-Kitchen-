"""Gegenprüfung P2-10: eigener, minimaler JSON-stat-2.0-Leser (unabhängig vom Phase-1-Skript).

Liefert ein dict {(dim1_code, dim2_code, ...): wert} in der Dimensionsreihenfolge von `id`.
"""
import json


def lese(pfad):
    with open(pfad, encoding="utf-8") as f:
        d = json.load(f)
    ids = d["id"]
    groessen = d["size"]
    codes = []
    for dim in ids:
        idx = d["dimension"][dim]["category"]["index"]
        # index kann dict (code -> pos) oder Liste sein
        if isinstance(idx, dict):
            liste = sorted(idx, key=lambda c: idx[c])
        else:
            liste = list(idx)
        codes.append(liste)
    werte = d["value"]
    if isinstance(werte, list):
        werte = {str(i): v for i, v in enumerate(werte) if v is not None}
    erg = {}
    for k, v in werte.items():
        k = int(k)
        schluessel = []
        rest = k
        for g in reversed(groessen):
            schluessel.append(rest % g)
            rest //= g
        schluessel.reverse()
        erg[tuple(codes[i][p] for i, p in enumerate(schluessel))] = v
    return ids, erg


def filtere(ids, erg, **bed):
    """Gibt {zeit: wert} zurück für die übrigen Bedingungen (alle anderen Dims fest)."""
    aus = {}
    for k, v in erg.items():
        ok = True
        for dim, code in bed.items():
            if k[ids.index(dim)] != code:
                ok = False
                break
        if ok:
            aus[k[ids.index("time")]] = v
    return aus
