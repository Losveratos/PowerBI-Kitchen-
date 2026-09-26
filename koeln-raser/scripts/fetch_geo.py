#!/usr/bin/env python3
"""Holt die Geodaten für die Karten-Akte der Raser-Story. LOKAL ausführen
(die Cloud-Umgebung der Story-Session darf die APIs nicht erreichen).

    export GEOAPIFY_KEY=...            # Key von https://myprojects.geoapify.com
    python3 koeln-raser/scripts/build_db.py        # falls data/raser_2025.sqlite fehlt
    python3 koeln-raser/scripts/fetch_geo.py

Nur Python-Standardbibliothek. Dauer ca. 5–8 Minuten (Rate-Limit-freundlich).
Abbruch ist unkritisch: Ergebnisse werden in data/geo/geocode_cache.json
zwischengespeichert, ein erneuter Aufruf macht dort weiter.

Ergebnisse (alle in koeln-raser/data/geo/, bitte committen und pushen):
  messstellen_geocoded.json   Koordinaten + Genauigkeit je Messstelle
  messstellen_review.csv      zum Gegenprüfen (mit OSM-Link); Korrekturen in
                              manual_coords.csv eintragen (dienststelle,code,lat,lon)
  koeln_grenzen.json          Stadtgrenze, Stadtbezirke, Stadtteile (Geoapify Boundaries)
  osm_koeln.json.gz           Rhein + Autobahnen/Hauptstraßen (Overpass, © OSM-Mitwirkende, ODbL)

Der API-Key wird nirgends gespeichert.
"""
import argparse
import csv
import gzip
import json
import os
import re
import sqlite3
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "data" / "raser_2025.sqlite"
GEO = ROOT / "data" / "geo"
CACHE = GEO / "geocode_cache.json"

KOELN = (6.9603, 50.9375)                  # lon, lat Dom-Umgebung
BBOX = (6.77, 50.83, 7.17, 51.09)          # lon_min, lat_min, lon_max, lat_max (Stadtgebiet + Rand)
GEOAPIFY = "https://api.geoapify.com"
OVERPASS = "https://overpass-api.de/api/interpreter"
UA = "DatenWG-Raser-Story/1.0 (koeln-raser/scripts/fetch_geo.py)"

# ---------------------------------------------------------------------------
# Adress-Bereinigung (offline getestet an allen 2025 aktiven Messstellen)
# ---------------------------------------------------------------------------
STREET_END = r"(?:straße|strasse|str\.|str\b|weg|ring|gürtel|allee|platz|ufer|damm|gasse|pfad|chaussee|brücke|wall|markt|steg|park|hof|berg|feld|tunnel|kamp)"
NUM_TOKENS = r"(?:hs\.?\s*nr?\.?|haus\s*nr\.?|hausnr\.?|hausr\.?|haus|höhe\s+haus(?:\s*nr\.?)?|höhe|in\s+höhe|geg\.?\s*nr\.?|geg\.?|gegenüber|ggü\.?b?\.?|ggüb\.?|nr\.?)"


def _expand(street):
    s = re.sub(r"(?i)\bstr\.?$", "Straße", street.strip())
    s = re.sub(r"(?i)(\w)str\.?$", r"\1straße", s)
    s = re.sub(r"(?i)\bStr\.?(?=\s)", "Straße", s)
    return re.sub(r"\s+", " ", s).strip(" ,.-")


def parse_lage(text):
    """'Brühler Str.HS.Nr.279' → ('Brühler Straße', '279'); 'Geldernstraße Laterne 30-12' → ('Geldernstraße', None)."""
    if not text:
        return None, None
    s = re.sub(r"(?i)(str)\.(?=\S)", r"\1. ", text)                 # 'Str.HS' → 'Str. HS'
    s = re.sub(r"(?i)(?<=[a-zäöüß])(?=(?:hs|lat|haus)\b)", " ", s)
    s = re.sub(r"(?i)\b(?:laterne|lat\.?|l)\s*\.?\s*\d+[a-z]?(?:\s*[-/]\s*\d+[a-z]?)?", " ", s)  # Laternen-Nr. sind keine Hausnummern
    s = re.sub(r"(?i)\s*\((?:[^)]*)\)", " ", s)
    hn = None
    m = re.search(rf"(?i){NUM_TOKENS}\s*(\d+[a-z]?)", s)
    if m:
        hn = m.group(1)
    street_part = re.split(rf"(?i),|\s{NUM_TOKENS}\b|\s\d|\sv\.|\szw\.?|\s-\s|\skreuzung|\s/", " " + s, maxsplit=1)[0]
    street_part = street_part.strip()
    if hn is None:
        m = re.match(rf"(?i)^(.*?{STREET_END}\.?)\s*(\d+[a-z]?)\b", s.strip())
        if m:
            street_part, hn = m.group(1), m.group(2)
    street = _expand(street_part)
    if not re.search(rf"(?i){STREET_END}\.?$|^am |^an |^auf |^zum |^zur |^im |^in der ", street) and len(street.split()) > 4:
        street = None
    return (street or None), hn


