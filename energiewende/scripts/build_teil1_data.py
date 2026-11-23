#!/usr/bin/env python3
"""Baut data/teil1_data.json aus der Freigabeliste docs/03_teil1_freigabe.md (v2).

Nur was im json-Block `teil1_data` der Freigabeliste steht, darf auf den Seiten
von Teil 1 als Tatsache erscheinen. Das Skript

* liest den einzigen ```json-Block der Freigabeliste,
* rechnet alle eigenen Rechnungen nach (Feld `rechnung` je Zahl) und erzeugt die
  BIP-Anteile der Studien in zwei Rechnungen (festes BIP 2024, wachsendes BIP),
* liest die Prozesszahlen aus agents/PROTOKOLL.md und gleicht sie ab,
* prüft das Schema (siehe PRUEFUNGEN unten) und bricht mit einer lesbaren
  Meldung ab, wenn eine Prüfung scheitert,
* schreibt data/teil1_data.json deterministisch (ohne Zeitstempel),
* mit --md: erneuert die automatisch erzeugten Tabellen in der Freigabeliste
  (Abschnitte zwischen <!-- AUTO:name --> und <!-- /AUTO:name -->).

Aufruf:  python3 energiewende/scripts/build_teil1_data.py [--md]
"""
import json
import math
import re
import sys
import pathlib
from collections import Counter, OrderedDict

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / "docs" / "03_teil1_freigabe.md"
DST = ROOT / "data" / "teil1_data.json"
SYNTHESE = ROOT / "research" / "reviews_teil1" / "00_synthese.md"
PROTOKOLL = ROOT / "agents" / "PROTOKOLL.md"

STATUS = ["bestätigt", "korrigiert", "verworfen", "Setzung (M)", "nicht prüfbar"]
ORTE = ["story", "belege", "beide", "keiner"]
ARTEN = ["Zitat", "Statistik", "eigene Rechnung", "Setzung"]
KONFIDENZ = ["A", "B", "C", "Behauptung", "eigene Rechnung", "Setzung"]
PLATZHALTER = re.compile(r"\[\[([A-Za-z0-9_]+)(?:\|([A-Za-z0-9_]+))?\]\]")

# Ziffern, die in Texten ohne Platzhalter stehen dürfen: Jahreszahlen, Daten,
# Fundstellen, Aktenzeichen, Namen von Größen und Gliederungen. Alles andere
# ist eine Zahl und muss als Platzhalter aus `zahlen` kommen.
ERLAUBT = [
    r"\b\d{1,2}\.\d{1,2}\.\d{4}\b",                       # Datum 20.11.2026
    r"\b(?:19|20)\d{2}/(?:19|20)?\d{2}\b",                 # 1995/96, 2037/2045
    r"\b(?:19|20)\d{2}\b",                                 # Jahreszahl
    r"WD 5 – 3000 – \d+/\d+",                              # Aktenzeichen WD
    r"\b\d{2,3}/\d{2}\b",                                  # 135/24, 151/24
    r"\b(?:Drucksache|Drs\.|BT-Drs\.)\s*\d+/\d+",          # Drucksachen
    r"\bhib \d+/\d{4}",
    r"\b\d+\+\d+/\d{4}",                                   # Wochenbericht 38+39/2025
    r"\b(?:Druckseiten?|PDF-S\.|S\.|Seiten?|Fn\.|Fußnoten?|Z\.|Tab\.|Tabelle|Abb\.|Abbildung|Nr\.|Kapitel|Abschnitt|Abschn\.|Folge|Teil|Teile|Akt|Schritt)\s*\d+(?:[.,–-]\d+)*",
    r"\bTeil \d(?: und \d)?",
    r"\b(?:CO₂|CO2|H₂|ETS\s?[12]|ETS2|ETS1|G[123][ab]?|GP\d+|P\d{3}|V\d|Q\d+|K\d+|D\d|X\d{2}|E\d{2}|nama_10_gdp|sts_inpr_a|nrg_pc_\d+)\b",
    r"\b[A-Z]-\d\b",                                       # Factsheet-Seiten B-2
    r"\bNEP \d{4}/\d{4}",
    r"\b(?:REPUBLIK21|R21s?|Olkiluoto-3|EU-?27|[Ff]reigabe v[12]|v[12])\b",  # Namen
    r"\b(?:19|20)\d{2}er\b",                                     # 2030er
]
ERLAUBT_RX = re.compile("|".join(ERLAUBT))


class Fehler(Exception):
    pass


def bricht(meldungen, titel):
    if meldungen:
        zeilen = "\n  - ".join(meldungen[:60])
        mehr = f"\n  … und {len(meldungen) - 60} weitere" if len(meldungen) > 60 else ""
        raise Fehler(f"PRÜFUNG GESCHEITERT: {titel} ({len(meldungen)})\n  - {zeilen}{mehr}")


# ---------------------------------------------------------------- Einlesen

