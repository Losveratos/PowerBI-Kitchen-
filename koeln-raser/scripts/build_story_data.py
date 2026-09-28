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


def prepare(con):
    """Arbeitsansicht: nur Tempofälle, mit implizitem Limit (auch von build_map_data.py genutzt)."""
    con.create_function("tol", 1, tol)
    con.executescript("""
      DROP VIEW IF EXISTS tempo;
      CREATE TEMP VIEW tempo AS
        SELECT v.*, kmh - ueber - tol(kmh) AS lim
        FROM verstoss v
        WHERE dienststelle != 'K-04' OR (kmh - ueber - tol(kmh) IN (50, 70) AND ueber > 0);
    """)
    # K-04: Zeilen ohne Überschreitung (gemessen genau Limit + Toleranz) sind keine Tempofälle,
    # vermutlich Rotlicht — seit v3.1 ausgeschlossen (Hinweis aus dem Peer-Review)


def main():
    con = sqlite3.connect(DB)
    prepare(con)
    q = lambda s, *a: con.execute(s, a).fetchall()
    one = lambda s, *a: con.execute(s, a).fetchone()

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
        {"h": h, "n": c, "p21": round(100 * a / c, 3), "p31": round(100 * b / c, 3), "avg": round(m, 1)}
        for h, c, a, b, m in q("""SELECT stunde, COUNT(*), SUM(ueber>=21), SUM(ueber>=31), AVG(ueber)
                                  FROM tempo WHERE dienststelle='S-01' GROUP BY 1""")]
    # Hero „Lichtspuren": deterministische Stichprobe echter Fälle der festen Anlagen
    # (jede 97. Zeile) als [Stunde, gemessen km/h, Limit, zu viel]
    d["hero"] = q("SELECT stunde, kmh, lim, ueber FROM tempo WHERE dienststelle='S-01' AND id % 97 = 0 ORDER BY id")
    d["stunde_s02"] = [c for _, c in q("SELECT stunde, COUNT(*) FROM tempo WHERE dienststelle='S-02' GROUP BY 1")]
    wh = [[0] * 24 for _ in range(7)]
    wh21 = [[0] * 24 for _ in range(7)]
    for w, h, c, a in q("SELECT wochentag, stunde, COUNT(*), SUM(ueber>=21) FROM tempo WHERE dienststelle='S-01' GROUP BY 1, 2"):
        wh[w][h], wh21[w][h] = c, a
    d["woche_stunde_s01"] = {"n": wh, "n21": wh21}

    # Nacht (22–6 Uhr) gegen Tag (10–18 Uhr), nur feste Anlagen: gepoolt und je Anlage bereinigt
    # (Mantel-Haenszel-Risikoverhältnis), damit nicht zwei Extremstunden den Befund tragen
    def nacht_tag(thr):
        rows = q("""SELECT standort, SUM(n), SUM(n AND ueber>=?), SUM(t), SUM(t AND ueber>=?) FROM
                    (SELECT standort, ueber, (stunde>=22 OR stunde<6) AS n, (stunde>=10 AND stunde<18) AS t
                     FROM tempo WHERE dienststelle='S-01') GROUP BY 1""", thr, thr)
        n1, a1 = sum(r[1] for r in rows), sum(r[2] for r in rows)
        n0, a0 = sum(r[3] for r in rows), sum(r[4] for r in rows)
        num = sum(a * t0 / (t1 + t0) for _, t1, a, t0, c in rows if t1 + t0)
        den = sum(c * t1 / (t1 + t0) for _, t1, a, t0, c in rows if t1 + t0)
        return {"nacht_faelle": n1, "nacht_schwer": a1, "nacht_p": round(100 * a1 / n1, 2),
                "tag_faelle": n0, "tag_schwer": a0, "tag_p": round(100 * a0 / n0, 2),
                "faktor": round((a1 / n1) / (a0 / n0), 1), "faktor_je_anlage": round(num / den, 1)}
    d["nacht_tag"] = {"p21": nacht_tag(21), "p31": nacht_tag(31)}
    # Fahrverbots-Tempo nur innerorts (Limit ≤ 50) um 3 und um 14 Uhr, mit Fallzahlen
    d["innerorts_p31"] = {str(h): dict(zip(("n", "schwer", "p"), one(
        "SELECT COUNT(*), SUM(ueber>=31), ROUND(100.0*SUM(ueber>=31)/COUNT(*),2) FROM tempo WHERE dienststelle='S-01' AND lim<=50 AND stunde=?", h)))
        for h in (3, 14)}

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

    # Plausibilität des abgeleiteten Limits: Vergleich mit der Spalte limit_pkw der Standorttabellen
    lp = {(dst, code): l for dst, code, l in q("SELECT dienststelle, code, limit_pkw FROM standort")}
    tab = lambda dst, code: lp.get(("S-04", f"{int(code) + 100:04d}")) if dst == "K-04" else lp.get((dst, code))
    ok = tot = 0
    abw = {}
    for dst, code, lim, c in q("SELECT dienststelle, standort, lim, COUNT(*) FROM tempo WHERE standort!='0000' GROUP BY 1, 2, 3"):
        t = tab(dst, code)
        if t is None:
            continue
        tot += c
        if lim == t:
            ok += c
        else:
            abw[(dst, code, t)] = abw.get((dst, code, t), 0) + c
    (gd, gc, gt), gn = max(abw.items(), key=lambda kv: kv[1])
    d["limit_abgleich"] = {"anteil": round(100 * ok / tot, 1), "ohne_groesste": round(100 * ok / (tot - gn), 1),
                           "groesste": {"d": gd, "c": gc, "tabelle": gt, "daten": lim_mode[(gd, gc)][0], "faelle": gn,
                                        "name": S01_NAMEN.get(gc) if gd == "S-01" else gc}}

    # ---- Akt 5: Lernkurven neuer Anlagen -----------------------------------
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
    # Kontrollreihe: Anlagen, die das ganze Jahr liefern (erste Fälle bis 10.01., letzte ab 20.12.),
    # Fälle je Anlagen-Betriebstag, wöchentlich ab dem Start der jeweiligen neuen Anlage
    alt = [c for (c,) in q("""SELECT standort FROM tempo WHERE dienststelle='S-01' AND standort!='0000'
                               GROUP BY 1 HAVING MIN(datum) <= '2025-01-10' AND MAX(datum) >= '2025-12-20'""")]
    ph = ",".join("?" * len(alt))
    for code, L in lern.items():
        L["kontrolle"] = [{"w": w, "n": c, "tage": t} for w, c, t in q(f"""
            SELECT CAST((julianday(datum) - julianday(?)) / 7 AS INT), COUNT(*), COUNT(DISTINCT standort || datum)
            FROM tempo WHERE dienststelle='S-01' AND datum >= ? AND standort IN ({ph}) GROUP BY 1 ORDER BY 1""",
            L["start"], L["start"], *alt)]
        L["kontrolle_anlagen"] = len(alt)
    # Alle 2025 neu gestarteten festen Anlagen: Fälle je Betriebstag in Woche 0–1 gegen Woche 12–19
    neu = []
    for code, first in q("""SELECT standort, MIN(datum) FROM tempo WHERE dienststelle='S-01' AND standort!='0000'
                            GROUP BY 1 HAVING MIN(datum) > '2025-01-10' ORDER BY 2"""):
        # Start = erster Tag, ab dem die Anlage an mindestens 4 der folgenden 7 Tage Fälle hat (Testfälle ignorieren)
        days = [r[0] for r in q("SELECT DISTINCT datum FROM tempo WHERE dienststelle='S-01' AND standort=? ORDER BY 1", code)]
        start = next((dt for i, dt in enumerate(days)
                      if sum(1 for x in days[i:i + 7] if (date.fromisoformat(x) - date.fromisoformat(dt)).days < 7) >= 4), first)
        wk = {w: (c, t, a) for w, c, t, a in q("""
            SELECT CAST((julianday(datum) - julianday(?)) / 7 AS INT), COUNT(*), COUNT(DISTINCT datum), SUM(ueber>=21)
            FROM tempo WHERE dienststelle='S-01' AND standort=? AND datum >= ? GROUP BY 1""", start, code, start)}
        per = lambda ws: (sum(wk[w][0] for w in ws if w in wk), sum(wk[w][1] for w in ws if w in wk))
        (b_n, b_t), (e_n, e_t) = per([0, 1]), per(range(12, 20))
        s = next(x for x in sites if x["d"] == "S-01" and x["c"] == code)
        neu.append({"c": code, "name": S01_NAMEN.get(code) or " · ".join(filter(None, [s["lage"] or s["ort"], s["ri"]])),
                    "start": start, "bis": s["bis"], "tage": s["tage"], "n": s["n"],
                    "anfang_pt": round(b_n / b_t, 1) if b_t else None,
                    "plateau_pt": round(e_n / e_t, 1) if e_t >= 20 else None,
                    "plateau_tage": e_t,
                    "delta": round(100 * ((e_n / e_t) / (b_n / b_t) - 1)) if b_t and e_t >= 20 else None})
    d["neue_anlagen"] = neu
    # B 55a: Anteil ≥ 21 km/h in den ersten zwei Wochen gegen die letzten vier Wochen; Limit in den ersten Tagen
    d["b55a"] = {
        "p21_anfang": one("SELECT ROUND(100.0*SUM(ueber>=21)/COUNT(*),1) FROM tempo WHERE dienststelle='S-01' AND standort='0015' AND datum BETWEEN '2025-08-14' AND '2025-08-27'")[0],
        "p21_ende": one("SELECT ROUND(100.0*SUM(ueber>=21)/COUNT(*),1) FROM tempo WHERE dienststelle='S-01' AND standort='0015' AND datum BETWEEN '2025-12-04' AND '2025-12-31'")[0],
        "limit60": list(one("SELECT COUNT(*), MIN(datum), MAX(datum) FROM tempo WHERE dienststelle='S-01' AND standort='0015' AND lim=60")),
        "gegenrichtung_vorher": one("SELECT ROUND(COUNT(*)*1.0/COUNT(DISTINCT datum),1) FROM tempo WHERE dienststelle='S-01' AND standort='0002' AND datum BETWEEN '2025-06-01' AND '2025-08-13'")[0],
        "gegenrichtung_nachher": one("SELECT ROUND(COUNT(*)*1.0/COUNT(DISTINCT datum),1) FROM tempo WHERE dienststelle='S-01' AND standort='0002' AND datum BETWEEN '2025-10-01' AND '2025-12-31'")[0],
    }
    d["lernkurven"] = lern

    # ---- Akt 6: Herkunft -------------------------------------------------
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

    # ---- Akt 7: Wie schnell ------------------------------------------------
    hist = dict(q("SELECT MIN(ueber, 71), COUNT(*) FROM tempo GROUP BY 1"))
    d["hist_ueber"] = [hist.get(i, 0) for i in range(0, 72)]  # Index 71 = „über 70"
    d["limits"] = [{"lim": l, "n": c, "avg": round(a, 1), "p21": round(100 * p / c, 2)} for l, c, a, p in q(
        "SELECT lim, COUNT(*), AVG(ueber), SUM(ueber>=21) FROM tempo GROUP BY 1 HAVING COUNT(*) > 100 ORDER BY 1")]
    d["fahrverbot"] = {
        "innerorts_ab31": one("SELECT COUNT(*) FROM tempo WHERE lim<=50 AND ueber>=31")[0],
        "alle_ab31": one("SELECT COUNT(*) FROM tempo WHERE ueber>=31")[0],   # obere Grenze, falls Tempo 60–80 innerorts liegt
        "genau6": one("SELECT COUNT(*) FROM tempo WHERE ueber=6")[0],
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
        # Rangfolge-Check: die B 55a (Tempo 80), wenn man sie trotzdem als innerorts bewertet
        b55_inner = sum(euro(u, True) * c for u, c in q(
            "SELECT ueber, COUNT(*) FROM tempo WHERE dienststelle='S-01' AND standort='0015' AND ueber > 0 GROUP BY 1"))
        d["bussgeld"] = {"summe_eur": s_all, "quelle": kat.get("quelle"), "stand": kat.get("stand"),
                         "b55a_als_innerorts_eur": b55_inner}
    # Messzeiten der mobilen Messung (für das Fazit): Anteil nachts (22–6 Uhr) und am Wochenende
    mn, mnacht, mwe = one("SELECT COUNT(*), SUM(stunde>=22 OR stunde<6), SUM(wochentag>=5) FROM tempo WHERE dienststelle='S-02'")
    d["meta"]["mobil_nacht_anteil"] = round(100 * mnacht / mn, 1)
    d["meta"]["mobil_wochenende_anteil"] = round(100 * mwe / mn, 1)

    # ---- Akt 4: Karte (nur aus den versionierten Geodateien, kein Netz) ------
    if (ROOT / "data" / "geo" / "koeln_grenzen_osm.json.gz").exists():
        import build_map_data
        d["karte"] = build_map_data.build_karte(con, d)
        build_map_data.report(d["karte"])

    OUT.write_text(json.dumps(d, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"✓ {OUT.relative_to(ROOT)} · {OUT.stat().st_size/1024:.0f} KB · {n:,} Tempofälle")


if __name__ == "__main__":
    main()
