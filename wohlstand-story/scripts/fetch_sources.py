#!/usr/bin/env python3
"""Holt die Originalwerte, gegen die die Story „Zwei Heimaten“ geprüft wird → data/sources/*.json.

Der Wohlstandsatlas (wohlstandsatlas/atlas-data.js) ist die einzige Zahlenquelle der Story; die Pipeline, die ihn
erzeugt hat, liegt nicht im Repo. Dieses Skript holt die zugrunde liegenden Werte direkt bei den Ämtern, damit
der Abgleich (data/sources/ABGLEICH.md) nachvollziehbar und wiederholbar ist:

  Eurostat      nama_10r_3gdp     BIP NUTS-3, Mio. EUR (2022, 2023)            → eurostat_nuts3_de.json
                nama_10r_3popgdp  Bevölkerung zur BIP-Rechnung, Tsd. (2022, 2023)
                nama_10r_2hhinc   Einkommen privater Haushalte NUTS-2           → eurostat_hhinc_nuts2.json
  Weltbank WDI  NY.GDP.PCAP.PP.CD BIP pro Kopf, KKP, laufende Int.$ (2024)     → worldbank_gdp_pc_ppp_2024.json
                NY.GDP.PCAP.PP.KD BIP pro Kopf, KKP, Int.$ von 2021 (2000–2024) → worldbank_gdp_pc_ppp_kd.json
                SP.POP.TOTL       Bevölkerung (2000–2024)                       → worldbank_pop.json
                SI.POV.GINI       Gini-Index, Deutschland                       → worldbank_gini_deu.json
  VGR der Länder Reihe 2 Band 3, Tabelle 2.4: verfügbares Einkommen der privaten
                Haushalte je Einwohner, Kreise (Excel)                          → vgrdl_verfuegbares_einkommen_kreise.json
                Reihe 2 Band 1, Tabellen 1.1/5/6: BIP, Einwohner, BIP je Einwohner,
                Kreise, jüngster Rechenstand (Excel)                            → vgrdl_bip_kreise.json

    python3 -I wohlstand-story/scripts/fetch_sources.py

Nur Standardbibliothek; openpyxl wird ausschließlich für die Excel-Dateien der VGRdL gebraucht (pip install openpyxl).
Geschrieben wird nur unter data/sources/. Die Excel-Dateien werden im Speicher gelesen, nicht abgelegt.
Fällt eine Quelle aus, werden die übrigen trotzdem geschrieben; der Exit-Code ist dann 1.
"""
import datetime
import io
import json
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "sources"
TODAY = datetime.date.today().isoformat()
TIMEOUT = 90
UA = "wohlstand-story-fetch/1.0 (python urllib)"

ESTAT = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/"
WB = "https://api.worldbank.org/v2/"


class FetchError(RuntimeError):
    pass


def get(url, tries=3):
    """Lädt eine URL mit Zeitüberschreitung und wenigen Wiederholungen; klare Meldung, wenn der Host nicht antwortet."""
    host = urllib.request.urlparse(url).netloc
    last = None
    for k in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            last = f"HTTP {e.code} {e.reason}"
            if e.code in (400, 401, 403, 404):
                break
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            last = f"{type(e).__name__}: {getattr(e, 'reason', e)}"
        time.sleep(2 * (k + 1))
    raise FetchError(f"{host} nicht erreichbar oder Anfrage abgelehnt ({last}) – URL: {url}")


def get_json(url):
    raw = get(url)
    try:
        return json.loads(raw)
    except ValueError as e:
        raise FetchError(f"Antwort ist kein JSON ({e}) – URL: {url}")