def lies_block(text):
    bloecke = re.findall(r"```json\n(.*?)\n```", text, re.S)
    if len(bloecke) != 1:
        raise Fehler(f"erwartet genau einen json-Block in {SRC.name}, gefunden: {len(bloecke)}")
    try:
        return json.loads(bloecke[0], object_pairs_hook=OrderedDict)
    except json.JSONDecodeError as e:
        raise Fehler(f"json-Block nicht lesbar: {e}")


def lies_arbeitsliste():
    t = SYNTHESE.read_text(encoding="utf-8")
    b = re.findall(r"```json\n(.*?)\n```", t, re.S)
    return json.loads(b[-1])["arbeitsliste"]


def zahl_de(s):
    return int(s.replace(".", "").replace(" ", ""))


def lies_protokoll():
    """Summiert Token und Werkzeugaufrufe je Phase aus den Tabellen des Protokolls."""
    t = PROTOKOLL.read_text(encoding="utf-8")
    phasen = OrderedDict()
    aktuell = None
    for zeile in t.splitlines():
        m = re.match(r"## Phase (\d+)", zeile)
        if m:
            aktuell = int(m.group(1))
            phasen[aktuell] = {"laeufe": 0, "laeufe_mit_token": 0, "token": 0, "aufrufe": 0,
                               "summe_protokoll_token": None, "auftraege": []}
            continue
        if aktuell is None or not zeile.startswith("| P"):
            m2 = re.search(r"\*\*Summe Phase (\d+):\*\*.*?([\d.]+) Token", zeile)
            if m2 and int(m2.group(1)) in phasen:
                phasen[int(m2.group(1))]["summe_protokoll_token"] = zahl_de(m2.group(2))
            continue
        zellen = [z.strip() for z in zeile.strip("|").split("|")]
        if len(zellen) < 7:
            continue
        p = phasen[aktuell]
        p["laeufe"] += 1
        p["auftraege"].append(zellen[0])
        if re.fullmatch(r"[\d.]+", zellen[4]):
            p["laeufe_mit_token"] += 1
            p["token"] += zahl_de(zellen[4])
            p["aufrufe"] += zahl_de(zellen[5])
    return phasen


# ---------------------------------------------------------------- Rechnen

def bip_mittel(bip, g_pct, von, bis, basis=2024):
    """Mittleres BIP der Jahre von..bis bei konstantem Wachstum g ab dem Basisjahr."""
    jahre = range(von, bis + 1)
    return sum(bip * (1 + g_pct / 100) ** (j - basis) for j in jahre) / len(jahre)


def wert(zahlen, ref):
    """'id' oder 'id|key' -> Zahl."""
    zid, _, key = ref.partition("|")
    if zid not in zahlen:
        raise Fehler(f"Rechnung verweist auf unbekannte Zahl {zid}")
    v = zahlen[zid]["value"]
    if key:
        if not isinstance(v, dict) or key not in v:
            raise Fehler(f"Rechnung verweist auf {ref}, Schlüssel fehlt")
        return v[key]
    if isinstance(v, dict):
        raise Fehler(f"Rechnung verweist auf {ref} ohne Schlüssel, Wert ist ein Objekt")
    return v


def rechne_nach(zahlen):
    fehler = []
    ns_basis = {"bip_mittel": bip_mittel, "round": round, "min": min, "max": max, "math": math}
    for z in zahlen.values():
        r = z.get("rechnung")
        if not r:
            continue
        werte = {}
        for name, ref in r.get("werte", {}).items():
            werte[name] = ref if isinstance(ref, (int, float)) else wert(zahlen, ref)
        toleranz = r.get("toleranz", 0.051)
        for ziel, formel in r["formeln"].items():
            try:
                erg = eval(formel, {"__builtins__": {}}, {**ns_basis, **werte})
            except Exception as e:  # noqa: BLE001
                fehler.append(f"{z['id']}.{ziel}: Formel '{formel}' nicht auswertbar ({e})")
                continue
            soll = z["value"] if ziel == "value" else (z["value"] or {}).get(ziel)
            if soll is None:
                fehler.append(f"{z['id']}.{ziel}: kein Wert im Datensatz")
            elif abs(erg - soll) > toleranz:
                fehler.append(f"{z['id']}.{ziel}: Datensatz {soll}, nachgerechnet {erg:.3f} (Formel {formel})")
    return fehler


def runde(x, n=1):
    return float(f"{x:.{n}f}")


