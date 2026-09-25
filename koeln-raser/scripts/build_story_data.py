#!/usr/bin/env python3
"""Verdichtet data/raser_2025.sqlite zu data/story_data.json für die HTML-Story.

Alle Zahlen der Story kommen aus dieser Datei; jede Kennzahl ist eine
SQL-Abfrage auf die Rohdaten (siehe build_db.py).

Begriffe:
  Tempofall   – Zeile, deren implizites Tempolimit plausibel ist. Bei den
                Kreuzungsanlagen (K-04) ist das nur bei 50/70 km/h der Fall;
                die übrigen K-04-Zeilen sind vermutlich Rotlichtverstöße.
  Limit       – kmh − Überschreitung − Toleranz (3 km/h bis 100 km/h, sonst 3 %).
  Innerorts   – Annahme: Limit ≤ 50 km/h (die Daten kennen keine Ortstafeln).
"""
import json
import math
import sqlite3
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "data" / "raser_2025.sqlite"
OUT = ROOT / "data" / "story_data.json"
BUSSGELD = ROOT / "data" / "bussgeld_2025.json"
# Unterscheidungszeichen → Zulassungsbezirk (npm german-license-plate-prefixes, CC-BY-3.0)
KFZ = json.loads((ROOT / "data" / "geo" / "kfz-kennzeichen-prefixes.json").read_text(encoding="utf-8"))

UMLAND = {"BM", "GL", "SU", "LEV", "NE"}  # Nachbarkreise/-städte Kölns

# Kurznamen der festen Anlagen (S-01) für die Grafiken – aus Standorttabelle sloc-01
# (Spalten Ort/Lage/Fahrtrichtung) redaktionell verdichtet.
S01_NAMEN = {
    "0015": "B 55a · Ausfahrt Frankfurter Str. → Olpe",
    "0002": "B 55a · Höhe Waldecker Str. → Zoobrücke",
    "0005": "Innere Kanalstraße · Lat. 177 → Niehler Str.",
    "0010": "Innere Kanalstraße · Lat. 177 → Zoobrücke",
    "0007": "Innere Kanalstraße · Escher Str. → Süden",
    "0008": "Innere Kanalstraße · Hornstr. → Zoobrücke",
    "0006": "Innere Kanalstraße · Finanzamt → Ehrenfeld",
    "0009": "Innere Kanalstraße · Finanzamt → Zoobrücke",
    "0061": "Kaiser-Wilhelm-Ring 17–21 → Christophstr.",
    "0060": "Kaiser-Wilhelm-Ring 21–17 → Rudolfplatz",
    "0059": "Kaiser-Wilhelm-Ring 27–29 → Ebertplatz",
    "0062": "Hansaring 52 → Ebertplatz",
    "0028": "Escher Straße 146 → Geldernstr.",
    "0027": "Escher Straße 154 → Parkgürtel",
    "0053": "Dellbrücker Hauptstr. 95 → Berg. Gladbacher Str.",
    "0052": "Dellbrücker Hauptstr. 95 → Mielenforster Str.",
    "0063": "Auenweg 173 → Deutz-Mülheimer Str.",
    "0064": "Auenweg 173 → Deutz",
    "0034": "Militärringstraße · Am Eifeltor → Marienburg",
    "0055": "Butzweilerhofallee 53 → Von-Hünefeld-Str.",
    "0054": "Butzweilerhofallee 53 → Butzweilerstr.",
    "0095": "A 4 · AS Köln-Eifeltor → Aachen",
    "0096": "A 4 · AS Köln-Eifeltor → Olpe",
    "0039": "Brücker Mauspfad · BAB-Brücke → Porz",
    "0017": "Aachener Straße · Aachener Weiher → stadteinwärts",
    "0016": "Aachener Straße · Aachener Weiher → stadtauswärts",
    "0011": "Severinsbrücke → Deutz",
    "0035": "Raderthalgürtel · Lat. 28 → Vorgebirgstr.",
    "0041": "Paffrather Str. 34 → Waltherstr.",
    "0042": "Paffrather Str. 34 → Bergisch Gladbach",
}
# Gesetzliche Feiertage NRW 2025 + Rosenmontag (kein Feiertag, in Köln de facto frei)
FEIERTAGE = {
    "2025-01-01": "Neujahr", "2025-03-03": "Rosenmontag", "2025-04-18": "Karfreitag",
    "2025-04-21": "Ostermontag", "2025-05-01": "Tag der Arbeit", "2025-05-29": "Christi Himmelfahrt",
    "2025-06-09": "Pfingstmontag", "2025-06-19": "Fronleichnam", "2025-10-03": "Tag der Deutschen Einheit",
    "2025-11-01": "Allerheiligen", "2025-12-25": "1. Weihnachtstag", "2025-12-26": "2. Weihnachtstag",
}