def cross_street(text):
    """'Höhe Escher Straße / Hornstr.' oder 'Kreuzung Elsa-Brändström-Str.' → 'Escher Straße'."""
    m = re.search(rf"(?i)(?:kreuzung|höhe|in höhe|vor|v\.)\s+([A-ZÄÖÜ][\w\-\. äöüß]*?{STREET_END}\.?)", text or "")
    return _expand(m.group(1)) if m else None


# strenger als STREET_END: Stadtteile wie „Ehrenfeld“ oder „Seeberg“ dürfen nicht als Straße gelten
STREET_STRICT = r"(?:straße|strasse|str\.|weg|ring|gürtel|allee|platz|ufer|brücke|kommunalweg)"


def looks_like_street(s):
    return bool(re.search(rf"(?i){STREET_STRICT}(?:\b|$)|bundesstra|\bBAB\b|\bB\s?\d", s or ""))


# Feste Anlagen, bei denen Ort/Lage keine geocodierbare Adresse ergeben (Autobahn, Brücken)
OVERRIDES = {
    ("S-01", "0095"): "Am Eifeltor, Köln", ("S-01", "0096"): "Am Eifeltor, Köln", ("S-01", "0097"): "Am Eifeltor, Köln",
    ("S-01", "0011"): "Severinsbrücke, Köln",
    ("S-01", "0003"): "Zoobrücke, Köln", ("S-01", "0004"): "Zoobrücke, Köln",
    ("S-01", "0012"): "Zoobrücke, Köln", ("S-01", "0013"): "Zoobrücke, Köln",
    # Kreuzungsanlagen (K-04 → sloc-04 +100)
    ("K-04", "7043"): "Venloer Straße, Bocklemünd, Köln", ("K-04", "7044"): "Venloer Straße, Bocklemünd, Köln",
    ("K-04", "7045"): "Venloer Straße, Bocklemünd, Köln",
    ("K-04", "7050"): "Dünnwalder Kommunalweg 6, Köln",
}


def queries_for(dst, code, ort, lage):
    """Liste von (Art, Parameter) in absteigender Präzision."""
    ort, lage = (ort or "").strip(), (lage or "").strip()
    out = []
    if (dst, code) in OVERRIDES:
        return [("text", {"text": OVERRIDES[(dst, code)]})]
    if looks_like_street(ort) and not re.search(r"(?i)^(BAB|Bundesstra)", ort):
        street, cross = _expand(re.sub(r"\(.*?\)", "", ort)), cross_street(lage)
        hn = parse_lage(lage)[1] if re.search(r"(?i)haus|hs|nr|geg", lage) else None
        if hn:
            out.append(("structured", {"street": street, "housenumber": hn, "city": "Köln"}))
        if cross:
            out.append(("text", {"text": f"{street} & {cross}, Köln"}))
        out.append(("structured", {"street": street, "city": "Köln"}))
        return out
    street, hn = parse_lage(lage)
    if street:
        if hn:
            out.append(("structured", {"street": street, "housenumber": hn, "city": "Köln"}))
        out.append(("text", {"text": f"{street}, {ort}, Köln" if ort else f"{street}, Köln"}))
    if re.search(r"(?i)bundesstra|\bB\s?55", ort):
        cross = cross_street(lage)
        if cross:
            out.append(("text", {"text": f"{cross}, Köln"}))
    if ort and not looks_like_street(ort):
        out.append(("suburb", {"text": f"{ort}, Köln", "type": "suburb"}))
    return out