def erzeuge_studienzahlen(daten, zahlen):
    """BIP-Anteile je Studie in beiden Rechnungen; Ergebnis als eigene Rechnungen in `zahlen`."""
    bip = zahlen["bip_de_2024"]["value"]
    g = zahlen["bip_wachstum_setzung"]["value"]
    neu = []
    for s in daten["studien"]:
        pj = s["pro_jahr"]
        if "zahl" in pj:
            v = zahlen[pj["zahl"]]["value"]
            lo = v[pj["min"]] if isinstance(v, dict) else v
            hi = v[pj["max"]] if isinstance(v, dict) else v
            rechenweg_pa = f"Jahreswert der Studie ({pj['zahl']})"
            eingaben = [pj["zahl"]]
        else:  # aus der Summe geteilt durch die Jahre
            v = zahlen[pj["summe"]]["value"]
            jahre = s["zeitraum"]["bis"] - s["zeitraum"]["von"] + 1
            lo = (v[pj["min"]] if isinstance(v, dict) else v) * pj.get("faktor", 1) / jahre
            hi = (v[pj["max"]] if isinstance(v, dict) else v) * pj.get("faktor", 1) / jahre
            rechenweg_pa = f"Summe ({pj['summe']}) ÷ {jahre} Jahre"
            eingaben = [pj["summe"]]
        von, bis = s["zeitraum"]["von"], s["zeitraum"]["bis"]
        fest = {"min": runde(lo / bip * 100), "max": runde(hi / bip * 100)}
        if s["preisbasis_art"] == "real":
            g_lo, g_hi = g["real_max"], g["real_min"]
            g_text = f"reales Wachstum {g['real_min']}–{g['real_max']} % pro Jahr"
        else:
            g_lo, g_hi = g["nominal_max"], g["real_min"]
            g_text = (f"Preisbasis {s['preisbasis_art']}: Spanne von {g['real_min']} % (real) "
                      f"bis {g['nominal_max']} % (nominal) pro Jahr")
        wachsend = {"min": runde(lo / bip_mittel(bip, g_lo, von, bis) * 100),
                    "max": runde(hi / bip_mittel(bip, g_hi, von, bis) * 100)}
        basis = {"art": "eigene Rechnung", "zitat_geprueft": False, "wert_konfidenz": "eigene Rechnung",
                 "primaer_gelesen": False, "quelle": ["eigene_rechnung"] + s["quelle"],
                 "status": "Setzung (M)", "erzeugt": True, "dezimalen": 1}
        if lo == hi:
            fest = fest["min"]
            wachsend = wachsend if wachsend["min"] != wachsend["max"] else wachsend["min"]
        pa_id = f"pa_{s['id']}"
        if "summe" in pj:
            pa_wert = {"min": runde(lo, 0), "max": runde(hi, 0)} if lo != hi else runde(lo, 0)
            neu.append({"id": pa_id, "value": pa_wert, "unit": "Mrd. EUR pro Jahr", **basis,
                        "fundstelle": "-", "abgrenzung": f"{s['studie']}; Durchschnitt ohne Zeitprofil",
                        "rechenweg": rechenweg_pa, "eingaben": eingaben})
        neu.append({"id": f"bipfest_{s['id']}", "value": fest, "unit": "% BIP 2024 pro Jahr", **basis,
                    "fundstelle": "-", "abgrenzung": f"{s['studie']}; festes BIP 2024 (4.386,94 Mrd. EUR)",
                    "rechenweg": f"{rechenweg_pa} ÷ BIP 2024 × 100", "eingaben": eingaben + ["bip_de_2024"]})
        neu.append({"id": f"bipwachs_{s['id']}", "value": wachsend, "unit": "% des mittleren BIP pro Jahr", **basis,
                    "fundstelle": "-",
                    "abgrenzung": f"{s['studie']}; mittleres BIP {von}–{bis} bei {g_text} (Setzung)",
                    "rechenweg": (f"{rechenweg_pa} ÷ Mittel über {von}–{bis} von BIP 2024 × (1+g)^(Jahr−2024) × 100; "
                                  f"kleinster Anteil mit höchstem g, größter mit kleinstem g"),
                    "eingaben": eingaben + ["bip_de_2024", "bip_wachstum_setzung"]})
        s["_erzeugt"] = {"pa": pa_id if "summe" in pj else pj["zahl"],
                         "pa_wert": {"min": runde(lo, 0), "max": runde(hi, 0)} if lo != hi else runde(lo, 0),
                         "bip_fest": f"bipfest_{s['id']}", "bip_wachsend": f"bipwachs_{s['id']}"}
    # Spannen je Gruppe (nur Studien mit in_gruppenspanne)
    gruppen = OrderedDict()
    for s in daten["studien"]:
        if s.get("in_gruppenspanne"):
            gruppen.setdefault(s["gruppe_spanne"], []).append(s)
    for gname, liste in gruppen.items():
        for art, praefix in (("fest", "bipfest_"), ("wachsend", "bipwachs_")):
            los, his = [], []
            for s in liste:
                v = next(z for z in neu if z["id"] == praefix + s["id"])["value"]
                los.append(v["min"] if isinstance(v, dict) else v)
                his.append(v["max"] if isinstance(v, dict) else v)
            neu.append({"id": f"spanne_{gname}_{art}", "value": {"min": min(los), "max": max(his)},
                        "unit": "% BIP pro Jahr" if art == "fest" else "% des mittleren BIP pro Jahr",
                        "art": "eigene Rechnung", "zitat_geprueft": False, "wert_konfidenz": "eigene Rechnung",
                        "primaer_gelesen": False, "quelle": ["eigene_rechnung"], "status": "Setzung (M)",
                        "erzeugt": True, "dezimalen": 1, "fundstelle": "-",
                        "abgrenzung": f"Gruppe {gname}: " + ", ".join(s["studie"] for s in liste),
                        "rechenweg": f"kleinster und größter Anteil der Gruppe ({art})",
                        "eingaben": [praefix + s["id"] for s in liste]})
    for z in neu:
        if z["id"] in zahlen:
            raise Fehler(f"erzeugte Zahl {z['id']} kollidiert mit einer Zahl im Datensatz")
        zahlen[z["id"]] = z
    return neu