def write(name, obj):
    OUT.mkdir(parents=True, exist_ok=True)
    p = OUT / name
    tmp = p.with_suffix(".tmp")
    tmp.write_text(json.dumps(obj, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    tmp.replace(p)
    print(f"  ✓ {p.relative_to(ROOT)} · {p.stat().st_size / 1024:.0f} KB")


# ---------- Eurostat (JSON-stat 2.0) ----------
def estat(table, **params):
    q = "&".join(f"{k}={v}" for k, vals in params.items() for v in (vals if isinstance(vals, (list, tuple)) else [vals]))
    url = f"{ESTAT}{table}?format=JSON&lang=EN&{q}"
    d = get_json(url)
    if "value" not in d or "id" not in d:
        raise FetchError(f"Eurostat {table}: unerwartete Antwort {str(d)[:200]}")
    ids, size = d["id"], d["size"]
    cats = [sorted(d["dimension"][k]["category"]["index"].items(), key=lambda x: x[1]) for k in ids]
    status = d.get("status") or {}
    rows = {}
    for flat, v in d["value"].items():
        i, key = int(flat), []
        for n in reversed(size):
            key.append(i % n); i //= n
        key = tuple(cats[dim][pos][0] for dim, pos in enumerate(reversed(key)))
        rows[key] = (v, status.get(flat))
    labels = d["dimension"]["geo"]["category"].get("label", {})
    return {"ids": ids, "rows": rows, "labels": labels, "updated": d.get("updated"), "label": d.get("label"), "url": url}


def is_de_region(geo):
    return geo == "DE" or (geo.startswith("DE") and len(geo) in (3, 4, 5) and not geo.endswith("Z"))


def eurostat_nuts3():
    years = ["2022", "2023"]
    gdp = estat("nama_10r_3gdp", unit="MIO_EUR", time=years)
    pop = estat("nama_10r_3popgdp", unit="THS", time=years)
    gi, pi = gdp["ids"], pop["ids"]
    reg = {}
    for key, (v, st) in gdp["rows"].items():
        k = dict(zip(gi, key))
        if is_de_region(k["geo"]):
            r = reg.setdefault(k["geo"], {"name": gdp["labels"].get(k["geo"]), "level": len(k["geo"]) - 2})
            r[f"bip_mio_eur_{k['time']}"] = v
            if st:
                r[f"bip_status_{k['time']}"] = st
    for key, (v, st) in pop["rows"].items():
        k = dict(zip(pi, key))
        if k["geo"] in reg:
            reg[k["geo"]][f"bev_tsd_{k['time']}"] = v
            if st:
                reg[k["geo"]][f"bev_status_{k['time']}"] = st
    n3 = sum(1 for g in reg if len(g) == 5)
    if n3 < 390:
        raise FetchError(f"Eurostat NUTS-3: nur {n3} deutsche Kreise gefunden")
    write("eurostat_nuts3_de.json", {
        "quelle": "Eurostat", "abruf": TODAY,
        "tabellen": {"nama_10r_3gdp": {"titel": gdp["label"], "einheit": "MIO_EUR (Mio. EUR, laufende Preise)", "stand": gdp["updated"]},
                     "nama_10r_3popgdp": {"titel": pop["label"], "einheit": "THS (Tsd. Personen, Jahresdurchschnitt)", "stand": pop["updated"]}},
        "hinweis": "Deutschland (DE), Länder (NUTS-1), Regierungsbezirke (NUTS-2), Kreise (NUTS-3, 400). Status p = vorläufig.",
        "regionen": dict(sorted(reg.items())),
    })


def eurostat_hhinc():
    geos = ["DE", "DEA2", "DE40", "DEA", "DE4"]
    d = estat("nama_10r_2hhinc", geo=geos, na_item="B6N", direct="BAL",
              unit=["EUR_HAB", "PPS_EU27_2020_HAB", "MIO_EUR"], sinceTimePeriod="2019")
    out = {}
    for key, (v, st) in d["rows"].items():
        k = dict(zip(d["ids"], key))
        g = out.setdefault(k["geo"], {"name": d["labels"].get(k["geo"])})
        g.setdefault(f"{k['na_item']}_{k['unit']}", {})[k["time"]] = v
    write("eurostat_hhinc_nuts2.json", {
        "quelle": "Eurostat", "tabelle": "nama_10r_2hhinc", "titel": d["label"], "stand": d["updated"], "abruf": TODAY,
        "einheiten": {"EUR_HAB": "EUR je Einwohner", "PPS_EU27_2020_HAB": "KKS (EU27 ab 2020) je Einwohner", "MIO_EUR": "Mio. EUR"},
        "merkmal": {"B6N": "verfügbares Einkommen, netto (Saldo), private Haushalte inkl. private Organisationen ohne Erwerbszweck"},
        "regionen": out,
    })


# ---------- Weltbank WDI ----------
def wb_economies():
    d = get_json(f"{WB}country?format=json&per_page=500")
    return {c["id"]: c["name"] for c in d[1] if c["region"]["value"] != "Aggregates"}


def wb(indicator, date, econ, extra=""):
    url = f"{WB}country/all/indicator/{indicator}?format=json&date={date}&per_page=20000{extra}"
    d = get_json(url)
    if not isinstance(d, list) or len(d) < 2 or d[1] is None:
        raise FetchError(f"Weltbank {indicator}: unerwartete Antwort {str(d)[:200]}")
    meta, rows = d[0], d[1]
    if meta.get("pages", 1) > 1:
        raise FetchError(f"Weltbank {indicator}: mehr als eine Seite ({meta.get('pages')})")
    out = {}
    for r in rows:
        iso = r.get("countryiso3code")
        if iso in econ:
            out.setdefault(iso, {})[int(r["date"])] = r["value"]
    return out, meta.get("lastupdated"), rows[0]["indicator"]["value"] if rows else indicator


def worldbank():
    econ = wb_economies()
    v, upd, title = wb("NY.GDP.PCAP.PP.CD", "2024", econ)
    write("worldbank_gdp_pc_ppp_2024.json", {
        "quelle": "Weltbank, World Development Indicators", "indikator": "NY.GDP.PCAP.PP.CD", "titel": title,
        "einheit": "internationale Dollar, laufende Preise (KKP)", "jahr": 2024, "stand": upd, "abruf": TODAY,
        "werte": {iso: v[iso].get(2024) for iso in sorted(v)},
        "fehlt_2024": sorted(iso for iso in v if v[iso].get(2024) is None),
    })
    years = list(range(2000, 2025))
    for ind, name, unit in (("NY.GDP.PCAP.PP.KD", "worldbank_gdp_pc_ppp_kd.json", "internationale Dollar von 2021 (KKP, konstante Preise)"),
                            ("SP.POP.TOTL", "worldbank_pop.json", "Personen, Jahresmitte")):
        s, upd, title = wb(ind, "2000:2024", econ)
        rnd = (lambda x: None if x is None else round(x, 1)) if ind.startswith("NY") else (lambda x: x)
        write(name, {
            "quelle": "Weltbank, World Development Indicators", "indikator": ind, "titel": title, "einheit": unit,
            "jahre": [years[0], years[-1]], "stand": upd, "abruf": TODAY,
            "hinweis": "ISO3 → Liste der Werte 2000 bis 2024 (null = fehlt); nur Volkswirtschaften, keine Aggregate. Taiwan führt die Weltbank nicht.",
            "werte": {iso: [rnd(s[iso].get(y)) for y in years] for iso in sorted(s)},
            "TWN_vorhanden": "TWN" in s,
        })
    g, upd, title = wb("SI.POV.GINI", "1990:2025", {"DEU": "Germany"})
    g = g.get("DEU", {})
    latest = max((y for y, x in g.items() if x is not None), default=None)
    write("worldbank_gini_deu.json", {
        "quelle": "Weltbank, World Development Indicators", "indikator": "SI.POV.GINI", "titel": title,
        "land": "DEU", "stand": upd, "abruf": TODAY,
        "werte": {str(y): x for y, x in sorted(g.items()) if x is not None},
        "juengster": {"jahr": latest, "wert": g.get(latest)},
    })


# ---------- VGR der Länder (statistikportal.de): Kreisergebnisse als Excel ----------
VGRDL = "https://www.statistikportal.de/de/vgrdl/ergebnisse-kreisebene/"


def vgrdl_workbook(page_url, stem, fallback):
    """Sucht die aktuelle Excel-Datei (Dateiname beginnt mit `stem`) auf der Seite, lädt sie in den Speicher, öffnet sie."""
    try:
        import openpyxl  # nur für die Excel-Dateien der VGRdL gebraucht
    except ImportError:
        raise FetchError("openpyxl fehlt (pip install openpyxl) – nötig nur für die Excel-Dateien der VGRdL")
    page = get(page_url).decode("utf-8", "replace")
    links = re.findall(rf'href="([^"]*{stem}[^"]*\.xlsx)"', page)
    url = urllib.request.urljoin(page_url, links[0]) if links else fallback
    m = re.search(rf"{stem}[^\"]*\.xlsx.{{0,1500}}?Berechnungsstand:\s*([A-Za-zä]+ \d{{4}})", page, re.S)
    raw = get(url)
    if len(raw) > 30e6:
        raise FetchError(f"VGRdL-Excel unerwartet groß ({len(raw)} Bytes): {url}")
    import warnings
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        wb_ = openpyxl.load_workbook(io.BytesIO(raw), read_only=True, data_only=True)
    return wb_, url, (m.group(1) if m else None)


def vgrdl_table(wb_, sheet, n_years, digits=0):
    """Liest eine Kreistabelle (Lfd. Nr. | EU-Code | Regionalschlüssel | Land | NUTS 1 | NUTS 2 | NUTS 3 | Gebietseinheit | Jahre …)."""
    if sheet not in wb_.sheetnames:
        raise FetchError(f"VGRdL-Excel: Tabelle {sheet} fehlt (Blätter: {wb_.sheetnames})")
    rows = list(wb_[sheet].iter_rows(values_only=True))
    title = " · ".join(str(c).strip() for c in (rows[0][0], rows[1][0], rows[2][0]) if c)
    head = next((r for r in rows if r and r[0] == "Lfd. Nr."), None)
    if head is None or head[1] != "EU-Code":
        raise FetchError(f"VGRdL-Excel, Tabelle {sheet}: Kopfzeile nicht gefunden")
    years = [c for c in head if isinstance(c, int)][-n_years:]
    reg = {}
    for r in rows:
        if not r or not isinstance(r[0], (int, float)) or not r[1]:
            continue
        code = str(r[1]).strip()
        ebene = "Kreis" if str(r[6] or "").strip() == "3" else "Regierungsbezirk" if str(r[5] or "").strip() == "2" else \
            "Deutschland" if code == "DE" else "Land"
        val = lambda x: (round(x, digits) if digits else round(x)) if isinstance(x, (int, float)) else None
        reg[code] = {"ags": str(r[2]).strip() if r[2] is not None else None, "name": str(r[7]).strip(), "ebene": ebene,
                     "werte": {str(y): val(r[head.index(y)]) for y in years}}
    n = sum(1 for x in reg.values() if x["ebene"] == "Kreis")
    if n < 390:
        raise FetchError(f"VGRdL-Excel, Tabelle {sheet}: nur {n} Kreise gelesen")
    return title, [str(y) for y in years], reg


def vgrdl_einkommen():
    wb_, url, stand = vgrdl_workbook(VGRDL + "einkommen-kreise", "vgrdl_r2b3_",
                                     "https://www.statistikportal.de/sites/default/files/2026-01/vgrdl_r2b3_bs2024.xlsx")
    title, years, reg = vgrdl_table(wb_, "2.4", 3)
    write("vgrdl_verfuegbares_einkommen_kreise.json", {
        "quelle": "Arbeitskreis „Volkswirtschaftliche Gesamtrechnungen der Länder“ (VGRdL), Reihe 2 Band 3",
        "tabelle": "2.4 · " + title, "datei": url, "berechnungsstand": stand, "abruf": TODAY,
        "einheit": "EUR je Einwohner (verfügbares Einkommen der privaten Haushalte einschl. privater Organisationen ohne Erwerbszweck)",
        "jahre": years, "hinweis": "Schlüssel = EU-Code (NUTS); ags = Regionalschlüssel. Werte auf ganze Euro gerundet.",
        "regionen": reg,
    })


def vgrdl_bip():
    wb_, url, stand = vgrdl_workbook(VGRDL + "bruttoinlandsprodukt-bruttowertschoepfung-kreise", "vgrdl_r2b1_",
                                     "https://www.statistikportal.de/sites/default/files/2026-09/vgrdl_r2b1_bs2025_4.xlsx")
    t1, years, bip = vgrdl_table(wb_, "1.1", 2, digits=3)
    t5, _, ew = vgrdl_table(wb_, "5", 2, digits=3)
    t6, _, pc = vgrdl_table(wb_, "6", 2)
    reg = {}
    for code, x in bip.items():
        reg[code] = {"ags": x["ags"], "name": x["name"], "ebene": x["ebene"], "bip_mio_eur": x["werte"],
                     "einwohner_tsd": ew.get(code, {}).get("werte"), "bip_eur_je_ew": pc.get(code, {}).get("werte")}
    write("vgrdl_bip_kreise.json", {
        "quelle": "Arbeitskreis „Volkswirtschaftliche Gesamtrechnungen der Länder“ (VGRdL), Reihe 2 Band 1",
        "tabellen": {"1.1": t1, "5": t5, "6": t6}, "datei": url, "berechnungsstand": stand, "abruf": TODAY,
        "einheiten": {"bip_mio_eur": "Mio. EUR, jeweilige Preise", "einwohner_tsd": "1000 Personen (Jahresdurchschnitt)",
                      "bip_eur_je_ew": "EUR je Einwohner"},
        "jahre": years,
        "hinweis": "Neuerer Rechenstand als Eurostat nama_10r_3gdp (Revision 2024 der VGRdL). Schlüssel = EU-Code; "
                   "drei Thüringer Kreise tragen hier ein angehängtes x (DEG06x, DEG09x, DEG0Rx; Gebietsstand ab 2024).",
        "regionen": reg,
    })


def main():
    print(f"Quellen abrufen → {OUT.relative_to(ROOT.parent)} (Abruf {TODAY})")
    failed = []
    for name, fn in (("Eurostat NUTS-3", eurostat_nuts3), ("Eurostat Haushaltseinkommen", eurostat_hhinc),
                     ("Weltbank", worldbank), ("VGRdL Einkommen", vgrdl_einkommen), ("VGRdL BIP", vgrdl_bip)):
        try:
            fn()
        except FetchError as e:
            failed.append(name)
            print(f"  ✗ {name}: {e}", file=sys.stderr)
    if failed:
        print(f"Fehlgeschlagen: {', '.join(failed)} – die übrigen Dateien sind aktuell.", file=sys.stderr)
        sys.exit(1)
    print("✓ alle Quellen geschrieben")


if __name__ == "__main__":
    main()