# ---------------------------------------------------------------------------
# HTTP
# ---------------------------------------------------------------------------
def http_json(url, data=None, tries=4):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, data=data, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code in (429, 502, 503, 504) and i < tries - 1:
                time.sleep(2 ** (i + 1)); continue
            body = e.read()[:300].decode("utf-8", "replace")
            raise SystemExit(f"HTTP {e.code} bei {url.split('apiKey')[0]}… → {body}")
        except urllib.error.URLError as e:
            if i < tries - 1:
                time.sleep(2 ** (i + 1)); continue
            raise SystemExit(f"Netzwerkfehler: {e}")


def geoapify(path, params, key):
    params = dict(params, apiKey=key)
    return http_json(f"{GEOAPIFY}{path}?{urllib.parse.urlencode(params)}")


def in_bbox(lon, lat):
    return BBOX[0] <= lon <= BBOX[2] and BBOX[1] <= lat <= BBOX[3]


def geocode_site(q_list, key, cache):
    for kind, p in q_list:
        ck = json.dumps([kind, p], ensure_ascii=False, sort_keys=True)
        if ck not in cache:
            params = {"lang": "de", "limit": 1, "format": "json", "filter": f"rect:{BBOX[0]},{BBOX[1]},{BBOX[2]},{BBOX[3]}",
                      "bias": f"proximity:{KOELN[0]},{KOELN[1]}"}
            if kind == "structured":
                params.update(p, country="Germany")
            else:
                params.update({k: v for k, v in p.items()})
            cache[ck] = geoapify("/v1/geocode/search", params, key).get("results", [])
            time.sleep(0.22)                                     # < 5 Anfragen/s (Free Tier)
        res = cache[ck]
        if not res:
            continue
        r = res[0]
        conf = (r.get("rank") or {}).get("confidence", 0)
        rtype = r.get("result_type")
        if not in_bbox(r["lon"], r["lat"]):
            continue
        if kind == "structured" and "housenumber" in p and rtype == "building" and conf >= 0.6:
            acc = "hausnummer"
        elif kind == "suburb":
            acc = "stadtteil"
        elif rtype in ("building", "street", "amenity") and conf >= 0.4:
            acc = "strasse"
        else:
            continue
        return {"lat": round(r["lat"], 6), "lon": round(r["lon"], 6), "genauigkeit": acc, "result_type": rtype,
                "confidence": conf, "formatted": r.get("formatted"), "query": p}
    return None


def load_sites():
    con = sqlite3.connect(DB)
    rows = con.execute("""
        SELECT DISTINCT v.dienststelle, v.standort FROM verstoss v WHERE v.standort != '0000'""").fetchall()
    stamm = {(d, c): (o, l, r) for d, c, o, l, r in con.execute("SELECT dienststelle, code, ort, lage, richtung FROM standort")}
    sites = []
    for dst, code in sorted(rows):
        key = ("S-04", f"{int(code) + 100:04d}") if dst == "K-04" else (dst, code)
        ort, lage, ri = stamm.get(key, ("", "", ""))
        sites.append({"d": dst, "c": code, "ort": ort or "", "lage": (lage or "").strip(), "ri": (ri or "").strip()})
    return sites


# ---------------------------------------------------------------------------
# Schritte
# ---------------------------------------------------------------------------
def step_geocode(key):
    cache = json.loads(CACHE.read_text(encoding="utf-8")) if CACHE.exists() else {}
    sites, out, miss = load_sites(), [], 0
    for i, s in enumerate(sites, 1):
        hit = geocode_site(queries_for(s["d"], s["c"], s["ort"], s["lage"]), key, cache)
        out.append({**s, **(hit or {"lat": None, "lon": None, "genauigkeit": "fehlt"})})
        miss += hit is None
        if i % 25 == 0 or i == len(sites):
            CACHE.write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")
            print(f"  {i}/{len(sites)} Messstellen · ohne Treffer: {miss}", flush=True)
    (GEO / "messstellen_geocoded.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    with open(GEO / "messstellen_review.csv", "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["dienststelle", "code", "ort", "lage", "richtung", "genauigkeit", "lat", "lon", "gefunden_als", "osm_link"])
        for o in out:
            link = f"https://www.openstreetmap.org/?mlat={o['lat']}&mlon={o['lon']}#map=17/{o['lat']}/{o['lon']}" if o["lat"] else ""
            w.writerow([o["d"], o["c"], o["ort"], o["lage"], o["ri"], o["genauigkeit"], o["lat"], o["lon"], o.get("formatted", ""), link])
    acc = {}
    for o in out:
        acc[o["genauigkeit"]] = acc.get(o["genauigkeit"], 0) + 1
    print(f"✓ messstellen_geocoded.json · Genauigkeit: {acc}")