# ---------------------------------------------------------------- Prüfen

def texte(obj, pfad=""):
    """Alle Textfelder, die auf Seiten erscheinen dürfen, mit Pfad."""
    felder = ("text", "vorbehalt", "kurz", "lang", "titel", "untertitel", "legende", "label",
              "beschriftung", "ueberschrift", "hinweis_seite", "achse")
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in felder and isinstance(v, str):
                yield f"{pfad}.{k}", v
            elif isinstance(v, (dict, list)):
                yield from texte(v, f"{pfad}.{k}")
    elif isinstance(obj, list):
        for i, x in enumerate(obj):
            yield from texte(x, f"{pfad}[{i}]")


def pruefe(daten, zahlen, arbeitsliste, protokoll):
    claims = OrderedDict((c["id"], c) for c in daten["claims"])
    quellen = daten["quellen"]

    # 1. IDs eindeutig
    alle = ([z["id"] for z in daten["zahlen"]] + [c["id"] for c in daten["claims"]] +
            [s["id"] for s in daten["schritte"]] + [g["id"] for g in daten["gegenpositionen"]] +
            [s["id"] for s in daten["studien"]] + list(quellen.keys()))
    bricht(sorted(f"doppelte ID {i}" for i, n in Counter(alle).items() if n > 1), "IDs eindeutig")

    # 2. Pflichtfelder und Wertebereiche je Zahl
    f = []
    for z in zahlen.values():
        for feld in ("id", "value", "unit", "art", "zitat_geprueft", "wert_konfidenz", "quelle", "fundstelle", "abgrenzung"):
            if feld not in z:
                f.append(f"Zahl {z.get('id')}: Feld {feld} fehlt")
        if z.get("art") not in ARTEN:
            f.append(f"Zahl {z['id']}: art '{z.get('art')}' unbekannt")
        if z.get("wert_konfidenz") not in KONFIDENZ:
            f.append(f"Zahl {z['id']}: wert_konfidenz '{z.get('wert_konfidenz')}' unbekannt")
        if not isinstance(z.get("zitat_geprueft"), bool):
            f.append(f"Zahl {z['id']}: zitat_geprueft muss true/false sein")
        if z.get("art") == "eigene Rechnung":
            if z.get("wert_konfidenz") != "eigene Rechnung":
                f.append(f"Zahl {z['id']}: eigene Rechnung braucht wert_konfidenz 'eigene Rechnung'")
            if not z.get("rechenweg") or not z.get("eingaben"):
                f.append(f"Zahl {z['id']}: eigene Rechnung ohne rechenweg oder eingaben")
            for e in z.get("eingaben", []):
                if e not in zahlen:
                    f.append(f"Zahl {z['id']}: Eingabe {e} existiert nicht")
        if z.get("art") == "Setzung" and (z.get("wert_konfidenz") != "Setzung" or not z.get("rechenweg")):
            f.append(f"Zahl {z['id']}: Setzung braucht wert_konfidenz 'Setzung' und eine Begründung in rechenweg")
        if z.get("art") in ("eigene Rechnung", "Setzung") and z.get("zitat_geprueft"):
            f.append(f"Zahl {z['id']}: eigene Rechnung/Setzung kann kein geprüftes Zitat sein")
        qs = z.get("quelle", [])
        if not isinstance(qs, list) or not qs:
            f.append(f"Zahl {z['id']}: quelle muss eine nicht leere Liste sein")
        for q in qs:
            if q not in quellen:
                f.append(f"Zahl {z['id']}: Quelle {q} nicht in quellen")
    bricht(f, "Pflichtfelder der Zahlen")

    # 3. Stufe A nur mit mindestens zwei unabhängigen Quellen
    f = []
    for z in zahlen.values():
        if z["wert_konfidenz"] == "A":
            echte = [q for q in z["quelle"] if quellen[q].get("art") not in ("eigenes Dokument",)]
            if len(set(echte)) < 2:
                f.append(f"Zahl {z['id']}: Stufe A mit {len(set(echte))} Quelle(n)")
            if not z.get("primaer_gelesen"):
                f.append(f"Zahl {z['id']}: Stufe A ohne primaer_gelesen")
        if z["wert_konfidenz"] in ("A", "B") and any(quellen[q].get("art") == "Zweitquelle" for q in z["quelle"]) \
                and not z.get("primaer_gelesen"):
            f.append(f"Zahl {z['id']}: Zweitquelle ohne Original höchstens C")
    bricht(f, "Konfidenz-Regeln")

    # 4. Claims: Felder, Status, Ort, Vorbehalt
    f = []
    for c in claims.values():
        for feld in ("id", "text", "status", "ort", "quelle", "fundstelle"):
            if not c.get(feld) and feld != "quelle":
                f.append(f"Aussage {c.get('id')}: Feld {feld} fehlt oder leer")
        if c.get("status") not in STATUS:
            f.append(f"Aussage {c['id']}: Status '{c.get('status')}' unbekannt")
        if c.get("ort") not in ORTE:
            f.append(f"Aussage {c['id']}: ort '{c.get('ort')}' unbekannt")
        if (c.get("status") == "verworfen") != (c.get("ort") == "keiner"):
            f.append(f"Aussage {c['id']}: verworfen gehört genau zu ort 'keiner'")
        if c.get("status") == "nicht prüfbar" and not c.get("vorbehalt"):
            f.append(f"Aussage {c['id']}: nicht prüfbar ohne Vorbehalt")
        if c.get("status") == "korrigiert" and not c.get("alt"):
            f.append(f"Aussage {c['id']}: korrigiert ohne Feld alt")
        for q in c.get("quelle", []):
            if q not in quellen:
                f.append(f"Aussage {c['id']}: Quelle {q} nicht in quellen")
        if c.get("status") != "verworfen":
            ids = [m.group(1) for m in PLATZHALTER.finditer(c["text"] + " " + c.get("vorbehalt", ""))]
            for zid in ids:
                z = zahlen.get(zid)
                if z and (z["wert_konfidenz"] in ("C",) or z["art"] == "Setzung") and not c.get("vorbehalt"):
                    f.append(f"Aussage {c['id']}: nutzt {zid} ({z['wert_konfidenz']}/{z['art']}) ohne Vorbehalt")
    bricht(f, "Aussagen")

    # 5. Platzhalter verweisen auf vorhandene Zahlen und Schlüssel
    f = []
    for pfad, t in texte({k: v for k, v in daten.items() if k not in ("verworfen", "verbotene_formulierungen")}):
        if ".claims[" in pfad:
            idx = int(re.search(r"\.claims\[(\d+)\]", pfad).group(1))
            if daten["claims"][idx]["status"] == "verworfen":
                continue
        for m in PLATZHALTER.finditer(t):
            zid, fmt = m.group(1), m.group(2)
            if zid not in zahlen:
                f.append(f"{pfad}: Platzhalter [[{zid}]] verweist auf keine Zahl")
                continue
            v = zahlen[zid]["value"]
            if fmt == "spanne":
                if not (isinstance(v, dict) and "min" in v and "max" in v):
                    f.append(f"{pfad}: [[{zid}|spanne]] braucht min und max")
            elif fmt:
                if not (isinstance(v, dict) and fmt in v):
                    f.append(f"{pfad}: [[{zid}|{fmt}]] Schlüssel fehlt")
            elif isinstance(v, dict):
                f.append(f"{pfad}: [[{zid}]] ohne Schlüssel, Wert ist ein Objekt")
    bricht(f, "Platzhalter")

    # 6. Keine Zahl von Hand: Ziffern außerhalb von Platzhaltern nur nach der Liste ERLAUBT
    f = []
    for pfad, t in texte({k: v for k, v in daten.items() if k in ("claims", "schritte", "gegenpositionen", "glossar")}):
        if ".claims[" in pfad:
            idx = int(re.search(r"\.claims\[(\d+)\]", pfad).group(1))
            if daten["claims"][idx]["status"] == "verworfen":
                continue
        rest = PLATZHALTER.sub(" ", t)
        rest = ERLAUBT_RX.sub(" ", rest)
        for m in re.finditer(r"\d[\d.,]*", rest):
            f.append(f"{pfad}: Ziffer '{m.group(0)}' ohne Platzhalter in »…{rest[max(0, m.start()-40):m.end()+20]}…«")
    bricht(f, "Keine Zahl von Hand (Ziffern ohne Platzhalter)")

    # 7. Keine verworfene Zahl und keine verbotene Formulierung in einem Text
    f = []
    muster = []
    for v in daten["verworfen"]:
        muster += [(v["id"], m) for m in v.get("muster", [])]
    for x in daten["verbotene_formulierungen"]:
        muster += [(x["id"], m) for m in x.get("muster", [])]
    for pfad, t in texte({k: v for k, v in daten.items() if k in ("claims", "schritte", "gegenpositionen")}):
        if ".claims[" in pfad:
            idx = int(re.search(r"\.claims\[(\d+)\]", pfad).group(1))
            if daten["claims"][idx]["status"] == "verworfen":
                continue
        for vid, m in muster:
            if re.search(m, t, re.I):
                f.append(f"{pfad}: enthält verworfenes Muster {vid} »{m}«")
    for z in zahlen.values():
        for v in daten["verworfen"]:
            if v.get("zahl_id") == z["id"]:
                f.append(f"verworfene Zahl {v['id']} steht als freigegebene Zahl {z['id']} im Datensatz")
    bricht(f, "Verworfenes")

    # 8. Erzählschritte und Gegenpositionen verweisen nur auf freigegebene Aussagen
    f = []
    benutzt = set()
    for s in daten["schritte"]:
        for cid in s.get("claims", []):
            benutzt.add(cid)
            if cid not in claims:
                f.append(f"Schritt {s['id']}: Aussage {cid} fehlt")
            elif claims[cid]["status"] == "verworfen":
                f.append(f"Schritt {s['id']}: Aussage {cid} ist verworfen")
            elif claims[cid]["ort"] == "belege":
                f.append(f"Schritt {s['id']}: Aussage {cid} ist nur für die Belegseite freigegeben")
    for g in daten["gegenpositionen"]:
        for cid in g.get("claims", []):
            benutzt.add(cid)
            if cid not in claims:
                f.append(f"{g['id']}: Aussage {cid} fehlt")
            elif claims[cid]["status"] == "verworfen":
                f.append(f"{g['id']}: Aussage {cid} ist verworfen")
    for c in claims.values():
        if c["ort"] in ("story", "beide") and c["id"] not in benutzt:
            f.append(f"Aussage {c['id']} (ort {c['ort']}) steht in keinem Schritt und keinem Kasten")
    bricht(f, "Erzählschritte und Kästen")

    # 9. Quellen vollständig
    f = []
    for qid, q in quellen.items():
        for feld in ("titel", "herausgeber", "datum", "auftraggeber", "art"):
            if not q.get(feld):
                f.append(f"Quelle {qid}: Feld {feld} fehlt")
        if not ((q.get("url") and q.get("abruf")) or q.get("ohne_url_grund")):
            f.append(f"Quelle {qid}: weder URL mit Abrufdatum noch Vermerk ohne_url_grund")
    bricht(f, "Quellen")

    # 10. Arbeitsliste: jeder Punkt der Klassen A und B hat eine Zeile
    f = []
    soll = {p["id"] for p in arbeitsliste if p["klasse"] in ("A", "B")}
    ist = Counter(n["punkt"] for n in daten["arbeitsliste_nachweis"])
    for p in sorted(soll - set(ist)):
        f.append(f"Punkt {p} (Klasse A/B) ohne Zeile im Nachweis")
    for p, n in ist.items():
        if n > 1:
            f.append(f"Punkt {p} mehrfach im Nachweis")
        if p not in {x["id"] for x in arbeitsliste}:
            f.append(f"Punkt {p} steht nicht in der Arbeitsliste der Synthese")
    for n in daten["arbeitsliste_nachweis"]:
        if n.get("umgesetzt") not in ("ja", "teilweise", "nein", "Bau"):
            f.append(f"Nachweis {n['punkt']}: umgesetzt '{n.get('umgesetzt')}' unbekannt")
        if n.get("umgesetzt") in ("nein", "teilweise") and not n.get("grund"):
            f.append(f"Nachweis {n['punkt']}: ohne Grund")
        for cid in n.get("claims", []):
            if cid not in claims:
                f.append(f"Nachweis {n['punkt']}: Aussage {cid} fehlt")
    bricht(f, "Arbeitsliste")

    # 11. Prozesszahlen gegen das Protokoll
    f = []
    for nr, p in protokoll.items():
        if p["summe_protokoll_token"] is not None and p["summe_protokoll_token"] != p["token"]:
            f.append(f"Phase {nr}: Zeilensumme {p['token']} Token, Summenzeile {p['summe_protokoll_token']}")
    for z in zahlen.values():
        pr = z.get("protokoll")
        if not pr:
            continue
        p = protokoll.get(pr["phase"])
        if p is None:
            f.append(f"Zahl {z['id']}: Phase {pr['phase']} nicht im Protokoll")
            continue
        ist_w = p[pr["feld"]]
        soll_w = z["value"] if "key" not in pr else z["value"][pr["key"]]
        if ist_w != soll_w:
            f.append(f"Zahl {z['id']}: Datensatz {soll_w}, Protokoll {ist_w}")
    bricht(f, "Prozesszahlen")