def tol(kmh):
    return 3 if kmh <= 100 else math.ceil(kmh * 0.03)


def main():
    con = sqlite3.connect(DB)
    con.create_function("tol", 1, tol)
    q = lambda s, *a: con.execute(s, a).fetchall()
    one = lambda s, *a: con.execute(s, a).fetchone()

    # Arbeitsansicht: nur Tempofälle, mit implizitem Limit
    con.executescript("""
      DROP VIEW IF EXISTS tempo;
      CREATE TEMP VIEW tempo AS
        SELECT v.*, kmh - ueber - tol(kmh) AS lim
        FROM verstoss v
        WHERE dienststelle != 'K-04' OR kmh - ueber - tol(kmh) IN (50, 70);
    """)

    total = one("SELECT COUNT(*) FROM verstoss")[0]
    n = one("SELECT COUNT(*) FROM tempo")[0]
    days = 365
    d = {"meta": {
        "zeilen_gesamt": total,
        "tempofaelle": n,
        "k04_nicht_tempo": total - n,
        "pro_tag": round(n / days),
        "sekunden_pro_fall": round(86400 * days / n, 1),
        "messstellen": one("SELECT COUNT(DISTINCT dienststelle || standort) FROM tempo WHERE standort != '0000'")[0],
        "stationaer_standorte": one("SELECT COUNT(DISTINCT standort) FROM tempo WHERE dienststelle='S-01' AND standort!='0000'")[0],
        "mobil_standorte": one("SELECT COUNT(DISTINCT standort) FROM tempo WHERE dienststelle='S-02' AND standort!='0000'")[0],
        "kreuzung_standorte": one("SELECT COUNT(DISTINCT standort) FROM tempo WHERE dienststelle='K-04' AND standort!='0000'")[0],
        "je_dienststelle": dict(q("SELECT dienststelle, COUNT(*) FROM tempo GROUP BY 1")),
        "mobil_tage": one("SELECT COUNT(DISTINCT datum) FROM tempo WHERE dienststelle='S-02'")[0],
        "stand": date.today().isoformat(),
    }}

    # ---- Akt 1: Kalender --------------------------------------------------
    cal = {r[0]: [0, 0, 0] for r in q("SELECT DISTINCT datum FROM verstoss")}
    idx = {"S-01": 0, "S-02": 1, "K-04": 2}
    for dt, dst, c in q("SELECT datum, dienststelle, COUNT(*) FROM tempo GROUP BY 1, 2"):
        cal[dt][idx[dst]] = c
    d["kalender"] = [[k, *v] for k, v in sorted(cal.items())]
    d["feiertage"] = FEIERTAGE
    d["wochentag"] = {
        dst: [c for _, c in q("SELECT wochentag, COUNT(*) FROM tempo WHERE dienststelle=? GROUP BY 1", dst)]
        for dst in ("S-01", "S-02")}
    d["monat"] = {
        dst: [c for _, c in q("SELECT monat, COUNT(*) FROM tempo WHERE dienststelle=? GROUP BY 1", dst)]
        for dst in ("S-01", "S-02")}

    # ---- Akt 2: Uhr (nur stationär = 24/7 gleicher Messaufwand) ------------
    d["stunde_s01"] = [
        {"h": h, "n": c, "p21": round(100 * a / c, 2), "p31": round(100 * b / c, 2), "avg": round(m, 1)}
        for h, c, a, b, m in q("""SELECT stunde, COUNT(*), SUM(ueber>=21), SUM(ueber>=31), AVG(ueber)
                                  FROM tempo WHERE dienststelle='S-01' GROUP BY 1""")]
    d["stunde_s02"] = [c for _, c in q("SELECT stunde, COUNT(*) FROM tempo WHERE dienststelle='S-02' GROUP BY 1")]
    wh = [[0] * 24 for _ in range(7)]
    wh21 = [[0] * 24 for _ in range(7)]
    for w, h, c, a in q("SELECT wochentag, stunde, COUNT(*), SUM(ueber>=21) FROM tempo WHERE dienststelle='S-01' GROUP BY 1, 2"):
        wh[w][h], wh21[w][h] = c, a
    d["woche_stunde_s01"] = {"n": wh, "n21": wh21}

    # ---- Akt 3: Orte -----------------------------------------------------
    # Standorttabelle als Lookup. K-04-Codes (7018 …) entsprechen sloc-04 mit +100 (7118 …):
    # 1:1 lückenlos und mit übereinstimmenden Tempolimits (50/70) → Zuordnung abgeleitet.
    stamm = {(dst, code): r for dst, code, *r in q("SELECT dienststelle, code, ort, lage, richtung FROM standort")}

    def stammsatz(dst, code):
        if dst == "K-04":
            return stamm.get(("S-04", f"{int(code) + 100:04d}"), ("", "", ""))
        return stamm.get((dst, code), ("", "", ""))

    lim_mode = {}
    for dst, code, lim, c in q("SELECT dienststelle, standort, lim, COUNT(*) FROM tempo GROUP BY 1, 2, 3"):
        if c > lim_mode.get((dst, code), (0, 0))[1]:
            lim_mode[(dst, code)] = (lim, c)
    hours = {}
    for dst, code, h, c in q("SELECT dienststelle, standort, stunde, COUNT(*) FROM tempo GROUP BY 1, 2, 3"):
        hours.setdefault((dst, code), [0] * 24)[h] = c
    sites = []
    for dst, code, c, nd, first, last, avg, vmax, k, p21 in q("""
        SELECT dienststelle, standort, COUNT(*), COUNT(DISTINCT datum), MIN(datum), MAX(datum),
               AVG(ueber), MAX(kmh), SUM(kennz='K'), SUM(ueber>=21)
        FROM tempo WHERE standort != '0000' GROUP BY 1, 2"""):
        ort, lage, richtung = stammsatz(dst, code)
        sites.append({
            "d": dst, "c": code, "n": c, "tage": nd, "von": first, "bis": last,
            "pt": round(c / nd, 1), "avg": round(avg, 1), "vmax": vmax,
            "k": round(100 * k / c, 1), "p21": round(100 * p21 / c, 1), "lim": lim_mode[(dst, code)][0],
            "ort": ort or "", "lage": (lage or "").strip(), "ri": (richtung or "").strip(),
            "h": hours[(dst, code)], "name": S01_NAMEN.get(code) if dst == "S-01" else None})
    sites.sort(key=lambda s: -s["n"])
    d["standorte"] = sites

    # ---- Akt 4: Lernkurven neuer Anlagen -----------------------------------
    lern = {}
    for code, name in (("0015", "B 55a, Ausfahrt Frankfurter Straße → Olpe"),
                       ("0005", "Innere Kanalstraße → Niehler Straße")):
        start = one("SELECT MIN(datum) FROM tempo WHERE dienststelle='S-01' AND standort=? AND datum > '2025-01-02'"
                    " AND datum >= (SELECT MIN(datum) FROM tempo WHERE dienststelle='S-01' AND standort=? "
                    " GROUP BY datum HAVING COUNT(*) > 20 LIMIT 1)", code, code)[0]
        rows = q("""SELECT CAST((julianday(datum) - julianday(?)) / 7 AS INT) AS w,
                           COUNT(*), SUM(kennz='K'), SUM(kennz IS NULL OR kennz!='K'), COUNT(DISTINCT datum)
                    FROM tempo WHERE dienststelle='S-01' AND standort=? AND datum >= ?
                    GROUP BY 1 ORDER BY 1""", start, code, start)
        lern[code] = {"name": name, "start": start,
                      "wochen": [{"w": w, "n": c, "k": k, "a": a, "tage": nd} for w, c, k, a, nd in rows]}
    d["lernkurven"] = lern

    # ---- Akt 5: Herkunft -------------------------------------------------
    def herkunft(where):
        rows = q(f"SELECT kennz, COUNT(*) FROM tempo WHERE {where} GROUP BY 1")
        g = {"Köln": 0, "Umland": 0, "Übriges Deutschland": 0, "Ohne/Sonder/Ausland": 0}
        for k, c in rows:
            if k == "K":
                g["Köln"] += c
            elif k in UMLAND:
                g["Umland"] += c
            elif k in KFZ:
                g["Übriges Deutschland"] += c
            else:
                g["Ohne/Sonder/Ausland"] += c
        return g
    d["herkunft"] = {"alle": herkunft("1"), "S-01": herkunft("dienststelle='S-01'"),
                     "S-02": herkunft("dienststelle='S-02'"), "K-04": herkunft("dienststelle='K-04'")}
    # Nur gültige deutsche Unterscheidungszeichen (die Spalte enthält vereinzelt
    # Fragmente ausländischer Wunschkennzeichen – die werden nicht veröffentlicht).
    d["kennz_top"] = [{"k": k, "ort": KFZ[k], "n": c, "s01": a, "s02": b, "avg": round(m, 1)}
                      for k, c, a, b, m in q("""
        SELECT kennz, COUNT(*), SUM(dienststelle='S-01'), SUM(dienststelle='S-02'), AVG(ueber)
        FROM tempo WHERE kennz IS NOT NULL GROUP BY 1 ORDER BY 2 DESC""") if k in KFZ][:60]
    d["meta"]["kennz_bezirke"] = sum(1 for (k,) in q("SELECT DISTINCT kennz FROM tempo") if k in KFZ)
    d["umland"] = sorted(UMLAND)

    # ---- Akt 6: Wie schnell ------------------------------------------------
    hist = dict(q("SELECT MIN(ueber, 71), COUNT(*) FROM tempo GROUP BY 1"))
    d["hist_ueber"] = [hist.get(i, 0) for i in range(0, 72)]  # Index 71 = „über 70"
    d["limits"] = [{"lim": l, "n": c, "avg": round(a, 1), "p21": round(100 * p / c, 2)} for l, c, a, p in q(
        "SELECT lim, COUNT(*), AVG(ueber), SUM(ueber>=21) FROM tempo GROUP BY 1 HAVING COUNT(*) > 100 ORDER BY 1")]
    d["fahrverbot"] = {
        "innerorts_ab31": one("SELECT COUNT(*) FROM tempo WHERE lim<=50 AND ueber>=31")[0],
        "ausserorts_ab41": one("SELECT COUNT(*) FROM tempo WHERE lim>50 AND ueber>=41")[0],
        "punkte_ab21": one("SELECT COUNT(*) FROM tempo WHERE ueber>=21")[0],
        "bis10": one("SELECT COUNT(*) FROM tempo WHERE ueber<=10")[0],
        "bis20": one("SELECT COUNT(*) FROM tempo WHERE ueber<=20")[0],
    }
    d["extreme"] = [{"datum": dt, "zeit": t[:5], "kmh": k, "ueber": u, "lim": l, "d": dst,
                     "ort": ort or "", "lage": (lage or "").strip()} for dt, t, k, u, l, dst, ort, lage in q("""
        SELECT datum, uhrzeit, kmh, ueber, lim, t.dienststelle, s.ort, s.lage FROM tempo t
        LEFT JOIN standort s ON s.dienststelle=t.dienststelle AND s.code=t.standort
        ORDER BY ueber DESC LIMIT 25""")]
    # Streupunkte für die Extrem-Grafik: alle Fälle ab 31 km/h drüber
    d["streu"] = q("SELECT lim, kmh, stunde FROM tempo WHERE ueber >= 31")

    # ---- Bußgeld-Schätzung (falls Katalog vorhanden) ------------------------
    if BUSSGELD.exists():
        kat = json.loads(BUSSGELD.read_text(encoding="utf-8"))
        def euro(u, inner):
            for stufe in kat["innerorts" if inner else "ausserorts"]:
                if u <= stufe["bis"]:
                    return stufe["euro"]
            return 0
        s_all, s_site = 0, {}
        for dst, code, u, l, c in q("SELECT dienststelle, standort, ueber, lim, COUNT(*) FROM tempo WHERE ueber > 0 GROUP BY 1, 2, 3, 4"):
            e = euro(u, l <= 50) * c
            s_all += e
            s_site[(dst, code)] = s_site.get((dst, code), 0) + e
        for s in d["standorte"]:
            s["eur"] = s_site.get((s["d"], s["c"]), 0)
        d["bussgeld"] = {"summe_eur": s_all, "quelle": kat.get("quelle"), "stand": kat.get("stand")}

    OUT.write_text(json.dumps(d, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"✓ {OUT.relative_to(ROOT)} · {OUT.stat().st_size/1024:.0f} KB · {n:,} Tempofälle")


if __name__ == "__main__":
    main()
