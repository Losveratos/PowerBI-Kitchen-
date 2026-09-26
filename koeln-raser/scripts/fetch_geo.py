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
  messstellen_review.csv      Grundfassung zum Gegenprüfen; check_geo.py ergänzt den OSM-Abgleich
  koeln_grenzen.json          Stadtgrenze, Stadtbezirke, Stadtteile (Geoapify Boundaries)
  koeln_grenzen_osm.json.gz   Stadtgrenze, 9 Bezirke, 86 Stadtteile (Overpass) — diese nutzt die Karte
  osm_koeln.json.gz           Rhein + Autobahnen/Hauptstraßen (Overpass, © OSM-Mitwirkende, ODbL)
  osm_adressen_koeln.json.gz  Adresspunkte + Straßen für check_geo.py (groß, nicht versioniert)

Danach:  python3 koeln-raser/scripts/check_geo.py --korrekturen   (Abgleich + manual_coords.csv)

Der API-Key wird nirgends gespeichert. stadtteile/osm/adressen brauchen keinen Key.
"""
import argparse
import csv
import difflib
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

sys.path.insert(0, str(Path(__file__).resolve().parent))
from geo_util import norm_name   # noqa: E402

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
NUM_TOKENS = r"(?:hs\.?(?:\s*nr\.?)?|haus\s*nr\.?|hausnr\.?|hausr\.?|haus|höhe\s+haus(?:\s*nr\.?)?|höhe|in\s+höhe|geg\.?\s*nr\.?|geg\.?|gegenüber|ggü\.?b?\.?|ggüb\.?|gg\.|i\.\s*h\.|nr\.?)"


def _expand(street):
    s = re.sub(r"(?i)\bber\.\s*gl\.\s*(?=str)", "Bergisch Gladbacher ", street.strip())   # 'Ber.Gl.Str.'
    s = re.sub(r"(?i)\bgladb\.\s*(?=str)", "Gladbacher ", s)                           # 'Bergisch Gladb.Str'
    s = re.sub(r"(?i)\belisab\.\s*-?", "Elisabeth-", s)                               # 'Elisab.-Breuer-Straße'
    s = re.sub(r"(?i)\bberg\.\s*-?\s*(?=gladbacher)", "Bergisch ", s)                 # 'Berg.Gladbacher Str.'
    s = re.sub(r"(?<=[a-zäöüß])(?=Str\.?$|Straße$)", " ", s)                          # 'Konrad-AdenauerStr.' → '… Str.'
    s = re.sub(r"(?i)\bstr\.?$", "Straße", s)
    s = re.sub(r"(?i)(\w)str\.?$", r"\1straße", s)
    s = re.sub(r"(?i)\bStr\.?(?=\s)", "Straße", s)
    return re.sub(r"\s+", " ", s).strip(" ,.-")


def parse_lage(text):
    """'Brühler Str.HS.Nr.279' → ('Brühler Straße', '279'); 'Geldernstraße Laterne 30-12' → ('Geldernstraße', None)."""
    if not text:
        return None, None
    s = re.sub(r"(?i)(str)\.(?=\S)", r"\1. ", text)                 # 'Str.HS' → 'Str. HS'
    s = re.sub(r"(?i)(?<=[a-zäöüß])(?=(?:hs|lat|haus)\b)", " ", s)
    s = re.sub(r"(?i)\bL\s?\d{2,4}\s+\d+,\d+(?:\s*-\s*\d+,\d+)?", " ", s)   # Kilometrierung 'L489 0,24-0,290'
    s = re.sub(r"(?i)\b(?:L\s?\d{2,4}\s+)?km\s*\d+(?:,\d+)?", " ", s)          # 'L489 Km 1,2'
    # Laternen-Nr. sind keine Hausnummern ('Lat.44', 'Laterne Nr. 44-28', 'Lat.Nr.106-150', 'Lat73B')
    s = re.sub(r"(?i)\b(?:laterne|lat\.?|l)\s*\.?\s*(?:nr\.?\s*)?\d+[a-z]?(?:\s*[-/]\s*\d+[a-z]?)?", " ", s)
    s = re.sub(r"(?i)\s*\((?:[^)]*)\)", " ", s)
    hn = None
    m = re.search(rf"(?i){NUM_TOKENS}\s*(\d+[a-z]?)", s)
    if m:
        hn = m.group(1)
    street_part = re.split(rf"(?i),|\s{NUM_TOKENS}(?=\b|\d)|\s\d|\sv\.|\svor\b|\szw\.?|\s-\s|\skreuzung|\s/|\sBAB\b|\sS-Bahn",
                           " " + s, maxsplit=1)[0]
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
    m = re.search(rf"(?i)(?:kreuzung|höhe|in höhe|vor\s|v\.)\s*([A-ZÄÖÜ][\w\-\. äöüß]*?{STREET_END}\.?)", text or "")
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
            # Stadtteil mitgeben: viele Straßennamen gibt es in Köln mehrfach (Hauptstraße, Heinrichstraße …),
            # die strukturierte Suche kennt keinen Stadtteil und griff sonst z. B. zur „Kalker Hauptstraße 55“
            if ort and not looks_like_street(ort):
                out.append(("text_hn", {"text": f"{street} {hn}, {ort.replace('/', '-')}, Köln"}))
            out.append(("structured", {"street": street, "housenumber": hn, "city": "Köln"}))
        out.append(("text", {"text": f"{street}, {ort}, Köln" if ort else f"{street}, Köln"}))
    if re.search(r"(?i)bundesstra|\bB\s?55", ort):
        cross = cross_street(lage)
        if cross:
            out.append(("text", {"text": f"{cross}, Köln"}))
    if ort and not looks_like_street(ort):
        # kein type-Filter: Geoapify kennt „suburb“ nur als result_type, nicht als Anfrage-Typ
        out.append(("suburb", {"text": f"{ort.replace('/', '-')}, Köln"}))
    return out


# ---------------------------------------------------------------------------
# HTTP
# ---------------------------------------------------------------------------
class ApiError(SystemExit):
    def __init__(self, code, msg):
        super().__init__(msg)
        self.code = code


def http_json(url, data=None, tries=4):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, data=data, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=180) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code in (429, 502, 503, 504) and i < tries - 1:
                time.sleep(2 ** (i + 2)); continue
            body = e.read()[:300].decode("utf-8", "replace")
            raise ApiError(e.code, f"HTTP {e.code} bei {url.split('apiKey')[0]}… → {body}")
        except urllib.error.URLError as e:
            if i < tries - 1:
                time.sleep(2 ** (i + 1)); continue
            raise SystemExit(f"Netzwerkfehler: {e}")


def geoapify(path, params, key):
    params = dict(params, apiKey=key)
    return http_json(f"{GEOAPIFY}{path}?{urllib.parse.urlencode(params)}")


def in_bbox(lon, lat):
    return BBOX[0] <= lon <= BBOX[2] and BBOX[1] <= lat <= BBOX[3]


def _same_name(a, b):
    """Straßen-/Stadtteilnamen tolerant vergleichen (Schreibweisen, kleine Tippfehler wie Lüpke/Lübke)."""
    a, b = norm_name(a), norm_name(b)
    return a == b or (min(len(a), len(b)) >= 6 and difflib.SequenceMatcher(None, a, b).ratio() >= 0.9)


def plausible(kind, p, r, ort):
    """Treffer verwerfen, wenn Straße oder Stadtteil nicht zur Anfrage passen.
    Ohne diese Prüfung griff die Suche z. B. bei „Hauptstraße 55“ (Widdersdorf) zur „Kalker Hauptstraße 55“."""
    if kind == "suburb":
        return True
    want = p.get("street") if kind == "structured" else p["text"].split(",")[0]
    if kind == "text_hn":
        want = re.sub(r"\s+\d+[a-z]?$", "", want)
    if r.get("street") and "&" not in want and looks_like_street(want) and not _same_name(r["street"], want):
        return False
    # Stadtteil nur prüfen, wenn der Treffer einen nennt („district“ ist bei Geoapify der Bezirk oder bloß „Köln“);
    # Doppelnamen wie „Rath/Heumar“ heißen dort oft nur „Rath“
    sub = r.get("suburb") or ""
    if ort and not looks_like_street(ort) and sub:
        names = [ort] + [t for t in re.split(r"[/]", ort) if len(t) >= 4]
        return any(_same_name(n, sub) for n in names)
    return True


def geocode_site(q_list, key, cache, ort=None):
    for kind, p in q_list:
        ck = json.dumps([kind, p], ensure_ascii=False, sort_keys=True)
        if ck not in cache:
            params = {"lang": "de", "limit": 1, "format": "json", "filter": f"rect:{BBOX[0]},{BBOX[1]},{BBOX[2]},{BBOX[3]}",
                      "bias": f"proximity:{KOELN[0]},{KOELN[1]}"}
            if kind == "structured":
                params.update(p, country="Germany")
            else:
                params.update({k: v for k, v in p.items()})
            try:
                cache[ck] = geoapify("/v1/geocode/search", params, key).get("results", [])
            except ApiError as e:
                if e.code != 400:                                # 401/403 = Key-Problem → abbrechen
                    raise
                print(f"  ! Anfrage abgelehnt ({e.code}), gilt als ohne Treffer: {p}", flush=True)
                cache[ck] = []
            time.sleep(0.22)                                     # < 5 Anfragen/s (Free Tier)
        res = cache[ck]
        if not res:
            continue
        r = res[0]
        conf = (r.get("rank") or {}).get("confidence", 0)
        rtype = r.get("result_type")
        if not in_bbox(r["lon"], r["lat"]) or not plausible(kind, p, r, ort):
            continue
        if (kind == "text_hn" or (kind == "structured" and "housenumber" in p)) and rtype == "building" and conf >= 0.6:
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
        hit = geocode_site(queries_for(s["d"], s["c"], s["ort"], s["lage"]), key, cache, s["ort"])
        out.append({**s, **(hit or {"lat": None, "lon": None, "genauigkeit": "fehlt"})})
        miss += hit is None
        if i % 25 == 0 or i == len(sites):
            CACHE.write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")
            print(f"  {i}/{len(sites)} Messstellen · ohne Treffer: {miss}", flush=True)
    (GEO / "messstellen_geocoded.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    with open(GEO / "messstellen_review.csv", "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh, lineterminator="\n")
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


def overpass(q):
    return http_json(OVERPASS, data=urllib.parse.urlencode({"data": q}).encode())


AREA_KOELN = 'area["boundary"="administrative"]["admin_level"="6"]["name"="Köln"]->.k;'


def assemble_rings(ways):
    """Member-Ways einer Relation zu geschlossenen Ringen verbinden (gemeinsame Endknoten)."""
    segs = [[tuple(p) for p in w] for w in ways if len(w) >= 2]
    rings, offen = [], 0
    while segs:
        ring = segs.pop()
        while ring[0] != ring[-1]:
            for i, s in enumerate(segs):
                if s[0] == ring[-1]:
                    ring = ring + s[1:]
                elif s[-1] == ring[-1]:
                    ring = ring + s[::-1][1:]
                elif s[-1] == ring[0]:
                    ring = s[:-1] + ring
                elif s[0] == ring[0]:
                    ring = s[::-1][:-1] + ring
                else:
                    continue
                segs.pop(i)
                break
            else:
                break
        if ring[0] == ring[-1] and len(ring) >= 4:
            rings.append([list(p) for p in ring])
        else:
            offen += 1
    return rings, offen


def step_grenzen_osm():
    """Stadtgrenze (admin_level 6), Stadtbezirke (9) und die 86 Stadtteile (10) aus OSM.
    Geoapify /v1/boundaries/consists-of liefert die Stadtteil-Ebene nicht verlässlich (siehe AGENT-BRIEF)."""
    q = f"""[out:json][timeout:180];
{AREA_KOELN}
(
  relation["boundary"="administrative"]["admin_level"="6"]["name"="Köln"];
  relation["boundary"="administrative"]["admin_level"~"^(9|10)$"](area.k);
);
out geom;"""
    data = overpass(q)
    out = {"quelle": "© OpenStreetMap-Mitwirkende, ODbL · Overpass API", "stadt": None, "bezirke": [], "stadtteile": []}
    for rel in data.get("elements", []):
        if rel.get("type") != "relation":
            continue
        tags = rel.get("tags", {})
        rw = {"outer": [], "inner": []}
        for m in rel.get("members", []):
            if m.get("type") == "way" and m.get("geometry") and m.get("role") in ("outer", "inner", ""):
                rw["inner" if m["role"] == "inner" else "outer"].append(
                    [[round(p["lon"], 6), round(p["lat"], 6)] for p in m["geometry"]])
        outer, o1 = assemble_rings(rw["outer"])
        inner, o2 = assemble_rings(rw["inner"])
        feat = {"id": rel["id"], "name": tags.get("name"), "admin_level": tags.get("admin_level"),
                "ref": tags.get("de:amtlicher_gemeindeschluessel") or tags.get("ref"),
                "outer": outer, "inner": inner, "offene_ringe": o1 + o2}
        lvl = tags.get("admin_level")
        if lvl == "6":
            out["stadt"] = feat
        elif lvl == "9":
            out["bezirke"].append(feat)
        elif lvl == "10":
            out["stadtteile"].append(feat)
    for k in ("bezirke", "stadtteile"):
        out[k].sort(key=lambda f: f["name"] or "")
    with gzip.open(GEO / "koeln_grenzen_osm.json.gz", "wt", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, separators=(",", ":"))
    offen = sum(f["offene_ringe"] for f in out["bezirke"] + out["stadtteile"])
    print(f"✓ koeln_grenzen_osm.json.gz · Stadt: {'ja' if out['stadt'] else 'FEHLT'} · "
          f"{len(out['bezirke'])} Bezirke · {len(out['stadtteile'])} Stadtteile · offene Ringe: {offen}")


def step_adressen():
    """Unabhängiger Abgleich: alle Adresspunkte und benannten Straßen Kölns aus OSM.
    Nur für check_geo.py (Plausibilisierung der Geocodierung), wird nicht committet (groß)."""
    # in 4×4 Kacheln, sonst lehnt der öffentliche Overpass-Server ab (504)
    n_tiles = 4
    dx, dy = (BBOX[2] - BBOX[0]) / n_tiles, (BBOX[3] - BBOX[1]) / n_tiles
    adr, streets, seen_a, seen_s = [], [], set(), set()
    for i in range(n_tiles):
        for j in range(n_tiles):
            w, s = BBOX[0] + i * dx, BBOX[1] + j * dy
            bb = f"{s:.4f},{w:.4f},{s + dy:.4f},{w + dx:.4f}"
            data = overpass(f"""[out:json][timeout:180];
{AREA_KOELN}
(
  nwr["addr:housenumber"]["addr:street"](area.k)({bb});
  way["highway"]["name"](area.k)({bb});
);
out tags center qt;
way._["highway"]["name"];
out geom qt;""")
            for el in data.get("elements", []):
                t, uid = el.get("tags", {}), (el["type"], el["id"])
                if "addr:housenumber" in t and "addr:street" in t and uid not in seen_a:
                    c = el.get("center") or ({"lat": el["lat"], "lon": el["lon"]} if "lat" in el else None)
                    if c:
                        seen_a.add(uid)
                        adr.append([t["addr:street"], t["addr:housenumber"], round(c["lon"], 6), round(c["lat"], 6)])
                if el.get("geometry") and "highway" in t and uid not in seen_s:
                    seen_s.add(uid)
                    streets.append([t["name"], t["highway"], [[round(p["lon"], 6), round(p["lat"], 6)] for p in el["geometry"]]])
            print(f"  Kachel {i * n_tiles + j + 1}/{n_tiles ** 2}: {len(adr):,} Adressen, {len(streets):,} Straßenabschnitte", flush=True)
            time.sleep(1)
    with gzip.open(GEO / "osm_adressen_koeln.json.gz", "wt", encoding="utf-8") as fh:
        json.dump({"quelle": "© OpenStreetMap-Mitwirkende, ODbL · Overpass API", "adressen": adr, "strassen": streets},
                  fh, ensure_ascii=False, separators=(",", ":"))
    print(f"✓ osm_adressen_koeln.json.gz · {len(adr):,} Adresspunkte · {len(streets):,} Straßenabschnitte")


def step_osm():
    s, w, n, e = BBOX[1], BBOX[0], BBOX[3], BBOX[2]
    q = f"""[out:json][timeout:180];