# ---------------------------------------------------------------- Ausgabe

def fmt_wert(v):
    def one(x):
        if isinstance(x, float):
            s = f"{x:,.2f}".rstrip("0").rstrip(".") if abs(x) < 1e5 else f"{x:,.0f}"
        elif isinstance(x, int):
            s = f"{x:,}"
        else:
            return str(x)
        return s.replace(",", "§").replace(".", ",").replace("§", ".")
    if isinstance(v, dict):
        if set(v) >= {"min", "max"} and len(v) <= 3:
            mid = f" (Mitte {one(v['mid'])})" if "mid" in v else ""
            return f"{one(v['min'])}–{one(v['max'])}{mid}"
        return "; ".join(f"{k} {one(x)}" for k, x in v.items())
    return one(v)


def zelle(s):
    return str(s).replace("|", "/").replace("\n", " ")


def md_tabellen(daten, zahlen, counts):
    claims = daten["claims"]
    out = {}
    # Zusammenfassung
    z = ["| Status | Anzahl | davon story | belege | beide | keiner |", "|---|---|---|---|---|---|"]
    for st in STATUS:
        cs = [c for c in claims if c["status"] == st]
        o = Counter(c["ort"] for c in cs)
        z.append(f"| {st} | {len(cs)} | {o['story']} | {o['belege']} | {o['beide']} | {o['keiner']} |")
    o = Counter(c["ort"] for c in claims)
    z.append(f"| **Summe** | **{len(claims)}** | {o['story']} | {o['belege']} | {o['beide']} | {o['keiner']} |")
    z.append("")
    z.append("| Wert-Konfidenz der Zahlen | Anzahl | davon Zitat geprüft | davon erzeugt vom Skript |")
    z.append("|---|---|---|---|")
    for k in KONFIDENZ:
        zs = [x for x in zahlen.values() if x["wert_konfidenz"] == k]
        z.append(f"| {k} | {len(zs)} | {sum(1 for x in zs if x['zitat_geprueft'])} | {sum(1 for x in zs if x.get('erzeugt'))} |")
    z.append(f"| **Summe** | **{len(zahlen)}** | {sum(1 for x in zahlen.values() if x['zitat_geprueft'])} | "
             f"{sum(1 for x in zahlen.values() if x.get('erzeugt'))} |")
    out["zusammenfassung"] = "\n".join(z)

    # Aussagen je Abschnitt
    z = []
    abschn = None
    for c in claims:
        if c.get("abschnitt") != abschn:
            abschn = c.get("abschnitt")
            z += ["", f"**{abschn}**", "",
                  "| ID | Text auf der Seite (Platzhalter = Zahl aus `zahlen`) | Status | Ort | Quelle · Fundstelle | Vorbehalt / alt |",
                  "|---|---|---|---|---|---|"]
        extra = c.get("vorbehalt", "")
        if c.get("alt"):
            extra = (extra + " · " if extra else "") + "alt: " + c["alt"]
        z.append(f"| {c['id']} | {zelle(c['text'])} | {c['status']} | {c['ort']} | "
                 f"{zelle(', '.join(c.get('quelle', [])) + ' · ' + c['fundstelle'])} | {zelle(extra)} |")
    out["aussagen"] = "\n".join(z).strip()

    # Zahlen
    z = ["| ID | Wert | Einheit | Art | Zitat geprüft | Wert | primär | Quelle · Fundstelle | Abgrenzung / Rechenweg |",
         "|---|---|---|---|---|---|---|---|---|"]
    for x in zahlen.values():
        weg = x.get("rechenweg", "")
        z.append(f"| {x['id']} | {zelle(fmt_wert(x['value']))} | {zelle(x['unit'])} | {x['art']} | "
                 f"{'ja' if x['zitat_geprueft'] else 'nein'} | {x['wert_konfidenz']} | "
                 f"{'ja' if x.get('primaer_gelesen') else 'nein'} | {zelle(', '.join(x['quelle']) + ' · ' + x['fundstelle'])} | "
                 f"{zelle(x['abgrenzung'] + (' · Rechenweg: ' + weg if weg else ''))} |")
    out["zahlen"] = "\n".join(z)

    # Studien
    z = ["| Studie | Herausgeber · Auftraggeber | Größe · Systemgrenze | Zeitraum | Preisbasis | abgezinst | "
         "pro Jahr (Mrd. €) | % BIP 2024 fest | % mittleres BIP wachsend | laut Studie | gelesen |",
         "|---|---|---|---|---|---|---|---|---|---|---|"]
    for s in daten["studien"]:
        e = s["_erzeugt"]
        z.append(f"| {zelle(s['studie'])} | {zelle(s['herausgeber'] + ' · ' + s['auftraggeber'])} | "
                 f"{zelle(s['groesse'] + ' · ' + s['systemgrenze'])} | {s['zeitraum']['von']}–{s['zeitraum']['bis']} | "
                 f"{zelle(s['preisbasis'])} | {zelle(s['abgezinst'])} | {fmt_wert(e['pa_wert'])} | "
                 f"{fmt_wert(zahlen[e['bip_fest']]['value'])} | {fmt_wert(zahlen[e['bip_wachsend']]['value'])} | "
                 f"{zelle(s.get('bip_studie_text', '–'))} | {'ja' if s['gelesen'] else 'nein'} |")
    out["studien"] = "\n".join(z)

    # Arbeitsliste
    z = ["| Punkt | Klasse | umgesetzt | was in v2 geändert wurde (oder warum nicht) | Aussagen / Ort |", "|---|---|---|---|---|"]
    for n in sorted(daten["arbeitsliste_nachweis"], key=lambda n: n["punkt"]):
        z.append(f"| {n['punkt']} | {n['klasse']} | {n['umgesetzt']} | {zelle(n['was'] + (' — Grund: ' + n['grund'] if n.get('grund') else ''))} | "
                 f"{zelle(', '.join(n.get('claims', [])) or n.get('wo', '–'))} |")
    out["arbeitsliste"] = "\n".join(z)

    # Korrekturen
    z = ["| ID | wo | alt | neu | Richtung des alten Fehlers | Beleg |", "|---|---|---|---|---|---|"]
    for k in daten["korrekturen_eigene"]:
        z.append(f"| {k['id']} | {zelle(k['wo'])} | {zelle(k['alt'])} | {zelle(k['neu'])} | {k['richtung']} | {zelle(k['beleg'])} |")
    out["korrekturen"] = "\n".join(z)
    return out