def step_boundaries(key):
    res = geoapify("/v1/geocode/search", {"text": "Köln", "type": "city", "lang": "de", "limit": 1, "format": "json",
                                          "filter": "countrycode:de"}, key)["results"]
    if not res:
        raise SystemExit("Köln nicht gefunden (Geoapify)")
    pid = res[0]["place_id"]
    out = {"quelle": "Geoapify Boundaries API (Daten © OpenStreetMap-Mitwirkende, ODbL)", "place_id": pid}
    det = geoapify("/v2/place-details", {"id": pid, "features": "details", "lang": "de"}, key)
    out["stadt"] = (det.get("features") or [None])[0]
    for lvl, name in ((1, "bezirke"), (2, "stadtteile")):
        try:
            out[name] = geoapify("/v1/boundaries/consists-of",
                                 {"id": pid, "geometry": "geometry_1000", "sublevel": lvl, "lang": "de"}, key)
            print(f"  {name}: {len(out[name].get('features', []))} Flächen")
        except SystemExit as e:
            print(f"  ! {name} nicht geladen: {e}")
        time.sleep(0.3)
    (GEO / "koeln_grenzen.json").write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")
    print("✓ koeln_grenzen.json")


def step_osm():
    s, w, n, e = BBOX[1], BBOX[0], BBOX[3], BBOX[2]
    q = f"""[out:json][timeout:180];
(
  way["waterway"="river"]["name"="Rhein"]({s},{w},{n},{e});
  way["highway"~"^(motorway|trunk|primary)$"]({s},{w},{n},{e});
);
out geom;"""
    data = http_json(OVERPASS, data=urllib.parse.urlencode({"data": q}).encode())
    ways = [{"id": el["id"], "tags": {k: el["tags"][k] for k in ("highway", "waterway", "name", "ref") if k in el.get("tags", {})},
             "geom": [[round(p["lon"], 5), round(p["lat"], 5)] for p in el.get("geometry", [])]}
            for el in data.get("elements", []) if el.get("type") == "way"]
    with gzip.open(GEO / "osm_koeln.json.gz", "wt", encoding="utf-8") as fh:
        json.dump({"quelle": "© OpenStreetMap-Mitwirkende, ODbL · Overpass API", "bbox": BBOX, "ways": ways}, fh, ensure_ascii=False)
    print(f"✓ osm_koeln.json.gz · {len(ways)} Linien")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--nur", choices=["geocode", "grenzen", "osm"], help="nur einen Schritt ausführen")
    ap.add_argument("--testlauf", action="store_true", help="nur Adress-Bereinigung prüfen, keine Netzabfragen")
    args = ap.parse_args()
    GEO.mkdir(parents=True, exist_ok=True)
    if not DB.exists():
        raise SystemExit("data/raser_2025.sqlite fehlt → erst: python3 koeln-raser/scripts/build_db.py")
    if args.testlauf:
        sites = load_sites()
        for s in sites:
            print(s["d"], s["c"], "|", s["ort"], "|", s["lage"], "→", queries_for(s["d"], s["c"], s["ort"], s["lage"])[:1])
        return
    key = os.environ.get("GEOAPIFY_KEY", "").strip()
    if args.nur in (None, "geocode", "grenzen") and not key:
        raise SystemExit("Bitte zuerst den Key setzen:  export GEOAPIFY_KEY=...   (Windows: set GEOAPIFY_KEY=...)")
    if args.nur in (None, "geocode"):
        print("1/3 Messstellen geocodieren …"); step_geocode(key)
    if args.nur in (None, "grenzen"):
        print("2/3 Stadt-, Bezirks- und Stadtteilgrenzen …"); step_boundaries(key)
    if args.nur in (None, "osm"):
        print("3/3 Rhein + Hauptstraßen (Overpass) …"); step_osm()
    print("\nFertig. Jetzt committen und pushen:\n  git add koeln-raser/data/geo && git commit -m 'Geodaten Raser-Karte' && git push")


if __name__ == "__main__":
    sys.exit(main())