(
  way["waterway"="river"]["name"="Rhein"]({s},{w},{n},{e});
  way["highway"~"^(motorway|trunk|primary)$"]({s},{w},{n},{e});
);
out geom;"""
    data = overpass(q)
    ways = [{"id": el["id"], "tags": {k: el["tags"][k] for k in ("highway", "waterway", "name", "ref") if k in el.get("tags", {})},
             "geom": [[round(p["lon"], 5), round(p["lat"], 5)] for p in el.get("geometry", [])]}
            for el in data.get("elements", []) if el.get("type") == "way"]
    with gzip.open(GEO / "osm_koeln.json.gz", "wt", encoding="utf-8") as fh:
        json.dump({"quelle": "© OpenStreetMap-Mitwirkende, ODbL · Overpass API", "bbox": BBOX, "ways": ways}, fh, ensure_ascii=False)
    print(f"✓ osm_koeln.json.gz · {len(ways)} Linien")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--nur", choices=["geocode", "grenzen", "stadtteile", "osm", "adressen"],
                    help="nur einen Schritt ausführen (stadtteile/osm/adressen brauchen keinen Key)")
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
        print("1/5 Messstellen geocodieren …"); step_geocode(key)
    if args.nur in (None, "grenzen"):
        print("2/5 Stadt-, Bezirks- und Stadtteilgrenzen (Geoapify) …"); step_boundaries(key)
    if args.nur in (None, "stadtteile"):
        print("3/5 Stadtgrenze, Bezirke, 86 Stadtteile (Overpass) …"); step_grenzen_osm()
    if args.nur in (None, "osm"):
        print("4/5 Rhein + Hauptstraßen (Overpass) …"); step_osm()
    if args.nur in (None, "adressen"):
        print("5/5 Adresspunkte + Straßennamen für den Abgleich (Overpass) …"); step_adressen()
    print("\nFertig. Jetzt committen und pushen:\n  git add koeln-raser/data/geo && git commit -m 'Geodaten Raser-Karte' && git push")


if __name__ == "__main__":
    sys.exit(main())