def ersetze_auto(text, abschnitte):
    for name, inhalt in abschnitte.items():
        rx = re.compile(rf"(<!-- AUTO:{name} -->\n).*?(<!-- /AUTO:{name} -->)", re.S)
        if not rx.search(text):
            raise Fehler(f"Marke <!-- AUTO:{name} --> fehlt in {SRC.name}")
        text = rx.sub(lambda m: m.group(1) + inhalt + "\n" + m.group(2), text)
    return text


def main():
    md_modus = "--md" in sys.argv
    text = SRC.read_text(encoding="utf-8")
    block = lies_block(text)
    daten = block["teil1_data"]
    zahlen = OrderedDict((z["id"], z) for z in daten["zahlen"])
    arbeitsliste = lies_arbeitsliste()
    protokoll = lies_protokoll()

    erzeuge_studienzahlen(daten, zahlen)
    bricht(rechne_nach(zahlen), "Eigene Rechnungen nachgerechnet")
    pruefe(daten, zahlen, arbeitsliste, protokoll)

    # Ausgabe zusammensetzen
    claims = OrderedDict((c["id"], c) for c in daten["claims"])
    for c in daten["claims"]:
        c["zahlen"] = sorted({m.group(1) for m in PLATZHALTER.finditer(c["text"] + " " + c.get("vorbehalt", ""))})
    for s in daten["schritte"]:
        s["text"] = " ".join(claims[cid]["text"] + (" " + claims[cid]["vorbehalt"] if claims[cid].get("vorbehalt") else "")
                             for cid in s.get("claims", []))
    for g in daten["gegenpositionen"]:
        if not g.get("lang"):
            g["lang"] = " ".join(claims[cid]["text"] + (" " + claims[cid]["vorbehalt"] if claims[cid].get("vorbehalt") else "")
                                 for cid in g.get("claims", []))
    counts = {
        "status": {st: sum(1 for c in daten["claims"] if c["status"] == st) for st in STATUS},
        "ort": {o: sum(1 for c in daten["claims"] if c["ort"] == o) for o in ORTE},
        "wert_konfidenz": {k: sum(1 for z in zahlen.values() if z["wert_konfidenz"] == k) for k in KONFIDENZ},
        "zitat_geprueft": sum(1 for z in zahlen.values() if z["zitat_geprueft"]),
        "zahlen": len(zahlen), "claims": len(daten["claims"]),
        "erzeugte_zahlen": sum(1 for z in zahlen.values() if z.get("erzeugt")),
    }
    for s in daten["studien"]:
        s["zahlen_erzeugt"] = s.pop("_erzeugt")
    ausgabe = OrderedDict()
    ausgabe["meta"] = OrderedDict(list(daten["meta"].items()) + [("counts", counts)])
    ausgabe["prozess_protokoll"] = {str(k): {kk: vv for kk, vv in v.items() if kk != "auftraege"} for k, v in protokoll.items()}
    for k, v in daten.items():
        if k == "meta":
            continue
        ausgabe[k] = list(zahlen.values()) if k == "zahlen" else v
    DST.write_text(json.dumps(ausgabe, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    if md_modus:
        # Für die Tabellen die Studien-Zuordnung wiederherstellen
        for s in daten["studien"]:
            s["_erzeugt"] = s["zahlen_erzeugt"]
        neu = ersetze_auto(text, md_tabellen(daten, zahlen, counts))
        if neu != text:
            SRC.write_text(neu, encoding="utf-8")
            print(f"{SRC.relative_to(ROOT)}: automatische Tabellen erneuert")

    print(f"{DST.relative_to(ROOT)}: {counts['claims']} Aussagen, {counts['zahlen']} Zahlen "
          f"(davon {counts['erzeugte_zahlen']} vom Skript gerechnet), {len(daten['quellen'])} Quellen")
    print("Status: " + ", ".join(f"{k} {v}" for k, v in counts["status"].items()))
    print("Ort: " + ", ".join(f"{k} {v}" for k, v in counts["ort"].items()))
    print("Wert-Konfidenz: " + ", ".join(f"{k} {v}" for k, v in counts["wert_konfidenz"].items())
          + f"; Zitat geprüft {counts['zitat_geprueft']}")
    print("Alle Prüfungen bestanden: IDs, Pflichtfelder, Konfidenz-Regeln, Aussagen, Platzhalter, "
          "keine Zahl von Hand, Verworfenes, Schritte/Kästen, Quellen, Arbeitsliste, Prozesszahlen, Nachrechnung.")


if __name__ == "__main__":
    try:
        main()
    except Fehler as e:
        sys.exit(str(e))
